---
layout: post
title: 面试算法：动态规划解三角形最短路径详解
date:  2020-1-23 10:09:32 +0800 
categories: [Data-Struct]
tags: [data-struct, binary-tree, leetcode, sh]
published: true
---

# 题目

给定一个三角形 triangle ，找出自顶向下的最小路径和。

每一步只能移动到下一行中相邻的结点上。相邻的结点 在这里指的是 下标 与 上一层结点下标 相同或者等于 上一层结点下标 + 1 的两个结点。也就是说，如果正位于当前行的下标 i ，那么下一步可以移动到下一行的下标 i 或 i + 1 。

- 示例 1：

```
输入：triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]
输出：11
解释：如下面简图所示：
   2
  3 4
 6 5 7
4 1 8 3
自顶向下的最小路径和为 11（即，2 + 3 + 5 + 1 = 11）。
```

示例 2：

```
输入：triangle = [[-10]]
输出：-10
```

进阶：

你可以只使用 O(n) 的额外空间（n 为三角形的总行数）来解决这个问题吗？

# 思路一：失败的贪心算法

## 思路

看到这一题，我就在想，这是一道贪心，还是一道 DP 问题呢？

于是脑海中首先蹦出了贪心的解法。

整体流程如下：

（1）第一次选择，只有两种方式，要么向下，要么向下右。

（2）我们选择两者中最短的一个，作为下一次的结果

（3）依次根据 （1）（2），一直到结尾。

## java 实现

java 实现如下：

```java
public int minimumTotal(List<List<Integer>> triangle) {
    int[] greedy = new int[triangle.size()+1];
    greedy[0] = triangle.get(0).get(0);
    int ix = 0;
    // 第一个元素
    for(int i = 1; i < triangle.size(); i++) {
        // 针对第一步不变的元素
        ix = next(triangle, i, ix, greedy);
    }
    int size = triangle.size();
    return greedy[size-1];
}

// 下一步的处理逻辑
// 选择 i 和 i+1，选择更小的，并且返回新的 index
// 从 2 开始
private int next(List<List<Integer>> triangle,
                  int level, int preIndex,
                  int[] dp) {
    List<Integer> list = triangle.get(level);
    int minVal = list.get(preIndex);
    int minIndex = preIndex;
    int nextVal = list.get(preIndex+1);
    if(nextVal < minVal) {
        minVal = nextVal;
        minIndex = preIndex+1;
    }
    dp[level] = dp[level-1] + minVal;
    return minIndex;
}
```

## 反思

当然，贪心算法这样用肯定是不对的。

因为我们只顾及眼前一步的利益，而不是放眼全局，所以结果往往不是最优解。

# 思路2：动态规划

## 思路

实际上当我们能想到使用 DP 去解这一题的时候，已经成功了一半了。

我们只需要依次解决下面的问题即可：

（1）初始值是什么？

（2）递推公式是什么？

（3）边界情况的考虑

（4）最后结果的获取

### 初始值

如果我们创建 dp[][]，那么初始值显然就是第一个元素 `dp[0][0]  = triangle.get(0).get(0)`;

### 递推公式

这一题实际上和有一题的从左上角到右下角的路径非常类似。

我们从上往下，实际上对于当前的一个位置 f[i][j] 而言，只可能从 f[i-1][j]（正上方），或者 f[i-1][j-1]（正上方的左边一格）移动到当前位置。

我们就是要找到而这种最短的一个路径，作为后续路径：

```java
f[i][j] = Math.min(f[i-1][j], f[i-1][j-1]) + triangle.get(i).get(j);
```

### 边界的考虑

如果 i = 0，也就是当前行在最左边，那么到这里实际上只有一种可能，那就是正上方过来。

```java
dp[i][0] = dp[i-1][0] + triangle.get(i).get(0);
```

如果 i = i（也就是当前行的最右边），那么只能从上一行的最右边向下再向右一格得到：

```java
dp[i][i] = dp[i-1][i-1] + triangle.get(i).get(i);
```

### 最后的结果

我们把所有的结果都放在 dp 数组中，最后遍历数组，获取最小的就是最后的答案。

## java 实现

java 实现如下：

```java
public int minimumTotal(List<List<Integer>> triangle) {
    int size = triangle.size();
    int[][] dp = new int[size][size];

    // 初始化
    dp[0][0] = triangle.get(0).get(0);

    // 遍历（i 对应层级）
    for(int i = 1; i < size; i++) {
        //1. 如果为 0，上一层也只能为 0
        dp[i][0] = dp[i-1][0] + triangle.get(i).get(0);
        //2. 中间部分
        for(int j = 1; j < i; j++) {
            dp[i][j] = Math.min(dp[i-1][j], dp[i-1][j-1]) + triangle.get(i).get(j);
        }
        //3. 如果为 i
        dp[i][i] = dp[i-1][i-1] + triangle.get(i).get(i);
    }

    // 遍历获取最小的一个
    int minTotal = dp[size - 1][0];
    for (int i = 1; i < size; i++) {
        minTotal = Math.min(minTotal, dp[size - 1][i]);
    }
    return minTotal;
}
```

效果也不错：

```
Runtime: 1 ms, faster than 96.81% of Java online submissions for Triangle.
Memory Usage: 38.8 MB, less than 92.94% of Java online submissions for Triangle.
```

# 思路3：从下向上，滚动数组优化

## O(n) 空间的思路 1

当然，让我们回顾一下题目。

题目中问道，我们可以使用 O(n) 的额外空间来实现吗？

答案是肯定的，因为从地推公式 `f[i][j] = Math.min(f[i-1][j], f[i-1][j-1]) + triangle.get(i).get(j);` 可以知道，我们不必存放所有的元素，只需要保留上面的 2 个元素就行。

此处就不做展开。


## O(n) 空间的思路 2

我们重点要说的是，自下向上，使用 O(n) 额外空间的解决方案。

```
1
2 3
4 5 6
7 8 9 10
```

如果从下往上处理的话：

```
1
|\
2 3
|\|\
4 5 6
|\|\|\  
7 8 9 10
```

我们看 [7,8,9,10] 这几个元素，因为只能向下移动，或者下面的向右一格。

往上去的话，就是 [7,8] 对应4，[8,9] 对应 5，[9,10] 对应 6。

所以我们可以认为 4 这个位置，只需要取 [7,8] 位置中较小的值，然后加上当前值即可。可以一次类推，直到最上面的一个值，就是我们想要的结果。

## java

我们直接把最后一行初始化到 dp 数组中，额外空间为 O(n)。

这种实现更加优雅，是我个人非常喜欢的一种实现方式。

```java
public int minimumTotal(List<List<Integer>> triangle) {
    int size = triangle.size();
    // 最后一行，初始化到 dp
    int[] dp = new int[size];

    for(int i = 0; i < size; i++) {
        dp[i] = triangle.get(size-1).get(i);
    }
    for(int i = size-2; i >= 0; i--) {
        for(int j = 0; j <= i; j++) {
            dp[j] = Math.min(dp[j], dp[j+1]) + triangle.get(i).get(j);
        }
    }
    return dp[0];
}
```

效果：

```
Runtime: 1 ms, faster than 96.81% of Java online submissions for Triangle.
Memory Usage: 39.4 MB, less than 25.02% of Java online submissions for Triangle.
```

# 思路4：复用传入的数组

## 思路

如果问你，你可以不借助额外的空间，能实现最短路径的获取吗？

答案也是可以的，当然，我们不能无中生有。

整体解法思路和3类似。

我们做的，就是把值放在了入参数组中而已。

## java 实现

```java
public int minimumTotal(List<List<Integer>> triangle) {
    int size = triangle.size();
    // list 有太多的越界限制，导致性能很差。
    for(int i = size-2; i >= 0; i--) {
        for(int j = 0; j <= i; j++) {
            List<Integer> list = triangle.get(i);
            int min = Math.min(triangle.get(i+1).get(j), triangle.get(i+1).get(j+1)) + triangle.get(i).get(j);
            list.set(j, min);
        }
    }
    return triangle.get(0).get(0);
}
```

效果:

```
Runtime: 4 ms, faster than 36.07% of Java online submissions for Triangle.
Memory Usage: 38.7 MB, less than 92.94% of Java online submissions for Triangle.
```

可以发现这种方法的空间复杂度很低，但是性能一般。

个人猜测，应该是数组各种越界判断导致的。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

https://leetcode-cn.com/problems/triangle/

* any list
{:toc}