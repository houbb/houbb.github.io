---
layout: post
title:  二分查找法？binary-search-02-leetcode 34 在排序数组中查找元素的第一个和最后一个位置 find-first-and-last-position-of-element-in-sorted-array
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, binary-search, sf]
published: true
---


# 二分查找算法

大家好，我是老马。

今天我们一起来学习一下数组密切相关的二分查找算法力扣实战。

首先最经典的场景，判断搜索插入位置。

# 34 在排序数组中查找元素的第一个和最后一个位置

给你一个按照非递减顺序排列的整数数组 nums，和一个目标值 target。请你找出给定目标值在数组中的开始位置和结束位置。

如果数组中不存在目标值 target，返回 [-1, -1]。

你必须设计并实现时间复杂度为 O(log n) 的算法解决此问题。

示例 1：

输入：nums = [5,7,7,8,8,10], target = 8
输出：[3,4]
示例 2：

输入：nums = [5,7,7,8,8,10], target = 6
输出：[-1,-1]
示例 3：

输入：nums = [], target = 0
输出：[-1,-1]
 

提示：

0 <= nums.length <= 10^5
-10^9 <= nums[i] <= 10^9
nums 是一个非递减数组
-10^9 <= target <= 10^9

# v1-二分查找

## 思路

分成两个二分法，一个找到第一个，一个找到最后一个。

严格点数，可能重复的场景，`left <= right` 不然一个数的时候，会漏。

## 实现

```java
    public int[] searchRange(int[] nums, int target) {
        // 左右遍历，找到结果
        int midIndex = binarySearch(nums, target);

        // 左边
        int left = midIndex;
        if(left != -1) {
            while (left > 0 && nums[left] == nums[left-1]){
                left--;
            }
        }

        // 右边
        int right = midIndex;
        if(right != -1) {
            while (right < nums.length - 1 && nums[right] == nums[right+1]){
                right++;
            }
        }

        return new int[]{left, right};
    }

    private int binarySearch(int[] nums, int target) {
        int left = 0;
        int right = nums.length-1;
        while (left <= right) {
            int mid = left + (right-left) / 2;
            if(nums[mid] == target) {
                return mid;
            } else if(nums[mid] > target) {
                // 太大 去左边
                right = mid-1;
            } else {
                left = mid+1;
            }
        }

        return -1;
    }
```

## 效果

0ms 100%

# 项目开源

> [技术博客](https://houbb.github.io/)

> [leetcode-visual 资源可视化](https://github.com/houbb/leetcode-visual)

> [leetcode 算法实现](https://github.com/houbb/leetcode)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解二分的实战题目，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

https://leetcode.cn/problems/binary-search/description/

* any list
{:toc}
