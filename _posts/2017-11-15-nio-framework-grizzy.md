---
layout: post
title:  NIO 框架 Grizzy
date:  2017-11-15 22:25:15 +0800
categories: [Net]
tags: [apache, net, framework, sh]
published: true
---


# Grizzy

用Java™编程语言编写可伸缩的服务器应用程序一直很困难。 

在Java New I / O API（NIO）出现之前，线程管理问题使服务器无法扩展到数千个用户。

[Grizzly NIO](https://javaee.github.io/grizzly/) 框架旨在帮助开发人员利用Java™NIO API。 

Grizzly的目标是帮助开发人员使用NIO构建可扩展且强大的服务器，并提供扩展的框架组件：Web框架（HTTP / S），WebSocket，Comet等等！

## 整体架构

![整体架构](https://javaee.github.io/grizzly/images/stack.png)

# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>org.glassfish.grizzly</groupId>
    <artifactId>grizzly-framework</artifactId>
    <version>2.4.0</version>
</dependency>
```

## 服务端

- EchoFilter.java

```java
import java.io.IOException;
import org.glassfish.grizzly.filterchain.BaseFilter;
import org.glassfish.grizzly.filterchain.FilterChain;
import org.glassfish.grizzly.filterchain.FilterChainContext;
import org.glassfish.grizzly.filterchain.NextAction;

/**
 * Implementation of {@link FilterChain} filter, which replies with the request
 * message.
 */
public class EchoFilter extends BaseFilter {

    /**
     * Handle just read operation, when some message has come and ready to be
     * processed.
     *
     * @param ctx Context of {@link FilterChainContext} processing
     * @return the next action
     * @throws java.io.IOException
     */
    @Override
    public NextAction handleRead(FilterChainContext ctx)
            throws IOException {
        // Peer address is used for non-connected UDP Connection :)
        final Object peerAddress = ctx.getAddress();

        final Object message = ctx.getMessage();

        ctx.write(peerAddress, message, null);

        return ctx.getStopAction();
    }
}
```

可以看得出来这里和 netty 的区别，此处并没有将消息当做一个参数独立处理。

设计中，这是一种衡量。

哪一种比较常用？比较容易记忆？

- EchoServer.java

```java
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.logging.Logger;
import org.glassfish.grizzly.filterchain.FilterChainBuilder;
import org.glassfish.grizzly.filterchain.TransportFilter;
import org.glassfish.grizzly.nio.transport.TCPNIOTransport;
import org.glassfish.grizzly.nio.transport.TCPNIOTransportBuilder;
import org.glassfish.grizzly.utils.StringFilter;

/**
 * Class initializes and starts the echo server, based on Grizzly 2.3
 */
public class EchoServer {
    private static final Logger logger = Logger.getLogger(EchoServer.class.getName());

    public static final String HOST = "localhost";
    public static final int PORT = 7777;

    public static void main(String[] args) throws IOException {
        // Create a FilterChain using FilterChainBuilder
        FilterChainBuilder filterChainBuilder = FilterChainBuilder.stateless();

        // Add TransportFilter, which is responsible
        // for reading and writing data to the connection
        filterChainBuilder.add(new TransportFilter());

        // StringFilter is responsible for Buffer <-> String conversion
        filterChainBuilder.add(new StringFilter(Charset.forName("UTF-8")));

        // EchoFilter is responsible for echoing received messages
        filterChainBuilder.add(new EchoFilter());

        // Create TCP transport
        final TCPNIOTransport transport =
                TCPNIOTransportBuilder.newInstance().build();

        transport.setProcessor(filterChainBuilder.build());
        try {
            // binding transport to start listen on certain host and port
            transport.bind(HOST, PORT);

            // start the transport
            transport.start();

            logger.info("Press any key to stop the server...");
            System.in.read();
        } finally {
            logger.info("Stopping transport...");
            // stop the transport
            transport.shutdownNow();

            logger.info("Stopped transport...");
        }
    }
}
```

这里和 netty 的区别，应该是 api 的区别，对于 netty 是 fluent 的模式。


## 客户端

- ClientFilter.java

```java
import java.io.IOException;
import org.glassfish.grizzly.filterchain.BaseFilter;
import org.glassfish.grizzly.filterchain.FilterChainContext;
import org.glassfish.grizzly.filterchain.NextAction;

/**
 * Client filter is responsible for redirecting server response to the standard output
 */
public class ClientFilter extends BaseFilter {
    /**
     * Handle just read operation, when some message has come and ready to be
     * processed.
     *
     * @param ctx Context of {@link FilterChainContext} processing
     * @return the next action
     * @throws java.io.IOException
     */
    @Override
    public NextAction handleRead(final FilterChainContext ctx) throws IOException {
        // We get String message from the context, because we rely prev. Filter in chain is StringFilter
        final String serverResponse = ctx.getMessage();
        System.out.println("Server echo: " + serverResponse);

        return ctx.getStopAction();
    }
}
```

- EchoClient.java

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.logging.Logger;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.glassfish.grizzly.Connection;
import org.glassfish.grizzly.Grizzly;
import org.glassfish.grizzly.filterchain.FilterChainBuilder;
import org.glassfish.grizzly.filterchain.TransportFilter;
import org.glassfish.grizzly.nio.transport.TCPNIOTransport;
import org.glassfish.grizzly.nio.transport.TCPNIOTransportBuilder;
import org.glassfish.grizzly.utils.StringFilter;

/**
 * The simple client, which sends a message to the echo server
 * and waits for response
 */
public class EchoClient {
    private static final Logger logger = Grizzly.logger(EchoClient.class);

    public static void main(String[] args) throws IOException,
            ExecutionException, InterruptedException, TimeoutException {

        Connection connection = null;

        // Create a FilterChain using FilterChainBuilder
        FilterChainBuilder filterChainBuilder = FilterChainBuilder.stateless();
        // Add TransportFilter, which is responsible
        // for reading and writing data to the connection
        filterChainBuilder.add(new TransportFilter());
        // StringFilter is responsible for Buffer <-> String conversion
        filterChainBuilder.add(new StringFilter(Charset.forName("UTF-8")));
        // ClientFilter is responsible for redirecting server responses to the standard output
        filterChainBuilder.add(new ClientFilter());

        // Create TCP transport
        final TCPNIOTransport transport =
                TCPNIOTransportBuilder.newInstance().build();
        transport.setProcessor(filterChainBuilder.build());

        try {
            // start the transport
            transport.start();

            // perform async. connect to the server
            Future<Connection> future = transport.connect(EchoServer.HOST,
                    EchoServer.PORT);
            // wait for connect operation to complete
            connection = future.get(10, TimeUnit.SECONDS);

            assert connection != null;

            System.out.println("Ready... (\"q\" to exit)");
            final BufferedReader inReader = new BufferedReader(new InputStreamReader(System.in));
            do {
                final String userInput = inReader.readLine();
                if (userInput == null || "q".equals(userInput)) {
                    break;
                }

                connection.write(userInput);
            } while (true);
        } finally {
            // close the client connection
            if (connection != null) {
                connection.close();
            }

            // stop the transport
            transport.shutdownNow();
        }
    }
}
```


# 整体感受

对于使用者而言,api 是一种很直观的感受。

入门的文档也是很直观的感受。

这里抛开性能不谈，感觉入门的案例还是设计的太复杂了。

# 拓展阅读

[Mina](https://houbb.github.io/2017/11/15/apache-mina)

[Netty 系列](https://houbb.github.io/2017/11/16/netty-00-overview-00)

# 参考资料

[grizzly 官方文档](https://javaee.github.io/grizzly/quickstart.html)

* any list
{:toc}

