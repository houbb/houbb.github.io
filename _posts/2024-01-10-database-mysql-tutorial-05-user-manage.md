---
layout: post
title: mysql Tutorial-05-user 用户管理
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# 介绍一下 mysql 的用户

在MySQL中，用户是指被授权访问数据库服务器的个体或实体。

用户的权限可以限制他们对数据库的操作范围，例如读取、写入、修改或者删除数据库中的数据。

下面是关于MySQL用户的一些重要信息：

### 1. 用户身份：

MySQL用户通常由用户名和主机名组成。主机名指定了可以使用该用户名登录到MySQL服务器的主机或IP地址。

通常情况下，如果主机名字段为空，表示允许从任何主机登录；如果主机名字段为 `%`，表示允许从任何主机登录；如果主机名字段为 `localhost`，表示只允许从本地登录。

### 2. 用户权限：

MySQL用户的权限可以控制他们对数据库的操作。这些权限可以是全局级别的，影响所有数据库和表，也可以是数据库级别或表级别的，只影响特定的数据库或表。

权限可以包括 SELECT、INSERT、UPDATE、DELETE、CREATE、DROP 等操作的权限。

# 用户的管理

## 操作说明

在 MySQL 中，用户的创建、查看和删除可以通过 SQL 语句以及相关的系统表来实现。

下面是针对这些操作的基本示例：

### 创建用户：

要创建用户，可以使用 `CREATE USER` 语句，并指定用户名和登录主机。

例如：

```sql
CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
```

这将创建一个名为 `newuser` 的用户，密码为 `password`，并且只允许从本地主机登录。

### 查看用户：

要查看已经存在的用户，可以查询系统表 `mysql.user`。例如：

```sql
SELECT User, Host FROM mysql.user;
```

这将列出所有存在的用户及其允许登录的主机。

### 删除用户：

要删除用户，可以使用 `DROP USER` 语句，并指定要删除的用户名和登录主机。例如：

```sql
DROP USER 'newuser'@'localhost';
```

这将删除名为 `newuser` 的用户，以及他在本地主机的登录权限。

### 注意事项：

- 在执行任何对用户进行操作的 SQL 语句时，请确保你有足够的权限来执行这些操作。
- 在创建用户时，密码通常应该是加密的。可以使用 `PASSWORD()` 函数来加密密码，例如：`IDENTIFIED BY PASSWORD 'encrypted_password'`。
- 在删除用户之前，请确保用户不再需要，并且不会影响到数据库的正常运行。

通过以上操作，你可以轻松地在 MySQL 中创建、查看和删除用户，以管理数据库的访问权限。


## 实际测试

创建：

```sql
create user 'myuser'@'localhost' identified by '123456';
```

查看：

```sql
mysql> SELECT User, Host FROM mysql.user;
+---------------+-----------+
| User          | Host      |
+---------------+-----------+
| admin         | %         |
| flyway        | localhost |
| go            | localhost |
| mysql.session | localhost |
| mysql.sys     | localhost |
| myuser        | localhost |
| root          | localhost |
+---------------+-----------+
7 rows in set (0.00 sec)
```

删除

```sql
mysql> drop user 'myuser'@'localhost';
Query OK, 0 rows affected (0.01 sec)

mysql> SELECT User, Host FROM mysql.user;
+---------------+-----------+
| User          | Host      |
+---------------+-----------+
| admin         | %         |
| flyway        | localhost |
| go            | localhost |
| mysql.session | localhost |
| mysql.sys     | localhost |
| root          | localhost |
+---------------+-----------+
6 rows in set (0.00 sec)
```

# 用户的锁定与解锁

## 说明

在MySQL中，使用`ACCOUNT LOCK`命令可以锁定一个用户账户，从而禁止该用户登录MySQL服务器。

锁定用户账户后，即使用户提供了正确的用户名和密码，也无法登录到MySQL服务器。

这种操作通常用于临时禁止某个用户登录，例如进行安全审计、维护数据库或处理安全事件等情况。

要使用`ACCOUNT LOCK`命令锁定用户账户，可以按以下步骤操作：

```sql
ALTER USER 'username'@'host' ACCOUNT LOCK;
```

这会将当前会话中的用户账户锁定。在执行这个命令之前，确保已经登录到MySQL服务器并且有足够的权限来锁定用户账户。需要注意的是，这个命令通常需要具有足够权限的用户来执行。

要解锁一个被锁定的用户账户，可以使用`ALTER USER`命令，并将`ACCOUNT UNLOCK`选项指定给被锁定的用户。例如：

```sql
ALTER USER 'username'@'host' ACCOUNT UNLOCK;
```

这将解锁名为`username`的用户在指定的主机`host`上的账户。解锁用户账户后，用户将能够再次登录到MySQL服务器。

总的来说，`ACCOUNT LOCK`命令用于锁定MySQL用户账户，从而暂时禁止其登录MySQL服务器。这个操作通常用于安全管理或特殊维护操作。

## 实际测试

加锁+查看：

```sql
alter user 'myuser'@'localhost' ACCOUNT LOCK;
select User, Host, account_locked FROM mysql.user;

+---------------+-----------+----------------+
| User          | Host      | account_locked |
+---------------+-----------+----------------+
| root          | localhost | N              |
| mysql.session | localhost | Y              |
| mysql.sys     | localhost | Y              |
| flyway        | localhost | N              |
| go            | localhost | N              |
| admin         | %         | N              |
| myuser        | localhost | Y              |
+---------------+-----------+----------------+
7 rows in set (0.00 sec)
```

解锁+查看：

```sql
alter user 'myuser'@'localhost' ACCOUNT UNLOCK;
select User, Host, account_locked FROM mysql.user;

+---------------+-----------+----------------+
| User          | Host      | account_locked |
+---------------+-----------+----------------+
| root          | localhost | N              |
| mysql.session | localhost | Y              |
| mysql.sys     | localhost | Y              |
| flyway        | localhost | N              |
| go            | localhost | N              |
| admin         | %         | N              |
| myuser        | localhost | N              |
+---------------+-----------+----------------+
7 rows in set (0.00 sec)
```

# 用户权限的管理

## 介绍

在 MySQL 中，管理用户权限是非常重要的，可以通过授权和回收权限来控制用户对数据库的访问级别。下面是关于如何增加、查看和回收用户权限的说明：

### 增加用户权限：

要增加用户权限，可以使用 `GRANT` 语句来授权特定的权限给用户。语法如下：

```sql
GRANT privileges ON database_name.table_name TO 'username'@'host';
```

- `privileges`：指定要授予的权限，可以是 SELECT、INSERT、UPDATE、DELETE、CREATE、DROP 等。
- `database_name`：指定要授权的数据库名称，可以使用通配符 * 表示所有数据库。
- `table_name`：指定要授权的表名称，可以使用通配符 * 表示所有表。
- `'username'@'host'`：指定要授予权限的用户名和登录主机。

例如，要给用户 `newuser` 授予对 `mydatabase` 数据库中所有表的 SELECT 权限，可以执行以下命令：

```sql
GRANT SELECT ON mydatabase.* TO 'newuser'@'localhost';
```

### 查看用户权限：

要查看用户的权限，可以查询 `mysql.user` 表。例如，要查看用户 `newuser` 的权限，可以执行以下查询：

```sql
SHOW GRANTS FOR 'newuser'@'localhost';
```

### 回收用户权限：

要回收用户的权限，可以使用 `REVOKE` 语句。语法如下：

```sql
REVOKE privileges ON database_name.table_name FROM 'username'@'host';
```

与 `GRANT` 语句类似，你需要指定要回收的权限、数据库名称、表名称以及用户名和登录主机。

例如，要回收用户 `newuser` 对 `mydatabase` 数据库中所有表的 SELECT 权限，可以执行以下命令：

```sql
REVOKE SELECT ON mydatabase.* FROM 'newuser'@'localhost';
```

### 注意事项：

- 在执行任何对用户权限的修改操作时，请确保你有足够的权限来执行这些操作。
- 在授权和回收权限时，应该考虑到数据库的安全性和业务需求，仅授予必要的权限给用户。

通过以上操作，你可以轻松地增加、查看和回收 MySQL 用户的权限，从而灵活地管理数据库的安全性和访问控制。


## 实际测试

创建用户+设置权限：

```sql
mysql> create user 'myuser'@'localhost' identified by '123456';
Query OK, 0 rows affected (0.01 sec)

mysql> GRANT SELECT ON test.* TO 'myuser'@'localhost';
Query OK, 0 rows affected (0.01 sec)
```

查看权限：

```sql
mysql> SHOW GRANTS FOR 'myuser'@'localhost';
+--------------------------------------------------+
| Grants for myuser@localhost                      |
+--------------------------------------------------+
| GRANT USAGE ON *.* TO 'myuser'@'localhost'       |
| GRANT SELECT ON "test".* TO 'myuser'@'localhost' |
+--------------------------------------------------+
2 rows in set (0.01 sec)
```

回收权限+确认：

```sql
mysql> REVOKE SELECT ON test.* FROM 'myuser'@'localhost';
Query OK, 0 rows affected (0.02 sec)

mysql> SHOW GRANTS FOR 'myuser'@'localhost';
+--------------------------------------------+
| Grants for myuser@localhost                |
+--------------------------------------------+
| GRANT USAGE ON *.* TO 'myuser'@'localhost' |
+--------------------------------------------+
1 row in set (0.00 sec)
```

# 参考资料

https://www.tutorialspoint.com/mysql/mysql_create_user_statement.htm

* any list
{:toc}