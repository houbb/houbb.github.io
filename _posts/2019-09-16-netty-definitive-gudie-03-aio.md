---
layout: post
title: Netty 权威指南-03-AIO 案例
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# JDK AIO

jdk7中新增了一些与文件(网络)I/O相关的一些api。这些API被称为NIO.2，或称为AIO(Asynchronous I/O)。

AIO最大的一个特性就是异步能力，这种能力对socket与文件I/O都起作用。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1220/182922_40890c25_508704.jpeg "AIO_module.jpeg")

## 实现方式

- Future 方式

即提交一个 I/O 操作请求（accept/read/write），返回一个 Future。

然后您可以对 Future 进行检查（调用get(timeout)），确定它是否完成，或者阻塞 IO 操作直到操作正常完成或者超时异常。

使用 Future 方式很简单，需要注意的是，因为Future.get()是同步的，所以如果不仔细考虑使用场合，使用 Future 方式可能很容易进入完全同步的编程模式，从而使得异步操作成为一个摆设。

如果这样，那么原来旧版本的 Socket API 便可以完全胜任，大可不必使用异步 I/O.
 
- Callback 方式

即提交一个 I/O 操作请求，并且指定一个 CompletionHandler。

当异步 I/O 操作完成时，便发送一个通知，此时这个 CompletionHandler 对象的 completed 或者 failed 方法将会被调用。

## 性能

因为AIO的实施需充分调用OS参与，IO需要操作系统支持、并发也同样需要操作系统的支持，所以性能方面不同操作系统差异会比较明显。


# Future 实现方式

## Server

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.charset.Charset;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class AioFutureServer {

    private static final int DEFAULT_PORT = 12345;

    private AsynchronousServerSocketChannel serverSocketChannel;

    public AioFutureServer() throws IOException {
        serverSocketChannel = AsynchronousServerSocketChannel.open();
        serverSocketChannel.bind(new InetSocketAddress(DEFAULT_PORT));
        System.out.println("Server listen on port: " + DEFAULT_PORT);
    }

    public void startWithFuture() throws InterruptedException,
            ExecutionException, TimeoutException {
        while (true) {
            // 循环接收客户端请求
            Future<AsynchronousSocketChannel> future = serverSocketChannel.accept();
            // get() 是为了确保 accept 到一个连接
            AsynchronousSocketChannel socket = future.get();
            handleWithFuture(socket);
        }
    }

    /**
     * 处理未来的信息
     * @param channel 异步客户端
     */
    private void handleWithFuture(AsynchronousSocketChannel channel) throws InterruptedException, ExecutionException, TimeoutException {
        ByteBuffer readBuf = ByteBuffer.allocate(8);
        readBuf.clear();

        // 一次可能读不完
        while (true) {
            //get 是为了确保 read 完成，超时时间可以有效避免DOS攻击，如果客户端一直不发送数据，则进行超时处理
            Integer integer = channel.read(readBuf).get(10, TimeUnit.SECONDS);
            System.out.println("read: " + integer);
            if (integer == -1) {
                break;
            }
            readBuf.flip();
            System.out.println("received: " + Charset.forName("UTF-8").decode(readBuf));
            readBuf.clear();
        }
    }


    public static void main(String[] args) throws IOException, InterruptedException, ExecutionException, TimeoutException {
        new AioFutureServer().startWithFuture();
    }

}
```

## 客户端

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.charset.Charset;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class AioClient {

    private static final int DEFAULT_PORT = 12345;

    public static void main(String[] args) throws IOException, ExecutionException, InterruptedException {
        AsynchronousSocketChannel client = AsynchronousSocketChannel.open();
        client.connect(new InetSocketAddress("localhost", DEFAULT_PORT)).get();
        client.write(ByteBuffer.wrap("123456789".getBytes()));
    }

}
```

## 测试

- 启动服务端

```
Server listen on port: 12345
```

- 启动客户端

服务端日志

```
read: 8
received: 12345678
read: 1
received: 9
Exception in thread "main" java.util.concurrent.ExecutionException: java.io.IOException: 指定的网络名不再可用。
```


# Callback 模式

## 服务端

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;
import java.nio.charset.Charset;
import java.util.concurrent.TimeUnit;

public class AioCompletionServer {

    private static final int DEFAULT_PORT = 12345;

    private AsynchronousServerSocketChannel serverSocketChannel;

    public AioCompletionServer() throws IOException {
        serverSocketChannel = AsynchronousServerSocketChannel.open();
        serverSocketChannel.bind(new InetSocketAddress(DEFAULT_PORT));
        System.out.println("Server listen on port: " + DEFAULT_PORT);
    }

    /**
     * 使用回调的方式
     */
    public void startWithCompletionHandler() {
        serverSocketChannel.accept(null,
                new CompletionHandler<AsynchronousSocketChannel, Object>() {
                    @Override
                    public void completed(AsynchronousSocketChannel result, Object attachment) {
                        // 再此接收客户端连接
                        serverSocketChannel.accept(null, this);
                        // 处理结果
                        handleWithCompletionHandler(result);
                    }

                    @Override
                    public void failed(Throwable exc, Object attachment) {
                        exc.printStackTrace();
                    }
                });
    }

    /**
     * 处理异步的结果
     * @param channel 客户端信道
     */
    private void handleWithCompletionHandler(final AsynchronousSocketChannel channel) {
        try {
            final long timeout = 10L;
            final ByteBuffer buffer = ByteBuffer.allocate(8);

            // 再次读取，还是一种回调的方式。
            channel.read(buffer, timeout, TimeUnit.SECONDS, null, new CompletionHandler<Integer, Object>() {
                @Override
                public void completed(Integer result, Object attachment) {
                    System.out.println("read:" + result);
                    if (result == -1) {
                        try {
                            channel.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                        return;
                    }
                    buffer.flip();
                    System.out.println("received message:" + Charset.forName("UTF-8").decode(buffer));
                    buffer.clear();

                    // 递归调用，直到结束为止。
                    channel.read(buffer, timeout, TimeUnit.SECONDS, null, this);
                }

                @Override
                public void failed(Throwable exc, Object attachment) {
                    exc.printStackTrace();
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) throws IOException, InterruptedException {
        new AioCompletionServer().startWithCompletionHandler();
        // 沉睡等待处理。
        TimeUnit.SECONDS.sleep(100);
    }

}
```

## 客户端

同上

# 参考资料

《Netty 权威指南》

[Netty-07-通讯模型之 AIO](https://houbb.github.io/2017/11/16/netty-07-module-aio-03)

[AIO 代码实现](https://blog.csdn.net/qq_29048719/article/details/81045258)

* any list
{:toc}