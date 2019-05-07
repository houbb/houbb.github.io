---
layout: post
title: Compress Althgorim-Common Compress 自定义拓展
date:  2018-11-9 18:55:36 +0800
categories: [Althgorim]
tags: [althgorim, compress, sh]
published: true
---


# 扩展Commons压缩

从1.13版开始，现在可以使用Java的ServiceLoader机制添加Compressor和ArchiverStream实现。


# 扩展Commons压缩压缩器

要提供自己的压缩器，必须在类路径上提供名为 `META-INF/services/org.apache.commons.compress.compressors.CompressorStreamProvider` 的文件。

该文件必须每行包含一个完全限定的类名。

例如：

```
org.apache.commons.compress.compressors.TestCompressorStreamProvider
```

该类必须实现Commons Compress接口 `org.apache.commons.compress.compressors.CompressorStreamProvider`。

# 扩展Commons压缩存档

要提供自己的压缩器，必须在类路径上提供名为 META-INF/services/org.apache.commons.compress.archivers.ArchiveStreamProvider 的文件。

该文件必须每行包含一个完全限定的类名。

例如：

```
org.apache.commons.compress.archivers.TestArchiveStreamProvider
```

这个类必须实现 `Commons Compress接口org.apache.commons.compress.archivers.ArchiveStreamProvider`。


# 拓展阅读

[SPI](https://houbb.github.io/2018/08/02/spi)

[jvm 类加载](https://houbb.github.io/2018/10/08/jvm-09-classloader)

# 参考资料

[commons-compress](http://commons.apache.org/proper/commons-compress/examples.html)

* any list
{:toc}