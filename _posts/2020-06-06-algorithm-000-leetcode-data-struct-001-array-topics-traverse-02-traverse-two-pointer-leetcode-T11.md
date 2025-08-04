---
layout: post
title: leetcode 数组专题之数组遍历-01-遍历 11. 盛最多水的容器
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


# 11. 盛最多水的容器

给定一个长度为 n 的整数数组 height 。

有 n 条垂线，第 i 条线的两个端点是 `(i, 0)` 和 `(i, height[i])`。

找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。

返回容器可以储存的最大水量。

说明：你不能倾斜容器。

## 例子

![例子](https://aliyun-lc-upload.oss-cn-hangzhou.aliyuncs.com/aliyun-lc-upload/uploads/2018/07/25/question_11.jpg)

输入：[1,8,6,2,5,4,8,3,7]
输出：49 
解释：图中垂直线代表输入数组 [1,8,6,2,5,4,8,3,7]。在此情况下，容器能够容纳水（表示为蓝色部分）的最大值为 49。

示例 2：

输入：height = [1,1]
输出：1

提示：

n == height.length
2 <= n <= 10^5
0 <= height[i] <= 10^4


# 历史回顾

> [【leetcode】009 - 11. 盛最多水的容器 Container With Most Water 双指针法 + 42. 接雨水 Trapping Rain Water + 407. Trapping Rain Water II](https://houbb.github.io/2020/06/08/algorithm-009-leetcode-11-container-with-most-water)


# v1-暴力

## 思路

我们先用暴力。

遍历所有的 i, j 两个位置，找到最大的可能性。

```
面积 = 宽 * 高
```

宽，是 x 的差值

高，是 h 中取最小的那一个。

## 实现

```java
public int maxArea(int[] height) {
        int maxArea = 0;

        for(int i = 0; i < height.length-1; i++) {
            for(int j = i+1; j < height.length; j++) {
                int w = j-i;
                int h = Math.min(height[i], height[j]);
                maxArea = Math.max(w*h, maxArea);
            }
        }

        return maxArea;
    }
```


## 效果

超出时间限制

58 / 65 个通过的测试用例

## 反思

我们如何可以让计算更快？

# v2-双指针

## 思路

我们可以定义 left=0, right=n-1 的左右指针。

1）基本信息

宽度  `w = (right - left)`  

结束条件 `right <= left`

高度：取 `min(height[left], height[right])`

2）如何决定移动呢？

一开始在两边。height[left] 和 height[right]，高的保持不动，移动另一边。

3）统计每一步的最大值，统计得到结果


## 实现

```java
public static int maxArea(int[] height) {
        int maxArea = 0;
        int left = 0;
        int right = height.length-1;

        while (left < right) {
            // 面积
            int w = right - left;
            int h = Math.min(height[left], height[right]);

            int area = w * h;
            maxArea = Math.max(area, maxArea);

            // 比较两边的高度
            if(height[left] >= height[right]) {
                right--;
            } else {
                left++;
            }
        }

        return maxArea;
    }
```

## 效果

4ms 击败 74.61%

## 反思

双指针适用性更强，值得深刻记忆。


# v3-双指针优化

## 思路

我们在移动的时候。

1）right-- 

2) left++

都可以持续跳过多个比当前值更小的，没有计算的价值

## 实现

```java
    public static int maxArea(int[] height) {
        int maxArea = 0;
        int left = 0;
        int right = height.length-1;

        while (left < right) {
            int h = Math.min(height[left], height[right]);

            int area = (right-left) * h;
            maxArea = Math.max(area, maxArea);

            int curLeft = height[left];
            int curRight = height[right];

            // 比较两边的高度
            if(curLeft >= curRight) {
                while (left < right && height[right] <= curRight) {
                    right--;
                }
            } else {
                while (left < right && height[left] <= curLeft) {
                   left++;
                }
            }
        }

        return maxArea;
    }
```

## 效果

2ms 击败 97.89%

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解 Top100 经典题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}