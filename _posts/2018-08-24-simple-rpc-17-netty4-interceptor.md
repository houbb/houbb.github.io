---
layout: post
title: 基于 netty4 手写 rpc-17-interceptor 拦截器
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# 拦截器

## 说明

有时候我们需要统计方法的耗时，需要知道统计出参/入参的相关信息。

通过拦截器都可以非常方便的实现。

## 设计思路

无论是客户端还是服务端，只需要在方法执行前后，加入拦截器相关的方法调用，加入对应的上下文信息即可。

# 客户端实现

## 个人理解

目前主要在客户端添加拦截器，其实服务端是类似的。

# 代码实现

## 接口定义

```java
package com.github.houbb.rpc.common.support.inteceptor;

/**
 * rpc 拦截器
 *
 * 【调用示意流程】
 *
 * <pre>
 *
 * remoteCall() {
 *
 *     try() {
 *          before();
 *
 *         //.... 原来的调用逻辑
 *
 *         after();
 *     } catch(Ex ex) {
 *         ex();
 *     }
 *
 * }
 * </pre>
 *
 * 【拦截器 chain】
 * 将多个拦截器视为一个拦截器。
 * 保证接口的纯粹与统一。
 *
 * @author binbin.hou
 * @since 0.1.4
 */
public interface Interceptor {

    /**
     * 开始
     * @param context 上下文
     * @since 0.1.4
     */
    void before(final InterceptorContext context);

    /**
     * 结束
     * @param context 上下文
     * @since 0.1.4
     */
    void after(final InterceptorContext context);

    /**
     * 异常处理
     * @param context 上下文
     * @since 0.1.4
     */
    void exception(final InterceptorContext context);

}
```

## 抽象类

便于拓展，实现最基本的拓展类：

```java
package com.github.houbb.rpc.common.support.inteceptor.impl;

import com.github.houbb.rpc.common.support.inteceptor.Interceptor;
import com.github.houbb.rpc.common.support.inteceptor.InterceptorContext;

/**
 * rpc 拦截器适配器
 * @author binbin.hou
 * @since 0.1.4
 */
public class InterceptorAdaptor implements Interceptor {

    @Override
    public void before(InterceptorContext context) {

    }

    @Override
    public void after(InterceptorContext context) {

    }

    @Override
    public void exception(InterceptorContext context) {

    }

}
```

## 耗时实现

最基本的耗时统计，也可以添加其他比如入参、出参统计等操作。

```java
package com.github.houbb.rpc.common.support.inteceptor.impl;

import com.github.houbb.heaven.util.time.impl.Times;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.common.support.inteceptor.InterceptorContext;

/**
 * 内置耗时 rpc 拦截器实现
 * @author binbin.hou
 * @since 0.1.4
 */
public class CostTimeInterceptor extends InterceptorAdaptor {

    private static final Log LOG = LogFactory.getLog(CostTimeInterceptor.class);

    @Override
    public void before(InterceptorContext context) {
        context.startTime(Times.systemTime());
    }

    @Override
    public void after(InterceptorContext context) {
        long costMills = Times.systemTime() - context.startTime();
        LOG.info("[Interceptor] cost time {} mills for traceId: {}", costMills,
                context.traceId());
    }

}
```

# 客户端

可以端代码需要进行调整

```java
/**
 * （1）方法执行并不需要一定要有实现类。
 * （2）直接根据反射即可处理相关信息。
 * （3）rpc 是一种强制根据接口进行编程的实现方式。
 * @author binbin.hou
 * @since 0.0.6
 */
public class DefaultReferenceProxy<T> implements ReferenceProxy<T> {

    private static final Log LOG = LogFactory.getLog(DefaultReferenceProxy.class);

    /**
     * 代理上下文
     * （1）这个信息不应该被修改，应该和指定的 service 紧密关联。
     * @since 0.0.6
     */
    private final ServiceContext<T> proxyContext;

    /**
     * 远程调用接口
     * @since 0.1.1
     */
    private final RemoteInvokeService remoteInvokeService;

    public DefaultReferenceProxy(ServiceContext<T> proxyContext, RemoteInvokeService remoteInvokeService) {
        this.proxyContext = proxyContext;
        this.remoteInvokeService = remoteInvokeService;
    }

    /**
     * 反射调用
     * @param proxy 代理
     * @param method 方法
     * @param args 参数
     * @return 结果
     * @throws Throwable 异常
     * @since 0.0.6
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 状态判断
        final String traceId = Ids.uuid32();
        final int statusCode = proxyContext.statusManager().status();
        StatusEnum.assertEnable(statusCode);

        //1. 拦截器
        final Interceptor interceptor = proxyContext.interceptor();
        final InterceptorContext interceptorContext = DefaultInterceptorContext.newInstance()
                .traceId(traceId);
        interceptor.before(interceptorContext);

        // 不变

        //3. 执行远程调用
        Object result = remoteInvokeService.remoteInvoke(context);
        interceptor.after(interceptorContext);
        return result;
    }

    // 不变

}
```

在调用的前后，添加对应的拦截器实现。

# 测试代码

## register

启动

## server

启动

## client 

- 测试代码

客户端配置指定耗时拦截器。

```java
config.interceptor(new CostTimeInterceptor());
```

- 日志

```
[INFO] [2019-11-01 23:26:10.337] [main] [c.g.h.r.c.s.i.i.CostTimeInterceptor.after] - [Interceptor] cost time 49 mills for traceId: 6de5c8da8c784801921a2d2887f6e543
```

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

我是老马，期待与你的下次重逢。

* any list
{:toc}