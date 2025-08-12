---
layout: post
title: leetcode 算法篇专题之图 graph 02-01-LC1254. 统计封闭岛屿的数目 number-of-closed-islands
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

# 1254. 统计封闭岛屿的数目

二维矩阵 grid 由 0 （土地）和 1 （水）组成。岛是由最大的4个方向连通的 0 组成的群，封闭岛是一个 完全 由1包围（左、上、右、下）的岛。

请返回 封闭岛屿 的数目。

示例 1：

![1](https://assets.leetcode.com/uploads/2019/10/31/sample_3_1610.png)

输入：grid = [[1,1,1,1,1,1,1,0],[1,0,0,0,0,1,1,0],[1,0,1,0,1,1,1,0],[1,0,0,0,0,1,0,1],[1,1,1,1,1,1,1,0]]
输出：2
解释：
灰色区域的岛屿是封闭岛屿，因为这座岛屿完全被水域包围（即被 1 区域包围）。

示例 2：

![2](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2019/11/07/sample_4_1610.png)

输入：grid = [[0,0,1,0,0],[0,1,0,1,0],[0,1,1,1,0]]
输出：1
示例 3：

输入：grid = [[1,1,1,1,1,1,1],
             [1,0,0,0,0,0,1],
             [1,0,1,1,1,0,1],
             [1,0,1,0,1,0,1],
             [1,0,1,1,1,0,1],
             [1,0,0,0,0,0,1],
             [1,1,1,1,1,1,1]]
输出：2
 

提示：

1 <= grid.length, grid[0].length <= 100
0 <= grid[i][j] <=1

# v1-基本 BFS

## 思路

这一题其实更加类似于 LC1020

一开始老马也没想清楚这些1要怎么处理。

后来发现其实只需要看 dfs 0 组成的岛屿是否有边界即可，如果有，这个就不是封闭的。

## 实现

```java
    private boolean isBorder = false;
    public int closedIsland(int[][] grid) {
        int m = grid.length;
        int n = grid[0].length;

        int count = 0;
        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                if(grid[i][j] == 0) {
                    isBorder = false;
                    dfs(grid, i, j);
                    if(!isBorder) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    private void dfs(int[][] grid, int i, int j) {
        int m = grid.length;
        int n = grid[0].length;
        if(i < 0 || i >= m || j < 0 || j >= n) {
            return;
        }
        if(grid[i][j] != 0) {
            return;
        }
        // visit
        grid[i][j] = 2;
        if(i == 0 || i == m-1 || j == 0 || j == n-1) {
            isBorder = true;
        }

        dfs(grid, i+1, j);
        dfs(grid, i-1, j);
        dfs(grid, i, j-1);
        dfs(grid, i, j+1);
    }
```


## 效果

1ms 击败 100%

* any list
{:toc}