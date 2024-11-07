---
layout: post
title:  【leetcode】52-410. split-array-largest-sum  力扣 410. 分割数组的最大值
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, backtrack, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 题目

给定一个非负整数数组 nums 和一个整数 k ，你需要将这个数组分成 k 个非空的连续子数组。

设计一个算法使得这 k 个子数组各自和的最大值最小。

示例 1：

输入：nums = [7,2,5,10,8], k = 2
输出：18
解释：
一共有四种方法将 nums 分割为 2 个子数组。 
其中最好的方式是将其分为 [7,2,5] 和 [10,8] 。
因为此时这两个子数组各自的和的最大值为18，在所有情况中最小。

示例 2：

输入：nums = [1,2,3,4,5], k = 2
输出：9
示例 3：

输入：nums = [1,4,4], k = 3
输出：4
 

提示：

1 <= nums.length <= 1000

0 <= nums[i] <= 10^6

1 <= k <= min(50, nums.length)

# v1-基本前缀和+BF

## 思路

前缀和提前构架好整个前缀和数组，方便计算子数组的和。

但是这里构建好前缀和实际上还要做两件事：

1）如何把数组拆分为 k 个子数组？

2）如何保证 k 个子数组的各自和的最大值最小

本质是一个什么问题？

暴力算法算出所有的结果可能性？

## 子问题1-拆分

将数组拆分为 k 个连续非空子数组，有多少种方式？应该如何计算？

backtracking? 回溯？

## 子问题2-最小值

这个还算好解决，可以存储一下，对比即可。






## 实现

```java
public int longestWPI(int[] hours) {
        final int n = hours.length;
        int[] nums = new int[n];
        for(int i = 0; i < n; i++) {
            if(hours[i] > 8) {
                nums[i] = 1;
            } else {
                nums[i] = -1;
            }
        }


        // 然后计算最长子数组？
        int[] prefix = new int[n];
        prefix[0] = nums[0];
        for(int i = 1; i < n; i++) {
            prefix[i] = prefix[i-1] + nums[i];
        }

        // 计算最长的数组？
        // 找到大于0的最长子数组
        for(int step = nums.length-1; step >= 0; step--) {
            for(int i = 0; i < nums.length - step; i++) {
                int sum = prefix[i+step] - prefix[i] + nums[i];
                if(sum > 0) {
                    return step+1;
                }
            }
        }

        return 0;
    }
```

## 效果

399ms, 6.87%

## 小结

这道题的下方查询方式值得优化。

结果发现好像不是那么回事。

初步考虑可以采用二分法，或者改进后的双指针。



# 参考资料

https://leetcode.cn/problems/longest-well-performing-interval/submissions/578871050/?envType=problem-list-v2&envId=prefix-sum

* any list
{:toc}