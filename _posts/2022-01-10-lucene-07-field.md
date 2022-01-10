---
layout: post
title: Lucene-07-field 字段类型
date: 2022-01-10 21:01:55 +0800
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# Lucene的Field说明

Lucene存储对象是以document为存储单元，对象中相关的属性值则存放到Field中；

lucene中所有Field都是IndexableField接口的实现

## 接口

表示用于索引的单个字段。 IndexWriter 使用 `Iterable<IndexableField>` 作为文档。

```java
public interface IndexableField {

  // 字段名称
  public String name();

  // 描述字段的属性
  public IndexableFieldType fieldType();

  /**
   * 创建用于索引此字段的 TokenStream。 
   * 如果合适，实现应该使用给定的分析器来创建 TokenStreams。
   *
   * @param analyzer Analyzer that should be used to create the TokenStreams from
   * @param reuse TokenStream for a previous instance of this field <b>name</b>. This allows
   *              custom field types (like StringField and NumericField) that do not use
   *              the analyzer to still have good performance. Note: the passed-in type
   *              may be inappropriate, for example if you mix up different types of Fields
   *              for the same field name. So it's the responsibility of the implementation to
   *              check.
   * @return TokenStream value for indexing the document.  Should always return
   *         a non-null value if the field is to be indexed
   */
  public TokenStream tokenStream(Analyzer analyzer, TokenStream reuse);

  /** Non-null if this field has a binary value */
  public BytesRef binaryValue();

  /** Non-null if this field has a string value */
  public String stringValue();

  /** Non-null if this field has a Reader value */
  public Reader readerValue();

  /** Non-null if this field has a numeric value */
  public Number numericValue();
}
```

## Field 父类

所有的Field均是 org.apache.lucene.document.Field 的子类；

```java
public class Field implements IndexableField {

  /**
   * Field's type
   */
  protected final IndexableFieldType type;

  /**
   * Field's name
   */
  protected final String name;

  /** Field's value */
  protected Object fieldsData;

  /** Pre-analyzed tokenStream for indexed fields; this is
   * separate from fieldsData because you are allowed to
   * have both; eg maybe field has a String value but you
   * customize how it's tokenized */
  protected TokenStream tokenStream;

  //构造器和其他方法 
}
```

## 常见 Field

项目中我们常用的Field类型主要有

IntField, LongField, FloatField, DoubleField, BinaryDocValuesField, NumericDocValuesField, SortedDocValuesField, StringField, TextField, StoredField.

IntField 主要对int类型的字段进行存储，需要注意的是如果需要对InfField进行排序使用SortField.Type.INT来比较，如果进范围查询或过滤，需要采用NumericRangeQuery.newIntRange() 

LongField 主要处理Long类型的字段的存储，排序使用SortField.Type.Long,如果进行范围查询或过滤利用NumericRangeQuery.newLongRange()，LongField常用来进行时间戳的排序，保存System.currentTimeMillions() 

FloatField 对Float类型的字段进行存储，排序采用SortField.Type.Float,范围查询采用NumericRangeQuery.newFloatRange() 

BinaryDocVluesField 只存储不共享值，如果需要共享值可以用SortedDocValuesField 

NumericDocValuesField 用于数值类型的Field的排序(预排序)，需要在要排序的field后添加一个同名的NumericDocValuesField 

SortedDocValuesField 用于String类型的Field的排序，需要在StringField后添加同名的SortedDocValuesField 

StringField 用户String类型的字段的存储，StringField是只索引不分词 

TextField 对String类型的字段进行存储，TextField和StringField的不同是TextField既索引又分词 

StoredField 存储Field的值，可以用IndexSearcher.doc和IndexReader.document来获取此Field和存储的值 


# NumericDocValuesField 例子

```java
package com.github.houbb.lucene.learn.chap02;

import com.github.houbb.lucene.learn.utils.IndexerUtil;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.NumericDocValuesField;
import org.apache.lucene.index.IndexWriter;

import java.io.IOException;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class IndexIntFieldDemo {

    public static void main(String[] args) throws IOException {
        Document document = new Document();
        //要排序必须加同名的field，且类型为NumericDocValuesField
        document.add(new NumericDocValuesField("intValue", 30));

        Document document1 = new Document();
        document1.add(new NumericDocValuesField("intValue2", 40));

        IndexWriter writer = IndexerUtil.createIndexWriter();
        writer.addDocument(document);
        writer.addDocument(document1);
        writer.commit();
        writer.close();
    }

}
```

- IndexerUtil.java

工具类实现如下：

```java
package com.github.houbb.lucene.learn.utils;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;

import java.io.IOException;
import java.nio.file.Paths;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public final class IndexerUtil {

    private IndexerUtil(){}

    public static IndexWriter createIndexWriter() throws IOException {
        String path = "D:\\lucene\\dataindex";

        return createIndexWriter(path);
    }

    public static IndexWriter createIndexWriter(String indexDir) throws IOException {
        //得到索引所在目录的路径
        Directory directory = FSDirectory.open(Paths.get(indexDir));
        // 标准分词器
        Analyzer analyzer = new StandardAnalyzer();
        //保存用于创建IndexWriter的所有配置。
        IndexWriterConfig iwConfig = new IndexWriterConfig(analyzer);
        //实例化IndexWriter
        return new IndexWriter(directory, iwConfig);
    }

}
```

# 参考资料

[一步一步跟我学习lucene（2）---lucene的各种Field及其排序](https://blog.csdn.net/wuyinggui10000/article/details/45538155)

* any list
{:toc}