---
layout: post
title: 基于 netty4 手写 rpc-16-gracefully shutdown 优雅关闭
date:  2018-08-24 16:23:15 +0800
categories: [Java]
tags: [java, dubbo, rpc, hand-write, netty, sf]
published: true
---

# 优雅摘除服务

## 说明

我觉得这可以说是 rpc 最需要的一个功能。

因为他的实际意义非常重大，就是可以任意时间发布应用，而对业务无损。

以前发布应用都要等到半夜，很累也容易出问题。

## 思路

结合 java 的 ShutdownHook 以及 linux 的 kill PID 来达到这个目的。

> [ShutdownHook 讲解](https://houbb.github.io/2019/10/30/java-shutdownhook)
>
### 服务提供方

停止时，先标记为不接收新请求，新请求过来时直接报错，让客户端重试其它机器。

然后，检测线程池中的线程是否正在运行，如果有，等待所有线程执行完成，除非超时，则强制关闭。

### 服务消费方

停止时，不再发起新的调用请求，所有新的调用在客户端即报错。

然后，检测有没有请求的响应还没有返回，等待响应返回，除非超时，则强制关闭。

# 代码实现

## 接口定义

```java
package com.github.houbb.rpc.common.support.hook;

/**
 * rpc 关闭 hook
 * （1）可以添加对应的 hook 管理类
 * @since 0.1.3
 */
public interface RpcShutdownHook {

    /**
     * 钩子函数实现
     * @since 0.1.3
     */
    void hook();

}
```

## 抽象实现

为了便于拓展，我们实现一个基本的抽象类。

```java
package com.github.houbb.rpc.common.support.hook;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

/**
 * rpc 关闭 hook
 * （1）可以添加对应的 hook 管理类
 *
 * @since 0.1.3
 */
public abstract class AbstractShutdownHook implements RpcShutdownHook {

    /**
     * AbstractShutdownHook logger
     */
    private static final Log LOG = LogFactory.getLog(AbstractShutdownHook.class);

    @Override
    public void hook() {
        LOG.info("[Shutdown Hook] start");
        this.doHook();
        LOG.info("[Shutdown Hook] end");
    }

    /**
     * 执行 hook 操作
     * @since 0.1.3
     */
    protected void doHook() {
        //do nothing
    }

}
```

## 默认实现

```java
package com.github.houbb.rpc.common.support.hook;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.rpc.common.support.invoke.InvokeManager;
import com.github.houbb.rpc.common.support.resource.ResourceManager;
import com.github.houbb.rpc.common.support.status.enums.StatusEnum;
import com.github.houbb.rpc.common.support.status.service.StatusManager;
import com.github.houbb.rpc.common.util.Waits;

/**
 * 默认的 hook 实现
 * <p> project: rpc-ClientShutdownHook </p>
 * <p> create on 2019/10/30 20:26 </p>
 *
 * @author Administrator
 * @since 0.1.3
 */
public class DefaultShutdownHook extends AbstractShutdownHook {

    /**
     * DefaultShutdownHook logger
     */
    private static final Log LOG = LogFactory.getLog(DefaultShutdownHook.class);

    /**
     * 状态管理类
     * @since 0.1.3
     */
    private final StatusManager statusManager;

    /**
     * 调用管理类
     * @since 0.1.3
     */
    private final InvokeManager invokeManager;

    /**
     * 资源管理类
     * @since 0.1.3
     */
    private final ResourceManager resourceManager;

    public DefaultShutdownHook(StatusManager statusManager, InvokeManager invokeManager, ResourceManager resourceManager) {
        this.statusManager = statusManager;
        this.invokeManager = invokeManager;
        this.resourceManager = resourceManager;
    }

    /**
     * （1）设置 status 状态为等待关闭
     * （2）查看是否 {@link InvokeManager#remainsRequest()} 是否包含请求
     * （3）超时检测-可以不添加，如果难以关闭成功，直接强制关闭即可。
     * （4）关闭所有线程池资源信息
     * （5）设置状态为成功关闭
     */
    @Override
    protected void doHook() {
        // 设置状态为等待关闭
        statusManager.status(StatusEnum.WAIT_SHUTDOWN.code());
        LOG.info("[Shutdown] set status to wait for shutdown.");

        // 循环等待当前执行的请求执行完成
        while (invokeManager.remainsRequest()) {
            LOG.info("[Shutdown] still remains request, wait for a while.");
            Waits.waits(10);
        }

        // 销毁所有资源
        LOG.info("[Shutdown] resourceManager start destroy all resources.");
        this.resourceManager.destroyAll();
        LOG.info("[Shutdown] resourceManager finish destroy all resources.");

        // 设置状态为关闭成功
        statusManager.status(StatusEnum.SHUTDOWN_SUCCESS.code());
        LOG.info("[Shutdown] set status to shutdown success.");
    }

}
```

StatusManager/invokeManager/resourceManager 用于对状态、调用、资源的统一管理。

# 服务端调整

添加钩子函数：

```java
/**
 * 默认服务端注册类
 *
 * @author binbin.hou
 * @since 0.0.6
 */
public class ServiceBs implements ServiceRegistry {

    // 不变

    /**
     * 状态管理类
     * @since 0.1.3
     */
    private StatusManager statusManager;

    /**
     * 资源管理类
     * @since 0.1.3
     */
    private ResourceManager resourceManager;

    /**
     * 调用管理类
     * @since 0.1.3
     */
    private InvokeManager invokeManager;

    private ServiceBs() {
        // 初始化默认参数
        this.serviceConfigList = new ArrayList<>();
        this.rpcPort = 9527;
        this.registerCenterList = Guavas.newArrayList();

        // manager 初始化
        this.statusManager = new DefaultStatusManager();
        this.resourceManager = new DefaultResourceManager();
        this.invokeManager = new DefaultInvokeManager();
    }

    // 不变

    @Override
    public ServiceRegistry expose() {
        // 不变

        // 4. 添加服务端钩子函数
        statusManager.status(StatusEnum.ENABLE.code());
        final RpcShutdownHook rpcShutdownHook = new DefaultShutdownHook(statusManager, invokeManager, resourceManager);
        ShutdownHooks.rpcShutdownHook(rpcShutdownHook);

        return this;
    }

    // 不变

}
```

# 客户端引导类

客户端添加对应的钩子函数。


```java
/**
 * 引用配置类
 *
 * @param <T> 接口泛型
 * @author binbin.hou
 * @since 0.0.6
 */
public class ClientBs<T> implements ReferenceConfig<T> {

    // 不变

    /**
     * 状态管理类
     * @since 0.1.3
     */
    private StatusManager statusManager;

    /**
     * 资源管理类
     * @since 0.1.3
     */
    private ResourceManager resourceManager;

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
        // 不变

        //4. 添加客户端钩子
        // 设置状态为可用
        proxyContext.statusManager().status(StatusEnum.ENABLE.code());
        final RpcShutdownHook rpcShutdownHook = new DefaultShutdownHook(statusManager, invokeManager, resourceManager);
        ShutdownHooks.rpcShutdownHook(rpcShutdownHook);

        return reference;
    }

    // 不变

}
```

# 测试代码

## 注册中心

正常启动

## 服务端

正常启动

## 客户端

正常启动

## shutdown 

- 客户端

```
[INFO] [2019-11-01 23:10:51.709] [Thread-1] [c.g.h.r.c.s.h.AbstractShutdownHook.hook] - [Shutdown Hook] start
[INFO] [2019-11-01 23:10:51.710] [Thread-1] [c.g.h.r.c.s.h.DefaultShutdownHook.doHook] - [Shutdown] set status to wait for shutdown.
[INFO] [2019-11-01 23:10:51.711] [Thread-1] [c.g.h.r.c.s.h.DefaultShutdownHook.doHook] - [Shutdown] resourceManager start destroy all resources.
[INFO] [2019-11-01 23:10:51.711] [Thread-1] [c.g.h.r.c.s.r.i.DefaultResourceManager.destroyAll] - [Resource] destroyableList.size(): 1
[INFO] [2019-11-01 23:10:51.712] [Thread-1] [c.g.h.r.c.s.r.i.DefaultResourceManager.destroyAll] - [Resource] destroy destroyable: com.github.houbb.rpc.common.remote.netty.impl.DefaultNettyClient@10736d9
[INFO] [2019-11-01 23:10:51.713] [Thread-1] [c.g.h.r.c.r.n.i.DefaultNettyClient.destroy] - [Netty Client] start close future.
[INFO] [2019-11-01 23:10:51.715] [Thread-1] [c.g.h.r.c.r.n.i.DefaultNettyClient.destroy] - [Netty Client] 关闭完成
[INFO] [2019-11-01 23:10:51.727] [Thread-1] [c.g.h.r.c.r.n.i.DefaultNettyClient.destroy] - [Netty Client] 线程池关闭完成
[INFO] [2019-11-01 23:10:51.728] [Thread-1] [c.g.h.r.c.s.r.i.DefaultResourceManager.destroyAll] - [Resource] clear destroyableList
[INFO] [2019-11-01 23:10:51.729] [Thread-1] [c.g.h.r.c.s.h.DefaultShutdownHook.doHook] - [Shutdown] resourceManager finish destroy all resources.
[INFO] [2019-11-01 23:10:51.729] [Thread-1] [c.g.h.r.c.s.h.DefaultShutdownHook.doHook] - [Shutdown] set status to shutdown success.
[INFO] [2019-11-01 23:10:51.730] [Thread-1] [c.g.h.r.c.s.h.AbstractShutdownHook.hook] - [Shutdown Hook] end
```

- 服务端

```
[INFO] [2019-11-01 23:11:11.433] [Thread-1] [c.g.h.r.c.s.h.AbstractShutdownHook.hook] - [Shutdown Hook] start
[INFO] [2019-11-01 23:11:11.434] [Thread-1] [c.g.h.r.c.s.h.DefaultShutdownHook.doHook] - [Shutdown] set status to wait for shutdown.
[INFO] [2019-11-01 23:11:11.435] [Thread-1] [c.g.h.r.c.s.h.DefaultShutdownHook.doHook] - [Shutdown] resourceManager start destroy all resources.
[INFO] [2019-11-01 23:11:11.436] [Thread-1] [c.g.h.r.c.s.r.i.DefaultResourceManager.destroyAll] - [Resource] destroyableList.size(): 2
[INFO] [2019-11-01 23:11:11.437] [Thread-1] [c.g.h.r.c.s.r.i.DefaultResourceManager.destroyAll] - [Resource] destroy destroyable: com.github.houbb.rpc.common.remote.netty.impl.DefaultNettyServer@2c41f4
[INFO] [2019-11-01 23:11:11.437] [Thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.destroy] - [Netty Server] 开始关闭
[INFO] [2019-11-01 23:11:11.439] [Thread-1] [c.g.h.r.c.r.n.i.DefaultNettyServer.destroy] - [Netty Server] 完成关闭
[INFO] [2019-11-01 23:11:11.469] [Thread-1] [c.g.h.r.c.s.r.i.DefaultResourceManager.destroyAll] - [Resource] destroy destroyable: com.github.houbb.rpc.common.remote.netty.impl.DefaultNettyClient@12cbfa
[INFO] [2019-11-01 23:11:11.470] [Thread-1] [c.g.h.r.c.r.n.i.DefaultNettyClient.destroy] - [Netty Client] start close future.
[INFO] [2019-11-01 23:11:11.471] [Thread-1] [c.g.h.r.c.r.n.i.DefaultNettyClient.destroy] - [Netty Client] 关闭完成
[INFO] [2019-11-01 23:11:11.481] [Thread-1] [c.g.h.r.c.r.n.i.DefaultNettyClient.destroy] - [Netty Client] 线程池关闭完成
[INFO] [2019-11-01 23:11:11.481] [Thread-1] [c.g.h.r.c.s.r.i.DefaultResourceManager.destroyAll] - [Resource] clear destroyableList
[INFO] [2019-11-01 23:11:11.481] [Thread-1] [c.g.h.r.c.s.h.DefaultShutdownHook.doHook] - [Shutdown] resourceManager finish destroy all resources.
[INFO] [2019-11-01 23:11:11.482] [Thread-1] [c.g.h.r.c.s.h.DefaultShutdownHook.doHook] - [Shutdown] set status to shutdown success.
[INFO] [2019-11-01 23:11:11.482] [Thread-1] [c.g.h.r.c.s.h.AbstractShutdownHook.hook] - [Shutdown Hook] end
```

# 小结

为了便于大家学习，以上源码已经开源：

> [https://github.com/houbb/rpc](https://github.com/houbb/rpc)

我是老马，期待与你的下次重逢。

* any list
{:toc}