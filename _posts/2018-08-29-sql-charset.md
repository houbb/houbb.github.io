---
layout: post
title:  SQL Charset
date:  2018-08-29 01:07:21 +0800
categories: [SQL]
tags: [sql, charset, sf]
published: true
---

# 场景

mysql 中文报错，如下：

```
Incorrect string value: '\xF0\xA0\xBA\x98\xE5\x8F...' for column 'title' at row 1
```

# 常用命令

- 查看

```sql
SHOW VARIABLES LIKE 'character%'
```

- 修改

```sql
SET character_set_client = utf8mb4 ;  
SET character_set_connection = utf8mb4 ;   
SET character_set_database = utf8mb4 ;   
SET character_set_results = utf8mb4 ;    
SET character_set_server = utf8mb4 ;   
SET character_set_system = utf8mb4 ;  
```

- 统一设置

一般就算设置了表的mysql默认字符集为utf8并且通过UTF-8编码发送查询，你会发现存入数据库的仍然是乱码。问题就出在这个connection连接层上。

解决方法是在发送查询前执行一下下面这句：


```sql
SET NAMES 'utf8';  
```

它相当于下面的三句指令：

```sql
SET character_set_client = utf8;  
SET character_set_results = utf8;   
SET character_set_connection = utf8; 
```



# 解决方案

- 注意

`characterEncoding=utf8` 是必须指定的，不然数据库就是 ??? 之类的数据。

```
datasource:
      # 数据库连接
      url: jdbc:mysql://localhost:3306/xxx?useUnicode=true&characterEncoding=utf8
      # 数据库连接用户名称
      username: root
      # 数据库连接用户密码
      password: 
      driver-class-name: com.mysql.jdbc.Driver
```

## 需要重启

（1）设置

```
[mysql]
default-character-set=utf8mb4

[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
```

命令设置:

```
SET default-character-set = utf8mb4;  
SET character-set-server = utf8mb4;   
SET collation-server = utf8mb4_unicode_ci; 
```

（2）重启服务

（3）设置表和列的编码为 utf8mb4

（4）在 Jdbc 连接中停止指定 `characterEncoding=UTF-8` 和 `characterSetResults=UTF-8` 

因为这会重写 character_set_client，character_set_connection, character_set_results to utf8。

# 实际操作

(1) 设置数据库和表的编码为 utf8mb4

```sql
ALTER SCHEMA crawl DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_general_ci ;
```

(2) 修改数据表的编码为utf8mb4

```sql
ALTER TABLE TABLE_NAME CONVERT TO CHARACTER SET utf8mb4;
```

(3) 修改连接数据库的连接代码

比如 springboot 可以使用如下配置

```yml
spring:
  datasource:
      # 数据库连接
      url: jdbc:mysql://localhost:3306/crawl?useUnicode=true&characterEncoding=utf8
      # 数据库连接用户名称
      username: root
      # 数据库连接用户密码
      password: 123456
      driver-class-name: com.mysql.jdbc.Driver
      tomcat:
          initSQL: SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci
```

# 参考资料

https://my.oschina.net/lixin91/blog/639270

https://stackoverflow.com/questions/10957238/incorrect-string-value-when-trying-to-insert-utf-8-into-mysql-via-jdbc


- github

https://github.com/Asqatasun/Asqatasun/issues/123

https://github.com/jaywcjlove/mysql-tutorial/blob/master/chapter2/2.3.md

* any list
{:toc}