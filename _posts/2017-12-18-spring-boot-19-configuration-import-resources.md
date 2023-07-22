---
layout: post
title:  Spring Boot-19-spring @ImportResource 导入配置与 @PropertySource 导入属性
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# @ImportResource

`@ImportResource` 是 Spring Framework 中的一个注解，用于将 XML 配置文件导入到 Spring 容器中，以实现将传统的 XML 配置与基于注解的配置相结合。

在 Spring 中，通常我们使用注解方式来配置和管理 Bean。但在一些情况下，我们可能仍然需要使用传统的 XML 配置，比如集成一些老旧的组件或框架，或者遗留项目中已有的 XML 配置文件。`@ImportResource` 就是为了这种场景而设计的。

使用方法很简单，只需在 Spring 配置类上加上 `@ImportResource` 注解，并指定要导入的 XML 配置文件的路径或资源路径。Spring 将会自动加载这些 XML 配置文件并将其中定义的 Bean 注册到 Spring 容器中。

示例：

假设有一个名为 `applicationContext.xml` 的 XML 配置文件，其内容如下：

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!-- 定义一个名为 "exampleBean" 的 Bean -->
    <bean id="exampleBean" class="com.example.ExampleBean">
        <!-- Bean 的属性设置 -->
    </bean>

</beans>
```

现在，我们希望在 Spring 配置类中导入这个 XML 配置文件，可以这样做：

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;

@Configuration
@ImportResource("classpath:applicationContext.xml")
public class AppConfig {
    // 这里可以定义其他的 Bean 或配置
}
```

在上述示例中，我们使用 `@ImportResource` 注解导入了 `applicationContext.xml` 文件。`classpath:` 前缀表示该文件在类路径下，这是相对于类路径的资源路径。

注意事项：
1. 需要确保在项目中存在对应的 XML 配置文件。
2. `@ImportResource` 注解只能用于配置类上，而不能用于普通的 Bean 类上。
3. 推荐在新项目中优先使用基于注解的配置方式，尽量避免过多依赖 XML 配置文件，以便更好地利用 Spring 的依赖注入和自动装配特性。

请注意，随着 Spring 的发展，Spring Boot 和 Spring 5.x 版本已经更加倾向于使用基于注解的配置方式，对 XML 配置的需求逐渐减少。

# @PropertySource

在 Spring Framework 中，我们可以使用 `@PropertySource` 注解来指定要加载的 properties 文件。该注解允许我们在 Spring 配置类中引入外部的 properties 文件，从而可以在配置类中使用这些属性值。

使用方法如下：

1. 在 properties 文件中定义属性，例如 `config.properties` 文件：

```properties
app.name=MyApp
app.version=1.0.0
```

2. 在 Spring 配置类上使用 `@PropertySource` 注解引入该 properties 文件，并指定其路径：

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:config.properties")
public class AppConfig {
    // 这里可以使用 @Value 注解获取属性值
}
```

在上述示例中，我们使用 `@PropertySource` 注解将 `config.properties` 文件加载到 Spring 容器中，该文件位于类路径（`classpath`）下。

3. 在配置类中使用 `@Value` 注解获取属性值：

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MyAppComponent {

    @Value("${app.name}")
    private String appName;

    @Value("${app.version}")
    private String appVersion;

    // ... 其他业务逻辑 ...
}
```

通过 `@Value` 注解结合 `${...}` 表达式，我们可以在代码中获取配置文件中的属性值。

在上述示例中，`appName` 将被注入为 "MyApp"，而 `appVersion` 将被注入为 "1.0.0"。

需要注意的是，`@PropertySource` 注解必须与 `@Configuration` 注解一起使用，以确保其生效。同时，也可以在一个配置类中使用多个 `@PropertySource` 注解，以加载多个 properties 文件。

请确保在类路径下存在指定的 properties 文件，以便 Spring 可以正确加载并解析它们。

# 小结

spring 的技术点比较多，需要日积月累的整理学习。

# 参考资料

https://docs.spring.io/spring-boot/docs/2.4.1/maven-plugin/reference/htmlsingle/#help

* any list
{:toc}
