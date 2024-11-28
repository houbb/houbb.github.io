---
layout: post
title:  Neo4j-23-neo4j neo4j statement 语句介绍一览
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j, go, go-lang]
published: true
---

# neo4j 语句分类

以下是 Neo4j 查询语言 Cypher 中常见语句的简要介绍及分类：

1. **查询语句**：`MATCH`、`OPTIONAL MATCH`
2. **数据操作**：`CREATE`、`MERGE`、`SET`、`REMOVE`
3. **删除操作**：`DELETE`、`DETACH DELETE`
4. **结果处理**：`RETURN`、`DISTINCT`、`ORDER BY`、`LIMIT`、`SKIP`
5. **聚合与条件**：`WHERE`、`WITH`、`COLLECT`、聚合函数（`COUNT`、`AVG`、`SUM`）
6. **查询优化与分析**：`EXPLAIN`、`PROFILE`
7. **结果合并**：`UNION`、`UNION ALL`

这些语句和功能帮助你灵活地操作图数据库，执行各种查询、更新、删除操作，以及优化查询性能。

# neo4j 常用语句一览

以下是更新后的 Neo4j 查询语句表格，增加了语句例子和返回结果的示例：

| **语句**  | **作用**                                                       | **语句例子**                                                      | **返回例子**                                               |
|-----------|----------------------------------------------------------------|------------------------------------------------------------------|------------------------------------------------------------|
| `MATCH`   | 查找节点或关系，类似于 SQL 的 `SELECT`，用于图形数据库查询。     | `MATCH (n:Person) RETURN n.name`                                | `["Alice", "Bob"]`                                          |
| `CREATE`  | 创建节点或关系。                                               | `CREATE (n:Person {name: "Charlie", age: 30})`                  | `(n:Person {name: "Charlie", age: 30})`                    |
| `MERGE`   | 查找现有的节点或关系，如果不存在则创建，避免重复数据。          | `MERGE (n:Person {name: "Alice"})`                               | `(n:Person {name: "Alice"})`                               |
| `DELETE`  | 删除节点或关系。                                               | `MATCH (n:Person {name: "Bob"}) DELETE n`                        | `null` (删除成功后无返回)                                  |
| `SET`     | 设置节点或关系的属性。                                          | `MATCH (n:Person {name: "Alice"}) SET n.age = 25`               | `(n:Person {name: "Alice", age: 25})`                      |
| `REMOVE`  | 删除节点或关系的属性。                                          | `MATCH (n:Person {name: "Alice"}) REMOVE n.age`                  | `(n:Person {name: "Alice"})`                               |
| `RETURN`  | 返回查询结果，类似于 SQL 的 `SELECT`。                          | `MATCH (n:Person) RETURN n.name`                                 | `["Alice", "Bob", "Charlie"]`                               |
| `WHERE`   | 过滤查询结果，类似于 SQL 的 `WHERE`。                           | `MATCH (n:Person) WHERE n.age > 25 RETURN n.name`                | `["Charlie"]`                                              |
| `WITH`    | 用于分步查询，支持传递数据到后续的查询。                        | `MATCH (n:Person) WITH n.age AS age RETURN avg(age)`             | `[26.67]` (假设三个年龄分别为 25, 30, 28)                  |
| `OPTIONAL MATCH` | 类似于 `MATCH`，但如果没有匹配到结果时返回 `null`，避免完全丢失结果。| `MATCH (n:Person) OPTIONAL MATCH (n)-[:FRIEND]->(f:Person) RETURN n.name, f.name` | `[["Alice", "Bob"], ["Bob", "Charlie"]]`                    |
| `UNION`   | 将多个查询结果合并为一个结果集，类似于 SQL 的 `UNION`。        | `MATCH (n:Person) WHERE n.age > 25 RETURN n.name UNION MATCH (n:Person) WHERE n.age <= 25 RETURN n.name` | `["Alice", "Charlie", "Bob"]`                             |
| `ORDER BY`| 对查询结果进行排序。                                           | `MATCH (n:Person) RETURN n.name ORDER BY n.age DESC`            | `["Charlie", "Bob", "Alice"]`                              |
| `LIMIT`   | 限制查询结果的数量。                                           | `MATCH (n:Person) RETURN n.name LIMIT 2`                         | `["Alice", "Bob"]`                                          |
| `SKIP`    | 跳过查询结果的前 N 条记录。                                    | `MATCH (n:Person) RETURN n.name SKIP 1`                          | `["Bob", "Charlie"]`                                       |
| `COLLECT` | 将查询结果收集到列表中，通常用于聚合操作。                      | `MATCH (n:Person)-[:FRIEND]->(f:Person) RETURN n.name, collect(f.name)` | `[["Alice", ["Bob", "Charlie"]], ["Bob", ["Alice"]]]`       |
| `DISTINCT`| 去除重复的结果。                                               | `MATCH (n:Person) RETURN DISTINCT n.name`                       | `["Alice", "Bob", "Charlie"]`                               |
| `EXPLAIN` | 查看查询计划，帮助分析查询的性能。                            | `EXPLAIN MATCH (n:Person) RETURN n.name`                         | 查询计划的详细输出（无实际数据返回）                      |
| `PROFILE` | 查看查询的执行计划及其详细的执行统计。                        | `PROFILE MATCH (n:Person) RETURN n.name`                         | 查询计划的详细执行统计（包含时间、扫描量等信息）          |

这些语句提供了图形数据库操作的核心功能，可以根据实际情况进行灵活组合和优化。

# chat

## match 和 optional match 有啥区别，不太明白？

`MATCH` 和 `OPTIONAL MATCH` 在 Neo4j 中的主要区别在于**匹配失败时的行为**：

- **`MATCH`**：只会返回完全匹配的节点或关系。如果查询条件无法找到匹配的数据，**查询将不会返回任何结果**。
- **`OPTIONAL MATCH`**：即使没有找到匹配的节点或关系，查询也会返回结果，未找到匹配的部分将返回 `null`。

### 1. **`MATCH`** 的行为
`MATCH` 是标准的查询操作，要求匹配的节点或关系必须存在。如果没有找到匹配，查询会**返回空结果集**。

#### 例子：
假设有一个图数据库，包含如下数据：

- `Alice` 和 `Bob` 都是 `Person` 类型的节点。
- `Alice` 和 `Bob` 之间有一个 `FRIEND` 关系。

```cypher
MATCH (n:Person) 
WHERE n.name = "Alice" 
RETURN n.name
```
**返回结果**:
```
["Alice"]
```

如果我们修改查询条件，查找 `Charlie`，一个不存在的节点：

```cypher
MATCH (n:Person) 
WHERE n.name = "Charlie" 
RETURN n.name
```
**返回结果**:
```
[]  (空结果集)
```

### 2. **`OPTIONAL MATCH`** 的行为
`OPTIONAL MATCH` 用于查找节点或关系时，即使没有找到匹配的部分，查询仍会返回结果。未找到的部分会返回 `null`。这在需要进行“可选”匹配的场景下很有用，比如查找一个节点的所有朋友，但有些节点可能没有朋友。

#### 例子：
继续使用相同的图数据，假设我们想要查找每个 `Person` 节点及其所有的 `FRIEND` 关系。如果某个节点没有朋友，我们仍然希望返回该节点（即使没有找到朋友），而不是完全丢失这个节点。

```cypher
OPTIONAL MATCH (n:Person) 
OPTIONAL MATCH (n)-[:FRIEND]->(f:Person) 
RETURN n.name, f.name
```
**返回结果**:
```
+--------------------------+
| n.name   | f.name        |
+--------------------------+
| "Alice"  | "Bob"         |
| "Bob"    | NULL          |
+--------------------------+
```

- **`Alice`** 有一个朋友 `Bob`，因此返回了 `Alice` 和 `Bob` 的名字。
- **`Bob`** 没有朋友，所以 `f.name` 返回了 `NULL`。

### 主要区别：
- **`MATCH`**：必须找到符合条件的节点或关系，否者**返回空结果**。
- **`OPTIONAL MATCH`**：即使某些部分没有匹配，**依然返回结果**，缺失的部分会显示为 `NULL`。

### 使用场景：
- 使用 `MATCH` 当你确信每个查询条件都应当匹配时。
- 使用 `OPTIONAL MATCH` 当你有些条件是“可选”的，或者你希望在没有找到匹配时也返回节点（例如，查找有朋友的人以及没有朋友的人）。


# 参考资料

* any list
{:toc}

