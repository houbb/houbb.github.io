---
layout: post
title:  Neo4j APOC-03-图数据库 apoc 基本场景使用
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---

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


以下是根据您的要求，构建的两组数据和对应的 Neo4j 初始化语句。

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

# APOC 的查询方式

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

该查询将从 `rca_alarm` 节点开始，沿着指定的关系类型路径扩展，直到到达 `rca_app` 和 `rca_phy` 节点，返回路径。路径中将包含每一个经过的节点和关系。

<svg xmlns="http://www.w3.org/2000/svg" width="203.2875518798828" height="311.6475830078125" viewBox="-72.07612609863281 -156.28802490234375 203.2875518798828 311.6475830078125"><title>Neo4j Graph Visualization</title><desc>Created using Neo4j (http://www.neo4j.com/)</desc><g class="layer relationships"><g class="relationship" transform="translate(28.3556221665293 126.35956110753267) rotate(300.9009327554616)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 41.21888924609546 0.5 L 41.21888924609546 -0.5 L 25 -0.5 Z M 95.59388924609546 0.5 L 111.81277849219092 0.5 L 111.81277849219092 3.5 L 118.81277849219092 0 L 111.81277849219092 -3.5 L 111.81277849219092 -0.5 L 95.59388924609546 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.40638924609546" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">alarm_to_vm</text></g><g class="relationship" transform="translate(42.194833875360516 -127.28801944199574) rotate(425.26037602323)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 36.67201777440839 0.5 L 36.67201777440839 -0.5 L 25 -0.5 Z M 99.73842402440839 0.5 L 111.41044179881678 0.5 L 111.41044179881678 3.5 L 118.41044179881678 0 L 111.41044179881678 -3.5 L 111.41044179881678 -0.5 L 99.73842402440839 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.20522089940839" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">app_run_in_vm</text></g><g class="relationship" transform="translate(102.21142540624717 2.9600652193401267) rotate(182.03723762805134)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 37.84206379195655 0.5 L 37.84206379195655 -0.5 L 25 -0.5 Z M 100.53737629195655 0.5 L 113.3794400839131 0.5 L 113.3794400839131 3.5 L 120.3794400839131 0 L 113.3794400839131 -3.5 L 113.3794400839131 -0.5 L 100.53737629195655 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="69.18972004195655" y="3" transform="rotate(180 69.18972004195655 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">vm_run_in_phy</text></g></g><g class="layer nodes"><g class="node" aria-label="graph-node30" transform="translate(28.3556221665293,126.35956110753267)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 报警1</text></g><g class="node" aria-label="graph-node32" transform="translate(102.21142540624717,2.9600652193401267)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node31" transform="translate(42.194833875360516,-127.28801944199574)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 应用A</text></g><g class="node" aria-label="graph-node33" transform="translate(-43.07612529078898,-2.2080303262382515)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g></g></svg>


# 参考资料

[Neo4j安装插件](https://blog.csdn.net/m0_53573725/article/details/136964980)

[neo4j手动安装插件](https://blog.csdn.net/qq_35897203/article/details/107466850)

* any list
{:toc}


