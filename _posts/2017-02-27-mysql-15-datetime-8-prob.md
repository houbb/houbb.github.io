---
layout: post
title:  MySQL-15-mysql springboot jackjson 前端日期差 8 小时
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

# 现象


页面显示的时候，却和当前时间差了 8 个小时。

后端：

```java
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
private Date createTime;
```

前端使用字符串接受

```ts
createTime: string;
```

# 问题分析

## 1）URL 设置

## 1) 服务器时间

因为日期的创建使用的是 `new Date()`，所以确认了一眼服务器时间，时间正确。

## 2) URL 配置

在数据库链接上添加 serverTimezone=GMT%2B8

确认结果：url 中也设置了时区为上海。

UTC：Coordinated Universal Time 协调世界时。

GMT：Greenwich Mean Time 格林尼治标准时间。（在协调世界时意义上的0时区，即GMT = UTC+0）

中国的时间是【东八区】，比GMT多八个小时，即 GMT+8（或UTC+8，但习惯上还是用GMT+8）

## 3) 数据库值是否正确？

数据库存储值正确。

## 序列化的问题

debug 发现代码查询到的数据正确，但是序列化之后前端值错误。

于是猜测就剩下后端=》前端的序列化过程。jackson 序列化。

网上很多都是

```java
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
private Date createTime;
```

但是实际上这里缺少了时区。

1) 可以统一修正：

将spring的json构造器的时区改正即可，在application.yml文件中添加：

```yaml
spring:
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: GMT+8
```

2) 单个指定

或者这样：

```java
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone="GMT+8")
private Date updateDate;
```


# 反思

针对这种前后端交互的数据，有时候 string 可能是最简单也不容易出错的形式。

最后个人选择了把类型设置为 String，后端统一格式化返回给前端的方式。

# 参考资料

https://www.jb51.net/database/3110399bu.htm

https://blog.csdn.net/weixin_44147535/article/details/135438169

* any list
{:toc}