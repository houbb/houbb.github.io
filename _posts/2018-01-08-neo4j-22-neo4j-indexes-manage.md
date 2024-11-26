---
layout: post
title:  Neo4j-22-neo4j shell 查看库中的索引
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j, go, go-lang]
published: true
---

# 查看索引

在 Neo4j 中，你可以使用 Cypher 查询来查看已创建的索引。

以下是用于查看所有生产中的索引的脚本：

```cypher
CALL db.indexes()
```

这个查询将列出所有的索引和约束，包括它们的类型、创建的节点标签、属性以及索引的状态（是否已经完成）。

### 示例输出信息：

- **`name`**: 索引的名称。
- **`type`**: 索引的类型（如：`BTREE`、`FULLTEXT`）。
- **`entityType`**: 索引应用的实体类型（`NODE` 或 `RELATIONSHIP`）。
- **`labelsOrTypes`**: 节点标签或关系类型。
- **`properties`**: 索引应用的属性。
- **`state`**: 索引的状态，通常是 `ONLINE` 或 `POPULATING`。

### 查看特定类型的索引：

如果你只关心某个标签的索引，比如 `Person` 标签上的索引，可以使用如下查询：

```cypher
CALL db.indexes() YIELD name, label, properties
WHERE label = 'Person'
RETURN name, label, properties
```

### 查看约束：

如果你也想查看数据库中的约束（例如，唯一约束），可以执行以下查询：

```cypher
CALL db.constraints()
```

这将列出所有的约束，包括唯一约束、存在约束等。

### 例子：查看所有唯一约束
```cypher
CALL db.constraints() YIELD name, label, type, properties
WHERE type = 'UNIQUENESS'
RETURN name, label, properties
```

这些命令帮助你快速查看当前 Neo4j 数据库中已经生产并且有效的索引和约束。


# 参考资料

* any list
{:toc}

