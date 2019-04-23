---
layout: post
title:  Netty-09-socket bio thread 多线程版本
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, thread, sh]
published: true
---

# 多线程版本

为了解决只有一个客户端能连接的问题，我们推出多线程版本。

客户端的代码保持不变。

下面只展示服务端代码。

# 服务端

## 多线程版本

```java
package com.github.houbb.netty.calc.socket.bio.thread;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

/**
 * 多线程版本
 * @author binbin.hou
 * @date 2019/4/23
 * @since 0.0.1
 */
public class SocketBioServerThread extends Thread {

    private final Socket socket;

    public SocketBioServerThread(Socket socket) {
        this.socket = socket;
    }

    @Override
    public void run() {
        BufferedReader bufferedReader = null;
        PrintWriter printWriter = null;

        try {
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

    public static void main(String[] args) throws IOException {
        // 运行当前 servaer
        ServerSocket serverSocket = new ServerSocket(8080);
        System.out.println("Server start listen on: " + 8080);

        // 循环监听新的客户端连接
        while(true) {
            Socket socket = serverSocket.accept();
            System.out.println("Server new client accept.,.");

            Thread thread = new SocketBioServerThread(socket);
            thread.start();
        }
    }

}
```

## 测试

- 启动

启动服务端

启动两个客户端

- 第一个 client 

输入

```
one
Client input: one
Server: Server echo one
```

- 第二个 client 

输入

```
one
Client input: one
Server: Server echo one
two
Client input: two
Server: Server echo two
```

- 服务端日志

```
Server new client accept.,.
Received: one
Server new client accept.,.
Received: one
Received: two
```

# 线程池版本

提到线程，不免让人想起了线程池。

jdk 已经为我们提供了丰富的线程池，我们此处选择一个作为例子即可。

所有代码不变，只修改创建部分代码

```java
public static void main(String[] args) throws IOException {
    // 创建线程池
    ExecutorService executorService = Executors.newFixedThreadPool(60);
    
    // 运行当前 servaer
    ServerSocket serverSocket = new ServerSocket(8080);
    System.out.println("Server start listen on: " + 8080);
    // 循环监听新的客户端连接
    while(true) {
        Socket socket = serverSocket.accept();
        System.out.println("Server new client accept.,.");
        executorService.execute(new SocketBioServerThreadPool(socket));
    }
}
```

# 个人总结

这种基于线程的版本虽然看起来解决了多客户端的问题，但是每一个客户端都创建了一个对应的线程，性能消耗是非常严重的。

我们后续将学习 NIO 的方式。

线程和线程池是一种很容易想到的提升速度的方式。

# 参考资料

[java BIO实例——ServerSocket、Socket编程](https://blog.csdn.net/liuxiao723846/article/details/50457647)

* any list
{:toc}

