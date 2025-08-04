---
layout: post
title: leetcode 技巧篇专题之哈希 Hashing 02-TOP100 1. 两数之和
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, hashing, top100, sf]
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

# 技巧篇

双指针

滑动窗口

位运算--状态压缩

扫描线

前缀和

哈希哈数--滚动哈希

计数

# 1. 两数之和

给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target  的那 两个 整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。

你可以按任意顺序返回答案。

示例 1：

输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。

示例 2：

输入：nums = [3,2,4], target = 6
输出：[1,2]

示例 3：

输入：nums = [3,3], target = 6
输出：[0,1]
 

提示：

2 <= nums.length <= 10^4
-109 <= nums[i] <= 10^9
-109 <= target <= 10^9

只会存在一个有效答案

进阶：你可以想出一个时间复杂度小于 O(n2) 的算法吗？


# 历史

这种题目以前记录过

> [1 两数之和 N 种解法](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum)

# v1-Hash

## 思路

这里为了练习哈希，直接用哈希解决。

## 解法

```java
public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for(int i = 0; i < nums.length; i++) {
            map.put(nums[i], i);
        }

        // 遍历
        // 并且你不能使用两次相同的元素。
        for(int i = 0; i < nums.length; i++) {
            int num = nums[i];
            int differ = target-num;
            Integer differIx = map.get(differ);
            if(differIx != null && differIx != i) {
                return new int[]{i,differIx};
            }
        }

        // 不会到这里
        return new int[]{-1,-1};
    }
```

## 效果

5ms 击败 39.46%

## 反思

可以改进吗？

# v2-哈希改进版

## 思路

我们没必要一定要全部创建完成，可以一边构建，一边处理。

## 实现

```java
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for(int i = 0; i < nums.length; i++) {
            int num = nums[i];

            int differ = target - num;
            
            // 理论上这里一定会结束
            if(map.containsKey(differ)) {
                return new int[]{i,map.get(differ)};
            }

            map.put(num, i);
        }
        // 不会到这里
        return new int[]{-1,-1};
    }
```

## 效果

2ms  99.64%

## 反思

还能更快吗？

算法本身接近最优，暂时没有太大改进的空间。


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将继续学习 TOP100，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


* any list
{:toc}