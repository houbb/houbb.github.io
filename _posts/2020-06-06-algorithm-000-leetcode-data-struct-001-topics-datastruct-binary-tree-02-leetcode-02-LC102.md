---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC102 二叉树的层序遍历 binary-tree-level-order-traversal
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


# LC102. 二叉树的层序遍历

给你二叉树的根节点 root ，返回其节点值的 层序遍历 。 （即逐层地，从左到右访问所有节点）。

示例 1：

![二叉树的层序遍历](https://assets.leetcode.com/uploads/2021/02/19/tree1.jpg)

输入：root = [3,9,20,null,null,15,7]
输出：[[3],[9,20],[15,7]]

示例 2：

输入：root = [1]
输出：[[1]]

示例 3：

输入：root = []
输出：[]
 

提示：

树中节点数目在范围 [0, 2000] 内
-1000 <= Node.val <= 1000

# v1-递归

## 思路

我们可以针对当前层级的数据落入 list

1) 可以用前序遍历 dfs 的方式

2）可以额外放入 level 属性，将当前行的数据都加入到队列中。

## 实现

递归的话很简单

```java
public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> resultList = new ArrayList<>();
        dfs(root, 0, resultList);
        return resultList;
    }

    private void dfs(TreeNode root, int level, List<List<Integer>> list) {
        // 结束
        if(root == null) {
            return;
        }

        // 一开始，初始化 list
        if(list.size() == level) {
            list.add(new ArrayList<>());
        }

        // 根-》左右 递归
        list.get(level).add(root.val);

        dfs(root.left, level+1, list);
        dfs(root.right, level+1, list);
    }
```

## 效果

1ms 击败 93.05%

# v2-迭代 BFS

## 思路

我们通过 BFS 来实现。类似于 T104

通过 queue 先进先出，说白了就是当前层的元素都遍历结束，然后 depth+1

1) 初始化 放入 root

2) 遍历 queue 中所有元，queue 非空，放入 left + right

3) 在一层结束后，所有 List 接入结果

## 实现

```java
public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> resultList = new ArrayList<>();
        if (root == null) {
            return resultList;
        }

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int size = queue.size();

            List<Integer> tempList = new ArrayList<>();

            // 遍历当前层所有节点
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                tempList.add(node.val);

                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }

            resultList.add(tempList);
        }
        return resultList;
    }
```

## 效果

1ms 击败 93.05%

# 在线可视化

> [二叉树遍历](https://houbb.github.io/leetcode-visual/binary-tree-travel.html)

* any list
{:toc} 