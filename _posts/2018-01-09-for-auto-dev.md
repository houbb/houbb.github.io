---
layout: post
title:  For Auto Dev
date:  2018-1-9 10:31:12 +0800
categories: [Project]
tags: [project, stay hungry, auto]
published: true
---

# 自动化开发

> [让开发自动化系列专栏](https://www.ibm.com/developerworks/cn/java/j-ap/)


上面提到的技术可能过时，但是思想值得借鉴。

# 持续集成

> [持续集成](https://www.ibm.com/developerworks/cn/java/j-ap09056/)

类似的工具很多，个人推荐 [jenkins](https://jenkins.io/)、[TeamCity](https://www.jetbrains.com/teamcity/)

# 除掉构建脚本中的气味

> [除掉构建脚本中的气味](https://www.ibm.com/developerworks/cn/java/j-ap10106/)

对于脚本这一块，研发确实比较慵懒，比如我。没有更加规范，甚至没有这个意识。

这一点可以进行拓展：只要和项目相关的东西，无论内外，都应该做到尽可能的**规范**简洁。

- 惟 IDE 的构建

- 复制-粘贴式的编写脚本方法

- 冗长的目标

- 庞大的构建文件

- 没有清理干净

- 硬编码的值

- 测试失败还能构建成功

- 魔力机

- 格式的缺失

# 持续测试

## Junit

Junit + mockito + powerMock

基础测试

## DBUnit

数据库相关测试

## Selenium

功能性测试

## JUnitPerf

性能测试

# 断言架构可靠性

通过分析代码的度量报告，比如由 [JDepend](http://mcs.une.edu.au/doc/jdepend/docs/JDepend.html) 工具生成的报告， 
您可以有效地判定代码是否实现了确定的架构。

> [静态检测工具](http://blog.51cto.com/tianya23/415146)

# CI 反模式

> [持续集成反模式](https://www.ibm.com/developerworks/cn/java/j-ap11297/)

知道不要做什么，也可以学到很多知识。

## 签入不够频繁

反模式：由于所需的修改太多，源代码长时间签出存储库。

解决方案：频繁地提交比较小的代码块。

## 破碎的构建

反模式：构建长时间破碎，导致开发人员无法签出可运行的代码。

解决方案：在构建破碎时立即通知开发人员，并以最高优先级尽快修复破碎的构建。

## 反馈太少

反模式：团队没有把构建状态通知发送给团队成员；因此，开发人员不知道构建已失败。

解决方案：使用各种反馈机制传播构建状态信息。

## 垃圾反馈

反模式：团队成员很快被构建状态消息淹没（成功、失败或界于这两者之间的各种消息），
所以开始忽视这些消息。

解决方案：反馈要**目标明确**，使人们不会收到无关的信息。


## 缓慢的机器

反模式：用一台资源有限的工作站执行构建，导致构建时间太长。

解决方案：增加构建机器的磁盘速度、处理器和 RAM 资源，从而提高构建速度。

## 膨胀的构建

反模式：把太多的任务添加到提交构建过程中，比如运行各种自动检查工具或运行负载测试，从而导致反馈被延迟。

解决方案：一个构建 管道（pipeline）可以运行不同类型的构建。


# 使用自动化加速部署

> [使用自动化加速部署](https://www.ibm.com/developerworks/cn/java/j-ap01088/)

![2018-01-09-auto-dev-build-architecture.png](https://raw.githubusercontent.com/houbb/resource/master/img/project/auto-dev/2018-01-09-auto-dev-build-architecture.png)

## 外部化属性

对于不同的目标环境，配置值（例如文件位置、主机名、数据库名和端口号）可能各不相同，因此不能进行硬编码（例如在源代码中）。
这些属性在 `*.properties` 文件中得到了完善的管理。

通过外部化属性，可以使用同一个构建脚本在一个环境中编译，然后在另一个环境中部署，而不需要修改或重新编译源代码。

可以使用 auto-config 工具等。

## 自动化 DBA

Data Definition Language（DDL）语句（如删除现有数据库、创建数据库和创建数据库用户）
以及 Data Manipulation（DML）语句（如 insert语句）可以轻松地脚本化并作为构建脚本的一部分运行。

而且，还可以远程执行这些语句。

## 发行和部署

远程部署和本地部署在实现方面并非完全不同，它仅需要一个不同的通道，
从而将资源安全地从一个位置复制到另一个位置（从构建机器复制到目标环境）。

在大多数企业中，安全性至关重要，因此仅仅使用 FTP 和 telnet 并不能满足需求。
在这种情况下，SCP 和 SSH 可以轻松完成任务。


# 自动负载测试

> [自动负载测试](https://www.ibm.com/developerworks/cn/java/j-ap04088/)

使用 JMeter 创建自动化测试、将测试作为自动构建的一部分运行，
以及将测试设置为每天自动运行（通常当机器的使用率低时）。将测试作为预定构建的一部分运行可以让您：

- 在任何时候执行负载测试

- 在开发过程的初期检测并解决负载和性能问题

- 监视构建服务器的最新的负载测试和性能测试报告

- 减少依靠单个人配置和运行测试时可能出现的瓶颈和错误


# 文档化

## 文档的痛处

有两个关键性的问题制约着软件开发的文档化。

- 似乎**没有人会去阅读文档**。

- 几乎是在编写文档的同时，它就已经**过时**了。

## 常见的工具

- 使用 UMLGraph 生成当前源代码的 UML图。

- 使用 SchemaSpy 创建 实体关系图（ERD），归档数据库中的表格和关系。

- 使用 Grand 生成构建目标以及它们之间的关系的 Ant 构建图。

- 使用 Doxygen 生成 源代码文档。

- 使用 DocBook 制作 用户文档。

# 持续重构

> [持续重构](https://www.ibm.com/developerworks/cn/java/j-ap07088/)

Martin Fowler 编写了 《Refactoring》

- 使用 CheckStyle 度量 圈复杂度（cyclomatic complexity），
并提供诸如 Replace Conditional with Polymorphism之类的重构，以此来减少 条件复杂度代码味道

- 使用 CheckStyle 评估 代码重复率，并提供诸如 Pull Up Method之类的重构，以此来移除 重复代码

- 使用 PMD（或 JavaNCSS）计算 源代码行，并提供诸如 Extract Method 之类的重构，以此来淡化 大类代码味道

- 使用 CheckStyle（或 JDepend）确定一个类的 传出耦合度（efferent coupling），并提供诸如 Move Method 之类的重构，以此来除掉 过多的导入代码味道


# 实现自动化数据库迁移

## 手工变更数据库

常见的由 DBA 进行操作：(一些公司直连研发都没有)

![2018-01-09-auto-dev-manual-process.gif](https://raw.githubusercontent.com/houbb/resource/master/img/project/auto-dev/2018-01-09-auto-dev-manual-process.gif)

## 自动化

使用工具 [LiquiBase](http://www.liquibase.org/) 进行数据库的自动更新。

![2018-01-09-auto-dev-automated-process.gif](https://raw.githubusercontent.com/houbb/resource/master/img/project/auto-dev/2018-01-09-auto-dev-automated-process.gif)


# 使用基于向导的安装程序

提供一种简单的方式来安装您的软件，这对于吸引和留住用户至关重要。

PS：对于互联网或者是传统项目，war 包之类的不需要到用户本地部署的不在此范围内。

war、jar 可以通过 CI 结合 shell(bat) 脚本搞定。

## IzPack

我们看过 Antigen、AntInstaller、Denova、install4j、InstallAnywhere、IzPack、NSIS 等工具。

但是根据项目的特定需求，我们最后决定使用 [IzPack](http://izpack.org/)：

- 它可以在多种平台上运行。我们需要支持 Windows®、Linux® 和 Macintosh。

- IzPack 使用 Java™ 语言，而我们团队对于这种语言有丰富的经验。

- 它可以执行 Apache Ant 脚本。我们已经花了大量的时间为软件部署而编写 Ant 脚本。

- IzPack 开源，可免费下载

 

* any list
{:toc}

