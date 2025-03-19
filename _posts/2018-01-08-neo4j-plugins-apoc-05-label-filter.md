---
layout: post
title:  Neo4j APOC-05-图数据库 apoc 实战使用使用 labelFilter
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

# 场景

如果我只返回关注的节点会怎么样？

比如我不看 app_run_in_vm，那么最后还能连起来吗？

# 验证

## 默认

```cypher
MATCH (alarm:rca_alarm {name: '报警1'})
CALL apoc.path.subgraphAll(
    alarm,                            // 起始节点
    {relationshipFilter: "alarm_to_vm|app_run_in_vm|vm_run_in_phy",  // 关系类型过滤器
     labelFilter: "rca_vm|rca_phy|rca_app",  // 节点标签过滤器
     maxDepth: 3}                      // 最大深度
) YIELD nodes, relationships
RETURN nodes, relationships
```

## 效果

<svg xmlns="http://www.w3.org/2000/svg" width="203.3294677734375" height="311.43890380859375" viewBox="-71.78457641601562 -156.63681030273438 203.3294677734375 311.43890380859375"><title>Neo4j Graph Visualization</title><desc>Created using Neo4j (http://www.neo4j.com/)</desc><g class="layer relationships"><g class="relationship" transform="translate(29.96246740098568 125.80210061798937) rotate(300.3077488264886)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 41.22693455179643 0.5 L 41.22693455179643 -0.5 L 25 -0.5 Z M 95.60193455179643 0.5 L 111.82886910359287 0.5 L 111.82886910359287 3.5 L 118.82886910359287 0 L 111.82886910359287 -3.5 L 111.82886910359287 -0.5 L 95.60193455179643 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.41443455179643" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">alarm_to_vm</text></g><g class="relationship" transform="translate(102.54489888323698 1.630710081591064) rotate(181.23773975856585)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 37.83403987274278 0.5 L 37.83403987274278 -0.5 L 25 -0.5 Z M 100.52935237274278 0.5 L 113.36339224548556 0.5 L 113.36339224548556 3.5 L 120.36339224548556 0 L 113.36339224548556 -3.5 L 113.36339224548556 -0.5 L 100.52935237274278 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="69.18169612274278" y="3" transform="rotate(180 69.18169612274278 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">vm_run_in_phy</text></g><g class="relationship" transform="translate(40.34052926773581 -127.63680598157381) rotate(424.30283755907584)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 36.69453611931621 0.5 L 36.69453611931621 -0.5 L 25 -0.5 Z M 99.76094236931621 0.5 L 111.45547848863242 0.5 L 111.45547848863242 3.5 L 118.45547848863242 0 L 111.45547848863242 -3.5 L 111.45547848863242 -0.5 L 99.76094236931621 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.22773924431621" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">app_run_in_vm</text></g></g><g class="layer nodes"><g class="node" aria-label="graph-node30" transform="translate(29.96246740098568,125.80210061798937)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 报警1</text></g><g class="node" aria-label="graph-node32" transform="translate(102.54489888323698,1.630710081591064)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g><g class="node" aria-label="graph-node31" transform="translate(40.34052926773581,-127.63680598157381)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 应用A</text></g><g class="node" aria-label="graph-node33" transform="translate(-42.78457603807704,-1.5092778499213793)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#A5ABB6" stroke="#9AA1AC" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 192.168.…</text></g></g></svg>


## 当我不想看中间的一个节点时

比如我跳过 vm，只看 app 和 phy 物理机。

```cypher
MATCH (alarm:rca_alarm {name: '报警1'})
CALL apoc.path.subgraphAll(
    alarm,                            // 起始节点
    {relationshipFilter: "alarm_to_vm|app_run_in_vm|vm_run_in_phy",  // 关系类型过滤器
     labelFilter: "rca_phy|rca_app",  // 节点标签过滤器
     maxDepth: 3}                      // 最大深度
) YIELD nodes, relationships
RETURN nodes, relationships
```



# 参考资料

[Neo4j安装插件](https://blog.csdn.net/m0_53573725/article/details/136964980)

[neo4j手动安装插件](https://blog.csdn.net/qq_35897203/article/details/107466850)

* any list
{:toc}


