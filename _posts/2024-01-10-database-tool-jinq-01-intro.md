---
layout: post
title: 数据库查询工具 jinq 入门介绍-java中编写数据库查询的简单自然的方式
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, orm, jdbc, sql-budiler, sh]
published: true
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)


# Jinq 是什么？

Jinq为开发者提供了一种在Java中编写数据库查询的简单自然的方式。

你可以像处理存储在集合中的普通Java对象一样处理数据库数据。你可以使用普通的Java命令遍历和过滤它们，而你的所有代码都将自动转化为优化的数据库查询。

最后，Java终于有了LINQ风格的查询！

简单自然的查询。

使用Jinq，你可以使用简单自然的Java语法编写数据库查询。利用Java 8对函数式编程的新支持，你可以使用与常规Java数据相同的代码来过滤和转换数据库中的数据。

例如，下面是一段使用Jinq从数据库中获取所有名为“Alice”的客户的Java代码。

```java
database.customerStream().where(
customer -> customer.getName().equals("Alice"));
```

代码执行流程如下：

从数据库中获取所有客户的流
使用函数访问每个客户对象并进行过滤
只返回名为“Alice”的客户

当在Java中执行此代码时，Jinq将自动将代码转换为数据库可以理解的SQL查询。

```java
PreparedStatement s = con.prepareStatement("SELECT * "

"FROM Customer C "
"WHERE C.Name = ? ");
s.setString(1, "Alice");
ResultSet rs = s.executeQuery();
```

更少的错误。更少的安全漏洞。更快的开发速度。

现有的数据库查询写在字符串内部。为了检查错误，你必须启动数据库并运行查询。这会减慢开发速度并导致更多错误。

Jinq查询是普通的Java代码，Java编译器将早期捕获错误，加快开发速度。由于查询被编写为Java代码，因此不可能出现常见的SQL注入安全问题。

# 立即尝试

Jinq是开源的。现在下载并按照入门指南学习更多关于其功能的信息。

# 参考资料

https://www.jinq.org/


* any list
{:toc}