---
layout: post
title: NLP平台-04-RBAC 介绍
date: 2025-11-06 14:12:33 +0800
categories: [Think]
tags: [think, sh]
published: true
---


# chat

## RBAC

按照这个设计文档，帮我实现前后端功能，SQL脚本放在 db/migrate 中，版本依次增加。

所有的菜单放在权限管理下，只有管理员 admin 默认拥有所有权限。

其他角色权限根据配置定义。

这部分是整个平台的“安全与治理核心”。

下面我会以**产品级 + 架构级**视角，详细讲清楚从 0 到 1 设计一个 **RBAC（基于角色的访问控制）系统**，包括：

1. 核心理念与设计目标
2. 权限模型分层（用户-角色-资源-操作）
3. 权限设计方案（资源建模、继承、作用域）
4. 数据库设计与 ER 模型
5. 权限校验流程（含接口层与数据层）
6. 管理端交互设计（UI / 操作流程）
7. 实际实现建议（后端 + 前端）
8. 典型扩展（ABAC、Policy Engine、审计）

---

## 一、设计目标

在 NLP 平台中，RBAC 的目标是：

| 目标    | 说明                          |
| ----- | --------------------------- |
| 安全    | 确保只有被授权的人能访问特定接口或数据（防止越权操作） |
| 可管理   | 管理员可以清晰地授予、撤销权限，不依赖代码改动     |
| 可扩展   | 后续可以平滑升级到 ABAC（基于属性）或策略引擎模式 |
| 多租户隔离 | 每个组织（租户）的权限体系独立，不互相影响       |

---

## 二、RBAC 模型核心结构

RBAC 本质上是四层关系：

```
用户 (User)
  ↓ 属于
角色 (Role)
  ↓ 拥有
权限 (Permission)
  ↓ 作用于
资源 (Resource)
```

### 1️⃣ 用户（User）

* 平台的操作主体：可以是人，也可以是服务账号（API Key）。
* 一个用户可以属于多个**组织（tenant）**，并在每个组织里拥有不同角色。

### 2️⃣ 角色（Role）

* 权限的集合，代表某类身份的能力边界。
* 典型例子：

  * **Owner / Admin**：拥有该组织内全部资源的管理权限；
  * **Developer**：可管理项目、调用模型、查看日志；
  * **Viewer / Analyst**：只读查看；
  * **Billing Manager**：仅查看和管理账单；
  * **Service Account**：仅能访问 API，不能登录前端。

### 3️⃣ 权限（Permission）

* 定义了**能对哪类资源执行哪些操作**。
* 通常形式是 `resource:action`，例如：

  * `model:deploy`
  * `project:create`
  * `api_key:revoke`
  * `billing:view`
  * `user:invite`

### 4️⃣ 资源（Resource）

* 平台中的可管理对象。
* 在 NLP 平台中可分为：

  * **系统级资源**：用户、组织、账单、系统配置；
  * **业务资源**：模型（model）、项目（project）、API key、pipeline、dataset；
  * **操作型资源**：调用 API、配置权限、导出日志。

---

## 三、权限设计原则与层次

| 层级      | 示例               | 控制粒度  | 说明               |
| ------- | ---------------- | ----- | ---------------- |
| **系统级** | 系统设置、计费策略        | 超管可见  | 只平台管理员有权限        |
| **组织级** | 组织、成员、账单、API Key | 按组织隔离 | RBAC 最常见作用域      |
| **项目级** | 模型、任务、pipeline   | 项目维度  | 支持子级权限           |
| **资源级** | 单个模型/数据集         | 最细粒度  | 可选，通常在 ABAC 阶段实现 |

👉 实践建议：

* MVP 阶段只做到“组织级”和“项目级”；
* 资源级（例如某模型仅限部分人访问）可延后。

---

## 四、数据库表设计（核心 ER 模型）

### 实体关系图（简化版）

```
User ───< UserRole >─── Role ───< RolePermission >─── Permission ─── Resource
```

### 主要表结构设计

所有的表都需要有

id 自增主键 以及下面的几个属性值

```
+-------------+--------------+------+-----+----------------------+--------------------------------+
| Field       | Type         | Null | Key | Default              | Extra                          |
+-------------+--------------+------+-----+----------------------+--------------------------------+
| creator_id  | bigint(20)   | YES  |     | NULL                 |                                |
| create_time | datetime(3)  | NO   | MUL | CURRENT_TIMESTAMP(3) |                                |
| update_time | datetime(3)  | NO   |     | CURRENT_TIMESTAMP(3) | on update CURRENT_TIMESTAMP(3) |
| updater_id  | bigint(20)   | YES  |     | NULL                 |                                |
| delete_flag | tinyint(4)   | NO   | MUL | 0                    |                                |
```

加上合适的索引，update_time 需要普通索引。方便按照时间范围过滤。

所有的表都需要添加一些合适的测试数据。

#### 1. 用户表

用户表已经有了

> desc user;
+-------------+--------------+------+-----+----------------------+--------------------------------+
| Field       | Type         | Null | Key | Default              | Extra                          |
+-------------+--------------+------+-----+----------------------+--------------------------------+
| id          | bigint(20)   | NO   | PRI | NULL                 | auto_increment                 |
| username    | varchar(50)  | NO   | UNI | NULL                 |                                |
| password    | varchar(100) | NO   |     | NULL                 |                                |
| salt        | varchar(50)  | NO   |     | NULL                 |                                |
| email       | varchar(100) | NO   | UNI | NULL                 |                                |
| phone       | varchar(20)  | YES  |     | NULL                 |                                |
| nickname    | varchar(50)  | YES  |     | NULL                 |                                |
| avatar      | varchar(200) | YES  |     | NULL                 |                                |
| status      | tinyint(4)   | YES  |     | 1                    |                                |
| creator_id  | bigint(20)   | YES  |     | NULL                 |                                |
| create_time | datetime(3)  | NO   | MUL | CURRENT_TIMESTAMP(3) |                                |
| update_time | datetime(3)  | NO   |     | CURRENT_TIMESTAMP(3) | on update CURRENT_TIMESTAMP(3) |
| updater_id  | bigint(20)   | YES  |     | NULL                 |                                |
| delete_flag | tinyint(4)   | NO   | MUL | 0                    |                                |
| real_name   | varchar(50)  | YES  |     |                      |                                |
+-------------+--------------+------+-----+----------------------+--------------------------------+

#### 2. `organizations`

| 字段         | 类型       | 说明      |
| ---------- | -------- | ------- |
| id         | bigint   | 主键      |
| name       | varchar  | 公司/组织名  |
| owner_id   | bigint   | 组织管理员ID |
| created_at | datetime | 创建时间    |

#### 3. `roles`

| 字段          | 类型      | 说明                       |
| ----------- | ------- | ------------------------ |
| id          | bigint  | 主键                       |
| name        | varchar | 角色名称（如 Admin, Developer） |
| scope       | enum    | system/org/project       |
| description | text    | 角色说明                     |

#### 4. `permissions`

| 字段          | 类型      | 说明                        |
| ----------- | ------- | ------------------------- |
| id          | bigint  | 主键                        |
| resource    | varchar | 资源类型（如 "model"、"project"） |
| action      | varchar | 操作（如 view/create/delete）  |
| description | text    | 描述                        |

#### 5. `role_permissions`

| role_id | permission_id |
| ------- | ------------- |
| 1       | 10            |
| 1       | 11            |

#### 6. `user_roles`

| user_id | role_id |
| ------- | ------- | 
| 1       | 1       |

## 五、权限校验流程（接口层逻辑）

### 1️⃣ 调用 API 的通用流程：

```
[用户请求 API]
    ↓
[Auth 层] 校验身份（JWT / API Key）
    ↓
提取 user_id / org_id / roles
    ↓
[RBAC 中间件]
    ↓
根据接口定义的权限标识（如 "model:deploy"）
    ↓
在缓存或 DB 查用户角色 → 对应权限集合
    ↓
若包含权限 → 放行，否则返回 403 Forbidden
```

### 2️⃣ 实现要点：

* 在接口元数据中声明所需权限（例如注解或装饰器）；
* 使用中间件拦截请求，进行快速匹配；
* 为性能考虑，用户权限应缓存（Redis / in-memory）；
* 每次角色或权限变动时触发缓存刷新。

### 3️⃣ 数据层校验（补充）：

防止业务层直接绕过接口控制：

* 在查询时附带orgId限制；（后续涉及到组织的信息列表等时）
* 关键操作记录审计日志。

---

## 六、管理端 UI / 交互设计

前端初期可以精确到菜单、每一个按钮级别。

后端统一权限控制。

## 七、技术实现建议

### 后端实现

* 框架：注解拦截器
* 权限注解式控制，例如：

  ```java
  @Permission(["modelDepoly"])
  public Response deployModel(...) {...}
  ```
* 权限缓存：MVP阶段使用本地

### 前端实现

* 登录后，获取用户的角色/权限集合；
* 在路由层与组件层根据权限过滤可见页面；
* 权限变动后重新拉取配置。（初期可以定时5min本地轮训更新1次）

---

## 八、扩展方向（后续考虑）

1. **ABAC（Attribute-Based Access Control）**

   * 引入属性维度：`用户属性 + 资源属性 + 环境属性`
   * 例如：

     ```
     allow if user.department == resource.owner_department
     ```
   * 可基于 OPA（Open Policy Agent）或 Casbin 实现。

2. **Policy Engine / DSL**

   * 支持自定义策略语法：

     ```yaml
     effect: allow
     action: ["project:create"]
     condition:
       - user.role == "admin"
       - org.status == "active"
     ```

3. **审计日志**

添加切面，所有变更类操作如审计库。

   * 每次授权变更、登录、角色变更、敏感操作都要落库；
   * 支持按用户/时间/资源搜索；
   * 可接入 ELK / Loki。（后期）

---

## 九、总结：RBAC 的落地路线（MVP → 企业级）

| 阶段          | 能力                                | 示例     |
| ----------- | --------------------------------- | ------ |
| **MVP**     | 固定角色（Admin / Dev / Viewer），手动配置权限 | 够用、简单  |
| **Phase 2** | 可自定义角色 + 可视化权限矩阵                  | 支持企业客户 |
| **Phase 3** | 细粒度权限（项目级 / 资源级）+ 策略引擎            | 灵活、安全  |
| **Phase 4** | 审计、异常检测、审批流                       | 金融/政企级 |


# 参考资料

* any list
{:toc}