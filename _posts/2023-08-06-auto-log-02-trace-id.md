---
layout: post
title: autoLog-02-java 注解结合 spring aop 实现日志traceId唯一标识
date:  2023-08-06 +0800
categories: [Trace]
tags: [spring, aop, cglib, log, sh]
published: true
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


# 开源工具


[auto-log](https://github.com/houbb/auto-log) 是一款为 java 设计的自动日志监控框架。

## 创作目的

经常会写一些工具，有时候手动加一些日志很麻烦，引入 spring 又过于大材小用。

所以希望从从简到繁实现一个工具，便于平时使用。

## 特性

- 基于注解+字节码，配置灵活

- 自动适配常见的日志框架

- 支持编程式的调用

- 支持注解式，完美整合 spring

- 支持整合 spring-boot

- 支持慢日志阈值指定，耗时，入参，出参，异常信息等常见属性指定

- 支持 traceId 特性

> [变更日志](https://github.com/houbb/auto-log/blob/master/CHANGELOG.md)

# 快速开始

## maven 引入

```xml
<dependency>
    <group>com.github.houbb</group>
    <artifact>auto-log-core</artifact>
    <version>0.0.8</version>
</dependency>
```

## 入门案例

```java
UserService userService = AutoLogHelper.proxy(new UserServiceImpl());
userService.queryLog("1");
```

- 日志如下

```
[INFO] [2020-05-29 16:24:06.227] [main] [c.g.h.a.l.c.s.i.AutoLogMethodInterceptor.invoke] - public java.lang.String com.github.houbb.auto.log.test.service.impl.UserServiceImpl.queryLog(java.lang.String) param is [1]
[INFO] [2020-05-29 16:24:06.228] [main] [c.g.h.a.l.c.s.i.AutoLogMethodInterceptor.invoke] - public java.lang.String com.github.houbb.auto.log.test.service.impl.UserServiceImpl.queryLog(java.lang.String) result is result-1
```

### 代码

其中方法实现如下：

- UserService.java

```java
public interface UserService {

    String queryLog(final String id);

}
```

- UserServiceImpl.java

直接使用注解 `@AutoLog` 指定需要打日志的方法即可。

```java
public class UserServiceImpl implements UserService {

    @Override
    @AutoLog
    public String queryLog(String id) {
        return "result-"+id;
    }

}
```

## TraceId 的例子

### 代码

```java
UserService service =  AutoLogProxy.getProxy(new UserServiceImpl());
service.traceId("1");
```

其中 traceId 方法如下：

```java
@AutoLog
@TraceId
public String traceId(String id) {
    return id+"-1";
}
```

### 测试效果

```
信息: [ba7ddaded5a644e5a58fbd276b6657af] <traceId>入参: [1].
信息: [ba7ddaded5a644e5a58fbd276b6657af] <traceId>出参：1-1.
```

其中 ba7ddaded5a644e5a58fbd276b6657af 就是对应的 traceId，可以贯穿整个 thread 周期，便于我们日志查看。

# 注解说明

## @AutoLog

核心注解 `@AutoLog` 的属性说明如下：

| 属性 | 类型 | 默认值 | 说明 |
|:--|:--|:--|:--|
| param | boolean | true | 是否打印入参 |
| result | boolean | true | 是否打印出参 |
| costTime | boolean | false | 是否打印耗时 |
| exception | boolean | true | 是否打印异常 |
| slowThresholdMills | long | -1 | 当这个值大于等于 0 时，且耗时超过配置值，会输出慢日志 |
| description | string |"" | 方法描述，默认选择方法名称 |

## @TraceId

`@TraceId` 放在需要设置 traceId 的方法上，比如 Controller 层，mq 的消费者，rpc 请求的接受者等。

| 属性 | 类型 | 默认值 | 说明 |
|:--|:--|:--|:--|
| id | Class | 默认为 uuid | traceId 的实现策略 |
| putIfAbsent | boolean | false | 是否在当前线程没有值的时候才设置值 |

# spring 整合使用

完整示例参考 [SpringServiceTest](https://github.com/houbb/auto-log/tree/master/auto-log-test/src/test/java/com/github/houbb/auto/log/spring/SpringServiceTest.java)

## 注解声明

使用 `@EnableAutoLog` 启用自动日志输出

```java
@Configurable
@ComponentScan(basePackages = "com.github.houbb.auto.log.test.service")
@EnableAutoLog
public class SpringConfig {
}
```

## 测试代码

```java
@ContextConfiguration(classes = SpringConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class SpringServiceTest {

    @Autowired
    private UserService userService;

    @Test
    public void queryLogTest() {
        userService.queryLog("1");
    }

}
```

- 输出结果

```
信息: public java.lang.String com.github.houbb.auto.log.test.service.impl.UserServiceImpl.queryLog(java.lang.String) param is [1]
五月 30, 2020 12:17:51 下午 com.github.houbb.auto.log.core.support.interceptor.AutoLogMethodInterceptor info
信息: public java.lang.String com.github.houbb.auto.log.test.service.impl.UserServiceImpl.queryLog(java.lang.String) result is result-1
五月 30, 2020 12:17:51 下午 org.springframework.context.support.GenericApplicationContext doClose
```

# springboot 整合使用

## maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>auto-log-springboot-starter</artifactId>
    <version>0.0.8</version>
</dependency>
```

只需要引入 jar 即可，其他的什么都不用配置。

使用方式和 spring 一致。

## 测试

```java
@Autowired
private UserService userService;

@Test
public void queryLogTest() {
    userService.query("spring-boot");
}
```

## 开源地址

> Github: [https://github.com/houbb/auto-log](https://github.com/houbb/auto-log)

> Gitee: [https://gitee.com/houbinbin/auto-log](https://gitee.com/houbinbin/auto-log)

![深入学习](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b3475fdb1fc5404fa3f28b42c43a75db~tplv-k3u1fbpfcp-zoom-1.image)

# 拓展阅读

[分布式 id 生成](https://github.com/houbb/id)

[日志自动输出](https://github.com/houbb/auto-log)

# 参考资料

[SLF4j traceID](https://logback.qos.ch/manual/mdc.html)

[基于SLF4J MDC机制实现日志的链路追踪](https://blog.csdn.net/xiaolyuh123/article/details/80593468)

# 参考资料

> [auto-log](https://github.com/houbb/auto-log) 

* any list
{:toc}