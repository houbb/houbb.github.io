---
layout: post
title: MySQL 05 MySQL入门教程（MySQL tutorial book）
date:  2017-02-27 21:44:46 +0800
categories: [SQL]
tags: [mysql, database, sql]
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



# MySQL 入门教程

从零开始学习MySQL，主要是面向MySQL数据库管理系统初学者。前端开发工程师为什么写这个入门教程呢？

最近项目强迫我这个前端老司机使用MySQL，虽然我在项目中已经使用过一段时间，为了写出高质量的SQL语句，能快速定位解决数据库引发的问题，系统的过一遍基础，你也可以当做是我的笔记。

有幸也认识一些 MySQL 的 DBA，这让我学习起来比较快，能快速入门，进入实战开发阶段。

原本我是使用 MongoDB 这类型的 NoSQL 数据库，MongoDB在 Nodejs 在 Mongoose 包的帮助下 JSON 的数据格式直接插入 MongoDB 中，对于一个前端开发工程师，使用起来非常舒服。但是没有办法，我是被逼的，从此入了一个新坑，我就决心系统的好好学习一下。如果你对本小电子书阅读非常没有耐心，你可以看看我做的一篇笔记 《21分钟MySQL基础入门》 ，这个笔记还可以在 SegmentFault 里面阅读，有导航阅读非常方便，为什么只需要21分钟呢？因为在我们大天朝有句话叫做“不管三七二十一”，你可以不管三七二十一开始使用 MySQL 及快速入门，里面系统的整理了，一些常用的SQL语句。

在本书中所搜集到得各种资源，我把它将放到这里 Awesome MySQL。所有SQL语句例子，是基于 MySQL 5.7.14 或者 MySQL 5.7.16 运行的。这里面的一些理论知识都是从维基百科等各种百科、各种官网搬运过来的，偶尔会有一些基础理论知识总结，如果有错误或者误差，可以给我来个疯狂的Pull requesets或Issue。如果实在看不下去你可以🔫。

MariaDB，是 MySQL server 的一个由社区开发的分支，MariaDB大部分跟 MySQL 5.5 以前版本使用差不多。自己电脑上是 MySQL 5.7.14，公司服务器上面是 MariaDB 最新版本，生产上 MySQL 5.7.16，所以很尴尬，偶尔提及MariaDB也是很正常的吧。

# 参考资料

https://github.com/jaywcjlove/mysql-tutorial

* any list
{:toc}