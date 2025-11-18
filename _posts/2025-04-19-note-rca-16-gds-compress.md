---
layout: post
title: RCA 根因分析推断-16-最有可能的根因节点列表
date: 2025-4-19 14:31:52 +0800
categories: [Note]
tags: [note, rca, ai, devops, alarm, sh]
published: true
---

# 背景

如何从告警出发，找到所有的告警关联信息。

然后通过 pageRank 获取到最可能得根因呢。

# chat

## 也不需要 java 去做。这些步骤都是 neo4j +apoc+gds 实现也行。java 只是调用触发。重新给出实现

下面给你一套 **完全“图数据库内完成”、Java 只负责触发** 的做法：

**报警 → 找关联节点 → 压缩图 → 在临时子图上跑 GDS 算法 → 得到根因节点**

整个 pipeline 全在 Neo4j + APOC + GDS 完成。

我会先给你整体架构，再给你每个步骤的 Cypher + APOC + GDS 示例，最后给你 Java 调用方式。

---

# ✅ 0. 整体核心思想（非常关键）

报警触发后，你要：

1. **找与 Alarm 相关的所有节点**（最多向下 5 层）。
2. **对这些节点的真实路径进行抽象压缩**（如 App → VM → Phy 被压缩为 App → Phy）。
3. **用压缩后的图构建一个“虚拟临时子图”**（GDS 图投影）。
4. **在临时图上跑根因算法**：

   * PageRank（传播性质）
   * BetweennessCentrality（中间关键节点）
   * DegreeCentrality（结构性根因）
   * 或者多算法融合

最终得到 **最有可能的根因节点列表**。

---

# ✅ 1. 步骤一：基于报警找关联节点（最多 5 层）

```cypher
// Step 1：找到 Alarm 关联的所有节点（深度 <= 5）
MATCH (a:Alarm {id:$alarmId})-[:ALARM_REL]->(n)
CALL apoc.path.subgraphNodes(n, {
    relationshipFilter:"DEPENDS_ON>",
    minLevel:1,
    maxLevel:5,
    bfs:true
})
YIELD node AS related
RETURN collect(DISTINCT related) AS relatedNodes;
```

---

# ✅ 2. 步骤二：基于真实路径“压缩边”（App→VM→Phy → App→Phy）

关系压缩方式：

```
对于所有相关节点，两两求 shortestPath
如果 path.len > 1，则压缩成一条虚拟边 a → b
```

示例：

```cypher
// Step 2：压缩边，得到虚拟的影响关系
MATCH (a:Alarm {id:$alarmId})-[:ALARM_REL]->(start)
CALL apoc.path.subgraphNodes(start, {
    relationshipFilter:"DEPENDS_ON>",
    minLevel:1,
    maxLevel:5
})
YIELD node
WITH collect(node) AS nodes

UNWIND nodes AS n1
UNWIND nodes AS n2
WITH n1, n2 WHERE id(n1) < id(n2)

MATCH p = shortestPath((n1)-[:DEPENDS_ON*..10]-(n2))
WITH n1 AS from, n2 AS to, p
// 创建虚拟边
CALL apoc.create.vRelationship(from, "VIRTUAL_DEPENDS_ON", {}, to)
YIELD rel
RETURN rel;
```

得到的就是一个“压缩后的临时图”，包含的边：

```
App —VM—Phy     →   App → Phy（虚拟）
App — DB        →   App → DB（虚拟）
...
```

---

# ✅ 3. 步骤三：创建 GDS 临时图（Projected Graph）

你不想污染生产图，因此我们用 GDS 的 **in-memory graph projection**：

```cypher
CALL gds.graph.drop("alarmGraph", false);

CALL gds.graph.project(
    "alarmGraph",
    ["App","VM","Phy","DB","Switch","Router"],   // or use wildcard ['*']
    {
        VIRTUAL_DEPENDS_ON: {
            orientation:"NATURAL",
            properties: {}
        }
    }
);
```

如果你只想基于“报警关联节点”投影：

```cypher
// 限定节点
WITH $relatedNodeIds AS ids
CALL gds.graph.project(
    "alarmGraph",
    {
        Node: {
            label:"*",
            properties:["name","type"],
            where: "id(n) IN ids"
        }
    },
    "VIRTUAL_DEPENDS_ON"
);
```

---

# ✅ 4. 步骤四：在临时图上跑根因分析算法

### 📌 **最常见的根因分析算法：PageRank**

「越是被依赖、越是全局影响力强的节点越可能是根因」

```cypher
CALL gds.pageRank.stream("alarmGraph")
YIELD nodeId, score
RETURN gds.util.asNode(nodeId) AS node, score
ORDER BY score DESC
LIMIT 5;
```

---

### 📌 **Betweenness Centrality：关键瓶颈点**

```cypher
CALL gds.betweenness.stream("alarmGraph")
YIELD nodeId, score
RETURN gds.util.asNode(nodeId) AS node, score
ORDER BY score DESC
LIMIT 5;
```

---

### 📌 **Degree 中心性（简单有效）**

```cypher
CALL gds.degree.stream("alarmGraph")
YIELD nodeId, score
RETURN gds.util.asNode(nodeId) AS node, score
ORDER BY score DESC;
```

---

### 📌 推荐：多算法融合（更准）

例如：

```cypher
CALL gds.pageRank.stream("alarmGraph")
YIELD nodeId, score AS pr
WITH nodeId, pr

CALL gds.degree.stream("alarmGraph")
YIELD nodeId AS nid2, score AS deg
WHERE nid2 = nodeId

RETURN gds.util.asNode(nodeId) AS node,
       pr, deg,
       (pr*0.7 + deg*0.3) AS finalScore
ORDER BY finalScore DESC
LIMIT 5;
```

---

# ✅ 5. 步骤五：Java 调用非常简单

你只需要执行 3 个 cypher：

### ① 查询关联节点

```java
session.run("MATCH ... RETURN relatedNodes");
```

### ② 调用“边压缩 + 创建虚拟边”的 cypher

```java
session.run("UNWIND ... MATCH p = shortestPath ... CALL apoc.create.vRelationship ...");
```

### ③ 调用 GDS 算法

```java
session.run("CALL gds.pageRank.stream('alarmGraph') ...");
```

不需要 Java 来做图结构处理，所有复杂逻辑都在 Neo4j 内部完成。

---

# ✅ 6. 最终结果

你可以取得：

* 影响力最大的节点（根因）
* 每个节点的 PageRank
* 虚拟压缩图的关系（可用于可视化）
* 关联子图（alarm 影响范围）

全自动，一次报警即可得到：

```
根因节点：Phy:Server-3  
得分：0.122
```

---

# 如果你愿意，我可以继续帮你做：

✔ 完整的“报警根因分析”模块设计图
✔ Cypher 查询 + Java 封装的 AlarmService
✔ GDS 多模型融合的“生产级根因分析算法”


# 参考资料


* any list
{:toc}