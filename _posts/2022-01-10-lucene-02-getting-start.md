---
layout: post
title: Lucene-02-get start 入门例子
date: 2022-01-10 21:01:55 +0800
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---
 
# 入门例子

## maven 引入

引入基本的 maven 依赖。

```xml
<dependencies>
    <!-- https://mvnrepository.com/artifact/org.apache.lucene/lucene-core -->
    <!-- Lucene核心库 -->
    <dependency>
        <groupId>org.apache.lucene</groupId>
        <artifactId>lucene-core</artifactId>
        <version>7.2.1</version>
    </dependency>
    <!-- Lucene解析库 -->
    <dependency>
        <groupId>org.apache.lucene</groupId>
        <artifactId>lucene-queryparser</artifactId>
        <version>7.2.1</version>
    </dependency>
    <!-- Lucene附加的分析库 -->
    <dependency>
        <groupId>org.apache.lucene</groupId>
        <artifactId>lucene-analyzers-common</artifactId>
        <version>7.2.1</version>
    </dependency>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.10</version>
    </dependency>
</dependencies>
```

## 创建索引

实例代码如下：

```java
package com.github.houbb.lucene.learn;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Paths;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;

/**
 * @author binbin.hou
 * @date 2018/11/15 11:24
 */
public class Indexer {

    /**
     * 写索引实例
     */
    private IndexWriter writer;

    /**
     * 构造方法 实例化IndexWriter
     *
     * @param indexDir
     * @throws IOException
     */
    public Indexer(String indexDir) throws IOException {
        //得到索引所在目录的路径
        Directory directory = FSDirectory.open(Paths.get(indexDir));
        // 标准分词器
        Analyzer analyzer = new StandardAnalyzer();
        //保存用于创建IndexWriter的所有配置。
        IndexWriterConfig iwConfig = new IndexWriterConfig(analyzer);
        //实例化IndexWriter
        writer = new IndexWriter(directory, iwConfig);
    }

    /**
     * 关闭写索引
     *
     * @return 索引了多少个文件
     * @throws Exception
     */
    public void close() throws IOException {
        writer.close();
    }

    public int index(String dataDir) throws Exception {
        File[] files = new File(dataDir).listFiles();
        for (File file : files) {
            //索引指定文件
            indexFile(file);
        }
        //返回索引了多少个文件
        return writer.numDocs();

    }

    /**
     * 索引指定文件
     *
     * @param f
     */
    private void indexFile(File f) throws Exception {
        //输出索引文件的路径
        System.out.println("索引文件：" + f.getCanonicalPath());
        //获取文档，文档里再设置每个字段
        Document doc = getDocument(f);
        //开始写入,就是把文档写进了索引文件里去了；
        writer.addDocument(doc);
    }

    /**
     * 获取文档，文档里再设置每个字段
     *
     * @param f
     * @return document
     */
    private Document getDocument(File f) throws Exception {
        Document doc = new Document();
        //把设置好的索引加到Document里，以便在确定被索引文档
        doc.add(new TextField("contents", new FileReader(f)));
        //Field.Store.YES：把文件名存索引文件里，为NO就说明不需要加到索引文件里去
        doc.add(new TextField("fileName", f.getName(), Field.Store.YES));
        //把完整路径存在索引文件里
        doc.add(new TextField("fullPath", f.getCanonicalPath(), Field.Store.YES));
        return doc;
    }

    public static void main(String[] args) {
        //索引指定的文档路径
        String indexDir = "D:\\lucene\\dataindex";
        ////被索引数据的路径
        String dataDir = "D:\\lucene\\data";
        Indexer indexer = null;
        int numIndexed = 0;
        //索引开始时间
        long start = System.currentTimeMillis();
        try {
            indexer = new Indexer(indexDir);
            numIndexed = indexer.index(dataDir);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                indexer.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        //索引结束时间
        long end = System.currentTimeMillis();
        System.out.println("索引：" + numIndexed + " 个文件 花费了" + (end - start) + " 毫秒");
    }
}
```

## 使用索引

```java
package com.github.houbb.lucene.learn;

import java.nio.file.Paths;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;

/**
 * @author binbin.hou
 * @date 2018/11/15 11:35
 */
public class Searcher {

    public static void search(String indexDir, String q) throws Exception {

        // 得到读取索引文件的路径
        Directory dir = FSDirectory.open(Paths.get(indexDir));
        // 通过dir得到的路径下的所有的文件
        IndexReader reader = DirectoryReader.open(dir);
        // 建立索引查询器
        IndexSearcher is = new IndexSearcher(reader);
        // 实例化分析器
        Analyzer analyzer = new StandardAnalyzer();
        // 建立查询解析器
        /**
         * 第一个参数是要查询的字段； 第二个参数是分析器Analyzer
         */
        QueryParser parser = new QueryParser("contents", analyzer);
        // 根据传进来的p查找
        Query query = parser.parse(q);
        // 计算索引开始时间
        long start = System.currentTimeMillis();
        // 开始查询
        /**
         * 第一个参数是通过传过来的参数来查找得到的query； 第二个参数是要出查询的行数
         */
        TopDocs hits = is.search(query, 10);
        // 计算索引结束时间
        long end = System.currentTimeMillis();
        System.out.println("匹配 " + q + " ，总共花费" + (end - start) + "毫秒" + "查询到" + hits.totalHits + "个记录");
        // 遍历hits.scoreDocs，得到scoreDoc
        /**
         * ScoreDoc:得分文档,即得到文档 scoreDocs:代表的是topDocs这个文档数组
         *
         * @throws Exception
         */
        for (ScoreDoc scoreDoc : hits.scoreDocs) {
            Document doc = is.doc(scoreDoc.doc);
            System.out.println(doc.get("fullPath"));
        }

        // 关闭reader
        reader.close();
    }

    public static void main(String[] args) {
        String indexDir = "D:\\lucene\\dataindex";
        //我们要搜索的内容
        String q = "lucene";
        try {
            search(indexDir, q);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```


# V9.0.0 例子

## 官方例子

```java
Analyzer analyzer = new StandardAnalyzer();

Path indexPath = Files.createTempDirectory("tempIndex");
Directory directory = FSDirectory.open(indexPath);
IndexWriterConfig config = new IndexWriterConfig(analyzer);
IndexWriter iwriter = new IndexWriter(directory, config);
Document doc = new Document();
String text = "This is the text to be indexed.";
doc.add(new Field("fieldname", text, TextField.TYPE_STORED));
iwriter.addDocument(doc);
iwriter.close();

// Now search the index:
DirectoryReader ireader = DirectoryReader.open(directory);
IndexSearcher isearcher = new IndexSearcher(ireader);
// Parse a simple query that searches for "text":
QueryParser parser = new QueryParser("fieldname", analyzer);
Query query = parser.parse("text");
ScoreDoc[] hits = isearcher.search(query, 10).scoreDocs;
assertEquals(1, hits.length);
// Iterate through the results:
for (int i = 0; i < hits.length; i++) {
  Document hitDoc = isearcher.doc(hits[i].doc);
  assertEquals("This is the text to be indexed.", hitDoc.get("fieldname"));
}
ireader.close();
directory.close();
IOUtils.rm(indexPath);
```

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

https://lucene.apache.org/core/9_0_0/core/index.html

https://lucene.apache.org/core/9_0_0/index.html

[Lucene开发环境搭建-Maven](https://blog.csdn.net/fulibaocs/article/details/79355997)

[Lucene介绍与入门使用](https://www.cnblogs.com/xiaobai1226/p/7652093.html)

[LUCENE入门案例](https://blog.csdn.net/jiemaio/article/details/90649087)

[技术实现细节](https://github.com/zzboy/lucene)

[Lucene概述](https://blog.csdn.net/y3over/article/details/108064940)

[Elasticsearch内核剖析](https://zhuanlan.zhihu.com/p/35643348)

* any list
{:toc}