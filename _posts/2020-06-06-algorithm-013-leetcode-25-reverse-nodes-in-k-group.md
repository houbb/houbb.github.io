---
layout: post
title: 【leetcode】013-25.K 个一组翻转链表 Reverse Nodes in k-Group + 24. 两两交换链表中的节点 swap nodes in pairs
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [Algorithm, list, leetcode, sf]
published: true
---

# 24. 两两交换链表中的节点

给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。

你必须在不修改节点内部的值的情况下完成本题（即，只能进行节点交换）。

## 示例 

示例 1：

```
输入：head = [1,2,3,4]
输出：[2,1,4,3]
```

示例 2：

```
输入：head = []
输出：[]
```

示例 3：

```
输入：head = [1]
输出：[1]
``` 

提示：

链表中节点的数目在范围 [0, 100] 内

0 <= Node.val <= 100

## java 实现

```java
public ListNode swapPairs(ListNode head) {
    ListNode dummy = new ListNode(0, head);
    // 当前移动指针
    ListNode current = dummy;

    //a->b->c
    //b->a->c
    while (current.next != null && current.next.next != null) {
        ListNode first = current.next;
        ListNode second = current.next.next;
        // a->c
        first.next = second.next;
        // b->a
        second.next = first;
        // []->b
        current.next = second;
        // 调整位置
        current = current.next.next;
    }

    // 获取结果
    return dummy.next;
}
```

## 效果

效果如下：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Swap Nodes in Pairs.
Memory Usage: 37 MB, less than 71.71% of Java online submissions for Swap Nodes in Pairs.
```

实现了 2 个的翻转，我们来看一下 k 个的翻转。

# 25. K 个一组翻转链表

给你链表的头节点 head，每 k 个节点一组进行翻转，请你返回修改后的链表。

k 是一个正整数，它的值小于或等于链表的长度。

如果节点总数不是 k 的整数倍，那么请将最后剩余的节点保持原有顺序。

你不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。

## 示例
 
示例 1：

```
输入：head = [1,2,3,4,5], k = 2
输出：[2,1,4,3,5]
```

示例 2：


```
输入：head = [1,2,3,4,5], k = 3
输出：[3,2,1,4,5]
``` 

## 提示：

链表中的节点数目为 n

1 <= k <= n <= 5000

0 <= Node.val <= 1000

进阶：你可以设计一个只用 O(1) 额外内存空间的算法解决此问题吗？


# V1-基本实现

## 思路

我们首先要判断节点是否够 k 个，不够直接返回。

如果够的话，就把剩下的 k 个节点进行反转。

可见 T24 只是本题的一个特例而已。

## java 实现

```java
public static ListNode reverseKGroup(ListNode head, int k) {
    ListNode dummy = new ListNode(-1, head), prev = dummy;
    while (true) {
        // 检查剩余节点是否有k个，不足则返回
        ListNode last = prev;
        for (int i = 0; i < k; i++) {
            last = last.next;
            if (last == null) {
                return dummy.next;
            }
        }

        // 翻转k个节点
        ListNode curr = prev.next, next;
        for (int i = 0; i < k - 1; i++) {
            next = curr.next;
            curr.next = next.next;
            next.next = prev.next;
            prev.next = next;
        }
        prev = curr;
    }
}
```

会有方便，这里引入 dummy 节点。

## 性能

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Reverse Nodes in k-Group.
Memory Usage: 39.9 MB, less than 28.23% of Java online submissions for Reverse Nodes in k-Group.
```

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 参考资料

https://leetcode.cn/problems/reverse-nodes-in-k-group/

* any list
{:toc}