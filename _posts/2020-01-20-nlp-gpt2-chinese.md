---
layout: post
title: GPT2-Chinese 中文版 GPT2 训练代码，使用 BERT 分词器。
date:  2020-1-20 10:09:32 +0800
categories: [NLP]
tags: [nlp, ml, ai, sh]
published: true
---

# GPT2-Chinese

中文的GPT2训练代码，使用BERT的Tokenizer或Sentencepiece的BPE model（感谢kangzhonghua的贡献，实现BPE模式需要略微修改train.py的代码）。

可以写诗，新闻，小说，或是训练通用语言模型。支持字为单位或是分词模式或是BPE模式（需要略微修改train.py的代码）。支持大语料训练。

# 项目状态

在本项目公布时，中文的GPT2资源几乎为零，而现在情况已有所不同。

其次项目功能已经基本稳定，因此目前本项目暂已停止更新。

我写下这些代码的初衷是练习Pytorch的使用，即使后期做了一些填坑工作，难免还是有很多不成熟的地方，也请谅解。

# 使用方法

在项目根目录建立data文件夹。将训练语料以train.json为名放入data目录中。train.json里是一个json列表，列表的每个元素都分别是一篇要训练的文章的文本内容（而不是文件链接）。

运行train.py文件，勾选 --raw ，会自动预处理数据。

预处理完成之后，会自动执行训练。

## 生成文本

```
python ./generate.py --length=50 --nsamples=4 --prefix=xxx --fast_pattern --save_samples --save_samples_path=/mnt/xx
```

--fast_pattern (由LeeCP8贡献）：如果生成的length参数比较小，速度基本无差别，我个人测试length=250时，快了2秒，所以如果不添加--fast_pattern，那么默认不采用fast_pattern方式。

--save_samples：默认将输出样本直接打印到控制台，传递此参数，将保存在根目录下的samples.txt。

--save_samples_path：可自行指定保存的目录，默认可递归创建多级目录，不可以传递文件名称，文件名称默认为samples.txt。

## 文件结构

generate.py 与 train.py 分别是生成与训练的脚本。

train_single.py 是 train.py的延伸，可以用于一个很大的单独元素列表（如训练一本斗破苍穹书）。

eval.py 用于评估生成模型的ppl分值。

generate_texts.py 是 generate.py 的延伸，可以以一个列表的起始关键词分别生成若干个句子并输出到文件中。

train.json 是训练样本的格式范例，可供参考。

cache 文件夹内包含若干BERT词表，make_vocab.py 是一个协助在一个train.json语料文件上建立词表的脚本。 vocab.txt 是原始BERT词表， vocab_all.txt 额外添加了古文词， vocab_small.txt 是小词表。

tokenizations 文件夹内是可以选用的三种tokenizer，包括默认的Bert Tokenizer，分词版Bert Tokenizer以及BPE Tokenizer。

scripts 内包含了样例训练与生成脚本

## 注意

本项目使用Bert的tokenizer处理中文字符。

如果不使用分词版的tokenizer，不需要自己事先分词，tokenizer会帮你分。

如果使用分词版的tokenizer，最好先使用cache文件夹内的make_vocab.py文件建立针对你的语料的词表。

模型需自行运算。各位如果完成了预训练的话欢迎进行交流。

如果你的内存非常大或者语料较小的话，可以改掉train.py内build files内的对应代码，不做拆分直接预处理语料。

若使用BPE Tokenizer，需自己建立中文词表

## 语料

可以从[这里](https://github.com/brightmart/nlp_chinese_corpus)与[这里](http://thuctc.thunlp.org/#%E8%8E%B7%E5%8F%96%E9%93%BE%E6%8E%A5)下载。

斗破苍穹语料可以从[这里](https://github.com/GaoPeng97/transformer-xl-chinese/tree/master/data/doupo)下载。

# TODO:

后面自己实战一下。

唐诗

> [最全中华古诗词数据库](https://github.com/chinese-poetry/chinese-poetry)

宋词

元曲

小说

文章

。。。

# 参考资料

[GPT2-Chinese](https://github.com/Morizeyao/GPT2-Chinese)

* any list
{:toc}