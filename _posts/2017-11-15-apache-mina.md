---
layout: post
title:  Aapche Mina-netty 通讯前身
date:  2017-11-15 22:25:15 +0800
categories: [Net]
tags: [apache, net, framework, sh]
published: true
---


# Mina

[Apache MINA](http://mina.apache.org/) is a network application framework which helps users develop high performance and high scalability network applications easily. 

It provides an abstract event-driven asynchronous API over various transports such as TCP/IP and UDP/IP via Java NIO.


Apache MINA is often called:

- NIO framework library,

- client server framework library, ora networking socket library


Apache MINA comes with many subprojects :

- Asyncweb : An HTTP server build on top of MINA asynchronous framework

- FtpServer : A FTP server

- SSHd : A Java library supporting the SSH protocol

- Vysper : An XMPP server


> [mina 使用心得](http://www.iteye.com/topic/1109234)

> [mina user-guide](http://mina.apache.org/mina-project/userguide/user-guide-toc.html)

> [spring integration](http://jlcon.iteye.com/blog/369028)

> [spring integration-demo](http://blog.csdn.net/qazwsxpcm/article/details/73255909)

# Hello World

[完整代码示例](https://github.com/houbb/mina/tree/master/src/main/java/com/ryo/mina/helloworld)


## Prepare

- jar 引入

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.mina</groupId>
        <artifactId>mina-core</artifactId>
        <version>2.0.4</version>
    </dependency>

    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>jcl-over-slf4j</artifactId>
        <version>1.6.1</version>
    </dependency>

    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-nop</artifactId>
        <version>1.6.1</version>
    </dependency>
</dependencies>
```

## Server


- SimpleMinaServerHandler.java

服务器简单处理器

```java
package com.ryo.mina.helloworld;

import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IoSession;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * 2017/11/15
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class SimpleMinaServerHandler extends IoHandlerAdapter {

    private AtomicInteger count = new AtomicInteger(0);

    /**
     * 当一个客户端连接进入时
     */
    @Override
    public void sessionOpened(IoSession session) throws Exception {

        System.out.println("client connection : " + session.getRemoteAddress());

    }

    /**
     * 当一个客户端关闭时
     */
    @Override
    public void sessionClosed(IoSession session) throws Exception {

        System.out.println("client disconnection : " +session.getRemoteAddress() + " is Disconnection");

    }

    /**
     * 当接收到客户端的信息
     *
     * @param session
     * @param message
     * @throws Exception
     */
    @Override
    public void messageReceived(IoSession session, Object message)
            throws Exception {

        String str = (String)message;

        // 打印客户端
        System.out.println("receive client message : [ " + str +" ]");

        // 回写消息给客户端
        session.write(count.incrementAndGet());

    }
}
```

- MainServer.java

服务器代码

```java
package com.ryo.mina.helloworld;

import org.apache.mina.core.filterchain.DefaultIoFilterChainBuilder;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.apache.mina.filter.codec.textline.TextLineCodecFactory;
import org.apache.mina.transport.socket.SocketAcceptor;
import org.apache.mina.transport.socket.SocketSessionConfig;
import org.apache.mina.transport.socket.nio.NioSocketAcceptor;

import java.io.IOException;
import java.net.InetSocketAddress;

/**
 * 2017/11/15
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class MainServer {

    // 服务器端口
    private static final int SERVER_PORT = 8899;

    public static void main(String[] args) throws Exception {

        //创建一个非阻塞的Server端Socket，用NIO
        SocketAcceptor acceptor = new NioSocketAcceptor();

        // 定义每次接收数据大小
        SocketSessionConfig sessionConfig = acceptor.getSessionConfig();
        sessionConfig.setReadBufferSize(2048);

        //创建接受数据的过滤器
        DefaultIoFilterChainBuilder chain = acceptor.getFilterChain();

        //设定这个过滤器将一行一行（/r/n）的读取数据
        chain.addLast("myChain", new ProtocolCodecFilter(new TextLineCodecFactory()));

        //设定服务器端的消息处理器: 一个 SimpleMinaServerHandler 对象
        acceptor.setHandler(new SimpleMinaServerHandler());

        //绑定端口，启动服务器
        try {
            acceptor.bind(new InetSocketAddress(SERVER_PORT));
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println("Mina server is listing port:" + SERVER_PORT);

    }
}
```

运行服务器 `main()` 方法，日志如下：

```
Mina server is listing port:8899
```


## Client

- SimpleMinaClientHandler.java

客户端简单处理器

```java
package com.ryo.mina.helloworld;

import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IoSession;

/**
 * 2017/11/15
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class SimpleMinaClientHandler extends IoHandlerAdapter {

    /**
     * 当客户端接受到消息时
     */
    @Override
    public void messageReceived(IoSession session, Object message) throws Exception {

        Integer num = Integer.valueOf((String)message);

        if(num == null || num >10){
            session.close(true);
            return;
        }

        System.out.println("receive server num : [ " + num + " ]");

        Thread.sleep(1000);

        session.write("client received num is : " + num + ", request next num");

    }

    /**
     * 当一个客户端被关闭时
     */
    @Override
    public void sessionClosed(IoSession session) throws Exception {
        System.out.println("client disconnect");
    }

    /**
     * 当一个客户端连接进入时
     */
    @Override
    public void sessionOpened(IoSession session) throws Exception {

        System.out.println("create connection to server :" + session.getRemoteAddress());
        session.write("client started");
        session.write("Hello World!");
    }
}
```

- MainClient.java

客户端代码

```java
package com.ryo.mina.helloworld;

import org.apache.mina.core.filterchain.DefaultIoFilterChainBuilder;
import org.apache.mina.core.future.ConnectFuture;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.apache.mina.filter.codec.textline.TextLineCodecFactory;
import org.apache.mina.transport.socket.nio.NioSocketConnector;

import java.net.InetSocketAddress;

/**
 * 2017/11/15
 *
 * @author houbinbin
 * @version 1.0
 * @since 1.7
 */
public class MainClient {

    /**
     * 服务器ip
     */
    private static final String SERVER_IP = "127.0.0.1";

    /**
     * 服务器端口
     */
    private static final int SERVER_PORT = 8899;

    public static void main(String[] args) {

        //Create TCP/IP connection
        NioSocketConnector connector = new NioSocketConnector();

        //创建接受数据的过滤器
        DefaultIoFilterChainBuilder chain = connector.getFilterChain();

        //设定这个过滤器将一行一行(/r/n)的读取数据
        chain.addLast("myChain", new ProtocolCodecFilter(new TextLineCodecFactory()));

        //服务器的消息处理器：一个 SimpleMinaClientHandler 对象
        connector.setHandler(new SimpleMinaClientHandler());

        //set connect timeout
        connector.setConnectTimeoutMillis(30 * 1000);

        //连接到服务器：
        ConnectFuture cf = connector.connect(new InetSocketAddress(SERVER_IP, SERVER_PORT));

        cf.awaitUninterruptibly();

        cf.getSession().getCloseFuture().awaitUninterruptibly();

        connector.dispose();
    }
}
```

运行 `main()` 方法，启动客户端。客户端日志如下：

```
create connection to server :/127.0.0.1:8899
receive server num : [ 1 ]
receive server num : [ 2 ]
receive server num : [ 3 ]
receive server num : [ 4 ]
receive server num : [ 5 ]
receive server num : [ 6 ]
receive server num : [ 7 ]
receive server num : [ 8 ]
receive server num : [ 9 ]
receive server num : [ 10 ]
client disconnect

Process finished with exit code 0
```

此时，对应的服务端新增日志如下：

```
client connection : /127.0.0.1:64871
receive client message : [ client started ]
receive client message : [ Hello World! ]
receive client message : [ client received num is : 1, request next num ]
receive client message : [ client received num is : 2, request next num ]
receive client message : [ client received num is : 3, request next num ]
receive client message : [ client received num is : 4, request next num ]
receive client message : [ client received num is : 5, request next num ]
receive client message : [ client received num is : 6, request next num ]
receive client message : [ client received num is : 7, request next num ]
receive client message : [ client received num is : 8, request next num ]
receive client message : [ client received num is : 9, request next num ]
receive client message : [ client received num is : 10, request next num ]
client disconnection : /127.0.0.1:64871 is Disconnection
```


* any list
{:toc}

