---
layout: post
title: NLP ATC （automation text classification） 文本分类实战之 java 实现
date:  2020-1-20 10:09:32 +0800
categories: [NLP]
tags: [nlp, atc, sh]
published: true
---

# 文本分类：

## 1. 啥是文本分类（Text Classification）：

将一篇文档分到其中一个或者多个类的过程，例 ：判断分类出垃圾邮件

类型：包括类别数目（Binary、multi-class）、每篇文章赋予的标签数目（Single label、Multi label）

# 一. 概率论基础

1. 条件概率公式：

![image](https://user-images.githubusercontent.com/18375710/76868135-6f076380-68a1-11ea-8c60-d5dc9f11c8f2.png)

2. 全概率公式：

![image](https://user-images.githubusercontent.com/18375710/76868160-775f9e80-68a1-11ea-95e3-c4b6c2051a05.png)

3. 由条件概率公式和全概率公式可以导出贝叶斯公式

![image](https://user-images.githubusercontent.com/18375710/76868187-80e90680-68a1-11ea-99bc-4507684c3b7e.png)

# 二. 文本分类

要计算一篇文章D所属的类别c(D)，相当于计算生成D的可能性最大的类别 Ci(Ci属于C)，即：

![image](https://user-images.githubusercontent.com/18375710/76868305-a9710080-68a1-11ea-9b64-69cf51527290.png)

# 朴素贝叶斯理论：

## 1. 分类规则:

根据贝叶斯定律，并由于分母对所有类别都一样，故可以去掉，求得：

上式存在过多的参数，每个参数都是一个类别和一个词语序列的组合，要估计这么多的参数，必须需要大量的训练样例，但是，训练的规模总是有限的。于是，出现数据稀疏性（data sparseness）问题

![image](https://user-images.githubusercontent.com/18375710/76868708-43d14400-68a2-11ea-87dc-cb1987e0a6af.png)

![image](https://user-images.githubusercontent.com/18375710/76868728-4cc21580-68a2-11ea-841f-6cb3af5112ee.png)


## 2.条件独立性假设：

为了减少参数数目，给出朴素贝叶斯条件独立性假设

![image](https://user-images.githubusercontent.com/18375710/76868760-58add780-68a2-11ea-999e-077fc82c6e00.png)

## 3. 位置独立性假设:

对于类别 c 中的一篇文档，词项 t_k 在文档中的位置不影响生成它的概率

以上两个独立性假设实际上是词袋模型（Bag of words model）

![image](https://user-images.githubusercontent.com/18375710/76868786-5fd4e580-68a2-11ea-9570-237b93c5ee34.png)

# 特征选择：

## 1. 含义：

从训练集合出现的此项中选出一部分子集的过程，在文本分类过程中也仅仅使用这个子集作为特征

## 2. 目的：

第一，减小词汇空间来提高分类器训练和应用的效率；

第二，去除噪音特征（Noise Feature），从而提高分类精度

## 3. 基本的特征选择算法：

给定类别 c ，对词汇表中的每个词项 t ，我们计算效用指标 A(t,c) ，然后选择k个具有最高值的词项作为最后的特征，其他词项则在分类中被忽略

## 常用选择方法

1. 互信息

2. x^2 统计量

3. 词频统计

# 朴素贝叶斯的实现方式比较：

## 1、贝努利模型（Multivariate Bernoulli Model)：

不考虑词在文档中出现的次数，只考虑出不出现，因此在这个意义上相当于假设词是等权重的，其是一种以文档位计算粒度的方法

![image](https://user-images.githubusercontent.com/18375710/76868905-8430c200-68a2-11ea-8720-cfee83f40cdb.png)

## 2、多项式模型：

各单词类条件概率计算考虑了词出现的次数，是一种以词作为计算粒度的方法

![image](https://user-images.githubusercontent.com/18375710/76868968-97439200-68a2-11ea-95c1-8d803650c757.png)

## 3、高斯朴素贝叶斯：

对特征向量 {x1, x2, ..., xn} ,如果特征值 xi 取连续值，比如温度，则可采用高斯模型求解

# 朴素贝叶斯分类器（Naive Bayes Classifier ）：

## 1. 朴素贝叶斯是一个概率分类器

文档 d 属于类别 c 的概率计算如下（多项式模型）：

![image](https://user-images.githubusercontent.com/18375710/76869219-f1dcee00-68a2-11ea-8fa6-d6b028aaff4e.png)


n_d 是文档的长度（词条个数）

`P(t_k | c)` 是词项 t_k  出现在类别 c 中文档的频率，即类别 c 文档的一元语言模型

`P(t_k | c)` 度量的是当 c 是正确类别时 t_k 的贡献

p(c)是类别 c 的先验概率

如果文档的词项无法提供属于哪个类别的信息，那么我们直接选择 P(c) 最高的那个类别

## 2. 对数计算：

朴素贝叶斯分类的目标是寻找“最佳”的类别

最佳类别是指具有最大后验概率（Maximum A Posterior，MAP）的类别：

![image](https://user-images.githubusercontent.com/18375710/76869330-1b961500-68a3-11ea-8fde-9245728820da.png)

很多小概率的乘积会导致浮点数下溢出

由于 `log（xy）=log(x)+log(y)` ,可以通过取对数将原来的乘积计算变成求和计算

由于 log 是单调函数，因此得分最高的类别不会发生改变，因此，实际中常用的是：

![image](https://user-images.githubusercontent.com/18375710/76869400-39637a00-68a3-11ea-8a24-4f65c65022f0.png)

ps: 这个转换非常重要，而且性能较好。分词时其实也有类似的操作。

每个条件参数 `P(t_k| c)` 是反映 t_k 对 c 的贡献高低的一个权重

先验概率 P(c) 是反映类别 c 的相对频率的一个权重

因此，所有权重的求和反映的是文档属于类别的可能性。

## 3. 最大似然估计

如何从训练集中估算出 `P(t_k| c)` 和 P(c):

(1) 先验概率 P(c) = Nc/N

Nc: 类 c 中的文档数目； N ：所有文档的总数

（2）条件概率：

![image](https://user-images.githubusercontent.com/18375710/76869690-a1b25b80-68a3-11ea-9860-9bb83f255af7.png)

T_ct 是训练集中类别 c 中的词条 t 的个数（多次出现要计算多次）

## 4.  MLE估计的零概率问题：

如果 t_k 在训练集中没有出现在类别 c 中，那么就会有零概率估计：

![image](https://user-images.githubusercontent.com/18375710/76869811-cc041900-68a3-11ea-9014-f3519185dc3b.png)

那么，对任意包含 t_k 的文档 d ， `P(c|d)` = 0

一旦发生零概率，将无法判断类别

## 5. laplace 平滑

避免零概率：加一平滑

![image](https://user-images.githubusercontent.com/18375710/76869888-edfd9b80-68a3-11ea-8983-54b09ba64b0a.png)


B是不同词语个数（这种情况下 `|V| = B` ）,利用加1平滑从训练集中估计参数

## 6. 训练过程 & 测试应用：

对于新文档，对于每个类别，计算：

先验的对数值之和以及词项条件概率的对数之和

伪代码如下：


## 7. 时间复杂度分析:

朴素贝叶斯对训练集的大小和测试文档的大小而言是线性的，这在某种意义上是最优的


# 文本分类器评估(Classifier Evaluation)

## 1. 防止过拟合的情况：

评估必须基于测试数据进行，且该测试数据是与训练数据完全独立的（通常两者样本之间无交集）

## 2. 评估指标：

正确率(P)、召回率(R)、 F_1 值、分类精确率(Classification accuracy)

正确率(P) = TP/(TP+FP)

召回率(R) = TP/(TP+FN)

F_1 值是在正确率和召回率之间达到某种平衡

F_1 = 2PR / (P+R)

F_1 也就是P和R的调和平均值:

1/F_1 = 1/2 * (1/P + 1/R)

## 3. 综合性能

如果我们希望得到所有类别上的综合性能。则可以用宏平均（macro-averaging）和微平均（Micro-averaging）

# 资源数据

[新闻数据](http://www.sogou.com/labs/resource/list_news.php)

[新闻数据-文本分类](http://www.sogou.com/labs/resource/tce.php)

# 参考资料

[知乎-文本分类及朴素贝叶斯分类器](https://zhuanlan.zhihu.com/p/32091937)

* any list
{:toc}