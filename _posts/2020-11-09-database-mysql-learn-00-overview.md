---
layout: post
title: mysql learn-00-overview mysql 学习专题汇总
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [data, mysql, learn-note, topics, overview, sh]
published: true
---

# 序言 

mysql 作为一款开源数据库，使用范围非常之广。

最核心的原因在于便宜，而且生态日趋完善。

所以本系列将对 mysql 进行重新整理学习，并且后期尝试实现简易版本的 mysql。

# 整体模块

myql 安装

mysql 基本使用

mysql 进阶技巧

mysql 实现原理

mysql 简易版实现

# 拓展阅读

[mysql 相关专题](https://houbb.github.io/tags/#mysql)

## 相关书籍

以前阅读完了两本书：

《MySQL技术内幕(第4版)》这本书一般。

《[[高性能MySQL》真本书偏应用。

但是对于 mysql 感觉还是没有学到精髓，最近开始阅读一本收藏了很久的书：

《MySQL技术内幕 InnoDB存储引擎》，这个系列主要应该是对这本书的记录和思考。

希望自己对 mysql 的理接可以更上一层楼。

# 拓展阅读

## 入门

[Docker 安装 mysql Windows 环境](https://houbb.github.io/2016/10/15/docker-install-mysql-windows)

[Docker 安装 MySQL](https://houbb.github.io/2018/09/08/docker-install-mysql)

[MySQL 入门使用](https://houbb.github.io/2016/10/17/mysql-hello-world)

[MySQL 5.6 Install, Windows Mysql Install 安装](https://houbb.github.io/2018/01/25/mysql-5.6-install)

[CentOS7 安装 mysql 5.7 笔记](https://houbb.github.io/2021/08/02/centos7-01-install-mysql5.7)

## 基础知识

[MySQL 05 MySQL入门教程（MySQL tutorial book）](https://houbb.github.io/2017/02/27/mysql-05-learn-book)

[MySQL datetime timestamp 以及如何自动更新，如何实现范围查询](https://houbb.github.io/2017/02/27/mysql-datetime-timestamp)

[MySQL View 视图](https://houbb.github.io/2017/03/30/mysql-view)

[MySQL Tables 获取 mysql 所有表名称和列名称](https://houbb.github.io/2018/09/03/mysql-tables)

[MySQL group by mysql 分组查询取第一条（时间排序）](https://houbb.github.io/2018/09/03/mysql-group-by)

[关于 mysql 数据存储，你了解多少？](https://houbb.github.io/2018/11/28/mysql-storage)

[mysql learn-02-mysql 体系结构和存储引擎](https://houbb.github.io/2020/10/17/database-mysql-learn-02-mysql-struct)

[mysql learn-03-Innodb 引擎介绍](https://houbb.github.io/2020/10/17/database-mysql-learn-03-innodb-struct)

[mysql（4）文件系统](https://houbb.github.io/2020/10/17/database-mysql-learn-04-file)

[mysql（5）表](https://houbb.github.io/2020/10/17/database-mysql-learn-05-table)

[mysql-10-MySQL查询数据表的Auto_Increment(自增id)](https://houbb.github.io/2020/10/17/database-mysql-learn-10-max-id)

[你真的理解 mysql 的 insert 吗？](https://houbb.github.io/2021/06/05/database-insert)

[mysql 时间精度精确到毫秒实现方案](https://houbb.github.io/2021/01/25/mysql-time-scale)

[mysql 常见面试题汇总](https://houbb.github.io/2022/05/10/interview-05-mysql)

## 锁专题

[MySQL Lock](https://houbb.github.io/2018/09/03/sql-lock)

[SQL MVCC](https://houbb.github.io/2018/08/31/sql-mvcc)

[mysql（6）lock mysql 锁](https://houbb.github.io/2020/10/17/database-mysql-learn-07-lock)

## 索引专题

[MySQL Index](https://houbb.github.io/2018/07/30/mysql-index)

[MySQL Explain](https://houbb.github.io/2018/11/08/mysql-explain)

[mysql（6）Index 索引](https://houbb.github.io/2020/10/17/database-mysql-learn-06-index)

[数据库索引-08-MySQL Index Tips](https://houbb.github.io/2019/01/02/db-index-08-mysql-index-tips)

[数据库索引-09-MySQL Index Merge 索引合并](https://houbb.github.io/2019/01/02/db-index-09-mysql-index-merge)

[数据库索引-11-Mysql 为什么选择 B+ Tree 作为索引？](https://houbb.github.io/2019/01/02/db-index-11-why-b-plus)

[数据库索引-11-Mysql 索引执行流程 主键索引 普通索引 组合索引+最左匹配原则 覆盖索引+索引下推](https://houbb.github.io/2019/01/02/db-index-12-execute)

[数据库索引-13-实际工作中的索引优化](https://houbb.github.io/2019/01/02/db-index-13-in-action)

[Tree-11-mysql index 数据库索引](https://houbb.github.io/2020/10/17/data-struct-tree-11-database-index)

## 事务专题

[SQL Isolation](https://houbb.github.io/2018/08/30/sql-isolation)

[mysql（6）transaction 事务](https://houbb.github.io/2020/10/17/database-mysql-learn-08-tx)

[mysql（9）transaction 事务2](https://houbb.github.io/2020/10/17/database-mysql-learn-09-tx2)

## 日志专题

[MySQL 日志常见问题](https://houbb.github.io/2019/01/14/mysql-log)

[mysql binlog](https://houbb.github.io/2021/08/29/mysql-binlog)

## 架构

[SQLProxy](https://houbb.github.io/2018/08/30/sqlproxy)

[Mycat 分布式主从复制中间件。](https://houbb.github.io/2018/09/03/mycat)

## 常见问题

[MySQL Expression 1 of ORDER BY clause is not in SELECT list,references column](https://houbb.github.io/2017/02/27/mysql-03-error)

[MySQL 04- EMOJI 表情与 UTF8MB4 的故事](https://houbb.github.io/2017/02/27/mysql-04-emoj-and-utf8mb4)

[MySQL 5.7 忘记密码解决记录（windows 7 环境）](https://houbb.github.io/2018/01/25/mysql-5.7-forget-password-windows)

## 最佳实践

[MySQL Ruler mysql 日常开发规范](https://houbb.github.io/2017/02/27/mysql-ruler)

[MySQL truncate table 与 delete 清空表的区别和坑](https://houbb.github.io/2017/02/27/mysql-truncate)

[MySQL 数据库最佳实践，count(*)，全文索引，事务、行锁与表锁、外键](https://houbb.github.io/2018/09/03/db-mysql-best-practice)

[数据库索引-10-Mysql count(*)，count(字段)，count(1)的区别](https://houbb.github.io/2019/01/02/db-index-10-mysql-count)

[mysql learn-01-mysql limit 的分页性能很差问题及其解决方案](https://houbb.github.io/2020/10/17/database-mysql-learn-01-performance-limit)

# 参考资料

[mysql dba 系统学习系列](https://blog.51cto.com/wolfword/category8.html/p2)

[MySQL 官网](https://www.mysql.com/)

[MySQL 推荐学习书籍](https://www.zhihu.com/question/28385400)

* any list
{:toc}