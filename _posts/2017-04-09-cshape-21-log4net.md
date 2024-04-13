---
layout: post
title: Log4net
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---


# Log4net

The Apache [log4net](http://logging.apache.org/log4net/) library is a tool to help the programmer output log statements to a variety of output targets.
 
log4net is a port of the excellent Apache log4j™ framework to the Microsoft® .NET runtime. We have kept the framework similar in spirit to the original
 
log4j while taking advantage of new features in the .NET runtime. For more information on log4net see the features document.


> [详细说明](http://www.cnblogs.com/jiajinyi/p/5884930.html)

# Hello World

- Install Log4net.DLL

项目解决方案-》引用-》(右键)管理NuGet程序包-》Apache log4net

![install](https://raw.githubusercontent.com/houbb/resource/master/img/log/2017-03-21-log4net-install.png)


- HelloWorld.cs

注意：

1. `[assembly: log4net.Config.XmlConfigurator(Watch=true)]` 在需要使用的Namespace上添加这一段。
 
不加这个标记的话则log无法生效，如果类较多则比较麻烦，此时可以把这个配置放在 `AssemblyInfo.cs` 中，针对整个程序集生效。


```c#
using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

[assembly: log4net.Config.XmlConfigurator(Watch=true)]
namespace Log4net
{
    class Program
    {
        static void Main(string[] args)
        {
            ILog log = log4net.LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
            log.Error("error", new Exception("发生了一个异常"));
            log.Fatal("fatal", new Exception("发生了一个致命错误"));
            log.Info("info");
            log.Debug("debug");
            log.Warn("warn");
            Console.WriteLine("日志记录完毕。");
            Console.ReadKey();
        }
    }
}
```

- App.config

输出配置放在 `App.config` 中，如下：

```xml
<?xml version="1.0" encoding="utf-8" ?>
<configuration>
  <configSections>
    <section name="log4net" type="log4net.Config.Log4NetConfigurationSectionHandler, log4net"/>
  </configSections>
  
  <log4net>
    <appender name="RollingLogFileAppender" type="log4net.Appender.RollingFileAppender">
      <!--日志路径-->
      <param name= "File" value= "D:\App_Log\"/>
      <!--是否是向文件中追加日志-->
      <param name= "AppendToFile" value= "true"/>
      <!--log保留天数-->
      <param name= "MaxSizeRollBackups" value= "10"/>
      <!--日志文件名是否是固定不变的-->
      <param name= "StaticLogFileName" value= "false"/>
      <!--日志文件名格式为:2008-08-31.log-->
      <param name= "DatePattern" value= "yyyy-MM-dd&quot;.log&quot;"/>
      <!--日志根据日期滚动-->
      <param name= "RollingStyle" value= "Date"/>
      <layout type="log4net.Layout.PatternLayout">
        <param name="ConversionPattern" value="%d [%t] %-5p %c - %m%n %loggername" />
      </layout>
    </appender>
    
    <!-- 控制台前台显示日志 -->
    <appender name="ColoredConsoleAppender" type="log4net.Appender.ColoredConsoleAppender">
      <mapping>
        <level value="ERROR" />
        <foreColor value="Red, HighIntensity" />
      </mapping>
      <mapping>
        <level value="Info" />
        <foreColor value="Green" />
      </mapping>
      <layout type="log4net.Layout.PatternLayout">
        <conversionPattern value="%n%date{HH:mm:ss,fff} [%-5level] %m" />
      </layout>

      <filter type="log4net.Filter.LevelRangeFilter">
        <param name="LevelMin" value="Info" />
        <param name="LevelMax" value="Fatal" />
      </filter>
    </appender>

    <root>
      <!--(高) OFF > FATAL > ERROR > WARN > INFO > DEBUG > ALL (低) -->
      <level value="all" />
      <appender-ref ref="ColoredConsoleAppender"/>
      <appender-ref ref="RollingLogFileAppender"/>
    </root>
  </log4net>
</configuration>
```

- result

运行程序后：

1、命令行打印对应日志信息


2、`D:\App_Log\2017-07-31.log` 文件内容如下：

```
2017-03-21 10:06:44,713 [9] FATAL Log4net.Program - fatal
 Log4net.ProgramnameSystem.Exception: 发生了一个致命错误
2017-03-21 10:06:44,716 [9] INFO  Log4net.Program - info
 Log4net.Programname2017-03-21 10:06:44,718 [9] DEBUG Log4net.Program - debug
 Log4net.Programname2017-03-21 10:06:44,718 [9] WARN  Log4net.Program - warn
 Log4net.Programname2017-03-21 10:07:07,479 [10] ERROR Log4net.Program - error
 Log4net.ProgramnameSystem.Exception: 发生了一个异常
2017-03-21 10:07:07,516 [10] FATAL Log4net.Program - fatal
 Log4net.ProgramnameSystem.Exception: 发生了一个致命错误
2017-03-21 10:07:07,519 [10] INFO  Log4net.Program - info
 Log4net.Programname2017-03-21 10:07:07,521 [10] DEBUG Log4net.Program - debug
 Log4net.Programname2017-03-21 10:07:07,521 [10] WARN  Log4net.Program - warn
 Log4net.Programname
```


# Log4net Components

一、Appenders

Appenders用来定义日志的输出方式，即日志要写到那种介质上去。较常用的Log4net已经实现好了，直接在配置文件中调用即可，可参见上面配置文件例子；当然也可以自己写一个，需要从log4net.Appender.AppenderSkeleton类继承。


最常见的几种：

- AdoNetAppender 将日志记录到数据库中。可以采用SQL和存储过程两种方式。

- ConsoleAppender 将日志输出到应用程序控制台。

- FileAppender 将日志输出到文件。

- RollingFileAppender 将日志以回滚文件的形式写到文件中。

- SmtpAppender 将日志写到邮件中。

二、Filters

使用过滤器可以过滤掉Appender输出的内容。过滤器通常有以下几种：

- LevelMatchFilter 只有指定等级的日志事件才被记录

- LevelRangeFilter 日志等级在指定范围内的事件才被记录

- LoggerMatchFilter 与Logger名称匹配，才记录

- PropertyFilter 消息匹配指定的属性值时才被记录

- StringMathFilter 消息匹配指定的字符串才被记录

三、Layouts

Layout用于控制Appender的输出格式，可以是线性的也可以是XML。

一个Appender只能有一个Layout。

最常用的Layout应该是经典格式的PatternLayout，其次是SimpleLayout，RawTimeStampLayout和ExceptionLayout。然后还有IRawLayout，XMLLayout等几个，使用较少。
Layout可以自己实现，需要从log4net.Layout.LayoutSkeleton类继承，来输出一些特殊需要的格式，在后面扩展时就重新实现了一个Layout。

SimpleLayout简单输出格式，只输出日志级别与消息内容。

RawTimeStampLayout 用来格式化时间，在向数据库输出时会用到。

样式如“yyyy-MM-dd HH:mm:ss“

ExceptionLayout需要给Logger的方法传入Exception对象作为参数才起作用，否则就什么也不输出。输出的时候会包含Message和Trace。

PatterLayout使用最多的一个Layout，能输出的信息很多，使用方式可参见上面例子中的配置文件。PatterLayout的格式化字符串见文后附注8.1。


四、Loggers

Logger是直接和应用程序交互的组件。Logger只是产生日志，然后由它引用的Appender记录到指定的媒介，并由Layout控制输出格式。

Logger提供了多种方式来记录一个日志消息，也可以有多个Logger同时存在。每个实例化的Logger对象对被log4net作为命名实体（Named Entity）来维护。
log4net使用继承体系，也就是说假如存在两个Logger，名字分别为a.b.c和a.b。那么a.b就是a.b.c的祖先。每个Logger都继承了它祖先的属性。
所有的Logger都从Root继承,Root本身也是一个Logger。

日志的等级，它们由高到底分别为：

```
OFF > FATAL > ERROR > WARN > INFO > DEBUG  > ALL
```

在具体写日志时，一般可以这样理解日志等级：

FATAL（致命错误）：记录系统中出现的能使用系统完全失去功能，服务停止，系统崩溃等使系统无法继续运行下去的错误。例如，数据库无法连接，系统出现死循环。

ERROR（一般错误）：记录系统中出现的导致系统不稳定，部分功能出现混乱或部分功能失效一类的错误。例如，数据字段为空，数据操作不可完成，操作出现异常等。

WARN（警告）：记录系统中不影响系统继续运行，但不符合系统运行正常条件，有可能引起系统错误的信息。例如，记录内容为空，数据内容不正确等。

INFO（一般信息）：记录系统运行中应该让用户知道的基本信息。例如，服务开始运行，功能已经开户等。

DEBUG （调试信息）：记录系统用于调试的一切信息，内容或者是一些关键数据内容的输出。




# 按照不同的级别分别输出

```xml
<log4net>

<root>

    <level value="DEBUG" />

    <appender-ref ref="RollingFileAppender" />

    <appender-ref ref="ErrorRollingFileAppender"/>

</root>

<appender name="RollingFileAppender" type="log4net.Appender.RollingFileAppender">

    <file value="c:\log.txt" />

    <appendToFile value="true" />

    <rollingStyle value="Size" />

    <maxSizeRollBackups value="10" />

    <maximumFileSize value="100KB" />

    <staticLogFileName value="true" />

    <layout type="log4net.Layout.PatternLayout">

      <conversionPattern value="%date [%thread] %-5level [%rms used] - %message%newline" />

    </layout>

</appender>



<appender name="ErrorRollingFileAppender" type="log4net.Appender.RollingFileAppender" LEVEL="ERROR">

    <file value="c:\errorlog.txt" />

    <appendToFile value="true" />

    <rollingStyle value="Size" />

    <maxSizeRollBackups value="10" />

    <maximumFileSize value="1024KB" />

    <staticLogFileName value="true" />

    <layout type="log4net.Layout.PatternLayout">

      <conversionPattern value="%date [%thread] %-5level [%logger] [%property{NDC}] - %message%newline" />

    </layout>

    <filter type="log4net.Filter.LevelRangeFilter">

      <param name="LevelMin" value="ERROR" />

      <param name="LevelMax" value="ERROR" />

    </filter>

</appender>

</log4net>
```






* any list
{:toc}