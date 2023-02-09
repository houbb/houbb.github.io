---
layout: post
title: 【leetcode】009 - 11. 盛最多水的容器 Container With Most Water 双指针法
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, dp, leetcode, sf]
published: true
---

# 11. 盛最多水的容器

给定一个长度为 n 的整数数组 height 。有 n 条垂线，第 i 条线的两个端点是 (i, 0) 和 (i, height[i]) 。

找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。

返回容器可以储存的最大水量。

说明：你不能倾斜容器。

## 例子

示例 1：

```
输入：[1,8,6,2,5,4,8,3,7]
输出：49 
解释：图中垂直线代表输入数组 [1,8,6,2,5,4,8,3,7]。在此情况下，容器能够容纳水（表示为蓝色部分）的最大值为 49。
```

示例 2：

```
输入：height = [1,1]
输出：1
``` 

## 提示：

n == height.length

2 <= n <= 10^5

0 <= height[i] <= 10^4

# V1-基本算法

## 思路

最简单的，我们直接两次迭代，找到所有的 [i, j] 组合，计算所有的面积，招到最大的即可。

高度：每次取高度，取最低的。（木桶理论）

宽度：水墙壁的宽度忽略，相邻2个间距为下标的差。

## java 实现

```java
public int maxArea(int[] height) {
    int maxResult = -1;
    for(int i = 0; i < height.length; i++) {
        for(int j = 0; j < height.length; j++) {
            // 跳过自身相等的元素
            if(i == j) {
                continue;
            }
            int hi = height[i];
            int hj = height[j];

            // 高度取最小的
            int min = Math.min(hi, hj);

            int x = Math.abs(j - i);
            int area = x * min;
            if(area > maxResult) {
                maxResult = area;
            }
        }
    }
    return maxResult;
}
```

## 效果

```
Runtime: 843 ms, faster than 5.04% of Java online submissions for Container With Most Water.
Memory Usage: 39.4 MB, less than 94.66% of Java online submissions for Container With Most Water.
```

很慢。

那么能不能优化呢？

## 简单优化

我们可以针对迭代进行优化，保障 j > i。

但是变化不大，所以不认为是一个单独的算法：

```java
/**
 * 优化思路
 *
 * 1. 避免重复计算
 * 2. j 永远大于 i，跳过计算
 * @param height 高度数组
 * @return 结果
 * @since v2
 */
public int maxAreaV2(int[] height) {
    int maxResult = -1;
    for(int i = 0; i < height.length; i++) {
        for(int j = i+1; j < height.length; j++) {
            int hi = height[i];
            int hj = height[j];
            int min = Math.min(hi, hj);
            int x = j-i;
            int area = x * min;
            if(area > maxResult) {
                maxResult = area;
            }
        }
    }
    return maxResult;
}
```

# V2-双指针法

## 思路

首先从 l=0, r=height.length-1（两边）

（1）比较二者数字大小

```java
if(height[l] < height[r]) {
     // 左边小，那么高度被固定，右边移动已经达到最大。只能左边向右移动
} else {
    // 右边下，右边高度被固定，只能最右往左移动。
}
```

（2）终止条件

l >= R 则终止。

（3）优化点

因为每次只移动一位，所以不需要每次都采用减法，直接使用变量保存即可。

大小比较实用内部方法，而不是 Math 的方法。

PS: 实践证明，内部方法确实比 Math 的快。不过一般没必要，这个属于极限优化，一个小技巧。

## java 实现

```java
    public int maxArea(int[] height) {
        int l = 0;
        int r = height.length-1;
        int maxArea = 0;
        int width = height.length-1;

        while (l < r) {
            int area = min(height[l], height[r]) * (width);
            maxArea = max(area, maxArea);

            // 考虑如何移动指针
            if(height[l] >= height[r]) {
                // 左边比较大
                r--;
            } else {
                l++;
            }
            width--;
        }
        return maxArea;
    }

    private int min(int a, int b) {
        return a < b ? a : b;
    }

    private int max(int a, int b) {
        return a > b ? a : b;
    }
```

## 效果

TC 从 O(N^2) 降低到 O(N)，非常强的算法。

虽然看起来平平无奇，后续的解题中也会用到。

```
Runtime: 2 ms, faster than 95.28% of Java online submissions for Container With Most Water.
Memory Usage: 40 MB, less than 38.16% of Java online submissions for Container With Most Water.
```

# 小结

第一种算法，应该很容易考虑到。

双指针法，是一种从两边开始，同时向中间移动的，非常好用的算法。

使用内部方法提升性能，也是一个不错的小技巧。

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 参考资料

https://leetcode.cn/problems/container-with-most-water/

* any list
{:toc}