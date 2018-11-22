---
layout: post
title: Encoder
date: 2018-11-19 8:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
excerpt: Encoder
---

# Encoder

## Encoder 是什么

编码器负责将事件转换为字节数组，并将该字节数组写入OutputStream。编码器在logback版本0.9.19中引入。在以前的版本中，大多数appender依靠布局将事件转换为字符串并使用java.io.Writer将其写出来。在以前版本的logback中，用户可以在FileAppender中嵌套PatternLayout。由于logback 0.9.19，FileAppender和子类需要一个编码器而不再采用布局。

## 为什么突破变化？

如下一章中详细讨论的，布局只能将事件转换为字符串。此外，由于布局无法控制何时写出事件，因此布局无法将事件聚合成批处理。将此与编码器进行对比，编码器不仅可以完全控制写出的字节格式，还可以控制何时（以及是否）写出这些字节。

目前，PatternLayoutEncoder是唯一真正有用的编码器。它只包装了一个完成大部分工作的PatternLayout。因此，除了不必要的复杂性之外，编码器看起来并没有带来太大的影响。但是，我们希望随着新的强大编码器的出现，这种印象会发生变化。

# 编码器接口

编码器负责将传入事件转换为字节数组，并将生成的字节数组写入适当的OutputStream。

因此，编码器完全控制将字节写入由拥有的appender维护的OutputStream的内容和时间。

这是编码器接口：

```java
public interface Encoder<E> extends ContextAware, LifeCycle {

   /**
   * This method is called when the owning appender starts or whenever output
   * needs to be directed to a new OutputStream, for instance as a result of a
   * rollover.
   */
  void init(OutputStream os) throws IOException;

  /**
   * Encode and write an event to the appropriate {@link OutputStream}.
   * Implementations are free to defer writing out of the encoded event and
   * instead write in batches.
   */
  void doEncode(E event) throws IOException;


  /**
   * This method is called prior to the closing of the underling
   * {@link OutputStream}. Implementations MUST not close the underlying
   * {@link OutputStream} which is the responsibility of the owning appender.
   */
  void close() throws IOException;
}
```

# LayoutWrappingEncoder

在回溯版本0.9.19之前，许多appender依赖于Layout实例来控制日志输出的格式。

由于存在大量基于布局界面的代码，我们需要一种编码器与布局互操作的方法。 

LayoutWrappingEncoder填补了编码器和布局之间的空白。

它实现了编码器接口并包装了一个布局，它将委托转换为字符串的工作。

下面是LayoutWrappingEncoder类的摘录，说明了如何完成对包装布局实例的委派。

```java
public class LayoutWrappingEncoder<E> extends EncoderBase<E> {

  protected Layout<E> layout;
  private Charset charset;
 
   // encode a given event as a byte[]
   public byte[] encode(E event) {
     String txt = layout.doLayout(event);
     return convertToBytes(txt);
  }

  private byte[] convertToBytes(String s) {
    if (charset == null) {
      return s.getBytes();
    } else {
      return s.getBytes(charset);
    }
  } 
}
```

doEncode() 方法首先让包装的布局将传入的事件转换为字符串。根据用户选择的字符集编码将生成的文本字符串转换为字节。

# PatternLayoutEncoder

鉴于PatternLayout是最常用的布局，logback适用于PatternLayoutEncoder的这种常见用例，LayoutWrappingEncoder的扩展仅限于包装PatternLayout的实例。

从logback版本0.9.19开始，只要FileAppender或其子类之一配置了PatternLayout，就必须使用PatternLayoutEncoder。这在logback错误代码的相关条目中进行了解释。

## 属性

- immediateFlush

从LOGBACK 1.2.0开始，immediateFlush属性是封闭的Appender的一部分。

- outputPatternAsHeader

输出模式字符串作为标题

为了便于解析日志文件，logback可以在日志文件的顶部插入用于日志输出的模式。

默认情况下禁用此功能。可以通过将相关PatternLayoutEncoder的outputPatternAsHeader属性设置为“true”来启用它。

这是一个例子：

```xml
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>%d %-5level [%thread] %logger{0}: %msg%n</pattern>
        <outputPatternAsHeader>true</outputPatternAsHeader>
    </encoder>
</appender>
```

日志输出如下：

```
#logback.classic pattern: %d %-5level [%thread] %logger{0}: %msg%n
2018-11-22 15:54:17,768 INFO  [main] AutoConfigDemo: Entering application.
2018-11-22 15:54:17,772 DEBUG [main] AutoConfigDemo: Debug info...
2018-11-22 15:54:17,772 INFO  [main] AutoConfigDemo: Exiting application.
```

# 参考资料

https://logback.qos.ch/manual/encoders.html

* any list
{:toc}