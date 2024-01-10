---
layout: post
title: Apache Calcite 动态数据管理框架-04-algebra
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 代数

关系代数是Calcite的核心。每个查询都表示为一棵关系运算符树。您可以从SQL翻译到关系代数，或者直接构建该树。

规划器规则使用保留语义的数学标识来转换表达式树。例如，如果过滤器不引用另一个输入的列，将过滤器推入内连接的输入是有效的。

Calcite通过反复应用规划器规则到关系表达式来优化查询。成本模型指导此过程，规划器引擎生成具有与原始表达式相同语义但成本更低的替代表达式。

规划过程是可扩展的。您可以添加自己的关系运算符、规划器规则、成本模型和统计信息。

## 代数构建器

构建关系表达式的最简单方法是使用代数构建器 RelBuilder。以下是一个示例：

TableScanPermalink
```java
final FrameworkConfig config;
final RelBuilder builder = RelBuilder.create(config);
final RelNode node = builder
  .scan("EMP")
  .build();
System.out.println(RelOptUtil.toString(node));
```
（您可以在 RelBuilderExample.java 中找到此示例和其他示例的完整代码。）

该代码打印

```
LogicalTableScan(table=[[scott, EMP]])
```

它创建了 EMP 表的扫描；相当于 SQL

```sql
SELECT *
FROM scott.EMP;
```

## Adding a Project

现在，让我们添加一个 Project，相当于

```sql
SELECT ename, deptno
FROM scott.EMP;
```

我们只需在调用 build 之前添加对 project 方法的调用：

```java
final RelNode node = builder
  .scan("EMP")
  .project(builder.field("DEPTNO"), builder.field("ENAME"))
  .build();
System.out.println(RelOptUtil.toString(node));
```

输出为

```
LogicalProject(DEPTNO=[$7], ENAME=[$1])
  LogicalTableScan(table=[[scott, EMP]])
```

builder.field 的两次调用创建了从输入关系表达式（即 scan 调用创建的 TableScan）返回字段的简单表达式。

Calcite已将它们转换为按序号引用的字段，即 $7 和 $1。

## 添加 Filter 和 Aggregate

带有 Aggregate 和 Filter 的查询：

```java
final RelNode node = builder
  .scan("EMP")
  .aggregate(builder.groupKey("DEPTNO"),
      builder.count(false, "C"),
      builder.sum(false, "S", builder.field("SAL")))
  .filter(
      builder.call(SqlStdOperatorTable.GREATER_THAN,
          builder.field("C"),
          builder.literal(10)))
  .build();
System.out.println(RelOptUtil.toString(node));
```

相当于 SQL

```sql
SELECT deptno, count(*) AS c, sum(sal) AS s
FROM emp
GROUP BY deptno
HAVING count(*) > 10
```

生成的结果是

```
LogicalFilter(condition=[>($1, 10)])
  LogicalAggregate(group=[{7}], C=[COUNT()], S=[SUM($5)])
    LogicalTableScan(table=[[scott, EMP]])
```

## 推送和弹出

该构建器使用一个栈来存储由一步产生的关系表达式，并将其作为输入传递给下一步。这允许产生关系表达式的方法生成一个构建器。

大多数情况下，您将使用的唯一栈方法是 `build()`，以获取最后的关系表达式，即树的根。

有时栈嵌套得太深会让人感到困惑。为了保持清晰，您可以从栈中删除表达式。例如，这里我们正在构建一个树状连接：

```
.
               join
             /      \
        join          join
      /      \      /      \
CUSTOMERS ORDERS LINE_ITEMS PRODUCTS
```

我们分三个阶段构建它。将中间结果存储在变量 `left` 和 `right` 中，并在创建最终 Join 时使用 `push()` 将它们放回栈中：

```java
final RelNode left = builder
  .scan("CUSTOMERS")
  .scan("ORDERS")
  .join(JoinRelType.INNER, "ORDER_ID")
  .build();

final RelNode right = builder
  .scan("LINE_ITEMS")
  .scan("PRODUCTS")
  .join(JoinRelType.INNER, "PRODUCT_ID")
  .build();

final RelNode result = builder
  .push(left)
  .push(right)
  .join(JoinRelType.INNER, "ORDER_ID")
  .build();
```

# 转换约定

默认的 RelBuilder 创建没有约定的逻辑 RelNode。但是，您可以通过 `adoptConvention()` 切换到使用不同的约定：

```java
final RelNode result = builder
  .push(input)
  .adoptConvention(EnumerableConvention.INSTANCE)
  .sort(toCollation)
  .build();
```

在这种情况下，我们在输入 RelNode 之上创建了一个 EnumerableSort。

# 字段名称和序数

您可以通过名称或序数引用字段。

序数是从零开始的。每个运算符都保证其输出字段出现的顺序。例如，Project 返回每个标量表达式生成的字段。

运算符的字段名称保证是唯一的，但有时这意味着名称不完全符合您的期望。例如，当将 EMP 与 DEPT 进行连接时，其中一个输出字段将被称为 DEPTNO，另一个将被称为类似 DEPTNO_1 的字段。

某些关系表达式方法允许您更好地控制字段名称：

- `project` 允许您使用 `alias(expr, fieldName)` 包装表达式。它会删除包装，但保留建议的名称（只要它是唯一的）。
- `values(String[] fieldNames, Object... values)` 接受一个字段名称数组。如果数组的任何元素为 null，构建器将生成一个唯一的名称。

如果一个表达式投影输入字段或输入字段的强制转换，它将使用该输入字段的名称。

一旦分配了唯一的字段名称，这些名称就是不可变的。如果您有特定的 RelNode 实例，可以依赖于字段名称不会更改。实际上，整个关系表达式都是不可变的。

但是，如果关系表达式通过了多个重写规则（参见 RelOptRule），那么结果表达式的字段名称可能与原始名称差异很大。在这一点上，最好通过序数引用字段。

当构建接受多个输入的关系表达式时，您需要构建考虑到这一点的字段引用。这在构建连接条件时最常发生。

假设您正在构建对 EMP 的连接，该表有 8 个字段 [EMPNO、ENAME、JOB、MGR、HIREDATE、SAL、COMM、DEPTNO] 和 DEPT，该表有 3 个字段 [DEPTNO、DNAME、LOC]。在内部，Calcite 将这些字段表示为组合输入行的偏移量，该行有 11 个字段：左输入的第一个字段是字段 #0（从 0 开始，记住），右输入的第一个字段是字段 #8。

但通过构建器 API，您指定了哪个输入的哪个字段。要引用 “SAL”，内部字段 #5，可以写为 `builder.field(2, 0, "SAL")`、`builder.field(2, "EMP", "SAL")` 或 `builder.field(2, 0, 5)`。这表示“两个输入的第 0 个输入的第 5 个字段”。（为什么需要知道有两个输入？因为它们存储在栈上；输入 #1 在栈的顶部，输入 #0 在其下。如果我们没有告诉构建器有两个输入，它就不会知道为输入 #0 深入多少层。）

同样，要引用 “DNAME”，内部字段 #9（8 + 1），可以写为 `builder.field(2, 1, "DNAME")`、`builder.field(2, "DEPT", "DNAME")` 或 `builder.field(2, 1, 1)`。

# 递归查询

警告：当前的 API 是试验性的，可能会在没有通知的情况下发生更改。

可以使用 TransientTable 的扫描和 RepeatUnion 生成 SQL 递归查询，例如生成序列 1、2、3、…10 的查询：

```java
final RelNode node = builder
  .values(new String[] { "i" }, 1)
  .transientScan("aux")
  .filter(
      builder.call(
          SqlStdOperatorTable.LESS_THAN,
          builder.field(0),
          builder.literal(10)))
  .project(
      builder.call(
          SqlStdOperatorTable.PLUS,
          builder.field(0),
          builder.literal(1)))
  .repeatUnion("aux", true)
  .build();
System.out.println(RelOptUtil.toString(node));
```

该查询的 SQL 版本如下：

```sql
WITH RECURSIVE aux(i) AS (
  VALUES (1)
  UNION ALL
  SELECT i+1 FROM aux WHERE i < 10
)
SELECT * FROM aux
```

生成的关系表达式如下：

```sql
LogicalRepeatUnion(all=[true])
  LogicalTableSpool(readType=[LAZY], writeType=[LAZY], tableName=[aux])
    LogicalValues(tuples=[[{ 1 }]])
  LogicalTableSpool(readType=[LAZY], writeType=[LAZY], tableName=[aux])
    LogicalProject($f0=[+($0, 1)])
      LogicalFilter(condition=[<($0, 10)])
        LogicalTableScan(table=[[aux]])
```

这段代码使用 `builder` 创建了一个递归查询的关系表达式。

这个查询生成了一个名为 "aux" 的序列，该序列包含值 1 到 10。这个查询的关键点在于使用 `RepeatUnion` 和 `TransientTable`。

这里使用 `values` 方法创建了一个初始表，并使用 `transientScan` 方法将其标记为 "aux"，然后使用 `filter`、`project` 和 `repeatUnion` 添加了递归的部分。

最后，通过 `build()` 方法获取最终的关系表达式。

# 参考资料

https://calcite.apache.org/docs/algebra.html

* any list
{:toc}