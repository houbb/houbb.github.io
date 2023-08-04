---
layout: post
title: Log4j2-25-log4j2 log4j2异步详解及高并发下的优化
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, apache, best-practise, log4j2]
published: true
---

# 基础概述

对于log4j2的同步和异步的讲解，本人也是找了很多的资料，也阅读了官方的文档和源码。

对于两者的区别已经发送log执行流程可参考下面的文章，讲的挺全面的：
https://www.cnblogs.com/yeyang/p/7944906.html

其中对于AsyncAppender和AsyncLogger源码的解读可参考：
https://www.cnblogs.com/lewis09/p/10003462.html
https://www.cnblogs.com/lewis09/p/10004117.html

Disruptor详解请参考：
https://www.jianshu.com/p/bad7b4b44e48

# 配置优化

本文是对之前那篇log4j2异步将log发送到kafka(https://blog.csdn.net/qq_35754073/article/details/103386177)的补充和log4j2在高并发情况下的优化。

场景：qps需要可以稳定在10000以上，可是测试到3000就发生qps下降的情况，通过对apm以及服务cpu，内存的分析确认是log4j严重影响了性能，所以有了后来大量寻找log4j2异步性能的一些问题，总结之后也是对项目log4j2做了一些优化，也是的确提升了性能。

1.给log增加tracking_id，对每次请求的log作标识。

2.Loggers的配置从大部分配在root改为配置在logger，因为陪在root发现会有一些不是项目中的log发送到了kafka，而logger就很精准。

3.增加Disruptor队列长度并配置队列堵塞丢弃策略从而增加高并发下的性能

## 添加tracking_id

```java
String tracingId = request.getHeader("tracing_id");
if (tracingId == null || tracingId.isEmpty()) {
     tracingId = UUID.randomUUID().toString();
}
MDC.put("tracking_id", tracingId);
```

## Loggers全部改为AsyncLogger:

```yml
  Loggers:
    AsyncRoot:
      level: debug
      #      add location in async
      includeLocation: true
      AppenderRef:
        - ref: CONSOLE
    AsyncLogger:
      - name: REQUEST_LOG
        AppenderRef:
          - ref: REQUEST_LOG
      - name: SERVICE_LOG
        AppenderRef:
          - ref: SERVICE_LOG
      - name: ERROR_LOG
        AppenderRef:
          - ref: ERROR_LOG
```

## 增加Disruptor队列长度并配置队列堵塞丢弃策略：

需要更改System Property（系统参数）

log4j2.asyncLoggerRingBufferSize：指定队列的长度

log4j2.AsyncQueueFullPolicy：指定堵塞丢弃策略，如果未指定此属性或具有value "Default"，则此工厂创建DefaultAsyncQueueFullPolicy对象。

如果此属性具有value "Discard"，则此工厂将创建 DiscardingAsyncQueueFullPolicy对象。

默认情况下，如果队列已满，此路由器将丢弃级别为INFO，DEBUG和TRACE的事件。可以使用属性log4j2.DiscardThreshold（开始丢弃的级别名称）进行调整。

更详细的参数请参考官网：

https://logging.apache.org/log4j/2.x/manual/async.html

### 指定System Property（系统参数）的方式：

1.启动参数方式

启动的时候增加-Dlog4j2.asyncLoggerRingBufferSize=123456789

2.log4j2提供的 log4j2.component.properties file方式

classpath下创建 log4j2.component.properties 文件

```properties
log4j2.asyncLoggerRingBufferSize=65535
log4j2.AsyncQueueFullPolicy=Discard
log4j2.DiscardThreshold=INFO
```

如果两者都配置了，则第二种方式将会覆盖第一种方式的配置。

# 个人思考

## log4j2.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN" packages = "com.github.houbb.sensitive.log4j2.layout">

    <Properties>
        <Property name="DEFAULT_PATTERN">%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n</Property>
        <Property name="DEFAULT_CHARSET">UTF-8</Property>
        <Property name="LOG_HOME">/log4j2/logs/test</Property>
    </Properties>

    <Appenders>
        <RollingRandomAccessFile name="COMMON-FILE-APPENDER"
                                 filePattern="${LOG_HOME}/$${date:yyyy-MM}/error-%d{MM-dd-yyyy}-%i.log.gz"
                                 fileName = "${LOG_HOME}/common.log"
                                 immediateFlush="true">
            <ThresholdFilter level="ERROR" onMatch="DENY" onMisMatch="ACCEPT"/>
            <PatternLayout>
                <Pattern>${DEFAULT_PATTERN}</Pattern>
            </PatternLayout>
            <Policies>
                <TimeBasedTriggeringPolicy />
                <SizeBasedTriggeringPolicy size="250 MB"/>
            </Policies>
        </RollingRandomAccessFile>

        <RollingRandomAccessFile name="ERROR-FILE-APPENDER"
                                 filePattern="${LOG_HOME}/$${date:yyyy-MM}/app-%d{MM-dd-yyyy}-%i.log.gz"
                                 fileName = "${LOG_HOME}/error.log"
                                 immediateFlush="true">
            <ThresholdFilter level="ERROR" onMatch="ACCEPT" onMisMatch="DENY"/>
            <PatternLayout>
                <Pattern>${DEFAULT_PATTERN}</Pattern>
            </PatternLayout>
            <Policies>
                <TimeBasedTriggeringPolicy />
                <SizeBasedTriggeringPolicy size="250 MB"/>
            </Policies>
        </RollingRandomAccessFile>

<!--        <Console name="Console" target="SYSTEM_OUT">-->
<!--            <SensitivePatternLayout/>-->
<!--        </Console>-->
    </Appenders>

    <Loggers>

        <AsyncLogger name="com.github.houbb.sensitive.test" level="INFO" additivity="false">
            <AppenderRef ref="COMMON-FILE-APPENDER"/>
            <AppenderRef ref="ERROR-FILE-APPENDER"/>
        </AsyncLogger>

        <asyncRoot level="INFO">
            <AppenderRef ref="COMMON-FILE-APPENDER"/>
            <AppenderRef ref="ERROR-FILE-APPENDER"/>
        </asyncRoot>
    </Loggers>

</Configuration>
```

## 指定配置文件-log4j2.component.properties

指定配置文件

```properties
# 最多缓存多少个
log4j2.asyncLoggerRingBufferSize=100
# 策略为丢弃
log4j2.AsyncQueueFullPolicy=Discard
# 对应的策略隔离级别
log4j2.DiscardThreshold=INFO
```

# 参考资料

https://blog.csdn.net/qq_35754073/article/details/104116487

* any list
{:toc}
