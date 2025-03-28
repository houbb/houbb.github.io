---
layout: post
title: slf4j-03-SLF4j MDC 如何为日志添加唯一标识 
date: 2018-12-06 11:35:23 +0800
categories: [AI]
tags: [ai, sh]
published: true
excerpt: SLF4j MDC 生成系统的 trace id
---

# MDC 的必要性

## 日志框架

日志框架成熟的也比较多：

[slf4j](https://houbb.github.io/2018/08/27/slf4j)

[log4j](https://houbb.github.io/2017/09/17/log4j)

[logback](https://houbb.github.io/2018/11/19/logback-01-intro)

[log4j2](https://houbb.github.io/2016/05/21/Log4j2)

我们没有必要重复造轮子，一般是建议和 slf4j 进行整合，便于后期替换为其他框架。

## 日志的使用

基本上所有的应用都需要打印日志，但并不是每一个开发都会输出日志。

主要有下面的问题：

（1）日志太少，出问题时无法定位问题

（2）日志太多，查找问题很麻烦，对服务器磁盘也是很大的压力

（3）日志级别控制不合理

（4）没有一个唯一标识贯穿整个调用链路

我们本次主要谈一谈第四个问题。

## 为什么需要唯一标识

对于最常见的 web 应用，每一次请求都可以认为新开了一个线程。

在并发高一点的情况，我们的日志会出现穿插的情况。就是我们看日志时，发现出现不属于当前请求的日志，看起来就会特别累。所以需要一个过滤条件，可以将请求的整个生命周期连接起来，也就是我们常说的 traceId。

我们看日志的时候，比如 traceId='202009021658001'，那么执行如下的命令即可：

```
grep 202009021658001 app.log
```

就可以将这个链路对应的日志全部过滤出来。

那么应该如何实现呢？

## 实现思路

（1）生成一个唯一标识 traceId

这个比较简单，比如 UUID 之类的就行，保证唯一即可。

（2）输出日志时，打印这个 traceId

于是很自然的就会有下面的代码：

```java
logger.info("traceId: {} Controller 层请求参数为: {}", traceId, req);
```

### 缺陷

很多项目都是这种实现方式，这种实现方式有几个问题：

（1）需要参数传递

比如从 controller =》biz =》service，就因为一个 traceId，我们所有的方法都需要多一个参数，用来接受这个值。

非常的不优雅

（2）需要输出 traceId

每次都要记得输出这个值，或者就无法关联。

如果有个别方法忘记输出，那我们根据 traceId 查看日志就会变得很奇怪。

（3）复杂度提高

我们每一个日志都需要区输出这个额外的 traceId，作为一个懒人，不乐意区写这个代码。

那么，有什么方法可以解决这个问题吗？

slf4j 的 MDC 就是为了解决这个问题而存在的。

# MDC 的应用场景

程序中，日志打印时我们有时需要跟踪整个调用链路。

最常见的做法，就是将一个属性，比如 `traceId` 从最外层一致往下传递。

导致每个方法都会多出这个参数，却只是为了打印一个标识，很不推荐。

MDC 就是为了这个场景使用的。

# 简单例子

## 普通实现版本

在方法调用前后，手动设置。

本文展示 aop 的方式，原理一样，更加灵活方便。代码也更加优雅。

## 基于 aop 的方式

### 定义拦截器

```java
import com.baomidou.mybatisplus.toolkit.IdWorker;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

/**
 * 日志拦截器
 * @author binbin.hou
 * @date 2018/12/7
 */
@Component
@Aspect
public class LogAspect {

    /**
     * 限额限日志次的 trace id
     */
    private static final String TRACE_ID = "TRACE_ID";

    /**
     * 拦截入口下所有的 public方法
     */
    @Pointcut("execution(public * com.github.houbb..*(..))")
    public void pointCut() {
    }

    /**
     * 拦截处理
     *
     * @param point point 信息
     * @return result
     * @throws Throwable if any
     */
    @Around("pointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        //添加 MDC
        MDC.put(TRACE_ID, IdWorker.getIdStr());
        Object result = point.proceed();
        //移除 MDC
        MDC.remove(TRACE_ID);
        return result;
    }

}
```

IdWorker.getIdStr() 只是用来生成一个唯一标识，你可以使用 UUID 等来替代。

更多生成唯一标识的方法，参考：

> [分布式id](https://houbb.github.io/2018/09/05/distributed-id)

这个 AOP 的切面一般建议放在调用的入口。

（1）controller 层入口

（2）mq 消费入口

（3）外部 rpc 请求入口

### 定义 logback.xml

定义好了 MDC，接下来我们在日志配置文件中使用即可。

```xml
<encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
    <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%X{TRACE_ID}] [%thread] %logger{50} - %msg%n</pattern>
</encoder>
```

`[%X{TRACE_ID}]` 就是我们系统中需要使用的唯一标识，配置好之后日志中就会将这个标识打印出来。

如果不存在，就是直接空字符串，也不影响。

# 对于已经存在的系统

## 现象

如果有一个已经存在已久的项目，原始的打印日志，都会从最上层把订单编号一直传递下去，你会怎么做？

也是这样，把一个标识号从最开始一直传递到最底层吗？

当然不是的。

你完全可以做的更好。

## 原理

我们知道 MDC 的原理就是在当前的线程中放置一个属性，这个属性在同一个线程中是唯一且共享的。

所以不同的线程之间不会相互干扰。

那么我们对于比较旧的系统，可以采取最简单的方式：

提供一个工具类，可以获取当前线程的订单号。当然，你需要在一个地方将这个值设置到当前线程，一般是方法入口的地方。

## 更好的方式

你可以提供一个打印日志的工具类，复写常见的日志打印方法。

将日志 traceId 信息等隐藏起来，对于开发是不可见的。

## 实现方式 ThreadLocal

不再赘述，参见 [ThreadLocal](https://houbb.github.io/2018/10/08/java-threadlocal)

# 基础的工具类

```java
import org.slf4j.MDC;

/**
 * 日志工具类
 * @author binbin.hou
 */
public final class LogUtil {

    private LogUtil(){}

    /**
     * trace id
     */
    private static final String TRACE_ID = "TRACE_ID";

    /**
     * 设置 traceId
     * @param traceId traceId
     */
    public static void setTraceId(final String traceId) {
        MDC.put(TRACE_ID, traceId);
    }

    /**
     * 移除 traceId
     */
    public static void removeTraceId() {
        MDC.remove(TRACE_ID);
    }

    /**
     * 获取批次号
     * @return 批次号
     */
    public static String getTraceId() {
        return MDC.get(TRACE_ID);
    }

}
```

# 对于异步的处理

## spring 异步

参见 [async 异步](https://houbb.github.io/2018/07/19/async-load)

## 异步的 traceId 处理

在异步的时候，就会另起一个线程。

建议异步的时候，将原来父类线程的唯一标识(traceId) 当做参数传递下去，然后将这个参数设置为子线程的 traceId。

# 不依赖 MDC

## MDC 的限制

MDC 虽然使用起来比较方便，但是毕竟是 slf4j 为我们实现的一个工具。

其原理就是基于 ThreadLocal 保存基于线程隔离标识。

知道这一点，其实我们可以自己实现一个类似 MDC 的功能，满足不同的应用场景。

## 实现思路

（1）生成日志唯一标识

（2）基于 ThreadLocal 保存唯一的线程标识

（3）基于注解+AOP

```java
@Around("@annotation(trace)")
public Object trace(ProceedingJoinPoint joinPoint, Trace trace) {

    // 生成 id
    // 设置 id 到当前线程

    Object result = joinPoint.proceed();    
    // 移除 id
    return result;
}
```

（4）如何使用 id

最简单的方式，就是我们创建一个工具类 LogUtil。

对于常见的方法进行重写，然后日志输出统一调用这个方法。

缺点：日志中的输出 class 类会看不出来，当然可以通过获取方法来解决

优点：实现简单，便于后期拓展和替换。

> [https://github.com/houbb/auto-log](https://github.com/houbb/auto-log)

# 基于 spring 的一个拦截器

## 日志拦截器

```java
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class LogInterceptor implements HandlerInterceptor {

    private final static ThreadLocal<Long> TIME_HOLDER = new ThreadLocal<Long>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        request.setCharacterEncoding("UTF-8");
        TIME_HOLDER.set(System.currentTimeMillis());

        // 输出参数信息

        // 输出请求地址信息

        return false;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 计算耗时
    }
    
}
```

# 拓展阅读

[分布式 id 生成](https://github.com/houbb/id)

[日志自动输出](https://github.com/houbb/auto-log)

# 参考资料

[SLF4j traceID](https://logback.qos.ch/manual/mdc.html)

[基于SLF4J MDC机制实现日志的链路追踪](https://blog.csdn.net/xiaolyuh123/article/details/80593468)

* any list
{:toc}