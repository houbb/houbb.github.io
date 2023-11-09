---
layout: post
title:  Mybatis Plus-00-overview mybatis plus 简单介绍 mybatis+mybatis-plus+hibernate+spring jpa
date:  2018-08-19 14:51:22 +0800
categories: [ORM]
tags: [orm, sql, mybatis, sf]
published: true
---

# Mybatis Plus

[Mybatis Plus](https://github.com/baomidou/mybatis-plus) is an enhanced toolkit of Mybatis to simplify development.

## 特性

无侵入：Mybatis-Plus 在 Mybatis 的基础上进行扩展，只做增强不做改变，引入 Mybatis-Plus 不会对您现有的 Mybatis 构架产生任何影响，而且 MP 支持所有 Mybatis 原生的特性

依赖少：仅仅依赖 Mybatis 以及 Mybatis-Spring

损耗小：启动即会自动注入基本CURD，性能基本无损耗，直接面向对象操作

预防Sql注入：内置Sql注入剥离器，有效预防Sql注入攻击

通用CRUD操作：内置通用 Mapper、通用 Service，仅仅通过少量配置即可实现单表大部分 CRUD 操作，更有强大的条件构造器，满足各类使用需求

多种主键策略：支持多达4种主键策略（内含分布式唯一ID生成器），可自由配置，完美解决主键问题

支持热加载：Mapper 对应的 XML 支持热加载，对于简单的 CRUD 操作，甚至可以无 XML 启动

支持ActiveRecord：支持 ActiveRecord 形式调用，实体类只需继承 Model 类即可实现基本 CRUD 操作

支持代码生成：采用代码或者 Maven 插件可快速生成 Mapper 、 Model 、 Service 、 Controller 层代码，支持模板引擎，更有超多自定义配置等您来使用（P.S. 比 Mybatis 官方的 Generator 更加强大！）

支持自定义全局通用操作：支持全局通用方法注入（ Write once, use anywhere ）

支持关键词自动转义：支持数据库关键词（order、key......）自动转义，还可自定义关键词

内置分页插件：基于Mybatis物理分页，开发者无需关心具体操作，配置好插件之后，写分页等同于写基本List查询

内置性能分析插件：可输出Sql语句以及其执行时间，建议开发测试时启用该功能，能有效解决慢查询

内置全局拦截插件：提供全表 delete 、 update 操作智能分析阻断，预防误操作


# 其他

## Q1-介绍一下 mybatis-plus

MyBatis-Plus是一个基于MyBatis的增强工具，它简化了与数据库的交互和数据访问层的开发。

它提供了一系列的便利功能和增强特性，使得开发者能够更快速、更高效地编写和维护数据库相关的代码。

以下是MyBatis-Plus的一些主要特性：

1. CRUD操作的自动生成：MyBatis-Plus可以根据实体类自动生成常见的增删改查操作的SQL语句，减少了手动编写重复的SQL代码的工作量。

2. 条件构造器：MyBatis-Plus提供了强大的条件构造器，可以方便地构建复杂的查询条件，支持动态查询和多表关联查询。

3. 分页查询支持：MyBatis-Plus内置了分页查询的支持，可以轻松地进行分页查询操作。

4. 代码生成器：MyBatis-Plus提供了代码生成器工具，可以根据数据库表结构自动生成实体类、Mapper接口和XML映射文件，加快了项目的开发速度。

5. 逻辑删除：MyBatis-Plus支持逻辑删除功能，可以通过配置实现数据的软删除，提高了数据安全性和可维护性。

6. 乐观锁支持：MyBatis-Plus提供了乐观锁的支持，可以通过版本号或时间戳等方式实现数据的并发控制。

7. 自动填充：MyBatis-Plus支持自动填充功能，可以在插入或更新操作时自动填充指定的字段，如创建时间、更新时间等。

8. 动态表名和字段名：MyBatis-Plus支持动态表名和字段名的配置，可以根据运行时的条件动态切换表名和字段名。

总的来说，MyBatis-Plus是一个强大的MyBatis增强工具，它简化了与数据库的交互和数据访问层的开发，提供了丰富的功能和增强特性，可以大幅提高开发效率和代码质量。

## Q2-已经有 mybatis 了，为什么还需要 mybatis-plug?

MyBatis-Plus是基于MyBatis的增强工具，它在MyBatis的基础上提供了更多的便利功能和增强特性。

虽然MyBatis本身已经是一个强大的持久层框架，但MyBatis-Plus的出现是为了进一步简化和优化开发过程。

以下是一些使用MyBatis-Plus的理由：

1. 简化开发：MyBatis-Plus提供了自动生成SQL语句的功能，可以根据实体类自动生成常见的增删改查操作，减少了手动编写重复的SQL代码的工作量。这样可以提高开发效率，缩短开发周期。

2. 提供便捷的查询功能：MyBatis-Plus内置了强大的条件构造器，可以方便地构建复杂的查询条件，支持动态查询和多表关联查询。这样可以简化查询操作，减少手动拼接SQL的工作。

3. 提供额外的功能支持：MyBatis-Plus还提供了分页查询支持、逻辑删除、乐观锁、自动填充等功能。这些功能可以减少开发者的工作量，提高代码的可维护性和可读性。

4. 代码生成器：MyBatis-Plus提供了代码生成器工具，可以根据数据库表结构自动生成实体类、Mapper接口和XML映射文件。这样可以加快项目的开发速度，减少手动编写代码的工作。

尽管MyBatis已经是一个功能强大的持久层框架，但MyBatis-Plus在其基础上提供了更多的便利功能和增强特性，可以进一步简化和优化开发过程，提高开发效率和代码质量。因此，如果您正在使用MyBatis，可以考虑使用MyBatis-Plus来提升开发效率和代码质量。

## Q3-mybatis 和 hibernate 的区别是什么？如何选择

MyBatis和Hibernate是两个常用的持久层框架，它们在一些方面有所不同。

下面是它们之间的一些区别和如何选择的考虑因素：

1. 编程模型：
   - MyBatis：MyBatis是一种基于SQL的持久层框架，它使用XML或注解来映射Java对象和数据库表。开发者需要手动编写SQL语句，并使用MyBatis提供的API执行SQL查询和操作。
   - Hibernate：Hibernate是一种基于对象关系映射（ORM）的持久层框架，它通过映射Java对象和数据库表来实现数据访问。开发者不需要编写SQL语句，Hibernate会自动生成SQL，并提供API来执行查询和操作。

2. 数据库访问控制：
   - MyBatis：MyBatis提供了更细粒度的数据库访问控制，开发者可以更好地控制SQL语句的编写和执行过程，适用于对SQL有更高要求的场景。
   - Hibernate：Hibernate提供了更高级的数据库访问控制，它可以自动处理数据库的增删改查操作，开发者无需编写SQL语句，适用于快速开发和简化数据访问的场景。

3. 性能和灵活性：
   - MyBatis：MyBatis相对较轻量，执行SQL的性能较高，适用于对性能要求较高的场景。同时，MyBatis提供了更大的灵活性，可以编写复杂的SQL查询和自定义的映射规则。
   - Hibernate：Hibernate相对较重，执行查询和操作的性能较低，但它提供了更多的高级特性和自动化功能，适用于快速开发和简化数据访问的场景。

4. 技术栈和团队技能：
   - MyBatis：MyBatis更贴近SQL，对于熟悉SQL和数据库的开发者来说更容易上手。如果您的团队已经熟悉SQL和数据库操作，那么选择MyBatis可能更合适。
   - Hibernate：Hibernate更贴近面向对象的编程，对于熟悉Java和面向对象编程的开发者来说更容易上手。如果您的团队已经熟悉Java和面向对象编程，那么选择Hibernate可能更合适。

综上所述，选择MyBatis还是Hibernate取决于您的具体需求、团队技能和项目特点。

如果您对SQL有较高的要求、需要更大的灵活性或对性能有较高的需求，可以选择MyBatis。

如果您希望快速开发、简化数据访问或团队已经熟悉Java和面向对象编程，可以选择Hibernate。

## Q4-mybatis 和 spring jpa 对比起来如何？

MyBatis和Spring Data JPA（简称为Spring JPA）是两个常用的持久层框架，它们在一些方面有所不同。

下面是它们之间的一些对比：

1. 编程模型：
   - MyBatis：MyBatis是一种基于SQL的持久层框架，开发者需要手动编写SQL语句，并使用MyBatis提供的API执行SQL查询和操作。MyBatis提供了更细粒度的数据库访问控制和灵活性，适用于对SQL有更高要求的场景。
   - Spring JPA：Spring JPA是Spring框架中的一部分，它基于JPA（Java Persistence API）标准，通过对象关系映射（ORM）来实现数据访问。Spring JPA提供了更高级的数据库访问控制和自动化功能，开发者无需编写SQL语句，适用于快速开发和简化数据访问的场景。

2. 数据访问方式：
   - MyBatis：MyBatis使用XML或注解来映射Java对象和数据库表，开发者需要手动编写SQL语句，并使用MyBatis提供的API执行查询和操作。MyBatis提供了更大的灵活性和自定义能力，可以编写复杂的SQL查询和自定义的映射规则。
   - Spring JPA：Spring JPA使用注解和命名约定来映射Java对象和数据库表，开发者无需编写SQL语句，Spring JPA会自动生成SQL，并提供API来执行查询和操作。Spring JPA提供了更高级的自动化功能，简化了数据访问的过程。

3. 技术栈和集成：
   - MyBatis：MyBatis是一个独立的持久层框架，可以与任何Java框架（如Spring）集成使用。它与Spring集成时，可以通过Spring的事务管理和依赖注入等功能来增强开发体验。
   - Spring JPA：Spring JPA是Spring框架的一部分，提供了与Spring的无缝集成。它可以与其他Spring组件（如Spring Boot）一起使用，享受Spring的事务管理、依赖注入等功能。

4. 生态系统和社区支持：
   - MyBatis：MyBatis拥有庞大的生态系统和活跃的社区支持，提供了丰富的插件和工具，可以满足各种需求。它可以与各种数据库（如MySQL、Oracle、PostgreSQL等）无缝集成。
   - Spring JPA：Spring JPA是Spring框架的一部分，与Spring生态系统紧密集成。它可以与Spring Boot等其他Spring项目无缝集成，并享受Spring提供的各种功能和工具。

综上所述，选择MyBatis还是Spring JPA取决于您的具体需求、技术栈和项目特点。

如果您对SQL有较高的要求、需要更大的灵活性或对MyBatis已经熟悉，可以选择MyBatis。

如果您希望快速开发、简化数据访问或已经使用Spring框架，可以选择Spring JPA。

# 想法

重复的轮子总是被制造，所以我们应该学着去完善轮着。

比如 mybatis-plus。

# 参考资料

chat

* any list
{:toc}
