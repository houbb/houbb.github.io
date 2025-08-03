---
layout: post
title:  二维前缀和 Prefix Sum Matrix-01-基本概念
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, prefix-sum-matrix, matrix, leetcode]
published: true
---

# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)


# 二维前缀和

## 是什么？

二维前缀和（`prefixSum[i][j]`）是指：从原矩阵的左上角 `(0, 0)` 到位置 `(i - 1, j - 1)` 的**矩形区域内所有元素的总和**。

注意是**从左上角 (0,0) 开始**，包括边界，不包括下标 `i` 和 `j` 本身（这是为了方便加减运算，类似一维前缀和数组多开一位）。

## 前缀和数组的构造方法

设原矩阵为 `matrix[m][n]`，我们构造一个大小为 `(m + 1) × (n + 1)` 的前缀和矩阵 `prefix[m+1][n+1]`，初始化全为 0。

✅ 状态定义：

prefix[i+1][j+1] 表示 matrix 中从 (0,0) 到 (i,j) 这个矩形的元素和。

✅ 状态转移公式：

```java
prefix[i+1][j+1] = prefix[i+1][j] + prefix[i][j+1] - prefix[i][j] + matrix[i][j]
```

每个部分的解释：

```
prefix[i+1][j]：表示从 (0,0) 到 (i, j-1) 的子矩阵和，也就是当前行的左边部分（不包括当前位置元素）。
prefix[i][j+1]：表示从 (0,0) 到 (i-1, j) 的子矩阵和，也就是当前列的上面部分（不包括当前位置元素）。
prefix[i][j]：表示从 (0,0) 到 (i-1, j-1) 的子矩阵和，这是上面两部分重叠的区域。
matrix[i][j]：当前单元格的值。
```

## 🔍 如何查询任意子矩形和？

查询 `(row1, col1)` 到 `(row2, col2)` 的子矩阵总和：

```java
// 因为 prefix 多了一行一列，所以都要 +1
sum = prefix[row2+1][col2+1] 
    - prefix[row1][col2+1]
    - prefix[row2+1][col1] 
    + prefix[row1][col1];
```

解释：

* 包括了 (0,0)-(row2,col2) 之间所有值；
* 减去上面那一块 (0,0)-(row1-1,col2)；
* 减去左边那一块 (0,0)-(row2,col1-1)；
* 多减了左上角的 (0,0)-(row1-1,col1-1)，所以加回来。

### 一个直观的例子

假设一个 5*5 的矩阵，如果求 (2,2)->(3,3) 的累加之和。

那么：

![二维前缀和](https://i-blog.csdnimg.cn/direct/a2ba226bce3c4c71971953f4d1bcf1db.png#pic_center)

解释：

因为黄色部分被多减掉一次，需加回来。结合图还是比较好理解的

你可以在线体验

> [二维前缀和在线体验](https://houbb.github.io/leetcode-visual/T304-prefix-sum-matrix-summary.html)

## 代码实现模板（Java）

### 构造前缀和数组：

```java
int m = matrix.length, n = matrix[0].length;
int[][] prefix = new int[m+1][n+1];

for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        prefix[i+1][j+1] = prefix[i+1][j] + prefix[i][j+1] - prefix[i][j] + matrix[i][j];
    }
}
```

### 查询任意矩形和：

```java
int sumRegion(int row1, int col1, int row2, int col2) {
    return prefix[row2+1][col2+1]
         - prefix[row1][col2+1]
         - prefix[row2+1][col1]
         + prefix[row1][col1];
}
```

---

## 时间复杂度

* 预处理构造前缀和：`O(m * n)`

* 每次查询：`O(1)` —— **非常快！**

## 适用场景

二维前缀和非常适用于：

* 多次查询二维区域和；
* 棋盘类问题、图像处理、地图积分等；
* 任何需要在矩形区域内做和/平均/计数的问题。

## 常见的二维前缀和题目列表

| 题号             | 题目名                                                                                                              | 难度    | 技巧点               |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ----- | ----------------- |
| **LC 304**     | [二维区域和检索 - 矩阵不可变](https://leetcode.cn/problems/range-sum-query-2d-immutable)                                     | 🟢 简单 | 基础二维前缀和           |
| **LC 1314**    | [矩阵区域和](https://leetcode.cn/problems/matrix-block-sum/)                                                          | 🟡 中等 | 二维前缀和 + 滑动窗口      |
| **LC 308**（会员） | [二维区域和检索 - 可变](https://leetcode.cn/problems/range-sum-query-2d-mutable/)                                         | 🔴 困难 | 树状数组 / 线段树（动态前缀和） |
| **LC 1732**    | [找到最高海拔](https://leetcode.cn/problems/find-the-highest-altitude/)                                                | 🟢 简单 | 类前缀和（可推广到二维）      |
| **LC 1277**    | [统计全为 1 的正方形子矩阵](https://leetcode.cn/problems/count-square-submatrices-with-all-ones/)                           | 🟡 中等 | 前缀和优化判断           |
| **LC 3049**    | [最大边长的正方形](https://leetcode.cn/problems/largest-side-length-of-square-with-sum-less-than-or-equal-to-threshold/) | 🟡 中等 | 二维前缀和 + 二分        |

## 💡 拓展技巧

二维前缀和不仅可以用来“查询区域和”，还可以拓展为：

* 查询区域内最大/最小值（配合单调队列）
* 查询区域内的均值、频率（变种前缀计数）
* 多维数据处理：比如图像滤波、区域卷积等

# 参考资料

* any list
{:toc}