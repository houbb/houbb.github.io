---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 02-LC23. 合并 K 个升序链表 merge-k-sorted-lists
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

# LC23. 合并 K 个升序链表

给你一个链表数组，每个链表都已经按升序排列。

请你将所有链表合并到一个升序链表中，返回合并后的链表。

 

示例 1：

输入：lists = [[1,4,5],[1,3,4],[2,6]]
输出：[1,1,2,3,4,4,5,6]
解释：链表数组如下：
[
  1->4->5,
  1->3->4,
  2->6
]
将它们合并到一个有序链表中得到。
1->1->2->3->4->4->5->6
示例 2：

输入：lists = []
输出：[]
示例 3：

输入：lists = [[]]
输出：[]
 

提示：

k == lists.length
0 <= k <= 10^4
0 <= lists[i].length <= 500
-10^4 <= lists[i][j] <= 10^4
lists[i] 按 升序 排列
lists[i].length 的总和不超过 10^4

# v1-最基本的解法

## 思路

1. 借助额外空间，获取所有 nums

2. 排序

3. 构建返回

## 实现

```java
public ListNode mergeKLists(ListNode[] lists) {
        List<Integer> list = new ArrayList<>();
        for(ListNode listNode : lists) {
            while (listNode != null) {
                list.add(listNode.val);
                listNode = listNode.next;
            }
        }

        Collections.sort(list);

        // 返回结果
        ListNode dummy = new ListNode(-1);
        ListNode cur = dummy;

        for(int num : list) {
            ListNode newNode = new ListNode(num);

            cur.next = newNode;
            cur = newNode;
        }
        return dummy.next;
}
```

## 效果 

6ms 击败 28.03%

## 反思

简单粗暴

# v2-两两合并

## 思路

我们回顾一下

> [LC21. 合并两个有序链表 merge-two-sorted-lists](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-topics-datastruct-linkedlist-02-leetcode-06-LC21)

核心实现

```java
public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    // 创建一个虚拟头节点，方便操作
    ListNode dummy = new ListNode(-1);
    ListNode current = dummy;

    // 当两个链表都不为空时，比较当前节点值，连接较小节点
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            current.next = l1;
            l1 = l1.next;
        } else {
            current.next = l2;
            l2 = l2.next;
        }

        //current 向前走，指向刚接上的节点
        current = current.next;
    }

    // 连接剩余的非空链表节点
    if (l1 != null) {
        current.next = l1;
    } else {
        current.next = l2;
    }

    return dummy.next;
}
```

## 实现

```java
// 额外空间
    public ListNode mergeKLists(ListNode[] lists) {
        if(lists == null || lists.length == 0) {
            return null;
        }
        
        // 两两合并
        ListNode left = lists[0];

        for(int i = 1; i < lists.length; i++) {
            left = mergeTwoLists(left, lists[i]);
        }

        return left;
    }

    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        // 创建一个虚拟头节点，方便操作
        ListNode dummy = new ListNode(-1);
        ListNode current = dummy;

        // 当两个链表都不为空时，比较当前节点值，连接较小节点
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                current.next = l1;
                l1 = l1.next;
            } else {
                current.next = l2;
                l2 = l2.next;
            }

            //current 向前走，指向刚接上的节点
            current = current.next;
        }

        // 连接剩余的非空链表节点
        if (l1 != null) {
            current.next = l1;
        } else {
            current.next = l2;
        }

        return dummy.next;
    }
```

## 效果

100ms

14.82%

## 反思

为什么这么慢？

每次调用 mergeTwoLists 合并两个链表，时间复杂度是两个链表长度之和。

顺序合并的总时间复杂度大约是 `O(k * n)`，其中 k 是链表数量，n 是链表长度总和。

# v3-归并

## 思路

合并多个有序的链表。

如果我们用分治会怎么样？

分治递归真的很有魔力，直接把看起来差不多的方案，降低为 O(n log k) 级别

## 实现

```java
    public ListNode mergeKLists(ListNode[] lists) {
        if(lists == null || lists.length == 0) {
            return null;
        }

        return mergeKLists(lists, 0, lists.length-1);
    }

    private ListNode mergeKLists(ListNode[] lists, int left, int right) {
        if (left == right) {
            return lists[left];
        }
        int mid = left + (right - left) / 2;
        ListNode l1 = mergeKLists(lists, left, mid);
        ListNode l2 = mergeKLists(lists, mid + 1, right);
        return mergeTwoLists(l1, l2);
    }

    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        // 创建一个虚拟头节点，方便操作
        ListNode dummy = new ListNode(-1);
        ListNode current = dummy;

        // 当两个链表都不为空时，比较当前节点值，连接较小节点
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                current.next = l1;
                l1 = l1.next;
            } else {
                current.next = l2;
                l2 = l2.next;
            }

            //current 向前走，指向刚接上的节点
            current = current.next;
        }

        // 连接剩余的非空链表节点
        if (l1 != null) {
            current.next = l1;
        } else {
            current.next = l2;
        }

        return dummy.next;
    }
```


## 效果

2ms  72.26%

## 反思

乍一看，顺序合并和分治合并都是不断地两两合并，为什么分治合并的性能明显更好呢？

### 顺序合并

顺序合并是这样的过程：

```
result = lists[0]
for i in 1 to k-1:
    result = mergeTwoLists(result, lists[i])
```

* 第一次合并，两个链表长度是：假设平均每个链表长度为 n，总长度是 N = k \* n
* 依次合并时，合并的链表长度会逐渐变长：第一次合并长度约为 2n，第二次合并是 3n，第三次是 4n，...
* 最后一次合并的链表长度几乎是 N

换句话说，**后面的合并操作越来越重，工作量集中在最后几次合并上**。

### 分治合并

分治合并是不断将链表两两合并，然后再合并结果，比如：

```
merge(lists[0..k/2]) 和 merge(lists[k/2+1..k])
```

* 每一层的合并都是两个长度相近的链表合并
* 合并层数大约是 log k
* 每层合并总工作量大约是 N（所有节点遍历一次）

也就是说，分治合并的工作量平均分布在多层合并中，避免了顺序合并中**最后一步非常重**的情况。

### 时间复杂度对比

* 顺序合并：

  $$
  T = n + 2n + 3n + ... + kn = n(1 + 2 + ... + k) = n \frac{k(k+1)}{2} = O(k^2 n)
  $$

* 分治合并：

  $$
  T = \log k \times n k = O(n k \log k)
  $$


# v4-优先队列（最小堆）

## 思路

其实这一题借助优先队列（最小堆）也是可行的。

把 k 个链表头节点放入最小堆，每次弹出最小节点，加入结果链表，然后把该节点的下一节点加入堆。

这样可以天然的保持最小值在队列头

时间复杂度同样是 O(n log k)，且代码简洁，适合链表长度差异较大情况。

感觉是 v1 的改进版本

## 实现

```java
public ListNode mergeKLists(ListNode[] lists) {
        // 排序
        if (lists == null || lists.length == 0) return null;

        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);

        for (ListNode node : lists) {
            if (node != null) {
                pq.offer(node);
            }
        }

        ListNode dummy = new ListNode(-1);
        ListNode curr = dummy;

        while (!pq.isEmpty()) {
            ListNode node = pq.poll();
            curr.next = node;
            curr = curr.next;
            if (node.next != null) {
                pq.offer(node.next);
            }
        }

        return dummy.next;
    }
```

## 效果

4ms 击败 63.68%

## 反思

依然不是最优

# v5-计数排序

## 思路

同样的道理

只不过是用不同的数据结构来实现排序，我们补充下计数排序

## 实现

```java
    private final int[] array = new int[20001];
    // 额外空间
    public ListNode mergeKLists(ListNode[] lists) {
        // 排序
        if (lists == null || lists.length == 0) return null;

        // 伟大的计数排序 10^-4~10^4
        int[] nums = array;
        int min = 20002;
        int max = -1;
        for(ListNode listNode : lists) {
            while (listNode != null) {
                int ix = listNode.val + 10000; // 至少为0
                nums[ix]++;
                listNode = listNode.next;

                min = Math.min(ix, min);
                max = Math.max(ix, max);
            }
        }

        ListNode dummy = new ListNode(-1);
        ListNode cur = dummy;

        // 输出
        for(int i = min; i <= max; i++) {
            int count = nums[i];
            int val = i - 10000;
            while (count > 0) {
                ListNode newNode = new ListNode(val);
                cur.next = newNode;
                cur = newNode;
                count--;
            }
        }

        return dummy.next;
    }
```

## 效果

2ms 击败 72.26%

* any list
{:toc}