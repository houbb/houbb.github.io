---
layout: post
title: NLP 中文对联实现思路
date:  2020-1-20 10:09:32 +0800
categories: [NLP]
tags: [chinese, nlp, algorithm, sh]
published: true
---

# 基础的词库

[笠翁对韵](https://hanyu.baidu.com/s?wd=%E7%AC%A0%E7%BF%81%E5%AF%B9%E9%9F%B5&from=poem) 全部韵脚系列


# 整体思路

词库中优先使用

结合算法：无论这个算法是深度学习还是其他。

## 分词

词库中的长词要想被使用，首先就需要对【上联】进行中文分词，然后查询词典，获取对应映射关系。

## 词库不能太大

比如对联的训练集合有 70w 的对联，将这些数据都存储起来，显然不现实。

最核心的原理应该还是词向量+n-gram。

# 平仄

文字的平仄可以简单的按照拼音来处理，当然这样不够准确。

# Github 参考资料

[对联语料](https://github.com/wb14123/couplet-dataset)

这份数据包含70万条对联数据，按字切分，作者很用心的给大家准备了训练集、测试集还有词汇表；

同时还开源了一个基于Tensorflow的深度学习工具来训练自动对联模型： 

[seq2seq-couplet](https://github.com/wb14123/seq2seq-couplet)

[GPT2-Chinese](https://github.com/Morizeyao/GPT2-Chinese)

# 参考资料

[使用Encoder-Decoder模型自动生成对联的思路](https://blog.csdn.net/malefactor/article/details/51124732)

[NLP教程：教你如何自动生成对联](https://blog.csdn.net/iFlyAI/article/details/86725599)

[知网-基于神经网络的诗歌与对联自动生成方法研究](http://cdmd.cnki.com.cn/Article/CDMD-10595-1019919528.htm)

* any list
{:toc}