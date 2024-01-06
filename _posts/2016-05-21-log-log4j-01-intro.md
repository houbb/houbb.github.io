---
layout: post
title:  log-01-日志组件之 Log4j 入门介绍
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, log4j, sf]
published: true
---

# 拓展阅读

[Log4j2 系统学习](https://houbb.github.io/2016/05/21/Log4j2-01-overview)

[Logback 系统学习](https://houbb.github.io/2018/11/19/logback-01-intro)

[Slf4j](https://houbb.github.io/2018/08/27/slf4j)

[Slf4j-02-slf4j 与 logback 整合](https://houbb.github.io/2018/08/27/slf4j-02-logback)

[SLF4j MDC-日志添加唯一标识](https://houbb.github.io/2018/12/06/slf4j-mdc)

[分布式链路追踪-05-mdc 等信息如何跨线程? Log4j2 与 logback 的实现方式](https://houbb.github.io/2023/07/25/distributed-trace-06-log4j2-slf4j)

[日志开源组件（一）java 注解结合 spring aop 实现自动输出日志](https://houbb.github.io/2023/08/06/auto-log-01-overview)

[日志开源组件（二）注解结合 spring aop 实现日志traceId唯一标识](https://houbb.github.io/2023/08/06/auto-log-02-trace-id)

[日志开源组件（三）java 注解结合 spring aop 自动输出日志新增拦截器与过滤器](https://houbb.github.io/2023/08/06/auto-log-03-filter)

[日志开源组件（四）如何动态修改 spring aop 切面信息？让自动日志输出框架更好用](https://houbb.github.io/2023/08/06/auto-log-04-dynamic-aop)

[日志开源组件（五）如何将 dubbo filter 拦截器原理运用到日志拦截器中？](https://houbb.github.io/2023/08/06/auto-log-05-dubbo-interceptor)

[日志开源组件（六）Adaptive Sampling 自适应采样](https://houbb.github.io/2023/08/06/auto-log-06-adaptive)

# Log4j

[log4j](http://logging.apache.org/log4j/1.2/) Java的日志库。

> 这个技术已过时，只是很多公司还在用。

## log4j2

建议学习 [log4j2](https://houbb.github.io/2016/05/21/Log4j2)

# 快速开始

## maven 引入 

```xml
<dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.17</version>
</dependency>
```

## log4j.xml

文件配置信息，放在 resource 文件夹下。

如果没有这个配置文件，log4j 会在启动的时候控制台输出错误提示。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE log4j:configuration SYSTEM "log4j.dtd">

<log4j:configuration>

    <!-- 将日志信息输出到控制台 -->
    <appender name="ConsoleAppender" class="org.apache.log4j.ConsoleAppender">
        <!-- 设置日志输出的样式 -->
        <layout class="org.apache.log4j.PatternLayout">
            <!-- 设置日志输出的格式 -->
            <param name="ConversionPattern" value="[%d{yyyy-MM-dd HH:mm:ss:SSS}] [%-5p] [method:%l]%n%m%n%n"/>
        </layout>
    </appender>

    <root>
        <level value="INFO"/>
        <appender-ref ref="ConsoleAppender"/>
    </root>

</log4j:configuration>
```

## 入门案例

```java
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

/**
 * @author binbin.hou
 * date 2019/1/28
 */
public class Log4jDemo {

    private static Logger LOGGER = LogManager.getLogger(Log4jDemo.class);

    public static void main(String[]args) {
        LOGGER.debug("[1]-my level is DEBUG");
        LOGGER.info("[2]-my level is INFO");
        LOGGER.warn("[3]-my level is WARN");
        LOGGER.error("[4]-my level is ERROR");
    }

}
```

- 日志信息

可见默认的日志级别为 INFO，所以 DEBUG 信息不会被打印。

```
[2019-01-28 13:26:22:586] [INFO ] [method:Log4jDemo.main(Log4jDemo.java:15)]
[2]-my level is INFO

[2019-01-28 13:26:22:589] [WARN ] [method:Log4jDemo.main(Log4jDemo.java:16)]
[3]-my level is WARN

[2019-01-28 13:26:22:590] [ERROR] [method:Log4jDemo.main(Log4jDemo.java:17)]
[4]-my level is ERROR
```

# web path

在 web 项目中，日志输出时会出现 Log4j 找不到目录的情况。可以考虑将日志输出在项目下。

- web.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.4"
         xmlns="http://java.sun.com/xml/ns/j2ee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd">

	<!-- 获取项目根路径 -->
	<context-param>  
        <param-name>webAppRootKey</param-name>    
        <param-value>webapp.root</param-value>    
    </context-param> 
    
</web-app>
```

- log4j.xml

在这里可以使用 `${webapp.root}` 用来获取项目的根目录。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<log4j:configuration xmlns:log4j="http://jakarta.apache.org/log4j/">
    <!-- 记录info日志 -->
    <appender name="infoAppender" class="org.apache.log4j.DailyRollingFileAppender">
        <param name="Encoding" value="UTF-8"/>
        <param name="File" value="${webapp.root}/logs/APP_NAME.log"/>
        <!-- 设置是否在重新启动服务时，在原有日志的基础添加新日志 -->
        <param name="Append" value="true"/>
        <param name="DatePattern" value="'.'yyyy-MM-dd'.log'"/>
        <layout class="org.apache.log4j.PatternLayout">
            <param name="ConversionPattern" value="%d %t %p [%c] - %m%n"/>
        </layout>
        <!-- 过滤器设置输出的级别 -->
        <filter class="org.apache.log4j.varia.LevelRangeFilter">
            <param name="levelMin" value="INFO"/>
            <param name="levelMax" value="ERROR"/>
            <param name="AcceptOnMatch" value="true"/>
        </filter>
    </appender>

    <root>
        <priority value="ALL"/>
        <appender-ref ref="infoAppender"/>
    </root>

</log4j:configuration>
```

# 自定义 Layout

## 应用场景

我们一般使用的 layout，默认是 `org.apache.log4j.PatternLayout`。

如果这个类无法满足我们的需求，我们可以自己定义

## 简单的例子

我们自己定义了一个属性 prefix，并且在执行默认的 fomart 之后，执行我们的字符串处理。

```java
package layout;

import org.apache.log4j.PatternLayout;
import org.apache.log4j.spi.LoggingEvent;

/**
 * @author binbin.hou
 * date 2019/1/28
 */
public class MyLayout extends PatternLayout {

    /**
     * 自定义参数
     */
    private String prefix;

    @Override
    public String format(LoggingEvent event) {
        String message = super.format(event);
        return prefix+message;
    }

    /**
     * 自定义日志信息处理方法
     * @param message 原始信息
     * @return 处理后的结果
     */
    private String myMessageFomrat(final String message) {
        return prefix+message;
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

}
```

## 如何使用

prefix 是我们自己定义的一个前缀，过会儿我们可以在 log4j.xml 配置使用。

```xml
<!-- 设置日志输出的样式 -->
<layout class="org.apache.log4j.PatternLayout">
    <!-- 设置日志输出的格式 -->
    <param name="ConversionPattern" value="[%d{yyyy-MM-dd HH:mm:ss:SSS}] [%-5p] [method:%l]%n%m%n%n"/>
    <param name="prefix" value="自定义前缀-"/>
</layout>
```

## 日志输出

```
自定义[2019-01-28 13:55:19:400] [INFO ] [method:Log4jDemo.main(Log4jDemo.java:14)]
[2]-my level is INFO

自定义[2019-01-28 13:55:19:404] [WARN ] [method:Log4jDemo.main(Log4jDemo.java:15)]
[3]-my level is WARN

自定义[2019-01-28 13:55:19:404] [ERROR] [method:Log4jDemo.main(Log4jDemo.java:16)]
[4]-my level is ERROR
```

发现这个字符串已经放在每一个的前面了。

## 思考

这个简单的功能可以干嘛呢？

可以通过日志对信息进行脱敏。

# 参考资料

[log4j日志扩展---自定义PatternLayout](https://blog.csdn.net/u010162887/article/details/51736637)

* any list
{:toc}












 

