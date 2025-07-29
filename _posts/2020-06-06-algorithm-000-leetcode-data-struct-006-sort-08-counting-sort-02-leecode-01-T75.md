---
layout: post
title: leetcode sort 排序-08-countingSort 计数排序 T75 颜色分类
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, sort, sf]
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

# 75. 颜色分类

给定一个包含红色、白色和蓝色、共 n 个元素的数组 nums ，原地 对它们进行排序，使得相同颜色的元素相邻，并按照红色、白色、蓝色顺序排列。

我们使用整数 0、 1 和 2 分别表示红色、白色和蓝色。

必须在不使用库内置的 sort 函数的情况下解决这个问题。

示例 1：

输入：nums = [2,0,2,1,1,0]
输出：[0,0,1,1,2,2]

示例 2：

输入：nums = [2,0,1]
输出：[0,1,2]
 

提示：

n == nums.length
1 <= n <= 300
nums[i] 为 0、1 或 2


# 原地排序

常见排序算法中，是否**满足原地排序（in-place sort）**，可以从它们是否只使用\*\*常数级额外空间（O(1)）\*\*来判断。

## 🧠 补充说明

### 🟡 快速排序的“原地性”有个细节：

* 如果你写的是“递归+切片数组”版本，可能会额外复制数组 → ❌非原地。
* 正确写法是**原数组分区 + 原地递归**，才是 ✅ 原地排序。

### 🟡 归并排序的“原地变种”：

* 存在一些复杂的“原地归并算法”，比如 in-place merge sort，但实现困难且性能较差，一般不在面试/实际中使用。

---

## ✅ 总结表格

| 排序算法 | 时间复杂度           | 空间复杂度        | 是否原地 | 稳定性   |
| ---- | --------------- | ------------ | ---- | ----- |
| 冒泡排序 | O(n²)           | O(1)         | ✅ 是  | ✅ 稳定  |
| 插入排序 | O(n²)           | O(1)         | ✅ 是  | ✅ 稳定  |
| 选择排序 | O(n²)           | O(1)         | ✅ 是  | ❌ 不稳定 |
| 希尔排序 | O(nlogn)\~O(n²) | O(1)         | ✅ 是  | ❌ 不稳定 |
| 快速排序 | O(nlogn)        | O(logn)（递归栈） | ✅ 是  | ❌ 不稳定 |
| 堆排序  | O(nlogn)        | O(1)         | ✅ 是  | ❌ 不稳定 |
| 归并排序 | O(nlogn)        | O(n)         | ❌ 否  | ✅ 稳定  |
| 计数排序 | O(n + k)        | O(k)         | ❌ 否  | ✅ 稳定  |
| 桶排序  | O(n + k)        | O(n + k)     | ❌ 否  | ✅ 稳定  |
| 基数排序 | O(nk)           | O(n + k)     | ❌ 否  | ✅ 稳定  |


# v1-计数排序

## 思路

因为这个数量特别少，就 3 个值。

所以，我们可以通过计数排序来实现。

## 实现

```java
    public static void sortColors(int[] nums) {
        // 0、 1 和 2 分别表示红色、白色和蓝色。
        int[] tempList = new int[3];
        for(int num : nums) {
            int count = tempList[num];
            tempList[num] = ++count;
        }

        // 输出
        int i = 0;
        int count0 = tempList[0];
        while (count0 > 0) {
            nums[i++] = 0;
            count0--;
        }
        int count1 = tempList[1];
        while (count1 > 0) {
            nums[i++] = 1;
            count1--;
        }
        int count2 = tempList[2];
        while (count2 > 0) {
            nums[i++] = 2;
            count2--;
        }
    }
```

## 效果

0ms 100%

这个也比较简单。

# v2-HashMap

## 思路

同样的，其实都可以用 hashMap 来实现。

## 实现

```java
    public void sortColors(int[] nums) {
        // 0、 1 和 2 分别表示红色、白色和蓝色。
        Map<Integer, Integer> map = new HashMap<>();
        for(int num : nums) {
            int count = map.getOrDefault(num, 0);
            map.put(num, ++count);
        }

        // 输出
        int i = 0;
        int count0 = map.getOrDefault(0, 0);
        while (count0 > 0) {
            nums[i++] = 0;
            count0--;
        }
        int count1 = map.getOrDefault(1, 0);
        while (count1 > 0) {
            nums[i++] = 1;
            count1--;
        }
        int count2 = map.getOrDefault(2, 0);
        while (count2 > 0) {
            nums[i++] = 2;
            count2--;
        }
    }
```

## 效果

1ms 击败7.75%

这个场景用HashMap 效果反而比较差。

# v3-其他基础排序

这一题的用排序也能解决，只是效果会比较差一些。


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


* any list
{:toc}