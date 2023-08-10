---
layout: post
title: database tool-01-flyway 数据库迁移工具介绍
date:  2023-08-10 +0800
categories: [Database]
tags: [database, migrate, sh]
published: true
---

# flyway

[flyway](https://flywaydb.org/) Increase reliability of deployments by versioning your database.

Flyway是一个开源的数据库迁移工具。 

它强烈支持简单性和约定而不是配置。

它仅基于 7 个基本命令：Migrate, Clean, Info, Validate, Undo, Baseline and Repair.

迁移可以用 SQL（支持特定于数据库的语法（例如 PL/SQL、T-SQL 等））或 Java（用于高级数据转换或处理 LOB）编写。

它有一个命令行客户端。 

如果您使用 JVM，我们建议使用 Java API 在应用程序启动时迁移数据库。 

或者，您也可以使用 Maven 插件或 Gradle 插件。

如果这还不够，还有适用于 Spring Boot、Dropwizard、Grails、Play、SBT、Ant、Griffon、Grunt、Ninja 等的插件！

支持的数据库包括 Oracle、SQL Server（包括 Amazon RDS 和 Azure SQL 数据库）、Azure Synapse（以前称为数据仓库）、DB2、MySQL（包括 Amazon RDS、Azure 数据库和 Google Cloud SQL）、Aurora MySQL、MariaDB、Percona XtraDB Cluster、 测试容器、PostgreSQL（包括 Amazon RDS、Azure 数据库、Google Cloud SQL、TimescaleDB、YugabyteDB 和 Heroku）、Aurora PostgreSQL、Redshift、CockroachDB、SAP HANA、Sybase ASE、Informix、H2、HSQLDB、Derby、Snowflake、SQLite 和 Firebird。

# 快速入门 - Flyway 的工作原理

欢迎来到 Flyway，数据库迁移变得简单。 

我们首先解释 Flyway 的工作原理，然后您可以开始 5 分钟的快速入门教程来亲自尝试。

最简单的情况是当您将 Flyway 指向空数据库时。

![emptydatabase](https://documentation.red-gate.com/fd/files/183306238/183306339/1/1668097722302/EmptyDb.png)

它将尝试找到其模式历史表。 

由于数据库为空，Flyway 不会找到它，而是会创建它。

现在，您的数据库默认有一个名为 Flyway_schema_history 的空表：

![empty_Db](https://documentation.red-gate.com/fd/files/183306238/183306340/1/1668097722523/EmptySchemaVersion.png)

该表将用于跟踪数据库的状态。

随后 Flyway 将开始扫描文件系统或应用程序的类路径以进行迁移。 

它们可以用 Sql 或 Java 编写。

然后根据版本号对迁移进行排序并按顺序应用：

![migrate-tool](https://documentation.red-gate.com/fd/files/183306238/183306334/1/1668097721120/Migration-1-2.png)

应用每次迁移时，架构历史表都会相应更新：

flyway_schema_history

![历史](https://documentation.red-gate.com/fd/files/184127223/205225997/1/1683034468020/image2023-5-2_14-34-27.png)

元数据和初始状态就位后，我们现在可以讨论迁移到新版本。

Flyway 将再次扫描文件系统或应用程序的类路径以进行迁移。 

根据架构历史表检查迁移。 

如果它们的版本号低于或等于标记为当前的版本号，则它们将被忽略。

剩余的迁移是待处理的迁移：可用，但未应用。

![pending-migrate](https://documentation.red-gate.com/download/thumbnails/183306238/PendingMigration.png)

然后按版本号排序并按顺序执行：

![version](https://documentation.red-gate.com/fd/files/183306238/183306335/1/1668097721411/Migration21.png)

架构历史表会相应更新：

Flyway_schema_history

![Flyway_schema_history](https://documentation.red-gate.com/fd/files/184127223/205226000/1/1683034575522/image2023-5-2_14-36-15.png)

就是这样！

每次需要改进数据库时，无论是结构（DDL）还是参考数据（DML），只需创建一个版本号高于当前版本号的新迁移即可。 

Flyway下次启动时，它会找到它并相应地升级数据库。

准备好开始了吗？ 

然后学习我们的 5 分钟教程之一：

# Why database migrations

## 为什么要进行数据库迁移？

首先，让我们从头开始，假设我们有一个名为 Shiny 的项目，其主要交付成果是一个名为 Shiny Soft 的软件，它连接到名为 Shiny DB 的数据库。

表示这一点的最简单的图表可能如下所示：

```
shiny DB
```

我们有我们的软件和数据库。 伟大的。 这很可能就是您所需要的。

但在大多数项目中，这种简单的世界观很快就会转化为：

![DB](https://documentation.red-gate.com/fd/files/183306238/183306341/1/1668097722850/Environments.png)

我们现在不仅要处理环境的一份副本，而且还要处理多个环境副本。 

这带来了许多挑战。

我们非常擅长在代码方面解决这些问题。

- 版本控制现已普及，每天都有更好的工具。

- 我们有可重复的构建和持续集成。

- 我们有明确定义的发布和部署流程。

![soft-green](https://documentation.red-gate.com/fd/files/183306238/183306329/1/1668097719473/SoftGreen.png)

But what about the database?

![DB](https://documentation.red-gate.com/fd/files/183306238/183306344/1/1668097723744/DbRed.png)

不幸的是，我们在那里做得不太好。 许多项目仍然依赖于手动应用的sql脚本。 

有时甚至不是这样（这里或那里的快速 sql 语句来解决问题）。 

很快很多问题就出现了：

- 本机上的数据库处于什么状态？

- 该脚本是否已经应用？

- 生产中的快速修复是否已应用于之后的测试中？

- 如何设置新的数据库实例？

这些问题的答案通常是：我们不知道。

数据库迁移是重新控制这种混乱的好方法。

它们允许您：

- 从头开始重新创建数据库

- 始终清楚数据库处于什么状态

- 以确定性方式从当前版本的数据库迁移到较新的数据库


# 快速入门 - 命令行

这个简短的教程将教授如何启动和运行 Flyway 命令行工具。

它将引导您完成如何配置它以及如何编写和执行前几次数据库迁移的步骤。

完成本教程大约需要 5 分钟。

## 先决条件

您可以[通过安装 Flyway Desktop 或下载 Flyway 命令行工具来安装 Flyway。](https://www.red-gate.com/products/flyway/)

> [command line](https://documentation.red-gate.com/fd/command-line-184127404.html)

> [安装包](https://documentation.red-gate.com/fd/installers-172490864.html?_ga=2.109995334.2122356214.1691632061-661460642.1691632061)

## 配置飞行路线

如果您单独下载了命令行，请将其解压缩到 Flyway 文件夹。

如果您使用 Flyway Desktop 安装了 Flyway，请将 Flyway CLI 文件夹从安装文件夹（例如“C:\Program Files\Red Gate\Flyway Desktop\flyway”）复制到您具有读/写访问权限的位置。

从命令提示符处，跳转到 Flyway 文件夹：

```
> cd flyway
```

我的是：

```
> cd D:\tool\flyway\flyway-commandline-9.21.1-windows-x64\flyway-9.21.1

> ls
assets/  conf/  drivers/  flyway*  flyway.cmd  jars/  jre/  lib/  licenses/  native/  README.txt  rules/  sql/
```


### 文件配置

通过编辑 `/conf/flyway.conf` 配置 Flyway，如下所示：

```
flyway.url=jdbc:mysql://localhost:3306/flyway
flyway.user=flyway 
flyway.password=123456
```

`flyway.locations` 这个属性我们暂时不做配置，默认会在 sql 文件夹中。

### 创建第一个迁移

现在在 /sql 目录中创建第一个迁移，名为 V1__Create_person_table.sql：

```sql
create table PERSON (
    ID int not null,
    NAME varchar(100) not null
);
```

- 执行迁移

```
> flyway migrate
```

报错

```
> flyway migrate
ERROR: Unable to obtain connection from database (jdbc:mysql://localhost:3306/flyway) for user 'flyway': Could not connect to address=(host=localhost)(port=3306)(type=master) : (conn=9) Unknown database 'flyway'

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
SQL State  : 42000
Error Code : 1049
Message    : Could not connect to address=(host=localhost)(port=3306)(type=master) : (conn=9) Unknown database 'flyway'

Caused by: java.sql.SQLSyntaxErrorException: Could not connect to address=(host=localhost)(port=3306)(type=master) : (conn=9) Unknown database 'flyway'
Caused by: java.sql.SQLSyntaxErrorException: (conn=9) Unknown database 'flyway'
```

我们先连接到 mysql，创建对应的数据库 flyway。

```
λ flyway migrate
WARNING: A Flyway License was not provided; fell back to Community Edition. Please contact sales at sales@flywaydb.org for license information.
Flyway Community Edition 9.21.1 by Redgate
See release notes here: https://rd.gt/416ObMi

Database: jdbc:mysql://localhost:3306/flyway (MySQL 5.7)
ERROR: Flyway Teams Edition or MySQL upgrade required: MySQL 5.7 is no longer supported by Flyway Community Edition, but still supported by Flyway Teams Edition.
```

这个信息已经很明白的说明了，现有使用的Flyway开源版本不支持5.7了，如果还想要使用请使用收费的版本。

至此看来只能是升级MySQL到8.0了，而我机器的MySQL暂时还无法升级，这样看来Flyway是不能用了，花了这么长时间没法用，实在不甘心，于是再次上网查了一下，发现了下面的网文给了我启发

https://blog.csdn.net/Alex_81D/article/details/122713943 运行flyway报错， MySQL 5.6 is no longer supported by Flyway Community Edition，问题处理

该文中提到的版本是5.6，解决的方法有两种，

**一是升级MySQL 5.7；另一种是降低Flyway的版本**。

这给了我启发，我也可以降低Flyway版本，早期的Flyway版本肯定可以使用MySQL 5.7。

经过一番测试后发现Flyway从8.0开始不再支持MySQL 5.7，因此它的7.x版本是可以支持MySQL 5.7的，于是找到Flyway 7.x的最后版本7.15.0。

> [maven 等仓库信息官方旧版本访问地址](https://documentation.red-gate.com/fd/accessing-older-versions-of-flyway-184128789.html)

至于命令行，还是要去 github 看比较清晰：

> [client 命令行历史版本](https://github.com/flyway/flyway/releases)

这里我们选择 7.x 的最后一个版本，[7.15.0](https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/7.15.0/)

```
> cd D:\tool\flyway\flyway-commandline-7.15.0-windows-x64\flyway-7.15.0

> flyway migrate
```


成功日志如下：

```
WARNING: This version of Flyway is out of date. Upgrade to Flyway 9.0.0: https://rd.gt/3rXiSlV

Flyway Teams Edition 7.15.0 by Redgate
Database: jdbc:mysql://localhost:3306/flyway (MySQL 5.7)
----------------------------------------
Flyway Teams features are enabled by default for the next 28 days. Learn more at https://rd.gt/3A4IWym
----------------------------------------
Successfully validated 1 migration (execution time 00:00.011s)
Creating Schema History table `flyway`.`flyway_schema_history` ...
Current version of schema `flyway`: << Empty Schema >>
Migrating schema `flyway` to version "1 - Create person table"
Successfully applied 1 migration to schema `flyway`, now at version v1 (execution time 00:00.053s)
```

可以看到数据库中多了两张表：

```
mysql> show tables;
+-----------------------+
| Tables_in_flyway      |
+-----------------------+
| flyway_schema_history |
| person                |
+-----------------------+
```

历史表的内容如下：

```
mysql> select * from flyway_schema_history;
+----------------+---------+---------------------+------+-----------------------------+------------+--------------+---------------------+----------------+---------+
| installed_rank | version | description         | type | script                      | checksum   | installed_by | installed_on        | execution_time | success |
+----------------+---------+---------------------+------+-----------------------------+------------+--------------+---------------------+----------------+---------+
|              1 | 1       | Create person table | SQL  | V1__Create_person_table.sql | 1715188512 | flyway       | 2023-08-10 11:12:32 |             28 |       1 |
+----------------+---------+---------------------+------+-----------------------------+------------+--------------+---------------------+----------------+---------+
```

这里就涉及到一个设计问题，比如这个历史表是应该创建在业务库中，还是应该单独一个数据库？

个人感觉可能后者更好。

### 创建第二次同步

我们第二次往表中添加一些数据：

/sql 文件夹下，新建文件 `V2__Add_people.sql`，内容如下

```sql
insert into PERSON (ID, NAME) values (1, 'Axel');
insert into PERSON (ID, NAME) values (2, 'Mr. Foo');
insert into PERSON (ID, NAME) values (3, 'Ms. Bar');
```

- 执行同步

```
> flyway migrate

Flyway Teams Edition 7.15.0 by Redgate
Database: jdbc:mysql://localhost:3306/flyway (MySQL 5.7)
----------------------------------------
Flyway Teams features are enabled by default for the next 28 days. Learn more at https://rd.gt/3A4IWym
----------------------------------------
Successfully validated 2 migrations (execution time 00:00.013s)
Current version of schema `flyway`: 1
Migrating schema `flyway` to version "2 - Add people"
Successfully applied 1 migration to schema `flyway`, now at version v2 (execution time 00:00.050s)
```

- 查看历史表

```
mysql> select * from flyway_schema_history;
+----------------+---------+---------------------+------+-----------------------------+------------+--------------+---------------------+----------------+---------+
| installed_rank | version | description         | type | script                      | checksum   | installed_by | installed_on        | execution_time | success |
+----------------+---------+---------------------+------+-----------------------------+------------+--------------+---------------------+----------------+---------+
|              1 | 1       | Create person table | SQL  | V1__Create_person_table.sql | 1715188512 | flyway       | 2023-08-10 11:12:32 |             28 |       1 |
|              2 | 2       | Add people          | SQL  | V2__Add_people.sql          |  476766047 | flyway       | 2023-08-10 11:17:10 |             19 |       1 |
+----------------+---------+---------------------+------+-----------------------------+------------+--------------+---------------------+----------------+---------+
```

# Flyway 常用命令

Flyway 是一个数据库迁移工具，它提供了一组常用的命令，用于管理数据库的版本和结构变化。

以下是一些常用的 Flyway 命令及其解释：

1. **`migrate`：** 执行数据库迁移，将未应用的迁移脚本应用到数据库。

   ```
   flyway migrate
   ```

2. **`clean`：** 清空数据库中的所有对象（表、视图等），通常在开发和测试环境中使用。

   ```
   flyway clean
   ```

3. **`info`：** 显示当前数据库的状态，包括已应用的迁移脚本版本和未应用的迁移脚本数量。

   ```
   flyway info
   ```

4. **`validate`：** 验证迁移脚本的版本和签名是否与数据库中的记录匹配，用于检测脚本是否被篡改。

   ```
   flyway validate
   ```

5. **`baseline`：** 在没有历史迁移记录的情况下，为数据库创建一个基线版本。

   ```
   flyway baseline
   ```

6. **`repair`：** 修复 Flyway 元数据表，用于恢复数据库状态，适用于元数据表损坏或版本不匹配的情况。

   ```
   flyway repair
   ```

7. **`undo`：** 撤消上一次已应用的迁移脚本。

   ```
   flyway undo
   ```

8. **`undoLast`：** 撤消最后一次已应用的迁移脚本。

   ```
   flyway undoLast
   ```

9. **`baseline`：** 在已存在的数据库上创建一个基线版本，用于初始化 Flyway 版本控制。

   ```
   flyway baseline
   ```

10. **`-configFiles`：** 指定额外的配置文件，可以用于覆盖默认的 `flyway.conf`。

    ```
    flyway -configFiles=myconfig.conf migrate
    ```

这只是一些常见的 Flyway 命令，还有其他一些命令和选项可以用于特定情况和需求。

使用命令时，务必查阅 Flyway 官方文档，以确保你正确理解每个命令的作用和影响。

Flyway 的官方文档提供了详细的命令行参考：[Flyway Command-line Reference](https://flywaydb.org/documentation/commandline/)。

# api 方式

## maven 引入

```xml
<dependencies>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
            <version>7.15.0</version>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <version>1.4.197</version>
        </dependency>
</dependencies>
```

这里直接使用 h2 内存数据库，方便测试验证。

## 创建迁移脚本

新建文件：`~\src\main\resources\db\migration\V1__Create_person_table.sql`

内容如下：

```sql
create table PERSON
(
    ID   int          not null,
    NAME varchar(100) not null
);
```

## 运行代码

```java
import org.flywaydb.core.Flyway;

public class Main {

    public static void main(String[] args) {
        // Create the Flyway instance and point it to the database
        Flyway flyway = Flyway.configure().dataSource("jdbc:h2:file:./target/foobar", "sa", null).load();

        // Start the migration
        flyway.migrate();
    }

}
```

日志：

```
八月 10, 2023 11:32:16 上午 org.flywaydb.core.internal.license.VersionPrinter printVersionOnly
信息: Flyway Community Edition 7.15.0 by Redgate
八月 10, 2023 11:32:16 上午 org.flywaydb.core.internal.database.base.BaseDatabaseType createDatabase
信息: Database: jdbc:h2:file:./target/foobar (H2 1.4)
八月 10, 2023 11:32:16 上午 org.flywaydb.core.internal.command.DbValidate validate
信息: Successfully validated 1 migration (execution time 00:00.026s)
八月 10, 2023 11:32:16 上午 org.flywaydb.core.internal.schemahistory.JdbcTableSchemaHistory create
信息: Creating Schema History table "PUBLIC"."flyway_schema_history" ...
八月 10, 2023 11:32:16 上午 org.flywaydb.core.internal.command.DbMigrate migrateGroup
信息: Current version of schema "PUBLIC": << Empty Schema >>
八月 10, 2023 11:32:16 上午 org.flywaydb.core.internal.command.DbMigrate doMigrateGroup
信息: Migrating schema "PUBLIC" to version "1 - Create person table"
八月 10, 2023 11:32:16 上午 org.flywaydb.core.internal.command.DbMigrate logSummary
信息: Successfully applied 1 migration to schema "PUBLIC", now at version v1 (execution time 00:00.028s)
```

# maven 插件方式

## maven 插件引入

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-maven-plugin</artifactId>
            <version>7.15.0</version>
            <configuration>
                <url>jdbc:h2:file:./target/foobar</url>
                <user>sa</user>
            </configuration>
            <dependencies>
                <dependency>
                    <groupId>com.h2database</groupId>
                    <artifactId>h2</artifactId>
                    <version>1.4.197</version>
                </dependency>
            </dependencies>
        </plugin>
    </plugins>
</build>
```

引入 flyway 插件，依赖 h2 内存数据库。

## 创建迁移脚本

新建文件：`~\src\main\resources\db\migration\V1__Create_person_table.sql`

内容如下：

```sql
create table PERSON
(
    ID   int          not null,
    NAME varchar(100) not null
);
```

## 运行脚本

执行 maven 命令：

```
> mvn flyway:migrate
```

日志如下：

```
[INFO] --- flyway-maven-plugin:7.15.0:migrate (default-cli) @ flyway-learn-maven-plugin ---
[INFO] Flyway Community Edition 7.15.0 by Redgate
[INFO] Database: jdbc:h2:file:./target/foobar (H2 1.4)
[INFO] Successfully validated 1 migration (execution time 00:00.020s)
[INFO] Creating Schema History table "PUBLIC"."flyway_schema_history" ...
[INFO] Current version of schema "PUBLIC": << Empty Schema >>
[INFO] Migrating schema "PUBLIC" to version "1 - Create person table"
[INFO] Successfully applied 1 migration to schema "PUBLIC", now at version v1 (execution time 00:00.018s)
[INFO] Flyway Community Edition 7.15.0 by Redgate
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  0.608 s
```


# 拓展阅读

[Quickstart - Flyway Autopilot](https://documentation.red-gate.com/fd/quickstart-flyway-autopilot-215154689.html)

[Quickstart - Using Flyway Desktop with the Flyway Community edition](https://documentation.red-gate.com/fd/quickstart-using-flyway-desktop-with-the-flyway-community-edition-206602598.html)

[Quickstart - Docker](https://documentation.red-gate.com/fd/quickstart-docker-205226373.html)

[Quickstart - Gradle](https://documentation.red-gate.com/fd/quickstart-gradle-184127577.html)

------------------

[DbUnit-01-数据库测试工具入门介绍](https://houbb.github.io/2018/01/10/dbunit)

[H2 Database-01-h2 入门介绍](https://houbb.github.io/2018/01/16/h2-database)

# 参考资料

https://flywaydb.org/

https://documentation.red-gate.com/fd/why-database-migrations-184127574.html

[Flyway管理数据库MySQL5.7入坑记录（三）](https://www.cnblogs.com/xupeixuan/p/16634401.html)

* any list
{:toc}d