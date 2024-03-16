---
layout: post
title: Apache Tomcat DBCP（Database Connection Pool） 数据库连接池-01-入门介绍
date:  2020-7-17 16:52:15 +0800
categories: [Database]
tags: [database, sql, dbcp, sh]
published: true
---

# 拓展阅读

[从零开始手写 mybatis （三）jdbc pool 如何从零手写实现数据库连接池 dbcp？](https://houbb.github.io/2020/06/21/hand-write-mybatis-03-jdbc-pool)

[万字长文深入浅出数据库连接池 HikariCP/Commons DBCP/Tomcat/c3p0/druid 对比](https://houbb.github.io/2020/07/17/dbcp-00-all-in-one)

[Database Connection Pool 数据库连接池概览](https://houbb.github.io/2020/07/17/dbcp-01-overview)

[c3p0 数据池入门使用教程](https://houbb.github.io/2020/07/17/dbcp-03-c3p0-00-hello-world)

[alibaba druid 入门介绍](https://houbb.github.io/2020/07/17/dbcp-04-druid-01-intro)

[数据库连接池 HikariCP 性能为什么这么快？](https://houbb.github.io/2020/07/17/dbcp-05-HikariCP-02-why-so-fast)

[Apache Tomcat DBCP（Database Connection Pool） 数据库连接池-01-入门介绍](https://houbb.github.io/2020/07/17/dbcp-06-tomcat-pool-01-intro)

[vibur-dbcp 并发、快速且功能完备的 JDBC 连接池，提供先进的性能监控功能-01-入门介绍](https://houbb.github.io/2020/07/17/dbcp-07-vibur-pool-01-intro)


# chat

## 介绍一下 tomcat dbcp 

Apache Tomcat DBCP（Database Connection Pool）是一个用于管理数据库连接的组件，通常与Apache Tomcat服务器一起使用。

它提供了一种机制来有效地管理数据库连接，以便在高负载下提供更好的性能和可伸缩性。

以下是Tomcat DBCP的一些关键特性和工作原理：

1. **连接池管理：** Tomcat DBCP通过创建和维护一组预先配置的数据库连接来管理连接池。这些连接在需要时可以被应用程序使用，并在不再需要时释放回池中。

2. **连接池参数配置：** 可以通过Tomcat的配置文件（如context.xml）或者直接在应用程序中的代码中配置连接池的各种参数，例如最大连接数、最小连接数、最大等待时间等。

3. **连接池的工作流程：** 当应用程序需要与数据库进行交互时，它从连接池中请求一个数据库连接。如果连接池中有空闲的连接可用，连接池会将一个连接分配给应用程序。一旦应用程序完成了对数据库的操作，它将连接返回给连接池，以供其他应用程序使用。

4. **连接验证：** Tomcat DBCP可以配置为在从连接池中获取连接时验证连接的有效性。这可以通过执行简单的SQL查询或其他形式的连接测试来实现。这有助于确保从池中获取的连接是可用和有效的。

5. **性能优化：** 通过维护一组已经打开的数据库连接，Tomcat DBCP可以避免在每次数据库请求时都重新创建和销毁连接，从而提高了性能和效率。

6. **异常处理：** Tomcat DBCP能够处理数据库连接的异常情况，例如数据库服务器断开连接或者连接超时。它会尝试重新建立连接或者返回错误信息，以便应用程序能够适当地处理这些异常情况。

7. **监控和管理：** Tomcat DBCP提供了监控和管理连接池的功能，可以通过JMX（Java Management Extensions）接口来查看连接池的状态、活动连接数、空闲连接数等信息，并且可以通过管理工具对连接池进行操作。

总的来说，Tomcat DBCP是一个非常有用的工具，可以帮助开发人员有效地管理数据库连接，提高应用程序的性能和可伸缩性，并且可以通过灵活的配置来满足不同应用程序的需求。

## 为什么 tomcat 需要 dbcp？它有链接数据库的需求吗？

Apache Tomcat作为一个Java Servlet容器和Web服务器，并不直接涉及到与数据库的连接。

然而，很多基于Java的Web应用程序通常需要与数据库进行交互，例如从数据库中检索数据、向数据库中写入数据等操作。

在这种情况下，Apache Tomcat可以与数据库连接池组件（比如DBCP）结合使用，以便有效地管理数据库连接。

以下是为什么Apache Tomcat可能需要DBCP的一些原因：

1. **数据库连接需求：** 大多数Web应用程序需要访问数据库以存储和检索数据。这些应用程序可以是基于Java的，而且通常使用JDBC（Java Database Connectivity）来与数据库进行通信。

2. **连接管理：** 直接在应用程序中创建和管理数据库连接可能会导致一些问题，比如连接泄漏（未正确关闭连接导致资源泄漏）、连接池过载（同时打开太多连接导致性能下降）等。连接池组件（如DBCP）可以帮助解决这些问题，提供了一种更好的方式来管理和重用数据库连接。

3. **性能优化：** 使用连接池可以显著提高性能，因为它避免了在每次数据库请求时都重新创建和销毁连接的开销。连接池维护了一组已经打开的数据库连接，这些连接可以被应用程序重复使用，从而减少了连接的创建和销毁次数，提高了系统的性能和效率。

4. **连接验证和异常处理：** 连接池组件通常提供了连接验证和异常处理的功能，可以确保从池中获取的连接是有效的，并且能够处理数据库连接的异常情况，例如数据库服务器断开连接或者连接超时等情况。

综上所述，尽管Apache Tomcat本身并不直接涉及与数据库的连接，但大多数基于Java的Web应用程序通常需要与数据库进行交互。

在这种情况下，结合使用Apache Tomcat和数据库连接池组件（如DBCP）可以提供更好的连接管理和性能优化，从而更好地满足应用程序的需求。

## tomcat 为什么不直接使用 c3p0 commons-dbcp 这些已有的？而是要自己实现

Apache Tomcat 一开始确实使用了像 Commons DBCP 和 Commons Pool 这样的外部组件来管理数据库连接池。

然而，后来 Apache Tomcat 团队决定开发自己的连接池实现，即 Tomcat DBCP。

这是有几个原因的：

1. **更好的集成：** 将连接池功能直接集成到 Tomcat 中可以提供更好的性能和更好的集成。这样做可以更好地与 Tomcat 内部的线程管理、类加载器和上下文生命周期等功能集成，以便提供更一致和更可靠的连接池管理。

2. **性能优化：** Apache Tomcat 团队可以更深入地了解 Tomcat 本身的内部工作原理，以优化连接池的性能，使其更适合与 Tomcat 一起使用。自己实现的连接池可能会针对 Tomcat 的特定需求进行优化，以提供更好的性能和可靠性。

3. **更好的控制：** 通过开发自己的连接池实现，Apache Tomcat 团队可以更好地控制连接池的开发和维护过程。他们可以根据自己的需求进行定制和扩展，而不受外部库的限制。

4. **解决特定问题：** 有时候外部库可能存在一些限制或者问题，而开发自己的实现可以更灵活地解决这些问题。可能是因为在特定的使用情况下，已有的库无法满足 Tomcat 的需求，或者为了解决一些已知的问题而决定开发自己的实现。

总的来说，Apache Tomcat 团队决定开发自己的连接池实现是出于对性能、集成和控制的考虑。这样做可以更好地满足 Tomcat 用户的需求，并提供更优秀的连接池管理功能。

## 给出 tomcat dbcp 的入门使用例子

下面是一个简单的示例，演示如何在Apache Tomcat中使用DBCP连接池：

1. 首先，确保你已经在Tomcat的`lib`目录中包含了所需的JAR文件，通常包括`commons-dbcp.jar`和`commons-pool.jar`。

2. 在你的Web应用程序的`WEB-INF`目录下创建一个名为`context.xml`的文件，并在其中配置数据库连接池。以下是一个示例`context.xml`文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Context>
    <Resource name="jdbc/TestDB" auth="Container" type="javax.sql.DataSource"
               maxActive="100" maxIdle="30" maxWait="10000"
               username="your_username" password="your_password"
               driverClassName="com.mysql.jdbc.Driver"
               url="jdbc:mysql://localhost:3306/your_database"/>
</Context>
```

请确保将`username`、`password`和`url`属性替换为你的数据库连接信息。

3. 在你的Web应用程序中，你可以通过JNDI查找来获取数据库连接。以下是一个简单的Servlet示例，演示如何获取数据库连接并执行查询：

```java
import java.io.*;
import java.sql.*;
import javax.naming.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.sql.*;

public class MyServlet extends HttpServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        Connection conn = null;
        try {
            // 查找上下文中的数据库连接池
            Context ctx = new InitialContext();
            DataSource ds = (DataSource) ctx.lookup("java:comp/env/jdbc/TestDB");

            // 从连接池获取连接
            conn = ds.getConnection();

            // 执行查询
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM your_table");
            while (rs.next()) {
                out.println("ID: " + rs.getInt("id") + ", Name: " + rs.getString("name"));
                out.println("<br/>");
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 关闭连接
            try {
                if (conn != null)
                    conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
```

确保将上述代码中的`your_table`替换为你要查询的实际数据库表名。

4. 部署你的Web应用程序到Tomcat服务器，并访问相应的URL以查看结果。

请注意，以上示例只是一个简单的演示，实际上在生产环境中需要进行更多的配置和错误处理。


# 参考资料

https://github.com/apache/tomcat/tree/main/java/org/apache/tomcat/dbcp

https://github.com/seaswalker/tomcat-jdbc-notes/blob/master/note/note.md

* any list
{:toc}