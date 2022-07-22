---
layout: post
title: SOFATracer 介绍-02-quick start 快速开始
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, tracer, sh]
published: true
---

# 快速开始指南

SOFATracer 接入的组件列表参考：SOFATracer 介绍，在使用时请注意不同组件对应的SOFATracer 版本和 JDK 版本。

## 环境准备

要使用 SOFABoot，需要先准备好基础环境，SOFABoot 依赖以下环境： - JDK7 或 JDK8 - 需要采用 Apache Maven 3.2.5 或者以上的版本来编译

## 常见组件

Spring MVC 埋点接入

HttpClient 埋点接入

DataSource 埋点接入

RestTemplate 埋点接入

OkHttp 埋点接入

Dubbo 埋点接入

此处，以 spring mvc 作为例子。

# Spring MVC 埋点接入

在本文档将演示如何使用 SOFATracer 对 SpringMVC 进行埋点，本示例工程地址。

假设你已经基于 SOFABoot 构建了一个简单的 Spring Web 工程，那么可以通过如下步骤进行操作：

## 依赖引入

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>tracer-sofa-boot-starter</artifactId>
</dependency>
```

## 工程配置

在工程的 application.properties 文件下添加 SOFATracer 要使用的参数，包括spring.application.name 用于标示当前应用的名称；logging.path 用于指定日志的输出目录。

```
# Application Name
spring.application.name=SOFATracerSpringMVC
# logging path
logging.path=./logs
```

## 添加一个提供 RESTful 服务的 Controller

在工程代码中，添加一个简单的 Controller，例如：

```java
@RestController
public class SampleRestController {

    private static final String TEMPLATE = "Hello, %s!";
    private final AtomicLong    counter  = new AtomicLong();
    /**
     * http://localhost:8080/springmvc
     * @param name name
     * @return map
     */
    @RequestMapping("/springmvc")
    public Map<String, Object> springmvc(@RequestParam(value = "name", defaultValue = "SOFATracer SpringMVC DEMO") String name) {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        resultMap.put("success", true);
        resultMap.put("id", counter.incrementAndGet());
        resultMap.put("content", String.format(TEMPLATE, name));
        return resultMap;
    }
}
```

## 运行

启动 SOFABoot 应用，将会在控制台中看到启动打印的日志：

```
2018-05-11 11:55:11.932  INFO 66490 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'SpringMvcOpenTracingFilter' to urls: [/*]
2018-05-11 11:55:13.961  INFO 66490 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 8080 (http)
2018-05-11 11:55:13.970  INFO 66490 --- [           main] c.a.s.t.e.springmvc.DemoApplication      : Started DemoApplication in 8.361 seconds (JVM running for 9.34)
```

可以通过在浏览器中输入 http://localhost:8080/springmvc 来访问 REST 服务，结果类似如下：

```json
{
    content: "Hello, SOFATracer SpringMVC DEMO!",
    id: 1,
    success: true
}
```

## 查看日志

在上面的 application.properties 里面，我们配置的日志打印目录是 ./logs 即当前应用的根目录（我们可以根据自己的实践需要配置），在当前工程的根目录下可以看到类似如下结构的日志文件：

```
./logs
├── spring.log
└── tracelog
    ├── spring-mvc-digest.log
    ├── spring-mvc-stat.log
    ├── static-info.log
    └── tracer-self.log
```

通过访问 http://localhost:8080/springmvc SOFATracer 会记录每一次访问的摘要日志，可以打开 spring-mvc-digest.log 看到具体的输出内容。

```
{"time":"2019-09-03 10:33:10.336","local.app":"RestTemplateDemo","traceId":"0a0fe9271567477985327100211176","spanId":"0.1","span.kind":"server","result.code":"200","current.thread.name":"http-nio-8801-exec-2","time.cost.milliseconds":"5006ms","request.url":"http://localhost:8801/asyncrest","method":"GET","req.size.bytes":-1,"resp.size.bytes":0,"sys.baggage":"","biz.baggage":""}
```

# Spring MVC 日志

SOFATracer 集成 SpringMVC 后输出 MVC 请求的链路数据格式，默认为 JSON 数据格式。

## Spring MVC 摘要日志（spring-mvc-digest.log）

以 JSON 格式输出的数据，相应 key 的含义解释如下：

| key	                   | 表达含义 |
|:---|:---|
| time	               | 日志打印时间 |
| local.app	           | 当前应用名 |
| traceId	               | TraceId |
| spanId	               | SpanId |
| span.kind	           | Span 类型 |
| result.code            | 状态码 |
| current.thread.name	   | 当前线程名 |
| time.cost.milliseconds| span 耗时 |
| request.url	           | 请求地址 |
| method	               | http method |
| req.size.bytes	       | 请求大小 |
| resp.size.bytes	       | 响应大小 |
| sys.baggage	 |  系统透传的 baggage 数据 |
| biz.baggage	 |  业务透传的 baggage 数据 |

样例：

```json
{"time":"2019-09-03 10:33:10.336","local.app":"RestTemplateDemo","traceId":"0a0fe9271567477985327100211176","spanId":"0.1","span.kind":"server","result.code":"200","current.thread.name":"http-nio-8801-exec-2","time.cost.milliseconds":"5006ms","request.url":"http://localhost:8801/asyncrest","method":"GET","req.size.bytes":-1,"resp.size.bytes":0,"sys.baggage":"","biz.baggage":""}
```

## Spring MVC 统计日志（spring-mvc-stat.log）

stat.key 即本段时间内的统计关键字集合，统一关键字集合唯一确定一组统计数据，包含local.app、request.url、和 method 字段.

| key	                   | 表达含义 |
|:---|:---|
| time	               | 日志打印时间 |
| stat.key local.app	   | 当前应用名 |
| stat.key request.url	| 请求 URL |
| stat.key method	       | 请求 HTTP 方法 |
| count	               | 本段时间内请求次数 |
| total.cost.milliseconds | 本段时间内的请求总耗时（ms） |
| success	               | 请求结果：Y 表示成功(1 开头和 2 开头的结果码算是成功的，302表示的重定向算成功，其他算是失败的)；N 表示失败 |
| load.test	           | 压测标记：T 是压测；F 不是压测 |

样例：

```json
{"time":"2019-09-03 10:34:04.129","stat.key":{"method":"GET","local.app":"RestTemplateDemo","request.url":"http://localhost:8801/asyncrest"},"count":1,"total.cost.milliseconds":5006,"success":"true","load.test":"F"}
```

# 小结

针对不同的组件，达到开箱即用的作用。

（1）这个和自己的 auto-log 有什么区别？

auto-log 是针对日志的一种丰富。

（2）有什么值得学习的地方？

针对不同组件的提供定制化的实现，这一点值得学习。

对于数据的统计，在传统的 auto-log 中是缺失的。

（3）用途

tracer 虽然看起来是本地 log，但是可以结合网络通讯，将日志上送到服务器。

便于统一的监控。

# 参考资料

https://www.sofastack.tech/projects/sofa-tracer/component-access/

> [日志格式](https://www.sofastack.tech/projects/sofa-tracer/log-format-springmvc/)

* any list
{:toc}