---
layout: post
title: Lucene Tutorial-03-Lucene 搜索引擎入门教程第一个应用
date: 2022-01-29 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, NLP, sh]
published: true
---

# Lucene 框架编程

## 简介

本章节将学习如何使用 Lucene 框架进行实际编程。在您开始编写第一个使用 Lucene 框架的示例之前，请确保您已按照 Lucene - 环境设置教程中所述正确设置了 Lucene 环境。

建议您具备 Eclipse IDE 的工作知识。

## 编写简单的搜索应用程序

让我们通过编写一个简单的搜索应用程序来开始。该应用程序将打印找到的搜索结果数量，并显示在此过程中创建的索引列表。

### 步骤 1 - 创建 Java 项目

第一步是使用 Eclipse IDE 创建一个简单的 Java 项目。按照菜单选项 File > New -> Project，然后从向导列表中选择 Java 项目向导。现在按照如下步骤在向导窗口中命名您的项目为 LuceneFirstApplication -

![Create Project Wizard](Create_Project_Wizard.png)

项目创建成功后，您将在项目资源管理器中看到以下内容 -

![Lucene First Application Directories](Lucene_First_Application_Directories.png)

### 步骤 2 - 添加所需库

现在让我们在项目中添加 Lucene 核心框架库。右键单击项目名称 LuceneFirstApplication，然后依次选择以下选项：Build Path -> Configure Build Path，以显示 Java 构建路径窗口如下 -

![Java Build Path](Java_Build_Path.png)

现在在“库”选项卡下使用“添加外部 JARs”按钮，从 Lucene 安装目录中添加以下核心 JAR 文件 -

- lucene-core-3.6.2

### 步骤 3 - 创建源文件

现在让我们在 LuceneFirstApplication 项目下创建实际的源文件。

首先，我们需要创建一个名为 com.tutorialspoint.lucene 的包。

为此，在包资源管理器部分右键单击 src，然后依次选择以下选项：New -> Package。

接下来，我们将在 com.tutorialspoint.lucene 包下创建 LuceneTester.java 和其他 Java 类。

#### LuceneConstants.java

此类用于提供在示例应用程序中使用的各种常量。

```java
package com.tutorialspoint.lucene;

public class LuceneConstants {
   public static final String CONTENTS = "contents";
   public static final String FILE_NAME = "filename";
   public static final String FILE_PATH = "filepath";
   public static final int MAX_SEARCH = 10;
}
```

#### TextFileFilter.java

此类用作 .txt 文件过滤器。

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

#### Indexer.java

此类用于对原始数据进行索引，以便我们可以使用 Lucene 库进行搜索。

```java
// 索引代码请参考原文，因篇幅限制暂不列出
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
      Field contentField = new Field(LuceneConstants.CONTENTS, new FileReader(file));
      //index file name
      Field fileNameField = new Field(LuceneConstants.FILE_NAME,
         file.getName(),Field.Store.YES,Field.Index.NOT_ANALYZED);
      //index file path
      Field filePathField = new Field(LuceneConstants.FILE_PATH,
         file.getCanonicalPath(),Field.Store.YES,Field.Index.NOT_ANALYZED);

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

#### Searcher.java

此类用于搜索 Indexer 创建的索引以搜索请求的内容。

```java
// 搜索代码请参考原文，因篇幅限制暂不列出
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
   
   public Searcher(String indexDirectoryPath) 
      throws IOException {
      Directory indexDirectory = 
         FSDirectory.open(new File(indexDirectoryPath));
      indexSearcher = new IndexSearcher(indexDirectory);
      queryParser = new QueryParser(Version.LUCENE_36,
         LuceneConstants.CONTENTS,
         new StandardAnalyzer(Version.LUCENE_36));
   }
   
   public TopDocs search( String searchQuery) 
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

#### LuceneTester.java

此类用于测试 Lucene 库的索引和搜索功能。

```java
// 测试代码请参考原文，因篇幅限制暂不列出
package com.tutorialspoint.lucene;

import java.io.IOException;

import org.apache.lucene.document.Document;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;

public class LuceneTester {
	
   String indexDir = "E:\\Lucene\\Index";
   String dataDir = "E:\\Lucene\\Data";
   Indexer indexer;
   Searcher searcher;

   public static void main(String[] args) {
      LuceneTester tester;
      try {
         tester = new LuceneTester();
         tester.createIndex();
         tester.search("Mohan");
      } catch (IOException e) {
         e.printStackTrace();
      } catch (ParseException e) {
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
      System.out.println(numIndexed+" File indexed, time taken: "
         +(endTime-startTime)+" ms");		
   }

   private void search(String searchQuery) throws IOException, ParseException {
      searcher = new Searcher(indexDir);
      long startTime = System.currentTimeMillis();
      TopDocs hits = searcher.search(searchQuery);
      long endTime = System.currentTimeMillis();
   
      System.out.println(hits.totalHits +
         " documents found. Time :" + (endTime - startTime));
      for(ScoreDoc scoreDoc : hits.scoreDocs) {
         Document doc = searcher.getDocument(scoreDoc);
            System.out.println("File: "
            + doc.get(LuceneConstants.FILE_PATH));
      }
      searcher.close();
   }
}
```

### 步骤 4 - 数据与索引目录创建

我们使用了包含学生姓名和其他详细信息的 10 个文本文件，文件名从 record1.txt 到 record10.txt，并将它们放在目录 E:\Lucene\Data 中。测试数据。

应创建索引目录路径为 E:\Lucene\Index。运行此程序后，您可以在该文件夹中看到所创建的索引文件列表。

### 步骤 5 - 运行程序

完成源代码、原始数据、数据目录和索引目录的创建后，您可以开始编译和运行程序了。要执行此操作，请保持 LuceneTester.Java 文件标签处于活动状态，然后使用 Eclipse IDE 中的“运行”选项或使用 Ctrl + F11 编译和运行 LuceneTester 应用程序。如果应用程序成功运行，它将在 Eclipse IDE 的控制台中打印以下消息 -

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
10 File indexed, time taken: 109 ms
1 documents found. Time :0
File: E:\Lucene\Data\record4.txt
```

成功运行程序后，您将在索引目录中看到以下内容 -

![Lucene Index Directory](Lucene_Index_Directory.png)

### 继续

现在让我们继续学习 Lucene 框架的使用。

### 步骤 6 - 进行搜索

我们已经成功地创建了索引并运行了搜索应用程序，现在让我们尝试进行一些搜索操作。

在 LuceneTester.java 中，我们已经定义了一个 `search` 方法，它接受一个搜索查询作为参数，并返回匹配的文档列表。让我们尝试搜索一些内容。

```java
LuceneTester tester = new LuceneTester();
try {
    tester.search("Mohan");
} catch (IOException | ParseException e) {
    e.printStackTrace();
}
```

上述代码将在索引中搜索包含 "Mohan" 的内容，并打印匹配的文档路径。您可以根据需要更改搜索查询的内容。

### 步骤 7 - 扩展功能

此示例仅涵盖了 Lucene 框架的基本功能。您可以根据实际需求扩展功能，例如：

- 改进搜索查询，使用更复杂的查询语法。
- 添加排序功能，按相关性或其他字段对搜索结果进行排序。
- 支持更多类型的文档，如 PDF、HTML 等。
- 实现高级搜索功能，如短语搜索、模糊搜索等。

### 总结

通过本教程，您学习了如何使用 Lucene 框架创建索引和执行搜索操作。Lucene 提供了强大的搜索功能，可用于构建各种搜索应用程序，从简单的文本搜索到复杂的信息检索系统。祝您使用 Lucene 框架开发出色的应用程序！

以上就是 Lucene 框架编程的全部内容。如果您有任何疑问，请随时提出。

# 参考资料

https://www.tutorialspoint.com/lucene/lucene_first_application.htm

* any list
{:toc}