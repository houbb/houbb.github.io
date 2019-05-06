---
layout: post
title: Compress Althgorim-Apache Common Compress 包
date:  2018-11-9 18:55:36 +0800
categories: [Althgorim]
tags: [althgorim, compress, sh]
published: true
---

# Apache Commons Compress

Apache Commons Compress库定义了一个API，用于处理ar，cpio，Unix转储，tar，zip，gzip，XZ，Pack200，bzip2,7z，arj，lzma，snappy，DEFLATE，lz4，Brotli，Zstandard，DEFLATE64和Z文件。

## 代码来源

此组件中的代码有许多来源：

bzip2，tar和zip支持来自Avalon的Excalibur，但最初来自Ant，就像Apache的生活一样。 

tar包最初是Tim Endres的公共域包。 bzip2包基于Keiron Liddle以及Julian Seward的libbzip2所做的工作。 

它通过以下方式迁移：

```
Ant -> Avalon-Excalibur -> Commons-IO  -> Commons-Compress。
```

cpio包由Michael Kuss和jRPM项目提供。

# 文档

压缩组件分为压缩器和归档器。

压缩器（un）压缩通常存储单个条目的流，而归档程序处理包含ArchiveEntry实例表示的结构化内容的存档，而ArchiveEntry实例通常对应于单个文件或目录。

目前支持bzip2，Pack200，XZ，gzip，lzma，brotli，Zstandard和Z格式作为压缩器，其中gzip支持主要由java.util.zip包提供，而Java200的java.util.jar包支持 java 类库。 

XZ和lzma支持由公共域XZ for Java库提供。 

Brotli支持由麻省理工学院许可的Google Brotli解码器提供。 

Zstandard支持由BSD许可的Zstd-jni提供。从Commons Compress 1.18开始支持DEFLATE64，Z和Brotli格式是只读的。

支持ar，arj，cpio，dump，tar，7z和zip格式作为归档程序，其中zip实现提供的功能超出了java.util.zip中的功能。

从Commons Compress 1.18开始，对dump和arj格式的支持是只读的--7z可以读取大多数压缩和加密的档案，但只能写未加密的档案。 

LZMA（2）在7z中的支持也需要XZ for Java。

compress组件为压缩器和归档器提供抽象基类，以及可用于按算法名称选择实现的工厂。在输入流的情况下，工厂也可用于猜测格式并提供匹配的实现。

## 其他

[用户指南](http://commons.apache.org/proper/commons-compress/examples.html) 包含更详细的信息和一些示例。

[已知的限制和问题](http://commons.apache.org/proper/commons-compress/limitations.html) 页面列出了当前已知的问题，这些问题按照它们适用的格式分组。

最新 GIT 的 [Javadoc](http://commons.apache.org/proper/commons-compress/apidocs/index.html)

可以浏览 [GIT存储库](https://gitbox.apache.org/repos/asf?p=commons-compress.git;a=tree)。

# 参考资料

[commons-compress](http://commons.apache.org/proper/commons-compress/)

* any list
{:toc}