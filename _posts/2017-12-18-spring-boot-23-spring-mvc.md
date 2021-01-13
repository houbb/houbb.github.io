---
layout: post
title:  Spring Boot-23-进行 web mvc 开发
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# 序言

大家好，我是老马。

平时一直在使用 springboot，却总感觉对于其理解不深入，于是有两个这个系列的整理。

主要是为了系统的学习一下 springboot，残缺补漏一下。主要翻译自官方文档，结合自己的实际使用。

[springboot 学习笔记（一）引导类特性详解](https://www.toutiao.com/item/6916083152544956932/)

[springboot 学习笔记（二）外部化配置详解](https://www.toutiao.com/item/6916084329705734660/)

[springboot 教程（三）如何实现配置与环境隔离？](https://www.toutiao.com/item/6916471106937569803/)

[springboot 教程（四）logging 日志配置详解](https://www.toutiao.com/item/6916486290640863751/)

# 场景

以前使用 spring mvc，感觉 servlet 和 structs 真的很麻烦。

现在使用 springboot，感觉 springmvc 真的很麻烦。

时代在进步，懒惰是进步的源动力。

# RestController 经典例子

使用 springboot 在今天越来越多的场景是前后端分离，一般后端都是返回直接的 json 信息进行交互。

```java
@RestController
@RequestMapping(value="/users")
public class MyRestController {

    @RequestMapping(value="/{user}", method=RequestMethod.GET)
    public User getUser(@PathVariable Long user) {
        // ...
    }

    @RequestMapping(value="/{user}/customers", method=RequestMethod.GET)
    List<Customer> getUserCustomers(@PathVariable Long user) {
        // ...
    }

    @RequestMapping(value="/{user}", method=RequestMethod.DELETE)
    public User deleteUser(@PathVariable Long user) {
        // ...
    }

}
```

这里涉及 [HTTP RESTful](https://houbb.github.io/2018/07/18/http-restful)，此处不做展开。

# spring mvc 的自动配置

springboot 一个非常强大的功能就是自动配置，这让我们使用 mvc 的时候，可以实现零配置。

自动配置会在Spring的默认设置之上添加以下功能：

- 包含ContentNegotiatingViewResolver和BeanNameViewResolver Bean。

- 支持提供静态资源，包括对WebJars的支持。

- 自动注册Converter，GenericConverter和Formatter Bean。

- 对HttpMessageConverters的支持。

- 自动注册MessageCodesResolver。

- 静态index.html支持。

- 自动使用ConfigurableWebBindingInitializer Bean。

如果要保留这些Spring Boot MVC定制并进行更多的MVC定制（拦截器，格式化程序，视图控制器和其他功能），则可以添加自己的类型为WebMvcConfigurer的 `@Configuration` 类。

如果要提供RequestMappingHandlerMapping，RequestMappingHandlerAdapter或ExceptionHandlerExceptionResolver的自定义实例，并且仍然保留Spring Boot MVC自定义，则可以声明WebMvcRegistrations类型的bean，并使用它提供这些组件的自定义实例。

# HttpMessageConverters

Spring MVC使用HttpMessageConverter接口转换HTTP请求和响应。 

默认情况下，字符串以 UTF-8 编码。

如果您需要添加或自定义转换器，则可以使用Spring Boot的HttpMessageConverters类，如以下清单所示：

```java
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.context.annotation.*;
import org.springframework.http.converter.*;

@Configuration(proxyBeanMethods = false)
public class MyConfiguration {

    @Bean
    public HttpMessageConverters customConverters() {
        HttpMessageConverter<?> additional = ...
        HttpMessageConverter<?> another = ...
        return new HttpMessageConverters(additional, another);
    }

}
```

ps: 感觉这种转换一般是用不到的，默认的实现已经比较方便了。

# 自定义JSON序列化器和反序列化器

如果您使用Jackson来序列化和反序列化JSON数据，则可能要编写自己的JsonSerializer和JsonDeserializer类。 

自定义序列化程序通常是通过模块向Jackson进行注册的，但是Spring Boot提供了替代的 `@JsonComponent` 批注，这使得直接注册Spring Bean更加容易。

您可以直接在JsonSerializer，JsonDeserializer或KeyDeserializer实现上使用 `@JsonComponent` 批注。 

您还可以在包含序列化器/反序列化器作为内部类的类上使用它，如以下示例所示：

```java
@JsonComponent
public class Example {

    public static class Serializer extends JsonSerializer<SomeObject> {
    }

    public static class Deserializer extends JsonDeserializer<SomeObject> {
    }

}
```

ApplicationContext中的所有@JsonComponent bean都会自动向Jackson注册。 

因为@JsonComponent用@Component进行元注释，所以通常的组件扫描规则适用。

# MessageCodesResolver

Spring MVC有一种生成错误代码以从绑定错误中呈现错误消息的策略：MessageCodesResolver。 

如果设置 `spring.mvc.message-codes-resolver-format` 属性PREFIX_ERROR_CODE或POSTFIX_ERROR_CODE，Spring Boot会为您创建一个。

# 静态内容

默认情况下，Spring Boot从类路径中的 `/static` 目录（或 `/public` 或 `/resources` 或 `/META-INF/resources`）或ServletContext的根目录中提供静态内容。 

它使用Spring MVC中的ResourceHttpRequestHandler，以便您可以通过添加自己的WebMvcConfigurer并重写addResourceHandlers方法来修改该行为。

在独立的Web应用程序中，还启用了容器中的默认Servlet，并将其用作后备，如果Spring决定不处理，则从ServletContext的根目录提供内容。 

在大多数情况下，这不会发生（除非您修改默认的MVC配置），因为Spring始终可以通过DispatcherServlet处理请求。

默认情况下，资源映射在 `/**` 上，但是您可以使用 `spring.mvc.static-path-pattern` 属性对其进行调整。 

例如，将所有资源重定位到 `/resources/**` 可以这样配置：

```
spring.mvc.static-path-pattern=/resources/**
```

# 欢迎页面

Spring Boot支持静态和模板欢迎页面。 

它首先在配置的静态内容位置中查找index.html文件。 

如果未找到，则寻找索引模板。 

如果找到任何一个，它将自动用作应用程序的欢迎页面。

# 错误处理

默认情况下，Spring Boot提供了一个 `/error` 映射，以一种明智的方式处理所有错误，并且在servlet容器中被注册为“全局”错误页面。 

对于机器客户端，它将生成JSON响应，其中包含错误，HTTP状态和异常消息的详细信息。 

要完全替换默认行为，可以实现 `ErrorController` 并注册该类型的bean定义，或者添加类型为ErrorAttributes的bean以使用现有机制，但替换其内容。

## 统一异常处理

个人感觉这是 springboot 非常方便的一个特性，可以避免我们每一个 controller 方法，都在重复写异常处理代码。

让代码变得更加简洁，也更便于管理。

您还可以定义一个带有 `@ControllerAdvice` 注释的类，以自定义JSON文档以针对特定的控制器和/或异常类型返回，如以下示例所示：

```java
@ControllerAdvice(basePackageClasses = AcmeController.class)
public class AcmeControllerAdvice extends ResponseEntityExceptionHandler {

    @ExceptionHandler(YourException.class)
    @ResponseBody
    ResponseEntity<?> handleControllerException(HttpServletRequest request, Throwable ex) {
        HttpStatus status = getStatus(request);
        return new ResponseEntity<>(new CustomErrorType(status.value(), ex.getMessage()), status);
    }

    private HttpStatus getStatus(HttpServletRequest request) {
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");
        if (statusCode == null) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        return HttpStatus.valueOf(statusCode);
    }

}
```

## 自定义错误页面

如果要显示给定状态代码的自定义HTML错误页面，可以将文件添加到 `/error` 目录。 

错误页面可以是静态HTML（即添加到任何静态资源目录下），也可以使用模板来构建。 

文件名应为确切的状态代码或系列掩码。

例如，要将404映射到静态HTML文件，您的目录结构如下：

```
src/
 +- main/
     +- java/
     |   + <source code>
     +- resources/
         +- public/
             +- error/
             |   +- 404.html
             +- <other public assets>
```

# CORS 支持

跨域资源共享（CORS）是大多数浏览器实施的W3C规范，可让您灵活地指定授权哪种类型的跨域请求，而不是使用一些安全性和功能不强的方法（例如IFRAME或JSONP） 。

从4.2版本开始，Spring MVC支持CORS。 

在Spring Boot应用程序中使用带有 `@CrossOrigin` 批注的控制器方法CORS配置不需要任何特定的配置。 

可以通过使用自定义的 `addCorsMappings(CorsRegistry)` 方法注册WebMvcConfigurer bean来定义全局CORS配置，如以下示例所示：

```java
@Configuration(proxyBeanMethods = false)
public class MyConfiguration {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**");
            }
        };
    }
}
```

关于 CORS，可以参考 [CORS 介绍](https://houbb.github.io/2018/04/04/cors)

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

我是老马，期待与你的下次重逢。

# 参考资料

https://docs.spring.io/spring-boot/docs/2.4.1/maven-plugin/reference/htmlsingle/#help

* any list
{:toc}
