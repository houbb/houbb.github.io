---
layout: post
title: DFS 深度优先遍历与 BFS 广度优先遍历详解
date:  2020-1-23 10:09:32 +0800
categories: [Data-Struct]
tags: [data-struct, block-chain, sh]
published: true
---

# 什么是深度优先搜索？

深度优先搜索是用来遍历或搜索树和图数据结构的算法，它是可以从任意跟节点开始，选择一条路径走到底，并通过回溯来访问所有节点的算法。

简单来说就是通过选择一条道路走到无路可走的时候回退到上一个岔路口，并标记这条路已走过，选择另外一条道路继续走，直到走遍每一条路。

# 深度优先搜索的思想

DFS 思修基于递归思想，通过递归的形式来缩小问题规模，把一件事分割成若干个相同的小事，逐步完成。

深度优先搜索的步骤分为 1.递归下去 2.回溯上来。

顾名思义，深度优先，则是以深度为准则，先一条路走到底，直到达到目标。这里称之为递归下去。

否则既没有达到目标又无路可走了，那么则退回到上一步的状态，走其他路。这便是回溯上来。

DFS 有两个重要标志，也就是两个重要数组，一个是标记数组，标记该点是否被访问过，一个用来把该点放入数组，两个点是相辅相承的，通过放入一个起点，并标记起始点，然后依次搜索附近所有能访问的结点，用递归走到下一个点，重复这个步骤，直到走到目标点或是走完全图。

![ex](https://pic1.zhimg.com/80/v2-83d112e6395afaf305aa030e3b1ad46c_720w.jpg)

## 时间复杂度：

在深度优先搜索算法中，每条边最多会被访问两次，一次是遍历，一次是回退。

所以，深度优先搜索的时间复杂度为 O(E)

## 模板

```java
void dfs()//参数用来表示状态
{
     if(到达终点状态)
     {
         ...//根据题意来添加
         return;
     }

     if(越界或者是不符合法状态)//剪枝
         return;

     for(扩展方式)
     {
         if(扩展方式所达到状态合法)
         {
             ....//根据题意来添加
             标记；
             dfs（）；
             修改（剪枝）；
             (还原标记)；
             //是否还原标记根据题意
             //如果加上（还原标记）就是 回溯法
         }
     }
 }
```

## 剪枝

深度优先搜索会遍历万每一种可能的情况，因此往往解决问题时会耗费大量时间，但是可以通过省去一些越界和不合法的状态节省时间，这个省略的步骤被称为剪枝。

## 核心流程

深度优先搜索的过程类似于树的先序遍历，首先从例子中体会深度优先搜索。

例如图 1 是一个无向图，采用深度优先算法遍历这个图的过程为：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0322/224022_91d6ee0b_508704.png "屏幕截图.png")

- 首先任意找一个未被遍历过的顶点，例如从 V1 开始，由于 V1 率先访问过了，所以，需要标记 V1 的状态为访问过；

- 然后遍历 V1 的邻接点，例如访问 V2 ，并做标记，然后访问 V2 的邻接点，例如 V4 （做标记），然后 V8 ，然后 V5 ；

- 当继续遍历 V5 的邻接点时，根据之前做的标记显示，所有邻接点都被访问过了。此时，从 V5 回退到 V8 ，看 V8 是否有未被访问过的邻接点，如果没有，继续回退到 V4 ， V2 ， V1 ；

- 通过查看 V1 ，找到一个未被访问过的顶点 V3 ，继续遍历，然后访问 V3  邻接点 V6 ，然后 V7 ；

- 由于 V7 没有未被访问的邻接点，所有回退到 V6 ，继续回退至 V3 ，最后到达 V1 ，发现没有未被访问的；

- 最后一步需要判断是否所有顶点都被访问，如果还有没被访问的，以未被访问的顶点为第一个顶点，继续依照上边的方式进行遍历。


根据上边的过程，可以得到图 1 通过深度优先搜索获得的顶点的遍历次序为：

```
V1 -> V2 -> V4 -> V8 -> V5 -> V3 -> V6 -> V7
```

所谓深度优先搜索，是从图中的一个顶点出发，每次遍历当前访问顶点的临界点，一直到访问的顶点没有未被访问过的临界点为止。

然后采用依次回退的方式，查看来的路上每一个顶点是否有其它未被访问的临界点。

访问完成后，判断图中的顶点是否已经全部遍历完成，如果没有，以未访问的顶点为起始点，重复上述过程。

深度优先搜索是一个不断回溯的过程。

## C 实现

```c
#include <stdio.h>

#define MAX_VERtEX_NUM 20                   //顶点的最大个数
#define VRType int                          //表示顶点之间的关系的变量类型
#define InfoType char                       //存储弧或者边额外信息的指针变量类型
#define VertexType int                      //图中顶点的数据类型

typedef enum{false,true}bool;               //定义bool型常量
bool visited[MAX_VERtEX_NUM];               //设置全局数组，记录标记顶点是否被访问过

typedef struct {
    VRType adj;                             //对于无权图，用 1 或 0 表示是否相邻；对于带权图，直接为权值。
    InfoType * info;                        //弧或边额外含有的信息指针
}ArcCell,AdjMatrix[MAX_VERtEX_NUM][MAX_VERtEX_NUM];

typedef struct {
    VertexType vexs[MAX_VERtEX_NUM];        //存储图中顶点数据
    AdjMatrix arcs;                         //二维数组，记录顶点之间的关系
    int vexnum,arcnum;                      //记录图的顶点数和弧（边）数
}MGraph;
//根据顶点本身数据，判断出顶点在二维数组中的位置
int LocateVex(MGraph * G,VertexType v){
    int i=0;
    //遍历一维数组，找到变量v
    for (; i<G->vexnum; i++) {
        if (G->vexs[i]==v) {
            break;
        }
    }
    //如果找不到，输出提示语句，返回-1
    if (i>G->vexnum) {
        printf("no such vertex.\n");
        return -1;
    }
    return i;
}
//构造无向图
void CreateDN(MGraph *G){
    scanf("%d,%d",&(G->vexnum),&(G->arcnum));
    for (int i=0; i<G->vexnum; i++) {
        scanf("%d",&(G->vexs[i]));
    }
    for (int i=0; i<G->vexnum; i++) {
        for (int j=0; j<G->vexnum; j++) {
            G->arcs[i][j].adj=0;
            G->arcs[i][j].info=NULL;
        }
    }
    for (int i=0; i<G->arcnum; i++) {
        int v1,v2;
        scanf("%d,%d",&v1,&v2);
        int n=LocateVex(G, v1);
        int m=LocateVex(G, v2);
        if (m==-1 ||n==-1) {
            printf("no this vertex\n");
            return;
        }
        G->arcs[n][m].adj=1;
        G->arcs[m][n].adj=1;//无向图的二阶矩阵沿主对角线对称
    }
}

int FirstAdjVex(MGraph G,int v)
{
    //查找与数组下标为v的顶点之间有边的顶点，返回它在数组中的下标
    for(int i = 0; i<G.vexnum; i++){
        if( G.arcs[v][i].adj ){
            return i;
        }
    }
    return -1;
}
int NextAdjVex(MGraph G,int v,int w)
{
    //从前一个访问位置w的下一个位置开始，查找之间有边的顶点
    for(int i = w+1; i<G.vexnum; i++){
        if(G.arcs[v][i].adj){
            return i;
        }
    }
    return -1;
}
void visitVex(MGraph G, int v){
    printf("%d ",G.vexs[v]);
}
void DFS(MGraph G,int v){
    visited[v] = true;//标记为true
    visitVex( G,  v); //访问第v 个顶点
    //从该顶点的第一个边开始，一直到最后一个边，对处于边另一端的顶点调用DFS函数
    for(int w = FirstAdjVex(G,v); w>=0; w = NextAdjVex(G,v,w)){
        //如果该顶点的标记位false，证明未被访问，调用深度优先搜索函数
        if(!visited[w]){
            DFS(G,w);
        }
    }
}
//深度优先搜索
void DFSTraverse(MGraph G){//
    int v;
    //将用做标记的visit数组初始化为false
    for( v = 0; v < G.vexnum; ++v){
        visited[v] = false;
    }
    //对于每个标记为false的顶点调用深度优先搜索函数
    for( v = 0; v < G.vexnum; v++){
        //如果该顶点的标记位为false，则调用深度优先搜索函数
        if(!visited[v]){
            DFS( G, v);
        }
    }
}

int main() {
    MGraph G;//建立一个图的变量
    CreateDN(&G);//初始化图
    DFSTraverse(G);//深度优先搜索图
    return 0;
}
```

# 主要解决问题

深度优先遍历(Depth First Search, 简称 DFS) 与广度优先遍历(Breath First Search)是图论中两种非常重要的算法，生产上广泛用于拓扑排序，寻路(走迷宫)，搜索引擎，爬虫等，也频繁出现在 leetcode，高频面试题中。

## 数字型

比如数字的全排列问题

## 地图型


# 广度优先搜索

广度优先搜索类似于树的层次遍历。

从图中的某一顶点出发，遍历每一个顶点时，依次遍历其所有的邻接点，然后再从这些邻接点出发，同样依次访问它们的邻接点。按照此过程，直到图中所有被访问过的顶点的邻接点都被访问到。

最后还需要做的操作就是查看图中是否存在尚未被访问的顶点，若有，则以该顶点为起始点，重复上述遍历的过程。

还拿图 1 中的无向图为例，假设 V1 作为起始点，遍历其所有的邻接点 V2 和 V3 ，以 V2 为起始点，访问邻接点 V4 和 V5 ，以 V3 为起始点，访问邻接点 V6 、 V7 ，以 V4 为起始点访问 V8 ，以 V5 为起始点，由于 V5 所有的起始点已经全部被访问，所有直接略过， V6 和 V7 也是如此。

以 V1 为起始点的遍历过程结束后，判断图中是否还有未被访问的点，由于图 1 中没有了，所以整个图遍历结束。

遍历顶点的顺序为：

```
V1 -> V2 -> v3 -> V4 -> V5 -> V6 -> V7 -> V8
```

## C 实现

广度优先搜索的实现需要借助队列这一特殊数据结构，实现代码为：

```c
#include <stdio.h>
#include <stdlib.h>

#define MAX_VERtEX_NUM 20                   //顶点的最大个数
#define VRType int                          //表示顶点之间的关系的变量类型
#define InfoType char                       //存储弧或者边额外信息的指针变量类型
#define VertexType int                      //图中顶点的数据类型

typedef enum{false,true}bool;               //定义bool型常量

bool visited[MAX_VERtEX_NUM];               //设置全局数组，记录标记顶点是否被访问过
typedef struct Queue{
    VertexType data;
    struct Queue * next;
}Queue;

typedef struct {
    VRType adj;                             //对于无权图，用 1 或 0 表示是否相邻；对于带权图，直接为权值。
    InfoType * info;                        //弧或边额外含有的信息指针
}ArcCell,AdjMatrix[MAX_VERtEX_NUM][MAX_VERtEX_NUM];
typedef struct {
    VertexType vexs[MAX_VERtEX_NUM];        //存储图中顶点数据
    AdjMatrix arcs;                         //二维数组，记录顶点之间的关系
    int vexnum,arcnum;                      //记录图的顶点数和弧（边）数
}MGraph;

//根据顶点本身数据，判断出顶点在二维数组中的位置
int LocateVex(MGraph * G,VertexType v){
    int i=0;
    //遍历一维数组，找到变量v
    for (; i<G->vexnum; i++) {
        if (G->vexs[i]==v) {
            break;
        }
    }
    //如果找不到，输出提示语句，返回-1
    if (i>G->vexnum) {
        printf("no such vertex.\n");
        return -1;
    }
    return i;
}
//构造无向图
void CreateDN(MGraph *G){
    scanf("%d,%d",&(G->vexnum),&(G->arcnum));
    for (int i=0; i<G->vexnum; i++) {
        scanf("%d",&(G->vexs[i]));
    }
    for (int i=0; i<G->vexnum; i++) {
        for (int j=0; j<G->vexnum; j++) {
            G->arcs[i][j].adj=0;
            G->arcs[i][j].info=NULL;
        }
    }
    for (int i=0; i<G->arcnum; i++) {
        int v1,v2;
        scanf("%d,%d",&v1,&v2);
        int n=LocateVex(G, v1);
        int m=LocateVex(G, v2);
        if (m==-1 ||n==-1) {
            printf("no this vertex\n");
            return;
        }
        G->arcs[n][m].adj=1;
        G->arcs[m][n].adj=1;//无向图的二阶矩阵沿主对角线对称
    }
}

int FirstAdjVex(MGraph G,int v)
{
    //查找与数组下标为v的顶点之间有边的顶点，返回它在数组中的下标
    for(int i = 0; i<G.vexnum; i++){
        if( G.arcs[v][i].adj ){
            return i;
        }
    }
    return -1;
}

int NextAdjVex(MGraph G,int v,int w)
{
    //从前一个访问位置w的下一个位置开始，查找之间有边的顶点
    for(int i = w+1; i<G.vexnum; i++){
        if(G.arcs[v][i].adj){
            return i;
        }
    }
    return -1;
}
//操作顶点的函数
void visitVex(MGraph G, int v){
    printf("%d ",G.vexs[v]);
}
//初始化队列
void InitQueue(Queue ** Q){
    (*Q)=(Queue*)malloc(sizeof(Queue));
    (*Q)->next=NULL;
}
//顶点元素v进队列
void EnQueue(Queue **Q,VertexType v){
    Queue * element=(Queue*)malloc(sizeof(Queue));
    element->data=v;
    Queue * temp=(*Q);
    while (temp->next!=NULL) {
        temp=temp->next;
    }
    temp->next=element;
}
//队头元素出队列
void DeQueue(Queue **Q,int *u){
    (*u)=(*Q)->next->data;
    (*Q)->next=(*Q)->next->next;
}
//判断队列是否为空
bool QueueEmpty(Queue *Q){
    if (Q->next==NULL) {
        return true;
    }
    return false;
}
//广度优先搜索
void BFSTraverse(MGraph G){//
    int v;
    //将用做标记的visit数组初始化为false
    for( v = 0; v < G.vexnum; ++v){
        visited[v] = false;
    }
    //对于每个标记为false的顶点调用深度优先搜索函数
    Queue * Q;
    InitQueue(&Q);
    for( v = 0; v < G.vexnum; v++){
        if(!visited[v]){
            visited[v]=true;
            visitVex(G, v);
            EnQueue(&Q, G.vexs[v]);
            while (!QueueEmpty(Q)) {
                int u;
                DeQueue(&Q, &u);
                u=LocateVex(&G, u);
                for (int w=FirstAdjVex(G, u); w>=0; w=NextAdjVex(G, u, w)) {
                    if (!visited[w]) {
                        visited[w]=true;
                        visitVex(G, w);
                        EnQueue(&Q, G.vexs[w]);
                    }
                }
            }
        }
    }
}
int main() {
    MGraph G;//建立一个图的变量
    CreateDN(&G);//初始化图
    BFSTraverse(G);//广度优先搜索图
    return 0;
}
```

# 应用实战篇

## 题目

[130. 被围绕的区域](https://leetcode-cn.com/problems/surrounded-regions/)

给你一个 m x n 的矩阵 board ，由若干字符 'X' 和 'O' ，找到所有被 'X' 围绕的区域，并将这些区域里所有的 'O' 用 'X' 填充。
 
示例 1：

![ex1](https://assets.leetcode.com/uploads/2021/02/19/xogrid.jpg)

```
输入：board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]
输出：[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]
解释：被围绕的区间不会存在于边界上，换句话说，任何边界上的 'O' 都不会被填充为 'X'。 任何不在边界上，或不与边界上的 'O' 相连的 'O' 最终都会被填充为 'X'。如果两个元素在水平或垂直方向相邻，则称它们是“相连”的。
```

示例 2：

```
输入：board = [["X"]]
输出：[["X"]]
```

提示：

m == board.length

n == board[i].length

1 <= m, n <= 200

board[i][j] 为 'X' 或 'O'

## 思路1：DFS 

题目最核心的问题就在于判断一个元素 O 是否需要被反转。

（1）任何边界上的 'O' 都不会被填充为 'X'

（2）任何不在边界上，或不与边界上的 'O' 相连的 'O' 最终都会被填充为 'X'。

我们可以首先把边界的 O 确认出来，然后以边界的 O 作为起点，进行 DFS，将直接或者间接连接的 O 找到并且进行标记。

最后，我们遍历 board，将标记的 O 进行还原，将没有标记的后，反转为 X。

### java 实现

```java
private int m;
private int n;
public void solve(char[][] board) {
    m = board.length;
    n = board[0].length;
    if(m <= 2 || n <= 2) {
        return;
    }
    // 第一行和最后一行
    for(int i = 0; i < n; i++) {
        dfs(board, 0, i);
        dfs(board, m-1, i);
    }
    // 第一列和最后一列
    for(int i = 1; i < m-1; i++) {
        dfs(board, i, 0);
        dfs(board, i, n-1);
    }
    // 统一处理
    for(int i = 0; i < m; i++) {
        for(int j = 0; j < n; j++) {
            if(board[i][j] == '#') {
                board[i][j] = 'O';
            } else if(board[i][j] == 'O') {
                board[i][j] = 'X';
            }
        }
    }
}

private void dfs(char[][] board, int i, int j) {
    if(i < 0 || i >= m || j < 0 || j >= n || board[i][j] != 'O') {
        return;
    }
    // 标记
    board[i][j] = '#';
    dfs(board, i+1, j);
    dfs(board, i-1, j);
    dfs(board, i, j+1);
    dfs(board, i, j-1);
}
```

### 效果

```
Runtime: 1 ms, faster than 99.63% of Java online submissions for Surrounded Regions.
Memory Usage: 41 MB, less than 66.64% of Java online submissions for Surrounded Regions.
```

### 复杂度分析

时间复杂度：O(n×m)，其中 n 和 m 分别为矩阵的行数和列数。深度优先搜索过程中，每一个点至多只会被标记一次。

空间复杂度：O(n×m)，其中 n 和 m 分别为矩阵的行数和列数。主要为深度优先搜索的栈的开销。

## dsf 非递归:

非递归的方式，我们需要记录每一次遍历过的位置，我们用 stack 来记录，因为它先进后出的特点。

而位置我们定义一个内部类 Pos 来标记横坐标和纵坐标。

注意的是，在写非递归的时候，我们每次查看 stack 顶，但是并不出 stack，直到这个位置上下左右都搜索不到的时候出 Stack。

```java
class Solution {
    public class Pos{
        int i;
        int j;
        Pos(int i, int j) {
            this.i = i;
            this.j = j;
        }
    }

    public void solve(char[][] board) {
        if (board == null || board.length == 0) return;
        int m = board.length;
        int n = board[0].length;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                // 从边缘第一个是o的开始搜索
                boolean isEdge = i == 0 || j == 0 || i == m - 1 || j == n - 1;
                if (isEdge && board[i][j] == 'O') {
                    dfs(board, i, j);
                }
            }
        }

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (board[i][j] == 'O') {
                    board[i][j] = 'X';
                }
                if (board[i][j] == '#') {
                    board[i][j] = 'O';
                }
            }
        }
    }

    public void dfs(char[][] board, int i, int j) {
        Stack<Pos> stack = new Stack<>();
        stack.push(new Pos(i, j));
        board[i][j] = '#';
        while (!stack.isEmpty()) {
            // 取出当前stack 顶, 不弹出.
            Pos current = stack.peek();
            // 上
            if (current.i - 1 >= 0 
                && board[current.i - 1][current.j] == 'O') {
                stack.push(new Pos(current.i - 1, current.j));
                board[current.i - 1][current.j] = '#';
              continue;
            }
            // 下
            if (current.i + 1 <= board.length - 1 
                && board[current.i + 1][current.j] == 'O') {
                stack.push(new Pos(current.i + 1, current.j));
                board[current.i + 1][current.j] = '#';      
                continue;
            }
            // 左
            if (current.j - 1 >= 0 
                && board[current.i][current.j - 1] == 'O') {
                stack.push(new Pos(current.i, current.j - 1));
                board[current.i][current.j - 1] = '#';
                continue;
            }
            // 右
            if (current.j + 1 <= board[0].length - 1 
                && board[current.i][current.j + 1] == 'O') {
                stack.push(new Pos(current.i, current.j + 1));
                board[current.i][current.j + 1] = '#';
                continue;
            }
            // 如果上下左右都搜索不到,本次搜索结束，弹出stack
            stack.pop();
        }
    }
}
```

## bfs 非递归:

dfs 非递归的时候我们用 stack 来记录状态，而 bfs 非递归，我们则用队列来记录状态。

和 dfs 不同的是，dfs 中搜索上下左右，只要搜索到一个满足条件，我们就顺着该方向继续搜索，所以你可以看到 dfs 代码中，只要满足条件，就入 Stack，然后 continue 本次搜索，进行下一次搜索，直到搜索到没有满足条件的时候出 stack。

而 dfs 中，我们要把上下左右满足条件的都入队，所以搜索的时候就不能 continue。

大家可以对比下两者的代码，体会 bfs 和 dfs 的差异。

```java
class Solution {
    public class Pos{
        int i;
        int j;
        Pos(int i, int j) {
            this.i = i;
            this.j = j;
        }
    }
    public void solve(char[][] board) {
        if (board == null || board.length == 0) return;
        int m = board.length;
        int n = board[0].length;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                // 从边缘第一个是o的开始搜索
                boolean isEdge = i == 0 || j == 0 || i == m - 1 || j == n - 1;
                if (isEdge && board[i][j] == 'O') {
                    bfs(board, i, j);
                }
            }
        }

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (board[i][j] == 'O') {
                    board[i][j] = 'X';
                }
                if (board[i][j] == '#') {
                    board[i][j] = 'O';
                }
            }
        }
    }

    public void bfs(char[][] board, int i, int j) {
        Queue<Pos> queue = new LinkedList<>();
        queue.add(new Pos(i, j));
        board[i][j] = '#';
        while (!queue.isEmpty()) {
            Pos current = queue.poll();
            // 上
            if (current.i - 1 >= 0 
                && board[current.i - 1][current.j] == 'O') {
                queue.add(new Pos(current.i - 1, current.j));
                board[current.i - 1][current.j] = '#';
              	// 没有continue.
            }
            // 下
            if (current.i + 1 <= board.length - 1 
                && board[current.i + 1][current.j] == 'O') {
                queue.add(new Pos(current.i + 1, current.j));
                board[current.i + 1][current.j] = '#';      
            }
            // 左
            if (current.j - 1 >= 0 
                && board[current.i][current.j - 1] == 'O') {
                queue.add(new Pos(current.i, current.j - 1));
                board[current.i][current.j - 1] = '#';
            }
            // 右
            if (current.j + 1 <= board[0].length - 1 
                && board[current.i][current.j + 1] == 'O') {
                queue.add(new Pos(current.i, current.j + 1));
                board[current.i][current.j + 1] = '#';
            }
        }
    }
}
```

## 并查集:

并查集这种数据结构好像大家不太常用，实际上很有用，我在实际的 production code 中用过并查集。

**并查集常用来解决连通性的问题，即将一个图中连通的部分划分出来。当我们判断图中两个点之间是否存在路径时，就可以根据判断他们是否在一个连通区域。**

而这道题我们其实求解的就是和边界的 OO 在一个连通区域的的问题。

并查集的思想就是，同一个连通区域内的所有点的根节点是同一个。将每个点映射成一个数字。先假设每个点的根节点就是他们自己，然后我们以此输入连通的点对，然后将其中一个点的根节点赋成另一个节点的根节点，这样这两个点所在连通区域又相互连通了。
并查集的主要操作有：

find(int m)：这是并查集的基本操作，查找 mm 的根节点。

isConnected(int m,int n)：判断 m，nm，n 两个点是否在一个连通区域。

union(int m,int n):合并 m，nm，n 两个点所在的连通区域。

```java
class UnionFind {
    int[] parents;

    public UnionFind(int totalNodes) {
        parents = new int[totalNodes];
        for (int i = 0; i < totalNodes; i++) {
            parents[i] = i;
        }
    }
		// 合并连通区域是通过find来操作的, 即看这两个节点是不是在一个连通区域内.
    void union(int node1, int node2) {
        int root1 = find(node1);
        int root2 = find(node2);
        if (root1 != root2) {
            parents[root2] = root1;
        }
    }

    int find(int node) {
        while (parents[node] != node) {
            // 当前节点的父节点 指向父节点的父节点.
            // 保证一个连通区域最终的parents只有一个.
            parents[node] = parents[parents[node]];
            node = parents[node];
        }

        return node;
    }

    boolean isConnected(int node1, int node2) {
        return find(node1) == find(node2);
    }
}
```

我们的思路是把所有边界上的 OO 看做一个连通区域。遇到 OO 就执行并查集合并操作，这样所有的 OO 就会被分成两类

1. 和边界上的 OO 在一个连通区域内的。这些 OO 我们保留。

2. 不和边界上的 OO 在一个连通区域内的。这些 OO 就是被包围的，替换。

由于并查集我们一般用一维数组来记录，方便查找 parants，所以我们将二维坐标用 node 函数转化为一维坐标。

```java
public void solve(char[][] board) {
        if (board == null || board.length == 0)
            return;

        int rows = board.length;
        int cols = board[0].length;

        // 用一个虚拟节点, 边界上的O 的父节点都是这个虚拟节点
        UnionFind uf = new UnionFind(rows * cols + 1);
        int dummyNode = rows * cols;

        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (board[i][j] == 'O') {
                    // 遇到O进行并查集操作合并
                    if (i == 0 || i == rows - 1 || j == 0 || j == cols - 1) {
                        // 边界上的O,把它和dummyNode 合并成一个连通区域.
                        uf.union(node(i, j), dummyNode);
                    } else {
                        // 和上下左右合并成一个连通区域.
                        if (i > 0 && board[i - 1][j] == 'O')
                            uf.union(node(i, j), node(i - 1, j));
                        if (i < rows - 1 && board[i + 1][j] == 'O')
                            uf.union(node(i, j), node(i + 1, j));
                        if (j > 0 && board[i][j - 1] == 'O')
                            uf.union(node(i, j), node(i, j - 1));
                        if (j < cols - 1 && board[i][j + 1] == 'O')
                            uf.union(node(i, j), node(i, j + 1));
                    }
                }
            }
        }

        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (uf.isConnected(node(i, j), dummyNode)) {
                    // 和dummyNode 在一个连通区域的,那么就是O；
                    board[i][j] = 'O';
                } else {
                    board[i][j] = 'X';
                }
            }
        }
    }

    int node(int i, int j) {
        return i * cols + j;
    }
}
```

# NEXT

[Number of Islands](https://leetcode.com/problems/number-of-islands/)

[Walls and Gates](https://leetcode.com/problems/walls-and-gates/)

# 参考资料

https://leetcode-cn.com/problems/surrounded-regions/solution/bfsdi-gui-dfsfei-di-gui-dfsbing-cha-ji-by-ac_pipe/

[什么是DFS？](https://zhuanlan.zhihu.com/p/355968635)

[深度优先搜索（DFS、深搜）和广度优先搜索（BFS、广搜）](http://data.biancheng.net/view/39.html)

[图的深度优先遍历(DFS)---java实现](https://blog.csdn.net/qq_22993855/article/details/108338232)

[深度优先遍历(DFS)和广度优先遍历(BFS)](https://blog.csdn.net/rr123rrr/article/details/77971771)

https://www.guyuehome.com/11046

https://lucifer.ren/leetcode/thinkings/DFS.html

https://developer.aliyun.com/article/49140

https://blog.csdn.net/weixin_42638946/article/details/114993465

https://blog.csdn.net/qq_40310148/article/details/106786652


* any list
{:toc}