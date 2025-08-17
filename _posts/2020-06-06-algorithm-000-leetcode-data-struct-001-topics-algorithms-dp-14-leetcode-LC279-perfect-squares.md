---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 11-LC279. 完全平方数 perfect-squares
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下完全平方数

# LC279. 完全平方数 perfect-squares

给你一个整数 n ，返回 和为 n 的完全平方数的最少数量 。

完全平方数 是一个整数，其值等于另一个整数的平方；换句话说，其值等于一个整数自乘的积。

例如，1、4、9 和 16 都是完全平方数，而 3 和 11 不是。

示例 1：

输入：n = 12
输出：3 
解释：12 = 4 + 4 + 4
示例 2：

输入：n = 13
输出：2
解释：13 = 4 + 9
 
提示：

1 <= n <= 10^4



# v1-暴力

## 思路

# v1-dp 最大背包

## 思路

分为5 步：

1）定义好状态

dp[i] 代表数字 i 需要的最少平方数的最少数量。

2）状态转移方程（Transition）

背包问题。

我们可以这么考虑：

我们用一个数 `j = 1...sqrt(n)` 也就是

```java
for(int j=1; j*j <= i; j++) {
    dp[i] = Math.min(dp[i], dp[i-j*j]+1);
}
```

`j*j` 一定是一个完全平方数，往前找 `dp[i-j*j]` 这个最小次数。如果小于当前值，则更新。


3) 初始化（Initialization）

初始化的值应该是什么？对应的是什么含义？

```java
dp[1] = 1;  //数字1
dp[i] = i;  //初始化为最多全部用来加起来
```

特殊情况的提前处理

4) 计算顺序（Order）

通常是从小到大递推，也可能需要倒序（如背包问题）。

外层循环 i = 1...n

内层循环 j = 1...sqrt(n)

5) 返回结果（Answer）

一般是 dp\[n-1] / dp\[n]\[m]，有时需要在 dp 数组里取 max/min。

返回 dp[n]，代表第 n 个数需要的次数

6) 优化(可选)

是否要滚动数组优化空间？

空间压缩

## 实现

```java
   public int numSquares(int n) {
        int[] dp = new int[n+1];

        // 全部初始化为1
        for(int i = 1; i <=n ; i++) {
            dp[i] = i;
        }

        // 循环
        for(int i = 1; i <= n; i++) {
            for(int j = 1; j*j <= i; j++) {
                dp[i] = Math.min(dp[i], dp[i-j*j]+1);
            }
        }

        return dp[n];
    }
```

## 效果

51ms 击败 18.83%

## 复杂度

外层 n，内层 √n → O(n√n)，空间 O(n)。

## 反思

还有其他解法吗？

# v2-BFS

## 思路

把它当图最短路，常常更快

把每个数字看作节点，从 n 出发，每次减去一个平方数 j^2 到达新节点。第一遍到达 0 的层数，就是答案。

## 核心步骤

1) 预生成所有平方数 ≤ n。

2) 队列从 n 入队，step=0。

3) 每一层把当前所有数 x 取出，尝试 x - sq（所有平方数 sq）。

A 若得到 0，则返回 step+1。
B 没见过的数入队并标记。
C 剪枝优化 如果小于0，可以终止当前子循环 因为不够减了，没必要继续

4) 层次 +1，继续。

## 实现

```java
    public int numSquares(int n) {
        int step = 0;

        List<Integer> squares = new ArrayList<>();
        for(int i = 1; i*i <= n; i++) {
            squares.add(i*i);
        }

        // 队列
        // 访问过的数组
        Queue<Integer> queue = new LinkedList<>();
        boolean visited[] = new boolean[n+1];
        queue.offer(n);
        visited[n] = true;

        while(!queue.isEmpty()) {
            int size = queue.size();

            step++;

            for(int i = 0; i < size; i++) {
                Integer num = queue.poll();

                // 尝试-所有的平方数
                for(int squre : squares) {
                    // 下一个被减的数字
                    int next = num - squre;
                    if(next == 0) {
                        return step;
                    }
                    // 后面不用再看
                    if(next < 0) {
                        break;
                    }

                    // 把没见过的数字放入
                    if(!visited[next]) {
                        visited[next] = true;
                        queue.offer(next);
                    }
                }   
            }
            
        }

        return step;
    }
```

## 效果

26ms 击败 79.49%

## 复杂度

均摊表现很好，最坏情形可近似 O(n) 级别遍历。


# v3-数论

## 思路

这部分知道就行，或者就只能硬背了。

用到两个结论：

拉格朗日四平方定理：任何正整数都能写成 4 个平方数之和 → 答案 ∈ {1,2,3,4}

勒让德三平方定理的判别条件（常用简化）：把 n 不断除以 4（去掉 4 的因子）得到 m，如果 m % 8 == 7，那么答案 必为 4。

## 核心流程

若 n 本身是平方数 → 返回 1。

判断是否可以表示为 两个平方数之和：枚举 a^2 ≤ n，看 n - a^2 是否是平方 → 是则返回 2。

去 4 因子：while (n % 4 == 0) n /= 4;，若 n % 8 == 7 → 返回 4。

否则返回 3。

## 实现

```java
    public int numSquares(int n) {
        if (isSquare(n)) return 1;
        for (int a = 1; a * a <= n; a++) {
            if (isSquare(n - a * a)) return 2;
        }
        int m = n;
        while (m % 4 == 0) m /= 4;
        if (m % 8 == 7) return 4;
        return 3;
    }

    private boolean isSquare(int x) {
        int r = (int)Math.sqrt(x);
        return r * r == x;
    }
```


## 效果

0ms 100%

## 反思

如果拿出数学的时候，基本上是这一套的题的天花板了。

# 开源项目

为方便大家学习，所有相关文档和代码均已开源。

[leetcode-visual 资源可视化](https://github.com/houbb/leetcode-visual)

[leetcode 算法实现源码](https://github.com/houbb/leetcode)

[leetcode 刷题学习笔记](https://github.com/houbb/leetcode-notes)

[老马技术博客](https://houbb.github.io/)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

下一节我们将讲解力扣经典，感兴趣的小伙伴可以关注一波，精彩内容，不容错过。

* any list
{:toc}