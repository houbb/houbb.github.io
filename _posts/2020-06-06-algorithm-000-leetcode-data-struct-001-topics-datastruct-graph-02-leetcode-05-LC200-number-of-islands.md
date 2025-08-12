---
layout: post
title: leetcode 算法篇专题之图 graph 02-01-LC200. 岛屿数量 number-of-islands
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

# LC200. 岛屿数量 number-of-islands

给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。

岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。

此外，你可以假设该网格的四条边均被水包围。

示例 1：

输入：grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
输出：1
示例 2：

输入：grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
输出：3
 

提示：

m == grid.length
n == grid[i].length
1 <= m, n <= 300
grid[i][j] 的值为 '0' 或 '1'

# v1-基本 BF + DFS

## 思路

遍历所有的行+列

找到 grid[i][j] == '1' 的点，count++

dfs 的时候，将访问的节点设置为0，或者借助额外的 visited[] 来处理。

## 实现

```java
    public int numIslands(char[][] grid) {
        int count = 0;

        int m = grid.length;
        int n = grid[0].length;
        int[][] visited = new int[m][n];

        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                if(grid[i][j] == '1' && visited[i][j] == 0) {
                    count++;
                    dfs(grid, i, j, visited);
                }
            }
        }

        return count;
    }

    private void dfs(char[][] grid, int i, int j, int[][] visited) {
        int m = grid.length;
        int n = grid[0].length;

        // 快速返回
        if(i < 0 || i >= m || j < 0 || j >= n || visited[i][j] == 1) {
            return;
        }

        // 跳过水
        if(grid[i][j] == '0') {
            return;
        }

        // 访问
        visited[i][j] = 1;

        // 遍历
        dfs(grid, i+1, j, visited);
        dfs(grid, i-1, j, visited);
        dfs(grid, i, j+1, visited);
        dfs(grid, i, j-1, visited);
    }
```


## 效果

4ms 击败 35.36%

# v2-DFS 直接修改原始数组

## 思路

遍历所有的行+列

找到 grid[i][j] == '1' 的点，count++

dfs 的时候，将访问的节点设置为0，或者借助额外的 visited[] 来处理。我们来演示一下前者

好处就是节省空间+参数少一个。

## 实现

```java
    public int numIslands(char[][] grid) {
        int count = 0;

        int m = grid.length;
        int n = grid[0].length;

        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                if(grid[i][j] == '1') {
                    count++;
                    dfs(grid, i, j);
                }
            }
        }

        return count;
    }

    private void dfs(char[][] grid, int i, int j) {
        int m = grid.length;
        int n = grid[0].length;

        // 快速返回
        if(i < 0 || i >= m || j < 0 || j >= n) {
            return;
        }

        // 跳过水
        if(grid[i][j] == '0') {
            return;
        }

        // 访问设置
        grid[i][j] = '0';

        // 遍历
        dfs(grid, i+1, j);
        dfs(grid, i-1, j);
        dfs(grid, i, j+1);
        dfs(grid, i, j-1);
    }
```

## 效果

2ms 击败 100.00%


# v3-BFS+直接修改数组

## 思路

遍历所有的行+列

找到 grid[i][j] == '1' 的点，count++

dfs 的时候，将访问的节点设置为0，或者借助额外的 visited[] 来处理。我们来演示一下前者

好处就是节省空间+参数少一个。

通过 queue 来实现

## 实现

```java
    public int numIslands(char[][] grid) {
        if(grid == null) {
            return 0;
        }

        int count = 0;
        int m = grid.length;
        int n = grid[0].length;

        Queue<int[]> queue = new LinkedList<>();
        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                if(grid[i][j] == '1') {
                    count++;
                    queue.offer(new int[]{i, j});
                    while(!queue.isEmpty()) {
                        int[] temp = queue.poll();
                        int x = temp[0];
                        int y = temp[1];

                        // 快速返回
                        if(x < 0 || x >= m || y < 0 || y >= n) {
                            continue;
                        }
                        // 跳过水
                        if(grid[x][y] == '0') {
                            continue;
                        }           

                        // 设置访问过
                        grid[x][y] = '0';

                        // 入栈
                        queue.offer(new int[]{x+1, y});
                        queue.offer(new int[]{x-1, y});
                        queue.offer(new int[]{x, y+1});
                        queue.offer(new int[]{x, y-1});
                    }
                }
            }
        }

        return count;
    }
```

## 效果

12ms 击败 8.25%

* any list
{:toc}