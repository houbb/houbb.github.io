---
layout: post
title:  ElasticSearch知识体系详解-09查询：DSL查询之Term详解
date:   2015-01-01 23:20:27 +0800
categories: [ElasticSearch知识体系详解]
tags: [ElasticSearch知识体系详解, other]
published: true
---



09 查询：DSL查询之Term详解
## Term查询引入

如前文所述，查询分基于文本查询和基于词项的查询:

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-full-text-3.png)

本文主要讲基于词项的查询。

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-term-1.png)

## Term查询

很多比较常用，也不难，就是需要结合实例理解。这里综合官方文档的内容，我设计一个测试场景的数据，以覆盖所有例子。@pdai

准备数据

PUT /test-dsl-term-level { "mappings": { "properties": { "name": { "type": "keyword" }, "programming_languages": { "type": "keyword" }, "required_matches": { "type": "long" } } } } POST /test-dsl-term-level/_bulk { "index": { "_id": 1 }} {"name": "Jane Smith", "programming_languages": [ "c++", "java" ], "required_matches": 2} { "index": { "_id": 2 }} {"name": "Jason Response", "programming_languages": [ "java", "php" ], "required_matches": 2} { "index": { "_id": 3 }} {"name": "Dave Pdai", "programming_languages": [ "java", "c++", "php" ], "required_matches": 3, "remarks": "hello world"}

### 字段是否存在:exist

由于多种原因，文档字段的索引值可能不存在：

* 源JSON中的字段是null或[]
* 该字段已”index” : false在映射中设置
* 字段值的长度超出ignore_above了映射中的设置
* 字段值格式错误，并且ignore_malformed已在映射中定义

所以exist表示查找是否存在字段。

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-term-2.png)

### id查询:ids

ids 即对id查找
GET /test-dsl-term-level/_search { "query": { "ids": { "values": [3, 1] } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-term-3.png)

### 前缀:prefix

通过前缀查找某个字段
GET /test-dsl-term-level/_search { "query": { "prefix": { "name": { "value": "Jan" } } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-term-4.png)

### 分词匹配:term

前文最常见的根据分词查询
GET /test-dsl-term-level/_search { "query": { "term": { "programming_languages": "php" } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-term-5.png)

### 多个分词匹配:terms

按照读个分词term匹配，它们是or的关系
GET /test-dsl-term-level/_search { "query": { "terms": { "programming_languages": ["php","c++"] } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-term-6.png)

### 按某个数字字段分词匹配:term set

设计这种方式查询的初衷是用文档中的数字字段动态匹配查询满足term的个数
GET /test-dsl-term-level/_search { "query": { "terms_set": { "programming_languages": { "terms": [ "java", "php" ], "minimum_should_match_field": "required_matches" } } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-term-7.png)

### 通配符:wildcard

通配符匹配，比如

/*
GET /test-dsl-term-level/_search { "query": { "wildcard": { "name": { "value": "D/*ai", "boost": 1.0, "rewrite": "constant_score" } } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-term-8.png)

### 范围:range

常常被用在数字或者日期范围的查询
GET /test-dsl-term-level/_search { "query": { "range": { "required_matches": { "gte": 3, "lte": 4 } } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-term-9.png)

### 正则:regexp

通过[正则表达式]查询

以”Jan”开头的name字段
GET /test-dsl-term-level/_search { "query": { "regexp": { "name": { "value": "Ja./*", "case_insensitive": true } } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-term-10.png)

### 模糊匹配:fuzzy

官方文档对模糊匹配：编辑距离是将一个术语转换为另一个术语所需的一个字符更改的次数。这些更改可以包括：

* 更改字符（box→ fox）
* 删除字符（black→ lack）
* 插入字符（sic→ sick）
* 转置两个相邻字符（act→ cat）
GET /test-dsl-term-level/_search { "query": { "fuzzy": { "remarks": { "value": "hell" } } } }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-dsl-term-11.png)

## 参考文章

[https://www.elastic.co/guide/en/elasticsearch/reference/current/term-level-queries.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/term-level-queries.html)




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/09%20%e6%9f%a5%e8%af%a2%ef%bc%9aDSL%e6%9f%a5%e8%af%a2%e4%b9%8bTerm%e8%af%a6%e8%a7%a3.md

* any list
{:toc}
