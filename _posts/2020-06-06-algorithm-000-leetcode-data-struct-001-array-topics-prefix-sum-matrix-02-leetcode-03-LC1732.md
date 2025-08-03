---
layout: post
title:  【leetcode】Prefix Sum 二维前缀和 1732. 找到最高海拔 find-the-highest-altitude
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, prefix-sum-matrix, leetcode]
published: true
---


# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 1732. 找到最高海拔

有一个自行车手打算进行一场公路骑行，这条路线总共由 n + 1 个不同海拔的点组成。自行车手从海拔为 0 的点 0 开始骑行。

给你一个长度为 n 的整数数组 gain ，其中 gain[i] 是点 i 和点 i + 1 的 净海拔高度差（0 <= i < n）。请你返回 最高点的海拔 。

 

示例 1：

输入：gain = [-5,1,5,0,-7]
输出：1
解释：海拔高度依次为 [0,-5,-4,1,1,-6] 。最高海拔为 1 。

示例 2：

输入：gain = [-4,-3,-2,-1,4,3,2]
输出：0
解释：海拔高度依次为 [0,-4,-7,-9,-10,-6,-3,-1] 。最高海拔为 0 。
 

提示：

n == gain.length
1 <= n <= 100
-100 <= gain[i] <= 100

# v1-暴力法

## 思路

这题似乎简单过头了？

我们甚至不用前缀和，直接一个变量记录，默认 highest=nums[0]，然后往后遍历

```
nums[i] = nums[i-1]+nums[i]  // 真实的高度
```

然后一个最大值的计算就行。

## 实现

```java
  public int largestAltitude(int[] gain) {
        // 默认从0开始？
        int high = 0;
        int max = high;

        for(int i = 0; i < gain.length; i++) {
            high = high + gain[i];
            max = Math.max(max, high);
        }
        return max;
    }
```

## 效果

这个看起来是前缀和的思路，但是很容易想到最直接的解法。

0ms 击败 100.00%

## 反思

题目用例过于简单，没有深入学习的必要。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/

* any list
{:toc}