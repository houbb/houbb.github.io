---
layout: post
title: leetcode 算法篇专题之图 graph 02-01-LC547. 省份数量 number-of-provinces
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

# 695. 岛屿的最大面积

有 n 个城市，其中一些彼此相连，另一些没有相连。如果城市 a 与城市 b 直接相连，且城市 b 与城市 c 直接相连，那么城市 a 与城市 c 间接相连。

省份 是一组直接或间接相连的城市，组内不含其他没有相连的城市。

给你一个 n x n 的矩阵 isConnected ，其中 isConnected[i][j] = 1 表示第 i 个城市和第 j 个城市直接相连，而 isConnected[i][j] = 0 表示二者不直接相连。

返回矩阵中 省份 的数量。

 

示例 1：

![1](https://assets.leetcode.com/uploads/2020/12/24/graph1.jpg)

输入：isConnected = [[1,1,0],[1,1,0],[0,0,1]]
输出：2

示例 2：

![2](https://assets.leetcode.com/uploads/2020/12/24/graph2.jpg)
输入：isConnected = [[1,0,0],[0,1,0],[0,0,1]]
输出：3
 

提示：

1 <= n <= 200
n == isConnected.length
n == isConnected[i].length
isConnected[i][j] 为 1 或 0
isConnected[i][i] == 1
isConnected[i][j] == isConnected[j][i]


# v1-基本 BF + DFS

## 思路

这一题和 LC200 的看起来是同一件事。

但是实际上不一样

## 错误解法

```java
    public int findCircleNum(int[][] isConnected) {
        int m = isConnected.length;
        int n = isConnected[0].length;

        int count = 0;
        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                if(isConnected[i][j] == 1) {
                    count++;
                    dfs(isConnected, i, j);
                }
            }
        }
        return count;
    }

    private void dfs(int[][] isConnected, int i, int j) {
        int m = isConnected.length;
        int n = isConnected[0].length;
        if(i < 0 || i >= m || j < 0 || j >= n) {
            return;
        }
        if(isConnected[i][j] == 0) {
            return;
        }

        // 访问
        isConnected[i][j] = 0;

        dfs(isConnected, i+1, j);
        dfs(isConnected, i-1, j);
        dfs(isConnected, i, j+1);
        dfs(isConnected, i, j-1);
    }
```

### 错误原因

你把 LC547 省份数量当成了 二维网格 BFS/DFS（岛屿类题目） 去做了，但这个题的输入是 邻接矩阵，不是地图，所以 i 和 j 没有“上下左右”的关系。

## 修正

### 思路

我们要做的是从一个城市出发，DFS/BFS 访问所有能到的城市（无论直接还是间接），而不是在矩阵中按上下左右移动。

正确做法是：外层循环城市 i，如果城市没访问过，就 count++，并 DFS/BFS 访问该城市能到的所有城市。

### 解法

```java
public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        boolean[] visited = new boolean[n];
        int count = 0;

        for(int i = 0; i < n; i++) {
            if(!visited[i]) {
                count++;
                dfs(isConnected, i, visited);
            }
        }
        return count;
    }

    private void dfs(int[][] isConnected, int i, boolean[] visited) {
        visited[i] = true;

        int[] connects = isConnected[i];
        for(int j = 0; j < connects.length; j++) {
            // 等于1，可以继续扩展
            if(!visited[j] && isConnected[i][j] == 1) {
                dfs(isConnected, j, visited);
            }
        }

    }
```

### 效果

1 ms 击败 98.26%

* any list
{:toc}