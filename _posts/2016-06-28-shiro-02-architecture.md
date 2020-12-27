---
layout: post
title: Shiro-02-shiro 的架构设计详解
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# Apache Shiro 体系结构

Apache Shiro的设计目标是通过直观且易于使用的方式简化应用程序的安全性。 

Shiro的核心设计模拟了大多数人在某人（或某物）与应用程序交互的情况下对应用程序安全性的看法。

软件应用程序通常是根据用户案例设计的。也就是说，您通常会根据用户与软件的交互方式来设计用户界面或服务API。

例如，您可能会说：“如果与我的应用程序交互的用户已登录，我将向他们显示一个按钮，他们可以单击该按钮来查看其帐户信息。如果他们尚未登录，我将显示一个注册按钮。”

该示例语句表明，编写应用程序主要是为了满足用户需求。即使“用户”是另一个软件系统而不是人类，您仍然可以编写代码以根据当前正在与您的软件进行交互的人员（或内容）来反映行为。

Shiro在自己的设计中反映了这些概念。通过匹配软件开发人员已经很直观的内容，Apache Shiro仍然保持直观且易于在几乎任何应用程序中使用。

# 高层次概览

在最高概念级别上，Shiro的体系结构具有3个主要概念：主题，安全管理器和领域。 

下图是这些组件如何相互作用的高级概述，我们将在下面介绍每个概念：

![概念](https://shiro.apache.org/assets/images/ShiroBasicArchitecture.png)

## Subject（主题）

正如我们在教程中所提到的，主题本质上是当前执行用户的特定于安全性的“视图”。 

“用户”一词通常表示一个人，而主题可以是一个人，但它也可以表示第三方服务，守护程序帐户，定时任务或类似的东西-基本上是当前与该软件交互的任何东西。

主题实例都绑定到（并需要）SecurityManager。与主题进行交互时，这些交互会转换为与SecurityManager特定于主题的交互。

## SecurityManager（安全管理器）

SecurityManager是Shiro体系结构的核心，并充当一种“伞”对象，可协调其内部安全组件，这些组件一起形成对象图。但是，一旦为应用程序配置了SecurityManager及其内部对象图，通常就不理会它，应用程序开发人员几乎将所有时间都花在Subject API上。

稍后我们将详细讨论SecurityManager，但重要的是要认识到，当您与Subject进行交互时，实际上是在幕后的SecurityManager对任何Subject安全操作都起了很大的作用。这反映在上面的基本流程图中。

## Realms（领域）

领域充当Shiro与您的应用程序的安全数据之间的“桥梁”或“连接器”。当真正需要与安全性相关的数据（例如用户帐户）进行交互以执行身份验证（登录）和授权（访问控制）时，Shiro会从一个或多个为应用程序配置的领域中查找许多此类内容。

从这个意义上说，领域本质上是特定于安全性的DAO：它封装了数据源的连接详细信息，并根据需要使关联数据可用于Shiro。在配置Shiro时，您必须至少指定一个领域用于身份验证和/或授权。 SecurityManager可以配置有多个领域，但至少需要一个。

Shiro提供了开箱即用的领域，可以连接到许多安全数据源（又名目录），例如LDAP，关系数据库（JDBC），文本配置源（例如INI和属性文件）等等。如果默认的Realms不能满足您的需求，那么您可以插入自己的Realm实现以表示自定义数据源。

像其他内部组件一样，Shiro SecurityManager管理领域如何用于获取要表示为Subject实例的安全性和身份数据

# 详细架构

下图显示了Shiro的核心架构概念，并简要概述了每个架构：

![详细架构](https://shiro.apache.org/assets/images/ShiroArchitecture.png)

## 主题（org.apache.shiro.subject.Subject）

当前与软件交互的实体（用户，第三方服务，计划任务等）的特定于安全性的“视图”。

## 安全管理器（org.apache.shiro.mgt.SecurityManager）

如上所述，SecurityManager是Shiro架构的核心。它主要是一个“伞”对象，用于协调其托管组件以确保它们能够顺利协作。它还管理Shiro对每个应用程序用户的视图，因此它知道如何对每个用户执行安全操作。

## 身份验证器（org.apache.shiro.authc.Authenticator）

Authenticator是负责执行用户对身份验证（登录）尝试并对之做出反应的组件。当用户尝试登录时，该逻辑由身份验证器执行。身份验证器知道如何与存储相关用户/帐户信息的一个或多个领域协调。从这些领域获得的数据用于验证用户的身份，以确保用户确实是他们所说的真实身份。

## 身份验证策略（org.apache.shiro.authc.pam.AuthenticationStrategy）

如果配置了多个领域，则AuthenticationStrategy会协调这些领域以确定身份验证尝试成功或失败的条件（例如，如果一个领域成功但其他领域失败，则该尝试成功吗？必须所有领域都成功吗？第一？）。

## 授权者（org.apache.shiro.authz.Authorizer）

授权者是负责确定应用程序中用户访问控制的组件。它是最终表明是否允许用户做某事的机制。与身份验证器一样，授权者也知道如何与多个后端数据源进行协调以访问角色和权限信息。授权者使用此信息来确定是否允许用户执行给定的操作。

## SessionManager（org.apache.shiro.session.mgt.SessionManager）

SessionManager知道如何创建和管理用户会话生命周期，以便为所有环境中的用户提供可靠的会话体验。这是安全框架领域中的一项独特功能-Shiro能够在任何环境中本地管理用户会话，即使没有Web / Servlet或EJB容器也可以。默认情况下，Shiro将使用现有的会话机制（例如Servlet容器）（如果可用），但是如果没有，例如在独立应用程序或非Web环境中，它将使用其内置的企业会话管理来提供相同的编程经验。 SessionDAO的存在是为了允许使用任何数据源来保留会话。

## SessionDAO（org.apache.shiro.session.mgt.eis.SessionDAO）

SessionDAO代表SessionManager执行会话持久性（CRUD）操作。这允许将任何数据存储插入会话管理基础结构。

## CacheManager（org.apache.shiro.cache.CacheManager）

CacheManager创建和管理其他Shiro组件使用的Cache实例生命周期。因为Shiro可以访问许多后端数据源以进行身份​​验证，授权和会话管理，所以缓存一直是框架中的一流架构功能，可以在使用这些数据源时提高性能。可以将任何现代的开源和/或企业缓存产品插入Shiro，以提供快速有效的用户体验。

## 密码学（org.apache.shiro.crypto.*）

密码术是企业安全框架的自然补充。 

Shiro的加密软件包包含易于使用和理解的加密密码，哈希（又名摘要）和不同编解码器实现的表示形式。该软件包中的所有类都经过精心设计，以使其易于使用和易于理解。使用Java的本机加密技术支持的任何人都知道，驯服它可能是具有挑战性的动物。 

Shiro的加密API简化了复杂的Java机制，并使加密技术易于为普通凡人使用。

## 领域（org.apache.shiro.realm.Realm）

如上所述，领域充当Shiro与您应用程序的安全数据之间的“桥梁”或“连接器”。

当真正需要与安全性相关的数据（例如用户帐户）进行交互以执行身份验证（登录）和授权（访问控制）时，Shiro会从一个或多个为应用程序配置的领域中查找许多此类内容。

您可以根据需要配置任意多个领域（通常每个数据源一个），并且Shiro会根据需要与它们进行协调，以进行身份​​验证和授权。

# 安全管理器

因为Shiro的API鼓励以主题为中心的编程方法，所以大多数应用程序开发人员很少（如果有的话）直接与SecurityManager进行交互（但是框架开发人员有时可能会觉得有用）。

即使如此，了解SecurityManager的功能仍然很重要，尤其是在为应用程序配置一个功能时。

## 设计

如前所述，应用程序的SecurityManager执行安全操作并管理所有应用程序用户的状态。

在Shiro的默认SecurityManager实施中，这包括：

- 认证方式

- 授权书

- 会话管理

- 缓存管理

- 领域协调

- 事件传播

- “记住我”服务

- 主题创建

- 注销等。

但这是尝试在单个组件中进行管理的许多功能。而且，如果将所有内容归为一个实现类，则使这些事情变得灵活和可定制将非常困难。

为了简化配置并实现灵活的配置/可插拔性，Shiro的实现在设计上都是高度模块化的-实际上是模块化的，因此SecurityManager的实现（及其类层次结构）根本不起作用。取而代之的是，SecurityManager实现大部分充当轻量级的“容器”组件，几乎将所有行为委托给嵌套/包装的组件。这种“包装器”设计反映在上面的详细架构图中。

当组件实际执行逻辑时，SecurityManager实现知道如何以及何时协调组件以实现正确的行为。

SecurityManager实现和组件也与JavaBeans兼容，这使您（或配置机制）可以通过标准JavaBeans访问器/更改器方法（get*/set*）轻松自定义可插拔组件。

这意味着Shiro的体系结构模块化可以转化为非常易于配置的自定义行为。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[Application Security With Apache Shiro](https://www.infoq.com/articles/apache-shiro/)

* any list
{:toc}

 
