---
layout: post
title: IM 即时通讯系统-04-前后端交互设计策略之长轮询实现代码
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


## 详细介绍一下 IM 的实现策略之 长轮询（Long Polling）

长轮询（Long Polling）是一种常见的实现即时通讯（IM）系统的方法，尤其适用于那些要求低延迟的应用，如聊天应用、通知系统等。它的工作原理和传统的轮询相比，能够减少服务器和客户端之间的通信负担，从而提高响应速度。下面我将详细介绍长轮询的实现策略，包括它的工作原理、优缺点以及适用场景。

### 1. 工作原理
长轮询的基本思想是：客户端向服务器发送请求，服务器不会立即返回响应，而是保持连接，直到有新的数据可供返回（例如，新的消息、通知等）。一旦服务器准备好响应，客户端就会收到服务器的数据，然后立即重新发送请求，等待下一个数据更新。这种方式类似于轮询，但与传统的短轮询不同的是，长轮询能够更好地节省资源，因为它避免了频繁的请求和响应。

#### 长轮询的具体流程：
1. **客户端请求**：客户端向服务器发送一个HTTP请求，告知服务器它正在等待新的数据。
2. **服务器等待**：服务器在接收到请求后不会立刻返回响应，而是保持该请求直到有新的消息或数据需要返回给客户端。服务器可以通过阻塞当前请求的方式来等待新的数据或事件的发生。
3. **返回响应**：一旦有新的数据，服务器就会将其作为响应返回给客户端，客户端收到后处理数据。
4. **重新请求**：客户端收到响应后，会立即发起新的请求，重新进入等待状态，继续等待下一次服务器的数据更新。

### 2. 优点
- **低延迟响应**：相比传统的轮询，长轮询的延迟较低，因为客户端不需要每隔一定时间就发送请求，而是可以实时获得服务器端的数据更新。
- **节省带宽**：长轮询减少了不必要的请求和响应交换，尤其在数据更新较少的情况下，能够有效降低带宽的消耗。
- **较好的实时性**：由于客户端能够较快地接收到服务器的数据更新，长轮询能够实现接近实时的通信效果。

### 3. 缺点
- **连接管理复杂**：长轮询的实现需要在服务器端保持长时间的连接，这对服务器的负载和资源管理提出了较高的要求。如果请求的数量较多，可能会导致服务器资源被占用过多。
- **可能的超时问题**：如果服务器的响应时间过长，可能导致客户端的请求超时。在这种情况下，客户端需要重新发起请求，这可能会增加额外的开销。
- **容易受到网络波动影响**：如果网络不稳定，长时间保持连接可能导致连接中断，从而影响实时性。

### 4. 与短轮询的比较
- **短轮询**：客户端定期向服务器发送请求，服务器每次都会立即返回响应，不管是否有新的数据可供返回。短轮询的频率一般较高，可能导致较大的网络负载。
- **长轮询**：与短轮询不同，客户端发送请求后，服务器会在数据准备好时再返回响应。长轮询有效减少了网络负载，但也需要管理长时间的连接。

### 5. 适用场景
长轮询非常适合用于那些实时性要求较高，但又不适合使用WebSocket或其他推送机制的场景。例如：
- **即时通讯（IM）**：如聊天应用中的新消息推送。
- **实时通知系统**：如推送通知、公告消息等。
- **监控系统**：实时监控数据的展示和警报推送。

### 6. 优化策略
- **连接池管理**：为了提高服务器的效率，可以使用连接池来管理长轮询连接，避免每次请求都创建新连接。
- **超时设置**：在设计长轮询时，可以设定合理的超时时间，避免因客户端和服务器之间的长时间连接导致资源浪费。
- **数据批量推送**：服务器可以在有多个消息或事件时批量推送，而不是一个个地推送，可以提高系统的吞吐量。

### 7. 长轮询与WebSocket的比较

虽然长轮询可以提供接近实时的效果，但随着实时性和并发需求的增加，WebSocket逐渐成为更常见的选择。

WebSocket在实现上具有更低的延迟和更高的效率，特别是在需要频繁推送数据的场景中。

| 特性             | 长轮询                           | WebSocket                        |
|------------------|----------------------------------|----------------------------------|
| 连接方式         | HTTP请求，保持长连接             | 双向通信，持久连接                |
| 延迟             | 低，但依赖于轮询频率和超时设定   | 极低，实时双向数据传输            |
| 资源消耗         | 高，尤其在并发量大时              | 较低，适合大规模并发              |
| 实现复杂度       | 较简单，但需要管理连接和超时     | 需要WebSocket协议支持，复杂度较高 |

### 8. 总结

长轮询作为一种实现即时通讯的策略，具有较低的延迟和较好的实时性，适用于需要实时数据更新的场景。

尽管它存在一些缺点，如较高的连接资源消耗和可能的超时问题，但在特定场景下（如低并发或简单的应用场景），长轮询仍然是一种有效的方案。

然而，对于高并发和对延迟要求极高的应用，WebSocket可能是更好的选择。

## 后端是 java springboot 技术栈，前段主要是 js vue 技术栈。给出 长轮询（Long Polling） IM 的前后端代码实现

要实现一个基于长轮询（Long Polling）的即时消息（IM）系统，可以按照以下步骤进行前后端的实现。我们将使用 Spring Boot 实现后端，Vue.js 和 JavaScript 实现前端。

### 后端：Spring Boot 实现长轮询

1. **Controller**：创建一个处理长轮询请求的 API。

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.LinkedBlockingQueue;

@RestController
public class ChatController {

    // 使用队列来模拟消息的发送
    private LinkedBlockingQueue<String> messageQueue = new LinkedBlockingQueue<>();

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

    // 长轮询 API
    @GetMapping("/receiveMessage")
    public String receiveMessage() throws InterruptedException {
        // 阻塞直到有新的消息
        String message = messageQueue.take();  
        return message;  // 返回消息给前端
    }
}
```

- `sendMessage`：模拟发送消息的接口。你可以通过其他方式将消息发送到这个接口（例如，其他系统，用户输入等）。
- `receiveMessage`：模拟长轮询接口，前端会通过此接口获取新消息。如果没有新消息，服务器会一直等待直到有新消息。

2. **Application启动类**

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ChatApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChatApplication.class, args);
    }
}
```

### 前端：Vue.js 实现长轮询

前端实现比较简单，通过 `setInterval` 或 `async/await` 来实现定时的长轮询。

1. **Vue.js 组件实现**

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
    this.startLongPolling();
  },
  methods: {
    async startLongPolling() {
      try {
        while (true) {
          const response = await this.$axios.get('/receiveMessage');
          this.messages.push(response.data); // 将接收到的消息添加到消息列表
        }
      } catch (error) {
        console.error("Long polling error:", error);
        setTimeout(() => this.startLongPolling(), 5000); // 如果出错，重试
      }
    },
    async sendMessage() {
      if (this.newMessage.trim()) {
        try {
          await this.$axios.get('/sendMessage', {
            params: { message: this.newMessage }
          });
          this.newMessage = ""; // 清空输入框
        } catch (error) {
          console.error("Send message error:", error);
        }
      }
    }
  }
};
</script>
```

### 关键点解析：
- `startLongPolling` 方法会持续进行长轮询，直到获取到新消息。它会发送 `GET` 请求到 `/receiveMessage`，并在接收到消息时将消息添加到 `messages` 数组中。
- `sendMessage` 方法通过 `GET` 请求向后端的 `/sendMessage` 接口发送用户输入的消息。

2. **Vue.js 配置 Axios**

你需要配置 Axios 来进行 HTTP 请求。

```javascript
import Vue from 'vue';
import Axios from 'axios';

Vue.prototype.$axios = Axios;
Axios.defaults.baseURL = 'http://localhost:8080';  // 后端地址
Axios.defaults.headers.post['Content-Type'] = 'application/json';
```

### 运行示例
1. 启动 Spring Boot 后端应用：
   ```bash
   mvn spring-boot:run
   ```

2. 启动 Vue.js 项目并访问：
   ```bash
   npm run serve
   ```

3. 在前端页面输入消息并发送，消息将通过长轮询方式实时显示在前端。

### 总结：
- 后端使用 Spring Boot 提供了长轮询接口（`/receiveMessage`）和模拟消息发送接口（`/sendMessage`）。
- 前端使用 Vue.js 和 Axios 进行定时的长轮询请求，实时接收消息并更新 UI。

长轮询的特点是前端发出请求后，如果没有新消息，服务器将一直等待直到有新消息来响应，从而实现了实时通讯的效果。

# 总结

# 参考资料

* any list
{:toc}