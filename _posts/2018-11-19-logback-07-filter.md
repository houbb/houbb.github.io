---
layout: post
title: Filter
date: 2018-11-19 8:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
excerpt: Filter
---

# 在logback-classic中

Logback-classic提供两种类型的过滤器，常规过滤器和turbo过滤器。

## 常规过滤器

常规的logback-classic过滤器扩展了Filter抽象类，它基本上由一个以ILoggingEvent实例作为参数的decision()方法组成。

过滤器按有序列表组织，并基于三元逻辑。每个过滤器的决定（ILoggingEvent事件）方法按顺序调用。此方法返回FilterReply枚举值之一，即DENY，NEUTRAL或ACCEPT之一。如果decision()返回的值为DENY，则会立即删除日志事件，而不会咨询剩余的过滤器。如果返回的值是NEUTRAL，则查询列表中的下一个过滤器。如果没有其他过滤器可供参考，则会正常处理日志记录事件。如果返回的值是ACCEPT，则立即处理日志事件，跳过其余过滤器的调用。

在logback-classic中，可以将过滤器添加到Appender实例中。通过向appender添加一个或多个过滤器，您可以按任意条件过滤事件，例如日志消息的内容，MDC的内容，一天中的时间或日志记录事件的任何其他部分。

## 实现自己的过滤器

创建自己的过滤器很简单。您所要做的就是扩展Filter抽象类并实现decision()方法。

下面显示的SampleFilter类提供了一个示例。其decision方法返回ACCEPT以记录其消息字段中包含字符串“sample”的事件。

对于其他事件，返回值 DENY。

- SampleFilter.java

```java
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.filter.Filter;
import ch.qos.logback.core.spi.FilterReply;

/**
 * @author binbin.hou
 * @date 2018/11/22
 */
public class SampleFilter extends Filter<ILoggingEvent> {

    /**
     * 如果日志包含 sample 则打印
     * @param event
     * @return
     */
    @Override
    public FilterReply decide(ILoggingEvent event) {
        if (event.getMessage().contains("sample")) {
            return FilterReply.ACCEPT;
        } else {
            return FilterReply.DENY;
        }
    }
}
```

- main()

```java
private static final Logger LOG = LoggerFactory.getLogger(Main.class);

public static void main(String[] args) {
        LOG.info("I am fine.");
        LOG.info("I am fine sample.");
}
```

- logback.xml

```xml
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">

        <filter class="com.github.houbb.logback.learn.filter.SampleFilter" />

        <encoder>
            <pattern>
                %-4relative [%thread] %-5level %logger - %msg%n
            </pattern>
        </encoder>
    </appender>

    <root>
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```

输出的日志信息：

```
295  [main] INFO  com.github.houbb.logback.learn.filter.Main - I am fine sample.
```

## LevelFilter

LevelFilter根据精确的级别匹配过滤事件。如果事件的级别等于配置的级别，则筛选器接受或拒绝该事件，具体取决于onMatch和onMismatch属性的配置。

这是一个示例配置文件。

这是一个非常有用的 levelFilter 工具。


- LevelFilter

只有 INFO 级别的日志才会被打印。

```xml
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>INFO</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
        <encoder>
            <pattern>
                %-4relative [%thread] %-5level %logger{30} - %msg%n
            </pattern>
        </encoder>
    </appender>
    <root level="DEBUG">
        <appender-ref ref="CONSOLE" />
    </root>
</configuration>
```

## 其他 filter

- ThresholdFilter

ThresholdFilter过滤低于指定阈值的事件。

对于等于或高于阈值的事件，ThresholdFilter将在调用其decision()方法时响应NEUTRAL。但是，将拒绝级别低于阈值的事件。这是一个示例配置文件。

- EvaluatorFilter

EvaluatorFilter是封装EventEvaluator的通用过滤器。

顾名思义，EventEvaluator会评估给定事件是否满足给定条件。

在匹配和不匹配时，托管EvaluatorFilter将分别返回onMatch或onMismatch属性指定的值。

请注意，EventEvaluator是一个抽象类。您可以通过对EventEvaluator进行子类化来实现自己的事件评估逻辑。

# Matcher

虽然可以通过调用String类中的matches()方法来进行模式匹配，但每次调用过滤器时都会产生编译全新Pattern对象的成本。

要消除此开销，可以预定义一个或多个Matcher对象。定义匹配器后，可以在评估程序表达式中按名称重复引用它。

```xml
<configuration debug="true">

  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <filter class="ch.qos.logback.core.filter.EvaluatorFilter">
      <evaluator>        
        <matcher>
          <Name>odd</Name>
          <!-- filter out odd numbered statements -->
          <regex>statement [13579]</regex>
        </matcher>
        
        <expression>odd.matches(formattedMessage)</expression>
      </evaluator>
      <OnMismatch>NEUTRAL</OnMismatch>
      <OnMatch>DENY</OnMatch>
    </filter>
    <encoder>
      <pattern>%-4relative [%thread] %-5level %logger - %msg%n</pattern>
    </encoder>
  </appender>

  <root level="DEBUG">
    <appender-ref ref="STDOUT" />
  </root>
</configuration>
```

# 参考资料

https://logback.qos.ch/manual/filters.html

* any list
{:toc}