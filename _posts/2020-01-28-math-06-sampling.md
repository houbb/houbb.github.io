---
layout: post
title: 抽样方法
date:  2020-1-28 10:09:32 +0800
categories: [Math]
tags: [math, random, sf]
published: true
---

# 背景

给定一个的概率分布 P(x), 我们希望产生服从该分布的样本。

前面介绍过一些随机采样算法（如拒绝采样、重要性采样）可以产生服从特定分布的样本，但是这些采样算法存在一些缺陷（如难以选取合适的建议分布，只适合一元随机变量等）。

下面将介绍一种更有效的随机变量采样方法：MCMC 和 Gibbs采样，这两种采样方法不仅效率更高，而且适用于多元随机变量的采样。

# 随机模拟

随机模拟也可以叫做蒙特卡罗模拟(Monte Carlo Simulation)。

这个方法的发展始于20世纪40年代，和原子弹制造的曼哈顿计划密切相关，当时的几个大牛，包括乌拉姆、冯.诺依曼、费米、费曼、Nicholas Metropolis， 在美国洛斯阿拉莫斯国家实验室研究裂变物质的中子连锁反应的时候，开始使用统计模拟的方法,并在最早的计算机上进行编程实现。

随机模拟中有一个重要的问题就是给定一个概率分布p(x)，我们如何在计算机中生成它的样本。

一般而言均匀分布 Uniform(0,1)的样本是相对容易生成的。 

通过线性同余发生器可以生成伪随机数，我们用确定性算法生成[0,1]之间的伪随机数序列后，这些序列的各种统计指标和均匀分布 Uniform(0,1) 的理论计算结果非常接近。

这样的伪随机序列就有比较好的统计性质，可以被当成真实的随机数使用。

# 蒙特卡洛数值积分

如果我们要求f(x)的积分，而f(x)的形式比较复杂积分不好求，则可以通过数值解法来求近似的结果。

常用的方法是蒙特卡洛积分：

这样把q(x)看做是x在区间内的概率分布，而把前面的分数部门看做一个函数，然后在q(x)下抽取n个样本，当n足够大时，可以用采用均值来近似：

因此只要 q（x）比较容易采到数据样本就行了。

随机模拟方法的核心就是如何对一个概率分布得到样本，即抽样（sampling）。

下面我们将介绍常用的抽样方法。

## 均匀分布，Box-Muller 变换

在计算机中生成[0,1]之间的伪随机数序列，就可以看成是一种均匀分布。

而随机数生成方法有很多，最简单的如：

```
x_n+1 = (a*x_n + c) mod m;
```

当然计算机产生的随机数都是伪随机数，不过一般也就够用了。

## [Box-Muller 变换]  

如果随机变量 U1,U2 独立且U1,U2∼Uniform[0,1]，

![image](https://user-images.githubusercontent.com/18375710/73351680-875bf880-42ca-11ea-8322-be3544d85611.png)

则 Z0,Z1 独立且服从标准正态分布。

# Monte Carlo principle

Monte Carlo 抽样计算随即变量的期望值是接下来内容的重点：

X 表示随即变量，服从概率分布 p(x), 那么要计算 f(x) 的期望，只需要我们不停从 p(x) 中抽样xi，然后对这些f（xi）取平均即可近似f(x)的期望。

[Monte Carlo 抽样](https://user-images.githubusercontent.com/18375710/73351774-b4a8a680-42ca-11ea-8d5e-44d84c16244c.png)

# 接受-拒绝抽样（Acceptance-Rejection sampling)

很多实际问题中，p(x)是很难直接采样的的，因此，我们需要求助其他的手段来采样。

既然 p(x) 太复杂在程序中没法直接采样，那么我设定一个程序可抽样的分布 q(x) 比如高斯分布，然后按照一定的方法拒绝某些样本，达到接近 p(x) 分布的目的，其中q(x)叫做 proposal distribution 。

![image](https://user-images.githubusercontent.com/18375710/73351975-15d07a00-42cb-11ea-84b8-9765ca6a353c.png)

## 具体流程

具体操作如下，设定一个方便抽样的函数 q(x)，以及一个常量 k，使得 p(x) 总在 kq(x) 的下方。（参考上图）

1. x 轴方向：从 q(x) 分布抽样得到 a。(如果是高斯，就用之前说过的 tricky and faster 的算法更快）

2. y 轴方向：从均匀分布（0, kq(a)) 中抽样得到 u。

3. 如果刚好落到灰色区域： u > p(a), 拒绝， 否则接受这次抽样

4. 重复以上过程

在高维的情况下，Rejection Sampling 会出现两个问题，第一是合适的 q 分布比较难以找到，第二是很难确定一个合理的 k 值。

这两个问题会导致拒绝率很高，无用计算增加。

# 重要性抽样(Importance sampling)

Importance Sampling 也是借助了容易抽样的分布 q (proposal distribution)来解决这个问题，直接从公式出发：

![image](https://user-images.githubusercontent.com/18375710/73352075-4e705380-42cb-11ea-8ade-2b986a6851b9.png)

其中，p(z) / q(z) 可以看做 importance weight。

我们来考察一下上面的式子，p 和 f 是确定的，我们要确定的是 q。

要确定一个什么样的分布才会让采样的效果比较好呢？

直观的感觉是，样本的方差越小期望收敛速率越快。

比如一次采样是 0, 一次采样是 1000, 平均值是 500,这样采样效果很差，如果一次采样是 499, 一次采样是 501, 你说期望是 500,可信度还比较高。

在上式中，我们目标是 p×f/q 方差越小越好，所以 |p×f| 大的地方，proposal distribution q(z) 也应该大。

## 例子

举个稍微极端的例子：

![image](https://user-images.githubusercontent.com/18375710/73352343-dce4d500-42cb-11ea-8741-67f498d8be21.png)

第一个图表示 p 分布， 第二个图的阴影区域 f = 1，非阴影区域 f = 0, 那么一个良好的 q 分布应该在左边箭头所指的区域有很高的分布概率，因为在其他区域的采样计算实际上都是无效的。这表明 Importance Sampling 有可能比用原来的 p 分布抽样更加有效。

但是可惜的是，在高维空间里找到一个这样合适的 q 非常难。

即使有 Adaptive importance sampling 和 Sampling-Importance-Resampling(SIR) 的出现，要找到一个同时满足 easy to sample 并且 good approximations 的 proposal distribution, it is often impossible！

# MCMC 采样

[MCMC sampling]()

# 参考资料

[常用抽样方式](https://www.cnblogs.com/xbinworld/p/4266146.html)

* any list
{:toc}