---
layout: post
title: 数据库索引-08-MySQL Index Tips
date:  2019-1-2 10:17:00 +0800
categories: [SQL]
tags: [sql, mysql, best-practice, index, sh]
published: true
excerpt: MySQL 联合索引，索引覆盖，filesort 排序算法，及索引命中分析及其原理解释。
---

# 联合索引

## 官方概念

MySQL可以创建复合索引(即多列索引)。一个索引最多可以包含16列。

对于某些数据类型，可以为列的前缀建立索引。

MySQL可以为测试索引中的所有列的查询使用多列索引，或者只测试第一列、前两列、前三列的查询，等等。如果在索引定义中以正确的顺序指定列，则单个复合索引可以加速同一表上的几种查询。

多列索引可以看作是排序的数组，其中的行包含通过连接索引列的值创建的值。

## 简单解释

- 1、需要加索引的字段，要在 where 条件中

- 2、数据量少的字段不需要加索引

- 3、如果 where 条件中是 OR 关系，加索引不起作用

- 4、符合最左原则

### 符合最左原则

Mysql从左到右的使用索引中的字段，一个查询可以只使用索引中的一部份，但只能是最左侧部分。

例如索引是`key index (a,b,c)`, 可以支持 `a | a,b| a,b,c` 3种组合进行查找，但不支持 `b,c` 进行查找，当最左侧字段是常量引用时，索引就十分有效。


## 例子

```sql
select uid, login_time from t_user where login_name=? and passwd=?
```

可以建立(login_name, passwd)的联合索引。

- 提问

```sql
select uid, login_time from t_user where passwd=? and login_name=?
```

能否命中(login_name, passwd)这个联合索引？

回答：可以，最左侧查询需求，并不是指SQL语句的写法必须满足索引的顺序（这是很多朋友的误解）


# 索引覆盖

## 概念

被查询的列，数据能从索引中取得，而不用通过行定位符row-locator再到row上获取，即“被查询列要被所建的索引覆盖”，这能够加速查询速度。

## 实例

举例，登录业务需求：

```sql
select uid, login_time from t_user where login_name=? and passwd=?
```

可以建立(login_name, passwd, login_time)的联合索引，由于login_time已经建立在索引中了，被查询的uid和login_time就不用去row上获取数据了，从而加速查询。

末了多说一句，登录这个业务场景，login_name具备唯一性，建这个单列索引就好。

## 判断标准

使用 explain，可以通过输出的 extra 列来判断，对于一个索引覆盖查询，显示为 using index, MySQL查询优化器在执行查询前会决定是否有索引覆盖查询

## InnoDB

1、覆盖索引查询时除了除了索引本身的包含的列，还可以使用其默认的聚集索引列

2、这跟INNOB的索引结构有关系，主索引是B+树索引存储，也即我们所说的数据行即索引，索引即数据

3、对于INNODB的辅助索引，它的叶子节点存储的是索引值和指向主键索引的位置，然后需要通过主键在查询表的字段值，所以辅助索引存储了主键的值

4、覆盖索引也可以用上INNODB 默认的聚集索引

5、innodb引擎的所有储存了主键ID，事务ID，回滚指针,非主键ID，他的查询就会是非主键ID也可覆盖来取得主键ID

## 覆盖索引优点

1、索引项通常比记录要小，所以MySQL访问更少的数据

2、索引都按值的大小顺序存储，相对于随机访问记录，需要更少的I/O

3、大多数据引擎能更好的缓存索引，比如MyISAM只缓存索引

4、覆盖索引对于InnoDB表尤其有用，因为InnoDB使用聚集索引组织数据，如果二级索引中包含查询所需的数据，就不再需要在聚集索引中查找了

## 测试

- 建表脚本

```sql
CREATE TABLE `order` (
  `order_id` BIGINT(21) unsigned NOT NULL AUTO_INCREMENT COMMENT '订单标识',
  `order_name` CHAR(10) NOT NULL COMMENT '订单名称',
  `order_status` tinyint(3) NOT NULL COMMENT '订单状态',
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '订单更新时间',
  PRIMARY KEY (`order_id`),
  KEY `idx_order_name` (`order_name`),
  KEY `idx_order_name_status` (`order_name`,`order_status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
```

- 测试

有一个组合索引(`order_name`,`order_status`)，对于只需要访问这两列的查询，MySQL 就可以使用索引

```
mysql> EXPLAIN SELECT order_name, order_status FROM `order` \G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: order
         type: index
possible_keys: NULL
          key: idx_order_name_status
      key_len: 31
          ref: NULL
         rows: 1
        Extra: Using index
1 row in set (0.01 sec)
```

- PK

在大多数引擎中，只有当查询语句所访问的列是索引的一部分时，索引才会覆盖。

但是，InnoDB不限于此，InnoDB 的二级索引在叶子节点中存储了 primary key 的值。

order_name 是有所索引的。

```
mysql> EXPLAIN SELECT order_id, order_name FROM `order` WHERE order_name='test'\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: order
         type: ref
possible_keys: idx_order_name,idx_order_name_status
          key: idx_order_name
      key_len: 30
          ref: const
         rows: 1
        Extra: Using where; Using index
1 row in set (0.00 sec)
```

## 使用索引进行排序

MySQL中，有两种方式生成有序结果集：一是使用filesort，二是按索引顺序扫描

利用索引进行排序操作是非常快的，而且可以利用同一索引同时进 行查找和排序操作。

当索引的顺序与ORDER BY中的列顺序相同且所有的列是同一方向(全部升序或者全部降序)时，可以使用索引来排序，
如果查询是连接多个表，仅当ORDER BY中的所有列都是第一个表的列时才会使用索引，其它情况都会使用 filesort。

- 拥有索引的字段

```
mysql> EXPLAIN SELECT order_id FROM `order` ORDER BY order_id\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: order
         type: index
possible_keys: NULL
          key: PRIMARY
      key_len: 8
          ref: NULL
         rows: 1
        Extra: Using index
1 row in set (0.00 sec)
```

- 没有索引的字段

```
mysql> EXPLAIN SELECT last_update FROM `order` ORDER BY last_update\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: order
         type: ALL
possible_keys: NULL
          key: NULL
      key_len: NULL
          ref: NULL
         rows: 1
        Extra: Using filesort
1 row in set (0.00 sec)
```

当MySQL不能使用索引进行排序时，就会利用自己的排序算法(快速排序算法)在内存(sort buffer)中对数据进行排序，如果内存装载不下，它会将磁盘上的数据进行分块，再对各个数据块进行排序，然后将各个块合并成有序的结果集（实际上就是外排序）

# filesort 排序算法

对于 filesort，MySQL 有两种排序算法

## 两遍扫描算法(Two passes)

实现方式是先将须要排序的字段和可以直接定位到相关行数据的指针信息取出，然后在设定的内存（通过参数sort_buffer_size设定）中进行排序，完成排序之后再次通过行指针信息取出所需的Columns

注：该算法是4.1之前采用的算法，它需要两次访问数据，尤其是第二次读取操作会导致大量的随机I/O操作。

另一方面，内存开销较小

## 一次扫描算法(single pass)

该算法一次性将所需的Columns全部取出，在内存中排序后直接将结果输出

注： 从 MySQL 4.1 版本开始使用该算法。

它减少了I/O的次数，效率较高，但是内存开销也较大。

如果我们将并不需要的Columns也取出来，就会极大地浪费排序过程所需要 的内存。

在 MySQL 4.1 之后的版本中，可以通过设置 `max_length_for_sort_data` 参数来控制 MySQL 选择第一种排序算法还是第二种。

当取出的所有大字段总大小大于 max_length_for_sort_data 的设置时，MySQL 就会选择使用第一种排序算法，反之，则会选择第二种。

为了尽可能地提高排序性能，我们自然更希望使用第二种排序算法，所以在 Query 中仅仅取出需要的 Columns 是非常有必要的。

当对连接操作进行排序时，如果ORDER BY仅仅引用第一个表的列，MySQL对该表进行filesort操作，然后进行连接处理，此时，EXPLAIN输出“Using filesort”；否则，MySQL必须将查询的结果集生成一个临时表，在连接完成之后进行filesort操作，此时，EXPLAIN输出 “Using temporary;Using filesort”

# 原理

[SQL中的where条件，在数据库中提取与应用浅析](http://hedengcheng.com/?p=577)

# 性能对比

## 常见查询如下

性能如何？

```sql
select * from order where order_status != 2;

select * from order where order_status = 0 or order_status = 1;

select * from order where order_status IN (0,1);

select * from order where order_status = 0 union select * from order where order_status = 1;
```

[架构师之路-答案](https://mp.weixin.qq.com/s/ZWez27EmVw_u7GzNbvXuYw)

ps: 和我的验证结果感觉不符合。本地 mysql 版本：V5.6.0

## 准备工作

- 添加索引

为了做测试，我们为 `order_status` 添加索引

```sql
ALTER TABLE `order` ADD INDEX `idx_order_status` (`order_status`);
```

- 表结构

```
mysql> desc `order`;
+--------------+---------------------+------+-----+-------------------+-----------------------------+
| Field        | Type                | Null | Key | Default           | Extra                       |
+--------------+---------------------+------+-----+-------------------+-----------------------------+
| order_id     | bigint(21) unsigned | NO   | PRI | NULL              | auto_increment              |
| order_name   | char(10)            | NO   | MUL | NULL              |                             |
| order_status | tinyint(3)          | NO   | MUL | NULL              |                             |
| last_update  | timestamp           | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
+--------------+---------------------+------+-----+-------------------+-----------------------------+
4 rows in set (0.01 sec)
```

## EXPLAIN 查看

### explain 简单解释

1. possible_keys

查询可能使用到的索引都会在这里列出来

2. key

查询真正使用到的索引，select_type 为 index_merge 时，这里可能出现两个以上的索引，其他的 select_type 这里只会出现一个。

### 无索引命中，性能较差。

- !=

```
mysql> EXPLAIN select * from `order` where order_status != 2\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: order
         type: ALL
possible_keys: NULL
          key: NULL
      key_len: NULL
          ref: NULL
         rows: 1
        Extra: Using where
1 row in set (0.01 sec)
```

- or

```
mysql> EXPLAIN select * from `order` where order_status = 0 or order_status = 1\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: order
         type: ALL
possible_keys: idx_order_status
          key: NULL
      key_len: NULL
          ref: NULL
         rows: 1
        Extra: Using where
1 row in set (0.00 sec)
```

- in

```
mysql> EXPLAIN select * from `order` where order_status IN (0,1)\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: order
         type: ALL
possible_keys: idx_order_status
          key: NULL
      key_len: NULL
          ref: NULL
         rows: 1
        Extra: Using where
1 row in set (0.00 sec)
```

### 有索引命中

union 两次单独查询都会命中索引，最后把查询结果放在一起。

```
mysql> EXPLAIN select * from `order` where order_status = 0 union select * from `order` where order_status = 1\G
*************************** 1. row ***************************
           id: 1
  select_type: PRIMARY
        table: order
         type: ref
possible_keys: idx_order_status
          key: idx_order_status
      key_len: 1
          ref: const
         rows: 1
        Extra: NULL
*************************** 2. row ***************************
           id: 2
  select_type: UNION
        table: order
         type: ref
possible_keys: idx_order_status
          key: idx_order_status
      key_len: 1
          ref: const
         rows: 1
        Extra: NULL
*************************** 3. row ***************************
           id: NULL
  select_type: UNION RESULT
        table: <union1,2>
         type: ALL
possible_keys: NULL
          key: NULL
      key_len: NULL
          ref: NULL
         rows: NULL
        Extra: Using temporary
3 rows in set (0.00 sec)
```

# 建立索引的几大原则

1. 最左前缀匹配原则，非常重要的原则，mysql会一直向右匹配直到遇到范围查询(>、<、between、like)就停止匹配，比如a = 1 and b = 2 and c > 3 and d = 4 如果建立(a,b,c,d)顺序的索引，d是用不到索引的，如果建立(a,b,d,c)的索引则都可以用到，a,b,d的顺序可以任意调整。

2. =和in可以乱序，比如a = 1 and b = 2 and c = 3 建立(a,b,c)索引可以任意顺序，mysql的查询优化器会帮你优化成索引可以识别的形式。

3. 尽量选择区分度高的列作为索引，区分度的公式是count(distinct col)/count(*)，表示字段不重复的比例，比例越大我们扫描的记录数越少，唯一键的区分度是1，而一些状态、性别字段可能在大数据面前区分度就是0，那可能有人会问，这个比例有什么经验值吗？使用场景不同，这个值也很难确定，一般需要join的字段我们都要求是0.1以上，即平均1条扫描10条记录。

4. 索引列不能参与计算，保持列“干净”，比如from_unixtime(create_time) = ’2014-05-29’就不能使用到索引，原因很简单，b+树中存的都是数据表中的字段值，但进行检索时，需要把所有元素都应用函数才能比较，显然成本太大。所以语句应该写成create_time = unix_timestamp(’2014-05-29’)。

5. 尽量的扩展索引，不要新建索引。

比如表中已经有a的索引，现在要加(a,b)的索引，那么只需要修改原来的索引即可。

# 慢查询优化基本步骤

- 先运行看看是否真的很慢，注意设置SQL_NO_CACHE

- where条件单表查，锁定最小返回记录表。这句话的意思是把查询语句的where都应用到表中返回的记录数最小的表开始查起，单表每个字段分别查询，看哪个字段的区分度最高

- explain查看执行计划，是否与2预期一致（从锁定记录较少的表开始查询）

- order by limit 形式的sql语句让排序的表优先查

- 了解业务方使用场景

- 加索引时参照建索引的几大原则

- 观察结果，不符合预期继续从0分析

# 拓展阅读

[mysql-index 详解](https://houbb.github.io/2018/07/30/mysql-index)

[执行计划](https://houbb.github.io/2018/07/30/mysql-index#%E6%89%A7%E8%A1%8C%E8%AE%A1%E5%88%92)

# 参考资料

- 联合索引

[multiple-column-indexes](https://dev.mysql.com/doc/refman/8.0/en/multiple-column-indexes.html)

https://www.cnblogs.com/softidea/p/5977860.html

https://segmentfault.com/q/1010000000342176

- 原理解释

[原理解释](http://hedengcheng.com/?p=577)

[index-condition-pushdown](https://mariadb.com/kb/en/library/index-condition-pushdown/)

- 索引覆盖

http://blog.51cto.com/janephp/1311417

https://www.cnblogs.com/chenpingzhao/p/4776981.html

- index

[一分钟了解索引技巧](https://mp.weixin.qq.com/s/4W4iVOZHdMglk0F_Ikao7A)

[MySQL的or/in/union与索引优化](https://mp.weixin.qq.com/s/ZWez27EmVw_u7GzNbvXuYw)

[SQL与索引优化合集](https://mp.weixin.qq.com/s/3xkLTe7r388lRq-SBQllXw)

* any list
{:toc}