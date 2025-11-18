---
layout: post
title:  Neo4j GDS-18-neo4j GDS 库创建全局的图+压缩路径+子图效果渲染
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

# 实际测试

## 数据初始化

### 节点清空

注意：这里会清空所有数据，主要是为了演示。实际不要轻易使用！

```
match(n) detach delete n
```

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

## 告警1

要求：

帮我给出对应的 i_alarm 的 cypher 语句。

alarm1 指向 app1, vm1; 

alarm2 指向 app2, vm2;

alarm3 指向 phy1

alarm4 指向 app3, vm3

### 语句

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

## 告警2

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


## APOC 查询全部告警关联的

```
MATCH (start:i_alarm)
CALL apoc.path.expandConfig(start, {
    relationshipFilter: '>',       // 只沿单向关系
    labelFilter: '/i_phy|/i_vm|/i_app',         // 可选：只过滤到 i_phy 节点，如果需要可以改成 null
    minLevel: 1,                   // 最小深度
    maxLevel: 1,                   // 最大深度
    uniqueness: 'NODE_GLOBAL'      // 节点全局去重
}) YIELD path
UNWIND nodes(path) AS node
RETURN DISTINCT nodes(path) AS nodes, relationships(path) AS rels;
```

但是存在一个问题，i_alarm 中 alarm5 只和 app5 有关系，但是 app5 和其他的比如 i_phy 的关系却断开了。 

如何把应该存在关系的节点连上呢？可以用 apoc + gds 分成多步来实现。



# 换一种思路

## 思路

我们来换一种思路，先查询到和 alarm 直接关联的全部节点：

```
MATCH (start:i_alarm)
CALL apoc.path.expandConfig(start, {
    relationshipFilter: '>',       // 只沿单向关系
    labelFilter: '/i_phy|/i_vm|/i_app',         // 可选：只过滤到 i_phy 节点，如果需要可以改成 null
    minLevel: 1,                   // 最小深度
    maxLevel: 1,                   // 最大深度
    uniqueness: 'NODE_GLOBAL'      // 节点全局去重
}) YIELD path
UNWIND nodes(path) AS node
RETURN DISTINCT nodes(path) AS nodes, relationships(path) AS rels;
```

然后根据已有的这些节点，构建节点之间的最短路径关系。比如 alarm5->app5->i_vm->i_phy。

那就直接返回 alarm5->app5->i_phy。

从而构建出一个完整的关系、剔除无关节点的子图。给出实现方式、分步走

明白了，你想换一种思路：

* **第一步**：找到和 `alarm` 直接关联的节点
* **第二步**：在这些节点之间构建最短路径（跳过中间未关联节点），得到“压缩子图”
* **第三步**：返回节点 + 逻辑关系，用于可视化

下面我给你整理一个**分步实现方案**。

---

## Step 1：查询 alarm 直接关联的节点

```cypher
MATCH (start:i_alarm)
CALL apoc.path.expandConfig(start, {
    relationshipFilter: '>',               // 只沿单向关系
    labelFilter: '/i_phy|/i_vm|/i_app',   // 只保留这几类节点
    minLevel: 1,
    maxLevel: 1,                           // 只找直接关联
    uniqueness: 'NODE_GLOBAL'
}) YIELD path
UNWIND nodes(path) AS node
RETURN DISTINCT start AS alarm, collect(DISTINCT node) AS directNodes;
```

* 得到每个 `alarm` 直接关联的节点集合
* 例如 `alarm5 -> app5`，`alarm1 -> app1` 等

---

## Step 2：生成告警关联节点集合

* 把所有告警关联节点放到一个集合 `relatedNodes` 中
* 用于下一步构建子图

```cypher
MATCH (start:i_alarm)
CALL apoc.path.expandConfig(start, {
    relationshipFilter: '>',
    labelFilter: '/i_phy|/i_vm|/i_app',
    minLevel: 1,
    maxLevel: 1,
    uniqueness: 'NODE_GLOBAL'
}) YIELD path
UNWIND nodes(path) AS node
WITH collect(DISTINCT node) + collect(DISTINCT start) AS relatedNodes
RETURN relatedNodes;
```

* 注意要把 `alarm` 本身也加入集合

---

## Step 3：在这些节点之间构建最短路径

* 遍历 `alarm -> directNodes`
* 用 `apoc.algo.dijkstra` 或 `shortestPath` 找最短路径
* 跳过未关联节点（只允许在 `relatedNodes` 中经过）

```cypher
WITH $relatedNodes AS nodes
UNWIND [n IN nodes WHERE 'i_alarm' IN labels(n)] AS alarmNode
UNWIND [n IN nodes WHERE 'i_app' IN labels(n) OR 'i_phy' IN labels(n)] AS targetNode
CALL apoc.algo.dijkstra(alarmNode, targetNode, '>', 'weight') YIELD path, weight
RETURN DISTINCT nodes(path) AS nodes, relationships(path) AS rels;
```

* 这里 `weight` 可以默认 1（或直接忽略）
* 只会经过 `relatedNodes` 中的节点
* 中间未关联节点（例如 vm5）被跳过

---

## Step 4：整合成完整子图

* 所有最短路径 `nodes(path)` + `relationships(path)` 合并
* 得到完整的告警压缩子图

```cypher
MATCH (start:i_alarm)
CALL apoc.path.expandConfig(start, {
    relationshipFilter: '>',
    labelFilter: '/i_phy|/i_vm|/i_app',
    minLevel: 1,
    maxLevel: 1,
    uniqueness: 'NODE_GLOBAL'
}) YIELD path
UNWIND nodes(path) AS node
WITH collect(DISTINCT node) + collect(DISTINCT start) AS relatedNodes

UNWIND [n IN relatedNodes WHERE 'i_alarm' IN labels(n)] AS alarmNode
UNWIND [n IN relatedNodes WHERE 'i_app' IN labels(n) OR 'i_phy' IN labels(n)] AS targetNode
CALL apoc.algo.dijkstra(alarmNode, targetNode, '>', 'weight') YIELD path, weight
RETURN DISTINCT nodes(path) AS nodes, relationships(path) AS rels;
```


## 微调

`UNWIND [n IN nodes WHERE 'i_app' IN labels(n) OR 'i_phy' IN labels(n)] AS targetNode` 

很接近了。

这里微调一下，改为不是 i_alarm 的作为 targetNode。

适用性更强一些。

```
// Step 1：找到 alarm 直接关联的节点集合
MATCH (start:i_alarm)
CALL apoc.path.expandConfig(start, {
    relationshipFilter: '>',               // 只沿单向关系
    labelFilter: '/i_phy|/i_vm|/i_app',   // 只保留这些节点
    minLevel: 1,
    maxLevel: 1,                           // 只找直接关联
    uniqueness: 'NODE_GLOBAL'
}) YIELD path
UNWIND nodes(path) AS node
WITH collect(DISTINCT node) + collect(DISTINCT start) AS relatedNodes

// Step 2：为每个 alarm 构建压缩路径到非 i_alarm 节点
UNWIND [n IN relatedNodes WHERE 'i_alarm' IN labels(n)] AS alarmNode
UNWIND [n IN relatedNodes WHERE NOT 'i_alarm' IN labels(n)] AS targetNode
CALL apoc.algo.dijkstra(alarmNode, targetNode, '>', 'weight') YIELD path, weight

// Step 3：返回压缩子图
RETURN DISTINCT nodes(path) AS nodes, relationships(path) AS rels;
```

实际上这个还是不够完美，因为 i_alarm->i_vm->i_phy 是最短路径上返回的。



# 图效果

## 基础效果

<svg xmlns="http://www.w3.org/2000/svg" width="626.0670166015625" height="329.1836242675781" viewBox="-337.26129150390625 -215.42015075683594 626.0670166015625 329.1836242675781"><title>Neo4j Graph Visualization</title><desc>Created using Neo4j (http://www.neo4j.com/)</desc><g class="layer relationships"><g class="relationship" transform="translate(-308.2612808863492 -35.83074177557694) rotate(292.0688652096119)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 45.23655763911404 0.5 L 45.23655763911404 -0.5 L 25 -0.5 Z M 94.51161257075466 0.5 L 114.7481702098687 0.5 L 114.7481702098687 3.5 L 121.7481702098687 0 L 114.7481702098687 -3.5 L 114.7481702098687 -0.5 L 94.51161257075466 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="69.87408510493435" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(-198.23521641662313 84.76344814459793) rotate(304.7116561672942)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 43.34889146483535 0.5 L 43.34889146483535 -0.5 L 25 -0.5 Z M 92.62394639647597 0.5 L 110.97283786131132 0.5 L 110.97283786131132 3.5 L 117.97283786131132 0 L 110.97283786131132 -3.5 L 110.97283786131132 -0.5 L 92.62394639647597 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="67.98641893065566" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(169.36826867559802 -118.9958273189985) rotate(413.542850479672)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 44.08434175803977 0.5 L 44.08434175803977 -0.5 L 25 -0.5 Z M 101.11051058128196 0.5 L 120.19485233932173 0.5 L 120.19485233932173 3.5 L 127.19485233932173 0 L 120.19485233932173 -3.5 L 120.19485233932173 -0.5 L 101.11051058128196 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="72.59742616966086" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(122.20129360146629 54.1988405117219) rotate(339.74297417685034)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 41.3251777150371 0.5 L 41.3251777150371 -0.5 L 25 -0.5 Z M 98.35134653827929 0.5 L 114.67652425331639 0.5 L 114.67652425331639 3.5 L 121.67652425331639 0 L 114.67652425331639 -3.5 L 114.67652425331639 -0.5 L 98.35134653827929 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="69.8382621266582" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(-253.12495158750258 -171.8271044158834) rotate(354.2653683192584)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 41.00966441401732 0.5 L 41.00966441401732 -0.5 L 25 -0.5 Z M 98.03583323725951 0.5 L 114.04549765127683 0.5 L 114.04549765127683 3.5 L 121.04549765127683 0 L 114.04549765127683 -3.5 L 114.04549765127683 -0.5 L 98.03583323725951 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="69.52274882563842" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(-116.81979607083336 -32.76425793373567) rotate(273.3556302839496)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 44.946809222489904 0.5 L 44.946809222489904 -0.5 L 25 -0.5 Z M 101.97297804573209 0.5 L 121.919787268222 0.5 L 121.919787268222 3.5 L 128.919787268222 0 L 121.919787268222 -3.5 L 121.919787268222 -0.5 L 101.97297804573209 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="73.459893634111" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(15.867927728337605 -104.77897382806029) rotate(354.70849064102265)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 48.94112326528031 0.5 L 48.94112326528031 -0.5 L 25 -0.5 Z M 98.21617819692094 0.5 L 122.15730146220125 0.5 L 122.15730146220125 3.5 L 129.15730146220125 0 L 122.15730146220125 -3.5 L 122.15730146220125 -0.5 L 98.21617819692094 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="73.57865073110062" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(16.61752710547063 48.827224693689686) rotate(362.9124343852476)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 25.97054194546604 0.5 L 25.97054194546604 -0.5 L 25 -0.5 Z M 72.74977778530979 0.5 L 73.72031973077583 0.5 L 73.72031973077583 3.5 L 80.72031973077583 0 L 73.72031973077583 -3.5 L 73.72031973077583 -0.5 L 72.74977778530979 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="49.360159865387914" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_…</text></g></g><g class="layer nodes"><g class="node" aria-label="graph-node0" transform="translate(-308.2612808863492,-35.83074177557694)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app3</text></g><g class="node" aria-label="graph-node1" transform="translate(-198.23521641662313,84.76344814459793)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app4</text></g><g class="node" aria-label="graph-node10" transform="translate(259.8057115345477,3.4147196437618472)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F79767" stroke="#f36924" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node11" transform="translate(-107.81035970665067,-186.4201428490049)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F79767" stroke="#f36924" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node12" transform="translate(169.36826867559802,-118.9958273189985)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.1</text></g><g class="node" aria-label="graph-node13" transform="translate(122.20129360146629,54.1988405117219)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.2</text></g><g class="node" aria-label="graph-node14" transform="translate(-253.12495158750258,-171.8271044158834)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.3</text></g><g class="node" aria-label="graph-node15" transform="translate(-116.81979607083336,-32.76425793373567)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.4</text></g><g class="node" aria-label="graph-node16" transform="translate(15.867927728337605,-104.77897382806029)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app1</text></g><g class="node" aria-label="graph-node17" transform="translate(16.61752710547063,48.827224693689686)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app2</text></g></g></svg>


## 报警节点效果

<svg xmlns="http://www.w3.org/2000/svg" width="686.1222534179688" height="485.59356689453125" viewBox="-367.51934814453125 -274.2845458984375 686.1222534179688 485.59356689453125"><title>Neo4j Graph Visualization</title><desc>Created using Neo4j (http://www.neo4j.com/)</desc><g class="layer relationships"><g class="relationship" transform="translate(-93.53614663263852 -110.29916995882928) rotate(232.4589627803657)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 42.89291590314673 0.5 L 42.89291590314673 -0.5 L 25 -0.5 Z M 92.16797083478735 0.5 L 110.06088673793408 0.5 L 110.06088673793408 3.5 L 117.06088673793408 0 L 110.06088673793408 -3.5 L 110.06088673793408 -0.5 L 92.16797083478735 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="67.53044336896704" y="3" transform="rotate(180 67.53044336896704 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(-297.97385524483565 167.36279072859597) rotate(253.92563649827838)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 45.079761775950445 0.5 L 45.079761775950445 -0.5 L 25 -0.5 Z M 94.35481670759107 0.5 L 114.43457848354151 0.5 L 114.43457848354151 3.5 L 121.43457848354151 0 L 114.43457848354151 -3.5 L 114.43457848354151 -0.5 L 94.35481670759107 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="69.71728924177076" y="3" transform="rotate(180 69.71728924177076 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(19.27551367834094 79.36946475937252) rotate(272.7889467454801)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 39.990296066513054 0.5 L 39.990296066513054 -0.5 L 25 -0.5 Z M 102.03396672080993 0.5 L 117.02426278732298 0.5 L 117.02426278732298 3.5 L 124.02426278732298 0 L 117.02426278732298 -3.5 L 117.02426278732298 -0.5 L 102.03396672080993 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="71.01213139366149" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_VM</text></g><g class="relationship" transform="translate(19.27551367834094 79.36946475937252) rotate(205.4476353611032)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 31.93264948048568 0.5 L 31.93264948048568 -0.5 L 25 -0.5 Z M 97.87233148732162 0.5 L 104.8049809678073 0.5 L 104.8049809678073 3.5 L 111.8049809678073 0 L 104.8049809678073 -3.5 L 104.8049809678073 -0.5 L 97.87233148732162 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="64.90249048390365" y="3" transform="rotate(180 64.90249048390365 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_APP</text></g><g class="relationship" transform="translate(289.602886236331 160.13630147177534) rotate(236.17548775891532)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 38.320008630697785 0.5 L 38.320008630697785 -0.5 L 25 -0.5 Z M 100.36367928499466 0.5 L 113.68368791569245 0.5 L 113.68368791569245 3.5 L 120.68368791569245 0 L 113.68368791569245 -3.5 L 113.68368791569245 -0.5 L 100.36367928499466 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="69.34184395784622" y="3" transform="rotate(180 69.34184395784622 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_VM</text></g><g class="relationship" transform="translate(289.602886236331 160.13630147177534) rotate(531.0373787549076)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 34.69234677687999 0.5 L 34.69234677687999 -0.5 L 25 -0.5 Z M 100.63202878371592 0.5 L 110.32437556059591 0.5 L 110.32437556059591 3.5 L 117.32437556059591 0 L 110.32437556059591 -3.5 L 110.32437556059591 -0.5 L 100.63202878371592 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="67.66218778029796" y="3" transform="rotate(180 67.66218778029796 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_APP</text></g><g class="relationship" transform="translate(284.38571076536465 -208.43185347385887) rotate(499.7302882644177)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 35.21093538305196 0.5 L 35.21093538305196 -0.5 L 25 -0.5 Z M 101.29459932348165 0.5 L 111.50553470653361 0.5 L 111.50553470653361 3.5 L 118.50553470653361 0 L 111.50553470653361 -3.5 L 111.50553470653361 -0.5 L 101.29459932348165 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.2527673532668" y="3" transform="rotate(180 68.2527673532668 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_PHY</text></g><g class="relationship" transform="translate(-32.05973096985243 -245.2845113457668) rotate(531.4173519480263)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 40.33559886531599 0.5 L 40.33559886531599 -0.5 L 25 -0.5 Z M 102.37926951961286 0.5 L 117.71486838492885 0.5 L 117.71486838492885 3.5 L 124.71486838492885 0 L 117.71486838492885 -3.5 L 117.71486838492885 -0.5 L 102.37926951961286 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="71.35743419246442" y="3" transform="rotate(180 71.35743419246442 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_VM</text></g><g class="relationship" transform="translate(-32.05973096985243 -245.2845113457668) rotate(474.48595793362693)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 37.69280470197019 0.5 L 37.69280470197019 -0.5 L 25 -0.5 Z M 103.63248670880613 0.5 L 116.32529141077632 0.5 L 116.32529141077632 3.5 L 123.32529141077632 0 L 116.32529141077632 -3.5 L 116.32529141077632 -0.5 L 103.63248670880613 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="70.66264570538816" y="3" transform="rotate(180 70.66264570538816 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_APP</text></g><g class="relationship" transform="translate(26.526599679021704 -69.47828514339166) rotate(342.7057675123415)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 45.68086939644735 0.5 L 45.68086939644735 -0.5 L 25 -0.5 Z M 102.70703821968954 0.5 L 123.38790761613689 0.5 L 123.38790761613689 3.5 L 130.38790761613689 0 L 123.38790761613689 -3.5 L 123.38790761613689 -0.5 L 102.70703821968954 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="74.19395380806844" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(208.50790463361673 39.110102309890124) rotate(257.7457849239207)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 47.18229955905488 0.5 L 47.18229955905488 -0.5 L 25 -0.5 Z M 104.20846838229707 0.5 L 126.39076794135195 0.5 L 126.39076794135195 3.5 L 133.39076794135195 0 L 126.39076794135195 -3.5 L 126.39076794135195 -0.5 L 104.20846838229707 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="75.69538397067598" y="3" transform="rotate(180 75.69538397067598 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(-180.09803570776648 -222.9416792548911) rotate(499.6344227343574)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 45.36165106402322 0.5 L 45.36165106402322 -0.5 L 25 -0.5 Z M 102.38781988726541 0.5 L 122.74947095128863 0.5 L 122.74947095128863 3.5 L 129.74947095128863 0 L 122.74947095128863 -3.5 L 122.74947095128863 -0.5 L 102.38781988726541 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="73.87473547564431" y="3" transform="rotate(180 73.87473547564431 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(-338.51935445118573 26.653344458061788) rotate(285.17520711554823)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 45.37009385773955 0.5 L 45.37009385773955 -0.5 L 25 -0.5 Z M 102.39626268098174 0.5 L 122.76635653872128 0.5 L 122.76635653872128 3.5 L 129.76635653872128 0 L 122.76635653872128 -3.5 L 122.76635653872128 -0.5 L 102.39626268098174 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="73.88317826936064" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(-104.25642458620672 20.586277994736314) rotate(325.4465109657601)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 51.25992993871684 0.5 L 51.25992993871684 -0.5 L 25 -0.5 Z M 100.53498487035746 0.5 L 126.7949148090743 0.5 L 126.7949148090743 3.5 L 133.7949148090743 0 L 126.7949148090743 -3.5 L 126.7949148090743 -0.5 L 100.53498487035746 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="75.89745740453715" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(149.01626490166984 182.30902752019216) rotate(292.56032084112104)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 49.395025986554515 0.5 L 49.395025986554515 -0.5 L 25 -0.5 Z M 98.67008091819514 0.5 L 123.06510690474965 0.5 L 123.06510690474965 3.5 L 130.06510690474965 0 L 123.06510690474965 -3.5 L 123.06510690474965 -0.5 L 98.67008091819514 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="74.03255345237483" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g></g><g class="layer nodes"><g class="node" aria-label="graph-node0" transform="translate(-93.53614663263852,-110.29916995882928)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app3</text></g><g class="node" aria-label="graph-node1" transform="translate(-297.97385524483565,167.36279072859597)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app4</text></g><g class="node" aria-label="graph-node2" transform="translate(19.27551367834094,79.36946475937252)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 1</text></g><g class="node" aria-label="graph-node3" transform="translate(289.602886236331,160.13630147177534)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 2</text></g><g class="node" aria-label="graph-node4" transform="translate(284.38571076536465,-208.43185347385887)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 3</text></g><g class="node" aria-label="graph-node5" transform="translate(-32.05973096985243,-245.2845113457668)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 4</text></g><g class="node" aria-label="graph-node10" transform="translate(174.8895332756604,-115.67181031652031)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F79767" stroke="#f36924" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node11" transform="translate(-298.00592160242644,-122.7162872449041)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F79767" stroke="#f36924" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node12" transform="translate(26.526599679021704,-69.47828514339166)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.1</text></g><g class="node" aria-label="graph-node13" transform="translate(208.50790463361673,39.110102309890124)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.2</text></g><g class="node" aria-label="graph-node14" transform="translate(-180.09803570776648,-222.9416792548911)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.3</text></g><g class="node" aria-label="graph-node15" transform="translate(-338.51935445118573,26.653344458061788)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.4</text></g><g class="node" aria-label="graph-node16" transform="translate(-104.25642458620672,20.586277994736314)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app1</text></g><g class="node" aria-label="graph-node17" transform="translate(149.01626490166984,182.30902752019216)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app2</text></g></g></svg>


## 追加告警 alarm5 之后的图

<svg xmlns="http://www.w3.org/2000/svg" width="758.653564453125" height="712.2973022460938" viewBox="-453.8178405761719 -435.9440612792969 758.653564453125 712.2973022460938"><title>Neo4j Graph Visualization</title><desc>Created using Neo4j (http://www.neo4j.com/)</desc><g class="layer relationships"><g class="relationship" transform="translate(-337.22619110773155 129.43720782743236) rotate(229.95735040884432)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 39.93628715507519 0.5 L 39.93628715507519 -0.5 L 25 -0.5 Z M 89.21134208671582 0.5 L 104.14762924179101 0.5 L 104.14762924179101 3.5 L 111.14762924179101 0 L 104.14762924179101 -3.5 L 104.14762924179101 -0.5 L 89.21134208671582 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="64.5738146208955" y="3" transform="rotate(180 64.5738146208955 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(-6.506399702198144 150.98095906246445) rotate(535.3058759676526)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 43.15044376903349 0.5 L 43.15044376903349 -0.5 L 25 -0.5 Z M 92.42549870067411 0.5 L 110.5759424697076 0.5 L 110.5759424697076 3.5 L 117.5759424697076 0 L 110.5759424697076 -3.5 L 110.5759424697076 -0.5 L 92.42549870067411 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="67.7879712348538" y="3" transform="rotate(180 67.7879712348538 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(-8.216325609670207 -63.152394596526484) rotate(276.9751321749062)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 34.85491275794894 0.5 L 34.85491275794894 -0.5 L 25 -0.5 Z M 96.89858341224581 0.5 L 106.75349617019475 0.5 L 106.75349617019475 3.5 L 113.75349617019475 0 L 106.75349617019475 -3.5 L 106.75349617019475 -0.5 L 96.89858341224581 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="65.87674808509738" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_VM</text></g><g class="relationship" transform="translate(-8.216325609670207 -63.152394596526484) rotate(214.17021066233656)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 37.13789659500499 0.5 L 37.13789659500499 -0.5 L 25 -0.5 Z M 103.07757860184093 0.5 L 115.21547519684592 0.5 L 115.21547519684592 3.5 L 122.21547519684592 0 L 115.21547519684592 -3.5 L 115.21547519684592 -0.5 L 103.07757860184093 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="70.10773759842296" y="3" transform="rotate(180 70.10773759842296 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_APP</text></g><g class="relationship" transform="translate(172.82072405845997 247.35319923881994) rotate(251.51956353069102)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 42.65800678862712 0.5 L 42.65800678862712 -0.5 L 25 -0.5 Z M 104.701677442924 0.5 L 122.35968423155111 0.5 L 122.35968423155111 3.5 L 129.3596842315511 0 L 122.35968423155111 -3.5 L 122.35968423155111 -0.5 L 104.701677442924 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="73.67984211577556" y="3" transform="rotate(180 73.67984211577556 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_VM</text></g><g class="relationship" transform="translate(172.82072405845997 247.35319923881994) rotate(181.4793502206265)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 31.896920167393972 0.5 L 31.896920167393972 -0.5 L 25 -0.5 Z M 97.83660217422991 0.5 L 104.73352234162388 0.5 L 104.73352234162388 3.5 L 111.73352234162388 0 L 104.73352234162388 -3.5 L 104.73352234162388 -0.5 L 97.83660217422991 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="64.86676117081194" y="3" transform="rotate(180 64.86676117081194 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_APP</text></g><g class="relationship" transform="translate(275.8356259839927 -35.3029286712074) rotate(198.14158639069774)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 36.49452149825491 0.5 L 36.49452149825491 -0.5 L 25 -0.5 Z M 102.5781854386846 0.5 L 114.07270693693951 0.5 L 114.07270693693951 3.5 L 121.07270693693951 0 L 114.07270693693951 -3.5 L 114.07270693693951 -0.5 L 102.5781854386846 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="69.53635346846976" y="3" transform="rotate(180 69.53635346846976 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_PHY</text></g><g class="relationship" transform="translate(-308.65235794129757 -38.70930001527599) rotate(511.17953343928656)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 31.77246531161174 0.5 L 31.77246531161174 -0.5 L 25 -0.5 Z M 93.81613596590861 0.5 L 100.58860127752035 0.5 L 100.58860127752035 3.5 L 107.58860127752035 0 L 100.58860127752035 -3.5 L 100.58860127752035 -0.5 L 93.81613596590861 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="62.79430063876018" y="3" transform="rotate(180 62.79430063876018 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_VM</text></g><g class="relationship" transform="translate(-308.65235794129757 -38.70930001527599) rotate(459.644378085826)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 48.80869093974049 0.5 L 48.80869093974049 -0.5 L 25 -0.5 Z M 114.74837294657642 0.5 L 138.5570638863169 0.5 L 138.5570638863169 3.5 L 145.5570638863169 0 L 138.5570638863169 -3.5 L 138.5570638863169 -0.5 L 114.74837294657642 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="81.77853194315846" y="3" transform="rotate(180 81.77853194315846 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_APP</text></g><g class="relationship" transform="translate(235.24579192126856 -200.40260425076136) rotate(489.390451945319)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 45.375292914893535 0.5 L 45.375292914893535 -0.5 L 25 -0.5 Z M 102.40146173813572 0.5 L 122.77675465302926 0.5 L 122.77675465302926 3.5 L 129.77675465302926 0 L 122.77675465302926 -3.5 L 122.77675465302926 -0.5 L 102.40146173813572 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="73.88837732651463" y="3" transform="rotate(180 73.88837732651463 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(204.35141920051024 -347.3934304262734) rotate(438.1304030016224)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 46.96367965758206 0.5 L 46.96367965758206 -0.5 L 25 -0.5 Z M 96.23873458922269 0.5 L 118.20241424680475 0.5 L 118.20241424680475 3.5 L 125.20241424680475 0 L 118.20241424680475 -3.5 L 118.20241424680475 -0.5 L 96.23873458922269 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="71.60120712340238" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(71.43887794672933 -406.9440637347891) rotate(384.13446720958217)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 36.351896050128246 0.5 L 36.351896050128246 -0.5 L 25 -0.5 Z M 102.29157805696418 0.5 L 113.64347410709243 0.5 L 113.64347410709243 3.5 L 120.64347410709243 0 L 113.64347410709243 -3.5 L 113.64347410709243 -0.5 L 102.29157805696418 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="69.32173705354622" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_APP</text></g><g class="relationship" transform="translate(8.633696617397076 -200.87896955720566) rotate(403.08767954632503)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 55.88838334525174 0.5 L 55.88838334525174 -0.5 L 25 -0.5 Z M 112.91455216849393 0.5 L 143.80293551374567 0.5 L 143.80293551374567 3.5 L 150.80293551374567 0 L 143.80293551374567 -3.5 L 143.80293551374567 -0.5 L 112.91455216849393 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="84.40146775687283" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(123.89166251033241 100.95354400669956) rotate(274.13304172546947)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 59.09313963262622 0.5 L 59.09313963262622 -0.5 L 25 -0.5 Z M 116.1193084558684 0.5 L 150.21244808849463 0.5 L 150.21244808849463 3.5 L 157.21244808849463 0 L 150.21244808849463 -3.5 L 150.21244808849463 -0.5 L 116.1193084558684 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="87.60622404424731" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(-424.8178107932409 25.207245201375162) rotate(372.65821105490556)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 50.05311454703305 0.5 L 50.05311454703305 -0.5 L 25 -0.5 Z M 107.07928337027523 0.5 L 132.13239791730828 0.5 L 132.13239791730828 3.5 L 139.13239791730828 0 L 132.13239791730828 -3.5 L 132.13239791730828 -0.5 L 107.07928337027523 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="78.56619895865414" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(-148.6041117755601 162.64884638799535) rotate(221.1615182808078)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 45.07365228441435 0.5 L 45.07365228441435 -0.5 L 25 -0.5 Z M 102.09982110765654 0.5 L 122.17347339207089 0.5 L 122.17347339207089 3.5 L 129.1734733920709 0 L 122.17347339207089 -3.5 L 122.17347339207089 -0.5 L 102.09982110765654 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="73.58673669603544" y="3" transform="rotate(180 73.58673669603544 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(-130.01839109967946 -145.83644976921772) rotate(338.34776448440573)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 46.451480459132895 0.5 L 46.451480459132895 -0.5 L 25 -0.5 Z M 95.72653539077352 0.5 L 117.17801584990642 0.5 L 117.17801584990642 3.5 L 124.17801584990642 0 L 117.17801584990642 -3.5 L 117.17801584990642 -0.5 L 95.72653539077352 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="71.08900792495321" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(36.132775765934326 243.823195906358) rotate(301.5606764521289)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 55.69766746528494 0.5 L 55.69766746528494 -0.5 L 25 -0.5 Z M 104.97272239692556 0.5 L 135.6703898622105 0.5 L 135.6703898622105 3.5 L 142.6703898622105 0 L 135.6703898622105 -3.5 L 135.6703898622105 -0.5 L 104.97272239692556 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="80.33519493110525" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g></g><g class="layer nodes"><g class="node" aria-label="graph-node0" transform="translate(-337.22619110773155,129.43720782743236)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app3</text></g><g class="node" aria-label="graph-node1" transform="translate(-6.506399702198144,150.98095906246445)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app4</text></g><g class="node" aria-label="graph-node2" transform="translate(-8.216325609670207,-63.152394596526484)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 1</text></g><g class="node" aria-label="graph-node3" transform="translate(172.82072405845997,247.35319923881994)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 2</text></g><g class="node" aria-label="graph-node4" transform="translate(275.8356259839927,-35.3029286712074)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 3</text></g><g class="node" aria-label="graph-node5" transform="translate(-308.65235794129757,-38.70930001527599)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 4</text></g><g class="node" aria-label="graph-node6" transform="translate(235.24579192126856,-200.40260425076136)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.5</text></g><g class="node" aria-label="graph-node7" transform="translate(204.35141920051024,-347.3934304262734)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app5</text></g><g class="node" aria-label="graph-node8" transform="translate(71.43887794672933,-406.9440637347891)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 5</text></g><g class="node" aria-label="graph-node10" transform="translate(137.02419531264678,-80.78503973543947)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F79767" stroke="#f36924" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node11" transform="translate(-264.6747114840282,61.174338352271604)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F79767" stroke="#f36924" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node12" transform="translate(8.633696617397076,-200.87896955720566)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.1</text></g><g class="node" aria-label="graph-node13" transform="translate(123.89166251033241,100.95354400669956)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.2</text></g><g class="node" aria-label="graph-node14" transform="translate(-424.8178107932409,25.207245201375162)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.3</text></g><g class="node" aria-label="graph-node15" transform="translate(-148.6041117755601,162.64884638799535)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.4</text></g><g class="node" aria-label="graph-node16" transform="translate(-130.01839109967946,-145.83644976921772)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app1</text></g><g class="node" aria-label="graph-node17" transform="translate(36.132775765934326,243.823195906358)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app2</text></g></g></svg>


## 和 alarm 直接关联的节点

<svg xmlns="http://www.w3.org/2000/svg" width="716.3694458007812" height="559.3644409179688" viewBox="-324.0665283203125 -210.7660675048828 716.3694458007812 559.3644409179688"><title>Neo4j Graph Visualization</title><desc>Created using Neo4j (http://www.neo4j.com/)</desc><g class="layer relationships"><g class="relationship" transform="translate(-107.29498700477697 267.1974272956981) rotate(321.50474990159864)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 41.73534366305539 0.5 L 41.73534366305539 -0.5 L 25 -0.5 Z M 103.77901431735226 0.5 L 120.51435798040765 0.5 L 120.51435798040765 3.5 L 127.51435798040765 0 L 120.51435798040765 -3.5 L 120.51435798040765 -0.5 L 103.77901431735226 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="72.75717899020383" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_VM</text></g><g class="relationship" transform="translate(-107.29498700477697 267.1974272956981) rotate(381.2188033625414)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 35.92100226389266 0.5 L 35.92100226389266 -0.5 L 25 -0.5 Z M 101.8606842707286 0.5 L 112.78168653462126 0.5 L 112.78168653462126 3.5 L 119.78168653462126 0 L 112.78168653462126 -3.5 L 112.78168653462126 -0.5 L 101.8606842707286 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.89084326731063" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_APP</text></g><g class="relationship" transform="translate(363.30287794523207 49.05779053152203) rotate(201.85066768995495)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 43.63682273489677 0.5 L 43.63682273489677 -0.5 L 25 -0.5 Z M 105.68049338919364 0.5 L 124.31731612409041 0.5 L 124.31731612409041 3.5 L 131.3173161240904 0 L 124.31731612409041 -3.5 L 124.31731612409041 -0.5 L 105.68049338919364 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="74.6586580620452" y="3" transform="rotate(180 74.6586580620452 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_VM</text></g><g class="relationship" transform="translate(363.30287794523207 49.05779053152203) rotate(501.68053810440546)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 33.55915247087522 0.5 L 33.55915247087522 -0.5 L 25 -0.5 Z M 99.49883447771116 0.5 L 108.05798694858638 0.5 L 108.05798694858638 3.5 L 115.05798694858638 0 L 108.05798694858638 -3.5 L 108.05798694858638 -0.5 L 99.49883447771116 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="66.52899347429319" y="3" transform="rotate(180 66.52899347429319 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_APP</text></g><g class="relationship" transform="translate(104.9369320809277 -128.32285606632666) rotate(473.4514245497252)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 37.889074439004276 0.5 L 37.889074439004276 -0.5 L 25 -0.5 Z M 103.97273837943396 0.5 L 116.86181281843824 0.5 L 116.86181281843824 3.5 L 123.86181281843824 0 L 116.86181281843824 -3.5 L 116.86181281843824 -0.5 L 103.97273837943396 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="70.93090640921912" y="3" transform="rotate(180 70.93090640921912 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_PHY</text></g><g class="relationship" transform="translate(-44.31049629260843 -181.7660648713339) rotate(521.1490598296076)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 34.61799799025299 0.5 L 34.61799799025299 -0.5 L 25 -0.5 Z M 96.66166864454986 0.5 L 106.27966663480285 0.5 L 106.27966663480285 3.5 L 113.27966663480285 0 L 106.27966663480285 -3.5 L 106.27966663480285 -0.5 L 96.66166864454986 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="65.63983331740143" y="3" transform="rotate(180 65.63983331740143 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_VM</text></g><g class="relationship" transform="translate(-44.31049629260843 -181.7660648713339) rotate(457.45696690344)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 49.972232123024355 0.5 L 49.972232123024355 -0.5 L 25 -0.5 Z M 115.91191412986029 0.5 L 140.88414625288465 0.5 L 140.88414625288465 3.5 L 147.88414625288465 0 L 140.88414625288465 -3.5 L 140.88414625288465 -0.5 L 115.91191412986029 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="82.94207312644232" y="3" transform="rotate(180 82.94207312644232 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_APP</text></g><g class="relationship" transform="translate(-295.0665204689131 41.846810367229644) rotate(355.85833733876336)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 40.842172115486505 0.5 L 40.842172115486505 -0.5 L 25 -0.5 Z M 106.78185412232244 0.5 L 122.62402623780895 0.5 L 122.62402623780895 3.5 L 129.62402623780895 0 L 122.62402623780895 -3.5 L 122.62402623780895 -0.5 L 106.78185412232244 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="73.81201311890447" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">ALARM_OF_APP</text></g><g class="relationship" transform="translate(-66.74766215157968 -10.344066242786141) rotate(229.45379341540382)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 55.258872975133215 0.5 L 55.258872975133215 -0.5 L 25 -0.5 Z M 104.53392790677384 0.5 L 134.79280088190706 0.5 L 134.79280088190706 3.5 L 141.79280088190706 0 L 134.79280088190706 -3.5 L 134.79280088190706 -0.5 L 104.53392790677384 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="79.89640044095353" y="3" transform="rotate(180 79.89640044095353 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(12.071864039275885 172.26490251097096) rotate(281.5843736244627)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 51.7033438911145 0.5 L 51.7033438911145 -0.5 L 25 -0.5 Z M 108.72951271435669 0.5 L 135.4328566054712 0.5 L 135.4328566054712 3.5 L 142.4328566054712 0 L 135.4328566054712 -3.5 L 135.4328566054712 -0.5 L 108.72951271435669 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="80.2164283027356" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(218.21585791425397 -9.121758613941246) rotate(534.2525041013909)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 54.68358674868681 0.5 L 54.68358674868681 -0.5 L 25 -0.5 Z M 111.709755571929 0.5 L 141.3933423206158 0.5 L 141.3933423206158 3.5 L 148.3933423206158 0 L 141.3933423206158 -3.5 L 141.3933423206158 -0.5 L 111.709755571929 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="83.1966711603079" y="3" transform="rotate(180 83.1966711603079 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(27.671235638174945 319.5983385597445) rotate(263.95615368688897)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 45.94094743110669 0.5 L 45.94094743110669 -0.5 L 25 -0.5 Z M 95.21600236274732 0.5 L 116.15694979385401 0.5 L 116.15694979385401 3.5 L 123.15694979385401 0 L 116.15694979385401 -3.5 L 116.15694979385401 -0.5 L 95.21600236274732 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="70.578474896927" y="3" transform="rotate(180 70.578474896927 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(253.4181710402389 135.90012408200957) rotate(256.35603045265395)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 46.47907475864781 0.5 L 46.47907475864781 -0.5 L 25 -0.5 Z M 95.75412969028844 0.5 L 117.23320444893625 0.5 L 117.23320444893625 3.5 L 124.23320444893625 0 L 117.23320444893625 -3.5 L 117.23320444893625 -0.5 L 95.75412969028844 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="71.11660222446812" y="3" transform="rotate(180 71.11660222446812 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g></g><g class="layer nodes"><g class="node" aria-label="graph-node2" transform="translate(-107.29498700477697,267.1974272956981)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 1</text></g><g class="node" aria-label="graph-node12" transform="translate(12.071864039275885,172.26490251097096)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.1</text></g><g class="node" aria-label="graph-node16" transform="translate(27.671235638174945,319.5983385597445)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app1</text></g><g class="node" aria-label="graph-node3" transform="translate(363.30287794523207,49.05779053152203)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 2</text></g><g class="node" aria-label="graph-node13" transform="translate(218.21585791425397,-9.121758613941246)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.2</text></g><g class="node" aria-label="graph-node17" transform="translate(253.4181710402389,135.90012408200957)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app2</text></g><g class="node" aria-label="graph-node4" transform="translate(104.9369320809277,-128.32285606632666)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 3</text></g><g class="node" aria-label="graph-node10" transform="translate(45.69418195817208,8.242644238415323)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F79767" stroke="#f36924" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node5" transform="translate(-44.31049629260843,-181.7660648713339)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 4</text></g><g class="node" aria-label="graph-node14" transform="translate(-175.1731690637592,-137.08690776398768)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.3</text></g><g class="node" aria-label="graph-node0" transform="translate(-66.74766215157968,-10.344066242786141)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app3</text></g><g class="node" aria-label="graph-node8" transform="translate(-295.0665204689131,41.846810367229644)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F16667" stroke="#eb2728" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> Alarm 5</text></g><g class="node" aria-label="graph-node7" transform="translate(-140.8462902635615,30.679443381274922)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app5</text></g></g></svg>



# 参考资料

https://github.com/neo4j/graph-data-science


* any list
{:toc}


