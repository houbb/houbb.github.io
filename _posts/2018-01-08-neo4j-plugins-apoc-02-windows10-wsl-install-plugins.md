---
layout: post
title:  Neo4j APOC-02-图数据库 apoc 插件 windows WSL 安装笔记
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


# 目的 

实现 WSL 中安装 apoc 插件。



# 版本关系

## neo4j

首先确认 neo4j server 的版本。

页面直接查看 4.4.29

或者命令

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

## apoc

去 apoc 中寻找 https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases

直接用 4.4.x 的

> [https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/4.4.0.36/apoc-4.4.0.36-all.jar](https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/4.4.0.36/apoc-4.4.0.36-all.jar)

下载

## 安装到 WSL 本地

wsl 对应的 windows 目录是：

```
\\wsl.localhost\Ubuntu\home\dh\neo4j\neo4j-community-4.4.29\plugins
```


直接将刚才的 jar 放进去、

## 修改 conf

conf/neo4j.conf 修改

```
dbms.security.procedures.unrestricted=apoc.*
dbms.security.procedures.allowlist=apoc.*
```

我这里已经设置了 gds，所以整体如下：

```
dbms.security.procedures.unrestricted=gds.*,apoc.*
dbms.security.procedures.allowlist=gds.*,apoc.*
```

## 重启服务

```
bin/neo4j restart
```

## 验证


直接执行命令：

```
RETURN apoc.version()
```

如下：

```
╒══════════════╕
│apoc.version()│
╞══════════════╡
│"4.4.0.36"    │
└──────────────┘
```


# 参考资料

[Neo4j安装插件](https://blog.csdn.net/m0_53573725/article/details/136964980)

[neo4j手动安装插件](https://blog.csdn.net/qq_35897203/article/details/107466850)

* any list
{:toc}


