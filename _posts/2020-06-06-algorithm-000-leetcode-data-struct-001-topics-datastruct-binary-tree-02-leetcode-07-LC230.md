---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC230. 二叉搜索树中第 K 小的元素 kth-smallest-element-in-a-bst
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


# LC230. 二叉搜索树中第 K 小的元素

给定一个二叉搜索树的根节点 root ，和一个整数 k ，请你设计一个算法查找其中第 k 小的元素（从 1 开始计数）。

 

示例 1：

![1](https://assets.leetcode.com/uploads/2021/01/28/kthtree1.jpg)

输入：root = [3,1,4,null,2], k = 1
输出：1

示例 2：

![1](https://assets.leetcode.com/uploads/2021/01/28/kthtree2.jpg)

输入：root = [5,3,6,2,4,null,null,1], k = 3
输出：3
 

提示：

树中的节点数为 n 。
1 <= k <= n <= 10^4
0 <= Node.val <= 10^4
 

进阶：如果二叉搜索树经常被修改（插入/删除操作）并且你需要频繁地查找第 k 小的值，你将如何优化算法？

# 理解题意

二叉搜索树的中序遍历是升序序列，题目给定的数组是按照升序排序的有序数组，因此可以确保数组是二叉搜索树的中序遍历序列。

# v1-递归

## 思路

中序遍历天然有序，直接去第 k 个即可。

## 实现

```java
    public int kthSmallest(TreeNode root, int k) {
       List<Integer> results = new ArrayList<>();
       dfs(root, k, results);
       return results.get(k-1);
    }

    private void dfs(TreeNode root, int k, List<Integer> results) {
        if(root == null) {
            return;
        }
        if(results.size() == k) {
            return;
        }

        dfs(root.left, k, results);

        results.add(root.val);

        dfs(root.right, k, results);
    }
```

## 效果

1ms 击败 27.54%

## 反思

当然不用 list，用一个全局变量也可以。

一个 count 计算数字，一个 value 即可。

# v2-中序遍历-栈模拟递归实现

## 思路

类似的，我们可以借助 queue 实现 BFS 版本

这个用 bfs 应该更舒服一些。

## 中序遍历

### 流程

递归中序是：

```java
inorder(root.left); 
visit(root); 
inorder(root.right);
```

递归用的是系统调用栈帮我们“保存现场”

迭代需要我们用自己维护的栈来模拟这个过程

### 模板

栈模板

```java
while (cur != null || !stack.isEmpty()) {
    while (cur != null) {
        stack.push(cur);
        cur = cur.left;
    }
    cur = stack.pop();
    visit(cur);
    cur = cur.right;
}
```

1. `while(cur != null) { stack.push(cur); cur = cur.left; }`
递归时先一直往左，直到最左的叶子节点。

栈的作用就是“保存访问路径”，把沿路节点都放进去，等会儿访问。

这里“模拟递归不断调用左子树”的过程。

2. `cur = stack.pop(); visit(cur);`
递归回来了，访问当前节点（根节点）。

你先前把路径上的节点都压入栈，弹出的是“最近一个没访问的节点”。

这就对应递归里访问根节点的时机。

3. `cur = cur.right;`

访问完根节点，递归进入右子树。

于是把指针切换到右子节点，进入下一轮循环。

如果右子节点不为空，继续先把它的左边路径压入栈。

## 核心实现

```java
 public int kthSmallest(TreeNode root, int k) {
        Stack<TreeNode> stack = new Stack<>();
        stack.push(root);

        int count = 0;
        TreeNode cur = root;
        while (!stack.isEmpty() || cur != null) {
            // 左节点一直入栈
            while (cur != null) {
                stack.push(cur);
                cur = cur.left;
            }

            // 根
            cur = stack.pop();
            count++;
            if(count == k) {
                return cur.val;
            }

            // 右节点
            cur = cur.right;
        }

        //NOT FOUND
        return -1;
    }
```


## 效果

0ms 100%

## 反思

这个用 stack 模拟中序遍历的方式，如果能记住还是挺好的。

可是有时候记不住！！！

# 在线可视化

> [二叉树遍历](https://houbb.github.io/leetcode-visual/binary-tree-travel.html)

* any list
{:toc} 