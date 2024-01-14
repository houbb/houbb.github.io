---
layout: post
title:  Apache Hadoop v3.3.6-13-Native Libraries Guide
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# Native Hadoop库概览

本指南描述了Hadoop的本机库，并对本机共享库进行了简要讨论。

注意：根据您的环境，“本机库”一词可能指您需要编译的所有*.so文件；而“本机压缩”一词可能指您需要编译的所有与压缩有关的*.so文件。然而，当前，本文档仅涉及本机Hadoop库（libhadoop.so）。libhdfs库（libhdfs.so）的文档在这里。

## 本机Hadoop库

由于性能原因以及Java实现不可用，Hadoop对某些组件进行了本机实现。这些组件在一个单一的、动态链接的本机库中可用，称为本机Hadoop库。在*nix平台上，该库的名称为libhadoop.so。

## 用法
使用本机Hadoop库非常简单：

1. 查看组件。
2. 查看支持的平台。
3. 下载Hadoop发布版，其中包含本机Hadoop库的预构建版本，或者构建本机Hadoop库的自己的版本。无论您是下载还是构建，库的名称都相同：libhadoop.so。
4. 安装压缩编解码器的开发包（> zlib-1.2，> gzip-1.2）：
   - 如果您下载库，则安装一个或多个开发包 - 与您的部署一起使用的任何压缩编解码器。
   - 如果构建库，则强制安装两个开发包。
5. 检查运行时日志文件。

## 组件

本机Hadoop库包括各种组件：

1. 压缩编解码器（bzip2、lz4、zlib）
2. HDFS短路本地读取和HDFS中央缓存管理的本机IO实用程序
3. CRC32校验和实现

## 支持的平台

本机Hadoop库仅受*nix平台支持。该库不能在Cygwin或Mac OS X平台上运行。

本机Hadoop库主要用于GNU/Linux平台，并在以下发行版上进行了测试：

- RHEL4/Fedora
- Ubuntu
- Gentoo

在上述所有发行版上，32/64位本机Hadoop库将与相应的32/64位JVM一起工作。

## 下载

预构建的32位i386-Linux本机Hadoop库作为Hadoop分发的一部分可在lib/native目录中找到。

您可以从Hadoop Common Releases下载Hadoop分发版。

请确保安装zlib和/或gzip开发包 - 与部署一起使用的任何压缩编解码器。

## 构建

本机Hadoop库是用ANSI C编写的，并使用GNU autotools链（autoconf、autoheader、automake、autoscan、libtool）构建。

这意味着在任何具有符合标准的C编译器和GNU autotools链的平台上构建库应该是直截了当的（请参阅支持的平台）。

在目标平台上需要安装的软件包有：

1. C编译器（例如GNU C编译器）
2. GNU Autools链：autoconf、automake、libtool
3. zlib开发包（稳定版本>=1.2.0）
4. OpenSSL开发包（例如libssl-dev）

安装了先决条件软件包后，请使用标准的hadoop pom.xml文件，并传递native标志以构建本机Hadoop库：

```bash
$ mvn package -Pdist,native -DskipTests -Dtar
```

您应该在以下位置看到新构建的库：

```bash
$ hadoop-dist/target/hadoop-3.3.6/lib/native
```

请注意以下几点：

- 在目标平台上构建本机Hadoop库时，强制安装zlib和gzip开发包是必需的；但是，如果只想使用一个编解码器，那么在部署时仅安装一个软件包就足够了。
- 在构建和部署本机Hadoop库时，必须具有正确的32/64位zlib库，具体取决于目标平台的32/64位jvm。
  
## 运行时

`bin/hadoop`脚本通过系统属性 `-Djava.library.path=<path>` 确保本机Hadoop库在库路径上。

在运行时，检查您的MapReduce任务的Hadoop日志文件。

如果一切正常，将看到如下信息：

```bash
DEBUG util.NativeCodeLoader - Trying to load the custom-built native-hadoop library...
INFO util.NativeCodeLoader - Loaded the native-hadoop library
```

如果出现问题，则可能会看到：

```bash
INFO util.NativeCodeLoader - Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
```

## 检查

NativeLibraryChecker是一个检查本机库是否正确加载的工具。

您可以通过以下方式启动NativeLibraryChecker：

```bash
$ hadoop checknative -a
```

输出可能类似于：

```bash
14/12/06 01:30:45 WARN bzip2.Bzip2Factory: Failed to load/initialize native-bzip2 library system-native, will use pure-Java version
14/12/06 01:30:45 INFO zlib.ZlibFactory: Successfully loaded & initialized native-zlib library
Native library checking:
hadoop: true /home/ozawa/hadoop/lib/native/libhadoop.so.1.0.0
zlib:   true /lib/x86_64-linux-gnu/libz.so.1
zstd: true /usr/lib/libzstd.so.1
lz4:    true revision:99
bzip2:  false
```

## 本机共享库

您可以使用DistributedCache加载任何本机共享库以分发和创建库文件的符号链接。

以下示例演示了如何分发共享库`mylib.so`并在MapReduce任务中加载它。

首先将库复制到HDFS：

```bash
bin/hadoop fs -copyFromLocal mylib.so.1 /libraries/mylib.so.1
```

启动作业的程序应包含以下内容：

```java
DistributedCache.createSymlink(conf);
DistributedCache.addCacheFile("hdfs://host:port/libraries/mylib.so.1#mylib.so", conf);
```

MapReduce任务可以包含：

```java
System.loadLibrary("mylib.so");
```

注意：如果您下载或构建了本机Hadoop库，则不需要使用DistibutedCache将库提供给MapReduce任务。

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/NativeLibraries.html

* any list
{:toc}