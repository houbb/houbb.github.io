---
layout: post
title: 数据库设计工具 pgmodeler 入门介绍
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




# pgModeler

pgModeler 是一款开源软件，因此，如果您愿意，可以随时获取其源代码进行自行编译。

我们同时以非常合理的价格提供预编译的二进制包，以收集资金支持项目。购买的二进制包将授权您使用定期发布的独占功能！

由于这是一个独立的项目，没有赞助，购买任何二进制包都有助于保持开发活动的全速进行，定期带来大量新闻，一切如常！

![pgModeler](https://www.pgmodeler.io/uploads/images/thumbs/small/923f5ab6e17bf45e608c0bee2dd12e65.png)

## 为什么使用？

易于使用：

- 创建和编辑数据库模型变得简单，通过一个简洁直观的界面。

- 表单会指明哪些字段必须填写，以确保正确生成SQL代码。

开源：

- 免费获取、修改和重新分发源代码。该项目拥有一个公共代码库，允许进行分支操作和完全访问源代码。

- 开发者可以基于现有代码创建自己的版本。

跨平台：

- 基于Qt框架构建，pgModeler 可以在 Windows、Linux 和 macOS 上编译。

- 构建脚本易于配置，以解决每个操作系统上的具体依赖问题。

动态代码生成：

- 一次设计，多版本导出。借助其动态代码生成功能，pgModeler 可以将设计的模型导出到不同版本的 PostgreSQL（目前支持从10到15版本）。

插件支持：

- 缺少某些功能？使用插件开发接口为您的 pgModeler 创建自己的扩展，无需更改核心代码的任何一行。

- 欲了解更多详情，请参见官方插件代码库。

协作开发：

- 无论您是开发者还是普通用户，都可以参与协作！

- 通过在 GitHub 上的 pgModeler 页面提供反馈建议、提交界面翻译、报告错误等，为改进做出贡献。

## pgModeler 主要特性概览

| 特性分类 | 描述 |
| --- | --- |
| 集成开发工具 | pgModeler 可以轻松集成到你的开发工具集中。 |
| 对象类型支持 | 通过简单易用的界面处理多种类型的数据库对象，包括基本的列和高级的对象，如用户定义的语言、函数、操作符等。 |
| 自动生成列和约束 | 通过列传播机制，用户在通过关系对象连接表时，pgModeler 会自动创建所有列和约束，避免重复任务，提高生产力。 |
| 五种导出方式 | pgModeler 可以将模型导出为 SQL 脚本、PNG 图像、SVG 文件、HTML 格式的数据字典或直接导出到 PostgreSQL 服务器。 |
| 从现有数据库生成模型 | 通过逆向工程过程，pgModeler 可以基于现有数据库创建可靠的模型。 |
| XML基础文件 | 作为一个开源工具，pgModeler 提供对其源代码和任何生成文件内容的完全访问。所有创建的文件都是基于 XML 的，这意味着用户可以在第三方软件中处理它们。 |
| 故障恢复 | 在意外退出的情况下，用户不会丢失所有工作，因为 pgModeler 会存储带有最近更改的临时模型，并在下次启动时恢复它们。 |
| 模型结构验证和自动修复 | 为了避免在设计时和导出模型到 PostgreSQL 时破坏引用和/或规则，pgModeler 会不时验证模型。这种验证功能产生几乎无误的数据库模型。 |
| 可定制特性 | 通过广泛的配置集，pgModeler 给予用户自定义其大多数特性的自由。 |
| 生成SQL脚本同步 | 通过 diff 功能，用户可以根据模型和数据库之间或两个数据库之间的差异生成 SQL 脚本。脚本包含保持涉及实体同步所需的命令。 |
| 管理现有数据库 | pgModeler 提供了一个简单但有用的数据库管理模块，可以运行 SQL 命令、探索对象和处理数据。 |
| 命令行接口自动化 | CLI 提供了一系列操作，不需要运行 GUI。其中一项功能是导出过程，可以集成到第三方脚本中以自动化部署过程。另一个有用的功能是模型文件修复，它包括修复模型结构以使其再次可加载（这个功能在 GUI 中也可用）。还有许多其他操作可用。 |
| 附加特性 | 其他重要特性包括大型模型的对象查找器、插件开发接口、对地理空间数据类型（由 PostGIS 扩展实现）的支持、可翻译的用户界面等。你可以在官方文档中查看所有 pgModeler 特性的更多细节。 |

以上表格总结了pgModeler的主要特性，包括其易于使用、开源、跨平台、动态代码生成、插件支持、协作开发等方面的优势。

这些特性使得pgModeler成为一个功能强大的数据库模型工具，适用于各种规模的开发需求。

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