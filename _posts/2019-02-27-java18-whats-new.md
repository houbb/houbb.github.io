---
layout: post
title: JDK18 新特性详解，2022-03-22 正式发布
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# JDK18

Java 开发工具包 (JDK) 18 将于 2022 年 3 月 22 日发布。新版本的标准 Java 将有九个新特性，该特性集已于 12 月 9 日冻结，进入Rampdown第一阶段 。

值得注意的是：JDK 17 是一个长期支持 (LTS) 版本，将获得 Oracle 至少八年的支持，但 JDK 18 将是一个短期功能版本，只支持六个月。

可以在java.net 上找到适用于 Linux、Windows 和 MacOS 的 JDK 18 的尝鲜版本

# 特性列表

## JEP 400: UTF-8 by Default

java18以前Charset.defaultCharset()是根据操作系统、user locale等来决定的，导致不同操作系统的默认charset是不一样，这次统一改为了UTF-8

java18要统一为UTF-8则需要-Dfile.encoding=UTF-8来设置

如果还想沿用以前的判断方式则可以通过-Dfile.encoding=COMPAT来设置

## JEP 408: Simple Web Server

提供了一个类似python的SimpleHTTPServer(python -m SimpleHTTPServer [port])的开箱即用的HTTP文件服务器

可以通过jwebserver -p 9000启动

```
jwebserver -p 9000
Binding to loopback by default. For all interfaces use "-b 0.0.0.0" or "-b ::".
Serving /tmp and subdirectories on 127.0.0.1 port 9000
URL http://127.0.0.1:9000/
```

也可以在代码里定制并启动

```
jshell> var server = SimpleFileServer.createFileServer(new InetSocketAddress(8080),
   ...> Path.of("/some/path"), OutputLevel.VERBOSE);
jshell> server.start()
```

## JEP 413: Code Snippets in Java API Documentation

以前要在通过javadoc展示代码可以使用@code如下

```html
<pre>{@code
    lines of source code
}</pre>
```

但是它的缺点就是得用pre包装，导致该片段不能包含html标签，而且缩进不太灵活

而这次给javaDoc引入了@snippet标签，无需对html标签再进行转义

```java
/**
 * The following code shows how to use {@code Optional.isPresent}:
 * {@snippet :
 * if (v.isPresent()) {
 *     System.out.println("v: " + v.get());
 * }
 * }
 */
```

也可以直接引用源代码，避免javadoc的代码与实际代码脱节

```java
/**
 * The following code shows how to use {@code Optional.isPresent}:
 * {@snippet file="ShowOptional.java" region="example"}
 */
```

## JEP 416: Reimplement Core Reflection with Method Handles

通过Method Handles重新实现java.lang.reflect.Method, Constructor及Field来替代字节码生成的Method::invoke, Constructor::newInstance, Field::get, and Field::set的实现
方便支持Project Valhalla，为以后减少扩展成本

## JEP 417: Vector API (Third Incubator)

JDK16引入了JEP 338: Vector API (Incubator)提供了jdk.incubator.vector来用于矢量计算

JDK17进行改进并作为第二轮的incubatorJEP 414: Vector API (Second Incubator)

JDK18进行改进并作为第三轮的incubator

## JEP 418: Internet-Address Resolution SPI

给解析网络地址提供了SPI，即java.net.spi包的InetAddressResolverProvider

方便给project loom做准备(目前InetAddress的API会阻塞在系统调用)，也方便定制化及testing

## JEP 419: Foreign Function & Memory API (Second Incubator)

JDK14的JEP 370: Foreign-Memory Access API (Incubator)引入了Foreign-Memory Access API作为incubator

JDK15的JEP 383: Foreign-Memory Access API (Second Incubator)Foreign-Memory Access API作为第二轮incubator

JDK16的JEP 393: Foreign-Memory Access API (Third Incubator)作为第三轮，它引入了Foreign Linker API

JDK17引入JEP 412: Foreign Function & Memory API (Incubator)作为第一轮incubator

JDK18则作为第二轮的incubator

## JEP 420: Pattern Matching for switch (Second Preview)

instanceof的模式匹配在JDK14作为preview，在JDK15作为第二轮的preview，在JDK16转正

```java
static String formatterPatternSwitch(Object o) {
    return switch (o) {
        case Integer i -> String.format("int %d", i);
        case Long l    -> String.format("long %d", l);
        case Double d  -> String.format("double %f", d);
        case String s  -> String.format("String %s", s);
        default        -> o.toString();
    };
}
```

JDK17引入JEP 406: Pattern Matching for switch (Preview)

JDK18则作为第二轮的preview

## JEP 421: Deprecate Finalization for Removal

废弃finalize方法方便后续移除

# 细项解读

上面列出的是大方面的特性，除此之外还有一些api的更新及废弃，主要见JDK 18 Release Notes，这里举几个例子。

## 添加项

- SerialGC、ParallelGC、ZGC支持String Deduplication

可使用-XX:+UseStringDeduplication开启

- Map from an Element to its JavaFileObject

新增Elements.getFileObjectOf(Element)来映射为JavaFileObject

- Configurable Card Table Card SizeJDK-8272773

可以使用-XX:GCCardSizeInBytes来设置card table大小

- Allow G1 Heap Regions up to 512MBJDK-8275056

允许G1的heap regions的最大值从之前的32MB到512MB

- JDK Flight Recorder Event for FinalizationJDK-8266936

新增jdk.FinalizerStatistics

## 移除项

- Removal of Google’s GlobalSign Root CertificateJDK-8225083

移除了google的GlobalSign根证书

- Removal of Empty finalize() Methods in java.desktop ModuleJDK-8273102

移除java.desktop模块里头的空finalize()方法

- Removal of impl.prefix JDK System Property Usage From InetAddressJDK-8274227

移除impl.prefix属性，转而使用InetAddressResolver这个spi

- Removal of Support for Pre JDK 1.4 DatagramSocketImpl ImplementationsJDK-8260428

移除jdk1.4之前的DatagramSocketImpl

- Removal of Legacy PlainSocketImpl and PlainDatagramSocketImpl ImplementationsJDK-8253119

移除java.net.SocketImpl及java.net.DatagramSocketImpl的老实现PlainSocketImpl、PlainDatagramSocketImpl

jdk.net.usePlainDatagramSocketImpl属性也一并移除

## 废弃项

完整列表见deprecated-list

- Deprecated Subject::doAs for RemovalJDK-8267108

废弃javax.security.auth.Subject::doAs为移除做准备

Deprecated sun.misc.Unsafe Methods That Return Of- fsetsJDK-8277863

sun.misc.Unsafe中objectFieldOffset, staticFieldOffset, staticFieldBase方法被废弃

- Terminally Deprecated Thread.stopJDK-8277861

废弃Thread.stop为后续移除做准备

- Obsoleted Product Options -XX:G1RSetRegionEntries and -XX:G1RSetSparseRegionEntriesJDK-8017163

废弃-XX:G1RSetRegionEntries及-XX:G1RSetSparseRegionEntries

## 已知问题
Extended Delay Before JDK Executable Installer Starts From Network DriveJDK-8274002

在 Windows 11 和 Windows Server 2022 上，从映射的网络驱动器启动时，临时安装文件的提取可能会有些缓慢。安装程序仍然可以工作，但可能会有暂时的延迟。

# 参考资料

https://zhuanlan.zhihu.com/p/461672235

https://www.jianshu.com/p/f0f1648623a8

https://segmentfault.com/a/1190000041598372

https://blog.csdn.net/hello_ejb3/article/details/123698330

http://news.sohu.com/a/541676571_121068649

* any list
{:toc}