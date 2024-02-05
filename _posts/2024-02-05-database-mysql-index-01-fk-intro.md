---
layout: post
title: mysql 外键索引入门介绍
date: 2024-02-05 21:01:55 +0800
categories: [Database]
tags: [database, sql, mysql, index, sh]
published: true
---

# 背景

以前工作学习中，一直被告诫不要使用外键，所以也没有仔细整理过。

这里记录一下笔记。

# 外键

## 是什么？

MySQL 的外键（Foreign Key）是一种关系型数据库中用于建立表与表之间关联关系的重要工具。

外键定义了两个表之间的引用关系，它连接了两个表，使它们之间建立起一定的联系。

外键用于维护表与表之间的一致性和完整性，确保数据的准确性和可靠性。

## 如何定义

在创建表时，可以使用 `FOREIGN KEY` 关键字来定义外键。外键通常与 `REFERENCES` 关键字一起使用，用于指定引用的表和列。

外键通常关联到另一个表的主键列，这样它就能确保引用的数据是一致的。

```sql
CREATE TABLE 表名 (
    列1 数据类型,
    列2 数据类型,
    ...
    FOREIGN KEY (外键列) REFERENCES 关联表名(关联列)
);
```

## 级联操作

外键还可以定义级联操作，包括 `CASCADE`、`SET NULL`、`SET DEFAULT` 和 `NO ACTION`。

这些操作定义了在主表中进行更新或删除操作时，对应的外键列在从表中的行的处理方式。

例如，`CASCADE` 表示主表的更新或删除操作将在从表上进行相应的级联操作。

```sql
CREATE TABLE 表1 (
    列1 数据类型 PRIMARY KEY
);
CREATE TABLE 表2 (
    列2 数据类型,
    列3 数据类型,
    列4 数据类型,
    FOREIGN KEY (列2) REFERENCES 表1(列1) ON DELETE CASCADE
);
```

## 外键的限制

- 外键的引用列必须是唯一索引（Unique Index）或主键，以确保引用的数据是唯一的。

- 外键列和引用列的数据类型必须相同。

- InnoDB 存储引擎支持外键，而 MyISAM 不支持。

## 外键的优缺点：

**优点：**

1. **数据一致性：** 外键可以确保表与表之间的关联关系，维护数据的一致性。通过外键约束，可以避免插入或更新无效的引用，保持数据的完整性。

2. **数据完整性：** 外键可以防止误删除关联的数据。如果有关联关系的数据存在，删除主表中的记录时，外键约束可以阻止删除，或者通过级联操作删除相关的从表数据。

3. **关联查询：** 外键使得关联查询更加方便。可以通过 JOIN 操作轻松地获取关联表的信息，提高查询的灵活性。

**缺点：**

1. **性能开销：** 外键可能引入一定的性能开销。特别是在大规模的数据库中，维护外键关系可能会影响插入、更新和删除操作的性能。

2. **复杂性：** 外键关系可能增加数据库结构的复杂性。在设计数据库时，需要仔细考虑外键的引入，以及相关的级联操作和约束。

3. **不同数据库支持不同：** 不同的数据库管理系统对外键的支持程度和实现方式可能有所不同。在切换数据库引擎或迁移数据时，可能会遇到兼容性问题。

# 简单例子

mysql 5.7

## 创建外键约束

当创建两张表，其中一张是用户表，另一张是用户拓展表，可以使用外键来建立它们之间的关联。

以下是一个具体的例子：

```sql
-- 创建用户表
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(255) NOT NULL
);

-- 创建用户拓展表，并添加外键关联
CREATE TABLE user_extra (
    user_id INT PRIMARY KEY,
    remark VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 元数据查询

可以通过 sql 查询对应的引用信息

```sql
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    information_schema.KEY_COLUMN_USAGE
WHERE 
    REFERENCED_TABLE_SCHEMA = 'test';
```

数据如下：

```
+------------+-------------+-------------------+-----------------------+------------------------+
| TABLE_NAME | COLUMN_NAME | CONSTRAINT_NAME   | REFERENCED_TABLE_NAME | REFERENCED_COLUMN_NAME |
+------------+-------------+-------------------+-----------------------+------------------------+
| user_extra | user_id     | user_extra_ibfk_1 | users                 | id                     |
+------------+-------------+-------------------+-----------------------+------------------------+
```

## 初始化数据

```sql
insert into users(id, username) values (1, 'u1');
insert into user_extra(user_id, remark) values (1, 'u1-ex');
```

如下:

```
mysql> select * from users;
+----+----------+
| id | username |
+----+----------+
|  1 | u1       |
+----+----------+
1 row in set (0.00 sec)

mysql> select * from user_extra;
+---------+--------+
| user_id | remark |
+---------+--------+
|       1 | u1-ex  |
+---------+--------+
1 row in set (0.00 sec)
```

## 测试删除级联

我们直接把 user 表删除

```sql
delete from users where id = 1;
```

此时 user_extra 也同步被清空了。

```
mysql> select * from user_extra;
Empty set (0.00 sec)
```

# 小结

外键对于保证数据一致性，还是比较方便的。

但是为什么现在工作中很少见到呢？

**不建议使用的情况：**

在某些情况下，可能会有人不太建议使用外键，主要基于以下考虑：

1. **性能优化：** 有些数据库设计师和开发者更倾向于手动管理关联关系，以更好地控制性能。手动维护关联关系可能允许更灵活的优化策略。

2. **水平分片：** 在水平分片的情况下，外键可能会增加复杂性。某些数据库系统对分片上的外键支持可能有限，因此在这种情况下可能会选择不使用外键。

3. **微服务架构：** 在微服务架构中，服务之间的解耦是一个关键设计原则。有些团队认为外键引入了过多的服务之间的耦合，因此选择在微服务架构中限制外键的使用。

每一种技术都有适合的场景，我们结合自己的业务来实现。


--------------------------------------------------------------------------------------------------------


# chat

## 详细介绍一下 mysql 的外键

MySQL 的外键（Foreign Key）是一种关系型数据库中用于建立表与表之间关联关系的重要工具。

外键定义了两个表之间的引用关系，它连接了两个表，使它们之间建立起一定的联系。

外键用于维护表与表之间的一致性和完整性，确保数据的准确性和可靠性。

以下是 MySQL 外键的详细介绍：

1. **外键的定义：**
   在创建表时，可以使用 `FOREIGN KEY` 关键字来定义外键。外键通常与 `REFERENCES` 关键字一起使用，用于指定引用的表和列。外键通常关联到另一个表的主键列，这样它就能确保引用的数据是一致的。

   ```sql
   CREATE TABLE 表名 (
       列1 数据类型,
       列2 数据类型,
       ...
       FOREIGN KEY (外键列) REFERENCES 关联表名(关联列)
   );
   ```

2. **外键约束：**
   外键引入了一种约束，确保了两个表之间数据的一致性。通过外键，可以防止在一个表中插入无效的引用，从而保持数据的完整性。

3. **级联操作：**
   外键还可以定义级联操作，包括 `CASCADE`、`SET NULL`、`SET DEFAULT` 和 `NO ACTION`。这些操作定义了在主表中进行更新或删除操作时，对应的外键列在从表中的行的处理方式。例如，`CASCADE` 表示主表的更新或删除操作将在从表上进行相应的级联操作。

   ```sql
   CREATE TABLE 表1 (
       列1 数据类型 PRIMARY KEY
   );

   CREATE TABLE 表2 (
       列2 数据类型,
       列3 数据类型,
       列4 数据类型,
       FOREIGN KEY (列2) REFERENCES 表1(列1) ON DELETE CASCADE
   );
   ```

4. **检查外键约束状态：**
   可以使用 `SHOW CREATE TABLE` 语句来查看表的创建语句，从而了解外键的定义和约束。

   ```sql
   SHOW CREATE TABLE 表名;
   ```

5. **外键的限制：**
   - 外键的引用列必须是唯一索引（Unique Index）或主键，以确保引用的数据是唯一的。
   - 外键列和引用列的数据类型必须相同。
   - InnoDB 存储引擎支持外键，而 MyISAM 不支持。

通过使用外键，可以在数据库中建立表与表之间的关联关系，从而更好地组织和管理数据，确保数据的完整性和一致性。

## 给一个具体的外键创建表的例子，2张表。一张用户表，一张用户拓展表，拓展表的 user_id 是 用户表的 id

当创建两张表，其中一张是用户表，另一张是用户拓展表，可以使用外键来建立它们之间的关联。以下是一个具体的例子：

```sql
-- 创建用户表
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

-- 创建用户拓展表，并添加外键关联
CREATE TABLE user_extension (
    user_id INT PRIMARY KEY,
    full_name VARCHAR(255),
    address VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

在上面的例子中，`users` 表包含了用户的基本信息，而 `user_extension` 表包含了用户的拓展信息。

在 `user_extension` 表中，`user_id` 列被定义为外键，它引用了 `users` 表中的 `id` 列。

这样，就建立了两张表之间的关联关系。

使用 `ON DELETE CASCADE` 表示，当 `users` 表中对应的记录被删除时，与之关联的 `user_extension` 表中的记录也会被级联删除。

这种关联关系使得你可以通过用户表的 `id` 来访问用户拓展表中的相关信息，确保了两张表之间数据的一致性。

## ON DELETE CASCADE 这部分，是不是在新增/修改/删除 都有对应的写法？

`ON DELETE CASCADE` 是在删除操作时生效的，具体含义是当主表（被引用的表，例如 `users` 表）中的记录被删除时，与之关联的外键列在从表（引用表，例如 `user_extension` 表）中的记录也会被级联删除。

在外键约束中，`ON DELETE` 子句有几种常见的选项，包括：

- `CASCADE`: 当主表中的记录被删除时，从表中相关的记录也会被自动删除。
- `SET NULL`: 当主表中的记录被删除时，从表中的外键列会被设置为 `NULL`。
- `SET DEFAULT`: 当主表中的记录被删除时，从表中的外键列会被设置为默认值。
- `NO ACTION` (默认): 拒绝对主表进行删除操作，除非相应的外键列在从表中没有引用记录。

在新增和修改数据时，通常并不需要使用 `ON DELETE CASCADE`，因为这个选项主要用于处理删除操作时的级联。

对于新增和修改，只需确保外键引用的数据是存在的并符合约束即可。

## ON UPDATE CASCADE 是什么意思？

`ON UPDATE CASCADE` 是外键约束中的一个选项，用于定义当主表中的记录的主键被更新时，与之相关的外键列在从表中的对应记录是否要被级联更新。

具体来说，当主表中的记录的主键发生变化时，`ON UPDATE CASCADE` 将会使与之关联的从表中的外键列的值也随之更新，以保持两个表之间的一致性。这对于确保关联数据的准确性非常有用。

以下是一个简单的例子，演示了如何在创建表时使用 `ON UPDATE CASCADE`：

```sql
-- 创建主表
CREATE TABLE 主表 (
    主键列 INT PRIMARY KEY
);

-- 创建从表，并添加外键关联（包括 ON UPDATE CASCADE）
CREATE TABLE 从表 (
    外键列 INT,
    FOREIGN KEY (外键列) REFERENCES 主表(主键列) ON UPDATE CASCADE
);
```

在这个例子中，如果你更新了主表中的某个记录的主键，所有与之关联的从表中的外键列也将被更新，以反映主键的变化。

需要注意的是，`ON UPDATE CASCADE` 只对主键或唯一索引生效，因为它需要确保更新后的值在关联表中是唯一的。

如果外键引用的是非唯一索引，更新可能导致多个行具有相同的外键值，因此不符合唯一性要求。


## 外键有什么优缺点？为什么现在工作中不太建议使用？

外键在数据库设计中有其优缺点，而关于在工作中不太建议使用的问题，可能取决于特定的应用场景和设计哲学。

以下是一些关于外键的优缺点：

**优点：**

1. **数据一致性：** 外键可以确保表与表之间的关联关系，维护数据的一致性。通过外键约束，可以避免插入或更新无效的引用，保持数据的完整性。

2. **数据完整性：** 外键可以防止误删除关联的数据。如果有关联关系的数据存在，删除主表中的记录时，外键约束可以阻止删除，或者通过级联操作删除相关的从表数据。

3. **关联查询：** 外键使得关联查询更加方便。可以通过 JOIN 操作轻松地获取关联表的信息，提高查询的灵活性。

**缺点：**

1. **性能开销：** 外键可能引入一定的性能开销。特别是在大规模的数据库中，维护外键关系可能会影响插入、更新和删除操作的性能。

2. **复杂性：** 外键关系可能增加数据库结构的复杂性。在设计数据库时，需要仔细考虑外键的引入，以及相关的级联操作和约束。

3. **不同数据库支持不同：** 不同的数据库管理系统对外键的支持程度和实现方式可能有所不同。在切换数据库引擎或迁移数据时，可能会遇到兼容性问题。

**不建议使用的情况：**

在某些情况下，可能会有人不太建议使用外键，主要基于以下考虑：

1. **性能优化：** 有些数据库设计师和开发者更倾向于手动管理关联关系，以更好地控制性能。手动维护关联关系可能允许更灵活的优化策略。

2. **水平分片：** 在水平分片的情况下，外键可能会增加复杂性。某些数据库系统对分片上的外键支持可能有限，因此在这种情况下可能会选择不使用外键。

3. **微服务架构：** 在微服务架构中，服务之间的解耦是一个关键设计原则。有些团队认为外键引入了过多的服务之间的耦合，因此选择在微服务架构中限制外键的使用。

需要注意的是，这些观点并不适用于所有场景，而是依赖于具体的应用需求和团队的偏好。在某些情况下，合理使用外键是非常有益的，特别是对于强调数据一致性和完整性的应用。在进行数据库设计时，应根据具体情况权衡利弊，选择合适的方案。

## 外键做的事情是不是都可以通过事务替代？

外键和事务是数据库中两个不同的概念，它们解决了数据库中的不同问题，尽管在某些情况下可以达到类似的效果。

**外键** 主要用于建立表与表之间的关联关系，确保数据的一致性和完整性。外键定义了表与表之间的引用关系，并通过引用列与被引用列之间的关系，确保了数据的关联性。外键可以防止插入无效的引用，保证了数据的完整性。

**事务** 是一组数据库操作，要么全部执行，要么全部不执行，具有原子性、一致性、隔离性和持久性（ACID）的特性。事务用于确保一系列操作的一致性，即要么全部执行成功，要么全部失败回滚。事务可以包含插入、更新、删除等多种操作，而且通常用于处理复杂的业务逻辑。

虽然事务可以用于确保一系列操作的一致性，但它们并不直接解决表与表之间的关联关系，也不提供外键的引用和级联操作。外键主要用于建立表之间的关联，而事务则用于处理一系列操作的一致性。

在某些情况下，使用事务可以模拟外键的部分功能，但两者的目的和机制是不同的。事务是一种更为通用的概念，而外键更专注于建立表与表之间的关联。

总体而言，外键和事务在数据库设计和操作中都有着各自的作用。在设计数据库时，通常会同时使用外键和事务，以保证数据的完整性和一致性。


## 如何通过 sql 查询 mysql 中所有的外键信息

在 MySQL 中，你可以通过查询系统表 `information_schema` 中的相关表来获取外键信息。

以下是查询外键信息的 SQL 查询语句：

```sql
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    information_schema.KEY_COLUMN_USAGE
WHERE 
    REFERENCED_TABLE_SCHEMA = 'your_database_name';
```

请替换 `'your_database_name'` 为你实际使用的数据库名称。这个查询将返回指定数据库中所有表的外键信息，包括：

- `TABLE_NAME`: 包含外键的表名。
- `COLUMN_NAME`: 包含外键的列名。
- `CONSTRAINT_NAME`: 外键的约束名称。
- `REFERENCED_TABLE_NAME`: 外键引用的表名。
- `REFERENCED_COLUMN_NAME`: 外键引用的列名。

这样的查询可以帮助你了解数据库中表之间的外键关系。注意，这个查询仅适用于 InnoDB 存储引擎，因为 MyISAM 不支持外键。

请注意，如果你使用的是 MySQL 8.0 或更新版本，你还可以通过查询 `information_schema.REFERENTIAL_CONSTRAINTS` 表来获取外键信息，提供了更为详细的信息。

```sql
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    information_schema.REFERENTIAL_CONSTRAINTS
WHERE 
    CONSTRAINT_SCHEMA = 'your_database_name';
```

这个查询提供了更多的外键约束信息，包括外键的删除和更新操作（`DELETE_RULE` 和 `UPDATE_RULE`）。同样，请替换 `'your_database_name'` 为你实际使用的数据库名称。


```sql
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    information_schema.KEY_COLUMN_USAGE
WHERE 
    REFERENCED_TABLE_SCHEMA = 'test';
```

# 参考资料

https://www.cnblogs.com/JavaEdge/p/17829164.html

* any list
{:toc}
