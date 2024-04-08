---
layout: post
title: tomcat11 官方文档-02-apache tomcat version 版本介绍
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---


### Apache Tomcat 版本

Apache Tomcat® 是 Jakarta EE（以前是 Java EE）技术的开源软件实现的一个子集。

不同版本的 Apache Tomcat 适用于不同版本的规范。

规范与相应的 Apache Tomcat 版本之间的映射如下：

| Servlet 规范 | JSP 规范 | EL 规范 | WebSocket 规范 | 认证（JASPIC）规范 | Apache Tomcat 版本 | 最新发布版本 | 支持的 Java 版本 |
|--------------|---------|--------|---------------|-------------------|------------------|--------------|-----------------|
| 6.1          | 4.0     | 6.0    | 2.2           | 3.1               | 11.0.x           | 11.0.0-M18 (alpha) | 17及更高版本      |
| 6.0          | 3.1     | 5.0    | 2.1           | 3.0               | 10.1.x           | 10.1.20      | 11及更高版本      |
| 5.0          | 3.0     | 4.0    | 2.0           | 2.0               | 10.0.x (已过时)    | 10.0.27 (已过时) | 8及更高版本       |
| 4.0          | 2.3     | 3.0    | 1.1           | 1.1               | 9.0.x            | 9.0.87       | 8及更高版本       |
| 3.1          | 2.3     | 3.0    | 1.1           | 1.1               | 8.5.x            | 8.5.100      | 7及更高版本       |
| 3.1          | 2.3     | 3.0    | 1.1           | N/A               | 8.0.x (已过时)     | 8.0.53 (已过时) | 7及更高版本       |
| 3.0          | 2.2     | 2.2    | 1.1           | N/A               | 7.0.x (已存档)     | 7.0.109 (已存档) | 6及更高版本       |
|              |         |        |               |                   |                  |                | (WebSocket 需要7及更高版本) |
| 2.5          | 2.1     | 2.1    | N/A           | N/A               | 6.0.x (已存档)     | 6.0.53 (已存档) | 5及更高版本       |
| 2.4          | 2.0     | N/A    | N/A           | N/A               | 5.5.x (已存档)     | 5.5.36 (已存档) | 1.4及更高版本      |
| 2.3          | 1.2     | N/A    | N/A           | N/A               | 4.1.x (已存档)     | 4.1.40 (已存档) | 1.3及更高版本      |
| 2.2          | 1.1     | N/A    | N/A           | N/A               | 3.3.x (已存档)     | 3.3.2 (已存档)  | 1.1及更高版本      |

每个 Tomcat 版本都支持符合表格中最后一列要求的任何稳定 Java 版本。

### Alpha / Beta / Stable

在投票发布时，评审人员会指定他们认为该版本达到的稳定级别。新主要版本的初始发布通常会经历几个月的 Alpha、Beta 阶段，最终达到 Stable 级别。然而，只有当该版本实现的 Java 规范已经最终确定时，才会提供 Stable 级别。这意味着在所有其他方面被认为稳定的发布可能仍被标记为 Beta，如果规范尚未最终确定的话。

下载页面将始终显示最新的稳定版本以及任何更新的 Alpha 或 Beta 版本（如果存在）。Alpha 和 beta 版本在下载页面上始终有清晰的标记。

稳定性是主观判断，您应该仔细阅读您打算使用的版本的发布说明。如果您是版本的早期采用者，我们希望在投票中听到您对其稳定性的意见：该投票在开发邮件列表上进行。

Alpha 版本可能包含大量未经测试/缺失的规范所需功能和/或重大错误，不太可能长时间稳定运行。

Beta 版本可能包含一些未经测试的功能和/或一些相对较小的错误。Beta 版本不太可能稳定运行。

稳定版本可能包含一些相对较小的错误。稳定版本旨在用于生产，并且预计能够稳定运行一段时间。

### Apache Tomcat 11.0.x

Apache Tomcat 11.0.x 是当前的开发重点。它基于 Tomcat 10.1.x，并实现了 Servlet 6.1、JSP 4.0、EL 6.0、WebSocket 2.2 和 Authentication 3.1 规范（Jakarta EE 11 平台所需的版本）。

### Apache Tomcat 10.1.x

Apache Tomcat 10.1.x 基于 Tomcat 10.0.x，并实现了 Servlet 6.0、JSP 3.1、EL 5.0、WebSocket 2.1 和 Authentication 3.0 规范（Jakarta EE 10 平台所需的版本）。

### Apache Tomcat 10.0.x

Apache Tomcat 10.0.x 基于 Tomcat 9.0.x，并实现了 Servlet 5.0、JSP 3.0、EL 4.0、WebSocket 2.0 和 Authentication 2.0 规范（Jakarta EE 9 平台所需的版本）。

### Apache

 Tomcat 9.x

Apache Tomcat 9.x 基于 Tomcat 8.0.x 和 8.5.x，并实现了 Servlet 4.0、JSP 2.3、EL 3.0、WebSocket 1.1 和 JASPIC 1.1 规范（Java EE 8 平台所需的版本）。除此之外，它还包括以下重要改进：

- 添加对 HTTP/2 的支持（需要在 Java 9 上运行（自 Apache Tomcat 9.0.0.M18 起）或安装 Tomcat Native 库）
- 添加对 JSSE 连接器（NIO 和 NIO2）中使用 OpenSSL 的 TLS 支持
- 添加对 TLS 虚拟主机（SNI）的支持

### Apache Tomcat 8.x

Apache Tomcat 8.0.x 基于 Tomcat 7.0.x，并实现了 Servlet 3.1、JSP 2.3、EL 3.0 和 WebSocket 1.1 规范。除此之外，它还包括以下重要改进：

- 用于替换早期版本中提供的多个资源扩展功能的单一公共资源实现。

Apache Tomcat 8.5.x 支持与 Apache Tomcat 8.0.x 相同的 Servlet、JSP、EL 和 WebSocket 规范版本。除此之外，它还实现了 JASPIC 1.1 规范。

它于 2016 年 3 月作为 Tomcat 9.0.0.M4（alpha）里程碑版本的一个分支创建。它提供了来自 Tomcat 9.x 代码库的 HTTP/2 支持和其他功能，同时与 Tomcat 8.0 运行时和规范要求兼容。 （当时无法创建稳定版本的 Tomcat 9.0，因为 Tomcat 9 针对的 Java EE 规范在几年后才最终确定）。

Tomcat 8.5 被认为是 Tomcat 8.0 的替代品。请参阅迁移指南，了解迁移到 Tomcat 8.5 的指导。

Apache Tomcat 8.5.x 包括以下重要改进：

- 添加对 HTTP/2 的支持（需要 Tomcat Native 库）
- 添加对 JSSE 连接器（NIO 和 NIO2）中使用 OpenSSL 的 TLS 支持
- 添加对 TLS 虚拟主机（SNI）的支持

以下技术已从 Apache Tomcat 8.5.x 中删除：

- BIO 实现的 HTTP 和 AJP 连接器
- Comet API 的支持

许多领域在内部都有重大变化，从而提高了性能、稳定性和总体拥有成本。有关详细信息，请参阅 Apache Tomcat 8.5 变更日志。

Tomcat 8.0 的用户应该注意，Tomcat 8.0 现已终止。Tomcat 8.0.x 的用户应升级到 Tomcat 8.5.x 或更高版本。

Tomcat 8.5 的用户应该注意，已宣布 Tomcat 8.5 已到达寿命终点。Tomcat 8.5.x 的用户应该计划升级到 Tomcat 9.0.x 或更高版本。

### Apache Tomcat 7.x

Apache Tomcat 7.x 在 Tomcat 6.0.x 基础上进行了改进，并实现了 Servlet 3.0、JSP 2.2、EL 2.2 和 WebSocket 1.1 规范。除此之外，它还包括以下改进：

- Web 应用程序内存泄漏检测和预防
- 对 Manager 和 Host Manager 应用程序的改进安全性
- 通用 CSRF 保护
- 支持直接在 Web 应用程序中包含外部内容
- 重构（连接器、生命周期）和大量的内部代码清理

Tomcat 7 的用户应该注意，Tomcat 7 现已终止。Tomcat 7.x 的用户应升级到 Tomcat 8.5.x 或更高版本。

### Apache Tomcat 6.x

Apache Tomcat 6.x 在 Tomcat 5.5.x 基础上进行了改进，并实现了 Servlet 2.5 和 JSP 2.1 规范。除此之外，它还包括以下改进：

- 内存使用优化
- 高级 IO 能力
- 重构的集群
Tomcat 6 的用户应该注意，Tomcat 6 现已终止。Tomcat 6.x 的用户应升级到 Tomcat 7.x 或更高版本。

### Apache Tomcat 5.x

Apache Tomcat 5.x 可从存档中下载。

Apache Tomcat 5.5.x 支持与 Apache Tomcat 5.0.x 相同的 Servlet 和 JSP 规范版本。在许多方面都有重大变化，从而提高了性能、稳定性和总体拥有成本。请参阅 Apache Tomcat 5.5 变更日志了解详情。

Apache Tomcat 5.0.x 在许多方面都改进了 Apache Tomcat 4.1，包括：

- 性能优化和减少垃圾回收
- 重构的应用程序部署器，具有可选的独立部署器，允许在将 Web 应用程序放入生产之前进行验证和编译
- 使用 JMX 和 manager web 应用程序进行完整的服务器监控
- 可伸缩性和可靠性增强
- 改进的标签库处理，包括高级池化和标签插件
- 改进的平台集成，具有本机 Windows 和 Unix 封装器
- 使用 JMX 进行嵌入
- 增强的安全管理器支持
- 集成会话集群
- 扩展文档

Tomcat 5 的用户应该注意，Tomcat

 5 现已终止。Tomcat 5.x 的用户应升级到 Tomcat 7.x 或更高版本。

### Apache Tomcat 4.x

Apache Tomcat 4.x 可从存档中下载。

Apache Tomcat 4.x 实现了一个基于全新架构的新的 servlet 容器（称为 Catalina）。4.x 版本实现了 Servlet 2.3 和 JSP 1.2 规范。

Apache Tomcat 4.1.x 是 Apache Tomcat 4.0.x 的重构版本，包含了重大的增强功能，包括：

- 基于 JMX 的管理功能
- 基于 JSP 和 Struts 的管理 Web 应用程序
- 新的 Coyote 连接器（HTTP/1.1、AJP 1.3 和 JNI 支持）
- 重写的 Jasper JSP 页面编译器
- 性能和内存效率改进
- 与开发工具集成的增强 manager 应用程序支持
- 用于直接从 build.xml 脚本与 manager 应用程序进行交互的自定义 Ant 任务

Apache Tomcat 4.0.x. Apache Tomcat 4.0.6 是旧的生产质量发布版。4.0 servlet 容器（Catalina）从头开始开发，具有灵活性和性能。版本 4.0 实现了 Servlet 2.3 和 JSP 1.2 规范的最终发布版本。根据规范的要求，Apache Tomcat 4.0 还支持为 Servlet 2.2 和 JSP 1.1 规范构建的 Web 应用程序，无需更改。

Tomcat 4 的用户应该注意，Tomcat 4 现已终止。Tomcat 4.x 的用户应升级到 Tomcat 7.x 或更高版本。

### Apache Tomcat 3.x

Apache Tomcat 3.x 可从存档中下载。

版本 3.3 是符合 Servlet 2.2 和 JSP 1.1 规范的当前生产质量发布版。Apache Tomcat 3.x 架构的最新延续是 3.2.4，它比 3.2.4 更先进。

版本 3.2.4 是“旧”的生产质量发布版，目前仅处于维护模式。

版本 3.1.1 是传统发布版。

所有 Apache Tomcat 3.x 发布版本都可以追溯到最初由 Sun 捐赠给 Apache 软件基金会的 Servlet 和 JSP 实现。3.x 版本都实现了 Servlet 2.2 和 JSP 1.1 规范。

Apache Tomcat 3.3.x. 版本 3.3.2 是当前生产质量发布版。它继续了版本 3.2 开始的重构，并将其进行到了逻辑上的结论。版本 3.3 提供了一个更模块化的设计，并允许通过添加和删除控制 servlet 请求处理的模块来定制 servlet 容器。该版本还包含许多性能改进。

Apache Tomcat 3.2.x. 版本 3.2 与 3.1 相比，增加了一些新功能；主要工作是对内部的重构，以提高性能和稳定性。3.2.1 版本，像 3.1.1 一样，是一个安全补丁。版本 3.2.2 修复了大量的错误和所有已知的规范兼容性问题。版本 3.2.3 是一个安全更新，关闭了一个严重的安全漏洞。版本 3.2.4 是一个轻微的错误修复版本。所有 Apache Tomcat 3.2.x 版本之前的用户都应尽快升级。除了修复关键的安全相关错误之外，Apache Tomcat 3.2.x 分支上的开发已停止。

Apache Tomcat 3.1.x. 3.1 发行版相对于 Apache Tomcat 3.0 有了一些改进，包括 Servlet 重载、WAR 文件支持以及为 IIS 和 Netscape Web 服务器添加连接器。最新的维护版本 3.1.1 包含了安全问题的修复。Apache Tomcat 3.1.x 没有正在进行的活动开发。Apache Tomcat 3.1 的用户应升级到 3.1.1 以关闭安全漏洞，并强烈建议迁移到当前的生产版本，Apache Tomcat 3.3。

Apache Tomcat 3.0.x. 最初的 Apache Tomcat 发布版。

Tomcat 3 的用户应该注意，Tomcat 3 现已终止。Tomcat 3.x 的用户应升级到 Tomcat 7.x 或更高版本。



* any list
{:toc}