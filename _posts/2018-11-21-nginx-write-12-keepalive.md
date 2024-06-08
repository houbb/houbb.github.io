---
layout: post
title:  从零手写实现 nginx-12-keepalive HTTP 持久连接或连接复用
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---


# 前言

大家好，我是老马。很高兴遇到你。

我们为 java 开发者实现了 java 版本的 nginx

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

## 手写 nginx 系列

如果你对 nginx 原理感兴趣，可以阅读：

[从零手写实现 nginx-01-为什么不能有 java 版本的 nginx?](https://houbb.github.io/2018/11/22/nginx-write-01-how-to)

[从零手写实现 nginx-02-nginx 的核心能力](https://houbb.github.io/2018/11/22/nginx-write-02-basic-http)

[从零手写实现 nginx-03-nginx 基于 Netty 实现](https://houbb.github.io/2018/11/22/nginx-write-03-basic-http-netty)

[从零手写实现 nginx-04-基于 netty http 出入参优化处理](https://houbb.github.io/2018/11/22/nginx-write-04-netty-http-optimize)

[从零手写实现 nginx-05-MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）](https://houbb.github.io/2018/11/22/nginx-write-05-mime-type)

[从零手写实现 nginx-06-文件夹自动索引](https://houbb.github.io/2018/11/22/nginx-write-06-dir-list)

[从零手写实现 nginx-07-大文件下载](https://houbb.github.io/2018/11/22/nginx-write-07-big-file)

[从零手写实现 nginx-08-范围查询](https://houbb.github.io/2018/11/22/nginx-write-08-range)

[从零手写实现 nginx-09-文件压缩](https://houbb.github.io/2018/11/22/nginx-write-09-comparess)

[从零手写实现 nginx-10-sendfile 零拷贝](https://houbb.github.io/2018/11/22/nginx-write-10-sendfile)

[从零手写实现 nginx-11-file+range 合并](https://houbb.github.io/2018/11/22/nginx-write-11-file-and-range-merge)

[从零手写实现 nginx-12-keep-alive 连接复用](https://houbb.github.io/2018/11/22/nginx-write-12-keepalive)

[从零手写实现 nginx-13-nginx.conf 配置文件介绍](https://houbb.github.io/2018/11/22/nginx-write-13-nginx-conf-intro)

[从零手写实现 nginx-14-nginx.conf 和 hocon 格式有关系吗？](https://houbb.github.io/2018/11/22/nginx-write-14-nginx-conf-hocon)

[从零手写实现 nginx-15-nginx.conf 如何通过 java 解析处理？](https://houbb.github.io/2018/11/22/nginx-write-15-nginx-conf-parser)

[从零手写实现 nginx-16-nginx 支持配置多个 server](https://houbb.github.io/2018/11/22/nginx-write-16-nginx-conf-multi-server)

[从零手写实现 nginx-17-nginx 默认配置优化](https://houbb.github.io/2018/11/22/nginx-write-17-nginx-conf-global-default)

[从零手写实现 nginx-18-nginx 请求头响应头的处理](https://houbb.github.io/2018/11/22/nginx-write-18-nginx-conf-header-oper)

# 3次握手+4次挥手

## 3次握手

TCP三次握手过程：

```
客户端               服务器
(SYN=1, seq=x)       ---->
                             (SYN=1, ACK=1, seq=y, ack=x+1)
<----                   (SYN=0, ACK=1, seq=y+1, ack=x+1)
(SYN=0, ACK=1, seq=x+1, ack=y+2)
---->                   <---- 
```

这个ASCII图示说明了三次握手的每个步骤：

1. **第一步**：客户端随机生成一个序列号`x`，并将SYN标志位设为1，表示开始建立连接，然后将这个TCP段发送给服务器。

2. **第二步**：服务器收到客户端的SYN后，会生成自己的序列号`y`，并将SYN和ACK标志位都设为1，确认号`ack`设为`x+1`，表示已经接收到客户端的SYN，然后将这个TCP段发送回客户端。

3. **第三步**：客户端收到服务器的SYN-ACK后，会发送一个ACK确认包，ACK标志位设为1，序列号`seq`设为`x+1`，确认号`ack`设为`y+1`，表示已经接收到服务器的SYN-ACK，至此，三次握手完成，TCP连接建立。

请注意，这个图示是简化的，实际的TCP段中还会包含其他信息，如源端口号、目的端口号、窗口大小等。

此外，序列号和确认号在实际中是32位的数字，这里为了简化表示只用了单个字符。

## 断连接的 4 次挥手

TCP四次挥手过程：

```
客户端               服务器
(FIN=1, seq=u)       ---->
                             (ACK=1, seq=v, ack=u+1)
<----                   (FIN=1, ACK=1, seq=w, ack=u+1)
(ACK=1, seq=u+1, ack=w+1)
---->                   <---- 
```

这个ASCII图示说明了TCP四次挥手的每个步骤：

1. **第一步**：客户端决定关闭连接，随机生成一个序列号`u`，并将FIN标志位设为1，表示客户端已经完成发送数据，准备关闭连接，然后将这个TCP段发送给服务器。

2. **第二步**：服务器收到客户端的FIN后，会发送一个ACK确认包，序列号`v`，确认号`ack`设为`u+1`，表示已经接收到客户端的FIN请求，但此时服务器可能还有数据要发送，所以连接并未立即关闭。

3. **第三步**：服务器完成数据发送后，随机生成一个序列号`w`，并将FIN标志位设为1，表示服务器也准备关闭连接，然后将这个TCP段发送给客户端。

4. **第四步**：客户端收到服务器的FIN后，会发送一个ACK确认包，序列号`u+1`，确认号`ack`设为`w+1`，表示已经接收到服务器的FIN请求，至此，四次挥手完成，TCP连接关闭。

## 为什么创建连接 3 次，但是断连接 4 次？

TCP连接的建立需要三次握手，而断开连接需要四次挥手，这是由TCP协议的设计和其确保数据可靠传输的特性决定的。

下面是创建连接和断开连接过程中差异的原因：

### 创建连接（三次握手）：

1. **同步连接状态**：三次握手的目的是确保双方的接收和发送通道都处于工作状态。客户端发送SYN开始连接建立，服务器回复SYN-ACK确认接收到客户端的连接请求，客户端再回复ACK确认接收到服务器的确认。

2. **防止已失效的连接请求突然传输**：如果一个连接请求在网络中延迟了，并且在连接释放后到达服务器，服务器可能会错误地认为客户端想要建立新连接。三次握手通过序列号机制避免了这种情况。

3. **交换初始序列号**：三次握手允许客户端和服务器交换各自的初始序列号，这是TCP连接中数据传输的基础。

### 断开连接（四次挥手）：
1. **不同时结束**：TCP连接是全双工的，这意味着数据可以在两个方向上独立发送。因此，每个方向上的连接结束都需要单独的FIN和ACK。

2. **确保数据传输完成**：在客户端或服务器想要关闭连接时，可能还有数据在传输中。四次挥手允许双方在关闭连接之前发送完所有数据，并确认对方已经接收到所有数据。

3. **有序关闭**：四次挥手允许一方在另一方准备好关闭连接之前，先发送FIN来关闭其发送方向的连接。接收方可以继续发送数据，直到它也准备好关闭连接。

4. **确认关闭**：由于TCP连接的全双工特性，每个方向的关闭都需要单独的确认。当一方收到FIN时，它知道对方已经没有数据要发送了，但它可能还有数据要发送给对方。因此，它发送ACK确认收到FIN，但在发送完自己的数据后才发送自己的FIN。

5. **防止延迟的ACK**：如果使用三次挥手关闭连接，一个延迟的ACK可能会被误解为一个新的连接请求，导致混乱。四次挥手通过确保每个方向的关闭都有单独的确认，避免了这个问题。

总结来说，三次握手是为了建立可靠的连接，而四次挥手是为了确保连接的有序、安全和可靠的关闭。

这种设计允许TCP协议在复杂的网络环境中提供稳定和可靠的服务。

## 一个例子

好的，让我们用一个接地气的例子来通俗解释TCP的三次握手和四次挥手：

### 三次握手（建立连接）

想象一下，你和你的朋友想要通过电话来一场远程的合作项目。

1. **第一次握手**：你打电话给你的朋友，说：“嘿，我们开始合作吧！”（SYN，表示你想要开始通信）
2. **第二次握手**：你的朋友回答说：“好的，我准备好了，我听到你了！”（SYN-ACK，表示你的朋友也准备好了，并且确认了你的请求）
3. **第三次握手**：你再次回应：“太好了，我也听到你了，我们可以开始了！”（ACK，确认你的朋友已经准备好，双方都确认了对方的接收和发送能力）

### 四次挥手（断开连接）

现在项目完成了，你和你的朋友需要结束通话。

1. **第一次挥手**：你对朋友说：“我觉得我们做完了，可以结束通话了。”（FIN，表示你这边已经没有更多要说的了）
2. **第二次挥手**：你的朋友回应：“好的，我明白了，我这边也说完了。”（ACK，确认你的结束请求，但可能还在整理最后的笔记）
3. **第三次挥手**：过了一会儿，你的朋友告诉你：“我也整理好了，我们可以正式结束了。”（FIN，表示你的朋友也准备好结束通话了）
4. **第四次挥手**：你最后确认：“好的，那我们结束吧，再见！”（ACK，确认通话正式结束）

### 为什么需要四次挥手？

- **全双工通信**：电话通话是双向的，就像TCP连接一样。你可以说话，你的朋友也可以说话。所以在结束通话时，每一方都需要明确表示他们已经说完了。
- **确保数据发送完毕**：在结束通话之前，你的朋友可能还在整理最后的一些想法，需要一点时间来确保所有信息都传达清楚了。
- **有序关闭**：确保双方都有机会完成他们的发言，并且确认对方已经接收到了所有的信息。

通过这个例子，我们可以看到TCP三次握手和四次挥手的过程，其实就像是两个人通过电话进行合作和结束通话的过程，确保了双方都能够清晰、有序地开始和结束他们的通信。

# 普通 http 连接的创建

普通的HTTP连接建立过程遵循的是TCP/IP模型中的TCP（传输控制协议）三次握手过程。

以下是详细的步骤：

### 1. 客户端发起连接请求（SYN）
- 用户在浏览器中输入URL或点击链接时，浏览器作为客户端，会向服务器发起一个TCP连接请求。
- 客户端随机生成一个序列号（seq），并将SYN标志位置为1，表示发起一个新连接。
- 客户端发送一个TCP段（SYN包）到服务器，其中包含客户端的IP地址和端口号。

### 2. 服务器响应连接请求（SYN-ACK）
- 服务器接收到客户端的连接请求后，如果同意建立连接，会发送一个响应。
- 服务器也会随机生成一个序列号（seq），并将SYN和ACK标志位都设置为1。
- 服务器发送一个TCP段（SYN-ACK包）回客户端，其中包含服务器的IP地址和端口号，以及确认号（ack），确认号是客户端序列号加1。

### 3. 客户端确认连接建立（ACK）
- 客户端接收到服务器的SYN-ACK包后，会进入连接建立的状态。
- 客户端会发送一个TCP段（ACK包），其中ACK标志位设置为1，序列号是客户端之前发送的序列号加1，确认号是服务器序列号加1。
- 至此，TCP连接建立完成，客户端和服务器可以开始发送数据。

### 4. HTTP请求
- 一旦TCP连接建立，客户端就可以发送HTTP请求了。
- 客户端构造HTTP请求行（如GET /index.html HTTP/1.1）和请求头（Headers），然后发送到服务器。

### 5. 服务器处理请求并响应
- 服务器接收到HTTP请求后，会根据请求的内容进行处理。
- 服务器构造HTTP响应，包括状态行（如HTTP/1.1 200 OK），响应头（Headers），以及可选的响应体（如请求的网页内容）。
- 服务器将HTTP响应发送回客户端。

### 6. 连接关闭
- 在HTTP/1.0中，默认情况下每个请求/响应完成后，连接就会关闭。如果需要保持连接，需要在HTTP头中设置`Connection: keep-alive`。
- 在HTTP/1.1中，连接默认是持久的，除非在HTTP头中明确设置`Connection: close`。

### 注意：
- 这个过程描述的是无状态的TCP连接建立过程，HTTP本身不维护连接状态。
- 在实际的网络环境中，还可能涉及到DNS解析（将域名转换为IP地址）、代理服务器、防火墙等其他因素。

通过这个过程，客户端和服务器之间建立了一条可靠的通信通道，可以开始进行HTTP数据的交换。

# http keepalive

## 是什么？

HTTP Keep-Alive 是一种技术，它允许在单个TCP连接上发送多个HTTP请求和响应，而不是为每个请求和响应创建一个新的连接。这项技术可以显著提高Web页面的加载速度，因为它减少了连接建立和关闭的开销。

以下是HTTP Keep-Alive的一些关键点：

1. **减少连接开销**：在没有Keep-Alive的情况下，每个HTTP请求都会创建一个新的TCP连接，这包括一个完整的三次握手过程。使用Keep-Alive，多个请求可以复用同一个TCP连接，从而减少了连接建立和关闭的开销。

2. **提高性能**：由于减少了连接建立和关闭的次数，Keep-Alive可以提高Web应用程序的性能，尤其是在高流量的环境下。

3. **配置选项**：Keep-Alive可以通过HTTP头信息中的`Connection`字段来配置。如果发送的请求中包含`Connection: keep-alive`，则客户端希望服务器保持连接打开状态，以便发送后续请求。

4. **超时和限制**：服务器可以设置Keep-Alive连接的超时时间，以及允许的最大连接数。如果超过这些限制，连接将被关闭。

5. **HTTP/1.1 默认启用**：在HTTP/1.1协议中，Keep-Alive是默认启用的。而在HTTP/1.0中，需要显式地在请求头中设置`Connection: keep-alive`来启用。

6. **安全性**：虽然Keep-Alive提高了性能，但它也可能引入一些安全问题，比如HTTP劫持。因此，在使用Keep-Alive时，还需要考虑使用HTTPS等安全措施。

7. **与HTTP/2的关系**：HTTP/2协议进一步改进了连接的复用，通过多路复用技术，允许在单个TCP连接上并行发送多个请求和响应，从而进一步提高了性能。

8. **浏览器和服务器支持**：大多数现代浏览器和服务器都支持Keep-Alive。服务器端的配置（如Apache、Nginx等）通常允许管理员根据需要调整Keep-Alive的相关设置。

## http keep-alive 的优缺点

HTTP Keep-Alive（持久连接）是一种网络协议特性，它允许多个HTTP请求和响应复用同一个TCP连接，从而提高网络传输效率。

以下是HTTP Keep-Alive的一些优缺点：

### 优点：

1. **减少连接建立和关闭的开销**：通过复用TCP连接，Keep-Alive减少了频繁建立和关闭连接的需要，从而节省了时间。

2. **提高性能**：由于减少了连接建立的时间，页面加载速度会更快，用户体验得到提升。

3. **降低服务器负载**：减少了连接的建立和关闭次数，可以减轻服务器处理连接请求的负担。

4. **减少网络延迟**：TCP连接的复用减少了每次通信所需的时间，因为不需要等待TCP三次握手。

5. **提高资源利用率**：由于TCP连接被多个请求共享，网络资源得到了更有效的利用。

6. **支持流水线技术**：在Keep-Alive连接上，可以实施流水线技术，即在等待一个响应的同时发送下一个请求，进一步提高效率。

### 缺点：

1. **资源占用**：Keep-Alive连接会持续占用服务器的资源，如果有很多空闲连接长时间不被关闭，可能会导致资源浪费。

2. **连接超时管理**：需要合理配置Keep-Alive超时时间，如果设置不当，可能会导致连接长时间空闲，浪费服务器资源。

3. **并发连接限制**：由于操作系统和硬件的限制，服务器能够同时维持的TCP连接数是有限的。如果Keep-Alive连接过多，可能会影响新连接的建立。

4. **不适合短连接**：对于偶尔的、一次性的HTTP请求，使用Keep-Alive可能不会带来太大的性能提升，反而可能增加管理上的复杂性。

5. **可能的内存泄漏**：如果应用程序没有正确管理Keep-Alive连接，可能会导致内存泄漏或其他资源管理问题。

6. **兼容性问题**：虽然现代浏览器和服务器都支持Keep-Alive，但在一些特殊情况下，可能需要考虑不同实现之间的兼容性问题。

7. **安全考虑**：持久连接可能会增加某些类型的安全风险，例如，如果攻击者能够利用一个持久连接来持续发送请求，可能会对服务器造成拒绝服务攻击（DoS）。

总的来说，HTTP Keep-Alive在提高网络通信效率和性能方面具有明显优势，但在实际应用中需要合理配置和管理，以避免潜在的资源浪费和性能问题。

# netty 实现完整的 keepalive 处理

在Netty中实现完整的HTTP Keep-Alive处理，需要考虑几个关键点，包括HTTP协议的版本、连接的配置、以及如何处理连接的生命周期。以下是如何在Netty中实现Keep-Alive的详细步骤：

重点考虑下面几个问题：

## 1）netty 如何实现 http 请求处理的 keep-alive

```java
boolean keepAlive = HttpUtil.isKeepAlive(request);
if (keepAlive) {
    // 如果是 keep-alive
    response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
    ctx.writeAndFlush(response);
} 
```

## 2) netty 如何正确关闭 keep-alive 对应的链接？

```java
boolean keepAlive = HttpUtil.isKeepAlive(request);
if (keepAlive) {
    // 否则，立刻关闭
    ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
} 
```

## 3）netty 如果正确处理一些可能没有正确关闭的链接？比如设置超时等

和常见的处理方法一样，我们可以设置对应的超时时间。

```java
ServerBootstrap bootstrap = new ServerBootstrap();
bootstrap.group(bossGroup, workerGroup)
        .channel(NioServerSocketChannel.class)
        .childHandler(new ChannelInitializer<SocketChannel>() {
            @Override
            protected void initChannel(SocketChannel ch) {
                ChannelPipeline pipeline = ch.pipeline();
                pipeline.addLast(new HttpServerCodec());
                pipeline.addLast(new HttpObjectAggregator(65536));
                // 设置读写超时
                pipeline.addLast(new ReadTimeoutHandler(30, TimeUnit.SECONDS));
                pipeline.addLast(new WriteTimeoutHandler(30, TimeUnit.SECONDS));
                // 设置空闲检测
                pipeline.addLast(new IdleStateHandler(60, 30, 0, TimeUnit.SECONDS));
                pipeline.addLast(new HttpServerHandler());
            }
        });
```

在Netty中，`ReadTimeoutHandler`、`WriteTimeoutHandler`和`IdleStateHandler`是用于处理超时和空闲检测的处理器（Handler），它们可以帮助开发者管理连接的生命周期，确保资源的有效利用并防止资源泄漏。

下面是这三个类的详细介绍：

1. **ReadTimeoutHandler**

   `ReadTimeoutHandler`用于设置读超时。
   
   当连接上的读取操作在指定的时间内没有数据到达时，会触发一个超时事件。
   
   这通常用于检测和处理半开连接（即一方已经关闭连接，而另一方仍然认为连接是打开的）。

   - 触发事件：
     - 当指定的时间内没有读取到任何数据时，会触发一个`ReadTimeoutException`。

2. **WriteTimeoutHandler**

   `WriteTimeoutHandler`用于设置写超时。
   
   当连接上的写操作在指定的时间内没有完成时，会触发一个超时事件。这通常用于确保数据能够在合理的时间内被发送出去。

   - 触发事件：
     - 当指定的时间内写操作没有完成时，会触发一个`WriteTimeoutException`。

3. **IdleStateHandler**

   `IdleStateHandler`用于检测连接的空闲状态。
   
   它可以设置读空闲、写空闲和所有空闲（既没有读也没有写）的超时时间。当连接在指定的时间内没有任何读或写活动时，可以触发相应的事件。

- 参数：

readerIdleTime：读空闲超时时间，单位为秒。如果设置为0，则表示不检测读空闲。

writerIdleTime：写空闲超时时间，单位为秒。如果设置为0，则表示不检测写空闲。

allIdleTime：所有空闲（既没有读也没有写）的超时时间，单位为秒。如果设置为0，则表示不检测所有空闲。

unit：时间单位，例如TimeUnit.SECONDS。

   - 触发事件：

     - 当连接在指定的时间内没有读活动时，会触发`IdleStateEvent.READER_IDLE`事件。

     - 当连接在指定的时间内没有写活动时，会触发`IdleStateEvent.WRITER_IDLE`事件。

     - 当连接在指定的时间内既没有读也没有写活动时，会触发`IdleStateEvent.ALL_IDLE`事件。

在Netty的`ChannelPipeline`中添加这些处理器，可以使得你的网络应用更加健壮和可靠。

通过设置合适的超时和空闲检测，可以有效地管理连接的生命周期，防止资源浪费，并提高应用的稳定性和性能。




# 小结

本节我们实现了文件的压缩处理，这个对于文件的传输性能提升比较大。

当然，压缩+解压本身也是对性能有损耗的。要结合具体的压缩比等考虑。

下一节，我们考虑实现一下 cors 的支持。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# chat

# netty 实现核心思路

## 1）netty 如何实现 http 请求处理的 keep-alive

Netty 是一个基于 Java 的异步事件驱动的网络应用框架，用于快速开发可扩展的高性能协议服务器和客户端。要实现 HTTP 请求处理中的 Keep-Alive，Netty 提供了一些内置的功能和处理器。以下是实现 HTTP Keep-Alive 的步骤：

1. **引入必要的依赖**：确保你的项目中包含 Netty 的相关依赖，例如 `netty-all` 或者根据需要引入特定模块的依赖。

2. **编写处理器类**：实现一个简单的 `HttpServerHandler` 来处理 HTTP 请求。

3. **配置管道**：在 Netty 的 `ChannelInitializer` 中配置管道（pipeline），添加 HTTP 服务器编解码器和自定义处理器。

4. **处理 Keep-Alive 逻辑**：在自定义处理器中根据 HTTP 请求头中的 `Connection` 字段来决定是否保持连接。

以下是一个示例代码，演示如何在 Netty 中实现 HTTP 请求处理的 Keep-Alive：

### 示例代码

```java
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.*;

public class HttpServer {

    private final int port;

    public HttpServer(int port) {
        this.port = port;
    }

    public void start() throws InterruptedException {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ChannelPipeline pipeline = ch.pipeline();
                            pipeline.addLast(new HttpServerCodec());
                            pipeline.addLast(new HttpObjectAggregator(65536));
                            pipeline.addLast(new HttpServerHandler());
                        }
                    });

            ChannelFuture future = bootstrap.bind(port).sync();
            System.out.println("HTTP server started on port " + port);
            future.channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        int port = 8080;
        new HttpServer(port).start();
    }
}

class HttpServerHandler extends SimpleChannelInboundHandler<FullHttpRequest> {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest request) {
        boolean keepAlive = HttpUtil.isKeepAlive(request);

        FullHttpResponse response = new DefaultFullHttpResponse(
                HttpVersion.HTTP_1_1, HttpResponseStatus.OK);
        response.content().writeBytes("Hello, World!".getBytes());

        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain; charset=UTF-8");
        response.headers().set(HttpHeaderNames.CONTENT_LENGTH, response.content().readableBytes());

        if (keepAlive) {
            response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
            ctx.writeAndFlush(response);
        } else {
            ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}
```

### 代码说明

1. **HttpServer** 类：
   - 创建了一个 Netty 服务器，监听指定的端口。
   - 配置了 `HttpServerCodec` 和 `HttpObjectAggregator` 处理器，这些处理器用于处理 HTTP 编码和聚合 HTTP 消息。
   - 添加了自定义的 `HttpServerHandler` 来处理 HTTP 请求。

2. **HttpServerHandler** 类：
   - 继承自 `SimpleChannelInboundHandler<FullHttpRequest>`，用于处理完整的 HTTP 请求。
   - 在 `channelRead0` 方法中检查请求的 `Connection` 头是否为 `keep-alive`。
   - 如果是 Keep-Alive 请求，则设置响应的 `Connection` 头为 `keep-alive` 并发送响应而不关闭连接。
   - 否则，发送响应并关闭连接。

通过这种方式，你可以实现 Netty 中的 HTTP Keep-Alive 功能，从而提高 HTTP 请求的处理效率。

## 2) netty 如何正确关闭 keep-alive 对应的链接？

在 Netty 中正确关闭 Keep-Alive 对应的连接涉及到几个步骤。通常情况下，HTTP 服务器会根据客户端的请求头和服务器的响应头来决定是否保持连接以及何时关闭连接。如果要正确关闭一个 Keep-Alive 的连接，可以采取以下步骤：

1. **检查请求头中的 `Connection` 字段**：客户端通过请求头中的 `Connection` 字段告知服务器是否希望保持连接。如果字段值为 `close`，服务器应关闭连接。

2. **设置响应头中的 `Connection` 字段**：如果服务器决定关闭连接，应在响应头中设置 `Connection` 字段为 `close`。

3. **调用关闭方法**：在发送完响应后，调用 Netty 提供的方法来关闭连接。

以下是一个示例代码，演示如何在 Netty 中正确关闭 Keep-Alive 的连接：

### 示例代码

```java
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.*;

public class HttpServer {

    private final int port;

    public HttpServer(int port) {
        this.port = port;
    }

    public void start() throws InterruptedException {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ChannelPipeline pipeline = ch.pipeline();
                            pipeline.addLast(new HttpServerCodec());
                            pipeline.addLast(new HttpObjectAggregator(65536));
                            pipeline.addLast(new HttpServerHandler());
                        }
                    });

            ChannelFuture future = bootstrap.bind(port).sync();
            System.out.println("HTTP server started on port " + port);
            future.channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        int port = 8080;
        new HttpServer(port).start();
    }
}

class HttpServerHandler extends SimpleChannelInboundHandler<FullHttpRequest> {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest request) {
        boolean keepAlive = HttpUtil.isKeepAlive(request);

        FullHttpResponse response = new DefaultFullHttpResponse(
                HttpVersion.HTTP_1_1, HttpResponseStatus.OK);
        response.content().writeBytes("Hello, World!".getBytes());

        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain; charset=UTF-8");
        response.headers().set(HttpHeaderNames.CONTENT_LENGTH, response.content().readableBytes());

        if (keepAlive) {
            response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
        } else {
            response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.CLOSE);
        }

        ChannelFuture future = ctx.writeAndFlush(response);
        
        // Close the connection if the request was not keep-alive
        if (!keepAlive) {
            future.addListener(ChannelFutureListener.CLOSE);
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}
```

### 代码说明

1. **HttpServerHandler** 类：
   - 在 `channelRead0` 方法中，通过 `HttpUtil.isKeepAlive(request)` 检查请求头是否要求保持连接。
   - 构建响应时，根据 `keepAlive` 变量设置响应头 `Connection` 为 `keep-alive` 或 `close`。
   - 发送响应后，如果 `keepAlive` 为 `false`，则添加 `ChannelFutureListener.CLOSE` 监听器，确保在响应发送完毕后关闭连接。

通过这种方式，Netty 可以正确处理 HTTP Keep-Alive 连接，并在需要时关闭连接。

这不仅符合 HTTP/1.1 协议规范，也能确保服务器资源得到合理使用。

## 3）netty 如果正确处理一些可能没有正确关闭的链接？比如设置超时等

在 Netty 中，为了正确处理可能没有正确关闭的连接，可以设置连接的超时时间。这样，当连接闲置一定时间后，会自动关闭，以防止资源泄露和无效连接占用系统资源。可以通过以下几个步骤实现：

1. **设置读取和写入超时**：可以使用 Netty 提供的 `ReadTimeoutHandler` 和 `WriteTimeoutHandler`。
2. **设置空闲超时**：可以使用 `IdleStateHandler` 来检测连接是否在指定时间内没有读写操作，从而关闭空闲连接。

### 示例代码

以下代码演示了如何在 Netty 中设置连接超时和处理空闲连接：

```java
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.*;
import io.netty.handler.timeout.IdleStateHandler;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;

import java.util.concurrent.TimeUnit;

public class HttpServer {

    private final int port;

    public HttpServer(int port) {
        this.port = port;
    }

    public void start() throws InterruptedException {
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ChannelPipeline pipeline = ch.pipeline();
                            pipeline.addLast(new HttpServerCodec());
                            pipeline.addLast(new HttpObjectAggregator(65536));
                            // 设置读写超时
                            pipeline.addLast(new ReadTimeoutHandler(30, TimeUnit.SECONDS));
                            pipeline.addLast(new WriteTimeoutHandler(30, TimeUnit.SECONDS));
                            // 设置空闲检测
                            pipeline.addLast(new IdleStateHandler(60, 30, 0, TimeUnit.SECONDS));
                            pipeline.addLast(new HttpServerHandler());
                        }
                    });

            ChannelFuture future = bootstrap.bind(port).sync();
            System.out.println("HTTP server started on port " + port);
            future.channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        int port = 8080;
        new HttpServer(port).start();
    }
}

class HttpServerHandler extends SimpleChannelInboundHandler<FullHttpRequest> {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest request) {
        boolean keepAlive = HttpUtil.isKeepAlive(request);

        FullHttpResponse response = new DefaultFullHttpResponse(
                HttpVersion.HTTP_1_1, HttpResponseStatus.OK);
        response.content().writeBytes("Hello, World!".getBytes());

        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain; charset=UTF-8");
        response.headers().set(HttpHeaderNames.CONTENT_LENGTH, response.content().readableBytes());

        if (keepAlive) {
            response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
        } else {
            response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.CLOSE);
        }

        ChannelFuture future = ctx.writeAndFlush(response);
        
        if (!keepAlive) {
            future.addListener(ChannelFutureListener.CLOSE);
        }
    }

    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
        if (evt instanceof IdleStateHandler) {
            // 处理空闲连接
            ctx.close();
        } else {
            super.userEventTriggered(ctx, evt);
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}
```

### 代码说明

1. **ReadTimeoutHandler 和 WriteTimeoutHandler**：在 `ChannelPipeline` 中添加了 `ReadTimeoutHandler` 和 `WriteTimeoutHandler`，分别设置了读取和写入的超时时间为 30 秒。如果在指定时间内没有读取或写入操作，连接将被关闭。

2. **IdleStateHandler**：在 `ChannelPipeline` 中添加了 `IdleStateHandler`，该处理器会监测读和写的空闲时间。在这个例子中，读空闲时间设置为 60 秒，写空闲时间设置为 30 秒。当连接在指定时间内没有读或写操作时，会触发 `userEventTriggered` 方法。

3. **HttpServerHandler**：
   - 在 `userEventTriggered` 方法中处理空闲事件。如果 `IdleStateHandler` 触发了空闲事件，则关闭连接。
   - 在 `channelRead0` 方法中，处理 HTTP 请求和响应。如果请求不需要保持连接，则在响应发送后关闭连接。

通过这种方式，可以确保在 Netty 中正确处理和关闭空闲连接，从而避免资源泄露和无效连接占用系统资源。


# 小结

keep-alive 利用链接复用的特性，大大缩短请求链接的创建时间，提升请求性能。

不过需要注意使用的场景。

下一节，我们考虑实现拓展一些压缩算法, 引入 zlib。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# 参考资料


* any list
{:toc}