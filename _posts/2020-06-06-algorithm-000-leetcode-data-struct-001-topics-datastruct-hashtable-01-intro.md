---
layout: post
title: leetcode 算法篇专题之哈希表 HashTable 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, hash, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下数组这种数据结构。

## 主要知识

数组需要拆分下面几个部分：

1. 理论介绍

2. 源码分析

3. 数据结构实现？

4. 题目练习（按照算法思想分类）

5. 梳理对应的 sdk 包

6. 应用实战

因为这个是 leetcode 系列，所以重点是 4、5(对4再一次总结)。

为了照顾没有基础的小伙伴，会简单介绍一下1的基础理论。

简单介绍1，重点为4。其他不是本系列的重点。

# 数据结构篇

https://leetcode.cn/studyplan/top-100-liked/

## 通用基础

链表 

树

哈希表

stack 栈

graph 图

heap  堆

ordered set 有序集合

queue 队列

## 进阶

并查集

字典树

线段树

树状数组

后缀数组

# chat

## 详细介绍一下力扣数据结构之哈希表



哈希表（Hash Table）是 LeetCode 高频数据结构之一，广泛用于快速查找、计数、去重、映射等操作。很多高效解法的核心就在于用哈希表实现 **O(1)** 级别的操作。

---

## 🧱 一、哈希表基础概念

哈希表通过**键值对（key-value）**的方式来存储数据，底层通过**哈希函数 + 数组**实现。

| 术语       | 说明                          |
| -------- | --------------------------- |
| Key（键）   | 唯一标识一个元素                    |
| Value（值） | 与键关联的数据                     |
| 哈希函数     | 将 key 映射成数组下标               |
| 冲突       | 两个 key 映射到同一位置（用链表、开放地址法解决） |

---

## 🛠️ 二、Java 中常用哈希表类

| 类型              | 特点                          | 常见用途      |
| --------------- | --------------------------- | --------- |
| `HashMap<K, V>` | 无序，允许 null key 和 value      | 最常用的通用映射  |
| `HashSet<E>`    | 底层用 `HashMap<E, Object>` 实现 | 去重、快速存在判断 |
| `LinkedHashMap` | 有序（按插入顺序）                   | 最近使用记录    |
| `TreeMap`       | 有序（按 key 排序）                | 区间统计、最值查询 |

---

## 🔁 三、常见操作复杂度

| 操作 | 时间复杂度 | 说明                   |
| -- | ----- | -------------------- |
| 插入 | O(1)  | 哈希函数映射               |
| 查找 | O(1)  | 直接定位 key             |
| 删除 | O(1)  | 和查找类似                |
| 遍历 | O(n)  | 遍历 entrySet 或 keySet |

---

## 🧪 四、典型应用场景

| 场景   | 示例题                   | 技巧说明                             |
| ---- | --------------------- | -------------------------------- |
| 计数   | LC 1 两数之和、LC 169 多数元素 | 记录出现次数或差值                        |
| 去重   | LC 217 存在重复元素         | 用 `HashSet`                      |
| 映射关系 | LC 205 同构字符串          | 建立双向 `Map<Character, Character>` |
| 统计区间 | LC 560 和为 K 的子数组      | 前缀和 + HashMap                    |
| 缓存   | LRU 算法实现题             | `LinkedHashMap`                  |

---

## 🧮 五、LeetCode 高频题举例

### ✅ 入门级

| 题号  | 题目       | 技巧                    |
| --- | -------- | --------------------- |
| 1   | 两数之和     | 差值法                   |
| 217 | 存在重复元素   | `HashSet`             |
| 242 | 有效的字母异位词 | `HashMap` 或 `int[26]` |
| 383 | 赎金信      | 两个计数表                 |

---

### 🟡 进阶题

| 题号  | 题目        | 技巧          |
| --- | --------- | ----------- |
| 49  | 字母异位词分组   | 排序后哈希表分组    |
| 347 | 前 K 个高频元素 | 计数 + 最小堆    |
| 560 | 和为 K 的子数组 | 前缀和 + 频次表   |
| 36  | 有效的数独     | 行、列、块三个哈希集合 |

---

### 🔴 提升题

| 题号  | 题目        | 技巧                |
| --- | --------- | ----------------- |
| 30  | 串联所有单词的子串 | 滑动窗口 + HashMap 对比 |
| 128 | 最长连续序列    | 只从“起点”扩张          |
| 76  | 最小覆盖子串    | 滑动窗口 + 计数哈希表      |
| 187 | 重复的DNA序列  | 哈希 + 滚动编码优化空间     |

---

## 🧰 六、常用模板总结

### 1️⃣ 出现次数统计

```java
Map<Integer, Integer> countMap = new HashMap<>();
for (int num : nums) {
    countMap.put(num, countMap.getOrDefault(num, 0) + 1);
}
```

---

### 2️⃣ 判断是否存在重复元素

```java
Set<Integer> set = new HashSet<>();
for (int num : nums) {
    if (!set.add(num)) return true;
}
```

---

### 3️⃣ 查找差值是否存在（如两数之和）

```java
Map<Integer, Integer> map = new HashMap<>();
for (int i = 0; i < nums.length; i++) {
    int target = k - nums[i];
    if (map.containsKey(target)) {
        return new int[]{map.get(target), i};
    }
    map.put(nums[i], i);
}
```

---

### 4️⃣ 双向映射（如同构字符串）

```java
Map<Character, Character> map1 = new HashMap<>();
Map<Character, Character> map2 = new HashMap<>();
for (int i = 0; i < s.length(); i++) {
    char c1 = s.charAt(i), c2 = t.charAt(i);
    if (map1.getOrDefault(c1, c2) != c2 || map2.getOrDefault(c2, c1) != c1)
        return false;
    map1.put(c1, c2);
    map2.put(c2, c1);
}
```

---

## 🔍 七、注意事项

| 问题                        | 说明                                  |
| ------------------------- | ----------------------------------- |
| 哈希冲突                      | Java 中通过链表或红黑树解决冲突，用户无需关心           |
| 迭代顺序                      | HashMap 是无序的，如需顺序请用 `LinkedHashMap` |
| `hashCode()` 和 `equals()` | 自定义对象做 key 必须重写这两个方法                |
| 空间换时间                     | 哈希表一般空间复杂度是 O(n)，但能把时间复杂度降到 O(1)    |

---

## 📚 八、推荐刷题顺序

1. [x] 1\. 两数之和
2. [x] 217\. 存在重复元素
3. [x] 383\. 赎金信
4. [x] 242\. 有效的字母异位词
5. [x] 49\. 字母异位词分组
6. [x] 560\. 和为 K 的子数组
7. [x] 128\. 最长连续序列
8. [x] 76\. 最小覆盖子串（高级技巧）

---

## ✅ 总结一句话

> **哈希表是把时间复杂度从 O(n) 降到 O(1) 的利器，是解题中最常用的工具之一。掌握计数、查找、映射、去重四大应用场景非常关键。**


* any list
{:toc}