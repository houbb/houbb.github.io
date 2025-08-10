---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC543. 二叉树的直径 diameter-of-binary-tree
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, tree, binary-tree, sf]
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

## 通用基础

链表 

树

哈希表

stack 栈

graph 图

heap  堆

ordered set 有序集合

queue 队列

## 进阶

并查集

字典树

线段树

树状数组

后缀数组

# chat

https://leetcode.cn/studyplan/top-100-liked/


# 543. 二叉树的直径 diameter-of-binary-tree

给你一棵二叉树的根节点，返回该树的 直径 。

二叉树的 直径 是指树中任意两个节点之间最长路径的长度 。这条路径可能经过也可能不经过根节点 root 。

两节点之间路径的 长度 由它们之间边数表示。

示例 1：

![1](https://assets.leetcode.com/uploads/2021/03/06/diamtree.jpg)

输入：root = [1,2,3,4,5]
输出：3
解释：3 ，取路径 [4,2,1,3] 或 [5,2,1,3] 的长度。


示例 2：

输入：root = [1,2]
输出：1
 

提示：

树中节点数目在范围 [1, 10^4] 内
-100 <= Node.val <= 100

# v1-递归

## 思路

这个直径是否经过 root 其实不那么重要，我们可以判断所有的点作为中间点，找到最大的直径。

对于当前节点

0) 终止条件 `node.left == node.right == null`

1）递归求的 leftDepth

2）递归求的 rightDepth

3) max = max(max, leftDepth+rightDepth) 因为作为中间点，长度是左右之和。

定义一个全局的 max 记录最大值。


## 实现

```java
    private int max = 0;
    public int diameterOfBinaryTree(TreeNode root) {
        if(root == null) {
            return 0;
        }
        recursive(root);
        return max;
    }

    private int recursive(TreeNode node) {
        if (node.left == null && node.right == null) {
            return 0;
        }

        int leftDepth = node.left == null ? 0 : recursive(node.left)+1; // 包含自己，所以+1
        int rightDepth = node.right == null ? 0 : recursive(node.right)+1; // 包含自己，所以+1


        // 整体最大值
        max = Math.max(max, leftDepth+rightDepth);

        // 二者最大直
        return Math.max(leftDepth, rightDepth);
    }
```

## 效果

1ms 击败 99.41%

## 反思

这里方法本身返回的是深度，不过题目要的是直径。

所以用了个全局变量存储一下。


# 在线可视化

> [二叉树遍历](https://houbb.github.io/leetcode-visual/binary-tree-travel.html)

* any list
{:toc} 