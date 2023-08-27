---
layout: post
title: 分布式链路追踪-05-mdc 等信息如何跨线程?  Log4j2 与 logback 的实现方式
date:  2023-07-25 +0800
categories: [Trace]
tags: [trace, distributed, sh]
published: true
---

# 背景

日志组件与 slf4j 整合之后，使用的是 slf4j 的 MDC。

# 快速实现

跨线程时，实现方式。

## log4j2

您可以将 log4j2.component.properties 文件放在类路径中来控制 Log4j 2 行为的各个方面。

例如log4j2.component.properties的内容：

```properties
# https://logging.apache.org/log4j/2.x/manual/configuration.html#SystemProperties

# If true use an InheritableThreadLocal to implement the ThreadContext map.
# Otherwise, use a plain ThreadLocal. 
# (Maybe ignored if a custom ThreadContext map is specified.)
# Default is false

# Modern 2.10+
log4j2.isThreadContextMapInheritable=true

# Legacy for pre-2.10
isThreadContextMapInheritable=true
```

### JVM 参数

当然，也可以通过设置  JVM 的方式： `-DisThreadContextMapInheritable=true`

### 系统属性

也可以通过设置系统属性得方式：

```java
System.setProperty("isThreadContextMapInheritable", "true");
```


# MDC 介绍

## 了解MDC

MDC（Mapped Diagnostic Context，映射调试上下文）是 slf4j提供的一种轻量级的日志跟踪工具。Log4j、Logback或者Log4j2等日志中最常见区分同一个请求的方式是通过线程名，而如果
请求量大，线程名在相近的时间内会有很多重复的而无法分辨，因此引出了trace-id，即在接收到的时候生成唯一的请求id，在整个执行链路中带上此唯一id.

MDC.java本身不提供传递traceId的能力，真正提供能力的是MDCAdapter接口的实现。

比如Log4j的是Log4jMDCAdapter，Logback的是LogbackMDCAdapter。

## MDC普通使用

```java
MDC.put(“trace-id”, traceId); // 添加traceId
MDC.remove(“trace-id”); // 移除traceId
```

在日志配置文件中 `<pattern>` 节点中以%X{trace-id}取出，比如：`<pattern>`

```
%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [uniqid-%X{trace-id}] %logger{50}-%line - %m%n</pattern>
```

以上方式，只能在做put操作的当前线程中获取到值。

那是因为MDC的实现原理主要就是ThreadLocal，ThreadLocal只对当前线程有效。

## 多线程中的MDC

要破除ThreadLocal只对当前线程有线的方法有两种：

一种是JDK自带的、ThreadLocal的扩展类InheritableThreadLocal，子线程会拷贝父线程中的变量值

一种是引入alibabatransmittable-thread-local包的TransmittableThreadLocal实现

Sl4j本身的提供的BasicMDCAdapter就是基于InheritableThreadLocal实现了线程间传递，但log4j、logback这两个实际的日志实现没有提供，log4j2提供了但默认关闭。

log4j2主要是根据isThreadContextMapInheritable变量控制的，有两种方法：

1. log4j2.component.properties文件中配置

2. 类型模块中定义,System.setProperty("log4j2.isThreadContextMapInherimeble", "true");

log4j 和logback需要自己手动实现，主要有两种方法，一是手动在线程中的处理，一种是重写LogbackMDCAdapter。

本文以在线程池中创建为例

# MDC的难点功课实战

## 多线程情况下的MDC实现问题

当我们处于多个线程之间进行传递traceId的时候，可能就会存在ThreadLocal的问题了。

那么如果要破除ThreadLocal只对当前线程有线的方法：

（针对于跨线程传递的问题）可以采用JDK自带的、ThreadLocal的扩展类InheritableThreadLocal，子线程会拷贝父线程中的变量值

（针对于线程池线程复用的问题）引入alibaba包的TransmittableThreadLocal实现

（针对于线程池线程复用的问题）自己封装一个线程池去处理线程池所存在的问题

## 针对于跨线程传递的问题

针对于跨线程传递traceId的问题，主要通过InheritableThreadLocal的方式进行拷贝传递即可，需要注意的是，如果没有采用线程池的场景的化，基本上不会出现什么问题，但是如果村子啊线程池的场景下那么就只能我们自己手动实现和处理了，如果采用TransmittableThreadLocal的话大家可以自行百度了，在这里我们主要实现的是自己去通过几种方式实现功能传递。

## 针对于线程池线程复用的问题

如果使用的是Spring的线程池ThreadPoolTaskExecutor

那么就可以采用TaskDecorator的线程任务装饰器方式为线程池的线程提供traceId的传递操作，例如以下代码。

# 修改例子

## 手动重写线程池中创建

```java
import org.slf4j.MDC;
import org.springframework.util.CollectionUtils;

import java.util.Map;
import java.util.concurrent.Callable;

/**
 * @desc: 定义MDC工具类，支持Runnable和Callable两种，目的就是为了把父线程的traceId设置给子线程
 */
public class MdcUtil {

    public static <T> Callable<T> wrap(final Callable<T> callable, final Map<String, String> context) {
        return () -> {
            if (CollectionUtils.isEmpty(context)) {
                MDC.clear();
            } else {
                MDC.setContextMap(context);
            }
            try {
                return callable.call();
            } finally {
                // 清除子线程的，避免内存溢出，就和ThreadLocal.remove()一个原因
                MDC.clear();
            }
        };
    }

    public static Runnable wrap(final Runnable runnable, final Map<String, String> context) {
        return () -> {
            if (CollectionUtils.isEmpty(context)) {
                MDC.clear();
            } else {
                MDC.setContextMap(context);
            }
            try {
                runnable.run();
            } finally {
                MDC.clear();
            }
        };
    }
}
```


```java
import java.util.concurrent.Callable;
import java.util.concurrent.Future;

/**
 * @desc: 把当前的traceId透传到子线程特意加的实现。重点就是 MDC.getCopyOfContextMap()，此方法获取当前线程（父线程）的traceId
 */
public class ThreadPoolMdcExecutor extends ThreadPoolTaskExecutor {
    @Override
    public void execute(Runnable task) {
        super.execute(MdcUtil.wrap(task, MDC.getCopyOfContextMap()));
    }

    @Override
    public Future<?> submit(Runnable task) {
        return super.submit(MdcUtil.wrap(task, MDC.getCopyOfContextMap()));
    }

    @Override
    public <T> Future<T> submit(Callable<T> task) {
        return super.submit(MdcUtil.wrap(task, MDC.getCopyOfContextMap()));
    }
}

```


```java
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import javax.annotation.Resource;
import java.util.concurrent.RejectedExecutionHandler;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;

/**
 * 线程池配置。重点就是把ThreadPoolTaskExecutor换成ThreadPoolMdcExecutor
 **/
@Configuration
public class ThreadPoolConfig {

    @Resource
    private ThreadPoolProperties threadPoolProperties;

    /**
     * 业务用到的线程池
     * @return
     */
    @Bean(name = "threadPoolTaskExecutor")
    public ThreadPoolTaskExecutor threadPoolTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolMdcExecutor();
        executor.setMaxPoolSize(threadPoolProperties.getMaxPoolSize());
        executor.setCorePoolSize(threadPoolProperties.getCorePoolSize());
        executor.setQueueCapacity(threadPoolProperties.getQueueCapacity());
        executor.setKeepAliveSeconds(threadPoolProperties.getKeepAliveSeconds());
        RejectedExecutionHandler handler = ReflectUtil.newInstance(threadPoolProperties.getRejectedExecutionHandler().getClazz());
        executor.setRejectedExecutionHandler(handler);
        return executor;
    }
}
```

# logback扩展，支持跨线程池的mdc跟踪

> [logback扩展，支持跨线程池的mdc跟踪](https://juejin.cn/post/7199908667642200123)

## logback扩展，支持跨线程池的mdc跟踪。

集成使用了Transmittable ThreadLocal(TTL) ：在使用线程池等会缓存线程的组件情况下，提供ThreadLocal值的传递功能，解决异步执行时上下文传递的问题

## 引入 transmittable-thread-local

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>transmittable-thread-local</artifactId>
    <version>2.14.2</version>
</dependency>
```

## 创建 TtlMDCAdapter

注意要放到 org.slf4j 包下面

```java
package org.slf4j;

import com.alibaba.ttl.TransmittableThreadLocal;
import org.slf4j.spi.MDCAdapter;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * @author XJW
 */
public class TtlMDCAdapter implements MDCAdapter {

    /**
     * use com.alibaba.ttl.TransmittableThreadLocal
     */
    final ThreadLocal<Map<String, String>> copyOnInheritThreadLocal = new TransmittableThreadLocal<>();

    private static final int WRITE_OPERATION = 1;
    private static final int READ_OPERATION = 2;

    private static TtlMDCAdapter mtcMDCAdapter;

    // keeps track of the last operation performed
    final ThreadLocal<Integer> lastOperation = new ThreadLocal<>();

    static {
        mtcMDCAdapter = new TtlMDCAdapter();
        // MDC.mdcAdapter 权限问题
        MDC.mdcAdapter = mtcMDCAdapter;
    }

    public static MDCAdapter getInstance() {
        return mtcMDCAdapter;
    }

    private Integer getAndSetLastOperation(int op) {
        Integer lastOp = lastOperation.get();
        lastOperation.set(op);
        return lastOp;
    }

    private static boolean wasLastOpReadOrNull(Integer lastOp) {
        return lastOp == null || lastOp == READ_OPERATION;
    }

    private Map<String, String> duplicateAndInsertNewMap(Map<String, String> oldMap) {
        Map<String, String> newMap = Collections.synchronizedMap(new HashMap<String, String>());
        if (oldMap != null) {
            // we don't want the parent thread modifying oldMap while we are
            // iterating over it
            synchronized (oldMap) {
                newMap.putAll(oldMap);
            }
        }

        copyOnInheritThreadLocal.set(newMap);
        return newMap;
    }

    /**
     * Put a context value (the <code>val</code> parameter) as identified with the
     * <code>key</code> parameter into the current thread's context map. Note that
     * contrary to log4j, the <code>val</code> parameter can be null.
     * <p/>
     * <p/>
     * If the current thread does not have a context map it is created as a side
     * effect of this call.
     *
     * @throws IllegalArgumentException in case the "key" parameter is null
     */
    @Override
    public void put(String key, String val) {
        if (key == null) {
            throw new IllegalArgumentException("key cannot be null");
        }

        Map<String, String> oldMap = copyOnInheritThreadLocal.get();
        Integer lastOp = getAndSetLastOperation(WRITE_OPERATION);

        if (wasLastOpReadOrNull(lastOp) || oldMap == null) {
            Map<String, String> newMap = duplicateAndInsertNewMap(oldMap);
            newMap.put(key, val);
        } else {
            oldMap.put(key, val);
        }
    }

    /**
     * Remove the the context identified by the <code>key</code> parameter.
     * <p/>
     */
    @Override
    public void remove(String key) {
        if (key == null) {
            return;
        }
        Map<String, String> oldMap = copyOnInheritThreadLocal.get();
        if (oldMap == null) {
            return;
        }

        Integer lastOp = getAndSetLastOperation(WRITE_OPERATION);

        if (wasLastOpReadOrNull(lastOp)) {
            Map<String, String> newMap = duplicateAndInsertNewMap(oldMap);
            newMap.remove(key);
        } else {
            oldMap.remove(key);
        }

    }


    /**
     * Clear all entries in the MDC.
     */
    @Override
    public void clear() {
        lastOperation.set(WRITE_OPERATION);
        copyOnInheritThreadLocal.remove();
    }

    /**
     * Get the context identified by the <code>key</code> parameter.
     * <p/>
     */
    @Override
    public String get(String key) {
        Map<String, String> map = getPropertyMap();
        if ((map != null) && (key != null)) {
            return map.get(key);
        } else {
            return null;
        }
    }

    /**
     * Get the current thread's MDC as a map. This method is intended to be used
     * internally.
     */
    public Map<String, String> getPropertyMap() {
        lastOperation.set(READ_OPERATION);
        return copyOnInheritThreadLocal.get();
    }


    /**
     * Return a copy of the current thread's context map. Returned value may be
     * null.
     */
    @Override
    public Map getCopyOfContextMap() {
        lastOperation.set(READ_OPERATION);
        Map<String, String> hashMap = copyOnInheritThreadLocal.get();
        if (hashMap == null) {
            return null;
        } else {
            return new HashMap<>(hashMap);
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public void setContextMap(Map contextMap) {
        lastOperation.set(WRITE_OPERATION);

        Map<String, String> newMap = Collections.synchronizedMap(new HashMap<String, String>());
        newMap.putAll(contextMap);

        // the newMap replaces the old one for serialisation's sake
        copyOnInheritThreadLocal.set(newMap);


    }
}
```

## 创建 TtlMdcListener

```java
package ai.guiji.common.logback;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.LoggerContextListener;
import ch.qos.logback.core.spi.ContextAwareBase;
import ch.qos.logback.core.spi.LifeCycle;
import org.slf4j.TtlMDCAdapter;

/**
 * @author XJW
 */
public class TtlMdcListener extends ContextAwareBase implements LoggerContextListener, LifeCycle {
    @Override
    public void start() {
        addInfo("load TtlMDCAdapter...");
        TtlMDCAdapter.getInstance();
    }

    @Override
    public void stop() {

    }

    @Override
    public boolean isStarted() {
        return false;
    }

    @Override
    public boolean isResetResistant() {
        return false;
    }

    @Override
    public void onStart(LoggerContext loggerContext) {

    }

    @Override
    public void onReset(LoggerContext loggerContext) {

    }

    @Override
    public void onStop(LoggerContext loggerContext) {

    }

    @Override
    public void onLevelChange(Logger logger, Level level) {

    }
}
```

## 配置使用

设置 MDC

```java
String traceId = UUID.randomUUID().toString(true);
MDC.put("traceId", traceId);
```

配置日志格式：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration >
    <!-- ...(略) -->
    <contextListener class="com.ofpay.logback.TtlMdcListener"/>

    <!--例子:  %X{uuid} 支持在跨线程池时传递-->
    <property scope="context" name="APP_PATTERN"
              value='%d{yyyy-MM-dd HH:mm:ss.SSS}|%X{traceId}|%level|%M|%C:%L|%thread|%replace(%.-2000msg){"(\r|\n)","\t"}|"%.-2000ex{full}"%n'/>
</configuration>
```

# log4j2 底层实现原理


我们继续追踪StaticLoggerBinder,这里是一个单例，具体的实现是Log4jLoggerFactory

```java
public final class StaticLoggerBinder implements LoggerFactoryBinder {
    //单例
    private static final StaticLoggerBinder SINGLETON = new StaticLoggerBinder();
    private StaticLoggerBinder() {
        loggerFactory = new Log4jLoggerFactory();
    }
}
```

我们再看下MDC

```java
public class MDC {
    private static MDCAdapter bwCompatibleGetMDCAdapterFromBinder() throws NoClassDefFoundError {
        try {
            //因为log4j2中没有getSingleton()方法，所以一定走catch
            return StaticMDCBinder.getSingleton().getMDCA();
        } catch (NoSuchMethodError nsme) {
            // binding is probably a version of SLF4J older than 1.7.14
            return StaticMDCBinder.SINGLETON.getMDCA();
        }
    }
    static {
        try {
            mdcAdapter = bwCompatibleGetMDCAdapterFromBinder();
        } catch (NoClassDefFoundError ncde) {
            mdcAdapter = new NOPMDCAdapter();
        }
    }
}

public final class StaticMDCBinder {
    public MDCAdapter getMDCA() {
        return new Log4jMDCAdapter();
    }
}

//最终发现实现在
public class Log4jMDCAdapter implements MDCAdapter {
     public void put(final String key, final String val) {
        ThreadContext.put(key, val);
    }
}


//我们再看ThreadContext

public final class ThreadContext {
    static {
        init();
    }
    static void init() {
        //默认true
        useStack = !(managerProps.getBooleanProperty(DISABLE_STACK) || disableAll);
        //默认true
        boolean useMap = !(managerProps.getBooleanProperty(DISABLE_MAP) || disableAll);

        contextStack = new DefaultThreadContextStack(useStack);
        if (!useMap) {
            contextMap = new NoOpThreadContextMap();
        } else {
            contextMap = ThreadContextMapFactory.createThreadContextMap();
        }
    }
}


//我们再看下：

ThreadContextMapFactory.createThreadContextMap(){
    if (result == null) {
            result = createDefaultThreadContextMap();
    }
    return result;
}

private static ThreadContextMap createDefaultThreadContextMap() {
    //最终走的是这里
    return new CopyOnWriteSortedArrayThreadContextMap();
}
public CopyOnWriteSortedArrayThreadContextMap() {
    this.localMap = createThreadLocalMap();
}

   private ThreadLocal<StringMap> createThreadLocalMap() {
        //在这里我们也能看到log4j2的MDC也是可以支持多线程的，只不过模式是ThreadLocal
        if (inheritableMap) {
            return new InheritableThreadLocal<StringMap>() {
                @Override
                protected StringMap childValue(final StringMap parentValue) {
                    if (parentValue == null) {
                        return null;
                    }
                    final StringMap stringMap = createStringMap(parentValue);
                    stringMap.freeze();
                    return stringMap;
                }
            };
        }
        // if not inheritable, return plain ThreadLocal with null as initial value
        return new ThreadLocal<>();
    }
```

到此，我们可以看到MDC底层用的是ThreadLocal。我可以通过设置环境变量isThreadContextMapInheritable=true开启支持多线程版本的InheritableThreadLocal

当然除了支持开启多线程版本的ThreadLocal，我们也可以重写ThreadPoolTaskExecutor中的submit拷贝主线程到子线程

```java
public class MdcThreadPoolTaskExecutor extends ThreadPoolTaskExecutor {

    private static final long serialVersionUID = 53094863482765933L;

    private Logger logger = LoggerFactory.getLogger(MdcThreadPoolTaskExecutor.class);

    private final static String LSH = "lsh";

    @Override
    public <T> Future<T> submit(Callable<T> task) {
        Map<String, String> context = MDC.getCopyOfContextMap();
        logger.info("----MDC content:{}", context);
        return super.submit(() -> {
            // 将父线程的MDC内容传给子线程
            T result;
            if (MapUtils.isNotEmpty(context) && !Strings.isNullOrEmpty(context.get(LSH))) {
                MDC.setContextMap(context);
            } else {
                MDC.put(LSH, "lsh_" + StringUtils.randomUUIDSplit()); //为空设置新值
            }
            try {
                result = task.call();
            } finally {
                try {
                    MDC.clear();
                } catch (Exception e2) {
                    logger.warn("mdc clear exception.", e2);
                }
            }
            return result;
        });
    }
}
```

## 简单分析

MDC最终和业务线程绑定

使用ThreadLocal，生命周期随着业务线程结束而结束

log4j2 可以通过设置环境变量isThreadContextMapInheritable=true开启支持多线程版本的ThreadLocal（logback默认InheritableThreadLocal）




# 拓展阅读

[TransmittableThreadLocal (TTL) 解决异步执行时上下文传递的问题](https://houbb.github.io/2023/07/19/ttl)

> [slf4j MDCAdapter with multi-thread-context 支持](https://github.com/alibaba/transmittable-thread-local/issues/51)

# 参考资料

[全链路日志追踪traceId(http、dubbo、mq)](https://blog.csdn.net/promisessh/article/details/110532387)

https://stackoverflow.com/questions/49188105/log4j2-isthreadcontextmapinheritable-property-usage

https://logging.apache.org/log4j/2.x/manual/configuration.html

https://blog.51cto.com/yxkong/6097498

https://www.jianshu.com/p/e86cfb843ceb

https://www.cnblogs.com/jingzh/p/17248886.html

https://www.cnblogs.com/liboware/p/16908270.html

[日志系统→门面、实现技术，链路跟踪（MDC）、日志脱敏](https://blog.csdn.net/qq_23095607/article/details/119487632)

* any list
{:toc}