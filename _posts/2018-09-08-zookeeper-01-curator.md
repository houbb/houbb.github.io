---
layout: post
title:  zookeeper-01-Apache Curator 
date:  2018-09-08 10:30:55 +0800
categories: [Distributed]
tags: [distributed, lock, apache, sh]
published: true
---

# 什么是 Apache Curator？

Apache Curator 是分布式协调服务 Apache ZooKeeper 的 Java/JVM 客户端库。

Apache Curator 包括一个高级 API 框架和实用程序，使使用 Apache ZooKeeper 变得更加容易和可靠。 

它还包括常见用例和扩展（例如服务发现和 Java 8 异步 DSL）的方法。

# 入门

## 学习 ZooKeeper

假定 Curator 用户了解 ZooKeeper。 

一个好的起点是这里：https://zookeeper.apache.org/doc/current/zookeeperStarted.html

## 使用 Curator

Curator JAR 可从 Maven Central 获得。 

主页上列出了各种工件。 Maven、Gradle、Ant 等的用户可以轻松地将 Curator 包含到他们的构建脚本中。

大多数用户会希望使用 Curator 的预建配方之一。 因此，策展人食谱是要使用的正确神器。 如果您只想在 ZooKeeper 周围添加一个包装器来添加连接管理和重试策略，请使用 curator-framework。

## 获得连接

Curator 使用 Fluent Style。 

如果您以前没有使用过它，它可能看起来很奇怪，因此建议您熟悉该样式。

Curator 连接实例 (CuratorFramework) 是从 CuratorFrameworkFactory 分配的。 

对于要连接到的每个 ZooKeeper 集群，您只需要一个 CuratorFramework 对象：

```java
CuratorFrameworkFactory.newClient(zookeeperConnectionString, retryPolicy)
```

这将使用默认值创建到 ZooKeeper 集群的连接。 

您唯一需要指定的是重试策略。 


在大多数情况下，您应该使用：

```java
RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000, 3)
CuratorFramework client = CuratorFrameworkFactory.newClient(zookeeperConnectionString, retryPolicy);
client.start();
```

客户端必须启动（并在不再需要时关闭）。

## 直接调用 ZooKeeper

拥有 CuratorFramework 实例后，您可以使用与使用 ZooKeeper 分发版中提供的原始 ZooKeeper 对象类似的方式直接调用 ZooKeeper。 

例如：

```java
client.create().forPath("/my/path", myData)
```

这里的好处是 Curator 管理 ZooKeeper 连接，并在出现连接问题时重试操作。

# 食谱（Recipes）

## 分布式锁

```java
InterProcessMutex lock = new InterProcessMutex(client, lockPath);
if ( lock.acquire(maxWait, waitUnit) ) 
{
    try 
    {
        // do some work inside of the critical section here
    }
    finally
    {
        lock.release();
    }
}
```

## Leader Election

```java
LeaderSelectorListener listener = new LeaderSelectorListenerAdapter()
{
    public void takeLeadership(CuratorFramework client) throws Exception
    {
        // this callback will get called when you are the leader
        // do whatever leader work you need to and only exit
        // this method when you want to relinquish leadership
    }
}

LeaderSelector selector = new LeaderSelector(client, path, listener);
selector.autoRequeue();  // not required, but this is behavior that you will probably expect
selector.start();
```

# 参考资料

http://curator.apache.org/

* any list
{:toc}