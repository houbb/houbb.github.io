---
layout: post
title:  Neo4j-19-neo4j shell 命令行登录
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j, go, go-lang]
published: true
---



# 场景

一开始使用的是 windows 跳板机，可以直接页面访问比较方便。

后来过期了，就想着怎么使用命令登录？

# shell 登录

bin/cypher-shell 命令行登录时如何指定 neo4j 的端口号？ 

```sh
bin/cypher-shell -u <username> -p <password> -a <hostname>:<port>
```

比如：

```sh
bin/cypher-shell -u neo4j -p your_password -a localhost:7687
```

这里，neo4j 是默认的用户名。

your_password 是你为 neo4j 用户设置的密码。

localhost:7687 是默认的 Neo4j Bolt 连接端口。

# 参考资料

* any list
{:toc}

