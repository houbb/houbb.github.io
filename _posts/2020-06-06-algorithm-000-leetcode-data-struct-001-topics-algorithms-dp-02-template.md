---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 02-解题 5 步的模板
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
published: true
---


# 动态规划

大家好，我是老马。

动态规划（Dynamic Programming，简称 DP） 的完整入门与进阶指南，适合零基础或有一定经验但想系统梳理的你。

DP（动态规划）类题目在力扣上占很大比例，但套路是比较固定的。

下面我给你一个通用结题模板，再拆成几个常见场景（1D、2D、背包型、区间型），让你看到解题思路和代码框架。

# 🌟 动态规划解题通用流程

1. 确定状态（State）

   * dp\[i] / dp\[i]\[j] 表示什么？
   * 这一步最关键，决定了后面转移公式。

2. 状态转移方程（Transition）

   * dp\[i] 由哪些子问题转移过来？
   * 把问题拆小：如何从 dp\[i-1]、dp\[i-2] 推出 dp\[i]？

3. 初始化（Initialization）

   * dp\[0] / dp\[1] 的初始值？
   * 特殊情况要先处理。

4. 计算顺序（Order）

   * 通常是从小到大递推，也可能需要倒序（如背包问题）。
   * 是否要滚动数组优化空间？

5. 返回结果（Answer）

   * 一般是 dp\[n-1] / dp\[n]\[m]，有时需要在 dp 数组里取 max/min。

---

# 🔹 一维 DP 模板（斐波那契类、爬楼梯、打家劫舍）

```java
class Solution {
    public int climbStairs(int n) {
        // 1. 定义状态
        int[] dp = new int[n + 1];
        
        // 2. 初始化
        dp[0] = 1;
        dp[1] = 1;
        
        // 3. 状态转移
        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        
        // 4. 返回答案
        return dp[n];
    }
}
```

👉 思路：`dp[i]` 表示爬到第 i 阶的方法数。转移公式：`dp[i] = dp[i-1] + dp[i-2]`

---

# 🔹 二维 DP 模板（路径问题、最长公共子序列）

```java
class Solution {
    public int uniquePaths(int m, int n) {
        // 1. 定义状态
        int[][] dp = new int[m][n];
        
        // 2. 初始化：第一行/第一列只有一种走法
        for (int i = 0; i < m; i++) dp[i][0] = 1;
        for (int j = 0; j < n; j++) dp[0][j] = 1;
        
        // 3. 状态转移
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }
        
        // 4. 返回答案
        return dp[m - 1][n - 1];
    }
}
```

👉 思路：`dp[i][j]` 表示到达 (i,j) 的路径数。转移：只能从上面或左边来。

---

# 🔹 背包型 DP 模板（01 背包/完全背包）

```java
class Solution {
    public int knapsack(int W, int[] wt, int[] val) {
        int n = wt.length;
        int[] dp = new int[W + 1];

        for (int i = 0; i < n; i++) {
            for (int w = W; w >= wt[i]; w--) {
                dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
            }
        }
        return dp[W];
    }
}
```

👉 思路：

* dp\[w] 表示容量为 w 时的最大价值。
* 01 背包用 倒序循环，避免重复使用物品。
* 完全背包用 正序循环，允许重复。

---

# 🔹 区间 DP 模板（戳气球、矩阵链乘）

```java
class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length;
        int[] arr = new int[n + 2];
        arr[0] = arr[n + 1] = 1;
        for (int i = 0; i < n; i++) arr[i + 1] = nums[i];
        
        int[][] dp = new int[n + 2][n + 2];
        
        // 区间长度从小到大枚举
        for (int len = 2; len <= n + 1; len++) {
            for (int left = 0; left + len <= n + 1; left++) {
                int right = left + len;
                for (int k = left + 1; k < right; k++) {
                    dp[left][right] = Math.max(dp[left][right], 
                        dp[left][k] + dp[k][right] + arr[left] * arr[k] * arr[right]);
                }
            }
        }
        
        return dp[0][n + 1];
    }
}
```

👉 思路：

* 区间 DP 常用 `dp[l][r]` 表示 `[l,r]` 区间的最优解。
* 枚举区间长度 + 枚举分割点。

---

# 🎯 总结口诀

1. 确定状态 → 写出含义
2. 找转移方程 → 从子问题推当前问题
3. 初始化边界
4. 确定循环顺序（正序/倒序/区间长度）
5. 返回目标值

# java 模板

## 思路

Java DP 通用代码模板（骨架形式）

这样你刷题时只需要填“状态定义”和“转移方程”就能快速套用？

## 实现

```java
class Solution {
    public int solveDP(int[] nums) {
        int n = nums.length;

        // 1. 定义状态（State）
        // dp[i] / dp[i][j] 含义：
        // TODO: 根据题意定义，例如 dp[i] 表示前 i 个元素的最优解

        int[] dp = new int[n + 1];  // 或者 int[][] dp = new int[n+1][m+1];

        // 2. 初始化（Initialization）
        // TODO: 设置边界条件
        // dp[0] = ...;  dp[1] = ...;  

        // 3. 状态转移（Transition）
        for (int i = 1; i <= n; i++) {
            // 例子：dp[i] = Math.max(dp[i-1], dp[i-2] + nums[i]);
            // TODO: 根据题目写转移方程
        }

        // 4. 返回结果（Answer）
        // TODO: return dp[n]; 或 dp[n][m] 或者数组中 max/min
        return dp[n];
    }
}
```

# 开源项目

为方便大家学习，所有相关文档和代码均已开源。

[leetcode-visual 资源可视化](https://github.com/houbb/leetcode-visual)

[leetcode 算法实现源码](https://github.com/houbb/leetcode)

[leetcode 刷题学习笔记](https://github.com/houbb/leetcode-notes)

[老马技术博客](https://houbb.github.io/)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解力扣经典，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


* any list
{:toc}