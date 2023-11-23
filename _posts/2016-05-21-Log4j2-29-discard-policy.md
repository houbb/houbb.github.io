---
layout: post
title: Log4j2-29-log4j2 discard policy 极端情况下的丢弃策略 同步+异步配置的例子
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, apache, best-practise, log4j2]
published: true
---

# Log4j2异步日志、同步日志和混合日志的配置详解 

Log4j 2中记录日志的方式有同步日志和异步日志两种方式，其中异步日志又可分为使用AsyncAppender和使用AsyncLogger两种方式。

# 异步日志(性能最好，推荐使用)

异步日志情况下，增加 Disruptor 队列长度并配置队列堵塞丢弃策略从可以增加高并发下的性能，实现如下：

(1) jvm 参数：-DLog4jAsyncQueueFullPolicy=Discard -DLog4j2.asyncLoggerRingBufferSize：指定队列的长度（根据实际压测情况调试，一般不会指定长度）

(2) 或者在log4j2.component.properties中配置丢弃策略：

```
log4jContextSelector=org.apache.logging.log4j.core.async.AsyncLoggerContextSelector
log4j2.asyncLoggerRingBufferSize=根据实际压测情况调试
```


# 队列大小源码：

```java
final class DisruptorUtil {
    private static final Logger LOGGER = StatusLogger.getLogger();
    private static final int RINGBUFFER_MIN_SIZE = 128;
    private static final int RINGBUFFER_DEFAULT_SIZE = 256 * 1024;
    private static final int RINGBUFFER_NO_GC_DEFAULT_SIZE = 4 * 1024;
......
    static int calculateRingBufferSize(final String propertyName) {
// 队列大小      
int ringBufferSize = Constants.ENABLE_THREADLOCALS ? RINGBUFFER_NO_GC_DEFAULT_SIZE : RINGBUFFER_DEFAULT_SIZE;
        final String userPreferredRBSize = PropertiesUtil.getProperties().getStringProperty(propertyName,
                String.valueOf(ringBufferSize));
        try {
            int size = Integers.parseInt(userPreferredRBSize);
            if (size < RINGBUFFER_MIN_SIZE) {
                size = RINGBUFFER_MIN_SIZE;
                LOGGER.warn("Invalid RingBufferSize {}, using minimum size {}.", userPreferredRBSize,
                        RINGBUFFER_MIN_SIZE);
            }
            ringBufferSize = size;
        } catch (final Exception ex) {
            LOGGER.warn("Invalid RingBufferSize {}, using default size {}.", userPreferredRBSize, ringBufferSize);
        }
        return Integers.ceilingNextPowerOfTwo(ringBufferSize);
    }
...
```

# 同步日志

所谓同步日志，即当输出日志时，必须等待日志输出语句执行完毕后，才能执行后面的业务逻辑语句。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration>

    <Properties>
        <!-- 日志输出级别 -->
        <Property name="LOG_INFO_LEVEL" value="info"/>
        <!-- error级别日志 -->
        <Property name="LOG_ERROR_LEVEL" value="error"/>
        <!-- 在当前目录下创建名为log目录做日志存放的目录 -->
        <Property name="LOG_HOME" value="./log"/>
        <!-- 档案日志存放目录 -->
        <Property name="LOG_ARCHIVE" value="./log/archive"/>
        <!-- 模块名称， 影响日志配置名，日志文件名，根据自己项目进行配置 -->
        <Property name="LOG_MODULE_NAME" value="spring-boot"/>
        <!-- 日志文件大小，超过这个大小将被压缩 -->
        <Property name="LOG_MAX_SIZE" value="100 MB"/>
        <!-- 保留多少天以内的日志 -->
        <Property name="LOG_DAYS" value="15"/>
        <!--输出日志的格式：%d表示日期，%thread表示线程名，%-5level：级别从左显示5个字符宽度， %msg：日志消息，%n是换行符 -->
        <Property name="LOG_PATTERN" value="%d [%t] %-5level %logger{0} - %msg%n"/>
        <!--interval属性用来指定多久滚动一次-->
        <Property name="TIME_BASED_INTERVAL" value="1"/>
    </Properties>

    <Appenders>
        <!-- 控制台输出 -->
        <Console name="STDOUT" target="SYSTEM_OUT">
            <!--输出日志的格式-->
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <!--控制台只输出level及其以上级别的信息（onMatch），其他的直接拒绝（onMismatch）-->
            <ThresholdFilter level="${LOG_INFO_LEVEL}" onMatch="ACCEPT" onMismatch="DENY"/>
        </Console>

        <!-- 这个会打印出所有的info级别以上，error级别一下的日志，每次大小超过size或者满足TimeBasedTriggeringPolicy，则日志会自动存入按年月日建立的文件夹下面并进行压缩，作为存档-->
        <RollingRandomAccessFile name="RollingRandomAccessFileInfo" fileName="${LOG_HOME}/${LOG_MODULE_NAME}-infoLog.log" filePattern="${LOG_ARCHIVE}/${LOG_MODULE_NAME}-infoLog-%d{yyyy-MM-dd}-%i.log.gz">
            <Filters>
                <!--如果是error级别拒绝，设置 onMismatch="NEUTRAL" 可以让日志经过后续的过滤器-->
                <ThresholdFilter level="${LOG_ERROR_LEVEL}" onMatch="DENY" onMismatch="NEUTRAL"/>
                <!--如果是info\warn输出-->
                <ThresholdFilter level="${LOG_INFO_LEVEL}" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <!--interval属性用来指定多久滚动一次，根据当前filePattern设置是1天滚动一次-->
                <TimeBasedTriggeringPolicy interval="${TIME_BASED_INTERVAL}"/>
                <SizeBasedTriggeringPolicy size="${LOG_MAX_SIZE}"/>
            </Policies>
            <!-- DefaultRolloverStrategy属性如不设置，则默认同一文件夹下最多保存7个文件-->
            <DefaultRolloverStrategy max="${LOG_DAYS}"/>
        </RollingRandomAccessFile>

        <!--只记录error级别以上的日志，与info级别的日志分不同的文件保存-->
        <RollingRandomAccessFile name="RollingRandomAccessFileError" fileName="${LOG_HOME}/${LOG_MODULE_NAME}-errorLog.log" filePattern="${LOG_ARCHIVE}/${LOG_MODULE_NAME}-errorLog-%d{yyyy-MM-dd}-%i.log.gz">
            <Filters>
                <ThresholdFilter level="${LOG_ERROR_LEVEL}" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="${TIME_BASED_INTERVAL}"/>
                <SizeBasedTriggeringPolicy size="${LOG_MAX_SIZE}"/>
            </Policies>
            <DefaultRolloverStrategy max="${LOG_DAYS}"/>
        </RollingRandomAccessFile>

    </Appenders>

    <Loggers>
        <!-- 开发环境使用 -->
        <!--<Root level="${LOG_INFO_LEVEL}"> <AppenderRef ref="STDOUT"/> </Root>-->

        <!-- 测试，生产环境使用 -->
        <Root level="${LOG_INFO_LEVEL}">
            <AppenderRef ref="RollingRandomAccessFileInfo"/>
            <AppenderRef ref="RollingRandomAccessFileError"/>
        </Root>
    </Loggers>

</Configuration>
```

# 混合同步和异步日志

Log4j-2.9及更高版本在类路径上需要 disruptor-3.3.4.jar 或更高版本。

在Log4j-2.9之前，需要disruptor-3.0.0.jar或更高版本。无需将系统属性“Log4jContextSelector”设置为任何值。

可以在配置中组合同步和异步记录器。这为您提供了更大的灵活性，但代价是性能略有下降（与使所有记录器异步相比）。

使用 `<asyncRoot>` 或 `<asyncLogger>` 配置元素指定需要异步的记录器。

配置只能包含一个根记录器（`<root>` 或 `<asyncRoot>` 元素），但是可以组合异步和非异步记录器。

例如，包含 `<asyncLogger>` 元素的配置文件也可以包含 `<root>` 和同步记录器的元素。

默认情况下，异步记录器不会将位置传递给 I/O 线程。

如果您的某个布局或自定义过滤器需要位置信息，则需要在所有相关记录器的配置中设置“includeLocation = true”，包括根记录器。

## 首先引入disruptor依赖

```xml
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.2</version>
</dependency>
```

## 混合异步记录器的配置可能如下所示：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration>

    <Properties>
        <!-- 日志输出级别 -->
        <Property name="LOG_INFO_LEVEL" value="info"/>
        <!-- error级别日志 -->
        <Property name="LOG_ERROR_LEVEL" value="error"/>
        <!-- 在当前目录下创建名为log目录做日志存放的目录 -->
        <Property name="LOG_HOME" value="./log"/>
        <!-- 档案日志存放目录 -->
        <Property name="LOG_ARCHIVE" value="./log/archive"/>
        <!-- 模块名称， 影响日志配置名，日志文件名，根据自己项目进行配置 -->
        <Property name="LOG_MODULE_NAME" value="spring-boot"/>
        <!-- 日志文件大小，超过这个大小将被压缩 -->
        <Property name="LOG_MAX_SIZE" value="100 MB"/>
        <!-- 保留多少天以内的日志 -->
        <Property name="LOG_DAYS" value="15"/>
        <!--输出日志的格式：%d表示日期，%thread表示线程名，%-5level：级别从左显示5个字符宽度， %msg：日志消息，%n是换行符 -->
        <Property name="LOG_PATTERN" value="%d [%t] %-5level %logger{0} - %msg%n"/>
        <!--interval属性用来指定多久滚动一次-->
        <Property name="TIME_BASED_INTERVAL" value="1"/>
    </Properties>

    <Appenders>
        <!-- 控制台输出 -->
        <Console name="STDOUT" target="SYSTEM_OUT">
            <!--输出日志的格式-->
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <!--控制台只输出level及其以上级别的信息（onMatch），其他的直接拒绝（onMismatch）-->
            <ThresholdFilter level="${LOG_INFO_LEVEL}" onMatch="ACCEPT" onMismatch="DENY"/>
        </Console>

        <!-- 这个会打印出所有的info级别以上，error级别一下的日志，每次大小超过size或者满足TimeBasedTriggeringPolicy，则日志会自动存入按年月日建立的文件夹下面并进行压缩，作为存档-->
        <!--异步日志会自动批量刷新，所以将immediateFlush属性设置为false-->
        <RollingRandomAccessFile name="RollingRandomAccessFileInfo" fileName="${LOG_HOME}/${LOG_MODULE_NAME}-infoLog.log" filePattern="${LOG_ARCHIVE}/${LOG_MODULE_NAME}-infoLog-%d{yyyy-MM-dd}-%i.log.gz" immediateFlush="false">
            <Filters>
                <!--如果是error级别拒绝，设置 onMismatch="NEUTRAL" 可以让日志经过后续的过滤器-->
                <ThresholdFilter level="${LOG_ERROR_LEVEL}" onMatch="DENY" onMismatch="NEUTRAL"/>
                <!--如果是info\warn输出-->
                <ThresholdFilter level="${LOG_INFO_LEVEL}" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <!--interval属性用来指定多久滚动一次，根据当前filePattern设置是1天滚动一次-->
                <TimeBasedTriggeringPolicy interval="${TIME_BASED_INTERVAL}"/>
                <SizeBasedTriggeringPolicy size="${LOG_MAX_SIZE}"/>
            </Policies>
            <!-- DefaultRolloverStrategy属性如不设置，则默认同一文件夹下最多保存7个文件-->
            <DefaultRolloverStrategy max="${LOG_DAYS}"/>
        </RollingRandomAccessFile>

        <!--只记录error级别以上的日志，与info级别的日志分不同的文件保存-->
        <RollingRandomAccessFile name="RollingRandomAccessFileError" fileName="${LOG_HOME}/${LOG_MODULE_NAME}-errorLog.log" filePattern="${LOG_ARCHIVE}/${LOG_MODULE_NAME}-errorLog-%d{yyyy-MM-dd}-%i.log.gz" immediateFlush="false">
            <Filters>
                <ThresholdFilter level="${LOG_ERROR_LEVEL}" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="${TIME_BASED_INTERVAL}"/>
                <SizeBasedTriggeringPolicy size="${LOG_MAX_SIZE}"/>
            </Policies>
            <DefaultRolloverStrategy max="${LOG_DAYS}"/>
        </RollingRandomAccessFile>

    </Appenders>

    <Loggers>
        <!-- 开发环境使用 -->
        <!--<Root level="${LOG_INFO_LEVEL}"> <AppenderRef ref="STDOUT"/> </Root>-->

        <!-- 测试，生产环境使用 -->
        <!-- 当使用<asyncLogger> or <asyncRoot>时，无需设置系统属性"Log4jContextSelector" -->
        <AsyncLogger name="com.jourwon" level="${LOG_INFO_LEVEL}" additivity="false">
            <AppenderRef ref="RollingRandomAccessFileInfo"/>
            <AppenderRef ref="RollingRandomAccessFileError"/>
        </AsyncLogger>

        <Root level="${LOG_INFO_LEVEL}">
            <AppenderRef ref="RollingRandomAccessFileInfo"/>
            <AppenderRef ref="RollingRandomAccessFileError"/>
        </Root>
    </Loggers>

</Configuration>
```

# 异步日志(性能最好，推荐使用)

Log4j-2.9及更高版本在类路径上需要disruptor-3.3.4.jar或更高版本。

在Log4j-2.9之前，需要disruptor-3.0.0.jar或更高版本。这是最简单的配置，并提供最佳性能。要使所有记录器异步，

请将disruptor jar添加到类路径，并将系统属性log4j2.contextSelector设置 为org.apache.logging.log4j.core.async.AsyncLoggerContextSelector。

默认情况下，异步记录器不会将位置传递给 I/O 线程。

如果您的某个布局或自定义过滤器需要位置信息，则需要在所有相关记录器的配置中设置“includeLocation = true”，包括根记录器。

## 首先引入disruptor依赖

```xml
<dependency>
    <groupId>com.lmax</groupId>
    <artifactId>disruptor</artifactId>
    <version>3.4.2</version>
</dependency>
```

## 配置

第二步（方式一）： 在src/java/resources目录添加log4j2.component.properties配置文件

```
# 设置异步日志系统属性
log4j2.contextSelector=org.apache.logging.log4j.core.async.AsyncLoggerContextSelector
```

第二步（方式二）： 通过JVM参数实现

```
-DLog4jContextSelector=org.apache.logging.log4j.core.async.AsyncLoggerContextSelector
```

配置如下所示：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration>

    <Properties>
        <!-- 日志输出级别 -->
        <Property name="LOG_INFO_LEVEL" value="info"/>
        <!-- error级别日志 -->
        <Property name="LOG_ERROR_LEVEL" value="error"/>
        <!-- 在当前目录下创建名为log目录做日志存放的目录 -->
        <Property name="LOG_HOME" value="./log"/>
        <!-- 档案日志存放目录 -->
        <Property name="LOG_ARCHIVE" value="./log/archive"/>
        <!-- 模块名称， 影响日志配置名，日志文件名，根据自己项目进行配置 -->
        <Property name="LOG_MODULE_NAME" value="spring-boot"/>
        <!-- 日志文件大小，超过这个大小将被压缩 -->
        <Property name="LOG_MAX_SIZE" value="100 MB"/>
        <!-- 保留多少天以内的日志 -->
        <Property name="LOG_DAYS" value="15"/>
        <!--输出日志的格式：%d表示日期，%thread表示线程名，%-5level：级别从左显示5个字符宽度， %msg：日志消息，%n是换行符 -->
        <Property name="LOG_PATTERN" value="%d [%t] %-5level %logger{0} - %msg%n"/>
        <!--interval属性用来指定多久滚动一次-->
        <Property name="TIME_BASED_INTERVAL" value="1"/>
    </Properties>

    <Appenders>
        <!-- 控制台输出 -->
        <Console name="STDOUT" target="SYSTEM_OUT">
            <!--输出日志的格式-->
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <!--控制台只输出level及其以上级别的信息（onMatch），其他的直接拒绝（onMismatch）-->
            <ThresholdFilter level="${LOG_INFO_LEVEL}" onMatch="ACCEPT" onMismatch="DENY"/>
        </Console>

        <!-- 这个会打印出所有的info级别以上，error级别一下的日志，每次大小超过size或者满足TimeBasedTriggeringPolicy，则日志会自动存入按年月日建立的文件夹下面并进行压缩，作为存档-->
        <!--异步日志会自动批量刷新，所以将immediateFlush属性设置为false-->
        <RollingRandomAccessFile name="RollingRandomAccessFileInfo" fileName="${LOG_HOME}/${LOG_MODULE_NAME}-infoLog.log" filePattern="${LOG_ARCHIVE}/${LOG_MODULE_NAME}-infoLog-%d{yyyy-MM-dd}-%i.log.gz" immediateFlush="false">
            <Filters>
                <!--如果是error级别拒绝，设置 onMismatch="NEUTRAL" 可以让日志经过后续的过滤器-->
                <ThresholdFilter level="${LOG_ERROR_LEVEL}" onMatch="DENY" onMismatch="NEUTRAL"/>
                <!--如果是info\warn输出-->
                <ThresholdFilter level="${LOG_INFO_LEVEL}" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <!--interval属性用来指定多久滚动一次，根据当前filePattern设置是1天滚动一次-->
                <TimeBasedTriggeringPolicy interval="${TIME_BASED_INTERVAL}"/>
                <SizeBasedTriggeringPolicy size="${LOG_MAX_SIZE}"/>
            </Policies>
            <!-- DefaultRolloverStrategy属性如不设置，则默认同一文件夹下最多保存7个文件-->
            <DefaultRolloverStrategy max="${LOG_DAYS}"/>
        </RollingRandomAccessFile>

        <!--只记录error级别以上的日志，与info级别的日志分不同的文件保存-->
        <RollingRandomAccessFile name="RollingRandomAccessFileError" fileName="${LOG_HOME}/${LOG_MODULE_NAME}-errorLog.log" filePattern="${LOG_ARCHIVE}/${LOG_MODULE_NAME}-errorLog-%d{yyyy-MM-dd}-%i.log.gz" immediateFlush="false">
            <Filters>
                <ThresholdFilter level="${LOG_ERROR_LEVEL}" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="${TIME_BASED_INTERVAL}"/>
                <SizeBasedTriggeringPolicy size="${LOG_MAX_SIZE}"/>
            </Policies>
            <DefaultRolloverStrategy max="${LOG_DAYS}"/>
        </RollingRandomAccessFile>

    </Appenders>

    <Loggers>
        <!-- 开发环境使用 -->
        <!--<Root level="${LOG_INFO_LEVEL}"> <AppenderRef ref="STDOUT"/> </Root>-->

        <!-- 测试，生产环境使用 -->
        <Root level="${LOG_INFO_LEVEL}" includeLocation="false">
            <AppenderRef ref="RollingRandomAccessFileInfo"/>
            <AppenderRef ref="RollingRandomAccessFileError"/>
        </Root>
    </Loggers>

</Configuration>
```

当配置AsyncLoggerContextSelector作为异步日志时，请确保在配置中使用普通的 `<root>` 和 `<logger>` 元素。

AsyncLoggerContextSelector将确保所有记录器都是异步的，使用的机制与配置 `<asyncRoot>` 或 `<asyncLogger>` 时的机制不同。

通过 `log.info(“是否为异步日志：{}”, AsyncLoggerContextSelector.isSelected());` 可以查看是否为异步日志。

| 日志输出方式    | 注释 |
|:---|:---|
| sync	        | 同步打印日志，日志输出与业务逻辑在同一线程内，当日志输出完毕，才能进行后续业务逻辑操作 |
| Async Appender	| 异步打印日志，内部采用ArrayBlockingQueue，对每个AsyncAppender创建一个线程用于处理日志输出。 |
| Async Logger	| 异步打印日志，采用了高性能并发框架Disruptor，创建一个线程用于处理日志输出。 |

# chat

## Q1-介绍一下 log4j2 的丢弃策略

log4j2 是一个流行的 Java 日志框架，它提供了丰富的配置选项来管理日志输出。

在 log4j2 中，丢弃策略（Discarding Strategy）用于处理日志事件超过指定阈值时的行为。

log4j2 提供了多种丢弃策略，以下是其中一些常用的策略：

1. DefaultDiscardPolicy（默认策略）：当日志事件超过日志队列的容量时，新的日志事件将被丢弃，不会进一步处理。

2. DiscardOldestPolicy（丢弃最旧策略）：当日志事件超过日志队列的容量时，队列中最旧的日志事件将被丢弃，为新的日志事件腾出空间。

3. DiscardPolicy（丢弃策略）：当日志事件超过日志队列的容量时，新的日志事件将被丢弃，不会进一步处理。与 DefaultDiscardPolicy 的区别在于，DiscardPolicy 不会打印任何警告消息。

4. AsyncQueueFullPolicy（异步队列满策略）：当异步日志队列满时，新的日志事件将被丢弃，并触发一个警告消息。

这些丢弃策略可以通过 log4j2 的配置文件进行设置。您可以根据具体的需求选择适合的丢弃策略来管理日志事件的处理。请注意，选择适当的丢弃策略需要权衡日志事件的重要性和系统资源的利用情况。

请注意，上述策略仅为常见的丢弃策略示例，log4j2 还提供了其他自定义策略的选项。具体的配置和使用方式可以参考 log4j2 的官方文档或相关资源。

## Q2-log4j2 异步输出，如何配置对应的丢弃策略？系统的默认值是什么？

在 log4j2 中配置异步输出和对应的丢弃策略需要进行以下步骤：

1. 配置异步日志记录器：在 log4j2 的配置文件中，可以使用  `<AsyncLogger>`  元素来配置异步输出。

例如：

```xml
<AsyncLogger name="com.example.MyLogger" level="info" additivity="false">
   <AppenderRef ref="MyAppender"/>
</AsyncLogger>
```

在上述示例中，我们配置了一个名为 "com.example.MyLogger" 的异步日志记录器，并指定了日志级别为 "info"，以及要使用的 Appender。

2. 配置丢弃策略：在  `<AsyncLogger>`  元素中，可以使用  `<AsyncQueueFullPolicy>`  元素来配置丢弃策略。

例如：

```xml
<AsyncLogger name="com.example.MyLogger" level="info" additivity="false">
   <AppenderRef ref="MyAppender"/>
   <AsyncQueueFullPolicy>
      <DiscardOldestMessage/>
   </AsyncQueueFullPolicy>
</AsyncLogger>
```

在上述示例中，我们在  `<AsyncLogger>`  元素中添加了  `<AsyncQueueFullPolicy>`  元素，并指定了丢弃策略为 "DiscardOldestMessage"，即丢弃最旧的日志事件。

3. 默认丢弃策略：log4j2 的默认丢弃策略是  `DefaultAsyncQueueFullPolicy` ，它会直接丢弃新的日志事件。

需要注意的是，丢弃策略的配置可以根据具体需求进行调整。

除了  `<DiscardOldestMessage>`  策略外，log4j2 还提供了其他丢弃策略，如  `<DiscardNewestMessage>` （丢弃最新的日志事件）和  `<DiscardThresholdMessage>` （丢弃超过指定阈值的日志事件）等。

请注意，具体的配置和使用方式可以参考 log4j2 的官方文档或相关资源，以确保正确配置异步输出和丢弃策略。

## Q3-log4j2 中 log4j2.component.properties 配置丢弃策略怎么配置？系统的默认值是什么？

在 log4j2 中，您可以使用 log4j2.component.properties 文件来配置丢弃策略。以下是配置丢弃策略的步骤：

1. 创建 log4j2.component.properties 文件：在您的 log4j2 配置文件所在的目录中，创建一个名为 log4j2.component.properties 的文件。

2. 配置丢弃策略：在 log4j2.component.properties 文件中，添加以下配置行来指定丢弃策略：
AsyncQueueFullPolicy=org.apache.logging.log4j.core.async.DefaultAsyncQueueFullPolicy
在上述示例中，我们将丢弃策略设置为默认的 DefaultAsyncQueueFullPolicy。

3. 系统默认值：log4j2 的默认丢弃策略是 DefaultAsyncQueueFullPolicy，它会直接丢弃新的日志事件。

需要注意的是，log4j2.component.properties 文件中的配置将适用于整个 log4j2 配置，而不仅仅是丢弃策略。您可以在该文件中添加其他属性和配置，以满足您的需求。

请注意，具体的配置和使用方式可以参考 log4j2 的官方文档或相关资源，以确保正确配置丢弃策略和其他组件属性。

# 参考资料

[Log4j2异步日志、同步日志和混合日志的配置详解](https://www.cnblogs.com/damoblog/p/17352615.html)

* any list
{:toc}
