---
layout: post
title: leetcode sort 排序-02-selectSort 选择排序入门介绍
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

# 选择排序

## 🏷️ 一、选择排序是什么？

选择排序是一种**简单直观的排序算法**，每一轮从剩余元素中**选出最小值**，放到当前“已排序区”末尾。

---

## 🔧 二、算法核心思想

* 将数组分成两部分：

  * **已排序区间**（初始为空）
  * **未排序区间**（初始是整个数组）
* 每轮从未排序区选出**最小元素**，和未排序区的第一个元素交换

> 📌 类似“每次选出班上最矮的排到队前面”

---

## 🧠 三、伪代码逻辑

```text
for i from 0 to n - 1:
    minIndex = i
    for j from i+1 to n - 1:
        if arr[j] < arr[minIndex]:
            minIndex = j
    swap arr[i] and arr[minIndex]
```

---

## ✅ 四、Java 代码实现

```java
void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex != i) {
            int temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;
        }
    }
}
```

---

## 🎨 五、可视化示例（以 `[3, 1, 4, 2]` 为例）

| 轮次  | 过程              | 结果               |
| --- | --------------- | ---------------- |
| 第1轮 | 找最小值 1，交换 3 和 1 | `[1, 3, 4, 2]`   |
| 第2轮 | 找最小值 2，交换 3 和 2 | `[1, 2, 4, 3]`   |
| 第3轮 | 找最小值 3，交换 4 和 3 | `[1, 2, 3, 4]` ✅ |

---

## 📈 六、复杂度分析

| 维度    | 分析结果                |
| ----- | ------------------- |
| 最好情况  | O(n²)（不能提前终止）       |
| 最坏情况  | O(n²)               |
| 平均情况  | O(n²)               |
| 空间复杂度 | O(1) 原地排序           |
| 稳定性   | ❌ 不稳定（相同元素可能会被交换顺序） |

> ❗ 不管是否已经有序，**每轮都必须找最小值并交换**，所以不能优化为 O(n)

---

## 📦 七、选择排序的特点总结

| 特性      | 是否符合                  |
| ------- | --------------------- |
| 原地排序    | ✅                     |
| 稳定排序    | ❌（可以通过特殊处理让它稳定，但默认不是） |
| 实现简单    | ✅                     |
| 适合小规模数据 | ✅                     |

---

## ⚖️ 八、优缺点对比

| 优点                | 缺点             |
| ----------------- | -------------- |
| 实现简单、逻辑清晰         | 效率低，O(n²) 级别   |
| 不依赖数据初始状态（有序也不影响） | 不稳定，可能打乱相等元素顺序 |
| 交换次数少（最多 n 次）     | 比冒泡/插入更慢，几乎无优势 |

---

## 📌 九、适用场景

| 场景     | 是否推荐                 |
| ------ | -------------------- |
| 初学者学习  | ✅ 非常适合               |
| 数据量小   | ✅ 勉强可用               |
| 稳定排序要求 | ❌ 不推荐                |
| 有序性较高  | ❌ 不推荐（无优化空间）         |
| 实际工程   | ❌ 基本不推荐，通常用库函数或快排类算法 |

---

## 💡 十、LeetCode 上可用选择排序解的题目

虽然选择排序不是最优方法，但在一些题目中可以用于练习排序和思维：

### 🔹 [912. 排序数组](https://leetcode.cn/problems/sort-an-array/)

* 可以练习写选择排序实现 ✅

### 🔹 [215. 数组中的第K个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/)

* 虽然可以用堆更快，但选择排序变形版也可以找第K大元素（找前K大值）✅

### 🔹 [面试题 10.01. 合并排序的数组](https://leetcode.cn/problems/sorted-merge-lcci/)

* 如果题目要求“手写排序”，选择排序也可以作为备选方案练习。

---

## 🔚 十一、一句话总结

> 选择排序通过**每次挑选最小值并交换**，不断将最小值推向数组前端，**思路简单但效率低、稳定性差**，适合教学但不推荐实战使用。


* any list
{:toc}