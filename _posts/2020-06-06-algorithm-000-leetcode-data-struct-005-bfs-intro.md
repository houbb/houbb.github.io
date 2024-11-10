---
layout: post
title: leetcode 005 广度优先搜索（BFS，Breadth-First Search）
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, bfs, sf]
published: true
---

# chat

## BFS 是什么

### 广度优先搜索 (BFS) 介绍

**广度优先搜索（BFS，Breadth-First Search）** 是一种图形或树的遍历算法，它按照层次从上到下、从左到右逐层访问节点。

BFS 是一种典型的 **广度优先** 遍历方法，通常用于找最短路径、图的连通性分析、求解迷宫等问题。

#### BFS 的工作原理：

1. **从起始节点开始**，将其加入队列。

2. **重复以下过程**，直到队列为空：
   - 从队列中取出一个节点，并访问该节点。
   - 将该节点的所有未被访问的邻居节点加入队列。

3. **遍历过程是层次性的**，即每次扩展都会访问当前节点的所有直接邻居，然后是其邻居的邻居，依此类推。

**BFS** 保证了最先加入队列的节点会最先被访问（FIFO），它是典型的 **广度优先** 策略。

### BFS 的应用场景：

- **最短路径问题**：如图的最短路径、迷宫求解等。

- **层次遍历**：例如二叉树的层次遍历。

- **图的连通性问题**：判断图是否连通，找出图的连通分量。

### BFS 的常见数据结构：

- **队列**：由于 BFS 需要按顺序逐层访问节点，所以通常使用队列（FIFO）来存储节点。

---

### BFS 的模板方法（以图为例）

```java
import java.util.*;

public class BFS {
    
    // 图的表示：邻接表
    // 使用 Map 来表示图，其中键是节点，值是该节点的邻居节点的列表
    private Map<Integer, List<Integer>> graph = new HashMap<>();

    // 构建图（邻接表）
    public void addEdge(int u, int v) {
        graph.putIfAbsent(u, new ArrayList<>());
        graph.putIfAbsent(v, new ArrayList<>());
        graph.get(u).add(v);
        graph.get(v).add(u);  // 因为是无向图
    }

    // BFS 实现
    public void bfs(int start) {
        Set<Integer> visited = new HashSet<>(); // 记录已经访问过的节点
        Queue<Integer> queue = new LinkedList<>();
        
        // 从起始节点开始
        visited.add(start);
        queue.offer(start);
        
        while (!queue.isEmpty()) {
            int node = queue.poll(); // 获取队首元素
            System.out.print(node + " "); // 访问该节点
            
            // 遍历所有邻居节点
            for (int neighbor : graph.get(node)) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);  // 标记该邻居已访问
                    queue.offer(neighbor);  // 将邻居加入队列
                }
            }
        }
    }
    
    public static void main(String[] args) {
        BFS bfs = new BFS();
        bfs.addEdge(1, 2);
        bfs.addEdge(1, 3);
        bfs.addEdge(2, 4);
        bfs.addEdge(2, 5);
        bfs.addEdge(3, 6);
        
        System.out.println("BFS Traversal starting from node 1:");
        bfs.bfs(1);  // 输出：1 2 3 4 5 6
    }
}
```

### 解释：
1. **图的表示**：在这里使用邻接表（`Map<Integer, List<Integer>>`）来表示图。`graph` 中的每个键表示一个节点，值是该节点的所有邻居节点。
2. **队列**：BFS 使用队列（`Queue<Integer> queue`）来存储待访问的节点，确保节点按顺序被访问。
3. **标记已访问节点**：为了防止重复访问节点，使用 `Set<Integer> visited` 来记录已访问的节点。
4. **遍历过程**：
   - 从起始节点 `start` 开始，将其加入队列，并标记为已访问。
   - 每次从队列中取出一个节点，访问该节点。
   - 将该节点的所有未被访问的邻居加入队列并标记为已访问，继续遍历下一个节点。

---

### BFS 变种：

BFS 可以根据不同的问题需求进行变种，以下是一些常见的变种：

#### 1. **寻找最短路径：**

BFS 是寻找无权图中从起点到终点的最短路径的标准算法。

在这个过程中，我们不仅需要记录每个节点是否被访问，还需要记录每个节点的父节点，以便在遍历结束时回溯最短路径。

```java
public List<Integer> bfsShortestPath(int start, int target) {
    Map<Integer, Integer> parentMap = new HashMap<>(); // 记录每个节点的父节点
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> queue = new LinkedList<>();
    
    visited.add(start);
    queue.offer(start);
    
    while (!queue.isEmpty()) {
        int node = queue.poll();
        
        if (node == target) {
            List<Integer> path = new ArrayList<>();
            while (node != start) {
                path.add(node);
                node = parentMap.get(node); // 回溯父节点
            }
            path.add(start);
            Collections.reverse(path);
            return path;
        }
        
        for (int neighbor : graph.get(node)) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);
                queue.offer(neighbor);
                parentMap.put(neighbor, node); // 记录父节点
            }
        }
    }
    return null; // 没有找到路径
}
```

#### 2. **多源 BFS**：
BFS 还可以从多个起点同时开始。我们可以将多个起点都加入队列，然后一起进行层次遍历。

```java
public void multiSourceBFS(List<Integer> starts) {
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> queue = new LinkedList<>();
    
    // 将所有起点加入队列
    for (int start : starts) {
        visited.add(start);
        queue.offer(start);
    }
    
    while (!queue.isEmpty()) {
        int node = queue.poll();
        System.out.print(node + " ");
        
        for (int neighbor : graph.get(node)) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);
                queue.offer(neighbor);
            }
        }
    }
}
```

---

### 总结

BFS 是一种广泛应用的图遍历算法，其核心思想是使用队列进行逐层遍历，并通过标记已访问节点避免重复访问。

它常用于解决最短路径、层次遍历、图的连通性等问题。

其时间复杂度为 `O(V + E)`，其中 `V` 是节点数，`E` 是边数。

* any list
{:toc}