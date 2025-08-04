---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
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

## 详细介绍一下力扣算法之动态规划

**动态规划（Dynamic Programming，简称 DP）** 的完整入门与进阶指南，适合零基础或有一定经验但想系统梳理的你。

---

## 🔍 一、什么是动态规划？

动态规划的核心思想是：

> **将原问题拆分成若干子问题，保存（“记忆”）每个子问题的解，从而避免重复计算。**

通俗来说：

> 把“重复子问题”的答案**提前算好存起来**，再一步步“拼接”出最终答案。

### ✅ 具备以下几个特点的问题，适合用 DP：

| 特点     | 含义            |
| ------ | ------------- |
| 最优子结构  | 整体最优由局部最优决定   |
| 重叠子问题  | 子问题之间重复出现     |
| 状态转移方程 | 当前状态由前一状态转移而来 |

---

## 🎯 二、DP 问题的常见分类（按状态和结构）

我们可以从维度、场景两个方向分类：

### ✅ 1. **按维度分类**

| 类型    | 举例题目                                                                      | 说明                             |
| ----- | ------------------------------------------------------------------------- | ------------------------------ |
| 一维 DP | [70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs/)                  | dp\[i] 表示第 i 步的方案数             |
| 二维 DP | [1143. 最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/) | dp\[i]\[j] 表示两个字符串前 i/j 个字符的匹配 |
| 状态压缩  | [198. 打家劫舍](https://leetcode.cn/problems/house-robber/)                   | 用两个变量滚动存储                      |

---

### ✅ 2. **按题型场景分类**

#### 🧱 1）背包类

* [416. 分割等和子集](https://leetcode.cn/problems/partition-equal-subset-sum/)
* [474. 一和零](https://leetcode.cn/problems/ones-and-zeroes/)
* [518. 零钱兑换 II](https://leetcode.cn/problems/coin-change-2/)

#### 🧩 2）字符串匹配类

* [1143. 最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/)
* [72. 编辑距离](https://leetcode.cn/problems/edit-distance/)
* [115. 不同的子序列](https://leetcode.cn/problems/distinct-subsequences/)

#### 🏃 3）路径计数类

* [62. 不同路径](https://leetcode.cn/problems/unique-paths/)
* [64. 最小路径和](https://leetcode.cn/problems/minimum-path-sum/)
* [63. 不同路径 II（含障碍物）](https://leetcode.cn/problems/unique-paths-ii/)

#### 🧠 4）区间类

* [312. 戳气球](https://leetcode.cn/problems/burst-balloons/)
* [1000. 合并石头的最低成本](https://leetcode.cn/problems/minimum-cost-to-merge-stones/)

#### 🏠 5）选择取舍类

* [198. 打家劫舍](https://leetcode.cn/problems/house-robber/)
* [213. 打家劫舍 II](https://leetcode.cn/problems/house-robber-ii/)
* [740. 删除并获得点数](https://leetcode.cn/problems/delete-and-earn/)

---

## 🧪 三、动态规划的五步通用套路（核心！）

> 一定要记住这个模板！几乎所有 DP 题都可以套进去。

### 🧩 第一步：定义状态 `dp[i]` 或 `dp[i][j]`

* 表示什么含义？
* 例如：“到第 i 个物品的最优解” or “前 i 个字符匹配的状态”

### 🧩 第二步：状态转移方程

* 当前状态如何由前一状态推导？
* 示例：`dp[i] = dp[i-1] + dp[i-2]`（爬楼梯）

### 🧩 第三步：初始条件（base case）

* 如：`dp[0] = 1`, `dp[1] = 1` 等

### 🧩 第四步：遍历顺序（从小到大？从后往前？）

* 根据转移关系写 `for` 循环的方向

### 🧩 第五步：返回值

* 最终要返回的状态值是什么？`dp[n]` 还是最大值等

---

## 🧭 四、几个经典题目讲解（快速理解 DP）

---

### 🎯 例题一：[70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs/)

#### ❓题意：

每次可以爬 1 或 2 级台阶，问有多少种方法爬到 n 阶。

#### ✅ 五步走：

1. **状态定义**：`dp[i]` 表示爬到第 i 阶的方法数
2. **状态转移方程**：`dp[i] = dp[i-1] + dp[i-2]`
3. **初始化**：`dp[0] = 1`, `dp[1] = 1`
4. **遍历顺序**：从小到大
5. **返回值**：`dp[n]`

```java
public int climbStairs(int n) {
    if (n <= 1) return 1;
    int[] dp = new int[n + 1];
    dp[0] = dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}
```

---

### 🎯 例题二：[1143. 最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/)

#### ❓题意：

给定两个字符串，找出它们最长公共子序列的长度。

#### ✅ 五步走：

1. **状态定义**：`dp[i][j]` 表示 `text1[0..i-1]` 和 `text2[0..j-1]` 的最长公共子序列长度
2. **状态转移方程**：

   * 若 `s1[i-1] == s2[j-1]`，`dp[i][j] = dp[i-1][j-1] + 1`
   * 否则 `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`
3. **初始化**：`dp[0][*] = 0`, `dp[*][0] = 0`
4. **遍历顺序**：`i` 从 1 到 m，`j` 从 1 到 n
5. **返回值**：`dp[m][n]`

---

### 🎯 例题三：[198. 打家劫舍](https://leetcode.cn/problems/house-robber/)

#### ❓题意：

不能抢相邻的房子，问能抢到的最大金额。

#### ✅ 五步走：

1. **状态定义**：`dp[i]` 表示前 i 个房子能抢到的最大金额
2. **状态转移方程**：`dp[i] = max(dp[i-1], dp[i-2] + nums[i])`
3. **初始化**：`dp[0] = nums[0]`, `dp[1] = max(nums[0], nums[1])`
4. **遍历顺序**：从 i = 2 开始
5. **返回值**：`dp[n-1]`

---

## 📦 五、动态规划常用优化技巧

| 技巧     | 说明                                            |
| ------ | --------------------------------------------- |
| 滚动数组   | 用两个变量代替整个 dp 数组，节省空间                          |
| 状态压缩   | 用位图或 mask 表示多个状态                              |
| 记忆化搜索  | 顶层递归 + 哈希缓存结果                                 |
| 单调队列优化 | 用于区间 DP、滑动窗口 DP 场景                            |
| 二维转一维  | 有时 dp\[i]\[j] 只和 dp\[i-1]\[j]、dp\[i]\[j-1] 有关 |

---

## 🗂 六、LeetCode 刷题路径推荐（从易到难）

| 难度    | 题目                                                                        | 技巧类型      |
| ----- | ------------------------------------------------------------------------- | --------- |
| 🌱 简单 | [70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs/)                  | 一维 DP     |
| 🌿 简单 | [198. 打家劫舍](https://leetcode.cn/problems/house-robber/)                   | 状态转移      |
| 🌼 中等 | [1143. 最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/) | 二维 DP     |
| 🌺 中等 | [64. 最小路径和](https://leetcode.cn/problems/minimum-path-sum/)               | 路径 DP     |
| 🌸 中等 | [322. 零钱兑换](https://leetcode.cn/problems/coin-change/)                    | 背包 DP     |
| 🌵 中等 | [416. 分割等和子集](https://leetcode.cn/problems/partition-equal-subset-sum/)   | 0-1 背包    |
| 🌊 困难 | [72. 编辑距离](https://leetcode.cn/problems/edit-distance/)                   | 字符串匹配     |
| 🔥 困难 | [10. 正则表达式匹配](https://leetcode.cn/problems/regular-expression-matching/)  | 状态设计 + DP |
| 🔮 困难 | [312. 戳气球](https://leetcode.cn/problems/burst-balloons/)                  | 区间 DP     |

---

## ✅ 七、小结

| 要素   | 示例                 |
| ---- | ------------------ |
| 状态定义 | `dp[i]`、`dp[i][j]` |
| 状态转移 | 当前状态依赖前一状态         |
| 初始值  | 明确边界和起始点           |
| 返回值  | 通常是最后一个状态          |
| 优化方向 | 滚动数组 / 记忆化 / 压缩状态  |

---

如果你想继续深入，我可以帮你：

* 布置一个 DP 训练计划（按题型刷）
* 拿你不会的题拆解五步走
* 写一份题解 + 动图 / 表格说明帮助你理解


* any list
{:toc}