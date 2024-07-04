---
layout: post
title:  MySQL-18-mysql source 执行 sql 文件时中文乱码
date:  2017-7-17 10:26:01 +0800
categories: [MySQL]
tags: [sp]
published: true
---

# 拓展阅读

[MySQL 00 View](https://houbb.github.io/2017/02/27/mysql-00-view)

[MySQL 01 Ruler mysql 日常开发规范](https://houbb.github.io/2017/02/27/mysql-01-ruler)

[MySQL 02 truncate table 与 delete 清空表的区别和坑](https://houbb.github.io/2017/02/27/mysql-truncate)

[MySQL 03 Expression 1 of ORDER BY clause is not in SELECT list,references column](https://houbb.github.io/2017/02/27/mysql-03-error)

[MySQL 04 EMOJI 表情与 UTF8MB4 的故事](https://houbb.github.io/2017/02/27/mysql-04-emoj-and-utf8mb4)

[MySQL 05 MySQL入门教程（MySQL tutorial book）](https://houbb.github.io/2017/02/27/mysql-05-learn-book)

[MySQL 06 mysql 如何实现类似 oracle 的 merge into](https://houbb.github.io/2017/02/27/mysql-06-merge-into)

[MySQL 07 timeout 超时异常](https://houbb.github.io/2017/02/27/mysql-07-timeout-errors)

[MySQL 08 datetime timestamp 以及如何自动更新，如何实现范围查询](https://houbb.github.io/2017/02/27/mysql-08-datetime-timestamp)

[MySQL 09 MySQL-09-SP mysql 存储过程](https://houbb.github.io/2017/02/27/mysql-09-sp)

[MySQL 09 MySQL-group by 分组](https://houbb.github.io/2017/02/27/mysql-10-groupby)

# 场景

通过 mysql 的命令行连接到 mysql server 服务端，执行对应的 source xxx.sql，发现中文乱码.


# 确认步骤

## 文件格式

确保文件编码格式为 UTF-8

## mysql client 编码

```
mysql> SHOW VARIABLES LIKE 'character_set%';                                          
+--------------------------+---------------------------------------------------+      
| Variable_name            | Value                                             |      
+--------------------------+---------------------------------------------------+      
| character_set_client     | utf8                                              |      
| character_set_connection | utf8                                              |      
| character_set_database   | utf8                                              |      
| character_set_filesystem | binary                                            |      
| character_set_results    | utf8                                              |      
| character_set_server     | utf8                                              |      
| character_set_system     | utf8                                              |      
| character_sets_dir       | D:\tool\mysql\mysql-5.7.31-winx64\share\charsets\ |      
+--------------------------+---------------------------------------------------+      
8 rows in set, 1 warning (0.03 sec)                                                   
```

登录后可以通过这个查看。

### 修改方式

可以通过 `SET NAMES utf8mb4;` 设置客户端编码，然后在进行执行。

验证通过。

# chat

## set names UTF8mb4 命令解释

`SET NAMES utf8mb4;` 命令用于设置 MySQL 客户端和服务器之间的字符集通信方式。

具体来说，它设置客户端发送的数据、连接字符集以及返回结果的字符集为 `utf8mb4`。

### 详细解释

`SET NAMES utf8mb4;` 实际上相当于以下三个设置：

1. **character_set_client**：客户端使用的字符集。
2. **character_set_connection**：服务器在处理客户端发送的数据时使用的字符集。
3. **character_set_results**：服务器返回给客户端的结果使用的字符集。

当你执行 `SET NAMES utf8mb4;` 时，MySQL 会执行以下等效命令：

```sql
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;
```

### 为什么使用 utf8mb4

`utf8mb4` 是一种扩展的 UTF-8 编码，支持完整的 Unicode 字符集，包括一些不常见的符号和表情符号。

相比之下，`utf8` 编码只支持最多3个字节的字符，不能完全表示所有的 Unicode 字符。

### 适用场景

你应该在以下情况下使用 `SET NAMES utf8mb4;`：

- **当你知道你的数据包含完整的 Unicode 字符集**，包括表情符号和其他特殊字符。
- **当你在执行 SQL 文件之前**，确保文件中的字符不会因为字符集不匹配而出现乱码。

### 示例

假设你有一个包含 Unicode 字符的 SQL 文件，并希望确保数据正确插入到数据库中，可以在执行 `source` 命令之前运行以下命令：

```sql
SET NAMES utf8mb4;
source /路径/到/你的/sql文件.sql;
```

这样可以确保 SQL 文件中的所有字符都能正确处理和存储。

### 总结

`SET NAMES utf8mb4;` 命令在处理包含复杂 Unicode 字符的数据时非常有用，确保客户端和服务器之间的字符集一致，防止出现乱码问题。


# 参考资料

https://www.jb51.net/database/3110399bu.htm

https://blog.csdn.net/weixin_44147535/article/details/135438169

* any list
{:toc}