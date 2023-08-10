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

# Tutorial - Injecting Environments

这个简短的教程将教您如何注入要执行的迁移的环境。

## 介绍

使用数据库时，您经常有不同的环境，例如开发、测试或生产。 

在每个环境中，您可能想要执行不同的迁移，这可以通过占位符和 shouldExecute 脚本配置参数来实现。

shouldExecute 是一个参数，可让您通过向其提供布尔表达式来轻松自定义何时应执行迁移。 

与skipExecutingMigrations 不同，这不会更新架构历史表。 

它还支持布尔表达式中的占位符，这使您可以根据需要灵活地自定义迁移的执行。

如果您还不熟悉脚本配置参数的概念，可以在此处阅读。 

如果您想温习占位符的知识，可以在此处阅读有关它们的内容。

## example

```
V1__dev_migration_1.sql
V2__tst_migration_1.sql
V3__prd_migration_1.sql
```

V1只能在开发环境中执行，V2在测试环境中执行，V3在生产环境中执行。

迁移V1的脚本配置文件V1__dev_migration_1.sql.conf将需要行shouldExecute=${environment}==development
迁移V2的脚本配置文件V2__tst_migration_1.sql.conf将需要行shouldExecute=${environment}==test
迁移V3的脚本配置文件V3__prd_migration_1.sql.conf将需要行shouldExecute=${environment}==production

如果我们设置 `${environment}` 占位符的值来包含我们运行 Flyway 的环境，我们就可以达到我们想要的结果。

### running

```
flyway -placeholders.environment=development migrate
```

只会应用V1。 

同样，运行 Will only apply V2：


```
flyway -placeholders.environment=test migrate
```



and running Will only apply V3.:

```
flyway -placeholders.environment=production migrate
```

## 概括

在这个简短的教程中，我们了解了如何：

使用 shouldExecute 来控制我们的迁移在哪些环境中执行


# Tutorial - Integrating Dapr

## 介绍

Dapr 是一个应用程序运行时，它具有秘密管理组件，允许您安全地存储和提供对敏感信息的访问。 

Flyway 与 Dapr 的 Secret Store 集成，让您可以安全地存储并提供对任何机密 Flyway 参数的访问。

本教程假设您已经有一个 Dapr 服务器实例并知道如何在其中配置机密，以及 Dapr 应用程序 sidecar 的本地安装。

# Tutorial - Integrating Google Cloud Secret Manager

## 介绍

Google Cloud Secret Manager (GCSM) 是一项用于机密管理的云服务，可让您安全地存储敏感信息并提供对敏感信息的访问。 

Flyway 与 GCSM 集成，让您可以安全地存储并提供对任何机密 Flyway 参数的访问。

本教程假设您已经有一个 GCSM 项目并且知道如何在其中配置机密。 

如果您以前没有使用过 GCSM，请按照本教程创建包含一些机密的项目。


# Tutorial - Integrating Vault

## 介绍

HashiCorp Vault 是一种机密管理解决方案，可让您安全地存储敏感信息并提供对敏感信息的访问。

Flyway 与 Vault 的键值秘密存储集成，让您可以在任何指定的时间内安全地存储和提供对任何机密 Flyway 参数的访问。

本教程假设您已经有一个 Vault 实例并且知道如何在其中配置机密。 有关在 Vault 中配置机密的更多信息以及有关使用 Flyway 的教程，请参阅此博客文章。

# Tutorial - Java-based Migrations

## 代码

参考：[代码](https://github.com/houbb/flyway-learn)

## 教程：基于 Java 的迁移

这个简短的教程将教授如何使用基于 Java 的迁移。 

它将引导您完成如何创建和使用它们的步骤。

## 介绍

基于 Java 的迁移非常适合所有无法使用 SQL 轻松表达的更改。

这些通常是这样的

- BLOB & CLOB changes

- Advanced bulk data changes (Recalculations, advanced format changes, ...)

## 查看状态

完成快速入门：Maven 后，您现在可以执行

```
> mvn flyway:info
```

如下：

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

## 创建基于 Java 的迁移

现在让我们创建一个基于 Java 的迁移来匿名化 person 表中的数据。

开始于

- 将 Flyway-core 依赖项添加到我们的 pom.xml 中

- 为 Java 8 配置 Java 编译器

- 配置 Flyway 扫描 Java 类路径以进行迁移

```xml
<project xmlns="...">
    ...
    <dependencies>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
            <version>9.21.1</version>
        </dependency>
        ...
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.7.0</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.flywaydb</groupId>
                <artifactId>flyway-maven-plugin</artifactId>
                <version>9.21.1</version>
                <configuration>
                    <url>jdbc:h2:file:./target/foobar</url>
                    <user>sa</user>
                    <locations>
                        <location>classpath:db/migration</location>
                    </locations>
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

现在创建迁移目录 src/main/java/db/migration。

接下来是第一个迁移，名为 src/main/java/db/migration/V3__Anonymize.java：

```java
package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.ResultSet;
import java.sql.Statement;

public class V3__Anonymize extends BaseJavaMigration {
    public void migrate(Context context) throws Exception {
        try (Statement select = context.getConnection().createStatement()) {
            try (ResultSet rows = select.executeQuery("SELECT id FROM person ORDER BY id")) {
                while (rows.next()) {
                    int id = rows.getInt(1);
                    String anonymizedName = "Anonymous" + id;
                    try (Statement update = context.getConnection().createStatement()) {
                        update.execute("UPDATE person SET name='" + anonymizedName + "' WHERE id=" + id);
                    }
                }
            }
        }
    }
}
```

最后编译命令：

```
> mvn compile

> mvn flyway:info

[INFO] Database: jdbc:h2:file:./target/foobar (H2 1.4)
[INFO]
+-----------+---------+---------------------+------+---------------------+---------+
| Category  | Version | Description         | Type | Installed On        | State   |
+-----------+---------+---------------------+------+---------------------+---------+
| Versioned | 1       | Create person table | SQL  | 2017-12-22 15:26:39 | Success |
| Versioned | 2       | Add people          | SQL  | 2017-12-22 15:28:17 | Success |
| Versioned | 3       | Anonymize           | JDBC |                     | Pending |
+-----------+---------+---------------------+------+---------------------+---------+
```

Note the new pending migration of type JDBC.

## 执行迁移

是时候执行我们的新迁移了。

所以继续调用

```
> mvn flyway:migrate
```

结果如下：

```
[INFO] Database: jdbc:h2:file:./target/foobar (H2 1.4)
[INFO] Successfully validated 3 migrations (execution time 00:00.022s)
[INFO] Current version of schema "PUBLIC": 2
[INFO] Migrating schema "PUBLIC" to version 3 - Anonymize
[INFO] Successfully applied 1 migration to schema "PUBLIC" (execution time 00:00.011s)
```

查看状态：

```
> mvn flyway:info
```

如下：

```
[INFO] Database: jdbc:h2:file:./target/foobar (H2 1.4)
[INFO]
+-----------+---------+---------------------+------+---------------------+---------+
| Category  | Version | Description         | Type | Installed On        | State   |
+-----------+---------+---------------------+------+---------------------+---------+
| Versioned | 1       | Create person table | SQL  | 2017-12-22 15:26:39 | Success |
| Versioned | 2       | Add people          | SQL  | 2017-12-22 15:28:17 | Success |
| Versioned | 3       | Anonymize           | JDBC | 2017-12-22 16:03:37 | Success |
+-----------+---------+---------------------+------+---------------------+---------+
```

## 概括

在这个简短的教程中，我们了解了如何

- 创建基于 Java 的迁移

- 配置 Flyway 来加载并运行它们

# Tutorial - Repeatable Migrations

这个简短的教程将教授如何使用可重复迁移。 

它将引导您完成如何创建和使用它们的步骤。

## 介绍

可重复迁移对于管理数据库对象非常有用，这些对象的定义可以简单地维护在版本控制的单个文件中。 

它们不是只运行一次，而是在每次校验和更改时（重新）应用。

它们通常用于

- （重新）创建视图/过程/函数/包/。

- 批量参考数据重新插入

## 查看状态

完成快速入门：命令行后，您现在可以执行

```
> flyway info
```

如下：

```
Database: jdbc:h2:file:./foobardb (H2 1.4)
                     
+-----------+---------+---------------------+------+---------------------+---------+----------+
| Category  | Version | Description         | Type | Installed On        | State   | Undoable |
+-----------+---------+---------------------+------+---------------------+---------+----------+
| Versioned | 1       | Create person table | SQL  | 2017-12-21 18:05:10 | Success | No       |
| Versioned | 2       | Add people          | SQL  | 2017-12-21 18:05:10 | Success | No       |
+-----------+---------+---------------------+------+---------------------+---------+----------+
```

## 创建可重复的迁移

现在让我们创建一个可重复的迁移来管理 person 表的视图。 

使用 Flyway 的默认命名约定，文件名将与常规迁移类似，除了 V 前缀（现在已替换为 R）并且缺少版本。

因此，继续在 /sql 目录中创建 R__People_view.sql：

```sql
CREATE OR REPLACE VIEW people AS 
    SELECT id, name FROM person;
```

当前状态：

```
> flyway info

Database: jdbc:h2:file:./foobardb (H2 1.4)
                     
+------------+---------+---------------------+------+---------------------+---------+----------+
| Category   | Version | Description         | Type | Installed On        | State   | Undoable |
+------------+---------+---------------------+------+---------------------+---------+----------+
| Versioned  | 1       | Create person table | SQL  | 2017-12-21 18:05:10 | Success | No       |
| Versioned  | 2       | Add people          | SQL  | 2017-12-21 18:05:10 | Success | No       |
| Repeatable |         | People view         | SQL  |                     | Pending |          |
+------------+---------+---------------------+------+---------------------+---------+----------+
```

## Executing the migration

```
> flyway migrate

Database: jdbc:h2:file:./foobardb (H2 1.4)
Successfully validated 3 migrations (execution time 00:00.032s)
Current version of schema "PUBLIC": 2
Migrating schema "PUBLIC" with repeatable migration People view
Successfully applied 1 migration to schema "PUBLIC" (execution time 00:00.023s)
```

新的状态：

```
> flyway info

+------------+---------+---------------------+------+---------------------+---------+----------+
| Category   | Version | Description         | Type | Installed On        | State   | Undoable |
+------------+---------+---------------------+------+---------------------+---------+----------+
| Versioned  | 1       | Create person table | SQL  | 2017-12-21 18:05:10 | Success | No       |
| Versioned  | 2       | Add people          | SQL  | 2017-12-21 18:05:10 | Success | No       |
| Repeatable |         | People view         | SQL  | 2017-12-21 18:08:29 | Success |          |
+------------+---------+---------------------+------+---------------------+---------+----------+
```

## 修改迁移

现在让我们看看当我们修改迁移文件时会发生什么。

更新 /sql 目录中的 R__People_view.sql，如下所示：

```sql
CREATE OR REPLACE VIEW people AS 
    SELECT id, name FROM person WHERE name like 'M%';
```

再次确认状态：

```
> flyway info

Database: jdbc:h2:file:./foobardb (H2 1.4)
                     
+------------+---------+---------------------+------+---------------------+----------+----------+
| Category   | Version | Description         | Type | Installed On        | State    | Undoable |
+------------+---------+---------------------+------+---------------------+----------+----------+
| Versioned  | 1       | Create person table | SQL  | 2017-12-21 18:05:10 | Success  | No       |
| Versioned  | 2       | Add people          | SQL  | 2017-12-21 18:05:10 | Success  | No       |
| Repeatable |         | People view         | SQL  | 2017-12-21 18:08:29 | Outdated |          |
| Repeatable |         | People view         | SQL  |                     | Pending  |          |
+------------+---------+---------------------+------+---------------------+----------+----------+
```

我们的审计跟踪现在清楚地表明，之前应用的可重复迁移已经过时，现在再次标记为待处理，准备重新应用。

执行迁移

```
> flyway migrate

Database: jdbc:h2:file:./foobardb (H2 1.4)
Successfully validated 4 migrations (execution time 00:00.019s)
Current version of schema "PUBLIC": 2
Migrating schema "PUBLIC" with repeatable migration People view
Successfully applied 1 migration to schema "PUBLIC" (execution time 00:00.027s)
```

状态如下：

```
> flyway info

Database: jdbc:h2:file:./foobardb (H2 1.4)

+------------+---------+---------------------+------+---------------------+------------+----------+
| Category   | Version | Description         | Type | Installed On        | State      | Undoable |
+------------+---------+---------------------+------+---------------------+------------+----------+
| Versioned  | 1       | Create person table | SQL  | 2017-12-21 18:05:10 | Success    | No       |
| Versioned  | 2       | Add people          | SQL  | 2017-12-21 18:05:10 | Success    | No       |
| Repeatable |         | People view         | SQL  | 2017-12-21 18:08:29 | Superseded |          |
| Repeatable |         | People view         | SQL  | 2017-12-21 18:15:35 | Success    |          |
+------------+---------+---------------------+------+---------------------+------------+----------+
```

我们最初的运行现在已经被我们刚刚运行的运行所取代。 

因此，每当您管理的对象（我们示例中的人员视图）需要更改时，只需就地更新文件并再次运行迁移即可。

# 概括

在这个简短的教程中，我们了解了如何

- 创建可重复的迁移

- 运行并重新运行可重复的迁移

# Tutorial - Undo Migrations

## 介绍

撤消迁移与常规版本化迁移相反。 撤消迁移负责撤消具有相同版本的版本化迁移的影响。 

撤消迁移是可选的，并且不需要运行常规版本化迁移。

## 查看状态

```
> flyway info

Database: jdbc:h2:file:./foobardb (H2 1.4)

+-----------+---------+---------------------+------+---------------------+---------+----------+
| Category  | Version | Description         | Type | Installed On        | State   | Undoable |
+-----------+---------+---------------------+------+---------------------+---------+----------+
| Versioned | 1       | Create person table | SQL  | 2017-12-17 19:57:28 | Success | No       |
| Versioned | 2       | Add people          | SQL  | 2017-12-17 20:01:13 | Success | No       |
+-----------+---------+---------------------+------+---------------------+---------+----------+
```

## 创建撤消迁移

现在让我们为这两个应用的版本化迁移创建撤消迁移。 使用 Flyway 的默认命名约定，文件名将与常规迁移相同，除了 V 前缀（现在已替换为 U）。

因此，继续在 /sql 目录中创建 U2__Add_people.sql：

```sql
DELETE FROM PERSON;
```

And add a U1__Create_person_table.sql as well:

```sql
DROP TABLE PERSON;
```

查看当前状态：

```
> flyway info

Database: Database: jdbc:h2:file:./foobardb (H2 1.4)

+-----------+---------+---------------------+------+---------------------+---------+----------+
| Category  | Version | Description         | Type | Installed On        | State   | Undoable |
+-----------+---------+---------------------+------+---------------------+---------+----------+
| Versioned | 1       | Create person table | SQL  | 2017-12-17 19:57:28 | Success | Yes      |
| Versioned | 2       | Add people          | SQL  | 2017-12-17 20:01:13 | Success | Yes      |
+-----------+---------+---------------------+------+---------------------+---------+----------+
```

请注意，这两个迁移现在都已标记为不可撤消。

## 撤消上次迁移

默认情况下，撤消会撤消上次应用的版本化迁移。

所以继续调用

```
> flyway undo

Database: Database: jdbc:h2:file:./foobardb (H2 1.4)
Current version of schema "PUBLIC": 2
Undoing migration of schema "PUBLIC" to version 2 - Add people
Successfully undid 1 migration to schema "PUBLIC" (execution time 00:00.030s)
```

新的状态：

```
> flyway info

Database: Database: jdbc:h2:file:./foobardb (H2 1.4)

+-----------+---------+---------------------+----------+---------------------+---------+----------+
| Category  | Version | Description         | Type     | Installed On        | State   | Undoable |
+-----------+---------+---------------------+----------+---------------------+---------+----------+
| Versioned | 1       | Create person table | SQL      | 2017-12-17 19:57:28 | Success | Yes      |
| Versioned | 2       | Add people          | SQL      | 2017-12-17 20:01:13 | Undone  |          |
| Undo      | 2       | Add people          | UNDO_SQL | 2017-12-17 22:45:56 | Success |          |
| Versioned | 2       | Add people          | SQL      |                     | Pending | Yes      |
+-----------+---------+---------------------+----------+---------------------+---------+----------+
```

我们的审计跟踪现在清楚地表明，版本 2 首先被应用，然后被撤消，现在再次处于待处理状态。

我们现在可以安全地重新应用它

```
> flyway migrate

Database: Database: jdbc:h2:file:./foobardb (H2 1.4)
Successfully validated 5 migrations (execution time 00:00.020s)
Current version of schema "PUBLIC": 1
Migrating schema "PUBLIC" to version 2 - Add people
Successfully applied 1 migration to schema "PUBLIC" (execution time 00:00.017s)
```

信息如下：

```
> flyway info

Database: Database: jdbc:h2:file:./foobardb (H2 1.4)

+-----------+---------+---------------------+----------+---------------------+---------+----------+
| Category  | Version | Description         | Type     | Installed On        | State   | Undoable |
+-----------+---------+---------------------+----------+---------------------+---------+----------+
| Versioned | 1       | Create person table | SQL      | 2017-12-17 19:57:28 | Success | Yes      |
| Versioned | 2       | Add people          | SQL      | 2017-12-17 20:01:13 | Undone  |          |
| Undo      | 2       | Add people          | UNDO_SQL | 2017-12-17 22:45:56 | Success |          |
| Versioned | 2       | Add people          | SQL      | 2017-12-17 22:50:49 | Success | Yes      |
+-----------+---------+---------------------+----------+---------------------+---------+----------+
```

## 概括

在这个简短的教程中，我们了解了如何

- 创建撤消迁移

- 撤消和重做现有迁移

# Tutorial - Using Flyway Check with SQL Server

## 介绍

新的检查命令在迁移之前运行，通过生成报告让您更有信心，让您更好地了解计划迁移的后果。

必须设置以下一个或多个标志，以确定报告包含的内容：

-changes 生成将在下次迁移中应用于架构的所有更改的报告。
-drift 生成一个报告，显示架构中的对象，这些对象不是当前应用的任何迁移的结果，即在 Flyway 之外进行的更改。
更多信息可以在检查命令页面上找到。

本教程举例说明了您可以访问目标数据库 (url) 和构建数据库 (buildUrl) 的场景。

# 参考资料

https://documentation.red-gate.com/fd/tutorial-baseline-migrations-184127615.html

* any list
{:toc}d