---
layout: post
title: leetcode offline-query-optimize 离线查询优化-03-并查集（Disjoint Set Union, DSU）
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, offline-query-optimize, sf]
published: true
---


# chat


## 详细介绍一下 并查集

### 并查集（Disjoint Set Union, DSU）详解

**并查集**是一种树型数据结构，用于处理**动态连通性问题**，例如：
- 判断两个元素是否在同一集合中。
- 合并两个集合。

并查集广泛应用于图的连通性、最小生成树（如 Kruskal 算法）、动态连通性问题等。

---

### 基本思想

并查集将集合表示为**一棵森林**，其中每个集合是由一棵树表示：
1. **每个节点指向它的父节点**，通过找到根节点来判断集合。
2. **根节点的父节点指向自身**，表明它是集合的代表。

---

### 并查集的核心操作

#### 1. **Find（查找）**
找到一个元素所属集合的代表（根节点）。

- 初始状态下，每个元素是它自己的代表。
- 查找时沿路径向上，最终找到根节点。

#### 2. **Union（合并）**
将两个集合合并为一个集合。

- 合并时，选择一个集合的根作为新集合的代表。
- 通常通过优化（如按秩合并）来减少树的高度，从而提高效率。

#### 3. **路径压缩（Path Compression）**
在查找的过程中将访问路径上的每个节点直接连接到根节点，从而大幅降低树的高度。

---

### 时间复杂度

使用路径压缩和按秩合并的优化后：
- 单次操作的时间复杂度为**近似常数** \( O(\alpha(N)) \)，其中 \( \alpha \) 是反阿克曼函数，增长极其缓慢。

---

### 实现并查集的步骤

#### 1. 初始化
每个元素的父节点指向自身。

#### 2. 查找（Find）
查找元素的根节点，并进行路径压缩。

#### 3. 合并（Union）
将两个集合合并，通过按秩优化决定哪棵树作为另一棵的子树。

---

### Java 实现

以下是完整的并查集实现代码：

```java
public class UnionFind {
    private int[] parent;  // 每个节点的父节点
    private int[] rank;    // 每棵树的秩（近似树的高度）

    // 初始化并查集
    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i; // 每个节点的初始父节点是它自己
            rank[i] = 1;   // 初始秩为1
        }
    }

    // 查找根节点（路径压缩优化）
    public int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]); // 路径压缩
        }
        return parent[x];
    }

    // 合并两个集合（按秩合并优化）
    public void union(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);

        if (rootX != rootY) {
            if (rank[rootX] > rank[rootY]) {
                parent[rootY] = rootX; // 根秩高的作为根
            } else if (rank[rootX] < rank[rootY]) {
                parent[rootX] = rootY;
            } else {
                parent[rootY] = rootX; // 秩相等时，任意选择一个作为根
                rank[rootX]++;         // 增加新根的秩
            }
        }
    }

    // 判断两个元素是否在同一集合中
    public boolean isConnected(int x, int y) {
        return find(x) == find(y);
    }

    // 示例测试
    public static void main(String[] args) {
        UnionFind uf = new UnionFind(10); // 创建一个10个元素的并查集

        uf.union(1, 2);
        uf.union(2, 3);
        uf.union(4, 5);

        System.out.println(uf.isConnected(1, 3)); // 输出 true
        System.out.println(uf.isConnected(1, 4)); // 输出 false

        uf.union(3, 5);
        System.out.println(uf.isConnected(1, 4)); // 输出 true
    }
}
```

---

### 代码详解

1. **初始化**：
   - 每个元素的父节点初始化为自己。
   - 每棵树的秩初始化为 1。

2. **Find 操作**：
   - 通过递归路径压缩，直接将路径上的每个节点指向根节点。

3. **Union 操作**：
   - 找到两个集合的根节点。
   - 按秩合并，选择高度小的树作为高度大的树的子树。

4. **isConnected 操作**：
   - 判断两个元素是否属于同一个集合，实质是比较它们的根节点。

---

### 优化分析

1. **路径压缩**：
   - 通过路径压缩将树的高度降至近似常数。
   - 最差情况下复杂度为 \( O(\log N) \)，优化后接近 \( O(1) \)。

2. **按秩合并**：
   - 合并时总是将秩较小的树接到秩较大的树下，避免不必要的高度增长。

---

### 并查集的常见应用

#### 1. 图的连通性
- 判断无向图是否连通。
- 动态添加边并检查连通性。

#### 2. Kruskal 算法
- 用于求解最小生成树，检测边的连通性。

#### 3. 网络连接问题
- 动态添加连接并检查网络连通状态。

#### 4. 动态分组问题
- 在动态合并分组时保持高效。

#### 5. 冲突检测
- 检测是否存在矛盾（如判断二分图、判断不等式矛盾）。

---

### 示例应用：判断图的连通性

问题：给定一个图，判断是否所有节点连通。

```java
public class GraphConnectivity {
    public static boolean isConnected(int n, int[][] edges) {
        UnionFind uf = new UnionFind(n);

        // 合并所有边
        for (int[] edge : edges) {
            uf.union(edge[0], edge[1]);
        }

        // 检查所有节点是否属于同一集合
        int root = uf.find(0);
        for (int i = 1; i < n; i++) {
            if (uf.find(i) != root) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        int n = 5; // 节点数
        int[][] edges = {
            {0, 1},
            {1, 2},
            {3, 4}
        };

        System.out.println(isConnected(n, edges)); // 输出 false
    }
}
```

---

### 总结

#### 优点
- 并查集操作非常高效，单次操作时间复杂度接近 O(1)。
- 实现简单，适合解决动态连通性问题。

#### 缺点
- 只适合处理等价类问题。
- 不支持复杂的动态查询（如加权合并）。

通过掌握并查集的基础知识和优化技巧，可以解决许多涉及动态连通性的复杂问题。

* any list
{:toc}