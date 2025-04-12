---
layout: post
title:  Neo4j GDS-16-neo4j GDS 库创建 graph 图投影
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

i_app 节点，i_app 指向 i_vm，i_phy。

i_app 有 name 属性。

i_vm, i_phy 有 ip 属性。

创建 4 个 i_app 节点，分别指向 4 个 i_vm。2个 i_vm 一组，分别指向 i_phy 节点。

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

<svg xmlns="http://www.w3.org/2000/svg" width="645.1494140625" height="430.13616943359375" viewBox="-302.6226501464844 -264.75238037109375 645.1494140625 430.13616943359375"><title>Neo4j Graph Visualization</title><desc>Created using Neo4j (http://www.neo4j.com/)</desc><g class="layer relationships"><g class="relationship" transform="translate(63.732245518226115 130.73424519096707) rotate(301.704120370007)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 47.709570730751636 0.5 L 47.709570730751636 -0.5 L 25 -0.5 Z M 104.83066448075164 0.5 L 127.54023521150327 0.5 L 127.54023521150327 3.5 L 134.54023521150327 0 L 127.54023521150327 -3.5 L 127.54023521150327 -0.5 L 104.83066448075164 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="76.27011760575164" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(206.75889784282356 136.38376343206613) rotate(247.2856503161011)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 44.574181328066956 0.5 L 44.574181328066956 -0.5 L 25 -0.5 Z M 101.69527507806696 0.5 L 121.26945640613391 0.5 L 121.26945640613391 3.5 L 128.2694564061339 0 L 121.26945640613391 -3.5 L 121.26945640613391 -0.5 L 101.69527507806696 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="73.13472820306696" y="3" transform="rotate(180 73.13472820306696 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(-152.55434594632288 -54.777440070040036) rotate(347.7080006612151)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 39.76214870308658 0.5 L 39.76214870308658 -0.5 L 25 -0.5 Z M 96.88324245308658 0.5 L 111.64539115617316 0.5 L 111.64539115617316 3.5 L 118.64539115617316 0 L 111.64539115617316 -3.5 L 111.64539115617316 -0.5 L 96.88324245308658 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.32269557808658" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(-273.62265237045773 -128.56128177038016) rotate(369.3839349009953)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 100.4226906291218 0.5 L 100.4226906291218 -0.5 L 25 -0.5 Z M 157.5437843791218 0.5 L 232.9664750082436 0.5 L 232.9664750082436 3.5 L 239.9664750082436 0 L 232.9664750082436 -3.5 L 232.9664750082436 -0.5 L 157.5437843791218 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="128.9832375041218" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONGS_TO</text></g><g class="relationship" transform="translate(11.126711055774763 -16.122487068094273) rotate(430.29197349747244)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 49.60851087202265 0.5 L 49.60851087202265 -0.5 L 25 -0.5 Z M 99.38585462202265 0.5 L 123.9943654940453 0.5 L 123.9943654940453 3.5 L 130.9943654940453 0 L 123.9943654940453 -3.5 L 123.9943654940453 -0.5 L 99.38585462202265 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="74.49718274702265" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(313.52674738758526 41.298459261290624) rotate(498.3123815404472)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 43.09662165741436 0.5 L 43.09662165741436 -0.5 L 25 -0.5 Z M 92.87396540741436 0.5 L 110.97058706482872 0.5 L 110.97058706482872 3.5 L 117.97058706482872 0 L 110.97058706482872 -3.5 L 110.97058706482872 -0.5 L 92.87396540741436 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="67.98529353241436" y="3" transform="rotate(180 67.98529353241436 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(-191.18744345449625 74.43980113888867) rotate(286.6455017328207)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 39.04576229761409 0.5 L 39.04576229761409 -0.5 L 25 -0.5 Z M 88.82310604761409 0.5 L 102.86886834522818 0.5 L 102.86886834522818 3.5 L 109.86886834522818 0 L 102.86886834522818 -3.5 L 102.86886834522818 -0.5 L 88.82310604761409 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="63.93443417261409" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g><g class="relationship" transform="translate(-174.50487778276963 -235.75238620193252) rotate(492.75903087377344)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 44.60835907227846 0.5 L 44.60835907227846 -0.5 L 25 -0.5 Z M 94.38570282227846 0.5 L 113.99406189455692 0.5 L 113.99406189455692 3.5 L 120.99406189455692 0 L 113.99406189455692 -3.5 L 113.99406189455692 -0.5 L 94.38570282227846 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="69.49703094727846" y="3" transform="rotate(180 69.49703094727846 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">POINTS_TO</text></g></g><g class="layer nodes"><g class="node" aria-label="graph-node0" transform="translate(147.57587761961588,-4.99833014520118)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node1" transform="translate(-12.201980561994873,-85.35867502604003)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#C990C0" stroke="#b261a5" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node2" transform="translate(63.732245518226115,130.73424519096707)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F79767" stroke="#f36924" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.1</text></g><g class="node" aria-label="graph-node3" transform="translate(206.75889784282356,136.38376343206613)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F79767" stroke="#f36924" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.2</text></g><g class="node" aria-label="graph-node4" transform="translate(-152.55434594632288,-54.777440070040036)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F79767" stroke="#f36924" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.3</text></g><g class="node" aria-label="graph-node5" transform="translate(-273.62265237045773,-128.56128177038016)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#F79767" stroke="#f36924" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 10.0.0.4</text></g><g class="node" aria-label="graph-node6" transform="translate(11.126711055774763,-16.122487068094273)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app1</text></g><g class="node" aria-label="graph-node7" transform="translate(313.52674738758526,41.298459261290624)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app2</text></g><g class="node" aria-label="graph-node8" transform="translate(-191.18744345449625,74.43980113888867)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app3</text></g><g class="node" aria-label="graph-node9" transform="translate(-174.50487778276963,-235.75238620193252)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#57C7E3" stroke="#23b3d7" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> app4</text></g></g></svg>

## pageRank 使用

### 创建带应用拓扑的图投影

```
CALL gds.graph.project(
    'app-topology',
    ['i_app', 'i_vm', 'i_phy'],
    '*'
);
```

执行结果：

```
╒══════════════════════════════════════════════════════════════════════╤══════════════════════════════════════════════════════════════════════╤══════════════╤═════════╤═════════════════╤═════════════╕
│nodeProjection                                                        │relationshipProjection                                                │graphName     │nodeCount│relationshipCount│projectMillis│
╞══════════════════════════════════════════════════════════════════════╪══════════════════════════════════════════════════════════════════════╪══════════════╪═════════╪═════════════════╪═════════════╡
│{i_phy: {label: "i_phy", properties: {}}, i_app: {label: "i_app", prop│{__ALL__: {aggregation: "DEFAULT", orientation: "NATURAL", indexInvers│"app-topology"│10       │8                │1351         │
│erties: {}}, i_vm: {label: "i_vm", properties: {}}}                   │e: false, properties: {}, type: "*"}}                                 │              │         │                 │             │
└──────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┴──────────────┴─────────┴─────────────────┴─────────────┘
```

### 资源排序

// 计算虚拟机层影响力

```
CALL gds.pageRank.stream('app-topology', {
    
}) 
YIELD nodeId, score
RETURN nodeId, score
ORDER BY score DESC;
```

结果：

```
╒══════╤═══════════════════╕
│nodeId│score              │
╞══════╪═══════════════════╡
│0     │0.62175            │
├──────┼───────────────────┤
│1     │0.62175            │
├──────┼───────────────────┤
│2     │0.2775             │
├──────┼───────────────────┤
│3     │0.2775             │
├──────┼───────────────────┤
│4     │0.2775             │
├──────┼───────────────────┤
│5     │0.2775             │
├──────┼───────────────────┤
│6     │0.15000000000000002│
├──────┼───────────────────┤
│7     │0.15000000000000002│
├──────┼───────────────────┤
│8     │0.15000000000000002│
├──────┼───────────────────┤
│9     │0.15000000000000002│
└──────┴───────────────────┘
```

### 删除投影

```
CALL gds.graph.drop(
    'app-topology'
);
```

# chat

## neo4j gds 库使用前需要创建 graph，有几种创建方式？对比的区别是什么

在Neo4j GDS库中，创建图投影（Graph Projection）的方式主要有以下四种，它们在灵活性、性能、适用场景和功能特性上有显著差异：

---

### 1. 原生投影（Native Projection）
函数: `gds.graph.create`  
核心特点：
- 直接读取存储文件：从Neo4j底层存储文件高效加载数据，跳过Cypher引擎处理。
- 配置驱动：通过参数指定节点标签、关系类型及属性，语法简洁。例如：
  ```cypher
  CALL gds.graph.create('myGraph', 'Person', {LIKES: {type: 'LIKES', orientation: 'UNDIRECTED'}})
  ```

- 性能优化：适合大规模数据处理，生产环境推荐使用。
- 支持操作：
  - 改变关系方向（如将无向关系转为有向）。
  - 聚合平行关系（如合并多对相同节点间的关系）。
  - 属性投影（仅支持数值类型属性）。

适用场景：  
- 需要高性能的场景（如企业级数据分析）。
- 数据结构简单且无需复杂计算的场景。

---

### 2. Cypher投影（Cypher Projection）
函数: `gds.graph.create.cypher`  
核心特点：
- 灵活查询：通过Cypher语句动态定义节点和关系，支持复杂逻辑（如路径合并、属性计算）。  
  ```cypher
  CALL gds.graph.create.cypher(
    'myCypherGraph',
    'MATCH (n:Person) RETURN id(n) AS id',
    'MATCH (a)-[r:LIKES]->(b) RETURN id(a) AS source, id(b) AS target, r.weight AS weight'
  )
  ```

- 动态数据处理：可从临时查询结果生成图（如虚拟节点/关系）。
- 性能代价：因需执行Cypher查询，加载速度较慢，内存消耗可能更高。

适用场景：  
- 开发阶段的探索性分析。
- 需要动态聚合或复杂过滤的场景（如两跳路径合并为单边关系）。

---

### 3. 隐式匿名图（Implicit Anonymous Graph）
特点：
- 无需显式创建：在运行算法时直接通过参数（如`nodeProjection`和`relationshipProjection`）定义图结构。
- 生命周期短暂：仅存在于算法执行期间，执行后自动销毁。
- 语法示例：
  ```cypher
  CALL gds.pageRank.stream({
    nodeProjection: 'Person',
    relationshipProjection: 'LIKES'
  })
  ```


适用场景：  
- 单次算法执行且无需复用的场景。

---

### 4. 子图投影（Subgraph Projection）
函数: `gds.beta.graph.create.subgraph`  
核心特点：
- 基于现有图过滤：从已创建的图投影中提取子集，支持标签、关系类型及属性过滤。
  ```cypher
  CALL gds.beta.graph.create.subgraph(
    'subGraph',
    'myGraph',
    'n.property > 10',
    'r.type = "KNOWS"'
  )
  ```

- 复用性：生成的新图可持久化在图目录中，供后续算法使用。

适用场景：  
- 需要重复分析图的部分子集。

---

### 原生投影 vs. Cypher投影的详细对比

| 维度               | 原生投影                          | Cypher投影                          |
|-------------------------|---------------------------------------|-----------------------------------------|
| 性能                | 高（直接读取存储文件，无查询解析开销） | 低（需执行Cypher查询）       |
| 灵活性              | 有限（基于标签和类型）       | 高（支持任意Cypher逻辑）     |
| 属性支持            | 仅数值类型                      | 任意类型（需通过查询计算）         |
| 适用阶段            | 生产环境                  | 开发环境                    |
| 关系聚合            | 支持（通过参数配置）              | 需手动聚合（如`COUNT`或`DISTINCT`）|
| 多图支持            | 是（如多关系类型投影）           | 是（通过复杂查询实现）             |

---

### 总结建议
- 优先选择原生投影：当数据结构简单且需高性能时（如生产环境）。
- 使用Cypher投影：在开发阶段或需复杂逻辑时（如动态路径合并）。
- 匿名图：适用于单次、临时性的算法运行。
- 子图投影：用于从已有图中提取子集进行重复分析。

# 参考资料

https://github.com/neo4j/graph-data-science


* any list
{:toc}


