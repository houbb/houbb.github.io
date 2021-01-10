---
layout: post
title:  Spring Boot-20-SpringApplication 特性
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# SpringApplication

SpringApplication 类提供了一种便捷的方式来引导从 main() 方法启动的Spring应用程序。

在许多情况下，您可以委派给静态SpringApplication.run方法，如以下示例所示：

```java
public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
}
```

默认的日志输出如下：

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v1.5.9.RELEASE)

2021-01-10 15:50:12.081  INFO 4316 --- [           main] c.r.s.boot.hello.controller.Application  : Starting Application on hackerone with PID 4316 (D:\github\spring-boot-learn\spring-boot-hello\target\classes started by Administrator in D:\github\spring-boot-learn)
2021-01-10 15:50:12.085  INFO 4316 --- [           main] c.r.s.boot.hello.controller.Application  : No active profile set, falling back to default profiles: default
2021-01-10 15:50:12.152  INFO 4316 --- [           main] ationConfigEmbeddedWebApplicationContext : Refreshing org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@1c153a1: startup date [Sun Jan 10 15:50:12 CST 2021]; root of context hierarchy
2021-01-10 15:50:13.711  INFO 4316 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat initialized with port(s): 18080 (http)
2021-01-10 15:50:13.726  INFO 4316 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2021-01-10 15:50:13.728  INFO 4316 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet Engine: Apache Tomcat/8.5.23
```

一般默认的日志级别为 INFO，这个可以自己定义。

# 启动失败

如果您的应用程序无法启动，则已注册的FailureAnalyzers将有机会提供专门的错误消息和解决该问题的具体措施。

例如，如果您在端口8080上启动Web应用程序并且该端口已在使用中，则应该看到类似于以下消息的内容：

```
***************************
APPLICATION FAILED TO START
***************************

Description:

Embedded servlet container failed to start. Port 8080 was already in use.

Action:

Identify and stop the process that's listening on port 8080 or configure this application to listen on another port.
```

## FailureAnalyzer 失败分析器

```java
public interface FailureAnalyzer {

	/**
	 * Returns an analysis of the given {@code failure}, or {@code null} if no analysis
	 * was possible.
	 * @param failure the failure
	 * @return the analysis or {@code null}
	 */
	FailureAnalysis analyze(Throwable failure);

}
```

所有的失败都可以有对应的返回描述，帮助用户更好的解决异常。

这个是允许用户自定义的。

# 延迟初始化

SpringApplication允许延迟地初始化应用程序。

启用惰性初始化后，将根据需要创建bean，而不是在应用程序启动期间创建bean。

因此，**启用延迟初始化可以减少应用程序启动所花费的时间**。

在Web应用程序中，启用延迟初始化将导致许多与Web相关的Bean直到收到HTTP请求后才被初始化。

延迟初始化的**缺点是，它可能会延迟发现应用程序问题的时间**。

如果延迟配置了错误配置的Bean，则在启动过程中将不再发生故障，并且只有在初始化Bean时问题才会变得明显。还必须注意确保JVM具有足够的内存来容纳所有应用程序的bean，而不仅仅是启动期间初始化的bean。

由于这些原因，默认情况下不会启用延迟初始化，因此建议在启用延迟初始化之前先对JVM的堆大小进行微调。

可以使用SpringApplicationBuilder上的lazyInitialization方法或SpringApplication上的setLazyInitialization方法以编程方式启用延迟初始化。

或者，可以使用spring.main.lazy-initialization属性启用它，如以下示例所示：

```
spring.main.lazy-initialization=true
```

# 自定义 Banner

可以通过将banner.txt文件添加到类路径或将spring.banner.location属性设置为此类文件的位置来更改启动时打印的横幅。 

如果文件的编码不是UTF-8，则可以设置spring.banner.charset。 

除了文本文件之外，您还可以将banner.gif，banner.jpg或banner.png图像文件添加到类路径中，或设置spring.banner.image.location属性。 

图像将转换为ASCII艺术作品并打印在任何文字横幅上方。

ps: 老马测试了一下图片的效果，发现不是很好。

## 占位符

在banner.txt文件中，您可以使用以下任意占位符：

| 变量 | 描述 |
|:----|:----|
| ${application.version} | 您的应用程序的版本号，在MANIFEST.MF中声明。 例如，实现版本：1.0被打印为1.0。 |
| ${application.formatted-version} | 您的应用程序的版本号，在MANIFEST.MF中声明。 例如，实现版本：1.0被打印为v1.0。 |
| ${spring-boot.version} | 当前 springboot 版本号。如 2.4.1 |
| ${spring-boot.formatted-version} |  当前 springboot 版本号格式化输出。如 v2.4.1 |
| ${Ansi.NAME} (or ${AnsiColor.NAME}, ${AnsiBackground.NAME}, ${AnsiStyle.NAME}) | 其中NAME是ANSI转义代码的名称。 有关详细信息，请参见AnsiPropertySource。 |
| ${application.title} | 在MANIFEST.MF中声明的应用程序标题。 例如，Implementation-Title：MyApp被打印为MyApp。 |


## 自定义

如果您要以编程方式生成横幅，则可以使用SpringApplication.setBanner（…）方法。 

使用org.springframework.boot.Banner接口并实现自己的printBanner()方法。

# 自定义SpringApplication

如果SpringApplication的默认设置不符合您的喜好，您可以创建一个本地实例并对其进行自定义。 

例如，要关闭横幅，您可以编写：

```java
public static void main(String[] args) {
    SpringApplication app = new SpringApplication(MySpringConfiguration.class);
    app.setBannerMode(Banner.Mode.OFF);
    app.run(args);
}
```

传递给SpringApplication的构造函数参数是Spring bean的配置源。 

在大多数情况下，它们是对@Configuration类的引用，但也可以是对XML配置或应扫描的程序包的引用。

也可以通过使用application.properties文件配置SpringApplication。

# Fluent Builder API

如果您需要构建ApplicationContext层次结构（具有父/子关系的多个上下文），或者如果您更喜欢使用“流利的”构建器API，则可以使用SpringApplicationBuilder。

SpringApplicationBuilder使您可以将多个方法调用链接在一起，并包括允许您创建层次结构的父方法和子方法，如以下示例所示：

```java
new SpringApplicationBuilder()
        .sources(Parent.class)
        .child(Application.class)
        .bannerMode(Banner.Mode.OFF)
        .run(args);
```

# 应用程序可用性

在平台上部署后，应用程序可以使用诸如Kubernetes Probes之类的基础结构向平台提供有关其可用性的信息。 

Spring Boot对常用的“活动性”和“就绪性”可用性状态提供了开箱即用的支持。 

如果您使用的是Spring Boot的“执行器”支持，则这些状态将显示为运行状况端点组。

另外，您还可以通过将ApplicationAvailability接口注入到您自己的bean中来获取可用性状态。

## 生命状态

应用程序的“活动”状态表明其内部状态是否允许其正常运行，或者在当前出现故障时自行恢复。

损坏的“活动”状态意味着应用程序处于无法恢复的状态，并且基础结构应重新启动应用程序。

通常，“活动”状态不应基于外部检查（例如健康检查）。 

如果确实如此，则发生故障的外部系统（数据库，Web API，外部缓存）将触发整个平台的大量重启和级联故障。

Spring Boot应用程序的内部状态主要由Spring ApplicationContext表示。 

如果应用程序上下文已成功启动，则Spring Boot会假定该应用程序处于有效状态。 

刷新上下文后，应用程序即被视为活动应用程序，请参阅 [Spring Boot应用程序生命周期和相关的应用程序事件](https://docs.spring.io/spring-boot/docs/2.4.1/reference/htmlsingle/#boot-features-application-events-and-listeners)。

## 准备状态

应用程序的“就绪”状态告诉应用程序是否已准备好处理流量。 

失败的“就绪”状态告诉平台当前不应将流量路由到应用程序。 

这通常发生在启动过程中，正在处理CommandLineRunner和ApplicationRunner组件时，或者在应用程序认为它太忙而无法获得额外流量的情况下。

一旦调用了应用程序和命令行运行程序，就认为该应用程序已准备就绪，请参阅Spring Boot应用程序生命周期和相关的应用程序事件。

### 定时任务

预期在启动期间运行的任务应由 `CommandLineRunner` 和 `ApplicationRunner` 组件执行，而不是使用Spring组件生命周期回调（如 `@PostConstruct`）执行。


# 管理应用程序可用性状态

通过注入ApplicationAvailability接口并在其上调用方法，应用程序组件可以随时检索当前的可用性状态。 

应用程序通常会希望监听状态更新或更新应用程序的状态。

例如，我们可以将应用程序的“就绪”状态导出到文件中，以便Kubernetes的 “exec Probe” 可以查看此文件：

```java
@Component
public class ReadinessStateExporter {

    @EventListener
    public void onStateChange(AvailabilityChangeEvent<ReadinessState> event) {
        switch (event.getState()) {
        case ACCEPTING_TRAFFIC:
            // create file /tmp/healthy
        break;
        case REFUSING_TRAFFIC:
            // remove file /tmp/healthy
        break;
        }
    }

}
```

当应用程序崩溃且无法恢复时，我们还可以更新应用程序的状态：

```java
@Component
public class LocalCacheVerifier {

    private final ApplicationEventPublisher eventPublisher;

    public LocalCacheVerifier(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    public void checkLocalCache() {
        try {
            //...
        }
        catch (CacheCompletelyBrokenException ex) {
            AvailabilityChangeEvent.publish(this.eventPublisher, ex, LivenessState.BROKEN);
        }
    }

}
```

# 应用程序事件和监听器

除了通常的Spring Framework事件（例如ContextRefreshedEvent）之外，SpringApplication还发送一些其他应用程序事件。

实际上在创建ApplicationContext之前会触发一些事件，因此您不能将这些事件注册为@Bean。 

您可以使用SpringApplication.addListeners（…）方法或SpringApplicationBuilder.listeners（…）方法注册它们。

如果希望这些侦听器自动注册，而不管创建应用程序的方式如何，都可以将 `META-INF/spring.factories` 文件添加到项目中，并使用 `org.springframework.context.ApplicationListener` 指定：

```
org.springframework.context.ApplicationListener=com.example.project.MyListener
```

应用程序事件在您的应用程序运行时按以下顺序发送：

1. ApplicationStartingEvent在运行开始时发送，但在进行任何处理之前（侦听器和初始化程序的注册除外）发送。

2. 当已知要在上下文中使用的环境但在创建上下文之前，将发送ApplicationEnvironmentPreparedEvent。

3. 准备ApplicationContext并调用ApplicationContextInitializers之后但在加载任何bean定义之前，将发送ApplicationContextInitializedEvent。

4. 在刷新开始之前但在加载bean定义之后发送ApplicationPreparedEvent。

5. 在刷新上下文之后但在调用任何应用程序和命令行运行程序之前，将发送ApplicationStartedEvent。

6. 紧随LivenessState.CORRECT之后发送AvailabilityChangeEvent，以指示该应用程序被视为处于活动状态。

7. 在调用任何应用程序和命令行运行程序之后，将发送ApplicationReadyEvent。

8. 随即在ReadinessState.ACCEPTING_TRAFFIC之后发送AvailabilityChangeEvent，以指示该应用程序已准备就绪，可以处理请求。

9. 如果启动时发生异常，则发送ApplicationFailedEvent。

上面的列表仅包含绑定到SpringApplication的SpringApplicationEvents。

除这些以外，以下事件也在ApplicationPreparedEvent之后和ApplicationStartedEvent之前发布：

1. WebServer准备就绪后，将发送WebServerInitializedEvent。 ServletWebServerInitializedEvent和ReactiveWebServerInitializedEvent分别是servlet和反应式变量。

2. 刷新ApplicationContext时，将发送ContextRefreshedEvent。

您通常不需要使用应用程序事件，但是很容易知道它们的存在。 

在内部，Spring Boot使用事件来处理各种任务。

默认情况下，事件侦听器不应在可能在同一线程中执行的任务上运行冗长的任务。 

考虑改用应用程序和命令行运行程序。

应用程序事件是通过使用Spring Framework的事件发布机制发送的。 

此机制的一部分确保在子级上下文中发布给侦听器的事件也在任何祖先上下文中也发布给侦听器。 结果，如果您的应用程序使用SpringApplication实例的层次结构，则侦听器可能会收到同一类型的应用程序事件的多个实例。

为了使您的侦听器能够区分其上下文的事件和后代上下文的事件，它应请求注入其应用程序上下文，然后将注入的上下文与事件的上下文进行比较。 

可以通过实现ApplicationContextAware来注入上下文，或者，如果侦听器是bean，则可以使用@Autowired注入上下文。

# web 环境

SpringApplication尝试代表您创建正确的ApplicationContext类型。 

用于确定WebApplicationType的算法如下：

1. 如果存在Spring MVC，则使用AnnotationConfigServletWebServerApplicationContext

2. 如果不存在Spring MVC而存在Spring WebFlux，则使用AnnotationConfigReactiveWebServerApplicationContext

3. 否则，将使用AnnotationConfigApplicationContext

这意味着，如果您在同一应用程序中使用Spring MVC和Spring WebFlux中的新WebClient，则默认情况下将使用Spring MVC。 

您可以通过调用setWebApplicationType（WebApplicationType）轻松覆盖它。

也可以完全控制通过调用setApplicationContextClass（…）使用的ApplicationContext类型。

在JUnit测试中使用SpringApplication时，通常希望调用 `setWebApplicationType(WebApplicationType.NONE)`。

# 访问应用程序参数

如果您需要访问传递给SpringApplication.run（...）的应用程序参数，则可以注入 `org.springframework.boot.ApplicationArguments` bean。 

ApplicationArguments接口提供对原始 String[] 参数以及已解析的选项和非选项参数的访问，如以下示例所示：

```java
import org.springframework.boot.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.stereotype.*;

@Component
public class MyBean {

    @Autowired
    public MyBean(ApplicationArguments args) {
        boolean debug = args.containsOption("debug");
        List<String> files = args.getNonOptionArgs();
        // if run with "--debug logfile.txt" debug=true, files=["logfile.txt"]
    }

}
```

Spring Boot还向Spring环境注册了CommandLinePropertySource。 

这样，您还可以使用@Value批注注入单个应用程序参数。

# 使用ApplicationRunner或CommandLineRunner

如果SpringApplication启动后需要运行一些特定的代码，则可以实现ApplicationRunner或CommandLineRunner接口。 

这两个接口以相同的方式工作并提供一个运行方法，该方法在SpringApplication.run（...）完成之前被调用。

该合同非常适合应在应用程序启动后但开始接受流量之前运行的任务。

CommandLineRunner接口提供对作为字符串数组的应用程序参数的访问，而ApplicationRunner使用前面讨论的ApplicationArguments接口。 

以下示例显示了带有run方法的CommandLineRunner：

```java
import org.springframework.boot.*;
import org.springframework.stereotype.*;

@Component
public class MyBean implements CommandLineRunner {

    public void run(String... args) {
        // Do something...
    }

}
```

如果定义了几个必须按特定顺序调用的CommandLineRunner或ApplicationRunner Bean，则可以另外实现org.springframework.core.Ordered接口或使用org.springframework.core.annotation.Order批注。

# 应用退出

每个SpringApplication向JVM注册一个关闭钩子，以确保ApplicationContext在退出时正常关闭。 

可以使用所有标准的Spring生命周期回调（例如DisposableBean接口或@PreDestroy批注）。

另外，如果bean希望在调用SpringApplication.exit()时返回特定的退出代码，则可以实现org.springframework.boot.ExitCodeGenerator接口。 

然后可以将此退出代码传递给System.exit()，以将其作为状态代码返回，如以下示例所示：

```java
@SpringBootApplication
public class ExitCodeApplication {

    @Bean
    public ExitCodeGenerator exitCodeGenerator() {
        return () -> 42;
    }

    public static void main(String[] args) {
        System.exit(SpringApplication.exit(SpringApplication.run(ExitCodeApplication.class, args)));
    }

}
```

另外，ExitCodeGenerator接口可以通过异常实现。 

遇到此类异常时，Spring Boot返回实现的getExitCode()方法提供的退出代码。

# 管理员功能

通过指定spring.application.admin.enabled属性，可以为应用程序启用与管理员相关的功能。 

这将在平台MBeanServer上公开SpringApplicationAdminMXBean。 

您可以使用此功能来远程管理Spring Boot应用程序。 

此功能对于任何服务包装器实现也可能有用。

如果您想知道应用程序在哪个HTTP端口上运行，请使用local.server.port键获取属性。

# 应用程序启动跟踪

在应用程序启动期间，SpringApplication和ApplicationContext执行许多与应用程序生命周期，bean生命周期甚至处理应用程序事件有关的任务。 

使用ApplicationStartup，Spring Framework允许您使用StartupSteps跟踪应用程序的启动顺序。 

可以收集这些数据以进行概要分析，或者只是为了更好地了解应用程序启动过程。

设置SpringApplication实例时，可以选择ApplicationStartup实现。 

例如，要使用BufferingApplicationStartup，可以编写：

```java
public static void main(String[] args) {
    SpringApplication app = new SpringApplication(MySpringConfiguration.class);
    app.setApplicationStartup(new BufferingApplicationStartup(2048));
    app.run(args);
}
```

Spring Framework提供了第一个可用的实现，FlightRecorderApplicationStartup。 

它将特定于Spring的启动事件添加到Java Flight Recorder会话中，旨在对应用程序进行性能分析并将其Spring上下文生命周期与JVM事件相关联（例如分配，GC，类加载...）。

配置完成后，您可以在启用了Flight Recorder的情况下通过运行应用程序来记录数据：

```
$ java -XX:StartFlightRecording:filename=recording.jfr,duration=10s -jar demo.jar
```

Spring Boot带有BufferingApplicationStartup变体。 

此实现旨在缓冲启动步骤，并将其排入外部度量标准系统。 

应用程序可以在任何组件中请求BufferingApplicationStartup类型的Bean。 

另外，Spring Boot Actuator将公开启动端点，以将此信息公开为JSON文档。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

我是老马，期待与你的下次重逢。

# 参考资料

https://docs.spring.io/spring-boot/docs/2.4.1/maven-plugin/reference/htmlsingle/#help

* any list
{:toc}
