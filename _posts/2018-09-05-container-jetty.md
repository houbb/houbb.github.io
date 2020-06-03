---
layout: post
title:  Jetty 入门使用
date:  2018-09-05 15:48:38 +0800
categories: [Container]
tags: [tomcat, servlet, apache, container, sh]
published: true
---

# Jetty

[Jetty](https://www.eclipse.org/jetty/) 提供了一个Web服务器和 javax.servlet 容器，以及对HTTP/2、WebSocket、OSGi、JMX、JNDI、JAAS和许多其他集成的支持。

这些组件是开源的，可用于商业用途和分发。

## 特性

- 全功能的,基于标准的

- 开放源代码和商业用途

- 灵活和可扩展

- 占用空间小

- 可嵌入

- 异步

- 企业可伸缩

- 在Apache和Eclipse下获得双重许可


# 与 Tomcat 对比

## 相同点

Tomcat和Jetty都是一种Servlet引擎，他们都支持标准的servlet规范和JavaEE的规范。

## 不同点

- 架构比较

Jetty的架构比Tomcat的更为简单
Jetty的架构是基于Handler来实现的，主要的扩展功能都可以用Handler来实现，扩展简单。
Tomcat的架构是基于容器设计的，进行扩展是需要了解Tomcat的整体设计结构，不易扩展。

- 性能比较

Jetty和Tomcat性能方面差异不大
Jetty可以同时处理大量连接而且可以长时间保持连接，适合于web聊天应用等等。
Jetty的架构简单，因此作为服务器，Jetty可以按需加载组件，减少不需要的组件，减少了服务器内存开销，从而提高服务器性能。
Jetty默认采用NIO结束在处理I/O请求上更占优势，在处理静态资源时，性能较高

Tomcat适合处理少数非常繁忙的链接，也就是说链接生命周期短的话，Tomcat的总体性能更高。

Tomcat默认采用BIO处理I/O请求，在处理静态资源时，性能较差。

- 其它比较

Jetty的应用更加快速，修改简单，对新的Servlet规范的支持较好。
Tomcat目前应用比较广泛，对JavaEE和Servlet的支持更加全面，很多特性会直接集成进来。

## 按场景选择

Jetty更轻量级。这是相对Tomcat而言的。

Jetty更灵活，体现在其可插拔性和可扩展性，更易于开发者对Jetty本身进行二次开发，定制一个适合自身需求的Web Server。

Jetty更满足公有云的分布式环境的需求，而Tomcat更符合企业级环境。

# 指定启动端口号

## maven 命令

- Tomcat

```
-Dmaven.tomcat.port=8080 tomcat:run
```

- Jetty

```
-Djetty.port=8081 jetty:run

mvn -Djetty.port=8081 jetty:run
mvn jetty:run
```

## maven 插件

```xml
<plugin>
    <groupId>org.mortbay.jetty</groupId>
    <artifactId>maven-jetty-plugin</artifactId>
    <version>6.1.26</version>
    <configuration>            
        <scanIntervalSeconds>3</scanIntervalSeconds>
        <connectors>
            <connector implementation="org.mortbay.jetty.nio.SelectChannelConnector">
                <port>10086</port>
            </connector>
        </connectors>                  
    </configuration>
</plugin>
```

# 常见问题

# 参考资料

- jetty

https://www.eclipse.org/jetty/

- 对比 tomcat

[Jetty 的工作原理以及与 Tomcat 的比较](https://www.ibm.com/developerworks/cn/java/j-lo-jetty/index.html)

https://www.iteye.com/blog/jackyrong-2342065

https://www.jianshu.com/p/1d5235b1cc3b

* any list
{:toc}