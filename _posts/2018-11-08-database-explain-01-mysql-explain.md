---
layout: post
title: MySQL Explain MySQL 执行计划详解
date:  2018-11-8 18:08:03 +0800
categories: [Database]
tags: [sql, mysql, database, explain, sh]
published: true
---

# MySQL Explain

使用explain关键字可以模拟优化器执行SQL查询语句，从而知道MySQL是如何处理你的SQL语句的，分析你的查询语句或是表结构的性能瓶颈。

## 建表测试

- user 表

```sql
create table `user` (
   `id` INT NOT NULL AUTO_INCREMENT,
   `name` VARCHAR(100) NOT NULL,
   PRIMARY KEY (`id`)
);
```

- 初始化

```sql
insert into `user` (`name`) values ('one');
```

- 执行

```sql
explain + #{查询 SQL};
```

## 包含的字段信息

全表 例子1：

```sql
explain select * from user where name='123';

mysql> explain select * from user where name='123';
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra       |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | user  | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    1 |   100.00 | Using where |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
1 row in set, 1 warning (0.00 sec)
```

主键 例子2：

```
mysql> explain select * from (select * from user where id=1) a;
+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
| id | select_type | table | partitions | type  | possible_keys | key     | key_len | ref   | rows | filtered | Extra |
+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | user  | NULL       | const | PRIMARY       | PRIMARY | 4       | const |    1 |   100.00 | NULL  |
+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
1 row in set, 1 warning (0.00 sec)
```

type 对应索引类别，ALL 代表全表扫描。

rows 代表大概需要过滤的行数。

# 多条 explain 结果实战测试

## 建表语句

```sql
-- Orders 表的建表语句
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    total_price DECIMAL(10, 2),
    order_date DATE,
    INDEX(customer_id)
);

-- Customers 表的建表语句
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_level ENUM('Normal', 'VIP'),
    customer_email VARCHAR(100),
    INDEX(customer_level)
);
```

这里的 orders 表包含订单信息，每个订单有一个唯一的 order_id，关联到对应的客户通过 customer_id。

customers 表包含客户信息，每个客户有一个唯一的 customer_id，并且包含客户名称、客户级别和客户邮箱等信息。

## 执行计划

```sql
EXPLAIN 
SELECT o.order_id, o.total_price, c.customer_name
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.total_price > 100
AND c.customer_level = 'VIP';
```

结果:

```
+----+-------------+-------+------------+--------+------------------------+---------+---------+--------------------+------+----------+-------------+
| id | select_type | table | partitions | type   | possible_keys          | key     | key_len | ref                | rows | filtered | Extra       |
+----+-------------+-------+------------+--------+------------------------+---------+---------+--------------------+------+----------+-------------+
|  1 | SIMPLE      | o     | NULL       | ALL    | customer_id            | NULL    | NULL    | NULL               |    1 |   100.00 | Using where |
|  1 | SIMPLE      | c     | NULL       | eq_ref | PRIMARY,customer_level | PRIMARY | 4       | test.o.customer_id |    1 |   100.00 | Using where |
+----+-------------+-------+------------+--------+------------------------+---------+---------+--------------------+------+----------+-------------+
2 rows in set, 1 warning (0.00 sec)
```

这个查询的执行计划包括两个阶段：

第一个阶段是对 customers 表的全表扫描，因为查询中使用了 customer_level 字段进行条件过滤，并且没有合适的索引可用。

第二个阶段是对 orders 表的索引扫描，使用了 customer_id 字段作为索引，然后根据条件 total_price > 100 进行筛选。

这两个阶段都使用了 Using where，表示在检索阶段使用了 WHERE 条件过滤。

# chat

## Q: 详细介绍一下 mysql 的 explain

MySQL 的 EXPLAIN 是一个查询分析工具，用于分析查询语句的执行计划。通过执行 EXPLAIN 命令，可以获取 MySQL 查询优化器对于给定查询的执行计划。执行计划包括了查询的各个阶段以及相应的优化信息，这些信息有助于开发人员理解查询的执行过程，并且可以帮助优化查询性能。

下面是一个典型的 EXPLAIN 输出的例子：

```
mysql> EXPLAIN SELECT * FROM users WHERE age > 25;
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra       |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
| 1  | SIMPLE      | users | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 5    | 100.00   | Using where |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
```

这里是一些关键字段的含义：

- **id**: 查询中表执行的顺序编号，1 表示该查询中的第一张表，2 表示第二张表，以此类推。
- **select_type**: 查询类型，常见的有 SIMPLE、PRIMARY、SUBQUERY 等。
- **table**: 正在访问的表名。
- **partitions**: 表分区信息。
- **type**: 访问表的方式，常见的有 const、eq_ref、ref、range、index、all 等。
- **possible_keys**: 可能使用的索引。
- **key**: 实际使用的索引。
- **key_len**: 使用的索引的长度。
- **ref**: 显示索引的哪一列被使用，通常是与索引列相等的列。
- **rows**: 估计需要检索的行数。
- **filtered**: 表示此查询的行过滤率，即返回结果集的行数与访问到的行数的比值。
- **Extra**: 额外的信息，如是否使用了索引、使用了哪种算法等。

通过分析 EXPLAIN 的输出，可以确定查询中是否使用了索引，以及索引的效率等。

这对于调优查询性能非常重要。

例如，如果某个查询中没有使用索引，可能需要添加索引来提高查询速度；如果使用了不合适的索引，可能需要优化索引设计或者重新写查询语句。

## Q: explain 一定是一条结果吗？

MySQL 的 EXPLAIN 命令的结果可以是一条记录，也可以是多条记录，这取决于查询的复杂性和涉及的表数量。

1. **单条记录**：对于简单的查询，只涉及单个表，EXPLAIN 的结果通常是一条记录。这种情况下，查询中只有一个表参与，并且查询的执行计划也只有一个阶段，因此只会有一条记录。

2. **多条记录**：对于复杂的查询，涉及多个表、联合查询、子查询或者使用了多个连接类型的查询，EXPLAIN 的结果可能是多条记录。每个记录代表查询中的一个阶段或子查询，因此可能会有多条记录来展示整个查询的执行计划。

无论结果是一条记录还是多条记录，都可以通过分析 EXPLAIN 的输出来理解查询的执行计划，以便进行性能优化。




# id

select查询的序列号，包含一组数字，表示查询中执行select子句或操作表的顺序 
三种情况： 

## 1、id相同

执行顺序由上至下 

## 2、id不同

如果是子查询，id的序号会递增，id值越大优先级越高，越先被执行 

## 3、id相同又不同（两种情况同时存在）

id如果相同，可以认为是一组，从上往下顺序执行；在所有组中，id值越大，优先级越高，越先执行 

# select_type

查询的类型，主要是用于区分普通查询、联合查询、子查询等复杂的查询

1、SIMPLE：简单的select查询，查询中不包含子查询或者union

2、PRIMARY：查询中包含任何复杂的子部分，最外层查询则被标记为primary

3、SUBQUERY：在select或 where列表中包含了子查询 

4、DERIVED：在from列表中包含的子查询被标记为derived（衍生），mysql或递归执行这些子查询，把结果放在零时表里

5、UNION：若第二个select出现在union之后，则被标记为union；若union包含在from子句的子查询中，外层select将被标记为derived

6、UNION RESULT：从union表获取结果的select 

# type

访问类型，sql查询优化中一个很重要的指标。

## 排序

结果值从好到坏依次是：

```
system > const > eq_ref > ref > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > range > index > ALL
```

一般来说，好的sql查询至少达到range级别，最好能达到ref

## 详细说明

1、system：表只有一行记录（等于系统表），这是const类型的特例，平时不会出现，可以忽略不计

2、const：表示通过索引一次就找到了，const用于比较primary key 或者 unique索引。因为只需匹配一行数据，所有很快。如果将主键置于where列表中，mysql就能将该查询转换为一个const 

3、eq_ref：唯一性索引扫描，对于每个索引键，表中只有一条记录与之匹配。常见于主键 或 唯一索引扫描。 

4、ref：非唯一性索引扫描，返回匹配某个单独值的所有行。本质是也是一种索引访问，它返回所有匹配某个单独值的行，然而他可能会找到多个符合条件的行，所以它应该属于查找和扫描的混合体

5、range：只检索给定范围的行，使用一个索引来选择行。key列显示使用了那个索引。一般就是在where语句中出现了bettween、<、>、in等的查询。这种索引列上的范围扫描比全索引扫描要好。只需要开始于某个点，结束于另一个点，不用扫描全部索引 

6、index：Full Index Scan，index与ALL区别为index类型只遍历索引树。这通常为ALL块，应为索引文件通常比数据文件小。（Index与ALL虽然都是读全表，但index是从索引中读取，而ALL是从硬盘读取） 

7、ALL：Full Table Scan，遍历全表以找到匹配的行 

# possible_keys

查询涉及到的字段上存在索引，则该索引将被列出，但不一定被查询实际使用

# key

实际使用的索引，如果为NULL，则没有使用索引。 

查询中如果使用了覆盖索引，则该索引仅出现在key列表中。 

# key_len

表示索引中使用的字节数，查询中使用的索引的长度（最大可能长度），并非实际使用长度，理论上长度越短越好。key_len是根据表定义计算而得的，不是通过表内检索出的

# ref

显示索引的那一列被使用了，如果可能，是一个常量const。

# rows

根据表统计信息及索引选用情况，大致估算出找到所需的记录所需要读取的行数

# Extra

不适合在其他字段中显示，但是十分重要的额外信息

## 1、Using filesort

mysql对数据使用一个外部的索引排序，而不是按照表内的索引进行排序读取。也就是说mysql无法利用索引完成的排序操作成为“文件排序” 


由于索引是先按email排序、再按address排序，所以查询时如果直接按address排序，索引就不能满足要求了，mysql内部必须再实现一次“文件排序”

## 2、Using temporary： 
使用临时表保存中间结果，也就是说mysql在对查询结果排序时使用了临时表，常见于order by 和 group by 

## 3、Using index：

表示相应的select操作中使用了覆盖索引（Covering Index），避免了访问表的数据行，效率高 
如果同时出现Using where，表明索引被用来执行索引键值的查找（参考上图） 
如果没用同时出现Using where，表明索引用来读取数据而非执行查找动作 

- 覆盖索引

覆盖索引（Covering Index）：也叫索引覆盖。

就是select列表中的字段，只用从索引中就能获取，不必根据索引再次读取数据文件，换句话说查询列要被所建的索引覆盖。

注意： 

a、如需使用覆盖索引，select列表中的字段只取出需要的列，不要使用select * 

b、如果将所有字段都建索引会导致索引文件过大，反而降低crud性能

## 4、Using where ： 

使用了where过滤

## 5、Using join buffer ： 

使用了链接缓存

## 6、Impossible WHERE： 

where子句的值总是false，不能用来获取任何元祖 

## 7、select tables optimized away： 

在没有group by子句的情况下，基于索引优化MIN/MAX操作或者对于MyISAM存储引擎优化COUNT（*）操作，不必等到执行阶段在进行计算，查询执行计划生成的阶段即可完成优化

## 8、distinct：

优化distinct操作，在找到第一个匹配的元祖后即停止找同样值得动作

# chatGPT 的学习笔记

## mysql explain 中 select_type 有哪几种，详细解释一下

在MySQL的`EXPLAIN`语句中，`select_type`字段用于描述查询的类型。下面是可能的`select_type`值及其含义的详细解释：

1. `SIMPLE`: 这是最简单的查询类型，不包含任何子查询或联接。查询中的每个表都只有一个行集，并且没有使用`UNION`操作符。

2. `PRIMARY`: 这表示查询是外部查询中的第一个子查询。通常，外部查询中的每个子查询都会被标记为`PRIMARY`。

3. `SUBQUERY`: 这是在外部查询中的子查询。对于每个子查询，MySQL会执行该子查询并将结果传递给外部查询。

4. `DERIVED`: 这表示在`FROM`子句中的子查询，通常在执行时会创建临时表。这些临时表是基于子查询的结果构建的。

5. `UNCACHEABLE SUBQUERY`: 这是MySQL无法缓存结果的子查询类型。这可能是由于使用了不支持缓存的操作，如`RAND()`函数。

6. `UNION`: 这表示结果是通过使用`UNION`操作符组合两个或多个`SELECT`语句的结果得到的。

7. `DEPENDENT UNION`: 这是`UNION`的一种特殊情况，其中第二个或后续的`SELECT`语句依赖于前面的`SELECT`语句。换句话说，后续的`SELECT`语句可能会使用前面`SELECT`语句的结果作为输入。

8. `UNION RESULT`: 这表示使用`UNION`操作符生成的结果集。

9. `SUBQUERY FOR UPDATE`: 这是带有`FOR UPDATE`子句的子查询，用于在查询期间锁定所选行。

10. `VALUES`: 这表示通过`VALUES`子句创建的虚拟表。`VALUES`子句用于一次性指定多个值。

以上是常见的`select_type`值，但具体使用哪种类型取决于查询的结构和特性。通过观察`EXPLAIN`的输出并理解每个查询类型的含义，可以更好地了解查询的执行方式和性能。

## mysql explain 中 type 有哪几种，详细解释下

在MySQL的`EXPLAIN`语句中，`type`字段用于描述查询使用的访问方法。下面是可能的`type`值及其含义的详细解释：

1. `const`: 当查询使用常量条件（例如主键或唯一索引的等值比较）进行匹配时，使用`const`访问方法。此方法在查询期间只读取一行数据。

2. `eq_ref`: 当查询使用等值连接访问唯一索引时，使用`eq_ref`访问方法。它通常用于连接操作，其中查询只返回一行结果。

3. `ref`: 当查询使用非唯一索引进行匹配时，使用`ref`访问方法。这种方法通常涉及到使用索引的部分前缀或搜索一个范围内的值。

4. `range`: 当查询使用索引来返回一个范围内的行时，使用`range`访问方法。这种方法常用于在一个范围内进行比较操作，例如`BETWEEN`、`>、<、IN`等。

5. `index`: 当查询通过扫描整个索引来匹配行时，使用`index`访问方法。这种方法通常比全表扫描更有效，但仍需要扫描整个索引。

6. `all`: 当查询需要扫描整个表时，使用`all`访问方法。这是最不优化的方法，应尽量避免。

7. `fulltext`: 当查询使用全文索引进行全文搜索时，使用`fulltext`访问方法。

8. `unique_subquery`: 当查询使用子查询进行唯一索引查找时，使用`unique_subquery`访问方法。

9. `index_subquery`: 当查询使用子查询进行非唯一索引查找时，使用`index_subquery`访问方法。

10. `range_check`: 当查询在索引中进行范围检查时，使用`range_check`访问方法。

11. `const_rowid_scan`: 当查询通过常量条件进行唯一索引行扫描时，使用`const_rowid_scan`访问方法。

12. `batched`: 当查询使用批处理方法进行访问时，使用`batched`访问方法。

以上是常见的`type`值，但具体使用哪种访问方法取决于查询的结构、索引和表的大小。通过观察`EXPLAIN`的输出并理解每种访问方法的含义，可以更好地了解查询的执行方式和性能。


## 详细解释下 mysql explain 中 possible_keys 和 key

在MySQL的`EXPLAIN`语句中，`possible_keys`和`key`字段提供了关于查询中可能使用的索引和实际使用的索引的信息。以下是对这两个字段的详细解释：

1. `possible_keys`（可能的索引）：这个字段列出了查询中可能使用的索引的名称。MySQL会根据查询条件和表结构来确定可能的索引。每个可能的索引都是一个潜在的选择，用于加速查询。在这个字段中，可能会出现多个索引的名称，它们之间以逗号分隔。

2. `key`（实际使用的索引）：这个字段表示查询实际使用的索引的名称。在执行查询时，MySQL会选择其中一个可能的索引来优化查询。`key`字段显示的是实际被选择的索引的名称。通常，如果`key`字段的值为`NULL`，则表示查询没有使用任何索引，这可能会导致较慢的查询性能。

理解这两个字段可以帮助我们评估查询的性能和索引的有效性。在`possible_keys`中列出的索引是可能的选择，我们可以根据查询的特点和索引的覆盖程度来选择最佳的索引。而`key`字段显示的是实际使用的索引，我们可以通过观察实际使用的索引来确定查询是否能够充分利用索引，或者是否需要优化查询或索引设计。

通过结合`possible_keys`和`key`字段，我们可以判断查询是否使用了适当的索引，以及是否需要对查询或索引进行进一步的优化。

## 详细解释下 mysql explain 中 ref

在MySQL的`EXPLAIN`语句中，`ref`字段提供了关于查询中使用的索引之间的引用关系的信息。它指示了连接操作中的索引使用情况。下面是对`ref`字段的详细解释：

`ref`表示引用（Reference）列。它显示了连接操作中使用的索引之间的关系。以下是`ref`字段可能的取值和对应的解释：

1. `<const>`: 当查询使用常量值进行连接时，例如使用常量与唯一索引进行等值比较时，`ref`列可能显示为`<const>`。

2. `<column>`: 当查询使用列值进行连接时，例如使用列与索引进行等值比较时，`ref`列可能显示为具体的列名。

3. `NULL`: 当查询不使用索引进行连接操作时，`ref`列可能显示为`NULL`。这通常是因为查询中的连接操作没有使用索引，而是进行全表扫描。

4. `func`: 当查询中使用函数进行连接操作时，`ref`列可能显示为`func`。这意味着查询使用了函数来处理连接条件，而不是直接使用索引。

`ref`字段提供了连接操作中使用的索引和条件之间的关系。

它可以帮助我们理解查询是如何执行连接操作的，并确定索引的有效性。

如果`ref`列显示为`<const>`或具体的列名，表示查询使用了索引进行连接操作，这通常是较为有效的。

然而，如果`ref`列显示为`NULL`，**表示连接操作没有使用索引，可能需要重新考虑查询或索引的设计**。

通过观察`ref`字段，我们可以评估连接操作中的索引使用情况，确定查询的效率，并可能推断是否需要对查询或索引进行优化。

## 详细解释下 mysql explain 中 rows 和 filtered

在MySQL的`EXPLAIN`语句中，`rows`和`filtered`是提供了关于查询执行计划中估计的行数和过滤比例的信息。下面是对这两个字段的详细解释：

1. `rows`（行数估计）：这个字段表示MySQL执行查询时估计的返回行数。它指示了执行计划中每个步骤或操作可能涉及的行数。较小的行数通常表示较高的查询效率。然而，这只是一个估计值，实际返回的行数可能与该估计值有所偏差。

2. `filtered`（过滤比例）：这个字段表示在执行计划中的每个步骤中，通过索引条件或其他过滤条件过滤出的行数占原始行数的比例。它的值在0到1之间，其中1表示所有行都通过了过滤条件，0表示没有行通过了过滤条件。较高的过滤比例通常表示查询条件较为严格且索引的使用较为有效。

这两个字段提供了有关查询执行计划的重要信息。

`rows`字段可以用于**估计查询的性能和资源消耗，较小的值通常表示更好的性能**。

然而，实际的行数可能受到多种因素的影响，如表统计信息的准确性、查询时的并发等。因此，`rows`仅供参考，并不是绝对准确的。

`filtered`字段可以帮助我们了解查询条件的严格程度和索引的效果。

较高的过滤比例表示查询条件能够有效地过滤出所需的行数，这通常是良好的查询性能的指标。如果过滤比例较低，可能需要考虑是否可以改进查询条件或索引设计。

通过结合`rows`和`filtered`字段，我们可以获得关于查询执行计划的更多信息，并根据这些信息进行性能分析和优化决策。

### 我们可以怎么理解filtered的值呢？从filtered的值中得出什么结论呢？到底是100更好还是18更好？

首先，这里的filtered表示通过查询条件获取的最终记录行数占通过type字段指明的搜索方式搜索出来的记录行数的百分比。

以上图的第一条语句为例，MySQL首先使用索引（这里的type是range）扫描表a，预计会得到174条记录，也就是rows列展示的记录数。

接下来MySql会使用额外的查询条件对这174行记录做二次过滤，最终得到符合查询语句的32条记录，也就是174条记录的18%。而18%就是filtered的值。

更完美的情况下，应该是使用某个索引，直接搜索出32条记录并且过滤掉另外82%的记录。

因此一个比较低filtered值表示需要有一个更好的索引，假如type=all，表示以全表扫描的方式得到1000条记录，且filtered=0.1%，表示只有1条记录是符合搜索条件的。

此时如果加一个索引可以直接搜出来1条数据，那么filtered就可以提升到100%。

由此可见，filtered=100%确实是要比18%要好。

当然，filtered不是万能的，关注执行计划结果中其他列的值并优化查询更重要。

比如为了避免出现filesort（使用可以满足order by的索引），即使filtered的值比较低也没问题。

再比如上面filtered=0.1%的场景，我们更应该关注的是添加一个索引提高查询性能，而不是看filtered的值。

## 详细解释下 mysql explain 中的 extra

在MySQL的`EXPLAIN`语句中，`extra`字段提供了有关查询执行计划中附加信息的详细解释。下面是对`extra`字段可能的取值和对应的解释：

1. `Using index`：表示查询使用了覆盖索引，即查询的结果可以直接从索引中获取，而无需访问表的实际行数据。这可以提高查询的性能。

2. `Using where`：表示在执行查询时使用了WHERE子句中的条件进行过滤。

3. `Using temporary`：表示在查询过程中使用了临时表。这可能是由于查询涉及到排序操作、GROUP BY操作或子查询等复杂情况。

4. `Using filesort`：表示查询中涉及到了文件排序操作，即MySQL需要对结果进行额外的排序操作。

5. `Using join buffer`：表示在连接操作中使用了连接缓冲区。

6. `Impossible WHERE`：表示查询的WHERE条件包含了不可能满足的条件，导致查询不会返回任何结果。

7. `Select tables optimized away`：表示查询中的某些表可以通过优化直接省略，因为它们不会对结果产生影响。

8. `Distinct`：表示查询使用了DISTINCT关键字，以消除结果中的重复行。

9. `Full scan on NULL key`：表示查询中使用了NULL值进行全表扫描。

10. `Range checked for each record`：表示在执行索引范围扫描时，对每个记录进行了范围检查。

11. `Using index condition`：表示查询使用了索引条件推送优化，即将条件应用于索引本身而不是从表中过滤行。

12. `Using index for group-by`：表示查询使用了索引来进行GROUP BY操作的分组。

这些是`extra`字段的一些常见取值，但具体使用哪些取值取决于查询的结构和操作。通过观察`extra`字段，我们可以获得更多关于查询执行计划的信息，帮助我们评估查询的性能和优化潜力。

### 解释下 Using filesort

在MySQL的`EXPLAIN`语句中，`Using filesort`是`extra`字段中的一个标识，表示查询中使用了文件排序操作。

当查询涉及到排序操作但无法使用索引进行排序时，MySQL需要创建临时文件来执行排序。

这种情况下，`Using filesort`会出现在`extra`字段中。文件排序是一种在磁盘上创建和使用临时文件进行排序的操作。

文件排序通常发生在以下情况下：

1. `ORDER BY`子句：如果查询包含`ORDER BY`子句，而排序字段无法使用索引或不符合已存在的索引顺序，MySQL就会使用文件排序。

2. `GROUP BY`操作：当查询包含`GROUP BY`操作时，MySQL可能需要对结果进行排序以分组。

3. 连接操作（JOIN）：如果查询中涉及到连接操作，并且连接条件无法使用索引，MySQL可能需要对结果进行排序以匹配连接条件。

文件排序的性能可能较慢，因为涉及到磁盘的读写操作。相比于使用索引进行排序，使用文件排序可能会导致较高的磁盘 I/O 开销和更长的查询执行时间。因此，尽可能避免使用文件排序可以提高查询性能。

为了优化查询并避免文件排序，可以考虑以下方法：

1. 确保排序字段上存在合适的索引，以便MySQL可以直接使用索引进行排序。

2. 考虑调整查询的逻辑或使用更合适的索引，以避免不必要的排序操作。

3. 调整查询的`ORDER BY`子句或`GROUP BY`子句的顺序，以与已存在的索引一致。

4. 考虑适当调整服务器的配置参数，如`sort_buffer_size`，以增加排序操作的内存缓冲区大小，减少对磁盘的读写操作。

总之，当MySQL在查询执行过程中使用文件排序时，`Using filesort`会出现在`extra`字段中。这提示我们需要关注查询中涉及的排序操作，并根据需要优化查询或调整服务器配置来提高性能。

# mysql explain 实战笔记

## 背景

看起来查询很快，但是实际比较慢的情况。

## 建表语句

```sql
drop table if exists test_perf;
create table test_perf
(
    id int unsigned auto_increment comment '主键' primary key,
    status varchar(2) not null default '' comment '状态',
    batch_id varchar(32) comment '处理批次',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '性能测试表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
create index ix_create_time on test_perf (`create_time`) comment '创建时间索引';
create index ix_status on test_perf (`status`) comment '状态索引';
```

然后插入 100W 条 status='S'，2000 条 status='P' 的测试数据。

## 执行测试脚本

```sql
update test_perf T set T.batch_id = 'P001', T.update_time=now() 
where id in (SELECT t.id from (SELECT id from test_perf where status = 'P' order by create_time DESC limit 100) t);
```

发现需要近 2S 为什么呢？

## 查看执行计划

```sql
EXPLAIN update test_perf T set T.batch_id = 'P001', T.update_time=now() where id in (SELECT t.id from (SELECT id from test_perf where status = 'P' order by create_time DESC limit 100) t);
```

如下：

```
+----+--------------------+------------+------------+----------------+---------------+-------------+---------+-------+---------+----------+---------------------------------------+
| id | select_type        | table      | partitions | type           | possible_keys | key         | key_len | ref   | rows    | filtered | Extra                                 |
+----+--------------------+------------+------------+----------------+---------------+-------------+---------+-------+---------+----------+---------------------------------------+
|  1 | UPDATE             | T          | NULL       | index          | NULL          | PRIMARY     | 4       | NULL  | 1003565 |   100.00 | Using where                           |
|  2 | DEPENDENT SUBQUERY | <derived3> | NULL       | index_subquery | <auto_key0>   | <auto_key0> | 4       | func  |      10 |   100.00 | Using index                           |
|  3 | DERIVED            | test_perf  | NULL       | ref            | ix_status     | ix_status   | 10      | const |    2000 |   100.00 | Using index condition; Using filesort |
+----+--------------------+------------+------------+----------------+---------------+-------------+---------+-------+---------+----------+---------------------------------------+
```

### v2. 简化脚本

```sql
update test_perf T set T.batch_id = 'P001', T.update_time=now() 
where id in (SELECT id from test_perf where status = 'P' order by create_time DESC limit 100 );
```

### chatGPT 的分析

根据提供的执行计划，可以看到以下信息：

1. 第一个查询（id=1）是一个UPDATE语句，更新了表test_perf的记录。
   - `type`是`index`，表示使用了索引进行查找。
   - `possible_keys`列显示为NULL，表示没有特定的索引可用。
   - `key`是`PRIMARY`，表示使用了主键索引。
   - `rows`是1003565，表示在更新之前，MySQL估计需要扫描并检查的行数。
   - `filtered`是100.00，表示在执行计划中的过滤比例为100%，即所有行都通过了过滤条件。
   - `Extra`列显示为`Using where`，表示使用了WHERE子句中的条件进行过滤。

2. 第二个查询（id=2）是一个依赖子查询。
   - `type`是`index_subquery`，表示使用了索引子查询。
   - `possible_keys`和`key`都显示为`<auto_key0>`，表示使用了自动生成的索引。
   - `rows`是10，表示在子查询中估计返回的行数。
   - `filtered`是100.00，表示在子查询中的过滤比例为100%，即所有行都通过了过滤条件。
   - `Extra`列显示为`Using index`，表示查询使用了索引。

3. 第三个查询（id=3）是一个派生表查询。
   - `type`是`ref`，表示使用了基于索引的范围扫描。
   - `possible_keys`和`key`都显示为`ix_status`，表示使用了`ix_status`索引。
   - `rows`是2000，表示在派生表查询中估计返回的行数。
   - `filtered`是100.00，表示在派生表查询中的过滤比例为100%，即所有行都通过了过滤条件。
   - `Extra`列显示为`Using index condition; Using filesort`，表示查询使用了索引条件推送优化，但仍然需要文件排序操作。

基于提供的执行计划，可以注意到以下几点：

1. 更新操作涉及大量的行（1003565行），这可能会导致较长的执行时间。如果只需更新前100行，可以考虑优化查询，限制更新的行数。

2. 第三个查询中的派生表查询使用了索引条件推送优化，但仍需要进行文件排序操作。文件排序可能会对性能产生负面影响。考虑调整查询或索引设计，以避免文件排序的使用。

综上所述，建议您尝试以下优化措施：

- 考虑限制更新的行数，以避免不必要地更新大量行。
- 确保索引的选择和设计是最优的，特别是涉及到WHERE子句和排序的字段。
- 调整查询以减少或避免派生表查询，以及文件排序的使用。

请注意，根据提供的执行计划，目前只能提供基于信息的分析和建议。

要进行更深入的性能分析，我建议您考虑以下步骤：

1. 数据量评估：评估表`test_perf`中的数据量，特别是包含`status = 'P'`条件的行数。如果数据量非常大，可能需要考虑其他优化策略，如分区表或数据分片。

2. 确认索引使用：确保表上的索引是合理且适当的。检查已经创建的索引是否覆盖了查询的所有条件，并且能够支持排序操作。确保索引的统计信息是最新的，以便MySQL优化器可以进行正确的查询计划选择。

3. 优化子查询：子查询可能会导致性能问题，特别是在使用了大量数据的情况下。考虑优化子查询的逻辑，可能使用JOIN操作或其他优化策略来替代子查询。

4. 文件排序优化：由于第三个查询中涉及到了文件排序操作，可以考虑以下几点来优化文件排序：
   - 调整服务器的排序缓冲区大小（`sort_buffer_size`参数），以提供更多的内存用于排序操作。
   - 确保排序字段上存在适当的索引，这样MySQL可以使用索引进行排序而不是执行文件排序。
   - 尽量减少需要进行排序的数据量，通过优化查询或使用LIMIT子句限制结果集的大小。

5. 监测和调整：使用MySQL的性能分析工具（如慢查询日志、性能模式等）来监测查询性能，并根据性能瓶颈做出相应调整。可能需要调整服务器配置参数、调整硬件资源或优化查询语句的结构。

请注意，优化SQL查询的过程是一个逐步调试和测试的过程。建议您根据实际情况逐步应用这些优化策略，并通过性能测试来评估每个步骤的效果。

### test_perf 共计 1000000 条，其中 status='P' 的为2000条。

感谢提供的数据量信息。

根据您提供的信息，表`test_perf`总共有1000000条记录，其中`status`为'P'的记录有2000条。

在这种情况下，我会基于之前的分析提供以下建议来优化执行缓慢的更新查询：

1. 更新行数限制：考虑限制更新的行数，特别是在一个大表中执行更新操作时。根据您的数据量，可以尝试使用`LIMIT`子句来限制更新的行数，例如仅更新前100行。这将减少操作的影响范围，提高执行效率。

2. 索引优化：确保`status`字段上的索引`ix_status`是存在并可用的。此外，还可以考虑在`create_time`字段上创建一个组合索引，以优化涉及`ORDER BY`子句的查询。

   示例建议：`CREATE INDEX ix_status_create_time ON test_perf (status, create_time);`

3. 子查询优化：考虑使用`JOIN`操作替代子查询。将子查询的结果作为一个临时表，并与主查询进行连接，可能会提高查询的性能。

4. 文件排序优化：根据之前的分析，文件排序对查询性能有一定影响。您可以尝试优化文件排序操作，例如适当增加`sort_buffer_size`参数的值，以提供更多的内存用于排序操作。

请注意，这些是一些建议和常见的优化策略。实际效果可能因数据分布、硬件配置等因素而有所不同。建议您在生产环境中谨慎测试和评估每个优化步骤的效果，并进行适当的性能监测和调整。

### 子查询中SQL不是已经 limit 100 了吗？应该只会返回前100条才对，为什么还会 update rows 还是 1000000 条？

非常抱歉，我对之前的回答有误解。

您提供的查询确实使用了子查询并限制了结果集的大小。

根据您的查询，子查询部分为：

```sql
SELECT t.id
FROM (
    SELECT id
    FROM test_perf
    WHERE status = 'P'
    ORDER BY create_time DESC
    LIMIT 100
) t
```

在这种情况下，子查询确实只返回了前100行符合条件的记录。

然而，在执行UPDATE语句时，外部查询是基于主查询表`test_perf`的完整行集进行的。

因此，主查询仍然需要扫描整个表`test_perf`，并对符合条件的行进行更新操作。

执行计划中的`rows`列显示为1003565，这是估计在执行UPDATE操作之前，MySQL预计需要扫描并检查的行数。这是基于整个表的估计值，并不受子查询的限制所影响。

**对于性能优化的角度来说，限制子查询的结果集大小是有帮助的，可以减少子查询的开销和排序操作。但是，对于主查询来说，它仍然需要遍历整个表来找到符合条件的行，并进行更新操作。**

再次对之前的误解表示歉意，并感谢您的指正。如果还有其他问题或需要进一步帮助，请随时提问。

## 如果只返回100条，为什么还会执行的比较慢呢？

如果只返回100条记录，但查询仍然执行缓慢，可能有以下几个原因：

1. 索引问题：子查询中的`WHERE`条件和`ORDER BY`子句可能涉及到没有适当索引的列。请确保`status`和`create_time`列上都有适当的索引，以支持子查询的快速执行。

2. 服务器资源问题：如果查询负载较重，或者服务器资源有限，可能会导致查询执行缓慢。检查服务器的CPU、内存和磁盘使用情况，确保足够的资源可用。

3. 查询优化问题：MySQL查询优化器可能没有选择最优的查询计划。您可以尝试使用`FORCE INDEX`提示强制使用特定的索引，或者重新编写查询语句，使用不同的查询结构或连接方式，以获得更好的性能。

4. 锁竞争：如果在执行更新操作的同时，其他会话正在修改或访问相同的表，可能会导致锁竞争，进而影响查询性能。检查是否存在其他并发操作或长时间的事务，尝试调整事务隔离级别或锁定策略来解决锁竞争问题。

5. 硬件或网络问题：网络延迟、磁盘I/O速度慢或其他硬件问题可能会导致查询执行缓慢。确保服务器的硬件设备正常运行，并检查网络连接是否稳定。

在确定性能问题的具体原因时，您可以使用MySQL的性能分析工具（如慢查询日志、性能模式等）来获取更详细的执行统计信息，以帮助定位瓶颈所在。根据具体情况，可能需要结合调整查询、优化索引、增加硬件资源等多个方面来解决性能问题。

## 把我给你的子查询 SQL 修改为 join 

当将子查询改写为连接操作时，可以尝试以下修改：

```sql
UPDATE test_perf T
JOIN (
    SELECT id
    FROM test_perf
    WHERE status = 'P'
    ORDER BY create_time DESC
    LIMIT 100
) AS subquery ON T.id = subquery.id
SET T.batch_id = 'P001', T.update_time = NOW();
```

在这个修改后的查询中，子查询被改写为一个内连接操作，将子查询的结果作为一个临时表，并将其与主查询中的表进行连接。这样可以避免使用子查询和文件排序操作，从而提高查询性能。

请注意，改写查询可能会对性能产生不同的影响，具体结果取决于数据分布、索引结构和其他环境因素。建议您在生产环境中进行适当的测试和评估，以确定最适合您场景的查询优化方案。

## join 确实比我原来的子查询快了很多倍，为什么？

当将子查询改写为连接操作时，可能会获得更好的性能，这是由于以下原因：

1. 减少查询次数：使用子查询时，需要执行两个单独的查询操作，首先执行子查询获取满足条件的ID列表，然后再执行更新操作。而使用连接操作时，可以在单个查询中完成连接和更新操作，减少了查询次数，减轻了数据库的负担。

2. 优化查询计划：优化器在处理连接操作时可以更好地选择最优的查询计划。通过连接操作，优化器可以考虑使用合适的索引、连接顺序和连接类型，以获得更高效的查询执行计划。

3. 避免文件排序：在原始的子查询中，涉及到`ORDER BY`子句，可能需要执行文件排序操作。而在连接操作中，由于没有子查询和排序操作，可以避免文件排序，从而提高查询性能。

4. 利用索引优化：连接操作通常能够更好地利用已经创建的索引。通过连接表时，可以使用合适的索引来加速数据的访问和匹配，从而提高查询性能。

综上所述，通过将子查询改写为连接操作，可以减少查询次数、优化查询计划、避免文件排序，并更好地利用索引优化，从而获得更好的查询性能。

请注意，查询性能的具体提升取决于数据量、索引结构、硬件配置等多个因素。建议您在实际环境中进行测试和评估，并根据需要进行适当的索引优化和查询调整。

## 分析一下 join 的执行计划

```SQL
EXPLAIN 
UPDATE test_perf T
JOIN (
    SELECT id
    FROM test_perf
    WHERE status = 'P'
    ORDER BY create_time DESC
    LIMIT 100
) AS subquery ON T.id = subquery.id
SET T.batch_id = 'P001', T.update_time = NOW();
```

如下：

```
+----+-------------+------------+------------+--------+---------------+-----------+---------+-------------+------+----------+-----------------------------+
| id | select_type | table      | partitions | type   | possible_keys | key       | key_len | ref         | rows | filtered | Extra                       |
+----+-------------+------------+------------+--------+---------------+-----------+---------+-------------+------+----------+-----------------------------+
|  1 | PRIMARY     | <derived2> | NULL       | ALL    | NULL          | NULL      | NULL    | NULL        |  100 |   100.00 | NULL                        |
|  1 | UPDATE      | T          | NULL       | eq_ref | PRIMARY       | PRIMARY   | 4       | subquery.id |    1 |   100.00 | NULL                        |
|  2 | DERIVED     | test_perf  | NULL       | ref    | ix_status     | ix_status | 10      | const       | 2000 |   100.00 | Using where; Using filesort |
+----+-------------+------------+------------+--------+---------------+-----------+---------+-------------+------+----------+-----------------------------+
3 rows in set (0.00 sec)
```

# 参考资料

[MySQL高级 之 explain执行计划详解](https://blog.csdn.net/wuseyukui/article/details/71512793?utm_source=blogxgwz7)

* any list
{:toc}