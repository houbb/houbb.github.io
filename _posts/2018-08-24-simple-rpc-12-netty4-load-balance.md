---
layout: post
title: 基于 netty4 手写 rpc-12-load balance 负载均衡
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# load balance

当我们有多个服务端时，就需要负载均衡进行选择。

## 策略

负载均衡的策略有很多，比如随机选择，权重选择，最小负载等等。

## 实现思路

直接将所有可以选择的服务端列举出来，通过实现对应的策略，选择一个即可。

# 代码实现

## 接口

为了便于拓展，我们定义一个接口。

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * rpc All rights reserved.
 */

package com.github.houbb.rpc.common.rpc.filter;

/**
 * <p> 调用上下文 </p>
 *
 * <pre> Created: 2019/10/26 9:30 上午  </pre>
 * <pre> Project: rpc  </pre>
 *
 * 核心目的：
 * （1）用于定义 filter 相关信息
 * （2）用于 load-balance 相关信息处理
 * （3）后期的路由-分区 都可以视为这样的一个抽象实现而已。
 *
 * 插件式实现：
 * （1）远程调用也认为是一次 filter，上下文中构建 filter-chain
 * （2）filter-chain 可以使用 {@link com.github.houbb.heaven.support.pipeline.Pipeline} 管理
 *
 *
 * 后期拓展：
 * （1）类似于 aop，用户可以自行定义 interceptor 拦截器
 *
 * @author houbinbin
 * @since 0.0.9
 */
public interface RpcFilter {

    /**
     * filter 处理
     * @param rpcFilterContext 调用上下文
     * @since 0.0.9
     */
    void filter(final RpcFilterContext rpcFilterContext);

}
```

## 随机选择

这里实现了负载均衡中最简单的实现，随机选择。

```java
package com.github.houbb.rpc.client.filter.balance;

import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.rpc.common.rpc.domain.RpcChannelFuture;
import com.github.houbb.rpc.common.rpc.filter.RpcFilter;
import com.github.houbb.rpc.common.rpc.filter.RpcFilterContext;

import java.util.List;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 随机负载均衡过滤器
 * 参考：https://www.cnblogs.com/xwdreamer/archive/2012/06/13/2547426.html
 *
 * @author binbin.hou
 * @since 0.0.9
 */
@ThreadSafe
public class RandomBalanceFilter implements RpcFilter {

    @Override
    public void filter(RpcFilterContext rpcFilterContext) {
        List<RpcChannelFuture> channelFutures = rpcFilterContext.channelFutures();
        final int size = channelFutures.size();

        Random random = ThreadLocalRandom.current();
        int index = random.nextInt(size);

        rpcFilterContext.channelFuture(channelFutures.get(index));
    }

}
```

## DefaultReferenceProxy 代理实现的调整

调用服务端的时候，统一进行 filter 处理即可。

```java
package com.github.houbb.rpc.client.proxy.impl;

import com.github.houbb.heaven.util.lang.reflect.ReflectMethodUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.filter.balance.RandomBalanceFilter;
import com.github.houbb.rpc.client.invoke.InvokeService;
import com.github.houbb.rpc.client.proxy.ProxyContext;
import com.github.houbb.rpc.client.proxy.ReferenceProxy;
import com.github.houbb.rpc.common.rpc.domain.RpcRequest;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;
import com.github.houbb.rpc.common.rpc.domain.impl.DefaultRpcRequest;
import com.github.houbb.rpc.common.rpc.domain.impl.RpcResponses;
import com.github.houbb.rpc.common.rpc.filter.RpcFilter;
import com.github.houbb.rpc.common.rpc.filter.RpcFilterContext;
import com.github.houbb.rpc.common.rpc.filter.impl.DefaultRpcFilterContext;
import com.github.houbb.rpc.common.support.id.impl.Ids;
import com.github.houbb.rpc.common.support.time.impl.Times;
import io.netty.channel.Channel;

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
public class DefaultReferenceProxy<T> implements ReferenceProxy<T> {

    private static final Log LOG = LogFactory.getLog(DefaultReferenceProxy.class);

    /**
     * 服务标识
     * @since 0.0.6
     */
    private final ProxyContext<T> proxyContext;

    public DefaultReferenceProxy(ProxyContext<T> proxyContext) {
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
     */
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 反射信息处理成为 rpcRequest
        // 和以前一致

        // 这里使用 load-balance 进行选择 channel 写入。
        // 构建 filter 相关信息,结合 pipeline 进行整合
        final RpcFilterContext rpcFilterContext = buildRpcFilterContext(rpcRequest);
        this.doFilter(rpcFilterContext);
        final Channel channel = rpcFilterContext.channel();
        LOG.info("[Client] start call channel id: {}", channel.id().asLongText());

        // 对于信息的写入，实际上有着严格的要求。
        // writeAndFlush 实际是一个异步的操作，直接使用 sync() 可以看到异常信息。
        // 支持的必须是 ByteBuf
        channel.writeAndFlush(rpcRequest).syncUninterruptibly();
        LOG.info("[Client] start call remote with request: {}", rpcRequest);
        final InvokeService invokeService = proxyContext.invokeService();
        invokeService.addRequest(seqId, proxyContext.timeout());

        // 获取结果
        RpcResponse rpcResponse = invokeService.getResponse(seqId);
        return RpcResponses.getResult(rpcResponse);
    }

    @Override
    @SuppressWarnings("unchecked")
    public T proxy() {
        final Class<T> interfaceClass = proxyContext.serviceInterface();
        ClassLoader classLoader = interfaceClass.getClassLoader();
        Class<?>[] interfaces = new Class[]{interfaceClass};
        return (T) Proxy.newProxyInstance(classLoader, interfaces, this);
    }

    /**
     * 执行过滤
     * @param context 上下文
     * @since 0.0.9
     */
    private void doFilter(final RpcFilterContext context) {
        RpcFilter rpcFilter = new RandomBalanceFilter();
        rpcFilter.filter(context);
    }

    /**
     * 构建 rpc 过滤上下文
     * @return 上下文信息
     * @since 0.0.9
     */
    private RpcFilterContext buildRpcFilterContext(final RpcRequest rpcRequest) {
        DefaultRpcFilterContext context = new DefaultRpcFilterContext();
        context.request(rpcRequest);
        context.timeout(proxyContext.timeout());
        context.channelFutures(proxyContext.channelFutures());
        return context;
    }

}
```

# 测试代码

## 注册中心

启动注册中心。

```
[INFO] [2021-10-05 17:27:31.172] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] 启动完成，监听【8527】端口
```

## 服务端

启动服务端，为了演示启动 2 个服务端。

（1）服务端 1

```
[INFO] [2021-10-05 17:28:04.610] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] 启动完成，监听【9527】端口
[INFO] [2021-10-05 17:28:04.612] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 启动客户端完成，监听地址 127.0.0.1:8527
```

（2）服务端 2

```
[INFO] [2021-10-05 17:28:43.796] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] 启动完成，监听【9526】端口
[INFO] [2021-10-05 17:28:43.798] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 启动客户端完成，监听地址 127.0.0.1:8527
```

## 客户端

客户端进行 10 次调用：

```java
public static void main(String[] args) {
    // 服务配置信息
    ReferenceConfig<CalculatorService> config = ClientBs.newInstance();
    config.serviceId(ServiceIdConst.CALC);
    config.serviceInterface(CalculatorService.class);
    // 自动发现服务
    config.subscribe(true);
    config.registerCenter(ServiceIdConst.REGISTER_CENTER);

    CalculatorService calculatorService = config.reference();
    CalculateRequest request = new CalculateRequest();
    request.setOne(10);
    request.setTwo(20);

    // 循环 10 次，验证负载均衡。
    for(int i = 0; i < 10; i++) {
        CalculateResponse response = calculatorService.sum(request);
        System.out.println(response);
    }
}
```

### 日志

直接通过服务端日志，因为是随机调用，二者收到的请求也基本相同。

- server1

```
[INFO] [2019-11-01 21:44:15.088] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelActive] - [Server] channel {} connected 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2
[INFO] [2019-11-01 21:44:15.149] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel read start: 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2
[INFO] [2019-11-01 21:44:15.150] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2 request: DefaultRpcRequest{seqId='4999d107fd39497691a8427871fa9af1', createTime=1572615855133, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2019-11-01 21:44:15.153] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2 response DefaultRpcResponse{seqId='4999d107fd39497691a8427871fa9af1', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2019-11-01 21:44:15.172] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel read start: 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2
[INFO] [2019-11-01 21:44:15.173] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2 request: DefaultRpcRequest{seqId='1dcaffd156e444d29d1568bb93325c66', createTime=1572615855169, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2019-11-01 21:44:15.174] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2 response DefaultRpcResponse{seqId='1dcaffd156e444d29d1568bb93325c66', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2019-11-01 21:44:15.178] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel read start: 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2
[INFO] [2019-11-01 21:44:15.179] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2 request: DefaultRpcRequest{seqId='88f9fd2c9b8f4ce29cc02246529fe475', createTime=1572615855176, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2019-11-01 21:44:15.180] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2 response DefaultRpcResponse{seqId='88f9fd2c9b8f4ce29cc02246529fe475', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2019-11-01 21:44:15.184] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel read start: 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2
[INFO] [2019-11-01 21:44:15.184] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2 request: DefaultRpcRequest{seqId='51e2a2171e4b4e9987c6d23081c48a0e', createTime=1572615855181, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2019-11-01 21:44:15.185] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 502b73fffec4485c-00001e18-00000002-3d6e1c4a0fd59bed-6a5605d2 response DefaultRpcResponse{seqId='51e2a2171e4b4e9987c6d23081c48a0e', error=null, result=CalculateResponse{success=true, sum=30}}
```

- server2

```
[INFO] [2019-11-01 21:44:15.126] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel read start: 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73
[INFO] [2019-11-01 21:44:15.127] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73 request: DefaultRpcRequest{seqId='14ee5788e1754575a90ef7ba64340455', createTime=1572615855087, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2019-11-01 21:44:15.130] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73 response DefaultRpcResponse{seqId='14ee5788e1754575a90ef7ba64340455', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2019-11-01 21:44:15.159] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel read start: 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73
[INFO] [2019-11-01 21:44:15.160] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73 request: DefaultRpcRequest{seqId='a935c347059a477a96b132e41b4b78c1', createTime=1572615855156, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2019-11-01 21:44:15.161] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73 response DefaultRpcResponse{seqId='a935c347059a477a96b132e41b4b78c1', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2019-11-01 21:44:15.166] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel read start: 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73
[INFO] [2019-11-01 21:44:15.166] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73 request: DefaultRpcRequest{seqId='82778d7d616547e6917f77e6da6e11df', createTime=1572615855163, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2019-11-01 21:44:15.167] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73 response DefaultRpcResponse{seqId='82778d7d616547e6917f77e6da6e11df', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2019-11-01 21:44:15.192] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel read start: 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73
[INFO] [2019-11-01 21:44:15.192] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73 request: DefaultRpcRequest{seqId='c4e380597fe6419ab12b8928278e4cdb', createTime=1572615855188, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2019-11-01 21:44:15.193] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73 response DefaultRpcResponse{seqId='c4e380597fe6419ab12b8928278e4cdb', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2019-11-01 21:44:15.198] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel read start: 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73
[INFO] [2019-11-01 21:44:15.198] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73 request: DefaultRpcRequest{seqId='399a2fd2d393413497172510e0651ce9', createTime=1572615855195, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2019-11-01 21:44:15.199] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73 response DefaultRpcResponse{seqId='399a2fd2d393413497172510e0651ce9', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2019-11-01 21:44:15.203] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel read start: 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73
[INFO] [2019-11-01 21:44:15.204] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73 request: DefaultRpcRequest{seqId='cc1f64281beb4c87bf11eac565609883', createTime=1572615855201, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2019-11-01 21:44:15.205] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 00e04cfffeab09cf-00001d94-00000002-b86e77aa0fd59bd3-dd549b73 response DefaultRpcResponse{seqId='cc1f64281beb4c87bf11eac565609883', error=null, result=CalculateResponse{success=true, sum=30}}
```



# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

我是老马，期待与你的下次重逢。

* any list
{:toc}