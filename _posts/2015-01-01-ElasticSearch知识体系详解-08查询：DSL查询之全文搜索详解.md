---
layout: post
title:  ElasticSearch知识体系详解-08查询：DSL查询之全文搜索详解
date:   2015-01-01 23:20:27 +0800
categories: [ElasticSearch知识体系详解]
tags: [ElasticSearch知识体系详解, other]
published: true
---



08 查询：DSL查询之全文搜索详解
## 写在前面:谈谈如何从官网学习

提示

很多读者在看官方文档学习时存在一个误区，以DSL中full text查询为例，其实内容是非常多的， 没有取舍/没重点去阅读， 要么需要花很多时间，要么头脑一片浆糊。所以这里重点谈谈我的理解。@pdai

一些理解：

* 第一点：**全局观**，即我们现在学习内容在整个体系的哪个位置？

如下图，可以很方便的帮助你构筑这种体系

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-3.png)

* 第二点： **分类别**，从上层理解，而不是本身

比如Full text Query中，我们只需要把如下的那么多点分为3大类，你的体系能力会大大提升

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-1.png)

* 第三点： **知识点还是API**？ API类型的是可以查询的，只需要知道大致有哪些功能就可以了。

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-2.png)

## Match类型

第一类：match 类型

### match 查询的步骤

在(指定字段查询)中我们已经介绍了match查询。

* **准备一些数据**

这里我们准备一些数据，通过实例看match 查询的步骤
PUT /test-dsl-match { "settings": { "number_of_shards": 1 }} POST /test-dsl-match/_bulk { "index": { "_id": 1 }} { "title": "The quick brown fox" } { "index": { "_id": 2 }} { "title": "The quick brown fox jumps over the lazy dog" } { "index": { "_id": 3 }} { "title": "The quick brown fox jumps over the quick dog" } { "index": { "_id": 4 }} { "title": "Brown fox brown dog" }

* **查询数据**
GET /test-dsl-match/_search { "query": { "match": { "title": "QUICK!" } } }

Elasticsearch 执行上面这个 match 查询的步骤是：

* **检查字段类型** 。

标题 title 字段是一个 string 类型（ analyzed ）已分析的全文字段，这意味着查询字符串本身也应该被分析。

* **分析查询字符串** 。

将查询的字符串 QUICK! 传入标准分析器中，输出的结果是单个项 quick 。因为只有一个单词项，所以 match 查询执行的是单个底层 term 查询。

* **查找匹配文档** 。

用 term 查询在倒排索引中查找 quick 然后获取一组包含该项的文档，本例的结果是文档：1、2 和 3 。

* **为每个文档评分** 。

用 term 查询计算每个文档相关度评分 _score ，这是种将词频（term frequency，即词 quick 在相关文档的 title 字段中出现的频率）和反向文档频率（inverse document frequency，即词 quick 在所有文档的 title 字段中出现的频率），以及字段的长度（即字段越短相关度越高）相结合的计算方式。

* **验证结果**

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-4.png)

### match多个词深入

我们在上文中复合查询中已经使用了match多个词，比如“Quick pets”； 这里我们通过例子带你更深入理解match多个词

* **match多个词的本质**

查询多个词”BROWN DOG!”
GET /test-dsl-match/_search { "query": { "match": { "title": "BROWN DOG" } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-5.png)

因为 match 查询必须查找两个词（ [“brown”,“dog”] ），它在内部实际上先执行两次 term 查询，然后将两次查询的结果合并作为最终结果输出。为了做到这点，它将两个 term 查询包入一个 bool 查询中，

所以上述查询的结果，和如下语句查询结果是等同的
GET /test-dsl-match/_search { "query": { "bool": { "should": [ { "term": { "title": "brown" } }, { "term": { "title": "dog" } } ] } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-6.png)

* **match多个词的逻辑**

上面等同于should（任意一个满足），是因为 match还有一个operator参数，默认是or, 所以对应的是should。

所以上述查询也等同于
GET /test-dsl-match/_search { "query": { "match": { "title": { "query": "BROWN DOG", "operator": "or" } } } }

那么我们如果是需要and操作呢，即同时满足呢？

GET /test-dsl-match/_search { "query": { "match": { "title": { "query": "BROWN DOG", "operator": "and" } } } }

等同于

GET /test-dsl-match/_search { "query": { "bool": { "must": [ { "term": { "title": "brown" } }, { "term": { "title": "dog" } } ] } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-7.png)

### 控制match的匹配精度

如果用户给定 3 个查询词，想查找只包含其中 2 个的文档，该如何处理？将 operator 操作符参数设置成 and 或者 or 都是不合适的。

match 查询支持 minimum_should_match 最小匹配参数，这让我们可以指定必须匹配的词项数用来表示一个文档是否相关。我们可以将其设置为某个具体数字，更常用的做法是将其设置为一个百分数，因为我们无法控制用户搜索时输入的单词数量：
GET /test-dsl-match/_search { "query": { "match": { "title": { "query": "quick brown dog", "minimum_should_match": "75%" } } } }

当给定百分比的时候， minimum_should_match 会做合适的事情：在之前三词项的示例中， 75% 会自动被截断成 66.6% ，即三个里面两个词。无论这个值设置成什么，至少包含一个词项的文档才会被认为是匹配的。

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-8.png)

当然也等同于
GET /test-dsl-match/_search { "query": { "bool": { "should": [ { "match": { "title": "quick" }}, { "match": { "title": "brown" }}, { "match": { "title": "dog" }} ], "minimum_should_match": 2 } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-9.png)

### 其它match类型

* **match_pharse**

match_phrase在前文中我们已经有了解，我们再看下另外一个例子。
GET /test-dsl-match/_search { "query": { "match_phrase": { "title": { "query": "quick brown" } } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-11.png)

很多人对它仍然有误解的，比如如下例子：
GET /test-dsl-match/_search { "query": { "match_phrase": { "title": { "query": "quick brown f" } } } }

这样的查询是查不出任何数据的，因为前文中我们知道了match本质上是对term组合，match_phrase本质是连续的term的查询，所以f并不是一个分词，不满足term查询，所以最终查不出任何内容了。

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-12.png)

* **match_pharse_prefix**

那有没有可以查询出

quick brown f
的方式呢？ELasticSearch在match_phrase基础上提供了一种可以查最后一个词项是前缀的方法，这样就可以查询

quick brown f
了
GET /test-dsl-match/_search { "query": { "match_phrase_prefix": { "title": { "query": "quick brown f" } } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-13.png)

(ps: prefix的意思不是整个text的开始匹配，而是最后一个词项满足term的prefix查询而已)

* **match_bool_prefix**

除了match_phrase_prefix，ElasticSearch还提供了match_bool_prefix查询
GET /test-dsl-match/_search { "query": { "match_bool_prefix": { "title": { "query": "quick brown f" } } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-14.png)

它们两种方式有啥区别呢？match_bool_prefix本质上可以转换为：
GET /test-dsl-match/_search { "query": { "bool" : { "should": [ { "term": { "title": "quick" }}, { "term": { "title": "brown" }}, { "prefix": { "title": "f"}} ] } } }

所以这样你就能理解，match_bool_prefix查询中的quick,brown,f是无序的。

* **multi_match**

如果我们期望一次对多个字段查询，怎么办呢？ElasticSearch提供了multi_match查询的方式
{ "query": { "multi_match" : { "query": "Will Smith", "fields": [ "title", "/*_name" ] } } }

/*
表示前缀匹配字段。

## query string类型

第二类：query string 类型

### query_string

此查询使用语法根据运算符（例如AND或）来解析和拆分提供的查询字符串NOT。然后查询在返回匹配的文档之前独立分析每个拆分的文本。

可以使用该query_string查询创建一个复杂的搜索，其中包括通配符，跨多个字段的搜索等等。尽管用途广泛，但查询是严格的，如果查询字符串包含任何无效语法，则返回错误。

例如：
GET /test-dsl-match/_search { "query": { "query_string": { "query": "(lazy dog) OR (brown dog)", "default_field": "title" } } }

这里查询结果，你需要理解本质上查询这四个分词（term）or的结果而已，所以doc 3和4也在其中

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-15.png)

对构筑知识体系已经够了，但是它其实还有很多参数和用法，更多请参考[官网](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html)

### query_string_simple

该查询使用一种简单的语法来解析提供的查询字符串并将其拆分为基于特殊运算符的术语。然后查询在返回匹配的文档之前独立分析每个术语。

尽管其语法比query_string查询更受限制 ，但**simple_query_string 查询不会针对无效语法返回错误。而是，它将忽略查询字符串的任何无效部分**。

举例：
GET /test-dsl-match/_search { "query": { "simple_query_string" : { "query": "\"over the\" + (lazy | quick) + dog", "fields": ["title"], "default_operator": "and" } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-16.png)

更多请参考[官网](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html)

## Interval类型

第三类：interval类型

Intervals是时间间隔的意思，本质上将多个规则按照顺序匹配。

比如：
GET /test-dsl-match/_search { "query": { "intervals" : { "title" : { "all_of" : { "ordered" : true, "intervals" : [ { "match" : { "query" : "quick", "max_gaps" : 0, "ordered" : true } }, { "any_of" : { "intervals" : [ { "match" : { "query" : "jump over" } }, { "match" : { "query" : "quick dog" } } ] } } ] } } } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-17.png)

因为interval之间是可以组合的，所以它可以表现的很复杂。更多请参考[官网](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-intervals-query.html)

## 参考文章

[https://www.elastic.co/guide/en/elasticsearch/reference/current/full-text-queries.html/#full-text-queries](https://www.elastic.co/guide/en/elasticsearch/reference/current/full-text-queries.html#full-text-queries)

[https://www.elastic.co/guide/cn/elasticsearch/guide/current/match-multi-word.html](https://www.elastic.co/guide/cn/elasticsearch/guide/current/match-multi-word.html)




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/08%20%e6%9f%a5%e8%af%a2%ef%bc%9aDSL%e6%9f%a5%e8%af%a2%e4%b9%8b%e5%85%a8%e6%96%87%e6%90%9c%e7%b4%a2%e8%af%a6%e8%a7%a3.md

* any list
{:toc}
