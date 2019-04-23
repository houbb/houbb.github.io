---
layout: post
title:  Java NIO-07-Pipe
date:  2018-09-22 12:20:47 +0800
categories: [Java]
tags: [java, nio, java-base, sf]
published: true
---

# 管道

一个Java NIO的管道是两个线程间单向传输数据的连接。

一个管道（Pipe）有一个source channel和一个sink channel。

我们把数据写到sink channel中，这些数据可以同过source channel再读取出来。

![pipe-internals.png](http://tutorials.jenkov.com/images/java-nio/pipe-internals.png)

# 基本使用

## 创建

打开一个管道通过调用Pipe.open()工厂方法，如下：

```java
Pipe pipe = Pipe.open();
```

## 向管道写入数据（Writing to a Pipe）

向管道写入数据需要访问他的sink channel：

```java
Pipe.SinkChannel sinkChannel = pipe.sink();
```

接下来就是调用write()方法写入数据了：

```java
String newData = "New String to write to file..." + System.currentTimeMillis();

ByteBuffer buf = ByteBuffer.allocate(48);
buf.clear();
buf.put(newData.getBytes());

buf.flip();

while(buf.hasRemaining()) {
    sinkChannel.write(buf);
}
```

## 从管道读取数据（Reading from a Pipe）

类似的从管道中读取数据需要访问他的source channel：

```java
Pipe.SourceChannel sourceChannel = pipe.source();
```

接下来调用read()方法读取数据：

```java
ByteBuffer buf = ByteBuffer.allocate(48);
int bytesRead = inChannel.read(buf);
```

注意这里read()的整形返回值代表实际读取到的字节数。

# 实际例子

- PipeThreadTest

不同线程间的测试

```java
import java.io.IOException;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.nio.ByteBuffer;
import java.nio.channels.Pipe;

public class PipeThreadTest {

    public static void main(String[] args) throws IOException {
        Pipe pipe = Pipe.open();

        Thread thread1 = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Pipe.SinkChannel sinkChannel = pipe.sink();
                    ByteBuffer buf = ByteBuffer.allocate(48);
                    buf.clear();
                    buf.put("hello nio pipe!".getBytes());
                    buf.flip();
                    while(buf.hasRemaining()) {
                        sinkChannel.write(buf);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });

        Thread thread2 = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Pipe.SourceChannel sourceChannel = pipe.source();

                    //create buffer with capacity of 48 bytes
                    ByteBuffer buf = ByteBuffer.allocate(48);
                    //read into buffer.
                    int bytesRead = sourceChannel.read(buf);
                    buf.flip();
                    while (bytesRead != -1) {
                        while (buf.hasRemaining()) {
                            // read 1 byte at a time
                            System.out.print((char) buf.get());
                        }
                        bytesRead = sourceChannel.read(buf);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });

        thread1.start();
        thread2.start();
    }
}
```

- 日志信息

```
hello nio pipe!
```

# 拓展阅读 

[java io 管道](https://houbb.github.io/2018/09/21/java-io-02-pipe)

# 参考资料

http://wiki.jikexueyuan.com/project/java-nio-zh/java-nio-pipe.html

* any list
{:toc}