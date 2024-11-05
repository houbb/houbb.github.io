---
layout: post
title:  【leetcode】41-best-time-to-buy-and-sell-stock-ii 力扣 122. 买卖股票的最佳时机 II
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

# 122. 买卖股票的最佳时机 II

给你一个整数数组 prices ，其中 prices[i] 表示某支股票第 i 天的价格。

在每一天，你可以决定是否购买和/或出售股票。你在任何时候 最多 只能持有 一股 股票。你也可以先购买，然后在 同一天 出售。

返回 你能获得的 最大 利润 。

示例 1：

输入：prices = [7,1,5,3,6,4]
输出：7
解释：在第 2 天（股票价格 = 1）的时候买入，在第 3 天（股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5 - 1 = 4。
随后，在第 4 天（股票价格 = 3）的时候买入，在第 5 天（股票价格 = 6）的时候卖出, 这笔交易所能获得利润 = 6 - 3 = 3。
最大总利润为 4 + 3 = 7 。
示例 2：

输入：prices = [1,2,3,4,5]
输出：4
解释：在第 1 天（股票价格 = 1）的时候买入，在第 5 天 （股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5 - 1 = 4。
最大总利润为 4 。
示例 3：

输入：prices = [7,6,4,3,1]
输出：0
解释：在这种情况下, 交易无法获得正利润，所以不参与交易可以获得最大利润，最大利润为 0。
 

提示：

1 <= prices.length <= 3 * 10^4

0 <= prices[i] <= 10^4



# v1-上一题的思路延续

## 上一题

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

## 思路

因为可以无限次，获取所有上升的区间利润即可。

改造一下

```java
public int maxProfit(int[] prices) {
    int maxResult = 0;
    // int minVal = prices[0];
    for(int i = 1; i < prices.length; i++) {
        // minVal = Math.min(minVal, prices[i]);
        maxResult += Math.max(prices[i] - prices[i-1], 0);
    }
    return maxResult;
}
```

# v2-性能优化

## 思路

下面的方式实现会更好一些。

## 代码

```java
class Solution {
    public int maxProfit(int[] prices) {
        // 因为知道每一天的利润，所以直接第二天高于今天，直接累加利润
        int maxProfit = 0;

        for(int i = 1; i < prices.length; i++) {
            if(prices[i] > prices[i-1]) {
                maxProfit += prices[i] - prices[i-1];        
            }
        }

        return maxProfit;
    }
}
```

## 效果

0ms 击败 100.00%

44.51MB 击败93.87%

# V3-DP 的思路

## 思路

我们可以通过一个数组记录每一次操作的最大利润。

b[n] 
s[n]

每一次操作都可以决定是否操作。

## 递推公式

```
// 是否卖出？  不卖； 卖出=上一次买入 + 当前价格
// 是否买？   不买； 买入=上一次卖出-当前价格
```

## 代码

```java
public int maxProfit(int[] prices) {
        int buy[] = new int[prices.length];
        int sell[] = new int[prices.length];

        buy[0] = -prices[0];

        for(int i = 1; i < prices.length; i++) {
            // 是否卖出？  不卖； 卖出=上一次买入 + 当前价格
            sell[i] = Math.max(sell[i-1], buy[i-1] + prices[i]);

            // 是否买？   不买； 买入=上一次卖出-当前价格
            buy[i] = Math.max(buy[i-1], sell[i-1] - prices[i]);
        }

        return sell[prices.length-1];
    }
```

# 小结

完整的思路，只看对应的波动的山坡上升的地方。

不过 dp 的思路是通用解法，我们理解之后，更方便我们优化。

# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/

* any list
{:toc}