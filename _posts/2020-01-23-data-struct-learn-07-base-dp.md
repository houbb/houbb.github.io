---
layout: post
title: 五大基本算法之动态规划算法 DP dynamic programming
date:  2020-1-23 10:09:32 +0800
categories: [Data-Struct]
tags: [data-struct, algorithm, sh]
published: true
---

# dynamic programming

动态规划(dynamic programming)是运筹学的一个分支，是求解决策过程(decision process)最优化的数学方法。

20世纪50年代初美国数学家R.E.Bellman等人在研究多阶段决策过程(multistep decision process)的优化问题时，提出了著名的最优化原理(principle of optimality)，把多阶段过程转化为一系列单阶段问题，利用各阶段之间的关系，逐个求解，创立了解决这类过程优化问题的新方法——动态规划。

1957年出版了他的名著《Dynamic Programming》，这是该领域的第一本著作。

## 写在前面

计算机归根结底只会做一件事：穷举。

所有的算法都是在让计算机【如何聪明地穷举】而已，动态规划也是如此。

# 动态规划与递归

动态规划是自底向上，递归树是自顶向下

为什么动态规划一般都脱离了递归，而是由循环迭代完成计算。

## 啥叫「自顶向下」？

注意我们刚才画的递归树（或者说图），是从上向下延伸，都是从一个规模较大的原问题比如说 f(20)，向下逐渐分解规模，直到 f(1) 和 f(2) 触底，然后逐层返回答案，这就叫「自顶向下」

```cpp
int Fibonacci(size_t n)    
{
	if(n == 1 || n == 2)
	{
		return n;
	}
	 return Fibonacci1(n-1) + Fibonacci1(n-2);
}
```

ps: 大家应该还记得，递归的实现看起来很优雅，实际上有很大的限制。计算的数值稍微大一点，基本上是算不出来的。

## 啥叫「自底向上」？

反过来，我们直接从最底下，最简单，问题规模最小的 f(1) 和 f(2) 开始往上推，直到推到我们想要的答案 f(20)，这就是动态规划的思路，这也是为什么动态规划一般都脱离了递归，而是由循环迭代完成计算。

```cpp
// 动态规划法计算斐波那契数列
int fib(int N) {
    vector<int> dp(N + 1, 0);
    dp[1] = dp[2] = 1;
    for (int i = 3; i <= N; i++)
        dp[i] = dp[i - 1] + dp[i - 2];
    return dp[N];
}
```

## 状态转移方程

这里，引出「状态转移方程」这个名词，实际上就是描述问题结构的数学形式：

可见列出「状态转移方程」的重要性，它是解决问题的核心。

很容易发现，其实状态转移方程直接代表着暴力解法。

千万不要看不起暴力破解，动态规划问题最困难的就是写出状态转移方程，

# 便于理解的例子

## 题目

```
7
3 8
8 1 0
2 7 4 4 
4 5 2 6 5
```

从上到下选择一条路，使得经过的数字之和最大。

路径上的每一步只能往左下或者右下走。

## 递归解法

可以看出每走第n行第m列时有两种后续:向下或者向右下

由于最后一行可以确定,当做边界条件,所以我们自然而然想到递归求解

```java
class Solution{

	public int getMax(){
		int MAX = 101;
		int[][] D = new int[MAX][MAX];   //存储数字三角形
		int n;              //n表示层数
		int i = 0; int j = 0;
		int maxSum = getMaxSum(D,n,i,j);
		return maxSum;
	}

	public int getMaxSum(int[][] D,int n,int i,int j){
		if(i == n){
			return D[i][j];
		}
		int x = getMaxSum(D,n,i+1,j);
		int y = getMaxSum(D,n,i+1,j+1);
		return Math.max(x,y)+D[i][j];
	}
}
```

### 重复计算

其实仔细观察,上面的解答过程时间复杂度难以想象的大,那是因为他对有的数字的解进行了多次的重复计算,具体如下图:

括号中代表计算次数，默认为 1 次。

```
7
3 8
8 1(2) 0
2 7(3) 4(3) 4 
4 5(4) 2(6) 6(4) 5
```

如果不明白上图,可以把每条路径都画出来,观察每个数字有多少条路径经过了他,就会一目了然

然后我们就可以自然而然的想到,**如果我们每次都把结果保存下来,复杂度就会大大降低。**

ps: 这里就是动态规划最核心的思想。

## 动态规划解法

核心代码部分。

```java
for(int i = n-1; i >= 1; i--) {
	for(int j = 1; j <= i; j++>) {
		maxSum[i][j] = Math.max(maxSum[i+1][j], maxSum[i+1][j+1]);
	}
}
```

其实,仔细观察该解题过程,该过程就是标准的动态规划解题过程,如果把该过程画出来(找到每一步的最优解,其他的舍弃)对动态规划会有更深刻的解法


# 爬楼梯

## 题目

https://leetcode.com/problems/climbing-stairs/

You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

- Example 1:

```
Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps
```

= Example 2:

```
Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step
```

Constraints:

1 <= n <= 45

## 解题思路

// 如果为1，只有1中
// 如果为2，则有 11 或者 2
// 如果为3  111 12 21
// 如果为4  1111 112 121 211 22
// 有两种方式：第一次走一步；第一次走两步。

这一题可以拆分为第一次走1步，第一次走两步。地推公式如下：

```
dp[i] = dp[i-1] + dp[i-2];
```

## java 实现

实现也非常的简单。

```java
public int climbStairs(int n) {
    int[] dp = new int[n+1];
    dp[0] = 1;
    dp[1] = 2;
    for(int i = 2; i < n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n-1];
}
```

运行效果

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Climbing Stairs.
Memory Usage: 35.4 MB, less than 91.67% of Java online submissions for Climbing Stairs.
```

## 滚动数组优化

当然，我们的最后结果，只和 dp[i-1] 和 dp[i-2] 有关，所以可以使用滚动数组优化。

```java
public int climbStairs(int n) {
    int pre = 1;
    if(n <= 1) {
        return pre;
    }
    int current = 2;
    for(int i = 2; i < n; i++) {
        int temp = current;
        current += pre;
        pre = temp;
    }
    return current;
}
```

不过这是理论的优化，实际效果反而下降了。。

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Climbing Stairs.
Memory Usage: 35.6 MB, less than 71.64% of Java online submissions for Climbing Stairs.
```

ps: 忽然发现，这实际上就是一个斐波那契额数列。妙不可言。

# 算法实战-路径

## 题目

我们以 [leetcode 第 62 题为例](https://leetcode-cn.com/problems/unique-paths)，感受一下 DP 的魅力。

一个机器人位于一个 m x n 网格的左上角 （起始点在下图中标记为 “Start” ）。

机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为 “Finish” ）。

问总共有多少条不同的路径？

![example1](https://assets.leetcode.com/uploads/2018/10/22/robot_maze.png)

## 思路

说一下你的第一感觉？

你会通过穷举法来解决吗？

## 递归法

我们先说下递归法。

像走到终点，实际只有 2 条路：

如果是 m*n 的网格，目标就是 (m, n)

（1）走到终点的左边 (m-1, n)

（2）走到终点的上边 (m, n-1)

不同的路径就是上面两条路的和。

递归实现非常简单：

```java
public int uniquePaths(int m, int n) {
    if(m == 1 || n == 1) {
        return 1;
    }

    return uniquePaths(m - 1, n) + uniquePaths(m , n -1);
}
```

当然，这个算法本身没啥问题，但是递归有一个致命的问题，那就是性能问题。

比如 leetcode 执行的 case 51*9 就直接超时了。

那么，应该如何优化性能呢？

## 动态规划

实际上看到这里，再结合一下前面的斐波那契额，我想聪明如你肯定知道了如何解决这个问题。

从上到下解不出来，我们自下而上解不就行了。

### 动态规划转移方程

dp 最核心的是要找到方程。

我们假设 f(m,n) 是从左上到右下的所有可能路径数。

同理，想到大 f(m,n) 依然是 2 条路，从 (m-1, n) 向右一步达到，或者从 (m, n-1) 向下一步到达。

对应的方程：

```
f(m, n) = f(m-1, n) + f(m, n-1);
```

### java 实现方式

实现方式如下：

```java
public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for(int i = 0; i < m; i++) {
        for(int j = 0; j < n; j++) {
            // 这种其实是不符合条件的，不过我们设定初始值 dp[0][0] = 1
            if(i == 0 || j == 0) {
                dp[i][j] = 1;
            } else {
                dp[i][j] = dp[i-1][j] + dp[i][j-1];
            }
        }
    }
    
    // 返回所有可能的结果
    return dp[m-1][n-1];
}
```

执行速度：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Unique Paths.
Memory Usage: 37.8 MB, less than 9.51% of Java online submissions for Unique Paths.
```

### 复杂度

时间复杂度：O(m*n)

空间复杂度：O(m * n)


## 排列组合

虽然上面的性能已经 100% 了，但实际上封号斗罗和封号斗罗还是有差距的。

那么，有没有更快的解决方法呢？

### 组合

从左上角到右下角的过程中，我们需要移动 m+n−2 次，其中有 m−1 次向下移动，n−1 次向右移动。

因此路径的总数，就等于从 m+n-2 次移动中选择 m-1 次向下移动的方案数，即组合数：

```
C（（m+n-2），（m-1））
```

时间复杂度为O(n)，空间复杂度O(1)

### 实现

```java
public int uniquePaths(int m, int n) {
    long ans = 1;
    for (int x = n, y = 1; y < m; ++x, ++y) {
        ans = ans * x / y;
    }
    return (int) ans;
}
```

# 不同路径-障碍物版本

## 题目

一个机器人位于一个 m x n 网格的左上角 （起始点在下图中标记为“Start” ）。

机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为“Finish”）。

现在考虑网格中有障碍物。那么从左上角到右下角将会有多少条不同的路径？

网格中的障碍物和空位置分别用 1 和 0 来表示。

### 例子

![robot1.jpg](https://assets.leetcode.com/uploads/2020/11/04/robot1.jpg)

```
输入：obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]
输出：2
解释：
3x3 网格的正中间有一个障碍物。
从左上角到右下角一共有 2 条不同的路径：
1. 向右 -> 向右 -> 向下 -> 向下
2. 向下 -> 向下 -> 向右 -> 向右
```

## 分析

实际上就算解决了上面一题，我们解决这个障碍还是不太好处理。

（1）状态方程

也许你会想，遇到障碍我要绕着走，但这种“动态”的想法不符合 DP “状态”的思路

我们思考单个点的“状态”：

1. 障碍点，是无法抵达的点，是到达方式数为 0 的点

2. 是无法从它这里走到别的点的点，即无法提供给别的点方式数的点

递推公式和不同路径一样，dp[i][j] = dp[i - 1][j] + dp[i][j - 1]。

但这里需要注意一点，因为有了障碍，(i, j)如果就是障碍的话应该就保持初始状态（初始状态为0）。

```java
if (obstacleGrid[i][j] == 0) { // 当(i, j)没有障碍的时候，再推导dp[i][j]
    dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
}
```

（2）dp 数组的初始化

没有障碍物的场景，达到 (i, 0) 和 (0, j) 的路径数都是固定的，固定为1。有且只有一条路。

如果加上障碍物的话，对应的位置，路径数为0。

而且要注意，**障碍物后面的位置也是无法到达的，路径数也应该为 0**。

```java
for (int i = 0; i < m && obstacleGrid[i][0] == 0; i++) dp[i][0] = 1;
for (int j = 0; j < n && obstacleGrid[0][j] == 0; j++) dp[0][j] = 1;
```

（3）遍历顺序

我们依旧是从左到右，从上到下遍历。

```java
for (int i = 1; i < m; i++) {
    for (int j = 1; j < n; j++) {
		// 如果遇到障碍物，则跳过。
        if (obstacleGrid[i][j] == 1) continue;
		// 当然，也可以只在为 0 的时候才处理。
        dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
}
```

## java 实现

我们把上面的几步合并起来，实现如下：

```java
public int uniquePathsWithObstacles(int[][] obstacleGrid) {
    int m = obstacleGrid.length;
    int n = obstacleGrid[0].length;
    int[][] dp = new int[m][n];
    // 初始化
    for(int i = 0; i < m; i++) {
        // 存在障碍物
        if(obstacleGrid[i][0] == 1) {
            break;
        }
        dp[i][0] = 1;
    }
    for(int j = 0; j < n; j++) {
        // 存在障碍物
        if(obstacleGrid[0][j] == 1) {
            break;
        }
        dp[0][j] = 1;
    }

    // 遍历
    for(int i = 1; i < m; i++) {
        for(int j = 1; j < n; j++) {
            if(obstacleGrid[i][j] == 0) {
                dp[i][j] = dp[i-1][j] + dp[i][j-1];
            }
        }
    }
    return dp[m-1][n-1];
}
```

很显然我们可以给出一个时间复杂度 O(nm) 并且空间复杂度也是 O(nm) 的实现。

## 滚动数组思想优化

上面的实现可以进一步优化吗？

由于这里 f(i, j) 只与 f(i - 1, j) 和 f(i, j - 1)相关，我们可以运用「滚动数组思想」把空间复杂度优化称 O(m)。

当我们定义的状态在动态规划的转移方程中只和某几个状态相关的时候，就可以考虑这种优化方法，目的是给空间复杂度「降维」。

优化后的实现如下（这个是官方的解决方案）：

```java
public int uniquePathsWithObstacles(int[][] obstacleGrid) {
    int n = obstacleGrid.length, m = obstacleGrid[0].length;
    int[] f = new int[m];

    f[0] = obstacleGrid[0][0] == 0 ? 1 : 0;

    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < m; ++j) {
            if (obstacleGrid[i][j] == 1) {
                f[j] = 0;
                continue;
            }
            if (j - 1 >= 0 && obstacleGrid[i][j - 1] == 0) {
                f[j] += f[j - 1];
            }
        }
    }
    
    return f[m - 1];
}
```

空间复杂度：O(m)。利用滚动数组优化，我们可以只用 O(m)大小的空间来记录当前行的 f 值。

# 滚动数组

## 简介

滚动数组是DP中的一种编程思想。

简单的理解就是让数组滚动起来，每次都使用固定的几个存储空间，来达到压缩，节省存储空间的作用。

因为 DP 题目是一个自底向上的扩展过程，**我们常常需要用到的是连续的解，前面的解往往可以舍去**，所以用滚动数组优化是很有效的。

## 斐波那契的例子

```c
int i;
long long d[80];
d[0]=1;
d[1]=1;
for(i=2;i<80;i++)
{
    d[i]=d[i-1]+d[i-2];
}
```

上面这个循环d[i]只依赖于前两个数据d[i - 1]和d[i - 2]; 为了节约空间用滚动数组的做法。

```c
int i;
long long d[3];

d[1]=1;
d[2]=1;
for(i=2;i<80;i++)
{
    d[0]=d[1];
    d[1]=d[2];
    d[2]=d[0]+d[1]; 
}
```

原来需要 80，实际上可以压缩为 3，因为 3 个元素的位置就已经足够了。

## 二维数组压缩

这个就是我们前面的唯一路径的例子。

```java
int i, j, d[100][100];
for(i = 1; i < 100; i++)
    for(j = 0; j < 100; j++)
        d[i][j] = d[i - 1][j] + d[i][j - 1];
```

上面的d[i][j]只依赖于d[i - 1][j], d[i][j - 1]; 

利用滚动数组:

```c
int i, j, d[2][100];
for(i = 1; i < 100; i++)
    for(j = 0; j < 100; j++)
        d[i % 2][j] = d[(i - 1) % 2][j] + d[i % 2][j - 1];
```


# 最小路径之和

## 题目

https://leetcode-cn.com/problems/minimum-path-sum/

给定一个包含非负整数的 m x n 网格 grid ，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。

说明：每次只能向下或者向右移动一步。

### 示例 1：

![minpath](https://assets.leetcode.com/uploads/2020/11/05/minpath.jpg)

```
输入：grid = [[1,3,1],[1,5,1],[4,2,1]]

输出：7
```

解释：因为路径 1→3→1→1→1 的总和最小。

## 递归解法

为了便于理解，我们首先实现一个递归版本。

```java
public int minPathSum(int[][] grid) {
    int m = grid.length;
    int n = grid[0].length;
    return getMin(grid, m-1, n-1);
}

private int getMin(int[][] grid, int i, int j) {
    // 起点位置
    if(i == 0 && j == 0) {
        return grid[0][0];
    }
    // 第一行，想到达这里，说明前面肯定是水平向右，否则肯定不会在第一行
    if(i == 0) {
        return grid[i][j] + getMin(grid, i, j-1);
    }
    // 第一列，说明肯定是垂直到打这里。否则肯定不会在第一列
    if(j == 0) {
        return grid[i][j] + getMin(grid, i-1, j);
    }
    // 直接返回当前 + 前面的最小值即可。
    int minRow = getMin(grid, i-1, j);
    int minColumn = getMin(grid, i, j-1);
    // 找到最小的距离
    return grid[i][j] + Math.min(minRow, minColumn);
}
```

## DP 版本

接下来，就是将递归转变为递归的方式：

初始化：

我们处理一下第一行+第一列，以及开始位置。

```java
// 初始化
int[][] dp = new int[m][n];
dp[0][0] = grid[0][0];
for(int i = 1; i < m ;i++) {
    dp[i][0] = dp[i-1][0] + grid[i][0];
}
for(int i = 1; i < n;i++) {
    dp[0][i] = dp[0][i-1] + grid[0][i];
}
```

状态转移方程:

最小的和，就是当前的位置元素+前面最小的和。

```java
// 通过状态转移方程
dp[i][j] = grid[i][j] + Math.min(dp[i-1][j], dp[i][j-1]);
```

完整扽实现如下：

```java
public int minPathSum(int[][] grid) {
    int m = grid.length;
    int n = grid[0].length;

    // 初始化
    int[][] dp = new int[m][n];
    dp[0][0] = grid[0][0];
    for(int i = 1; i < m ;i++) {
        dp[i][0] = dp[i-1][0] + grid[i][0];
    }
    for(int i = 1; i < n;i++) {
        dp[0][i] = dp[0][i-1] + grid[0][i];
    }

    // 循环处理
    for(int i = 1; i < m; i++) {
        for(int j = 1; j < n; j++) {
            // 通过状态转移方程
            dp[i][j] = grid[i][j] + Math.min(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[m-1][n-1];
}
```

### 换一种方式

当然，也可以直接使用原来的数组，节省一点空间。

```java
public int minPathSum(int[][] grid) {
    int m = grid.length;
    int n = grid[0].length;
    for(int i = 0; i < m; i++) {
        for(int j = 0; j < n; j++) {
            if(i ==0 && j == 0) {
               continue;
            }
            // 累加距离
            if(i == 0) {
                // 第一行，只能从左边过来。
                grid[i][j] = grid[i][j] + grid[i][j-1];
            } else if(j == 0) {
                // 第一列，只能从上面过来
                grid[i][j] = grid[i][j] + grid[i-1][j];
            } else {
                // 通过状态转移方程
                grid[i][j] = grid[i][j] + Math.min(grid[i-1][j], grid[i][j-1]);
            }
        }
    }
    return grid[m-1][n-1];
}
```

TODO: 首先系统学习一下下面的三个系列：

（1）回溯

https://leetcode.com/tag/backtracking/

（2）贪心

https://leetcode.com/tag/greedy/

（3）动态规划

https://leetcode.com/tag/dynamic-programming/

# Decode Ways

https://leetcode.com/problems/decode-ways/

## 题目

A message containing letters from A-Z can be encoded into numbers using the following mapping:

'A' -> "1"
'B' -> "2"
...
'Z' -> "26"

To decode an encoded message, all the digits must be grouped then mapped back into letters using the reverse of the mapping above (there may be multiple ways). For example, "11106" can be mapped into:

"AAJF" with the grouping (1 1 10 6)
"KJF" with the grouping (11 10 6)
Note that the grouping (1 11 06) is invalid because "06" cannot be mapped into 'F' since "6" is different from "06".

Given a string s containing only digits, return the number of ways to decode it.

The answer is guaranteed to fit in a 32-bit integer.

- Example 1:

```
Input: s = "12"
Output: 2
Explanation: "12" could be decoded as "AB" (1 2) or "L" (12).
```

- Example 2:

```
Input: s = "226"
Output: 3
Explanation: "226" could be decoded as "BZ" (2 26), "VF" (22 6), or "BBF" (2 2 6).
```

- Example 3:

```
Input: s = "0"
Output: 0
Explanation: There is no character that is mapped to a number starting with 0.
The only valid mappings with 0 are 'J' -> "10" and 'T' -> "20", neither of which start with 0.
Hence, there are no valid ways to decode this since all digits need to be mapped.
```

- Example 4:

```
Input: s = "06"
Output: 0
Explanation: "06" cannot be mapped to "F" because of the leading zero ("6" is different from "06").
```

Constraints:

- 1 <= s.length <= 100

- s contains only digits and may contain leading zero(s).

## 解题思路

我们沿着 [https://leetcode.com/problems/decode-ways/discuss/30451/Evolve-from-recursion-to-dp](https://leetcode.com/problems/decode-ways/discuss/30451/Evolve-from-recursion-to-dp)

的解题流程，来看一下 dp 的整体思考过程。

[https://leetcode-cn.com/problems/decode-ways/](https://leetcode-cn.com/problems/decode-ways/)

## 思考过程

dp[i] 为 s[0...i] 的编码数。

最优子结构。

（1）如果 s[i] == '0'

如果 s[i-1] == '1' || s[i-1] == '2'，和上一个元素可以组成 10/20。

此时 dp[i] = dp[i-2]。

否则直接返回 0。

解释：s[i-1] + s[i] 最多唯一构成一个字母的映射。

（2）如果 s[i-1] == '1'

则 dp[i] = dp[i-1] + dp[i-2]

解释：s[i-1] 和 s[i] 可以分开组合。开始的数值为1，后面的数值 0-9 都满足条件。

（3）如果 s[i-1] == '2' and  1 <= s[i] <= 6

则 dp[i] = dp[i-1] + dp[i-2]

解释：s[i-1] 和 s[i] 可以分开组合。不过此时要求数值为 21~26。


## 动态规划实现

为了便于大家理解，我们首先使用 O(n) 的空间来实现。

```java
public int numDecodings(String s) {
    char[] chars = s.toCharArray();

    // s[i] 为0，而且没有上一个元素。
    if(chars[0] == '0') {
        return 0;
    }

    int len = s.length();
    int[] dp = new int[len+1];
    // dp[-1] = dp[0] = 1
    // 为什么初始化为 1？？
    // 因为此时 chars[0] != '0'，所以 dp[0] = 1;
    // dp[-1] 这里也是1，纯粹是为了 dp[i-1] 时的推导。
    dp[0] = 1;
    dp[1] = 1;

    // 开始遍历
    for(int i = 1; i < len; i++) {
        //1. 如果当前元素为0
        if (chars[i] == '0') {
            //s[i - 1]等于1或2的情况
            if (chars[i - 1] == '1' || chars[i - 1] == '2') {
                //由于s[1]指第二个下标，对应为dp[2],所以dp的下标要比s大1，故为dp[i+1]
                dp[i+1] = dp[i-1];
            } else {
                return 0;
            }
        } else {
            //s[i-1]s[i]两位数要小于26的情况
            if (chars[i - 1] == '1' || (chars[i - 1] == '2' && chars[i] <= '6')) {
                dp[i+1] = dp[i]+dp[i-1];
            } else {
                // 即当前状态值等于前一个状态
                dp[i+1] = dp[i];
            }
        }
    }

    return dp[len];
}
```

## 滚动数组 DP

当然，实际上最后的结果，只依赖 dp[i-1] + dp[i-2]。

所以空间复杂度可以降低到 O(1)

```java
public int numDecodings2(String string) {
    char[] s = string.toCharArray();
    if (s[0] == '0') {
        return 0;
    }

    int len = string.length();
    int pre = 1, curr = 1;//dp[-1] = dp[0] = 1
    for (int i = 1; i < len; i++) {
        int tmp = curr;
        if (s[i] == '0') {
            if (s[i - 1] == '1' || s[i - 1] == '2') {
                curr = pre;
            } else {
                return 0;
            }
        } else if (s[i - 1] == '1' || (s[i - 1] == '2' && s[i] >= '1' && s[i] <= '6')) {
            curr = curr + pre;
        }
        // 让上一个值迭代更新。
        pre = tmp;
    }
    return curr;
}
```

# 97. 交错字符串

[交错字符串](https://leetcode-cn.com/problems/interleaving-string/)

## 题目

给定三个字符串 s1、s2、s3，请你帮忙验证 s3 是否是由 s1 和 s2 交错 组成的。

两个字符串 s 和 t 交错 的定义与过程如下，其中每个字符串都会被分割成若干 非空 子字符串：

s = s1 + s2 + ... + sn

t = t1 + t2 + ... + tm

|n - m| <= 1

交错 是 s1 + t1 + s2 + t2 + s3 + t3 + ... 或者 t1 + s1 + t2 + s2 + t3 + s3 + ...

提示：a + b 意味着字符串 a 和 b 连接。

- 示例 1：

![ex1](https://assets.leetcode.com/uploads/2020/09/02/interleave.jpg)

```
输入：s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"
输出：true
```

- 示例 2：

```
输入：s1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"
输出：false
```

- 示例 3：

```
输入：s1 = "", s2 = "", s3 = ""
输出：true
```

## 思路1-双指针法

看到这一题，感觉简单啊。

直接两个指针，从左到右遍历 s3，如果和 s1 相同，则 s1 的指针+1；如果和 s2 相同，则 s2 的指针+1。

### java 实现

```java
public boolean isInterleave(String s1, String s2, String s3) {
    if(s1.length() + s2.length() != s3.length()) {
        return false;
    }
    char[] one = s1.toCharArray();
    char[] two = s2.toCharArray();
    int oneIndex = 0;
    int twoIndex = 0;
    char[] three  =s3.toCharArray();
    for(int i = 0; i < three.length; i++) {
        char c = three[i];
        if(oneIndex < one.length && c == one[oneIndex]) {
            oneIndex++;
        } else if(twoIndex < two.length && c == two[twoIndex]) {
            twoIndex++;
        } else {
            return false;
        }
    }
    return true;
}
```

### 反思

这里存在一个思考的误区。

比如对于 "aabcc", "dbbca", "aadbbcbcac" 我们得到的是 false，实际上应该是 true。

## 思路2-动态规划

最基本的判断：如果 s1.len + s2.len != s3.len，则直接返回 false。

令f(i,j) 表示 s1 的前 i 个字符和 s2 的前 j 个字符能否交错组成 s3的前 i+j 个字符。

（1）初始值

f(0,0) = true

（2）递推公式

接下来，我们需要找到最核心的东西，递推公式。

交错从s1和s2拿元素，但每次可能拿多个

示例1的交错方式为：

```
s1: aa    bc     c
s2:    db    bca
```

所以，如果s1的前i个字符和s2的前j个字符，能够交替拼出s3的前i+j个字符的话， 那么，s3的下一个字符随便从s1还是s2拿都是有可能的。

理解了这一点，递推关系就有了：

递推关系： 令p = i+j-1, f(0,0)=true, 则f(i,j)有两种情况为真：

```
1、f(i-1,j) && s1[i-1]==s3[p]
2、f(i,j-1) && s2[j-1]==s3[p]
```

### java 实现

找到上面的关系之后，编码也变得简单起来：

```java
public boolean isInterleave(String s1, String s2, String s3) {
    int m  = s1.length();
    int n  = s2.length();
    if(m+n != s3.length()) {
        return false;
    }

    boolean[][] dp = new boolean[m+1][n+1];
    dp[0][0] = true;

    for(int i = 0; i  <= m; i++) {
        for(int j = 0; j <= n; j++) {
            int p = i+j-1;
            if(i > 0) {
                dp[i][j] = dp[i][j] || (dp[i - 1][j] && s1.charAt(i - 1) == s3.charAt(p));
            }
            if(j > 0) {
                dp[i][j] = dp[i][j] || (dp[i][j-1] && s2.charAt(j - 1) == s3.charAt(p));
            }
        }
    }

    // 获取结果
    return dp[m][n];
}
```

效果：

```
Runtime: 4 ms, faster than 54.21% of Java online submissions for Interleaving String.
Memory Usage: 37.3 MB, less than 53.38% of Java online submissions for Interleaving String.
```

复杂度：

时间、空间都是 O(m*n)

## 优化-滚动数组


### 优化思路

针对滚动数组优化，参见 [Approach 4: Using 1D Dynamic Programming](https://leetcode.com/problems/interleaving-string/solution/)

```
dp[i][j] = dp[i][j] || (dp[i - 1][j] && s1.charAt(i - 1) == s3.charAt(p));

dp[i][j] = dp[i][j] || (dp[i][j-1] && s2.charAt(j - 1) == s3.charAt(p));
```

通过状态转移方程来看，只用到了dp[i-1][j]和dp[i][j-1],即上一层的数据，再之前的数据就没有用了。可以将二维空间压缩成一维。

### java 实现

```java
public boolean isInterleave(String s1, String s2, String s3) {
    int m  = s1.length();
    int n  = s2.length();
    if(m+n != s3.length()) {
        return false;
    }
    boolean[] dp = new boolean[n+1];
    dp[0] = true;
    for(int i = 0; i  <= m; i++) {
        for(int j = 0; j <= n; j++) {
            int p = i+j-1;
            if(i > 0) {
                dp[j] = dp[j] && s1.charAt(i - 1) == s3.charAt(p);
            }
            if(j > 0) {
                dp[j] = dp[j] || (dp[j-1] && s2.charAt(j - 1) == s3.charAt(p));
            }
        }
    }
    // 获取结果
    return dp[n];
}
```


效果:

```
Runtime: 2 ms, faster than 84.77% of Java online submissions for Interleaving String.
Memory Usage: 36.9 MB, less than 97.75% of Java online submissions for Interleaving String.
```



https://zhuanlan.zhihu.com/p/334726877

# 拓展阅读

- 91. decode ways

- 62. Unique Paths

- 70. Climbing Stairs

- 509. Fibonacci Number

# 参考资料

[百度百科-动态规划](https://baike.baidu.com/item/%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%92/529408?fr=aladdin)

[知乎-如何理解动态规划？](https://www.zhihu.com/question/39948290)

[动态规划](https://www.cnblogs.com/rise0111/p/11471407.html)

[斐波那契的递归与非递归](https://blog.csdn.net/YL970302/article/details/85852361)

[六大算法之三：动态规划](https://blog.csdn.net/zw6161080123/article/details/80639932)

[动态规划(详细解释,从入门到实践,逐步讲解)](https://blog.csdn.net/ailaojie/article/details/83014821)

[【算法复习】动态规划](https://www.cnblogs.com/hithongming/p/9229871.html)

https://www.jianshu.com/p/40064cb0d5f3

https://leetcode-cn.com/problems/unique-paths-ii/solution/shou-hua-tu-jie-dp-si-lu-by-hyj8/

https://leetcode-cn.com/problems/unique-paths-ii/solution/63-bu-tong-lu-jing-iidong-tai-gui-hua-ji-6h8h/

[滚动数组思想，运用在动态规划当中](https://blog.csdn.net/weixin_40295575/article/details/80181756)

[动态规划空间优化之滚动数组](https://blog.csdn.net/qq_36378681/article/details/98657014)

[详细通俗的思路分析，多解法](https://leetcode-cn.com/problems/interleaving-string/solution/xiang-xi-tong-su-de-si-lu-fen-xi-duo-jie-fa-by-2-9/)

* any list
{:toc}