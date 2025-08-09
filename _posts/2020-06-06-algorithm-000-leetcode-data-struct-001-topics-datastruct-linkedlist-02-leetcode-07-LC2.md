---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 02-LC2 两数相加
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

[leetcode】02-leetcode 2. 两数相加 add two numbers](https://houbb.github.io/2020/06/08/algorithm-002-leetcode-02-add-two-numbers)

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

1. 直接从头到尾遍历，得到数字，此时是逆序的

2. 两个逆序的数字相加，返回构建的链表

注意不要越界，java 可以用 BigInteger 来实现。

## 实现

```java
public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        String str1 = listToString(l1);
        String str2 = listToString(l2);

        BigInteger num1 = new BigInteger(str1);
        BigInteger num2 = new BigInteger(str2);

        BigInteger resNum = num1.add(num2);
        String resStr = resNum.toString();
        return stringToList(resStr);
    }

    private String listToString(ListNode listNode) {
        StringBuilder stringBuilder = new StringBuilder();

        while (listNode != null) {
            stringBuilder.append(listNode.val);
            listNode = listNode.next;
        }

        // 反转得到真实的结果
        return stringBuilder.reverse().toString();
    }

    private ListNode stringToList(String string) {
        if(string == null) {
            return null;
        }

        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;

        // 高位在后边
        int length = string.length();
        int i = length - 1;
        while (i >= 0) {
            int val = string.charAt(i) - '0';

            ListNode newNode = new ListNode(val);
            // 指向新节点
            cur.next = newNode;
            // 更新 cur 位置
            cur = newNode;

            i--;
        }

        // 下一个就是开头
        return dummy.next;

    }
```

## 效果

8ms 击败 1.65%




# v2-进位

## 思路 

就像我们学基础的加法一样，我们用最基本的加法来计算。

## 流程

用 carry 保存进位

每次从两个链表取对应节点的数字相加（没有节点用0代替）

sum = val1 + val2 + carry

进位是 sum / 10，当前位是 sum % 10

新建节点存当前位，拼接到结果链表

遍历结束后返回结果

## 疑问

进位的话顺序不是反的吗？

| 存储顺序          | 加法顺序           | 进位方向        |
| ------------- | -------------- | ----------- |
| 链表头是个位（逆序）    | 从头遍历（低位往高位）    | 低位加后进位往高位传递 |
| 正常数字书写顺序（字符串） | 从尾部往头部加（低位往高位） | 低位加后进位往高位传递 |

比如

输入：l1 = [2,4,3], l2 = [5,6,4]
输出：[7,0,8]
解释：342 + 465 = 807.

实际上链表放的是个位，所以直接从前往后进位即可。


## 实现

```java
public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;


        // 进位标志
        int carry = 0;

        // 进位存在，依然需要构建
        while (l1 != null || l2 != null || carry != 0) {
            int num1 = (l1 != null) ? l1.val : 0;
            int num2 = (l2 != null) ? l2.val : 0;

            int sum = num1 + num2 + carry;

            // 进位-->10进制
            carry = sum / 10 ;
            // 剩余当前的数
            int num = sum % 10;
            ListNode newNode = new ListNode(num);
            cur.next = newNode;
            cur = newNode;

            // 两个链表指针后移  保持二者的位数一致
            if (l1 != null) l1 = l1.next;
            if (l2 != null) l2 = l2.next;
        }

        return dummy.next;
    }
```

## 效果

1ms 击败 100.00%

## 反思

还有其他解法吗？

* any list
{:toc}