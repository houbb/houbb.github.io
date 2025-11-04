---
layout: post
title: ums 产品矩阵-01-概览
date: 2024-08-05 21:01:55 +0800
categories: [SSO]
tags: [sso, open-source, ums, priviliage, sh]
published: true
---

# chat

## 企业如果想基于 ums(用户管理) 打造相关的服务矩阵，比如 sso（全公司统一登录门户）、passport（全公司的企业级权限管理），如何进行

如果一家企业已经有了 **UMS（User Management System，用户管理系统）**，并想进一步构建出类似 **企业级 SSO（统一登录）**、**Passport（统一身份与权限中心）** 等服务矩阵，那么可以按照以下体系化路径来设计。

---

## 🧩 一、目标：从「用户管理」走向「身份中台」

UMS 通常只负责：

* 用户的基本信息（账号、手机号、邮箱、角色等）
* 用户的注册、登录、修改资料
* 简单的认证逻辑

要升级为企业级服务矩阵，核心目标是：

> 把 UMS 打造成「身份中台（Identity Platform）」——即支持统一登录、统一鉴权、统一权限管理的能力，供公司内外部系统复用。

---

## 🏗️ 二、整体架构演进思路

可以分为四层演进：

### **1️⃣ 用户中心（UMS） → 身份认证中心（SSO）**

**目标：统一登录入口，解决多系统账号重复登录的问题。**

* **核心能力**

  * 单点登录（SSO）
  * OAuth2 / OpenID Connect 支持
  * 多租户/多应用账号管理
  * 会话统一管理与注销

* **典型方案**

  * 登录后颁发 JWT / Access Token（或 session ticket）
  * 各子系统通过 Redirect + Token 验证实现免密登录
  * 可嵌入公司门户（Portal）或自研统一登录页

* **可选实现**

  * 自建（Spring Authorization Server、Keycloak）
  * 接入（Auth0、Okta、Azure AD）

---

### **2️⃣ 身份认证中心 → 企业级权限中心（Passport）**

**目标：统一用户的访问控制，集中管理角色/权限。**

* **核心能力**

  * 用户 → 角色 → 权限（RBAC）
  * 权限粒度（菜单 / 接口 / 数据行 / 字段）
  * 策略式访问控制（ABAC、PBAC）
  * 动态权限下发与缓存
  * 应用注册与授权（App Registry）

* **设计关键点**

  * 权限模型抽象（多维：资源类型 + 操作 + 条件）
  * 授权策略存储（policy 表）
  * 多系统同步：通过 SDK / API / Webhook 同步权限变更
  * 日志与审计（谁访问了什么、有没有越权）

* **技术选型**

  * Spring Security + 自研 ACL
  * Casbin（高扩展性策略模型）
  * Keycloak Authorization Services

---

### **3️⃣ Passport → 统一身份接入层（IAM Gateway）**

**目标：统一公司级访问入口，对接所有系统的身份与权限。**

* **功能扩展**

  * API Gateway 集成 Token 验证
  * 服务间调用统一签发凭证（Service Token）
  * SSO 与内部微服务调用打通
  * 企业内部账号与第三方账号（如钉钉、飞书）打通

* **支持多来源身份**

  * 内部员工（HR系统）
  * 外部合作伙伴（B2B）
  * 客户/用户（B2C）
  * 机器身份（Service Account）

---

### **4️⃣ IAM Gateway → 企业级身份中台（Identity Fabric）**

**目标：企业所有应用的身份基座。**

* 统一账号体系（Identity Unification）
* 统一登录体验（跨系统、跨端）
* 统一安全审计（登录日志、访问行为）
* 统一授权策略（零信任访问控制）
* 对外输出 SDK / API / Agent，方便各业务系统快速接入

---

## 🧠 三、核心设计要点

| 模块           | 核心要点                               | 推荐实现方式                        |
| ------------ | ---------------------------------- | ----------------------------- |
| **用户模型**     | 支持多租户、多身份、多组织关系                    | user_id、tenant_id、org_id 三层结构 |
| **认证机制**     | 统一支持 OAuth2 / OIDC / SAML          | 统一认证中心（SSO）                   |
| **授权模型**     | RBAC → ABAC 演进                     | Casbin / 自研 Policy Engine     |
| **Token 管理** | JWT / Access Token / Refresh Token | 支持短期令牌+刷新机制                   |
| **多系统接入**    | SDK + OpenAPI + Webhook            | 业务系统通过 SDK 鉴权                 |
| **审计日志**     | 登录 / 授权 / 异常访问                     | 统一日志服务+告警系统                   |
| **门户层**      | 企业门户（统一入口）                         | 登录→跳转到业务系统                    |
| **扩展能力**     | 二次开发接口 / 插件体系                      | 模块化身份中台                       |

---

## 🧩 四、典型落地路径（可借鉴）

| 阶段  | 目标       | 关键产出                  |
| --- | -------- | --------------------- |
| 阶段1 | SSO 登录打通 | 登录中心 + OAuth2 服务      |
| 阶段2 | 权限中心统一   | Passport 服务 + RBAC 模型 |
| 阶段3 | 鉴权统一     | SDK 接入所有系统            |
| 阶段4 | 安全中心化    | 审计、告警、风险控制            |
| 阶段5 | 对外输出     | 对外提供认证网关或 IDaaS 能力    |

---

## 💡 五、可参考的开源项目

| 场景        | 推荐项目                                       | 说明                          |
| --------- | ------------------------------------------ | --------------------------- |
| 统一登录（SSO） | **Keycloak** / Spring Authorization Server | 完整的 OIDC / SAML / OAuth2 实现 |
| 权限中心      | **Casbin** / **OPA (Open Policy Agent)**   | 支持 ABAC / 策略授权              |
| 企业门户      | **Next.js + OAuth2 client**                | 用于统一入口                      |
| 审计日志      | **ELK / Loki / Grafana**                   | 登录与权限审计                     |
| 企业级 IAM   | **Keycloak + Casbin + Spring Gateway**     | 常见组合方案                      |

---

## 🚀 六、总结：UMS → Passport 服务矩阵的本质

| 阶段                    | 能力提升   | 意义   |
| --------------------- | ------ | ---- |
| 1️⃣ UMS               | 管理用户信息 | 数据层面 |
| 2️⃣ SSO               | 统一认证   | 登录层面 |
| 3️⃣ Passport          | 统一授权   | 权限层面 |
| 4️⃣ IAM Gateway       | 统一鉴权入口 | 接入层面 |
| 5️⃣ Identity Platform | 企业身份中台 | 战略层面 |

# 参考资料

* any list
{:toc}