---
layout: post
title:  Neo4j APOC-01-图数据库 apoc 插件 windows10 安装 / neo4j install plugins apoc on windows10 
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

# 如何安装 APOC 插件

安装 Neo4j 的 APOC 插件的步骤相对简单，具体取决于你使用的是哪种 Neo4j 版本（例如 Neo4j Desktop、Neo4j Aura 或 Neo4j 服务器）。

以下是不同环境下安装 APOC 插件的步骤：

## 1. **Neo4j Desktop 安装 APOC 插件**

Neo4j Desktop 是一个桌面版的 Neo4j 安装工具，安装和管理 APOC 插件非常简单。

![neo4j-apoc](https://gitee.com/houbinbin/imgbed/raw/master/img/neo4j-apoc.png)

发现不太行，一直安装无响应。

#### 步骤：
1. 打开 **Neo4j Desktop** 应用。
2. 在左侧的 **Projects** 面板中，选择你要使用的 **Database**，然后点击该数据库旁边的 **Settings** 按钮（齿轮图标）。
3. 在弹出的设置页面中，找到 **Plugins** 选项卡。
4. 在插件列表中，找到 **APOC** 插件。如果没有显示，请确保 Neo4j Desktop 已连接到互联网。
5. 点击 **Install** 按钮安装 APOC 插件。安装完成后，它将自动启用。
6. 安装完成后，你可以在 **Database** 面板中看到 **APOC** 插件已启用。

## 3. **Neo4j 服务器版安装 APOC 插件**

对于自托管的 Neo4j 服务器，安装 APOC 插件需要手动操作。

你需要将 APOC 插件文件放入 Neo4j 的插件目录，并修改配置文件来启用它。

参考文档：[https://neo4j.com/docs/apoc/5/overview/](https://neo4j.com/docs/apoc/5/overview/)

#### 步骤：

1. **下载 APOC 插件**：

```
CALL dbms.components() YIELD name, versions
RETURN name, versions;
```

结果：

```
╒══════════════╤══════════╕
│name          │versions  │
╞══════════════╪══════════╡
│"Neo4j Kernel"│["5.12.0"]│
└──────────────┴──────────┘
```

我的 neo4j 版本是 5.12.0，对应的版本可以在文档查看

> [https://neo4j.com/docs/apoc/5/installation/#apoc](https://neo4j.com/docs/apoc/5/installation/#apoc)

对应的版本为：

https://github.com/neo4j/apoc/releases/tag/5.12.0


2. **将 APOC 插件复制到 Neo4j 插件目录**：

   - 将下载的 `apoc-x.x.x-all.jar` 文件复制到 Neo4j 的 `plugins` 目录。
   
   ![文件路径](https://i-blog.csdnimg.cn/blog_migrate/1387e2e8af6733ec8210ff8b8751dbfb.png)

   默认路径：
     - 对于 Linux/macOS：`/var/lib/neo4j/plugins/`
     - 对于 Windows：`C:\Program Files\Neo4j\neo4j-community-x.x.x\plugins\`

我的本地是：

```
C:\Users\dh\.Neo4jDesktop\relate-data\dbmss\dbms-95030949-1290-4c0a-867e-fd9f9aac13d6\plugins
```

3. **修改 Neo4j 配置文件**：
   - 打开 Neo4j 的配置文件 `neo4j.conf`。这个文件通常位于 `conf` 目录中，路径类似于：
     - 对于 Linux/macOS：`/etc/neo4j/neo4j.conf` 或 `/var/lib/neo4j/conf/neo4j.conf`
     - 对于 Windows：`C:\Program Files\Neo4j\neo4j-community-x.x.x\conf\neo4j.conf`
   
比如我的是在 :

```
C:\Users\dh\.Neo4jDesktop\relate-data\dbmss\dbms-95030949-1290-4c0a-867e-fd9f9aac13d6\conf
```

   - 在配置文件中添加以下行，启用 APOC 插件：

     ```properties
     dbms.security.procedures.unrestricted=apoc.*
     dbms.security.procedures.allowlist=apoc.*
     ```

这里我加了这两个，如果有多个，逗号隔开。

启动的时候失败了，发现以前有这个配置，改一下：

```
dbms.security.procedures.unrestricted=jwt.security.*,apoc.*

```

4. **重启 Neo4j**：
   - 保存配置文件并重启 Neo4j 服务器。你可以通过命令行重启 Neo4j：
     - 对于 Linux/macOS：
       ```bash
       sudo systemctl restart neo4j
       ```
     - 对于 Windows，使用 **Neo4j Desktop** 或服务管理工具进行重启。

5. **验证安装**：
   - 你可以通过执行以下 Cypher 查询来验证 APOC 插件是否安装成功：
     ```cypher
     RETURN apoc.version()
     ```
   - 如果安装成功，它会返回 APOC 的版本号。

返回

```
"5.12.0"
```


# 入门的例子

我们不能到这里就结束了，我们入门体验一下。

## 数据初始化

```
// Create nodes for people
CREATE (alice:Person {name: 'Alice', age: 30}),
       (bob:Person {name: 'Bob', age: 25}),
       (carol:Person {name: 'Carol', age: 35}),
       (dave:Person {name: 'Dave', age: 40});
```

创建关系

```
// 假设已经有了 Person 节点
MATCH (alice:Person {name: 'Alice'}), (bob:Person {name: 'Bob'})
CREATE (alice)-[:FRIEND]->(bob);

// 创建更多的关系
MATCH (bob:Person {name: 'Bob'}), (carol:Person {name: 'Carol'})
CREATE (bob)-[:FRIEND]->(carol);

MATCH (alice:Person {name: 'Alice'}), (carol:Person {name: 'Carol'})
CREATE (alice)-[:FRIEND]->(carol);

MATCH (carol:Person {name: 'Carol'}), (dave:Person {name: 'Dave'})
CREATE (carol)-[:FRIEND]->(dave);
```


## APOC

```
CALL apoc.help('') YIELD name
RETURN name
```

查看所有的方法。

## expand

`apoc.path.expand`参数签名如下：

- `startNode`：起始节点
- `relFilter`：关系类型过滤器
- `labelFilter`：标签过滤器
- `minDepth`：最小深度
- `maxDepth`：最大深度

在你的查询中，你缺少了 `labelFilter` 参数。根据你提供的查询，你应该添加一个空字符串 `''` 作为 `labelFilter` 参数，如下所示：

```cypher
MATCH (start:Person {name: 'Alice'})
CALL apoc.path.expand(start, 'FRIEND', '', 1, 1) YIELD path
RETURN path;
```

这里，我将 `minDepth` 设置为1，`maxDepth` 设置为5，这意味着你将从Alice开始，沿着 'FRIEND' 关系类型，寻找1到1跳的路径。

`labelFilter` 参数设置为空字符串，表示不对节点标签进行过滤。

结果：

```
╒══════════════════════════════════════════════════════════════════════╕
│path                                                                  │
╞══════════════════════════════════════════════════════════════════════╡
│(:Person {name: "Alice",age: 30})-[:FRIEND]->(:Person {name: "Carol",a│
│ge: 35})                                                              │
├──────────────────────────────────────────────────────────────────────┤
│(:Person {name: "Alice",age: 30})-[:FRIEND]->(:Person {name: "Bob",age│
│: 25})                                                                │
└──────────────────────────────────────────────────────────────────────┘
```

# 参考资料

[Neo4j安装插件](https://blog.csdn.net/m0_53573725/article/details/136964980)

[neo4j手动安装插件](https://blog.csdn.net/qq_35897203/article/details/107466850)

* any list
{:toc}


