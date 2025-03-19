---
layout: post
title:  Neo4j APOC-03-图数据库 apoc 实战使用使用 apoc.path.expand+subgraphNodes+subgraphAll
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---

# neo4j apoc 系列

[Neo4j APOC-01-图数据库 apoc 插件介绍](https://houbb.github.io/2018/01/08/neo4j-plugins-apoc-01-intro)

[Neo4j APOC-01-图数据库 apoc 插件安装 neo4j on windows10](https://houbb.github.io/2018/01/08/neo4j-plugins-apoc-02-windows10-install-plugins)

[Neo4j APOC-03-图数据库 apoc 实战使用使用](https://houbb.github.io/2018/01/08/neo4j-plugins-apoc-03-basic-usage)

[Neo4j APOC-04-图数据库 apoc 实战使用使用 apoc.path.spanningTree 最小生成树](https://houbb.github.io/2018/01/08/neo4j-plugins-apoc-04-minist-tree)

[Neo4j APOC-05-图数据库 apoc 实战使用使用 labelFilter](https://houbb.github.io/2018/01/08/neo4j-plugins-apoc-05-label-filter)

# 数据准备

neo4j 中，假设我有实体：

```
rca_alarm{name:'报警名称', appName:'对应应用名称', ip: '对应的虚拟机IP'}
rca_app{appName:'应用名称'}
rca_vm{ip:'xx.xx.xx.xx  虚拟机IP地址'}
rca_phy{ip:'xx.xx.xx.xx 物理机IP地址'}
```

rca_alarm 通过 ip 与 rca_vm 关联，关系名：alarm_to_vm
rca_app 运行在固定的虚拟机上, 关系名：app_run_in_vm
虚拟机运行在在物理机上, 关系名：vm_run_in_phy

节点的唯一性：

rca_alarm name 唯一
rca_app appName 唯一
rca_vm ip 唯一
rca_phy ip 唯一

帮我构 2 组数据，给出对应的 neo4j 初始化语句。

```
rca_alarm->rca_vm
rca_app->rca_vm->rca_phy
```

保证一组数据中，4个节点之间是可以按照约定互相关联的。

## 初始化脚本

构建的两组数据和对应的 Neo4j 初始化语句。

### 第一组数据

- **rca_alarm**: 报警1，关联到 `vm1`（IP: 192.168.1.1）
- **rca_app**: 应用 A，运行在 `vm1` 上
- **rca_vm**: 虚拟机 1（IP: 192.168.1.1），运行在 `phy1`（IP: 192.168.0.1）上
- **rca_phy**: 物理机 1（IP: 192.168.0.1）

### 第二组数据

- **rca_alarm**: 报警2，关联到 `vm2`（IP: 192.168.2.2）
- **rca_app**: 应用 B，运行在 `vm2` 上
- **rca_vm**: 虚拟机 2（IP: 192.168.2.2），运行在 `phy2`（IP: 192.168.0.2）上
- **rca_phy**: 物理机 2（IP: 192.168.0.2）

### Neo4j 初始化语句

```cypher
// 第一组数据
CREATE (alarm1:rca_alarm {name: '报警1', appName: '应用A', ip: '192.168.1.1'})
CREATE (appA:rca_app {appName: '应用A'})
CREATE (vm1:rca_vm {ip: '192.168.1.1'})
CREATE (phy1:rca_phy {ip: '192.168.0.1'})

// 第一组数据的关系
CREATE (alarm1)-[:alarm_to_vm]->(vm1)
CREATE (appA)-[:app_run_in_vm]->(vm1)
CREATE (vm1)-[:vm_run_in_phy]->(phy1)

// 第二组数据
CREATE (alarm2:rca_alarm {name: '报警2', appName: '应用B', ip: '192.168.2.2'})
CREATE (appB:rca_app {appName: '应用B'})
CREATE (vm2:rca_vm {ip: '192.168.2.2'})
CREATE (phy2:rca_phy {ip: '192.168.0.2'})

// 第二组数据的关系
CREATE (alarm2)-[:alarm_to_vm]->(vm2)
CREATE (appB)-[:app_run_in_vm]->(vm2)
CREATE (vm2)-[:vm_run_in_phy]->(phy2)
```

这些语句将创建两组数据，并且节点之间按照约定的关系进行连接：
- `rca_alarm` 与 `rca_vm` 通过 `alarm_to_vm` 关系关联。
- `rca_app` 与 `rca_vm` 通过 `app_run_in_vm` 关系关联。
- `rca_vm` 与 `rca_phy` 通过 `vm_run_in_phy` 关系关联。

每组数据中的节点都能按照约定正确地关联在一起。

整体的效果：

<svg xmlns="http://www.w3.org/2000/svg" width="479.51617431640625" height="369.84808349609375" viewBox="-245.3550262451172 -179.17767333984375 479.51617431640625 369.84808349609375"><title>Neo4j Graph Visualization</title><desc>Created using Neo4j (http://www.neo4j.com/)</desc><g class="layer relationships"><g class="relationship" transform="translate(78.73612106058908 54.357638597240744) rotate(331.5490574178367)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 41.20821357131034 0.5 L 41.20821357131034 -0.5 L 25 -0.5 Z M 95.58321357131034 0.5 L 111.79142714262068 0.5 L 111.79142714262068 3.5 L 118.79142714262068 0 L 111.79142714262068 -3.5 L 111.79142714262068 -0.5 L 95.58321357131034 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.39571357131034" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">alarm_to_vm</text></g><g class="relationship" transform="translate(198.5197756576865 130.05010604251498) rotate(272.63708582628095)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 37.141021909852924 0.5 L 37.141021909852924 -0.5 L 25 -0.5 Z M 100.20742815985292 0.5 L 112.34845006970585 0.5 L 112.34845006970585 3.5 L 119.34845006970585 0 L 112.34845006970585 -3.5 L 112.34845006970585 -0.5 L 100.20742815985292 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.67422503485292" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">app_run_in_vm</text></g><g class="relationship" transform="translate(205.16118751306405 -14.145478793129737) rotate(251.40901582246858)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 36.91301600005234 0.5 L 36.91301600005234 -0.5 L 25 -0.5 Z M 99.60832850005234 0.5 L 111.52134450010468 0.5 L 111.52134450010468 3.5 L 118.52134450010468 0 L 111.52134450010468 -3.5 L 111.52134450010468 -0.5 L 99.60832850005234 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.26067225005234" y="3" transform="rotate(180 68.26067225005234 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">vm_run_in_phy</text></g><g class="relationship" transform="translate(-83.1228850273204 -73.33961989895123) rotate(496.8011114166108)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 41.603799454813824 0.5 L 41.603799454813824 -0.5 L 25 -0.5 Z M 95.97879945481382 0.5 L 112.58259890962765 0.5 L 112.58259890962765 3.5 L 119.58259890962765 0 L 112.58259890962765 -3.5 L 112.58259890962765 -0.5 L 95.97879945481382 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.79129945481382" y="3" transform="rotate(180 68.79129945481382 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">alarm_to_vm</text></g><g class="relationship" transform="translate(-216.3550373943804 -115.7198174709007) rotate(438.8602154388223)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 36.99986663477024 0.5 L 36.99986663477024 -0.5 L 25 -0.5 Z M 100.06627288477024 0.5 L 112.06613951954049 0.5 L 112.06613951954049 3.5 L 119.06613951954049 0 L 112.06613951954049 -3.5 L 112.06613951954049 -0.5 L 100.06627288477024 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.53306975977024" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">app_run_in_vm</text></g><g class="relationship" transform="translate(-188.5209835615949 25.631935271317904) rotate(431.78882932483486)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 36.75823234671893 0.5 L 36.75823234671893 -0.5 L 25 -0.5 Z M 99.45354484671893 0.5 L 111.21177719343785 0.5 L 111.21177719343785 3.5 L 118.21177719343785 0 L 111.21177719343785 -3.5 L 111.21177719343785 -0.5 L 99.45354484671893 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.10588859671893" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">vm_run_in_phy</text></g></g><g class="layer nodes"><g class="node" aria-label="graph-node30" transform="translate(78.73612106058908,54.357638597240744)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 报警1</text></g><g class="node" aria-label="graph-node31" transform="translate(198.5197756576865,130.05010604251498)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 应用A</text></g><g class="node" aria-label="graph-node32" transform="translate(205.16118751306405,-14.145478793129737)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node33" transform="translate(159.40512348878886,-150.177676937996)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node34" transform="translate(-83.1228850273204,-73.33961989895123)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 报警2</text></g><g class="node" aria-label="graph-node35" transform="translate(-216.3550373943804,-115.7198174709007)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 应用B</text></g><g class="node" aria-label="graph-node36" transform="translate(-188.5209835615949,25.631935271317904)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node38" transform="translate(-143.7644212042675,161.67039767389562)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g></g></svg>

# 基础查询

## 基本查询

如何通过 rca_alarm 开始，查询 name: '报警1' 的报警信息，将关联的 rca_alarm, rca_vm, rca_phy 都查询出来。

```
MATCH (alarm:rca_alarm {name: '报警1'})-[:alarm_to_vm]->(vm:rca_vm)-[:vm_run_in_phy]->(phy:rca_phy)
RETURN alarm, vm, phy
```

效果：

```
╒═══════════════════════════════════════════════════════════╤═════════════════════════════╤══════════════════════════════╕
│alarm                                                      │vm                           │phy                           │
╞═══════════════════════════════════════════════════════════╪═════════════════════════════╪══════════════════════════════╡
│(:rca_alarm {appName: "应用A",ip: "192.168.1.1",name: "报警1"})│(:rca_vm {ip: "192.168.1.1"})│(:rca_phy {ip: "192.168.0.1"})│
└───────────────────────────────────────────────────────────┴─────────────────────────────┴──────────────────────────────┘
```

# APOC 的的路径拓展

抱歉给您带来了困扰！报错的原因是因为 `apoc.path.expand` 需要更多的参数，而我们缺少了一些必要的参数。

具体来说，`apoc.path.expand` 期望提供的参数是：

1. **startNode**：起始节点。
2. **relationshipFilter**：用于过滤关系类型的字符串。
3. **labelFilter**：用于过滤节点标签的字符串（如果不需要，可以传空字符串 `""`）。
4. **minDepth**：最小深度（从 `startNode` 出发的关系链的最小级别）。
5. **maxDepth**：最大深度（从 `startNode` 出发的关系链的最大级别）。

我们需要根据这些要求来调整查询。

### APOC 查询

```cypher
MATCH (alarm:rca_alarm {name: '报警1'})
CALL apoc.path.expand(
    alarm,                            // 起始节点
    "alarm_to_vm|app_run_in_vm|vm_run_in_phy",  // 关系类型过滤器
    "",                               // 节点标签过滤器，空字符串表示不进行标签过滤
    1,                                // 最小深度：从 alarm 到 vm 至少1级
    3                                 // 最大深度：到 app 和 phy 最多3级
) YIELD path
RETURN path
```

### 解释：
1. **起始节点 `alarm`**：查询从 `rca_alarm`（`name: '报警1'`）节点开始。
2. **关系类型过滤器** `"alarm_to_vm|app_run_in_vm|vm_run_in_phy"`：指定我们希望通过这些关系类型进行路径扩展。
3. **节点标签过滤器 `""`**：空字符串表示我们不对节点的标签进行任何过滤，这样所有类型的节点都会被匹配。
4. **最小深度 `1`**：表示最小路径深度从 `rca_alarm` 到 `rca_vm`（1级）。
5. **最大深度 `3`**：表示最大路径深度为3，即扩展到 `rca_app` 和 `rca_phy`。

### 结果：

该查询将从 `rca_alarm` 节点开始，沿着指定的关系类型路径扩展，直到到达 `rca_app` 和 `rca_phy` 节点，返回路径。

路径中将包含每一个经过的节点和关系。

这个实际上关注的是路径：

```
╒══════════════════════════════════════════════════════════════════════╕
│path                                                                  │
╞══════════════════════════════════════════════════════════════════════╡
│(:rca_alarm {name: "报警1",appName: "应用A",ip: "192.168.1.1"})-[:alarm_to│
│_vm]->(:rca_vm {ip: "192.168.1.1"})                                   │
├──────────────────────────────────────────────────────────────────────┤
│(:rca_alarm {name: "报警1",appName: "应用A",ip: "192.168.1.1"})-[:alarm_to│
│_vm]->(:rca_vm {ip: "192.168.1.1"})<-[:app_run_in_vm]-(:rca_app {appNa│
│me: "应用A"})                                                           │
├──────────────────────────────────────────────────────────────────────┤
│(:rca_alarm {name: "报警1",appName: "应用A",ip: "192.168.1.1"})-[:alarm_to│
│_vm]->(:rca_vm {ip: "192.168.1.1"})-[:vm_run_in_phy]->(:rca_phy {ip: "│
│192.168.0.1"})                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

<svg xmlns="http://www.w3.org/2000/svg" width="203.2875518798828" height="311.6475830078125" viewBox="-72.07612609863281 -156.28802490234375 203.2875518798828 311.6475830078125"><title>Neo4j Graph Visualization</title><desc>Created using Neo4j (http://www.neo4j.com/)</desc><g class="layer relationships"><g class="relationship" transform="translate(28.3556221665293 126.35956110753267) rotate(300.9009327554616)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 41.21888924609546 0.5 L 41.21888924609546 -0.5 L 25 -0.5 Z M 95.59388924609546 0.5 L 111.81277849219092 0.5 L 111.81277849219092 3.5 L 118.81277849219092 0 L 111.81277849219092 -3.5 L 111.81277849219092 -0.5 L 95.59388924609546 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.40638924609546" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">alarm_to_vm</text></g><g class="relationship" transform="translate(42.194833875360516 -127.28801944199574) rotate(425.26037602323)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 36.67201777440839 0.5 L 36.67201777440839 -0.5 L 25 -0.5 Z M 99.73842402440839 0.5 L 111.41044179881678 0.5 L 111.41044179881678 3.5 L 118.41044179881678 0 L 111.41044179881678 -3.5 L 111.41044179881678 -0.5 L 99.73842402440839 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.20522089940839" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">app_run_in_vm</text></g><g class="relationship" transform="translate(102.21142540624717 2.9600652193401267) rotate(182.03723762805134)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 37.84206379195655 0.5 L 37.84206379195655 -0.5 L 25 -0.5 Z M 100.53737629195655 0.5 L 113.3794400839131 0.5 L 113.3794400839131 3.5 L 120.3794400839131 0 L 113.3794400839131 -3.5 L 113.3794400839131 -0.5 L 100.53737629195655 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="69.18972004195655" y="3" transform="rotate(180 69.18972004195655 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">vm_run_in_phy</text></g></g><g class="layer nodes"><g class="node" aria-label="graph-node30" transform="translate(28.3556221665293,126.35956110753267)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 报警1</text></g><g class="node" aria-label="graph-node32" transform="translate(102.21142540624717,2.9600652193401267)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node31" transform="translate(42.194833875360516,-127.28801944199574)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 应用A</text></g><g class="node" aria-label="graph-node33" transform="translate(-43.07612529078898,-2.2080303262382515)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g></g></svg>


# APOC 路径扩展 vs 子图搜索

在 APOC 中，路径扩展 (`apoc.path.expand`) 和子图搜索 (`apoc.path.subgraphNodes`) 是两种不同的图遍历方式，它们的主要区别在于 **查询的结果** 和 **应用场景**。

## 1. `apoc.path.expand` — 路径扩展

`apoc.path.expand` 主要用于从一个起始节点出发，沿着指定的关系类型扩展路径。

它是一个 **路径查询**，结果是一个或多个路径，可以包含多个节点和关系，路径会根据给定的关系类型和深度限制逐层扩展。

### 特点：

- **起始节点**：你从一个特定的节点开始扩展。
- **关系类型过滤**：你可以指定要遵循的关系类型，过滤不需要的关系。
- **最大/最小深度**：你可以限制路径扩展的最大和最小深度。
- **路径结果**：返回的是一条或多条完整的路径，路径中包括经过的节点和关系。

### 使用场景：

- 查找从一个节点出发的特定路径。
- 当你需要返回路径的完整信息（节点和关系）时。


## 2. `apoc.path.subgraphNodes` — 子图搜索

`apoc.path.subgraphNodes` 则是用来查找一个子图（subgraph）的，它返回的是 **一个子图中的所有节点**，并且可以过滤节点和关系的类型。

不同于 `expand` 查询路径，`subgraphNodes` 更侧重于查找与某个节点相关的完整子图，而不是查找路径。

### 特点：

- **子图查询**：返回的是一个子图，包含从起始节点出发的所有相关节点和关系。

- **节点/关系过滤**：你可以指定需要包含的节点和关系类型，还可以限制子图中包含的最大深度。

- **没有返回路径**：它返回的是子图中的节点和关系，不是路径，因此不关心路径的具体顺序。

### 使用场景：

- 当你希望查询与某个节点相关的 **所有节点和关系**，并且不关心路径的顺序或具体细节时。

- 适用于寻找与某个节点直接或间接相关的所有节点，并可以做过滤。

### 示例：

从 `rca_alarm` 开始，查找与其相关的所有节点（`rca_vm`、`rca_phy`、`rca_app`）：

```cypher
MATCH (alarm:rca_alarm {name: '报警1'})
CALL apoc.path.subgraphNodes(
    alarm,                            // 起始节点
    {relationshipFilter: "alarm_to_vm|app_run_in_vm|vm_run_in_phy",  // 关系类型过滤器
     labelFilter: "rca_vm|rca_phy|rca_app",  // 节点标签过滤器
     maxDepth: 3}                      // 最大深度
) YIELD node
RETURN node
```

返回的是每一个节点信息：

```
╒═══════════════════════════════════════════════════════════╕
│node                                                       │
╞═══════════════════════════════════════════════════════════╡
│(:rca_alarm {name: "报警1",appName: "应用A",ip: "192.168.1.1"})│
├───────────────────────────────────────────────────────────┤
│(:rca_vm {ip: "192.168.1.1"})                              │
├───────────────────────────────────────────────────────────┤
│(:rca_app {appName: "应用A"})                                │
├───────────────────────────────────────────────────────────┤
│(:rca_phy {ip: "192.168.0.1"})                             │
└───────────────────────────────────────────────────────────┘
```


### 主要区别总结：

| 特性                      | `apoc.path.expand`                              | `apoc.path.subgraphNodes`                        |
|---------------------------|-------------------------------------------------|-------------------------------------------------|
| **查询目的**               | 查找路径，返回的是路径信息（节点+关系）       | 查找子图，返回的是所有相关节点和关系          |
| **结果**                   | 返回一条或多条完整路径                         | 返回符合条件的所有节点和关系                   |
| **路径方向**               | 关系方向有明确的规定，可以控制正向或逆向       | 不关注路径方向，更多关注节点间的连接关系     |
| **适用场景**               | 查找从某节点出发的特定路径                     | 查找一个节点的相关子图，特别适用于图谱探索    |
| **返回内容**               | 返回路径，包含节点和关系                       | 返回节点和关系，但不包含路径结构              |
| **路径深度**               | 可以设置最小和最大深度                         | 设置最大深度，并能返回所有相关节点            |

### 总结
- **路径扩展 (`apoc.path.expand`)**：适用于查找路径和逐步扩展路径。它能帮助你清晰地了解从一个节点出发的路径及其经过的关系。
- **子图搜索 (`apoc.path.subgraphNodes`)**：适用于查找某个节点的相关子图，返回的是节点和关系的集合，而不关心路径的顺序。

选择哪种方法取决于您的查询需求。如果您需要获得路径信息，使用 `apoc.path.expand`，如果只关心与某个节点相关的所有节点和关系，使用 `apoc.path.subgraphNodes`。

# 返回节点+边

`apoc.path.subgraphAll` 是 APOC 库中的一个强大工具，用于从指定的起始节点出发，查找与其相关的所有节点和关系，返回的是一个完整的子图。

与 `apoc.path.subgraphNodes` 类似，`subgraphAll` 也是用于查找与某个节点相关的子图，但它的不同之处在于，`subgraphAll` 会返回整个子图，包括所有的 **节点** 和 **关系**，而 `subgraphNodes` 只返回节点。

## `apoc.path.subgraphAll` 的特点：

- **返回完整的子图**：不仅返回节点，还返回所有的关系。你可以得到一个完整的图形结构，而不仅仅是节点。

- **路径搜索**：与 `apoc.path.expand` 不同，`apoc.path.subgraphAll` 不是逐个扩展路径，而是直接搜索整个子图中的所有节点和关系。

- **节点和关系过滤**：可以选择性地过滤某些类型的节点和关系。

- **最大深度限制**：你可以设置子图搜索的最大深度。

## 语法

```cypher
apoc.path.subgraphAll(startNode, {relationshipFilter: STRING, labelFilter: STRING, maxDepth: INTEGER})
```
- **startNode**: 起始节点。

- **relationshipFilter**: 用于过滤关系的字符串，可以使用 `|` 连接多个关系类型。

- **labelFilter**: 用于过滤节点标签的字符串，多个标签之间用 `|` 连接。

- **maxDepth**: 限制最大深度，默认为 `3`。

## 例子 1：查找与 `rca_alarm` 节点相关的所有节点和关系

查询从 `rca_alarm` 节点出发，获取所有相关节点和关系，可以使用 `apoc.path.subgraphAll`：

结果：

```
╒══════════════════════════════════════════════════════════════════════╤════════════════════════════════════════════════════╕
│nodes                                                                 │relationships                                       │
╞══════════════════════════════════════════════════════════════════════╪════════════════════════════════════════════════════╡
│[(:rca_alarm {name: "报警1",appName: "应用A",ip: "192.168.1.1"}), (:rca_vm│[[:alarm_to_vm], [:vm_run_in_phy], [:app_run_in_vm]]│
│ {ip: "192.168.1.1"}), (:rca_phy {ip: "192.168.0.1"}), (:rca_app {appN│                                                    │
│ame: "应用A"})]                                                         │                                                    │
└──────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────┘
```

### 例子 2：查找整个子图，包括所有相关节点和关系（没有过滤）

如果您不想限制节点和关系的类型，您可以去掉过滤器，查询整个子图：

```cypher
MATCH (alarm:rca_alarm {name: '报警1'})
CALL apoc.path.subgraphAll(
    alarm, 
    {}  // 没有任何过滤器
) YIELD nodes, relationships
RETURN nodes, relationships
```

在这个查询中，`apoc.path.subgraphAll` 会返回与 `rca_alarm` 相关的所有节点和关系，直到达到默认的最大深度（3）。

结果：

```
╒══════════════════════════════════════════════════════════════════════╤════════════════════════════════════════════════════╕
│nodes                                                                 │relationships                                       │
╞══════════════════════════════════════════════════════════════════════╪════════════════════════════════════════════════════╡
│[(:rca_alarm {name: "报警1",appName: "应用A",ip: "192.168.1.1"}), (:rca_vm│[[:alarm_to_vm], [:vm_run_in_phy], [:app_run_in_vm]]│
│ {ip: "192.168.1.1"}), (:rca_phy {ip: "192.168.0.1"}), (:rca_app {appN│                                                    │
│ame: "应用A"})]                                                         │                                                    │
└──────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────┘
```

# 参考资料

[Neo4j安装插件](https://blog.csdn.net/m0_53573725/article/details/136964980)

[neo4j手动安装插件](https://blog.csdn.net/qq_35897203/article/details/107466850)

* any list
{:toc}


