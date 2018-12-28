---
layout: post
title: Logback 配置实战
date: 2018-11-19 8:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
excerpt: Logback 配置实战
---

# logback.xml

```xml
<?xml version="1.0"?>  
<configuration>  
  
    <!-- ch.qos.logback.core.ConsoleAppender 控制台输出 -->  
    <appender name="console" class="ch.qos.logback.core.ConsoleAppender">  
        <encoder charset="UTF-8">  
            <pattern>[%-5level] %d{HH:mm:ss.SSS} [%thread] %logger{36} - %msg%n</pattern>  
        </encoder>  
    </appender>  
  
    <!-- 日志级别 -->  
    <root>  
        <level value="error" />  
        <appender-ref ref="console" />  
    </root>  
  
</configuration>
```

# 不同的日志归档

- 错误级别

- 包的不同

- 日期时间 + 大小限制

# 异步输出日志

对于日志的输出，其实会影响系统性能。

所以更改使用异步的日志输出。

## 优点

定时刷新，降低性能的损耗。

## 缺点

对于日志量很少的系统，无法实时查看日志。

# 拓展阅读

[MDC](https://houbb.github.io/2018/12/06/slf4j-mdc)

# 参考资料

[Logback的配置和使用(终极)](https://www.cnblogs.com/winner-0715/p/6105519.html)

* any list
{:toc}