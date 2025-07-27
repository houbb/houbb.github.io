---
layout: post
title: leetcode sort 排序-02-冒泡排序力扣 912. 排序数组
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, sort, leetcode, sf]
published: true
---

# 排序系列

[sort-00-排序算法汇总](https://houbb.github.io/2016/07/14/sort-00-overview-sort)

[sort-01-bubble sort 冒泡排序算法详解](https://houbb.github.io/2016/07/14/sort-01-bubble-sort)

[sort-02-QuickSort 快速排序到底快在哪里？](https://houbb.github.io/2016/07/14/sort-02-quick-sort)

[sort-03-SelectSort 选择排序算法详解](https://houbb.github.io/2016/07/14/sort-03-select-sort)

[sort-04-heap sort 堆排序算法详解](https://houbb.github.io/2016/07/14/sort-04-heap-sort)

[sort-05-insert sort 插入排序算法详解](https://houbb.github.io/2016/07/14/sort-05-insert-sort)

[sort-06-shell sort 希尔排序算法详解](https://houbb.github.io/2016/07/14/sort-06-shell-sort)

[sort-07-merge sort 归并排序](https://houbb.github.io/2016/07/14/sort-07-merge-sort)

[sort-08-counting sort 计数排序](https://houbb.github.io/2016/07/14/sort-08-counting-sort)

[sort-09-bucket sort 桶排序](https://houbb.github.io/2016/07/14/sort-09-bucket-sort)

[sort-10-bigfile 大文件外部排序](https://houbb.github.io/2016/07/14/sort-10-bigfile-sort)

# 前言

大家好，我是老马。

以前从工程的角度，已经梳理过一次排序算法。

这里从力扣算法的角度，重新梳理一遍。

核心内容包含：

1）常见排序算法介绍

2）背后的核心思想

3）leetcode 经典题目练习+讲解

4）应用场景、优缺点等对比总结

5）工程 sdk 包，这个已经完成。

6) 可视化

本次主要讲解的是冒泡排序的实战练习。

# 排序数组

给你一个整数数组 nums，请你将该数组升序排列。

你必须在 不使用任何内置函数 的情况下解决问题，时间复杂度为 O(nlog(n))，并且空间复杂度尽可能小。

示例 1：

输入：nums = [5,2,3,1]
输出：[1,2,3,5]
解释：数组排序后，某些数字的位置没有改变（例如，2 和 3），而其他数字的位置发生了改变（例如，1 和 5）。
示例 2：

输入：nums = [5,1,1,2,0,0]
输出：[0,0,1,1,2,5]
解释：请注意，nums 的值不一定唯一。
 

提示：

1 <= nums.length <= 5 * 10^4
-5 * 10^4 <= nums[i] <= 5 * 10^4

# 排序算法回顾

我们首先回顾下适用性比较强的排序算法，下面主要作为练习，我们把前面 3 种也写一下。

🧱 一、基础排序算法（适合入门）

| 算法                      | 时间复杂度 (平均/最坏) | 空间复杂度 | 稳定性   | 优点           | 缺点               |
| ----------------------- | ------------- | ----- | ----- | ------------ | ---------------- |
| **冒泡排序** Bubble Sort    | O(n²) / O(n²) | O(1)  | ✅ 稳定  | 实现简单，适合教学    | 效率极低，适合数据很小或几乎有序 |
| **选择排序** Selection Sort | O(n²) / O(n²) | O(1)  | ❌ 不稳定 | 交换次数少，结构清晰   | 比冒泡还慢，不能利用已有序性   |
| **插入排序** Insertion Sort | O(n²) / O(n²) | O(1)  | ✅ 稳定  | 适合小规模、部分有序数据 | 大数据量时效率低         |

⚙️ 二、进阶排序算法（效率更高）

| 算法                  | 时间复杂度 (平均/最坏)           | 空间复杂度         | 稳定性   | 优点              | 缺点                |
| ------------------- | ----------------------- | ------------- | ----- | --------------- | ----------------- |
| **归并排序** Merge Sort | O(n log n) / O(n log n) | O(n)          | ✅ 稳定  | 稳定，时间稳定，适合链表等结构 | 空间消耗大，递归实现复杂      |
| **快速排序** Quick Sort | O(n log n) / O(n²)      | O(log n)（递归栈） | ❌ 不稳定 | 平均快，原地排序，实用性强   | 最坏情况退化为 O(n²)，不稳定 |
| **希尔排序** Shell Sort | 约 O(n¹.³) / O(n²)       | O(1)          | ❌ 不稳定 | 改进插入排序，速度提升大    | 增量序列选择影响性能，难分析    |
| **堆排序** Heap Sort   | O(n log n) / O(n log n) | O(1)          | ❌ 不稳定 | 不使用递归，不需要额外内存   | 实现略复杂，不稳定  



* any list
{:toc}