---
layout: post
title: leetcode 算法篇专题之堆 heap s01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, heap, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下数组这种数据结构。

## 主要知识

数组需要拆分下面几个部分：

1. 理论介绍

2. 源码分析

3. 数据结构实现？

4. 题目练习（按照算法思想分类）

5. 梳理对应的 sdk 包

6. 应用实战

因为这个是 leetcode 系列，所以重点是 4、5(对4再一次总结)。

为了照顾没有基础的小伙伴，会简单介绍一下1的基础理论。

简单介绍1，重点为4。其他不是本系列的重点。

# 数据结构篇

## 通用基础

链表 

树

哈希表

stack 栈

queue 队列

ordered set 有序集合

heap  堆

graph 图


## 进阶

并查集

字典树

线段树

树状数组

后缀数组

# chat

https://leetcode.cn/studyplan/top-100-liked/

## 详细介绍一下力扣数据结构之堆

在力扣（LeetCode）中，**堆（Heap）** 是非常常见且实用的数据结构，尤其在需要频繁取最大值/最小值、动态维护一组元素的最大/最小等场景中，堆是优先选择。

---

## 🎯 一、堆是什么？

**堆**是一种**完全二叉树**结构，满足以下性质：

* **最大堆（Max-Heap）**：任意节点的值 ≥ 子节点的值，`peek()` 得到最大值
* **最小堆（Min-Heap）**：任意节点的值 ≤ 子节点的值，`peek()` 得到最小值

堆的本质是一个**优先队列（Priority Queue）**，能在 `O(log n)` 时间内完成：

* 插入元素（add）
* 弹出堆顶（poll）
* 查看堆顶元素（peek）

---

## 🧰 二、Java/Python/C++ 中的堆支持

| 语言     | 标准堆容器                 |
| ------ | --------------------- |
| Java   | `PriorityQueue`（最小堆）  |
| Python | `heapq`（最小堆）          |
| C++    | `priority_queue`（最大堆） |

👉 Java 和 Python 默认都是 **最小堆**，C++ 默认是 **最大堆**。

---

## 🔨 三、常见用法（以 Java 为例）

### 1. 最小堆

```java
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
minHeap.add(3);
minHeap.add(1);
minHeap.add(2);
System.out.println(minHeap.peek()); // 输出 1
```

### 2. 最大堆（Java 需要自定义比较器）

```java
PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
maxHeap.add(3);
maxHeap.add(1);
maxHeap.add(2);
System.out.println(maxHeap.peek()); // 输出 3
```

---

## 🧠 四、力扣常见题型和应用场景

### ✅ 1. Top K 问题

* [215. 数组中的第K个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/)
* [703. 数据流中的第K大元素](https://leetcode.cn/problems/kth-largest-element-in-a-stream/)

👉 用大小为 `k` 的最小堆，维持堆顶为第 k 大元素。

### ✅ 2. 滑动窗口最大值

* [239. 滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/)

👉 用最大堆 + 延迟删除 或 单调队列。

### ✅ 3. 合并 K 个有序链表

* [23. 合并K个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/)

👉 每次从堆中取最小的链表头。

### ✅ 4. 中位数维护

* [295. 数据流的中位数](https://leetcode.cn/problems/find-median-from-data-stream/)

👉 用两个堆维护：

* 一个最大堆存左半边（较小元素）
* 一个最小堆存右半边（较大元素）

---

## ⏱ 五、堆的时间复杂度

| 操作   | 时间复杂度    |
| ---- | -------- |
| 插入元素 | O(log n) |
| 删除堆顶 | O(log n) |
| 获取堆顶 | O(1)     |

---

## 🧩 六、堆和排序的结合

堆可以用来实现 **堆排序（Heap Sort）**：

* 构造一个最大堆
* 每次取出堆顶，交换到数组尾部，重新调整堆
* 时间复杂度：O(n log n)，空间复杂度 O(1)

---

## 🧠 七、力扣模拟题举例

### 示例：力扣 215. 第 K 大元素

```java
public int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();
    for (int num : nums) {
        minHeap.offer(num);
        if (minHeap.size() > k) {
            minHeap.poll();
        }
    }
    return minHeap.peek();
}
```

---

## 🧩 八、堆的变种

| 类型        | 描述                   |
| --------- | -------------------- |
| **双堆结构**  | 用两个堆维护中位数            |
| **索引堆**   | 堆中每个元素带有索引，便于删除或更新   |
| **多关键字堆** | 比较器中用多个字段排序          |
| **懒惰删除堆** | 删除元素用一个 Map 标记，不马上弹出 |

---

## ✨ 总结

| 特性     | 说明                                                       |
| ------ | -------------------------------------------------------- |
| 核心数据结构 | 完全二叉树（通常数组实现）                                            |
| 常用操作   | 插入、弹出堆顶、查看堆顶                                             |
| 常见题型   | TopK、滑动窗口、合并链表、中位数                                       |
| 时间复杂度  | 插入/删除 O(log n)，查看堆顶 O(1)                                 |
| 常用语言容器 | Java：`PriorityQueue`，Python：`heapq`，C++：`priority_queue` |



* any list
{:toc}