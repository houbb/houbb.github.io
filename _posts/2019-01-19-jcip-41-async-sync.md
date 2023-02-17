---
layout: post
title:  java 异步查询转同步多种实现方式：循环等待，CountDownLatch，Spring EventListener，超时处理和空循环性能优化
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [concurrency, thread, async, sync, sh]
published: true
---

# 异步转同步

## 业务需求

有些接口查询反馈结果是异步返回的，无法立刻获取查询结果。

- 正常处理逻辑

触发异步操作，然后传递一个唯一标识。

等到异步结果返回，根据传入的唯一标识，匹配此次结果。

- 如何转换为同步

正常的应用场景很多，但是有时候不想做数据存储，只是想简单获取调用结果。

即想达到同步操作的结果，怎么办呢？

## 思路

1. 发起异步操作

2. 在异步结果返回之前，一直等待(可以设置超时)

3. 结果返回之后，异步操作结果统一返回


# 常见的实现方式

（1）循环等待

（2）CountDownLatch

（3）Spring EventListener

（4）wait & notify

（5）使用条件锁

（6）Future

（7）使用 CyclicBarrier

# 循环等待

- LoopQuery.java

使用 `query()`，将异步的操作 `remoteCallback()` 执行完成后，同步返回。

```java
public class LoopQuery implements Async {

    private String result;

    private static final Logger LOGGER = LogManager.getLogger(LoopQuery.class.getName());

    @Override
    public String query(String key) {
        startQuery(key);
        new Thread(new Runnable() {
            @Override
            public void run() {
                remoteCallback(key);
            }
        }).start();

        final String queryResult = endQuery();
        LOGGER.info("查询结果: {}", queryResult);
        return queryResult;
    }

    /**
     * 开始查询
     * @param key 查询条件
     */
    private void startQuery(final String key) {
        LOGGER.info("执行查询: {}", key);
    }

    /**
     * 远程的回调是等待是随机的
     *
     * @param key 查询条件
     */
    private void remoteCallback(final String key) {
        try {
            TimeUnit.SECONDS.sleep(5);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        this.result = key + "-result";
        LOGGER.info("remoteCallback set result: {}", result);
    }

    /**
     * 结束查询
     * @return 返回结果
     */
    private String endQuery() {
        while (true) {
            if (null == result) {
                try {
                    TimeUnit.MILLISECONDS.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            } else {
                return result;
            }
        }
    }
}
```

- main()

```java
public static void main(String[] args) {
    new LoopQuery().query("12345");
}
```

- 测试结果

```
18:14:16.491 [main] INFO  com.github.houbb.thread.learn.aysnc.loop.LoopQuery - 执行查询: 12345
18:14:21.498 [Thread-1] INFO  com.github.houbb.thread.learn.aysnc.loop.LoopQuery - remoteCallback set result: 12345-result
18:14:21.548 [main] INFO  com.github.houbb.thread.learn.aysnc.loop.LoopQuery - 查询结果: 12345-result
```

# CountDownLatch

- AsyncQuery.java

使用 `CountDownLatch` 类达到同步的效果。

```java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class AsyncQuery {

    private static final Logger LOGGER = LogManager.getLogger(AsyncQuery.class.getName());

    /**
     * 结果
     */
    private String result;

    /**
     * 异步转同步查询
     * @param key
     */
    public void asyncQuery(final String key) {
        final CountDownLatch latch = new CountDownLatch(1);
        this.startQuery(key);

        new Thread(new Runnable() {
            @Override
            public void run() {
                LOGGER.info("远程回调线程开始");
                remoteCallback(key, latch);
                LOGGER.info("远程回调线程结束");
            }
        }).start();

        try {
            latch.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        this.endQuery();
    }

    private void startQuery(final String key) {
        LOGGER.info("执行查询: {}", key);
    }

    /**
     * 远程的回调是等待是随机的
     * @param key
     */
    private void remoteCallback(final String key, CountDownLatch latch) {
        try {
            TimeUnit.SECONDS.sleep(5);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        this.result = key + "-result";
        latch.countDown();
    }

    private void endQuery() {
        LOGGER.info("查询结果: {}", result);
    }

}
```

- main()

```java
public static void main(String[] args) {
    AsyncQuery asyncQuery = new AsyncQuery();
    final String key = "123456";
    asyncQuery.asyncQuery(key);
}
```

- 日志

```
18:19:12.714 [main] INFO  com.github.houbb.thread.learn.aysnc.countdownlatch.AsyncQuery - 执行查询: 123456
18:19:12.716 [Thread-1] INFO  com.github.houbb.thread.learn.aysnc.countdownlatch.AsyncQuery - 远程回调线程开始
18:19:17.720 [main] INFO  com.github.houbb.thread.learn.aysnc.countdownlatch.AsyncQuery - 查询结果: 123456-result
18:19:17.720 [Thread-1] INFO  com.github.houbb.thread.learn.aysnc.countdownlatch.AsyncQuery - 远程回调线程结束
```

# Spring EventListener

使用观察者模式也可以。（对方案一的优化）

此处结合 spring 进行使用。

- BookingCreatedEvent.java

定义一个传输属性的对象。

```java
public class BookingCreatedEvent extends ApplicationEvent {

    private static final long serialVersionUID = -1387078212317348344L;

    private String info;

    public BookingCreatedEvent(Object source) {
        super(source);
    }

    public BookingCreatedEvent(Object source, String info) {
        super(source);
        this.info = info;
    }

    public String getInfo() {
        return info;
    }
}
```

- BookingService.java

说明：当 `this.context.publishEvent(bookingCreatedEvent);` 触发时，
会被 `@EventListener` 指定的方法监听到。

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class BookingService {

    @Autowired
    private ApplicationContext context;

    private volatile BookingCreatedEvent bookingCreatedEvent;

    /**
     * 异步转同步查询
     * @param info
     * @return
     */
    public String asyncQuery(final String info) {
        query(info);

        new Thread(new Runnable() {
            @Override
            public void run() {
                remoteCallback(info);
            }
        }).start();

        while(bookingCreatedEvent == null) {
            //.. 空循环
            // 短暂等待。
            try {
                TimeUnit.MILLISECONDS.sleep(1);
            } catch (InterruptedException e) {
                //...
            }
            //2. 使用两个单独的 event...

        }

        final String result = bookingCreatedEvent.getInfo();
        bookingCreatedEvent = null;
        return result;
    }

    @EventListener
    public void onApplicationEvent(BookingCreatedEvent bookingCreatedEvent) {
        System.out.println("监听到远程的信息: " + bookingCreatedEvent.getInfo());
        this.bookingCreatedEvent = bookingCreatedEvent;
        System.out.println("监听到远程消息后: " + this.bookingCreatedEvent.getInfo());
    }

    /**
     * 执行查询
     * @param info
     */
    public void query(final String info) {
        System.out.println("开始查询: " + info);
    }

    /**
     * 远程回调
     * @param info
     */
    public void remoteCallback(final String info) {
        System.out.println("远程回调开始: " + info);

        try {
            TimeUnit.SECONDS.sleep(2);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 重发结果事件
        String result = info + "-result";
        BookingCreatedEvent bookingCreatedEvent = new BookingCreatedEvent(this, result);
        //触发event
        this.context.publishEvent(bookingCreatedEvent);
    }
}
```

- 测试方法

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = SpringConfig.class)
public class BookServiceTest {

    @Autowired
    private BookingService bookingService;

    @Test
    public void asyncQueryTest() {
        bookingService.asyncQuery("1234");
    }

}
```

- 日志

```
2018-08-10 18:27:05.958  INFO  [main] com.github.houbb.spring.lean.core.ioc.event.BookingService:84 - 开始查询:1234
2018-08-10 18:27:05.959  INFO  [Thread-2] com.github.houbb.spring.lean.core.ioc.event.BookingService:93 - 远程回调开始:1234
接收到信息: 1234-result
2018-08-10 18:27:07.964  INFO  [Thread-2] com.github.houbb.spring.lean.core.ioc.event.BookingService:73 - 监听到远程的信息: 1234-result
2018-08-10 18:27:07.964  INFO  [Thread-2] com.github.houbb.spring.lean.core.ioc.event.BookingService:75 - 监听到远程消息后: 1234-result
2018-08-10 18:27:07.964  INFO  [Thread-2] com.github.houbb.spring.lean.core.ioc.event.BookingService:106 - 已经触发event
2018-08-10 18:27:07.964  INFO  [main] com.github.houbb.spring.lean.core.ioc.event.BookingService:67 - 查询结果: 1234-result
2018-08-10 18:27:07.968  INFO  [Thread-1] org.springframework.context.support.GenericApplicationContext:993 - Closing org.springframework.context.support.GenericApplicationContext@5cee5251: startup date [Fri Aug 10 18:27:05 CST 2018]; root of context hierarchy
```

# 超时和空循环

## 空循环

空循环会导致 cpu 飙升

```java
while(true) {
}
```

- 解决方式

```java
while(true) {
    // 小睡即可
    TimeUnit.sleep(1);
}
```

## 超时编写

不可能一直等待反馈，可以设置超时时间。

```java
/**
 * 循环等待直到获取结果
 * @param key key
 * @param timeoutInSeconds 超时时间
 * @param <T> 泛型
 * @return 结果。如果超时则抛出异常
 */
public <T> T loopWaitForValue(final String key, long timeoutInSeconds) {
    long startTime = System.nanoTime();
    long deadline = startTime + TimeUnit.SECONDS.toNanos(timeoutInSeconds);
    //1. 如果没有新回调，或者 key 对应元素不存在。则一直循环
    while(ObjectUtil.isNull(map.get(key))) {
        try {
            TimeUnit.MILLISECONDS.sleep(5);
        } catch (InterruptedException e) {
            LOGGER.warn("Loop meet InterruptedException, just ignore it.", e);
        }
        // 超时判断
        long currentTime = System.nanoTime();
        if(currentTime >= deadline) {
            throw new BussinessException(ErrorCode.READ_TIME_OUT);
        }
    }
    final T target = (T) map.get(key);
    LOGGER.debug("loopWaitForValue get value:{} for key:{}", JSON.toJSON(target), key);
    //2. 获取到元素之后，需要移除掉对应的值
    map.remove(key);
    return target;
}
```


# 代码地址

[loop](https://github.com/houbb/thread-learn/tree/master/aysnc/src/main/java/com/github/houbb/thread/learn/aysnc/loop)

[countdownlatch](https://github.com/houbb/thread-learn/tree/master/aysnc/src/main/java/com/github/houbb/thread/learn/aysnc/countdownlatch)

[spring-event-listener](https://github.com/houbb/spring-framework-learn/tree/master/spring-learn-core/spring-core-ioc/src/main/java/com/github/houbb/spring/lean/core/ioc/event)

* any list
{:toc}