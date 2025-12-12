---
layout: post
title: 权限体系之-300-开放接口网关介绍
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# 问题

```
我发现一个问题，目前已经有 ums passport sso permission 4个平台，后管基本已经是实现。

但是想打造生态，肯定需要对外提供开放接口+SDK。

那么我有一些问题，开放接口的话，每个系统都要创建一个子系统，专门提供对外接口实现吗？还是直接复用后管的接口？
```

下面从架构、生态构建、治理、安全、研发效率四个维度，为你给出一个清晰、可落地的结论：**不建议每个系统额外创建一套“对外接口子系统”；而应该在现有系统内部抽象出“开放接口层（OpenAPI Layer）”，并通过 API Gateway + OAuth2.0/AK-SK/签名体系 做统一对外暴露。**

---

# 一、核心结论（短版）

你现在已有：

* **UMS（用户中心）**
* **Passport（认证中心）**
* **SSO（统一登录）**
* **Permission（权限中心）**

这些都是 **内部后管接口**，暂不适合直接对外公开。但你也不需要再建新的“外部接口子系统”。

最合理的方式是：

> **在每个平台内部抽象出一个“外部能力层（Open Capability Layer）”，只暴露必要的 API → 统一通过 API Gateway 对外发布，并提供对应语言的 SDK。**

---

# 二、为什么不能直接复用后管接口？

后管接口一般有以下问题：

## 1. 接口不稳定（业务驱动）

后管 API 随着运营需求随时变化：
字段、分页方式、过滤参数、响应结构、权限规则都会变。

对外开放的接口必须遵循：

* 不破坏性变更（Backward Compatible）
* 版本化（/v1 /v2）
* SLA（性能可控）
* 安全等级高

后管 API 无法满足。

## 2. 安全级别不同

后管接口基于内部员工场景
→ 权限大、数据面广、缺少节流策略。

开放 API 必须具有：

* request 签名（AK/SK）
* OAuth2 client credentials
* 限流（QPS 限制）
* 细粒度 scope
* 租户隔离

后管接口不能直接复用。

## 3. API 设计不适配外部开发者

对外 API 要满足：

* 更清晰的 domain
* 更轻量的响应
* 更稳定的生命周期管理
* 文档标准化（OpenAPI 3.1）

内部接口一般冗余字段多、耦合强，不适合外部使用。

---

# 三、是否需要每个系统单独做一个“外部接口子系统”？

**不需要建独立的子系统。**

应该采用如下架构：

## 模式 A：每个系统内部划分一个外部接口层（推荐）

```
UMS
 ├─ internal API（admin、后管）
 └─ external API（OpenAPI Layer） → Gateway → 外部客户

Passport
 ├─ internal API
 └─ external API（OAuth2、Token Issuing）

Permission
 ├─ internal API
 └─ external API（RBAC/ABAC 权限能力）
```

好处：

* 单系统内聚，不需要额外部署
* 明确内部 API / Open API 的边界
* 每个团队只需对本系统开放的能力负责
* 与公司未来“开放平台”一致

## 模式 B：做一个“统一的对外平台（Open Platform）”（当你生态足够大再考虑）

类似阿里云、腾讯云、字节开放平台。

职责：

* 聚合所有系统的 OpenAPI
* 对外统一鉴权、限流、计量、计费
* 提供统一 SDK

适用于平台达到百万级调用规模时再建设。

你现在阶段（0 → 1 → 10）不需要。

---

# 四、正确做法（从现在能落地的角度讲）

## Step 1：为每个系统内部抽象出 OpenAPI Layer

例如：

### UMS OpenAPI

* createUser
* updateUser
* getUser
* searchUser
* user lifecycle

### Passport OpenAPI

* OAuth2 token issuing
* introspection
* refresh token

### Permission OpenAPI

* check-permission
* list-user-perms
* list-resources
* multi-policy evaluation（ABAC）

## Step 2：OpenAPI 不直接暴露，必须通过 API Gateway

Gateway 负责：

* 限流
* 统一签名校验
* OAuth2
* 请求日志
* IP 白名单
* 缓存策略（例如账号/权限结果缓存）

## Step 3：为外部生态提供 SDK

建议提供：

* Java
* Python
* JavaScript/TypeScript
* Go

SDK 功能：

* 封装鉴权（AK/SK 或 OAuth2）
* 自动 Retry
* 统一异常模型
* 简化调用

## Step 4：接口文档用 OpenAPI 3.1（推荐）

然后自动生成：

* 人类文档（Redoc / Stoplight）
* SDK 客户端
* 测试 Mock Server

---

# 五、你真正在构建的是：“平台生态三件套”

每个要做生态的平台（阿里、腾讯、字节）都有：

## 1. OpenAPI

一套可控、稳定、标准化的外部接口。

## 2. API Gateway

统一入口，统一安全策略。

## 3. SDK

提高外部研发接入效率，降低调用复杂度。

你已经有 70% 的基础（UMS / Passport / SSO / Permission）。
只需要补**OpenAPI Layer + Gateway 规则 + SDK**即可完全具备生态能力。

---

# 六、你的具体落地建议（直接 actionable 的）

## 1. 为每个平台新增一个模块：open-api

例如：

```
ums
 ├─ admin-api
 ├─ internal-api
 └─ open-api
```

## 2. open-api 需要遵循的规范

* 字段可读性强
* 版本号必须有
* 避免破坏性变更
* 尽量 RESTful
* 分页、过滤统一标准
* 使用标准错误码体系（千万不要把后管错误直接暴露出去）

## 3. Gateway 层

可以选：Kong、Apinto、Tyk、APISIX、Nginx+自研插件。

能力：

* 认证（OAuth2 / AK-SK）
* 鉴权（scope）
* 限流（QPS）
* 日志审计（外部客户必须审计）
* 黑白名单
* 签名校验（timestamp + nonce）

## 4. SDK 规则

* 通过 OpenAPI 自动生成
* 不要暴露错误的内部字段
* 指标采集（耗时、失败率）

---

# 七、总结（一句话原则）

> 内部接口和对外接口必须隔离。
> 不需要为对外接口建立独立子系统。
> 每个系统内部抽象 OpenAPI Layer → 通过 Gateway 暴露 → 提供 SDK → 形成生态。

* any list
{:toc}