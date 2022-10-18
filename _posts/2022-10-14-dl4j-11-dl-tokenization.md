---
layout: post
title: DeepLearning4j-11-Tokenization 分词
date:  2022-10-14 09:22:02 +0800  
categories: [AI]
tags: [ai, dl4j, ml, sh]
published: true
---

# Tokenizer

在 DL4J 中将文本分解为单个单词以进行语言处理。

注意事项： 

1. Tokenizer 工厂接口 

2. Tokenizer 接口

3. 如何编写自己的工厂和 tokenizer

# Tokenization

## 什么是 Tokenization？

标记化是将文本分解为单个单词的过程。 

Word 窗口也由标记组成。 

Word2Vec 可以输出包含用于输入到神经网络的训练示例的文本窗口，如此处所示。

## 例子

```java
TokenizerFactory tokenizerFactory = new DefaultTokenizerFactory();
Tokenizer tokenizer = tokenizerFactory.tokenize("mystring");

//iterate over the tokens
while(tokenizer.hasMoreTokens()) {
      String token = tokenizer.nextToken();
}

//get the whole list of tokens
List<String> tokens = tokenizer.getTokens();
```

上面的代码片段创建了一个能够进行词干提取的标记器。

在 Word2Vec 中，这是推荐的一种创建词汇表的方法，因为它避免了各种词汇怪癖，例如同一个名词的单数和复数被视为两个不同的单词。

ps: 其实说白了就是分词。

# 参考资料

https://deeplearning4j.konduit.ai/deeplearning4j/tutorials/language-processing/tokenization

* any list
{:toc}