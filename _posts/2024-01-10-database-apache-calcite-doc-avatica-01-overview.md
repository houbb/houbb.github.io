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



# chat

## 详细介绍一下 apache calcite AVATICA 

Apache Calcite Avatica 是一个用于构建基于 JDBC 的分布式数据库驱动程序的开源项目。

它是 Apache Calcite 项目的一部分，专门用于处理 SQL 解析、优化和执行。

Avatica 主要针对大规模分布式系统，它提供了一个统一的 JDBC 接口，允许客户端通过 JDBC 连接到不同的分布式数据存储系统，如 Apache Hadoop、Apache HBase、Apache Phoenix、Apache Cassandra 等，以及其他支持 JDBC 的数据库。

以下是 Apache Calcite Avatica 的主要特性和功能：

1. **JDBC 接口**：Avatica 提供了一个标准的 JDBC 驱动程序，使得客户端可以使用标准的 JDBC API 与 Avatica 服务器进行通信，而不需要关心底层数据存储系统的细节。

2. **分布式查询**：Avatica 可以将 JDBC 查询请求转发到底层的分布式数据存储系统，并将结果返回给客户端。这使得客户端可以通过单个 JDBC 连接查询多个不同的数据源。

3. **安全性**：Avatica 支持安全功能，可以配置用户身份验证和授权，以确保只有经过授权的用户才能访问数据。

4. **性能优化**：Avatica 可以在查询过程中执行一些优化，例如将查询分解成更小的任务，以提高查询的性能和效率。

5. **跨平台兼容性**：Avatica 支持跨多种平台和编程语言使用，因为 JDBC 是一种通用的数据库访问标准，几乎所有的编程语言和平台都提供了对 JDBC 的支持。

6. **灵活性**：Avatica 的设计使得它可以轻松地扩展和定制，可以根据具体的需求添加新的功能或者修改现有的功能。

总的来说，Apache Calcite Avatica 提供了一个统一的、标准的接口，使得客户端可以通过 JDBC 访问各种不同的分布式数据存储系统，而无需关心底层系统的细节，从而简化了分布式系统的开发和管理。

## Avatica 是如何实现兼容不同的 jdbc 的？

Apache Calcite Avatica 实现了兼容不同 JDBC 的主要方法是通过以下方式：

1. **JDBC API 实现**：Avatica 实现了标准的 JDBC API，这意味着它提供了一组符合 JDBC 规范的接口和类，包括 `java.sql.Connection`、`java.sql.Statement`、`java.sql.PreparedStatement` 等。这使得 Avatica 可以与任何遵循 JDBC 标准的客户端程序兼容，因为客户端程序只需使用标准的 JDBC 接口即可与 Avatica 进行通信，而不需要关心底层的实现细节。

2. **协议层的实现**：除了实现标准的 JDBC 接口外，Avatica 还实现了自己的协议层，该协议层建立在 HTTP 或 WebSocket 之上，用于在客户端和 Avatica 服务器之间进行通信。通过定义自己的协议层，Avatica 可以提供更灵活的通信机制，以适应各种不同的客户端和数据存储系统之间的通信需求。

3. **适配器模式**：Avatica 使用适配器模式来适配不同的底层数据存储系统。每个数据存储系统都需要实现自己的 Avatica 适配器，该适配器负责将 Avatica 的 JDBC 请求转换成特定数据存储系统的原生查询语言，并将结果转换回标准的 JDBC 结果。通过这种方式，Avatica 可以与不同的数据存储系统集成，并通过适配器将它们统一起来，使得客户端无需关心底层系统的差异。

总的来说，Apache Calcite Avatica 实现了兼容不同 JDBC 的目标主要是通过实现标准的 JDBC API、定义自己的通信协议层以及使用适配器模式来实现的。

这些机制使得 Avatica 能够与不同的客户端和数据存储系统无缝集成，并提供统一的 JDBC 接口，简化了客户端程序与数据存储系统之间的通信和交互。

## calcite 中具体是如何使用 avatica 的，以 mysql jdbc 为例，给出具体的使用代码或者例子

在 Apache Calcite 中使用 Avatica 与 MySQL JDBC 驱动程序的整体步骤如下：

1. 添加 Avatica 和 MySQL JDBC 依赖。
2. 配置 Avatica 连接到 MySQL 数据库。
3. 使用 Avatica 提供的 JDBC 接口执行 SQL 查询。

下面是一个使用 Avatica 连接到 MySQL 数据库并执行查询的简单 Java 示例代码：

```java
import java.sql.*;

public class CalciteAvaticaExample {
    public static void main(String[] args) {
        Connection connection = null;
        Statement statement = null;
        ResultSet resultSet = null;

        try {
            // 加载 Avatica 驱动
            Class.forName("org.apache.calcite.avatica.remote.Driver");

            // 建立连接
            connection = DriverManager.getConnection("jdbc:avatica:remote:url=http://localhost:8765;serialization=protobuf", null);

            // 创建 Statement
            statement = connection.createStatement();

            // 执行查询
            resultSet = statement.executeQuery("SELECT * FROM your_table");

            // 处理结果集
            while (resultSet.next()) {
                // 读取数据并进行处理
                // 例如：String value = resultSet.getString("column_name");
            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            // 关闭资源
            try {
                if (resultSet != null) resultSet.close();
                if (statement != null) statement.close();
                if (connection != null) connection.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
```

在这个例子中，我们加载了 Avatica 驱动程序并使用 Avatica 的 JDBC URL 建立了与 Avatica 服务器的连接。

然后，我们创建了一个 Statement 对象，并使用它执行了一个查询。最后，我们处理查询结果集并关闭了所有的资源。

需要注意的是，在实际应用中，你需要替换 `your_table` 为你要查询的真实表名，并根据你的 MySQL 数据库配置修改连接 URL。

# 参考资料

https://calcite.apache.org/avatica/docs/index.html

* any list
{:toc}