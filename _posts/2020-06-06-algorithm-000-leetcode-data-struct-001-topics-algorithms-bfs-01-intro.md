---
layout: post
title: leetcode 算法篇专题之广度优先遍历 BFS Breadth-First Search 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, bfs, sf]
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

# 算法篇

动态规划-记忆化搜索

递归

二分查找

DFS 深度优先遍历

BFS 广度优先遍历

回溯

贪心

分治：快排、归并

# chat

## 详细介绍一下力扣算法之广度优先遍历

下面是对 LeetCode（力扣）中 **广度优先遍历（BFS, Breadth-First Search）** 的系统讲解，包括它的原理、模板、应用场景、典型题型和与 DFS 的对比，帮助你从入门到掌握。

## 🌊 一、什么是广度优先遍历（BFS）？

> BFS 是一种**层层推进**的搜索策略，先访问当前节点的所有邻居，再访问邻居的邻居，依此类推。

就像**一圈圈扩散的水波**：从源点开始，先“扫一层”，再“扫下一层”。

---

## 🔁 二、BFS 的基本原理

* 使用 **队列（Queue）** 来保证先入先出，逐层遍历。
* 适合解决“最短路径”类问题，或者按层访问节点的问题。
* BFS 是一种**非递归**方式，主要用**循环 + 队列**实现。

---

## 🧩 三、BFS 模板写法

### ✅ 通用写法（图、网格、树都通用）

```java
Queue<Node> queue = new LinkedList<>();
Set<Node> visited = new HashSet<>();

queue.offer(start);
visited.add(start);

while (!queue.isEmpty()) {
    int size = queue.size(); // 当前层所有节点
    for (int i = 0; i < size; i++) {
        Node cur = queue.poll();
        // 处理当前节点

        for (Node neighbor : cur.neighbors) {
            if (!visited.contains(neighbor)) {
                queue.offer(neighbor);
                visited.add(neighbor);
            }
        }
    }
}
```

---

## 🛠 四、BFS 应用场景

| 场景       | 描述            | 示例题目                                                                            |
| -------- | ------------- | ------------------------------------------------------------------------------- |
| ✅ 最短路径   | 从起点到终点的最少步数   | [127. 单词接龙](https://leetcode.cn/problems/word-ladder)                           |
| ✅ 图遍历    | 判断图是否连通 / 二分图 | [785. 判断二分图](https://leetcode.cn/problems/is-graph-bipartite)                   |
| ✅ 网格搜索   | 找到最短路径 / 感染传播 | [994. 腐烂的橘子](https://leetcode.cn/problems/rotting-oranges)                      |
| ✅ 树的层序遍历 | 打印每一层的节点      | [102. 二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal) |
| ✅ 多源 BFS | 多个起点同时向外扩散    | [752. 打开转盘锁](https://leetcode.cn/problems/open-the-lock)                        |

---

## 📘 五、力扣常见 BFS 模板题

### ✅ 1. 最基础：树的层序遍历

* **题目：** [102. 二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal)
* **特点：** BFS 的最典型场景

```java
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    if (root == null) return res;

    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);

    while (!queue.isEmpty()) {
        int size = queue.size();
        List<Integer> level = new ArrayList<>();

        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);

            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }

        res.add(level);
    }
    return res;
}
```

---

### ✅ 2. 网格最短路径：经典 BFS

* **题目：** [1091. 二进制矩阵中的最短路径](https://leetcode.cn/problems/shortest-path-in-binary-matrix)
* **描述：** 从起点走到终点，求最少步数
* **技巧：** 使用 `int[][] dirs = [{1,0}, {-1,0}, {0,1}, {0,-1}...]` 来处理方向

---

### ✅ 3. 字符串变换类

* **题目：** [752. 打开转盘锁](https://leetcode.cn/problems/open-the-lock)
* **解法：** 枚举出当前状态的下一步所有状态，加入队列

---

## 💡 六、BFS 的典型变种

| 变种      | 描述                  | 示例            |
| ------- | ------------------- | ------------- |
| 多源 BFS  | 多个起点同时扩散            | 烂橘子、墙与门       |
| 双向 BFS  | 从起点和终点同时开始          | 打开转盘锁、单词接龙    |
| 分层 BFS  | 每层用 for 循环处理，便于统计层数 | 树层序遍历、求最短路径步数 |
| 状态型 BFS | 每个状态是字符串、整数、数组等     | 单词变换、八数码      |

---

## 🧠 七、常见错误 & 小技巧

| 问题           | 说明            |
| ------------ | ------------- |
| 忘记标记 visited | 会造成死循环或 TLE   |
| 重复入队         | 也会超时，注意判重     |
| 没有按层处理       | 求最短路径等问题会出错   |
| 多维坐标处理错误     | 网格要写对 `dx/dy` |

---

## 🔍 八、DFS vs BFS 对比

| 比较点   | DFS        | BFS         |
| ----- | ---------- | ----------- |
| 实现方式  | 递归 / 栈     | 队列          |
| 搜索方式  | 一条路走到底     | 一圈一圈扩散      |
| 应用场景  | 构造所有解 / 回溯 | 最短路径 / 按层访问 |
| 空间复杂度 | 递归栈        | 队列存储        |

---

## 📚 九、LeetCode 高频 BFS 题推荐

| 分类      | 题目编号 | 题目链接                                                                       |
| ------- | ---- | -------------------------------------------------------------------------- |
| 🔹树层序遍历 | 102  | [二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal) |
| 🔹最短路径  | 752  | [打开转盘锁](https://leetcode.cn/problems/open-the-lock)                        |
| 🔹图遍历   | 785  | [判断二分图](https://leetcode.cn/problems/is-graph-bipartite)                   |
| 🔹网格路径  | 994  | [腐烂的橘子](https://leetcode.cn/problems/rotting-oranges)                      |
| 🔹图搜索   | 127  | [单词接龙](https://leetcode.cn/problems/word-ladder)                           |

* any list
{:toc}