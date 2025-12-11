---
layout: post
title: 权限体系之-108-RABC+ resource×action×dataScope 关系
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# # 关系说明

好的，我帮你把 **resource / action / data_scope** 与你现有 RBAC 的关系，以及它们对最终权限的影响做一个**清晰、可落地的整体梳理**。

我会分模块说明，并给出流程示意，确保逻辑明确。

---

# 1. 核心概念

## 1.1 Resource（资源）

* 系统中被操作的对象，比如：

  * 用户管理
  * 订单列表
  * 客户信息
  * 页面、菜单、API 等
* 表示“**你想保护的对象是什么**”
* 现有表：`resource`
* 可以树形组织（父子结构），便于菜单、模块划分

---

## 1.2 Action（动作）

* 在资源上可执行的操作，例如：

  * view / create / update / delete / export / approve
* 表示“**你可以对资源做什么**”
* 现有表：

  * `rbacp_action`：动作定义
  * `rbacp_resource_action`：资源允许的动作（约束哪些动作能用于哪个资源）

---

## 1.3 Data Scope（数据范围）

* 定义资源 + 动作操作的数据边界
* 表示“**你可以对哪些数据执行动作**”
* 核心目的是做 RBAC 的增强，解决“跨部门/自定义数据权限问题”
* 新增表：

  * `rbacp_datascope`：系统数据范围定义（SELF、DEPT、ALL、CUSTOM）
  * `rbacp_role_datascope`：角色在资源动作级别的数据范围授权
  * （可选）`rbacp_datascope_custom_rule`：自定义数据规则

---

# 2. 与原 RBAC 关系梳理

| 原 RBAC                                   | 作用            | 新增维度                                                     |
| ---------------------------------------- | ------------- | -------------------------------------------------------- |
| role → user_role → user                  | 用户属于哪些角色      | 不变                                                       |
| role → role_permission → resource/action | 原本角色可以访问资源+动作 | 新增 data_scope 后，角色权限变为 **Resource × Action × DataScope** |
| permission / resource_permission         | 原本可能是菜单按钮权限   | 可以被 resource/action/data_scope 替代或补充                     |

**结论**：

* 原来的 RBAC 是二维：资源 × 动作
* 加入 data_scope 后，变为三维：资源 × 动作 × 数据范围
* 用户最终权限 = 所有角色的三维权限的合并（取最大范围或组织策略决定）

---

# 3. 权限影响示意

## 3.1 用户视角

当用户访问某资源时，系统判断：

1. **动作是否允许**

   * 检查 `role_permission` 或 `rbacp_resource_action`
   * 例：用户对订单资源是否有 delete 权限

2. **数据是否可见**

   * 检查 `rbacp_role_datascope`
   * 例：delete 权限对应的数据范围是 SELF（只能删除本人创建的订单）

3. **综合结果**

   * 用户只能对“允许动作 + 数据范围内的数据”执行操作

---

## 3.2 角色授权维度

当管理员给角色授权时，需要考虑三个维度：

1. **Resource（资源）**
2. **Action（动作）**
3. **Data Scope（数据范围）**

授权 UI 示例：

```
资源：订单列表
动作：
  [ ] view
  [ ] update
  [ ] delete
数据范围：
  view → ALL
  update → DEPT_AND_SUB
  delete → SELF
```

---

# 4. 数据流示意

```
用户
 |
 user_role
 |
 role
 |-----------------------|
 |                       |
role_permission      rbacp_role_datascope
(resource/action)       (resource/action/datascope)
```

* 角色权限（二维）决定动作是否允许
* 角色数据范围（三维）决定可操作的数据集
* 系统最终权限 = 动作允许 & 数据范围过滤

---

# 5. 前端交互设计对应关系

| 页面            | 维度                            | 交互方式                      |
| ------------- | ----------------------------- | ------------------------- |
| Resource 管理   | Resource + Action             | 资源树 + 动作 Switch 卡片        |
| Action 管理     | Action                        | 列表 CRUD + icon 操作栏        |
| Data Scope 管理 | DataScope                     | 表格 + Drawer 编辑规则          |
| 角色授权          | Resource × Action × DataScope | Tab / 卡片 / 下拉选择 + 自定义规则抽屉 |

---

# 6. 权限执行逻辑总结

1. 用户访问资源
2. 系统查找用户角色
3. 判断是否有资源 + 动作权限
4. 根据角色在该资源动作上的数据范围生成数据过滤条件
5. 最终返回可操作的数据集合

---

# 7. 总结

* **Resource**：保护对象
* **Action**：可执行操作
* **Data Scope**：可操作的数据范围
* **最终权限** = 用户所属所有角色的 Resource × Action × DataScope 的组合

这就是 RBAC+ 完整的三维权限体系。




# 关系维护

明白，你想要一个**清晰的维护逻辑**，说明资源、动作、数据范围（DataScope）如何配置，同时如何与原来的 `role/user/permission` 关联。下面我给你梳理一个完整的维护方案。

---

# 1. 三者关系维护总览

## 1.1 核心表与关系

| 表                       | 作用                        | 与三维权限的关系                                     |
| ----------------------- | ------------------------- | -------------------------------------------- |
| `resource`              | 系统中被保护的对象                 | 每个 resource 可以关联多个动作（rbacp_resource_action）  |
| `rbacp_action`          | 系统动作（view/create/delete…） | 全局动作库                                        |
| `rbacp_resource_action` | 资源允许的动作                   | 约束某个资源可用的动作，防止无效动作绑定                         |
| `rbacp_datascope`       | 系统定义的数据范围                 | 全局可选择的数据范围（SELF/DEPT/ALL/CUSTOM）             |
| `rbacp_role_datascope`  | 角色对资源动作的数据范围              | 用户实际权限的三维核心，记录角色在某资源动作上的数据范围                 |
| `role`                  | 角色                        | 聚合权限（二维 role_permission + 三维 role_datascope） |
| `user_role`             | 用户所属角色                    | 用户继承角色权限                                     |
| `user`                  | 系统用户                      | 最终权限计算基于所属角色                                 |

---

## 1.2 逻辑关系图（文本版）

```
user
 └─ user_role ──> role
                     ├─ role_permission ──> resource + action  (二维 RBAC)
                     └─ rbacp_role_datascope ──> resource + action + datascope  (三维 RBAC+)
resource
 └─ rbacp_resource_action ──> action
rbacp_datascope ──> rbacp_role_datascope
```

* **二维权限**：role_permission（原来权限表）控制能否操作某资源动作
* **三维权限**：rbacp_role_datascope 决定操作资源动作时的数据范围

---

# 2. 维护步骤与逻辑

## 2.1 Resource 与 Action 的维护

1. 在 **资源管理页面**添加/修改资源：

   * 填写资源名称、类型（菜单/API/业务对象）
   * 可选：父级资源，形成树结构
2. 配置资源允许的动作：

   * 展示全局动作列表（rbacp_action）
   * 通过开关/勾选选择允许的动作
   * 系统生成或更新 `rbacp_resource_action` 记录

**原则**：资源可以关联多个动作，动作是全局唯一定义

---

## 2.2 DataScope 的维护

1. **系统管理员定义数据范围**：

   * 系统内置：SELF / DEPT / DEPT_AND_SUB / ALL
   * 可自定义：CUSTOM（可填写 SQL/JSON/规则）
2. **资源允许哪些数据范围**：

   * 可在资源详情页做一个 Tab：允许的数据范围列表（非必需，可默认全量）

**原则**：DataScope 维度是可选但推荐统一配置，便于角色授权

---

## 2.3 角色权限维护

### 2.3.1 选择资源动作（二维）

1. 在角色授权页面选择资源
2. 展示该资源允许的动作（rbacp_resource_action）
3. 勾选允许的动作 → 写入 `role_permission`（原二维 RBAC）

### 2.3.2 分配数据范围（三维）

1. 对每个已勾选的资源动作选择数据范围
2. 可选 CUSTOM 时填写规则
3. 写入 `rbacp_role_datascope`（role_id + resource_id + action_id + datascope_id）

**原则**：

* 数据范围粒度可以按动作细化（比如 view 全部门、delete 仅本人）
* 自定义规则可覆盖系统内置范围

---

## 2.4 用户继承权限

1. 用户通过 `user_role` 获取所属角色

2. 系统整合所有角色权限：

   * 动作是否允许 → 通过 role_permission 检查
   * 数据范围 → 通过 rbacp_role_datascope 过滤数据

3. 最终权限 = “允许动作 + 可见数据”

---

# 3. 前端交互示意

### 3.1 资源管理页面

```
资源列表/树
└─ 资源详情（卡片）
   ├─ 基本信息
   ├─ 动作关联（Switch 列表）
   └─ 数据范围（下拉选择/勾选）
```

### 3.2 角色授权页面

```
角色详情页
└─ 权限配置
   ├─ 资源列表
   ├─ 动作列表（二维 RBAC）
   └─ 数据范围选择（三维 RBAC+）
        资源动作1 → SELF / DEPT / ALL / CUSTOM
        资源动作2 → DEPT / ALL
```

---

# 4. 总结维护规则

1. **Resource** + **Action** 先定义清楚 → 决定可用动作
2. **DataScope** 定义系统级范围 → 决定可选择的数据粒度
3. **Role** 权限维护分两步：

   * role_permission（二维）决定能否操作资源动作
   * rbacp_role_datascope（三维）决定可操作的数据范围
4. **User** 通过角色继承最终权限，执行时同时判断动作允许 + 数据范围
5. 三维维度整合后，RBAC+ 权限完整且灵活，支持跨部门、分级数据访问


好的，我们来仔细分析这个问题。你问的是：在现有体系里，是否还需要维护 `permission` 表与 `resource × action` 的关系。答案取决于 `permission` 的定位以及系统的设计复杂度。

---

# 1. permission 的常见作用

在传统 RBAC 中，`permission` 往往是**抽象的权限项**，可以是：

* 菜单访问权限（menu:view）
* 按钮权限（button:create）
* API 接口访问（api:delete）

它的作用是 **作为角色授权的粒度单位**，一般通过 `role_permission` 赋给角色。

---

# 2. 你现在的体系

你现有的表：

| 表                     | 作用                      |
| --------------------- | ----------------------- |
| resource              | 系统资源（菜单/API/对象）         |
| rbacp_action          | 动作（view/create/delete…） |
| rbacp_resource_action | 资源允许动作，定义合法动作组合         |
| resource_permission   | 角色对资源动作授权（原权限体系）        |
| role_permission       | 角色权限（原二维权限）             |

**问题点**：

* 如果 `permission` 已经是“资源+动作”的抽象，那么它本质上与 `rbacp_resource_action` 有重叠
* RBAC+ 已经引入三维（resource × action × data_scope）
* permission 表可能只作为“逻辑标签”或“兼容老系统”，但并非必须

---

# 3. 维持关系的情景

## 3.1 必须维护的情况

1. 系统还需要兼容老的二维权限逻辑（旧权限体系基于 permission）
2. permission 表被用于前端菜单/按钮的显示控制
3. 系统需要支持“权限分类”或“权限标签”独立于 resource/action（例如，统一统计/搜索/审计）

在这种情况下，维护 **permission → resource × action** 的关系可以：

* 用一个表 `permission_resource_action` 映射
* permission = 逻辑权限，resource × action = 技术执行点

---

## 3.2 可以不维护的情况

1. 全部权限都直接通过 resource × action（+ data_scope）实现
2. permission 表只做历史兼容，无业务作用
3. 系统不需要再通过 permission 控制前端按钮或菜单

在这种情况下，**可以直接忽略 permission 表的关联**，避免重复维护。

---

# 4. 建议

* **新系统或 RBAC+ 完全升级**：不必维护 permission → resource × action

  * 直接用 resource × action × data_scope 做角色授权和前端按钮控制
* **兼容老系统**：保留 permission 表，并建立映射表

  * `permission_resource_action(permission_id, resource_id, action_id)`
  * 前端显示或审计功能仍可依赖 permission 表

---

# 5. 总结

| 维度                             | 是否必须 | 说明                      |
| ------------------------------ | ---- | ----------------------- |
| permission → resource × action | 可选   | 仅在兼容老系统或做统一统计/审计时需要     |
| resource × action              | 必须   | RBAC+ 核心授权粒度            |
| resource × action × data_scope | 必须   | RBAC+ 三维权限核心，决定最终数据访问范围 |

**原则**：

* 如果目标是“干净、可维护、全新 RBAC+”，只需要 resource × action × data_scope
* permission 仅做历史或标签层面使用




* any list
{:toc}