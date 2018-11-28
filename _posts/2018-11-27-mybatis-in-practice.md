---
layout: post
title: Mybaits in Practice
date: 2018-11-27 09:14:43 +0800
categories: [Mybaits]
tags: [mybatis, in-practice, sh]
published: true
excerpt: Mybaits 实战使用
---

# Mybaits 报错：Invalid bound statement (not found): 

## 原因

1. 方法 mapper.java 和 mapper.xml 不匹配

2. mapper.xml 中的类型，namespace，Type 等属性配置错误

3. spring 整合 mybatis 扫描包，指定扫描 package 错误。

4. mapper 没有被生成到 target 下面，需要配置 maven 的文件信息插件。

5. 今天遇到的是 idea 在创建 `com.github.houbb` 这样的文件夹时，他可能创建的只是一个文件夹 `/com.github.houbb` 而不是预期的 `com/github.houbb`

# 数据库 char() 类型查询不到

## 现象

今天数据库字段有个字段设计的是 `char(2)`，里面存储了一个字节的 char。

结果 mybatis 怎么查询都查询不到，而 SQL 直接放在数据库执行器中是没有问题的。

## 问题

后来发现是数据库会对字符进行自动补全(空格)，建议使用 `varchar()`，或者将字段调整为 `char(1)`

# 分页报错

## 现象

分页插件，报错不明确的字段。

将 SQL 直接放在执行器也没有问题。

## 原因

其实是有重复的字段导致的。单个执行没有问题，一旦加上分页的 SQL，就会导致失败。

* any list
{:toc}