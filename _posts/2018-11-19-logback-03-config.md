---
layout: post
title: Logback-03-Config
date: 2018-11-19 08:11:55 +0800
categories: [Log]
tags: [log, sh]
published: true
excerpt: Logback 配置相关
---

# 配置

将日志请求插入应用程序代码需要相当多的计划和努力。 

观察表明，大约4％的代码专门用于记录。 

因此，即使是适度大小的应用程序也会在其代码中嵌入数千个日志记录语句。 

鉴于它们的数量，我们需要工具来管理这些日志语句。

可以通过编程方式或使用以XML或Groovy格式表示的配置脚本来配置Logback。 

顺便说一句，现有的log4j用户可以使用我们的PropertiesTranslator Web应用程序将他们的log4j.properties文件转换为logback.xml。

## 初始化步骤

让我们首先讨论后续尝试配置自身的初始化步骤：

1. Logback尝试在类路径中查找名为logback-test.xml的文件。

2. 如果未找到此类文件，则logback会尝试在类路径中查找名为logback.groovy的文件。

3. 如果找不到这样的文件，它会检查类路径中的文件logback.xml。

4. 如果没有找到这样的文件，则通过查找文件META-INF\services\ch，使用服务提供者加载工具（在JDK 1.6中引入）来解析com.qos.logback.classic.spi.Configurator接口的实现类路径中的qos.logback.classic.spi.Configurator。 
其内容应指定所需Configurator实现的完全限定类名。

5. 如果以上都不成功，则logback将使用BasicConfigurator自动配置自身，这将导致日志记录输出定向到控制台。

最后一步是在没有配置文件的情况下提供默认（但非常基本）的日志记录功能的最后努力。

如果您正在使用Maven，并且将logback-test.xml放在src/test/resources文件夹下，Maven将确保它不会包含在生成的工件中。 

因此，您可以使用不同的配置文件，即测试期间的logback-test.xml，以及生产中的另一个文件，即logback.xml。

快速启动Joran解析给定的回溯配置文件大约需要100毫秒。 

要在应用程序启动时减少这些毫秒，您可以使用服务提供程序加载工具（上面的第4项）来加载您自己的自定义Configurator类，使用BasicConfigrator作为一个很好的起点。

# 自动化配置

## 默认

不使用任何配置

- AutoConfigDemo.java

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author binbin.hou
 * @date 2018/11/20 16:37
 */
public class AutoConfigDemo {

    final static Logger logger = LoggerFactory.getLogger(AutoConfigDemo.class);

    public static void main(String[] args) {
        logger.info("Entering application.");
        logger.debug("Debug info...");
        logger.info("Exiting application.");
    }
}
```

- 日志信息

```
16:38:44.178 [main] INFO  c.g.h.l.learn.config.AutoConfigDemo - Entering application.
16:38:44.184 [main] DEBUG c.g.h.l.learn.config.AutoConfigDemo - Debug info...
16:38:44.184 [main] INFO  c.g.h.l.learn.config.AutoConfigDemo - Exiting application.
```

## 在出现警告或错误时自动打印状态消息

如果在解析配置文件期间发生警告或错误，则logback将自动在控制台上打印其内部状态消息。

如果在解析配置文件期间发生警告或错误，则logback将自动在控制台上打印其内部状态数据。 

请注意，为避免重复，如果用户显式注册状态侦听器（在下面定义），则禁用自动状态打印。

在没有警告或错误的情况下，如果您仍希望检查logback的内部状态，则可以通过调用StatusPrinter类的print()来指示logback打印状态数据。 

- InterStatusDemo.java

```java
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.core.util.StatusPrinter;
import org.slf4j.LoggerFactory;

/**
 * @author binbin.hou
 * @date 2018/11/20 17:27
 */
public class InterStatusDemo {

    public static void main(String[] args) {
        // assume SLF4J is bound to logback in the current environment
        LoggerContext lc = (LoggerContext) LoggerFactory.getILoggerFactory();
        // print logback's internal status
        StatusPrinter.print(lc);
    }

}
```

- 日志信息

```
17:28:34,242 |-INFO in ch.qos.logback.classic.LoggerContext[default] - Could NOT find resource [logback.groovy]
17:28:34,243 |-INFO in ch.qos.logback.classic.LoggerContext[default] - Could NOT find resource [logback-test.xml]
17:28:34,243 |-INFO in ch.qos.logback.classic.LoggerContext[default] - Could NOT find resource [logback.xml]
17:28:34,244 |-INFO in ch.qos.logback.classic.LoggerContext[default] - Setting up default configuration.
```

当然，你可以使用配置的方式去查看对应的状态信息。

- logback.xml

```xml
<configuration>

    <statusListener class="ch.qos.logback.core.status.OnConsoleStatusListener" />

</configuration>
```

# 自动重新加载配置

Logback-classic可以扫描其配置文件中的更改，并在配置文件更改时自动重新配置。

如果指示执行此操作，logback-classic将扫描其配置文件中的更改，并在配置文件更改时自动重新配置。 

为了指示logback-classic扫描其配置文件中的更改并自动重新配置，请将 `<configuration>` 元素的scan属性设置为true，

如下所示。

```xml
<configuration scan="true"> 
</configuration> 
```

## 扫描周期

默认情况下，将每分钟扫描一次配置文件以进行更改。 

您可以通过设置 `<configuration>` 元素的scanPeriod属性来指定不同的扫描周期。 

可以以毫秒，秒，分钟或小时为单位指定值。 

这是一个例子：

```xml
<configuration scan="true" scanPeriod="30 seconds" > 
</configuration> 
```

如果没有指定时间单位，则假定时间单位为毫秒，这通常是不合适的。 

如果更改默认扫描周期，请不要忘记指定时间单位。

# 在堆栈跟踪中启用打包数据

注意从1.1.4版开始，默认情况下禁用打包数据。

如果指示这样做，则logback可以包括它输出的堆栈跟踪线的每一行的打包数据。 

打包数据由jar文件的名称和版本组成，从而生成堆栈跟踪行的类。 

打包数据在识别软件版本问题时非常有用。 

但是，计算起来相当昂贵，尤其是在频繁抛出异常的应用程序中。 

这是一个示例输出：

```xml
<configuration packagingData="true">
</configuration>
```

# 直接调用JoranConfigurator

Logback依赖于名为Joran的配置库，它是logback-core的一部分。 

Logback的默认配置机制在类路径上找到的默认配置文件上调用JoranConfigurator。 

如果您希望因任何原因覆盖logback的默认配置机制，可以直接调用JoranConfigurator。 

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.joran.JoranConfigurator;
import ch.qos.logback.core.joran.spi.JoranException;
import ch.qos.logback.core.util.StatusPrinter;

/**
 * @author binbin.hou
 * @date 2018/11/20
 */
public class JoranConfiguratorDemo {

    private final static Logger logger = LoggerFactory.getLogger(JoranConfiguratorDemo.class);

    public static void main(String[] args) {
        // assume SLF4J is bound to logback in the current environment
        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();

        try {
            JoranConfigurator configurator = new JoranConfigurator();
            configurator.setContext(context);
            // Call context.reset() to clear any previous configuration, e.g. default
            // configuration. For multi-step configuration, omit calling context.reset().
            context.reset();
            final String configFilePath = "";
            configurator.doConfigure(configFilePath);
        } catch (JoranException je) {
            // StatusPrinter will handle this
        }
        StatusPrinter.printInCaseOfErrorsOrWarnings(context);

        logger.info("Entering application.");
        logger.info("Exiting application.");
    }

}
```

此应用程序获取当前有效的LoggerContext，创建新的JoranConfigurator，设置它将运行的上下文，重置记录器上下文，然后最终要求配置程序使用作为参数传递给应用程序的配置文件来配置上下文。 如果出现警告或错误，将打印内部状态数据。 

请注意，对于多步配置，应省略 context.reset() 调用。

# 停止 logback-classsic

为了释放logback-classic使用的资源，停止logback上下文总是一个好主意。 

停止上下文将关闭附加到上下文定义的记录器的所有appender，并以有序的方式停止任何活动线程。 

```java
import ch.qos.logback.classic.LoggerContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author binbin.hou
 * @date 2018/11/20
 */
public class StopLogbackContextDemo {

    private final static Logger logger = LoggerFactory.getLogger(StopLogbackContextDemo.class);

    public static void main(String[] args) {
        // assume SLF4J is bound to logback-classic in the current environment
        LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
        loggerContext.stop();

        logger.info("hello");
    }

}
```

- 日志信息

`logger.info("hello");` 这句话的内容并没有被打印。

# 配置文件语法

正如您在手册中看到的那样，仍有大量示例需要遵循，回溯允许您重新定义日志记录行为，而无需重新编译代码。

实际上，您可以轻松配置日志记录，以便禁用应用程序某些部分的日志记录，或者直接输出到UNIX Syslog守护程序，数据库，日志可视化程序或将日志记录事件转发到远程日志服务器，这将记录日志根据本地服务器策略，例如通过将日志事件转发到第二个logback服务器。

本节的其余部分介绍了配置文件的语法。

正如将一遍又一遍地证明的那样，logback配置文件的语法非常灵活。

因此，无法使用DTD文件或XML架构指定允许的语法。

然而，配置文件的基本结构可以描述为`<configuration>`元素，包含零个或多个`<appender>`元素，后跟零个或多个`<logger>`元素，后跟最多一个`<root>`元素。

> 标签是大小写敏感的

## 配置记录器或 logger 元素

此时，您应该至少对级别继承和基本选择规则有一些了解。 

否则，除非你是埃及古物学家，否则对象不会像象形文字那样对你有意义。

使用`<logger>`元素配置记录器。 

`<logger>`元素只接受一个必需的name属性，一个可选的level属性和一个可选的additivity属性，允许值为true或false。 

level属性的值允许一个不区分大小写的字符串值TRACE，DEBUG，INFO，WARN，ERROR，ALL或OFF。 

特殊于大小写不敏感的值INHERITED或其同义词NULL将强制记录器的级别从层次结构中的较高级别继承。 

如果您设置记录器的级别并稍后决定它应该继承其级别，这会派上用场。

`<logger>`元素可以包含零个或多个`<appender-ref>`元素; 

这样引用的每个appender都被添加到指定的logger中。 

请注意，与log4j不同，logback-classic在配置给定记录器时不会关闭也不会删除任何先前引用的appender。

## 配置根记录器或<root>元素

`<root>`元素配置根记录器。 

它支持单个属性，即level属性。 它不允许任何其他属性，因为additivity标志不适用于根记录器。 

此外，由于根记录器已被命名为“ROOT”，因此它也不允许使用name属性。 

level属性的值可以是不区分大小写的字符串TRACE，DEBUG，INFO，WARN，ERROR，ALL或OFF之一。 

请注意，根记录器的级别不能设置为INHERITED或NULL。


- 例子

默认根节点，日志级别为 DEBUG。

指定 `com.github.houbb` 包下的所有类，都按照 INFO 级别打印日志。

所有的日志输出到命令行，即 `STDOUT` 对应的 appender。

```xml
<configuration>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <!-- encoders are assigned the type
             ch.qos.logback.classic.encoder.PatternLayoutEncoder by default -->
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <logger name="com.github.houbb" level="INFO"/>

    <!-- Strictly speaking, the level attribute is not necessary since -->
    <!-- the level of the root level is set to DEBUG by default.       -->
    <root level="DEBUG">
        <appender-ref ref="STDOUT" />
    </root>

</configuration>
```

## 配置 Appenders

appender使用`<appender>`元素配置，该元素采用两个必需属性name和class。 

name属性指定appender的名称，而class属性指定要实例化的appender类的完全限定名称。 

`<appender>`元素可以包含零个或一个`<layout>`元素，零个或多个`<encoder>`元素以及零个或多个`<filter>`元素。 

除了这三个公共元素之外，`<appender>`元素可以包含与appender类的JavaBean属性相对应的任意数量的元素。 

无缝支持给定logback组件的任何属性是Joran的主要优势之一，如后面的章节所述。 

![appenderSyntax](https://logback.qos.ch/manual/images/chapters/configuration/appenderSyntax.png)

`<layout>`元素采用强制类属性，指定要实例化的布局类的完全限定名称。 

与`<appender>`元素一样，`<layout>`可以包含与布局实例的属性对应的其他元素。 

由于它是如此常见的情况，如果布局类是PatternLayout，则可以省略class属性，如默认类映射规则所指定。

`<encoder>`元素采用强制类属性，指定要实例化的编码器类的完全限定名称。 

由于它是如此常见的情况，如果编码器类是PatternLayoutEncoder，则可以省略class属性，如默认类映射规则所指定的那样。

- 例子

这样日志会同时出输出命令行和 myApp.log 文件。

```xml
<configuration>

    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>myApp.log</file>

        <encoder>
            <pattern>%date %level [%thread] %logger{10} [%file:%line] %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%msg%n</pattern>
        </encoder>
    </appender>

    <root level="debug">
        <appender-ref ref="FILE"/>
        <appender-ref ref="STDOUT"/>
    </root>

</configuration>
```

# Appenders积累

默认情况下，appender是累积的：记录器将记录到自身附加的appender（如果有的话）以及附加到其祖先的所有appender。 

因此，将相同的appender附加到多个记录器将导致日志记录输出重复。

```xml
<configuration>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <logger name="com.github.houbb">
        <appender-ref ref="STDOUT" />
    </logger>

    <root level="debug">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```

日志会被重复输出。

## 重写默认的行为

如果默认累积行为证明不适合您的需要，您可以通过将additivity标志设置为false来覆盖它。 

因此，记录器树中的分支可以将输出定向到与树的其余部分不同的一组appender。

```xml
<configuration>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <logger name="com.github.houbb" additivity="false">
        <appender-ref ref="STDOUT" />
    </logger>

    <root level="debug">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```

注意属性 `additivity="false"`，这样配置之后，只会打印一次。

# 设置变量

## 设置 context 名称

如前一章所述，每个记录器都附加到记录器上下文。 默认情况下，记录器上下文称为“默认”。 

但是，您可以在`<contextName>`配置指令的帮助下设置不同的名称。 

请注意，一旦设置，就无法更改记录器上下文名称。 设置上下文名称是一种简单而直接的方法，以便区分记录到同一目标的多个应用程序。


- logback.xml

```xml
<configuration>
    <contextName>logback-learn-context</contextName>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d %contextName [%t] %level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="debug">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```

日志信息：

```
2018-11-20 20:22:47,107 logback-learn-context [main] INFO c.g.h.l.learn.config.AutoConfigDemo - Entering application.
2018-11-20 20:22:47,109 logback-learn-context [main] DEBUG c.g.h.l.learn.config.AutoConfigDemo - Debug info...
2018-11-20 20:22:47,109 logback-learn-context [main] INFO c.g.h.l.learn.config.AutoConfigDemo - Exiting application.
```

## 变量替换

注意本文档的早期版本使用术语“属性替换”而不是术语“变量”。 

请考虑这两个术语是否可以互换，尽管后一术语表达了更清晰的含义。

与许多脚本语言一样，logback配置文件支持变量的定义和替换。 

变量有一个范围（见下文）。 此外，变量可以在配置文件本身，外部文件，外部资源中定义，甚至可以动态计算和定义。 

变量替换可以发生在配置文件中可以指定值的任何位置。 

变量替换的语法类似于Unix shell的语法。 

开头`$ {`和结束`}`之间的字符串被解释为对属性值的引用。 

对于属性aName，字符串“$ {aName}”将替换为aName属性保存的值。

因为它们经常派上用场，所以`HOSTNAME`和`CONTEXT_NAME`变量会自动定义并具有上下文范围。 

鉴于在某些环境中计算主机名可能需要一些时间，其值会被懒惰地计算（仅在需要时）。 

此外，可以直接在配置中设置HOSTNAME。

## 定义变量

变量可以在配置文件本身中一次定义一个，也可以从外部属性文件或外部资源批量加载。 

由于历史原因，用于定义变量的XML元素是`<property>`，
尽管在logback 1.0.7及更高版本中元素`<variable>`可以互换使用。

下一个示例显示了在配置文件开头声明的变量。 

然后在文件的下方使用它来指定输出文件的位置。

```xml
<configuration>

  <property name="USER_HOME" value="/home/sebastien" />

  <appender name="FILE" class="ch.qos.logback.core.FileAppender">
    <file>${USER_HOME}/myApp.log</file>
    <encoder>
      <pattern>%msg%n</pattern>
    </encoder>
  </appender>

  <root level="debug">
    <appender-ref ref="FILE" />
  </root>
</configuration>
```

`USER_HOME` 根据不同的操作系统来设置，才更加人性化。

# 参考资料

https://logback.qos.ch/manual/configuration.html

* any list
{:toc}