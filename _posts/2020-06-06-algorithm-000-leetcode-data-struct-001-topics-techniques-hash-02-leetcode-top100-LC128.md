---
layout: post
title: leetcode 技巧篇专题之哈希 Hashing 02-TOP100 128. 最长连续序列
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

# 128. 最长连续序列

给定一个未排序的整数数组 nums ，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。

请你设计并实现时间复杂度为 O(n) 的算法解决此问题。

示例 1：

输入：nums = [100,4,200,1,3,2]
输出：4
解释：最长数字连续序列是 [1, 2, 3, 4]。它的长度为 4。


示例 2：

输入：nums = [0,3,7,2,5,8,4,6,0,1]
输出：9


示例 3：

输入：nums = [1,0,1,2]
输出：3
 

提示：

0 <= nums.length <= 10^5
-10^9 <= nums[i] <= 10^9




# 历史

> [leetcode 数组专题 01-力扣.128 最长连续序列 leetcode longest-consecutive-sequence](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-02-128-longest-consecutive-sequence)


# v1-普通排序

## 思路

我们采用基本的排序思路来解决。

当然排序是不满足的，只是为了后续分析解决这个问题。

## 实现

```java
public static int longestConsecutive(int[] nums) {
        if(nums.length <= 0) {
           return 0;         
        }

        Arrays.sort(nums);

        // 跳过第一个数
        int tempLen = 1;
        int maxLen = 1;
        for(int i = 1; i < nums.length; i++) {
            if(nums[i] - nums[i-1] == 1) {
                tempLen++;

                maxLen = Math.max(maxLen, tempLen);
            } else if(nums[i] - nums[i-1] == 0) {

            } else {
                // reset
                tempLen = 1;
            }
        }

        return maxLen;
    }
```

## 效果

14ms 击败 95.92%

## 反思

如何 O(n) 呢？


# v2-其他排序

## 算法的改进

排序中有哪些是可以用 O(n) 来实现的，计数、基数、桶排序



# v3-哈希

## 思路

这一题如果想用哈希也可以解决。

连续：

HashSet 保存数字。

然后首先排除小的，只需要判断比当前数字大的即可。

## 实现

```java
public static int longestConsecutive(int[] nums) {
        if(nums.length <= 0) {
            return 0;
        }

        // 初始化
        Set<Integer> set = new HashSet<>();
        for(int num : nums) {
            set.add(num);
        }

        // 再遍历一次
        int maxLen = 1;

        for(int num : set) {
            // 没有比当前数小的，那么只要看刚好大1的连续个数就行
            if(!set.contains(num-1)) {
                int curNum = num;
                int curLen = 1;
                while (set.contains(curNum+1)) {
                    curNum++;
                    curLen++;
                }

                maxLen = Math.max(curLen, maxLen);
            }
        }

        return maxLen;
    }
```

## 效果

30ms 击败 72.86%

## 反思

这个用例还是有问题。体现不出 O(n) 的优势。


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将继续学习 TOP100，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


* any list
{:toc}