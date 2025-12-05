---
layout: post
title: 权限体系之-91-OpenID Connect 入门介绍
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# chat

## 一、概念

**OpenID Connect (OIDC)** 是建立在 **OAuth 2.0** 基础之上的 **身份认证层**。

它的主要目标是让客户端应用（通常称为 Relying Party）能够**验证用户身份**并获取用户的基本信息，而不是只授权访问资源。

**核心区别：**

| 特性       | OAuth 2.0                | OpenID Connect                       |
| -------- | ------------------------ | ------------------------------------ |
| 关注点      | 授权（Authorization）        | 认证（Authentication）                   |
| 核心功能     | 获取访问令牌（Access Token）访问资源 | 获取身份令牌（ID Token）验证用户身份，并可选访问用户信息     |
| 是否提供用户信息 | 不直接提供                    | 可以通过 ID Token 和 UserInfo Endpoint 获取 |

OIDC 可以理解为 **OAuth 2.0 + 身份层**。

---

## 二、OIDC 的核心角色

OIDC 沿用 OAuth 2.0 的角色，但有新的概念：

1. **资源拥有者（Resource Owner / End-User）**

   * 通常是最终用户。
   * 拥有受保护资源，并可以登录或同意授权。

2. **客户端（Relying Party, RP）**

   * 需要验证用户身份的应用程序。
   * 通过 OIDC 获取用户身份信息。

3. **身份提供者（OpenID Provider, OP）**

   * 提供身份验证和用户信息的服务器。
   * 通常与授权服务器合并。
   * 负责颁发 **ID Token** 和可选的访问令牌。

4. **用户信息端点（UserInfo Endpoint）**

   * 提供用户详细信息（如邮箱、姓名）。
   * 客户端通过访问令牌调用此端点获取用户信息。

---

## 三、OIDC 的关键组件

1. **ID Token**

   * 核心产物，是一个 **JWT（JSON Web Token）**。
   * 用于证明用户身份。
   * 常见字段（Claims）：

     * `iss`：签发者
     * `sub`：用户唯一标识
     * `aud`：接收者（客户端 ID）
     * `exp`：过期时间
     * `iat`：签发时间
     * `name/email/picture` 等可选用户信息

2. **Access Token**

   * 与 OAuth 2.0 一样，用于访问资源服务器或 UserInfo Endpoint。

3. **Refresh Token**

   * 可选，用于在 Access Token 过期后获取新的令牌。

4. **Scopes**

   * 常见：

     * `openid`：必须，用于表示这是 OIDC 请求。
     * `profile`：获取用户基本信息
     * `email`：获取用户邮箱
     * `address` / `phone`：可选获取更多信息

---

## 四、OIDC 的典型授权流程

OIDC 主要使用 **授权码模式（Authorization Code Flow）**，最安全。

流程如下：

1. **客户端向身份提供者请求授权**

   * URL 参数包含：`response_type=code&scope=openid profile email&client_id=xxx&redirect_uri=yyy&state=zzz`
2. **用户登录并同意授权**

   * 用户在身份提供者界面登录。
3. **身份提供者返回授权码给客户端**

   * 客户端收到授权码（一次性短期有效）。
4. **客户端用授权码换取令牌**

   * 请求身份提供者的 Token Endpoint。
   * 返回：

     * **ID Token** → 验证用户身份
     * **Access Token** → 可选，用于访问 UserInfo Endpoint
5. **客户端验证 ID Token**

   * 检查签名、`aud`、`exp` 等字段。
6. **客户端可使用 Access Token 获取用户信息（UserInfo Endpoint）**

---

### 流程图示意

```
+--------+                               +---------------+
|        |--(A) Authorization Request -->|               |
| Client |                               | OpenID        |
|  RP    |<-(B) Authorization Code ------| Provider      |
|        |                               |               |
|        |--(C) Token Request --------->|               |
|        |<-(D) ID Token + Access Token-|               |
|        |                               +---------------+
|        |--(E) UserInfo Request w/Token--> UserInfo Endpoint
|        |<-(F) User Information --------|
+--------+
```

---

## 五、典型应用场景

1. **单点登录（SSO）**

   * 通过 OIDC，用户登录一次即可访问多个系统。
2. **第三方登录**

   * Google、Microsoft、GitHub 等提供 OIDC 登录。
3. **移动应用认证**

   * 安全地验证用户身份，获取最小权限的用户信息。
4. **Web 前端与 API 的联合认证**

   * 前端使用 ID Token 验证用户身份，后端使用 Access Token 授权访问资源。

---

## 六、OIDC 与 OAuth 2.0 的关系

* OAuth 2.0 负责 **授权**（谁可以访问资源）。
* OIDC 在 OAuth 2.0 上增加了 **身份认证**（验证用户是谁）。
* 关系总结：

  ```
  OAuth 2.0 → Access Token → 授权访问资源
  OIDC       → ID Token + Access Token → 验证身份 + 访问资源
  ```

---

## 七、安全注意点

1. **验证 ID Token 签名**

   * 使用身份提供者公钥（JWKS）验证签名，确保令牌可信。
2. **检查 `aud` 和 `exp`**

   * 确认令牌是给本客户端的且未过期。
3. **使用授权码模式**

   * 防止前端令牌泄露。
4. **使用 HTTPS**

   * 所有通信必须加密。
5. **最小作用域原则**

   * 只请求必要的用户信息。

---

总结：

* **OAuth 2.0** = 授权（谁可以访问资源）
* **OIDC** = 身份认证 + 授权（验证用户身份，同时可授权访问资源）
* ID Token 是 OIDC 的核心，Access Token 用于访问资源。
* OIDC 非常适合 **SSO、第三方登录和安全身份验证** 场景。

* any list
{:toc}