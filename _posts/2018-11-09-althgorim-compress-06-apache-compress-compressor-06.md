---
layout: post
title: Compress Althgorim-Common Compress 压缩器 
date:  2018-11-9 18:55:36 +0800
categories: [Althgorim]
tags: [althgorim, compress, sh]
published: true
---


# 压缩器

## 连锁流

对于bzip2，gzip和xz格式以及带框架的lz4格式，单个压缩文件实际上可能包含多个流，这些流在解压缩时将由命令行实用程序连接。 

从Commons Compress 1.4开始，这些格式的* CompressorInputStreams也支持连接流，但默认情况下它们不会这样做。 

您必须使用two-arg构造函数并显式启用支持。

# Brotli

该软件包的实现由 [Google Brotli dec](https://github.com/google/brotli) 库提供。

## 常见方法

解压缩给定的Brotli压缩文件（您肯定会添加异常处理并确保所有流都正确关闭）：

```java
InputStream fin = Files.newInputStream(Paths.get("archive.tar.br"));
BufferedInputStream in = new BufferedInputStream(fin);
OutputStream out = Files.newOutputStream(Paths.get("archive.tar"));
BrotliCompressorInputStream brIn = new BrotliCompressorInputStream(in);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = brIn.read(buffer))) {
    out.write(buffer, 0, n);
}
out.close();
brIn.close();
```

# bzip2

请注意，BZipCompressorOutputStream 会在内存中保留一些大数据结构。 

虽然建议您在不再需要它时立即关闭它，但这对于BZipCompressorOutputStream来说更为重要。

## 常见方法

解压缩给定的bzip2压缩文件（您肯定会添加异常处理并确保所有流都正确关闭）：

```java
InputStream fin = Files.newInputStream(Paths.get("archive.tar.bz2"));
BufferedInputStream in = new BufferedInputStream(fin);
OutputStream out = Files.newOutputStream(Paths.get("archive.tar"));
BZip2CompressorInputStream bzIn = new BZip2CompressorInputStream(in);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = bzIn.read(buffer))) {
    out.write(buffer, 0, n);
}
out.close();
bzIn.close();
```

使用 bzip2 压缩给定文件（您肯定会添加异常处理并确保所有流都正确关闭）：

```java
InputStream in = Files.newInputStream(Paths.get("archive.tar"));
OutputStream fout = Files.newOutputStream(Paths.get("archive.tar.gz"));
BufferedOutputStream out = new BufferedOutputStream(fout);
BZip2CompressorOutputStream bzOut = new BZip2CompressorOutputStream(out);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = in.read(buffer))) {
    bzOut.write(buffer, 0, n);
}
bzOut.close();
in.close();
```

# DEFLATE

此包使用的DEFLATE/INFLATE代码的实现由Java类库的 `java.util.zip` 包提供。

## 常见方法

解压缩给定的DEFLATE压缩文件（您肯定会添加异常处理并确保所有流都正确关闭）：

```java
InputStream fin = Files.newInputStream(Paths.get("some-file"));
BufferedInputStream in = new BufferedInputStream(fin);
OutputStream out = Files.newOutputStream(Paths.get("archive.tar"));
DeflateCompressorInputStream defIn = new DeflateCompressorInputStream(in);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = defIn.read(buffer))) {
    out.write(buffer, 0, n);
}
out.close();
defIn.close();
```

压缩文件

```java
InputStream in = Files.newInputStream(Paths.get("archive.tar"));
OutputStream fout = Files.newOutputStream(Paths.get("some-file"));
BufferedOutputStream out = new BufferedOutputStream(fout);
DeflateCompressorOutputStream defOut = new DeflateCompressorOutputStream(out);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = in.read(buffer))) {
    defOut.write(buffer, 0, n);
}
defOut.close();
in.close();
```

# DEFLATE64

解压文件

```java
InputStream fin = Files.newInputStream(Paths.get("some-file"));
BufferedInputStream in = new BufferedInputStream(fin);
OutputStream out = Files.newOutputStream(Paths.get("archive.tar"));
Deflate64CompressorInputStream defIn = new Deflate64CompressorInputStream(in);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = defIn.read(buffer))) {
    out.write(buffer, 0, n);
}
out.close();
defIn.close();
```

# gzip

此包使用的DEFLATE/INFLATE代码的实现由Java类库的java.util.zip包提供。

解压缩给定的gzip压缩文件（您肯定会添加异常处理并确保所有流都正确关闭）：

```java
InputStream fin = Files.newInputStream(Paths.get("archive.tar.gz"));
BufferedInputStream in = new BufferedInputStream(fin);
OutputStream out = Files.newOutputStream(Paths.get("archive.tar"));
GzipCompressorInputStream gzIn = new GzipCompressorInputStream(in);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = gzIn.read(buffer))) {
    out.write(buffer, 0, n);
}
out.close();
gzIn.close();
```

压缩文件

```java
InputStream in = Files.newInputStream(Paths.get("archive.tar"));
OutputStream fout = Files.newOutputStream(Paths.get("archive.tar.gz"));
BufferedOutputStream out = new BufferedOutputStream(fout);
GzipCompressorOutputStream gzOut = new GzipCompressorOutputStream(out);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = in.read(buffer))) {
    gzOut.write(buffer, 0, n);
}
gzOut.close();
in.close();
```

# LZ4

lz4有两种不同的“格式”。 

称为“块格式”的格式仅包含原始压缩数据，而另一种格式提供更高级别的“帧格式” -  Commons Compress提供两种不同的流类用于读取或写入任一格式。

- 解压缩给定的帧LZ4文件（您肯定会添加异常处理并确保所有流都正确关闭）：

```java
InputStream fin = Files.newInputStream（Paths.get（“archive.tar.lz4”））;
BufferedInputStream in = new BufferedInputStream(fin);
OutputStream out = Files.newOutputStream(Paths.get("archive.tar"));
FramedLZ4CompressorInputStream zIn = new FramedLZ4CompressorInputStream(in);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = zIn.read(buffer))) {
    out.write(buffer, 0, n);
}
out.close();
zIn.close();
```

- 压缩文件

```java
InputStream in = Files.newInputStream(Paths.get("archive.tar"));
OutputStream fout = Files.newOutputStream(Paths.get("archive.tar.lz4"));
BufferedOutputStream out = new BufferedOutputStream(fout);
FramedLZ4CompressorOutputStream lzOut = new FramedLZ4CompressorOutputStream(out);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = in.read(buffer))) {
    lzOut.write(buffer, 0, n);
}
lzOut.close();
in.close();
```

# LZMA

该软件包的实现由公共域 [XZ for Java](https://tukaani.org/xz/java.html) 库提供。

解压缩给定的lzma压缩文件（您肯定会添加异常处理并确保所有流都正确关闭）：

```java
InputStream fin = Files.newInputStream(Paths.get("archive.tar.lzma"));
BufferedInputStream in = new BufferedInputStream(fin);
OutputStream out = Files.newOutputStream(Paths.get("archive.tar"));
LZMACompressorInputStream lzmaIn = new LZMACompressorInputStream(in);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = xzIn.read(buffer))) {
    out.write(buffer, 0, n);
}
out.close();
lzmaIn.close();
```

- 压缩指定文件

```java
InputStream in = Files.newInputStream(Paths.get("archive.tar"));
OutputStream fout = Files.newOutputStream(Paths.get("archive.tar.lzma"));
BufferedOutputStream out = new BufferedOutputStream(fout);
LZMACompressorOutputStream lzOut = new LZMACompressorOutputStream(out);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = in.read(buffer))) {
    lzOut.write(buffer, 0, n);
}
lzOut.close();
in.close();
```

# Pack200

Pack200 包有一个 [专用的文档页面](http://commons.apache.org/proper/commons-compress/pack200.html)。

该包的实现由Java类库的java.util.zip包提供。

解压缩给定的pack200压缩文件（您肯定会添加异常处理并确保所有流都正确关闭）：

```java
InputStream fin = Files.newInputStream(Paths.get("archive.pack"));
BufferedInputStream in = new BufferedInputStream(fin);
OutputStream out = Files.newOutputStream(Paths.get("archive.jar"));
Pack200CompressorInputStream pIn = new Pack200CompressorInputStream(in);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = pIn.read(buffer))) {
    out.write(buffer, 0, n);
}
out.close();
pIn.close();
```

- 压缩指定文件

```java
InputStream in = Files.newInputStream(Paths.get("archive.jar"));
OutputStream fout = Files.newOutputStream(Paths.get("archive.pack"));
BufferedOutputStream out = new BufferedInputStream(fout);
Pack200CompressorOutputStream pOut = new Pack200CompressorOutputStream(out);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = in.read(buffer))) {
    pOut.write(buffer, 0, n);
}
pOut.close();
in.close();
```

# Snappy

有两种不同的“格式”用于Snappy，一种只包含原始压缩数据，而另一种提供更高级别的“帧格式” -  Commons Compress提供了两种不同的流类来读取任一格式。

从1.12开始，我们添加了对构造流时可以指定的框架格式的不同方言的支持。 

STANDARD方言遵循“成帧格式”规范，而IWORK_ARCHIVE方言可用于解析属于Apple iWork 13格式的IWA文件。 

如果未指定方言，则使用STANDARD。 CompressorStreamFactory只能检测STANDARD格式。

## 常见方法

- 解压

```java
InputStream fin = Files.newInputStream(Paths.get("archive.tar.sz"));
BufferedInputStream in = new BufferedInputStream(fin);
OutputStream out = Files.newOutputStream(Paths.get("archive.tar"));
FramedSnappyCompressorInputStream zIn = new FramedSnappyCompressorInputStream(in);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = zIn.read(buffer))) {
    out.write(buffer, 0, n);
}
out.close();
zIn.close();
```

- 压缩

```java
InputStream in = Files.newInputStream(Paths.get("archive.tar"));
OutputStream fout = Files.newOutputStream(Paths.get("archive.tar.sz"));
BufferedOutputStream out = new BufferedOutputStream(fout);
FramedSnappyCompressorOutputStream snOut = new FramedSnappyCompressorOutputStream(out);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = in.read(buffer))) {
    snOut.write(buffer, 0, n);
}
snOut.close();
in.close();
```

# XZ

该软件包的实现由公共域 [XZ for Java](https://tukaani.org/xz/java.html) 库提供。

当您尝试使用CompressorStreamFactory打开XZ流进行读取时，Commons Compress将检查XZ for Java库是否可用。 

从Compress 1.9开始，除非Compress在其类路径中找到OSGi类，否则将缓存此检查的结果。 

您可以使用XZUtils #setCacheXZAvailability来覆盖此默认行为。

## 常见方法

- 解压

```java
InputStream fin = Files.newInputStream(Paths.get("archive.tar.xz"));
BufferedInputStream in = new BufferedInputStream(fin);
OutputStream out = Files.newOutputStream(Paths.get("archive.tar"));
XZCompressorInputStream xzIn = new XZCompressorInputStream(in);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = xzIn.read(buffer))) {
    out.write(buffer, 0, n);
}
out.close();
xzIn.close();
```

- 压缩

```java
InputStream in = Files.newInputStream(Paths.get("archive.tar"));
OutputStream fout = Files.newOutputStream(Paths.get("archive.tar.xz"));
BufferedOutputStream out = new BufferedInputStream(fout);
XZCompressorOutputStream xzOut = new XZCompressorOutputStream(out);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = in.read(buffer))) {
    xzOut.write(buffer, 0, n);
}
xzOut.close();
in.close();
```

# Z

解压

```java
InputStream fin = Files.newInputStream(Paths.get("archive.tar.Z"));
BufferedInputStream in = new BufferedInputStream(fin);
OutputStream out = Files.newOutputStream(Paths.get("archive.tar"));
ZCompressorInputStream zIn = new ZCompressorInputStream(in);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = zIn.read(buffer))) {
    out.write(buffer, 0, n);
}
out.close();
zIn.close();
```

# Zstandard

该程序包的实现由 [Zstandard JNI](https://github.com/luben/zstd-jni) 库提供。

## 常见方法

解压缩给定的Zstandard压缩文件（您肯定会添加异常处理并确保所有流都正确关闭）：

```java
InputStream fin = Files.newInputStream(Paths.get("archive.tar.zstd"));
BufferedInputStream in = new BufferedInputStream(fin);
OutputStream out = Files.newOutputStream(Paths.get("archive.tar"));
ZstdCompressorInputStream zsIn = new ZstdCompressorInputStream(in);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = zsIn.read(buffer))) {
    out.write(buffer, 0, n);
}
out.close();
zsIn.close();
```

压缩

```java
InputStream in = Files.newInputStream(Paths.get("archive.tar"));
OutputStream fout = Files.newOutputStream(Paths.get("archive.tar.zstd"));
BufferedOutputStream out = new BufferedOutputStream(fout);
ZstdCompressorOutputStream zOut = new ZstdCompressorOutputStream(out);
final byte[] buffer = new byte[buffersize];
int n = 0;
while (-1 != (n = in.read(buffer))) {
    zOut.write(buffer, 0, n);
}
zOut.close();
in.close();
```

# 拓展阅读

[xz-java](https://tukaani.org/xz/java.html)

# 参考资料

[commons-compress](http://commons.apache.org/proper/commons-compress/examples.html)

* any list
{:toc}