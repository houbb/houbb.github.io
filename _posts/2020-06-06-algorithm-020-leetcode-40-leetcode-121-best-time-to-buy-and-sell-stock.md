---
layout: post
title:  【leetcode】40-best-time-to-buy-and-sell-stock 力扣 121. 买卖股票的最佳时机
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

# 121. 买卖股票的最佳时机

给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。

你只能选择 某一天 买入这只股票，并选择在 未来的某一个不同的日子 卖出该股票。

设计一个算法来计算你所能获取的最大利润。

返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0 。


示例 1：

输入：[7,1,5,3,6,4]
输出：5
解释：在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。
     注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格；同时，你不能在买入前卖出股票。
示例 2：

输入：prices = [7,6,4,3,1]
输出：0
解释：在这种情况下, 没有交易完成, 所以最大利润为 0。
 

提示：

1 <= prices.length <= 10^5
0 <= prices[i] <= 10^4


# V1-暴力解法

```java
    /**
     * 最简单的暴力算法
     * @param prices 价格
     * @return 结果
     */
    public int maxProfit(int[] prices) {
        int maxResult = 0;

        for(int i = 0; i < prices.length-1; i++) {
            for(int j = i+1; j < prices.length; j++) {
                int profit = prices[j] - prices[i];
                maxResult =  Math.max(profit, maxResult);
            }
        }

        return maxResult;
    }
```

这种解法会超时。

# v2-如何优化呢？

核心的一点：最大的利润，卖出之前则必须是买入的最小值、卖出的最大值。

所以只需要做几件事：

0）最大值，最小值初始化为 prices[0];

1）记录最大的利润  maxResult = maxPrice - minPrice;

2）如果遇到了最小值，则重新初始化 minPrice, maxPrice

## 代码实现

```java
    public int maxProfit(int[] prices) {
        int maxResult = 0;
        int minVal = prices[0];
        int maxVal = prices[0];
        for(int i = 1; i < prices.length; i++) {
            int cur = prices[i];
            // 值大于当前值
            if(cur > maxVal) {
                maxResult = Math.max(maxResult, cur - minVal);
            }
            // 重置
            if(cur < minVal) {
                minVal = cur;
                maxVal = cur;
            }
        }

        return maxResult;
    }
```

## V2.5-代码性能优化

## 优化思路

上面的分支判断太多

## 核心实现

```java
class Solution {

    public int maxProfit(int[] prices) {
        int maxResult = 0;
        int minVal = prices[0];
        for(int i = 0; i < prices.length; i++) {
            minVal = Math.min(minVal, prices[i]);
            maxResult = Math.max(prices[i] - minVal, maxResult);
        }

        return maxResult;
    }
    
}
```

## 效果

1ms 击败100.00%

# V3-DP 的思路-贯穿整体解法

## 思路

我们一共完成了一笔完整的交易，分为两步：

1. b1 买入1
2. s1 卖出1

卖出+买入构成了完整的交易。

每一天我们都可以决定是否买，是否卖？

### 初始化

b1 买入时，我们初始化为 -prices[0];

s1 卖出时，初始化为0；

## 代码

```java
public int maxProfit(int[] prices) {
    int b1 = -prices[0];
    int s1 = 0;

    for(int i = 0; i < prices.length; i++) {
        // 卖出第一笔 是否卖？  不卖则为s1, 卖出则为 b1 + prices[i]
        s1 = Math.max(s1, b1 + prices[i]);
        // 买入第一笔 是否买？  如果买，则花费为当前金额;
        b1 = Math.max(b1, - prices[i]);
    }
    return s1;
}
```


# 参考资料

* any list
{:toc}