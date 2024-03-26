---
layout: post
title: mysql Tutorial-06-table 表的常见操作 truncate 清空表
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: true
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# 介绍一下 mysql 的表的 truncate 清空表

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




# 参考资料

https://www.tutorialspoint.com/mysql/mysql_create_table.htm

* any list
{:toc}