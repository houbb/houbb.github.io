---
layout: post
title:  【leetcode】44-best-time-to-buy-and-sell-stock-with-cooldown 力扣 309. 买卖股票的最佳时机包含冷冻期
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

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

# v1-个人思路

## 思路

这一题是 T122 的变种，我们只需要把价格+手续费就行？

利润在卖出的时候支付？




## 评价

这一道题严格点说还是比较难的，就是我们必须通过 3 个状态数组来处理。

所以需要前面题目的铺垫。

# 小结

完整的思路，其实 T123 的拓展是一个比较完整的解法。

# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/

* any list
{:toc}