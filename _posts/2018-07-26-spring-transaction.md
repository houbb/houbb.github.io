---
layout: post
title:  Spring Transaction
date:  2018-07-26 11:07:50 +0800
categories: [Spring]
tags: [spring, java, database, transaction, sf]
published: true
---


# 事务

# Spring 事务介绍

## 优势

全面的事务支持是使用Spring框架的最引人注目的原因之一。

Spring 框架为事务管理提供了一致的抽象，提供了以下好处:

1. 跨不同事务API(如Java事务API (JTA)、JDBC、Hibernate和Java持久性API (JPA)的一致编程模型。

2. 支持声明式事务管理。

编程事务管理的API比复杂的事务API(如JTA)更简单。

出色地集成了Spring的数据访问抽象。

下面几节将描述Spring框架的事务增值和技术。(本章还讨论了最佳实践、应用服务器集成和常见问题的解决方案。)

Spring框架的事务支持模型的优点描述了为什么要使用Spring框架的事务抽象而不是EJB容器管理事务(CMT)，或者选择通过私有API(如Hibernate)来驱动本地事务。

了解Spring框架事务抽象概括了核心类，并描述了如何从各种来源配置和获取数据源实例。

将资源与事务同步描述了应用程序代码如何确保资源被正确地创建、重用和清理。

声明性事务管理描述对声明性事务管理的支持。

程序化事务管理包含对程序化(即显式编码)事务管理的支持。

事务绑定事件描述如何在事务中使用应用程序事件。


# 只读事务

## 问题

Spring 当中的 `@Transactional(readOnly = true)` 意义？

## 回答

如果你一次执行单条查询语句，则没有必要启用事务支持，数据库默认支持SQL执行期间的读一致性； 

如果你一次执行多条查询语句，例如统计查询，报表查询，在这种场景下，多条查询SQL必须保证整体的读一致性，否则，在前条SQL查询之后，后条SQL查询之前，数据被其他用户改变，则该次整体的统计查询将会出现读数据不一致的状态，此时，应该启用事务支持
`read-only="true"` 表示该事务为只读事务，比如上面说的多条查询的这种情况可以使用只读事务，

由于只读事务不存在数据的修改，因此数据库将**会为只读事务提供一些优化手段**

例如Oracle对于只读事务，不启动回滚段，不记录回滚log。

（1）在JDBC中，指定只读事务的办法为： `connection.setReadOnly(true);`

（2）在Hibernate中，指定只读事务的办法为： `session.setFlushMode(FlushMode.NEVER); `

此时，Hibernate也会为只读事务提供Session方面的一些优化手段

（3）在Spring的Hibernate封装中，指定只读事务的办法为： 

bean配置文件中，prop属性增加 `read-Only`

或者用注解方式 `@Transactional(readOnly=true)`

Spring中设置只读事务是利用上面两种方式（根据实际情况）

在将事务设置成只读后，相当于将数据库设置成只读数据库，此时若要进行写的操作，会出现错误。


# 参考资料

- spring 事务

[spring transaction](https://docs.spring.io/spring/docs/5.0.7.RELEASE/spring-framework-reference/data-access.html#transaction)

http://tech.lede.com/2017/02/06/rd/server/SpringTransactional/


- 只读事务

https://blog.csdn.net/yulin_ganbo/article/details/78566835

https://my.oschina.net/uniquejava/blog/80954

https://www.zhihu.com/question/39074428

* any list
{:toc}