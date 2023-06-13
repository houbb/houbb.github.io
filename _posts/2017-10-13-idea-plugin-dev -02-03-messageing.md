---
layout: post
title:  Idea Plugin Dev-04-Messaging Infrastructure 消息基础设施 
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# 目的

本文档的目的是向开发人员和插件编写者介绍 IntelliJ 平台中可用的消息传递基础结构。 

它旨在回答为什么、何时以及如何使用它。

# 理由

那么，什么是 IntelliJ 平台中的消息传递，我们为什么需要它？ 

基本上，它的发布者订阅者模式的实现提供了额外的特性，比如在层次结构上广播和特殊的嵌套事件处理（这里的嵌套事件是指从另一个事件的回调中（直接或间接）触发新事件的情况）。

# 设计

以下是消息传递 API 的主要组件。 

## 主题-TOPIC

此类用作消息传递基础结构的端点。 

即，允许客户端订阅总线中的特定主题，并向该特定总线中的该主题发送消息。

显示名称只是用于记录/监控目的的人类可读名称；

广播方向将在广播中详细说明。 默认值为 TO_CHILDREN；

侦听器类，它是特定主题的业务接口。 

订户在消息传递基础结构中注册此接口的实现。 

发布者稍后检索符合接口 (IS-A) 的对象并调用在这些实现上定义的任何方法。 

消息传递基础设施通过在已注册的实现回调上调用具有相同参数的相同方法，负责将消息分发给主题的所有订阅者；

为了明确相应的消息总线，Topic字段声明可以分别用com.intellij.util.messages.Topic.AppLevel和com.intellij.util.messages.Topic.ProjectLevel进行注解。

## 消息总线-Message Bus

是消息系统的核心。 

用于以下场景：

![message bus](https://plugins.jetbrains.com/docs/intellij/images/bus.svg)

## 连接-connection

管理特定总线内特定客户端的所有订阅。

![connection](https://plugins.jetbrains.com/docs/intellij/images/connection.svg)

保留主题处理程序映射的数量（接收到目标主题的消息时调用的回调）注意：同一连接中的每个主题不允许超过一个处理程序；

可以在没有明确提供回调的情况下指定默认处理程序并订阅目标主题。 

- 连接将在存储（主题处理程序）映射时使用该默认处理程序；

- 可以显式释放获取的资源（disconnect() 方法）。 

- 此外，它可以插入标准的半自动处理（一次性）；

## 放在一起

### 定义业务接口和主题

```java
public interface ChangeActionNotifier {

  Topic<ChangeActionNotifier> CHANGE_ACTION_TOPIC =
      Topic.create("custom name", ChangeActionNotifier.class);

  void beforeAction(Context context);
  void afterAction(Context context);
}
```

### Subscribing

![Subscribing](https://plugins.jetbrains.com/docs/intellij/images/subscribe.svg)

```java
public void init(MessageBus bus) {
  bus.connect().subscribe(ActionTopics.CHANGE_ACTION_TOPIC,
      new ChangeActionNotifier() {
          @Override
          public void beforeAction(Context context) {
            // Process 'before action' event.
          }
          @Override
          public void afterAction(Context context) {
            // Process 'after action' event.
          }
  });
}
```

### Publishing

![Publishing](https://plugins.jetbrains.com/docs/intellij/images/publish.svg)

```java
public void doChange(Context context) {
  ChangeActionNotifier publisher =
      myBus.syncPublisher(ActionTopics.CHANGE_ACTION_TOPIC);
  publisher.beforeAction(context);
  try {
    // do action
  } finally {
    publisher.afterAction(context);
  }
}
```

### 现有资源

MessageBus 实例可通过 ComponentManager.getMessageBus() 获得 许多标准接口实现消息总线，例如 Application 和 Project。

IntelliJ 平台使用了许多公共主题，例如 AppTopics、ProjectTopics 等。因此，可以订阅它们以接收有关处理的信息。

# 广播-Broadcasting

消息总线可以组织成层次结构。 

此外，IntelliJ 平台已经有了它们：

```
application bus = project bus = module bus
```

这允许通知在一个消息总线中注册的订阅者关于发送到另一个消息总线的消息。

例子：

![broadcast](https://plugins.jetbrains.com/docs/intellij/images/parent_child_broadcast.svg)

这里我们有一个简单的层次结构（应用程序总线是项目总线的父级），其中有三个订阅者用于同一主题。

如果 topic1 将广播方向定义为 TO_CHILDREN，我们将得到以下内容：

通过应用程序总线向主题 1 发送一条消息；

handler1 收到消息通知；

消息传递给项目总线内相同主题的订阅者（handler2和handler3）；

## 好处

我们不需要为绑定到子总线但对父总线级事件感兴趣的订阅者进行内存管理。

考虑上面的示例，我们可能希望具有对应用程序级事件做出反应的特定于项目的功能。 

我们需要做的就是在项目总线中订阅目标主题。 

项目级订阅者的硬引用将不会存储在应用程序级，也就是说，我们只是避免了项目重新打开时的内存泄漏。

## 选项

广播配置是按主题定义的。 

以下选项可用：

TO_CHILDREN_（默认）；

NONE;

TO_PARENT；

# 嵌套消息-Nested Messages﻿

嵌套消息是在另一个消息处理过程中（直接或间接）发送的消息。 

IntelliJ 平台的消息传递基础结构保证发送到特定主题的所有消息都将按发送顺序传递。

例子：

假设我们有以下配置：

![config](https://plugins.jetbrains.com/docs/intellij/images/nested_config.svg)

让我们看看如果有人向目标主题发送消息会发生什么：

消息 1 已发送；

handler1 接收 message1 并将 message2 发送到同一个主题；

handler2 收到消息 1；

处理程序 2 接收消息 2；

处理程序 1 收到消息 2；

# 技巧和窍门

## 救济听众管理

消息传递基础设施非常轻量级，因此可以在本地子系统中重用它以减轻订阅者的建设。 

让我们看看接下来需要做什么：

定义要使用的业务接口；

创建使用上述接口的共享消息总线和主题（这里共享是指主题或订阅者都知道它们）；

让我们将其与手动实施进行比较：

定义监听接口（业务接口）；

向所有感兴趣的听众提供对该主题的参考；

为主题添加监听器存储和监听器管理方法（添加/删除）；

在触发新事件的所有地方手动迭代所有侦听器并调用目标回调；

## 避免订阅者修改共享数据

当两个订阅者试图修改同一个文档时，我们遇到了一个问题 (IDEA-71701)。

问题是每个文档更改都是由以下场景执行的：

在将更改事件发送到所有文档侦听器之前，其中一些侦听器在此期间发布新消息；

执行实际更改；

在将更改事件发送到所有文档侦听器之后；

那时我们有以下内容：

message1 被发送到有两个订阅者的主题；

message1 为两个订阅者排队；

message1 传递开始；

订阅者 1 收到消息 1；

subscriber1 在特定范围内发出文档修改请求（例如 document.delete(startOffset, endOffset)）；

在将更改通知发送到文档侦听器之前；

message2 在更改处理之前由标准文档侦听器之一发送到同一消息总线中的另一个主题；

总线在排队消息 2 之前尝试传递所有未决消息；

subscriber2 收到 message1 并且也修改了一个文档；

调用堆栈展开，订阅者 1 请求的文档修改操作的实际更改阶段开始；

问题是，如果订阅者 2 在它之前更改了文档范围，则订阅者 1 用于初始修改请求的文档范围无效。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/messaging-infrastructure.html

* any list
{:toc}