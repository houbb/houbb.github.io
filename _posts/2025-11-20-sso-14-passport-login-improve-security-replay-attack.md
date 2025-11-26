---
layout: post
title: 权限体系之-14-passport 登录安全之重放攻击
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---



# 登录接口防重放

登录接口防重放，其实是从“能不能登录”升级到“请求是不是这一次真实发起的。

下面系统展开一下，尽量说清楚原理 + 可落地方案。

## 一、什么是“重放攻击”？

最直观的场景是这样的：

1. 用户正常登录，请求如下：

```http
POST /login
{
  "username": "admin",
  "password": "123456"
}
```

2. 攻击者通过抓包工具（Wireshark / Charles / 代理网关）获取了这次请求。

3. 过一会儿，他把这整个请求原样发一遍。

如果后端只做“账号密码校验”，那么：
👉 攻击者 = 成功登录
这就是**重放攻击（Replay Attack）**。

---

## 二、防重放的核心思想

核心只有一句话：

> 每一次请求必须是“唯一”的，不能被重复使用。

实现这个“唯一性”的典型手段就是：

✅ nonce（一次性随机数）
✅ timestamp（时间戳）
✅ signature（签名）

三者配合，构成标准安全三件套。

---

## 三、完整的防重放机制模型

推荐的登录请求结构：

```json
{
  "username": "admin",
  "password": "123456",
  "nonce": "8f3a2d9c278e4f9b",
  "timestamp": 1732689452000,
  "signature": "ab23cde890..."
}
```

字段含义：

| 字段        | 作用             |
| --------- | -------------- |
| nonce     | 一次性随机字符串，保证唯一  |
| timestamp | 请求时间，防止旧请求     |
| signature | 对内容进行加密签名，防止篡改 |

---

## 四、流程拆解（完整逻辑）

### ✅ 1. 客户端生成请求参数

```text
nonce = 随机字符串
timestamp = 当前毫秒时间戳

raw = username + password + nonce + timestamp + secretKey
signature = SHA256(raw)
```

然后发给后端。

---

### ✅ 2. 服务端校验步骤

后端收到请求后，执行以下逻辑：

#### ① 校验 timestamp

```java
if (abs(now - timestamp) > 5分钟) {
    拒绝请求
}
```

防止旧数据重放。

---

#### ② 校验 nonce 是否已用过

```text
拦截器逻辑：
- nonce 存入 Redis（设置5分钟过期）
- 如果 nonce 已存在 → 判定重放
```

Redis Key 示例：

```
login:nonce:8f3a2d9c278e4f9b => used
```

---

#### ③ 校验签名 signature

服务器使用同样算法重新计算：

```java
String serverSign = sha256(username + password + nonce + timestamp + secretKey);

if (!serverSign.equals(signature)) {
    拒绝请求
}
```

确保请求内容未被修改。

---

## 五、整体流程图（逻辑视角）

```
客户端
  ↓ 生成 nonce + timestamp + signature
请求发送
  ↓
服务端
  ↓ 校验 timestamp 是否过期
  ↓ 校验 nonce 是否重复
  ↓ 校验 signature 是否正确
  ↓ 校验账号密码
  ↓ 登录成功
```

一层比一层安全。

---

## 六、为什么这叫“质变级别的安全”

没有防重放：

* 抓一次包 = 永久可用

有防重放：

* 抓包也没用
* nonce 用过即废
* timestamp 超时即废

攻击者只能“实时伪造一次”，而不能批量复用。

---

## 七、推荐的落地方案（实战级）

### 推荐配置

| 项目       | 建议          |
| -------- | ----------- |
| nonce 长度 | 16~32位随机字符串 |
| 有效期      | 2~5分钟       |
| 存储       | Redis       |
| signed算法 | HMAC-SHA256 |
| 秘钥       | 每个客户端不同     |

---

### Java 伪代码示例

```java
boolean checkReplay(String nonce, long timestamp, String sign, String rawData) {

    // 1. 时间校验
    if (Math.abs(System.currentTimeMillis() - timestamp) > 300000) {
        return false;
    }

    // 2. nonce 检查
    if (redis.exists("nonce:" + nonce)) {
        return false;
    }

    redis.set("nonce:" + nonce, "1", 300);

    // 3. 签名校验
    String serverSign = sha256(rawData + SECRET_KEY);
    return serverSign.equals(sign);
}
```

---

## 八、可选升级方案（更安全）

### 1. 登录前获取 token challenge

流程：

1. 客户端请求 /login/challenge
2. 服务端返回 challenge + nonce
3. 客户端用 challenge 进行签名

可以避免密码明文参与签名。

---

### 2. 结合 HTTPS + 防重放

HTTPS 防止内容被窃听
nonce 防止被重复利用
这两者必须同时存在。

---

## 九、常见误区

❌ 只用 timestamp 不用 nonce
👉 攻击者仍可在时间窗口内多次重放

❌ nonce 不存储
👉 无法判定是否用过

❌ 签名使用可预测规则
👉 容易被逆推

---

## 十、登录防重放在体系中的位置

你之前提到 ums / passport / sso，其实这里的位置非常清晰：

| 系统       | 是否需要防重放   |
| -------- | --------- |
| UMS      | 用户管理后台，必须 |
| Passport | 登录中心，必须   |
| SSO      | 强烈建议      |

登录系统是最核心入口，防重放是必备底座能力。

---

## 十一、总结一句话

### 登录接口防重放 = 登录系统从“能用”升级到“真正安全”的关键跃迁

你可以记住这个公式：

> 安全登录 = HTTPS + nonce + timestamp + signature + 过期策略

---

如果你需要，我可以帮你继续拆：

* ✅ 登录防重放的完整时序图
* ✅ SpringBoot 登录拦截器示例代码
* ✅ 登录安全防护完整清单（企业级）


* any list
{:toc}