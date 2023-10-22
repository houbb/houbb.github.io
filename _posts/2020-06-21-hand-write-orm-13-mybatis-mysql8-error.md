---
layout: post
title:  mysql 8.0 访问报错 com.mysql.jdbc.exceptions.jdbc4.MySQLNonTransientConnectionException 与 closing inbound before receiving peer's close_notify
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, error, exceptin, mysql, sql, sh]
published: true
---

# mysql 报错 MySQLNonTransientConnectionException

```
Method threw 'com.mysql.jdbc.exceptions.jdbc4.MySQLNonTransientConnectionException' exception.
```

通过客户端可以正常访问。

mysql server 为 8.0 版本。

本地的驱动为

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.29</version>
</dependency>
```

对应的配置文件

```
jdbc.driver=com.mysql.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/test
jdbc.username=root
jdbc.password=123456
```


## 原因

MySQL版本和驱动包不兼容的问题，所以将MySQL驱动改为了最新的8.0版本的MySQL驱动。

## 解决方式

第一步：使用最新的MySQL驱动jar包。

第二步：把驱动的类名改为:

static String driver="com.mysql.cj.jdbc.Driver";

第三步：在访问mysql的url后加入时区设置：

static String url="jdbc:mysql://localhost:3306/test?characterEncoding=utf-8&serverTimezone=UTC";(UTC表示标准时区)


## 实际使用版本

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.13</version>
</dependency>
```

调整配置文件：

```xml
<property name="driver" value="com.mysql.cj.jdbc.Driver"/>
<property name="url" value="jdbc:mysql://localhost:3306/test?characterEncoding=utf-8&amp;serverTimezone=UTC"/>
<property name="username" value="root"/>
<property name="password" value="123456"/>
```


# 第二个报错

然后开始执行方法，结果链接成功，但是有另一个报错：

```
** BEGIN NESTED EXCEPTION ** 

javax.net.ssl.SSLException
MESSAGE: closing inbound before receiving peer's close_notify

STACKTRACE:

javax.net.ssl.SSLException: closing inbound before receiving peer's close_notify
	at java.base/sun.security.ssl.SSLSocketImpl.shutdownInput(SSLSocketImpl.java:848)
	at java.base/sun.security.ssl.SSLSocketImpl.shutdownInput(SSLSocketImpl.java:826)
	at com.mysql.cj.protocol.a.NativeProtocol.quit(NativeProtocol.java:1312)
	at com.mysql.cj.NativeSession.quit(NativeSession.java:182)
	at com.mysql.cj.jdbc.ConnectionImpl.realClose(ConnectionImpl.java:1750)
	at com.mysql.cj.jdbc.ConnectionImpl.close(ConnectionImpl.java:720)
....
```

## 原因

在配置文件中数据库连接的url属性中加入 useSSL=false 即可解决

## 完整配置

```xml
<dataSource>
    <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
    <property name="url" value="jdbc:mysql://localhost:3306/test?characterEncoding=utf-8&amp;serverTimezone=UTC&amp;useSSL=false"/>
    <property name="username" value="root"/>
    <property name="password" value="123456"/>
</dataSource>
```

# 参考资料

[com.mysql.jdbc.exceptions.jdbc4.MySQLNonTransientConnectionException异常解决方法](https://blog.csdn.net/q1406689423/article/details/89845338)

https://blog.csdn.net/qq_48455576/article/details/120261163

* any list
{:toc}