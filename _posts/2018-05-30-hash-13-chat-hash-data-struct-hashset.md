---
layout: post
title:  Hash-13-聊一聊哈希数据结构之 HashSet
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

# 详细介绍一下 HashSet

当然可以！我们来系统性地、通俗易懂地介绍一下 Java 中的 `HashSet`。

---

## ✅ 一句话总结

> `HashSet` 是一个基于 `HashMap` 实现的 **不允许元素重复、无序、查找超快** 的集合。

它是集合框架中最常用的“去重神器”。

---

## 🧠 基本特性

| 特性            | 说明                                      |
| ------------- | --------------------------------------- |
| **底层结构**      | 基于 `HashMap` 实现，所有元素都作为 `Map` 的 key     |
| **无序**        | 元素插入顺序不保证（不像 `LinkedHashSet`）           |
| **元素唯一性**     | 不允许重复元素，判断依据是：`equals()` + `hashCode()` |
| **允许 null 值** | 最多只能存一个 `null` 元素                       |
| **非线程安全**     | 多线程环境下需手动同步或用 `ConcurrentHashMap`       |

---

## 🔧 底层原理简述

`HashSet` 本质上就是使用了一个 `HashMap<K, Object>` 来存储数据。每个插入的元素是 `map.put(element, PRESENT)`。

```java
private transient HashMap<E,Object> map;
private static final Object PRESENT = new Object();
```

* 所有元素都是作为 `HashMap` 的 key 来保存
* `value` 统一使用一个哑对象 `PRESENT`（内容无关）

### 插入过程等价于：

```java
HashSet<String> set = new HashSet<>();
set.add("hello");

// 等价于：
HashMap<String, Object> map = new HashMap<>();
map.put("hello", PRESENT);
```

---

## 🔢 常用方法

```java
Set<String> set = new HashSet<>();

set.add("apple");
set.add("banana");
set.add("apple"); // 不会重复添加

set.contains("apple"); // true
set.remove("banana");

System.out.println(set); // [apple]
```

---

## 📌 元素为什么不能重复？

关键在于 `HashMap` 的 key 不能重复：

* 插入时调用元素的 `hashCode()` 计算哈希桶位置
* 如果有冲突，则使用 `equals()` 判断是否相等

**也就是说：**

> **你放进 `HashSet` 的类，一定要正确重写 `hashCode()` 和 `equals()` 方法**，否则可能出现重复元素。

### 例子：

```java
class Person {
    String name;
    int age;

    // ❌ 如果不重写 equals/hashCode，HashSet 会当成两个不同对象
}

Set<Person> set = new HashSet<>();
set.add(new Person("Tom", 18));
set.add(new Person("Tom", 18)); // 会当成不同对象添加进去
```

✅ 正确方式：

```java
@Override
public boolean equals(Object o) { ... }

@Override
public int hashCode() { ... }
```

---

## 🧮 时间复杂度分析

| 操作         | 复杂度（平均） | 说明          |
| ---------- | ------- | ----------- |
| add()      | O(1)    | 哈希定位+链表/树处理 |
| remove()   | O(1)    |             |
| contains() | O(1)    |             |
| 遍历         | O(n)    | 无序遍历        |

如果哈希函数设计不好 → 大量冲突 → 性能退化为 O(n)

---

## 🧪 扩容机制

和 `HashMap` 一样，`HashSet` 也有：

* **初始容量**：默认 16
* **加载因子**：默认 0.75
* **阈值**：达到容量 × 加载因子就会扩容（变为原来的 2 倍）
* 扩容时元素会重新 hash 分配位置

---

## 🚩 和其他 Set 的区别

| 类型                    | 底层实现            | 特点            |
| --------------------- | --------------- | ------------- |
| `HashSet`             | `HashMap`       | 无序、允许 null    |
| `LinkedHashSet`       | `LinkedHashMap` | 有序（插入顺序）      |
| `TreeSet`             | 红黑树（`TreeMap`）  | 自动排序，不允许 null |
| `CopyOnWriteArraySet` | Array           | 线程安全、适合读多写少   |

---

## 🧠 面试常考知识点

| 问题                 | 回答简要                                       |
| ------------------ | ------------------------------------------ |
| HashSet 是否线程安全？    | 否。需要手动加锁或用 `Collections.synchronizedSet()` |
| 如何判断元素是否重复？        | `hashCode()` + `equals()`                  |
| HashSet 能存 null 吗？ | 可以，但最多一个 null                              |
| 底层结构是什么？           | 基于 `HashMap`，元素是 key，value 是统一哑对象          |
| 如何遍历 HashSet？      | 使用 `for-each`、`Iterator`、`stream()` 等方式    |

---

## 🎯 示例：正确使用 HashSet 存储自定义对象

```java
class Person {
    String name;
    int age;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Person)) return false;
        Person p = (Person) o;
        return age == p.age && Objects.equals(name, p.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}

Set<Person> set = new HashSet<>();
set.add(new Person("Tom", 18));
set.add(new Person("Tom", 18)); // 不会重复添加
```

---

## 📦 总结：HashSet 的优缺点

| 优点           | 缺点                     |
| ------------ | ---------------------- |
| 插入、查找快（O(1)） | 无序、不支持按序遍历             |
| 自动去重         | 元素必须实现 hashCode/equals |
| 内存消耗适中       | 多线程下需要额外处理同步           |

---

如果你还想了解：

* `HashSet` 是如何扩容的？
* `LinkedHashSet` / `TreeSet` 有什么使用场景？
* `HashSet` 的源码解析（如 `add()` 方法底层）

我都可以继续详细讲下去 😄 你感兴趣哪个方向？


* any list
{:toc}