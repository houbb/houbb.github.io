---
layout: post
title:  Java NIO-10-BIO、NIO、AIO 详解
date:  2018-09-22 12:20:47 +0800
categories: [Java]
tags: [java, io, sf]
published: true
---

# 流的概念和作用

流：代表任何有能力产出数据的数据源对象或者是有能力接受数据的接收端对象。

流的本质：数据传输，根据数据传输特性将流抽象为各种类，方便更直观的进行数据操作。

流的作用：为数据源和目的地建立一个输送通道。

Java 中将输入输出抽象称为流，就好像水管，将两个容器连接起来。流是一组有顺序的，有起点和终点的字节集合，是对数据传输的总称或抽象。即数据在两设备间的传输称为流。

每个流只能是输入流或输出流的一种，不能同时具备两个功能，输入流只能进行读操作，对输出流只能进行写操作。在一个数据传输通道中，如果既要写入数据，又要读取数据，则要分别提供两个流。

# IO 模型

## 传统的 BIO 编程

网络编程的基本模型是 Client/Server 模型，也就是两个进程之间进行相互通信，其中服务端提供位置信息(绑定的 IP 地址和监听端口)，客户端通过连接操作向服务端监听的地址发起连接请求，通过三次握手建立连接，如果连接建立成功，双方就可以通过网络套接字(Socket) 进行通信。

在基于传统同步阻塞模型开发中，ServerSocket 负责绑定 IP 地址，启动监听端口，Socket 负责发起连接操作。

连接成功之后，双方通过输入和输出流进行同步阻塞式通信。

通过下面的通信模型图可以发现，采用 BIO 通信模型的服务端，通常由一个独立的 Acceptor 线程 负责监听客户端的连接，它接收到客户 端连接请求之后为每个客户端创建一个新的线程进行链路处理，处理完成之后，通过输出流返回应答给客户端，线程销毁。

这就是典型的 “一请求一应答” 通信模型。

![BIO](https://github.com/doocs/source-code-hunter/blob/main/images/Netty/BIO%E9%80%9A%E4%BF%A1%E6%A8%A1%E5%9E%8B.png)

该模型最大的问题就是缺乏弹性伸缩能力，当客户端并发访问量增加后，服务端的线程个数和客户端并发访问数呈 1: 1 的正比关系，由于线程是 Java 虚拟机 非常宝贵的系统资源，当线程数膨胀之后，系统的性能将急剧下降，随着并发访问量的继续增大，系统会发生线程堆栈溢出、创建新线程失败等问题，并最终导致进程宕机或者僵死，不能对外提供服务。

在高性能服务器应用领域，往往需要面向成千上万个客户端的并发连接，这种模型显然无法满足高性能、高并发接入的场景。

为了改进 一线程一连接 模型，后来又演进出了一种通过线程池或者消息队列实现 1 个或者多个线程处理 N 个客户端的模型，由于它的底层通信机制依然使用 同步阻塞 IO，所以被称为 “伪异步”。

## 伪异步 IO 编程

为了解决 同步阻塞 IO 面临的一个链路需要一个线程处理的问题，后来有人对它的线程模型进行了优化，后端通过一个线程池来处理多个客户端的请求接入，形成 客户端个数 M：线程池最大线程数 N 的比例关系，其中 M 可以远远大于 N。

通过线程池可以灵活地调配线程资源，设置线程的最大值，防止由于海量并发接入导致线程耗尽。

采用线程池和任务队列可以实现一种叫做 伪异步的 IO 通信框架，其模型图下。

![伪异步的 IO 通信框架](https://github.com/doocs/source-code-hunter/raw/main/images/Netty/%E4%BC%AA%E5%BC%82%E6%AD%A5IO%E9%80%9A%E4%BF%A1%E6%A8%A1%E5%9E%8B.png)

当有新的客户端接入时，将客户端的 Socket 封装成一个 Task 对象 (该类实现了 java.lang.Runnable 接口)，投递到后端的线程池中进行处理，JDK 的线程池维护一个消息队列和 N 个活跃线程，对消息队列中的任务进行处理。

由于线程池可以设置消息队列的大小和最大线程数，因此，它的资源占用是可控的，无论多少个客户端并发访问，都不会导致资源的耗尽和宕机。

伪异步 IO 通信框架 采用了线程池实现，因此避免了为每个请求都创建一个独立线程造成的线程资源耗尽问题。但是由于它底层的通信依然采用同步阻塞模型，因此无法从根本上解决问题。

### 弊端

要对 伪异步 IO 编程 的弊端进行深入分析，首先我们看两个 Java 同步 IO 的 API 说明，随后结合代码进行详细分析。

```java
public abstract class InputStream implements Closeable {

    /**
     * Reads the next byte of data from the input stream. The value byte is
     * returned as an <code>int</code> in the range <code>0</code> to
     * <code>255</code>. If no byte is available because the end of the stream
     * has been reached, the value <code>-1</code> is returned. This method
     * blocks until input data is available, the end of the stream is detected,
     * or an exception is thrown.
     *
     * <p> A subclass must provide an implementation of this method.
     *
     * @return     the next byte of data, or <code>-1</code> if the end of the
     *             stream is reached.
     * @exception  IOException  if an I/O error occurs.
     */
    public abstract int read() throws IOException;
}
```

注意其中的一句话 “This method blocks until input data is available, the end of the stream is detected, or an exception is thrown”，当对 Socket 的输入流进行读取操作的时候，它会一直阻塞下去，直到发生如下三种事件。

- 有数据可读；

- 可用数据已经读取完毕；

- 发生空指针或者 IO 异常。

这意味着当对方发送请求或者应答消息比较缓慢，或者网络传输较慢时，读取输入流一方的通信线程将被长时间阻塞，如果对方要 60s 才能够将数据发送完成，读取一方的 IO 线程 也将会被同步阻塞 60s，在此期间，其他接入消息只能在消息队列中排队。

下面我们接着对输出流进行分析，还是看 JDK IO 类库 输出流的 API 文档，然后结合文档说明进行故障分析。

```java
public abstract class OutputStream implements Closeable, Flushable {

    /**
     * Writes an array of bytes. This method will block until the bytes are *actually written.
     *
     * @param      b   the data.
     * @exception  IOException  if an I/O error occurs.
     * @see        java.io.OutputStream#write(byte[], int, int)
     */
    public void write(byte b[]) throws IOException {
        write(b, 0, b.length);
    }
}
```

当调用 OutputStream 的 write() 方法写输出流的时候，它将会被阻塞，直到所有要发送的字节全部写入完毕，或者发生异常。

学习过 TCP/IP 相关知识的人都知道，当消息的接收方处理缓慢的时候，将不能及时地从 TCP 缓冲区 读取数据，这将会导致发送方的 TCP window size 不断减小，直到为 0，双方处于 Keep-Alive 状态，消息发送方将不能再向 TCP 缓冲区 写入消息，这时如果采用的是 同步阻塞 IO，write 操作 将会被无限期阻塞，直到 TCP window size 大于 0 或者发生 IO 异常。

通过对输入和输出流的 API 文档 进行分析，我们了解到读和写操作都是同步阻塞的，阻塞的时间取决于对方 IO 线程 的处理速度和 网络 IO 的传输速度。

本质上来讲，我们无法保证生产环境的网络状况和对方的应用程序能足够快，如果我们的应用程序依赖对方的处理速度，它的可靠性就非常差。也许在实验室进行的性能测试结果令人满意，但是一旦上线运行，面对恶劣的网络环境和良莠不齐的第三方系统，问题就会如火山一样喷发。

伪异步 IO 实际上仅仅是对之前 IO 线程模型 的一个简单优化，它无法从根本上解决 同步 IO 导致的通信线程阻塞问题。

下面我们就简单分析下通信对方返回应答时间过长会引起的级联故障。

- 服务端处理缓慢，返回应答消息耗费 60s， 平时只需要 10ms。

- 采用伪异步 I/O 的线程正在读取故障服务节点的响应，由于读取输入流是阻塞的，它将会被同步阻塞 60s。

- 假如所有的可用线程都被故障服务器阻塞，那后续所有的 1/O 消息都将在队列中排队。

- 由于线程池采用阻塞队列实现，当队列积满之后，后续入队列的操作将被阻塞。

- 由于前端只有一个 Accptor 线程接收客户端接入，它被阻塞在线程池的同步阻塞队列之后，新的客户端请求消息将被拒绝，客户端会发生大量的连接超时。

- 由于几乎所有的连接都超时，调用者会认为系统已经崩溃，无法接收新的请求消息。

## NIO 编程

与 Socket 类 和 ServerSocket 类 相对应，NIO 也提供了 SocketChannel 和 ServerSocketChannel 两种不同的套接字通道实现。这两种新增的通道都支持阻塞和非阻塞两种模式。

阻塞模式使用非常简单，但是性能和可靠性都不好，非阻塞模式则正好相反。

开发人员可以根据自 己的需要来选择合适的模式。

一般来说，低负载、低并发的应用程序可以选择 同步阻塞 IO，以降低编程复杂度；对于高负载、高并发的网络应用，需要使用 NIO 的非阻塞模式进行开发。

### 类库简介

NIO 类库 是在 JDK 1.4 中引入的。NIO 弥补了原来 同步阻塞 IO 的不足，它在 标准 Java 代码 中提供了高速的、面向块的 IO。

下面我们简单看一下 NIO 类库 及其 相关概念。

#### 1、缓冲区 Buffer

Buffer 对象 包含了一些要写入或者要读出的数据。在 NIO 类库 中加入 Buffer 对象，是其与 原 IO 类库 的一个重要区别。

在面向流的 IO 中，可以将数据直接写入或者将数据直接读到 Stream 对象 中。在 NIO 库中，所有数据都是用缓冲区处理的。

在读取数据时，它是直接读到缓冲区中的；在写入数据时，写入到缓冲区中。任何时候访问 NIO 中的数据，都是通过缓冲区进行操作。

缓冲区实质上是一个数组。

通常它是一个字节数组（ByteBuffer），也可以使用其他种类的数组。但是一个缓冲区不仅仅是一个数组，缓冲区提供了对数据的结构化访问以及维护读写位置（limit）等信息。最常用的缓冲区是 ByteBuffer，一个 ByteBuffer 提供了一组功能用于操作 byte 数组。

除了 ByteBuffer，还有其他的一些缓冲区，事实上，每一种 Java 基本类型（除了 boolean）都对应有一种与之对应的缓冲区，如：CharBuffer、IntBuffer、DoubleBuffer 等等。

除了 ByteBuffer，每一个 Buffer 类 都有完全一样的操作，只是它们所处理的数据类型不一样。

因为大多数 标准 IO 操作 都使用 ByteBuffer，所以它在具有一般缓冲区的操作之外还提供了一些特有的操作，以方便网络读写。

#### 通道 Channel

Channel 是一个通道，它就像自来水管一样，网络数据通过 Channel 读取和写入。

通道与流的不同之处在于通道是双向的，可以用于读、写，或者二者同时进行；流是单向的，要么是 InputStream，要么是 OutputStream。

因为 Channel 是全双工的，所以它可以比流更好地映射底层操作系统的 API。

特别是在 UNIX 网络编程模型 中，底层操作系统的通道都是全双工的，同时支持读写操作。

Channel 组件中 主要类的类图如下所示，从中我们可以看到最常用的 ServerSocketChannel 和 SocketChannel。 

#### 3、多路复用器 Selector

多路复用器 Selector 是 Java NIO 编程 的基础，熟练地掌握 Selector 对于 NIO 编程 至关重要。

多路复用器提供选择已经就绪的任务的能力。

简单来讲，Selector 会不断地轮询 “注册在其上的 Channel”，如果某个 Channel 上面发生读或者写事件，这个 Channel 就处于就绪状态，会被 Selector 轮询出来，然后通过 SelectionKey 可以获取 “就绪 Channel 的集合”，进行后续的 IO 操作。

一个 多路复用器 Selector 可以同时轮询多个 Channel，由于 JDK 使用了 epoll() 代替传统的 select 的实现，所以它并没有最大连接句柄的限制。这也就意味着，只需要一个线程负责 Selector 的轮询，就可以接入成千上万的客户端。

下面，我们通过 NIO 编程的序列图 和 源码分析来熟悉相关的概念。

# NIO 序列图

## NIO 服务端序列图

![NIO 服务端序列图](https://github.com/doocs/source-code-hunter/raw/main/images/Netty/NIO%E6%9C%8D%E5%8A%A1%E7%AB%AF%E5%BA%8F%E5%88%97%E5%9B%BE.png)

下面，我们看一下 NIO 服务端 的主要创建过程。

1、打开 ServerSocketChannel，用于监听客户端的连接，它是所有客户端连接的 父管道，示例代码如下。

```java
ServerSocketChannel acceptorSvr = ServerSocketChannel.open();
```

2、绑定监听端口，设置连接为非阻塞模式，示例代码如下。

```java
acceptorSvr.socket().bind(new InetSocketAddress(InetAddress.getByName("IP"), port));
acceptorSvr.configureBlocking(false);
```

3、创建 Reactor 线程，创建多路复用器并启动线程，示例代码如下。

```java
Selector selector = Selector.open();
New Thread (new ReactorTask()).start();
```

4、将 ServerSocketChannel 注册到 Reactor 线程 的 多路复用器 Selector 上，监听 ACCEPT 事件，示例代码如下。

```java
SelectionKey key = acceptorSvr.register(selector, SelectionKey.OP_ ACCEPT, ioHandler);
```

5、多路复用器在线程 run() 方法 的无限循环体内轮询 准备就绪的 Key，示例代码如下。

```java
int num = selector.select();
Set selectedKeys = selector.selectedKeys();
Iterator it = selectedKeys.iterator();
while (it.hasNext()) {
    SelectionKey key = (SelectionKey) it.next();
    // .... deal with IO event ...
}
```

6、多路复用器 Selector 监听到有新的客户端接入，处理新的接入请求，完成 TCP 三次握手，建立物理链路，示例代码如下。

```java
SocketChannel channel = svrChannel.accept();
```

7、设置客户端链路为非阻塞模式，示例代码如下。

```java
channel.configureBlocking(false);
channel.socket().setReuseAddress(true);
......
```

8、将新接入的客户端连接注册到 Reactor 线程 的多路复用器上，监听读操作，读取客户端发送的网络消息，示例代码如下。

```java
SelectionKey key = socketChannel.register(selector, SelectionKey.OP_READ, ioHandler);
```

9、异步读取客户端请求消息到缓冲区，示例代码如下。

```java
int readNumber = channel.read(receivedBuffer);
```

10、对 ByteBuffer 进行编解码，如果有半包消息指针 reset，继续读取后续的报文，将解码成功的消息封装成 Task，投递到业务线程池中,进行业务逻辑编排，示例代码如下。

```java
List messageList = null;
while (byteBuffer.hasRemain()) {
    byteBuffer.mark();
    Object message = decode(byteBuffer) ;
    if (message == null) {
        byteBuffer.reset();
        break;
    }
    messageList.add(message);
}
if (!byteBuffer.hasRemain()) {
    byteBuffer.clear();
} else {
    byteBuffer.compact();
}
if (messageList != null && !messageList.isEmpty()) {
    for (Object message : messageList) {
        handlerTask(message);
    }
}
```

11、将 POJO 对象 encode 成 ByteBuffer，调用 SocketChannel 的 异步 write 接口，将消息异步发送给客户端，示例代码如下。

```java
socketChannel.write(byteBuffer);
```

注意：如果发送区 TCP 缓冲区满，会导致写半包，此时，需要注册监听写操作位，循环写，直到整包消息写入 TCP 缓冲区。

对于 “半包问题” 此处暂不赘述，后续会单独写一篇详细分析 Netty 的处理策略。

## NIO 客户端序列图

![客户端序列图](https://github.com/doocs/source-code-hunter/raw/main/images/Netty/NIO%E5%AE%A2%E6%88%B7%E7%AB%AF%E5%BA%8F%E5%88%97%E5%9B%BE.png)

1、打开 SocketChannel，绑定客户端本地地址 (可选，默认系统会随机分配一个可用的本地地址)，示例代码如下。

```java
SocketChannel clientChannel = SocketChannel.open();
```

2、设置 SocketChannel 为非阻塞模式，同时设置客户端连接的 TCP 参数，示例代码如下。

```java
clientChannel.configureBlocking(false);
socket.setReuseAddress(true);
socket.setReceiveBufferSize(BUFFER_SIZE);
socket.setSendBufferSize(BUFFER_SIZE);
```

3、异步连接服务端，示例代码如下。

```java
boolean connected = clientChannel.connect( new InetSocketAddress("ip", port) );
```

4、判断是否连接成功，如果连接成功，则直接注册读状态位到多路复用器中，如果当前没有连接成功，则重连 (异步连接，返回 false，说明客户端已经发送 syne 包，服务端没有返回 ack 包，物理链路还没有建立)，示例代码如下。

```java
if (connected) {
    clientChannel.register(selector, SelectionKey.OP_READ, ioHandler);
} else {
    clientChannel.register(selector, SelectionKey.OP_CONNECT, ioHandler);
}
```

5、向 Reactor 线程 的多路复用器注册 OP_CONNECT 状态位，监听服务端的 TCP ACK 应答，示例代码如下。

```java
clientChannel.register(selector, SelectionKey.OP_CONNECT, ioHandler);
```

6、创建 Reactor 线程，创建多路复用器并启动线程，代码如下。

```java
Selector selector = Selector.open();
New Thread( new ReactorTask() ).start();
```

7、多路复用器在线程 run()方法 的无限循环体内轮询 准备就绪的 Key，代码如下。

```java
int num = selector.select();
Set selectedKeys = selector.selectedKeys();
Iterator it = selectedKeys.iterator();
while (it.hasNext()) {
    SelectionKey key = (SelectionKey) it.next();
    // ... deal with IO event ...
}
```

8、接收 connect 事件，并进行处理，示例代码如下。

```java
if (key.isConnectable()) {
    // handlerConnect();
}
```

9、判断连接结果，如果连接成功，注册读事件到多路复用器，示例代码如下。

```java
if(channel.finishConnect()) {
    registerRead();
}
```

10、注册读事件到多路复用器，示例代码如下。

```java
clientChannel.register(selector, SelectionKey.OP_READ, ioHandler);
```

11、异步读客户端请求消息到缓冲区，示例代码如下。

```java
int readNumber = channel.read(receivedBuffer);
```

12、对 ByteBuffer 进行编解码，如果有半包消息接收缓冲区 Reset，继续读取后续的报文，将解码成功的消息封装成 Task，投递到业务线程池中，进行业务逻辑编排。

示例代码如下。

```java
List messageList = null;
while (byteBuffer.hasRemain()) {
    byteBuffer.mark();
    object message = decode(byteBuffer);
    if (message == nu11) {
        byteBuffer.reset();
        break;
    }
    messageList.add(message);
}
if (!byteBuffer.hasRemain()) {
    byteBuffer.clear();
} else {
    byteBuffer.compact();
}
if ( messageList != null && !messageList.isEmpty() )
    for (Object message : messageList) {
        handlerTask(message);
    }
}
```

13、将 POJO 对象 encode 成 ByteBuffer，调用 SocketChannel 的 异步 write 接口，将消息异步发送给客户端。

示例代码如下。

```java
socketChannel.write(buffer);
```

## AIO 编程

NIO2.0 引入了新的异步通道的概念，并提供了异步文件通道和异步套接字通道的实现。

异步通道提供以下两种方式获取获取操作结果。

- 通过 java.util.concurrent.Future 类 来表示异步操作的结果;

- 在执行异步操作的时候传入一个 java.nio.channels.CompletionHandler 接口 的实现类作为操作完成的回调。

NIO2.0 的异步套接字通道是真正的 异步非阻塞 IO，对应于 UNIX 网络编程 中的 事件驱动 IO (AIO)。它不需要通过多路复用器 (Selector) 对注册的通道进行轮询操作即可实现异步读写，从而简化了 NIO 的编程模型。

由于在实际开发中使用较少，所以这里不对 AIO 进行详细分析。

# 四种 IO 编程模型的对比

对比之前，这里再澄清一下 “伪异步 IO” 的概念。

伪异步 IO 的概念完全来源于实践，并没有官方说法。

在 JDK NIO 编程 没有流行之前，为了解决 Tomcat 通信线程同步 IO 导致业务线程被挂住的问题，大家想到了一个办法，在通信线程和业务线程之间做个缓冲区，这个缓冲区用于隔离 IO 线程 和业务线程间的直接访问，这样业务线程就不会被 IO 线程 阻塞。

而对于后端的业务侧来说，将消息或者 Task 放到线程池后就返回了，它不再直接访问 IO 线程 或者进行 IO 读写，这样也就不会被同步阻塞。

![对比](https://github.com/doocs/source-code-hunter/raw/main/images/Netty/%E5%9B%9B%E7%A7%8DIO%E6%A8%A1%E5%9E%8B%E7%9A%84%E5%8A%9F%E8%83%BD%E7%89%B9%E6%80%A7%E5%AF%B9%E6%AF%94%E5%9B%BE.png)

# 操作系统底层 IO 模型

五种 IO 模型包括：阻塞 IO、非阻塞 IO、信号驱动 IO、IO 多路复用、异步 IO。其中，前四个被称为同步 IO。

在网络环境下，可以将 IO 分为两步： 1.等待数据到来； 2.数据搬迁。

在互联网应用中，IO 线程大多被阻塞在等待数据的过程中，所以，如果要想提高 IO 效率，需要降低等待的时间。

## 阻塞 IO（Blocking I/O）

在内核将数据准备好之前，系统调用会一直等待所有的套接字（Socket），默认的是阻塞方式。

![IO 模型](https://github.com/doocs/source-code-hunter/raw/main/images/Netty/%E9%98%BB%E5%A1%9EIO%E6%A8%A1%E5%9E%8B.png)

ava 中的 socket.read()会调用 native read()，而 Java 中的 native 方法会调用操作系统底层的 dll，而 dll 是 C/C++编写的，图中的 recvfrom 其实是 C 语言 socket 编程中的一个方法。

所以其实我们在 Java 中调用 socket.read()最后也会调用到图中的 recvfrom 方法。

应用程序(也就是我们的代码)想要读取数据就会调用 recvfrom，而 recvfrom 会通知 OS 来执行，OS 就会判断数据报是否准备好(比如判断是否收到了一个完整的 UDP 报文，如果收到 UDP 报文不完整，那么就继续等待)。

当数据包准备好了之后，OS 就会将数据从内核空间拷贝到用户空间(因为我们的用户程序只能获取用户空间的内存，无法直接获取内核空间的内存)。

拷贝完成之后 socket.read()就会解除阻塞，并得到 read 的结果。

BIO 中的阻塞，就是阻塞在 2 个地方：

- OS 等待数据报(通过网络发送过来)准备好。

- 将数据从内核空间拷贝到用户空间。

在这 2 个时候，我们的 BIO 程序就是占着茅坑不拉屎，啥事情都不干。

##  非阻塞 IO（Noblocking I/O）

![Noblocking I/O](https://github.com/doocs/source-code-hunter/raw/main/images/Netty/%E9%9D%9E%E9%98%BB%E5%A1%9EIO%E6%A8%A1%E5%9E%8B.png)

每次应用进程询问内核是否有数据报准备好，当有数据报准备好时，就进行拷贝数据报的操作，从内核拷贝到用户空间，和拷贝完成返回的这段时间，应用进程是阻塞的。

但在没有数据报准备好时，并不会阻塞程序，内核直接返回未准备就绪的信号，等待应用进程的下一个轮询。

但是，轮询对于 CPU 来说是较大的浪费，一般只有在特定的场景下才使用。

Java 的 NIO 就是采用这种方式，当我们 new 了一个 socket 后我们可以设置它是非阻塞的。

比如：

```java
// 初始化一个 serverSocketChannel
serverSocketChannel = ServerSocketChannel.open();
serverSocketChannel.bind(new InetSocketAddress(8000));
// 设置serverSocketChannel为非阻塞模式
// 即 accept()会立即得到返回
serverSocketChannel.configureBlocking(false);
```

上面的代码是设置 ServerSocketChannel 为非阻塞，SocketChannel 也可以设置。

从图中可以看到，当设置为非阻塞后，我们的 socket.read()方法就会立即得到一个返回结果(成功 or 失败)，我们可以根据返回结果执行不同的逻辑，比如在失败时，我们可以做一些其他的事情。

但事实上这种方式也是低效的，因为我们不得不使用轮询方法去一直问 OS：“我的数据好了没啊”。

NIO 不会在 recvfrom（询问数据是否准备好）时阻塞，但还是会在将数据从内核空间拷贝到用户空间时阻塞。一定要注意这个地方，Non-Blocking 还是会阻塞的。

##  IO 多路复用（I/O Multiplexing）

![MIO](https://github.com/doocs/source-code-hunter/raw/main/images/Netty/IO%E5%A4%8D%E7%94%A8%E6%A8%A1%E5%9E%8B.png)

传统情况下 client 与 server 通信需要 3 个 socket(客户端的 socket，服务端的 server socket，服务端中用来和客户端通信的 socket)，而在 IO 多路复用中，客户端与服务端通信需要的不是 socket，而是 3 个 channel，通过 channel 可以完成与 socket 同样的操作，channel 的底层还是使用的 socket 进行通信，但是多个 channel 只对应一个 socket(可能不只是一个，但是 socket 的数量一定少于 channel 数量)，这样仅仅通过少量的 socket 就可以完成更多的连接，提高了 client 容量。

其中，不同的操作系统，对此有不同的实现：

Windows：selector

Linux：epoll

Mac：kqueue

其中 epoll，kqueue 比 selector 更为高效，这是因为他们监听方式的不同。

selector 的监听是通过轮询 FD_SETSIZE 来问每一个 socket：“你改变了吗？”，假若监听到事件，那么 selector 就会调用相应的事件处理器进行处理。

但是 epoll 与 kqueue 不同，他们把 socket 与事件绑定在一起，当监听到 socket 变化时，立即可以调用相应的处理。 

selector，epoll，kqueue 都属于 Reactor IO 设计。

## 信号驱动（Signal driven IO）

![SDO](https://github.com/doocs/source-code-hunter/raw/main/images/Netty/%E4%BF%A1%E5%8F%B7%E9%A9%B1%E5%8A%A8IO%E6%A8%A1%E5%9E%8B.png)

信号驱动 IO 模型，应用进程告诉内核：当数据报准备好的时候，给我发送一个信号，对 SIGIO 信号进行捕捉，并且调用我的信号处理函数来获取数据报。

## 异步 IO（Asynchronous I/O）

![AIO](https://github.com/doocs/source-code-hunter/raw/main/images/Netty/%E5%BC%82%E6%AD%A5IO%E6%A8%A1%E5%9E%8B.png)

Asynchronous IO 调用中是真正的无阻塞，其他 IO model 中多少会有点阻塞。

程序发起 read 操作之后，立刻就可以开始去做其它的事。

而在内核角度，当它受到一个 asynchronous read 之后，首先它会立刻返回，所以不会对用户进程产生任何 block。然后，kernel 会等待数据准备完成，然后将数据拷贝到用户内存，当这一切都完成之后，kernel 会给用户进程发送一个 signal，告诉它 read 操作完成了。

可以看出，阻塞程度：阻塞 IO>非阻塞 IO>多路转接 IO>信号驱动 IO>异步 IO，效率是由低到高的。

# 常见问题

## Blocking IO 与 Non-Blocking IO 区别？

阻塞或非阻塞只涉及程序和 OS，Blocking IO 会一直 block 程序直到 OS 返回，而 Non-Block IO 在 OS 内核准备数据包的情况下会立即得到返回。

## Asynchronous IO 与 Synchronous IO？

只要有 block 就是同步 IO，完全没有 block 则是异步 IO。所以我们之前所说的 Blocking IO、Non-Blocking IO、IO Multiplex，均为 Synchronous IO，只有 Asynchronous IO 为异步 IO。

## Non-Blocking IO 不是会立即返回没有阻塞吗?

Non-Blocking IO 在数据包准备时是非阻塞的，但是在将数据从内核空间拷贝到用户空间还是会阻塞。

而 Asynchronous IO 则不一样，当进程发起 IO 操作之后，就直接返回再也不理睬了，由内核完成读写，完成读写操作后 kernel 发送一个信号，告诉进程说 IO 完成。在这整个过程中，进程完全没有被 block。

# IO 模式（Reactor 与 Proactor）

## Reactor

Reactor(反应器)的设计是一种事件驱动思想，比如 Java NIO 中，socket 过来时有四种事件： connectable acceptable readable writable 我们为每一种事件都编写一个处理器，然后设置每个 socket 要监听哪种情况，随后就可以调用对应的处理器。

![Reactor](https://camo.githubusercontent.com/5dc6a03c2a307767fc05a67bcfdfe62057be50650488ae93627176a71097a637/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f32303139313132313230303134333634372e706e673f782d6f73732d70726f636573733d696d6167652f77617465726d61726b2c747970655f5a6d46755a33706f5a57356e6147567064476b2c736861646f775f31302c746578745f6148523063484d364c7939696247396e4c6d4e7a5a473475626d56304c334678587a4d344d444d344d7a6b322c73697a655f31362c636f6c6f725f4646464646462c745f3730)

图中的 input 就可以当作 socket，中间的 Service Hanlder&event dispatch 的作用就是监听每一个 socket(需要实现把 socket 注册进来，并指定要监听哪种情况)，然后给 socket 派发不同的事件。

## Proactor

![Proactor](https://camo.githubusercontent.com/4d7921fc394acb0760bec5aa93b44ee2c3c4ddc1a5959226bd37d2bb5a5628f0/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f323031393131323132303033353033312e706e673f782d6f73732d70726f636573733d696d6167652f77617465726d61726b2c747970655f5a6d46755a33706f5a57356e6147567064476b2c736861646f775f31302c746578745f6148523063484d364c7939696247396e4c6d4e7a5a473475626d56304c334678587a4d344d444d344d7a6b322c73697a655f31362c636f6c6f725f4646464646462c745f3730)

Proactor 与 Reactor 较为类似，以读取数据为例： Reactor 模式

1. 应用程序注册读就绪事件和相关联的事件处理器

2. 事件分离器等待事件的发生

3. 当发生 读就绪事件 的时候，事件分离器调用第一步注册的事件处理器

4. 事件处理器首先执行实际的读取操作，然后根据读取到的内容进行进一步的处理


Proactor 模式

应用程序调用一个异步读取操作，然后注册相应的事件处理器，此时事件处理器不关注读取就绪事件，而是关注读取完成事件，这是区别于 Reactor 的关键。

事件分离器等待读取操作完成事件

在事件分离器等待读取操作完成的时候，操作系统调用内核线程完成读取操作（异步 IO 都是操作系统负责将数据读写到应用传递进来的缓冲区供应用程序操作，操作系统扮演了重要角色），并将读取的内容放入用户传递过来的缓存区中。这也是区别于 Reactor 的一点，Proactor 中，应用程序需要传递缓存区。

事件分离器捕获到读取完成事件后，激活应用程序注册的事件处理器，事件处理器直接从缓存区读取数据，而不需要进行实际的读取操作。

## 区别 

Reactor 中，监听是否有可读或可写事件，然后读/写操作是由程序进行的。

而 Proactor 中，直接监听读/写操作是否完成，也就是说读/写操作是否 OS 来完成，并将读写数据放入一个缓冲区提供给程序。

# 同步与异步，阻塞与非阻塞

同步/异步（描述网络通信模式，适用于请求-响应模型）

同步：发送方发送请求后，需要等待接收响应，否则将一直等待 异步：发送方发送请求后，不需要等待响应，可以继续发送下一个请求，或者主动挂起线程并释放 CPU 阻塞/非阻塞（描述进程的函数调用方式）

阻塞：IO 调用会一直阻塞，直至结果返回才能继续执行 非阻塞：IO 调用会立即返回，不需要等待结果，并可以执行下一个 IO 调用 总结，同步异步和阻塞非阻塞是两个不同的概念，用简单的数据库查询来举一个例子：

如果发送一个请求，需要等待数据库响应，否则将一直等待，这就是同步 如果发送一个请求，不需要数据库响应，就可以继续发送下一个请求(NIO 模式、回调通知模式)，或者主动将任务插入队列中，主动挂起线程并释放 CPU(异步队列模式)，这就是异步

一般来说，同步是最简单的编程方式，而异步编程虽然需要一定技术，但是却能提升系统性能。对于阻塞与非阻塞，阻塞的实时响应性更好，但在高并发情况下阻塞线程数会急剧增加，导致大量的上下文切换会引起挂起/唤醒线程的性能损耗，而非阻塞的性能吞吐量更高，但由于其是顺序执行每一个事件，一旦处理某一个事件过久，会影响后续事件的处理，因此实时响应性较差。

# java 中的 IO 实现

## Java 中的 BIO

传统 Socket 阻塞案例代码

```java
public class TraditionalSocketDemo {

	public static void main(String[] args) throws IOException {
		ServerSocket serverSocket = new ServerSocket(7777);
		System.out.println("服务端启动...");
		while (true) {
			// 获取socket套接字
			// accept()阻塞点
			Socket socket = serverSocket.accept();
			System.out.println("有新客户端连接上来了...");
			// 获取客户端输入流
			java.io.InputStream is = socket.getInputStream();
			byte[] b = new byte[1024];
			while (true) {
				// 循环读取数据
				// read() 阻塞点
				int data = is.read(b);
				if (data != -1) {
					String info = new String(b, 0, data, "GBK");
					System.out.println(info);
				} else {
					break;
				}
			}
		}
	}
}
```

在 debugger 代码的过程中会发现，服务端启动，只有当客户端就绪后才进行下一步操作（如果客户端没有就绪，线程阻塞），客户端发送请求，程序才继续往下执行，如果客户端没有发出请求，线程阻塞；

上面的代码有两个阻塞点：

1. 等待客户端就绪；

2. 等待 OS 将数据从内核拷贝到用户空间（应用程序可以操作的内存空间）；

## 传统 bio 多线程版本

能够解决传统的 BIO 问题，但是会出现：多少个客户端多少个线程，请求和线程的个数 1:1 关系；操作系统资源耗尽，服务端挂了。

使用线程池虽然能控制服务线程的数量，但应对高并发量的访问时，依然会导致大量线程处于阻塞状态，严重影响服务效率。

```java
public class TraditionalSocketDemo2 {

	public static void main(String[] args) throws IOException {
		ServerSocket serverSocket = new ServerSocket(7777);
		System.out.println("服务端启动...");
		while (true) {
			// 获取socket套接字
			// accept()阻塞点
			final Socket socket = serverSocket.accept();
			System.out.println("有新客户端连接上来了...");
			new Thread(new Runnable() {
				@Override
				public void run() {
					try {
						// 获取客户端输入流
						InputStream is = socket.getInputStream();
						byte[] b = new byte[1024];
						while (true) {
							// 循环读取数据
							// read() 阻塞点
							int data = is.read(b);
							if (data != -1) {
								String info = new String(b, 0, data, "GBK");
								System.out.println(info);
							} else {
								break;
							}
						}
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			}).start();
		}
	}
}
```

## Java 中的 NIO

NIO 是一种基于通道和缓冲区的 I/O 方式，它可以使用 Native 函数库直接分配堆外内存（区别于 JVM 的运行时数据区），然后通过一个存储在 java 堆里面的 DirectByteBuffer 对象作为这块内存的直接引用进行操作。

这样能在一些场景显著提高性能，因为避免了在 Java 堆和 Native 堆中来回复制数据。

### 1、Java NIO 组件

NIO 主要有三大核心部分：Channel(通道)，Buffer(缓冲区), Selector（选择器）。

传统 IO 是基于字节流和字符流进行操作（基于流），而 NIO 基于 Channel 和 Buffer(缓冲区)进行操作，数据总是从通道读取到缓冲区中，或者从缓冲区写入到通道中。

Selector(选择区)用于监听多个通道的事件（比如：连接打开，数据到达）。

因此，单个线程可以监听多个数据通道。

1.1 Buffer

Buffer（缓冲区）是一个用于存储特定基本类型数据的容器。除了 boolean 外，其余每种基本类型都有一个对应的 buffer 类。Buffer 类的子类有 ByteBuffer, CharBuffer, DoubleBuffer, FloatBuffer, IntBuffer, LongBuffer, ShortBuffer 。

1.2 Channel

Channel（通道）表示到实体，如硬件设备、文件、网络套接字或可以执行一个或多个不同 I/O 操作（如读取或写入）的程序组件的开放的连接。Channel 接口的常用实现类有 FileChannel（对应文件 IO）、DatagramChannel（对应 UDP）、SocketChannel 和 ServerSocketChannel（对应 TCP 的客户端和服务器端）。Channel 和 IO 中的 Stream(流)是差不多一个等级的。只不过 Stream 是单向的，譬如：InputStream, OutputStream.而 Channel 是双向的，既可以用来进行读操作，又可以用来进行写操作。

1.3 Selector

Selector（选择器）用于监听多个通道的事件（比如：连接打开，数据到达）。因此，单个的线程可以监听多个数据通道。即用选择器，借助单一线程，就可对数量庞大的活动 I/O 通道实施监控和维护。

写就绪相对有一点特殊，一般来说，你不应该注册写事件。写操作的就绪条件为底层缓冲区有空闲空间，而写缓冲区绝大部分时间都是有空闲空间的，所以当你注册写事件后，写操作一直是就绪的，选择处理线程全占用整个 CPU 资源。所以，只有当你确实有数据要写时再注册写操作，并在写完以后马上取消注册。

基于阻塞式 I/O 的多线程模型中，Server 为每个 Client 连接创建一个处理线程，每个处理线程阻塞式等待可能达到的数据，一旦数据到达，则立即处理请求、返回处理结果并再次进入等待状态。由于每个 Client 连接有一个单独的处理线程为其服务，因此可保证良好的响应时间。但当系统负载增大（并发请求增多）时，Server 端需要的线程数会增加，对于操作系统来说，线程之间上下文切换的开销很大，而且每个线程都要占用系统的一些资源（如内存）。因此，使用的线程越少越好。

但是，现代的操作系统和 CPU 在多任务方面表现的越来越好，所以多线程的开销随着时间的推移，变得越来越小了。

实际上，如果一个 CPU 有多个内核，不使用多任务可能是在浪费 CPU 能力。

传统的 IO 处理方式，一个线程处理一个网络连接

![io](https://camo.githubusercontent.com/8d2aa67e81dc6d9dd2a940eba4812a38a3a023d914f6d0d9dc59a587b2d29cbd/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f323031393131323132303335323538382e706e673f782d6f73732d70726f636573733d696d6167652f77617465726d61726b2c747970655f5a6d46755a33706f5a57356e6147567064476b2c736861646f775f31302c746578745f6148523063484d364c7939696247396e4c6d4e7a5a473475626d56304c334678587a4d344d444d344d7a6b322c73697a655f31362c636f6c6f725f4646464646462c745f3730)


NIO 处理方式，一个线程可以管理过个网络连接

![nio](https://camo.githubusercontent.com/ad886769c3b8e83a64d8152c087b6bc94e8a629d06dc400c133898e843bd34f7/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f32303139313132313230333630323237392e706e673f782d6f73732d70726f636573733d696d6167652f77617465726d61726b2c747970655f5a6d46755a33706f5a57356e6147567064476b2c736861646f775f31302c746578745f6148523063484d364c7939696247396e4c6d4e7a5a473475626d56304c334678587a4d344d444d344d7a6b322c73697a655f31362c636f6c6f725f4646464646462c745f3730)

### 2、NIO 服务器端如何实现非阻塞？

服务器上所有 Channel 需要向 Selector 注册，而 Selector 则负责监视这些 Socket 的 IO 状态(观察者)，当其中任意一个或者多个 Channel 具有可用的 IO 操作时，该 Selector 的 select()方法将会返回大于 0 的整数，该整数值就表示该 Selector 上有多少个 Channel 具有可用的 IO 操作，并提供了 selectedKeys（）方法来返回这些 Channel 对应的 SelectionKey 集合(一个 SelectionKey 对应一个就绪的通道)。

正是通过 Selector，使得服务器端只需要不断地调用 Selector 实例的 select()方法即可知道当前所有 Channel 是否有需要处理的 IO 操作。

注：java NIO 就是多路复用 IO，jdk7 之后底层是 epoll 模型。

### Java NIO 的简单实现

服务端：

```java
public class NioServer {

    private int port;
    private Selector selector;
    private ExecutorService service = Executors.newFixedThreadPool(5);

    public static void main(String[] args){
        new NioServer(8080).start();
    }

    public NioServer(int port) {
        this.port = port;
    }

    public void init() {
        ServerSocketChannel ssc = null;
        try {
            ssc = ServerSocketChannel.open();
            ssc.configureBlocking(false);
            ssc.bind(new InetSocketAddress(port));
            selector = Selector.open();
            ssc.register(selector, SelectionKey.OP_ACCEPT);
            System.out.println("NioServer started ......");
        } catch (IOException e) {
            e.printStackTrace();
        }finally {
        }
    }

    public void accept(SelectionKey key) {
        try {
            ServerSocketChannel ssc = (ServerSocketChannel) key.channel();
            SocketChannel sc = ssc.accept();
            sc.configureBlocking(false);
            sc.register(selector, SelectionKey.OP_READ);
            System.out.println("accept a client : " + sc.socket().getInetAddress().getHostName());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void start() {
        this.init();
        while (true) {
            try {
                int events = selector.select();
                if (events > 0) {
                    Iterator<SelectionKey> selectionKeys = selector.selectedKeys().iterator();
                    while (selectionKeys.hasNext()) {
                        SelectionKey key = selectionKeys.next();
                        selectionKeys.remove();
                        if (key.isAcceptable()) {
                            accept(key);
                        } else {
                            service.submit(new NioServerHandler(key));
                        }
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public static class NioServerHandler implements Runnable{

        private SelectionKey selectionKey;

        public NioServerHandler(SelectionKey selectionKey) {
            this.selectionKey = selectionKey;
        }

        @Override
        public void run() {
            try {
                if (selectionKey.isReadable()) {
                    SocketChannel socketChannel = (SocketChannel) selectionKey.channel();
                    ByteBuffer buffer = ByteBuffer.allocate(1024);
                    socketChannel.read(buffer);
                    buffer.flip();
                    System.out.println("收到客户端"+socketChannel.socket().getInetAddress().getHostName()+"的数据："+new String(buffer.array()));
                    //将数据添加到key中
                    ByteBuffer outBuffer = ByteBuffer.wrap(buffer.array());
                    socketChannel.write(outBuffer);// 将消息回送给客户端
                    selectionKey.cancel();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

客户端

```java
public class NioClient {
    private static final String host = "127.0.0.1";
    private static final int port = 8080;
    private Selector selector;

    public static void main(String[] args){
        for (int i=0;i<3;i++) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    NioClient client = new NioClient();
                    client.connect(host, port);
                    client.listen();
                }
            }).start();
        }
    }

    public void connect(String host, int port) {
        try {
            SocketChannel sc = SocketChannel.open();
            sc.configureBlocking(false);
            this.selector = Selector.open();
            sc.register(selector, SelectionKey.OP_CONNECT);
            sc.connect(new InetSocketAddress(host, port));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void listen() {
        while (true) {
            try {
                int events = selector.select();
                if (events > 0) {
                    Iterator<SelectionKey> selectionKeys = selector.selectedKeys().iterator();
                    while (selectionKeys.hasNext()) {
                        SelectionKey selectionKey = selectionKeys.next();
                        selectionKeys.remove();
                        //连接事件
                        if (selectionKey.isConnectable()) {
                            SocketChannel socketChannel = (SocketChannel) selectionKey.channel();
                            if (socketChannel.isConnectionPending()) {
                                socketChannel.finishConnect();
                            }

                            socketChannel.configureBlocking(false);
                            socketChannel.register(selector, SelectionKey.OP_READ);
                            socketChannel.write(ByteBuffer.wrap(("Hello this is " + Thread.currentThread().getName()).getBytes()));
                        } else if (selectionKey.isReadable()) {
                            SocketChannel sc = (SocketChannel) selectionKey.channel();
                            ByteBuffer buffer = ByteBuffer.allocate(1024);
                            sc.read(buffer);
                            buffer.flip();
                            System.out.println("收到服务端的数据："+new String(buffer.array()));
                        }
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

## Java 中的 AIO

JDK1.7 升级了 NIO 类库，升级后的 NIO 类库被称为 NIO 2.0。Java 正式提供了异步文件 I/O 操作，同时提供了与 UNIX 网络编程事件驱动 I/O 对应的 AIO。NIO 2.0 引入了新的异步通道的概念，并提供了异步文件通道和异步套接字通道的实现。

异步通道获取获取操作结果方式：

使用 java.util.concurrent.Future 类表示异步操作的结果；

在执行异步操作的时候传入一个 java.nio.channels，操作完成后会回调 CompletionHandler 接口的实现类。

NIO 2.0 的异步套接字通道是真正的异步非阻塞 I/O，对应于 UNIX 网络编程中的事件驱动 I/O（AIO）。

# 选择 Netty 开发项目的理由

从可维护性角度看，由于 NIO 采用了异步非阻塞编程模型，而且是一个 IO 线程 处理多条链路，它的调试和跟踪非常麻烦，特别是生产环境中的问题，我们无法进行有效的调试和跟踪，往往只能靠一些日志来辅助分析，定位难度很大。

## 为什么不选择 Java 原生 NIO 进行开发

NIO 的类库和 API 使用起来非常繁杂，需要熟练掌握 Selector、ServerSocketChannel、SocketChannel、ByteBuffer 等。

需要具备其他的额外技能做铺垫，例如，熟悉 Java 多线程编程。这是因为 NIO 编程 涉及到 Reactor 模式，你必须对 多线程 和 网路编程 非常熟悉，才能编写出高质量的 NIO 程序。

可靠性能力补齐，工作量和难度都非常大。

例如客户端面临：断连重连、网络闪断、半包读写、失败缓存、网络拥塞和异常码流的处理，等问题。

JDK NIO 的 BUG，例如臭名昭著的 epoll bug，它会导致 Selector 空轮询，最终导致 CPU 100%。虽然官方声称修复了该问题，但是直到 JDK 1.7 版本 该问题仍旧未得到彻底的解决。

## 为什么选择 Netty 进行开发

Netty 是业界最流行的 NIO 框架 之一，它的健壮性、功能、性能、可定制性和可扩展性在同类框架中都是首屈一指的，已经得到成百上千的商用项目验证，例如 Hadoop 的 RPC 框架 Avro ，阿里的 RPC 框架 Dubbo 就使用了 Netty 作为底层通信框架。

通过对 Netty 的分析，我们将它的优点总结如下。

API 使用简单，开发门槛低；

功能强大，预置了多种编解码功能，支持多种主流协议；

定制能力强，可以通过 ChannelHandler 对通信框架进行灵活地扩展；

性能高，通过与其他业界主流的 NIO 框架 对比，Netty 的综合性能最优；

成熟、稳定，Netty 修复了已经发现的所有 JDK NIO BUG，业务开发人员不需要再为 NIO 的 BUG 而烦恼；

社区活跃，版本迭代周期短，发现的 BUG 可以被及时修复，同时，更多的新功能会加入；

经历了大规模的商业应用考验，质量得到验证。Netty 在互联网、大数据、网络游戏、企业应用、电信软件等众多行业已经得到了成功商用，证明它已经完全能够满足不同行业的商业应用了。

正是因为这些优点，Netty 逐渐成为了 Java NIO 编程 的首选框架。

# 参考资料

[把被说烂的BIO、NIO、AIO再从头到尾扯一遍](https://github.com/doocs/source-code-hunter/blob/main/docs/Netty/IOTechnologyBase/%E6%8A%8A%E8%A2%AB%E8%AF%B4%E7%83%82%E7%9A%84BIO%E3%80%81NIO%E3%80%81AIO%E5%86%8D%E4%BB%8E%E5%A4%B4%E5%88%B0%E5%B0%BE%E6%89%AF%E4%B8%80%E9%81%8D.md)

[四种IO编程及对比.md](https://github.com/doocs/source-code-hunter/blob/main/docs/Netty/IOTechnologyBase/%E5%9B%9B%E7%A7%8DIO%E7%BC%96%E7%A8%8B%E5%8F%8A%E5%AF%B9%E6%AF%94.md)

* any list
{:toc}