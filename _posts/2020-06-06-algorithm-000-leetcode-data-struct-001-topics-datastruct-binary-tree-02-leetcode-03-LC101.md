---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC101. 对称二叉树 symmetric-tree
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


# 101. 对称二叉树 symmetric-tree

# v1-递归

## 思路

1) 终止条件 root == null，直接返回 true

然后看左右子树是否轴对称

2) 左右子树递归逻辑

1. left == right == null，认为对称

2. left, right 一个为 null，认为不对称

3. 二者的值不等，认为不对称

4. 递归比较 `(left.left, right.right) && (left.right, right.left)`  是否满足轴对称

## 实现

```java
    public boolean isSymmetric(TreeNode root) {
        if(root == null) {
                return true;
        }
        return isMirror(root.left, root.right);
    }

    private boolean isMirror(TreeNode left, TreeNode right) {
        // 比较
        if(left == null && right == null) {
            return true;
        }
        if(left == null || right == null) {
            return false;
        }

        // 值要相等
        if(left.val != right.val) {
            return false;
        }
        // 递归
        return isMirror(left.left, right.right) && isMirror(left.right, right.left);
    }
```

## 效果

0ms 100%

## 反思

时间复杂度：O(n)，遍历所有节点。

空间复杂度：O(h)，递归栈空间，h为树高。

# v2 迭代法 - 使用队列（广度优先遍历）

## 思路

我们用 queue，整体逻辑类似。

只不过出队列，如果 `left == right == null` 需要继续比较，因为这只说明当前2个子树满足。


## 实现

```java
    public boolean isSymmetric(TreeNode root) {
        if(root == null) {
            return true;
        }

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root.left);
        queue.offer(root.right);

        while (!queue.isEmpty()) {
            TreeNode left = queue.poll();
            TreeNode right = queue.poll();

            // 比较逻辑
            if(left == null && right == null) {
                // 这对节点对称，继续检查后续节点
                continue;
            }
            if(left == null || right == null) {
                return false;
            }

            // 值要相等
            if(left.val != right.val) {
                return false;
            }

            // 继续入栈
            queue.offer(left.left);
            queue.offer(right.right);

            queue.offer(left.right);
            queue.offer(right.left);
        }

        return true;
    }
```


## 效果

1ms 击败 14.81%

## 反思

时间复杂度：O(n)

空间复杂度：O(n)

# v3-迭代法 - 使用栈（深度优先遍历）

## 思路

使用栈模拟递归过程，比较左右子节点是否满足镜像。

一条路径上节点会一直深入到底再回溯

注意：DFS BFS 针对这个看起来很类似，因为本质上就是不停的对比左右节点。

说白了就是访问的顺序不影响结果。

## 实现

```java
    public boolean isSymmetric(TreeNode root) {
        if(root == null) {
            return true;
        }

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root.left);
        queue.offer(root.right);

        while (!queue.isEmpty()) {
            TreeNode left = queue.poll();
            TreeNode right = queue.poll();

            // 比较逻辑
            if(left == null && right == null) {
                // 这对节点对称，继续检查后续节点
                continue;
            }
            if(left == null || right == null) {
                return false;
            }

            // 值要相等
            if(left.val != right.val) {
                return false;
            }

            // 继续入栈
            queue.offer(left.left);
            queue.offer(right.right);

            queue.offer(left.right);
            queue.offer(right.left);
        }

        return true;
    }
```

## 效果

0ms 100%

## 反思

时间复杂度：O(n)

空间复杂度：O(n)

# 在线可视化

> [二叉树遍历](https://houbb.github.io/leetcode-visual/binary-tree-travel.html)

* any list
{:toc} 