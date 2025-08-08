---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 02-LC21. 合并两个有序链表 merge-two-sorted-lists
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, linkedlist, top100, sf]
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

# LC 21. 合并两个有序链表 merge-two-sorted-lists

将两个升序链表合并为一个新的 升序 链表并返回。

新链表是通过拼接给定的两个链表的所有节点组成的。 

示例 1：

![1](https://assets.leetcode.com/uploads/2020/10/03/merge_ex1.jpg)

输入：l1 = [1,2,4], l2 = [1,3,4]
输出：[1,1,2,3,4,4]
示例 2：

输入：l1 = [], l2 = []
输出：[]
示例 3：

输入：l1 = [], l2 = [0]
输出：[0]
 

提示：

两个链表的节点数目范围是 [0, 50]
-100 <= Node.val <= 100
l1 和 l2 均按 非递减顺序 排列

# v1-借助空间

## 思路

用一个临时的数组存储节点信息，然后构建返回，此处不再演示。

因为不符合题目要求。

# v2-直接对比迭代

使用一个 dummy 虚拟头节点来简化合并操作，最终返回 dummy.next 作为合并后链表的头。

通过 current 指针逐步拼接两个链表的较小节点。

最后把未合并完的链表直接接到尾部。

## 实现

```java
public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    // 创建一个虚拟头节点，方便操作
    ListNode dummy = new ListNode(-1);
    ListNode current = dummy;

    // 当两个链表都不为空时，比较当前节点值，连接较小节点
    while (l1 != null && l2 != null) {
        // 也可以调整一下（小的节点优先）
        ListNode smallNode = l1.val <= l2.val ? l1 : l2;
        current.next = smallNode;
        smallNode = smallNode.next;

        //current 向前走，指向刚接上的节点
        //这样保证了每次循环，current 都是合并链表的最后一个节点，方便继续往后面追加新的节点。
        current = current.next;
    }

    // 连接剩余的非空链表节点
    // current 不用动，直接 current->l1剩余的部分
    if (l1 != null) {
        current.next = l1;
    } else {
        current.next = l2;
    }

    // 返回合并后链表的头节点
    return dummy.next;
}
```

## 效果

0ms 击败 100.00%

## 反思

还有其他解法吗？

# v3-直接对比递归

## 思路

和 v2 类似，只不过递归写法

## 实现

```java
public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        if(list1 == null) {
           return list2;     
        }
        if(list2 == null) {
           return list1;     
        }
        ListNode res = new ListNode(0);
        // 对比更小的值
        if(list1.val < list2.val) {
            res = list1;       
            // 再次找最小的
            res.next = mergeTwoLists(list1.next, list2);
        } else {
            res = list2;
            // 再次找最小的
            res.next = mergeTwoLists(list2.next, list1);
        }

        return res;
    }
}
```


## 效果

0ms 击败 100.00%

* any list
{:toc}