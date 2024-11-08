---
layout: post
title:  【leetcode】62-337. house-robber-iii  力扣 337. 打家劫舍 III  dynamic-programming
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, dp, dynamic-programming, leetcode]
published: true
---

# 题目

小偷又发现了一个新的可行窃的地区。这个地区只有一个入口，我们称之为 root 。

除了 root 之外，每栋房子有且只有一个“父“房子与之相连。一番侦察之后，聪明的小偷意识到“这个地方的所有房屋的排列类似于一棵二叉树”。 

如果 两个直接相连的房子在同一天晚上被打劫 ，房屋将自动报警。

给定二叉树的 root 。

返回 在不触动警报的情况下 ，小偷能够盗取的最高金额 。

示例 1:

![demo1](https://assets.leetcode.com/uploads/2021/03/10/rob1-tree.jpg)

```
输入: root = [3,2,3,null,3,null,1]
输出: 7 
```

解释: 小偷一晚能够盗取的最高金额 3 + 3 + 1 = 7

示例 2:

![demo2](https://assets.leetcode.com/uploads/2021/03/10/rob2-tree.jpg)

```
输入: root = [3,4,5,1,3,null,1]
输出: 9
```

解释: 小偷一晚能够盗取的最高金额 4 + 5 = 9

# v1-dp

## 这一题还上一题的区别

首先我们就不吐槽题目本身了。

这一题主要是一个树的遍历问题：

树要如何实现遍历呢？

中序 前序 后序 层序





## 个人思路



### 初始化


## 效果


## 小结 

这一题和上一题基本上是一样的。

区别就是把环拆分为 2 个子数组，然后复用上一题的解法。

这样，可以让实现变得非常简单。

DP 的性能一直没话说，最主要是要考虑清楚几个点：

1）数据初始化

2）递推公式

3）最大值的对比获取+返回

最难的是递推公式的获取。

当然还可以做内存的压缩改进。

# 参考资料

https://leetcode.cn/problems/house-robber/description/?envType=problem-list-v2&envId=dynamic-programming

* any list
{:toc}