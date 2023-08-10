---
layout: post
title: database tool-06-tutorial
date:  2023-08-10 +0800
categories: [Database]
tags: [database, migrate, sh]
published: true
---

# Tutorial - Baseline Migrations

## 介绍

在项目的生命周期中，可能会在多次迁移中创建和销毁许多数据库对象，这会留下漫长的迁移历史，需要应用这些迁移历史才能使新环境加快速度。

相反，您可能希望添加单个累积迁移来表示应用所有这些迁移后数据库的状态，而不破坏现有环境。

基线迁移可以让您实现这一目标。 这些是一种新类型的迁移，**与版本化迁移类似，只是以 B 作为前缀**。

在现有部署中，它们没有任何作用，因为您的数据库已经位于需要的位置。 

在新环境中，首先应用最新版本的基线迁移，以便在应用后续迁移之前使数据库加快速度。 任何版本早于最新基线迁移版本的迁移都不会应用，并被视为被忽略。

请注意，可重复迁移会正常执行。

## Example

假设我们有下面3个文件：

```
V1__create_two_tables.sql
V2__drop_one_table.sql
V3__alter_column.sql
```

如果我们按顺序执行这些迁移，我们将经历创建两个表、删除其中一个表并最终更改剩余表中的列的过程。

我们可能会认为创建最终表更容易，因为它会在应用这 3 个迁移结束时进行，以便简化我们执行的 SQL 以及迁移，而不是为每个环境都经历这一过程 历史。

为了实现这一点，我们只需要创建以下迁移：

```
B3__create_table.sql
```

这应该包含代表我们应用原始 3 次迁移后的环境的 SQL。 

将此迁移添加到我们现有的环境后，我们将注意到运行 Flyway info 后没有任何差异，如以下输出所示：

```
+-----------+---------+-------------------+------+---------------------+---------+----------+
| Category  | Version | Description       | Type | Installed On        | State   | Undoable |
+-----------+---------+-------------------+------+---------------------+---------+----------+
| Versioned | 1       | create two tables | SQL  |         ...         | Success | No       |
| Versioned | 2       | drop one table    | SQL  |         ...         | Success | No       |
| Versioned | 3       | alter column      | SQL  |         ...         | Success | No       |
+-----------+---------+-------------------+------+---------------------+---------+----------+
```

但是，当我们在新环境中应用迁移时，flyway info 将显示以下输出：

```
+-----------+---------+--------------+------------------+--------------+---------+----------+
| Category  | Version | Description  | Type             | Installed On | State   | Undoable |
+-----------+---------+--------------+------------------+--------------+---------+----------+
| Versioned | 3       | create table |   SQL_BASELINE   |              | Pending | No       |
+-----------+---------+--------------+------------------+--------------+---------+----------+
```

版本小于或等于最新基线迁移版本的迁移将被忽略。 

运行 Flyway migrate 将导致仅应用 B3 脚本，历史记录表将显示以下结果：

```
+-----------+---------+--------------+------------------+---------------------+----------+----------+
| Category  | Version | Description  | Type             | Installed On        | State    | Undoable |
+-----------+---------+--------------+------------------+---------------------+----------+----------+
| Versioned | 3       | create table |   SQL_BASELINE   |         ...         | Baseline | No       |
+-----------+---------+--------------+------------------+---------------------+----------+----------+
```

## 概括

在这个简短的教程中，我们了解了如何：

使用基线迁移来表示新环境中的新基线


# Tutorial - Callbacks

本教程假设您已成功完成快速入门：命令行教程。 

如果您还没有这样做，请先这样做。 本教程将从该教程结束的地方继续。

这个简短的教程将教如何使用回调。 

它将引导您完成如何创建和使用它们的步骤。

## 介绍

回调让你能够进入 Flyway 的生命周期。 

当您一遍又一遍地执行相同的内务操作时，这特别有用。

它们通常用于

- 重新编译程序

- 更新物化视图

- 存储管理（例如 PostgreSQL 的 VACUUM）

## 查看状态

完成快速入门：命令行后，您现在可以执行

```
> flyway info
```

信息如下：

```
Database: jdbc:h2:file:./foobardb (H2 1.4)
                     
+-----------+---------+---------------------+------+---------------------+---------+----------+
| Category  | Version | Description         | Type | Installed On        | State   | Undoable |
+-----------+---------+---------------------+------+---------------------+---------+----------+
| Versioned | 1       | Create person table | SQL  | 2017-12-21 18:05:10 | Success | No       |
| Versioned | 2       | Add people          | SQL  | 2017-12-21 18:05:10 | Success | No       |
+-----------+---------+---------------------+------+---------------------+---------+----------+
```

## 创建回调

现在，让我们创建一个回调，以在迁移运行之前将所有数据刷新到磁盘。 

为此，我们将利用 Flyway 的 beforeMigrate 回调。

因此，继续在 /sql 目录中创建 beforeMigrate.sql：

```sql
CHECKPOINT SYNC;
```

## 触发回调

为了触发回调的执行，我们将再次清理并迁移数据库。

所以继续调用

```
> flyway clean migrate
```

结果如下：

```
Database: jdbc:h2:file:./foobardb (H2 1.4)
Successfully cleaned schema "PUBLIC" (execution time 00:00.003s)
Successfully validated 2 migrations (execution time 00:00.010s)
Executing SQL callback: beforeMigrate
Creating Schema History table: "PUBLIC"."flyway_schema_history"
Current version of schema "PUBLIC": << Empty Schema >>
Migrating schema "PUBLIC" to version 1 - Create person table
Migrating schema "PUBLIC" to version 2 - Add people
Successfully applied 2 migrations to schema "PUBLIC" (execution time 00:00.034s)
```


正如预期，我们可以看到 beforeMigrate 回调在 migrate 操作之前被触发并成功执行。 以后每次再次调用 migrate 时，回调都会再次执行。

## 概括

在这个简短的教程中，我们了解了如何

- 创建回调

- 触发回调的执行

# Tutorial - Custom Validation Rules

## 介绍

Flyway 根据自己的约定来验证您的迁移，但是随着项目生命周期的增加，不可避免地会出现修补程序、删除的迁移和其他违反 Flyway 验证约定的更改。

ignoreMigrationPatterns 让您添加自己的验证规则来告诉 Flyway 哪些迁移是有效的。

您可以在此处了解如何配置ignoreMigrationPatterns。 

总之，ignoreMigrationPatterns 允许您指定表单 type:status 的模式列表，并且在验证期间忽略与任何这些模式匹配的任何迁移。

您可以在此处观看展示如何使用ignoreMigrationPatterns 参数的视频。

示例：忽略丢失的可重复迁移和待处理的版本化迁移

假设我们的架构历史表如下：

```
+------------+---------+-------------+------+--------------+---------+----------+
| Category   | Version | Description | Type | Installed On | State   | Undoable |
+------------+---------+-------------+------+--------------+---------+----------+
| Repeatable |         | repeatable  | SQL  |      ...     | Missing |          |
| Versioned  | 1       | first       | SQL  |              | Pending | No       |
+------------+---------+-------------+------+--------------+---------+----------+
```

我们首先缺少可重复的迁移和待定的版本化迁移。 

对于这两个迁移，运行 Flyway 验证都会失败，并错误地指出存在“检测到的已应用迁移未在本地解析”和“检测到已解析的迁移未应用于数据库”。

虽然此处 validate 的默认行为会导致错误，但您可能不希望在这种情况下出错。

如果故意删除可重复的怎么办？ 

当无法保留每次迁移时，可能会出现这种情况。 

特别是，您可能会删除可重复的迁移，但不会删除版本化的迁移，并且您需要一种验证方法来反映这一点。 

在第一种情况下，如果您在应用新迁移之前进行验证，那么您不希望任何待处理的迁移失败。 

相反，您希望确保迄今为止已应用的迁移可以成功验证。

要获得所需的结果，只需将模式列表传递给ignoreMigrationPatterns，其值为repeatable:missing,versioned:pending。 

Flyway 验证将不再因缺少可重复迁移或挂起的版本化迁移而失败。

## 概括

在这个简短的教程中，我们了解了如何：

配置ignoreMigrationPatterns以忽略丢失的可重复迁移和挂起的版本化迁移

# Tutorial - Dry Runs

本教程假设您已成功完成快速入门：命令行教程。 如果您还没有这样做，请先这样做。 本教程将从该教程停止的地方继续。

这个简短的教程将教授如何进行试运行。 

它将引导您完成如何使用它们的步骤。

## 介绍

试运行非常适合您可能想要执行以下操作的情况：

- 预览 Flyway 将对数据库进行的更改

- 在应用 SQL 语句之前将其提交给 DBA 进行审查

- 使用 Flyway 确定需要更新的内容，但使用不同的工具来应用实际的数据库更改

进行试运行时，Flyway 会建立与数据库的只读连接。 

它评估需要运行的迁移并生成一个 SQL 文件，其中包含在常规迁移运行时将执行的所有语句。 

然后可以查看该 SQL 文件。 

如果满意，则可以指示 Flyway 迁移数据库并应用所有更改。 

或者，您也可以使用您选择的单独工具将试运行 SQL 文件直接应用到数据库，而无需使用 Flyway。 

该 SQL 文件还包含创建和更新 Flyway 的架构历史表所需的语句，确保以通常的方式跟踪所有架构更改。

## 查看状态

完成快速入门：命令行后，您现在可以执行

```
> flyway info
```

如下：

```
Database: jdbc:h2:file:./target/foobar (H2 1.4))

+-----------+---------+---------------------+------+---------------------+---------+
| Category  | Version | Description         | Type | Installed On        | State   |
+-----------+---------+---------------------+------+---------------------+---------+
| Versioned | 1       | Create person table | SQL  | 2017-12-22 15:26:39 | Success |
| Versioned | 2       | Add people          | SQL  | 2017-12-22 15:28:17 | Success |
+-----------+---------+---------------------+------+---------------------+---------+
```

## 添加新迁移

让我们添加一个新的迁移，我们将首先对其进行试运行。

在 ./sql 目录中，创建一个名为 V3__Couple.sql 的迁移：

```sql
create table COUPLE (
    ID int not null,
    PERSON1 int not null references PERSON(ID), 
    PERSON2 int not null references PERSON(ID) 
);
```

## 进行空跑-Doing a dry run

现在让我们通过试运行来预览此迁移的数据库更改：

```
> flyway migrate -dryRunOutput=dryrun.sql
```

这将生成一个名为 dryrun.sql 的文件，其中包含 Flyway 在定期迁移时对数据库执行的所有 SQL 语句。 

你自己看：

```sql
---====================================
-- Flyway Dry Run (2018-01-25 17:19:17)
---====================================

SET SCHEMA "PUBLIC";

-- Executing: validate (with callbacks)
------------------------------------------------------------------------------------------
-- ...

-- Executing: migrate (with callbacks)
------------------------------------------------------------------------------------------
-- ...

-- Executing: migrate -> v3 (with callbacks)
------------------------------------------------------------------------------------------

-- Source: ./V3__Couple.sql
---------------------------
create table COUPLE (
    ID int not null,
    PERSON1 int not null references PERSON(ID), 
    PERSON2 int not null references PERSON(ID) 
);
INSERT INTO "PUBLIC"."flyway_schema_history" ("installed_rank","version","description","type","script","checksum","installed_by","execution_time","success") VALUES (2, '3', 'Couple', 'SQL', 'V3__Couple.sql', -722651034, 'SA', 0, 1);
```

## 应用更改

一旦检查完成并且认为没问题，就可以使用通常的 migrate 命令应用迁移：

```
> flyway migrate
```

或者，您还可以使用数据库对运行 SQL 脚本的内置支持来应用迁移。 

例如，使用 H2：

```
> java -cp drivers/* org.h2.tools.RunScript -url jdbc:h2:file:./foobardb -script dryrun.sql
```

这些方法中的任何一种都会产生与您使用以下方法看到的相同的结果：

```
> flyway info
```

结果如下：

```
Database: jdbc:h2:file:./target/foobar (H2 1.4)
Schema version: 3

+-----------+---------+---------------------+------+---------------------+---------+----------+
| Category  | Version | Description         | Type | Installed On        | State   | Undoable |
+-----------+---------+---------------------+------+---------------------+---------+----------+
| Versioned | 1       | Create person table | SQL  | 2017-12-22 15:26:39 | Success | No       |
| Versioned | 2       | Add people          | SQL  | 2017-12-22 15:28:17 | Success | No       |
| Versioned | 3       | Couple              | SQL  | 2018-01-25 17:57:13 | Success | No       |
+-----------+---------+---------------------+------+---------------------+---------+----------+
```

## 概括

在这个简短的教程中，我们了解了如何

- 配置并执行 Flyway 进行试运行

- 验证试运行后应用更改

# Tutorial - Error Overrides

本教程假设您已成功完成快速入门：Maven 教程。 

如果您还没有这样做，请先这样做。 

本教程将从该教程结束的地方继续。

这个简短的教程将教如何使用错误覆盖。 

它将引导您完成如何配置和使用它们的步骤。

## 介绍

错误覆盖非常适合您可能想要的情况：

- 将错误视为警告，因为您知道迁移稍后会正确处理它

- 将警告视为错误，因为您希望快速失败以便能够更快地解决问题

## Reviewing the status

完成快速入门：Maven 后，您现在可以执行

```
> mvn flyway:info
```

结果如下：

```
[INFO] Database: jdbc:h2:file:./target/foobar (H2 1.4)
[INFO]
+-----------+---------+---------------------+------+---------------------+---------+
| Category  | Version | Description         | Type | Installed On        | State   |
+-----------+---------+---------------------+------+---------------------+---------+
| Versioned | 1       | Create person table | SQL  | 2017-12-22 15:26:39 | Success |
| Versioned | 2       | Add people          | SQL  | 2017-12-22 15:28:17 | Success |
+-----------+---------+---------------------+------+---------------------+---------+
```

## 添加损坏的迁移

在本教程中，我们将模拟应忽略损坏的 sql 语句的情况。

因此，让我们首先添加一个名为 `src/main/resources/db/migration/V3__Invalid.sql` 的新迁移：

```
broken sql statement;
```

如果我们迁移数据库，使用：

```
> mvn flyway:migrate
```

如下：

```
[ERROR] Migration V3__Invalid.sql failed
[ERROR] --------------------------------
[ERROR] SQL State  : 42001
[ERROR] Error Code : 42001
[ERROR] Message    : Syntax error in SQL statement "BROKEN[*] SQL STATEMENT "; expected "BACKUP, BEGIN, {"; SQL statement:
[ERROR] broken sql statement [42001-191]
[ERROR] Location   : /bar/src/main/resources/db/migration/V3__Invalid.sql (/bar/src/main/resources/db/migration/V3__Invalid.sql)
[ERROR] Line       : 1
[ERROR] Statement  : broken sql statement
```

## 配置错误覆盖

现在让我们配置一个错误覆盖，它将捕获迁移中的无效语句，并简单地记录警告，而不是因错误而失败。

```xml
<project xmlns="...">
    ...
    <build>
        <plugins>
            <plugin>
                <groupId>org.flywaydb</groupId>
                <artifactId>flyway-maven-plugin</artifactId>
                <version>9.21.1</version>
                <configuration>
                    <url>jdbc:h2:file:./target/foobar</url>
                    <user>sa</user>
                    <errorOverrides>
                        <errorOverride>42001:42001:W</errorOverride>
                    </errorOverrides>
                </configuration>
                <dependencies>
                    <dependency>
                        <groupId>com.h2database</groupId>
                        <artifactId>h2</artifactId>
                        <version>1.4.191</version>
                    </dependency>
                </dependencies>
            </plugin>
        </plugins>
    </build>
</project>
```

Finally clean and migrate again using

```
> mvn flyway:clean flyway:migrate
```

结果如下：

```
[INFO] Database: jdbc:h2:file:./target/foobar (H2 1.4)
[INFO] Successfully validated 3 migrations (execution time 00:00.007s)
[INFO] Creating Schema History table: "PUBLIC"."flyway_schema_history"
[INFO] Current version of schema "PUBLIC": << Empty Schema >>
[INFO] Migrating schema "PUBLIC" to version 1 - Create person table
[INFO] Migrating schema "PUBLIC" to version 2 - Add people
[INFO] Migrating schema "PUBLIC" to version 3 - Invalid
[WARNING] Syntax error in SQL statement (SQL state: 42001, error code: 42001)
[INFO] Successfully applied 3 migrations to schema "PUBLIC" (execution time 00:00.039s)
```

正如我们所期望的，我们现在成功执行了，但出现了警告而不是错误。

## 概括

在这个简短的教程中，我们了解了如何

- 配置 Flyway 以使用错误覆盖



# 参考资料

https://documentation.red-gate.com/fd/tutorial-baseline-migrations-184127615.html

* any list
{:toc}d