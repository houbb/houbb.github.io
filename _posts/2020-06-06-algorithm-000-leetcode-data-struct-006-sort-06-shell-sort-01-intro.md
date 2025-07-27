---
layout: post
title: leetcode sort 排序-06-shellSort 希尔排序入门介绍
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

# 希尔排序（shell Sort）

## 📌 一、希尔排序简介

**希尔排序（Shell Sort）** 是对插入排序的优化，是第一个突破 O(n²) 时间复杂度的排序算法，由 **Donald Shell** 于 1959 年提出。

> **核心思想：将数组按一定“间隔 gap”进行分组排序，让数据逐步趋于有序，最终用插排完成最后的排序。**

---

## 🧠 二、核心算法思想

希尔排序是 **分组+插入排序** 的组合：

1. 将原始数组按一定“间隔 gap”分组
2. 对每组执行插入排序
3. 减小 gap（例如：gap = gap / 2），重复上述过程
4. 最终 gap = 1 时，就是普通插排，此时数据已经基本有序，效率较高

这种方式称为 **“缩小增量排序”**。

---

## 🎯 三、流程图解（以 `[8, 9, 1, 7, 2, 3, 5, 4, 6, 0]` 为例）

假设初始 gap = 5，数组长度为 10：

* 分组如下：

  * 第 0 组：arr\[0], arr\[5] → `[8, 3]` → 插入排序后 `[3, 8]`
  * 第 1 组：arr\[1], arr\[6] → `[9, 5]` → `[5, 9]`
  * ...
* gap = 2，再分组再插排
* gap = 1，最后插排

每轮都让元素**移动得更快更远**，避免了插排只能相邻交换的问题。

---

## ✅ 四、Java 代码实现（常用 gap 为 gap/2）

```java
public void shellSort(int[] arr) {
    int n = arr.length;
    for (int gap = n / 2; gap > 0; gap /= 2) {
        // 对每个组进行插排
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j = i;
            while (j - gap >= 0 && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}
```

> 可尝试不同的 gap 序列，如 Hibbard、Knuth、Sedgewick，提高性能。

---

## 📈 五、复杂度分析

| 情况   | 时间复杂度（取决于 gap）    | 空间复杂度 | 是否稳定  |
| ---- | ----------------- | ----- | ----- |
| 最好情况 | O(n log n)        | O(1)  | ❌ 不稳定 |
| 最坏情况 | O(n²)（经典gap）      | O(1)  | ❌ 不稳定 |
| 平均情况 | O(n^1.3 \~ n^1.5) | O(1)  | ❌ 不稳定 |

> gap 选择对性能影响很大，合理设计 gap 可接近 O(n log n) 的效率。

---

## ⚖️ 六、优缺点总结

| ✅ 优点              | ❌ 缺点                |
| ----------------- | ------------------- |
| 简单易实现，基于插排但效率更高   | 不稳定排序               |
| 支持原地排序，空间复杂度 O(1) | 对 gap 依赖大，难以精确分析复杂度 |
| 在中小数据量表现不错        | 不如快排在大规模数据中表现优异     |

---

## 🧰 七、适用场景分析

| 场景             | 是否推荐 |
| -------------- | ---- |
| ✅ 中小规模数据       | 推荐   |
| ✅ 对内存要求较高（空间小） | 推荐   |
| ❌ 要求排序稳定       | 不推荐  |
| ❌ 数据本身已高度有序    | 不推荐  |

---

## 🧩 八、LeetCode 相关题目

虽然希尔排序在 LeetCode 中不直接出现，但可以作为自选排序算法用于解决以下通用排序类题：

### 🔹 [912. 排序数组](https://leetcode.cn/problems/sort-an-array/)

* 可以尝试用希尔排序来解这题，和快排做性能比较。

### 🔹 [147. 对链表进行插入排序](https://leetcode.cn/problems/insertion-sort-list/)

* 虽然本题是链表插排，但可作为希尔排序思想的比较。

---

## 🆚 九、与插入排序对比

| 项目      | 插入排序  | 希尔排序     |
| ------- | ----- | -------- |
| 时间复杂度   | O(n²) | O(n^1.5) |
| 分组排序    | 否     | 是        |
| 交换元素距离  | 仅相邻   | 可远距离     |
| 效率提升显著性 | 差     | 中等偏上     |

---

## 🔚 十、一句话总结

> **希尔排序 = 插排 + 分组，借助“gap”快速缩小逆序对，是插入排序的进阶优化版本，适用于中小规模排序场景。**


* any list
{:toc}