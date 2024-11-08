---
layout: post
title:  【leetcode】73-3195. 包含所有 1 的最小矩形面积 I
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, greedy, leetcode]
published: true
---

# 题目

给你一个二维 二进制 数组 grid。请你找出一个边在水平方向和竖直方向上、面积 最小 的矩形，并且满足 grid 中所有的 1 都在矩形的内部。

返回这个矩形可能的 最小 面积。

示例 1：

输入： grid = [[0,1,0],[1,0,1]]

输出： 6

解释：

```
0  1   0
1  0   1 
```

这个最小矩形的高度为 2，宽度为 3，因此面积为 2 * 3 = 6。

示例 2：

输入： grid = [[0,0],[1,0]]

输出： 1

解释：

```
0  0 
1  0
```

这个最小矩形的高度和宽度都是 1，因此面积为 1 * 1 = 1。

提示：

1 <= grid.length, grid[i].length <= 1000

grid[i][j] 是 0 或 1。

输入保证 grid 中至少有一个 1 。

# V1-暴力算法

## 思路

我们可以遍历整个数组，直接找到最小的边界值。

```java
class Solution {
    public int minimumArea(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int x1 = m, y1 = n;
        int x2 = 0, y2 = 0;
        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < n; ++j) {
                if (grid[i][j] == 1) {
                    x1 = Math.min(x1, i);
                    y1 = Math.min(y1, j);
                    x2 = Math.max(x2, i);
                    y2 = Math.max(y2, j);
                }
            }
        }
        return (x2 - x1 + 1) * (y2 - y1 + 1);
    }
}
```




# 参考资料

https://leetcode.cn/problems/house-robber/description/?envType=problem-list-v2&envId=dynamic-programming

* any list
{:toc}