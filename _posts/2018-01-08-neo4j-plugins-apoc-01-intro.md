---
layout: post
title:  Neo4j APOC-01-图数据库 apoc 插件介绍
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---

# 

# chat

## 详细介绍一下 neo4j 的 apoc

Neo4j 的 APOC（Awesome Procedures on Cypher）是一个非常强大的 Neo4j 插件，它扩展了 Cypher 查询语言的功能，提供了大量的实用函数和存储过程，极大地增强了 Neo4j 的功能性。

APOC 适用于需要更复杂数据处理和操作的场景，支持各种数据转换、图算法、数据导入/导出、集成外部系统等操作。

### 1. **APOC 的基本功能**

APOC 插件包含了以下几类常用功能：

- **数据转换和处理**：
  - 支持各种图数据的转换，例如将节点和关系转换为其他格式（JSON、CSV 等），以及对图的结构和数据进行各种操作（过滤、聚合、排序等）。
  - 提供了对集合、字符串、日期等数据类型的操作函数。
  
- **图算法**：
  - APOC 提供了许多图算法（如最短路径、中心度、PageRank 等），虽然 Neo4j 本身也有图算法库（Graph Data Science），但是 APOC 是一个更加轻量级的选择，适用于简单的图分析任务。

- **存储过程**：
  - 提供了丰富的存储过程，例如批量数据插入、更新、删除、导入导出等。
  - 支持对图数据库的各种操作进行封装，并简化复杂操作。

- **与外部系统的集成**：
  - APOC 支持通过 HTTP 访问外部 REST API，或者与文件系统交互（如上传、下载文件），以便集成外部数据源。
  - 也支持与外部数据库的连接，如导入其他数据库的数据到 Neo4j。

### 总结

APOC 是一个功能丰富且灵活的 Neo4j 插件，它为 Cypher 查询语言提供了大量实用的扩展，涵盖了数据处理、图算法、外部系统集成等方面。

通过使用 APOC，开发者可以大大提高图数据库的操作效率和灵活性，尤其是在复杂的数据处理和分析任务中。

## apoc 常用的功能，示例，表格形式返回

下面是一些常用的 **APOC** 插件功能和示例，以表格形式展示，帮助你更好地理解和使用 APOC 插件。

| **功能**                           | **存储过程/函数**                  | **描述**                                                 | **示例**                                                                                  |
|------------------------------------|------------------------------------|----------------------------------------------------------|-------------------------------------------------------------------------------------------|
| **数据转换**                       | `apoc.convert.toJson()`            | 将节点、关系或任何图数据结构转换为 JSON 格式             | `MATCH (n:Person) RETURN apoc.convert.toJson(n)`                                            |
| **集合操作**                       | `apoc.coll.flatten()`              | 将嵌套的集合扁平化                                      | `RETURN apoc.coll.flatten([[1, 2], [3, 4]])`                                                 |
|                                    | `apoc.coll.sum()`                  | 计算集合中所有元素的和                                   | `RETURN apoc.coll.sum([1, 2, 3, 4])`                                                         |
|                                    | `apoc.text.join()`                 | 将集合中的元素连接成一个字符串                           | `RETURN apoc.text.join(['a', 'b', 'c'], ',')`                                                |
| **图算法**                         | `apoc.algo.shortestPath()`         | 计算两个节点之间的最短路径                               | `MATCH (start:Person {name: 'Alice'}), (end:Person {name: 'Bob'}) CALL apoc.algo.shortestPath(start, end, 'KNOWS') YIELD path RETURN path` |
|                                    | `apoc.algo.dijkstra()`             | Dijkstra 算法计算最短路径                               | `MATCH (start:Person {name: 'Alice'}), (end:Person {name: 'Bob'}) CALL apoc.algo.dijkstra(start, end, 'KNOWS') YIELD path RETURN path` |
| **导入/导出数据**                   | `apoc.import.csv()`                | 从 CSV 文件导入数据                                      | `CALL apoc.import.csv('file:///path/to/file.csv', {header:true}) YIELD nodes, relationships RETURN nodes` |
|                                    | `apoc.export.csv.all()`            | 将所有图数据导出为 CSV 文件                              | `CALL apoc.export.csv.all('file:///output.csv', {})`                                         |
|                                    | `apoc.load.csv()`                  | 从 CSV 文件中加载数据                                    | `CALL apoc.load.csv('file:///path/to/file.csv') YIELD map RETURN map`                       |
|                                    | `apoc.load.json()`                 | 从外部 URL 加载 JSON 数据                                | `CALL apoc.load.json('http://example.com/data.json') YIELD value RETURN value`              |
| **外部系统集成**                    | `apoc.load.xml()`                  | 从外部 URL 加载 XML 数据                                 | `CALL apoc.load.xml('http://example.com/data.xml') YIELD value RETURN value`                |
|                                    | `apoc.load.http()`                 | 通过 HTTP 请求获取外部数据                               | `CALL apoc.load.http('http://example.com/api') YIELD value RETURN value`                    |
| **日期和时间处理**                  | `apoc.date.convert()`              | 将日期时间字符串转换为时间戳                            | `RETURN apoc.date.convert('2024-11-01T12:00:00', 'ISO_8601', 'milliseconds')`               |
| **图数据操作**                      | `apoc.create.node()`               | 创建节点并为其设置属性                                  | `CALL apoc.create.node(['Person'], {name: 'Alice', age: 30}) YIELD node RETURN node`        |
|                                    | `apoc.create.relationship()`       | 创建关系并设置属性                                      | `MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'}) CALL apoc.create.relationship(a, 'KNOWS', {since: 2020}) YIELD rel RETURN rel` |
| **事务和批量操作**                  | `apoc.periodic.iterate()`          | 按批次进行迭代处理                                      | `CALL apoc.periodic.iterate('MATCH (n:Person) RETURN n', 'SET n.processed = true', {batchSize: 1000}) YIELD batches, total RETURN batches, total` |
| **性能监控与统计**                  | `apoc.stats()`                     | 返回数据库的统计信息                                    | `RETURN apoc.stats()`                                                                         |
| **路径和图遍历**                    | `apoc.path.expand()`               | 扩展路径，获取指定节点的邻居                             | `MATCH (a:Person {name: 'Alice'}) CALL apoc.path.expand(a, 'KNOWS', 1) YIELD path RETURN path` |
|                                    | `apoc.path.subgraphNodes()`        | 获取路径的子图节点                                      | `MATCH (a:Person {name: 'Alice'}) CALL apoc.path.subgraphNodes(a, {relationshipFilter: 'KNOWS'}) YIELD node RETURN node` |
| **字符串处理**                      | `apoc.text.split()`                | 按指定分隔符将字符串分割成多个部分                      | `RETURN apoc.text.split('a,b,c,d', ',')`                                                      |
|                                    | `apoc.text.replace()`              | 在字符串中进行替换操作                                  | `RETURN apoc.text.replace('Hello World', 'World', 'Neo4j')`                                  |

### 说明：
- **apoc.convert.toJson()**: 用于将节点、关系或图中的其他数据结构转换为 JSON 格式，便于查看或外部系统的集成。
- **apoc.coll.flatten()**: 适用于将嵌套的集合（例如列表中的列表）扁平化为一维集合。
- **apoc.algo.shortestPath()**: 计算两个节点之间的最短路径，适用于图遍历和路径分析。
- **apoc.load.csv()**: 从 CSV 文件中加载数据，可以通过指定文件路径来读取本地文件。
- **apoc.date.convert()**: 用于将字符串格式的日期转换为时间戳，常用于时间戳的计算或比较。

这些功能覆盖了图数据库的许多常见操作，如数据转换、导入导出、图算法、路径计算等，能够有效扩展 Neo4j 的使用场景。

# 参考资料

https://www.cnblogs.com/liaozk/p/17138133.html

https://www.w3cschool.cn/neo4j/neo4j_cql_introduction.html

* any list
{:toc}


