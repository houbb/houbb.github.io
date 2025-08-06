---
layout: post
title:  【leetcode】力扣矩阵 matrix -01-LC54 螺旋矩阵 spiral-matrix
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, matrix, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# LC54 螺旋矩阵

给你一个 m 行 n 列的矩阵 matrix ，请按照 顺时针螺旋顺序 ，返回矩阵中的所有元素。

示例 1：

![s1](https://assets.leetcode.com/uploads/2020/11/13/spiral1.jpg)

输入：matrix = [[1,2,3],[4,5,6],[7,8,9]]
输出：[1,2,3,6,9,8,7,4,5]


示例 2：

![s2](https://assets.leetcode.com/uploads/2020/11/13/spiral.jpg)

输入：matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]
输出：[1,2,3,4,8,12,11,10,9,5,6,7]

提示：

m == matrix.length
n == matrix[i].length
1 <= m, n <= 10
-100 <= matrix[i][j] <= 100

# v1-暴力解法

## 思路

基本的思路

A 从[0,0]开始，从左-》右

B 当列到最右侧时，从上到下

C 当行到最下行的时候，从右到左

D 当到达最左侧，然后从左到右

从 D 开始，就开始和A重复。唯一不同的是限制条件的行、列发生了变化。

## 实现

```java
    public List<Integer> spiralOrder(int[][] matrix) {
        // 如何遍历
        int rowStart = 0;
        int colStart = 0;
        int rowEnd = matrix.length-1;
        int colEnd = matrix[0].length-1;

        List<Integer> resultList = new ArrayList<>();

        int totalSize = matrix.length * matrix[0].length;
        while (resultList.size() < totalSize) {
            // 处理
            // 1. 从左到右遍历
            for(int i = colStart; i <= colEnd; i++) {
                if(resultList.size() >= totalSize) {
                    return resultList;
                }
                resultList.add(matrix[rowStart][i]);
            }
            // 第一行结束
            rowStart++;

            // 2. 从右-》下
            for(int i = rowStart; i <= rowEnd; i++) {
                if(resultList.size() >= totalSize) {
                    return resultList;
                }
                resultList.add(matrix[i][colEnd]);
            }
            // 最后一列结束
            colEnd--;

            // 3. 从下往左
            for(int i = colEnd; i >= colStart; i--) {
                if(resultList.size() >= totalSize) {
                    return resultList;
                }
                resultList.add(matrix[rowEnd][i]);
            }
            rowEnd--;

            // 4. 从左->上
            for(int i = rowEnd; i >= rowStart; i--) {
                if(resultList.size() >= totalSize) {
                    return resultList;
                }
                resultList.add(matrix[i][colStart]);
            }
            colStart++;
        }

        return resultList;
    }
```

## 效果

0ms 100%

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

# 参考资料

* any list
{:toc}