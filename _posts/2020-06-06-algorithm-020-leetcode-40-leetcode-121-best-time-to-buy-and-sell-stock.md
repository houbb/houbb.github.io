---
layout: post
title:  【leetcode】121-best-time-to-buy-and-sell-stock 力扣 121. 买卖股票的最佳时机
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

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

# 参考资料

https://leetcode.cn/problems/combinations/

https://leetcode.cn/problems/combination-sum/

https://leetcode.cn/problems/combination-sum-ii/

https://leetcode.cn/problems/combination-sum-iii/

https://leetcode.com/problems/combination-sum-iv/

[TLE to 100% beat | Optimisation | step by step | 7 solutions](https://leetcode.com/problems/combination-sum-iv/solutions/372950/tle-to-100-beat-optimisation-step-by-step-7-solutions/)

https://leetcode.com/problems/combination-sum-iv/solutions/2381079/java-1ms-dp-top-down-memoization-easy/

* any list
{:toc}