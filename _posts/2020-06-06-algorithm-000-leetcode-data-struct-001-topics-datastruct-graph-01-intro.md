---
layout: post
title: leetcode 算法篇专题之图 graph 01-入门介绍
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, graph, sf]
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

## 详细介绍一下力扣数据结构之图

在力扣（LeetCode）中，**图（Graph）** 是高级又常见的数据结构，涉及到大量的**搜索、路径、连通性、拓扑、最短路**等问题。

很多面试高频题（如岛屿数量、课程表、最短路径等）都可以建模为图问题。

---

## 🔧 一、图的基本定义

图是一组节点（顶点）和连接这些节点的边的集合。

### 图的分类：

| 类型   | 说明              |
| ---- | --------------- |
| 有向图  | 边有方向，从一个节点指向另一个 |
| 无向图  | 边没有方向，两个节点互为邻居  |
| 带权图  | 边带有权值（如距离、费用等）  |
| 不带权图 | 边只有连接关系，没有数值    |
| 稀疏图  | 边较少             |
| 稠密图  | 边接近最多可能数量       |
| 连通图  | 任意两个点间至少存在一条路径  |

---

## 📦 二、图的存储方式

### 1. 邻接表（最常用）

```java
Map<Integer, List<Integer>> graph = new HashMap<>();
```

* 节省空间，适合稀疏图
* 常用于 DFS、BFS、Dijkstra 等算法

### 2. 邻接矩阵（二维数组）

```java
int[][] matrix = new int[n][n];
```

* 快速判断两点是否有边
* 空间占用大，适合稠密图或 Floyd 算法

---

## 🔍 三、图的遍历

### ✅ 深度优先搜索（DFS）

递归或栈，适合路径搜索、连通分量、拓扑排序等。

```java
void dfs(int node) {
    visited[node] = true;
    for (int nei : graph.get(node)) {
        if (!visited[nei]) dfs(nei);
    }
}
```

### ✅ 广度优先搜索（BFS）

队列，适合求最短路径、分层遍历等。

```java
Queue<Integer> queue = new LinkedList<>();
queue.offer(start);
while (!queue.isEmpty()) {
    int cur = queue.poll();
    for (int nei : graph.get(cur)) {
        if (!visited[nei]) {
            visited[nei] = true;
            queue.offer(nei);
        }
    }
}
```

---

## 🧠 四、力扣常见题型

| 分类     | 题目                                                                        | 解法         |
| ------ | ------------------------------------------------------------------------- | ---------- |
| 图遍历    | [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/)              | DFS/BFS    |
| 拓扑排序   | [207. 课程表](https://leetcode.cn/problems/course-schedule/)                 | DFS/BFS 拓扑 |
| 最短路径   | [743. 网络延迟时间](https://leetcode.cn/problems/network-delay-time/)           | Dijkstra   |
| 多源 BFS | [994. 腐烂的橘子](https://leetcode.cn/problems/rotting-oranges/)               | BFS        |
| 联通分量   | [547. 省份数量](https://leetcode.cn/problems/number-of-provinces/)            | 并查集        |
| 有向图检测环 | [802. 找到最终的安全状态](https://leetcode.cn/problems/find-eventual-safe-states/) | 拓扑排序       |

---

## ✨ 五、高级算法（图相关）

### 1. 拓扑排序

适用于有向无环图（DAG）

* 用于检测环、任务依赖执行顺序
* 典型题：207、210

```java
// BFS 拓扑排序
Queue<Integer> queue = new LinkedList<>();
int[] inDegree = new int[n]; // 入度
for (int i = 0; i < n; i++) {
    if (inDegree[i] == 0) queue.offer(i);
}
```

---

### 2. 最短路径算法

| 算法             | 场景           | 时间复杂度      |
| -------------- | ------------ | ---------- |
| Dijkstra       | 单源最短路径（边权非负） | O(E log V) |
| Bellman-Ford   | 边权可负，检测负环    | O(VE)      |
| Floyd-Warshall | 所有点对最短路径     | O(V³)      |

---

### 3. 并查集（Union Find）

* 检测图中是否连通、判断环
* 常用于连通块问题，如 547

```java
int[] parent = new int[n];
int find(int x) {
    if (x != parent[x]) parent[x] = find(parent[x]);
    return parent[x];
}
void union(int a, int b) {
    parent[find(a)] = find(b);
}
```

---

## 🔧 六、图建模常见技巧

| 场景      | 建模方式              |
| ------- | ----------------- |
| 2D 网格图  | 把每个格子当作节点，方向数组构建边 |
| 字符串变换类  | 单词之间能互相转换就建边      |
| 课程依赖    | 课程是节点，依赖关系是有向边    |
| 多起点同时扩散 | 多源 BFS            |

---

## 🔍 七、典型例题详解

### 示例：力扣 207. 课程表（拓扑排序）

```java
public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<Integer>[] graph = new ArrayList[numCourses];
    int[] inDegree = new int[numCourses];
    for (int i = 0; i < numCourses; i++) graph[i] = new ArrayList<>();
    
    for (int[] p : prerequisites) {
        graph[p[1]].add(p[0]);
        inDegree[p[0]]++;
    }
    
    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < numCourses; i++)
        if (inDegree[i] == 0) queue.offer(i);
    
    int count = 0;
    while (!queue.isEmpty()) {
        int cur = queue.poll();
        count++;
        for (int next : graph[cur]) {
            if (--inDegree[next] == 0) queue.offer(next);
        }
    }
    return count == numCourses;
}
```

---

## 📚 八、图题模板总结（Java）

| 模板       | 说明               |
| -------- | ---------------- |
| DFS      | 递归搜索，常用于岛屿、路径    |
| BFS      | 队列层序，常用于最短路、腐烂橘子 |
| 拓扑排序     | 入度表 + 队列         |
| Dijkstra | 最短路径 + 优先队列      |
| 并查集      | 连通块合并判断          |

---

## ✅ 九、总结

| 重点知识   | 说明                 |
| ------ | ------------------ |
| 图表示方式  | 邻接表最常用             |
| 图遍历算法  | DFS、BFS            |
| 拓扑排序   | 判断是否有环             |
| 最短路径   | Dijkstra、BFS、Floyd |
| 图题抽象建模 | 把题意转化为图结构是关键       |


* any list
{:toc}