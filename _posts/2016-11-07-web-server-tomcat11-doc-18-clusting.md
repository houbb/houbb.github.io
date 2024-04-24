---
layout: post
title: web server apache tomcat11-18-clusting 集群
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 前言

整理这个官方翻译的系列，原因是网上大部分的 tomcat 版本比较旧，此版本为 v11 最新的版本。

## 开源项目

> 从零手写实现 tomcat [minicat](https://github.com/houbb/minicat) 别称【嗅虎】心有猛虎，轻嗅蔷薇。

## 系列文章

[web server apache tomcat11-01-官方文档入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-01-intro)

[web server apache tomcat11-02-setup 启动](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-02-setup)

[web server apache tomcat11-03-deploy 如何部署](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-03-deploy)

[web server apache tomcat11-04-manager 如何管理？](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-04-manager)

[web server apache tomcat11-06-Host Manager App -- Text Interface](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-06-host-manager)

[web server apache tomcat11-07-Realm Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-07-relam)

[web server apache tomcat11-08-JNDI Resources](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-08-jndi)

[web server apache tomcat11-09-JNDI Datasource](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-09-jdbc-datasource)

[web server apache tomcat11-10-Class Loader](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-10-classloader-howto)

...

# clusting

# 急于求成

只需将以下内容添加到您的 `<Engine>` 或 `<Host>` 元素中即可启用集群。

使用上述配置将启用所有节点间的会话复制，使用 DeltaManager 复制会话增量。所谓的全对全，是指每个会话都会复制到集群中的所有其他节点。这在较小的集群中效果很好，但我们不建议在较大的集群中使用 — 多于 4 个节点左右。此外，当使用 DeltaManager 时，Tomcat 将会话复制到所有节点，甚至那些未部署应用的节点。

为了解决这些问题，您将希望使用 BackupManager。BackupManager 仅将会话数据复制到一个备用节点，并且仅复制到已部署应用的节点。一旦您使用 DeltaManager 运行了简单的集群，随着您增加集群中节点的数量，您可能希望迁移到 BackupManager。

以下是一些重要的默认值：

- 多播地址为 228.0.0.4
- 多播端口为 45564（端口和地址一起确定了集群成员身份）
- 广播的 IP 是 java.net.InetAddress.getLocalHost().getHostAddress()（确保不要广播 127.0.0.1，这是一个常见的错误）
- 监听复制消息的 TCP 端口是范围在 4000-4100 的第一个可用服务器套接字
- 配置了监听器 ClusterSessionListener
- 配置了两个拦截器 TcpFailureDetector 和 MessageDispatchInterceptor

以下是默认的集群配置：

```xml
<Cluster className="org.apache.catalina.ha.tcp.SimpleTcpCluster"
         channelSendOptions="8">

  <Manager className="org.apache.catalina.ha.session.DeltaManager"
           expireSessionsOnShutdown="false"
           notifyListenersOnReplication="true"/>

  <Channel className="org.apache.catalina.tribes.group.GroupChannel">
    <Membership className="org.apache.catalina.tribes.membership.McastService"
                address="228.0.0.4"
                port="45564"
                frequency="500"
                dropTime="3000"/>
    <Receiver className="org.apache.catalina.tribes.transport.nio.NioReceiver"
              address="auto"
              port="4000"
              autoBind="100"
              selectorTimeout="5000"
              maxThreads="6"/>

    <Sender className="org.apache.catalina.tribes.transport.ReplicationTransmitter">
      <Transport className="org.apache.catalina.tribes.transport.nio.PooledParallelSender"/>
    </Sender>
    <Interceptor className="org.apache.catalina.tribes.group.interceptors.TcpFailureDetector"/>
    <Interceptor className="org.apache.catalina.tribes.group.interceptors.MessageDispatchInterceptor"/>
  </Channel>

  <Valve className="org.apache.catalina.ha.tcp.ReplicationValve"
         filter=""/>
  <Valve className="org.apache.catalina.ha.session.JvmRouteBinderValve"/>

  <Deployer className="org.apache.catalina.ha.deploy.FarmWarDeployer"
            tempDir="/tmp/war-temp/"
            deployDir="/tmp/war-deploy/"
            watchDir="/tmp/war-listen/"
            watchEnabled="false"/>

  <ClusterListener className="org.apache.catalina.ha.session.ClusterSessionListener"/>
</Cluster>
```

我们将在本文档后面更详细地介绍这一部分。

# 安全性

集群实现是基于在所有集群相关的网络流量中使用安全、可信任的网络的前提下编写的。在不安全、不可信任的网络上运行集群是不安全的。

为 Tomcat 集群提供安全、可信任的网络有许多选项，包括：

- 私有 LAN
- 虚拟专用网络（VPN）
- IPSEC

EncryptInterceptor 提供了机密性和完整性保护，但它不能保护免受在不可信任网络上运行 Tomcat 集群时可能发生的所有风险，特别是 DoS 攻击。

# 集群基础知识

要在您的 Tomcat 11 容器中运行会话复制，应完成以下步骤：

- 所有会话属性都必须实现 java.io.Serializable
- 在 server.xml 中取消注释 Cluster 元素
- 如果您定义了自定义集群阀门，请确保在 server.xml 中的 Cluster 元素下也定义了 ReplicationValve
- 如果您的 Tomcat 实例运行在同一台机器上，请确保 Receiver.port 属性对于每个实例是唯一的，在大多数情况下，Tomcat 能够自动检测到范围在 4000-4100 的可用端口
- 确保您的 web.xml 中有 `<distributable/>` 元素
- 如果您使用 mod_jk，请确保在 Engine `<Engine name="Catalina" jvmRoute="node01" >` 中设置了 jvmRoute 属性，并且该 jvmRoute 属性值与 workers.properties 中的 worker 名称匹配
- 确保所有节点具有相同的时间并与 NTP 服务同步！
- 确保您的负载均衡器配置为粘性会话模式

负载均衡可以通过多种技术实现，如负载均衡章节所述。

注意：请记住，您的会话状态由 cookie 跟踪，因此您的 URL 在外部必须看起来相同，否则会创建一个新的会话。

集群模块使用 Tomcat JULI 日志框架，因此您可以通过常规的 logging.properties 文件配置日志记录。要跟踪消息，您可以在键 org.apache.catalina.tribes.MESSAGES 上启用日志记录。

# 概述

为了在 Tomcat 中启用会话复制，可以采取三种不同的路径来实现相同的目标：

- 使用会话持久性，并将会话保存到共享文件系统（PersistenceManager + FileStore）
- 使用会话

持久性，并将会话保存到共享数据库（PersistenceManager + JDBCStore）
- 使用内存复制，使用随 Tomcat 一起提供的 SimpleTcpCluster（lib/catalina-tribes.jar + lib/catalina-ha.jar）

Tomcat 可以使用 DeltaManager 执行会话状态的全对全复制，也可以使用 BackupManager 执行仅将会话复制到一个节点的备份复制。全对全复制是一种仅在集群较小时才有效的算法。对于较大的集群，您应该使用 BackupManager，以使用主要 - 次要会话复制策略，其中会话仅存储在一个备份节点上。

目前，您可以使用 domain worker 属性（mod_jk > 1.2.8）构建具有更高可伸缩性的集群解决方案，以使用 DeltaManager 配置域拦截器（您将需要为此配置域拦截器）。为了在全对全环境中减少网络流量，在多个组之间拆分集群。这可以通过为不同的组使用不同的多播地址轻松实现。一个非常简单的设置如下所示：

```
DNS 轮询
       |
  负载均衡器
   /           \
集群1        集群2
  /     \        /     \
Tomcat1 Tomcat2  Tomcat3 Tomcat4
```

这里重要提及的是，会话复制只是集群的开始。用于实现集群的另一个流行概念是 farming，即将应用程序仅部署到一个服务器，然后集群将在整个集群中分布部署。这是 FarmWarDeployer 可以实现的所有功能（请参阅 server.xml 中的集群示例）。

在下一节中，我们将更深入地介绍会话复制的工作原理和配置方法。

# 集群信息

通过多播心跳建立成员资格。因此，如果您希望将您的集群细分，可以通过更改 `<Membership>` 元素中的多播 IP 地址或端口来实现。

心跳包包含 Tomcat 节点的 IP 地址和 Tomcat 用于复制流量的 TCP 端口。所有数据通信都在 TCP 上进行。

ReplicationValve 用于在请求完成后查找并启动复制（如果有）。仅当会话已更改（通过对会话调用 setAttribute 或 removeAttribute）时，才会复制数据。

其中一个最重要的性能考虑因素是同步与异步复制。在同步复制模式下，请求在复制的会话通过网络并在所有其他集群节点上重新实例化之前不会返回。同步与异步是通过 channelSendOptions 标志进行配置的，它是一个整数值。SimpleTcpCluster/DeltaManager 组合的默认值为 8，即异步。有关各种 channelSendOptions 值的更多讨论，请参阅配置参考。

为方便起见，channelSendOptions 可以通过名称设置，而不是整数值，这些名称在启动时将被翻译为其整数值。有效的选项名称为："asynchronous"（别名 "async"），"byte_message"（别名 "byte"），"multicast"，"secure"，"synchronized_ack"（别名 "sync"），"udp"，"use_ack"。使用逗号分隔多个名称，例如，传递 "async, multicast" 作为选项 SEND_OPTIONS_ASYNCHRONOUS | SEND_OPTIONS_MULTICAST。

您可以在[send flag(overview)](https://tomcat.apache.org/tomcat-9.0-doc/cluster-howto.html#send-flag-overview) 或 [send flag(javadoc)](https://tomcat.apache.org/tomcat-9.0-doc/cluster-howto.html#send-flag-javadoc) 上阅读更多关于 send flag 的信息。在异步复制期间，请求在数据被复制之前返回。异步复制可缩短请求时间，而同步复制可确保在请求返回之前复制会话。

# 在崩溃后将会话绑定到故障转移节点

如果您正在使用 mod_jk 并且未使用粘性会话，或者由于某些原因粘性会话不起作用，或者您只是在故障转移，那么会话 ID 将需要修改，因为它先前包含了前一个 Tomcat 的 worker ID（由 Engine 元素中的 jvmRoute 定义）。为解决此问题，我们将使用 JvmRouteBinderValve。

JvmRouteBinderValve 会重写会话 ID，以确保下一个请求在故障转移后仍然保持粘性（并且不会退回到随机节点，因为该 worker 不再可用）。该阀门将在 cookie 中将 JSESSIONID 值重写为同名。如果没有这个阀门，那么在 mod_jk 模块发生故障时确保粘性会变得更加困难。

请注意，如果您在 server.xml 中添加了自定义阀门，则默认值将不再有效，请确保您添加了所有适当的阀门，这些阀门由默认定义。

提示：
通过属性 sessionIdAttribute，您可以更改包含旧会话 ID 的请求属性名称。默认属性名称为 org.apache.catalina.ha.session.JvmRouteOriginalSessionID。

技巧：
您可以在将节点丢弃到所有备用节点之前通过 JMX 启用此 mod_jk 转换模式！将 JvmRouteBinderValve 备份的 enable 属性设置为 true，禁用 mod_jk 中的 worker，然后丢弃节点并重新启动它！然后再次启用 mod_jk Worker 并禁用 JvmRouteBinderValves。这种用法意味着仅迁移请求的会话。

## Configuration Example

```xml
<Cluster className="org.apache.catalina.ha.tcp.SimpleTcpCluster"
                 channelSendOptions="6">

          <Manager className="org.apache.catalina.ha.session.BackupManager"
                   expireSessionsOnShutdown="false"
                   notifyListenersOnReplication="true"
                   mapSendOptions="6"/>
          <!--
          <Manager className="org.apache.catalina.ha.session.DeltaManager"
                   expireSessionsOnShutdown="false"
                   notifyListenersOnReplication="true"/>
          -->
          <Channel className="org.apache.catalina.tribes.group.GroupChannel">
            <Membership className="org.apache.catalina.tribes.membership.McastService"
                        address="228.0.0.4"
                        port="45564"
                        frequency="500"
                        dropTime="3000"/>
            <Receiver className="org.apache.catalina.tribes.transport.nio.NioReceiver"
                      address="auto"
                      port="5000"
                      selectorTimeout="100"
                      maxThreads="6"/>

            <Sender className="org.apache.catalina.tribes.transport.ReplicationTransmitter">
              <Transport className="org.apache.catalina.tribes.transport.nio.PooledParallelSender"/>
            </Sender>
            <Interceptor className="org.apache.catalina.tribes.group.interceptors.TcpFailureDetector"/>
            <Interceptor className="org.apache.catalina.tribes.group.interceptors.MessageDispatchInterceptor"/>
            <Interceptor className="org.apache.catalina.tribes.group.interceptors.ThroughputInterceptor"/>
          </Channel>

          <Valve className="org.apache.catalina.ha.tcp.ReplicationValve"
                 filter=".*\.gif|.*\.js|.*\.jpeg|.*\.jpg|.*\.png|.*\.htm|.*\.html|.*\.css|.*\.txt"/>

          <Deployer className="org.apache.catalina.ha.deploy.FarmWarDeployer"
                    tempDir="/tmp/war-temp/"
                    deployDir="/tmp/war-deploy/"
                    watchDir="/tmp/war-listen/"
                    watchEnabled="false"/>

          <ClusterListener className="org.apache.catalina.ha.session.ClusterSessionListener"/>
        </Cluster>
```

# 分解解释

## Cluster 元素

```xml
<Cluster className="org.apache.catalina.ha.tcp.SimpleTcpCluster"
         channelSendOptions="6">
```

这是主要元素，在此元素内可以配置所有集群细节。`channelSendOptions` 是附加到每个由 `SimpleTcpCluster` 类发送的消息或调用 `SimpleTcpCluster.send` 方法的任何对象的标志。有关发送标志的说明，请访问我们的 [javadoc 网站](https://tomcat.apache.org/tomcat-9.0-doc/cluster-howto.html#send-flag-javadoc)。

## Manager 元素

```xml
<Manager className="org.apache.catalina.ha.session.BackupManager"
         expireSessionsOnShutdown="false"
         notifyListenersOnReplication="true"
         mapSendOptions="6"/>
```

这是管理器配置的模板，如果在 `<Context>` 元素中未定义管理器，则将使用此配置。在 Tomcat 5.x 中，每个标记为可分布的 Web 应用程序必须使用相同的管理器，但自从 Tomcat 之后，您可以为每个 Web 应用程序定义一个管理器类，因此您可以在集群中混合使用管理器。如果未为 Web 应用程序指定管理器，并且 Web 应用程序标记为 `<distributable/>`，Tomcat 将采用此管理器配置并创建一个管理器实例，克隆此配置。

## Channel 元素

```xml
<Channel className="org.apache.catalina.tribes.group.GroupChannel">
```

该元素是 Tribes，Tomcat 中使用的群组通信框架。此元素封装了与通信和成员逻辑有关的所有内容。

## Membership 元素

```xml
<Membership className="org.apache.catalina.tribes.membership.McastService"
            address="228.0.0.4"
            port="45564"
            frequency="500"
            dropTime="3000"/>
```

使用多播进行成员资格。请注意，Tribes 还支持使用 `StaticMembershipInterceptor` 进行静态成员资格，如果您想将成员资格扩展到超出多播范围的点。`address` 属性是使用的多播地址，`port` 是多播端口。这两者共同创建集群分隔。如果您想要一个 QA 集群和一个生产集群，最简单的配置是将 QA 集群放在与生产集群不同的多播地址/端口组合上。

## Receiver 元素

```xml
<Receiver className="org.apache.catalina.tribes.transport.nio.NioReceiver"
          address="auto"
          port="5000"
          selectorTimeout="100"
          maxThreads="6"/>
```

Receiver，顾名思义，负责接收消息。由于 Tribes 栈是无线程的（现在被其他框架广泛采用），所以此组件中有一个线程池，有 `maxThreads` 和 `minThreads` 设置。

## Sender 元素

```xml
<Sender className="org.apache.catalina.tribes.transport.ReplicationTransmitter">
  <Transport className="org.apache.catalina.tribes.transport.nio.PooledParallelSender"/>
</Sender>
```

Sender 组件负责将消息发送到其他节点。Sender 有一个外壳组件，`ReplicationTransmitter`，但真正的工作是在子组件 `Transport` 中完成的。Tribes 支持拥有一组发送者，以便可以并行发送消息；如果使用 NIO 发送器，还可以同时发送消息。

## Interceptor 元素

```xml
<Interceptor className="org.apache.catalina.tribes.group.interceptors.TcpFailureDetector"/>
<Interceptor className="org.apache.catalina.tribes.group.interceptors.MessageDispatchInterceptor"/>
<Interceptor className="org.apache.catalina.tribes.group.interceptors.ThroughputInterceptor"/>
```

Tribes 使用一个堆栈来发送消息。堆栈中的每个元素称为拦截器，与 Tomcat 服务器容器中的阀门类似。使用拦截器，可以将逻辑分解为更易管理的代码片段。上面配置的拦截器是：

- `TcpFailureDetector` - 通过 TCP 验证崩溃的成员，如果多播数据包丢失，此拦截器可防止错误的正面，即节点被标记为已崩溃，即使它仍然存活并运行。
- `MessageDispatchInterceptor` - 将消息异步地分派给线程（线程池）以发送消息。
- `ThroughputInterceptor` - 在消息流量上打

印简单的统计信息。

请注意，拦截器的顺序很重要。它们在 `server.xml` 中的定义方式就是它们在通道堆栈中的表示方式。将其视为一个链接列表，头部是第一个最前面的拦截器，尾部是最后一个。

## Valve 元素

```xml
<Valve className="org.apache.catalina.ha.tcp.ReplicationValve"
       filter=".*\.gif|.*\.js|.*\.jpeg|.*\.jpg|.*\.png|.*\.htm|.*\.html|.*\.css|.*\.txt"/>
```

集群使用阀门来跟踪对 Web 应用程序的请求，我们在上面提到了 `ReplicationValve` 和 `JvmRouteBinderValve`。`<Cluster>` 元素本身不是 Tomcat 中的管道的一部分，而是将阀门添加到其父容器中。如果在 `<Engine>` 元素中配置了 `<Cluster>` 元素，则阀门将添加到引擎中，依此类推。

## Deployer 元素

```xml
<Deployer className="org.apache.catalina.ha.deploy.FarmWarDeployer"
          tempDir="/tmp/war-temp/"
          deployDir="/tmp/war-deploy/"
          watchDir="/tmp/war-listen/"
          watchEnabled="false"/>
```

默认的 Tomcat 集群支持农场部署，即集群可以在其他节点上部署和取消部署应用程序。此组件的状态目前处于流动状态，但将很快解决。在 Tomcat 5.0 和 5.5 之间的部署算法发生了变化，在那时，该组件的逻辑改变为部署目录必须与 webapps 目录匹配。

## ClusterListener 元素

```xml
<ClusterListener className="org.apache.catalina.ha.session.ClusterSessionListener"/>
```

由于 `SimpleTcpCluster` 本身是 `Channel` 对象的发送方和接收方，组件可以将自己注册为 `SimpleTcpCluster` 的监听器。

上面的 `ClusterSessionListener` 监听 `DeltaManager` 复制消息并将增量应用到管理器，然后应用到会话。


# Cluster Architecture

## Component Levels:

```
         Server
           |
         Service
           |
         Engine
           |  \
           |  --- Cluster --*
           |
         Host
           |
         ------
        /      \
     Cluster    Context(1-N)
        |             \
        |             -- Manager
        |                   \
        |                   -- DeltaManager
        |                   -- BackupManager
        |
     ---------------------------
        |                       \
      Channel                    \
    ----------------------------- \
        |                          \
     Interceptor_1 ..               \
        |                            \
     Interceptor_N                    \
    -----------------------------      \
     |          |         |             \
   Receiver    Sender   Membership       \
                                         -- Valve
                                         |      \
                                         |       -- ReplicationValve
                                         |       -- JvmRouteBinderValve
                                         |
                                         -- LifecycleListener
                                         |
                                         -- ClusterListener
                                         |      \
                                         |       -- ClusterSessionListener
                                         |
                                         -- Deployer
                                                \
                                                 -- FarmWarDeployer
```


# 工作原理

为了便于理解集群是如何工作的，我们将通过一系列情景来详细说明。在这个情景中，我们计划仅使用两个 Tomcat 实例 TomcatA 和 TomcatB。我们将涵盖以下事件序列：

1. TomcatA 启动
2. TomcatB 启动（等待 TomcatA 启动完成）
3. TomcatA 收到请求，创建会话 S1。
4. TomcatA 崩溃
5. TomcatB 收到对会话 S1 的请求
6. TomcatA 重新启动
7. TomcatA 收到请求，会话（S1）调用了 invalidate。
8. TomcatB 收到请求，为新会话（S2）
9. 会话 S2 由于不活动而过期。
   
好的，现在我们有了一个良好的序列，我们将带您逐步了解会话复制代码中发生的确切情况。

## TomcatA 启动

当 TomcatA 使用标准启动序列启动时。当创建 Host 对象时，会与之关联一个集群对象。当解析上下文时，如果 web.xml 文件中存在 distributable 元素，Tomcat 会请求 Cluster 类（在本例中为 SimpleTcpCluster）为复制的上下文创建一个管理器。因此，启用了集群，web.xml 中设置了 distributable，Tomcat 将为该上下文创建 DeltaManager，而不是 StandardManager。集群类将启动成员服务（多播）和复制服务（TCP 单播）。有关架构的更多信息，请参见本文档后面的部分。

## TomcatB 启动

当 TomcatB 启动时，它遵循与 TomcatA 相同的序列，除了一点。集群已启动并将建立一个成员关系（TomcatA、TomcatB）。现在，TomcatB 将从已经存在于集群中的服务器（在本例中为 TomcatA）请求会话状态。TomcatA 响应该请求，在 TomcatB 开始监听 HTTP 请求之前，状态已从 TomcatA 传输到 TomcatB。如果 TomcatA 不响应，则 TomcatB 将在 60 秒后超时，发出日志条目，并继续启动。会话状态将针对每个具有其 web.xml 中 distributable 的 Web 应用程序进行传输。（注意：要有效地使用会话复制，所有 tomcat 实例应该配置相同。）

## TomcatA 收到请求，创建会话 S1。

进入 TomcatA 的请求处理方式与没有会话复制时完全相同，直到请求完成为止，在这个时间点，复制阀门将拦截请求，然后将响应返回给用户。在此时，它发现会话已被修改，并使用 TCP 将会话复制到 TomcatB。一旦序列化数据已经交给操作系统的 TCP 逻辑，请求就返回给用户，回到阀门管道。对于每个请求，整个会话都会被复制，这允许修改会话中的属性的代码而不调用 setAttribute 或 removeAttribute 也能被复制。可以使用 useDirtyFlag 配置参数来优化会话复制的次数。

## TomcatA 崩溃

当 TomcatA 崩溃时，TomcatB 收到 TomcatA 退出集群的通知。TomcatB 从其成员列表中删除 TomcatA，并且 TomcatA 将不再收到任何在 TomcatB 中发生的更改的通知。负载均衡器将请求从 TomcatA 重定向到 TomcatB，并且所有会话都是当前的。

## TomcatB 收到对会话 S1 的请求

没什么激动人心的，TomcatB 将处理该请求，就像处理任何其他请求一样。

## TomcatA 重新启动

在启动之前，TomcatA 将按照上面描述的启动序列 1) 2) 进行。它将加入集群，从 TomcatB 获取所有会话的当前状态。一旦接收到会话状态，它就完成了加载并打开了其 HTTP/mod_jk 端口。因此，在从 TomcatB 接收会话状态之前，没有请求会到达 TomcatA。

## TomcatA 收到请求，会话（S1）调用了 invalidate。

invalidate 调用被拦截，并且会话被排入无效会话队列。当请求完成时，而不是发送已更改的会话，它向 TomcatB 发送一个“过期”消息，TomcatB 也将使会话无效。

## TomcatB 收到请求，为新会话（S2）

与步骤 3）中的情景相同。

## 会话 S2 由于不活动而过期。

invalidate 调用与用户使会话无效时

的拦截方式相同，并且会话被排入无效会话队列。在这一点上，无效的会话不会被传播，直到另一个请求通过系统并检查无效队列。

## 成员关系

集群成员关系使用非常简单的多播 ping 来建立。每个 Tomcat 实例将周期性地发送一个多播 ping，在 ping 消息中，实例将广播其 IP 和 TCP 监听端口以进行复制。如果在给定时间段内没有收到这样的 ping，那么该成员被视为已死亡。非常简单，而且非常有效！当然，您需要在系统上启用多播。

## TCP 复制

一旦收到多播 ping，成员将被添加到集群。在下一个复制请求时，发送实例将使用主机和端口信息并建立一个 TCP 套接字。使用此套接字发送序列化数据。我选择 TCP 套接字的原因是它具有内置的流量控制和保证交付。因此，我知道当我发送一些数据时，它将到达那里 :)

## 分布式锁定和使用框架的页面

Tomcat 不会在集群中保持会话实例同步。实施这样逻辑的开销太大，并且会导致各种问题。如果您的客户端使用多个请求同时访问同一会话，则最后一个请求将覆盖集群中的其他会话。

# 使用 JMX 监控您的集群

在使用集群时，监控是一个非常重要的问题。一些集群对象是 JMX MBeans。

将以下参数添加到您的启动脚本中：

```bash
set CATALINA_OPTS=\
-Dcom.sun.management.jmxremote \
-Dcom.sun.management.jmxremote.port=%my.jmx.port% \
-Dcom.sun.management.jmxremote.ssl=false \
-Dcom.sun.management.jmxremote.authenticate=false
```

## 集群 MBeans 列表

* 列出集群 MBeans 的详细信息。

# 集群 MBeans 列表

| 名称                   | 描述                                       | MBean ObjectName - Engine             | MBean ObjectName - Host                        |
|----------------------|------------------------------------------|------------------------------------|--------------------------------------------|
| Cluster              | 完整的集群元素                                | type=Cluster                        | type=Cluster,host=${HOST}                   |
| DeltaManager         | 此管理器控制会话并处理会话复制                        | type=Manager,context=${APP.CONTEXT.PATH}, host=${HOST} | type=Manager,context=${APP.CONTEXT.PATH}, host=${HOST} |
| FarmWarDeployer      | 管理将应用程序部署到集群中的所有节点的过程                   | 不支持                                   | type=Cluster, host=${HOST}, component=deployer |
| Member               | 表示集群中的节点                               | type=Cluster, component=member, name=${NODE_NAME} | type=Cluster, host=${HOST}, component=member, name=${NODE_NAME} |
| ReplicationValve     | 此阀门控制向备份节点的复制                         | type=Valve,name=ReplicationValve   | type=Valve,name=ReplicationValve,host=${HOST} |
| JvmRouteBinderValve  | 这是一个集群回退阀门，用于将会话 ID 更改为当前的 tomcat jvmroute。 | type=Valve,name=JvmRouteBinderValve, context=${APP.CONTEXT.PATH} | type=Valve,name=JvmRouteBinderValve,host=${HOST}, context=${APP.CONTEXT.PATH} |




# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/cluster-howto.html

* any list
{:toc}