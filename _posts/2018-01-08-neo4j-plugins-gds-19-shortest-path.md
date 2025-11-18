---
layout: post
title:  Neo4j GDS-19-neo4j GDS 库最短路径
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---


# neo4j apoc 系列

[Neo4j APOC-01-图数据库 apoc 插件介绍](https://houbb.github.io/2018/01/08/neo4j-plugins-apoc-01-intro)

[Neo4j GDS-01-graph-data-science 图数据科学插件库概览](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-01-overview)

[Neo4j GDS-02-graph-data-science 插件库安装实战笔记](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-02-install-inaction)

[Neo4j GDS-03-graph-data-science 简单聊一聊图数据科学插件库](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-03-intro-chat)

[Neo4j GDS-04-图的中心性分析介绍](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-04-chat-middle-analysis-intro)

[Neo4j GDS-05-neo4j中的中心性分析算法](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-04-chat-middle-analysis-impl)

[Neo4j GDS-06-neo4j GDS 库中社区检测算法介绍](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-06-chat-community-detection-intro)

[Neo4j GDS-07-neo4j GDS 库中社区检测算法实现](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-07-chat-community-detection-impl)

[Neo4j GDS-08-neo4j GDS 库中路径搜索算法介绍](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-08-chat-path-search-intro)

[Neo4j GDS-09-neo4j GDS 库中路径搜索算法实现](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-09-chat-path-search-impl)

[Neo4j GDS-10-neo4j GDS 库中相似度算法介绍](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-10-chat-similar-intro)

[Neo4j GDS-11-neo4j GDS 库中相似度算法实现](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-11-chat-similar-impl)

[Neo4j GDS-12-neo4j GDS 库中节点插入（Node Embedding）算法介绍](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-12-chat-node-embedding-intro)

[Neo4j GDS-13-neo4j GDS 库中节点插入算法实现](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-13-chat-node-embedding-impl)

[Neo4j GDS-14-neo4j GDS 库中链接预测算法介绍](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-14-chat-link-pre-intro)

[Neo4j GDS-15-neo4j GDS 库中链接预测算法实现](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-15-chat-link-pre-impl)

[Neo4j GDS-16-neo4j GDS 库创建 graph 图投影](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-16-chat-create-graph)

[Neo4j GDS-17-neo4j GDS 库创建 graph 图投影更复杂的场景](https://houbb.github.io/2018/01/08/neo4j-plugins-gds-17-chat-create-graph-more)


# 背景介绍

我们从问题的最开始重新思考一下这个问题。场景是期望实现根因分析，找到根因节点。

但是图节点比较多，所以只关心和 alarm 相关的节点。问题是如果只关心和 alarm 相关的节点，会导致一些节点的关系丢失。

比如 alarm5->app5，但是实际上 app5->i_vm->i_phy 就丢失了。

可以借用 neo4j 图数据库的 apoc+gds 库。

深度一步步思考，这个应该如何实现才最好？

## 数据初始化

### 节点说明

i_alarm 告警信息。有 appName、ip、title、eventId 属性。i_alarm 根据 appName 指向 i_app 节点，ip 指向 i_vm 或者 i_phy。

i_app 应用节点。有 appName 属性。i_app 指向 i_vm

i_vm 虚拟机节点。有 ip 属性。i_vm 指向 i_phy

i_phy 物理机节点。有 ip 属性。

### 基础节点初始化

创建 4 个 i_app 节点，分别指向 4 个 i_vm。

2个 i_vm 一组，分别指向 i_phy 节点。

给出 cypher 初始化语句

```
CREATE (phy1:i_phy {ip: '192.168.1.1'}),
       (phy2:i_phy {ip: '192.168.1.2'}),

(vm1:i_vm {ip: '10.0.0.1'})-[:BELONGS_TO]->(phy1),
(vm2:i_vm {ip: '10.0.0.2'})-[:BELONGS_TO]->(phy1),
(vm3:i_vm {ip: '10.0.0.3'})-[:BELONGS_TO]->(phy2),
(vm4:i_vm {ip: '10.0.0.4'})-[:BELONGS_TO]->(phy2),

(app1:i_app {name: 'app1'})-[:POINTS_TO]->(vm1),
(app2:i_app {name: 'app2'})-[:POINTS_TO]->(vm2),
(app3:i_app {name: 'app3'})-[:POINTS_TO]->(vm3),
(app4:i_app {name: 'app4'})-[:POINTS_TO]->(vm4);
```

### 告警1

要求：

帮我给出对应的 i_alarm 的 cypher 语句。

alarm1 指向 app1, vm1; 

alarm2 指向 app2, vm2;

alarm3 指向 phy1

alarm4 指向 app3, vm3

#### 语句

```
// Alarm1：指向 app1, vm1
CREATE (a1:i_alarm {
    eventId: 'alarm1',
    appName: 'app1',
    ip: '10.0.0.1',
    title: 'Alarm 1'
})
WITH a1
MATCH (app1:i_app {name: 'app1'}), (vm1:i_vm {ip: '10.0.0.1'})
MERGE (a1)-[:ALARM_OF_APP]->(app1)
MERGE (a1)-[:ALARM_OF_VM]->(vm1);



// Alarm2：指向 app2, vm2
CREATE (a2:i_alarm {
    eventId: 'alarm2',
    appName: 'app2',
    ip: '10.0.0.2',
    title: 'Alarm 2'
})
WITH a2
MATCH (app2:i_app {name: 'app2'}), (vm2:i_vm {ip: '10.0.0.2'})
MERGE (a2)-[:ALARM_OF_APP]->(app2)
MERGE (a2)-[:ALARM_OF_VM]->(vm2);



// Alarm3：仅指向 phy1
CREATE (a3:i_alarm {
    eventId: 'alarm3',
    appName: null,
    ip: '192.168.1.1',
    title: 'Alarm 3'
})
WITH a3
MATCH (phy1:i_phy {ip: '192.168.1.1'})
MERGE (a3)-[:ALARM_OF_PHY]->(phy1);



// Alarm4：指向 app3, vm3
CREATE (a4:i_alarm {
    eventId: 'alarm4',
    appName: 'app3',
    ip: '10.0.0.3',
    title: 'Alarm 4'
})
WITH a4
MATCH (app3:i_app {name: 'app3'}), (vm3:i_vm {ip: '10.0.0.3'})
MERGE (a4)-[:ALARM_OF_APP]->(app3)
MERGE (a4)-[:ALARM_OF_VM]->(vm3);
```

### 告警2

追加一个只只想 app 的告警

```neo4j
// 新增 app5 -> vm5 -> phy1
MATCH (phy1:i_phy {ip: '192.168.1.1'})
CREATE (vm5:i_vm {ip: '10.0.0.5'})-[:BELONGS_TO]->(phy1),
       (app5:i_app {name: 'app5'})-[:POINTS_TO]->(vm5);


// Alarm5：仅指向 app5
CREATE (a5:i_alarm {
    eventId: 'alarm5',
    appName: 'app5',
    title: 'Alarm 5'
})
WITH a5
MATCH (app5:i_app {name: 'app5'})
MERGE (a5)-[:ALARM_OF_APP]->(app5);
```



# v1-直接基于告警的

基于 APOC 查询得到的“告警直接关联基础节点来创建 GDS 图，并直接运行 PageRank 做排序。

下面给你一个完整示例流程：

---

## 1️⃣ 创建 GDS 图（基于 APOC 查询结果）

```cypher
CALL gds.graph.project.cypher(
    'alarm_graph_apoc',
    
    // 节点查询：从告警出发，获取直接关联基础节点（i_app/i_vm/i_phy）
    '
    MATCH (start:i_alarm)
    CALL apoc.path.expandConfig(start, {
        relationshipFilter: ">",              // 所有关系方向
        labelFilter: "/i_app|/i_vm/|i_phy",    // 终止节点类型
        minLevel: 1,                          // 最小深度1（排除仅告警节点）
        maxLevel: 1,                          // 最大深度5，可根据实际控制
        uniqueness: "NODE_GLOBAL"             // 全局去重
    }) YIELD path
    UNWIND nodes(path) AS node
    RETURN DISTINCT id(node) AS id, labels(node) AS labels
    ',

    // 关系查询：同样从 APOC 子图展开
    '
    MATCH (start:i_alarm)
    CALL apoc.path.expandConfig(start, {
        relationshipFilter: ">",
        labelFilter: "/i_app|/i_vm/|i_phy",    // 终止节点类型
        minLevel: 1,
        maxLevel: 1,
        uniqueness: "NODE_GLOBAL"
    }) YIELD path
    UNWIND relationships(path) AS rel
    RETURN DISTINCT id(startNode(rel)) AS source, id(endNode(rel)) AS target, type(rel) AS type
    '
);
```

### 说明：

1. `apoc.path.expandConfig` 控制：

   * `minLevel=1` / `maxLevel=1`：只获取告警直接关联的基础节点（app/vm/phy）
   * `uniqueness=NODE_GLOBAL`：全局去重
   * `labelFilter="/i_phy|/i_vm|/i_app"`：终止节点只保留这些类型

2. 关系投影中用 `nodes` 集合保证只保留子图内关系。

---

## 2️⃣ PageRank 排序（根因分析示例）

```cypher
CALL gds.pageRank.stream('alarm_graph_apoc')
YIELD nodeId, score
RETURN 
    gds.util.asNode(nodeId).eventId AS alarm,
    gds.util.asNode(nodeId).name AS app,
    gds.util.asNode(nodeId).ip AS ip,
    gds.util.asNode(nodeId).title AS title,
    score
ORDER BY score DESC;
```

* 得分高的节点通常是潜在根因节点
* 即便告警只关联应用或 VM，也能被计算到
* 输出中会显示告警节点及直接关联的 app/vm/phy 节点属性

### 验证结果

这个效果很差，不符合预期。

## 删除

```
CALL gds.graph.drop('alarm_graph_apoc'); 
```




# 参考资料

https://neo4j.ac.cn/docs/graph-data-science/current/algorithms/delta-single-source/

https://github.com/neo4j/graph-data-science


* any list
{:toc}


