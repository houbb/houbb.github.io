---
layout: post
title:  Netty-09-计算的例子
date:  2017-11-16 19:23:06 +0800
categories: [Netty]
tags: [netty, java, io, sh]
published: true
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

....


# 改进为线程池



# 本地调用

## 接口 

```java
package com.github.houbb.netty.calc.api;

/**
 * 计算接口
 * @author binbin.hou
 * @date 2019/4/22
 * @since 0.0.1
 */
public interface ICalc {

    /**
     * 将两个元素添加起来
     * @param first 第一个元素
     * @param second 第二个元素
     * @return 累计的结果
     */
    int add(int first, int second);

}
```

## 本地调用

```java
package com.github.houbb.netty.calc.local;

import com.github.houbb.netty.calc.api.ICalc;

/**
 * 本地实现
 * @author binbin.hou
 * @date 2019/4/22
 * @since 0.0.1
 */
public class LocalCalc implements ICalc {

    @Override
    public int add(int first, int second) {
        return first+second;
    }

    public static void main(String[] args) {
        ICalc calc = new LocalCalc();
        System.out.println(calc.add(10, 20));
    }

}
```


# 参考资料


* any list
{:toc}

