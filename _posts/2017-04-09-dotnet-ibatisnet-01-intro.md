---
layout: post
title:  IbatisNet-01-hello world 入门介绍
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---


# IbatisNet

## 写在前面

原来尝试了[mybatisNet](https://houbb.github.io/2017/04/08/mybatis-dotnet)，实际使用无奈的发现语法和 ibatis.Net 是一样的。

就选择了 [iBATIS.NET](http://ibatis.apache.org/docs/dotnet/datamapper/index.html)。

这个相对资料会多一些，而且有官方文档。


## 简介

iBATIS DataMapper 框架使在 Java 或 .NET 应用程序中使用数据库变得更加容易。

iBATIS DataMapper 使用 XML 描述符将对象与存储过程或 SQL 语句结合在一起。

简单性是 iBATIS DataMapper 相对于对象关系映射工具的最大优势。

## ORM/ibatis？

一如既往，最好的建议是使用其中一种方法实现项目的代表性部分，然后再做决定。

但一般来说，当你：

- 对数据库实现有完全控制权
- 团队中没有数据库管理员或 SQL 专家
- 需要在数据库外将问题域建模为对象图

时，对象关系映射（OR/M）是一个好选择。

同样，使用像 iBATIS 这样的数据映射器的最佳时机是：

- 你对数据库实现没有完全控制权，或者希望在重构过程中继续访问旧数据库。
- 团队中有数据库管理员或 SQL 专家。
- 数据库被用于建模问题域，应用程序的主要角色是帮助客户使用数据库模型。

## 小结

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


* any list
{:toc}