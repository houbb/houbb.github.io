---
layout: post
title: leetcode 算法篇专题之图 graph 02-01-LC733 图像渲染 flood-fill
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

# LC733 图像渲染 flood-fill

有一幅以 m x n 的二维整数数组表示的图画 image ，其中 image[i][j] 表示该图画的像素值大小。

你也被给予三个整数 sr ,  sc 和 color 。

你应该从像素 image[sr][sc] 开始对图像进行上色 填充 。

为了完成 上色工作：

- 从初始像素开始，将其颜色改为 color。

- 对初始坐标的 上下左右四个方向上 相邻且与初始像素的原始颜色同色的像素点执行相同操作。

- 通过检查与初始像素的原始颜色相同的相邻像素并修改其颜色来继续 重复 此过程。

- 当 没有 其它原始颜色的相邻像素时 停止 操作。

最后返回经过上色渲染 修改 后的图像 。

示例 1:

输入：image = [[1,1,1],[1,1,0],[1,0,1]]，sr = 1, sc = 1, color = 2
输出：[[2,2,2],[2,2,0],[2,0,1]]
解释：在图像的正中间，坐标 (sr,sc)=(1,1) （即红色像素）,在路径上所有符合条件的像素点的颜色都被更改成相同的新颜色（即蓝色像素）。
注意，右下角的像素 没有 更改为2，因为它不是在上下左右四个方向上与初始点相连的像素点。
 
示例 2:

输入：image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0
输出：[[0,0,0],[0,0,0]]
解释：初始像素已经用 0 着色，这与目标颜色相同。因此，不会对图像进行任何更改。
 

提示:

m == image.length
n == image[i].length
1 <= m, n <= 50
0 <= image[i][j], color < 2^16
0 <= sr < m
0 <= sc < n

# v1-基本思路

## 思路

递归

1. 找到开始节点的颜色 `color = matrix[i][j]`， targetColor 目标颜色

2. 四个方向范围判断

3. dfs 核心逻辑

终止条件：

```java
if(i < 0 || i > matrix.length || j < 0 || j > matrix[0].length) {
    return;
}

if(matrix[i][j] != srcColor) {
    return;
}
matrix[i][j] = targetColor;
```

上下左右 4 个方向递归。

## 为什么不需要 visited

因为节点被访问之后，节点的元素信息就被修改了。

所以可以不使用 visited 数组来记录状态。

## 实现

```java
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        int srcColor = image[sr][sc];       
        // 避免一直循环
        if(srcColor == color) {
            return image;
        }  
        dfs(image, sr, sc, srcColor, color);
        return image;
    }

    private void dfs(int[][] matrix, int i, int j, int srcColor, int targetColor) {
        if(i < 0 || i >= matrix.length || j < 0 || j >= matrix[0].length) {
            return;
        }

        if(matrix[i][j] != srcColor) {
            return;
        }
        matrix[i][j] = targetColor;

        // 上下左右
        dfs(matrix, i-1, j, srcColor, targetColor);
        dfs(matrix, i+1, j, srcColor, targetColor);
        dfs(matrix, i, j-1, srcColor, targetColor);
        dfs(matrix, i, j+1, srcColor, targetColor);
    }
```


## 效果

0ms 击败 100.00 

## 复杂度

TC: O(m*n)


# v2-BFS

## 思路

类似的，我们可以使用 queue 来实现 BFS

## 实现

```java
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        int srcColor = image[sr][sc];       
        // 避免一直循环
        if(srcColor == color) {
            return image;
        }  

        // BFS
        Queue<int[]> queue = new LinkedList<>();
        queue.offer(new int[]{sr, sc});
        while(!queue.isEmpty()) {
            int[] pos = queue.poll();

            // 更新颜色
            int i = pos[0];
            int j = pos[1];

            // 跳过不满足的场景
            if(i < 0 || i >= image.length || j < 0 || j >= image[0].length
                || image[i][j] != srcColor) {
                continue;
            }
            
            // 设置颜色
            image[i][j] = color;

            // 4 个方向进入队列
            // 判断范围
            queue.offer(new int[]{i+1,j});
            queue.offer(new int[]{i-1,j});
            queue.offer(new int[]{i,j+1});
            queue.offer(new int[]{i,j-1});
        }

        return image;
    }
```

## 效果

2ms 击败 5.13%

## 复杂度

TC: O(m*n)


# v3-Stack 模拟 DFS

## 思路

类似的，我们也可以用 stack 来模拟实现。

## 实现

```java
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        int srcColor = image[sr][sc];       
        // 避免一直循环
        if(srcColor == color) {
            return image;
        }  

        // BFS
        Stack<int[]> stack = new Stack<>();
        stack.push(new int[]{sr, sc});
        while(!stack.isEmpty()) {
            int[] pos = stack.pop();

            // 更新颜色
            int i = pos[0];
            int j = pos[1];

            // 跳过不满足的场景
            if(i < 0 || i >= image.length || j < 0 || j >= image[0].length
                || image[i][j] != srcColor) {
                continue;
            }
            
            // 设置颜色
            image[i][j] = color;

            // 4 个方向进入队列
            // 判断范围
            stack.push(new int[]{i+1,j});
            stack.push(new int[]{i-1,j});
            stack.push(new int[]{i,j+1});
            stack.push(new int[]{i,j-1});
        }

        return image;
    }
```


## 效果

1ms 击败 45.13%

## 复杂度

TC: O(m*n)

* any list
{:toc}