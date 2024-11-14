---
layout: post
title: leetcode 数组专题 04-leetcode.16 three-sum-closest 力扣.16 最接近的三数之和 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, binary-search, sf]
published: true
---

# 数组系列

[力扣数据结构之数组-00-概览](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-00-overview)

[力扣.53 最大子数组和 maximum-subarray](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-01-51-maximum-subarray)

[力扣.128 最长连续序列 longest-consecutive-sequence](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-02-128-longest-consecutive-sequence)

[力扣.1 两数之和 N 种解法 two-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum)

[力扣.167 两数之和 II two-sum-ii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-ii)

[力扣.170 两数之和 III two-sum-iii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-iii)

[力扣.653 两数之和 IV two-sum-IV](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-iv)

[力扣.015 三数之和 three-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-015-three-sum)

[力扣.016 最接近的三数之和 three-sum-closest](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-016-three-sum-closest)

[力扣.259 较小的三数之和 three-sum-smaller](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-259-three-sum-smaller)

[力扣.018 四数之和 four-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-05-018-four-num)

[力扣.454 四数相加之和 II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-05-454-four-num-ii)

点击 {阅读原文} 获得更好的阅读体验。


# 题目

给你一个长度为 n 的整数数组 nums 和 一个目标值 target。请你从 nums 中选出三个整数，使它们的和与 target 最接近。

返回这三个数的和。

假定每组输入只存在恰好一个解。

 

示例 1：

输入：nums = [-1,2,1,-4], target = 1
输出：2
解释：与 target 最接近的和是 2 (-1 + 2 + 1 = 2)。
示例 2：

输入：nums = [0,0,0], target = 1
输出：0
解释：与 target 最接近的和是 0（0 + 0 + 0 = 0）。
 

提示：

3 <= nums.length <= 1000
-1000 <= nums[i] <= 1000
-10^4 <= target <= 10^4

# 前言

这道题作为 leetcode 的第 15 道题，看起来似曾相识。

大概思路可以有下面几种：

1. 暴力解法

2. 数组排序+二分

3. Hash 优化

4. 双指针

# v1-暴力解法

## 思路

直接 3 次循环，找到符合结果的数据返回。

这种最容易想到，一般工作中也是我们用到最多的。

大概率会超时。

## 实现

```java
public int threeSumClosest(int[] nums, int target) {
    final int n = nums.length;
    int result = Integer.MAX_VALUE;
    int minDis = Integer.MAX_VALUE;
    for(int i = 0; i < n; i++) {
        for(int j = i+1; j < n; j++) {
            for(int k = j+1; k < n; k++) {
                int sum = nums[i]+nums[j]+nums[k];
                int dis = Math.abs(sum - target);
                if(minDis > dis) {
                    minDis = dis;
                    result = sum;
                }
            }
        }
    }
    return result;
}
```

## 效果

574ms 8.04%

竟然通过了，还挺意外的

## 小结

这里慢在三层循环，可以考虑排序后利用双指针优化。

可以参考 T015 的思路。

# v2-排序+双指针

## 思路

首先排序

固定第一个元素，然后后面两个元素通过双指针寻找，类似于 T015

这里需要用一个变量记录最小的距离，另一个记录 result 和。

## 实现

```java
public int threeSumClosest(int[] nums, int target) {
    Arrays.sort(nums);
    // 处理双指针
    final int n = nums.length;
    int result = Integer.MAX_VALUE;
    int minDis = Integer.MAX_VALUE;
    for(int i = 0; i < n-2; i++) {
        int left = i+1;
        int right = n;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            // 判断是否为最小距离
            if(sum == target) {
                return target;
            }
            // 更新最小距离
            int abs = Math.abs(sum - target);
            if(abs < minDis) {
                minDis = abs;
                // 最小的 sum
                result = sum;
            }

            if(sum > target) {
                right--;
            }
            if(sum < target) {
                left++;
            }
        }
    }
    return result;
}
```

## 效果

12ms 77.79%

效果还行。看了下基本实现就是这个。

# 小结

这里对双指针的理解要求比较高。

在理解了 T015 的基础上实现这一题并不算特别难。

* any list
{:toc}