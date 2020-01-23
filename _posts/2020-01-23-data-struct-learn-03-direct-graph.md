---
layout: post
title: java 实现有向图(Direct Graph)
date:  2020-1-23 10:09:32 +0800
categories: [Data-Struct]
tags: [data-struct, java, sh]
published: true
---

# 基本概念

# 图

图是数据结构中最为复杂的一种，我在上大学的时候，图的这一章会被老师划到考试范围之外，作为我们的课后兴趣部分。

但实际上，图在信息化社会中的应用非常广泛。图主要包括：

- 无向图，结点的简单连接

- 有向图，连接有方向性

- 加权图，连接带有权值

- 加权有向图，连接既有方向性，又带有权值

图是由一组顶点和一组能够将两个顶点相连的边组成。

常见的地图，电路，网络等都是图的结构。

## 术语

顶点：图中的一个点

边：连接两个顶点的线段叫做边，edge

相邻的：一个边的两头的顶点称为是相邻的顶点

度数：由一个顶点出发，有几条边就称该顶点有几度，或者该顶点的度数是几，degree

路径：通过边来连接，按顺序的从一个顶点到另一个顶点中间经过的顶点集合

简单路径：没有重复顶点的路径

环：至少含有一条边，并且起点和终点都是同一个顶点的路径

简单环：不含有重复顶点和边的环

连通的：当从一个顶点出发可以通过至少一条边到达另一个顶点，我们就说这两个顶点是连通的

连通图：如果一个图中，从任意顶点均存在一条边可以到达另一个任意顶点，我们就说这个图是个连通图

无环图：是一种不包含环的图

稀疏图：图中每个顶点的度数都不是很高，看起来很稀疏

稠密图：图中的每个顶点的度数都很高，看起来很稠密

二分图：可以将图中所有顶点分为两部分的图

所以**树其实就是一种无环连通图。**

# 有向图

有向图是一幅有方向性的图，由一组顶点和有向边组成。

所以，大白话来讲，有向图是包括箭头来代表方向的。

常见的例如食物链，网络通信等都是有向图的结构。

## 术语

上面我们介绍了顶点的度数，在有向图中，顶点被细分为了：

出度：由一个顶点出发的边的总数

入度：指向一个顶点的边的总数

接着，由于有向图的方向性，一条边的出发点称为头，指向点称为尾。

有向路径：图中的一组顶点可以满足从其中任意一个顶点出发，都存在一条有向边指向这组顶点中的另一个。

有向环：至少含有一条边的起点和终点都是同一个顶点的一条有向路径。

简单有向环：一条不含有重复顶点和边的环。

路径或环的长度就是他们包含的边数。

图的连通性在有向图中表现为可达性，由于边的方向性，可达性必须是通过顶点出发的边的正确方向，与另一个顶点可连通。

## 邻接表数组

可表示图的数据类型，意思就是如何通过一个具体的文件内容，来表示出一幅图的所有顶点，以及顶点间的边。

邻接表数组，以顶点为索引（注意顶点没有权值，只有顺序，因此是从0开始的顺序值），其中每个元素都是和该顶点相邻的顶点列表。

```
5 vertices, 3 edges
0: 4 1
1: 0
2:
3:
4:
```

# java 代码实现

## 接口定义

```java
package com.github.houbb.data.struct.core.util.graph;

import com.github.houbb.data.struct.core.util.graph.component.Edge;

/**
 * 有向图接口
 * 对于定点+边的操作：
 * （1）增加
 * （2）删除
 * （3）获取
 *
 * @author binbin.hou
 * @since 0.0.2
 */
public interface IDirectGraph<V> {

    /**
     * 新增顶点
     * @param v 顶点
     * @since 0.0.2
     */
    void addVertex(final V v);

    /**
     * 删除顶点
     * @param v 顶点
     * @since 0.0.2
     * @return 是否删除成功
     */
    boolean removeVertex(final V v);

    /**
     * 获取顶点
     * @param index 下标
     * @since 0.0.2
     * @return 返回顶点信息
     */
    V getVertex(final int index);

    /**
     * 新增边
     * @param edge 边
     * @since 0.0.2
     */
    void addEdge(final Edge<V> edge);

    /**
     * 移除边
     * @param edge 边信息
     * @since 0.0.2
     */
    boolean removeEdge(final Edge<V> edge);

    /**
     * 获取边信息
     * @param from 开始节点
     * @param to 结束节点
     * @since 0.0.2
     */
    Edge<V> getEdge(final int from, final int to);

}
```

- 边类定义

```java
package com.github.houbb.data.struct.core.util.graph.component;

import java.util.Objects;

/**
 * 边的信息
 * @author binbin.hou
 * @since 0.0.2
 */
public class Edge<V> {

    /**
     * 开始节点
     * @since 0.0.2
     */
    private V from;

    /**
     * 结束节点
     * @since 0.0.2
     */
    private V to;

    /**
     * 权重
     * @since 0.0.2
     */
    private double weight;

    public Edge(V from, V to) {
        this.from = from;
        this.to = to;
    }

    public V getFrom() {
        return from;
    }

    public void setFrom(V from) {
        this.from = from;
    }

    public V getTo() {
        return to;
    }

    public void setTo(V to) {
        this.to = to;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    @Override
    public String toString() {
        return "Edge{" +
                "from=" + from +
                ", to=" + to +
                ", weight=" + weight +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Edge<?> edge = (Edge<?>) o;
        return Double.compare(edge.weight, weight) == 0 &&
                Objects.equals(from, edge.from) &&
                Objects.equals(to, edge.to);
    }

    @Override
    public int hashCode() {
        return Objects.hash(from, to, weight);
    }
}
```

- 一个节点的完整信息

一个节点是有一个图的顶点+对应的边信息组成的。

```java
package com.github.houbb.data.struct.core.util.graph.component;

import com.github.houbb.heaven.util.guava.Guavas;

import java.util.Iterator;
import java.util.Set;

/**
 * 完整的节点信息：
 *
 * （1）顶点
 * （2）边
 *
 * 二者的集合。
 *
 *
 * @author binbin.hou
 * @since 0.0.2
 */
public class GraphNode<V> {

    /**
     * 顶点信息
     * @since 0.0.2
     */
    private V vertex;

    /**
     * 以此顶点为起点的边的集合，是一个列表，列表的每一项是一条边
     *
     * （1）使用集合，避免重复
     */
    private Set<Edge<V>> edgeSet;

    /**
     * 初始化一個節點
     * @param vertex 頂點
     */
    public GraphNode(V vertex) {
        this.vertex = vertex;
        this.edgeSet = Guavas.newHashSet();
    }

    /**
     * 新增一条边
     * @param edge 边
     */
    public void add(final Edge<V> edge) {
        edgeSet.add(edge);
    }

    /**
     * 获取目标边
     * @param to 目标边
     * @return 边
     * @since 0.0.2
     */
    public Edge<V> get(final V to) {
        for(Edge<V> edge : edgeSet) {
            V dest = edge.getTo();

            if(dest.equals(to)) {
                return edge;
            }
        }

        return null;
    }

    /**
     * 获取目标边
     * @param to 目标边
     * @return 边
     * @since 0.0.2
     */
    public Edge<V> remove(final V to) {
        Iterator<Edge<V>> edgeIterable = edgeSet.iterator();

        while (edgeIterable.hasNext()) {
            Edge<V> next = edgeIterable.next();

            if(to.equals(next.getTo())) {
                edgeIterable.remove();
                return next;
            }
        }

        return null;
    }

    public V getVertex() {
        return vertex;
    }

    public Set<Edge<V>> getEdgeSet() {
        return edgeSet;
    }

    @Override
    public String toString() {
        return "GraphNode{" +
                "vertex=" + vertex +
                ", edgeSet=" + edgeSet +
                '}';
    }

}
```

## 默认实现

```java
package com.github.houbb.data.struct.core.util.graph;

import com.github.houbb.data.struct.core.util.graph.component.Edge;
import com.github.houbb.data.struct.core.util.graph.component.GraphNode;
import com.github.houbb.heaven.util.guava.Guavas;

import java.util.*;

/**
 * 链表实现的有向图
 *
 * 邻接链表（Adjacency List）实现的有向图
 *
 * @author binbin.hou
 * @since 0.0.2
 */
public class ListDirectGraph<V> implements IDirectGraph<V> {

    /**
     * 节点链表
     * @since 0.0.2
     */
    private List<GraphNode<V>> nodeList;

    /**
     * 初始化有向图
     * @since 0.0.2
     */
    public ListDirectGraph() {
        this.nodeList = Guavas.newArrayList();
    }

    @Override
    public void addVertex(V v) {
        GraphNode<V> node = new GraphNode<>(v);

        // 直接加入到集合中
        this.nodeList.add(node);
    }

    @Override
    public boolean removeVertex(V v) {
        //1. 移除一个顶点
        //2. 所有和这个顶点关联的边也要被移除
        Iterator<GraphNode<V>> iterator = nodeList.iterator();
        while (iterator.hasNext()) {
            GraphNode<V> graphNode = iterator.next();

            if(v.equals(graphNode.getVertex())) {
                iterator.remove();
            }
        }

        return true;
    }

    @Override
    public V getVertex(int index) {
        return nodeList.get(index).getVertex();
    }

    @Override
    public void addEdge(Edge<V> edge) {
        //1. 新增一条边，直接遍历列表。
        // 如果存在这条的起始节点，则将这条边加入。
        // 如果不存在，则直接报错即可。

        for(GraphNode<V> graphNode : nodeList) {
            V from = edge.getFrom();
            V vertex = graphNode.getVertex();

            // 起始节点在开头
            if(from.equals(vertex)) {
                graphNode.getEdgeSet().add(edge);
            }
        }
    }

    @Override
    public boolean removeEdge(Edge<V> edge) {
        // 直接从列表中对应的节点，移除即可
        GraphNode<V> node = getGraphNode(edge);
        if(null != node) {
            // 移除目标为 to 的边
            node.remove(edge.getTo());
        }

        return true;
    }

    @Override
    public Edge<V> getEdge(int from, int to) {
        // 获取开始和结束的顶点
        V toVertex = getVertex(from);

        // 获取节点
        GraphNode<V> fromNode = nodeList.get(from);
        // 获取对应结束顶点的边
        return fromNode.get(toVertex);
    }

    /**
     * 获取图节点
     * @param edge 边
     * @return 图节点
     */
    private GraphNode<V> getGraphNode(final Edge<V> edge) {
        for(GraphNode<V> node : nodeList) {
            final V from = edge.getFrom();

            if(node.getVertex().equals(from)) {
                return node;
            }
        }

        return null;
    }

    /**
     * 获取对应的图节点
     * @param vertex 顶点
     * @return  图节点
     * @since 0.0.2
     */
    private GraphNode<V> getGraphNode(final V vertex) {
        for(GraphNode<V> node : nodeList) {
            if(vertex.equals(node.getVertex())) {
                return node;
            }
        }
        return null;
    }

}
```

# 图的遍历

图是一种灵活的数据结构，一般作为一种模型用来定义对象之间的关系或联系。

对象由顶点（V）表示，而对象之间的关系或者关联则通过图的边（E）来表示。

图可以分为有向图和无向图，一般用G=(V,E)来表示图。经常用邻接矩阵或者邻接表来描述一副图。

在图的基本算法中，最初需要接触的就是图的遍历算法，根据访问节点的顺序，可分为广度优先搜索（BFS）和深度优先搜索（DFS）。

# BFS 广度遍历

## 流程

广度优先搜索在进一步遍历图中顶点之前，先访问当前顶点的所有邻接结点。

a.首先选择一个顶点作为起始结点，并将其染成灰色，其余结点为白色。

b. 将起始结点放入队列中。

c. 从队列首部选出一个顶点，并找出所有与之邻接的结点，将找到的邻接结点放入队列尾部，将已访问过结点涂成黑色，没访问过的结点是白色。如果顶点的颜色是灰色，表示已经发现并且放入了队列，如果顶点的颜色是白色，表示还没有发现

d. 按照同样的方法处理队列中的下一个结点。

基本就是出队的顶点变成黑色，在队列里的是灰色，还没入队的是白色。

## 图流程

用一副图来表达这个流程如下：

![image](https://user-images.githubusercontent.com/18375710/72978161-ddcfbf80-3e10-11ea-8d4d-f77d4c04661e.png)

![image](https://user-images.githubusercontent.com/18375710/72978192-ef18cc00-3e10-11ea-8678-69c1cbee83d4.png)

![image](https://user-images.githubusercontent.com/18375710/72978207-fa6bf780-3e10-11ea-82ce-85f083d7350a.png)

![image](https://user-images.githubusercontent.com/18375710/72978234-06f05000-3e11-11ea-91c7-de852b82850e.png)

![image](https://user-images.githubusercontent.com/18375710/72978256-12437b80-3e11-11ea-8d9a-7e2e9551c706.png)

从顶点1开始进行广度优先搜索：

```
初始状态，从顶点1开始，队列={1}
访问1的邻接顶点，1出队变黑，2,3入队，队列={2,3,}
访问2的邻接结点，2出队，4入队，队列={3,4}
访问3的邻接结点，3出队，队列={4}
访问4的邻接结点，4出队，队列={ 空}
结点5对于1来说不可达。
```

## java 代码实现

```java
@Override
public List<V> bfs(final V root) {
    List<V> visitedList = Guavas.newArrayList();
    Queue<V> visitingQueue = new LinkedList<>();
    // 1. 放入根节点
    visitingQueue.offer(root);
    // 2. 开始处理
    V vertex = visitingQueue.poll();
    while (vertex != null) {
        // 2.1 获取对应的图节点
        GraphNode<V> graphNode = getGraphNode(vertex);
        // 2.2 图节点存在
        if(graphNode != null) {
            Set<Edge<V>> edgeSet = graphNode.getEdgeSet();
            //2.3 将不在访问列表中 && 不再处理队列中的元素加入到队列。
            for(Edge<V> edge : edgeSet) {
                V target = edge.getTo();
                if(!visitedList.contains(target)
                    && !visitingQueue.contains(target)) {
                    visitingQueue.offer(target);
                }
            }
        }
        //3. 更新节点信息
        // 3.1 放入已经访问的列表
        visitedList.add(vertex);
        // 3.2 当节点设置为最新的元素
        vertex = visitingQueue.poll();
    }
    return visitedList;
}
```

# DFS 深度遍历

## 流程

深度优先搜索在搜索过程中访问某个顶点后，需要递归地访问此顶点的所有未访问过的相邻顶点。

初始条件下所有节点为白色，选择一个作为起始顶点，按照如下步骤遍历：

a. 选择起始顶点涂成灰色，表示还未访问

b. 从该顶点的邻接顶点中选择一个，继续这个过程（即再寻找邻接结点的邻接结点），一直深入下去，直到一个顶点没有邻接结点了，涂黑它，表示访问过了

c. 回溯到这个涂黑顶点的上一层顶点，再找这个上一层顶点的其余邻接结点，继续如上操作，如果所有邻接结点往下都访问过了，就把自己涂黑，再回溯到更上一层。

d. 上一层继续做如上操作，知道所有顶点都访问过。

## 图示

![image](https://user-images.githubusercontent.com/18375710/72978566-ac0b2880-3e11-11ea-8c6f-e5f6e3dcdc50.png)

![image](https://user-images.githubusercontent.com/18375710/72978600-b75e5400-3e11-11ea-9301-b9f5a4b02942.png)

![image](https://user-images.githubusercontent.com/18375710/72978617-c34a1600-3e11-11ea-977a-62a340a143be.png)

![image](https://user-images.githubusercontent.com/18375710/72978657-d230c880-3e11-11ea-95ef-12785954d183.png)

![image](https://user-images.githubusercontent.com/18375710/72978700-e7a5f280-3e11-11ea-8ffe-359e1f22f603.png)

![image](https://user-images.githubusercontent.com/18375710/72978766-fee4e000-3e11-11ea-8ff0-b044065ff14b.png)


从顶点1开始做深度搜索：
 
```
初始状态，从顶点1开始
依次访问过顶点1,2,3后，终止于顶点3
从顶点3回溯到顶点2，继续访问顶点5，并且终止于顶点5
从顶点5回溯到顶点2，并且终止于顶点2
从顶点2回溯到顶点1，并终止于顶点1
从顶点4开始访问，并终止于顶点4
```

## java 代码实现

```java
@Override
public List<V> dfs(V root) {
    List<V> visitedList = Guavas.newArrayList();
    Stack<V> visitingStack = new Stack<>();
    // 顶点首先压入堆栈
    visitingStack.push(root);
    // 获取一个边的节点
    while (!visitingStack.isEmpty()) {
        V visitingVertex = visitingStack.peek();
        GraphNode<V> graphNode = getGraphNode(visitingVertex);
        boolean hasPush = false;
        if(null != graphNode) {
            Set<Edge<V>> edgeSet = graphNode.getEdgeSet();
            for(Edge<V> edge : edgeSet) {
                V to = edge.getTo();
                if(!visitedList.contains(to)
                        && !visitingStack.contains(to)) {
                    // 寻找到下一个临接点
                    visitingStack.push(to);
                    hasPush = true;
                    break;
                }
            }
        }
        // 循环之后已经结束，没有找到下一个临点，则说明访问结束。
        if(!hasPush) {
            // 获取第一个元素
            visitedList.add(visitingStack.pop());
        }
    }
    return visitedList;
}
```



# 代码测试

![image](https://user-images.githubusercontent.com/18375710/72973398-2767dc80-3e08-11ea-86ce-5831683ebc43.png)

## 测试代码

```java
IDirectGraph<String> directGraph = new ListDirectGraph<>();
//1. 初始化顶点
directGraph.addVertex("1");
directGraph.addVertex("2");
directGraph.addVertex("3");
directGraph.addVertex("4");
directGraph.addVertex("5");
directGraph.addVertex("6");
directGraph.addVertex("7");
directGraph.addVertex("8");

//2. 初始化边
directGraph.addEdge(new Edge<>("1", "2"));
directGraph.addEdge(new Edge<>("1", "3"));
directGraph.addEdge(new Edge<>("2", "4"));
directGraph.addEdge(new Edge<>("2", "5"));
directGraph.addEdge(new Edge<>("3", "6"));
directGraph.addEdge(new Edge<>("3", "7"));
directGraph.addEdge(new Edge<>("4", "8"));
directGraph.addEdge(new Edge<>("8", "5"));
directGraph.addEdge(new Edge<>("6", "7"));
//3. BFS 遍历
List<String> bfsList = directGraph.bfs("1");
System.out.println(bfsList);
//4. DFS 遍历
List<String> dfsList = directGraph.dfs("1");
System.out.println(dfsList);
```

## 测试结果

```
[1, 3, 2, 7, 6, 5, 4, 8]
[7, 6, 3, 5, 8, 4, 2, 1]
```

# TODO: 移除环，转为 DAG

...

# 参考资料

[DFS 与 BFS 算法](https://www.cnblogs.com/brucekun/p/8503042.html)

[算法精解：DAG有向无环图](https://www.cnblogs.com/Evsward/p/dag.html)

[一个简单的有向图Java实现](https://www.cnblogs.com/alexcai/p/3436376.html)

[Java实现有向图去环得到DAG](https://blog.csdn.net/xiedelong/article/details/80308000)

## other

[DAG有向无环图](https://www.cnblogs.com/Evsward/p/dag.html)

[拓扑排序-有向无环图（DAG, Directed Acyclic Graph）](https://www.cnblogs.com/shoulinniao/p/10395815.html)

[Java实现有向图去环得到DAG](https://blog.csdn.net/xiedelong/article/details/80308000)

* any list
{:toc}