---
layout: post 
title: core-plateform-01-overview 整体规划概览
date: 2026-07-14 21:01:55 +0800
categories: [Core]
tags: [core]
published: true
---


# 目标

我们要把下面的平台打造成为其他服务的基石。

技术选型前期就是 maven+springboot+vue3 java 技术栈。  

数据库最好是可以内置 sqllite 让程序无额外依赖，后期也方便拓展替换为 mysql，暂时不要引入 redis/mq 之类的，保持架构简洁。 

全部 core-xxx，保持统一性，后期为全部开源，作为一切的基石。    

只保留三层。

第一层：Core Platform（唯一优先级）

这是所有产品共同依赖的基础设施。

```
Identity（用户、组织、认证、权限）
Billing（支付、订阅、额度、对账）
Notification（邮件、短信、站内信、IM、Webhook）
AI Gateway（统一模型接入、Prompt、Agent、额度）
File & Object Storage（文件、对象存储）
Workflow（事件、任务、自动化）
API Gateway（统一 API、鉴权、限流）
Marketplace（插件、应用、模板）
```

# 整体规划

我认为，这个方向比你之前规划的几十个平台更接近真正的平台化思路。

但是，如果目标是**「一个人 + Java + SpringBoot + Vue3，在 2026 年做出真正能长期演化的平台」**，我还是会继续做减法。

---

# 我的总体评分

**方向：9.8/10**

唯一的问题：

> **还是有点大。**

里面有几个模块，不应该属于 Core Platform。

真正的 Core，应该满足一个标准：

> **如果删掉它，其它所有系统都会痛苦。**

只有满足这个标准，才应该放 Core。

---

# 先看整个 Core

```
core-identity
core-billing
core-notification
core-ai
core-storage
core-workflow
core-api
core-marketplace
```

我会逐个评价。

---

# ⭐⭐⭐⭐⭐ core-identity（100分）

这是第一优先级。

没有任何讨论空间。

以后：

所有系统

```
blog
trade
wiki
monitor
cms
forum
ai
```

全部依赖它。

里面包括：

```
User
Organization
Role
Permission

OAuth2
JWT
Session

Email Login
Password Login
Verification Code

OpenAPI Key

Audit Log

System

Tenant（以后）
```

这一块以后几乎不会推翻。

所以值得打磨。

---

# ⭐⭐⭐⭐⭐ core-notification（100分）

我甚至建议第二个做。

原因非常简单。

以后任何产品都会需要：

```
注册

验证码

异常

审批

支付

订单

AI完成

监控报警

营销

公告
```

全部依赖 Notification。

而且通知以后越来越复杂。

```
Email

SMS

Webhook

IM

Push

站内信

Voice
```

所以：

所有消息

全部抽象成

```
Notification

↓

Channel

↓

Provider
```

以后增加 Provider 就行。

---

# ⭐⭐⭐⭐⭐ core-ai（100分）

2026，没有 AI Gateway，平台就是残缺的。

以后所有产品：

```
聊天

生成

翻译

总结

Agent

Workflow

自动审批

知识库

交易分析
```

都会依赖 AI。

建议抽象：

```
Model

Conversation

Prompt

Tool

Agent

Knowledge

Embedding

Usage
```

以后：

OpenAI

Claude

Gemini

Qwen

DeepSeek

全部 Provider 化。

---

# ⭐⭐⭐⭐⭐ core-storage（100分）

非常重要。

以后：

头像

图片

视频

附件

知识库

模型

插件

模板

全部依赖它。

建议：

不要一开始就接 MinIO。

先：

```
LocalStorage

↓

Storage Interface

↓

S3
↓

OSS
↓

COS
↓

MinIO
```

接口先抽象。

---

# ⭐⭐⭐⭐☆ core-workflow（95分）

这个很多人低估。

实际上它是平台化的灵魂。

例如：

注册以后

↓

发送邮件

↓

注册送积分

↓

通知管理员

↓

AI分析

↓

Webhook

全部是 Workflow。

所以以后：

任何平台：

Monitor

Trade

CMS

Knowledge

都会用。

建议：

先不要做 BPMN。

做最简单：

```
Event

↓

Handler

↓

Action
```

够了。

---

# ⭐⭐⭐⭐☆ core-api（95分）

但是这里我建议改名字。

API Gateway 太重。

真正 Gateway：

```
Nginx

Spring Gateway

Traefik

APISIX
```

都是网关。

你这里其实不是 Gateway。

而是：

```
API Runtime
```

或者

```
core-openapi
```

里面包含：

```
API Key

RateLimit

Permission

Signature

OpenAPI

SDK

Client
```

---

# ⭐⭐⭐⭐☆ core-marketplace（90分）

这里我建议：

**不要第一年做。**

Marketplace 本质不是基础设施。

而是：

生态成熟以后自然出现。

如果平台只有三个插件，

Marketplace 没意义。

所以：

把 Plugin Runtime 做好。

Marketplace 可以以后长出来。

---

# ⭐⭐⭐☆☆ core-billing（85分）

很多人喜欢先做支付。

其实我建议：

最后做。

为什么？

因为：

没有用户，

没有收费，

Billing 完全没有价值。

真正 Billing 依赖：

```
Identity

Notification

Workflow
```

以后：

订阅

额度

积分

支付

发票

退款

全部放进去。

但是：

不是第一阶段。

---

# 我真正建议的 Core

我会变成：

```
core-identity
core-notification
core-storage
core-ai
core-workflow
core-openapi
```

第一阶段只有这六个。

---

然后：

第二阶段

```
core-billing
core-plugin
```

注意：

Marketplace

改成

```
Plugin Runtime
```

真正重要的是：

```
Plugin

Manifest

Lifecycle

Hook

Extension

Permission
```

Marketplace

只是：

```
Plugin 的展示页面。
```

---

# 我甚至建议再补两个 Core

## ⭐⭐⭐⭐⭐ core-config

所有系统都会需要：

```
配置

参数

Feature Flag

环境变量

系统配置

邮件配置

AI配置

支付配置
```

以后千万不要：

```
application.yml
```

写死。

统一：

```
SystemConfig
```

动态读取。

---

## ⭐⭐⭐⭐⭐ core-audit

以后：

所有平台：

```
登录

删除

审批

支付

权限修改

AI调用
```

全部需要：

```
Audit Log
```

不要每个平台重复写。

独立：

```
core-audit
```

---

所以最终我认为：

```
core-identity
core-notification
core-storage
core-ai
core-workflow
core-openapi
core-config
core-audit
```

这才是真正的平台八大基石。

---

# 实现顺序（按依赖关系，而不是按业务热度）

## Phase 1：平台根基

```
core-identity
```

原因：

所有模块都需要用户、权限、组织、API Key。

---

## Phase 2：统一配置

```
core-config
```

原因：

之后所有模块都能共享配置，不会把邮件、AI、存储等参数散落在各个模块。

---

## Phase 3：统一存储

```
core-storage
```

原因：

头像、附件、模板、插件包等资源都会依赖它。

---

## Phase 4：统一通知

```
core-notification
```

原因：

Identity、Billing、Workflow 等都会发送通知。

---

## Phase 5：AI 能力

```
core-ai
```

原因：

AI 会成为多个业务的公共能力，但它依赖身份认证、配置以及一定的存储能力。

---

## Phase 6：事件与自动化

```
core-workflow
```

原因：

前面的模块都可以通过事件串联起来，实现自动化，而无需彼此直接耦合。

---

## Phase 7：开放接口

```
core-openapi
```

原因：

当内部能力稳定后，再向外暴露统一 API、SDK、API Key、限流等能力。

---

## Phase 8：审计

```
core-audit
```

原因：

把前面所有模块的关键操作统一记录，形成可追踪的操作日志。

---

## Phase 9：商业化

```
core-billing
```

原因：

只有当平台已经具备用户和实际使用场景后，支付、订阅、额度等商业能力才真正有价值。

---

## Phase 10：生态

```
core-plugin
```

原因：

先建立插件运行时（加载、生命周期、权限、扩展点），而不是先做 Marketplace。

---

## Phase 11：插件市场

```
core-marketplace
```

原因：

当已有足够多的插件、模板或应用后，再提供市场、评分、版本管理、安装升级等能力，生态才能真正运转。

---

## 一个建议：从第一天就统一模块骨架

所有 `core-*` 模块尽量保持一致的目录和分层，例如：

```text
core-identity/
├── api/          # DTO、OpenAPI、客户端接口
├── domain/       # 实体、聚合、领域服务
├── application/  # 用例、业务编排
├── infrastructure/
│   ├── persistence
│   ├── config
│   ├── adapter
│   └── event
├── web/          # Controller
└── starter/      # （可选）自动配置
```

同时统一技术约束：

* Maven 多模块工程
* Spring Boot 3.x
* JPA 或 MyBatis（二选一，避免混用）
* SQLite 默认数据源，数据库访问尽量避免使用特有 SQL，方便后续切换 MySQL
* Vue3 + TypeScript + Pinia + Vue Router
* 所有模块统一 REST 风格、统一错误码、统一分页和统一响应体
* 不引入 Redis、MQ 等基础设施，模块之间优先通过同步接口或 Spring 事件完成协作

这样，当未来开源时，开发者面对任何一个 `core-*` 模块，都能立即理解其结构和扩展方式。

这种一致性，比增加更多功能，更能提升整个平台的长期可维护性和社区接受度。

# 参考资料

* any list
{:toc}