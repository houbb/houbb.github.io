---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 02-LC142. 环形链表 II linked-list-cycle-ii
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

# LC 142. 环形链表 II

给定一个链表的头节点  head ，返回链表开始入环的第一个节点。 如果链表无环，则返回 null。

如果链表中有某个节点，可以通过连续跟踪 next 指针再次到达，则链表中存在环。 

为了表示给定链表中的环，评测系统内部使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。

如果 pos 是 -1，则在该链表中没有环。注意：pos 不作为参数进行传递，仅仅是为了标识链表的实际情况。

不允许修改 链表。
 

示例 1：

![1](https://assets.leetcode.com/uploads/2018/12/07/circularlinkedlist.png)

输入：head = [3,2,0,-4], pos = 1
输出：返回索引为 1 的链表节点
解释：链表中有一个环，其尾部连接到第二个节点。

示例 2：

![2](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2018/12/07/circularlinkedlist_test2.png)

输入：head = [1,2], pos = 0
输出：返回索引为 0 的链表节点
解释：链表中有一个环，其尾部连接到第一个节点。


示例 3：

```
1
```

输入：head = [1], pos = -1
输出：返回 null
解释：链表中没有环。
 

提示：

链表中节点的数目范围在范围 [0, 10^4] 内
-10^5 <= Node.val <= 10^5
pos 的值为 -1 或者链表中的一个有效索引
 

进阶：你是否可以使用 O(1) 空间解决此题？

# v1-借助空间

## 思路

我们用一个 Set 记录每一个节点信息，如果发现再次 contains，则说明有环。

和 LC141 基本一样

## 实现

```java
public ListNode detectCycle(ListNode head) {
        Set<ListNode> set = new HashSet<>();

        while (head != null) {
            if(set.contains(head)) {
                return head;
            }
            set.add(head);
            head = head.next;
        }
        return null;
    }
```

## 效果

3ms 击败 19.43%

# v2-快慢指针

经典的 Floyd 验证环是否存在。

1) 如果 fast 和 slow 相遇，那么有环。

2) 相遇之后

fast 回到开头，fast/slow 每人走一步

再次相遇的点，就是结果。

## 实现

```java
public ListNode detectCycle(ListNode head)  {
        ListNode fast = head;
        ListNode slow = head;

        boolean hasMeetFlag = false;
        while (fast != null
                && fast.next != null
            && slow != null) {
            slow = slow.next;
            fast = fast.next.next;

            if(slow == fast) {
                hasMeetFlag = true;
                break;
            }
        }

        // fast 来到开头
        if(hasMeetFlag) {
            fast = head;
            while (fast != slow) {
                fast = fast.next;
                slow = slow.next;
            }

            // 再次相遇，就是相遇的点
            return fast;
        }

        return null;
    }
```

## 效果

0ms 击败 100.00%

## 反思

还有其他解法吗？

* any list
{:toc}