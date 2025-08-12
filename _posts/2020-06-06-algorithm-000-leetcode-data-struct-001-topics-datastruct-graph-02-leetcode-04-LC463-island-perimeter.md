---
layout: post
title: leetcode 算法篇专题之图 graph 02-01-LC463. 岛屿的周长 island-perimeter
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

# LC463. 岛屿的周长 island-perimeter

给定一个 row x col 的二维网格地图 grid ，其中：grid[i][j] = 1 表示陆地， grid[i][j] = 0 表示水域。

网格中的格子 水平和垂直 方向相连（对角线方向不相连）。

整个网格被水完全包围，但其中恰好有一个岛屿（或者说，一个或多个表示陆地的格子相连组成的岛屿）。

岛屿中没有“湖”（“湖” 指水域在岛屿内部且不和岛屿周围的水相连）。

格子是边长为 1 的正方形。网格为长方形，且宽度和高度均不超过 100 。计算这个岛屿的周长。 

示例 1：

输入：grid = [[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]
输出：16
解释：它的周长是上面图片中的 16 个黄色的边

示例 2：

输入：grid = [[1]]
输出：4
示例 3：

输入：grid = [[1,0]]
输出：4
 

提示：

row == grid.length
col == grid[i].length
1 <= row, col <= 100
grid[i][j] 为 0 或 1

# v1-基本 BF

## 思路

遍历所有的行+列

m*n，然后将每一个节点的边加起来。

## 实现

```java
public int islandPerimeter(int[][] grid) {
        int m = grid.length;
        int n = grid[0].length;

        // 累加
        int sum = 0;
        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                if(grid[i][j] == 0) {
                    continue;
                }

                // 上下左右
                // 上边是否为边界或者水域
                if(i == 0 || grid[i-1][j] == 0) {
                    sum++;
                }
                // 下边上边是否为边界或者水域
                if(i == m-1 || grid[i+1][j] == 0) {
                    sum++;
                }
                // 左边是否为边界或者水域
                if(j == 0 || grid[i][j-1] == 0) {
                    sum++;
                }
                // 右边是否为边界或者水域
                if(j == n-1 || grid[i][j+1] == 0) {
                    sum++;
                }
            }
        }
        
        return sum;
    }
```


## 效果

4ms 击败 99.80%

## 复杂度

# v2-递归

## 思路

我们先找到第一个非零的点，然后开始用递归处理。

递归的方式和其他遍历类似。

一个全局的 sum 累加。

## 实现

```java
    private int sum = 0;

    public int islandPerimeter(int[][] grid) {
        int m = grid.length;
        int n = grid[0].length;
        int[][] visited = new int[m][n];

        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                if(grid[i][j] == 1) {
                    dfs(grid, i, j, visited);
                    return sum;
                }        
            }
        }
        
        return sum;
    }


    private void dfs(int[][] grid, int i, int j, int[][] visited) {
        if(i < 0 || j < 0 || i >= grid.length || j >= grid[0].length
            || grid[i][j] == 0) {
            return;
        }

        if(visited[i][j] == 1) {
            return;
        }

        visited[i][j] = 1;
        int m = grid.length;
        int n = grid[0].length;

        // 上下左右
        // 上边是否为边界或者水域
        if(i == 0 || grid[i-1][j] == 0) {
            sum++;
        }
        // 下边上边是否为边界或者水域
        if(i == m-1 || grid[i+1][j] == 0) {
            sum++;
        }
        // 左边是否为边界或者水域
        if(j == 0 || grid[i][j-1] == 0) {
            sum++;
        }
        // 右边是否为边界或者水域
        if(j == n-1 || grid[i][j+1] == 0) {
            sum++;
        }

        // 4 个方向
        dfs(grid, i+1, j, visited);
        dfs(grid, i-1, j, visited);
        dfs(grid, i, j+1, visited);
        dfs(grid, i, j-1, visited);
    }
```

## 效果

29 ms 击败 12.31%

* any list
{:toc}