---
layout: post
title:  MySQL-14-mysql id int 到了最大值会怎么样？如何解决？
date:  2017-7-17 10:26:01 +0800
categories: [MySQL]
tags: [sp]
published: true
---

# 拓展阅读

[MySQL 00 View](https://houbb.github.io/2017/02/27/mysql-00-view)

[MySQL 01 Ruler mysql 日常开发规范](https://houbb.github.io/2017/02/27/mysql-01-ruler)

[MySQL 02 truncate table 与 delete 清空表的区别和坑](https://houbb.github.io/2017/02/27/mysql-truncate)

[MySQL 03 Expression 1 of ORDER BY clause is not in SELECT list,references column](https://houbb.github.io/2017/02/27/mysql-03-error)

[MySQL 04 EMOJI 表情与 UTF8MB4 的故事](https://houbb.github.io/2017/02/27/mysql-04-emoj-and-utf8mb4)

[MySQL 05 MySQL入门教程（MySQL tutorial book）](https://houbb.github.io/2017/02/27/mysql-05-learn-book)

[MySQL 06 mysql 如何实现类似 oracle 的 merge into](https://houbb.github.io/2017/02/27/mysql-06-merge-into)

[MySQL 07 timeout 超时异常](https://houbb.github.io/2017/02/27/mysql-07-timeout-errors)

[MySQL 08 datetime timestamp 以及如何自动更新，如何实现范围查询](https://houbb.github.io/2017/02/27/mysql-08-datetime-timestamp)

[MySQL 09 MySQL-09-SP mysql 存储过程](https://houbb.github.io/2017/02/27/mysql-09-sp)

[MySQL 09 MySQL-group by 分组](https://houbb.github.io/2017/02/27/mysql-10-groupby)

# Q1: 为什么 mysql 表建议加物理自增主键 id

## 为什么推荐？

因为自增主键是连续的，在插入过程中尽量减少页分裂，即使要进行页分裂，也只会分裂很少一部分；

并且自增主键也能减少数据的移动，每次插入都是插入到最后，所以自增主键作为表的主键，对于表的操作来说性能是最高的。

## 使用UUID为主键可以吗？

优点：

UUID便于分布式数据库并发插入

业务逻辑不依赖于Id生成，如业务需要通过Id关联多条记录，在自增Id条件下记录必须先行插入之后才能获取Id再行关联。

UUID可以线下生成Id并直接关联，不依赖于数据库

缺点：

相对自增主键，使得所有二级索引占据更多空间

数据插入效率较低，新插数据可能在索引的中间位置，为将数据插入合适的位置可能需要额外的IO操作，同时造成索引不连续，影响查询效率




## 索引数据结构的理解

B+ 树为了维护索引有序性，在插入新值的时候需要做必要的维护。如果插入的值比最大值id大，则只需要最后记录后面插入一个新记录。如果新插入的ID值在原先的有序中间，就相对麻烦了，需要逻辑上挪动后面的数据，空出位置。如果所在的数据页已经满了，根据 B+ 树的算法，这时候需要申请一个新的数据页，然后挪动部分数据过去。这个过程称为页分裂。在这种情况下，性能自然会受影响。

除了性能外，页分裂操作还影响数据页的利用率。原本放在一个页的数据，现在分到两个页中，整体空间利用率降低大约 50%。
当然有分裂就有合并。当相邻两个页由于删除了数据，利用率很低之后，会将数据页做合并。合并的过程，可以认为是分裂过程的逆过程。

基于上面的索引维护过程说明，我们来讨论一个案例：

你可能在一些建表规范里面见到过类似的描述，要求建表语句里一定要有自增主键。当然事无绝对，我们来分析一下哪些场景下应该使用自增主键，而哪些场景下不应该。
自增主键是指自增列上定义的主键，在建表语句中一般是这么定义的： NOT NULL PRIMARY KEY AUTO_INCREMENT。
插入新记录的时候可以不指定 ID 的值，系统会获取当前 ID 最大值加 1 作为下一条记录的 ID 值。
也就是说，自增主键的插入数据模式，正符合了递增插入的场景。每次插入一条新记录，都是追加操作，都不涉及到挪动其他记录，也不会触发叶子节点的分裂。
而有业务逻辑的字段做主键，则往往不容易保证有序插入，这样写数据成本相对较高。
除了考虑性能外，我们还可以从存储空间的角度来看。假设你的表中确实有一个唯一字段，比如字符串类型的身份证号，那应该用身份证号做主键，还是用自增字段做主键呢？
由于每个非主键索引的叶子节点上都是主键的值。如果用身份证号做主键，那么每个二级索引的叶子节点占用约 20 个字节，而如果用整型做主键，则只要 4 个字节，如果是长整型（bigint）则是 8 个字节。

显然，主键长度越小，普通索引的叶子节点就越小，普通索引占用的空间也就越小。
所以，从性能和存储空间方面考量，自增主键往往是更合理的选择。
有没有什么场景适合用业务字段直接做主键的呢？还是有的。比

如，有些业务的场景需求是这样的：

只有一个索引；
该索引必须是唯一索引。

由于没有其他索引，所以也就不用考虑其他索引的叶子节点大小的问题。

这时候我们就要优先考虑上一段提到的“尽量使用主键查询”原则，直接将这个索引设置为主键，可以避免每次查询需要搜索两棵树。

主键索引又称聚簇索引，聚簇索引具备惟一性因为聚簇索引是将数据跟索引结构放到一块，所以一个表仅有一个聚簇索引。

InnoDB使用的是聚簇索引，将主键组织到一棵B+树中，而行数据就储存在叶子节点上，若使用"where id = xxx"这样的条件查找主键，则按照B+树的检索算法便可查找到对应的叶节点，以后得到行数据。
若对其他字段列进行条件搜索，则须要两个步骤：第一步在辅助索引B+树中检索其他，到达其叶子节点获取对应的主键。

第二步使用主键在主索引B+树种再执行一次B+树检索操做，最终到达叶子节点便可获取整行数据。（重点在于经过其余键须要创建辅助索引）

聚簇索引的优缺点排序

优势：

数据访问更快，由于聚簇索引将索引和数据保存在同一个B+树中，所以从聚簇索引中获取数据比非聚簇索引更快

聚簇索引对于主键的排序查找和范围查找速度很是快

缺点：

插入速度严重依赖于插入顺序，按照主键的顺序插入是最快的方式，不然将会出现页分裂，严重影响性能。

所以，对于InnoDB表，咱们通常都会定义一个自增的ID列为主键更新主键的代价很高，由于将会致使被更新的行移动。

所以，对于InnoDB表，咱们通常定义主键为不可更新。

二级索引访问须要两次索引查找，第一次找到主键值，第二次根据主键值找到行数据。


# Q2: 如果表没有创建主键，mysql 会如何处理？

隐式主键：

InnoDB会自动帮你创建一个不可见的、长度为6字节的row_id，而且InnoDB维护了一个全局的dictsys.row_id，所有未定义主键的表都会共享该row_id，每次插入一条数据都把全局row_id当成主键id，然后全局row_id加1。

该全局row_id在代码实现上使用的是bigint unsigned类型，但实际上只给row_id保留了6字节，所以这种设计就会存在一个问题：

如果全局row_id一直涨，直到2的48次幂-1时，这个时候再加1，row_id的低48位都会变为0，如果再插入新一行数据时，拿到的row_id就为0，这样的话就存在主键冲突的可能，所以为了避免这种隐患，每个表都需要一个主键。








# Q3: ID 自增主键用完了会怎么样？

## id 作为主键

```sql
DROP TABLE if exists test_id;
CREATE TABLE `test_id` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    `name` varchar(64) NOT NULL COMMENT '名称',
    `create_time` datetime(3) NOT NULL DEFAULT current_timestamp(3) COMMENT '创建时间',
    `update_time` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3) COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测试 id 表';
```

## 测试插入完的场景 

我们插入一条数据：

```sql
insert into test_id (id, name) values (2147483647, 'test');
```

如果我们执行下面的语句会发生什么？

```sql
insert into test_id (name) values ('test2');
```

会报错：

```
mysql> insert into test_id (name) values ('test2');
ERROR 1062 (23000): Duplicate entry '2147483647' for key 'PRIMARY'
```

## 为什么呢？

int 的范围是 2^31-1=2147483647

这里我们也可以验证MySQL的主键策略：

**id自增值达到上限以后，再申请下一个 id 时，仍然是最大值**。

# Q4：如何解决 ID 自增主键的这个问题？

## 设计时解决方法：

①、修改id字段类型，int改为bigint（太占空间了，一个bigint的存储大小为8字节） bigint的大小是8个字节，一个字节8位，有符号的最大值就是2的63次方-1

②、有能力还是分表，有效避免这个问题

③、将int类型设置为无符号的可以扩大一倍

有符号int最大可以支持到约22亿，远远大于我们的需求和MySQL单表所能支持的性能上限。

对于OLTP应用来说，单表的规模一般要保持在千万级别，不会达到22亿上限。

如果要加大预留量，可以把主键改为改为无符号int，上限为42亿，这个预留量已经是非常的充足了。

使用bigint，会占用更大的磁盘和内存空间，内存空间毕竟有限，无效的占用会导致更多的数据换入换出，额外增加了IO的压力，对性能是不利的。

因此推荐自增主键使用int unsigned类型，但不建议使用bigint

## 出问题

产线如果在执行，怎么办？

### 方式一:使用mysql5.6+提供的在线修改功能

所谓的mysql自己提供的功能也就是mysql自己原生的语句，例如我们要修改原字段名称及类型。

```sql
mysql> ALTER TABLE table_name CHANGE old_field_name new_field_name field_type;
```

那么，在mysql5.5这个版本之前，这是通过临时表拷贝的方式实现的。

执行ALTER语句后，会新建一个带有新结构的临时表，将原表数据全部拷贝到临 时表，然后Rename，完成创建操作。这个方式过程中，原表是可读的，不可写。但是会消耗一倍的存储空间。

在5.6+开始，mysql支持在线修改数据库表，在修改表的过程中，对绝大部分操作*，原表可读，也可以写。

那么，对于修改列的数据类型这种操作，原表还能写么？来来来，烟哥特意去官网找了mysql8.0版本的一张图

如图所示，对于修改数据类型这种操作，是不支持并发的DML操作！

也就是说，如果你直接使用ALTER这样的语句在线修改表数据结构，会导致这张表无法进行更新类操作(DELETE、UPDATE、DELETE)。

因此，直接ALTER是不行滴！

那我们只能用方式二或者方式三

### 方式二:借助第三方工具

业内有一些第三方工具可以支持在线修改表结构，使用这些第三发工具，能够让你在执行ALTER操作的时候，表不会阻塞！比较出名的有两个

1、pt-online-schema-change，简称pt-osc
2、GitHub正式宣布以开源的方式发布的工具，名为gh-ost
以pt-osc为例，它的原理如下

1、创建一个新的表，表结构为修改后的数据表，用于从源数据表向新表中导入数据。
2、创建触发器，用于记录从拷贝数据开始之后，对源数据表继续进行数据修改的操作记录下来，用于数据拷贝结束后，执行这些操作，保证数据不会丢失。
3、拷贝数据，从源数据表中拷贝数据到新表中。
4、rename源数据表为old表，把新表rename为源表名，并将old表删除。
5、删除触发器。

然而这两个有意(KENG)思(B)的工具，居然。。。居然。。。唉！如果你的表里有触发器和外键，这两个工具是不行滴！
如果真碰上了数据库里有触发器和外键，只能硬杠了，请看方式三

### 方式三:改从库表结构，然后主从切换

此法极其麻烦，需要专业水平的选手进行操作。

因为我们的mysql架构一般是读写分离架构，从机是用来读的。

我们直接在从库上进行表结构修改，不会阻塞从库的读操作。

改完之后，进行主从切换即可。唯一需要注意的是，主从切换过程中可能会有数据丢失的情况！

## 个人的一些思路

### 重置 id 自增的值

不过这有一个前提，我们的数据需要定期备份（清理）

在 MySQL 中，重置 `AUTO_INCREMENT` 列的值可以通过以下几种方法来实现：

### 方法 1：使用 `ALTER TABLE`

可以使用 `ALTER TABLE` 语句来重置 `AUTO_INCREMENT` 的值。例如，如果你想将表 `test_id` 的自增主键 `id` 重置为 1，可以使用如下语句：

```sql
ALTER TABLE test_id AUTO_INCREMENT = 1;
```

请注意，如果表中已经存在的 `id` 值大于或等于你设置的 `AUTO_INCREMENT` 值，那么下一个插入的值将是现有最大 `id` 值加 1。因此，通常在表为空或者需要将 `AUTO_INCREMENT` 重置为比现有最大 `id` 值大的数时使用这种方法。

### 方法 2：删除并重新创建表

如果你想完全重置表并确保 `AUTO_INCREMENT` 值从 1 开始，可以删除并重新创建表。这种方法会清除表中的所有数据。

```sql
DROP TABLE IF EXISTS test_id;
CREATE TABLE `test_id` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    `name` varchar(64) NOT NULL COMMENT '名称',
    `create_time` datetime(3) NOT NULL DEFAULT current_timestamp(3) COMMENT '创建时间',
    `update_time` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3) COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测试 id 表';
```

### 方法 3：删除所有数据并重置 `AUTO_INCREMENT`

如果你只想删除所有数据并重置 `AUTO_INCREMENT`，可以先删除所有数据，然后重置 `AUTO_INCREMENT` 值。

```sql
TRUNCATE TABLE test_id;
```

`TRUNCATE TABLE` 语句会删除所有行并将 `AUTO_INCREMENT` 值重置为 1（或者重置为其初始值，如果不是从 1 开始）。

### 方法 4：根据现有数据重置 `AUTO_INCREMENT`

有时候你可能希望根据表中现有数据来重置 `AUTO_INCREMENT`。例如，假设你希望 `AUTO_INCREMENT` 的下一个值是当前最大 `id` 值加 1，可以使用如下步骤：

1. 找到当前最大 `id` 值：
    ```sql
    SELECT MAX(id) FROM test_id;
    ```

2. 使用 `ALTER TABLE` 语句将 `AUTO_INCREMENT` 设置为最大 `id` 值加 1。例如，如果最大 `id` 值是 10：
    ```sql
    ALTER TABLE test_id AUTO_INCREMENT = 11;
    ```

根据你的具体需求，可以选择上述方法中的一种来重置 `AUTO_INCREMENT` 值。

### 其他方式

可以对表进行 rename。

然后建一张全新的表。

当然，这一切的前提就是我们不要过分依赖这个 id 主键。

数据量够大，后面都要考虑分库分表，单表性能是肯定不够的。

# 最佳实践

```sql
CREATE TABLE `xxxx` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `create_time` datetime(3) NOT NULL DEFAULT current_timestamp(3) COMMENT '创建时间',
  `update_time` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_create_time` (`create_time`) USING BTREE,
  KEY `idx_update_time` (`update_time`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='表注释';
```


# 参考资料

[MySQL中的自增主键 ID自增到最大，使用完id会发生什么，怎么办？](https://blog.csdn.net/Agly_Clarlie/article/details/118947056)

https://finisky.github.io/2020/11/22/mysqlprimarykeyuuid/

https://xie.infoq.cn/article/1c1042e0e637127cf642e5859

* any list
{:toc}