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

通过编辑 /conf/flyway.conf 配置 Flyway，如下所示：

```
flyway.url=jdbc:sqlite:FlywayQuickStartCLI.db
flyway.user= 
flyway.password=
flyway.locations=filesystem:migrations
```

- 创建第一个迁移

现在在 /sql 目录中创建第一个迁移，名为 V1__Create_person_table.sql：

```sql
create table PERSON (
    ID int not null,
    NAME varchar(100) not null
);
```




# 拓展阅读

[DbUnit-01-数据库测试工具入门介绍](https://houbb.github.io/2018/01/10/dbunit)

[H2 Database-01-h2 入门介绍](https://houbb.github.io/2018/01/16/h2-database)

# 参考资料

https://flywaydb.org/

https://documentation.red-gate.com/fd/why-database-migrations-184127574.html

* any list
{:toc}d