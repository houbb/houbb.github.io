---
layout: post
title: leetcode 算法篇专题之图 graph 02-01-LC1020. 飞地的数量 number-of-enclaves
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

# LC1020. 飞地的数量 number-of-enclaves

给你一个大小为 m x n 的二进制矩阵 grid ，其中 0 表示一个海洋单元格、1 表示一个陆地单元格。

一次 移动 是指从一个陆地单元格走到另一个相邻（上、下、左、右）的陆地单元格或跨过 grid 的边界。

返回网格中 无法 在任意次数的移动中离开网格边界的陆地单元格的数量。

 

示例 1：

![1](https://assets.leetcode.com/uploads/2021/02/18/enclaves1.jpg)

输入：grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]]
输出：3
解释：有三个 1 被 0 包围。一个 1 没有被包围，因为它在边界上。
示例 2：

![2](https://assets.leetcode.com/uploads/2021/02/18/enclaves2.jpg)

输入：grid = [[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0]]
输出：0
解释：所有 1 都在边界上或可以到达边界。
 

提示：

m == grid.length
n == grid[i].length
1 <= m, n <= 500
grid[i][j] 的值为 0 或 1


# v1-基本 BF + DFS

## 思路

这一题和 LC200 的看起来是很像。

不过要注意几个点：

1）如果 DFS 可以遇到边，那么就不需要累加这个。用一个全局变量判断即可

2）题目要求的是格子的数量，而不是岛屿的个数。所以类似于最大面积那个 LC695

## 解法

```java
    private boolean isBorder = false;
    public int numEnclaves(int[][] grid) {
        int m = grid.length;
        int n = grid[0].length;

        int count = 0;
        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                if(grid[i][j] == 1) {
                    // 是否为边界
                    isBorder = false;
                    int num = dfs(grid, i, j);  
                    if(!isBorder) {
                        count += num;
                    }
                }
            }
        }

        return count;
    }

    // 要的是格子数
    private int dfs(int[][] grid, int i, int j) {
        int m = grid.length;
        int n = grid[0].length;

        if(i  < 0 || i >= m || j < 0 || j >= n) {
            return 0;
        }

        if(grid[i][j] == 0) {
            return 0;
        }

        // 遇到了边界
        if(i == 0 || j == 0 || i == m-1 || j == n-1) {
            isBorder = true;                  
        } 
        grid[i][j] = 0;
        int sum = 1;

        sum += dfs(grid, i+1, j);
        sum += dfs(grid, i-1, j);
        sum += dfs(grid, i, j+1);
        sum += dfs(grid, i, j-1);

        return sum;
    }
```

## 效果

11ms 击败 32.82%

* any list
{:toc}