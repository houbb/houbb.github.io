---
layout: post
title: 权限体系之-39-sso 单点登出 极简 SLO 模式
date: 2025-11-20 1412:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# chat

```
类似的 给出单点登出的详细设计+交互，不需要具体代码。提供 openapi 登出，尽量复用以前的登出逻辑，同时销毁我们的 ticket。
```

## 极简但完善、可落地的「单点登出（Single Logout，SLO）」详细设计

下面给出一个 **极简但完善、可落地的「单点登出（Single Logout，SLO）」详细设计**，保持与你的系统架构完全一致，同时最大化复用原有的：

* 已有 UserController.logout（用户本地 JWT/session 注销逻辑）
* 已有 sys_openapi（对外开放接口）
* 已有 sys_user_apikey（用于鉴权）
* 已有 sso_tickets（一次性 login ticket）
* 已有登录流程

并在此基础上加入 **最低成本、可运作的 SSO 单点注销能力**。

---

# 🚪 **一、单点登出的目标（极简 SLO 模式）**

我们现在采用 **“前端全局跳 SSO 注销 + 后端链接清理 + ticket 失效”** 的模式，优点：

* **无需维护 session store**
* **无需反向通知所有 client**
* **不需要朝 CAS/Keycloak 那样复杂的回调登出机制**
* **业务系统仍然自己管理自己的 JWT**

总目标：

> 只要用户在 SSO 登出，他就能“彻底登出所有系统”，业务系统会在下次访问时自动跳回 SSO 要求重新登录。

---

# 🧩 **二、单点登出的完整交互方案**

## 🍃 **（1）用户在任意业务系统点击“退出登录”**

业务系统前端不直接清 JWT，而是：

### **→ 跳转：**

```
https://sso.com/logout?redirect_uri=https://client-a.com/logout-finish
```

> 这样由业务系统统一发起退出，不需要 client 去调用 openapi。

---

## 🍃 **（2）SSO /logout 页面逻辑**

登录状态下：

1. 清除用户 SSO 登录态（复用现有 logout）
2. **同时清理所有未使用的 ticket（用 sso_tickets 表）**

   * 把该 user_id 且 used=0 的改为 used=1 或 status=0
3. 回跳至业务系统提供的 redirect_uri

最终跳转：

```
https://client-a.com/logout-finish
```

---

## 🍃 **（3）业务系统的 logout-finish 页面做两件事：**

1. 清空本系统 JWT / localStorage
2. 显示“已成功退出登录”，或跳转至首页

---

# 🧼 **三、后端提供 openapi 的“远程登出接口”**

虽然前端跳转方式可以满足 90% 场景，但某些系统（如后台服务）可能需要后端主动调用 API，因此需要一个简化的 openapi 登出接口。

## **接口：POST /openapi/sso/logout**

### 请求示例

```json
{
  "apiKey": "client-api-key",
  "user_id": 1024
}
```

## 接口职责

1. 校验 apiKey（复用 sys_user_apikey）
2. 将该 user_id 在 sso_tickets 中所有未使用未过期的 ticket 标记为 used=1 或 status=0
3. 不负责业务系统自己的 token 清理（业务系统本地自行处理）
4. 记录到 sys_openapi_access_log（现有逻辑复用）

---

# 🗄 **四、数据层：如何处理 ticket（注销时）**

## 当触发 SSO logout 时（前端跳转 /logout）：

```
UPDATE sso_tickets
SET used = 1
WHERE user_id = ${userId}
  AND used = 0
  AND delete_flag = 0;
```

## 当业务方调用 openapi /sso/logout：

同上，只是 user_id 来自于接口参数。

> 不删除，只标记 `used = 1` 更安全，防止 ticket 被意外重复使用。

---

# 🎨 **五、SSO 前端交互（登出页面）**

### SSO 登出页的行为

#### 页面 URL：

```
/logout?redirect_uri=https://client-a.com/logout-finish
```

#### UI 流程：

* 检测是否已登录

  * 已登录 → 调用已有的 logout（）逻辑
  * 未登录 → 直接跳 redirect_uri
* UI 可显示 “正在退出登录...”
* 后端完成 ticket 清理后立即 302

---

# 🔐 **六、业务系统前端交互**

在业务系统任意页面点击“退出登录”，流程为：

```
window.location = 
  SSO_URL + "/logout?redirect_uri=" + encodeURIComponent(CLIENT_LOGOUT_FINISH_URL)
```

CLIENT_LOGOUT_FINISH_URL 通常为：

```
https://client.com/auth/logout-finish
```

---

# 📁 **七、业务系统后端（可选）实现“自动失效 token”**

业务系统可配置一个简单中间件：

如果当前用户访问 API 时：

1. 检测本地 JWT 是否存在
2. 用户访问到受保护接口
3. 一旦 JWT 校验失败或不存在 → 自动跳 SSO：

```
/login?client_id=xxx&redirect_uri=xxx
```

这样就能实现：

> 用户从任意系统退出后，回到其他系统会自动跳回 SSO 登录页，实现真正意义的“单点退出”。

---

# 🔨 **八、单点登出流程图（简化版）**

```
        [Client 系统]
               |
               | 用户点击退出
               |
               V
        https://sso.com/logout
               |
               | 清 SSO 登录态
               | 清 sso_tickets
               |
               V
     redirect_uri = client/logout-finish
               |
               V
  [client/logout-finish 页面]
     - 清自己系统的 JWT
     - 跳首页 or 显示“退出成功”
```

---

# ⭐ **九、此方案的优点**

### ✔ 最大复用已有登录/登出逻辑

无须修改 UserController.login/logout 的核心逻辑

### ✔ 不需要 session store

SSO 平台无状态，所有依赖 ticket 数据库

### ✔ 数据一致性简单

只操作 ticket 表即可

### ✔ 不牵涉广播登出 / 回调机制

你现在的系统完全能支撑

### ✔ 对接非常容易

只需要业务系统遵守统一 logout 跳转规则即可

# 分布式系统中，有必要实现所谓的单点登出吗？

我直接给你一个 **“工程角度 + 业务角度 + 成本角度”** 的清晰判断，告诉你什么时候 **需要 SLO（单点登出）**，什么时候 **根本没必要**。

你会发现很多公司其实都不做真正的单点登出——因为大多数场景 **不值得**。

---

# 🧩 **先说结论**

## ✔️ **绝大多数内部系统 / 企业系统 / SaaS 管理后台 —— 不需要单点登出（SLO）**

因为：

* 成本高
* 复杂度高
* 价值低
* 用户几乎不会刻意 Logout
* 无法保证所有系统都能“优雅响应”登出广播
* 你系统越多，越难保证一致性

你现在这个“client-A、client-B、client-C 多系统统一登录”的场景，本质上就是企业内部应用或平台型产品，不是对外大型互联网服务，所以：

> **没必要做真正的单点登出（广播式 SLO）。
> 做“被动式 SLO”即可。**

---

# 🟦 那什么是“被动式单点登出”？（企业最常用）

**做法非常简单，也非常安全：**

1. 用户 logout
2. SSO 把自己的 session 删除
3. 用户跳转到任意 client 时，因为 client 的 token 是本地签发的
4. client 再去访问 `/sso/verify` → SSO 告诉你 session 已失效
5. client 发现用户在 SSO 未登录 → 重定向去登录页

**完全不需要广播登出其他系统。**

**优点：**

* 简单
* 可靠
* 不涉及分布式消息
* 不用让每个子系统接收 SLO 通知
* 延迟几秒毫无影响
* 不会有一致性问题

你会发现这就是你最容易实现、最经济的方案。

---

# 🟥 那什么时候才“必须”做真正的单点登出（广播式 SLO）？

只有以下三个场景：

## ① **互联网平台，多端登录，必须即时踢下线**

如：

* 微信 PC/手机端互踢
* 淘宝账号安全登出
* 在线网银，多端会话控制
* 大规模 B 端平台，一账号多人登

需求：
用户改密码 / 风险校验 / 手机被盗 时，必须立刻让所有设备下线。

## ② **OAuth / OIDC 身份提供商（IDP）合规要求**

比如你要对接：

* Azure AD
* Keycloak
* Auth0
* 企业版 WeCom
* OpenID Connect RP 客户要求

因为协议里有 Logout Token / Front-Channel Logout。

## ③ **SaaS 产品，为了节省 License（并发登录受限）**

例如一个账号最多登录 1 个设备。
登陆新的设备 → 旧设备必须立即退出。

---

# 🟨 企业内部系统为什么一般不做 SLO？

你的情况就是：
**client-A、client-B、client-C 都是内部业务子系统。**

这些系统：

* 用户不同时登录很多端
* 用户退出概率很低
* 即便退出了，旧系统不退出也不影响安全
* 内网系统很少存在 session 被盗风险
* 复杂度巨大（需要广播、回调、事件总线）

最关键的是：

> **只要 SSO 失效，所有子系统就会自动失效。
> 不需要立即登出，就足够安全。**

---

# 🔥 分布式系统为什么做 SLO 很麻烦？

因为要解决这些问题：

### 1. 多客户端（client-A, B, C）回调接口统一？

不同语言，不同框架，不同部署方式。

### 2. 广播机制？

* Kafka？
* Redis Pub/Sub？
* HTTP 回调？
* WebSocket？
* Server-Sent Events？

### 3. 网络失败怎么办？

A 下线成功
B 超时失败
C 无响应
→ 会话状态不同步。

### 4. 子系统本地 token 要不要立即失效？

但子系统本地是独立签发的，这本身就违背 SLO 设计。

**所以 SLO 是一个大坑。没必要跳进去。**

---

# 🟩 **最佳实践（99% 企业用）**

## ✔️ 保留 “单点登录（SSO）”

## ✔️ 不实现 “主动式单点登出（SLO）”

## ✔️ 实现 “被动式登出验证” —— 足够安全且简单

流程如下：

1. 用户在任意系统点击登出
2. 删除 SSO Session
3. 将用户重定向到 SSO 登录页
4. 下次访问其他系统时 → 调用 `/verify`
5. 因为 SSO session 已失效 → 自动跳回登录

结果：

* 全系统全部失效
* 安全
* 简单
* 可靠
* 无需广播
* 成本极低

这是大多数公司实际使用的模式。

---

# 🎯 最后总结（非常关键）

## ✔ “单点登录” 是必须的

用户只登录一次，全网通行。

## ✔ “强制单点登出（SLO）” 大多数场景没价值，也很难做

只在非常少数场景需要：

* 多端强制下线
* 合规 OAuth/OIDC
* 设备保护
* 受限 License

## ✔ 对你来说

你的场景——内部多系统统一登录平台——
**不需要真正的 SLO。
被动 SLO 足够了。**

* any list
{:toc}