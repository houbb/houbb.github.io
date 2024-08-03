---
layout: post
title:  web privilege security 安全框架-03-oacc 介绍
date: 2024-08-04 21:01:55 +0800
categories: [Web]
tags: [web, privilege, safe, web, sf]
published: true
---

# OACC Java应用安全框架

## OACC是什么？

OACC - 发音为_[橡树]_- 是一个全面的API，用于**执行**和管理应用程序的认证和授权需求。

简而言之，OACC提供基于**权限**的授权服务，并允许您的应用程序通过回答以下问题来执行安全性：

    实体'A'是否被允许对实体'B'执行动作'p'？

## 特性

- **完全实现的API**  
开箱即用，拥有管理应用程序安全模型的所有功能。

- **单一访问控制范式**  
始终在资源级别操作。专门在资源之间管理权限。

- **灵活的安全模型**  
保护您的领域对象和作用于它们的行为者之间的任何操作。

- **权限委托**  
授权主体将他们的权限委托给其他人，带有_GRANT OPTIONS_。

- **身份委托**  
授权认证的主体安全地"冒充"另一个主体。

- **高效的查询方法**  
通过高效的对称查询方法，按权限查找资源。

在项目网站的[特性页面](http://oaccframework.org/oacc-features.html)上了解更多关于OACC的授权和认证特性。

## 许可

OACC是在商业友好的[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)下发布的开源软件。

## 支持的环境

OACC将所有安全关系持久化在数据库表中，目前支持以下数据库：

- IBM DB2 10.5
- Microsoft SQL Server 12.0 (2014)
- Oracle 11g R2
- PostgreSQL 9.3
- HSQLDB 2.3
- MySQL 5.6 / MariaDB 10.0
- SQLite 3.8

OACC与Java&#8482; SE 7 (Java&#8482; 版本 1.7.0)或更高版本兼容。

## 开始使用

将最新版本的OACC包含到您的项目中最简单的方法是在您的POM文件中声明以下Maven坐标作为依赖项：

```xml
<dependency>
    <groupId>com.acciente.oacc</groupId>
    <artifactId>acciente-oacc</artifactId>
    <version>2.0.0</version>
</dependency>
```

要**安装、配置和初始化**OACC数据库，请参考项目网站上的[入门教程](http://oaccframework.org/getting-started-tutorial.html)。

[_SecureTodo_示例应用程序](http://oaccframework.org/secure-todo-example.html)展示了如何将OACC集成到Java应用程序中，以及如何解决几个现实世界的授权场景。在包含完整源代码的[Github仓库](https://github.com/acciente/oacc-example-securetodo)中也有相关文档。

## 文档

您可以在项目网站上找到更多关于OACC的信息，包括最新的Javadocs、发布版本和教程：
[oaccframework.org](http://oaccframework.org)。

## 关于Acciente

[Acciente, LLC](http://www.acciente.com) 是一家位于亚利桑那州斯科茨代尔的软件公司，专门从事中型到大型软件项目的系统架构和软件设计。

由于网络原因，上述网页的解析并没有成功。如果用户需要该网页的解析内容，请检查网页链接的合法性，并在可能的情况下重试。如果不需要链接解析，上述翻译应该已经回答了您的问题。




# chat

## 详细介绍一下 Keycloak


* any list
{:toc}