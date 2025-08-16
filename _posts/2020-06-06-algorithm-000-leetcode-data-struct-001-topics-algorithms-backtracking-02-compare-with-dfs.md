---
layout: post
title: leetcode 算法篇专题之回溯 Backtracking 与递归和 DFS 的关系？
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

# 回溯和 dfs 还有递归的关系是什么？为什么是单独的一个模块？

很多人刚学算法的时候也会混淆 回溯 (Backtracking)、DFS (Depth First Search) 和 递归 (Recursion) 之间的关系。

我们可以这样理解：

---

## 🔹 1. 递归（Recursion）是什么？

* 定义：函数调用自身
* 本质：一种实现方式（代码结构），它只是一个“工具”
* 作用：让问题分解成更小的子问题，直至达到终止条件

例子：

```java
void recur(int n) {
    if (n == 0) return;
    recur(n - 1);
}
```

> 递归只是“形式”，并没有说明你在干什么搜索或选择。

---

## 🔹 2. DFS（深度优先搜索）是什么？

* 定义：一种搜索策略

  * 在一棵树或图里，一条路走到头（深入），再回退，换另一条路
* 实现方式：

  * 通常用递归（系统栈）
  * 也可以用显式栈（迭代写法）
* 应用场景：图遍历、路径搜索、迷宫走法、组合/排列生成等等

例子（递归 DFS 遍历树）：

```java
void dfs(TreeNode root) {
    if (root == null) return;
    dfs(root.left);
    dfs(root.right);
}
```

> DFS 是“策略”，递归只是它的一种实现方式。

---

## 🔹 3. 回溯（Backtracking）是什么？

* 定义：在搜索过程中，做一个选择 → 递归探索 → 如果发现这条路不通，就撤销选择（回溯），换另一条路。
* 本质：DFS 的一种特殊应用，用于 枚举/组合/排列/填数 等问题。
* 关键点：

  1. 做选择
  2. 递归探索
  3. 撤销选择（恢复现场）

例子（全排列）：

```java
void backtrack(List<Integer> path, boolean[] used, int[] nums) {
    if (path.size() == nums.length) {
        result.add(new ArrayList<>(path));
        return;
    }

    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        path.add(nums[i]);
        used[i] = true;

        backtrack(path, used, nums); // 递归探索

        // 回溯撤销选择
        path.remove(path.size() - 1);
        used[i] = false;
    }
}
```

> 回溯其实就是 DFS + 状态恢复。它比单纯的 DFS 更强调“撤销选择”，以便继续搜索别的路径。

---

## 🔹 4. 它们的关系总结

* 递归：一种编程技巧（实现手段）
* DFS：一种搜索策略（思想，可以用递归/栈实现）
* 回溯：基于 DFS 的问题求解框架，强调“尝试 + 撤销选择”

换句话说：

```
回溯 ⊂ DFS
DFS 可以用递归实现，也可以用栈迭代实现
递归只是工具，不是算法
```

---

## 📌 为什么回溯常常作为单独的模块？

因为在刷题/算法教学里，回溯法主要解决一类经典问题：组合、子集、排列、N 皇后、数独、括号生成……
这些问题不是单纯的 DFS（比如图遍历），而是需要 枚举所有可能解，并且在探索失败时必须撤销选择。

所以：

* DFS 是“方向”
* 回溯是“套路”
* 递归是“实现”


* any list
{:toc}