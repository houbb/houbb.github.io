---
layout: post
title: leetcode 算法篇专题之回溯 Backtracking 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, backtracking, sf]
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

# 算法篇

动态规划-记忆化搜索

递归

二分查找

DFS 深度优先遍历

BFS 广度优先遍历

回溯

贪心

分治：快排、归并

# chat

## 详细介绍一下力扣算法之回溯

下面是 LeetCode（力扣）中\*\*回溯算法（Backtracking）\*\*的详细介绍，适合初学者理解并掌握它的核心思想、模板写法、典型应用场景和经典题型。

---

## 🧠 一、什么是回溯算法？

> 回溯（Backtracking）是一种「试探性」的搜索算法，通常用于求解**所有**可能的解或**满足条件的某些解**。

可以理解为：

* 穷举 + 剪枝
* 类似「DFS + 状态恢复」
* 一种暴力搜索优化版 —— “走不通就回头”

---

## 🔄 二、回溯的基本思路

核心是：

1. **尝试选择一个选项**
2. **递归继续深入**
3. **如果失败就撤销选择（回溯）**

### 通用套路：

```java
void backtrack(参数) {
    if (终止条件) {
        保存结果;
        return;
    }

    for (选择 : 所有选项) {
        if (不合法) continue;

        做选择;
        backtrack(路径 + 选择);
        撤销选择; // 回溯
    }
}
```

---

## 🔧 三、适合用回溯解决的问题类型

| 类型   | 说明           | 例题                                                                 |
| ---- | ------------ | ------------------------------------------------------------------ |
| 组合   | 从 n 个数中选 k 个 | [77. 组合](https://leetcode.cn/problems/combinations)                |
| 排列   | 所有数字的全排列     | [46. 全排列](https://leetcode.cn/problems/permutations)               |
| 子集   | 所有可能的子集      | [78. 子集](https://leetcode.cn/problems/subsets)                     |
| 分割   | 分割字符串满足某些条件  | [131. 分割回文串](https://leetcode.cn/problems/palindrome-partitioning) |
| 棋盘问题 | 八皇后 / 解数独    | [37. 解数独](https://leetcode.cn/problems/sudoku-solver)              |
| 路径类  | 从起点到终点的所有路径  | [51. N 皇后](https://leetcode.cn/problems/n-queens)                  |

---

## 📋 四、三大经典模板题型

### ✅ 1. 组合类模板（如 LeetCode 77）

```java
void backtrack(int start, List<Integer> path) {
    if (path.size() == k) {
        res.add(new ArrayList<>(path));
        return;
    }

    for (int i = start; i <= n; i++) {
        path.add(i);           // 做选择
        backtrack(i + 1, path);
        path.remove(path.size() - 1); // 撤销选择
    }
}
```

---

### ✅ 2. 排列类模板（如 LeetCode 46）

```java
void backtrack(List<Integer> path, boolean[] used) {
    if (path.size() == n) {
        res.add(new ArrayList<>(path));
        return;
    }

    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;

        used[i] = true;
        path.add(nums[i]);

        backtrack(path, used);

        path.remove(path.size() - 1);
        used[i] = false;
    }
}
```

---

### ✅ 3. 子集类模板（如 LeetCode 78）

```java
void backtrack(int start, List<Integer> path) {
    res.add(new ArrayList<>(path)); // 每个节点都是结果

    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);
        backtrack(i + 1, path);
        path.remove(path.size() - 1);
    }
}
```

---

## ✂️ 五、剪枝技巧

为了避免超时或重复解，回溯算法中经常会加入“剪枝”策略：

| 剪枝方式      | 示例                                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| 排序 + 跳过重复 | [90. 子集 II](https://leetcode.cn/problems/subsets-ii)、[47. 全排列 II](https://leetcode.cn/problems/permutations-ii) |
| 剪去不合法选项   | 组合问题中提前判断是否还能选 enough 个数                                                                                        |
| 提前终止      | 如果已经不满足条件就 return                                                                                               |

---

## 🧠 六、回溯 VS DFS

| 对比点    | DFS      | 回溯             |
| ------ | -------- | -------------- |
| 目标     | 一条路走到底   | 多路径、多组合        |
| 应用     | 路径搜索为主   | 构造解空间树、选项组合    |
| 是否撤销选择 | 不一定      | **必须撤销选择**（核心） |
| 用于     | 遍历图/树/网格 | 解空间遍历、组合、排列    |

---

## 🎯 七、LeetCode 高频回溯题推荐

| 题目编号 | 标题                                                            | 类型      |
| ---- | ------------------------------------------------------------- | ------- |
| 46   | [全排列](https://leetcode.cn/problems/permutations)              | 排列      |
| 47   | [全排列 II（含重复）](https://leetcode.cn/problems/permutations-ii)   | 排列 + 剪枝 |
| 77   | [组合](https://leetcode.cn/problems/combinations)               | 组合      |
| 39   | [组合总和](https://leetcode.cn/problems/combination-sum)          | 回溯 + 剪枝 |
| 40   | [组合总和 II](https://leetcode.cn/problems/combination-sum-ii)    | 去重      |
| 78   | [子集](https://leetcode.cn/problems/subsets)                    | 子集      |
| 90   | [子集 II](https://leetcode.cn/problems/subsets-ii)              | 子集 + 重复 |
| 131  | [分割回文串](https://leetcode.cn/problems/palindrome-partitioning) | 字符串切割   |
| 51   | [N 皇后](https://leetcode.cn/problems/n-queens)                 | 棋盘类     |
| 37   | [解数独](https://leetcode.cn/problems/sudoku-solver)             | 高级剪枝    |

---

## ✅ 八、总结一句话

> **回溯算法就是在构造解的过程中试探+撤销，所有排列、组合、子集、搜索路径相关的问题，都可以从“回溯”角度来建模解决。**



* any list
{:toc}