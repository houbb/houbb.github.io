---
layout: post
title: 权限体系之-151-应用管理平台关系
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# 企业级 IAM 平台中的 App-Manage 其他系统的关系拓扑图（mermaid）+调用关系流程图

下面提供两部分内容，均为 **可直接使用的 mermaid 图**：

1. **企业级 IAM 平台中 App-Manage 与其他系统的关系拓扑图（系统视角）**
2. **App 注册 → 接入 → 使用 的调用关系流程图（时序图）**

整体设计对标大型企业 IAM 架构（Okta/AzureAD/阿里内部体系）。

---

# 一、企业级 IAM 平台 — App-Manage 与其他系统关系拓扑图（mermaid）

此图展示 App-Manage 在企业数字基础设施中的**核心地位与左右协同关系**。

```mermaid
flowchart LR
    subgraph IAM["IAM Platform"]
        APPM["App-Manage<br>应用管理"]
        AUTH["Auth Service<br>OAuth2 / OIDC / SSO"]
        PERM["Permission Center<br>RBAC+ / Resource / Policy"]
        AUDIT["Audit Center<br>审计中心"]
    end

    subgraph ECO["Ecosystem / Infra"]
        CMDB["CMDB<br>配置管理数据库"]
        GATEWAY["API Gateway<br>API 网关"]
        LOG["Log/Trace/Metric<br>可观测性"]
        SSOCLIENTS["Internal Systems<br>内部接入系统"]
        THIRD["Third-party Apps<br>外部应用"]
    end

    CMDB -- "应用元数据同步\nApp 基础属性" --> APPM
    APPM -- "AppId / ClientId / Secret\n接入参数" --> AUTH
    APPM -- "生成资源命名空间\n初始化 resource tree" --> PERM
    APPM -- "操作审计\n接入变更" --> AUDIT

    AUTH -- "Token / 会话状态\nSSO结果" --> SSOCLIENTS
    AUTH -- "统一认证入口" --> THIRD

    PERM -- "权限校验\nresource/action/policy" --> SSOCLIENTS
    PERM -- "权限范围 scopes" --> GATEWAY

    GATEWAY -- "API 调用凭证验证\nappKey+secret" --> APPM
    GATEWAY -- "API 调用记录" --> AUDIT

    SSOCLIENTS <-- "日志、链路" --> LOG
    THIRD <-- "审计、日志" --> LOG
```

---

# 二、App 生命周期调用关系（从创建到调用 API）

本图涵盖：
**App 创建 → OAuth 注册 → 权限初始化 → 接入 → 调用网关/API → 审计全链路**

```mermaid
sequenceDiagram
    participant U as User(Admin)
    participant APPM as App-Manage
    participant CMDB as CMDB
    participant AUTH as Auth Service(OAuth/OIDC)
    participant PERM as Permission Center
    participant GW as API Gateway
    participant AUDIT as Audit Center
    participant APP as Application(Client)

    %% Step 1: 创建应用
    U ->> APPM: 创建应用(Create App)
    APPM ->> CMDB: 查询基础应用信息(Optional)
    CMDB -->> APPM: 返回应用元数据
    APPM ->> APPM: 生成 appId / namespace
    APPM ->> AUTH: 注册 OAuth Client(clientId/secret)
    AUTH -->> APPM: 返回 client 信息

    %% Step 2: 初始化权限
    APPM ->> PERM: 初始化 Resource Tree + Actions
    PERM -->> APPM: 初始化完成

    %% Step 3: 保存接入配置
    U ->> APPM: 配置 redirectURI / 登录协议
    APPM ->> AUDIT: 记录变更日志

    %% Step 4: 应用登录
    APP ->> AUTH: 发起登录/授权请求
    AUTH ->> PERM: Scope/Permission 校验
    PERM -->> AUTH: 校验通过
    AUTH ->> APP: 返回 token/id_token

    %% Step 5: API 调用
    APP ->> GW: 携带 token/clientId 调用接口
    GW ->> AUTH: 校验 token 或 appKey
    GW ->> PERM: 校验 resource/action
    GW ->> AUDIT: 写入调用审计
    GW -->> APP: 返回 API 响应

```

---

# 三、图解说明（便于你在文档或设计中使用）

## （1）App-Manage 是企业内部所有系统的“注册中心”

它负责：

* App 的唯一身份（appId）
* OAuth client（clientId/secret）
* 权限 namespace 根节点
* 审计主键

所有系统必须在这里注册才能使用 IAM。

---

## （2）App-Manage 与 CMDB 的关系

CMDB 不提供 token、接入、权限信息。
仅提供：

* 应用基础元数据
* 部门、负责人、环境信息

IAM 再基于此建立“接入模型”。

---

## （3）App-Manage 驱动权限中心构建资源体系

每一个应用对应一个独立命名空间：

```
appId  
    ├── module  
    │     ├── resource  
    │     ├── action  
    │     └── data-scope
```

应用创建后自动初始化，避免权限命名混乱。

---

## （4）API 网关与 App-Manage 深度绑定

API Gateway 是 App 身份认证的最终落地点：

* 验证 clientId/secret
* 验证 scope
* 输出审计/调用链路

这个部分是 IAM × API Gateway 打通的关键价值。

---

## （5）审计中心贯穿全流程

App-Manage 的每一次变更、每一次调用都会落入审计中心，用于：

* 风险监控
* 追溯
* 调用链分析（与 Trace/Metric 配合）



* any list
{:toc}