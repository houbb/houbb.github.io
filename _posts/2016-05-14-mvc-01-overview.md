---
layout: post
title: java web mvc-01-Model-View-Controller 概览 
date:  2016-5-14 11:58:26 +0800
categories: [WEB]
tags: [web, mvc, overview]
published: true
---

# 拓展阅读

[Java Servlet 教程-20-自己手写实现 spring mvc 整体思路](https://houbb.github.io/2018/09/27/java-servlet-tutorial-20-fake-mvc)

[Java Servlet 教程-21-自己手写 spring mvc 简单实现](https://houbb.github.io/2018/09/27/java-servlet-tutorial-21-fake-mvc-simple)

[Spring Web MVC-00-重学 mvc 系列](https://houbb.github.io/2019/12/25/springmvc-00-index)

[mvc-01-Model-View-Controller 概览](https://houbb.github.io/2016/05/14/mvc-01-overview)

[web mvc-03-JFinal](https://houbb.github.io/2016/05/14/mvc-03-jfinal-intro)

[web mvc-04-Apache Wicket](https://houbb.github.io/2016/05/14/mvc-04-apache-whicket-intro)

[web mvc-05-JSF JavaServer Faces](https://houbb.github.io/2016/05/14/mvc-05-jsf-intro)

[web mvc-06-play framework intro](https://houbb.github.io/2016/05/14/mvc-06-play-framework-intro)

[web mvc-07-Vaadin](https://houbb.github.io/2016/05/14/mvc-07-Vaadin)

[web mvc-08-Grails](https://houbb.github.io/2016/05/14/mvc-08-Grails)

# 从零手写组件系列

[java 从零手写 spring ioc 控制反转](https://github.com/houbb/ioc)

[java 从零手写 spring mvc](https://github.com/houbb/mvc)

[java 从零手写 jdbc-pool 数据库连接池](https://github.com/houbb/jdbc-pool)

[java 从零手写 mybatis](https://github.com/houbb/mybatis)

[java 从零手写 hibernate](https://github.com/houbb/hibernate)

[java 从零手写 rpc 远程调用](https://github.com/houbb/rpc)

[java 从零手写 mq 消息组件](https://github.com/houbb/rpc)

[java 从零手写 cache 缓存](https://github.com/houbb/cache)

[java 从零手写 nginx4j](https://github.com/houbb/nginx4j)

[java 从零手写 tomcat](https://github.com/houbb/minicat)

# chat

## 详细介绍一下 mvc

MVC（Model-View-Controller）是一种软件设计模式，旨在将应用程序的内部逻辑分离成三个主要组件，以提高代码的可维护性和可扩展性。

每个组件负责不同的任务，互相之间解耦，使得应用程序更容易理解和修改。

### 1. 模型（Model）：

模型是应用程序的数据和业务逻辑的表示。它负责处理数据的存储、检索、更新以及业务规则的实施。模型不依赖于用户界面或控制流程，而是专注于处理应用程序的数据和业务逻辑。在典型的应用中，模型通常包含数据库访问、文件操作、远程服务调用等。

### 2. 视图（View）：

视图是用户界面的表示，负责呈现模型的数据给用户以及接收用户的输入。视图通常是被动的，它根据模型的状态自动更新。视图并不直接处理用户输入或应用程序的业务逻辑，而是将这些任务委托给控制器。在 Web 应用中，视图可以是 HTML 页面、CSS 样式表等。

### 3. 控制器（Controller）：

控制器是处理用户输入并相应地更新模型和视图的组件。它充当模型和视图之间的中介，负责协调用户界面的响应和数据的更新。当用户与应用程序进行交互时，控制器捕获用户输入并调用适当的方法来更新模型或视图。在 Web 应用中，控制器通常是处理 HTTP 请求的组件。

### 工作流程：

1. **用户输入：** 用户与应用程序进行交互，提供输入。

2. **控制器处理：** 控制器捕获用户输入，根据输入调用适当的方法。

3. **模型更新：** 模型处理业务逻辑，更新数据状态。

4. **视图更新：** 视图根据新的模型状态自动更新，将更新后的数据呈现给用户。

5. **用户输出：** 用户看到更新后的界面，可以再次提供输入。

这个分层结构使得每个组件都可以独立开发和测试，同时保持彼此之间的解耦。这种模式使得应用程序更容易扩展和维护，因为修改一个组件不会影响其他组件的功能。

### 示例：

考虑一个简单的购物车应用：

- **模型：** 负责存储商品信息、计算总价等。
- **视图：** 负责展示购物车中的商品和总价。
- **控制器：** 负责处理用户的添加商品、删除商品等操作，并更新模型和视图。

```plaintext
User Input -> Controller -> Model (Update) -> View (Update) -> User Output
```

MVC 模式的灵活性和分离关注点的设计使其在各种软件应用中广泛应用，包括桌面应用、Web 应用和移动应用。

## 为什么需要 mvc？有什么优势？

MVC 架构被广泛采用的原因是它提供了许多优势，使得软件开发更加模块化、可维护和可扩展。

以下是一些使用 MVC 的优势：

1. **分离关注点（Separation of Concerns）：** MVC 将应用程序分为三个独立的组件，每个组件负责不同的任务。这种分离简化了代码的理解、维护和扩展，因为开发人员可以专注于特定方面的开发，而不必担心整个应用程序的复杂性。

2. **可维护性：** 由于模型、视图和控制器分离，对一个组件的修改不会影响其他组件。这使得修改、扩展和维护应用程序变得更加容易，因为不同的部分是相对独立的。

3. **可扩展性：** 由于每个组件都是相对独立的，因此可以轻松地添加新的功能或更改现有功能，而不会影响整体的应用程序结构。这使得应用程序更容易适应变化的需求。

4. **可重用性：** 每个组件都可以在不同的上下文中重复使用。例如，可以重用相同的模型逻辑在不同的视图中展示数据。这种可重用性降低了代码冗余，提高了开发效率。

5. **易测试性：** 由于模型、视图和控制器是相对独立的，可以更容易地进行单元测试。开发人员可以专注于测试每个组件的功能，确保其正常工作而不必考虑整个应用的复杂性。

6. **提高团队协作：** MVC 提供了清晰的架构和组件划分，有助于多个开发人员或团队协同工作。每个组件都有特定的职责，因此不同的开发者可以专注于各自领域，降低了沟通和合作的难度。

7. **支持并行开发：** 由于 MVC 分离了关注点，不同的团队成员可以并行开发各个组件，而不会相互干扰。这有助于提高开发速度和整体项目的交付效率。

总体而言，MVC 架构的引入使得软件开发更加模块化、灵活和可维护，有助于构建健壮、可扩展的应用程序。

## java 的 mvc 框架有哪些？

Java 的 MVC 框架有很多，以下是一些常见和流行的 Java MVC 框架：

1. **Spring MVC：** Spring MVC 是 Spring 框架的一部分，提供了一个强大的、灵活的 MVC 框架。它支持注解驱动的开发，集成了大量的功能，包括拦截器、数据绑定、表单处理、RESTful Web 服务等。

2. **Struts 2：** Struts 2 是 Apache Struts 框架的后继版本，它基于 WebWork 和 Struts 1 框架的经验。Struts 2 提供了一个灵活的 MVC 模型，支持拦截器、标签库、数据验证等特性。

3. **JSF（JavaServer Faces）：** JSF 是 Java 平台上的一种用户界面框架，提供了一种组件化的开发方式。JSF 的核心是一个 MVC 模型，它支持自定义组件、事件处理、国际化和验证。

4. **Play Framework：** Play Framework 是一款轻量级的、用于构建 Web 应用的框架，它采用了反应式编程的理念。Play 使用了类似于模型-视图-控制器的设计模式，使得开发者能够更容易地构建响应式和可伸缩的应用。

5. **Vaadin：** Vaadin 是一个用于构建富客户端 Web 应用的框架，它允许使用 Java 编写用户界面逻辑。Vaadin 的架构类似于模型-视图-控制器，但它在客户端和服务器之间使用了远程通信。

6. **Grails：** Grails 是一个基于 Groovy 的 Web 应用框架，它使用了 Spring MVC 作为其 MVC 实现。Grails 通过简化开发流程、提供领域特定语言（DSL）等特性，加速了 Web 应用的开发。

7. **Apache Wicket：** Apache Wicket 是一个组件化的 Web 应用框架，它采用了面向对象的编程方式。Wicket 提供了简单的组件模型，它的设计使得开发者能够使用 Java 类和面向对象的思维构建 Web 应用。

这些框架各自有其特点和适用场景，选择框架时需要考虑项目的需求、开发团队的经验和偏好等因素。

在实际项目中，Spring MVC 和 Struts 2 是比较常见和广泛使用的 Java MVC 框架。

## mvc 框架 jfinal 知道吗？

是的，我熟悉 JFinal。JFinal 是一款基于 Java 的 Web 开发框架，它采用了类似于 Ruby on Rails 的设计理念，致力于简化开发流程和提高开发效率。

JFinal 的主要特点包括：

1. **简单易用：** JFinal 的设计目标之一是使开发变得简单且易于理解。它采用了约定大于配置的思想，提供了简洁的 API 和清晰的文档。

2. **MVC 架构：** JFinal 遵循经典的 MVC 架构，将应用程序划分为模型（Model）、视图（View）和控制器（Controller）三个主要组件，以提高代码的可维护性。

3. **ActiveRecord 支持：** JFinal 提供了 ActiveRecord 模式，使得数据库操作更加简单。开发者可以使用 Java 对象进行数据库操作，而不必编写繁琐的 SQL。

4. **拦截器机制：** JFinal 提供了灵活的拦截器机制，可以在请求处理的不同阶段插入自定义逻辑，例如权限验证、日志记录等。

5. **插件体系：** JFinal 的插件体系使得开发者可以方便地扩展框架的功能，例如集成缓存、任务调度等。

6. **热加载：** JFinal 支持热加载特性，允许在开发阶段对代码进行修改而无需重启应用。

7. **RESTful 风格支持：** JFinal 提供了对 RESTful 风格的支持，使得构建 RESTful API 更加方便。

8. **模板引擎：** JFinal 默认使用 JFinal Template 作为模板引擎，但也支持其他常见的模板引擎。

总体而言，JFinal 是一个轻量级、灵活且易用的 Java Web 框架，适用于中小型项目和快速开发需求。它在简化开发流程、提高开发效率方面具有很好的表现。

## mvc 框架对比

下面是一些常见的 Java MVC 框架的对比表格，包括了一些主要的特点和适用场景。

请注意，这个表格提供的信息是基于我截至 2022 年 1 月的知识，可能有一些框架的新版本或新框架未被包含在内。

| 框架           | 主要特点和设计理念                                       | 适用场景                                      |
| -------------- | -------------------------------------------------------- | --------------------------------------------- |
| Spring MVC     | - 继承 Spring 框架，强大的生态系统<br/>- 注解驱动的开发<br/>- 高度可定制化 | 企业级应用程序，大型项目                      |
| Struts 2       | - 继承自 Struts 框架<br/>- 拦截器机制<br/>- 标签库和表单验证 | Web 应用程序，中小型项目                      |
| JSF            | - JavaServer Faces 规范<br/>- 组件化开发方式<br/>- 强调可重用组件 | 复杂的用户界面，企业级应用程序                |
| Play Framework | - 响应式编程<br/>- 简化开发流程，约定大于配置<br/>- 支持 Scala 语言 | 快速开发，轻量级 Web 应用，RESTful 服务        |
| Vaadin         | - 用 Java 编写用户界面逻辑<br/>- 服务器端渲染<br/>- 数据绑定和组件化 | 企业级应用程序，需要强大用户界面的项目         |
| Grails         | - 基于 Groovy 的框架<br/>- 领域特定语言（DSL）<br/>- 使用 Spring MVC | 快速开发，Groovy 语言，中小型项目              |
| Apache Wicket  | - 面向对象的编程方式<br/>- 组件化开发，面向组件编程<br/>- 服务器端渲染 | 复杂的用户界面，面向对象的设计，中小型项目    |
| JFinal         | - 基于 Java 的轻量级框架<br/>- 简单易用，约定大于配置<br/>- ActiveRecord 模式 | 快速开发，中小型项目                           |

这个表格提供了一些常见 Java MVC 框架的基本特点和适用场景，但具体选择框架还应根据项目需求、开发团队的经验和偏好等因素进行考虑。

每个框架都有其独特的优点和适用场景，可以根据具体情况选择最适合项目需求的框架。

## Ruby on Rails 的设计理念具体是指？

Ruby on Rails（简称 Rails）是一个基于 Ruby 编程语言的开发框架，它采用了一系列独特的设计理念，以提高开发效率和代码质量。

以下是 Ruby on Rails 的一些主要设计理念：

1. **约定大于配置（Convention over Configuration）：** Rails 强调约定胜于配置的思想。通过事先约定好的规则，开发者无需过多的配置，可以更专注于业务逻辑的开发。这减少了开发者需要进行的配置工作，提高了代码的一致性和可读性。

2. **DRY 原则（Don't Repeat Yourself）：** Rails 鼓励遵循 DRY 原则，即不要重复自己。这意味着避免在代码中重复相同的逻辑，而是将通用的功能提取为可重用的组件，减少了代码冗余，提高了代码的可维护性。

3. **开发者友好：** Rails 关注开发者的体验，致力于提供一种愉悦的开发环境。它提供了丰富的代码生成器、自动化测试工具和良好的文档，以降低学习曲线和提高开发效率。

4. **ActiveRecord 模式：** Rails 引入了 ActiveRecord 模式，将数据库表映射到 Ruby 对象，使得数据库操作更加直观和简单。开发者可以使用 Ruby 对象进行数据库操作，而不必直接编写 SQL 语句。

5. **MVC 架构：** Rails 遵循经典的 MVC 架构，将应用程序划分为模型（Model）、视图（View）和控制器（Controller）三个主要组件。这种分层架构提高了代码的组织性和可维护性。

6. **RESTful 风格：** Rails 推崇 RESTful 风格的设计，使得构建符合 RESTful 架构原则的 Web 应用变得更加自然和简便。它提供了支持 RESTful 路由和资源的工具，使得资源的创建、更新、删除等操作能够符合 RESTful 风格。

7. **集成测试：** Rails 提倡全栈集成测试，包括对控制器、模型和视图的测试。这有助于保证整个应用的功能正常运作，提高了代码的可靠性。

8. **开放源代码：** Rails 是开源框架，这意味着任何人都可以查看、使用和贡献代码。这促进了社区的合作和框架的不断发展。

这些设计理念使得 Ruby on Rails 成为一个受欢迎的 Web 开发框架，特别适用于快速开发、迭代开发和遵循最佳实践的项目。



* any list
{:toc}