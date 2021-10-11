---
layout: post
title: 基于 netty4 手写 rpc-13-callType 调用方式
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# callType 调用方式

## 说明

不同的场景我们会希望有不同的调用方式。

常见的有三种调用方式：

（1）sync 同步调用

（2）async 异步调用

（3）oneWay 单向调用

个人感觉（1）（3）是最常见的需求，所以本次优先实现了这两种。

## 实现思路

不同的调用方式只是处理的行为不同而已。

可以将这个配置传递，分别在 client/server 的端进行相应的处理。

# callType 调用方式

## 接口定义

```java
package com.github.houbb.rpc.client.support.calltype;

import com.github.houbb.rpc.client.proxy.ProxyContext;
import com.github.houbb.rpc.common.rpc.domain.RpcRequest;

/**
 * 调用方式上下文
 * @author binbin.hou
 * @since 0.1.0
 */
public interface CallTypeStrategy {

    /**
     * 获取结果
     * @param proxyContext 代理上下文
     * @param rpcRequest 请求信息
     * @return 结果
     * @since 0.1.0
     */
    Object result(final ProxyContext proxyContext,
                  final RpcRequest rpcRequest);

}
```

## oneway 实现

oneway 的实现非常简单，发起之后不关心响应结果。

一般是不重要的，追求性能的场景使用，比如日志通知。

```java
package com.github.houbb.rpc.client.support.calltype.impl;

import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.client.proxy.ProxyContext;
import com.github.houbb.rpc.client.support.calltype.CallTypeStrategy;
import com.github.houbb.rpc.common.rpc.domain.RpcRequest;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;
import com.github.houbb.rpc.common.rpc.domain.impl.RpcResponses;

/**
 * one way 调用服务实现类
 *
 * @author binbin.hou
 * @since 0.1.0
 */
@ThreadSafe
class OneWayCallTypeStrategy implements CallTypeStrategy {

    private static final Log LOG = LogFactory.getLog(OneWayCallTypeStrategy.class);

    /**
     * 实例
     *
     * @since 0.1.0
     */
    private static final CallTypeStrategy INSTANCE = new OneWayCallTypeStrategy();

    /**
     * 获取实例
     *
     * @since 0.1.0
     */
    public static CallTypeStrategy getInstance() {
        return INSTANCE;
    }

    @Override
    public Object result(ProxyContext proxyContext, RpcRequest rpcRequest) {
        final String seqId = rpcRequest.seqId();

        // 结果可以不是简单的 null，而是根据 result 类型处理，避免基本类型NPE。
        RpcResponse rpcResponse = RpcResponses.result(null, rpcRequest.returnType());
        LOG.info("[Client] call type is one way, seqId: {} set response to {}", seqId, rpcResponse);

        // 获取结果
        return RpcResponses.getResult(rpcResponse);
    }

}
```

## sync 同步获取结果

这个也是默认的策略。

```java
package com.github.houbb.rpc.client.support.calltype.impl;

import com.github.houbb.heaven.annotation.ThreadSafe;
import com.github.houbb.rpc.client.proxy.ProxyContext;
import com.github.houbb.rpc.client.support.calltype.CallTypeStrategy;
import com.github.houbb.rpc.common.rpc.domain.RpcRequest;
import com.github.houbb.rpc.common.rpc.domain.RpcResponse;
import com.github.houbb.rpc.common.rpc.domain.impl.RpcResponses;

/**
 * 同步调用服务实现类
 * @author binbin.hou
 * @since 0.1.0
 */
@ThreadSafe
class SyncCallTypeStrategy implements CallTypeStrategy {

    /**
     * 实例
     * @since 0.1.0
     */
    private static final CallTypeStrategy INSTANCE = new SyncCallTypeStrategy();

    /**
     * 获取实例
     * @since 0.1.0
     */
    public static CallTypeStrategy getInstance(){
        return INSTANCE;
    }

    @Override
    public Object result(ProxyContext proxyContext, RpcRequest rpcRequest) {
        final String seqId = rpcRequest.seqId();
        RpcResponse rpcResponse = proxyContext.invokeService().getResponse(seqId);
        return RpcResponses.getResult(rpcResponse);
    }

}
```

# 策略工厂类 CallTypeStrategyFactory

为了让其使用更加方便，我们定义一下 CallTypeStrategyFactory。

## 实现

```java
package com.github.houbb.rpc.client.support.calltype.impl;

import com.github.houbb.rpc.client.constant.enums.CallTypeEnum;
import com.github.houbb.rpc.client.support.calltype.CallTypeStrategy;

/**
 * callType 策略工厂类
 * @author binbin.hou
 * @since 0.1.0
 */
public final class CallTypeStrategyFactory  {

    private CallTypeStrategyFactory(){}

    /**
     * 获取调用策略
     * @param callTypeEnum 调用类型枚举
     * @return 调用策略实现
     * @since 0.1.0
     */
    public static CallTypeStrategy callTypeStrategy(final CallTypeEnum callTypeEnum) {
        switch (callTypeEnum) {
            case SYNC:
                return SyncCallTypeStrategy.getInstance();
            case ONE_WAY:
                return OneWayCallTypeStrategy.getInstance();
            default:
                throw new UnsupportedOperationException("Not support call type : " + callTypeEnum);
        }
    }

}
```

## 枚举

这里定义了我们内置的枚举类：

```java
package com.github.houbb.rpc.client.constant.enums;

/**
 * 调用方式枚举
 * （1）调用方式，是一种非常固定的模式。所以使用枚举代替常量。
 * （2）在 api 中使用常量，避免二者产生依赖。
 * @author binbin.hou
 * @since 0.1.0
 */
public enum CallTypeEnum {

    /**
     * 单向调用：不关心调用的结果
     * @since 0.1.0
     */
    ONE_WAY(1),

    /**
     * 同步调用：最常用的调用方式，关心结果
     * @since 0.1.0
     */
    SYNC(2),

    /**
     * 异步调用：性能更高的调用方式，异步获取结果
     * @since 0.1.0
     */
    ASYNC(3),

    /**
     * 回调方式：通过 callback 处理结果信息
     * @since 0.1.0
     */
    CALLBACK(4),
    ;

    //toString 
}
```

# 客户端

客户端的实现调整也比较简单：

```java
/**
 * @author binbin.hou
 * @since 0.0.6
 */
public class DefaultReferenceProxy<T> implements ReferenceProxy<T> {

    // 不变

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
        // 不变

        // 获取结果
        CallTypeStrategy callTypeStrategy = CallTypeStrategyFactory.callTypeStrategy(callType);
        return callTypeStrategy.result(proxyContext, rpcRequest);
    }

    // 不变
}
```

# 测试代码

## 注册中心

启动注册中心：

```
[INFO] [2021-10-05 17:47:55.090] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] 启动完成，监听【8527】端口
```

## 服务端

启动服务端：

```
[INFO] [2021-10-05 17:48:14.706] [pool-1-thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.run] - [Netty Server] 启动完成，监听【9527】端口
[INFO] [2021-10-05 17:48:14.715] [main] [c.g.h.r.c.r.n.i.DefaultNettyClient.call] - [Netty Client] 启动客户端完成，监听地址 127.0.0.1:8527
```

## 客户端

### sync

默认就是同步策略，此处不再赘述。

### oneway

```java
public static void main(String[] args) {
    // 服务配置信息
    ReferenceConfig<CalculatorService> config = ClientBs.newInstance();
    config.serviceId(ServiceIdConst.CALC);
    config.serviceInterface(CalculatorService.class);
    // 自动发现服务
    config.subscribe(true);
    config.registerCenter(ServiceIdConst.REGISTER_CENTER);
    config.callType(CallTypeEnum.ONE_WAY);

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

这里指定 callType 为 oneway，所有的结果都是 null。

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

我是老马，期待与你的下次重逢。

* any list
{:toc}