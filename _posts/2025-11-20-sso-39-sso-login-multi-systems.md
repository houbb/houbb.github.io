---
layout: post
title: 权限体系之-39-sso 单点登录之后多系统如何复用的？
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# chat

## 复用

```
sso 登录之后，client-A 把信息存储到前段，client-A 的后端也可以自己重新颁发 token。

那么问题来了，其他系统 client-B 之类的，要如何复用避免登录呢？安全性呢？
```

好——把问题拆成两块：

**（A）其它系统（client-B 等）如何复用已经在 client-A 登录的身份以免再次交互式登录？** 

和 **（B）这样做时的安全注意项**。

下面直接给可落地的方案、具体交互流程和安全建议，便于在你现有 SSO/UMS/Passport 架构上实现。

# 关键原则（先记住）

1. **不要用前端本地存储的 token 当作跨系统信任凭证。** 前端存储是单个应用的，并不能安全地跨系统信任。
2. **把“身份的权威”放在中央 IdP/SSO（authorization server）上**，各 client（A/B）通过标准协议（OIDC / OAuth2）与 IdP 交换/验证 token。
3. **采用短期访问 token + 可受控的刷新机制（或 token exchange）**，并对 token 验证做严格的签名/受众/颁发者检查。

---

# 推荐方案（按可实现性排序 + 交互步骤）

## 方案 1 — 标准 OIDC 授权码流（Authorization Code + PKCE），配合 SSO 域名的 Session Cookie（推荐）

**适用场景**：若你的多个客户端在同一个顶级域或可配置的子域（比如 `app1.example.com`, `app2.example.com`）下，浏览器可共享 cookie。

**思路（高层）**：

* IdP（SSO）在用户首次交互式登录后，在 `.example.com` 下设置一个 **HttpOnly, Secure** 的 SSO session cookie（domain=`.example.com`，SameSite= Lax/None 视跨站需求）。
* client-B 当用户访问时，如果本地无会话，发起 OIDC `authorize` 请求到 IdP。因为浏览器带上了 SSO cookie，IdP 会 **无交互地（或最少交互）** 返回授权码（或直接 SSO silently 完成），client-B 然后用授权码换取 access_token / id_token。
* 后端验 token：client-B 的后端向 IdP 请求 `/introspect` 或直接验证签名化 JWT（通过 IdP 的 JWKS）。

**具体交互（简化）**：

1. user 已在 client-A 登录，IdP 设置 `SSO_SESSION` cookie（`.example.com`）。
2. user 打开 client-B → client-B 检查本地无会话 → 重定向浏览器：
   `GET https://idp.example.com/authorize?client_id=clientB&response_type=code&redirect_uri=...&scope=openid&prompt=none`
3. 浏览器带上 `SSO_SESSION` cookie 到 IdP；IdP 发现已登录并返回 `code`（若 prompt=none 且需强交互则返回 login_required，根据策略决定）。
4. client-B 后端用 `code` 换 `access_token`（机密通过后端），保存最小会话信息。完成免登录体验。

**优点**：用户无感知；遵循标准；容易验证签名。
**缺点/注意**：跨域 cookie 策略、Third-party cookie 限制、浏览器隐私策略可能影响 silent flow（需 fallback 到 redirect）。

---

## 方案 2 — 后端信任 + Token Exchange（适合微服务 / 后端对后端场景）

**适用场景**：client-A 后端已经持有一个 access/refresh token，后端想代表用户访问 client-B 的后端或第三方 API。

**思路**：

* 使用 **OAuth 2.0 Token Exchange（RFC 8693）**：client-A 后端将现有 token 向 IdP 请求交换，获取一个受限 audience 的新 token 给 client-B 使用；或者 IdP 签发新的 token 给 client-B。
* 或者用短期授权码把用户委托给 client-B（更安全，避免长期 token 传播）。

**优点**：不把用户 token 直接暴露给其他系统；可控制 scope/audience/TTL。
**缺点**：需要 IdP 支持 token exchange；多一层后端逻辑。

---

## 方案 3 — 后端共享会话（仅局域网或受信环境，不推荐公开互联网）

**思路**：client-A 后端把 session 信息（或一个 ticket）通过内部 API 发给 client-B 后端验证。但**必须**通过 mTLS / VPN /内部网关来保证安全。通常用 `ticket`（一次性、短期）来交换 token。

**不推荐**：在互联网或跨组织场景容易被滥用或泄露。

---

# SPA / 前端实现注意（如果 client 是 Single Page App）

* SPA 使用 **Authorization Code + PKCE**（不要 implicit flow）。
* **不要把 refresh_token 放到 localStorage**。如果需要 refresh token，**把刷新操作放到后端**（或者使用 Refresh Token Rotation 与 secure httpOnly cookie）。
* **短期 access_token（如 5–15min）**，refresh token TTL 更长但要支持旋转与撤销。

---

# 验证/复用流程总结（client-B 无感知免登录的标准步骤）

1. client-B 检查本地 session。无则重定向 IdP `/authorize`（带 `prompt=none` 尝试静默登录）。
2. 浏览器带 SSO cookie 到 IdP → IdP 返回 `code`（或直接 id_token）。
3. client-B 后端用 `code` 交换 token（后端保存短会话或 cookie）。
4. client-B 后端验证 token（签名、`iss`、`aud`、`exp`、`nonce` 等）。
5. 若静默失败（例如 SSO cookie 过期或需要二次认证），IdP 返回 `login_required`，client-B 发起交互式登录（redirect），用户看到登录页或 MFA。

---

# 安全性详细注意（必须做的）

1. **HTTPS 全站强制**（包括内部 API）。
2. **短期 access_token**（5–15 分钟）；refresh token 使用旋转（每次使用换新）并储存在 HttpOnly cookie 或后端。
3. **使用 Authorization Code + PKCE（SPA 也一样）**，并在 server 端存 client secret。
4. **Token 验证**：验签（JWKS），检查 `iss`、`aud`、`exp`、`nbf`、`iat`、`scope`、`azp`（如果存在）。
5. **Token 含受众（aud）**：不同 client 只能使用面向自己的 token，或用 token exchange 获取适当受众的 token。
6. **撤销 / 黑名单**：支持 token 撤销（refresh 被撤销后仍短期 access 可过期），对重要事件（登出、权限变更）立即撤销票据或加速失效。
7. **CSRF 防护**：使用 state 参数在 /authorize；Cookie 使用 SameSite；登录/登出端点防 CSRF。
8. **Cookie Flags**：`Secure`, `HttpOnly`（不可被 JS 读）, `SameSite`（按场景配置）。
9. **MFA 与 高风险检测**：对敏感客户端/场景强制 MFA；对异常登录（IP、设备）触发再次认证。
10. **审计与日志**：记录 token issue/introspect/refresh/ exchange 操作，便于追踪。
11. **最小权限原则**：token 只包含必需 scope。
12. **JWK 管理**：定期轮换密钥并暴露 `/jwks` 端点；客户端缓存并处理 key rotation。

---

# 针对你描述的“client-A 把信息存在前段，client-A 后端可重新签发 token”的额外建议

* **不要把 client-A 后端签发的 token 直接作为其它 client 的信任凭证**，因为无法控制范围/受众。
* 如果 client-A 后端需要代表用户调用 client-B 后端：用 **token exchange**（后端向 IdP 或 token service 申请给 client-B 专用的短期 token），或让 client-A 后端调用 client-B 的后端 API 时传递自己的服务凭证（非用户 token），再由 client-B 后端和 IdP 做用户关联。
* 避免把长生命周期 token 写入前端（localStorage/sessionStorage）；若必须短期缓存，也应首选内存保存并在页面刷新丢失。

---

# 常见问题 + 解决建议（快速）

* Q：**跨域共享 cookie 被浏览器拦截怎么办？**
  A：用基于 redirect 的 silent auth（prompt=none），或把 IdP 放在一个共享顶级域，或采用后端授权码交换。第三方 cookie 限制会影响 iframe silent flow。
* Q：**如何防止 replay/盗用 token？**
  A：短 TTL、aud/iss 校验、token binding（若可用）、mTLS for service-to-service。
* Q：**如何在用户登出时让所有 client 失效？**
  A：实现 Single Logout（SLO）：前端触发 IdP `/logout`，IdP 通知各 client 的 logout callback（front-channel or back-channel）。并撤销 server 端 session 和 refresh token。

---

# 实用端点 & 验证 checklist（给开发直接用）

* IdP 必备端点：

  * `GET /authorize`（OIDC）
  * `POST /token`（交换 code→token）
  * `POST /introspect`（可选，用于短期验证）
  * `POST /revoke`（撤销 token）
  * `GET /.well-known/openid-configuration`
  * `GET /jwks`（签名验证）
* token 验证必须检查的字段：`iss`, `aud`, `exp`, `nbf`（如有）, `scope`（是否包含所需权限）, `azp`（若多客户端场景）。
* 推荐 TTL：`access_token` = 5–15min；`refresh_token` = 1 day–30 days 视风险；或使用 Refresh Rotation 限制长期有效性。

---

# 小结（一句话）

把“身份权威”交给中心化 IdP（用 OIDC/OAuth2 标准），让其它客户端通过 **授权码 + SSO session cookie（或 token exchange）** 来无缝复用登录；

同时通过短期 token、严格验证、token exchange 与撤销机制来保证安全。


# 我感觉这样很麻烦，还不如每个系统都自己登陆一次呢？有没有更加直接简洁的方式？

下面我给你一个**更直接、更简洁、工程可落地**的方式，去掉复杂协议、去掉多余跳转、去掉 token exchange，也不依赖 OIDC/OAuth2 的完整流程，但**依然保持足够安全**。

这套方案很多企业内部 SSO 都在用（中国公司尤其多），比标准 OAuth/OIDC 更轻、更快、更容易实现。

---

# ✅ **超级简化版 SSO（核心只靠一个 Ticket）**

一句话概括：
**用户在 SSO 中央认证一次后，SSO 给浏览器种一个 `SSO_SESSION` Cookie，之后每个系统（client-A / client-B / client-C）只需要跳到 SSO 的 `/verify` 接口检查一次这个 cookie 是否有效，验证成功就拿到 user 信息。**

**无需：**
❌ OAuth2 授权码
❌ PKCE
❌ Token Exchange
❌ 重定向好几次
❌ 每次都解析 JWT

**只需：**
一个 cookie + 一个校验接口 `/api/sso/verify`

---

# ✨ **简化版体系结构**

```
   ┌───────────────┐
   │     Client A   │───\
   └───────────────┘    \
                          >—— 调 SSO /verify，拿 user —— 完成免登
   ┌───────────────┐    /
   │     Client B   │──/
   └───────────────┘

                    ↑
               浏览器 Cookie
             (SSO_SESSION=xxxx)

   ┌─────────────────────────┐
   │           SSO            │
   │   /login  /logout         │
   │   /verify（关键接口）     │
   └─────────────────────────┘
```

---

# 🧩 **最核心的设计： `/api/sso/verify`**

浏览器访问 client-B 时：

1. client-B 后端发现自己没有本地 session

2. client-B 后端向 SSO 发起请求：

   ```
   GET https://sso.com/api/sso/verify
   Cookie: SSO_SESSION=xxxx
   ```

3. SSO 判断这个 cookie:

   * 有效 → 返回：

     ```json
     {
       "ok": true,
       "user_id": 123,
       "username": "echo",
       "roles": ["admin"]
     }
     ```
   * 无效 → 返回：`401`，client-B 重定向到 SSO 登录页即可。

4. client-B 获得 user 信息后：

   * **自己本地签发自己的 token**
   * **创建自己的 session**
   * 后续就跟自己独立登录没有区别
   * 用户无感知

**用户只需在 SSO 登录一次，全网免密码**

---

# 🔥这种方式的优点（非常多）

## 1) 极其简单

每个系统只需要一个逻辑：

```
if (!localSessionExists) {
    call SSO /verify;
    if (ok) {
        createLocalSession();
    } else {
        redirectToSSOLogin();
    }
}
```

## 2) 支持任意前端、后端语言

因为就是一个接口调用 + Cookie。

## 3) 不需要每个系统处理 token 验签、audience、安全校验

全交给 SSO。

## 4) 安全性足够（前提做好以下几点）

* `SSO_SESSION` 是 HttpOnly + Secure + SameSite=None
* 只在 HTTPS 下工作
* Cookie 只能被 SSO 域访问
* `/verify` 必须对签发、过期、scope 做检查
* 每个 client 都有自己的 session/token，不共享 token

## 5) 极快

比 OAuth2 跳转流程快一个数量级。

---

# 🔒 安全性为什么足够？

因为：

* **只有 SSO 能解 SSO_SESSION**
* Client 永远无法伪造用户信息（必须通过 SSO 去验证）
* 每个 client 签发自己的 token，不相互信任
* SSO 统一控制会话、登录、登出、MFA、安全策略
* 任何时刻 SSO 只要销毁 session，所有 client 自动失效

---

# ⚡ 等等，那你要的“多系统免登录”如何实现？

流程如下：

### **用户在 Client-A 登录**

* SSO 设置 Cookie `SSO_SESSION=xxxx`

### **用户点击访问 Client-B（第一次访问）**

* Client-B 后端看到“本地没有 token”
  → 请求：`GET /api/sso/verify`
  → SSO 看到 cookie 还有效
  → 返回 user 信息
  → Client-B 后端创建本地登录态

### **之后访问 Client-C**

同理，一次 `/verify` 完成免登录。

**一个 Cookie，走遍天下。**

---

# 🧪 你可以马上落地的最小 SSO API 设计

### **登录**

```
POST /api/sso/login
```

成功后：

* 创建 SSO session
* 设置 Cookie：`Set-Cookie: SSO_SESSION=xxxx`

### **验证是否登录**

```
GET /api/sso/verify
```

返回：

```json
{
  "ok": true,
  "user_id": "123",
  "username": "echo",
  "roles": ["admin"]
}
```

### **登出（单点登出）**

```
POST /api/sso/logout
```

SSO 清除 session + 删除 Cookie
通知各 client 让本地 session 失效（可选）

---

# 🧠 为什么国内企业很多都用这种方案？

因为：

* OAuth/OIDC 太重
* SPA、BFF、多系统统一登录太多跳转
* 对用户体验要求高
* 内网系统多、架构复杂
* 前后端语言混乱，不想每个系统重复实现协议

而这个方案：

**简单、快、不易错、安全性可控。**
适合你现在的自研 SSO 架构。

## 为什么是设置 Cookie?? 共享的范围是什么？安全吗？为什么不能直接存到前端 localStorage

下面我直接把你关心的 3 个问题讲得**简单 + 本质 + 工程可落地**：

# 🧩 你问的核心是：

1. **为什么 SSO 要用 Cookie？**
2. **Cookie 的共享范围是什么？安全吗？**
3. **为什么不能把 SSO 登录态存在前端 localStorage？**

我一条一条讲清楚，保证你看完就彻底理解。（工程师的版本）

---

# 🔥 1. **为什么 SSO 必须用 Cookie？**

因为：

## ✅ **浏览器只有 Cookie 才能被自动携带给 SSO 服务器**

你的 SSO 是一个专门的认证中心，例如：

```
https://sso.example.com
```

要实现“用户访问 client-B 不需要重新登录”，流程必须是这样的：

```
client-B 后端 → 让浏览器去请求 → SSO

浏览器访问 https://sso.example.com/verify 时，会自动带上 SSO Cookie。
```

只有 Cookie 才能做到**浏览器自动携带凭证**。

localStorage 做不到。
sessionStorage 做不到。
IndexedDB 做不到。
Memory 当然更做不到。

---

# 🔥 所以用 Cookie 的核心目的：

## ⭐ **在用户不输入密码、不做任何操作的情况下，浏览器能够自动证明“我已经在 SSO 登录过”**

这是“单点登录”的本质。

---

# 💡 为什么 localStorage 做不到？

因为浏览器**不会自动把 localStorage 的内容发给 SSO 服务器**。

localStorage 是纯前端存储，没有任何跨域传递能力。

SSO 在另一个域名下，比如：

```
clientA.com
clientB.com
sso.com
```

localStorage 只能被当前页面 JS 访问，不会自动传递到 sso.com。

🔒 **SSO 需要浏览器自动携带一个“跨系统可识别的凭证”，只有 Cookie 有这个能力。**

---

# 🔥 2. Cookie 共享范围是什么？安全吗？

## 🏷️ 通过 Cookie 的 `Domain` 属性控制共享范围

### 假设你全部系统都在：

```
clientA.example.com
clientB.example.com
sso.example.com
```

那么你的 SSO cookie 可以设置：

```
Set-Cookie: SSO_SESSION=xxxx
Domain=.example.com
Secure
HttpOnly
SameSite=None
```

这样：

| 应用域名                | 能否读 cookie     | 浏览器访问 SSO 时是否会自动带上 |
| ------------------- | -------------- | ------------------ |
| clientA.example.com | ❌ (因 HttpOnly) | ✔ （浏览器自动带上）        |
| clientB.example.com | ❌              | ✔                  |
| sso.example.com     | ❌              | ✔                  |

⚠️ **注意：**
Cookie 只有在访问 SSO 时才会带过去
client-A、client-B 不能读取这个 cookie（HttpOnly），因此是安全的。

---

# 🔒 安全性机制在哪里？

## 1. HttpOnly → JS 无法读 cookie

避免 XSS 盗取。

## 2. Secure → 只有 HTTPS 才能发送 cookie

避免中间人。

## 3. SameSite=None → 允许跨站点请求带 cookie

否则 client-B 调 SSO 不能用 SSO Cookie。

## 4. Domain=.example.com → 只有指定域名下才共享

限制传播范围。

## 5. SSO_SESSION 是随机、不含用户信息的 opaque token

泄露也没啥意义，因为你还会验证 session 存不存在。

---

# 🔥 3. 为什么不能把 SSO 登录态存到 localStorage？

因为它**完全不安全**。

## ❌ 不安全点 1 —— localStorage 可以被任何 JS 获取

只要系统中一处 XSS 被攻击，攻击者：

```js
localStorage.getItem("token")
```

→ SSO session 被盗 → 全系统沦陷。

Cookie（HttpOnly）则完全不可获取。

---

## ❌ 不安全点 2 —— localStorage 无法跨域传递给 SSO

client-B 想去 SSO 验证：

浏览器访问：

```
https://sso.com/verify
```

**不会自动附带 localStorage 内容**。
结果 SSO 永远无法知道用户是否登录过。

这意味着：
🔔 **无法实现单点登录**
🔔 **无法 silent login**
🔔 **无法单点登出**
🔔 **无法跨系统共享会话**

---

## ❌ 不安全点 3 —— localStorage 内容永不过期

你得自己写逻辑清除，非常容易被绕过或错误地实现。

Cookie 可以设置：

```
max-age
expires
```

浏览器自动管理生命周期。

---

# 🎯 最终总结（非常关键）

## SSO 要实现跨系统免登录

靠的是：

### 1）浏览器自动带上一个 SSO 凭证

→ 只有 Cookie 能做（localStorage 不行）

### 2）这个 Cookie 必须是 HttpOnly

→ 不可被 JS 窃取

### 3）这个 Cookie 只被发送到 SSO 域

→ 其它系统无法读取 → 更安全

### 4）client-B 访问 SSO 验证这个 Cookie

→ 完成无感登录

---

# ✨ 用一句话总结：

> **Cookie 是唯一一种能在浏览器自动携带、跨系统传递、可控制安全范围、不会被 JS 读取的跨系统身份凭证。
> localStorage 既不安全也不能跨域，所以无法做真正的 SSO。**

* any list
{:toc}