---
layout: post
title: leetcode 算法篇专题之回溯 Backtracking 02-LC39 组合总和 combination-sum
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

# 39 组合总和

给你一个 无重复元素 的整数数组 candidates 和一个目标整数 target ，找出 candidates 中可以使数字和为目标数 target 的 所有 不同组合 ，并以列表形式返回。

你可以按 任意顺序 返回这些组合。

candidates 中的 同一个 数字可以 无限制重复被选取 。

如果至少一个数字的被选数量不同，则两种组合是不同的。 

对于给定的输入，保证和为 target 的不同组合数少于 150 个。

示例 1：

输入：candidates = [2,3,6,7], target = 7
输出：[[2,2,3],[7]]
解释：
2 和 3 可以形成一组候选，2 + 2 + 3 = 7 。注意 2 可以使用多次。
7 也是一个候选， 7 = 7 。
仅有这两种组合。

示例 2：

输入: candidates = [2,3,5], target = 8
输出: [[2,2,2,2],[2,3,3],[3,5]]

示例 3：
输入: candidates = [2], target = 1
输出: []
 

提示：

1 <= candidates.length <= 30
2 <= candidates[i] <= 40
candidates 的所有元素 互不相同
1 <= target <= 40


# v1-回溯

## 思路

数字可以重复使用 → 每个数字可以被选择多次。

组合的顺序不重要 → [2,2,3] 和 [2,3,2] 认为是同一个。

目标是 sum → 回溯/DFS 很自然。

## 核心流程

### Step 1: 确定递归参数

path：当前选择的数字组合
start：当前递归可选的 candidates 下标
targetLeft：剩余需要凑的目标

### Step 2: 递归终止条件

targetLeft == 0 → 当前 path 有效，加入结果
targetLeft < 0 → 当前 path 不可能，再往下就超了，回溯

### Step 3: 循环遍历选择

从 start 到 candidates.length-1

为什么**从 start 开始？保证组合不会重复**

例如 [2,3] 和 [3,2] 被认为是同一组合

选择 candidates[i] 后，**递归仍然可以从 i 开始（因为可以重复选同一个数字）**

PS: 如果数字不能重复选择，那么就是 i+1

### Step 4: 递归 + 回溯

伪代码

```
for i = start to candidates.length-1:
    path.add(candidates[i])
    dfs(i, path, targetLeft - candidates[i])  // 注意这里还是 i，不是 i+1
    path.removeLast() // 回溯
```

## 实现

```java
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> res = new ArrayList<>();

        backtrack(res, candidates, 0, target, new ArrayList<>());
        return res;
    }

    private void backtrack(List<List<Integer>> res, int[] candidates, int start, int targetRemain,
        List<Integer> path) {
        // 满足
        if(targetRemain == 0) {
           res.add(new ArrayList<>(path));         
           return;
        }
        // 数字不可能小于0
        if(targetRemain < 0) {
            return;
        }

        // 从 start 开始，是组合。
        for(int i = start; i < candidates.length; i++) {
            path.add(candidates[i]);
            targetRemain -= candidates[i];

            // 数字可以重复取
            backtrack(res, candidates, i, targetRemain, path);

            // 撤销
            path.remove(path.size()-1);
            targetRemain += candidates[i];
        }
        
    }
```


## 效果

2ms 击败 89.50%


* any list
{:toc}