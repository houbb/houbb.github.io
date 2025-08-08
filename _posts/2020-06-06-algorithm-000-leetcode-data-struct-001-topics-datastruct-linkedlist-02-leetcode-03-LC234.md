---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 02-LC234. 回文链表 palindrome-linked-list
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

# LC 234. 回文链表

给你一个单链表的头节点 head ，请你判断该链表是否为回文链表。

如果是，返回 true ；否则，返回 false 。

示例 1：

```
1->2->2->1
```

输入：head = [1,2,2,1]
输出：true

示例 2：

```
1->2
```

输入：head = [1,2]
输出：false
 

提示：

链表中节点数目在范围[1, 10^5] 内

0 <= Node.val <= 9

进阶：你能否用 O(n) 时间复杂度和 O(1) 空间复杂度解决此题？

# v1-借助空间

## 思路

我们先借助 list，然后把每个节点的数据存储下来。

然后再去判断这些数据是否为一个回文。

至于判断回文的方法，可以用双指针，从中间开始，往两边扩散。区分一下个数（单个、双数）

## 实现

```java
    public boolean isPalindrome(ListNode head) {
        List<Integer> list = new ArrayList<>();
        while (head != null) {
            list.add(head.val);
            head = head.next;
        }

        // 判断
        if(list.isEmpty()) {
            return false;
        }

        // 判断回文
        return isValid(list);
    }

    private boolean isValid(List<Integer> list) {
        int left = 0;
        int right = list.size()-1;

        while (left < right) {
            if(list.get(left) != list.get(right)) {
                return false;
            }
            left++;
            right--;
        }

        return true;
    }
```

## 效果

13ms 击败 12.44%

# v2-如何不借助空间？

你能否用 O(n) 时间复杂度和 O(1) 空间复杂度解决此题？

## 思路

我们可以做到吗？

要如何遍历一遍链表，不借助额外空间，同时实现回文的判断呢？

也许我们把以前的技能结合在一起：

1）快慢指针找到中点

2）但是后面的，如何从后往前遍历呢？我们想到 LC206 的原地反转

3）然后就是正常的回文判断

## 实现

```java
    public boolean isPalindrome(ListNode head) {
        // 保存原始的头结点
        ListNode oldHead = head;

        // 1.双指针找中点
        ListNode fast = head;
        ListNode slow = head;
        while (fast != null && fast.next != null) {
            // 快走2步
            fast = fast.next.next;
            slow = slow.next;
        }

        // 此时 slow 在中间
        // 2. 借助 LC206 反转
        ListNode reverseNode = recursiveReverse(null, slow);

        // 3. 双指针循环，如果不一致直接中断
        while (oldHead != null && reverseNode != null) {
            int leftVal = oldHead.val;
            int rightVal = reverseNode.val;

            if(leftVal != rightVal) {
                return false;
            }
            oldHead = oldHead.next;
            reverseNode = reverseNode.next;
        }

        return true;
    }

    private ListNode recursiveReverse(ListNode pre, ListNode cur) {
        if(cur == null) {
            return pre;
        }

        ListNode temp = cur.next;
        cur.next = pre;

        // 递归
        return recursiveReverse(cur, temp);
    }
```

## 效果

8ms 击败 34.90%

## 反思

如果是这个难度，这一题不应该是简单，至少也是一个中等吧。

关键是这样，还是不够快。

# v3-性能最优改进

## 思路

我们回头看一下 v1，为什么慢？

因为用到了 List，那么能用 array 吗？

1）我们不知道 list 的长度，所以直接用 array 无法知道具体大小。如何解决？

2）如何尽可能降低 array 的创建代价？

问题1，我们可以根据题目条件 [1, 10^5]，也就是最多 10W 

问题2，我们可以定义个全局的变量，降低每次申请内存成本

## 实现

```java
    private static int [] globalArray = new int[100000];

    public boolean isPalindrome(ListNode head) {
        // 直接全局复制
        int[] array = globalArray;

        // 拷贝全部元素
        int ix = 0;
        while (head != null) {
            array[ix++] = head.val;
            head = head.next;
        }

        // 判断回文
        return isValid(array, ix);
    }

    private boolean isValid(int[] array,
                            int size) {
        int left = 0;
        int right = size-1;

        while (left < right) {
            if(array[left] != array[right]) {
                return false;
            }
            left++;
            right--;
        }

        return true;
    }
```

## 效果

4ms 击败 86.23%

## 反思

当然，这种解法只是为了弥补 v1 的性能问题。

整体思路不变。

* any list
{:toc}