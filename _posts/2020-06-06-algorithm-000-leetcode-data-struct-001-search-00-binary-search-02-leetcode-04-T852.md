---
layout: post
title:  二分查找法？binary-search-02-leetcode 852. 山脉数组的峰顶索引
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, binary-search, sf]
published: true
---


# 二分查找算法

大家好，我是老马。

今天我们一起来学习一下数组密切相关的二分查找算法力扣实战。

首先二分查找法的简单变化，查找某个值的“左边界”或“右边界”。

判断一个值是否是数组中第一个大于/小于目标的数

这个题目其实也很好的说明，数组并不需要是单调有序也可以使用二分法。

# 852. 山脉数组的峰顶索引

给定一个长度为 n 的整数 山脉 数组 arr ，其中的值递增到一个 峰值元素 然后递减。

返回峰值元素的下标。

你必须设计并实现时间复杂度为 O(log(n)) 的解决方案。

示例 1：

输入：arr = [0,1,0]
输出：1

示例 2：

输入：arr = [0,2,1,0]
输出：1

示例 3：

输入：arr = [0,10,5,2]
输出：1
 

提示：

3 <= arr.length <= 10^5
0 <= arr[i] <= 10^6

题目数据 保证 arr 是一个山脉数组

# v1-暴力循环

## 思路

最朴素的暴力循环的方式

找到第一个变小的值，那么就返回前一个 index 即可。

## 实现

```java
    public int peakIndexInMountainArray(int[] arr) {
        for(int i = 1; i < arr.length; i++) {
            if(arr[i] < arr[i-1]) {
                return i-1;
            }
        }

        return -1;
    }
```

## 效果

1ms 击败 24.55%

虽然垃圾，但是 AC 了。

说明测试用例不够暴力。

# v2-二分查找LOOP

这里是因为我在刷二分法专题，所以知道这一题是二分法。

但是如果是直接刷到这一题，不见得能想到是二分法。

这一题和 T704 的区别是什么呢？

## 思路

先说下自己的思路：

1) 因为是严格递增，或者递减，所以元素不会相等。

2) 找一下 mid 的位置

`mid = left + (right-left)/2`

那么有下面几个情况

2.1 `arr[mid+1] > arr[mid]` 说明在顶的左边。因为是递增的方向

则需要去右边查找 left = mid+1

2.2 `arr[mid+1] < arr[mid]` 后面一个值小于前面，此时要么是 peek，或者是 peek 的右边。因为开始递减了。

a. `arr[mid-1] < arr[mid]` 两边都小于 mid，说明是顶点，直接返回 mid，命中结果

b. `arr[mid-1] > arr[mid]` 说明在右边递减的区域，则应该去左边

right = mid-1;

3）边界条件

peek 不会在边界值上。

可以直接初始化 

```
left=1
right = arr.length-2;
```

4）终止条件

left > right 终止

## 解法

```java
    public int peakIndexInMountainArray(int[] arr) {
        int left = 1;
        int right = arr.length-2;

        while (left <= right) {
            int mid = left + (right-left)/2;

            // 在顶的左边。因为是递增的方向
            if(arr[mid+1] > arr[mid]) {
                left= mid+1;
            }

            // 后面一个值小于前面，此时要么是 peek，或者是 peek 的右边。因为开始递减了
            if(arr[mid+1] < arr[mid]) {
                // 两边都小于，顶峰
                if(arr[mid-1] < arr[mid]) {
                    return mid;
                } else {
                    //说明在右边递减的区域，则应该去左边
                    right = mid-1;
                }
            }
        }
        return -1;
    }
```

## 效果

执行用时分布 100%

说明已经符合这道题的意图。

# v3-递归版本

## 思路

类似的，我们可以写出对应的二分法版本。

## 解法

```java
    public int peakIndexInMountainArray(int[] arr) {
        int left = 1;
        int right = arr.length-2;

        return peakIndexInMountainArrayRecursive(arr, left, right);
    }

    private int peakIndexInMountainArrayRecursive(int[] arr, int left, int right) {
        // NOT-FOUND
        if(left > right) {
            return -1;
        }

        int mid = left + (right-left)/2;

        // 在顶的左边。因为是递增的方向
        if(arr[mid+1] > arr[mid]) {
            return peakIndexInMountainArrayRecursive(arr, mid+1, right);
        }

        // 后面一个值小于前面，此时要么是 peek，或者是 peek 的右边。因为开始递减了
        if(arr[mid+1] < arr[mid]) {
            // 两边都小于，顶峰
            if(arr[mid-1] < arr[mid]) {
                return mid;
            } else {
                //说明在右边递减的区域，则应该去左边
                return peakIndexInMountainArrayRecursive(arr, left, mid-1);
            }
        }

        // 不会到这里
        return -1;
    }
```

## 效果

超过 100%

# v4-三分查找

本来故事到这里应该也就结束了，不过看到了另外一个解法，这里也记录一下。

## 是什么？

三分查找（**Ternary Search**）是一种专门用于在 **单峰函数**（也叫“山形数组”、“凹函数”或“先增后减”结构）中查找极值（最大或最小值）的位置的算法。

在 LeetCode T852（山脉数组的峰顶索引）中，正好满足三分查找的应用条件：

**二分查找** 每次把区间分成两段，选取中点判断。

**三分查找** 每次把区间分成三段，取两个中点 `m1` 和 `m2`，比较这两点的值，用于**排除掉三段之一**。

## 山形数组的特性

给定一个数组 `arr`：

* 存在唯一一个峰值 `peak`，满足：

  * `arr[0] < arr[1] < ... < arr[peak] > arr[peak+1] > ... > arr[n-1]`
* `arr` 在 `[0, peak]` 上是严格递增的，在 `[peak, n-1]` 是严格递减的。

这意味着：

* 数组是一个**单峰函数**（unimodal function）。
* 我们可以使用三分查找来逼近这个最大值的位置。

## 个人理解

将一个数组，直接分成三个部分。

分割的点，我们假设为 m1, m2

```java
  m1 = l + (r - l) / 3;
  m2 = r - (r - l) / 3;
```

那么只有 3 个场景

1) arr[m1] < arr[m2]

说明 peek 一定在 `[m1, r]`。

2) arr[m1] == arr[m2]

说明 peek 在 `[m1, m2]` 中间

1) arr[m1] > arr[m2]

说明  peek 一定在 `[l, m2]`。

不过感觉也挺复杂的，如果是背模板可能会好一点，但是并没有做到真正的理解。

这个场景的话，三分似乎并没有太大的优势。

每次迭代都将搜索范围缩小到 2/3，最终在 2~3 个元素的范围内暴力找最大值。

## 终止条件

所有的元素最后就圈定2~3个元素中。

直接遍历，找到值最大的那一个，其实就是顶峰。

## ⏱️ 时间复杂度分析

* 每次缩小为 `2/3`，所以复杂度是 **O(log₃(n)) ≈ O(log n)**，与二分相同数量级。
* 多了常数项开销，但不影响大 O。

严格来说，还是没有二分法收敛的快。

因为二分法，是一次少一半。

三分法，是一次少 1/3。

## 解法

```java
    public int peakIndexInMountainArray(int[] arr) {
        int left = 1;
        int right = arr.length-2;

        // 差值不少于2
        while (right - left > 2) {
            // 3 分点
            int m1 = left + (right-left) / 3;
            int m2 = right - (right-left) / 3;

            if(arr[m1] < arr[m2]) {
                left = m1;
            }
            if(arr[m1] == arr[m2]) {
                left = m1;
                right = m2;
            }
            if(arr[m1] > arr[m2]) {
                right = m2;
            }
        }

        // 最后终止后遍历，最大的值就是 peek
        int maxIx = left;
        for(int i = left+1; i <= right; i++) {
            if(arr[i] > arr[maxIx]) {
                maxIx = i;
            }
        }

        return maxIx;
    }
```

## 效果

100%

这一题实在是没有区分度。

# v5-三分法递归解法

## 思路

我们对 v4 稍微改造一下，用递归的方式来解答。

## 解法

```java
    public int peakIndexInMountainArray(int[] arr) {
            return peakIndexInMountainArrayRecursive(arr, 1, arr.length-1);
    }

    public int peakIndexInMountainArrayRecursive(int[] arr, int left, int right) {
        if(right - left > 2) {
            // 3 分点
            int m1 = left + (right-left) / 3;
            int m2 = right - (right-left) / 3;

            if(arr[m1] < arr[m2]) {
                return peakIndexInMountainArrayRecursive(arr, m1, right);
            }
            if(arr[m1] == arr[m2]) {
                return peakIndexInMountainArrayRecursive(arr, m1, m2);
            }
            if(arr[m1] > arr[m2]) {
                return peakIndexInMountainArrayRecursive(arr, left, m2);
            }
        }

        // 最后终止后遍历，最大的值就是 peek
        // 终止点
        int maxIx = left;
        for(int i = left+1; i <= right; i++) {
            if(arr[i] > arr[maxIx]) {
                maxIx = i;
            }
        }

        return maxIx;
    }
```

## 效果

100%


# 补充-可视化效果

> [可视化效果](https://houbb.github.io/leetcode-visual/T852-binary-search-peek.html)

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
