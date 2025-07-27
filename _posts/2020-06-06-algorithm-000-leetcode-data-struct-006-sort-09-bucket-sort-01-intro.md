---
layout: post
title: leetcode sort 排序-09-bucketSort 桶排序入门介绍
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

# 桶排序（bucket Sort）

## 📌 一、桶排序简介

**桶排序** 是一种基于“分布式”的排序算法。

其核心思想是将数据分到有限数量的“桶”中，分别对桶内的数据进行排序，最后再合并桶中的数据形成有序序列。

> 适合数据在一定范围内均匀分布的情况。

---

## 🧠 二、核心算法思想

1. 根据数据的取值范围划分多个桶（区间）
2. 将每个元素分配到对应的桶中
3. 对每个桶内部的数据进行排序（一般用插入排序、快排等）
4. 按桶的顺序依次取出所有元素，得到有序序列

---

## 🎯 三、流程示例

（以数组 `[0.42, 0.32, 0.23, 0.52, 0.25, 0.47, 0.51]`，值均在 \[0,1)）

1. 创建 5 个桶：

| 桶索引 | 范围          | 内容                     |
| --- | ----------- | ---------------------- |
| 0   | \[0.0, 0.2) |                        |
| 1   | \[0.2, 0.4) | 0.32, 0.23, 0.25       |
| 2   | \[0.4, 0.6) | 0.42, 0.47, 0.52, 0.51 |
| 3   | \[0.6, 0.8) |                        |
| 4   | \[0.8, 1.0) |                        |

2. 对每个桶内部排序（例如用插入排序）
3. 按桶索引顺序依次连接所有桶，得到排序结果

---

## ✅ 四、Java代码示例

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public void bucketSort(double[] arr) {
    int n = arr.length;
    if (n <= 0) return;

    // 1. 创建桶
    List<Double>[] buckets = new List[n];
    for (int i = 0; i < n; i++) {
        buckets[i] = new ArrayList<>();
    }

    // 2. 分配元素到桶（假设数据范围为 [0,1)）
    for (double num : arr) {
        int bucketIndex = (int) (num * n);
        buckets[bucketIndex].add(num);
    }

    // 3. 对每个桶排序
    for (List<Double> bucket : buckets) {
        Collections.sort(bucket);  // 可替换为其他排序
    }

    // 4. 合并所有桶
    int idx = 0;
    for (List<Double> bucket : buckets) {
        for (double num : bucket) {
            arr[idx++] = num;
        }
    }
}
```

---

## 📈 五、复杂度分析

| 维度    | 复杂度                  |
| ----- | -------------------- |
| 时间复杂度 | 最好 O(n + k)，最坏 O(n²) |
| 空间复杂度 | O(n + k)             |
| 是否稳定  | 取决于桶内排序算法，通常可稳定      |

* `n` 为元素数量，`k` 为桶的数量。
* 最坏情况所有元素落在同一个桶，退化为桶内排序的时间复杂度。

---

## ⚖️ 六、优缺点总结

| 优点            | 缺点           |
| ------------- | ------------ |
| 分布均匀时效率高，接近线性 | 数据分布不均时性能下降  |
| 易于并行化处理       | 需要额外空间存储桶    |
| 稳定排序，桶内排序可选择  | 桶数和桶内排序选择需调优 |
| 适合浮点数排序       | 依赖对数据范围的了解   |

---

## 🧰 七、适用场景

| 场景            | 是否推荐 |
| ------------- | ---- |
| ✅ 数据均匀分布且范围已知 | 推荐   |
| ✅ 需要排序浮点数或实数  | 推荐   |
| ❌ 数据极端集中或分布不均 | 不推荐  |
| ❌ 对空间使用有限制    | 不推荐  |

---

## 🧩 八、LeetCode 相关题目

### 🔹 [164. 最大间距](https://leetcode.cn/problems/maximum-gap/)

* 典型桶排序应用，用桶来求最大相邻差。

### 🔹 [347. 前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/)

* 使用“桶”对频率排序。

---

## 🔚 九、一句话总结

> **桶排序通过将数据分散到多个桶中排序，充分利用数据的分布特性，能达到近似线性时间，是实数排序的好方法。**


* any list
{:toc}