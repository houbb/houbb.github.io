---
layout: post
title: 权限体系之-113-ABAC 模型如何使用呢？
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# 如果实现 ABAC 的表管理，有了这些数据具体如何使用？最好可以提供 sdk 给别的系统

下面我给出一份**“ABAC 表管理 → 如何在真实业务中使用 → 如何提供 SDK 给各系统集成”的完整落地方案”**。
本方案可直接放入你的 permission-platform 文档体系中，也可以作为接口说明与对外开发者文档。

---

# 0. 你已经有了什么？

你已实现：

* `abac_policy`
* `abac_policy_version`
* `abac_policy_binding`（或类似）
* 策略管理 CRUD、版本化、发布与禁用
* 属性（Attribute）管理页、Policy Editor

这些属于 **ABAC 的治理层 / 配置层**。

---

# 1. 那么：ABAC 的数据到底如何被业务系统“用起来”？

核心就是三件事：

1. **把 ABAC 表的数据 → 编译成可执行策略（Policy）**
2. **在业务请求时 → 收集属性（PIP） → 调用 PDP 进行决策**
3. **通过 SDK → 让业务系统简单调用，不需要了解 ABAC 的内部结构**

即：
配置层（你已经做完）
→ 运行时引擎（PDP）
→ 业务接入（PEP + SDK）

接下来我会提供 PDP 的最终设计 + SDK 接入方式。

---

# 2. **ABAC 数据如何被引擎使用？（核心运行时逻辑）**

## 2.1 策略加载（Policy Loader）

PDP 启动或收到策略发布通知时：

1. 查询 `abac_policy(status=active)`
2. 查询对应版本 `abac_policy_version`
3. 对每条策略进行：

   * parse（CEL / DSL）
   * compile 成 AST / byte-code / executable object
4. 放入内存：`policyCache[policy_code] = compiledPolicy`

策略变成可执行对象后：

```
policyCache = {
  "dept_export": CompiledPolicy(...),
  "only_owner_update": CompiledPolicy(...),
  ...
}
```

**这一层是 ABAC 的关键，没有它策略永远只是数据库里的文本。**

---

## 2.2 属性加载（Attribute Provider，PIP）

PDP 收到业务方的请求时，通过 Attribute Providers 补齐属性。

例如：

```
AbacRequest req:
- user: {id: 1001}
- resource: {resource_type: "order", resource_id: "123"}
- action: "export"
- env: { ip, time, ua }
```

PDP 执行：

```
userAttributes = UserAttributeProvider.fetch(1001)
resourceAttributes = ResourceAttributeProvider.fetch("order", "123")
envAttributes = EnvProvider.fromRequest(context)
```

得到：

```
user = { id:1001, dept_id:10, job_level:4, tags:["finance"] }
resource = { id:"123", owner_id:2002, dept_id:10, sensitivity:"low" }
env = { ip:"10.1.1.1", time:"2025-12-11T10:00", risk_score:20 }
```

这就是 ABAC 工作的**输入上下文（Context）**。

---

## 2.3 策略评估（Evaluator）

伪代码：

```java
Decision finalDecision = DENY;

for (policy in policyCache.sortedByPriority()) {
    boolean matched = policy.evaluate(context); // evaluate CEL AST
    
    if (matched) {
        if (policy.effect == ALLOW) finalDecision = ALLOW;
        if (policy.effect == DENY) return DENY; // deny override
    }
}

return finalDecision;
```

如果策略带 obligation，保存：

```
decision.obligations = {
  "sql_filter": "dept_id = 10",
  "mask_fields": ["amount"]
}
```

---

## 2.4 返回给业务方（PEP）

例如：

```
{
  "decision": "allow",
  "obligations": {
     "sql_filter": "order.dept_id = 10"
  }
}
```

业务侧 PEP 做两件事：

* allow 则继续
* 若有 `sql_filter` → 注入到查询层（MyBatis Interceptor）

---

# 3. **SDK 如何提供给业务系统使用？**

你需要实现一个 **permission-platform-sdk-abac**（Java 为例），其中包含：

* 一个 AbacClient（调用 PDP）
* PEP 注解（用于 Controller）
* 属性扩展点（业务可提供额外属性）
* 本地缓存（减少 RPC）
* 统一异常

下面提供完整设计。

---

# 4. SDK 设计（可直接实现）

## 4.1 Maven artifact

```
<dependency>
  <groupId>com.permission</groupId>
  <artifactId>permission-sdk-abac</artifactId>
  <version>1.0.0</version>
</dependency>
```

## 4.2 SDK 核心类

### AbacClient

```java
public interface AbacClient {
    Decision evaluate(AbacRequest request);
    List<Decision> batchEvaluate(List<AbacRequest> requestList);
}
```

### DefaultAbacClient（内置实现）

* HTTP 调用 PDP
* 带本地 LRU 缓存
* 序列化减少开销

### AbacRequest

```java
@Data
@Builder
public class AbacRequest {
    Map<String, Object> user;
    Map<String, Object> resource;
    String action;
    Map<String, Object> env;
}
```

### Decision

```java
@Data
public class Decision {
    boolean allowed;
    String reason;
    Map<String, Object> obligations;
}
```

---

# 5. **SDK 的 PEP 注解**

让业务不需要自己写判断逻辑。

### 5.1 Controller 注解

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface AbacCheck {
   String action();           // export, read, approve...
   String resourceType();     // order, ticket...
   String resourceIdParam();  // 从 request 中获取资源 id
}
```

### 5.2 AOP 拦截器

伪代码：

```java
before(controllerMethod):
    user = getCurrentUserFromSSO();
    resourceId = resolveParameter(resourceIdParam);
    env = buildEnvFromRequest();

    AbacRequest req = buildRequest(user, resource, action, env);
    Decision d = abacClient.evaluate(req);

    if (!d.isAllowed()) throw new AccessDeniedException(d.getReason());

    RequestContext.setObligations(d.getObligations());
```

### 5.3 SQL filter 注入（可选）

MyBatis Interceptor：

```java
String sqlFilter = RequestContext.getObligation("sql_filter");
if (sqlFilter != null) {
    originalSql = originalSql + " AND " + sqlFilter;
}
```

---

# 6. **实际业务如何使用？（全流程示例）**

用户请求进入业务系统：

```
GET /order/export?id=123
```

业务系统流程：

1. PEP AOP 拦截
2. 构造 ABAC 请求
3. SDK 调 PDP（HTTP/GRPC）
4. PDP 取策略 → 获取属性 → evaluate
5. 返回 allow + sql_filter
6. SDK 注入 SQL 过滤
7. 业务系统执行真实代码
8. 返回结果给用户

---

# 7. 业务系统比原来得到的能力

| 能力             | RBAC   | RBAC+ | ABAC                       |
| -------------- | ------ | ----- | -------------------------- |
| 菜单/API 权限      | 支持     | 支持    | 支持                         |
| 行级权限           | 需要数据范围 | 精准    | 超精准（任意条件）                  |
| 字段隐藏/脱敏        | 不支持    | 弱     | 强（obligation: mask_fields） |
| 动态限制（时间/IP/风险） | 不支持    | 不支持   | 强                          |
| 多条件组合          | 弱      | 中     | 强（任意逻辑表达式）                 |
| 统一决策引擎         | 无      | 有部分   | 完整                         |

---

# 8. 外部系统接入流程（你可以写到官方文档里）

1. 引入 SDK
2. 在配置文件中配置 PDP 地址

```
permission.abac.pdp.url = http://iam-pdp:8080
```

3. 在 Spring Boot 加入 Starter

```
@EnablePermissionAbac
```

4. 在 Controller 上使用注解

```java
@AbacCheck(action="export", resourceType="order", resourceIdParam="id")
public void exportOrder(Long id) {
    // ...
}
```

5. 在 Mapper 里开启 SQL filter 支持（SDK 自动注入）
6. 完成接入

接入成本 < 100 行代码。

---

# 9. 如何落地给外部系统？（官方说明模板）

您只需要：

1. 引入 SDK
2. 配置 PDP 地址
3. 在入口加入注解
4. 业务侧无需关心 ABAC 策略结构
5. 所有权限判断由 IAM 平台统一集中决策
6. 数据行级、字段级、环境级权限自动生效
7. 配置 ABAC 策略无需改业务代码，做到“权限变化业务无感知”

---

# 10. 你还能提供一个 Web 控制台 API（给前端）

前端可通过：

```
POST /abac/evaluate
```

批量判断按钮是否显示，例如：

```
["export", "delete", "approve"]
```

→ 返回哪些 action 可见。
这样前端无需写死权限逻辑，持续使用 ABAC。

---

# 11. 总结：你现在的 ABAC 表管理如何真正变成可用权限系统？

1. **表管理 → 策略快照**（治理层）
2. **策略快照 → PDP 引擎**（决策层）
3. **PDP → SDK → 业务系统**（使用层）
4. **注解 + interceptor + filter**（透明接入）
5. **扩展 obligation** → 数据级/字段级/按钮级动态控制
6. 所有变更 → 不需要业务改代码，全部在 IAM 平台完成。

这就是完整的 ABAC 落地与 SDK 使用方案。

* any list
{:toc}