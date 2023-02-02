---
layout: post
title: leetcode 123 Best Time to Buy and Sell Stock III 动态规划
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, dp, sh]
published: true
---

# 题目

You are given an array prices where prices[i] is the price of a given stock on the ith day.

Find the maximum profit you can achieve. 

You may complete at most two transactions.

Note: You may not engage in multiple transactions simultaneously (i.e., you must sell the stock before you buy again).

## 例子

Example 1:

```
Input: prices = [3,3,5,0,0,3,1,4]
Output: 6
Explanation: Buy on day 4 (price = 0) and sell on day 6 (price = 3), profit = 3-0 = 3.
Then buy on day 7 (price = 1) and sell on day 8 (price = 4), profit = 4-1 = 3.
```

Example 2:

```
Input: prices = [1,2,3,4,5]
Output: 4
Explanation: Buy on day 1 (price = 1) and sell on day 5 (price = 5), profit = 5-1 = 4.
Note that you cannot buy on day 1, buy on day 2 and sell them later, as you are engaging multiple transactions at the same time. You must sell before buying again.
```

Example 3:

```
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transaction is done, i.e. max profit = 0.
```

## 约束

```
1 <= prices.length <= 10^5
0 <= prices[i] <= 10^5
```

# 解题思路

我们每天可以做的事情：

（1）买入/卖出股票  持有不变

（2）一共最多可以买卖，共计 4 次。也就是题目中的 2 次完整的交易流程。

## 变量定义

transactionsLeft: 还能做几次交易。

- 无交易

```c
ans1 = solve(day + 1, transactionsLeft); 
```

- 执行交易

```c
// 第一次，和第三次是买入
bool buy = (transactionsLeft % 2 == 0);
if(buy == true) {
	ans2 = -prices[day] + solve(day + 1, transactionsLeft - 1);
}else{
	ans2 = prices[day] + solve(day + 1, transactionsLeft - 1);
}
```

找到其中最好的，作为返回的结果。

## 递归终止条件

`day >= prices.size || transactionsLeft <= 0`

股票遍历结束，或者交易次数结束。

# 算法 java

## 思路

我们从递归，一步步来解决这个问题。

否则，永远都无法学会 DP。

当非常熟练的时候，可以考虑直接使用 DP。

## 递归

我们把所有的选择穷举，然后找出最大的结果。

```java
    /**
     * 递归算法，不考虑时间
     *
     * 1. 最多只能做 4 次交易。2次买入，2次卖出
     * 2. 一天最多2种决策：
     *
     * 2.1 不做交易
     * 2.2 做交易：买入/卖出
     *
     * 3. 时间在流逝
     *
     *
     * @param prices 价格数组
     * @return 结果
     */
    public int maxProfit(int[] prices) {
        return solve(prices, 0, 4);
    }

    /**
     *
     * @param prices 价格表
     * @param day 第几天
     * @param txTimeLeft 交易次数剩余
     * @return 结果
     */
    private int solve(int[] prices,
                      int day,
                      int txTimeLeft) {
        // 终止条件
        if(day >= prices.length
            || txTimeLeft <= 0) {
            return 0;
        }

        //1. 策略1，不做交易
        int profitNoTx = solve(prices, day+1, txTimeLeft);

        //2. 策略2，进行交易
        int profitTx = 0;

        if(txTimeLeft % 2 == 0) {
            //2.1 买入，钱-
            profitTx = -prices[day] + solve(prices, day + 1, txTimeLeft-1);
        } else {
            //2.2 卖出，钱+
            profitTx = prices[day] + solve(prices, day + 1, txTimeLeft-1);
        }

        //3. 返回最大的策略结果
        return Math.max(profitNoTx, profitTx);
    }
```

## Memoization Solution

内存化记录每一次计算的结果，避免重复计算。

这里 mem 要初始化为 -1，避免默认值 0 的出现。

```java
    /**
     * 递归算法，不考虑时间
     *
     * 1. 最多只能做 4 次交易。2次买入，2次卖出
     * 2. 一天最多2种决策：
     *
     * 2.1 不做交易
     * 2.2 做交易：买入/卖出
     *
     * 3. 时间在流逝
     *
     *
     * 优化思路：通过 DP 替代掉递归。
     *
     * 如果避免掉重复计算呢？
     *
     * https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/
     *
     * @param prices 价格数组
     * @return 结果
     */
    public int maxProfit(int[] prices) {
        // 行：prices.length
        // 列：次数

        int txTimeLeft = 4;

        int[][] mem = new int[prices.length][txTimeLeft+1];
        // 初始化为-1？，还是默认的 0 就可以
        this.fillArrays(mem, -1);

        return solve(prices, 0, txTimeLeft, mem);
    }

    private void fillArrays(int[][] mem, int initVal) {
        int rows = mem.length;
        int cols = mem[0].length;
        for(int i = 0; i < rows; i++) {
            for(int j = 0; j < cols; j++) {
                mem[i][j] = initVal;
            }
        }
    }

    /**
     *
     * @param prices 价格表
     * @param day 第几天
     * @param txTimeLeft 交易次数剩余
     * @param mem 内存
     * @return 结果
     */
    private int solve(int[] prices,
                      int day,
                      int txTimeLeft,
                      int[][] mem) {
        // 终止条件
        if(day >= prices.length
            || txTimeLeft <= 0) {
            return 0;
        }

        // 从历史 mem 的结算结果中，直接获取结果
        int ans = mem[day][txTimeLeft];
        if(ans != -1) {
            return ans;
        }


        //1. 策略1，不做交易
        int profitNoTx = solve(prices, day+1, txTimeLeft, mem);

        //2. 策略2，进行交易
        int profitTx = 0;

        if(txTimeLeft % 2 == 0) {
            //2.1 买入，钱-
            profitTx = -prices[day] + solve(prices, day + 1, txTimeLeft-1, mem);
        } else {
            //2.2 卖出，钱+
            profitTx = prices[day] + solve(prices, day + 1, txTimeLeft-1, mem);
        }

        //3. 返回最大的策略结果
        int maxProfit = Math.max(profitNoTx, profitTx);

        // 返回之前，存储对应的结果
        mem[day][txTimeLeft] = maxProfit;
        return maxProfit;
    }
```

改动点非常少：

（1）初始化一个 mem 数组，默认值为 -1

（2）递归逻辑调整

2.1 如果 mem 数组中已经计算过了，直接复用，避免重复计算

2.2 每次返回结果之前，记录一下对应的 mem 结果。


## DP solution with O(N) space

Converting the recursive solution to iterative, Again exact same code just reverse the direction.

把递归改成迭代的算法实现。

迭代的逻辑其实就是 2 次迭代：

（1）迭代每一天

（2）每一天，迭代每一种交易策略

PS: 其实，从这里也可以看出 DP 的另一种实现方式。先把递归改成迭代，然后加入 mem。本质是一样的。

```java
    /**
     *
     * 优化思路：通过 DP 替代掉递归。
     *
     * https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/
     *
     * @param prices 价格数组
     * @return 结果
     */
    public int maxProfit(int[] prices) {
        final int maxTxTime = 4;

        int[][] dp = new int[prices.length+1][maxTxTime+1];
        return solve(prices, dp, maxTxTime);
    }

    /**
     * 解决
     * @param prices 价格数组
     * @param dp dp
     * @param maxTxTime 最大交易次数
     * @return 结果
     */
    private int solve(int[] prices,
                      int[][] dp,
                      final int maxTxTime) {

        // 迭代，而不是递归。
        // 为什么天数，要从大=》小？
        for(int day = prices.length; day >= 0; day--) {
            // 内部循环交易次数
            for(int txTime = 0; txTime <= maxTxTime; txTime++) {
                int maxProfit = 0;

                // 没有交易 / 第0天，收益默认为 0
                if(txTime == 0
                    || day == prices.length) {
                    maxProfit = 0;
                } else {
                    //1. 策略1，不做交易
                    int profitNoTx = dp[day+1][txTime];
                    //2. 策略2，进行交易
                    int profitTx = 0;

                    //DP 中最重要的是 DP 的推导公式。
                    // 因为在前面递归的时候，我们使用的是直接 day 往下一步
                    // 换成迭代循环，这里需要把 day 从后往前，这样在计算 dp[day+1] 的时候，才能复用原来的值，不然都是初始化的值 -1
                    if(txTime % 2 == 0) {
                        //2.1 买入，钱-
                        profitTx = -prices[day] + dp[day+1][txTime-1];
                    } else {
                        //2.2 卖出，钱+
                        profitTx = prices[day] + dp[day+1][txTime-1];
                    }

                    //3. 返回最大的策略结果
                    maxProfit = Math.max(profitNoTx, profitTx);
                }

                // 存储对应的结果
                dp[day][txTime] = maxProfit;
            }
        }

        // 最后一个结果
        return dp[0][maxTxTime];
    }
```

## DP solution with O(1) space

优化思路：空间这一块。因为在 dp 的递推公式中，我们只依赖一天前的数据，所以太多了也是浪费。

```java
    /**
     *
     * 优化思路：通过 DP 替代掉递归。
     *
     * DP 的内存优化。
     *
     * Observation : For any day we just need the answers of the next day (day + 1) => Optimising it further to O(1) space
     *
     * 所以我们并不需要创建一个 dp[days][maxTx] 的数组，只需要一个 dp[2][maxTx] 的即可。
     *
     * https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/
     *
     * @param prices 价格数组
     * @return 结果
     */
    public int maxProfit(int[] prices) {
        final int maxTxTime = 4;

        // 只需要保留 2 天，迭代也只依赖 2 天的数据。
        int[][] dp = new int[2][maxTxTime+1];
        return solve(prices, dp, maxTxTime);
    }

    /**
     * 解决
     *
     * 把上一次涉及到 prices 日期的，全部通过 day % 2 替代。
     * @param prices 价格数组
     * @param dp dp
     * @param maxTxTime 最大交易次数
     * @return 结果
     */
    private int solve(int[] prices,
                      int[][] dp,
                      final int maxTxTime) {

        // 迭代，而不是递归。
        // 为什么天数，要从大=》小？
        for(int day = prices.length; day >= 0; day--) {
            // 内部循环交易次数
            for(int txTime = 0; txTime <= maxTxTime; txTime++) {
                int maxProfit = 0;

                // 没有交易 / 第0天，收益默认为 0
                if(txTime == 0
                    || day == prices.length) {
                    maxProfit = 0;
                } else {
                    //1. 策略1，不做交易
                    int profitNoTx = dp[(day+1)%2][txTime];
                    //2. 策略2，进行交易
                    int profitTx = 0;

                    //DP 中最重要的是 DP 的推导公式。
                    // 因为在前面递归的时候，我们使用的是直接 day 往下一步
                    // 换成迭代循环，这里需要把 day 从后往前，这样在计算 dp[day+1] 的时候，才能复用原来的值，不然都是初始化的值 -1
                    if(txTime % 2 == 0) {
                        //2.1 买入，钱-
                        profitTx = -prices[day] + dp[(day+1) % 2][txTime-1];
                    } else {
                        //2.2 卖出，钱+
                        profitTx = prices[day] + dp[(day+1) % 2][txTime-1];
                    }

                    //3. 返回最大的策略结果
                    maxProfit = Math.max(profitNoTx, profitTx);
                }

                // 存储对应的结果
                dp[day % 2][txTime] = maxProfit;
            }
        }

        // 最后一个结果
        return dp[0][maxTxTime];
    }
```

然后所有的日期下标，调整为对应的 day % 2 即可。

# 性能

然而，上面的算法跑分为：

速度：40%

内存：50%

可恶，难道是可以剪枝吗？

## 问题所在

其实，两次交易，有更加简单的方式。

上面的 DP 很明显是更加通用的 K 次解法。

## 针对性解法思路

首先假设我们没有钱，所以 buy1 意味着我们要向别人借钱，我们要少借，所以我们必须使我们的余额尽可能多（因为这是负数）。

sell1 表示我们决定卖出股票，卖出后我们有 price[i] 钱，我们必须归还我们欠的钱，所以我们有 price[i] - |buy1| = prices[i ] + buy1，我们想要达到最大值。

buy2 意味着我们想买另一只股票，我们已经有 sell1 的钱，所以在买了 stock2 之后我们还有 buy2 = sell1 - price[i] 剩下的钱，我们想要更多的钱，所以我们把它设为 max

sell2 表示我们要卖出 stock2，卖出后我们可以得到 price[i] 的钱，而我们之前还有 buy2 的钱，所以 sell2 = buy2 + prices[i]，我们让这个最大值。

所以 sell2 是我们可以拥有的最多的钱。

## 实现

```java
public int maxProfit(int[] prices) {
	int sell1 = 0, sell2 = 0, buy1 = Integer.MIN_VALUE, buy2 = Integer.MIN_VALUE;
	for (int i = 0; i < prices.length; i++) {
        // 
		buy1 = Math.max(buy1, -prices[i]);
		sell1 = Math.max(sell1, buy1 + prices[i]);
		buy2 = Math.max(buy2, sell1 - prices[i]);
		sell2 = Math.max(sell2, buy2 + prices[i]);
	}
	return sell2;
}
```

If you still do not understand, see below.

buy1 and *sell1 *are for the first transaction. 

buy2 and *sell2 *are for the second transaction.

### 变量背后的逻辑

要了解隐藏的逻辑，您必须了解这 4 个变量代表什么。

sell2：最终利润。

buy2：如果您不是在第 i 天（第 2 笔交易）之后买入股票，那么迄今为止的最佳利润。

sell1：如果您不是在第 i 天（第一次交易）之后卖出股票，则目前为止的最佳利润。

buy1：买入股票的最低价格。

buy1 和 sell1 之间的逻辑非常简单。 您需要做的只是找到几天后买卖的最低价格。

当然，即使你以较低的价格买入股票，如果利润没有比以前大，sell1 也不会更新。 

假设您在第 a 天卖出股票以获得第一笔交易的最大利润，该笔交易存储在 sell1 中。

诀窍来了。 假设您在第 b 天找到更好的交易，sell1 得到更新。 

所以你有 2 个选择 buy2：

不更新 buy2，你仍然在 a 天卖掉你的股票。 没有改变。

用新的 sell1 更新 buy2，这意味着您在第 b 天卖出股票。

buy2 = sell1 - price[i] 表示您在第 b 天卖出股票并在第 i 天买入。 而且Day i绝对不会早于Day b，这就是隐藏的逻辑。

PS: 不得不说，这个思路很强。

# 参考资料

https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/solutions/39615/my-explanation-for-o-n-solution/

https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/solutions/1523723/c-four-solutions-recursion-memoization-dp-with-o-n-space-dp-with-o-1-space/

https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/

https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/solutions/135704/detail-explanation-of-dp-solution/

https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/solutions/2818819/recursion-with-memoization-simple-java-solution-dynamic-programing/

https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/solutions/1523723/c-four-solutions-recursion-memoization-dp-with-o-n-space-dp-with-o-1-space/

https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/solutions/2743789/c-full-solution-from-brute-force-to-optimized-dp-clean-code-with-commented-code/

* any list
{:toc}