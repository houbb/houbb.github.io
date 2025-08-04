---
layout: post
title:  【leetcode】Prefix Sum 二维区域和检索 - LC304 矩阵不可变
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, prefix-sum-matrix, leetcode]
published: true
---


# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# LC 304 二维区域和检索 - 矩阵不可变

🔗 题目链接（中文版）：[https://leetcode.cn/problems/range-sum-query-2d-immutable/](https://leetcode.cn/problems/range-sum-query-2d-immutable/)

## 📝 题目描述：

给你一个 `m x n` 的整数矩阵 `matrix`，请你**预处理**它，计算其前缀和，使得能在 **O(1)** 时间内计算出任意一个子矩阵 `(row1, col1)` 到 `(row2, col2)` 的元素总和。

实现类 `NumMatrix`：

```java
class NumMatrix {
    public NumMatrix(int[][] matrix) {}
    public int sumRegion(int row1, int col1, int row2, int col2) {}
}
```

---

### ✅ 方法调用说明：

* `NumMatrix numMatrix = new NumMatrix(matrix);`
  初始化对象，构建二维前缀和

* `numMatrix.sumRegion(row1, col1, row2, col2);`
  返回左上角为 `(row1, col1)`，右下角为 `(row2, col2)` 的矩阵元素之和

---

### 🧮 示例：

```java
输入:
matrix = [
  [3, 0, 1, 4, 2],
  [5, 6, 3, 2, 1],
  [1, 2, 0, 1, 5],
  [4, 1, 0, 1, 7],
  [1, 0, 3, 0, 5]
]
sumRegion(2, 1, 4, 3) -> 8
sumRegion(1, 1, 2, 2) -> 11
sumRegion(1, 2, 2, 4) -> 12
```


解释：

从 (2,1) 到 (4,3) 这个矩形区域内的数字加起来是多少？

```
[2,1] ➡ [4,3] 包含这些数：
  2 0 1
  1 0 1
  0 3 0

它们的和是 2+0+1+1+0+1+0+3+0 = 8
```

# v1-暴力解法

## 思路

我们直接用暴力解法

变成了 i,j 的点之和，其中 `row1<=i<=row2, col1<=j<=col2`. 然后循环累加

## 解法

```java
int sum = 0;
for (int i = row1; i <= row2; i++) {
    for (int j = col1; j <= col2; j++) {
        sum += matrix[i][j];
    }
}
return sum;
```

## 反思

虽然能过一些用例，但当查询次数很多或者矩形很大时，会很慢：

每次查询复杂度是：O((row2 - row1 + 1) × (col2 - col1 + 1))

这个复杂度是 O(n^2)，那么有没有办法优化呢？

# v2-前缀和部分？

## 思路

每一行的累加，从[col1, col2]，我们可以想到用前缀和来优化。

比如我们预处理每一行的前缀和：

```java
// prefixSum[i][j] 表示第 i 行，从第 0 列到第 j-1 列的和
prefixSum[i][j+1] = prefixSum[i][j] + matrix[i][j];
```

查询 (row1, col1) 到 (row2, col2) 的子矩阵和时，可以这样做：

```java
int sum = 0;
for (int i = row1; i <= row2; i++) {
    sum += prefixSum[i][col2 + 1] - prefixSum[i][col1];
}
```

这样可以将 每行区间和从 O(col2 - col1 + 1) 优化成 O(1)，但是需要对每一行循环一次，整体还是 O(row2 - row1 + 1)。

但是只能优化每一行的累加和吗？每一列的怎么办呢？

如果我们从列的角度出发，会导致另一个问题，按照行的时候，情况还是没有得到改进。

也就是困境：

1. 用行前缀和优化，按行遍历，时间和行数成正比。

2. 用列前缀和优化，按列遍历，时间和列数成正比。

可以进一步优化吗？

# v3-二维前缀和

## 可视化理解

假设一个 5*5 的矩阵，如果求 (2,2)->(3,3) 的累加之和。

那么：

![二维前缀和](https://i-blog.csdnimg.cn/direct/a2ba226bce3c4c71971953f4d1bcf1db.png#pic_center)

解释：

因为黄色部分被多减掉一次，需加回来。结合图还是比较好理解的

你可以在线体验

> [二维前缀和在线体验](https://houbb.github.io/leetcode-visual/T304-prefix-sum-matrix-summary.html)

## 思路

我们利用二维前缀和的方式，这个模板理解之后直接套用即可。

这里需要理解两个部分：

1）前缀和的构建

```java
int m = matrix.length;
int n = matrix[0].length;
int[][] prefixSum = new int[m+1][n+1];

// 初始化构造
for(int i = 0; i < m; i++) {
  for(int j = 0; j < n; j++) {
    // 初始化 
    // 当前 = 左边+上边-重复的部分+当前点
    prefixSum[i+1][j+1] = prefixSum[i+1][j] + prefixSum[i][j+1] - prefixSum[i][j] + matrix[i][j];
  }
}
```

2) 前缀和的查询

查询任意 (row1, col1) 到 (row2, col2) 的结果

```java
result
= prefixSum[row2+1][col2+1] - prefixSum[row1][col2+1] - prefixSum[row2+1][col2] + prefixSum[row1][col1]
```


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/

* any list
{:toc}