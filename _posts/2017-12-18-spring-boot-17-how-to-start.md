---
layout: post
title:  Spring Boot-17-springboot 启动原理详解
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# springboot 启动原理

springboot 常见的启动写法如下:

```java
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

然后我们的程序就可以和 main 方法一样，直接启动运行了。

但是这一切是如何实现的呢？

今天我们一起来学习一下 springboot 的启动原理。

# SpringApplication.run 方法

main 方法整体看起来看起来平平无奇。

![平平无奇](https://images.gitee.com/uploads/images/2020/1212/161920_cc210db7_508704.jpeg "平平无奇.jpg")

SpringApplication.run() 让我意识到问题并不简单，我们一起看一下 run 里面到底是如何实现的。

```java
public static ConfigurableApplicationContext run(Object source, String... args) {
	return run(new Object[] { source }, args);
}
```

这里调用了另外一个方法：

```java
public static ConfigurableApplicationContext run(Object[] sources, String[] args) {
	return new SpringApplication(sources).run(args);
}
```

这里实际上是创建了 SpringApplication 对象，并且执行 run 方法。

## SpringApplication 

我们简单看一下这个对象。

```java
public SpringApplication(Object... sources) {
	initialize(sources);
}
```

这里主要是针对 spring 的初始化：

```java
private void initialize(Object[] sources) {
	if (sources != null && sources.length > 0) {
		this.sources.addAll(Arrays.asList(sources));
	}
	this.webEnvironment = deduceWebEnvironment();
	setInitializers((Collection) getSpringFactoriesInstances(
			ApplicationContextInitializer.class));
	setListeners((Collection) getSpringFactoriesInstances(ApplicationListener.class));
	this.mainApplicationClass = deduceMainApplicationClass();
}
```

设置了一些初始化实现、监听器等，此处不做详细展开。

## run 方法

构建完成之后，需要调用对应的 run 方法，这个方法是比较复杂的，不过也不用太紧张，有兴趣的可以深入研究一下。

```java
/**
 * Run the Spring application, creating and refreshing a new
 * {@link ApplicationContext}.
 * @param args the application arguments (usually passed from a Java main method)
 * @return a running {@link ApplicationContext}
 */
public ConfigurableApplicationContext run(String... args) {
	StopWatch stopWatch = new StopWatch();
	stopWatch.start();
	ConfigurableApplicationContext context = null;
	FailureAnalyzers analyzers = null;
	configureHeadlessProperty();
	SpringApplicationRunListeners listeners = getRunListeners(args);
	listeners.starting();
	try {
		ApplicationArguments applicationArguments = new DefaultApplicationArguments(
				args);
		ConfigurableEnvironment environment = prepareEnvironment(listeners,
				applicationArguments);
		Banner printedBanner = printBanner(environment);
		context = createApplicationContext();
		analyzers = new FailureAnalyzers(context);
		prepareContext(context, environment, listeners, applicationArguments,
				printedBanner);
		refreshContext(context);
		afterRefresh(context, applicationArguments);
		listeners.finished(context, null);
		stopWatch.stop();
		if (this.logStartupInfo) {
			new StartupInfoLogger(this.mainApplicationClass)
					.logStarted(getApplicationLog(), stopWatch);
		}
		return context;
	}
	catch (Throwable ex) {
		handleRunFailure(context, listeners, analyzers, ex);
		throw new IllegalStateException(ex);
	}
}
```

我们这里大概梳理一下启动过程的步骤：

```
1. 初始化监听器，以及添加到SpringApplication的自定义监听器。

2. 发布ApplicationStartedEvent事件，如果想监听ApplicationStartedEvent事件，你可以这样定义：public class ApplicationStartedListener implements ApplicationListener，然后通过SpringApplication.addListener(..)添加进去即可。

3. 装配参数和环境，确定是web环境还是非web环境。

4. 装配完环境后，就触发ApplicationEnvironmentPreparedEvent事件。

5. 如果SpringApplication的showBanner属性被设置为true，则打印启动的Banner。

6. 创建ApplicationContext，会根据是否是web环境，来决定创建什么类型的ApplicationContext。

7. 装配Context的环境变量，注册Initializers、beanNameGenerator等。

8. 发布ApplicationPreparedEvent事件。

9. 注册springApplicationArguments、springBootBanner，加载资源等

10. 遍历调用所有SpringApplicationRunListener的contextLoaded()方法。

11. 调用ApplicationContext的refresh()方法,装配context beanfactory等非常重要的核心组件。

12. 查找当前ApplicationContext中是否注册有CommandLineRunner，如果有，则遍历执行它们。

13. 发布ApplicationReadyEvent事件，启动完毕，表示服务已经可以开始正常提供服务了。通常我们这里会监听这个事件来打印一些监控性质的日志，表示应用正常启动了。
```

![启动流程](https://images.gitee.com/uploads/images/2020/1212/160017_b2eae1d8_508704.png "屏幕截图.png")

# @SpringBootApplication 注解

看完了静态方法，我们来看一下另一个注解 `@SpringBootApplication`。

## 注解定义

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = {
		@Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
		@Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication {
    // 省略方法
}
```


我们省略掉对应的方法属性，发现实际上这个注解是由 3 个注解组合而成：

```java
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan
```

其中 `@SpringbootConfiguration` 是完全等价于 `@Configuration` 的，此处应该是为了和 spring 的注解做区分。


所以一开始的实现，等价于：

```java
@Configuration
@EnableAutoConfiguration
@ComponentScan
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

当然了， springboot 的理念就是极简配置，能少些一行代码，就少写一行代码！

## @Configuration 注解

这里的 `@Configuration` 大家应该并不陌生，spring 中可以使用下面的写法，替代 spring xml 的配置写法：

```java
@Configuration
public class MockConfiguration{
    @Bean
    public MockService mockService(){
        return new MockServiceImpl(dependencyService());
    }
    
    @Bean
    public DependencyService dependencyService(){
        return new DependencyServiceImpl();
    }
}
```

## @ComponentScan 注解

`@ComponentScan` 的功能其实就是自动扫描并加载符合条件的组件（比如 `@Component` 和 `@Service`等）或者bean定义，最终将这些bean定义加载到IoC容器中。

我们可以通过basePackages等属性来细粒度的定制@ComponentScan自动扫描的范围，如果不指定，则默认Spring框架实现会从声明 `@ComponentScan` 所在类的package进行扫描。

ps: 所以我们的 Application 启动类一般是放在根目录，这样连扫描的包也省略掉了。

## @EnableAutoConfiguration 注解

这个注解我们放在最后讲解，因为它为 springboot 带来了更多的便利性。

### 注解定义

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage
@Import(EnableAutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration {}
```

这个注解实际上是一个组合注解 @AutoConfigurationPackage + @Import

@AutoConfigurationPackage：自动配置包

@Import: 导入自动配置的组件

我们来看一下这 2 个注解：

### @AutoConfigurationPackage 注解

这个注解主要是通过 @Import 注解导入了 `AutoConfigurationPackages.Registrar.class` 类。

实现如下：

```java
/**
 * {@link ImportBeanDefinitionRegistrar} to store the base package from the importing
 * configuration.
 * @author 老马啸西风
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
static class Registrar implements ImportBeanDefinitionRegistrar, DeterminableImports {
	@Override
	public void registerBeanDefinitions(AnnotationMetadata metadata,
			BeanDefinitionRegistry registry) {
		register(registry, new PackageImport(metadata).getPackageName());
	}
	@Override
	public Set<Object> determineImports(AnnotationMetadata metadata) {
		return Collections.<Object>singleton(new PackageImport(metadata));
	}
}
```

它其实是注册了一个Bean的定义。

`new PackageImport(metadata).getPackageName()`，它其实返回了当前主程序类的同级以及子级的包组件。

### @Import(EnableAutoConfigurationImportSelector.class)

我们来看一下另外一个注解，@Import(EnableAutoConfigurationImportSelector.class)。

EnableAutoConfigurationImportSelector 实现如下：

```java
public class EnableAutoConfigurationImportSelector
		extends AutoConfigurationImportSelector {

	@Override
	protected boolean isEnabled(AnnotationMetadata metadata) {
		if (getClass().equals(EnableAutoConfigurationImportSelector.class)) {
			return getEnvironment().getProperty(
					EnableAutoConfiguration.ENABLED_OVERRIDE_PROPERTY, Boolean.class,
					true);
		}
		return true;
	}

}
```

这个方法一眼看上去也是平平无奇，因为核心实现都在父类中。

最核心的方法如下：

```java
@Override
public String[] selectImports(AnnotationMetadata annotationMetadata) {
    // 不启用，直接返回无导入
	if (!isEnabled(annotationMetadata)) {
		return NO_IMPORTS;
	}
	try {
		AutoConfigurationMetadata autoConfigurationMetadata = AutoConfigurationMetadataLoader
				.loadMetadata(this.beanClassLoader);
		AnnotationAttributes attributes = getAttributes(annotationMetadata);

        // 这一行回去加载 springboot 指定的文件
		List<String> configurations = getCandidateConfigurations(annotationMetadata,
				attributes);
		configurations = removeDuplicates(configurations);
		configurations = sort(configurations, autoConfigurationMetadata);
		Set<String> exclusions = getExclusions(annotationMetadata, attributes);
		checkExcludedClasses(configurations, exclusions);
		configurations.removeAll(exclusions);
		configurations = filter(configurations, autoConfigurationMetadata);
		fireAutoConfigurationImportEvents(configurations, exclusions);
		return configurations.toArray(new String[configurations.size()]);
	}
	catch (IOException ex) {
		throw new IllegalStateException(ex);
	}
}
```

我们用过的各种 springboot-starter，使用起来引入一个 jar 就可以使用了。

都要归功于下面这个方法：

```java
// 这一行回去加载 springboot 指定的文件
List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes);
```

这里实际上回去解析一个文件：

```java
Enumeration<URL> urls = classLoader != null ? classLoader.getResources("META-INF/spring.factories") : ClassLoader.getSystemResources("META-INF/spring.factories");
```

这也就是我们在开发自己的 springboot-starter 时，为什么需要把自己的启动类放在 `META-INF/spring.factories` 文件中的原因，这样就可以被 springboot 加载，并且生效了。

推荐阅读：

> [Spring Boot-11-自定义 springboot starter](https://houbb.github.io/2017/12/19/spring-boot-11-define-starter)

# 实战分析

我们启动一个测试类，简单分析一下日志：

```
2020-12-12 16:05:57.516  INFO [] 9980 --- [           main] com.github.houbb.ums.UmsApplication      : Starting UmsApplication on hackerone with PID 9980 
2020-12-12 16:05:57.522  INFO [] 9980 --- [           main] com.github.houbb.ums.UmsApplication      : No active profile set, falling back to default profiles: default
2020-12-12 16:05:57.817  INFO [] 9980 --- [kground-preinit] o.h.validator.internal.util.Version      : HV000001: Hibernate Validator 5.3.6.Final
2020-12-12 16:05:57.966  INFO [] 9980 --- [           main] ationConfigEmbeddedWebApplicationContext : Refreshing org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@17e949d: startup date [Sat Dec 12 16:05:57 CST 2020]; root of context hierarchy
2020-12-12 16:06:01.585  INFO [] 9980 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat initialized with port(s): 8080 (http)
2020-12-12 16:06:01.615  INFO [] 9980 --- [           main] o.a.coyote.http11.Http11NioProtocol      : Initializing ProtocolHandler ["http-nio-8080"]
2020-12-12 16:06:01.653  INFO [] 9980 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2020-12-12 16:06:01.653  INFO [] 9980 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet Engine: Apache Tomcat/8.5.29
2020-12-12 16:06:01.958  INFO [] 9980 --- [ost-startStop-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2020-12-12 16:06:01.959  INFO [] 9980 --- [ost-startStop-1] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 3993 ms
2020-12-12 16:06:02.774  INFO [] 9980 --- [ost-startStop-1] o.s.b.w.servlet.ServletRegistrationBean  : Mapping servlet: 'dispatcherServlet' to [/]
2020-12-12 16:06:02.786  INFO [] 9980 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'characterEncodingFilter' to: [/*]
2020-12-12 16:06:02.786  INFO [] 9980 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'hiddenHttpMethodFilter' to: [/*]
2020-12-12 16:06:02.787  INFO [] 9980 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'httpPutFormContentFilter' to: [/*]
2020-12-12 16:06:02.787  INFO [] 9980 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'requestContextFilter' to: [/*]
2020-12-12 16:06:08.159  INFO [] 9980 --- [           main] s.w.s.m.m.a.RequestMappingHandlerAdapter : Looking for @ControllerAdvice: org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@17e949d: startup date [Sat Dec 12 16:05:57 CST 2020]; root of context hierarchy
2020-12-12 16:06:08.549  INFO [] 9980 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/error]}" onto public org.springframework.http.ResponseEntity<java.util.Map<java.lang.String, java.lang.Object>> org.springframework.boot.autoconfigure.web.BasicErrorController.error(javax.servlet.http.HttpServletRequest)
2020-12-12 16:06:08.549  INFO [] 9980 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/error],produces=[text/html]}" onto public org.springframework.web.servlet.ModelAndView org.springframework.boot.autoconfigure.web.BasicErrorController.errorHtml(javax.servlet.http.HttpServletRequest,javax.servlet.http.HttpServletResponse)
2020-12-12 16:06:08.791  INFO [] 9980 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/webjars/**] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2020-12-12 16:06:08.791  INFO [] 9980 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/**] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2020-12-12 16:06:08.962  INFO [] 9980 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/**/favicon.ico] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2020-12-12 16:06:11.289  INFO [] 9980 --- [           main] o.s.j.e.a.AnnotationMBeanExporter        : Registering beans for JMX exposure on startup
2020-12-12 16:06:11.292  INFO [] 9980 --- [           main] o.s.j.e.a.AnnotationMBeanExporter        : Bean with name 'dataSource' has been autodetected for JMX exposure
2020-12-12 16:06:11.301  INFO [] 9980 --- [           main] o.s.j.e.a.AnnotationMBeanExporter        : Located MBean 'dataSource': registering with JMX server as MBean [com.alibaba.druid.spring.boot.autoconfigure:name=dataSource,type=DruidDataSourceWrapper]
2020-12-12 16:06:11.314  INFO [] 9980 --- [           main] o.a.coyote.http11.Http11NioProtocol      : Starting ProtocolHandler ["http-nio-8080"]
2020-12-12 16:06:11.334  INFO [] 9980 --- [           main] o.a.tomcat.util.net.NioSelectorPool      : Using a shared selector for servlet write/read
2020-12-12 16:06:11.369  INFO [] 9980 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 8080 (http)
2020-12-12 16:06:11.378  INFO [] 9980 --- [           main] com.github.houbb.ums.UmsApplication      : Started UmsApplication in 14.614 seconds (JVM running for 16.85)
```

主要步骤如下：

```
- 查找active profile，无，设为default。

- 刷新上下文。

- 初始化tomcat，设置端口8080，设置访问方式为http。

- 启动tomcat服务。

- 启动Servlet引擎。

- Spring内嵌的WebApplicationContext 初始化开始。

- Spring内嵌的WebApplicationContext 初始化完成。

- 映射servlet，将 dispatcherServlet 映射到 [/] 。

- 映射filter，将 characterEncodingFilter 映射到 [/*] 。

- 映射filter，将 hiddenHttpMethodFilter 映射到 [/*] 。

- 映射filter，将 httpPutFormContentFilter 映射到 [/*] 。

- 映射filter，将 requestContextFilter 映射到 [/*] 。

- 查找 @ControllerAdvice。

- 映射路径 "{[/]}" 到 cn.larry.spring.controller.SampleController.home()。

- 映射路径 "{[/error]}" 到 org.springframework.boot.autoconfigure.web.BasicErrorController.error(javax.servlet.http.HttpServletRequest)。

- 映射路径 "{[/error],produces=[text/html]}" 到 org.springframework.web.servlet.ModelAndView org.springframework.boot.autoconfigure.web.BasicErrorController.errorHtml(javax.servlet.http.HttpServletRequest,javax.
servlet.http.HttpServletResponse)。

- tomcat启动完毕。

- SampleController启动耗费的时间。

- 初始化 dispatcherServlet 。

- dispatcherServlet 的初始化已启动。

- dispatcherServlet 的初始化已完成。

- 收到shutdown关闭请求。

- 关闭AnnotationConfigEmbeddedWebApplicationContext。
```

# 小结

到这里，springboot 的启动原理就讲解的差不多了。

springboot 和以前的 spring xml 配置相比较，确实简化了太多太多。

让我们可以更加快速，正确的启动一个 java web 程序。

未来的发展历程也必然是这样，**谁更加简单便捷，谁能提升效率，就是谁的天下**。这就是老马的效率第一定律。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

期待与你的下次重逢。

# 参考资料

[一文搞懂springboot启动原理](https://www.jianshu.com/p/943650ab7dfd)

[springboot原理(核心原理，启动流程)](http://www.51gjie.com/javaweb/1041.html)

* any list
{:toc}
