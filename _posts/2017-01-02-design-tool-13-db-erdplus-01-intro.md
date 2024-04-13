---
layout: post
title: 数据库设计工具 ERDPlus 在线的ER图设计工具 入门介绍
date:  2017-01-02 00:19:56 +0800
categories: [Design]
tags: [design, design, tool, database, sql]
published: true
---

# 拓展阅读

[常见免费开源绘图工具](https://houbb.github.io/2017/01/01/design-tool-01-overview)

[OmniGraffle 创建精确、美观图形的工具](https://houbb.github.io/2017/01/01/design-tool-02-omniGraffle-intro)

[UML-架构图入门介绍 starUML](https://houbb.github.io/2017/01/01/design-tool-03-uml-intro)

[UML 绘制工具 starUML 入门介绍](https://houbb.github.io/2017/01/01/design-tool-04-staruml-intro)

[PlantUML 是绘制 uml 的一个开源项目](https://houbb.github.io/2017/01/01/design-tool-04-uml-plantuml)

[UML 等常见图绘制工具](https://houbb.github.io/2017/01/01/design-tool-04-uml-tools)

[绘图工具 draw.io / diagrams.net 免费在线图表编辑器](https://houbb.github.io/2017/01/01/design-tool-05-draw-io-intro)

[绘图工具 excalidraw 介绍](https://houbb.github.io/2017/01/01/design-tool-06-excalidraw-intro)

[绘图工具 GoJS 介绍 绘图 js](https://houbb.github.io/2017/01/01/design-tool-07-go-js-intro)

[常见原型设计工具介绍](https://houbb.github.io/2017/01/01/design-tool-ui-00-design)

[原型设计工具介绍-01-moqups 介绍](https://houbb.github.io/2017/01/01/design-tool-ui-design-01-moqups)

# ERDPlus

一款用于创建实体关系图、关系模式、星型模式和SQL DDL语句的数据库建模工具

官方：https://erdplus.com/

**数据库建模**

ERDPlus 是一款基于 Web 的数据库建模工具，它允许您快速且轻松地创建以下内容：

- **实体关系图 (ERDs)**：用于展示实体之间的关系和属性的图表。
- **关系模式 (关系图)**：表示数据库中表与表之间关系的图形表示。
- **星型模式 (维度模型)**：数据仓库中常用的模型，中心是一个事实表，周围是维度表。

**更多特性**

- **自动将 ER 图转换为关系模式**：方便用户从实体关系图直接生成关系模式。
- **导出 SQL**：将设计好的数据库模型导出为 SQL 脚本，便于在数据库管理系统中执行。
- **导出图表为 PNG**：将您的数据库模型保存为图像文件，方便分享和展示。
- **在服务器上安全保存图表**：通过将您的工作保存在服务器上，确保数据安全且易于访问。

**SQL DDL 语句**

- **导出标准 SQL**：生成符合标准的 SQL 代码，适用于各种数据库管理系统。
- **从关系模式和星型模式生成 SQL**：根据设计的模式生成相应的 SQL 代码。
- **选择常见的数据类型和数据大小**：提供多种数据类型和大小选项，以满足不同的数据库设计需求。
- **兼容大多数现代 RDBMS 工具**：包括 Oracle、MySQL、Microsoft SQL Server、PostgresSQL、Teradata、IBM DB2、Microsoft Access 等，确保广泛的适用性。

ERDPlus 作为一款多功能的数据库建模工具，旨在帮助用户高效地完成数据库设计工作。

无论是创建实体关系图、关系模式还是星型模式，ERDPlus 都能提供直观的操作界面和强大的功能支持。

此外，该工具还支持将设计好的模型导出为 SQL 脚本，极大地简化了数据库的创建和维护过程。

通过使用 ERDPlus，用户可以更加专注于数据库设计本身，而不必过多担心后续的代码实现和数据迁移问题。




# 类似的工具

类似于PowerDesigner的开源工具主要是用于数据库设计和建模的工具。以下是一些流行的开源数据库设计和建模工具：

1. **MySQL Workbench**：这是一个针对MySQL数据库的官方工具，提供了数据建模、SQL开发、数据库管理等功能。

官方网址：[https://www.mysql.com/products/workbench/](https://www.mysql.com/products/workbench/)

2. **DBDesigner 4**：一个免费的开源数据库设计工具，支持多种数据库系统，包括MySQL、Oracle、SQLite等。

https://www.fabforce.net/dbdesigner4/

3. **DBeaver**：虽然主要是一个数据库管理工具，但它也提供了数据建模和ER图设计的功能。

官方网址：[https://dbeaver.io/](https://dbeaver.io/)

4. **pgModeler**：一个专门为PostgreSQL设计的开源数据建模工具，支持ER图、SQL脚本生成等功能。

官方网址：[https://www.pgmodeler.io/](https://www.pgmodeler.io/)

5. **ERDPlus**：一个在线的ER图设计工具，可以免费使用，支持多种数据库系统。

官方网址：[https://erdplus.com/](https://erdplus.com/)

# 参考资料

> [blog zh_CN](http://www.cnblogs.com/huangcong/archive/2010/06/14/1758201.html)

* any list
{:toc}