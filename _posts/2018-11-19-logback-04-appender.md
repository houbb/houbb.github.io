---
layout: post
title: Logback-04-Appender
date: 2018-11-19 08:11:55 +0800
categories: [Log]
tags: [log, sh]
published: true
excerpt: Logback Appender
---

# Appender

## Appender 是什么

Logback将记录事件的任务委托给称为appender的组件。 

Appenders必须实现 `ch.qos.logback.core.Appender` 接口。

该界面的显着方法总结如下：

```java
public interface Appender<E> extends LifeCycle, ContextAware, FilterAttachable {

  public String getName();
  public void setName(String name);
  void doAppend(E event);
  
}
```

Appenders最终负责输出日志记录事件。

但是，他们可以将事件的实际格式委派给布局或编码器对象。每个布局/编码器与一个且仅一个appender相关联，称为拥有的appender。

一些appender具有内置或固定的事件格式。因此，它们不需要也没有布局/编码器。

例如，SocketAppender只是在通过线路传输之前序列化记录事件。

# AppenderBase

`ch.qos.logback.core.AppenderBase` 类是实现Appender接口的抽象类。

它提供了所有appender共享的基本功能，例如获取或设置其名称，激活状态，布局和过滤器的方法。

它是带有logback的所有appender的超类。虽然是一个抽象类，但AppenderBase实际上在Append接口中实现了doAppend()方法。

也许讨论AppenderBase类的最清晰的方法是提供实际源代码的摘录。

```java
public synchronized void doAppend(E eventObject) {

  // prevent re-entry.
  if (guard) {
    return;
  }

  try {
    guard = true;

    if (!this.started) {
      if (statusRepeatCount++ < ALLOWED_REPEATS) {
        addStatus(new WarnStatus(
            "Attempted to append to non started appender [" + name + "].",this));
      }
      return;
    }

    if (getFilterChainDecision(eventObject) == FilterReply.DENY) {
      return;
    }
    
    // ok, we now invoke the derived class's implementation of append
    this.append(eventObject);

  } finally {
    guard = false;
  }
}
```

doAppend()方法的这种实现是同步的。因此，从不同线程登录到同一个appender是安全的。当一个线程（比如T）正在执行doAppend()方法时，其他线程的后续调用将排队，直到T离开doAppend()方法，确保T对appender的独占访问。

由于这种同步并不总是合适，因此logback附带了ch.qos.logback.core.UnsynchronizedAppenderBase，它与AppenderBase类非常相似。为简明起见，我们将在本文档的其余部分讨论UnsynchronizedAppenderBase。

doAppend()方法的第一件事是检查guard是否设置为true。如果是，它会立即退出。如果未设置防护，则在下一个语句中将其设置为true。守卫确保doAppend()方法不会递归调用自身。试想一下，一个名为append()方法之外的组件想要记录一些东西。它的调用可以被引导到刚刚调用它的同一个appender，导致无限循环和堆栈溢出。

在以下语句中，我们检查started字段是否为true。如果不是，doAppend()将发送警告消息并返回。换句话说，一旦appender关闭，就不可能写入它。 Appender对象实现了LifeCycle接口，这意味着它们实现了start()，stop()和isStarted()方法。在设置了appender的所有属性后，Joran（logback的配置框架）调用start()方法来通知appender激活其属性。根据其类型，如果缺少某些属性或者由于各种属性之间的干扰，则appender可能无法启动。例如，假设文件创建依赖于截断模式，则FileAppender不能对其File选项的值起作用，直到Append选项的值也确定已知。显式激活步骤确保appender在其值已知后对其属性进行操作。

如果appender无法启动或已停止，将通过logback的内部状态管理系统发出警告消息。在多次尝试之后，为了避免使用相同警告消息的副本使内部状态系统泛滥，doAppend()方法将停止发出这些警告。

下一个if语句检查附加过滤器的结果。根据过滤器链产生的决定，可以拒绝或明确接受事件。如果过滤器链没有做出决定，则默认接受事件。

然后，doAppend()方法调用派生类的append()方法实现。此方法执行将事件附加到适当设备的实际工作。

最后，释放保护以便允许随后调用doAppend()方法。

对于本手册的其余部分，我们为通过setter和getter方法使用JavaBeans内省动态推断的任何属性保留术语“选项”或“属性”。

# logback核心

Logback-core奠定了构建其他logback模块的基础。 

通常，logback-core中的组件需要一些（尽管很少）定制。 

但是，在接下来的几节中，我们将描述几个可以立即使用的appender。

# OutputStreamAppender

OutputStreamAppender将事件附加到java.io.OutputStream。 

此类提供其他appender构建的基本服务。 

用户通常不直接实例化OutputStreamAppender对象，因为通常java.io.OutputStream类型不能方便地映射到字符串，因为无法在配置脚本中指定目标OutputStream对象。 

简而言之，您无法从配置文件配置OutputStreamAppender。 

但是，这并不意味着OutputStreamAppender缺少可配置的属性。 

接下来描述这些属性。

## 属性

- encoder 

确定将事件写入底层OutputStreamAppender的方式。 

- immediateFlush 

immediateFlush的默认值为'true'。 

立即刷新输出流可确保立即写出日志记录事件，并且在应用程序退出而未正确关闭appender的情况下不会丢失。 

另一方面，将此属性设置为“false”可能会使记录吞吐量翻两番（您的里程可能会有所不同）。 

同样，如果将immediateFlush设置为“false”，并且在应用程序退出时未正确关闭appender，则可能会丢失尚未写入磁盘的日志记录事件。

OutputStreamAppender是其他三个appender的超类，即ConsoleAppender，FileAppender，它又是RollingFileAppender的超类。 

下图说明了OutputStreamAppender及其子类的类图。

![appenderClassDiagram.jpg](https://logback.qos.ch/manual/images/chapters/appenders/appenderClassDiagram.jpg)

# ConsoleAppender

ConsoleAppender，如名称所示，附加在控制台上，或者更确切地说，附加在System.out或System.err上，前者是默认目标。 

ConsoleAppender借助用户指定的编码器格式化事件。 

System.out和System.err都是java.io.PrintStream类型。 

因此，它们被包装在OutputStreamWriter中，后者缓冲I/O操作。

## 属性

- encoder 

Encoder请参见OutputStreamAppender属性。

- target 

String值System.out或System.err之一。 默认目标是System.out。

- withJansi 

默认情况下将withJansi属性设置为false。 

将withJansi设置为true可激活Jansi库，该库在Windows机器上提供对ANSI颜色代码的支持。 

在Windows主机上，如果此属性设置为true，则应在类路径上放置“org.fusesource.jansi：jansi：1.9”。 

请注意，默认情况下，基于Unix的操作系统（如Linux和Mac OS X）支持ANSI颜色代码。

## 案例

```xml
<configuration>

  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <!-- encoders are assigned the type
         ch.qos.logback.classic.encoder.PatternLayoutEncoder by default -->
    <encoder>
      <pattern>%-4relative [%thread] %-5level %logger{35} - %msg %n</pattern>
    </encoder>
  </appender>

  <root level="DEBUG">
    <appender-ref ref="STDOUT" />
  </root>
</configuration>
```

# FileAppender

FileAppender是OutputStreamAppender的子类，它将日志事件追加到文件中。 

目标文件由“文件”选项指定。 如果文件已存在，则根据append属性的值将其附加到或截断。

## 属性

- append

boolean 类型

如果为true，则在现有文件的末尾附加事件。

否则，如果append为false，则截断任何现有文件。默认情况下，append选项设置为true。

- encoder 

Encoder请参见OutputStreamAppender属性。

- file 

String 类型

要写入的文件的名称。

如果该文件不存在，则创建该文件。

在MS Windows平台上，用户经常忘记逃避反斜杠。

例如，值 `c:\temp\test.log` 不太可能被正确解释，因为'\t'是解释为单个制表符（`\u0009`）的转义序列。

正确的值可以指定为 `c/temp/test.log`，也可以指定为 `c\\temp\\test.log`。 

“文件”选项没有默认值。


如果文件的父目录不存在，FileAppender将自动创建它，包括任何必要但不存在的父目录。

- prudent 

boolean 类型

在谨慎模式下，FileAppender将安全地写入指定的文件，即使存在运行在不同JVM中的其他FileAppender实例，也可能在不同的主机上运行。 

prudent模式的默认值为false。

尽管存在一些限制，但谨慎模式可与RollingFileAppender结合使用。

谨慎模式意味着append属性自动设置为true。

谨慎更依赖于独占文件锁。实验表明，文件锁定大约是编写日志记录事件的三倍（x3）。在写入位于本地硬盘上的文件的“普通”PC上，当谨慎模式关闭时，编写单个日志记录事件大约需要10微秒。当谨慎模式打开时，输出单个记录事件大约需要30微秒。这意味着当谨慎模式关闭时记录吞吐量为每秒100'000个事件，而谨慎模式下每秒记录大约33'000个事件。

谨慎模式有效地序列化写入同一文件的所有JVM之间的I/O操作。因此，随着竞争访问文件的JVM数量的增加，每个I/O操作引起的延迟也会增加。只要I/O操作的总数大约为每秒20个日志请求，对性能的影响应该可以忽略不计。每秒生成100个或更多I/O操作的应用程序可以看到对性能的影响，应避免使用谨慎模式。

联网文件锁当日志文件位于网络文件系统上时，审慎模式的成本会更高。同样重要的是，网络文件系统上的文件锁定有时会受到强烈偏见，使得当前拥有锁定的进程会在其释放时立即重新获得锁定。因此，当一个进程占用日志文件的锁定时，其他进程将等待锁定到出现死锁的点。

谨慎模式的影响很大程度上取决于网络速度以及操作系统实现细节。

我们提供了一个名为FileLockSimulator的非常小的应用程序，它可以帮助您模拟环境中谨慎模式的行为。


默认情况下，每个日志事件都会立即刷新到基础输出流。 

这种默认方法更安全，因为如果应用程序在没有正确关闭appender的情况下退出，则日志事件不会丢失。 

但是，为了显着增加日志记录吞吐量，您可能希望将immediateFlush属性设置为false。

下面是FileAppender的配置文件示例：

```xml
<configuration>

  <appender name="FILE" class="ch.qos.logback.core.FileAppender">
    <file>testFile.log</file>
    <append>true</append>
    <!-- set immediateFlush to false for much higher logging throughput -->
    <immediateFlush>true</immediateFlush>
    <!-- encoders are assigned the type
         ch.qos.logback.classic.encoder.PatternLayoutEncoder by default -->
    <encoder>
      <pattern>%-4relative [%thread] %-5level %logger{35} - %msg%n</pattern>
    </encoder>
  </appender>
        
  <root level="DEBUG">
    <appender-ref ref="FILE" />
  </root>
</configuration>
```

## 独一无二的文件名称

唯一命名的文件（按时间戳）

在应用程序开发阶段或在短期应用程序的情况下，例如， 批量应用程序，最好在每次新的应用程序启动时创建一个新的日志文件。 

借助`<timestamp>`元素，这很容易做到。 这是一个例子。

```xml
<configuration>

  <!-- Insert the current time formatted as "yyyyMMdd'T'HHmmss" under
       the key "bySecond" into the logger context. This value will be
       available to all subsequent configuration elements. -->
  <timestamp key="bySecond" datePattern="yyyyMMdd'T'HHmmss"/>

  <appender name="FILE" class="ch.qos.logback.core.FileAppender">
    <!-- use the previously created timestamp to create a uniquely
         named log file -->
    <file>log-${bySecond}.txt</file>
    <encoder>
      <pattern>%logger{35} - %msg%n</pattern>
    </encoder>
  </appender>

  <root level="DEBUG">
    <appender-ref ref="FILE" />
  </root>
</configuration>
```

timestamp元素采用两个必需属性key和datePattern以及一个可选的timeReference属性。 

key属性是键的名称，在该键下，时间戳可作为变量用于后续配置元素。 

datePattern属性表示用于将当前时间（解析配置文件）转换为字符串的日期模式。 

日期模式应遵循SimpleDateFormat中定义的约定。 

timeReference属性表示时间戳的时间参考。 

默认值是配置文件的解释/解析时间，即当前时间。 

但是，在某些情况下，使用上下文出生时间作为时间参考可能是有用的。 

这可以通过将timeReference属性设置为“contextBirth”来完成。

```xml
<configuration>
  <timestamp key="bySecond" datePattern="yyyyMMdd'T'HHmmss" 
             timeReference="contextBirth"/>
</configuration>
```

# RollingFileAppender

RollingFileAppender扩展了FileAppender，具有翻转日志文件的功能。 

例如，RollingFileAppender可以记录到名为log.txt文件的文件，并且一旦满足某个条件，就将其日志记录目标更改为另一个文件。

有两个与RollingFileAppender交互的重要子组件。 

第一个RollingFileAppender子组件，即RollingPolicy（见下文）负责执行翻转所需的操作。 

RollingFileAppender的第二个子组件，即TriggeringPolicy（见下文）将确定是否以及何时发生翻转。 

因此，RollingPolicy负责什么和TriggeringPolicy负责什么时候。

作为任何用途，RollingFileAppender必须同时设置RollingPolicy和TriggeringPolicy。 

但是，如果其RollingPolicy也实现了TriggeringPolicy接口，则只需要显式指定前者。

## 属性

- file 

String请参见FileAppender属性。

- append 

boolean请参阅FileAppender属性。

- encoder 

Encoder请参见OutputStreamAppender属性。

- rollingPolicy 

RollingPolicy 此选项是在发生翻转时指示RollingFileAppender的行为的组件。请参阅以下更多信息。

- triggeringPolicy 

TriggeringPolicy此选项是告诉RollingFileAppender何时激活翻转过程的组件。请参阅以下更多信息。

谨慎模式下不支持prudent boolean FixedWindowRollingPolicy。

尽管有两个限制，RollingFileAppender与TimeBasedRollingPolicy一起支持谨慎模式。

在谨慎模式下，不支持也不允许文件压缩。 （当另一个JVM正在压缩文件时，我们不能将一个JVM写入文件。）

无法设置FileAppender的文件属性，必须将其留空。实际上，大多数操作系统不允许在另一个进程打开文件时重命名文件。

另请参见FileAppender的属性。

## 案例

RollingPolicy负责涉及文件移动和重命名的翻转过程。

RollingPolicy界面如下所示：

```java
import ch.qos.logback.core.FileAppender;
import ch.qos.logback.core.spi.LifeCycle;

public interface RollingPolicy extends LifeCycle {

  public void rollover() throws RolloverFailure;
  public String getActiveFileName();
  public CompressionMode getCompressionMode();
  public void setParent(FileAppender appender);
}
```

rollover方法完成了归档当前日志文件所涉及的工作。 

调用getActiveFileName() 方法来计算当前日志文件的文件名（写入实时日志的位置）。 

如getCompressionMode方法所示，RollingPolicy还负责确定压缩模式。 

最后，RollingPolicy通过setParent方法提供对其父级的引用。

# TimeBasedRollingPolicy

TimeBasedRollingPolicy可能是最受欢迎的滚动策略。 

它根据时间定义翻转策略，例如按天或按月。 TimeBasedRollingPolicy承担滚动和触发所述翻转的责任。

实际上，TimeBasedTriggeringPolicy实现了RollingPolicy和TriggeringPolicy接口。

TimeBasedRollingPolicy的配置采用一个必需的fileNamePattern属性和几个可选属性。

## 属性

fileNamePattern具有双重用途。首先，通过研究模式，logback计算请求的翻转周期。

其次，它计算每个存档文件的名称。请注意，两种不同的模式可以指定相同的周期。

模式yyyy-MM和yyyy @ MM都指定了每月翻转，尽管生成的存档文件将带有不同的名称。

通过设置file属性，您可以解除活动日志文件的位置和存档日志文件的位置。日志记录输出将定位到file属性指定的文件中。因此，活动日志文件的名称不会随时间而变化。但是，如果选择省略file属性，则将根据fileNamePattern的值为每个句点重新计算活动文件。通过保留文件选项未设置，可以避免在翻转期间存在引用日志文件的外部文件句柄时发生的文件重命名错误。

maxHistory属性控制要保留的最大归档文件数，删除旧文件。例如，如果您指定每月翻转，并将maxHistory设置为6，则将保留6个月的归档文件，其中包含超过6个月的文件。请注意，删除旧的归档日志文件后，将根据需要删除为日志文件归档而创建的所有文件夹。

由于各种技术原因，翻转不是时钟驱动的，而是取决于记录事件的到来。例如，在2002年3月8日，假设fileNamePattern设置为yyyy-MM-dd（每日翻转），则午夜之后第一个事件的到达将触发翻转。如果在午夜之后的23分47秒没有记录事件，那么翻转实际上将发生在3月9日00：23'47 AM而不是凌晨0:00。因此，根据事件的到达率，可能会以一些延迟触发翻转。但是，无论延迟如何，已知翻转算法是正确的，因为在某个时间段内生成的所有日志记录事件都将在限定该时间段的正确文件中输出。

## 案例

```xml
<configuration>
  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logFile.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
      <!-- daily rollover -->
      <fileNamePattern>logFile.%d{yyyy-MM-dd}.log</fileNamePattern>

      <!-- keep 30 days' worth of history capped at 3GB total size -->
      <maxHistory>30</maxHistory>
      <totalSizeCap>3GB</totalSizeCap>

    </rollingPolicy>

    <encoder>
      <pattern>%-4relative [%thread] %-5level %logger{35} - %msg%n</pattern>
    </encoder>
  </appender> 

  <root level="DEBUG">
    <appender-ref ref="FILE" />
  </root>
</configuration>
```

## 基于规模和时间的滚动政策

有时您可能希望按日期归档文件，但同时限制每个日志文件的大小，特别是如果后处理工具对日志文件施加大小限制。 

为了满足此要求，logback随附SizeAndTimeBasedRollingPolicy。

请注意，TimeBasedRollingPolicy已允许限制归档日志文件的组合大小。 

如果您只想限制日志存档的组合大小，那么上面描述的TimeBasedRollingPolicy和设置totalSizeCap属性应该足够了。

这是一个示例配置文件，演示了基于时间和大小的日志文件归档。

```xml
<configuration>
  <appender name="ROLLING" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>mylog.txt</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
      <!-- rollover daily -->
      <fileNamePattern>mylog-%d{yyyy-MM-dd}.%i.txt</fileNamePattern>
       <!-- each file should be at most 100MB, keep 60 days worth of history, but at most 20GB -->
       <maxFileSize>100MB</maxFileSize>    
       <maxHistory>60</maxHistory>
       <totalSizeCap>20GB</totalSizeCap>
    </rollingPolicy>
    <encoder>
      <pattern>%msg%n</pattern>
    </encoder>
  </appender>


  <root level="DEBUG">
    <appender-ref ref="ROLLING" />
  </root>

</configuration>
```

# 触发策略概述

TriggeringPolicy实现负责指示RollingFileAppender何时进行翻转。

TriggeringPolicy接口仅包含一个方法。

```java
import java.io.File;
import ch.qos.logback.core.spi.LifeCycle;

public interface TriggeringPolicy<E> extends LifeCycle {

  public boolean isTriggeringEvent(final File activeFile, final <E> event);
}
```

isTriggeringEvent() 方法将活动文件和当前正在处理的日志记录事件作为参数。

具体实现基于这些参数确定是否应该发生翻转。

最广泛使用的触发策略，即TimeBasedRollingPolicy也可以兼作滚动策略，之前已经与其他滚动策略一起讨论过。

SizeBasedTriggeringPolicy

SizeBasedTriggeringPolicy查看当前活动文件的大小。如果它大于指定的大小，它将发出拥有的RollingFileAppender信号，以触发现有活动文件的翻转。

SizeBasedTriggeringPolicy只接受一个参数，即maxFileSize，默认值为10 MB。

maxFileSize选项可以以字节，千字节，兆字节或千兆字节为单位，后缀数值为KB，MB和GB。例如，5000000,5000KB，5MB和2GB都是有效值，前三个是等效的。

下面是一个示例配置，当日志文件大小达到5MB时，RollingFileAppender与SizeBasedTriggeringPolicy一起触发翻转。

```xml
<configuration>
  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>test.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.FixedWindowRollingPolicy">
      <fileNamePattern>test.%i.log.zip</fileNamePattern>
      <minIndex>1</minIndex>
      <maxIndex>3</maxIndex>
    </rollingPolicy>

    <triggeringPolicy class="ch.qos.logback.core.rolling.SizeBasedTriggeringPolicy">
      <maxFileSize>5MB</maxFileSize>
    </triggeringPolicy>
    <encoder>
      <pattern>%-4relative [%thread] %-5level %logger{35} - %msg%n</pattern>
    </encoder>
  </appender>
        
  <root level="DEBUG">
    <appender-ref ref="FILE" />
  </root>
</configuration>
```

# 参考资料

https://logback.qos.ch/manual/appenders.html

* any list
{:toc}