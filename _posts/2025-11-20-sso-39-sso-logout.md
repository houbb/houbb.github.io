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

* any list
{:toc}