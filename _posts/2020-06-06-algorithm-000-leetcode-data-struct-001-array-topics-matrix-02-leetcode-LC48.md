---
layout: post
title:  【leetcode】力扣矩阵 matrix -01-LC48. 旋转图像 rotate-image
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, matrix, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)


# 48. 旋转图像

给定一个 n × n 的二维矩阵 matrix 表示一个图像。请你将图像顺时针旋转 90 度。

你必须在 原地 旋转图像，这意味着你需要直接修改输入的二维矩阵。请不要 使用另一个矩阵来旋转图像。

示例 1：

![1](https://assets.leetcode.com/uploads/2020/08/28/mat1.jpg)

输入：matrix = [[1,2,3],[4,5,6],[7,8,9]]
输出：[[7,4,1],[8,5,2],[9,6,3]]

示例 2：

![2](https://assets.leetcode.com/uploads/2020/08/28/mat1.jpg)

输入：matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]
输出：[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]
 

提示：

n == matrix.length == matrix[i].length
1 <= n <= 20
-1000 <= matrix[i][j] <= 1000

# v1-借助空间

## 思路

我们先借助空间，来解决这个问题。

90° 个人理解可以拆分为横着从前往后，从上倒下读，然后竖着按照从上到下，从右往左来填充。

## 实现

```java
    public void rotate(int[][] matrix) {
        int n = matrix.length;

        // 只是为了避免覆盖而已
        int[][] copy = new int[n][n];
        for(int i = 0; i < n; i++) {
            for(int j = 0; j < n; j++) {
                copy[i][j] = matrix[i][j];
            }
        }

        // 开始从 copy 直接覆盖到 matrix
        // 从左到右
        for(int i = 0; i < n; i++) {
            for(int j = 0; j < n; j++) {
                // 新的行 == 原始的列
                // 新的列 == (n-原始行)
                matrix[j][n-i-1] = copy[i][j];
            }
        }
    }
```

## 效果

0ms 100%

# v2-不借助 


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}