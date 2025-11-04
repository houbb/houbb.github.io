---
layout: post
title: ums 产品矩阵-02-UMS 系统介绍
date: 2024-08-05 21:01:55 +0800
categories: [SSO]
tags: [sso, open-source, ums, priviliage, sh]
published: true
---

# chat

## 详细展开介绍一下 UMS

因为 **UMS（User Management System，用户管理系统）** 是整个身份体系的“根”，

你可以把它理解成企业的「用户底座」，所有后续的认证、授权、SSO、Passport 都是从这里延伸出去的。

下面我会带你系统地讲清楚 **UMS 是什么、要解决什么问题、应该包含哪些核心模块、架构设计思路、以及未来如何扩展成身份中台（IAM）**。

---

## 🧩 一、UMS 是什么？（定位）

> **UMS（用户管理系统）** 是一个管理企业内部和外部所有用户账号、身份信息、组织关系和基础权限的核心系统。
> 它的核心目标是：
> 为企业提供一个**统一的用户模型和账号入口**，从而支撑登录、注册、认证、权限、审计、集成等所有上层能力。

换句话说，**UMS 是“人”的主数据系统（User Master Data System）**，
在 IT 架构中，它和 CMDB（设备主数据）、PMS（项目主数据）、AMS（应用主数据）地位是对等的。

---

## 🧠 二、UMS 要解决的核心问题

| 问题                   | 说明                       |
| -------------------- | ------------------------ |
| **账号分散**             | 每个系统都有自己的一套用户表，导致注册、管理混乱 |
| **认证不统一**            | 不同系统的密码规则、登录逻辑不同         |
| **用户重复**             | 员工/客户信息在不同系统中重复存在        |
| **组织关系不一致**          | 部门、岗位、上下级关系在不同系统中不匹配     |
| **权限逻辑分散**           | 每个系统独立定义角色权限，无法统一审计      |
| **无法扩展SSO或Passport** | 缺乏统一的用户ID和身份标识体系         |

所以——
UMS 的作用就是 **抽象出一个全企业共享的“用户与组织模型”，并对外提供统一的管理、查询和鉴权接口**。

---

## 🏗️ 三、UMS 的核心功能模块

可以分成 6 大模块👇：

---

### **1️⃣ 用户管理模块**

负责用户的**全生命周期管理**：

| 功能        | 描述                          |
| --------- | --------------------------- |
| 用户注册 / 创建 | 支持自注册、管理员创建、同步导入（LDAP、HR系统） |
| 用户信息管理    | 昵称、手机号、邮箱、岗位、扩展属性等          |
| 用户状态管理    | 激活 / 禁用 / 注销 / 冻结           |
| 用户搜索与导出   | 支持多条件检索、分页导出                |
| 用户标签 / 分组 | 用于多维度分类管理                   |

> ⚙️ 数据示例：

```sql
user_id | username | phone | email | status | org_id | tenant_id | extend_json
```

---

### **2️⃣ 认证模块（Authentication）**

负责用户的登录、认证逻辑。

| 功能         | 描述                                 |
| ---------- | ---------------------------------- |
| 密码登录       | 支持加盐哈希存储（BCrypt、Argon2）            |
| 短信/邮箱验证码登录 | 适合移动端或访客                           |
| 第三方登录      | 微信 / 钉钉 / Google / LDAP / SAML 等   |
| Token 机制   | JWT / Access Token / Refresh Token |
| 双因素认证（2FA） | 支持 TOTP / 邮箱验证码二次验证                |

> 💡 建议：
> UMS 自身可以提供基础认证接口（/login、/logout、/refreshToken），
> 但真正统一的 SSO 由「认证中心」在上层实现。

---

### **3️⃣ 用户目录（Directory）**

负责管理**组织结构、部门、岗位、层级关系**。

| 功能      | 描述                     |
| ------- | ---------------------- |
| 组织树结构管理 | 支持多层级部门树（公司→事业部→部门→小组） |
| 岗位/职级管理 | 岗位模板定义，与用户绑定           |
| 上下级关系   | 支持领导-下属、汇报链            |
| 同步外部系统  | HR、OA、AD 等系统定期同步       |
| 数据隔离    | 支持按租户/部门划分用户范围         |

> ⚙️ 数据模型建议：

* `organization` 表（树形结构）
* `position` 表（岗位定义）
* `user_org_relation` 表（多对多关系）

---

### **4️⃣ 授权与角色模块（Authorization / RBAC）**

虽然 Passport 才是权限中台，但在 UMS 阶段可以具备「轻量级 RBAC」。

| 功能      | 描述                                          |
| ------- | ------------------------------------------- |
| 角色管理    | 定义角色、角色描述                                   |
| 用户-角色绑定 | 多角色支持                                       |
| 角色-资源绑定 | 权限粒度：菜单 / 按钮 / API                          |
| 权限缓存    | 支持 Redis 缓存授权结果                             |
| 权限验证接口  | 提供 `/hasPermission(user, action)` 接口供业务系统调用 |

> ⚙️ 数据模型：

* `role`（角色定义）
* `user_role`（用户角色绑定）
* `role_permission`（角色与权限的映射）

---

### **5️⃣ 审计与安全模块**

| 功能   | 描述                   |
| ---- | -------------------- |
| 登录日志 | 登录IP、设备、时间、结果        |
| 操作审计 | 用户修改信息、角色变更          |
| 异常告警 | 登录失败次数过多、IP 异常登录     |
| 风控策略 | 结合设备指纹、地域判断可疑登录      |
| 审计接口 | 向 SIEM / ELK 输出安全日志流 |

---

### **6️⃣ 接口与接入模块**

为上层 SSO、Passport、其他业务系统提供统一接口：

| 功能       | 描述                             |
| -------- | ------------------------------ |
| 用户服务 API | CRUD、查询、分页                     |
| 登录接口     | /login /logout /refreshToken   |
| 权限验证接口   | /checkPermission /getRoles     |
| 外部系统同步   | Webhook / MQ / SDK             |
| SDK 封装   | 提供 Java / Python / Go SDK 简化集成 |

---

## ⚙️ 四、UMS 的系统架构设计

### **1️⃣ 核心架构图**

```
          ┌───────────────────────────┐
          │         Portal            │
          │  （统一登录入口）         │
          └──────────┬────────────────┘
                     │
                     ▼
         ┌────────────────────────────┐
         │          UMS API            │
         │  - 用户管理                 │
         │  - 登录认证                 │
         │  - 用户目录（组织）         │
         │  - 基础授权（RBAC）        │
         │  - 审计与日志              │
         └──────────┬────────────────┘
                    │
   ┌────────────────┴────────────────┐
   │                                 │
   ▼                                 ▼
业务系统 A                       业务系统 B
通过 Token / SDK 调用 UMS API   通过 Token / SDK 调用 UMS API
```

---

### **2️⃣ 技术选型建议**

| 模块     | 推荐技术                               |
| ------ | ---------------------------------- |
| 后端     | Spring Boot / NestJS / Go Fiber    |
| 安全框架   | Spring Security / Keycloak Adapter |
| 存储     | MySQL / PostgreSQL                 |
| 缓存     | Redis（Session / Token 缓存）          |
| 搜索     | ElasticSearch（用户搜索）                |
| 消息     | Kafka / RocketMQ（同步事件）             |
| 日志     | ELK / Loki                         |
| API 接入 | Swagger / OpenAPI / GraphQL        |
| 外部集成   | LDAP / SAML / OAuth2               |

---

## 🧩 五、数据模型示例（简化版）

```sql
-- 用户表
CREATE TABLE ums_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) UNIQUE,
  password VARCHAR(128),
  phone VARCHAR(32),
  email VARCHAR(64),
  status TINYINT DEFAULT 1,
  org_id BIGINT,
  tenant_id BIGINT,
  extend_json JSON,
  created_at DATETIME,
  updated_at DATETIME
);

-- 角色表
CREATE TABLE ums_role (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64),
  code VARCHAR(64) UNIQUE,
  description VARCHAR(256)
);

-- 用户角色绑定表
CREATE TABLE ums_user_role (
  user_id BIGINT,
  role_id BIGINT,
  PRIMARY KEY (user_id, role_id)
);

-- 组织表
CREATE TABLE ums_organization (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64),
  parent_id BIGINT,
  level_path VARCHAR(256)
);
```

---

## 🧭 六、UMS 的演进路线

| 阶段         | 功能目标          | 对应系统              |
| ---------- | ------------- | ----------------- |
| 1️⃣ 基础用户管理 | 用户注册/登录/组织关系  | UMS               |
| 2️⃣ 单点登录   | 登录凭证统一、跨系统免登录 | SSO               |
| 3️⃣ 权限统一   | 角色/资源/策略统一    | Passport          |
| 4️⃣ 身份网关   | API 层统一鉴权     | IAM Gateway       |
| 5️⃣ 身份中台   | 多租户、多身份、多来源融合 | Identity Platform |

---

## 🚀 七、UMS 的关键设计哲学

1. **一个用户，全公司唯一标识（Global UID）**
   → 不管在哪个系统出现，都指向同一个 `user_id`。

2. **一切可扩展（Extensible Everything）**
   → 用户表留 `extend_json`；组织支持多层级；权限模型支持扩展。

3. **以接口为中心（API-first）**
   → 所有模块都暴露 REST / GraphQL 接口，方便系统间集成。

4. **事件驱动（Event-driven）**
   → 用户变更通过 MQ 推送到其他系统（同步用户画像、权限刷新）。

5. **安全优先（Security by Design）**
   → 加密、日志、风控、Token 生命周期设计必须从一开始考虑。

# 参考资料

* any list
{:toc}