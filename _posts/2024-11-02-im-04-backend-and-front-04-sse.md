---
layout: post
title: IM 即时通讯系统-04-前后端交互设计策略之 SSE（Server-Sent Events） 实现代码
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


## 详细介绍一下 IM 的实现策略之 SSE（Server-Sent Events）

Server-Sent Events（SSE）是一种服务器向浏览器推送实时更新的技术，基于 HTTP 协议，它是实现即时消息（IM）的一种常见策略。

SSE 允许服务器单向地向客户端推送数据，并且能够自动重新连接，适合于实时应用，比如聊天系统、股票价格更新等。

### SSE 的基本原理

SSE 是基于 HTTP 协议的推送技术，客户端通过 HTTP 请求向服务器发起连接，服务器可以通过该连接主动向客户端推送数据。

与 WebSocket 或长轮询不同，SSE 是基于标准的 HTTP 协议实现的，它在一条持久的 HTTP 连接上进行数据传输。

与传统的请求/响应方式不同，SSE 使得服务器能够主动向客户端推送事件。

### SSE 与其他即时通信技术的对比

| 特性                   | SSE                     | WebSocket                 | Long Polling               |
|------------------------|--------------------------|---------------------------|----------------------------|
| 协议                   | HTTP/1.1 或 HTTP/2       | 自定义协议（通常是 ws://） | HTTP                      |
| 双向通信               | 单向（服务器推送给客户端）| 双向通信                   | 单向（客户端请求，服务器响应） |
| 连接保持               | 持久连接，自动重连       | 持久连接                   | 短连接                     |
| 客户端支持             | 原生支持（HTML5+）        | 需要客户端库或原生支持      | 浏览器支持                 |
| 支持的应用场景         | 实时通知、新闻推送等      | 聊天、多人协作、游戏等     | 实时聊天、数据推送等       |

### SSE 的工作流程

1. **客户端请求建立 SSE 连接**
   客户端通过发送一个 HTTP 请求（通常是 GET 请求）来向服务器建立一个 SSE 连接，服务器返回一个特殊的响应，告诉浏览器使用 SSE 进行通信。

2. **服务器推送数据**
   一旦连接建立，服务器可以通过该连接推送事件数据到客户端。推送的数据格式是文本，通常为 JSON 或普通文本。

3. **客户端接收数据**
   客户端使用 `EventSource` API 来接收来自服务器的数据，并能够处理这些数据，例如更新页面内容。

4. **自动重连**
   如果连接丢失或断开，SSE 会自动尝试重连，通常每次重连都会延时，直到服务器恢复。

### 使用 SSE 实现 IM 的流程

#### 1. 后端实现 SSE

在 Java 的 Spring Boot 中，SSE 实现通常依赖于 `ResponseBody` 和 `EventSource` 格式的内容。

```java
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.async.DeferredResult;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

@RestController
public class ChatController {

    // 使用队列来模拟消息的推送
    private BlockingQueue<String> messageQueue = new LinkedBlockingQueue<>();

    // 模拟消息发送
    @GetMapping("/sendMessage")
    public String sendMessage(String message) {
        try {
            messageQueue.put(message);  // 将消息加入队列
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return "Message Sent!";
    }

    // SSE 长连接接口
    @GetMapping(value = "/receiveMessages", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public DeferredResult<String> receiveMessages() {
        DeferredResult<String> output = new DeferredResult<>();

        // 模拟推送消息
        new Thread(() -> {
            try {
                while (true) {
                    String message = messageQueue.take();  // 阻塞等待新消息
                    output.setResult("data: " + message + "\n\n");  // 发送数据
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();

        return output;  // 返回消息
    }
}
```

- **`/sendMessage`**：模拟发送消息的接口。这个接口将接收来自客户端的消息并存入队列中。
- **`/receiveMessages`**：这个接口通过 `DeferredResult` 对象返回一个 SSE 流。`DeferredResult` 是 Spring 提供的异步处理机制，用于支持长时间未响应的请求（在这种情况下，就是等待消息的到来）。每当有新消息时，服务器会将其推送给客户端。

#### 2. 前端实现 SSE

前端使用 `EventSource` 来处理 SSE。`EventSource` 是浏览器原生支持的 API，可以用于接收来自服务器的事件。

```html
<template>
  <div>
    <div v-for="(msg, index) in messages" :key="index">{{ msg }}</div>
    <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message">
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      newMessage: ""
    };
  },
  created() {
    this.startSSE();
  },
  methods: {
    startSSE() {
      const eventSource = new EventSource('http://localhost:8080/receiveMessages');
      eventSource.onmessage = (event) => {
        this.messages.push(event.data);  // 接收到消息后添加到消息列表
      };

      eventSource.onerror = (err) => {
        console.error("EventSource failed:", err);
      };
    },
    async sendMessage() {
      if (this.newMessage.trim()) {
        try {
          await this.$axios.get('http://localhost:8080/sendMessage', {
            params: { message: this.newMessage }
          });
          this.newMessage = "";  // 清空输入框
        } catch (error) {
          console.error("Send message error:", error);
        }
      }
    }
  }
};
</script>
```

- **`EventSource`**：`EventSource` 对象用于建立与服务器的连接，自动处理连接重连等问题。`onmessage` 事件会在服务器推送数据时被触发，数据会被接收到并更新到消息列表。
- **发送消息**：前端发送消息的方式与长轮询类似，利用 `axios` 向后端的 `/sendMessage` 发送请求。

### SSE 的优缺点

#### 优点：
1. **简单性**：SSE 使用标准的 HTTP 协议，客户端无需额外的库支持，浏览器原生支持 `EventSource`。
2. **自动重连**：如果连接中断，`EventSource` 会自动尝试重新连接，减少了客户端的维护工作。
3. **低延迟**：由于使用持久连接，SSE 能够实时推送数据。
4. **节省资源**：相比于 WebSocket，SSE 只进行单向推送，因此服务器的负载较小，适合消息推送、通知等场景。

#### 缺点：
1. **单向通信**：SSE 仅支持服务器向客户端推送消息，不能像 WebSocket 那样实现双向通信。
2. **仅支持 HTTP/1.1**：SSE 在某些环境下可能会受到限制（如防火墙、代理等）。
3. **浏览器兼容性**：虽然大多数现代浏览器都支持 SSE，但一些较老的浏览器和一些特殊浏览器（如 Internet Explorer）不支持 SSE。
4. **带宽消耗**：虽然 SSE 通常不会有长轮询的高开销，但仍然有一定的带宽消耗，特别是连接在长时间内保持不变时。

### 总结

SSE 是一种简单、低延迟的推送技术，适用于单向的即时消息应用，尤其适用于需要实时通知、事件更新等场景。

与长轮询相比，SSE 在使用上更为简便，且能够自动处理连接断开的重连。

它不适合需要双向通信的场景，像 WebSocket 更适合用在需要双向实时通讯的应用中（如实时聊天、多人协作应用等）。

## 后端是 java springboot 技术栈，前段主要是 js vue 技术栈。给出 SSE 前后端代码实现


# 总结

# 参考资料

* any list
{:toc}