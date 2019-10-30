---
layout: post
title: 监控-skyworking
date:  2019-4-1 19:24:57 +0800
categories: [APM]
tags: [monitor, apm, sf]
published: true
---


# 前言

随着业务越来越复杂，企业应用也进入了分布式服务化的阶段，传统的日志监控等方式无法很好达到跟踪调用，排查问题等需求。

在谷歌论文《Dapper，大规模分布式系统的跟踪系统》的指导下，许多优秀的APM应运而生。

分布式追踪系统发展很快，种类繁多，给我们带来很大的方便。

但在数据采集过程中，有时需要侵入用户代码，并且不同系统的 API 并不兼容，这就导致了如果您希望切换追踪系统，往往会带来较大改动。

## 规范的诞生

OpenTracing 为了解决不同的分布式追踪系统 API 不兼容的问题，诞生了 OpenTracing 规范。

OpenTracing 是一个轻量级的标准化层，它位于应用程序/类库和追踪或日志分析程序之间。

详细介绍见 opentracing 文档中文版。

本文要介绍的就是国人吴晟基于OpenTracking实现的开源项目skywalking。

# skywalking简介

针对分布式系统的APM（应用性能监控）系统，特别针对微服务、cloud native和容器化(Docker, Kubernetes, Mesos)架构， 其核心是个分布式追踪系统。

## 特点

### 性能好

针对单实例5000tps的应用，在全量采集的情况下，只增加 10% 的CPU开销。详细评测见《skywalking agent performance test》。

### 支持多语言探针

### 支持自动及手动探针

自动探针：Java支持的中间件、框架与类库列表

手动探针：OpenTrackingApi、@Trace 注解、trackId 集成到日志中。

# 架构

![skyworking-struct](https://user-gold-cdn.xitu.io/2018/3/27/16264f8fd90b58fa?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

# 技术

## Java Agent

Java agent是用一个简单的jar文件来表示的。

跟普通的Java程序很相似，Java agent定义了一些类作为入口点。 

这些作为入口点的类需要包含一个静态方法，这些方法会在你原本的Java程序的main方法调用之前被调用：

```java
class MyAgent {
  public static void premain(String args, Instrumentation inst) {
    // implement agent here ...
  }
}
```


关于处理Java agent时最有趣的部分，是premain方法中的第二个参数。

这个参数是以一个Instrumentation接口的实现类实例的形式存在的。

这个接口提供了一种机制，能够通过定义一个ClassFileTransformer，来干预对Java类的加载过程。
 
有了这种转设施，我们就能够在 Java 类被使用之前，去实现对类逻辑的强化。

在最基本的用例中，Java agent会用来设置应用属性或者配置特定的环境状态，agent能够作为可重用和可插入的组件。

如下的样例描述了这样的一个agent，它设置了一个系统属性，在实际的程序中就可以使用该属性了：

```java
public class Agent {
  public static void premain(String arg) {
    System.setProperty("my-property", “foo”);
  }
}
```

如果要使用这个agent，必须要将agent类和资源打包到jar中，并且在jar的manifest中要将Agent-Class属性设置为包含premain方法的agent类。

（agent必须要打包到jar文件中，它不能通过拆解的格式进行指定。）

接下来，我们需要启动应用程序，并且在命令行中通过javaagent参数来引用jar文件的位置：

```java
java -javaagent:myAgent.jar -jar myProgram.jar
```

我们还可以在位置路径上设置可选的agent参数。

在下面的命令中会启动一个Java程序并且添加给定的agent，将值myOptions作为参数提供给premain方法：

```java
java -javaagent:myAgent.jar=myOptions -jar myProgram.jar
```

通过重复使用javaagent命令，能够添加多个agent。

但是，Java agent的功能并不局限于修改应用程序环境的状态，Java agent能够访问Java instrumentation API，这样的话，agent就能修改目标应用程序的代码。Java虚拟机中这个鲜为人知的特性提供了一个强大的工具，有助于实现面向切面的编程。

如果要对Java程序进行这种修改，我们需要在agent的premain方法上添加类型为Instrumentation的第二个参数。

Instrumentation参数可以用来执行一系列的任务，比如确定对象以字节为单位的精确大小以及通过注册ClassFileTransformers实际修改类的实现。

ClassFileTransformers注册之后，当类加载器（class loader）加载类的时候都会调用它。

当它被调用时，在类文件所代表的类加载之前，类文件transformer有机会改变或完全替换这个类文件。

按照这种方式，在类使用之前，我们能够增强或修改类的行为，如下面的样例所示：

```java
public class Agent {
 public static void premain(String argument, Instrumentation inst) {
   inst.addTransformer(new ClassFileTransformer() {
     @Override
     public byte[] transform(
       ClassLoader loader,
       String className,
       Class<?> classBeingRedefined, // 如果类之前没有加载的话，值为null
       ProtectionDomain protectionDomain,
       byte[] classFileBuffer) {
       // 返回改变后的类文件。
     }
   });
 }
}
```

通过使用Instrumentation实例注册上述的ClassFileTransformer之后，每个类加载的时候，都会调用这个transformer。

为了实现这一点，transformer会接受一个二进制和类加载器的引用，分别代表了类文件以及试图加载类的类加载器。

Java agent也可以在Java应用的运行期注册，如果是在这种场景下，instrumentation API允许重新定义已加载的类，这个特性被称之为“HotSwap”。

不过，重新定义类仅限于替换方法体。

在重新定义类的时候，不能新增或移除类成员，并且类型和签名也不能进行修改。

当类第一次加载的时候，并没有这种限制，如果是在这样的场景下，那classBeingRedefined会被设置为null。

# Byte Buddy

Byte Buddy是开源的、基于Apache 2.0许可证的库，它致力于解决字节码操作和instrumentation API的复杂性。

Byte Buddy所声称的目标是将显式的字节码操作隐藏在一个类型安全的领域特定语言背后。

通过使用Byte Buddy，任何熟悉Java编程语言的人都有望非常容易地进行字节码操作。

作为Byte Buddy的简介，如下的样例展现了如何生成一个简单的类，这个类是Object的子类，并且重写了toString方法，用来返回“Hello World!”。

与原始的ASM类似，“intercept”会告诉Byte Buddy为拦截到的指令提供方法实现：

```java
Class<?> dynamicType = new ByteBuddy()
  .subclass(Object.class)
  .method(ElementMatchers.named("toString"))
  .intercept(FixedValue.value("Hello World!"))
  .make()
  .load(getClass().getClassLoader(),          
        ClassLoadingStrategy.Default.WRAPPER)
  .getLoaded();
```



# 拓展阅读

## APM 开源框架

[cat](https://houbb.github.io/2016/12/16/cat)

[google-dapper](https://houbb.github.io/2019/01/16/google-dapper)

[zipkin](https://houbb.github.io/2018/11/25/zipkin)

[trace system](https://houbb.github.io/2019/01/16/trace-system)

## 其他

[opentracing-io 中文文档](https://wu-sheng.gitbooks.io/opentracing-io/content/)

# 参考资料

[skywalking 学习笔记](https://juejin.im/post/5ab5b0e26fb9a028e25d7fcb)

[Instrumentation 新功能](https://www.ibm.com/developerworks/cn/java/j-lo-jse61/index.html)

[skywalking源码分析之javaAgent工具ByteBuddy的应用](http://www.kailing.pub/article/index/arcid/178.html)

[芋道源码-SkyWalking](http://www.iocoder.cn/categories/SkyWalking/)

* any list
{:toc}