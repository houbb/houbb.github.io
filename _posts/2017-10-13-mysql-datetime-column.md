---
layout: post
title: MySQL 中的时间字段
date:  2017-10-13 09:40:27 +0800
categories: [Mysql]
tags: [mysql]
published: true
---


# mysql 中的时间字段用什么数据类型

Mysql中用来存储日期的数据类型有三种：Date、Datetime、Timestamp

## Date

Date数据类型：用来存储没有时间的日期。Mysql获取和显示这个类型的格式为“YYYY-MM-DD”。

按照标准的SQL，不允许其他格式。在UPDATE表达式以及SELECT语句的WHERE子句中应使用该格式。例如：

```sql
mysql> SELECT * FROM tbl_nameWHERE date >= '2003-05-05';
```

支持的范围为'1000-01-01'到'9999-12-31'。MySQL以'YYYY-MM-DD'格式显示DATE值，但允许使用字符串或数字为DATE列分配值。

## Datetime

Datetime类型：日期和时间的组合。支持的范围是'1000-01-01 00:00:00'到'9999-12-31 23:59:59'。

MySQL以'YYYY-MM-DD HH:MM:SS'格式显示DATETIME值，但允许使用字符串或数字为DATETIME列分配值。

## Timestamp

Timestamp 类型：

时间戳。范围是'1970-01-01 00:00:00'到2037年。

TIMESTAMP列用于INSERT或UPDATE操作时记录日期和时间。如果你不分配一个值，表中的第一个TIMESTAMP列自动设置为最近操作的日期和时间。也可以通过分配一个NULL值，将TIMESTAMP列设置为当前的日期和时间。

TIMESTAMP值返回后显示为'YYYY-MM-DD HH:MM:SS'格式的字符串，显示宽度固定为19个字符。如果想要获得数字值，应在TIMESTAMP 列添加+0。

所有不符合上面所述格式的数据都会被转换为相应类型的0值。（0000-00-00或者0000-00-00 00:00:00）


# 函数

二、在mysql中，DATE_FORMAT(date, format) 函数根据format字符串格式化date值。

%M 月名字(January……December) 
%W 星期名字(Sunday……Saturday) 
%D 有英语前缀的月份的日期(1st, 2nd, 3rd, 等等。） 
%Y 年, 数字, 4 位 
%y 年, 数字, 2 位 
%a 缩写的星期名字(Sun……Sat) 
%d 月份中的天数, 数字(00……31) 
%e 月份中的天数, 数字(0……31) 
%m 月, 数字(01……12) 
%c 月, 数字(1……12) 
%b 缩写的月份名字(Jan……Dec) 
%j 一年中的天数(001……366) 
%H 小时(00……23) 
%k 小时(0……23) 
%h 小时(01……12) 
%I 小时(01……12) 
%l 小时(1……12) 
%i 分钟, 数字(00……59) 
%r 时间,12 小时(hh:mm:ss [AP]M) 
%T 时间,24 小时(hh:mm:ss) 
%S 秒(00……59) 
%s 秒(00……59) 
%p AM或PM 
%w 一个星期中的天数(0=Sunday ……6=Saturday ） 
%U 星期(0……52), 这里星期天是星期的第一天 
%u 星期(0……52), 这里星期一是星期的第一天 
%% 一个文字“%”。


# 互相转换

把字符串转为日期格式

```sql
SELECT DATE_FORMAT('2011-09-20 08:30:45',   '%Y-%m-%d %H:%i:%S'); 
```

把日期转为字符串格式

```sql
SELECT DATE_FORMAT(NOW(),   '%Y-%m-%d %H:%i:%S'); 
```

# 参考资料

https://blog.csdn.net/BlackPlus28/article/details/80687927

https://blog.csdn.net/meism5/article/details/104205910

* any list
{:toc}