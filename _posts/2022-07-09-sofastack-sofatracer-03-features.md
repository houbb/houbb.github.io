---
layout: post
title: SOFATracer 介绍-03-features 功能特性
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, tracer, sh]
published: true
---

# 应用日志打印 traceId 和 spanId

SLF4J 提供了 MDC （Mapped Diagnostic Contexts）功能，可以支持用户定义和修改日志的输出格式以及内容。

本文将介绍 SOFATracer 集成的 SLF4J MDC功能，方便用户在只简单修改日志配置文件的前提下输出当前 SOFATracer 上下文 TraceId 以及 SpanId 。

## 使用前提

为了在应用中的日志正确打印 TraceId 和 SpanId 参数，我们的日志编程接口需要面向 SLF4J 进行编程，即打印日志的编程接口不要依赖具体的日志实现。

```xml
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
</dependency>
```

## 引入依赖

如果是 SOFABoot 或者 Spring Boot 的应用具体的日志实现需要大家去引入，我们推荐的日志打印实现是 Logback 和 Log4j2，不推荐 Log4j，同时日志实现建议只使用一个而不要使用多个实现。

Logback 实现引入：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-logging</artifactId>
</dependency>
```

Log4j2 实现引入：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
    <!--SOFABoot 没有管控 log4j2 版本 -->
    <version>1.4.2.RELEASE</version>
</dependency>
```

## 配置方法

我们基于 SLF4J MDC 的原理打印对应的 TraceId 和 SpanId，首先我们的应用中的日志编程接口应该面向 SLF4J，如通过如下的方式：

```java
//引入接口
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

//构造日志打印实例
private static final Logger logger = LoggerFactory.getLogger(XXX.class);
```

其次，我们为了正确打印 TraceId 和 SpanId 参数，我们还需要在日志的配置文件中配置 PatternLayout 的额外参数，这两个参数是 `%X{SOFA-TraceId}` 和 `%X{SOFA-SpanId}`，参数值我们均是从 MDC 中获取的值。

### 以 Logback 为例配置的 pattern 参数：

```
<pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %5p  [%X{SOFA-TraceId},
%X{SOFA-SpanId}] 
---- %m%n</pattern>
```

关键配置项目：`[%X{SOFA-TraceId},%X{SOFA-SpanId}]` 作为 Logback pattern 的一部分，在对应的 appender 被调用的时候，会根据 pattern 中的占位符替换为当前线程上下文中 TraceId 和 SpanId 的具体值，当前线程中没有对应的 TraceId 和 SpanId 值时，会用“空字符串”替代。

### Log4j2 配置 PatternLayout 样例：

```
<PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} %5p 
[%X{SOFA-TraceId},%X{SOFA-SpanId}] ---- %m%n " />
```

### Log4j 配置 PatternLayout 样例：

```
<layout class="org.apache.log4j.PatternLayout">
    <param name="ConversionPattern" value="%d %-5p %-32t 
    [%X{SOFA-TraceId},%X{SOFA-SpanId}] - %m%n"/>
</layout>
```

需要注意的是：[%X{SOFA-TraceId},%X{SOFA-SpanId}] 使我们推荐的打印格式，用户可以根据自己的实际需求场景进行定制

# 异步线程处理

## 线程中使用 java.lang.Runnable

如果用户在代码中通过 java.lang.Runnable 新启动了线程或者采用了线程池去异步地处理一些业务，那么需要将 SOFATracer 日志上下文从父线程传递到子线程中去，SOFATracer 提供的 com.alipay.common.tracer.core.async.SofaTracerRunnable 默认完成了此操作，大家可以按照如下的方式使用：

```java
Thread thread = new Thread(new SofaTracerRunnable(new Runnable() {
    @Override
    public void run() {
        //do something your business code
    }
}));

thread.start();
```

## 线程中使用 java.util.concurrent.Callable

如果用户在代码中通过 java.util.concurrent.Callable 新启动线程或者采用了线程池去异步地处理一些业务，那么需要将 SOFATracer 日志上下文从父线程传递到子线程中去，SOFATracer 提供的 com.alipay.common.tracer.core.async.SofaTracerCallable 默认完成了此操作，大家可以按照如下的方式使用：

```java
ExecutorService executor = Executors.newCachedThreadPool();
 SofaTracerCallable<Object> sofaTracerSpanSofaTracerCallable = new SofaTracerCallable<Object>(new Callable<Object>() {
     @Override
     public Object call() throws Exception {
         return new Object();
     }
 });
 Future<Object> futureResult = executor.submit(sofaTracerSpanSofaTracerCallable);
 //do something in current thread
 Thread.sleep(1000);
 //another thread execute success and get result
 Object objectReturn = futureResult.get();
```

这个实例中，假设 java.util.concurrent.Callable 返回结果的对象类型是 java.lang.Object，实际使用时可以根据情况替换为期望的类型。

## SOFATracer 对线程池、异步调用场景下的支持

### 异步场景

异步调用，以 rpc 调用为例，每次 rpc 调用请求出去之后不会等待到结果返回之后才去发起下一次处理，这里有个时间差，在前一个 rpc 调用的 callback 回来之前，又一个新的 rpc 请求发起，此时当前线程中的 TracerContext 没有被清理，则 spanId 会自增，tracerId 相同。

对于上面这种情况，SOFATracer 在对于异步情况处理时，不会等到 callback 回来之后，调用 cr 阶段才会清理，而是提前就会清理当前线程的 tracerContext 上下文，从而来保证链路的正确性。

### 线程池

目前来说，不管是 SOFARPC 还是 Dubbo 的埋点实现，在使用单线程或者线程池时，情况是一样的：

同步调用，线程池中分配一个线程用于处理 rpc 请求，在请求结束之前会一直占用线程；此种情况下不会造成下一个 rpc 请求错拿上一个请求的 tracerContext 数据问题

异步调用，由于异步回调并非是在 callback 中来清理上下文，而是提前清理的，所以也不会存在数据串用问题。

callback 异步回调，这个本质上就是异步调用，所以处理情况和异步调用相同。

# Functional 接口支持

从 Java 8 中，Java 开始引入了各种 `@FunctionalInterface` 接口，以更好地支持函数式编程，通常，Java 的函数会在一个 ForkJoinPool 中执行，如果这个时候没有把 Tracer 的一些线程变量传递进去的话，就会造成 Trace 信息的丢失。

因此，在 SOFATracer XXX 版本中增加了对这些 `@FunctionalInterface` 接口的包装类，以确保 Trace 相关的信息能够正确地传递下面，下面以 Consumer 接口为例进行说明，只需要将原来构造 Consumer 的地方修改成构造 SofaTracerConsumer，并且将原来的 Consumer 传入作为 SofaTracerConsumer 的构造函数的参数即可：

```java
Consumer<String> consumer = new SofaTracerConsumer<>(System.out::println);
```

# 采样模式

目前 SOFATracer 提供了两种采样模式，一种是基于 BitSet 实现的基于固定采样率的采样模式；另外一种是提供给用户自定义实现采样的采样模式。

下面通过案例来演示如何使用。

本示例基于 tracer-sample-with-springmvc 工程；除 application.properties 之外，其他均相同。

## 基于固定采样率的采样模式

在 application.properties 中增加采样相关配置项

```
#采样率  0~100
com.alipay.sofa.tracer.samplerPercentage=100
#采样模式类型名称
com.alipay.sofa.tracer.samplerName=PercentageBasedSampler
```

### 验证方式

- 当采样率设置为100时，每次都会打印摘要日志。

- 当采样率设置为0时，不打印

- 当采样率设置为0~100之间时，按概率打印

以请求 10 次来验证下结果。

1、当采样率设置为100时，每次都会打印摘要日志

启动工程，浏览器中输入：http://localhost:8080/springmvc ；并且刷新地址10次，查看日志如下：

## 自定义采样模式

SOFATracer 中提供了一个采样率计算的接口 Sampler ，如果你需要定制化自己的采样策略，可通过实现此接口来进行扩展。

下面通过一个简单的Demo 来演示如何使用自定义采样模式。

### 自定义采样规则类

```java
public class CustomOpenRulesSamplerRuler implements Sampler {

    private static final String TYPE = "CustomOpenRulesSamplerRuler";

    @Override
    public SamplingStatus sample(SofaTracerSpan sofaTracerSpan) {
        SamplingStatus samplingStatus = new SamplingStatus();
        Map<String, Object> tags = new HashMap<String, Object>();
        tags.put(SofaTracerConstant.SAMPLER_TYPE_TAG_KEY, TYPE);
        tags = Collections.unmodifiableMap(tags);
        samplingStatus.setTags(tags);

        if (sofaTracerSpan.isServer()) {
            samplingStatus.setSampled(false);
        } else {
            samplingStatus.setSampled(true);
        }
        return samplingStatus;
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public void close() {
        // do nothing 
    }
}
```

在 sample 方法中，用户可以根据当前 sofaTracerSpan 提供的信息来决定是否进行打印。这个案例是通过判断 isServer 来决定是否采样，isServer=true,不采样，否则采样。

在 application.properties 中增加采样相关配置项

```
com.alipay.sofa.tracer.samplerName.samplerCustomRuleClassName=com.alipay.sofa.tracer.examples.springmvc.sampler.CustomOpenRulesSamplerRuler
```

相关实验结果，可以自行验证下。

# 上报数据至 Zipkin

在本文档将演示如何使用 SOFATracer 集成 Zipkin 进行数据上报展示。

假设你已经基于 SOFABoot 构建了一个简单的 Spring Web 工程，那么可以通过如下步骤进行操作：

下面的示例中将分别演示在 SOFABoot/SpringBoot 工程中 以及 非 SOFABoot/SpringBoot 工程中如何使用。

## 依赖引入

添加 SOFATracer 依赖

工程中添加 SOFATracer 依赖：

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>tracer-sofa-boot-starter</artifactId>
</dependency>
```

## 配置 Zipkin 依赖

考虑到 Zipkin 的数据上报能力不是 SOFATracer 默认开启的能力，所以期望使用 SOFATracer 做数据上报时，需要添加如下的 Zipkin 数据汇报的依赖：

```xml
<dependency>
     <groupId>io.zipkin.zipkin2</groupId>
     <artifactId>zipkin</artifactId>
     <version>2.11.12</version>
 </dependency>
 <dependency>
     <groupId>io.zipkin.reporter2</groupId>
     <artifactId>zipkin-reporter</artifactId>
     <version>2.7.13</version>
 </dependency>
```

## 配置文件

在工程的 application.properties 文件下添加一个 SOFATracer 要使用的参数，包括spring.application.name 用于标示当前应用的名称；logging.path 用于指定日志的输出目录。

```
# Application Name
spring.application.name=SOFATracerReportZipkin
# logging path
logging.path=./logs
com.alipay.sofa.tracer.zipkin.enabled=true
com.alipay.sofa.tracer.zipkin.baseUrl=http://localhost:9411
```

## 启动 Zipkin 服务端

启动 Zipkin 服务端用于接收 SOFATracer 汇报的链路数据，并做展示。Zipkin Server 的搭建可以参考此文档进行配置和服务端的搭建。

## 运行

可以将工程导入到 IDE 中运行生成的工程里面中的 main 方法启动应用，也可以直接在该工程的根目录下运行 `mvn spring-boot:run`，将会在控制台中看到启动日志：

```
2018-05-12 13:12:05.868  INFO 76572 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'SpringMvcSofaTracerFilter' to urls: [/*]
2018-05-12 13:12:06.543  INFO 76572 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/helloZipkin]}" onto public java.util.Map<java.lang.String, java.lang.Object> com.alipay.sofa.tracer.examples.zipkin.controller.SampleRestController.helloZipkin(java.lang.String)
2018-05-12 13:12:07.164  INFO 76572 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 8080 (http)
```

可以通过在浏览器中输入 http://localhost:8080/helloZipkin 来访问 REST 服务，结果类似如下：

```
{
    content: "Hello, SOFATracer Zipkin Remote Report!",
    id: 1,
    success: true
}
```

## 查看 Zipkin 服务端展示

打开 Zipkin 服务端界面，假设我们部署的 Zipkin 服务端的地址是 http://localhost:9411，打开 URL 并搜索 helloZipkin(由于我们本地访问的地址是 localhost:8080/helloZipkin)，可以看到展示的链路图。

## Spring 工程运行

对于一般的 Spring 工程，我们通常使用 tomcat/jetty 作为 servlet 容器来启动应用。具体工程参考 在 Spring 工程中使用 SOFATracer

# 手动埋点

SOFATracer 此前的埋点均是基于组件维度的埋点，用户很难在自己业务代码中进行埋点操作，或者增加自定义 tag 值来监控一些链路信息。

基于此，SOFATracer 从 2.4.1⁄3.0.6 版本开始支持手动埋点和基于注解的埋点方式，帮助用户解决自定义埋点问题。

## 使用方式

自定义埋点提供了两种方式，一种是手动埋点，一种是基于注解方式埋点。

### 手动埋点

手动埋点的方式遵循 opentracing 规范，SOFATracer 中通过 beforeInvoke 和 afterInvoke 两个函数封装了 span 的周期，如下：

```java
// 注入 tracer
@Autowired
Tracer tracer;

private void testManual(){
    try {
        // beforeInvoke 开始
        SofaTracerSpan sofaTracerSpan = ((FlexibleTracer) tracer).beforeInvoke("testManual");
        sofaTracerSpan.setTag("manualKey","glmapper");
        // do your biz

    } catch (Throwable t){
        // 异常结束
        ((FlexibleTracer) tracer).afterInvoke(t.getMessage());
    } finally {
        // 正常结束
        ((FlexibleTracer) tracer).afterInvoke();
    }
}
```

这种方式在使用上没有直接使用注解方便，但是可以直观的了解到 span 的生命周期，另外手动埋点也是对基于注解方式埋点的一种补充，下面介绍。

### 基于注解方式

SOFATracer 中提供了 `@Tracer` 注解，其作用域是 method 级别。

```java
// 在 hello 方法上使用 @Tracer 注解进行埋点
@Tracer
public String hello(String word){
    // 自定义 tag 数据
    SpanTags.putTags("author","glmapper");

    // 失效
    helloInner(word);

    return "glmapper : hello " + word;
}

// 在 hello 方法上使用 @Tracer 注解进行埋点
@Tracer
private String helloInner(String word){
    return "glmapper : hello " + word;
}
```

@Tracer 是基于 Spring Aop 实现，因此一定程度上依赖 Spring 中的代理机制。

如代码片段中所示，helloInner 方法由于执行过程中不会使用代理对象，而是 this，所以会导致 helloInner 的注解埋点失效。

那么对于此种情况，就可以使用手动埋点的方式来弥补。

SpanTags 是 SOFATracer 中提供的工具类，在使用注解或者手动埋点的情况下，可以通过此类提供的静态方法来设置 tag 。

## 日志格式

- json 格式

```json
{"time":"2019-09-05 10:23:53.549","local.app":"flexible-sample","traceId":"0a0fe9291567650233504100130712","spanId":"0.2","span.kind":"client","result.code":"","current.thread.name":"http-nio-8080-exec-1","time.cost.milliseconds":"4ms","method":"hello","param.types":"java.lang.String","author":"glmapper","sys.baggage":"","biz.baggage":""}
```

- 非 json 格式

```
2019-09-05 10:25:50.992,flexible-sample,0a0fe9291567650350953100130778,0.2,client,,http-nio-8080-exec-1,4ms,hello,param.types=java.lang.String&author=glmapper&,,
```

# 自定义 Reporter

在使用自定义埋点组件的情况下，用户可以选择自定义 Reporter。

## 自定义 Reporter 实现

```java
public class MyReporter implements Reporter {

    @Override
    public String getReporterType() {
        return "myReporter";
    }

    @Override
    public void report(SofaTracerSpan sofaTracerSpan) {
        // System.out 输出
        System.out.println("this is my custom reporter");
    }

    @Override
    public void close() {
        // ignore
    }
}
```

## 配置

```
com.alipay.sofa.tracer.reporter-name=com.glmapper.bridge.boot.flexible.MyReporter
```

自定义实现 Reporter 可以将业务埋点的日志输出到任何期望的地方。

# 参考资料

https://www.sofastack.tech/projects/sofa-tracer/print-traceid-spanid/

https://www.sofastack.tech/projects/sofa-tracer/functional-interface-support/

* any list
{:toc}