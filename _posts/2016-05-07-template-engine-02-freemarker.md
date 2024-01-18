---
layout: post
title: Template Engine-02-模板引擎 Freemarker
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

以下是对给出的英文技术文档的中文翻译：

# FreeMarker

[Apache FreeMarker](http://freemarker.org/) 是一个模板引擎：一个基于模板和变化数据生成文本输出（HTML 网页、电子邮件、配置文件、源代码等）的 Java 库。

> [freemarker zh_CN](http://swiftlet.net/archives/category/freemarker)

# 入门指南

<label class="label label-info">模板</label> + <label class="label label-primary">数据模型</label> = <label class="label label-success">输出</label>

> 模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta http-equiv="x-ua-compatible" content="IE=edge">
    <meta name="renderer" content="webkit">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
</head>
<body>

<h1>Welcome ${user}!</h1>
<p>Our latest product:
    <a href="${latestProduct.url}">${latestProduct.name}</a>!

</body>
</html>
```

> 数据模型

- 产品类

```java
public class Product {
    private String url;
    private String name;

    public Product(String url, String name) {
        this.url = url;
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

- 创建 HTML 类的代码

```java
public class Demo {
    public static void main(String[] args) throws Exception {
        Template template = FreemarkerHelper.getTemplate("demo.ftl");

        // 构建映射
        Map<String, Object> root = new HashMap<String, Object>();
        root.put("user", "echo");
        Product product = new Product("www.google.com", "greenhouse");
        root.put("latestProduct", product);

        FileHelper.createFile(template, "demo.html", root);
    }
}
```

有一些实用工具类如下。

- 获取保存 FTL 和 HTML 的 web 包路径。

```java
public class PathHelper {
    public static final String LOCAL_WEB_PATH = "/src/main/web/";

    public static String getWebPath() {
        String rootPath = System.getProperty("user.dir");

        return rootPath + LOCAL_WEB_PATH;
    }
}
```

- 获取 FreeMarker 模板

<label class="label label-warning">警告</label>

不要不必要地重新创建 Configuration 实例；这是昂贵的，因为你会失去模板缓存。Configuration 实例意味着是应用级别的 **单例**。

```java
public class FreemarkerHelper {
    private FreemarkerHelper() {}
    private static Configuration configuration = null;

    /**
     * 定义 Configuration
     * @return
     * @throws Exception
     */
    public static Configuration getConfiguration() throws Exception {
        if(configuration == null) {
            configuration = new Configuration();
            configuration.setDirectoryForTemplateLoading(new File(PathHelper.getWebPath()));    // 路径
            configuration.setObjectWrapper(new DefaultObjectWrapper());
        }

        return configuration;
    }

    /**
     * 根据 FTL 名称在 web 下获取模板
     * @param ftlName
     * @return
     * @throws Exception
     */
    public static Template getTemplate(String ftlName) throws Exception {
        Configuration configuration1 = getConfiguration();
        Template template = configuration1.getTemplate(ftlName, "UTF-8");       // 默认字符集 UTF-8

        return template;
    }
}
```

- 创建文件

```java
public class FileHelper {
    /**
     * 通过模板、HTML 名称和模型映射创建 HTML；
     * @param template
     * @param htmlName
     * @param map
     * @throws Exception
     */
    public static void createFile(Template template, String htmlName, Map<String, Object> map) throws Exception {
        File file = new File(PathHelper.getWebPath() + htmlName);
        if (!file.exists()) {
            file.createNewFile();
        }
        Writer out = new BufferedWriter(new FileWriter(file));
        template.process(map, out);
        out.flush();
    }
}
```

> 输出

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta http-equiv="x-ua-compatible" content="IE=edge">
    <meta name="renderer" content="webkit">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
</head>

<body>

<h1>Welcome echo!</h1>
<p>Our latest product:
    <a href="www.google.com">greenhouse</a>!

</body>

</html>
```

# 基础指令

> if

使用 if 指令可以有条件地跳过模板的某个部分。

- 我们将 ftl 更改为如下内容

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <h1>Welcome ${user}!</h1>

    <#-- 这里是 if 指令演示 -->
    <#if user == "echo">
        echo
    <#elseif user != "hello">
        not hello
    <#else>
        sb. we do not know.
    </#if>

</body>

</html>
```

- 输出

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <h1>Welcome echo!</h1>

        echo

</body>

</html>
```

> list

list 指令的通用形式是：
```
 <#list sequence as loopVariable>repeatThis</#list>.
```
repeatThis 部分将对您已使用 sequence 指定的每个项目进行重复，从第一个项目开始，一个接一个地。

- 将 Demo.java 更改为如下内容

```java
public class Demo {
    public static void main(String[] args) throws Exception {
        Template template = FreemarkerHelper.getTemplate("demo.ftl");

        //map build
        Map<String, Object> map = new HashMap<String, Object>();
        List<Product> productList = new LinkedList<Product>();

        Product product = new Product("www.google.com

", "greenhouse");
        Product product2 = new Product("www.baidu.com", "bluesky");
        productList.add(product);
        productList.add(product2);
        map.put("productList", productList);

        FileHelper.createFile(template, "demo.html", map);
    }
}
```

- ftl 更改为如下内容

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <#-- 这里是 list 指令演示 -->
    <#list productList as product>
     <a href="${product.url}">${product.name}</a>
    </#list>

</body>

</html>
```

- 输出

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

     <a href="www.google.com">greenhouse</a>
     <a href="www.baidu.com">bluesky</a>

</body>

</html>
```

> include

使用 include 指令，可以将另一个文件的内容插入到模板中。

- +添加文件 copyright_footer.ftl

```html
<i>
    版权所有 (c) 2016 <a href="houbb.github.io">Echo</a>，
    <br>
    保留所有权利。
</i>
```

- 将 ftl 更改为如下内容

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <#-- 这里是 include 指令演示 -->
    <#include "copyright_footer.ftl">

</body>

</html>
```

- 输出

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

<i>
    版权所有 (c) 2016 <a href="houbb.github.io">Echo</a>，
    <br>
    保留所有权利。
</i>
</body>

</html>
```

# 使用内建方法

> [内建方法](http://freemarker.org/docs/ref_builtins.html)

# 丢失的变量

<label class="label label-warning">MISS</label>

FreeMarker 中不存在的变量和值为 null 的变量是相同的，因此此处使用的 "missing" 术语涵盖了两种情况。

- 如果缺失会发生什么？

```java
public class Demo {
    public static void main(String[] args) throws Exception {
        Template template = FreemarkerHelper.getTemplate("demo.ftl");

        //map build
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("user", "this is a long name...");

        FileHelper.createFile(template, "demo.html", map);
    }
}
```

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <#-- 这里是 missing 演示 -->
    ${missing}

</body>

</html>
```

结果

```
freemarker.core.InvalidReferenceException: Expression missing is undefined on line 10, column 7 in demo.ftl.
...
```

- 如何解决这个问题？

将 ftl 更改为如下内容

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <#-- 这里是 missing 演示 -->
    ${missing!'默认值'}

    <#if missing??>
        ${missing}
    <#else>
        缺失
    </#if>

</body>

</html>
```

输出

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

        默认值

        缺失

</body>

</html>
```

-----------------------------------------
-----------------------------------------

# Freemarker

[Apache FreeMarker](http://freemarker.org/) is a template engine: a Java library to generate text output
(HTML web pages, e-mails, configuration files, source code, etc.) based on templates and changing data.

> [freemarker zh_CN](http://swiftlet.net/archives/category/freemarker)

# Getting Started

<label class="label label-info">Template</label> + <label class="label label-primary">data-model</label> = <label class="label label-success">output</label>

> Template

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta http-equiv="x-ua-compatible" content="IE=edge">
    <meta name="renderer" content="webkit">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
</head>
<body>

<h1>Welcome ${user}!</h1>
<p>Our latest product:
    <a href="${latestProduct.url}">${latestProduct.name}</a>!

</body>
</html>
```

> data model

- product class

```java
public class Product {
    private String url;
    private String name;

    public Product(String url, String name) {
        this.url = url;
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

- create html class code

```java
public class Demo {
    public static void main(String[] args) throws Exception {
        Template template = FreemarkerHelper.getTemplate("demo.ftl");

        //map build
        Map<String, Object> root = new HashMap<String, Object>();
        map.put("user", "echo");
        Product product = new Product("www.google.com", "greenhouse");
        map.put("latestProduct", product);

        FileHelper.createFile(template, "demo.html", root);
    }
}
```

There are some utility class as following.

- get path of package web which save ftl and html.

```java
public class PathHelper {
    public static final String LOCAL_WEB_PATH = "/src/main/web/";

    public static String getWebPath() {
        String rootPath = System.getProperty("user.dir");

        return rootPath + LOCAL_WEB_PATH;
    }
}
```

- get freemarker template

<label class="label label-warning">WARN</label>

Do not needlessly re-create Configuration instances; it's expensive, among others because you lose the template cache.
Configuration instances meant to be application-level **singletons**.

```java
public class FreemarkerHelper {
    private FreemarkerHelper() {}
    private static Configuration configuration = null;

    /**
     * define Configuration
     * @return
     * @throws Exception
     */
    public static Configuration getConfiguration() throws Exception {
        if(configuration == null) {
            configuration = new Configuration();
            configuration.setDirectoryForTemplateLoading(new File(PathHelper.getWebPath()));    //path
            configuration.setObjectWrapper(new DefaultObjectWrapper());
        }

        return configuration;
    }

    /**
     * Get template by ftl name under web;
     * @param ftlName
     * @return
     * @throws Exception
     */
    public static Template getTemplate(String ftlName) throws Exception {
        Configuration configuration1 = getConfiguration();
        Template template = configuration1.getTemplate(ftlName, "UTF-8");       //default charset UTF-8

        return template;
    }
}
```

- create file

```java
public class FileHelper {
    /**
     * create html by template, htmlName, and modal map;
     * @param template
     * @param htmlName
     * @param map
     * @throws Exception
     */
    public static void createFile(Template template, String htmlName, Map<String, Object> map) throws Exception {
        File file = new File(PathHelper.getWebPath()+htmlName);
        if (!file.exists()) {
            file.createNewFile();
        }
        Writer out = new BufferedWriter(new FileWriter(file));
        template.process(map, out);
        out.flush();
    }
}
```

> output

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta http-equiv="x-ua-compatible" content="IE=edge">
    <meta name="renderer" content="webkit">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
</head>

<body>

<h1>Welcome echo!</h1>
<p>Our latest product:
    <a href="www.google.com">greenhouse</a>!

</body>

</html>
```

# Base directives

> if

With the if directive you can conditionally skip a section of the template.

- we change the ftl like this

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <h1>Welcome ${user}!</h1>

    <#-- Here is the if directive demo -->
    <#if user == "echo">
        echo
    <#elseif user != "hello">
        not hello
    <#else>
        sb. we do not know.
    </#if>

</body>

</html>
```

- output

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <h1>Welcome echo!</h1>

        echo

</body>

</html>
```

> list

The generic form of the list directive is:
```
 <#list sequence as loopVariable>repeatThis</#list>.
```
The repeatThis part will be repeated for each item in the sequence that you have specified with sequence, one after the other,
starting from the first item.

- change the Demo.java like this

```java
public class Demo {
    public static void main(String[] args) throws Exception {
        Template template = FreemarkerHelper.getTemplate("demo.ftl");

        //map build
        Map<String, Object> map = new HashMap<String, Object>();
        List<Product> productList = new LinkedList<Product>();

        Product product = new Product("www.google.com", "greenhouse");
        Product product2 = new Product("www.baidu.com", "bluesky");
        productList.add(product);
        productList.add(product2);
        map.put("productList", productList);

        FileHelper.createFile(template, "demo.html", map);
    }
}
```

- ftl like this

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <#-- Here is the list directive demo -->
    <#list productList as product>
     <a href="${product.url}">${product.name}</a>
    </#list>

</body>

</html>
```

- output

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

     <a href="www.google.com">greenhouse</a>
     <a href="www.baidu.com">bluesky</a>

</body>

</html>
```

> include

With the include directive you can insert the content of another file into the template.

- +add file copyright_footer.ftl

```html
<i>
    Copyright (c) 2016 <a href="houbb.github.io">Echo</a>,
    <br>
    All Rights Reserved.
</i>
```

- change ftl like this

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <#-- Here is the include directive demo -->
    <#include "copyright_footer.ftl">

</body>

</html>
```

- output

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

<i>
    Copyright (c) 2016 <a href="houbb.github.io">Echo</a>,
    <br>
    All Rights Reserved.
</i>
</body>

</html>
```

# Using built-ins

> [builtins](http://freemarker.org/docs/ref_builtins.html)

# Missing variables

<label class="label label-warning">MISS</label>

A non-existent variable and a variable with null value is the same for FreeMarker, so the "missing" term used here covers both cases.

- what will happen if missing ?

```java
public class Demo {
    public static void main(String[] args) throws Exception {
        Template template = FreemarkerHelper.getTemplate("demo.ftl");

        //map build
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("user", "this is a long name...");

        FileHelper.createFile(template, "demo.html", map);
    }
}
```

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <#-- Here is the missing demo -->
    ${missing}

</body>

</html>
```

result

```
freemarker.core.InvalidReferenceException: Expression missing is undefined on line 10, column 7 in demo.ftl.
...
```

- how to solve this problem?

change the ftl like this

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

    <#-- Here is the missing demo -->
    ${missing!'default value'}

    <#if missing??>
        ${missing}
    <#else>
        missing
    </#if>

</body>

</html>
```

output

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>Title</title>
</head>

<body>

        default value

        missing

</body>

</html>
```

# 处理纯字符串

有时候我们希望将一穿带有 `${}` 的字符串替代掉。

怎么办呢？

## 测试代码

```java
public static void main(String[] args) throws IOException, TemplateException {
    Configuration configuration = Configuration.getDefaultConfiguration();
    Template template = new Template("template", "hello ${keyword}", configuration);
    StringWriter stringwriter = new StringWriter();
    Map<String, String> map = new HashMap<>();
    map.put("keyword", "word");
    template.process(map, stringwriter);
    System.out.println(stringwriter.toString());
}
```

这个结果就是：

```
hello world
```

# chat

## 详细介绍一下 freemarker

FreeMarker（也称为 Apache FreeMarker）是一个用于生成文本输出（例如HTML网页）的模板引擎。

它是一个开源项目，属于 Apache 软件基金会的项目。

FreeMarker 提供了强大的模板语法和丰富的特性，被广泛用于 Java 等平台的应用程序中。

以下是 FreeMarker 的一些关键特点和功能：

1. **模板语法：**
   - FreeMarker 使用 FreeMarker Template Language（FTL）作为模板语法。该语法具有清晰、简洁且灵活的特性，支持变量、条件语句、循环、宏等，使得模板编写变得直观和易读。

2. **强大的数据模型：**
   - FreeMarker 支持丰富的数据模型，包括原始类型、集合、映射、JavaBean 等。模板中可以轻松访问和操作这些数据。

3. **模板继承：**
   - FreeMarker 支持模板继承和模板包含。可以定义一个基础模板，并在子模板中扩展或覆盖相应的部分。这提高了模板的可维护性和复用性。

4. **内建指令和函数：**
   - FreeMarker 提供了丰富的内建指令和函数，用于处理模板中的逻辑、数据操作和格式化。例如，内建指令包括 `if`、`else`、`list`、`include` 等。

5. **强大的表达式语言：**
   - FreeMarker 的表达式语言支持复杂的表达式和运算符，以及对字符串、数字、日期等类型的操作。这使得模板中的数据处理更加灵活。

6. **模板缓存：**
   - FreeMarker 支持模板的缓存，可以在运行时动态加载和编译模板，并将其缓存，以提高性能。缓存机制可以根据需要进行配置，以适应具体的应用场景。

7. **广泛的应用：**
   - FreeMarker 不仅可以用于生成 HTML 页面，还可以用于生成其他文本格式，如XML、JSON、Markdown等。它广泛应用于 Java Web 框架中，如Spring MVC、Apache Struts 等。

8. **文档和社区支持：**
   - FreeMarker 提供了详细的文档和示例，帮助用户快速上手。它有一个活跃的社区，用户可以在社区中寻求支持和交流经验。

以下是一个简单的 FreeMarker 模板示例：

```html
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
</head>
<body>
    <h1>Welcome, ${user.name}!</h1>
    <ul>
        <#list user.roles as role>
            <li>${role}</li>
        </#list>
    </ul>
</body>
</html>
```

在这个示例中，`${...}` 用于插入变量，`<#...>` 用于控制结构，例如 `list` 用于循环遍历集合。

这是一个简单的展示 FreeMarker 模板语法的例子。

## java 使用 freemarker 渲染的入门例子

在 Java 中使用 FreeMarker 渲染模板需要进行一些步骤。以下是一个简单的入门例子，演示如何在 Java 程序中使用 FreeMarker 渲染模板。

首先，确保您已经添加了 FreeMarker 的相关依赖。如果使用 Maven，可以在 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>org.freemarker</groupId>
    <artifactId>freemarker</artifactId>
    <version>2.3.31</version> <!-- 使用最新版本 -->
</dependency>
```

然后，可以使用以下示例代码来进行 FreeMarker 模板渲染：

```java
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

public class FreeMarkerExample {

    public static void main(String[] args) {
        // 初始化 FreeMarker 配置
        Configuration cfg = new Configuration(Configuration.VERSION_2_3_31);
        cfg.setClassForTemplateLoading(FreeMarkerExample.class, "/templates");

        try {
            // 获取模板
            Template template = cfg.getTemplate("hello.ftl");

            // 创建数据模型
            Map<String, Object> data = new HashMap<>();
            data.put("title", "FreeMarker Example");
            data.put("user", getUserData());

            // 渲染模板
            StringWriter stringWriter = new StringWriter();
            template.process(data, new OutputStreamWriter(System.out));

            // 输出渲染结果
            System.out.println(stringWriter.toString());
        } catch (IOException | TemplateException e) {
            e.printStackTrace();
        }
    }

    private static Map<String, Object> getUserData() {
        Map<String, Object> user = new HashMap<>();
        user.put("name", "John Doe");
        user.put("roles", new String[]{"Admin", "User"});
        return user;
    }
}
```

在上述示例中：

1. 创建 `Configuration` 对象，设置 FreeMarker 的版本和模板加载路径。
2. 获取模板对象，这里假设模板文件位于 `/templates/hello.ftl`。
3. 创建数据模型，这里创建了一个包含 `title` 和 `user` 的简单 Map。
4. 调用 `template.process(data, writer)` 方法渲染模板，将数据模型应用到模板中。
5. 输出渲染结果。

请注意，`hello.ftl` 模板文件需要根据实际需求创建。以下是一个简单的示例：

```html
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
</head>
<body>
    <h1>Welcome, ${user.name}!</h1>
    <ul>
        <#list user.roles as role>
            <li>${role}</li>
        </#list>
    </ul>
</body>
</html>
```

在这个例子中，`${...}` 用于插入变量，`<#...>` 用于控制结构，例如 `list` 用于循环遍历集合。

根据实际需求，可以创建更复杂的模板文件。

* any list
{:toc}