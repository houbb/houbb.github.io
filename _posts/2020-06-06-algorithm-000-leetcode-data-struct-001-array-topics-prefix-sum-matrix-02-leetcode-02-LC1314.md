---
layout: post
title:  【leetcode】Prefix Sum 二维前缀和 LC1314 矩阵区域和 matrix-block-sum
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, prefix-sum-matrix, leetcode]
published: true
---


# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 1314. 矩阵区域和

给你一个 m x n 的矩阵 mat 和一个整数 k ，请你返回一个矩阵 answer ，其中每个 answer[i][j] 是所有满足下述条件的元素 mat[r][c] 的和： 

i - k <= r <= i + k, 
j - k <= c <= j + k 且
(r, c) 在矩阵内。
 

示例 1：

输入：mat = [[1,2,3],[4,5,6],[7,8,9]], k = 1
输出：[[12,21,16],[27,45,33],[24,39,28]]


示例 2：

输入：mat = [[1,2,3],[4,5,6],[7,8,9]], k = 2
输出：[[45,45,45],[45,45,45],[45,45,45]]
 

提示：

m == mat.length
n == mat[i].length
1 <= m, n, k <= 100
1 <= mat[i][j] <= 100

# 题目是什么意思

这个题目说的有点不太好理解。

你给定一个二维矩阵 `mat` 和一个整数 `k`。

你要**生成一个新的矩阵 `answer`**，这个矩阵的每个元素 `answer[i][j]` 是指：

> 以 `mat[i][j]` 为中心，向上下左右延伸 `k` 个距离，形成一个子矩形，**把这个子矩形里面所有的数字加起来**，作为 `answer[i][j]` 的值。

## 解释下题目的例子

输入：

```text
mat = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]
k = 1
```

我们来分析 `answer[1][1]` 是怎么得到的：

* 以 mat[1][1] = 5 为中心
* 向上下左右最多走 1 步
* 得到的子矩形是：

  ```
  [1, 2, 3]
  [4, 5, 6]
  [7, 8, 9]
  ```
* 总和是：1+2+3+4+5+6+7+8+9 = **45**
* 所以 `answer[1][1] = 45`

再比如 `answer[0][0]`：

* 以 mat[0][0] = 1 为中心，往外延伸 1 格（注意边界）
* 覆盖的子矩阵是：

  ```
  [1, 2]
  [4, 5]
  ```

* 总和是：1+2+4+5 = **12**
* 所以 `answer[0][0] = 12`

✅ 输出矩阵：

```text
[
  [12, 21, 16],
  [27, 45, 33],
  [24, 39, 28]
]
```

# v1-暴力法

## 思路

我们如果按照题目的条件

对于任何一个 mat[i][j]，都对其进行 k 的展开。

也就是上下左右 4 个方向，对应的顶点边缘，要考虑下边缘范围。

```
mat[i-k][j-k] 左上
mat[i+k][j+k] 右下
```

那么一个点，也就是我们一个二维循环可以计算这个点对应的实际累加和。

```java
for(int row=i-k; row <= i+k; row++) {
  for(int col=j-k; col <= col+k; col++) {
    sum += mat[row][col];
  }
}
```

## 解法

为了方便理解，我们把计算的方法单独拆分一下。

```java
  // 不包含自己
    public int[][] matrixBlockSum(int[][] mat, int k) {
        int[][] result = new int[mat.length][mat[0].length];
        for(int i = 0; i < mat.length; i++) {
            for(int j = 0; j < mat[0].length; j++) {
                // 计算当前位置的和
                int calc = calc(mat, k, i, j);
                result[i][j] = calc;
            }
        }

        return result;
    }

    private int calc(int[][] mat,
                     int k,
                     int i, int j) {
        // 要包含结尾
        int sum = 0;
        int rowStart = Math.max(0, i-k);
        int rowEnd = Math.min(i+k, mat.length-1);
        int colStart = Math.max(0, j-k);
        int colEnd = Math.min(j+k, mat[0].length-1);
        for(int row=rowStart; row <= rowEnd; row++) {
            for(int col=colStart; col <= colEnd; col++) {
                sum += mat[row][col];
            }
        }

        return sum;
    }
```

## 效果

AC 

76 ms 击败 5.50%

这就是中等难度的怜悯，实际上用例复杂点，就可以让其过不了。

# v2-二维前缀和

## 思路

其实，我们每次计算的方法是 O(N^2) 的，很慢，当然这个是可以提升到 O(1) 的。

没错，不是提升到 O(n)，而是 O(1)

我们可以通过二维前缀和来解决这个问题。

说白了，就是求一个二维矩阵 (rowStart, colStart) 到 (rowEnd, colEnd) 两个点之间的全部累加和，我们在 LC304 的基础上可以轻松拿捏。

> [leetcode】Prefix Sum 二维区域和检索 - LC304 矩阵不可变](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-topics-prefix-sum-matrix-02-leetcode-02-LC304)

## 核心算法

前缀和的初始化：

```java
int m = mat.length;
int n = mat[0].length;
int[][] prefixSum = new int[m+1][n+1];

// 累加
for(int i = 0; i < m; i++) {
  for(int j = 0; j < n; j++) {
    prefixSum[i+1][j+1] = prefixSum[i][j+1] + prefixSum[i+1][j] - prefixSum[i][j] + mat[i][j];
  }
}
```

每次的读取方式：

(rowStart, colStart) 到 (rowEnd, colEnd) 两个点之间的全部累加和

```java
return prefixSum[rowEnd+1][colEnd+1] - prefixSum[rowStart][colEnd+1] - prefixSum[rowEnd+1][colStart] + prefixSum[rowStart][colStart];
```

## 实现

```java
  public int[][] matrixBlockSum(int[][] mat, int k) {
        int m = mat.length;
        int n = mat[0].length;
        int[][] prefixSum = new int[m+1][n+1];
        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                prefixSum[i+1][j+1] = prefixSum[i][j+1] + prefixSum[i+1][j] - prefixSum[i][j] + mat[i][j];
            }
        }

        // 累加
        int[][] result = new int[mat.length][mat[0].length];
        for(int i = 0; i < mat.length; i++) {
            for(int j = 0; j < mat[0].length; j++) {
                // 计算当前位置的和
                int calc = calc(mat, k, i, j, prefixSum);
                result[i][j] = calc;
            }
        }

        return result;
    }

    private int calc(int[][] mat,
                     int k,
                     int i, int j,
                     int[][] prefixSum) {
        // 要包含结尾
        int rowStart = Math.max(0, i-k);
        int rowEnd = Math.min(i+k, mat.length-1);
        int colStart = Math.max(0, j-k);
        int colEnd = Math.min(j+k, mat[0].length-1);

        return prefixSum[rowEnd+1][colEnd+1] - prefixSum[rowStart][colEnd+1] - prefixSum[rowEnd+1][colStart] + prefixSum[rowStart][colStart];
    }
```

## 效果

2ms 击败 99.68%

## 反思

到这里，基本上符合这题的预期。





# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


# 参考资料

https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/

* any list
{:toc}