---
layout: post
title: leetcode 算法篇专题之队列 queue 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, queue, sf]
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

https://leetcode.cn/studyplan/top-100-liked/

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

## 详细介绍一下力扣数据结构之队列

在 LeetCode 中，**队列（Queue）**是一种非常常见且基础的数据结构，常用于**广度优先搜索（BFS）**、**滑动窗口**、**任务调度**、**生产者消费者模型**等问题中。

---

## 🧱 一、队列基础知识

| 特性   | 描述                                                |
| ---- | ------------------------------------------------- |
| 操作方式 | 先进先出（FIFO）                                        |
| 主要操作 | `offer()` 入队，`poll()` 出队，`peek()` 查看队头            |
| 常见实现 | `LinkedList`、`ArrayDeque`、`PriorityQueue`、`Deque` |

---

## 🛠️ 二、Java 中常见队列实现

| 类型                 | 用法       | 特点                   |
| ------------------ | -------- | -------------------- |
| `Queue<E>` 接口      | 代表队列结构   | 有多个实现                |
| `LinkedList<E>`    | 双向链表实现队列 | 简单但性能一般              |
| `ArrayDeque<E>`    | 数组实现双端队列 | 性能优于 `LinkedList`，推荐 |
| `PriorityQueue<E>` | 优先队列     | 按优先级排序出队             |
| `Deque<E>`         | 双端队列接口   | 可用于单调队列、滑动窗口等        |

**推荐普通队列写法：**

```java
Queue<Integer> queue = new ArrayDeque<>();
queue.offer(1);     // 入队
int val = queue.poll();  // 出队
int front = queue.peek(); // 查看队头
```

---

## 🔁 三、队列的常见应用场景

| 应用场景        | 举例题目           | 描述            |
| ----------- | -------------- | ------------- |
| 广度优先搜索（BFS） | LC 102 二叉树层序遍历 | 一层一层遍历节点      |
| 多源最短路径      | LC 994 腐烂的橘子   | 从多个起点同时扩散     |
| 滑动窗口最大值     | LC 239 滑动窗口最大值 | 用单调队列维护窗口内最大值 |
| 任务调度        | LC 621 任务调度器   | 按照优先级安排任务     |
| 循环队列设计      | LC 622 设计循环队列  | 考察队列设计能力      |

---

## 📘 四、LeetCode 高频队列题型

### ✅ 普通队列（BFS）

| 题号  | 名称           | 技巧             |
| --- | ------------ | -------------- |
| 102 | 二叉树的层序遍历     | 每层节点压入队列，按层展开  |
| 994 | 腐烂的橘子        | BFS 多源扩散       |
| 200 | 岛屿数量（BFS 版本） | 将 DFS 换成 BFS   |
| 542 | 01 矩阵        | 从所有 0 开始向外扩散距离 |

---

### 🧮 优先队列（堆）

| 题号  | 名称           | 技巧             |
| --- | ------------ | -------------- |
| 703 | 数据流中的第 K 大元素 | 小顶堆维护前 K 大     |
| 347 | 前 K 个高频元素    | 优先队列 + HashMap |
| 215 | 数组中第 K 大的元素  | 小顶堆            |
| 621 | 任务调度器        | 优先队列调度任务间隔     |

---

### 📊 单调队列（滑动窗口）

| 题号  | 名称            | 技巧          |
| --- | ------------- | ----------- |
| 239 | 滑动窗口最大值       | 单调队列维护窗口最大值 |
| 862 | 和至少为 K 的最短子数组 | 单调队列优化前缀和   |

---

## 🧰 五、经典模板总结

### 1️⃣ BFS 层序遍历（LC 102）

```java
Queue<TreeNode> queue = new LinkedList<>();
queue.offer(root);

while (!queue.isEmpty()) {
    int size = queue.size();
    for (int i = 0; i < size; i++) {
        TreeNode node = queue.poll();
        // 处理当前节点
        if (node.left != null) queue.offer(node.left);
        if (node.right != null) queue.offer(node.right);
    }
}
```

---

### 2️⃣ 单调队列（LC 239）

```java
Deque<Integer> deque = new ArrayDeque<>();

for (int i = 0; i < nums.length; i++) {
    // 移出不在窗口内的元素
    while (!deque.isEmpty() && deque.peekFirst() <= i - k) {
        deque.pollFirst();
    }
    // 维护递减队列
    while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
        deque.pollLast();
    }
    deque.offerLast(i);
    if (i >= k - 1) {
        res[i - k + 1] = nums[deque.peekFirst()];
    }
}
```

---

### 3️⃣ 优先队列（最小堆）

```java
PriorityQueue<Integer> minHeap = new PriorityQueue<>();

for (int num : nums) {
    minHeap.offer(num);
    if (minHeap.size() > k) {
        minHeap.poll(); // 保持堆大小为 k
    }
}
```

---

## ⚠️ 六、注意事项

| 注意点                    | 描述                                           |
| ---------------------- | -------------------------------------------- |
| 不要忘记判空                 | 队列操作前请判断 `isEmpty()`                         |
| 入队和出队操作可能失败            | `LinkedList` 不会抛异常，`ArrayBlockingQueue` 可能会抛 |
| 滑动窗口中存的是索引             | 单调队列题常存索引用于判断过期                              |
| `PriorityQueue` 默认是小顶堆 | 若要大顶堆，需传入 `Comparator`                       |

---

## 🧭 七、刷题路线推荐（基础 → 进阶）

### 🔹 基础（掌握基本操作）

* [x] 933\. 最近的请求次数
* [x] 622\. 设计循环队列
* [x] 102\. 二叉树的层序遍历

### 🔸 进阶（掌握单调队列/优先队列）

* [x] 239\. 滑动窗口最大值
* [x] 347\. 前 K 个高频元素
* [x] 215\. 第 K 大元素
* [x] 621\. 任务调度器
* [x] 542\. 01 矩阵

---

## ✅ 总结一句话

> **队列的本质是“先进先出”，广度搜索、滑动窗口、优先处理、状态扩散等问题都可以用它建模，非常实用，建议掌握基础队列 + 单调队列 + 优先队列三种用法。**



* any list
{:toc}