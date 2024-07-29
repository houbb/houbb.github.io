---
layout: post
title:  手写 Hibernate ORM 框架 00-hibernate 简介
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---


# 手写 Hibernate 系列

[手写 Hibernate ORM 框架 00-hibernate 简介](https://houbb.github.io/2020/06/21/hand-write-hibernate-00-intro)

[手写 Hibernate ORM 框架 00-环境准备](https://houbb.github.io/2020/06/21/hand-write-hibernate-00-overview)

[手写 Hibernate ORM 框架 01-注解常量定义](https://houbb.github.io/2020/06/21/hand-write-hibernate-01-annotation)

[手写 Hibernate ORM 框架 02-实体 Bean 定义，建表语句自动生成](https://houbb.github.io/2020/06/21/hand-write-hibernate-02-bean)

[手写 Hibernate ORM 框架 03-配置文件读取, 数据库连接构建](https://houbb.github.io/2020/06/21/hand-write-hibernate-03-config)

[手写 Hibernate ORM 框架 04-持久化实现](https://houbb.github.io/2020/06/21/hand-write-hibernate-04-persist)

[手写 Hibernate ORM 框架 05-整体效果测试验证](https://houbb.github.io/2020/06/21/hand-write-hibernate-05-test)

## 从零手写组件系列

[java 从零手写 spring ioc 控制反转](https://github.com/houbb/ioc)

[java 从零手写 spring mvc](https://github.com/houbb/mvc)

[java 从零手写 jdbc-pool 数据库连接池](https://github.com/houbb/jdbc-pool)

[java 从零手写 mybatis](https://github.com/houbb/mybatis)

[java 从零手写 hibernate](https://github.com/houbb/hibernate)

[java 从零手写 rpc 远程调用](https://github.com/houbb/rpc)

[java 从零手写 mq 消息组件](https://github.com/houbb/rpc)

[java 从零手写 cache 缓存](https://github.com/houbb/cache)

[java 从零手写 nginx4j](https://github.com/houbb/nginx4j)

[java 从零手写 tomcat](https://github.com/houbb/minicat)

# 前言

类似的还有其他系列，主要用于学习其中的原理。

Hibernate 属于比较早的框架了，后期将实现一套 mybatis。

在开始实现 hibernate 之前，我们先熟悉一下 hibernate。

## hibernate 是什么？

Hibernate 是一个流行的开源对象关系映射（ORM）框架，它用于简化 Java 应用程序与关系型数据库之间的交互。

Hibernate 将 Java 类映射到数据库表，将 Java 对象的属性映射到表中的列，从而使开发人员可以使用面向对象的编程方式来操作数据库。以下是 Hibernate 的一些关键特性和工作原理：

### 关键特性

1. **对象-关系映射（ORM）**：
   - Hibernate 提供了强大的映射功能，可以将 Java 对象与数据库表进行映射。这包括基本数据类型、集合、继承、关联（如一对一、一对多、多对多）等复杂映射。

2. **自动生成 SQL**：
   - Hibernate 自动生成 SQL 查询，以便将对象数据存储到数据库中，或从数据库中检索数据。这减少了开发人员编写 SQL 查询的负担。

3. **缓存机制**：
   - Hibernate 支持一级缓存（Session 缓存）和二级缓存（SessionFactory 缓存），提高了数据访问性能。

4. **数据库无关性**：
   - Hibernate 支持多种数据库，可以通过配置轻松切换数据库，而无需修改应用程序代码。

5. **查询语言（HQL）**：
   - Hibernate 提供了 Hibernate Query Language（HQL），它是一种面向对象的查询语言，类似于 SQL，但操作的是类和属性，而不是表和列。

6. **事务管理**：
   - Hibernate 集成了 Java 事务 API（JTA），支持声明式事务管理。

7. **数据验证**：
   - Hibernate 支持在持久化操作之前验证数据，确保数据的一致性和完整性。

### 工作原理

1. **配置文件**：
   - Hibernate 的核心配置文件是 `hibernate.cfg.xml`，它包含了数据库连接信息、Hibernate 属性以及映射文件的位置。
   - 映射文件（如 `User.hbm.xml`）定义了 Java 类与数据库表之间的映射关系。

2. **SessionFactory**：
   - `SessionFactory` 是 Hibernate 的核心接口，用于创建 `Session` 对象。它是线程安全的，通常在应用程序启动时创建，并在整个应用程序生命周期内使用。

3. **Session**：
   - `Session` 是 Hibernate 与数据库交互的主要接口。它负责执行 CRUD 操作、查询、事务管理等。`Session` 不是线程安全的，通常在每个线程中创建一个新的 `Session`。

4. **事务管理**：
   - Hibernate 提供了对事务的支持，可以通过 `Session.beginTransaction()` 开启事务，通过 `Transaction.commit()` 或 `Transaction.rollback()` 提交或回滚事务。

5. **持久化操作**：
   - Hibernate 提供了多种持久化操作方法，如 `save()`, `update()`, `delete()`, `get()`, `load()` 等，用于将对象状态与数据库同步。

6. **查询**：
   - Hibernate 支持使用 HQL 进行查询，同时也支持使用 Criteria API 和原生 SQL 查询。

## 入门例子

以下是一个简单的示例，展示了如何使用 Hibernate 进行基本的 CRUD 操作：

#### 配置文件（hibernate.cfg.xml）

```xml
<!DOCTYPE hibernate-configuration PUBLIC "-//Hibernate/Hibernate Configuration DTD 3.0//EN" "http://hibernate.sourceforge.net/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
    <session-factory>
        <property name="hibernate.dialect">org.hibernate.dialect.MySQLDialect</property>
        <property name="hibernate.connection.driver_class">com.mysql.cj.jdbc.Driver</property>
        <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/your_database</property>
        <property name="hibernate.connection.username">your_username</property>
        <property name="hibernate.connection.password">your_password</property>
        <property name="hibernate.hbm2ddl.auto">update</property>
        <mapping class="com.example.User"/>
    </session-factory>
</hibernate-configuration>
```

#### 映射类（User.java）

```java
package com.example;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class User {
    @Id
    private int id;
    private String name;

    // Getters and setters
    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
}
```

#### 主类（Main.java）

```java
package com.example;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;

public class Main {
    public static void main(String[] args) {
        // 创建 SessionFactory
        SessionFactory sessionFactory = new Configuration().configure().buildSessionFactory();
        
        // 创建 Session
        Session session = sessionFactory.openSession();
        
        // 开启事务
        Transaction transaction = session.beginTransaction();
        
        // 创建新用户对象
        User user = new User();
        user.setId(1);
        user.setName("John Doe");
        
        // 保存用户对象到数据库
        session.save(user);
        
        // 提交事务
        transaction.commit();
        
        // 关闭 Session
        session.close();
        
        // 关闭 SessionFactory
        sessionFactory.close();
    }
}
```

这个示例展示了如何配置 Hibernate，定义实体类，并通过 Hibernate 将一个用户对象保存到数据库中。

通过这种方式，Hibernate 简化了数据库操作，提高了开发效率。

## hibernate 有哪些优秀的设计？

Hibernate 是一个流行的Java持久化框架，它通过提供对象/关系映射（ORM）功能，简化了Java应用程序与关系数据库的交互。

以下是Hibernate的一些优秀设计特点：

1. **自动且透明的对象/关系映射**：Hibernate允许开发者像操作普通Java对象一样与数据库打交道，而无需考虑底层的SQL语句，从而解放了开发者，使他们能够专注于应用程序的对象和功能。

2. **轻量级解决方案**：Hibernate是一个轻量级的ORM解决方案，它避免了一些商业产品或EJB标准的复杂性，使得开发人员不需要修改对象的行为方式，只需创建XML映射文档即可。

3. **灵活的查询方式**：Hibernate提供了HQL（Hibernate Query Language）和Criteria API，使得开发者可以以面向对象的方式编写查询，同时它也支持原生SQL操作，增加了灵活性。

4. **动态构建Java类**：Hibernate在运行时读取映射文档，动态构建Java类来管理数据库与Java之间的转换，提供了简单直观的API来执行查询和数据操作。

5. **代码与数据库无关**：使用Hibernate，开发者编写的代码不需要关心使用的数据库种类，这在数据库厂商更换时尤其有用，只需修改Hibernate配置文件即可。

6. **丰富的映射策略**：Hibernate支持基本和高级的映射选项，包括处理继承、集合以及复杂类关联，同时也支持遗留数据库模式的集成。

7. **事务性数据处理**：Hibernate提供了编程接口和方法来编写事务性应用程序，并有效从数据库加载数据。

8. **分层和有会话意识的设计**：Hibernate支持分层和有会话意识的Java数据库应用程序的设计与实现，常用设计模式如Data Access Object（DAO）模式，使得Hibernate应用程序易于测试，并遵循最佳实践。

9. **Hibernate工具集**：Hibernate提供了一套工具集，支持不同的工作流，如从映射文档生成数据库表，从映射文档生成数据类，以及反向设计数据库和类来拟定映射文档。

10. **Hibernate社区和文档**：Hibernate拥有活跃的开源社区和详尽的文档，包括中文文档，为开发者提供了丰富的资源和支持。

这些设计特点使得Hibernate成为一个强大且灵活的持久化框架，适用于各种规模和复杂度的Java应用程序。

## 为什么国内 hibernate 没有 mybatis 火爆？

国内MyBatis比Hibernate更火爆的原因可以从以下几个方面进行分析：

1. **技术特点**：
   - **灵活性**：MyBatis更加灵活，支持定制化SQL、存储过程以及高级映射，使得开发者可以根据实际需求进行定制。相比之下，Hibernate提供了更多的自动映射和查询功能，但同时也需要更多的配置。在国内的开发环境中，由于项目需求多样化，开发者更倾向于选择灵活性更高的框架。
   - **SQL控制**：MyBatis允许开发人员直接编写SQL语句，提供了更直观的数据库访问控制，适合需要定制化SQL语句的场景。而Hibernate则通过对象关系映射（ORM）自动生成SQL语句，减少了开发人员手动编写SQL的工作量。

2. **社区支持**：
   - MyBatis的社区规模和活跃度在国内明显优于Hibernate。MyBatis有更多的国内技术博客、开源项目以及社区支持，这使得开发者在学习、交流和解决问题时更加方便。而Hibernate虽然也有一定的社区支持，但在国内相对较为有限。

3. **实际应用案例**：
   - MyBatis在国内的应用案例比Hibernate更多。很多知名的互联网公司都在使用MyBatis作为持久层框架，这也促使了更多开发者选择MyBatis。同时，一些开源项目也倾向于使用MyBatis，这进一步推动了MyBatis在国内的流行。

4. **开发速度和工作量**：
   - MyBatis框架相对简单，容易上手，适合快速开发。虽然Hibernate在基本的增删改查操作上更为便捷，但在复杂查询和大型项目中，MyBatis的灵活性和直接控制SQL的能力使其更受欢迎。
   - Hibernate的配置和学习成本较高，需要更多的时间来掌握，而MyBatis则相对简单，易于学习和使用。

5. **SQL优化和缓存机制**：
   - MyBatis的SQL是手动编写的，因此可以按需求指定查询的字段，优化SQL比Hibernate方便很多。而Hibernate生成的SQL语句较为复杂，可能会影响查询性能。
   - 在缓存机制上，MyBatis的二级缓存配置可以在每个具体的表-对象映射中进行详细配置，而Hibernate的二级缓存配置则在SessionFactory生成的配置文件中进行详细配置。MyBatis的缓存机制在某些情况下可能更灵活。

6. **项目需求和团队偏好**：
   - 在实际项目中，开发人员可以根据项目需求和团队技术栈选择合适的持久化框架。如果项目需求多样化且需要定制化开发，MyBatis可能是一个更好的选择；如果团队更倾向于全面、自动化的解决方案，Hibernate可能更适合项目需求。

综上所述，MyBatis在国内的流行主要归因于其灵活性、社区支持、实际应用案例的优势以及较低的学习门槛和开发成本。

而Hibernate虽然在某些方面也有其独特的优点，但在国内市场中，MyBatis更能满足开发者的需求。

* any list
{:toc}