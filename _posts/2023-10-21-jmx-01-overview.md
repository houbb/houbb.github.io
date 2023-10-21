---
layout: post
title:  JMX-01-jmx 介绍及入门案例
date:  2021-10-21 13:41:43 +0800
categories: [Java]
tags: [java, jmx, monitor]
published: true
---


# JMX

[JMX](http://www.oracle.com/technetwork/java/javase/tech/javamanagement-140525.html)（Java Management Extensions）技术提供了构建分布式、基于Web的、模块化和动态解决方案的工具，用于管理和监控设备、应用程序和服务驱动的网络。

按设计，这个标准适用于适应传统系统，实施新的管理和监控解决方案，并与未来的系统进行对接。

## 拓展阅读

[Log4j2-15-JMX](https://houbb.github.io/2016/05/21/Log4j2-15-jmx)

[ZooKeeper-09-JMX](https://houbb.github.io/2016/09/25/zookeeper-09-jmx)

[JVM核心技术32讲（完）-12JMX与相关工具：山高月小，水落石出](https://houbb.github.io/2015/01/01/JVM%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF32%E8%AE%B2-%E5%AE%8C-12JMX%E4%B8%8E%E7%9B%B8%E5%85%B3%E5%B7%A5%E5%85%B7-%E5%B1%B1%E9%AB%98%E6%9C%88%E5%B0%8F-%E6%B0%B4%E8%90%BD%E7%9F%B3%E5%87%BA)

# 缘起

最近想写一个系统监控系统。(运行状况，调用次数，调用时间等信息)

有一些简单的思路：

- mq 推送给另一个 server

- mina/netty 长连接
 
同事有提及这项技术，就做简单了解，学习一下。

# 基础概念

## 术语

基础概念，了解知悉即可。忘了就查一下。

- MBean

是 Managed Bean 的简称，可以翻译为“管理构件”。

在 JMX 中 MBean 代表一个被管理的资源实例，通过 MBean 中暴露的方法和属性，外界可以获取被管理的资源的状态和操纵 MBean 的行为。

事实上，MBean就是一个Java Object，同JavaBean模型一样，外界使用自醒和反射来获取Object的值和调用Object的方法，只是MBean更为复杂和高级一些。

MBean通过公共方法以及遵从特定的设计模式封装了属性和操作，以便暴露给管理应用程序。

例如，一个只读属性在管理构件中只有Get方法，既有Get又有Set方法表示是一个可读写的属性。

一共有四种类型的MBean: Standard MBean, Dynamic MBean, Open MBean, Model MBean。


- MBeanServer

MBean生存在一个MBeanServer中。MBeanServer管理这些MBean，并且代理外界对它们的访问。并且MBeanServer提供了一种注册机制，是的外界可以通过名字来得到相应的MBean实例。


- JMX Agent

Agent只是一个Java进程，它包括这个MBeanServer和一系列附加的MbeanService。当然这些Service也是通过MBean的形式来发布。

- Protocol Adapters and Connectors

MBeanServer依赖于Protocol Adapters和Connectors来和运行该代理的Java虚拟机之外的管理应用程序进行通信。Protocol Adapters通过特定的协议提供了一张注册在MBeanServer的MBean的视图。

例如，一个HTML Adapter可以将所有注册过的MBean显示在Web 页面上。不同的协议，提供不同的视图。Connectors还必须提供管理应用一方的接口以使代理和管理应用程序进行通信，
即针对不同的协议，Connectors必须提供同样的远程接口来封装通信过程。当远程应用程序使用这个接口时，就可以通过网络透明的和代理进行交互，而忽略协议本身。
Adapters和Connectors使MBean服务器与管理应用程序能进行通信。因此，一个代理要被管理，它必须提供至少一个Protocol Adapter或者Connector。
面临多种管理应用时，代理可以包含各种不同的Protocol Adapters和Connectors。
当前已经实现和将要实现的Protocol Adapters和Connectors包括： RMI Connector, SNMP Adapter, IIOP Adapter, HTML Adapter, HTTP Connector.


> Adapter & Connector

Adapter是使用某种Internet协议来与JMX Agent获得联系，Agent端会有一个对象 (Adapter)来处理有关协议的细节。

比如SNMP Adapter和HTTP Adapter。而Connector则是使用类似RPC的方式来访问Agent，在Agent端和客户端都必须有这样一个对象来处理相应的请求与应答。

比如RMI Connector。

JMX Agent可以带有**任意多个** Adapter，因此可以使用多种不同的方式访问 Agent。

## 设计架构

![2017-11-18-java-jmx-struct.png]({{ site.utl }}/static/app/img/java/jmx/2017-11-18-java-jmx-struct.png)

JMX分为三层，分别负责处理不同的事务。它们分别是：

- Instrumentation

Instrumentation层主要包括了一系列的接口定义和描述如何开发MBean的规范。通常JMX所管理的资源有一个或多个MBean组成，因此这个资源可以是任何由Java语言开发的组件，或是一个JavaWrapper包装的其他语言开发的资源。

- Agent 

Agent 用来管理相应的资源，并且为远端用户提供访问的接口。Agent层构建在Intrumentation层之上，并且使用并管理 Instrumentation层内部描述的组件。
Agent层主要定义了各种服务以及通信模型。该层的核心是一MBeanServer,所有的MBean都要向它注册，才能被管理。注册在MBeanServer上的MBean并不直接和远程应用程序进行通信，
他们通过协议适配器（Adapter）和连接器（Connector）进行通信。通常Agent由一个MBeanServer和多个系统服务组成。JMX Agent并不关心它所管理的资源是什么。

- Distributed
 
Distributed层关心Agent如何被远端用户访问的细节。它定义了一系列用来访问Agent的接口和组件，包括Adapter和Connector的描述。
如果一个Java对象可以由一个遵循JMX规范的管理器应用管理，那么这个Java对象就可以由JMX管理资源。要使一个Java对象可管理，则必须创建相应的MBean对象，
并通过这些MBean对象管理相应的Java对象。当拥有MBean类后，需要将其实例化并注册到MBeanServer上。

# Hello World


[完整代码示例](https://github.com/houbb/jdk/tree/master/jdk-jmx)


## 代码定义

- 项目结构

```
.
├── lib
│   └── jmxtools.jar
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── ryo
    │   │           └── jdk
    │   │               └── jmx
    │   │                   └── standardbean
    │   │                       ├── Hello.java
    │   │                       ├── HelloAgent.java
    │   │                       └── HelloMBean.java
    │   └── resources
    │       └── readme.md
    └── test
        └── java
            └── readme.md
```

- HelloMBean.java

Standard MBean是JMX管理构件中最简单的一种，只需要开发一个MBean接口（为了实现Standard MBean，必须遵循一套继承规范。

必须每一个MBean定义一个接口，而且这个接口的名字必须是其被管理的资源的对象类的名称后面加上”MBean”），一个实现MBean接口的类，并且把它们注册到MBeanServer中就可以了。

```java
public interface HelloMBean {

    String getName();

    void setName(String name);

    void printHello();

    void printHello(String whoName);

}
```

- Hello.java

真正的资源对象，因为命名规范的限制，因此对象名称必须为Hello。

```java
public class Hello implements HelloMBean {

    private String name;

    @Override
    public String getName() {
        return name;
    }

    @Override
    public void setName(String name) {
        this.name = name;
    }

    @Override
    public void printHello() {
        System.out.println("Hello world, " + name);
    }

    @Override
    public void printHello(String whoName) {
        System.out.println("Hello, " + whoName);
    }
}
```

- HelloAgent.java

```java
package com.ryo.jdk.jmx.standardbean;

import com.sun.jdmk.comm.HtmlAdaptorServer;

import javax.management.*;
import javax.management.remote.JMXConnectorServer;
import javax.management.remote.JMXConnectorServerFactory;
import javax.management.remote.JMXServiceURL;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

/**
 * 2017/11/18
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class HelloAgent {

    public static void main(String[] args) throws MalformedObjectNameException,
            NotCompliantMBeanException, InstanceAlreadyExistsException,
            MBeanRegistrationException, IOException {
// 下面这种方式不能再JConsole中使用
// MBeanServer server = MBeanServerFactory.createMBeanServer();
// 首先建立一个MBeanServer,MBeanServer用来管理我们的MBean,通常是通过MBeanServer来获取我们MBean的信息，间接
// 调用MBean的方法，然后生产我们的资源的一个对象。
        MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();

        String domainName = "MyMBean";

//为MBean（下面的new Hello()）创建ObjectName实例
        ObjectName helloName = new ObjectName(domainName + ":name=HelloWorld");
// 将new Hello()这个对象注册到MBeanServer上去
        mbs.registerMBean(new Hello(), helloName);

// Distributed Layer, 提供了一个HtmlAdaptor。支持Http访问协议，并且有一个不错的HTML界面，这里的Hello就是用这个作为远端管理的界面
// 事实上HtmlAdaptor是一个简单的HttpServer，它将Http请求转换为JMX Agent的请求
        ObjectName adapterName = new ObjectName(domainName + ":name=htmladapter,port=8082");
        HtmlAdaptorServer adapter = new HtmlAdaptorServer();
        adapter.start();
        mbs.registerMBean(adapter, adapterName);

        int rmiPort = 1099;
        Registry registry = LocateRegistry.createRegistry(rmiPort);

        JMXServiceURL url = new JMXServiceURL("service:jmx:rmi:///jndi/rmi://localhost:" + rmiPort + "/" + domainName);
        JMXConnectorServer jmxConnector = JMXConnectorServerFactory.newJMXConnectorServer(url, null, mbs);
        jmxConnector.start();
    }

}
```

- HtmlAdaptorServer

这个类依赖一个 `jmxtools.jar`，各个博客都推荐去 [Sun 官网下载](http://www.oracle.com/technetwork/java/javase/tech/javamanagement-140525.html)。
 
简单找了下，没找到。[可以在这里下载](https://github.com/houbb/jdk/blob/master/jdk-jmx/lib/jmxtools.jar)

像项目结构中放置，使用 maven 的方式引入：

```xml
<dependency>
    <groupId>com.sun.jdmk</groupId>
    <artifactId>jmxtools</artifactId>
    <version>1.0.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/lib/jmxtools.jar</systemPath>
</dependency>
```
 

## 运行访问

- 运行和访问

直接运行 `HelloAgent.main()` 方法启动服务。访问 [localhost:8082](http://localhost:8082)


![2017-11-19-java-jmx-hello-index.png](https://raw.githubusercontent.com/houbb/resource/master/img/java/jmx/2017-11-19-java-jmx-hello-index.png)


- 运行方法

点击 [MyMBean 下 name=HelloWorld](http://localhost:8082/ViewObjectRes//MyMBean%3Aname%3DHelloWorld)

界面如下

![2017-11-19-java-jmx-hello-mbean.png](https://raw.githubusercontent.com/houbb/resource/master/img/java/jmx/2017-11-19-java-jmx-hello-mbean.png)


点击【printHello】`HelloAgent` 命令行的输出结果

```
Hello world, null
```


- 设置值

在 红框指定的输入框内，设置 Name 的 value 为任意值，如: ryo

点击【apply】，再次运行【printHello】，命令行的输出结果

```
Hello world, ryo
```

## 简单思考

可以做什么呢？

比如某些属性的配置，一般我们会写在配置文件中，但是修改后还需要重启服务。

使用这个技术可以**不用重启服务**达到修改配置的目的。

# 参考资料

> [从零开始玩转JMX](http://blog.csdn.net/u013256816/article/details/52800742)

> [JMX 系列](http://blog.csdn.net/s464036801/article/category/1565125)

* any list
{:toc}
