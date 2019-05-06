---
layout: post
title: Compress Althgorim-Common Compress 通用笔记 
date:  2018-11-9 18:55:36 +0800
categories: [Althgorim]
tags: [althgorim, compress, sh]
published: true
---


# 存档和压缩器

Commons Compress调用压缩单个数据压缩器格式流的所有格式，而在单个（可能压缩的）存档中收集多个条目的所有格式都是归档格式。

支持的压缩器格式有gzip，bzip2，xz，lzma，Pack200，DEFLATE，Brotli，DEFLATE64，ZStandard和Z。

归档格式为7z，ar，arj，cpio，dump，tar和zip。 

Pack200是一种特殊情况，因为它只能压缩JAR文件。

我们目前只为arj，dump，Brotli，DEFLATE64和Z提供读取支持.arj只能读取未压缩的档案，7z可以读取具有7z支持的许多压缩和加密算法的档案，但在编写档案时不支持加密。

# 缓冲

流类都包含调用代码提供的流，它们直接处理它们而无需任何额外的缓冲。

另一方面，大多数都将受益于缓冲，因此强烈建议用户在使用Commons Compress API之前将其流包装在Buffered（In | Out）putStream中。

# 工厂

Compress 提供了工厂方法，可以根据压缩器或归档器格式的名称以及尝试猜测输入流格式的工厂方法来创建输入/输出流。

要使用算法名称创建写入给定输出的压缩器：

```java
CompressorOutputStream gzippedOut = new CompressorStreamFactory()
    .createCompressorOutputStream(CompressorStreamFactory.GZIP, myOutputStream);
```

让工厂猜测给定归档流的输入格式：

```java
ArchiveInputStream input = new ArchiveStreamFactory()
    .createArchiveInputStream(originalInput);
```

让工厂猜测给定压缩器流的输入格式：

```java
CompressorInputStream input = new CompressorStreamFactory()
    .createCompressorInputStream(originalInput);
```

请注意，无法检测lzma或Brotli格式，因此只能使用createCompressorInputStream的两个arg版本。 

在压缩1.9之前，还没有自动检测.Z格式。

# 限制内存使用

从Compress 1.14开始CompressorStreamFactory有一个可选的构造函数参数，可用于设置解压缩或压缩流时可能使用的内存上限。 

从1.14开始，此设置仅影响解压缩Z，XZ和LZMA压缩流。

对于Snappy和LZ4格式，压缩期间使用的内存量与窗口大小成正比。

# 统计

从Compress 1.17开始，大多数CompressorInputStream实现以及ZipArchiveInputStream和ZipFile.getInputStream返回的所有流都实现了InputStreamStatistics接口。 

SevenZFile通过getStatisticsForCurrentEntry方法提供当前条目的统计信息。 

该接口可用于在提取流时跟踪进度或在压缩比变得可疑时检测潜在的拉链炸弹。

# 参考资料

[commons-compress](http://commons.apache.org/proper/commons-compress/examples.html)

* any list
{:toc}