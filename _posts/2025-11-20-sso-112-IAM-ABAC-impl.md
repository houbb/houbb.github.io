---
layout: post
title: 权限体系之-111-访问控制模型对比：RBAC、RBAC+、ABAC
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# 类似的，在已有 RBAC+ 的基础上，如何进一步实现 ABAC。给出对应的详细设计+交互文档

下面给你一份**在已有 RBAC+ 基础上向 ABAC 平滑演进的完整、可落地设计与交互文档**。目标是：

* 在不破坏现有 RBAC+ 数据与业务的前提下，引入 ABAC（属性 + 策略）能力，作为 RBAC+ 的补充/兜底；
* 提供策略管理（可视化编辑/测试/发布）、策略评估引擎（PDP）、属性供应（PIP）、以及前后端与 SDK 的落地方案；
* 明确授权流程、API、缓存、一致性、审计、安全与测试方案，便于你直接交付开发与产品实现。

文档结构（可直接跳转）：

1. 概要与设计原则
2. 总体架构（PDP/PIP/PEP）与部署模式
3. 属性模型（Attribute Catalog）与属性提供者（PIP）
4. 策略语言与存储（Policy Model） — 推荐与示例
5. 策略生命周期：编辑 → 测试 → 审批 → 发布 → 回滚
6. 授权评估流程（调用链与接口）
7. 与现有 RBAC+ 的协同（融合策略、优先级、降级）
8. DB 扩展建议（表设计 + 示例 DDL）
9. REST API 设计（管理 / 运行时）
10. 前端（策略编辑器/测试/审计）UI 交互设计
11. SDK（Java）扩展设计与示例用法
12. 缓存、性能、安全、审计、监控设计
13. 迁移策略与上线分阶段计划
14. 示例策略（典型业务场景）
15. 测试用例与验收标准
16. 风险与防护建议

---

# 1. 概要与设计原则

**目标**：把 ABAC 当作对 RBAC+ 的补充 —— 使用属性（User / Resource / Action / Environment） + 策略（Policy）动态决策访问。
**原则**：

* **低侵入**：不拆现有 RBAC+ 表结构或业务调用；新增服务/接口与 SDK 扩展；逐步开启策略生效（灰度）；
* **渐进式**：先支持常见场景（数据行级、字段级、时间/IP 限制），再扩展为全策略引擎；
* **可审计**：所有策略变更、决策结果、命中原因必须可溯源；
* **高性能**：缓存属性或策略快照；热更新策略触发增量失效；
* **治理可控**：策略编辑需审批、支持版本化与回滚。

---

# 2. 总体架构（PDP / PIP / PEP）

采用经典 ABAC 架构：

* **PIP (Policy Information Point)**：属性提供者，负责收集属性（user, resource, env, action）。可以是多个 provider（UserService / ResourceService / ContextProvider / External Risk Service）。
* **PDP (Policy Decision Point)**：策略决策引擎，接收属性与策略，返回 Allow/Deny + obligation/advices（例如需要返回 SQL filter、masked fields）。
* **PEP (Policy Enforcement Point)**：在业务侧做调用与执行（网关、Controller/API、DB layer、前端权限控制点）。PEP 调用 PDP 获取决策并执行（允许/拒绝/修改响应）。

部署模式：

* **集中式 PDP 服务**（推荐）：单独服务部署，业务通过 SDK 或 REST 调用 `POST /abac/evaluate`。PDP 内置策略缓存与引擎（CEL / OPA / custom）。
* **内嵌轻量 PDP（可选）**：对高并发、低延迟敏感的场景，提供 SDK 内嵌决策模块并同步策略快照（策略发布通过 MQ/文件同步）。混合模式可选。

图（文字）：

```
[Business System (PEP)] -> [Permission SDK] -> (if RBAC pass?) -> call PDP / local cache
                                        ↘ attribute enrichment (PIP)
[PDP Service (policy store + engine)] <-> [Policy DB / Policy Version Store]
```

---

# 3. 属性模型（Attribute Catalog）与属性提供者（PIP）

## 3.1 属性分类（四类）

* **User attributes**：`id`, `username`, `dept_id`, `dept_path`, `roles[]`, `tags[]`, `job_level`, `tenant_id`, `is_admin`
* **Resource attributes**：`resource_id`, `resource_type`, `owner_id`, `owner_dept_id`, `sensitivity`, `tags[]`, `tenant_id`
* **Action attributes**：`action`（view/create/edit/delete/export/approve），`api_method`
* **Environment attributes**：`ip`, `time`, `geo`, `device`, `risk_score`

## 3.2 属性命名与约束

* 命名采用点式：`user.dept_id`, `resource.owner_id`, `env.ip`
* 类型：string, number, boolean, array, datetime, object
* 属性来源（PIP）应在 Attribute Catalog 中注册（owner、TTL、sensitivity）

## 3.3 PIP 实现方式

* **UserAttributeProvider**：从 UMS/SSO 拉取（或缓存的 user service）
* **ResourceAttributeProvider**：从业务系统或资源中心获取（可由业务在调用 PDP 时传入资源属性以减少远程调用）
* **ContextAttributeProvider**：从 HTTP request (IP/UA/time)
* **ExternalAttributeProvider（可选）**：风险评分、第三方决策（如 Fraud Service）

**策略执行时的属性收集顺序**：

1. PEP 尽可能在调用时预先准备：user attributes + action + resource id / minimal resource attrs
2. PDP 在内部调用 PIP 补充必要属性（可异步或同步）
3. PDP 以全部属性作为 policy 条件上下文执行

---

# 4. 策略语言与存储（Policy Model）

## 4.1 推荐策略语言

* **CEL（Common Expression Language）**：轻量、安全、快速，便于嵌入 Java（有实现），支持复杂表达式。推荐用于动态条件。
* 也可兼容 **OPA/Rego** 或 **SQL-like**，但 CEL 兼具可读性与性能。

## 4.2 策略数据模型（DB）

新增表 `abac_policy` 与 `abac_policy_version`，简要 DDL：

```sql
CREATE TABLE abac_policy (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  policy_code VARCHAR(128) UNIQUE,
  name VARCHAR(256),
  description TEXT,
  effect VARCHAR(16) NOT NULL, -- allow | deny
  status TINYINT NOT NULL DEFAULT 0, -- 0 draft, 1 active, 2 disabled
  priority INT DEFAULT 100,
  created_by BIGINT, created_at DATETIME(3),
  updated_by BIGINT, updated_at DATETIME(3)
);

CREATE TABLE abac_policy_version (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  policy_id BIGINT NOT NULL,
  version INT NOT NULL,
  expression TEXT NOT NULL, -- CEL expression or JSON
  bindings JSON DEFAULT NULL, -- variables mapping doc
  created_by BIGINT, created_at DATETIME(3),
  UNIQUE KEY (policy_id, version)
);
```

`expression` 示例（CEL）：

```
# allow if user and resource dept match and user level >=3 and not high risk
user.dept_id == resource.dept_id &&
user.job_level >= 3 &&
env.risk_score <= 50 &&
action == "read"
```

策略还可返回 obligations（如返回 SQL filter 替代 Allow/Deny）：

```
effect: allow
expression: user.dept_id == resource.dept_id && action == "read"
obligation: { "filter": "resource.dept_id = {{user.dept_id}}"}
```

## 4.3 策略分组与优先级

* 支持 policy group（按业务/产品线）
* 优先级数值：小值优先或大值优先（需统一）
* 冲突解决策略：deny-overrides（deny 优先）或 allow-overrides （可配置）。建议初期采用 **deny-overrides**（更安全）。

---

# 5. 策略生命周期（编辑 → 测试 → 审批 → 发布 → 回滚）

## 5.1 编辑（Policy Editor）

* 支持可视化编辑（条件构建器） + 文本编辑（CEL）
* 自动完成属性名提示（Attribute Catalog）

## 5.2 测试（Policy Sandbox）

* 在编辑器内提供“模拟请求”功能：用户输入 `user` / `resource` / `action` / `env` JSON，点击 Test，PDP 本地执行，返回 decision + trace（命中哪些子表达式，命中哪个策略）

## 5.3 审批（Workflow）

* 策略设置为 Draft，创建者或开发提交审批（可选多级审批），审批通过后变为 Active（version++）。

## 5.4 发布与回滚

* 发布时将策略快照写入 `abac_policy_version`，并通过 MQ 通知 PDP（或将快照写到 PDP 的策略缓存）；支持回滚到历史 version。

---

# 6. 授权评估流程（调用链与接口）

## 6.1 运行时评估接口（PDP）

`POST /api/v1/abac/evaluate`
请求体（JSON）：

```json
{
  "request_id": "uuid",
  "user": { "id": 1001, "dept_id": 10, "job_level": 4, "tags": ["pm"] },
  "resource": { "id": "order:123", "resource_type": "order", "owner_id": 1002, "dept_id": 10, "sensitivity": "low" },
  "action": "export",
  "env": { "ip": "10.1.1.1", "time": "2025-12-11T10:30:00+08:00", "device": "web", "risk_score": 20 },
  "context": { "extra": { "tenant_id": "t1" } }
}
```

返回体：

```json
{
  "request_id": "uuid",
  "decision": "allow",  // allow | deny | not_applicable
  "reason": "policy_code=only-dept-export; matched=true; priority=50",
  "obligations": {
    "sql_filter": "order.dept_id = 10",
    "mask_fields": ["order.amount"]
  },
  "policy_trace": [ { "policy_code":"p1", "matched":true, "expr_evaluated":"user.dept_id==resource.dept_id" } ]
}
```

## 6.2 PEP 行为

* **API PEP (Controller/Filter)**：在入口处，收集 minimal attributes（userId, action, resourceId optional)，调用 PDP；若 `allow`，继续；若 `deny`，返回 403；若 obligations include `sql_filter`，inject into DB layer or pass to Service.
* **DB/Mapper PEP**：若 PDP 返回 SQL filter（obligation），在 MyBatis Interceptor 中拼接该 filter。
* **Front-end PEP**：在页面渲染时，先调用 `GET /iam/runtime/user/{userId}/actions` 或 `POST /abac/evaluate`（批量）来决定按钮/字段可见性；也可以用基于 RBAC+ 缓存的快速判断再兜底调用 PDP。

---

# 7. 与现有 RBAC+ 的协同（混合策略）

设计目标：**RBAC+ 保持基础且高效，ABAC 用作细粒度和动态策略**。建议采用组合决策流：

1. **Fast-path RBAC+**：先做 RBAC/role_action 检查（local cache, ms-level）。如果 RBAC 判定为 `allow` 且无 data_scope 或 data_scope suffices => 直接允许（提高性能）。
2. **ABAC 作为补充/约束**：

   * 如果 RBAC 返回 `deny` → 直接 deny（可选触发 ABAC 再校验例外策略，视业务而定）
   * 如果 RBAC 返回 `allow` 且存在 data_scope 或企业要求动态判断 → 调用 PDP 做最终确认或返回 obligation（SQL filter）
3. **Policy precedence**：

   * 推荐采用「RBAC 先行、ABAC 约束」的模式：RBAC 决定基础能力，ABAC 决定细化（行级、字段级、环境约束）。这让旧系统可继续使用 RBAC，而 ABAC 逐步接入。
4. **示例流程**：

   * 请求 `user` 调 `action` on `resource`
   * Step A: check RBAC (role_action); 如果 deny -> deny; 如果 allow:
   * Step B: check RBAC+ data_scope -> if covers all -> allow
   * Step C: else call PDP -> evaluate ABAC policy and obligations -> return final

---

# 8. DB 扩展建议（表设计 + 示例 DDL）

在第4节已给出 `abac_policy` / `abac_policy_version`，补充 `abac_policy_binding`（可选：将策略绑定到 resource types / roles / groups）：

```sql
CREATE TABLE abac_policy_binding (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  policy_id BIGINT NOT NULL,
  bind_type VARCHAR(32) NOT NULL, -- ROLE | RESOURCE_TYPE | TENANT | GLOBAL
  bind_target VARCHAR(128) NOT NULL,
  created_by BIGINT, created_at DATETIME(3)
);
```

理由：可加速策略选择（只 eval 对应 resource_type 的 policy）。

---

# 9. REST API 设计（管理 / 运行时）

## 管理 API（受权限保护）

* `POST /api/v1/abac/policies` — 创建（draft）
* `PUT /api/v1/abac/policies/{id}` — 编辑
* `GET /api/v1/abac/policies` — 列表（filter by status, resource_type, creator）
* `POST /api/v1/abac/policies/{id}/test` — 用模拟请求测试（返回 decision+trace）
* `POST /api/v1/abac/policies/{id}/publish` — 审批后发布（version++），并通知 PDP
* `POST /api/v1/abac/policies/{id}/rollback` — 回滚到某个版本
* `GET /api/v1/abac/policies/{id}/versions` — 查看历史版本

## 运行时 API（PDP）

* `POST /api/v1/abac/evaluate` — 返回 decision/obligations/trace
* `POST /api/v1/abac/batch-evaluate` — 批量评估（用于前端批量按钮）
* `GET /api/v1/abac/attributes/catalog` — 返回支持的 attributes 与 types（便于编辑器自动补全）

安全：管理 API 受 IAM 自身权限（permission:abac:manage）；运行时 API 为高 QPS 服务，建议只允许内网或带 signed token 的信任客户端访问。

---

# 10. 前端（策略编辑器/测试/审计）UI 交互设计

## 10.1 策略编辑器（核心页面）

布局：

* 左侧：策略目录（按 product / group）
* 中间：策略编辑区（可视化 Builder + 文本视图切换）
* 右侧：属性面板（Attribute Catalog） + 测试面板

交互：

* 可视化构建：拖拽属性 -> 选择运算符 -> 填写值（support in/contains/startsWith/regex）
* 文本模式：直接编辑 CEL
* 立即测试：填写 sample JSON（user/resource/env/action），点击 Test -> 显示 decision + expression trace + evaluated result
* 保存为 Draft，提交审批（审批人由策略 meta 决定）

## 10.2 策略发布页面

* 发布前显示影响预估（如果可以计算）：会影响到哪些 resource types / approx user count（可通过统计 role->user counts or last-known cache）
* 发布后 show version & timestamp & operator

## 10.3 审计页面

* 策略变更历史（who/when/from->to), 决策日志查询（按 request_id 或 user/resource/time）

UX 要点：

* 策略默认不执行危险表达式（如执行外部函数）
* 对 CUSTOM SQL obligations 做强提醒与审批
* 编辑器应提示属性类型与示例值

---

# 11. SDK（Java）扩展设计与示例

在已有 permission-plateform-sdk 基础上（已经有 PermissionClient / @RequiresAction / @DataScope），增加：

## 11.1 新增组件

* `AbacClient`：对接 PDP（HTTP/GRPC），并本地缓存常用 decision（短 TTL）
* `@RequirePolicy`（注解）：可在 Controller 方法上直接指定 policy_code（或 leave blank 由 PDP 自动找策略）
* `AttributeProvider` interface：允许业务方注册自定义属性 provider（例如 resource attributes）

## 11.2 Java SDK API（示例）

```java
public class AbacClient {
  Decision evaluate(AbacRequest req);
  List<Decision> batchEvaluate(List<AbacRequest> reqs);
  // local cache utilities
}

public @interface RequirePolicy {
  String value() default ""; // policy_code
  boolean fallbackToRbac() default true;
}
```

### 使用示例（Controller）

```java
@RequirePolicy("policy_only_dept_export")
@GetMapping("/order/export")
public ResponseEntity<?> exportOrder(@RequestParam Long id) {
   // if @RequirePolicy passes, continue
}
```

或者在业务代码中显式调用：

```java
AbacRequest req = AbacRequest.builder()
  .user(userAttributes)
  .resource(resourceAttrs)
  .action("export")
  .env(envAttrs)
  .build();

Decision d = abacClient.evaluate(req);
if (!d.isAllowed()) throw new AccessDeniedException(d.getReason());
String sqlFilter = d.getObligations().get("sql_filter");
```

---

# 12. 缓存、性能、安全、审计、监控设计

## 12.1 缓存

* **策略缓存**：PDP 内部缓存 active policies（policy_id -> compiled AST），策略发布触发 invalidation或热 swap；
* **attribute cache**：短 TTL（几秒到几十秒）缓存 user/resource attributes；对高度动态属性（risk_score）用 very short TTL；
* **decision cache（可选）**：对同一 (user,resource,action,env signature) 的 decision 可缓存短时（适当 TTL）以减少频繁评估。

## 12.2 性能

* 编译策略（表达式）为 AST/bytecode 后缓存，避免重复解析；
* 批量评估 API 支持多请求一起评估，减少网络开销（前端可批量请求按钮可见性）；
* 对高 QPS 场景，建议采用本地策略快照 + SDK 内嵌评估（离线同步策略）来避免 RPC latency。

## 12.3 安全

* PDP 管理 API 仅限内网或 mTLS / JWT with scopes；
* 策略文本与 obligation 禁止任意执行外部程序（no Exec）；
* `scope_rule` or obligation 中包含 SQL 片段时需审批与白名单检查；
* 审计日志不可删除（WORM 或 append-only 交付）

## 12.4 审计

* 每次 evaluate 都记录 `abac_decision_log`：

  * fields: id, request_id, user_id, resource_key, action, decision, policy_ids_matched, trace, timestamp, source_ip
* 策略变更也写入审计（policy version）

## 12.5 监控与告警

* 重要指标：PDP QPS, latency(p50/p95/p99), decision_cache_hit_rate, active_policy_count, eval_error_rate
* 告警：eval_error_rate > threshold, latency p99 > threshold, sudden spike in deny rate

---

# 13. 迁移策略与上线分阶段计划

**目标：确保无缝、可回退地从 RBAC+ 演进到 ABAC。**

阶段 A — 准备（1周）

* 部署 PDP 服务（非强制生效 mode）
* 策略表与版本化 DB 建表
* 编辑器上线（只读 demo policies）

阶段 B — 只读/测试（2周）

* 上线 Admin 策略编辑器，允许编辑/测试（draft），不生效
* 提供 `abac/policies/test` 并允许业务方演练

阶段 C — 灰度生效（2周）

* 允许将某个策略标记 `active` 并针对 `test tenant` 或 subset API 测试（PEP 调用 PDP，但默认以 RBAC 结果优先）
* 监控决策差异日志并修正策略

阶段 D — 部分替换（2周）

* 对一些 API 将决策流改为：RBAC -> PDP 校验 -> final。逐步扩大 scope

阶段 E — 全量生效

* 所有 PEP 默认走 PDP（RBAC 仍可做快速 pass optimization）

回滚：

* 将策略设为 `disabled` 或回滚到历史版本，PDP 接收到通知后生效

---

# 14. 示例策略（典型业务场景）

## 示例 1 — 本部门导出（简单 ABAC）

Policy (`policy_code`: dept_export):

```
effect: allow
expression: action == "export" && user.dept_id == resource.dept_id && env.time.hour >= 9 && env.time.hour < 18
```

Obligation:

```
{ "sql_filter": "resource.dept_id = {{user.dept_id}}", "mask_fields": [] }
```

## 示例 2 — 负责人才能审批（instance-level）

```
effect: allow
expression: action == "approve" && resource.owner_id == user.id && resource.status == "pending"
```

## 示例 3 — 高风险阻断导出

```
effect: deny
expression: action == "export" && env.risk_score > 70
```

（deny 覆盖其它 allow）

---

# 15. 测试用例与验收标准

### 基本测试用例

* 单条策略测试：单 user/resource/action 组合决策正确
* 多策略冲突：deny-overrides 验证
* obligation 生效测试：SQL filter 正确注入
* 性能：PDP p99 latency < 50ms（configurable）
* 缓存：策略更新后 1s 内生效（或按 SLA 承诺）

### 验收标准（示例）

* 新策略在 staging 测试通过后，发布到 production 灰度组无 5xx error；
* 50% 抽样请求决策 trace 无错误；
* 审计日志记录完整可查询

---

# 16. 风险与防护建议

* **策略复杂度失控**：制定策略质量规范（可自动 lint 策略表达式），限制策略行数与复杂度。
* **性能瓶颈**：使用策略编译缓存 + 本地快照 + 批量评估 API。
* **安全风险（SQL注入/exec）**：策略与 obligation 不允许执行任意代码；SQL obligation 使用模板并经过白名单检查。
* **治理风险**：策略审批强制流程、策略 owner 与审核日志。

* any list
{:toc}