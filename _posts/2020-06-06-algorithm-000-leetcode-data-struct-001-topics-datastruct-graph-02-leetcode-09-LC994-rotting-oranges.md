---
layout: post
title: leetcode 算法篇专题之图 graph 02-01-LC994 994. 腐烂的橘子 rotting-oranges  
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

# 994. 腐烂的橘子

在给定的 m x n 网格 grid 中，每个单元格可以有以下三个值之一：

值 0 代表空单元格；
值 1 代表新鲜橘子；
值 2 代表腐烂的橘子。
每分钟，腐烂的橘子 周围 4 个方向上相邻 的新鲜橘子都会腐烂。

返回 直到单元格中没有新鲜橘子为止所必须经过的最小分钟数。如果不可能，返回 -1 。

 

示例 1：

![1](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2019/02/16/oranges.png)

输入：grid = [[2,1,1],[1,1,0],[0,1,1]]
输出：4
示例 2：

输入：grid = [[2,1,1],[0,1,1],[1,0,1]]
输出：-1
解释：左下角的橘子（第 2 行， 第 0 列）永远不会腐烂，因为腐烂只会发生在 4 个方向上。
示例 3：

输入：grid = [[0,2]]
输出：0
解释：因为 0 分钟时已经没有新鲜橘子了，所以答案就是 0 。
 

提示：

m == grid.length
n == grid[i].length
1 <= m, n <= 10
grid[i][j] 仅为 0、1 或 2



# v1-基本 BFS

## 思路

1) BFS 每次有多个开始的节点

2）时间这个维度，其实用 BFS 更加简单，迭代完一次，认为+1 分钟。

3）什么场景下腐坏的句子再次进入队列？腐坏终止的条件是什么？

4) 如何判断是否以及全部腐坏？

## 解法

其实理解清楚的话，还好。

1）初始化，所有坏的入队列

2）取出所有坏的。4个方向感染新鲜的，新鲜的被感染再次进入队列

一次迭代走完，count ++

3) 结束之后，判断一下新鲜的数量总数即可


```java
    public int orangesRotting(int[][] grid) {
        if(grid == null) {
            return 0;
        }

        int m = grid.length;
        int n = grid[0].length;

        Queue<int[]> queue = new LinkedList<>();
        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                // 所有坏的入队列
                if(grid[i][j] == 2) {
                    queue.offer(new int[]{i, j});
                }
            }
        }

        int count = 0;

        while(!queue.isEmpty()) {
            int size = queue.size();
            for(int i = 0; i < size; i++) {
                int[] pos = queue.poll();
                int x = pos[0];
                int y = pos[1];

                // 只有下一步的上下左右有新鲜的句子，才进入 queue
                // 上
                if(y > 0 && grid[x][y-1] == 1) {
                    grid[x][y-1] = 2;
                    queue.offer(new int[]{x,y-1});
                }
                // 下
                if(y < n-1 && grid[x][y+1] == 1) {
                    grid[x][y+1] = 2;
                    queue.offer(new int[]{x,y+1});
                }
                // 左
                if(x > 0 && grid[x-1][y] == 1) {
                    grid[x-1][y] = 2;
                    queue.offer(new int[]{x-1,y});
                }
                // 右
                if(x < m-1 && grid[x+1][y] == 1) {
                    grid[x+1][y] = 2;
                    queue.offer(new int[]{x+1, y});
                }
            }

            // 避免 queue 为空的情况
            if(!queue.isEmpty()) {
                //1min走1步
                count++;
            }
        }

        // check 是否都感染了
        int freshCount = 0;
        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                if(grid[i][j] == 1) {
                    freshCount++;
                }
            }
        }
        if(freshCount > 0) {
            return -1;
        }

        return count;
    }
```

## 效果

1ms 击败 99.97%

* any list
{:toc}