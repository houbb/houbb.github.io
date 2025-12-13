---
layout: post
title: 成熟企业级技术平台 MVE-001-身份访问（Identity Access）与身份治理（Identity Governance）
date: 2025-12-09 21:01:55 +0800
categories: [MVE]
tags: [mve, sh]
published: true
---

# 时序图

## P0｜身份访问（Identity Access）

> 关注点：
> **人 → 能不能进 → 进来之后能干什么**

```mermaid
sequenceDiagram
    participant User as 用户
    participant SSO as SSO
    participant Passport as Passport（认证中心）
    participant UMS as UMS（用户中心）
    participant Perm as Permission（权限中心）
    participant App as 业务系统

    User->>SSO: 访问业务系统
    SSO->>Passport: 重定向登录请求
    Passport->>UMS: 校验用户身份/状态
    UMS-->>Passport: 返回用户基础信息（在职/状态/组织）
    Passport->>Passport: 身份校验成功，签发 Token
    Passport-->>SSO: 返回 Token / 会话
    SSO-->>User: 登录完成，跳回业务系统

    User->>App: 携带 Token 访问接口
    App->>Passport: 校验 Token 有效性
    Passport-->>App: Token 合法

    App->>Perm: 权限校验（RBAC / ABAC）
    Perm-->>App: 是否有权限
    App-->>User: 返回业务结果
```

## P1｜身份治理（Identity Governance）

> **这些身份和权限，是怎么来的、该不该存在、能不能解释**

```mermaid
sequenceDiagram
    participant HR as HR/主数据
    participant UMS as UMS（用户中心）
    participant IGA as IGA（身份治理）
    participant Perm as Permission（权限中心）
    participant Audit as 审计系统
    participant Bastion as 跳板机/堡垒机
    participant App as 业务系统

    HR->>UMS: 人员入职 / 变更 / 离职
    UMS-->>IGA: 身份状态变化事件

    IGA->>IGA: 计算身份策略（角色/规则/生命周期）
    IGA->>Perm: 发起授权 / 回收权限
    Perm-->>IGA: 权限变更结果

    IGA->>Audit: 记录治理决策与审批链路

    App->>Audit: 记录业务敏感操作
    Bastion->>Audit: 记录运维登录与操作行为

    Audit->>Audit: 统一审计存证与查询
```

# 关系

很多团队一开始，其实只关心一件事：
**“人能不能进系统。”**

账号能不能登录，
Token 发不发得出来，
接口是不是被拦住了。

这就是**身份访问（Identity Access）**。

它解决的是一个非常当下的问题：

> **现在这一刻，放不放行。**

---

身份访问的世界里，
时间是“即时”的。

你点登录，
系统就得给答案。
对就是对，
错就是错，
不能模糊。

所以这一层的系统通常都很“硬”：

* SSO
* Passport
* 权限校验
* Token、Session

它们不太关心历史，
也不擅长解释，
它们只负责判断。

---

但系统跑久了，
问题会慢慢变味。

你开始被问一些
**不是“现在”的问题**：

* 这个权限当初怎么来的？
* 为什么他调过这个接口？
* 离职那天是不是都回收了？
* 有没有人长期拿着不该有的权限？

这时候你才发现，
**身份访问回答不了这些。**

---

于是就有了**身份治理（Identity Governance）**。

身份治理不着急给结论，
它更在意过程。

它关心的是：

* 身份从哪来
* 权限怎么给
* 规则是不是合理
* 有没有该收却没收的东西

换句话说，
它问的是：

> **这件事，
> 当初为什么这么定？
> 现在还站得住吗？**

---

如果说身份访问像一道闸机，
那身份治理更像账本。

闸机只负责开或关，
账本要记清楚来龙去脉。

你不能指望闸机
帮你解释三个月前的一次放行，
但你一定希望账本里能翻得到。

---

现实里最常见的问题是：
**这两件事混在了一起。**

访问系统被塞进太多治理逻辑，
结果登录越来越慢；
治理系统想在线拦请求，
结果谁都不敢让它挡流量。

最后两边都很别扭。

---

真正舒服的状态反而很简单：

* 身份访问：
  **在线、快速、确定**
* 身份治理：
  **离线、持续、可追溯**

一个负责“此刻”，
一个负责“长期”。




* any list
{:toc}