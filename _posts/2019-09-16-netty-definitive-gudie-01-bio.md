---
layout: post
title: Netty 权威指南-01-BIO 案例
date:  2019-5-10 11:08:59 +0800
categories: [Netty]
tags: [netty, sh]
published: true
---

# BIO 编程

## Server

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * <p> BIO 服务端 </p>
 * @author houbinbin
 */
public class TimeServer {

    public static void main(String[] args) throws IOException {
        final int port = 8088;
        ServerSocket serverSocket = new ServerSocket(port);
        System.out.println("server started at port " + port);

        // 循环监听
        while (true) {
            Socket socket = serverSocket.accept();
            System.out.println("客户端连接成功");

            // 读取客户端的信息
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            System.out.println("Server Recevie: " + bufferedReader.readLine());

            // 读取客户端的信息
            PrintWriter printWriter = new PrintWriter(socket.getOutputStream(), true);
            String currentTime = System.currentTimeMillis()+"";
            printWriter.println(currentTime);
        }
    }

}
```

## client 

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/**
 * <p> BIO 客户端 </p>
 *
 * @author houbinbin
 */
public class TimeClient {

    public static void main(String[] args) throws IOException {
        final int port = 8088;
        try(Socket clientSocket = new Socket("127.0.0.1", port)) {
            System.out.println("Client started at port " + port);

            // 写入信息
            PrintWriter printWriter = new PrintWriter(clientSocket.getOutputStream(), true);
            printWriter.println("hello bio");

            // 读取反馈
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            System.out.println("client recevie: " + bufferedReader.readLine());
        }
    }

}
```

## 启动测试

- 启动服务端

```
server started at port 8088
```

- 启动客户端 

```
Client started at port 8088
client recevie: 1568643464491

Process finished with exit code 0
```

- 再次查看服务端日志

```
server started at port 8088
客户端连接成功
Server Recevie: hello bio
```

# 线程池版本

## BIO 的缺点

缺点其实非常明显，每次都要创建一个线程去处理。

比如我的实现是直接阻塞当前线程的，这当然非常的不友好。

可以使用线线程池的方式进行优化改进。

## 线程版本

```java
public class TimeThreadServer {

    public static void main(String[] args) throws IOException {
        final int port = 8088;
        ServerSocket serverSocket = new ServerSocket(port);
        System.out.println("server started at port " + port);

        // 循环监听
        while (true) {
            Socket socket = serverSocket.accept();
            System.out.println("客户端连接成功");

            new ServerHandler(socket).start();
        }
    }


    static class ServerHandler extends Thread {

        private final Socket socket;

        ServerHandler(Socket socket) {
            this.socket = socket;
        }

        @Override
        public void run() {
            try {
                // 读取客户端的信息
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                System.out.println("Server Recevie: " + bufferedReader.readLine());

                // 读取客户端的信息
                PrintWriter printWriter = new PrintWriter(socket.getOutputStream(), true);
                String currentTime = System.currentTimeMillis()+"";
                printWriter.println(currentTime);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

## 线程池版本

```java
public static void main(String[] args) throws IOException {
    final int port = 8088;
    ServerSocket serverSocket = new ServerSocket(port);
    System.out.println("server started at port " + port);
    ExecutorService executorService = Executors.newFixedThreadPool(2);
    // 循环监听
    while (true) {
        Socket socket = serverSocket.accept();
        System.out.println("客户端连接成功");
        // 线程池处理
        executorService.submit(new ServerHandler(socket));
    }
}
```

其他代码保持不变。

# 参考资料

《Netty 权威指南》

[TCP Socket](https://houbb.github.io/2018/09/23/java-net-03-tcp-socket)

* any list
{:toc}