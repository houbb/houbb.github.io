---
layout: post
title: Lucene in action-06-TermQuery RangeQuery BooleanQuery QueryParser
date: 2022-01-10 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# 3.4在程序代码中创建 Query 对象

正如你在3.2节所看到的，Lucene 的查询操作最终要调用 IndexSearcher 中的 search方法， 在该方法中需要一个 Query 实例作为其参数。

Query 的子类能够通过其构造函数直接实例化；或者正如我们在3.1.2节所讨论的那样，它也能够通过 QueryParser 的 parser函数进行构造。

如果你的应用程序仅仅依靠 QueryParser 来构造 Query 对象，那么理解和掌握 Lucene API 的功能将显得非常重要，因为 QueryParser 函数会使用到这些API。

即使你正使用 QueryParser， 将查询表达式与一个由构造函数 API创建的 Query 对象相结合的方法，在用于放大、提炼或约束最终用户输入的查询时还是十分普遍的。打个比方，你可能希望将自由查询的解析表达式限制到索引的一个子集中，例如可以将搜索的文档限制在某一种类别的范围之内。根据搜索应用程序的用户界面，你可以通过日期采集器选择一个搜索的日期范围，也可以通过下拉菜单选择一个搜索的类别，或者还可以选择不受限制的搜索方式。

这些功能都能够通过对 QueryParser、BooleanQuery、RangeQuery 以及 TermQuery 类的整合来实现。

我们将在5.5.4节通过建立一个与之类似的组合查询对此内容加以论证和说明。

本节主要讲述了 Lucene 内置的各种 Query 类型。同时也介绍了与每种 Query 类型相应的 QueryParser 表达式的语法。

ps，下面是 V7.2.1 常见的查询类：

```
TermQuery
BooleanQuery
WildcardQuery
PhraseQuery
PrefixQuery
MultiPhraseQuery
FuzzyQuery
RegexpQuery
TermRangeQuery
PointRangeQuery
ConstantScoreQuery
DisjunctionMaxQuery
MatchAllDocsQuery
```

## 3.4.1 通过项进行搜索: TermQuery

对索引中的某个项进行搜索是最基本的搜索方式。

**项是最小的索引片断，每个项里包含了一个域名和一个文本值。**

程序清单3.1示范了对指定项进行搜索的例子。

下面这段代码构造了一个 Term 类的实例：

TermQuery 的构造函数接受一个单独的 Term 对象作为其参数：

```java
//TermQuery
Term term = new Term("content", "java");
Query termQuery = new TermQuery(term);
```

使用这个 TermQuery 对象进行搜索，可以返回 content 域中包含了 java 一词的所有文档。

值得注意的是，该查询项的值是区分大小写的，因此搜索时一定要对索引后的项的字母大小写进行匹配；

由于不同的分析器(详见第5章)对文本所采用的索引方式都不同，所以对原文的搜索除了存在大小写匹配的问题外，可能还有其他的问题。

TermQuery 类在根据关键字查询文档时显得特别有用。

如果文档已经通过函数Field.Keyword()对某个关键字进行过索引，那么该关键字就可以用于搜索相应的文档。

例如，通过本书所提供的测试数据，下面的代码将通过匹配 id 号来检索一个文档：

```java
Term term = new Term("id", "123456789");
Query termQuery = new TermQuery(term);
TopDocs hits = indexSearcher.search(termQuery, 1);
```

## 3.4.2 在指定范围内搜索： TermRangeQuery

索引中的各个项会以字典编录的顺序排列好，这是因为开发人员在开发 Lucene时就考虑到了在一定范围内对特定项进行搜索的效率问题。 

Lucene 中的 TermRangeQuery 类就为我们在指定起始项(starting term) 和终止项(ending term)的范围内进行搜索提供了便利。

起始项与终止项这两个边界上的项，既可以包括在搜索范围之内，也可以不包括在内。

以下代码示范了如何在包含起始和终止项的范围内进行搜索： 

```java
Term starTerm = new Term("id", "1");
Term endTerm = new Term("id", "3");
Query termQuery = new TermRangeQuery("id", starTerm.bytes(), endTerm.bytes(), true, true);
TopDocs hits = indexSearcher.search(termQuery, 1);
```

ps: V7.2.1 有两种范围查询：TermRangeQuery 和 PointRangeQuery。

## 3.4.3通过字符串进行搜索： PrefixQuery

应用程序可以通过使用 PrefixQuery 来搜索包含以指定字符串开头的项的文档。

看起来这是很容易的。

下面的代码向你示范了如何通过简单的 PrefixQuery 对象对一个层次结构进行递归查询的这些被匹配的文档中包含了代表层次结构的类别关键字域：

```java
//TermQuery
Term term = new Term("content", "java");
Query prefixQuery = new PrefixQuery(term);
```

## 3.4.4 组合查询： BooleanQuery

通过使用 BooleanQuery可以将本章讨论的各种查询类型组合成复杂的查询方式。

BooleanQuery 本身是一个布尔子句的容器。

这个子句可以是表示逻辑“或”、逻辑“与”或者逻辑“非”的一个子查询。

这些属性允许进行逻辑的 AND、OR或 NOT组合。你可以用下面的 BooleanQuery 的 add 方法将一个查询子句添加到某个 BooleanQuery 对象中：

考虑到更复杂的查询情况，一个BooleanQuery 对象还可以作为另外一个 BooleanQuery 对象中的其中一个条件子句。

我们通过下面的程序来看看一些例子。

```java
public void booleanQueryTest() throws IOException {
    final String indexDir = "index/chap03";
    //1. 构建 writer
    // 得到读取索引文件的路径
    Directory dir = FSDirectory.open(Paths.get(indexDir));
    // 通过dir得到的路径下的所有的文件
    IndexReader reader = DirectoryReader.open(dir);
    // 建立索引查询器
    IndexSearcher indexSearcher = new IndexSearcher(reader);

    String searchField = "content";
    String q1 = "java";
    String q2 = "lucene";
    Query query1 = new TermQuery(new Term(searchField, q1));
    Query query2 = new TermQuery(new Term(searchField, q2));

    BooleanQuery.Builder builder = new BooleanQuery.Builder();
    // 1．MUST和MUST：取得连个查询子句的交集。
    // 2．MUST和MUST_NOT：表示查询结果中不能包含MUST_NOT所对应得查询子句的检索结果。
    // 3．SHOULD与MUST_NOT：连用时，功能同MUST和MUST_NOT。
    // 4．SHOULD与MUST连用时，结果为MUST子句的检索结果,但是SHOULD可影响排序。
    // 5．SHOULD与SHOULD：表示“或”关系，最终检索结果为所有检索子句的并集。
    // 6．MUST_NOT和MUST_NOT：无意义，检索无结果。
    builder.add(query1, BooleanClause.Occur.MUST);
    builder.add(query2, BooleanClause.Occur.MUST);
    BooleanQuery booleanQuery = builder.build();
    TopDocs hits = indexSearcher.search(booleanQuery, 10);
    System.out.println("匹配 " + q1 + "And" + q2 + "，总共查询到" + hits.totalHits + "个文档");
}
```

V7.2.1 实现如上，不取属书中的例子。

## 3.4.5 通过短语搜索： PhraseQuery

索引中包含了各个项的位置信息。PhraseQuery 利用这些信息去搜索文档，在这些文档集中，我们所查找的各个项之间可能都相隔着一定的距离。

例如，假设某个域中包含了"the quick brown fox jumped overthe lazydog”这个短语，即使我们不知道这个短语的确切完整写法，也一样可以通过查找域中 quick 和 fox 距离相近的文档来找出我们需要的文档。

当然，一个简单的 TermQuery 也能够通过对这两个项的单独查询成功地找到同样文档；但是在以上所讨论的情况中，我们仅仅希望查到域中 quick 的位置紧挨着 fox 或者隔一个不相关的单词的文档(如 `quick [不相关的词] fox`)。

在匹配的情况下，**两个项的位置之间允许的最大间隔距离称为 slop。距离是指项要按顺序组成给定的短语，所需要移动位置的次数。**

我们用刚刚提到的那个短语，看看 slop 因子是怎么样工作的。

```java
Directory dir = new RAMDirectory();
Analyzer analyzer = new StandardAnalyzer();
IndexWriterConfig iwc = new IndexWriterConfig(analyzer);
iwc.setOpenMode(IndexWriterConfig.OpenMode.CREATE);
IndexWriter writer = new IndexWriter(dir, iwc);

// 写入
Document doc = new Document();
doc.add(new TextField("text", "quick brown fox", Field.Store.YES));
writer.addDocument(doc);
doc = new Document();
doc.add(new TextField("text", "jumps over lazy broun dog", Field.Store.YES));
writer.addDocument(doc);
doc = new Document();
doc.add(new TextField("text", "jumps over extremely very lazy broxn dog", Field.Store.YES));
writer.addDocument(doc);
writer.commit();
writer.close();

// 读取
IndexReader reader = DirectoryReader.open(dir);
IndexSearcher searcher = new IndexSearcher(reader);
PhraseQuery phraseQuery = new PhraseQuery(15, "text", "dog", "jumps");
TopDocs results = searcher.search(phraseQuery, 10);
ScoreDoc[] scoreDocs = results.scoreDocs;
for (int i = 0; i < scoreDocs.length; ++i) {
    //System.out.println(searcher.explain(query, scoreDocs[i].doc));
    int docID = scoreDocs[i].doc;
    Document document = searcher.doc(docID);
    String path = document.get("text");
    System.out.println("text:" + path);
}
```

日志输出：

```
text:jumps over lazy broun dog
text:jumps over extremely very lazy broxn dog
```

第一个文本中因为不包含 `dog`，所以不满足检索的条件。

这时候我们的查询短语就是 dog xxx jumps,意思就是我们要查询包含dog和jumps字符的文档而且dog和jumps之间要有一个字符间隔(不包含停用词)，这时候我们的slop就要加1了，即我们需要再多移动一次。

## 3.4.6 使用通配符搜索：WildcardQuery

通配符查询可以让我们使用不完整的、缺少某些字母的项进行查询，但是仍可以查找到相关的匹配。 

Lucene 中使用两个标准的通配符号：

`*`代表0个或多个字母，

`?` 代表0个或1个字母。

程序3.2是 WildcardQuery 实际使用的一个范例。

```java
public void wildcardQueryTest() throws IOException {
    Directory dir = new RAMDirectory();
    Analyzer analyzer = new StandardAnalyzer();
    IndexWriterConfig iwc = new IndexWriterConfig(analyzer);
    iwc.setOpenMode(IndexWriterConfig.OpenMode.CREATE);
    IndexWriter writer = new IndexWriter(dir, iwc);

    // 写入
    List<String> textList = Arrays.asList("child", "wild", "mild", "mildew");
    for(String text: textList) {
        Document doc = new Document();
        doc.add(new StringField("content", text, Field.Store.YES));
        writer.addDocument(doc);
    }
    writer.commit();
    writer.close();

    // 读取
    IndexReader reader = DirectoryReader.open(dir);
    IndexSearcher searcher = new IndexSearcher(reader);
    Term term = new Term("content", "?ild*");
    Query query = new WildcardQuery(term);

    // 结果及展现
    TopDocs results = searcher.search(query, 10);
    ScoreDoc[] scoreDocs = results.scoreDocs;
    for (int i = 0; i < scoreDocs.length; ++i) {
        int docid = scoreDocs[i].doc;
        Document document = searcher.doc(docid);
        String content = document.get("content");
        System.out.println("content: " + content);
    }
}
```

输出结果：

```
content: wild
content: mild
content: mildew
```

## 3.4.7 搜索类似项： FuzzyQuery

最后要介绍的一种更为有趣的内置查询类型。 

Lucene 的模糊查询 FuzzyQuery 类用于匹配与指定项相似的项。

Levenshtein 距离算法用来决定索引文件中的项与指定目标项的相似程度”。这种算法又称为**编辑距离算法**，它是两个字符串之间相似度的一个度量方法，编辑距离就是用来计算从一个字符串转换到另一个字符串所需的最少插入、删除和替换的字符个数。

例如，“three”与“tree”两个字符串的编辑距离为1，因为只需要删除一个字符，两个字符串就一样了。

```java
public void fuzzyQueryTest() throws IOException {
    Directory dir = new RAMDirectory();
    Analyzer analyzer = new StandardAnalyzer();
    IndexWriterConfig iwc = new IndexWriterConfig(analyzer);
    iwc.setOpenMode(IndexWriterConfig.OpenMode.CREATE);
    IndexWriter writer = new IndexWriter(dir, iwc);

    // 写入
    List<String> textList = Arrays.asList("three", "tree", "tried", "try");
    for(String text: textList) {
        Document doc = new Document();
        doc.add(new StringField("content", text, Field.Store.YES));
        writer.addDocument(doc);
    }
    writer.commit();
    writer.close();

    // 读取
    IndexReader reader = DirectoryReader.open(dir);
    IndexSearcher searcher = new IndexSearcher(reader);
    Term term = new Term("content", "tree");
    Query query = new FuzzyQuery(term, 1);

    // 结果及展现
    TopDocs results = searcher.search(query, 10);
    ScoreDoc[] scoreDocs = results.scoreDocs;
    for (int i = 0; i < scoreDocs.length; ++i) {
        int docid = scoreDocs[i].doc;
        Document document = searcher.doc(docid);
        String content = document.get("content");
        System.out.println("content: " + content);
    }
}
```

日志输出如下：

```
content: tree
content: three
```

# 参考资料

《Lucene in Action II》

[Lucene query 使用总结](https://blog.csdn.net/huaishu/article/details/8553024)

[lucene多条件查询”搜索—BooleanQuery](https://www.cnblogs.com/silentmuh/p/7795236.html)

* any list
{:toc}