---
layout: post
title: 监控利器之 grafana 与 mysql 整合实战
date:  2021-06-20 16:52:15 +0800
categories: [APM]
tags: [apm, grafana]
published: true
---


# 序言

学习了上一节的 grafana 的安装，相信各位小伙伴已经跃跃欲试，或者有一点疑惑，一个空大盘有什么用呢？

别急，这一节我们就来一起学习一下 grafana 添加 mysql 数据源。

# 添加数据源

## 配置菜单

将光标移动到侧面菜单上的齿轮图标，该图标将显示配置选项。

![配置菜单](https://grafana.com/static/img/docs/v75/sidemenu-datasource-7-5.png)

单击数据源。 

数据源页面打开，显示先前为 Grafana 实例配置的数据源列表。

## 数据源列表

单击添加数据源（Add data source）以查看所有支持的数据源的列表。

![数据源的列表](https://grafana.com/static/img/docs/v75/add-data-source-7-5.png)

## 选择

支持的数据源类型较多，大家根据自己的喜好选择即可。

这里我们选择使用较为广泛的 mysql。

![mysql 数据源](https://images.gitee.com/uploads/images/2021/0704/104651_ff905ea9_508704.png "mysql.png")

主要配置一下数据源的链接信息，其他使用默认配置。

## 数据源测试

当然，我们点击【Save & Test】返回的错误是 400.

那是因为我们没有创建对应的数据库，我们登陆上 mysql，创建一下对应的数据库：

```
create database grafana_test;
```

此时返回【Database Connection OK】。

## 用户的权限

您在添加数据源时指定的数据库用户应仅被授予对您要查询的指定数据库和表的 SELECT 权限。 

Grafana 不会验证查询是否安全。 查询可以包括任何 SQL 语句。 

例如像USE otherdb这样的语句； 和 DROP TABLE 用户； 将被处决。 

为了防止这种情况，我们强烈建议您创建一个具有受限权限的特定 mysql 用户。

```sql
CREATE USER 'grafanaReader' IDENTIFIED BY 'password';
GRANT SELECT ON mydatabase.mytable TO 'grafanaReader';
```

这个使用时根据实际需要调整，此处为了简单，使用 root 进行演示。

# 查询编辑器

数据源我们已经加好， 但是怎么使用呢?

![Query Editor](https://grafana.com/static/img/docs/v54/mysql_query.gif)

您可以在面板编辑模式的指标选项卡中找到 MySQL 查询编辑器。 

您可以通过单击面板标题进入编辑模式，然后进行编辑。

查询编辑器有一个名为 Generated SQL 的链接，在执行查询后，在面板编辑模式下会显示该链接。 

![mysql-pannel](https://images.gitee.com/uploads/images/2021/0704/125804_2e9b258e_508704.png "mysql-pannel.png")

ps: 我们的第一个 pannel 是默认的随机游走，修改一下对应的数据源即可。

## Select table, time column and metric column (FROM)

当您第一次进入编辑模式或添加新查询时，Grafana 将尝试使用具有时间戳列和数字列的第一个表预填充查询构建器。

在 FROM 字段中，Grafana 将建议配置数据库中的表。

要选择数据库用户有权访问的另一个数据库中的表或视图，您可以手动输入完全限定名称 (database.table)，如 otherDb.metrics。

时间列字段是指保存您的时间值的列的名称。为 Metric 列字段选择一个值是可选的。如果选择了一个值，Metric 列字段将用作系列名称。

度量列建议将仅包含具有文本数据类型（text、tinytext、mediumtext、longtext、varchar、char）的列。

如果您想使用具有不同数据类型的列作为度量列，您可以输入带有强制转换的列名：CAST(numericColumn as CHAR)。

您还可以在度量列字段中输入任意 SQL 表达式，这些表达式的计算结果为文本数据类型，如 CONCAT(column1, " ", CAST(numericColumn as CHAR))。

## Columns and Aggregation functions (SELECT)

在 SELECT 行中，您可以指定要使用的列和函数。 

在列字段中，您可以编写任意表达式，而不是像 `column1 * column2 / column3` 这样的列名。

如果使用聚合函数，则需要对结果集进行分组。 

如果添加聚合函数，编辑器将自动添加 GROUP BY 时间。

您可以通过单击加号按钮并从菜单中选择列来添加更多值列。 

多个值列将在图形面板中绘制为单独的系列。

## Filter data (WHERE)

要添加过滤器，请单击 WHERE 条件右侧的加号图标。 

您可以通过单击过滤器并选择移除来移除过滤器。 

当前选定时间范围的过滤器会自动添加到新查询中。

## Group By

要按时间或任何其他列分组，请单击 GROUP BY 行末尾的加号图标。 

建议下拉列表将仅显示当前所选表格的文本列，但您可以手动输入任何列。 

您可以通过单击项目然后选择删除来删除组。

如果添加任何分组，则所有选定的列都需要应用聚合函数。 

添加分组时，查询构建器将自动向所有没有聚合函数的列添加聚合函数。

## Gap Filling

当你按时间分组时，Grafana 可以填充缺失值。 

time 函数接受两个参数。 

第一个参数是您想要分组的时间窗口，第二个参数是您希望 Grafana 填充缺失项的值。

## Text Editor Mode (RAW)

您可以通过单击汉堡包图标并选择切换编辑器模式或单击查询下方的编辑 SQL 来切换到原始查询编辑器模式。

如果您使用原始查询编辑器，请确保您的查询至少具有 ORDER BY 时间和返回时间范围的过滤器。


# 实战案例

## 建表语句

我们创建一张用户的日志表：

```sql
use grafana_test;

create table user_log(
  `id`            BIGINT AUTO_INCREMENT,
  `user_name` varchar(64) COMMENT '用户名称', 
  `status` CHAR(1) COMMENT '状态。S:成功;F:失败',
  `created_time` datetime NOT NULL COMMENT '创建时间' default now(),
  PRIMARY KEY (`id`)
);
```

数据初始化：

```sql
insert user_log(user_name, status) values('A', 'S');
insert user_log(user_name, status) values('B', 'S');
insert user_log(user_name, status) values('C', 'F');
```

数据如下：

```
mysql> select * from user_log;
+----+-----------+--------+---------------------+
| id | user_name | status | created_time        |
+----+-----------+--------+---------------------+
|  1 | A         | S      | 2021-07-04 13:10:23 |
|  2 | B         | S      | 2021-07-04 13:10:24 |
|  3 | C         | F      | 2021-07-04 13:10:24 |
+----+-----------+--------+---------------------+
3 rows in set (0.00 sec)
```

## 配置指标

![查询指标](https://images.gitee.com/uploads/images/2021/0704/131956_bdbb220e_508704.png "mysql-query.png")

当我们表创建好以后，页面选择都会有对应的提示。这一点做得非常人性化。

### 属性

我们主要指定了下面几个属性：

（1）查询的表 

FROM user_log

（2）时间字段

在统计图表中，时间非常重要的一个维度。

我们的时间字段：create_time

（3）统计字段

这里统计的字段是状态。status。

（4）查询的信息

查询的就是不通状态下的个数。

SELECT count(id)

其他保持默认。

### SQL

我们可以再【Edit SQL】 中查看 这个对应的SQL：

```sql
SELECT
  $__timeGroupAlias(created_time,$__interval),
  status AS metric,
  count(id) AS "id"
FROM user_log
WHERE
  $__timeFilter(created_time)
GROUP BY 1,2
ORDER BY $__timeGroup(created_time,$__interval)
```

### 效果

效果就是图中的两个点。

S：2

F：1

横坐标是时间，纵坐标是个数。

## 多加一点数据

我们开始只初始化了一次，都是同一时间内新增的。

### 第一次新增

这样无法体现出不通的时间维度，所以我们再新增一次数据：

```sql
insert user_log(user_name, status) values('D', 'S');
insert user_log(user_name, status) values('E', 'S');
insert user_log(user_name, status) values('F', 'F');
```

插入后的整体数据如下：

```
mysql> select * from user_log;
+----+-----------+--------+---------------------+
| id | user_name | status | created_time        |
+----+-----------+--------+---------------------+
|  1 | A         | S      | 2021-07-04 13:10:23 |
|  2 | B         | S      | 2021-07-04 13:10:24 |
|  3 | C         | F      | 2021-07-04 13:10:24 |
|  4 | D         | S      | 2021-07-04 13:26:21 |
|  5 | E         | S      | 2021-07-04 13:26:21 |
|  6 | F         | F      | 2021-07-04 13:26:22 |
+----+-----------+--------+---------------------+
6 rows in set (0.00 sec)
```

### 第二次新增

```sql
insert user_log(user_name, status) values('G', 'S');
insert user_log(user_name, status) values('H', 'S');
insert user_log(user_name, status) values('I', 'S');
insert user_log(user_name, status) values('J', 'F');
```

### 效果

我们在三个时间点插入数据，效果如下：

![用户日志](https://images.gitee.com/uploads/images/2021/0704/132949_d68df135_508704.png "mysql-query-time-series.png")

如果是实际工作，可以把对应的指标换成后端接口 API 的成功失败数量，这样可以非常直观的看到不同时间的变化情况。

## 更多展现形式

聪明的小伙伴肯定想到了，如果我想看成功失败的占比呢？

grafana 都为了我们内置了丰富的图表展现形式，我们可以根据自己的实际需求进行选择。

点击右上角的【Time series】可以进行其他选择，此处不再赘述。

# 小结

grafana 统一实现了一套成熟的报表展示，完全做到了开箱即用。

从技术和产品的角度而言，可以避免程序员和产品反复的因为业务端的某个参数指标，而不断的提需求上线修改。

更重要的是，可以让整个团队的非技术人员更容易地参与到数据指标中去。

写到这里依然有两点需要说明一下：

（1）数据的来源

实际工作中，数据的来源主要是应用埋点，通过汇总业务端关心的指标进行统一页面展示。

（2）报警和通知

有时候我们不会一直盯着大盘看，但是如果失败率上升怎么办呢？

这个就是很多云服务等产品都会提供的，配置报警规则。

比如一个小时内失败次数超过 10 次，进行报警。

报警的通知形式也是多种多样的：

1. weixin

2. 钉钉

3. 短信

4. 电话

5. 邮件

# 参考资料

[官网-如何添加数据源](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/#add-a-data-source)

[Grafana的介绍与使用](https://www.jianshu.com/p/0d82c7ccc85a)

[using-mysql-in-grafana](https://grafana.com/docs/grafana/v7.5/datasources/mysql/#using-mysql-in-grafana)

[启动MySQL报错:ERROR 2003 (HY000): Can't connect to MySQL server on 'localhost' (10061)](https://blog.csdn.net/BigData_Mining/article/details/88344513)

[Mysql 服务无法启动 服务没有报告任何错误](https://www.cnblogs.com/wangjunyan/p/5183366.html)

[MySQL修改root密码的4种方法(小结)](https://www.jb51.net/article/169143.htm)


* any list
{:toc}