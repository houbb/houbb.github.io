---
layout: post
title:  Netty-11-流关闭的顺序
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, sf]
published: true
---

# 流的关闭顺序

一般情况下是：先打开的后关闭，后打开的先关闭

另一种情况：看依赖关系，如果流a依赖流b，应该先关闭流a，再关闭流b。例如，处理流a依赖节点流b，应该先关闭处理流a，再关闭节点流b
可以只关闭处理流，不用关闭节点流。处理流关闭的时候，会调用其处理的节点流的关闭方法。

## 注意：

1. 如果将节点流关闭以后再关闭处理流，会抛出IO异常。

2. 如果关闭了处理流，在关闭与之相关的节点流，也可能出现IO异常。

# 流的类别

节点流：可以从或向一个特定的地方（节点）读写数据。如FileReader.

处理流：是对一个已存在的流的连接和封装，通过所封装的流的功能调用实现数据读写。如BufferedReader.处理流的构造方法总是要带一个其他的流对象做参数。一个流对象经过其他流的多次包装，称为流的链接。

## 节点流

文 件 FileInputStream FileOutputStrean FileReader FileWriter 文件进行处理的节点流。

字符串 StringReader StringWriter 对字符串进行处理的节点流。

数 组 ByteArrayInputStream ByteArrayOutputStreamCharArrayReader CharArrayWriter 对数组进行处理的节点流（对应的不再是文件，而是内存中的一个数组）。

管 道 PipedInputStream PipedOutputStream PipedReaderPipedWriter 对管道进行处理的节点流。

## 常用处理流（关闭处理流使用关闭里面的节点流）

缓冲流：BufferedInputStrean BufferedOutputStream BufferedReader BufferedWriter
---增加缓冲功能，避免频繁读写硬盘。

转换流：InputStreamReader OutputStreamReader实现字节流和字符流之间的转换。

数据流 DataInputStream DataOutputStream 等-提供将基础数据类型写入到文件中，或者读取出来.


# close 的 API

## API

```
close
void close()
           throws IOException
Closes this stream and releases any system resources associated with it. If the stream is already closed then invoking this method has no effect.
Throws:
IOException - if an I/O error occurs
```

关闭该流并释放与之关联的所有资源。

在关闭该流后，再调用 read()、ready()、mark()、reset() 或 skip() 将抛出 IOException。

关闭以前关闭的流无效。 

# 参考资料

[JAVA的节点流和处理流以及流的关闭顺序](https://www.jianshu.com/p/83f0a45883a3)

[io流的关闭顺序](https://www.cnblogs.com/xwzp/p/7500409.html)

[JAVA的节点流和处理流以及流的关闭顺序](https://www.cnblogs.com/byrhuangqiang/p/3924985.html)

* any list
{:toc}

