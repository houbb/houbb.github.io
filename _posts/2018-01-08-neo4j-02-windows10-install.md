---
layout: post
title:  Neo4j-02-图数据库 neo4j install on windows10 安装笔记
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---



# 3 种安装方式

## 安装Neo4j Community Server

注意： neo4j 4.3及以上版本对应的java版本是jdk11

jdk8可以下载Neo4j Community Edition 3.5.28

下载：https://pan.baidu.com/s/1lvn55ZSUknaicVNdMblPEQ

提取码：8a54

文档：https://neo4j.com/docs/operations-manual/3.5/

进入到bin目录，执行 neo4j console

在浏览器中访问：http://localhost:7474

使用用户名neo4j和默认密码neo4j进行连接，然后会提示更改密码。

## docker 安装Neo4j Community Server

注意需要开放以下端口：

7474 for HTTP
7473 for HTTPS
7687 for Bolt

拉取镜像

```
docker pull neo4j:3.5.22-community
```

运行镜像

```
docker run -d -p 7474:7474 -p 7687:7687 --name neo4j \
-e "NEO4J_AUTH=neo4j/123456" \
-v /usr/local/soft/neo4j/data:/data \
-v /usr/local/soft/neo4j/logs:/logs \
-v /usr/local/soft/neo4j/conf:/var/lib/neo4j/conf \
-v /usr/local/soft/neo4j/import:/var/lib/neo4j/import \
neo4j:3.5.22-community
```


我们这里重点记录下第三种。 Neo4j Desktop 安装。

# windows10 安装 Neo4j Desktop

## Download

直接在 [官网下载](https://neo4j.com/download/?ref=product)，期间需要添加个注册信息，简单填写即可。

## Install

本次测试环境为 win7 系统，neo4j-1.0.9 版本。

运行程序 `Neo4j Desktop Setup 1.5.9.exe` 

安装的步骤及其简单，直接 Accept 一下协议就行。然后自动下载组件安装即可。

目标文件：C:\Users\Administrator\AppData\Local\Programs\Neo4j Desktop

完成后首页界面如下：

![首页界面](https://img-blog.csdnimg.cn/828c64f105f94b2b8e72f9a3d3d8856b.png)

## 相关说明

![neo4j](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0cd40b54be4c4d0fa33fb2cad42f568b~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

相关说明：

1. ConnectURL：数据库连接地址；

2. Database-leave empty for default：数据库；

3. Authentication type：鉴权方式（有三种：① 账号/密码登录；②无密码登录；③单点登录SSO）

⚠注意：由于我们通过 docker/podman 的方式启动时指定了 neo4j 的账号/密码（neo4j/secret），所以此处必须用第①种方式登录到 neo4j；

登录的首页：

![登录首页](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a42bc6921f1241648dbbdf5bfd02b8a9~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

## New Database

直接点击【New Database】 新建一个本地数据库，并且点击【Start】运行。

可以直接打开内置的 Neo4j Browser，或者浏览器打开 [http://localhost:7474/browser/](http://localhost:7474/browser/)

界面如下：

![2018-01-08-neo4j-database-index.png](https://raw.githubusercontent.com/houbb/resource/master/img/sql/nosql/neo4j/2018-01-08-neo4j-database-index.png)

可以在命令行输入框执行对应的 SQL 脚本，后面直接运行即可。

SQL 脚本为 [Cypher](https://neo4j.com/cypher-graph-query-language/) 语法。


## CRUD

### 增

- 插入节点

插入一个 Person 类别的节点，且这个节点有一个属性 name，属性值为 `Node A`

```
$   CREATE (a:Person { name : 'Node A'});
```

在插入另一个节点：

```
$   CREATE (b:Person { name : 'Node B'});
```


执行查询

```
$   MATCH (n) return n;
```

结果如下

![2018-01-08-neo4j-create-nodes.png](https://raw.githubusercontent.com/houbb/resource/master/img/sql/nosql/neo4j/2018-01-08-neo4j-create-nodes.png)

- 插入边

插入一条 a 到 b 的有向边，且边的类别为 Follow

```
MATCH (a:Person),(b:Person)
WHERE a.name = 'Node A' AND b.name = 'Node B'
CREATE (a)-[r:Follow]->(b);
```

再次查询，结果如下：

![2018-01-08-neo4j-create-side.png](https://raw.githubusercontent.com/houbb/resource/master/img/sql/nosql/neo4j/2018-01-08-neo4j-create-side.png)


### 改

- 更新节点信息

```
MATCH (n:Person { name: 'Node A' })
SET n.name = 'Node A Updated'; 
```

查询结果会自动变化，不在赘述。

### 查

- 最短路径

```
MATCH (a:Person { name:'Node A Updated' }),(b:Person { name:'Node B' }), p = shortestPath((a)-[r:Follow]-(b)) 
RETURN p;
```

结果如下：

```
╒════════════════════════════════════════════════╕
│"p"                                             │
╞════════════════════════════════════════════════╡
│[{"name":"Node A Updated"},{},{"name":"Node B"}]│
└────────────────────────────────────────────────┘
```

- 查询两个节点之间的关系。

```
MATCH (a:Person { name:'Node A Updated' })-[r]->(b:Person { name:'Node B' }) RETURN type(r);
```

查询结果:

```
╒═════════╕
│"type(r)"│
╞═════════╡
│"Follow" │
└─────────┘
```

- 查询一个节点的所有 Follower。

```
MATCH (:Person { name:'Node A Updated' })-[r:Follow]->(Person)
RETURN Person.name;
```

查询结果：

```
╒═════════════╕
│"Person.name"│
╞═════════════╡
│"Node B"     │
└─────────────┘
```

- 查看所有的节点数和边数

```
MATCH (n) RETURN count(n);
MATCH ()-->() RETURN count(*);
```

### 删

- 删除节点和与其相连的边

Neo4j 中如果一个节点有边相连，是不能单单删除这个节点的。

```
MATCH (n:Person { name:'Node A Updated' })
DETACH DELETE n;
```

- 删除边

```
MATCH (a:Person)-[r:Follow]->(b:Person)
WHERE a.name = 'Node A Updated' AND b.name = 'Node B'
DELETE r;
```

# Java Integration

> [Java 与 Neo4j 不得不说的故事](https://neo4j.com/developer/java/)

文档写的很赞，以后有时间定当拜读一下。


# 参考资料

> [top-ten-reasons](https://neo4j.com/top-ten-reasons/)

> [为什么选择图形数据库，为什么选择Neo4j？](http://blog.csdn.net/rubinorth/article/details/52451043)

https://www.cnblogs.com/liaozk/p/17138133.html

* any list
{:toc}


// 创建应用节点  
CREATE (appA:Application {name: '应用A'})  
CREATE (appB:Application {name: '应用B'})  
  
// 创建方法节点  
CREATE (methodA:Method {name: 'methodA', app: appA})  
CREATE (methodB:Method {name: 'methodB', app: appB})  
  
// 创建调用关系  
CREATE (methodA)-[:CALLS]->(methodB)


# 启动报错

安装路径:

```
C:\Users\dh\AppData\Local\Programs\Neo4j Desktop
```

or：

```
D:\Users\dh\AppData\Local\Programs\Neo4j Desktop
```

数据路径：

```
C:\Users\dh\C:\Users\dh\.Neo4jDesktop
```

重新安装一定要把数据清理干净。

