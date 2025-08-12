---
layout: post
title: leetcode 算法篇专题之图 graph 02-01-LC695. 岛屿的最大面积 max-area-of-island
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

给你一个大小为 m x n 的二进制矩阵 grid 。

岛屿 是由一些相邻的 1 (代表土地) 构成的组合，这里的「相邻」要求两个 1 必须在 水平或者竖直的四个方向上 相邻。

你可以假设 grid 的四个边缘都被 0（代表水）包围着。

岛屿的面积是岛上值为 1 的单元格的数目。

计算并返回 grid 中最大的岛屿面积。

如果没有岛屿，则返回面积为 0 。

示例 1：

![1](https://assets.leetcode.com/uploads/2021/05/01/maxarea1-grid.jpg)

输入：grid = [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]
输出：6
解释：答案不应该是 11 ，因为岛屿只能包含水平或垂直这四个方向上的 1 。
示例 2：

输入：grid = [[0,0,0,0,0,0,0,0]]
输出：0
 

提示：

m == grid.length
n == grid[i].length
1 <= m, n <= 50
grid[i][j] 为 0 或 1

# v1-基本 BF + DFS

## 思路

这一题和 LC200 的区别在于，我们需要计算岛屿的最大面积。

所以用一个 max 全局变量存储最大的面积信息。

直接修改数组，来替代 visited 数组效果。

dfs 方法返回当前岛屿的面积。

```
area = 1 + 4 个方向 dfs
```

## 实现

```java
class Solution {
    private int max = 0;
    
    public int maxAreaOfIsland(int[][] grid) {
        int m = grid.length;
        int n = grid[0].length;

        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                if(grid[i][j] == 1) {
                    dfs(grid, i, j);
                }    
            }
        }    
        return max;
    }

    private int dfs(int[][] grid, int i, int j) {
        int m = grid.length;
        int n = grid[0].length;
        if(i < 0 || i >= m || j < 0 || j >= n) {
            return 0;
        }
        // 忽略水
        if(grid[i][j] == 0) {
            return 0;
        }

        // 访问
        grid[i][j] = 0;

        int area = 1;

        // 4 个方向
        area += dfs(grid, i+1, j);
        area += dfs(grid, i-1, j);
        area += dfs(grid, i, j+1);
        area += dfs(grid, i, j-1);

        max = Math.max(max, area);
        return area;
    }

}
```

## 效果

1ms 击败 100.00%

* any list
{:toc}