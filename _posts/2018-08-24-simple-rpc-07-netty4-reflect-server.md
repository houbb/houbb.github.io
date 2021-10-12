---
layout: post
title: java 从零开始手写 RPC (05) reflect 反射实现通用调用之服务端
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

前面我们的例子是一个固定的出参和入参，固定的方法实现。

本节将实现通用的调用，让框架具有更广泛的实用性。

## 基本思路

说到 java 进阶内容，不得不提反射。

关于反射，你知道多少？

平时使用时，又记得多少呢？

以下内容较长，是主要是对反射的一些应用。建议收藏起来吃灰~

# 服务端

## 核心类

- RpcServer

调整如下:

```java
serverBootstrap.group(workerGroup, bossGroup)
    .channel(NioServerSocketChannel.class)
    // 打印日志
    .handler(new LoggingHandler(LogLevel.INFO))
    .childHandler(new ChannelInitializer<Channel>() {
        @Override
        protected void initChannel(Channel ch) throws Exception {
            ch.pipeline()
            // 解码 bytes=>resp
            .addLast(new ObjectDecoder(Integer.MAX_VALUE, ClassResolvers.cacheDisabled(null)))
             // request=>bytes
             .addLast(new ObjectEncoder())
             .addLast(new RpcServerHandler());
        }
    })
    // 这个参数影响的是还没有被accept 取出的连接
    .option(ChannelOption.SO_BACKLOG, 128)
    // 这个参数只是过一段时间内客户端没有响应，服务端会发送一个 ack 包，以判断客户端是否还活着。
    .childOption(ChannelOption.SO_KEEPALIVE, true);
```

其中 ObjectDecoder 和 ObjectEncoder 都是 netty 内置的实现。

## RpcServerHandler

```java
package com.github.houbb.rpc.server.handler;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.common.rpc.domain.RpcRequest;
import com.github.houbb.rpc.common.rpc.domain.impl.DefaultRpcResponse;
import com.github.houbb.rpc.server.service.impl.DefaultServiceFactory;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class RpcServerHandler extends SimpleChannelInboundHandler {

    private static final Log log = LogFactory.getLog(RpcServerHandler.class);

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        final String id = ctx.channel().id().asLongText();
        log.info("[Server] channel {} connected " + id);
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        final String id = ctx.channel().id().asLongText();
        log.info("[Server] channel read start: {}", id);

        // 接受客户端请求
        RpcRequest rpcRequest = (RpcRequest)msg;
        log.info("[Server] receive channel {} request: {}", id, rpcRequest);

        // 回写到 client 端
        DefaultRpcResponse rpcResponse = handleRpcRequest(rpcRequest);
        ctx.writeAndFlush(rpcResponse);
        log.info("[Server] channel {} response {}", id, rpcResponse);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }

    /**
     * 处理请求信息
     * @param rpcRequest 请求信息
     * @return 结果信息
     * @since 0.0.6
     */
    private DefaultRpcResponse handleRpcRequest(final RpcRequest rpcRequest) {
        DefaultRpcResponse rpcResponse = new DefaultRpcResponse();
        rpcResponse.seqId(rpcRequest.seqId());

        try {
            // 获取对应的 service 实现类
            // rpcRequest=>invocationRequest
            // 执行 invoke
            Object result = DefaultServiceFactory.getInstance()
                    .invoke(rpcRequest.serviceId(),
                            rpcRequest.methodName(),
                            rpcRequest.paramTypeNames(),
                            rpcRequest.paramValues());
            rpcResponse.result(result);
        } catch (Exception e) {
            rpcResponse.error(e);
            log.error("[Server] execute meet ex for request", rpcRequest, e);
        }

        // 构建结果值
        return rpcResponse;
    }

}
```

和以前类似，不过 handleRpcRequest 要稍微麻烦一点。

这里需要根据发射，调用对应的方法。

## pojo 

其中使用的出参、入参实现如下：

### RpcRequest

```java
package com.github.houbb.rpc.common.rpc.domain;

import java.util.List;

/**
 * 序列化相关处理
 * （1）调用创建时间-createTime
 * （2）调用方式 callType
 * （3）超时时间 timeOut
 *
 * 额外信息：
 * （1）上下文信息
 *
 * @author binbin.hou
 * @since 0.0.6
 */
public interface RpcRequest extends BaseRpc {

    /**
     * 创建时间
     * @return 创建时间
     * @since 0.0.6
     */
    long createTime();

    /**
     * 服务唯一标识
     * @return 服务唯一标识
     * @since 0.0.6
     */
    String serviceId();

    /**
     * 方法名称
     * @return 方法名称
     * @since 0.0.6
     */
    String methodName();

    /**
     * 方法类型名称列表
     * @return 名称列表
     * @since 0.0.6
     */
    List<String> paramTypeNames();

    // 调用参数信息列表

    /**
     * 调用参数值
     * @return 参数值数组
     * @since 0.0.6
     */
    Object[] paramValues();

}
```

### RpcResponse

```java
package com.github.houbb.rpc.common.rpc.domain;

/**
 * 序列化相关处理
 * @author binbin.hou
 * @since 0.0.6
 */
public interface RpcResponse extends BaseRpc {

    /**
     * 异常信息
     * @return 异常信息
     * @since 0.0.6
     */
    Throwable error();

    /**
     * 请求结果
     * @return 请求结果
     * @since 0.0.6
     */
    Object result();

}
```

### BaseRpc

```java
package com.github.houbb.rpc.common.rpc.domain;

import java.io.Serializable;

/**
 * 序列化相关处理
 * @author binbin.hou
 * @since 0.0.6
 */
public interface BaseRpc extends Serializable {

    /**
     * 获取唯一标识号
     * （1）用来唯一标识一次调用，便于获取该调用对应的响应信息。
     * @return 唯一标识号
     */
    String seqId();

    /**
     * 设置唯一标识号
     * @param traceId 唯一标识号
     * @return this
     */
    BaseRpc seqId(final String traceId);

}
```

## ServiceFactory-服务工厂

为了便于对所有的 service 实现类统一管理，这里定义 service 工厂类。

### ServiceFactory

```java
package com.github.houbb.rpc.server.service;

import com.github.houbb.rpc.server.config.service.ServiceConfig;
import com.github.houbb.rpc.server.registry.ServiceRegistry;

import java.util.List;

/**
 * 服务方法类仓库管理类-接口
 *
 *
 * （1）对外暴露的方法，应该尽可能的少。
 * （2）对于外部的调用，后期比如 telnet 治理，可以使用比如有哪些服务列表？
 * 单个服务有哪些方法名称？
 *
 * 等等基础信息的查询，本期暂时全部隐藏掉。
 *
 * （3）前期尽可能的少暴露方法。
 * @author binbin.hou
 * @since 0.0.6
 * @see ServiceRegistry 服务注册，将服务信息放在这个类中，进行统一的管理。
 * @see ServiceMethod 方法信息
 */
public interface ServiceFactory {

    /**
     * 注册服务列表信息
     * @param serviceConfigList 服务配置列表
     * @return this
     * @since 0.0.6
     */
    ServiceFactory registerServices(final List<ServiceConfig> serviceConfigList);

    /**
     * 直接反射调用
     * （1）此处对于方法反射，为了提升性能，所有的 class.getFullName() 进行拼接然后放进 key 中。
     *
     * @param serviceId 服务名称
     * @param methodName 方法名称
     * @param paramTypeNames 参数类型名称列表
     * @param paramValues 参数值
     * @return 方法调用返回值
     * @since 0.0.6
     */
    Object invoke(final String serviceId, final String methodName,
                  List<String> paramTypeNames, final Object[] paramValues);

}
```

### DefaultServiceFactory

作为默认实现，如下：

```java
package com.github.houbb.rpc.server.service.impl;

import com.github.houbb.heaven.constant.PunctuationConst;
import com.github.houbb.heaven.util.common.ArgUtil;
import com.github.houbb.heaven.util.lang.reflect.ReflectMethodUtil;
import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.rpc.common.exception.RpcRuntimeException;
import com.github.houbb.rpc.server.config.service.ServiceConfig;
import com.github.houbb.rpc.server.service.ServiceFactory;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 默认服务仓库实现
 * @author binbin.hou
 * @since 0.0.6
 */
public class DefaultServiceFactory implements ServiceFactory {

    /**
     * 服务 map
     * @since 0.0.6
     */
    private Map<String, Object> serviceMap;

    /**
     * 直接获取对应的 method 信息
     * （1）key: serviceId:methodName:param1@param2@param3
     * （2）value: 对应的 method 信息
     */
    private Map<String, Method> methodMap;

    private static final DefaultServiceFactory INSTANCE = new DefaultServiceFactory();

    private DefaultServiceFactory(){}

    public static DefaultServiceFactory getInstance() {
        return INSTANCE;
    }

    /**
     * 服务注册一般在项目启动的时候，进行处理。
     * 属于比较重的操作，而且一个服务按理说只应该初始化一次。
     * 此处加锁为了保证线程安全。
     * @param serviceConfigList 服务配置列表
     * @return this
     */
    @Override
    public synchronized ServiceFactory registerServices(List<ServiceConfig> serviceConfigList) {
        ArgUtil.notEmpty(serviceConfigList, "serviceConfigList");

        // 集合初始化
        serviceMap = new HashMap<>(serviceConfigList.size());
        // 这里只是预估，一般为2个服务。
        methodMap = new HashMap<>(serviceConfigList.size()*2);

        for(ServiceConfig serviceConfig : serviceConfigList) {
            serviceMap.put(serviceConfig.id(), serviceConfig.reference());
        }

        // 存放方法名称
        for(Map.Entry<String, Object> entry : serviceMap.entrySet()) {
            String serviceId = entry.getKey();
            Object reference = entry.getValue();

            //获取所有方法列表
            Method[] methods = reference.getClass().getMethods();
            for(Method method : methods) {
                String methodName = method.getName();
                if(ReflectMethodUtil.isIgnoreMethod(methodName)) {
                    continue;
                }

                List<String> paramTypeNames = ReflectMethodUtil.getParamTypeNames(method);
                String key = buildMethodKey(serviceId, methodName, paramTypeNames);
                methodMap.put(key, method);
            }
        }

        return this;
    }


    @Override
    public Object invoke(String serviceId, String methodName, List<String> paramTypeNames, Object[] paramValues) {
        //参数校验
        ArgUtil.notEmpty(serviceId, "serviceId");
        ArgUtil.notEmpty(methodName, "methodName");

        // 提供 cache，可以根据前三个值快速定位对应的 method
        // 根据 method 进行反射处理。
        // 对于 paramTypes 进行 string 连接处理。
        final Object reference = serviceMap.get(serviceId);
        final String methodKey = buildMethodKey(serviceId, methodName, paramTypeNames);
        final Method method = methodMap.get(methodKey);

        try {
            return method.invoke(reference, paramValues);
        } catch (IllegalAccessException | InvocationTargetException e) {
            throw new RpcRuntimeException(e);
        }
    }

    /**
     * （1）多个之间才用 : 分隔
     * （2）参数之间采用 @ 分隔
     * @param serviceId 服务标识
     * @param methodName 方法名称
     * @param paramTypeNames 参数类型名称
     * @return 构建完整的 key
     * @since 0.0.6
     */
    private String buildMethodKey(String serviceId, String methodName, List<String> paramTypeNames) {
        String param = CollectionUtil.join(paramTypeNames, PunctuationConst.AT);
        return serviceId+PunctuationConst.COLON+methodName+PunctuationConst.COLON
                +param;
    }

}
```

## ServiceRegistry-服务注册类

### 接口

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

    /**
     * 暴露的 rpc 服务端口信息
     * @param port 端口信息
     * @return this
     * @since 0.0.6
     */
    ServiceRegistry port(final int port);

    /**
     * 注册服务实现
     * @param serviceId 服务标识
     * @param serviceImpl 服务实现
     * @return this
     * @since 0.0.6
     */
    ServiceRegistry register(final String serviceId, final Object serviceImpl);

    /**
     * 暴露所有服务信息
     * （1）启动服务端
     * @return this
     * @since 0.0.6
     */
    ServiceRegistry expose();

}
```

### 实现

```java
package com.github.houbb.rpc.server.registry.impl;

import com.github.houbb.heaven.util.common.ArgUtil;
import com.github.houbb.rpc.common.config.protocol.ProtocolConfig;
import com.github.houbb.rpc.server.config.service.DefaultServiceConfig;
import com.github.houbb.rpc.server.config.service.ServiceConfig;
import com.github.houbb.rpc.server.core.RpcServer;
import com.github.houbb.rpc.server.registry.ServiceRegistry;
import com.github.houbb.rpc.server.service.impl.DefaultServiceFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * 默认服务端注册类
 * @author binbin.hou
 * @since 0.0.6
 */
public class DefaultServiceRegistry implements ServiceRegistry {

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

    private DefaultServiceRegistry(){
        // 初始化默认参数
        this.serviceConfigList = new ArrayList<>();
        this.rpcPort = 9527;
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
        serviceConfig.id(serviceId).reference(serviceImpl);
        serviceConfigList.add(serviceConfig);

        return this;
    }

    @Override
    public ServiceRegistry expose() {
        // 注册所有服务信息
        DefaultServiceFactory.getInstance()
                .registerServices(serviceConfigList);

        // 暴露 netty server 信息
        new RpcServer(rpcPort).start();
        return this;
    }

}
```

ServiceConfig 是一些服务的配置信息，接口定义如下：

```java
package com.github.houbb.rpc.server.config.service;

/**
 * 单个服务配置类
 *
 * 简化用户使用：
 * 在用户使用的时候，这个类应该是不可见的。
 * 直接提供对应的服务注册类即可。
 *
 * 后续拓展
 * （1）版本信息
 * （2）服务端超时时间
 *
 * @author binbin.hou
 * @since 0.0.6
 * @param <T> 实现类泛型
 */
public interface ServiceConfig<T> {

    /**
     * 获取唯一标识
     * @return 获取唯一标识
     * @since 0.0.6
     */
    String id();

    /**
     * 设置唯一标识
     * @param id 标识信息
     * @return this
     * @since 0.0.6
     */
    ServiceConfig<T> id(String id);

    /**
     * 获取引用实体实现
     * @return 实体实现
     * @since 0.0.6
     */
    T reference();

    /**
     * 设置引用实体实现
     * @param reference 引用实现
     * @return this
     * @since 0.0.6
     */
    ServiceConfig<T> reference(T reference);

}
```

# 测试

## maven 引入

引入服务端的对应 maven 包：

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>rpc-server</artifactId>
    <version>0.0.6</version>
</dependency>
```

## 服务端启动

```java
// 启动服务
DefaultServiceRegistry.getInstance()
        .register(ServiceIdConst.CALC, new CalculatorServiceImpl())
        .expose();
```

这里注册了一个计算服务，并且设置对应的实现。

和以前实现类似，此处不再赘述。

启动日志：

```
[DEBUG] [2021-10-05 13:39:42.638] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2021-10-05 13:39:42.645] [Thread-0] [c.g.h.r.s.c.RpcServer.run] - RPC 服务开始启动服务端
十月 05, 2021 1:39:43 下午 io.netty.handler.logging.LoggingHandler channelRegistered
信息: [id: 0xec4dc74f] REGISTERED
十月 05, 2021 1:39:43 下午 io.netty.handler.logging.LoggingHandler bind
信息: [id: 0xec4dc74f] BIND: 0.0.0.0/0.0.0.0:9527
十月 05, 2021 1:39:43 下午 io.netty.handler.logging.LoggingHandler channelActive
信息: [id: 0xec4dc74f, L:/0:0:0:0:0:0:0:0:9527] ACTIVE
[INFO] [2021-10-05 13:39:43.893] [Thread-0] [c.g.h.r.s.c.RpcServer.run] - RPC 服务端启动完成，监听【9527】端口
```

ps: 写到这里忽然发现忘记添加对应的 register 日志了，这里可以添加对应的 registerListener 拓展。

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

* any list
{:toc}