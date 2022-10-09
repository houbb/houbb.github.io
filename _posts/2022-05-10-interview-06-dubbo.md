---
layout: post
title:  dubbo 常见面试题汇总
date:  2022-05-10 09:22:02 +0800
categories: [Interview]
tags: [interview, redis, sh]
published: true
---

# 系列目录

[spring 常见面试题](https://houbb.github.io/2022/05/10/interview-01-spring)

[spring-boot 常见面试题](https://houbb.github.io/2022/05/10/interview-02-springboot)

[redis 常见面试题](https://houbb.github.io/2022/05/10/interview-04-redis)

[mysql 常见面试题](https://houbb.github.io/2022/05/10/interview-05-mysql)

[mq 常见面试题](https://houbb.github.io/2022/05/10/interview-07-mq)

[rpc/dubbo 常见面试题](https://houbb.github.io/2022/05/10/interview-06-dubbo)

[ZooKeeper 面试题](https://houbb.github.io/2022/05/10/interview-08-zookeeper)

[JVM 常见面试题之双亲委派](https://houbb.github.io/2022/05/10/interview-09-jvm-classloader)

[JVM 常见面试题之 GC 垃圾回收](https://houbb.github.io/2022/05/10/interview-09-jvm-gc)

[JVM 常见面试题之 java 内存结构](https://houbb.github.io/2022/05/10/interview-09-jvm-struct)

[JVM 常见面试题之 java 内存结构2](https://houbb.github.io/2022/05/10/interview-11-java-jvm)

[【面试】mybatis 常见面试题汇总](https://houbb.github.io/2022/05/10/interview-03-mybatis)

[面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2022/05/10/interview-10-repeat)

[java 基础之 event 事件机制](https://houbb.github.io/2022/05/10/interview-11-java-basic-event)

[Reflection-01-java 反射机制](https://houbb.github.io/2018/07/01/reflection-01-overview)

[distributed 分布式相关专题汇总](https://houbb.github.io/2022/05/10/interview-11-java-distribute)

[web 常见面试题](https://houbb.github.io/2022/05/10/interview-11-java-web)

[其他常见面试题](https://houbb.github.io/2022/05/10/interview-12-other)

# 前言

大家好，我是老马。

dubbo 使我们日常开发中常用的 rpc 框架。

面试中自然出现频率也比较高，对常见问题进行整理，便于平时查阅收藏。

# Dubbo 是什么？

Dubbo 是一个分布式、高性能、透明化的 RPC 服务框架，提供服务自动注册、自动发现等高效服务治理方案， 可以和Spring 框架无缝集成

# 为什么要用 Dubbo？

因为是阿里开源项目，国内很多互联网公司都在用，已经经过很多线上考验。

内部使用了 Netty、Zookeeper，保证了高性能高可用性。

使用 Dubbo 可以将核心业务抽取出来，作为独立的服务，逐渐形成稳定的服务中心，可用于提高业务复用灵活扩展，使前端应用能更快速的响应多变的市场需求。

# Q1：服务调用超时问题怎么解决

消费者调用服务超时会引起服务降级的发生，即从发出调用请求到获取到提供者的响应结果这个时间超出了设定的时限。默认服务调用超时时限为 1 秒。

可以在消费者端与提供者端设置超时时限来解决。

总的来说还是要设计好业务代码来减少调用时长，设置准确 RPC 调用的超时时间才能更好的解决这个问题。

两个核心问题：

（1）如果界定超时时间？

一般可以结合业务，定义超时时间，比如 5S。

引入监控统计，后续根据 99.999% 定制合理的超时时间。

（2）超时了如何解决

一般结合具体的业务。

重试

反查

异步回调

# 服务调用是阻塞的吗？

默认是阻塞的，可以异步调用，没有返回值的可以这么做。

Dubbo 是基于 NIO 的非阻塞实现并行调用，客户端不需要启动多线程即可完成并行调用多个远程服务，相对多线程开销较小，异步调用会返回一个 Future 对象。


# RPC 框架

## Dubbo 和 SpringCloud 的关系？

Dubbo 是 SOA 时代的产物，它的关注点主要在于服务的调用，流量分发、流量监控和熔断。

而 SpringCloud 诞生于微服务架构时代，考虑的是微服务治理的方方面面，另外由于依托了 Spirng、SpirngBoot 的优势之上，两个框架在开始目标就不一致，Dubbo 定位服务治理、SpringCloud 是一个生态。

## Dubbo 和 SpringCloud 中的 OpenFeign 组件的区别？

最大的区别：Dubbo 底层是使用 Netty 这样的 NIO 框架，是基于 TCP 协议传输的，配合以Hession 序列化完成 RPC 通信。

而 SpringCloud 是基于 Http 协议 + Rest 接口调用远程过程的通信，相对来说，Http 请求会有更大的报文，占的带宽也会更多。但是 REST 相比 RPC 更为灵活。

## 你还了解别的分布式框架吗？

别的还有 spring 的 spring cloud，facebook 的 thrift，twitter 的 finagle 等。

冲上云霄，Dubbo Go！GO语言版本都发布了～推荐阅读：Spring Cloud是什么，和Dubbo对比呢？

## Dubbo 和 Dubbox 有什么区别？

Dubbox 是继 Dubbo 停止维护后，当当网基于 Dubbo 做的一个扩展项目，如加了服务可 Restful 调用，更新了开源组件等。

## RPC和SOA、SOAP、REST的区别

1、REST

可以看着是HTTP协议的一种直接应用，默认基于JSON作为传输格式,使用简单,学习成本低效率高,但是安全性较低。

2、SOAP

SOAP是一种数据交换协议规范,是一种轻量的、简单的、基于XML的协议的规范。而SOAP可以看着是一个重量级的协议，基于XML、SOAP在安全方面是通过使用XML-Security和XML-Signature两个规范组成了WS-Security来实现安全控制的,当前已经得到了各个厂商的支持 。

它有什么优点？简单总结为：易用、灵活、跨语言、跨平台。

3、SOA

面向服务架构，它可以根据需求通过网络对松散耦合的粗粒度应用组件进行分布式部署、组合和使用。服务层是SOA的基础，可以直接被应用调用，从而有效控制系统中与软件代理交互的人为依赖性。

SOA是一种粗粒度、松耦合服务架构，服务之间通过简单、精确定义接口进行通讯，不涉及底层编程接口和通讯模型。SOA可以看作是B/S模型、XML（标准通用标记语言的子集）/Web Service技术之后的自然延伸。

4、REST 和 SOAP、RPC 有何区别呢?

没什么太大区别，他们的本质都是提供可支持分布式的基础服务，最大的区别在于他们各自的的特点所带来的不同应用场景 。

## 主流RPC框架有哪些

1、RMI

利用java.rmi包实现，基于Java远程方法协议(Java Remote Method Protocol) 和java的原生序列化。

2、Hessian

是一个轻量级的remoting onhttp工具，使用简单的方法提供了RMI的功能。 基于HTTP协议，采用二进制编解码。

3、protobuf-rpc-pro

是一个Java类库，提供了基于 Google 的 Protocol Buffers 协议的远程方法调用的框架。基于 Netty 底层的 NIO 技术。支持 TCP 重用/ keep-alive、SSL加密、RPC 调用取消操作、嵌入式日志等功能。

4、Thrift

是一种可伸缩的跨语言服务的软件框架。它拥有功能强大的代码生成引擎，无缝地支持C + +，C#，Java，Python和PHP和Ruby。thrift允许你定义一个描述文件，描述数据类型和服务接口。依据该文件，编译器方便地生成RPC客户端和服务器通信代码。

最初由facebook开发用做系统内个语言之间的RPC通信，2007年由facebook贡献到apache基金 ，现在是apache下的opensource之一 。支持多种语言之间的RPC方式的通信：php语言client可以构造一个对象，调用相应的服务方法来调用java语言的服务，跨越语言的C/S RPC调用。底层通讯基于SOCKET。

5、Avro

出自Hadoop之父Doug Cutting, 在Thrift已经相当流行的情况下推出Avro的目标不仅是提供一套类似Thrift的通讯中间件,更是要建立一个新的，标准性的云计算的数据交换和存储的Protocol。支持HTTP，TCP两种协议。

6、Dubbo

Dubbo是 阿里巴巴公司开源的一个高性能优秀的服务框架，使得应用可通过高性能的 RPC 实现服务的输出和输入功能，可以和 Spring框架无缝集成。

# Q4：Dubbo 的架构设计？

## 核心组件

![核心组件](https://img-blog.csdnimg.cn/20210511113811583.png)

- Provider：暴露服务的服务提供方

- Consumer：调用远程服务消费方

- Registry：服务注册与发现注册中心

- Monitor：监控中心和访问调用统计

- Container：服务运行容器

## 应用分层

![应用分层](https://img-blog.csdnimg.cn/20210511113812310.png)

Dubbo 框架设计一共划分了 10 个层 :

服务接口层（Service）：该层是与实际业务逻辑相关的，根据服务

提供方和服务消费方的业务设计对应的接口和实现。

配置层（Config）：对外配置接口，以 ServiceConfig 和 ReferenceConfig 为中心。

服务代理层（Proxy）：服务接口透明代理，生成服务的客户端 Stub 和服务器端Skeleton。

服务注册层（Registry）：封装服务地址的注册与发现，以服务 URL 为中心。

集群层（Cluster）：封装多个提供者的路由及负载均衡，并桥接注册中心，以Invoker为中心。

监控层（Monitor）：RPC 调用次数和调用时间监控。

远程调用层（Protocol）：封将 RPC 调用，以 Invocation 和 Result 为中心，扩展接口为Protocol、Invoker 和 Exporter。

信息交换层（Exchange）：封装请求响应模式，同步转异步，以Request和Response为中心。

网络传输层（Transport）：抽象 mina 和 netty 为统一接口，以 Message 为中心。

## PRC 架构组件

一个基本的RPC架构里面应该至少包含以下4个组件：

1、客户端（Client）:服务调用方（服务消费者）

2、客户端存根（Client Stub）:存放服务端地址信息，将客户端的请求参数数据信息打包成网络消息，再通过网络传输发送给服务端

3、服务端存根（Server Stub）:接收客户端发送过来的请求消息并进行解包，然后再调用本地服务进行处理

4、服务端（Server）:服务的真正提供者

![调用流程](https://img-blog.csdnimg.cn/20210511113812928.png)

具体调用过程：

1、服务消费者（client客户端）通过调用本地服务的方式调用需要消费的服务；

2、客户端存根（client stub）接收到调用请求后负责将方法、入参等信息序列化（组装）成能够进行网络传输的消息体；

3、客户端存根（client stub）找到远程的服务地址，并且将消息通过网络发送给服务端；

4、服务端存根（server stub）收到消息后进行解码（反序列化操作）；

5、服务端存根（server stub）根据解码结果调用本地的服务进行相关处理；

6、本地服务执行具体业务逻辑并将处理结果返回给服务端存根（server stub）；

7、服务端存根（server stub）将返回结果重新打包成消息（序列化）并通过网络发送至消费方；

8、客户端存根（client stub）接收到消息，并进行解码（反序列化）；

9、服务消费方得到最终结果；

而RPC框架的实现目标则是将上面的第2-10步完好地封装起来，也就是把调用、编码/解码的过程给封装起来，让用户感觉上像调用本地服务一样的调用远程服务。


# Dubbo 的默认集群容错方案？

FailoverCluster

# Dubbo 使用的是什么通信框架 ?

默认使用 NIO Netty 框架

# Dubbo 的主要应用场景？

透明化的远程方法调用，就像调用本地方法一样调用远程方法，只需简单配置，没有任何API侵入。

软负载均衡及容错机制，可在内网替代F5等硬件负载均衡器，降低成本，减少单点。

服务自动注册与发现，不再需要写死服务提供方地址，注册中心基于接口名查询服务提供者的 IP 地址，并且能够平滑添加或删除服务提供者。

# Dubbo 服务注册与发现的流程？

## 流程说明：

Provider( 提供者 ) 绑定指定端口并启动服务·指供者连接注册中心，并发本机 IP、端口、应用信息和提供服务信息发送至注册中心存储

Consumer( 消费者），连接注册中心，并发送应用信息、所求服务信息至注册中心·注册中心根据消费者所求服务信息匹配对应的提供者列表发送至 Consumer 应用缓存。

Consumer 在发起远程调用时基于缓存的消费者列表择其一发起调用。

Provider 状态变更会实时通知注册中心、在由注册中心实时推送至Consumer

## 设计的原因：

Consumer 与 Provider 解偶，双方都可以横向增减节点数。

注册中心对本身可做对等集群，可动态增减节点，并且任意一台宕掉后，将自动切换到另一台去中心化，双方不直接依懒注册中心，即使注册中心全部宕机短时间内也不会影响服务的调用服务提供者无状态，任意一台宕掉后，不影响使用

# Dubbo 支持哪些协议，每种协议的应用场景，优缺点？

Dubbo： 单一长连接和 NIO 异步通讯，适合大并发小数据量的服务调用，以及消费者远大于提供者。传输协议 TCP，异步 Hessian 序列化。Dubbo推荐使用dubbo协议。

RMI： 采用 JDK 标准的 RMI 协议实现，传输参数和返回参数对象需要实现 Serializable 接口，使用 Java 标准序列化机制，使用阻塞式短连接，传输数据包大小混合，消费者和提供者个数差不多，可传文件，传输协议 TCP。 多个短连接 TCP 协议传输，同步传输，适用常规的远程服务调用和 RMI 互操作。在依赖低版本的 Common-Collections 包，Java 序列化存在安全漏洞。

WebService：基于 WebService 的远程调用协议，集成 CXF 实现，提供和原生 WebService 的互操作。多个短连接，基于 HTTP 传输，同步传输，适用系统集成和跨语言调用。

HTTP： 基于 Http 表单提交的远程调用协议，使用 Spring 的 HttpInvoke 实现。多个短连接，传输协议 HTTP，传入参数大小混合，提供者个数多于消费者，需要给应用程序和浏览器 JS 调用。

Hessian：集成 Hessian 服务，基于 HTTP 通讯，采用 Servlet 暴露服务，Dubbo 内嵌 Jetty 作为服务器时默认实现，提供与 Hession 服务互操作。多个短连接，同步 HTTP 传输，Hessian 序列化，传入参数较大，提供者大于消费者，提供者压力较大，可传文件。

Memcache：基于 Memcache实现的 RPC 协议。

Redis：基于 Redis 实现的RPC协议。


# Dubbo 的核心功能有哪些？

主要就是如下 3 个核心功能：

Remoting：网络通信框架，提供对多种 NIO 框架抽象封装，包括“同步转异步”和“请求 -响应”模式的信息交换方式。

Cluster：服务框架，提供基于接口方法的透明远程过程调用，包括多协议支持，以及软负载均衡，失败容错，地址路由，动态配置等集群支持。

Registry：服务注册，基于注册中心目录服务，使服务消费方能动态的查找服务提供方，使地址透明，使服务提供方可以平滑增加或减少机器。




# 高可用（集群）

## Dubbo 集群的负载均衡有哪些策略

Dubbo 提供了常见的集群策略实现，并预扩展点予以自行实现。

A、 random ：随机算法，是 Dubbo 默认的负载均衡算法。存在服务堆积问题。

B、 roundrobin ：轮询算法。按照设定好的权重依次进行调度。

C、 leastactive ：最少活跃度调度算法。即被调度的次数越少，其优选级就越高，被调度到的机率就越高。

D、 consistenthash ：一致性 hash 算法。对于相同参数的请求，其会被路由到相同的提供者。

## Dubbo 的负载均衡是如何实现的？

无论是 Dubbo 还是 Spring Cloud，负载均衡原理都是相同的。

消费者从注册中心中获取到当前其要消费服务的所有提供者，然后对这些提供者按照指定的负载均衡策略获取到其中的一个提供者，然后进行调用。当调用失败时，会再按照容错机制进行处理。

不同的是，Dubbo 中还可以在负载均衡之前先根据设定好的路由规则对所有可用提供者进行路由，从中筛选掉一部分不符合规则的提供者，对剩余提供者再进行负载均衡。

Dubbo 中默认支持四种负载均衡策略：加权随机策略、加权最小活跃度调度策略、双权重轮询策略，及一致性 hash 策略。

Spring Cloud 一般使用 Ribbon 实现负载均衡，其默认支持五种负载均衡策略：轮询策略、随机策略、重试策略、最可用策略，及可用过滤策略。

## Dubbo 的集群容错方案有哪些？

FailoverCluster：失败自动切换，当出现失败，重试其它服务器。通常用于读操作，但重试会带来更长延迟。

FailfastCluster：快速失败，只发起一次调用，失败立即报错。通常用于非幂等性的写操作，比如新增记录。

FailsafeCluster：失败安全，出现异常时，直接忽略。通常用于写入审计日志等操作。

FailbackCluster：失败自动恢复，后台记录失败请求，定时重发。通常用于消息通知操作。

ForkingCluster：并行调用多个服务器，只要一个成功即返回。通常用于实时性要求较高的读操作，但需要浪费更多服务资源。可通过 forks=”2″来设置最大并行数。

BroadcastCluster：广播调用所有提供者，逐个调用，任意一台报错则报错。通常用于通知所有提供者更新缓存或日志等本地资源信


# 服务治理

## Dubbo telnet 命令能做什么？

dubbo 服务发布之后，我们可以利用 telnet 命令进行调试、管理。Dubbo2.0.5 以上版本服务提供端口支持 telnet 命令

## 为什么需要服务治理？

服务治理是主要针对分布式服务框架的微服务，处理服务调用之间的关系、服务发布和发现、故障监控与处理，服务的参数配置、服务降级和熔断、服务使用率监控等。

原因：

- 过多的服务 URL 配置困难

- 负载均衡分配节点压力过大的情况下也需要部署集群

- 服务依赖混乱，启动顺序不清晰

- 过多服务导致性能指标分析难度较大，需要监控

- 故障定位与排查难度较大

## Dubbo Monitor 实现原理？

Consumer 端在发起调用之前会先走 filter 链；provider 端在接收到请求时也是先走 filter 链，然后才进行真正的业务逻辑处理。

默认情况下，在 consumer 和 provider 的 filter 链中都会有 Monitorfilter。

1、MonitorFilter 向 DubboMonitor 发送数据

2、DubboMonitor 将数据进行聚合后（默认聚合 1min 中的统计数据）暂存到 `ConcurrentMap<Statistics, AtomicReference> statisticsMap`，然后使用一个含有 3 个线程（线程名字：DubboMonitorSendTimer）的线程池每隔 1min 钟，调用 SimpleMonitorService 遍历发送 statisticsMap 中的统计数据，每发送完毕一个，就重置当前的 Statistics 的 AtomicReference

3、SimpleMonitorService 将这些聚合数据塞入 BlockingQueue queue 中（队列大写为 100000）

4、SimpleMonitorService 使用一个后台线程（线程名为：DubboMonitorAsyncWriteLogThread）将 queue 中的数据写入文件（该线程以死循环的形式来写）

5、SimpleMonitorService 还会使用一个含有 1 个线程（线程名字：DubboMonitorTimer）的线程池每隔 5min 钟，将文件中的统计数据画成图表

## 服务上线怎么兼容旧版本？

可以用版本号（version）过渡，多个不同版本的服务注册到注册中心，版本号不同的服务相互间不引用。这个和服务分组的概念有一点类似。

## Dubbo 支持服务降级吗？

以通过 dubbo:reference 中设置 mock=“return null”。mock 的值也可以修改为 true，然后再跟接口同一个路径下实现一个 Mock 类，命名规则是 “接口名称+Mock” 后缀。然后在 Mock 类里实现自己的降级逻辑

## Dubbo 如何优雅停机？

Dubbo 是通过 JDK 的 ShutdownHook 来完成优雅停机的，所以如果使用 `kill -9 PID`  等强制关闭指令，是不会执行优雅停机的，只有通过 `kill PID` 时，才会执行。

# 配置

## Dubbo 配置文件是如何加载到 Spring 中的？

Spring 容器在启动的时候，会读取到 Spring 默认的一些 schema 以及 Dubbo 自定义的 schema，每个 schema 都会对应一个自己的 NamespaceHandler，NamespaceHandler 里面通过 BeanDefinitionParser 来解析配置信息并转化为需要加载的 bean 对象！

## 说说核心的配置有哪些？

| 标签	           | 用途	           | 解释 | 
|:---|:---|:---|
| dubbo:service/	   | 服务配置	   | 用于暴露一个服务，定义服务的元信息，一个服务可以用多个协议暴露，一个服务也可以注册到多个注册中心 | 
| dubbo:reference/	| 引用配置	       | 用于创建一个远程服务代理，一个引用可以指向多个注册中心 | 
| dubbo:protocol/	   | 协议配置	   | 用于配置提供服务的协议信息，协议由提供方指定，消费方被动接受 | 
| dubbo:application/| 应用配置	       | 用于配置当前应用信息，不管该应用是提供者还是消费者 | 
| dubbo:module/	   | 模块配置	       | 用于配置当前模块信息，可选 | 
| dubbo:registry/	   | 注册中心配置	| 用于配置连接注册中心相关信息 | 
| dubbo:monitor/	   | 监控中心配置	| 用于配置连接监控中心相关信息，可选 | 
| dubbo:provider/	   | 提供方配置	   | 当 ProtocolConfig 和 ServiceConfig 某属性没有配置时，采用此缺省值，可选 | 
| dubbo:consumer/	   | 消费方配置	   | 当 ReferenceConfig 某属性没有配置时，采用此缺省值，可选 | 
| dubbo:method/	   | 方法配置	       | 用于 ServiceConfig 和 ReferenceConfig 指定方法级的配置信息 | 
| dubbo:argument/	   | 参数配置	   | 用于指定方法参数配置 | 

# Dubbo 超时时间怎样设置？

Dubbo 超时时间设置有两种方式：

服务提供者端设置超时时间，在 Dubbo 的用户文档中，推荐如果能在服务端多配置就尽量多配置，因为服务提供者比消费者更清楚自己提供的服务特性。

服务消费者端设置超时时间，如果在消费者端设置了超时时间，以消费者端为主，即优先级更高。因为服务调用方设置超时时间控制性更灵活。如果消费方超时，服务端线程不会定制，
会产生警告。

# Dubbo 框架源码最重要的设计原则是什么？从架构设计角度

谈一下你对这个设计原则的理解。

Dubbo 在设计时具有两大设计原则：“微内核 + 插件”的设计模式。

内核只负责组装插件（扩展点），Dubbo 的功能都是由插件实现的，也就是 Dubbo 的所有功能点都可被用户自定义扩展类所替换。

Dubbo 的高扩展性、开放性在这里被充分体现。

采用 URL 作为配置信息的统一格式，所有扩展点都通过传递 URL 携带配置信息。

简单来说就是，在 Dubbo 中，所有重要资源都是以 URL 的形式来描述的。

# 为什么 Dubbo 使用 URL，而不使用 JSON，使用 URL 的好处是什么？

关于这个问题，官方是没有相关说明的，下面我谈两点我个人的看法：

首先，Dubbo 是将 URL 作为公共契约出现的，即希望所有扩展点都要遵守的约定。

既然是约定，那么可以这样约定，也可以那样约定。只要统一就行。所以，在 Dubbo 创建之初，也许当时若采用了 JSON 作为这个约定也是未偿不可的。

其次，单从 JSON 与 URL 相比而言，都是一种简洁的数据存储格式。

但在简洁的同时，URL与Dubbo应用场景的契合度更高些。因为Dubbo中URL的所有应用场景都与通信有关，都会涉及到通信协议、通信主机、端口号、业务接口等信息。

其语义性要强于 JSON，且对于这些数据就无需再给出相应的 key 了，会使传输的数据量更小。

# 请简述一下 Dubbo 四大组件间的关系。

Dubbo 的四大组件为：Consuer、Provider、Registry 与 Monitor。

它们间的关系可以描述为如下几个过程：

start：Dubbo 服务启动，Spring 容器首先会创建服务提供者。

register：服务提供者创建好后，马上会注册到服务注册中心 Registry，这个注册过程称为服务暴露。服务暴露的本质是将服务名称（接口）与服务提供者主机写入到注册中心Registry 的服务映射表中。注册中心充当着“DNS 域名服务器”的角色。

subscribe：服务消费者启动后，首先会向服务注册中心订阅相关服务。

notify：消费者可能订阅的服务在注册中心还没有相应的提供者。当相应的提供者在注册中心注册后，注册中心会马上通知订阅该服务的消费者。但消费者在订阅了指定服务后，在没有收到注册中心的通知之前是不会被阻塞的，而是可以继续订阅其它服务。

invoke：消费者以同步或异步的方式调用提供者提供的请求。消费者通过远程注册中心获取到提供者列表，然后消费者会基于负载均衡算法选一台提供者处理消费者的请求。

count：每个消费者对各个服务的累计调用次数、调用时间；每个提供者被消费者调用的累计次数和时间，消费者与调用者都会定时发送到监控中心，由监控中心记录。这些统计数据可以在 Dubbo 的可视化界面看到。

# SPI

## 什么是 SPI ？请简单描述一下 SPI 要解决的问题。

SPI，Service Provider Interface，服务提供者接口，是一种服务发现机制。

其主要是解决面向抽象编程中上层对下层接口实现类的依赖问题，可以实现这两层间的解耦合。

## JDK 的 SPI 机制存在什么问题？

JDK 的 SPI 机制将所有配置文件中的实现类全部实例化，无论是否能够用到，浪费了宝贵的系统资源。

## 简述 Dubbo 的 Wrapper 机制

Wrapper 机制，即扩展类的包装机制。

就是对扩展类中的 SPI 接口方法进行增强，进行包装，是 AOP 思想的体现，是 Wrapper 设计模式的应用。

一个 SPI 可以包含多个 Wrapper，即可以通过多个 Wrapper 对同一个扩展类进行增强，增强不出现的功能。

Wrapper 机制不是通过注解实现的，而是通过一套 Wrapper 规范实现的。

## Dubbo 的 Wrapper 类是否属于扩展类？

wrapper 类仅仅是对现有的扩展类功能上的增强，并不是一个独立的扩展类，所以其不属于扩展类范畴。

## Dubbo SPI 和 Java SPI 区别？

### JDK SPI：

JDK 标准的 SPI 会一次性加载所有的扩展实现，如果有的扩展很耗时，但也没用上，很浪费资源。

所以只希望加载某个的实现，就不现实了

### DUBBO SPI：

1、 对 Dubbo 进行扩展，不需要改动 Dubbo 的源码

2、 延迟加载，可以一次只加载自己想要加载的扩展实现。

3、 增加了对扩展点 IOC 和 AOP 的支持，一个扩展点可以直接 setter 注入其它扩展点。

4、 Dubbo 的扩展机制能很好的支持第三方 IoC 容器，默认支持 Spring Bean。


# 简述 Dubbo 的 Active 机制

Activate 机制，即扩展类的激活机制。

通过指定的条件来实现一次激活多个扩展类的目的。

激活机制没有增强扩展类，也没有增加扩展类，其仅仅是为原有的扩展类添加了更多的识别标签，而不像之前的，每个扩展类仅有一个“功能性扩展名”识别标签。其是通过 `@Active` 注解实现的。

# Dubbo 的 Activate 类是否属于扩展类？

Activate 机制仅用于为扩展类添加激活标识的，其是通过在扩展类上添加 `@Activate` 注解来实现的，所以 Activate 类本身就是扩展类。

# 注册中心

## 简述 Dubbo 中配置中心与注册中心的关系

Dubbo 中的注册中心是用于完成服务发现的，而配置中心是用于完成配置信息的统一管理的。若没有专门设置配置中心，系统会默认将注册中心服务器作为配置中心服务器。

## Dubbo 的注册中心集群挂掉，发布者和订阅者之间还能通信么？

可以的，启动 dubbo 时，消费者会从 zookeeper 拉取注册的生产者的地址接口等数据，缓存在本地。

每次调用时，按照本地存储的地址进行调用。

## Dubbo 有哪些注册中心？

1、 Multicast 注册中心：Multicast 注册中心不需要任何中心节点，只要广播地址，就能进行服务注册和发现,基于网络中组播传输实现。

2、 Zookeeper 注册中心：基于分布式协调系统 Zookeeper 实现，采用 Zookeeper 的 watch 机制实现数据变更。

3、 Redis 注册中心：基于 Redis 实现，采用 key/map 存储，key 存储服务名和类型，map 中 key 存储服务 url，value 服务过期时间。基于 Redis 的发布/订阅模式通知数据变更。

4、 Simple 注册中心




# Dubbo 内核工作原理的四个构成机制间的关系是怎样的？或者说，一个扩展类实例获取过程是怎样的？

获取一个扩展类实例，一般需要经过这样几个环节：

获取到该 SPI 接口的 ExtensionLoader。而这个获取的过程会将该SPI接口的所有扩展类（四类）加载并缓存。

通过 extensionLoader 获取到其自适应实例。通常 SPI 接口的自适应实例都是由 Adaptive方法自动生成的，所以需要对这个自动生成的 Adaptive 类进行动态编译。

在通过自适应实例调用自适应的业务方法时，才会获取到其真正需要的扩展类实例。所以说，一个扩展类实例一般情况下是在调用自适应方法时才创建。

在获取这个真正的扩展类实例时，首先会根据要获取的扩展类实例的“功能性扩展名”，从扩展类缓存中找到其对应的扩展类，然后调用其无参构造器，创建扩展类实例 instance。

通过 injectExtension(instance) 方法，调用 instance 实例的 setter 完成初始化。遍历所有该 SPI 的 Wrapper，逐层包装这个 setter 过的 instance。

此时的这个 instance，即 wrapper 实例就是我们需要获取的扩展类实例。


# 实现原理

## RPC使用了哪些关键技术，建立通信

首先要解决通讯的问题：即A机器想要调用B机器，首先得建立起通信连接。

主要是通过在客户端和服务器之间建立TCP连接，远程过程调用的所有交换的数据都在这个连接里传输。连接可以是按需连接，调用结束后就断掉，也可以是长连接，多个远程过程调用共享同一个连接。

通常这个连接可以是按需连接（需要调用的时候就先建立连接，调用结束后就立马断掉），也可以是长连接（客户端和服务器建立起连接之后保持长期持有，不管此时有无数据包的发送，可以配合心跳检测机制定期检测建立的连接是否存活有效），多个远程过程调用共享同一个连接。

## RPC使用了哪些关键技术，从调用者的角度看：

服务的调用者启动的时候根据自己订阅的服务向服务注册中心查找服务提供者的地址等信息；

当服务调用者消费的服务上线或者下线的时候，注册中心会告知该服务的调用者；

服务调用者下线的时候，则取消订阅。

## RPC使用了哪些关键技术？

1、动态代理

生成Client Stub（客户端存根）和Server Stub（服务端存根）的时候需要用到Java动态代理技术，可以使用JDK提供的原生的动态代理机制，也可以使用开源的：CGLib代理，Javassist字节码生成技术。

2、序列化和反序列化

在网络中，所有的数据都将会被转化为字节进行传送，所以为了能够使参数对象在网络中进行传输，需要对这些参数进行序列化和反序列化操作。

序列化：把对象转换为字节序列的过程称为对象的序列化，也就是编码的过程。

反序列化：把字节序列恢复为对象的过程称为对象的反序列化，也就是解码的过程。

目前比较高效的开源序列化框架：如Kryo、FastJson和Protobuf等。

3、NIO通信

出于并发性能的考虑，传统的阻塞式 IO 显然不太合适，因此我们需要异步的 IO，即 NIO。Java 提供了 NIO 的解决方案，Java 7 也提供了更优秀的 NIO.2 支持。可以选择Netty或者MINA来解决NIO数据传输的问题。

4、服务注册中心

可选：Redis、Zookeeper、Consul 、Etcd。一般使用ZooKeeper提供服务注册与发现功能，解决单点故障以及分布式部署的问题(注册中心)。


# 使用实战

## 在使用过程中都遇到了些什么问题？

如序列化问题。

比如没有实现序列化接口，报错。

## Dubbo 支持哪些序列化方式？

默认使用 Hessian 序列化，还有 Duddo、FastJson、Java 自带序列化。

## 在使用过程中都遇到了些什么问题？

Dubbo 的设计目的是为了满足高并发小数据量的 rpc 调用，在大数据量下的性能表现并不好，建议使用 rmi 或 http 协议。

# 其他


## Dubbo 支持分布式事务吗？

目前暂时不支持，可与通过 tcc-transaction 框架实现

介绍：tcc-transaction 是开源的 TCC 补偿性分布式事务框架

TCC-Transaction 通过 Dubbo 隐式传参的功能，避免自己对业务代码的入侵。

## Dubbo 可以对结果进行缓存吗？

为了提高数据访问的速度。

Dubbo 提供了声明式缓存，以减少用户加缓存的工作量 `<dubbo:reference cache="true" />`

其实比普通的配置文件就多了一个标签 cache="true"

## Dubbo 必须依赖的包有哪些？

Dubbo 必须依赖 JDK，其他为可选。

## Dubbo 支持哪些序列化方式？

默认使用 Hessian 序列化，还有 Duddo、FastJson、Java 自带序列化。

## Dubbo 在安全方面有哪些措施？

Dubbo 通过 Token 令牌防止用户绕过注册中心直连，然后在注册中心上管理授权。

Dubbo 还提供服务黑白名单，来控制服务所允许的调用方。

# Dubbo 用到哪些设计模式？

Dubbo框架在初始化和通信过程中使用了多种设计模式，可灵活控制类加载、权限控制等功能。

## 工厂模式

Provider在export服务时，会调用ServiceConfig的export方法。ServiceConfig中有个字段：

```java
private static final Protocol protocol = ExtensionLoader.getExtensionLoader(Protocol.class).getAdaptiveExtension();
```

Dubbo里有很多这种代码。这也是一种工厂模式，只是实现类的获取采用了JDK SPI的机制。这么实现的优点是可扩展性强，想要扩展实现，只需要在classpath下增加个文件就可以了，代码零侵入。另外，像上面的Adaptive实现，可以做到调用时动态决定调用哪个实现，但是由于这种实现采用了动态代理，会造成代码调试比较麻烦，需要分析出实际调用的实现类。

## 装饰器模式

Dubbo在启动和调用阶段都大量使用了装饰器模式。

以Provider提供的调用链为例，具体的调用链代码是在ProtocolFilterWrapper的buildInvokerChain完成的，具体是将注解中含有group=provider的Filter实现，按照order排序，最后的调用顺序是：

```
EchoFilter -> ClassLoaderFilter -> GenericFilter -> ContextFilter -> ExecuteLimitFilter -> TraceFilter -> TimeoutFilter -> MonitorFilter -> ExceptionFilter
```

更确切地说，这里是装饰器和责任链模式的混合使用。例如，EchoFilter的作用是判断是否是回声测试请求，是的话直接返回内容，这是一种责任链的体现。而像ClassLoaderFilter则只是在主功能上添加了功能，更改当前线程的ClassLoader，这是典型的装饰器模式。

## 观察者模式

Dubbo的Provider启动时，需要与注册中心交互，先注册自己的服务，再订阅自己的服务，订阅时，采用了观察者模式，开启一个listener。

注册中心会每5秒定时检查是否有服务更新，如果有更新，向该服务的提供者发送一个notify消息，provider接受到notify消息后，即运行NotifyListener的notify方法，执行监听器方法。

## 动态代理模式

Dubbo扩展JDK SPI的类ExtensionLoader的Adaptive实现是典型的动态代理实现。

Dubbo需要灵活地控制实现类，即在调用阶段动态地根据参数决定调用哪个实现类，所以采用先生成代理类的方法，能够做到灵活的调用。

生成代理类的代码是ExtensionLoader的createAdaptiveExtensionClassCode方法。

代理类的主要逻辑是，获取URL参数中指定参数的值作为获取实现类的key。

# 参考资料

[70道Dubbo面试题及答案（最新整理）](https://blog.csdn.net/yanpenglei/article/details/121590388)

[30道Dubbo面试题及答案](https://blog.csdn.net/houhaopi8740/article/details/119103845)

* any list
{:toc}`