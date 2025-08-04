---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, linkedlist, sf]
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

graph 图

heap  堆

ordered set 有序集合

queue 队列

## 进阶

并查集

字典树

线段树

树状数组

后缀数组

# chat

## 详细介绍一下力扣数据结构之链表 LinkedList 

链表（Linked List）是 LeetCode 上非常常见的基础数据结构之一，很多中高级题目的底层原理也和链表有关。

下面我将从原理、常用操作、典型题型、模板和面试技巧几个方面来全面介绍 **链表**。

---

## 🧠 一、什么是链表？

**链表（Linked List）是一种动态的数据结构，它由一系列节点（Node）组成，每个节点包含：**

* 当前值（val）
* 指向下一个节点的引用（next）

### ✅ 单链表示意图：

```
[1] → [2] → [3] → null
```

### ✅ 双向链表：

```
null ← [1] ⇄ [2] ⇄ [3] → null
```

---

## 🧩 二、链表的分类

| 类型      | 描述                        |
| ------- | ------------------------- |
| 单链表     | 每个节点只指向下一个节点              |
| 双向链表    | 每个节点同时指向前一个和下一个节点         |
| 循环链表    | 尾节点的 next 指回头结点           |
| 虚拟头结点链表 | 为了简化逻辑，引入一个 dummy 节点，值无意义 |

---

## 🛠️ 三、链表的常见操作（模板）

### 1. 遍历链表

```java
ListNode cur = head;
while (cur != null) {
    System.out.println(cur.val);
    cur = cur.next;
}
```

### 2. 插入节点（在某个位置后插入）

```java
ListNode newNode = new ListNode(99);
newNode.next = prev.next;
prev.next = newNode;
```

### 3. 删除节点（删除某个位置的节点）

```java
prev.next = prev.next.next;
```

---

## 🧱 四、常见题型分类（按难度）

### ✅ 简单题

| 题目                                                                     | 类型   | 解法技巧               |
| ---------------------------------------------------------------------- | ---- | ------------------ |
| [206. 反转链表](https://leetcode.cn/problems/reverse-linked-list/)         | 链表反转 | 双指针迭代              |
| [141. 环形链表](https://leetcode.cn/problems/linked-list-cycle/)           | 快慢指针 | 判断是否有环             |
| [21. 合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/)   | 归并   | 虚拟头结点              |
| [876. 链表中间节点](https://leetcode.cn/problems/middle-of-the-linked-list/) | 快慢指针 | slow 一次走一格，fast 两格 |

---

### 🟡 中等题

| 题目                                                                                         | 类型       | 技巧             |
| ------------------------------------------------------------------------------------------ | -------- | -------------- |
| [2. 两数相加](https://leetcode.cn/problems/add-two-numbers/)                                   | 模拟       | 逐位相加，进位处理      |
| [19. 删除倒数第 N 个节点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)          | 双指针      | dummy + 先走 N 步 |
| [24. 两两交换链表中的节点](https://leetcode.cn/problems/swap-nodes-in-pairs/)                        | 模拟       | 三指针操作          |
| [82. 删除排序链表中的重复元素 II](https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii/) | dummy 节点 | 遇到重复全删         |

---

### 🔴 困难题

| 题目                                                                             | 类型    | 难点     |
| ------------------------------------------------------------------------------ | ----- | ------ |
| [25. K 个一组翻转链表](https://leetcode.cn/problems/reverse-nodes-in-k-group/)        | 递归/迭代 | 翻转局部链表 |
| [138. 复制带随机指针的链表](https://leetcode.cn/problems/copy-list-with-random-pointer/) | 哈希映射  | 两次遍历   |
| [23. 合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/)           | 分治/堆  | 小顶堆优化  |

---

## 🧪 五、经典模板示例

### ✅ 1. 反转链表（模板题）

```java
public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    while (curr != null) {
        ListNode nextTemp = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}
```

---

### ✅ 2. 快慢指针找中点

```java
public ListNode middleNode(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}
```

---

### ✅ 3. 合并两个有序链表（用 dummy）

```java
public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(-1);
    ListNode tail = dummy;
    while (l1 != null && l2 != null) {
        if (l1.val < l2.val) {
            tail.next = l1;
            l1 = l1.next;
        } else {
            tail.next = l2;
            l2 = l2.next;
        }
        tail = tail.next;
    }
    tail.next = (l1 != null) ? l1 : l2;
    return dummy.next;
}
```

---

## ⚠️ 六、链表相关技巧总结

| 技巧          | 描述                 |
| ----------- | ------------------ |
| 虚拟头结点 dummy | 简化头节点删除、插入等操作      |
| 快慢指针        | 找环、找中点、删除倒数第 N 个节点 |
| 递归          | 翻转链表、合并链表          |
| 分治/堆        | 合并多个链表时提速          |

---

## 🧠 七、常见面试陷阱

| 问题          | 错误点            |
| ----------- | -------------- |
| 是否考虑头节点被删除  | 没加 dummy 节点    |
| 是否提前保存 next | 修改指针前没保存 next  |
| 是否断环        | 环形链表未断开会死循环    |
| 是否判空        | 多处 null 判定写不完整 |

---

## 🧾 八、链表类题推荐刷题顺序

| 阶段 | 题目                | 类型            |
| -- | ----------------- | ------------- |
| 入门 | 206, 141, 21, 876 | 反转、找环、合并      |
| 进阶 | 2, 19, 24, 82     | 加法、删除、交换      |
| 提升 | 25, 138, 23       | K段反转、复杂结构、堆合并 |

---

## ✅ 总结一句话

> **链表是动态结构，指针操作重逻辑；掌握 dummy、快慢指针、递归、堆合并技巧，是 LeetCode 提升的关键一环。**

* any list
{:toc}