---
layout: post
title: 成熟企业级技术平台 MVE-016-Secrets 管理
date: 2025-12-09 21:01:55 +0800
categories: [MVE]
tags: [mve, sh]
published: true
---

# overview

 ```
P2（数据 & 风险）
├── 数据脱敏平台
├── 安全平台（风控 / 入侵检测）
├── 访问风控 / 风险引擎

P3（零信任 & 密钥）
├── Zero Trust 平台
├── HSM / KMS
├── Secrets 管理
```

## P2｜数据 & 风险（Data & Risk）

> **请求进来之后，它“看起来正不正常”、数据“该不该看这么多”**

```mermaid
sequenceDiagram
    participant User as 用户/调用方
    participant App as 业务系统
    participant Risk as 访问风控 / 风险引擎
    participant IDS as 入侵检测
    participant Mask as 数据脱敏平台
    participant Audit as 审计系统

    User->>App: 发起访问 / 请求
    App->>Risk: 请求风险评估（行为 / 频率 / 环境）
    Risk-->>App: 风险判定（放行 / 降级 / 校验 / 拦截）

    App->>IDS: 上报访问行为
    IDS->>IDS: 行为分析 / 异常识别
    IDS-->>Audit: 记录异常/告警事件

    App->>Mask: 请求敏感数据
    Mask->>Mask: 判断访问人 / 场景 / 策略
    Mask-->>App: 返回脱敏或明文数据

    App-->>User: 返回业务结果
```


## P3｜零信任 & 密钥（Zero Trust & Secrets）

> **访问之前，先确认你是谁、设备靠不靠谱、有没有资格拿到关键材料**

```mermaid
sequenceDiagram
    participant User as 用户 / 设备
    participant ZT as Zero Trust 平台
    participant App as 业务系统
    participant KMS as KMS
    participant HSM as HSM
    participant Secrets as Secrets 管理
    participant Audit as 审计系统

    User->>ZT: 请求访问资源
    ZT->>ZT: 校验身份 / 设备 / 环境 / 风险态
    ZT-->>User: 动态信任结果（允许 / 限制）

    User->>App: 访问业务系统
    App->>Secrets: 请求运行时 Secret
    Secrets->>KMS: 请求解密 / 使用密钥
    KMS->>HSM: 密钥操作（生成 / 解密 / 签名）
    HSM-->>KMS: 返回操作结果
    KMS-->>Secrets: 返回可用结果
    Secrets-->>App: 注入 Secret（不暴露明文）

    App->>Audit: 记录密钥 / Secret 使用行为
```

核心逻辑:

Zero Trust 决定这次访问，值不值得信

Secrets / KMS / HSM 决定关键材料，能不能给你用

# 企业级安全全景调用时序图（P0 + P1 + P2 + P3）

```mermaid
sequenceDiagram
    participant User as 用户 / 设备
    participant ZT as Zero Trust
    participant SSO as SSO
    participant Passport as Passport
    participant UMS as UMS
    participant Perm as Permission
    participant App as 业务系统

    participant Risk as 访问风控
    participant IDS as 入侵检测
    participant Mask as 数据脱敏

    participant Secrets as Secrets
    participant KMS as KMS
    participant HSM as HSM

    participant IGA as IGA
    participant Bastion as 堡垒机
    participant Audit as 审计系统

    %% ========== P3 零信任入口 ==========
    User->>ZT: 请求访问（身份 / 设备 / 环境）
    ZT->>ZT: 动态信任评估
    ZT-->>User: 放行 / 限制策略

    %% ========== P0 身份访问 ==========
    User->>SSO: 访问业务系统
    SSO->>Passport: 发起认证
    Passport->>UMS: 校验身份状态
    UMS-->>Passport: 返回身份信息
    Passport-->>SSO: 签发 Token
    SSO-->>User: 登录完成

    User->>App: 携带 Token 访问
    App->>Passport: 校验 Token
    Passport-->>App: Token 合法

    App->>Perm: 权限校验（RBAC / ABAC）
    Perm-->>App: 权限结果

    %% ========== P2 风险 & 数据 ==========
    App->>Risk: 行为风险评估
    Risk-->>App: 放行 / 降级 / 校验

    App->>IDS: 上报访问行为
    IDS->>IDS: 异常分析
    IDS-->>Audit: 异常事件记录

    App->>Mask: 请求敏感数据
    Mask-->>App: 脱敏 / 明文数据

    %% ========== P3 密钥 & Secret ==========
    App->>Secrets: 请求运行时 Secret
    Secrets->>KMS: 请求解密/使用
    KMS->>HSM: 密钥操作
    HSM-->>KMS: 返回结果
    KMS-->>Secrets: 返回可用数据
    Secrets-->>App: 注入 Secret

    %% ========== P1 身份治理 & 审计 ==========
    UMS-->>IGA: 身份生命周期事件
    IGA->>Perm: 授权 / 回收
    IGA-->>Audit: 治理决策记录

    Bastion->>Audit: 运维访问与操作审计
    App->>Audit: 业务敏感操作审计

    App-->>User: 返回业务结果
```

# 相关开源项目

可以参考一下老马开源的项目：

敏感词核心库: https://github.com/houbb/sensitive-word

敏感词控台：https://github.com/houbb/sensitive-word-admin

日志脱敏：https://github.com/houbb/sensitive

加密工具：https://github.com/houbb/encryption-local

* any list
{:toc}