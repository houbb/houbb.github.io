---
layout: post
title: Log4j2-20-Custom Log Levels 自定义日志级别
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, apache, log4j2]
published: true
---

# 在代码中定义自定义日志级别

Log4J 2支持自定义日志级别。自定义日志级别可以在代码或配置中定义。

要在代码中定义自定义的日志级别，请使用 level. forname() 方法。

此方法为指定的名称创建一个新级别。定义了日志级别后，可以调用Logger.log()方法并传入自定义日志级别来记录该级别的消息:

```java
// This creates the "VERBOSE" level if it does not exist yet.
final Level VERBOSE = Level.forName("VERBOSE", 550);

final Logger logger = LogManager.getLogger();
logger.log(VERBOSE, "a verbose message"); // use the custom VERBOSE level

// Create and use a new custom level "DIAG".
logger.log(Level.forName("DIAG", 350), "a diagnostic message");

// Use (don't create) the "DIAG" custom level.
// Only do this *after* the custom level is created!
logger.log(Level.getLevel("DIAG"), "another diagnostic message");

// Using an undefined level results in an error: Level.getLevel() returns null,
// and logger.log(null, "message") throws an exception.
logger.log(Level.getLevel("FORGOT_TO_DEFINE"), "some message"); // throws exception!
```

在定义自定义日志级别时，intLevel参数(上面例子中的550和350)确定自定义级别相对于Log4J 2内置的标准级别存在的位置。

作为参考，下表显示了内置日志级别的intLevel。

## Standard log levels built-in to Log4J

| Standard Level | intLevel |
|:---|:---|
| OFF	| 0 | 
| FATAL	       | 100 |
| ERROR	       | 200 |
| WARN	       | 300 |
| INFO	       | 400 |
| DEBUG	       | 500 |
| TRACE	       | 600 |
| ALL	       | Integer.MAX_VALUE |

# 在配置中自定义日志级别

自定义日志级别也可以在配置中定义。

这对于在日志过滤器或appender过滤器中使用自定义级别很方便。

与在代码中定义日志级别类似，必须先定义自定义级别，然后才能使用它。

如果日志记录器或appender配置为未定义级别，则该日志记录器或appender将无效，不会处理任何日志事件。

CustomLevel配置元素创建一个自定义级别。

在内部，它调用了上面讨论过的Level.forName()方法。

## CustomLevel Parameters

| Parameter Name	| Type	| Description |
|:----|:----|:----|
| name	    | String	| 自定义级别的名称。注意，级别名称区分大小写。约定是使用所有大写字母的名称。 |
| intLevel	| integer	| 确定自定义级别相对于Log4J 2内置的标准级别存在的位置(参见上面的表)。 |

下面的示例展示了一个配置，该配置定义了一些自定义日志级别，并使用自定义日志级别过滤发送到控制台的日志事件。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
  <!-- Define custom levels before using them for filtering below. -->
  <CustomLevels>
    <CustomLevel name="DIAG" intLevel="350" />
    <CustomLevel name="NOTICE" intLevel="450" />
    <CustomLevel name="VERBOSE" intLevel="550" />
  </CustomLevels>
 
  <Appenders>
    <Console name="Console" target="SYSTEM_OUT">
      <PatternLayout pattern="%d %-7level %logger{36} - %msg%n"/>
    </Console>
    <File name="MyFile" fileName="logs/app.log">
      <PatternLayout pattern="%d %-7level %logger{36} - %msg%n"/>
    </File>
  </Appenders>
  <Loggers>
    <Root level="trace">
      <!-- Only events at DIAG level or more specific are sent to the console. -->
      <AppenderRef ref="Console" level="diag" />
      <AppenderRef ref="MyFile" level="trace" />
    </Root>
  </Loggers>
</Configuration>
```

# 内置日志级别的便利方法

内置的日志级别在Logger接口上有一组方便的方法，使它们更容易使用。

例如，Logger接口有24个debug()方法，支持调试级别:

```java
// convenience methods for the built-in DEBUG level
debug(Marker, Message)
debug(Marker, Message, Throwable)
debug(Marker, Object)
debug(Marker, Object, Throwable)
debug(Marker, String)
debug(Marker, String, Object...)
debug(Marker, String, Throwable)
debug(Message)
debug(Message, Throwable)
debug(Object)
debug(Object, Throwable)
debug(String)
debug(String, Object...)
debug(String, Throwable)
// lambda support methods added in 2.4
debug(Marker, MessageSupplier)
debug(Marker, MessageSupplier, Throwable)
debug(Marker, String, Supplier<?>...)
debug(Marker, Supplier<?>)
debug(Marker, Supplier<?>, Throwable)
debug(MessageSupplier)
debug(MessageSupplier, Throwable)
debug(String, Supplier<?>...)
debug(Supplier<?>)
debug(Supplier<?>, Throwable)
```

对于其他内置级别也存在类似的方法。相比之下，自定义级别需要作为额外的参数传递日志级别。

```java
// need to pass the custom level as a parameter
logger.log(VERBOSE, "a verbose message");
logger.log(Level.forName("DIAG", 350), "another message");
```

如果自定义级别也能有同样的易用性，那就太好了，这样在声明自定义的VERBOSE/DIAG级别后，我们可以使用如下代码:

```java
// nice to have: descriptive methods and no need to pass the level as a parameter
logger.verbose("a verbose message");
logger.diag("another message");
logger.diag("java 8 lambda expression: {}", () -> someMethod());
```

标准的记录器接口不能为自定义级别提供方便的方法，但接下来的几节介绍了一个代码生成工具来创建记录器，旨在使自定义级别像内置级别一样易于使用。

# 增加或替换日志级别

我们假设大多数用户想在Logger接口中添加自定义级别的方法，除了现有的trace()、debug()、info()、…内置日志级别的方法。

还有另一个用例，域特定语言日志记录器，我们想要替换现有的trace()， debug()， info()，…使用全自定义方法的方法。

例如，对于医疗设备，只能有critical()、warning()和advisory()方法。另一个例子是只有defcon1()、defcon2()和defcon3()关卡的游戏。

如果可以隐藏现有的日志级别，用户就可以自定义日志器接口以满足他们的需求。例如，有些人可能不希望有FATAL或TRACE级别。他们希望能够创建一个只有debug()、info()、warn()和error()方法的自定义记录器。

# 为自定义记录器包装器生成源代码

常见的Log4J用法是从LogManager中获取Logger接口的实例，并调用该接口上的方法。然而，自定义日志级别是未知的，因此Log4J不能为这些自定义日志级别提供方便的方法接口。

为了解决这个问题，Log4J提供了一个工具，可以为Logger wrapper生成源代码。生成的包装类为每个自定义日志级别提供了方便的方法，使自定义级别像内置级别一样易于使用。

有两种包装:一种扩展Logger API(向内置级别添加方法)，另一种自定义Logger API(替换内置方法)。

在为包装类生成源代码时，需要指定:

- 要生成的类的完全限定名

- 自定义等级的列表，以支持和他们的智力水平相对强度

- 是否扩展Logger(并保留现有的内置方法)或仅具有用于自定义日志级别的方法

然后，您可以将生成的源代码包含在希望使用自定义日志级别的项目中。

# 生成的Logger Wrapper的示例用法

下面是一个如何使用自定义级别DIAG, NOTICE和VERBOSE的生成logger包装器的示例:

```java
// ExtLogger is a generated logger wrapper
import com.mycompany.myproject.ExtLogger;
 
public class MyService {
    // instead of Logger logger = LogManager.getLogger(MyService.class):
    private static final ExtLogger logger = ExtLogger.create(MyService.class);
 
    public void demoExtendedLogger() {
        // ...
        logger.trace("the built-in TRACE level");
        logger.verbose("a custom level: a VERBOSE message");
        logger.debug("the built-in DEBUG level");
        logger.notice("a custom level: a NOTICE message");
        logger.info("the built-in INFO level");
        logger.diag("a custom level: a DIAG message");
        logger.warn("the built-in WARN level");
        logger.error("the built-in ERROR level");
        logger.fatal("the built-in FATAL level");
        logger.notice("java 8 lambda expression only executed if NOTICE is enabled: {}", () -> someMethod());
        // ...
    }
    ...
}
```

# 生成扩展记录器

使用下面的命令来生成一个logger wrapper，它会在内置方法的基础上添加方法:

```
java -cp log4j-core-2.20.0.jar org.apache.logging.log4j.core.tools.ExtendedLoggerGenerator \
        com.mycomp.ExtLogger DIAG=350 NOTICE=450 VERBOSE=550 > com/mycomp/ExtLogger.java
```

这将生成一个记录器包装器的源代码，该包装器具有针对内置级别以及指定的自定义级别的便利方法。该工具将生成的源代码打印到控制台。通过附加“> filename”，可以将输出重定向到一个文件。

注意:在log4j-2.9之前，这个工具是一个内部类Generate$ExtendedLogger。

在Unix/Mac/Linux的bash shell下，美元字符$需要转义，因此类名应该在单引号 `org.apache.logging.log4j.core.tools.Generate$ExtendedLogger` 之间。

# 生成自定义日志记录器

使用下面的命令生成一个logger wrapper，隐藏内置的级别，只包含自定义级别:

```
java -cp log4j-core-2.20.0.jar org.apache.logging.log4j.core.tools.CustomLoggerGenerator \
        com.mycomp.MyLogger DEFCON1=350 DEFCON2=450 DEFCON3=550 > com/mycomp/MyLogger.java
```

这将为记录器包装器生成源代码，该包装器只有针对指定的自定义级别的方便方法，而没有针对内置级别的方便方法。该工具将生成的源代码打印到控制台。通过附加“> filename”，可以将输出重定向到一个文件。

注意:在log4j-2.9之前，这个工具是一个内部类Generate$ExtendedLogger。

在Unix/Mac/Linux的bash shell下，美元字符$需要转义，因此类名应该在单引号 `org.apache.logging.log4j.core.tools.Generate$CustomLogger` 之间。

# 参考资料

https://logging.apache.org/log4j/2.x/manual/customloglevels.html

* any list
{:toc}
