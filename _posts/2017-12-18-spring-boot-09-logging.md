---
layout: post
title:  Spring Boot-09-logging 日志设置
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

# Spring Boot默认日志系统

Spring Boot默认使用LogBack日志系统，如果不需要更改为其他日志系统如Log4j2等，则无需多余的配置，LogBack默认将日志打印到控制台上。

如果要使用LogBack，原则上是需要添加dependency依赖的


```xml
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-logging</artifactId></pre>
```

但是因为新建的Spring Boot项目一般都会引用spring-boot-starter或者spring-boot-starter-web，而这两个起步依赖中都已经包含了对于spring-boot-starter-logging的依赖，所以，无需额外添加依赖。


# 快速开始

## maven 引入

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

## 代码编写

- Controller

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@RestController
public class IndexController {

    private final Logger logger = LoggerFactory.getLogger(IndexController.class);

    @GetMapping("/index")
    public String index() {
        logger.debug("index called!");
        return "index";
    }

}
```

默认启动， debug 日志是不显示的。

因为 spring-boot 默认日志级别为 info。

- 修改配置 application.properties

我们可以指定固定的包级别：

```
logging.level.com.github.houbb=DEBUG
```

这样就可以输出对应的日志了。


# 常见的配置

## 文件

在本机环境，我们习惯在控制台看日志，但是线上我们还是要通过将日志信息保存到日志文件中，查询日志文件即可。

那么应该如何配置才能将日志信息保存到文件呢？

在我们创建的springboot-demo项目中，resources目录下有个application.properties文件（如果是application.yml文件也是同样的道理，只是采用的不同的编写风格而已）。

添加如下配置

```
logging.path=/Users/jackie/workspace/rome/ 
logging.file=springbootdemo.log
```

- logging.path

该属性用来配置日志文件的路径

- logging.file

该属性用来配置日志文件名，如果该属性不配置，默认文件名为spring.log

## 日志级别

日志级别总共有TRACE < DEBUG < INFO < WARN < ERROR < FATAL ，且级别是逐渐提供，如果日志级别设置为INFO，则意味TRACE和DEBUG级别的日志都看不到。

上例中我们打印了一个INFO级别的日志，因为Spring Boot默认级别就是INFO，如果我们改为WARN，是否还能看到这行日志信息。

logging.level

该属性用于配置日志级别。

在applicaition.properties中添加

```
logging.level.root=warn
```

这里是用的root级别，即项目的所有日志，我们也可以使用package级别，即指定包下使用相应的日志级别。

## 日志格式

如何定制自己的日志格式

在application.properties中添加

```
logging.pattern.console=%d{yyyy/MM/dd-HH:mm:ss} [%thread] %-5level %logger- %msg%n 
logging.pattern.file=%d{yyyy/MM/dd-HH:mm} [%thread] %-5level %logger- %msg%n
```

logging.pattern.console

该属性用于定制日志输出格式。

上述配置的编码中，对应符号的含义如下


```
%d{HH:mm:ss.SSS}——日志输出时间

%thread——输出日志的进程名字，这在Web应用以及异步任务处理中很有用

%-5level——日志级别，并且使用5个字符靠左对齐

%logger- ——日志输出者的名字

%msg——日志消息

%n——平台的换行符
```

# 参考资料

[Spring Boot系列——日志配置](https://www.cnblogs.com/bigdataZJ/p/springboot-log.html)

* any list
{:toc}
