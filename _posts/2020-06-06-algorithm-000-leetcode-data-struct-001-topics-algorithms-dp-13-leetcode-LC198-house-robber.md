---
layout: post
title: leetcode 算法篇专题之动态规划 dynamic-programming 11-LC198. 打家劫舍 house-robber
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, topics, leetcode, dynamic-programming, dp, sf]
published: true
---


# 数组

大家好，我是老马。

今天我们一起来学习一下打家劫舍，看得出来，要成为一个有文化的盗贼。

# LC198. 打家劫舍 house-robber

你是一个专业的小偷，计划偷窃沿街的房屋。

每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。

给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃到的最高金额。

示例 1：

输入：[1,2,3,1]
输出：4
解释：偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。
     偷窃到的最高金额 = 1 + 3 = 4 。
示例 2：

输入：[2,7,9,3,1]
输出：12
解释：偷窃 1 号房屋 (金额 = 2), 偷窃 3 号房屋 (金额 = 9)，接着偷窃 5 号房屋 (金额 = 1)。
     偷窃到的最高金额 = 2 + 9 + 1 = 12 。
 

提示：

1 <= nums.length <= 100
0 <= nums[i] <= 400


# v1-dp

## 思路

分为5 步：

1）定义好状态，dp[i] / dp[i][j] 具体指什么？

dp[i] 代表抢 i 个房子，可以获取的最大收益。

2）状态转移方程（Transition）

dp[i] 的最大收益分为两个场景

A. nums[i] + dp[i-2]; //上一家没抢   
B. dp[i-1];           //上一家抢了  

取二者的最大值

`dp[i] = max(nums[i] + dp[i-2], dp[i-1])`

3) 初始化（Initialization）

初始化的值应该是什么？对应的是什么含义？

```java
dp[0] = nums[0];    //抢第一家
dp[1] = Math.max(nums[0], nums[1]); //第二家的最大收益
```

特殊情况的提前处理

4) 计算顺序（Order）

通常是从小到大递推，也可能需要倒序（如背包问题）。

我们从第 i = 2 开始遍历

5) 返回结果（Answer）

一般是 dp\[n-1] / dp\[n]\[m]，有时需要在 dp 数组里取 max/min。

返回 dp[n-1]，代表第 n-1 个位置的最大收益。 

6) 优化(可选)

是否要滚动数组优化空间？

空间压缩

## 实现

```java
    public int rob(int[] nums) {
        int n = nums.length;
        if(n <= 1) {
            return nums[0];
        }

        int[] dp = new int[n+1];
        dp[0] = nums[0];
        dp[1] = Math.max(nums[0], nums[1]);

        // 开始迭代
        for(int i = 2; i < n; i++) {
            dp[i] = Math.max(dp[i-1], dp[i-2] + nums[i]);
        }

        return dp[n-1];
    }
```

## 效果

0ms 100% 

## 反思

我们可以对空间进一步压缩吗？

# v2-空间压缩

## 思路

实际上我们只用到了两个前面的变量

pre1 pre2

滚动更新即可

## 实现

```java
public int rob(int[] nums) {
        int n = nums.length;
        if(n <= 1) {
            return nums[0];
        }

        int pre1 = nums[0];
        int pre2 = Math.max(nums[0], nums[1]);

        // 开始迭代
        for(int i = 2; i < n; i++) {
            int temp = Math.max(pre2, pre1 + nums[i]);

            pre1 = pre2;
            pre2 = temp;
        }

        return pre2;
}
```

## 效果

0ms 击败 100.00%

40.11MB 击败 83.25%

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