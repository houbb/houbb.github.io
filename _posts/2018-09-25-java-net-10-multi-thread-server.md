---
layout: post
title:  Java Net-10-多线程服务器
date:  2018-09-25 09:13:42 +0800
categories: [Java]
tags: [java, io, thread, concurrency, sf]
published: true
excerpt: Java 网络编程之多线程服务器
---

# 多线程服务

由于Java的内置多线程功能，多线程服务器相当容易实现。但并不是所有的服务器设计都是一样的。

本文将介绍不同的服务器设计，并讨论它们的优缺点。

在Java中多线程服务器上的这种跟踪仍在进行中。

# 单线程

本文将展示如何在Java中实现单线程服务器。单线程服务器不是服务器的最佳设计，但是代码很好地说明了服务器的生命周期。多线程服务器上的以下文本将构建在这个代码模板上。

## 代码示例

下面是一个简单的单线程服务器:

- Server.java

```java
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;

public class SingleThreadServer implements Runnable {

    /**
     * 端口号
     */
    private final int serverPort;

    /**
     * 服务端 socket
     */
    private final ServerSocket serverSocket;

    /**
     * 服务是否终止
     */
    private volatile boolean isStop;

    /**
     * 构造器
     *
     * @param serverPort 服务端口号
     * @throws IOException io 异常
     */
    public SingleThreadServer(int serverPort) throws IOException {
        this.serverPort = serverPort;
        this.serverSocket = new ServerSocket(this.serverPort);
    }

    @Override
    public void run() {
        this.isStop = false;
        System.out.println("服务器启动，端口号: " + this.serverPort);

        while (!isStop) {
            Socket clientSocket;
            try {
                clientSocket = this.serverSocket.accept();
                System.out.println("新的 clientSocket: " + clientSocket);
                processClientRequest(clientSocket);
            } catch (IOException e) {
                if (isStop) {
                    System.out.println("Server Stopped.");
                    return;
                }
                throw new RuntimeException("Error accepting client connection", e);
            } catch (Exception e) {
                //log exception and go on to next request.
                e.printStackTrace();
            }
        }
    }

    /**
     * 处理客户端请求
     *
     * @param clientSocket 客户端 socket
     * @throws Exception if any
     */
    private void processClientRequest(Socket clientSocket) throws Exception {
        try (InputStream input = clientSocket.getInputStream();
             OutputStream output = clientSocket.getOutputStream()) {
            long time = System.currentTimeMillis();

            String responseDocument = "<html><body>" +
                    "Singlethreaded Server: " +
                    time +
                    "</body></html>";

            String responseHeader = "HTTP/1.1 200 OK\r\n" +
                    "Content-Type: text/html; charset=UTF-8\r\n" +
                    "Content-Length: " + responseDocument.length() +
                    "\r\n\r\n";
            output.write(responseHeader.getBytes());
            output.write(responseDocument.getBytes());
            System.out.println("Request processed: " + time);
        }
    }

    /**
     * 停止服务
     */
    public void stop() {
        try {
            this.isStop = true;
            this.serverSocket.close();
            System.out.println("服务器关闭");
        } catch (IOException e) {
            this.isStop = false;
            System.out.println("服务器关闭失败");
            e.printStackTrace();
        }
    }
}
```

- main()

```java
public static void main(String[] args) throws IOException {
    SingleThreadServer server = new SingleThreadServer(9000);
    new Thread(server).start();
}
```

- 测试

使用浏览器，打开 [http://localhost:9000/](http://localhost:9000/)。可以看到浏览器对应的内容。

但是有个问题，后天的日志却是执行 2 遍的?

```
服务器启动，端口号: 9000
新的 clientSocket: Socket[addr=/0:0:0:0:0:0:0:1,port=51554,localport=9000]
Request processed: 1537840937790
新的 clientSocket: Socket[addr=/0:0:0:0:0:0:0:1,port=51555,localport=9000]
Request processed: 1537840937792
```

## 线程循环

核心的服务器代码：

```java
while (!isStop) {
    Socket clientSocket;
    try {
        clientSocket = this.serverSocket.accept();
        System.out.println("新的 clientSocket: " + clientSocket);
        processClientRequest(clientSocket);
    } catch (IOException e) {
        if (isStop) {
            System.out.println("Server Stopped.");
            return;
        }
        throw new RuntimeException("Error accepting client connection", e);
    } catch (Exception e) {
        //log exception and go on to next request.
        e.printStackTrace();
    }
}
```

- 具体过程

简而言之，服务器所做的是:

1. 等待客户端请求

2. 处理客户端请求

3. 重复从1。

对于Java中实现的大多数服务器来说，这个循环几乎是相同的。

将单线程服务器与多线程服务器区分开来的是，单线程服务器在接受客户机连接的同一线程中处理传入的请求。多线程服务器将连接传递给处理请求的工作线程。

在接受客户机连接的同一线程中处理传入请求不是一个好主意。

客户机只能在服务器位于 `serverSocket.accept()` 方法调用中时连接到服务器。

侦听线程在 serverSocket.accept() 调用之外花费的时间越长，客户机被拒绝访问服务器的可能性就越大。

这就是多线程服务器将传入的连接传递给工作线程的原因，工作线程将处理请求。

这样，侦听线程在 serverSocket.accept() 调用之外花费的时间就越少。

# 多线程

单线程的例子中，当一个新的 clientSocket 到来时，是直接在当前线程中进行处理的，这会造成其他的 clientSocket 等待。

## WorkerRunnable 

我们建立一个线程类，单独处理每一个新的 socket 链接。

```java
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

public class WorkerRunnable implements Runnable {

    /**
     * 客户端套接字
     */
    private final Socket clientSocket;

    public WorkerRunnable(Socket clientSocket) {
        this.clientSocket = clientSocket;
    }

    @Override
    public void run() {
        try (InputStream input = clientSocket.getInputStream();
             OutputStream output = clientSocket.getOutputStream()) {
            long time = System.currentTimeMillis();

            String responseDocument = "<html><body>" +
                    "Multi Server: " + time + "</body></html>";

            String responseHeader = "HTTP/1.1 200 OK\r\n" +
                    "Content-Type: text/html; charset=UTF-8\r\n" +
                    "Content-Length: " + responseDocument.length() +
                    "\r\n\r\n";

            output.write(responseHeader.getBytes());
            output.write(responseDocument.getBytes());
            System.out.println("Request processed: " + time);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 服务端的调整

```java
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;

public class MultiThreadServer implements Runnable {

    /**
     * 端口号
     */
    private final int serverPort;

    /**
     * 服务端 socket
     */
    private final ServerSocket serverSocket;

    /**
     * 服务是否终止
     */
    private volatile boolean isStop;

    /**
     * 构造器
     *
     * @param serverPort 服务端口号
     * @throws IOException io 异常
     */
    public MultiThreadServer(int serverPort) throws IOException {
        this.serverPort = serverPort;
        this.serverSocket = new ServerSocket(this.serverPort);
    }

    @Override
    public void run() {
        this.isStop = false;
        System.out.println("服务器启动，端口号: " + this.serverPort);

        while (!isStop) {
            Socket clientSocket;
            try {
                clientSocket = this.serverSocket.accept();
                System.out.println("新开一个线程，单独处理 socket 信息 clientSocket: " + clientSocket);
                new Thread(new WorkerRunnable(clientSocket)).start();
            } catch (IOException e) {
                if (isStop) {
                    System.out.println("Server Stopped.");
                    return;
                }
                throw new RuntimeException("Error accepting client connection", e);
            }
        }
    }

    /**
     * 停止服务
     */
    public void stop() {
        try {
            this.isStop = true;
            this.serverSocket.close();
            System.out.println("服务器关闭");
        } catch (IOException e) {
            this.isStop = false;
            System.out.println("服务器关闭失败");
            e.printStackTrace();
        }
    }
}
```

- main()

服务的启动

```java
public static void main(String[] args) throws IOException {
    MultiThreadServer server = new MultiThreadServer(9000);
    new Thread(server).start();
}
```

## 优点

多线程服务器与单线程服务器相比的优点总结如下:

1. 花费在accept()调用之外的时间更少。

2. 长时间运行的客户机请求不会阻塞整个服务器

如前所述，线程在此方法调用中花费的时间越多，服务器的响应能力就越强。只有当侦听线程位于accept()调用内部时，客户机才能连接到服务器。否则客户端就会得到一个错误。

在单线程服务器中，长时间运行的请求可能使服务器长时间不响应。对于多线程服务器来说并非如此，除非长时间运行的请求占用所有CPU时间和/或网络带宽。

# 线程池

当然了，说到线程的执行，因为每次线程的资源分配都比较消耗资源。所以有线程池的概念。

多线程的其他代码不做改变，只需要 `WorkerRunnable` 在执行的时候，使用线程池即可。

## 优点

与多线程服务器相比，线程池服务器的优点是可以控制同时运行的线程的最大数量。这有一定的优势。

首先，如果请求需要大量的CPU时间、RAM或网络带宽，如果同时处理许多请求，这可能会减慢服务器的速度。例如，如果内存消耗导致服务器在磁盘内外交换内存，这将导致严重的性能损失。通过控制最大线程数，您可以将资源耗尽的风险降至最低，这一方面是由于处理请求所占用的内存有限，另一方面也是由于线程的限制和重用。每个线程也占用一定的内存，只是为了表示线程本身。

此外，并发执行多个请求会减慢所有处理的请求的速度。例如，如果您同时处理1 000个请求，每个请求需要1秒，那么所有请求将需要1 000秒来完成。如果你将请求排队，每次处理10个请求，前10个请求会在10秒后完成，后10个会在20秒后完成，等等。只有最后10个请求会在1000秒后完成。这为客户提供了更好的服务。

# 参考资料

http://tutorials.jenkov.com/java-multithreaded-servers/index.html

* any list
{:toc}