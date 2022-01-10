---
layout: post
title: Lucene-05-的总体架构
date: 2022-01-10 21:01:55 +0800
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# Lucene 的整体结构

在 Lucene in action 中，Lucene 的构架和过程如下图， 

![Lucene in action](https://images.cnblogs.com/cnblogs_com/forfuture1978/WindowsLiveWriter/LuceneLucene_FCFA/image_thumb.png)
 
说明Lucene是有索引和搜索的两个过程，包含索引创建，索引，搜索三个要点。

让我们更细一些看 Lucene 的各组件： 

![lucene](https://images.cnblogs.com/cnblogs_com/forfuture1978/WindowsLiveWriter/LuceneLucene_FCFA/lucene%20%20zong%20ti%20jia%20gou_thumb.jpg)

被索引的文档用Document对象表示。

IndexWriter通过函数addDocument将文档添加到索引中，实现创建索引的过程。

Lucene的索引是应用反向索引。

当用户有请求时，Query代表用户的查询语句。

IndexSearcher通过函数search搜索Lucene Index。

IndexSearcher计算term weight和score并且将结果返回给用户。

返回给用户的文档集合用TopDocsCollector表示。

## 如何使用组件呢？

那么如何应用这些组件呢？

让我们再详细到对Lucene API 的调用实现索引和搜索过程。 

![组件](https://images.cnblogs.com/cnblogs_com/forfuture1978/WindowsLiveWriter/LuceneLucene_FCFA/using%20lucene_thumb.jpg)

## 索引过程如下：

创建一个IndexWriter用来写索引文件，它有几个参数，INDEX_DIR就是索引文件所存放的位置，Analyzer便是用来对文档进行词法分析和语言处理的。

创建一个Document代表我们要索引的文档。

将不同的Field加入到文档中。我们知道，一篇文档有多种信息，如题目，作者，修改时间，内容等。不同类型的信息用不同的Field来表示，在本例子中，一有两类信息进行了索引，一个是文件路径，一个是文件内容。其中FileReader的SRC_FILE就表示要索引的源文件。

IndexWriter调用函数addDocument将索引写到索引文件夹中。

## 搜索过程如下：

IndexReader将磁盘上的索引信息读入到内存，INDEX_DIR就是索引文件存放的位置。

创建IndexSearcher准备进行搜索。

创建Analyer用来对查询语句进行词法分析和语言处理。

创建QueryParser用来对查询语句进行语法分析。

QueryParser调用parser进行语法分析，形成查询语法树，放到Query中。

IndexSearcher调用search对查询语法树Query进行搜索，得到结果TopScoreDocCollector。

以上便是Lucene API函数的简单调用。

# 包分类

然而当进入Lucene的源代码后，发现Lucene有很多包，关系错综复杂。

然而通过下图，我们不难发现，Lucene的各源码模块，都是对普通索引和搜索过程的一种实现。

此图是上一节介绍的全文检索的流程对应的Lucene实现的包结构。(参照http://www.lucene.com.cn/about.htm中文章《开放源代码的全文检索引擎Lucene》) 

## 拓扑图

![package](https://images.cnblogs.com/cnblogs_com/forfuture1978/WindowsLiveWriter/LuceneLucene_FCFA/clip_image008_thumb.jpg)

## 包分类

Lucene API 分为几个包：

org.apache.lucene.analysis 定义了一个抽象的 Analyzer API，用于将文本从 Reader 转换为 TokenStream，即令牌属性的枚举。可以通过将TokenFilters 应用于 Tokenizer 的输出来组成 TokenStream。 Tokenizers 和 TokenFilters 串在一起并与 Analyzer 一起应用。 analysis-common 提了许多 Analyzer 实现，包括 StopAnalyzer 和基于语法的 StandardAnalyzer。

org.apache.lucene.codecs 提供了对倒排索引结构的编码和解码的抽象，以及可以根据应用需要选择的不同实现。

org.apache.lucene.document 提供了一个简单的 Document 类。文档只是一组命名字段，其值可能是字符串或 Reader 的实例。

org.apache.lucene.index 提供了两个主要类： IndexWriter，它创建文档并将其添加到索引；和 IndexReader，它访问索引中的数据。

org.apache.lucene.search 提供数据结构来表示查询（即 TermQuery 用于单个单词，PhraseQuery 用于短语，BooleanQuery 用于查询的布尔组合）和将查询换为 TopDocs 的 IndexSearcher。提供了许多 QueryParsers 用于从字符串或 xml 生成查询结构。

org.apache.lucene.store 定义了一个用于存储持久数据的抽象类，即 Directory，它是由 IndexOutput 写入并由 IndexInput 读取的命名文件的集合。提供多种实现，但通常建议使用 FSDirectory，因为它试图有效地使用操作系统磁盘缓冲区缓存。

org.apache.lucene.util 包含一些方便的数据结构和实用程序类，即 FixedBitSet 和 PriorityQueue。



# 参考资料

[Lucene 学习总结之一：全文检索的基本原理](https://www.cnblogs.com/forfuture1978/archive/2009/12/14/1623594.html)

* any list
{:toc}