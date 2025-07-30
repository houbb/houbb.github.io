---
layout: post
title: leetcode sort 排序-10-radixSort 基数排序入门介绍
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

# 基数排序（Radix Sort）

## 📌 一、基数排序简介

**基数排序**是一种非比较型的排序算法，按数字的每一位（从低位到高位，或从高位到低位）依次排序，利用稳定的排序算法（如计数排序）处理每一位，最终完成整体排序。

> 适用于**整数或字符串排序**，特别是位数较少且均匀的场景。

---

## 🧠 二、核心算法思想

* 将数字拆分成若干位（如十进制的个位、十位、百位等）
* 先按最低有效位（Least Significant Digit, LSD）排序，再按次低位排序，依次类推，直到最高位
* 每次排序都用稳定排序算法（一般是计数排序）
* 多轮排序后，数字整体有序

---

## 🎯 三、执行流程示例（以十进制整数排序 `[170, 45, 75, 90, 802, 24, 2, 66]`）

| 轮次    | 排序依据位 | 排序结果                               |
| ----- | ----- | ---------------------------------- |
| 1（个位） | 个位数字  | \[170, 90, 802, 2, 24, 45, 75, 66] |
| 2（十位） | 十位数字  | \[802, 2, 24, 45, 66, 170, 75, 90] |
| 3（百位） | 百位数字  | \[2, 24, 45, 66, 75, 90, 170, 802] |

---

## ✅ 四、Java代码实现（基于计数排序）

```java
public void radixSort(int[] arr) {
    if (arr == null || arr.length == 0) return;

    int max = arr[0];
    // 找最大值确定最大位数
    for (int num : arr) {
        if (num > max) max = num;
    }

    int exp = 1; // 位权，从个位开始
    int n = arr.length;
    int[] output = new int[n];

    while (max / exp > 0) {
        int[] count = new int[10];  // 0~9数字计数

        // 统计每个数字出现次数（按当前位）
        for (int i = 0; i < n; i++) {
            int digit = (arr[i] / exp) % 10;
            count[digit]++;
        }

        // 变成前缀和，计算位置
        for (int i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }

        // 从后向前遍历保证稳定排序
        for (int i = n - 1; i >= 0; i--) {
            int digit = (arr[i] / exp) % 10;
            output[count[digit] - 1] = arr[i];
            count[digit]--;
        }

        // 复制回原数组
        System.arraycopy(output, 0, arr, 0, n);

        exp *= 10; // 移动到更高一位
    }
}
```

---

## 📈 五、复杂度分析

| 维度    | 复杂度                            |
| ----- | ------------------------------ |
| 时间复杂度 | O(d \* (n + k))，d是位数，k是基数（如10） |
| 空间复杂度 | O(n + k)                       |
| 是否稳定  | ✅ 稳定                           |

* 通常 d 和 k 视为常数，时间复杂度近似 O(n)。

---

## ⚖️ 六、优缺点总结

| 优点              | 缺点            |
| --------------- | ------------- |
| 稳定排序，适合整数和字符串   | 只适用于数字或字符串类数据 |
| 时间复杂度近似线性       | 需要额外空间        |
| 实现相对简单，易与计数排序结合 | 位数大时多次排序，开销增加 |
| 不依赖比较           | 不适合浮点数或无限精度数据 |

---

## 🧰 七、适用场景

| 场景            | 是否推荐 |
| ------------- | ---- |
| ✅ 大量整数排序      | 推荐   |
| ✅ 需要稳定排序      | 推荐   |
| ✅ 字符串排序（长度相近） | 推荐   |
| ❌ 浮点数或复杂对象排序  | 不推荐  |

---

## 🧩 八、LeetCode 相关题目

### 🔹 [164. 最大间距](https://leetcode.cn/problems/maximum-gap/)

* 可用基数排序求解，避免 O(n log n) 排序限制。

### 🔹 [347. 前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/)

* 基数排序思想结合桶排序优化。

---

## 🔚 九、一句话总结

> **基数排序通过逐位排序，将复杂的整体排序拆解为多次简单的稳定排序，适合整数和字符串的高效排序。**

* any list
{:toc} 