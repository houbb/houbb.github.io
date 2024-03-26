---
layout: post
title: 数据库基础知识 mysql/oracle 如何根据 host port dbName 构建完整的 url?
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, sql-basic, sh]
published: true
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# 需求

有时候我们希望根据基本信息，构建出对应的数据库连接信息。

# chat

## Q: mysql 根据 dbName, host, port 如何拼接数据库 jdbc url?

在MySQL中，拼接数据库的JDBC URL通常遵循以下格式：

```
jdbc:mysql://[host]:[port]/[dbName]?[parameters]
```

其中：

- `[host]`是MySQL服务器的主机名或IP地址。
- `[port]`是MySQL服务器的端口号，默认情况下是3306。
- `[dbName]`是数据库的名称。
- `[parameters]`是可选的连接参数，例如SSL配置等。

因此，要根据dbName、host和port拼接数据库的JDBC URL，只需将它们替换到URL的相应位置即可。

例如，如果dbName是"mydatabase"，host是"localhost"，port是"3306"，则JDBC URL将是：

```
jdbc:mysql://localhost:3306/mydatabase
```

如果有额外的参数，例如SSL配置，可以通过在URL末尾添加参数来包含它们，例如：

```
jdbc:mysql://localhost:3306/mydatabase?useSSL=true&requireSSL=true
```

这样就可以构建出完整的MySQL数据库的JDBC URL。

## oracle 呢？

对于Oracle数据库，构建JDBC URL的格式通常如下：

```
jdbc:oracle:thin:@//[host]:[port]/[serviceName]
```

其中：

- `[host]`是Oracle数据库服务器的主机名或IP地址。
- `[port]`是Oracle数据库服务器的端口号，默认情况下是1521。
- `[serviceName]`是Oracle数据库的服务名或SID。

因此，要根据serviceName、host和port构建Oracle数据库的JDBC URL，只需将它们替换到URL的相应位置即可。

例如，如果serviceName是"orcl"，host是"localhost"，port是"1521"，则JDBC URL将是：

```
jdbc:oracle:thin:@//localhost:1521/orcl
```

这样就可以构建出完整的Oracle数据库的JDBC URL。

# 参考资料


* any list
{:toc}