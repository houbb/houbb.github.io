---
layout: post
title:  Spring Boot-07-thymeleaf 模板引擎整合使用
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

#  入门

## 是什么

简单说， Thymeleaf 是一个跟 Velocity、FreeMarker 类似的模板引擎，它可以完全替代 JSP 。

Thymeleaf是一个Java库。它是一个XML / XHTML / HTML5模板引擎，能够对模板文件应用一组转换，以显示应用程序生成的数据和/或文本。

它更适合在Web应用程序中提供XHTML / HTML5服务，但是它可以处理任何XML文件，无论是在Web中还是在独立应用程序中。

Thymeleaf的主要目标是提供一种优雅且格式正确的模板创建方法。为了实现这一点，它基于XML标签和属性，这些属性定义了DOM（文档对象模型）上预定义逻辑的执行，而不是将该逻辑作为模板中的代码显式编写。

它的体系结构允许依靠已解析文件的智能缓存来快速处理模板，以便在执行过程中使用尽可能少的I / O操作。

最后但并非最不重要的一点是，Thymeleaf从一开始就设计了XML和Web标准，允许您在需要时创建完全验证的模板。

## 特性

1. Thymeleaf 在有网络和无网络的环境下皆可运行，即它可以让美工在浏览器查看页面的静态效果，也可以让程序员在服务器查看带数据的动态页面效果。这是由于它支持 html 原型，然后在 html 标签里增加额外的属性来达到模板+数据的展示方式。浏览器解释 html 时会忽略未定义的标签属性，所以 thymeleaf 的模板可以静态地运行；当有数据返回到页面时，Thymeleaf 标签会动态地替换掉静态内容，使页面动态显示。

2. Thymeleaf 开箱即用的特性。它提供标准和spring标准两种方言，可以直接套用模板实现JSTL、 OGNL表达式效果，避免每天套模板、该jstl、改标签的困扰。同时开发人员也可以扩展和创建自定义的方言。

3. Thymeleaf 提供spring标准方言和一个与 SpringMVC 完美集成的可选模块，可以快速的实现表单绑定、属性编辑器、国际化等功能。

# springboot 静态资源的访问

## 静态资源访问

在我们开发Web应用的时候，需要引用大量的js、css、图片等静态资源。

## 默认配置
Spring Boot默认提供静态资源目录位置需置于classpath下，目录名需符合如下规则：

```
/static
/public
/resources
/META-INF/resources
```

举例：我们可以在src/main/resources/目录下创建static，在该位置放置一个图片文件。

启动程序后，尝试访问http://localhost:8080/D.jpg。如能显示图片，配置成功。

## 模板引擎

Spring Boot提供了默认配置的模板引擎主要有以下几种：

- Thymeleaf

- FreeMarker

- Velocity

- Groovy

- Mustache

Spring Boot建议使用这些模板引擎，避免使用JSP，若一定要使用JSP将无法实现Spring Boot的多种特性，具体可见后文：支持JSP的配置

当你使用上述模板引擎中的任何一个，它们默认的模板配置路径为：`src/main/resources/templates`。

当然也可以修改这个路径，具体如何修改，可在后续各模板引擎的配置属性中查询并修改。


# springboot 整合

## 整体目录

```
├─java
│  └─com
│      └─github
│          └─houbb
│              └─springboot
│                  └─learn
│                      └─thymeleaf
│                          │  LeafApplication.java
│                          │
│                          └─controller
│                                  HelloController.java
│
└─resources
    │  application.properties
    │
    └─templates
            hello.html
```

## maven 引入

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>1.8</java.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

## 控制层

简单的一个控制器

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HelloController {

    @GetMapping(value = "/hello")
    public String hello(Model model) {
        String name = "爱开源的小叶同学";
        model.addAttribute("name", name);
        return "hello";
    }

}
```

## 配置文件

- application.properties

```
# thymeleaf
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.check-template-location=true
spring.thymeleaf.suffix=.html
spring.thymeleaf.content-type=text/html
spring.thymeleaf.mode=HTML
spring.thymeleaf.cache=false
```

### 不严格的 HTML 格式

实际项目中可能会有不太严格的HTML格式，此时设置mode=HTML5将会对非严格的报错，可以参考以下配置：

```
spring.thymeleaf.mode=LEGACYHTML5
```

如果你这样设置，需要额外的依赖库

需要注意的是，LEGACYHTML5需要搭配一个额外的库NekoHTML才可用。

```xml
<dependency>  
       <groupId>net.sourceforge.nekohtml</groupId>  
       <artifactId>nekohtml</artifactId>  
       <version>1.9.22</version>  
</dependency>  
```

最后重启项目就可以感受到不那么严格的thymeleaf了。

对应的配置也需要调整：

```yml
# 一项是非严格的HTML检查，一项是禁用缓存来获取实时页面数据，其他采用默认项即可
  thymeleaf:
    mode: LEGACYHTML5
    cache: false
```

## html 编写

```html
<!DOCTYPE HTML>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>hello</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
</head>
<body>
<!--/*@thymesVar id="name" type="java.lang.String"*/-->
<p th:text="'Hello！, ' + ${name} + '!'">3333</p>
</body>
</html>
```

## 访问

直接页面发访问 [http://localhost:8080/hello](http://localhost:8080/hello)

返回如下：

```
Hello！, 爱开源的小叶同学!
```

# 遇到的报错

## HTML 已配置

```
org.thymeleaf.exceptions.TemplateInputException: Template mode \\\"HTML\\\" has not been configured
```

- 解决方式

```
mode: HTML
```

我直接把这个 mode 注释掉了。

## meta 报错

```
org.xml.sax.SAXParseException: 元素类型 "meta" 必须由匹配的结束标记 "" 终止。
```

这个就是原来的 html 写的不够规范：

```html
<meta charset="utf-8">
```

我加了一个结尾：

```html
<meta charset="utf-8"/>
```

## 彻底解决

springboot 使用thymeleaf 模板引擎时报错org.xml.sax.SAXParseException: 元素类型 “link” 必须由匹配的结束标记 “” 终止，org.xml.sax.SAXParseException: 元素类型 “meta” 必须由匹配的结束标记 “” 终止，出现这类问题的时候，解决方法如下

在pom.xml中添加

```xml
<properties>
    <java.version>1.8</java.version>
    <thymeleaf.version>3.0.2.RELEASE</thymeleaf.version>
    <thymeleaf-layout-dialect.version>2.0.5</thymeleaf-layout-dialect.version>
</properties>

<!--启用不严格检查html-->
<dependency>
    <groupId>net.sourceforge.nekohtml</groupId>
    <artifactId>nekohtml</artifactId>
    <version>1.9.22</version>
</dependency>
```


在properties.yml添加如下内容

```yml
thymeleaf:
  cache: false
  mode: LEGACYHTML5
  content-type: text/html
  encoding: UTF-8
```

# layout 引入其他页面

## 背景

html 中编写一般都有很多重复的内容。

比如 header、footer 等相同的内容，最简单的方式是使用 layout 或者直接 include 对应的页面。

这样做可以避免内容的重复编写，也便于后期统一维护修改。

## 方案1：fragement 

将页面里的每个部分都分成块 -> fragment 使用 `th:include` 和 `th:replace` 来引入页面

这种用法没有layout的概念, 因为每个部分都是 fragment, 下面例子说明

```html
<!-- index.html -->
<html>
<head>
    <meta charset="utf-8"/>
    <title>demo</title>
</head>
<body>
    <div th:include="components/header :: header"></div>
    <div class="container">
        <h1>hello world</h1>
    </div>
    <div th:include="components/footer :: footer"></div>
</body>
</html>

<!-- components/header.html -->
<header th:fragment="header">
<ul>
    <li>news</li>
    <li>blog</li>
    <li>post</li>
</ul>
</header>
<!-- components/footer.html -->
<header th:fragment="footer">
<div>i am footer.</div>
</header>
```

上面例子里用到的是th:include, 也就是把定义好的fragment引入的意思, 还有一个是th:replace, 意思是替换

## layout 布局

### maven 依赖

```xml
<dependency>
  <groupId>nz.net.ultraq.thymeleaf</groupId>
  <artifactId>thymeleaf-layout-dialect</artifactId>
  <version>2.3.0</version>
</dependency>
```

### 编写布局代码

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/web/thymeleaf/layout">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>layout布局方案</title>
    <style>
        * {font-family: Microsoft YaHei, Tahoma, Helvetica, Arial, sans-serif;}
        .header {background-color: #f5f5f5;padding: 20px;}
        .header a {padding: 0 20px;}
        .container {padding: 20px;margin:20px auto;}
        .footer {height: 40px;background-color: #f5f5f5;border-top: 1px solid #ddd;padding: 20px;}
    </style>
 
</head>
<body>
    <header class="header">
        <div>
            采用layout方式进行布局
        </div>
    </header>
    <div  class="container" layout:fragment="content"></div>
    <footer class="footer">
        <div>
            <p style="float: left">&copy; Hylun 2017</p>
            <p style="float: right">
                Powered by <a href="http://my.oschina.net/alun" target="_blank">Alun</a>
            </p>
        </div>
    </footer>
 
</body>
</html>
```

关键点：

```
xmlns:layout="http://www.ultraq.net.nz/web/thymeleaf/layout"： 引入layout标签
<div  class="container" layout:fragment="content">页面正文内容</div>  设置页面正文内容所在位置
```


### 编写内容页面

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/web/thymeleaf/layout"
      layout:decorator="demo/layout2">
    <div layout:fragment="content">
        正文内容222222222222
    </div>
</html>
```

关键点：

```
layout:decorator="demo/layout2"  ：此位置指向layout2.html页面位置
layout:fragment="content"  ：指定页面正文内容 content要与layout2.html页面中定义的名字一致
```

# 拓展阅读

[springboot 整合 jsp](https://houbb.github.io/2020/08/09/jsp-learn-01-springboot)

# 参考资料

[what-is-thymeleaf](https://www.thymeleaf.org/doc/tutorials/2.1/usingthymeleaf.html#what-is-thymeleaf)

[Thymeleaf入门（一）——入门与基本概述](Thymeleaf入门（一）——入门与基本概述)

[springboot中thymeleaf严格检查问题](https://blog.csdn.net/qq_29663299/article/details/89362283)

[thymeleaf的layout常用的有两种方式用法](https://www.cnblogs.com/goingforward/p/7215314.html)

* any list
{:toc}
