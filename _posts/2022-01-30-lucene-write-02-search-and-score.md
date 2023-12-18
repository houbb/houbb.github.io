---
layout: post
title: lucene 从零手写实现-02-Search and Scoring in Lucene Introduction to how Lucene scores documents.
date: 2022-01-29 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, code, source-code, sh]
published: true
---

## 搜索基础

Lucene提供多种查询实现，大多数位于此包或queries模块中。

这些实现可以以多种方式组合，提供复杂的查询功能，同时提供有关匹配发生在文档集合中的位置的信息。

下面的"查询类"部分突出显示了一些更重要的查询类。

有关实现自己的查询类的详细信息，请参阅下面的"自定义查询 - 专家级别"。

要执行搜索，应用程序通常调用IndexSearcher.search(Query,int)。

创建并提交给IndexSearcher后，评分过程开始。在一些基础设置之后，控制最终传递给Weight实现及其Scorer或BulkScorer实例。有关该过程的更多注释，请参阅"算法"部分。

### 查询类

#### TermQuery
TermQuery是Query的各种实现中最容易理解且在应用程序中最常用的。

TermQuery匹配包含指定Term（在某个字段中出现的单词）的所有文档。因此，TermQuery标识并评分所有具有包含指定字符串的字段的文档。构建TermQuery就像这样：

```java
TermQuery tq = new TermQuery(new Term("fieldName", "term"));
```

在这个例子中，查询标识所有具有字段名为"fieldName"且包含单词"term"的文档。

#### BooleanQuery

当将多个TermQuery实例组合成BooleanQuery时，事情开始变得有趣。

BooleanQuery包含多个BooleanClauses，每个子句都包含一个子查询（Query实例）和描述该子查询与其他子句组合方式的运算符（来自BooleanClause.Occur）：

- SHOULD — 当子句可以出现在结果集中但不是必需时使用此运算符。如果查询由所有SHOULD子句组成，那么结果集中的每个文档都至少与这些子句中的一个匹配。
- MUST — 当子句必须出现在结果集中并应对评分有贡献时使用此运算符。结果集中的每个文档都将匹配所有这些子句。
- FILTER — 当子句必须出现在结果集中但不应对评分有贡献时使用此运算符。结果集中的每个文档都将匹配所有这些子句。
- MUST NOT — 当子句不得出现在结果集中时使用此运算符。结果集中的任何文档都不会匹配任何此类子句。

布尔查询通过添加两个或多个BooleanClause实例来构造。如果添加了太多的子句，将在搜索过程中抛出TooManyClauses异常。

这通常发生在将查询重写为带有许多TermQuery子句的BooleanQuery时，例如通过WildcardQuery。最大子句数的默认设置为1024，但可以通过IndexSearcher.setMaxClauseCount(int)静态方法更改。

#### Phrases
另一个常见的搜索是查找包含特定短语的文档。有不同的处理方式：

- **PhraseQuery:** 匹配一系列Terms。PhraseQuery使用slop因子来确定短语中任意两个术语之间可能发生的位置数，仍然被视为匹配。默认情况下，slop为0，这意味着短语必须完全匹配。
- **MultiPhraseQuery:** PhraseQuery的更通用形式，接受短语中的多个Terms。例如，这可以用于执行还包括同义词的短语查询。
- **Interval queries in the Queries module**

#### PointRangeQuery

PointRangeQuery匹配在数值范围内出现的所有文档。要使PointRangeQuery起作用，必须使用一个数字字段（IntPoint、LongPoint、FloatPoint或DoublePoint）对值进行索引。

#### PrefixQuery, WildcardQuery, RegexpQuery
虽然PrefixQuery有不同的实现方式，但它本质上是WildcardQuery的特例。PrefixQuery允许应用程序识别所有以某个字符串开头的术语的文档。WildcardQuery通过允许使用 *（匹配0个或多个字符）和 ?（匹配一个字符）通配符来进行泛化。请注意，WildcardQuery可能会相当慢。还请注意，WildcardQuery不应以 * 和 ? 开头，因为这样做非常慢。一些QueryParsers可能默认不允许这样做，但提供setAllowLeadingWildcard方法以移除该保护。RegexpQuery甚至比WildcardQuery更通用，允许应用程序识别所有

与正则表达式模式匹配的术语的文档。

#### FuzzyQuery

FuzzyQuery匹配包含与指定术语相似的术语的文档。相似性使用Levenshtein距离确定。在处理集合中的拼写变体时，这种类型的查询可能很有用。

## Scoring（评分）— 简介

Lucene评分是我们都喜欢Lucene的核心。它速度极快，几乎隐藏了所有的复杂性。

简而言之，它起作用。至少，在它不起作用，或者不像人们期望的那样工作时，我们就会深入研究Lucene内部，或在java-user@lucene.apache.org上寻求帮助，以弄清为什么一个包含五个查询词的文档的得分低于仅包含一个查询词的不同文档。

虽然这份文档不能回答你具体的评分问题，但它将希望指导你找出Lucene评分的“什么”和“为什么”。

Lucene评分支持许多可插拔的信息检索模型，包括：

- 向量空间模型（VSM）
- Okapi BM25和DFR等概率模型
- 语言模型

这些模型可以通过Similarity API插入，并提供用于调整的扩展钩子和参数。通常，Lucene首先根据Query规范中的布尔逻辑找到需要进行评分的文档，然后通过检索模型对匹配文档的这个子集进行排序。有关VSM和IR的一些有价值的参考资料，请参阅Lucene Wiki IR引用。

本文档的其余部分将涵盖评分基础知识并解释如何更改Similarity。接下来，它将介绍您可以在Custom Queries -- Expert Level中定制lucene内部的方法，该部分提供有关实现自己的Query类和相关功能的详细信息。最后，我们将通过附录提供一些参考资料。

### 评分 — 基础知识

评分非常依赖于文档的索引方式，因此了解索引是很重要的（请在继续阅读本节之前查看Lucene概述）。

确保使用有用的IndexSearcher.explain(Query, doc)来了解如何计算某个匹配文档的得分。

一般来说，Query确定哪些文档匹配（一个二进制决策），而Similarity确定如何为匹配文档分配分数。

### 字段和文档

在Lucene中，我们评分的对象是文档（Document）。文档是字段（Field）的集合。每个字段都有关于如何创建和存储它的语义（标记化，存储等）。

重要的是要注意，Lucene评分是在字段上进行的，然后将结果组合起来返回文档。

这很重要，因为两个内容完全相同的文档，但一个文档的内容分散在两个字段中，而另一个文档的内容分散在一个字段中，由于长度归一化，可能对相同的查询返回不同的分数。

### 分数加权

Lucene允许通过使用BoostQuery来影响查询各部分的得分贡献。

### 修改评分 — 相似度

#### 修改评分公式

改变Similarity是影响评分的一种简便方法，这在索引时通过IndexWriterConfig.setSimilarity(Similarity)和查询时通过IndexSearcher.setSimilarity(Similarity)来完成。

确保在查询时使用与索引时相同的Similarity（以便正确编码/解码规范化因子）；Lucene不会努力验证这一点。

您可以通过配置不同的内置Similarity实现，或通过调整其参数，通过对其进行子类化以覆盖行为来影响评分。

一些实现还提供了一个模块化的API，您可以通过插入不同的组件（例如，词频规范化器）来扩展它。

最后，您可以直接扩展低级Similarity来实现新的检索模型。

请参阅org.apache.lucene.search.similarities包文档，了解可用的内置评分模型以及扩展或更改Similarity的信息。

#### 将字段值整合到评分中

虽然Similarity有助于相对于查询对文档进行评分，但文档通常还包含衡量匹配质量的特征。

通过在索引时将FeatureField与文档一起索引，然后使用线性组合将相似性分数和特征分数结合起来，可以最好地将这些特征整合到评分中。

例如，下面的查询与originalQuery匹配相同的文档，并计算得分为similarityScore + 0.7 * featureScore：

```java
Query originalQuery = new BooleanQuery.Builder()
    .add(new TermQuery(new Term("body", "apache")), Occur.SHOULD)
    .add(new TermQuery(new Term("body", "lucene")), Occur.SHOULD)
    .build();
Query featureQuery = FeatureField.newSaturationQuery("features", "pagerank");
Query query = new BooleanQuery.Builder()
    .add(originalQuery, Occur.MUST)
    .add(new BoostQuery(featureQuery, 0.7f), Occur.SHOULD)
    .build();
```

一种效率较低但更灵活的修改评分的方法是将评分特征索引到doc-value字段中，然后使用queries模块中的FunctionScoreQuery将其与相似性得分结合起来。

例如，下面的示例演示了如何使用expressions模块计算得分为similarityScore * Math.log(popularity)，假设在索引时已经为popularity字段设置了NumericDocValuesField中的值：

```java
// 编译表达式：
Expression expr = JavascriptCompiler.compile("_score * ln(popularity)");

// SimpleBindings只是将变量映射到DoubleValuesSource实例
SimpleBindings bindings = new SimpleBindings();
bindings.add("_score", DoubleValuesSource.SCORES);
bindings.add("popularity", DoubleValuesSource.fromIntField("popularity"));

// 创建一个查询，基于'originalQuery'进行匹配，但使用expr进行评分
Query query = new FunctionScoreQuery(
    originalQuery,
    expr.getDoubleValuesSource(bindings));
```


### 自定义查询 — 专家级别

自定义查询是一项专家级任务，因此请谨慎操作，并准备在需要帮助时分享您的代码。

在发出警告之后，我们可以在Lucene中更改的不仅仅是Similarity。Lucene的搜索是一个复杂的机制，主要由三个主要类支持：

- **Query** — 用户信息需求的抽象对象表示。
- **Weight** — 针对给定索引的Query的专业化。通常，这将Query对象与稍后用于计算文档分数的索引统计信息相关联。
- **Scorer** — 评分过程的核心类：对于给定的段，scorers返回匹配的迭代器并提供计算这些匹配的得分的方法。
- **BulkScorer** — 评分一系列文档的抽象类。默认实现只是通过Scorer的命中进行迭代，但一些查询（如BooleanQuery）有更高效的实现。

下面是每个类及其子类的详细信息。

#### Query 类

从某种意义上说，Query类是一切的开始。没有Query，就没有什么可以评分的。此外，Query类是其他评分类的催化剂，因为它通常负责创建它们或在它们之间协调功能。Query类有几个对于派生类很重要的方法：

- **createWeight(IndexSearcher searcher, ScoreMode scoreMode, float boost)** — Weight是Query的内部表示，因此每个Query实现都必须提供Weight的实现。有关实现Weight接口的详细信息，请参见下面的Weight接口子节。
- **rewrite(IndexSearcher searcher)** — 将查询重写为基本查询。基本查询是：TermQuery、BooleanQuery和其他实现createWeight(IndexSearcher searcher,ScoreMode scoreMode, float boost)的查询。

#### Weight 接口

Weight接口提供了Query的内部表示，以便可以重用它。任何依赖于IndexSearcher的状态都应存储在Weight实现中，而不是在Query类中。该接口定义了四个主要方法：

- **scorer()** — 为此Weight构造一个新的Scorer。有关定义Scorer的帮助，请参见下面的Scorer类。正如名称所示，Scorer负责对文档进行实际评分，给定查询。
- **explain(LeafReaderContext context, int doc)** — 为给定文档的得分方式提供一种解释的方法。通常，通过Similarity进行得分的TermWeight等权重将使用Similarity的实现：SimScorer#explain(Explanation freq, long norm)。
- **matches(LeafReaderContext context, int doc)** — 提供有关匹配的位置和偏移的信息。通常对于实现高亮显示很有用。

#### Scorer 类

Scorer抽象类为所有Scorer实现提供了通用的评分功能，是Lucene评分过程的核心。Scorer定义了必须实现的以下方法：

- **iterator()** — 返回一个DocIdSetIterator，可以迭代匹配此Query的所有文档。
- **docID()** — 返回包含匹配项的文档的ID。
- **score()** — 返回当前文档的分数。这个值可以根据应用程序的适当方式确定。例如，TermScorer只是将其推迟到配置的Similarity：SimScorer.score(float freq, long norm)。
- **getChildren()** — 返回此scorer下面的任何子scorer。这允许用户导航scorer层次结构并接收有关评分过程的更细节的详细信息。

#### BulkScorer 类

BulkScorer对一系列文档进行评分。只有一个抽象方法：

- **score(LeafCollector,Bits,int,int)** — 为指定的最大文档之前的所有文档评分。

#### 为什么要添加自己的 Query？

简而言之，当您认为Lucene的Query对于您要执行的任务不合适时，您会想要添加自己的自定义Query实现。

您可能正在进行一些前沿研究，或者您需要从Lucene中获取更多信息（类似于Doug添加SpanQuery功能）。


### 附录: 搜索算法

这一部分主要是关于通过评分过程的步骤，同时也为前面的部分提供了一些辅助说明。

在典型的搜索应用中，将一个 Query 传递给 IndexSearcher，开始评分过程。

一旦进入 IndexSearcher，就会使用 Collector 对搜索结果进行评分和排序。涉及到搜索的这些重要对象有：

- Query 的 Weight 对象。Weight 对象是 Query 的内部表示，它允许 IndexSearcher 重复使用 Query。
- 调用了该方法的 IndexSearcher。
- 一个 Sort 对象，用于指定如果不希望使用基于分数的标准排序方法，则如何对结果进行排序。

假设我们不进行排序（因为排序不影响原始的 Lucene 分数），我们调用 IndexSearcher 的其中一个搜索方法，将由 IndexSearcher.createWeight(Query,ScoreMode,float) 创建的 Weight 对象和我们想要的结果数量传递进去。

这个方法返回一个 TopDocs 对象，它是搜索结果的内部集合。IndexSearcher 创建了一个 TopScoreDocCollector，并将其与 Weight 一起传递给另一个专家搜索方法（有关 Collector 机制的更多信息，请参见 IndexSearcher）。

TopScoreDocCollector 使用 PriorityQueue 来收集搜索的顶部结果。

最后，我们实际上要对一些文档进行评分。score 方法接收 Collector（很可能是 TopScoreDocCollector 或 TopFieldCollector）并进行其操作。

当然，事情会变得复杂。由 Weight 对象返回的 Scorer 取决于提交的 Query 类型。

在具有多个查询项的大多数实际应用程序中，Scorer 将是由 BooleanWeight 创建的 BooleanScorer2（有关更改此内容的自定义查询的信息，请参见自定义查询部分）。

假设是一个 BooleanScorer2，我们获取基于查询的必需、可选和禁止部分的内部 Scorer。

使用此内部 Scorer，BooleanScorer2 进入基于 DocIdSetIterator.nextDoc() 方法的 while 循环。nextDoc() 方法将移到下一个匹配查询的文档。

这是 Scorer 类中的一个抽象方法，因此所有派生实现都会重写它。如果您有一个简单的 OR 查询，您的内部 Scorer 很可能是 DisjunctionSumScorer，它基本上组合了 OR 项的子 Scorer 的得分。

# 参考资料

https://lucene.apache.org/core/9_9_1/core/org/apache/lucene/search/package-summary.html#package.description

* any list
{:toc}