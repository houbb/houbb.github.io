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

## 代码示例

- SimpleDemo.java

简单例子

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.retry.RecoveryCallback;
import org.springframework.retry.RetryCallback;
import org.springframework.retry.RetryContext;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;

public class SimpleDemo {

    private static final Logger LOGGER = LoggerFactory.getLogger(SimpleDemo.class);

    public static void main(String[] args) throws Exception {
        RetryTemplate template = new RetryTemplate();

        // 策略
        SimpleRetryPolicy policy = new SimpleRetryPolicy();
        policy.setMaxAttempts(2);
        template.setRetryPolicy(policy);

        String result = template.execute(
                new RetryCallback<String, Exception>() {
                    @Override
                    public String doWithRetry(RetryContext arg0) {
                        throw new NullPointerException();
                    }
                }
                ,
                new RecoveryCallback<String>() {
                    @Override
                    public String recover(RetryContext context) {
                        return "recovery callback";
                    }
                }
        );

        LOGGER.info("result: {}", result);
    }

}
```

- 运行结果

```
01:20:02.750 [main] DEBUG org.springframework.retry.support.RetryTemplate - Retry: count=0
01:20:02.759 [main] DEBUG org.springframework.retry.support.RetryTemplate - Checking for rethrow: count=1
01:20:02.760 [main] DEBUG org.springframework.retry.support.RetryTemplate - Retry: count=1
01:20:02.761 [main] DEBUG org.springframework.retry.support.RetryTemplate - Checking for rethrow: count=2
01:20:02.761 [main] DEBUG org.springframework.retry.support.RetryTemplate - Retry failed last attempt: count=2
01:20:02.761 [main] INFO com.github.houbb.retry.spring.commonway.SimpleDemo - result: recovery callback
```

# 类结构说明

![2018-08-08-spring-retry.jpg](https://raw.githubusercontent.com/houbb/resource/master/img/spring/2018-08-08-spring-retry.jpg)

## 概览

- RetryCallback: 封装你需要重试的业务逻辑（上文中的doSth）

- RecoverCallback：封装在多次重试都失败后你需要执行的业务逻辑(上文中的doSthWhenStillFail)

- RetryContext: 重试语境下的上下文，可用于在多次Retry或者Retry 和Recover之间传递参数或状态（在多次doSth或者doSth与doSthWhenStillFail之间传递参数）

- RetryOperations : 定义了“重试”的基本框架（模板），要求传入RetryCallback，可选传入RecoveryCallback；

- RetryListener：典型的“监听者”，在重试的不同阶段通知“监听者”（例如doSth，wait等阶段时通知）

- RetryPolicy : 重试的策略或条件，可以简单的进行多次重试，可以是指定超时时间进行重试（上文中的someCondition）

- BackOffPolicy: 重试的回退策略，在业务逻辑执行发生异常时。如果需要重试，我们可能需要等一段时间(可能服务器过于繁忙，如果一直不间隔重试可能拖垮服务器)，
当然这段时间可以是 0，也可以是固定的，可以是随机的（参见tcp的拥塞控制算法中的回退策略）。回退策略在上文中体现为wait()；

- RetryTemplate :RetryOperations的具体实现，组合了RetryListener[]，BackOffPolicy，RetryPolicy。

## 核心功能

为了使处理更加健壮且不容易失败，有时它可以帮助自动重试失败的操作，以防在后续尝试中可能成功。

易受这种处理影响的错误本质上是暂时的。

例如，由于网络故障或数据库更新中的DeadLockLoserException而导致web服务或RMI服务失败的远程调用可能在短时间等待后自动解决。

为了自动化这些操作的重试，Spring批处理采用了重试操作策略。


### RetryOperations

RetryOperations界面如下:

```java
public interface RetryOperations {

    <T> T execute(RetryCallback<T> retryCallback) throws Exception;

    <T> T execute(RetryCallback<T> retryCallback, RecoveryCallback<T> recoveryCallback)
        throws Exception;

    <T> T execute(RetryCallback<T> retryCallback, RetryState retryState)
        throws Exception, ExhaustedRetryException;

    <T> T execute(RetryCallback<T> retryCallback, RecoveryCallback<T> recoveryCallback,
        RetryState retryState) throws Exception;

}
```

### RetryCallback

基本回调是一个简单的接口，允许您插入一些业务逻辑以重试:

```java
public interface RetryCallback<T> {

    T doWithRetry(RetryContext context) throws Throwable;

}
```

回调被执行，如果它失败(通过抛出异常)，它将被重试，直到它成功，或者实现决定中止。

在RetryOperations接口中有许多重载的执行方法，当所有的重试尝试都结束时，它们处理各种用于恢复的用例，以及重试状态(允许客户机和实现在调用之间存储信息)。

## 重试策略

### RetryPolicy

```java
public interface RetryPolicy extends Serializable {

    boolean canRetry(RetryContext context);

    RetryContext open(RetryContext parent);

    void close(RetryContext context);

    void registerThrowable(RetryContext context, Throwable throwable);

}
```

canRetry 在每次重试的时候调用，是否可以继续重试的判断条件 

open 重试开始前调用，会创建一个重试上下文到RetryContext，保存重试的堆栈等信息 
registerThrowable 每次重试异常时调用（有异常会继续重试）

以 SimpleRetryPolicy 为例，当重试次数达到3（默认3次）停止重试，重试次数保存在重试上下文中。

### 常见策略

- NeverRetryPolicy：只允许调用RetryCallback一次，不允许重试

- AlwaysRetryPolicy：允许无限重试，直到成功，此方式逻辑不当会导致死循环

- SimpleRetryPolicy：固定次数重试策略，默认重试最大次数为3次，RetryTemplate默认使用的策略

- TimeoutRetryPolicy：超时时间重试策略，默认超时时间为1秒，在指定的超时时间内允许重试

- ExceptionClassifierRetryPolicy：设置不同异常的重试策略，类似组合重试策略，区别在于这里只区分不同异常的重试

- CircuitBreakerRetryPolicy：有熔断功能的重试策略，需设置3个参数openTimeout、resetTimeout和delegate

- CompositeRetryPolicy：组合重试策略，有两种组合方式，乐观组合重试策略是指只要有一个策略允许重试即可以，
悲观组合重试策略是指只要有一个策略不允许重试即可以，但不管哪种组合方式，组合中的每一个策略都会执行

## 重试回退策略

重试回退策略，指的是每次重试是立即重试还是等待一段时间后重试。

默认情况下是立即重试，如果需要配置等待一段时间后重试则需要指定回退策略BackoffRetryPolicy。

- NoBackOffPolicy：无退避算法策略，每次重试时立即重试

- FixedBackOffPolicy：固定时间的退避策略，需设置参数sleeper和backOffPeriod，sleeper指定等待策略，默认是Thread.sleep，即线程休眠，backOffPeriod指定休眠时间，默认1秒

- UniformRandomBackOffPolicy：随机时间退避策略，需设置sleeper、minBackOffPeriod和maxBackOffPeriod，该策略在[minBackOffPeriod,maxBackOffPeriod之间取一个随机休眠时间，minBackOffPeriod默认500毫秒，maxBackOffPeriod默认1500毫秒

- ExponentialBackOffPolicy：指数退避策略，需设置参数sleeper、initialInterval、maxInterval和multiplier，initialInterval指定初始休眠时间，默认100毫秒，maxInterval指定最大休眠时间，默认30秒，multiplier指定乘数，即下一次休眠时间为当前休眠时间*multiplier

- ExponentialRandomBackOffPolicy：随机指数退避策略，引入随机乘数可以实现随机乘数回退


## 有状态重试 OR 无状态重试

所谓无状态重试是指重试在一个线程上下文中完成的重试，反之不在一个线程上下文完成重试的就是有状态重试。
之前的SimpleRetryPolicy就属于无状态重试，因为重试是在一个循环中完成的。那么什么会后会出现或者说需要有状态重试呢？通常有两种情况：事务回滚和熔断。

数据库操作异常DataAccessException，不能执行重试，而如果抛出其他异常可以重试。

熔断的意思不在当前循环中处理重试，而是全局重试模式（不是线程上下文）。
熔断会跳出循环，那么必然会丢失线程上下文的堆栈信息。
那么肯定需要一种“全局模式”保存这种信息，目前的实现放在一个cache（map实现的）中，下次从缓存中获取就能继续重试了。

# 注解

## 项目结构

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


# 修改参数的值

如果我们想在重试的时候修改其中的值，应该怎么做呢？(比如每次的重试次数这个属性都想进行递增设置)

[java-configuration-for-retry-proxies](https://github.com/spring-projects/spring-retry#java-configuration-for-retry-proxies)

## 代码

- CbTime.java

意在模拟一个请求入参。

```java
public class CbTime {

    private int time;

    private int msg;

    public int getTime() {
        return time;
    }

    public void setTime(int time) {
        this.time = time;
    }

    public int getMsg() {
        return msg;
    }

    public void setMsg(int msg) {
        this.msg = msg;
    }

    @Override
    public String toString() {
        return "CbTime{" +
                "time=" + time +
                ", msg=" + msg +
                '}';
    }
}
```

- TimeService.java

模拟重试次数的服务。

```java
import com.github.houbb.spring.boot.retry.model.CbTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

@Service
public class TimeService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TimeService.class);

    /**
     * 调用方法
     */
    @Retryable(value = RuntimeException.class,
               maxAttempts = 5,
               backoff = @Backoff(delay = 2000L, multiplier = 1.5))
    public void call(CbTime cbTime) {
        LOGGER.info("Call " + cbTime);
        cbTime.setTime(cbTime.getTime() + 1);
        throw new RuntimeException();
    }

    /**
     * 补偿机制
     *
     * @param e 异常
     */
    @Recover
    public void recover(RuntimeException e, CbTime cbTime) {
        LOGGER.info("开始处理回复工作: " + cbTime);
        LOGGER.warn("We meet ex: ", e);
    }

}
```

- 

```java
@RestController
@RequestMapping("/retry")
public class RetryController {

    private final RemoteService remoteService;

    private final TimeService timeService;

    @Autowired
    public RetryController(RemoteService remoteService, TimeService timeService) {
        this.remoteService = remoteService;
        this.timeService = timeService;
    }

    /**
     * 重试方法
     * @return http result
     */
    @RequestMapping("/time")
    public ResponseEntity retryTime() {
        CbTime cbTime = new CbTime();
        cbTime.setTime(1);
        cbTime.setMsg(0);
        timeService.call(cbTime);
        return ResponseEntity.ok("you get it");
    }

}
```

## 测试

页面请求 [http://localhost:18080/retry/time](http://localhost:18080/retry/time)

- 测试日志

```
2018-07-23 12:58:18.735  INFO 849 --- [io-18080-exec-1] c.g.h.s.boot.retry.service.TimeService   : Call CbTime{time=1, msg=0}
2018-07-23 12:58:20.739  INFO 849 --- [io-18080-exec-1] c.g.h.s.boot.retry.service.TimeService   : Call CbTime{time=2, msg=0}
2018-07-23 12:58:23.742  INFO 849 --- [io-18080-exec-1] c.g.h.s.boot.retry.service.TimeService   : Call CbTime{time=3, msg=0}
2018-07-23 12:58:28.244  INFO 849 --- [io-18080-exec-1] c.g.h.s.boot.retry.service.TimeService   : Call CbTime{time=4, msg=0}
2018-07-23 12:58:34.998  INFO 849 --- [io-18080-exec-1] c.g.h.s.boot.retry.service.TimeService   : Call CbTime{time=5, msg=0}
2018-07-23 12:58:34.999  INFO 849 --- [io-18080-exec-1] c.g.h.s.boot.retry.service.TimeService   : 开始处理回复工作: CbTime{time=6, msg=0}
2018-07-23 12:58:35.006  WARN 849 --- [io-18080-exec-1] c.g.h.s.boot.retry.service.TimeService   : We meet ex: 

java.lang.RuntimeException: null
	at com.github.houbb.spring.boot.retry.service.TimeService.call(TimeService.java:41) ~[classes/:na]
	at com.github.houbb.spring.boot.retry.service.TimeService$$FastClassBySpringCGLIB$$51a56830.invoke(<generated>) ~[classes/:na]
	at org.springframework.cglib.proxy.MethodProxy.invoke(MethodProxy.java:204) ~[spring-core-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.aop.framework.CglibAopProxy$CglibMethodInvocation.invokeJoinpoint(CglibAopProxy.java:738) ~[spring-aop-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:157) ~[spring-aop-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.retry.interceptor.RetryOperationsInterceptor$1.doWithRetry(RetryOperationsInterceptor.java:91) ~[spring-retry-1.2.1.RELEASE.jar:na]
	at org.springframework.retry.support.RetryTemplate.doExecute(RetryTemplate.java:287) ~[spring-retry-1.2.1.RELEASE.jar:na]
	at org.springframework.retry.support.RetryTemplate.execute(RetryTemplate.java:180) ~[spring-retry-1.2.1.RELEASE.jar:na]
	at org.springframework.retry.interceptor.RetryOperationsInterceptor.invoke(RetryOperationsInterceptor.java:115) ~[spring-retry-1.2.1.RELEASE.jar:na]
	at org.springframework.retry.annotation.AnnotationAwareRetryOperationsInterceptor.invoke(AnnotationAwareRetryOperationsInterceptor.java:152) ~[spring-retry-1.2.1.RELEASE.jar:na]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:179) ~[spring-aop-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.aop.framework.CglibAopProxy$DynamicAdvisedInterceptor.intercept(CglibAopProxy.java:673) [spring-aop-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at com.github.houbb.spring.boot.retry.service.TimeService$$EnhancerBySpringCGLIB$$7cacf383.call(<generated>) [classes/:na]
	at com.github.houbb.spring.boot.retry.controller.RetryController.retryTime(RetryController.java:61) [classes/:na]
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:1.8.0_91]
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62) ~[na:1.8.0_91]
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[na:1.8.0_91]
	at java.lang.reflect.Method.invoke(Method.java:498) ~[na:1.8.0_91]
	at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:205) [spring-web-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:133) [spring-web-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:97) [spring-webmvc-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:827) [spring-webmvc-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:738) [spring-webmvc-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:85) [spring-webmvc-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:967) [spring-webmvc-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:901) [spring-webmvc-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:970) [spring-webmvc-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:861) [spring-webmvc-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:635) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:846) [spring-webmvc-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:742) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:231) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:52) [tomcat-embed-websocket-8.5.23.jar:8.5.23]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:99) [spring-web-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:107) [spring-web-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.springframework.web.filter.HttpPutFormContentFilter.doFilterInternal(HttpPutFormContentFilter.java:108) [spring-web-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:107) [spring-web-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.springframework.web.filter.HiddenHttpMethodFilter.doFilterInternal(HiddenHttpMethodFilter.java:81) [spring-web-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:107) [spring-web-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:197) [spring-web-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:107) [spring-web-4.3.13.RELEASE.jar:4.3.13.RELEASE]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:199) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:96) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:478) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:140) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:81) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:87) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:342) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:803) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:66) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:868) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1459) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:49) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142) [na:1.8.0_91]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617) [na:1.8.0_91]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61) [tomcat-embed-core-8.5.23.jar:8.5.23]
	at java.lang.Thread.run(Thread.java:745) [na:1.8.0_91]
```




# 项目地址

> [spring-boot-retry](https://github.com/houbb/spring-boot/tree/master/spring-boot-retry)


# 参考资料

[spring-retry](https://docs.spring.io/spring-batch/trunk/reference/html/retry.html)

https://blog.csdn.net/u011116672/article/details/77823867

https://blog.csdn.net/u010081710/article/details/77881781

https://blog.csdn.net/paul_wei2008/article/details/53871442


* any list
{:toc}







