---
layout: post
title: leetcode 85 maximal rectangle
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, stack, sh]
published: true
---

# 85. Maximal Rectangle 

Given a rows x cols binary matrix filled with 0's and 1's, find the largest rectangle containing only 1's and return its area.

## Ex

Example 1:

![ex1](https://assets.leetcode.com/uploads/2020/09/14/maximal.jpg)

```
Input: matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]
Output: 6
Explanation: The maximal rectangle is shown in the above picture.
```

Example 2:

```
Input: matrix = [["0"]]
Output: 0
```

Example 3:

```
Input: matrix = [["1"]]
Output: 1
```

## Constraints:

rows == matrix.length

cols == matrix[i].length

1 <= row, cols <= 200

matrix[i][j] is '0' or '1'.

# V1-暴力算法

## 思路

我们直接遍历整个 m[i][j]，然后以当前位置作为出发点，向下向右遍历。

```
m[i][j]  x x x
x
x
x
```

1) 如果 `m[i][j] == 0`，直接跳过。

2) 如果不是，则向右向下，一直到矩阵的最右下角，构成一个矩形。判断这个矩形是不是全部是1

3）如果全部是1，则更新计算 maxArea 的值。

## java

```java
public class T085_MaximalRectangle {

    private boolean isAllOnes(char[][] matrix,
                              int xStart,
                              int xEnd,
                              int yStart,
                              int yEnd) {
        for(int x = xStart; x <= xEnd; x++) {
            for(int y = yStart; y <= yEnd; y++) {
                if(matrix[x][y] == '0') {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 最大的长方形
     * @param matrix 矩阵
     * @return
     */
    public int maximalRectangle(char[][] matrix) {
        int maxArea = 0;

        // 行
        int rowSize = matrix.length;
        // 列
        int columnSize = matrix[0].length;

        // 直接遍历整个矩阵
        for(int i = 0; i < rowSize; i++) {
            for(int j = 0; j < columnSize; j++) {
                // 当前位置为0，则跳过
                if(matrix[i][j] == '0') {
                    continue;
                }

                // 从当前位置开始，向右向下遍历。
                for(int x = i; x < rowSize; x++) {
                    for(int y = j; y < columnSize; y++) {
                        // 跳过为0的元素
                        if(matrix[x][y] == '0') {
                            continue;
                        }

                        // 判断从 横介于[i,x]，纵介于[j,y]的矩阵。
                        // 如果这个矩阵都是1，则计算更新对应的 area。
                        if(isAllOnes(matrix, i, x, j, y)) {
                            int area = (x-i+1) * (y-j + 1) ;
                            maxArea = Math.max(maxArea, area);
                        }
                    }
                }
            }
        }

        return maxArea;
    }

}
```


当然，这个时间复杂度为 O(N^6)，在 70/74 的时候直接 GG。

# V2-初步优化

## 思路

我们在判断是否都是 1 的时候，显然会不断的重复这个过程。

如果能用 cache 记录一下这个过程，可以复用。

```java
boolean[][] isAllOneCache = new boolean[][];
```

更新逻辑：

```java
boolean isOneFlag = matrix[p][q]=='1';

// 左边的结果 & 当前
if(p>i) dp[p][q] = isOneFlag & dp[p-1][q];

// 上边的结果 & 当前
if(q>j) dp[p][q] = isOneFlag & dp[p][q-1];
```

## 实现

```java
public class T085_MaximalRectangleV2 {

    /**
     * 最大的长方形
     *
     * 优化思路：缓存对于是否全部为 1 的判断
     * @param matrix 矩阵
     * @return
     */
    public int maximalRectangle(char[][] matrix) {
        int maxArea = 0;

        // 行
        int rowSize = matrix.length;
        // 列
        int columnSize = matrix[0].length;

        // 直接遍历整个矩阵
        for(int i = 0; i < rowSize; i++) {
            for(int j = 0; j < columnSize; j++) {
                // 当前位置为0，则跳过
                if(matrix[i][j] == '0') {
                    continue;
                }

                // 是否都为1的缓存
                boolean[][] allOneDp = new boolean[rowSize][columnSize];

                // 从当前位置开始，向右向下遍历。
                for(int x = i; x < rowSize; x++) {
                    for(int y = j; y < columnSize; y++) {
                        allOneDp[x][y] = matrix[x][y] == '1';

                        // 复用以前的
                        if(x > i) {
                            allOneDp[x][y] = allOneDp[x][y] & allOneDp[x-1][y];
                        }
                        if(y > j) {
                            allOneDp[x][y] = allOneDp[x][y] & allOneDp[x][y-1];
                        }

                        // 如果满足，则计算更新
                        if(allOneDp[x][y]) {
                            maxArea = Math.max(maxArea, (x-i+1)*(y-j+1));
                        }
                    }
                }
            }
        }

        return maxArea;
    }

}
```

这个 TC 为 O(N^4)，不过还是会在 70/74 超时。


# V3-O(n^2)

## 思路

我们可以在 2D 矩阵的每一行中应用直方图中的最大值。 我们需要的是为每一行维护一个 int 数组，它代表直方图的高度。

请先参考https://leetcode.com/problems/largest-rectangle-in-histogram/。

假设有一个二维矩阵

```
1 1 0 1 0 1

0 1 0 0 1 1

1 1 1 1 0 1

1 1 1 1 0 1
```

首先将高度数组初始化为 1 1 0 1 0 1，这只是第一行的副本。 然后我们可以很容易地计算出最大面积为2。

然后更新数组。 我们扫描第二行，当matrix[1][i]为0时，设置height[i]为0； else height[i] += 1，这意味着高度增加了 1。所以高度数组再次变为 0 2 0 0 1 2。现在最大面积也是 2。

应用相同的方法，直到我们扫描整个矩阵。 最后一个高度数组是 2 4 2 2 0 4，所以最大面积为 2 * 4 = 8。

那么我们扫描整个矩阵的原因是最大值可能出现在高度的任何一行。


## 实现

```java
    public int maximalRectangle(char[][] matrix) {
        if (matrix == null || matrix.length == 0 || matrix[0].length == 0) {
            return 0;
        }

        int[] height = new int[matrix[0].length];
        for (int i = 0; i < matrix[0].length; i++) {
            if (matrix[0][i] == '1') {
                height[i] = 1;
            }
        }
        int result = largestInLine(height);
        for (int i = 1; i < matrix.length; i++) {
            resetHeight(matrix, height, i);
            result = Math.max(result, largestInLine(height));
        }

        return result;
    }

    private void resetHeight(char[][] matrix, int[] height, int idx) {
        for (int i = 0; i < matrix[0].length; i++) {
            if (matrix[idx][i] == '1') {
                height[i] += 1;
            } else {
                height[i] = 0;
            }
        }
    }

    public int largestInLine(int[] height) {
        if (height == null || height.length == 0) {
            return 0;
        }
        int len = height.length;
        Stack<Integer> s = new Stack<>();
        int maxArea = 0;
        for (int i = 0; i <= len; i++) {
            int h = (i == len ? 0 : height[i]);
            if (s.isEmpty() || h >= height[s.peek()]) {
                s.push(i);
            } else {
                int tp = s.pop();
                maxArea = Math.max(maxArea, height[tp] * (s.isEmpty() ? i : i - 1 - s.peek()));
                i--;
            }
        }
        return maxArea;
    }
```




# 参考资料

https://leetcode.com/problems/maximal-rectangle/solutions/29055/my-java-solution-based-on-maximum-rectangle-in-histogram-with-explanation/

https://leetcode.com/problems/maximal-rectangle/solutions/29054/share-my-dp-solution/

https://leetcode.com/problems/maximal-rectangle/solutions/29094/evolve-from-brute-force-to-optimal/

https://leetcode.com/problems/maximal-rectangle/

* any list
{:toc}