---
layout: post
title: Lucene code-04-Lucene 的索引文件格式其他内容
date: 2022-01-29 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, code, source-code, sh]
published: true
---

# 4.3.1. 标准化因子文件(nrm) 

为什么会有标准化因子呢？

从第一章中的描述，我们知道，在搜索过程中，搜索出的文档要按与查询语句的相关性排序，相关性大的打分(score)高，从而排在前面。

相关性打分(score)使用向量空间模型(Vector Space Model)，在计算相关性之前，要计算 Term Weight，也即某 Term 相对于某 Document 的重要性。

在计算 Term Weight 时，主要有两个影响因素，一个是此 Term 在此文档中出现的次数，一个是此 Term 的普通程度。

显然此 Term 在此文档中出现的次数越多，此 Term 在此文档中越重要。

这种 Term Weight 的计算方法是最普通的，然而存在以下几个问题：

不同的文档重要性不同。有的文档重要些，有的文档相对不重要，比如对于做软件的，在索引书籍的时候，我想让计算机方面的书更容易搜到，而文学方面的书籍搜索时排名靠后。 

不同的域重要性不同。有的域重要一些，如关键字，如标题，有的域不重要一些，如附件等。同样一个词(Term)，出现在关键字中应该比出现在附件中打分要高。 

根据词(Term)在文档中出现的绝对次数来决定此词对文档的重要性，有不合理的地方。

比如长的文档词在文档中出现的次数相对较多，这样短的文档比较吃亏。比如一个词在一本砖头书中出现了 10 次，在另外一篇不足 100 字的文章中出现了 9 次，就说明砖头书应该排在前面码？

不应该，显然此词在不足 100 字的文章中能出现 9 次，可见其对此文章的重要性。 

由于以上原因，Lucene 在计算 Term Weight 时，都会乘上一个标准化因子(Normalization Factor)，来减少上面三个问题的影响。

标准化因子(Normalization Factor)是会影响随后打分(score)的计算的，Lucene 的打分计算一部分发生在索引过程中，一般是与查询语句无关的参数如标准化因子，大部分发生在搜索过程中，会在搜索过程的代码分析中详述。

标准化因子(Normalization Factor)在索引过程总的计算如下：

```
norm(t, d) = doc.getBoost() * lengthNorm(field) * 累加 f.getBoost()
```

它包括三个参数：

- Document boost：此值越大，说明此文档越重要。 

- Field boost：此域越大，说明此域越重要。 

- lengthNorm(field) = (1.0 / Math.sqrt(numTerms))：一个域中包含的 Term 总数越多，也即

文档越长，此值越小，文档越短，此值越大。 

从上面的公式，我们知道，一个词(Term)出现在不同的文档或不同的域中，标准化因子不同。

比如有两个文档，每个文档有两个域，如果不考虑文档长度，就有四种排列组合，在重要文档的重要域中，在重要文档的非重要域中，在非重要文档的重要域中，在非重要文档的非重要域中，四种组合，每种有不同的标准化因子。

于是在 Lucene 中，标准化因子共保存了(文档数目乘以域数目)个，格式如下：

标准化因子文件(Normalization Factor File: nrm)： 

- NormsHeader：字符串“NRM”外加 Version，依 Lucene 的版本的不同而不同。 

- 接着是一个数组，大小为 NumFields，每个 Field 一项，每一项为一个 Norms。 

- Norms 也是一个数组，大小为 SegSize，即此段中文档的数量，每一项为一个 Byte，

表示一个浮点数，其中 0~2 为尾数，3~8 为指数。

# 4.3.2. 删除文档文件(del)

被删除文档文件(Deleted Document File: .del) 

Format：在此文件中，Bits 和 DGaps 只能保存其中之一，-1 表示保存 DGaps，非负值表示保存 Bits。 

ByteCount：此段中有多少文档，就有多少个 bit 被保存，但是以 byte 形式计数，也即 Bits 的大小应该是 byte 的倍数。 

- BitCount：Bits 中有多少位被至 1，表示此文档已经被删除。 

- Bits：一个数组的 byte，大小为 ByteCount，应用时被认为是 byte*8 个 bit。 

- DGaps：如果删除的文档数量很小，则 Bits 大部分位为 0，很浪费空间。DGaps 采

用以下的方式来保存稀疏数组：比如第十，十二，三十二个文档被删除，于是第十，十二，三十二位设为 1，DGaps 也是以 byte 为单位的，仅保存不为 0 的 byte，如第1 个 byte，第 4 个 byte，第 1 个 byte 十进制为 20，第 4 个 byte 十进制为 1。

于是保存成 DGaps，第 1 个 byte，位置 1 用不定长正整数保存，值为 20 用二进制保存，第 2 个 byte，位置 4 用不定长正整数保存，用差值为 3，值为 1 用二进制保存，二进制数据不用差值表示。 

# 参考资料

《Lucene 原理与代码分析》

* any list
{:toc}