---
layout: post
title:  Template Engine-04-模板引擎 Velocity
date:  2016-5-7 17:21:21 +0800
categories: [Template]
tags: [template]
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

# Velocity

[Velocity](https://velocity.apache.org/engine/2.0/user-guide.html#what-is-velocity) 是基于java的模板引擎。
它允许web页面设计人员引用Java代码中定义的方法。
Web设计人员可以与Java程序员并行开发基于模型-视图-控制器(MVC)模型的Web站点，这意味着Web页面设计人员可以只专注于创建一个设计良好的站点，
而程序员可以只专注于编写顶级代码。

Velocity将Java代码从web页面中分离出来，使web站点在长期运行中更易于维护，并提供了Java服务器页面(jsp)或PHP的可行替代方案。

Velocity可以用于从模板生成web页面、SQL、PostScript和其他输出。
它既可以作为生成源代码和报告的独立实用程序使用，也可以作为其他系统的集成组件使用。
完成后，Velocity将为涡轮机web应用程序框架提供模板服务。Velocity+涡轮机将提供一个模板服务，允许根据真正的MVC模型开发web应用程序。

# 入门例子

## maven

```xml
<dependency>
    <groupId>org.apache.velocity</groupId>
    <artifactId>velocity-engine-core</artifactId>
    <version>2.3</version>
</dependency>
```

## 模板文件

- template.vm

```vm
Hello, $name! Welcome to Velocity template example.
```

## 模板代码

```java
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;

import java.io.StringWriter;
import java.util.Properties;

public class VelocityExample {
    public static void main(String[] args) {
        // 初始化Velocity引擎
        Properties props = new Properties();
        props.setProperty("resource.loader", "file");
        props.setProperty("file.resource.loader.class", "org.apache.velocity.runtime.resource.loader.FileResourceLoader");
        props.setProperty("file.resource.loader.path", "src/main/resources/templates");

        VelocityEngine velocityEngine = new VelocityEngine(props);
        velocityEngine.init();

        // 创建Velocity上下文并添加数据
        VelocityContext context = new VelocityContext();
        context.put("name", "World");

        // 加载模板
        String templateName = "template.vm";
        StringWriter writer = new StringWriter();
        velocityEngine.getTemplate(templateName).merge(context, writer);

        // 输出结果
        System.out.println(writer.toString());
    }
}
```

## 整体目录

```
my-project/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── VelocityExample.java
│   │   └── resources/
│   │       └── templates/
│   │           └── template.vm
```

## 测试结果

```
Hello, World! Welcome to Velocity template example.
```

# 文本形式

## 说明

有时候我们希望通过文本，而不是文件的格式来实现。

## maven

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.velocity</groupId>
        <artifactId>velocity-engine-core</artifactId>
        <version>2.3</version>
    </dependency>
</dependencies>
```

## 代码

```java
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.Template;

import java.io.StringWriter;
import java.util.Properties;

public class VelocityExample {
    public static void main(String[] args) {
        // 初始化Velocity引擎
        Properties props = new Properties();
        VelocityEngine velocityEngine = new VelocityEngine();
        velocityEngine.init(props);

        // 创建模板内容字符串
        String templateContent = "Hello, $name! Welcome to Velocity template example.";

        // 创建Velocity上下文并添加数据
        VelocityContext context = new VelocityContext();
        context.put("name", "World");

        // 生成模板
        StringWriter writer = new StringWriter();
        velocityEngine.evaluate(context, writer, "TemplateName", templateContent);

        // 输出结果
        System.out.println(writer.toString());
    }
}
```

在这个示例中，templateContent是一个包含模板内容的字符串。

通过velocityEngine.evaluate()方法将字符串作为模板，并与上下文中的数据合并，然后输出结果。

## 测试效果

```
Hello, World! Welcome to Velocity template example.
```

这种方式更为简洁，不需要单独的模板文件，非常适合简单的模板使用场景。

# chat

## 详细介绍一下 velocity

Velocity 是一个开源的 Java 模板引擎，它旨在简化生成文本输出的过程，常用于生成动态内容的 Web 页面，电子邮件、XML文档等。Velocity 本身是 Apache 软件基金会的项目，被广泛应用于 Java 开发中。

以下是一些 Velocity 的关键特点和功能：

1. **模板语法：**
   - Velocity 使用 Velocity Template Language (VTL) 作为模板语法。VTL 的语法简洁，易于学习和使用。变量、条件语句、循环、宏等基本功能都得到了支持。

2. **数据模型：**
   - Velocity 支持多种数据类型，包括原始数据类型、Java 对象、集合等。通过 Velocity 的上下文（Context），可以将数据模型传递到模板中。

3. **模板继承：**
   - Velocity 支持模板继承，可以通过 `#parse` 或 `#include` 指令引入其他模板。这有助于模板的复用和组织。

4. **条件语句和循环：**
   - Velocity 提供了常见的条件语句和循环结构，如 `#if`, `#else`, `#elseif`, `#foreach`。这使得在模板中能够进行逻辑控制和数据迭代。

5. **内建指令和函数：**
   - Velocity 提供了一些内建指令和函数，用于处理字符串、日期、数学运算等。这些函数可用于模板中的数据操作和格式化。

6. **性能：**
   - 虽然相对于一些其他模板引擎，Velocity 的性能较慢，但对于一般的模板需求，性能通常足够。可以通过一些配置和性能优化手段来提高速度。

7. **易集成：**
   - Velocity 可以轻松集成到 Java 应用中，尤其是在 Web 开发中。与 Servlet、Spring 等框架结合使用时，Velocity 提供了简单而强大的模板支持。

8. **稳定性和可靠性：**
   - Velocity 是一个成熟的项目，具有稳定性和可靠性。它已经在许多大型项目中得到了验证，并且有一个活跃的社区提供支持。

以下是一个简单的 Velocity 模板示例：

```html
<!DOCTYPE html>
<html>
<head>
    <title>$title</title>
</head>
<body>
    <h1>Welcome, $user.name!</h1>
    <ul>
        #foreach ($role in $user.roles)
            <li>$role</li>
        #end
    </ul>
</body>
</html>
```

在这个示例中，`$...` 用于插入变量，`#...` 用于控制结构，例如 `foreach` 用于循环遍历集合。

这是一个简单的展示 Velocity 模板语法的例子。

## 给出 java 使用 velocity 的入门例子

下面是一个简单的 Java 使用 Velocity 的入门例子。在这个例子中，我们将创建一个 Velocity 模板并使用 Java 程序进行渲染。

首先，确保您的项目中包含了 Velocity 的依赖。如果使用 Maven，可以在 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>org.apache.velocity</groupId>
    <artifactId>velocity-engine-core</artifactId>
    <version>2.3</version> <!-- 使用最新版本 -->
</dependency>
```

然后，创建一个 Velocity 模板文件，例如 `hello.vm`：

```html
<!DOCTYPE html>
<html>
<head>
    <title>$title</title>
</head>
<body>
    <h1>Welcome, $user!</h1>
    <ul>
        #foreach ($role in $roles)
            <li>$role</li>
        #end
    </ul>
</body>
</html>
```

接下来，使用以下 Java 代码进行渲染：

```java
import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;

import java.io.StringWriter;

public class VelocityExample {

    public static void main(String[] args) {
        // 初始化 Velocity 引擎
        VelocityEngine velocityEngine = new VelocityEngine();
        velocityEngine.init();

        // 获取模板
        Template template = velocityEngine.getTemplate("hello.vm");

        // 创建 Velocity 上下文
        VelocityContext velocityContext = new VelocityContext();
        velocityContext.put("title", "Velocity Example");
        velocityContext.put("user", "John Doe");
        velocityContext.put("roles", new String[]{"Admin", "User"});

        // 渲染模板
        StringWriter stringWriter = new StringWriter();
        template.merge(velocityContext, stringWriter);

        // 输出渲染结果
        System.out.println(stringWriter.toString());
    }
}
```

在这个例子中：

1. 创建了一个 Velocity 引擎（`VelocityEngine`）并初始化。
2. 获取 `hello.vm` 模板。
3. 创建 Velocity 上下文（`VelocityContext`）并向其中放入变量。
4. 使用 `template.merge()` 方法渲染模板，并将结果输出到 `StringWriter`。
5. 输出渲染结果。

运行这个 Java 程序，将会看到输出的渲染结果。

这只是一个入门级的例子，实际使用中可以根据需要传递更复杂的数据模型，并创建更复杂的模板。

# FreeMarker 和 Velocity对比表格

以下是 FreeMarker 和 Velocity 模板引擎的一些比较，包括语法、特性和使用场景等方面：

| **特性 / 比较项**     | **FreeMarker**                     | **Velocity**                             |
|---------------------|-----------------------------------|-------------------------------------------|
| **语法**               | FreeMarker Template Language (FTL) | Velocity Template Language (VTL)         |
| **数据模型**             | 支持复杂的数据模型，Java对象、集合等 | 适用于简单数据模型，支持Java对象、Map等       |
| **模板继承**             | 支持模板继承和覆盖                       | 支持模板继承，使用 `#extends` 和 `#block` 指令 |
| **条件语句**             | 支持 `#if`, `#else`, `#elseif` 等      | 支持 `#if`, `#else`, `#elseif` 等          |
| **循环语句**             | 支持 `#list`, `#foreach` 等            | 支持 `#foreach`，`#break`, `#continue` 等  |
| **内置指令和函数**         | 提供丰富的内建指令和函数                | 提供一些内建指令和函数                      |
| **性能**               | 通常被认为比 Velocity 稍快            | 通常速度较慢，但在一些场景下性能足够        |
| **社区活跃度**           | 活跃，有不断的更新和改进                 | 较为稳定，社区活跃度相对较低                |
| **集成**               | 与 Spring 等框架集成良好                | 与 Spring 等框架集成，但不如 FreeMarker 成熟  |
| **适用场景**             | 适用于复杂的模板需求，Web和非Web场景    | 适用于简单的模板需求，特别是Web开发          |

需要注意的是，选择 FreeMarker 还是 Velocity 取决于项目需求、团队经验以及个人偏好。

FreeMarker 在一些方面提供了更多的功能和更灵活的语法，适用于需要复杂模板的场景。

Velocity 则更简洁，适用于对功能需求不高、性能要求不严格的场景。

* any list
{:toc}