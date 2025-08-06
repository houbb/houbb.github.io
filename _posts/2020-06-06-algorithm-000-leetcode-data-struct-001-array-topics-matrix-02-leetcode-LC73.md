---
layout: post
title:  【leetcode】力扣矩阵 matrix -01-LC73. 矩阵置零 set-matrix-zeroes
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, matrix, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# LC73. 矩阵置零

给定一个 m x n 的矩阵，如果一个元素为 0 ，则将其所在行和列的所有元素都设为 0 。请使用 原地 算法。

 

示例 1：

![d1](https://assets.leetcode.com/uploads/2020/08/17/mat1.jpg)

输入：matrix = [[1,1,1],[1,0,1],[1,1,1]]
输出：[[1,0,1],[0,0,0],[1,0,1]]

示例 2：

![d2](https://assets.leetcode.com/uploads/2020/08/17/mat2.jpg)

输入：matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]
输出：[[0,0,0,0],[0,4,5,0],[0,3,1,0]]
 

提示：

m == matrix.length
n == matrix[0].length
1 <= m, n <= 200
-2^31 <= matrix[i][j] <= 2^31 - 1
 

进阶：

一个直观的解决方案是使用  O(mn) 的额外空间，但这并不是一个好的解决方案。
一个简单的改进方案是使用 O(m + n) 的额外空间，但这仍然不是最好的解决方案。
你能想出一个仅使用常量空间的解决方案吗？

# v1-基础想法

## 思路

我们用 cols rows 两个数字，记录下存在 0 的行、列。

最后一次性设置为 0, 避免每次都处理一遍，大量重复的动作。

## 实现

```java
public void setZeroes(int[][] matrix) {
        int[] rows = new int[matrix.length];
        int[] cols = new int[matrix[0].length];

        // 处理
        for(int i = 0; i < matrix.length; i++) {
            for(int j = 0; j < matrix[0].length; j++) {
                int num = matrix[i][j];
                if(num == 0) {
                    rows[i] = 1;
                    cols[j] = 1;
                }
            }
        }

        // 再次遍历处理
        for(int i = 0; i < matrix.length; i++) {
            for(int j = 0; j < matrix[0].length; j++) {
                if(rows[i] == 1
                    || cols[j] == 1) {
                    matrix[i][j] =  0;
                }
            }
        }
    }
```

## 效果

1ms 击败 45.49%

## 复杂度

时间 O(m×n)，空间 O(m+n)


# v2-变量优化

## 思想

我们原来用 rows cols 数组来存储是否需要设置为零。

当然，如何面试非要如此要求，也不是不能进一步优化。

个人感觉这种可读性比较差。

核心思路：

1）利用现有的数组第一行、第一列代替我们的 cols/rows 做标记

2）为了避免原来的行列信息被覆盖，再加 2 个变量

## 实现

```java
    public void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        boolean firstRowHasZero = false;
        boolean firstColHasZero = false;

        // 1. 检查第一行
        for (int j = 0; j < n; j++) {
            if (matrix[0][j] == 0) {
                firstRowHasZero = true;
                break;
            }
        }
        // 2. 检查第一列
        for (int i = 0; i < m; i++) {
            if (matrix[i][0] == 0) {
                firstColHasZero = true;
                break;
            }
        }

        // 3. 用第一行和第一列做标记
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }
        // 4. 置零（跳过第一行和第一列）
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                    matrix[i][j] = 0;
                }
            }
        }

        // 5. 最后处理第一行
        if (firstRowHasZero) {
            for (int j = 0; j < n; j++) {
                matrix[0][j] = 0;
            }
        }
        // 6. 最后处理第一列
        if (firstColHasZero) {
            for (int i = 0; i < m; i++) {
                matrix[i][0] = 0;
            }
        }
    }
```

## 效果 

0ms 100%

TC O(m*n)

SC O(1)

## 反思

这种很多都是借助以前的空间，牺牲了可读性。

作为思维训练勉强可用。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}