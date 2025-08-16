---
layout: post
title: leetcode 算法篇专题之回溯 Backtracking 02-LC77. 组合 combinations
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

# LC77. 组合

给定两个整数 n 和 k，返回范围 [1, n] 中所有可能的 k 个数的组合。

你可以按 任何顺序 返回答案。

示例 1：

输入：n = 4, k = 2
输出：
[
  [2,4],
  [3,4],
  [2,3],
  [1,2],
  [1,3],
  [1,4],
]
示例 2：

输入：n = 1, k = 1
输出：[[1]]
 

提示：

1 <= n <= 20
1 <= k <= n


# v1-回溯

## 思路

这一题和 LC46 的区别在于排列中 [1,4]和[4,1]认为是不同的。

组合中 [1,4] 就用尽了数字，我们不需要考虑其他场景。

所以从前往后使用数字即可。

## 核心流程

1）初始化

start = 0

2）i 从 start...n 遍历所有数字

加入数字到 tempList， 如果 `tempList.size == k`，接入结果列表

```java
backtrack(i+1, n); // start 位置已消耗，递归

// 撤销
tempList.remove(tempList.size()-1);
```

## 实现

```java
    public List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> res = new ArrayList<>();

        List<Integer> tempList = new ArrayList<>();
        backtrack(res, tempList, n, k, 1);
        return res;
    }

    private void backtrack(List<List<Integer>> res, 
        List<Integer> tempList,
        int n, int k, int start) {
        if(tempList.size() == k) {
            res.add(new ArrayList<>(tempList));
            return;
        }

        for(int i = start; i <= n; i++) {
            tempList.add(i);

            backtrack(res, tempList, n, k, i+1);
            tempList.remove(tempList.size()-1);
        }
    }
```

## 效果

27ms 击败 19.96%

## 优化思路-剪枝

### 思路

i 不需要每次都从 start ... n

后面其实到 `i <= n - (k - tempList.size()) + 1` 就行了。

因为超过这个值，就不可能凑够 k 个值，没必要继续。

### 效果

16ms 击败 94.23%

效果显著


* any list
{:toc}