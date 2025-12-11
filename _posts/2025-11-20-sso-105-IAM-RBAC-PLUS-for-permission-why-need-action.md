---
layout: post
title: 权限体系之-105-RBAC+ 那为什么还需要进一步设计你说的 action resource data_scope？？
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


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


# permission 本身就可以抽象为 button/menu/api。也就是本身就满足到 action 这一层了不是吗？

下面给你一个**严格的专业答案**，确保与你当前的 permission 表结构、RBAC+ 的扩展方向、ABAC 的模型保持一致，并清晰解释：

**为什么 permission 表虽然已经有 MENU/API/BUTTON，但仍然不足以直接承担 action layer 的职责？**

以及：

**permission 表与 action 之间的“本质区别”在哪里？**

---

# 1. 你当前的 permission 表 = “资源层（Resource Layer）”

也就是：

**permission ≈ Resource（资源）**

你当前的字段结构如下：

| permission_type | 含义          |
| --------------- | ----------- |
| MENU            | 菜单资源（前端路由）  |
| BUTTON          | 按钮资源（UI 控件） |
| API             | 接口资源（后端服务）  |
| PAGE            | 页面资源（可选）    |
| DATA            | 数据域资源（可选）   |

这一层的本质是：

> 标记系统中有哪些“可被控制访问的对象”。

换句话说：

* 哪些 API 可访问？
* 哪些菜单可见？
* 哪些按钮可点？
* 哪些路由可打开？
* 哪些数据域需要限制？

这类资源通常是**静态注册**或**自动扫描产生**的。

这就是一个典型的 **Resource Registry（资源注册表）**。

---

# 2. “action layer”：描述的不是资源，而是“可被系统执行的能力”

这才是“RBAC+ / ABAC 系统”中更高抽象层级的核心。

## action 的代表含义是：

* 查询（READ）
* 新增（CREATE）
* 修改（UPDATE）
* 删除（DELETE）
* 审批（APPROVE）
* 导出（EXPORT）
* 发布（PUBLISH）
* 上线（DEPLOY）
* 启停（ENABLE/DISABLE）

它本质是：

> 对资源执行的操作能力。

对比一下：

| 层级       | 概念         | 示例                               | 是否你已有   |
| -------- | ---------- | -------------------------------- | ------- |
| Resource | 操作目标是什么    | `/user/list`, `user-edit-button` | **已实现** |
| Action   | 可对目标执行什么操作 | `READ`, `UPDATE`, `DELETE`       | **缺失**  |

---

# 3. 关键问题：**Permission≠Action**

你表中虽然有 BUTTON / API，但它们**不是 action 的统一抽象模型**：

例如：

### 例子：一个用户管理模块

用户管理有：

* 页面 `/user/list`（资源）
* 后端 GET `/api/user/list`（资源）
* 后端 POST `/api/user/create`（资源）
* 页面按钮 edit-button（资源）
* 页面按钮 delete-button（资源）

这些都是**资源资源资源**，只是类型不同。

但 action 的抽象应该是：

| Action      | 描述   |
| ----------- | ---- |
| READ_USER   | 查看用户 |
| CREATE_USER | 创建用户 |
| UPDATE_USER | 修改用户 |
| DELETE_USER | 删除用户 |

你当前 permission 表无法做到：

1. 将多个资源绑定到同一个 action

   * 如：页面按钮 + API + 菜单 + 微前端路由 → 都属于 “UPDATE_USER”
2. 让 action 成为跨系统 / 跨 UI / 跨 API 的统一权限单元
3. 在 ABAC 策略中复用 action（如：工单系统审批 action）
4. 让上层策略不依赖具体资源（强解耦）
5. 提供统一 SDK 给下游系统（action-based API 更友好）

---

# 4. 为什么企业级平台必须要有 Action？

下面是“是否必须 action”的判断标准：

| 功能需求                | 是否需要 action | 原因                      |
| ------------------- | ----------- | ----------------------- |
| 简单后台管理系统            | 不需要         | 只用资源即可                  |
| 多系统权限统一             | 必须          | 资源编码格式不一致、数量巨大          |
| 跨系统访问控制             | 必须          | “编辑用户”比“edit-button”更稳定 |
| 策略中心（policy engine） | 必须          | 策略基于操作语义而非 HTTP path    |
| 支持 ABAC             | 必须          | ABAC 的策略通常是 “资源+操作+属性”  |
| 提供 SDK 给下游          | 必须          | 能力级别 API 更清晰            |
| 权限审计 / 回溯           | 必须          | “操作”更易被理解               |

你的平台「permission-plateform」本质就是构建一个：

> 企业级权限控制中心（Authorization Center）

要达到企业级，就必须：

**从资源驱动 → 行为/能力驱动（即 action）**

---

# 5. 为什么需要引入 data_scope？

data_scope 解决的是：

> 在同一 action 下，对不同用户开放不同范围的数据。

示例：

| 用户 | Action    | 资源   | 数据范围  |
| -- | --------- | ---- | ----- |
| 张三 | READ_USER | 用户列表 | 仅自己部门 |
| 李四 | READ_USER | 用户列表 | 全公司   |
| 王五 | READ_USER | 用户列表 | 指定业务线 |

注意：

* action 是相同的：READ_USER
* resource 是相同的：用户列表
* data_scope 才区分权限强弱

如果没有 data_scope，你无法实现企业级权限。

---

# 6. 总结（最关键）

你当前的 permission 表：

* 表示的是**资源列表**
* 已满足 UI/API/BUTTON 的分类
* 但不等同于 action
* action 是“可对资源执行的能力”
* ABAC/RBAC+/策略中心都需要 action
* data_scope 用于细化资源访问范围
* 因此 action/resource/data_scope 是三层模型

最终抽象：

```
Action (能做什么？)
   ↓
Resource (对什么做？)
   ↓
Data Scope (对什么范围的数据做？)
```

不同层级负责不同的职责，这样权限体系才可扩展到企业级。

* any list
{:toc}