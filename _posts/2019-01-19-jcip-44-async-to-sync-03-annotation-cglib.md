---
layout: post
title:  java 手写并发框架（三）异步转同步框架注解和字节码增强
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [concurrency, thread, async, sync, sh]
published: true
---

# 序言

上一节我们学习了异步查询转同步的 7 种实现方式，今天我们就来学习一下，如何对其进行封装，使其成为一个更加便于使用的工具。

思维导图如下：

![异步转同步字节码增强](https://upload-images.jianshu.io/upload_images/5874675-14830eea4bf60868?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 拓展阅读

[java 手写并发框架（一）异步查询转同步的 7 种实现方式](https://houbb.github.io/2019/01/18/jcip-42-async-to-sync)

[java 手写并发框架（二）异步转同步框架封装锁策略](https://houbb.github.io/2019/01/18/jcip-43-async-to-sync-02-lock)

[java 手写并发框架（三）异步转同步框架注解和字节码增强](https://houbb.github.io/2019/01/18/jcip-43-async-to-sync-03-annotation-cglib)

# 异步转同步的锁调用

## 同步锁策略

- wait & notify

- 使用条件锁

- 使用 CountDownLatch

- 使用 CyclicBarrier

上一节我们已经对上面的 4 种实现方式进行了详细的介绍，没有看过的同学可以去简单回顾一下。

但是对于调用的方式还没有实现。本文将通过注解结合字节码增强技术来实现这个特性。

## 实现思路

其实整体的实现类似于 spring 的 `@Retry` 注解。

（1）在锁同步方法上使用对应的注解 `@Sync`
 
（2）在异步回调方法上使用注解 `@SyncCallback`

（3）通过字节码增强调用方法，拥有上述注解的方法进行对应的加解锁实现

# 注解的定义

## 同步加锁

`@Sync` 同步注解可以放在希望同步等待的方法上。

```java
package com.github.houbb.sync.api.annotation;

import com.github.houbb.sync.api.constant.LockType;

import java.lang.annotation.*;
import java.util.concurrent.TimeUnit;

/**
 * 异步转同步注解
 *
 * （1）根据标识匹配结果
 * （2）直接简单的返回结果
 *
 * @author binbin.hou
 * @since 0.0.1
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Sync {

    /**
     * 超时时间
     *
     * 单位 mills
     * @return 时间
     * @since 0.0.1
     */
    long timeout() default 60 * 1000L;

    /**
     * 时间单位
     * @return 时间单位
     * @since 0.0.1
     */
    TimeUnit timeUnit() default TimeUnit.MILLISECONDS;

    /**
     * 等待策略
     *
     * （1）基于 countDownLatch 等待
     * （2）基于查询结果等等待
     *
     * 不同等待策略，结果封装对用户不可见。
     * @return 等待
     * @since 0.0.1
     */
    LockType lock() default LockType.COUNT_DOWN_LATCH;

}
```

所有的属性都有默认值，默认为 60s 超时。

默认的加锁策略是 `LockType.COUNT_DOWN_LATCH`。


## 异步解锁

```java
package com.github.houbb.sync.api.annotation;

import java.lang.annotation.*;

/**
 * 异步转同步注解
 *
 * （1）根据标识匹配结果
 * （2）直接简单的返回结果
 *
 * @author binbin.hou
 * @since 0.0.1
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface SyncCallback {

    /**
     * 对应的方法名称
     *
     * @return 方法名称
     * @since 0.0.1
     */
    String value();

}
```

这里异步回调解锁只有一个属性，那就是加锁对应的方法名称。

这里我们不做过多的封装，保证 `@Sync` 注解的方法名称在当前类唯一即可，这个设计理念和 spring 的 `@Retry` 是一样的。

`@SyncCallback` 可以根据方法名称，找到对应的 `@Sync` 注解信息。


# 核心同步类

## 接口定义

```java
package com.github.houbb.sync.api.api;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public interface ISync {

    /**
     * 同步
     * @param context 上下文
     * @return 方法执行结果
     * @since 0.0.1
     * @throws Throwable 异常
     */
    Object sync(final ISyncContext context) throws Throwable;

}
```

接口定义非常简单，只有一个方法，通过上下文返回对应的值。

上下文定义如下：

```java
package com.github.houbb.sync.api.api;

import com.github.houbb.sync.api.annotation.Sync;
import com.github.houbb.sync.api.annotation.SyncCallback;

import java.lang.reflect.Method;

/**
 * sync 上下文
 *
 * @author binbin.hou
 * @since 0.0.1
 */
public interface ISyncContext {

    /**
     * 同步注解信息
     * @return 同步注解
     * @since 0.0.1
     */
    Sync sync();

    /**
     * 注解回调
     * @return 回调
     * @since 0.0.1
     */
    SyncCallback callback();

    /**
     * 参数信息
     * @return 参数信息
     * @since 0.0.7
     */
    Object[] params();

    /**
     * 方法信息
     * @return 方法信息
     * @since 0.0.7
     */
    Method method();

    /**
     * 方法执行
     * @return 执行
     * @since 0.0.1
     * @throws Throwable 异常信息
     */
    Object process() throws Throwable;

}
```

这里就有我们开头定义的注解信息，还有一些字节码增强相关的信息，比如方法，参数等等。

## 同步实现

### 核心代码

同步实现的核心代码如下：

```java
package com.github.houbb.sync.core.core;

import com.github.houbb.heaven.util.lang.ObjectUtil;
import com.github.houbb.heaven.util.lang.reflect.ClassUtil;
import com.github.houbb.sync.api.annotation.Sync;
import com.github.houbb.sync.api.annotation.SyncCallback;
import com.github.houbb.sync.api.api.*;
import com.github.houbb.sync.api.exception.SyncRuntimeException;
import com.github.houbb.sync.core.support.context.SyncLockContext;
import com.github.houbb.sync.core.support.context.SyncUnLockContext;
import com.github.houbb.sync.core.support.lock.Locks;

import java.lang.reflect.Method;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class SimpleSync implements ISync {

    @Override
    public Object sync(ISyncContext context) throws Throwable {
        //1. 判断是 sync 还是 callback
        Sync sync = context.sync();
        if(ObjectUtil.isNotNull(sync)) {
            ISyncLock syncLock = Locks.getLock(sync.lock());
            ISyncLockContext lockContext = SyncLockContext.newInstance()
                    .timeout(sync.timeout())
                    .timeUnit(sync.timeUnit());

            // 方法执行完成之前加锁
            syncLock.lock(lockContext);
            return context.process();
        }

        SyncCallback callback = context.callback();
        if(ObjectUtil.isNotNull(callback)) {
            Sync matchSync = getMatchSync(context.method(), callback);
            ISyncLock syncLock = Locks.getLock(matchSync.lock());
            ISyncUnlockContext unlockContext = SyncUnLockContext.newInstance()
                    .timeout(matchSync.timeout())
                    .timeUnit(matchSync.timeUnit());

            Object result = context.process();
            // 方法执行完成之后解锁
            syncLock.unlock(unlockContext);
            return result;
        }

        return context.process();
    }

}
```

根据上下文中的注解信息，判断是执行加锁，还是解锁。

那加/解锁与方法执行的先后顺序呢？

机智如你不妨花一分钟想一想这个简单的问题。

60

59

...

01

注意加锁解锁的顺序，**方法执行完成之前加锁，方法执行完成之后解锁。**

如果是解锁，则需要获取对应的 `@Sync` 注解。方法试下如下：

### 获取匹配的回调信息

```java
/**
 * 获取匹配的回调信息
 * @param method 回调方法
 * @param callback 回调方法注解信息
 * @return 结果
 * @since 0.0.1
 */
private Sync getMatchSync(final Method method,
                          final SyncCallback callback) {
    String value = callback.value();
    Class<?> clazz = method.getDeclaringClass();
    Method syncMethod = ClassUtil.getMethod(clazz, value);
    Sync sync = syncMethod.getAnnotation(Sync.class);
    if(ObjectUtil.isNull(sync)) {
        throw new SyncRuntimeException(value + " 方法未指定 @Sync 注解信息！");
    }
    return sync;
}
```

这里会根据 `@SyncCallback` 注解中指定的方法名称，遍历当前类的方法，返回匹配的信息。

如果方法不存在，或者方法没有指定 `@Sync` 都会进行报错。

# 字节码增强

## 字节码增强的方式

万事俱备只欠东风。

下面我们只需要使用字节码增强技术，就可以把整个调用链路串联起来。

这里我们使用代理模式，对所有的方法进行增强。

主要有三类：

（1）不需要代理的

（2）有接口的方法，可以通过 jdk 动态代理

（3）没有接口的方法，我们通过 cglib 进行代码增强。

## 增强的方法

我们为 Sync 同步实现添加了一个引导类，便于代理中调用，实际上就是调用上面的方法，实现也非常简单：

```java
package com.github.houbb.sync.core.bs;

import com.github.houbb.sync.api.api.ISync;
import com.github.houbb.sync.api.api.ISyncContext;
import com.github.houbb.sync.core.core.SimpleSync;

/**
 * 引导类
 * @author binbin.hou
 * @since 0.0.1
 */
public final class SyncBs {

    private SyncBs(){}

    /**
     * 同步实现
     * @since 0.0.1
     */
    private final ISync sync = new SimpleSync();

    /**
     * 同步上下文
     * @since 0.0.1
     */
    private ISyncContext syncContext;

    /**
     * 新建对象实例
     * @return 实例
     * @since 0.0.1
     */
    public static SyncBs newInstance() {
        return new SyncBs();
    }

    public SyncBs syncContext(ISyncContext syncContext) {
        this.syncContext = syncContext;
        return this;
    }

    public Object execute() throws Throwable {
        return this.sync.sync(syncContext);
    }

}
```

## 代理实现

### 接口定义

我们为上述三种情况定义统一的接口：

```java
package com.github.houbb.sync.core.support.proxy;

/**
 * 代理接口
 * @author binbin.hou
 * @since 0.0.1
 */
public interface ISyncProxy {

    /**
     * 获取代理实现
     * @return 代理
     * @since 0.0.6
     */
    Object proxy();

}
```

### 不需要代理

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * async All rights reserved.
 */

package com.github.houbb.sync.core.support.proxy.none;

import com.github.houbb.sync.core.support.proxy.ISyncProxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

/**
 * <p> 没有代理 </p>
 *
 * <pre> Created: 2019/3/5 10:23 PM  </pre>
 * <pre> Project: async  </pre>
 *
 * @author houbinbin
 * @since 0.0.1
 */
public class NoneProxy implements InvocationHandler, ISyncProxy {

    /**
     * 代理对象
     */
    private final Object target;

    public NoneProxy(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        return method.invoke(proxy, args);
    }

    /**
     * 返回原始对象，没有代理
     * @return 原始对象
     */
    @Override
    public Object proxy() {
        return this.target;
    }

}
```

这种比较简单，直接反射执行原来的方法即可。

### 动态代理

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * async All rights reserved.
 */

package com.github.houbb.sync.core.support.proxy.dynamic;

import com.github.houbb.sync.api.api.ISyncContext;
import com.github.houbb.sync.core.bs.SyncBs;
import com.github.houbb.sync.core.core.SimpleSyncContext;
import com.github.houbb.sync.core.support.proxy.ISyncProxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.concurrent.CompletionService;

/**
 * <p> 动态代理 </p>
 *
 * <pre> Created: 2019/3/5 10:23 PM  </pre>
 * <pre> Project: sync  </pre>
 *
 * @author houbinbin
 * @since 0.0.1
 */
public class DynamicProxy implements InvocationHandler, ISyncProxy {

    /**
     * 被代理的对象
     */
    private final Object target;

    public DynamicProxy(Object target) {
        this.target = target;
    }

    /**
     * 这种方式虽然实现了异步执行，但是存在一个缺陷：
     * 强制用户返回值为 Future 的子类。
     *
     * 如何实现不影响原来的值，要怎么实现呢？
     * @param proxy 原始对象
     * @param method 方法
     * @param args 入参
     * @return 结果
     * @throws Throwable 异常
     */
    @Override
    @SuppressWarnings("all")
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        ISyncContext context = SimpleSyncContext.newInstance()
                .method(method).params(args).target(target);
        return SyncBs.newInstance().syncContext(context).execute();
    }

    @Override
    public Object proxy() {
        // 我们要代理哪个真实对象，就将该对象传进去，最后是通过该真实对象来调用其方法的
        InvocationHandler handler = new DynamicProxy(target);

        return Proxy.newProxyInstance(handler.getClass().getClassLoader(),
                target.getClass().getInterfaces(), handler);
    }

}
```

通过动态代理进行代码增强，`SyncBs.newInstance().syncContext(context).execute();` 这里就是对于增强方法的执行。

### cglib 字节码增强

```java
package com.github.houbb.sync.core.support.proxy.cglib;

import com.github.houbb.sync.api.api.ISyncContext;
import com.github.houbb.sync.core.bs.SyncBs;
import com.github.houbb.sync.core.core.SimpleSyncContext;
import com.github.houbb.sync.core.support.proxy.ISyncProxy;
import net.sf.cglib.proxy.Enhancer;
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

import java.lang.reflect.Method;

/**
 * CGLIB 代理类
 * @author binbin.hou
 * date 2019/3/7
 * @since 0.0.1
 */
public class CglibProxy implements MethodInterceptor, ISyncProxy {

    /**
     * 被代理的对象
     */
    private final Object target;

    public CglibProxy(Object target) {
        this.target = target;
    }

    @Override
    public Object intercept(Object o, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
        ISyncContext context = SimpleSyncContext.newInstance()
                .method(method).params(args).target(target);
        return SyncBs.newInstance().syncContext(context).execute();
    }

    @Override
    public Object proxy() {
        Enhancer enhancer = new Enhancer();
        //目标对象类
        enhancer.setSuperclass(target.getClass());
        enhancer.setCallback(this);
        //通过字节码技术创建目标对象类的子类实例作为代理
        return enhancer.create();
    }

}
```

对于没有接口的方法，我们通过 cglib 进行代码增强，这点和 spring aop 是保持一致的。

## 代理的调用

我们把三种场景的代理都实现了，那么应该如何判断方法应该调用哪一个代理呢？

这里有一个基本是公用方法，如下：

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * async All rights reserved.
 */

package com.github.houbb.sync.core.support.proxy;

import com.github.houbb.heaven.util.lang.ObjectUtil;
import com.github.houbb.sync.core.support.proxy.cglib.CglibProxy;
import com.github.houbb.sync.core.support.proxy.dynamic.DynamicProxy;
import com.github.houbb.sync.core.support.proxy.none.NoneProxy;

import java.lang.reflect.Proxy;

/**
 * <p> 代理信息 </p>
 *
 * <pre> Created: 2019/3/8 10:38 AM  </pre>
 * <pre> Project: async  </pre>
 *
 * @author houbinbin
 * @since 0.0.1
 */
public final class SyncProxy {

    private SyncProxy(){}

    /**
     * 获取对象代理
     * @param <T> 泛型
     * @param object 对象代理
     * @return 代理信息
     * @since 0.0.6
     */
    @SuppressWarnings("all")
    public static <T> T getProxy(final T object) {
        if(ObjectUtil.isNull(object)) {
            return (T) new NoneProxy(object).proxy();
        }

        final Class clazz = object.getClass();

        // 如果targetClass本身是个接口或者targetClass是JDK Proxy生成的,则使用JDK动态代理。
        // 参考 spring 的 AOP 判断
        if (clazz.isInterface() || Proxy.isProxyClass(clazz)) {
            return (T) new DynamicProxy(object).proxy();
        }

        return (T) new CglibProxy(object).proxy();
    }

}
```

我们根据类本身，选择调用的代理类。

（1）空对象，不做增强

（2）接口或者代理类，使动态代理实现

（3）其他使用 cglib 进行字节码增强。

# 验证

春种秋收，我们辛苦忙活到现在，终于可以验证一下自己的成果了。

上述代码已经上传到 maven 仓库，实际可以直接调用。

## maven 项目依赖

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sync-core</artifactId>
    <version>0.0.1</version>
</dependency>
```

## 入门测试

### 业务代码

通过 `@Sync` 指定需要转同步的方法，通过 `@SyncCallback` 指定回调方法。

```java
import com.github.houbb.sync.api.annotation.Sync;
import com.github.houbb.sync.api.annotation.SyncCallback;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class UserService {

    String id = "";

    @Sync
    public String queryId() {
        System.out.println("开始查询");
        return id;
    }

    @SyncCallback(value = "queryId")
    public void queryIdCallback() {
        System.out.println("回调函数执行");
        id = "123";
    }

}
```

### 测试类

```java
@Test
public void queryIdTest() {
    final UserService proxy = SyncProxy.getProxy(new UserService());

    // 异步执行回调
    new Thread(new Runnable() {
        @Override
        public void run() {
            try {
                System.out.println("开始异步执行回调");
                TimeUnit.SECONDS.sleep(2);
                proxy.queryIdCallback();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }).start();

    String id = proxy.queryId();
    System.out.println("id: " + id);
}
```

### 测试日志

测试日志如下：

```
开始异步执行回调
[DEBUG] [2020-10-09 17:37:56.066] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2020-10-09 17:37:56.076] [main] [c.g.h.s.c.s.l.CountDownLatchLock.lock] - 进入等待，超时时间为：60000，超时单位：MILLISECONDS
回调函数执行
[INFO] [2020-10-09 17:37:58.019] [Thread-0] [c.g.h.s.c.s.l.CountDownLatchLock.unlock] - 执行 unlock 操作
[INFO] [2020-10-09 17:37:58.019] [main] [c.g.h.s.c.s.l.CountDownLatchLock.lock] - 等待结果: true
开始查询
id: 123
```

非常的完美。


# 小结

好了，到这里我们就把上一节中的遗留的问题全部解决了。

但是沉溺于 spring 多年的各位读者一定不满意，我也不满意。

因为我们都知道，结合 spring 之后，调用可以变得更加简单。

由于篇幅原因，spring 整合实现部分将放在下一节。感兴趣的可以关注一下我，便于实时接收最新内容。

觉得本文对你有帮助的话，欢迎点赞评论收藏转发一波。你的鼓励，是我最大的动力~

不知道你有哪些收获呢？或者有其他更多的想法，欢迎留言区和我一起讨论，期待与你的思考相遇。

文中如果链接失效，可以点击 {阅读原文}。

* any list
{:toc}