---
layout: post
title: mysql Tutorial-04-database 数据库的管理
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# mysql 数据库的创建

在MySQL中，创建数据库是指创建一个新的数据库实例，用于存储数据表、视图、存储过程等数据库对象。

下面是详细介绍如何在MySQL中创建数据库的步骤：

1. **登录MySQL服务器**：
   在开始创建数据库之前，首先需要登录到MySQL服务器。可以使用MySQL命令行客户端或者图形化工具，如phpMyAdmin、MySQL Workbench等来登录。
   
   在命令行中，可以使用以下命令登录：

   ```bash
   mysql -u your_username -p
   ```

   然后输入密码以完成登录。

2. **创建数据库**：
   一旦登录成功，就可以开始创建数据库。使用`CREATE DATABASE`语句来创建数据库，语法如下：

   ```sql
   CREATE DATABASE database_name;
   ```

   其中`database_name`是你想要创建的数据库的名称。
   
   例如，要创建名为`mydatabase`的数据库，可以执行以下命令：

   ```sql
   CREATE DATABASE mydatabase;
   ```

   如果创建成功，MySQL将返回一条消息确认数据库已创建。

3. **字符集和校对规则**：

   在创建数据库时，你还可以指定字符集和校对规则。字符集用于定义数据库中字符的编码方式，校对规则用于定义在排序和比较字符时要使用的规则。
   
   可以通过在`CREATE DATABASE`语句中添加`CHARACTER SET`和`COLLATE`子句来指定字符集和校对规则，例如：

   ```sql
   CREATE DATABASE mydatabase
   CHARACTER SET utf8mb4
   COLLATE utf8mb4_unicode_ci;
   ```

   这个示例中，创建了名为`mydatabase`的数据库，并指定了`utf8mb4`字符集和`utf8mb4_unicode_ci`校对规则。

4. **查看已创建的数据库**：

   创建数据库后，你可以使用`SHOW DATABASES;`语句来查看已创建的数据库列表，例如：

   ```sql
   SHOW DATABASES;
   ```

   这将列出MySQL服务器上所有的数据库，包括刚刚创建的`mydatabase`。

通过上述步骤，你就可以在MySQL中创建一个新的数据库。


# mysql 数据库的删除

要删除一个MySQL数据库，你可以使用`DROP DATABASE`语句。注意，删除数据库将永久删除数据库及其所有数据，因此在执行此操作之前，请务必谨慎。下面是一个删除数据库的示例：

```sql
DROP DATABASE mydatabase;
```

这将删除名为`mydatabase`的数据库。如果数据库不存在，将会抛出一个错误。你也可以添加`IF EXISTS`来避免在数据库不存在时抛出错误，例如：

```sql
DROP DATABASE IF EXISTS mydatabase;
```

这样就可以安全地删除数据库，如果数据库不存在，则不会抛出错误。

请注意，删除数据库的操作是不可逆的，所有数据库中的数据都将被永久删除。

因此，在执行删除操作之前，请务必进行适当的备份和确认。

## 实际测试

比如：

```sql
mysql> create database apple_db;
Query OK, 1 row affected (0.00 sec)

mysql> show databases;
+----------------------+
| Database             |
+----------------------+
| information_schema   |
| apple_db             |
| cdc                  |
```

删除：

```sql
mysql> DROP DATABASE IF EXISTS apple_db;
Query OK, 0 rows affected (0.02 sec)

mysql> show databases;
+----------------------+
| Database             |
+----------------------+
| information_schema   |
| cdc                  |
```



# msyql 数据库的使用

```sql
use databasename;
```

创建好一个数据库，我们使用 use 可以使用，可以继续建表等操作。

# 详细介绍一下 mysql 数据库的导入/导出

MySQL数据库的导入和导出是非常常见和重要的操作，它们允许你在不同的MySQL数据库之间迁移数据，备份数据，或者将数据导入到数据库中。下面将分别介绍如何导入和导出MySQL数据库。

## 导出MySQL数据库：

### 1. 使用 mysqldump 命令：

```bash
mysqldump -u 用户名 -p 数据库名 > 导出文件名.sql
```

例如，导出名为 `mydatabase` 的数据库，可以执行以下命令：

```bash
mysqldump -u root -p mydatabase > mydatabase_backup.sql
```

这将把 `mydatabase` 数据库导出到名为 `mydatabase_backup.sql` 的文件中。

## 导入MySQL数据库：

### 1. 使用 mysql 命令：

```bash
mysql -u 用户名 -p 数据库名 < 导入文件名.sql
```

例如，导入名为 `mydatabase_backup.sql` 的备份文件到数据库 `mydatabase` 中，可以执行以下命令：

```bash
mysql -u root -p mydatabase < mydatabase_backup.sql
```

## 注意事项：

- 在导出和导入数据之前，请确保数据库用户具有足够的权限执行这些操作。
- 在导出数据时，确保服务器上有足够的磁盘空间来保存导出的文件。
- 在导入数据时，确保导入文件的格式正确，并且导入的数据不会与数据库中的现有数据冲突。

通过上述方法，你可以方便地在MySQL数据库之间导入和导出数据。


## 测试

```sql
create database db_export;
```

然后退出登录，重新打开命令行

导出：

```sql
mysql -u admin -p db_export > db_export.sql
```

导入：

```sql
mysql -u admin -p db_export_bak < db_export.sql
```


# 参考资料

https://www.tutorialspoint.com/mysql/mysql-variables.htm

* any list
{:toc}