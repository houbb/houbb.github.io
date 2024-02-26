---
layout: post
title: Lucene Tutorial-08-Lucene 搜索引擎入门教程排序 sorting
date: 2022-01-29 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, NLP, sh]
published: true
---

在本章中，我们将研究Lucene默认提供的搜索结果排序顺序，或者根据需要进行操控。

## 按相关性排序

这是Lucene使用的默认排序模式。Lucene按照最相关的搜索结果排在顶部。

```java
private void sortUsingRelevance(String searchQuery)
   throws IOException, ParseException {
   searcher = new Searcher(indexDir);
   long startTime = System.currentTimeMillis();
   
   // 创建用于搜索文件名的术语
   Term term = new Term(LuceneConstants.FILE_NAME, searchQuery);
   // 创建术语查询对象
   Query query = new FuzzyQuery(term);
   searcher.setDefaultFieldSortScoring(true, false);
   // 进行搜索
   TopDocs hits = searcher.search(query, Sort.RELEVANCE);
   long endTime = System.currentTimeMillis();

   System.out.println(hits.totalHits +
      " documents found. Time :" + (endTime - startTime) + "ms");
   for(ScoreDoc scoreDoc : hits.scoreDocs) {
      Document doc = searcher.getDocument(scoreDoc);
      System.out.print("Score: "+ scoreDoc.score + " ");
      System.out.println("File: "+ doc.get(LuceneConstants.FILE_PATH));
   }
   searcher.close();
}
```

## 按索引顺序排序

这种排序模式由Lucene使用。在这里，索引的第一个文档首先显示在搜索结果中。

```java
private void sortUsingIndex(String searchQuery)
   throws IOException, ParseException {
   searcher = new Searcher(indexDir);
   long startTime = System.currentTimeMillis();
   
   // 创建用于搜索文件名的术语
   Term term = new Term(LuceneConstants.FILE_NAME, searchQuery);
   // 创建术语查询对象
   Query query = new FuzzyQuery(term);
   searcher.setDefaultFieldSortScoring(true, false);
   // 进行搜索
   TopDocs hits = searcher.search(query, Sort.INDEXORDER);
   long endTime = System.currentTimeMillis();

   System.out.println(hits.totalHits +
      " documents found. Time :" + (endTime - startTime) + "ms");
   for(ScoreDoc scoreDoc : hits.scoreDocs) {
      Document doc = searcher.getDocument(scoreDoc);
      System.out.print("Score: "+ scoreDoc.score + " ");
      System.out.println("File: "+ doc.get(LuceneConstants.FILE_PATH));
   }
   searcher.close();
}
```

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
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;

public class Searcher {
    
    IndexSearcher indexSearcher;
    QueryParser queryParser;
    Query query;

    public Searcher(String indexDirectoryPath) throws IOException {
        Directory indexDirectory 
            = FSDirectory.open(new File(indexDirectoryPath));
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

    public TopDocs search(Query query) 
        throws IOException, ParseException {
        return indexSearcher.search(query, LuceneConstants.MAX_SEARCH);
    }

    public TopDocs search(Query query, Sort sort) 
        throws IOException, ParseException {
        return indexSearcher.search(query, 
            LuceneConstants.MAX_SEARCH, sort);
    }

    public void setDefaultFieldSortScoring(boolean doTrackScores, 
        boolean doMaxScores) {
        indexSearcher.setDefaultFieldSortScoring(
            doTrackScores, doMaxScores);
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

以上是示例应用程序的Searcher类的实现，它用于读取原始数据上创建的索引，并使用Lucene库搜索数据。


# 示例应用程序

## 创建测试 Lucene 应用程序以测试排序过程

### 步骤描述

1. 创建一个名为 LuceneFirstApplication 的项目，位于 com.tutorialspoint.lucene 包下，如《Lucene - First Application》章节所述。您也可以直接使用《Lucene - First Application》章节中创建的项目，以便在本章理解搜索过程。

2. 如《Lucene - First Application》章节所述，创建 LuceneConstants.java 和 Searcher.java。保持其他文件不变。

3. 如下所述，创建 LuceneTester.java。

4. 清理并构建应用程序，以确保业务逻辑符合要求。

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


## Searcher.java

Searcher.java 类用于读取在原始数据上创建的索引，并利用 Lucene 库搜索数据。


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
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;

public class Searcher {
	
IndexSearcher indexSearcher;
   QueryParser queryParser;
   Query query;

   public Searcher(String indexDirectoryPath) throws IOException {
      Directory indexDirectory 
         = FSDirectory.open(new File(indexDirectoryPath));
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

   public TopDocs search(Query query) 
      throws IOException, ParseException {
      return indexSearcher.search(query, LuceneConstants.MAX_SEARCH);
   }

   public TopDocs search(Query query,Sort sort) 
      throws IOException, ParseException {
      return indexSearcher.search(query, 
         LuceneConstants.MAX_SEARCH,sort);
   }

   public void setDefaultFieldSortScoring(boolean doTrackScores, 
      boolean doMaxScores) {
      indexSearcher.setDefaultFieldSortScoring(
         doTrackScores,doMaxScores);
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

## LuceneTester.java

LuceneTester.java 类用于测试 Lucene 库的搜索功能。

```java
package com.tutorialspoint.lucene;

import java.io.IOException;

import org.apache.lucene.document.Document;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.search.FuzzyQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.Sort;
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
          tester.sortUsingRelevance("cord3.txt");
          tester.sortUsingIndex("cord3.txt");
      } catch (IOException e) {
          e.printStackTrace();
      } catch (ParseException e) {
          e.printStackTrace();
      }		
   }

   private void sortUsingRelevance(String searchQuery)
      throws IOException, ParseException {
      searcher = new Searcher(indexDir);
      long startTime = System.currentTimeMillis();
      
      //create a term to search file name
      Term term = new Term(LuceneConstants.FILE_NAME, searchQuery);
      //create the term query object
      Query query = new FuzzyQuery(term);
      searcher.setDefaultFieldSortScoring(true, false);
      //do the search
      TopDocs hits = searcher.search(query,Sort.RELEVANCE);
      long endTime = System.currentTimeMillis();

      System.out.println(hits.totalHits +
         " documents found. Time :" + (endTime - startTime) + "ms");
      for(ScoreDoc scoreDoc : hits.scoreDocs) {
         Document doc = searcher.getDocument(scoreDoc);
         System.out.print("Score: "+ scoreDoc.score + " ");
         System.out.println("File: "+ doc.get(LuceneConstants.FILE_PATH));
      }
      searcher.close();
   }

   private void sortUsingIndex(String searchQuery)
      throws IOException, ParseException {
      searcher = new Searcher(indexDir);
      long startTime = System.currentTimeMillis();
      //create a term to search file name
      Term term = new Term(LuceneConstants.FILE_NAME, searchQuery);
      //create the term query object
      Query query = new FuzzyQuery(term);
      searcher.setDefaultFieldSortScoring(true, false);
      //do the search
      TopDocs hits = searcher.search(query,Sort.INDEXORDER);
      long endTime = System.currentTimeMillis();

      System.out.println(hits.totalHits +
      " documents found. Time :" + (endTime - startTime) + "ms");
      for(ScoreDoc scoreDoc : hits.scoreDocs) {
         Document doc = searcher.getDocument(scoreDoc);
         System.out.print("Score: "+ scoreDoc.score + " ");
         System.out.println("File: "+ doc.get(LuceneConstants.FILE_PATH));
      }
      searcher.close();
   }
}
```

# 数据与索引目录创建

## 概述
我们使用了从 record1.txt 到 record10.txt 的 10 个文本文件，这些文件包含了学生的姓名和其他详细信息，并将它们放置在目录 E:\Lucene\Data 中。测试数据。索引目录路径应该创建为 E:\Lucene\Index。在运行章节 Lucene - Indexing Process 中的索引程序后，您可以在该文件夹中看到创建的索引文件列表。

## 程序运行

一旦您完成了源代码、原始数据、数据目录、索引目录以及索引的创建，您就可以编译并运行您的程序。要做到这一点，保持 LuceneTester.java 文件选项卡处于活动状态，并在 Eclipse IDE 中使用“运行”选项，或使用 Ctrl + F11 编译并运行您的 LuceneTester 应用程序。如果您的应用程序成功运行，它将在 Eclipse IDE 的控制台中打印以下消息：

```
找到 10 个文档。时间：31ms
得分：1.3179655 文件：E:\Lucene\Data\record3.txt
得分：0.790779 文件：E:\Lucene\Data\record1.txt
得分：0.790779 文件：E:\Lucene\Data\record2.txt
得分：0.790779 文件：E:\Lucene\Data\record4.txt
得分：0.790779 文件：E:\Lucene\Data\record5.txt
得分：0.790779 文件：E:\Lucene\Data\record6.txt
得分：0.790779 文件：E:\Lucene\Data\record7.txt
得分：0.790779 文件：E:\Lucene\Data\record8.txt
得分：0.790779 文件：E:\Lucene\Data\record9.txt
得分：0.2635932 文件：E:\Lucene\Data\record10.txt
找到 10 个文档。时间：0ms
得分：0.790779 文件：E:\Lucene\Data\record1.txt
得分：0.2635932 文件：E:\Lucene\Data\record10.txt
得分：0.790779 文件：E:\Lucene\Data\record2.txt
得分：1.3179655 文件：E:\Lucene\Data\record3.txt
得分：0.790779 文件：E:\Lucene\Data\record4.txt
得分：0.790779 文件：E:\Lucene\Data\record5.txt
得分：0.790779 文件：E:\Lucene\Data\record6.txt
得分：0.790779 文件：E:\Lucene\Data\record7.txt
得分：0.790779 文件：E:\Lucene\Data\record8.txt
得分：0.790779 文件：E:\Lucene\Data\record9.txt
```

## 注意事项

- 在执行程序之前，请确保已正确设置 Lucene 库。

- 请确保提供了正确的原始数据和索引目录路径。

- 请根据需要修改程序以适应您的环境。

# 参考资料

https://www.tutorialspoint.com/lucene/lucene_sorting.htm

* any list
{:toc}