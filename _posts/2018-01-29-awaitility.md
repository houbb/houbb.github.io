---
layout: post
title:  Awaitility
date:  2018-01-29 21:35:27 +0800
categories: [Test]
tags: [test]
published: true
---


# Awaitility

[Awaitility](http://www.awaitility.org/) is a DSL that allows you to express expectations of an asynchronous system in a concise and easy to read manner. 

For example:

```java
@Test
public void updatesCustomerStatus() throws Exception {
    // Publish an asynchronous event:
    publishEvent(updateCustomerStatusEvent);
    // Awaitility lets you wait until the asynchronous operation completes:
    await().atMost(5, SECONDS).until(customerStatusIsUpdated());
}
```

使用场景：对于被测代码有异步或者队列处理的中间过程常常使用 `Thread.sleep(...)` 来进行测试，无法及时的获取测试结果。该工具提供多种方法，可以使你更好的控制测试流程。

# Quick Start

> 完整代码地址：[CounterServiceTest.java](https://github.com/houbb/test/blob/master/test-await/src/test/java/com/ryo/test/await/CounterServiceTest.java)

## jar

- mvn import

```xml
<dependency>
      <groupId>org.awaitility</groupId>
      <artifactId>awaitility</artifactId>
      <version>3.0.0</version>
      <scope>test</scope>
</dependency>
```

## hello world

- CounterService.java

异步类


```java
public class CounterService implements Runnable {

    private volatile int count = 0;

    @Override
    public void run() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    for(int index = 0; index < 5; index++) {
                        Thread.sleep(1000);
                        count += 1;
                    }
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }).start();
    }

    public int getCount() {
        return count;
    }

}
```

- CounterServiceTest.java

测试类

```java
package com.ryo.test.await;

import org.junit.Assert;
import org.junit.Test;

import java.util.concurrent.Callable;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.awaitility.Awaitility.await;
import static org.awaitility.Awaitility.with;
import static org.awaitility.Duration.ONE_HUNDRED_MILLISECONDS;

public class CounterServiceTest {

    /**
     * 默认等待时间
     */
    @Test
    public void asynchronousNormalTest(){
        final CounterService service = new CounterService();
        service.run();
        try{
            // 默认10s, 如果在这时间段内,条件依然不满足,将抛出ConditionTimeoutException
            await().until(new Callable<Boolean>() {
                @Override
                public Boolean call() throws Exception {
                    return service.getCount() == 5;
                }
            });
        } catch (Exception e) {
            Assert.fail("测试代码运行异常：" + e.getMessage() + "，代码位置：" + e.getStackTrace()[0].toString());
        }
    }

    /**
     * 最多等待
     */
    @Test
    public void asynchronousAtMostTest(){
        final CounterService service = new CounterService();
        service.run();
        try{
            // 指定超时时间3s, 如果在这时间段内,条件依然不满足,将抛出ConditionTimeoutException
            await().atMost(3, SECONDS).until(new Callable<Boolean>() {
                @Override
                public Boolean call() throws Exception {
                    return service.getCount() == 5;
                }
            });
        } catch (Exception e) {
            Assert.fail("测试代码运行异常：" + e.getMessage() + "，代码位置：" + e.getStackTrace()[0].toString());
        }
    }

    /**
     * 最少等待
     */
    @Test
    public void asynchronousAtLeastTest(){
        final CounterService service = new CounterService();
        service.run();

        try{
            // 指定至少1s, 最多3s, 如果在这时间段内,条件依然不满足,将抛出ConditionTimeoutException
            await().atLeast(1, SECONDS).and().atMost(3, SECONDS).until(new Callable<Boolean>() {
                @Override
                public Boolean call() throws Exception {
                    return service.getCount() == 2;
                }
            });

        } catch (Exception e) {
            Assert.fail("测试代码运行异常：" + e.getMessage() + "，代码位置：" + e.getStackTrace()[0].toString());
        }
    }

    /**
     * 轮询
     */
    @Test
    public void testAsynchronousPoll(){
        final CounterService service = new CounterService();
        service.run();
        try{
            // 轮询查询,pollInterval每隔多少时间段轮询, pollDelay每次轮询间隔时间
            with().pollInterval(ONE_HUNDRED_MILLISECONDS).and().with().pollDelay(50, MILLISECONDS).await("count is greater 3").until(
                    new Callable<Boolean>() {
                        @Override
                        public Boolean call() throws Exception {
                            return service.getCount() == 4;
                        }
                    });
        } catch (Exception e) {
            Assert.fail("测试代码运行异常：" + e.getMessage() + "，代码位置：" + e.getStackTrace()[0].toString());
        }
    }
}
```

* any list
{:toc}

