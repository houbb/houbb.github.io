---
layout: post
title:  【leetcode】45-best-time-to-buy-and-sell-stock-with-cooldown 力扣 714. 买卖股票的最佳时机包含手续费
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

## 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 题目

给定一个整数数组 prices，其中 prices[i]表示第 i 天的股票价格 ；整数 fee 代表了交易股票的手续费用。

你可以无限次地完成交易，但是你每笔交易都需要付手续费。如果你已经购买了一个股票，在卖出它之前你就不能再继续购买股票了。

返回获得利润的最大值。

注意：这里的一笔交易指买入持有并卖出股票的整个过程，每笔交易你只需要为支付一次手续费。

示例 1：

输入：prices = [1, 3, 2, 8, 4, 9], fee = 2
输出：8
解释：能够达到的最大利润:  
在此处买入 prices[0] = 1
在此处卖出 prices[3] = 8
在此处买入 prices[4] = 4
在此处卖出 prices[5] = 9
总利润: ((8 - 1) - 2) + ((9 - 4) - 2) = 8

示例 2：

输入：prices = [1,3,7,5,10,3], fee = 3
输出：6
 

提示：

1 <= prices.length <= 5 * 10^4

1 <= prices[i] < 5 * 10^4

0 <= fee < 5 * 10^4

# v1-个人思路-错误思路

## 思路

这一题是 T122 的变种，我们只需要把价格+手续费就行？

利润在卖出的时候支付？

## 实现

```java
class Solution {
    public int maxProfit(int[] prices, int fee) {
        int maxProfit = 0;

        for(int i = 1; i < prices.length; i++) {
            int profit = prices[i] - prices[i-1] - fee;
            if(profit > 0) {
                maxProfit += profit;
            }
        }

        return maxProfit;
    }
}
```

## 结果

这个实际上是错误的。

错误的原因是如果一个价格从低到高，中间的的跌宕不能覆盖 FEE。我们多次交易反而会导致整体的收益下降。

```
1 4 5 9
```

比如这种两次交易利润：

```
4-1-2=1
9-5-2=2
```

就不如直接一次

```
9-1-2=6
```

所以应该修正一下，利用我们 T122 DP 的解法。

# v2-DP 思路

## DP 考量

分为两个数组：

i 代表第 i 次的操作，可以是买入，也可以是卖出，或者什么都不做。

其实可以分为两个状态数组：

buy[i]    持有

sell[i]    是否卖出后的状态

## 递推公式

```
// 是否卖出？  不卖； 卖出=上一次买入 + 当前价格
// 是否买？   不买； 买入=上一次卖出-当前价格
```

## 初始化

buy[0] = -prices[0]
sell[0] = 0;

## 代码 

```java
class Solution {
    
    public int maxProfit(int[] prices, int fee) {
        int buy[] = new int[prices.length];
        int sell[] = new int[prices.length];

        buy[0] = -prices[0];

        // 遍历
        for(int i = 1; i < prices.length; i++) {
            //卖出 不卖出？ 卖出 = buy[i-1] + prices[i] - FEE
            sell[i] = Math.max(sell[i-1], buy[i-1] + prices[i] - fee);

            // 卖出 不卖出？ 卖出 = sell[i-1] - prices[i]
            buy[i] = Math.max(buy[i-1], sell[i-1] - prices[i]);
        }

        return sell[prices.length-1];
    }
    
}
```


# 小结

这样，我们就完成了买卖股票比较完整的整个系列。

最核心的还是 DP，基本可以从头到尾。

# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/

* any list
{:toc}