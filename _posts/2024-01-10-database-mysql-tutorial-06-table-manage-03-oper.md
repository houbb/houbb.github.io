---
layout: post
title: mysql Tutorial-06-table 表的常见操作 truncate 清空表 / repair 修复表 / lock 锁表 / unlock 解锁 / drop 移除表
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# mysql 的表的 truncate 清空表

## 说明

在 MySQL 中，TRUNCATE 是一个用于快速删除表中所有数据的操作。

与 DELETE 不同，TRUNCATE 是一个 DDL（数据定义语言）操作，它在一个事务中快速地删除表中的所有行，并且不会产生与事务日志相关的额外数据。

下面是关于 MySQL 中 TRUNCATE 的一些详细介绍：

### 语法：

```sql
TRUNCATE TABLE table_name;
```

- `table_name`：要进行清空操作的表的名称。

### 特点和注意事项：

1. **快速操作**：
   - TRUNCATE 操作比 DELETE 操作更快，因为它不是逐行删除，而是一次性删除整个表的数据。
   - TRUNCATE 操作将表的数据页重新初始化，而不是一条一条地删除记录。

2. **不产生事务日志**：
   - TRUNCATE 操作是一个 DDL 操作，因此它不会像 DELETE 一样记录每条删除的数据，不会写入事务日志，因此不会增加事务日志的体积。
   - TRUNCATE 通常比 DELETE 更适合于清空大型表，尤其是当快速释放存储空间或避免事务日志增长的时候。

3. **不触发触发器**：
   - TRUNCATE 操作不会触发与表相关的触发器。

4. **不支持 WHERE 子句**：
   - TRUNCATE 操作不支持 WHERE 子句，无法通过条件选择部分数据删除。

5. **不返回被删除的行数**：
   - TRUNCATE 操作不返回被删除的行数，因为它是一个原子操作。

6. **重置自增列**：
   - TRUNCATE 操作将自动重置表的自增列（如果有），将下一个插入的值重置为该列的起始值。

### 示例：

```sql
TRUNCATE TABLE employees;
```

这个示例将删除表 `employees` 中的所有数据，但保留表结构不变，并重置自增列（如果有的话）。

总的来说，TRUNCATE 是一个快速且有效的清空表数据的操作，特别适用于需要清空大型表的情况。

但需要注意，由于其特性，**TRUNCATE 操作是不可逆的，一旦执行完成，数据将不可恢复**。

因此在执行 TRUNCATE 操作时应格外小心。

### 既然 delete from 也可以清空全表，为什么还需要 truncate 呢？

常言道，既生瑜，何生亮。

虽然 `DELETE FROM` 和 `TRUNCATE TABLE` 都可以用于清空表中的所有数据，但它们之间有一些重要的区别，因此选择使用哪种方法取决于你的需求和情况。

### 区别：

1. **操作速度**：
   - `TRUNCATE TABLE` 操作通常比 `DELETE FROM` 更快。因为 `TRUNCATE` 是一个 DDL（数据定义语言）操作，一次性删除整个表的数据，而 `DELETE` 是一个 DML（数据操作语言）操作，需要逐行删除数据，相对较慢。

2. **事务日志**：
   - `TRUNCATE TABLE` 操作不会写入事务日志，因此不会导致事务日志的增长。而 `DELETE FROM` 操作会写入事务日志，记录每一行被删除的数据，可能导致事务日志变得庞大，增加数据库的负担。

3. **自动重置自增列**：
   - `TRUNCATE TABLE` 操作会自动重置表的自增列（如果有的话），将下一个插入的值重置为该列的起始值。而 `DELETE FROM` 不会影响自增列的值。

4. **触发器**：
   - `TRUNCATE TABLE` 操作不会触发与表相关的触发器。而 `DELETE FROM` 操作会触发触发器。

5. **条件选择**：
   - `DELETE FROM` 可以通过 WHERE 子句选择特定的数据进行删除，而 `TRUNCATE TABLE` 不支持 WHERE 子句，只能删除整个表的数据。

### 选择使用哪种方法取决于以下因素：

- 如果需要快速删除整个表的数据，并且不关心事务日志的增长，可以使用 `TRUNCATE TABLE`。
- 如果需要逐行删除数据，或者需要触发相关的触发器，或者需要通过 WHERE 子句选择特定的数据进行删除，可以使用 `DELETE FROM`。

总的来说，`TRUNCATE TABLE` 适用于需要快速清空整个表的情况，而 `DELETE FROM` 更加灵活，适用于需要逐行删除数据或者选择特定数据进行删除的情况。

答案是 truncate 非常快，特别是一些大表的删除。一般建议在测试环境大表清空时操作，记得做好必要的备份。


# repair table

## 说明

`REPAIR TABLE` 是 MySQL 中用于修复表的命令。

它可以修复表的结构、索引和数据文件，当表损坏或出现错误时，可以使用 `REPAIR TABLE` 来尝试修复。

在 MySQL 中，表可以因为各种原因而损坏，比如硬件故障、意外断电、MySQL 服务异常关闭等。

这种损坏可能导致表无法正常访问或数据丢失。

为了解决这些问题，可以使用 `REPAIR TABLE` 命令来尝试修复损坏的表。

### 语法：

```sql
REPAIR TABLE table_name [, table_name] [QUICK | EXTENDED | USE_FRM]
```

- `table_name`：要修复的表的名称，可以同时修复多个表，多个表名之间用逗号分隔。
- `QUICK`：表示进行快速修复。这种模式通常只会尝试修复索引文件，并且不会检查表中的数据。
- `EXTENDED`：表示进行详细的修复。这种模式会尝试修复索引文件和数据文件，并且会执行更加严格的检查。
- `USE_FRM`：表示仅使用 `.frm` 文件来重建表的定义，而不对数据文件进行修复。

### 示例：

```sql
REPAIR TABLE my_table;
```

这个示例将尝试修复名为 `my_table` 的表。如果表的索引或数据文件损坏，MySQL 将尝试修复这些文件，使表恢复正常。

### 注意事项：

- 在使用 `REPAIR TABLE` 前，应该先备份受影响的表，以防修复过程中出现意外情况导致数据丢失。
- `REPAIR TABLE` 是一种较为简单的修复尝试，有时候可能无法完全修复表，特别是对于严重损坏的情况。在一些情况下，可能需要手动操作或者其他更高级的工具来解决损坏的表。
- 在运行 `REPAIR TABLE` 命令时，应确保有足够的权限执行修复操作。

总的来说，`REPAIR TABLE` 是 MySQL 中用于修复损坏表的命令，可以在一定程度上解决表损坏的问题，但对于严重损坏的情况可能需要其他更进一步的手段来解决。

## 疑问：mysql 本身不是会采用两段式提交保证事务一致性吗？为什么还需要 repair?

两段式提交确实是 MySQL 在处理事务时保证数据一致性的一种机制，它确保了事务的原子性和持久性。

在两段式提交中，事务分为两个阶段：准备阶段和提交阶段。在准备阶段，事务协调者（一般是 MySQL 服务器）会询问所有参与者（即事务涉及到的数据库实例）是否可以执行事务，如果所有参与者都准备就绪，那么协调者会发送提交请求，所有参与者都会提交事务。

然而，`REPAIR TABLE` 不是用来处理事务一致性问题的，而是用于修复表结构、索引或数据文件损坏的工具。

尽管 MySQL 在设计时尽力保证事务的一致性，但在现实情况中，数据库仍然可能会遇到各种问题导致表损坏，比如：

1. 硬件故障：如磁盘损坏、内存故障等。
2. 意外断电：如果在事务进行过程中发生了意外断电，可能会导致数据不一致。
3. MySQL 服务异常关闭：如果 MySQL 服务意外关闭，可能会损坏表文件。

在这些情况下，数据库文件可能会损坏，导致表无法正常访问或数据丢失。这时候就需要使用 `REPAIR TABLE` 命令来尝试修复损坏的表，以尽量恢复数据的一致性和可用性。

总的来说，两段式提交保证了事务的一致性，但并不能完全防止数据库发生各种问题导致表损坏。

而 `REPAIR TABLE` 是 MySQL 提供的用于修复损坏表的工具，用于解决表损坏而不是事务一致性的问题。

## 实际测试

```
mysql> REPAIR TABLE employees;
+-----------------------+--------+----------+---------------------------------------------------------+
| Table                 | Op     | Msg_type | Msg_text                                                |
+-----------------------+--------+----------+---------------------------------------------------------+
| mysql_learn.employees | repair | note     | The storage engine for the table doesn't support repair |
+-----------------------+--------+----------+---------------------------------------------------------+
1 row in set (0.01 sec)
```

为什么提示不支持呢？

### mysql 如何查看数据库的引擎？哪些引擎支持 repair table?

我们可以通过下面的命令查看数据库的引擎:

```sql
SELECT TABLE_NAME, ENGINE
FROM information_schema.tables
WHERE TABLE_SCHEMA = 'mysql_learn';
```

通过下面的命令查看表的引擎：

```sql
SHOW TABLE STATUS LIKE 'employees';
```

如下：

```
mysql> SHOW TABLE STATUS LIKE 'employees' \G;
*************************** 1. row ***************************
           Name: employees
         Engine: InnoDB
        Version: 10
     Row_format: Dynamic
           Rows: 0
 Avg_row_length: 0
    Data_length: 16384
Max_data_length: 0
   Index_length: 16384
      Data_free: 0
 Auto_increment: 1
    Create_time: 2024-03-26 15:10:53
    Update_time: NULL
     Check_time: NULL
      Collation: utf8_general_ci
       Checksum: NULL
 Create_options:
        Comment: 员工信息表
1 row in set (0.00 sec)
```


只有某些存储引擎支持 REPAIR TABLE 命令，常见的支持 REPAIR TABLE 的存储引擎包括 MyISAM 和 Aria。

InnoDB 存储引擎不支持 REPAIR TABLE 命令，因为 InnoDB 存储引擎本身具有自动修复机制，不需要手动进行修复。

其他一些存储引擎可能也支持 REPAIR TABLE，具体取决于存储引擎的实现。


# 表的 lock 和 unlock

## 说明

在 MySQL 中，表的锁定（Lock）和解锁（Unlock）是用于控制对表的并发访问的操作。

锁定表可以防止其他会话修改或访问表，而解锁则释放了对表的锁定，允许其他会话访问或修改表。

### 表的锁定（Lock）：

在 MySQL 中，可以使用 `LOCK TABLES` 命令来锁定表。这个命令允许你锁定一个或多个表，防止其他会话对这些表进行修改或访问。

#### 语法：

```sql
LOCK TABLES table_name [READ | WRITE];
```

- `table_name`：要锁定的表的名称。
- `READ`：共享锁定，允许其他会话读取表的数据，但不允许修改表。
- `WRITE`：排他锁定，防止其他会话读取或修改表。

#### 示例：

```sql
LOCK TABLES my_table WRITE;
```

这个示例将锁定名为 `my_table` 的表，阻止其他会话对该表进行读取或修改。

### 表的解锁（Unlock）：

在 MySQL 中，使用 `UNLOCK TABLES` 命令来解锁表。这个命令释放了之前通过 `LOCK TABLES` 命令锁定的表。

#### 语法：

```sql
UNLOCK TABLES;
```

#### 示例：

```sql
UNLOCK TABLES;
```

这个示例将释放之前通过 `LOCK TABLES` 命令锁定的所有表。

### 注意事项：

- 在使用 `LOCK TABLES` 和 `UNLOCK TABLES` 命令时，应该注意保持锁定和解锁的一致性，避免在没有解锁的情况下尝试修改或访问表。

- 如果一个会话对表进行了锁定，其他会话在尝试对同一表进行修改或访问时可能会被阻塞，直到锁定释放。

- 锁定表可以在事务中使用，但是要注意在事务结束后及时释放表的锁定，避免造成资源浪费或死锁的情况。

总的来说，表的锁定和解锁是用于控制对表的并发访问的重要操作，在需要时可以用于保护数据的一致性和完整性。

## 如何查看表的锁状态呢？

```sql
SHOW OPEN TABLES LIKE 'your_table_name';
```


## 实际测试


```sql
SHOW OPEN TABLES LIKE 'employees';

mysql> SHOW OPEN TABLES LIKE 'employees' \G;
*************************** 1. row ***************************
   Database: mysql_learn
      Table: employees
     In_use: 0
Name_locked: 0
*************************** 2. row ***************************
   Database: test
      Table: employees
     In_use: 0
Name_locked: 0
2 rows in set (0.00 sec)
```

加锁：

```
LOCK TABLES employees read;
```

对应的 In_use 就会变化:

```
mysql> SHOW OPEN TABLES LIKE 'employees' \G;
*************************** 1. row ***************************
   Database: mysql_learn
      Table: employees
     In_use: 1
Name_locked: 0
*************************** 2. row ***************************
   Database: test
      Table: employees
     In_use: 0
Name_locked: 0
2 rows in set (0.00 sec)
```

此时，我们尝试一下操作表。。

```sql
mysql> insert into employees (name) values ('n1');
ERROR 1099 (HY000): Table 'employees' was locked with a READ lock and can't be updated
```

发现无法操作，我们释放锁。

```sql
mysql> UNLOCK TABLES;
Query OK, 0 rows affected (0.00 sec)
```

发现没法指定表，也没法细化到对应的操作。

查看锁状态：

```
mysql> SHOW OPEN TABLES LIKE 'employees' \G;
*************************** 1. row ***************************
   Database: mysql_learn
      Table: employees
     In_use: 0
Name_locked: 0
*************************** 2. row ***************************
   Database: test
      Table: employees
     In_use: 0
Name_locked: 0
2 rows in set (0.00 sec)
```

一切恢复正常。

# mysql 的表 drop 

在MySQL中，`DROP TABLE` 用于删除数据库中的表，以及与之相关的索引、触发器、约束和权限信息。

使用 `DROP TABLE` 命令会永久删除表及其所有数据，因此在执行此命令之前要格外小心，确保你真的想要删除这个表。

### 语法：

```sql
DROP TABLE [IF EXISTS] table_name;
```

- `table_name`：要删除的表的名称。
- `IF EXISTS`：可选参数，表示在删除之前检查表是否存在，如果存在则删除，如果不存在则忽略。

### 示例：

要删除名为 `employees` 的表，可以执行以下命令：

```sql
DROP TABLE employees;
```

如果你担心表不存在会导致错误，可以使用 `IF EXISTS` 参数：

```sql
DROP TABLE IF EXISTS employees;
```

### 注意事项：

- 删除表会永久删除表及其所有数据，因此在执行此命令之前请务必三思。

- 删除表还会删除与表相关的索引、触发器、约束和权限信息。

- 如果表被其他表或者视图引用，将无法直接删除，除非使用 `CASCADE` 参数或者先删除引用它的其他对象。

- 使用 `DROP TABLE` 命令删除表后，数据将不可恢复，建议在删除之前进行备份。

总之，`DROP TABLE` 是 MySQL 中用于删除表的命令，可以永久性地删除指定的表及其相关对象。

在执行此命令之前，请务必谨慎考虑，并确保你真的想要删除这个表。

# 参考资料

https://www.tutorialspoint.com/mysql/mysql_create_table.htm

https://blog.csdn.net/miyatang/article/details/78227344

* any list
{:toc}