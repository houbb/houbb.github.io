---
layout: post
title: leetcode 数组专题之子串 LC560 和为 K 的子数组
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, string, sliding-window, substring, sf]
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

# LC560 和为 K 的子数组

给你一个整数数组 nums 和一个整数 k ，请你统计并返回 该数组中和为 k 的子数组的个数 。

子数组是数组中元素的连续非空序列。

示例 1：

输入：nums = [1,1,1], k = 2
输出：2


示例 2：

输入：nums = [1,2,3], k = 3
输出：2
 

提示：

1 <= nums.length <= 2 * 10^4
-1000 <= nums[i] <= 1000
-10^7 <= k <= 10^7

# v1-暴力

## 思路

我们穷举所有的可能性，然后判断结果

当然这个性能一定是最差的。


## 实现

```java
    public int subarraySum(int[] nums, int k) {
        int count = 0;

        for(int i = 0; i < nums.length; i++) {
            for(int j = i; j < nums.length; j++) {
                int sum = sum(i, j, nums);
                if(sum == k) {
                    count++;
                }
            }
        }

        return count;
    }

    private int sum(int startIx, int endIx, int[] nums) {
        int sum = 0;
        for(int i = startIx; i <= endIx; i++) {
            sum += nums[i];
        }
        return sum;
    }
```

## 结果

超出时间限制

61 / 93 个通过的测试用例

## 复杂度

TC: O(N^3)

如何降低复杂度？


# v2-暴力改进

## 思路

写完发现一个问题。

其实我们没必要每次从 startIx 累加到 endIx

因为是连续的，我们在每次外循环 i 的时候，sum 清零，然后累加就可以达到同样的效果。

## 实现

```java
public int subarraySum(int[] nums, int k) {
        int count = 0;

        for(int i = 0; i < nums.length; i++) {
            int sum = 0;
            for(int j = i; j < nums.length; j++) {
                sum += nums[j];
                if(sum == k) {
                    count++;
                }
            }
        }

        return count;
    }
```

## 效果

1333ms 击败 11.55%

## 反思

简单暴力，勉强 AC

TC 为 O(n^2)

# v3-前缀和

## 思路

连续的位置，意味着等价于 [i,...j] 的前缀和。这里演示一下前缀和的解法。

我们构建对应的前缀和数组来解决这个问题。

比如：`[1, 2, 3]` 这个基础数据，我们对应的前缀和

```
数值：    0   1  3  6 
索引：    0   1  2  3
```

那么 `nums[1] + nums[2] = 2 + 3 = prefixSum[2+1] - prefixSum[1]`;

也就是 `nums[i..j] = prefixSum[j+1] - prefixSum[i]`

我们初始化

```java
prefixSum[0] = 0;
prefixSum[i+1] = prefixSum[i] + nums[i];
```

那么我们要求

## 实现

```java
    public static int subarraySum(int[] nums, int k) {
        int count = 0;

        int[] prefixSum = new int[nums.length + 1];
        prefixSum[0] = 0;
        for (int i = 0; i < nums.length; i++) {
            prefixSum[i + 1] = prefixSum[i] + nums[i];
        }

        // 前缀和不考虑相等的场景
        for (int i = 0; i < nums.length; i++) {
            for (int j = i; j < nums.length; j++) {
                int sum = prefixSum[j + 1] - prefixSum[i];
                if (sum == k) {
                    count++;
                }
            }
        }

        return count;
    }
```

## 效果

1947ms 击败 5.01%

## 反思

这个复杂度是 O(N^2)

因为比 v2 还要涉及到访问+初始化，所以性能不如 v2。

只能说勉强 AC。



# v4-前缀和是这样用的

## 思路

我们来思考一下，我们在不断寻找 `k == prefixSum[j + 1] - prefixSum[i];` 符合这个条件的值，这个是 [i..j]的累加和，也就是前缀和。

那么可以用什么方式提升性能吗？

假设我们已经从 0 累加计算了 prefixSum[i]，其实我们想找到的是  `prefixSum[i] == prefixSum[j+1] - k`

那么容易想到两数之和，我们可以用 HashMap 来提升性能。

结果只需要次数，我们只统计 `(prefixSum[j+1] - k, count)` 即可。

## 实现

prefixSum 直接从0开始累加即可，可以省略掉。


```java
    public static int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> map = new HashMap<>();
        map.put(0, 1);

        int prefixSum = 0;
        int count = 0;
        for (int num : nums) {
            prefixSum += num;

            // 只要次数 类似于两数之和
            count += map.getOrDefault(prefixSum - k, 0);

            // 更新次数
            map.put(prefixSum, map.getOrDefault(prefixSum, 0) + 1);
        }
        return count;
    }
```

这里看起来 prefixSum 只有从头开始的，但是实际上 `prefixSum - k`，本质上是 `prefix[j+1] - prefix[i] == k` 可以覆盖到任何两个位置的前缀和。

很巧妙。但是不太好理解

## 效果

25ms 击败 46.34%

# v4-双指针？

滑动窗口是双指针的特例。

但是这个因为存在正负。并不适合。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解 Top100 经典题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}