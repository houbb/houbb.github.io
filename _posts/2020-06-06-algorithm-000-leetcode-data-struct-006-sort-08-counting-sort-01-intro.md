---
layout: post
title: leetcode sort 排序-08-countingSort 计数排序入门介绍
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

# 计数排序（counting Sort）

## 📌 一、计数排序简介

计数排序是一种**非比较型的整数排序算法**，利用待排序数据的值作为数组下标，通过统计每个值出现的次数，实现排序。

> 适合**整数范围不大**且**数据量较大的情况**，不是基于比较的排序，因此效率很高。

---

## 🧠 二、核心算法思想

1. 找出待排序数组中的最大值 `max` 和最小值 `min`（一般考虑非负整数时，min=0）
2. 创建一个长度为 `(max - min + 1)` 的计数数组 `count`，所有元素初始化为 0
3. 遍历原数组，对每个元素 `x`，在 `count[x - min]` 位置计数加一
4. 根据 `count` 数组，依次输出排序后的元素（累加计数也可实现稳定排序）

---

## 🎯 三、计数排序步骤

假设数组为 `[2, 5, 3, 0, 2, 3, 0, 3]`

* 最大值 max = 5，最小值 min = 0

* 创建长度为 6 的计数数组 `count = [0,0,0,0,0,0]`

* 统计出现次数：

  | 数值 | 0 | 1 | 2 | 3 | 4 | 5 |
  | -- | - | - | - | - | - | - |
  | 频率 | 2 | 0 | 2 | 3 | 0 | 1 |

* 输出排序结果：

  `[0,0,2,2,3,3,3,5]`

---

## ✅ 四、Java代码实现（稳定版本）

```java
public void countingSort(int[] arr) {
    if (arr == null || arr.length == 0) return;

    // 找最大最小值
    int max = arr[0];
    int min = arr[0];
    for (int num : arr) {
        if (num > max) max = num;
        if (num < min) min = num;
    }

    int range = max - min + 1;
    int[] count = new int[range];

    // 统计频率
    for (int num : arr) {
        count[num - min]++;
    }

    // 累加计数，实现稳定排序
    for (int i = 1; i < count.length; i++) {
        count[i] += count[i - 1];
    }

    int[] output = new int[arr.length];
    // 从后往前遍历，保持稳定性
    for (int i = arr.length - 1; i >= 0; i--) {
        output[count[arr[i] - min] - 1] = arr[i];
        count[arr[i] - min]--;
    }

    // 复制回原数组
    System.arraycopy(output, 0, arr, 0, arr.length);
}
```

---

## 📈 五、复杂度分析

| 维度    | 复杂度                   |
| ----- | --------------------- |
| 时间复杂度 | O(n + k)，n为元素数，k为数值范围 |
| 空间复杂度 | O(n + k)              |
| 是否稳定  | ✅ 稳定（如果按上面实现）         |

---

## ⚖️ 六、优缺点总结

| 优点                 | 缺点                   |
| ------------------ | -------------------- |
| 时间复杂度接近线性 O(n + k) | 受限于数据范围 k，范围大时耗内存大   |
| 实现简单，速度快           | 不适合非整数或范围很大的数据       |
| 稳定排序               | 不是比较排序，不能直接用于浮点或复杂类型 |

---

## 🧰 七、适用场景

| 场景             | 是否推荐 |
| -------------- | ---- |
| ✅ 整数范围有限且较小的数据 | 推荐   |
| ✅ 大量数据需要快速排序   | 推荐   |
| ❌ 数据范围极大或稀疏    | 不推荐  |
| ❌ 需要排序浮点数或复杂对象 | 不推荐  |



# 经典题目

在 LeetCode（力扣）上，**计数排序（Counting Sort）**本身很少直接作为题目标签出现，但有不少**适合用计数排序优化**的题目，尤其是涉及「范围较小的整数频率统计」类问题。以下是一些经典代表题目，适合用或改造为计数排序思路解决：

---

### ✅ 经典适用题目推荐

| 题号                                                                                         | 标题                | 说明                                            |
| ------------------------------------------------------------------------------------------ | ----------------- | --------------------------------------------- |
| [75](https://leetcode.cn/problems/sort-colors/)                                            | 颜色分类（Sort Colors） | 最经典的计数排序题之一，值域只有 0、1、2。可用计数排序（统计个数）或双指针三路快排思想 |
| [1365](https://leetcode.cn/problems/how-many-numbers-are-smaller-than-the-current-number/) | 有多少小于当前数字的数字      | 值域 \[0, 100]，可用计数排序 + 前缀和快速解决                 |
| [1331](https://leetcode.cn/problems/rank-transform-of-an-array/)                           | 数组序号转换            | 离散化题，可借用计数排序思想处理映射关系                          |
| [347](https://leetcode.cn/problems/top-k-frequent-elements/)                               | 前 K 个高频元素         | 结合桶排序的思想（频率做桶），经典题                            |
| [451](https://leetcode.cn/problems/sort-characters-by-frequency/)                          | 根据字符出现频率排序        | 可用计数 + 桶排序方式                                  |
| [973](https://leetcode.cn/problems/k-closest-points-to-origin/)                            | 最接近原点的 K 个点       | 若用计数排序思想则需结合桶或值域限制                            |
| [164](https://leetcode.cn/problems/maximum-gap/)                                           | 最大间距              | 桶排序/计数排序思想的进阶题                                |

---

### ✅ 进阶练习（计数排序或桶排序变种）

| 题号                                                                           | 标题                 | 说明                    |
| ---------------------------------------------------------------------------- | ------------------ | --------------------- |
| [215](https://leetcode.cn/problems/kth-largest-element-in-an-array/)         | 数组中的第 K 个最大元素      | 可以通过计数排序加速（若值域小）      |
| [242](https://leetcode.cn/problems/valid-anagram/)                           | 有效的字母异位词           | 典型的 26 个字母计数          |
| [383](https://leetcode.cn/problems/ransom-note/)                             | 赎金信                | 也是字母频率统计问题            |
| [389](https://leetcode.cn/problems/find-the-difference/)                     | 找不同                | 计数法可轻松解决              |
| [299](https://leetcode.cn/problems/bulls-and-cows/)                          | 猜数字游戏              | 用计数数组统计牛数             |
| [2085](https://leetcode.cn/problems/count-common-words-with-one-occurrence/) | 统计两个字符串数组中唯一字符串的数目 | 使用 Map 也行，但值域可控时计数更高效 |

---

### 🧠 总结：适合用计数排序的题目特征

* 数据范围小（如 0-100 或 0-1000）
* 无需比较操作
* 可用频率统计 + 前缀和等技巧优化
* 类似“桶排序”思想，计数作为中间结构


* any list
{:toc}