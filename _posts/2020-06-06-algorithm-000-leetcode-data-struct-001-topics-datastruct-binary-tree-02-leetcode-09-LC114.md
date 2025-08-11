---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC114. 二叉树展开为链表 flatten-binary-tree-to-linked-list
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


# chat

https://leetcode.cn/studyplan/top-100-liked/


# LC114. 二叉树展开为链表 flatten-binary-tree-to-linked-list

给你二叉树的根结点 root ，请你将它展开为一个单链表：

展开后的单链表应该同样使用 TreeNode ，其中 right 子指针指向链表中下一个结点，而左子指针始终为 null 。

展开后的单链表应该与二叉树 先序遍历 顺序相同。

示例 1：

![1](https://assets.leetcode.com/uploads/2021/01/14/flaten.jpg)

输入：root = [1,2,5,3,4,null,6]
输出：[1,null,2,null,3,null,4,null,5,null,6]
示例 2：

输入：root = []
输出：[]
示例 3：

输入：root = [0]
输出：[0]
 

提示：

树中结点数在范围 [0, 2000] 内
-100 <= Node.val <= 100
 
进阶：你可以使用原地算法（O(1) 额外空间）展开这棵树吗？

# v1-递归+额外空间

## 思路

我们先借助额外空间。分成两步：

1）先序遍历 根-》左=》右 获取所有节点到 list 中

2）dfs 构建 tree，递归设置右子树。同时清空左子树

## 实现

```java
    public void flatten(TreeNode root) {
        if(root == null) {
           return;     
        }

        List<TreeNode> preOrderList = new ArrayList<>();
        preOrder(root, preOrderList);

        // 递归构建子树
        // 用迭代试一下
        TreeNode cur = root;
        for(int i = 1; i < preOrderList.size(); i++) {
            cur.right = preOrderList.get(i);
            cur.left = null;
            cur = preOrderList.get(i);
        }
    }

    private void preOrder(TreeNode root, List<TreeNode> preOrderList) {
        if(root == null) {
            return;
        }

        // root
        preOrderList.add(root);
        preOrder(root.left, preOrderList);
        preOrder(root.right, preOrderList);
    }
```

## 效果

0ms 100%

## 反思

我们继续写一个 BFS 版本的

# v2-DFS stack 

## 前序遍历

前序遍历 (Pre-order) 顺序是：根节点 → 左子树 → 右子树（是深度优先）。

比如：

```
     1
    / \
   2   3
  / \
 4   5
```

但前序遍历应该是：

```
1, 2, 4, 5, 3   // 根 → 左 → 右
```

## stack 模拟实现

类似的，我们可以借助 stack 实现 DFS 版本

stack 先进后出，我们 pop 出来的就是根。

1）然后左右子树的入栈顺序呢？

应该是先右、后左

2）出栈顺序

因为出栈顺序是反过来的。（出站后要保证先左、后右）

## 实现

```java
    public void flatten(TreeNode root) {
        if(root == null) {
            return;
        }

        List<TreeNode> preOrderList = new ArrayList<>();
        Stack<TreeNode> stack = new Stack<>();
        stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            preOrderList.add(node);

            // 保障左先出，所以后入
            if(node.right != null) {
                stack.push(node.right);
            }
            if(node.left != null) {
                stack.push(node.left);
            }
        }

        // 递归构建子树
        // 用迭代试一下
        TreeNode cur = root;
        for(int i = 1; i < preOrderList.size(); i++) {
            cur.right = preOrderList.get(i);
            cur.left = null;
            cur = preOrderList.get(i);
        }
    }
```

## 效果

1ms 击败 22.16%

## 反思

DFS 主要用到栈的先进后出特性。

其实双端队列也能模拟实现，此处不再演示，原理一样。

# v3-不借助额外空间

## 思路

这个说白了是 Morris 思路

## 核心流程

遍历过程中不用栈，而是利用二叉树中 原本的空闲指针（通常是空的 right），临时建立一条“返回路径”。

通过修改指针，把遍历顺序变成前序（或中序）。

最后这些“临时链”会被覆盖，不会额外占空间。

## Morris 前序遍历模板

```java
public List<Integer> preorderMorris(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    TreeNode cur = root;

    while (cur != null) {
        if (cur.left == null) {
            // 没有左子树，直接访问 + 右移
            res.add(cur.val);
            cur = cur.right;
        } else {
            // 找左子树的最右节点（前驱节点）
            TreeNode pre = cur.left;
            while (pre.right != null && pre.right != cur) {
                pre = pre.right;
            }

            if (pre.right == null) {
                // 第一次到达：访问当前节点
                res.add(cur.val);
                // 建立线索
                pre.right = cur;
                cur = cur.left;
            } else {
                // 第二次到达：恢复结构
                pre.right = null;
                cur = cur.right;
            }
        }
    }
    return res;
}
```

### 思路要点

1. **访问时机**：

   * 中序 Morris 在“第一次到达前驱节点”时不访问，而是在“第二次回到当前节点”时访问。
   * 前序 Morris 刚好反过来：**第一次到达当前节点**就访问（因为前序是 根 → 左 → 右）。
2. **临时链**（线索二叉树思想）：

   * 第一次到达时，把前驱节点的 `right` 指针指向当前节点，便于返回。
   * 第二次到达时，恢复原本的空指针（`pre.right = null`）。
3. **空间复杂度**：

   * 不用栈，也不用递归，只有常数级变量，O(1) 空间。

### 前序 Morris 遍历顺序演示

假设：

```
    1
   / \
  2   3
 / \
4   5
```

执行顺序：

```
访问 1 → 访问 2 → 访问 4 → 回到 2 → 访问 5 → 回到 1 → 访问 3
```

结果：

```
1, 2, 4, 5, 3
```

## 本题实现

```java
public void flatten(TreeNode root) {
        TreeNode cur = root;
        while (cur != null) {
            if (cur.left != null) {
                TreeNode pre = cur.left;
                while (pre.right != null) {
                    pre = pre.right;
                }
                pre.right = cur.right;
                cur.right = cur.left;
                cur.left = null;
            }
            cur = cur.right;
        }
}
```

## 效果

0ms 100%

# 在线可视化

> [二叉树遍历](https://houbb.github.io/leetcode-visual/binary-tree-travel.html)

* any list
{:toc} 