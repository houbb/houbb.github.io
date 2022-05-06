---
layout: post
title:  java 从零开始实现消息队列 mq-06-消费者心跳检测 heartbeat
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

[【mq】从零开始实现 mq-06-消费者心跳检测 heartbeat](https://mp.weixin.qq.com/s/lsvm9UoQWK98Jy3kuS2aNg)

# 为什么需要心跳？

**心跳（heartbeat ），顾名思义就是心脏的跳动。**

医学上一般通过心跳是否跳动，来判断一个人是否活着。

那么，分布式服务中如何判断一个服务是否还活着呢？

## 实现思路

比如 mq 中，broker 需要把消息实时推送给在线的消费者。

那么如何判断一个消费者是否活着呢？

我们可以让消费者定时，比如每 5 秒钟给 broker 发送一个心跳包，考虑到网络延迟等，如果连续 1min 都没有收到心跳，我们则移除这个消费者，认为服务已经挂了。

![heartbeat](https://img-blog.csdnimg.cn/18e48dab9ebb47d88ea6910a748d8039.png#pic_center)

# 消费者实现

上代码！

## 心跳实现

心跳可以是一个很简单的消息体。

```java
@Override
public void heartbeat() {
    final MqHeartBeatReq req = new MqHeartBeatReq();
    final String traceId = IdHelper.uuid32();
    req.setTraceId(traceId);
    req.setMethodType(MethodType.C_HEARTBEAT);
    req.setAddress(NetUtil.getLocalHost());
    req.setPort(0);
    req.setTime(System.currentTimeMillis());

    log.debug("[HEARTBEAT] 往服务端发送心跳包 {}", JSON.toJSON(req));

    // 通知全部
    for(RpcChannelFuture channelFuture : channelFutureList) {
        try {
            Channel channel = channelFuture.getChannelFuture().channel();
            callServer(channel, req, null);
        } catch (Exception exception) {
            log.error("[HEARTBEAT] 往服务端处理异常", exception);
        }
    }
}
```

消费者把心跳通知所有的 broker.

## 心跳的定时执行

我们启动一个定时任务，5S 钟执行一次。

```java
/**
 * 初始化心跳
 * @since 0.0.6
 */
private void initHeartbeat() {
    //5S 发一次心跳
    scheduledExecutorService.scheduleAtFixedRate(new Runnable() {
        @Override
        public void run() {
            heartbeat();
        }
    }, 5, 5, TimeUnit.SECONDS);
}
```

心跳是在连接到 broker 之后就开始启动：

```java
@Override
public void initChannelFutureList(ConsumerBrokerConfig config) {
    //1. 配置初始化
    //...

    //2. 初始化
    this.channelFutureList = ChannelFutureUtils.initChannelFutureList(brokerAddress,
            initChannelHandler(), check);

    //3. 初始化心跳
    this.initHeartbeat();
}
```

# Broker 实现

消费者定时发送消息，生产者肯定是需要接受的。

## 接收心跳

为了简单，我们让心跳是 ONE-WAY 的。

```java
// 消费者心跳
if(MethodType.C_HEARTBEAT.equals(methodType)) {
    MqHeartBeatReq req = JSON.parseObject(json, MqHeartBeatReq.class);
    registerConsumerService.heartbeat(req, channel);
    return null;
}
```

## hearbeat 处理

每次收到消息，我们把请求的 channelId 记录下来，并保存最新的访问时间

```java
@Override
public void heartbeat(MqHeartBeatReq mqHeartBeatReq, Channel channel) {
    final String channelId = ChannelUtil.getChannelId(channel);
    log.info("[HEARTBEAT] 接收消费者心跳 {}, channelId: {}",
            JSON.toJSON(mqHeartBeatReq), channelId);

    ServiceEntry serviceEntry = new ServiceEntry();
    serviceEntry.setAddress(mqHeartBeatReq.getAddress());
    serviceEntry.setPort(mqHeartBeatReq.getPort());

    BrokerServiceEntryChannel entryChannel = InnerChannelUtils.buildEntryChannel(serviceEntry, channel);
    entryChannel.setLastAccessTime(mqHeartBeatReq.getTime());
    heartbeatMap.put(channelId, entryChannel);
}
```

## 移除消费者

如果一些消费者长时间没有心跳，我们就认为服务已经挂了。

在 `LocalBrokerConsumerService` 服务启动的时候，同时启用一个定时清理任务。

```java
public LocalBrokerConsumerService() {
    //120S 扫描一次
    final long limitMills = 2 * 60 * 1000;

    scheduledExecutorService.scheduleAtFixedRate(new Runnable() {
        @Override
        public void run() {
            for(Map.Entry<String, BrokerServiceEntryChannel> entry : heartbeatMap.entrySet()) {
                String key  = entry.getKey();
                long lastAccessTime = entry.getValue().getLastAccessTime();
                long currentTime = System.currentTimeMillis();
                if(currentTime - lastAccessTime > limitMills) {
                    removeByChannelId(key);
                }
            }
        }
    }, 2 * 60, 2 * 60, TimeUnit.SECONDS);
}
```

这个任务 2min 执行一次，如果 2min 都没有心跳，这移除对应的消费者。

# 小结

心跳，是网络传输中验证服务可用性非常简单，但是有效的方式。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

# 开源地址

> [The message queue in java.(java 简易版本 mq 实现) ](https://github.com/houbb/mq) https://github.com/houbb/mq

# 拓展阅读

[rpc-从零开始实现 rpc](https://github.com/houbb/rpc) https://github.com/houbb/rpc

* any list
{:toc}