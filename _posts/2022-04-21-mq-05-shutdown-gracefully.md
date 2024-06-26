---
layout: post
title:  java 从零开始实现消息队列 mq-05-如何实现优雅关闭？
date:  2022-04-15 09:22:02 +0800
categories: [MQ]
tags: [mq, netty, sh]
published: true
---

# 前景回顾

[【mq】从零开始实现 mq-01-生产者、消费者启动 ](https://mp.weixin.qq.com/s/moF528JiVG9dqCi5oFMbVg)

[【mq】从零开始实现 mq-02-如何实现生产者调用消费者？](https://mp.weixin.qq.com/s/_OF4hbh9llaxN27Cv_cToQ)

[【mq】从零开始实现 mq-03-引入 broker 中间人](https://mp.weixin.qq.com/s/BvEWsLp3_35yFVRqBOxS2w)

[【mq】从零开始实现 mq-04-启动检测与实现优化](https://mp.weixin.qq.com/s/BvEWsLp3_35yFVRqBOxS2w)

[【mq】从零开始实现 mq-05-实现优雅停机](https://mp.weixin.qq.com/s/BvEWsLp3_35yFVRqBOxS2w)

## 为什么需要优雅关闭？

我记得多年前，那个时候 rpc 框架主流用的还是 dubbo，每次都是半夜还是上线，上线上完基本都是凌晨 2-3 点。

为什么要半夜上线呢？

因为这个时候一般业务流量最低。

还有就是上线发布，每次都要人工等待一段几分钟。

因为 rpc 调用入口已经关闭了，但是本身可能还没有处理完。

那么有没有方法可以让服务的关闭更加优雅，而不是人工等待呢？

![05](https://img-blog.csdnimg.cn/9d56469513634bfab087f6e04193c270.png#pic_center)

## 实现思路

人工等待几分钟的方式一般可以解决问题，但是大部分情况是无用功，还比较浪费时间。

比较自然的一种方式是引入钩子函数。

当应用准备关闭时，首先判断是否存在处理中的请求，不存在则直接关闭；存在，则等待请求完成再关闭。

# 实现

生产者和消费者是类似的，我们以生产者为例。

## 启动实现的调整

```java
@Override
public synchronized void run() {
    this.paramCheck();
    // 启动服务端
    log.info("MQ 生产者开始启动客户端 GROUP: {} brokerAddress: {}",
            groupName, brokerAddress);
    try {
        //0. 配置信息
        ProducerBrokerConfig config = ProducerBrokerConfig.newInstance()
                .groupName(groupName)
                .brokerAddress(brokerAddress)
                .check(check)
                .respTimeoutMills(respTimeoutMills)
                .invokeService(invokeService)
                .statusManager(statusManager);

        //1. 初始化
        this.producerBrokerService.initChannelFutureList(config);
        //2. 连接到服务端
        this.producerBrokerService.registerToBroker();

        //3. 标识为可用
        statusManager.status(true);

        //4. 添加钩子函数
        final DefaultShutdownHook rpcShutdownHook = new DefaultShutdownHook();
        rpcShutdownHook.setStatusManager(statusManager);
        rpcShutdownHook.setInvokeService(invokeService);
        rpcShutdownHook.setWaitMillsForRemainRequest(waitMillsForRemainRequest);
        rpcShutdownHook.setDestroyable(this.producerBrokerService);
        ShutdownHooks.rpcShutdownHook(rpcShutdownHook);
        log.info("MQ 生产者启动完成");
    } catch (Exception e) {
        log.error("MQ 生产者启动遇到异常", e);
        throw new MqException(ProducerRespCode.RPC_INIT_FAILED);
    }
}
```

## 状态管理类

这里我们引入 statusManager 管理整体的状态。

默认的如下：

```java
public class StatusManager implements IStatusManager {

    private boolean status;

    @Override
    public boolean status() {
        return this.status;
    }

    @Override
    public IStatusManager status(boolean status) {
        this.status = status;

        return this;
    }

}
```

就是对一个是否可用的状态进行维护，然后在 channel 获取等地方便于判断当前服务的状态。

## 钩子函数

DefaultShutdownHook 实现如下：

```java
public class DefaultShutdownHook extends AbstractShutdownHook {

    /**
     * 调用管理类
     * @since 0.0.5
     */
    private IInvokeService invokeService;

    /**
     * 销毁管理类
     * @since 0.0.5
     */
    private Destroyable destroyable;

    /**
     * 状态管理类
     * @since 0.0.5
     */
    private IStatusManager statusManager;

    /**
     * 为剩余的请求等待时间
     * @since 0.0.5
     */
    private long waitMillsForRemainRequest = 60 * 1000;

    //get & set

    /**
     * （1）设置 status 状态为等待关闭
     * （2）查看是否 {@link IInvokeService#remainsRequest()} 是否包含请求
     * （3）超时检测-可以不添加，如果难以关闭成功，直接强制关闭即可。
     * （4）关闭所有线程池资源信息
     * （5）设置状态为成功关闭
     */
    @Override
    protected void doHook() {
        statusManager.status(false);
        // 设置状态为等待关闭
        logger.info("[Shutdown] set status to wait for shutdown.");

        // 循环等待当前执行的请求执行完成
        long startMills = System.currentTimeMillis();
        while (invokeService.remainsRequest()) {
            long currentMills = System.currentTimeMillis();
            long costMills = currentMills - startMills;
            if(costMills >= waitMillsForRemainRequest) {
                logger.warn("[Shutdown] still remains request, but timeout, break.");
                break;
            }

            logger.debug("[Shutdown] still remains request, wait for a while.");
            DateUtil.sleep(10);
        }

        // 销毁
        destroyable.destroyAll();

        // 设置状态为关闭成功
        statusManager.status(false);
        logger.info("[Shutdown] set status to shutdown success.");
    }

}
```

（1）进行关闭前，首先判断通过 `invokeService.remainsRequest()` 判断是否有未处理完的消息，有则进行等待。

（2）当然，我们还需要考虑网络消息丢失的场景，不可能一直等待。

所以引入了超时中断，最大等待时间也是可以自行定义的。

```java
if(costMills >= waitMillsForRemainRequest) {
    logger.warn("[Shutdown] still remains request, but timeout, break.");
    break;
}
```

（3）关闭之后

将 status 设置为 false，标识当前服务不可用。

# 小结

随着 rpc 技术的成熟，优雅关闭已经成为一个很基本的功能点。

一个小小的改动，可以节约生产发布时间，早点下班陪陪家人。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

# 开源地址

> [The message queue in java.(java 简易版本 mq 实现) ](https://github.com/houbb/mq) https://github.com/houbb/mq

# 拓展阅读

[rpc-从零开始实现 rpc](https://github.com/houbb/rpc) https://github.com/houbb/rpc

* any list
{:toc}