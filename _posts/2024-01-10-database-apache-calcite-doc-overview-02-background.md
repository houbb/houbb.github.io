---
layout: post
title: Apache Calcite 动态数据管理框架-02-背景
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 背景

Apache Calcite是一个动态数据管理框架。

它包含了构成典型数据库管理系统的许多组件，但省略了一些关键功能：数据存储、处理数据的算法以及存储元数据的存储库。

Calcite故意避免涉足数据存储和处理的业务。正如我们将看到的那样，这使得它成为在应用程序与一个或多个数据存储位置以及数据处理引擎之间进行调解的理想选择。它也是构建数据库的理想基础：只需添加数据。

为了说明这一点，让我们创建一个空的Calcite实例，然后将其指向一些数据。

```java
public static class HrSchema {
  public final Employee[] emps = 0;
  public final Department[] depts = 0;
}
Class.forName("org.apache.calcite.jdbc.Driver");
Properties info = new Properties();
info.setProperty("lex", "JAVA");
Connection connection =
    DriverManager.getConnection("jdbc:calcite:", info);
CalciteConnection calciteConnection =
    connection.unwrap(CalciteConnection.class);
SchemaPlus rootSchema = calciteConnection.getRootSchema();
Schema schema = new ReflectiveSchema(new HrSchema());
rootSchema.add("hr", schema);
Statement statement = calciteConnection.createStatement();
ResultSet resultSet = statement.executeQuery(
    "select d.deptno, min(e.empid)\n"
    + "from hr.emps as e\n"
    + "join hr.depts as d\n"
    + "  on e.deptno = d.deptno\n"
    + "group by d.deptno\n"
    + "having count(*) > 1");
print(resultSet);
resultSet.close();
statement.close();
connection.close();
```

数据库在哪里？实际上是没有数据库的。

直到新的ReflectiveSchema将Java对象注册为模式，并将其集合字段`emps`和`depts`注册为表之前，连接是完全空的。

Calcite不希望拥有数据；它甚至没有偏爱的数据格式。

这个示例使用内存数据集，并使用来自linq4j库的操作符（如groupBy和join）进行处理。

但是Calcite也可以处理其他数据格式，比如JDBC。

在第一个示例中，将

```java
Schema schema = new ReflectiveSchema(new HrSchema());
```
替换为

```java
Class.forName("com.mysql.jdbc.Driver");
BasicDataSource dataSource = new BasicDataSource();
dataSource.setUrl("jdbc:mysql://localhost");
dataSource.setUsername("username");
dataSource.setPassword("password");
Schema schema = JdbcSchema.create(rootSchema, "hr", dataSource,
    null, "name");
```

Calcite将在JDBC中执行相同的查询。对于应用程序而言，数据和API是相同的，但在幕后，实现是非常不同的。Calcite使用优化器规则将JOIN和GROUP BY操作推送到源数据库。

内存和JDBC只是两个熟悉的例子。Calcite可以处理任何数据源和数据格式。

要添加数据源，您需要编写一个适配器，告诉Calcite应该将数据源中的哪些集合视为“表”。

对于更高级的集成，您可以编写优化器规则。优化器规则允许Calcite访问新格式的数据，允许您注册新的运算符（例如更好的连接算法），并允许Calcite优化查询如何转换为运算符。

Calcite将结合您的规则和运算符与内置的规则和运算符，应用基于成本的优化，并生成高效的执行计划。

# 编写适配器

在example/csv子项目下提供了一个CSV适配器，它对应用程序是完全功能的，同时也足够简单，可以作为编写自己适配器的良好模板。

查看教程以获取有关使用CSV适配器和编写其他适配器的信息。

查看HOWTO以获取有关使用其他适配器以及一般使用Calcite的更多信息。

# 状态

以下功能已完成。

- 查询解析器、验证器和优化器
- 支持以JSON格式读取模型
- 许多标准函数和聚合函数
- 针对Linq4j和JDBC后端的JDBC查询
- Linq4j前端
- SQL功能：SELECT、FROM（包括JOIN语法）、WHERE、GROUP BY（包括GROUPING SETS）、聚合函数（包括COUNT(DISTINCT ...)和FILTER）、HAVING、ORDER BY（包括NULLS FIRST/LAST）、集合操作（UNION、INTERSECT、MINUS）、子查询（包括相关子查询）、窗口聚合、LIMIT（Postgres语法）；SQL参考中有更多详细信息
- 本地和远程JDBC驱动程序；参见Avatica
- 几个适配器



# 参考资料

https://calcite.apache.org/docs/index.html

* any list
{:toc}