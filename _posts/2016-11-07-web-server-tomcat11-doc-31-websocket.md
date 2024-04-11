---
layout: post
title: web server apache tomcat11-31-websocket
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

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