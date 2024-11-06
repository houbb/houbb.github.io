---
layout: post
title:  【leetcode】43-best-time-to-buy-and-sell-stock-iv 力扣 188. 买卖股票的最佳时机 IV
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

# 188. 买卖股票的最佳时机 IV

给你一个整数数组 prices 和一个整数 k ，其中 prices[i] 是某支给定的股票在第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 k 笔交易。也就是说，你最多可以买 k 次，卖 k 次。

注意：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

示例 1：

输入：k = 2, prices = [2,4,1]
输出：2
解释：在第 1 天 (股票价格 = 2) 的时候买入，在第 2 天 (股票价格 = 4) 的时候卖出，这笔交易所能获得利润 = 4-2 = 2 。
示例 2：

输入：k = 2, prices = [3,2,6,5,0,3]
输出：7
解释：在第 2 天 (股票价格 = 2) 的时候买入，在第 3 天 (股票价格 = 6) 的时候卖出, 这笔交易所能获得利润 = 6-2 = 4 。
     随后，在第 5 天 (股票价格 = 0) 的时候买入，在第 6 天 (股票价格 = 3) 的时候卖出, 这笔交易所能获得利润 = 3-0 = 3 。
 

提示：

1 <= k <= 100
1 <= prices.length <= 1000
0 <= prices[i] <= 1000

# V1-dp 解法贯穿思路

## 和其他题目的关联

如果 k > len / 2， 因为无论怎么波动，其实最多 len/2 个数值，我们可以直接用 122 的无限次来通过部分案例。

如果 k = 1，就是 T121 的解法。

## 思路

整体就是贯穿的 dp 解法。

k次交易分为k次：

b1 第一次买入
s1 第一次卖出
b2 第二次买入
s2 第二次卖出
...
bk 第k次买入
sk 第k次卖出

## 初始化

b1, b2 ... bk 初始化为 -prices[0]

s1, s2, ..., sk 初始化为0

## 代码

```java
    public int maxProfit(int[] prices) {
        int b1 = -prices[0];
        int b2 = -prices[0];
        int s1 = 0;
        int s2 = 0;

        for(int i = 0; i < prices.length; i++) {
            // 卖出第二笔 是否卖？
            s2 = Math.max(s2, b2 + prices[i]);
            // 买入第二笔 是否买？
            b2 = Math.max(b2, s1 - prices[i]);
            // 卖出第一笔 是否卖？
            s1 = Math.max(s1, b1 + prices[i]);
            // 买入第一笔 是否买？
            b1 = Math.max(b1, - prices[i]);
        }

        return s2;
    }
```

## 实现

```java
    /**
     * 优化思路：通过 DP 替代掉递归。
     *
     * @param prices 价格数组
     * @return 结果
     */
    public int maxProfit(int k, int[] prices) {
        // k+1 是为了让 k 和 下标相同，-1 也可以。
        int[] buy = new int[k + 1];
        int[] sell = new int[k + 1];
        // 初始化买入状态为最小值，表示极小的初始损失
        for (int i = 0; i <= k; i++) {
            buy[i] = -prices[0];
        }

        // for-each 数组本身
        for (int i = 1; i < prices.length; i++) {

            // for-each k 次操作
            for (int j = 1; j <= k; j++) {
                // 卖出第 j 次  不卖 OR  卖出：当前买入+介个
                sell[j] = Math.max(sell[j], buy[j] + prices[i]);
                // 买入第 j 次  不买 OR 买入=上一次-当前
                buy[j] = Math.max(buy[j], sell[j - 1] - prices[i]);
            }

        }

        return sell[k];
    }
```

## 评价

这一种解法其实非常容易理解，也非常容易拓展。

# 小结

完整的思路，其实 T123 的拓展是一个比较完整的解法。

# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/

* any list
{:toc}