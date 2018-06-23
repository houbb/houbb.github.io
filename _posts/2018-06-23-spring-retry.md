---
layout: post
title:  Spring Retry
date:  2018-06-23 11:33:04 +0800
categories: [Spring]
tags: [spring, retry, sh]
published: true
---

# Spring Retry

[Spring Retry](https://github.com/spring-projects/spring-retry)为Spring应用程序提供了声明性重试支持。
它用于Spring批处理、Spring集成、Apache Hadoop(等等)的Spring。

## 使用场景

在分布式系统中，为了保证数据分布式事务的强一致性，大家在调用RPC接口或者发送MQ时，针对可能会出现网络抖动请求超时情况采取一下重试操作。
大家用的最多的重试方式就是MQ了，但是如果你的项目中没有引入MQ，那就不方便了。

还有一种方式，是开发者自己编写重试机制，但是大多不够优雅。

本文主要介绍一下如何使用Spring Retry实现重试操作


# 快速开始

## maven 引入

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.retry</groupId>
        <artifactId>spring-retry</artifactId>
    </dependency>

    <!--依赖于 aspectj-->
    <dependency>
        <groupId>org.aspectj</groupId>
        <artifactId>aspectjweaver</artifactId>
    </dependency>
</dependencies>
```
## 代码

### 项目结构

```
.
├── Application.java
├── controller
│   └── RetryController.java
└── service
    └── RemoteService.java
```

- RemoteService.java

```java
@Service
public class RemoteService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RemoteService.class);

    /**
     * 调用方法
     */
    @Retryable(value = RuntimeException.class,
               maxAttempts = 3,
               backoff = @Backoff(delay = 5000L, multiplier = 2))
    public void call() {
        LOGGER.info("Call something...");
        throw new RuntimeException("RPC调用异常");
    }

    /**
     * 补偿机制
     * @param e 异常
     */
    @Recover
    public void recover(RuntimeException e) {
        LOGGER.info("Start do recover things....");
        LOGGER.warn("We meet ex: ", e);
    }
}
```

- RetryController.java

```java
@RestController
@RequestMapping("/retry")
public class RetryController {

    private final RemoteService remoteService;

    @Autowired
    public RetryController(RemoteService remoteService) {
        this.remoteService = remoteService;
    }

    /**
     * 重试方法
     * @return http result
     */
    @RequestMapping("/")
    public ResponseEntity retry() {
        remoteService.call();
        return ResponseEntity.ok("you get it");
    }

}
```

- Application.java

用于启动项目:

```java
@SpringBootApplication
@EnableRetry
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        System.out.println("Start at http://localhost:18080/retry/");
    }

}
```

## 测试

启动 main() 方法之后，直接访问 [http://localhost:18080/retry/](http://localhost:18080/retry/)

- 日志

打印日志如下：

```
2018-06-23 11:30:39.993  INFO 6861 --- [io-18080-exec-1] c.g.h.s.b.retry.service.RemoteService    : Call something...
2018-06-23 11:30:44.997  INFO 6861 --- [io-18080-exec-1] c.g.h.s.b.retry.service.RemoteService    : Call something...
2018-06-23 11:30:55.000  INFO 6861 --- [io-18080-exec-1] c.g.h.s.b.retry.service.RemoteService    : Call something...
2018-06-23 11:30:55.000  INFO 6861 --- [io-18080-exec-1] c.g.h.s.b.retry.service.RemoteService    : Start do recover things....
2018-06-23 11:30:55.008  WARN 6861 --- [io-18080-exec-1] c.g.h.s.b.retry.service.RemoteService    : We meet ex: 

java.lang.RuntimeException: RPC调用异常
	...
```

- 说明

可见一共重试了 3 次调用，并且最后会调用我们定义的 `recover()` 方法

# 注解说明

## @EnableRetry

表示是否开始重试。

| 序号 | 属性 | 类型 | 默认值 |  说明 |
| 1 | proxyTargetClass | boolean | false | 指示是否要创建基于子类的(CGLIB)代理，而不是创建标准的基于Java接口的代理。|

## @Retryable

标注此注解的方法在发生异常时会进行重试

| 序号 | 属性 | 类型 | 默认值 |  说明 |
| 1 | interceptor | String | "" | 将 interceptor 的 bean 名称应用到 retryable() |
| 2 | value | Class[] | {} | 可重试的异常类型。 |
| 3 | label | String | "" | 统计报告的唯一标签。如果没有提供，调用者可以选择忽略它，或者提供默认值。 |
| 4 | maxAttempts | int | 3 | 尝试的最大次数(包括第一次失败)，默认为3次。 |
| 5 | backoff | @Backoff | @Backoff() | 指定用于重试此操作的backoff属性。默认为空 |

### @Backoff

| 序号 | 属性 | 类型 | 默认值 |  说明 |
| 1 | delay | long | 0 | 如果不设置则默认使用 1000 milliseconds | 重试等待 |
| 2 | maxDelay | long | 0 |  最大重试等待时间 |
| 3 | multiplier | long | 0 | 用于计算下一个延迟延迟的乘数(大于0生效) |
| 4 | random | boolean | false | 随机重试等待时间 |

## @Recover

用于恢复处理程序的方法调用的注释。一个合适的复苏handler有一个类型为可投掷(或可投掷的子类型)的第一个参数
和返回与`@Retryable`方法相同的类型的值。
可抛出的第一个参数是可选的(但是没有它的方法只会被调用)。
从失败方法的参数列表按顺序填充后续的参数。

# 项目地址

> [spring-boot-retry](https://github.com/houbb/spring-boot/tree/master/spring-boot-retry)

* any list
{:toc}







