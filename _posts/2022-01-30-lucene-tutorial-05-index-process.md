---
layout: post
title: Lucene Tutorial-05-Lucene 搜索引擎入门教程 index process
date: 2022-01-29 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, NLP, sh]
published: true
---

# Lucene 索引过程与类使用

## 索引过程概述

Lucene 提供的索引过程是其核心功能之一。以下图示说明了索引过程及类的使用。IndexWriter 是索引过程中最重要和核心的组件。

![索引过程](Indexing_Process.png)

我们将包含字段的文档添加到 IndexWriter 中，IndexWriter 使用分析器对文档进行分析，然后根据需要创建/打开/编辑索引，并将其存储/更新到目录中。IndexWriter 用于更新或创建索引，而不用于读取索引。

## 使用基本示例了解索引过程的步骤

现在我们将逐步展示使用基本示例来了解索引过程的步骤。

### 1. 创建文档

创建一个方法从文本文件中获取 Lucene 文档。

```java
private Document getDocument(File file) throws IOException {
   Document document = new Document();
   
   //index file contents
   Field contentField = new Field(LuceneConstants.CONTENTS, 
      new FileReader(file));
   
   //index file name
   Field fileNameField = new Field(LuceneConstants.FILE_NAME,
      file.getName(),
      Field.Store.YES,Field.Index.NOT_ANALYZED);
   
   //index file path
   Field filePathField = new Field(LuceneConstants.FILE_PATH,
      file.getCanonicalPath(),
      Field.Store.YES,Field.Index.NOT_ANALYZED);

   document.add(contentField);
   document.add(fileNameField);
   document.add(filePathField);

   return document;
}
```

此方法从文件中创建一个 Lucene 文档，其中包含字段的内容、文件名和文件路径。

### 2. 创建各种类型的字段

创建各种类型的字段，它们是键值对，键作为名称，值作为要索引的内容。

### 3. 设置字段的分析

设置字段是要分析还是不分析。

在我们的情况下，只有 contents 要进行分析，因为它可能包含诸如 a、am、are、an 等在搜索操作中不需要的数据。

通过以上步骤，我们可以将文档添加到 Lucene 索引中，从而实现搜索操作。

# 创建 IndexWriter

IndexWriter 类作为索引过程中创建/更新索引的核心组件。按照以下步骤创建 IndexWriter：

## 步骤 1 - 创建 IndexWriter 对象

## 步骤 2 - 创建 Lucene 目录

Lucene 目录应指向索引存储位置。

## 步骤 3 - 初始化 IndexWriter 对象

使用索引目录、带有版本信息的标准分析器以及其他必需/可选参数初始化创建的 IndexWriter 对象。

```java
private IndexWriter writer;

public Indexer(String indexDirectoryPath) throws IOException {
   //this directory will contain the indexes
   Directory indexDirectory = 
      FSDirectory.open(new File(indexDirectoryPath));
   
   //create the indexer
   writer = new IndexWriter(indexDirectory, 
      new StandardAnalyzer(Version.LUCENE_36),true,
      IndexWriter.MaxFieldLength.UNLIMITED);
}
```

## 开始索引过程

以下程序展示了如何开始索引过程：

```java
private void indexFile(File file) throws IOException {
   System.out.println("Indexing "+file.getCanonicalPath());
   Document document = getDocument(file);
   writer.addDocument(document);
}
```

此方法用于将文件索引到 Lucene 中。

# 示例应用程序

为了测试索引过程，我们需要创建一个 Lucene 应用程序测试。

## 步骤

1. 在 com.tutorialspoint.lucene 包下创建一个名为 LuceneFirstApplication 的项目，如在 Lucene - First Application 章节中所述。您也可以直接使用在 Lucene - First Application 章节中创建的项目，以便在本章中理解索引过程。

2. 如在 Lucene - First Application 章节中所述，创建 LuceneConstants.java、TextFileFilter.java 和 Indexer.java。保持其余文件不变。

3. 创建以下所述的 LuceneTester.java。

4. 清理并构建应用程序，以确保业务逻辑按要求正常运行。

## LuceneConstants.java

该类用于提供在示例应用程序中使用的各种常量。

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

该类用作 .txt 文件的过滤器。

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

## Indexer.java

该类用于对原始数据进行索引，以便我们可以使用 Lucene 库进行搜索。

```java
package com.tutorialspoint.lucene;

import java.io.File;
import java.io.FileFilter;
import java.io.FileReader;
import java.io.IOException;

import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.index.CorruptIndexException;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;

public class Indexer {

   private IndexWriter writer;

   public Indexer(String indexDirectoryPath) throws IOException {
      //this directory will contain the indexes
      Directory indexDirectory = 
         FSDirectory.open(new File(indexDirectoryPath));

      //create the indexer
      writer = new IndexWriter(indexDirectory, 
         new StandardAnalyzer(Version.LUCENE_36),true,
         IndexWriter.MaxFieldLength.UNLIMITED);
   }

   public void close() throws CorruptIndexException, IOException {
      writer.close();
   }

   private Document getDocument(File file) throws IOException {
      Document document = new Document();

      //index file contents
      Field contentField = new Field(LuceneConstants.CONTENTS, 
         new FileReader(file));
      
      //index file name
      Field fileNameField = new Field(LuceneConstants.FILE_NAME,
         file.getName(),
         Field.Store.YES,Field.Index.NOT_ANALYZED);
      
      //index file path
      Field filePathField = new Field(LuceneConstants.FILE_PATH,
         file.getCanonicalPath(),
         Field.Store.YES,Field.Index.NOT_ANALYZED);

      document.add(contentField);
      document.add(fileNameField);
      document.add(filePathField);

      return document;
   }   

   private void indexFile(File file) throws IOException {
      System.out.println("Indexing "+file.getCanonicalPath());
      Document document = getDocument(file);
      writer.addDocument(document);
   }

   public int createIndex(String dataDirPath, FileFilter filter) 
      throws IOException {
      //get all files in the data directory
      File[] files = new File(dataDirPath).listFiles();

      for (File file : files) {
         if(!file.isDirectory()
            && !file.isHidden()
            && file.exists()
            && file.canRead()
            && filter.accept(file)
         ){
            indexFile(file);
         }
      }
      return writer.numDocs();
   }
}
```

以上是示例应用程序的必要部分。您可以根据需要进行扩展和修改，以满足您的具体需求。

```java
package com.tutorialspoint.lucene;

import java.io.IOException;

public class LuceneTester {
	
   String indexDir = "E:\\Lucene\\Index";
   String dataDir = "E:\\Lucene\\Data";
   Indexer indexer;
   
   public static void main(String[] args) {
      LuceneTester tester;
      try {
         tester = new LuceneTester();
         tester.createIndex();
      } catch (IOException e) {
         e.printStackTrace();
      } 
   }

   private void createIndex() throws IOException {
      indexer = new Indexer(indexDir);
      int numIndexed;
      long startTime = System.currentTimeMillis();	
      numIndexed = indexer.createIndex(dataDir, new TextFileFilter());
      long endTime = System.currentTimeMillis();
      indexer.close();
      System.out.println(numIndexed + " 个文件已建立索引，耗时： " + (endTime-startTime) + " 毫秒");		
   }
}
```

此类用于测试 Lucene 库的索引功能。

## 数据和索引目录创建

我们使用了包含学生姓名和其他详细信息的 10 个文本文件，从 record1.txt 到 record10.txt，并将它们放在目录 E:\Lucene\Data 下。测试数据。应创建索引目录路径为 E:\Lucene\Index。运行此程序后，您可以在该文件夹中看到创建的索引文件列表。

## 运行程序

完成源代码、原始数据、数据目录和索引目录的创建后，您可以通过编译和运行程序来继续。要执行此操作，请保持 LuceneTester.java 文件标签处于活动状态，并使用 Eclipse IDE 中提供的“运行”选项，或者使用 Ctrl + F11 编译和运行您的 LuceneTester 应用程序。如果应用程序成功运行，将在 Eclipse IDE 的控制台中打印以下消息：

```
Indexing E:\Lucene\Data\record1.txt
Indexing E:\Lucene\Data\record10.txt
Indexing E:\Lucene\Data\record2.txt
Indexing E:\Lucene\Data\record3.txt
Indexing E:\Lucene\Data\record4.txt
Indexing E:\Lucene\Data\record5.txt
Indexing E:\Lucene\Data\record6.txt
Indexing E:\Lucene\Data\record7.txt
Indexing E:\Lucene\Data\record8.txt
Indexing E:\Lucene\Data\record9.txt
10 个文件已建立索引，耗时： 109 毫秒
```

成功运行程序后，您将在索引目录中看到以下内容。

# Lucene - Indexing Operations

# 索引操作

在本章中，我们将讨论索引的四个主要操作。这些操作在不同的时间都很有用，并且在软件搜索应用程序中被广泛使用。

## 索引操作

以下是在索引过程中常用的操作列表：

### 1. 添加文档

此操作在索引过程的初始阶段使用，用于在新可用内容上创建索引。

### 2. 更新文档

此操作用于更新索引以反映更新内容中的更改。类似于重新创建索引。

### 3. 删除文档

此操作用于更新索引以排除不需要被索引/搜索的文档。

### 4. 字段选项

字段选项指定一种方式或控制字段内容如何进行搜索的方式。


# 参考资料

https://www.tutorialspoint.com/lucene/lucene_indexing_process.htm

* any list
{:toc}