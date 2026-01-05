---
layout: post
title: 加密平台的进阶：key 要存储到哪里?
date: 2022-02-18 21:01:55 +0800 
categories: [Safe]
tags: [safe, web, in-action, sh]
published: true
---

# chat


这是一个**必须问清楚的问题**，因为如果回答不严谨，前面关于轮转、治理的讨论都会变成空谈。
我直接给你一个**工程上可落地、且符合渐进式演进的完整答案**。

---

# 轮转后的 Key 到底存储在哪里？

## 一、先给结论（最重要的一句话）

> **轮转 Key 不存“一个地方”，而是存于一个“分层的 Key 存储体系”中，
> 不同阶段、不同安全等级，对应不同的 Key 存放位置。**

这是企业级设计的关键。

---

## 二、Key 在体系中的分层（非常关键）

我们先把 Key 分成三类，否则一定会混乱：

```
Root / Master Key        （极少、最敏感）
└── Data Encryption Key （会轮转）
    └── Encrypted Data
```

你问的“轮转 key”，**指的是 Data Encryption Key（DEK）**。

---

## 三、标准答案：KMS 视角下的 Key 存储结构

### 逻辑结构（不依赖具体实现）

```
KMS
 ├── Key Metadata
 │    ├── alias
 │    ├── version
 │    ├── status
 │    ├── scope
 │    └── created_at
 │
 └── Encrypted Key Material
      └── encrypt(DEK, Master Key)
```

**重点：**

* 数据库中存的是 **“被加密的 Key”**
* 明文 Key **不落盘**

---

## 四、不同阶段，Key 实际放在哪里？

这是你真正关心的部分。

---

## Stage 0 / MVP 阶段（最现实）

### 存储方式

* **数据库表**
* DEK 使用 Master Key 加密后存储

```
key_material = Encrypt(DEK, MasterKey)
```

### Master Key 在哪里？

* 不在数据库
* 通常来自：

  * 环境变量
  * 启动参数
  * 部署时注入

### 特点

* 成本低
* 易实现
* 风险集中在 Master Key

👉 **这是“可接受的工程妥协”**

---

## Stage 1–2（平台期，推荐）

### 存储方式

* 仍是数据库
* 但：

  * Master Key 不再是明文环境变量
  * 而是来自 **OS KeyStore / TPM / Vault**

#### 示例

* Linux keyring
* HashiCorp Vault
* 云厂商 KMS（仅用于包裹）

### 结构

```
DB: encrypt(DEK, KEK)
KEK: 来自安全存储
```

---

## Stage 3（企业级）

### 存储方式（最佳实践）

#### 方案 A：HSM

* DEK 永远不出 HSM
* 解密操作在 HSM 内完成

#### 方案 B：云 KMS

* 使用 Envelope Encryption
* 云 KMS 管理 KEK
* 平台管理 DEK 生命周期

---

## 五、Key 轮转时，具体发生了什么？

这是很多人真正卡住的地方。

### Key 轮转 ≠ 覆盖旧 Key

#### 正确流程：

1. 生成新 DEK（Version +1）
2. 用 Master Key 加密后存储
3. 标记新 Key 为 ACTIVE
4. 旧 Key 标记为 DEPRECATED
5. **旧 Key 仍然存在**

---

### 为什么旧 Key 必须存在？

> 因为历史数据还在用它。

**Key 轮转的核心不是“删”，而是“退役”。**

---

## 六、Key 什么时候可以真正删除？

只有在满足以下条件之一时：

1. 历史数据已经被重加密
2. 数据已经被清理（过期）
3. 合规允许销毁

在此之前：

* Key 必须保留
* 但权限、用途被严格限制

---

## 七、一个常见但危险的错误做法（必须点名）

❌ 错误做法：

> 每次轮转，把数据库里的 key_material 覆盖掉

结果：

* 所有历史数据永久不可解
* 实际上你“破坏了数据”，不是提高了安全

---

## 八、轮转 Key 的安全边界在哪里？

### 攻击者想要解密数据，必须同时拿到：

1. **数据库中的加密 Key**
2. **Master Key / KEK**
3. **调用路径的执行权限**

> 这叫 **分层防御（Defense in Depth）**

---

## 九、为什么这种存储方式支持“渐进式”？

因为：

* 初期：DB + Env Master Key
* 中期：DB + Vault / OS
* 后期：HSM / 云 KMS

**Key Alias / Version / 轮转逻辑完全不变**

👉 你换的是“底座”，不是“模型”。


# 参考资料

* any list
{:toc}