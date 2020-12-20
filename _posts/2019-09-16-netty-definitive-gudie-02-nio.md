---
layout: post
title: Netty 权威指南-02-NIO 案例
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# NIO 基本概念

![输入图片说明](https://images.gitee.com/uploads/images/2020/1220/182907_c640e2d8_508704.jpeg "nio-module.jpg")

## Buffer

Java NIO Buffers用于和NIO Channel交互。正如你已经知道的，我们从channel中读取数据到buffers里，从buffer把数据写入到channels.

buffer 本质上就是一块内存区，可以用来写入数据，并在稍后读取出来。

这块内存被NIO Buffer包裹起来，对外提供一系列的读写方便开发的接口。

## Channel

Java NIO Channel通道和流非常相似，主要有以下几点区别：

1. 通道可以读也可以写，流一般来说是单向的（只能读或者写）。

2. 通道可以异步读写。

3. 通道总是基于缓冲区Buffer来读写。

## Selector

用单线程处理多个channels的好处是我需要更少的线程来处理channel。

实际上，你甚至可以用一个线程来处理所有的channels。

从操作系统的角度来看，切换线程开销是比较昂贵的，并且每个线程都需要占用系统资源，因此暂用线程越少越好。

需要留意的是，现代操作系统和CPU在多任务处理上已经变得越来越好，所以多线程带来的影响也越来越小。

如果一个CPU是多核的，如果不执行多任务反而是浪费了机器的性能。不过这些设计讨论是另外的话题了。

简而言之，通过Selector我们可以实现单线程操作多个channel。


# NIO 实现方式

NIO 采取通道（Channel）和缓冲区(Buffer)来传输和保存数据，它是非阻塞式的 I/O，即在等待连接、读写数据（这些都是在一线程以客户端的程序中会阻塞线程的操作）的时候，程序也可以做其他事情，以实现线程的异步操作。

考虑一个即时消息服务器，可能有上千个客户端同时连接到服务器，但是在任何时刻只有非常少量的消息需要读取和分发（如果采用线程池或者一线程一客户端方式，则会非常浪费资源），这就需要一种方法能阻塞等待，直到有一个通道可以进行 I/O 操作。

NIO 的 Selector 选择器就实现了这样的功能，一个 Selector 实例可以同时检查一组信道的 I/O 状态，它就类似一个观察者，只要我们把需要探知的 SocketChannel 告诉 Selector,我们接着做别的事情，当有事件（比如，连接打开、数据到达等）发生时，它会通知我们，传回一组 SelectionKey,我们读取这些 Key,就会获得我们刚刚注册过的 SocketChannel,然后，我们从这个 Channel 中读取数据，接着我们可以处理这些数据。

Selector 内部原理实际是在做一个对所注册的 Channel 的轮询访问，不断的轮询(目前就这一个算法)，一旦轮询到一个 Channel 有所注册的事情发生，比如数据来了，它就会读取 Channel 中的数据，并对其进行处理。

要使用选择器，需要创建一个 Selector 实例，并将其注册到想要监控的信道上（通过 Channel 的方法实现）。

最后调用选择器的 select()方法，该方法会阻塞等待，直到有一个或多个信道准备好了 I/O 操作或等待超时，或另一个线程调用了该选择器的 wakeup()方法。

现在，在一个单独的线程中，通过调用 select()方法，就能检查多个信道是否准备好进行 I/O 操作，由于非阻塞 I/O 的异步特性，在检查的同时，我们也可以执行其他任务。


# 服务端

## 时序图

![image](https://user-images.githubusercontent.com/18375710/65043395-6d5df100-d98d-11e9-88ff-b13ca91d55d2.png)

## 步骤

（1）创建一个 Selector 实例；

（2）将其注册到各种信道，并指定每个信道上感兴趣的I/O操作；

（3）重复执行：

    调用一种 select() 方法；

    获取选取的键列表；

    对于已选键集中的每个键：

        获取信道，并从键中获取附件（如果为信道及其相关的 key 添加了附件的话）；

        确定准备就绪的操纵并执行，如果是 accept 操作，将接收的信道设置为非阻塞模式，并注册到选择器；

        如果需要，修改键的兴趣操作集；

        从已选键集中移除键。


## 代码实现

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.concurrent.TimeUnit;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class NioTcpServer {

    /**
     * 缓冲区的长度
     */
    private static final int BUFSIZE = 256;

    /**
     * select方法等待信道准备好的最长时间
     */
    private static final int TIMEOUT = 3000;

    /**
     * 监听的端口号
     */
    private static final int PORT = 18888;

    public static void main(String[] args) throws IOException, InterruptedException {
        // 1. 实例化一个通道
        ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
        // 设置为非阻塞模式
        serverSocketChannel.configureBlocking(false);
        // 绑定监听的端口
        serverSocketChannel.socket().bind(new InetSocketAddress(PORT));
        System.out.println("Server started listen on: " + PORT);

        // 2. 构建一个 Selector，用于监听 Channel 的状态
        Selector selector = Selector.open();
        serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);

        //3. 不断循环等待
        while (true) {
            //3.1 循环等待直到有通道已经准备好
            if(selector.select(TIMEOUT) == 0) {
                System.out.println(".");
                TimeUnit.SECONDS.sleep(1);
                continue;
            }

            //3.2 遍历多有的 key
            Iterator<SelectionKey> selectionKeySetIter = selector.selectedKeys().iterator();
            while(selectionKeySetIter.hasNext()) {
                SelectionKey selectionKey = selectionKeySetIter.next();

                // accept I/O形式
                if(selectionKey.isAcceptable()) {
                    ServerSocketChannel serverSocketChannel1 = (ServerSocketChannel) selectionKey.channel();
                    // 获取客户端 channel
                    SocketChannel socketChannel = serverSocketChannel1.accept();
                    socketChannel.configureBlocking(false);
                    // 选择器注册监听的事件，同时制定关联的附件
                    socketChannel.register(selectionKey.selector(), SelectionKey.OP_READ | SelectionKey.OP_WRITE,
                            ByteBuffer.allocate(BUFSIZE));
                }

                // 客户端信道已经准备好了读取数据到 buffer
                if(selectionKey.isReadable()) {
                    // 读取代码
                    SocketChannel socketChannel = (SocketChannel) selectionKey.channel();
                    // 获取对应的附件信息
                    ByteBuffer byteBuffer = (ByteBuffer) selectionKey.attachment();
                    long bufferRead = socketChannel.read(byteBuffer);

                    //客户端关闭的链接。可以安全关闭
                    if(bufferRead == -1) {
                        socketChannel.close();
                    } else {
                        // 缓冲区读取到了数据，将其感兴趣的操作设置为可读可写。
                        selectionKey.interestOps(SelectionKey.OP_READ | SelectionKey.OP_WRITE);
                        // 打印读取的内容
                        System.out.println("Server read: " + new String(byteBuffer.array()));
                    }
                }

                // 写入处理
                if(selectionKey.isValid()
                    && selectionKey.isWritable()) {
                    SocketChannel socketChannel = (SocketChannel) selectionKey.channel();
                    // 获取附件
                    ByteBuffer byteBuffer = (ByteBuffer) selectionKey.attachment();
                    // 重置缓冲区，准备将数据写入到信道
                    byteBuffer.flip();
                    socketChannel.write(byteBuffer);

                    //Tells whether there are any elements between the current position and the limit.
                    // 如果已经全部写入到信道，则将该信道感兴趣的操作标识为读
                    if(!byteBuffer.hasRemaining()) {
                        selectionKey.interestOps(SelectionKey.OP_READ);
                    }

                    // 为读取更多的数据腾出空间
                    byteBuffer.compact();
                }

                // 手动删除
                selectionKeySetIter.remove();
            }
        }
    }
}
```

# 客户端

## 时序图

![image](https://user-images.githubusercontent.com/18375710/65105238-de8dba80-da06-11e9-98c8-107fae95c9dc.png)

## 代码实现

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;
import java.util.concurrent.TimeUnit;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class NioTcpClient {

    /**
     * 监听的端口号
     */
    private static final int PORT = 18888;

    public static void main(String[] args) throws IOException, InterruptedException {
        //1. 设置为非阻塞
        SocketChannel socketChannel = SocketChannel.open();
        socketChannel.configureBlocking(false);
        socketChannel.connect(new InetSocketAddress(PORT));

        //2. 连接中...
        while (!socketChannel.finishConnect()) {
            System.out.println(".");
            TimeUnit.SECONDS.sleep(1);
        }
        System.out.println("\n");

        //3. 写入/读取信息
        String info = "hello nio test";
        ByteBuffer readBuffer = ByteBuffer.allocate(info.length());
        ByteBuffer writeBuffer = ByteBuffer.wrap(info.getBytes());

        int totalReceivedBytes = 0;
        int receivedBytes = 0;

        while (totalReceivedBytes < info.length()) {
            // 循环写入
            while (writeBuffer.hasRemaining()) {
                socketChannel.write(writeBuffer);
            }

            receivedBytes = socketChannel.read(readBuffer);
            // 说明服务端中断
            if(receivedBytes == -1) {
                throw new RuntimeException("Server has been shut done.");
            }
            totalReceivedBytes += receivedBytes;
        }

        System.out.println("Client received from server: " + new String(readBuffer.array()));
        socketChannel.close();
    }
}
```

# 测试

## 运行服务端

- 服务端

```
Server started listen on: 18888
```

## 运行客户端

- 客户端

```
Client received from server: hello nio test
```

- 服务端

```
.
.
.
Server read: hello nio test                                                                                                               .
.
.
```

# 参考资料

《Netty 权威指南》

[Buffer](https://houbb.github.io/2018/09/22/java-nio-05-buffer)

[Channel](https://houbb.github.io/2018/09/22/java-nio-04-channel)

[Selector](https://houbb.github.io/2018/09/22/java-nio-06-selector)

[TCP Socket NIO 方式实现](https://houbb.github.io/2018/09/23/java-net-04-tcp-socket-nio)

* any list
{:toc}