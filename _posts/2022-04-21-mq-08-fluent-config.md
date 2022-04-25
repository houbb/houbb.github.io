---
layout: post
title:  java 从零开始实现消息队列 mq-08-fluent 丝滑优化的配置方式
date:  2022-04-15 09:22:02 +0800
categories: [MQ]
tags: [mq, netty, sh]
published: true
---

# 前景回顾

大家好，我是老马。

xxx

# fluent

fluent 的配置方式，是我个人非常喜欢的一种配置方式。

传统的 java 使用 get/set 方法进行属性设置。

类似这种：

```java
MqBroker  mqBroker = new MqBroker();
mqBroker.setPort(9999);
mqBroker.setAddress("127.0.0.1");
```

fluent 写法可以让我们写起来代码更加流畅：

```java
MqBroker.newInstance()
.port(9999)
.address("127.0.0.1")
```

写起来更加丝滑流畅。

# Broker 配置

## 属性

```java
/**
 * 端口号
 */
private int port = BrokerConst.DEFAULT_PORT;
/**
 * 调用管理类
 *
 * @since 1.0.0
 */
private final IInvokeService invokeService = new InvokeService();
/**
 * 消费者管理
 *
 * @since 0.0.3
 */
private IBrokerConsumerService registerConsumerService = new LocalBrokerConsumerService();
/**
 * 生产者管理
 *
 * @since 0.0.3
 */
private IBrokerProducerService registerProducerService = new LocalBrokerProducerService();
/**
 * 持久化类
 *
 * @since 0.0.3
 */
private IMqBrokerPersist mqBrokerPersist = new LocalMqBrokerPersist();
/**
 * 推送服务
 *
 * @since 0.0.3
 */
private IBrokerPushService brokerPushService = new BrokerPushService();
/**
 * 获取响应超时时间
 * @since 0.0.3
 */
private long respTimeoutMills = 5000;
/**
 * 负载均衡
 * @since 0.0.7
 */
private ILoadBalance<ConsumerSubscribeBo> loadBalance = LoadBalances.weightRoundRobbin();
/**
 * 推送最大尝试次数
 * @since 0.0.8
 */
private int pushMaxAttempt = 3;
```

## flent 配置

```java
public MqBroker port(int port) {
    this.port = port;
    return this;
}

public MqBroker registerConsumerService(IBrokerConsumerService registerConsumerService) {
    this.registerConsumerService = registerConsumerService;
    return this;
}

public MqBroker registerProducerService(IBrokerProducerService registerProducerService) {
    this.registerProducerService = registerProducerService;
    return this;
}

public MqBroker mqBrokerPersist(IMqBrokerPersist mqBrokerPersist) {
    this.mqBrokerPersist = mqBrokerPersist;
    return this;
}

public MqBroker brokerPushService(IBrokerPushService brokerPushService) {
    this.brokerPushService = brokerPushService;
    return this;
}

public MqBroker respTimeoutMills(long respTimeoutMills) {
    this.respTimeoutMills = respTimeoutMills;
    return this;
}

public MqBroker loadBalance(ILoadBalance<ConsumerSubscribeBo> loadBalance) {
    this.loadBalance = loadBalance;
    return this;
}
```

# Producer 配置

## 属性

```java
/**
 * 分组名称
 */
private String groupName = ProducerConst.DEFAULT_GROUP_NAME;
/**
 * 中间人地址
 */
private String brokerAddress  = "127.0.0.1:9999";
/**
 * 获取响应超时时间
 * @since 0.0.2
 */
private long respTimeoutMills = 5000;
/**
 * 检测 broker 可用性
 * @since 0.0.4
 */
private volatile boolean check = true;
/**
 * 调用管理服务
 * @since 0.0.2
 */
private final IInvokeService invokeService = new InvokeService();
/**
 * 状态管理类
 * @since 0.0.5
 */
private final IStatusManager statusManager = new StatusManager();
/**
 * 生产者-中间服务端服务类
 * @since 0.0.5
 */
private final IProducerBrokerService producerBrokerService = new ProducerBrokerService();
/**
 * 为剩余的请求等待时间
 * @since 0.0.5
 */
private long waitMillsForRemainRequest = 60 * 1000;
/**
 * 负载均衡策略
 * @since 0.0.7
 */
private ILoadBalance<RpcChannelFuture> loadBalance = LoadBalances.weightRoundRobbin();
/**
 * 消息发送最大尝试次数
 * @since 0.0.8
 */
private int maxAttempt = 3;
```

## fluent 配置

```java
public MqProducer groupName(String groupName) {
    this.groupName = groupName;
    return this;
}

public MqProducer brokerAddress(String brokerAddress) {
    this.brokerAddress = brokerAddress;
    return this;
}

public MqProducer respTimeoutMills(long respTimeoutMills) {
    this.respTimeoutMills = respTimeoutMills;
    return this;
}

public MqProducer check(boolean check) {
    this.check = check;
    return this;
}

public MqProducer waitMillsForRemainRequest(long waitMillsForRemainRequest) {
    this.waitMillsForRemainRequest = waitMillsForRemainRequest;
    return this;
}

public MqProducer loadBalance(ILoadBalance<RpcChannelFuture> loadBalance) {
    this.loadBalance = loadBalance;
    return this;
}

public MqProducer maxAttempt(int maxAttempt) {
    this.maxAttempt = maxAttempt;
    return this;
}
```

# Consuemr 配置

## 属性

```java
/**
 * 组名称
 */
private String groupName = ConsumerConst.DEFAULT_GROUP_NAME;
/**
 * 中间人地址
 */
private String brokerAddress  = "127.0.0.1:9999";
/**
 * 获取响应超时时间
 * @since 0.0.2
 */
private long respTimeoutMills = 5000;
/**
 * 检测 broker 可用性
 * @since 0.0.4
 */
private volatile boolean check = true;
/**
 * 为剩余的请求等待时间
 * @since 0.0.5
 */
private long waitMillsForRemainRequest = 60 * 1000;
/**
 * 调用管理类
 *
 * @since 1.0.0
 */
private final IInvokeService invokeService = new InvokeService();
/**
 * 消息监听服务类
 * @since 0.0.5
 */
private final IMqListenerService mqListenerService = new MqListenerService();
/**
 * 状态管理类
 * @since 0.0.5
 */
private final IStatusManager statusManager = new StatusManager();
/**
 * 生产者-中间服务端服务类
 * @since 0.0.5
 */
private final IConsumerBrokerService consumerBrokerService = new ConsumerBrokerService();
/**
 * 负载均衡策略
 * @since 0.0.7
 */
private ILoadBalance<RpcChannelFuture> loadBalance = LoadBalances.weightRoundRobbin();
/**
 * 订阅最大尝试次数
 * @since 0.0.8
 */
private int subscribeMaxAttempt = 3;
/**
 * 取消订阅最大尝试次数
 * @since 0.0.8
 */
private int unSubscribeMaxAttempt = 3;
```

## fluent 配置

```java
public MqConsumerPush subscribeMaxAttempt(int subscribeMaxAttempt) {
    this.subscribeMaxAttempt = subscribeMaxAttempt;
    return this;
}

public MqConsumerPush unSubscribeMaxAttempt(int unSubscribeMaxAttempt) {
    this.unSubscribeMaxAttempt = unSubscribeMaxAttempt;
    return this;
}

public MqConsumerPush groupName(String groupName) {
    this.groupName = groupName;
    return this;
}

public MqConsumerPush brokerAddress(String brokerAddress) {
    this.brokerAddress = brokerAddress;
    return this;
}

public MqConsumerPush respTimeoutMills(long respTimeoutMills) {
    this.respTimeoutMills = respTimeoutMills;
    return this;
}

public MqConsumerPush check(boolean check) {
    this.check = check;
    return this;
}

public MqConsumerPush waitMillsForRemainRequest(long waitMillsForRemainRequest) {
    this.waitMillsForRemainRequest = waitMillsForRemainRequest;
    return this;
}

public MqConsumerPush loadBalance(ILoadBalance<RpcChannelFuture> loadBalance) {
    this.loadBalance = loadBalance;
    return this;
}
```

# 小结

这一节的实现非常简单，可以说是没有啥技术难度。

只是为了让使用者更加方便。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次重逢。

# 开源地址

> [The message queue in java.(java 简易版本 mq 实现) ](https://github.com/houbb/mq) https://github.com/houbb/mq

# 拓展阅读

[rpc-从零开始实现 rpc](https://github.com/houbb/rpc) https://github.com/houbb/rpc

* any list
{:toc}