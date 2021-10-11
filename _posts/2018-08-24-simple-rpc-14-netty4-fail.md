---
layout: post
title: 基于 netty4 手写 rpc-14-fail 失败策略
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# fail 失败策略

## 说明

当我们调用服务失败的时候，有很多策略。

比如：

- FailFast

快速失败

- FailOver

尝试下一次调用

等等其他各种策略。

## 实现思路

不同的失败策略方式只是处理失败的方式不同而已。

这个主要放在客户端，当调用失败的时候，重新进行尝试即可。

# 代码实现

## 接口

首先，是失败策略的接口定义。

```java
package com.github.houbb.rpc.client.support.fail;

import com.github.houbb.rpc.client.proxy.RemoteInvokeContext;

/**
 * 失败策略
 * @author binbin.hou
 * @since 0.1.1
 */
public interface FailStrategy {

    /**
     * 失败策略
     * @param context 远程调用上下文
     * @return 最终的结果值
     * @since 0.1.1
     */
    Object fail(final RemoteInvokeContext context);

}
```

其中调用的上下文定义如下：

```java
package com.github.houbb.rpc.client.proxy;

import com.github.houbb.rpc.client.proxy.impl.DefaultRemoteInvokeContext;
import com.github.houbb.rpc.common.rpc.domain.RpcChannelFuture;
import com.github.houbb.rpc.common.rpc.domain.RpcRequest;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;
import io.netty.channel.Channel;

/**
 * 远程调用上下文
 *
 * 核心目的：
 * （1）用于定义 filter 相关信息
 * （2）用于 load-balance 相关信息处理
 * @param <T> 泛型信息
 * @author binbin.hou
 * @since 0.1.1
 */
public interface RemoteInvokeContext<T> {

    /**
     * 请求信息
     * @return 请求信息
     * @since 0.1.1
     */
    RpcRequest request();

    /**
     * 服务代理上下文信息
     * @return 服务代理信息
     * @since 0.1.1
     */
    ServiceContext<T> serviceProxyContext();

    /**
     * 设置 channel future
     * （1）可以通过 load balance
     * （2）其他各种方式
     * @param channelFuture 消息
     * @return this
     * @since 0.0.9
     */
    RemoteInvokeContext<T> channelFuture(final RpcChannelFuture channelFuture);

    /**
     * 获取 channel future
     * （1）如果不设置，则默认取 {@link #serviceProxyContext()}第一个 channel 信息
     * （2）如果对应信息为空，则直接报错 {@link com.github.houbb.rpc.common.exception.RpcRuntimeException}
     * @return channel 信息
     * @since 0.0.9
     */
    Channel channel();

    /**
     * 请求响应结果
     * @return 请求响应结果
     * @since 0.1.1
     */
    RpcResponse rpcResponse();

    /**
     * 请求响应结果
     * @param rpcResponse 响应结果
     * @return 请求响应结果
     * @since 0.1.1
     */
    DefaultRemoteInvokeContext<T> rpcResponse(final RpcResponse rpcResponse);

    /**
     * 获取重试次数
     * @return 重试次数
     */
    int retryTimes();

    /**
     * 设置重试次数
     * @param retryTimes 设置重试次数
     * @return this
     */
    DefaultRemoteInvokeContext<T> retryTimes(final int retryTimes);

    /**
     * 在整个调用生命周期中唯一的标识号
     * （1）重试也不会改变
     * （2）只在第一次调用的时候进行设置。
     * @return 订单号
     * @since 0.1.1
     */
    String traceId();

    /**
     * 远程调用服务信息
     * @return 远程调用服务信息
     * @since 0.1.1
     */
    RemoteInvokeService remoteInvokeService();

}
```

## fail-fast 策略

最简单的就是 fail-fast 策略。

```java
package com.github.houbb.rpc.client.support.fail.impl;

import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.rpc.client.proxy.RemoteInvokeContext;
import com.github.houbb.rpc.client.support.fail.FailStrategy;
import com.github.houbb.rpc.common.rpc.domain.impl.RpcResponses;

/**
 * 快速失败策略
 * @author binbin.hou
 * @since 0.1.1
 */
@ThreadSafe
class FailFastStrategy implements FailStrategy {

    @Override
    public Object fail(final RemoteInvokeContext context) {
        final Class returnType = context.request().returnType();
        return RpcResponses.getResult(context.rpcResponse(), returnType);
    }

}
```

直接请求，失败则立刻失败。

## fail-over 策略

失败之后，尝试重试。

```java
package com.github.houbb.rpc.client.support.fail.impl;

import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.rpc.client.proxy.RemoteInvokeContext;
import com.github.houbb.rpc.client.support.fail.FailStrategy;
import com.github.houbb.rpc.common.exception.RpcRuntimeException;
import com.github.houbb.rpc.common.exception.RpcTimeoutException;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;
import com.github.houbb.rpc.common.rpc.domain.impl.RpcResponses;

/**
 * 如果调用遇到异常，则进行尝试其他 server 端进行调用。
 * （1）最大重试次数=2  不能太多次
 * （2）重试的时候如何标识重试次数还剩多少次？
 * （3）如何在失败的时候获取重试相关上下文？
 *
 * @author binbin.hou
 * @since 0.1.1
 */
@ThreadSafe
class FailOverStrategy implements FailStrategy {

    @Override
    public Object fail(final RemoteInvokeContext context) {
        try {
            final Class returnType = context.request().returnType();
            final RpcResponse rpcResponse = context.rpcResponse();
            return RpcResponses.getResult(rpcResponse, returnType);
        } catch (Exception e) {
            Throwable throwable = e.getCause();
            if(throwable instanceof RpcTimeoutException) {
                throw new RpcRuntimeException();
            }

            // 进行失败重试。
            int retryTimes = context.retryTimes();
            if(retryTimes > 0) {
                // 进行重试
                retryTimes--;
                context.retryTimes(retryTimes);
                return context.remoteInvokeService()
                        .remoteInvoke(context);
            } else {
                throw e;
            }
        }
    }

}
```

# 失败策略工厂

为了使用更加简单，我们引入策略工厂类。

## 工厂类

```java
package com.github.houbb.rpc.client.support.fail.impl;

import com.github.houbb.rpc.client.support.fail.FailStrategy;
import com.github.houbb.rpc.client.support.fail.enums.FailTypeEnum;

/**
 * 快速失败策略工厂
 *
 * @author binbin.hou
 * @since 0.1.1
 */
public final class FailStrategyFactory {

    private FailStrategyFactory() {
    }

    /**
     * 失败策略
     *
     * @param failTypeEnum 失败策略枚举
     * @return 失败策略实现
     * @since 0.1.1
     */
    public static FailStrategy failStrategy(final FailTypeEnum failTypeEnum) {
        switch (failTypeEnum) {
            case FAIL_FAST:
                return new FailFastStrategy();
            case FAIL_OVER:
                return new FailOverStrategy();
            default:
                throw new UnsupportedOperationException("not support fail type " + failTypeEnum);
        }
    }

}
```

## 枚举

其中 FailTypeEnum 为：

```java
package com.github.houbb.rpc.client.support.fail.enums;

/**
 * 失败类型枚举
 * @author binbin.hou
 * @since 0.1.1
 */
public enum FailTypeEnum {
    /**
     * 快速失败
     * @since 0.1.1
     */
    FAIL_FAST(1),
    /**
     * 失败重试
     * 选择另外一个 channel 进行重试
     * @since 0.1.1
     */
    FAIL_OVER(2),
    /**
     * 失败之后不进行报错，直接返回
     * @since 0.1.1
     */
    FAIL_SAFE(3),
    ;

    //toString 

}
```

# 客户端

代码调整也非常简单：

```java
package com.github.houbb.rpc.client.proxy.impl;

import com.github.houbb.heaven.util.id.impl.Ids;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.invoke.InvokeService;
import com.github.houbb.rpc.client.proxy.RemoteInvokeContext;
import com.github.houbb.rpc.client.proxy.RemoteInvokeService;
import com.github.houbb.rpc.client.proxy.ServiceContext;
import com.github.houbb.rpc.client.support.calltype.CallTypeStrategy;
import com.github.houbb.rpc.client.support.calltype.impl.CallTypeStrategyFactory;
import com.github.houbb.rpc.client.support.fail.FailStrategy;
import com.github.houbb.rpc.client.support.fail.impl.FailStrategyFactory;
import com.github.houbb.rpc.client.support.filter.RpcFilter;
import com.github.houbb.rpc.client.support.filter.balance.RandomBalanceFilter;
import com.github.houbb.rpc.common.rpc.domain.RpcRequest;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;
import io.netty.channel.Channel;

/**
 * 远程调用实现
 * @author binbin.hou
 * @since 0.1.1
 */
public class RemoteInvokeServiceImpl implements RemoteInvokeService {

    private static final Log LOG = LogFactory.getLog(RemoteInvokeServiceImpl.class);

    @Override
    public Object remoteInvoke(RemoteInvokeContext context) {
        // 保持不变

        // 获取调用结果
        context.rpcResponse(rpcResponse);
        FailStrategy failStrategy = FailStrategyFactory.failStrategy(proxyContext.failType());
        return failStrategy.fail(context);
    }

    // 保持不变

}
```

ps: 当然，这里重试只是对结果获取的重试。比较好的方式，是重试方法调用本身。

# 测试代码

## 注册中心

启动

```
[INFO] [2021-10-05 18:42:43.795] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] 启动完成，监听【8527】端口
```

## 服务端

故意指定一个有异常的实现，

```java
public static void main(String[] args) {
    // 启动服务
    ServiceBs.getInstance()
            .port(9527)
            .register(ServiceIdConst.CALC, new CalculatorServiceErrorImpl())
            .registerCenter(ServiceIdConst.REGISTER_CENTER)
            .expose();
}
```

启动

```
[INFO] [2021-10-05 18:43:17.162] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] 启动完成，监听【9527】端口
[INFO] [2021-10-05 18:43:17.170] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 启动客户端完成，监听地址 127.0.0.1:8527
```

## 客户端

启动日志：

```
...
[INFO] [2021-10-05 18:49:14.951] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 开始启动客户端
[INFO] [2021-10-05 18:49:14.971] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 启动客户端完成，监听地址 192.168.124.16:9527

[INFO] [2021-10-05 18:49:15.036] [main] [c.g.h.r.c.p.i.RemoteInvokeServiceImpl.remoteInvoke] - [Client] start call channel id: 00e04cfffe360988-00002ef0-00000001-053358cca00a63d2-a85ce4f0
[INFO] [2021-10-05 18:49:15.043] [main] [c.g.h.r.c.p.i.RemoteInvokeServiceImpl.remoteInvoke] - [Client] start call remote with request: DefaultRpcRequest{seqId='cb1ff7f83e9647ccb0f7726563bcca09', createTime=1633430954979, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}], returnType=class com.github.houbb.rpc.server.facade.model.CalculateResponse}
[INFO] [2021-10-05 18:49:15.044] [main] [c.g.h.r.c.i.i.DefaultInvokeService.addRequest] - [Client] start add request for seqId: cb1ff7f83e9647ccb0f7726563bcca09, timeoutMills: 60000
[INFO] [2021-10-05 18:49:15.059] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq cb1ff7f83e9647ccb0f7726563bcca09 对应结果为空，进入等待
[INFO] [2021-10-05 18:49:15.064] [nioEventLoopGroup-4-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] 获取结果信息，seqId: cb1ff7f83e9647ccb0f7726563bcca09, rpcResponse: DefaultRpcResponse{seqId='cb1ff7f83e9647ccb0f7726563bcca09', error=com.github.houbb.rpc.common.exception.RpcRuntimeException: java.lang.reflect.InvocationTargetException, result=null}
[INFO] [2021-10-05 18:49:15.065] [nioEventLoopGroup-4-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:cb1ff7f83e9647ccb0f7726563bcca09 信息已经放入，通知所有等待方
[INFO] [2021-10-05 18:49:15.065] [nioEventLoopGroup-4-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:cb1ff7f83e9647ccb0f7726563bcca09 remove from request map
[INFO] [2021-10-05 18:49:15.066] [nioEventLoopGroup-4-1] [c.g.h.r.c.h.RpcClientHandler.channelRead0] - [Client] response is :DefaultRpcResponse{seqId='cb1ff7f83e9647ccb0f7726563bcca09', error=com.github.houbb.rpc.common.exception.RpcRuntimeException: java.lang.reflect.InvocationTargetException, result=null}
[INFO] [2021-10-05 18:49:15.067] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq cb1ff7f83e9647ccb0f7726563bcca09 对应结果已经获取: DefaultRpcResponse{seqId='cb1ff7f83e9647ccb0f7726563bcca09', error=com.github.houbb.rpc.common.exception.RpcRuntimeException: java.lang.reflect.InvocationTargetException, result=null}


[INFO] [2021-10-05 18:49:15.071] [main] [c.g.h.r.c.p.i.RemoteInvokeServiceImpl.remoteInvoke] - [Client] start call channel id: 00e04cfffe360988-00002ef0-00000001-053358cca00a63d2-a85ce4f0
[INFO] [2021-10-05 18:49:15.073] [main] [c.g.h.r.c.p.i.RemoteInvokeServiceImpl.remoteInvoke] - [Client] start call remote with request: DefaultRpcRequest{seqId='29fed6e7ec8d432a93b7dbb300672357', createTime=1633430954979, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}], returnType=class com.github.houbb.rpc.server.facade.model.CalculateResponse}
[INFO] [2021-10-05 18:49:15.074] [main] [c.g.h.r.c.i.i.DefaultInvokeService.addRequest] - [Client] start add request for seqId: 29fed6e7ec8d432a93b7dbb300672357, timeoutMills: 60000
[INFO] [2021-10-05 18:49:15.075] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq 29fed6e7ec8d432a93b7dbb300672357 对应结果为空，进入等待
[INFO] [2021-10-05 18:49:15.082] [nioEventLoopGroup-4-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] 获取结果信息，seqId: 29fed6e7ec8d432a93b7dbb300672357, rpcResponse: DefaultRpcResponse{seqId='29fed6e7ec8d432a93b7dbb300672357', error=com.github.houbb.rpc.common.exception.RpcRuntimeException: java.lang.reflect.InvocationTargetException, result=null}
[INFO] [2021-10-05 18:49:15.083] [nioEventLoopGroup-4-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:29fed6e7ec8d432a93b7dbb300672357 信息已经放入，通知所有等待方
[INFO] [2021-10-05 18:49:15.083] [nioEventLoopGroup-4-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:29fed6e7ec8d432a93b7dbb300672357 remove from request map
[INFO] [2021-10-05 18:49:15.084] [nioEventLoopGroup-4-1] [c.g.h.r.c.h.RpcClientHandler.channelRead0] - [Client] response is :DefaultRpcResponse{seqId='29fed6e7ec8d432a93b7dbb300672357', error=com.github.houbb.rpc.common.exception.RpcRuntimeException: java.lang.reflect.InvocationTargetException, result=null}
[INFO] [2021-10-05 18:49:15.084] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq 29fed6e7ec8d432a93b7dbb300672357 对应结果已经获取: DefaultRpcResponse{seqId='29fed6e7ec8d432a93b7dbb300672357', error=com.github.houbb.rpc.common.exception.RpcRuntimeException: java.lang.reflect.InvocationTargetException, result=null}


[INFO] [2021-10-05 18:49:15.085] [main] [c.g.h.r.c.p.i.RemoteInvokeServiceImpl.remoteInvoke] - [Client] start call channel id: 00e04cfffe360988-00002ef0-00000001-053358cca00a63d2-a85ce4f0
[INFO] [2021-10-05 18:49:15.087] [main] [c.g.h.r.c.p.i.RemoteInvokeServiceImpl.remoteInvoke] - [Client] start call remote with request: DefaultRpcRequest{seqId='4487352b218a4470a4ec4cc9519acd98', createTime=1633430954979, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}], returnType=class com.github.houbb.rpc.server.facade.model.CalculateResponse}
[INFO] [2021-10-05 18:49:15.089] [main] [c.g.h.r.c.i.i.DefaultInvokeService.addRequest] - [Client] start add request for seqId: 4487352b218a4470a4ec4cc9519acd98, timeoutMills: 60000
[INFO] [2021-10-05 18:49:15.090] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq 4487352b218a4470a4ec4cc9519acd98 对应结果为空，进入等待
[INFO] [2021-10-05 18:49:15.096] [nioEventLoopGroup-4-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] 获取结果信息，seqId: 4487352b218a4470a4ec4cc9519acd98, rpcResponse: DefaultRpcResponse{seqId='4487352b218a4470a4ec4cc9519acd98', error=com.github.houbb.rpc.common.exception.RpcRuntimeException: java.lang.reflect.InvocationTargetException, result=null}
[INFO] [2021-10-05 18:49:15.096] [nioEventLoopGroup-4-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:4487352b218a4470a4ec4cc9519acd98 信息已经放入，通知所有等待方
[INFO] [2021-10-05 18:49:15.097] [nioEventLoopGroup-4-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:4487352b218a4470a4ec4cc9519acd98 remove from request map
[INFO] [2021-10-05 18:49:15.097] [nioEventLoopGroup-4-1] [c.g.h.r.c.h.RpcClientHandler.channelRead0] - [Client] response is :DefaultRpcResponse{seqId='4487352b218a4470a4ec4cc9519acd98', error=com.github.houbb.rpc.common.exception.RpcRuntimeException: java.lang.reflect.InvocationTargetException, result=null}
[INFO] [2021-10-05 18:49:15.097] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq 4487352b218a4470a4ec4cc9519acd98 对应结果已经获取: DefaultRpcResponse{seqId='4487352b218a4470a4ec4cc9519acd98', error=com.github.houbb.rpc.common.exception.RpcRuntimeException: java.lang.reflect.InvocationTargetException, result=null}
Exception in thread "main" com.github.houbb.rpc.common.exception.RpcRuntimeException: com.github.houbb.rpc.common.exception.RpcRuntimeException: java.lang.reflect.InvocationTargetException
	at com.github.houbb.rpc.common.rpc.domain.impl.RpcResponses.getResult(RpcResponses.java:60)
	at com.github.houbb.rpc.client.support.fail.impl.FailOverStrategy.fail(FailOverStrategy.java:28)
	at com.github.houbb.rpc.client.proxy.impl.RemoteInvokeServiceImpl.remoteInvoke(RemoteInvokeServiceImpl.java:58)
	at com.github.houbb.rpc.client.support.fail.impl.FailOverStrategy.fail(FailOverStrategy.java:42)
	at com.github.houbb.rpc.client.proxy.impl.RemoteInvokeServiceImpl.remoteInvoke(RemoteInvokeServiceImpl.java:58)
	at com.github.houbb.rpc.client.support.fail.impl.FailOverStrategy.fail(FailOverStrategy.java:42)
	at com.github.houbb.rpc.client.proxy.impl.RemoteInvokeServiceImpl.remoteInvoke(RemoteInvokeServiceImpl.java:58)
	at com.github.houbb.rpc.client.proxy.impl.DefaultReferenceProxy.invoke(DefaultReferenceProxy.java:79)
	at com.sun.proxy.$Proxy3.sum(Unknown Source)
	at com.github.houbb.rpc.client.main.RpcClientMain.main(RpcClientMain.java:32)
Caused by: com.github.houbb.rpc.common.exception.RpcRuntimeException: java.lang.reflect.InvocationTargetException
	...
```

可以发现这里进行了重试，失败之后抛出异常。

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

我是老马，期待与你的下次重逢。

* any list
{:toc}