---
layout: post
title: DAG 拓扑序列 什么是拓扑排序 Topological Sorting
date:  2020-1-23 10:09:32 +0800
categories: [Data-Struct]
tags: [data-struct, graph, sh]
published: true
---

# 拓扑序列 

拓扑序列是顶点活动网中将活动按发生的先后次序进行的一种排列。 

拓扑排序，是对一个有向无环图(Directed Acyclic Graph简称DAG)G进行拓扑排序，是将G中所有顶点排成一个线性序列，使得图中任意一对顶点u和v，若边(u,v)∈E(G)，则u在线性序列中出现在v之前。通常，这样的线性序列称为满足拓扑次序(Topological Order)的序列，简称拓扑序列。

简单的说，**由某个集合上的一个偏序得到该集合上的一个全序，这个操作称之为拓扑排序。**

## 相关简介

有向无环图（Directed Acyclic Graph, DAG）是有向图的一种，字面意思的理解就是图中没有环。常常被用来表示事件之间的驱动依赖关系，管理任务之间的调度。

AOV网：在每一个工程中，可以将工程分为若干个子工程，这些子工程称为活动。如果用概述图中的顶点表示活动，以有向图的弧表示活动之间的优先关系，这样的有向图称为AOV网，即顶点表示活动的网。在AOV网中，如果从顶点vi到顶点j之间存在一条路径，则顶点vi是顶点vj的前驱，顶点vj是顶点vi的后继。活动中的制约关系可以通过AOV网中的表示。 在AOV网中，不允许出现环，如果出现环就表示某个活动是自己的先决条件。因此需要对AOV网判断是否存在环，可以利用有向图的拓扑排序进行判断。

拓扑排序：拓扑排序是对一个有向图构造拓扑序列的过程。拓扑排序（Topological Sorting）是一个有向无环图（DAG, Directed Acyclic Graph）的所有顶点的线性序列。且该序列必须满足下面两个条件：

1）每个顶点出现且只出现一次。

2）若存在一条从顶点 A 到顶点 B 的路径，那么在序列中顶点 A 出现在顶点 B 的前面。

## 过程

对于一个给定的有向图，得到其拓扑序列的步骤如下：

1. 从图中选择一个入度为0的顶点，并输出该顶点； 

2. 从图中删除该顶点及其相关联的有向边，调整被删除有向边的终点的入度（入度减1）；

3. 重复 1 和 2

4. 直到所有顶点均被输出，拓扑序列完成；否则，无拓扑序列。

可以证明，**任何一个无环的有向图一定有拓扑序列，有环的有向图则无拓扑序列**。

ps: 如何证明呢？

# 拓扑排序的应用

拓扑排序**通常用来“排序”具有依赖关系的任务。**

比如，如果用一个DAG图来表示一个工程，其中每个顶点表示工程中的一个任务，用有向边 表示在做任务 B 之前必须先完成任务 A。故在这个工程中，任意两个任务要么具有确定的先后关系，要么是没有关系，绝对不存在互相矛盾的关系（即环路）。

PS：比如任务调度。

# 拓扑排序的算法

## 卡恩算法(Kahn)

卡恩于1962年提出了该算法。

简单来说，假设L是存放结果的列表，先找到那些入度为零的节点，把这些节点放到L中，因为这些节点没有任何的父节点。

然后把与这些节点相连的边从图中去掉，再寻找图中的入度为零的节点。

对于新找到的这些入度为零的节点来说，他们的父节点已经都在L中了，所以也可以放入L。

重复上述操作，直到找不到入度为零的节点。如果此时L中的元素个数和节点总数相同，说明排序完成；如果L中的元素个数和节点总数不同，说明原图中存在环，无法进行拓扑排序。

```
Kahn算法采用入度方法，其算法过程如下：

1. 选择入度为0的节点，输出到结果序列中；

2. 删除该节点以及该节点的边；

重复执行步骤1和2，直到所有节点输出到结果序列中，完成拓扑排序；如果最后还存在入度不为0的节点，说明有向图中存在环，无法进行拓扑排序。
```

![Kahn](https://jingsam.github.io/2020/08/11/topological-sort/kahn.png)


## 深度优先搜索

另一种拓扑排序的方法运用了深度优先搜索。深度优先搜索以任意顺序循环遍历图中的每个节点。

若搜索进行中碰到之前已经遇到的节点，或碰到叶节点，则中止算法。

```
DFS算法采用出度算法，其算法过程如下：

对有向图进行深度优先搜索；

在执行深度优先搜索时，若某个顶点不能继续前进，即顶点的出度为0，则将此顶点入栈。

最后对栈中的序列进行逆排序，即完成拓扑排序；如果深度优先搜索时，碰到已遍历的节点，说明存在环。
```

![dfs](https://jingsam.github.io/2020/08/11/topological-sort/dfs.png)


## 总结

仔细观察发现，Kahn算法并不一定局限于入度方法，同样适用于出度方法，过程为先选择一个出度为0的节点输出，然后删除该节点和节点的边，重复“选择-删除”过程直到没有出度为0的节点输出，最终序列的逆排序即是拓扑排序结果。这个过程实际上是将原来的有向图的边反向，原来的入度变出度、出度边入度，Kahn算法将出度当成入度处理，最后我们再将结果逆序就还原了拓扑排序结果。

同样，DFS算法也不一定局限于出度算法，我们同样可以将有向图反向，入度变出度、出度边入度。由于我们对有向图反向，所以需要对结果做两次逆序操作，两次逆序操作相当于不需要逆序操作，所以结果序列刚好是拓扑排序结果。

# 拓扑排序的实现

根据上面讲的方法，我们关键是要维护一个入度为0的顶点的集合。

图的存储方式有两种：邻接矩阵和邻接表。这里我们采用邻接表来存储图，C++代码如下：

```c++
#include<iostream>
#include <list>
#include <queue>
using namespace std;

/************************类声明************************/
class Graph
{
    int V;             // 顶点个数
    list<int> *adj;    // 邻接表
    queue<int> q;      // 维护一个入度为0的顶点的集合
    int* indegree;     // 记录每个顶点的入度
public:
    Graph(int V);                   // 构造函数
    ~Graph();                       // 析构函数
    void addEdge(int v, int w);     // 添加边
    bool topological_sort();        // 拓扑排序
};

/************************类定义************************/
Graph::Graph(int V)
{
    this->V = V;
    adj = new list<int>[V];

    indegree = new int[V];  // 入度全部初始化为0
    for(int i=0; i<V; ++i)
        indegree[i] = 0;
}

Graph::~Graph()
{
    delete [] adj;
    delete [] indegree;
}

void Graph::addEdge(int v, int w)
{
    adj[v].push_back(w); 
    ++indegree[w];
}

bool Graph::topological_sort()
{
    for(int i=0; i<V; ++i)
        if(indegree[i] == 0)
            q.push(i);         // 将所有入度为0的顶点入队

    int count = 0;             // 计数，记录当前已经输出的顶点数 
    while(!q.empty())
    {
        int v = q.front();      // 从队列中取出一个顶点
        q.pop();

        cout << v << " ";      // 输出该顶点
        ++count;
        // 将所有v指向的顶点的入度减1，并将入度减为0的顶点入栈
        list<int>::iterator beg = adj[v].begin();
        for( ; beg!=adj[v].end(); ++beg)
            if(!(--indegree[*beg]))
                q.push(*beg);   // 若入度为0，则入栈
    }

    if(count < V)
        return false;           // 没有输出全部顶点，有向图中有回路
    else
        return true;            // 拓扑排序成功
}
```


## 测试

测试如下DAG图：

![DAG](https://upload-images.jianshu.io/upload_images/8468731-e85640c520c71957.png?imageMogr2/auto-orient/strip|imageView2/2/w/335/format/webp)

```c
int main()
{
    Graph g(6);   // 创建图
    g.addEdge(5, 2);
    g.addEdge(5, 0);
    g.addEdge(4, 0);
    g.addEdge(4, 1);
    g.addEdge(2, 3);
    g.addEdge(3, 1);

    g.topological_sort();
    return 0;
}
```

输出结果是 4, 5, 2, 0, 3, 1。这是该图的拓扑排序序列之一。

每次在入度为0的集合中取顶点，并没有特殊的取出规则，随机取出也行，这里使用的queue。取顶点的顺序不同会得到不同的拓扑排序序列，当然前提是该图存在多个拓扑排序序列。

由于输出每个顶点的同时还要删除以它为起点的边，故上述拓扑排序的时间复杂度为$O(V+E)$。

另外，拓扑排序还可以采用 深度优先搜索（DFS）的思想来实现，详见《topological sorting via DFS》。

# 参考资料

https://jingsam.github.io/2020/08/11/topological-sort.html

https://zh.wikipedia.org/wiki/%E6%8B%93%E6%92%B2%E6%8E%92%E5%BA%8F

https://baike.baidu.com/item/%E6%8B%93%E6%89%91%E5%BA%8F%E5%88%97/9477435

https://zhuanlan.zhihu.com/p/135094687

https://www.jianshu.com/p/b59db381561a

https://songlee24.github.io/2015/05/07/topological-sorting/

* any list
{:toc}