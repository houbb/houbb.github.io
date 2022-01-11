---
layout: post
title: Lucene-20-expressions 表达式
date: 2022-01-10 21:01:55 +0800
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# expressions

有时候我们在做lucene的结果展示的时候可能需要对多个列的内容进行计算，根据多个field对应的值做数值方面的运算。

lucene自4.6版本起，提供了用于运算的expression模块；

expression分为两部分：

org.apache.lucene.expressions：提供了字段绑定和相关的表达式参数传递的功能；

org.apache.lucene.expressions.js: 提供了表达式定义的功能。

# Expression类使用示例

Expression是提供document的运算的支持类；

## 例子

我们的运算表达式和其绑定内容通常类似于如下：

```java
// compile an expression:
Expression expr = JavascriptCompiler.compile("sqrt(_score) + ln(popularity)");

// SimpleBindings just maps variables to SortField instances
SimpleBindings bindings = new SimpleBindings();    
bindings.add(new SortField("_score", SortField.Type.SCORE));
bindings.add(new SortField("popularity", SortField.Type.INT));

// create a sort field and sort by it (reverse order)
Sort sort = new Sort(expr.getSortField(bindings, true));
Query query = new TermQuery(new Term("body", "contents"));
searcher.search(query, null, 10, sort);
```

如上所示，我们对document中的_score和popularity两个字段进行值的运算，这里是对_score开平方之后和popularity的对数运算求和，运算方式的定义在第一行；

下边有定义了SimpleBindings，binding主要是对运算的数据进行数据绑定；

最终的查询结果是根据以上的运算结果采取倒排序的方式

## 表达式说明

表达式的构造可以采用如下的几种来进行组合：

- 数值型的

- `+ - * / %` 等运算符

- 移位运算符：| & ^ ~ << >> >>>

- 布尔运算符（包括三目运算符）：     `&& || ! ?:`

- 比较运算符：`< <= == >= >`

- 数学运算函数：abs ceil exp floor ln log10 logn max min sqrt pow

- 三角运算函数：acosh acos asinh asin atanh atan atan2 cosh cos sinh sin tanh tan

- haversin 公式

- min,max 函数



# 入门例子

## maven 引入

```xml
<dependency>
    <groupId>org.apache.lucene</groupId>
    <artifactId>lucene-expressions</artifactId>
    <version>7.2.1</version>
</dependency>
```

## 测试例子

我写了一个测试程序，模拟长方形的运算并排序；

### 写入

```java
public void index(){
    try {
        Directory directory = FSDirectory.open(Paths.get("index"));
        Analyzer analyzer = new StandardAnalyzer();
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
        IndexWriter writer = new IndexWriter(directory, config);
        Document doc = new Document();
        //模拟长方形
        addIntField(doc, "width", 3);
        addIntField(doc, "longth", 4);
        doc.add(new NumericDocValuesField("width", 3));
        doc.add(new NumericDocValuesField("longth", 4));
        writer.addDocument(doc);
        Document doc1 = new Document();
        addIntField(doc1, "width", 2);
        addIntField(doc1, "longth", 5);
        doc1.add(new NumericDocValuesField("width", 2));
        doc1.add(new NumericDocValuesField("longth", 5));
        writer.addDocument(doc1);
        Document doc2 = new Document();
        addIntField(doc2, "width", 2);
        addIntField(doc2, "longth", 6);
        doc2.add(new NumericDocValuesField("width", 2));
        doc2.add(new NumericDocValuesField("longth", 6));
        writer.addDocument(doc2);
        writer.commit();
        writer.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}

private void addIntField(Document document,
                         String fieldName,
                         int value) {
    // int 默认不存储
    document.add(new IntPoint(fieldName, value));
    ////如果想要在搜索结果中获取ID的值，需要加上下面语句
    document.add(new StoredField(fieldName, value));
}
```

### 面积排序

面积倒序排序；

当面积相同时，按宽度倒序，长度倒序；

```java
public void testAcreage() throws IOException {
    try {
        Expression expr = JavascriptCompiler.compile("width*longth");
        SimpleBindings bindings = new SimpleBindings();
        bindings.add(new SortField("width", SortField.Type.INT));
        bindings.add(new SortField("longth", SortField.Type.INT));
        Sort sort = new Sort(expr.getSortField(bindings, true));
        Query query = new MatchAllDocsQuery();
        Directory directory = FSDirectory.open(Paths.get("index"));
        IndexReader reader = DirectoryReader.open(directory);
        IndexSearcher searcher = new IndexSearcher(reader);
        TopDocs docs = searcher.search(query, 10, sort);
        for (ScoreDoc scoreDoc : docs.scoreDocs) {
            System.out.println(searcher.doc(scoreDoc.doc));
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

日志输出：

```
Document<stored<width:3> stored<longth:4>>
Document<stored<width:2> stored<longth:6>>
Document<stored<width:2> stored<longth:5>>
```

### 周长排序

周长倒序排序；

周长相同时，按宽度倒序，长度倒序；

```java
public void testCircum(){
    try {
        Expression expr = JavascriptCompiler.compile("width+longth+sqrt(pow(width,2)+pow(longth,2))");

        SimpleBindings bindings = new SimpleBindings();
        bindings.add(new SortField("width", SortField.Type.INT));
        bindings.add(new SortField("longth", SortField.Type.INT));

        Sort sort = new Sort(expr.getSortField(bindings, true));
        Query query = new MatchAllDocsQuery();
        Directory directory = FSDirectory.open(Paths.get("index"));
        IndexReader reader = DirectoryReader.open(directory);
        IndexSearcher searcher = new IndexSearcher(reader);
        TopDocs docs = searcher.search(query, 10, sort);

        for (ScoreDoc scoreDoc : docs.scoreDocs) {
            System.out.println(searcher.doc(scoreDoc.doc));
        }
    } catch (ParseException | IOException e) {
        e.printStackTrace();
    }
}
```

日志如下：

```
Document<stored<width:2> stored<longth:6>>
Document<stored<width:2> stored<longth:5>>
Document<stored<width:3> stored<longth:4>>
```

# 参考资料

[一步一步跟我学习lucene（17）---lucene搜索之expressions表达式处理](https://blog.csdn.net/wuyinggui10000/article/details/46315989)

* any list
{:toc}