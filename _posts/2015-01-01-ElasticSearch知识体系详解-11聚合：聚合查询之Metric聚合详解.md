---
layout: post
title:  ElasticSearch知识体系详解-11聚合：聚合查询之Metric聚合详解
date:   2015-01-01 23:20:27 +0800
categories: [ElasticSearch知识体系详解]
tags: [ElasticSearch知识体系详解, other]
published: true
---



11 聚合：聚合查询之Metric聚合详解
## 如何理解metric聚合

在[bucket聚合]中，我画了一张图辅助你构筑体系，那么metric聚合又如何理解呢？

如果你直接去看官方文档，大概也有十几种：

![img](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/assets/es-agg-metric-1.png)
那么metric聚合又如何理解呢？我认为从两个角度：

* **从分类看**：Metric聚合分析分为**单值分析**和**多值分析**两类
* **从功能看**：根据具体的应用场景设计了一些分析api, 比如地理位置，百分数等等
融合上述两个方面，我们可以梳理出大致的一个mind图：

* 单值分析 
只输出一个分析结果

* 标准stat型

* avg
平均值
* max
最大值
* min
最小值
* sum
和
* value_count
数量
* 其它类型

* cardinality
基数（distinct去重）
* weighted_avg
带权重的avg
* median_absolute_deviation
中位值
* 多值分析 
单值之外的

* stats型

* stats
包含avg,max,min,sum和count
* matrix_stats
针对矩阵模型
* extended_stats
* string_stats
针对字符串
* 百分数型

* percentiles
百分数范围
* percentile_ranks
百分数排行
* 地理位置型

* geo_bounds
Geo bounds
* geo_centroid
Geo-centroid
* geo_line
Geo-Line
* Top型

* top_hits
分桶后的top hits
* top_metrics
**通过上述列表（我就不画图了），我们构筑的体系是基于分类和功能，而不是具体的项（比如avg,percentiles…)；这是不同的认知维度: 具体的项是碎片化，分类和功能这种是你需要构筑的体系**。@pdai

## 单值分析: 标准stat类型

### 
avg
平均值

计算班级的平均分
POST /exams/_search?size=0 { "aggs": { "avg_grade": { "avg": { "field": "grade" } } } }

返回

{ ... "aggregations": { "avg_grade": { "value": 75.0 } } }

### 
max
最大值

计算销售最高价
POST /sales/_search?size=0 { "aggs": { "max_price": { "max": { "field": "price" } } } }

返回

{ ... "aggregations": { "max_price": { "value": 200.0 } } }

### 
min
最小值

计算销售最低价
POST /sales/_search?size=0 { "aggs": { "min_price": { "min": { "field": "price" } } } }

返回

{ ... "aggregations": { "min_price": { "value": 10.0 } } }

### 
sum
和

计算销售总价
POST /sales/_search?size=0 { "query": { "constant_score": { "filter": { "match": { "type": "hat" } } } }, "aggs": { "hat_prices": { "sum": { "field": "price" } } } }

返回

{ ... "aggregations": { "hat_prices": { "value": 450.0 } } }

### 
value_count
数量

销售数量统计
POST /sales/_search?size=0 { "aggs" : { "types_count" : { "value_count" : { "field" : "type" } } } }

返回

{ ... "aggregations": { "types_count": { "value": 7 } } }

## 单值分析: 其它类型

### 
weighted_avg
带权重的avg

POST /exams/_search { "size": 0, "aggs": { "weighted_grade": { "weighted_avg": { "value": { "field": "grade" }, "weight": { "field": "weight" } } } } }

返回

{ ... "aggregations": { "weighted_grade": { "value": 70.0 } } }

### 
cardinality
基数（distinct去重）

POST /sales/_search?size=0 { "aggs": { "type_count": { "cardinality": { "field": "type" } } } }

返回

{ ... "aggregations": { "type_count": { "value": 3 } } }

### 
median_absolute_deviation
中位值

GET reviews/_search { "size": 0, "aggs": { "review_average": { "avg": { "field": "rating" } }, "review_variability": { "median_absolute_deviation": { "field": "rating" } } } }

返回

{ ... "aggregations": { "review_average": { "value": 3.0 }, "review_variability": { "value": 2.0 } } }

## 非单值分析：stats型

### 
stats
包含avg,max,min,sum和count

POST /exams/_search?size=0 { "aggs": { "grades_stats": { "stats": { "field": "grade" } } } }

返回

{ ... "aggregations": { "grades_stats": { "count": 2, "min": 50.0, "max": 100.0, "avg": 75.0, "sum": 150.0 } } }

### 
matrix_stats
针对矩阵模型

以下示例说明了使用矩阵统计量来描述收入与贫困之间的关系。
GET /_search { "aggs": { "statistics": { "matrix_stats": { "fields": [ "poverty", "income" ] } } } }

返回

{ ... "aggregations": { "statistics": { "doc_count": 50, "fields": [ { "name": "income", "count": 50, "mean": 51985.1, "variance": 7.383377037755103E7, "skewness": 0.5595114003506483, "kurtosis": 2.5692365287787124, "covariance": { "income": 7.383377037755103E7, "poverty": -21093.65836734694 }, "correlation": { "income": 1.0, "poverty": -0.8352655256272504 } }, { "name": "poverty", "count": 50, "mean": 12.732000000000001, "variance": 8.637730612244896, "skewness": 0.4516049811903419, "kurtosis": 2.8615929677997767, "covariance": { "income": -21093.65836734694, "poverty": 8.637730612244896 }, "correlation": { "income": -0.8352655256272504, "poverty": 1.0 } } ] } } }

### 
extended_stats

根据从汇总文档中提取的数值计算统计信息。
GET /exams/_search { "size": 0, "aggs": { "grades_stats": { "extended_stats": { "field": "grade" } } } }

上面的汇总计算了所有文档的成绩统计信息。聚合类型为extended_stats，并且字段设置定义将在其上计算统计信息的文档的数字字段。

{ ... "aggregations": { "grades_stats": { "count": 2, "min": 50.0, "max": 100.0, "avg": 75.0, "sum": 150.0, "sum_of_squares": 12500.0, "variance": 625.0, "variance_population": 625.0, "variance_sampling": 1250.0, "std_deviation": 25.0, "std_deviation_population": 25.0, "std_deviation_sampling": 35.35533905932738, "std_deviation_bounds": { "upper": 125.0, "lower": 25.0, "upper_population": 125.0, "lower_population": 25.0, "upper_sampling": 145.71067811865476, "lower_sampling": 4.289321881345245 } } } }

### 
string_stats
针对字符串

用于计算从聚合文档中提取的字符串值的统计信息。这些值可以从特定的关键字字段中检索。
POST /my-index-000001/_search?size=0 { "aggs": { "message_stats": { "string_stats": { "field": "message.keyword" } } } }

返回

{ ... "aggregations": { "message_stats": { "count": 5, "min_length": 24, "max_length": 30, "avg_length": 28.8, "entropy": 3.94617750050791 } } }

## 非单值分析：百分数型

### 
percentiles
百分数范围

针对从聚合文档中提取的数值计算一个或多个百分位数。
GET latency/_search { "size": 0, "aggs": { "load_time_outlier": { "percentiles": { "field": "load_time" } } } }

默认情况下，百分位度量标准将生成一定范围的百分位：[1，5，25，50，75，95，99]。

{ ... "aggregations": { "load_time_outlier": { "values": { "1.0": 5.0, "5.0": 25.0, "25.0": 165.0, "50.0": 445.0, "75.0": 725.0, "95.0": 945.0, "99.0": 985.0 } } } }

### 
percentile_ranks
百分数排行

根据从汇总文档中提取的数值计算一个或多个百分位等级。
GET latency/_search { "size": 0, "aggs": { "load_time_ranks": { "percentile_ranks": { "field": "load_time", "values": [ 500, 600 ] } } } }

返回

{ ... "aggregations": { "load_time_ranks": { "values": { "500.0": 90.01, "600.0": 100.0 } } } }

上述结果表示90.01％的页面加载在500ms内完成，而100％的页面加载在600ms内完成。

## 非单值分析：地理位置型

### 
geo_bounds
Geo bounds

PUT /museums { "mappings": { "properties": { "location": { "type": "geo_point" } } } } POST /museums/_bulk?refresh {"index":{"_id":1}} {"location": "52.374081,4.912350", "name": "NEMO Science Museum"} {"index":{"_id":2}} {"location": "52.369219,4.901618", "name": "Museum Het Rembrandthuis"} {"index":{"_id":3}} {"location": "52.371667,4.914722", "name": "Nederlands Scheepvaartmuseum"} {"index":{"_id":4}} {"location": "51.222900,4.405200", "name": "Letterenhuis"} {"index":{"_id":5}} {"location": "48.861111,2.336389", "name": "Musée du Louvre"} {"index":{"_id":6}} {"location": "48.860000,2.327000", "name": "Musée d'Orsay"} POST /museums/_search?size=0 { "query": { "match": { "name": "musée" } }, "aggs": { "viewport": { "geo_bounds": { "field": "location", "wrap_longitude": true } } } }

上面的汇总展示了如何针对具有商店业务类型的所有文档计算位置字段的边界框

{ ... "aggregations": { "viewport": { "bounds": { "top_left": { "lat": 48.86111099738628, "lon": 2.3269999679178 }, "bottom_right": { "lat": 48.85999997612089, "lon": 2.3363889567553997 } } } } }

### 
geo_centroid
Geo-centroid

PUT /museums { "mappings": { "properties": { "location": { "type": "geo_point" } } } } POST /museums/_bulk?refresh {"index":{"_id":1}} {"location": "52.374081,4.912350", "city": "Amsterdam", "name": "NEMO Science Museum"} {"index":{"_id":2}} {"location": "52.369219,4.901618", "city": "Amsterdam", "name": "Museum Het Rembrandthuis"} {"index":{"_id":3}} {"location": "52.371667,4.914722", "city": "Amsterdam", "name": "Nederlands Scheepvaartmuseum"} {"index":{"_id":4}} {"location": "51.222900,4.405200", "city": "Antwerp", "name": "Letterenhuis"} {"index":{"_id":5}} {"location": "48.861111,2.336389", "city": "Paris", "name": "Musée du Louvre"} {"index":{"_id":6}} {"location": "48.860000,2.327000", "city": "Paris", "name": "Musée d'Orsay"} POST /museums/_search?size=0 { "aggs": { "centroid": { "geo_centroid": { "field": "location" } } } }

上面的汇总显示了如何针对所有具有犯罪类型的盗窃文件计算位置字段的质心。

{ ... "aggregations": { "centroid": { "location": { "lat": 51.00982965203002, "lon": 3.9662131341174245 }, "count": 6 } } }

### 
geo_line
Geo-Line

PUT test { "mappings": { "dynamic": "strict", "_source": { "enabled": false }, "properties": { "my_location": { "type": "geo_point" }, "group": { "type": "keyword" }, "@timestamp": { "type": "date" } } } } POST /test/_bulk?refresh {"index": {}} {"my_location": {"lat":37.3450570, "lon": -122.0499820}, "@timestamp": "2013-09-06T16:00:36"} {"index": {}} {"my_location": {"lat": 37.3451320, "lon": -122.0499820}, "@timestamp": "2013-09-06T16:00:37Z"} {"index": {}} {"my_location": {"lat": 37.349283, "lon": -122.0505010}, "@timestamp": "2013-09-06T16:00:37Z"} POST /test/_search?filter_path=aggregations { "aggs": { "line": { "geo_line": { "point": {"field": "my_location"}, "sort": {"field": "@timestamp"} } } } }

将存储桶中的所有geo_point值聚合到由所选排序字段排序的LineString中。

{ "aggregations": { "line": { "type" : "Feature", "geometry" : { "type" : "LineString", "coordinates" : [ [ -122.049982, 37.345057 ], [ -122.050501, 37.349283 ], [ -122.049982, 37.345132 ] ] }, "properties" : { "complete" : true } } } }

## 非单值分析：Top型

### 
top_hits
分桶后的top hits

POST /sales/_search?size=0 { "aggs": { "top_tags": { "terms": { "field": "type", "size": 3 }, "aggs": { "top_sales_hits": { "top_hits": { "sort": [ { "date": { "order": "desc" } } ], "_source": { "includes": [ "date", "price" ] }, "size": 1 } } } } } }

返回

{ ... "aggregations": { "top_tags": { "doc_count_error_upper_bound": 0, "sum_other_doc_count": 0, "buckets": [ { "key": "hat", "doc_count": 3, "top_sales_hits": { "hits": { "total" : { "value": 3, "relation": "eq" }, "max_score": null, "hits": [ { "_index": "sales", "_type": "_doc", "_id": "AVnNBmauCQpcRyxw6ChK", "_source": { "date": "2015/03/01 00:00:00", "price": 200 }, "sort": [ 1425168000000 ], "_score": null } ] } } }, { "key": "t-shirt", "doc_count": 3, "top_sales_hits": { "hits": { "total" : { "value": 3, "relation": "eq" }, "max_score": null, "hits": [ { "_index": "sales", "_type": "_doc", "_id": "AVnNBmauCQpcRyxw6ChL", "_source": { "date": "2015/03/01 00:00:00", "price": 175 }, "sort": [ 1425168000000 ], "_score": null } ] } } }, { "key": "bag", "doc_count": 1, "top_sales_hits": { "hits": { "total" : { "value": 1, "relation": "eq" }, "max_score": null, "hits": [ { "_index": "sales", "_type": "_doc", "_id": "AVnNBmatCQpcRyxw6ChH", "_source": { "date": "2015/01/01 00:00:00", "price": 150 }, "sort": [ 1420070400000 ], "_score": null } ] } } } ] } } }

### 
top_metrics

POST /test/_bulk?refresh {"index": {}} {"s": 1, "m": 3.1415} {"index": {}} {"s": 2, "m": 1.0} {"index": {}} {"s": 3, "m": 2.71828} POST /test/_search?filter_path=aggregations { "aggs": { "tm": { "top_metrics": { "metrics": {"field": "m"}, "sort": {"s": "desc"} } } } }

返回

{ "aggregations": { "tm": { "top": [ {"sort": [3], "metrics": {"m": 2.718280076980591 } } ] } } }

## 参考文章

[https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics.html)




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/ElasticSearch%e7%9f%a5%e8%af%86%e4%bd%93%e7%b3%bb%e8%af%a6%e8%a7%a3/11%20%e8%81%9a%e5%90%88%ef%bc%9a%e8%81%9a%e5%90%88%e6%9f%a5%e8%af%a2%e4%b9%8bMetric%e8%81%9a%e5%90%88%e8%af%a6%e8%a7%a3.md

* any list
{:toc}
