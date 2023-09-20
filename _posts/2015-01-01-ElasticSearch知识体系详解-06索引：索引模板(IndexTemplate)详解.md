---
layout: post
title:  ElasticSearch知识体系详解-06索引：索引模板(IndexTemplate)详解
date:   2015-01-01 23:20:27 +0800
categories: [ElasticSearch知识体系详解]
tags: [ElasticSearch知识体系详解, other]
published: true
---



06 索引：索引模板(Index Template)详解
## 索引模板

索引模板是一种告诉Elasticsearch在创建索引时如何配置索引的方法。

* **使用方式**

在创建索引之前可以先配置模板，这样在创建索引（手动创建索引或通过对文档建立索引）时，模板设置将用作创建索引的基础。

### 模板类型

模板有两种类型：**索引模板**和**组件模板**。

* **组件模板**是可重用的构建块，用于配置映射，设置和别名；它们不会直接应用于一组索引。
* **索引模板**可以包含组件模板的集合，也可以直接指定设置，映射和别名。

### 索引模板中的优先级

* 可组合模板优先于旧模板。如果没有可组合模板匹配给定索引，则旧版模板可能仍匹配并被应用。
* 如果使用显式设置创建索引并且该索引也与索引模板匹配，则创建索引请求中的设置将优先于索引模板及其组件模板中指定的设置。
* 如果新数据流或索引与多个索引模板匹配，则使用优先级最高的索引模板。

### 内置索引模板

Elasticsearch具有内置索引模板，每个索引模板的优先级为100，适用于以下索引模式：

* logs-/*-/*
* metrics-/*-/*
* synthetics-/*-/*

所以在涉及内建索引模板时，要避免索引模式冲突。更多可以参考[这里](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-templates.html)

### 案例

* 首先**创建两个索引组件模板**：
PUT _component_template/component_template1 { "template": { "mappings": { "properties": { "@timestamp": { "type": "date" } } } } } PUT _component_template/runtime_component_template { "template": { "mappings": { "runtime": { "day_of_week": { "type": "keyword", "script": { "source": "emit(doc['@timestamp'].value.dayOfWeekEnum.getDisplayName(TextStyle.FULL, Locale.ROOT))" } } } } } }

执行结果如下

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-index-template-1.png)

* **创建使用组件模板的索引模板**
PUT _index_template/template_1 { "index_patterns": ["bar/*"], "template": { "settings": { "number_of_shards": 1 }, "mappings": { "_source": { "enabled": true }, "properties": { "host_name": { "type": "keyword" }, "created_at": { "type": "date", "format": "EEE MMM dd HH:mm:ss Z yyyy" } } }, "aliases": { "mydata": { } } }, "priority": 500, "composed_of": ["component_template1", "runtime_component_template"], "version": 3, "_meta": { "description": "my custom" } }

执行结果如下

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-index-template-2.png)

* 创建一个匹配

bar/*
的索引

bar-test
PUT /bar-test

然后获取mapping

GET /bar-test/_mapping

执行结果如下

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-index-template-3.png)

## 模拟多组件模板

由于模板不仅可以由多个组件模板组成，还可以由索引模板自身组成；那么最终的索引设置将是什么呢？ElasticSearch设计者考虑到这个，提供了API进行模拟组合后的模板的配置。

### 模拟某个索引结果

比如上面的template_1, 我们不用创建bar/*的索引(这里模拟bar-pdai-test)，也可以模拟计算出索引的配置：
POST /_index_template/_simulate_index/bar-pdai-test

执行结果如下

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-index-template-4.png)

### 模拟组件模板结果

当然，由于template_1模板是由两个组件模板组合的，我们也可以模拟出template_1被组合后的索引配置：
POST /_index_template/_simulate/template_1

执行结果如下：

{ "template" : { "settings" : { "index" : { "number_of_shards" : "1" } }, "mappings" : { "runtime" : { "day_of_week" : { "type" : "keyword", "script" : { "source" : "emit(doc['@timestamp'].value.dayOfWeekEnum.getDisplayName(TextStyle.FULL, Locale.ROOT))", "lang" : "painless" } } }, "properties" : { "@timestamp" : { "type" : "date" }, "created_at" : { "type" : "date", "format" : "EEE MMM dd HH:mm:ss Z yyyy" }, "host_name" : { "type" : "keyword" } } }, "aliases" : { "mydata" : { } } }, "overlapping" : [ ] }

### 模拟组件模板和自身模板结合后的结果

* 新建两个模板
PUT /_component_template/ct1 { "template": { "settings": { "index.number_of_shards": 2 } } } PUT /_component_template/ct2 { "template": { "settings": { "index.number_of_replicas": 0 }, "mappings": { "properties": { "@timestamp": { "type": "date" } } } } }

模拟在两个组件模板的基础上，添加自身模板的配置

POST /_index_template/_simulate { "index_patterns": ["my/*"], "template": { "settings" : { "index.number_of_shards" : 3 } }, "composed_of": ["ct1", "ct2"] }

执行的结果如下

{ "template" : { "settings" : { "index" : { "number_of_shards" : "3", "number_of_replicas" : "0" } }, "mappings" : { "properties" : { "@timestamp" : { "type" : "date" } } }, "aliases" : { } }, "overlapping" : [ ] }

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-index-template-5.png)

## 参考文章

[https://www.elastic.co/guide/en/elasticsearch/reference/current/index-templates.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-templates.html)

[https://www.elastic.co/guide/en/elasticsearch/reference/current/simulate-multi-component-templates.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/simulate-multi-component-templates.html)




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/06%20%e7%b4%a2%e5%bc%95%ef%bc%9a%e7%b4%a2%e5%bc%95%e6%a8%a1%e6%9d%bf%28Index%20Template%29%e8%af%a6%e8%a7%a3.md

* any list
{:toc}
