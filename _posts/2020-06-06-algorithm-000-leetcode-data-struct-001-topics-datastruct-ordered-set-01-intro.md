---
layout: post
title: leetcode 算法篇专题之有序集合 ordered set s01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, ordered-set, sf]
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

## 通用基础

链表 

树

哈希表

stack 栈

queue 队列

ordered set 有序集合

heap  堆

graph 图


## 进阶

并查集

字典树

线段树

树状数组

后缀数组

# chat

https://leetcode.cn/studyplan/top-100-liked/

## 详细介绍一下力扣数据结构之有序集合

在力扣（LeetCode）中，“**有序集合（Ordered Set）**”是一个比较常用但又容易混淆的概念，常出现在涉及**查找第 k 大/小元素**、**区间查找**、**滑动窗口最大/最小值**、**平衡树模拟**等题目中。

虽然 Java 和 C++ 的标准库都没有直接叫做 "Ordered Set" 的数据结构，但可以通过某些容器来模拟。

---

## 🧠 有序集合的定义

**有序集合**是指：元素集合内部维持一定的顺序（一般是从小到大），同时集合中的元素是**唯一的**，支持如下操作：

* 插入元素（有序插入）
* 删除元素
* 判断是否包含某元素
* 查找第 k 小/大元素
* 查找某个数的前驱/后继
* 支持快速地遍历区间内的元素

---

## 🧰 不同语言的实现方式

| 语言          | 模拟方式                                                |
| ----------- | --------------------------------------------------- |
| **C++**     | `std::set` 或 `std::multiset`（平衡树）                   |
| **Java**    | `TreeSet` / `TreeMap`（基于红黑树）                        |
| **Python**  | `SortedContainers` 库中的 `SortedSet`（三方库）或手动维护排序 + 二分 |
| **Go、JS 等** | 通常需要手动维护排序 + 二分                                     |

---

## 🧩 力扣常见题型场景

### 1. 滑动窗口最大值 / 中位数

题目如：

* [239. 滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/)
* [480. 滑动窗口中位数](https://leetcode.cn/problems/sliding-window-median/)

👉 解法：用有序集合（如 TreeSet 或 multiset）来维护一个固定长度的窗口，支持快速插入、删除、查找中位数或最大/最小值。

### 2. 动态查找排名、第 k 大/小

题目如：

* [703. 数据流中的第K大元素](https://leetcode.cn/problems/kth-largest-element-in-a-stream/)
* [295. 数据流的中位数](https://leetcode.cn/problems/find-median-from-data-stream/)

👉 解法：可以使用有序集合、堆或平衡树（如 `TreeMap` + size 记录）进行模拟。

### 3. 区间内查找比某个数大的最小值/小的最大值

题目如：

* [220. 存在重复元素 III](https://leetcode.cn/problems/contains-duplicate-iii/)

👉 解法：维护一个 `TreeSet` 或 `SortedList`，支持快速查询某个元素的天花板（ceiling）或地板（floor）。

---

## 🔨 示例代码

### Java 使用 TreeSet 实现有序集合

```java
import java.util.TreeSet;

public class OrderedSetExample {
    public static void main(String[] args) {
        TreeSet<Integer> set = new TreeSet<>();

        // 插入元素
        set.add(5);
        set.add(3);
        set.add(7);

        // 自动有序：[3, 5, 7]
        System.out.println(set);

        // 查找比 4 大的最小元素
        System.out.println(set.ceiling(4)); // 输出 5

        // 查找比 5 小的最大元素
        System.out.println(set.floor(5)); // 输出 5

        // 删除元素
        set.remove(5);
        System.out.println(set); // [3, 7]
    }
}
```

---

## 🧠 有序集合常见操作复杂度

| 操作      | 时间复杂度（红黑树、平衡树等） |
| ------- | --------------- |
| 插入元素    | O(log n)        |
| 删除元素    | O(log n)        |
| 查询是否存在  | O(log n)        |
| 查找第 k 小 | O(log n)（需额外支持） |
| 查找前驱/后继 | O(log n)        |
| 区间遍历    | O(k) 线性         |

---

## 🧠 力扣常用变种

| 类型                | 描述                                      |
| ----------------- | --------------------------------------- |
| **multiset**      | 支持重复元素（如 C++ 的 multiset）                |
| **indexable set** | 支持按下标查找第 k 大/小（如 C++ 的 PBDS，Java 需自己维护） |
| **TreeMap**       | Key 有序，Value 可统计个数，适合处理重复元素             |

---

## ✨ 总结

| 特性        | 有序集合     | 哈希集合（HashSet） |
| --------- | -------- | ------------- |
| 是否有序      | ✅ 是      | ❌ 否           |
| 插入/删除/查找  | O(log n) | O(1)          |
| 支持查找第 k 小 | ✅ 是      | ❌ 否           |
| 支持区间查询    | ✅ 是      | ❌ 否           |

* any list
{:toc}