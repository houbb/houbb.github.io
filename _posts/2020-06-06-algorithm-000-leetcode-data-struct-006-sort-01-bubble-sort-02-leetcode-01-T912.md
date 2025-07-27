---
layout: post
title: leetcode sort 排序-02-冒泡排序力扣 912. 排序数组
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, sort, leetcode, sf]
published: true
---

# 排序系列

[sort-00-排序算法汇总](https://houbb.github.io/2016/07/14/sort-00-overview-sort)

[sort-01-bubble sort 冒泡排序算法详解](https://houbb.github.io/2016/07/14/sort-01-bubble-sort)

[sort-02-QuickSort 快速排序到底快在哪里？](https://houbb.github.io/2016/07/14/sort-02-quick-sort)

[sort-03-SelectSort 选择排序算法详解](https://houbb.github.io/2016/07/14/sort-03-select-sort)

[sort-04-heap sort 堆排序算法详解](https://houbb.github.io/2016/07/14/sort-04-heap-sort)

[sort-05-insert sort 插入排序算法详解](https://houbb.github.io/2016/07/14/sort-05-insert-sort)

[sort-06-shell sort 希尔排序算法详解](https://houbb.github.io/2016/07/14/sort-06-shell-sort)

[sort-07-merge sort 归并排序](https://houbb.github.io/2016/07/14/sort-07-merge-sort)

[sort-08-counting sort 计数排序](https://houbb.github.io/2016/07/14/sort-08-counting-sort)

[sort-09-bucket sort 桶排序](https://houbb.github.io/2016/07/14/sort-09-bucket-sort)

[sort-10-bigfile 大文件外部排序](https://houbb.github.io/2016/07/14/sort-10-bigfile-sort)

# 前言

大家好，我是老马。

以前从工程的角度，已经梳理过一次排序算法。

这里从力扣算法的角度，重新梳理一遍。

核心内容包含：

1）常见排序算法介绍

2）背后的核心思想

3）leetcode 经典题目练习+讲解

4）应用场景、优缺点等对比总结

5）工程 sdk 包，这个已经完成。

6) 可视化

本次主要讲解的是冒泡排序的实战练习。

# 排序数组

给你一个整数数组 nums，请你将该数组升序排列。

你必须在 不使用任何内置函数 的情况下解决问题，时间复杂度为 O(nlog(n))，并且空间复杂度尽可能小。

示例 1：

输入：nums = [5,2,3,1]
输出：[1,2,3,5]
解释：数组排序后，某些数字的位置没有改变（例如，2 和 3），而其他数字的位置发生了改变（例如，1 和 5）。
示例 2：

输入：nums = [5,1,1,2,0,0]
输出：[0,0,1,1,2,5]
解释：请注意，nums 的值不一定唯一。
 

提示：

1 <= nums.length <= 5 * 10^4
-5 * 10^4 <= nums[i] <= 5 * 10^4

# 排序算法回顾

我们首先回顾下适用性比较强的排序算法，下面主要作为练习，我们把前面 3 种也写一下。

🧱 一、基础排序算法（适合入门）

| 算法                      | 时间复杂度 (平均/最坏) | 空间复杂度 | 稳定性   | 优点           | 缺点               |
| ----------------------- | ------------- | ----- | ----- | ------------ | ---------------- |
| **冒泡排序** Bubble Sort    | O(n²) / O(n²) | O(1)  | ✅ 稳定  | 实现简单，适合教学    | 效率极低，适合数据很小或几乎有序 |
| **选择排序** Selection Sort | O(n²) / O(n²) | O(1)  | ❌ 不稳定 | 交换次数少，结构清晰   | 比冒泡还慢，不能利用已有序性   |
| **插入排序** Insertion Sort | O(n²) / O(n²) | O(1)  | ✅ 稳定  | 适合小规模、部分有序数据 | 大数据量时效率低         |

⚙️ 二、进阶排序算法（效率更高）

| 算法                  | 时间复杂度 (平均/最坏)           | 空间复杂度         | 稳定性   | 优点              | 缺点                |
| ------------------- | ----------------------- | ------------- | ----- | --------------- | ----------------- |
| **归并排序** Merge Sort | O(n log n) / O(n log n) | O(n)          | ✅ 稳定  | 稳定，时间稳定，适合链表等结构 | 空间消耗大，递归实现复杂      |
| **快速排序** Quick Sort | O(n log n) / O(n²)      | O(log n)（递归栈） | ❌ 不稳定 | 平均快，原地排序，实用性强   | 最坏情况退化为 O(n²)，不稳定 |
| **希尔排序** Shell Sort | 约 O(n¹.³) / O(n²)       | O(1)          | ❌ 不稳定 | 改进插入排序，速度提升大    | 增量序列选择影响性能，难分析    |
| **堆排序** Heap Sort   | O(n log n) / O(n log n) | O(1)          | ❌ 不稳定 | 不使用递归，不需要额外内存   | 实现略复杂，不稳定  

# v1-冒泡排序

## 思路

我们从最简单的冒泡排序开始实现。

## 算法

```java
public int[] sortArray(int[] nums) {
    // 外层控制循环 为什么是 N-1?
    for(int i = 0; i < nums.length; i++) {

        // 内层控制大的向后交换 前面处理过的，则不需要再次处理
        for(int j = 0; j < nums.length-1-i; j++) {
            // 如果比后面的大，则交换
            if(nums[j] > nums[j+1]) {
                int temp = nums[j];
                nums[j] = nums[j+1];
                nums[j+1] = temp;
            }
        }
    }
    return nums;
}
```

## 效果

超出时间限制 10 / 21 个通过的测试用例

意料之中

## 算法改进

当然，冒泡还可以做一些基础的改进。

比如添加冒泡的标识，因为我们在最外层控制的是循环，在 j 层其实才是交换的逻辑。

如果在真实实现交换的时候，发现没有任何交换，其实 nums 已经排序完成，可以直接提前结束。

```java
    public int[] sortArray(int[] nums) {
        // 外层控制循环 为什么是 N-1?
        for(int i = 0; i < nums.length; i++) {

            boolean swapFlag = false;
            // 内层控制大的向后交换 前面处理过的，则不需要再次处理
            // 每一轮排序之后，其实已经将最大的数放在了对应正确位置，故可以 -i。没必要重复比较
            for(int j = 0; j < nums.length-1-i; j++) {
                // 如果比后面的大，则交换
                if(nums[j] > nums[j+1]) {
                    int temp = nums[j];
                    nums[j] = nums[j+1];
                    nums[j+1] = temp;

                    swapFlag = true;
                }
            }

            // 无交换，直接结束
            if(!swapFlag) {
                break;
            }
        }

        return nums;
    }
```

## 可视化

> [可视化-冒泡](https://houbb.github.io/leetcode-visual/T192-sort-bubble-sort.html)


# v2-选择排序

## 思路

每次从剩余的数组中选择最小的一个，放在结果数组中。

这里直接用 swap 节省掉数组开销。

## 解法

```java
    public int[] sortArray(int[] nums) {
        // 外层控制循环
        for(int i = 0; i < nums.length; i++) {

            int minIx = i;
            // 找到 i 后边的最小值
            for(int j = i+1; j < nums.length; j++) {
                if(nums[j] < nums[minIx]) {
                    minIx = j;
                }
            }

            // 交换
            swap(nums, i, minIx);
        }

        return nums;
    }

    private void swap(int[] nums, int i, int j) {
        int temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }
```

## 效果

执行超时 12 / 21 个通过的测试用例

## 可视化

> [可视化-选择](https://houbb.github.io/leetcode-visual/T192-sort-select-sort.html)

# v3-插入排序

## 思路

就像我们打扑克一样

1）一张牌，天然有序

2）来了一张牌，看看应该放在哪里，然后插入进去。

## 实现

边界值考虑：

1）0 位置一个数，天然有顺序，从 1 开始往前比即可

2）考虑当前值可能最小，所以要一直对比到左边的 0 位置 && 比当前数小的位置

3）对比的时候，同时移动，是一种取巧的方式。减少迭代

4）在 j+1 的位置插入新的数

```java
    public int[] sortArray(int[] nums) {
        // 0 位置本身有序

        for(int i = 1; i < nums.length; i++) {
            int curNum = nums[i];

            // 在左边找到合适的位置
            int j = i-1;

            // 需要等于，因为可能是最小值
            while (j >= 0 && nums[j] > curNum) {
                nums[j+1] = nums[j];    // 向后移动一位

                j--;
            }

            // 插入新的数  j 是最小值下标，最小的时候 j=-1
            nums[j+1] = curNum;
        }

        return nums;
    }
```

## 耗时

超出时间限制 15 / 21 个通过的测试用例

## 可视化

> [可视化](https://houbb.github.io/leetcode-visual/T192-sort-insert-sort.html)

# v4-插入排序优化

## 优化思路

原本查找插入位置的时间复杂度是 O(n)，本身是在一个有序的数组中寻找插入位置，那么我们用二分查找改造一下，复杂度降低为 O(logn)。

数组的移动，学习一下 jdk 的用数组拷贝来实现，实际上这里用到了空间换时间，比  O(n) 的移动要快不少。

## 实现

```java
    public int[] sortArray(int[] nums) {
        for (int i = 1; i < nums.length; i++) {
            int curNum = nums[i];

            // 在 [0, i-1] 区间内查找 curNum 的插入位置
            int insertPos = binarySearch(nums, 0, i - 1, curNum);

            // 将 insertPos ~ i-1 区间整体向右移动一位
            System.arraycopy(nums, insertPos, nums, insertPos + 1, i - insertPos);

            // 插入当前数
            nums[insertPos] = curNum;
        }
        return nums;
    }

    /**
     * 在 nums[left...right] 中找到第一个 >= target 的位置
     * 如果所有值都小于 target，则返回 right + 1（即插入到最后）
     */
    private int binarySearch(int[] nums, int left, int right, int target) {
        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] < target) {
                left = mid + 1;
            } else {
                // 找到一个 >= 的，继续向左逼近
                right = mid - 1;
            }
        }
        return left;
    }
```

## 效果

没想到直接 AC 了。

589ms 击败 36.65%

54.68MB 击败 74.27%

## 可视化

> [可视化](https://houbb.github.io/leetcode-visual/T192-sort-insert-sort-binary-search.html)

* any list
{:toc}