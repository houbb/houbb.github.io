---
layout: post
title: leetcode 进阶数据结构篇专题之树状数组 fenwick-tree 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, fenwick-tree, sf]
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

## 详细介绍一下力扣数据结构之树状数组

下面给你详细介绍一下力扣中非常经典的数据结构——**树状数组（Fenwick Tree）**，它主要用于高效处理**区间查询和单点更新**的问题。

## 🎯 一、什么是树状数组？

树状数组（Fenwick Tree）是一种基于数组的高效数据结构，用于解决数组中频繁的**前缀和查询**和**单点更新**问题。

它的核心作用是：

* 快速计算数组前缀和（prefix sum）
* 快速更新数组中某个位置的值

时间复杂度均为 **O(log n)**。

---

## 📦 二、树状数组的结构和原理

* 维护一个和原数组长度相同或稍大的辅助数组 `tree[]`
* 每个 `tree[i]` 负责存储一个区间的和，区间长度是 `i & (-i)` （最低位的1所代表的值）
* 通过 `i & (-i)` 来确定如何跳跃、合并区间，实现快速的区间和查询和单点更新

---

## 🔍 三、核心操作

### 1. 求前缀和 `sum(i)` ：计算原数组从 `1` 到 `i` 的累积和

```java
int sum(int i) {
    int res = 0;
    while (i > 0) {
        res += tree[i];
        i -= i & (-i); // 向父节点跳跃
    }
    return res;
}
```

### 2. 更新 `add(i, delta)` ：将原数组第 `i` 个元素加上 `delta`

```java
void add(int i, int delta) {
    while (i <= n) {
        tree[i] += delta;
        i += i & (-i); // 向子节点跳跃
    }
}
```

> 注意：树状数组下标一般从 1 开始，为了方便用二进制运算，实际使用时通常会对原数组下标做 +1 处理。

---

## 🧰 四、Java 树状数组模板代码

```java
class FenwickTree {
    int[] tree;
    int n;

    public FenwickTree(int size) {
        n = size;
        tree = new int[n + 1]; // 1-based index
    }

    // 单点更新
    public void add(int i, int delta) {
        while (i <= n) {
            tree[i] += delta;
            i += i & (-i);
        }
    }

    // 求前缀和 [1..i]
    public int sum(int i) {
        int res = 0;
        while (i > 0) {
            res += tree[i];
            i -= i & (-i);
        }
        return res;
    }

    // 求区间和 [l..r] = sum(r) - sum(l-1)
    public int rangeSum(int l, int r) {
        return sum(r) - sum(l - 1);
    }
}
```

---

## 🧠 五、树状数组的时间复杂度

| 操作    | 时间复杂度    |
| ----- | -------- |
| 单点更新  | O(log n) |
| 前缀和查询 | O(log n) |
| 区间和查询 | O(log n) |

---

## 💡 六、力扣常见题型应用

| 题目                                                                                      | 类型              | 说明         |
| --------------------------------------------------------------------------------------- | --------------- | ---------- |
| [307. 区域和检索 - 数组可修改](https://leetcode.cn/problems/range-sum-query-mutable/)             | 单点更新 + 区间和查询    | 树状数组或线段树   |
| [315. 计算右侧小于当前元素的个数](https://leetcode.cn/problems/count-of-smaller-numbers-after-self/) | 离散化 + 树状数组统计排名  | 离散化+树状数组   |
| [327. 区间和的个数](https://leetcode.cn/problems/count-of-range-sum/)                         | 区间统计            | 离散化 + 树状数组 |
| [370. 区间加法](https://leetcode.cn/problems/range-addition/)                               | 差分数组+树状数组（区间更新） | 差分+树状数组    |

---

## 📚 七、树状数组的进阶技巧

### 1. 离散化

当数据范围大，但实际有效数字少时，先离散化（排序去重映射到小区间），再使用树状数组。

### 2. 区间更新 + 单点查询 / 单点更新 + 区间查询

经典技巧有用两个树状数组实现区间更新和区间查询。

### 3. 多维树状数组

二维、三维树状数组，解决区间的矩形、立方体求和问题。

---

## 🧩 八、树状数组和线段树对比

| 特性    | 树状数组        | 线段树            |
| ----- | ----------- | -------------- |
| 代码简洁度 | 简单          | 复杂             |
| 功能    | 单点更新 + 区间查询 | 单点或区间更新 + 区间查询 |
| 适用场景  | 大多数简单区间求和   | 复杂区间修改         |
| 空间    | O(n)        | O(4n)          |

---

## ✅ 九、总结

| 特点        | 描述              |
| --------- | --------------- |
| 主要解决前缀和问题 | 对单点更新和前缀和查询非常高效 |
| 实现简单，操作快  | 代码量少，性能优良       |
| 经典应用      | 频繁更新+查询，离散化问题   |

* any list
{:toc}