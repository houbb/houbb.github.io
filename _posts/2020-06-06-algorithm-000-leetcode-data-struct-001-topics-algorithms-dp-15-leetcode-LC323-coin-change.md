---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 11-LC322. 零钱兑换 coin-change 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下零钱兑换

# LC322. 零钱兑换 coin-change 

给你一个整数数组 coins ，表示不同面额的硬币；以及一个整数 amount ，表示总金额。

计算并返回可以凑成总金额所需的 最少的硬币个数 。如果没有任何一种硬币组合能组成总金额，返回 -1 。

你可以认为每种硬币的数量是无限的。

示例 1：

输入：coins = [1, 2, 5], amount = 11
输出：3 
解释：11 = 5 + 5 + 1
示例 2：

输入：coins = [2], amount = 3
输出：-1
示例 3：

输入：coins = [1], amount = 0
输出：0
 

提示：

1 <= coins.length <= 12
1 <= coins[i] <= 2^31 - 1
0 <= amount <= 10^4

# v1-dp 最大背包

## 思路

分为5 步：

1）定义好状态

dp[i] 代表金额 i 需要的最少的硬币个数。

2）状态转移方程（Transition）

背包问题。

```java
for(int coin : coins) {
    dp[i] = Math.min(dp[i], dp[i-coin]+1);
}
```

3) 初始化（Initialization）

coins 需要排序

我们把硬币数最大初始化为 10^4+1=10001, 符合题意，同时避免+1越界。

4) 计算顺序（Order）

通常是从小到大递推，也可能需要倒序（如背包问题）。

外层循环 i = 1...amount

内层循环 j = 1...amount  coin 金额超过 amount 就结束

5) 返回结果（Answer）

返回 dp[amount]，代表金额 amount 需要的最小硬币数

6) 优化(可选)

是否要滚动数组优化空间？

## 实现

```java
    public int coinChange(int[] coins, int amount) {
        if(amount == 0) {
            return 0;
        }

        // 背包问题
        // 硬币排序？ 还是需要的，给的数据可能无序
        Arrays.sort(coins);

        int[] dp = new int[amount+1];

        // 默认初始化为最大值
        for(int i = 1; i <= amount; i++) {
            dp[i] = 10001;
        }   

        for(int i = 1; i <= amount; i++) {
            //从小到大呢？
            for(int j = 0; j < coins.length; j++) {
                int coin = coins[j];
                // 如果超过了？
                if(coin > i) {
                    break;
                }

                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }

        return 10001 == dp[amount] ? -1 : dp[amount];
    }
```

## 效果

13ms 击败 74.54%

## 复杂度

时间	O(n * amount)
空间	O(amount)

## 反思

还有其他解法吗？

# v2-BFS

## 思路

同 LC279，把每个金额看成一个节点，每次用一枚硬币跳到下一个金额，找到到达 amount 的最短路径。

## 核心步骤

1. 初始化队列：`queue.offer(0)`
2. 用一个数组或 Set 记录访问过的金额，避免重复遍历
3. BFS 层数 `step = 0`
4. 循环直到队列为空：

   * `step++`（表示硬币数 +1）
   * 遍历当前层所有节点（当前队列大小）
   * 对每个节点 `cur`：

     * 遍历所有硬币 `coin`：

       * `next = cur + coin`
       * 如果 `next == amount` → 返回 `step`
       * 如果 `next < amount` 且没访问过 → 入队，并标记已访问
5. 队列耗尽 → 返回 -1（无法组成）

## 复杂度分析

TC 最坏 O(amount × n)

SC O(amount)

## 实现

```java
    public int coinChange(int[] coins, int amount) {
        if(amount == 0) {
            return 0;
        }
        // 背包问题
        // 硬币排序？ 还是需要的，给的数据可能无序
        Arrays.sort(coins);

        Queue<Integer> queue = new LinkedList<>();
        queue.offer(0); // 初始化为0，用加法。也可以反过来
        boolean[] visited = new boolean[amount+1];
        visited[0] = true;
        int step = 0;

        while(!queue.isEmpty()) {
            int size = queue.size();
            step++;

            for(int i = 0; i < size; i++) {
                int cur = queue.poll();
                for (int coin : coins) {
                    int next = cur + coin;
                    if (next == amount) return step;
                    if (next < amount && !visited[next]) {
                        queue.offer(next);
                        visited[next] = true;
                    }

                    // 超过了，结束本次
                    if(next > amount) {
                        break;
                    }
                }
            }
        }
        

        return -1;
    }
```

## 效果

25ms 击败 12.27%

## 优化1-倒序减法

### 思路

加法可能比较慢，我们改为减法。

### 实现

```java
 public int coinChange(int[] coins, int amount) {
        if(amount == 0) {
            return 0;
        }
        // 背包问题
        // 硬币排序？ 还是需要的，给的数据可能无序
        Arrays.sort(coins);

        Queue<Integer> queue = new LinkedList<>();
        queue.offer(amount); // 初始化为0，用加法。也可以反过来
        boolean[] visited = new boolean[amount+1];
        visited[amount] = true;
        int step = 0;

        while(!queue.isEmpty()) {
            int size = queue.size();
            step++;

            for(int i = 0; i < size; i++) {
                int cur = queue.poll();
                for (int coin : coins) {
                    int next = cur - coin;
                    if (next == 0) return step;

                    // 超过了，结束本次
                    if(next < 0) {
                        break;
                    }

                    if (next > 0 && !visited[next]) {
                        queue.offer(next);
                        visited[next] = true;
                    }
                }
            }
        }
        

        return -1;
    }
```

### 效果

22ms 14.29%

区别不是很大

# 开源项目

为方便大家学习，所有相关文档和代码均已开源。

[leetcode-visual 资源可视化](https://github.com/houbb/leetcode-visual)

[leetcode 算法实现源码](https://github.com/houbb/leetcode)

[leetcode 刷题学习笔记](https://github.com/houbb/leetcode-notes)

[老马技术博客](https://houbb.github.io/)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解力扣经典，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}