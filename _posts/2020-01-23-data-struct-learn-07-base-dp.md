---
layout: post
title: 五大基本算法之动态规划算法 DP dynamic programming
date:  2020-1-23 10:09:32 +0800
categories: [Data-Struct]
tags: [data-struct, block-chain, sh]
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

* any list
{:toc}