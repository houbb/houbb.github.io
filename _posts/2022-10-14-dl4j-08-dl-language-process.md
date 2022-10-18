---
layout: post
title: DeepLearning4j-08-DL4j Language Processing 语言处理
date:  2022-10-14 09:22:02 +0800  
categories: [AI]
tags: [ai, dl4j, ml, sh]
published: true
---

#  语言处理

DL4J 中的语言处理概述

虽然设计的目的不是为了与斯坦福 CoreNLP 或 NLTK 等工具相媲美，但 deepLearning4J 确实包含一些此处描述的核心文本处理工具。

Deeplearning4j 的 NLP 支持包含不同 NLP 库的接口。 

用户通过我们的接口包装第三方库。 

从 M1 开始的 Deeplearning4j 不直接支持任何 3rd 方库。 

这是由于缺乏维护和定制工作来使这项工作对用户很好。 

相反，我们公开接口以允许用户实现他们自己的分词器。

# 句子迭代器（SentenceIterator）

处理自然语言涉及几个步骤。 

第一种是遍历您的语料库以创建一个文档列表，该列表可以像推文一样短，也可以像报纸文章一样长。 

这是由 SentenceIterator 执行的，它将如下所示：

```java
// Gets Path to Text file
String filePath = new File(dataLocalPath,"raw_sentences.txt").getAbsolutePath();
// Strip white space before and after for each line
SentenceIterator iter = new BasicLineIterator(filePath);
```

SentenceIterator 封装语料库或文本，将其组织为每行一条推文。 

它负责将文本逐段输入您的自然语言处理器。 

SentenceIterator 与类似名称的类 DatasetIterator 不同，后者创建用于训练神经网络的数据集。 

相反，它通过分割语料库来创建字符串集合。

# 分词器（Tokenizer）

一个 Tokenizer 进一步在单个单词的级别上分割文本，也可以选择为 n-gram。 

ClearTK 包含底层标记器，例如词性 (PoS) 和解析树，它们允许依赖和选区解析，就像递归神经张量网络 (RNTN) 所采用的那样。

Tokenizer 由 TokenizerFactory 创建和包装。 

默认标记是由空格分隔的单词。 

标记化过程还涉及一些机器学习来区分诸如 . 结束句子，也缩写单词，例如 Mr. 和 vs.

Tokenizers 和 SentenceIterators 都与 Preprocessors 一起工作，以处理 Unicode 等杂乱文本中的异常，并将这些文本统一呈现为小写字符。

```java
 public static void main(String[] args) throws Exception {

        dataLocalPath = DownloaderUtility.NLPDATA.Download();
        // Gets Path to Text file
        String filePath = new File(dataLocalPath,"raw_sentences.txt").getAbsolutePath();

        log.info("Load & Vectorize Sentences....");
        // Strip white space before and after for each line
        SentenceIterator iter = new BasicLineIterator(filePath);
        // Split on white spaces in the line to get words
        TokenizerFactory t = new DefaultTokenizerFactory();

        /*
            CommonPreprocessor will apply the following regex to each token: [\d\.:,"'\(\)\[\]|/?!;]+
            So, effectively all numbers, punctuation symbols and some special symbols are stripped off.
            Additionally it forces lower case for all tokens.
         */
        t.setTokenPreProcessor(new CommonPreprocessor());
```

# 词汇（Vocab）

每个文档都必须被标记以创建一个词汇，即对该文档或语料库很重要的一组单词。 

这些单词存储在词汇缓存中，其中包含有关文档中计数的单词子集的统计信息，即“重要”的单词。 

区分重要词和不重要词的线是可移动的，但区分这两组的基本思想是，只出现一次（或少于五次）的词很难学习，而且它们的存在代表着无用的噪音。

词汇缓存存储诸如 Word2vec 和 Bag of Words 等方法的元数据，它们以完全不同的方式处理单词。 

Word2vec 以数百个系数长的向量的形式创建词的表示或神经词嵌入。 

这些系数有助于神经网络预测单词出现在任何给定上下文中的可能性； 

例如，在另一个词之后。 

这是 Word2vec，已配置：

```java
package org.deeplearning4j.examples.nlp.word2vec;

import org.deeplearning4j.examples.download.DownloaderUtility;
import org.deeplearning4j.models.word2vec.Word2Vec;
import org.deeplearning4j.text.sentenceiterator.BasicLineIterator;
import org.deeplearning4j.text.sentenceiterator.SentenceIterator;
import org.deeplearning4j.text.tokenization.tokenizer.preprocessor.CommonPreprocessor;
import org.deeplearning4j.text.tokenization.tokenizerfactory.DefaultTokenizerFactory;
import org.deeplearning4j.text.tokenization.tokenizerfactory.TokenizerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.Collection;

/**
 * Created by agibsonccc on 10/9/14.
 *
 * Neural net that processes text into wordvectors. See below url for an in-depth explanation.
 * https://deeplearning4j.org/word2vec.html
 */
public class Word2VecRawTextExample {

    private static Logger log = LoggerFactory.getLogger(Word2VecRawTextExample.class);

    public static String dataLocalPath;


    public static void main(String[] args) throws Exception {

        dataLocalPath = DownloaderUtility.NLPDATA.Download();
        // Gets Path to Text file
        String filePath = new File(dataLocalPath,"raw_sentences.txt").getAbsolutePath();

        log.info("Load & Vectorize Sentences....");
        // Strip white space before and after for each line
        SentenceIterator iter = new BasicLineIterator(filePath);
        // Split on white spaces in the line to get words
        TokenizerFactory t = new DefaultTokenizerFactory();

        /*
            CommonPreprocessor will apply the following regex to each token: [\d\.:,"'\(\)\[\]|/?!;]+
            So, effectively all numbers, punctuation symbols and some special symbols are stripped off.
            Additionally it forces lower case for all tokens.
         */
        t.setTokenPreProcessor(new CommonPreprocessor());

        log.info("Building model....");
        Word2Vec vec = new Word2Vec.Builder()
                .minWordFrequency(5)
                .iterations(1)
                .layerSize(100)
                .seed(42)
                .windowSize(5)
                .iterate(iter)
                .tokenizerFactory(t)
                .build();

        log.info("Fitting Word2Vec model....");
        vec.fit();

        log.info("Writing word vectors to text file....");

        // Prints out the closest 10 words to "day". An example on what to do with these Word Vectors.
        log.info("Closest Words:");
        Collection<String> lst = vec.wordsNearestSum("day", 10);
        log.info("10 Words closest to 'day': {}", lst);
    }
}
```

一旦你获得了词向量，你就可以将它们输入一个深度网络，用于分类、预测、情感分析等。

# 参考资料

https://deeplearning4j.konduit.ai/deeplearning4j/tutorials/quick-start

* any list
{:toc}