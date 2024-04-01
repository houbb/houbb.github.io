---
layout: post
title: mysql Tutorial-12-index 索引介绍
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, mysql, mysql-tutorial, sh]
published: false
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# 表准备

测试表准备。

```sql
create database mysql_learn;
use mysql_learn;

drop table if exists employees;
CREATE TABLE "employees" (
  "employee_id" int(11) NOT NULL AUTO_INCREMENT,
  "first_name" varchar(32) DEFAULT NULL,
  "last_name" varchar(32) DEFAULT NULL,
  "age" int(11) DEFAULT NULL,
  "department" varchar(32) DEFAULT NULL,
  "salary" decimal(10,2) DEFAULT NULL,
  PRIMARY KEY ("employee_id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='员工信息表';

drop table if exists department;
CREATE TABLE "department" (
  "id" int(11) NOT NULL AUTO_INCREMENT,
  "name" varchar(32) DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='部门信息表';
```

我们插入初始化数据：

```sql
insert into employees(first_name, last_name, age, department, salary) values ('老马', '啸西风', 29, 'IT', 88888);
insert into employees(first_name, last_name, age, department, salary) values ('小叶', '爱开源', 27, 'SALE', 9999);

insert into department(id, name) values (1, 'IT');
insert into department(id, name) values (2, 'SALE');
```

数据确认：

```
mysql> select * from employees;
+-------------+------------+-----------+------+------------+----------+
| employee_id | first_name | last_name | age  | department | salary   |
+-------------+------------+-----------+------+------------+----------+
|           1 | 老马       | 啸西风    |   29 | IT         | 88888.00 |
|           2 | 小叶       | 爱开源    |   27 | SALE       |  9999.00 |
+-------------+------------+-----------+------+------------+----------+
2 rows in set (0.00 sec)

mysql> select * from department;
+----+------+
| id | name |
+----+------+
|  1 | IT   |
|  2 | SALE |
+----+------+
2 rows in set (0.00 sec)
```

# 详细介绍下 mysql index 索引 

## 说明

MySQL索引是一种用于提高数据库查询性能的数据结构。

它们类似于书籍的目录，可以帮助数据库快速定位到存储在表中的特定数据，而无需扫描整个表。

索引通过创建一个按照特定列或列组排序的数据结构，使得数据库可以更快地执行搜索、排序和聚合操作。

下面是一些MySQL索引的详细介绍：

### 索引类型：

#### a. B-Tree 索引：

   - 大多数情况下，MySQL使用B-Tree索引来实现索引。B-Tree索引是一种平衡树结构，它将数据按照顺序存储在节点中，并通过二分查找来快速定位数据。这种索引适用于等值查找、范围查找和排序操作。

#### b. 哈希索引：

   - 哈希索引使用哈希算法将索引列的值映射到索引位置。它适用于等值查找操作，但不支持范围查找和排序。

#### c. 全文索引：

   - 全文索引用于在文本字段上执行全文搜索。它们允许用户执行自然语言搜索，而不是简单的精确匹配。MySQL提供了全文索引的特殊支持。

#### d. 空间索引：

   - 空间索引用于地理空间数据类型，如Point、LineString等。它们使得MySQL能够快速执行空间关系查询，例如距离查询、相交查询等。

### 索引的优点：

- 提高查询性能：通过减少数据库扫描的数据量，索引可以加速查询操作。

- 加速排序和聚合：索引可使MySQL更快地执行排序和聚合操作。

- 加速连接操作：当连接多个表时，索引可以提高连接操作的效率。

### 索引的缺点：

- 占用额外的存储空间：索引需要额外的存储空间来存储索引数据结构。

- 更新开销：对表的更新操作（如插入、更新、删除）可能会导致索引的更新，这会增加一些开销。

- 维护成本：随着数据的增加和更新，索引可能需要定期维护以保持高性能。

### 选择索引的考虑因素：

- 查询频率：应该根据经常执行的查询来选择创建索引的列。

- 数据的基数（Cardinality）：基数指的是索引列中不同值的数量。基数越高，索引的效果越好。

- 数据类型：某些数据类型更适合于特定类型的索引。例如，哈希索引适合于完全匹配查询，而B-Tree索引适合于范围查询和排序。

- 索引覆盖：如果一个索引包含了所有查询需要的列，那么数据库就可以完全使用索引来执行查询，而不必回到表中查找数据，这可以提高查询的效率。

MySQL索引是优化数据库性能的重要工具，但需要仔细考虑何时创建、如何创建以及何时删除索引，以避免不必要的性能问题和存储开销。


## clustered index 和 non-clustered index

在MySQL中，可以根据其物理存储方式将索引分为聚簇索引（Clustered Indexes）和非聚簇索引（Non-clustered Indexes）。

它们在数据存储和访问上有着不同的工作原理和特点。

### 聚簇索引（Clustered Indexes）：

1. **定义**：

   - 聚簇索引是按照索引的顺序直接存储数据行的一种索引结构。在MySQL中，每个表只能有一个聚簇索引。
   
2. **工作原理**：

   - 当在表上创建聚簇索引时，MySQL会根据索引的顺序对表中的数据进行排序，并直接将数据行存储在索引的叶子节点上。因此，聚簇索引中的数据行实际上就是表中的数据行。聚簇索引中的叶子节点包含了完整的数据行。
   
3. **优点**：

   - 数据存储紧凑：聚簇索引直接将索引与数据行关联，使得数据存储更加紧凑，减少了额外的查找开销。

   - 查询性能提高：由于数据行与索引直接关联，因此对于使用聚簇索引的查询，MySQL可以更快地定位和获取数据行，提高查询性能。
   
4. **缺点**：

   - 更新代价较高：当对聚簇索引列进行更新操作时，可能需要重新排列数据行的顺序，导致更新代价较高。

   - 索引增长问题：插入新数据时，如果数据行的顺序与聚簇索引不一致，可能导致索引分裂和碎片化，影响性能。
   
### 非聚簇索引（Non-clustered Indexes）：

1. **定义**：

   - 非聚簇索引是一种将索引与实际数据行分开存储的索引结构。在MySQL中，一张表可以有多个非聚簇索引。
   
2. **工作原理**：

   - 当在表上创建非聚簇索引时，MySQL会在索引中存储指向对应数据行的引用，而不是直接存储数据行。索引的叶子节点包含指向数据行的指针或引用。
   
3. **优点**：

   - 更新代价较低：由于非聚簇索引只包含索引的信息，而不包含实际数据行，因此对索引的更新操作代价较低。

   - 索引维护开销小：非聚簇索引的更新不会导致数据行的重新排列，因此不会产生额外的索引维护开销。
   
4. **缺点**：
   - 查询性能相对较低：当需要通过非聚簇索引查询数据时，MySQL首先要通过索引定位到数据行的引用，然后再根据引用去检索实际的数据行，这会导致查询性能相对较低。

   - 占用更多的存储空间：非聚簇索引需要额外的存储空间来存储索引和指向数据行的引用。
   
### 区别总结：

- **存储方式**：聚簇索引直接将数据行与索引关联存储，而非聚簇索引将索引与数据行分开存储。

- **更新代价**：聚簇索引的更新代价较高，而非聚簇索引的更新代价较低。

- **查询性能**：聚簇索引查询性能较好，而非聚簇索引查询性能相对较低。

- **存储空间**：聚簇索引通常会占用较少的存储空间，而非聚簇索引则需要额外的存储空间。

## 常见的索引类别

普通索引和唯一索引，这两个是比较常见的：

在MySQL中，普通索引和唯一索引是两种最常见的索引类型。它们都可以帮助提高查询性能，但在某些方面有所不同。

### 普通索引（Normal Index）：

1. **定义**：

   - 普通索引是最基本的索引类型，它可以加速对表中数据的查询操作，但允许索引列中存在重复值。
   
2. **特点**：

   - 允许重复值：普通索引允许在索引列中存在重复的值，因此同一个索引列中可能会存在多个相同的值。
   - 查询性能提升：普通索引可以加速等值查找、范围查找和排序等操作，从而提高查询性能。
   
3. **创建方式**：

   - 可以在表的列上或多个列组合上创建普通索引，使用`CREATE INDEX`语句来实现。

   示例：
   ```sql
   CREATE INDEX idx_name ON table_name(column_name);
   ```

### 唯一索引（Unique Index）：

1. **定义**：

   - 唯一索引也称为不重复索引，它要求索引列中的值是唯一的，不允许存在重复值。
   
2. **特点**：

   - 唯一性约束：唯一索引要求索引列中的值必须是唯一的，如果尝试插入或更新重复的值，将会引发错误。

   - 查询性能提升：与普通索引类似，唯一索引同样可以加速等值查找、范围查找和排序等操作，提高查询性能。
   
3. **创建方式**：

   - 可以在表的列上或多个列组合上创建唯一索引，使用`CREATE UNIQUE INDEX`语句来实现。

   示例：

   ```sql
   CREATE UNIQUE INDEX idx_name ON table_name(column_name);
   ```

4. **与主键的关系**：

   - 在MySQL中，如果在列上定义了唯一索引，并且这个索引列也是表的主键列，那么这个唯一索引实际上就是主键索引。因此，主键索引是唯一索引的一种特例。

### 总结区别：

- **重复值**：普通索引允许索引列中存在重复值，而唯一索引要求索引列中的值必须唯一。

- **错误处理**：唯一索引会强制保证数据的唯一性，当插入或更新操作违反唯一性约束时，MySQL会返回错误，而普通索引则不会。

- **创建方式**：创建普通索引和唯一索引的语法略有不同，后者需要使用`CREATE UNIQUE INDEX`语句，并在索引名后添加`UNIQUE`关键字。

无论是普通索引还是唯一索引，都可以在数据库中提供快速的查询性能，但在设计数据库时，根据数据的唯一性约束需求来选择使用哪种类型的索引。

在MySQL中还可以创建以下类型的索引：

### 1. **主键索引（Primary Key Index）**：

   - 主键索引是一种特殊的唯一索引，它要求索引列的值是唯一的，并且不允许NULL值。在MySQL中，每张表只能有一个主键索引。

   - 在创建表时，可以通过在列定义中使用`PRIMARY KEY`关键字来指定主键索引。

   示例：
   ```sql
   CREATE TABLE table_name (
       column1 INT PRIMARY KEY,
       column2 VARCHAR(50)
   );
   ```

### 2. **全文索引（Full-Text Index）**：

   - 全文索引用于在文本列上执行全文搜索，允许用户执行自然语言搜索。它们对于在大型文本字段上执行搜索操作非常有用。

   - 在创建表时，可以通过使用`FULLTEXT`关键字在文本列上创建全文索引。

   示例：
   ```sql
   CREATE TABLE table_name (
       column1 INT,
       column2 TEXT,
       FULLTEXT (column2)
   );
   ```

### 3. **空间索引（Spatial Index）**：

   - 空间索引用于地理空间数据类型，如Point、LineString等。它们使得MySQL能够快速执行空间关系查询，例如距离查询、相交查询等。

   - 在创建表时，可以通过使用`SPATIAL`关键字在空间列上创建空间索引。

   示例：
   ```sql
   CREATE TABLE table_name (
       column1 INT,
       column2 GEOMETRY,
       SPATIAL INDEX (column2)
   );
   ```

### 4. **组合索引（Composite Index）**：

   - 组合索引是同时在多个列上创建的索引，用于支持涉及多个列的查询。它可以加速涉及组合索引列的查询操作。
   - 在创建表时，可以在`CREATE INDEX`语句中指定多个列，从而创建组合索引。

   示例：
   ```sql
   CREATE INDEX idx_name ON table_name(column1, column2);
   ```

在MySQL中，通过在`CREATE INDEX`语句中指定适当的选项，可以创建这些不同类型的索引。

例如，通过在`CREATE INDEX`语句中使用`UNIQUE`关键字可以创建唯一索引，通过在列定义中使用`PRIMARY KEY`关键字可以创建主键索引，以此类推。

# 索引的管理

## 创建索引：

在MySQL中，可以使用`CREATE INDEX`语句来创建索引。

例如：

```sql
CREATE INDEX idx_name ON table_name(column_name);
```

### 实际测试

我们针对 first_name 创建一个索引。

```sql
create index ix_name on employees(first_name);
```

## 查看索引

创建完成后，如何查看索引呢？

在MySQL中，你可以使用以下方法来查看数据库中的索引：

### 1. 使用 `SHOW INDEX` 语句：

你可以使用 `SHOW INDEX` 语句来查看表的索引信息。

语法如下：

```sql
SHOW INDEX FROM table_name;
```

这将显示表 `table_name` 中的所有索引信息，包括索引名、索引类型、索引所属的列、唯一性约束等。

实际测试：

```sql
show index from employees;
```

结果如下：

```
mysql> show index from employees;
+-----------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
| Table     | Non_unique | Key_name | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment |
+-----------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
| employees |          0 | PRIMARY  |            1 | employee_id | A         |           2 |     NULL | NULL   |      | BTREE      |         |               |
| employees |          1 | ix_name  |            1 | first_name  | A         |           2 |     NULL | NULL   | YES  | BTREE      |         |               |
+-----------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
```


### 2. 使用 `INFORMATION_SCHEMA`：

另一种方法是查询 `INFORMATION_SCHEMA` 数据库中的相应表格，以获取索引信息。

例如：

```sql
SELECT * 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE table_schema = 'your_database' AND table_name = 'your_table';
```

实际测试：

```sql
SELECT * 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE table_schema = 'mysql_learn' AND table_name = 'employees';
```

如下：

```
+---------------+--------------+------------+------------+--------------+------------+--------------+-------------+-----------+-------------+----------+--------+----------+------------+---------+---------------+
| TABLE_CATALOG | TABLE_SCHEMA | TABLE_NAME | NON_UNIQUE | INDEX_SCHEMA | INDEX_NAME | SEQ_IN_INDEX | COLUMN_NAME | COLLATION | CARDINALITY | SUB_PART | PACKED | NULLABLE | INDEX_TYPE | COMMENT | INDEX_COMMENT |
+---------------+--------------+------------+------------+--------------+------------+--------------+-------------+-----------+-------------+----------+--------+----------+------------+---------+---------------+
| def           | mysql_learn  | employees  |          0 | mysql_learn  | PRIMARY    |            1 | employee_id | A         |           2 |     NULL | NULL   |          | BTREE      |         |               |
| def           | mysql_learn  | employees  |          1 | mysql_learn  | ix_name    |            1 | first_name  | A         |           2 |     NULL | NULL   | YES      | BTREE      |         |               |
+---------------+--------------+------------+------------+--------------+------------+--------------+-------------+-----------+-------------+----------+--------+----------+------------+---------+---------------+
```

## 为什么 mysql 要提供 2 种索引查询方式呢？

MySQL提供两种索引查询方式，即使用`SHOW INDEX`语句和查询`INFORMATION_SCHEMA`表，是为了提供更灵活和全面的索引信息查询选择，以满足不同用户的需求和偏好。

### 1. `SHOW INDEX`语句的优点：

- **简单直观**：`SHOW INDEX`语句是MySQL提供的一种简单直观的索引查询方式，可以直接在MySQL命令行或客户端工具中执行，不需要编写复杂的SQL语句。

- **易于使用**：对于初学者或只需要简单索引信息的用户来说，使用`SHOW INDEX`语句更加方便和容易理解。

- **常见用途**：`SHOW INDEX`语句常用于快速查看特定表的索引信息，以及了解索引的结构和基本属性。

### 2. `INFORMATION_SCHEMA`的优点：

- **更灵活的查询**：`INFORMATION_SCHEMA`表是MySQL的元数据信息系统，提供了关于数据库、表、索引等更加详细和灵活的元数据信息，用户可以使用SQL查询语句来执行复杂的条件查询和过滤。

- **更全面的信息**：通过`INFORMATION_SCHEMA`表，用户可以获取更全面和详细的索引信息，包括索引所属的数据库、表名、索引类型、索引所包含的列、索引的唯一性约束等。

- **适用范围广泛**：对于需要进行更复杂的索引信息查询、分析和处理的用户来说，使用`INFORMATION_SCHEMA`表提供了更大的灵活性和功能扩展性。

MySQL提供了两种不同的索引查询方式，以满足不同用户的需求和使用场景。

`SHOW INDEX`语句简单直观，适用于快速查看索引信息；而查询`INFORMATION_SCHEMA`表则更适用于需要进行更灵活、全面和复杂的索引信息查询和分析的情况。

## 修改索引

对于已有的索引，mysql 支持修改吗？如何修改？

在MySQL中，对于已有的索引，可以通过`ALTER TABLE`语句来修改索引。

具体来说，你可以通过`ADD INDEX`、`DROP INDEX`和`RENAME INDEX`等子句来修改索引。

下面是一些常见的修改索引的示例：

### 1. 添加索引：

要添加新的索引，可以使用`ADD INDEX`子句，指定要添加的索引名称和索引列。

```sql
ALTER TABLE table_name ADD INDEX idx_name (column_name);
```

### 2. 删除索引：

要删除现有的索引，可以使用`DROP INDEX`子句，指定要删除的索引名称。

```sql
ALTER TABLE table_name DROP INDEX idx_name;
```

### 3. 重命名索引：

要重命名现有的索引，可以使用`RENAME INDEX`子句，指定要重命名的索引名称和新的索引名称。

```sql
ALTER TABLE table_name RENAME INDEX old_idx_name TO new_idx_name;
```

请注意，对于某些更复杂的索引修改操作，可能需要首先删除现有的索引，然后再添加新的索引，以达到修改索引的目的。

### 实际测试

我们主要验证下重命名。

比如我们觉得自己的索引名字起的不好：

```sql
alter table employees rename index ix_name to ix_first_name;
```

重新确认：

```
mysql> show index from employees;
+-----------+------------+---------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
| Table     | Non_unique | Key_name      | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment |
+-----------+------------+---------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
| employees |          0 | PRIMARY       |            1 | employee_id | A         |           2 |     NULL | NULL   |      | BTREE      |         |               |
| employees |          1 | ix_first_name |            1 | first_name  | A         |           2 |     NULL | NULL   | YES  | BTREE      |         |               |
+-----------+------------+---------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
```

## 删除索引：

如果索引不再需要或者不再有效，可以使用`DROP INDEX`语句来删除索引。

这种比直接 alter table 的方式更加简洁。

例如：

```sql
DROP INDEX idx_name ON table_name;
```

### 实际测试

```sql
drop index ix_first_name on employees;
```

重新确认：

```
mysql> show index from employees;
+-----------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
| Table     | Non_unique | Key_name | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment |
+-----------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
| employees |          0 | PRIMARY  |            1 | employee_id | A         |           2 |     NULL | NULL   |      | BTREE      |         |               |
+-----------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+
```

# 小结

简单总结MySQL的索引：

1. **定义**：索引是一种用于提高数据库查询性能的数据结构，通过按照特定列或列组排序存储数据，使得数据库可以更快地执行搜索、排序和聚合操作。

2. **类型**：

   - **普通索引**：基本的索引类型，允许重复值。
   - **唯一索引**：要求索引列的值是唯一的，不允许重复值。
   - **主键索引**：特殊的唯一索引，用于标识表中的唯一行，要求索引列的值是唯一的且不为空。
   - **全文索引**：用于在文本字段上执行全文搜索。
   - **空间索引**：用于地理空间数据类型。
   - **组合索引**：同时在多个列上创建的索引。

3. **创建方式**：可以使用`CREATE INDEX`语句来创建索引，语法为：
   ```sql
   CREATE INDEX idx_name ON table_name(column_name);
   ```

4. **查看索引**：可以使用`SHOW INDEX`语句或查询`INFORMATION_SCHEMA`表来查看表的索引信息。

5. **修改索引**：可以使用`ALTER TABLE`语句来修改现有的索引，包括添加、删除和重命名索引。

6. **优点**：提高查询性能、加速排序和聚合、加速连接操作。

7. **缺点**：占用额外的存储空间、更新开销、维护成本。

8. **选择考虑因素**：查询频率、数据的基数、数据类型、索引覆盖。

索引是MySQL中重要的性能优化工具，但需要谨慎选择和管理，以避免不必要的性能问题和存储开销。

# 参考资料

https://www.tutorialspoint.com/mysql/mysql_show_index_statement.htm

* any list
{:toc}