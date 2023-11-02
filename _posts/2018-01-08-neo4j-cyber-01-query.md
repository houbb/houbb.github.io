---
layout: post
title:  Neo4j-Cypher-01-query
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---

# 核心概念

从根本上讲，Neo4j图数据库由三个核心实体组成：节点（nodes）、关系（relationships）和路径（paths）。

Cypher®查询被构建用于在图中匹配或创建这些实体。

因此，在构建Cypher查询时，了解图数据库中的节点、关系和路径是非常关键的。

以下示例使用MATCH和RETURN子句来查找和返回所需的图模式。

要了解更多关于这些以及其他许多Cypher子句的信息，请参阅Clauses部分。

# 节点

在Neo4j图数据库中，数据实体被称为节点（nodes）。

在Cypher中，节点使用圆括号（）表示。

```sql
MATCH (n:Person {name:'Anna'})
RETURN n.born AS birthYear
```

在上述示例中，节点包括以下内容：

1. **Person标签**：标签类似于标签，用于查询特定节点的数据库。一个节点可以有多个标签，例如Person和Actor。

2. **name属性**：设置为Anna。属性在大括号{}中定义，用于为节点提供特定信息，这些信息也可以用于查询，从而进一步提高定位数据的能力。

3. **变量n**：变量允许在后续子句中引用指定的节点。

在这个示例中，第一个MATCH子句查找图中所有name属性设置为Anna的Person节点，并将它们绑定到变量n。

然后，变量n被传递到后续的RETURN子句中，该子句返回同一节点所属的不同属性（born）的值。

# 关系

图中的节点可以通过关系连接。关系必须有一个起始节点、一个结束节点和确切的一个类型。

在Cypher中，关系用箭头表示（例如-->），表示关系的方向。

```cypher
MATCH (:Person {name: 'Anna'})-[r:KNOWS WHERE r.since < 2020]->(friend:Person)
RETURN count(r) AS numberOfFriends
```

与节点不同，关系模式中的信息必须由方括号括起来。

上面的查询示例用于匹配类型为KNOWS、属性since设置为小于2020的关系。

该查询还要求关系从名为Anna的Person节点到其他任何Person节点（被称为friend）的方向。

在RETURN子句中，count()函数用于计算在前面的MATCH子句中由变量r绑定的所有关系的数量（即Anna自2020年之前认识了多少朋友）。

需要注意的是，虽然节点可以有多个标签，但关系只能有一个类型。

# 路径-path

图中的路径由相连的节点和关系组成。探索这些路径是Cypher的核心内容之一。

```cypher
MATCH (n:Person {name: 'Anna'})-[:KNOWS]-{1,5}-(friend:Person WHERE n.born < friend.born)
RETURN DISTINCT friend.name AS olderConnections
```

此示例使用量化关系来查找距离起始节点Anna最多5个跳远的所有路径，只遍历类型为KNOWS的关系，从起始节点Anna到其他年龄较大的Person节点（由WHERE子句定义）。

使用DISTINCT运算符可以确保RETURN子句只返回唯一的节点。

路径也可以赋予变量。

例如，下面的查询将整个路径模式绑定到一个变量，该模式匹配从Anna到图中最多10个跳远的具有国籍属性设置为Canadian的另一个Person节点的最短路径。

在这种情况下，RETURN子句返回两个节点之间的完整路径。

```cypher
MATCH p=shortestPath((:Person {name: 'Anna'})-[:KNOWS*1..10]-(:Person {nationality: 'Canadian'}))
RETURN p
```

有关图模式的更多信息，请参阅 [Patterns](https://neo4j.com/docs/cypher-manual/5/patterns/) 部分。

# 参考资料

chat

https://neo4j.com/docs/cypher-manual/5/queries/

* any list
{:toc}

