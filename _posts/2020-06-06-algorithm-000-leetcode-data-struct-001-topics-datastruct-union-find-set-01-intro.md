---
layout: post
title: leetcode 进阶数据结构篇专题之 并查集（Union-Find Set / Disjoint Set Union, DSU） 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, union-find-set, sf]
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

queue 队列

ordered set 有序集合

heap  堆

graph 图


## 进阶

并查集

字典树

线段树

树状数组

后缀数组

# chat

https://leetcode.cn/studyplan/top-100-liked/

## 详细介绍一下力扣数据结构之并查集

当然可以！在力扣（LeetCode）中，**并查集（Union-Find Set / Disjoint Set Union, DSU）** 是一个非常重要的数据结构，常用于解决 **集合合并**、**连通性判断** 等问题。

它在**图论**中尤其常见，特别适合处理“**是否在一个集合里**”“**连通块个数**”“**是否成环**”等问题。

---

## 🔧 一、并查集是什么？

**并查集是一种支持如下两种操作的数据结构：**

1. `find(x)`：查找元素 `x` 所属的集合（返回代表元素/根节点）
2. `union(x, y)`：将 `x` 和 `y` 所在的两个集合合并为一个

我们把每个集合表示为一棵树，用数组 `parent[i]` 记录第 `i` 个节点的父节点，根节点满足 `parent[x] == x`。

---

## 🧠 二、并查集的核心思想

1. 初始时，每个节点是一个独立集合（自己是自己的根）
2. 合并两个集合时，把一个根节点指向另一个
3. 查询某个节点所在集合时，通过递归找到它的根节点

---

## 🚀 三、两大优化技巧（高频面试知识）

### ✅ 1. 路径压缩（Path Compression）

在 `find(x)` 的过程中，让每个节点直接挂到根节点下面，加速后续查询。

```java
int find(int x) {
    if (x != parent[x]) {
        parent[x] = find(parent[x]); // 路径压缩
    }
    return parent[x];
}
```

### ✅ 2. 按秩合并 / 按大小合并（Union by Rank/Size）

把小树挂到大树下面，减少树的高度。

```java
// 以 size 为例
int[] size = new int[n];

void union(int x, int y) {
    int rootX = find(x), rootY = find(y);
    if (rootX == rootY) return;
    if (size[rootX] < size[rootY]) {
        parent[rootX] = rootY;
        size[rootY] += size[rootX];
    } else {
        parent[rootY] = rootX;
        size[rootX] += size[rootY];
    }
}
```

> 加上路径压缩 + 按秩合并后，`find` 和 `union` 的 **时间复杂度几乎是常数**，严格来说是 **O(α(n))**，α 是反阿克曼函数，非常慢增长。

---

## 📚 四、典型应用场景

| 场景     | 说明              | 力扣题目                                                                             |
| ------ | --------------- | -------------------------------------------------------------------------------- |
| 连通块个数  | 判断有多少个独立区域      | [547. 省份数量](https://leetcode.cn/problems/number-of-provinces/)                   |
| 判断是否成环 | 如果两个点已连通，再连就会成环 | [684. 冗余连接](https://leetcode.cn/problems/redundant-connection/)                  |
| 动态岛屿数量 | 不断添加点，统计连通区域数量  | [305. 岛屿的个数](https://leetcode.cn/problems/number-of-islands-ii/)                 |
| 最小生成树  | Kruskal 算法的核心工具 | [1584. 连接所有点的最小费用](https://leetcode.cn/problems/min-cost-to-connect-all-points/) |
| 社交圈分组  | 多人关系合并成集合       | [399. 除法求值（进阶建图题）](https://leetcode.cn/problems/evaluate-division/)（可用并查集+权重）    |

---

## 🧩 五、Java 并查集模板代码（推荐背熟）

```java
class UnionFind {
    int[] parent;
    int[] size;

    public UnionFind(int n) {
        parent = new int[n];
        size = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i; // 每个点是自己的父节点
            size[i] = 1;   // 每个集合大小初始为 1
        }
    }

    public int find(int x) {
        if (x != parent[x]) {
            parent[x] = find(parent[x]); // 路径压缩
        }
        return parent[x];
    }

    public boolean union(int x, int y) {
        int rootX = find(x), rootY = find(y);
        if (rootX == rootY) return false;

        // 小树合并到大树
        if (size[rootX] < size[rootY]) {
            parent[rootX] = rootY;
            size[rootY] += size[rootX];
        } else {
            parent[rootY] = rootX;
            size[rootX] += size[rootY];
        }
        return true;
    }
}
```

---

## 🔍 六、LeetCode 经典题型解析

### ✅ 1. [547. 省份数量（等价于图中连通块）](https://leetcode.cn/problems/number-of-provinces/)

```java
public int findCircleNum(int[][] isConnected) {
    int n = isConnected.length;
    UnionFind uf = new UnionFind(n);
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (isConnected[i][j] == 1) {
                uf.union(i, j);
            }
        }
    }
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (uf.find(i) == i) count++;
    }
    return count;
}
```

---

## ✨ 七、并查集 VS DFS/BFS

| 特性            | 并查集         | DFS/BFS  |
| ------------- | ----------- | -------- |
| 连通性判断         | ✅ 快速合并 & 查询 | ❌ 每次都得遍历 |
| 动态加入边         | ✅ 高效        | ❌ 低效     |
| 圈检测           | ✅ 方便        | ❌ 较难     |
| 可扩展性（带权、合并信息） | ✅ 可定制       | ❌ 不易拓展   |

---

## 🧠 八、进阶变种

| 类型        | 描述                     |
| --------- | ---------------------- |
| 带权并查集     | 节点间带有权重，维护相对关系（如除法、距离） |
| 可撤销并查集    | 常用于回溯（如线段树分治）          |
| 可持久化并查集   | 历史版本维护                 |
| 并查集维护额外信息 | 例如维护集合大小、最小值、最大值等      |

---

## ✅ 九、总结

| 操作              | 时间复杂度   |
| --------------- | ------- |
| 初始化             | O(n)    |
| 合并两个集合（`union`） | 近乎 O(1) |
| 查找代表元素（`find`）  | 近乎 O(1) |

并查集因其**结构简单、效率高**，是很多图问题（特别是判断连通性、成环问题）的首选解决方案。

* any list
{:toc}