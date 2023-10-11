---
layout: post
title: SQL 索引建议-01-整体的思路概览
date: 2023-10-11 21:01:55 +0800
categories: [SQL]
tags: [sql, index, sh]
published: true
---


# chat

## Q0: Apache Calcite 介绍一下

Apache Calcite 是一个灵活的、可扩展的 SQL 解析和查询优化框架。它是一个开源项目，属于 Apache 软件基金会的顶级项目之一。Calcite 提供了一组通用的 SQL 处理工具，使得开发人员可以轻松地构建自定义的 SQL 处理引擎，包括 SQL 解析、查询优化和执行。以下是 Apache Calcite 的主要特点和功能：

### 1. **SQL 解析**：
Calcite 提供了强大的 SQL 解析器，可以将 SQL 查询语句解析为抽象语法树（AST），这使得开发人员可以轻松地分析和处理 SQL 查询。

### 2. **逻辑优化**：
Calcite 包含一个灵活的查询优化器，它可以对 SQL 查询进行逻辑优化。这意味着 Calcite 可以帮助你重写查询，以便更高效地执行。它可以应用各种优化规则来改进查询性能，例如谓词下推、常量折叠、投影下推等。

### 3. **物理优化**：
除了逻辑优化，Calcite 还支持物理查询优化。它可以将逻辑查询计划转换为物理查询计划，并且可以选择最佳的物理操作符和执行顺序，以提高查询性能。

### 4. **数据源集成**：
Calcite 支持各种数据源的集成，包括关系型数据库、NoSQL 数据库、流处理系统等。这意味着你可以使用 Calcite 来查询和优化不同种类的数据存储系统。

### 5. **自定义规则**：
Calcite 允许开发人员定义自定义的优化规则，以便根据特定需求应用定制化的查询优化。这样，你可以根据你的应用场景实现定制化的查询优化策略。

### 6. **查询转换和嵌套查询**：
Calcite 可以将 SQL 查询转换为不同的 SQL 方言，例如将 ANSI SQL 转换为特定数据库的 SQL 方言。此外，Calcite 还支持嵌套查询的优化，允许你在查询中嵌套使用子查询，并将其转换为高效的执行计划。

### 7. **可扩展性**：
Calcite 的架构设计非常灵活，允许开发人员扩展其功能。你可以轻松地添加新的数据源、自定义规则和查询优化器。

总的来说，Apache Calcite 提供了一个强大的基础架构，使得开发人员能够构建自定义的 SQL 处理引擎，无论是用于商业智能、数据分析还是其他数据处理应用场景。

Calcite 的灵活性和可扩展性使得它成为处理多种数据存储和查询需求的理想工具。

### 给一个入门的例子

当你想要使用 Apache Calcite 时，一种常见的用法是构建一个基本的 SQL 查询处理引擎。

以下是一个简单的入门示例，演示了如何使用 Calcite 解析 SQL 查询，构建查询计划，然后执行查询。

在这个例子中，我们将使用内存中的数据作为数据源。

首先，你需要添加 Maven 依赖，将 Apache Calcite 加入你的项目：

```xml
<dependencies>
    <!-- Calcite Core -->
    <dependency>
        <groupId>org.apache.calcite</groupId>
        <artifactId>calcite-core</artifactId>
        <version>1.27.0</version> <!-- 请根据最新版本号更新 -->
    </dependency>
</dependencies>
```

然后，下面是一个简单的 Java 代码示例：

```java
import org.apache.calcite.adapter.java.JavaTypeFactory;
import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.plan.RelOptUtil;
import org.apache.calcite.rel.RelNode;
import org.apache.calcite.schema.SchemaPlus;
import org.apache.calcite.schema.impl.AbstractSchema;
import org.apache.calcite.tools.Frameworks;
import org.apache.calcite.tools.RelBuilder;
import org.apache.calcite.tools.ValidationException;
import org.apache.calcite.util.Util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class CalciteExample {
    public static void main(String[] args) throws ClassNotFoundException, SQLException, ValidationException {
        // Register JDBC driver and create a connection
        Class.forName("org.apache.calcite.jdbc.Driver");
        Properties info = new Properties();
        Connection connection = DriverManager.getConnection("jdbc:calcite:", info);
        CalciteConnection calciteConnection = connection.unwrap(CalciteConnection.class);

        // Create a root schema
        SchemaPlus rootSchema = calciteConnection.getRootSchema();
        rootSchema.add("exampleSchema", new CustomSchema());

        // Parse SQL query
        String sql = "SELECT * FROM exampleSchema.myTable WHERE column1 > 10";
        RelNode relNode = calciteConnection.parseQuery(sql);

        // Optimize the query
        relNode = calciteConnection.getPlanner().transform(0, relNode.getTraitSet());

        // Get optimized query plan
        String plan = RelOptUtil.toString(relNode);

        System.out.println("Optimized Query Plan:");
        System.out.println(plan);
    }

    // Custom schema and table implementation
    static class CustomSchema extends AbstractSchema {
        @Override
        protected Map<String, Table> getTableMap() {
            Map<String, Table> tables = new HashMap<>();
            tables.put("myTable", new CustomTable());
            return tables;
        }
    }

    static class CustomTable implements Table {
        @Override
        public RelDataType getRowType(RelDataTypeFactory typeFactory) {
            JavaTypeFactory javaTypeFactory = (JavaTypeFactory) typeFactory;
            RelDataTypeBuilder builder = javaTypeFactory.builder();
            builder.add("column1", javaTypeFactory.createJavaType(Integer.class));
            return builder.build();
        }

        @Override
        public Enumerable<Object[]> scan(DataContext root) {
            // Simulated data source
            List<Object[]> rows = new ArrayList<>();
            rows.add(new Object[]{1});
            rows.add(new Object[]{15});
            rows.add(new Object[]{20});
            return Linq4j.asEnumerable(rows);
        }
    }
}
```

在这个例子中，我们创建了一个简单的 `CustomSchema`，其中包含一个名为 `myTable` 的表。

我们使用 Calcite 的 `CalciteConnection` 对象解析和优化 SQL 查询。

请确保替换示例中的 SQL 查询和数据源为你自己的需求。这只是一个基本的示例，你可以根据自己的需求扩展和定制。

## Q1: 如何实现输入 SQL，输出对应的索引建议？

要实现输入 SQL 查询，然后输出对应的索引建议，可以考虑以下步骤：

### 1. 解析 SQL 查询：
首先，你需要一个 SQL 解析器来将用户输入的 SQL 查询语句解析成可处理的数据结构，通常是解析成查询树或者其他数据结构。你可以使用现有的 SQL 解析库，比如ANTLR、JSqlParser等，或者自己编写解析器。

### 2. 分析查询语句：
分析解析后的查询语句，了解查询中涉及到的表、字段、连接条件、WHERE 子句、ORDER BY 子句等信息。这些信息对于索引建议非常重要。

### 3. 判断查询性能瓶颈：
分析查询语句，确定查询的性能瓶颈是在哪里，是在数据的读取、连接、排序还是其他操作上。这可以通过查询执行计划、数据库性能分析工具等来实现。

### 4. 根据查询性能瓶颈提供建议：
根据查询性能瓶颈，为查询语句提供建议的索引。通常的建议包括：

- **覆盖索引（Covering Index）**：如果查询中只用到了表的一部分字段，可以考虑创建覆盖索引，减少 IO 操作。
- **联合索引（Composite Index）**：如果查询中涉及到多个字段的条件，可以考虑创建联合索引，提高查询效率。
- **避免使用函数索引**：在查询条件中避免使用函数，因为函数会导致索引失效。
- **定期更新统计信息**：确保数据库中的统计信息是最新的，以便优化器能够选择正确的执行计划。

### 5. 输出索引建议：
将索引建议以文本或者图形的形式输出给用户。建议尽可能详细，包括哪些字段需要建立索引，建议的索引类型（覆盖索引、联合索引等），以及为什么这样建议的原因。

### 6. 可选的优化建议：
除了索引建议，你还可以提供其他的优化建议，比如重构查询语句、分区表、使用缓存等等，这些都可以对查询性能有所提升。

请注意，不同的数据库管理系统（比如MySQL、PostgreSQL、Oracle等）对于索引的最佳实践可能有所不同，因此建议根据具体使用的数据库系统来提供相应的建议。

## Q2: java 有开源的索引建议项目吗

是的，Java 中有一些开源项目可以用于索引建议。这些项目通常使用数据库性能分析和查询优化算法来提供建议，以帮助优化数据库查询性能。以下是一些常见的开源索引建议项目：

1. **Apache Calcite**：
   Apache Calcite 是一个灵活的、可扩展的 SQL 解析和查询优化框架。虽然它主要用于查询优化，但你可以使用其查询分析功能来获取索引建议。

2. **Database Index Advisor (DBIA)**：
   DBIA 是一个基于 Java 的项目，它能够分析 SQL 查询并生成索引建议。它可以帮助你了解哪些查询可以受益于索引，以及建议应该创建哪些索引。

3. **SQL Tuning Advisor (Oracle)**：
   如果你使用 Oracle 数据库，Oracle 提供了 SQL Tuning Advisor，它可以分析 SQL 查询并提供索引建议以及其他性能改进建议。虽然不是开源项目，但它是 Oracle 数据库的一部分。

4. **PgTune (PostgreSQL)**：
   如果你使用 PostgreSQL，PgTune 是一个工具，它可以帮助你调整 PostgreSQL 配置参数，但也可以提供索引建议和其他性能优化建议。

请注意，这些工具的功能和质量可能会有所不同，取决于具体的使用场景和需求。你可以根据自己的数据库系统和项目需求选择适合你的索引建议工具。同时，你也可以考虑编写自定义的索引建议工具，根据你的具体需求来进行定制。

## Q3: meituan 的 SQLAdvisor 介绍一下

截至我知识截止日期（2021年9月），美团技术团队开源了一个名为 SQLAdvisor 的项目，该项目是一个用于 MySQL 数据库的SQL查询优化工具。

SQLAdvisor旨在帮助数据库管理员和开发人员优化SQL查询，提供索引和查询优化建议。

以下是SQLAdvisor的一些主要特点和功能：

### 1. **SQL查询解析**：
SQLAdvisor能够解析输入的SQL查询，了解查询语句的结构和内容，包括表名、字段、连接条件、WHERE子句等。

### 2. **性能分析**：
SQLAdvisor分析查询的性能瓶颈，识别查询中的慢查询、全表扫描等问题。

### 3. **索引建议**：
基于查询分析，SQLAdvisor生成索引建议，包括哪些字段应该建立索引，以及建议的索引类型（单列索引、复合索引等）。这些建议帮助提高查询性能。

### 4. **查询优化建议**：
除了索引建议，SQLAdvisor还提供其他查询优化建议，例如重构查询语句、调整查询顺序等，以改善查询的执行计划。

### 5. **Web界面**：
SQLAdvisor通常带有一个易用的Web界面，允许用户输入SQL查询并查看建议。这样的界面使得非专业的数据库管理员也能够使用该工具。

### 6. **规则引擎**：
SQLAdvisor可能使用一些内置的规则引擎，通过分析SQL查询来生成建议。这些规则引擎通常基于数据库性能优化的最佳实践和经验，帮助用户遵循最佳性能实践。

请注意，SQLAdvisor的具体功能和特性可能会随着时间的推移而发生变化，建议查阅官方文档或GitHub存储库以获取最新信息。

另外，由于我知识截止日期为2021年9月，我无法提供关于SQLAdvisor在之后版本的最新发展的信息。

---------------------------------------------------------------------------------------------------------------------------------------------------


# 开源项目

[Meituan-Dianping/SQLAdvisor](https://github.com/Meituan-Dianping/SQLAdvisor/blob/master/doc/THEORY_PRACTICES.md)

# 美团理论说明

## 介绍

在数据库运维过程中，优化SQL是业务团队与DBA团队的日常任务。

例行SQL优化，不仅可以提升程序性能，还能够降低线上故障的概率。

目前常用的SQL优化方式包括但不限于：业务层优化、SQL逻辑优化、索引优化等。

其中索引优化通常通过调整索引或新增索引从而达到SQL优化的目的。

索引优化往往可以在短时间内产生非常巨大的效果。

如果能够将索引优化转化成工具化、标准化的流程，减少人工介入的工作量，无疑会大大提高DBA的工作效率

SQLAdvisor是由美团点评公司DBA团队(北京)开发维护的SQL优化工具：输入SQL，输出索引优化建议。 

它基于MySQL原生词法解析，再结合SQL中的where条件以及字段选择度、聚合条件、多表Join关系等最终输出最优的索引优化建议。

目前SQLAdvisor在公司内部大量使用，较为成熟、稳定。

美团点评致力于将SQLAdvisor打造成一款高智能化SQL优化工具，选择将已经在公司内部使用较为成熟的、稳定的SQLAdvisor项目开源，github地址。

希望与业内有类似需求的团队，一起打造一款优秀的SQL优化产品。

SQLAdvisor架构流程图：

![struct](https://github.com/Meituan-Dianping/SQLAdvisor/raw/master/doc/img/1.jpg)

## 2 解析树分解

### 2.1 join 处理

join语法分为两种：join on 和 join using。

并且join on 有时会存在where条件中。

分析Join条件首先会得到一个nested_join的table list,通过判断它的join_using_fields 字段是否为空来区分Join on 与Join using。

生成的table list 以二叉树的形式进行存储，以后序遍历的方式对二叉树进行遍历。

生成内部解析树时，right join 会转换成 left Join

join条件会存在当层的叶子节点上，如果左右节点都是叶子节点，会存在右叶子节点

每一个非叶子节点代表一次Join的结果。

上述实现时，涉及的函数为：`mysql_sql_parse_join(TABLE_LIST *join_table) mysql_sql_parse_join(Item *join_condition)` ，主要流程图如下：

![join](https://github.com/Meituan-Dianping/SQLAdvisor/raw/master/doc/img/2.jpg)

### 2.2 where 处理

主要是提取sql语句的where条件。

where条件中一般由AND 和 OR 连接符进行连接，因为OR 比较难以处理，所以忽略，只处理and连接符。

由于where 条件中可以存在 join条件，因此需要进行区分。

依次获取where条件，当条件中的操作符是like, 如果不是前缀匹配则丢弃这个条件。

根据条件计算字段的区分度按照高低进行倒序排，如果小于30则丢弃。同时使用最左原则将where条件进行有序排列。

### 2.3 计算区分度

区分度计算方法为

通过“show table status like”获得表的总行数table_count。

通过计算选择表中已存在的区分度最高的索引best_index，同时Primary key > Unique key > 一般索引

通过计算获取数据采样的起始值offset与采样范围rand_rows：

offset = (table_count / 2) > 10W ? 10W : (table_count / 2)

rand_rows =(table_count / 2) > 1W ? 1W : (table_count / 2)

使用 `select count(1) from (select field from table force index(best_index) order by cl.. desc limit rand_rows) where field_print` 得到满足条件的rows。

cardinality = rows == 0 ? rand_rows : rand_rows / rows;

计算完成选择度后，会根据选择度大小，将该条件添加到该表中的备选索引中。

主要涉及的函数为：mysql_sql_parse_field_cardinality_new() 计算选择度

![mysql_sql_parse_field_cardinality_new](https://github.com/Meituan-Dianping/SQLAdvisor/raw/master/doc/img/3.jpg)

### 2.4 添加备选索引

mysql_sql_parse_index() 将条件按照选择度添加到备选索引链表中

![mysql_sql_parse_index](https://github.com/Meituan-Dianping/SQLAdvisor/raw/master/doc/img/4.jpg)

上述两函数的流程图如下所示： 添加备选索引

### 2.5 group 与 order 处理

group 字段与order 字段能否用上索引，需要满足如下条件

涉及到的字段必须来自于同一张表，并且这张表必须是确定下来的驱动表

**group by 优于 Order by， 两者只能同时存在一个**。

1) order by 字段的排序方向必须完全一致，否则丢弃整个Order by 字段列。

当order by 条件中包含主键时，如果主键字段为 order by 字段列末尾，忽略该主键，否则丢弃整个Order by 字段列

2) 整个索引列排序优先级：等值>(group by | order by )> 非等值

3) 该过程中设计的函数主要有：

mysql_sql_parse_group() 判断group后的字段是否均来自于同一张表

mysql_sql_parse_order() 判断order后的条件是否可以使用

mysql_sql_parse_group_order_add() 将字段依次按照规则添加到备选索引链表中

![mysql_sql_parse_group_order_add](https://github.com/Meituan-Dianping/SQLAdvisor/raw/master/doc/img/5.jpg)

## 3 驱动表选择

经过前期的where解析、join解析，已经将SQL中表关联关系存储起来，并且按照一定逻辑将侯选驱动表确定下来

在侯选驱动表中，按照每一张表的侯选索引字段中第一个字段进行计算表中结果集大小

使用 `explain select * from table where field` 来计算表中结果集

结果集小最小的被确为驱动表。

步骤中涉及的函数为：final_table_drived()，在该函数中，调用了函数get_join_table_result_set()来获取每张驱动候选表的行数。

## 4 添加被驱动表备选索引

通过上述过程，已经选择了驱动表，也通过解析保存了语句中的条件。

由于选定了驱动表，因此需要对被驱动表的索引，根据join条件进行添加。

该过程涉及的函数主要是：mysql_index_add_condition_field()，流程如下：

![添加被驱动表备选索引](https://github.com/Meituan-Dianping/SQLAdvisor/raw/master/doc/img/7.jpg)

## 5 输出建议

通过上述步骤，已经将每张表的备选索引键全部保存。

此时，只要判断每张表中的候选索引键是否在实际表中已存在。

没有索引，则给出建议增加对应的索引。

![输出建议](https://github.com/Meituan-Dianping/SQLAdvisor/raw/master/doc/img/8.jpg)

该步骤涉及的函数是：print_index() ，主要的流程图为： 

# 开源项目

输入SQL，输出索引优化建议: https://github.com/Meituan-Dianping/SQLAdvisor

# 参考资料

chat

* any list
{:toc}