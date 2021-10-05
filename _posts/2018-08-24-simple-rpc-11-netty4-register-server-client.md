---
layout: post
title: 基于 netty4 手写 rpc-11-register center 注册中心
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# register 注册中心

上一节我们实现了 register 注册中心的基本实现，当然客户端和服务端也需要相关的实现调整。

# 服务端

## ServiceRegistry

### 接口

调整如下：

```java
package com.github.houbb.rpc.server.registry;

/**
 * 服务注册类
 * （1）每个应用唯一
 * （2）每个服务的暴露协议应该保持一致
 * 暂时不提供单个服务的特殊处理，后期可以考虑添加
 *
 * @author binbin.hou
 * @since 0.0.6
 */
public interface ServiceRegistry {

    // 不变

    /**
     * 注册中心地址信息
     * @param addresses 地址信息
     * @return this
     * @since 0.0.8
     */
    ServiceRegistry registerCenter(final String addresses);

}
```

## 实现

```java
package com.github.houbb.rpc.server.registry.impl;

import com.github.houbb.heaven.util.common.ArgUtil;
import com.github.houbb.heaven.util.guava.Guavas;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.common.config.component.RpcAddress;
import com.github.houbb.rpc.common.config.component.RpcAddressBuilder;
import com.github.houbb.rpc.common.config.protocol.ProtocolConfig;
import com.github.houbb.rpc.common.remote.netty.handler.ChannelHandlers;
import com.github.houbb.rpc.common.remote.netty.impl.DefaultNettyClient;
import com.github.houbb.rpc.common.remote.netty.impl.DefaultNettyServer;
import com.github.houbb.rpc.common.util.NetUtil;
import com.github.houbb.rpc.register.domain.entry.ServiceEntry;
import com.github.houbb.rpc.register.domain.entry.impl.ServiceEntryBuilder;
import com.github.houbb.rpc.register.domain.message.RegisterMessage;
import com.github.houbb.rpc.register.domain.message.impl.RegisterMessages;
import com.github.houbb.rpc.register.simple.constant.MessageTypeConst;
import com.github.houbb.rpc.server.config.service.DefaultServiceConfig;
import com.github.houbb.rpc.server.config.service.ServiceConfig;
import com.github.houbb.rpc.server.handler.RpcServerHandler;
import com.github.houbb.rpc.server.handler.RpcServerRegisterHandler;
import com.github.houbb.rpc.server.registry.ServiceRegistry;
import com.github.houbb.rpc.server.service.impl.DefaultServiceFactory;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandler;

import java.util.ArrayList;
import java.util.List;

/**
 * 默认服务端注册类
 * @author binbin.hou
 * @since 0.0.6
 */
public class DefaultServiceRegistry implements ServiceRegistry {

    /**
     * 日志信息
     * @since 0.0.8
     */
    private static final Log LOG = LogFactory.getLog(DefaultServiceRegistry.class);
    /**
     * 单例信息
     * @since 0.0.6
     */
    private static final DefaultServiceRegistry INSTANCE = new DefaultServiceRegistry();

    /**
     * rpc 服务端端口号
     * @since 0.0.6
     */
    private int rpcPort;

    /**
     * 协议配置
     * （1）默认只实现 tcp
     * （2）后期可以拓展实现 web-service/http/https 等等。
     * @since 0.0.6
     */
    private ProtocolConfig protocolConfig;

    /**
     * 服务配置列表
     * @since 0.0.6
     */
    private List<ServiceConfig> serviceConfigList;

    /**
     * 注册中心地址列表
     * @since 0.0.8
     */
    private List<RpcAddress> registerCenterList;

    private DefaultServiceRegistry(){
        // 初始化默认参数
        this.serviceConfigList = new ArrayList<>();
        this.rpcPort = 9527;
        this.registerCenterList = Guavas.newArrayList();
    }

    public static DefaultServiceRegistry getInstance() {
        return INSTANCE;
    }

    @Override
    public ServiceRegistry port(int port) {
        ArgUtil.positive(port, "port");

        this.rpcPort = port;
        return this;
    }

    /**
     * 注册服务实现
     * （1）主要用于后期服务调用
     * （2）如何根据 id 获取实现？非常简单，id 是唯一的。
     * 有就是有，没有就抛出异常，直接返回。
     * （3）如果根据 {@link com.github.houbb.rpc.common.rpc.domain.RpcRequest} 获取对应的方法。
     *
     * 3.1 根据 serviceId 获取唯一的实现
     * 3.2 根据 {@link Class#getMethod(String, Class[])} 方法名称+参数类型唯一获取方法
     * 3.3 根据 {@link java.lang.reflect.Method#invoke(Object, Object...)} 执行方法
     *
     * @param serviceId 服务标识
     * @param serviceImpl 服务实现
     * @return this
     * @since 0.0.6
     */
    @Override
    @SuppressWarnings("unchecked")
    public synchronized DefaultServiceRegistry register(final String serviceId, final Object serviceImpl) {
        ArgUtil.notEmpty(serviceId, "serviceId");
        ArgUtil.notNull(serviceImpl, "serviceImpl");

        // 构建对应的其他信息
        ServiceConfig serviceConfig = new DefaultServiceConfig();
        //TODO: 是否暴露服务，允许用户指定
        serviceConfig.id(serviceId).reference(serviceImpl).register(true);
        serviceConfigList.add(serviceConfig);

        return this;
    }

    @Override
    public ServiceRegistry expose() {
        // 注册所有服务信息
        DefaultServiceFactory.getInstance()
                .registerServicesLocal(serviceConfigList);
        LOG.info("server register local finish.");

        // 启动 netty server 信息
        final ChannelHandler channelHandler = ChannelHandlers
                .objectCodecHandler(new RpcServerHandler());
        DefaultNettyServer.newInstance(rpcPort, channelHandler).asyncRun();
        LOG.info("server service start finish.");

        // 注册到配置中心
        this.registerServiceCenter();
        LOG.info("server service register finish.");

        return this;
    }

    @Override
    public ServiceRegistry registerCenter(String addresses) {
        this.registerCenterList = RpcAddressBuilder.of(addresses);
        return this;
    }

    /**
     * 注冊服務到注册中心
     * （1）循环服务列表注册到配置中心列表
     * （2）如果 register 为 false，则不进行注册
     * （3）后期可以添加延迟暴露，但是感觉意义不大。
     * @since 0.0.8
     */
    private void registerServiceCenter() {
        // 注册到配置中心
        // 初期简单点，直接循环调用即可
        // 循环服务信息
        for(ServiceConfig config : this.serviceConfigList) {
            boolean register = config.register();
            final String serviceId = config.id();
            if(!register) {
                LOG.info("[Rpc Server] serviceId: {} register config is false.",
                        serviceId);
                continue;
            }

            for(RpcAddress rpcAddress : registerCenterList) {
                ChannelHandler registerHandler = ChannelHandlers.objectCodecHandler(new RpcServerRegisterHandler());
                LOG.info("[Rpc Server] start register to {}:{}", rpcAddress.address(),
                        rpcAddress.port());
                ChannelFuture channelFuture = DefaultNettyClient.newInstance(rpcAddress.address(), rpcAddress.port(),registerHandler).call();

                // 直接写入信息
                RegisterMessage registerMessage = buildRegisterMessage(config);
                LOG.info("[Rpc Server] register to service center: {}", registerMessage);
                channelFuture.channel().writeAndFlush(registerMessage);
            }
        }
    }

    /**
     * 构建注册信息配置
     * @param config 配置信息
     * @return 注册信息
     * @since 0.0.6
     */
    private RegisterMessage buildRegisterMessage(final ServiceConfig config) {
        final String hostIp = NetUtil.getLocalHost();
        ServiceEntry serviceEntry = ServiceEntryBuilder.of(config.id(),
                hostIp, rpcPort);

        return RegisterMessages.of(MessageTypeConst.SERVER_REGISTER,
                serviceEntry);
    }

}
```

服务端启动的时候，可以指定是否 register 到注册中心。

我们会循环整个注册中心列表，然后把 register=true 的服务，注册到每一个注册中心中去。

注册内容也比较简单，就是将标识，对应的服务端地址信息通知到注册中心。

### RpcServerRegisterHandler 

这个是服务端关于注册中心的 handler，实现暂时比较简单：

```java
package com.github.houbb.rpc.server.handler;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

/**
 * 注册中心
 * （1）用于和注册中心建立长连接。
 * （2）初期设计中服务端不需要做什么事情。
 *
 * 后期可以调整为接收到影响为准，保证请求成功。
 * @author binbin.hou
 * @since 0.0.8
 */
public class RpcServerRegisterHandler extends SimpleChannelInboundHandler {

    private static final Log LOG = LogFactory.getLog(RpcServerRegisterHandler.class);

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        LOG.info("[Rpc Server] received message: {}", msg);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        LOG.error("[Rpc Server] meet ex", cause);
        ctx.close();
    }

}
```

# 客户端

## DefaultReferenceConfig

```java
package com.github.houbb.rpc.client.config.reference.impl;

import com.github.houbb.heaven.support.handler.IHandler;
import com.github.houbb.heaven.util.guava.Guavas;
import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.config.reference.ReferenceConfig;
import com.github.houbb.rpc.client.handler.RpcClientHandler;
import com.github.houbb.rpc.client.handler.RpcClientRegisterHandler;
import com.github.houbb.rpc.client.invoke.InvokeService;
import com.github.houbb.rpc.client.invoke.impl.DefaultInvokeService;
import com.github.houbb.rpc.client.proxy.ReferenceProxy;
import com.github.houbb.rpc.client.proxy.context.ProxyContext;
import com.github.houbb.rpc.client.proxy.context.impl.DefaultProxyContext;
import com.github.houbb.rpc.common.config.component.RpcAddress;
import com.github.houbb.rpc.common.config.component.RpcAddressBuilder;
import com.github.houbb.rpc.common.exception.RpcRuntimeException;
import com.github.houbb.rpc.common.remote.netty.handler.ChannelHandlers;
import com.github.houbb.rpc.common.remote.netty.impl.DefaultNettyClient;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;
import com.github.houbb.rpc.common.rpc.domain.impl.RpcResponses;
import com.github.houbb.rpc.register.domain.entry.ServiceEntry;
import com.github.houbb.rpc.register.domain.entry.impl.ServiceEntryBuilder;
import com.github.houbb.rpc.register.domain.message.RegisterMessage;
import com.github.houbb.rpc.register.domain.message.impl.RegisterMessages;
import com.github.houbb.rpc.register.simple.constant.MessageTypeConst;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandler;

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
public class DefaultReferenceConfig<T> implements ReferenceConfig<T> {

    private static final Log LOG = LogFactory.getLog(DefaultReferenceConfig.class);

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
     * 调用服务管理类
     * @since 0.0.6
     */
    private InvokeService invokeService;

    /**
     * 调用超时时间
     * @since 0.0.7
     */
    private long timeout;

    /**
     * 是否进行订阅模式
     * @since 0.0.8
     */
    private boolean subscribe;

    /**
     * 注册中心列表
     * @since 0.0.8
     */
    private List<RpcAddress> registerCenterList;

    /**
     * 注册中心超时时间
     * @since 0.0.8
     */
    private long registerCenterTimeOut;

    public DefaultReferenceConfig() {
        // 初始化信息
        this.rpcAddresses = Guavas.newArrayList();
        this.channelFutures = Guavas.newArrayList();
        this.invokeService = new DefaultInvokeService();
        // 默认为 60s 超时
        this.timeout = 60*1000;
        this.registerCenterList = Guavas.newArrayList();
        this.registerCenterTimeOut = 60*1000;
    }

    // 保持不变

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
        // 循环连接
        List<RpcAddress> rpcAddressList = getRpcAddresses();

        for(RpcAddress rpcAddress : rpcAddressList) {
            final ChannelHandler channelHandler = new RpcClientHandler(invokeService);
            final ChannelHandler actualChannlHandler = ChannelHandlers.objectCodecHandler(channelHandler);
            ChannelFuture channelFuture = DefaultNettyClient.newInstance(rpcAddress.address(), rpcAddress.port(), actualChannlHandler).call();
            channelFutures.add(channelFuture);
        }

        // 2. 接口动态代理
        ProxyContext<T> proxyContext = buildReferenceProxyContext();
        return ReferenceProxy.newProxyInstance(proxyContext);
    }



    @Override
    public DefaultReferenceConfig<T> timeout(long timeout) {
        this.timeout = timeout;
        return this;
    }

    @Override
    public ReferenceConfig<T> subscribe(boolean subscribe) {
        this.subscribe = subscribe;
        return this;
    }

    @Override
    public ReferenceConfig<T> registerCenter(String addresses) {
        this.registerCenterList = RpcAddressBuilder.of(addresses);
        return this;
    }

    /**
     * 获取 rpc 地址信息列表
     * （1）默认直接通过指定的地址获取
     * （2）如果指定列表为空，且
     * @return rpc 地址信息列表
     * @since 0.0.8
     */
    @SuppressWarnings("unchecked")
    private List<RpcAddress> getRpcAddresses() {
        //0. 快速返回
        if(CollectionUtil.isNotEmpty(rpcAddresses)) {
            return rpcAddresses;
        }

        //1. 信息检查
        registerCenterParamCheck();

        //2. 查询服务信息
        List<ServiceEntry> serviceEntries = lookUpServiceEntryList();
        LOG.info("[Client] register center serviceEntries: {}", serviceEntries);
        //3. 结果转换
        return CollectionUtil.toList(serviceEntries, new IHandler<ServiceEntry, RpcAddress>() {
            @Override
            public RpcAddress handle(ServiceEntry serviceEntry) {
                return new RpcAddress(serviceEntry.ip(),
                        serviceEntry.port(), serviceEntry.weight());
            }
        });
    }

    /**
     * 注册中心参数检查
     * （1）如果可用列表为空，且没有指定自动发现，这个时候服务已经不可用了。
     * @since 0.0.8
     */
    private void registerCenterParamCheck() {
        if(!subscribe) {
            LOG.error("[Rpc Client] no available services found for serviceId:{}",
                    serviceId);
            throw new RpcRuntimeException();
        }
        if(CollectionUtil.isEmpty(registerCenterList)) {
            LOG.error("[Rpc Client] register center address can't be null!:{}",
                    serviceId);
            throw new RpcRuntimeException();
        }
    }

    /**
     * 查询服务信息列表
     * @return 服务明细列表
     * @since 0.0.8
     */
    @SuppressWarnings("unchecked")
    private List<ServiceEntry> lookUpServiceEntryList() {
        //1. 连接到注册中心
        List<ChannelFuture> channelFutureList = connectRegisterCenter();

        //2. 选择一个
        // 直接取第一个即可，后续可以使用 load-balance 策略。
        ChannelFuture channelFuture = channelFutureList.get(0);

        //3. 发送查询请求
        ServiceEntry serviceEntry = ServiceEntryBuilder.of(serviceId);
        RegisterMessage registerMessage = RegisterMessages.of(MessageTypeConst.CLIENT_LOOK_UP, serviceEntry);
        final String seqId = registerMessage.seqId();
        invokeService.addRequest(seqId, registerCenterTimeOut);
        channelFuture.channel().writeAndFlush(registerMessage);

        //4. 等待查询结果
        RpcResponse rpcResponse = invokeService.getResponse(seqId);
        return (List<ServiceEntry>) RpcResponses.getResult(rpcResponse);
    }

    /**
     * 连接到注册中心
     * @return 对应的结果列表
     * @since 0.0.8
     */
    private List<ChannelFuture> connectRegisterCenter() {
        List<ChannelFuture> futureList = Guavas.newArrayList(registerCenterList.size());
        ChannelHandler channelHandler = ChannelHandlers.objectCodecHandler(new RpcClientRegisterHandler(invokeService));

        for(RpcAddress rpcAddress : registerCenterList) {
            final String ip = rpcAddress.address();
            final int port = rpcAddress.port();
            LOG.info("[Rpc Client] connect to register {}:{} ",
                    ip, port);
            ChannelFuture channelFuture = DefaultNettyClient
                    .newInstance(ip, port, channelHandler)
                    .call();

            futureList.add(channelFuture);
        }
        return futureList;
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
        proxyContext.timeout(this.timeout);
        return proxyContext;
    }

}
```

这里客户端启动的时候，会根据是否指定 subscribe 来判断是否需要去注册中心获取服务端地址信息。


# 测试

## 注册中心

首先启动注册中心：

```java
RegisterBs.newInstance().start();
```

日志如下：

```
[DEBUG] [2021-10-05 16:56:33.022] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2021-10-05 16:56:33.370] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] start with port: 8527 and channelHandler:  
十月 05, 2021 4:56:34 下午 io.netty.handler.logging.LoggingHandler channelRegistered
信息: [id: 0x63a10deb] REGISTERED
十月 05, 2021 4:56:34 下午 io.netty.handler.logging.LoggingHandler bind
信息: [id: 0x63a10deb] BIND: 0.0.0.0/0.0.0.0:8527
十月 05, 2021 4:56:34 下午 io.netty.handler.logging.LoggingHandler channelActive
信息: [id: 0x63a10deb, L:/0:0:0:0:0:0:0:0:8527] ACTIVE

[INFO] [2021-10-05 16:56:34.952] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] 启动完成，监听【8527】端口
```

## 服务端

指定了注册中心的地址，默认为本地 8527 端口。

```java
public static void main(String[] args) {
    // 启动服务
    DefaultServiceRegistry.getInstance()
            .register(ServiceIdConst.CALC, new CalculatorServiceImpl())
            .registerCenter(ServiceIdConst.REGISTER_CENTER)
            .expose();
}
```

启动日志：

```
[DEBUG] [2021-10-05 16:59:50.633] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2021-10-05 16:59:50.703] [main] [c.g.h.r.s.r.i.DefaultServiceRegistry.expose] - server register local finish.
[INFO] [2021-10-05 16:59:50.865] [main] [c.g.h.r.s.r.i.DefaultServiceRegistry.expose] - server service start finish.
[INFO] [2021-10-05 16:59:50.873] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] start with port: 9527 and channelHandler:  
[INFO] [2021-10-05 16:59:50.873] [main] [c.g.h.r.s.r.i.DefaultServiceRegistry.registerServiceCenter] - [Rpc Server] start register to 127.0.0.1:8527
[INFO] [2021-10-05 16:59:50.886] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 开始启动客户端
...
[INFO] [2021-10-05 16:59:51.981] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] 启动完成，监听【9527】端口
[INFO] [2021-10-05 16:59:51.983] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 启动客户端完成，监听地址 127.0.0.1:8527
[INFO] [2021-10-05 16:59:52.003] [main] [c.g.h.r.s.r.i.DefaultServiceRegistry.registerServiceCenter] - [Rpc Server] register to service center: DefaultRegisterMessage{header=DefaultRegisterMessageHeader{type=1}, body=DefaultServiceEntry{serviceId='calc', description='null', ip='192.168.124.16', port=9527, weight=0}}
[INFO] [2021-10-05 16:59:52.014] [main] [c.g.h.r.s.r.i.DefaultServiceRegistry.expose] - server service register finish.
```

server 对于 register center 而言，也是客户端。

启动的时候，会向注册中心进行一次注册。

此时，注册中心的日志如下：

```
[INFO] [2021-10-05 16:59:52.030] [nioEventLoopGroup-2-1] [c.g.h.r.r.s.h.RegisterCenterServerHandler.channelActive] - [Register Server] channel {} connected 00e04cfffe360988-00000954-00000001-108f8fc327e63f2c-d152f0a9
[INFO] [2021-10-05 16:59:52.121] [nioEventLoopGroup-2-1] [c.g.h.r.r.s.h.RegisterCenterServerHandler.channelRead0] - [Register Server] received message type: 1, seqId: 5429a50862f542e4bf451e8624cc7f12 
[INFO] [2021-10-05 16:59:52.123] [nioEventLoopGroup-2-1] [c.g.h.r.r.s.s.i.DefaultServerRegisterService.register] - [Register Server] add service: DefaultServiceEntry{serviceId='calc', description='null', ip='192.168.124.16', port=9527, weight=0}
[INFO] [2021-10-05 16:59:52.124] [nioEventLoopGroup-2-1] [c.g.h.r.r.s.c.i.DefaultClientRegisterService.notify] - [Register] notify clients is empty for service: calc
```

## 客户端

### 测试代码

```java
public static void main(String[] args) {
    // 服务配置信息
    ReferenceConfig<CalculatorService> config = new DefaultReferenceConfig<CalculatorService>();
    config.serviceId(ServiceIdConst.CALC);
    config.serviceInterface(CalculatorService.class);
    // 自动发现服务
    config.subscribe(true);
    config.registerCenter(ServiceIdConst.REGISTER_CENTER);

    CalculatorService calculatorService = config.reference();
    CalculateRequest request = new CalculateRequest();
    request.setOne(10);
    request.setTwo(20);

    CalculateResponse response = calculatorService.sum(request);
    System.out.println("响应结果：" + response);
}
```

### 日志

```
[DEBUG] [2021-10-05 17:05:52.360] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2021-10-05 17:05:52.602] [main] [c.g.h.r.c.c.r.i.DefaultReferenceConfig.connectRegisterCenter] - [Rpc Client] connect to register 127.0.0.1:8527 
[INFO] [2021-10-05 17:05:52.610] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 开始启动客户端
[INFO] [2021-10-05 17:05:53.665] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 启动客户端完成，监听地址 127.0.0.1:8527
[INFO] [2021-10-05 17:05:53.676] [main] [c.g.h.r.c.i.i.DefaultInvokeService.addRequest] - [Client] start add request for seqId: 4c8455ae4f574478bf78772024608bc2, timeoutMills: 60000
[INFO] [2021-10-05 17:05:53.688] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq 4c8455ae4f574478bf78772024608bc2 对应结果为空，进入等待
[INFO] [2021-10-05 17:05:53.752] [nioEventLoopGroup-2-1] [c.g.h.r.c.h.RpcClientRegisterHandler.channelRead0] - [Client Register] response is :DefaultRpcResponse{seqId='4c8455ae4f574478bf78772024608bc2', error=null, result=[DefaultServiceEntry{serviceId='calc', description='null', ip='192.168.124.16', port=9527, weight=0}]}
[INFO] [2021-10-05 17:05:53.753] [nioEventLoopGroup-2-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] 获取结果信息，seqId: 4c8455ae4f574478bf78772024608bc2, rpcResponse: DefaultRpcResponse{seqId='4c8455ae4f574478bf78772024608bc2', error=null, result=[DefaultServiceEntry{serviceId='calc', description='null', ip='192.168.124.16', port=9527, weight=0}]}
[INFO] [2021-10-05 17:05:53.753] [nioEventLoopGroup-2-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:4c8455ae4f574478bf78772024608bc2 信息已经放入，通知所有等待方
[INFO] [2021-10-05 17:05:53.755] [nioEventLoopGroup-2-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:4c8455ae4f574478bf78772024608bc2 remove from request map
[INFO] [2021-10-05 17:05:53.755] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq 4c8455ae4f574478bf78772024608bc2 对应结果已经获取: DefaultRpcResponse{seqId='4c8455ae4f574478bf78772024608bc2', error=null, result=[DefaultServiceEntry{serviceId='calc', description='null', ip='192.168.124.16', port=9527, weight=0}]}
[INFO] [2021-10-05 17:05:53.759] [main] [c.g.h.r.c.c.r.i.DefaultReferenceConfig.getRpcAddresses] - [Client] register center serviceEntries: [DefaultServiceEntry{serviceId='calc', description='null', ip='192.168.124.16', port=9527, weight=0}]

[INFO] [2021-10-05 17:05:53.761] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 开始启动客户端
[INFO] [2021-10-05 17:05:53.773] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 启动客户端完成，监听地址 192.168.124.16:9527
[INFO] [2021-10-05 17:05:53.785] [main] [c.g.h.r.c.p.ReferenceProxy.invoke] - [Client] start call remote with request: DefaultRpcRequest{seqId='81a4687bce6d41bebf79fd3b292d934c', createTime=1633424753779, serviceId='calc', methodName='sum', paramTypeNames=[com.github.houbb.rpc.server.facade.model.CalculateRequest], paramValues=[CalculateRequest{one=10, two=20}]}
[INFO] [2021-10-05 17:05:53.785] [main] [c.g.h.r.c.i.i.DefaultInvokeService.addRequest] - [Client] start add request for seqId: 81a4687bce6d41bebf79fd3b292d934c, timeoutMills: 60000
[INFO] [2021-10-05 17:05:53.813] [main] [c.g.h.r.c.p.ReferenceProxy.invoke] - [Client] start call channel id: 00e04cfffe360988-000031fc-00000001-36c33ae099fbc46b-7fefae5a
[INFO] [2021-10-05 17:05:53.825] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq 81a4687bce6d41bebf79fd3b292d934c 对应结果为空，进入等待
[INFO] [2021-10-05 17:05:53.851] [nioEventLoopGroup-4-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] 获取结果信息，seqId: 81a4687bce6d41bebf79fd3b292d934c, rpcResponse: DefaultRpcResponse{seqId='81a4687bce6d41bebf79fd3b292d934c', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2021-10-05 17:05:53.851] [nioEventLoopGroup-4-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:81a4687bce6d41bebf79fd3b292d934c 信息已经放入，通知所有等待方
[INFO] [2021-10-05 17:05:53.852] [nioEventLoopGroup-4-1] [c.g.h.r.c.i.i.DefaultInvokeService.addResponse] - [Client] seqId:81a4687bce6d41bebf79fd3b292d934c remove from request map
[INFO] [2021-10-05 17:05:53.852] [nioEventLoopGroup-4-1] [c.g.h.r.c.h.RpcClientHandler.channelRead0] - [Client] response is :DefaultRpcResponse{seqId='81a4687bce6d41bebf79fd3b292d934c', error=null, result=CalculateResponse{success=true, sum=30}}
[INFO] [2021-10-05 17:05:53.855] [main] [c.g.h.r.c.i.i.DefaultInvokeService.getResponse] - [Client] seq 81a4687bce6d41bebf79fd3b292d934c 对应结果已经获取: DefaultRpcResponse{seqId='81a4687bce6d41bebf79fd3b292d934c', error=null, result=CalculateResponse{success=true, sum=30}}
响应结果：CalculateResponse{success=true, sum=30}
```

客户端主要分为两个部分：

（1）去注册中心查询对应的服务端地址

（2）根据服务端地址，创建对应的客户端请求代理

# 不足之处

（1）服务端关闭之后，没有调用 unRegister 方法。

（2）客户端关闭之后，没有调用 unSubscribe 方法。

（3）缺少心跳机制，服务器挂掉无法及时感知。

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

我是老马，期待与你的下次重逢。

* any list
{:toc}