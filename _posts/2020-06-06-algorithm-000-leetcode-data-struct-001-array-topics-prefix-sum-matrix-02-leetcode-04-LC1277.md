---
layout: post
title:  【leetcode】Prefix Sum 二维前缀和 1277. 统计全为 1 的正方形子矩阵 count-square-submatrices-with-all-ones
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, prefix-sum, prefix-sum-matrix, leetcode]
published: true
---


# 开源地址

为了便于大家学习，所有实现均已开源。欢迎 fork + star~

> [https://github.com/houbb/leetcode](https://github.com/houbb/leetcode)

# 1277. 统计全为 1 的正方形子矩阵

给你一个 m * n 的矩阵，矩阵中的元素不是 0 就是 1，请你统计并返回其中完全由 1 组成的 正方形 子矩阵的个数。


示例 1：

输入：matrix =
[
  [0,1,1,1],
  [1,1,1,1],
  [0,1,1,1]
]
输出：15
解释： 
边长为 1 的正方形有 10 个。
边长为 2 的正方形有 4 个。
边长为 3 的正方形有 1 个。
正方形的总数 = 10 + 4 + 1 = 15.


示例 2：

输入：matrix = 
[
  [1,0,1],
  [1,1,0],
  [1,1,0]
]
输出：7
解释：
边长为 1 的正方形有 6 个。 
边长为 2 的正方形有 1 个。
正方形的总数 = 6 + 1 = 7.
 

提示：

1 <= arr.length <= 300
1 <= arr[0].length <= 300
0 <= arr[i][j] <= 1

# v1-暴力

## 思路

我们先用最基本的解法

最大的正方形是 maxSize = `Math.min(arr.length, arr[0].length)`

长度为1时，一直到 maxSize 时，计算每个数量，累加返回结果。

假设当前点是 (rowStart, colStart), 那么对应长度之后，

1) size = 1, 就是这个点本身 `(rowStart, colStart) == 1`

2) 其他的场景，都是统计 `(rowStart, colStart)` 到 `(rowStart+size-1, colStart+size-1)` 的点之和，如果等于 size * size，则说明满足。

## 实现

```java
public int countSquares(int[][] matrix) {
        int m = matrix.length;
        int n = matrix[0].length;

        int maxSize = Math.max(m, n);

        // 边长范围
        int total = 0;
        for(int size = 1; size <= maxSize; size++) {
            // 计算所有可能得数量
            int squareArea = size * size;


            // 所有的点
            for(int i = 0; i <= m-size; i++) {
                for(int j=0; j <= n-size; j++) {
                    int sum = calcSum(matrix, i, j, size);
                    if(squareArea == sum) {
                        total++;
                    }
                }
            }
        }

        return total;
    }

    private int calcSum(int[][] matrix,
                        int i,
                        int j,
                        int size) {
        // 注意边界值
        if(size == 1) {
            return matrix[i][j];
        }

        // 遍历累加
        int sum = 0;
        for(int row = i; row < i+size; row++) {
            for(int col = j; col < j+size; col++) {
                sum += matrix[row][col];
            }
        }
        return sum;
    }
```

## 效果

超出时间限制
22 / 32 个通过的测试用例

## 反思

这个比较可惜，用例没有那么仁慈。

# v2-二维前缀和

## 思路

可以看到我们在 calcSum 的时候，实际上是一个 O(n^2) 的复杂度。

如果使用二维前缀和，可以直接降低到 O(1) 的复杂度。


说白了，就是求一个二维矩阵 (i, j) 到 (i+size-1, j+size-1) 两个点之间的全部累加和，我们在 LC304 的基础上可以轻松拿捏。

> [leetcode】Prefix Sum 二维区域和检索 - LC304 矩阵不可变](https://houbb.github.io/2020/06/08/algorithm-000-leetcode-data-struct-001-array-topics-prefix-sum-matrix-02-leetcode-02-LC304)

## 核心模板

前缀和递归公式

```java
prefixSum[i+1][j+1] = prefixSum[i+1][j] + prefixSum[i][j+1] - prefixSum[i][j] + matrix[i][j];
```

读取方式：

```java
result = 
prefixSum[rowEnd+1][colEnd+1] - prefixSum[rowStart][colEnd+1] - prefixSum[rowEnd+1][colStart] + prefixSum[rowStart][colStart];
```

## 实现

```java
    public int countSquares(int[][] matrix) {
        int m = matrix.length;
        int n = matrix[0].length;
        int[][] prefixSum = new int[m+1][n+1];
        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                prefixSum[i+1][j+1] = prefixSum[i+1][j] + prefixSum[i][j+1] - prefixSum[i][j] + matrix[i][j];
            }
        }


        int maxSize = Math.max(m, n);
        // 边长范围
        int total = 0;
        for(int size = 1; size <= maxSize; size++) {
            // 计算所有可能得数量
            int squareArea = size * size;


            // 所有的点
            for(int i = 0; i <= m-size; i++) {
                for(int j=0; j <= n-size; j++) {
                    int sum = calcSum(matrix, i, j, size, prefixSum);
                    if(squareArea == sum) {
                        total++;
                    }
                }
            }
        }

        return total;
    }

    private int calcSum(int[][] matrix,
                        int i,
                        int j,
                        int size,
                        int[][] prefixSum) {
        // 注意边界值
        if(size == 1) {
            return matrix[i][j];
        }

        // 遍历累加
        int rowStart = i;
        int colStart = j;
        int rowEnd = i+size-1;
        int colEnd = j+size-1;

        return prefixSum[rowEnd+1][colEnd+1] - prefixSum[rowStart][colEnd+1] - prefixSum[rowEnd+1][colStart] + prefixSum[rowStart][colStart];
    }
```

## 效果

202 ms 击败 5.36%

## 反思

那么，还能改进呢？

# v3-提前剪枝

## 思路

我们之所以慢，是因为在计算了前面的和之后，如果不满足正方形，其实再往后遍历也没有意义。

都是不满的，扩展大小之后，依然不满足。

我们可以调整下循环的方式，最外层是 i,j，里层是正方形的边长。

这样剪枝的效果更好。

## 实现

```java
    public int countSquares(int[][] matrix) {
        int m = matrix.length;
        int n = matrix[0].length;
        int[][] prefixSum = new int[m + 1][n + 1];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                prefixSum[i + 1][j + 1] = prefixSum[i + 1][j] + prefixSum[i][j + 1] - prefixSum[i][j] + matrix[i][j];
            }
        }


        // 边长范围
        int total = 0;
        // 计算所有可能得数量
        // 所有的点
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                // 当前点最多能扩展到多大正方形
                int maxSize = Math.min(m - i, n - j);
                for (int size = 1; size <= maxSize; size++) {
                    int squareArea = size * size;

                    int rowEnd = i + size - 1;
                    int colEnd = j + size - 1;

                    int sum = prefixSum[rowEnd + 1][colEnd + 1]
                            - prefixSum[i][colEnd + 1]
                            - prefixSum[rowEnd + 1][j]
                            + prefixSum[i][j];

                    // 提前结束，说明后面都不满足
                    if (sum < squareArea) {
                        break;
                    }
                    total++;
                }
            }
        }

        return total;
    }
```

## 效果

8 ms 击败 20.31%

中规中矩的解法。

## 反思

基本到这里，就已经是二维前缀和的尽头了。

二维前缀和其实有一个很大的问题，在于很多累加过的位置，被重复累加了。

时间复杂度 `O(m·n·min(m,n))`

那么，如何可以复用提速呢？

答案就要走另一个方向，DP

# v4-DP 解法

## 思路转换

当前的版本

```java
for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        int maxSize = Math.min(m - i, n - j);
        for (int size = 1; size <= maxSize; size++) {
            // 计算从 (i,j) 出发 size x size 正方形是否全为 1（用前缀和）
            ...
        }
    }
}
```

核心思想是枚举正方形的“左上角 + 边长”，然后判断是否为全 1。

动态规划的思想其实是倒过来：

它枚举的是 **右下角**，并通过“子正方形”状态转移，推导出当前正方形的最大边长。

## DP

✅ 第一步：用 `dp[i][j]` 表示以 `(i,j)` 为**右下角**的最大正方形边长

之前检查的是 `(i,j)` 为左上角的区域是否全 1；现在我们关注的是 `(i,j)` 作为右下角，最大可以扩展出多大的正方形。

✅ 第二步：实现状态转移方程

对于 `matrix[i][j] == 1` 的位置，存在一个正方形，且它的最大边长由左、上、左上三个方向最小值决定：

```java
dp[i][j] = Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1
```

若 `matrix[i][j] == 0`，那这里不能构成任何正方形，`dp[i][j] = 0`

初始化的值 i,j 为 0 时，dp[i][j] = 1

### 疑问

1) 为什么 `dp[i][j] = Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1`

状态转移方程是最核心，也是最难理解的部分。

可以简单的理解为

```
■ ■
■ ?
```

因为我们的 ? 位置只看等于1的，所以只需要原来的左边、上边、左上都满足是正方形，且我们要看他们的最小边长，那么+1（当前点），依然是满足的。


## 复杂度

时间降到 O(m·n)

O(m·n)，可以进一步压缩

## 代码实现

```java
    public int countSquares(int[][] matrix) {
        int m = matrix.length;
        int n = matrix[0].length;
        int[][] dp = new int[m][n];

        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                // 只处理为1的场景
                if(matrix[i][j] == 1) {
                    // 初始化为0的情况，边界值
                    if(i == 0 || j == 0) {
                        dp[i][j] = 1;
                    } else {
                        dp[i][j] = Math.min(
                                Math.min(dp[i - 1][j], dp[i][j - 1]),
                                dp[i - 1][j - 1]
                        ) + 1;
                    }
                }
            }
        }

        // 这里对缓存行更加友好
        int total = 0;
        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                total += dp[i][j];
            }
        }

        return total;
    }
```

## DP 可视化在线

> [在线体验](https://houbb.github.io/leetcode-visual/T1277-dp-count-square-submatrices-with-all-ones.html)

## 效果

5 ms 击败 95.79%

这个已经是第一梯队算法，排名第一的思路和这个一样。

不过使用的是 dp[i+1][j+1]，避免了 `i == 0 || j == 0` 这种多余的判断，性能略好一些。

## 反思

当然，我们可以进一步的压缩空间，一般只是竞赛需要，这里暂时不展开。

后续专门学习 DP 可以考虑展开一下。


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

感兴趣的小伙伴可以关注一波，精彩内容，不容错过。


# 参考资料

https://leetcode.cn/problems/count-square-submatrices-with-all-ones/description/

* any list
{:toc}