---
layout: post
title:  Neo4j-11-neo4j go access go 直接访问 neo4j go neo4j
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j, go, go-lang]
published: true
---

# go 访问 neo4j 实战

## 1. neo4j 准备工作

本地启动 neo4j

此处的 neo4j server 版本：

```
Cluster role:	primary
Version:	5.12.0
Edition:	Enterprise
Name:	neo4j
```

### 初始数据

```
MATCH (n:Actor) RETURN n LIMIT 25
```

如下：

```
╒══════════════════════════════════╕
│n                                 │
╞══════════════════════════════════╡
│(:Actor {name: "Keanu Reeves"})   │
├──────────────────────────────────┤
│(:Actor {name: "Carrie-Ann Moss"})│
└──────────────────────────────────┘
```

## go 代码

### neo4j.go

```go
package main

import (
	"fmt"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

func main() {
	// Neo4j数据库连接信息
	neo4jURI := "bolt://localhost:7687"
	username := "neo4j"
	password := "12345678"

	// 创建Neo4j数据库驱动
	driver, err := neo4j.NewDriver(neo4jURI, neo4j.BasicAuth(username, password, ""))

	if err != nil {
		fmt.Println("Error creating Neo4j driver:", err)
		return
	}
	defer driver.Close()

	// 创建数据库会话
	session, err := driver.Session(neo4j.AccessModeRead)
	if err != nil {
		fmt.Println("Error creating Neo4j session:", err)
		return
	}
	defer session.Close()

	// 运行Cypher查询
	result, err := session.Run("MATCH (n:Actor) RETURN n LIMIT 25", map[string]interface{}{})
	if err != nil {
		fmt.Println("Error running Cypher query:", err)
		return
	}

	// 处理查询结果
	for result.Next() {
		node := result.Record().GetByIndex(0)
		fmt.Println(node)
	}
}
```

注意：这里需要引入指定版本的 v4 neo4j 驱动。

### 构建 modules

目前 go 都是模块化开发，需要初始化对应的模块。

```
# 生成 mod 文件（切换到模块根目录）
go mod init neo4j

# 清理无效依赖，增加缺失依赖
go mod tidy
```

日志如下：

```
D:\go\neo4j
λ go mod init neo4j
go: creating new go.mod: module neo4j
go: to add module requirements and sums:
        go mod tidy

D:\go\neo4j
λ go mod tidy
....
go: downloading golang.org/x/text v0.3.0
```

### 运行

```
go run neo4j.go
```

日志如下：

```
λ go run neo4j.go
{1 [Actor] map[name:Keanu Reeves]}
{2 [Actor] map[name:Carrie-Ann Moss]}
```

# chat

## Q: noe4j go 客户端

Neo4j是一款开源的图形数据库管理系统，支持使用Cypher查询语言进行图形数据库的操作。如果你想要使用Go语言来连接Neo4j数据库，可以使用Neo4j官方提供的Go驱动程序。

目前，Neo4j官方提供的Go驱动是`neo4j-go-driver`。你可以通过在Go项目中导入该库来开始使用Neo4j数据库。以下是一个简单的例子，演示如何在Go中使用Neo4j Go驱动：

首先，你需要安装`neo4j-go-driver`库，可以使用以下命令：

```bash
go get github.com/neo4j/neo4j-go-driver/neo4j
```

然后，在你的Go代码中，你可以使用以下样例代码连接到Neo4j数据库：

```go
package main

import (
	"fmt"
	"github.com/neo4j/neo4j-go-driver/neo4j"
)

func main() {
	// Neo4j数据库连接信息
	neo4jURI := "bolt://localhost:7687"
	username := "your_username"
	password := "your_password"

	// 创建Neo4j数据库驱动
	driver, err := neo4j.NewDriver(neo4jURI, neo4j.BasicAuth(username, password, ""))
	if err != nil {
		fmt.Println("Error creating Neo4j driver:", err)
		return
	}
	defer driver.Close()

	// 创建数据库会话
	session, err := driver.Session(neo4j.AccessModeRead)
	if err != nil {
		fmt.Println("Error creating Neo4j session:", err)
		return
	}
	defer session.Close()

	// 运行Cypher查询
	result, err := session.Run("MATCH (n) RETURN n", map[string]interface{}{})
	if err != nil {
		fmt.Println("Error running Cypher query:", err)
		return
	}

	// 处理查询结果
	for result.Next() {
		node := result.Record().GetByIndex(0)
		fmt.Println(node)
	}
}
```



请注意，你需要将上述代码中的`neo4jURI`、`username`和`password`替换为你自己Neo4j数据库的连接信息。

以上是一个简单的例子，演示了如何使用Neo4j Go驱动连接到数据库并运行一个简单的Cypher查询。你可以根据你的需求扩展和修改代码。确保在使用时遵循Neo4j数据库的安全最佳实践。

## 解决方式

```
# 生成 mod 文件（切换到模块根目录）
go mod init neo4j

# 清理无效依赖，增加缺失依赖
go mod tidy
```


日志：

```
go: creating new go.mod: module neo4j
go: to add module requirements and sums:
        go mod tidy

```






# 参考资料

chat

https://stackoverflow.com/questions/66522758/the-neo4j-cypher-shell-and-the-browser-connections-are-working-but-the-golang-cl


* any list
{:toc}

