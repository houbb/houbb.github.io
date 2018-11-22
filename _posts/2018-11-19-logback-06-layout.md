---
layout: post
title: Layout
date: 2018-11-19 8:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
excerpt: Layout
---

# 什么是布局？

如果你想知道，布局与佛罗里达州的大型庄园无关。

布局是负责将传入事件转换为String的回溯组件。

Layout接口中的format（）方法接受一个表示事件（任何类型）的对象并返回一个String。

Layout界面的概要如下所示。

```java
public interface Layout<E> extends ContextAware, LifeCycle {

  String doLayout(E event);
  String getFileHeader();
  String getPresentationHeader();
  String getFileFooter();
  String getPresentationFooter();
  String getContentType();
}
```

# 自定义布局

## MyLayout

```java
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.LayoutBase;

/**
 * @author binbin.hou
 * @date 2018/11/22
 */
public class MyLayout extends LayoutBase<ILoggingEvent> {

    public String doLayout(ILoggingEvent event) {
        StringBuffer sbuf = new StringBuffer(128);
        sbuf.append("myLayout ");
        sbuf.append(event.getTimeStamp() - event.getLoggerContextVO().getBirthTime());
        sbuf.append(" ");
        sbuf.append(event.getLevel());
        sbuf.append(" [");
        sbuf.append(event.getThreadName());
        sbuf.append("] ");
        sbuf.append(event.getLoggerName());
        sbuf.append(" - ");
        sbuf.append(event.getFormattedMessage());
        sbuf.append("\n");
        return sbuf.toString();
    }

}
```

- 配置文件

```xml
<configuration>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
            <layout class="com.github.houbb.logback.learn.layout.custom.MyLayout" />
        </encoder>
    </appender>

    <root level="DEBUG">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```

- 日志输出

```
myLayout 293 INFO [main] com.github.houbb.logback.learn.layout.AutoConfigDemo - Entering application.
myLayout 296 DEBUG [main] com.github.houbb.logback.learn.layout.AutoConfigDemo - Debug info...
myLayout 296 INFO [main] com.github.houbb.logback.learn.layout.AutoConfigDemo - Exiting application.
```

# PatternLayout 

Logback经典船舶具有灵活的布局，称为PatternLayout。与所有布局一样，PatternLayout接受日志记录事件并返回String。但是，可以通过调整PatternLayout的转换模式来自定义此String。

PatternLayout的转换模式与C编程语言中printf()函数的转换模式密切相关。

转换模式由文字文本和称为转换说明符的格式控制表达式组成。您可以在转换模式中插入任何文字文本。

每个转换说明符都以百分号'％'开头，后跟可选的格式修饰符，转换字和大括号之间的可选参数。

转换字控制要转换的数据字段，例如，记录器名称，级别，日期或线程名称。格式修饰符控制字段宽度，填充和左对齐或右对齐。

正如已经多次提到的那样，FileAppender和子类需要一个编码器。

因此，当与FileAppender或其子类一起使用时，PatternLayout必须包含在编码器中。

鉴于FileAppender / PatternLayout组合如此常见，logback附带了一个名为PatternLayoutEncoder的编码器，该编码器仅用于包装PatternLayout实例，以便可以将其视为编码器。

下面是一个以编程方式使用PatternLayoutEncoder配置ConsoleAppender的示例：

```java
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.ConsoleAppender;
import org.slf4j.LoggerFactory;

/**
 * @author binbin.hou
 * @date 2018/11/22
 */
public class PatternLayoutEncoderDemo {

    public static void main(String[] args) {
        Logger rootLogger = (Logger)LoggerFactory.getLogger(Logger.ROOT_LOGGER_NAME);
        LoggerContext loggerContext = rootLogger.getLoggerContext();
        // we are not interested in auto-configuration
        loggerContext.reset();

        PatternLayoutEncoder encoder = new PatternLayoutEncoder();
        encoder.setContext(loggerContext);
        encoder.setPattern("%-5level [%thread]: %message%n");
        encoder.start();

        ConsoleAppender<ILoggingEvent> appender = new ConsoleAppender<ILoggingEvent>();
        appender.setContext(loggerContext);
        appender.setEncoder(encoder);
        appender.start();

        rootLogger.addAppender(appender);

        rootLogger.debug("Message 1");
        rootLogger.warn("Message 2");
    }
}
```

- 日志信息

```
DEBUG [main]: Message 1
WARN  [main]: Message 2
```

# 格式修饰符

默认情况下，相关信息按原样输出。但是，借助格式修饰符，可以更改每个数据字段的最小和最大宽度以及理由。

可选的格式修饰符位于百分号和转换字符或单词之间。

第一个可选的格式修饰符是左对齐标志，它只是减号（ `-` ）字符。然后是可选的最小字段宽度修改器。这是一个十进制常量，表示要输出的最小字符数。如果数据项包含较少的字符，则会在左侧或右侧填充，直到达到最小宽度。默认设置是在左侧填充（右对齐），但您可以使用左对齐标志指定右填充。填充字符是空格。如果数据项大于最小字段宽度，则扩展该字段以容纳数据。该值永远不会被截断。

可以使用最大字段宽度修饰符更改此行为，该修饰符由句点后跟十进制常量指定。如果数据项长于最大字段，则从数据项的开头删除多余的字符。

例如，如果最大字段宽度为8且数据项长度为十个字符，则删除数据项的前两个字符。此行为偏离C中的printf函数，其中截断是从末尾完成的。

可以通过在句点之后添加减号字符来结束截断。在这种情况下，如果最大字段宽度为8且数据项长度为10个字符，则删除数据项的最后两个字符。

# 转换字选项

转换说明符后面可以跟选项。总是在大括号之间声明。我们已经看到了一些选项提供的可能性，

例如与MDC转换说明符一起使用，如：`％mdc {someKey}`。

转换说明符可能有多个选项。

例如，使用评估程序的转换说明符（将很快介绍）可以将评估程序名称添加到选项列表中，如下所示：

```
<pattern>%-4relative [%thread] %-5level - %msg%n \
  %caller{2, DISP_CALLER_EVAL, OTHER_EVAL_NAME, THIRD_EVAL_NAME}</pattern>
```

如果该选项包含特殊字符（如大括号，空格或逗号），则可以将其括在单引号或双引号之间。

例如，考虑下一个模式。

```
<pattern>%-5level - %replace(%msg){'\d{14,16}', 'XXXX'}%n</pattern>
```

我们将选项\d {16}和XXXX传递给替换转换字。

它用XXXX替换消息中包含的任何14,15或16位数字序列，有效地模糊信用卡号码。请注意“\d”是正则表达式中单个数字的简写。 

`“{14,16 \}”`被解释为“{14,16}”，即重复前一项至少14次但最多16次。

# 参考资料

https://logback.qos.ch/manual/encoders.html

* any list
{:toc}