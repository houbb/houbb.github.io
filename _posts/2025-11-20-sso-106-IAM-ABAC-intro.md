---
layout: post
title: 权限体系之-106-ABAC 是什么？
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# 1. ABAC 是什么？

**ABAC（Attribute-Based Access Control）= 基于属性的访问控制**

核心思想：

> **不再仅仅根据用户所属角色来授权，而是根据用户、资源、行为、环境的“属性”组合动态决定是否允许访问。**

换句话说，它是通过**规则引擎 + 属性（Attributes）**来实现的更动态、更细的授权模型。

---

# 2. ABAC 的关键四类属性（Attributes）

ABAC 的核心是 Attribute，这些 Attribute 本质上是一组**键值特征**：

## 2.1 User Attributes（用户属性）

常见如：

* user.id
* user.dept_id
* user.job_level
* user.is_admin
* user.location
* user.tags → ["研发", "北京"]

用于表达用户本身的身份特征。

---

## 2.2 Resource Attributes（资源属性）

对请求访问的资源进行描述，比如：

* resource.owner_id
* resource.dept_id
* resource.visible_level
* resource.is_private
* resource.tags → ["财务报表"]

资源可不是只指 API，也可以是：

* 数据行（row）
* 字段（column）
* 文件（file）
* 页面（page）

---

## 2.3 Action Attributes（行为属性）

通常是用户要执行什么操作：

* action = "read" / "write" / "approve" / "export"
* api_method = GET / POST
* api_category = "财务审批"

你的 RBAC+ action_definition 就属于这个层级。

---

## 2.4 Environment Attributes（环境属性）

常用于“合规限制”与“动态权限”：

* env.time = 10:30
* env.weekday = Monday
* env.ip = "10.1.100.23"
* env.device = "mobile"
* env.is_vpn = true
* env.risk_level = LOW / HIGH

例：

限制“非办公时间禁止下载文件”
限制“只有在企业网内才允许审批订单”

---

# 3. ABAC 的本质是什么？

一句话总结：

> **ABAC = 使用属性（Attributes）+ 策略规则（Policy）来动态决定是否允许访问。**

RBAC 是角色赋予权限 → 静态
ABAC 是属性驱动策略 → 动态

策略通常类似：

```
allow if:
  user.dept_id == resource.dept_id
  AND user.job_level >= 3
  AND action == "read"
  AND env.ip in CORPORATE_IP_RANGE
```

ABAC 的典型表达方式：

* JSON 规则（常用于企业平台）
* DSL 策略语言（AWS IAM Policy）
* XACML（古典但强大的 XML 标准）
* CEL（Google 推荐的策略语言，轻量表达式）

---

# 4. ABAC 解决了 RBAC 的哪些痛点？

企业中 RBAC 最大的问题是：

### RBAC 无法精细到“数据级别”

例如：

* 某用户只能看自己部门的订单
* 财务人员能看所有订单金额，但客服只能看订单状态
* 经理可以导出本部门的报销单，但不能导出其他部门

RBAC 本身只能做到：

* 是否可访问某个 API（粗粒度）

无法做到：

* 可访问 API 但只能看到自己部门的数据（细粒度）

这类需求必须由 ABAC 的 data_scope 来解决。

---

# 5. ABAC 的企业应用场景

下面是企业中 ABAC 典型场景（你未来 permission-plateform 都会支持）：

| 场景      | 示例                 |
| ------- | ------------------ |
| 数据级权限控制 | “用户只能查看本部门订单”      |
| 数据行控制   | “HR 只能查看自己负责区域的员工” |
| 字段级权限控制 | “客服不能查看订单金额字段”     |
| 动态访问限制  | “夜间不允许导出文件”        |
| 地理位置限制  | “国外访问禁止审批”         |
| 设备风险控制  | “手机设备不能执行删除操作”     |

---

# 6. ABAC in permission-plateform（落地分析）

你的平台当前已经有：

* user
* role
* permission（UI/API/BUTTON）
* RBAC（role_permissions）
* RBAC+ action
* RBAC+ data_scope

接下来要让它支持 ABAC，只需要继续扩展：

---

# 6.1 ABAC 在你的平台中分为 3 层：

## 层 1：基础属性层（Attribute Provider）

从系统中提供属性：

* UserAttributeProvider
* ResourceAttributeProvider
* EnvironmentProvider
* ActionAttributeProvider（你已具备）

输出结构：

```json
{
  "user.dept_id": 101,
  "user.level": 5,
  "resource.dept_id": 101,
  "action": "read",
  "env.time": "2025-01-20T10:23:00+08:00",
  "env.ip": "10.1.1.2"
}
```

---

## 层 2：策略定义层（Policy）

一个策略结构如下（示例 JSON）：

```json
{
  "policy_code": "only-dept-users-can-view",
  "description": "只允许本部门用户读取本部门资源",
  "effect": "allow",
  "condition": "user.dept_id == resource.dept_id && action == 'read'"
}
```

策略可以存在一个单独的表：

```
abac_policy
```

未来会扩展：

* 策略组
* 策略优先级
* 兼容 CEL 表达式执行

---

## 层 3：策略引擎（Policy Engine）

一个 ABAC 判定请求步骤如下：

```
1. 收集全部属性（Attributes）
2. 根据 action/resource 匹配到策略规则
3. 规则表达式执行
4. 返回 allow / deny
```

半秒内完成。

---

# 7. 为什么企业最终都从 RBAC → RBAC+ → ABAC？

总结如下：

## 7.1 RBAC：可管角色级别，但无法管“数据级”

适用于：

* 菜单权限
* API权限
* 操作按钮权限

局限：

* 无法控制某人只能看本部门的数据

---

## 7.2 RBAC+：可管 CRD + 数据范围

适用于：

* 某人只能操作特定动作（approve/export/delete）
* 某人只能查看“本部门、本公司、全部”等数据范围

比 RBAC 有用，但仍然“半动态”。

---

## 7.3 ABAC：最高级、最灵活

可根据：

* 用户属性
* 资源属性
* 行为属性
* 环境属性

动态生成权限决策。

成为：

> 政企、安全、金融行业的权限模型标准方式。

---

# 8. ABAC 和权限表 permission 的关系

非常关键：

### permission =

* 菜单
* API
* 按钮
* 页面资源

### action / data_scope =

* 动作
* 数据范围
* 数据过滤表达式

### ABAC policy =

* 动态规则
* 数据级策略
* 属性比对规则

三者互补，而非替代关系。

---

# 9. permission-plateform 的未来演进路线（专业建议）

建议路线（也是大型企业 IAM 的路线）：

### 阶段 1：RBAC（你已完成）

* 菜单、API、按钮权限
* 角色管理
* 用户授权

---

### 阶段 2：RBAC+（你正在做）

* action_definition
* data_scope
* role_action
* role_data_scope

---

### 阶段 3：轻量 ABAC

* 只支持数据范围条件，比如 “dept = user.dept”
* 表达式语言轻量（SpEL/CEL）

---

### 阶段 4：全量 ABAC

* 属性中心
* 策略中心（可视化策略编辑器）
* 动态决策引擎（Policy Engine）
* 数据脱敏字段
* 规则优先级
* 合规审计与风险决策


* any list
{:toc}