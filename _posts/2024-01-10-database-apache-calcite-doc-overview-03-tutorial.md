---
layout: post
title: Apache Calcite 动态数据管理框架-03-tutorial
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 教程

这是一个逐步教程，展示如何构建和连接到Calcite。

它使用一个简单的适配器，使CSV文件目录看起来像是包含表的模式。Calcite完成其余的工作，并提供了完整的SQL界面。

Calcite-example-CSV是Calcite的一个完全功能的适配器，它读取CSV（逗号分隔值）格式的文本文件。

令人惊讶的是，仅几百行的Java代码就足以提供完整的SQL查询功能。

CSV还作为构建适配器以适应其他数据格式的模板。即使代码行数不多，它涵盖了几个重要概念：

- 使用SchemaFactory和Schema接口的用户定义模式；
- 在模型JSON文件中声明模式；
- 在模型JSON文件中声明视图；
- 使用Table接口的用户定义表；
- 确定表的记录类型；
- 使用ScannableTable接口的Table的简单实现，直接枚举所有行；
- 更高级的实现，实现FilterableTable，可以根据简单的谓词过滤行；
- 使用TranslatableTable的Table的高级实现，根据规划规则将其翻译为关系运算符。

## 下载和构建

您需要安装Java（版本8、9或10）和Git。

```bash
$ git clone https://github.com/apache/calcite.git
$ cd calcite/example/csv
$ ./sqlline
```

## 首次查询

现在让我们使用sqlline连接到Calcite，这是该项目中包含的SQL shell。

```bash
$ ./sqlline
sqlline> !connect jdbc:calcite:model=src/test/resources/model.json admin admin
```

（如果您在Windows上运行，请使用sqlline.bat命令。）

执行查询：

```
sqlline> !tables
+-----------+-------------+------------+--------------+---------+----------+------------+-----------+---------------------------+----------------+
| TABLE_CAT | TABLE_SCHEM | TABLE_NAME |  TABLE_TYPE  | REMARKS | TYPE_CAT | TYPE_SCHEM | TYPE_NAME | SELF_REFERENCING_COL_NAME | REF_GENERATION |
+-----------+-------------+------------+--------------+---------+----------+------------+-----------+---------------------------+----------------+
|           | SALES       | DEPTS      | TABLE        |         |          |            |           |                           |                |
|           | SALES       | EMPS       | TABLE        |         |          |            |           |                           |                |
|           | SALES       | SDEPTS     | TABLE        |         |          |            |           |                           |                |
|           | metadata    | COLUMNS    | SYSTEM TABLE |         |          |            |           |                           |                |
|           | metadata    | TABLES     | SYSTEM TABLE |         |          |            |           |                           |                |
+-----------+-------------+------------+--------------+---------+----------+------------+-----------+---------------------------+----------------+
```

（JDBC专家请注意：sqlline的`!tables`命令只是在幕后执行`DatabaseMetaData.getTables()`。它还有其他用于查询JDBC元数据的命令，如`!columns`和`!describe`。）

正如您所看到的，系统中有5张表：在当前的SALES模式中有EMPS、DEPTS和SDEPTS表，以及在系统元数据模式中有COLUMNS和TABLES表。

系统表始终存在于Calcite中，但其他表是由模式的具体实现提供的；在这种情况下，EMPS、DEPTS和SDEPTS表基于resources/sales目录中的EMPS.csv.gz、DEPTS.csv和SDEPTS.csv文件。

让我们对这些表执行一些查询，以显示Calcite提供了SQL的完整实现。

首先，进行表扫描：

```
sqlline> SELECT * FROM emps;
+-------+-------+--------+--------+---------------+-------+------+---------+---------+------------+
| EMPNO | NAME  | DEPTNO | GENDER |     CITY      | EMPID | AGE  | SLACKER | MANAGER |  JOINEDAT  |
+-------+-------+--------+--------+---------------+-------+------+---------+---------+------------+
| 100   | Fred  | 10     |        |               | 30    | 25   | true    | false   | 1996-08-03 |
| 110   | Eric  | 20     | M      | San Francisco | 3     | 80   |         | false   | 2001-01-01 |
| 110   | John  | 40     | M      | Vancouver     | 2     | null | false   | true    | 2002-05-03 |
| 120   | Wilma | 20     | F      |               | 1     | 5    |         | true    | 2005-09-07 |
| 130   | Alice | 40     | F      | Vancouver     | 2     | null | false   | true    | 2007-01-01 |
+-------+-------+--------+--------+---------------+-------+------+---------+---------+------------+
```

JOIN 和 group by

```
sqlline> SELECT d.name, COUNT(*)
. . . .> FROM emps AS e JOIN depts AS d ON e.deptno = d.deptno
. . . .> GROUP BY d.name;
+------------+---------+
|    NAME    | EXPR$1  |
+------------+---------+
| Sales      | 1       |
| Marketing  | 2       |
+------------+---------+
```

最后，VALUES运算符生成一行数据，是测试表达式和SQL内置函数的便捷方式：

```
sqlline> VALUES CHAR_LENGTH('Hello, ' || 'world!');
+---------+
| EXPR$0  |
+---------+
| 13      |
+---------+
```

Calcite拥有许多其他SQL功能。我们在这里没有时间覆盖它们。写一些更多的查询来进行实验。

# 模式发现

那么，Calcite是如何发现这些表的呢？请记住，核心Calcite对CSV文件一无所知。（作为一个“没有存储层的数据库”，Calcite对任何文件格式都一无所知。）Calcite知道这些表，是因为我们告诉它运行calcite-example-csv项目中的代码。

这个过程中有一系列步骤。首先，我们基于模型文件中的模式工厂类定义一个模式。然后模式工厂创建一个模式，模式创建了多个表，每个表知道如何通过扫描CSV文件获取数据。

最后，在Calcite解析了查询并计划使用这些表后，Calcite调用这些表在查询执行时读取数据。现在让我们更详细地看看这些步骤。

在JDBC连接字符串中，我们提供了一个JSON格式的模型路径。

以下是该模型：

```
{
  version: '1.0',
  defaultSchema: 'SALES',
  schemas: [
    {
      name: 'SALES',
      type: 'custom',
      factory: 'org.apache.calcite.adapter.csv.CsvSchemaFactory',
      operand: {
        directory: 'sales'
      }
    }
  ]
}
```

该模型定义了一个名为'SALES'的模式。

该模式由一个插件类（org.apache.calcite.adapter.csv.CsvSchemaFactory）支持，该类是calcite-example-csv项目的一部分，实现了Calcite接口SchemaFactory。

其create方法实例化一个模式，并传递模型文件中的目录参数：

```java
public Schema create(SchemaPlus parentSchema, String name,
    Map<String, Object> operand) {
  final String directory = (String) operand.get("directory");
  final File base =
      (File) operand.get(ModelHandler.ExtraOperand.BASE_DIRECTORY.camelName);
  File directoryFile = new File(directory);
  if (base != null && !directoryFile.isAbsolute()) {
    directoryFile = new File(base, directory);
  }
  String flavorName = (String) operand.get("flavor");
  CsvTable.Flavor flavor;
  if (flavorName == null) {
    flavor = CsvTable.Flavor.SCANNABLE;
  } else {
    flavor = CsvTable.Flavor.valueOf(flavorName.toUpperCase(Locale.ROOT));
  }
  return new CsvSchema(directoryFile, flavor);
}
```

受模型驱动，模式工厂实例化了一个名为'SALES'的模式。该模式是org.apache.calcite.adapter.csv.CsvSchema的实例，并实现了Calcite接口Schema。

一个模式的工作是生成表的列表。（它还可以列出子模式和表函数，但这些是高级功能，calcite-example-csv不支持它们。）表实现了Calcite的Table接口。

CsvSchema生成CsvTable及其子类的实例。

以下是CsvSchema中的相关代码，覆盖了AbstractSchema基类中的getTableMap()方法。

```java
private Map<String, Table> createTableMap() {
  // Look for files in the directory ending in ".csv", ".csv.gz", ".json",
  // ".json.gz".
  final Source baseSource = Sources.of(directoryFile);
  File[] files = directoryFile.listFiles((dir, name) -> {
    final String nameSansGz = trim(name, ".gz");
    return nameSansGz.endsWith(".csv")
        || nameSansGz.endsWith(".json");
  });
  if (files == null) {
    System.out.println("directory " + directoryFile + " not found");
    files = new File[0];
  }
  // Build a map from table name to table; each file becomes a table.
  final ImmutableMap.Builder<String, Table> builder = ImmutableMap.builder();
  for (File file : files) {
    Source source = Sources.of(file);
    Source sourceSansGz = source.trim(".gz");
    final Source sourceSansJson = sourceSansGz.trimOrNull(".json");
    if (sourceSansJson != null) {
      final Table table = new JsonScannableTable(source);
      builder.put(sourceSansJson.relative(baseSource).path(), table);
    }
    final Source sourceSansCsv = sourceSansGz.trimOrNull(".csv");
    if (sourceSansCsv != null) {
      final Table table = createTable(source);
      builder.put(sourceSansCsv.relative(baseSource).path(), table);
    }
  }
  return builder.build();
}

/** Creates different sub-type of table based on the "flavor" attribute. */
private Table createTable(Source source) {
  switch (flavor) {
  case TRANSLATABLE:
    return new CsvTranslatableTable(source, null);
  case SCANNABLE:
    return new CsvScannableTable(source, null);
  case FILTERABLE:
    return new CsvFilterableTable(source, null);
  default:
    throw new AssertionError("Unknown flavor " + this.flavor);
  }
}
```

# Tables and views in schemasPermalink

请注意，我们无需在模型中定义任何表；模式会自动生成这些表。

您可以使用模式的tables属性定义超出自动创建的表之外的额外表。

让我们看看如何创建一种重要且有用的表类型，即视图。

视图在编写查询时看起来像表，但它不存储数据。它通过执行查询派生其结果。

视图在查询计划时被展开，因此查询规划器通常可以执行优化，比如从SELECT子句中删除在最终结果中未使用的表达式。

以下是定义视图的模式：

```js
{
  version: '1.0',
  defaultSchema: 'SALES',
  schemas: [
    {
      name: 'SALES',
      type: 'custom',
      factory: 'org.apache.calcite.adapter.csv.CsvSchemaFactory',
      operand: {
        directory: 'sales'
      },
      tables: [
        {
          name: 'FEMALE_EMPS',
          type: 'view',
          sql: 'SELECT * FROM emps WHERE gender = \'F\''
        }
      ]
    }
  ]
}
```

该行`type: 'view'`将FEMALE_EMPS标记为视图，而不是常规表或自定义表。

请注意，在视图定义中，使用反斜杠转义单引号，这是JSON中的正常方式。

JSON并不容易编写长字符串，因此Calcite支持另一种语法。

如果您的视图有一个很长的SQL语句，您可以提供一系列行而不是单个字符串：

```js
{
  name: 'FEMALE_EMPS',
  type: 'view',
  sql: [
    'SELECT * FROM emps',
    'WHERE gender = \'F\''
  ]
}
```

现在我们已经定义了一个视图，我们可以在查询中使用它，就像它是一个表一样：

```
sqlline> SELECT e.name, d.name FROM female_emps AS e JOIN depts AS d on e.deptno = d.deptno;
+--------+------------+
|  NAME  |    NAME    |
+--------+------------+
| Wilma  | Marketing  |
+--------+------------+
```

# 自定义表

自定义表是由用户定义的代码驱动的表。它们不需要存在于自定义模式中。

模型文件 model-with-custom-table.json 中有一个例子：

```js
{
  version: '1.0',
  defaultSchema: 'CUSTOM_TABLE',
  schemas: [
    {
      name: 'CUSTOM_TABLE',
      tables: [
        {
          name: 'EMPS',
          type: 'custom',
          factory: 'org.apache.calcite.adapter.csv.CsvTableFactory',
          operand: {
            file: 'sales/EMPS.csv.gz',
            flavor: "scannable"
          }
        }
      ]
    }
  ]
}
```

我们可以以通常的方式查询这个表：

```
sqlline> !connect jdbc:calcite:model=src/test/resources/model-with-custom-table.json admin admin
sqlline> SELECT empno, name FROM custom_table.emps;
+--------+--------+
| EMPNO  |  NAME  |
+--------+--------+
| 100    | Fred   |
| 110    | Eric   |
| 110    | John   |
| 120    | Wilma  |
| 130    | Alice  |
+--------+--------+
```

该模式是一个常规模式，包含一个由org.apache.calcite.adapter.csv.CsvTableFactory支持的自定义表，该工厂实现了Calcite接口TableFactory。

其create方法实例化一个CsvScannableTable，并传递模型文件中的文件参数：

```java
public CsvTable create(SchemaPlus schema, String name,
    Map<String, Object> operand, @Nullable RelDataType rowType) {
  String fileName = (String) operand.get("file");
  final File base =
      (File) operand.get(ModelHandler.ExtraOperand.BASE_DIRECTORY.camelName);
  final Source source = Sources.file(base, fileName);
  final RelProtoDataType protoRowType =
      rowType != null ? RelDataTypeImpl.proto(rowType) : null;
  return new CsvScannableTable(source, protoRowType);
}
```

实现自定义表通常是实现自定义模式的一个更简单的替代方案。这两种方法最终可能会创建Table接口的类似实现，但对于自定义表，您无需实现元数据发现。

（CsvTableFactory创建CsvScannableTable，就像CsvSchema一样，但表实现不会扫描文件系统以查找.csv文件。）

自定义表对于模型的作者来说需要更多的工作（作者需要显式指定每个表及其文件），但也为作者提供了更多的控制权（例如，为每个表提供不同的参数）。

# 在模型中可以使用/* ... */和//语法添加注释：

```js
{
  version: '1.0',
  /* Multi-line
     comment. */
  defaultSchema: 'CUSTOM_TABLE',
  // Single-line comment.
  schemas: [
    ..
  ]
}
```

# 使用规划器规则优化查询

到目前为止，我们看到的表实现在表不包含大量数据时是可以的。

但是，如果您的客户表有，例如，一百个列和一百万行，您希望系统不会为每个查询检索所有数据。

您希望Calcite与适配器协商，并找到更有效访问数据的方式。

这种协商是查询优化的一种简单形式。Calcite通过添加规划器规则来支持查询优化。

规划器规则通过查找查询解析树中的模式（例如，特定类型的表上的项目）来运行，并用实现优化的新节点集替换树中的匹配节点。

规划器规则也是可扩展的，就像模式和表一样。

因此，如果您有一个要通过SQL访问的数据存储，您首先定义一个自定义表或模式，然后定义一些规则以使访问更有效。

为了看到这一点的实际效果，让我们使用一个规划器规则从CSV文件中访问列的子集。

让我们针对两个非常相似的模式运行相同的查询：

```
sqlline> !connect jdbc:calcite:model=src/test/resources/model.json admin admin
sqlline> explain plan for select name from emps;
+-----------------------------------------------------+
| PLAN                                                |
+-----------------------------------------------------+
| EnumerableCalc(expr#0..9=[{inputs}], NAME=[$t1])    |
|   EnumerableTableScan(table=[[SALES, EMPS]])        |
+-----------------------------------------------------+
sqlline> !connect jdbc:calcite:model=src/test/resources/smart.json admin admin
sqlline> explain plan for select name from emps;
+-----------------------------------------------------+
| PLAN                                                |
+-----------------------------------------------------+
| CsvTableScan(table=[[SALES, EMPS]], fields=[[1]])   |
+-----------------------------------------------------+
```

导致计划差异的原因是什么？让我们追踪证据的线索。在smart.json模型文件中，只多了一行：

```json
flavor: "translatable"
```

这导致创建一个带有`flavor = TRANSLATABLE`的CsvSchema，它的createTable方法创建了CsvTranslatableTable的实例，而不是CsvScannableTable。

CsvTranslatableTable实现了TranslatableTable.toRel()方法，用于创建CsvTableScan。表扫描是查询运算符树的叶子。

通常的实现是EnumerableTableScan，但我们创建了一个独特的子类型，将触发规则。

以下是规则的完整内容：

```java
public class CsvProjectTableScanRule
    extends RelRule<CsvProjectTableScanRule.Config> {

  /** Creates a CsvProjectTableScanRule. */
  protected CsvProjectTableScanRule(Config config) {
    super(config);
  }

  @Override public void onMatch(RelOptRuleCall call) {
    final LogicalProject project = call.rel(0);
    final CsvTableScan scan = call.rel(1);
    int[] fields = getProjectFields(project.getProjects());
    if (fields == null) {
      // Project contains expressions more complex than just field references.
      return;
    }
    call.transformTo(
        new CsvTableScan(
            scan.getCluster(),
            scan.getTable(),
            scan.csvTable,
            fields));
  }

  private static int[] getProjectFields(List<RexNode> exps) {
    final int[] fields = new int[exps.size()];
    for (int i = 0; i < exps.size(); i++) {
      final RexNode exp = exps.get(i);
      if (exp instanceof RexInputRef) {
        fields[i] = ((RexInputRef) exp).getIndex();
      } else {
        return null; // not a simple projection
      }
    }
    return fields;
  }

  /** Rule configuration. */
  @Value.Immutable(singleton = false)
  public interface Config extends RelRule.Config {
    Config DEFAULT = ImmutableCsvProjectTableScanRule.Config.builder()
        .withOperandSupplier(b0 ->
            b0.operand(LogicalProject.class).oneInput(b1 ->
                b1.operand(CsvTableScan.class).noInputs()))
        .build();

    @Override default CsvProjectTableScanRule toRule() {
      return new CsvProjectTableScanRule(this);
    }
  }
}
```

规则的默认实例位于CsvRules持有类中：

```java
public abstract class CsvRules {
  public static final CsvProjectTableScanRule PROJECT_SCAN =
      CsvProjectTableScanRule.Config.DEFAULT.toRule();
}
```

在默认配置中的`withOperandSupplier`方法的调用（在Config接口的DEFAULT字段中）声明了将导致规则触发的关系表达式的模式。

如果Planner看到一个LogicalProject，其唯一的输入是没有输入的CsvTableScan，则Planner将调用该规则。

规则的变体是可能的。例如，不同的规则实例可能匹配CsvTableScan上的EnumerableProject。

`onMatch`方法生成一个新的关系表达式，并调用`RelOptRuleCall.transformTo()`来指示规则已成功触发。

规则的默认实例位于CsvRules持有类中：

```java
public abstract class CsvRules {
  public static final CsvProjectTableScanRule PROJECT_SCAN =
      CsvProjectTableScanRule.Config.DEFAULT.toRule();
}
```

在默认配置中的`withOperandSupplier`方法的调用（在Config接口的DEFAULT字段中）声明了将导致规则触发的关系表达式的模式。

如果Planner看到一个LogicalProject，其唯一的输入是没有输入的CsvTableScan，则Planner将调用该规则。

规则的变体是可能的。例如，不同的规则实例可能匹配CsvTableScan上的EnumerableProject。

`onMatch`方法生成一个新的关系表达式，并调用`RelOptRuleCall.transformTo()`来指示规则已成功触发。

# The query optimization processPermalink

关于Calcite查询规划器有很多值得介绍的地方，但我们在这里不会详细介绍。

这种聪明性的设计是为了减轻您，也就是规划器规则的编写者的负担。

首先，Calcite不按照规定的顺序触发规则。查询优化过程遵循分支树的许多分支，就像象棋程序检查许多可能的移动序列一样。

如果规则A和规则B都匹配查询运算符树的给定部分，那么Calcite可以同时触发它们。

其次，Calcite在选择计划时使用成本，但成本模型并不阻止触发可能在短期内看起来更昂贵的规则。

许多优化器采用线性优化方案。面对如上所述的规则A和规则B之间的选择，这样的优化器需要立即做出选择。它可能有一个策略，比如“对整个树应用规则A，然后对整个树应用规则B”，或者应用基于成本的策略，应用产生更便宜结果的规则。

Calcite不需要这样的妥协。这使得将各种规则集合在一起变得简单。例如，如果您想要将识别材料化视图的规则与从CSV和JDBC源系统读取的规则相结合，您只需给Calcite提供所有规则集，并告诉它进行处理。

Calcite确实使用成本模型。成本模型决定最终使用哪个计划，并有时修剪搜索树以防止搜索空间膨胀，但它从不强迫您在规则A和规则B之间做出选择。这很重要，因为它避免了陷入实际上不是最优的搜索空间中的局部最小值。

此外（您猜对了），成本模型是可插拔的，以及它所基于的表和查询运算符统计信息也是可插拔的。

但这可能是以后的话题。

# JDBC适配器

JDBC适配器将JDBC数据源中的模式映射为Calcite模式。

例如，以下模式从MySQL的“foodmart”数据库中读取：

```js
{
  version: '1.0',
  defaultSchema: 'FOODMART',
  schemas: [
    {
      name: 'FOODMART',
      type: 'custom',
      factory: 'org.apache.calcite.adapter.jdbc.JdbcSchema$Factory',
      operand: {
        jdbcDriver: 'com.mysql.jdbc.Driver',
        jdbcUrl: 'jdbc:mysql://localhost/foodmart',
        jdbcUser: 'foodmart',
        jdbcPassword: 'foodmart'
      }
    }
  ]
}
```

（对于那些使用Mondrian OLAP引擎的人来说，FoodMart数据库会很熟悉，因为它是Mondrian的主要测试数据集。要加载数据集，请按照Mondrian的安装说明进行操作。）

JDBC适配器将尽可能将处理推送到源系统，同时翻译语法、数据类型和内置函数。

如果Calcite查询基于来自单个JDBC数据库的表，原则上整个查询应该发送到该数据库。

如果表来自多个JDBC源，或者是JDBC和非JDBC的混合，Calcite将使用尽可能高效的分布式查询方法。

# 克隆 JDBC 适配器

克隆 JDBC 适配器创建了一个混合数据库。数据来自 JDBC 数据库，但是在每次首次访问表时，数据被读入内存表中。

Calcite基于这些内存表评估查询，实际上是数据库的缓存。

例如，以下模型从 MySQL 的 "foodmart" 数据库中读取表：

```js
{
  version: '1.0',
  defaultSchema: 'FOODMART_CLONE',
  schemas: [
    {
      name: 'FOODMART_CLONE',
      type: 'custom',
      factory: 'org.apache.calcite.adapter.clone.CloneSchema$Factory',
      operand: {
        jdbcDriver: 'com.mysql.jdbc.Driver',
        jdbcUrl: 'jdbc:mysql://localhost/foodmart',
        jdbcUser: 'foodmart',
        jdbcPassword: 'foodmart'
      }
    }
  ]
}
```

另一种技术是在现有模式的基础上构建克隆模式。

您可以使用 `source` 属性引用模型中先前定义的模式，如下所示：

```js
{
  version: '1.0',
  defaultSchema: 'FOODMART_CLONE',
  schemas: [
    {
      name: 'FOODMART',
      type: 'custom',
      factory: 'org.apache.calcite.adapter.jdbc.JdbcSchema$Factory',
      operand: {
        jdbcDriver: 'com.mysql.jdbc.Driver',
        jdbcUrl: 'jdbc:mysql://localhost/foodmart',
        jdbcUser: 'foodmart',
        jdbcPassword: 'foodmart'
      }
    },
    {
      name: 'FOODMART_CLONE',
      type: 'custom',
      factory: 'org.apache.calcite.adapter.clone.CloneSchema$Factory',
      operand: {
        source: 'FOODMART'
      }
    }
  ]
}
```

您可以使用此方法在任何类型的模式上创建克隆模式，不仅限于 JDBC。

克隆适配器并非是全部和终极解决方案。我们计划开发更复杂的缓存策略，以及更完整和高效的内存表实现，但目前克隆 JDBC 适配器展示了可能性，使我们能够尝试我们的初始实现。

# 参考资料

https://calcite.apache.org/docs/tutorial.html

* any list
{:toc}