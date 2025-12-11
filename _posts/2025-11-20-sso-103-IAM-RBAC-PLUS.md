---
layout: post
title: 权限体系之-103-IAM 系统 什么是 RBAC+（增强型 RBAC / RBAC Plus）？
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# 什么是 RBAC+（增强型 RBAC / RBAC Plus）？

这不是概念科普，而是偏“企业级权限架构设计”的内容。

# 1. RBAC+ 是什么（一句话精准定义）

> **RBAC+ = 以经典 RBAC 为核心，融合资源权限、层级角色、数据权限、操作权限、多维策略等扩展能力的企业级增强版权限模型。**
>
> 它不是 ABAC，但比 RBAC 更强，可覆盖 80% 的企业权限场景。

也常被叫做：

* Enhanced RBAC
* RBAC Extended Model
* RBAC 2.0
* 企业级 RBAC（Enterprise RBAC）
* RBAC with Context

---

# 2. RBAC+ 的本质：加强五个领域

传统 RBAC = 用户 → 角色 → 权限
但企业需求远超这三个维度。

因此 RBAC+ 主要强化以下五点：

## 2.1 资源模型增强（Resource-Based RBAC）

权限不再只是“角色关联 API”，而是结构化资源，例如：

* 系统 / 应用
* 菜单 / 页面
* API
* 按钮 / 动作
* 数据对象
* 字段

RBAC+ 允许权限绑定到任意资源节点。

---

## 2.2 角色增强（Hierarchical Roles）

支持**角色继承**与**多层级角色体系**：

例如：

```
员工 → 主管 → 经理 → 总监
```

权限自动向上继承。

---

## 2.3 数据权限增强（Data Permission）

传统 RBAC 无法处理企业数据行级、列级的权限。
RBAC+ 提供以下能力：

* 行级权限（如：只能看本部门订单）
* 列级权限（如：金额字段加密）
* 条件过滤（如：地区=华东）

例如：

```
资源: 订单列表
权限: order:list
数据范围: dept_id=xxx 或 creator=本人
```

---

## 2.4 操作权限增强（Action Permission）

绑定到 UI 操作：

* 按钮（新增/删除）
* 批量操作
* 导入/导出
* 流程动作（审批/驳回）

例如：

```
resource: user:list
actions: [add, edit, delete, export]
```

---

## 2.5 多级授权 + 组织架构

RBAC+ 支持：

* 组织维度权限
* 岗位维度权限
* 用户组维度权限
* 系统/租户隔离
* 代理授权（Delegate）
* 临时授权（Time Bound）

---

# 3. RBAC+ 的典型结构图（企业级）

传统 RBAC 是三张表：

* user
* role
* permission

RBAC+ 通常至少有：

```
user
role
role_hierarchy
group
org
job
resource
resource_action
policy
data_scope
role_resource
user_role
user_group
user_org
```

角色不再是唯一的授权主体，组织/岗位/用户组都可以授予权限。

---

# 4. RBAC+ 与 RBAC / ABAC 的区别

## 4.1 RBAC vs RBAC+

| 维度      | RBAC    | RBAC+               |
| ------- | ------- | ------------------- |
| 资源类型    | 单一（API） | 多维（菜单、API、按钮、数据、字段） |
| 数据权限    | 无       | 有（行/列/字段）           |
| 角色体系    | 扁平      | 支持继承、多级结构           |
| UI 操作权限 | 不支持     | 支持（按钮、操作、事件）        |
| 多主体授权   | 无       | 组织/岗位/用户组/租户        |
| 灵活性     | 低       | 高                   |
| 企业适配    | 中       | 非常强                 |

---

## 4.2 RBAC+ vs ABAC

ABAC（属性权限）基于“属性 + 策略规则”做权限控制。

RBAC+ 更注重：

> 能在 **角色驱动** 下覆盖绝大多数场景
> 且 **不使用复杂策略系统**。

企业大规模权限治理时，RBAC+ 的可控性、易治理性远高于 ABAC。

通常组合为：

* **RBAC+ 管 80% 权限（菜单/API/按钮/数据范围）**
* **ABAC 兜底 20% 复杂策略（比如跨部门审批、动态权限）**

---

# 5. 哪些公司使用 RBAC+？

| 公司   | 权限体系                        |
| ---- | --------------------------- |
| 阿里   | RABC+（角色为主，策略为辅，含数据级权限）     |
| 字节跳动 | RBAC+（含流程权限、动作权限、组织维度、数据维度） |
| 腾讯   | RBAC+ + 轻量 ABAC             |
| 京东   | RBAC+（+RBAC-P 数据范围模型）       |
| 华为   | RBAC+（岗位、组织、资源和数据权限组合）      |
| SAP  | RBAC+（组织、岗位、资源、多级角色）        |

通用结论：

> 企业实际用的不是 RBAC 或 ABAC，而是 **RBAC+ + 部分 ABAC 政策**。

---

# 6. 你在 permission-plateform 中应该采用的 RBAC+ 形态

根据你的平台定位，我建议你的权限模型为：

## **RBAC+ 完整模型 = 资源中心（R） + 角色（R） + 数据权限（D） + 操作权限（A） + 组织（O）**

即 ROA（Resource-Org-Action）+ RPD（Row Permission Domain） 的组合。

### 建议支持的五大类资源：

1. **菜单资源**（菜单/页面）
2. **API 资源**（Rest API）
3. **按钮资源**（UI 操作）
4. **操作资源**（审批动作、导出、下载等）
5. **数据范围资源**（dept、自定义 SQL 条件）

---

# 7. permission-plateform 的 RBAC+ 权限结构示例

一个权限点可被结构化为：

```
{
  "resource": "order",
  "action": ["view", "edit", "delete", "export"],
  "data_scope": "dept_only"
}
```

一个角色包含：

```
role:
  id: 2
  name: "订单管理员"
  resources:
    - order:view
    - order:edit
    - order:data:dept_only
    - user:view
```

用户最终权限由：

> 用户 → 角色 + 组织 → 资源 + 数据权限 + 按钮权限

综合构成。

---

# 8. RBAC+ 的优势（相比 RBAC）

| 优势          | 具体体现                |
| ----------- | ------------------- |
| ✔ 可治理       | 不会像纯 RBAC 那样爆炸性角色膨胀 |
| ✔ 权限颗粒度细    | 菜单/API/按钮/数据都统一管理   |
| ✔ 支持组织策略    | 角色可以继承组织权限          |
| ✔ 兼容 ABAC   | 可混合使用属性策略           |
| ✔ 前后端统一资源体系 | 易扩展、自动扫描            |

---

# 9. RBAC+ 的落地步骤（可直接用在你的项目）

1. **搭建资源中心（核心）**

   * API 自动扫描
   * 前端菜单 & 按钮自动上报

2. **定义资源模型（五类资源）**

3. **构建角色体系（层级 + 岗位 + 组织）**

4. **添加数据层级权限**

5. **引入 ABAC（按需）**

6. **提供授权中心 UI**

7. **权限校验（API + 前端按钮）统一框架**

8. **审计日志（谁访问了什么）**

---

# 10. 总结一句话

> **RBAC+ = RBAC（角色） + Resource（多维资源） + Action（操作） + DataScope（数据范围） + Organization（组织） 的企业级权限模型。**

它比 RBAC 强得多，比 ABAC 简单得多，恰好是企业权限系统的最佳中间点。



* any list
{:toc}