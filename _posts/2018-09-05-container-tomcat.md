---
layout: post
title:  Tomcat
date:  2018-09-05 11:45:07 +0800
categories: [Container]
tags: [tomcat, servlet, apache, container, TODO, sh]
published: true
excerpt: Tomcat 入门介绍，Tomcat 系统架构。
---

# Tomcat

[Apache Tomcat®](http://tomcat.apache.org/) 是由Apache软件基金会下属的Jakarta项目开发的一个Servlet容器，按照Sun Microsystems提供的技术规范，实现了对Servlet和JavaServer Page（JSP）的支持，并提供了作为Web服务器的一些特有功能，如Tomcat管理和控制平台、安全域管理和Tomcat阀等。

由于Tomcat本身也内含了一个HTTP服务器，它也可以被视作一个单独的Web服务器。

但是，不能将Tomcat和Apache HTTP服务器混淆，Apache HTTP服务器是一个用C语言实现的HTTPWeb服务器；

这两个HTTP web server不是捆绑在一起的。Apache Tomcat包含了一个配置管理工具，也可以通过编辑XML格式的配置文件来进行配置。

# 快速开始

## 下载

[tomcat8 下载](https://tomcat.apache.org/download-80.cgi)

## 文件夹说明

```
LICENSE		NOTICE		RELEASE-NOTES	RUNNING.txt	bin		conf		lib		logs		temp		webapps		work
```

- `/bin`

——启动、关闭和其他脚本。*.sh文件(用于Unix系统)是*的函数副本。bat文件(用于Windows系统)。因为Win32命令行缺少某些功能，所以这里有一些额外的文件。

- `/conf`

配置文件和相关dtd。这里最重要的文件是 server.xml。

它是容器的主配置文件。

- `/logs`

默认情况下，日志文件在这里。

- `/webapps` 

这是你的网络应用程序要去的地方。

# Docker tomcat

TODO

# Tomcat 系统架构

## 架构

![tomcat](https://www.ibm.com/developerworks/cn/java/j-lo-tomcat1/image001.gif)

- server

Server是管理Service接口的，是Tomcat的一个顶级容器。管理着多个Service

- service

Service 是服务，管理这一个Container和多个Connector，Service的存在依赖于Server

- container

Container: 一个或者多个Container 可以对应一个Connector,这样就组成了一个Service，Service生命周期的由Server进行管理。

Container和Connector之间的交互媒介是Service，一个Service可以对应多个Connector，但是只能有一个Container容器

## Server

Server 管理着所有的Service。它的主要作用是提供一个接口可以让其它程序能够访问这个Service集合，同时维护所有service的生命周期等。

Server在Tomcat中的标准实现是StandardServer。看一下其内部的addServiec方法

```java
@Override
public void addService(Service service) {
    service.setServer(this);
    synchronized (servicesLock) {
        Service results[] = new Service[services.length + 1];
        System.arraycopy(services, 0, results, 0, services.length);
        results[services.length] = service;
        services = results;
        if (getState().isAvailable()) {
            try {
                service.start();
            } catch (LifecycleException e) {
                // Ignore
            }
        }
        // Report this property change to interested listeners
        support.firePropertyChange("service", null, service);
    }
}
```

可以看到，在添加Service到Server的时候，它是将原有数组的长度加一并将数组添加到最后。然后启动最新添加的Service

## Service

Service 在Tomcat中的标准实现是StandardService，Service 可以说是一个标准的服务,拥有独立的端口号。

在 Service 中可以含有多个Connector和唯一的一个Container。

这样的设计模式可以允许例如SSL加密过的请求和没有经过SSL加密的请求在一个APP中同时存在。

## Container

Container 由四个子容器组成：

### Engine

表示整个Catalina Servlet引擎，是Container 只用最高层，用来管理Host 或者Context的实现

如果你想拦截每一个到Servlet的请求，可以通过

### Host

表示一个Engine管理下的一个虚拟主机，比如你访问的Localhost就是一个虚拟主机。

作用是运行多个应用

其处理过程可以总结如下：

1. 为特定的请求URL选择一个Context容器

2. 把Context容器绑定到线程中

3. 判断是否是一个异步请求

4. 让Context去处理这个请求

5. Context执行invoke方法，进入管道中，由StandardContextValve(是ContextValve的标准实现类)处理

### Context

Context 是用来管理Servlet的容器，Context就对应一个应用。所以我们部署应用时需要创建一个Context容器，Context负责管理Wrapper.

### Wrapper

用来管理一个 Servlet 的生命周期

## Connector

Connector 是Tomcat的连接器，主要任务是负责处理浏览器发送过来的请求，并创建一个Request和Response对象，用于和前端Client交换数据，
然后产生一个线程，并将Request对象和Response对象传递给线程，后面对这两个线程的处理就是Container的事情了。

1. 实例化Connector，构造一个Connector对象

2. 调用Connector的initIntenal方法，初始化Connetor

3. 调用ProtocolHanlder的init方法，完成ProtocolHanlder的初始化。这个过程包括了创建线程池并创建一个线程处理浏览器请求

4. 调用Connector的startIntenal方法，启动Connector

5. 调用ProtocolHandler的start方法，启动Protocolhanlder

6. 调用MapperListener的start方法，启动监听器程序

不同于Container ,Connector是一个实现类.其相当于一个容器处理基于Http的请求
。CoyoteAdapter,是connector和container的桥梁,经过这一步，请求就从connector传递到container中里了。Adapter

要注意的是：最先处理请求的Request是org.apache.coyote.Request类型，这是一个Tomcat中一个轻量级对象，完成基本的请求处理后很容易被JVM回收，那为什么不直接交给Connector.Request对象处理呢？由于后者是Servlet容器真正传递的对象其完成的职责比前者复杂，这里使用org.apache.coyote.Request主要减轻后者的任务负担，出于性能考虑才这么设计。

从 `connector.getService().getContainer().getPipeline().getFirst().invoke(request, response);` 

这句代码中可以知道下一步的处理需要交给Container容器了。

# Tomcat 实际使用 

## 端口号及其修改

- conf/server.xml

```xml
<Service name="Catalina">
    <Connector port="8080" protocol="HTTP/1.1" 
               connectionTimeout="20000" 
               redirectPort="8443" />
```

修改 port 端口号即可。

ps: 一般真实环境，不建议使用默认，容易被攻击。

## Connector 运行模式优化

1. bio(blocking I/O)

2. nio(non-blocking I/O)

3. apr(Apache Portable Runtime/Apache可移植运行库)

bio: 传统的Java I/O操作，同步且阻塞IO。

nio: JDK1.4开始支持，同步阻塞或同步非阻塞IO

aio(nio.2): JDK7开始支持，异步非阻塞IO

apr: Tomcat将以JNI的形式调用Apache HTTP服务器的核心动态链接库来处理文件读取或网络传输操作，从而大大地 提高Tomcat对静态文件的处理性能

- 调整

配置Tomcat运行模式改成是NIO模式，并配置连接池相关参数来进行优化:

```xml
<!--
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443" />
-->
<!-- protocol 启用 nio模式，(tomcat8默认使用的是nio)(apr模式利用系统级异步io) -->
<!-- minProcessors最小空闲连接线程数-->
<!-- maxProcessors最大连接线程数-->
<!-- acceptCount允许的最大连接数，应大于等于maxProcessors-->
<!-- enableLookups 如果为true,requst.getRemoteHost会执行DNS查找，反向解析ip对应域名或主机名-->
<Connector port="8080" protocol="org.apache.coyote.http11.Http11NioProtocol" 
    connectionTimeout="20000"
    redirectPort="8443
    maxThreads=“500” 
    minSpareThreads=“100” 
    maxSpareThreads=“200”
    acceptCount="200"
    enableLookups="false"/>
```

## 开启 zip 优化

HTTP 压缩可以大大提高浏览网站的速度，它的原理是，在客户端请求网页后，从服务器端将网页文件压缩，再下载到客户端，由客户端的浏览器负责解压缩并浏览。

相对于普通的浏览过程HTML,CSS,Javascript , Text ，它可以节省40%左右的流量。更为重要的是，它可以对动态生成的，包括CGI、PHP , JSP , ASP , Servlet,SHTML等输出的网页也能进行压缩，压缩效率惊人。

- 编码调优

- jvm 调优

## Tomcat 部署方式

1. 直接把Web项目放在webapps下，Tomcat会自动将其部署

2. 在 server.xml 文件上配置 `<Context>` 节点，设置相关的属性即可

3. 通过Catalina来进行配置:进入到conf\Catalina\localhost文件下，创建一个xml文件，该文件的名字就是站点的名字。编写XML的方式来进行设置。

# 参考资料

- docker tomcat

[Docker 安装 Tomcat](http://www.runoob.com/docker/docker-install-tomcat.html)

[Docker自动部署Apache Tomcat](http://dockone.io/article/285)

- 架构

[tomcat 架构](https://www.ibm.com/developerworks/cn/java/j-lo-servlet/index.html)

[IBM - tomcat 系统架构](https://www.ibm.com/developerworks/cn/java/j-lo-tomcat1/index.html)

https://www.jianshu.com/p/3ede935ce8fe

http://blog.51cto.com/13732225/2164585

- 性能调优

https://blog.yoodb.com/yoodb/article/detail/1279

http://www.voidcn.com/article/p-tsumgpfk-bd.html

[apr](https://blog.csdn.net/wanglei_storage/article/details/50225779)

[nio/bio/aio](https://blog.csdn.net/itismelzp/article/details/50886009)

[tomcat 调优方案](http://www.voidcn.com/article/p-tsumgpfk-bd.html)

* any list
{:toc}