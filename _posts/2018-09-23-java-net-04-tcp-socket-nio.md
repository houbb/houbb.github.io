---
layout: post
title:  Java Net-04-TCP Socket NIO 方式实现
date:  2018-09-23 09:35:05 +0800
categories: [Java]
tags: [java, io, java-base, sf]
published: true
excerpt: Java 网络编程之 TCP Socket NIO 方式实现
---

# TCP Socket NIO

## 基础知识

NIO 采取通道（Channel）和缓冲区(Buffer)来传输和保存数据，它是非阻塞式的 I/O，即在等待连接、读写数据（这些都是在一线程以客户端的程序中会阻塞线程的操作）的时候，程序也可以做其他事情，以实现线程的异步操作。

考虑一个即时消息服务器，可能有上千个客户端同时连接到服务器，但是在任何时刻只有非常少量的消息需要读取和分发（如果采用线程池或者一线程一客户端方式，则会非常浪费资源），这就需要一种方法能阻塞等待，直到有一个通道可以进行 I/O 操作。

NIO 的 Selector 选择器就实现了这样的功能，一个 Selector 实例可以同时检查一组信道的 I/O 状态，它就类似一个观察者，只要我们把需要探知的 SocketChannel 告诉 Selector,我们接着做别的事情，当有事件（比如，连接打开、数据到达等）发生时，它会通知我们，传回一组 SelectionKey,我们读取这些 Key,就会获得我们刚刚注册过的 SocketChannel,然后，我们从这个 Channel 中读取数据，接着我们可以处理这些数据。

Selector 内部原理实际是在做一个对所注册的 Channel 的轮询访问，不断的轮询(目前就这一个算法)，一旦轮询到一个 Channel 有所注册的事情发生，比如数据来了，它就会读取 Channel 中的数据，并对其进行处理。

要使用选择器，需要创建一个 Selector 实例，并将其注册到想要监控的信道上（通过 Channel 的方法实现）。

最后调用选择器的 select()方法，该方法会阻塞等待，直到有一个或多个信道准备好了 I/O 操作或等待超时，或另一个线程调用了该选择器的 wakeup()方法。

现在，在一个单独的线程中，通过调用 select()方法，就能检查多个信道是否准备好进行 I/O 操作，由于非阻塞 I/O 的异步特性，在检查的同时，我们也可以执行其他任务。

## 步骤

### 服务端

1. 传建一个 Selector 实例；

2. 将其注册到各种信道，并指定每个信道上感兴趣的I/O操作；

3. 重复执行：

    - 调用一种 select()方法；

    - 获取选取的键列表；

    - 对于已选键集中的每个键：

        - 获取信道，并从键中获取附件（如果为信道及其相关的 key 添加了附件的话）；

        - 确定准备就绪的操纵并执行，如果是 accept 操作，将接收的信道设置为非阻塞模式，并注册到选择器；

        - 如果需要，修改键的兴趣操作集；

        - 从已选键集中移除键。

### 客户端

与基于多线程的 TCP 客户端大致相同，只是这里是通过信道建立的连接，但在等待连接建立及读写时，我们可以异步地执行其他任务。

# 实战代码

## 客户端

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;

public class NioTcpClient {

    /**
     * 监听的端口号
     */
    private static final int PORT = 18888;

    public static void main(String[] args) throws IOException {
        //1. 创建 Socket Channel
        SocketChannel socketChannel = SocketChannel.open();
        socketChannel.configureBlocking(false);
        socketChannel.connect(new InetSocketAddress(PORT));
        while (!socketChannel.finishConnect()) {
            //在等待连接的时间里，可以执行其他任务，以充分发挥非阻塞IO的异步特性
            //这里为了演示该方法的使用，只是一直打印"."
            System.out.println(".");
        }
        System.out.println("\n");


        //分别实例化用来读写的缓冲区
        final String argument = "hello nio tcp!";
        ByteBuffer writeBuf = ByteBuffer.wrap(argument.getBytes());
        ByteBuffer readBuf = ByteBuffer.allocate(argument.length());


        // 共计接收到的信息
        int totalBytesReceived = 0;
        // 每一次接收到的信息
        int bytesReceived = 0;

        while (totalBytesReceived < argument.length()) {

            // 客户端写入信息
            while (writeBuf.hasRemaining()) {
                socketChannel.write(writeBuf);
            }

            // 客户端读取信息
            bytesReceived = socketChannel.read(readBuf);
            if(bytesReceived == -1) {
                throw new RuntimeException("Server Connection has shut down!");
            }

            totalBytesReceived += bytesReceived;
        }

        System.out.println("Receive data from server: " + new String(readBuf.array()));
        // 最后，关闭通道
        socketChannel.close();
    }
}
```

## 服务端

- NioTcpServer.java

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.util.Iterator;
import java.util.concurrent.TimeUnit;

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

        TcpProtocol tcpProtocol = new TcpProtocolImpl(BUFSIZE);
        // 不断轮询select方法，获取准备好的通道所关联的 Key 集
        while (true) {
            //1. 循环等待直到有通道已经准备好
            if(selector.select(TIMEOUT) == 0) {
                System.out.println(".");
                TimeUnit.SECONDS.sleep(1);
                continue;
            }

            //2. 遍历多有的 key
            Iterator<SelectionKey> selectionKeyIterator = selector.selectedKeys().iterator();
            while (selectionKeyIterator.hasNext()) {
                SelectionKey selectionKey = selectionKeyIterator.next();

                if(selectionKey.isAcceptable()) {
                    tcpProtocol.handleAccept(selectionKey);
                }

                if(selectionKey.isReadable()) {
                    tcpProtocol.handleRead(selectionKey);
                }

                if(selectionKey.isValid() &&
                        selectionKey.isWritable()) {
                    tcpProtocol.handleWrite(selectionKey);
                }

                // 手动移除
                selectionKeyIterator.remove();
            }
        }
    }
}
```

其中，我们做了个协议的封装

- TcpProtocol.java

```java
import java.io.IOException;
import java.nio.channels.SelectionKey;

public interface TcpProtocol {

    /**
     * accept I/O形式
     * @param key
     * @throws IOException
     */
    void handleAccept(SelectionKey key) throws IOException;

    /**
     * read I/O形式
     * @param key
     * @throws IOException
     */
    void handleRead(SelectionKey key) throws IOException;

    /**
     * write I/O形式
     * @param key
     * @throws IOException
     */
    void handleWrite(SelectionKey key) throws IOException;
}
```

- TcpProtocolImpl.java

```java
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;

public class TcpProtocolImpl implements TcpProtocol {

    /**
     * 缓冲区的长度
     */
    private int bufferSize;

    public TcpProtocolImpl(int bufferSize) {
        this.bufferSize = bufferSize;
    }

    /**
     * 服务端通道已经准备好了接收新的客户端连接
     * @param key
     * @throws IOException
     */
    @Override
    public void handleAccept(SelectionKey key) throws IOException {
        SocketChannel socketChannel = ((ServerSocketChannel) key.channel()).accept();
        socketChannel.configureBlocking(false);
        //将选择器注册到连接到的客户端信道，并指定该信道key值的属性为OP_READ，同时为该信道指定关联的附件
        socketChannel.register(key.selector(), SelectionKey.OP_READ, ByteBuffer.allocate(bufferSize));
    }

    /**
     * 客户端信道已经准备好了从信道中读取数据到缓冲区
     * @param key
     * @throws IOException
     */
    @Override
    public void handleRead(SelectionKey key) throws IOException {
        SocketChannel socketChannel = (SocketChannel) key.channel();
        //获取该信道所关联的附件，这里为缓冲区
        ByteBuffer buf = (ByteBuffer) key.attachment();

        long bytesRead = socketChannel.read(buf);
        //如果read（）方法返回-1，说明客户端关闭了连接，那么客户端已经接收到了与自己发送字节数相等的数据，可以安全地关闭
        if (bytesRead == -1){
            socketChannel.close();
        }else if(bytesRead > 0){
            //如果缓冲区总读入了数据，则将该信道感兴趣的操作设置为为可读可写
            key.interestOps(SelectionKey.OP_READ | SelectionKey.OP_WRITE);
        }
        System.out.println("handle read: " + new String(buf.array()));
    }

    @Override
    public void handleWrite(SelectionKey key) throws IOException {
        //获取与该信道关联的缓冲区，里面有之前读取到的数据
        ByteBuffer buf = (ByteBuffer) key.attachment();
        //重置缓冲区，准备将数据写入信道
        buf.flip();
        SocketChannel clntChan = (SocketChannel) key.channel();
        //将数据写入到信道中
        clntChan.write(buf);
        if (!buf.hasRemaining()){
            //如果缓冲区中的数据已经全部写入了信道，则将该信道感兴趣的操作设置为可读
            key.interestOps(SelectionKey.OP_READ);
        }
        //为读入更多的数据腾出空间
        buf.compact();
    }
}
```

# 注意

对于非阻塞 SocketChannel 来说，一旦已经调用 connect()方法发起连接，底层套接字可能既不是已经连接，也不是没有连接，而是正在连接。由于底层协议的工作机制，套接字可能会在这个状态一直保持下去，这时候就需要循环地调用 finishConnect()方法来检查是否完成连接，在等待连接的同时，线程也可以做其他事情，这便实现了线程的异步操作。

write()方法的非阻塞调用哦只会写出其能够发送的数据，而不会阻塞等待所有数据，而后一起发送，因此在调用 write()方法将数据写入信道时，一般要用到 while 循环，如：

```java
while(buf.hasRemaining()){
    channel.write(buf);
}
```

任何对 key（信道）所关联的兴趣操作集的改变，都只在下次调用了 select()方法后才会生效。

selectedKeys()方法返回的键集是可修改的，实际上在两次调用 select()方法之间，都必须手动将其清空，否则，它就会在下次调用 select()方法时仍然保留在集合中，而且可能会有无用的操作来调用它，换句话说，select()方法只会在已有的所选键集上添加键，它们不会创建新的建集。

对于 ServerSocketChannel 来说，accept() 是唯一的有效操作，而对于 SocketChannel 来说，有效操作包括读、写和连接，另外，对于 DatagramChannle，只有读写操作是有效的。

# 参考资料

- nio 

http://wiki.jikexueyuan.com/project/java-socket/nio.html

* any list
{:toc}