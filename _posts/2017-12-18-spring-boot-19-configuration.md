---
layout: post
title:  Spring Boot-19-入门配置项介绍
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# 配置类

Spring Boot支持基于Java的配置。 

尽管可以将SpringApplication与XML源一起使用，但是我们通常建议您的主要源为单个 `@Configuration` 类。 

通常，定义main方法的类是首选的 @Configuration。

## 导入其他配置类

您无需将所有 `@Configuration` 放在单个类中。 

`@Import` 批注可用于导入其他配置类。 

另外，您可以使用 `@ComponentScan` 自动扫描所有Spring组件，包括@Configuration类。

## 导入XML配置

如果绝对必须使用基于XML的配置，我们建议您仍然从 @Configuration 类开始。 

然后，您可以使用 `@ImportResource` 批注来加载XML配置文件。

# 自动配置

Spring Boot自动配置会尝试根据添加的jar依赖项自动配置Spring应用程序。 

例如，如果HSQLDB在类路径上，并且您尚未手动配置任何数据库连接bean，则Spring Boot会自动配置内存数据库。

您需要通过将 `@EnableAutoConfiguration` 或 `@SpringBootApplication` 注释添加到您的@Configuration类之一来选择自动配置。

一般建议将这个注解加载 main 类上，其中 @SpringBootApplication 是会默认引入 @EnableAutoConfiguration 注解的。

## 逐渐取代自动配置

自动配置是非侵入性的。 

**在任何时候，您都可以开始定义自己的配置，以替换自动配置的特定部分。** 

例如，如果您添加自己的DataSource bean，则默认的嵌入式数据库支持将退出。

如果您需要了解当前正在应用哪些自动配置以及原因，请使用--debug开关启动您的应用程序。 

这样做可以启用调试日志以供选择核心记录器，并将条件报告记录到控制台。

## 禁用特定的自动配置类

如果发现正在应用不需要的特定自动配置类，则可以使用 @SpringBootApplication 的 exclude 属性禁用它们，如以下示例所示：

```java
mport org.springframework.boot.autoconfigure.*;
import org.springframework.boot.autoconfigure.jdbc.*;

@SpringBootApplication(exclude={DataSourceAutoConfiguration.class})
public class MyApplication {
}
```

一般都是针对一些 jdbc redis 等数据源的自动配置，有时候我们不需要，就可以指定排除。

# spring beans 和依赖注入

您可以自由使用任何标准的Spring Framework技术来定义bean及其注入的依赖项。

我们经常发现使用@ComponentScan（查找您的bean）和使用@Autowired（进行构造函数注入）效果很好。

如果按照上面的建议构造代码（将应用程序类放在根包中），则可以添加@ComponentScan，而不添加任何参数。 

您的所有应用程序组件（@Component，@Service，@Repository，@Controller等）都将自动注册为Spring Bean。

以下示例显示了一个@Service Bean，它使用构造函数注入来获取所需的RiskAssessor Bean：

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DatabaseAccountService implements AccountService {

    private final RiskAssessor riskAssessor;

    @Autowired
    public DatabaseAccountService(RiskAssessor riskAssessor) {
        this.riskAssessor = riskAssessor;
    }

}
```

## 省略 @Autowired

这就是 springboot 设计比较人性化的地方，基本上完全兼容 spring。

如果bean具有一个构造函数，则可以省略@Autowired，如以下示例所示：

```java
@Service
public class DatabaseAccountService implements AccountService {

    private final RiskAssessor riskAssessor;

    public DatabaseAccountService(RiskAssessor riskAssessor) {
        this.riskAssessor = riskAssessor;
    }

}
```

不过这种方式个人不是很习惯。

# @SpringBootApplication 注解

许多Spring Boot开发人员喜欢他们的应用程序使用自动配置，组件扫描，并能够在其“应用程序类”上定义额外的配置。 

单个@SpringBootApplication批注可用于启用这三个功能，即：

@EnableAutoConfiguration：启用Spring Boot的自动配置机制

@ComponentScan：对应用程序所在的软件包启用@Component扫描（请参阅最佳实践）

@Configuration：允许在上下文中注册额外的bean或导入其他配置类

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication // same as @Configuration @EnableAutoConfiguration @ComponentScan
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

## 自定义

这些功能都不是强制性的，您可以选择用它启用的任何功能替换此单个注释。 

例如，您可能不想在应用程序中使用组件扫描或配置属性扫描：

```java
import org.springframework.boot.SpringApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration(proxyBeanMethods = false)
@EnableAutoConfiguration
@Import({ MyConfig.class, MyAnotherConfig.class })
public class Application {

    public static void main(String[] args) {
            SpringApplication.run(Application.class, args);
    }

}
```

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

我是老马，期待与你的下次重逢。

# 参考资料

https://docs.spring.io/spring-boot/docs/2.4.1/maven-plugin/reference/htmlsingle/#help

* any list
{:toc}
