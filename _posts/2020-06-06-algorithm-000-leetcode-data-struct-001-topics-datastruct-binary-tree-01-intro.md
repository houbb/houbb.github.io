---
layout: post
title: leetcode 算法篇专题之树 Tree 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, tree, sf]
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

## 详细介绍一下力扣数据结构之树

树（Tree）是 LeetCode 中非常经典和重要的数据结构之一，特别是二叉树相关的题目，频繁出现在中高级题和面试中。

下面我将从原理、常用类型、遍历方式、典型题型、模板技巧等方面详细介绍树的知识体系。

---

## 🌳 一、什么是树？

树是一种**非线性数据结构**，常用于表达具有“父子关系”的层级数据结构。

每个节点可以有多个子节点，但只能有一个父节点（根节点除外）。

### 🧩 常见术语：

| 名称         | 含义              |
| ---------- | --------------- |
| 根节点（Root）  | 树的最上层节点         |
| 叶子节点（Leaf） | 没有子节点的节点        |
| 子节点 / 父节点  | 有连接关系的上下节点      |
| 高度         | 从当前节点到叶子节点的最长路径 |
| 深度         | 从根节点到当前节点的路径长度  |
| 子树         | 一个节点及其所有后代构成的树  |

---

## 🛠️ 二、常见树的类型

| 类型         | 描述                    |
| ---------- | --------------------- |
| 二叉树        | 每个节点最多有两个子节点（左、右）     |
| 完全二叉树      | 除了最后一层外，每层都是满的，最后一层靠左 |
| 满二叉树       | 所有非叶节点都有两个孩子          |
| 平衡二叉树（AVL） | 任意节点的左右子树高度差不超过 1     |
| 二叉搜索树（BST） | 左子树所有节点值 < 根，右子树 > 根  |
| 堆（Heap）    | 特殊的完全二叉树（最大堆 / 最小堆）   |
| Trie（前缀树）  | 多叉树，常用于字符串匹配          |
| N 叉树       | 每个节点有 N 个子节点          |

---

## 🧪 三、树的常见操作（Java 模板）

```java
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int val) { this.val = val; }
}
```

---

## 🔁 四、树的遍历方式（超重要）

### ✅ 1. 递归方式（最常用）

* 前序遍历（Pre-order）：**根 → 左 → 右**
* 中序遍历（In-order）：**左 → 根 → 右**
* 后序遍历（Post-order）：**左 → 右 → 根**

```java
// 前序
void preorder(TreeNode root) {
    if (root == null) return;
    System.out.print(root.val);
    preorder(root.left);
    preorder(root.right);
}
```

---

### ✅ 2. 层序遍历（Level-order）

使用队列（BFS）实现

```java
void levelOrder(TreeNode root) {
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        TreeNode node = queue.poll();
        System.out.print(node.val);
        if (node.left != null) queue.offer(node.left);
        if (node.right != null) queue.offer(node.right);
    }
}
```

---

## 🧱 五、经典题型分类（LeetCode 热门）

### ✅ 简单题

| 题号  | 题目    | 技巧      |
| --- | ----- | ------- |
| 144 | 前序遍历  | 递归 / 栈  |
| 94  | 中序遍历  | 递归 / 栈  |
| 145 | 后序遍历  | 递归 / 双栈 |
| 104 | 最大深度  | DFS/BFS |
| 101 | 对称二叉树 | 双指针     |

---

### 🟡 中等题

| 题号  | 题目           | 技巧       |
| --- | ------------ | -------- |
| 102 | 层序遍历         | 队列       |
| 105 | 从前序中序构造二叉树   | 分治       |
| 230 | 二叉搜索树第 K 小元素 | 中序计数     |
| 236 | 最近公共祖先       | 后序 + 递归  |
| 199 | 二叉树右视图       | BFS 层尾取值 |

---

### 🔴 困难题

| 题号  | 题目       | 技巧             |
| --- | -------- | -------------- |
| 124 | 二叉树最大路径和 | 后序返回路径和        |
| 297 | 二叉树序列化   | DFS 或 BFS 编码解码 |
| 968 | 监控二叉树    | 动态规划           |
| 543 | 直径       | DFS 后序返回高度     |

---

## 🧰 六、核心解题技巧（面试必备）

| 技巧             | 描述                    |
| -------------- | --------------------- |
| **递归套路**       | 先写结束条件，再写左右递归逻辑       |
| **后序遍历用于收集信息** | 例如子树高度、路径、个数等         |
| **构建树的题目**     | 通常使用前序 + 中序，或中序 + 后序  |
| **BST 特性**     | 中序遍历是升序，可以用来剪枝、找第 k 小 |
| **双指针比较**      | 用于判断对称、镜像结构           |
| **DFS 返回多种信息** | 用数组或封装结构返回多个值         |

---

## 🧠 七、二叉搜索树（BST）专题技巧

| 操作           | 描述              |
| ------------ | --------------- |
| 查找 / 插入 / 删除 | 递归/迭代，左 < 根 < 右 |
| 查第 K 小       | 中序遍历计数          |
| 验证合法性        | 限定 min/max 范围   |

---

## ✨ 八、手写题模板（例：验证对称）

```java
public boolean isSymmetric(TreeNode root) {
    if (root == null) return true;
    return check(root.left, root.right);
}

private boolean check(TreeNode left, TreeNode right) {
    if (left == null && right == null) return true;
    if (left == null || right == null) return false;
    if (left.val != right.val) return false;
    return check(left.left, right.right) && check(left.right, right.left);
}
```

---

## 🧾 九、推荐刷题路径（树专项）

| 阶段 | 题目编号               | 内容              |
| -- | ------------------ | --------------- |
| 入门 | 94, 144, 145, 104  | 遍历、深度           |
| 进阶 | 101, 102, 105, 226 | 构建、镜像、层序        |
| 提升 | 124, 236, 230, 297 | 路径和、LCA、BST、序列化 |

---

## ✅ 总结一句话

> **树的本质是递归，重在后序收集信息，BST 是树中最重要的变体。掌握遍历、构建、搜索、动态规划是进阶关键。**

---

如果你想深入讲解某类题型、某道题的多种解法、或者出一个刷题计划表，我可以继续帮你详细整理～



* any list
{:toc}