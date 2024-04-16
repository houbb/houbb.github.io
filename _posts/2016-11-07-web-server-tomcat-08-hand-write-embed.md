---
layout: post
title: 从零手写是实现 tomcat-08-tomcat 如何内嵌？
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 拓展阅读

[Netty 权威指南-01-BIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-01-bio)

[Netty 权威指南-02-NIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-02-nio)

[Netty 权威指南-03-AIO 案例](https://houbb.github.io/2019/05/10/netty-definitive-gudie-03-aio)

[Netty 权威指南-04-为什么选择 Netty？Netty 入门教程](https://houbb.github.io/2019/05/10/netty-definitive-gudie-04-why-netty)

# 前言

我们在 springboot 中可以像 main 一样直接启动，如何实现的？

那么Spring是怎么和Tomcat容器进行集成？

Spring和Tomcat容器的生命周期是如何同步？

本文会详细介绍Spring和Tomcat容器的集成。


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

https://github.com/houbb/minicat

# 参考资料

https://www.cnblogs.com/yuhushen/p/15396612.html

* any list
{:toc}