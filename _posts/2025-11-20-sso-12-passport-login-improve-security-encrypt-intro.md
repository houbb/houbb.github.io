---
layout: post
title: 权限体系之-12-passport 登录安全之加密策略 
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---



# 加密策略安全性问题

这一块其实正是「密码安全的分水岭」。

很多系统还停留在 **“MD5 + salt = 安全” 的认知阶段**，但在今天的攻防环境下，这已经远远不够了。

我从工程角度给你拆清楚：

---

# 一、MD5 + salt 到底差在哪里？

很多系统的“安全设计”大概是这样：

```text
password = 用户输入
salt = 随机字符串
hash = MD5(password + salt)
```

看起来很专业，但问题非常大。

## 1. MD5 本质是“高速哈希算法”

MD5 设计目标不是安全，而是：

> 快速计算 + 快速校验完整性

在密码领域，**快是致命缺陷**。

### 现实攻击成本：

* GPU 每秒可计算：

  * 💥 数十亿次 MD5
* 也就是说：
  一个 8 位复杂密码，在离线下可能几分钟就被跑出来。

安全密码的目标恰恰相反：

> 必须慢到攻击者无法批量尝试。

---

## 2. Salt 并没有解决“暴力破解”问题

Salt 的作用是什么？

✅ 防止相同密码得到相同 hash
✅ 破坏预生成彩虹表

但它无法阻止：

* 暴力枚举
* GPU 并行破解
* 撞库攻击

即便你这样：

```text
MD5(salt + password)
```

攻击者只需要：

```
读取 salt
暴力尝试密码
对每个密码重新 MD5(salt + guess)
```

Salt ≠ 防破解
Salt 只是让破解“更麻烦，但还远不够”。

---

## 3. MD5 已被彻底破坏

MD5 已经存在：

* 碰撞攻击
* 安全漏洞
* 被公开破解工具支持

在安全标准里：

> MD5 已被明确列为不适合用于密码存储。

---

# 二、真正安全的密码保护目标是什么？

现代密码保护的目标是：

不是“无法破解”，而是：

✅ 让破解成本高到不值得
✅ 即使数据库泄露也无法短时间解出
✅ 单条密码破解耗费巨大资源

所以设计理念变成：

| 传统思路  | 现代思路   |
| ----- | ------ |
| 快速哈希  | 有意减慢   |
| 一次计算  | 多轮迭代   |
| 单线程友好 | GPU不友好 |

---

# 三、安全算法：bcrypt / PBKDF2 / scrypt 的核心优势

它们专门为“密码存储”而设计，而不是通用哈希。

## 核心特性对比

| 特性   | MD5 | bcrypt | PBKDF2 | scrypt |
| ---- | --- | ------ | ------ | ------ |
| 设计目标 | 校验  | 密码     | 密码     | 密码     |
| 抗GPU | ❌   | ✅      | ✅      | ✅      |
| 可调成本 | ❌   | ✅      | ✅      | ✅      |
| 迭代机制 | ❌   | ✅      | ✅      | ✅      |
| 安全级别 | 极低  | 高      | 高      | 很高     |

---

# 四、为什么“慢”反而安全？

以 bcrypt 为例：

bcrypt 有一个 cost 参数，比如 12：

```
cost = 12
实际计算次数 ≈ 2^12 = 4096 次
```

攻击者想破解一个密码：

* 需要执行 4096 次加密
* 每次都很耗 CPU

如果数据库有 100 万用户：

```
100万 * 4096 次 = 40亿次计算
```

成本直接爆炸。

这就是 **指数级提高破解成本**。

---

# 五、你提到的三点，是现代密码系统的核心

我们逐条拆解。

---

## ✅ 1. 使用 bcrypt / PBKDF2 / scrypt

推荐优先级：

```
企业系统推荐：
bcrypt > Argon2 > PBKDF2 > scrypt
```

特点说明：

### bcrypt

* 自动管理 salt
* 自带 cost 参数
* 被广泛验证成熟

### PBKDF2

* 可控迭代次数
* Java 原生支持
* 稳定可靠

### scrypt

* 引入内存消耗机制
* 对 GPU 更不友好

推荐实践：

* Web 系统：bcrypt 或 PBKDF2
* 高安全系统：Argon2

---

## ✅ 2. 每个用户独立 salt

真正安全的结构应该是：

```json
{
  "user_id": 1001,
  "password_hash": "$2a$12$aSdfk93...asdasd",
  "salt": "unique_random_string"
}
```

意义是：

| 情况       | 结果        |
| -------- | --------- |
| 两个用户密码相同 | hash 完全不同 |
| 字典攻击     | 必须逐个用户重新算 |
| 彩虹表      | 全部失效      |

---

## ✅ 3. 增加迭代次数（或成本因子）

这个是安全与性能的平衡点。

建议值：

| 算法     | 推荐值               |
| ------ | ----------------- |
| bcrypt | cost = 10 ~ 14    |
| PBKDF2 | 100,000 ~ 300,000 |
| scrypt | N=16384, r=8, p=1 |

原则：

> 服务器可承受最大延迟但用户无明显感知。

例如：
登录耗时 200~500ms 是完全合理的。

---

# 六、为什么可以防止“反推出明文密码”？

因为这类算法具备：

✅ 单向性（不可逆）
✅ 多轮运算
✅ 随机 salt
✅ 高计算成本

即使攻击者拿到数据库：

* 无法直接解出密码
* 只能暴力猜测
* 每次尝试都非常昂贵

彩虹表攻击直接失效，因为：

```
hash = bcrypt(password + uniqueSalt)
```

每个用户都不同，预计算完全没意义。

---

# 七、推荐 Passport 平台的安全密码结构

推荐结构示例：

```
user_password_table
------------------
user_id
password_hash
salt
algorithm
cost
updated_at
```

登录校验流程：

```
用户输入密码
 → 读取该用户 salt + cost
 → 使用指定算法加密输入密码
 → 与数据库 hash 对比
 → 匹配则通过
```

---

# 八、Java 示例：bcrypt 安全实现

推荐使用 Spring Security：

```java
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

// 注册时
String hash = encoder.encode(password);

// 登录校验
boolean matches = encoder.matches(inputPassword, hash);
```

它已自动：

* 生成 salt
* 处理迭代
* 管理成本参数

无需自己造轮子。

---

# 九、错误示范 vs 正确示范

### ❌ 错误方式

```java
String hash = md5(password + salt);
```

### ✅ 正确方式

```java
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
String hash = encoder.encode(password);
```

---

# 十、总结一句非常重要的话

> MD5 + salt 的安全等级，已经只是“心理安慰级别”。

真正安全的密码存储必须满足：

* 慢哈希算法
* 可调成本
* 每用户独立 salt
* 抗GPU攻击

---

# ✅ 推荐落地方案总结

如果你要构建安全 Passport 平台，我建议：

✔ bcrypt（cost=12）
✔ 独立 salt
✔ 强密码规则
✔ 密码历史限制
✔ 登录失败风控
✔ 密码修改审计


* any list
{:toc}