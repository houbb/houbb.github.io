---
layout: post
title:  IbatisNet-01-hello world
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---


# IbatisNet


- 写在前面

原来尝试了[mybatisNet](https://houbb.github.io/2017/04/08/mybatis-dotnet)，实际使用无奈的发现语法和 ibatis.Net 是一样的。

就选择了 [iBATIS.NET](http://ibatis.apache.org/docs/dotnet/datamapper/index.html)。

这个相对资料会多一些，而且有官方文档。


- 简介


The iBATIS DataMapper framework makes it easier to use a database with a Java or .NET application. 

iBATIS DataMapper couples objects with stored procedures or SQL statements using a XML descriptor. 

Simplicity is the biggest advantage of the iBATIS DataMapper over object relational mapping tools.
 
 

- ORM/ibatis?

As always, the best advice is to implement a representative part of your project using either approach, and then decide. 

But, in general, OR/M is a good thing when you

- Have complete control over your database implementation

- Do not have a Database Administrator or SQL guru on the team

- Need to model the problem domain outside the database as an object graph.


Likewise, the best time to use a Data Mapper, like iBATIS, is when:

- You do not have complete control over the database implementation, or want to continue to access a legacy database as it is being refactored.

- You have database administrators or SQL gurus on the team.

- The database is being used to model the problem domain, and the application's primary role is to help the client use the database model.


简而言之：

1. ibatis 是对DBA友好的。也就是为什么BAT其如此受欢迎。

2. 为了保持与旧SQL代码的兼容，这点很常见。

3. 数据库被用于模型问题域,和应用程序的主要作用是帮助客户端使用数据库模型。


# Hello World

此处测试环境为 MAC， MONO编辑器、MYSQL数据库。


一、DLL引入

1. 引入 `System.Data`

2. 引入 `MySql.Data`、`IbatisNet`

- package.config 

```xml
<?xml version="1.0" encoding="utf-8"?>
<packages>
  <package id="Castle.Core" version="3.3.3" targetFramework="net45" />
  <package id="IBatisNet45" version="1.6.2" targetFramework="net45" />
  <package id="log4net" version="2.0.4" targetFramework="net45" />
  <package id="MySql.Data" version="6.9.9" targetFramework="net45" />
</packages>
```


