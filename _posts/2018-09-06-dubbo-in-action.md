---
layout: post
title:  Dubbo in action
date:  2018-09-06 11:36:05 +0800
categories: [Dubbo]
tags: [in action, dubbo, rpc, apache, sh]
published: true
excerpt: Dubbo 实战，记录 dubbo 中常见的问题总结。
---

记录 dubbo 中常见的问题总结。

# 基础概念

## 手写 dubbo 

[simple rpc](https://houbb.github.io/2018/08/24/simple-rpc)

[dubbo](https://houbb.github.io/2016/09/25/dubbo)

## dubbo 的概念

dubbo是一个分布式框架，远程服务调用的分布式框架，其核心部分包含：

- 集群容错：提供基于接口方法的透明远程过程调用，包括多协议支持，以及软负载均衡，失败容错，地址路由，动态配置等集群支持。

- 远程通讯： 提供对多种基于长连接的NIO框架抽象封装，包括多种线程模型，序列化，以及“请求-响应”模式的信息交换方式。

- 自动发现：基于注册中心目录服务，使服务消费方能动态的查找服务提供方，使地址透明，使服务提供方可以平滑增加或减少机器。

## dubbo 的作用

1. 透明化的远程方法调用，就像调用本地方法一样调用远程方法，只需简单配置，没有任何API侵入。

2. 软负载均衡及容错机制，可在内网替代F5等硬件负载均衡器，降低成本，减少单点。

3. 服务自动注册与发现，不再需要写死服务提供方地址，注册中心基于接口名查询服务提供者的IP地址，并且能够平滑添加或删除服务提供者。

## dubbo 的架构

![architecture](http://dubbo.apache.org/img/architecture.png)

# 远程通讯

## 底层通信框架

默认和推荐使用 [Netty](https://houbb.github.io/2017/11/16/netty)

也可以使用 [Mina](https://houbb.github.io/2017/11/15/apache-mina)

## 序列化

- 默认使用什么序列化框架，你知道的还有哪些？

默认使用 Hessian 序列化

[FastJson 和 GJson](https://houbb.github.io/2018/07/20/json)

## 调用阻塞吗？

默认是阻塞的，可以异步调用，没有返回值的可以这么做。 

## 服务上线怎么不影响旧版本

采用多版本开发，不影响旧版本。

## 如何解决服务调用链过长的问题？

可以结合zipkin实现分布式服务追踪。

# 集群容错

## 集群容错怎么做？

读操作建议使用Failover失败自动切换，默认重试两次其他服务器。

写操作建议使用Failfast快速失败，发一次调用失败就立即报错。 

## 调用超时

dubbo在调用服务不成功时，默认是会重试两次的。

这样在服务端的处理时间超过了设定的超时时间时，就会有重复请求，比如在发邮件时，可能就会发出多份重复邮件，执行注册请求时，就会插入多条重复的注册数据，那么怎么解决超时问题呢？如下

1. 对于核心的服务中心，去除dubbo超时重试机制，并重新评估设置超时时间。

2. 业务处理代码必须放在服务端，客户端只做参数验证和服务调用，不涉及业务流程处理。

- 全局配置实例

```xml
<dubbo:provider delay="-1" timeout="6000" retries="0"/>  
```

当然Dubbo的重试机制其实是非常好的QOS保证，它的路由机制，是会帮你把超时的请求路由到其他机器上，而不是本机尝试，所以 dubbo的重试机器也能一定程度的保证服务的质量。

但是请一定要综合线上的访问情况，给出综合的评估。

## 负载均衡

Dubbo提供了常见的集群策略实现，并预扩展点予以自行实现。

- Random LoadBalance: 随机选取提供者策略，有利于动态调整提供者权重。截面碰撞率高，调用次数越多，分布越均匀；

- RoundRobin LoadBalance: 轮循选取提供者策略，平均分布，但是存在请求累积的问题；

- LeastActive LoadBalance: 最少活跃调用策略，解决慢提供者接收更少的请求；

- ConstantHash LoadBalance: 一致性Hash策略，使相同参数请求总是发到同一提供者，一台机器宕机，可以基于虚拟节点，
分摊至其他提供者，避免引起提供者的剧烈变动；


# 自动发现

## 注册中心

- 一般使用什么注册中心？还有别的选择吗？

推荐使用zookeeper注册中心，还有redis等不推荐。 

## 服务提供者能实现失效踢出是什么原理？

服务失效踢出基于zookeeper的临时节点原理。 

# 常见配置

## 核心配置有哪些？

核心配置有 

```
dubbo:service/ dubbo:reference/ dubbo:protocol/ dubbo:registry/ dubbo:application/ dubbo:provider/ dubbo:consumer/ dubbo:method/
```

## 测试和生产公用一套zookeeper，怎么保证消费不冲突

- consumer.xml

```xml
<dubbo:reference id="comm1" timeout="100000" interface="com.acq.facade.CommService" group="comm102" version="1.0.0" retries="0" check="false">
</dubbo:reference>

<dubbo:reference id="comm2" timeout="100000" interface="com.acq.facade.CommService" group="comm103" version="1.0.0" retries="0" check="false">
</dubbo:reference>
```

## 同一个服务多个注册的情况下可以直连某一个服务吗？

可以直连，修改配置即可，也可以通过telnet直接某个服务。 

# dubbo 协议

推荐并且默认使用 dubbo 协议。 

## dubbo

单一长连接和NIO异步通讯，适合大并发小数据量的服务调用，以及消费者远大于提供者。传输协议TCP，异步，Hessian序列化；

## rmi

采用JDK标准的rmi协议实现，传输参数和返回参数对象需要实现Serializable接口，使用java标准序列化机制，使用阻塞式短连接，传输数据包大小混合，消费者和提供者个数差不多，可传文件，传输协议TCP。 多个短连接，TCP协议传输，同步传输，适用常规的远程服务调用和rmi互操作。在依赖低版本的Common-Collections包，java序列化存在安全漏洞；

## webservice

基于WebService的远程调用协议，集成CXF实现，提供和原生WebService的互操作。多个短连接，基于HTTP传输，同步传输，适用系统集成和跨语言调用；http： 基于Http表单提交的远程调用协议，使用Spring的HttpInvoke实现。多个短连接，传输协议HTTP，传入参数大小混合，提供者个数多于消费者，需要给应用程序和浏览器JS调用；

## hessian

集成Hessian服务，基于HTTP通讯，采用Servlet暴露服务，Dubbo内嵌Jetty作为服务器时默认实现，提供与Hession服务互操作。多个短连接，同步HTTP传输，Hessian序列化，传入参数较大，提供者大于消费者，提供者压力较大，可传文件；

## memcache

基于memcached实现的RPC协议

## redis

基于redis实现的RPC协议

# 类似框架

## dubbox

[dubbox](https://github.com/dangdangdotcom/dubbox) 是当当网基于 dubbo 上做了一些扩展，如加了服务可 restful 调用，更新了开源组件等。

- 支持REST风格远程调用（HTTP + JSON/XML)

基于非常成熟的JBoss RestEasy框架，在dubbo中实现了REST风格（HTTP + JSON/XML）的远程调用，以显著简化企业内部的跨语言交互，同时显著简化企业对外的Open API、无线API甚至AJAX服务端等等的开发。事实上，这个REST调用也使得Dubbo可以对当今特别流行的“微服务”架构提供基础性支持。 另外，REST调用也达到了比较高的性能，在基准测试下，HTTP + JSON与Dubbo 2.x默认的RPC协议（即TCP + Hessian2二进制序列化）之间只有1.5倍左右的差距，详见文档中的基准测试报告。

- 支持基于Kryo和FST的Java高效序列化实现

基于当今比较知名的Kryo和FST高性能序列化库，为Dubbo默认的RPC协议添加新的序列化实现，并优化调整了其序列化体系，比较显著的提高了Dubbo RPC的性能，详见文档中的基准测试报告。

- 支持基于Jackson的JSON序列化

基于业界应用最广泛的Jackson序列化库，为Dubbo默认的RPC协议添加新的JSON序列化实现。

- 支持基于嵌入式Tomcat的HTTP remoting体系

基于嵌入式tomcat实现dubbo的HTTP remoting体系（即dubbo-remoting-http），用以逐步取代Dubbo中旧版本的嵌入式Jetty，可以显著的提高REST等的远程调用性能，并将Servlet API的支持从2.5升级到3.1。（注：除了REST，dubbo中的WebServices、Hessian、HTTP Invoker等协议都基于这个HTTP remoting体系）。

- 升级Spring

将dubbo中Spring由2.x升级到目前最常用的3.x版本，减少版本冲突带来的麻烦。

- 升级ZooKeeper客户端

将dubbo中的zookeeper客户端升级到最新的版本，以修正老版本中包含的bug。

- 支持完全基于Java代码的Dubbo配置

基于Spring的Java Config，实现完全无XML的纯Java代码方式来配置dubbo

- 调整Demo应用

暂时将dubbo的demo应用调整并改写以主要演示REST功能、Dubbo协议的新序列化方式、基于Java代码的Spring配置等等。

- 修正了dubbo的bug 包括配置、序列化、管理界面等等的bug。

注：dubbox和dubbo 2.x是兼容的，没有改变dubbo的任何已有的功能和配置方式（除了升级了spring之类的版本）

## 其他类似框架

[spring cloud](https://houbb.github.io/2018/09/06/spring-cloud)

[gRpc](https://grpc.io/)

[thrift](https://thrift.apache.org/)

[finagle](https://twitter.github.io/finagle/)

# 在使用过程中都遇到了些什么问题？

## properties 不生效

同时配置了XML和properties文件，则properties中的配置无效

只有 XML 没有配置时，properties 才生效。

## 循环依赖

dubbo缺省会在启动时检查依赖是否可用，不可用就抛出异常，阻止spring初始化完成，check属性默认为true。

测试时有些服务不关心或者出现了循环依赖，将check设置为false

## 注册问题

为了方便开发测试，线下有一个所有服务可用的注册中心，这时，如果有一个正在开发中的服务提供者注册，可能会影响消费者不能正常运行。

解决：让服务提供者开发方，只订阅服务，而不注册正在开发的服务，通过直连测试正在开发的服务。

设置dubbo:registry标签的register属性为false。

## spring 2.x 初始化死锁问题

在spring解析到dubbo:service时，就已经向外暴露了服务，而spring还在接着初始化其他bean，如果这时有请求进来，并且服务的实现类里有调用applicationContext.getBean()的用法。getBean线程和spring初始化线程的锁的顺序不一样，导致了线程死锁，不能提供服务，启动不了。

解决：不要在服务的实现类中使用applicationContext.getBean();

如果不想依赖配置顺序，可以将dubbo:provider的deplay属性设置为-1，使dubbo在容器初始化完成后再暴露服务。

## 服务注册不上

1. 检查dubbo的jar包有没有在classpath中，以及有没有重复的jar包

2. 检查暴露服务的spring配置有没有加载

3. 在服务提供者机器上测试与注册中心的网络是否通

## 出现RpcException: No provider available for remote service异常

表示没有可用的服务提供者，

1). 检查连接的注册中心是否正确

2). 到注册中心查看相应的服务提供者是否存在

3). 检查服务提供者是否正常运行

## 出现”消息发送失败”异常

通常是接口方法的传入传出参数未实现 `Serializable` 接口。

* any list
{:toc}