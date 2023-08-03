---
layout: post
title: 分布式链路追踪-05-mdc 等信息如何跨线程
date:  2023-07-25 +0800
categories: [Trace]
tags: [trace, distributed, sh]
published: true
---

# 背景

我们希望实现全链路信息，但是代码中一般都会异步的线程处理。

# 解决思路

我们可以对以前的 Runable 和 Callable 进行增强。

可以使用 ali 已经存在的实现方式。

> [TransmittableThreadLocal (TTL) 解决异步执行时上下文传递的问题](https://houbb.github.io/2023/07/19/ttl)

核心的实现思路如下：

1）异步执行前，把当前线程的 MDC 信息放入执行对象中。

2）异步执行时，把执行对象中的信息放入 MDC 等信息。

3) 异步执行后，清空执行对象。

## 问题

Runable 和 Callable 只是接口，没有额外信息，所以需要进行增强。

# 实现方式

## 接口定义

```java
package com.github.houbb.heaven.support.concurrent.context;

import java.util.Map;

/**
 * 跨线程处理类
 *
 * @since 0.3.0
 */
public interface CrossThreadProcessor {

    /**
     * 初始化上下文
     * @param contextMap 上下文
     */
    void initContext(Map<String, Object> contextMap);

    /**
     * 执行之前
     * @param contextMap 上下文
     */
    void beforeExecute(Map<String, Object> contextMap);

    /**
     * 执行之后
     * @param contextMap 上下文
     */
    void afterExecute(Map<String, Object> contextMap);

}
```

## 对可执行接口进行增强

```java
package com.github.houbb.heaven.support.concurrent.context;

import com.github.houbb.heaven.util.lang.SpiUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;

/**
 * 跨线程处理
 *
 * 作用：用来跨线程处理传递信息，比如 async，线程池等。
 *
 * 比如在 aop 中，直接处理。
 *
 * <pre>
 * Object[] args = point.args();
 * Object arg0 = args[0];
 *
 * // 直接转换为当前的对象
 * if(arg0 instanceOf Runnable) {
 *      args[0] = new CrossThreadWrapper((Runnable)arg0);
 * } else if(arg0 instanceOf Callable) {
 *      args[0] = new CrossThreadWrapper((Callable)arg0);
 * }
 *
 * // 继续处理
 * </pre>
 * @param <T> 泛型
 * @since 0.3.0
 */
public class CrossThreadWrapper<T> implements Runnable, Callable<T> {

    private Runnable runnable;

    private Callable<T> callable;

    /**
     * 通过 spi 获取所有的实现类
     */
    private static List<CrossThreadProcessor> processorList = new ArrayList<>();

    /**
     * 上下文
     */
    private final Map<String, Object> context = new HashMap<>();

    static {
        processorList = SpiUtil.getClassImplList(CrossThreadProcessor.class);
    }

    public CrossThreadWrapper(Runnable runnable) {
        // 任务执行之前
        this.initContext();

        this.runnable = runnable;
    }

    public CrossThreadWrapper(Callable<T> callable) {
        this.initContext();

        this.callable = callable;
    }

    @Override
    public void run() {
        try {
            beforeExecute();
            this.runnable.run();
        } finally {
            afterExecute();
        }
    }

    @Override
    public T call() throws Exception {
        try {
            beforeExecute();
            return this.callable.call();
        } finally {
            afterExecute();
        }
    }

    /**
     * 初始化上下文
     */
    protected void initContext() {
        for(CrossThreadProcessor processor : processorList) {
            processor.initContext(context);
        }
    }

    /**
     * 执行前
     */
    protected void beforeExecute() {
        for(CrossThreadProcessor processor : processorList) {
            processor.beforeExecute(context);
        }
    }

    /**
     * 执行之后
     */
    protected void afterExecute() {
        for(CrossThreadProcessor processor : processorList) {
            processor.afterExecute(context);
        }
    }

}
```

# 用法

## 实现接口

我们只需要实现 `CrossThreadProcessor` 接口。

然后 spi 中配置，服务会自动发现。

## aop

可以在 spring aop 中，对以前的方法执行进行增强。

# 参考资料

[全链路日志追踪traceId(http、dubbo、mq)](https://blog.csdn.net/promisessh/article/details/110532387)

* any list
{:toc}