---
layout: post
title: leetcode sort 排序-04-quickSort 快速排序入门介绍
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

# 快速排序（quick Sort）

## 📌 一、快速排序简介

**快速排序（Quick Sort）** 是一种经典的 **分治算法**，被誉为“实际应用中表现最好的排序算法之一”。

> **核心思想：通过一次划分将数组分成两个部分，左边都比基准小，右边都比基准大，然后递归排序左右两部分。**

---

## 🧠 二、核心算法思想：**分治 + 原地划分**

1. **选定一个“基准值”（pivot）**
2. **将数组按“基准值”进行划分**：小的放左边，大的放右边
3. **递归排序左右子数组**

---

## 🎯 三、图解流程（以 `[3, 6, 1, 5, 2, 4]` 为例）

1. 选择 pivot = `3`（常选第一个/最后一个/随机/中位数）
2. 排列成 `[1, 2, 3, 6, 5, 4]` （小于3的在左边，大于3的在右边）
3. 对 `[1,2]` 和 `[6,5,4]` 分别递归
4. `[6,5,4]` 继续选 pivot = 6 → `[5,4,6]`
5. 最终得到有序数组 `[1,2,3,4,5,6]`

---

## ✅ 四、Java 代码实现（原地快速排序）

```java
public void quickSort(int[] arr) {
    if (arr == null || arr.length < 2) return;
    quickSortRecursive(arr, 0, arr.length - 1);
}

private void quickSortRecursive(int[] arr, int left, int right) {
    if (left >= right) return;

    int pivotIndex = partition(arr, left, right);
    quickSortRecursive(arr, left, pivotIndex - 1);
    quickSortRecursive(arr, pivotIndex + 1, right);
}

private int partition(int[] arr, int left, int right) {
    int pivot = arr[right];  // 以最后一个为基准
    int i = left;

    for (int j = left; j < right; j++) {
        if (arr[j] < pivot) {
            swap(arr, i, j);
            i++;
        }
    }

    swap(arr, i, right);
    return i;
}

private void swap(int[] arr, int i, int j) {
    int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
}
```

---

## 📈 五、复杂度分析

| 情况   | 时间复杂度      | 空间复杂度    | 是否稳定  |
| ---- | ---------- | -------- | ----- |
| 最好情况 | O(n log n) | O(log n) | ❌ 不稳定 |
| 最坏情况 | O(n²)      | O(log n) | ❌ 不稳定 |
| 平均情况 | O(n log n) | O(log n) | ❌ 不稳定 |

> 最坏情况是 pivot 每次都选到了最大或最小值（例如已排好序时），可以通过随机选 pivot 来避免。

---

## ⚖️ 六、优缺点总结

| ✅ 优点              | ❌ 缺点        |
| ----------------- | ----------- |
| 平均性能非常快（比归并、堆排序快） | 最坏 O(n²)    |
| 原地排序，空间开销小        | 不稳定排序       |
| 分治结构，易于优化并行化      | 实现略复杂于插排、冒泡 |

---

## 🧰 七、适用场景分析

| 场景                 | 是否推荐     |
| ------------------ | -------- |
| ✅ 大规模数据排序          | 非常推荐     |
| ✅ 内存敏感场景（空间小）      | 推荐       |
| ❌ 要求稳定排序（值相等时顺序不变） | 不推荐      |
| ❌ 数据基本有序           | 不推荐（会退化） |

---

## 🧩 八、LeetCode 推荐题目

### 🔹 [912. 排序数组](https://leetcode.cn/problems/sort-an-array/)

* 经典实现快排的题目

### 🔹 [215. 数组中的第 K 个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/)

* 可以用快速选择（QuickSelect，基于快排）实现

### 🔹 [973. 最接近原点的 K 个点](https://leetcode.cn/problems/k-closest-points-to-origin/)

* 使用快排变种 + 距离函数

---

## 🆚 九、快速排序 vs 其他排序算法对比

| 算法   | 时间复杂度      | 空间复杂度    | 稳定性 | 适合数据     |
| ---- | ---------- | -------- | --- | -------- |
| 快排   | O(n log n) | O(log n) | ❌   | 大量随机数据   |
| 归并排序 | O(n log n) | O(n)     | ✅   | 稳定需求/链表  |
| 堆排序  | O(n log n) | O(1)     | ❌   | 内存敏感     |
| 插入排序 | O(n²)      | O(1)     | ✅   | 小规模、基本有序 |
| 冒泡排序 | O(n²)      | O(1)     | ✅   | 教学/理解用途  |

---

## 🔚 十、一句话总结

> **快速排序 = 分治 + 原地划分 + 递归排序，平均性能最优，空间占用低，是实际应用中最常用的高性能排序算法之一。**

* any list
{:toc}