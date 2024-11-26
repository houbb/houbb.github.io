---
layout: post
title:  Neo4j-20-neo4j shell 查看所有的 labels
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j, go, go-lang]
published: true
---



# chat

## neo4j 查看所有实体的名称

在 Neo4j 中，要查看所有实体（节点类型）名称，你可以通过 Cypher 查询语言来查找数据库中所有节点的标签（Label）。

以下是一个简单的查询，可以帮助你列出所有的节点标签：

```cypher
CALL db.labels()
```

这个查询将返回数据库中所有的节点标签，类似于“实体名称”或“类型”。

如果你还想查看节点标签的数量，可以执行：

```cypher
CALL db.labels() YIELD label
RETURN label, count(*) AS num_nodes
ORDER BY num_nodes DESC
```

这将返回每个标签及其对应的节点数量，按节点数量降序排序。

如果你需要更多关于每个节点标签的详细信息，可以查询具体的节点数据，举例如下：

```cypher
MATCH (n) 
RETURN DISTINCT labels(n)
```

这将返回所有不同的标签名称。如果你需要进一步分析或处理这些实体，你可以根据返回的标签信息进行筛选或统计。


# 参考资料

* any list
{:toc}

