---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 11-LC70 爬楼梯 climbing-stairs
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

# LC70 爬楼梯 climbing-stairs

假设你正在爬楼梯。需要 n 阶你才能到达楼顶。

每次你可以爬 1 或 2 个台阶。

你有多少种不同的方法可以爬到楼顶呢？

示例 1：

输入：n = 2
输出：2
解释：有两种方法可以爬到楼顶。
1. 1 阶 + 1 阶
2. 2 阶
示例 2：

输入：n = 3
输出：3
解释：有三种方法可以爬到楼顶。
1. 1 阶 + 1 阶 + 1 阶
2. 1 阶 + 2 阶
3. 2 阶 + 1 阶
 
提示：

1 <= n <= 45

# 经典模板

分为5 步：

1）定义好状态，dp[i] / dp[i][j] 具体指什么？

2）状态转移方程（Transition）

dp[i] 应该如何通过前面的 dp[i-1] dp[i-2]推断得到？

3) 初始化（Initialization）

dp[0] dp[1] 初始化的值应该是什么？对应的是什么含义？

特殊情况的提前处理

4) 计算顺序（Order）

通常是从小到大递推，也可能需要倒序（如背包问题）。

是否要滚动数组优化空间？

5) 返回结果（Answer）

一般是 dp\[n-1] / dp\[n]\[m]，有时需要在 dp 数组里取 max/min。

6) 优化(可选)

空间压缩

# v1-dp

## 思路


1）定义好状态

dp[i] 代表爬到第 i 层有多少种方法

数组一般定义为 dp[n+1]

2）状态转移方程（Transition）

dp[i] 可以通过 dp[i-1] 爬1步 + dp[i-2] 爬2步

```
dp[i] = dp[i-1] + dp[i-2];
```

3) 初始化（Initialization）

```java
dp[0] = 1;  // 为了兼容递推，在地面不动。只有一种方法。
dp[1] = 1;  // 第一层只有一种方法
```

4) 计算顺序（Order）

从 i=2 开始递推

```java
for(int i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
}
```

5) 返回结果（Answer）

第 n 个阶梯？

直接返回 dp[n]，因为代表爬第 n 个阶梯共有多少种方式。

6) 优化(可选)

空间压缩

## 实现

```java
public int climbStairs(int n) {
    int[] dp = new int[n+1];

    dp[0] = 1;
    dp[1] = 1;

    for(int i = 2; i <= n; i++ ) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    
    return dp[n];
}
```

## 效果

0ms 100%

# v2-空间优化

## 思路

目前的 dp 数组，空间是 O(n)，我们可以优化为 O(1) 吗？

我们的递推公式

```
dp[i] = dp[i-1] + dp[i-2]
```

所以，其实我们只需要关注 i-1 和 i-2 两个位置。

初始化呢？

```
int pre = 1;    // 第一个阶梯
int cur = 2;    // 第2个阶梯
```

## 实现

```java
public int climbStairs(int n) {
        if(n <= 1) {
            return 1;
        }

        int pre = 1;
        int cur = 2;
        for(int i = 3; i <= n; i++ ) {
            int temp = pre + cur;

            // 更新
            pre = cur;
            cur = temp;
        }
        
        return cur;
}
```



* any list
{:toc}