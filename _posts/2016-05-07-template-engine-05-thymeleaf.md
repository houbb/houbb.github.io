---
layout: post
title:  Template Engine-05-模板引擎 Thymeleaf 入门介绍
date:  2016-5-7 17:21:21 +0800
categories: [Template]
tags: [template, sh]
published: true
---

# 拓展阅读

[java 表达式引擎](https://houbb.github.io/2020/06/21/expression-for-java)

[logstash 日志加工处理-08-表达式执行引擎 AviatorScript+MVEL+OGNL+SpEL+JEXL+JUEL+Janino](https://houbb.github.io/2023/10/30/logstash-07-express-engine)

[QLExpress 阿里表达式引擎系统学习](https://houbb.github.io/2018/06/10/qlexpress-01-quick-start)

[Spring Boot-07-thymeleaf 模板引擎整合使用](https://houbb.github.io/2017/12/19/spring-boot-07-thymeleaf)

[Template Engine-01-模板引擎简介](https://houbb.github.io/2016/05/07/template-engine-01-overview)

[Template Engine-02-模板引擎 Freemarker](https://houbb.github.io/2016/05/07/template-engine-02-freemarker)

[Template Engine-03-模板引擎 Freemarker Advance](https://houbb.github.io/2016/05/07/template-engine-03-freemarker-advanced)

[Template Engine-04-模板引擎 Velocity](https://houbb.github.io/2016/05/07/template-engine-04-velocity)

[Template Engine-05-模板引擎 Thymeleaf 入门介绍](https://houbb.github.io/2016/05/07/template-engine-05-thymeleaf)

[Template Engine-06-模板引擎 Handlebars 入门介绍](https://houbb.github.io/2016/05/07/template-engine-06-handlebars)

[Template Engine-07-模板引擎 Mustache 入门介绍 Logic-less templates.](https://houbb.github.io/2016/05/07/template-engine-07-mustache)

# Thymeleaf简介

## 1.1 什么是Thymeleaf？
Thymeleaf是一款现代的服务器端Java模板引擎，适用于Web和独立环境，能够处理HTML、XML、JavaScript、CSS甚至纯文本。

Thymeleaf的主要目标是提供一种优雅且易于维护的创建模板的方式。为实现这一目标，它建立在自然模板的概念上，以一种不影响将模板用作设计原型的方式将其逻辑注入模板文件中。这有助于改善设计和开发团队之间的沟通，弥合设计与开发之间的差距。

Thymeleaf从一开始就考虑了Web标准，特别是HTML5，允许您创建完全验证的模板（如果需要的话）。

## 1.2 Thymeleaf可以处理哪些类型的模板？
在开箱即用的情况下，Thymeleaf允许处理六种类型的模板，每种都被称为模板模式：

- HTML
- XML
- TEXT
- JAVASCRIPT
- CSS
- RAW

有两种标记模板模式（HTML和XML），三种文本模板模式（TEXT、JAVASCRIPT和CSS）以及一种无操作模板模式（RAW）。

HTML模板模式将允许任何类型的HTML输入，包括HTML5、HTML 4和XHTML。不会执行验证或格式良好检查，模板代码/结构将在输出中尽可能大程度地保留。

XML模板模式将允许XML输入。在这种情况下，代码应为格式良好的，不允许有未关闭的标签、未引用的属性等，如果发现格式良好性违规，则解析器将抛出异常。请注意，不会执行验证（针对DTD或XML Schema）。

TEXT模板模式将允许使用非标记性质的模板的特殊语法。此类模板的示例可能是文本电子邮件或模板化文档。请注意，HTML或XML模板也可以被处理为TEXT，在这种情况下，它们不会被解析为标记，每个标签、DOCTYPE、注释等将被视为纯文本。

JAVASCRIPT模板模式将允许处理Thymeleaf应用程序中的JavaScript文件。这意味着可以在JavaScript文件中以与在HTML文件中相同的方式使用模型数据，但具有JavaScript特定的集成，如专门的转义或自然脚本。JAVASCRIPT模板模式被视为文本模式，因此使用与TEXT模板模式相同的特殊语法。

CSS模板模式将允许处理Thymeleaf应用程序中涉及的CSS文件。与JAVASCRIPT模式类似，CSS模板模式也是文本模式，并使用TEXT模板模式的特殊处理语法。

RAW模板模式将根本不处理模板。它旨在用于将未触及的资源（文件、URL响应等）插入到正在处理的模板中。例如，可以将以HTML格式呈现的外部、不受控制的资源安全地包含到应用程序模板中，以确保这些资源可能包含的任何Thymeleaf代码不会被执行。

## 1.3 方言：标准方言

Thymeleaf是一款极其可扩展的模板引擎（实际上可以称之为模板引擎框架），允许您详细定义和定制模板的处理方式。

将某种逻辑应用于标记工件（标签、一些文本、注释或者仅仅是占位符，如果模板不是标记）的对象称为处理器，一个方言通常由一组这些处理器以及可能的一些额外工件组成。Thymeleaf的核心库提供了一个称为“标准方言”的方言，对大多数用户来说应该足够了。

请注意，方言实际上可能没有处理器，并且完全由其他类型的工件组成，但处理器绝对是最常见的用例。

本教程涵盖了标准方言。即使没有明确提到，你将在以下页面中学到的每个属性和语法功能都是由该方言定义的。

当然，用户可以创建自己的方言（甚至扩展标准方言），如果他们想要定义自己的处理逻辑并利用库的高级功能。Thymeleaf还可以配置为同时使用多个方言。

官方的thymeleaf-spring3和thymeleaf-spring4集成包都定义了一个称为“SpringStandard方言”的方言，它与标准方言


# chat

## 详细介绍一下 Thymeleaf

Thymeleaf（模板引擎）是一种用于Web和独立环境的现代服务器端Java模板引擎。它是一个强大且灵活的模板引擎，主要用于构建基于Java的Web应用程序，尤其是在Spring框架中广泛使用。以下是关于Thymeleaf的详细介绍：

### 1. **模板语法**

Thymeleaf的语法设计旨在让模板易于阅读和编写，同时保持足够的灵活性。它使用自然的HTML属性来扩展标准的HTML模板。以下是一些基本的Thymeleaf语法：

- **变量表达式：** 使用`[[...]]`表示，用于在模板中输出动态值。

  ```html
  <p>Welcome, [[${user.name}]]!</p>
  ```

- **迭代器：** 使用`th:each`指令进行循环迭代。

  ```html
  <ul>
      <li th:each="item : ${items}" th:text="${item}">Item</li>
  </ul>
  ```

- **条件判断：** 使用`th:if`和`th:unless`进行条件判断。

  ```html
  <p th:if="${user.isAdmin}">Welcome Admin!</p>
  ```

- **模板片段：** 使用`th:fragment`定义和引用模板片段。

  ```html
  <div th:fragment="header">Header content</div>
  <div th:replace="fragments/header :: header"></div>
  ```

### 2. **与Spring框架集成**

Thymeleaf广泛用于与Spring框架集成，特别是Spring MVC。Spring提供了`spring-boot-starter-thymeleaf`等库来简化Thymeleaf的集成。通过该集成，Thymeleaf能够轻松访问Spring中的模型对象。

```java
@Controller
public class MyController {

    @GetMapping("/hello")
    public String hello(Model model) {
        model.addAttribute("message", "Hello, Thymeleaf!");
        return "hello"; // 视图的名称，会自动映射到classpath:/templates/hello.html
    }
}
```

在上述示例中，`hello.html`模板可以访问通过`model.addAttribute("message", "Hello, Thymeleaf!")`添加的`message`变量。

### 3. **特点和优势**

- **自然的语法：** Thymeleaf使用自然的HTML属性，使得模板易于读写，并且即使在没有模板引擎的情况下，HTML仍然有效。

- **Spring集成：** Thymeleaf与Spring框架无缝集成，提供了方便的访问Spring应用程序上下文的能力。

- **表达式语言：** 支持强大的表达式语言，可以在模板中进行复杂的逻辑处理和计算。

- **多种模板模式：** Thymeleaf支持HTML、XML、文本等多种模板模式，适用于不同的应用场景。

- **模板片段：** 支持模板片段的定义和引用，提高了模板的可维护性和复用性。

### 4. **使用场景**

Thymeleaf通常用于构建动态的Web应用程序，特别是在使用Spring框架的Java Web应用程序中。它的自然语法和易读性使得前端开发人员和后端开发人员都能够方便地协同工作。常见的使用场景包括：

- **动态网页：** 通过Thymeleaf可以在服务器端动态生成HTML，根据模型中的数据实时渲染页面。

- **表单处理：** Thymeleaf简化了表单处理，可以方便地与Spring MVC集成，处理用户输入和展示验证错误。

- **邮件模板：** 可以用于生成动态的邮件内容，支持在邮件中嵌入动态数据。

- **报告生成：** 适用于生成包含动态数据的报告，例如PDF报告。

### 5. **学习资源**

Thymeleaf有丰富的学习资源，包括官方文档、示例应用程序和社区支持。以下是一些学习资源：

- [Thymeleaf 官方文档](https://www.thymeleaf.org/documentation.html)
- [Thymeleaf GitHub 仓库](https://github.com/thymeleaf/thymeleaf)
- [Thymeleaf 在 Spring 中的集成](https://www.baeldung.com/thymeleaf-in-spring-mvc)
- [Thymeleaf 教程 - Tutorialspoint](https://www.tutorialspoint.com/thymeleaf/index.htm)

Thymeleaf 是一个强大而灵活的模板引擎，适用于构建现代的Java Web应用程序。

通过其清晰的语法和与Spring的紧密集成，它为开发人员提供了一种方便的方式来创建动态且可维护的用户界面。

## 给出 java 使用 Thymeleaf 的入门例子

以下是一个简单的Java示例，演示如何在Spring Boot应用程序中使用Thymeleaf模板引擎。在这个例子中，我们将创建一个简单的Spring Boot应用程序，展示一个包含动态数据的HTML页面。

1. **创建Spring Boot项目**

首先，创建一个新的Spring Boot项目。你可以使用Spring Initializr（[https://start.spring.io/](https://start.spring.io/)）进行快速初始化。确保选择Thymeleaf作为模板引擎。

2. **添加依赖**

在`pom.xml`文件中，确保添加Thymeleaf的依赖：

```xml
<!-- pom.xml -->

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

3. **创建Controller**

创建一个简单的控制器类，用于处理HTTP请求并返回Thymeleaf模板：

```java
// HelloController.java

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HelloController {

    @GetMapping("/hello")
    public String hello(Model model) {
        // 添加动态数据到模型
        model.addAttribute("message", "Hello, Thymeleaf!");

        // 返回Thymeleaf模板名称（视图名称）
        return "hello";
    }
}
```

4. **创建 Thymeleaf 模板**

在`src/main/resources/templates`目录下创建一个名为`hello.html`的Thymeleaf模板文件：

```html
<!-- hello.html -->

<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Hello Thymeleaf</title>
</head>
<body>
    <h1 th:text="${message}"></h1>
</body>
</html>
```

在上述模板中，`${message}`是一个Thymeleaf表达式，用于输出控制器中添加到模型的动态数据。

5. **运行应用程序**

现在，你可以运行Spring Boot应用程序。

访问[http://localhost:8080/hello](http://localhost:8080/hello)将显示包含动态数据的页面。

这是一个简单的入门例子，演示了如何在Java中使用Thymeleaf模板引擎。

你可以根据实际需求扩展和修改这个例子，以适应更复杂的应用程序场景。

## Thymeleaf 有哪些核心概念？

Thymeleaf是一个用于处理Web和独立环境的现代服务器端Java模板引擎。

它有一些核心概念，理解这些概念有助于有效使用Thymeleaf：

1. **表达式（Expression）：**
   Thymeleaf使用表达式来处理动态内容。在Thymeleaf中，表达式用`#{...}`表示。例如，`${message}`是一个表达式，用于在模板中输出动态数据。

2. **模型（Model）：**
   模型是在处理请求时，控制器向视图传递的数据。在Thymeleaf中，通过在模型中添加属性，可以在模板中引用这些属性。例如，`model.addAttribute("message", "Hello, Thymeleaf!");`将"Hello, Thymeleaf!"添加到模型中。

3. **模板（Template）：**
   Thymeleaf模板是包含静态和动态内容的HTML文件。模板中的动态内容通过表达式表示，并在运行时由Thymeleaf引擎处理。Thymeleaf使用HTML标记来呈现模板。

4. **标准方言（Standard Dialect）：**
   Thymeleaf使用标准方言来定义和处理表达式、属性和指令。标准方言提供了一组预定义的属性和指令，使得在模板中使用Thymeleaf更加方便。例如，`th:text`是一个标准方言属性，用于设置元素的文本内容。

5. **处理器（Processor）：**
   处理器是Thymeleaf引擎的组成部分，用于解析和处理模板。处理器负责执行标准方言中定义的指令和属性，以及执行用户自定义的方言。Thymeleaf提供了一组默认的处理器，同时也支持自定义处理器。

6. **方言（Dialect）：**
   方言是Thymeleaf的扩展机制，允许开发人员定义自己的语法规则和处理逻辑。
   
   Thymeleaf 支持多个方言，包括标准方言、Spring Security方言等。通过使用方言，可以更灵活地扩展和定制Thymeleaf的功能。

这些核心概念构成了Thymeleaf的基本框架，开发人员通过理解和使用这些概念，可以更好地利用Thymeleaf进行动态Web内容的开发。

## 给出 Thymeleaf 深入学习的资料，包含网址

以下是Thymeleaf深入学习的一些资源，包含官方文档、教程和其他有用的参考资料：

1. **官方文档：**
   - [Thymeleaf 官方文档](https://www.thymeleaf.org/documentation.html): Thymeleaf的官方文档包含了详细的介绍、用法示例以及各种特性的解释。

2. **官方社区：**
   - [Thymeleaf Google Group](https://groups.google.com/g/thymeleaf): Thymeleaf的官方Google Group，可以在这里找到许多有关Thymeleaf的讨论和问题解答。

3. **教程和示例：**
   - [Thymeleaf Tutorials](https://www.thymeleaf.org/doc/tutorials.html): 官方提供的一系列教程，从基础到高级，逐步介绍Thymeleaf的各个方面。
   - [Thymeleaf + Spring MVC 示例](https://www.thymeleaf.org/doc/tutorials/3.0/thymeleafspring.html): 官方提供的Thymeleaf与Spring MVC集成的示例教程。

4. **Spring Framework 官方文档：**
   - [Spring Framework Reference Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#view-thymeleaf): Spring Framework官方文档中有关于Thymeleaf整合的详细说明，以及Spring MVC中使用Thymeleaf的示例。

5. **博客和文章：**
   - [Thymeleaf by Example](https://www.baeldung.com/thymeleaf): Baeldung上的一篇关于Thymeleaf的示例教程，提供了一些常见用法的详细解释。
   - [Thymeleaf: A Modern Server-Side Java Template Engine](https://www.infoq.com/articles/thymeleaf-introduction/): InfoQ上的一篇介绍Thymeleaf的文章，对其特性和使用进行了深入讲解。

6. **GitHub 仓库：**
   - [Thymeleaf GitHub Repository](https://github.com/thymeleaf/thymeleaf): Thymeleaf的官方GitHub仓库，包含源代码、问题追踪和一些示例。

7. **视频教程：**
   - [Thymeleaf - Introduction and Getting Started](https://www.youtube.com/watch?v=hqf03XULjho): YouTube上的一段关于Thymeleaf介绍和入门的视频。

请注意，Thymeleaf是一个不断发展的工具，因此最新版本的官方文档通常是学习的最佳资源。

在学习过程中，可以结合官方文档和示例进行实践，以更好地理解Thymeleaf的使用方式。

# 参考资料

https://www.thymeleaf.org/doc/tutorials/3.1/usingthymeleaf.html

* any list
{:toc}