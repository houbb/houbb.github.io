---
layout: post
title: Lucene-01-lucene 入门教程
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [index, search, lucene, sh]
published: true
---

# Apache Lucene

[Apache Lucene](http://lucene.apache.org/) 项目开发开源搜索软件，

包括：

1. Lucene Core是我们的旗舰子项目，提供基于Java的索引和搜索技术，以及拼写检查，命中突出显示和高级分析/标记化功能。

2. SolrTM是一个使用Lucene Core构建的高性能搜索服务器，具有XML/HTTP和JSON/Python/Ruby API，突出显示，分面搜索，缓存，复制和Web管理界面。

3. PyLucene是Core项目的Python端口。

# Lucene 和 solr

我想提到Lucene，不得不提solr了。

很多刚接触Lucene和Solr的人都会问这个明显的问题：我应该使用Lucene还是Solr？

答案很简单：如果你问自己这个问题，在99％的情况下，你想使用的是Solr。 

形象的来说Solr和Lucene之间关系的方式是汽车及其引擎。

你不能驾驶一台发动机，但可以开一辆汽车。 同样，Lucene是一个程序化库，您不能按原样使用，而Solr是一个完整的应用程序，您可以立即使用它。
 
> 参考：[Lucene vs Solr](http://www.lucenetutorial.com/lucene-vs-solr.html)

# Lucene Core

[Lucene Core](http://lucene.apache.org/core/) 是一个完全用Java编写的高性能，全功能的文本搜索引擎库。

它是一种适用于几乎所有需要全文搜索的应用程序的技术，尤其是跨平台搜索。


# Lucene

Apache LuceneTM 项目开发开源搜索软件，包括：

- **Lucene Core**，我们的旗舰子项目，提供基于Java的索引和搜索技术，以及拼写检查、命中高亮和先进的分析/分词功能。

- **Solr** 是一个高性能的搜索服务器，使用 Lucene Core 构建，具有基于 XML/HTTP 和 JSON/Python/Ruby 的 API，命中高亮、分面搜索、缓存、复制和Web管理界面。

- **PyLucene** 是 Core 项目的 Python 移植版本。

# Lucene 功能

Lucene通过简单的API提供强大的功能：

## 可扩展的高性能索引

- 在现代硬件上超过150GB /小时

- 小RAM要求 - 只有1MB堆

- 增量索引与批量索引一样快

- 索引大小约为索引文本大小的20-30％


## 强大，准确，高效的搜索算法

- 排名搜索 - 首先返回最佳结果

- 许多强大的查询类型：短语查询，通配符查询，邻近查询，范围查询等

- 现场搜索（例如标题，作者，内容）

- 按任何字段排序

- 使用合并结果进行多索引搜索

- 允许同时更新和搜索

- 灵活的分面，突出显示，连接和结果分组

- 快速，内存效率和错误容忍的建议

- 可插拔排名模型，包括矢量空间模型和Okapi BM25

- 可配置存储引擎（编解码器）

## 跨平台解决方案

- 作为Apache许可下的开源软件提供，允许您在商业和开源程序中使用Lucene

- 100％-pure Java

- 可用的其他编程语言中的实现是索引兼容的


# 全文检索

- 全文检索是什么？

全文数据库是全文检索系统的主要构成部分。所谓全文数据库是将一个完整的信息源的全部内容转化为计算机可以识别、处理的信息单元而形成的数据集合。全文数据库不仅存储了信息，而且还有对全文数据进行词、字、段落等更深层次的编辑、加工的功能，而且所有全文数据库无一不是海量信息数据库。

全文检索首先将要查询的目标文档中的词提取出来，组成索引，通过查询索引达到搜索目标文档的目的。这种先建立索引，再对索引进行搜索的过程就叫全文检索（Full-text Search）。

全文检索（Full-Text Retrieval）是指以文本作为检索对象，找出含有指定词汇的文本。

全面、准确和快速是衡量全文检索系统的关键指标。

- 我们应该知道的

关于全文检索，我们要知道：

1. 只处理文本。

2. 不处理语义。

3. 搜索时英文不区分大小写。

结果列表有相关度排序。

(查出的结果如果没有相关度排序，那么系统不知道我想要的结果在哪一页。我们在使用百度搜索时，一般不需要翻页，为什么？

因为百度做了相关度排序：为每一条结果打一个分数，这条结果越符合搜索条件，得分就越高，叫做相关度得分，结果列表会按照这个分数由高到低排列，所以第1页的结果就是我们最想要的结果。) 

在信息检索工具中，全文检索是最具通用性和实用性的。

- 全文检索和数据库搜索的区别 

简单来说，这两者解决的问题是不一样。

数据库搜索在匹配效果、速度、效率等方面都逊色于全文检索。

下面我们的一个例子就能很清楚说明这一点。

# Lucene实现全文检索流程是什么？

![lucene-search-flow](https://user-gold-cdn.xitu.io/2018/3/30/16275e63278d4ea8?w=720&h=631&f=jpeg&s=40423)

## 流程

全文检索的流程分为两大部分：索引流程、搜索流程。

索引流程：即采集数据构建文档对象分析文档（分词）创建索引。

搜索流程：即用户通过搜索界面创建查询执行搜索，搜索器从索引库搜索渲染搜索结果

我们在下面的一个程序中，对这个全文检索的流程会有进一步的了解。

# 快速开始

## jar 引入

```xml
<dependencies>
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
</dependencies>
```

## 索引代码编写

- 原始文件夹内容

对 **D:\lucene\data** 下的文件生成索引。

文件夹下内容如下：

```
1.txt  2.txt
```

- 代码

```java
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

- 测试日志

```
索引文件：D:\lucene\data\1.txt
索引文件：D:\lucene\data\2.txt
索引：5 个文件 花费了953 毫秒
```

- 生成的索引文件

在 `D:\\lucene\\dataindex` 文件夹下，文件如下：

```
_0.cfe  _0.cfs  _0.si  segments_1  write.lock
```

文件格式参见：[Lucene学习总结之三：Lucene的索引文件格式(1)](https://www.cnblogs.com/forfuture1978/archive/2009/12/14/1623597.html)

## 查询代码编写

- Searcher.java

```java
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

- 日志信息

```
匹配 lucene ，总共花费17毫秒查询到1个记录
D:\lucene\data\1.txt
```

- 1.txt 的内容

其中内容如下：

```
I love lucene
```

# Lucene实现全文检索流程是什么？

![lucene-flow](https://user-gold-cdn.xitu.io/2018/3/30/1627600f3bbd0282?w=554&h=394&f=jpeg&s=15865)

在Lucene中，采集数据（从网站爬取或连接数据库）就是为了创建索引，创建索引需要先将采集的原始数据加工为文档，再由文档分词产生索引。

文档（Document） 中包含若干个Field域。 

IndexWriter是索引过程的核心组件，通过IndexWriter可以创建新索引、更新索引、删除索引操作。

IndexWriter需要通过Directory对索引进行存储操作。

Directory描述了索引的存储位置，底层封装了I/O操作，负责对索引进行存储。

它是一个抽象类，它的子类常用的包括FSDirectory（在文件系统存储索引）、RAMDirectory（在内存存储索引）。

在对Docuemnt中的内容索引之前需要使用分词器进行分词，分词的主要过程就是分词、过滤两步。 

分词就是将采集到的文档内容切分成一个一个的词，具体应该说是将Document中Field的value值切分成一个一个的词。 

过滤包括去除标点符号、去除停用词（的、是、a、an、the等）、大写转小写、词的形还原（复数形式转成单数形参、过去式转成现在式等）。

停用词是为节省存储空间和提高搜索效率，搜索引擎在索引页面或处理搜索请求时会自动忽略某些字或词，这些字或词即被称为Stop Words（停用词）。

比如语气助词、副词、介词、连接词等，通常自身并无明确的意义，只有将其放入一个完整的句子中才有一定作用，如常见的“的”、“在”、“是”、“啊”等。 

Lucene中自带了StandardAnalyzer，它可以对英文进行分词。

# 数据库建立全文索引

数据库结合 lucene

# 参考资料

[lucene-doc](http://lucene.apache.org/core/7_5_0/index.html)

[lucene-wiki](https://wiki.apache.org/lucene-java/FrontPage?action=show&redirect=FrontPageEN)

- 与数据库

[用Lucene索引数据库](http://www.cnblogs.com/sharpest/p/5994852.html)

* any list
{:toc}