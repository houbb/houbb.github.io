---
layout: post
title: java 从零开始手写 RPC (06) reflect 反射实现通用调用之客户端
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# 通用调用

[java 从零开始手写 RPC (01) 基于 socket 实现](https://mp.weixin.qq.com/s/Pvzi_O4DumhisIwDrSwnqQ)

[java 从零开始手写 RPC (02)-netty4 实现客户端和服务端](https://mp.weixin.qq.com/s/0zbk6fo-PryCNOxESwMSbQ)

[java 从零开始手写 RPC (03) 如何实现客户端调用服务端？](https://mp.weixin.qq.com/s/2z6T4yEVT29AZMvdYqwZ7Q)

[java 从零开始手写 RPC (04) -序列化](https://mp.weixin.qq.com/s/ZCxozEJHY8QRKf_EhNXuTw)

上一篇我们介绍了，如何实现基于反射的通用服务端。

这一节我们来一起学习下如何实现通用客户端。

因为内容较多，所以拆分为 2 个部分。

## 基本思路

所有的方法调用，基于反射进行相关处理实现。

# 客户端

为了便于拓展，我们把核心类调整如下：

```java
package com.github.houbb.rpc.client.core;

import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.core.context.RpcClientContext;
import com.github.houbb.rpc.client.handler.RpcClientHandler;
import com.github.houbb.rpc.common.constant.RpcConstant;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.serialization.ClassResolvers;
import io.netty.handler.codec.serialization.ObjectDecoder;
import io.netty.handler.codec.serialization.ObjectEncoder;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;

/**
 * <p> rpc 客户端 </p>
 *
 * <pre> Created: 2019/10/16 11:21 下午  </pre>
 * <pre> Project: rpc  </pre>
 *
 * @author houbinbin
 * @since 0.0.2
 */
@ThreadSafe
public class RpcClient {

    private static final Log log = LogFactory.getLog(RpcClient.class);

    /**
     * 地址信息
     * @since 0.0.6
     */
    private final String address;

    /**
     * 监听端口号
     * @since 0.0.6
     */
    private final int port;

    /**
     * 客户端处理 handler
     * 作用：用于获取请求信息
     * @since 0.0.4
     */
    private final ChannelHandler channelHandler;

    public RpcClient(final RpcClientContext clientContext) {
        this.address = clientContext.address();
        this.port = clientContext.port();
        this.channelHandler = clientContext.channelHandler();
    }

    /**
     * 进行连接
     * @since 0.0.6
     */
    public ChannelFuture connect() {
        // 启动服务端
        log.info("RPC 服务开始启动客户端");

        EventLoopGroup workerGroup = new NioEventLoopGroup();

        /**
         * channel future 信息
         * 作用：用于写入请求信息
         * @since 0.0.6
         */
        ChannelFuture channelFuture;
        try {
            Bootstrap bootstrap = new Bootstrap();
            channelFuture = bootstrap.group(workerGroup)
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.SO_KEEPALIVE, true)
                    .handler(new ChannelInitializer<Channel>(){
                        @Override
                        protected void initChannel(Channel ch) throws Exception {
                            ch.pipeline()
                                    // 解码 bytes=>resp
                                    .addLast(new ObjectDecoder(Integer.MAX_VALUE, ClassResolvers.cacheDisabled(null)))
                                    // request=>bytes
                                    .addLast(new ObjectEncoder())
                                    // 日志输出
                                    .addLast(new LoggingHandler(LogLevel.INFO))
                                    .addLast(channelHandler);
                        }
                    })
                    .connect(address, port)
                    .syncUninterruptibly();
            log.info("RPC 服务启动客户端完成，监听地址 {}:{}", address, port);
        } catch (Exception e) {
            log.error("RPC 客户端遇到异常", e);
            throw new RuntimeException(e);
        }
        // 不要关闭线程池！！！

        return channelFuture;
    }

}
```

可以灵活指定对应的服务端地址、端口信息。

ChannelHandler 作为处理参数传入。

ObjectDecoder、ObjectEncoder、LoggingHandler 都和服务端类似，是 netty 的内置实现。

# RpcClientHandler

客户端的 handler 实现如下：

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * rpc All rights reserved.
 */

package com.github.houbb.rpc.client.handler;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.core.RpcClient;
import com.github.houbb.rpc.client.invoke.InvokeService;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

/**
 * <p> 客户端处理类 </p>
 *
 * <pre> Created: 2019/10/16 11:30 下午  </pre>
 * <pre> Project: rpc  </pre>
 *
 * @author houbinbin
 * @since 0.0.2
 */
public class RpcClientHandler extends SimpleChannelInboundHandler {

    private static final Log log = LogFactory.getLog(RpcClient.class);

    /**
     * 调用服务管理类
     *
     * @since 0.0.6
     */
    private final InvokeService invokeService;

    public RpcClientHandler(InvokeService invokeService) {
        this.invokeService = invokeService;
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        RpcResponse rpcResponse = (RpcResponse)msg;
        invokeService.addResponse(rpcResponse.seqId(), rpcResponse);
        log.info("[Client] response is :{}", rpcResponse);
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        // 每次用完要关闭，不然拿不到response，我也不知道为啥（目测得了解netty才行）
        // 个人理解：如果不关闭，则永远会被阻塞。
        ctx.flush();
        ctx.close();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}
```

只有 channelRead0 做了调整，基于 InvokeService 对结果进行处理。

# InvokeService

## 接口

```java
package com.github.houbb.rpc.client.invoke;

import com.github.houbb.rpc.common.rpc.domain.RpcResponse;

/**
 * 调用服务接口
 * @author binbin.hou
 * @since 0.0.6
 */
public interface InvokeService {

    /**
     * 添加请求信息
     * @param seqId 序列号
     * @return this
     * @since 0.0.6
     */
    InvokeService addRequest(final String seqId);

    /**
     * 放入结果
     * @param seqId 唯一标识
     * @param rpcResponse 响应结果
     * @return this
     * @since 0.0.6
     */
    InvokeService addResponse(final String seqId, final RpcResponse rpcResponse);

    /**
     * 获取标志信息对应的结果
     * @param seqId 序列号
     * @return 结果
     * @since 0.0.6
     */
    RpcResponse getResponse(final String seqId);

}
```

主要是对入参、出参的设置，以及出参的获取。

## 实现

```java
package com.github.houbb.rpc.client.invoke.impl;

import com.github.houbb.heaven.util.guava.Guavas;
import com.github.houbb.heaven.util.lang.ObjectUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.core.RpcClient;
import com.github.houbb.rpc.client.invoke.InvokeService;
import com.github.houbb.rpc.common.exception.RpcRuntimeException;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 调用服务接口
 * @author binbin.hou
 * @since 0.0.6
 */
public class DefaultInvokeService implements InvokeService {

    private static final Log LOG = LogFactory.getLog(DefaultInvokeService.class);

    /**
     * 请求序列号集合
     * （1）这里后期如果要添加超时检测，可以添加对应的超时时间。
     * 可以把这里调整为 map
     * @since 0.0.6
     */
    private final Set<String> requestSet;

    /**
     * 响应结果
     * @since 0.0.6
     */
    private final ConcurrentHashMap<String, RpcResponse> responseMap;

    public DefaultInvokeService() {
        requestSet = Guavas.newHashSet();
        responseMap = new ConcurrentHashMap<>();
    }

    @Override
    public InvokeService addRequest(String seqId) {
        LOG.info("[Client] start add request for seqId: {}", seqId);
        requestSet.add(seqId);
        return this;
    }

    @Override
    public InvokeService addResponse(String seqId, RpcResponse rpcResponse) {
        // 这里放入之前，可以添加判断。
        // 如果 seqId 必须处理请求集合中，才允许放入。或者直接忽略丢弃。
        LOG.info("[Client] 获取结果信息，seq: {}, rpcResponse: {}", seqId, rpcResponse);
        responseMap.putIfAbsent(seqId, rpcResponse);

        // 通知所有等待方
        LOG.info("[Client] seq 信息已经放入，通知所有等待方", seqId);

        synchronized (this) {
            this.notifyAll();
        }

        return this;
    }

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
}
```

使用 requestSet 存储对应的请求入参。

使用 responseMap 存储对应的请求出参，在获取的时候通过同步 while 循环等待，获取结果。

此处，通过 notifyAll() 和 wait() 进行等待和唤醒。

# ReferenceConfig-服务端配置

## 说明

我们想调用服务端，首先肯定要定义好要调用的对象。

ReferenceConfig 就是要告诉 rpc 框架，调用的服务端信息。

## 接口

```java
package com.github.houbb.rpc.client.config.reference;

import com.github.houbb.rpc.common.config.component.RpcAddress;

import java.util.List;

/**
 * 引用配置类
 *
 * 后期配置：
 * （1）timeout 调用超时时间
 * （2）version 服务版本处理
 * （3）callType 调用方式 oneWay/sync/async
 * （4）check 是否必须要求服务启动。
 *
 * spi:
 * （1）codec 序列化方式
 * （2）netty 网络通讯架构
 * （3）load-balance 负载均衡
 * （4）失败策略 fail-over/fail-fast
 *
 * filter:
 * （1）路由
 * （2）耗时统计 monitor 服务治理
 *
 * 优化思考：
 * （1）对于唯一的 serviceId，其实其 interface 是固定的，是否可以省去？
 * @author binbin.hou
 * @since 0.0.6
 * @param <T> 接口泛型
 */
public interface ReferenceConfig<T> {

    /**
     * 设置服务标识
     * @param serviceId 服务标识
     * @return this
     * @since 0.0.6
     */
    ReferenceConfig<T> serviceId(final String serviceId);

    /**
     * 服务唯一标识
     * @since 0.0.6
     */
    String serviceId();

    /**
     * 服务接口
     * @since 0.0.6
     * @return 接口信息
     */
    Class<T> serviceInterface();

    /**
     * 设置服务接口信息
     * @param serviceInterface 服务接口信息
     * @return this
     * @since 0.0.6
     */
    ReferenceConfig<T> serviceInterface(final Class<T> serviceInterface);

    /**
     * 设置服务地址信息
     * （1）单个写法：ip:port:weight
     * （2）集群写法：ip1:port1:weight1,ip2:port2:weight2
     *
     * 其中 weight 权重可以不写，默认为1.
     *
     * @param addresses 地址列表信息
     * @return this
     * @since 0.0.6
     */
    ReferenceConfig<T> addresses(final String addresses);

    /**
     * 获取对应的引用实现
     * @return 引用代理类
     * @since 0.0.6
     */
    T reference();

}
```

## 实现

```java
package com.github.houbb.rpc.client.config.reference.impl;

import com.github.houbb.heaven.constant.PunctuationConst;
import com.github.houbb.heaven.util.common.ArgUtil;
import com.github.houbb.heaven.util.guava.Guavas;
import com.github.houbb.heaven.util.lang.NumUtil;
import com.github.houbb.rpc.client.config.reference.ReferenceConfig;
import com.github.houbb.rpc.client.core.RpcClient;
import com.github.houbb.rpc.client.core.context.impl.DefaultRpcClientContext;
import com.github.houbb.rpc.client.handler.RpcClientHandler;
import com.github.houbb.rpc.client.invoke.InvokeService;
import com.github.houbb.rpc.client.invoke.impl.DefaultInvokeService;
import com.github.houbb.rpc.client.proxy.ReferenceProxy;
import com.github.houbb.rpc.client.proxy.context.ProxyContext;
import com.github.houbb.rpc.client.proxy.context.impl.DefaultProxyContext;
import com.github.houbb.rpc.common.config.component.RpcAddress;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandler;

import java.util.List;

/**
 * 引用配置类默认实现
 *
 * @author binbin.hou
 * @since 0.0.6
 * @param <T> 接口泛型
 */
public class DefaultReferenceConfig<T> implements ReferenceConfig<T> {

    /**
     * 服务唯一标识
     * @since 0.0.6
     */
    private String serviceId;

    /**
     * 服务接口
     * @since 0.0.6
     */
    private Class<T> serviceInterface;

    /**
     * 服务地址信息
     * （1）如果不为空，则直接根据地址获取
     * （2）如果为空，则采用自动发现的方式
     *
     * TODO: 这里调整为 set 更加合理。
     *
     * 如果为 subscribe 可以自动发现，然后填充这个字段信息。
     * @since 0.0.6
     */
    private List<RpcAddress> rpcAddresses;

    /**
     * 用于写入信息
     * （1）client 连接 server 端的 channel future
     * （2）后期进行 Load-balance 路由等操作。可以放在这里执行。
     * @since 0.0.6
     */
    private List<ChannelFuture> channelFutures;

    /**
     * 客户端处理信息
     * @since 0.0.6
     */
    @Deprecated
    private RpcClientHandler channelHandler;

    /**
     * 调用服务管理类
     * @since 0.0.6
     */
    private InvokeService invokeService;

    public DefaultReferenceConfig() {
        // 初始化信息
        this.rpcAddresses = Guavas.newArrayList();
        this.channelFutures = Guavas.newArrayList();
        this.invokeService = new DefaultInvokeService();
    }

    @Override
    public String serviceId() {
        return serviceId;
    }

    @Override
    public DefaultReferenceConfig<T> serviceId(String serviceId) {
        this.serviceId = serviceId;
        return this;
    }

    @Override
    public Class<T> serviceInterface() {
        return serviceInterface;
    }

    @Override
    public DefaultReferenceConfig<T> serviceInterface(Class<T> serviceInterface) {
        this.serviceInterface = serviceInterface;
        return this;
    }

    @Override
    public ReferenceConfig<T> addresses(String addresses) {
        ArgUtil.notEmpty(addresses, "addresses");

        String[] addressArray = addresses.split(PunctuationConst.COMMA);
        ArgUtil.notEmpty(addressArray, "addresses");

        for(String address : addressArray) {
            String[] addressSplits = address.split(PunctuationConst.COLON);
            if(addressSplits.length < 2) {
                throw new IllegalArgumentException("Address must be has ip and port, like 127.0.0.1:9527");
            }
            String ip = addressSplits[0];
            int port = NumUtil.toIntegerThrows(addressSplits[1]);
            // 包含权重信息
            int weight = 1;
            if(addressSplits.length >= 3) {
                weight = NumUtil.toInteger(addressSplits[2], 1);
            }

            RpcAddress rpcAddress = new RpcAddress(ip, port, weight);
            this.rpcAddresses.add(rpcAddress);
        }

        return this;
    }

    /**
     * 获取对应的引用实现
     * （1）处理所有的反射代理信息-方法可以抽离，启动各自独立即可。
     * （2）启动对应的长连接
     * @return 引用代理类
     * @since 0.0.6
     */
    @Override
    public T reference() {
        // 1. 启动 client 端到 server 端的连接信息
        // 1.1 为了提升性能，可以将所有的 client=>server 的连接都调整为一个 thread。
        // 1.2 初期为了简单，直接使用同步循环的方式。
        // 创建 handler
        // 循环连接
        for(RpcAddress rpcAddress : rpcAddresses) {
            final ChannelHandler channelHandler = new RpcClientHandler(invokeService);
            final DefaultRpcClientContext context = new DefaultRpcClientContext();
            context.address(rpcAddress.address()).port(rpcAddress.port()).channelHandler(channelHandler);
            ChannelFuture channelFuture = new RpcClient(context).connect();
            // 循环同步等待
            // 如果出现异常，直接中断？捕获异常继续进行？？
            channelFutures.add(channelFuture);
        }

        // 2. 接口动态代理
        ProxyContext<T> proxyContext = buildReferenceProxyContext();
        return ReferenceProxy.newProxyInstance(proxyContext);
    }

    /**
     * 构建调用上下文
     * @return 引用代理上下文
     * @since 0.0.6
     */
    private ProxyContext<T> buildReferenceProxyContext() {
        DefaultProxyContext<T> proxyContext = new DefaultProxyContext<>();
        proxyContext.serviceId(this.serviceId);
        proxyContext.serviceInterface(this.serviceInterface);
        proxyContext.channelFutures(this.channelFutures);
        proxyContext.invokeService(this.invokeService);
        return proxyContext;
    }

}
```

这里主要根据指定的服务端信息，初始化对应的代理实现。

这里还可以拓展指定权重，便于后期负载均衡拓展，本期暂时不做实现。

# ReferenceProxy

## 说明

所有的 rpc 调用，客户端只有服务端的接口。

那么，怎么才能和调用本地方法一样调用远程方法呢？

答案就是动态代理。

## 实现

实现如下：

```java
package com.github.houbb.rpc.client.proxy;

import com.github.houbb.heaven.util.lang.ObjectUtil;
import com.github.houbb.heaven.util.lang.reflect.ReflectMethodUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.proxy.context.ProxyContext;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;
import com.github.houbb.rpc.common.rpc.domain.impl.DefaultRpcRequest;
import com.github.houbb.rpc.common.support.id.impl.Uuid;
import com.github.houbb.rpc.common.support.time.impl.DefaultSystemTime;
import io.netty.channel.Channel;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

/**
 * 参考：https://blog.csdn.net/u012240455/article/details/79210250
 *
 * （1）方法执行并不需要一定要有实现类。
 * （2）直接根据反射即可处理相关信息。
 * （3）rpc 是一种强制根据接口进行编程的实现方式。
 * @author binbin.hou
 * @since 0.0.6
 */
public class ReferenceProxy<T> implements InvocationHandler {

    private static final Log LOG = LogFactory.getLog(ReferenceProxy.class);

    /**
     * 服务标识
     * @since 0.0.6
     */
    private final ProxyContext<T> proxyContext;

    /**
     * 暂时私有化该构造器
     * @param proxyContext 代理上下文
     * @since 0.0.6
     */
    private ReferenceProxy(ProxyContext<T> proxyContext) {
        this.proxyContext = proxyContext;
    }

    /**
     * 反射调用
     * @param proxy 代理
     * @param method 方法
     * @param args 参数
     * @return 结果
     * @throws Throwable 异常
     * @since 0.0.6
     * @see Method#getGenericSignature() 通用标识，可以根据这个来优化代码。
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 反射信息处理成为 rpcRequest
        final String seqId = Uuid.getInstance().id();
        final long createTime = DefaultSystemTime.getInstance().time();
        DefaultRpcRequest rpcRequest = new DefaultRpcRequest();
        rpcRequest.serviceId(proxyContext.serviceId());
        rpcRequest.seqId(seqId);
        rpcRequest.createTime(createTime);
        rpcRequest.paramValues(args);
        rpcRequest.paramTypeNames(ReflectMethodUtil.getParamTypeNames(method));
        rpcRequest.methodName(method.getName());

        // 调用远程
        LOG.info("[Client] start call remote with request: {}", rpcRequest);
        proxyContext.invokeService().addRequest(seqId);

        // 这里使用 load-balance 进行选择 channel 写入。
        final Channel channel = getChannel();
        LOG.info("[Client] start call channel id: {}", channel.id().asLongText());

        // 对于信息的写入，实际上有着严格的要求。
        // writeAndFlush 实际是一个异步的操作，直接使用 sync() 可以看到异常信息。
        // 支持的必须是 ByteBuf
        channel.writeAndFlush(rpcRequest).sync();

        // 循环获取结果
        // 通过 Loop+match  wait/notifyAll 来获取
        // 分布式根据 redis+queue+loop
        LOG.info("[Client] start get resp for seqId: {}", seqId);
        RpcResponse rpcResponse = proxyContext.invokeService().getResponse(seqId);
        LOG.info("[Client] start get resp for seqId: {}", seqId);
        Throwable error = rpcResponse.error();
        if(ObjectUtil.isNotNull(error)) {
            throw error;
        }
        return rpcResponse.result();
    }

    /**
     * 获取对应的 channel
     * （1）暂时使用写死的第一个
     * （2）后期这里需要调整，ChannelFuture 加上权重信息。
     * @return 对应的 channel 信息。
     * @since 0.0.6
     */
    private Channel getChannel() {
        return proxyContext.channelFutures().get(0).channel();
    }

    /**
     * 获取代理实例
     * （1）接口只是为了代理。
     * （2）实际调用中更加关心 的是 serviceId
     * @param proxyContext 代理上下文
     * @param <T> 泛型
     * @return 代理实例
     * @since 0.0.6
     */
    @SuppressWarnings("unchecked")
    public static <T> T newProxyInstance(ProxyContext<T> proxyContext) {
        final Class<T> interfaceClass = proxyContext.serviceInterface();
        ClassLoader classLoader = interfaceClass.getClassLoader();
        Class<?>[] interfaces = new Class[]{interfaceClass};
        ReferenceProxy proxy = new ReferenceProxy(proxyContext);
        return (T) Proxy.newProxyInstance(classLoader, interfaces, proxy);
    }

}
```

客户端初始化 newProxyInstance 的就是创建的代理的过程。

客户端调用远程方法，实际上是调用 invoke 的过程。

（1）构建反射 invoke 请求信息，添加 reqId 

（2）netty 远程调用服务端

（3）同步获取响应信息

# 测试

## 引入 maven

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>rpc-client</artifactId>
    <version>0.0.6</version>
</dependency>
```

## 测试代码

```java
public static void main(String[] args) {
    // 服务配置信息
    ReferenceConfig<CalculatorService> config = new DefaultReferenceConfig<CalculatorService>();
    config.serviceId(ServiceIdConst.CALC);
    config.serviceInterface(CalculatorService.class);
    config.addresses("localhost:9527");

    CalculatorService calculatorService = config.reference();
    CalculateRequest request = new CalculateRequest();
    request.setOne(10);
    request.setTwo(20);

    CalculateResponse response = calculatorService.sum(request);
    System.out.println(response);
}
```

测试日志：

```
[DEBUG] [2021-10-05 14:16:17.534] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2021-10-05 14:16:17.625] [main] [c.g.h.r.c.c.RpcClient.connect] - RPC 服务开始启动客户端
...
[INFO] [2021-10-05 14:16:19.328] [main] [c.g.h.r.c.c.RpcClient.connect] - RPC 服务启动客户端完成，监听地址 localhost:9527
[INFO] [2021-10-05 14:16:19.346] [main] [c.g.h.r.c.p.ReferenceProxy.invoke] - [Client] start call remote with request: DefaultRpcRequest{seqId='a525c5a6196545f5a5241b2cdc2ec2c2', createTime=1633414579339, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2021-10-05 14:16:19.347] [main] [c.g.h.r.c.i.i.DefaultInvokeService.addRequest] - [Client] start add request for seqId: a525c5a6196545f5a5241b2cdc2ec2c2
[INFO] [2021-10-05 14:16:19.348] [main] [c.g.h.r.c.p.ReferenceProxy.invoke] - [Client] start call channel id: 00e04cfffe360988-000017bc-00000000-399b9d7e1b88839d-5ccc4a29
十月 05, 2021 2:16:19 下午 io.netty.handler.logging.LoggingHandler write
信息: [id: 0x5ccc4a29, L:/127.0.0.1:50596 - R:localhost/127.0.0.1:9527] WRITE: DefaultRpcRequest{seqId='a525c5a6196545f5a5241b2cdc2ec2c2', createTime=1633414579339, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
十月 05, 2021 2:16:19 下午 io.netty.handler.logging.LoggingHandler flush
信息: [id: 0x5ccc4a29, L:/127.0.0.1:50596 - R:localhost/127.0.0.1:9527] FLUSH
[INFO] [2021-10-05 14:16:19.412] [main] [c.g.h.r.c.p.ReferenceProxy.invoke] - [Client] start get resp for seqId: a525c5a6196545f5a5241b2cdc2ec2c2
[INFO] [2021-10-05 14:16:19.413] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq a525c5a6196545f5a5241b2cdc2ec2c2 对应结果为空，进入等待
十月 05, 2021 2:16:19 下午 io.netty.handler.logging.LoggingHandler channelRead
信息: [id: 0x5ccc4a29, L:/127.0.0.1:50596 - R:localhost/127.0.0.1:9527] READ: DefaultRpcResponse{seqId='a525c5a6196545f5a5241b2cdc2ec2c2', error=null, result=CalculateResponse{success=true, sum=30}}
...
[INFO] [2021-10-05 14:16:19.505] [nioEventLoopGroup-2-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] 获取结果信息，seq: a525c5a6196545f5a5241b2cdc2ec2c2, rpcResponse: DefaultRpcResponse{seqId='a525c5a6196545f5a5241b2cdc2ec2c2', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2021-10-05 14:16:19.505] [nioEventLoopGroup-2-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seq 信息已经放入，通知所有等待方
[INFO] [2021-10-05 14:16:19.506] [nioEventLoopGroup-2-1] [c.g.h.r.c.c.RpcClient.channelRead0] - [Client] response is :DefaultRpcResponse{seqId='a525c5a6196545f5a5241b2cdc2ec2c2', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2021-10-05 14:16:19.506] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq a525c5a6196545f5a5241b2cdc2ec2c2 对应结果已经获取: DefaultRpcResponse{seqId='a525c5a6196545f5a5241b2cdc2ec2c2', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2021-10-05 14:16:19.507] [main] [c.g.h.r.c.p.ReferenceProxy.invoke] - [Client] start get resp for seqId: a525c5a6196545f5a5241b2cdc2ec2c2
CalculateResponse{success=true, sum=30}
```

# 小结

现在看来有一个小问题，要求服务端必须指定 port，这有点不太合理，比如代理域名，后续需要优化。

这里的启动声明方式也比较基础，后续可以考虑和 spring 进行整合。

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

* any list
{:toc}