---
layout: post
title: go in action-08-once init go 如何只初始化一次？sync.Once
date: 2023-09-25 21:01:55 +0800
categories: [Go]
tags: [monitor, go, go-lang, in-action, sh]
published: true
---

# 简单的数据库访问

对的，你是对的。在上述示例中，`ReadNeo4j` 函数每次被调用时都会创建一个新的连接池和会话，并在函数结束时关闭这些资源。

如果你希望在多次调用中重用连接池，可以将连接池和会话作为函数参数传递进来，而不是在函数内部创建。

以下是修改后的例子：

```go
package main

import (
	"fmt"
	"github.com/neo4j/neo4j-go-driver/neo4j"
)

// Neo4jConfig 包含Neo4j数据库的连接配置
type Neo4jConfig struct {
	URI      string
	Username string
	Password string
}

// ReadNeo4j 用于执行Neo4j数据库的读取操作
func ReadNeo4j(driver neo4j.Driver, session neo4j.Session, query string, parameters map[string]interface{}) error {
	// 执行查询
	result, err := session.Run(query, parameters)
	if err != nil {
		return err
	}

	// 处理查询结果
	for result.Next() {
		// 处理查询结果的逻辑
		record := result.Record()
		fmt.Println(record)
	}

	return nil
}

func main() {
	// 配置Neo4j连接信息
	neo4jConfig := Neo4jConfig{
		URI:      "bolt://localhost:7687",
		Username: "your_username",
		Password: "your_password",
	}

	// 创建驱动程序
	driver, err := neo4j.NewDriver(neo4jConfig.URI, neo4j.BasicAuth(neo4jConfig.Username, neo4jConfig.Password, ""))
	if err != nil {
		fmt.Println("Error creating Neo4j driver:", err)
		return
	}
	defer driver.Close()

	// 在需要的时候创建会话
	session, err := driver.NewSession(neo4j.SessionConfig{
		AccessMode: neo4j.AccessModeRead, // 读取模式，可以根据需要调整
	})
	if err != nil {
		fmt.Println("Error creating Neo4j session:", err)
		return
	}
	defer session.Close()

	// 调用ReadNeo4j方法执行读取操作
	query := "MATCH (n) RETURN n"
	parameters := map[string]interface{}{}
	err = ReadNeo4j(driver, session, query, parameters)
	if err != nil {
		fmt.Println("Error reading from Neo4j:", err)
	}
}
```

在这个修改后的例子中，创建驱动程序和会话的代码移到了`main`函数外部，在需要的时候创建一次，并将它们传递给`ReadNeo4j`函数。

这样，你就可以在多次调用`ReadNeo4j`的过程中重用相同的连接池和会话。


# 改为类内部

在Go中，你可以使用包级别的变量来确保某些初始化只发生一次。

在这个情况下，你可以使用`sync.Once`来保证连接池只初始化一次。

以下是一个示例代码，演示如何在Go中使用`sync.Once`确保连接池只初始化一次：

```go
package main

import (
	"fmt"
	"sync"
	"github.com/neo4j/neo4j-go-driver/neo4j"
)

// Neo4jConfig 包含Neo4j数据库的连接配置
type Neo4jConfig struct {
	URI      string
	Username string
	Password string
}

var (
	driver neo4j.Driver
	once   sync.Once
)

// initNeo4j 初始化Neo4j连接池
func initNeo4j(config Neo4jConfig) error {
	var err error

	// 创建驱动程序
	driver, err = neo4j.NewDriver(config.URI, neo4j.BasicAuth(config.Username, config.Password, ""))
	if err != nil {
		return err
	}

	return nil
}

// ReadNeo4j 用于执行Neo4j数据库的读取操作
func ReadNeo4j(query string, parameters map[string]interface{}) error {
	// 使用 sync.Once 确保初始化只发生一次
	once.Do(func() {
		neo4jConfig := Neo4jConfig{
			URI:      "bolt://localhost:7687",
			Username: "your_username",
			Password: "your_password",
		}
		err := initNeo4j(neo4jConfig)
		if err != nil {
			fmt.Println("Error initializing Neo4j:", err)
			return
		}
	})

	// 创建会话
	session, err := driver.NewSession(neo4j.SessionConfig{
		AccessMode: neo4j.AccessModeRead, // 读取模式，可以根据需要调整
	})
	if err != nil {
		return err
	}
	defer session.Close()

	// 执行查询
	result, err := session.Run(query, parameters)
	if err != nil {
		return err
	}

	// 处理查询结果
	for result.Next() {
		// 处理查询结果的逻辑
		record := result.Record()
		fmt.Println(record)
	}

	return nil
}

func main() {
	// 调用ReadNeo4j方法执行读取操作
	query := "MATCH (n) RETURN n"
	parameters := map[string]interface{}{}
	err := ReadNeo4j(query, parameters)
	if err != nil {
		fmt.Println("Error reading from Neo4j:", err)
	}
}
```

在上述例子中，`initNeo4j` 函数使用 `sync.Once` 确保它只被调用一次。

在 `ReadNeo4j` 函数中，通过调用 `once.Do` 来确保 `initNeo4j` 只被执行一次，从而确保连接池只初始化一次。

这种方法避免了在每次 `ReadNeo4j` 调用时都重新初始化连接池。


# 参考资料

chat

* any list
{:toc}
