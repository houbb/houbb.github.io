---
layout: post
title:  Mybatis.NET
date:  2017-04-08 10:18:43 +0800
categories: [ORM]
tags: [mybatis, dotnet]
header-img: "static/app/res/img/article-bg.jpeg"
published: false
---


# Mybatis.NET

[MyBatis](https://www.codeproject.com/articles/894127/mybatis-net) is a data mapping tool. 

It maps columns of a database query including stored procedure to properties of a business object. 

One definition of mapper is “an object that sets up communication between two independent objects. 

A Data Mapper is a "layer of mappers that moves data between objects and a database while keeping them independent of each other and the mapper itself.



# Why？

.NET platform already provides a capable library for accessing databases, whether through SQL statements or stored procedures but several things are still hard to do well when using ADO.NET, including:

- Separating SQL code from programming code

- Passing input parameters to the library classes and extracting the output

- Separating data access classes from business logic classes

- Caching often-used data until it changes

- Managing transactions and threading


iBATIS DataMapper solves these problems -- and many more -- by using XML documents to create a mapping between a plain-old object and a SQL statement or a stored procedure. 

The "plain-old object" can be a IDictionary or property object.



# Download & BLOG

> [MyBatis.NET 1.6.2](http://webscripts.softpedia.com/script/Database-Tools/MyBatis-NET-74189.html)


这个系列有 codesmith 模板。

> [MyBatisNet的安装使用](http://blog.csdn.net/anyqu/article/details/40427527) 


> [Mybatis.NET](https://www.codeproject.com/articles/894127/mybatis-net)

> [Mybatis.NET 入门系列3](http://blog.csdn.net/wulex/article/details/52232153)

> [Mybatis.NET CRUD](http://zhoufoxcn.blog.51cto.com/792419/459684/)


这一篇还不错。

> [Mybatis.NET 环境配置](http://www.cnblogs.com/chenkai/archive/2011/03/21/1990596.html)


# Hello World

本文使用 Mysql 进行测试。如果是 SQL server 请直接参考上面的文章。





> [c# mybatis net +mysql 的一个初步摸索](http://blog.csdn.net/zzzxxbird/article/details/49388517)




零、准备一张表用来测试。

- mybatis

```sql
CREATE TABLE `mybatis` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL COMMENT '名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB COMMENT='mybatis测试表';
```

一、引入对应的 DLL

1、 引入 Mybatis.NET nuget

直接NUGET搜索【mybatis】安装即可。当前版本信息为 **1.6.4**.


2、 引入 `System.Data` 和 `Mysql.Data`

二、指定配置文件


1、 First thing you need for the datamapper work is data map definition file (sqlMap.config).

- `SqlMap.config`


```xml

```


很重要：

<label class="label label-info">Attention</label>

在c#中  要将 `provider.config`   `sqlmap.config`  的属性  设置为   始终上传  和   内容，将`xxx.xml`设置为 始终上传和  嵌入的资源。



















 
 







