---
layout: post
title:  从零手写实现 nginx-02-nginx 的核心能力
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---


# 前言

大家好，我是老马。很高兴遇到你。

我们希望实现最简单的 http 服务信息，可以处理静态文件。

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

# 基本实现

## 思路

基于 serverSocket 实现最基本的监听。

## 核心

```java
    public void start() {
        try {
            // 服务器监听的端口号
            int port = nginxConfig.getHttpServerListen();
            ServerSocket serverSocket = new ServerSocket(port);
            log.info("[Nginx4j] listen on port={}", port);

            while (true) {
                Socket socket = serverSocket.accept();
                log.info("[Nginx4j] Accepted connection from address={}", socket.getRemoteSocketAddress());
                handleClient(socket);
            }
        } catch (Exception e) {
            log.info("[Nginx4j] meet ex", e);

            throw new RuntimeException(e);
        }
    }
```

## socket 的处理

```java
private void handleClient(Socket socket) {
        try {
            // 基本信息
            InputStream input = socket.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(input));
            String header = reader.readLine();
            String[] parts = header.split(" ");
            String method = parts[0];
            String path = parts[1];
            String protocol = parts[2];

            // 根路径
            final String basicPath = nginxConfig.getHttpServerRoot();
            // 只处理GET请求
            if ("GET".equalsIgnoreCase(method)) {
                //root path
                if(StringUtil.isEmpty(path) || "/".equals(path)) {
                    log.info("[Nginx4j] current path={}, match index path", path);
                    byte[] fileContent = tryGetIndexContent();
                    sendResponse(socket, 200, "OK", fileContent);
                    return;
                }

                // other
                File file = new File(basicPath + path);
                if (file.exists()) {
                    byte[] fileContent = Files.readAllBytes(file.toPath());
                    sendResponse(socket, 200, "OK", fileContent);
                } else {
                    sendResponse(socket, 404, "Not Found", "File not found.".getBytes());
                }
            } else {
                sendResponse(socket, 405, "Method Not Allowed", "Method not allowed.".getBytes());
            }
        } catch (Exception e) {
            // 异常处理...
        }
    }
```

## 响应的处理

```java
private void sendResponse(Socket socket, int statusCode, String statusMessage, byte[] content) throws IOException {
        OutputStream output = socket.getOutputStream();
        PrintWriter writer = new PrintWriter(output, true);

        // 发送HTTP响应头
        writer.println("HTTP/1.1 " + statusCode + " " + statusMessage);
        writer.println("Content-Type: text/plain");
        writer.println("Content-Length: " + content.length);
        writer.println("Connection: close");
        writer.println();

        // 发送HTTP响应体
        output.write(content);
        output.flush();
    }
```

# 测试

# 快速开始

## maven 依赖

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>nginx4j</artifactId>
    <version>0.1.0</version>
</dependency>
```

## 启动测试

```java
Nginx4jBs.newInstance().init().start();
```

启动日志：

```
[DEBUG] [2024-05-24 23:40:37.573] [main] [c.g.h.l.i.c.LogFactory.setImplementation] - Logging initialized using 'class com.github.houbb.log.integration.adaptors.stdout.StdOutExImpl' adapter.
[INFO] [2024-05-24 23:40:37.576] [main] [c.g.h.n.s.s.NginxServerSocket.start] - [Nginx4j] listen on port=8080
```

页面访问：[http://127.0.0.1:8080](http://127.0.0.1:8080)

响应：

```
Welcome to nginx4j!
```

## 其他页面

访问 [http://localhost:8080/1.txt](http://localhost:8080/1.txt)

将返回对应的文件内容：

```
hello nginx4j!
```

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# 参考资料

https://nginx.org/en/

* any list
{:toc}