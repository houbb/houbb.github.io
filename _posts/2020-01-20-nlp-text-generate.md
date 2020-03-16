---
layout: post
title: NLP 文本生成
date:  2020-1-20 10:09:32 +0800
categories: [NLP]
tags: [nlp, wsd, sh]
published: true
---

# 序言

其实个人比较希望学会实现自动文本生成，目前的 level 还很低，所以这次做一个概览。

但是我不满足于只会使用，我希望可以懂得背后的数学原理，可以用任何一种语言去实现。

# 引入

AI写诗？？ AI创作小说？？ 近年来人们时常听到这类新闻，听上去很不可思议，那么今天我们来一探究竟，这种功能是如何通过深度学习来实现的。

通常文本生成的基本策略是借助语言模型，这是一种基于概率的模型，可根据输入数据预测下一个最有可能出现的词，而文本作为一种序列数据 (sequence data)，词与词之间存在上下文关系，所以使用循环神经网络 (RNN) 基本上是标配，这样的模型被称为神经语言模型 (neural language model)。

在训练完一个语言模型后，可以输入一段初始文本，让模型生成一个词，把这个词加入到输入文本中，再预测下一个词。

这样不断循环就可以生成任意长度的文本了，如下图给定一个句子 ”The cat sat on the m“ 可生成下一个字母 ”a“ ：

![图示](https://raw.githubusercontent.com/massquantity/text-generation-using-keras/master/image/16.png)

图中语言模型 (language model) 的预测输出其实是字典中所有词的概率分布，而通常会选择生成其中概率最大的那个词。不过图中出现了一个采样策略 (sampling strategy)，这意味着有时候我们可能并不想总是生成概率最大的那个词。

设想一个人的行为如果总是严格遵守规律缺乏变化，容易让人觉得乏味；同样一个语言模型若总是按概率最大的生成词，那么就容易变成 XX 讲话稿了。

因此在生成词的过程中引入了采样策略，在**最后从概率分布中选择词的过程中引入一定的随机性，这样一些本来不大可能组合在一起的词可能也会被生成，进而生成的文本有时候会变得有趣甚至富有创造性。**

采样的关键是引入一个temperature参数，用于控制随机性。假设 p(x) 为模型输出的原始分布，则加入 temperature 后的新分布为：

# 几种方式

## One-hot encoding + LSTM

## Embedding + 双向GRU (birdectional GRU)

第二个模型与上一个有3个不同点：

上面这个例子是字符级别 (character-level) 的语言模型，每个句子都以单个字符为单位，这个例子中我们以词组为单位进行训练，所以首先要用 jieba 分词将句子分成词组。

用词嵌入 (word embedding) 代替one-hot编码，节省内存空间，同时词嵌入可能比 one-hot 更好地表达语义。

用双向GRU (birdectional GRU) 代替LSTM，双向模型同时利用了正向序列和反向序列的信息，再将二者结合起来，如下图所示：

![Embedding + 双向GRU (birdectional GRU)](https://raw.githubusercontent.com/massquantity/text-generation-using-keras/master/image/18.png)

## Embedding + GRU + Conv1D + 反向 Conv1D

卷积神经网络一般多用于图像领域，主要由于其独特的局部特征提取功能。

但人们发现一维卷积神经网络 (Conv1D) 同样适合序列数据的处理，因为其可以提取长序列中的局部信息，这在特定的 NLP 领域 (如机器翻译，自动问答等) 中非常有用。

另外值得一提的是相比于用 RNN 处理序列数据，Conv1D的训练要快得多。

受上个例子中双向模型的启发，这里我也同时使用了正向和反向序列的信息，最后的模型大致是这样：

![Embedding + GRU + Conv1D + 反向 Conv1D](https://raw.githubusercontent.com/massquantity/text-generation-using-keras/master/image/Stacking%20plot.png)

# 参考资料

[运用深度学习进行文本生成](https://www.cnblogs.com/massquantity/p/9511694.html)

[一个基于最新版本TensorFlow的Char RNN实现。可以实现生成英文、写诗、歌词、小说、生成代码、生成日文等功能。](https://github.com/wandouduoduo/SunRnn)

[文本生成](https://github.com/massquantity/text-generation-using-keras)

[中国古诗生成（文本生成）](https://github.com/stardut/Text-Generate-RNN)

* any list
{:toc}