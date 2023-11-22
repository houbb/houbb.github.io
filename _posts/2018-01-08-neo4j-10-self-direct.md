---
layout: post
title:  Neo4j-10-neo4j 中节点指向自己，有向遍历的时候导致死循环？
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---

# 

# chat

## Q1-neo4j 中如何找到节点自己指向自己的边和节点

在Neo4j中，您可以使用Cypher查询语言来查找节点自己指向自己的边和节点。

下面是一个示例的Cypher查询：

```
cypher
MATCH (n)-[r]->(n)
RETURN n, r
```

这个查询将匹配所有自己指向自己的边和节点，并返回它们。

在查询中， `(n)-[r]->(n)` 表示节点n与自己之间存在一条边r的关系。

您可以在Neo4j的浏览器界面或通过Neo4j的驱动程序执行这个查询。

执行后，将返回所有满足条件的节点和边。

请注意，这个查询将返回所有自己指向自己的边和节点，如果图数据库中存在大量这样的边和节点，可能会导致查询结果较大。

因此，在执行查询时，请确保您的数据集适合查询的范围。

## Q2-neo4j 中沿着节点，做有向边的遍历。如果遇到自己指向自己的节点，怎么跳过。对应的 cypher 怎么写？

在Neo4j中，您可以使用Cypher查询语言进行有向边的遍历，并通过添加条件来跳过自己指向自己的节点。下面是一个示例的Cypher查询：

```cypher
MATCH (startNode)-[r*]->(endNode)
WHERE NOT startNode = endNode
RETURN startNode, r, endNode
```

在这个查询中， `(startNode)-[r*]->(endNode)` 表示从起始节点开始，沿着有向边进行遍历，直到到达终止节点。 

`WHERE NOT startNode = endNode` 条件用于排除自己指向自己的情况。

您可以根据实际情况更改起始节点和终止节点的标签、属性等，以及调整遍历的深度和其他条件。

执行该查询后，将返回满足条件的起始节点、边和终止节点。

请注意，这只是一个示例查询，您可以根据自己的需求进行调整和扩展。

## Q3-neo4j 假设有一个 Person 节点，有一个属性 name。现在有连个节点 name=A 和 name=B，A 指向 B，给出初始化的  cypher 脚本？

以下是一个示例的Cypher脚本，用于创建两个Person节点，其中一个节点指向另一个节点：

```
CREATE (A:Person {name: 'A'})
CREATE (B:Person {name: 'B'})
CREATE (A)-[:POINTS_TO]->(B)
```

在这个脚本中，首先使用 `CREATE` 语句创建了两个Person节点，并设置了它们的name属性为'A'和'B'。然后，使用 `CREATE` 语句创建了一个从节点A指向节点B的关系，关系类型为'POINTS_TO'。

您可以根据实际需求修改节点的标签、属性和关系类型。执行这个脚本后，两个Person节点和它们之间的关系就会被创建出来。

### step1-遍历查询

```
MATCH (startNode:Person)-[r:POINTS_TO]->(endNode:Person)
WHERE NOT startNode = endNode
RETURN startNode, r, endNode
```

查询结果：

```
╒═════════════════════╤════════════╤═════════════════════╕
│startNode            │r           │endNode              │
╞═════════════════════╪════════════╪═════════════════════╡
│(:Person {name: "A"})│[:POINTS_TO]│(:Person {name: "B"})│
└─────────────────────┴────────────┴─────────────────────┘
```

### step2-添加自循环的边

添加 A-A

```
CREATE (A:Person {name: 'A'})
CREATE (B:Person {name: 'B'})
CREATE (A)-[:POINTS_TO]->(B)
CREATE (A)-[:POINTS_TO]->(A)
```

此时直接查询：


```
MATCH (startNode:Person)-[r:POINTS_TO]->(endNode:Person)
WHERE NOT startNode = endNode
RETURN startNode, r, endNode
```

正常返回，对应的数据：

```
╒═════════════════════╤════════════╤═════════════════════╕
│startNode            │r           │endNode              │
╞═════════════════════╪════════════╪═════════════════════╡
│(:Person {name: "A"})│[:POINTS_TO]│(:Person {name: "B"})│
└─────────────────────┴────────────┴─────────────────────┘
```

如果不添加不等于自己的限制呢？


```
MATCH (startNode:Person)-[r:POINTS_TO]->(endNode:Person)
RETURN startNode, r, endNode
```

正常返回，对应的结果：

```
╒═════════════════════╤════════════╤═════════════════════╕
│startNode            │r           │endNode              │
╞═════════════════════╪════════════╪═════════════════════╡
│(:Person {name: "A"})│[:POINTS_TO]│(:Person {name: "B"})│
├─────────────────────┼────────────┼─────────────────────┤
│(:Person {name: "A"})│[:POINTS_TO]│(:Person {name: "A"})│
└─────────────────────┴────────────┴─────────────────────┘
```

# 参考资料

[防止neo4j中出现无限循环](https://qa.1r1g.com/sf/ask/1844184961/)

* any list
{:toc}

