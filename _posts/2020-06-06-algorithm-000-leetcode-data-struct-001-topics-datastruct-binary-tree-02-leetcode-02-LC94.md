---
layout: post
title: leetcode 算法篇专题之树 Tree 02-94. 二叉树的中序遍历 binary-tree-inorder-traversal
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


# 94. 二叉树的中序遍历

给定一个二叉树的根节点 root ，返回 它的 中序 遍历 。

示例 1：

![二叉树的中序遍历](https://assets.leetcode.com/uploads/2020/09/15/inorder_1.jpg)

输入：root = [1,null,2,3]
输出：[1,3,2]
示例 2：

输入：root = []
输出：[]
示例 3：

输入：root = [1]
输出：[1]
 
提示：

树中节点数目在范围 [0, 100] 内
-100 <= Node.val <= 100

进阶: 递归算法很简单，你可以通过迭代算法完成吗？

# v1-递归

## 思路

什么叫中序遍历

```
左子树 => 根 => 右子树。
```

## 实现

```java
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> list = new ArrayList<>();

        // 递归
        travel(root, list);

        return list;
    }

    private void travel(TreeNode root, List<Integer> list) {
        // 终止
        if(root == null) {
            return;
        }

        // 中
        travel(root.left, list);
        
        list.add(root.val);
        
        travel(root.right, list);
    }
```

## 效果 

0ms 100%

# v2-循环

## 思路

运用栈来模拟流程。

## 实现

```java
public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> list = new ArrayList<>();

        TreeNode cur = root;
        Stack<TreeNode> stack = new Stack<>();
        while (cur != null || !stack.isEmpty()) {
            // 1. 不断向左走，把沿途节点压栈
            while (cur != null) {
                stack.push(cur);
                cur = cur.left;
            }

            // 访问
            cur = stack.pop();
            list.add(cur.val);

            // 3. 转向右子树
            cur = cur.right;
        }

        return list;
    }
```

## 效果

0ms 击败 100.00%

# 在线可视化

> [二叉树遍历](https://houbb.github.io/leetcode-visual/binary-tree-travel.html)

* any list
{:toc}