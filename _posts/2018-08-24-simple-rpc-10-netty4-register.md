---
layout: post
title: 基于 netty4 手写 rpc-10-register center 注册中心
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# register 注册中心

## 需求

服务的注册与发现，是一个很常见也很有用的需求。

可以让我们不关心服务端的 ip 信息，只关心服务本身。

# 思路

## 实现的方式

SimpleRpcRegister 为 rpc 提供的默认实现方案。

实际可以结合 redis，zk 等常见的成熟框架实现。

其实可以把 register 当做是服务端，此时的 server/client 都是客户端。

实现的策略时类似的。

当然也可以直接使用 zk 等成熟的框架，只是个人觉得这样不利于学习，而且 zk 太重了。

## 流程

- 启动注册中心

首先启动注册中心

- 启动服务端

服务端启动时，将注册信息注册到注册中心。

- 启动客户端

客户端启动的时候，去注册中心读取配置。

# Register-注册中心

## 引导类

```java
package com.github.houbb.rpc.register.api.config.impl;

import com.github.houbb.heaven.util.common.ArgUtil;
import com.github.houbb.rpc.common.remote.netty.handler.ChannelHandlers;
import com.github.houbb.rpc.common.remote.netty.impl.DefaultNettyServer;
import com.github.houbb.rpc.register.api.config.RegisterConfig;
import com.github.houbb.rpc.register.simple.handler.RegisterCenterServerHandler;
import io.netty.channel.ChannelHandler;

/**
 * 默认注册中心配置
 * @author binbin.hou
 * @since 0.0.8
 */
public class RegisterBs implements RegisterConfig {

    /**
     * 服务启动端口信息
     * @since 0.0.8
     */
    private int port;

    private RegisterBs(){}

    public static RegisterBs newInstance() {
        RegisterBs registerBs = new RegisterBs();
        registerBs.port(8527);
        return registerBs;
    }

    @Override
    public RegisterBs port(int port) {
        ArgUtil.notNegative(port, "port");

        this.port = port;
        return this;
    }

    @Override
    public RegisterBs start() {
        ChannelHandler channelHandler = ChannelHandlers.objectCodecHandler(new RegisterCenterServerHandler());
        DefaultNettyServer.newInstance(port, channelHandler).asyncRun();

        return this;
    }

}
```

指定一下 register 的 port，就可以启动了。

## RegisterCenterServerHandler

这里是注册中心的核心实现类。

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * rpc All rights reserved.
 */

package com.github.houbb.rpc.register.simple.handler;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.register.domain.entry.ServiceEntry;
import com.github.houbb.rpc.register.domain.message.RegisterMessage;
import com.github.houbb.rpc.register.domain.message.impl.RegisterMessages;
import com.github.houbb.rpc.register.simple.SimpleRpcRegister;
import com.github.houbb.rpc.register.simple.client.ClientRegisterService;
import com.github.houbb.rpc.register.simple.client.impl.DefaultClientRegisterService;
import com.github.houbb.rpc.register.simple.constant.MessageTypeConst;
import com.github.houbb.rpc.register.simple.server.ServerRegisterService;
import com.github.houbb.rpc.register.simple.server.impl.DefaultServerRegisterService;
import com.github.houbb.rpc.register.spi.RpcRegister;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

/**
 * <p> 注册中心服务器处理类 </p>
 *
 * <pre> Created: 2019/10/23 10:29 下午  </pre>
 * <pre> Project: rpc  </pre>
 * <p>
 * 请求的标准化：
 * （1）对于 server 的服务注册，client 的配置拉取。
 * 二者都是将 register 作为服务端。所以需要统一请求信息。
 * （2）对于 server 的注册，不需要提供对应的反馈信息
 * （3）当配置发生变化时，需要及时通知所有的 client 端。
 * 这里就需要知道哪些是客户端？？
 *
 * @author houbinbin
 * @since 0.0.8
 */
@ChannelHandler.Sharable
public class RegisterCenterServerHandler extends SimpleChannelInboundHandler {

    private static final Log LOG = LogFactory.getLog(RegisterCenterServerHandler.class);

    /**
     * 注册中心服务
     * @since 0.0.8
     */
    private final RpcRegister rpcRegister;

    public RegisterCenterServerHandler() {
        this.rpcRegister = this.buildSimpleRpcRegister();
    }

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        final String id = ctx.channel().id().asLongText();
        LOG.info("[Register Server] channel {} connected " + id);
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        RegisterMessage registerMessage = (RegisterMessage) msg;
        Object body = registerMessage.body();
        int type = RegisterMessages.type(registerMessage);
        String seqId = registerMessage.seqId();
        LOG.info("[Register Server] received message type: {}, seqId: {} ", type,
                seqId);

        final Channel channel = ctx.channel();
        ServiceEntry serviceEntry = (ServiceEntry)body;

        switch (type) {
            case MessageTypeConst.SERVER_REGISTER:
                rpcRegister.register(serviceEntry);
                break;

            case MessageTypeConst.SERVER_UN_REGISTER:
                rpcRegister.unRegister(serviceEntry);
                break;

            case MessageTypeConst.CLIENT_SUBSCRIBE:
                rpcRegister.subscribe(serviceEntry, channel);
                break;

            case MessageTypeConst.CLIENT_UN_SUBSCRIBE:
                rpcRegister.unSubscribe(serviceEntry, channel);
                break;

            case MessageTypeConst.CLIENT_LOOK_UP:
                rpcRegister.lookUp(seqId, serviceEntry, channel);
                break;

            default:
                LOG.warn("[Register Center] not support type: {} and seqId: {}",
                        type, seqId);
        }

    }

    /**
     * 构建简单注册实现类
     * @return 注册实现
     * @since 0.0.8
     */
    private RpcRegister buildSimpleRpcRegister() {
        final ServerRegisterService serverRegisterService = new DefaultServerRegisterService();
        final ClientRegisterService clientRegisterService = new DefaultClientRegisterService();
        return new SimpleRpcRegister(serverRegisterService, clientRegisterService);
    }


}
```

这里主要区分几种常见的实现，分别调用 RpcRegister 中对应的方法。

## RpcRegister

### 接口

常见的方法定义。

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * rpc All rights reserved.
 */

package com.github.houbb.rpc.register.spi;


import com.github.houbb.rpc.register.domain.entry.ServiceEntry;
import io.netty.channel.Channel;

/**
 * <p> 注册中心接口 </p>
 *
 * <pre> Created: 2019/10/23 8:01 下午  </pre>
 * <pre> Project: rpc  </pre>
 *
 * @author houbinbin
 * @since 0.0.8
 */
public interface RpcRegister {

    /**
     * 注册当前服务信息
     * 订阅了这个 serviceId 的所有客户端
     * @param serviceEntry 注册当前服务信息
     * @since 0.0.8
     */
    void register(final ServiceEntry serviceEntry);

    /**
     * 注销当前服务信息
     * @param serviceEntry 注册当前服务信息
     * @since 0.0.8
     */
    void unRegister(final ServiceEntry serviceEntry);

    /**
     * 监听服务信息
     * （1）监听之后，如果有任何相关的机器信息发生变化，则进行推送。
     * （2）内置的信息，需要传送 ip 信息到注册中心。
     *
     * @param serviceEntry 客户端明细信息
     * @param channel 频道信息
     * @since 0.0.8
     */
    void subscribe(final ServiceEntry serviceEntry, final Channel channel);

    /**
     * 取消监听服务信息
     *
     * （1）将改服务从客户端的监听列表中移除即可。
     *
     * @param server 客户端明细信息
     * @param channel 频道信息
     * @since 0.0.8
     */
    void unSubscribe(final ServiceEntry server, final Channel channel);

    /**
     * 启动时查询 serviceId 对应的所有服务端信息
     * @param seqId 请求标识
     * @param clientEntry 客户端查询明细
     * @param channel 频道信息
     * @since 0.0.8
     */
    void lookUp(String seqId, ServiceEntry clientEntry, final Channel channel);

}
```

### SimpleRpcRegister

简单的实现。

主要分为两大块：

（1）客户端指定监听的服务

（2）服务端变更时，通知监听的客户端

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * rpc All rights reserved.
 */

package com.github.houbb.rpc.register.simple;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;
import com.github.houbb.rpc.common.rpc.domain.impl.DefaultRpcResponse;
import com.github.houbb.rpc.register.domain.entry.ServiceEntry;
import com.github.houbb.rpc.register.simple.client.ClientRegisterService;
import com.github.houbb.rpc.register.simple.server.ServerRegisterService;
import com.github.houbb.rpc.register.simple.server.impl.DefaultServerRegisterService;
import com.github.houbb.rpc.register.spi.RpcRegister;
import io.netty.channel.Channel;

import java.util.List;

/**
 * <p> 简单的 rpc 注册 </p>
 *
 * <pre> Created: 2019/10/23 8:59 下午  </pre>
 * <pre> Project: rpc  </pre>
 *
 * （1）各种关系的关系服务类
 * （2）各种关系之间的通讯类
 * （3）domain 层
 *
 * @author houbinbin
 * @since 0.0.8
 */
public class SimpleRpcRegister implements RpcRegister {

    private static final Log LOG = LogFactory.getLog(DefaultServerRegisterService.class);

    /**
     * 服务端信息管理
     * @since 0.0.8
     */
    private final ServerRegisterService serverRegisterService;

    /**
     * 客户端信息管理
     * @since 0.0.8
     */
    private final ClientRegisterService clientRegisterService;

    public SimpleRpcRegister(ServerRegisterService serverRegisterService, ClientRegisterService clientRegisterService) {
        this.serverRegisterService = serverRegisterService;
        this.clientRegisterService = clientRegisterService;
    }

    @Override
    public void register(ServiceEntry serviceEntry) {
        List<ServiceEntry> serviceEntryList = serverRegisterService.register(serviceEntry);

        // 通知监听者
        clientRegisterService.notify(serviceEntry.serviceId(), serviceEntryList);
    }

    @Override
    public void unRegister(ServiceEntry serviceEntry) {
        List<ServiceEntry> serviceEntryList = serverRegisterService.unRegister(serviceEntry);

        // 通知监听者
        clientRegisterService.notify(serviceEntry.serviceId(), serviceEntryList);
    }

    @Override
    public void subscribe(ServiceEntry clientEntry, final Channel channel) {
        clientRegisterService.subscribe(clientEntry, channel);
    }

    @Override
    public void unSubscribe(ServiceEntry clientEntry, Channel channel) {
        clientRegisterService.unSubscribe(clientEntry, channel);
    }

    @Override
    public void lookUp(String seqId, ServiceEntry clientEntry, Channel channel) {
        final String serviceId = clientEntry.serviceId();
        List<ServiceEntry> serviceEntryList = serverRegisterService.lookUp(serviceId);

        // 回写
        // 为了复用原先的相应结果，此处直接使用 rpc response
        RpcResponse rpcResponse = DefaultRpcResponse.newInstance().seqId(seqId)
                .result(serviceEntryList);
        channel.writeAndFlush(rpcResponse);
    }


}
```

### ServerRegisterService

服务端的注册管理实现其实比较简单：

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * rpc All rights reserved.
 */

package com.github.houbb.rpc.register.simple.server.impl;

import com.github.houbb.heaven.util.common.ArgUtil;
import com.github.houbb.heaven.util.guava.Guavas;
import com.github.houbb.heaven.util.lang.ObjectUtil;
import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.register.domain.entry.ServiceEntry;
import com.github.houbb.rpc.register.simple.server.ServerRegisterService;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * <p> 默认服务注册类 </p>
 *
 * <pre> Created: 2019/10/23 9:16 下午  </pre>
 * <pre> Project: rpc  </pre>
 *
 * @author houbinbin
 * @since 0.0.8
 */
public class DefaultServerRegisterService implements ServerRegisterService {

    private static final Log LOG = LogFactory.getLog(DefaultServerRegisterService.class);

    /**
     * 存放对应的 map 信息
     * @since 0.0.8
     */
    private final Map<String, Set<ServiceEntry>> map;

    public DefaultServerRegisterService(){
        map = new ConcurrentHashMap<>();
    }

    @Override
    public List<ServiceEntry> register(ServiceEntry serviceEntry) {
        paramCheck(serviceEntry);

        final String serviceId = serviceEntry.serviceId();
        Set<ServiceEntry> serviceEntrySet = map.get(serviceId);
        if(ObjectUtil.isNull(serviceEntrySet)) {
            serviceEntrySet = Guavas.newHashSet();
        }

        LOG.info("[Register Server] add service: {}", serviceEntry);
        serviceEntrySet.add(serviceEntry);
        map.put(serviceId, serviceEntrySet);

        // 返回更新后的结果
        return Guavas.newArrayList(serviceEntrySet);
    }

    @Override
    public List<ServiceEntry> unRegister(ServiceEntry serviceEntry) {
        paramCheck(serviceEntry);

        final String serviceId = serviceEntry.serviceId();
        Set<ServiceEntry> serviceEntrySet = map.get(serviceId);

        if(CollectionUtil.isEmpty(serviceEntrySet)) {
            // 服务列表为空
            LOG.info("[Register Server] remove service set is empty. entry: {}", serviceEntry);
            return Guavas.newArrayList();
        }

        serviceEntrySet.remove(serviceEntry);
        LOG.info("[Register Server] remove service: {}", serviceEntry);
        map.put(serviceId, serviceEntrySet);

        // 返回更新后的结果
        return Guavas.newArrayList(serviceEntrySet);
    }

    @Override
    public List<ServiceEntry> lookUp(String serviceId) {
        ArgUtil.notEmpty(serviceId, "serviceId");

        LOG.info("[Register Server] start lookUp serviceId: {}", serviceId);
        Set<ServiceEntry> serviceEntrySet = map.get(serviceId);
        return Guavas.newArrayList(serviceEntrySet);
    }

    /**
     * 参数校验
     * @param serviceEntry 服务明细
     * @since 0.0.8
     */
    private void paramCheck(final ServiceEntry serviceEntry) {
        ArgUtil.notNull(serviceEntry, "serviceEntry");
        final String serviceId = serviceEntry.serviceId();
        ArgUtil.notEmpty(serviceId, "serviceId");
    }

}
```

### DefaultClientRegisterService

客户端对应的注册实现类，也是类似的。

```java
/*
 * Copyright (c)  2019. houbinbin Inc.
 * rpc All rights reserved.
 */

package com.github.houbb.rpc.register.simple.client.impl;

import com.github.houbb.heaven.util.common.ArgUtil;
import com.github.houbb.heaven.util.guava.Guavas;
import com.github.houbb.heaven.util.lang.ObjectUtil;
import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.register.domain.entry.ServiceEntry;
import com.github.houbb.rpc.register.domain.message.RegisterMessage;
import com.github.houbb.rpc.register.domain.message.impl.RegisterMessages;
import com.github.houbb.rpc.register.simple.client.ClientRegisterService;
import com.github.houbb.rpc.register.simple.constant.MessageTypeConst;
import io.netty.channel.Channel;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * <p> 默认客户端注册服务实现类 </p>
 *
 * <pre> Created: 2019/10/23 9:42 下午  </pre>
 * <pre> Project: rpc  </pre>
 *
 * @author houbinbin
 * @since 0.0.8
 */
public class DefaultClientRegisterService implements ClientRegisterService {

    private static final Log LOG = LogFactory.getLog(DefaultClientRegisterService.class);

    /**
     * 服务信息-客户端列表 map
     * key: serviceId
     * value: 对应的客户端列表信息。
     *
     * 客户端使用定期拉取的方式：
     * （1）传入 host 信息，返回对应的 service 列表。
     * （2）根据 service 列表，变化时定期推送给客户端。
     *
     * 只是在第一次采用拉取的方式，后面全部采用推送的方式。
     * （1）只有变更的时候，才会进行推送，保证实时性。
     * （2）客户端启动时拉取，作为保底措施。避免客户端不在线等情况。
     *
     * @since 0.0.8
     */
    private final Map<String, Set<Channel>> serviceClientChannelMap;

    public DefaultClientRegisterService() {
        this.serviceClientChannelMap = new ConcurrentHashMap<>();
    }

    @Override
    public void subscribe(ServiceEntry clientEntry, Channel clientChannel) {
        paramCheck(clientEntry);

        final String serviceId = clientEntry.serviceId();
        Set<Channel> channelSet = serviceClientChannelMap.get(serviceId);
        if (ObjectUtil.isNull(channelSet)) {
            channelSet = Guavas.newHashSet();
        }
        channelSet.add(clientChannel);
        serviceClientChannelMap.put(serviceId, channelSet);
    }

    @Override
    public void unSubscribe(ServiceEntry clientEntry, Channel clientChannel) {
        paramCheck(clientEntry);

        final String serviceId = clientEntry.serviceId();
        Set<Channel> channelSet = serviceClientChannelMap.get(serviceId);

        if (CollectionUtil.isEmpty(channelSet)) {
            // 服务列表为空
            LOG.info("[Register Client] remove host set is empty. entry: {}", clientEntry);
            return;
        }

        channelSet.remove(clientChannel);
        serviceClientChannelMap.put(serviceId, channelSet);
    }

    @Override
    public void notify(String serviceId, List<ServiceEntry> serviceEntryList) {
        ArgUtil.notEmpty(serviceId, "serviceId");

        List<Channel> clientChannelList = clientChannelList(serviceId);
        if (CollectionUtil.isEmpty(clientChannelList)) {
            LOG.info("[Register] notify clients is empty for service: {}",
                    serviceId);
            return;
        }

        // 循环通知
        for(Channel channel : clientChannelList) {
            RegisterMessage registerMessage = RegisterMessages.of(MessageTypeConst.REGISTER_NOTIFY, serviceEntryList);
            channel.writeAndFlush(registerMessage);
        }
    }

    /**
     * 参数校验
     *
     * @param serviceEntry 入参信息
     * @since 0.0.8
     */
    private void paramCheck(final ServiceEntry serviceEntry) {
        ArgUtil.notNull(serviceEntry, "serverEntry");
        ArgUtil.notEmpty(serviceEntry.serviceId(), "serverEntry.serviceId");
        ArgUtil.notEmpty(serviceEntry.ip(), "serverEntry.ip");
    }

    /**
     * 获取所有的客户端列表
     * @param serviceId 服务标识
     * @return 客户端列表标识
     * @since 0.0.8
     */
    private List<Channel> clientChannelList(String serviceId) {
        ArgUtil.notEmpty(serviceId, "serviceId");

        Set<Channel> clientSet = serviceClientChannelMap.get(serviceId);
        return Guavas.newArrayList(clientSet);
    }

}
```

内容较多，客户端与服务端调整放在下一期。

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

我是老马，期待与你的下次重逢。

* any list
{:toc}