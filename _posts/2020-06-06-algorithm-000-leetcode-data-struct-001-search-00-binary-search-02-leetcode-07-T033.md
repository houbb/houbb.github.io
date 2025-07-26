---
layout: post
title:  二分查找法？binary-search-02-leetcode 033. 搜索旋转排序数组
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, binary-search, sf]
published: true
---


# 二分查找算法

大家好，我是老马。

今天我们一起来学习一下数组密切相关的二分查找算法力扣实战。

我们来看一下二分法当数组不再严格递增，但仍保有一定规律，可以通过**二分定位区间**

# 33. 搜索旋转排序数组

整数数组 nums 按升序排列，数组中的值 互不相同 。

在传递给函数之前，nums 在预先未知的某个下标 k（0 <= k < nums.length）上进行了 旋转，使数组变为 [nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]（下标 从 0 开始 计数）。

例如， [0,1,2,4,5,6,7] 在下标 3 处经旋转后可能变为 [4,5,6,7,0,1,2] 。

给你 旋转后 的数组 nums 和一个整数 target ，如果 nums 中存在这个目标值 target ，则返回它的下标，否则返回 -1 。

你必须设计一个时间复杂度为 O(log n) 的算法解决此问题。


示例 1：

输入：nums = [4,5,6,7,0,1,2], target = 0
输出：4

示例 2：

输入：nums = [4,5,6,7,0,1,2], target = 3
输出：-1

示例 3：

输入：nums = [1], target = 0
输出：-1
 

提示：

1 <= nums.length <= 5000
-104 <= nums[i] <= 10^4
nums 中的每个值都 独一无二
题目数据保证 nums 在预先未知的某个下标上进行了旋转
-10^4 <= target <= 10^4

# v1-暴力循环

## 思路

最朴素的暴力循环的方式

我们首先想办法，确定船的上下限。

直接从开始到结束来一遍

## 解法

```java
public int search(int[] nums, int target) {
    for(int i = 0; i < nums.length; i++) {
        if(target == nums[i]) {
            return i;
        }
    }
    return -1;
}
```


## 效果

0ms 击败 100.00%

这一题的测试用例有问题，没有区分度。

# v2-二分法迭代

## 思路

我们可以先找到这个被随机反转的点

有一个特点，就是数字会忽然变小，后面的小于前面的，找到这个 index ，然后将数组分为2个部分即可。

因为分成两半之后，两个部分依然是顺序的。

## 解法

```java
    public int search(int[] nums, int target) {
        int randomIndex = getRandomIndex(nums);
        // 无变化，或者整体变化
        if(randomIndex == -1) {
            return binarySearch(nums, target, 0, nums.length-1);
        }

        // 左边
        int leftIx = binarySearch(nums, target, 0, randomIndex);
        if(leftIx >= 0) {
            return leftIx;
        }

        // 右边
        int rightIx = binarySearch(nums, target, randomIndex+1, nums.length-1);
        if(rightIx >= 0) {
            return rightIx;
        }

        return -1;
    }

    private int binarySearch(int[] nums, int target, int left, int right) {
        while (left <= right) {
            int mid = left + (right - left);

            int midVal = nums[mid];
            if(midVal == target) {
                return mid;
            }

            // 大于，去左边
            if(midVal > target) {
                right = mid-1;
            } else {
                left = mid+1;
            }

        }

        return -1;
    }

    private int getRandomIndex(int[] nums) {
        for(int i = 0; i < nums.length-1; i++) {
            if(nums[i] > nums[i+1]) {
                return i;
            }
        }
        // 没有变化
        return -1;
    }
```

## 效果

0ms 击败 100.00%

## 一点补充

看到这个，忽然想到了 852. 山脉数组的峰顶索引

当然，这个转换可能不存在顶点的场景。

# 补充-可视化效果

> [可视化效果](https://houbb.github.io/leetcode-visual/T875-binary-search-eat-banana.html)

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
