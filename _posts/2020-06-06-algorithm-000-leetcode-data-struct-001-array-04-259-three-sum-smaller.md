---
layout: post
title: leetcode 数组专题 04-leetcode.259 three-sum-smaller 力扣.259 较小的三数之和 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, binary-search, sf]
published: true
---



# 题目

题目描述

给定一个长度为 n 的整数数组和一个目标值 target ，寻找能够使条件 nums[i] + nums[j] + nums[k] < target 成立的三元组  i, j, k 个数（0 <= i < j < k < n）。

示例 1：

```
输入: nums = [-2,0,1,3], target = 2
输出: 2 
解释: 因为一共有两个三元组满足累加和小于 2:
     [-2,0,1]
     [-2,0,3]
```

示例 2：

```
输入: nums = [], target = 0
输出: 0 
```

示例 3：

```
输入: nums = [0], target = 0
输出: 0 
```

提示:

n == nums.length
0 <= n <= 3500
-100 <= nums[i] <= 100
-100 <= target <= 100

# 前言

这道题作为 leetcode 的第 259 道题，和 T015 T016 应该有一定的关系。

大概思路可以有下面几种：

1. 暴力解法

2. 数组排序+二分

3. Hash 优化

4. 双指针

# v1-暴力解法

## 思路

直接 3 次循环，找到符合结果的数据返回。

这种最容易想到，一般工作中也是我们用到最多的。

## 实现

```java
public int threeSumSmaller(int[] nums, int target) {
    final int n = nums.length;
    int count = 0;
    for(int i = 0; i < n; i++) {
        for(int j = i+1; j < n; j++) {
            for(int k = j+1; k < n; k++) {
                int sum = nums[i]+nums[j]+nums[k];
                if(sum > target) {
                    count++;
                }
            }
        }
    }
    return count;
}
```

## 效果

加密题，暂时未做真实验证。

## 小结

这里慢在三层循环，可以考虑排序后利用双指针优化。

可以参考 T015/T016 的思路。

# v2-排序+双指针

## 思路

首先排序

固定第一个元素，然后后面两个元素通过双指针寻找，类似于 T015

## 实现

```java
public int threeSumSmaller(int[] nums, int target) {
    Arrays.sort(nums);

    // 处理双指针
    final int n = nums.length;
    int count = 0;
    for(int i = 0; i < n-2; i++) {
        int left = i+1;
        int right = n-1;
        while (left < right) {
            int sum = nums[i] + nums[left] + nums[right];
            if(sum < target) {
                // 此时，在左右中的任何一个元素都满足条件
                // 但是这里不会重复吗？
                count += right-left;
                left++;
            } else {
                right--;
            }
        }
    }

    return count;
}
```

## 疑问

疑问是关于 `count += right - left;` 这一行是否会重复。

#### 解答：

不会重复。让我们逐步分析：

- 当 `sum < target` 时，`left` 指针增加，并且 `right - left` 这一段范围内的所有数（从 `left+1` 到 `right`）都满足 `nums[i] + nums[left] + nums[right] < target` 这一条件。

所以，这里你不需要逐个枚举 `left` 和 `right` 中的所有数，只要知道这一段的所有数都满足条件就可以了。

  比如，假设 `nums[i] + nums[left] + nums[right] < target`，那么：
  - `nums[i] + nums[left] + nums[right-1] < target`
  - `nums[i] + nums[left] + nums[right-2] < target`
  - ...
  - `nums[i] + nums[left] + nums[left+1] < target`

  因此，所有从 `left+1` 到 `right` 的组合都是有效的，数量正好是 `right - left`，因此可以直接加上 `right - left`。

#### 可能的重复检查：

- 在 `left++` 之后，`left` 会向右移动，并且 `nums[left]` 已经被计算过了，不会再被重复计入。

- 在 `right--` 之后，`right` 会向左移动，同样的，`nums[right]` 也不会被重复计入。

因此，这里没有重复的计算。

# 小结

这里对双指针的理解要求比较高。

在理解了 T015 的基础上实现这一题并不算特别难。

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

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

* any list
{:toc}