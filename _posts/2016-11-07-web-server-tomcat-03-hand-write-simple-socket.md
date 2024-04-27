---
layout: post
title: 从零手写实现 tomcat-03-基本的 socket 实现
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 创作缘由

平时使用 tomcat 等 web 服务器不可谓不多，但是一直一知半解。

于是想着自己实现一个简单版本，学习一下 tomcat 的精髓。

# 系列教程

[从零手写实现 apache Tomcat-01-入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat-02-hand-write-overview)

[从零手写实现 apache Tomcat-02-web.xml 入门详细介绍](https://houbb.github.io/2016/11/07/web-server-tomcat-02-hand-write-web-xml)

[从零手写实现 tomcat-03-基本的 socket 实现](https://houbb.github.io/2016/11/07/web-server-tomcat-03-hand-write-simple-socket)

[从零手写实现 tomcat-04-请求和响应的抽象](https://houbb.github.io/2016/11/07/web-server-tomcat-04-hand-write-request-and-resp)

[从零手写实现 tomcat-05-servlet 处理支持](https://houbb.github.io/2016/11/07/web-server-tomcat-05-hand-write-servlet-web-xml)

[从零手写实现 tomcat-06-servlet bio/thread/nio/netty 池化处理](https://houbb.github.io/2016/11/07/web-server-tomcat-06-hand-write-thread-pool)

[从零手写实现 tomcat-07-war 如何解析处理三方的 war 包？](https://houbb.github.io/2016/11/07/web-server-tomcat-07-hand-write-war)

[从零手写实现 tomcat-08-tomcat 如何与 springboot 集成？](https://houbb.github.io/2016/11/07/web-server-tomcat-08-hand-write-embed)

[从零手写实现 tomcat-09-servlet 处理类](https://houbb.github.io/2016/11/07/web-server-tomcat-09-hand-write-servlet)

[从零手写实现 tomcat-10-static resource 静态资源文件](https://houbb.github.io/2016/11/07/web-server-tomcat-10-hand-write-static-resource)

[从零手写实现 tomcat-11-filter 过滤器](https://houbb.github.io/2016/11/07/web-server-tomcat-11-hand-write-filter)

[从零手写实现 tomcat-12-listener 监听器](https://houbb.github.io/2016/11/07/web-server-tomcat-12-hand-write-listener)

# 整体思路

我们通过 socket 套接字，实现最简单的服务监听。

然后直接输出一个固定的响应到页面。

## 套接字是个啥？

Java套接字（Socket）可以想象成一个网络通信的“管道”。就像你用水管道把水从一个地方输送到另一个地方，Java套接字则是用来在网络中传输数据的。

它允许你的Java程序和网络中的其他程序进行通信，无论是在同一台机器上还是在世界的另一端。

在Java中，套接字主要分为两大类：

1. **服务器套接字（ServerSocket）**：它的作用是监听网络上的连接请求。你可以把它想象成一个电话总机，它不主动打给别人，而是等着别人打进来。当有请求进来时，服务器套接字就会创建一个新的通信“管道”（也就是另一个套接字），专门用来和请求者进行数据交换。

2. **客户端套接字（Socket）**：它的作用是主动去连接服务器套接字。就像你用电话拨打别人一样，客户端套接字会指定一个服务器的地址和端口，然后尝试建立连接。一旦连接成功，它也可以创建一个通信“管道”来发送和接收数据。

## 和 tomcat 有啥关系？

Tomcat作为一个Web服务器，需要和大量的客户端进行通信，比如浏览器。当浏览器请求一个网页时，Tomcat需要接收这个请求，并返回相应的网页数据。这个过程就需要用到Java套接字：

- **监听连接**：Tomcat使用`ServerSocket`来监听指定端口上的HTTP请求。当浏览器发送请求时，Tomcat的`ServerSocket`就会接受这个请求，并创建一个新的套接字来处理它。

- **数据交换**：一旦连接建立，Tomcat就会通过这个套接字和浏览器进行数据交换。浏览器通过这个“管道”发送请求，Tomcat接收请求后，处理它，并把响应数据通过同一个“管道”发送回浏览器。

- **多线程处理**：由于可能有成千上万的客户端同时请求，Tomcat会为每个连接创建一个新的线程，这样每个请求就可以并行处理，而不会互相干扰。

简而言之，Java套接字是Tomcat实现网络通信的核心，它允许Tomcat接收客户端的请求，并发送响应，从而实现Web服务的功能。

# v1-基本代码

## 核心实现

```java
package com.github.houbb.minicat.bs;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.exception.MiniCatException;

import java.io.IOException;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @author 老马啸西风
 * @since 0.1.0
 */
public class MiniCatBootstrap {

    private static final Log logger = LogFactory.getLog(MiniCatBootstrap.class);

    /**
     * 启动端口号
     */
    private final int port;

    public MiniCatBootstrap(int port) {
        this.port = port;
    }

    public MiniCatBootstrap() {
        this(8080);
    }

    public void start() {
        logger.info("[MiniCat] start listen on port {}", port);
        logger.info("[MiniCat] visit url http://{}:{}", "127.0.0.1", port);

        try {
            ServerSocket serverSocket = new ServerSocket(port);

            while(true){
                Socket socket = serverSocket.accept();
                OutputStream outputStream = socket.getOutputStream();
                outputStream.write("Hello miniCat！".getBytes());
                socket.close();
            }

        } catch (IOException e) {
            logger.error("[MiniCat] meet ex", e);
            throw new MiniCatException(e);
        }
    }

}
```

## 启动测试

```java
MiniCatBootstrap bootstrap = new MiniCatBootstrap();
bootstrap.start();
```

日志：

```
[INFO] [2024-04-01 16:55:56.705] [main] [c.g.h.m.b.MiniCatBootstrap.start] - [MiniCat] start listen on port 8080
[INFO] [2024-04-01 16:55:56.705] [main] [c.g.h.m.b.MiniCatBootstrap.start] - [MiniCat] visit url http://127.0.0.1:8080
```

我们浏览器访问 [http://127.0.0.1:8080](http://127.0.0.1:8080)，却报错了

```
该网页无法正常运作127.0.0.1 发送的响应无效。
ERR_INVALID_HTTP_RESPONSE
```

## 为什么会报错呢？

在这个 MiniCatBootstrap 类中，服务器接收到请求后，直接向客户端发送了 "Hello miniCat！" 字符串。

然而，HTTP 协议规定了一定的格式要求，而 "Hello miniCat！" 并不符合这些格式要求，因此客户端无法正确解析这个响应，导致出现 "ERR_INVALID_HTTP_RESPONSE" 错误。

要修复这个问题，你需要修改 MiniCatBootstrap 类，以便生成符合 HTTP 格式的响应。

例如，你可以将 "Hello miniCat！" 包装在一个合法的 HTTP 响应中，如下所示：

```java
String response = "HTTP/1.1 200 OK\r\n" +
                  "Content-Type: text/plain\r\n" +
                  "\r\n" +
                  "Hello miniCat！";

outputStream.write(response.getBytes());
```

这个响应包括了 HTTP 状态行（"HTTP/1.1 200 OK"）、Content-Type 头部（"Content-Type: text/plain"）和一个空行（"\r\n"），然后是 "Hello miniCat！" 字符串。

这样生成的响应就符合了 HTTP 协议的要求，客户端应该能够正确解析它。

## 代码调整

我们把原来的原始字符串调整下：

```java
outputStream.write(InnerHttpUtil.httpResp("Hello miniCat!").getBytes());
```

工具类如下：

```java
    /**
     * 符合 http 标准的字符串
     * @param rawText 原始文本
     * @return 结果
     */
    public static String httpResp(String rawText) {
        String format = "HTTP/1.1 200 OK\r\n" +
                "Content-Type: text/plain\r\n" +
                "\r\n" +
                "%s";

        return String.format(format, rawText);
    }
```

再次访问，就一切都正常了。


# v2-代码优化+支持stop 

上面的方法不支持 stop，这有点不够优雅。

## 代码调整

调整后的代码实现如下：

```java
package com.github.houbb.minicat.bs;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.exception.MiniCatException;
import com.github.houbb.minicat.util.InnerHttpUtil;

import java.io.IOException;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @author 老马啸西风
 * @since 0.1.0
 */
public class MiniCatBootstrap {

    private static final Log logger = LogFactory.getLog(MiniCatBootstrap.class);

    /**
     * 启动端口号
     */
    private final int port;

    /**
     * 是否运行的标识
     */
    private volatile boolean runningFlag = false;

    /**
     * 服务端 socket
     */
    private ServerSocket serverSocket;

    public MiniCatBootstrap(int port) {
        this.port = port;
    }

    public MiniCatBootstrap() {
        this(8080);
    }

    /**
     * 服务的启动
     */
    public synchronized void start() {
        if(runningFlag) {
            logger.warn("[MiniCat] server is already start!");
            return;
        }

        logger.info("[MiniCat] start listen on port {}", port);
        logger.info("[MiniCat] visit url http://{}:{}", "127.0.0.1", port);

        try {
            this.serverSocket = new ServerSocket(port);
            runningFlag = true;

            while(runningFlag){
                Socket socket = serverSocket.accept();
                OutputStream outputStream = socket.getOutputStream();
                outputStream.write(InnerHttpUtil.httpResp("Hello miniCat!").getBytes());
                socket.close();
            }

            logger.info("[MiniCat] end listen on port {}", port);
        } catch (IOException e) {
            logger.error("[MiniCat] start meet ex", e);
            throw new MiniCatException(e);
        }
    }

    /**
     * 服务的启动
     */
    public synchronized void stop() {
        if(!runningFlag) {
            logger.warn("[MiniCat] server is not start!");
            return;
        }

        try {
            if(this.serverSocket != null) {
                serverSocket.close();
            }
            this.runningFlag = false;

            logger.info("[MiniCat] stop listen on port {}", port);
        } catch (IOException e) {
            logger.error("[MiniCat] stop meet ex", e);
            throw new MiniCatException(e);
        }
    }

}
```

我们定义一个 runingFlag 变量标识，stop 之后就可以根据这个属性判断是否继续执行。

## 测试代码

我们预期服务启动 30S 之后，然后关闭。

代码如下：

```java
MiniCatBootstrap bootstrap = new MiniCatBootstrap();
bootstrap.start();

TimeUnit.SECONDS.sleep(30);
bootstrap.stop();
```

这里会按照我们预期执行吗？为什么？

## 测试结果

测试日志：

```
[DEBUG] [2024-04-01 17:23:55.012] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2024-04-01 17:23:55.014] [main] [c.g.h.m.b.MiniCatBootstrap.start] - [MiniCat] start listen on port 8080
[INFO] [2024-04-01 17:23:55.015] [main] [c.g.h.m.b.MiniCatBootstrap.start] - [MiniCat] visit url http://127.0.0.1:8080
```

我们等待很久，也并没有等到服务关闭。

### 为什么？

即使在修改后的代码中添加了 stop() 方法来停止服务器，但是 start() 方法仍然会在一个无限循环中监听连接请求，导致主线程被阻塞。

这是因为 start() 方法中的 while 循环会一直执行，直到 stop() 方法被调用将 runningFlag 设置为 false。

要解决这个问题，可以将服务器的监听逻辑放在一个单独的线程中执行，这样 start() 方法就可以立即返回，不会阻塞主线程。

# v3-解决主线程阻塞问题

## 思路

我们把主线程运行放到一个异步线程，不去阻塞主线存。

## 实现

```java
package com.github.houbb.minicat.bs;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.minicat.exception.MiniCatException;
import com.github.houbb.minicat.util.InnerHttpUtil;

import java.io.IOException;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @since 0.1.0
 * @author 老马啸西风
 */
public class MiniCatBootstrap {

    private static final Log logger = LogFactory.getLog(MiniCatBootstrap.class);

    /**
     * 启动端口号
     */
    private final int port;

    /**
     * 是否运行的标识
     */
    private volatile boolean runningFlag = false;

    /**
     * 服务端 socket
     */
    private ServerSocket serverSocket;

    public MiniCatBootstrap(int port) {
        this.port = port;
    }

    public MiniCatBootstrap() {
        this(8080);
    }

    public synchronized void start() {
        // 引入线程池
        Thread serverThread = new Thread(new Runnable() {
            @Override
            public void run() {
                startSync();
            }
        });

        // 启动
        serverThread.start();
    }

    /**
     * 服务的启动
     */
    public void startSync() {
        if(runningFlag) {
            logger.warn("[MiniCat] server is already start!");
            return;
        }

        logger.info("[MiniCat] start listen on port {}", port);
        logger.info("[MiniCat] visit url http://{}:{}", "127.0.0.1", port);

        try {
            this.serverSocket = new ServerSocket(port);
            runningFlag = true;

            while(runningFlag && !serverSocket.isClosed()){
                Socket socket = serverSocket.accept();
                OutputStream outputStream = socket.getOutputStream();
                outputStream.write(InnerHttpUtil.httpResp("Hello miniCat!").getBytes());
                socket.close();
            }

            logger.info("[MiniCat] end listen on port {}", port);
        } catch (IOException e) {
            logger.error("[MiniCat] start meet ex", e);
            throw new MiniCatException(e);
        }
    }

    /**
     * 服务的暂停
     */
    public void stop() {
        logger.info("[MiniCat] stop called!");

        if(!runningFlag) {
            logger.warn("[MiniCat] server is not start!");
            return;
        }

        try {
            if(this.serverSocket != null) {
                serverSocket.close();
            }
            this.runningFlag = false;

            logger.info("[MiniCat] stop listen on port {}", port);
        } catch (IOException e) {
            logger.error("[MiniCat] stop meet ex", e);
            throw new MiniCatException(e);
        }
    }

}
```

## 启动测试

```java
MiniCatBootstrap bootstrap = new MiniCatBootstrap();
bootstrap.start();

System.out.println("main START sleep");
TimeUnit.SECONDS.sleep(10);
System.out.println("main END sleep");

bootstrap.stop();
```

日志如下：

```
main START sleep
[INFO] [2024-04-02 09:03:41.604] [Thread-0] [c.g.h.m.b.MiniCatBootstrap.startSync] - [MiniCat] start listen on port 8080
[INFO] [2024-04-02 09:03:41.604] [Thread-0] [c.g.h.m.b.MiniCatBootstrap.startSync] - [MiniCat] visit url http://127.0.0.1:8080
main END sleep
[INFO] [2024-04-02 09:03:51.592] [main] [c.g.h.m.b.MiniCatBootstrap.stop] - [MiniCat] stop called!
[ERROR] [2024-04-02 09:03:51.592] [Thread-0] [c.g.h.m.b.MiniCatBootstrap.startSync] - [MiniCat] start meet ex
java.net.SocketException: socket closed
	at java.net.DualStackPlainSocketImpl.accept0(Native Method)
	at java.net.DualStackPlainSocketImpl.socketAccept(DualStackPlainSocketImpl.java:127)
	at java.net.AbstractPlainSocketImpl.accept(AbstractPlainSocketImpl.java:535)
	at java.net.PlainSocketImpl.accept(PlainSocketImpl.java:189)
	at java.net.ServerSocket.implAccept(ServerSocket.java:545)
	at java.net.ServerSocket.accept(ServerSocket.java:513)
	at com.github.houbb.minicat.bs.MiniCatBootstrap.startSync(MiniCatBootstrap.java:74)
	at com.github.houbb.minicat.bs.MiniCatBootstrap$1.run(MiniCatBootstrap.java:49)
	at java.lang.Thread.run(Thread.java:750)
Exception in thread "Thread-0" com.github.houbb.minicat.exception.MiniCatException: java.net.SocketException: socket closed
	at com.github.houbb.minicat.bs.MiniCatBootstrap.startSync(MiniCatBootstrap.java:83)
	at com.github.houbb.minicat.bs.MiniCatBootstrap$1.run(MiniCatBootstrap.java:49)
	at java.lang.Thread.run(Thread.java:750)
Caused by: java.net.SocketException: socket closed
	at java.net.DualStackPlainSocketImpl.accept0(Native Method)
	at java.net.DualStackPlainSocketImpl.socketAccept(DualStackPlainSocketImpl.java:127)
	at java.net.AbstractPlainSocketImpl.accept(AbstractPlainSocketImpl.java:535)
	at java.net.PlainSocketImpl.accept(PlainSocketImpl.java:189)
	at java.net.ServerSocket.implAccept(ServerSocket.java:545)
	at java.net.ServerSocket.accept(ServerSocket.java:513)
	at com.github.houbb.minicat.bs.MiniCatBootstrap.startSync(MiniCatBootstrap.java:74)
	... 2 more
[INFO] [2024-04-02 09:03:51.613] [main] [c.g.h.m.b.MiniCatBootstrap.stop] - [MiniCat] stop listen on port 8080

Process finished with exit code 0
```

已经可以正常的关闭。

# 开源地址

```
 /\_/\  
( o.o ) 
 > ^ <
```

mini-cat 是简易版本的 tomcat 实现。别称【嗅虎】(心有猛虎，轻嗅蔷薇。)

开源地址：[https://github.com/houbb/minicat](https://github.com/houbb/minicat)

# 参考资料

https://www.cnblogs.com/isdxh/p/14199711.html

* any list
{:toc}