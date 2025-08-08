---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 02-LC206. 反转链表 reverse-linked-list
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


# LC 206. 反转链表 reverse-linked-list

给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。

示例 1：

![1](https://assets.leetcode.com/uploads/2021/02/19/rev1ex1.jpg)

输入：head = [1,2,3,4,5]
输出：[5,4,3,2,1]

示例 2：


![2](https://assets.leetcode.com/uploads/2021/02/19/rev1ex2.jpg)

输入：head = [1,2]
输出：[2,1]

示例 3：

输入：head = []
输出：[]
 

提示：

链表中节点的数目范围是 [0, 5000]
-5000 <= Node.val <= 5000

进阶：链表可以选用迭代或递归方式完成反转。你能否用两种方法解决这道题？

# v1-借助数组

## 思路

借助一个临时的数组，保存每一个节点。

然后返回最后一个元素作为新的头

1) list[i].next = list[i-1];

2) list[0].next = null 需要断开，不然会存在循环

或者借助 stack 也是类似的。

## 实现

```java
 public ListNode reverseList(ListNode head) {
        // 反转 1->2->3->4
        //     4->3->2->1
        List<ListNode> list = new ArrayList<>();

        while (head != null) {
            list.add(head);
            head = head.next;
        }
        // 重新构建
        if(list.isEmpty()) {
            return null;
        }

        // 构建
        ListNode newHead = list.get(list.size()-1);
        for(int i = list.size()-1; i >= 0; i--) {
            list.get(i).next = list.get(i-1);
        }
        // 尾巴设置为null
        list.get(0).next=null;

        return newHead;
    }
```

## 效果

1ms 击败 2.33%

# v2-直接迭代

## 思路

我们如何可以实现不借助额外空间，实现反转呢？

再看一下我们的目标

把链表 1 -> 2 -> 3 -> 4 -> null 变成 4 -> 3 -> 2 -> 1 -> null，不创建新节点，只调整 next 指针。

## 核心流程

可以发现我们从前往后时，直接把节点指向反转即可。

Node pre 前一个节点，最后的返回结果
Node cur 当前节点

```java
ListNode pre = null;
ListNode cur = head;
```

循环时：

```java
// 临时节点，避免 cur-> 指向反转时，引用丢失
ListNode temp = cur.next;

// 反转了
cur.next = pre;

// 节点更新
pre = cur;
cur = temp;
```

## 实现

```java
public ListNode reverseList(ListNode head) {
        ListNode pre = null;
        ListNode cur = head;

        while (cur != null) {
            ListNode temp = cur.next;

            cur.next = pre;

            pre = cur;
            cur = temp;
        }

        return pre;
}
```

## 效果

0ms 100%

# v3-递归

## 思路

如何用递归实现？

整体不变，只是改成递归而已。

## 实现

```java
    public ListNode reverseList(ListNode head) {
        return recursive(null, head);
    }

    private ListNode recursive(ListNode pre, ListNode cur) {
        if(cur == null) {
            return pre;
        }

        ListNode temp = cur.next;
        cur.next = pre;

        // 递归
        return recursive(cur, temp);
    }
```

## 效果

0ms 100%

* any list
{:toc}