---
layout: post
title:  java web mvc-06-play framework intro
date:  2016-5-14 11:58:26 +0800
categories: [WEB]
tags: [web, mvc]
published: true
---

# 拓展阅读

[Spring Web MVC-00-重学 mvc](https://houbb.github.io/2019/12/25/springmvc-00-index)

[mvc-01-Model-View-Controller 概览](https://houbb.github.io/2016/05/14/mvc-01-overview)

[web mvc-03-JFinal](https://houbb.github.io/2016/05/14/mvc-03-jfinal-intro)

[web mvc-04-Apache Wicket](https://houbb.github.io/2016/05/14/mvc-04-apache-whicket-intro)

[web mvc-05-JSF JavaServer Faces](https://houbb.github.io/2016/05/14/mvc-05-jsf-intro)

[web mvc-06-play framework intro](https://houbb.github.io/2016/05/14/mvc-06-play-framework-intro)

[web mvc-07-Vaadin](https://houbb.github.io/2016/05/14/mvc-07-Vaadin)

[web mvc-08-Grails](https://houbb.github.io/2016/05/14/mvc-08-Grails)


## 开源

> [The jdbc pool for java.(java 手写 jdbc 数据库连接池实现)](https://github.com/houbb/jdbc-pool)

> [The simple mybatis.（手写简易版 mybatis）](https://github.com/houbb/mybatis)


# play framework

Play是一个高生产力的Java和Scala Web应用程序框架，集成了现代Web应用程序开发所需的组件和API。

Play基于轻量级、无状态、面向Web的架构，并通过其基于Pekko Streams的响应式模型实现了对高度可扩展应用程序的可预测和最小资源消耗（CPU、内存、线程）。

# 是什么？

Play是一个高生产力的Java和Scala Web应用程序框架，集成了用于现代Web应用程序开发的组件和API。Play是由Web开发人员为Web应用程序开发而开发的。

你会发现Play的模型-视图-控制器（MVC）架构非常熟悉且易于学习。Play提供了简洁而功能强大的编程模式。而且，由大量开发Play应用程序的社区提供了一个优秀的资源，可用于解答你的问题。

作为一个全栈框架，Play包含构建Web应用程序和REST服务所需的所有组件，例如集成的HTTP服务器、表单处理、跨站请求伪造（CSRF）保护、强大的路由机制、国际化支持等。Play通过直接支持日常任务和热重载来节省宝贵的开发时间，使你能够立即查看工作结果。

Play的轻量级、无状态、面向Web的架构在底层使用了Pekko和Pekko Streams，以提供可预测且最小的资源消耗（CPU、内存、线程）。由于其响应式模型，应用程序在水平和垂直方向上都能自然地扩展。

Play对于数据库访问没有固定的看法，并与许多对象关系映射（ORM）层集成。

它支持Anorm、Slick和JPA，但许多用户使用NoSQL或其他ORM。

# 准备工作

Play应用程序只需包含Play JAR文件即可正确运行。这些JAR文件已发布到Maven存储库，因此你可以使用任何Java或Scala构建工具来构建Play项目。

然而，当使用sbt时，Play提供了增强的开发体验（支持路由、模板编译和自动重载）。

Play要求：

- 使用Java LTS版本11、17或21之一。然而，请注意，Java 11的支持将在即将发布的Play版本中被移除，因此我们建议至少使用Java 17。
- sbt - 我们建议使用最新版本。

## 验证和安装Java：

要检查是否安装了Java SE 11或更高版本，请在终端中输入以下命令：

```bash
java -version
```

你应该看到类似于以下内容：

```bash
openjdk version "17.0.8" 2023-07-18
OpenJDK Runtime Environment Temurin-17.0.8+7 (build 17.0.8+7)
OpenJDK 64-Bit Server VM Temurin-17.0.8+7 (build 17.0.8+7, mixed mode)
```

你可以从Adoptium获取Java SE。

## 验证和安装sbt：

如果你想使用sbt创建新项目或运行Play示例项目之一，你需要在系统上安装sbt启动器。

安装了sbt后，你可以使用我们的giter8模板（用于Java或Scala）通过一个命令创建自己的项目，使用`sbt new`命令。

在sbt下载页面上找到链接以安装sbt启动器，并参考sbt文档了解如何设置。

## **恭喜！**

现在你已经准备好使用Play了！要了解Play的实际操作，请尝试下一页上描述的示例。

如果安装了sbt，你可以使用一个命令创建一个新的Play项目，使用我们的giter8 Java或Scala模板。

这些模板为你设置了项目结构和开发环境。

你还可以轻松地将Play项目集成到你喜欢的IDE中。



# Hello World 教程

这个教程描述了 Play 应用程序的工作原理，并向你展示如何创建一个页面，显示一个定制的 Hello World 问候语。

你可以使用任何 Java 构建工具来构建 Play 项目。

该教程演示了 sbt 和 Gradle，因为它们都提供了 Play 所以著称和受欢迎的开发体验，如自动重新加载、清晰的错误消息和模板编译。教程的步骤假设你会在终端中使用 sbt 或 gradlew 命令，但你也可以将 Play 项目集成到你喜欢的集成开发环境（IDE）中。

## Starting the project

启动项目之前，请确保已验证运行 Play 所需的要求，并获取相应的示例项目。

你可以克隆 play-samples GitHub 仓库，或者下载其内容作为 zip 文件。

- [Play Java Starter Example](https://github.com/playframework/play-samples/tree/2.9.x/play-java-starter-example)
- [Play Scala Starter Example](https://github.com/playframework/play-samples/tree/2.9.x/play-scala-starter-example)

在相应示例项目的文件夹内，按照 README.md 文件中的步骤运行示例。请注意：当你运行教程应用程序时，它会显示与文档中相同内容和说明的网页。教程中包含一个故意的错误，将文档和应用程序页面在不同的标签页或浏览器中打开，以便在遇到错误时可以查阅文档进行修复。

## Play 框架简介

如下图所示，Play 是一个全栈框架，拥有构建 Web 应用程序或 REST 服务所需的所有组件，包括：集成的 HTTP 服务器、表单处理、跨站请求伪造（CSRF）保护、强大的路由机制、国际化支持等等。Play 与许多对象关系映射（ORM）层集成。

它支持 Anorm、Ebean、Slick 和 JPA，但许多用户也使用 NoSQL、其他 ORM，甚至从 REST 服务中访问数据。

![Play 框架简介](https://www.playframework.com/documentation/3.0.x/resources/manual/tutorial/images/play-stack.png)

Play 的 API 可以在 Java 和 Scala 中使用。

框架在内部使用了 Pekko 和 Pekko HTTP。这使得 Play 应用程序具有无状态、非阻塞、事件驱动的架构，实现了水平和垂直的可扩展性，并更有效地利用资源。

Play 项目包含 Scala 组件，但由于 Play 具有 Java API，因此 Java 开发人员无需学习 Scala 就能成功使用 Play。

以下是开发人员喜欢使用 Play 框架的一些原因：

- 其 Model-View-Controller（MVC）架构熟悉且易于学习。
- 直接支持常见的 Web 开发任务和热重载，节省宝贵的开发时间。
- 庞大的活跃社区促进知识共享。

Twirl 模板用于渲染页面。Twirl 模板语言：

- 易于学习
- 不需要特殊编辑器
- 提供类型安全
- 编译后在浏览器中显示错误

要了解更多有关 Play 的优势，请参阅 Play 的介绍和哲学。现在，让我们深入了解一个 Play 应用程序的外观。

# Play 应用程序概述

这个教程实现为一个简单的 Play 应用程序，我们可以检查以开始学习有关 Play 的知识。

让我们首先看一下运行时发生了什么。当你在浏览器中输入 http://localhost:9000/ 时：

1. 浏览器使用 GET 方法向 HTTP 服务器请求根目录 / URI。
2. Play 内部 HTTP 服务器接收到请求。
3. Play 使用路由文件解析请求，该文件将 URI 映射到控制器操作方法。
4. 操作方法使用 Twirl 模板呈现索引页面。
5. HTTP 服务器将响应作为 HTML 页面返回。

在高层次上，流程大致如下图所示：

![overview](https://www.playframework.com/documentation/3.0.x/resources/manual/tutorial/images/play-request-response.png)

## 探索项目

接下来，让我们查看教程项目，找到以下实现：

1. 映射请求到控制器方法的 routes 文件。
2. 定义如何处理根 URI 请求的控制器操作方法。
3. 操作方法调用以呈现 HTML 标记的 Twirl 模板。

按照以下步骤深入查看源文件：

注意：在下面的步骤中，对于 Windows shell，使用 \ 替代路径名中的 /（但无需更改 URL 路径名）。

1. 使用命令窗口或图形界面，查看顶级项目目录的内容。以下目录包含应用程序组件：
   - `app` 子目录包含控制器和视图的目录，对于熟悉 Model-View-Controller（MVC）架构的人来说，这将是常见的。由于这个简单项目不需要外部数据存储库，它不包含 models 目录，但你可以在那里添加它。
   - `public` 子目录包含图像、JavaScript 和样式表的目录。
   - `conf` 目录包含应用程序配置。有关项目结构的其余部分的详细信息，请参阅 Play 应用程序的解剖学。

2. 要找到控制器操作方法，请使用你喜欢的文本编辑器打开 app/controllers/HomeController.java（或 .scala）文件。HomeController 类包含 index 操作方法，如下所示。这是一个非常简单的操作方法，从 index.scala.html Twirl 模板文件生成 HTML 页面。

```java
public Result index() {
    return ok(views.html.index.render("Your app is ready."));
}
```

要查看将浏览器请求映射到控制器方法的路由，请打开 `conf/routes` 文件。一个路由由一个 HTTP 方法、一个路径和一个动作组成。这对于设计清晰、易于阅读、可书签的 URL 架构非常有用。下面的行将对根 URL `/` 的 GET 请求映射到 HomeController 中的 index 操作：

```plaintext
GET     /           controllers.HomeController.index
```

打开 `app/views/index.scala.html` 文件，使用你的文本编辑器。

在这个文件中，主要的指令调用了主模板 `main.scala.html`，并传递了字符串 "Welcome to Play" 以生成页面。

你可以打开 `app/views/main.scala.html` 查看如何使用字符串参数设置页面标题。

通过这个教程应用程序的概览，你已经准备好添加一个 "Hello World" 问候了。

# 实现 Hello World

为了看到如何简单地使用 Play，让我们向这个教程应用程序添加一个定制的 "Hello World" 问候。

主要步骤包括：

1. 创建 Hello World 页面
2. 添加一个操作方法
3. 定义一个路由
4. 定制问候语

## 1. 创建 Hello World 页面

按照以下说明向项目添加一个新的 Hello World 页面。

使用任何文本编辑器，在该项目的 `app/views` 目录中创建一个名为 `hello.scala.html` 的文件，并保存。将以下内容添加到文件中：

```html
<!-- app/views/hello.scala.html -->
@()

@main("Hello") {
    <section id="top">
        <div class="wrapper">
            <h1>Hello World</h1>
        </div>
    </section>
}
```

这个 Twirl 和 HTML 标记实现了以下功能：

- `@` 符号告诉模板引擎解释接下来的内容。
- 在这种情况下，`@main("Hello")` 调用主模板 `main.scala.html` 并将页面标题设置为 "Hello"。
- 内容部分包含 Hello World 问候语。主模板将把它插入页面的主体。

现在，我们准备添加一个操作方法，用于呈现新页面。

## 2. 添加一个操作方法

为了添加一个新页面的操作方法：

打开 `app/controllers/HomeController.java`（或 `.scala`）文件。

在 `tutorial` 方法下方并在结束大括号之前，添加以下方法：

**Java:**
```java
public Result hello() {
    return ok(views.html.hello.render());
}
```

**Scala:**
```scala
def hello: Action[AnyContent] = Action { implicit request =>
  Ok(views.html.hello())
}
```

这个方法返回一个 `Result`，其中调用了 `views.html.hello.render()`，这将渲染我们刚刚创建的 Hello World 页面。

现在，我们需要在浏览器请求 `hello` 页面时，Play 调用这个新的操作方法。这需要添加一个路由，将页面映射到这个方法。

## 3. 定义一个路由

为了为新的 Hello 页面定义一个路由：

打开 `conf/routes` 文件并添加以下行：

```plaintext
GET     /hello      controllers.HomeController.hello
```

当你在 routes 文件中添加一个路由时，Play 的路由编译器会自动生成一个路由器类，它使用你的控制器的实例调用该操作。

有关更多信息，请参阅路由文档。默认情况下，控制器实例使用依赖注入创建（参见 Java 和 Scala 的文档）。

现在，你已经准备好测试新的页面了。如果由于某些原因停止了应用程序，请使用 `sbt run` 命令重新启动它。

在浏览器中输入 URL `http://localhost:9000/hello`，以查看你的工作结果。浏览器应该会以类似以下的方式响应：

```plaintext
Hello World
```

你已经成功地添加了一个自定义的 "Hello World" 页面到你的 Play 应用程序中！

![greeting](https://www.playframework.com/documentation/3.0.x/resources/manual/tutorial/images/hello-page.png)

## 4. 定制问候语

作为本教程的最后一部分，我们将修改 hello 页面以接受一个 HTTP 请求参数。

这些步骤包括一个故意的错误，以演示 Play 如何提供有用的反馈。

为了定制 Hello World 问候语，请按照以下说明进行操作。

在 `app/controllers/HomeController.java`（或 `.scala`）文件中，修改 `hello` 操作方法以接受一个 `name` 参数，使用以下代码：

**Java:**
```java
public Result hello(String name) {
    return ok(views.html.hello.render());
}
```

**Scala:**
```scala
def hello(name: String): Action[AnyContent] = Action { implicit request =>
  Ok(views.html.hello(name))
}
```

在 `conf/routes` 文件中，将一个 `(name: String)` 参数添加到 `hello` 结尾：

```plaintext
GET  /hello        controllers.HomeController.hello(name: String)
```

在 Twirl 模板中，必须声明所有变量及其类型。在 `app/views/hello.scala.html` 文件中：

1. 在文件顶部插入一行新行。
2. 在该行上，添加一个 `@` 指令，声明 `name` 参数及其类型：`@(name: String)`。
3. 为了在页面上使用这个变量，将 `<h2>` 标题中的文本从 `Hello World!` 更改为 `<h2>Hello @name!</h2>`。

最终结果将是：

```html
@(name: String)
@main("Hello") {
    <section id="top">
        <div class="wrapper">
            <h1>Hello, @name</h1>
        </div>
    </section>
}
```

在浏览器中输入以下 URL，并通过查询参数将任何名称传递给 `hello` 方法：`http://localhost:9000/hello?name=MyName`。

Play 将返回一个有用的编译错误，让你知道返回值中的 `render` 方法需要一个有类型的参数：

![render](https://www.playframework.com/documentation/3.0.x/resources/manual/tutorial/images/hello-error.png)


为了修复编译错误，在 HomeController 中修改 `hello` 操作方法，以便在渲染视图时包含 `name` 参数：

**Java:**
```java
public Result hello(String name) {
   return ok(views.html.hello.render(name));
}
```

**Scala:**
```scala
def hello(name: String): Action[AnyContent] = Action { implicit request =>
  Ok(views.html.hello(name))
}
```

保存文件并刷新浏览器。页面应该显示一个类似以下的定制问候语：

# 拓展阅读

https://www.playframework.com/documentation/3.0.x/Tutorials

------------------------------------------------------------------------------------------------------


# chat

## 详细介绍一下 mvc 框架 Play Framework

Play Framework 是一种用于构建 Web 应用程序的开源框架，它采用了 MVC（Model-View-Controller）架构模式。下面是关于 Play Framework 中 MVC 框架的详细介绍：

1. **Model（模型）:**
   - **定义：** 模型表示应用程序的数据和业务逻辑。在 Play Framework 中，通常使用 Scala 或 Java 编写模型类，这些类负责处理与数据库的交互、数据验证以及业务规则的实现。
   - **示例：** 一个模型类可以代表应用程序中的实体（如用户、产品等），并包含与数据库的交互方法，如保存、更新、删除等。

2. **View（视图）:**
   - **定义：** 视图负责呈现用户界面。在 Play 中，视图通常使用模板引擎（如 Twirl）编写，它允许将动态数据嵌入到静态模板中，以生成最终的 HTML。
   - **示例：** 一个视图可以包含 HTML 代码，同时通过模板引擎插入来自控制器的动态数据，最终形成用户可以看到的网页。

3. **Controller（控制器）:**
   - **定义：** 控制器负责处理用户的请求并决定如何响应。它是应用程序中处理逻辑的地方，负责协调模型和视图的交互。
   - **示例：** 控制器接收来自用户的 HTTP 请求，从模型获取数据，然后选择合适的视图将数据呈现给用户。它还可以处理表单提交、路由请求等。

4. **路由（Routes）:**
   - **定义：** 在 Play Framework 中，路由是定义应用程序中 URL 如何映射到控制器和动作的地方。通过路由，可以将不同的 URL 映射到不同的控制器方法。
   - **示例：** 通过定义路由，可以指定类似于 "/users" 的 URL 映射到特定的用户控制器，然后由该控制器处理相关逻辑。

5. **异步和非阻塞：**
   - Play Framework 支持异步和非阻塞的编程模型，允许应用程序处理大量并发请求而无需阻塞线程。这是通过使用 Akka 等技术来实现的，有助于构建高性能的 Web 应用程序。

6. **依赖注入（DI）:**
   - Play Framework 使用依赖注入来管理组件之间的依赖关系。这使得代码更易于测试、维护和扩展。

总体而言，Play Framework 提供了一种灵活且高效的方式来构建现代化的 Web 应用程序，采用了 MVC 架构模式以实现代码的模块化和可维护性。

在开发过程中，开发者可以专注于各个组件的职责，从而更容易实现功能和维护代码。

## 给一个 mvc 框架 Play Framework 入门例子

以下是一个简单的 Play Framework 入门例子，演示了基本的 MVC 架构和路由配置。

这个例子使用 Scala 语言编写。

1. **创建 Play 项目：**
   - 使用 sbt（Scala Build Tool）创建一个新的 Play 项目。在命令行中执行以下命令：
     ```bash
     sbt new playframework/play-scala-seed.g8
     ```

2. **定义路由：**
   - 打开 `conf/routes` 文件，添加以下路由配置：
     ```scala
     # Home page
     GET     /            controllers.HomeController.index()

     # User page
     GET     /user        controllers.UserController.show()
     ```

3. **创建控制器：**
   - 在 `app/controllers` 目录下创建两个控制器文件：`HomeController.scala` 和 `UserController.scala`。
     ```scala
     // HomeController.scala
     package controllers

     import javax.inject._
     import play.api.mvc._

     @Singleton
     class HomeController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
       def index() = Action { implicit request: Request[AnyContent] =>
         Ok(views.html.index("Welcome to Play Framework!"))
       }
     }
     ```

     ```scala
     // UserController.scala
     package controllers

     import javax.inject._
     import play.api.mvc._

     @Singleton
     class UserController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
       def show() = Action { implicit request: Request[AnyContent] =>
         Ok(views.html.user("User Page"))
       }
     }
     ```

4. **创建视图：**
   - 在 `app/views` 目录下创建两个视图文件：`index.scala.html` 和 `user.scala.html`。
     ```html
     <!-- index.scala.html -->
     @(message: String)

     @main("Welcome") {
       <h1>@message</h1>
     }
     ```

     ```html
     <!-- user.scala.html -->
     @(message: String)

     @main("User Page") {
       <h1>@message</h1>
     }
     ```

5. **运行应用：**
   - 在项目根目录执行以下命令启动应用：
     ```bash
     sbt run
     ```
   - 访问 [http://localhost:9000](http://localhost:9000) 可以看到欢迎页面，访问 [http://localhost:9000/user](http://localhost:9000/user) 可以看到用户页面。

这个例子演示了一个简单的 Play Framework 应用程序，包含了两个页面（首页和用户页面），每个页面对应一个控制器和一个视图。

通过定义路由，Play 框架能够将请求映射到相应的控制器方法，并呈现对应的视图。

这是一个基本的 MVC 结构的入门示例，你可以在此基础上逐步扩展和深入学习 Play Framework。

## play framework 的最佳实践

Play Framework 是一个灵活且强大的框架，采用了异步和非阻塞的编程模型，同时支持多种语言（如Scala和Java）。

以下是一些 Play Framework 的最佳实践：

1. **异步和非阻塞编程：**
   - 充分利用 Play 的异步和非阻塞特性，尤其是在处理 I/O 密集型任务时。使用 `Action.async` 和 `Future` 来编写异步代码，以确保在大量并发请求下保持高性能。

2. **依赖注入（DI）:**
   - 使用 Play 提供的依赖注入机制，通过构造函数注入依赖项。这样做有助于代码的可测试性、可维护性和扩展性。

3. **良好的项目结构：**
   - 组织项目的代码结构，将不同的功能模块划分到不同的包中。这样可以使代码更具可读性和可维护性。

4. **合理使用路由：**
   - 在路由配置中使用 RESTful 风格，使用参数和路径来定义 URL。合理规划路由结构，使其直观且易于维护。

5. **错误处理：**
   - 实现良好的错误处理机制，包括全局错误处理和针对特定请求的错误处理。使用 Play 的 `HttpErrorHandler` 来自定义错误页面和响应。

6. **安全性考虑：**
   - 在处理用户输入时，确保进行适当的输入验证和防范攻击措施，防止常见的安全漏洞，如跨站脚本攻击（XSS）和跨站请求伪造（CSRF）。

7. **缓存和性能优化：**
   - 使用 Play 框架提供的缓存机制，减少对数据库和外部服务的频繁访问。考虑采用适当的缓存策略以提高性能。

8. **日志记录：**
   - 在代码中添加适当的日志记录，以便在生产环境中追踪和调试问题。Play 默认使用 Akka 日志，你可以根据需要进行配置。

9. **数据库访问：**
   - 使用 Play 提供的数据库访问库（如 Slick）来执行数据库操作。确保使用异步数据库驱动以充分利用非阻塞特性。

10. **单元测试和集成测试：**
    - 编写充分的单元测试和集成测试，确保代码的可靠性和稳定性。使用 Play 提供的测试工具和框架来简化测试流程。

11. **版本管理和发布：**
    - 使用版本管理工具（如 Git）进行代码版本控制。考虑使用 CI/CD 工具自动化构建、测试和部署过程，确保代码的持续集成和交付。

12. **文档和社区参与：**
    - 编写清晰和详细的文档，使团队成员能够更好地理解项目结构和代码。积极参与 Play Framework 社区，获取帮助、分享经验和了解最新的最佳实践。

通过遵循这些最佳实践，你可以更好地利用 Play Framework 的特性，构建高性能、可维护且安全的 Web 应用程序。

## play framework 的优缺点

Play Framework 是一款强大的开发框架，但它也有一些优点和缺点，具体取决于项目的需求和开发者的偏好。

**优点：**

1. **异步和非阻塞：** Play Framework 使用异步和非阻塞的编程模型，使其在处理大量并发请求时表现出色，提高了应用程序的性能。

2. **全栈框架：** Play 提供了完整的开发栈，包括路由、控制器、模型、视图和数据库访问等组件，使得开发者能够更轻松地构建全功能的 Web 应用程序。

3. **依赖注入：** Play 使用依赖注入来管理组件之间的依赖关系，使得代码更易于测试、维护和扩展。

4. **支持多语言：** Play 支持多种编程语言，包括 Scala 和 Java。这使得开发者可以选择更适合他们技能和项目需求的语言。

5. **RESTful风格：** Play 的路由配置支持 RESTful 风格，使得 API 的设计更加直观和易于理解。

6. **实时性能：** Play 框架内置了 Akka，使得实时应用程序的开发更为容易，比如聊天应用或实时通信。

7. **自动重载：** Play 提供了代码更改时的热重载功能，可以在不停止应用程序的情况下进行开发和调试。

**缺点：**

1. **学习曲线：** 对于初学者来说，Play Framework 可能有一定的学习曲线，特别是对于那些不熟悉异步和非阻塞编程模型的开发者。

2. **社区相对较小：** 相对于一些其他流行的框架，Play Framework 的社区规模相对较小。这可能意味着在解决问题时可能会找到的资源相对较少。

3. **API 稳定性：** 在某些版本迭代中，Play Framework 的 API 可能会发生变化，这可能导致升级时需要做出一些调整。

4. **文档不够详尽：** 尽管 Play Framework 有文档，但某些方面的文档可能不够详尽，需要开发者通过其他资源来获取更多信息。

5. **不适用于所有项目：** 异步和非阻塞模型可能并不适合所有类型的应用程序。在一些场景下，同步模型可能更容易理解和维护。

总体而言，Play Framework 是一款强大的框架，特别适用于需要高性能、实时性和可扩展性的 Web 应用程序。在选择框架时，开发者应该根据项目的需求和自身经验权衡这些优点和缺点。

## Play Framework 的学习资料，包含网址

学习 Play Framework 的过程中，你可以参考以下一些在线学习资料和官方文档。

请注意，由于我的知识截止日期是2022年1月，以下链接可能有变化。

建议在搜索引擎中查找最新的学习资源。

1. **官方文档：**
   - [Play Framework 官方文档](https://www.playframework.com/documentation)
     - 官方文档提供了全面的指南、教程和参考资料，适合从基础到高级的学习者。

2. **教程和示例：**
   - [Play Framework 入门教程](https://developer.lightbend.com/guides/play-scala/)
     - Lightbend 提供了一系列的入门教程，适用于初学者。
   - [Play Framework - 在线示例](https://github.com/playframework/play-samples)
     - 官方示例项目，包含了多个使用 Play 的实际示例，可以帮助你学习最佳实践。

3. **博客和文章：**
   - [Play Framework Blog](https://www.playframework.com/blog)
     - Play Framework 官方博客包含了一些深入的技术文章和更新。
   - [Baeldung - Play Framework Tutorials](https://www.baeldung.com/tag/play-framework/)
     - Baeldung 提供了一些关于 Play Framework 的教程和文章。

4. **视频教程：**
   - [Play Framework Tutorial - YouTube](https://www.youtube.com/watch?v=LgAwiLWb0CA)
     - YouTube 上有一些关于 Play Framework 的视频教程，可以帮助你通过实际演示学习。

5. **社区和论坛：**
   - [Play Framework Google Group](https://groups.google.com/g/play-framework)
     - Play Framework 的官方 Google Group 是一个活跃的社区论坛，你可以在这里提问问题、分享经验和获取帮助。

6. **GitHub 仓库：**
   - [Play Framework GitHub 仓库](https://github.com/playframework/playframework)
     - Play Framework 的源代码存储在 GitHub 上，你可以查看源码、提交问题和贡献代码。

请注意，通过多样化的学习方式，结合官方文档、示例和社区支持，你可以更全面地了解 Play Framework 并提高你的应用程序开发技能。

# 参考资料

https://www.playframework.com/documentation/3.0.x/Home

* any list
{:toc}