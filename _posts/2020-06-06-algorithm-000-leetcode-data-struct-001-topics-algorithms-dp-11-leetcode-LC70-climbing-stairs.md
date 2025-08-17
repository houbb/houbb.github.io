---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 11-LC70 爬楼梯 climbing-stairs
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下 LC70 爬楼梯。

# LC70 爬楼梯 climbing-stairs

假设你正在爬楼梯。需要 n 阶你才能到达楼顶。

每次你可以爬 1 或 2 个台阶。

你有多少种不同的方法可以爬到楼顶呢？

示例 1：

输入：n = 2
输出：2
解释：有两种方法可以爬到楼顶。
1. 1 阶 + 1 阶
2. 2 阶
示例 2：

输入：n = 3
输出：3
解释：有三种方法可以爬到楼顶。
1. 1 阶 + 1 阶 + 1 阶
2. 1 阶 + 2 阶
3. 2 阶 + 1 阶
 
提示：

1 <= n <= 45

# v1-dp

## 思路

1）定义好状态

dp[i] 代表爬到第 i 层有多少种方法

数组一般定义为 dp[n+1]

2）状态转移方程（Transition）

dp[i] 可以通过 dp[i-1] 爬1步 + dp[i-2] 爬2步

```
dp[i] = dp[i-1] + dp[i-2];
```

3) 初始化（Initialization）

```java
dp[0] = 1;  // 为了兼容递推，在地面不动。只有一种方法。
dp[1] = 1;  // 第一层只有一种方法
```

4) 计算顺序（Order）

从 i=2 开始递推

```java
for(int i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
}
```

5) 返回结果（Answer）

第 n 个阶梯？

直接返回 dp[n]，因为代表爬第 n 个阶梯共有多少种方式。

6) 优化(可选)

空间压缩

## 实现

```java
public int climbStairs(int n) {
    int[] dp = new int[n+1];

    dp[0] = 1;
    dp[1] = 1;

    for(int i = 2; i <= n; i++ ) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    
    return dp[n];
}
```

## 效果

0ms 100%

# v2-空间优化

## 思路

目前的 dp 数组，空间是 O(n)，我们可以优化为 O(1) 吗？

我们的递推公式

```
dp[i] = dp[i-1] + dp[i-2]
```

所以，其实我们只需要关注 i-1 和 i-2 两个位置。

初始化呢？

```
int pre = 1;    // 第一个阶梯
int cur = 2;    // 第2个阶梯
```

## 实现

```java
public int climbStairs(int n) {
        if(n <= 1) {
            return 1;
        }

        int pre = 1;
        int cur = 2;
        for(int i = 3; i <= n; i++ ) {
            int temp = pre + cur;

            // 更新
            pre = cur;
            cur = temp;
        }
        
        return cur;
}
```

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