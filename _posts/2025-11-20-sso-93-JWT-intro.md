---
layout: post
title: 权限体系之-93-JWT 入门介绍
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# chat

## 一、概念

## 一、概念

**JWT（JSON Web Token）** 是一种 **基于 JSON 的轻量级令牌格式**，用于在各方之间安全地传递信息。

* 它常用于 **身份验证（Authentication）** 和 **授权（Authorization）**。
* JWT 本身是 **自包含（Self-contained）** 的，携带了用户身份和权限信息。
* 因为是 **可序列化的 JSON**，它可以轻松用于 Web、移动端和 API 场景。

---

## 二、JWT 的结构

JWT 由 **三部分**组成，用 **`.`** 分隔：

```
xxxxx.yyyyy.zzzzz
```

1. **Header（头部）**

   * 描述令牌类型和签名算法。
   * JSON 示例：

     ```json
     {
       "alg": "HS256",
       "typ": "JWT"
     }
     ```
   * 通常支持的算法：

     * HMAC SHA-256（HS256）
     * RSA SHA-256（RS256）

2. **Payload（负载）**

   * 携带声明（Claims），即实际传递的信息。
   * 常见字段：

     * `iss`：签发者（Issuer）
     * `sub`：主题（Subject，如用户 ID）
     * `aud`：接收方（Audience）
     * `exp`：过期时间（Expiration）
     * `iat`：签发时间（Issued At）
     * 自定义字段：如 `role`, `permissions` 等
   * JSON 示例：

     ```json
     {
       "sub": "1234567890",
       "name": "John Doe",
       "admin": true,
       "iat": 1700000000,
       "exp": 1700003600
     }
     ```

3. **Signature（签名）**

   * 用于验证 JWT 的完整性，防止篡改。
   * 生成方式：

     ```
     HMACSHA256(
       base64UrlEncode(header) + "." + base64UrlEncode(payload),
       secret
     )
     ```
   * 或使用非对称加密（RSA/ECDSA）签名。

---

## 三、JWT 的工作原理

1. **生成 JWT**

   * 服务器验证用户身份后，生成 JWT，并返回给客户端。
2. **客户端存储 JWT**

   * 通常存储在浏览器 LocalStorage、SessionStorage 或 HttpOnly Cookie。
3. **请求携带 JWT**

   * 客户端在请求受保护资源时，将 JWT 放在 **Authorization Header**：

     ```
     Authorization: Bearer <JWT>
     ```
4. **服务器验证 JWT**

   * 服务器验证签名、过期时间和其他字段。
   * 验证通过后，允许访问资源。

---

## 四、JWT 的特点

1. **自包含（Self-contained）**

   * JWT 包含用户身份信息和权限信息，无需服务器保存会话。
2. **跨域使用方便**

   * 可用于不同域、不同服务间的身份传递。
3. **轻量级**

   * 基于 JSON，易于解析，适合移动端和 API 场景。
4. **可扩展**

   * 可以自定义字段，携带业务所需的额外信息。

---

## 五、JWT 的安全注意事项

1. **签名验证**

   * 必须验证签名，防止被篡改。
2. **过期时间**

   * 设置合理的 `exp`，防止令牌长期有效。
3. **敏感信息**

   * 不要在 JWT payload 中存储敏感信息（密码、信用卡等），因为 payload 可被 Base64 解码。
4. **存储方式**

   * 对前端：尽量使用 HttpOnly Cookie，避免 XSS 泄露。
5. **刷新机制**

   * 使用 **Refresh Token** 更新 Access Token，避免长期暴露 JWT。

---

## 六、JWT 与 OAuth 2.0 / OIDC 的关系

| 特性         | JWT                             | OAuth 2.0            | OpenID Connect              |
| ---------- | ------------------------------- | -------------------- | --------------------------- |
| 类型         | 令牌格式                            | 授权协议                 | 身份认证协议                      |
| 用途         | 携带身份/权限信息                       | 获取访问令牌               | 获取身份令牌 + 授权访问               |
| 与 OAuth 关系 | JWT 常用作 Access Token 或 ID Token | OAuth 可使用 JWT 作为访问令牌 | ID Token 就是 JWT             |
| 优点         | 自包含、轻量、跨服务使用方便                  | 灵活、标准化               | OAuth 2.0 + JWT 支持 SSO/身份验证 |

---

## 七、典型应用场景

1. **Web 应用登录**

   * 用户登录后，服务器生成 JWT，前端携带 JWT 请求接口。
2. **API 访问授权**

   * 微服务之间使用 JWT 进行无状态认证和授权。
3. **单点登录（SSO）**

   * JWT 可以在不同系统之间传递身份信息。
4. **移动应用认证**

   * 轻量级，适合前后端分离或移动端场景。

---

## 八、JWT 的优缺点

**优点：**

* 无需服务器存储会话（Stateless）
* 易于跨域和微服务通信
* 标准化、支持自定义字段

**缺点：**

* 一旦签发，无法主动撤销（除非维护黑名单）
* 令牌过大可能影响性能
* payload 可被解码，不能存储敏感信息

---

**总结一句话**：

> JWT 是一种自包含的 JSON 格式令牌，主要用于在客户端和服务端之间安全传递身份和权限信息，常用于 OAuth 2.0 的 Access Token 或 OIDC 的 ID Token。

* any list
{:toc}