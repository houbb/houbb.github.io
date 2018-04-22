---
layout: post
title:  Oracle Learn-01-Query
date:  2018-04-22 19:00:57 +0800
categories: [SQL]
tags: [sql, oracle, learn]
published: true
---


# Oracle 安装

学习 oracle 之前，是对应服务的安装。不是本文的重点。

- Docker 安装

[Oracle Docker 安装](https://houbb.github.io/2018/04/21/docker-install-oracle)

# Oracle 版本信息

- 脚本

```sql
select * from v$version;
```

- 结果

```
BANNER
--------------------------------------------------------------------------------
Oracle Database 11g Express Edition Release 11.2.0.2.0 - 64bit Production
PL/SQL Release 11.2.0.2.0 - Production
CORE	11.2.0.2.0	Production
TNS for Linux: Version 11.2.0.2.0 - Production
NLSRTL Version 11.2.0.2.0 - Production
```

- 版本号说明

| 位置 | 名称 | 说明|
|:----|:----|:----|
| 1 | Major Database Release Number | 它代表的是一个新版本软件，也标志着一些新的功能。如11g，10g |
| 2 | Database Maintenance Release Number | 代表一个maintenance release 级别，也可能包含一些新的特性 |
| 3 | Fusion Middleware Release Number | 反应Oracle 中间件（Oracle Fusion Middleware）的版本号 |
| 4 | Component-Specific Release Number | 主要是针对组件的发布级别。不同的组件具有不同的号码。 比如Oracle 的patch包 |
| 5 | Platform-Specific Release Number | 这个数字位标识一个平台的版本。 通常表示patch 号 |


# Oracle 数据库名称

- 脚本

```sql
select name from v$database;
```

- 结果

```
NAME
---------
XE
```

# Oracle 所有表信息

- 脚本

```sql
select * from all_tables;
```

# Oracle 表结构

- 脚本

```sql
desc ${table_name};
```

# Oracle 数据库切换

```sql
database ${database_name};
```




* any list
{:toc}









 





