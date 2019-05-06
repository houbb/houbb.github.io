---
layout: post
title: Compress Althgorim-Common Compress 归档器 
date:  2018-11-9 18:55:36 +0800
categories: [Althgorim]
tags: [althgorim, compress, sh]
published: true
---


# 档案库

## 不支持的功能

许多支持的格式已经开发了不同的方言和扩展，一些格式允许Commons Compress支持的功能（尚未）。

ArchiveInputStream类提供了一个方法canReadEntryData，如果Commons Compress可以检测到存档使用当前实现不支持的功能，则该方法将返回false。

如果它返回false，则不应尝试读取该条目，而应跳过该条目。

## 条目名称

所有归档格式都通过ArchiveEntry（或者更确切的子类）的实例提供有关各个归档条目的元数据。从存档读取时，提供的信息getName方法是存储在存档内的原始名称。无法保证名称代表目标操作系统上的相对文件名甚至有效文件名。尝试从条目名称创建文件名时，应仔细检查结果。

## 通用提取逻辑

除了7z之外，所有格式都提供了ArchiveInputStream的子类，可用于创建存档。

对于7z，SevenZFile提供了一个类似的API，它不代表流，因为我们的实现需要随机访问输入，不能用于一般流。 

ZIP实现也可以从随机访问中受益匪浅，请参阅 [zip](http://commons.apache.org/proper/commons-compress/zip.html#ZipArchiveInputStream_vs_ZipFile)页面了解详细信息。

假设您要将存档提取到目标目录，您可以调用getNextEntry，验证条目是否可以读取，从条目名称构造一个合理的文件名，创建一个文件并将所有内容写入其中 - 这里IOUtils.copy可能会来便利。

您对每个条目执行此操作，直到getNextEntry返回null。

骨架可能看起来像：

```java
File targetDir = ...
try (ArchiveInputStream i = ... create the stream for your format, use buffering...) {
    ArchiveEntry entry = null;
    while ((entry = i.getNextEntry()) != null) {
        if (!i.canReadEntryData(entry)) {
            // log something?
            continue;
        }
        String name = fileName(targetDir, entry);
        File f = new File(name);
        if (entry.isDirectory()) {
            if (!f.isDirectory() && !f.mkdirs()) {
                throw new IOException("failed to create directory " + f);
            }
        } else {
            File parent = f.getParentFile();
            if (!parent.isDirectory() && !parent.mkdirs()) {
                throw new IOException("failed to create directory " + parent);
            }
            try (OutputStream o = Files.newOutputStream(f.toPath())) {
                IOUtils.copy(i, o);
            }
        }
    }
}
```

您编写假设的fileName方法，并提供将要写入磁盘的文件的绝对名称。 

在这里，您应该执行检查，以确保生成的文件名实际上是操作系统上的有效文件名，或者在使用条目名称作为输入时属于targetDir内的文件。

如果要将存档格式与压缩格式组合在一起 - 例如在读取“tar.gz”文件时

例如，将ArchiveInputStream包装在CompressorInputStream周围：

```java
try (InputStream fi = Files.newInputStream(Paths.get("my.tar.gz"));
     InputStream bi = new BufferedInputStream(fi);
     InputStream gzi = new GzipCompressorInputStream(bi);
     ArchiveInputStream o = new TarArchiveInputStream(gzi)) {
}
```

# 常见的档案逻辑

除了7z之外，所有支持写入的格式都提供了ArchiveOutputStream的子类，可用于创建存档。

对于7z SevenZOutputFile提供了一个类似的API，它不代表流，因为我们的实现需要随机访问输出，不能用于一般流。 

ZipArchiveOutputStream类也将受益于随机访问，但可用于不可搜索的流 - 但并非所有功能都可用且存档大小可能略大，请参阅zip页面了解详细信息。

假设您要将一组文件添加到存档，可以先为每个文件使用createArchiveEntry。

通常，这将基于File实例设置一些标志（通常是最后修改的时间，大小和信息，无论这是文件还是目录）。或者，您可以直接创建与您的格式对应的ArchiveEntry子类。在将条目添加到存档之前，通常可能需要设置其他标志，如文件权限或所有者信息。

接下来，您使用putArchiveEntry来添加条目，然后开始使用write来添加条目的内容 - 这里IOUtils.copy可能会派上用场。

最后，在编写完所有内容之后，在添加下一个条目之前，调用closeArchiveEntry。

添加完所有条目后，您将调用完成并最终关闭该流。

## 代码骨架

骨架可能看起来像：

```java
Collection<File> filesToArchive = ...
try (ArchiveOutputStream o = ... create the stream for your format ...) {
    for (File f : filesToArchive) {
        // maybe skip directories for formats like AR that don't store directories
        ArchiveEntry entry = o.createArchiveEntry(f, entryName(f));
        // potentially add more flags to entry
        o.putArchiveEntry(entry);
        if (f.isFile()) {
            try (InputStream i = Files.newInputStream(f.toPath())) {
                IOUtils.copy(i, o);
            }
        }
        o.closeArchiveEntry();
    }
    out.finish();
}
```

其中假设的entryName方法由您编写，并提供该条目的名称，因为它将写入存档。

## 混合使用

如果要将归档格式与压缩格式组合在一起 - 例如在创建“tar.gz”文件时 

将ArchiveOutputStream包装在CompressorOutputStream周围，例如：

```java
try (OutputStream fo = Files.newOutputStream(Paths.get("my.tar.gz"));
     OutputStream gzo = new GzipCompressorOutputStream(fo);
     ArchiveOutputStream o = new TarArchiveOutputStream(gzo)) {
}
```

# 7Z

请注意，Commons Compress目前仅支持用于7z存档的压缩和加密算法的子集。

对于仅写入未压缩的条目，支持LZMA，LZMA2，BZIP2和Deflate  - 除了那些读取支持AES-256 / SHA-256和DEFLATE64。

根本不支持多部分存档。

7z档案可以使用多种压缩和加密方法以及作为其条目的方法管道组合的过滤器。

在Compress 1.8之前，您只能在创建存档时指定一种方法 - 以前可以使用多种方法读取存档。

从Compress 1.8开始，可以使用SevenZOutputFile的setContentMethods方法配置完整管道。在创建存档时，方法按照它们在管道中出现的顺序指定，您还可以为某些方法指定某些参数 - 有关详细信息，请参阅SevenZMethodConfiguration的Javadocs。

从存档中读取条目时，SevenZArchiveEntry的getContentMethods方法将正确表示压缩/加密/过滤方法，但可能无法确定使用的配置选项。

从Compress 1.8开始，只能读取用于LZMA2的字典大小。

目前，只有在阅读档案时才支持实体压缩 - 将多个文件压缩为单个块，以便从重复文件中复制的模式中受益。

这也意味着与原生7z可执行文件相比，使用Commons Compress时压缩率可能会更差。

读取或写入需要SeekableByteChannel，在读取或写入文件时将透明地获取。 

`org.apache.commons.compress.utils.SeekableInMemoryByteChannel` 类允许您读取或写入内存存档。

## 基础功能

- 将条目添加到7z存档：

```java
SevenZOutputFile sevenZOutput = new SevenZOutputFile(file);
SevenZArchiveEntry entry = sevenZOutput.createArchiveEntry(fileToArchive, name);
sevenZOutput.putArchiveEntry(entry);
sevenZOutput.write(contentOfEntry);
sevenZOutput.closeArchiveEntry();
```

- 解压缩给定的7z存档（您肯定会添加异常处理并确保所有流都正确关闭）：

```java
SevenZFile sevenZFile = new SevenZFile(new File("archive.7z"));
SevenZArchiveEntry entry = sevenZFile.getNextEntry();
byte[] content = new byte[entry.getSize()];
LOOP UNTIL entry.getSize() HAS BEEN READ {
    sevenZFile.read(content, offset, content.length - offset);
}
```

- 解压缩给定的内存7z存档：

```java
byte[] inputData; // 7z archive contents
SeekableInMemoryByteChannel inMemoryByteChannel = new SeekableInMemoryByteChannel(inputData);
SevenZFile sevenZFile = new SevenZFile(inMemoryByteChannel);
SevenZArchiveEntry entry = sevenZFile.getNextEntry();
sevenZFile.read();  // read current entry's data
```

## 加密的7z档案

目前，Compress支持读取但不支持写入加密档案。 

在读取加密存档时，必须向SevenZFile的构造函数之一提供密码。 

如果您尝试在未指定密码的情况下读取加密存档，则会抛出PasswordRequiredException（IOException的子类）。

将密码指定为 `byte[]` 时，一个常见的错误是在从String创建 `byte[]` 时使用错误的编码。

SevenZFile类要求字节对应于密码的UTF16-LE编码。 

读取加密存档的示例是

```java
SevenZFile sevenZFile = new SevenZFile(new File("archive.7z"), "secret".getBytes(StandardCharsets.UTF_16LE));
SevenZArchiveEntry entry = sevenZFile.getNextEntry();
byte[] content = new byte[entry.getSize()];
LOOP UNTIL entry.getSize() HAS BEEN READ {
    sevenZFile.read(content, offset, content.length - offset);
}
```

从Compress 1.17开始，添加了新的构造函数，接受密码为`char[]` 而不是 `byte []`。 

我们建议您使用这些以避免上述问题。

```java
SevenZFile sevenZFile = new SevenZFile(new File("archive.7z"), "secret".toCharArray());
SevenZArchiveEntry entry = sevenZFile.getNextEntry();
byte[] content = new byte[entry.getSize()];
LOOP UNTIL entry.getSize() HAS BEEN READ {
    sevenZFile.read(content, offset, content.length - offset);
}
```

ps: 个人建议接口直接使用 string。


# AR

除了存储在ArchiveEntry中的信息之外，ArArchiveEntry还存储有关所有者用户和组以及Unix权限的信息。

## 常见方法

- 将条目添加到ar存档：

```java
ArArchiveEntry entry = new ArArchiveEntry(name, size);
arOutput.putArchiveEntry(entry);
arOutput.write(contentOfEntry);
arOutput.closeArchiveEntry();
```

- 归档文件中读取文件

```java
ArArchiveEntry entry = (ArArchiveEntry) arInput.getNextEntry();
byte[] content = new byte[entry.getSize()];
LOOP UNTIL entry.getSize() HAS BEEN READ {
    arInput.read(content, offset, content.length - offset);
}
```

## 不同的版本支持

传统上，AR格式不允许长度超过16个字符的文件名。 

有两种变体以不同的方式绕过这种限制，即 GNU/SRV4 和BSD变体。 

Commons Compress 1.0到1.2只能使用 GNU/SRV4 变体读取存档，在Commons Compress 1.3中添加了对BSD变体的支持。 

Commons Compress 1.3还可选择支持使用BSD方言编写文件名超过16个字符的存档，不支持编写 GNU/SRV4 方言。

| 版本 | 传统 AR | GNU/SRV4 方言 | BSD 方言 |
|:---|:---|:---|:---|
| 1.0 to 1.2 | read/write | read | - |
| 1.3+ | read/write | read | read/write |


# ARJ

请注意，Commons Compress不支持压缩，加密或多卷ARJ存档。

解压缩给定的arj存档（您肯定会添加异常处理并确保所有流都正确关闭）：

```java
ArjArchiveEntry entry = arjInput.getNextEntry();
byte[] content = new byte[entry.getSize()];
LOOP UNTIL entry.getSize() HAS BEEN READ {
    arjInput.read(content, offset, content.length - offset);
}
```

# cpio

除了存储在ArchiveEntry中的信息之外，CpioArchiveEntry还存储各种属性，包括有关原始所有者和权限的信息。

cpio软件包支持二进制，ASCII和“带CRC”变体的“新的便携式”以及“旧”格式的CPIO存档。

## 常见方法

将条目添加到cpio存档：

```java
CpioArchiveEntry entry = new CpioArchiveEntry(name, size);
cpioOutput.putArchiveEntry(entry);
cpioOutput.write(contentOfEntry);
cpioOutput.closeArchiveEntry();
```

 从归档中读取文件

```java
CpioArchiveEntry entry = cpioInput.getNextCPIOEntry();
byte[] content = new byte[entry.getSize()];
LOOP UNTIL entry.getSize() HAS BEEN READ {
    cpioInput.read(content, offset, content.length - offset);
}
```

传统的CPIO归档是用512字节的块写的 - 块大小是Cpio * Stream的构造的配置参数。 

从版本1.5开始，CpioArchiveInputStream将使用写入的填充以在到达存档结束时填充当前块。 

遗憾的是，许多CPIO实现使用更大的块大小，因此在完全使用归档后，原始输入流中可能会有更多的零字节填充。

# jar

通常，JAR存档是ZIP文件，因此JAR包支持ZIP包提供的所有选项。

为了实现可互操作，应始终使用文件名的UTF-8编码创建JAR存档（这是默认设置）。

使用JarArchiveOutputStream创建的存档将隐式地将JarMarker额外字段添加到存档的第一个存档条目，这将使Solaris将它们识别为Java存档并允许它们用作可执行文件。

请注意，ArchiveStreamFactory不区分ZIP存档和JAR存档，因此如果在JAR存档上使用单参数createArchiveInputStream方法，它仍将返回更通用的ZipArchiveInputStream。

JarArchiveEntry类包含计划在将来支持但从Compress 1.0开始不受支持的证书和属性的字段。

## 常用方法

将条目添加到jar存档：

```java
JarArchiveEntry entry = new JarArchiveEntry(name, size);
entry.setSize(size);
jarOutput.putArchiveEntry(entry);
jarOutput.write(contentOfEntry);
jarOutput.closeArchiveEntry();
```

从归档中读取文件：

```java
JarArchiveEntry entry = jarInput.getNextJarEntry();
byte[] content = new byte[entry.getSize()];
LOOP UNTIL entry.getSize() HAS BEEN READ {
    jarInput.read(content, offset, content.length - offset);
}
```

# dump

除了存储在ArchiveEntry中的信息之外，DumpArchiveEntry还存储各种属性，包括有关原始所有者和权限的信息。

从Commons Compress 1.3开始，仅使用new-fs格式转储归档 - 这是最常见的变体 - 受支持。 

现在，这个库支持未压缩和ZLIB压缩存档，根本无法编写存档。

## 常用方法

从转储归档中读取条目：

```java
DumpArchiveEntry entry = dumpInput.getNextDumpEntry();
byte[] content = new byte[entry.getSize()];
LOOP UNTIL entry.getSize() HAS BEEN READ {
    dumpInput.read(content, offset, content.length - offset);
}
```

在1.5版之前，DumpArchiveInputStream会在读取最后一条记录后关闭原始输入。 

从版本1.5开始，它不会隐式关闭流。


# TAR

TAR包有一个专用的文档页面。

> [TAR](http://commons.apache.org/proper/commons-compress/tar.html)

## 常见方法

将条目添加到tar存档：

```java
TarArchiveEntry entry = new TarArchiveEntry(name);
entry.setSize(size);
tarOutput.putArchiveEntry(entry);
tarOutput.write(contentOfEntry);
tarOutput.closeArchiveEntry();
```

归档中读取文件

```java
TarArchiveEntry entry = tarInput.getNextTarEntry();
byte[] content = new byte[entry.getSize()];
LOOP UNTIL entry.getSize() HAS BEEN READ {
    tarInput.read(content, offset, content.length - offset);
}
```

# ZIP

[zip 文档页面。](http://commons.apache.org/proper/commons-compress/zip.html)

## 常见方法

- 添加到归档

```java
ZipArchiveEntry entry = new ZipArchiveEntry(name);
entry.setSize(size);
zipOutput.putArchiveEntry(entry);
zipOutput.write(contentOfEntry);
zipOutput.closeArchiveEntry();
```

ZipArchiveOutputStream可以使用一些利用SeekableByteChannel的内部优化，如果它知道它正在写入可搜索输出而不是非可搜索流。 

如果要写入文件，则应使用接受File或SeekableByteChannel参数的构造函数，而不是使用ArchiveStream或ArchiveStreamFactory中的工厂方法的构造函数。

- 读取

```java
ZipArchiveEntry entry = zipInput.getNextZipEntry();
byte[] content = new byte[entry.getSize()];
LOOP UNTIL entry.getSize() HAS BEEN READ {
    zipInput.read(content, offset, content.length - offset);
}
```

- 使用推荐的ZipFile类从zip存档中读取条目：

```java
ZipArchiveEntry entry = zipFile.getEntry(name);
InputStream content = zipFile.getInputStream(entry);
try {
    READ UNTIL content IS EXHAUSTED
} finally {
    content.close();
}
```

- 使用SeekableInMemoryByteChannel和ZipFile类从内存中的zip存档中读取条目：

```java
byte[] inputData; // zip archive contents
SeekableInMemoryByteChannel inMemoryByteChannel = new SeekableInMemoryByteChannel(inputData);
ZipFile zipFile = new ZipFile(inMemoryByteChannel);
ZipArchiveEntry archiveEntry = zipFile.getEntry("entryName");
InputStream inputStream = zipFile.getInputStream(archiveEntry);
inputStream.read() // read data from the input stream
```

- 创建包含多个线程的zip文件：

创建zip文件的简单实现可能如下所示：

```java
public class ScatterSample {

  ParallelScatterZipCreator scatterZipCreator = new ParallelScatterZipCreator();
  ScatterZipOutputStream dirs = ScatterZipOutputStream.fileBased(File.createTempFile("scatter-dirs", "tmp"));

  public ScatterSample() throws IOException {
  }

  public void addEntry(ZipArchiveEntry zipArchiveEntry, InputStreamSupplier streamSupplier) throws IOException {
     if (zipArchiveEntry.isDirectory() && !zipArchiveEntry.isUnixSymlink())
        dirs.addArchiveEntry(ZipArchiveEntryRequest.createZipArchiveEntryRequest(zipArchiveEntry, streamSupplier));
     else
        scatterZipCreator.addArchiveEntry( zipArchiveEntry, streamSupplier);
  }

  public void writeTo(ZipArchiveOutputStream zipArchiveOutputStream)
  throws IOException, ExecutionException, InterruptedException {
     dirs.writeTo(zipArchiveOutputStream);
     dirs.close();
     scatterZipCreator.writeTo(zipArchiveOutputStream);
  }
}
```

# 个人思考

1. apache 的工具包提供了很强大的灵活性，但同时也引入了很多的复杂性。使得使用的人还要看很多文档，才会使用。

2. 自己设计的接口。应该让用户不需要关心细节，需要灵活制定的时候，指定下配置即可。对外部屏蔽所有细节。

3. 换言之，apache-common-press 是对各种压缩和归档算法的一次 api 设计。

## 细节屏蔽

可以将所有的细节都屏蔽掉，各种 entry 的差异之类的。

如果有些方法，不支持，可以在实现的时候抛出异常。

# 参考资料

[commons-compress](http://commons.apache.org/proper/commons-compress/examples.html)

* any list
{:toc}