---
layout: post
title: 拼音转汉字实现方式
date:  2020-1-9 10:09:32 +0800
categories: [Search]
tags: [nlp, java, pinyin, sh]
published: true
---

# 基于HMM的拼音转汉字

这里的拼音一般不带声调。

将汉字作为隐藏状态，拼音作为观测值，使用viterbi算法可以将多个拼音转换成合理的汉字。

例如给出ti,chu,le,jie,jue,fang,an，viterbi算法会认为**提出了解决方案**是最合理的状态序列。

HMM 需要三个分布，分别是：

- 初始时各个状态的概率分布

- 各个状态互相转换的概率分布

- 状态到观测值的概率分布

这个3个分布就是三个矩阵，根据一些文本库统计出来即可。

viterbi算法基于动态规划，[维基百科 - Viterbi algorithm](https://en.wikipedia.org/wiki/Viterbi_algorithm)给出了很好的解释和示例。

基于词库的拼音转汉字

# 基于词库的拼音转汉字

原则：

词的权重大于字的权重；

转换中匹配的词越多，权重越小。

词库的格式是：

```
拼音:单词:权重
```

例如：

```
ni:你:0.15
ni:泥:0.12
a:啊:0.18
hao:好:0.14
nihao:你好:0.6
```

假如输入是ni,hao,a，我们计算一下各种组合的权重：

| 组合	权重 |
|:---|:---|
| 你,好,啊 | 0.15×0.14×0.18 = 0.00378 |
| 泥,好,啊 | 0.12×0.14×0.18 = 0.003024 |
| 你好,啊	 | 0.6×0.18 = 0.108 |

可以看出，你好,啊是最好的结果。

实际实现中需要用到动态规划， 和求有向无环图中两点之间最短距离类似。




# 参考资料

[如何实现拼音与汉字的互相转换](https://www.letianbiji.com/machine-learning/2016-02-08-pinyin-hanzi.html)

## 相关资料

https://github.com/aui/pinyin-engine

https://github.com/letiantian/Pinyin2Hanzi

https://github.com/adrianulbona/hmm

* any list
{:toc}