---
layout: post
title: leetcode 进阶数据结构篇专题之线段树 segment-tree 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, segment-tree, sf]
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

## 详细介绍一下力扣数据结构之线段树

**线段树（Segment Tree）** 是一个非常经典的高级数据结构，在 LeetCode 和各种算法竞赛中常用于处理：

> ✅ 区间查询（如最大值、最小值、区间和）+ ✅ 区间更新

---

## 🎯 一、线段树是什么？

**线段树是一棵二叉树**，每个节点表示一个数组区间 `[l, r]` 上的信息（如区间和、区间最小值等），支持：

* **修改单个元素/区间元素**
* **查询某一段区间的统计信息**

### 对比其他方法：

| 方法                 | 插入/修改    | 区间查询     | 支持区间修改    |
| ------------------ | -------- | -------- | --------- |
| 暴力数组               | O(1)     | O(n)     | ❌         |
| 前缀和                | O(1)     | O(1)（静态） | ❌         |
| 线段树                | O(log n) | O(log n) | ✅         |
| 树状数组（Fenwick Tree） | O(log n) | O(log n) | ❌（区间更新较难） |

---

## 📦 二、线段树结构（以求区间和为例）

一个大小为 `n` 的数组，可以构建一棵线段树，总节点数量大约为 `4 * n`。

每个节点表示数组某个区间 `[start, end]` 的和，如：

```
build(0, 7):
            [0,7]
         /        \
     [0,3]        [4,7]
    /    \        /   \
[0,1]  [2,3]   [4,5] [6,7]
...
```

---

## 🧰 三、线段树支持的操作

| 操作               | 含义               | 时间复杂度    |
| ---------------- | ---------------- | -------- |
| `build()`        | 构建线段树            | O(n)     |
| `update(i, val)` | 更新下标为 i 的值       | O(log n) |
| `query(l, r)`    | 查询区间 `[l, r]` 的值 | O(log n) |

---

## ✅ 四、线段树的核心实现（以区间求和为例）

### Java 版本（数组实现）

```java
class SegmentTree {
    int[] tree;
    int n;

    public SegmentTree(int[] nums) {
        n = nums.length;
        tree = new int[4 * n];
        build(nums, 0, 0, n - 1);
    }

    // 构建线段树
    void build(int[] nums, int node, int l, int r) {
        if (l == r) {
            tree[node] = nums[l];
            return;
        }
        int mid = l + (r - l) / 2;
        build(nums, 2 * node + 1, l, mid);
        build(nums, 2 * node + 2, mid + 1, r);
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }

    // 区间查询
    int query(int ql, int qr) {
        return query(0, 0, n - 1, ql, qr);
    }

    int query(int node, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return 0; // 无交集
        if (ql <= l && r <= qr) return tree[node]; // 完全覆盖
        int mid = l + (r - l) / 2;
        return query(2 * node + 1, l, mid, ql, qr) +
               query(2 * node + 2, mid + 1, r, ql, qr);
    }

    // 更新某个位置
    void update(int index, int val) {
        update(0, 0, n - 1, index, val);
    }

    void update(int node, int l, int r, int index, int val) {
        if (l == r) {
            tree[node] = val;
            return;
        }
        int mid = l + (r - l) / 2;
        if (index <= mid) update(2 * node + 1, l, mid, index, val);
        else update(2 * node + 2, mid + 1, r, index, val);
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }
}
```

---

## 🧠 五、LeetCode 常见题型和应用

| 题目                                                                            | 类型     | 解法说明           |
| ----------------------------------------------------------------------------- | ------ | -------------- |
| [307. 区域和检索 - 数组可修改](https://leetcode.cn/problems/range-sum-query-mutable/)   | 区间求和   | 构建线段树支持更新      |
| [303. 区域和检索 - 数组不可变](https://leetcode.cn/problems/range-sum-query-immutable/) | 前缀和即可  | 不需要线段树         |
| [699. 掉落的方块](https://leetcode.cn/problems/falling-squares/)                   | 区间最大高度 | 离散化 + 线段树维护最大值 |
| [327. 区间和的个数](https://leetcode.cn/problems/count-of-range-sum/)               | 区间统计   | 可用树状数组/线段树/归并  |
| [732. 我的日程安排表 III](https://leetcode.cn/problems/my-calendar-iii/)             | 线段重叠次数 | 用动态开点线段树维护重叠数量 |

---

## 🔍 六、线段树适合解决的问题

| 问题类型     | 示例                       |
| -------- | ------------------------ |
| 区间求和     | 查询 `[i, j]` 的和           |
| 区间最大/最小值 | 维护某一段区间的最大/最小值           |
| 区间频率统计   | 某个数字在区间中出现次数             |
| 区间更新     | 把 `[i, j]` 所有值都加上 x（懒标记） |
| 离线查询     | 区间类统计配合排序使用（如数对个数）       |

---

## 💎 七、进阶功能：懒标记（Lazy Propagation）

用于 **区间修改 + 区间查询** 的场景，避免每次修改都递归到底。

例如题目：给区间 `[l, r]` 所有值都加上 x，查询 `[a, b]` 的和。

### 关键点：

* 用 `lazy[]` 数组记录每个节点延迟修改的值
* 查询时再下传修改，确保结果正确

---

## ✨ 八、常见技巧

| 技巧        | 说明                      |
| --------- | ----------------------- |
| 动态开点      | 当数据范围大（如 `1e9`）时，只开必要节点 |
| 离散化 + 线段树 | 用于处理大范围但稀疏的数字集合         |
| 树状数组对比    | 树状数组只支持区间求和、不支持区间更新     |

---

## 📌 九、和其他数据结构比较

| 特性               | 前缀和  | 树状数组     | 线段树      |
| ---------------- | ---- | -------- | -------- |
| 动态修改             | ❌    | ✅        | ✅        |
| 区间查询             | ✅    | ✅        | ✅        |
| 区间更新             | ❌    | ❌（需技巧）   | ✅        |
| 支持自定义操作（max/min） | ❌    | ❌        | ✅        |
| 查询效率             | O(1) | O(log n) | O(log n) |

---

## ✅ 十、总结

| 特性             | 描述              |
| -------------- | --------------- |
| 支持区间查询、单点和区间更新 | ✔️              |
| 时间复杂度          | O(log n)        |
| 适用场景           | 动态区间问题，数值范围大但稀疏 |
| 必学技巧           | 懒标记、离散化、动态开点    |



* any list
{:toc}