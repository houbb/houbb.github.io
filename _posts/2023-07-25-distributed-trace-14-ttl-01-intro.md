---
layout: post
title: TransmittableThreadLocal (TTL) 解决异步执行时上下文传递的问题
date:  2023-07-25 08:00:00 +0800
categories: [Trace]
tags: [trace, distributed, sh]
published: true
---

# TTL 的作用

用ttl解决异步调用存在的问题（在这里我们也一并说了不再啰嗦）

上边我们也说了，MDC底层 DefaultThreadContextMap 是用 ThreadLocal 来保存的链路信息，而ThreadLocal是同一个线程，才会有相同的副本数据，而当我们在项目中使用线程池时候，主线程和子线程肯定是不一样的，那么这种情况下就得考虑如何将主线程的值传递给子线程，让子线程也能记录traceId,从而保证 链路不会断！

值的一说的是jdk也想到了这个问题，提供了一个 InheritableThreadLocal类，但是这个类并不适用于链路追踪场景，因为在异步调用场景下，是要保证每一次请求，都要将主线程的traceId传递给子线程，而 InheritableThreadLocal只能是第一次时候传递,或者说他不是每次都传递给子线程更贴切，下边看下官方的描述：

InheritableThreadLocal存在的问题：官方原话: 使用InheritableThreadLocal时(ThreadContext 可能并不总是自动传递给工作线程)

由于线程池的复用机制，所以第n次请求时，线程池中线程所打印出的链路id,还是上次或者是上n次的链路id（我试验了确实如此）,而我们真实希望是，线程池中线程打印的链路id保持和当前主线程中的链路id一致，换句话说: 我们需要的是 任务提交给线程池时的链路id传递到 任务执行时。

既然InheritableThreadLocal不满足需求，那么怎么办呢？看下边：

在log4j2中，他底层是通过spi机制提供了 对 ThreadContextMap接口的扩展能力 ，不了解的可以去看看官网，而正好阿里开源了一个这个小框架 ttl 和 ttl-thread-context-map ，ttl-thread-context-map 可以解决线程间的传递丢失问题（他内部也是使用的TransmittableThreadLocal也就是ttl来存储MDC 的key和value）。ttl-thread-context-map 依赖java的spi机制，依靠spi机制，让log4j2 在启动加载时，用log4j2.component.properties中 log4j2.threadContextMap这个key 对应的 value作为ThreadContextMap 接口的实现（也就是替换掉DefaultThreadContextMap这个默认实现）,从而实现了线程间传递的功能。对ttl和ttl-thread-context-map不熟悉的可以跳的github 讲的很详细很清楚。

TtlThreadContextMap内部使用TransmittableThreadLocal来存储MDC的key,value spi配置：

而我们使用阿里这个工具也很简单首先maven引入(注意版本 不清楚的去maven库看看)

```xml
<dependency>
   <groupId>com.alibaba</groupId>
   <artifactId>transmittable-thread-local</artifactId>
   <version>2.14.2</version>
</dependency>
<dependency>
   <groupId>com.alibaba</groupId>
   <artifactId>log4j2-ttl-thread-context-map</artifactId>
   <exclusions>
      <exclusion>
         <groupId>org.apache.logging.log4j</groupId>
         <artifactId>log4j-api</artifactId>
      </exclusion>
   </exclusions>
   <version>1.4.0</version>
   <scope>runtime</scope>
</dependency>
```

在引入这个后，我什么也没配，如果我使用jdk的 ThreadPoolExecutor 或者spring的 ThreadPoolTaskExecutor，都是可以实现链路传递的，但是我使用 CompletableFuture的话，第一次请求的链路是对的，当第二次请求时候，CompletableFuture线程池中的打印链路信息还是第一次的，这个问题github上有说明，作者让使用javaagent来解决，果然在我配置javaagent后，CompletableFuture 的链路信息每次都是正确的。

在idea 的 VM options 中配置：

```
-javaagent:/~/transmittable-thread-local-2.14.2.jar
```

即可解决 CompletableFuture的链路id传递问题（这里我们最好是agent这样对代码无侵入，如果你使用TtlRunable修饰Runable的话 对代码侵入比较多，维护起来也比较麻烦）

# 功能

👉 TransmittableThreadLocal(TTL)：在使用线程池等会池化复用线程的执行组件情况下，提供ThreadLocal值的传递功能，解决异步执行时上下文传递的问题。

一个Java标准库本应为框架/中间件设施开发提供的标配能力，本库功能聚焦 & 0依赖，支持Java 6~21。

JDK的InheritableThreadLocal类可以完成父线程到子线程的值传递。

但对于使用线程池等会池化复用线程的执行组件的情况，线程由线程池创建好，并且线程是池化起来反复使用的；这时父子线程关系的ThreadLocal值传递已经没有意义，应用需要的实际上是把 任务提交给线程池时的ThreadLocal值传递到 任务执行时。

本库提供的TransmittableThreadLocal类继承并加强InheritableThreadLocal类，解决上述的问题，使用详见 User Guide。

整个TransmittableThreadLocal库的核心功能（用户API、线程池ExecutorService/ForkJoinPool/TimerTask及其线程工厂的Wrapper；

开发者API、框架/中间件的集成API），只有 ~1000 SLOC代码行，非常精小。

# 需求场景
ThreadLocal的需求场景即TransmittableThreadLocal的潜在需求场景，如果你的业务需要『在使用线程池等会池化复用线程的执行组件情况下传递ThreadLocal值』则是TransmittableThreadLocal目标场景。

下面是几个典型场景例子。

- 分布式跟踪系统 或 全链路压测（即链路打标）

- 日志收集记录系统上下文

- Session级Cache

- 应用容器或上层框架跨应用代码给下层SDK传递信息

各个场景的展开说明参见子文档 需求场景。

# User Guide

使用类TransmittableThreadLocal来保存值，并跨线程池传递。

TransmittableThreadLocal继承InheritableThreadLocal，使用方式也类似。

相比InheritableThreadLocal，添加了protected的transmitteeValue()方法，用于定制 任务提交给线程池时 的ThreadLocal值传递到 任务执行时 的传递方式，缺省是简单的赋值传递。

注意：如果传递的对象（引用类型）会被修改，且没有做深拷贝（如直接传递引用或是浅拷贝），那么

- 因为跨线程传递而不再有线程封闭，传递对象在多个线程之间是有共享的。

- 与JDK的InheritableThreadLocal.childValue()一样，需要使用者/业务逻辑注意保证传递对象的线程安全。

## 1. 简单使用

父线程给子线程传递值。

示例代码：

```java
TransmittableThreadLocal<String> context = new TransmittableThreadLocal<>();

// =====================================================

// 在父线程中设置
context.set("value-set-in-parent");

// =====================================================

// 在子线程中可以读取，值是"value-set-in-parent"
String value = context.get();
```

这其实是InheritableThreadLocal的功能，应该使用InheritableThreadLocal来完成。

但对于使用线程池等会池化复用线程的执行组件的情况，线程由线程池创建好，并且线程是池化起来反复使用的；

这时父子线程关系的ThreadLocal值传递已经没有意义，应用需要的实际上是把 任务提交给线程池时的ThreadLocal值传递到 任务执行时。

# 2. 保证线程池中传递值

## 2.1 修饰Runnable和Callable

使用TtlRunnable和TtlCallable来修饰传入线程池的Runnable和Callable。

示例代码：

```java
TransmittableThreadLocal<String> context = new TransmittableThreadLocal<>();

// =====================================================

// 在父线程中设置
context.set("value-set-in-parent");

Runnable task = new RunnableTask();
// 额外的处理，生成修饰了的对象ttlRunnable
Runnable ttlRunnable = TtlRunnable.get(task);
executorService.submit(ttlRunnable);

// =====================================================

// Task中可以读取，值是"value-set-in-parent"
String value = context.get();
```

### 注意：

即使是同一个Runnable任务多次提交到线程池时，每次提交时都需要通过修饰操作（即TtlRunnable.get(task)）以抓取这次提交时的TransmittableThreadLocal上下文的值；

即如果同一个任务下一次提交时不执行修饰而仍然使用上一次的TtlRunnable，则提交的任务运行时会是之前修饰操作所抓取的上下文。

示例代码如下

```java
// 第一次提交
Runnable task = new RunnableTask();
executorService.submit(TtlRunnable.get(task));

// ...业务逻辑代码，
// 并且修改了 TransmittableThreadLocal上下文 ...
context.set("value-modified-in-parent");

// 再次提交
// 重新执行修饰，以传递修改了的 TransmittableThreadLocal上下文
executorService.submit(TtlRunnable.get(task));
```

上面演示了Runnable，Callable的处理类似

```java
TransmittableThreadLocal<String> context = new TransmittableThreadLocal<>();

// =====================================================

// 在父线程中设置
context.set("value-set-in-parent");

Callable call = new CallableTask();
// 额外的处理，生成修饰了的对象ttlCallable
Callable ttlCallable = TtlCallable.get(call);
executorService.submit(ttlCallable);

// =====================================================

// Call中可以读取，值是"value-set-in-parent"
String value = context.get();
```

- 整个过程的完整时序图

![完整时序图](https://user-images.githubusercontent.com/1063891/233595980-ef7f1f8b-36cd-45b3-b55b-45f7b3d1c94f.png)

## 2.2 修饰线程池

省去每次Runnable和Callable传入线程池时的修饰，这个逻辑可以在线程池中完成。

通过工具类TtlExecutors完成，有下面的方法：

getTtlExecutor：修饰接口Executor

getTtlExecutorService：修饰接口ExecutorService

getTtlScheduledExecutorService：修饰接口ScheduledExecutorService

示例代码：

```java
ExecutorService executorService = ...
// 额外的处理，生成修饰了的对象executorService
executorService = TtlExecutors.getTtlExecutorService(executorService);

TransmittableThreadLocal<String> context = new TransmittableThreadLocal<>();

// =====================================================

// 在父线程中设置
context.set("value-set-in-parent");

Runnable task = new RunnableTask();
Callable call = new CallableTask();
executorService.submit(task);
executorService.submit(call);

// =====================================================

// Task或是Call中可以读取，值是"value-set-in-parent"
String value = context.get();
```

## 2.3 使用Java Agent来修饰JDK线程池实现类

这种方式，实现线程池的传递是透明的，业务代码中没有修饰Runnable或是线程池的代码。即可以做到应用代码 无侵入。

关于 无侵入 的更多说明参见文档 [Java Agent方式对应用代码无侵入](https://github.com/alibaba/transmittable-thread-local/blob/master/docs/developer-guide.md#java-agent%E6%96%B9%E5%BC%8F%E5%AF%B9%E5%BA%94%E7%94%A8%E4%BB%A3%E7%A0%81%E6%97%A0%E4%BE%B5%E5%85%A5)。

示例代码：

```java
// ## 1. 框架上层逻辑，后续流程框架调用业务 ##
TransmittableThreadLocal<String> context = new TransmittableThreadLocal<>();
context.set("value-set-in-parent");

// ## 2. 应用逻辑，后续流程业务调用框架下层逻辑 ##
ExecutorService executorService = Executors.newFixedThreadPool(3);

Runnable task = new RunnableTask();
Callable call = new CallableTask();
executorService.submit(task);
executorService.submit(call);

// ## 3. 框架下层逻辑 ##
// Task或是Call中可以读取，值是"value-set-in-parent"
String value = context.get();
```

# 参考资料

https://github.com/alibaba/transmittable-thread-local

* any list
{:toc}