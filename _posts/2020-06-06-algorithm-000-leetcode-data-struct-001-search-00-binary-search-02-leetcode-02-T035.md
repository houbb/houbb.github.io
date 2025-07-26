---
layout: post
title:  二分查找法？binary-search-02-leetcode 35. 搜索插入位置
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, binary-search, sf]
published: true
---


# 二分查找算法

大家好，我是老马。

今天我们一起来学习一下数组密切相关的二分查找算法力扣实战。

首先最经典的场景，判断搜索插入位置。

# 35. 搜索插入位置

给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。

如果目标值不存在于数组中，返回它将会被按顺序插入的位置。

请必须使用时间复杂度为 O(log n) 的算法。

示例 1:

输入: nums = [1,3,5,6], target = 5
输出: 2

示例 2:

输入: nums = [1,3,5,6], target = 2
输出: 1

示例 3:

输入: nums = [1,3,5,6], target = 7
输出: 4
 

提示:

1 <= nums.length <= 10^4
-10^4 <= nums[i] <= 10^4
nums 为 无重复元素 的 升序 排列数组
-10^4 <= target <= 10^4

# v1-二分查找循环

## 思路

这一题当然是一眼二分查找法。

但是和 T704 的区别在哪里呢？

如果 target 存在的时候，实际上是一样的。

如果不存在的时候呢？T704 返回 -1表示没找到。

这里，其实直接返回 left 就行了，因为这个就是插入的位置。

## 实现

```java
public int searchInsert(int[] nums, int target) {
        // 二分查找
        int left = 0;
        int right = nums.length-1;

        while (left <= right) {
            // 中点
            int mid = left + (right - left) / 2;
            int midVal = nums[mid];
            if(target == midVal) {
                return mid;
            }

            // 小于，那么目标值应该在右边
            if(midVal < target) {
                left = mid+1;
            }
            // 大于，则目标值应该在左边
            if(midVal > target) {
                right = mid-1;
            }
        }

        // not found
        return left;
}
```

## 效果

直接击败 100%，效果拔群。

这题没有什么区分度。

# v2-二分查找递归版本

其实二分法，就是将问题拆分为更小的子问题。

那么，就可以使用递归直接来写。

和 T704 类似。

## 思路

和循环版本类似，我们定义查找的 left、right 指针

1）终止条件

left > right，没找到 left

left < right, `arr[mid] == target` 返回。

2）递归

对比大小

如果 `arr[mid] > target`，左侧递归 

如果 `arr[mid] < target`，右侧递归 


## 解法

```java
    public int searchInsertRecursive(int[] nums, int left, int right, int target) {
        // 终止，返回 left
        if(left > right) {
            return left;
        }

        int mid = left + (right-left) / 2;

        // 匹配
        if(nums[mid] == target) {
            return mid;
        }
        // 小，去右侧找
        if(nums[mid] < target) {
            return searchInsertRecursive(nums, mid+1, right, target);
        }
        // 大，去左侧找
        return searchInsertRecursive(nums, left, mid-1, target);
    }
```

## 效果

执行用时分布 100%
消耗内存分布 60.77%

## 复杂度

| 类型                   | 时间复杂度              | 空间复杂度      |
| -------------------- | ------------------ | ---------- |
| 迭代式二分查找              | `O(log n)`         | `O(1)`     |
| 递归式二分查找              | `O(log n)`         | `O(log n)` |
| 二分查找 + 复杂操作（如前缀和、模拟） | `O(log n * 每步复杂度)` | 依具体场景      |

所以空间不是很占优势，还是推荐迭代式的方法。

# 补充-可视化效果

> [可视化效果](https://houbb.github.io/leetcode-visual/T035-binary-search-basic.html)

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
