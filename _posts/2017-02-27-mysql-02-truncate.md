---
layout: post
title: MySQL-02-truncate table 与 delete 清空表的区别和坑
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

# truncate 的问题

以前使用 delete from，感觉耗时较多，所以就采用了 truncate。

后来发现阻塞读，本篇简单记录下采坑之路。


# truncate 的阻塞原理

truncate 应慎重，它属于ddl，会lock table meta data，甚至可能由锁表升级为锁库

## 5.7 及其以前


```
In MySQL 5.7 and earlier, on a system with a large buffer pool and innodb_adaptive_hash_index enabled, a TRUNCATE TABLE operation could cause a temporary drop in system performance due to an LRU scan that occurred when removing the table's adaptive hash index entries (Bug #68184). The remapping of TRUNCATE TABLE to DROP TABLE and CREATE TABLE in MySQL 8.0 avoids the problematic LRU scan.
```

这个会导致阻塞

## 8.0 

参考文档，会将 truncate 调整为 drop+create。

中间过程会导致问题。

实际上 drop 也是有会阻塞查询的。

## drop 阻塞读

drop table引起的MySQL 短暂hang死的问题，是由于drop 一张使用AHI空间较大的表时，调用执行AHI的清理动作，会消耗较长时间，执行期间长时间持有dict_operation_lock的X锁，阻塞了其他后台线程和用户线程;

drop table执行结束锁释放，MySQL积压的用户线程集中运行，出现了并发线程和连接数瞬间上升的现象。规避问题的方法，可以考虑在drop table前关闭AHI。

ps: AHI 是自适应 HASH 索引，一种优化策略。

# 参考资料

[mysql 8.0 官方文档](https://dev.mysql.com/doc/refman/8.0/en/truncate-table.html)

[stackoverflow-MySQL TRUNCATE TABLE blocks queries in other databases](https://dba.stackexchange.com/questions/147600/mysql-truncate-table-blocks-queries-in-other-databases)

[mysql案例 ~ 关于drop的那点事](https://www.cnblogs.com/danhuangpai/p/11464683.html)

[记一次truncate导致的锁表处理](https://www.cnblogs.com/elsonwe/p/7508013.html)

[mysql 中的三种锁表方式](http://blog.sina.com.cn/s/blog_8445583b0102vv79.html)

[MySQL的TRUNCATE关键字](https://blog.csdn.net/nangeali/article/details/73620044?utm_source=blogxgwz0)

[MySQL DROP 大表时的注意事项](https://blog.csdn.net/weixin_34205826/article/details/85865913)

[MySQL AHI 实现解析](https://blog.csdn.net/qian_xiaoqian/article/details/53813333)

* any list
{:toc}