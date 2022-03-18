---
layout: post
title: 列式数据库-03-client interface 客户端接口
date: 2022-03-18 21:01:55 +0800 
categories: [Database]
tags: [database, monetdb, column-based-db, sh]
published: true
---

# 客户端接口

一般来说，所有的 MonetDB 程序都是从命令 shell（如 bash 或 cmd.exe）启动或从脚本文件调用的。

然而，对于喜欢更友好的 GUI 程序的用户来说，许多好的 GUI 程序是可用的。这些通用 GUI 程序通常允许您通过标准数据库连接 API（例如 ODBC 或 JDBC）连接到任何 DBMS。 

MonetDB 提供 ODBC 驱动程序和 JDBC 驱动程序。 JDBC 驱动程序可用于用 Java 编写的程序。还有适用于 Python、PHP、Perl 等流行编程语言的 MonetDB 服务器连接 API 库。 （在这里查看更多）。

如果您需要 MonetDB ODBC 驱动程序或 JDBC 驱动程序，您需要在安装或启动 GUI 程序的计算机操作系统上下载、安装和配置它们。

对于 ODBC 驱动程序，您需要系统管理员权限才能安装 MonetDB ODBC 驱动程序组件。对于 JDBC 驱动程序，不需要 sys-admin 权限，您只需从下载区域下载单个 jar (Java ARchive) 库文件（即 monetdb-jdbc-3.X.jre8.jar）并在您的 GUI 中进行配置 - jar 文件存储的程序（或将其添加到 CLASSPATH 环境设置或 java -cp 启动参数）。 

MonetDB JDBC 驱动程序是 100% 纯 Java（类型 4）驱动程序，这意味着相同的 JDBC 驱动程序可以部署在支持 Java 运行时环境 (JRE) 版本 8 或更高版本的所有平台上。

- 命令行界面

直接与 MonetDB 交互的常用工具称为 Mclient。 

它为交互式使用和嵌入脚本提供了强大的命令行界面。

- 基于 JDBC 的命令行界面

此客户端以 Mclient 为模型，但使用带有 JDBC 连接器的 Java 应用程序构建。

- 嵌入式 MonetDB

MonetDB 代码库还可以嵌入到多种编程语言中，以从单用户高性能界面中受益。 请参阅开发人员指南中的说明

- 数据库转储实用程序

为确保数据库对硬件和操作系统故障（例如著名的 OOM（Out-Of-Memory）信号）具有弹性，定期执行备份是一种很好的做法。 

有关更多详细信息，请参阅备份和恢复


# 三方客户端

如果您更喜欢其中一种广泛使用的图形数据库仪表板，我们已对以下产品进行了基本功能测试：如果您更喜欢其中一种广泛使用的图形数据库仪表板，我们已对以下产品进行了基本功能测试：

[客户端](https://www.monetdb.org/documentation-Jan2022/user-guide/client-interfaces/client-tools/)

# JDBC 客户端（CLI 客户端）

JdbcClient 程序为交互式 SQL 查询处理提供了一个命令行界面（受 mclient 启发）。 

它使用 JDBC API 和 MonetDB JDBC 驱动程序完全用 Java 编写。 

该程序以单个小 jar 文件 jdbcclient.jre8.jar 的形式提供，可从 MonetDB Java 下载区下载。 

JAR 文件已经包含 MonetDB JDBC 驱动程序，该驱动程序用于与 MonetDB 服务器通信，因此不需要额外的 JAR 文件（或类路径设置）。

JdbcClient 程序支持启动选项。 要查看它们，请在 shell 中键入以下命令：

```
java -jar jdbcclient.jre8.jar --help
```

此命令将显示以下使用信息：

```
Usage java -jar jdbcclient.jre8.jar
		[-h host[:port]] [-p port] [-f file] [-u user]
		[-l language] [-d database] [-e] [-D [table]]
		[--csvdir /path/to/csvfiles]] [-X<opt>]
		| [--help] | [--version]
or using long option equivalents --host --port --file --user --language
--dump --echo --database.
Arguments may be written directly after the option like -p50000.

If no host and port are given, localhost and 50000 are assumed.
An .monetdb file may exist in the user's home directory.  This file can contain
preferences to use each time JdbcClient is started.  Options given on the
command line override the preferences file.  The .monetdb file syntax is
<option>=<value> where option is one of the options host, port, file, mode
debug, or password.  Note that the last one is perilous and therefore not
available as command line option.
If no input file is given using the -f flag, an interactive session is
started on the terminal.

OPTIONS
-h --host     The hostname of the host that runs the MonetDB database.  A port
              number can be supplied by use of a colon, i.e. -h somehost:12345.
-p --port     The port number to connect to.
-f --file     A file name to use either for reading or writing.  The file will
              be used for writing when dump mode is used (-D --dump).  In read
              mode, the file can also be an URL pointing to a plain text file
              that is optionally gzip compressed.
-u --user     The username to use when connecting to the database.
-d --database Try to connect to the given database (only makes sense if
              connecting to monetdbd).
-l --language Use the given language, defaults to 'sql'.
--csvdir      The directory path where csv data files are read or written when
              using ON CLIENT clause of COPY command.
--help        This help screen.
--version     Display driver version and exit.
-e --echo     Also outputs the contents of the input file, if any.
-q --quiet    Suppress printing the welcome header.
-D --dump     Dumps the given table(s), or the complete database if none given.
-Xoutput      The output mode when dumping.  Default is sql, xml may be used for
              an experimental XML output.
-Xhash        Use the given hash algorithm during challenge response. Supported
              algorithm names: SHA512, SHA384, SHA256 and SHA1.
-Xdebug       Writes a transmission log to disk for debugging purposes. If a
              file name is given, it is used, otherwise a file called
              monet<timestamp>.log is created.  A given file never be
              overwritten; instead a unique variation of the file is used.
-Xbatching    Indicates that a batch should be used instead of direct
              communication with the server for each statement.  If a number is
              given, it is used as batch size.  i.e. 8000 would execute the
              contents on the batch after each 8000 statements read.  Batching
              can greatly speedup the process of restoring a database dump.
```

# 使用 JdbcClient 程序

从 shell 启动 JdbcClient 程序（假设您正在运行 MonetDB/SQL 服务器）很容易，例如：

```
% java -jar jdbcclient.jre8.jar -p50000 -ddemo -umonetdb
password:

Welcome to the MonetDB interactive JDBC terminal!
JDBC Driver: MonetDB Native Driver v3.2 (Liberica 20220127 based on MCL v1.21)
Database Server: MonetDB v11.43.9
Current Schema: sys
Type \q to quit (you can also use: quit or exit), \? or \h for a list of available commands
auto commit mode: on
sql>
```

# 连接器和驱动器

MonetDB 带有 JDBC 和 ODBC 驱动程序以及几个编程语言接口库。 

JDBC、PHP、Perl、Ruby、Python 和 Node.js 接口是本机实现，不需要安装 MonetDB 客户端/服务器代码。 

ODBC 驱动程序和设置库可作为单独的安装程序使用。 Mapi 库是与服务器交互的最低级别的 C 接口。

对于所提供的语言绑定的基础知识，我们依赖外部文档：PHP、Perl、Python 以及 JDBC 和 ODBC API。 提供的示例仅用于说明它们在 MonetDB 上下文中的行为。

## JDBC 驱动

使用 Java 编程语言连接到数据源的最明显方法是使用 JDBC API。 

MonetDB 提供 100% 纯 Java JDBC 驱动程序（类型 4），它允许从 Java 程序连接和使用 MonetDB 数据库服务器，而无需任何其他库。

本文档简要描述了如何在 Java 应用程序中使用 MonetDB JDBC 驱动程序。 

要完全理解本文档，需要熟悉 Java JDBC API。 请注意，您可以在 Oracle 的网站上找到完整的 JDBC API。

MonetDB JDBC 驱动程序的最新版本实现了大部分 JDBC 4.2 API 类和方法。 

如果您广泛使用 JDBC API 和语义并依赖其功能，请在我们的 Github Java 存储库上报告任何缺失的功能。

为了在 Java 应用程序中使用 MonetDB JDBC 驱动程序，您（当然）需要一个正在运行的 MonetDB/SQL 服务器实例 mserver5 进程，最好使用 monetdbd。

## 获取 JDBC 驱动程序 Jar

您可以从我们的 MonetDB Java 下载区下载最新的 MonetDB JDBC 驱动程序。

您将找到一个名为“monetdb-jdbc-3.X.jre8.jar”的 jar 文件，其中 X 是次要版本号。它还包含一个版本说明文本文件，其中包含有关 JDBC 驱动程序版本的重要信息和一个 ChangeLog，其中包含有关自上一版本以来发生的更改的信息。在子目录存档中，您可以找到旧版本和完整的 ChangeLog-Archive。

下载区还包含另外两个 jar 文件：“jdbcclient.jre8.jar”和“monetdb-mcl-1.*.jre8.jar”。这些是可选的罐子。 

“jdbcclient.jre8.jar”包含 JdbcClient 程序（类似于（但不等于）使用 JDBC API 用 Ja​​va 编写的 mclient 的命令行程序），有关更多信息，请参阅 Jdbc Client。 “monetdb-mcl-1. * .jre8.jar”是 MonetDB 通信层，它允许 Java 程序使用 Mapi 协议与 MonetDB 服务器通信。 JDBC 驱动程序 jar 文件已包含此 mcl 库。

## 编译驱动（使用ant，可选）

如果您更喜欢自己构建驱动程序，请确保从 monetdb java 获取 MonetDB Java 存储库。 

Java 源代码是使用 Apache 的 Ant 工具、一个 make 文件构建的，并且需要 JDK 1.8 或更高版本。 

只需发出命令 make 就足以在子目录 jars 中构建驱动程序 jar-archive。 

Java 源目前至少需要一个兼容 Java 8 的编译器。

## 在 Java 程序中使用 JDBC 驱动程序

要使用 MonetDB JDBC 驱动程序，monetdb-jdbc-3.X.jre8.jar java-archive 文件名必须在 Java 类路径设置中。 

确保情况确实如此。 

主要的 MonetDB JDBC 驱动程序类名称是 org.monetdb.jdbc.MonetDriver。 

之前的 MonetDB JDBC Driver 类名 nl.cwi.monetdb.jdbc.MonetDriver 已被弃用，因此不再使用它。

在 Java 程序中使用 MonetDB JDBC 驱动程序：

```java
import java.sql.*;

// request a Connection to a MonetDB server running on 'localhost' (with
// default port 50000) for database demo for user and password monetdb
Connection con = DriverManager.getConnection("jdbc:monetdb://localhost/demo", "monetdb", "monetdb");
```

传递给 getConnection() 方法的 MonetDB JDBC 连接 URL 字符串格式定义为：

```
jdbc:monetdb://<hostname>[:<portnr>]/<databasename>[?<property>=<value>[&<property>=<value>]...]
```

其中 `<` 和 `>` 之间的元素是必需的，而 `[` 和 `]` 之间的元素是可选的。

允许以下可选连接属性：

```
user=<login name>
password=<secret value>
debug=true
logfile=<name logfile>
fetchsize=<nr of rows>
so_timeout=<time in milliseconds>
treat_blob_as_binary=false
treat_clob_as_varchar=false
language=mal
hash=<sha512 or sha384>
```

# 简单的 java 例子

```java
import java.sql.*;

/*
 * This example assumes there exist tables a and b filled with some data.
 * On these tables some queries are executed and the JDBC driver is tested
 * on it's accuracy and robustness against 'users'.
 *
 * @author Fabian Groffen
 */
public class MJDBCTest {
    public static void main(String[] args) throws Exception {

        Connection con = null;
        Statement st = null;
        ResultSet rs = null;

        try {
            String con_url = "jdbc:monetdb://localhost:50000/mydb?so_timeout=10000";

            // make a connection to the MonetDB server using JDBC URL starting with: jdbc:monetdb://
            con = DriverManager.getConnection(con_url, "monetdb", "monetdb");

            // make a statement object
            st = con.createStatement();

            // execute SQL query which returns a ResultSet object
            String qry = """SELECT a.var1, COUNT(b.id) AS total
                            FROM a, b
                            WHERE a.var1 = b.id
                              AND a.var1 = 'andb'
                            GROUP BY a.var1
                            ORDER BY a.var1, total;
                         """
            rs = st.executeQuery(qry);

            // get meta data and print column names with their type
            ResultSetMetaData md = rs.getMetaData();
            final int colCount = md.getColumnCount();
            for (int i = 1; i <= colCount; i++) {
                System.out.print(md.getColumnName(i) + ":" + md.getColumnTypeName(i) + "\t");
            }
            System.out.println("");

            // now print the data: only the first 5 rows, while there probably are
            // a lot more. This shouldn't cause any problems afterwards since the
            // result should get properly discarded when we close it
            for (int i = 0; rs.next() && i < 5; i++) {
                for (int j = 1; j <= colCount; j++) {
                    System.out.print(rs.getString(j) + "\t");
                }
                System.out.println("");
            }

            // close (server) resource as soon as we are done processing resultset data
            rs.close();
            rs = null;

            // tell the driver to only return 5 rows for the next execution
            // it can optimize on this value, and will not fetch any more than 5 rows.
            st.setMaxRows(5);

            // we ask the database for 22 rows, while we set the JDBC driver to
            // 5 rows, this shouldn't be a problem at all...
            rs = st.executeQuery("select * from a limit 22");
            int var1_cnr = rs.findColumn("var1");
            int var2_cnr = rs.findColumn("var2");
            int var3_cnr = rs.findColumn("var3");
            int var4_cnr = rs.findColumn("var4");

            // read till the driver says there are no rows left
            for (int i = 0; rs.next(); i++) {
                System.out.println(
                    "[" + rs.getString(var1_cnr) + "]" +
                    "[" + rs.getString(var2_cnr) + "]" +
                    "[" + rs.getInt(var3_cnr) + "]" +
                    "[" + rs.getString(var4_cnr) + "]" );
            }

            // close (server) resource as soon as we are done processing resultset data
            rs.close();
            rs = null;

            // unset the row limit; 0 means as much as the database sends us
            st.setMaxRows(0);

            // we only ask 10 rows
            rs = st.executeQuery("select * from b limit 10;");
            int rowid_cnr = rs.findColumn("rowid");
            int id_cnr = rs.findColumn("id");
            var1_cnr = rs.findColumn("var1");
            var2_cnr = rs.findColumn("var2");
            var3_cnr = rs.findColumn("var3");
            var4_cnr = rs.findColumn("var4");

            // and simply print them
            while (rs.next()) {
                System.out.println(
                    rs.getInt(rowid_cnr) + ", " +
                    rs.getString(id_cnr) + ", " +
                    rs.getInt(var1_cnr) + ", " +
                    rs.getInt(var2_cnr) + ", " +
                    rs.getString(var3_cnr) + ", " +
                    rs.getString(var4_cnr) );
            }

            // close (server) resource as soon as we are done processing resultset data
            rs.close();
            rs = null;

            // perform a ResultSet-less query (with no trailing ; since that should
            // be possible as well and is JDBC standard)
            int updCount = st.executeUpdate("delete from a where var1 = 'zzzz'");
            System.out.println("executeUpdate() returned: " + updCount);

        } catch (SQLException se) {
            System.out.println(se.getMessage());
        } finally {
            // when done, close all (server) resources
            if (rs != null) rs.close();
            if (st != null) st.close();
            if (con != null) con.close();
        }
    }
}
```


# 参考资料

https://www.monetdb.org/documentation-Jan2022/user-guide/client-interfaces/

https://www.monetdb.org/documentation-Jan2022/user-guide/client-interfaces/client-tools/

* any list
{:toc}