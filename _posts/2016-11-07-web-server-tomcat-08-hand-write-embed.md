---
layout: post
title: 从零手写实现 tomcat-08-tomcat 如何与 springboot 集成？
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 创作缘由

平时使用 tomcat 等 web 服务器不可谓不多，但是一直一知半解。

于是想着自己实现一个简单版本，学习一下 tomcat 的精髓。

# 系列教程

[从零手写实现 apache Tomcat-01-入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat-02-hand-write-overview)

[从零手写实现 apache Tomcat-02-web.xml 入门详细介绍](https://houbb.github.io/2016/11/07/web-server-tomcat-02-hand-write-web-xml)

[从零手写实现 tomcat-03-基本的 socket 实现](https://houbb.github.io/2016/11/07/web-server-tomcat-03-hand-write-simple-socket)

[从零手写实现 tomcat-04-请求和响应的抽象](https://houbb.github.io/2016/11/07/web-server-tomcat-04-hand-write-request-and-resp)

[从零手写实现 tomcat-05-servlet 处理支持](https://houbb.github.io/2016/11/07/web-server-tomcat-05-hand-write-servlet-web-xml)

[从零手写实现 tomcat-06-servlet bio/thread/nio/netty 池化处理](https://houbb.github.io/2016/11/07/web-server-tomcat-06-hand-write-thread-pool)

[从零手写实现 tomcat-07-war 如何解析处理三方的 war 包？](https://houbb.github.io/2016/11/07/web-server-tomcat-07-hand-write-war)

[从零手写实现 tomcat-08-tomcat 如何与 springboot 集成？](https://houbb.github.io/2016/11/07/web-server-tomcat-08-hand-write-embed)

[从零手写实现 tomcat-09-servlet 处理类](https://houbb.github.io/2016/11/07/web-server-tomcat-09-hand-write-servlet)

[从零手写实现 tomcat-10-static resource 静态资源文件](https://houbb.github.io/2016/11/07/web-server-tomcat-10-hand-write-static-resource)

[从零手写实现 tomcat-11-filter 过滤器](https://houbb.github.io/2016/11/07/web-server-tomcat-11-hand-write-filter)

[从零手写实现 tomcat-12-listener 监听器](https://houbb.github.io/2016/11/07/web-server-tomcat-12-hand-write-listener)


# 前言

开始之前，我们来一起思考下面 3 个问题：

1. 我们在 springboot 中可以像 main 一样直接启动，如何实现的？

2. 那么Spring是怎么和Tomcat容器进行集成？

3. Spring和Tomcat容器的生命周期是如何同步？

# 1. springboot 中可以像 main 一样直接启动，如何实现的？

在Spring Boot中，应用程序可以像一个普通的Java程序一样，通过一个`main`方法直接启动，这背后其实是一个挺巧妙的设计。

咱们来接地气地聊聊这是怎么实现的。

首先，你得知道，任何Java程序运行起来，都是因为有一个`main`方法。这是Java虚拟机（JVM）启动程序时的入口点。

在传统的Java Web项目中，服务器（比如Tomcat）会负责启动和运行，而Spring Boot却可以让你用一个简单的`main`方法就跑起来。

实现这一点的关键在于Spring Boot的自动配置和内嵌的Servlet容器（比如Tomcat）。

1. **Spring Boot的自动配置**：Spring Boot提供了大量的自动配置类，这些类会根据你添加的依赖和配置来自动设置你的Spring应用。比如，如果你添加了Spring Web的依赖，Spring Boot就会自动配置一个Web应用。

2. **内嵌Servlet容器**：Spring Boot允许你不用部署到外部的Servlet容器，而是直接内嵌一个Servlet容器到你的应用中。这意味着你的应用可以包含一个小型的服务器，比如Tomcat或Jetty，它们会在应用启动时自动启动。

3. **SpringApplication类**：Spring Boot提供了一个`SpringApplication`类，它用来启动Spring应用。当你创建一个Spring Boot应用时，你的`main`方法通常会这样写：

```java
public static void main(String[] args) {
    SpringApplication.run(YourApplicationClass.class, args);
}
```

这里的`YourApplicationClass`是你的Spring Boot应用的配置类，它通常会用`@SpringBootApplication`注解标注，这个注解是Spring Boot应用的标识，它包含了几个其他的注解，包括：

- `@SpringBootConfiguration`：标识当前类是一个Spring Boot的配置类。
- `@EnableAutoConfiguration`：告诉Spring Boot开启自动配置。
- `@ComponentScan`：告诉Spring Boot在哪里查找其他的Bean。

4. **@SpringBootApplication注解**：这个注解是启动Spring Boot应用的关键。它让Spring Boot知道这个类是用来启动整个应用的。

当你运行这个`main`方法时，Spring Boot会利用`SpringApplication`类来启动你的应用，同时它会根据`@SpringBootApplication`注解中的配置来自动设置你的应用，包括启动内嵌的Servlet容器。

所以，总结来说，Spring Boot之所以能像一个普通的Java程序一样直接启动，是因为它巧妙地利用了自动配置、内嵌容器和特定的注解来简化了整个启动过程。

这样，你就不需要复杂的部署步骤，只需要一个简单的`main`方法，就能运行一个完整的Web应用。

# 2. Spring 是怎么和 Tomcat 容器进行集成？

首先，得明白Spring和Tomcat是两个不同的技术，但它们可以一起工作，就像豆浆和油条，各自独立但又很搭配。

**Tomcat** 是一个Servlet容器，它的主要工作是处理HTTP请求，比如当你在浏览器里输入网址，Tomcat就会响应这个请求，给你返回网页。

**Spring** 是一个庞大的Java企业级应用框架，它提供了很多功能，比如依赖注入（DI）、事务管理、安全性等等。

在Web开发中，Spring也提供了对Web应用的支持，比如Spring MVC。

那么，Spring是怎么和Tomcat集成的呢？主要有两种方式：

1. **独立模式**：在这种模式下，Spring和Tomcat是分开的，各干各的活。Tomcat只负责接收HTTP请求，然后它把这些请求转交给Spring来处理。Spring会根据你的配置来决定怎么响应这些请求，比如调用哪个控制器（Controller）来处理请求，然后返回响应。

   这个过程就像是Tomcat是门卫，它负责接待来访的客人（HTTP请求），然后告诉Spring：“有人找你。”Spring再根据具体情况来接待这些客人。

2. **嵌入式模式**：在这种模式下，Spring把Tomcat嵌入到自己的应用中。这意味着你的Spring应用里会包含一个小型的Tomcat服务器。当你运行Spring应用时，这个内嵌的Tomcat服务器也会启动，然后直接处理HTTP请求，而不需要一个单独的Tomcat服务器。

   这种方式就像是Spring自己开了个小店，它不仅负责内部管理，还直接面对客户，处理所有的事务。

无论是哪种模式，Spring和Tomcat的集成都依赖于一些关键的技术：

- **Servlet规范**：Java Servlet规范是一个标准，它定义了Java Web应用的运行方式。Spring和Tomcat都遵循这个规范，所以它们可以一起工作。

- **Spring MVC**：这是Spring提供的一个Web框架，它遵循MVC（模型-视图-控制器）设计模式。在Spring MVC中，Tomcat的作用主要是接收HTTP请求，然后由Spring MVC的控制器来处理这些请求。

- **Spring Boot**：这是Spring的一个子项目，它让Spring应用的配置和部署变得更加简单。在Spring Boot中，你可以很容易地集成Tomcat，因为Spring Boot已经为你做好了大部分配置。

总的来说，Spring和Tomcat的集成就是通过遵循Java Servlet规范，利用Spring MVC和Spring Boot等技术，让Spring应用能够运行在Tomcat上，处理HTTP请求，从而提供Web服务。

# 3. Spring 和 Tomcat 容器的生命周期是如何同步？ 

首先，生命周期就是指一个东西从开始到结束的整个过程。

对于软件来说，就是从启动到关闭的这段时间。

PS: 就是我们常说的钩子函数。

**Tomcat的生命周期**：Tomcat作为一个服务器，它的生命周期很简单。当你启动Tomcat，它就开始监听网络请求，然后你就可以通过浏览器等客户端访问你的网站了。当你关闭Tomcat，它就会停止监听，不再处理任何请求。

**Spring的生命周期**：Spring的生命周期稍微复杂一些，因为它涉及到很多组件，也就是Spring管理的Bean。Spring的生命周期包括Bean的创建、初始化、使用和销毁。

那么，Spring和Tomcat是如何同步它们的生命周期的呢？这主要通过以下几个步骤：

1. **启动阶段**：当你启动Tomcat时，它会加载Spring的配置文件，然后创建Spring的上下文（ApplicationContext）。这个上下文就是Spring管理所有Bean的地方。在这个过程中，Spring会创建所有的Bean，然后调用它们的初始化方法。

2. **运行阶段**：在Tomcat运行期间，它会不断地接收HTTP请求，并将这些请求转发给Spring处理。Spring会根据配置，找到合适的Bean来处理这些请求。在这个阶段，Bean会被使用，但它们不会被销毁。

3. **关闭阶段**：当你关闭Tomcat时，它会告诉Spring的上下文是时候关闭了。收到这个信号后，Spring会执行一系列的关闭操作，包括调用Bean的销毁方法，然后关闭上下文。这样，所有的Bean都会被正确地销毁，资源会被释放。

在这个过程中，Tomcat和Spring通过一系列的事件和监听器来同步它们的生命周期。Tomcat会发出启动和关闭的事件，而Spring会监听这些事件，并在适当的时候执行自己的生命周期操作。

举个例子，Spring提供了几个生命周期相关的接口，比如`InitializingBean`和`DisposableBean`。通过实现这些接口，你可以自定义Bean的初始化和销毁逻辑。当Tomcat启动或关闭时，Spring会调用这些方法，从而实现生命周期的同步。

此外，Spring还提供了一些生命周期相关的事件，比如`ContextRefreshedEvent`和`ContextClosedEvent`。这些事件会在Spring上下文刷新和关闭时发出，你可以在Spring应用中监听这些事件，然后执行一些特定的操作。

总的来说，Spring和Tomcat通过监听对方的生命周期事件，并执行相应的操作，实现了它们的生命周期同步。

这样，无论Tomcat何时启动或关闭，Spring都能保证自己的Bean被正确地创建和销毁，从而保证了应用的稳定性和资源的有效利用。

# 4. 对我们实现 tomcat 的启发？

Spring Boot应用启动时，会创建Spring上下文（ApplicationContext），加载所有的Bean，并初始化它们。

Tomcat启动时，会加载Web应用，初始化Servlet和Listener。

实现自己的Tomcat时，要设计一个清晰的启动流程，确保所有的资源都能被正确加载和初始化。

# 从零手写例子

```
 /\_/\  
( o.o ) 
 > ^ <
```

mini-cat 是简易版本的 tomcat 实现。别称【嗅虎】(心有猛虎，轻嗅蔷薇。)

开源地址：[https://github.com/houbb/minicat](https://github.com/houbb/minicat)


-------------------------------------------------------------------------------------------------------------------------------------------------------


# SpringBoot与Tomcat

使用SpringBoot搭建一个网页，应该是很多Spring学习者入门的案例。

我们只需要在pom添加Spring的web-starter依赖，并添加对应的Controller，一键启动之后就可以得到一个完整的Web应用示例。

```xml
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-starter-web</artifactId>
   <version>2.1.6.RELEASE</version>
</dependency>
```

```java
@RestController
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @RequestMapping("/")
    public String hello(){
        return "hello";
    }
}
```

既然是一个Web应用，那么该应用必定启动了对应的Servlet容器，常见的Servlet容器有Tomcat/Undertow/jetty/netty等，SpringBoot对这些容器都有集成。

本文会重点分析SpringBoot是如何集成Tomcat容器的。

# 如何判断是不是Web应用

我们知道SpringBoot不一定以Web应用的形式运行，还可以以桌面程序的形式运行，那么SpringBoot在应用中如何判断应用是不是一个Web应用程序，是不是需要启动Tomcat容器的呢？

Spring容器在容器启动的时候，会调用WebApplicationType.deduceFromClasspath()方法来推断当前的应用程序类型，从方法名字就可以看出，该方法是通过当前项目中的类来判断是不是Web项目的。

以下为该方法的源码，当我们在项目中添加了spring-boot-starter-web的依赖之后，项目路径中会包含webMvc的类，对应的Spring应用也会被识别为Web应用。

```java
private static final String[] SERVLET_INDICATOR_CLASSES = { "javax.servlet.Servlet", "org.springframework.web.context.ConfigurableWebApplicationContext" };

private static final String WEBMVC_INDICATOR_CLASS = "org.springframework.web.servlet.DispatcherServlet";

private static final String WEBFLUX_INDICATOR_CLASS = "org.springframework.web.reactive.DispatcherHandler";

private static final String JERSEY_INDICATOR_CLASS = "org.glassfish.jersey.servlet.ServletContainer";

private static final String SERVLET_APPLICATION_CONTEXT_CLASS = "org.springframework.web.context.WebApplicationContext";

private static final String REACTIVE_APPLICATION_CONTEXT_CLASS = "org.springframework.boot.web.reactive.context.ReactiveWebApplicationContext";

static WebApplicationType deduceFromClasspath() {
    if (ClassUtils.isPresent(WEBFLUX_INDICATOR_CLASS, null) && !ClassUtils.isPresent(WEBMVC_INDICATOR_CLASS, null) && !ClassUtils.isPresent(JERSEY_INDICATOR_CLASS, null)) {
        return WebApplicationType.REACTIVE;
    }
    for (String className : SERVLET_INDICATOR_CLASSES) {
        if (!ClassUtils.isPresent(className, null)) {
            return WebApplicationType.NONE;
        }
    }
    return WebApplicationType.SERVLET;
}
```

# 根据应用类型创建应用

通过项目中包含类的类型，Spring可以判断出当前应用的类型，之后Spring就需要根据应用类型去创建对应的ApplicationContext。

从下面的程序中可以看出来，对于我们关注的普通web应用，Spring会创建一个AnnotationConfigServletWebServerApplicationContext。

```java
ApplicationContextFactory DEFAULT = (webApplicationType) -> {
    try {
        switch (webApplicationType) {
            case SERVLET:
                return new AnnotationConfigServletWebServerApplicationContext();
            case REACTIVE:
                return new AnnotationConfigReactiveWebServerApplicationContext();
            default:
                return new AnnotationConfigApplicationContext();
            }
        }
        catch (Exception ex) {
            throw new IllegalStateException("Unable create a default ApplicationContext instance, "
            + "you may need a custom ApplicationContextFactory", ex);
        }
};
```

AnnotationConfigServletWebServerApplicationContext是Web应用的Spring容器，我们可以推断，这个ApplicationContext容器中必定包含了servlet容器的初始化。

去查看容器初始化的源码可以发现，在容器Refresh阶段会初始化WebServer，源码如下：

```java
@Override
protected void onRefresh() {
    super.onRefresh();
    try {
        // Spring容器Refresh阶段创建WebServer
        createWebServer(); 
    }
    catch (Throwable ex) {
        throw new ApplicationContextException("Unable to start web server", ex);
    }
}

private void createWebServer() {
        WebServer webServer = this.webServer;
        ServletContext servletContext = getServletContext();

        // 没有初始化好的WebServer就需要初始化一个
        if (webServer == null && servletContext == null) {
            StartupStep createWebServer = this.getApplicationStartup().start("spring.boot.webserver.create");

            // 获取ServletWebServerFactory，对于Tomcat来说获取到的就是TomcatServletWebServerFactory
            ServletWebServerFactory factory = getWebServerFactory();
            createWebServer.tag("factory", factory.getClass().toString());

            // 创建Tomcat容器的WebServer
            this.webServer = factory.getWebServer(getSelfInitializer());
            createWebServer.end();
            getBeanFactory().registerSingleton("webServerGracefulShutdown",
                    new WebServerGracefulShutdownLifecycle(this.webServer));
            getBeanFactory().registerSingleton("webServerStartStop",
                    new WebServerStartStopLifecycle(this, this.webServer));
        }
        else if (servletContext != null) {
            try {
                getSelfInitializer().onStartup(servletContext);
            }
            catch (ServletException ex) {
                throw new ApplicationContextException("Cannot initialize servlet context", ex);
            }
        }
        initPropertySources();
    }
```


# Tomcat的初始化

通过上面的内容，我们知道SpringBoot会在启动的时候判断是不是Web应用并创建对应类型的Spring容器，对于Web应用会创建Web类型的ApplicationContext。 

在Spring容器启动的时候会初始化WebServer，也就是初始化Tomcat容器。

本节我们会分析Tomcat容器初始化源码的各个步骤。

## 获取ServletWebServerFactory

初始化Tomcat容器的过程中，第一步是获取创建Tomcat WebServer的工厂类TomcatServletWebServerFactory，分析源码可知，Spring是直接通过Bean的类型从Spring容器中获取ServletWebServerFactory的，所以Tomcat容器类型的SpringBoot应该在启动时向容器中注册TomcatServletWebServerFactory的实例作为一个Bean。

```java
// 获取ServletWebServerFactory关键代码
factory = getWebServerFactory();

// 关键代码涉及的函数
protected ServletWebServerFactory getWebServerFactory() {
    // Use bean names so that we don't consider the hierarchy
    String[] beanNames = getBeanFactory().getBeanNamesForType(ServletWebServerFactory.class);
    if (beanNames.length == 0) {
        throw new ApplicationContextException("Unable to start ServletWebServerApplicationContext due to missing "
                + "ServletWebServerFactory bean.");
    }
    if (beanNames.length > 1) {
        throw new ApplicationContextException("Unable to start ServletWebServerApplicationContext due to multiple "
                + "ServletWebServerFactory beans : " + StringUtils.arrayToCommaDelimitedString(beanNames));
    }
    return getBeanFactory().getBean(beanNames[0], ServletWebServerFactory.class);
}
```

## 创建WebServer的实例

拿到用于创建WebServer的ServletWebServerFactory，我们就可以开始着手创建WebServer了，创建WebServer的关键代码如下所示。

```java
// 创建WebServer的实例关键代码
this.webServer = factory.getWebServer(getSelfInitializer());
```

创建WebServer的第一步是拿到创建时需要的参数，这个参数的类型是ServletContextInitializer，ServletContextInitializer的作用是用于初始化ServletContext，接口源码如下，从接口的注释中我们就可以看到，这个参数可以用于配置servlet容器的filters，listeners等信息。

```java
@FunctionalInterface
public interface ServletContextInitializer {

    /**
     * Configure the given {@link ServletContext} with any servlets, filters, listeners
     * context-params and attributes necessary for initialization.
     * @param servletContext the {@code ServletContext} to initialize
     * @throws ServletException if any call against the given {@code ServletContext}
     * throws a {@code ServletException}
     */
    void onStartup(ServletContext servletContext) throws ServletException;

}
```

Spring是通过getSelfInitializer()方法来获取初始化参数，查看getSelfInitializer()方法，可以发现该方法实现了如下功能：

- 绑定SpringBoot应用程序和ServletContext；

- 向SpringBoot注册ServletContext，Socpe为Application级别；

- 向SpringBoot上下文环境注册ServletContext环境相关的Bean；

- 获取容器中所有的ServletContextInitializer，依次处理ServletContext。

```java
private ServletContextInitializer getSelfInitializer() {
    return this::selfInitialize;
}

private void selfInitialize(ServletContext servletContext) throws ServletException {
    prepareWebApplicationContext(servletContext);
    registerApplicationScope(servletContext);
    WebApplicationContextUtils.registerEnvironmentBeans(getBeanFactory(), servletContext);
    for (ServletContextInitializer beans : getServletContextInitializerBeans()) {
        beans.onStartup(servletContext);
    }
}
```

获取到用于创建WebServer的参数之后，Spring就会调用工厂方法去创建Tomcat对应的WebServer。

```java
@Override
public WebServer getWebServer(ServletContextInitializer... initializers) {
    if (this.disableMBeanRegistry) {
        Registry.disableRegistry();
    }
    Tomcat tomcat = new Tomcat();
    File baseDir = (this.baseDirectory != null) ? this.baseDirectory : createTempDir("tomcat");
    tomcat.setBaseDir(baseDir.getAbsolutePath());
    Connector connector = new Connector(this.protocol);
    connector.setThrowOnFailure(true);
    tomcat.getService().addConnector(connector);
    customizeConnector(connector);
    tomcat.setConnector(connector);
    tomcat.getHost().setAutoDeploy(false);
    configureEngine(tomcat.getEngine());    
    for (Connector additionalConnector : this.additionalTomcatConnectors) {
        tomcat.getService().addConnector(additionalConnector);
    }
    prepareContext(tomcat.getHost(), initializers);
    return getTomcatWebServer(tomcat);
}
```

# Tomcat生命周期

我们在使用基于Spring MVC应用框架，只需要启动/关闭Spring应用，就可以同步启动/关闭Tomcat容器，那么Spring是如何做到的呢？

从下面初始化Web容器的代码可以看到，Spring容器会注册两个和WebServer容器相关的生命周期Bean：

容器的优雅关闭Bea——webServerGracefulShutdown。

容器的生命周期管理的Bean——webServerStartStop

```java
    getBeanFactory().registerSingleton("webServerGracefulShutdown",
                    new WebServerGracefulShutdownLifecycle(this.webServer));
    getBeanFactory().registerSingleton("webServerStartStop",
                    new WebServerStartStopLifecycle(this, this.webServer));
```

## Tomcat容器优雅关闭

这是SpringBoot在最新的2.X.X版本中新增的优雅停机功能，​ 优雅停机指的是Java项目在停机时需要做好断后工作。

如果直接使用kill -9 方式暴力的将项目停掉，可能会导致正常处理的请求、定时任务、RMI、注销注册中心等出现数据不一致问题。

如何解决优雅停机呢？

大致需要解决如下问题：

- 首先要确保不会再有新的请求进来，所以需要设置一个流量挡板

- 保证正常处理已进来的请求线程，可以通过计数方式记录项目中的请求数量

- 如果涉及到注册中心，则需要在第一步结束后注销注册中心

- 停止项目中的定时任务

- 停止线程池

- 关闭其他需要关闭资源等等等

​SpringBoot优雅停机出现之前，一般需要通过自研方式来保证优雅停机。

我也见过有项目组使用 kill -9 或者执行 shutdown脚本直接停止运行的项目，当然这种方式不够优雅。

Spring提供Tomcat优雅关闭的核心类是WebServerGracefulShutdownLifecycle，可以等待用户的所有请求处理完成之后再关闭Tomcat容器，我们查看WebServerGracefulShutdownLifecycle的的关机关键源码如下：

```java
    // WebServerGracefulShutdownLifecycle停机源码
    @Override
    public void stop(Runnable callback) {
        this.running = false;
        this.webServer.shutDownGracefully((result) -> callback.run());
    }

    // tomcat web server shutDownGracefully源码
     @Override
     public void shutDownGracefully(GracefulShutdownCallback callback) {
          if (this.gracefulShutdown == null) {
               callback.shutdownComplete(GracefulShutdownResult.IMMEDIATE);
               return;
          }
          this.gracefulShutdown.shutDownGracefully(callback);
     }
```

此处出现了优雅关闭的工具类GracefulShutdown，Tomcat容器的GracefulShutdown源码如下所示，可以看到优雅关闭分为以下步骤：

- 关闭Tomcat容器的所有的连接器，连接器关闭之后会停止接受新的请求。

- 轮询所有的Context容器，等待这些容器中的请求被处理完成。

- 如果强行退出，那么就不等待所有容器中的请求处理完成。

- 回调优雅关闭的结果，有三种关闭结果：REQUESTS_ACTIVE有活跃请求的情况下强行关闭，IDLE所有请求完成之后关闭，IMMEDIATE没有任何等待立即关闭容器。

```java
final class GracefulShutdown {

    void shutDownGracefully(GracefulShutdownCallback callback) {
        logger.info("Commencing graceful shutdown. Waiting for active requests to complete");
        new Thread(() -> doShutdown(callback), "tomcat-shutdown").start();
    }

    private void doShutdown(GracefulShutdownCallback callback) {
        // 关闭Tomcat的所有的连接器，不接受新的请求
        List<Connector> connectors = getConnectors();
        connectors.forEach(this::close);
        try {
            for (Container host : this.tomcat.getEngine().findChildren()) {

                // 轮询所有的Context容器
                for (Container context : host.findChildren()) {
                    // 判断容器中的所有请求是不是已经结束。
                    while (isActive(context)) {

                        // 强行退出的情况下不等待所有请求处理完成
                        if (this.aborted) {
                            logger.info("Graceful shutdown aborted with one or more requests still active");
                            callback.shutdownComplete(GracefulShutdownResult.REQUESTS_ACTIVE);
                            return;
                        }
                        Thread.sleep(50);
                    }
                }
            }

        }
        catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
        logger.info("Graceful shutdown complete");
        callback.shutdownComplete(GracefulShutdownResult.IDLE);
    }
}
```

Spring 容器是怎么知道关闭并进行回调的呢？本处只介绍kill -15工作原理：

Spring容器在启动的时候会向JVM注册销毁回调方法，JVM在收到kill -15之后不会直接退出，而是会一一调用这些回调方法，然后Spring会在这些回调方法中进行优雅关闭，比如从注册中心删除注册信息，优雅关闭Tomcat等等。

# 开源地址

```
 /\_/\  
( o.o ) 
 > ^ <
```

mini-cat 是简易版本的 tomcat 实现。别称【嗅虎】(心有猛虎，轻嗅蔷薇。)

开源地址：[https://github.com/houbb/minicat](https://github.com/houbb/minicat)

# 参考资料

https://www.cnblogs.com/yuhushen/p/15396612.html

* any list
{:toc}