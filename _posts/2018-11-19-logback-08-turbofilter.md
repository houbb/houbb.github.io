---
layout: post
title: TurboFilter
date: 2018-11-19 8:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
excerpt: TurboFilter 自定义错误级别
---

# TurboFilter

TurboFilter实现日志级别等内容的动态修改

可能看到这个标题，读者会问：要修改日志的级别，不是直接修改log.xxx就好了吗？为何要搞那么复杂呢？

所以，先说一下场景，为什么要通过TurboFilter去动态的修改日志级别。我们在使用Java开发各种项目的时候必然的会引入很多框架，这些框架通过堆叠的方式完成所要提供的业务服务（一个服务请求在进入后会在这些框架中兜一圈，然后返回结果），当一个比较底层的框架在处理过程中抛出了异常之后，这个异常会不断的向上传递。这个时候，有的框架直接throw，继续向上抛，而有的在throw之前还会自己打印一下error日志，这就导致了当出现异常的时候，往往会出现一连串类似的错误日志记录。如果对接了错误日志告警，就会出现重复告警的现象。为了解决类似这样的问题，修改源码重新编译最直接，但是不可取。所以希望可以有更好的手段去控制这些已经被编码固化的日志打印信息。当我们使用Logback的时候，TurboFilter就是解决该问题的工具之一。

ch.qos.logback.core.filter.Filter实现的过滤器是与Appender绑定的，而TurboFIlter是与日志上下文绑定的，它会过滤所有的日志请求，并且TurboFIlter的方法中提供了丰富的可访问信息用来进行控制和改写。

比如下面的实现，通过继承ch.qos.logback.classic.turbo.TurboFilter类，并重写decide方法，将org.springframework.cloud.sleuth.instrument.web.ExceptionLoggingFilter类中原本要打印的ERROR日志DENY掉（过滤掉），同时以WARN级别打印一封相同的内容，这样就实现了对已定义日志的动态修改。

## 自定义的 TurboFilter

- SampleTurboFilter.java

```java
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.turbo.TurboFilter;
import ch.qos.logback.core.spi.FilterReply;

public class SampleTurboFilter extends TurboFilter {

  String marker;
  Marker markerToAccept;

  @Override
  public FilterReply decide(Marker marker, Logger logger, Level level,
      String format, Object[] params, Throwable t) {

    if (!isStarted()) {
      return FilterReply.NEUTRAL;
    }

    if ((markerToAccept.equals(marker))) {
      return FilterReply.ACCEPT;
    } else {
      return FilterReply.NEUTRAL;
    }
  }

  public String getMarker() {
    return marker;
  }

  public void setMarker(String markerStr) {
    this.marker = markerStr;
  }

  @Override
  public void start() {
    if (marker != null && marker.trim().length() > 0) {
      markerToAccept = MarkerFactory.getMarker(marker);
      super.start(); 
    }
  }
}
```

上面的TurboFilter接受包含特定标记的事件。如果未找到所述标记，则过滤器将责任传递给链中的下一个过滤器。

为了提供更大的灵活性，可以在配置文件中指定要测试的标记，因此可以使用getter和setter方法。我们还实现了start（）方法，以检查在配置过程中是否已指定该选项。

以下是使用我们新创建的TurboFilter的示例配置。

- logback.xml

```xml
<configuration>
  <turboFilter class="chapters.filters.SampleTurboFilter">
    <Marker>sample</Marker>
  </turboFilter>

  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
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

## 内置的函数

Logback经典船只有几个TurboFilter类可供使用。

 MDCFilter检查MDC中是否存在给定值，而DynamicThresholdFilter允许基于MDC密钥/级别阈值关联进行过滤。
 
 另一方面，MarkerFilter检查是否存在与日志记录请求相关联的特定标记。

 ```xml
<configuration>

  <turboFilter class="ch.qos.logback.classic.turbo.MDCFilter">
    <MDCKey>username</MDCKey>
    <Value>sebastien</Value>
    <OnMatch>ACCEPT</OnMatch>
  </turboFilter>
        
  <turboFilter class="ch.qos.logback.classic.turbo.MarkerFilter">
    <Marker>billing</Marker>
    <OnMatch>DENY</OnMatch>
  </turboFilter>

  <appender name="console" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%date [%thread] %-5level %logger - %msg%n</pattern>
    </encoder>
  </appender>

  <root level="INFO">
    <appender-ref ref="console" />
  </root>  
</configuration>
 ```

# 感受

1. 一次学太多，没什么用。不如一次学一点，知道应用的场景。

2. 很多人说，logback 这种日志框架很简单，会看就行。但是背后设计的思想。我们在设计的时候，如何灵活与简单并存？这些并不简单，可以学习的地方太多。

# 参考资料

https://mp.weixin.qq.com/s/tpR8vfB8Vz7bu2hWV3OJBw

* any list
{:toc}