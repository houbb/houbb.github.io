---
layout: post
title:  【leetcode】42-best-time-to-buy-and-sell-stock-iii 力扣 123. 买卖股票的最佳时机 III
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



# 力扣 123. 买卖股票的最佳时机 III

给定一个数组，它的第 i 个元素是一支给定的股票在第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 两笔 交易。

注意：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

示例 1:

输入：prices = [3,3,5,0,0,3,1,4]
输出：6
解释：在第 4 天（股票价格 = 0）的时候买入，在第 6 天（股票价格 = 3）的时候卖出，这笔交易所能获得利润 = 3-0 = 3 。
     随后，在第 7 天（股票价格 = 1）的时候买入，在第 8 天 （股票价格 = 4）的时候卖出，这笔交易所能获得利润 = 4-1 = 3 。
示例 2：

输入：prices = [1,2,3,4,5]
输出：4
解释：在第 1 天（股票价格 = 1）的时候买入，在第 5 天 （股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5-1 = 4 。   
     注意你不能在第 1 天和第 2 天接连购买股票，之后再将它们卖出。   
     因为这样属于同时参与了多笔交易，你必须在再次购买前出售掉之前的股票。
示例 3：

输入：prices = [7,6,4,3,1] 
输出：0 
解释：在这个情况下, 没有交易完成, 所以最大利润为 0。
示例 4：

输入：prices = [1]
输出：0
 

提示：

1 <= prices.length <= 10^5

0 <= prices[i] <= 10^5

# v1-思路

## 借助第一题的思路

我们把整个交易链路拆分为2个数组，在 i 的位置，拆分为 2 个数组。

## 伪代码

i = 0 .... n-1

拆分为两个数组：

1) 0 ... i 计算一个最大值

2）i ... n  计算一个最大值

把每一个位置的两个值加起来，然后计算保存 max[i]。找到最大值

这个是废弃的方案，可以考虑实现验证一下。


# v2-T121 的思路拓展

## T121 的解法

这里只是一次的最大值，计算思路就是找到最小值 + 最大值。

```java
public int maxProfit(int[] prices) {
    int maxResult = 0;
    int minVal = prices[0];
    
    for(int i = 0; i < prices.length; i++) {
        minVal = Math.min(minVal, prices[i]);
        maxResult = Math.max(prices[i] - minVal, maxResult);
    }

    return maxResult;
}
```

## 代码

思路：

1）in1_out1_max 记录的是第一次交易结束的最大值                b1+s1

2）in1_out1_in2_max 记录的第一次交易结束+第二次买入的最大值   b1+s1+b2

2）in1_out1_in2_max+prices[i] 这个就是完整的交易最大值       b1+s1+b2+s2

```java
public int maxProfit(int[] prices) {
        int maxProfit = 0;
        // 最小值
        int min = prices[0];
        int in1_out1_max = 0;
        // 买1卖1买2
        int in1_out1_in2_max = 0;
        for(int i = 0; i < prices.length; i++) {
            // 计算出当前的结果
            maxProfit = Math.max(maxProfit, in1_out1_in2_max+prices[i]);

            min = Math.min(prices[i], min);
            // 第一题的思路，记录最大值
            in1_out1_max = Math.max(prices[i] - min, in1_out1_max);

            // 下一次的操作
            // 去掉当前这一次的金额，准备好对应的金额
            in1_out1_in2_max = Math.max(in1_out1_in2_max, in1_out1_max - prices[i]);
        }

        return maxProfit;
    }
```

# V3-dp 解法贯穿思路

## 思路

其实整体就是贯穿的 dp 解法。

2次交易分为2次：

b1 第一次买入
s1 第一次卖出
b2 第二次买入
s2 第二次卖出

## 初始化

b1, b2 初始化为 -prices[0]

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

## 评价

这一种解法其实非常容易理解，也非常容易拓展。


# 小结

完整的思路，其实 V2 是一个比较完整的解法。

## 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/

* any list
{:toc}