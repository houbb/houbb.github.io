---
layout: post
title: 性能测试到底应该怎么做？
date: 2021-07-23 21:01:55 +0800
categories: [Test]
tags: [test, junit, sh]
published: true
---

# 三高人群

作为一名开发者，我们最常听到的就是编程界的三高：

高性能、高并发、高可用。

听起来非常高大上，但是性能到底如何呢？又该如何评定呢？

这次我们谈一谈性能测试，看一看到底什么样才叫做高性能。

本文主要从以下几个方面进行讨论。

（1）性能测试是什么？

（2）为什么需要性能测试？

（3）性能测试如何做？

（4）有哪些性能测试的工具

# 性能测试是什么？

老马曾经说过，你想理解一件事物，首先必须先定义它。

这里直接引用一下百科中的定义：

> 性能测试是通过自动化的测试工具模拟多种正常、峰值以及异常负载条件来对系统的各项性能指标进行测试。

性能测试的定义也不难理解，往往定义本身阐述了性能测试的作用。

# 为什么需要性能测试？

如果你是一名开发、测试，平时接手过不少需求，可能性能测试接触的也不多。

每一个需求，都有对应的功能性需求和肺功能性需求。

功能性需求是产品需求文档中最直接的，需要实现的功能目标。简称，能用就行。

非功能性需求则要宽泛的多，架构设计是否合理？是否便于后期拓展？是否便于监控？代码实现是否优雅？文档注释是否完整？

就像你写了一只鸟，鸟头做螺旋桨非能飞起来，但是在架构设计上可能是不合理的。

![飞起来](https://img-blog.csdnimg.cn/463f331c132d434eb6cc0656960c3961.jpg)

一个查询功能，用户点击查询，10S 种才返回数据，功能上是满足的，但是性能上是不能接受的。

线上的交易功能平时各方面都很棒，节假日高峰期直接系统就瘫痪了。

那如何避免这些问题出现在生产上呢？

这就需要上线之前，首先做好对应的性能测试，避免再生产上出现问题，带来严重的生产事故。

性能要高，性能要硬，性能测试，又高又硬！

![又高又硬](https://img-blog.csdnimg.cn/bf5fce0de3a9450782dcadb5cba0adf5.jpg)

# 如何做好性能测试

做一件事情之前，我们首先要确定好自己的目标。

性能测试，到底要测试什么？

有些类似于开发过程中的需求分析，常见的测试指标如下。

## 测试指标

### 响应时间

响应时间是指某个请求或操作从发出到接收到反馈所消耗的时间，包括应用服务器（客户端）处理时间、网络传输时间以及数据库服务器处理时间。

作为用户而言，在页面点击查询，等待了多久才能获取结果，这个就是响应时间。

用户不关心你后端经过了多少个服务，慢就是原罪。

对于微服务系统，链路监控就显得比较重要。可以帮助我们快速定位到底慢在哪里。

### TPS/QPS

TPS（Transaction Per Second）是指单位时间（每秒）系统处理的事务量。

我看网上还有很多类似的概念：点击量/点击率、吞吐量/吞吐率、PV/UV，这里不做赘述。

个人看来本质上 TPS/QPS 就是去压测你应用的极限，当访问量较大的时候，程序能否活下来？

这里主要涉及到两个概念：高性能和高可用。

我们后面会简单讨论下这两点。

## 测试准备

明确了测试指标之后，就需要进行测试的准备。

环境准备：比如你想压测数据库，那就需要准备对应配置的数据库资源。

脚本的准备：数据初始化脚本，调用脚本等。

这个可以类比开发过程中的代码开发。

ps: 性能压测一般不是很常用，所以环境准备流程会比较长，这一点需要注意。

## 测试报告

当进行测试之后，测试的结果一定要给出一份报告出来。

是否通过压测要求？

最高的 QPS 是多少？

这样开发可以根据这份报告进行相应的优化。

# 如何提升程序性能

提升性能的内容写一本书也不为过，这里简单罗列一些最常用的几点：

（1）慢 SQL

一般程序如果响应时间较长，可以首先看一下慢 SQL。

看下是否需要增加索引，或者进行 SQL 优化。

（2）缓存

针对查询，性能提升最显著的就是引入缓存。

当然，引入缓存会使架构变得复杂，这一点要结合自己的实际业务。

（3）硬件升级

如果程序优化的空间比较小，可以考虑升级一下硬件资源。

比如服务器配置翻倍，数据库配置翻倍。

什么？你说公司没钱升级？

没钱升级做什么压测？

这个时候测试报告的作用就显露了，直接用数据说话。

直接说 QPS 达不到生产要求，程序优化的空间很小，推荐硬件升级配置，升级到多少。

做人，要以德服人。

做测试，要用数据说话。

![以德服人](https://img-blog.csdnimg.cn/0e3b5722771241d09a2f970ee284e445.jpg)

# 常用的性能测试工具

测试最常用的工具当属 jmeter。

除此之外，还有一些其他的工具：

LoadRunner、QALoad、SilkPerformer和Rational Performance Tester。

下面对几个工具做下简单介绍

## jmeter

Apache JMeter 可以用于测试静态和动态资源(Web动态应用程序)的性能。 

它可以用于模拟服务器、服务器组、网络或对象上的负载，以测试其强度或分析不同负载类型下的总体性能。

## LoadRunner

将负载测试集成到开发工具中:IDE、jUnit、nUnit、Jenkins、Selenium和Microsoft Visual Studio。 

从12.55版本开始，您可以运行您的JMeter脚本，并在任何性能测试中集成JMeter和附加的脚本类型。

ps: 这个设计理念就非常好，可以和成熟的工具进行整合。站在巨人的肩膀上。

## QALoad

QALoad是客户/服务器系统、企业资源配置（ERP）和电子商务应用的自动化负载测试工具。

QALoad可以模拟成百上千的用户并发执行关键业务而完成对应用程序的测试，并针对所发现问题对系统性能进行优化，确保应用的成功部署。

ps: 这个工具本人没有接触过。

## SilkPerformer

SilkPerformerV可以让你在使用前，就能够预测企业电子商务环境的行为—不受电子商务应用规模和复杂性影响。

可视化的用户化、负载条件下可视化的内容校验、实时的性能监视和强大的管理报告可以帮助您迅速将问题隔离，这样，通过最小化测试周期、优化性能以及确保可伸缩性，加快了投入市场的时间，并保证了系统的可靠性。

## Rational Performance Tester

作为 DevOps 方法的一部分，IBM Rational Performance Tester 帮助软件测试团队更早、更频繁地进行测试。 

它验证 Web 和服务器应用程序的可扩展性，确定系统性能瓶颈的存在和原因，并减少负载测试。 

您的软件测试团队可以快速执行性能测试，分析负载对应用程序的影响。

ps: 这一款工具有 IBM 提供，质量值得信赖。

# 为开发量身定做的性能测试工具

这么多工具可供使用，相信读到这里的小伙伴已经找到了自己心仪的测试工具。

别急，下面专门为做 java 开发的小伙伴们推荐一款性能测试工具。

男人有男人的浪漫，开发者当然也要有开发者的浪漫。

【男人的浪.jpg】

## junitperf

作为一名开发者，老马平时单元测试使用 junit 最多。

所以一直希望找到一款基于 junit 的性能压测工具，后来也确实找到了。

> [https://github.com/houbb/junitperf](https://github.com/houbb/junitperf) 是一款为 java 开发者设计的性能测试框架。

## 为什么使用?

- 可以和 Junit5 完美契合。

- 使用简单，便于项目开发过程中的测试实用。

- 提供拓展，用户可进行自定义开发。

## 特性

- 支持 I18N

- 支持多种报告生成方式，支持自定义

- Junt5 完美支持，便于 Java 开发者使用

## 使用入门

### maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>junitperf</artifactId>
    <version>2.0.7</version>
</dependency>
```

### 入门例子

```java
@JunitPerfConfig(duration = 1000)
public void helloTest() throws InterruptedException {
    Thread.sleep(100);
    System.out.println("Hello Junit5");
}
```

### 注解说明

`@JunitPerfConfig` 指定测试时的属性配置。(必填项)

| 属性 | 说明 | 类型 | 默认值 | 备注 |
|:----|:----|:----|:----|:----|
| threads | 执行时使用多少线程执行 | int | 1 | |
| warmUp | 准备时间 | long | 0 | 单位：毫秒 |
| duration | 执行时间 | long | 60_000(1分钟) | 单位：毫秒 |
| latencyStatistics | 统计实现 | StatisticsCalculator | DefaultStatisticsCalculator |  |
| reporter | 报告实现 | Reporter | ConsoleReporter |  |

使用如下：

```java
/**
 * 2个线程运行。
 * 准备时间：1000ms
 * 运行时间: 2000ms
 * @throws InterruptedException if any
 */
@JunitPerfConfig(threads = 2, warmUp = 1000, duration = 2000)
public void junitPerfConfigTest() throws InterruptedException {
    System.out.println("junitPerfConfigTest");
    Thread.sleep(200);
}
```

`@JunitPerfRequire` 指定测试时需要达到的要求。(选填项)

| 属性 | 说明 | 类型 | 默认值 | 备注 |
|:----|:----|:----|:----|:----|
| min | 最佳的运行耗时 | float | -1 | 最快的运行耗时如果高于这个值，则视为失败。单位：毫秒 |
| max | 平均的运行耗时 | float | -1 | 最坏的运行耗时如果高于这个值，则视为失败。单位：毫秒 |
| average | 平均的运行耗时 | float | -1 | 平均的运行耗时如果高于这个值，则视为失败。单位：毫秒 |
| timesPerSecond | 每秒的最小执行次数 | int | 0 | 如果低于这个最小执行次数，则视为失败。 |
| percentiles | 对于执行耗时的限定 | String[] | {} | percentiles={"20:220", "30:250"}。20% 的数据执行耗时不得超过 220ms;30% 的数据执行耗时不得超过 250ms; |

使用如下：

```java
/**
 * 配置：2个线程运行。准备时间：1000ms。运行时间: 2000ms。
 * 要求：最快不可低于 210ms, 最慢不得低于 250ms, 平均不得低于 225ms, 每秒运行次数不得低于 4 次。
 * 20% 的数据不低于 220ms, 50% 的数据不得低于 230ms;
 *
 * @throws InterruptedException if any
 */
@JunitPerfConfig(threads = 2, warmUp = 1000, duration = 2000)
@JunitPerfRequire(min = 210, max = 250, average = 225, timesPerSecond = 4, percentiles = {"20:220", "50:230"})
public void junitPerfConfigTest() throws InterruptedException {
    System.out.println("junitPerfConfigTest");
    Thread.sleep(200);
}
```

## 测试报告

对应的测试报告生成方式也是多样的，也允许用户自定义。

基于控台日志：

```
[INFO] [2020-06-16 20:05:53.618] [c.g.h.j.e.HelloWorldTest.helloTest] - Started at:  2020-06-16 20:05:52.512
[INFO] [2020-06-16 20:05:53.619] [c.g.h.j.e.HelloWorldTest.helloTest] - Invocations:  9
[INFO] [2020-06-16 20:05:53.620] [c.g.h.j.e.HelloWorldTest.helloTest] - Success:  9
[INFO] [2020-06-16 20:05:53.620] [c.g.h.j.e.HelloWorldTest.helloTest] - Errors:  0
[INFO] [2020-06-16 20:05:53.621] [c.g.h.j.e.HelloWorldTest.helloTest] - Thread Count:  1
[INFO] [2020-06-16 20:05:53.623] [c.g.h.j.e.HelloWorldTest.helloTest] - Warm up:  0ms
[INFO] [2020-06-16 20:05:53.623] [c.g.h.j.e.HelloWorldTest.helloTest] - Execution time:  1000ms
[INFO] [2020-06-16 20:05:53.624] [c.g.h.j.e.HelloWorldTest.helloTest] - Throughput:  9/s (Required: -1/s) - PASSED
[INFO] [2020-06-16 20:05:53.625] [c.g.h.j.e.HelloWorldTest.helloTest] - Memory cost:  16byte
[INFO] [2020-06-16 20:05:53.635] [c.g.h.j.e.HelloWorldTest.helloTest] - Min latency:  100.191414ms (Required: -1.0ms) - PASSED
[INFO] [2020-06-16 20:05:53.635] [c.g.h.j.e.HelloWorldTest.helloTest] - Max latency:  105.2382ms (Required: -1.0ms) - PASSED
[INFO] [2020-06-16 20:05:53.636] [c.g.h.j.e.HelloWorldTest.helloTest] - Avg latency:  101.43268ms (Required: -1.0ms) - PASSED
```

或者基于 HTML:

![junitperf](https://img-blog.csdnimg.cn/b55cae629d514c61a9826940c4a8d53e.png)

# 小结

本文对性能测试做了最基本的介绍，让小伙伴们对性能压测有一个最基本的理解。

测试和开发一样，都是一件费时费力，而且需要认真做才能做好的事情，其中的学问不是一篇就能说清的。

性能测试工具也比较多，本文重点介绍了专门为 java 开发者打造的 junitperf 工具。

下一节我们将从源码角度，讲解一下 junitperf 的实现原理。

我是老马，期待与你的下次重逢。

开源地址：[https://github.com/houbb/junitperf](https://github.com/houbb/junitperf)

# 参考资料

[聊聊API网关的作用](https://www.cnblogs.com/coolfiry/p/8193768.html)

[性能测试](https://baike.baidu.com/item/%E6%80%A7%E8%83%BD%E6%B5%8B%E8%AF%95/1916148)

https://blog.csdn.net/u012111923/article/details/80705141

* any list
{:toc}