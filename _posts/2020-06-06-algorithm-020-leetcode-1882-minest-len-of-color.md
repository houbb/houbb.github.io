---
layout: post
title:  【leetcode】1882-1182. 与目标颜色间的最短距离
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, binary-search, leetcode]
published: true
---

# 题目

题目描述

给你一个数组 colors，里面有  1、2、 3 三种颜色。

我们需要在 colors 上进行一些查询操作 queries，其中每个待查项都由两个整数 i 和 c 组成。

现在请你帮忙设计一个算法，查找从索引 i 到具有目标颜色 c 的元素之间的最短距离。

如果不存在解决方案，请返回 -1。


示例 1：

输入：colors = [1,1,2,1,3,2,2,3,3], queries = [[1,3],[2,2],[6,1]]
输出：[3,0,3]
解释： 
距离索引 1 最近的颜色 3 位于索引 4（距离为 3）。
距离索引 2 最近的颜色 2 就是它自己（距离为 0）。
距离索引 6 最近的颜色 1 位于索引 3（距离为 3）。
示例 2：

输入：colors = [1,2], queries = [[0,3]]
输出：[-1]
解释：colors 中没有颜色 3。

提示：

1 <= colors.length <= 5*10^4
1 <= colors[i] <= 3
1 <= queries.length <= 5*10^4
queries[i].length == 2
0 <= queries[i][0] < colors.length
1 <= queries[i][1] <= 3

# v1-暴力解法

## 思路

直接 indexOf 比较左右两边。

此处不不做演示。

# v2-HashMap+二分

## 思路

查找目标 首先我们会想到优化 二分是比较容易想到的方式。

怎么才能用二分呢？我们的元素无顺序

题意：距离指定颜色的距离，所以我们如果考虑把相同的颜色放在 list 中呢？这样不就有序了。

## 实现









# 参考资料

https://leetcode.cn/problems/hanota-lcci/description/?envType=problem-list-v2&envId=recursion

* any list
{:toc}