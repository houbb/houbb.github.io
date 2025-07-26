---
layout: post
title:  二分查找法？binary-search-02-leetcode 704 二分查找目标值是否存在
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, binary-search, sf]
published: true
---


# 二分查找算法

大家好，我是老马。

今天我们一起来学习一下数组密切相关的二分查找算法力扣实战。

首先最最经典的场景，判断目标值是否存在。

# 704 二分查找

给定一个 n 个元素有序的（升序）整型数组 nums 和一个目标值 target  ，写一个函数搜索 nums 中的 target，如果 target 存在返回下标，否则返回 -1。

你必须编写一个具有 O(log n) 时间复杂度的算法。


示例 1:

输入: nums = [-1,0,3,5,9,12], target = 9
输出: 4
解释: 9 出现在 nums 中并且下标为 4
示例 2:

输入: nums = [-1,0,3,5,9,12], target = 2
输出: -1
解释: 2 不存在 nums 中因此返回 -1
 

提示：

你可以假设 nums 中的所有元素是不重复的。
n 将在 [1, 10000]之间。
nums 的每个元素都将在 [-9999, 9999]之间。

# v1-二分查找循环

## 思路

直接使用二分查找法，这里不再演示最基础的 for 循环方式。

为了真实的学习，也不再演示使用 jdk 内置的二分查询方式。

这里先演示最经典的循环版本。

## 实现

```java
    public int search(int[] nums, int target) {
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
        return -1;
    }
```

## 效果

https://leetcode.cn/problems/binary-search/submissions/646525279/

直接击败 100%，效果拔群。

这题没有什么区分度。

# v2-二分查找递归版本

其实二分法，就是将问题拆分为更小的子问题。

那么，就可以使用递归直接来写。

## 思路

和循环版本类似，我们定义查找的 left、right 指针

1）终止条件

left > right，没找到 -1

left < right, `arr[mid] == target` 返回。

2）递归

对比大小

如果 `arr[mid] > target`，左侧递归 

如果 `arr[mid] < target`，右侧递归 


## 解法

```java
    public int search(int[] nums, int target) {
        return binarySearch(nums, 0, nums.length-1, target);
    }

    public int binarySearch(int[] nums, int left, int right, int target) {
        if(left > right) {
            return -1;
        }

        int mid = left + (right-left) / 2;
        if(nums[mid] == target) {
            return mid;
        }

        // 去右侧
        if(nums[mid] < target) {
            return binarySearch(nums, mid+1, right, target);
        }
        // 左侧
        return binarySearch(nums, left, mid-1, target);
    }
```

## 效果

执行用时分布 100%
消耗内存分布 20.87%

## 复杂度

| 类型                   | 时间复杂度              | 空间复杂度      |
| -------------------- | ------------------ | ---------- |
| 迭代式二分查找              | `O(log n)`         | `O(1)`     |
| 递归式二分查找              | `O(log n)`         | `O(log n)` |
| 二分查找 + 复杂操作（如前缀和、模拟） | `O(log n * 每步复杂度)` | 依具体场景      |

所以空间不是很占优势，还是推荐迭代式的方法。

# 补充-可视化效果

> [可视化效果](https://houbb.github.io/leetcode-visual/T704-binary-search-basic.html)

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
