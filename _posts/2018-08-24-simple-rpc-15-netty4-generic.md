---
layout: post
title: 基于 netty4 手写 rpc-15-generic 泛化调用
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# generic 泛化调用

## 说明

泛化接口调用方式主要用于客户端没有 API 接口及模型类元的情况，参数及返回值中的所有 POJO 均用 Map 表示，通常用于框架集成，比如：实现一个通用的服务测试框架，可通过 GenericService 调用所有服务实现。

```java
GenericService barService = (GenericService) applicationContext.getBean("barService");
Object result = barService.$invoke("sayHello", new String[] { "java.lang.String" }, new Object[] { "World" });
```

## 实现思路

### 客户端

泛化调用个人感受不是很深，但是有一点，当没有服务端接口的时候，也就无法通过反射获取对应的方法等原始信息。

所以需要额外提供一个接口，并且可以获取方法的相关属性。

### 服务端

本次基本没做处理。

个人理解是客户使用的时候自行定义实现类。

# 代码实现

## 接口定义

```java
package com.github.houbb.rpc.common.support.generic;

import com.github.houbb.rpc.common.exception.GenericException;

/**
 * 泛化调用接口
 * （1）接口直接使用 dubbo 的接口
 *
 *
 * 【应用场景】
 * 泛接口实现方式主要用于服务器端没有API接口及模型类元的情况，参数及返回值中的所有POJO均用Map表示，通常用于框架集成，比如：实现一个通用的远程服务Mock框架，可通过实现GenericService接口处理所有服务请求。
 *
 * 【服务端】
 * 服务端代码不需要做任何调整。
 * 客户端泛化调用进行相关调整即可。
 *
 * 【客户端】
 *
 * @author binbin.hou
 * @since 0.1.2
 */
public interface GenericService {

    /**
     * Generic invocation
     *
     * @param method         Method name, e.g. findPerson. If there are overridden methods, parameter info is
     *                       required, e.g. findPerson(java.lang.String)
     * @param parameterTypes Parameter types
     * @param args           Arguments
     * @return invocation return value
     * @throws GenericException potential exception thrown from the invocation
     */
    Object $invoke(String method, String[] parameterTypes, Object[] args) throws GenericException;


}
```

## 实现

```java
package com.github.houbb.rpc.client.proxy.impl;

import com.github.houbb.heaven.util.guava.Guavas;
import com.github.houbb.heaven.util.id.impl.Ids;
import com.github.houbb.heaven.util.time.impl.Times;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.proxy.RemoteInvokeService;
import com.github.houbb.rpc.client.proxy.ServiceContext;
import com.github.houbb.rpc.common.exception.GenericException;
import com.github.houbb.rpc.common.rpc.domain.impl.DefaultRpcRequest;
import com.github.houbb.rpc.common.support.generic.GenericService;

import java.util.List;

/**
 * 泛化调用
 * @author binbin.hou
 * @since 0.1.2
 */
public class GenericReferenceProxy implements GenericService {

    private static final Log LOG = LogFactory.getLog(GenericReferenceProxy.class);

    /**
     * 代理上下文
     * （1）这个信息不应该被修改，应该和指定的 service 紧密关联。
     * @since 0.1.3
     */
    private final ServiceContext proxyContext;

    /**
     * 远程调用接口
     * @since 0.1.3
     */
    private final RemoteInvokeService remoteInvokeService;

    public GenericReferenceProxy(ServiceContext proxyContext, RemoteInvokeService remoteInvokeService) {
        this.proxyContext = proxyContext;
        this.remoteInvokeService = remoteInvokeService;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Object $invoke(String method, String[] parameterTypes, Object[] args) throws GenericException {
        // 构建基本调用参数
        final long createTime = Times.systemTime();
        Object[] actualArgs = new Object[]{method, parameterTypes, args};
        DefaultRpcRequest rpcRequest = new DefaultRpcRequest();
        rpcRequest.serviceId(proxyContext.serviceId());
        rpcRequest.createTime(createTime);
        rpcRequest.paramValues(actualArgs);
        List<String> paramTypeNames = Guavas.newArrayList();
        paramTypeNames.add("java.lang.String");
        paramTypeNames.add("[Ljava.lang.String;");
        paramTypeNames.add("[Ljava.lang.Object;");
        rpcRequest.paramTypeNames(paramTypeNames);
        rpcRequest.methodName("$invoke");
        rpcRequest.returnType(Object.class);

        //proxyContext 中应该是属于当前 service 的对应信息。
        // 每一次调用，对应的 invoke 信息应该是不通的，需要创建新的对象去传递信息
        // rpcRequest 因为要涉及到网络间传输，尽可能保证其简洁性。
        DefaultRemoteInvokeContext context = new DefaultRemoteInvokeContext();
        context.request(rpcRequest);
        context.traceId(Ids.uuid32());
        context.retryTimes(2);
        context.serviceProxyContext(proxyContext);
        context.remoteInvokeService(remoteInvokeService);

        //3. 执行远程调用
        return remoteInvokeService.remoteInvoke(context);
    }

}
```

# 客户端调整

实现了上面的泛化调用之后，我们把这个特性可以让客户端指定配置。

```java
/**
 * 引用配置类
 * @param <T> 接口泛型
 * @author binbin.hou
 * @since 0.0.6
 */
public class ClientBs<T> implements ReferenceConfig<T> {

    // 保持不变

    /**
     * 是否进行泛化调用
     * @since 0.1.2
     */
    private boolean generic;

    // 不变

    /**
     * 获取对应的引用实现
     * （1）处理所有的反射代理信息-方法可以抽离，启动各自独立即可。
     * （2）启动对应的长连接
     *
     * @return 引用代理类
     * @since 0.0.6
     */
    @Override
    @SuppressWarnings("unchecked")
    public T reference() {
        // 1. 启动 client 端到 server 端的连接信息
        // 1.1 为了提升性能，可以将所有的 client=>server 的连接都调整为一个 thread。
        // 1.2 初期为了简单，直接使用同步循环的方式。
        // 获取地址列表信息
        List<RpcAddress> rpcAddressList = this.getRpcAddresses();

        //2. 循环链接
        List<RpcChannelFuture> channelFutureList = ChannelHandlers.channelFutureList(rpcAddressList, new ChannelHandlerFactory() {
            @Override
            public ChannelHandler handler() {
                final ChannelHandler channelHandler = new RpcClientHandler(invokeService);
                return ChannelHandlers.objectCodecHandler(channelHandler);
            }
        });

        //3. 接口动态代理
        ServiceContext<T> proxyContext = buildServiceProxyContext(channelFutureList);
        //3.1 动态代理
        //3.2 为了提升性能，可以使用 javaassit 等基于字节码的技术

        if(!this.generic) {
            ReferenceProxy<T> referenceProxy = new DefaultReferenceProxy<>(proxyContext, remoteInvokeService);
            return referenceProxy.proxy();
        } else {
            LOG.info("[Client] generic reference proxy created.");
            return (T) new GenericReferenceProxy(proxyContext, remoteInvokeService);
        }

    }

    // 不变

    @Override
    public ClientBs<T> generic(boolean generic) {
        this.generic = generic;
        return this;
    }

    // 不变

    /**
     * 构建调用上下文
     *
     * @param channelFutureList 信息列表
     * @return 引用代理上下文
     * @since 0.0.6
     */
    private ServiceContext<T> buildServiceProxyContext(final List<RpcChannelFuture> channelFutureList) {
        DefaultServiceContext<T> proxyContext = new DefaultServiceContext<>();
        proxyContext.serviceId(this.serviceId);
        proxyContext.serviceInterface(this.serviceInterface);
        proxyContext.channelFutures(channelFutureList);
        proxyContext.invokeService(this.invokeService);
        proxyContext.timeout(this.timeout);
        proxyContext.callType(this.callType);
        proxyContext.failType(this.failType);
        proxyContext.generic(this.generic);
        return proxyContext;
    }

}
```

当用户指定 generic 调用的时候，我们就是用定义好的 GenericReferenceProxy。

# 测试

## 注册中心

启动

```
[INFO] [2021-10-06 07:49:54.559] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] 启动完成，监听【8527】端口
```

## 服务端

```java
// 启动服务
ServiceBs.getInstance()
        .register(ServiceIdConst.GENERIC, new FooGenericService())
        .registerCenter(ServiceIdConst.REGISTER_CENTER)
        .expose();
```

其中 FooGenericService 实现如下：

```java
public final class FooGenericService implements GenericService {

    private static final Log LOG = LogFactory.getLog(FooGenericService.class);

    @Override
    public Object $invoke(String method, String[] parameterTypes, Object[] args) throws GenericException {
        LOG.info("[Generic] method: {}", method);
        LOG.info("[Generic] parameterTypes: {}", Arrays.toString(parameterTypes));
        LOG.info("[Generic] args: {}", args);
        return null;
    }

}
```

日志：

```
[INFO] [2021-10-06 07:50:19.718] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] 启动完成，监听【9527】端口
[INFO] [2021-10-06 07:50:19.721] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 启动客户端完成，监听地址 127.0.0.1:8527
```

## 客户端

```java
public static void main(String[] args) {
    // 服务配置信息
    ReferenceConfig<GenericService> config = ClientBs.newInstance();
    config.serviceId(ServiceIdConst.GENERIC);
    config.serviceInterface(GenericService.class);
    config.subscribe(true);
    config.registerCenter(ServiceIdConst.REGISTER_CENTER);
    config.generic(true);

    GenericService genericService = config.reference();
    genericService.$invoke("hello", new String[]{"name"}, new Object[]{"123"});
}
```

此时服务端对应的日志：

```
[INFO] [2021-10-06 07:52:41.467] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelActive] - [Server] channel {} connected 00e04cfffe360988-00000ec8-00000002-12c0fc9a5e1fa6f7-c2e7b9a7
[INFO] [2021-10-06 07:52:41.506] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel read start: 00e04cfffe360988-00000ec8-00000002-12c0fc9a5e1fa6f7-c2e7b9a7
[INFO] [2021-10-06 07:52:41.507] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] receive channel 00e04cfffe360988-00000ec8-00000002-12c0fc9a5e1fa6f7-c2e7b9a7 request: DefaultRpcRequest{seqId='11a2832af424407abc2fe8463743ed06', createTime=1633477961464, serviceId='generic', methodName='$invoke', paramTypeNames=[java.lang.String, [Ljava.lang.String;, [Ljava.lang.Object;], paramValues=[hello, [Ljava.lang.String;@2ae9eb75, [Ljava.lang.Object;@48a03a3], returnType=class java.lang.Object}
[INFO] [2021-10-06 07:52:41.509] [nioEventLoopGroup-2-1] [c.g.h.r.c.s.g.i.FooGenericService.$invoke] - [Generic] method: hello
[INFO] [2021-10-06 07:52:41.510] [nioEventLoopGroup-2-1] [c.g.h.r.c.s.g.i.FooGenericService.$invoke] - [Generic] parameterTypes: [name]
[INFO] [2021-10-06 07:52:41.510] [nioEventLoopGroup-2-1] [c.g.h.r.c.s.g.i.FooGenericService.$invoke] - [Generic] args: 123
[INFO] [2021-10-06 07:52:41.512] [nioEventLoopGroup-2-1] [c.g.h.r.s.h.RpcServerHandler.channelRead0] - [Server] channel 00e04cfffe360988-00000ec8-00000002-12c0fc9a5e1fa6f7-c2e7b9a7 response DefaultRpcResponse{seqId='11a2832af424407abc2fe8463743ed06', error=null, result=null}
```

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

我是老马，期待与你的下次重逢。

* any list
{:toc}