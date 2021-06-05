---
layout: post
title:  你真的理解 mysql 的 insert 吗？
date:  2021-06-05 16:52:15 +0800
categories: [Database]
tags: [database, mysql, sf]
published: true
---

# 业务场景

## 表信息

假设我们有一张如下的表：

```sql
create table user
(
    id int unsigned auto_increment comment '自增主键' primary key,
    user_id varchar(32) not null comment '用户标识',
    user_name varchar(32) not null comment '用户名称',
    remark varchar(64) not null comment '用户描述',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间戳',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间戳'
) comment '用户表' ENGINE=Innodb default charset=UTF8 auto_increment=1;
create unique index uk_user_id on user (user_id) comment '标识索引';
```

其中 id 是主键，user_id 是业务唯一索引。

## 防重

业务上我们必须要求 user_id 是唯一的。

那如何保证唯一呢？

一般会有两种方式：

（1）利用数据库的唯一约束，直接插入。如果重复会报错。

（2）插入之前，首先查询一下，如果不存在，则插入。

方案 1 虽然简单，但是会有一些异常信息，而且这些异常是可以通过方案 2 避免的。所以实际工作中，使用方案 2 的较多。

我们来简单看看方案 2 到底应该怎么做。

# 防重 1-查询已有的内容

很多小伙伴喜欢这样实现：

```sql
select * from user where user_id = #{userId};
```

如果返回的内容不存在，则插入。

如果我们不需要历史的数据内容，而只是确认是否存在，建议使用下面的方式。

# 防重 2-查询已有的条数

```sql
select count(*) from user where user_id = #{userId};
```

这种方式的好处就是返回的内容更少，也就是网络交互传输的内容更少。

当然在我们的例子中不是很明显，如果查询返回的内容较多时效果比较好。

# 防重 3-存在则忽略

一般工作中，都是用上面两张方式。

不过本文的重点从现在才开始。

## 性能的优化

以前的的插入，如果需要判断存在然后插入，实际上是 2 条SQL：

```sql
select count(*) from user where user_id = #{userId};

insert into user (user_id, user_name, remark) values ('xx', 'xx', 'xx');
```

这实际上是 2 次数据库交互。

那么能不能合并成 1 条 SQL 呢？

答案是可以的。

## insert ignore into

mysq 支持 `insert ignore into`。

insert into 表示插入数据，数据库会检查主键（PrimaryKey），如果出现重复会报错；

insert ignore表示，如果中已经存在相同的记录，则忽略当前新数据；

## 实际测试

### insert into

```sql
insert into user (user_id, user_name, remark) values ('001', '001', '001');
insert into user (user_id, user_name, remark) values ('001', '001', '001');
```

日志如下：

```
mysql> insert into user (user_id, user_name, remark) values ('001', '001', '001');
Query OK, 1 row affected (0.00 sec)

mysql> insert into user (user_id, user_name, remark) values ('001', '001', '001');
ERROR 1062 (23000): Duplicate entry '001' for key 'uk_user_id'
```

第二条插入报错。

### insert ignore into

```sql
insert ignore into user (user_id, user_name, remark) values ('002', '002', '002');
insert ignore into user (user_id, user_name, remark) values ('002', '002', '002');
```

日志如下：

```
mysql> insert ignore into user (user_id, user_name, remark) values ('002', '002', '002');
Query OK, 1 row affected (0.00 sec)

mysql> insert ignore into user (user_id, user_name, remark) values ('002', '002', '002');
Query OK, 0 rows affected, 1 warning (0.00 sec)
```

可以返现第二条影响的条数为 0，并没有报错信息。


# 防重 4-存在则更新

## 存在则更新

当然，有时候我们不希望直接丢弃数据。

而是希望用最新的覆盖旧的，也就是：不存在则插入，存在则更新。

如果按照一般的写法，伪代码可能如下：

```java
int count = this.selectCount(userCondition);

if(count <= 0) {
    this.insert(user);
} else {
    this.update(userCondition, user);
}
```

## 性能优化

这种写法很常见，但是也很麻烦。

有 2 个判断分支，同时也有 2 次数据库交互。

当然，mysql 也提供了类似的解决方式。

## replace into

replace into表示插入替换数据，需求表中有PrimaryKey，或者unique索引的话，如果数据库已经存在数据，则用新数据替换，如果没有数据效果则和insert into一样；

REPLACE语句会返回一个数，来指示受影响的行的数目。该数是被删除和被插入的行数的和。如果对于一个单行REPLACE该数为1，则一行被插入，同时没有行被删除。如果该数大于1，则在新行被插入前，有一个或多个旧行被删除。

如果表包含多个唯一索引，并且新行复制了在不同的唯一索引中的不同旧行的值，则有可能是一个单一行替换了多个旧行。

## 测试

replace into 例子：

```sql
replace into user (user_id, user_name, remark) values ('003', '003', '003');
replace into user (user_id, user_name, remark) values ('003', '003-NEW', '003-NEW');
```

日志：

```
mysql> replace into user (user_id, user_name, remark) values ('003', '003', '003');
Query OK, 1 row affected (0.00 sec)

mysql> replace into user (user_id, user_name, remark) values ('003', '003-NEW', '003-NEW');
Query OK, 2 rows affected (0.00 sec)
```

可以返现，这里返回了 2 行被影响。

意思是实际上这里本质上是 2 步：

（1）执行删除影响 1 行

（2）执行新的插入影响 1 行

所以这里一定要注意，mysql 表设计的时候 id 自增主键不要被业务使用，而是仅仅用于主键聚合索引的性能考虑。

数据结果：

```
mysql> select * from user;
+----+---------+-----------+---------+---------------------+---------------------+
| id | user_id | user_name | remark  | create_time         | update_time         |
+----+---------+-----------+---------+---------------------+---------------------+
|  1 | 001     | 001       | 001     | 2021-06-05 11:49:44 | 2021-06-05 11:49:44 |
|  3 | 002     | 002       | 002     | 2021-06-05 11:50:41 | 2021-06-05 11:50:41 |
|  6 | 003     | 003-NEW   | 003-NEW | 2021-06-05 12:18:59 | 2021-06-05 12:18:59 |
+----+---------+-----------+---------+---------------------+---------------------+
```

可以看到，数据已经被更新了。

# 小结

之所以会写这一篇文章，主要是因为在工作中看到别人这样写代码。

而**很多东西，都有优化的空间，哪怕只有一点点**，只是习以为常，甚至都放弃了思考。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

* any list
{:toc}