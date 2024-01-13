---
layout: post
title:  Graph database-00-图数据库概览
date:  2018-01-07 11:35:40 +0800
categories: [Database]
tags: [database, nosql, graph-database]
published: true
---



# github 的图数据库有哪些

> [https://github.com/search?q=graph+database](https://github.com/search?q=graph+database)

# 超棒图数据库资源

这是一个为图数据库和图计算工具提供资源的精选列表。

## 图数据库

* [AgensGraph](https://bitnine.net/agensgraph-2/) - 多模型图数据库，支持 SQL 和 Cypher 查询语言
* [AnzoGraph](https://www.cambridgesemantics.com/anzograph/) - 高度并行的图数据库，具备先进的分析功能（SPARQL、Cypher、OWL/RDFS+、LPG）
* [Atomic-Server](https://crates.io/crates/atomic-server/) - 用 Rust 编写的开源类型安全图数据库服务器，带有图形用户界面（GUI）。支持 [Atomic Data](docs.atomicdata.dev/)、JSON 和 RDF。
* [ArangoDB](https://www.arangodb.com/) - 高可用的多模型 NoSQL 数据库
* [Blazegraph](https://github.com/blazegraph/database) - GPU 加速的图数据库
* [Cayley](https://github.com/cayleygraph/cayley) - 用 Go 语言编写的开源数据库
* [CosmosDB](https://docs.microsoft.com/en-us/azure/cosmos-db/graph-introduction) - 云端多模型数据库，支持 TinkerPop3
* [Dgraph](https://dgraph.io) - 快速、事务性、分布式图数据库（开源，用 Go 语言编写）
* [DSE Graph](https://www.datastax.com/products/datastax-enterprise-graph) - 在 DataStax Enterprise（Cassandra、SolR、Spark）之上的图层
* [Grafito](https://github.com/arturo-lang/grafito) - 便携、无服务器、轻量级的基于 SQLite 的图数据库（在 Arturo 中）
* [Grakn.AI](https://grakn.ai/) - 用于知识导向系统的分布式超关系型数据库，即分布式知识库
* [Graphd](https://github.com/google/graphd) - Metaweb/Freebase 图库
* [JanusGraph](http://janusgraph.org) - 开源的、分布式图数据库，支持可插拔的存储和索引后端
* [Memgraph](https://memgraph.com/) - 高性能、内存中、事务性图数据库
* [Neo4j](http://tinkerpop.apache.org/docs/current/#neo4j-gremlin) - OLTP 图数据库
* [Nebula Graph](http://nebula-graph.io/) - 分布式、快速的开源图数据库，具备横向扩展和高可用性
* [RedisGraph](https://oss.redislabs.com/redisgraph/) - 基于线性代数构建的属性图数据库（GraphBLAS）
* [Sparksee](http://www.sparsity-technologies.com/#sparksee) - 使空间和性能兼容，具备小型占用和对大型网络的快速分析
* [Stardog](http://stardog.com/) - 具有 OLTP 和 OLAP 支持的 RDF 图数据库
* [OrientDB](http://orientdb.com/orientdb/) - 分布式多模型 NoSQL 数据库，带有图数据库引擎
* [TerminusDB](https://github.com/terminusdb/terminusdb) - 一款开源图数据库和文档存储。设计用于协同构建数据密集型应用和知识图谱。
* [TigerGraph](https://www.tigergraph.com/) - 第一个原生并行图数据库，能够对 Web 规模的数据进行实时分析
* [Weaviate](https://github.com/semi-technologies/weaviate) - Weaviate 是一款云原生、模块化、实时向量搜索引擎，具备图形数据模型（GraphQL 接口），旨在扩展您的机器学习模型。

### 三元组存储

* [Akutan](https://github.com/eBay/akutan) - Akutan是一种分布式知识图存储，有时被称为RDF存储或三元组存储。
* [AllegroGraph](https://franz.com/agraph/allegrograph/) - 高性能、持久性图数据库，可扩展到数十亿个四元组。
* [Apache Jena](https://jena.apache.org/) - 用于构建语义网络和链接数据应用的开源Java框架。
* [Dydra](http://docs.dydra.com/dydra) - Dydra是一种基于云的图数据库。Dydra将数据本地存储为属性图，直接表示底层数据中的关系。
* [Eclipse RDF4J](http://rdf4j.org/) - （以前称为Sesame）是一个用于处理RDF数据的开源Java框架。这包括对/在此类数据上进行解析、存储、推理和查询。它提供了一个易于使用的API，可连接到所有领先的RDF存储解决方案。它允许您连接到SPARQL终端，并创建利用关联数据和语义网络强大功能的应用程序。
* [GraphDB](http://graphdb.ontotext.com/graphdb/) - 企业级语义图数据库，符合W3C标准。
* [Virtuoso](https://virtuoso.openlinksw.com/) - 通过从现有数据孤岛派生出语义网链接数据，推动企业和个体的灵活性的“数据联接盒”。
* [Hoply](https://github.com/amirouche/hoply/) - 在Python的舒适环境中探索超过RAM大小的关系数据。

## 图计算框架

* [Apache Giraph](https://giraph.apache.org/) - 为高可伸缩性而构建的迭代图处理系统。
* [Apache TinkerPop](https://tinkerpop.apache.org/) - 用于图数据库（OLTP）和图分析系统（OLAP）的图计算框架。
* [Apache Spark - GraphX](https://spark.apache.org/graphx/) - Apache Spark的图和图并行计算API。
* [GraphScope](https://github.com/alibaba/GraphScope) - 由阿里巴巴推出的一站式大规模图计算系统。

## 查询语言

* [Cypher](http://www.opencypher.org/)
* [Datalog](https://en.wikipedia.org/wiki/Datalog)
* [Gremlin](https://tinkerpop.apache.org/gremlin.html)
* [SPARQL](https://en.wikipedia.org/wiki/SPARQL)
* [GSQL](https://docs.tigergraph.com/)

## 托管服务

* [Microsoft CosmosDB](https://docs.microsoft.com/en-us/azure/cosmos-db/graph-introduction)
* [IBM Compose 中的 JanusGraph](https://www.compose.com/databases/janusgraph)
* [Google Cloud Platform 中的 JanusGraph](https://cloud.google.com/solutions/running-janusgraph-with-bigtable) - 在 Google Kubernetes Engine 上通过 Google Cloud Bigtable 支持的 JanusGraph
* [Amazon Web Services Labs 中的 JanusGraph](https://github.com/awslabs/dynamodb-janusgraph-storage-backend)
* [Graphene 中的 Neo4j](https://www.graphenedb.com/)
* [Amazon Web Services 中的 Neptune](https://aws.amazon.com/neptune/) - 一个快速、可靠、完全托管的图数据库服务，便于构建和运行处理高度连接数据集的应用程序。

## 学习资料

### 官方文档

* [Cypher](https://neo4j.com/developer/cypher-query-language/) - 参考文档
* [Gremlin](http://tinkerpop.apache.org/docs/current/reference/#traversal) - 参考文档

### 社区贡献

* [图数据库书籍](https://github.com/krlawrence/graph) - 由 [Kelvin R. Lawrence](https://twitter.com/gfxman) 撰写的以 TinkerPop3 为中心的书籍
* [SQL2Gremlin](http://sql2gremlin.com/) - 由 [Daniel Kuppitz](https://twitter.com/dkuppitz) 撰写的从 SQL 到 Gremlin 的转换指南
* [Gremlin手册](http://www.doanduyhai.com/blog/?p=13460) - 任何 Gremlin 用户的最低生存工具包，由 [Doan DuyHai](https://twitter.com/doanduyhai) 撰写的 10 篇博客文章系列

### 博客

* [TigerGraph 博客](https://www.tigergraph.com/blog/)

## 会议

* [Graph Connect](http://graphconnect.com/) - 由 Neo4j 提供支持
* [Graph Day](http://graphday.com/) - 由 Data Day 团队主办的独立图会议

# chat

## 详细介绍一下图数据库

图数据库是一种专门设计用于处理图形数据的数据库系统。图数据库的数据模型基于图结构，其中包含节点、边和属性。以下是一些图数据库的基本概念：

1. **节点（Nodes）：** 节点是图数据库中的基本单元，代表图中的实体或对象。每个节点通常都有一个唯一的标识符，并可以包含属性，描述节点的特征或信息。

2. **边（Edges）：** 边是连接两个节点的关系，表示图中实体之间的关联。边可以有方向，也可以包含属性，描述关系的特性。

3. **属性（Properties）：** 节点和边都可以包含属性，这些属性是键值对，用于存储与节点或边相关的额外信息。属性可以帮助更详细地描述图中的实体和关系。

4. **图（Graph）：** 图是节点和边的集合，描述实体之间的关系。图数据库通过存储和管理图结构来提供高效的数据查询和分析。

5. **查询语言：** 图数据库通常使用特定的查询语言来检索和操作图数据。其中，Cypher是一种常见的图数据库查询语言，被用于查询和更新图数据库中的数据。

6. **索引：** 为了提高查询性能，图数据库通常会使用索引来加速节点和边的查找。这有助于快速定位和访问与查询相关的数据。

7. **图算法：** 一些图数据库提供内置的图算法，如最短路径算法、社区检测、PageRank 等，以支持更复杂的图分析。

8. **应用领域：** 图数据库适用于许多领域，如社交网络分析、推荐系统、网络安全、物流和路线规划等，因为这些领域中的数据常常以图形结构存在。

9. **举例：** Neo4j 是一种常见的图数据库，它是一个开源的、基于Java的数据库系统，专门用于存储和处理图数据。

总体而言，图数据库通过以图形结构存储数据，使得对实体和实体之间关系的查询和分析更加自然和高效。这使得图数据库在需要处理复杂关系的应用场景中表现出色。

## 为什么需要图数据库？解决了传统数据库什么问题？

图数据库的出现主要是为了解决传统关系型数据库在处理复杂的关系型数据时的一些局限性。以下是一些图数据库应运而生的原因，以及它们如何解决传统数据库的一些问题：

1. **处理复杂关系：** 图数据库更适合存储和查询具有复杂关系的数据。在社交网络、推荐系统、物流和路线规划等应用中，实体之间的关系可能非常复杂，而图数据库通过直观的图结构更容易表示和处理这些关系。

2. **灵活的数据模型：** 传统关系型数据库需要在预定义的表结构中存储数据，这在面对半结构化或非结构化数据时可能变得不够灵活。图数据库的数据模型更自由，可以轻松地适应不同类型和格式的数据。

3. **深度查询：** 图数据库通过图查询语言（如Cypher）支持深度查询，可以轻松地遍历和发现节点之间的复杂关系，而在传统数据库中可能需要执行多个联接操作，导致查询复杂度增加。

4. **性能优化：** 对于某些查询，图数据库在处理深度关系时通常比传统数据库更高效。图数据库的存储和查询模型旨在优化图形数据结构的访问，特别适用于需要频繁进行图形遍历和关系分析的场景。

5. **实时分析和推荐：** 图数据库支持实时分析和查询，使其在需要实时推荐和分析用户行为的应用中具有优势。这对于快速变化的数据，如社交媒体和在线推荐系统中的数据，非常重要。

6. **复杂图算法支持：** 一些图数据库内置了各种图算法，如最短路径、PageRank、社区检测等，使得在图结构中进行更复杂的分析成为可能。在传统数据库中，执行这些算法可能需要复杂的查询和多个步骤。

总体而言，图数据库通过其专注于图形结构、灵活的数据模型和优化的查询性能，使其在处理复杂关系、实时分析和复杂图算法等方面具有明显的优势，满足了一些传统数据库难以胜任的应用需求。

## 列出所有你知道的开源图数据库

以下是一些开源图数据库的列表，这里包含了一些我截止到2022年所知道的图数据库，但请注意，新的项目可能已经涌现，而一些项目可能已经发生变化。因此，建议在选择图数据库时查看最新的信息。

1. **Neo4j:**
   - **网站：** [Neo4j](https://neo4j.com/)
   - **描述：** Neo4j是一个用于存储、检索和管理图形结构数据的图数据库。

2. **ArangoDB:**
   - **网站：** [ArangoDB](https://www.arangodb.com/)
   - **描述：** ArangoDB是一个多模型数据库，支持图形、文档和键值存储。

3. **JanusGraph:**
   - **网站：** [JanusGraph](https://janusgraph.org/)
   - **描述：** JanusGraph是一个分布式图数据库，基于Apache TinkerPop图计算框架。

4. **OrientDB:**
   - **网站：** [OrientDB](https://orientdb.org/)
   - **描述：** OrientDB是一个多模型数据库，支持图形、文档、对象和键值存储。

5. **TinkerPop (框架):**
   - **网站：** [Apache TinkerPop](https://tinkerpop.apache.org/)
   - **描述：** TinkerPop本身是一个图计算框架，可以用于构建多种图数据库。

6. **Dgraph:**
   - **网站：** [Dgraph](https://dgraph.io/)
   - **描述：** Dgraph是一个分布式图数据库，专注于提供实时查询和事务。

7. **Blazegraph:**
   - **网站：** [Blazegraph](https://www.blazegraph.com/)
   - **描述：** Blazegraph是一个支持RDF图数据存储和查询的开源数据库。

8. **Amazon Neptune:**
   - **网站：** [Amazon Neptune](https://aws.amazon.com/neptune/)
   - **描述：** Amazon Neptune是亚马逊AWS提供的托管的图数据库服务，支持图形和RDF数据模型。

请确保在选择图数据库时仔细考虑您的具体需求，包括数据模型、性能、可扩展性以及社区支持等因素。

## 给出上述图数据库详细的对比表格

以下是一些开源图数据库的简要对比。请注意，这里提供的信息可能随时间而变化，因此在做出决策时，请查看官方文档以获取最新信息。

对比表格中的指标是一些常见的考虑因素，但具体选择取决于您的应用需求。

| **特性 / 图数据库** | **Neo4j** | **ArangoDB** | **JanusGraph** | **OrientDB** | **Dgraph** |
|---------------------|-----------|--------------|----------------|--------------|------------|
| **数据模型**         | 图        | 多模型        | 图             | 多模型        | 图         |
| **查询语言**         | Cypher    | AQL          | Gremlin        | SQL + Gremlin | GraphQL    |
| **分布式支持**       | 有        | 有            | 是             | 是           | 是         |
| **事务支持**         | ACID      | ACID         | ACID           | ACID         | ACID       |
| **可扩展性**         | 高        | 高           | 高             | 高           | 高         |
| **图算法**           | 有        | 有            | 通过TinkerPop  | 有           | 有         |
| **社区活跃度**       | 高        | 中高         | 高             | 中           | 高         |
| **使用场景**         | 社交网络、推荐系统 | 多模型应用、图形应用 | 大规模图形应用 | 文档存储、图形应用 | 实时分析、实时查询 |
| **开发语言支持**     | 多语言    | 多语言        | 多语言         | 多语言        | Go         |

请注意，这只是一个高层次的对比，每个图数据库都有其独特的特性和适用场景。在选择图数据库时，还应考虑具体的应用需求、性能要求、团队技能和支持等因素。



* any list
{:toc}

