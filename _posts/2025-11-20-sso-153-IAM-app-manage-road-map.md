---
layout: post
title: 权限体系之-153-应用管理平台 ROADMAP
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# ROAD-MAP

该路线图完全以 App-Manage 作为 IAM 的底层能力来设计，确保其作为整个身份体系的“应用元数据中心（Application Registry）”。

内容组织结构：

1. 顶层原则（为什么这样分层）
2. App-Manage 平台 Roadmap 总览（四阶段）
3. 各阶段详细功能拆解
4. 与审计 / IAM / 资源中心的依赖关系
5. 总结版甘特图（文字版）

---

# 1. 顶层原则（确保 App-Manage 为基础平台）

基于你强调的前置条件：
**“审计 + 应用管理是最基础的，不依赖其他平台。”**

因此 App-Manage 的设计必须遵循 3 个原则：

1. **App-Manage 必须完全独立运行**

   * 不依赖 RBAC、Passport、Permission、ResourceCenter
   * 提供基础 CRUD 与接入元数据能力
   * 可直接服务外部系统（App 注册、回调、密钥管理）

2. **上层系统必须依赖 App（App 是唯一的应用标识源）**

   * Passport 在认证流程中必须使用 app_id
   * Permission/RBAC+ 必须基于 app 进行资源挂载
   * Audit 必须以 app 为事件源

3. **所有行为必须进入审计**

   * App 的创建、修改、删除、secret 查看、secret 重置
   * 回调地址变更
   * 应用的启用／禁用
   * 权限绑定／解绑（即使权限系统是后续才上线）

---

# 2. App-Manage Roadmap 总览（四阶段）

Roadmap 分为 4 大阶段：

**Phase 0 — 基础平台（App Registry Core）
Phase 1 — 安全与治理（App Governance）
Phase 2 — 授权集成（App-Resource Integration）
Phase 3 — 生态化（OpenAPI + SDK + 自动化接入）**

这四个阶段遵循：
最小可用 → 安全可治理 → 可授权可访问控制 → 企业级生态。

---

# 3. 四阶段的详细 Roadmap（最终版）

---

## Phase 0 — 基础平台：最小可用 App Registry（不依赖任何其他平台）

**目标：可独立使用、可独立部署，是所有 IAM 平台的前置能力。**

### 3.0.1 核心能力

* App CRUD（创建、查询、修改、启用/禁用、删除）
* app_key / app_secret 自动生成
* 基础字段：name, type, owner, logo, home_url, description
* 环境配置（dev/test/prod）
* 回调地址配置（redirect_uris）
* App 状态管理（draft / enabled / disabled / deleted）

### 3.0.2 审计（强制）

App-Manage 内置与 Audit 的写入能力（但不依赖其他服务）：

* App 创建
* App 信息变更
* secret 查看（带二次验证）
* secret 重置
* 状态变更（启用/禁用/删除）

### 3.0.3 为什么在 Phase 0？

* 这是 App 平台的最小集合
* 上层系统都必须依赖 App（认证、权限、SSO）
* 审计要求行为记录必须从第一天开始
* 与任何权限、用户、认证体系都无耦合

**Phase 0 完成后，系统已经能够支撑多系统统一接入 IAM。**

---

## Phase 1 — 安全与治理能力：让 App 可控、可审计、可治理

**目标：企业级上线必需的安全与合规能力。**

### 3.1.1 安全策略

* Secret 查看需二次验证（OTP/密码）
* Callback URL 变更需二次确认
* App 删除需校验
* 环境配置变更需二次确认

### 3.1.2 治理能力

* 审批流（可选）

  * 创建 App 需审批
  * 回调地址修改需审批
  * Secret 重置需审批
  * 应用禁用/启用需审批

* 生命周期管理

  * Draft → Developing → Testing → Online → Archived
  * Archived 状态禁止登录流程承载

* 操作权限（App 管理自身的 ACL）

  * 谁能创建 App
  * 谁能修改 App
  * 谁能查看 secret
  * 谁能执行审批
  * Owner 与 Admin 的范围定义

### 3.1.3 监控与运行态管理

* 登录成功/失败统计（从 Passport 侧回流）
* 最近 24h 授权趋势
* App 健康度（回调 URL 打通检查）

### 为什么 Phase 1 在 Phase 0 之后？

* Phase 0 解决“可用”
* Phase 1 解决“可控、可审计、可治理”，属于企业级必须能力
* 认证平台还没有上线也不会阻塞 Phase 1（解耦）

---

## Phase 2 — 授权集成：与 Resource Center / RBAC+ 深度融合

**目标：应用从“元数据中心”进化为“授权入口”。**

### 3.2.1 App-Resource 绑定能力

* 支持将 resource（RBAC+）挂载到 app
* 资源树挂载可视化
* 防冲突检测（不同应用不应共享冲突路由）

### 3.2.2 Action / DataScope 支持

* App 可以声明可用 action
* 在 App 视角下查看资源的 action + datascope 组合
* 支持预览“该 App 的资源访问矩阵”

### 3.2.3 授权影响分析（Impact Analysis）

* 修改某个 resource → 哪些 App 会受影响
* 修改 App 的资源绑定 → 哪些用户权限会变更
* 删除 App → 哪些角色将被影响

### 3.2.4 为什么 Phase 2 在 Phase 1 之后？

因为：

* App 是资源体系最上层挂载点
* 但资源体系本身不是基础（可晚一点上线）
* 权限体系需要治理基础（审计、审批）来支撑授权安全
* 所以先做 App，再做治理，再做授权集成

---

## Phase 3 — 生态：自动化接入、开放接口、SDK

**目标：大规模系统接入、微服务接入、自服务生态。**

### 3.3.1 OpenAPI（对外暴露的 App 管理 API）

* 创建应用
* 获取应用密钥
* 删除/禁用应用
* 查询应用资源结构
* 回调校验
* Secret Rotate API

### 3.3.2 多语言 SDK（实现快速接入）

* Java（Spring Boot Starter）
* Node.js
* Go
* Web JS SDK（SPA、H5、移动 Web）
* 服务器端 CLI 工具

### 3.3.3 自动注册（Auto-Registration）

* 微服务启动时自动注册到 App-Manage
* 自动生成默认 resource
* 自动生成默认 secret rotate 策略
* 自动拉起回调配置

### 3.3.4 安全增强

* Secret 自动轮换
* 限流策略（防滥用）
* IP 白名单动态管控
* 回调域名可信校验（DNS/HTTPS 校验策略）

### 3.3.5 可观测性

* 接入趋势图
* 各应用 token 使用情况
* 各应用异常分布
* 各应用登录链路 trace

### 为什么 Phase 3 最后？

* 生态能力建立在“可用 → 可治理 → 可授权”之后
* SDK、自动接入等必须以稳定的 API/资源体系为前提
* 需要企业规模扩大后才体现价值

---

# 4. App-Manage 的依赖关系（最终版）

根据你的规范：
**App-Manage 只依赖 Audit，不依赖其他任何 IAM 子系统。**

依赖图如下：

```
       ┌────────────────────────┐
       │      Audit (基础)      │
       └────────────────────────┘
                 ↑
                 │ 仅写入，无查询依赖
       ┌────────────────────────┐
       │   App-Manage(本模块)   │
       └────────────────────────┘
                 ↑
   ┌────────────┼────────────┐
   │            │            │
   │            │            │
Authentication  Resource     Permission
(SSO/Passport)  Center      RBAC+/策略引擎
```

说明：

* Audit 是所有平台的最终落点 → App-Manage 只需要写日志，不依赖审计查询
* Authentication（认证）、Permission（授权）、ResourceCenter（资源）都必须依赖 App
* App-Manage 不依赖它们，才能做到“系统根基”

---

# 5. Roadmap 总结版（适用于 PPT / PRD）

```
Phase 0 — 基础平台（App Registry Core）
    - App CRUD
    - app_key/app_secret
    - 环境配置
    - 回调地址
    - 审计写入（builtin）

Phase 1 — 治理体系（App Governance）
    - 审批流
    - Secret 安全策略
    - 生命周期管理
    - 操作权限（ACL）
    - 运行监控

Phase 2 — 授权集成（App-Resource Integration）
    - App-Resource 挂载
    - Action / DataScope 映射
    - 授权影响分析
    - 跨系统权限一致性管理

Phase 3 — 企业生态（OpenAPI + SDK + 自动注册）
    - 各语言 SDK
    - 自动注册 / 自动接入
    - Secret 轮换
    - 安全策略（防滥用）
    - 接入可观测性
```



* any list
{:toc}