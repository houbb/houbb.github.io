---
layout: post
title: leetcode 算法篇专题之贪心 Greedy 之合并区间 06-LC45 跳跃游戏 II jump-game II
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, greedy, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下数组这种数据结构。

## 主要知识

数组需要拆分下面几个部分：

1. 理论介绍

2. 源码分析

3. 数据结构实现？

4. 题目练习（按照算法思想分类）

5. 梳理对应的 sdk 包

6. 应用实战

因为这个是 leetcode 系列，所以重点是 4、5(对4再一次总结)。

为了照顾没有基础的小伙伴，会简单介绍一下1的基础理论。

简单介绍1，重点为4。其他不是本系列的重点。

# 相关题目

# 45. 跳跃游戏

给定一个长度为 n 的 0 索引整数数组 nums。初始位置为 nums[0]。

每个元素 nums[i] 表示从索引 i 向后跳转的最大长度。换句话说，如果你在索引 i 处，你可以跳转到任意 (i + j) 处：

0 <= j <= nums[i] 且
i + j < n

返回到达 n - 1 的最小跳跃次数。

测试用例保证可以到达 n - 1。

 

示例 1:

输入: nums = [2,3,1,1,4]
输出: 2
解释: 跳到最后一个位置的最小跳跃数是 2。
     从下标为 0 跳到下标为 1 的位置，跳 1 步，然后跳 3 步到达数组的最后一个位置。
示例 2:

输入: nums = [2,3,0,1,4]
输出: 2
 

提示:

1 <= nums.length <= 10^4
0 <= nums[i] <= 1000
题目保证可以到达 n - 1


# v1-暴力

## 思路

我们在 LC55 的基础上，进行修改。添加一个全局变量记录最小的值。

同时 dfs 变成尝试所有的场景

## 过程

从 index=0 为之开始，递归尝试所有可能的位置

终止条件：pos >= n-1，到达末尾

递归：从 [pos+1, 最远的距离]

最远的距离：pos + nums[pos]     当前的位置+能继续跳几个格子

## 实现

```java
    private int minStep = Integer.MAX_VALUE;

    public int jump(int[] nums) {
        dfs(0, 0, nums);
        return minStep;
    }

    private boolean dfs(int count, int pos, int[] nums) {
        int n = nums.length;

        // 到达结尾
        if(pos >= n-1) {
            minStep = Math.min(minStep, count);
            return true;
        }

        // 最远的距离
        int maxPos = Math.min(n-1, pos+nums[pos]);
        for(int i = pos+1; i <= maxPos; i++) {
            dfs(count+1, i, nums);
        }

        // 所有的可能性全部失败
        return false;
    }
```

## 效果

超出时间限制

74 / 110 个通过的测试用例

## 复杂度

时间复杂度	O(指数级)	每个位置尝试多条路径，最坏 ∏ nums[i]

空间复杂度	O(n)	递归栈深度最多 n

# v2-DP

## 思路

我们尝试使用动态规划来解决这一题。

1）状态定义

dp[i] 标识能否到达 i 位置

2）初始化

```java
// 第一个位置默认可以到达
dp[0] = true;  
```

其他位置 -1，不可达？


3) 状态转移方程

想想 位置 i 如何最小步数

和 LC55 类似，只是找所有可能的最小值。而不是快速失败

```
for i = 1..n-1:
    dp[i] = min(dp[j] + 1) for all j where j + nums[j] >= i
```

4) 遍历循环

外层循环遍历每个位置 i = 1..n-1

内层循环遍历 j = 0..i-1 看有没有能跳到 i 的位置

5）结果返回

最后返回 dp[n-1] 就知道能否到达终点

## 解法

```java
public int jump(int[] nums) {
        int n = nums.length;

        // 其他位置，最大值    
        int[] dp = new int[n];
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;

        for(int i = 1; i < n; i++) {
            // 从 j 开始，找到最小的可能性
            for(int j = 0; j < i; j++) {
                if((j + nums[j] >= i)) {
                    // 到达 i 的最少跳数 = 前面能跳到 i 的位置的最少跳数 + 1
                    dp[i] = Math.min(dp[i], dp[j] + 1);
                }
            }
        }

        return dp[n-1];
}
```

## 效果

318ms 击败 5.01%

## 复杂度

时间复杂度：O(n^2)（双层循环）

空间复杂度：O(n)（存 dp 数组）

## 反思

一般而言 其实 dp 是非常好的解法。

因为 dp 是有一定的套路的，相对而言还是容易想到的（对比贪心）

如果发现他非常慢，那么大概率就要用贪心了。

# v3-贪心 

## 思路

贪心最巧妙的地方在于你要理解这个策略。

维护一个区间 [start, end]：表示 当前跳跃次数可以到达的最远位置

遍历数组 i：

如果 i 超过 end → 表示需要再跳一次
每次更新 下一次能到达的最远位置 nextEnd = max(nextEnd, i + nums[i])

每当 i 越过当前区间 end，就 跳跃次数 +1，更新 end = nextEnd

## 过程

1）初始化：

jumps = 0（跳跃次数）
curEnd = 0（当前跳跃能到达的最远位置）
nextEnd = 0（下一跳能到达的最远位置）

2） 遍历数组（不包含最后一个位置）：

nextEnd = max(nextEnd, i + nums[i])

如果 i == curEnd：
    jumps++
    curEnd = nextEnd

3） 遍历结束返回 jumps

## 解法

```java
public int jump(int[] nums) {
        int n = nums.length;

        int jumps = 0;
        int curEnd = 0;
        int nextEnd = 0;

        // 最后一个位置不需要考虑 达到就行
        for(int i = 0; i < n-1; i++) {
            nextEnd = Math.max(nextEnd, i + nums[i]);

            // 表示需要再跳一次
            if(i == curEnd) {
                jumps++;
                curEnd = nextEnd;
            }
        }

        return jumps;
    }
```

## 效果

1ms 击败 99.45%

## 反思

感觉不是很好想。

知道解法理所当然，不知道想破脑袋。

# 总结

暴力提供思路

dp 优化 

贪心最优

* any list
{:toc}