---
layout: post
title:  Netty-09-socket bio 例子
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, sh]
published: false
---

# 学习的步骤

学习 netty 有些心浮气躁，效果一点也不好。

这次就从最简单的开始，一步步学习，大概步骤如下：

socket bio 调用=>socket bio+threadPool=》socket nio=>socket aio

## 使用 netty

netty bio=>netty nio

## rpc 雏形

本地调用=》rpc 反射

为了后期手写 rpc 做准备


# socket bio 简单的字符串例子

## client

```java
package com.github.houbb.netty.calc.socket.bio;

import java.io.IOException;
import java.io.OutputStream;
import java.net.Socket;

/**
 * @author binbin.hou
 * @date 2019/4/22
 * @since 0.0.1
 */
public class SocketBioClient {

    /**
     * 地址
     */
    private final String address;

    /**
     * 端口号
     */
    private final int port;

    public SocketBioClient(String address, int port) {
        this.address = address;
        this.port = port;
    }

    public void start() {
        try {
            //1. 根据地址信息创建 socket
            Socket socket = new Socket(this.address, this.port);
            // 设置超时时间
            socket.setSoTimeout(1000);

            // 客户端输入
            final String input = "hello socket client!";

            // 获取 socket 输出流，用于输出到客户端
            OutputStream outputStream = socket.getOutputStream();
            outputStream.write(input.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        new SocketBioClient("127.0.0.1", 8080).start();
    }
}
```

## server

```java
package com.github.houbb.netty.calc.socket.bio;

import java.io.IOException;
import java.io.InputStream;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * @author binbin.hou
 * @date 2019/4/22
 * @since 0.0.1
 */
public class SocketBioServer {

    /**
     * 端口号
     */
    private final int port;

    public SocketBioServer(int port) {
        this.port = port;
    }

    public void start() {
        try {
            // 创建 server socket
            ServerSocket serverSocket = new ServerSocket(port);

            // 服务一直启动
            while (true) {
                // 获取连接的 socket
                Socket socket = serverSocket.accept();
                System.out.println("client 连接成功...");

                // 声明 byte 数组，用于存放读取内容
                byte[] chars = new byte[1024];
                InputStream inputStream = socket.getInputStream();

                inputStream.read(chars);
                String string  = new String(chars);
                System.out.println("客户端内容： " + string);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        new SocketBioServer(8080).start();
    }

}
```

# 改进为循环调用

上面的例子非常的简单，无法进行交互。

下面我们添加一个可以进行客户端和服务器交互的例子。

## 客户端

```java
package com.github.houbb.netty.calc.socket.bio.in;

import java.io.*;
import java.net.Socket;

/**
 * bio read from sys.in client
 *
 * @author binbin.hou
 * @date 2019/4/23
 * @since 0.0.1
 */
public class SocketBioInClient {

    private final String address;

    private final int port;

    public SocketBioInClient(String address, int port) {
        this.address = address;
        this.port = port;
    }

    /**
     * 直接运行
     * 1. 监听固定的端口
     */
    public void start() {
        try {
            Socket socket = new Socket(address, port);
            //timeout 1s
            socket.setSoTimeout(1000);

            // read form console input
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(System.in));

            //2. 用于输出到服务端
            PrintWriter printWriter = new PrintWriter(socket.getOutputStream());

            // 用于获取服务器的反馈
            BufferedReader socketReader = new BufferedReader(new InputStreamReader(socket.getInputStream()));

            boolean flag = true;
            while (flag) {
                final String line = bufferedReader.readLine();
                System.out.println("Client input: " + line);

                // 立刻刷新输出流
                printWriter.println(line);
                printWriter.flush();

                if ("bye".equalsIgnoreCase(line)) {
                    flag = false;
                    System.out.println("------------------------");
                }

                final String serverEcho  = socketReader.readLine();
                System.out.println("Server: " + serverEcho);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        SocketBioInClient client = new SocketBioInClient("127.0.0.1", 8080);
        client.start();
    }
}
```

## 服务器

```java
package com.github.houbb.netty.calc.socket.bio.in;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * bio read from sys.in server
 *
 * @author binbin.hou
 * @date 2019/4/23
 * @since 0.0.1
 */
public class SocketBioInServer {

    private final int port;

    public SocketBioInServer(int port) {
        this.port = port;
    }

    public void start() {
        try {
            ServerSocket serverSocket = new ServerSocket(port);
            System.out.println("Server start listen on: " + port);
            Socket socket = serverSocket.accept();

            //1. 获取 socket 的输入内容
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(socket.getInputStream()));

            //2. 用于输出到客户端
            PrintWriter printWriter = new PrintWriter(socket.getOutputStream());

            while (true) {
                String line = bufferedReader.readLine();
                System.out.println("Received: " + line);

                // 立刻刷新输出流
                printWriter.println("Server echo " + line);
                printWriter.flush();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        SocketBioInServer socketBioInServer = new SocketBioInServer(8080);
        socketBioInServer.start();
    }
}
```

## 测试

- 启动

首先运行 server，然后启动 client。

- 测试

客户端输入 hello

```
hello
Client input: hello
Server: Server echo hello
```

服务器信息

```
Server start listen on: 8080
Received: hello
```

- 结束

客户端输入 bye

```
bye
Client input: bye
------------------------
Server: Server echo bye
```

服务器信息

```
Received: bye
java.net.SocketException: Connection reset
....
```


# 关闭资源修正版

之所以会有上面的异常，是因为写的时候，偷懒，没有吧响应的 socket 等资源释放掉。

下面给出完整的修订版本。

## 客户端

```java
package com.github.houbb.netty.calc.socket.bio.close;

import java.io.*;
import java.net.Socket;

/**
 * bio read from sys.in client
 *
 * @author binbin.hou
 * @date 2019/4/23
 * @since 0.0.1
 */
public class SocketBioCloseClient {

    private final String address;

    private final int port;

    public SocketBioCloseClient(String address, int port) {
        this.address = address;
        this.port = port;
    }

    /**
     * 直接运行
     * 1. 监听固定的端口
     */
    public void start() {
        Socket socket = null;
        BufferedReader bufferedReader = null;
        PrintWriter printWriter = null;
        BufferedReader socketReader = null;

        try {
            socket = new Socket(address, port);
            //timeout 1s
            socket.setSoTimeout(1000);

            // read form console input
            bufferedReader = new BufferedReader(new InputStreamReader(System.in));

            //2. 用于输出到服务端
            printWriter = new PrintWriter(socket.getOutputStream());

            // 用于获取服务器的反馈
            socketReader = new BufferedReader(new InputStreamReader(socket.getInputStream()));

            boolean flag = true;
            while (flag) {
                final String line = bufferedReader.readLine();
                System.out.println("Client input: " + line);

                // 立刻刷新输出流
                printWriter.println(line);
                printWriter.flush();

                if ("bye".equalsIgnoreCase(line)) {
                    flag = false;
                    System.out.println("------------------------");
                }

                final String serverEcho = socketReader.readLine();
                System.out.println("Server: " + serverEcho);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            close(socketReader);
            close(printWriter);
            close(bufferedReader);
            close(socket);
        }
    }

    /**
     * 执行关闭
     * 1. 这里可以替换为 TWR
     * @param closeable 可关闭的
     */
    private void close(final Closeable closeable) {
        if(closeable != null) {
            try {
                closeable.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        SocketBioCloseClient client = new SocketBioCloseClient("127.0.0.1", 8080);
        client.start();
    }
}
```

## 服务器

```java
package com.github.houbb.netty.calc.socket.bio.close;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * bio read from sys.in server
 *
 * @author binbin.hou
 * @date 2019/4/23
 * @since 0.0.1
 */
public class SocketBioCloseServer {

    private final int port;

    public SocketBioCloseServer(int port) {
        this.port = port;
    }

    public void start() {
        ServerSocket serverSocket = null;
        BufferedReader bufferedReader = null;
        PrintWriter printWriter = null;

        try {
            serverSocket = new ServerSocket(port);
            System.out.println("Server start listen on: " + port);
            Socket socket = serverSocket.accept();

            //1. 获取 socket 的输入内容
            bufferedReader = new BufferedReader(new InputStreamReader(socket.getInputStream()));

            //2. 用于输出到客户端
            printWriter = new PrintWriter(socket.getOutputStream());

            while (true) {
                String line = bufferedReader.readLine();
                System.out.println("Received: " + line);

                // 立刻刷新输出流
                printWriter.println("Server echo " + line);
                printWriter.flush();

                // 需要中断跳出，不然会一直循环
                if("bye".equalsIgnoreCase(line)) {
                    break;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            close(printWriter);
            close(bufferedReader);
            close(serverSocket);
        }
    }

    /**
     * 执行关闭
     * 1. 这里可以替换为 TWR
     * @param closeable 可关闭的
     */
    private void close(final Closeable closeable) {
        if(closeable != null) {
            try {
                closeable.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        SocketBioCloseServer socketBioInServer = new SocketBioCloseServer(8080);
        socketBioInServer.start();
    }
}
```

## 测试

- 启动

启动服务端+客户端

- 客户端

输入

```
qq
Client input: qq
Server: Server echo qq
bye
Client input: bye
------------------------
Server: Server echo bye
```

- 服务器对应输出

```
Server start listen on: 8080
Received: qq
Received: bye
```

# 进一步思考

## 现象

如果我们打开多个客户端，后面打开的客户端并不会得到反馈。

只会得到一个超时的异常。

```
qq
Client input: qq
java.net.SocketTimeoutException: Read timed out
	at java.net.SocketInputStream.socketRead0(Native Method)
	at java.net.SocketInputStream.socketRead(SocketInputStream.java:116)
	at java.net.SocketInputStream.read(SocketInputStream.java:171)
	at java.net.SocketInputStream.read(SocketInputStream.java:141)
	at sun.nio.cs.StreamDecoder.readBytes(StreamDecoder.java:284)
	at sun.nio.cs.StreamDecoder.implRead(StreamDecoder.java:326)
	at sun.nio.cs.StreamDecoder.read(StreamDecoder.java:178)
	at java.io.InputStreamReader.read(InputStreamReader.java:184)
	at java.io.BufferedReader.fill(BufferedReader.java:161)
	at java.io.BufferedReader.readLine(BufferedReader.java:324)
	at java.io.BufferedReader.readLine(BufferedReader.java:389)
	at com.github.houbb.netty.calc.socket.bio.in.SocketBioInClient.start(SocketBioInClient.java:57)
	at com.github.houbb.netty.calc.socket.bio.in.SocketBioInClient.main(SocketBioInClient.java:67)
```

## 原因分析

因为前一个 client 占用了唯一的服务端，后面的 client 并不能获取 server 端的反馈。

## 问题的解决

一个最简单的方式就是，我们为每一个客户端，都创建一个对应的 server。

这样就解决了客户端被阻塞的问题。

我们参考下一节的内容。

# 拓展阅读

## 流的关闭顺序

[流的关闭顺序](https://houbb.github.io/2017/11/16/netty-11-io-close-order-11)

## Connection reset 异常

这里遇到了一个异常。按照常理，我们应该忽略这个内容，但是这里恰恰是我们可以学习到知识的地方。

[socket connection reset 异常详解](https://houbb.github.io/2017/11/16/netty-10-socket-connection-reset-10)

# 参考资料

[java BIO实例——ServerSocket、Socket编程](https://blog.csdn.net/liuxiao723846/article/details/50457647)

* any list
{:toc}

