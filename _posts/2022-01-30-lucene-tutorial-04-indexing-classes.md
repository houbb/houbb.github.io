---
layout: post
title: Lucene Tutorial-04-Lucene 搜索引擎入门教程 indexing class + Searching Classes
date: 2022-01-29 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, NLP, sh]
published: true
---

# Lucene 索引过程与类使用

## 索引过程概述

Lucene 提供的索引过程是其核心功能之一。下图说明了索引过程及其类的使用。IndexWriter 是索引过程中最重要和核心的组件。

![Indexing Process](https://www.tutorialspoint.com/lucene/images/indexing_process.jpg)

我们向 IndexWriter 添加包含字段的文档，IndexWriter 使用分析器对文档进行分析，然后根据需要创建/打开/编辑索引，并将其存储/更新到目录中。

IndexWriter 用于更新或创建索引，而不用于读取索引。

## 索引过程中的类

以下是在索引过程中常用的类列表：

- **IndexWriter（索引写入器）**：用于将文档添加到索引中并管理索引的创建和更新。
- **Document（文档）**：表示待索引的数据单元，由一个或多个字段组成。
- **Field（字段）**：文档的一部分，包含实际的数据以及用于索引和搜索的信息。
- **Analyzer（分析器）**：用于将文档拆分为单词，并对这些单词进行标准化处理，以便于索引和搜索。
- **Directory（目录）**：存储索引文件的位置，IndexWriter 将索引写入此处。

这些类在 Lucene 的索引过程中起着关键作用，通过它们的协作，可以有效地构建和管理索引。

# Lucene 搜索过程与类使用

## 搜索过程概述

Lucene 提供的搜索过程同样是其核心功能之一。其流程与索引过程类似。

Lucene 的基本搜索可以使用以下类来进行，这些类也可以称为所有与搜索相关操作的基础类。

![Searching Process](Searching_Process.png)

## 搜索过程中的类

以下是在搜索过程中常用的类列表：

### 1. IndexSearcher（索引搜索器）

该类作为核心组件，用于读取/搜索索引。它接受指向包含索引的位置的目录实例。

### 2. Term（词项）

这个类是搜索的最小单元。它类似于索引过程中的字段。

### 3. Query（查询）

Query 是一个抽象类，包含各种实用方法，是 Lucene 在搜索过程中使用的所有类型查询的父类。

### 4. TermQuery（词项查询）

TermQuery 是最常用的查询对象，是许多复杂查询的基础。

### 5. TopDocs（顶部文档）

TopDocs 指向与搜索条件匹配的前 N 个搜索结果。它是一个简单的容器，指向搜索结果的文档的指针。

这些类在 Lucene 的搜索过程中扮演着重要角色，通过它们的协作，可以有效地进行搜索并获取结果。



# 参考资料

https://www.tutorialspoint.com/lucene/lucene_indexing_classes.htm

* any list
{:toc}