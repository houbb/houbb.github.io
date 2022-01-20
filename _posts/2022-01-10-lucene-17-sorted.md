---
layout: post
title: Lucene-17-sorted 排序
date: 2022-01-10 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# 自定义排序说明

我们在做lucene搜索的时候，可能会需要排序功能，虽然lucene内置了多种类型的排序，但是如果在需要先进行某些值的运算然后在排序的时候就有点显得无能为力了；

要做自定义查询，我们就要研究lucene已经实现的排序功能，lucene的所有排序都是要继承FieldComparator,然后重写内部实现，这里以IntComparator为例子来查看其实现；

# IntComparator 相关实现

其类的声明为 `public static class IntComparator extends NumericComparator<Integer>`,这里说明IntComparator接收的是Integer类型的参数，即只处理IntField的排序；

## 完整的代码

IntComparator 声明的参数为：

```java
  /** Parses field's values as int (using {@link
   *  org.apache.lucene.index.LeafReader#getNumericDocValues(String)} and sorts by ascending value */
  public static class IntComparator extends NumericComparator<Integer> {
    private final int[] values;
    private int bottom;                           // Value of bottom of queue
    private int topValue;

    /** 
     * Creates a new comparator based on {@link Integer#compare} for {@code numHits}.
     * When a document has no value for the field, {@code missingValue} is substituted. 
     */
    public IntComparator(int numHits, String field, Integer missingValue) {
      super(field, missingValue != null ? missingValue : 0);
      //System.out.println("IntComparator.init");
      //new Throwable().printStackTrace(System.out);
      values = new int[numHits];
    }

    private int getValueForDoc(int doc) throws IOException {
      if (currentReaderValues.advanceExact(doc)) {
        return (int) currentReaderValues.longValue();
      } else {
        return missingValue;
      }
    }
        
    @Override
    public int compare(int slot1, int slot2) {
      return Integer.compare(values[slot1], values[slot2]);
    }

    @Override
    public int compareBottom(int doc) throws IOException {
      return Integer.compare(bottom, getValueForDoc(doc));
    }

    @Override
    public void copy(int slot, int doc) throws IOException {
      values[slot] = getValueForDoc(doc);
    }
    
    @Override
    public void setBottom(final int bottom) {
      this.bottom = values[bottom];
    }

    @Override
    public void setTopValue(Integer value) {
      topValue = value;
    }

    @Override
    public Integer value(int slot) {
      return Integer.valueOf(values[slot]);
    }

    @Override
    public int compareTop(int doc) throws IOException {
      return Integer.compare(topValue, getValueForDoc(doc));
    }
  }
```

## 简单分析

### 属性

私有属性如下：

```java
private final int[] values;
private int bottom; 
private int topValue;
```

### 构造器

```java
/** 
 * Creates a new comparator based on {@link Integer#compare} for {@code numHits}.
 * When a document has no value for the field, {@code missingValue} is substituted. 
 */
public IntComparator(int numHits, String field, Integer missingValue) {
  super(field, missingValue != null ? missingValue : 0);
  //System.out.println("IntComparator.init");
  //new Throwable().printStackTrace(System.out);
  values = new int[numHits];
}
```

获取响应的值：

```java
private int getValueForDoc(int doc) throws IOException {
  if (currentReaderValues.advanceExact(doc)) {
    return (int) currentReaderValues.longValue();
  } else {
    return missingValue;
  }
}
```

### copy 方法

```java
@Override
public void copy(int slot, int doc) throws IOException {
  values[slot] = getValueForDoc(doc);
}

private int getValueForDoc(int doc) throws IOException {
  if (currentReaderValues.advanceExact(doc)) {
    return (int) currentReaderValues.longValue();
  } else {
    return missingValue;
  }
}
```

### compare 方法

这些实现都是类似的，我们的应用实现自定义排序的时候需要做的是对binaryDocValues或NumericDocValues的值进行计算，然后实现FieldComparator内部方法，对应IntComparator就是如上的值copy操作；

然后我们需要实现compareTop、compareBottom和compare，IntComparator的实现为：

```java
@Override
public int compare(int slot1, int slot2) {
  return Integer.compare(values[slot1], values[slot2]);
}

@Override
public int compareBottom(int doc) {
  int v2 = (int) currentReaderValues.get(doc);
  // Test for v2 == 0 to save Bits.get method call for
  // the common case (doc has value and value is non-zero):
  if (docsWithField != null && v2 == 0 && !docsWithField.get(doc)) {
    v2 = missingValue;
  }

  return Integer.compare(bottom, v2);
}

@Override
public int compareTop(int doc) throws IOException {
  return Integer.compare(topValue, getValueForDoc(doc));
}
```

# 自定义

## 自定义 MyFieldComparator

要实现FieldComparator，需要对接收参数进行处理，定义处理值的集合，同时定义BinaryDocValues和接收的参数等，这里我写了一个通用的比较器，代码如下：

```java
import org.apache.lucene.index.BinaryDocValues;
import org.apache.lucene.index.DocValues;
import org.apache.lucene.index.LeafReaderContext;
import org.apache.lucene.search.SimpleFieldComparator;
import org.apache.lucene.util.BytesRef;

import java.io.IOException;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class MyFieldComparator extends SimpleFieldComparator<String> {

    //定义的Object[]，同IntComparator
    private Object[] values;
    private Object bottom;
    private Object top;
    private String field;
    //接收的BinaryDocValues,同IntComparator中的NumericDocValues
    private BinaryDocValues binaryDocValues;
    //接收的参数
    private Object[] params;

    public MyFieldComparator(String field, int numHits, Object[] params) {
        this.values = new Object[numHits];
        this.field = field;
        this.params = params;
    }

    @Override
    protected void doSetNextReader(LeafReaderContext context) throws IOException {
        //context.reader().getBinaryDocValues(field);
        binaryDocValues = DocValues.getBinary(context.reader(), field);
    }

    @Override
    public int compare(int slot1, int slot2) {
        String valueOne = value(slot1);
        String valueTwo = value(slot2);
        return valueOne.compareTo(valueTwo);
    }

    @Override
    public void setTopValue(String value) {
        this.top = value;
    }

    @Override
    public String value(int slot) {
        return values[slot].toString();
    }

    @Override
    public void setBottom(int slot) throws IOException {
        this.bottom = values[slot];
    }

    @Override
    public int compareBottom(int doc) throws IOException {
        Object distance = getValues(doc);
        return (bottom.toString()).compareTo(distance.toString());
    }

    /**
     * 获取指定的值
     * @param doc
     * @return
     */
    private Object getValues(int doc) {
        try {
            if (binaryDocValues.advanceExact(doc)) {
                BytesRef bytesRef = binaryDocValues.binaryValue();
                return bytesRef.utf8ToString();
            } else {
                return null;
            }
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }


    @Override
    public int compareTop(int doc) throws IOException {
        String distance = getValues(doc).toString();
        return top.toString().compareTo(distance);
    }

    @Override
    public void copy(int slot, int doc) throws IOException {
        values[slot] = getValues(doc);
    }

}
```

## 自定义 MyComparatorSource

我们不仅要提供比较器和comparator，同时还要提供接收用户输入的FiledComparatorSource

```java
import org.apache.lucene.search.FieldComparator;
import org.apache.lucene.search.FieldComparatorSource;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class MyComparatorSource extends FieldComparatorSource {

    //接收的参数
    private Object[] params;

    public Object[] getParams() {
        return params;
    }

    public void setParams(Object[] params) {
        this.params = params;
    }

    public MyComparatorSource(Object[] params) {
        super();

        this.params = params;
    }

    @Override
    public FieldComparator<?> newComparator(String fieldname, int numHits, int sortPos, boolean reversed) {
        return new MyFieldComparator(fieldname, numHits, params);
    }

}
```

## 测试代码

相关测试程序，这里我们模拟一个 StringComparator，对 String 值进行排序

```java
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.BinaryDocValuesField;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StringField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.search.*;
import org.apache.lucene.store.RAMDirectory;
import org.apache.lucene.util.BytesRef;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class MySortTest {

    public static void main(String[] args) throws Exception {
        RAMDirectory directory = new RAMDirectory();
        Analyzer analyzer = new StandardAnalyzer();
        IndexWriterConfig indexWriterConfig = new IndexWriterConfig(analyzer);
        indexWriterConfig.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
        IndexWriter indexWriter = new IndexWriter(directory, indexWriterConfig);
        addDocument(indexWriter, "B");
        addDocument(indexWriter, "D");
        addDocument(indexWriter, "A");
        addDocument(indexWriter, "E");
        indexWriter.commit();
        indexWriter.close();
        IndexReader reader = DirectoryReader.open(directory);
        IndexSearcher searcher = new IndexSearcher(reader);
        Query query = new MatchAllDocsQuery();

        // 定义排序字段
        SortField sortField = new SortField("name", new MyComparatorSource(new Object[]{}));
        Sort sort = new Sort(sortField);

        TopDocs topDocs = searcher.search(query, Integer.MAX_VALUE, sort);
        ScoreDoc[] docs = topDocs.scoreDocs;
        for (ScoreDoc doc : docs) {
            Document document = searcher.doc(doc.doc);
            System.out.println(document.get("name"));
        }
    }

    private static void addDocument(IndexWriter writer, String name) throws Exception {
        Document document = new Document();
        document.add(new StringField("name", name, Field.Store.YES));
        document.add(new BinaryDocValuesField("name", new BytesRef(name.getBytes())));
        writer.addDocument(document);
    }

}
```

输出结果：

```
A
B
D
E
```

# 参考资料

[一步一步跟我学习lucene（13）---lucene搜索之自定义排序的实现原理和编写自己的自定义排序工具](https://blog.csdn.net/wuyinggui10000/article/details/45956081)

* any list
{:toc}