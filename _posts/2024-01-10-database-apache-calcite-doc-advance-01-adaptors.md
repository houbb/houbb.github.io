---
layout: post
title: Apache Calcite advanced 01 Adapters 适配器
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 模式适配器

模式适配器允许 Calcite 读取特定类型的数据，并将数据呈现为模式中的表。

卡桑德拉适配器（calcite-cassandra）
CSV 适配器（example/csv）
Druid 适配器（calcite-druid）
Elasticsearch 适配器（calcite-elasticsearch）
文件适配器（calcite-file）
Geode 适配器（calcite-geode）
InnoDB 适配器（calcite-innodb）
JDBC 适配器（calcite-core 的一部分）
MongoDB 适配器（calcite-mongodb）
操作系统适配器（calcite-os）
Pig 适配器（calcite-pig）
Redis 适配器（calcite-redis）
Solr 云适配器（solr-sql）
Spark 适配器（calcite-spark）
Splunk 适配器（calcite-splunk）
Eclipse Memory Analyzer（MAT）适配器（mat-calcite-plugin）
Apache Kafka 适配器

## 其他语言接口

Piglet（calcite-piglet）在 Pig Latin 的子集中运行查询。

# 引擎

许多项目和产品使用 Apache Calcite 进行 SQL 解析、查询优化、数据虚拟化/联合以及物化视图重写。

其中一些列在“由 Calcite 驱动”的页面上。

## 驱动程序

驱动程序允许您从您的应用程序连接到 Calcite。

### JDBC 驱动程序

JDBC 驱动程序由 Avatica 提供支持。连接可以是本地的或远程的（通过 HTTP 的 JSON 或通过 HTTP 的 Protobuf）。

JDBC 连接字符串的基本形式是

jdbc:calcite:property=value;property2=value2

其中 property、property2 是下面描述的属性。（连接字符串符合 OLE DB 连接字符串语法，由 Avatica 的 ConnectStringParser 实现。）

### JDBC connect string parameters

| 属性 | 描述 |
| --- | --- |
| approximateDecimal | 是否接受 DECIMAL 类型上聚合函数的近似结果。 |
| approximateDistinctCount | 是否接受 COUNT(DISTINCT ...) 聚合函数的近似结果。 |
| approximateTopN | 是否接受 “Top N” 查询的近似结果（ORDER BY aggFun() DESC LIMIT n）。 |
| caseSensitive | 标识符是否区分大小写。如果未指定，则使用 lex 的值。 |
| conformance | SQL 遵循级别。值：DEFAULT（默认，类似于 PRAGMATIC_2003）、LENIENT、MYSQL_5、ORACLE_10、ORACLE_12、PRAGMATIC_99、PRAGMATIC_2003、STRICT_92、STRICT_99、STRICT_2003、SQL_SERVER_2008。 |
| createMaterializations | Calcite 是否应该创建物化视图。默认为 false。 |
| defaultNullCollation | 如果查询中未指定 NULLS FIRST 或 NULLS LAST，NULL 值应该如何排序。默认值 HIGH，将 NULL 值与 Oracle 相同排序。 |
| druidFetch | 在执行 SELECT 查询时，Druid 适配器一次应该获取多少行。 |
| forceDecorrelate | 规划器是否应尽可能尝试解关联。默认为 true。 |
| fun | 内置函数和运算符的集合。有效值为“standard”（默认）、“oracle”、“spatial”，可以使用逗号进行组合，例如 “oracle,spatial”。 |
| lex | 词法策略。值为 BIG_QUERY、JAVA、MYSQL、MYSQL_ANSI、ORACLE（默认）、SQL_SERVER。 |
| materializationsEnabled | Calcite 是否应该使用物化视图。默认为 false。 |
| model | JSON/YAML 模型文件的 URI，或者像 inline:{...}（JSON）或 inline:...（YAML）的内联模型。 |
| parserFactory | 解析器工厂。实现 SqlParserImplFactory 接口并具有公共默认构造函数或 INSTANCE 常量的类名。 |
| quoting | 标识符如何引用。值为 DOUBLE_QUOTE、BACK_TICK、BACK_TICK_BACKSLASH、BRACKET。如果未指定，则使用 lex 的值。 |
| quotedCasing | 如果标识符被引用，它们如何存储。值为 UNCHANGED、TO_UPPER、TO_LOWER。如果未指定，则使用 lex 的值。 |
| schema | 初始模式的名称。 |
| schemaFactory | 模式工厂。实现 SchemaFactory 接口并具有公共默认构造函数或 INSTANCE 常量的类名。如果指定了模型，则被忽略。 |
| schemaType | 模式类型。值必须是 “MAP”（默认）、“JDBC” 或 “CUSTOM”（如果指定了 schemaFactory，则隐式）。如果指定了模型，则被忽略。 |
| spark | 指定是否应将 Spark 用作无法推送到源系统的处理引擎。如果为 false（默认值），Calcite 生成实现 Enumerable 接口的代码。 |
| timeZone | 时区，例如 “gmt-3”。默认为 JVM 的时区。 |
| typeSystem | 类型系统。实现 RelDataTypeSystem 接口并具有公共默认构造函数或 INSTANCE 常量的类名。 |
| unquotedCasing | 如果标识符未被引用，它们如何存储。值为 UNCHANGED、TO_UPPER、TO_LOWER。如果未指定，则使用 lex 的值。 |
| typeCoercion | 在 sql 节点验证期间是否进行隐式类型强制转换，默认为 true。 |

要连接到基于内置模式类型的单个模式，您不需要指定模型。例如，

```
jdbc:calcite:schemaType=JDBC; schema.jdbcUser=SCOTT; schema.jdbcPassword=TIGER; schema.jdbcUrl=jdbc:hsqldb:res:foodmart
```

将创建一个通过 JDBC 模式适配器映射到 foodmart 数据库的模式连接。

类似地，您可以基于用户定义的模式适配器连接到单个模式。例如，

```
jdbc:calcite:schemaFactory=org.apache.calcite.adapter.cassandra.CassandraSchemaFactory; schema.host=localhost; schema.keyspace=twissandra
```

将连接到 Cassandra 适配器，相当于编写以下模型文件：

```conf
{
  "version": "1.0",
  "defaultSchema": "foodmart",
  "schemas": [
    {
      type: 'custom',
      name: 'twissandra',
      factory: 'org.apache.calcite.adapter.cassandra.CassandraSchemaFactory',
      operand: {
        host: 'localhost',
        keyspace: 'twissandra'
      }
    }
  ]
}
```

注意，操作数部分中的每个键都以 schema. 前缀出现在连接字符串中。

## Server 服务器

Calcite 的核心模块（calcite-core）支持 SQL 查询（SELECT）和 DML 操作（INSERT、UPDATE、DELETE、MERGE），但不支持诸如 CREATE SCHEMA 或 CREATE TABLE 等 DDL 操作。

正如我们将看到的那样，DDL 会使存储库的状态模型变得复杂，并使解析器更难扩展，因此我们将 DDL 排除在核心之外。

服务器模块（calcite-server）向 Calcite 添加了 DDL 支持。它扩展了 SQL 解析器，使用与子项目相同的机制，添加了一些 DDL 命令：

CREATE 和 DROP SCHEMA
CREATE 和 DROP FOREIGN SCHEMA
CREATE 和 DROP TABLE（包括 CREATE TABLE ... AS SELECT）
CREATE 和 DROP MATERIALIZED VIEW
CREATE 和 DROP VIEW
CREATE 和 DROP FUNCTION
CREATE 和 DROP TYPE

这些命令在 SQL 参考中有描述。

要启用它们，请将 calcite-server.jar 包含在您的类路径中，并在 JDBC 连接字符串中添加 parserFactory=org.apache.calcite.sql.parser.ddl.SqlDdlParserImpl#FACTORY（请参阅连接字符串属性 parserFactory）。

以下是使用 sqlline shell 的示例：

```
$ ./sqlline
sqlline version 1.3.0
> !connect jdbc:calcite:parserFactory=org.apache.calcite.sql.parser.ddl.SqlDdlParserImpl#FACTORY sa ""
> CREATE TABLE t (i INTEGER, j VARCHAR(10));
No rows affected (0.293 seconds)
> INSERT INTO t VALUES (1, 'a'), (2, 'bc');
2 rows affected (0.873 seconds)
> CREATE VIEW v AS SELECT * FROM t WHERE i > 1;
No rows affected (0.072 seconds)
> SELECT count(*) FROM v;
+---------------------+
|       EXPR$0        |
+---------------------+
| 1                   |
+---------------------+
1 row selected (0.148 seconds)
> !quit
```

calcite-server 模块是可选的。其目标之一是展示 Calcite 的功能（例如物化视图、外部表和生成列），使用简洁的示例，您可以从 SQL 命令行中尝试。calcite-server 使用的所有功能都可以通过 calcite-core 中的 API 获得。

如果您是子项目的作者，则您的语法扩展可能与 calcite-server 中的语法扩展不匹配，因此我们建议您通过扩展核心解析器来添加您的 SQL 语法扩展；如果您需要 DDL 命令，您可能可以从 calcite-server 复制粘贴到您的项目中。

目前，存储库未持久化。当您执行 DDL 命令时，您正在通过向根 Schema 中可达的对象添加和删除对象来修改内存中的存储库。同一 SQL 会话中的所有命令都将看到这些对象。您可以通过执行相同的 SQL 命令脚本在将来的会话中创建相同的对象。

Calcite 也可以充当数据虚拟化或联合服务器：Calcite 在多个外部模式中管理数据，但对于客户端来说，所有数据都似乎在同一个位置。Calcite 选择在何处进行处理，以及是否为了效率而创建数据的副本。calcite-server 模块是实现这一目标的一步；一个强大的解决方案将需要进一步进行打包（使 Calcite 可以作为服务运行）、存储库持久化、授权和安全性。


# 可扩展性

有许多其他的 API 允许您扩展 Calcite 的功能。

在本节中，我们简要描述了这些 API，以便让您了解可能的操作。

要充分利用这些 API，您需要阅读其他文档，如接口的 javadoc，并可能查找我们为其编写的测试。

## 函数和运算符 Functions and operators

有几种方法可以向 Calcite 添加运算符或函数。我们将首先描述最简单（也是最不强大）的方法。

用户定义的函数是最简单（但最不强大）的。它们很容易编写（您只需编写一个 Java 类并在模式中注册它），但在参数的数量和类型、解析重载函数或推导返回类型方面没有太多灵活性。

如果您需要该灵活性，您可能需要编写一个用户定义的运算符（请参阅接口 SqlOperator）。

如果您的运算符不符合标准 SQL 函数语法，“f(arg1, arg2, ...)”，那么您需要扩展解析器。

在测试中有许多很好的示例：类 UdfTest 测试用户定义的函数和用户定义的聚合函数。

## 聚合函数 Aggregate functions

用户定义的聚合函数类似于用户定义的函数，但每个函数有几个相应的 Java 方法，每个方法对应聚合的生命周期中的一个阶段：

- `init` 创建一个累加器；
- `add` 将一行的值添加到累加器中；
- `merge` 将两个累加器合并为一个；
- `result` 完成一个累加器并将其转换为结果。

例如，对于 SUM(int) 的方法（伪代码）如下：

```c
struct Accumulator {
  final int sum;
}
Accumulator init() {
  return new Accumulator(0);
}
Accumulator add(Accumulator a, int x) {
  return new Accumulator(a.sum + x);
}
Accumulator merge(Accumulator a, Accumulator a2) {
  return new Accumulator(a.sum + a2.sum);
}
int result(Accumulator a) {
  return a.sum;
}
```

以下是计算两行的列值为 4 和 7 的总和时调用的顺序：

```c
a = init()    # a = {0}
a = add(a, 4) # a = {4}
a = add(a, 7) # a = {11}
return result(a) # returns 11
```

## 窗口函数

窗口函数类似于聚合函数，但是它应用于由 OVER 子句而不是 GROUP BY 子句收集的一组行。

每个聚合函数都可以用作窗口函数，但是有一些关键区别。窗口函数所看到的行可能是有序的，依赖于顺序的窗口函数（例如 RANK）不能用作聚合函数。

另一个区别是窗口是非不交的：特定行可以出现在多个窗口中。例如，10:37 同时出现在 9:00-10:00 小时和 9:15-9:45 小时中。

窗口函数是增量计算的：当时钟从 10:14 到 10:15 时，可能有两行进入窗口，而三行离开。为此，窗口函数有一个额外的生命周期操作：

- remove 从累加器中移除一个值。

其 SUM(int) 的伪代码可能如下所示：

```c
Accumulator remove(Accumulator a, int x) {
  return new Accumulator(a.sum - x);
}
```

以下是计算前 2 行的移动总和（moving sum）时，对值为 4、7、2 和 3 的 4 行进行调用的顺序：

```c
a = init()       # a = {0}
a = add(a, 4)    # a = {4}
emit result(a)   # emits 4
a = add(a, 7)    # a = {11}
emit result(a)   # emits 11
a = remove(a, 4) # a = {7}
a = add(a, 2)    # a = {9}
emit result(a)   # emits 9
a = remove(a, 7) # a = {2}
a = add(a, 3)    # a = {5}
emit result(a)   # emits 5
```

## 分组窗口函数 Grouped window functions

分组窗口函数是操作 GROUP BY 子句将记录聚合到集合中的函数。

内置的分组窗口函数有 HOP、TUMBLE 和 SESSION。

您可以通过实现接口 SqlGroupedWindowFunction 来定义额外的函数。

## 表函数和表宏 Table functions and table macros

用户定义的表函数的定义方式与常规的“标量”用户定义函数类似，但在查询的 FROM 子句中使用。以下查询使用名为 Ramp 的表函数：

```sql
SELECT * FROM TABLE(Ramp(3, 4))
```

用户定义的表宏使用与表函数相同的 SQL 语法，但定义方式不同。

它们不是生成数据，而是生成一个关系表达式。表宏在查询准备期间被调用，它们生成的关系表达式可以进行优化。

（Calcite 的视图实现使用表宏。）

类 TableFunctionTest 用于测试表函数，并包含几个有用的示例。

## 扩展解析器 Extending the parser

假设您需要以一种与将来对语法的更改兼容的方式扩展 Calcite 的 SQL 语法。在您的项目中复制语法文件 Parser.jj 将是愚蠢的，因为语法经常被编辑。

幸运的是，Parser.jj 实际上是一个 Apache FreeMarker 模板，其中包含可以进行替换的变量。calcite-core 中的解析器使用变量的默认值来实例化模板，通常为空，但您可以进行覆盖。如果您的项目需要不同的解析器，您可以提供自己的 config.fmpp 和 parserImpls.ftl 文件，从而生成扩展的解析器。

calcite-server 模块是一个例子，它在 [CALCITE-707] 中创建，并添加了诸如 CREATE TABLE 等 DDL 语句。

还请参阅类 ExtensionSqlParserTest。

## 要自定义解析器应接受的 SQL 扩展

要自定义解析器应接受的 SQL 扩展，实现 SqlConformance 接口或使用枚举 SqlConformanceEnum 中的内置值之一。

要控制为外部数据库（通常通过 JDBC 适配器）生成的 SQL，使用 SqlDialect 类。

该方言还描述了引擎的功能，例如它是否支持 OFFSET 和 FETCH 子句。

## 定义自定义模式 Defining a custom schema

要定义自定义模式，您需要实现SchemaFactory接口。

在查询准备过程中，Calcite将调用此接口以了解您的模式包含哪些表和子模式。

当查询中引用了您模式中的表时，Calcite会请求您的模式创建一个Table接口的实例。

该表将被包装在TableScan中，并将经过查询优化过程。

## 反射模式 Reflective schema

反射模式（Reflective Schema，类ReflectiveSchema）是一种将Java对象包装成模式的方法。它的集合值字段将显示为表格。

它不是一个模式工厂，而是一个实际的模式；您必须通过调用API来创建对象并将其包装到模式中。

请参阅类ReflectiveSchemaTest。

## 定义自定义表格 Defining a custom table

要定义自定义表格，您需要实现TableFactory接口。与模式工厂一组命名的表格不同，表格工厂在绑定到具有特定名称的模式时（以及可选的一组额外操作数时），将产生单个表格。

## 修改数据 Modifying data

如果您的表格支持DML操作（INSERT、UPDATE、DELETE、MERGE），则您实现的Table接口必须实现ModifiableTable接口。

## 流式处理 Streaming

如果您的表格支持流查询，您实现的Table接口必须实现StreamableTable接口。

请参阅类StreamTest以获取示例。



## Pushing operations down to your table (将操作下推至您的表)

如果您希望将处理操作下推至自定义表的源系统，请考虑实现接口 FilterableTable 或接口 ProjectableFilterableTable。

如果您希望拥有更多控制权，您应该编写一个规则规则。这将允许您下推表达式，对是否下推处理进行基于成本的决策，并下推更复杂的操作，如连接、聚合和排序。

## Type system (类型系统)

您可以通过实现接口 RelDataTypeSystem 来自定义类型系统的某些方面。

## 关系操作符 (Relational operators)

所有的关系操作符都实现了接口 RelNode，并且大多数扩展了类 AbstractRelNode。核心操作符（被 SqlToRelConverter 使用，覆盖传统的关系代数）包括 TableScan、TableModify、Values、Project、Filter、Aggregate、Join、Sort、Union、Intersect、Minus、Window 和 Match。

每个操作符都有一个“纯”逻辑子类，比如 LogicalProject 等等。任何给定的适配器都会有相应的操作符，其引擎可以有效实现；例如，Cassandra 适配器有 CassandraProject，但没有 CassandraJoin。

您可以定义自己的 RelNode 子类来添加新的操作符，或者在特定引擎中实现现有操作符。

要使操作符有用且强大，您需要规划器规则来将其与现有操作符结合使用。（还需提供元数据，见下文）。由于这是代数，效果是组合的：您编写了一些规则，但它们组合起来处理指数级的查询模式。

如果可能的话，将您的操作符作为现有操作符的子类；然后您可能可以重用或适应其规则。

更好的是，如果您的操作符是一个逻辑操作，您可以通过现有操作符（再次通过规划器规则）重写它，您应该这样做。

您将能够重用这些操作符的规则、元数据和实现，而无需额外工作。

## 规划器规则 (Planner rule)

规划器规则 (class RelOptRule) 将一个关系表达式转换为等效的关系表达式。

规划引擎注册了许多规划器规则，并触发它们以将输入查询转换为更有效的形式。因此，规划器规则对于优化过程至关重要，但令人惊讶的是，每个规划器规则并不关注成本。规划引擎负责按照产生最佳计划的顺序触发规则，但每个单独的规则只关注正确性。

Calcite 有两个内置的规划引擎：VolcanoPlanner 类使用动态规划，适用于详尽搜索，而 HepPlanner 类按更固定的顺序触发一系列规则。

## 调用约定 (Calling conventions)

调用约定是特定数据引擎使用的协议。例如，Cassandra 引擎具有一组关系操作符，如 CassandraProject、CassandraFilter 等等，这些操作符可以互相连接而无需将数据从一种格式转换为另一种格式。

如果需要将数据从一种调用约定转换为另一种调用约定，Calcite 使用一种称为转换器（参见接口 Converter）的特殊的关系表达式子类。但是，转换数据当然会有运行时成本。

在规划使用多个引擎的查询时，Calcite 根据它们的调用约定“着色”关系表达式树的区域。规划器通过触发规则将操作推入数据源。如果引擎不支持特定操作，则规则不会触发。有时一个操作可能会发生在多个地方，最终根据成本选择最佳计划。

调用约定是实现接口 Convention 的类，以及一组类 RelNode 的子类，这些子类为核心关系操作符（Project、Filter、Aggregate 等）实现了该接口的辅助接口（例如接口 CassandraRel）。

## 内置 SQL 实现 (Built-in SQL implementation)

如果一个适配器没有实现所有核心关系操作符，Calcite 如何实现 SQL 呢？

答案是一种特定的内置调用约定，即 EnumerableConvention。可枚举约定的关系表达式被实现为“内置”：Calcite 生成 Java 代码，编译它，并在其自己的 JVM 中执行。可枚举约定不如分布式引擎在基于列的数据文件上运行的效率高，但它可以实现所有核心关系操作符和所有内置 SQL 函数和操作符。如果数据源无法实现关系操作符，则可枚举约定是一种后备方案。

## 统计信息和成本 (Statistics and cost)

Calcite 拥有一个元数据系统，允许您定义关于关系操作符的成本函数和统计信息，统称为元数据。

每种类型的元数据都有一个接口，通常有一个方法。例如，选择性由类 RelMdSelectivity 定义，并且方法是 getSelectivity(RelNode rel, RexNode predicate)。

有许多内置类型的元数据，包括排序、列来源、列唯一性、不同行数、分布、解释可见性、表达式血统、最大行数、节点类型、并行性、百分比原始行数、总体大小、谓词、行数、选择性、大小、表引用和唯一键；您也可以定义自己的元数据。

然后，您可以提供一个元数据提供者，为 RelNode 的特定子类计算该类型的元数据。元数据提供者可以处理内置和扩展的元数据类型，以及内置和扩展的 RelNode 类型。在准备查询时，Calcite 结合所有适用的元数据提供者，并维护一个缓存，以便给定的一段元数据（例如在特定的 Filter 操作符中条件 x > 10 的选择性）只计算一次。





# 参考资料

https://calcite.apache.org/docs/adapter.html

* any list
{:toc}