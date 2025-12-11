---
layout: post
title: 权限体系之-106-RABC+ 要如何使用？
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# 目前只是实现了 RBAC+ 的表管理（用户、角色、策略、scope），有了这些数据具体如何使用？最好可以提供 sdk 给别的系统

下面提供一份**企业级可落地的“RBAC+ 权限使用方案 + SDK 设计”**，告诉你：

1. 既然 RBAC+ 管理表已经做好（用户、角色、Action、Scope…），**业务系统如何实际使用这些权限？**
2. 如何提供 **统一的 SDK**（Java 后端为例）让其他系统秒级接入？
3. 如何做 **API 鉴权、页面鉴权、数据范围控制、前端菜单加载**
4. 如何保证与后续 SSO、集中认证一致。

这是 IAM 平台最关键的下一步：**从“可管理”到“可使用”。**

---

# 1. permission-plateform 的 RBAC+ 数据模型（你已实现）

你当前的数据模型（简化）：

* **user**
* **role**
* **user_role**
* **action_definition**（功能点：API / 按钮 / 页面）
* **role_action**
* **data_scope_strategy**（数据范围策略：本部门、本人、租户、业务线）
* **role_data_scope**

这些表提供了“权限数据”，但需要一套**可供业务系统调用的运行时权限校验机制**。

接下来是“如何使用”的核心部分。

---

# 2. 权限使用的 4 大核心场景

业务系统一般需要：

### ① 登录后获取用户权限（页面级）

加载可访问菜单、按钮。

### ② API 鉴权（后端）

判断用户是否允许调用某 API。

### ③ 数据范围控制（后端）

例如只能看本部门、本租户的数据——自动拼接 SQL WHERE。

### ④ 前端功能点控制（按钮隐藏/禁用）

为支持这些场景，需要提供：

* **统一权限 API**（由 permission-plateform 提供）
* **统一权限 SDK**（给业务系统用）
* **前端权限指令 v-perm 或函数**
* **后端 AOP/Interceptor 均可自动校验**

下面逐项解释。

---

# 3. permission-plateform 对外能力（运行时服务能力）

你需要在 IAM 主服务中提供：

---

## 3.1 运行时权限查询 API（对外暴露）

### 1）查询用户所有角色

```
GET /iam/runtime/user/{userId}/roles
```

### 2）查询用户所有 action 权限（展开后的扁平权限）

```
GET /iam/runtime/user/{userId}/actions
```

返回示例：

```json
{
  "userId": 1001,
  "actions": [
    "system:alarm:view",
    "system:alarm:edit",
    "metrics:dashboard:view"
  ]
}
```

### 3）查询用户数据范围策略

```
GET /iam/runtime/user/{userId}/data-scope
```

返回示例：

```json
{
  "userId": 1001,
  "scopes": [
    {
      "resource": "alarm",
      "scopeType": "DEPARTMENT_AND_SUB",
      "extraFilters": {"tenantId": "t1"}
    }
  ]
}
```

### 4）查询前端菜单（基于 action 过滤）

```
GET /iam/runtime/user/{userId}/menus
```

→ 前端根据返回构建侧边栏菜单。

---

# 4. SDK 设计（Java 后端）

为了让业务系统更容易接入，你应该提供：

```
permission-plateform-sdk
```

包含：

* 鉴权注解 @RequiresAction
* 数据范围注解 @DataScope(resource="alarm")
* API 调用客户端（Feign/RestTemplate）
* 本地缓存（Guava/Caffeine）
* ThreadLocal + PermissionContext
* WebFilter/AOP 拦截器

---

## 4.1 SDK 核心能力清单

| 功能       | 方式                               | 说明                    |
| -------- | -------------------------------- | --------------------- |
| 获取用户权限   | PermissionClient                 | 查询、缓存用户 action        |
| API 权限校验 | @RequiresAction + AOP            | 拦截 controller         |
| 数据范围控制   | @DataScope + MyBatis Interceptor | 自动拼接 SQL WHERE        |
| 菜单加载     | SDK 不做，前端直接调用 IAM API            | 统一来源                  |
| 上下文注入    | PermissionContext                | 当前用户、角色、actions、scope |

---

# 5. 后端使用示例（业务系统）

假设业务系统的 API 想要求用户必须有 `alarm:view` 权限：

```java
@RestController
public class AlarmController {

    @RequiresAction("alarm:view")
    @GetMapping("/alarm/list")
    public Result list(AlarmQuery query) {
        return alarmService.list(query);
    }
}
```

### SDK 内部 AOP 行为：

1. 获取当前 userId（来自登录 JWT）
2. 调用 PermissionClient（带本地缓存） → 获取用户所有 actions
3. 判断是否包含 `alarm:view`
4. 否则抛出 403 Forbidden

---

# 6. 数据范围使用示例（数据级权限）

业务场景：
用户只能查看自己负责部门的告警。

在 Service 层或 Mapper 上添加：

```java
@DataScope(resource = "alarm")
public List<Alarm> page(AlarmQuery query) {
    return alarmMapper.page(query);
}
```

MyBatis Interceptor 自动注入 SQL：

例如 scope = 本部门及子部门：

```
WHERE alarm.dept_id IN (SELECT id FROM dept WHERE parent_path LIKE '1/3/%')
```

如 scope = 本人（SELF）：

```
WHERE alarm.owner_id = #{currentUserId}
```

如 scope = 租户（TENANT）：

```
WHERE alarm.tenant_id = #{currentTenantId}
```

业务系统无需写任何逻辑。

---

# 7. 前端使用方式（Vue3 + ElementPlus）

### 1）页面菜单加载

在 Layout 初始化时：

```ts
const menus = await api.get("/iam/runtime/user/menus");
store.setMenus(menus);
```

### 2）按钮权限控制（RBAC+ action）

提供一个指令：

```ts
app.directive('perm', {
  mounted(el, binding) {
    const action = binding.value;
    if (!store.userActions.includes(action)) {
      el.style.display = 'none';
    }
  }
});
```

使用：

```vue
<el-button v-perm="'alarm:edit'">编辑</el-button>
```

---

# 8. 其他业务系统接入方式

### 8.1 Java（推荐 SDK）

* @RequiresAction
* @DataScope
* PermissionClient

### 8.2 Node.js / Python / Go 服务

调用 REST API：

```
GET /iam/runtime/user/{userId}/actions
```

在中间件中本地缓存 30 秒即可。

---

# 9. 整体架构示意图（文字描述版）

```
+----------------------------+
|  permission-plateform      |
|  (IAM RBAC+ Engine)        |
+------------+---------------+
             |
             | REST API
             |
+------------v---------------------------+
| Business System A                     |
|  - permission-sdk                     |
|  - @RequiresAction                    |
|  - @DataScope                         |
|  - PermissionContext                  |
+---------------------------------------+
             |
             |
+------------v---------------------------+
| Business System B (Node/Python/Go)    |
|  - 调用用户权限 API                   |
|  - 本地缓存                           |
+---------------------------------------+
```

---

# 10. 最终总结：你已具备“管理能力”，现在补齐“运行时能力”

你已完成了：

✔ 用户-角色
✔ 角色-Action
✔ 数据范围策略
✔ 后台管理 UI
✔ RBAC+ 数据模型

还缺的是：

✔ 如何“使用这些权限”
✔ 如何让业务系统轻松接入
✔ 如何在 API / 数据范围 / 前端菜单中生效

这份文档已提供：

* 运行时 API
* SDK（Java）
* 前端权限指令
* 数据范围 MyBatis 插件
* API 鉴权 AOP
* 业务方接入流程

你现在可以让任何业务系统在 **5 分钟内接入权限体系**。

* any list
{:toc}