---
layout: post
title:  MySQL View
date:  2017-07-16 08:34:48 +0800
categories: [MySQL]
tags: [view]
published: true
---


# View

- 何为视图

[视图](http://blog.51yip.com/mysql/1062.html#more-1062) 是存放数据的一个接口，也可以说是虚拟的表。这些数据可以是从一个或几个基本表（或视图）的数据。
也可以是用户自已定义的数据。其实视图里面不存放数据的，数据还是放在基本表里面，基本表里面的数据发生变动时，视图里面的数据随之变动。


- 作用

1、视图可以让查询变得很清楚

2、保护数据库的重要数据，给不同的人看不同的数据

3、对于视图能完成的事情，查询语句代码本身也能完成。视图的优点直接修改数据库即可，不用修改源代码。


- 视图的类型

mysql的视图有三种类型：MERGE、TEMPTABLE、UNDEFINED。如果没有ALGORITHM子句，默认算法是UNDEFINED（未定义的）。算法会影响MySQL处理视图的方式。

1、`MERGE`，会将引用视图的语句的文本与视图定义合并起来，使得视图定义的某一部分取代语句的对应部分。

2、`TEMPTABLE`，视图的结果将被置于临时表中，然后使用它执行语句。

3、`UNDEFINED`，MySQL将选择所要使用的算法。如果可能，它倾向于MERGE而不是TEMPTABLE，这是因为MERGE通常更有效，而且如果使用了临时表，视图是不可更新的。

# Create View

[Create view](https://dev.mysql.com/doc/refman/5.6/en/create-view.html) 用于创建一个视图。

- 命令

```
mysql> ? CREATE VIEW
Name: 'CREATE VIEW'
Description:
Syntax:
CREATE
    [OR REPLACE]
    [ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}]
    [DEFINER = { user | CURRENT_USER }]
    [SQL SECURITY { DEFINER | INVOKER }]
    VIEW view_name [(column_list)]
    AS select_statement
    [WITH [CASCADED | LOCAL] CHECK OPTION]
```

The CREATE VIEW statement creates a new view, or replaces an existing
view if the OR REPLACE clause is given. If the view does not exist,
CREATE OR REPLACE VIEW is the same as CREATE VIEW.


# Query View

查询就相当于查询普通的表。


# Alter View

[Alter View](URL: http://dev.mysql.com/doc/refman/5.6/en/alter-view.html) 用于修改视图。

- 命令

```
mysql> ? alter view
Name: 'ALTER VIEW'
Description:
Syntax:
ALTER
    [ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}]
    [DEFINER = { user | CURRENT_USER }]
    [SQL SECURITY { DEFINER | INVOKER }]
    VIEW view_name [(column_list)]
    AS select_statement
    [WITH [CASCADED | LOCAL] CHECK OPTION]
```

This statement changes the definition of a view, which must exist. The
syntax is similar to that for CREATE VIEW and the effect is the same as
for CREATE OR REPLACE VIEW. See [HELP CREATE VIEW]. This statement
requires the CREATE VIEW and DROP privileges for the view, and some
privilege for each column referred to in the SELECT statement. ALTER
VIEW is permitted only to the definer or users with the SUPER
privilege.



# Drop View

[Drop View](http://dev.mysql.com/doc/refman/5.6/en/drop-view.html) 用于删除一个视图。

```
mysql> ? drop view
Name: 'DROP VIEW'
Description:
Syntax:
DROP VIEW [IF EXISTS]
    view_name [, view_name] ...
    [RESTRICT | CASCADE]
```

DROP VIEW removes one or more views. You must have the DROP privilege
for each view. If any of the views named in the argument list do not
exist, MySQL returns an error indicating by name which nonexisting
views it was unable to drop, but it also drops all of the views in the
list that do exist.

The IF EXISTS clause prevents an error from occurring for views that
don't exist. When this clause is given, a NOTE is generated for each
nonexistent view. See [HELP SHOW WARNINGS].

RESTRICT and CASCADE, if given, are parsed and ignored.




# Sth. Limit

视图虽然和表很类似，但还是有区别。

- mysql的视图名不能和现有表名重复

- 视图所对应的表，不能是临时表

- 创建视图时不能使用系统或用户变量

- 不能使用预处理语句参数，存储过程中的参数或局部变量

- 如果预处理语句调用了视图，视图就不能变了

- 在存储过程中不能修改视图 (此条可能依赖于数据库版本)

- 不能给视图添加索引

* any list
{:toc}












