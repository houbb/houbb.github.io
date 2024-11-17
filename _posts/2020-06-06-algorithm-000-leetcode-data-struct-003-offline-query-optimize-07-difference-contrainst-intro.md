---
layout: post
title: leetcode offline-query-optimize 离线查询优化-07-difference-constraints 差分约束
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, offline-query-optimize, sf]
published: true
---


# chat


## 详细介绍一下 差分约束

### 什么是差分约束？

差分约束是一种数学模型，用于解决线性不等式形式的问题。其一般形式为：

```
xj - xi <= c
```

其中：
- `xi` 和 `xj` 是变量。
- `c` 是常数。

差分约束问题的目标是：
1. 判断是否存在一组变量值使所有不等式成立。
2. 如果存在解，求出这些变量的最小值或最大值。

---

### 常见应用场景

1. **最短路径问题**：每条边的权重表示 `xj - xi <= c`。
2. **调度问题**：确保任务按依赖顺序执行。
3. **范围限定问题**：如限制变量的上下界 `0 <= xi <= 10`。

---

### 差分约束的建模

差分约束可以通过构造**加权有向图**解决：
1. 每个变量 `xi` 对应图中的一个顶点。
2. 不等式 `xj - xi <= c` 转换为从顶点 `i` 指向顶点 `j` 的一条边，权值为 `c`。

### 解决方法

差分约束问题可以通过 **最短路径算法** 求解（如 Bellman-Ford 或 SPFA）。

---

### 代码实现（Java）

下面是使用 Bellman-Ford 算法解决差分约束的完整代码。

#### Java代码

```java
import java.util.*;

public class DifferenceConstraints {
    static class Edge {
        int from, to, weight;

        public Edge(int from, int to, int weight) {
            this.from = from;
            this.to = to;
            this.weight = weight;
        }
    }

    public static boolean solveDifferenceConstraints(int n, List<Edge> edges) {
        // n 是变量数量, edges 是差分约束的边
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[0] = 0; // 虚拟源点

        // Bellman-Ford算法
        for (int i = 0; i <= n; i++) { // 进行 n 次松弛
            for (Edge edge : edges) {
                if (dist[edge.from] != Integer.MAX_VALUE && dist[edge.to] > dist[edge.from] + edge.weight) {
                    dist[edge.to] = dist[edge.from] + edge.weight;
                }
            }
        }

        // 检测负环
        for (Edge edge : edges) {
            if (dist[edge.from] != Integer.MAX_VALUE && dist[edge.to] > dist[edge.from] + edge.weight) {
                return false; // 存在负环，无解
            }
        }

        // 如果需要输出变量的值，dist 数组即为解
        System.out.println("Variable values: " + Arrays.toString(dist));
        return true;
    }

    public static void main(String[] args) {
        int n = 3; // 变量数量
        List<Edge> edges = new ArrayList<>();

        // 构建差分约束: x2 - x1 <= 4, x3 - x2 <= 3, x1 - x3 <= -2
        edges.add(new Edge(1, 2, 4));  // x2 - x1 <= 4
        edges.add(new Edge(2, 3, 3));  // x3 - x2 <= 3
        edges.add(new Edge(3, 1, -2)); // x1 - x3 <= -2

        // 添加虚拟源点的约束
        for (int i = 1; i <= n; i++) {
            edges.add(new Edge(0, i, 0)); // 虚拟源点到每个点，权值为 0
        }

        if (solveDifferenceConstraints(n, edges)) {
            System.out.println("The constraints have a solution.");
        } else {
            System.out.println("The constraints do not have a solution.");
        }
    }
}
```

---

### 示例说明

#### 输入约束

1. `x2 - x1 <= 4`
2. `x3 - x2 <= 3`
3. `x1 - x3 <= -2`

#### 输出
如果有解，程序会打印变量值。例如：
```
Variable values: [0, 1, 5, 8]
```

#### 如果无解
加入一个矛盾约束，例如 `x1 - x3 <= -8`，则程序会输出：
```
The constraints do not have a solution.
```

---

### 算法解析

#### Bellman-Ford步骤：
1. 初始化所有变量的距离为正无穷，虚拟源点为 `0`。
2. 松弛所有边共 `n` 次，尝试更新最短路径。
3. 检查是否存在负权环，如果有则说明无解。

#### 时间复杂度：
1. 构造图：\(O(E)\)，其中 \(E\) 是不等式数量。
2. Bellman-Ford算法：\(O(V \times E)\)，其中 \(V\) 是变量数量。

---

### 总结

1. 差分约束可以通过最短路径问题建模，尤其适合线性不等式问题。
2. Bellman-Ford算法适合检测解的存在性和负环，SPFA可以优化求解效率。
3. 若解存在，结果存储在距离数组中，表示变量的最优解。


* any list
{:toc}