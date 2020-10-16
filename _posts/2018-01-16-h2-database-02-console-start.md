---
layout: post
title:  H2 Database-02-h2 命令行模式启动
date:  2018-1-16 16:44:12 +0800
categories: [SQL]
tags: [sql, h2, test]
published: true
---

# H2 Database

## 找到 jar

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <version>1.4.196</version>
</dependency>
```

我们首先找到对应的 jar 信息，比如我的路径时：

```
~\.m2\repository\com\h2database\h2\1.4.196\h2-1.4.196.jar
```

## 启动方式

我们首先到这个路径下面，然后执行命令：

```
java -cp h2-1.4.196.jar org.h2.tools.Shell
```

进入命令行模式

## 测试

```
λ java -cp h2-1.4.196.jar org.h2.tools.Shell

Welcome to H2 Shell 1.4.196 (2017-06-10)
Exit with Ctrl+C
[Enter]   jdbc:h2:~/test
URL
[Enter]   org.h2.Driver
Driver
[Enter]
User
[Enter]   Hide
Password
Password
Connected
Commands are case insensitive; SQL statements end with ';'
help or ?      Display this help
list           Toggle result list / stack trace mode
maxwidth       Set maximum column width (default is 100)
autocommit     Enable or disable autocommit
history        Show the last 20 statements
quit or exit   Close the connection and exit

sql> show databases;
SCHEMA_NAME
INFORMATION_SCHEMA
PUBLIC
(2 rows, 25 ms)
sql> quit;
Connection closed
```

默认情况下，不允许通过TCP连接或Web界面远程创建数据库。

**出于安全原因，不建议启用数据库的远程创建。**

创建新数据库的用户将成为其管理员，因此与H2拥有对JVM的相同访问权限，与Java和系统帐户允许的对操作系统的访问权限相同。

建议使用嵌入式URL，本地H2控制台或Shell工具在本地创建所有数据库。

如果确实需要允许远程数据库创建，则可以将-ifNotExists参数传递给TCP，PG或Web服务器（但不能传递给控制台工具）。

它与-tcpAllowOthers，-pgAllowOthers或-webAllowOthers的组合有效地在您的系统中创建了一个远程安全漏洞，如果使用它，请始终使用防火墙或其他解决方案来保护您的端口并使用此类设置组合仅在受信任的网络中。

H2 Servlet也支持此类选项。

## 关闭

```
java -cp h2-1.4.196.jar org.h2.tools.Server -tcpShutdown tcp://localhost:9092
Shutting down TCP Server at tcp://localhost:9092
```

## 报错

### 密码错误

可能会有如下报错：

```
SQL Exception: Wrong user name or password [28000-196]
```

这个可能是我第一次全部选择的默认选项，登录时全部选择默认选项即可。

### java 启动报错

```
org.h2.jdbc.JdbcSQLException: Database may be already in use: null. Possible solutions: close all other connection(s); use the server mode [90020-196]
...
Caused by: java.lang.IllegalStateException: The file is locked: nio:~/test.mv.db [1.4.196/7]
```

一开始以为不为创建文件，实际上还是会创建文件的。

# windows 安装

## 下载地址

[https://h2database.com/h2-setup-2019-03-13.exe](https://h2database.com/h2-setup-2019-03-13.exe)

## 安装

直接双击安装

## 启动

然后打开 h2 console

会自动打开浏览器页面：

```
http://172.17.160.1:8082/test.do?jsessionid=16320cc946bf083325e7b0a902658bf9
```

输入账户密码就可以进行登录。

## 使用

登录后的界面就是一个浏览器客户端，暂时不做过多介绍。

# 服务端启动

## 启动命令

```
λ java -cp h2-1.4.196.jar org.h2.tools.Shell

Welcome to H2 Shell 1.4.196 (2017-06-10)
Exit with Ctrl+C
[Enter]   jdbc:h2:tcp://localhost/~/test
URL       jdbc:h2:~/test
[Enter]   org.h2.Driver
Driver    org.h2.Driver
[Enter]
User
[Enter]   Hide
Password
Password
Connected
Commands are case insensitive; SQL statements end with ';'
help or ?      Display this help
list           Toggle result list / stack trace mode
maxwidth       Set maximum column width (default is 100)
autocommit     Enable or disable autocommit
history        Show the last 20 statements
quit or exit   Close the connection and exit

sql> CREATE Table test(NAME VARCHAR)
...> ;
(Update count: 0, 2 ms)
sql> INSERT INTO test VALUES('Hello H2DB!');
(Update count: 1, 0 ms)
sql> quit
Connection closed
```

这个时候，h2 会在后台运行。

如果你想关闭，使用我们的命令即可：

```
java -cp h2-1.4.196.jar org.h2.tools.Server -tcpShutdown tcp://localhost:9092
Shutting down TCP Server at tcp://localhost:9092
```

## java 连接

我们上一节是直接通过内存启动的，现在我们让 h2 服务端启动，java 客户端连接。

和常规的 mysql 等数据库类似。

```java
package com.github.houbb.h2.learn.p1;

import java.sql.*;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class DefaultServerTest {

    public static void main(String[] args) throws ClassNotFoundException {
        Class.forName("org.h2.Driver");

        try (Connection connection = DriverManager.getConnection("jdbc:h2:~/test", null, null);
             Statement statement = connection.createStatement()) {
            try (ResultSet result = statement.executeQuery("SELECT NAME FROM test")) {
                while (result.next()) {
                    System.out.println(result.getString("name"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

}
```

输出日志：

```
Hello H2DB!
```

# csv 读写

## 读取

```
SELECT * FROM CSVREAD('user.csv');
```

# 小结

h2 databse 非常的轻量小巧，值得学习一波。

为后续自己手写一个简易版 h2 做准备。

* any list
{:toc}