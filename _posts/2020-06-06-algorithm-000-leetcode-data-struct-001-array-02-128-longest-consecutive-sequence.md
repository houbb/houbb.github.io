---
layout: post
title: leetcode 数组专题 01-力扣.128 最长连续序列 leetcode longest-consecutive-sequence 
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, array, sf]
published: true
---

# 数组系列

[力扣数据结构之数组-00-概览](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-00-overview)

[力扣.53 最大子数组和 maximum-subarray](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-01-51-maximum-subarray)

[力扣.128 最长连续序列 longest-consecutive-sequence](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-02-128-longest-consecutive-sequence)

[力扣.1 两数之和 N 种解法 two-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum)

[力扣.167 两数之和 II two-sum-ii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-ii)

[力扣.170 两数之和 III two-sum-iii](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-iii)

[力扣.653 两数之和 IV two-sum-IV](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-03-001-two-sum-iv)

[力扣.015 三数之和 three-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-015-three-sum)

[力扣.016 最接近的三数之和 three-sum-closest](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-016-three-sum-closest)

[力扣.259 较小的三数之和 three-sum-smaller](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-04-259-three-sum-smaller)

[力扣.018 四数之和 four-sum](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-05-018-four-num)

[力扣.454 四数相加之和 II](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-05-454-four-num-ii)

点击 {阅读原文} 获得更好的阅读体验。

# 题目

给定一个未排序的整数数组 nums ，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。

请你设计并实现时间复杂度为 O(n) 的算法解决此问题。

示例 1：

输入：nums = [100,4,200,1,3,2]
输出：4
解释：最长数字连续序列是 [1, 2, 3, 4]。它的长度为 4。
示例 2：

输入：nums = [0,3,7,2,5,8,4,6,0,1]
输出：9
 

提示：

0 <= nums.length <= 10^5

-10^9 <= nums[i] <= 10^9

# v1-基本解法

## 思路

在经历过 T53 的洗礼之后，看到这一题感觉很亲切。

因为连续相对而言比较好考虑一些，不过还是有一点点坑：

整体思路如下：

1）数组排序

2）判断当前 nums[i] - nums[i-1]。用 maxLen 计算全局最优，tempLen 保存局部最优 

a. 等于 0，则两个数字相等。依然连续，但是 tempLen 长度不变

b. 等于 1，数字严格连续，tempLen++

c. 其他 连续性中断  tempLen=1

当然等于0的场景要看错误的测试用例才能知道，题目描述的并不够清晰。

比如把这一题改成严格连续，那考虑条件就要调整一下。

## 实现

```java
public int longestConsecutive(int[] nums) {
        if(nums.length == 0) {
            return 0;
        }
        
        // 排序
        Arrays.sort(nums);

        int maxLen = 1;
        int tempLen = 1;
        // 对于连续的定义是什么？
        for(int i = 1; i < nums.length; i++) {
            int num = nums[i];
            int pre = nums[i-1];
            if(num - pre == 1) {
                tempLen++;
            } else {
                // 断开
                tempLen = 1;
            }

            maxLen = Math.max(maxLen, tempLen);
        }
        return maxLen;
    }
```

## 效果

```
13ms 93.27%
```

## 小结

这种 one-pass 的需要理解清楚题目的意思，解决一些边界和特殊的场景问题。

想到了就不难。

* any list
{:toc}