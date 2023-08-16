---
layout: post
title:  Go Lang-09-database access 数据库访问
date:  2018-09-07 09:51:23 +0800
categories: [Lang]
tags: [go, lang, sh]
published: true
---


# 准备工作

## 创建测试账户

运行 root 账户执行命令。

```
-- 创建 go 
CREATE USER 'go'@'localhost' IDENTIFIED BY '123456'; 

-- 添加所有权限 
GRANT ALL PRIVILEGES ON *.* TO 'go'@'localhost'; 

-- 刷新权限 
FLUSH PRIVILEGES;
```

## 执行建表语句

创建并且使用数据库。

```
create database go;
use go;
```

创建表：

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

insert into users (name) values ('1');
insert into users (name) values ('2');
insert into users (name) values ('3');
```

数据验证：

```
mysql> select * from users;
+----+------+
| id | name |
+----+------+
|  1 | 1    |
|  2 | 2    |
|  3 | 3    |
+----+------+
```

# 代码

## 库安装

在 Go 语言中访问 MySQL 数据库，你需要使用第三方库来进行数据库操作。

一个常用的库是 github.com/go-sql-driver/mysql，它提供了与 MySQL 数据库交互的功能。


## 安装 mysql 库

```
> go get -u github.com/go-sql-driver/mysql
go: go.mod file not found in current directory or any parent directory.
        'go get' is no longer supported outside a module.
        To build and install a command, use 'go install' with a version,
        like 'go install example.com/cmd@latest'
        For more information, see https://golang.org/doc/go-get-install-deprecation
        or run 'go help get' or 'go help install'.
```

### 解决办法

办法1：命令行输入

```
go env -w GO111MODULE=auto
```

办法2：初始化Go moudle，在目录下运行下面命令

```
go mod init XXX //xxx代表文件夹名
```

### 实战

方式1：可以安装，但是代码中好像还是要处理。

```
go env -w GO111MODULE=auto

go get github.com/go-sql-driver/mysql
```

方式2：处理对应的包，引入 module

----------------------------------------

2.1 初始化对应的 mod

```
go mod init example.com/database

go: creating new go.mod: module example.com/database
go: to add module requirements and sums:
        go mod tidy
```

2.2 引入 

```
λ go get github.com/go-sql-driver/mysql

go: module github.com/go-sql-driver/mysql: Get "https://proxy.golang.org/github.com/go-sql-driver/mysql/@v/list": dial tcp 142.251.42.241:443: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.
```

安装报错。

这是因为无法对外网进行访问，可以通过输入一下命令进入代理网站进行访问

```
go env -w GOPROXY=https://goproxy.cn,direct
```

重新安装：

```
λ go get github.com/go-sql-driver/mysql
go: downloading github.com/go-sql-driver/mysql v1.7.1
go: added github.com/go-sql-driver/mysql v1.7.1
```

## 入门例子

下面是一个简单的入门示例，演示如何在 Go 中访问 MySQL 数据库：

```go
package main

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	// 连接数据库
	dsn := "go:123456@tcp(127.0.0.1:3306)/go"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	// 查询数据库
	rows, err := db.Query("SELECT id, name FROM users")
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	// 处理查询结果
	for rows.Next() {
		var id int
		var name string
		if err := rows.Scan(&id, &name); err != nil {
			panic(err)
		}
		fmt.Printf("ID: %d, Name: %s\n", id, name)
	}

	if err := rows.Err(); err != nil {
		panic(err)
	}
}
```

运行

```
go run main.go
```


效果如下：

```
> go run main.go

ID: 1, Name: 1
ID: 2, Name: 2
ID: 3, Name: 3
```

直接就查出来了。

PS: 发现如果直接把 module 信息移除，这里直接处理应该也可以。不过包的安装还需要后续深入学习。

# go module介绍

go module是go官方自带的go依赖管理库,在1.13版本正式推荐使用

go module可以将某个项目(文件夹)下的所有依赖整理成一个 go.mod 文件,里面写入了依赖的版本等 使用

go module之后我们可不用将代码放置在src下了 使用 go module 管理依赖后会在项目根目录下生成两个文件 go.mod 和go.sum

## GO111MODULE

GO111MODULE是 go modules 功能的开关，关于go modules本文不详述，这个涉及到go的一种很重要的管理机制，我们可以简单的理解为，在没有go modules机制时，go工程中对于第三方功能包的管理非常复杂，也非常专业，这就导致程序员在进行开发的时候，对于第三方功能包的管理很不方便，所以才有了go modules机制。

这个机制的开关是通过GO111MODULE环境变量来配置的。

GO111MODULE=off，无模块支持，go命令行将不会支持module功能，寻找依赖包的方式将会沿用旧版本那种通过vendor目录或者GOPATH模式来查找。

GO111MODULE=on，模块支持，go命令行会使用modules，而一点也不会去GOPATH目录下查找。

GO111MODULE=auto，默认值，go命令行将会根据当前目录来决定是否启用module功能。

这种情况下可以分为两种情形：

（1）当前目录在GOPATH/src之外且该目录包含go.mod文件，开启模块支持。

（2）当前文件在包含go.mod文件的目录下面。




# 参考资料

https://go.dev/doc/tutorial/add-a-test

https://www.techdatao.com/article/detail/57.html

* any list
{:toc}