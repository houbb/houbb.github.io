---
layout: post
title: 权限体系之-38-sso 单点登录实现+开放接口+客户端测试例子
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---

# chat

## CRUD

在已有的这2个表（sso_client_uri+sso_tickets）的 crud 基础上，sso 平台已有登录功能。

在这个基础上增强，让其支持 sso 单点登录。

给出 sso 前端的登录调整+sso 后端的提供 openapi 接口，可以是 /openapi 开头的 http 请求。

其他系统请求根据 ticket 换取 token 时，需要携带对应的 apiKey，和普通的用户登录区分开。

这个以前已经维护了

```sql
 desc sys_user_apikey;
+-------------+--------------+------+-----+----------------------+--------------------------------+
| Field       | Type         | Null | Key | Default              | Extra                          |
+-------------+--------------+------+-----+----------------------+--------------------------------+
| id          | bigint(20)   | NO   | PRI | NULL                 | auto_increment                 |
| user_id     | bigint(20)   | NO   | MUL | NULL                 |                                |
| api_key     | varchar(128) | NO   | UNI | NULL                 |                                |
| name        | varchar(64)  | NO   |     | NULL                 |                                |
| status      | tinyint(4)   | NO   | MUL | 1                    |                                |
| expire_time | datetime(3)  | YES  | MUL | NULL                 |                                |
| remark      | varchar(255) | YES  |     | NULL                 |                                |
| create_time | datetime(3)  | NO   | MUL | CURRENT_TIMESTAMP(3) |                                |
| update_time | datetime(3)  | NO   |     | CURRENT_TIMESTAMP(3) | on update CURRENT_TIMESTAMP(3) |
| creator_id  | bigint(20)   | YES  |     | NULL                 |                                |
| updater_id  | bigint(20)   | YES  |     | NULL                 |                                |
| delete_flag | tinyint(4)   | NO   |     | 0                    |                                |
+-------------+--------------+------+-----+----------------------+--------------------------------+
```

访问的开放接口定义+访问日志以前表也定义好了：

```sql
mysql> desc sys_openapi;
+-------------+--------------+------+-----+----------------------+--------------------------------+
| Field       | Type         | Null | Key | Default              | Extra                          |
+-------------+--------------+------+-----+----------------------+--------------------------------+
| id          | bigint(20)   | NO   | PRI | NULL                 | auto_increment                 |
| name        | varchar(128) | NO   |     | NULL                 |                                |
| code        | varchar(128) | NO   | UNI | NULL                 |                                |
| description | varchar(512) | YES  |     | NULL                 |                                |
| method      | varchar(16)  | YES  |     | NULL                 |                                |
| path        | varchar(256) | YES  |     | NULL                 |                                |
| status      | tinyint(4)   | NO   | MUL | 1                    |                                |
| create_time | datetime(3)  | NO   |     | CURRENT_TIMESTAMP(3) |                                |
| update_time | datetime(3)  | NO   |     | CURRENT_TIMESTAMP(3) | on update CURRENT_TIMESTAMP(3) |
| creator_id  | bigint(20)   | YES  |     | NULL                 |                                |
| updater_id  | bigint(20)   | YES  |     | NULL                 |                                |
| delete_flag | tinyint(4)   | NO   |     | 0                    |                                |
+-------------+--------------+------+-----+----------------------+--------------------------------+
> desc sys_openapi_access_log;
+----------------+--------------+------+-----+----------------------+--------------------------------+
| Field          | Type         | Null | Key | Default              | Extra                          |
+----------------+--------------+------+-----+----------------------+--------------------------------+
| id             | bigint(20)   | NO   | PRI | NULL                 | auto_increment                 |
| apikey_id      | bigint(20)   | NO   | MUL | NULL                 |                                |
| openapi_id     | bigint(20)   | NO   | MUL | NULL                 |                                |
| request_params | text         | YES  |     | NULL                 |                                |
| response_body  | text         | YES  |     | NULL                 |                                |
| response_code  | int(11)      | YES  |     | NULL                 |                                |
| response_time  | int(11)      | YES  |     | NULL                 |                                |
| success_flag   | tinyint(1)   | YES  | MUL | 1                    |                                |
| ip_address     | varchar(64)  | YES  |     | NULL                 |                                |
| status         | tinyint(4)   | NO   | MUL | 1                    |                                |
| remark         | varchar(255) | YES  |     | NULL                 |                                |
| error_code     | varchar(64)  | YES  | MUL | NULL                 |                                |
| error_message  | text         | YES  |     | NULL                 |                                |
| create_time    | datetime(3)  | NO   | MUL | CURRENT_TIMESTAMP(3) |                                |
| update_time    | datetime(3)  | NO   |     | CURRENT_TIMESTAMP(3) | on update CURRENT_TIMESTAMP(3) |
| creator_id     | bigint(20)   | YES  |     | NULL                 |                                |
| updater_id     | bigint(20)   | YES  |     | NULL                 |                                |
| delete_flag    | tinyint(4)   | NO   |     | 0                    |                                |
+----------------+--------------+------+-----+----------------------+--------------------------------+
```


同时创建一个用于测试的前后端项目，验证 sso 登录的正确性。

```
sso-client-backend
sso-client-frontend
```

技术栈和现在的类似，功能尽可能的简化。

给出单点登录的详细设计+交互设计，不需要具体的代码。

## 最少改动

好的，我们把你的 **SSO 设计进一步极限简化**——**后端只新增一个接口：根据 ticket 换 user 信息**。
登录、JWT、会话、密码校验全部复用你当前已有的 UserController.login 逻辑，只是在登录成功后，额外发放一次性 Ticket。

下面给你一个 **最小但完整的“可落地的 SSO 能力”设计**，包括流程、接口、页面交互、错误处理、测试客户端结构等。

---

# ✅ **一、最终版 SSO 方案（极简）**

SSO 平台复用原有登录接口，只做两件事：

### **1）当其他系统跳转到 /login 时，SSO 平台能识别一个 client 登录请求，并在登录成功后颁发一次性 ticket。**

### **2）新增一个开放接口：根据 ticket 换取用户信息（或签发 jwt）**

其他系统统一调用此接口，不需要其他开放接口。

---

# ✨ **二、前端交互（SSO 登录页）**

## **1. 登录页 URL 结构（新增参数）**

```
/login?client_id=xxx&redirect_uri=xxx&state=xxx
```

参数说明：

| 参数           | 说明                       |
| ------------ | ------------------------ |
| client_id    | 在 sso_client_uri 注册的系统标识 |
| redirect_uri | 业务系统传来的回跳地址，必须在白名单内      |
| state        | 业务系统原始 state，用于防止 CSRF   |

> 这三个参数只有“业务系统发起登录”时才存在，用户在 SSO 网站本身登录不需要。

---

## **2. 登录页判断逻辑**

### （1）如果无 client_id，就是普通登录

→ 走现有逻辑
→ 返回用户自己的 SSO 首页

### （2）如果带 client_id，则是 SSO 登录

流程变为：

1. 用户输入用户名密码
2. 调用 UserController.login（已有）
3. 登录成功 → 创建 ticket → 302 回跳业务系统
4. 回跳 URL：

```
redirect_uri?ticket=XXXXX&state=YYY
```

---

# 🎫 **三、一次性 Ticket 发放逻辑**

你已有 `sso_tickets` 表，流程如下：

1. 生成随机 ticket（128 长度）
2. 写入表
3. expire_time = now() + 60s
4. used = 0

写入示例：

| 字段           | 内容          |
| ------------ | ----------- |
| ticket       | 随机 128 位字符串 |
| user_id      | 当前用户        |
| client_id    | 从请求参数而来     |
| redirect_uri | 从本次请求带来     |
| state        | 从请求带来       |
| expire_time  | now()+60s   |
| used         | 0           |

此逻辑直接加到 **UserController.login 的成功返回之前**。

---

# 🔐 **四、后端新增唯一接口：ticket 换 user 信息**

新增开放接口（openapi 系统内注册）：

```
POST /openapi/sso/ticket/verify
```

## **请求参数（POST JSON）**

```json
{
  "ticket": "xxxx",
  "apiKey": "client-api-key"
}
```

## **调用方流程**

* 请求头可带签名，也可不用（你现有规范即可）
* apiKey 在 sys_user_apikey 表中校验
* ticket 必须存在、未过期、未使用、未删除

---

## **接口校验规则**

| 校验项                        | 说明                                 |
| -------------------------- | ---------------------------------- |
| ticket 存在                  | 必须在 sso_tickets                    |
| ticket.used == 0           | Ticket 必须一次性                       |
| ticket.expire_time > now() | 必须未过期                              |
| apiKey 有效                  | 必须存在且未过期                           |
| 关联关系验证（可选）                 | apiKey 对应用户与 client_id 允不允许（可配可不配） |

---

## **返回结果示例**

### ✔ 正常返回

```json
{
  "success": true,
  "user_id": 1001,
  "username": "echo",
  "extra": {
    "roles": ["admin"],
    "email": "a@b.com"
  }
}
```

并把 `ticket.used = 1`

---

### ❌ ticket 过期

```json
{
  "success": false,
  "error": "TICKET_EXPIRED"
}
```

---

### ❌ apiKey 无效

```json
{
  "success": false,
  "error": "APIKEY_INVALID"
}
```

---

# 🖼 **五、业务系统（sso-client）侧流程**

业务系统也极简：

## **1. 未登录，保护接口发现无 token**

跳转 SSO：

```
https://sso.com/login
?client_id=client-A
&redirect_uri=https://a.com/sso/callback
&state=xyz123
```

---

## **2. 登录后回跳（带 ticket）**

```
GET /sso/callback?ticket=xxxx&state=xyz123
```

---

## **3. 后端调用 SSO ticket 校验接口**

```http
POST https://sso.com/openapi/sso/ticket/verify
{
  "ticket": "xxxx",
  "apiKey": "client_api_key"
}
```

---

## **4. 校验成功 → 业务系统给用户签发自己的 JWT**

业务系统用自己的 token 管用户本地会话：

```
jwt = generateJWT(user)
set-cookie jwt
redirect to home
```

---

# 🧪 **六、测试用 sso-client 项目结构（极简）**

```
sso-client-backend/
  ├── /login-check      未登录跳转 sso
  ├── /sso/callback     sso 回跳处理，换 user 并签发本系统 jwt
  └── /me               测试当前用户

sso-client-frontend/
  ├── 登录检测中间件
  ├── /profile 页面
  └── axios 封装
```

你只需要：

* 前端检测无 token → 跳 SSO
* 后端收到 ticket → 调 verify → 发自己的 token → 前端写 cookie

---

# 🚪 **七、SSO 登录页交互 UX**

### 登录页 UI 不变，只是增强行为：

#### **（1）当 url 中包含 client_id 时**

顶部提示：

> 🔐 你正在登录系统：Client-A

#### **（2）登录成功直接 302 回跳**

#### **（3）失败正常展示错误**

---

# 📌 **八、必要的配置/安全考虑**

| 关键点                             | 作用     |
| ------------------------------- | ------ |
| Ticket 一次性使用                    | 安全性核心  |
| Ticket 过期时间建议 60 秒              | 防止劫持   |
| redirect_uri 必须在白名单中            | 防止钓鱼攻击 |
| client_id 必须在 sso_client_uri 注册 | 来源可信   |
| apiKey 必须属于该 client 的系统账号       | 权限隔离   |

---

# 🎉 最终，这是可落地、可上线的 SSO 极简实现

* 登录不拆分，不改架构 → **复用现有 login**
* 新增 ticket 表 + ticket 发放逻辑
* 新增 **唯一一个**开放接口
* 两张 client/ticket 表管理 CRUD 已完成
* 可用 sso-client 项目验证全流程

* any list
{:toc}