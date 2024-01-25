---
layout: post
title: ORM-08-EclipseLink 入门介绍
date:  2016-05-21 18:35:52 +0800
categories: [ORM]
tags: [orm, sql, jdbc]
---

# 拓展阅读

> [The jdbc pool for java.(java 手写 jdbc 数据库连接池实现)](https://github.com/houbb/jdbc-pool)

> [The simple mybatis.（手写简易版 mybatis）](https://github.com/houbb/mybatis)


# 1. EclipseLink概述

本章介绍了EclipseLink及其关键特性：包括在EclipseLink中的组件、元数据、应用程序架构、映射和API。

本章包括以下几个部分：

理解EclipseLink

关键特性

关键概念

关键组件

关键工具

# 理解EclipseLink

EclipseLink是一个开源的映射和持久化框架，用于在Java环境中使用，包括Java平台标准版（Java SE）和Java平台企业版（Jakarta EE）。EclipseLink项目由Eclipse基金会支持。

EclipseLink完全实现了以下规范，并对这些规范进行了扩展：

## 1. Jakarta持久性API（JPA）

JPA是用于对象/关系映射（ORM）的Java API，其中Java对象被映射到数据库构件，以便在Java应用程序中管理关系数据。JPA包括Java持久性查询语言（JPQL）、Java持久性标准API和用于定义对象/关系映射元数据的Java API和XML模式。

最新版本的规范是JSR 338：Java持久性2.2。请参阅http://jcp.org/en/jsr/detail?id=338。

一些EclipseLink对标准JPA的扩展包括：对非关系（NoSQL）数据库的映射支持。在软件即服务（SaaS）环境中有用的功能，包括租户隔离、可扩展实体、外部元数据源。用于RESTful Web服务的Java API（JAX-RS，在JSR 311中定义）。许多其他额外的注解、注解扩展、Java持久性查询语言（JPQL）扩展、JPA查询定制扩展和持久性属性扩展。

## 2. Java XML绑定体系结构（JAXB）

JAXB是用于对象/XML映射（OXM）的Java API，其中XML文档基于XML文档的XSD模式绑定到Java对象。JAXB提供了将XML实例文档解组（读取）为Java内容树的方法，然后将Java内容树组合（写入）回XML实例文档。JAXB还提供了从Java对象生成XML模式的方法。

最新版本的规范是JSR 222：Java XML绑定（JAXB）2.0。请参阅http://jcp.org/en/jsr/detail?id=222。

EclipseLink JAXB实现是EclipseLink MOXy组件的一部分，它扩展了EclipseLink JAXB以支持JavaScript对象表示法（JSON）文档。EclipseLink在读取和写入JSON时支持所有对象/XML选项。MOXy还包括对旧的本机EclipseLink对象/XML API的支持。

除了上述标准规范的实现外，EclipseLink还包括以下内容：

## 3. EclipseLink数据库Web服务（DBWS）

DBWS是一种开发工具和运行时，用于通过Web服务提供符合Jakarta EE标准、客户端中立的对关系数据库构件的访问。开发工具DBWS Builder是一个命令行实用程序，它生成必要的部署构件。（DBWS Builder已集成到Eclipse Dali Java持久性工具集和Oracle JDeveloper中。）运行时提供程序获取服务描述符（以及相关的部署构件），并将其实现为JAX-WS 2.0 Web服务。运行时使用EclipseLink在数据库和Web服务客户端使用的XML SOAP消息之间进行桥接。

## 4. EclipseLink企业信息服务（EIS）

EIS是通过Java连接器体系结构（JCA）资源适配器启用对数据存储的使用的工具。使用XML元数据，配置和映射交互及其交换的数据到一个领域模型中。交互数据可以从Common Client接口（CCI）或使用XML模式进行映射。这种用法适用于非关系型数据存储，其中不提供JDBC或SQL访问。

EclipseLink可与各种Java企业版（Jakarta EE）和Java应用程序架构一起使用。使用EclipseLink设计、实现、部署和优化高级的对象持久化和对象转换层，支持各种数据源和格式，包括关系数据库、非关系（NoSQL）数据库、XML、JSON和Web服务。

EclipseLink支持在Jakarta EE、Java SE和包括与各种应用服务器的集成的Web容器中进行Java持久性，包括：

- Oracle WebLogic Server
- Oracle Glassfish Server
- JBoss Web Server
- IBM WebSphere应用服务器
- SAP NetWeaver
- Oracle Containers for Jakarta EE (OC4J)
- 其他各种Web容器，如Apache Tomcat、Eclipse Gemini、IBM WebSphere CE和SpringSource Server

EclipseLink允许您快速捕获和定义对象与数据源以及对象与数据表示的映射，采用灵活、高效的元数据格式。

运行时允许您的应用程序利用这种映射元数据，通过提供深度支持数据访问、查询、事务（具有和不具有外部事务控制器的事务）和缓存的简单会话外观。

有关EclipseLink的更多信息，请参阅“关键特性”。

## 什么是对象持久性不匹配？

在创建企业Java应用程序时，Java到数据源的集成是一个被广泛低估的问题。这个复杂的问题涉及不仅仅是从数据源读取和写入。数据源元素包括表、行、列以及主键和外键。Java和Jakarta EE编程语言包括实体类（普通Java类）、业务规则、复杂关系和继承。在非关系数据源中，您必须将Java实体与XML元素和模式进行匹配。

成功的解决方案需要桥接这些不同的技术，并解决对象持久性不匹配的问题，这是一个具有挑战性和资源密集型的问题。要解

决这个问题，您必须解决Jakarta EE和数据源元素之间的以下问题：

- 基本上是不同的技术
- 不同的技能集
- 每种技术都有不同的人员和所有权
- 不同的建模和设计原则

作为应用程序开发者，您需要一个产品，能够让您将Java应用程序与任何数据源集成，而不会影响应用程序设计或数据完整性。此外，作为Java开发者，您需要能够使用关系数据库或非关系数据源作为存储库存储（即持久化）和检索业务域对象的能力。

## EclipseLink解决方案

EclipseLink解决了Java对象和数据源之间的差异。它包含一个持久化框架，允许您构建结合对象技术最佳方面和特定数据源的应用程序。

您可以执行以下操作：

- 将Java对象持久化到几乎任何关系数据库
- 在Java对象与XML和JSON文档之间执行内存转换
- 将任何对象模型映射到任何关系或非关系模式
- 即使您不熟悉SQL或JDBC，也可以成功使用EclipseLink，因为EclipseLink提供了数据源的清晰、面向对象的视图

# 关键特性

提供了一系列广泛的功能，您可以利用这些功能快速构建高性能、可扩展和可维护的企业应用程序。

以下是一些主要特性：

1. 非侵入性、灵活、基于元数据的架构

2. 先进的映射支持和灵活性：关系型、对象关系型数据类型和XML

3. 针对高度可扩展的性能和并发进行优化，具有广泛的性能调整选项

4. 全面的对象缓存支持，包括一些应用服务器的集群集成（如Oracle Fusion Middleware Server）

5. 广泛的查询功能，包括：Java持久性查询语言（JPQL）、本机SQL和EclipseLink表达式框架

6. 即时读取

7. 对象级事务支持，并与流行的应用服务器和数据库集成

8. 乐观和悲观锁定选项以及锁定策略

有关更多信息和下载，请访问EclipseLink主页：

http://www.eclispe.org/eclipselink/

# 关键概念

本节简要介绍了文档中描述的一些关键概念。本节重点介绍的关键概念包括：

1. EclipseLink元数据

2. 实体

3. 描述符

4. 映射

5. 数据访问

6. 缓存

7. 查询

8. 表达式框架

9. NoSQL数据库

10. 性能监控和性能分析


## EclipseLink元数据

EclipseLink元数据是应用程序开发和部署运行时环境之间的桥梁。您可以使用以下方式捕获元数据：

- 在Java文件中使用JPA注解以及在persistence.xml和eclipselink-orm.xml文件中使用JPA定义的属性。

- EclipseLink JPA注解和persistence.xml文件中的属性扩展也可以捕获元数据。eclipselink-orm.xml文件还可以用于指定超出JPA规范的属性扩展。

- 在Java文件中使用JAXB注解以及在eclipselink-oxm.xml文件中使用JAXB定义的属性。

- eclipselink-oxm.xml文件可以用于定义超出JAXB规范的属性扩展。

- 使用Java和EclipseLink API。

元数据允许您将配置信息传递到运行时环境。运行时环境与持久类（如Java对象、JPA实体和使用EclipseLink API编写的代码）一起使用这些信息，以完成应用程序。有关更多信息，请参阅“使用注解添加元数据”。还请参阅Jakarta Persistence API（JPA）Extensions Reference for EclipseLink。

映射可以存储在应用程序外部。这可以简单到将eclipselink-orm.xml或eclipselink-oxm.xml文件与附加映射信息作为文件提供在Web服务器上。也可以更复杂，涉及存储映射信息并允许动态更新信息的服务器进程。有关更多信息，请参阅EclipseLink文档中的“EclipseLink/Examples/JPA/MetadataSource”。

http://wiki.eclipse.org/EclipseLink/Examples/JPA/MetadataSource


## 实体

实体是持久化域对象。通常，实体表示关系数据库中的表，每个实体实例对应表中的一行。实体的主要编程构件是实体类，尽管实体可以使用辅助类。

实体的持久状态通过持久字段或持久属性表示。这些字段或属性使用对象/关系映射注解将实体和实体关系映射到底层数据存储中的关系数据。

请参阅第4章，“理解实体”.


## 描述符

描述符描述了Java类与数据源表示的关系。它们将对象类与数据模型级别的数据源相关联。例如，持久类属性可能映射到数据库列。

EclipseLink使用描述符存储描述特定类的实例如何在数据源中表示的信息。描述符在EclipseLink内部使用，并通过注解、XML或在诸如JDeveloper或Eclipse等IDE中定义，然后在运行时读取。

请参阅第5章，“理解描述符”.


## 映射

映射描述了单个对象属性如何与数据源表示相关。映射可以涉及复杂的转换或直接输入。

EclipseLink使用映射确定如何在对象和数据源表示之间转换数据。映射在EclipseLink内部使用，并通过注解、XML或在诸如Eclipse等IDE中定义，然后在运行时从XML文件中读取。

请参阅第6章，“理解映射”.

## 数据访问

数据源平台包括特定于特定数据源的选项，包括绑定、使用本机SQL、使用批处理写入和顺序生成。

请参阅第7章，“理解数据访问”.


## 缓存

EclipseLink缓存是一个内存存储库，根据类和主键值存储最近读取或写入的对象。缓存用于通过避免不必要的数据库访问来提高性能，管理锁定和缓存隔离级别，并管理对象标识。

请参阅第8章，“理解缓存”.


## 查询

您可以在Jakarta EE和非Jakarta EE应用程序中使用查询创建、读取、更新和删除持久对象或数据，适用于关系和非关系数据源。查询可以在对象级或数据级进行。

支持多种查询语言，如Java持久性查询语言（JPQL）、SQL和表达式框架。还可以使用Java持久性标准API通过构建基于对象的查询定义对象来定义动态查询，而不是使用JPQL的基于字符串的方法。

请参阅第9章，“理解查询”.


## 表达式框架

通过使用EclipseLink表达式框架，您可以根据域对象模型指定查询搜索条件。表达式相对于SQL具有许多优势。例如，表达式更易于维护，对描述符或数据库表的更改不会影响应用程序中的查询结构，通过标准化查询接口提高可读性，并简化复杂操作。

请参阅第10章，“理解EclipseLink表达式”.


## NoSQL数据库

NoSQL是一类不支持SQL标准的数据库系统，包括文档数据库、键值存储和其他各种非标准数据库。将Java对象持久化到NoSQL数据库通过Jakarta Persistence API（JPA）得到支持。EclipseLink的本机API也支持NoSQL数据库。

请参阅第11章，“理解非关系数据源”.

## 性能监控和性能分析

提供了一组多样的功能来测量和优化应用程序性能。您可以在描述符或会话中启用

或禁用大多数功能，使任何结果性能提升成为全局性。提供了用于性能分析和性能、提取组和查询监控的工具。

请参阅EclipseLink Solutions Guide中的“Enhancing Performance”部分。

# 关键组件

图1-1展示了EclipseLink包含的组件。以下部分描述了这些组件。

## EclipseLink核心和API

EclipseLink核心提供运行时组件。通过EclipseLink API可以直接访问运行时。运行时环境不是一个独立的或外部的进程——它嵌入在应用程序中。应用程序调用激活EclipseLink以提供持久性行为。此功能使得可以事务性地、线程安全地访问共享的数据库连接和缓存对象。

EclipseLink API提供了JPA 2.0（JSR-338）的参考实现。org.eclipse.persistence.*类封装了EclipseLink API，并提供了超出规范的扩展。这些扩展包括EclipseLink特定的属性和注解。有关API、属性和扩展的更多信息，请参阅Jakarta Persistence API（JPA）Extensions Reference for EclipseLink。

JAXB API包含在Java SE 6中。在eclipselink.jar文件中，org.eclipse.persistence.jaxb.*类封装了EclipseLink对JAXB的支持。

## 对象关系（JPA 2.2）组件

JPA简化了Java持久性。它提供了一种对象关系映射方法，使您能够以一种标准、可移植的方式声明性地定义如何将Java对象映射到关系数据库表。JPA既可以在Jakarta EE应用程序服务器内部工作，也可以在Java Standard Edition（Java SE）应用程序中在EJB容器外部工作。2.2 JPA更新中包含的主要功能有：

扩展的对象/关系映射功能

对嵌入对象集合的支持

多层嵌入对象

有序列表

访问类型的组合

一个标准的查询API

查询“提示”的标准化

标准化用于支持DDL生成的附加元数据

对验证的支持

## JAXB组件

JAXB是一个Java API，允许Java程序通过以Java格式呈现文档将XML文档访问程序。这个过程，称为绑定，将XML文档中的信息表示为计算机内存中的对象。通过这种方式，应用程序可以从对象中访问XML中的数据，而不是使用Domain Object Model（DOM）或XML（SAX）的Streaming API从XML本身的直接表示中检索数据。通常，XML绑定与JPA实体一起使用，通过利用JAX-WS或JAX-RS实现来创建数据访问服务。这两个Web服务标准都使用JAXB作为默认的绑定层。此服务提供一种访问由JPA公开的跨计算机的数据的方法，其中客户端计算机可能使用或可能不使用Java。

JAXB使用一组扩展的注解来定义Java到XML映射的绑定规则。这些注解是EclipseLink API中jakarta.xml.bind.`*`包的子类。有关这些注解的更多信息，请参阅Java API Reference for EclipseLink。

有关JAXB的更多信息，请参阅：

http://www.eclipse.org/eclipselink/moxy.php

## MOXy组件

MOXy（也称为Object-XML）是EclipseLink JAXB实现。该组件使您能够将Java类绑定到XML模式。MOXy实现了JAXB，它允许您通过注解提供映射信息。MOXy提供了以XML格式存储映射的支持。许多可用的高级映射使您能够处理复杂的XML结构，而无需在Java类模型中镜像模式。

由EclipseLink JAXB编译器生成的对象是Java POJO模型。它们使用JAXB规范所需的必要注解生成。JAXB运行时API可用于对对象进行编组和解组。

使用MOXy作为JAXB提供程序时，不需要元数据即可将现有对象模型转换为XML。只有在需要微调模型的XML表示时，才可以提供元数据（使用注解或XML）。

使用EclipseLink MOXy，您可以以以下方式操作XML：

从XML模式生成Java模型

指定EclipseLink MOXy JAXB运行时

使用JAXB操作XML

从Java模型生成XML模式

有关MOXy和这些用例的更多信息，请参阅EclipseLink MOXy的JAXB应用程序开发。

EclipseLink提供了最大的灵活性，可以控制将对象模型映射到XML模式的方式。拥有对自己对象模型的控制有许多优势：

您可以使用适用于您的应用程序的适当模式和实践设计域类。

您可以使用基于XPath的映射。这样可以避免在类和XML模式类型之间具有1对1关系的需要。有关更多信息，请参阅EclipseLink MOXy的JAXB应用程序开发。

您可以以适合您的应用程序的方式实例化对象。

您可以控制自己的类路径依赖性。大多数JAXB实现在生成的类中添加供应商特定的代码，从而向您的应用程序添加类路径依赖性。

EclipseLink的一个关键优势是映射信息可以存储在外部，不需要对Java类或XML模式进行任何更改。这意味着可以将域对象映射到多个模式，或者如果模式更改，可以更新映射元数据而不是修改域类。这在映射第三方类时也很有用，因为您可能无法访问源以添加注解。

## SDO组件

服务数据对象（SDO）组件提供

了Service Data Objects版本2.1.1的参考实现。参考实现在JSR-235中描述。SDO实现结合了参考实现并提供了主要用于将Java对象转换为XML以及构建和使用可以并入服务体系结构的数据对象模型的其他功能。

SDO为您提供以下功能：

使用SDO API

转换XML模式

自定义您的XSD以供SDO使用

使用动态数据对象操纵XML

使用静态数据对象

运行SDO编译器——生成类型安全的数据对象

使用类型安全的数据对象操纵XML

有关更多信息，请参阅EclipseLink文档中的“Getting Started with EclipseLink SDO”：

http://www.eclipse.org/eclipselink/moxy.php

## 数据库Web服务组件

数据库Web服务（DBWS）通过使用Web服务简化了对关系数据库构件的简单有效访问。它提供了符合Jakarta EE的客户端中立访问数据库的方法，而无需编写Java代码。DBWS在使用现有ORM和OXM组件的同时扩展了EclipseLink的核心功能。

DBWS具有运行时提供程序组件，该组件获取服务描述符（以及相关的部署工件）并将其实现为JAX-WS 2.0 Web服务。运行时提供程序使用EclipseLink在数据库和Web服务客户端使用的XML SOAP消息之间架起桥梁。有关DBWS架构的信息，请参阅Developing Persistence Architectures Using EclipseLink Database Web Services Developer’s Guide。

# chat

## 详细介绍一下 EclipseLink

EclipseLink 是一个开源的持久化框架，用于在Java应用程序中实现对象-关系映射（ORM）。

它提供了一种将Java对象与关系型数据库之间进行映射的方式，使开发者能够使用面向对象的方式来操作数据库。

以下是 EclipseLink 的一些主要特点和功能：

1. **ORM 支持：** EclipseLink 允许开发者使用注解或 XML 配置将 Java 实体类映射到数据库表，从而实现对象与关系之间的映射。这简化了数据库操作，使开发者可以使用面向对象的方式进行数据访问。

2. **高性能：** EclipseLink 针对性能进行了优化，提供了一些高级特性，如缓存机制、延迟加载和批量读取，以提高应用程序的性能。

3. **多数据源支持：** EclipseLink 允许应用程序同时访问多个数据源，这对于需要跨多个数据库进行数据操作的应用程序非常有用。

4. **事务管理：** EclipseLink 提供了对事务的支持，包括本地事务和分布式事务。这有助于确保在数据库和应用程序之间的数据一致性。

5. **动态持久性：** EclipseLink 允许在运行时动态创建、修改和删除实体对象，而无需在编译时生成静态持久化类。

6. **JPA（Java Persistence API）兼容性：** EclipseLink 是 JPA 的参考实现之一，因此与 JPA 兼容。这意味着开发者可以使用标准的 JPA API 进行数据库操作，从而实现更好的移植性。

7. **集成开发环境支持：** EclipseLink 可以与 Eclipse IDE 集成，使开发者能够在一个集成的开发环境中进行数据库建模、实体类生成和持久化操作。

8. **广泛的数据库支持：** EclipseLink 支持多种关系型数据库，包括 Oracle、MySQL、PostgreSQL 等，并提供了对 NoSQL 数据库的支持。

总体而言，EclipseLink 是一个强大的持久化框架，为开发者提供了丰富的功能和灵活的配置选项，使得在Java应用程序中进行数据库操作变得更加方便和高效。

## 给一个 EclipseLink 入门例子

当使用 EclipseLink 进行对象-关系映射时，首先需要创建一个简单的 Java 实体类，然后使用注解或 XML 配置来定义对象与数据库表之间的映射。

以下是一个简单的 EclipseLink 入门例子，使用注解进行配置。

假设有一个简单的实体类 `Person`，代表一个人的信息：

```java
import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Person {
    @Id
    private int id;
    private String name;
    private int age;

    // 构造方法、getter和setter方法等
}
```

在这个例子中，`@Entity` 注解表示这是一个持久化实体类，`@Id` 注解表示 `id` 字段是数据库表的主键。

接下来，创建一个用于管理实体类的 Persistence Unit。可以使用 `persistence.xml` 文件进行配置，如下所示：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="http://xmlns.jcp.org/xml/ns/persistence"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/persistence http://xmlns.jcp.org/xml/ns/persistence/persistence_2_1.xsd"
             version="2.1">
    <persistence-unit name="example-unit" transaction-type="RESOURCE_LOCAL">
        <class>com.example.Person</class>
        <properties>
            <property name="javax.persistence.jdbc.url" value="jdbc:mysql://localhost:3306/your_database"/>
            <property name="javax.persistence.jdbc.user" value="your_username"/>
            <property name="javax.persistence.jdbc.password" value="your_password"/>
            <property name="javax.persistence.jdbc.driver" value="com.mysql.cj.jdbc.Driver"/>
            <property name="eclipselink.ddl-generation" value="create-tables"/>
        </properties>
    </persistence-unit>
</persistence>
```

在 `persistence.xml` 文件中，指定了实体类的位置、数据库连接信息以及 EclipseLink 的一些配置。

最后，可以编写一个简单的 Java 程序来使用 EclipseLink 进行数据库操作：

```java
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.EntityTransaction;
import javax.persistence.Persistence;

public class Main {
    public static void main(String[] args) {
        // 创建 EntityManagerFactory
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("example-unit");

        // 创建 EntityManager
        EntityManager em = emf.createEntityManager();

        // 开始事务
        EntityTransaction tx = em.getTransaction();
        tx.begin();

        // 创建一个 Person 对象并保存到数据库
        Person person = new Person();
        person.setId(1);
        person.setName("John Doe");
        person.setAge(30);
        em.persist(person);

        // 提交事务
        tx.commit();

        // 关闭 EntityManager 和 EntityManagerFactory
        em.close();
        emf.close();
    }
}
```

这个简单的例子演示了如何使用 EclipseLink 进行基本的数据库操作。

实际项目中，你可能需要更多的配置和复杂的映射关系，但这个例子可以作为一个起点，帮助你了解如何使用 EclipseLink 进行对象-关系映射。

## 介绍 EclipseLink 的优缺点

EclipseLink 是一个功能丰富的持久化框架，但如所有工具一样，它具有一些优点和缺点。以下是 EclipseLink 的主要优缺点：

### 优点：

1. **JPA 兼容性：** EclipseLink 是 Java Persistence API（JPA）的参考实现之一，因此它与 JPA 标准相兼容。

这使得在应用程序中使用标准的 JPA API 进行数据库操作更加方便，也提高了应用程序的移植性。

2. **高性能：** EclipseLink 提供了一些性能优化的特性，如缓存机制、延迟加载和批量读取，有助于提升应用程序的性能。

3. **灵活性：** EclipseLink 具有丰富的配置选项和强大的映射功能，使开发者能够更灵活地定义对象与数据库表之间的映射关系。这对于复杂的数据库模型和映射场景非常有用。

4. **多数据源支持：** EclipseLink 允许应用程序同时访问多个数据源，这对于需要跨多个数据库进行数据操作的应用程序非常有用。

5. **丰富的集成开发环境支持：** EclipseLink 可以与 Eclipse IDE 集成，为开发者提供了方便的工具和界面，用于数据库建模、实体类生成和持久化操作。

6. **广泛的数据库支持：** EclipseLink 支持多种关系型数据库，并且还提供了对 NoSQL 数据库的支持，这使得它适用于各种不同的数据库环境。

### 缺点：

1. **学习曲线：** 对于初学者来说，使用 EclipseLink 可能需要一些时间来熟悉其丰富的功能和配置选项。这可能增加了学习曲线，尤其是对于那些没有使用 ORM 框架经验的开发者。

2. **文档不足：** 尽管 EclipseLink 提供了文档，但有些用户认为文档相对较少，有时可能需要仔细查找或依赖社区支持来解决问题。

3. **复杂性：** 对于简单的项目来说，可能会觉得 EclipseLink 提供了太多功能，有时候可能会显得过于复杂。对于小规模项目，使用简单的 ORM 框架可能更为合适。

4. **社区活跃度：** 相对于一些其他 ORM 框架，EclipseLink 的社区活跃度可能相对较低。这可能导致在某些情况下获取支持和解决问题的速度较慢。

总体来说，EclipseLink 是一个强大的 ORM 框架，适用于大多数 Java 应用程序。选择使用它还是其他框架通常取决于项目的规模、复杂性以及开发者的经验水平。

## 给出 EclipseLink 的学习资料，包含网址

以下是一些学习 EclipseLink 的资料和资源，包括官方文档、教程和社区支持：

1. **官方文档：**
   - [EclipseLink Documentation](https://www.eclipse.org/eclipselink/documentation/) - EclipseLink 的官方文档包含了详细的用户指南、参考手册和示例。

2. **教程和示例：**
   - [EclipseLink Tutorials](https://wiki.eclipse.org/EclipseLink/Examples) - EclipseLink 官方 Wiki 上提供了一系列示例和教程，涵盖了从基础到高级的主题。
   - [Java EE 7 Tutorial - Persistence](https://docs.oracle.com/javaee/7/tutorial/persistence-intro.htm) - Oracle 提供的 Java EE 7 教程中包含了 EclipseLink 的持久化部分。

3. **社区支持：**
   - [EclipseLink Forums](https://www.eclipse.org/forums/index.php/f/91/) - EclipseLink 的官方论坛，可以在这里寻求帮助、提问问题和参与讨论。
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/eclipselink) - Stack Overflow 上有很多关于 EclipseLink 的问题和答案，可以在这里查找解决方案。

4. **书籍：**
   - 《Pro EclipseLink: A Professional's Guide to EclipseLink》 by Doug Clarke and Peter Krogh - 这本书提供了深入的 EclipseLink 指南，适合希望深入了解框架的开发者。

5. **视频教程：**
   - [EclipseLink JPA Tutorial](https://www.youtube.com/watch?v=pUJOHiPz4VM) - YouTube 上的 EclipseLink JPA 教程，提供了关于使用 EclipseLink 进行对象-关系映射的视频教学。

请注意，由于时间的推移，某些链接可能会发生变化。建议始终查阅官方网站以获取最新的文档和资源。

希望这些资源对你学习 EclipseLink 有所帮助！



# 参考资料

http://querydsl.com/static/querydsl/5.0.0/reference/html_single/#intro

* any list
{:toc}