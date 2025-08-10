---
layout: post
title: leetcode 算法篇专题之链表 Linkedlist 02-LC138 随机链表的复制 copy-list-with-random-pointer
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



# LC 138. 随机链表的复制

给你一个长度为 n 的链表，每个节点包含一个额外增加的随机指针 random ，该指针可以指向链表中的任何节点或空节点。

构造这个链表的 深拷贝。 深拷贝应该正好由 n 个 全新 节点组成，其中每个新节点的值都设为其对应的原节点的值。新节点的 next 指针和 random 指针也都应指向复制链表中的新节点，并使原链表和复制链表中的这些指针能够表示相同的链表状态。复制链表中的指针都不应指向原链表中的节点 。

例如，如果原链表中有 X 和 Y 两个节点，其中 X.random --> Y 。那么在复制链表中对应的两个节点 x 和 y ，同样有 x.random --> y 。

返回复制链表的头节点。

用一个由 n 个节点组成的链表来表示输入/输出中的链表。每个节点用一个 [val, random_index] 表示：

val：一个表示 Node.val 的整数。
random_index：随机指针指向的节点索引（范围从 0 到 n-1）；如果不指向任何节点，则为  null 。
你的代码 只 接受原链表的头节点 head 作为传入参数。

示例 1：

![1](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2020/01/09/e1.png)

输入：head = [[7,null],[13,0],[11,4],[10,2],[1,0]]
输出：[[7,null],[13,0],[11,4],[10,2],[1,0]]

示例 2：

![2](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2020/01/09/e2.png)

输入：head = [[1,1],[2,1]]
输出：[[1,1],[2,1]]

示例 3：

![3](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2020/01/09/e3.png)

输入：head = [[3,null],[3,0],[3,null]]
输出：[[3,null],[3,0],[3,null]]
 
提示：

0 <= n <= 1000
-10^4 <= Node.val <= 10^4
Node.random 为 null 或指向链表中的节点。

# 题意是什么？

简单点：

创建一个新链表 链表的所有东西 val next random 都要与原链表完全相同

但是node的地址不能和原链表相同 也就是进行深拷贝

# v1-借助 HashMap

## 思路

这题如果想通了，还是比较简单的。

主要麻烦在有一个 random 指针。

让我们无法轻易的直接复制新对象，因为 random 的节点指的乱七八糟的。

所以最好是 2 次遍历：

1）构建 node 和 newNode（只有 val） 最基本的 val 的

2) 再次填充 newNode 的 next+random 指向

用一个 HashMap 来保存这种引用的映射

## 实现

```java
private Map<Node, Node> buildMap(Node head) {
        Map<Node, Node> nodeMap = new HashMap<>();

        // 遍历一遍，把所有的 node 构建完成。暂时不设置 next + random
        while (head != null) {
            Node newNode = new Node(head.val);
            nodeMap.put(head, newNode);
            head = head.next;
        }
        return nodeMap;
    }
    /**
     * 深度拷贝
     *
     * @param head
     * @return
     */
    public Node copyRandomList(Node head) {
        //1. 用 map 存储每一个属性
        Map<Node, Node> nodeMap = buildMap(head);

        //2. 再次遍历一遍，构建属性
        Node dummy = new Node(0);
        Node pre = dummy;

        while (head != null) {
            Node newNode = nodeMap.get(head);
            // 设置 next + random
            newNode.next = nodeMap.get(head.next);
            newNode.random = nodeMap.get(head.random);

            // 更新 pre
            pre.next = newNode;
            pre = newNode;

            // 移动
            head = head.next;
        }

        return dummy.next;
    }
```

## 效果 

0ms 100%

## 反思

时间复杂度 O(n)，空间复杂度 O(n)

还能更优秀吗？

可以的

# v2-三步法（链表穿插法）

## 核心

我们用 HashMap 来存储 node:newNode 的映射关系

我们如果用插入法，比如 a->b 插入新的复制节点 a->a'->b->b'，相当于天然的实现了这个映射。

只不过映射只利用链表实现而已

## 思路

思路是用链表本身的结构来临时存储映射，分三步：

第一步：复制每个节点，并插入到原节点后面

  原链表：A -> B -> C
  插入复制节点后：A -> A' -> B -> B' -> C -> C'

第二步：设置复制节点的 random 指针

对于每个原节点 `node`，它的复制节点是 `node.next`，

`node.next.random = node.random == null ? null : node.random.next`

这句话是 random 新节点的核心，理由如下：

```
node 是原链表的当前节点，node.next 是复制出来的该节点副本（因为第一步是把复制节点插入到原节点后面），

node.random 是原节点的随机指针指向的节点，

node.random.next 就是node.random 这个节点的复制节点（复制节点一定紧跟在原节点后面），
```

第三步：拆分两个链表，恢复原链表，同时获得复制链表

## 实现

```java
public Node copyRandomList(Node head) {
    if (head == null) return null;

    // 1. 复制节点，插入原节点后面
    Node curr = head;
    while (curr != null) {
        Node copy = new Node(curr.val);
        copy.next = curr.next;
        curr.next = copy;
        curr = copy.next;
    }

    // 2. 设置复制节点的 random 指针
    curr = head;
    while (curr != null) {
        curr.next.random = (curr.random != null) ? curr.random.next : null;
        curr = curr.next.next;
    }

    // 3. 拆分链表，恢复原链表，获得复制链表头
    curr = head;
    Node dummy = new Node(0);
    Node copyCurr = dummy;

    while (curr != null) {
        copyCurr.next = curr.next;
        copyCurr = copyCurr.next;

        curr.next = curr.next.next; // 恢复原链表
        curr = curr.next;
    }

    return dummy.next;
}
```

## 反思

TC O(n)	

SC O(1)

* any list
{:toc}