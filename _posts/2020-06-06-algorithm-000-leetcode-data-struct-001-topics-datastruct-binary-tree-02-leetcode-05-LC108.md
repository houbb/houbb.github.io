---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC108. 将有序数组转换为二叉搜索树 convert-sorted-array-to-binary-search-tree
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


# LC108. 将有序数组转换为二叉搜索树

给你一个整数数组 nums ，其中元素已经按 升序 排列，请你将其转换为一棵 平衡 二叉搜索树。

示例 1：

![1](https://assets.leetcode.com/uploads/2021/02/18/btree1.jpg)

输入：nums = [-10,-3,0,5,9]
输出：[0,-3,9,-10,null,5]
解释：[0,-10,5,null,-3,null,9] 也将被视为正确答案：

![2](https://assets.leetcode.com/uploads/2021/02/18/btree2.jpg)

示例 2：

![2](https://assets.leetcode.com/uploads/2021/02/18/btree.jpg)

输入：nums = [1,3]
输出：[3,1]
解释：[1,null,3] 和 [3,1] 都是高度平衡二叉搜索树。
 

提示：

1 <= nums.length <= 10^4
-10^4 <= nums[i] <= 10^4
nums 按 严格递增 顺序排列

# 理解题意

二叉搜索树的中序遍历是升序序列，题目给定的数组是按照升序排序的有序数组，因此可以确保数组是二叉搜索树的中序遍历序列。

# v1-递归

## 思路

中序遍历：左-》根=》右

我们已经有了中序遍历的数组，现在要做的是逆序构建这棵树。

`nums[mid]` 代表中序遍历序列中的“当前根节点”，左边的部分数组对应左子树的中序遍历序列，右边的部分数组对应右子树的中序遍历序列。

因为 mid 是 BST 根，左边小、右边大。

## 核心流程

1) nums[mid] 是 BST 的根

2）左边递归构建左子树、右边递归构建右子树

3) left > right，直接终止

## 实现

```java
    public TreeNode sortedArrayToBST(int[] nums) {
        // 数组有序 所以直接拆分为左右两个数组，dfs
        return dfs(nums, 0, nums.length-1);
    }

    private TreeNode dfs(int[] nums, int left, int right) {
        if(left > right) {
            return null;
        }

        // 中间
        int mid = left + (right-left)/2;
        TreeNode tree = new TreeNode(nums[mid]);
        tree.left = dfs(nums,left,mid-1);
        tree.right = dfs(nums,mid+1,right);
        return tree;
    }
```

## 效果

0ms 击败 100.00%

## 反思

能不能有其他的解法？

# v2-BFS 版本

## 思路

我们也可以用 queue 实现 BFS 版本。

每次循环，其实有下面的元素：节点、左边界、右边界，我们可以定义一个对象。

核心逻辑：

当前节点

```java
TreeNode node = cur.node;
int left = cur.left;
int right = cur.right;
int mid = left + (right - left) / 2;
node.val = nums[mid];
```

左右子节点，这里是加了一下判断，避免没数据。

```java
// 左子区间
if (left <= mid - 1) {
    node.left = new TreeNode();
    queue.offer(new Tuple(node.left, left, mid - 1));
}
// 右子区间
if (mid + 1 <= right) {
    node.right = new TreeNode();
    queue.offer(new Tuple(node.right, mid + 1, right));
}
```

## 核心实现

```java
    public TreeNode sortedArrayToBST(int[] nums) {
        Queue<Tuple> queue = new LinkedList<>();
        TreeNode root = new TreeNode();
        queue.offer(new Tuple(root, 0, nums.length-1));

        while (!queue.isEmpty()) {
            Tuple tuple = queue.poll();
            TreeNode node = tuple.node;
            int left = tuple.left;
            int right = tuple.right;

            int mid = left+(right-left)/2;
            node.val = nums[mid];

            // 左右子节点
            if(left <= mid-1) {
                // 设置
                node.left = new TreeNode();
                queue.offer(new Tuple(node.left,left,mid-1));
            }
            if(right >= mid+1) {
                node.right = new TreeNode();
                queue.offer(new Tuple(node.right,mid+1,right));
            }
        }

        return root;
    }

    class Tuple {
        TreeNode node;
        int left;
        int right;

        public Tuple(TreeNode node, int left, int right) {
            this.node = node;
            this.left = left;
            this.right = right;
        }
    }
```

## 效果

2ms 击败 0.90%


# 在线可视化

> [二叉树遍历](https://houbb.github.io/leetcode-visual/binary-tree-travel.html)

* any list
{:toc} 