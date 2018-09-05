---
layout: post
title:  JPA
date:  2018-09-03 11:07:56 +0800
categories: [Protocol]
tags: [database, protocol, api, TODO, sh]
published: true
excerpt: JPA 标准讲解。
---

# JPA

JPA是Java Persistence API的简称，中文名Java持久层API，是JDK 5.0注解或XML描述对象－关系表的映射关系，并将运行期的实体对象持久化到数据库中。 

## 目的

Sun引入新的JPA ORM规范出于两个原因：

其一，简化现有Java EE和Java SE应用开发工作；

其二，Sun希望整合ORM技术，实现天下归一。

# JPA 批注参考

## @Entity

`@Entity` 标注用于实体类声明语句之前，指出该Java 类为实体类，将映射到指定的数据库表。

如声明一个实体类 Customer，它将映射到数据库中的 customer 表上。

## @Table

当实体类与其映射的数据库表名不同名时需要使用 `@Table` 标注说明，该标注与 @Entity 标注并列使用，置于实体类声明语句之前，可写于单独语句行，也可与声明语句同行。

@Table 标注的常用选项是 name，用于指明数据库的表名

@Table 标注还有一个两个选项 catalog 和 schema 用于设置表所属的数据库目录或模式，通常为数据库名。uniqueConstraints 选项用于设置约束条件，通常不须设置。

## @Id

`@Id` 标注用于声明一个实体类的属性映射为数据库的主键列。

该属性通常置于属性声明语句之前，可与声明语句同行，也可写在单独行上。

@Id 标注也可置于属性的getter方法之前。

## @GeneratedValue

@GeneratedValue  用于标注主键的生成策略，通过 strategy 属性指定。

默认情况下，JPA 自动选择一个最适合底层数据库的主键生成策略：SqlServer 对应 identity，MySQL 对应 auto increment。

在 javax.persistence.GenerationType 中定义了以下几种可供选择的策略：

- IDENTITY：采用数据库 ID自增长的方式来自增主键字段，Oracle 不支持这种方式；

- AUTO： JPA自动选择合适的策略，是默认选项；

- SEQUENCE：通过序列产生主键，通过 @SequenceGenerator 注解指定序列名，MySql 不支持这种方式

- TABLE：通过表产生主键，框架借由表模拟序列产生主键，使用该策略可以使应用更易于数据库移植。

## @Basic

`@Basic` 表示一个简单的属性到数据库表的字段的映射，对于没有任何标注的 getXxxx() 方法，默认即为 @Basic

fetch: 表示该属性的读取策略，有 EAGER 和 LAZY 两种,分别表示主支抓取和延迟加载，默认为 EAGER.

optional: 表示该属性是否允许为 null，默认为 true 

## @Column

当实体的属性与其映射的数据库表的列不同名时需要使用 `@Column` 标注说明，该属性通常置于实体的属性声明语句之前，还可与 @Id 标注一起使用。

@Column 标注的常用属性是 name，用于设置映射数据库表的列名。此外，该标注还包含其它多个属性，如：unique 、nullable、length等。

@Column 标注的 columnDefinition 属性: 表示该字段在数据库中的实际类型.

通常 ORM 框架可以根据属性类型自动判断数据库中字段的类型, 但是对于Date类型仍无法确定数据中字段类型究竟是DATE,TIME还是TIMESTAMP。

此外,String的默认映射类型为VARCHAR, 如果要将 String 类型映射到特定数据库的 BLOB 或TEXT 字段类型.

@Column标注也可置于属性的 getter 方法之前

## @Transient

表示该属性并非一个到数据库表的字段的映射,ORM框架将忽略该属性.

如果一个属性并非数据库表的字段映射,就务必将其标示为 `@Transient`, 否则, ORM框架默认其注解为 `@Basic`

# 实战

TODO:

# 参考资料

- jpa

[JPA 批注参考](https://www.oracle.com/technetwork/cn/java/toplink-jpa-annotations-100895-zhs.html)

https://baike.baidu.com/item/JPA

https://blog.csdn.net/oChangWen/article/details/52788274

- spring

https://spring.io/projects/spring-data-jpa

[spring-data-jpa](https://docs.spring.io/spring-data/jpa/docs/2.0.9.RELEASE/reference/html/)

[使用 Spring Data JPA 简化 JPA 开发](https://www.ibm.com/developerworks/cn/opensource/os-cn-spring-jpa/index.html)

https://www.baeldung.com/spring-data-jpa-multiple-databases

[初识在Spring Boot中使用JPA](https://blog.csdn.net/u012702547/article/details/53946440)

* any list
{:toc}