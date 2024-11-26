---
layout: post
title:  Neo4j-21-neo4j shell 删除指定的实体+关系
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j, go, go-lang]
published: true
---

# 删除实体

```cypher
match(n:Peson) delete n;
```

# 删除实体+关系

如果实体包含关系，直接删除时无法删除的，可以用级联删除。

```cypher
match(n:Peson) detach delete n;
```

# match(n:实体) detach delete n; 会把对应的索引也删除吗？

`MATCH (n:实体) DETACH DELETE n;` 这条 Cypher 查询的作用是删除指定标签的节点（在此例中是 `实体` 标签的节点），并且删除节点与其他节点之间的所有关系。但 **它不会删除索引**。

### 解释：
- `MATCH (n:实体)`：匹配所有标签为 `实体` 的节点。
- `DETACH DELETE n`：删除节点 `n` 和与其相关的所有关系。`DETACH` 关键字确保关系也被删除，因为节点删除时不能有剩余的关系。

### 重要点：
- **索引不会被删除**：执行此操作只会删除节点及其关联的关系。索引和约束是独立于节点和关系的数据结构，因此删除节点时不会影响索引的存在或结构。
- **删除索引**：如果你希望删除某个索引或约束，你需要使用专门的命令。例如，删除索引的命令如下：

```cypher
DROP INDEX ON :实体(属性名);
```

或者，如果你是删除一个名称为 `entity_index` 的索引：

```cypher
DROP INDEX entity_index;
```

### 总结：

使用 `DETACH DELETE` 删除节点和关系时，**不会影响现有的索引**。

索引需要通过专门的命令删除。

如果你不想保留索引，需要手动执行删除索引的命令。

# 参考资料

* any list
{:toc}

