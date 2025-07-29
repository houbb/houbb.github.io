---
layout: post
title:  Hash-12-聊一聊哈希数据结构之 HashMap
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

# 详细介绍一下 HashMap

好的，我们这就来详细讲讲 Java 中的核心数据结构之一：**`HashMap`**。

它是基于哈希表实现的一个\*\*键值对（Key-Value）\*\*结构，是 Java 最常用的数据结构之一。

---

## ✅ 一句话总结

> `HashMap` 是一个根据 key 的 `hashCode()` 值快速存取 value 的集合，底层用 **数组 + 链表 + 红黑树** 实现，**时间复杂度接近 O(1)**。

---

## 🧠 核心特性

| 特性                  | 说明                            |
| ------------------- | ----------------------------- |
| 非线程安全               | 多线程用 `ConcurrentHashMap`      |
| key/value 都允许为 null | 但只能有一个 null key               |
| 无序                  | 插入顺序不被保证（不同于 `LinkedHashMap`） |
| 基于哈希表实现             | 查询、插入快，冲突时通过链表或红黑树处理          |

---

## 🔧 底层结构概览

Java 8 以后，`HashMap` 的底层结构是：

```
数组（table） + 链表（Node） + 红黑树（TreeNode）
```

```
HashMap
  └── Node[] table   ← hash后定位桶
           ↓
       每个桶要么是：
       - null（没有元素）
       - Node（链表结构）
       - TreeNode（红黑树结构）
```

---

## 🔢 关键参数

| 参数                           | 说明                   |
| ---------------------------- | -------------------- |
| 初始容量（default 16）             | 创建时桶数组大小（可以调整）       |
| 加载因子（load factor，默认 0.75）    | 决定扩容时机（负载阈值）         |
| 阈值（threshold）                | 等于 `容量 * 加载因子`，超了就扩容 |
| 树化阈值（TREEIFY\_THRESHOLD=8）   | 桶中链表长度 ≥ 8 时会转成红黑树   |
| 退化阈值（UNTREEIFY\_THRESHOLD=6） | 树中节点少于6时退回链表         |

---

## 🧮 常见操作实现原理

### 1. `put(K key, V value)` – 添加键值对

* 调用 `key.hashCode()` 计算哈希值。
* 用 `(hash & (table.length - 1))` 定位桶索引。
* 冲突情况：

  * 桶为空 → 插入新节点
  * 桶已有：

    * 判断是否相同 key（通过 equals），相同就覆盖
    * 不同 key → 链表追加 → 超过 8 个转为红黑树

📌 **为什么用 `(hash & (length - 1)` 而不是 `%`？**

* 位运算比 `%` 运算快。
* 前提：length 是 2 的幂。

---

### 2. `get(Object key)` – 获取 value

* 计算 key 的哈希值 → 定位桶。
* 如果是链表，就按链表遍历。
* 如果是红黑树，用红黑树查找。

时间复杂度：

| 结构  | 查找复杂度   |
| --- | ------- |
| 数组  | O(1)    |
| 链表  | O(n)    |
| 红黑树 | O(logn) |

---

### 3. `remove(Object key)` – 删除元素

* 跟 `get()` 类似：先找到 key 所在的桶和节点，再把它从链表/红黑树中断开。

---

### 4. 扩容（resize）

* 当实际元素数量超过阈值（threshold）时，就要扩容。
* 默认每次扩容为原来的**2倍**。
* 所有元素要**重新计算 hash、重新分配桶位**，代价很高。

---

## 🌳 链表 vs 红黑树的转换条件（Java 8）

| 条件                   | 动作       |
| -------------------- | -------- |
| 链表长度 ≥ 8 且桶数组长度 ≥ 64 | 链表 → 红黑树 |
| 树节点数量 < 6            | 红黑树 → 链表 |

这样做的好处是：在 hash 冲突多时，避免链表过长影响性能。

---

## 🧪 示例代码演示

```java
Map<String, String> map = new HashMap<>();
map.put("name", "Alice");
map.put("job", "Developer");

System.out.println(map.get("name")); // Alice

map.put("name", "Bob"); // 覆盖旧值
System.out.println(map.get("name")); // Bob
```

---

## 🚩 为什么 HashMap 不是线程安全的？

多个线程同时操作时：

* 比如同时执行 put，可能同时扩容、覆盖同一个桶 → 会造成数据错乱、死循环。

👉 解决方案：

* 使用 `Collections.synchronizedMap(new HashMap<>())`
* 更推荐用：**`ConcurrentHashMap`**（支持更高并发）

---

## 🚨 面试高频问题小结

| 问题                       | 简要回答                            |
| ------------------------ | ------------------------------- |
| HashMap 底层结构是什么？         | 数组 + 链表 + 红黑树                   |
| 为何数组长度是 2 的幂？            | 便于 `(hash & (length - 1))` 快速取模 |
| HashMap 和 Hashtable 区别？  | 前者非线程安全，后者线程安全但效率低              |
| Java 8 对 HashMap 做了哪些优化？ | 链表超过阈值后转红黑树，提升冲突性能              |
| HashMap 线程不安全表现？         | 并发 put 时可能覆盖、丢数据、死循环等           |

---

## 📌 总结：HashMap 的优缺点

| 优点           | 缺点           |
| ------------ | ------------ |
| 查询快 O(1)     | 并发不安全        |
| key/value 灵活 | 可能哈希冲突、扩容代价高 |
| 自动扩容/树化优化    | 红黑树查找效率没有数组快 |

---

如果你想我带你画一个 HashMap 动态插入或扩容的图、或者解析下源码中 `putVal()`、`resize()` 方法的实现细节，我也可以继续展开 😄 是否需要继续深入？




* any list
{:toc}