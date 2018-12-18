---
layout: post
title: Resilience4j
date: 2018-11-29 07:32:26 +0800
categories: [Distributed]
tags: [distributed, sh]
published: true
excerpt: Resilience4j-Netflix Hystrix 的替代者
---

# Resilience4j

[Resilience4j](https://github.com/resilience4j/resilience4j) 是一个轻量级容错库，受Netflix Hystrix启发，但专为Java 8和函数式编程而设计。

轻量级，因为库只使用Vavr（以前称为Javaslang），它没有任何其他外部库依赖项。

相比之下，Netflix Hystrix对Archaius具有编译依赖性，Archaius具有更多外部库依赖性，例如Guava和Apache Commons Configuration。

使用Resilience4j，你不必全押，你可以选择你需要的东西。

## 其他

Hystrix 已经**停止更新**了。(2018-11-29)

# 快速开始

## maven 引入

```xml
<dependencies>
    <dependency>
        <groupId>io.github.resilience4j</groupId>
        <artifactId>resilience4j-circuitbreaker</artifactId>
        <version>0.13.1</version>
    </dependency>
    <dependency>
        <groupId>io.github.resilience4j</groupId>
        <artifactId>resilience4j-ratelimiter</artifactId>
        <version>0.13.1</version>
    </dependency>
    <dependency>
        <groupId>io.github.resilience4j</groupId>
        <artifactId>resilience4j-retry</artifactId>
        <version>0.13.1</version>
    </dependency>
    <dependency>
        <groupId>io.github.resilience4j</groupId>
        <artifactId>resilience4j-bulkhead</artifactId>
        <version>0.13.1</version>
    </dependency>
    <dependency>
        <groupId>io.github.resilience4j</groupId>
        <artifactId>resilience4j-cache</artifactId>
        <version>0.13.1</version>
    </dependency>
    <dependency>
        <groupId>io.github.resilience4j</groupId>
        <artifactId>resilience4j-timelimiter</artifactId>
        <version>0.13.1</version>
    </dependency>
</dependencies>
```

## 基础案例

- BackendService.java

简单的服务类。

```java
import java.util.concurrent.TimeUnit;

/**
 * @author binbin.hou
 * @date 2018/12/18
 */
public class BackendService {

    public String doSomethingSlowly() {
        try {
            TimeUnit.SECONDS.sleep(10);
            return "result";
        } catch (InterruptedException e) {
            e.printStackTrace();
            return e.getMessage();
        }
    }

    public String doSomething() {
        return "hello world";
    }

    public String doSomethingThrowException() {
        String name = null;
        return name.trim();
    }

}
```

- Resilienece4jTest.java

测试案例

```java
import io.github.resilience4j.bulkhead.Bulkhead;
import io.github.resilience4j.bulkhead.BulkheadConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.timelimiter.TimeLimiter;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import io.vavr.control.Try;
import org.junit.Test;

import java.time.Duration;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.function.Supplier;
import java.util.stream.IntStream;

/**
 * @author binbin.hou
 * @date 2018/12/18
 */
public class Resilienece4jTest {

    /**
     * CircuitBreaker主要是实现针对接口异常的断路统计以及断路处理
     */
    @Test
    public void testCircuitBreaker(){
        // Create a CircuitBreaker (use default configuration)
        CircuitBreakerConfig circuitBreakerConfig = CircuitBreakerConfig
                .custom()
                .enableAutomaticTransitionFromOpenToHalfOpen()
                .build();
        CircuitBreaker circuitBreaker = CircuitBreaker
                .of("backendName",circuitBreakerConfig);
        String result = circuitBreaker.executeSupplier(() -> "Hello");
        System.out.println(result);
    }

    /**
     * 主要是实现超时的控制
     */
    @Test
    public void testTimelimiter(){
        BackendService backendService = new BackendService();

        ExecutorService executorService = Executors.newSingleThreadExecutor();
        TimeLimiterConfig config = TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofMillis(600))
                .cancelRunningFuture(true)
                .build();
        TimeLimiter timeLimiter = TimeLimiter.of(config);

        Supplier<Future<String>> futureSupplier = () -> {
            return executorService.submit(backendService::doSomethingThrowException);
        };
        Callable<String> restrictedCall = TimeLimiter.decorateFutureSupplier(timeLimiter,futureSupplier);
        Try.of(restrictedCall::call)
                .onFailure(throwable -> System.out.println("We might have timed out or the circuit breaker has opened."));
    }

    /**
     * A Bulkhead can be used to limit the amount of parallel executions
     * Bulkhead目前来看是用来控制并行(parallel)调用的次数
     */
    @Test
    public void testBulkhead(){
        BackendService backendService = new BackendService();

        Bulkhead bulkhead = Bulkhead.of("test", BulkheadConfig.custom()
                .maxConcurrentCalls(1)
                .build());
        Supplier<String> decoratedSupplier = Bulkhead.decorateSupplier(bulkhead, backendService::doSomethingSlowly);
        IntStream.rangeClosed(1,2)
                .parallel()
                .forEach(i -> {
                    String result = Try.ofSupplier(decoratedSupplier)
                            .recover(throwable -> "Hello from Recovery").get();
                    System.out.println(result);
                });

    }

    /**
     * 主要用来做流控
     */
    @Test
    public void testRateLimiter(){
        BackendService backendService = new BackendService();

        // Create a custom RateLimiter configuration
        RateLimiterConfig config = RateLimiterConfig.custom()
                .timeoutDuration(Duration.ofMillis(100))
                .limitRefreshPeriod(Duration.ofSeconds(1))
                .limitForPeriod(1)
                .build();
        // Create a RateLimiter
        RateLimiter rateLimiter = RateLimiter.of("backendName", config);

        // Decorate your call to BackendService.doSomething()
        Supplier<String> restrictedSupplier = RateLimiter
                .decorateSupplier(rateLimiter, backendService::doSomething);

        IntStream.rangeClosed(1,5)
                .parallel()
                .forEach(i -> {
                    Try<String> aTry = Try.ofSupplier(restrictedSupplier);
                    System.out.println(aTry.isSuccess());
                });
    }


    /**
     * fallback基本上是高可用操作的标配
     */
    @Test
    public void testFallback(){
        BackendService backendService = new BackendService();

        // Execute the decorated supplier and recover from any exception
        String result = Try.ofSupplier(backendService::doSomethingThrowException)
                .recover(throwable -> "Hello from Recovery").get();
        System.out.println(result);
    }

    @Test
    public void testCircuitBreakerAndFallback(){
        BackendService backendService = new BackendService();

        CircuitBreaker circuitBreaker = CircuitBreaker.ofDefaults("backendName");
        Supplier<String> decoratedSupplier = CircuitBreaker
                .decorateSupplier(circuitBreaker, backendService::doSomethingThrowException);
        String result = Try.ofSupplier(decoratedSupplier)
                .recover(throwable -> "Hello from Recovery").get();
        System.out.println(result);
    }

    /**
     * 代码重试
     */
    @Test
    public void testRetry(){
        BackendService backendService = new BackendService();

        CircuitBreaker circuitBreaker = CircuitBreaker.ofDefaults("backendName");
        // Create a Retry with at most 3 retries and a fixed time interval between retries of 500ms
        Retry retry = Retry.ofDefaults("backendName");

        // Decorate your call to BackendService.doSomething() with a CircuitBreaker
        Supplier<String> decoratedSupplier = CircuitBreaker
                .decorateSupplier(circuitBreaker, backendService::doSomething);

        // Decorate your call with automatic retry
        decoratedSupplier = Retry
                .decorateSupplier(retry, decoratedSupplier);

        // Execute the decorated supplier and recover from any exception
        String result = Try.ofSupplier(decoratedSupplier)
                .recover(throwable -> "Hello from Recovery").get();
        System.out.println(result);
    }

}
```

* any list
{:toc}