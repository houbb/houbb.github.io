---
layout: post
title: 加密平台的进阶：key store 存储
date: 2022-02-18 21:01:55 +0800 
categories: [Safe]
tags: [safe, web, in-action, sh]
published: true
---

# chat

# key store 存储

包括：**为什么要解耦、解耦后 Key 实际放在哪里、这一步在整个 Roadmap 中的战略意义**。

---

# 基础 Key 抽象（Foundation of KMS）

## 一、先给结论（核心认知）

> **基础 Key 抽象的目的，不是为了“藏 Key”，
> 而是为了让 Key 从“代码级资源”升级为“平台级资源”。**

这一步做对了，后面所有能力（轮换、治理、合规）才成立。

---

## 二、什么是「基础 Key 抽象」

### 1️⃣ 在 MVP 阶段，我们到底抽象了什么？

你并没有一开始就上完整 KMS，而是先引入三层概念：

```
业务代码
   ↓
Key Alias（逻辑标识）
   ↓
Key Version（手工）
   ↓
真实 Key Material
```

业务代码**只接触第一层**。

---

### 2️⃣ Key Alias 是什么？

> **Key Alias = 业务语义化的 Key 名称**

示例：

* order.id_card
* user.phone
* payment.sign

#### Alias 的设计目的

* 稳定
* 有业务含义
* 永远不变（或极少变）

---

### 3️⃣ Key Version（手工）是干什么的？

> **Key Version = 同一个 Alias 下的 Key 演进轨迹**

在 MVP 阶段：

* 版本创建靠人
* 切换靠配置
* 不自动轮换

这是**有意的克制设计**。

---

## 三、为什么必须让业务代码与真实 Key 解耦？

这是整个问题的核心。

---

### 1️⃣ 如果不解耦，会发生什么？

#### 传统写法（常见）

```java
SecretKey key = new SecretKeySpec("xxx".getBytes(), "AES");
```

或者：

* Key 写在配置
* Key 写在环境变量

#### 带来的后果

* Key = 代码的一部分
* 改 Key = 改代码
* 谁用 Key 完全不可控

---

### 2️⃣ 解耦之后，业务代码只表达“意图”

```java
encrypt(data, "order.id_card");
```

业务代码只关心：

* 我在加密什么
* 属于哪个业务语义

不关心：

* Key 是什么
* Key 在哪
* Key 有没有换过

---

### 3️⃣ 这一步的本质意义

> **你把“安全决策权”从开发者手里，
> 迁移到了平台和组织层面。**

这不是技术问题，是治理问题。

---

## 四、那么问题来了：真实 Key 放在哪里？

这是你问得**非常专业、也非常现实**的问题。

答案是：

> **在 MVP 阶段，Key 可以还“不高级”，但“位置必须正确”。**

---

## 五、MVP 阶段 Key 的推荐存放位置

### 1️⃣ 推荐结构（最小可用）

```
Key Store
 ├─ key_alias
 ├─ key_version
 ├─ algorithm
 ├─ key_material（加密存储）
 └─ status
```

---

### 2️⃣ Key Store 可以是什么？

在 MVP / Stage 0：

#### 可选方案（按推荐顺序）

1. **数据库（加密字段）**

   * Key Material 使用 Master Key 再加密
2. **本地安全文件 + 访问权限**
3. **操作系统 KeyStore（如 JCEKS）**

> 注意：
> MVP 阶段不强制 HSM / 云 KMS，但**结构必须为它们预留接口**。

---

### 3️⃣ Master Key 放在哪里？

这是第二层问题。

#### 常见做法

* Master Key：

  * 环境变量
  * 启动参数
  * 或部署时注入

> **你是在延后风险，而不是消除风险**
> 但这是“渐进式”的必要妥协。

---

## 六、Key 是如何被业务“用到”的？

### 1️⃣ 调用路径（本地模式）

```
业务代码
  ↓ (Key Alias)
Crypto SDK
  ↓
Key Resolver
  ↓
Key Store
  ↓
真实 Key Material
```

业务永远拿不到 Key 本身。

---

### 2️⃣ 如果未来切换到远程 KMS？

路径变成：

```
业务代码
  ↓
Crypto SDK
  ↓
Crypto Service
  ↓
KMS
```

业务代码 **完全不用动**。

---

## 七、为什么说这是“第一次真正解耦”？

因为在此之前：

| 层级         | Key 归属  |
| ---------- | ------- |
| 传统         | 个人 / 项目 |
| 基础 Key 抽象后 | 平台 / 组织 |

这一步一旦完成：

* Key 可以换
* 实现可以换
* 存储方式可以换
* 执行位置可以换

**业务代码不变。**

---

## 八、这一设计在 Roadmap 中的战略意义

### 如果这一步做错了：

* 后续轮换几乎不可能
* 审计只能是“猜”
* 平台永远只能做“工具”

### 如果这一步做对了：

* KMS v2 自动轮换顺理成章
* Key Scope 自然落地
* 合规不是补丁

# 参考资料

* any list
{:toc}