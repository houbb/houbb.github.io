---
layout: post
title: leetcode 数组专题之数组遍历-01-遍历 42. 接雨水
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


# 42. 接雨水

给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

示例 1：

输入：height = [0,1,0,2,1,0,1,3,2,1,2,1]
输出：6
解释：上面是由数组 [0,1,0,2,1,0,1,3,2,1,2,1] 表示的高度图，在这种情况下，可以接 6 个单位的雨水（蓝色部分表示雨水）。 

示例 2：

输入：height = [4,2,0,3,2,5]
输出：9

提示：

n == height.length
1 <= n <= 2 * 10^4
0 <= height[i] <= 10^5


# v1-暴力法

## 思路

就算是暴力，也需要有一定的思路。

1）首先考虑开始、结束位置，无论是否为零，都存不住水。可以不考虑。

2）任何一个中间的位置，存水的数量，取决于 `min(左边最高, 右边最高) - 减去当前的高度`。

## 实现

```java
    public int trap(int[] height) {
        int sum = 0;
        for(int i = 1; i < height.length-1; i++) {
            // 左边最高
            int maxLeft = findMaxHeight(height, 0, i-1);
            // 右边最高
            int maxRight = findMaxHeight(height, i+1, height.length-1);
            // 当前
            int maxHeight = Math.min(maxLeft, maxRight);
            // 大于0才累加
            int curTrap = maxHeight - height[i];
            if(curTrap > 0) {
                sum  += curTrap;
            }
        }
        return sum;
    }

    private int findMaxHeight(int[] height, int startIx, int endIx) {
        int max = Integer.MIN_VALUE;

        for(int i = startIx; i <= endIx; i++) {
            if(height[i] > max) {
                max = height[i];
            }
        }
        return max;
    }
```

## 效果

超出时间限制

322 / 324 个通过的测试用例


## 反思

TC: O(N^2)

可以更快吗？

# v2-DP 思路

## 思路

回顾下 v1 暴力的思路

1）首先考虑开始、结束位置，无论是否为零，都存不住水。可以不考虑。

2）任何一个中间的位置，存水的数量，取决于 `min(左边最高, 右边最高) - 减去当前的高度`。

最核心的点有 2 个：

A. 当前位置左边的最高值，这个不难。默认 left=0，在往右边移动的时候，取 max 值更新即可。

B. 当前位置右边的最高值，怎么办呢？

这个我们可以提前预处理，直接数组逆序遍历一遍，存储每个位置应该的最大值即可。空间换时间。

实际上这里更加接近于 DP 的思路。

核心实现:

```java
// 初始化右边的最大值数组 逆序
int n = height.length;
int[] maxHeightRights = new int[n];
maxHeightRights[n - 1] = height[n - 1];
for (int i = n - 2; i >= 1; i--) {
    // 当前位置和右边的最大值对比
    // 甚至看到了 dp 的影子
    maxHeightRights[i] = Math.max(height[i], maxHeightRights[i + 1]);
}
```

## 解法

```java
    public int trap(int[] height) {
        int sum = 0;

        // 初始化右边的最大值数组 逆序
        int n = height.length;
        int[] maxHeightRights = new int[n];
        maxHeightRights[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 1; i--) {
            // 当前位置和右边的最大值对比
            // 甚至看到了 dp 的影子
            maxHeightRights[i] = Math.max(height[i], maxHeightRights[i + 1]);
        }

        // 左边最大值
        int maxLeft = height[0];
        for (int i = 1; i < n - 1; i++) {
            // 右边最高
            int maxRight = maxHeightRights[i];
            // 当前
            int maxHeight = Math.min(maxLeft, maxRight);
            // 大于0才累加
            int curTrap = maxHeight - height[i];
            if (curTrap > 0) {
                sum += curTrap;
            }

            // 更新左边的最大值
            if (height[i] > maxLeft) {
                maxLeft = height[i];
            }
        }
        return sum;
    }
```

## 效果

1ms 击败 65.30%

## 复杂度

TC: O(n)

SC: O(n) 用到了一个额外的数组

# v3-双指针

## 思路

套路双指针的经典套路。

我们定义 left right 两个指针，标志着左右两边的位置。

leftMax、rightMax 代表着左右两边最高的高度。

1) 初始化

```
left = 0
right = n-1
leftMax = rightMax=0
```

2) 核心逻辑

接雨水最核心的思想在于：**当前这个位置的水面高度是由两边中较低的那一边决定的，而我们就是在判断“哪一边低”**。

我们思考下:

2.1 如果 `height[left] > height[right]`，如果左边更高，则左右两边左边高度肯定是够高的。那么水位取决于什么? 其实只要看右边的最高水位 rightMax 就行。然后 right--

2.2 如果 `height[left] <= height[right]`，如果左边没有更高。关注左边的最高水位 leftMax 就行。然后 left++

水位之取决于低的一边（木桶效应），值得多读两边。

那么解法就很简单了。

## 实现

```java
public int trap(int[] height) {
        // 初始化
        int n = height.length;
        int left = 0;
        int right = n-1;
        int leftMax = 0;
        int rightMax = 0;

        int sum = 0;


        // 经典循环
        while (left < right) {
            // 两边最大值
            leftMax = Math.max(leftMax, height[left]);
            rightMax = Math.max(rightMax, height[right]);

            // 比较左右的那边高
            // 左边高，只看右边最大值即可
            if(height[left] > height[right]) {
                sum += rightMax - height[right];
                right--;
            } else {
                // 右边高 取决于左边
                sum += leftMax - height[left];
                left++;
            }
        }

        return sum;
    }
```

## 效果

0ms 100%


----------------------------------------------------------------


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解 Top100 经典题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}