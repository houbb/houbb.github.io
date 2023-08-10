---
layout: post
title: database tool-03-concepts
date:  2023-08-10 +0800
categories: [Database]
tags: [database, migrate, sh]
published: true
---

# Baseline Migrations

在项目的一生中，可以在许多迁移中创建和破坏许多数据库对象，这些迁移留下了漫长的迁移历史，需要应用这些迁移的历史，以使新的环境达到速度。

取而代之的是，您可能希望添加一个累积的迁移，该迁移代表所有这些迁移而不受破坏现有环境的应用后，该迁移代表数据库的状态。

Flyway为您提供了一种使用基线迁移来实现此目的的方法。

## 怎么运行的

基线迁移以 B 为前缀，后跟它们代表的数据库版本。 

例如：B5__my_database.sql 表示应用 V5 及之前的所有版本化迁移后数据库的状态。

仅在部署到新环境时才使用基线迁移。 

如果在已经应用了一些Flyway迁移的环境中使用，基线迁移将被忽略。 

当您运行 migrate 时，新环境将选择最新的基线迁移作为起点。 

每个版本低于最新基线迁移版本的迁移都会被标记为忽略。

注意：

- 可重复的迁移正常执行

- 基线迁移不会取代版本化迁移 - 您可以在同一版本中同时拥有基线迁移和版本化迁移

- 基线迁移不附属于基线命令，并且在迁移过程中执行

该机制是完全自动化的，无需修改您的管道即可开始使用。 

只需在需要时添加基线迁移即可使用它们。

## 配置

B 前缀可使用 [benchmarkMigrationPrefix](https://documentation.red-gate.com/fd/flyway-cli-and-api/configuration/parameters/baseline-migration-prefix) 参数进行配置。

## 兼容性说明

基线迁移正式称为状态脚本。 

通过将状态脚本的前缀更改为 B 或将 benchmarkMigrationPrefix 参数的值设置为 S，这些可以用作基线迁移而无需修改。

# Callback concept

虽然迁移足以满足大多数需求，但在某些情况下需要您一遍又一遍地执行相同的操作。 

这可能是重新编译程序、更新物化视图和许多其他类型的内务处理。

因此，Flyway 为您提供了通过使用回调来挂钩其生命周期的可能性。

以下是 Flyway 支持的活动：

```
Name	Execution
beforeMigrate	Before Migrate runs
beforeRepeatables	Before all repeatable migrations during Migrate
beforeEachMigrate	Before every single migration during Migrate
beforeEachMigrateStatement Flyway Teams	Before every single statement of a migration during Migrate
afterEachMigrateStatement Flyway Teams	After every single successful statement of a migration during Migrate
afterEachMigrateStatementError Flyway Teams	After every single failed statement of a migration during Migrate
afterEachMigrate	After every single successful migration during Migrate
afterEachMigrateError	After every single failed migration during Migrate
afterMigrate	After successful Migrate runs
afterMigrateApplied	After successful Migrate runs where at least one migration has been applied
afterVersioned	After all versioned migrations during Migrate
afterMigrateError	After failed Migrate runs
beforeUndo Flyway Teams	Before Undo runs
beforeEachUndo Flyway Teams	Before every single migration during Undo
beforeEachUndoStatement Flyway Teams	Before every single statement of a migration during Undo
afterEachUndoStatement Flyway Teams	After every single successful statement of a migration during Undo
afterEachUndoStatementError Flyway Teams	After every single failed statement of a migration during Undo
afterEachUndo Flyway Teams	After every single successful migration during Undo
afterEachUndoError Flyway Teams	After every single failed migration during Undo
afterUndo Flyway Teams	After successful Undo runs
afterUndoError Flyway Teams	After failed Undo runs
beforeClean	Before Clean runs
afterClean	After successful Clean runs
afterCleanError	After failed Clean runs
beforeInfo	Before Info runs
afterInfo	After successful Info runs
afterInfoError	After failed Info runs
beforeValidate	Before Validate runs
afterValidate	After successful Validate runs
afterValidateError	After failed Validate runs
beforeBaseline	Before Baseline runs
afterBaseline	After successful Baseline runs
afterBaselineError	After failed Baseline runs
beforeRepair	Before Repair runs
afterRepair	After successful Repair runs
afterRepairError	After failed Repair runs
createSchema	Before automatically creating non-existent schemas
beforeConnect Flyway Teams	Before Flyway connects to the database
```

回调可以用 SQL 或 Java 实现。

## SQL 回调

挂钩 Flyway 生命周期的最方便方法是通过 SQL 回调。 

这些只是配置位置中遵循特定命名约定的 sql 文件：事件名称后跟 SQL 迁移后缀。

使用默认设置，Flyway 在其默认位置（命令行工具的 `<install_dir>/sql`）中查找 SQL 文件，例如 beforeMigrate.sql、beforeEachMigrate.sql、afterEachMigrate.sql，...

占位符替换的工作方式与 SQL 迁移类似。

可选地，回调还可以包括描述。 在这种情况下，回调名称由事件名称、分隔符、描述和后缀组成。 示例：beforeRepair__vacuum.sql。

注意：在扫描 SQL 回调时，Flyway 还将尊重您配置的任何 sqlMigrationSuffixes。

## Java回调

如果 SQL 回调对您来说不够灵活，您可以选择自己实现回调接口。 

您甚至可以在生命周期中挂钩多个回调实现。 

Java 回调具有额外的灵活性，单个回调实现可以处理多个生命周期事件，因此不受 SQL 回调命名约定的约束。

详细信息：[基于 Java 的回调](https://documentation.red-gate.com/fd/flyway-cli-and-api/usage/api-java/api-hooks#callsbacks)

## 脚本回调

与 SQL 回调非常相似，Flyway 也支持执行用脚本语言编写的回调。 

支持的文件扩展名与脚本迁移支持的文件扩展名相同。 

例如，您可以有一个 beforeRepair__vacuum.ps1 回调。 

脚本回调在迁移生命周期中为您提供了更大的灵活性和强大的功能。 

您可以实现的一些目标是：

- 在迁移之间执行外部工具

- 创建或清理本地文件以供迁移使用

## 回调排序 Callback ordering

当发现同一事件的多个回调时，它们将按字母顺序执行。


# Check concept

## 概述

在 Flyway 中，“检查”是我们用于对数据库迁移的某些方面进行部署前或部署后分析的统称。 

检查是使用顶级检查命令实例化的。

在对目标数据库（尤其是生产数据库）执行部署之前，您可能需要查看您将要执行的操作并了解以下一项或多项内容：

- 这组更改是否会影响我期望的对象，或者我会无意中对其他对象产生影响吗？

- 最近数据库发生了哪些变化，与我们看到的数据库性能变化相一致？ 两者有关联吗？

- 当我开始开发更改时，生产数据库是否处于您所期望的相同状态？ 目标数据库是否发生了任何变化，这意味着我的更改不再具有预期的效果？

- 我们的数据库变更开发方法是否符合我们的内部政策？ 例如，我们的迁移脚本是否遵守我们的命名约定？ 我们是否遵循外部监管要求所要求的安全最佳实践？

这些场景中的每一个都可以通过 check 命令来满足，并使用相应的标志：

| Scenario	| Command & Flag	| Edition	| Output | 
|:----|:----|:----|:----|
| 这些改变会达到我预期的效果吗？ | check -changes	| Enterprise | ChangeReport.html,ChangeReport.json|
| 最近数据库发生了哪些变化？ | check -changes	| Enterprise | ChangeReport.html,ChangeReport.json|
| 生产数据库是否处于我期望的状态？ | check -drift	| Enterprise | ChangeReport.html,ChangeReport.json|
| 下次部署时会执行什么SQL？ | check -dryrun	| Teams & Enterprise | ChangeReport.html,ChangeReport.json|
| 我们的改变是否遵循内部政策？ | check -code	| ALL | ChangeReport.html,ChangeReport.json|

# Dry Runs

当 Flyway 迁移数据库时，它会查找需要应用的迁移，对它们进行排序并直接针对数据库按顺序应用它们。

这种默认行为对于绝大多数情况来说都非常有用。

然而，在某些情况下您可能想要

- 预览 Flyway 将对数据库进行的更改

- 在应用 SQL 语句之前将其提交给 DBA 进行审查

- 使用 Flyway 确定需要更新的内容，但使用不同的工具来应用实际的数据库更改

Flyway Teams Edition 为您提供了一种使用试运行来实现所有这些场景的方法。

## 用法

API/Maven/Gradle 用户需要包含 Flyway-proprietary 作为依赖项才能使用试运行。 

例如：

```xml
<dependency>
    <groupId>org.flywaydb.enterprise</groupId>
    <artifactId>flyway-proprietary</artifactId>
    <version>9.21.1</version>
</dependency>
```

## 怎么运行的

进行试运行时，Flyway 会建立与数据库的只读连接。 

它评估需要运行的迁移并生成一个 SQL 文件，其中包含在常规迁移运行时将执行的所有语句。 

然后可以查看该 SQL 文件。 

如果满意，则可以指示 Flyway 迁移数据库并应用所有更改。 

或者，您也可以使用您选择的单独工具将试运行 SQL 文件直接应用到数据库，而无需使用 Flyway。 

该 SQL 文件还包含创建和更新 Flyway 的架构历史表所需的语句，确保以通常的方式跟踪所有架构更改。

不建议在生成试运行脚本后对其进行更改。 

相反，应该对迁移进行任何更改并生成新的试运行脚本。 

这是为了确保执行的更改与迁移中的内容匹配。

## 配置

使用 Flyway 命令行工具、Maven 插件或 Gradle 插件时，可以使用 Flyway.dryRunOutput 属性配置包含试运行输出的 SQL 文件。

这可以位于本地文件系统上，也可以位于 AWS S3 / Google Cloud Storage 中。

直接使用 API 时，可以使用 java.io.OutputStream 配置试运行输出，从而为您提供额外的灵活性。

一旦设置此属性，Flyway 就会进入试运行模式。 数据库不再被修改，所有已应用的 SQL 语句都将发送到试运行输出。

# Error Overrides

当 Flyway 执行 SQL 语句时，它会报告数据库返回的所有警告。 

如果返回错误，Flyway 将显示该错误以及所有必要的详细信息，将迁移标记为失败，并在可能的情况下自动回滚。

该错误通常如下所示：

```
Migration V1__Create_person_table.sql failed
--------------------------------------------
SQL State  : 42001
Error Code : 42001
Message    : Syntax error in SQL statement "CREATE TABLE1[*] PERSON "; expected "OR, FORCE, VIEW, ...
Location   : V1__Create_person_table.sql (/flyway-tutorial/V1__Create_person_table.sql)
Line       : 1
Statement  : create table1 PERSON
```

这种默认行为对于绝大多数情况来说都非常有用。

然而，在某些情况下您可能想要

- 将错误视为警告，因为您知道迁移稍后会正确处理它

- 将警告视为错误，因为您希望快速失败以便能够更快地解决问题

- 当数据库发出特定错误或警告时执行附加操作

Flyway Teams Edition 为您提供了一种使用错误覆盖来实现所有这些场景的方法。

## 配置

可以使用 errorOverrides 设置来配置一个或多个错误覆盖，该设置接受以下形式的多个错误覆盖定义：STATE:12345:W。

这是一个 5 个字符的 SQL 状态、一个冒号、SQL 错误代码、一个冒号，最后是应覆盖初始行为的所需行为。 接受以下行为：

- D 强制显示调试消息

- D-强制显示调试消息，但不显示原始sql状态和错误代码

- I 强制显示信息消息

- I- 强制显示信息消息，但不显示原始 sql 状态和错误代码

- W 强制警告

- W- 强制发出警告，但不显示原始sql状态和错误代码

- E 强制错误

- E-强制出错，但不显示原始sql状态和错误代码

如果没有配置匹配的错误覆盖，Flyway 将回退到其默认行为。

## 例子

以下是有关如何使用此功能的一些示例。

### 示例1：Oracle 存储过程编译失败时抛出错误

默认情况下，当 Oracle 存储过程编译失败时，驱动程序只会返回一条警告，Flyway 会输出该警告：

```
DB: Warning: execution completed with warning (SQL State: 99999 - Error Code: 17110)
```

要强制 Oracle 存储过程编译问题产生错误而不是警告，只需将以下内容添加到 Flyway 的配置中：

```
flyway.errorOverrides=99999:17110:E
```

所有 Oracle 存储过程编译失败都将立即导致错误。

### 示例 2：将 SQL Server PRINT 消息显示为简单信息消息

默认情况下，当执行 SQL Server PRINT 语句时，该消息将作为警告返回给客户端。 

这意味着以下语句：

```
PRINT 'Starting ...';
PRINT 'Done.';
```

默认情况下产生以下输出：

```
WARNING: DB: Starting ... (SQL State: S0001 - Error Code: 0)
WARNING: DB: Done. (SQL State: S0001 - Error Code: 0)
```

要强制这些 PRINT 语句生成简单的信息消息（没有 SQL 状态和错误代码详细信息）而不是警告，需要做的就是将以下内容添加到 Flyway 的配置中：

```
flyway.errorOverrides=S0001:0:I-
```

完成该设置后，输出将变成没有 SQL 状态和错误代码详细信息的信息消息：

```
Starting ...
Done.
```

## 高级编程配置

作为上面介绍的简单声明性语法的替代方案，您还可以通过实现基于 Java 的回调来完全自定义执行语句后 Flyway 的行为，该回调侦听 afterEachMigrateStatement、afterEachMigrateStatementError、afterEachUndoStatement 和 afterEachUndoStatementError 事件。

# Migrations

## 概述

对于 Flyway，对数据库的所有更改都称为迁移。 

迁移可以是版本化的，也可以是可重复的。 

版本化迁移有两种形式：常规迁移和撤消迁移（regular and undo）。

版本化迁移具有版本、描述和校验和。 

**版本必须是唯一的。 该描述纯粹是为了让您能够记住每次迁移的作用。 校验和用于检测意外更改。** 

版本化迁移是最常见的迁移类型。 它们仅按顺序应用一次。

或者，可以通过提供具有相同版本的撤消迁移来撤消它们的影响。

可重复迁移有描述和校验和，但没有版本。 它们不是只运行一次，而是在每次校验和更改时（重新）应用。

在单次迁移运行中，可重复迁移始终在所有挂起的版本化迁移执行完毕后最后应用。 可重复迁移按照其描述的顺序应用。

默认情况下，版本化迁移和可重复迁移都可以用 SQL 或 Java 编写，并且可以包含多个语句。

Flyway 自动发现文件系统和 Java 类路径上的迁移。

为了跟踪哪些迁移已在何时由谁应用，Flyway 向您的架构添加了一个架构历史记录表。

## 版本化迁移

最常见的迁移类型是版本化迁移。 

每个版本化迁移都有一个版本、描述和校验和。 

版本必须是唯一的。 该描述纯粹是为了让您能够记住每次迁移的作用。 校验和用于检测意外更改。 版本化迁移仅按顺序应用一次。

版本化迁移通常用于：

- Creating/altering/dropping tables/indexes/foreign keys/enums/UDTs/...

- Reference data updates

- User data corrections

```sql
CREATE TABLE car (
    id INT NOT NULL PRIMARY KEY,
    license_plate VARCHAR NOT NULL,
    color VARCHAR NOT NULL
);

ALTER TABLE owner ADD driver_license_id VARCHAR;

INSERT INTO brand (name) VALUES ('DeLorean');
```

每个版本化迁移都必须分配一个唯一的版本。 

只要符合通常的点分符号，任何版本都是有效的。 

对于大多数情况，您只需要一个简单的递增整数即可。 

然而，Flyway 非常灵活，所有这些版本都是有效的版本化迁移版本：

```
1
001
5.2
1.2.3.4.5.6.7.8.9
205.68
20130115113556
2013.1.15.11.35.56
2013.01.15.11.35.56
```

版本化迁移按照其版本顺序应用。 

正如您通常所期望的那样，版本按数字排序。

## 撤消迁移

撤消迁移与常规版本化迁移相反。 撤消迁移负责撤消具有相同版本的版本化迁移的影响。 

撤消迁移是可选的，并且不需要运行常规版本化迁移。

对于上面的示例，撤消迁移如下所示：

```sql
DELETE FROM brand WHERE name='DeLorean';

ALTER TABLE owner DROP driver_license_id;

DROP TABLE car;
```

### 重要笔记

虽然撤消迁移的想法很好，但不幸的是它有时在实践中会失败。 

一旦发生破坏性更改（drop, delete, truncate, ...），您就会开始遇到麻烦。 

即使您不这样做，您最终也会创建自制的替代方案来恢复备份，这也需要进行适当的测试。

撤消迁移假定整个迁移已成功，现在应该撤消。 这对于没有 DDL 事务的数据库上失败的版本化迁移没有帮助。 

为什么？ 迁移可能随时失败。 

如果您有 10 个语句，则第 1 个、第 5 个、第 7 个或第 10 个语句可能会失败。 

根本没有办法提前知道。 

相反，**撤消迁移是为了撤消整个版本化迁移而编写的，在这种情况下没有帮助**。

我们发现更可取的另一种方法是保持数据库与当前生产中部署的所有代码版本之间的向后兼容性。 

这样，失败的迁移就不是一场灾难。 

旧版本的应用程序仍然与数据库兼容，因此您只需回滚应用程序代码、调查并采取纠正措施即可。

这应该辅之以适当的、经过充分测试的备份和恢复策略。 

它独立于数据库结构，一旦经过测试并证明可以工作，任何迁移脚本都无法破坏它。 

为了获得最佳性能，并且如果您的基础架构支持此功能，我们建议您使用底层存储解决方案的快照技术。 

特别是对于较大的数据量，这可能比传统的备份和恢复快几个数量级。

### 可重复迁移

可重复迁移有描述和校验和，但没有版本。 

它们不是只运行一次，而是在每次校验和更改时（重新）应用。

这对于管理数据库对象非常有用，这些对象的定义可以简单地维护在版本控制的单个文件中。 

它们通常用于

- (Re-)creating views/procedures/functions/packages/...

- Bulk reference data reinserts

在单次迁移运行中，可重复迁移始终在所有挂起的版本化迁移执行完毕后最后应用。

可重复迁移按照其描述的顺序应用。

您有责任确保可以多次应用相同的可重复迁移。 

这通常涉及在 DDL 语句中使用 CREATE OR REPLACE 子句。

以下是可重复迁移的示例：

在单次迁移运行中，可重复迁移始终在所有挂起的版本化迁移执行完毕后最后应用。 

可重复迁移按照其描述的顺序应用。

您有责任确保可以多次应用相同的可重复迁移。 

这通常涉及在 DDL 语句中使用 CREATE OR REPLACE 子句。

以下是可重复迁移的示例：

```sql
CREATE OR REPLACE VIEW blue_cars AS
    SELECT id, license_plate FROM cars WHERE color='blue';
```

## 基于 SQL 的迁移

迁移通常是用 SQL 编写的。 

这使得您可以轻松开始并利用任何现有的脚本、工具和技能。 

它使您可以访问数据库的全套功能，并且无需了解任何中间转换层。

基于 SQL 的迁移通常用于

- DDL 更改（表、视图、触发器、序列等的 CREATE/ALTER/DROP 语句）

- 简单的参考数据更改（参考数据表中的CRUD）

- 简单的批量数据更改（常规数据表中的 CRUD）

## 基于Java的迁移

基于 Java 的迁移非常适合所有无法使用 SQL 轻松表达的更改。

这些通常是这样的

- BLOB 和 CLOB 更改

- 高级批量数据更改（重新计算、高级格式更改...）

### 校验和和验证

与 SQL 迁移不同，Java 迁移默认没有校验和，因此不参与 Flyway 验证的变更检测。 

这可以通过实现 getChecksum() 方法来解决，然后您可以使用该方法提供自己的校验和，然后将其存储并验证更改。

- Sample Class

```java
package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import java.sql.PreparedStatement;

/**
 * Example of a Java-based migration.
 */
public class V1_2__Another_user extends BaseJavaMigration {
    public void migrate(Context context) throws Exception {
        try (PreparedStatement statement =
                 context
                     .getConnection()
                     .prepareStatement("INSERT INTO test_user (name) VALUES ('Obelix')")) {
            statement.execute();
        }
    }
}
```


请注意，Java 迁移不会显式或由于 try-with-resources 语句而关闭数据库连接。

## 查询结果 Query Results

迁移主要是作为发布和部署自动化流程的一部分来执行，很少需要直观地检查 SQL 查询的结果。

然而，在某些情况下，这种手动检查是有意义的，因此当执行 SELECT 语句（或任何其他返回结果的语句）时，Flyway 将以通常的表格形式显示查询结果。

## 模式历史表 Schema History Table

为了跟踪哪些迁移已在何时由谁应用，Flyway 向您的架构添加了一个特殊的架构历史记录表。 

您可以将此表视为对架构执行的所有更改的完整审计跟踪。 

它还跟踪迁移校验和以及迁移是否成功。

## 模式创建 Schema creation

默认情况下，Flyway 将尝试创建 schemas 和 defaultSchema 配置选项提供的模式。 
可以使用 createSchemas 配置选项来切换此行为。


当您想要完全控制架构的创建方式时，这可能很有用。

createSchemas 选项和架构历史表

在运行迁移之前，Flyway 需要一个用于架构历史表的架构。 

当 createSchemas 为 false 时，将无法创建模式历史表，除非已存在可供其驻留的模式。

因此，给出这样的配置：

```
flyway.createSchemas=false
flyway.schemas=my_schema
```

# 小结

我们在设计框架的时候，要给用户留足钩子函数，或者拓展，便于用户自定义处理。

设计一个工具的时候，对应的生态：

- command line

windows/linux/macos 跨端

- java api

- desktop、web

- maven/gradle 插件

- docker

# 参考资料

https://documentation.red-gate.com/fd/concepts-184127447.html

https://documentation.red-gate.com/fd/check-concept-184127467.html

* any list
{:toc}d