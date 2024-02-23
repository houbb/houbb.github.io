---
layout: post
title: Apache Calcite doc avatica-01-Background 背景
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# Avatica

Avatica 是一个用于构建数据库的 JDBC 和 ODBC 驱动程序以及 RPC 通信协议的框架。

![avatica-architecture](https://raw.githubusercontent.com/julianhyde/share/main/slides/avatica-architecture.png)

Avatica 的 Java 绑定具有非常少的依赖关系。

尽管它是 Apache Calcite 的一部分，但它不依赖于 Calcite 的其他部分。它仅依赖于 JDK 8+ 和 Jackson。

Avatica 的通信协议是通过 HTTP 传输的 JSON 或 Protocol Buffers。JSON 协议的 Java 实现使用 Jackson 将请求/响应命令对象转换为 JSON 格式，反之亦然。

Avatica-Server 是 Avatica RPC 的 Java 实现。

核心概念：

- Meta 是一个本地 API，足以实现任何 Avatica 提供者。
- AvaticaFactory 创建 JDBC 类的实现，基于 Meta。
- Service 是一个接口，它以请求和响应命令对象的形式实现了 Meta 的功能。

# JDBC

Avatica通过AvaticaFactory实现了JDBC。AvaticaFactory的实现创建了JDBC类（Driver、Connection、Statement、ResultSet）的实现，基于Meta。

# ODBC

Avatica尚未开始进行ODBC方面的工作。

Avatica ODBC将使用相同的通信协议，并且可以使用相同的Java服务器实现。ODBC客户端将使用C或C++编写。

由于Avatica协议抽象了许多提供者之间的差异，同一个ODBC客户端可以用于不同的数据库。

尽管Avatica项目不包括ODBC驱动程序，但已经有基于Avatica协议的ODBC驱动程序，例如Apache Phoenix的ODBC驱动程序。

HTTP服务器

Avatica-server嵌入了Jetty HTTP服务器，提供了一个实现了Avatica RPC协议的HttpServer类，可以作为一个独立的Java应用程序运行。

如果需要，可以通过扩展HttpServer类并重写其configureConnector()方法来配置HTTP服务器中的连接器。例如，用户可以将requestHeaderSize设置为64K字节，如下所示：

```java
HttpServer server = new HttpServer(handler) {
  @Override
  protected ServerConnector configureConnector(
      ServerConnector connector, int port) {
    HttpConnectionFactory factory = (HttpConnectionFactory)
        connector.getDefaultConnectionFactory();
    factory.getHttpConfiguration().setRequestHeaderSize(64 << 10);
    return super.configureConnector(connector, port);
  }
};
server.start();
```

# 项目结构

我们知道客户端库具有最小的依赖关系是很重要的。

Avatica是Apache Calcite的一个子项目，维护在一个单独的存储库中。它不依赖于Calcite的任何其他部分。

包:

org.apache.calcite.avatica 核心框架
org.apache.calcite.avatica.remote 使用远程过程调用的JDBC驱动程序
org.apache.calcite.avatica.server HTTP服务器
org.apache.calcite.avatica.util 实用工具
状态

## 已实现

建立连接、创建语句、元数据、准备、绑定、执行、获取
使用JSON通过HTTP进行远程过程调用(RPC)

## 本地实现
在现有的JDBC驱动程序上实现
复合RPC(将多个请求组合成一个往返)
执行-获取
获取元数据(例如，getTables等元数据调用返回所有行)

## 未实现

ODBC
远程过程调用
关闭语句
关闭连接
复合RPC
创建语句-准备
关闭语句-关闭连接
准备-执行-获取(Statement.executeQuery应该首先获取前N行)
从语句表中删除语句
DML(INSERT、UPDATE、DELETE)
对SELECT语句应用Statement.execute

## 客户端

以下是可用的Avatica客户端列表。其中一些描述自己是Apache Phoenix的适配器，但也适用于其他Avatica后端。非常欢迎其他语言的客户端贡献!

Microsoft .NET驱动程序适用于Apache Phoenix查询服务器
主页
语言：C#
许可证：Apache 2.0
Avatica版本1.2.0及以上
维护者：Microsoft Azure
Apache Phoenix/Avatica SQL驱动程序
主页
语言：Go
许可证：Apache 2.0
Avatica版本1.8.0及以上
维护者：Boostport和Apache Calcite社区
Avatica轻客户端
主页
语言：Java
许可证：Apache 2.0
任何Avatica版本
维护者：Apache Calcite社区
Python的Apache Phoenix数据库适配器
主页
语言：Python
许可证：Apache 2.0
Avatica版本1.2.0及以上
维护者：Apache Phoenix社区
JavaScript绑定到Calcite Avatica服务器
主页
语言：JavaScript
许可证：MIT
任何Avatica版本
维护者：Waylay.io
Calcite Avatica CLI：基于Go的工具
主页
语言：Go
许可证：Apache 2.0
Avatica版本1.8.0及以上
维护者：Satya Kommula

# 参考资料

https://calcite.apache.org/avatica/docs/index.html

* any list
{:toc}