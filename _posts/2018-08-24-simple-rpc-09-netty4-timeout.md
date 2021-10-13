---
layout: post
title: java 从零开始手写 RPC (07)-timeout 超时处理
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---


《过时不候》

最漫长的莫过于等待

我们不可能永远等一个人

就像请求

永远等待响应


# 超时处理

[java 从零开始手写 RPC (01) 基于 socket 实现](https://mp.weixin.qq.com/s/Pvzi_O4DumhisIwDrSwnqQ)

[java 从零开始手写 RPC (02)-netty4 实现客户端和服务端](https://mp.weixin.qq.com/s/0zbk6fo-PryCNOxESwMSbQ)

[java 从零开始手写 RPC (03) 如何实现客户端调用服务端？](https://mp.weixin.qq.com/s/2z6T4yEVT29AZMvdYqwZ7Q)

[java 从零开始手写 RPC (04) 序列化](https://mp.weixin.qq.com/s/ZCxozEJHY8QRKf_EhNXuTw)

[java 从零开始手写 RPC (05) 基于反射的通用化实现](https://mp.weixin.qq.com/s/oquiIaXKB70WF_tKRCUhaQ)

## 必要性

前面我们实现了通用的 rpc，但是存在一个问题，同步获取响应的时候没有超时处理。

如果 server 挂掉了，或者处理太慢，客户端也不可能一直傻傻的等。

当外部的调用超过指定的时间后，就直接报错，避免无意义的资源消耗。

## 思路

调用的时候，将开始时间保留。

获取的时候检测是否超时。

同时创建一个线程，用来检测是否有超时的请求。

# 实现

## 思路

调用的时候，将开始时间保留。

获取的时候检测是否超时。

同时创建一个线程，用来检测是否有超时的请求。

## 超时检测线程

为了不影响正常业务的性能，我们另起一个线程检测调用是否已经超时。

```java
package com.github.houbb.rpc.client.invoke.impl;

import com.github.houbb.heaven.util.common.ArgUtil;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;
import com.github.houbb.rpc.common.rpc.domain.impl.RpcResponseFactory;
import com.github.houbb.rpc.common.support.time.impl.Times;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 超时检测线程
 * @author binbin.hou
 * @since 0.0.7
 */
public class TimeoutCheckThread implements Runnable{

    /**
     * 请求信息
     * @since 0.0.7
     */
    private final ConcurrentHashMap<String, Long> requestMap;

    /**
     * 请求信息
     * @since 0.0.7
     */
    private final ConcurrentHashMap<String, RpcResponse> responseMap;

    /**
     * 新建
     * @param requestMap  请求 Map
     * @param responseMap 结果 map
     * @since 0.0.7
     */
    public TimeoutCheckThread(ConcurrentHashMap<String, Long> requestMap,
                              ConcurrentHashMap<String, RpcResponse> responseMap) {
        ArgUtil.notNull(requestMap, "requestMap");
        this.requestMap = requestMap;
        this.responseMap = responseMap;
    }

    @Override
    public void run() {
        for(Map.Entry<String, Long> entry : requestMap.entrySet()) {
            long expireTime = entry.getValue();
            long currentTime = Times.time();

            if(currentTime > expireTime) {
                final String key = entry.getKey();
                // 结果设置为超时，从请求 map 中移除
                responseMap.putIfAbsent(key, RpcResponseFactory.timeout());
                requestMap.remove(key);
            }
        }
    }

}
```

这里主要存储请求，响应的时间，如果超时，则移除对应的请求。

## 线程启动

在 DefaultInvokeService 初始化时启动：

```java
final Runnable timeoutThread = new TimeoutCheckThread(requestMap, responseMap);
Executors.newScheduledThreadPool(1)
                .scheduleAtFixedRate(timeoutThread,60, 60, TimeUnit.SECONDS);
```

# DefaultInvokeService

原来的设置结果，获取结果是没有考虑时间的，这里加一下对应的判断。

## 设置请求时间

- 添加请求 addRequest

会将过时的时间直接放入 map 中。

因为放入是一次操作，查询可能是多次。

所以时间在放入的时候计算完成。

```java
@Override
public InvokeService addRequest(String seqId, long timeoutMills) {
    LOG.info("[Client] start add request for seqId: {}, timeoutMills: {}", seqId,
            timeoutMills);
    final long expireTime = Times.time()+timeoutMills;
    requestMap.putIfAbsent(seqId, expireTime);
    return this;
}
```

## 设置请求结果

- 添加响应 addResponse

1. 如果 requestMap 中已经不存在这个请求信息，则说明可能超时，直接忽略存入结果。

2. 此时检测是否出现超时，超时直接返回超时信息。

3. 放入信息后，通知其他等待的所有进程。

```java
@Override
public InvokeService addResponse(String seqId, RpcResponse rpcResponse) {
    // 1. 判断是否有效
    Long expireTime = this.requestMap.get(seqId);
    // 如果为空，可能是这个结果已经超时了，被定时 job 移除之后，响应结果才过来。直接忽略
    if(ObjectUtil.isNull(expireTime)) {
        return this;
    }

    //2. 判断是否超时
    if(Times.time() > expireTime) {
        LOG.info("[Client] seqId:{} 信息已超时，直接返回超时结果。", seqId);
        rpcResponse = RpcResponseFactory.timeout();
    }

    // 这里放入之前，可以添加判断。
    // 如果 seqId 必须处理请求集合中，才允许放入。或者直接忽略丢弃。
    // 通知所有等待方
    responseMap.putIfAbsent(seqId, rpcResponse);
    LOG.info("[Client] 获取结果信息，seqId: {}, rpcResponse: {}", seqId, rpcResponse);
    LOG.info("[Client] seqId:{} 信息已经放入，通知所有等待方", seqId);
    // 移除对应的 requestMap
    requestMap.remove(seqId);
    LOG.info("[Client] seqId:{} remove from request map", seqId);
    synchronized (this) {
        this.notifyAll();
    }
    return this;
}
```

## 获取请求结果

- 获取相应 getResponse

1. 如果结果存在，直接返回响应结果

2. 否则进入等待。

3. 等待结束后获取结果。

```java
@Override
public RpcResponse getResponse(String seqId) {
    try {
        RpcResponse rpcResponse = this.responseMap.get(seqId);
        if(ObjectUtil.isNotNull(rpcResponse)) {
            LOG.info("[Client] seq {} 对应结果已经获取: {}", seqId, rpcResponse);
            return rpcResponse;
        }
        // 进入等待
        while (rpcResponse == null) {
            LOG.info("[Client] seq {} 对应结果为空，进入等待", seqId);
            // 同步等待锁
            synchronized (this) {
                this.wait();
            }
            rpcResponse = this.responseMap.get(seqId);
            LOG.info("[Client] seq {} 对应结果已经获取: {}", seqId, rpcResponse);
        }
        return rpcResponse;
    } catch (InterruptedException e) {
        throw new RpcRuntimeException(e);
    }
}
```

可以发现获取部分的逻辑没变，因为超时会返回一个超时对象：RpcResponseFactory.timeout();

这是一个非常简单的实现，如下：

```java
package com.github.houbb.rpc.common.rpc.domain.impl;

import com.github.houbb.rpc.common.exception.RpcTimeoutException;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;

/**
 * 响应工厂类
 * @author binbin.hou
 * @since 0.0.7
 */
public final class RpcResponseFactory {

    private RpcResponseFactory(){}

    /**
     * 超时异常信息
     * @since 0.0.7
     */
    private static final DefaultRpcResponse TIMEOUT;

    static {
        TIMEOUT = new DefaultRpcResponse();
        TIMEOUT.error(new RpcTimeoutException());
    }

    /**
     * 获取超时响应结果
     * @return 响应结果
     * @since 0.0.7
     */
    public static RpcResponse timeout() {
        return TIMEOUT;
    }

}
```

响应结果指定一个超时异常，这个异常会在代理处理结果时抛出：

```java
RpcResponse rpcResponse = proxyContext.invokeService().getResponse(seqId);
Throwable error = rpcResponse.error();
if(ObjectUtil.isNotNull(error)) {
    throw error;
}
return rpcResponse.result();
```

# 测试代码

## 服务端

我们故意把服务端的实现添加沉睡，其他保持不变。

```java
public class CalculatorServiceImpl implements CalculatorService {

    public CalculateResponse sum(CalculateRequest request) {
        int sum = request.getOne()+request.getTwo();

        // 故意沉睡 3s
        try {
            TimeUnit.SECONDS.sleep(3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        return new CalculateResponse(true, sum);
    }

}
```

## 客户端

设置对应的超时时间为 1S，其他不变：

```java
public static void main(String[] args) {
    // 服务配置信息
    ReferenceConfig<CalculatorService> config = new DefaultReferenceConfig<CalculatorService>();
    config.serviceId(ServiceIdConst.CALC);
    config.serviceInterface(CalculatorService.class);
    config.addresses("localhost:9527");
    // 设置超时时间为1S
    config.timeout(1000);

    CalculatorService calculatorService = config.reference();
    CalculateRequest request = new CalculateRequest();
    request.setOne(10);
    request.setTwo(20);

    CalculateResponse response = calculatorService.sum(request);
    System.out.println(response);
}
```

日志如下：

```
.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2021-10-05 14:59:40.974] [main] [c.g.h.r.c.c.RpcClient.connect] - RPC 服务开始启动客户端
...
[INFO] [2021-10-05 14:59:42.504] [main] [c.g.h.r.c.c.RpcClient.connect] - RPC 服务启动客户端完成，监听地址 localhost:9527
[INFO] [2021-10-05 14:59:42.533] [main] [c.g.h.r.c.p.ReferenceProxy.invoke] - [Client] start call remote with request: DefaultRpcRequest{seqId='62e126d9a0334399904509acf8dfe0bb', createTime=1633417182525, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2021-10-05 14:59:42.534] [main] [c.g.h.r.c.i.i.DefaultInvokeService.addRequest] - [Client] start add request for seqId: 62e126d9a0334399904509acf8dfe0bb, timeoutMills: 1000
[INFO] [2021-10-05 14:59:42.535] [main] [c.g.h.r.c.p.ReferenceProxy.invoke] - [Client] start call channel id: 00e04cfffe360988-000004bc-00000000-1178e1265e903c4c-7975626f
...
Exception in thread "main" com.github.houbb.rpc.common.exception.RpcTimeoutException
	at com.github.houbb.rpc.common.rpc.domain.impl.RpcResponseFactory.<clinit>(RpcResponseFactory.java:23)
	at com.github.houbb.rpc.client.invoke.impl.DefaultInvokeService.addResponse(DefaultInvokeService.java:72)
	at com.github.houbb.rpc.client.handler.RpcClientHandler.channelRead0(RpcClientHandler.java:43)
	at io.netty.channel.SimpleChannelInboundHandler.channelRead(SimpleChannelInboundHandler.java:105)
	at io.netty.channel.AbstractChannelHandlerContext.invokeChannelRead(AbstractChannelHandlerContext.java:362)
	at io.netty.channel.AbstractChannelHandlerContext.invokeChannelRead(AbstractChannelHandlerContext.java:348)
	at io.netty.channel.AbstractChannelHandlerContext.fireChannelRead(AbstractChannelHandlerContext.java:340)
	at io.netty.handler.logging.LoggingHandler.channelRead(LoggingHandler.java:241)
	at io.netty.channel.AbstractChannelHandlerContext.invokeChannelRead(AbstractChannelHandlerContext.java:362)
	at io.netty.channel.AbstractChannelHandlerContext.invokeChannelRead(AbstractChannelHandlerContext.java:348)
	at io.netty.channel.AbstractChannelHandlerContext.fireChannelRead(AbstractChannelHandlerContext.java:340)
	at io.netty.handler.codec.ByteToMessageDecoder.fireChannelRead(ByteToMessageDecoder.java:310)
	at io.netty.handler.codec.ByteToMessageDecoder.channelRead(ByteToMessageDecoder.java:284)
	at io.netty.channel.AbstractChannelHandlerContext.invokeChannelRead(AbstractChannelHandlerContext.java:362)
	at io.netty.channel.AbstractChannelHandlerContext.invokeChannelRead(AbstractChannelHandlerContext.java:348)
	at io.netty.channel.AbstractChannelHandlerContext.fireChannelRead(AbstractChannelHandlerContext.java:340)
	at io.netty.channel.DefaultChannelPipeline$HeadContext.channelRead(DefaultChannelPipeline.java:1359)
	at io.netty.channel.AbstractChannelHandlerContext.invokeChannelRead(AbstractChannelHandlerContext.java:362)
	at io.netty.channel.AbstractChannelHandlerContext.invokeChannelRead(AbstractChannelHandlerContext.java:348)
	at io.netty.channel.DefaultChannelPipeline.fireChannelRead(DefaultChannelPipeline.java:935)
	at io.netty.channel.nio.AbstractNioByteChannel$NioByteUnsafe.read(AbstractNioByteChannel.java:138)
	at io.netty.channel.nio.NioEventLoop.processSelectedKey(NioEventLoop.java:645)
	at io.netty.channel.nio.NioEventLoop.processSelectedKeysOptimized(NioEventLoop.java:580)
	at io.netty.channel.nio.NioEventLoop.processSelectedKeys(NioEventLoop.java:497)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:459)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:858)
	at io.netty.util.concurrent.DefaultThreadFactory$DefaultRunnableDecorator.run(DefaultThreadFactory.java:138)
	at java.lang.Thread.run(Thread.java:748)
...
[INFO] [2021-10-05 14:59:45.615] [nioEventLoopGroup-2-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:62e126d9a0334399904509acf8dfe0bb 信息已超时，直接返回超时结果。
[INFO] [2021-10-05 14:59:45.617] [nioEventLoopGroup-2-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] 获取结果信息，seqId: 62e126d9a0334399904509acf8dfe0bb, rpcResponse: DefaultRpcResponse{seqId='null', error=com.github.houbb.rpc.common.exception.RpcTimeoutException, result=null}
[INFO] [2021-10-05 14:59:45.617] [nioEventLoopGroup-2-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:62e126d9a0334399904509acf8dfe0bb 信息已经放入，通知所有等待方
[INFO] [2021-10-05 14:59:45.618] [nioEventLoopGroup-2-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:62e126d9a0334399904509acf8dfe0bb remove from request map
[INFO] [2021-10-05 14:59:45.618] [nioEventLoopGroup-2-1] [c.g.h.r.c.c.RpcClient.channelRead0] - [Client] response is :DefaultRpcResponse{seqId='62e126d9a0334399904509acf8dfe0bb', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2021-10-05 14:59:45.619] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq 62e126d9a0334399904509acf8dfe0bb 对应结果已经获取: DefaultRpcResponse{seqId='null', error=com.github.houbb.rpc.common.exception.RpcTimeoutException, result=null}
...
```

可以发现，超时异常。

# 不足之处

对于超时的处理可以拓展为双向的，比如服务端也可以指定超时限制，避免资源的浪费。

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

* any list
{:toc}