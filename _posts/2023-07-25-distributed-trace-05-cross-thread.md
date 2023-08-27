---
layout: post
title: 分布式链路追踪-05-mdc 等信息如何跨线程?  InheritableThreadLocal
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

```java
package com.github.houbb.auto.trace.spring.aspect.aop.executor;

import com.github.houbb.auto.trace.constants.AutoTraceConst;
import com.github.houbb.auto.trace.support.crossthread.CrossThreadWrapper;
import com.github.houbb.heaven.util.util.ArrayUtil;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.DeclareParents;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.concurrent.Callable;

/**
 * 解决异步线程的跨线程信息丢失问题
 *
 * 1. 实际测试发只对 spring 的 @Async 有效果
 * 2. 对 ExecutorService/Thread/Future 都没有效果
 *
 * @author binbin.hou
 * @since 0.0.3
 */
@Aspect
@Order(value = AutoTraceConst.ASPECT_ORDER)
@Component
@EnableAspectJAutoProxy
public class AutoTraceExecutorAop {

    /**
     * 切面方法：
     */
    @Pointcut("execution(* java.util.concurrent.Executor.*(..))")
    public void autoLogPointcut() {
    }

    /**
     * 执行核心方法
     *
     * 相当于 MethodInterceptor
     *
     * @param point 切点
     * @return 结果
     * @throws Throwable 异常信息
     * @since 0.0.3
     */
    @Around("autoLogPointcut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        Object[] params = point.getArgs();

        if(ArrayUtil.isEmpty(params)) {
            return point.proceed();
        }
        Object firstParam = params[0];
        if(firstParam instanceof Runnable) {
            Runnable runnable = (Runnable) firstParam;
            firstParam = new CrossThreadWrapper(runnable);
        } else if(firstParam instanceof Callable) {
            Callable callable = (Callable) firstParam;
            firstParam = new CrossThreadWrapper(callable);
        }

        return point.proceed(new Object[]{firstParam});
    }

}
```

## 实际测试效果

发现只对 @Async 这种 spring 托管的有效果。

# 常见的多线程使用方式

## 测试代码

```java
import com.github.houbb.auto.trace.util.SpanHolder;
import org.example.aop.demo.annotation.Route;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class AsyncService {

    private static final Logger logger = LoggerFactory.getLogger(AsyncService.class);

    @Async
    public String async(String id) {
        logger.info("async service in with span {}", SpanHolder.get());
        return "id=" + id;
    }

    public String thread(String id) {
        Thread thread = new Thread(() -> {
            // 异步任务逻辑
            logger.info("thread service in with span {}", SpanHolder.get());
        });
        thread.start();

        // 主线程继续执行其他操作
        System.out.println("Main thread continues its execution.");


        return "id=" + id;
    }

    public String executor(String id) {
        ExecutorService executorService = Executors.newSingleThreadExecutor();
        executorService.submit(() -> {
            // 异步任务逻辑
            logger.info("executor service in with span {}", SpanHolder.get());
        });

        // 关闭线程池
        executorService.shutdown();

        // 主线程继续执行其他操作
        System.out.println("Main thread continues its execution.");
        return "id=" + id;
    }

    public String future(String id) {
        CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
            // 异步任务逻辑
            logger.info("future service in with span {}", SpanHolder.get());
        });

        // 主线程继续执行其他操作

        // 等待异步任务完成
        future.join();
        System.out.println("Main thread continues its execution.");

        return "id=" + id;
    }

}
```

# 其他解决方式

## Q0-实际测试发现通过上面的切面，只对 @Async 可以增强，其他的3种无法增强。有什么办法解决吗

你所描述的情况表明，上述切面仅在 `@Async` 注解上起作用，但对于其他类型的方法（如 `java.util.concurrent.Executor` 或普通的方法）则不起作用。这是因为 Spring AOP 的默认实现只支持代理基于接口的类，而 `java.util.concurrent.Executor` 是一个类而非接口。

要解决这个问题，你可以考虑使用 AspectJ，这是一个更强大的 AOP 框架，支持更广泛的切面功能，包括对类的直接增强。使用 AspectJ，你可以在更低层次上操作字节码，以实现更复杂的 AOP 操作。

以下是一个使用 AspectJ 来拦截 `java.util.concurrent.Executor` 方法的示例：

1. **引入 AspectJ 依赖：** 在你的项目中添加 AspectJ 的相关依赖。

2. **创建 AspectJ 切面：** 创建一个 AspectJ 切面类，其中定义你的增强逻辑。

```java
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;

@Aspect
public class ExecutorAspect {

    @Pointcut("within(java.util.concurrent.Executor)")
    public void inExecutor() {}

    @Before("inExecutor()")
    public void beforeExecutorMethodCall() {
        System.out.println("Before executing Executor method.");
    }
}
```

在这个示例中，我们使用了 `@Pointcut` 来定义一个切点，用于匹配所有位于 `java.util.concurrent.Executor` 类中的方法。

3. **配置 AspectJ：** 配置 AspectJ 的运行时。

如果你使用 Spring Boot，你可以在 `application.properties` 或 `application.yml` 中添加以下配置：

```properties
spring.aop.auto=false
spring.aop.proxy-target-class=true
```

4. **在代码中使用 AspectJ：** 在代码中使用 AspectJ 的注解来实现切面增强。

请注意，使用 AspectJ 需要一些额外的配置和学习，但它提供了更强大和灵活的 AOP 功能。如果你需要在更深层次上操作类，特别是类的字节码，AspectJ 是一个值得考虑的选择。

## Q1-异步线程导致 MDC 信息丢失，如何解决

MDC（Mapped Diagnostic Context）是一个在多线程环境下用于保存线程特定信息的机制，通常用于在日志中关联一些上下文信息，如用户ID、请求ID等。

然而，在使用异步线程的情况下，MDC 的信息可能会丢失，因为线程切换会导致上下文信息无法正确传递。

解决这个问题的一种常见方式是使用合适的工具或框架来管理异步线程中的 MDC 上下文。以下是一些解决方案：

1. **使用 InheritableThreadLocal：** 在 Java 中，可以使用 `InheritableThreadLocal` 来在线程之间传递 MDC 上下文信息。

`InheritableThreadLocal` 允许子线程继承父线程的上下文信息。

在使用 `InheritableThreadLocal` 时，确保将 MDC 数据保存在 `InheritableThreadLocal` 中，然后将其传递给新创建的线程。

```java
public class MDCContextPropagation {

    private static InheritableThreadLocal<YourMDCData> mdcData = new InheritableThreadLocal<>();

    public static void setMDCData(YourMDCData data) {
        mdcData.set(data);
    }

    public static YourMDCData getMDCData() {
        return mdcData.get();
    }

    public static void clearMDCData() {
        mdcData.remove();
    }
}
```

2. **使用异步框架提供的上下文传递机制：** 一些异步框架（如 Spring 的 `@Async` 或 Java 的 `CompletableFuture`）提供了上下文传递机制，可以在异步任务之间传递上下文信息。

你可以查阅相关文档以了解如何使用这些机制来保留 MDC 上下文。

3. **自定义的 MDC 管理器：** 你也可以实现自己的 MDC 管理器，用于在异步线程中正确传递和管理 MDC 上下文信息。这可能需要更多的工作，但可以实现更精细的控制。

4. **使用第三方库：** 一些第三方库如 Log4j2、Logback 等，在异步日志处理时提供了特定的解决方案来处理 MDC 上下文信息。

综上所述，解决异步线程中 MDC 信息丢失的问题通常需要根据你的具体使用场景和框架选择合适的解决方案。

最好的方式是根据你的应用程序需求和框架特点，选择适合的方法来管理和传递 MDC 上下文信息。

## Q2-详细介绍一下 InheritableThreadLocal

`InheritableThreadLocal` 是 Java 中的一个线程本地变量类，它提供了一种在父子线程之间传递数据的机制。与普通的 `ThreadLocal` 不同，`InheritableThreadLocal` 允许子线程继承父线程的变量副本，使得在子线程中能够获取父线程的变量值。这对于在多线程环境下传递上下文信息非常有用，例如在异步执行、线程池等情况下保留数据的一致性。

以下是 `InheritableThreadLocal` 的一些特性和使用方法：

1. **创建和设置变量：** 可以通过 `InheritableThreadLocal` 类的实例来创建和设置线程本地变量。

```java
InheritableThreadLocal<String> threadLocal = new InheritableThreadLocal<>();
threadLocal.set("Value from parent thread");
```

2. **获取变量值：** 在线程中可以使用 `get` 方法来获取线程本地变量的值。

```java
String value = threadLocal.get();
```

3. **子线程继承：** 当子线程创建时，它会继承父线程的 `InheritableThreadLocal` 变量的值。

```java
Thread parentThread = Thread.currentThread();
Thread childThread = new Thread(() -> {
    String inheritedValue = threadLocal.get();
    System.out.println("Inherited value in child thread: " + inheritedValue);
});
childThread.start();
```

4. **清除变量值：** 在不再需要变量时，应该及时清除线程本地变量的值，以避免内存泄漏。

```java
threadLocal.remove();
```

需要注意的是，尽管 `InheritableThreadLocal` 可以实现父子线程之间的变量传递，但在一些特殊情况下，如使用线程池或异步框架时，仍然需要小心处理。

**这是因为线程池中的线程可能会被多次重用，导致上下文信息被不正确地继承。在这种情况下，可能需要在任务开始时明确传递上下文信息，而不依赖于继承**。

总之，`InheritableThreadLocal` 提供了一种在线程间传递数据的机制，特别适用于需要在线程层次结构中传递上下文信息的场景。

然而，在使用它时需要注意线程安全和内存管理问题，确保合理地使用和清除线程本地变量的值。

## Q3-详细介绍 如 Spring 的 `@Async` 或 Java 的 `CompletableFuture`）的上下文传递机制，使用例子

`@Async` 注解和 `CompletableFuture` 都是在异步编程中非常常用的工具，它们都提供了上下文传递机制，使得你可以在线程之间传递上下文信息。以下分别介绍这两种机制，并提供相应的例子：

### 1. Spring 的 `@Async` 注解的上下文传递机制：

Spring 的 `@Async` 注解允许你将方法标记为异步执行，同时还支持在异步方法之间传递上下文信息。默认情况下，`@Async` 方法在调用之前会捕获当前线程的上下文，并在异步执行时恢复这个上下文。

```java
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

@Service
public class AsyncService {

    @Async
    @Transactional
    public void asyncMethodWithTransaction() {
        // 获取当前请求上下文信息
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        
        // 异步方法中可以访问上下文信息
        System.out.println("Async method context: " + attributes);
    }
}
```

在上述示例中，`@Async` 方法中可以访问异步方法启动时的上下文信息，例如请求上下文。这在需要在异步方法中保留一些请求相关信息时非常有用。

### 2. Java 的 `CompletableFuture` 的上下文传递机制：

Java 的 `CompletableFuture` 类提供了一种以函数式方式组合异步操作的机制。当你使用 `CompletableFuture` 进行异步编程时，你可以通过一些方法来传递上下文信息，如 `thenApply`、`thenCompose` 等。

```java
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CompletableFutureExample {

    public static void main(String[] args) {
        ExecutorService executorService = Executors.newFixedThreadPool(5);
        
        CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
            // 异步操作
            return 42;
        }, executorService)
        .thenApplyAsync(result -> {
            // 通过 thenApplyAsync 传递上下文信息
            String context = Thread.currentThread().getName();
            System.out.println("Context in thenApplyAsync: " + context);
            return result * 2;
        }, executorService);
        
        future.thenAcceptAsync(finalResult -> {
            System.out.println("Final result: " + finalResult);
        }, executorService);

        executorService.shutdown();
    }
}
```

在上述示例中，`thenApplyAsync` 和 `thenAcceptAsync` 方法允许你在异步操作中传递上下文信息。通过这种方式，你可以在异步任务链中保留和传递相关的上下文信息。

总之，无论是 Spring 的 `@Async` 注解还是 Java 的 `CompletableFuture`，都提供了在异步编程中传递上下文信息的机制，使得你可以在异步操作中保留需要的上下文。

这对于在异步环境中保持一致的状态和信息非常有用。


# 拓展阅读

[TransmittableThreadLocal (TTL) 解决异步执行时上下文传递的问题](https://houbb.github.io/2023/07/19/ttl)

# 参考资料

[全链路日志追踪traceId(http、dubbo、mq)](https://blog.csdn.net/promisessh/article/details/110532387)

* any list
{:toc}