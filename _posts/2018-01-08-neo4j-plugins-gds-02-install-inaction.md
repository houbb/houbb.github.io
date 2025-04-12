---
layout: post
title:  Neo4j GDS-02-graph-data-science 插件库安装实战笔记
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

# 目标

实现 neo4j GDS 插件库的安装。

首先需要明确几个问题：

1）neo4j 安装

2）neo4j 对应的 gds 版本

3）gds 的安装


# neo4j 安装

[Neo4j-02-图数据库 neo4j install on windows10 安装笔记 neo4j 官网 403 问题](https://houbb.github.io/2018/01/08/neo4j-02-windows10-install)

[Neo4j-02-图数据库 neo4j install on windows10 WSL 安装笔记 sdkman install jdk11 neo4j 配置详解 neo4j.conf](https://houbb.github.io/2018/01/08/neo4j-02-windows10-install-WSL)

然后确认一下 neo4j 的版本

http://localhost:17474/browser/

```
CALL dbms.components() YIELD name, versions, edition
UNWIND versions AS version
RETURN name, version, edition;
```

如下：

```
╒══════════════╤════════╤═══════════╕
│name          │version │edition    │
╞══════════════╪════════╪═══════════╡
│"Neo4j Kernel"│"4.4.29"│"community"│
└──────────────┴────────┴───────────┘
```

# GDS 库的版本

接下来，我们需要找到对应版本的 gds 库。

在 [https://github.com/neo4j/graph-data-science/releases](https://github.com/neo4j/graph-data-science/releases) 下面寻找合适的版本。

找到了这个 [https://github.com/neo4j/graph-data-science/releases/tag/2.5.3](https://github.com/neo4j/graph-data-science/releases/tag/2.5.3)

New features Add support for Neo4j 4.4.27，应该也支持 4.4.29

# 安装 GDS

## 下载

直接下载对应的 jar [https://github.com/neo4j/graph-data-science/releases/download/2.5.3/neo4j-graph-data-science-2.5.3.jar](https://github.com/neo4j/graph-data-science/releases/download/2.5.3/neo4j-graph-data-science-2.5.3.jar)

## 位置

上传到对应的位置 `~\neo4j\neo4j-community-4.4.29\plugins\`，本地是 WSL 测试，可以直接放在

```
\\wsl.localhost\Ubuntu\home\dh\neo4j\neo4j-community-4.4.29\plugins
```

## 修改配置文件

修改 `~\neo4j\neo4j-community-4.4.29\conf\neo4j.conf`，修改配置启用 GDS


```properties
dbms.security.procedures.unrestricted=gds.*
dbms.security.procedures.allowlist=gds.*
```

多个插件之间用英文逗号分隔。

## 重启服务

```
cd ~/neo4j/neo4j-community-4.4.29/
bin/neo4j restart
```

日志确认 logs/neo4j.log


## 确认 gds 安装成功

neo4j cypher 命令

```
return gds.version();
```

效果：

```
╒═════════════╕
│gds.version()│
╞═════════════╡
│"2.5.3"      │
└─────────────┘
```

后续我们可以考虑入门看一下对应的算法。

# 参考资料

https://github.com/neo4j/graph-data-science


* any list
{:toc}


