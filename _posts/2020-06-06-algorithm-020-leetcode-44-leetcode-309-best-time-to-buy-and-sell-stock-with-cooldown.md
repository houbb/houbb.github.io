---
layout: post
title:  【leetcode】44-best-time-to-buy-and-sell-stock-with-cooldown 力扣 309. 买卖股票的最佳时机包含冷冻期
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

# 买卖股票系列

[【leetcode】40-best-time-to-buy-and-sell-stock 力扣 121. 买卖股票的最佳时机](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-40-leetcode-121-best-time-to-buy-and-sell-stock)

[【leetcode】41-best-time-to-buy-and-sell-stock-ii 力扣 122. 买卖股票的最佳时机 II](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-41-leetcode-122-best-time-to-buy-and-sell-stock-ii)

[【leetcode】42-best-time-to-buy-and-sell-stock-iii 力扣 123. 买卖股票的最佳时机 III](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-42-leetcode-123-best-time-to-buy-and-sell-stock-iii)

[【leetcode】43-best-time-to-buy-and-sell-stock-iv 力扣 188. 买卖股票的最佳时机 IV](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-43-leetcode-188-best-time-to-buy-and-sell-stock-iv)

[【leetcode】44-best-time-to-buy-and-sell-stock-with-cooldown 力扣 309. 买卖股票的最佳时机包含冷冻期](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-44-leetcode-309-best-time-to-buy-and-sell-stock-with-cooldown)

[【leetcode】45-best-time-to-buy-and-sell-stock-with-cooldown 力扣 714. 买卖股票的最佳时机包含手续费](https://houbb.github.io/2020/06/08/algorithm-020-leetcode-45-leetcode-714-best-time-to-buy-and-sell-stock-with-transaction-fee)

# 买卖股票系列

# 题目

给定一个整数数组prices，其中第  prices[i] 表示第 i 天的股票价格 。​

设计一个算法计算出最大利润。在满足以下约束条件下，你可以尽可能地完成更多的交易（多次买卖一支股票）:

卖出股票后，你无法在第二天买入股票 (即冷冻期为 1 天)。
注意：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

示例 1:

输入: prices = [1,2,3,0,2]
输出: 3 
解释: 对应的交易状态为: [买入, 卖出, 冷冻期, 买入, 卖出]
示例 2:

输入: prices = [1]
输出: 0
 

提示：

1 <= prices.length <= 5000
0 <= prices[i] <= 1000

# v1-DP 

## 整体思路

我们考虑 3 个场景：

```
// a1: 手上持有股票的最大收益
// a2: 手上不持有股票，并且处于冷冻期中的累计最大收益
// a3: 手上不持有股票，并且不在冷冻期中的累计最大收益
```

要想计算最大的利润，只需要考虑不持有股票的对比就可。

至于 a1，是为了中转计算。

## 初始化

```java
a1[0] = -prices[0];
```

## 递推公式

### a1

a1 什么时候手上会有股票? 必须是买入的时候。

一种是上次就持有；还有一种处于 a3 状态，然后买入。

```java
a1[i] = max(a1[i-1], a3[i-1] - prices[i]);
```

### a2

a2: 手上不持有股票，并且处于冷冻期中的累计最大收益

什么场景会不持有，则处于冷冻期？

就是持有股票，然后直接卖出了？

```java
a2[i] = a1[i-1] + prices[i];
```

### a3

a3: 手上不持有股票，并且不在冷冻期中的累计最大收益

什么场景不持有股票，且不处于冷冻期。

1）此时不能直接卖出，因为会被冷冻；所以

2）昨天分为两个场景：a2 状态；或者 a3 状态

```java
a3[i] = max(a3[i-1], a2[i-1])
```

## 完整的伪代码

```java
class Solution {
    
    public int maxProfit(int[] prices) {
        int n = prices.length;
        // a1: 手上持有股票的最大收益   主要是为了计算存储，结果不考虑此场景。
        // a2: 手上不持有股票，并且处于冷冻期中的累计最大收益
        // a3: 手上不持有股票，并且不在冷冻期中的累计最大收益
        int a1[] = new int[n];
        int a2[] = new int[n];
        int a3[] = new int[n];

        // 初始化
        a1[0] = -prices[0];

        for (int i = 1; i < n; ++i) {
            // 持有股票：昨天持有 OR 买入
            a1[i] = Math.max(a1[i-1], a3[i-1] - prices[i]);

            // 手上不持有股票，并且处于冷冻期中的累计最大收益: 必定是卖出
            a2[i] = a1[i-1] + prices[i];

            // 手上不持有股票，并且不在冷冻期中的累计最大收益:  昨天可能是 a3; a2
            a3[i] = Math.max(a2[i-1], a3[i-1]);
        }

        // 手里没有股票对比即可
        return Math.max(a2[n-1], a3[n-1]);
    }
    
}
```


## 评价

这一道题严格点说还是比较难的，就是我们必须通过 3 个状态数组来处理。

所以需要前面题目的铺垫。

# 小结

完整的思路，其实 T123 的拓展是一个比较完整的解法。

## 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)


# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/

* any list
{:toc}