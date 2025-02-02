---
layout: post
title: IM 即时通讯系统-04-前后端交互设计策略之 websocket 实现代码
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---

# chat

## 主要实现方式

在实现即时通讯（IM）系统的前后端交互时，**长轮询（Long Polling）、定时轮询（Polling）、SSE（Server-Sent Events）和 WebSocket（WS）** 是常见的通信模式，但它们各有适用场景和优缺点。

以下是对比分析及现代 IM 系统的典型技术选型：

---

### **1. 通信模式对比**
| 技术               | 协议      | 方向性       | 实时性        | 适用场景                          | 缺点                              |
|--------------------|-----------|--------------|--------------|----------------------------------|-----------------------------------|
| **定时轮询**        | HTTP      | 客户端主动拉取 | 低（延迟高） | 简单场景，兼容性要求高            | 资源浪费（频繁请求）、延迟不可控    |
| **长轮询**          | HTTP      | 客户端半主动  | 中（依赖超时） | 兼容老旧设备，短时实时需求        | 连接频繁重建，服务器并发压力大      |
| **SSE**            | HTTP      | 服务端单向推送 | 高（单向流）  | 服务端主动通知（如新闻推送）      | 仅支持单向通信，需浏览器兼容性      |
| **WebSocket**      | WS/WSS    | 全双工双向通信 | 高（实时）    | 即时聊天、实时协作、游戏          | 需协议升级，部分网络设备可能拦截    |


## 详细介绍一下 websocket

WebSocket 是一种网络通信协议，它提供了在客户端和服务器之间建立持久化的双向通信通道，使得客户端和服务器能够进行实时的数据交换。

与传统的 HTTP 请求/响应模型不同，WebSocket 允许服务器主动向客户端推送数据，不需要客户端轮询服务器。

### WebSocket 的工作原理

1. **建立连接**：
   - WebSocket 连接通过 HTTP 协议发起，并使用 HTTP 的 `Upgrade` 头部将协议从 HTTP 升级到 WebSocket。
   - 客户端发送 WebSocket 请求：客户端发送 HTTP 请求（通过 `Sec-WebSocket-Key` 头标识请求）。
   - 服务器响应确认：如果服务器支持 WebSocket，它会在响应中返回 `Sec-WebSocket-Accept` 头部，表示协议切换成功。

2. **数据传输**：
   - 一旦连接建立，客户端和服务器之间就可以通过 WebSocket 协议进行双向通信。数据可以以文本或二进制格式发送。
   - WebSocket 使用 **帧**（Frame）来封装数据，保证了数据的完整性和高效性。
   - 数据传输是全双工的，客户端和服务器可以同时发送和接收消息。

3. **关闭连接**：
   - 一方可以主动关闭连接，发送一个关闭帧，另一方响应关闭帧，最终关闭连接。
   - WebSocket 连接的关闭是通过发送和接收特定的帧来实现的。

### WebSocket 的特点

1. **持久化连接**：
   - 一旦建立连接，连接可以持续不断，直到某一方关闭连接。客户端和服务器之间不需要频繁地重新建立连接。

2. **双向通信**：
   - WebSocket 是全双工的，允许服务器主动向客户端发送数据，这使得它非常适合实时应用（如即时通讯、游戏、股票行情等）。

3. **低延迟**：
   - 由于 WebSocket 连接是持久化的，数据传输不需要通过传统的 HTTP 请求/响应模型，因此相比轮询或长轮询，WebSocket 可以显著减少延迟。

4. **高效**：
   - WebSocket 消息头非常小，相比 HTTP 请求的完整头部，WebSocket 的开销更小，因此传输效率更高。

5. **跨域支持**：
   - WebSocket 不受跨域请求的限制，因此可以在不同域之间建立连接，适合分布式系统的通信需求。

### WebSocket 与其他通信方式的对比

| 特性             | WebSocket             | HTTP 请求/响应   | 长轮询           |
|------------------|-----------------------|------------------|------------------|
| **连接方式**     | 双向持久化连接        | 单向请求响应     | 双向，但每次请求后断开 |
| **通信模式**     | 全双工                | 半双工           | 半双工           |
| **延迟**         | 低                    | 高               | 较高             |
| **适用场景**     | 实时消息，游戏，股票行情等 | 普通的请求响应   | 实时消息，实时通知等 |
| **效率**         | 高                    | 低               | 较低             |

### WebSocket 示例代码

#### 1. 后端（Spring Boot）WebSocket 实现

Spring Boot 提供了对 WebSocket 的支持，可以通过 `spring-websocket` 来集成 WebSocket。

**pom.xml** 添加依赖：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

**配置 WebSocket 端点**：
```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new MyWebSocketHandler(), "/chat")
                .addInterceptors(new HttpSessionHandshakeInterceptor())
                .setAllowedOrigins("*");
    }
}
```

**WebSocket 处理器**：
```java
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.handler.TextWebSocketHandler;

public class MyWebSocketHandler extends TextWebSocketHandler {

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            // Echo message back to client
            session.sendMessage(new TextMessage("Server: " + message.getPayload()));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

#### 2. 前端（Vue.js）WebSocket 实现

前端可以通过浏览器的 WebSocket API 来建立 WebSocket 连接。

```javascript
<template>
  <div>
    <h3>WebSocket Chat</h3>
    <input v-model="message" @keyup.enter="sendMessage" placeholder="Type a message" />
    <ul>
      <li v-for="msg in messages" :key="msg">{{ msg }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: '',
      messages: [],
      socket: null,
    };
  },
  mounted() {
    this.socket = new WebSocket('ws://localhost:8080/chat');
    this.socket.onopen = () => {
      console.log('WebSocket connection opened');
    };
    this.socket.onmessage = (event) => {
      this.messages.push(event.data);
    };
    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  },
  methods: {
    sendMessage() {
      if (this.message) {
        this.socket.send(this.message);
        this.message = ''; // Clear input
      }
    },
  },
};
</script>

<style scoped>
input {
  margin-bottom: 10px;
}
</style>
```

### WebSocket 安全性

1. **WebSocket over TLS (wss://)**：
   - WebSocket 支持加密传输（wss://），和 HTTPS 类似，它为 WebSocket 通信提供了加密保护。
   
2. **身份验证和授权**：
   - WebSocket 本身没有内建身份验证机制，通常需要在握手阶段通过 HTTP 头进行身份验证，或者通过 WebSocket 消息来进行认证。

3. **防止 DoS 攻击**：
   - WebSocket 可以被滥用进行服务拒绝攻击（DoS），因此应对每个连接进行限制和监控。

### 总结

WebSocket 是一种非常适合实时通讯的协议，特别适用于即时聊天、在线游戏、实时股票行情等应用场景。

与传统的轮询或长轮询方式相比，WebSocket 提供了更高效、低延迟的通信方式，支持双向通信，并且可以在连接建立后持续进行数据交换。

如果你正在构建需要高效实时通讯的应用，WebSocket 是一个很好的选择。

## 后端是 java springboot 技术栈，前段主要是 js vue 技术栈。给出 websocket 前后端代码实现


# 总结

# 参考资料

* any list
{:toc}