---
layout: post
title:  Hash-11-聊一聊哈希函数 Hash Function
date:  2018-05-30 09:57:55 +0800
categories: [Algorithm]
tags: [algorithm, hash, hashing]
published: true
---

# 拓展阅读

[一致性 hash 算法](https://houbb.github.io/2018/08/13/consistent-hash)

[java hash 实现](https://houbb.github.io/2018/05/30/hash-impl)

[hash 冲突处理](https://houbb.github.io/2018/05/30/hash-conflict)

[bloom filter](https://houbb.github.io/2018/12/05/bloom-filter)

[bloom filter 使用最佳实践，让你少采坑！](https://houbb.github.io/2019/04/01/BloomFilter-best-practice)

# todo

sdk 包的封装+文档

# chat

# 详细介绍一下哈希函数

当然可以！下面我们系统性、通俗地来讲讲哈希的灵魂——**哈希函数（Hash Function）**。

---

## 🧠 什么是哈希函数？

哈希函数就是一种**将输入数据（任意长度）压缩成固定长度输出**的函数。

你可以把它想象成：

> ✨ 一个信息“粉碎机”，不管给它多大的数据，它都能“咔咔咔”处理成固定长度的“信息指纹”。

---

## 📌 哈希函数的基本特性

一个**理想的哈希函数**通常具备以下特性：

| 特性           | 描述                                  |
| ------------ | ----------------------------------- |
| **确定性**      | 相同的输入一定产生相同的输出。                     |
| **均匀性**      | 输入分布均匀，输出结果也要尽量均匀分布在哈希空间里。          |
| **快速计算**     | 计算哈希值要足够快，不能拖慢整个系统。                 |
| **抗碰撞性（可选）** | 不同的输入尽可能产生不同的哈希值，减少冲突（特别在安全领域尤为重要）。 |
| **不可逆性（可选）** | 安全哈希函数要满足：不能从输出推断输入。（如 MD5、SHA 系列）  |

---

## 🎯 哈希函数的常见应用场景 & 不同类型

| 应用场景      | 对应的哈希函数类型  | 举例                    |
| --------- | ---------- | --------------------- |
| 哈希表 / Map | 快速、均匀分布    | Java 中的 `hashCode()`  |
| 加密        | 不可逆、安全     | `MD5`、`SHA-256`       |
| 数据完整性校验   | 快速、抗碰撞     | `CRC32`               |
| 图像/音频识别   | 相似性敏感、容错性强 | 感知哈希（Perceptual Hash） |
| 分布式系统路由   | 快速、分布均匀    | MurmurHash、CityHash   |

---

## 🔬 哈希函数分类详解

### 1. **普通哈希函数**（适合哈希表等通用用途）

* 只追求快速、均匀分布，**不需要安全性**。
* 示例：

  * Java 中的 `Object.hashCode()`
  * Python 的 `hash()`
  * `MurmurHash`（高性能，适用于大数据）
  * `CityHash`（Google 出品）

🔧 MurmurHash 核心思想：对字节流进行分段操作+混合+位运算，追求 **“快”+“散得开”**。

---

### 2. **加密哈希函数（密码学哈希）**

* 主要用于加密、签名、密码保护。
* 需要满足：

  * **不可逆性**
  * **抗碰撞**
  * **雪崩效应**（输入变化一位，输出变化巨大）

常见算法：

| 算法              | 长度          | 应用领域           |
| --------------- | ----------- | -------------- |
| **MD5**         | 128位        | 密码摘要、校验码，已不再安全 |
| **SHA-1**       | 160位        | 也不再安全          |
| **SHA-256/512** | 更安全，应用在区块链等 |                |
| **HMAC**        | 可加密         | 用于加密传输中的消息认证   |

---

### 3. **感知哈希（Perceptual Hash）**

* 应用于图像/音频指纹识别。
* 输入相似的内容，输出的哈希值也“接近”。
* 用于判断两个内容“是否近似”。

---

## 🧮 常见哈希函数示意

比如：我们对字符串 `hello` 求哈希：

```java
// Java 中 Object.hashCode()
"hello".hashCode(); // 输出: 99162322

// 使用 MD5
md5("hello"); // 输出: 5d41402abc4b2a76b9719d911017c592

// 使用 SHA-256
sha256("hello"); // 输出: 2cf24dba5fb0a...（很长）
```

---

## ⚠️ 哈希冲突 & 哈希空间

* **哈希冲突（Collision）**：

  * 不同的输入，产生了相同的哈希值。
  * 哈希空间有限 → 鸽笼原理：冲突是不可避免的。
* 如何缓解？

  * 使用更大的哈希空间（例如 64 位、128 位）
  * 优化哈希函数的分布性
  * 对冲突做处理（如链表法、开放寻址法）

---

## 🧪 Java 中的 hashCode 示例拆解

```java
public class Person {
    String name;
    int age;

    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}
```

背后其实调用了这样的逻辑：

```java
// 简化版哈希函数
int hash = 17;
hash = 31 * hash + name.hashCode();
hash = 31 * hash + Integer.hashCode(age);
```

乘以质数（如 31）是为了 **打散分布，减少冲突**。

---

## 📦 常用哈希函数库

| 名称            | 语言/库    | 说明                  |
| ------------- | ------- | ------------------- |
| Guava Hashing | Java    | 提供 MurmurHash、SHA 等 |
| hashlib       | Python  | 提供 MD5、SHA 系列       |
| Crypto        | Node.js | 加密用哈希库              |
| OpenSSL       | C/C++   | 强大的加解密哈希工具          |

---

## 🎯 总结：一图读懂哈希函数

```
            ┌─────────────────────────────┐
            │        哈希函数 Hash        │
            └─────────────────────────────┘
                        ↓
       ┌────────────────────────────────────┐
       │             应用领域               │
       └────────────────────────────────────┘
  ┌─────────────┬────────────┬────────────┬─────────────┐
  │ 哈希表/Map  │ 加密验证   │ 去重/校验   │ 路由分片     │
  │ MD5/SHA     │ Bloom Filter │ 区块链Merkle │ LRU 缓存   │
  └─────────────┴────────────┴────────────┴─────────────┘
```

---

如果你想我带你手撸一个哈希函数，或者对比几种常用哈希函数的优缺点，或看 Java、Python 中的实现源码，我可以继续展开。需要继续吗？


# 给出 java top10 的哈希函数，给出使用场景+优缺点

以下是 Java 中常用的 **Top 10 哈希函数/工具**，结合使用场景、优缺点和代码示例进行说明：

---

### 1. **`Object.hashCode()`**  
**场景**：默认对象哈希码，用于 `HashMap`、`HashSet` 等集合。  
**优点**：  
- 简单高效，JVM 内置支持。  
- 默认基于内存地址，保证对象唯一性。  
**缺点**：  
- 未重写时可能导致哈希冲突（如内容相同的不同对象哈希码不同）。  
- 直接使用内存地址，不适合按内容比较的场景。  
```java
public class User {
    private String name;
    @Override
    public int hashCode() {
        return super.hashCode(); // 默认内存地址
    }
}
```

---

### 2. **`Objects.hash(Object...)`**  
**场景**：快速生成多字段组合的哈希码（重写 `hashCode()`）。  
**优点**：  
- 一行代码解决多字段哈希组合。  
- 自动处理 `null` 值。  
**缺点**：  
- 基于数组创建，轻微性能开销。  
```java
@Override
public int hashCode() {
    return Objects.hash(name, age, email); // 多字段哈希
}
```

---

### 3. **`String.hashCode()`**  
**场景**：字符串哈希（`HashMap` 键值、缓存键）。  
**优点**：  
- 算法高效（多项式哈希）。  
- Java 字符串缓存哈希值（首次计算后复用）。  
**缺点**：  
- 可能发生哈希碰撞（如 `"Aa"` 和 `"BB"` 的哈希相同）。  
```java
String s = "hello";
int hash = s.hashCode(); // 99162322
```

---

### 4. **`Arrays.hashCode()`**  
**场景**：数组内容哈希（如 `byte[]`、`int[]`）。  
**优点**：  
- 深度哈希（基于元素内容而非数组地址）。  
- 支持基本类型和对象数组。  
**缺点**：  
- 嵌套数组需手动递归处理。  
```java
int[] arr = {1, 2, 3};
int hash = Arrays.hashCode(arr); // 30817
```

---

### 5. **`MessageDigest` (MD5/SHA)**  
**场景**：加密哈希（密码存储、数据完整性校验）。  
**优点**：  
- 高安全性（SHA-256 抗碰撞性强）。  
- 标准加密算法支持。  
**缺点**：  
- 性能开销大（不适合高频非加密场景）。  
- MD5/SHA-1 已不安全。  
```java
MessageDigest md = MessageDigest.getInstance("SHA-256");
byte[] hash = md.digest("data".getBytes());
```

---

### 6. **`CRC32`**  
**场景**：数据校验（网络传输、文件校验）。  
**优点**：  
- 计算极快，低资源消耗。  
- 高效检测数据传输错误。  
**缺点**：  
- 非加密哈希，易碰撞（不适用于安全场景）。  
```java
CRC32 crc = new CRC32();
crc.update(bytes);
long checksum = crc.getValue();
```

---

### 7. **Guava `Hashing` (Murmur3)**  
**场景**：高性能非加密哈希（布隆过滤器、分布式系统）。  
**优点**：  
- 速度快，碰撞率低。  
- 提供多种哈希工具（一致性哈希等）。  
**缺点**：  
- 需引入 Guava 库。  
```java
HashFunction hashFunc = Hashing.murmur3_32();
int hash = hashFunc.hashString("key", StandardCharsets.UTF_8).asInt();
```

---

### 8. **`java.util.zip.Adler32`**  
**场景**：快速数据校验（替代 CRC32）。  
**优点**：  
- 比 CRC32 更快。  
- 适合实时校验。  
**缺点**：  
- 可靠性低于 CRC32（长数据时）。  
```java
Adler32 adler = new Adler32();
adler.update(data);
long checksum = adler.getValue();
```

---

### 9. **`IdentityHashMap` 的 `System.identityHashCode()`**  
**场景**：基于内存地址的哈希（对象实例级唯一性）。  
**优点**：  
- 严格区分不同对象实例。  
- 无重写问题。  
**缺点**：  
- 忽略对象内容，仅限特殊场景。  
```java
IdentityHashMap<User, String> map = new IdentityHashMap<>();
map.put(user1, "data"); // 基于内存地址哈希
```

---

### 10. **`Long.hashCode()` / `Double.hashCode()`**  
**场景**：基本类型包装类的哈希（避免装箱）。  
**优点**：  
- 直接计算基本类型值哈希。  
- 效率高于 `new Long(value).hashCode()`。  
**缺点**：  
- 仅限包装类型。  
```java
long id = 12345L;
int hash = Long.hashCode(id); // 12345
```

---

### 总结对比表
| **哈希函数**           | **最佳场景**                     | **性能** | **碰撞率** | **安全性** |
|------------------------|----------------------------------|----------|------------|------------|
| `Object.hashCode()`    | 默认对象标识                     | ⚡️⚡️⚡️     | 高         | ❌          |
| `Objects.hash()`       | POJO 多字段哈希                 | ⚡️⚡️       | 中         | ❌          |
| `String.hashCode()`    | 字符串键值                      | ⚡️⚡️⚡️     | 中         | ❌          |
| `Arrays.hashCode()`    | 数组内容哈希                    | ⚡️⚡️       | 中         | ❌          |
| `MessageDigest`        | 密码/数据安全                   | ⚡️        | 极低       | ✅          |
| `CRC32`                | 数据校验                        | ⚡️⚡️⚡️     | 高         | ❌          |
| Guava `Murmur3`        | 高性能分布式系统                | ⚡️⚡️⚡️     | 低         | ❌          |
| `Adler32`              | 快速实时校验                    | ⚡️⚡️⚡️⚡️   | 中高       | ❌          |
| `System.identityHashCode()` | 实例级唯一性               | ⚡️⚡️⚡️     | 低         | ❌          |
| `Long.hashCode()`      | 基本类型哈希                    | ⚡️⚡️⚡️⚡️   | 低         | ❌          |

> 💡 **选择原则**：  
> - **安全性需求** → `SHA-256` (MessageDigest)。  
> - **高性能非加密** → `Murmur3` (Guava) 或 `String.hashCode()`。  
> - **对象内容哈希** → `Objects.hash()`。  
> - **数据校验** → `CRC32` 或 `Adler32`。  
> - **基本类型** → 直接调用包装类的 `hashCode()`。




* any list
{:toc}