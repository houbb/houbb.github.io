---
layout: post
title: NLP 中文拼写检测纠正论文-14-DCSpell A Detector-Corrector Framework for Chinese Spelling Error Correction  论文
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

## 论文 & 源码

https://dl.acm.org/doi/10.1145/3404835.3463050

https://ir.webis.de/anthology/2021.sigirconf_conference-2021.209/

# 一、动机：

基于端到端的方法（例如基于MLM）会存在很高的误报率（FAR），因为其会对所有的token进行纠错，正常情况下，一个句子中只有很少的几个token是需要纠正的；

these methods correct each character of the sentence regardless of its correctness, which might change the correct characters and result in high false alarm rates (FAR)

这些方法纠正句子的每个字符，而不管其正确性，这可能会改变正确的字符并导致高误报率 (FAR)

中文的拼写错误基本来自于语音或字形相似性；

# 二、方法：

提出DCSpell模型，主要包含两个模块：Detector和Corrector

Detector：输入原始的文本，并采用序列标注的方法检测每个位置是否是错误的，然后将错误的token替换为空格（[MASK]）

Corrector：对于检测的位置，通过MLM去预测其对应的可能正确的结果；

Detector与Corrector均采用Transformer模型：

Both the Detector and the Corrector are transformer-based networks, which fully utilize the power of MLM pre-training models

![Transformer模型](https://i-blog.csdnimg.cn/blog_migrate/a0ebb9fca772352670dba745df1d313f.png#pic_center)

## （1）Detector：

Detector部分喂入原始的句子，输出序列标注结果（1表示错误，0表示正确）；

Detector选择ELECTRA模型的判别器：

在ELECTRA模型（《ELECTRA: Pre-training Text Encoders as Discriminators Rather Than Generators.》）中，提出了replaced token detection pre-training task （即随机对部分token替换为confusion set中的其他词），采用对抗生成网络完成训练：

生成器与判别器都是transformer模块

The generator learns to predict the original identities of the masked-out tokens. Then the discrimi- nator is trained to predict whether each token was replaced by the generator or not

本文重新跑了ELECTRA模型，然后只获取判别器

最后生成器识别出来的错误，则直接替换为[MASK]，其他的则保持不变。

![1](https://i-blog.csdnimg.cn/blog_migrate/bbc3ebaaf86a234e35d3ee1e6f797c6f.png#pic_center)

## （2）Corrector：

将Detector得到的带有[MASK]的序列，与原始的待纠错的文本拼接起来，喂入到MLM中；


## （3）Confusion Set 后处理

在Corrector得出预测结果后，需要根据混淆集进行处理，论文中给出的处理过程比较详细，因此直接进行截图，如图所示：

![Confusion Set 后处理](https://i-blog.csdnimg.cn/blog_migrate/10401bf0f414e2e48e9928b073b8e6fd.png#pic_center)

具体的处理过程本文进行了整理，可以用于具体的实验或业务中，如下所示：

对于一个文本，其通过Corrector之后，会得到所有[MASK]对应的logit，以及相应的置信度得分：

● step1：挑选置信度最高的预测token，如果存在于对应的TopL候选集中，且置信度超过一定的阈值a1，则将其纠正， 否则保持[MASK]不变；

![s1](https://i-blog.csdnimg.cn/blog_migrate/9fb88586a519cdeebb9e350aa97a8882.png#pic_center)

● step2：对于没有被纠错的[MASK]，则从整个词表中（除了[UNK]）获得置信度最大的，若其置信度超过阈值a2，则纠正，否则依然保持[MASK]不变；
● step3：如果文本依然存在的[MASK]，则重新执行step1和step2；
● 如果全部纠正，或无法对剩余的[MASK]进行纠错，则保持不变。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://blog.csdn.net/qq_36426650/article/details/122796348

* any list
{:toc}
