---
layout: post
title: web server apache tomcat11-09-JNDI Datasource How-To
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 前言

整理这个官方翻译的系列，原因是网上大部分的 tomcat 版本比较旧，此版本为 v11 最新的版本。

## 开源项目

> 从零手写实现 tomcat [minicat](https://github.com/houbb/minicat) 别称【嗅虎】心有猛虎，轻嗅蔷薇。

## 系列文章

[web server apache tomcat11-01-官方文档入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-01-intro)

[web server apache tomcat11-02-setup 启动](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-02-setup)

[web server apache tomcat11-03-deploy 如何部署](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-03-deploy)

[web server apache tomcat11-04-manager 如何管理？](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-04-manager)

[web server apache tomcat11-06-Host Manager App -- Text Interface](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-06-host-manager)

[web server apache tomcat11-07-Realm Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-07-relam)

[web server apache tomcat11-08-JNDI Resources](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-08-jndi)

[web server apache tomcat11-09-JNDI Datasource](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-09-jdbc-datasource)

[web server apache tomcat11-10-Class Loader](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-10-classloader-howto)

...

### 介绍

JNDI 数据源配置在 JNDI-Resources-HOWTO 中有详细说明。然而，来自 tomcat-user 的反馈显示，针对特定配置的具体细节可能会相当棘手。

以下是一些已发布到 tomcat-user 的针对流行数据库的示例配置，以及一些通用数据库使用的一般提示。

您应该注意，由于这些注释是从发布到 tomcat-user 的配置和/或反馈中派生的，因此可能会因人而异 :-）。如果您有任何其他经过测试的配置，您认为可能对更广泛的受众有用，或者如果您认为我们可以以任何方式改进此部分，请告诉我们。

请注意，Tomcat 7.x 和 Tomcat 8.x 之间的 JNDI 资源配置在一定程度上有所变化，因为它们使用了不同版本的 Apache Commons DBCP 库。您很可能需要修改旧的 JNDI 资源配置以匹配下面示例中的语法，以使它们在 Tomcat 11 中正常工作。有关详细信息，请参阅 Tomcat 迁移指南。

此外，请注意，JNDI DataSource 配置一般以及本教程特别假设您已经阅读并理解了 Context 和 Host 配置参考，包括后者参考中关于自动应用程序部署的部分。

### DriverManager、服务提供程序机制和内存泄漏

`java.sql.DriverManager` 支持服务提供程序机制。这个特性是，通过提供 `META-INF/services/java.sql.Driver` 文件宣布自己的所有可用 JDBC 驱动程序会自动被发现、加载和注册，从而使您无需在创建 JDBC 连接之前显式加载数据库驱动程序。然而，在所有 Java 版本中，该实现在 servlet 容器环境中基本上是有缺陷的。问题在于，`java.sql.DriverManager` 仅会扫描驱动程序一次。

Apache Tomcat 包含的 JRE 内存泄漏预防监听器通过在 Tomcat 启动期间触发驱动程序扫描来解决这个问题。这是默认启用的。这意味着只有可见于公共类加载器及其父加载器的库将被扫描以寻找数据库驱动程序。这包括 $CATALINA_HOME/lib、$CATALINA_BASE/lib、类路径和模块路径中的驱动程序。打包在 Web 应用程序中（在 WEB-INF/lib 中）和共享类加载器中（如果已配置）的驱动程序将不可见，并且不会自动加载。如果您考虑禁用此功能，请注意，扫描将由使用 JDBC 的第一个 Web 应用程序触发，导致在重新加载此 Web 应用程序时以及依赖于此功能的其他 Web 应用程序时失败。

因此，在其 WEB-INF/lib 目录中具有数据库驱动程序的 Web 应用程序不能依赖于服务提供程序机制，并且应该显式注册驱动程序。

`java.sql.DriverManager` 中的驱动程序列表也是已知的内存泄漏源。由 Web 应用程序注册的任何驱动程序在 Web 应用程序停止时必须取消注册。当 Web 应用程序停止时，Tomcat 将尝试自动发现并注销由 Web 应用程序类加载器加载的任何 JDBC 驱动程序。但是，预期应用程序通过 ServletContextListener 自行执行此操作。

### 数据库连接池（DBCP 2）配置

Apache Tomcat 中默认的数据库连接池实现依赖于 Apache Commons 项目的库。使用以下库：

- Commons DBCP 2
- Commons Pool 2

这些库位于一个单独的 JAR 中，路径为 $CATALINA_HOME/lib/tomcat-dbcp.jar。但是，仅包含了用于连接池的类，并且已经重命名了包以避免干扰应用程序。

DBCP 2 支持 JDBC 4.1。

#### 安装

查看 DBCP 2 文档以获取完整的配置参数列表。

### 预防数据库连接池泄漏

数据库连接池创建和管理到数据库的连接池。重新使用已经存在的连接比打开新连接更高效。

连接池存在一个问题。Web 应用程序必须显式关闭 ResultSet、Statement 和 Connection。如果 Web 应用程序未关闭这些资源，它们可能永远不会再次可用，从而导致数据库连接池“泄漏”。如果没有更多可用的连接，则最终可能会导致您的 Web 应用程序数据库连接失败。

有一个解决方案。Apache Commons DBCP 2 可以配置为跟踪和恢复这些被遗弃的数据库连接。它不仅可以恢复它们，还可以为打开这些资源但从未关闭它们的代码生成堆栈跟踪。

要配置 DBCP 2 DataSource，以便移除和重新使用被遗弃的数据库连接，请在 DBCP 2 DataSource 的 Resource 配置中添加以下一个或两个属性：

- `removeAbandonedOnBorrow=true`
- `removeAbandonedOnMaintenance=true`

这两个属性的默认值都是 false。请注意，只有当设置 `timeBetweenEvictionRunsMillis` 为正值时，`removeAbandonedOnMaintenance` 属性才会生效。

有关这些属性的详细文档，请参阅 DBCP 2 文档。

使用 `removeAbandonedTimeout` 属性设置数据库连接在被视为被遗弃之前空闲的秒数。

```xml
removeAbandonedTimeout="60"
```

移除被遗弃连接的默认超时时间为 300 秒。

如果希望

 DBCP 2 记录已遗弃数据库连接资源的代码的堆栈跟踪，则可以将 `logAbandoned` 属性设置为 true。

```xml
logAbandoned="true"
```

默认值为 false。


# MySQL DBCP 2 示例

## 0. 介绍

以下是已知可以工作的 MySQL 和 JDBC 驱动程序的版本：

- MySQL 3.23.47、MySQL 3.23.47 使用 InnoDB、MySQL 3.23.58、MySQL 4.0.1alpha
- Connector/J 3.0.11-stable（官方 JDBC 驱动程序）
- mm.mysql 2.0.14（一个旧的第三方 JDBC 驱动程序）

在继续之前，请不要忘记将 JDBC 驱动程序的 jar 复制到 $CATALINA_HOME/lib。

## 1. MySQL 配置

确保按照以下说明操作，因为变化可能会导致问题。

- 创建一个新的测试用户、一个新的数据库和一个单个的测试表。您的 MySQL 用户必须分配密码。如果您尝试使用空密码连接，驱动程序将失败。

```sql
mysql> GRANT ALL PRIVILEGES ON *.* TO javauser@localhost
    ->   IDENTIFIED BY 'javadude' WITH GRANT OPTION;
mysql> create database javatest;
mysql> use javatest;
mysql> create table testdata (
    ->   id int not null auto_increment primary key,
    ->   foo varchar(25),
    ->   bar int);
```

## 测试数据插入

执行完测试后，应该移除上述用户！

接下来，向 `testdata` 表中插入一些测试数据。

```mysql
mysql> insert into testdata values(null, 'hello', 12345);
Query OK, 1 row affected (0.00 sec)

mysql> select * from testdata;
+----+-------+-------+
| ID | FOO   | BAR   |
+----+-------+-------+
|  1 | hello | 12345 |
+----+-------+-------+
1 row in set (0.00 sec)

mysql>
```

## 上下文配置

在 Tomcat 中配置 JNDI DataSource，通过在 Context 中添加资源声明来实现。

例如：

```xml
<Context>

    <!-- maxTotal: 数据库连接池中的最大连接数。确保你配置了足够大的 mysqld max_connections 来处理所有的数据库连接。设置为 -1 表示无限制。 -->

    <!-- maxIdle: 连接池中保留的最大空闲数据库连接数。设置为 -1 表示无限制。请参阅 DBCP 2 文档以了解有关此参数以及 minEvictableIdleTimeMillis 配置参数的更多信息。 -->

    <!-- maxWaitMillis: 等待数据库连接可用的最长时间（以毫秒为单位），例如在此示例中为 10 秒。如果超过此超时时间，则会抛出异常。设置为 -1 表示无限等待。 -->

    <!-- username 和 password: 数据库连接的 MySQL 用户名和密码  -->

    <!-- driverClassName: 旧的 mm.mysql JDBC 驱动程序的类名是 org.gjt.mm.mysql.Driver - 我们建议使用 Connector/J。官方 MySQL Connector/J 驱动程序的类名是 com.mysql.jdbc.Driver。 -->

    <!-- url: 连接到 MySQL 数据库的 JDBC 连接 URL。 -->

  <Resource name="jdbc/TestDB" auth="Container" type="javax.sql.DataSource"
               maxTotal="100" maxIdle="30" maxWaitMillis="10000"
               username="javauser" password="javadude" driverClassName="com.mysql.jdbc.Driver"
               url="jdbc:mysql://localhost:3306/javatest"/>

</Context>
```

## web.xml 配置

现在为此测试应用程序创建一个 WEB-INF/web.xml。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee
                      https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
  version="6.0">
  <description>MySQL Test App</description>
  <resource-ref>
      <description>DB Connection</description>
      <res-ref-name>jdbc/TestDB</res-ref-name>
      <res-type>javax.sql.DataSource</res-type>
      <res-auth>Container</res-auth>
  </resource-ref>
</web-app>
```

## 测试代码

现在创建一个简单的 test.jsp 页面供以后使用。

```jsp
<%@ taglib uri="http://java.sun.com/jsp/jstl/sql" prefix="sql" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<sql:query var="rs" dataSource="jdbc/TestDB">
select id, foo, bar from testdata
</sql:query>

<html>
  <head>
    <title>DB Test</title>
  </head>
  <body>

  <h2>Results</h2>

<c:forEach var="row" items="${rs.rows}">
    Foo ${row.foo}<br/>
    Bar ${row.bar}<br/>
</c:forEach>

  </body>
</html>
```

该 JSP 页面利用了 JSTL 的 SQL 和 Core 标签库。您可以从 Apache Tomcat Taglibs - Standard Tag Library 项目中获取它 — 确保获取 1.1.x 或更新的版本。一旦您获得了 JSTL，将 jstl.jar 和 standard.jar 复制到您的 Web 应用的 WEB-INF/lib 目录中。

最后，将您的 Web 应用部署到 $CATALINA_BASE/webapps，可以是一个名为 DBTest.war 的 war 文件，也可以是一个名为 DBTest 的子目录。

部署后，将浏览器指向 http://localhost:8080/DBTest/test.jsp，即可查看您的辛勤工作的成果。


# Oracle 8i, 9i & 10g

## 0. 介绍

Oracle 需要对 MySQL 配置进行最少的更改，除了通常的注意事项 :-)

旧版本的 Oracle 驱动程序可能以 *.zip 文件而不是 *.jar 文件进行分发。Tomcat 只会使用安装在 $CATALINA_HOME/lib 中的 *.jar 文件。因此，classes111.zip 或 classes12.zip 将需要使用 .jar 扩展名重命名。由于 jar 文件是 zip 文件，因此无需解压缩和打包这些文件 —— 仅需简单重命名即可。

从 Oracle 9i 开始，您应该使用 oracle.jdbc.OracleDriver 而不是 oracle.jdbc.driver.OracleDriver，因为 Oracle 已经声明 oracle.jdbc.driver.OracleDriver 已经被弃用，并且在下一个主要版本中将不再支持此驱动程序类。

## 1. 上下文配置

与上述 mysql 配置类似，您需要在上下文中定义您的 DataSource。在这里，我们使用 thin driver 定义一个名为 myoracle 的 DataSource，以用户 scott、密码 tiger 连接到名为 mysid 的 sid。（注意：使用 thin driver 时，此 sid 与 tnsname 不同）。使用的模式将是用户 scott 的默认模式。

如果要使用 OCI 驱动程序，只需在 URL 字符串中将 thin 更改为 oci。

```xml
<Resource name="jdbc/myoracle" auth="Container"
              type="javax.sql.DataSource" driverClassName="oracle.jdbc.OracleDriver"
              url="jdbc:oracle:thin:@127.0.0.1:1521:mysid"
              username="scott" password="tiger" maxTotal="20" maxIdle="10"
              maxWaitMillis="-1"/>
```

## 2. web.xml 配置

在创建应用程序的 web.xml 文件时，确保您遵守由 DTD 定义的元素顺序。

```xml
<resource-ref>
 <description>Oracle 数据源示例</description>
 <res-ref-name>jdbc/myoracle</res-ref-name>
 <res-type>javax.sql.DataSource</res-type>
 <res-auth>Container</res-auth>
</resource-ref>
```

## 3. 代码示例

您可以使用上面相同的示例应用程序（假设您已创建了必需的数据库实例、表等），将 DataSource 代码替换为类似以下内容：

```java
Context initContext = new InitialContext();
Context envContext  = (Context)initContext.lookup("java:/comp/env");
DataSource ds = (DataSource)envContext.lookup("jdbc/myoracle");
Connection conn = ds.getConnection();
//等等。
```




## 0. 介绍

PostgreSQL 的配置方式与 Oracle 类似。

## 1. 必需文件

将 PostgreSQL JDBC jar 复制到 $CATALINA_HOME/lib 目录。与 Oracle 一样，这些 jar 文件需要在此目录中，以便 DBCP 2 的类加载器能够找到它们。无论您接下来采取哪种配置步骤，都必须执行此操作。

## 2. 资源配置

您在这里有两个选择：定义一个跨所有 Tomcat 应用程序共享的数据源，或者为一个应用程序专门定义一个数据源。

### 2a. 共享资源配置

如果您希望定义一个跨多个 Tomcat 应用程序共享的数据源，或者如果您只是更喜欢在此文件中定义您的数据源，请使用此选项。

作者在此处并未取得成功，尽管其他人报告过成功。在此提供澄清将不胜感激。

```xml
<Resource name="jdbc/postgres" auth="Container"
          type="javax.sql.DataSource" driverClassName="org.postgresql.Driver"
          url="jdbc:postgresql://127.0.0.1:5432/mydb"
          username="myuser" password="mypasswd" maxTotal="20" maxIdle="10" maxWaitMillis="-1"/>
```

### 2b. 应用程序特定的资源配置

如果您希望定义一个特定于您的应用程序的数据源，对其他 Tomcat 应用程序不可见，请使用此选项。这种方法对您的 Tomcat 安装不会造成太大影响。

为您的上下文创建一个资源定义。上下文元素应该类似于以下内容。

```xml
<Context>

<Resource name="jdbc/postgres" auth="Container"
          type="javax.sql.DataSource" driverClassName="org.postgresql.Driver"
          url="jdbc:postgresql://127.0.0.1:5432/mydb"
          username="myuser" password="mypasswd" maxTotal="20" maxIdle="10"
          maxWaitMillis="-1"/>
</Context>
```

## 3. web.xml 配置

```xml
<resource-ref>
 <description>postgreSQL 数据源示例</description>
 <res-ref-name>jdbc/postgres</res-ref-name>
 <res-type>javax.sql.DataSource</res-type>
 <res-auth>Container</res-auth>
</resource-ref>
```

## 4. 访问数据源

在编程方式访问数据源时，请记得在 JNDI 查找中添加 java:/comp/env 前缀，如以下代码片段所示。还请注意，“jdbc/postgres” 可以替换为任何您喜欢的值，只要您在上面的资源定义文件中也进行相应更改。

```java
InitialContext cxt = new InitialContext();
if ( cxt == null ) {
   throw new Exception("Uh oh -- no context!");
}

DataSource ds = (DataSource) cxt.lookup( "java:/comp/env/jdbc/postgres" );

if ( ds == null ) {
   throw new Exception("Data source not found!");
}
```


## Oracle 8i with OCI Client

### 介绍

虽然这些笔记并不严格涉及使用 OCI 客户端创建 JNDI DataSource，但可以与上面的 Oracle 和 DBCP 2 解决方案结合使用。

为了使用 OCI 驱动程序，您应该安装了 Oracle 客户端。您应该从光盘安装了 Oracle8i(8.1.7) 客户端，并从 otn.oracle.com 下载了适合的 JDBC/OCI 驱动程序（Oracle8i 8.1.7.1 JDBC/OCI 驱动程序）。

在将 classes12.zip 文件重命名为 classes12.jar 后，将其复制到 $CATALINA_HOME/lib 中。您可能还需要根据您使用的 Tomcat 和 JDK 版本从此文件中删除 javax.sql.* 类。

### 整合

确保您的 $PATH 或 LD_LIBRARY_PATH（可能位于 $ORAHOME\bin 中）中有 ocijdbc8.dll 或 .so，并确保简单测试程序使用 System.loadLibrary("ocijdbc8"); 能够加载本地库。

接下来，您应该创建一个简单的测试 servlet 或 JSP，其中包含以下关键行：

```java
DriverManager.registerDriver(new oracle.jdbc.driver.OracleDriver());
conn = DriverManager.getConnection("jdbc:oracle:oci8:@database","username","password");
```

其中 database 的形式为 host:port:SID。现在，如果您尝试访问测试 servlet/JSP 的 URL，但得到的是一个带有 java.lang.UnsatisfiedLinkError 根本原因为的 ServletException。

首先，UnsatisfiedLinkError 表示您的 JDBC 类文件与 Oracle 客户端版本不匹配。这里的提示是指出无法找到所需的库文件。例如，您可能正在使用来自 Oracle 版本 8.1.6 的 classes12.zip 文件，但使用的是 8.1.5 版本的 Oracle 客户端。classesXXX.zip 文件和 Oracle 客户端软件版本必须匹配。

接下来，您可能会遇到错误 ORA-06401 NETCMN: invalid driver designator

Oracle 文档中说：「原因：登录（连接）字符串包含无效的驱动程序指示符。操作：更正字符串并重新提交。」将数据库连接字符串（形式为 host:port:SID）更改为以下内容：(description=(address=(host=myhost)(protocol=tcp)(port=1521))(connect_data=(sid=orcl)))

编辑。嗯，我认为如果解决了 TNSNames 的问题，这是不需要的 - 但我不是 Oracle DBA :-)


## 常见问题

以下是使用数据库的 Web 应用程序可能遇到的一些常见问题，以及如何解决它们的提示。

### 间歇性数据库连接失败

Tomcat 在 JVM 中运行。JVM 周期性地执行垃圾回收（GC）以删除不再使用的 Java 对象。当 JVM 执行 GC 时，Tomcat 内的代码执行会冻结。如果配置的最大建立数据库连接的时间小于垃圾回收所花费的时间，则可能会出现数据库连接失败。

要收集关于垃圾回收花费的时间的数据，请在启动 Tomcat 时将 -verbose:gc 参数添加到您的 CATALINA_OPTS 环境变量中。启用详细的 GC 后，您的 $CATALINA_BASE/logs/catalina.out 日志文件将包含每次垃圾回收的数据，包括花费的时间。

当您的 JVM 调整正确时，99% 的时间 GC 将花费不到一秒钟。其余的只需几秒钟。很少情况下，GC 会超过 10 秒。

确保将数据库连接超时设置为 10-15 秒。对于 DBCP 2，您可以使用 maxWaitMillis 参数来设置此项。

### 随机连接关闭异常

当一个请求从连接池中获取到数据库连接并关闭它两次时，就可能发生这种情况。当使用连接池时，关闭连接只是将其返回到池中供另一个请求重用，而不是关闭连接。而 Tomcat 使用多个线程来处理并发请求。以下是在 Tomcat 中可能导致此错误的事件顺序示例：

1. 请求 1 在线程 1 中运行并获取数据库连接。
2. 请求 1 关闭数据库连接。
3. JVM 将运行线程切换到线程 2。
4. 请求 2 在线程 2 中运行并获取数据库连接（与请求 1 刚关闭的相同数据库连接）。
5. JVM 将运行线程切换回线程 1。
6. 请求 1 在 finally 块中第二次关闭数据库连接。
7. JVM 将运行线程切换回线程 2。
8. 请求 2 在线程 2 中尝试使用数据库连接，但由于请求 1 关闭了它，因此失败。

以下是正确编写的代码示例，用于使用从连接池获取的数据库连接：

```java
Connection conn = null;
Statement stmt = null;  // Or PreparedStatement if needed
ResultSet rs = null;
try {
  conn = ... 从连接池获取连接 ...
  stmt = conn.createStatement("select ...");
  rs = stmt.executeQuery();
  ... 遍历结果集 ...
  rs.close();
  rs = null;
  stmt.close();
  stmt = null;
  conn.close(); // 返回到连接池
  conn = null;  // 确保我们不会关闭两次
} catch (SQLException e) {
  ... 处理错误 ...
} finally {
  // 始终确保结果集和语句已关闭，并且连接已返回到池中
  if (rs != null) {
    try { rs.close(); } catch (SQLException e) { ; }
    rs = null;
  }
  if (stmt != null) {
    try { stmt.close(); } catch (SQLException e) { ; }
    stmt = null;
  }
  if (conn != null) {
    try { conn.close(); } catch (SQLException e) { ; }
    conn = null;
  }
}
```

### Context 与 GlobalNamingResources

请注意，尽管上述说明将 JNDI 声明放在了 Context 元素中，但有时将这些声明放在服务器配置文件的 GlobalNamingResources 部分可能更为合适。

放置在 GlobalNamingResources 部分的资源将在服务器的所有 Context 中共享。

### JNDI 资源命名和 Realm 交互

为了使 Realm 正常工作，realm 必须引用在 `<GlobalNamingResources>` 或 `<Context>` 部分中定义的数据源，而不是使用 `<ResourceLink>` 重命名的数据源。




# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/jndi-datasource-examples-howto.html


* any list
{:toc}