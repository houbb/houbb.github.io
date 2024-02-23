---
layout: post
title: Apache Calcite advanced 05 Lattices 格
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---


# 概念

格表示星形（或雪花）模式，而不是通用模式（A lattice represents a star (or snowflake) schema, not a general schema. ）。

特别地，所有关系必须是多对一的，从星形中心的事实表向外发散。

该名称源自数学：格是一个部分有序集，其中任意两个元素都有唯一的最大下界和最小上界。

[HRU96]观察到数据立方体的可能物化集合形成一个格，并提出了选择一组好的物化集合的算法。Calcite的推荐算法源自此算法。

格定义使用SQL语句表示星形。SQL是一个有用的简写，可以表示多个表连接在一起，并为列名分配别名（这比发明一种新语言来表示关系、连接条件和基数更方便）。

与常规SQL不同，顺序很重要。如果在FROM子句中将A放在B之前，并在A和B之间进行连接，那么您正在说明从A到B存在多对一的外键关系。（例如，在示例格中，销售事实表出现在时间维度表和产品维度表之前。产品维度表出现在产品类别外部维度表之前，在雪花结构的一支下方。）

格暗示了约束。在A到B的关系中，A上有一个外键（即A的每个外键值都有一个对应的B的键值），B上有一个唯一键（即没有键值出现超过一次）。这些约束非常重要，因为它允许规划器删除不使用列的表的连接，并知道查询结果不会改变。

Calcite不检查这些约束。如果违反了这些约束，Calcite将返回错误的结果。

格是一个大的虚拟连接视图。它没有物化（因为由于去规范化，它将比星形模式大几倍），您可能不想对其进行查询（列太多了）。那么它有什么用？正如我们上面所说，（a）格声明了一些非常有用的主键和外键约束，（b）它帮助查询规划器将用户查询映射到过滤-连接-聚合物化视图（DW查询中最有用的类型的物化视图），（c）为Calcite提供了一个框架，用于收集关于数据量和用户查询的统计信息，（d）允许Calcite自动设计和填充物化视图。

大多数星形模式模型都要求您选择某一列是维度还是度量。在格中，每一列都是维度列。（也就是说，它可以成为查询星形模式特定维度的GROUP BY子句中的一列）。任何列也可以用作度量；您通过给出列和一个聚合函数来定义度量。

如果“unit_sales”更多地用作度量而不是维度，那没问题。Calcite的算法应该注意到它很少被聚合，并且不倾向于创建聚合在其上的瓦片。（我所说的“应该”是指“可能并且有一天会”。该算法目前在设计瓦片时不考虑查询历史。）

但是有人可能想知道少于5个项目的订单是否比多于100个项目的订单更有利可图。突然，“unit_sales”就成了维度。如果声明列为维度列几乎没有成本，我认为就让它们全部成为维度列吧。

该模型允许特定表多次使用，带有不同的表别名。您可以使用此功能来模拟例如OrderDate和ShipDate，其中使用两个别名到时间维度表。

大多数SQL系统要求视图中的列名是唯一的。这在格中很难实现，因为您通常会在连接中包含主键和外键列。

因此，Calcite允许您以两种方式引用列。如果列是唯一的，您可以使用其名称，["unit_sales"]。

无论列在格中是否唯一，在其表中它都是唯一的，因此您可以使用其表别名限定它。例如：

["sales", "unit_sales"]
["ship_date", "time_id"]
["order_date", "time_id"]

“瓦片”是格中的一个物化表，具有特定的维度。

格JSON元素的“瓦片”属性定义了要物化的初始一组瓦片。

# 演示

创建包含格的模型：

```json
{
  "version": "1.0",
  "defaultSchema": "foodmart",
  "schemas": [
    {
      "type": "jdbc",
      "name": "foodmart",
      "jdbcUser": "FOODMART",
      "jdbcPassword": "FOODMART",
      "jdbcUrl": "jdbc:hsqldb:res:foodmart",
      "jdbcSchema": "foodmart"
    },
    {
      "name": "adhoc",
      "lattices": [
        {
          "name": "star",
          "sql": [
            "select 1 from \"foodmart\".\"sales_fact_1997\" as \"s\"",
            "join \"foodmart\".\"product\" as \"p\" using (\"product_id\")",
            "join \"foodmart\".\"time_by_day\" as \"t\" using (\"time_id\")",
            "join \"foodmart\".\"product_class\" as \"pc\" on \"p\".\"product_class_id\" = \"pc\".\"product_class_id\""
          ],
          "auto": true,
          "algorithm": true,
          "rowCountEstimate": 86837,
          "defaultMeasures": [
            {
              "agg": "count"
            }
          ]
        }
      ]
    }
  ]
}
```

这是hsqldb-foodmart-lattice-model.json的简化版本，不包含“tiles”属性，因为我们将自动生成瓦片。

让我们登录sqlline并连接到此模式：

```bash
$ sqlline version 1.3.0
sqlline> !connect jdbc:calcite:model=core/src/test/resources/hsqldb-foodmart-lattice-model.json "sa" ""
```

您会注意到连接需要几秒钟。Calcite正在运行优化算法，并创建和填充物化视图。让我们运行一个查询并检查其计划：

```sql
sqlline> select "the_year","the_month", count(*) as c
. . . .> from "sales_fact_1997"
. . . .> join "time_by_day" using ("time_id")
. . . .> group by "the_year","the_month";
```

```sql
sqlline> explain plan for
. . . .> select "the_year","the_month", count(*) as c
. . . .> from "sales_fact_1997"
. . . .> join "time_by_day" using ("time_id")
. . . .> group by "the_year","the_month";
```

查询给出了正确的答案，但计划有些令人惊讶。它没有读取sales_fact_1997或time_by_day表，而是从一个名为m{16, 17, 27, 31, 32, 36, 37}的表中读取。这是在连接开始时创建的其中一个瓦片。

这是一个真实的表，您甚至可以直接查询它。它只有120行，因此是回答查询的更有效方法：

```sql
sqlline> !describe "adhoc"."m{16, 17, 27, 31, 32, 36, 37}"
```

```sql
sqlline> select count(*) as c
. . . .> from "adhoc"."m{16, 17, 27, 31, 32, 36, 37}";
```

让我们列出表，您将看到几个更多的瓦片。还有foodmart模式的表，以及系统表TABLES和COLUMNS，以及格本身，它显示为一个名为star的表。

```sql
sqlline> !tables
```

# 统计 Statistics

选择物化格的瓦片的算法取决于许多统计信息。它需要知道对于正在考虑物化的每个列（a、b、c）的组合，从star中选择count(distinct a, b, c)。

因此，该算法在具有许多行和列的模式上需要很长时间。

我们正在开发一个数据分析器来解决这个问题。

# 格建议者 Lattice suggester

如果您定义了一个格，Calcite将在该格内进行自我调整。但如果您没有定义一个格呢？

这就是格建议者的用途，它根据传入的查询构建格。创建一个具有“autoLattice”: true的模型：

```json
{
  "version": "1.0",
  "defaultSchema": "foodmart",
  "schemas": [
    {
      "type": "jdbc",
      "name": "foodmart",
      "jdbcUser": "FOODMART",
      "jdbcPassword": "FOODMART",
      "jdbcUrl": "jdbc:hsqldb:res:foodmart",
      "jdbcSchema": "foodmart"
    },
    {
      "name": "adhoc",
      "autoLattice": true
    }
  ]
}
```

这是hsqldb-foodmart-lattice-model.json的简化版本。

当您运行查询时，Calcite将开始基于这些查询构建格。每个格基于一个特定的事实表。

随着对该事实表的更多查询，它将演化格，将更多维度表连接到星型表，并添加度量。

然后，每个格将根据数据和查询进行自我优化。目标是创建相对较小但基于更频繁使用的属性和度量的汇总表（瓦片）。

这个功能仍处于实验阶段，但有潜力使数据库比以前更加“自我调整”。

# 进一步的方向

以下是一些尚未实现的想法：

1. 构建瓦片的算法考虑了过去查询的日志。
2. 物化视图管理器查看传入的查询并为它们构建瓦片。
3. 物化视图管理器删除不活跃使用的瓦片。
4. 格建议者根据传入的查询添加格，将现有格的瓦片转移到新格，并删除不再使用的格。
5. 覆盖表的水平切片的瓦片；以及一种重写算法，可以通过拼接多个瓦片并访问原始数据来填补空洞来回答查询。
6. 提供API来在基础数据发生变化时使瓦片或瓦片的水平切片无效化。

# 参考资料

https://calcite.apache.org/docs/lattice.html

* any list
{:toc}