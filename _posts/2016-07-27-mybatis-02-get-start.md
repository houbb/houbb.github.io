---
layout: post
title: Mybatis-02-Getting started 入门教程
date:  2016-07-27 10:40:05 16:09:17 +0800
categories: [SQL]
tags: [mybatis, database]
published: true
---

# 安装

要使用MyBatis，您只需要将mybatis-x.x.x.jar文件包含在类路径中。

如果您正在使用Maven，只需将以下依赖项添加到您的pom.xml文件中：

```xml
<dependency>
  <groupId>org.mybatis</groupId>
  <artifactId>mybatis</artifactId>
  <version>x.x.x</version>
</dependency>
```

# Building SqlSessionFactory from XML

每个MyBatis应用程序都围绕着一个SqlSessionFactory实例展开。

可以通过使用SqlSessionFactoryBuilder获取SqlSessionFactory实例。

SqlSessionFactoryBuilder可以从XML配置文件或自定义的Configuration类的准备实例构建SqlSessionFactory实例。

从XML文件构建SqlSessionFactory实例非常简单。建议您使用类路径资源进行此配置，但也可以使用任何InputStream实例，包括从字面文件路径或file://URL创建的实例。

MyBatis包含一个实用类，名为Resources，其中包含一些方法，使从类路径和其他位置加载资源变得更简单。

```java
String resource = "org/mybatis/example/mybatis-config.xml";
InputStream inputStream = Resources.getResourceAsStream(resource);
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
```

配置XML文件包含了MyBatis系统的核心设置，包括用于获取数据库连接实例的DataSource，以及确定事务的范围和控制方式的TransactionManager。

XML配置文件的详细内容可以在本文档后面找到，但这里是一个简单的示例：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
  PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
  <environments default="development">
    <environment id="development">
      <transactionManager type="JDBC"/>
      <dataSource type="POOLED">
        <property name="driver" value="${driver}"/>
        <property name="url" value="${url}"/>
        <property name="username" value="${username}"/>
        <property name="password" value="${password}"/>
      </dataSource>
    </environment>
  </environments>
  <mappers>
    <mapper resource="org/mybatis/example/BlogMapper.xml"/>
  </mappers>
</configuration>
```

虽然XML配置文件还有很多内容，但上面的示例指出了最关键的部分。

请注意XML头部，用于验证XML文档。环境元素的主体包含了事务管理和连接池的环境配置。

映射器元素包含了映射器的列表，即包含SQL代码和映射定义的XML文件和/或带有注解的Java接口类。

# 在不使用XML的情况下构建SqlSessionFactory

如果您更喜欢直接从Java代码中构建配置，而不是使用XML，或者创建自己的配置构建器，MyBatis提供了一个完整的Configuration类，它提供了与XML文件相同的所有配置选项。

```java
DataSource dataSource = BlogDataSourceFactory.getBlogDataSource();
TransactionFactory transactionFactory = new JdbcTransactionFactory();
Environment environment = new Environment("development", transactionFactory, dataSource);
Configuration configuration = new Configuration(environment);
configuration.addMapper(BlogMapper.class);
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(configuration);
```

请注意，在这种情况下，配置正在添加一个映射器类。 

映射器类是包含 SQL 映射注释的 Java 类，避免了对 XML 映射的需要。 

但是，由于 Java Annotations 的一些限制和一些 MyBatis 映射的复杂性，对于最高级的映射（例如 Nested Join Mapping），仍然需要 XML 映射。 

因此，MyBatis 将自动查找并加载一个对等 XML 文件（如果存在）（在这种情况下，BlogMapper.xml 将根据 BlogMapper.class 的类路径和名称进行加载）。 

稍后会详细介绍。

# 从 SqlSessionFactory 获取 SqlSession

现在您有了 SqlSessionFactory，顾名思义，您可以获取 SqlSession 的实例。 

SqlSession 绝对包含对数据库执行 SQL 命令所需的所有方法。 

您可以直接针对 SqlSession 实例执行映射的 SQL 语句。 

例如：

```java
try (SqlSession session = sqlSessionFactory.openSession()) {
  Blog blog = session.selectOne(
    "org.mybatis.example.BlogMapper.selectBlog", 101);
}
```

虽然这种方法有效，并且为 MyBatis 以前版本的用户所熟悉，但现在有一种更简洁的方法。 

使用正确描述给定语句的参数和返回值的接口（例如 BlogMapper.class），您现在可以执行更清晰、类型更安全的代码，而不会出现容易出错的字符串文字和强制转换。

例如：

```java
try (SqlSession session = sqlSessionFactory.openSession()) {
  BlogMapper mapper = session.getMapper(BlogMapper.class);
  Blog blog = mapper.selectBlog(101);
}
```

# 探索映射的 SQL 语句

此时您可能想知道 SqlSession 或 Mapper 类到底在执行什么。 

映射的 SQL 语句是一个很大的主题，该主题可能会占据本文档的大部分内容。 

但为了让您了解到底在运行什么，这里有几个例子。

在上面的任何一个示例中，语句都可以由 XML 或注释定义。 

我们先来看看 XML。 

MyBatis 提供的全套功能可以通过使用使 MyBatis 流行多年的基于 XML 的映射语言来实现。 

如果你以前使用过 MyBatis，这个概念对你来说会很熟悉，但是对 XML 映射文档有很多改进，稍后就会变得清晰。 

下面是满足上述 SqlSession 调用的基于 XML 的映射语句的示例。

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="org.mybatis.example.BlogMapper">
  <select id="selectBlog" resultType="Blog">
    select * from Blog where id = #{id}
  </select>
</mapper>
```

虽然对于这个简单的示例来说，这看起来开销很大，但实际上很轻。 

您可以在单个映射器 XML 文件中定义尽可能多的映射语句，因此您可以从 XML 标头和文档类型声明中获得很多好处。 

文件的其余部分是非常自我解释的。 

它在命名空间“org.mybatis.example.BlogMapper”中为映射语句“selectBlog”定义了一个名称，这将允许您通过指定“org.mybatis.example.BlogMapper.selectBlog”的完全限定名称来调用它 ，正如我
们在下面的示例中所做的那样：

```java
Blog blog = session.selectOne("org.mybatis.example.BlogMapper.selectBlog", 101);
```

请注意这与在完全限定的 Java 类上调用方法有多么相似，这是有原因的。 

这个名称可以直接映射到一个与命名空间同名的Mapper类，用匹配名称、参数和返回类型的方法作为映射的select语句。 

这使您可以像上面看到的那样非常简单地针对 Mapper 接口调用该方法，但在以下示例中又是这样：

```java
BlogMapper mapper = session.getMapper(BlogMapper.class);
Blog blog = mapper.selectBlog(101);
```

第二种方法有很多优点。 

首先，它不依赖于字符串文字，所以它更安全。 其次，如果您的 IDE 具有代码完成功能，您可以在导航映射的 SQL 语句时利用它。

## 注意 关于命名空间的注释。

命名空间在之前的 MyBatis 版本中是可选的，这让人困惑且没有帮助。 

命名空间现在是必需的，其目的不仅仅是隔离具有更长的完全限定名称的语句。

命名空间启用接口绑定，如您在此处所见，即使您认为今天不会使用它们，您也应该遵循此处列出的这些实践，以防您改变主意。 使用命名空间一次，并将其放在适当的 Java 包命名空间中将清理您的代码并从长远来看提高 MyBatis 的可用性。

## 名称解析

为了减少键入量，MyBatis 对所有命名的配置元素使用以下名称解析规则，包括语句、结果映射、缓存等。

直接查找完全限定名称（例如“com.mypackage.MyMapper.selectAllThings”）并在找到时使用。

短名称（例如“selectAllThings”）可用于引用任何明确的条目。 

但是，如果有两个或更多（例如“com.foo.selectAllThings 和 com.bar.selectAllThings”），那么您将收到一个错误报告，指出短名称不明确，因此必须是完全限定的。

像 BlogMapper 这样的 Mapper 类还有一个技巧。 它们的映射语句根本不需要用 XML 进行映射。 相反，他们可以使用 Java 注释。 

例如，上面的 XML 可以被删除并替换为：

```java
package org.mybatis.example;
public interface BlogMapper {
  @Select("SELECT * FROM blog WHERE id = #{id}")
  Blog selectBlog(int id);
}
```

对于简单的语句，注解要干净得多，但是，对于更复杂的语句，Java 注解既有限又混乱。 

因此，**如果您必须做任何复杂的事情，最好使用 XML 映射语句**。

由您和您的项目团队决定哪种方式适合您，以及以一致的方式定义您的映射语句对您来说有多重要。 

也就是说，您永远不会局限于一种方法。 您可以非常轻松地将基于注释的映射语句迁移到 XML，反之亦然。

# 范围和生命周期 Scope and Lifecycle

了解我们目前讨论的各种范围和生命周期类非常重要。 

不正确地使用它们会导致严重的并发问题。

注意 对象生命周期和依赖注入框架

依赖注入框架可以创建线程安全的、事务性的 SqlSession 和映射器，并将它们直接注入到您的 bean 中，这样您就可以忘记它们的生命周期。

 您可能想看看 MyBatis-Spring 或 MyBatis-Guice 子项目，以了解更多关于将 MyBatis 与 DI 框架结合使用的信息。

## SqlSessionFactoryBuilder

这个类可以被实例化、使用和丢弃。 一旦您创建了 SqlSessionFactory，就无需保留它。 因此，SqlSessionFactoryBuilder 实例的最佳作用域是方法作用域（即局部方法变量）。 您可以重用 SqlSessionFactoryBuilder 来构建多个 SqlSessionFactory 实例，但最好不要保留它，以确保释放所有 XML 解析资源以用于更重要的事情。

## SqlSessionFactory

创建后，SqlSessionFactory 应在应用程序执行期间存在。 

应该很少或没有理由处理它或重新创建它。 

最好不要在应用程序运行中多次重建 SqlSessionFactory。 这样做应该被视为“难闻的气味”。 

因此SqlSessionFactory的最佳范围是应用范围。 这可以通过多种方式实现。 

最简单的是使用单例模式或静态单例模式。

## SqlSession

每个线程都应该有自己的 SqlSession 实例。 SqlSession 的实例不能共享并且不是线程安全的。 

因此最好的范围是请求或方法范围。 

永远不要在静态字段甚至类的实例字段中保留对 SqlSession 实例的引用。 

切勿在任何类型的托管范围内保留对 SqlSession 的引用，例如 Servlet 框架的 HttpSession。 

如果您正在使用任何类型的 Web 框架，请考虑 SqlSession 遵循与 HTTP 请求类似的范围。 

换句话说，在收到 HTTP 请求后，您可以打开一个 SqlSession，然后在返回响应后，您可以关闭它。 

结束会议非常重要。 

您应该始终确保它在 finally 块中关闭。 

以下是确保 SqlSession 关闭的标准模式：

```java
try (SqlSession session = sqlSessionFactory.openSession()) {
  // do work
}
```

在整个代码中始终如一地使用此模式将确保正确关闭所有数据库资源。

## 映射器实例

映射器是您创建的用于绑定到映射语句的接口。 映射器接口的实例是从 SqlSession 中获取的。 

因此，从技术上讲，任何映射器实例的最广泛范围与请求它们的 SqlSession 相同。 

但是，映射器实例的最佳范围是方法范围。 

也就是说，它们应该在使用它们的方法中被请求，然后被丢弃。 它们不需要显式关闭。 

虽然在整个请求中保留它们不是问题，类似于 SqlSession，但您可能会发现在此级别管理太多资源会很快失控。 

保持简单，将 Mappers 保持在方法范围内。 

以下示例演示了这种做法。

```java
try (SqlSession session = sqlSessionFactory.openSession()) {
  BlogMapper mapper = session.getMapper(BlogMapper.class);
  // do work
}
```

# 参考资料

https://mybatis.org/mybatis-3/getting-started.html

* any list
{:toc}
