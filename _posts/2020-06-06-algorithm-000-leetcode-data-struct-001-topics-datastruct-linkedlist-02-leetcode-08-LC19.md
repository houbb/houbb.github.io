---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 02-LC19 删除链表的倒数第 N 个结点 remove-nth-node-from-end-of-list
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

[【leetcode】010-19. 删除链表的倒数第 N 个结点 Remove Nth Node From End of List 双指针](https://houbb.github.io/2020/06/08/algorithm-010-leetcode-19-remove-nth-node-from-end-of-list)

# LC 2 

给你两个 非空 的链表，表示两个非负的整数。它们每位数字都是按照 逆序 的方式存储的，并且每个节点只能存储 一位 数字。

请你将两个数相加，并以相同形式返回一个表示和的链表。

你可以假设除了数字 0 之外，这两个数都不会以 0 开头。

示例 1：

![1](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2021/01/02/addtwonumber1.jpg)

输入：l1 = [2,4,3], l2 = [5,6,4]
输出：[7,0,8]
解释：342 + 465 = 807.

示例 2：

输入：l1 = [0], l2 = [0]
输出：[0]

示例 3：

输入：l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
输出：[8,9,9,9,0,0,0,1]
 

提示：

每个链表中的节点数在范围 [1, 100] 内
0 <= Node.val <= 9

题目数据保证列表表示的数字不含前导零

# v1-额外空间

## 思路

用 list 将节点全部存储起来。

然后就可以直接利用 index 快速找到要删除的节点。

删除一个节点 i：`list[i-1]->list[i+1]` 就相当于删除了

这里是倒数第n个，所以等于 size 时，就是删除的队头。

如果删除的节点是队尾，`pre.next = null`

## 实现

```java
    public ListNode removeNthFromEnd(ListNode head, int n) {
        List<ListNode> list = new ArrayList<>();
        // 避免影响 head 信息，或者用方法替代
        ListNode cur = head;
        while (cur != null) {
            list.add(cur);
            cur = cur.next;
        }

        if(list.size() <= 1) {
            return null;
        }
        // 删除第一个
        if(n == list.size()) {
            return list.get(1);
        }

        int ix = list.size()-n;
        ListNode pre = list.get(ix-1);

        if(ix == list.size()-1) {
            // 删除的是尾巴
            pre.next = null;
        } else {
            // common case
            pre.next = list.get(ix+1);
        }


        return head;
    }
```

## 效果

0ms 击败 100.00%

## 反思

这是本体测试用例不够狠。

# v2-两次遍历

## 思路 

我们先得到长度 len。

然后遍历到 n-1，让 pre.next = pre.next.next;

## 实现

```java
    public ListNode removeNthFromEnd(ListNode head, int n) {
        int len = getLength(head);

        // 创建 dummy 节点 dummy->head
        ListNode dummy = new ListNode(0, head);
        ListNode cur = dummy;
        for (int i = 0; i < len-n; i++) {
            cur = cur.next;
        }

        // 移除 cur
        cur.next = cur.next.next;

        return dummy.next;
    }

    private int getLength(ListNode head) {
        int count = 0;
        while (head != null) {
            head = head.next;
            count++;
        }
        return count;
    }
```

## 效果

1ms 击败 100.00%

# v3-双指针

## 思路

有没有可能只遍历一次。

1）两个指针 left=right=0

2）right 先移动 n 次, left 和 right一起移动

3）right 到头是，left 刚好就是倒数第 n 个

说白了就是找到了 v2 中的下面的位置

```java
for (int i = 0; i < len-n; i++) {
    cur = cur.next;
}
```

## 实现

```java
    public ListNode removeNthFromEnd(ListNode head, int n) {
        // 创建 dummy 节点
        ListNode dummy = new ListNode(0, head);
        // 避免空指针
        ListNode cur = dummy;
        ListNode pRight = head;
        for (int i = 0; i < n; i++) {
            pRight = pRight.next;
        }

        while (pRight != null) {
            pRight = pRight.next;
            cur = cur.next;
        }

        // 移除 cur
        cur.next = cur.next.next;

        return dummy.next;
    }
```


## 实现

* any list
{:toc}