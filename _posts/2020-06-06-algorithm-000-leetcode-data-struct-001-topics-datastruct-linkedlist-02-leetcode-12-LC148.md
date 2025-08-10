---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 02-LC148. 排序链表 sort-list
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

# LC148. 排序链表 sort-list

给你链表的头结点 head ，请将其按 升序 排列并返回 排序后的链表 。

示例 1：

![1](https://assets.leetcode.com/uploads/2020/09/14/sort_list_1.jpg)

输入：head = [4,2,1,3]
输出：[1,2,3,4]

示例 2：

![2](https://assets.leetcode.com/uploads/2020/09/14/sort_list_1.jpg)

输入：head = [-1,5,3,4,0]
输出：[-1,0,3,4,5]

示例 3：

输入：head = []
输出：[]
 

提示：

链表中节点的数目在范围 [0, 5 * 10^4] 内

-10^5 <= Node.val <= 10^5
 
进阶：你可以在 O(n log n) 时间复杂度和常数级空间复杂度下，对链表进行排序吗？

# v1-借助额外空间

## 思路

1. 借助 list 存放所有的节点信息

2. 排序

3. 返回构建后的信息

## 实现

```java
    private List<ListNode> getList(ListNode listNode) {
        List<ListNode> list = new ArrayList<>();
        while (listNode != null) {
            list.add(listNode);
            listNode = listNode.next;
        }
        return list;
    }

    public ListNode sortList(ListNode head) {
        if(head == null) {
            return head;
        }
        
        List<ListNode> listNodes = getList(head);

        // 排序
        Collections.sort(listNodes, new Comparator<ListNode>() {
            @Override
            public int compare(ListNode o1, ListNode o2) {
                return o1.val - o2.val;
            }
        });

        //3. 重新返回构建
        ListNode dummy = new ListNode(0);
        ListNode pre = dummy;

        for(int i = 0; i < listNodes.size(); i++) {
            ListNode newNode = listNodes.get(i);

            pre.next = newNode;
            pre = newNode;
        }

        // 最后一个值为空
        listNodes.get(listNodes.size()-1).next = null;

        return dummy.next;
    }
```

## 效果 

15ms 击败 21.79%

## 反思

TC 满足

SC O(N)  不满足

# v2-如何常数空间排序？

## 思路

不借助额外空间，我们就回到了排序本身

冒泡、插入、选择：时间复杂度 O(n²)，不符合要求

快速排序：平均 O(n log n)，但链表快排不易写且递归有栈空间

归并排序：天然适合链表，时间 O(n log n)

堆排序：链表实现复杂且不常用

也就是这一题考察的是归并排序。

## 回顾

> [mergeSort 归并排序入门介绍](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-006-sort-04-merge-sort-01-intro)

> [LC21. 合并两个有序链表 merge-two-sorted-lists](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-topics-datastruct-linkedlist-02-leetcode-06-LC21)

## 实现流程

1) 先找到链表中点，断开成两半，递归排序左右两侧     

快慢指针寻找

2) 再合并两个有序链表     

参见 LC21

简单起见，我们先实现递归版本

## 实现

```java
    public ListNode sortList(ListNode head) {
        // 递归终止条件：空链表或只有一个节点
        if (head == null || head.next == null) {
            return head;
        }

        // 1. 找中点，将链表拆成两半
        ListNode mid = getMid(head);
        ListNode rightHead = mid.next;
        mid.next = null;  // 断开左半链表

        // 2. 递归分别排序左右两部分
        ListNode left = sortList(head);
        ListNode right = sortList(rightHead);

        // 3. 合并两个有序链表
        return mergeTwoLists(left, right);
    }

    // 找链表中点（慢指针法）
    private ListNode getMid(ListNode head) {
        ListNode slow = head, fast = head.next; // fast从head.next开始，保证mid偏左
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }

    // 合并两个有序链表（调整指针，不新建节点）
    private ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                cur.next = l1;
                l1 = l1.next;
            } else {
                cur.next = l2;
                l2 = l2.next;
            }
            cur = cur.next;
        }
        cur.next = (l1 != null) ? l1 : l2;
        return dummy.next;
    }
```

## 效果

13ms 击败 31.81%

## 反思

时间复杂度 O(n log n)

额外空间不是常数，因为递归栈空间最多 O(log n)

那么要如何才能满足条件呢？

感觉这一题难度应该定位 HARD 更合理一些。

# v3-常数级别

## 递归的理解

1. 理解归并排序「自底向上」

- 先合并长度为 1 的链表对（也就是单节点和单节点）

- 再合并长度为 2 的链表对

- 再合并长度为 4 的链表对...

- 每次合并完成后，链表部分是排好序的，最终合并成整体有序链表

直接递归其实是反过来的，从大往小不断切割。

2. 怎么实现自底向上？

- 用一个外层循环控制合并的「段长度」`size`，从 1 开始，每次乘 2

- 用内层循环遍历整个链表，把链表切成长度为 `size` 的两段，合并它们

- 合并完一对，再移动到下一对

## 核心流程

- 从当前节点开始，切出两段长度为 `size` 的子链表（第二段可能短）

- 合并两段链表，连接到前面已经合并好的链表尾部

- 更新指针，准备下一段合并

## GAP 切割的思想

说到这个 gap，忽然让我想到了希尔排序，对比回顾下。

> [希尔排序算法详解](https://houbb.github.io/2016/07/14/sort-06-shell-sort)

希尔排序和归并排序确实都涉及“分组处理”，但它们本质和目的其实不同，我帮你理理它们之间的异同和关系：

### 希尔排序（Shell Sort）

* **思想**：把数组（或序列）分成若干个“间隔为 gap”的子序列，对每个子序列执行插入排序；逐渐缩小 gap，直到 gap=1，最后完成整体排序。
* **核心**：分组（子序列）是基于“间隔（gap）”的索引分组，目的是利用局部有序来加速整体排序。
* **适用结构**：数组（支持随机访问）特别适合。
* **关键点**：分组并不是独立分割，整个数据结构是连续的，只是分成若干不相邻子序列进行插入排序。

### 归并排序（Merge Sort）

* **思想**：不断地把序列从中间“断开”，拆分成更小的两部分，分别排序后合并。
* **核心**：分割是**连续的区间分割**，通过递归或自底向上的方法合并有序子序列。
* **适用结构**：数组和链表都适合，链表特别适合归并排序。
* **关键点**：每次合并的是连续的两段子序列，保证局部有序，递归或者循环地合并最终形成整体有序。

归并排序切割的是**连续的**子链段，最终的合并保证有序

希尔排序的分组是**跳跃的间隔**，利用局部插入排序减少整体逆序数

## 实现

```java
    public ListNode sortList(ListNode head) {
            if (head == null || head.next == null) return head;

            // 先统计链表长度
            int length = 0;
            ListNode node = head;
            while (node != null) {
                length++;
                node = node.next;
            }

            ListNode dummy = new ListNode(0, head);
            // 从子链表长度为1开始，逐步翻倍
            for (int size = 1; size < length; size <<= 1) {
                ListNode cur = dummy.next;
                ListNode tail = dummy;

                while (cur != null) {
                    // 左半部分
                    ListNode left = cur;
                    // 右半部分
                    ListNode right = split(left, size);
                    // 下一次开始的节点
                    cur = split(right, size);

                    // 合并左右两个有序链表
                    ListNode[] merged = merge(left, right);
                    tail.next = merged[0];
                    tail = merged[1];
                }
            }

            return dummy.next;
        }

        // 将链表从 head 开始截断，截断后返回剩余链表的头节点
        // 截断长度为 size 的子链表，尾节点.next 置为 null
        private ListNode split(ListNode head, int size) {
            if (head == null) return null;
            for (int i = 1; head.next != null && i < size; i++) {
                head = head.next;
            }
            ListNode next = head.next;
            head.next = null;
            return next;
        }

        // 合并两个有序链表，返回合并后的头和尾节点
        private ListNode[] merge(ListNode l1, ListNode l2) {
            ListNode dummy = new ListNode(0);
            ListNode cur = dummy;

            while (l1 != null && l2 != null) {
                if (l1.val < l2.val) {
                    cur.next = l1;
                    l1 = l1.next;
                } else {
                    cur.next = l2;
                    l2 = l2.next;
                }
                cur = cur.next;
            }
            cur.next = (l1 != null) ? l1 : l2;

            // 找到合并后的尾节点
            while (cur.next != null) {
                cur = cur.next;
            }

            return new ListNode[] {dummy.next, cur};
        }
```

## 效果

15ms 21.79%

## 反思

说到底，这一题考察的还是排序。

归并看得出来应该算是最重要的排序。

# v4-计数排序

## 思路

如果让使用空间，那么计数是永远的性能最好的。

因为排序的 TC 是 O(n + k)、SC 是 O(k) k是数字的范围

核心分为 4 步：

1. 先遍历链表，找到链表中元素的最小值 min 和最大值 max，

2. 创建一个大小为 max - min + 1 的数组 ans，用来统计每个数出现的次数，

3. 再遍历链表，把每个节点的值映射到 ans 数组对应位置并计数，

4. 最后根据计数数组，从小到大把数字写回链表节点，实现排序。

## 实现

```java
public ListNode sortList(ListNode head) {
    if (head == null) return null;

    // 找到最小值和最大值
    int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
    ListNode cur = head;
    while (cur != null) {
        min = Math.min(min, cur.val);
        max = Math.max(max, cur.val);
        cur = cur.next;
    }

    // 统计计数
    int[] count = new int[max - min + 1];
    cur = head;
    while (cur != null) {
        count[cur.val - min]++;
        cur = cur.next;
    }

    // 根据计数重写链表值
    cur = head;
    for (int i = 0; i < count.length; i++) {
        while (count[i] > 0) {
            cur.val = i + min;
            cur = cur.next;
            count[i]--;
        }
    }

    return head;
}
```

## 效果

2ms 100%

## 反思

很喜欢这个解法。

总结一下 3 个套路：

1）额外数组，比较好想到

2）countingSort 空间够用，性能超神

3）归并排序对于链表排序很友好，loop 比较难记住。

* any list
{:toc}