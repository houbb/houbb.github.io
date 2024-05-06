---
layout: post
title: web server apache tomcat11-31-websocket
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 前言

整理这个官方翻译的系列，原因是网上大部分的 tomcat 版本比较旧，此版本为 v11 最新的版本。

## 开源项目

> 从零手写实现 tomcat [minicat](https://github.com/houbb/minicat) 别称【嗅虎】心有猛虎，轻嗅蔷薇。

## 系列文章

[web server apache tomcat11-01-官方文档入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-01-intro)

[web server apache tomcat11-02-setup 启动](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-02-setup)

[web server apache tomcat11-03-deploy 如何部署](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-03-deploy)

[web server apache tomcat11-04-manager 如何管理？](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-04-manager)

[web server apache tomcat11-06-Host Manager App -- Text Interface](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-06-host-manager)

[web server apache tomcat11-07-Realm Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-07-relam)

[web server apache tomcat11-08-JNDI Resources](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-08-jndi)

[web server apache tomcat11-09-JNDI Datasource](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-09-jdbc-datasource)

[web server apache tomcat11-10-Class Loader](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-10-classloader-howto)

[web server apache tomcat11-11-Jasper 2 JSP Engine](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-11-jsps)

[web server apache tomcat11-12-SSL/TLS Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-12-ssl)

[web server apache tomcat11-13-SSI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-13-ssi)

[web server apache tomcat11-14-CGI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-14-cgi)

[web server apache tomcat11-15-proxy](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-15-proxy)

[web server apache tomcat11-16-mbean](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-16-mbean)

[web server apache tomcat11-17-default-servlet](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-17-default-servlet)

[web server apache tomcat11-18-clusting 集群](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-18-clusting)

[web server apache tomcat11-19-load balance 负载均衡](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-19-load-balance)

[web server apache tomcat11-20-connectors 连接器](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-20-connectors)

[web server apache tomcat11-21-monitor and management 监控与管理](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-21-monitor)

[web server apache tomcat11-22-logging 日志](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-22-logging)

[web server apache tomcat11-23-APR](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-23-apr)

[web server apache tomcat11-24-Virtual Hosting and Tomcat](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-24-virtual-host)

[web server apache tomcat11-25-Advanced IO and Tomcat](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-25-aio)

[web server apache tomcat11-26-maven jars](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-26-maven-jars)

[web server apache tomcat11-27-Security Considerations](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-27-security)

[web server apache tomcat11-28-Windows Service](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-28-windows-service)

[web server apache tomcat11-29-Windows Authentication](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-29-windows-auth)

[web server apache tomcat11-30-The Tomcat JDBC Connection Pool](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-30-tomcat-jdbc-pool)

[web server apache tomcat11-31-websocket](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-31-websocket)

[web server apache tomcat11-32-rewrite](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-32-rewrite)

[web server apache tomcat11-33-CDI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-33-cdi)

[web server apache tomcat11-34-Ahead of Time compilation support](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-34-aot)


# Tomcat WebSocket 技术文档

## 概述
Tomcat 支持 RFC 6455 所定义的 WebSocket。

## 应用开发
Tomcat 实现了由 Jakarta WebSocket 项目定义的 Jakarta WebSocket 2.1 API。

有几个示例应用程序演示了如何使用 WebSocket API。您需要查看客户端的 HTML 代码和服务器端的代码。

## Tomcat WebSocket 特定配置
Tomcat 提供了一些针对 WebSocket 的特定配置选项。预计这些选项将随着时间的推移被吸收到 WebSocket 规范中。

- 在阻塞模式下发送 WebSocket 消息时使用的写超时默认为 20000 毫秒（20 秒）。可以通过设置附加到 WebSocket 会话的用户属性集中的属性 org.apache.tomcat.websocket.BLOCKING_SEND_TIMEOUT 来更改此值。分配给此属性的值应该是一个 Long 类型，表示要使用的超时时间（以毫秒为单位）。对于无限超时，请使用 -1。
- 会话关闭超时默认为 30000 毫秒（30 秒）。可以通过设置附加到 WebSocket 会话的用户属性集中的属性 org.apache.tomcat.websocket.SESSION_CLOSE_TIMEOUT 来更改此值。分配给此属性的值应该是一个 Long 类型，表示要使用的超时时间（以毫秒为单位）。小于或等于零的值将被忽略。
- 除了 Jakarta WebSocket API 的 Session.setMaxIdleTimeout(long) 方法外，Tomcat 还提供了更多控制会话因缺乏活动而超时的时间。设置附加到 WebSocket 会话的用户属性集中的属性 org.apache.tomcat.websocket.READ_IDLE_TIMEOUT_MS 将在指定的毫秒数内未收到 WebSocket 消息时触发会话超时。设置属性 org.apache.tomcat.websocket.WRITE_IDLE_TIMEOUT_MS 将在指定的毫秒数内未发送 WebSocket 消息时触发会话超时。这些可以分别或共同使用，可以与或不使用 Session.setMaxIdleTimeout(long)。如果未指定相关属性，则将应用读取和/或写入空闲超时。
- 如果应用程序未为传入的二进制消息定义 MessageHandler.Partial，则必须缓冲任何传入的二进制消息，以便整个消息可以在单个调用注册的 MessageHandler.Whole 以二进制消息形式传递。二进制消息的默认缓冲区大小为 8192 字节。可以通过将 servlet 上下文初始化参数 org.apache.tomcat.websocket.binaryBufferSize 设置为所需的字节数来更改此值。
- 如果应用程序未为传入的文本消息定义 MessageHandler.Partial，则必须缓冲任何传入的文本消息，以便整个消息可以在单个调用注册的 MessageHandler.Whole 以文本消息形式传递。文本消息的默认缓冲区大小为 8192 字节。可以通过将 servlet 上下文初始化参数 org.apache.tomcat.websocket.textBufferSize 设置为所需的字节数来更改此值。
- 在使用 WebSocket 客户端连接到服务器端点时，建立连接期间的 IO 操作超时由所提供的 jakarta.websocket.ClientEndpointConfig 的 userProperties 控制。属性为 org.apache.tomcat.websocket.IO_TIMEOUT_MS，以毫秒为单位的字符串形式表示超时时间。默认值为 5000（5 秒）。
- 在使用 WebSocket 客户端连接到服务器端点时，客户端将遵循的 HTTP 重定向数量由所提供的 jakarta.websocket.ClientEndpointConfig 的 userProperties 控制。属性为 org.apache.tomcat.websocket.MAX_REDIRECTIONS。默认值为 20。通过将值配置为零，可以禁用重定向支持。
- 在使用 WebSocket 客户端连接到需要 BASIC 或 DIGEST 认证的服务器端点时，必须设置以下用户属性：

    - org.apache.tomcat.websocket.WS_AUTHENTICATION_USER_NAME
    - org.apache.tomcat.websocket.WS_AUTHENTICATION_PASSWORD

    可选地，可以仅在服务器认证挑战包含特定领域时，通过在可选用户属性中定义该领域，配置 WebSocket 客户端仅发送凭据：

    - org.apache.tomcat.websocket.WS_AUTHENTICATION_REALM

- 在通过要求 BASIC 或 DIGEST 认证的转发代理（也称为网关）连接到服务器端点时，必须设置以下用户属性：

    - org.apache.tomcat.websocket.WS_PROXY_AUTHENTICATION_USER_NAME
    - org.apache.tomcat.websocket.WS_PROXY_AUTHENTICATION_PASSWORD

    可选地，可以仅在服务器认证挑战包含特定领域时，通过在可选用户属性中定义该领域，配置 WebSocket 客户端仅发送凭据：

    - org.apache.tomcat.websocket.WS_PROXY_AUTHENTICATION_REALM


# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/web-socket-howto.html

* any list
{:toc}