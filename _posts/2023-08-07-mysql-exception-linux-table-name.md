---
layout: post
title: Ubuntu 下 mysql 表名称区分大小写的导致查询不到
date:  2023-08-07 +0800
categories: [Database]
tags: [database, mysql, sh]
published: true
---

# com.mysql.jdbc.PacketTooBigException

```
Cause: com.mysql.jdbc.PacketTooBigException: Packet for query is too large (4513915 > 4194304).
You can change this value on the server by setting the max_allowed_packet' variable.
```

# Ubuntu 数据库查询不存在

## 原因

Mybatis查询表名大小写是不固定的。

一般的系统是不区分表名称的大小写的。但是Ubuntu下MySQL是区分大小写的。需额外设置:

## 查询

Default is:

```
mysql> show variables like "%case%";
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| lower_case_file_system | OFF   |
| lower_case_table_names | 0     |
+------------------------+-------+
```

## 解决方式

编辑 ```my.cnf```：

```
vi /etc/mysql/my.cnf
```

在 [mysqld] 下添加以下行：

```
lower_case_table_names=1
```

重启 MySQL：

```
/etc/init.d/mysql restart
```

```
mysql> show variables like "%case%";
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| lower_case_file_system | OFF   |
| lower_case_table_names | 1     |
+------------------------+-------+
2 rows in set (0.00 sec)
```

* any list
{:toc}