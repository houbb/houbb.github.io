---
layout: post
title: leetcode 算法篇专题之回溯 Backtracking 02-LC78 子集 subsets
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, backtracking, sf]
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

# 78. 子集

给你一个整数数组 nums ，数组中的元素 互不相同 。返回该数组所有可能的子集（幂集）。

解集 不能 包含重复的子集。

你可以按 任意顺序 返回解集。 

示例 1：

输入：nums = [1,2,3]
输出：[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]


示例 2：

输入：nums = [0]
输出：[[],[0]]
 

提示：

1 <= nums.length <= 10
-10 <= nums[i] <= 10
nums 中的所有元素 互不相同


# v1-回溯

## 思路

某种角度而言，回溯只是一种特殊的递归。

不过这种排列的方式，因为每一个数字只能使用一次，而且是子集。

这个和 LC77 组合的区别在于，不需要数量达到 k 也可以直接加入。


## 核心流程


1）i 从 start...n 开始遍历所有数字

list 加入当前数字。入结果集合。

回溯 backtrack(i+1, nums)

回溯，移除

## 实现

```java
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        res.add(new ArrayList<>());

        List<Integer> tempList = new ArrayList<>();
        backtrack(res, nums, tempList, 0);

        return res;
    }

    private void backtrack(List<List<Integer>> res, int[] nums, List<Integer> tempList, int startIx) {
        // 什么时候结束？

        for(int i = startIx; i < nums.length; i++) {
            tempList.add(nums[i]);
            res.add(new ArrayList<>(tempList));

            backtrack(res, nums, tempList, i+1);

            tempList.remove(tempList.size()-1);
        }
    }
```

## 效果

0ms 击败 100.00%



* any list
{:toc}