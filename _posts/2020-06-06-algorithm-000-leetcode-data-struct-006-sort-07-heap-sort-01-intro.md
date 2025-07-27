---
layout: post
title: leetcode sort 排序-07-heapSort 堆排序入门介绍
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

# 堆排序（heap Sort）

## 📌 一、堆排序简介

**堆排序**是一种利用**堆这种数据结构**设计的排序算法。
堆是一棵完全二叉树，满足**堆性质**：

* **大顶堆**：每个节点的值都大于等于其子节点的值（根是最大值）。
* **小顶堆**：每个节点的值都小于等于其子节点的值（根是最小值）。

堆排序通常使用大顶堆来实现升序排序。

---

## 🧠 二、堆排序核心思想

1. **将数组构建成大顶堆**，使得堆顶元素是最大值。
2. **将堆顶最大值与数组末尾元素交换**，堆大小减一（排好序的部分从数组末尾开始）。
3. **对新的堆顶元素执行“下沉”调整，恢复堆性质。**
4. 重复步骤 2、3，直到堆大小为1。

---

## 🎯 三、执行过程示意

假设待排序数组为 `[4, 10, 3, 5, 1]`：

1. **构建大顶堆**

   * 调整使数组变为大顶堆，比如 `[10, 5, 3, 4, 1]`

2. **交换堆顶和末尾元素**

   * 交换 `10` 和 `1`，数组变为 `[1, 5, 3, 4, 10]`
   * 堆大小减1，不考虑最后一个元素

3. **调整堆顶恢复大顶堆**

   * 对 `[1,5,3,4]` 调整成大顶堆 `[5,4,3,1]`

4. **继续交换堆顶和末尾元素，调整堆**

   * 重复直到排序完成，最终结果 `[1, 3, 4, 5, 10]`

---

## ✅ 四、Java代码实现

```java
public void heapSort(int[] arr) {
    int n = arr.length;

    // 1. 构建大顶堆，从最后一个非叶子节点开始调整
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }

    // 2. 逐步将堆顶最大元素交换到末尾，调整堆
    for (int i = n - 1; i > 0; i--) {
        swap(arr, 0, i);           // 把最大元素放到末尾
        heapify(arr, i, 0);        // 重新调整堆（堆大小为i）
    }
}

// 调整堆，保持堆性质
private void heapify(int[] arr, int heapSize, int rootIndex) {
    int largest = rootIndex;          // 当前根节点索引
    int leftChild = 2 * rootIndex + 1;
    int rightChild = 2 * rootIndex + 2;

    // 找出三个节点中最大值
    if (leftChild < heapSize && arr[leftChild] > arr[largest]) {
        largest = leftChild;
    }
    if (rightChild < heapSize && arr[rightChild] > arr[largest]) {
        largest = rightChild;
    }

    // 如果最大不是根，交换并继续堆化
    if (largest != rootIndex) {
        swap(arr, rootIndex, largest);
        heapify(arr, heapSize, largest);
    }
}

private void swap(int[] arr, int i, int j) {
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}
```

---

## 📈 五、复杂度分析

| 维度       | 时间复杂度      | 空间复杂度 | 是否稳定  |
| -------- | ---------- | ----- | ----- |
| 最好/最坏/平均 | O(n log n) | O(1)  | ❌ 不稳定 |

* 构建堆过程：O(n)
* 调整堆过程：O(log n) \* n 次

---

## ⚖️ 六、优缺点总结

| 优点                  | 缺点                |
| ------------------- | ----------------- |
| 时间复杂度稳定为 O(n log n) | 不稳定排序（相等元素顺序可能改变） |
| 原地排序，空间复杂度 O(1)     | 实现复杂度比快排高         |
| 适合大规模数据排序           | 不适合对稳定性要求高的场景     |
| 不依赖数据初始状态           | 调整堆时涉及递归或循环，代码稍复杂 |

---

## 🧰 七、适用场景

| 场景            | 是否推荐 |
| ------------- | ---- |
| ✅ 大数据量排序      | 推荐   |
| ✅ 需要原地排序      | 推荐   |
| ❌ 需要稳定排序      | 不推荐  |
| ✅ 对时间复杂度有严格要求 | 推荐   |

---

## 🧩 八、LeetCode 推荐题目

### 🔹 [912. 排序数组](https://leetcode.cn/problems/sort-an-array/)

* 可以使用堆排序实现高效排序。

### 🔹 [703. 数据流中的第 K 大元素](https://leetcode.cn/problems/kth-largest-element-in-a-stream/)

* 可利用堆（优先队列）维护第 K 大元素。

### 🔹 [215. 数组中的第 K 个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/)

* 可用堆排序或堆选择算法实现。

---

## 🔚 九、一句话总结

> **堆排序通过构建大顶堆，不断取最大值放末尾，时间复杂度稳定，空间开销小，是实用的高效原地排序算法，但不保证稳定性。**

* any list
{:toc}