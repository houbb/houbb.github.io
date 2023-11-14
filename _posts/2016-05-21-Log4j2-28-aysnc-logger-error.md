---
layout: post
title: Log4j2-28-log4j2 async logger 异步 Logger 报错 log4j2 null object returned for AsyncLogger in Loggers 
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, apache, best-practise, log4j2]
published: true
---

# 现象

接入 log4j2 的时候，为了提升性能。使用了异步的 logger，但是遇到了报错：

```
log4j2 null object returned for AsyncLogger in Loggers 
```

# 原因

网上找到一篇帖子：

配置文件，配置日志打印控制：

Appender采用默认同的(不额外加异步控制的Async)

Logger采用异步的AsyncLogger（root无所谓）

![logger](https://img-blog.csdnimg.cn/20191227195211957.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3JvbWFudGljX2ppZQ==,size_16,color_FFFFFF,t_70)

如果此时是这样配置的，也就是想要使用AsyncLogger + (sync)Appender的方式，但是却出错了：

```
Unable to invoke factory method in class class org.apache.logging.log4j.core.async.AsyncLoggerConfig for element AsyncLogger. java.lang.reflect.InvocationTargetException
```

## 解决方法：

pom文件中，或者说项目的依赖jar包中，只引入了log4j2的相关api包和core包。

额外的log4j2本身代码逻辑所依赖的 disruptor包。

问题来源：log4j2的AsyncLogger本身的逻辑采用了缓冲区思想，使用的是disruptor框架来实现一个环形无锁队列。

```xml
<dependency>
    <groupId>com.laml</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.1</version>
</dependency>
```

## 其他

这种报错，会导致 logger 直接初始化失败，所以无法在日志文件中看到一些初始化的信息。

这个时候，如果是本地比较容易发现问题。

如果实在 linux 服务器上，启动时推荐看一下 tomcat 等 server 的日志。

# 参考资料

[log4j2采用AsyncLogger的错误解决方案](https://blog.csdn.net/romantic_jie/article/details/103737686)



* any list
{:toc}
