---
layout: post
title: leetcode 数组专题之数组遍历-03-遍历滑动窗口 T643. 子数组最大平均数 I
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, array, traverse, sliding-window, prefix-sum, sf]
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


#  643. 子数组最大平均数 I

给你一个由 n 个元素组成的整数数组 nums 和一个整数 k 。

请你找出平均数最大且 长度为 k 的连续子数组，并输出该最大平均数。

任何误差小于 10^-5 的答案都将被视为正确答案。


输入：nums = [1,12,-5,-6,50,3], k = 4
输出：12.75
解释：最大平均数 (12-5-6+50)/4 = 51/4 = 12.75

示例 2：

输入：nums = [5], k = 1
输出：5.00000
 

提示：

n == nums.length
1 <= k <= n <= 10^5
-104 <= nums[i] <= 10^4

# v1-暴力

## 思路

直接暴力计算 [i, i+k] 区间的所有的和，然后计算平均值

## 实现

```java
    public static double findMaxAverage(int[] nums, int k) {
        double max = Integer.MIN_VALUE;
        for(int i = 0; i < nums.length-k+1; i++) {
            double sum = 0;
            for(int j = i; j < i+k; j++) {
                sum += nums[j];
            }

            double tempMax = sum / k;
            if(tempMax - max > 0) {
                max = tempMax;
            }
        }

        return max;
    }
```

## 效果

超出时间限制 123 / 127 个通过的测试用例

## 反思

虽然这是一道简单的题目，看的出来，并不想我们用暴力来解决。

那么，如何用定长滑动窗口解决呢？

# v2-滑动窗口

## 精髓

定长滑动窗口的精髓是什么？

我们可以想象一个定长的窗口，里面的长度固定位 k

在数组中左右滑动

1）进入时，直接加当前元素 nums[i]

2）窗口中满 k 个元素时，达成我们的目标条件，在这里判断

3) 如果窗口向后移动1，那么应该把上次最前面的元素移除 nums[i-k+1]

## 思路

我总结成三步：入-更新-出。

入：下标为 i 的元素进入窗口，窗口元素和 s 增加 nums[i]。如果 `i < k−1` 则重复第一步。

更新：更新答案。本题由于窗口长度固定为 k，可以统计窗口元素和的最大值 maxS，最后返回的时候再除以 k。

出：下标为 i−k+1 的元素离开窗口，窗口元素和 s 减少 `nums[i−k+1]`。

以上三步适用于所有定长滑窗题目。

## 实现

```java
    public static double findMaxAverage(int[] nums, int k) {
        int sum = 0;

        double maxSum = Integer.MIN_VALUE;
        for(int i = 0; i < nums.length; i++) {
            // 进入窗口
            sum += nums[i];

            // 窗口是否已满足条件。等于 k-1 的时候，下次迭代，刚好 k 个元素
            if(i < k - 1) {
                continue;
            }

            // 逻辑处理
            maxSum = Math.max(maxSum, sum);

            // 出窗口
            sum -= nums[i-k+1];
        }

        return (double)maxSum / k;
    }
```

## 效果 

5ms 击败 37.06%

## 反思

这个模板，我愿称之为滑动窗口的神！

确切的说，这里模拟实现了一个定长为 k 的队列。通过入队+出队，来完成实现。

非常的优雅！

## 用队列来等价模拟实现

思想是一样的，所以不作为一个单独的实现。

```java
public static double findMaxAverage(int[] nums, int k) {
    Queue<Integer> window = new LinkedList<>();
    int sum = 0;
    double maxSum = Integer.MIN_VALUE;

    for (int num : nums) {
        window.offer(num);     // 加入窗口
        sum += num;

        // 如果窗口超过 k，就移除最旧的一个
        if (window.size() > k) {
            sum -= window.poll();  // 出窗口
        }

        // 只有当窗口大小达到 k 时才处理 max
        if (window.size() == k) {
            maxSum = Math.max(maxSum, sum);
        }
    }

    return maxSum / k;
}
```

### 效果

23 ms 击败 8.98%


# v3-前缀和

## 思路

另一种比较简单的方法就是前缀和（Prefix Sum）。

我们从前到后，把每个位置的数加到当前的位置。

## 解法

标准的前缀和解法.

```java
    public static double findMaxAverage(int[] nums, int k) {
        // 前缀和 好处是2个坐标直接可以减，得到差值
        int[] prefixSum = new int[nums.length+1];
        prefixSum[0] = 0;
        for(int i = 0; i < nums.length; i++) {
            prefixSum[i+1] = prefixSum[i]+nums[i];
        }

        // 好处是，我们可以计算任何两个范围的值的和
        double max = Integer.MIN_VALUE;
        for(int i = 0; i <= nums.length - k; i++) {
            int sum = prefixSum[i+k] - prefixSum[i];
            double tempMax = sum * 1.0/ k ;
            max = Math.max(tempMax, max);
        }

        return max;
    }
```

## 效果

6ms 击败 23.34%

# 给出滑动窗口的经典题目，一简单，2中等，1困难

| 难度 | 题目编号 & 名称          | 链接                                                                                   | 类型          |
| -- | ------------------ | ------------------------------------------------------------------------------------ | ----------- |
| 简单 | 643. 子数组最大平均数 I    | [力扣链接](https://leetcode.cn/problems/maximum-average-subarray-i/)                     | 固定长度滑窗      |
| 中等 | 3. 无重复字符的最长子串      | [力扣链接](https://leetcode.cn/problems/longest-substring-without-repeating-characters/) | 动态窗口 + 去重   |
| 中等 | 438. 找到字符串中所有字母异位词 | [力扣链接](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)                  | 动态窗口 + 频率统计 |
| 困难 | 76. 最小覆盖子串         | [力扣链接](https://leetcode.cn/problems/minimum-window-substring/)                       | 动态窗口 + 最小长度 |


* any list
{:toc}