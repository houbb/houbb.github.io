---
layout: post
title: 权限体系之-102-IAM 系统 sso passport ums 的关系？
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# IAM 和 sso ums passport 的关系？

下面我把 **IAM、SSO、UMS、Passport** 之间的关系，用**体系化 + 超清晰**的方式讲透。这四个你都在做，但容易混淆边界，我给你一个业内通用、平台级的理解框架。

---

# 🧩 先一句话总概括

**IAM 是一个“超级集合”，SSO / UMS / Passport 都是 IAM 的子模块。**
你现在做的 UMS + Passport 实际是 IAM 的底座，但还不是一个完整的 IAM。

---

# 🧱 1. 各模块一句话定义

| 模块                                    | 作用                       | 是否属于 IAM                       |
| ------------------------------------- | ------------------------ | ------------------------------ |
| **UMS（User Management System）**       | 管理用户 / 组织 / 角色 / 属性      | ✔ IAM 的一部分（身份层 Identity）       |
| **Passport（认证中心）**                    | 登录、Token、Session、安全      | ✔ IAM 的一部分（认证层 Authentication） |
| **SSO（Single Sign-On）**               | 多系统统一登录                  | ✔ Passport 之上的应用能力             |
| **IAM（Identity & Access Management）** | 身份 + 认证 + 授权 + 策略 + 权限治理 | ⭐ 完整体系（最大集合）                   |

---

# 🧊 2. 它们之间的层级关系图（最清晰的解释）

```
                [ IAM 权限中心 ]
     ┌─────────────────────────────────┐
     │                                 │
     │   身份管理（UMS）               │  ← 用户、组织、角色、岗位、属性
     │   认证中心（Passport）         │  ← 登录、Token、MFA、风险识别
     │   单点登录（SSO）               │  ← 基于 Passport 的多系统统一登录
     │   授权中心（RBAC/ABAC）         │  ← 权限、策略、数据权限
     │   资源中心（API/菜单/按钮）     │
     │   审计中心（日志/追踪）         │
     │   策略引擎（Policy Engine）     │
     └─────────────────────────────────┘
```

简单说：

* UMS = “我是谁”
* Passport = “我怎么证明我是我”
* SSO = “我登录一次就行”
* IAM = “我有什么权限，我能干什么”

**IAM 是总管家，其他都是部门。**

---

# 🧱 3. 四者间最清晰责任边界（企业级）

## ① UMS —— 身份层（Identity Layer）

负责：

* 用户
* 组织（部门）
* 用户组
* 岗位、职级
* 用户属性（ABAC 的基础）
* 角色集合（RBAC 的基础）

UMS 关注 “**谁**”。

---

## ② Passport —— 认证层（Authentication Layer）

负责：

* 登录
* Session / Token
* 刷新 Token
* OAuth2 / OIDC（可选）
* MFA、风险识别（可选）

Passport 关注 “**如何证明我是我**”。

---

## ③ SSO —— 登录体验层（Single Sign-On）

负责：

* 全系统统一登录体验
* 各子系统 Token 派发
* 登录态保持
* 退出统一处理

SSO 关注 “**一次登录，全网通行**”。

注意：
**SSO 不做权限！只是登录！**

---

## ④ IAM —— 授权层（Authorization Layer）

负责：

* RBAC（角色权限）
* ABAC（属性权限）
* ReBAC（关系权限，未来趋势）
* 资源管理（菜单、按钮、接口、数据字段）
* 策略管理（Policy）
* 权限判定（Policy Engine）
* 权限审计与变更记录

IAM 关注 “**我能干什么？什么时候能干？能对谁干？**”

IAM = 身份 + 认证 + 授权 + 审计 + 策略。

---

# 🧩 4. 四者之间的完整调用链（你未来的平台会用到）

一个用户访问一个业务系统的完整链路：

```
Step1: 用户访问系统
Step2: 系统跳转到 Passport 登录（SSO 流程）
Step3: Passport 验证身份（密码/MFA设备/IP风险）
Step4: Passport 颁发 Token（JWT / Session）
Step5: 业务系统拿到 Token，请求 IAM 判断权限（RBAC/ABAC）
Step6: IAM 测策略：用户属性 + 资源属性 + 环境属性
Step7: IAM 返回 Allow / Deny
Step8: 业务系统根据结果执行业务逻辑
```

所以：

* **Passport 做 “你是谁”**
* **IAM 做 “你能干什么”**

这是两个环节，千万不能混。

---

# 🧨 5. 一个更好理解的现实类比

| 模块       | 类比现实世界                |
| -------- | --------------------- |
| UMS      | 公民数据库（记录所有人的信息）       |
| Passport | 出入境办证中心（颁发护照）         |
| SSO      | 机场快速通道（一次刷证即可进入多个区域）  |
| IAM      | 安检 + 门禁系统（决定你能进入哪些地方） |

所以：

* 拿到护照 ≠ 能进入任何区域
* SSO 只是减少刷卡次数
* IAM 才是决定权限的真正大脑

---

# 🧱 6. 你的 UMS + Passport 距离真正 IAM 还差什么？

你已经有：

✔ 用户 / 角色 / 权限（RBAC）
✔ 登录 / Token（Passport）
✔ 基础 SSO（通过 Token）

你还需要补：

### 核心能力（必补）

* **资源中心（API/按钮/菜单）统一抽象**
* **策略中心（ABAC）**
* **策略引擎**
* **数据级权限**
* **权限实时下发（Cache + Push）**

### 高阶能力（企业级）

* 权限变更审计
* 权限申请与审批（IAM 工作流）
* 系统接入 SPI（统一鉴权 SDK）
* 数百万级关系授权（Zanzibar）

完成这些，你平台就从 “SSO + RBAC” 升级为：

🔥 **企业级 IAM 权限中心**（对标阿里 / 字节 / 腾讯）

---

# 🎯 7. 最终一句话总结

**IAM = 身份（UMS） + 认证（Passport/SSO） + 授权（RBAC/ABAC） + 策略引擎 + 审计治理。**
**SSO 只负责登录，UMS 负责用户基本信息，IAM 才是权限大脑。**

# 正常在实现 IAM 平台的时候，一般拆分为几个子系统？我目前已有 ums passport sso

下面我把“**一个企业级 IAM 平台通常拆成哪些子系统**”讲得非常清晰，并且结合你的现状（已有：**UMS + Passport + SSO**）给出推荐架构。

这是所有大厂（阿里、腾讯、字节、华为）统一的拆分方式。

---

# 🧩 一、标准 IAM 平台一般拆成 **6～8 个子系统**

你已经完成了前两个，本质上已经站上了 IAM 一半山腰。

一个完整的企业级 IAM（身份与访问管理）通常包含：

---

# ✅ 1. UMS —— **用户与组织系统（Identity）**
你已经有了。

负责：

- 用户
- 部门 / 组织树
- 岗位 / 职级
- 用户属性（ABAC 基础）
- 租户（企业级可选）
- 用户生命周期（在职、离职等）

---

# ✅ 2. Passport —— **认证系统（Authentication）**
你也已经有了。

负责：

- 登录
- Token / Session
- 短信 / 邮箱 / MFA
- 登录风险识别
- 密码策略
- 第三方登录（OAuth2 / OIDC）

---

# ✅ 3. SSO —— **单点登录系统（Login Center）**
你也有了。

负责：

- 统一登录跳转
- 一次登录多系统通行
- 登出同步
- App / Web 登录打通

**注意：SSO 不做任何权限！只是登录入口统一化。**

---

到这里，你已有 3 个模块，但只是“身份 + 认证”。

真正的 IAM 还需要“授权 + 审计 + 策略 + 接入”。

---

# 🟧 4. **Auth 权限中心（Authorization Center）** ⭐重点

这是 IAM 的核心，需要独立为一个子系统。

**它决定用户 “能干什么”**。

功能：

### 🔸 RBAC（已有基础）
- 角色管理
- 权限组（system/module/page/button/api）
- 多维权限资源树

### 🔸 ABAC（需要补）
- 属性模型（User/Resource/Action/Environment）
- 策略管理
- 条件表达式（DSL）
- 数据级权限

### 🔸 统一鉴权接口（业务系统调用）
- checkPermission(user, resource, action, context)
- getUserPermissions(userId)

这个模块你现在还没有，是你下一步最重要的。

---

# 🟧 5. **ResourceCenter（资源中心：菜单、按钮、接口）**

为什么需要独立出一个 Resource Center？

因为你的“权限”和“资源”是互相依赖的。

资源中心负责：

- 系统注册：system / module
- 菜单管理
- 页面管理
- 按钮/操作点管理
- API 接口管理（URL + 方法）
- 数据资源模型（列、字段、表）

**权限系统引用资源系统，不耦合业务。**

这是大厂 IAM 必须拆开的模块。

---

# 🟧 6. **PolicyEngine（策略引擎）**

如果你要实现 ABAC / 数据权限，这个模块是必需的。

典型实现方式：

- 自研 DSL（推荐你基于 JsonLogic / SpEL）
- Casbin（支持 RBAC/ABAC）
- OPA Rego（通用）
- Cedar（AWS 授权模型，未来趋势）

功能：

- 策略解析
- 属性获取
- 权限判定（Allow / Deny）
- 缓存（百万级 QPS）
- 回溯与审计集成

---

# 🟩 7. **AuditCenter（审计中心）**

权限系统最大价值不止“有权限”，而是**审计 + 责任归因**。

审计系统负责：

- 登录审计（Passport）
- 访问审计（Auth）
- 权限变更审计
- 管理操作审计
- 查询溯源（谁看过谁的数据）
- 合规报表（SOX等）

很多企业最后最重视的反而是这个。

---

# 🟦 8. **AccessGateway（统一网关，可选）**

大公司一般会做一个统一网关（可选）：

- 统一鉴权  
- Token 校验  
- RBAC/ABAC 缓存验证  
- 流量隔离  
- 灰度  

如果你未来接入**几十个系统**，网关会非常必要。

---

# 🧱 总结：大厂 IAM 的典型子系统拆分结构

```
1.  UMS：用户组织系统（你已有）
2.  Passport：认证中心（你已有）
3.  SSO：统一登录系统（你已有）
4.  Auth：权限中心（权限模型、授权、判定）
5.  Resource Center：资源中心（系统/菜单/按钮/API）
6.  Policy Engine：策略引擎（ABAC、RBAC扩展）
7.  Audit Center：审计中心（访问、变更、登录）
8.  Access Gateway：统一网关（可选）
```

---

# 🔥 如果你要快速做成一个“企业级 IAM”，你可以这么拆：

## ⭐ 必须做（4 个）：

1. **UMS（已有）**
2. **Passport（已有）**
3. **SSO（已有）**
4. **Auth Center（你下一步）**

## ⭐ 建议做（2 个）：

5. **Resource Center（抽取资源体系）**
6. **Audit Center（审计与溯源）**

## ⭐ 进阶做（1 个）：

7. **Policy Engine（ABAC、数据权限）**

这样，你的平台就可以对标：

- 阿里 RAM + 授权中心  
- 腾讯 TAPD 权限中心  
- 字节 FireAuth  
- AWS IAM Policy 模型  


* any list
{:toc}