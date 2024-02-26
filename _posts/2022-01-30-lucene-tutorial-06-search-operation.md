---
layout: post
title: Lucene Tutorial-06-Lucene 搜索引擎入门教程 search opearation
date: 2022-01-29 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, NLP, sh]
published: true
---

# 搜索过程

## Lucene搜索的核心功能之一

搜索是Lucene提供的核心功能之一。下图说明了搜索过程及其使用方式。IndexSearcher是搜索过程的核心组件之一。

## 搜索过程概述

我们首先创建包含索引的目录(Directory)，然后将其传递给IndexSearcher，IndexSearcher使用IndexReader打开目录。接着，我们使用一个包含Term的查询(Query)，通过将查询传递给搜索器(IndexSearcher)进行搜索。IndexSearcher返回一个TopDocs对象，其中包含搜索详细信息以及作为搜索操作结果的文档的文档ID。

## 逐步索引过程示例

现在我们将以逐步方法向您展示并帮助您通过基本示例理解索引过程。

# 创建 QueryParser

## QueryParser类介绍

QueryParser类将用户输入的查询解析为Lucene可理解的格式。按照以下步骤创建QueryParser -

### 步骤 1 - 创建QueryParser对象

```java
QueryParser queryParser;
```

### 步骤 2 - 初始化QueryParser对象

使用标准分析器、版本信息和要运行此查询的索引名称对创建的QueryParser对象进行初始化。

```java
public Searcher(String indexDirectoryPath) throws IOException {
    queryParser = new QueryParser(Version.LUCENE_36,
        LuceneConstants.CONTENTS,
        new StandardAnalyzer(Version.LUCENE_36));
}
```

在此示例中，Version.LUCENE_36表示Lucene版本号，LuceneConstants.CONTENTS表示要查询的索引名称，new StandardAnalyzer(Version.LUCENE_36)表示使用的标准分析器。


# 创建 IndexSearcher

## IndexSearcher类介绍

IndexSearcher类是一个核心组件，用于搜索索引，该索引在索引过程中创建。按照以下步骤创建IndexSearcher -

### 步骤 1 - 创建IndexSearcher对象

```java
IndexSearcher indexSearcher;
```

### 步骤 2 - 创建Lucene目录

创建一个Lucene目录，该目录应指向索引存储的位置。

### 步骤 3 - 初始化IndexSearcher对象

使用索引目录初始化创建的IndexSearcher对象。

```java
public Searcher(String indexDirectoryPath) throws IOException {
    Directory indexDirectory = FSDirectory.open(new File(indexDirectoryPath));
    indexSearcher = new IndexSearcher(indexDirectory);
}
```

在此示例中，indexDirectoryPath是索引目录的路径。

# 进行搜索

## 搜索步骤概述

按照以下步骤进行搜索 -

### 步骤 1 - 创建查询对象

通过QueryParser解析搜索表达式以创建查询对象。

```java
Query query;
```

### 步骤 2 - 进行搜索

调用IndexSearcher.search()方法进行搜索。

```java
public TopDocs search(String searchQuery) throws IOException, ParseException {
    query = queryParser.parse(searchQuery);
    return indexSearcher.search(query, LuceneConstants.MAX_SEARCH);
}
```

在此示例中，searchQuery是搜索查询的字符串。

## 获取文档

以下程序演示如何获取文档。

```java
public Document getDocument(ScoreDoc scoreDoc) 
   throws CorruptIndexException, IOException {
   return indexSearcher.doc(scoreDoc.doc);	
}
```

## 关闭 IndexSearcher

以下程序演示如何关闭IndexSearcher。

```java
public void close() throws IOException {
   indexSearcher.close();
}
```

这将关闭IndexSearcher并释放与之关联的资源。

# 示例应用程序

让我们创建一个测试Lucene应用程序来测试搜索过程。

步骤 | 描述
---|---
1 | 在com.tutorialspoint.lucene包下创建一个名为LuceneFirstApplication的项目，如Lucene - First Application章节所述。您也可以直接使用Lucene - First Application章节中创建的项目，以便更好地理解本章的搜索过程。
2 | 创建LuceneConstants.java、TextFileFilter.java和Searcher.java文件，如Lucene - First Application章节所述。保持其他文件不变。
3 | 创建LuceneTester.java，如下所示。
4 | 清理并构建应用程序，以确保业务逻辑符合要求。

## LuceneConstants.java

此类用于提供应用程序中使用的各种常量。

```java
package com.tutorialspoint.lucene;

public class LuceneConstants {
   public static final String CONTENTS = "contents";
   public static final String FILE_NAME = "filename";
   public static final String FILE_PATH = "filepath";
   public static final int MAX_SEARCH = 10;
}
```

## TextFileFilter.java

此类用作.txt文件过滤器。

```java
package com.tutorialspoint.lucene;

import java.io.File;
import java.io.FileFilter;

public class TextFileFilter implements FileFilter {

   @Override
   public boolean accept(File pathname) {
      return pathname.getName().toLowerCase().endsWith(".txt");
   }
}
```

## Searcher.java

此类用于读取对原始数据进行的索引并使用Lucene库搜索数据。

```java
package com.tutorialspoint.lucene;

import java.io.File;
import java.io.IOException;

import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.CorruptIndexException;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;

public class Searcher {
	
   IndexSearcher indexSearcher;
   QueryParser queryParser;
   Query query;

   public Searcher(String indexDirectoryPath) throws IOException {
      Directory indexDirectory = 
         FSDirectory.open(new File(indexDirectoryPath));
      indexSearcher = new IndexSearcher(indexDirectory);
      queryParser = new QueryParser(Version.LUCENE_36,
         LuceneConstants.CONTENTS,
         new StandardAnalyzer(Version.LUCENE_36));
   }

   public TopDocs search(String searchQuery) 
      throws IOException, ParseException {
      query = queryParser.parse(searchQuery);
      return indexSearcher.search(query, LuceneConstants.MAX_SEARCH);
   }

   public Document getDocument(ScoreDoc scoreDoc) 
      throws CorruptIndexException, IOException {
      return indexSearcher.doc(scoreDoc.doc);	
   }

   public void close() throws IOException {
      indexSearcher.close();
   }
}
```

以上是一个完整的示例应用程序，它包含了用于创建索引和执行搜索的必要组件。

```java
package com.tutorialspoint.lucene;

import java.io.IOException;

import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;

public class LuceneTester {
	
   String indexDir = "E:\\Lucene\\Index";
   String dataDir = "E:\\Lucene\\Data";
   Searcher searcher;

   public static void main(String[] args) {
      LuceneTester tester;
      try {
         tester = new LuceneTester();
         tester.search("Mohan");
      } catch (IOException e) {
         e.printStackTrace();
      } catch (ParseException e) {
         e.printStackTrace();
      }
   }

   private void search(String searchQuery) throws IOException, ParseException {
      searcher = new Searcher(indexDir);
      long startTime = System.currentTimeMillis();
      TopDocs hits = searcher.search(searchQuery);
      long endTime = System.currentTimeMillis();

      System.out.println(hits.totalHits +
         " documents found. Time :" + (endTime - startTime) +" ms");
      for(ScoreDoc scoreDoc : hits.scoreDocs) {
         Document doc = searcher.getDocument(scoreDoc);
         System.out.println("File: "+ doc.get(LuceneConstants.FILE_PATH));
      }
      searcher.close();
   }	
}
```

此类用于测试Lucene库的搜索功能。

## 数据和索引目录创建

我们使用了10个文本文件，命名为record1.txt至record10.txt，其中包含学生的姓名和其他详细信息，并将它们放在目录E:\Lucene\Data中。测试数据。索引目录路径应创建为E:\Lucene\Index。在运行章节Lucene - Indexing Process中的索引程序后，您可以在该文件夹中看到所创建的索引文件列表。

## 运行程序

完成源代码、原始数据、数据目录、索引目录和索引的创建后，您可以编译并运行您的程序。

要执行此操作，请保持LuceneTester.Java文件选项卡处于活动状态，并使用Eclipse IDE中提供的“运行”选项或使用Ctrl + F11来编译和运行您的LuceneTester应用程序。如果您的应用程序成功运行，它将在Eclipse IDE的控制台中打印以下消息 -

```plaintext
1 documents found. Time :29 ms
File: E:\Lucene\Data\record4.txt
```

# Lucene - Query Programming

# 创建不同类型的查询对象

在前面的章节Lucene - Search Operation中，我们已经看到Lucene使用IndexSearcher进行搜索，并使用由QueryParser创建的Query对象作为输入。在本章中，我们将讨论各种类型的查询对象以及以编程方式创建它们的不同方法。创建不同类型的查询对象可以控制搜索的方式。

考虑到许多应用程序提供的高级搜索功能，用户可以通过多个选项来限制搜索结果。通过查询编程，我们可以非常轻松地实现相同的功能。

以下是我们将在适当时讨论的查询类型列表。

| 序号 | 类名及描述 |
|------|-------------|
| 1    | TermQuery 该类作为索引过程中创建/更新索引的核心组件。 |
| 2    | TermRangeQuery 当需要搜索一系列文本术语时，使用TermRangeQuery。 |
| 3    | PrefixQuery PrefixQuery用于匹配其索引以指定字符串开头的文档。 |
| 4    | BooleanQuery BooleanQuery用于搜索由多个查询结果组成的文档，使用AND、OR或NOT运算符。 |
| 5    | PhraseQuery PhraseQuery用于搜索包含特定术语序列的文档。 |
| 6    | WildCardQuery WildcardQuery用于使用通配符搜索文档，如'*'表示任何字符序列，'?'表示匹配单个字符。 |
| 7    | FuzzyQuery 使用FuzzyQuery可以使用模糊实现搜索文档，这是一种基于编辑距离算法的近似搜索。 |
| 8    | MatchAllDocsQuery MatchAllDocsQuery如其名称所示，匹配所有文档。 |

# 参考资料

https://www.tutorialspoint.com/lucene/lucene_search_operation.htm

* any list
{:toc}