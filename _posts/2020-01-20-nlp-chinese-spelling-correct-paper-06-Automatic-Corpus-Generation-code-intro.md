---
layout: post
title: NLP 中文拼写检测纠正论文-06-A Hybrid Approach to Automatic Corpus Generation for Chinese Spelling Check 代码实现
date:  2020-1-20 10:09:32 +0800
categories: [Data-Struct]
tags: [chinese, nlp, algorithm, csc, paper, sh]
published: true
---

# 拼写纠正系列

[NLP 中文拼写检测实现思路](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-01-intro)

[NLP 中文拼写检测纠正算法整理](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-02)

[NLP 英文拼写算法，如果提升 100W 倍的性能？](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-03-100w-faster)

[NLP 中文拼写检测纠正 Paper](https://houbb.github.io/2020/01/20/nlp-chinese-spelling-correct-paper)

[java 实现中英文拼写检查和错误纠正？可我只会写 CRUD 啊！](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-01-intro)

[一个提升英文单词拼写检测性能 1000 倍的算法？](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-02-1000x)

[单词拼写纠正-03-leetcode edit-distance 72.力扣编辑距离](https://houbb.github.io/2020/01/20/nlp-chinese-word-checker-03-edit-distance-intro)

# NLP 开源项目

[nlp-hanzi-similar 汉字相似度](https://github.com/houbb/nlp-hanzi-similar)

[word-checker 中英文拼写检测](https://github.com/houbb/word-checker)

[pinyin 汉字转拼音](https://github.com/houbb/pinyin)

[opencc4j 繁简体转换](https://github.com/houbb/opencc4j)

[sensitive-word 敏感词](https://github.com/houbb/sensitive-word)

# 前言

大家好，我是老马。

下面学习整理一些其他优秀小伙伴的设计、论文和开源实现。

# 感受

这是 2018 年的论文，基于混淆集的方式。

局限性比较大，但是不失为一种解决方案。

# 论文+实现

论文地址: https://aclanthology.org/D18-1273.pdf

源码地址：https://github.com/wdimmy/Automatic-Corpus-Generation

# 一种混合方法用于中文拼写检查的自动语料生成（EMNLP2018）

该仓库包含了可用于自动生成包含错误的句子的脚本，这些错误的位置和相应的修改可以在没有人工干预的情况下轻松标记。

生成的**数据集**包含了271,329个句子，最短句子长度为4，最长句子长度为140，平均长度为42.5，总错误数为381,962，平均每个句子的错误数为1.4，并且提供了用于未来中文拼写检查研究的**混淆集**。

**注意：** **数据集**和**混淆集**将持续更新。

## 主要库
* [pytesseract](https://github.com/madmaze/pytesseract)
* [OpenCV](https://github.com/opencv/opencv)
* [Kaldi](https://github.com/kaldi-asr/kaldi)
* Python 3.5
* Pytorch 0.4
* numpy
* [BeautifulSoup](https://pypi.org/project/beautifulsoup4/)

## 基于OCR的方法

![ocr](https://github.com/wdimmy/Automatic-Corpus-Generation/raw/master/images/ocr.png)

## 基于ASR的方法

![ocr](https://github.com/wdimmy/Automatic-Corpus-Generation/raw/master/images/asr.png)

## 基本模型

使用我们提出的方法生成数据集后，您可以尝试任何您想要的中文拼写检查模型。

在这里，我们实现了一个基于Pytorch的BiLSTM模型，模型中有很多细节可以进一步优化。

* 训练：使用命令行 `python main_train.py`。训练过程的详细信息将显示在屏幕上。

* 测试：使用命令行 `python main_test.py`。

**注意：** 您可以微调超参数或添加更多生成的数据来提高模型的性能。

## 混淆集

对于给定的单词，混淆集是指与该单词在视觉或语音上相似的一组单词。

例如， 哨:宵诮梢捎俏咪尚悄少销消硝赵逍屑吵噹躺稍峭鞘肖。作为我们方法的“副产品”，我们为所有涉及的正确字符构建了一个混淆集，通过收集每个正确字符的所有错误变体，这在中文拼写检查任务中被广泛使用。我们也将这个混淆集开放，供未来中文拼写检查研究使用。

## 测试数据集

SIGHAN Bake-off 2013: [链接](http://ir.itc.ntnu.edu.tw/lre/sighan7csc.html)

SIGHAN Bake-off 2014: [链接](http://ir.itc.ntnu.edu.tw/lre/clp14csc.html)

SIGHAN Bake-off 2015: [链接](http://ir.itc.ntnu.edu.tw/lre/sighan8csc.html)

**注意：** 上述所有数据集最初是用繁体中文编写的。考虑到我们生成的数据集是简体中文，因此我们已将原始数据集翻译成简体中文版本，可以在**Data**文件夹中找到。

我们用来将繁体中文转换为简体中文的工具是[OpenCC](https://github.com/BYVoid/OpenCC)。

## 引用

如果您觉得该实现有用，请引用以下论文：

*《一种混合方法用于中文拼写检查的自动语料生成》*

```bibtex
@InProceedings{Reimers:2018:EMNLP,
  author    = {DingminWang, Yan Song, Jing Li, Jialong Han, Haisong Zhang},
  title     = {{A Hybrid Approach to Automatic Corpus Generation for Chinese Spelling Check}},
  booktitle = {Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing (EMNLP)},
  month     = {11},
  year      = {2018},
  address   = {Brussels, Belgium},
}
```

## 联系方式

如有任何问题，请通过电子邮件联系我（Dingmin Wang）：wangdimmy (AT) gmail.com。

# 参考资料

https://github.com/wdimmy/Automatic-Corpus-Generation/blob/master/README.md

* any list
{:toc}