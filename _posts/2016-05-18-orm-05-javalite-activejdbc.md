---
layout: post
title: ORM-05-javalite activejdbc
date:  2016-05-21 18:35:52 +0800
categories: [ORM]
tags: [orm, sql, jdbc]
---

# 拓展阅读

> [The jdbc pool for java.(java 手写 jdbc 数据库连接池实现)](https://github.com/houbb/jdbc-pool)

> [The simple mybatis.（手写简易版 mybatis）](https://github.com/houbb/mybatis)


# ActiveJDBC

[ActiveJDBC](http://javalite.io/record_selection) 可以直接通过读取表的信息，来处理数据库相关操作。

## 优点

java model 中不需要任何的属性，全部是动态反射的。

- 缺点

是否性能比较差？

其实也不是，可以在服务启动的时候，去数据库将对应的信息全部加载。

- 基于继承

```java
public class Person extends Model {}
```

继承使得当前类拥有非常强大的能力。

但其实是否有必要使用继承？如果使用方法+聚合的方式会更减少依赖吗？

- 对于 CRUD+Page 支持的比较好。

```java
List<Employee> people = Employee.where("department = ? and hire_date > ? ", "IT", hireDate)
    .offset(21)
    .limit(10)
    .orderBy("hire_date asc");
```

这套 fluent-api 设计的也非常好。

- 支持多种数据库


# 快速开始

http://javalite.io/getting_started

# 感受 

感觉这个工具对于单表的支持特别好。

# QueryDSL

http://www.querydsl.com/ 感觉是一套非常优雅的SQL编写规范。

直接通过 java 拼接处 SQL。

* any list
{:toc}