---
layout: post
title:  重试框架介绍：Guava Retry 
date:  2018-08-08 01:40:39 +0800
categories: [Java]
tags: [java, retry]
published: true
---

# Guava Retry

[guava-retrying](https://github.com/rholder/guava-retrying) 模块提供了一种通用方法，
可以使用Guava谓词匹配增强的特定停止、重试和异常处理功能来重试任意Java代码。

## 优点

Guava retryer工具与spring-retry类似，都是通过定义重试者角色来包装正常逻辑重试，但是Guava retryer有更优的策略定义，在支持重试次数和重试频度控制基础上，能够兼容支持多个异常或者自定义实体对象的重试源定义，让重试功能有更多的灵活性。

Guava Retryer也是线程安全的，入口调用逻辑采用的是 `java.util.concurrent.Callable` 的 call() 方法


# 快速开始

## maven 引入

```xml
<dependency>
  <groupId>com.github.rholder</groupId>
  <artifactId>guava-retrying</artifactId>
  <version>2.0.0</version>
</dependency>
```

## 入门案例

- HelloDemo.java

```java
import com.google.common.base.Predicates;

import com.github.rholder.retry.RetryException;
import com.github.rholder.retry.Retryer;
import com.github.rholder.retry.RetryerBuilder;
import com.github.rholder.retry.StopStrategies;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;

public class HelloDemo {

    private static final Logger LOGGER = LogManager.getLogger(HelloDemo.class);

    public static void main(String[] args) {
        Callable<Boolean> callable = new Callable<Boolean>() {
            @Override
            public Boolean call() throws Exception {
                // do something useful here
                LOGGER.info("call...");
                throw new RuntimeException();
            }
        };

        Retryer<Boolean> retryer = RetryerBuilder.<Boolean>newBuilder()
                .retryIfResult(Predicates.isNull())
                .retryIfExceptionOfType(IOException.class)
                .retryIfRuntimeException()
                .withStopStrategy(StopStrategies.stopAfterAttempt(3))
                .build();
        try {
            retryer.call(callable);
        } catch (RetryException | ExecutionException e) {
            e.printStackTrace();
        }

    }

}
```

- 日志

```
2018-08-08 01:51:06.051  INFO  [main] com.github.houbb.retry.guava.HelloDemo:41 - call...
2018-08-08 01:51:06.052  INFO  [main] com.github.houbb.retry.guava.HelloDemo:41 - call...
2018-08-08 01:51:06.052  INFO  [main] com.github.houbb.retry.guava.HelloDemo:41 - call...
com.github.rholder.retry.RetryException: Retrying failed to complete successfully after 3 attempts.
	at com.github.rholder.retry.Retryer.call(Retryer.java:174)
	at com.github.houbb.retry.guava.HelloDemo.main(HelloDemo.java:53)
Caused by: java.lang.RuntimeException
	at com.github.houbb.retry.guava.HelloDemo$1.call(HelloDemo.java:42)
	at com.github.houbb.retry.guava.HelloDemo$1.call(HelloDemo.java:37)
	at com.github.rholder.retry.AttemptTimeLimiters$NoAttemptTimeLimit.call(AttemptTimeLimiters.java:78)
	at com.github.rholder.retry.Retryer.call(Retryer.java:160)
	... 1 more
```

## Exponential backoff

> [Exponential_backoff](https://en.wikipedia.org/wiki/Exponential_backoff)

创建一个可以永远重试的 `Retryer`，在每次失败的重试之后，以递增指数的间隔等待直到最多5分钟。5分钟后，每隔5分钟重试一次。

```java
Retryer<Boolean> retryer = RetryerBuilder.<Boolean>newBuilder()
        .retryIfExceptionOfType(IOException.class)
        .retryIfRuntimeException()
        .withWaitStrategy(WaitStrategies.exponentialWait(100, 5, TimeUnit.MINUTES))
        .withStopStrategy(StopStrategies.neverStop())
        .build();
```

## Fibonacci Backoff

创建一个可以永远重试的 `Retryer`，在每次失败的重试之后，增加斐波那契回退间隔，直到最多2分钟。2分钟后，每隔2分钟重试一次。

```java
Retryer<Boolean> retryer = RetryerBuilder.<Boolean>newBuilder()
        .retryIfExceptionOfType(IOException.class)
        .retryIfRuntimeException()
        .withWaitStrategy(WaitStrategies.fibonacciWait(100, 2, TimeUnit.MINUTES))
        .withStopStrategy(StopStrategies.neverStop())
        .build();
```

# 参考资料

https://blog.csdn.net/aitangyong/article/details/53889036

https://github.com/google/guava/issues/490

https://github.com/rholder/guava-retrying

* any list
{:toc}