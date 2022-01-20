---
layout: post
title: Lucene in action-03-indexing 索引
date: 2022-01-10 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# 索引

## 2.1.1 转换成文本

在用Lucene索引数据之前，首先必须将数据转换成Lucene能够处理的格式——纯文本字符流。

在第1章中， 我们将索引和搜索的对象规定为.txt文件， 这样我们就能简便地用这些文件的内容来填充域的实例。

然而，事情并非都如此简单。假定你需要索引一套PDF格式的手册。

首先， 需要从PDF文档中提取文本信息， 然后用这些提取出来的数据来创建Lucene的Document对象及其对应的Field对象。

回顾表1.2， 你会发现Field的方法通常是接受Strng值， 在有些情况下， 也接受Date和Reader类型的参数。

即使PDF的Java类型存在， 也没有一个方法能处理此类型的对象。

在你索引Microsoft Word文档或者任何非纯文本文档的时候， 也会遇到同样的问题.甚至在处理XML或者HTML文档这类纯文本字符文档的时候，仍然需要灵活地预处理待索引的数据，以避免索引类似XML标记或者HTML标签之类无意义的文本。

关于从各种格式的文档中提取文本的具体内容将在第7章中介绍，在该章中我们会建立一个很小却完整的框架，在这个框架中能够索引图2.1中描述的所有文档格式以及其他一些图中没有提及的文档类型。事实上，你将会注意到图2.1和图7.1非常相似。

ps: lucene 本身可以做的比较纯粹。因为任何一种资源=》纯文本，这个逻辑可以放在业务之外处理。

## 2.1.2 分析

一旦你完成了针对待索引数据的预处理操作， 并创建了带有若干个域的Document对象， 就可以调用Index Writer的add Document(Document) 方法， 将数据传递给Lucene来进行索引操作。

在对数据进行索引处理时， Lucene会首先分析(analyze) 数据使之更加适合被索引。

分析数据时，先将文本数据切分成一些大块或者语汇单元(tokens) ，然后对它们执行一些可选的操作；

例如，在索引之前将这些语汇单元转换为小写，使得搜索对大小写不敏感；最有代表性的是要从输入中去掉一些使用很频繁但却没有实际意义的词，比如英文文本中的一些停止词(a、an、the、in、on等) 。

同样地，我们也需要分析输入的语汇单元，以便从词语中去掉一些不必要的字母以找到它们的词干。

以上所讲述的是一个非常重要的处理过程， 我们称之为分析(analyze) 。

Lucene对用户输入文本分析处理的方式多种多样，且非常有趣并实用。

因此，我们会特意在第4章中对这一过程进行详细讲解。现在，可以先将这一步骤看成是对文本的一种过滤。

ps: 简而言之，分析主要分为 3 个步骤

1) 分词

2） 移除停顿词

3） 词干处理

## 2.1.3 将分析过后的数据写入索引

对输入数据分析处理完之后， 就可以将结果写入到索引文件中。

Lucene将输入数据以一种称为倒排索引(inverted index) 的数据结构进行存储。

在进行关键字快速查找时，这种数据结构能够有效地利用磁盘空间。

Lucene会使用倒排结构存储数据的原因是：**把从文档中抽取出的语汇单元看作是查找关键字，而不是把文档作为中心实体**。

换句话说，倒排索引并不是回答“这个文档中包含哪些单词?”这个问题，而是经过优化以后用来快速回答“哪些文档包含词X?”这个问题。

想一下最喜欢的web搜索引擎站点和你心目中典型的查询方式， 就能够体会到你正在使用的搜索是速度最快的一种查询方式。

现在所有的web搜索引擎的核心都是使用倒排索引技术。

这些web搜索引擎的不同之处在于它们各自通过增加一些额外的、用于改善倒排索引结构的技术，且这些技术作为商业机密而被严格保护了起来。

比如说，Google中著名的PageRank技术。

Lucene也有一套专有的技术， 你可以参阅附录B以了解关于这方面的内容。


#  编制索引的过程

编制索引 是将文本数据转换为有利于快速搜索的格式。这类似于书本后面的索引：为您指出主题在书中出现的位置。

Lucene 将输入数据存储在名为逆序索引的数据结构中, 该数据结构以索引文件集的形式存储在文件系统或内存中。

大部分 Web 搜索引擎都使用逆序索引。它允许用户执行快速关键字查询，查找匹配给定查询的文档。在将文本数据添加到索引前，由分析程序（使用分析过程）进行处理。

## 分析（Analyzer）

分析 是将文本数据转换为搜索基本单位（称为项（term））的过程。

在分析过程中，文本数据将经历多项操作：提取单词、移除通用单词、忽略标点符号、将单词变为词根形式、将单词变成小写等等。

分析过程发生在编制索引和查询解析之前。

分析将文本数据转换为标记，这些标记将作为项添加到 Lucene 索引中。

Lucene 有多种内置分析程序，比如 SimpleAnalyzer、StandardAnalyzer、StopAnalyzer、SnowballAnalyzer 等。

它们在标记文本和应用过滤器的方式上有所区别。因为分析在编制索引之前移除单词，它减少了索引的大小，但是不利用精确的查询过程。

您可以使用 Lucene 提供的基本构建块创建定制分析程序，以自己的方式控制分析过程。

- 表 1 展示了一些内置分析程序及其处理数据的方式。


| 分析程序	| 对文本数据的操作 |
|:---|:---|
| WhitespaceAnalyzer |	分解空白处的标记 |
| SimpleAnalyzer |	分解非字母字符的文本，并将文本转为小写形式 |
| StopAnalyzer |	移除虚字（stop word）—— 对检索无用的字，并将文本转为小写形式 |
| StandardAnalyzer	| 根据一种复杂语法（识别电子邮件地址、缩写、中文、日文、韩文字符、字母数字等等）标记文本/将文本转为小写形式/移除虚字 |

##  核心索引编制类

### Directory

表示索引文件存储位置的抽象类。

有两个常用的子类：

FSDirectory — 在实际文件系统中存储索引的 Directory 实现。该类对于大型索引非常有用。

RAMDirectory — 在内存中存储所有索引的实现。该类适用于较小的索引，可以完整加载到内存中，在应用程序终止之后销毁。由于索引保存在内存中，所以速度相对较快。

### Analyzer

正如上文所述，分析程序负责处理文本数据并将其转换为标记存储在索引中。

在编制索引前，IndexWriter 接收用于标记数据的分析程序。要为文本编制索引，您应该使用适用于该文本语言的分析程序。

默认分析程序适用于英语。在 Lucene 沙盒中还有其他分析程序，包括用于中文、日文和韩文的分析程序。

### IndexDeletionPolicy

该接口用来实现从索引目录中定制删除过时提交的策略。

默认删除策略是 KeepOnlyLastCommitDeletionPolicy，该策略仅保留最近的提交，并在完成一些提交之后立即移除所有之前的提交。

### IndexWriter

创建或维护索引的类。它的构造函数接收布尔值，确定是否创建新索引，或者打开现有索引。它提供在索引中添加、删除和更新文档的方法。

对索引所做的更改最初缓存在内存中，并周期性转储到索引目录。IndexWriter 公开了几个控制如何在内存中缓存索引并写入磁盘的字段。

对索引的更改对于 IndexReader 不可见，除非调用 IndexWriter 的提交或关闭方法。

IndexWriter 创建一个目录锁定文件，以通过同步索引更新保护索引不受破坏。

IndexWriter 允许用户指定可选索引删除策略。


# 2.2 基本索引操作

在第1章中，你已经了解了如何向索引中添加文档的有关知识。

在这里，我们将总结这一处理过程。

本章还将讲述如何对索引文件进行删除和更新的操作，为你提供各种索引操作的参考依据。

## 创建 IndexWriter 

实现如下：

```java
String indexDirectory = "";
Directory fsDirectory = FSDirectory.open(Paths.get(indexDirectory));
Analyzer standardAnalyzer = new StandardAnalyzer();
// 删除策略
IndexDeletionPolicy deletionPolicy = new KeepOnlyLastCommitDeletionPolicy();
IndexWriterConfig iwConfig = new IndexWriterConfig(standardAnalyzer);
iwConfig.setIndexDeletionPolicy(deletionPolicy);
IndexWriter indexWriter = new IndexWriter(fsDirectory, iwConfig);
```


## 2.2.1 向索引添加文档

将文本数据添加到索引涉及到两个类。

Field 表示搜索中查询或检索的数据片。Field 类封装一个字段名称及其值。

Lucene 提供了一些选项来指定字段是否需要编制索引或分析，以及值是否需要存储。这些选项可以在创建字段实例时传递。

下表展示了 Field 元数据选项的详细信息。

- 表 2. Field 元数据选项的详细信息

| 选项	                    | 描述 |
|:---|:---|
| Field.Store.Yes	            | 用于存储字段值。适用于显示搜索结果的字段 — 例如，文件路径和 URL。 |
| Field.Store.No      	    | 没有存储字段值 — 例如，电子邮件消息正文。 |
| Field.Index.No	            | 适用于未搜索的字段 — 仅用于存储字段，比如文件路径。 |
| Field.Index.ANALYZED	    | 用于字段索引和分析 — 例如，电子邮件消息正文和标题。 |
| Field.Index.NOT_ANALYZED	| 用于编制索引但不分析的字段。它在整体中保留字段的原值 — 例如，日期和个人名称。 |


Document 是一个字段集合。

Lucene 也支持推进文档和字段，这在给某些索引数据赋予重要性时非常有用。

给文本文件编制索引包括将文本数据封装在字段中、创建文档、填充字段，使用 IndexWriter 向索引添加文档。

- 列表 2 展示向索引添加数据的示例。

```java
IndexWriter indexWriter = createIndexWriter();

Field contentField = new TextField("sender","张三", Field.Store.YES);
Field idField = new StringField("id","123456", Field.Store.YES);
Document document = new Document();
document.add(contentField);
document.add(idField);
indexWriter.addDocument(document);

indexWriter.commit();
indexWriter.close();
```

其中 index 创建实现如下：

```java
private IndexWriter createIndexWriter() throws IOException {
    String indexDirectory = "index/chap02";
    Directory fsDirectory = FSDirectory.open(Paths.get(indexDirectory));
    Analyzer standardAnalyzer = new StandardAnalyzer();

    // 删除策略
    IndexDeletionPolicy deletionPolicy = new KeepOnlyLastCommitDeletionPolicy();
    IndexWriterConfig iwConfig = new IndexWriterConfig(standardAnalyzer);
    iwConfig.setIndexDeletionPolicy(deletionPolicy);

    IndexWriter indexWriter = new IndexWriter(fsDirectory, iwConfig);
    return indexWriter;
}
```

## 搜索数据

搜索是在索引中查找单词并查找包含这些单词的文档的过程。
 
使用 Lucene 的搜索 API 构建的搜索功能非常简单明了。

### 核心类

本小节讨论 Lucene 搜索 API 的主要类。

Searcher

Searcher 是一个抽象基类，包含各种超负荷搜索方法。IndexSearcher 是一个常用的子类，允许在给定的目录中存储搜索索引。Search 方法返回一个根据计算分数排序的文档集合。Lucene 为每个匹配给定查询的文档计算分数。IndexSearcher 是线程安全的；一个实例可以供多个线程并发使用。

Term

Term 是搜索的基本单位。它由两部分组成：单词文本和出现该文本的字段的名称。Term 对象也涉及索引编制，但是可以在 Lucene 内部创建。

Query 和子类

Query 是一个用于查询的抽象基类。搜索指定单词或词组涉及到在项中包装它们，将项添加到查询对象，将查询对象传递到 IndexSearcher 的搜索方法。

Lucene 包含各种类型的具体查询实现，比如 TermQuery、BooleanQuery、PhraseQuery、PrefixQuery、RangeQuery、MultiTermQuery、FilteredQuery、SpanQuery 等。

以下部分讨论 Lucene 查询 API 的主查询类。

TermQuery

搜索索引最基本的查询类型。可以使用单个项构建 TermQuery。项值应该区分大小写，但也并非全是如此。注意，传递的搜索项应该与文档分析得到的项一致，因为分析程序在构建索引之前对原文本执行许多操作。

例如，考虑电子邮件标题 “Job openings for Java Professionals at Bangalore”。假设您使用 StandardAnalyzer 编制索引。现在如果我们使用 TermQuery 搜索 “Java”，它不会返回任何内容，因为本文本应该已经规范化，并通过 StandardAnalyzer 转成小写。如果搜索小写单词 “java”，它将返回所有标题字段中包含该单词的邮件。

### 例子

```java
@Test
public void queryTest() throws IOException {
    IndexSearcher indexSearcher = createIndexSearch();
    Term term = new Term("id","张三");
    Query termQuery = new TermQuery(term);

    TopDocs topDocs = indexSearcher.search(termQuery,10);
    // 展示
    for(ScoreDoc scoreDoc : topDocs.scoreDocs) {
        Document doc = indexSearcher.doc(scoreDoc.doc);
        System.out.println(doc);
    }
}
```

其中 indexSearcher 的实现如下：

```java
private IndexSearcher createIndexSearch() throws IOException {
    String indexDirectory = "index/chap02";
    // 得到读取索引文件的路径
    Directory dir = FSDirectory.open(Paths.get(indexDirectory));
    // 通过dir得到的路径下的所有的文件
    IndexReader reader = DirectoryReader.open(dir);
    IndexSearcher is = new IndexSearcher(reader);
    return is;
}
```

### RangeQuery

您可以使用 RangeQuery 在某个范围内搜索。索引中的所有项都以字典顺序排列。

Lucene 的 RangeQuery 允许用户在某个范围内搜索项。

该范围可以使用起始项和最终项（包含两端或不包含两端均可）指定。

- 列表 4. 在某个范围内搜索 

```java
/* RangeQuery example:Search mails from 01/06/2009 to 6/06/2009 
both inclusive */
Term begin = new Term("date","20090601");
Term end = new Term("date","20090606");
Query query = new RangeQuery(begin, end, true);
```

### PrefixQuery

您可以使用 PrefixQuery 通过前缀单词进行搜索，该方法用于构建一个查询，该查询查找包含以指定单词前缀开始的词汇的文档。

- 列表 5. 使用 PrefixQuery 搜索

```java
//Search mails having sender field prefixed by the word 'job'
PrefixQuery prefixQuery = new PrefixQuery(new Term("sender","job"));
PrefixQuery query = new PrefixQuery(new Term("sender","job"));
```

### BooleanQuery

您可以使用 BooleanQuery 组合任何数量的查询对象，构建强大的查询。

它使用 query 和一个关联查询的子句，指示查询是应该发生、必须发生还是不得发生。

在 BooleanQuery 中，子句的最大数量默认限制为 1,024。

您可以调用 setMaxClauseCount 方法设置最大子句数。

- 列表 6. 使用 BooleanQuery 进行搜索

```java
// Search mails have both 'java' and 'bangalore' in the subject field
Query query1 = new TermQuery(new Term("subject","java"));
Query query2 = new TermQuery(new Term("subject","bangalore"));
BooleanQuery query = new BooleanQuery();
query.add(query1,BooleanClause.Occur.MUST);
query.add(query2,BooleanClause.Occur.MUST);
```

### PhraseQuery

您可以使用 PhraseQuery 进行短语搜索。

PhraseQuery 匹配包含特定单词序列的文档。

PhraseQuery 使用索引中存储的项的位置信息。

考虑匹配的项之间的距离称为 slop。

默认情况下，slop 的值为零，这可以通过调用 setSlop 方法进行设置。PhraseQuery 还支持多个项短语。

- 列表 7. 使用 PhraseQuery 进行搜索

```java
/* PhraseQuery example: Search mails that have phrase 'job opening j2ee'
   in the subject field.*/
PhraseQuery query = new PhraseQuery();
query.setSlop(1);
query.add(new Term("subject","job"));
query.add(new Term("subject","opening"));
query.add(new Term("subject","j2ee"));
```

### WildcardQuery

WildcardQuery 实现通配符搜索查询，这允许您搜索 `arch*`（可以查找包含 architect、architecture 等）之类的单词。

使用两个标准通配符：

- `*` 表示零个以上

- `?` 表示一个以上

如果使用以通配符查询开始的模式进行搜索，则可能会引起性能的降低，因为这需要查询索引中的所有项以查找匹配文档。

- 列表 8. 使用 WildcardQuery 进行搜索

```java
//Search for 'arch*' to find e-mail messages that have word 'architect' in the subject field./
Query query = new WildcardQuery(new Term("subject","arch*"));
```

### FuzzyQuery

您可以使用 FuzzyQuery 搜索类似项，该类匹配类似于指定单词的单词。类似度测量基于 Levenshtein（编辑距离）算法进行。

在列表 9 中，FuzzyQuery 用于查找与拼错的单词 “admnistrtor” 最接近的项，尽管这个错误单词没有索引。

- 列表 9. 使用 FuzzyQuery 进行搜索

```java
/* Search for emails that have word similar to 'admnistrtor' in the
subject field. Note we have misspelled admnistrtor here.*/
Query query = new FuzzyQuery(new Term("subject", "admnistrtor"));
```

### QueryParser

QueryParser 对于解析人工输入的查询字符非常有用。

您可以使用它将用户输入的查询表达式解析为 Lucene 查询对象，这些对象可以传递到 IndexSearcher 的搜索方法。它可以解析丰富的查询表达式。 

QueryParser 内部将人们输入的查询字符串转换为一个具体的查询子类。

您需要使用反斜杠（`\`）将 `*`、`?` 等特殊字符进行转义。

您可以使用运算符 AND、OR 和 NOT 构建文本布尔值查询。 

- 列表 10. 搜索人工输入的查询表达式

```java
QueryParser queryParser = new QueryParser("subject",new StandardAnalyzer());
// Search for emails that contain the words 'job openings' and '.net' and 'pune'
Query query = queryParser.parse("job openings AND .net AND pune");
```

## 显示搜索结果

IndexSearcher 返回一组对分级搜索结果（如匹配给定查询的文档）的引用。

您可以使用 IndexSearcher 的搜索方法确定需要检索的最优先搜索结果数量。

可以在此基础上构建定制分页。您可以添加定制 Web 应用程序或桌面应用程序来显示搜索结果。检索搜索结果涉及的主要类包括 ScoreDoc 和 TopDocs。

### ScoreDoc

搜索结果中包含一个指向文档的简单指针。这可以封装文档索引中文档的位置以及 Lucene 计算的分数。 

封装搜索结果以及 ScoreDoc 的总数。

以下代码片段展示了如何检索搜索结果中包含的文档。

```java
@Test
public void queryTest() throws IOException {
    IndexSearcher indexSearcher = createIndexSearch();
    Term term = new Term("id","张三");
    Query termQuery = new TermQuery(term);
    TopDocs topDocs = indexSearcher.search(termQuery,10);
    // 展示
    for(ScoreDoc scoreDoc : topDocs.scoreDocs) {
        Document doc = indexSearcher.doc(scoreDoc.doc);
        System.out.println(doc);
    }
}
```

# 基本的索引操作

基本的索引操作包括移除和提升文档。

## 从索引中移除文档

应用程序常常需要使用最新的数据更新索引并移除较旧的数据。

例如，在 Web 搜索引擎中，索引需要定期更新，因为总是需要添加新网页，移除不存在的网页。

Lucene 提供了 IndexReader 接口允许您对索引执行这些操作。

IndexReader 是一个提供各种方法访问索引的抽象类。

Lucene 内部引用文档时使用文档编号，该编号可以在向索引添加或从中移除文档时更改。

文档编号用于访问索引中的文档。IndexReader 不得用于更新目录中的索引，因为已经打开了 IndexWriter。

IndexReader 在打开时总是搜索索引的快照。对索引的任何更改都可以看到，直到再次打开 IndexReader。

使用 Lucene 重新打开它们的 IndexReader 可以看到最新的索引更新。

- 列表 12. 从索引中删除文档 

```java
// Delete all the mails from the index received in May 2009.
IndexReader indexReader = IndexReader.open(indexDirectory);
indexReader.deleteDocuments(new Term("month","05"));
//close associate index files and save deletions to disk
indexReader.close();
```

## 提升文档和字段

有时您需要给某些索引数据更高的重要级别。您可以通过设置文档或字段的提升因子实现这一点。

默认情况下，所有文档和字段的默认提升因子都是 1.0。

- 列表 13. 提升字段 

```java
if(subject.toLowerCase().indexOf("pune") != -1){
// Display search results that contain pune in their subject first by setting boost factor
	subjectField.setBoost(2.2F);
}
//Display search results that contain 'job' in their sender email address
if(sender.toLowerCase().indexOf("job")!=-1){	
	luceneDocument.setBoost(2.1F);
}
```

# 扩展搜索

## 排序

Lucene 提供一个称为排序的高级功能。

您可以根据指示文档在索引中相对位置的字段对搜索结果进行排序。

用于排序的字段必须编制索引但不得标记。搜索字段中可以放入 4 种可能的项值：整数值、long 值、浮点值和字符串。

还可以通过索引顺序排序搜索结果。Lucene 通过降低相关度（比如默认的计算分数）对结果排序。排序的顺序是可以更改的。

- 列表 14. 排序搜索结果 

```java
/* Search mails having the word 'job' in subject and return results
   sorted by sender's email in descending order.
 */
SortField sortField = new SortField("sender", true);	
Sort sortBySender = new Sort(sortField);
WildcardQuery query = new WildcardQuery(new Term("subject","job*"));
TopFieldDocs topFieldDocs = indexSearcher.search(query,null,20,sortBySender);
//Sorting by index order
topFieldDocs = indexSearcher.search(query,null,20,Sort.INDEXORDER);
```

## Filtering 过滤

Filtering 是限制搜索空间，只允许某个文档子集作为搜索范围的过程。

您可以使用该功能实现对搜索结果进行再次搜索，或者在搜索结果上实现安全性。

Lucene 带有各种内置的过滤器，比如 BooleanFilter、CachingWrapperFilter、ChainedFilter、DuplicateFilter、PrefixFilter、QueryWrapperFilter、RangeFilter、RemoteCachingWrapperFilter、SpanFilter 等。

Filter 可以传递到 IndexSearcher 的搜索方法，以过滤匹配筛选标准的筛选文档。

- 列表 15. 筛选搜索结果 

```java
/*Filter the results to show only mails that have sender field 
prefixed with 'jobs' */
Term prefix = new Term("sender","jobs");
Filter prefixFilter = new PrefixFilter(prefix);
WildcardQuery query = new WildcardQuery(new Term("subject","job*"));
indexSearcher.search(query,prefixFilter,20);
```

# 参考资料

《Lucene in Action II》

[Lucene query 使用总结](https://blog.csdn.net/huaishu/article/details/8553024)

* any list
{:toc}