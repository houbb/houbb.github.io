---
layout: post
title: leetcode 算法篇专题之贪心 Greedy 05-LC55 跳跃游戏 jump-game
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

# 55. 跳跃游戏

给你一个非负整数数组 nums ，你最初位于数组的 第一个下标 。

数组中的每个元素代表你在该位置可以跳跃的最大长度。

判断你是否能够到达最后一个下标，如果可以，返回 true ；否则，返回 false 。

示例 1：

输入：nums = [2,3,1,1,4]
输出：true
解释：可以先跳 1 步，从下标 0 到达下标 1, 然后再从下标 1 跳 3 步到达最后一个下标。

示例 2：

输入：nums = [3,2,1,0,4]
输出：false
解释：无论怎样，总会到达下标为 3 的位置。但该下标的最大跳跃长度是 0 ， 所以永远不可能到达最后一个下标。
 

提示：

1 <= nums.length <= 10^4
0 <= nums[i] <= 10^5

# v1-暴力

## 思路

从 index=0 为之开始，递归尝试所有可能的位置

终止条件：pos >= n-1，到达末尾

递归：从 [pos+1, 最远的距离]

最远的距离：pos + nums[pos]     当前的位置+能继续跳几个格子

## 实现

```java
    public boolean canJump(int[] nums) {
        return dfs(0, nums);
    }

    private boolean dfs(int pos, int[] nums) {
        int n = nums.length;

        // 到达结尾
        if(pos >= n-1) {
            return true;
        }

        // 最远的距离
        int maxPos = Math.min(n-1, pos+nums[pos]);
        for(int i = pos+1; i <= maxPos; i++) {
            if(dfs(i, nums)) {
                return true;
            }
        }

        // 所有的可能性全部失败
        return false;
    }
```

## 效果

超出时间限制

78 / 175 个通过的测试用例

## 复杂度

TC：最坏情况 O(2^n)（每个位置都尝试多条路径）

SC：O(n) 递归栈

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

3) 状态转移方程

想想 位置 i 如何可达？

如果存在某个前面的位置 j（0 ≤ j < i）是可达的 dp[j] = true，

并且从 j 能跳到 i（j + nums[j] >= i），

那么 i 就可以到达 → dp[i] = true

```
dp[i] = OR(dp[j] && j + nums[j] >= i)  for all j in [0, i-1]
```

4) 遍历循环

外层循环遍历每个位置 i = 1..n-1

内层循环遍历 j = 0..i-1 看有没有能跳到 i 的位置

5）结果返回

最后返回 dp[n-1] 就知道能否到达终点

## 解法

```java
    public boolean canJump(int[] nums) {
        int n = nums.length;

        boolean[] dp = new boolean[n];
        dp[0] = true;

        for(int i = 1; i < n; i++) {
            // 从 j 开始
            for(int j = 0; j < i; j++) {
                // 前面有一个元素可以达到这个位置
                if(dp[j] == true && (j + nums[j] >= i)) {
                    dp[i] = true;
                    break;
                }
            }
        }

        return dp[n-1];
    }
```

## 效果

895ms 击败 5.00%

## 反思

一般而言 其实 dp 是非常好的解法。

因为 dp 是有一定的套路的，相对而言还是容易想到的（对比贪心）

如果发现他非常慢，那么大概率就要用贪心了。

# v3-贪心（能量视角）

## 思路

贪心最巧妙的地方在于你要理解这个策略。

比如我们想象自己是一个有能量槽的游戏人物，每次移动，能量-1。

每次走到一个格子的时候，你检查现在格子里面的“能量”和你自己拥有的“能量”哪个更大，取更大的“能量”！ 

如果你有更多的能量，你就可以走的更远啦！~

## 解法

```java
    public boolean canJump(int[] nums) {
        int n = nums.length;
        
        // 默认拥有第一个格的能量 走一步
        int cur = nums[0];
        int step = 1;

        while(step < n && cur > 0) {
            // 消耗一个能量
            cur--;

            int val = nums[step];
            cur = Math.max(val ,cur);

            step++;
        }   

        return step == n;
    }
```

## 效果

2ms 击败 82.64%



# v4-贪心（距离视角）

## 思路

前面我们只关心能量

这里我们也可以只关心最远能达到的距离

## 核心逻辑

maxReach 表示 当前能够到达的最远位置

然后从左到右遍历数组：

如果当前位置 i > maxReach → 说明你已经到不了这个位置 → 返回 false

否则，更新 `maxReach = max(maxReach, i + nums[i])` 更新当前能到达的最远位置，取“以前能到的最远位置”和“当前位置能跳到的最远位置”的最大值”

如果遍历结束 maxReach >= n - 1 → 能到达终点 → 返回 true

## 实现

```java
    public boolean canJump(int[] nums) {
            int n = nums.length;
            int maxReach = 0;

            for(int i = 0; i < n; i++) {
                if(i > maxReach) {
                    return false;
                }

                maxReach = Math.max(maxReach, i + nums[i]);
            }    

            return true;

        }

```

## 效果

2ms 击败 82.64%



# 总结

暴力提供思路

dp 优化 

贪心最优

* any list
{:toc}