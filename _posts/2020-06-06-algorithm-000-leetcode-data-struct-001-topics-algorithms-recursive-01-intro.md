---
layout: post
title: leetcode 算法篇专题之递归 recursive 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, recursive, sf]
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

## 详细介绍一下力扣算法之递归

下面是 LeetCode（力扣）中**递归（Recursion）算法技巧**的详细介绍。

我们将从入门概念、经典应用、写法技巧，到高频例题全面讲解，适合希望掌握递归核心逻辑和实战的同学。

---

## 🧠 一、什么是递归？

**递归（Recursion）** 是一种函数调用自身的编程技巧。

> 一个问题的解可以通过“**自身的子问题**”的解来表达。

通俗讲：

> 就像你办一件事（解决一个问题），要先“递交”给别人办（子问题），等别人办完你才能继续做。

---

## 🔁 二、递归三要素（核心）

掌握递归，必须牢记这三个要素：

| 要素              | 说明                 |
| --------------- | ------------------ |
| 终止条件（base case） | 不再调用自身的条件，否则无限递归   |
| 递归调用            | 将原问题分解为规模更小的子问题    |
| 返回值拼接           | 利用子问题的结果构建当前答案（可选） |

### 📌 举个例子：斐波那契数列

```java
// 返回第 n 个斐波那契数
int fib(int n) {
    if (n <= 1) return n;                    // 终止条件
    return fib(n - 1) + fib(n - 2);          // 递归调用 + 构造答案
}
```

---

## 🔧 三、递归常见写法模式

### ✅ 1. 分治型（Divide & Conquer）

每次将问题划分为几个子问题，分别递归求解，最后合并结果。

* 示例：归并排序、快速排序、二叉树最大深度

```java
int mergeSort(int[] nums, int left, int right) {
    if (left == right) return; // base case
    int mid = (left + right) / 2;
    mergeSort(nums, left, mid);
    mergeSort(nums, mid + 1, right);
    merge(nums, left, mid, right); // 合并两个有序数组
}
```

---

### ✅ 2. 回溯型（Backtracking）

一种“递归 + 撤销”的搜索方式，尝试所有可能，常用于组合、排列、子集等问题。

* 示例：[46. 全排列](https://leetcode.cn/problems/permutations/)、[77. 组合](https://leetcode.cn/problems/combinations/)

```java
void backtrack(List<List<Integer>> result, List<Integer> path, boolean[] used) {
    if (path.size() == nums.length) {
        result.add(new ArrayList<>(path));
        return;
    }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        path.add(nums[i]);
        backtrack(result, path, used); // 递归
        path.remove(path.size() - 1);  // 撤销选择
        used[i] = false;
    }
}
```

---

### ✅ 3. 递归树型（树结构）

常见于二叉树的前/中/后序遍历，典型的树型结构天然适合递归。

* 示例：[104. 二叉树最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

```java
int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

---

### ✅ 4. 递归 + 记忆化（避免重复）

用于有重叠子问题的递归，避免重复计算（就是动态规划的 top-down 写法）。

* 示例：[70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs/)

```java
Map<Integer, Integer> memo = new HashMap<>();
int climbStairs(int n) {
    if (n <= 2) return n;
    if (memo.containsKey(n)) return memo.get(n);
    int res = climbStairs(n - 1) + climbStairs(n - 2);
    memo.put(n, res);
    return res;
}
```

---

## 🎯 四、递归常见题型总结

| 题型      | 高频例题                                                                                                 | 技巧点        |
| ------- | ---------------------------------------------------------------------------------------------------- | ---------- |
| 二叉树遍历   | [144. 前序遍历](https://leetcode.cn/problems/binary-tree-preorder-traversal/)                            | 结构天然递归     |
| 数组划分    | [912. 排序数组](https://leetcode.cn/problems/sort-an-array/)                                             | 快排/归并      |
| 子集 / 组合 | [78. 子集](https://leetcode.cn/problems/subsets/)、[77. 组合](https://leetcode.cn/problems/combinations/) | 回溯模板       |
| 全排列     | [46. 全排列](https://leetcode.cn/problems/permutations/)                                                | used\[] 标记 |
| 斐波那契    | [509. 斐波那契数](https://leetcode.cn/problems/fibonacci-number/)                                         | 有记忆化优化     |
| N皇后     | [51. N 皇后](https://leetcode.cn/problems/n-queens/)                                                   | 经典回溯       |

---

## 🧪 五、递归的使用技巧 & 踩坑提示

### ✅ 使用技巧

| 技巧          | 说明                  |
| ----------- | ------------------- |
| 明确终止条件      | 否则容易栈溢出             |
| 理解递归树结构     | 可手动画出调用过程           |
| 返回值 vs void | 有的递归是返回结果，有的是直接累加   |
| 参数传递        | 尤其注意是否需要深拷贝（如 List） |

### ❌ 常见错误

* 忘记 base case（无限递归）
* 在回溯中未正确撤销状态（如未回退 path / used）
* 参数传错，造成结果错误

---

## 📚 六、LeetCode 递归题目推荐（由易到难）

| 难度    | 题目                                                                                 | 题型     |
| ----- | ---------------------------------------------------------------------------------- | ------ |
| 🌱 简单 | [104. 二叉树最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)         | 树型递归   |
| 🌿 简单 | [226. 翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/)                     | 树型递归   |
| 🌼 中等 | [46. 全排列](https://leetcode.cn/problems/permutations/)                              | 回溯     |
| 🌸 中等 | [78. 子集](https://leetcode.cn/problems/subsets/)                                    | 回溯     |
| 🌺 中等 | [22. 括号生成](https://leetcode.cn/problems/generate-parentheses/)                     | 回溯构造   |
| 🌊 困难 | [51. N 皇后](https://leetcode.cn/problems/n-queens/)                                 | 回溯剪枝   |
| 🔥 困难 | [297. 二叉树序列化](https://leetcode.cn/problems/serialize-and-deserialize-binary-tree/) | 树 + 分治 |
| 💡 困难 | [241. 为运算表达式添加括号](https://leetcode.cn/problems/different-ways-to-add-parentheses/) | 分治递归   |

---

## 📌 七、递归与其他技巧的关联

| 关联       | 说明                    |
| -------- | --------------------- |
| 动态规划（DP） | 自顶向下的递归 + 记忆化，可转换为 DP |
| 回溯算法     | 基于递归实现，适用于“所有可能”的问题   |
| 分治法      | 本质上也是递归，只是加了合并步骤      |
| 树结构遍历    | 天然递归，适合写得简洁清晰         |

---

## ✅ 八、小结

| 重点   | 说明                          |
| ---- | --------------------------- |
| 三要素  | base case、递归调用、构造返回值        |
| 典型场景 | 树、组合、分治、搜索                  |
| 进阶技巧 | 记忆化优化、剪枝回溯、剪枝条件             |
| 推荐写法 | 套模板 + 画递归树 + trace log 辅助理解 |

* any list
{:toc}