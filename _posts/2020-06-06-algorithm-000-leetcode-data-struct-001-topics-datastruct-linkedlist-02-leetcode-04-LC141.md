---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 02-LC141. 环形链表 linked-list-cycle
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

# LC 141. 环形链表 linked-list-cycle

给你一个链表的头节点 head ，判断链表中是否有环。

如果链表中有某个节点，可以通过连续跟踪 next 指针再次到达，则链表中存在环。 为了表示给定链表中的环，评测系统内部使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。注意：pos 不作为参数进行传递 。仅仅是为了标识链表的实际情况。

如果链表中存在环 ，则返回 true 。 否则，返回 false 。

 

示例 1：

![1](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2018/12/07/circularlinkedlist.png)

输入：head = [3,2,0,-4], pos = 1
输出：true
解释：链表中有一个环，其尾部连接到第二个节点。


示例 2：


![2](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2018/12/07/circularlinkedlist_test2.png)

输入：head = [1,2], pos = 0
输出：true
解释：链表中有一个环，其尾部连接到第一个节点。


示例 3：

```
1
```


输入：head = [1], pos = -1
输出：false
解释：链表中没有环。
 

提示：

链表中节点的数目范围是 [0, 10^4]
-10^5 <= Node.val <= 10^5
pos 为 -1 或者链表中的一个 有效索引 。
 
进阶：你能用 O(1)（即，常量）内存解决此问题吗？

# v1-借助空间

## 思路

我们用一个 Set 记录每一个节点信息，如果发现再次 contains，则说明有环。

## 实现

```java
public boolean hasCycle(ListNode head) {
        Set<ListNode> set = new HashSet<>();

        while (head != null) {
            if(set.contains(head)) {
                return true;
            }
            set.add(head);
            head = head.next;
        }
        return false;
}
```

## 效果

4ms 击败 17.47%

# v2-快慢指针

经典的 Floyd 验证环是否存在。

如果 fast 和 slow 相遇，那么有环。


## 实现

```java
 public boolean hasCycle(ListNode head) {
        ListNode fast = head;
        ListNode slow = head;

        while (fast != null
                && fast.next != null
            && slow != null) {
            slow = slow.next;
            fast = fast.next.next;

            if(slow == fast) {
                return true;
            }
        }

        return false;
    }
```

## 效果

0ms 击败 100.00%

## 反思

还有其他解法吗？


* any list
{:toc}