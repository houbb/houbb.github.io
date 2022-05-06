---
layout: post
title:  Java NIO-10-大文件读取
date:  2018-09-22 12:20:47 +0800
categories: [Java]
tags: [java, io, linux, zero-copy, sf]
published: true
---

# 背景

直接将文件全部加载到内存，就时候是行不通的。

比如一个文件特别大，直接占用了 2G 的内存，或者相对较大，500M 但是读取不频繁，用户不希望占用太多的内存。

那该怎么办呢?

## 报错：

```
五月 06, 2022 10:51:53 上午 org.jboss.netty.channel.socket.nio.AbstractNioSelector
警告: Unexpected exception in the selector loop.
java.lang.OutOfMemoryError: Java heap space
```

## 原因

读取文件行的标准方式是在内存中读取，Guava 和Apache Commons IO都提供了如下所示快速读取文件行的方法：

```java
Files.readLines(new File(path), Charsets.UTF_8);
FileUtils.readLines(new File(path));
```

这种方法带来的问题是文件的所有行都被存放在内存中，当文件足够大时很快就会导致程序抛出OutOfMemoryError 异常。

例子：

例如：读取一个大约1G的文件：

```java
@Test
public void givenUsingGuava_whenIteratingAFile_thenWorks() throws IOException {
    String path = ...
    Files.readLines(new File(path), Charsets.UTF_8);
}
```

首先会消耗少量内存：（消耗〜0 Mb）

```
[main] INFO  org.baeldung.java.CoreJavaIoUnitTest - Total Memory: 128 Mb
[main] INFO  org.baeldung.java.CoreJavaIoUnitTest - Free Memory: 116 Mb
```

但是，在处理完整个文件之后，我们可以看到：（消耗了约2 Gb）:

```
[main] INFO  org.baeldung.java.CoreJavaIoUnitTest - Total Memory: 2666 Mb
[main] INFO  org.baeldung.java.CoreJavaIoUnitTest - Free Memory: 490 Mb
```

这意味这一过程大约耗费了2.1GB的内存-原因很简单：现在文件的所有行都被存储在内存中。

把文件所有的内容都放在内存中很快会耗尽可用内存-不论实际可用内存有多大，这点是显而易见的。

而且，我们**通常不需要一次将文件中的所有行都存储在内存中，相反，我们只需要能够遍历每行，进行一些处理并将其丢弃即可**。

因此，这正是我们要做的–遍历所有行而不将所有行都保留在内存中。

# RandomAccessFile-获取指定范围的字符串

```java
/**
 * 获取对应的字符串
 * @param filePath 文件
 * @param startIndex 开始下标
 * @param endIndex 结束下标
 * @return 结果字符串
 * @since 0.0.1
 */
public String getString(final String filePath,
                         final int startIndex,
                         final int endIndex) {
    try {
        final int size = endIndex-startIndex;
        MappedByteBuffer inputBuffer = new RandomAccessFile(filePath, "r")
                .getChannel().map(FileChannel.MapMode.READ_ONLY,
                        startIndex, size);
        byte[] bs = new byte[inputBuffer.capacity()];
        for (int offset = 0; offset < inputBuffer.capacity(); offset ++) {
            bs[offset] = inputBuffer.get(offset);
        }
        return new String(bs);
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

# 按照行读取

```java
String path = "你要读的文件的路径";
RandomAccessFile br = new RandomAccessFile(path, "rw");// 这里rw看你了。要是之都就只写r
String str = null, app = null;
int i = 0;
while ((str = br.readLine()) != null) {
    i++;
    app = app + str;
    if (i >= 100) {// 假设读取100行
        i = 0;
        // 这里你先对这100行操作，然后继续读
        app = null;
    }
}
br.close();
```

## 中文乱码问题

中文会被默认转换为 `ISO-8859-1`，所以对于中文需要处理。

比如我读取的文本为 GBK 编码格式

```java
RandomAccessFile raf = new RandomAccessFile(new File(p),"r");
String s ;
while((s = raf.readLine())!=null){
    String result = new String(s.getBytes("ISO-8859-1") , "GBK");
    System.out.println(result);
}
```

# 大文件读取

```java
// 当逐行读写大于2G的文本文件时推荐使用以下代码
void largeFileIO(String inputFile, String outputFile) {
    try {
        BufferedInputStream bis = new BufferedInputStream(new FileInputStream(new File(inputFile)));
        BufferedReader in = new BufferedReader(new InputStreamReader(bis, "utf-8"), 10 * 1024 * 1024);// 10M缓存
        FileWriter fw = new FileWriter(outputFile);
        while (in.ready()) {
            String line = in.readLine();
            fw.append(line + " ");
        }
        in.close();
        fw.flush();
        fw.close();
    } catch (IOException ex) {
        ex.printStackTrace();
    }
}
```

## 通过文件流式传输

现在让我们看一个解决方案–我们将使用java.util.Scanner来遍历文件的内容并逐行依次检索行：

```java
FileInputStream inputStream = null;
Scanner sc = null;
try {
    inputStream = new FileInputStream(path);
    sc = new Scanner(inputStream, "UTF-8");
    while (sc.hasNextLine()) {
        String line = sc.nextLine();
        // System.out.println(line);
    }
    // note that Scanner suppresses exceptions
    if (sc.ioException() != null) {
        throw sc.ioException();
    }
} finally {
    if (inputStream != null) {
        inputStream.close();
    }
    if (sc != null) {
        sc.close();
    }
}
```

此解决方案将遍历文件中的所有行-允许处理每行-无需保留对其的引用-最终，无需将其保留在内存中：（消耗约150 Mb）

```
[main] INFO  org.baeldung.java.CoreJavaIoUnitTest - Total Memory: 763 Mb
[main] INFO  org.baeldung.java.CoreJavaIoUnitTest - Free Memory: 605 Mb
```

# 使用Apache Commons IO进行流传输

通过使用Commons IO库，也可以使用该库提供的自定义LineIterator来实现相同的目的：

```java
LineIterator it = FileUtils.lineIterator(theFile, "UTF-8");
try {
    while (it.hasNext()) {
        String line = it.nextLine();
        // do something with line
    }
} finally {
    LineIterator.closeQuietly(it);
}
```

由于整个文件不是全部存放在内存中，这也就导致相当保守的内存消耗：（大约消耗了150MB内存）

```
[main] INFO  o.b.java.CoreJavaIoIntegrationTest - Total Memory: 752 Mb
[main] INFO  o.b.java.CoreJavaIoIntegrationTest - Free Memory: 564 Mb
```

# 参考资料

[Java读写大文本文件（2GB以上）](https://www.cnblogs.com/duanxz/p/4874712.html)

[Java读取大文件](https://blog.csdn.net/abu935009066/article/details/113757800)

* any list
{:toc}