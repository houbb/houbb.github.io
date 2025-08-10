---
layout: post
title: leetcode 算法篇专题之树 Tree 02-LC226. 翻转二叉树 invert-binary-tree
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


# 226. 翻转二叉树

给你一棵二叉树的根节点 root ，翻转这棵二叉树，并返回其根节点。

示例 1：

![1](https://assets.leetcode.com/uploads/2021/03/14/invert1-tree.jpg)

输入：root = [4,2,7,1,3,6,9]
输出：[4,7,2,9,6,3,1]


示例 2：

![2](https://assets.leetcode.com/uploads/2021/03/14/invert1-tree.jpg)

输入：root = [2,1,3]
输出：[2,3,1]

示例 3：

输入：root = []
输出：[]
 

提示：

树中节点数目范围在 [0, 100] 内
-100 <= Node.val <= 100

# v1-递归

## 思路

1) 终止条件 node == null

2) 递归做什么

```
nodeRight = node.right;
node.right = 递归（node.left）;
node.right = 递归（nodeRight）;
```

为了避免交换被覆盖，就像 swap 一样，我们提前备份 nodeRight

## 实现

递归的话很简单

```java
public TreeNode invertTree(TreeNode root) {
        if(root == null) {
            return null;
        }

        // 当前节点 temp 避免被覆盖
        TreeNode rightTemp = root.right;
        root.right = invertTree(root.left);
        root.left = invertTree(rightTemp);

        return root;
}
```

## 效果

0ms 100%

## 反思

时间复杂度：O(n)，遍历所有节点。

空间复杂度：O(h)，递归栈空间，h为树高。


# v2 迭代法 - 使用队列（广度优先遍历）

## 思路

用队列做层序遍历，每访问一个节点就交换其左右子节点。

先访问当前层的所有节点，再访问下一层

## 实现

```java
    public TreeNode invertTree(TreeNode root) {
        if(root == null) {
            return null;
        }

        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            // 拿出当前节点
            TreeNode cur = queue.poll();
            // 交换左右
            TreeNode tempRight = cur.right;
            cur.right = cur.left;
            cur.left = tempRight;

            // 左右子节点入队列
            if(cur.left != null) {
                queue.offer(cur.left);
            }
            if(cur.right != null) {
                queue.offer(cur.right);
            }
        }

        return root;
    }
```


## 效果

0ms 100%

## 反思

时间复杂度：O(n)

空间复杂度：O(n)

# v3-迭代法 - 使用栈（深度优先遍历）

## 思路

使用栈模拟递归过程，交换节点左右子节点。

一条路径上节点会一直深入到底再回溯

注意：DFS BFS 针对这个看起来很类似，因为本质上就是不停的交换左右节点。说白了就是访问的顺序不影响结果。

## 实现

```java
    public TreeNode invertTree(TreeNode root) {
        if(root == null) {
            return null;
        }

        Stack<TreeNode> stack = new Stack<>();
        stack.push(root);

        while (!stack.isEmpty()) {
            // 拿出当前节点
            TreeNode cur = stack.pop();
            // 交换左右
            TreeNode tempRight = cur.right;
            cur.right = cur.left;
            cur.left = tempRight;

            // 左右子节点入stack
            if(cur.left != null) {
                stack.push(cur.left);
            }
            if(cur.right != null) {
                stack.push(cur.right);
            }
        }

        return root;
    }
```

## 效果

0ms 100%

## 反思

时间复杂度：O(n)

空间复杂度：O(n)

# v4-Morris遍历法

## 思路

加分项，一般知道就行。

## 是什么？


Morris遍历法是一种在二叉树遍历中非常巧妙的算法，能在 **不使用递归也不借助栈** 的情况下，做到 **O(1) 额外空间** 的遍历。

* 由 Joseph M. Morris 在1979年提出
* 主要用于 **中序遍历**（也可做前序）
* 通过临时修改树的指针（线索二叉树思想），利用树中空闲的右指针，避免使用额外栈或递归栈

### 关键思路

1. 对当前节点 `cur`：

   * 如果 `cur.left` 为 `null`，访问 `cur` 并向右移 (`cur = cur.right`)
   * 否则，在 `cur` 的左子树中找到**最右节点**（即中序遍历的前驱节点）

     * 如果这个最右节点的右指针为空，令它指向 `cur`，然后向左移动 (`cur = cur.left`)
     * 如果这个最右节点的右指针已经指向 `cur`，恢复指针为 `null`，访问 `cur`，向右移动 (`cur = cur.right`)

2. 通过这样不断“建立”和“拆除”临时指针，实现线索，避免回溯用栈。

### 复杂度

* 空间复杂度 **O(1)**，不占用额外空间
* 时间复杂度仍为 **O(n)**，每个节点访问最多两次

### Morris遍历示意伪代码（中序）

```java
cur = root
while cur != null:
    if cur.left == null:
        visit(cur)
        cur = cur.right
    else:
        predecessor = cur.left
        while predecessor.right != null and predecessor.right != cur:
            predecessor = predecessor.right
        if predecessor.right == null:
            predecessor.right = cur
            cur = cur.left
        else:
            predecessor.right = null
            visit(cur)
            cur = cur.right
```

## 本题实现


```java
public TreeNode invertTree(TreeNode root) {
    List<TreeNode> nodes = new ArrayList<>();
    TreeNode cur = root;

    // Morris 中序遍历，收集节点
    while (cur != null) {
        if (cur.left == null) {
            nodes.add(cur);
            cur = cur.right;
        } else {
            TreeNode predecessor = cur.left;
            while (predecessor.right != null && predecessor.right != cur) {
                predecessor = predecessor.right;
            }
            if (predecessor.right == null) {
                predecessor.right = cur;
                cur = cur.left;
            } else {
                predecessor.right = null;
                nodes.add(cur);
                cur = cur.right;
            }
        }
    }

    // 遍历收集的节点列表，交换左右子树
    for (TreeNode node : nodes) {
        TreeNode temp = node.left;
        node.left = node.right;
        node.right = temp;
    }

    return root;
}

```

## 效果

0ms 100%

# 对比

| 方法        | 时间复杂度 | 空间复杂度 | 备注        |
| --------- | ----- | ----- | --------- |
| 递归        | O(n)  | O(h)  | 简洁直观      |
| 迭代 + 队列   | O(n)  | O(n)  | 层序遍历，显式队列 |
| 迭代 + 栈    | O(n)  | O(n)  | 深度优先遍历    |
| Morris遍历法 | O(n)  | O(1)  | 复杂，面试加分项  |

# 在线可视化

> [二叉树遍历](https://houbb.github.io/leetcode-visual/binary-tree-travel.html)

* any list
{:toc} 