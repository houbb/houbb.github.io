---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 02-LC24. 两两交换链表中的节点 swap-nodes-in-pairs
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

## 历史回顾

[【leetcode】013-25.K 个一组翻转链表 Reverse Nodes in k-Group + 24. 两两交换链表中的节点 swap nodes in pairs](https://houbb.github.io/2020/06/08/algorithm-013-leetcode-25-reverse-nodes-in-k-group)

# LC 24. 两两交换链表中的节点

给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。

你必须在不修改节点内部的值的情况下完成本题（即，只能进行节点交换）。

示例 1：

![demo-1](https://assets.leetcode.com/uploads/2020/10/03/swap_ex1.jpg)

输入：head = [1,2,3,4]
输出：[2,1,4,3]

示例 2：

输入：head = []
输出：[]

示例 3：

输入：head = [1]
输出：[1]
 

提示：

链表中节点的数目在范围 [0, 100] 内
0 <= Node.val <= 100



# v0-借助额外空间

## 思路

这种属于不用过于思考的，借助额外的数组，存储每一个 ListNode 节点到 list

然后按照题目的意思，2个一组 swap

然后对处理后的 list，直接设置一遍 next，最后一个 next=null

返回第一个元素即可。

## 实现

```java
private List<ListNode> getListNodes(ListNode head) {
        List<ListNode> list = new ArrayList<>();
        while (head != null) {
            list.add(head);
            head = head.next;
        }
        return list;
    }

    private void swap(List<ListNode> listNodes, int i, int j) {
        ListNode temp = listNodes.get(i);
        listNodes.set(i, listNodes.get(j));
        listNodes.set(j, temp);
    }

    public ListNode swapPairs(ListNode head) {
        if(head == null) {
            return null;
        }

        // 所有节点
        List<ListNode> listNodes = getListNodes(head);

        // 按照组交换
        int groupNum = 2;
        for(int i = 0; i+1 < listNodes.size(); i += groupNum) {
            // 交换或者说翻转
            swap(listNodes, i, i+1);
        }

        // 设置->
        for(int i = 0; i < listNodes.size()-1; i++) {
            listNodes.get(i).next = listNodes.get(i+1);
        }
        // 最后一个设置为 null
        listNodes.get(listNodes.size()-1).next = null;

        // 返回
        return listNodes.get(0);
    }
```

## 效果 

0ms 100%

## 反思

优点：逻辑直观，几乎不用考虑指针操作。面对 T25 这种方式稍微调整下即可解。

缺点：需要 O(n) 额外空间，不是原地操作。

# v1-快慢指针

## 思路

如何实现2个一组交换？

1->2->3->4

我们定义两个指针，slow fast

0）初始化

定义 dummy，方便处理 null

```java
ListNode dummy = new ListNode(0, head);
ListNode pre = dummy;
```

1）交换

```java
ListNode first = pre.next;
ListNode second = pre.next.next;

// 初始化：xx->1->2->3
// 1->3
// 2->(1->3)
first.next = second.next;
second.next = first;

// 上一个块和这个连在一起
// xx->2->(1->3)
pre.next = second;
```

2）移动

pre 直接移动到已经处理的结束为止，也就是 first 所在位置。

```java
// 移动 prev 到已处理块的尾（first）
prev = first;
```

3) 如此循环迭代，什么时候结束呢？

`pre.next != null && pre.next.next != null`

## 实现

```java
 public static ListNode swapPairs(ListNode head) {
        ListNode dummy = new ListNode(0, head);
        ListNode prev = dummy;

        while (prev.next != null && prev.next.next != null) {
            ListNode first = prev.next;
            ListNode second = first.next;

            // 执行交换
            first.next = second.next;
            second.next = first;
            prev.next = second;

            // 移动 prev 到已处理块的尾（first）
            prev = first;
        }

        return dummy.next;
}
```

## 效果

0ms 击败 100.00%

## 反思

整体是快慢指针的思想

不过要注意，最好定义一个 pre 节点，用来将不同的 group 块链接在一起。

# v2-递归

## 思路 

递归的本质是把大问题拆成“小的同类问题”。

思路是：

递归函数 swapPairs(head) 假设能正确交换从 head.next.next 开始的链表。

先处理前两个节点 head 和 head.next 的交换。

把交换后的尾节点（原来的 head）的 next 指向递归处理的结果。

返回交换后的新头（原来的 head.next）。

## 实现

(n1->n2)->(n3->n4)->(....)

交换后

(n2->n1)->(n4->n3)->(....)

```java
 public ListNode swapPairs(ListNode head) {
        // 递归终止条件：没有节点 或 只剩一个节点
        if (head == null || head.next == null) {
            return head;
        }

        ListNode first = head;
        ListNode second = head.next;

        // 递归交换后续链表 (n4->n3)->(....)
        first.next = swapPairs(second.next);

        // 当前两个节点交换 (n2->n1)->
        second.next = first;

        // 返回新头
        return second;
}
```

## 效果

0ms 击败 100.00%


## 实现

* any list
{:toc}