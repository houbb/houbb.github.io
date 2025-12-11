---
layout: post
title: 权限体系之-104-RBAC+ 在 permission-plateform 的完整落地方案（企业级实施计划）
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# 改造方案

```
permission
role
role_permission
user
user_group
user_group_relation
user_role
```

这已经覆盖了**基础 RBAC 核心能力**。
下面我会基于你已有的模型，提供：

# 《permission-plateform 的 RBAC+ 完整落地方案（在不破坏已有表结构前提下）》

方案目标：

1. 不动现有表
2. 新增少量必要表
3. 扩展资源模型（菜单/API/按钮）
4. 引入 Action 权限 + DataScope 权限
5. 支持组织、岗位、用户组维度授权
6. 提供前后端治理与扫描方案
7. 给出权限校验与缓存方案
8. 最终形成企业级 RBAC+

不会推翻你已有的 RBAC，只是在其上扩展。

---

# 1. 现有模型的定位（保持不变）

你现有表的语义是：

| 表                   | 语义       |
| ------------------- | -------- |
| permission          | 权限点（粗资源） |
| role                | 角色       |
| role_permission     | 角色绑定权限   |
| user                | 用户       |
| user_group          | 用户组      |
| user_group_relation | 用户与组的关系  |
| user_role           | 用户绑定角色   |

> 基础 RBAC 已经具备。

RBAC+ 的关键是：
**扩展权限粒度、扩展资源类别、增加数据权限、增加组织维度。**

---

# 2. RBAC+ 要新增的能力（回顾）

RBAC+ 主要扩展：

1. **资源增强：拆分为菜单/API/按钮/文件/页面字段等资源分类**
2. **Action 权限增强：view/edit/delete/export 等操作级别权限**
3. **数据权限增强：行级、列级、数据范围**
4. **组织与岗位权限**
5. **前端校验、后端校验统一体系**
6. **资源自动发现扫描机制（后端注解扫描 + 前端上报）**

---

# 3. **在你的现有结构上如何扩展成 RBAC+？（重点）**

## 你已有 `permission` 表，但它只是 “权限点”

为实现 RBAC+，我们必须增加**资源模型**。

---

# 4. 必要新增的 3 张表（最小、但完整）

以下是 RBAC+ 必需但绝对不重复你当前表结构的新增表：

## 4.1 `resource`（核心：资源中心）

```
resource
----------------------------
id
resource_type      // menu/api/button/page/data
resource_code      // 唯一，如 user:list:view
resource_name      // 人类可读
parent_id          // 支持树状菜单/功能结构
component_path     // vue 组件路径
api_path           // 对应 API 路径
method             // GET/POST
created_at
updated_at
hash               // 自动扫描时用于比对
```

这是 **RBAC+ 模型的核心表**。

将权限拆分为更精细的资源节点。

---

## 4.2 `resource_action`（扩展 Action：View/Edit/Delete/Export）

```
resource_action
----------------------------
id
resource_id       // 关联 resource
action_code       // view, add, edit, delete, export
action_name
created_at
updated_at
```

理由：
动作级权限是 RBAC+ 必备（相当于 API/按钮操作）。

---

## 4.3 `data_scope`（数据权限）

```
data_scope
----------------------------
id
scope_code        // self / dept / dept_and_child / all / custom
scope_name
scope_rule        // JSON（SQL 片段、表达式，如 dept_id in (...)）
created_at
updated_at
```

理由：

* 行级权限、组织维度过滤是 RBAC+ 的典型需求。
* scope 规则可以表达成表达式在后端处理。

---

# 5. 在不动你的 role/permission 表的前提下如何扩展？

核心原则：

* **role_permission 存的是 permission_id**
* permission 表扩展支持“绑定 resource_action/data_scope”

### 扩展 permission 表（增加两列，无需新增表）

### 5.1 `permission` 扩展字段

你的 permission 表必须新增：

```
permission
---------------------------
id
...（你现有字段）
resource_id        // 关联 resource
action_id          // 关联 resource_action
data_scope_id      // 关联 data_scope（可空）
```

**这就是 RBAC+ 的关键**：
permission 变成 “角色能做什么” 的组合。

例如：

| resource  | action | scope     | permission 展示            |
| --------- | ------ | --------- | ------------------------ |
| user:list | view   | dept_only | user:list:view:dept_only |

RBAC 保留，但升级为 RBAC+ 的 Resource+Action+DataScope 三元模型。

---

# 6. 完整的 RBAC+ 权限结构（最终呈现）

资源(resource)
→ 动作(action)
→ 组成 permission
→ role_permission 绑定
→ role 绑定给 user / user_group / org

新结构如下：

```
user
  ↳ user_role
role
  ↳ role_permission
permission
  ↳ resource
     ↳ resource_action
     ↳ data_scope
```

这就是标准 RBAC+。

---

# 7. 资源自动发现体系（企业级精准方案）

后端：

* 使用 Spring + 注解（如 @ApiPermission）
* 启动时自动扫描 Controller API
* 注册到 resource/resource_action 表

前端：

* 扫描路由 / meta.permission
* 扫描按钮 · v-permission
* 自动生成 permissions.json
* 部署 CI/CD 上传权限资源

---

# 8. 权限校验（前端/后端统一）

## 后端（网关 + Controller 校验）

* JWT 解码 -> user_id
* user 权限缓存（Redis）里缓存 permission 列表
* API 对应 permission_code 校验
* 数据接口根据 data_scope 动态注入 where 条件

## 前端（控制菜单/按钮）

* 拉取当前用户 permission 列表
* 通过 v-permission 指令做按钮显示控制
* 菜单通过 meta.permission 过滤

---

# 9. 权限缓存方案（可用于你的平台）

Redis Key：

```
perm:user:{userId} -> permission_code 数组
perm:role:{roleId} -> permission_code 数组
perm:resource:hash  -> 当前系统资源指纹
```

每次新增/删除菜单/API，不要重启系统。

---

# 10. 管理界面（后台 UI 模块）

你现在已有：

* 角色管理
* 用户管理
* 用户组管理
* 角色绑定权限

RBAC+ 增加界面模块：

1. **资源中心（菜单、按钮、API 自动同步）**
2. **动作管理（Action）**
3. **数据权限管理（DataScope）**
4. **授权矩阵（角色 × 资源 × 动作 × 数据范围）**
5. **权限差异化分析界面（角色对比）**
6. **权限变更审计**

---

# 11. 给你最终 RBAC+ 的最简落地路径（非常重要）

你现在立刻可以执行：

### Step 1

新增 3 张表：resource、resource_action、data_scope

### Step 2

permission 表增加 resource_id, action_id, data_scope_id

### Step 3

保留现有 role_permission 体系不变

### Step 4

后端实现注解扫描 API → 写入 resource/resource_action
前端上报菜单/按钮权限点 → 写入 resource/resource_action

### Step 5

后台管理新增“资源中心页面”

### Step 6

权限评估基于 permission → resource/action/scope

你将从 RBAC 秒升级为 **企业级 RBAC+**。

# 那为什么还需要进一步设计你说的 action resource data_scope？？

这是一个非常关键的问题：
既然你已经采用了统一的 `permission` 表、并且区分了 MENU/API/BUTTON/PAGE/DATA，为什么我还建议你进一步引入：

* **Action（动作权限）**
* **Resource（资源实例权限）**
* **Data Scope（数据范围权限）**

你担心的是：
这是不是重复造轮子？是不是重复设计？

下面我用企业级权限体系的角度说明为什么这是必要的——并不会与现有 `permission` 冲突，而是 **RBAC → RBAC+ → ABAC 的自然演进**。

---

# 1. 现有 `permission` 的定位是什么？

你现在的 `permission` 表解决的是：

**“页面级/功能级/接口级”的可访问性控制**

也就是：

* 菜单能不能看
* 页面能不能打开
* 按钮能不能点
* API 能不能调
* 某类数据权限是否启用（DATA 的大类）

它本质上是：
**是否可以访问这个节点（Node）的权限**。

但是，它没有解决：

* 在 *一个 API 内*，你能查看哪些数据？
* 用户是否可以对某一行记录做 “编辑/删除/审批操作”？
* 用户是否可以对某一个资源实例单独授权？
* 大型组织的分级授权怎么做（如仅能管理本部门的用户）？

这就是 RBAC 的天然局限。

---

# 2. 为什么要有 Action？（解决“操作级权限”）

当前 permission 的不足：

| 场景                                 | 为什么 permission 不够                    |
| ---------------------------------- | ------------------------------------ |
| 用户能看到“列表”但不能点“导出”                  | 按钮权限可以做到，但不够精细                       |
| 某个 API 支持 read/write/update/delete | 你的 API permission 是一个整体，无法拆分操作       |
| 业务操作是动态的，如审批通过/拒绝                  | 很难把 approve/reject 都注册为 BUTTON 或 API |

因此 Action 是：

### Action = 对资源执行的业务动作

例如：

* read
* write
* update
* delete
* approve
* reject
* enable
* disable
* bind
* unbind

企业权限系统里 Action 的标准作用：

* 形成 RBAC 权限的基本原子单位（AWS IAM）
* 控制 API 内部的业务操作
* 支持动态的业务动作（审批、流转）
* 实现更加精细化的权限控制

**Action 不替代 permission，而是补全 permission 的粒度。**

---

# 3. 为什么要有 Resource？（解决实例级权限：Record-level Permissions）

现有 permission 解决的是：

* “你能不能访问用户管理页面”
* “你能不能调用 /user/update”

但是无法解决：

* 你是不是只能编辑 **你自己的用户**？
* 你是不是只能管理 **本部门的用户**？
* 你是不是只能看到 **任务 A 而不是任务 B**？
* 某条记录的 owner 才能编辑它？

也就是：

### permission 控制的是 “类型级资源（Type-level）”

### resource 控制的是 “实例级资源（Instance-level）”

例子：

| 类型级  | 实例级                 |
| ---- | ------------------- |
| 修改用户 | 修改用户 ID = 77        |
| 查看订单 | 查看订单 ID = 888       |
| 管理部门 | 管理部门 dept_id = 1703 |

大型系统（金融/大厂/多租户）必备。

---

# 4. 为什么要有 Data Scope？（解决数据范围权限：组织/范围/过滤条件）

这是 RBAC+ 和 ABAC 的核心。

现有 permission 只能控制：

* 看 or 不看
* 调 API or 不调 API

但不能控制“看到哪些数据”。

例如：

| 场景                   | 为什么 permission 不够 |
| -------------------- | ----------------- |
| 用户只能看到本部门的员工         | 需要数据过滤            |
| 区域经理只能看到所属区域的销售数据    | 需要区域过滤            |
| 财务能看到所有数据，销售只能看自己的订单 | 需要行级过滤            |
| 审计能看到脱敏数据            | 需要列级过滤            |

数据范围（Data Scope）正是为了解决：

### 用户能看到哪些数据？

### 用户能操作哪些数据？

### SQL 需要自动追加哪些过滤条件？

常见的数据范围类型：

* 本人（Self）
* 本部门（Dept）
* 本部门及子部门（Dept & Sub）
* 本组织（Org）
* 自定义范围（custom）
* 全部（All）

这与 permission 完全是不同维度。

---

# 5. 三者与当前 permission 的关系（非常关键）

你可以这么理解：

## permission = 是否能访问（入口权限）

## action = 能执行什么操作（行为权限）

## resource = 作用在哪些资源实例上（实体权限）

## data_scope = 可以访问哪些数据（数据权限）

它们是四层模型：

```
Permission（入口级） ← 现有系统
   ↓
Action（操作级）
   ↓
Resource（实例级）
   ↓
Data Scope（数据级）
```

而你现在的 permission 表完成的是：

* MENU / PAGE（入口）
* API（入口）
* BUTTON（部分操作）
* DATA（宏观的数据权限声明）

**但缺少可落地的数据范围+实例级权限+操作粒度。**

这也是全球主流权限模型的路线图：

| 模型    | 控制能力            |
| ----- | --------------- |
| RBAC  | 访问控制            |
| RBAC+ | 操作 + 菜单/UI/接口扩展 |
| ABAC  | 数据范围 + 条件控制     |
| PBAC  | 策略驱动，覆盖一切       |

你现在处在 RBAC → RBAC+ 的位置，要走向企业级，三件事是必须的：

* Action
* Data Scope
* Resource

才能进入 ABAC、PBAC 级别。

---

# 6. 在你的 permission-plateform 中，三者怎么落地？

## Action：落地方式

* 定义标准动作集（CRUD + APPROVE + EXPORT）
* API 自动扫描时自动注册
* 后端代码使用注解 @Action("update")
* 前端按钮绑定 action 控制
* role_action 表自动生成（或软合并到 role_permission）

## Resource：落地方式

* 基础资源由业务系统提供 resource_id
* 后端在调用前检查资源级权限
* 例如：编辑用户时检查 user_id 是否在授权范围内
* 可以通过 Hook/Interceptor 实现自动校验

## Data Scope：落地方式

* 定义数据范围类型（self, dept, dept_sub, org, custom）
* role → data_scope
* user → data_scope
* 请求进入时将 data_scope 注入上下文
* MyBatis 拦截器自动拼接 SQL 条件（核心能力）

---

# 7. 结论（最核心的两句话）

### 你的 `permission` 表解决的是 “能否进入这个功能点”。

### Action、Resource、Data Scope 解决的是 “进入功能点后能做什么、对哪些资源、对哪些数据”。

它们不是重复设计，而是 **三层完全不同维度的权限模型**。

也是所有成熟 IAM 平台（SAP、阿里云 RAM、AWS IAM、Azure AD）必备的核心能力。

* any list
{:toc}