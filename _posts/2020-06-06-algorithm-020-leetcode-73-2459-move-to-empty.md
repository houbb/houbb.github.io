---
layout: post
title:  【leetcode】73-greedy 2459. 通过移动项目到空白区域来排序数组
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, greedy, leetcode]
published: true
---

# 题目

给定一个大小为 n 的整数数组 nums，其中包含从 0 到 n - 1 (包含边界) 的 每个 元素。

从 1 到 n - 1 的每一个元素都代表一项目，元素 0 代表一个空白区域。

在一个操作中，您可以将 任何 项目移动到空白区域。如果所有项目的编号都是 升序 的，并且空格在数组的开头或结尾，则认为 nums 已排序。

例如，如果 n = 4，则 nums 按以下条件排序:

nums = [0,1,2,3] 或
nums = [1,2,3,0]

...否则被认为是无序的。

返回排序 nums 所需的最小操作数。

示例 1:

输入: nums = [4,2,0,3,1]
输出: 3
解释:
- 将项目 2 移动到空白区域。现在，nums =[4,0,2,3,1]。
- 将项目 1 移动到空白区域。现在，nums =[4,1,2,3,0]。
- 将项目 4 移动到空白区域。现在，nums =[0,1,2,3,4]。
可以证明，3 是所需的最小操作数。
示例 2:

输入: nums = [1,2,3,4,0]
输出: 0
解释: nums 已经排序了，所以返回 0。
示例 3:

输入: nums = [1,0,2,4,3]
输出: 2
解释:
- 将项目 2 移动到空白区域。现在，nums =[1,2,0,4,3]。
- 将项目 3 移动到空白区域。现在，nums =[1,2,3,4,0]。
可以证明，2 是所需的最小操作数。
 

提示:

n == nums.length
2 <= n <= 105
0 <= nums[i] < n
nums 的所有值都是 唯一 的。





# 参考资料

https://leetcode.cn/problems/house-robber/description/?envType=problem-list-v2&envId=dynamic-programming

* any list
{:toc}