---
layout: post
title: leetcode 数组专题之数组遍历-01-遍历 T283 移动零
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, array, traverse, two-pointer, top100, sf]
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


# T283 移动零

给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。

请注意 ，必须在不复制数组的情况下原地对数组进行操作。


示例 1:

输入: nums = [0,1,0,3,12]
输出: [1,3,12,0,0]
示例 2:

输入: nums = [0]
输出: [0]
 

提示:

1 <= nums.length <= 104
-2^31 <= nums[i] <= 2^31 - 1
 

进阶：你能尽量减少完成的操作次数吗？

# v1-冒泡

## 思路

我们可以用冒泡来处理。

只不过是简化版本，只把 0 和非 0 交换。

## 实现

```java
    public void moveZeroes(int[] nums) {
        for(int i = 0; i < nums.length; i++) {
            for(int j = 0; j < nums.length-i-1; j++) {
                // 交换
                if(nums[j] == 0 && nums[j+1] != 0) {
                    int temp = nums[j];
                    nums[j] = nums[j+1];
                    nums[j+1] = temp;
                }
            }
        }
    }
```


## 效果

349ms 击败 5.00%

# v2-双指针

## 思路

这一题和 T26 T27 类似。

限制的越多，基本上解法就越少。

## 实现

```java
    public void moveZeroes(int[] nums) {
        int left = 0;
        int right = 0;
        for(right = 0; right < nums.length; right++) {
            if(nums[right] != 0) {
                nums[left++] = nums[right];
            }
        }
        
        // 后面全部放置0？
        for(int i = left; i < nums.length; i++) {
            nums[i] = 0;
        }
    }
```

## 效果

1ms 100%

## 反思

双指针适用性更强，值得深刻记忆。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解 Top100 经典题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


* any list
{:toc}