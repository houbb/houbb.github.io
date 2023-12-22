---
layout: post
title: database view 数据库可视化开源工具
date:  2017-10-13 09:40:27 +0800
categories: [Database]
tags: [database, tool]
published: true
---


# 8 款数据库开源客户端

![client](https://pic1.zhimg.com/80/v2-936147fe49a8b109b9964cbd6ff5ce48_720w.webp)

## SQL Chat

[SQL Chat](https://github.com/sqlchat/sqlchat) 是 SQL 客户端中最年轻的选手，把 SQL 客户端从传统的 GUI-based 带入了 CUI (Chat-based UI) 阶段：它背后接入了 ChatGPT 来帮你写 SQL。

用户可以通过 sqlchat.ai 直接访问，也可以通过 Docker 进行私有化部署，支持的数据库包括 MySQL，PostgreSQL 和 MSSQL。

上周，SQL Chat 在 Product Hunt 上正式发布后，收获了大量关注，以至于现在免费服务有点不可用（得用自己的 OpenAI API Key）。

## DBeaver - the universal db manager for SQL and NoSQL

[DBeaver](https://github.com/dbeaver/dbeaver) 是一款老牌 SQL 客户端，除了基本的可视化和管理能力，它还有 SQL 编辑器，数据和模式迁移能力，监控数据库连接等等，支持的数据库（SQL 和 NoSQL）种类相当齐全。

DBeaver 也已经接上了 GPT-3，可以把自然语言转换成 SQL。

值得一提的是，DBeaver 两周前刚宣布了 6M 美金的种子轮融资（新闻稿提到 DBeaver 有超过 8M 用户，5000+ 付费用户），也是 2017 年成立公司至今的第一次。

## Beekeeper Studio

[Beekeeper Studio](https://github.com/beekeeper-studio/beekeeper-studio) 是款很摩登（颜值高）且轻量级的 SQL 客户端，支持 MySQL，Postgres，SQLite，SQL Server 等，可用于 Linux，Mac 和 Windows 平台。

Beekeeper Studio 的作者是名个人开发者，他不是名 DBA，但经常要使用 Spark，Hadoop，Ansible， AWS 等数据工具，因为没能找到简单易行的跨平台 SQL 客户端，所以 2019 年他开始打造 Beekeeper Studio，花了近一年晚上和周末时间后，在 2020 年初推出了第一个版本。

## DbGate - (no)SQL database client

DbGate 支持多平台：在 Windows，Linux，Mac，浏览器中都能 work，功能上也没有什么妥协。支持了 SQL 和 noSQL 数据库，包括 MySQL，PostgreSQL，SQL Server，MongoDB，SQLite，CockroachDB 等等。他的进阶功能包括模式比较，可视化查询设计器，图表可视化或批量导出和导入，和许多基于外键的数据浏览功能。


DbGate 的作者称这是他的 passion project，因为他没找到适合 Linux 的 SQL 客户端，他过去曾为 Windows 打造过 SQL 客户端，所以这也是受到了自己工作经验的影响，之后才给 DbGate 增加了 noSQL 的支持。

## Sqlectron

[Sqlectron](https://github.com/sqlectron/sqlectron-gui) 是一个简洁且轻量级的 SQL 客户端桌面端和终端，它也具有跨数据库（PostgreSQL, Redshift, MySQL, MariaDB, SQL Server, Cassandra, SQLite）和平台（Mac, Linux, Windows）支持。

和前两个工具故事神似的是，Sqlectron 的原作者建造这个客户端的原因也是因为市面上没有找到好用且能解决他们痛点的工具（简单的，轻量级的，跨数据库和平台支持的 SQL 客户端桌面），不过作者 2018 年表示换工作后就没有使用过 SQL 数据库了，在 GitHub 也开了 Issue 找继承者，似乎有人（半）接手了，最近一次 release 在去年五月。

## HeidiSQL

[HeidiSQL](https://github.com/HeidiSQL/HeidiSQL) 也是个轻量级 SQL 客户端，支持的数据库包括 MariaDB, MySQL, MS SQL, PostgreSQL, SQLite, Interbase 和 Firebird。除了基本 SQL 客户端的功能，用户还可以将结构和数据导出为 SQL 文件，或复制到剪贴板或其他服务器上。

HeidiSQL 的代码库最初来自作者自己的 MySQL-Front 2.5 软件，但他后来把 MySQL-Front 品牌卖了，作者于是把他的项目重新命名为 HeidiSQL 作为替代并且维护至今。

## phpMyAdmin

[phpMyAdmin](https://github.com/pgadmin-org/phpMyAdmin)  诞生于 1998 年，使用 PHP 编写，是一个非常老牌且经典的 SQL 客户端，是当时 LAMP 和 MAMP 的默认工具，只要是做 PHP 项目就会用 phpMyAdmin。

如今已经发展成为管理 MySQL 和类 MySQL 数据库（比如 MariaDB）的最主要工具之一，每月有超过 20 万的直接下载量（还有无数的用户使用预包装安装或使用软件包管理器安装）。

## pgAdmin 4

[pgAdmin](https://github.com/pgadmin-org/pgadmin4) 之于 PostgreSQL = phpMyAdmin 之于 MySQL，它可以在 Linux，Unix，macOS 和 Windows上使用，以管理 PostgreSQL。

最新的 pgAdmin 4 使用 Python 和 Javascript/jQuery 完全重写了 pgAdmin，更新了很多用户界面元素、多用户/网络部署选项、dashboard 的设计，相比 pgAdmin 3 有了很大改进，旨在满足各个阶段 PostgreSQL 用户的需求（无论是新手还是老手）。

# chat

## 数据库可视化操作开源有哪些？

有许多开源工具和库可用于数据库可视化操作。

以下是一些常见的数据库可视化工具和平台，它们提供了直观的用户界面，帮助用户连接、查询和管理数据库：

1. **DBeaver:**
   - **特点：** DBeaver 是一个通用的数据库工具，支持多种数据库管理系统，包括 MySQL、PostgreSQL、SQLite、Oracle 等。
   - **链接：** [DBeaver 官网](https://dbeaver.io/)

2. **DBVisualizer:**
   - **特点：** DBVisualizer 提供跨平台的数据库工具，支持多种数据库，具有直观的用户界面和强大的查询功能。
   - **链接：** [DBVisualizer 官网](https://www.dbvis.com/)

3. **SQuirreL SQL:**
   - **特点：** SQuirreL SQL 是一个基于 Java 的数据库客户端，支持多种数据库，具有插件架构，可以通过插件扩展功能。
   - **链接：** [SQuirreL SQL 官网](http://squirrel-sql.sourceforge.net/)

4. **HeidiSQL:**
   - **特点：** HeidiSQL 是一个开源的 MySQL 和 PostgreSQL 数据库管理工具，具有直观的用户界面和丰富的功能。
   - **链接：** [HeidiSQL 官网](https://www.heidisql.com/)

5. **Adminer:**
   - **特点：** Adminer 是一个轻量级的数据库管理工具，支持多种数据库，以单个 PHP 文件的形式提供，易于部署和使用。
   - **链接：** [Adminer 官网](https://www.adminer.org/)

6. **Metabase:**
   - **特点：** Metabase 是一个开源的数据分析和可视化工具，可以连接到多种数据源，包括数据库，并提供直观的仪表板和查询构建功能。
   - **链接：** [Metabase 官网](https://www.metabase.com/)

7. **TablePlus:**
   - **特点：** TablePlus 是一款现代的数据库客户端，支持多种数据库，具有直观的界面和强大的功能。
   - **链接：** [TablePlus 官网](https://tableplus.com/)

这些工具都提供了可视化界面，使用户能够轻松连接到数据库、执行查询、管理表结构、查看和编辑数据等。

选择合适的工具通常取决于你使用的数据库类型、个人偏好以及项目需求。

## web 项目

**DBeaver Web:**

   - **特点：** DBeaver 是一款通用的数据库工具，DBeaver Web 是其 Web 版本，支持多种数据库，提供了 Web 界面进行数据库操作。
   - **链接：** [DBeaver Web GitHub 仓库](https://github.com/dbeaver/dbeaver)



# 参考资料

https://blog.csdn.net/BlackPlus28/article/details/80687927

https://blog.csdn.net/meism5/article/details/104205910

https://zhuanlan.zhihu.com/p/624835503


* any list
{:toc}