---
layout: post
title: lucene 从零手写实现-05-lucene 核心类源码浅析
date: 2022-01-29 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, code, source-code, sh]
published: true
---

# lucene 例子

在Lucene中，权重计算是由 `Similarity` 类及其子类负责的。

以下是一个简单的Java示例，演示如何使用Lucene的`TFIDFSimilarity`来计算文档的权重。

请注意，以下示例使用Lucene的版本为8.x。

具体实现可能会根据Lucene版本而有所不同。

首先，你需要添加Lucene的依赖：

```xml
<!-- Add Lucene dependencies to your project -->
<dependency>
    <groupId>org.apache.lucene</groupId>
    <artifactId>lucene-core</artifactId>
    <version>8.11.1</version> <!-- Replace with the latest version -->
</dependency>
<dependency>
    <groupId>org.apache.lucene</groupId>
    <artifactId>lucene-analyzers-common</artifactId>
    <version>8.11.1</version> <!-- Replace with the latest version -->
</dependency>
```

然后，以下是一个简单的Java示例，演示如何使用Lucene的`TFIDFSimilarity`计算文档的权重：

```java
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.IndexWriterConfig.OpenMode;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.RAMDirectory;
import org.apache.lucene.util.Version;
import org.apache.lucene.search.similarities.TFIDFSimilarity;

public class LuceneTFIDFExample {
    public static void main(String[] args) throws Exception {
        // 创建内存索引目录
        Directory indexDirectory = new RAMDirectory();

        // 使用标准分词器
        Analyzer analyzer = new StandardAnalyzer();

        // 配置IndexWriter
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(OpenMode.CREATE_OR_APPEND);

        // 创建IndexWriter
        IndexWriter indexWriter = new IndexWriter(indexDirectory, config);

        // 添加文档到索引
        addDocument(indexWriter, "1", "Lucene is a full-text search library.");
        addDocument(indexWriter, "2", "It is widely used for information retrieval.");

        // 提交事务
        indexWriter.commit();

        // 使用相似度模型 TFIDFSimilarity
        TFIDFSimilarity similarity = new TFIDFSimilarity();

        // 创建IndexSearcher
        IndexSearcher indexSearcher = new IndexSearcher(indexWriter.getReader());
        indexSearcher.setSimilarity(similarity);

        // 查询
        Query query = new TermQuery(new org.apache.lucene.index.Term("content", "search"));
        ScoreDoc[] hits = indexSearcher.search(query, 10).scoreDocs;

        // 输出查询结果
        for (ScoreDoc hit : hits) {
            Document hitDoc = indexSearcher.doc(hit.doc);
            System.out.println("Document ID: " + hitDoc.get("id") + ", Score: " + hit.score);
        }

        // 关闭IndexWriter
        indexWriter.close();
    }

    private static void addDocument(IndexWriter indexWriter, String id, String content) throws Exception {
        Document document = new Document();
        document.add(new Field("id", id, Field.Store.YES, Field.Index.NO));
        document.add(new Field("content", content, Field.Store.YES, Field.Index.ANALYZED));
        indexWriter.addDocument(document);                                                                                                              
    }
}
```

在此示例中，我们使用了 `TFIDFSimilarity` 作为相似度模型，并使用标准分词器。

`addDocument` 方法用于向索引中添加文档。

在查询时，我们使用 `TermQuery` 查询，并输出文档的得分。请注意，得分的具体计算取决于所选的相似度模型。

这只是一个简单的示例，实际应用中可能需要更多的配置和处理。

在实际项目中，你可能需要更复杂的分析器、索引字段、相似度模型等，以满足具体需求。


# 核心类

我们根据这个入门例子，可以找到对应的核心类：

Directory 内存索引目录
Analyzer analyzer 使用标准分词器
IndexWriter indexWriter 创建IndexWriter
Document 文档

IndexSearcher 查询类
ScoreDoc 分数结果
Query 查询

# Directory 类

## 源码

```java
public abstract class Directory implements Closeable {
  
  public abstract String[] listAll() throws IOException;

  public abstract void deleteFile(String name) throws IOException;

  public abstract long fileLength(String name) throws IOException;

  public abstract IndexOutput createOutput(String name, IOContext context) throws IOException;

  public abstract IndexOutput createTempOutput(String prefix, String suffix, IOContext context)
      throws IOException;

  public abstract void sync(Collection<String> names) throws IOException;

  public abstract void syncMetaData() throws IOException;

  public abstract void rename(String source, String dest) throws IOException;

  public abstract IndexInput openInput(String name, IOContext context) throws IOException;

  public ChecksumIndexInput openChecksumInput(String name) throws IOException {
    return new BufferedChecksumIndexInput(openInput(name, IOContext.READONCE));
  }

  public abstract Lock obtainLock(String name) throws IOException;

  public abstract void close() throws IOException;

  protected void ensureOpen() throws AlreadyClosedException {}

  public abstract Set<String> getPendingDeletions() throws IOException;

}
```

# IndexWriter

# IndexReader

# IndexSearch

# Analyzer


# Query

# Document

# ScoreDoc

```java
public class ScoreDoc {

  /** The score of this document for the query. */
  public float score;

  /**
   * A hit document's number.
   *
   * @see StoredFields#document(int)
   */
  public int doc;

  /** Only set by {@link TopDocs#merge} */
  public int shardIndex;

  //
}
```

# 参考资料

* any list
{:toc}