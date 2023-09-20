---
layout: post
title:  ElasticSearch知识体系详解-20WrapperQuery
date:   2015-01-01 23:20:27 +0800
categories: [ElasticSearch知识体系详解]
tags: [ElasticSearch知识体系详解, other]
published: true
---



20 WrapperQuery
## 实现方式理论基础

* Wrapper Query 官网说明

[https://www.elastic.co/guide/en/elasticsearch/reference/6.4/query-dsl-wrapper-query.html](https://www.elastic.co/guide/en/elasticsearch/reference/6.4/query-dsl-wrapper-query.html)
This query is more useful in the context of the Java high-level REST client or transport client to also accept queries as json formatted string. In these cases queries can be specified as a json or yaml formatted string or as a query builder (which is a available in the Java high-level REST client).
 
GET /_search { "query" : { "wrapper": { "query" : "eyJ0ZXJtIiA6IHsgInVzZXIiIDogIktpbWNoeSIgfX0=" // Base64 encoded string: {"term" : { "user" : "Kimchy" }} } } }

* 将DSL JSON语句 转成 map

[https://blog.csdn.net/qq_41370896/article/details/83658948](https://blog.csdn.net/qq_41370896/article/details/83658948)
String dsl = ""; Map maps = (Map)JSON.parse(dsl); maps.get("query");// dsl query string

* Java 代码

[https://blog.csdn.net/tcyzhyx/article/details/84566734](https://blog.csdn.net/tcyzhyx/article/details/84566734)

[https://www.jianshu.com/p/216ca70d9e62](https://www.jianshu.com/p/216ca70d9e62)
StringBuffer dsl = new StringBuffer(); dsl.append("{\"bool\": {"); dsl.append(" \"must\": ["); dsl.append(" {"); dsl.append(" \"term\": {"); dsl.append(" \"mdid.keyword\": {"); dsl.append(" \"value\": \"2fa9d41e1af460e0d47ce36ca8a98737\""); dsl.append(" }"); dsl.append(" }"); dsl.append(" }"); dsl.append(" ]"); dsl.append(" }"); dsl.append("}"); WrapperQueryBuilder wqb = QueryBuilders.wrapperQuery(dsl.toString()); SearchResponse searchResponse = client.prepareSearch(basicsysCodeManager.getYjzxYjxxIndex()) .setTypes(basicsysCodeManager.getYjzxYjxxType()).setQuery(wqb).setSize(10).get(); SearchHit[] hits = searchResponse.getHits().getHits(); for(SearchHit hit : hits){ String content = hit.getSourceAsString(); System.out.println(content); }

* query + agg 应该怎么写

[http://www.itkeyword.com/doc/1009692843717298639/wrapperquerybuilder-aggs-query-throwing-query-malformed-exception](http://www.itkeyword.com/doc/1009692843717298639/wrapperquerybuilder-aggs-query-throwing-query-malformed-exception)
"{\"query\":{\"match_all\": {}},\"aggs\":{\"avg1\":{\"avg\":{\"field\":\"age\"}}}}" SearchSourceBuilder ssb = new SearchSourceBuilder(); // add the query part String query ="{\"match_all\": {}}"; WrapperQueryBuilder wrapQB = new WrapperQueryBuilder(query); ssb.query(wrapQB); // add the aggregation part AvgBuilder avgAgg = AggregationBuilders.avg("avg1").field("age"); ssb.aggregation(avgAgg);

## 实现示例

略




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/20%20WrapperQuery.md

* any list
{:toc}
