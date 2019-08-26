---
layout: post
title: NoSQL-02-nosql ArangoDB 简介
date:  2019-5-10 11:08:59 +0800
categories: [NoSQL]
tags: [no-sql, arangodb, sh]
published: true
---

# 为什么选择ArangoDB？

多模型数据库将是未来发展趋势

## 原生多模型数据库

ArangoDB 从第一行代码开始就是按照原生多模型数据库来设计编写。

您可以灵活地为您的数据建立模型，并广泛应用在不同项目中。

## 通过Foxx framework进行扩展

您可以依据您的项目需求来对ArangoDB数据库进行扩展。

您也可以将您的逻辑功能加入到我们基于Google V8的 JavaScript framework Foxx™，并可以完全访问 ArangoDB 在 C++级别的所有功能。

# AQL - 一种类似于编码的声明式查询语言

ArangoDB查询语言(AQL) 可以涵盖三种数据模型，并允许在单个查询中混合使用三种模型。

如果您了解SQL ，您就能够对AQL清晰直观的语法轻松上手。

不再需要在多种数据库技术之间互相切换，ArangoDB让您只维护一个数据库，一个查询语言，来满足各种各样的需求。

请查阅 SQL / AQL的对比。

![请查阅 SQL / AQL的对比](https://www.arangodb.com/wp-content/uploads/2014/06/SQL_AQL_Comparison.png)

# 性能对比

How does ArangoDB stack up to other databases? 

In a comparison of our native multi-model database with the document store MongoDB, the graph store Neo4j, another multi-model database OrientDB and a relational database PostgreSQL, we run benchmark tests using Node.js and the SNAP social network data-set from Pokec.

![benchmark](https://www.arangodb.com/wp-content/uploads/2018/02/UPDATE-Benchmark-2018.001-1-800x438.jpeg)

# 参考资料

[why-arangodb](https://www.arangodb.com/why-arangodb/cn/)

* any list
{:toc}