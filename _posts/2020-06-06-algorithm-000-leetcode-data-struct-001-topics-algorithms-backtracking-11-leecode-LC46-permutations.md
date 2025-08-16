---
layout: post
title: leetcode 算法篇专题之回溯 Backtracking 02-LC46. 全排列 permutations
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

# 算法篇

动态规划-记忆化搜索

递归

二分查找

DFS 深度优先遍历

BFS 广度优先遍历

回溯

贪心

分治：快排、归并

# LC46. 全排列 permutations

给定一个不含重复数字的数组 nums ，返回其 所有可能的全排列 。你可以 按任意顺序 返回答案。

示例 1：

输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
示例 2：

输入：nums = [0,1]
输出：[[0,1],[1,0]]
示例 3：

输入：nums = [1]
输出：[[1]]
 

提示：

1 <= nums.length <= 6
-10 <= nums[i] <= 10
nums 中的所有整数 互不相同


# v1-迭代插入算法

## 思路

初始化结果集 res = [[]]（空路径）

1) 对数组中的每个数字 num：

遍历当前结果集的每个排列 perm

尝试把 num 插入 perm 的每个位置 生成新排列加入新的结果集

2) 遍历完所有数字，结果集就是全排列

## 示例（文字演示）：

nums = [1,2]

初始 res = [[]]
插入 1 → res = [[1]]
插入 2 → res = [[2,1], [1,2]]

核心思想：每次插入一个新元素，产生所有可能的新排列

## 实现

```java
    public List<List<Integer>> permute(int[] nums) {
        int n = nums.length;
        List<List<Integer>> res = new ArrayList<>();
        res.add(new ArrayList<>());

        for(int num : nums) {
            List<List<Integer>> tempRes = new ArrayList<>();

            // 插入所有可能的位置
            for (List<Integer> perm : res) {
                // 尝试把 num 插入 perm 的每个位置
                for (int i = 0; i <= perm.size(); i++) {
                    List<Integer> newPerm = new ArrayList<>(perm);
                    newPerm.add(i, num);

                    tempRes.add(newPerm);
                }
            }


            // 更新
            res = tempRes;
        }

        return res;
    }
```

## 效果

1ms 击败 96.33%

## 复杂度

时间复杂度 O(n × n!)

空间复杂度 O(n × n!) 



# v2-回溯

## 思路

某种角度而言，回溯只是一种特殊的递归。

不过这种排列的方式，因为每一个数字只能使用一次，所以最好使用一个 boolean[] used 数组标记是否使用过。

## 核心流程

1）终止条件

list.size() == n，说明数字本次排列用完，加入结果集合。

2）遍历所有数字

跳过已经用过的数字

used[i] == false 的，加入。更新 used[i] = true;

回溯

移除最后一个元素，used[i] = false

## 实现

```java
    public List<List<Integer>> permute(int[] nums) {
        int n = nums.length;
        List<List<Integer>> res = new ArrayList<>();

        boolean[] used = new boolean[n];
        List<Integer> tempList = new ArrayList<>();
        backtrack(res, tempList, nums, used);

        return res;
    }


    // backtrack
    private void backtrack(List<List<Integer>> res, List<Integer> tempList, int[] nums, boolean[] used) {
        int n = nums.length;
        // 满了 加入
        if(tempList.size() == n) {
            res.add(new ArrayList<>(tempList));
            return;
        }

        // 回溯
        for(int i = 0; i < n; i++) {
            if(used[i]) {
                continue;
            }
            tempList.add(nums[i]);
            used[i] = true;
            backtrack(res, tempList, nums, used);

            // 移除
            used[i] = false;
            // 移除最后一个
            tempList.remove(tempList.size()-1);
        }
    }
```

## 效果

1 ms 击败 96.33%

## 复杂度

时间复杂度 O(n × n!)

空间复杂度 O(n × n!) 


# v3-回溯用 set

## 思路

不用 used 数组，而是改为一个 set 记录剩余可用的数字。

发现有一个缺点，为了避免并发修改，需要重复拷贝一份。导致性能比较差。

## 实现

```java
 public List<List<Integer>> permute(int[] nums) {
        int n = nums.length;
        List<List<Integer>> res = new ArrayList<>();

        Set<Integer> set = new HashSet<>();
        for(int num : nums) {
            set.add(num);
        }

        List<Integer> tempList = new ArrayList<>();
        backtrack(res, tempList, set);

        return res;
    }


    // backtrack
    private void backtrack(List<List<Integer>> res, List<Integer> tempList, Set<Integer> set) {
        // 用完了
        if(set.isEmpty()) {
            res.add(new ArrayList<>(tempList));
            return;
        }

        for (int num : set) {
            tempList.add(num);

            Set<Integer> newSet = new HashSet<>(set);
            newSet.remove(num);

            backtrack(res, tempList, newSet);

            tempList.remove(tempList.size() - 1);
        }
    }
```

## 效果

4ms 击败 1.57%

* any list
{:toc}