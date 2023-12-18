---
layout: post
title: jieba-fenci 结巴分词原理讲解之数据归一化 segment
date:  2020-1-8 10:09:32 +0800
categories: [NLP]
tags: [java, nlp, sf]
published: true
---

# 拓展阅读

[DFA 算法详解](https://houbb.github.io/2020/01/07/sensitive-word-dfa)

为了便于大家学习，项目开源地址如下，欢迎 fork+star 鼓励一下老马~

> [敏感词 sensitive-word](https://github.com/houbb/sensitive-word)

> [分词 segment](https://github.com/houbb/segment)

# 结巴分词的归一化

结巴分词的字典加载有一段源码，做了数据的归一化，使用的是 log 函数。

截取如下：

```java
for (Entry<String, Double> entry : freqs.entrySet()) {
    entry.setValue((Math.log(entry.getValue() / total)));
    minFreq = Math.min(entry.getValue(), minFreq);
}
```

# 这个是必须的吗？

我看了使用数据的地方，依然是选择出现概率最高的地方，所以就很好奇，一定需要做数据的归一化吗？

后来想了下，还是需要的。

因为数据是允许自定义的，所以会出现【奇异的数据】，比如 sougou 抓取了上亿的页面数据统计，如果直接使用，可能会导致累加的数据溢出。

所以需要做一下归一化。

归一化的方式有很多，我们一起来学习一下。

## 意义

数据标准化（归一化）处理是数据挖掘的一项基础工作，不同评价指标往往具有不同的量纲和量纲单位，这样的情况会影响到数据分析的结果，为了消除指标之间的量纲影响，需要进行数据标准化处理，以解决数据指标之间的可比性。

**原始数据经过数据标准化处理后，各指标处于同一数量级，适合进行综合对比评价。**

这两点是针对深度学习的收益：

（1）归一化后加快了梯度下降求最优解的速度

（2）归一化有可能提高精度（归一化是让不同维度之间的特征在数值上有一定的比较性）

# min-max标准化（Min-Max Normalization）

也称为离差标准化，是对原始数据的线性变换，使结果值映射到 `[0 - 1]` 之间。

转换函数如下：

```
x* = (x-min)/(max-min)
```

其中max为样本数据的最大值，min为样本数据的最小值。

这种方法有个缺陷就是当有新数据加入时，可能导致max和min的变化，需要重新定义。


## 适用场景

最值归一化适用于分布有明显边界的情况，即特征的取值范围是在一定区间内的，比如考试分数在0-100分之间；RGB图像像素点取值在0-255之间。

但同时该方法也有很大的缺点，就是受极端数据值（outlier）影响比较大，比如工资就不是一个有明显边界的特征，绝大部分人月薪0-3w，而有些人收入极其高，月薪100w甚至更高，这样往0-1之间映射会有很大误差。

相应的一个改进的归一化方法是均值方差归一化。

# log 函数转换

通过以10为底的log函数转换的方法同样可以实现归一下，具体方法如下：

```
x* = log10(x) / log10(max)
```

看了下网上很多介绍都是 x*=log10(x)，其实是有问题的，这个结果并非一定落到[0,1]区间上，应该还要除以log10(max)，max为样本数据最大值，并且所有的数据都要大于等于1。

## 选择

我们暂时就选择这种方式。

# Z-score 标准化方法

## 定义

这种方法给与原始数据的均值（mean）和标准差（standard deviation）进行数据的标准化。

经过处理的数据符合标准正态分布，即均值为0，标准差为1，转化函数为：

## 函数

```
(X−μ)/δ
```

其中，μ为所有样本数据的均值。δ为所有样本数据的标准差

## 本质

把有量纲表达式变成无量纲表达式

# 个人感受

java 对于数学计算一直没有太好的数学库，比如没有 java 完整版的量化库，也没有类似 python numpy 这么好用的库。

估计使用 java 的人都更加偏向于工程，且 java 的设计从语言层面对于多层数组支持很不友好，不知是福是祸。

# 拓展阅读

[DFA 算法详解](https://houbb.github.io/2020/01/07/sensitive-word-dfa)

# 参考资料

[知乎-标准化和归一化什么区别？](https://www.zhihu.com/question/20467170)

[知乎-为什么要对数据进行归一化处理？](https://zhuanlan.zhihu.com/p/27627299)

[数据归一化和两种常用的归一化方法](https://blog.csdn.net/haoji007/article/details/81157224)

[机器学习系列（九）——数据归一化及Sklearn中的Scaler](https://www.lizenghai.com/archives/20262.html)

[数据归一化](https://www.cnblogs.com/always-fight/p/9065923.html)

[转自：数据标准化/归一化normalization](https://www.cnblogs.com/pejsidney/p/8031250.html)

* any list
{:toc}