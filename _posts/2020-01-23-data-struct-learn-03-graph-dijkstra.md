---
layout: post
title: 图最短路径算法之迪杰斯特拉算法（Dijkstra）
date:  2020-1-23 10:09:32 +0800
categories: [Data-Struct]
tags: [data-struct, java, sh]
published: true
---

# 问题定义

求解单元点的最短路径问题：给定带权有向图G和源点v，求v到G中其他顶点的最短路径

限制条件：图G中不存在负权值的边（这个可以通过弗洛伊德算法，后期将进行讲解）

# 核心思想

设G=(V,E)是一个带权有向图，把图中顶点集合V分成两组，第一组为已求出最短路径的顶点集合（用S表示，初始时S中只有一个源点，以后每求得一条最短路径 , 就将加入到集合S中，直到全部顶点都加入到S中，算法就结束了），第二组为其余未确定最短路径的顶点集合（用U表示），按最短路径长度的递增次序依次把第二组的顶点加入S中。

在加入的过程中，总保持从源点v到S中各顶点的最短路径长度不大于从源点v到U中任何顶点的最短路径长度。

此外，每个顶点对应一个距离，S中的顶点的距离就是从v到此顶点的最短路径长度，U中的顶点的距离，是从v到此顶点只包括S中的顶点为中间顶点的当前最短路径长度。


## 贪心算法

贪心算法（又称贪婪算法）是指，在对问题求解时，总是做出在当前看来是最好的选择。

也就是说，不从整体最优上加以考虑，他所做出的是在某种意义上的局部最优解。

贪心算法不是对所有问题都能得到整体最优解，关键是贪心策略的选择，选择的贪心策略必须具备无后效性，即某个状态以前的过程不会影响以后的状态，只与当前状态有关。

## 最短路径的证明

（反证法可证）

求最短路径步骤

算法步骤如下：

G={V,E}

1、 初始时令 S={V0},T=V-S={其余顶点}，T中顶点对应的距离值

若存在 `<V0,Vi>`，d(V0,Vi)为 `<V0,Vi>` 弧上的权值

若不存在 `<V0,Vi>`，d(V0,Vi) 为 ∞

2、从T中选取一个与S中顶点有关联边且权值最小的顶点W，加入到S中

3、对其余T中顶点的距离值进行修改：若加进W作中间顶点，从V0到Vi的距离值缩短，则修改此距离值重复上述步骤2、3，直到S中包含峙所有顶点，即W=Vi为止

# 算法

## 迪克斯特拉算法

迪杰斯特拉算法(Dijkstra)是由荷兰计算机科学家狄克斯特拉于 1959 年提出的，因此又叫狄克斯特拉算法。

是从一个顶点到其余各顶点的最短路径算法，解决的是有权图中最短路径问题。

迪杰斯特拉算法主要特点是以起始点为中心向外层层扩展，直到扩展到终点为止。

## 定义

Dijkstra算法一般的表述通常有两种方式，一种用永久和临时标号方式，一种是用OPEN, CLOSE表的方式，这里均采用永久和临时标号的方式。

注意该算法要求图中**不存在负权边。**

## 动态图

![2012073019540660](https://user-images.githubusercontent.com/18375710/73042284-9e01ea00-3e9b-11ea-89c8-d51623f3582c.gif)

ps: 动态图仅仅提供直观性，思考的时候不建议参考这个图。

## 算法流程

大概就是这样一个有权图，Dijkstra 算法可以计算任意节点到其他节点的最短路径

![image](https://user-images.githubusercontent.com/18375710/73043769-8e859f80-3ea1-11ea-8efa-7903050598f7.png)

## 算法思路

1、指定一个节点，例如我们要计算 'A' 到其他节点的最短路径

2、引入两个集合（S、U），S集合包含已求出的最短路径的点（以及相应的最短长度），U集合包含未求出最短路径的点（以及A到该点的路径，注意 如上图所示，A->C由于没有直接相连 初始时为∞）

3、初始化两个集合，S集合初始时 只有当前要计算的节点，A->A = 0，

U集合初始时为 A->B = 4, A->C = ∞, A->D = 2, A->E = ∞

ps: 直接连接的定义长度，其他认为不可达。

接下来要进行核心两步骤了

4、从U集合中找出路径最短的点，加入S集合，例如 A->D = 2

ps: 这里就是一个核心的排序流程，选择最近的一个点加入集合。

5、更新U集合路径，if ( 'D 到 B,C,E 的距离' + 'AD 距离' < 'A 到 B,C,E 的距离' ) 则更新U

ps: 如果通过新的路径可以让距离变得更短，就更新集合 U 信息。

6、循环执行 4、5 两步骤，直至遍历结束，得到A 到其他节点的最短路径

## 算法图解

1、选定A节点并初始化，如上述步骤3所示

![image](https://user-images.githubusercontent.com/18375710/73043979-9560e200-3ea2-11ea-9645-4c09f82cf8cc.png)

2、执行上述 4、5两步骤，找出U集合中路径最短的节点D 加入S集合，并根据条件 if ( 'D 到 B,C,E 的距离' + 'AD 距离' < 'A 到 B,C,E 的距离' ) 来更新U集合

![image](https://user-images.githubusercontent.com/18375710/73044015-c0e3cc80-3ea2-11ea-9485-d52bb65d4d0f.png)

3、这时候 A->B, A->C 都为3，没关系。其实这时候他俩都是最短距离，如果从算法逻辑来讲的话，会先取到B点。

而这个时候 if 条件变成了 if ( 'B 到 C,E 的距离' + 'AB 距离' < 'A 到 C,E 的距离' ) ，如图所示这时候A->B距离，其实为 A->D->B

![image](https://user-images.githubusercontent.com/18375710/73044056-ee307a80-3ea2-11ea-90dc-7d35a7e00b3a.png)

4、思路就是这样，往后就是大同小异了

![image](https://user-images.githubusercontent.com/18375710/73044074-03a5a480-3ea3-11ea-8282-6897a2d7023c.png)

5、算法结束

![image](https://user-images.githubusercontent.com/18375710/73044092-14eeb100-3ea3-11ea-93b2-71ecbf476af5.png)

# 实际例子

下面是另外一个例子，可以跳过。

## 无向图

![image](https://user-images.githubusercontent.com/18375710/73042367-ec16ed80-3e9b-11ea-8680-2edd97651b77.png)

## 流程

用Dijkstra算法找出以A为起点的单源最短路径步骤如下

![image](https://user-images.githubusercontent.com/18375710/73042391-05b83500-3e9c-11ea-9ce8-7afd5f25250f.png)

## 理解

```
按最短路径长度的递增次序依次把第二组的顶点加入S中。

在加入的过程中，总保持从源点v到S中各顶点的最短路径长度不大于从源点v到U中任何顶点的最短路径长度”
```

**迪杰斯特拉算法的运行过程是一个排序的过程，既不是深度优先也不是广度优先算法。**

就上面的例子来说，是根据A到图中其余点的最短路径长度进行排序，路径越短越先被找到，路径越长越靠后才能被找到，要找A到F的最短路径，我们依次找到了

```
A –> C 的最短路径 3
A –> C –> B 的最短路径 5
A –> C –> D 的最短路径 6
A –> C –> E 的最短路径 7
A –> C –> D –> F 的最短路径 9
```

Dijkstra 算法运行的附加效果是得到了另一个信息，A到C的路径最短，其次是A到B, A到D, A到E, A到F

## 为什么 Dijkstra 算法不适用于带负权的图？

就上个例子来说，当把一个点选入集合S时，就意味着已经找到了从A到这个点的最短路径，比如第二步，把C点选入集合S，这时已经找到A到C的最短路径了，但是如果图中存在负权边，就不能再这样说了。

举个例子，假设有一个点Z，Z只与A和C有连接，从A到Z的权为50，从Z到C的权为-49，现在A到C的最短路径显然是 A –> Z –> C

ps: **直白地说，负权重会打乱排序**。

对带负权的图，应该用 Floyd 算法

# 语言实现

## 直观的实现

先用邻接矩阵存储数据，考虑采用一个二重循环，每次寻找出距离集合最近的一个点，然后数组标记它已经加入集合，然后在用当前点对不在集合中的点进行松弛，进行 n^2 次，整个操作就完成了（此处代码中默认起点是1）

```cpp
void dijkstra()
{
    memset(dis,127/3,sizeof(dis));//初始化
    v[1]=1;
    dis[1]=0;

    for(int i=1;i<=n;++i)
    {
        int k=0;
        
        for(int j=1;j<=n;++j)//找出距离最近的点
            if(!v[j]&&(k==0||dis[j]<dis[k]))
                k=j;
        v[k]=1;//加入集合

        for(int j=1;j<=n;++j)//松弛
            if(!v[j]&&dis[k]+a[k][j]<dis[j])
                dis[j]=dis[k]+a[k][j];
    }
}
```

## 个人 java 实现

有了上面的实现之后，我们来看一下 java 的实现方式。

```java
import com.github.houbb.data.struct.core.util.graph.shortestpath.IShortestPath;

/**
 * 迪杰斯特拉算法
 * @author binbin.hou
 * @since 0.0.3
 */
public class DijkstraShortestPath implements IShortestPath {

    @Override
    public int[] shortestPath(int[][] graph, int start) {
        // 数组构建
        final int length = graph.length;
        int[] shortestPathArray = new int[length];
        int[] visitedArray = new int[length];

        // 初始化
        // start==>start 路径长度为0
        shortestPathArray[start] = 0;
        // start 节点默认放在集合中
        visitedArray[start] = 1;

        // 开始循环处理剩下的节点
        for(int i = 1; i < length; i++) {
            // 距离 start 最近的点
            int k = -1;
            // 距离 start 最近的距离
            int disMin = Integer.MAX_VALUE;

            //1. 选取出距离顶点 start 最近的一个顶点
            for(int j = 1; j < length; j++) {
                // 元素不在已访问的列表中且
                if(visitedArray[j] == 0 && graph[start][j] < disMin) {
                    disMin = graph[start][j];
                    k = j;
                }
            }

            // 更新信息,加入到最短的集合
            visitedArray[k] = 1;
            shortestPathArray[k] = disMin;

            // 更新距离表
            for(int index = 1; index < length; index++) {
                //1. 不在最短列表中
                //2. start==>shortestIndex+si==>index < start==>index，则进行距离表更新
                if(visitedArray[index] == 0
                    && graph[start][k]+graph[k][index] < graph[start][index]) {
                    graph[start][index] = graph[start][k]+graph[k][index];
                }
            }
        }

        return shortestPathArray;
    }

}
```

### 测试代码

```java
public void shortestPathTest() {
    final int M = 10000; // 代表正无穷
    // 二维数组每一行分别是 A、B、C、D、E 各点到其余点的距离,
    // A -> A 距离为0, 常量M 为正无穷
    int[][] graph = {
            {0, 4, M, 2, M},
            {4, 0, 4, 1, M},
            {M, 4, 0, 1, 3},
            {2, 1, 1, 0, 7},
            {M, M, 3, 7, 0}
    };
    int start = 0;
    IShortestPath shortestPath = new DijkstraShortestPath();
    int[] shortPath = shortestPath.shortestPath(graph, start);
    for (int i = 0; i < shortPath.length; i++) {
        System.out.println("从" + start + "出发到" + i + "的最短距离为：" + shortPath[i]);
    }
}
```

- 日志输出

```
从0出发到0的最短距离为：0
从0出发到1的最短距离为：3
从0出发到2的最短距离为：3
从0出发到3的最短距离为：2
从0出发到4的最短距离为：6
```

# 堆优化

## 思考

该算法复杂度为n^2,我们可以发现，如果边数远小于n^2,对此可以考虑用堆这种数据结构进行优化，取出最短路径的复杂度降为O(1)；

每次调整的复杂度降为O（elogn）；e为该点的边数，所以复杂度降为O((m+n)logn)。

## 实现

1、将源点加入堆，并调整堆。

2、选出堆顶元素u（即代价最小的元素），从堆中删除，并对堆进行调整。

3、处理与u相邻的，未被访问过的，满足三角不等式的顶点

1) 若该点在堆里，更新距离，并调整该元素在堆中的位置。

2) 若该点不在堆里，加入堆，更新堆。

4、若取到的u为终点，结束算法；否则重复步骤2、3。

## java 代码实现

```java
//visit初始为0，防止回溯
int visit[] = new int[n+1];
//假设起点为src, 终点为dst, 图以二维矩阵的形式存储，若graph[i][j] == 0, 代表i,j不相连
int Dijkstra(int src, int dst, int[][] graph){
    PriorityQueue<Node> pq = new PriorityQueue<Node>();
    //将起点加入pq
    pq.add(new Node(src, 0));
    while(pq.size()){
        Node t = pq.poll();
        //当前节点是终点，即可返回最短路径
        if(t.node == dst) return t.cost;
        //若当前节点已遍历过，跳过当前节点
        if(visit[t.node]) continue;
        //将当前节点标记成已遍历
        visit[t.node] = 1;
        for(int i = 0; i < n; i++){
            if(graph[t.node][i] && !visited[i]){
                pq.add(new Node(i, t.cost + graph[t.node][i])); 
            }
        }
    }
    return -1
}

//定义一个存储节点和离起点相应距离的数据结构
class Node implements Comparator<Node> {
    public int node;
    public int cost;
   
    public Node()
    {
    }
   
    public Node(int node, int cost)
    {
        this.node = node;
        this.cost = cost;
    }
   
    @Override
    public int compare(Node node1, Node node2)
    {
        if (node1.cost < node2.cost)
            return -1;
        if (node1.cost > node2.cost)
            return 1;
        return 0;
    }
}
```

# 拓展阅读

[图最短路径算法之弗洛伊德算法（Floyd）](https://houbb.github.io/2020/01/23/data-struct-learn-03-graph-floyd)

[贪心算法](https://houbb.github.io/2020/01/23/data-struct-learn-07-base-greedy)

# 参考资料

## 书籍

《大话数据结构》

## blog

[知乎-轻松搞懂dijkstra算法+堆优化 原理+实战](https://zhuanlan.zhihu.com/p/34624812)

[知乎-帮忙通俗解释一下Dijkstra算法](https://www.zhihu.com/question/20630094/answer/758191548)

[最短路径—弄懂Dijkstra(迪杰斯特拉)算法](https://cloud.tencent.com/developer/article/1511860)

[迪杰斯特拉（Dijkstra)算法最通俗易懂的讲解](https://blog.csdn.net/goodxin_ie/article/details/88707966)

[迪杰斯特拉（Dijkstra)算法-百度百科](https://baike.baidu.com/item/%E8%BF%AA%E5%85%8B%E6%96%AF%E7%89%B9%E6%8B%89%E7%AE%97%E6%B3%95/23665989?fromtitle=%E8%BF%AA%E6%9D%B0%E6%96%AF%E7%89%B9%E6%8B%89%E7%AE%97%E6%B3%95&fromid=4049057&fr=aladdin)

[透彻理解迪杰斯特拉算法](https://blog.csdn.net/swustzhaoxingda/article/details/84318570)

[迪杰斯特拉算法实现](https://www.cnblogs.com/henuliulei/p/9928058.html)

[深入理解 Dijkstra 算法实现原理](https://www.jianshu.com/p/ff6db00ad866)

[Dijkstra 算法代码实现](https://www.csdn.net/gather_23/NtTaIg2sNjEtYmxvZwO0O0OO0O0O.html)

[图(三,迪杰斯特拉算法)](https://www.jianshu.com/p/b8734fd2ab57)

[[数据结构]迪杰斯特拉（Dijkstra）算法](https://www.cnblogs.com/DarrenChan/p/9556315.html)

* any list
{:toc}