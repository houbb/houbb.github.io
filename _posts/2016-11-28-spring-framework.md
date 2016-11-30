---
layout: post
title: Spring Framework
date:  2016-11-28 23:37:26 +0800
categories: [Spring]
tags: [spring framework]
published: false
---

* any list
{:toc}

# Spring Framework


The [Spring Framework](http://docs.spring.io/spring/docs/4.2.7.RELEASE/spring-framework-reference/htmlsingle/)
is a lightweight solution and a potential one-stop-shop for building your enterprise-ready applications.


# Transaction propagation

> [propagation zh_CN](https://my.oschina.net/QAAQ/blog/661099)

| Propagation           |   Desc        |
| :-------------------- |:----------    |
|PROPAGATION_REQUIRED               |如果当前没有事务，就新建一个事务，如果已经存在一个事务中，加入到这个事务中   |
|PROPAGATION_PROPAGATION_SUPPORTS   |支持当前事务，如果当前没有事务，就以非事务方式执行   |
|PROPAGATION_MANDATORY              |使用当前的事务，如果当前没有事务，就抛出异常   |
|PROPAGATION_REQUIRES_NEW           |新建事务，如果当前存在事务，把当前事务挂起   |
|PROPAGATION_NOT_SUPPORTED          |以非事务方式执行操作，如果当前存在事务，就把当前事务挂起   |
|PROPAGATION_NEVER                  |以非事务方式执行，如果当前存在事务，则抛出异常   |
|PROPAGATION_PROPAGATION_NESTED     |如果当前存在事务，则在嵌套事务内执行。如果当前没有事务，则执行与PROPAGATION_REQUIRED类 似的操作   |


# Isolation


