---
layout: post
title:  【leetcode】52-410. split-array-largest-sum  力扣 410. 分割数组的最大值
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 题目

给定一个非负整数数组 nums 和一个整数 k ，你需要将这个数组分成 k 个非空的连续子数组。

设计一个算法使得这 k 个子数组各自和的最大值最小。

示例 1：

输入：nums = [7,2,5,10,8], k = 2
输出：18
解释：
一共有四种方法将 nums 分割为 2 个子数组。 
其中最好的方式是将其分为 [7,2,5] 和 [10,8] 。
因为此时这两个子数组各自的和的最大值为18，在所有情况中最小。

示例 2：

输入：nums = [1,2,3,4,5], k = 2
输出：9
示例 3：

输入：nums = [1,4,4], k = 3
输出：4
 

提示：

1 <= nums.length <= 1000

0 <= nums[i] <= 10^6

1 <= k <= min(50, nums.length)

# v1-基本前缀和+BF

## 思路

前缀和提前构架好整个前缀和数组，方便计算子数组的和。

但是这里构建好前缀和实际上还要做两件事：

1）如何把数组拆分为 k 个子数组？

2）如何保证 k 个子数组的各自和的最大值最小

本质是一个什么问题？

暴力算法算出所有的结果可能性？

## 子问题1-拆分

将数组拆分为 k 个连续非空子数组，有多少种方式？应该如何计算？

backtracking? 回溯？

## 子问题2-最小值

这个还算好解决，可以存储一下，对比即可。

感觉直接做这一题有点难，先做其他题目找找感觉，

TBC.....

## 小结


# 参考资料

https://leetcode.cn/problems/longest-well-performing-interval/submissions/578871050/?envType=problem-list-v2&envId=prefix-sum

* any list
{:toc}