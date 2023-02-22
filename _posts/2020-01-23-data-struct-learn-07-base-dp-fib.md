---
layout: post
title: 面试算法：斐波那契数列时间复杂度为 O(1) 的解法，你会吗？
date:  2020-1-23 10:09:32 +0800
categories: [Data-Struct]
tags: [data-struct, algorithm, sh]
published: true
---

# 题目

今天，我们就重新学习一下，这个每一位学习过递归的同学都见过的题目—斐波那契数列。

但是，你真的理解这个数列了吗？

[509. 斐波那契数](https://leetcode-cn.com/problems/fibonacci-number/)

斐波那契数，通常用 F(n) 表示，形成的序列称为 斐波那契数列 。

该数列由 0 和 1 开始，后面的每一项数字都是前面两项数字的和。

也就是：

F(0) = 0，F(1) = 1

F(n) = F(n - 1) + F(n - 2)，其中 n > 1

给你 n ，请计算 F(n) 。

- 示例 1：

```
输入：2
输出：1
解释：F(2) = F(1) + F(0) = 1 + 0 = 1
```

提示：

0 <= n <= 30

# 思路1-递归

这一题作为递归的入门例子，相信每一位学过的都很容易实现：

```java
public int fib(int n) {
    if(n <= 1) {
        return n;
    }
    return fib(n-1) + fib(n-2);
}
```

效果：

```
Runtime: 6 ms, faster than 30.76% of Java online submissions for Fibonacci Number.
Memory Usage: 35.9 MB, less than 37.14% of Java online submissions for Fibonacci Number.
```

递归实现起来确实简单，但是效果并不怎么样。

那么，应该如何提升性能呢？

# 思路2-动态规划

## 思路分析

当然，当一个问题可以细化为子问题的时候，就可以使用 DP 去解决。

（1）初始化条件

```
dp[0] = 0;
dp[1] = 1;
```

（2）递推公式

```
dp[n] = dp[n-1] + dp[n-2]
```

## java 实现

java 实现起来也不难。

```java
public int fib(int n) {
    if(n <= 1) {
        return n;
    }
    
    int[] dp = new int[n+1];
    dp[0] = 0;
    dp[1] = 1;
    for(int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}
```

### 效果

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Fibonacci Number.
Memory Usage: 35.9 MB, less than 37.14% of Java online submissions for Fibonacci Number.
```

### 复杂度

时间复杂度为 O(N)，空间复杂度也为 O(N)。

## 时间复杂度优化

如果面试官觉得空间复杂度太高，有办法优化吗？

你会如何解决？

### 滚动数组

这里就要提到一个 DP 问题中老生常谈的滚动数组优化的方法。

通过递推公式：

```
dp[n] = dp[n-1] + dp[n-2]
```

我们最后的结果，只和前两项有关，所以空间可以压缩为 2 个元素。

### java 实现

```java
public static int fib(int n) {
    if(n <= 1) {
        return n;
    }
    int pre = 0;
    int current = 1;
    for(int i = 2; i <= n; i++) {
        int temp = current;
        current = pre + current;
        pre = temp;
    }
    return current;
}
```

效果如下：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Fibonacci Number.
Memory Usage: 35.7 MB, less than 65.02% of Java online submissions for Fibonacci Number.
```

当然，对于一般的面试官而言，回答到这里，基本上算是这个问题告一段落了。

不过，如果换做是老马，会在问你一个问题。

上面的解法时间复杂度是 O(N)，你可以进一步优化吗？

# 思路3-拓展篇

## 矩阵-O(logn) 复杂度

当然，这里只是一个拓展问题，不知道也不影响。

《剑指 Offer》 中也提到了这个不是很实用的解法，是一个矩阵，感兴趣的可以查一下。

矩阵一般都是大学高等数学篇，这里老马介绍一个初中的数学解题方式。

## 递推公式

当然，你可以随便百度一下 [斐波那契数列](https://baike.baidu.com/item/%E6%96%90%E6%B3%A2%E9%82%A3%E5%A5%91%E6%95%B0%E5%88%97/99145?fr=aladdin)

等比数列的通向公式：

![通向公式](https://bkimg.cdn.bcebos.com/formula/6a79d456d05de649023252cae49590da.svg)

### java 实现

```java
private static final double FAC_ONE = 1 / Math.sqrt(5);
private static final double FAC_TWO = 0.5 + Math.sqrt(5) / 2;
private static final double FAC_THREE = 0.5 - Math.sqrt(5) / 2;

public static int fib(int n) {
    if(n <= 1) {
        return n;
    }
    return (int) (FAC_ONE * (Math.pow(FAC_TWO, n) - Math.pow(FAC_THREE, n)));
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Fibonacci Number.
Memory Usage: 35.6 MB, less than 65.02% of Java online submissions for Fibonacci Number.
```

复杂度：时间 O(1)，空间 O(1)。

# 思路4-空间换时间

那如果面试官还是问你有没有比 O(N) 更快的实现方式，并且需要你实现呢？

一般人很难记住拓展篇中的 2 种解法，那么，到底应该怎么才能更快呢？

## 空间换时间

实际上，空间和时间永远都是一个需要去平衡的问题。

我们回顾一下题目，0 <= n <= 30。

于是，应该可以很自然的想到，首先把所有的数字算好，然后直接通过查表法获取即可。

```java
private static final int[] nums = new int[]{
        0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811, 514229, 832040
};

public static int fib(int n) {
    return nums[n];
}
```

效果：

```
Runtime: 0 ms, faster than 100.00% of Java online submissions for Fibonacci Number.
Memory Usage: 35.8 MB, less than 37.14% of Java online submissions for Fibonacci Number.
```

### 复杂度

时间：O(1)

空间: O(N)，不过这里 N 是一个不大的常量，可以接受。

# 爬楼梯问题

## 题目

假设你正在爬楼梯。需要 n 阶你才能到达楼顶。

每次你可以爬 1 或 2 个台阶。

你有多少种不同的方法可以爬到楼顶呢？

注意：给定 n 是一个正整数。

- 示例 1：

```
输入： 2
输出： 2
解释： 有两种方法可以爬到楼顶。
1.  1 阶 + 1 阶
2.  2 阶
```

## 思路

但是看到这一题的时候，你的解题思路是什么呢？

```
// 如果为1，只有1中
// 如果为2，则有 11 或者 2
// 如果为3  111 12 21
// 如果为4  1111 112 121 211 22
// 有两种方式：第一次走一步；第一次走两步。
```

这一题可以拆分为第一次走1步，第一次走两步。

递推公式如下：

```
dp[i] = dp[i-1] + dp[i-2];
```

所以这一题的本质还是斐波那契数列。

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

只能说学无止境，妙不可言。

# 拓展阅读

- 91. decode ways

- 62. Unique Paths

- 70. Climbing Stairs

- 509. Fibonacci Number

# 参考资料

https://leetcode-cn.com/problems/climbing-stairs/

* any list
{:toc}