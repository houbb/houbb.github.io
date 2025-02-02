---
layout: post
title: IM 即时通讯系统-04-前后端交互设计策略之  gRPC + gRPC-Web（双向流通信） 实现代码
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


## 后端是 java springboot 技术栈，前段主要是 js vue 技术栈。除了上面的几个策略，还有其他实现方式吗？

在 Java Spring Boot 后端和 Vue.js 前端的技术栈下，除了传统的 **WebSocket、长轮询、SSE** 之外，还可以结合其他技术方案实现 IM 功能。

以下是针对该技术栈的扩展方案及实现细节：

---

### **1. gRPC + gRPC-Web（双向流通信）**

### gRPC + gRPC-Web（双向流通信）

**gRPC** 是 Google 开发的一种高性能、开源和通用的 RPC（Remote Procedure Call）框架，使用 **Protocol Buffers**（protobuf）作为接口定义语言（IDL），支持多种语言的客户端和服务器端实现。gRPC 提供了高效的通信协议，尤其适用于分布式系统中的微服务通信。

**gRPC-Web** 是 gRPC 的一个扩展，它使得可以在 Web 浏览器中直接与 gRPC 服务器进行通信。Web 客户端通过 HTTP/1.1 或 HTTP/2 协议与 gRPC 服务器通信。gRPC-Web 主要用于在现代 Web 应用中与 gRPC 服务进行交互，但浏览器本身不支持直接使用 gRPC，因此 gRPC-Web 充当了一个代理或中间层。

**双向流通信** 是 gRPC 中的一种通信模式，它允许客户端和服务器之间进行双向流数据传输。在此模式下，客户端和服务器都可以在保持连接的同时发送和接收消息。这种方式非常适合实时、低延迟的双向交互场景，如实时聊天、监控系统、在线游戏等。

### gRPC + gRPC-Web 双向流通信的原理

gRPC 中有四种通信模型：

1. **单向请求-响应**（Unary RPC）：客户端发送一个请求，服务器返回一个响应。
2. **服务器流式响应**（Server-streaming RPC）：客户端发送一个请求，服务器返回多个响应。
3. **客户端流式请求**（Client-streaming RPC）：客户端发送多个请求，服务器返回一个响应。
4. **双向流式通信**（Bidirectional-streaming RPC）：客户端和服务器都可以发送多个消息，通过一个连接进行双向的流式通信。

在双向流式通信中，客户端和服务器通过流建立连接，双方可以随时发送消息，直到其中一方关闭连接。

### 双向流通信的步骤

1. **客户端发送消息**：客户端可以持续不断地向服务器发送消息。发送消息的顺序由客户端控制。
2. **服务器接收并响应消息**：服务器可以持续不断地接收客户端消息，并根据需要随时向客户端返回响应。
3. **连接保持**：与传统的请求-响应模型不同，在双向流模式下，连接保持开启，直到客户端或服务器显式关闭连接。

这种模式的一个常见应用是实时聊天系统，客户端和服务器保持一个长连接，实时交换消息。

### gRPC 双向流通信示例

#### 1. gRPC 服务定义

首先，我们定义一个简单的双向流式 RPC 服务。我们使用 **Protocol Buffers** 来描述服务接口。

**service.proto** 文件：

```proto
syntax = "proto3";

package chat;

// ChatService 服务定义
service ChatService {
    // 双向流式 RPC
    rpc Chat (stream ChatMessage) returns (stream ChatMessage);
}

// 消息定义
message ChatMessage {
    string user = 1;      // 用户名
    string message = 2;   // 消息内容
    int64 timestamp = 3;  // 时间戳
}
```

在这个定义中，我们创建了一个 `ChatService` 服务，它有一个 `Chat` 方法，支持双向流式通信。`ChatMessage` 消息定义了用户、消息和时间戳。

#### 2. 生成服务代码

使用 `protoc` 命令来生成服务器端和客户端的代码。假设我们使用的是 Java 和 JavaScript（用于 gRPC-Web）客户端。

生成 Java 代码：
```bash
protoc --java_out=src/main/java --grpc-java_out=src/main/java --proto_path=./service service.proto
```

生成 JavaScript 代码（用于 gRPC-Web）：
```bash
protoc --js_out=import_style=commonjs,binary:./src --grpc-web_out=import_style=typescript,mode=grpcwebtext:./src --proto_path=./service service.proto
```

#### 3. 实现 gRPC 服务器

在 Java 后端实现双向流式 RPC：

```java
import io.grpc.stub.StreamObserver;

public class ChatServiceImpl extends ChatServiceGrpc.ChatServiceImplBase {

    @Override
    public StreamObserver<ChatMessage> chat(StreamObserver<ChatMessage> responseObserver) {
        return new StreamObserver<ChatMessage>() {

            @Override
            public void onNext(ChatMessage message) {
                // 打印收到的消息
                System.out.println("Received message: " + message.getMessage());

                // 发送响应
                ChatMessage response = ChatMessage.newBuilder()
                        .setUser("Server")
                        .setMessage("Reply to: " + message.getMessage())
                        .setTimestamp(System.currentTimeMillis())
                        .build();

                responseObserver.onNext(response); // 发送消息给客户端
            }

            @Override
            public void onError(Throwable t) {
                // 错误处理
                t.printStackTrace();
            }

            @Override
            public void onCompleted() {
                // 连接关闭时
                responseObserver.onCompleted();
            }
        };
    }
}
```

在这个实现中，`chat` 方法返回一个 `StreamObserver<ChatMessage>` 对象，允许客户端和服务器之间进行双向通信。客户端发送消息后，服务器收到消息并回应。

#### 4. 配置 gRPC-Web 代理

gRPC-Web 是为了支持 Web 浏览器与 gRPC 服务器通信。在浏览器中，客户端不能直接使用 WebSocket 或 HTTP/2 进行 gRPC 调用，所以需要通过一个代理（如 `envoy` 或 `grpc-web` 代理）来桥接 gRPC 和 HTTP/1.1。

**使用 gRPC-Web 代理**：

- 安装 gRPC-Web 代理：
  
  ```bash
  npm install -g grpc-web
  ```

- 启动代理：
  
  ```bash
  grpcwebproxy --backend_addr=localhost:50051 --allow_all_origins
  ```

  代理启动后，它会转发来自 Web 客户端的请求到实际的 gRPC 服务器。

#### 5. 实现 Web 客户端（Vue.js + gRPC-Web）

前端客户端使用 `gRPC-Web` 进行双向流式通信。

```javascript
import { ChatServiceClient } from './generated/chat_grpc_web_pb';
import { ChatMessage } from './generated/service_pb';

const client = new ChatServiceClient('http://localhost:8080', null, null);

const stream = client.chat((err, response) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Received from server:', response.getMessage());
    }
});

// 发送消息
const message = new ChatMessage();
message.setUser('Client');
message.setMessage('Hello from client!');
message.setTimestamp(Date.now());

stream.write(message);

// 监听输入并实时发送消息
document.querySelector('#sendButton').addEventListener('click', () => {
    const userMessage = document.querySelector('#messageInput').value;
    const msg = new ChatMessage();
    msg.setUser('Client');
    msg.setMessage(userMessage);
    msg.setTimestamp(Date.now());

    stream.write(msg);
});
```

在这个前端代码中，我们使用 `ChatServiceClient` 类来访问 gRPC 服务。通过 `client.chat()` 方法发起双向流请求，`stream.write()` 可以发送消息，`stream.on('data')` 可以接收从服务器返回的响应。

### 总结

- **gRPC** 和 **gRPC-Web** 提供了一种高效的双向流式通信方式，使客户端和服务器能够保持持久连接，进行实时数据交换。
- **双向流通信** 在许多场景下非常有用，比如即时消息、实时通知、在线游戏等。
- **gRPC-Web** 通过代理允许 Web 客户端与 gRPC 服务器进行通信，使得 Web 应用能够使用 gRPC 的所有优势。
  
这种技术组合适合需要低延迟和高效实时通信的应用，是现代 Web 应用中的一种优秀解决方案。

#### **方案概述**
- **gRPC** 是基于 HTTP/2 的高性能 RPC 框架，支持 **双向流（Bidirectional Streaming）**，适合实时消息场景。
- **gRPC-Web** 允许浏览器通过 HTTP/1.1 或 HTTP/2 与 gRPC 服务通信，解决浏览器原生不支持 gRPC 的问题。

#### **实现步骤**
1. **后端（Spring Boot）**：
   - 添加依赖：`grpc-spring-boot-starter`。
   - 定义 Protobuf 消息格式（`.proto` 文件）：
     ```protobuf
     service ChatService {
       rpc ChatStream(stream ClientMessage) returns (stream ServerMessage) {}
     }
     message ClientMessage { string content = 1; }
     message ServerMessage { string content = 1; }
     ```
   - 实现服务端流式处理：
     ```java
     @GrpcService
     public class ChatServiceImpl extends ChatServiceGrpc.ChatServiceImplBase {
         @Override
         public StreamObserver<ClientMessage> chatStream(StreamObserver<ServerMessage> responseObserver) {
             return new StreamObserver<>() {
                 @Override
                 public void onNext(ClientMessage message) {
                     // 处理消息并推送
                     responseObserver.onNext(ServerMessage.newBuilder().setContent("Echo: " + message.getContent()).build());
                 }
                 @Override public void onError(Throwable t) { /* 错误处理 */ }
                 @Override public void onCompleted() { responseObserver.onCompleted(); }
             };
         }
     }
     ```

2. **前端（Vue.js）**：
   - 使用 **grpc-web** 库：
     ```bash
     npm install grpc-web
     ```
   - 生成客户端代码：
     ```bash
     protoc --js_out=import_style=commonjs,binary:. --grpc-web_out=import_style=commonjs,mode=grpcwebtext:. chat.proto
     ```
   - 调用 gRPC 服务：
     ```javascript
     import { ChatServiceClient } from './chat_pb_service';
     import { ClientMessage } from './chat_pb';

     const client = new ChatServiceClient('http://localhost:8080');
     const stream = client.chatStream();

     stream.on('data', (response) => {
       console.log('Received:', response.getContent());
     });

     // 发送消息
     const message = new ClientMessage();
     message.setContent('Hello gRPC!');
     stream.write(message);
     ```

**优点**：
- 高性能（二进制协议 Protobuf），支持多语言交互。
- 天然支持双向流，适合复杂交互场景。

**缺点**：
- 浏览器端需通过 gRPC-Web 代理（如 Envoy）或框架封装。
- 调试复杂度高于 REST API。

---

### **2. MQTT over WebSocket（物联网风格消息总线）**
#### **方案概述**
- **MQTT** 是轻量级发布/订阅协议，适合设备间消息传递，通过 **MQTT over WebSocket** 可在浏览器中使用。
- 需要部署 MQTT Broker（如 EMQX、Mosquitto）。

#### **实现步骤**
1. **后端（Spring Boot）**：
   - 集成 MQTT 客户端（如 Eclipse Paho）：
     ```xml
     <dependency>
         <groupId>org.springframework.integration</groupId>
         <artifactId>spring-integration-mqtt</artifactId>
     </dependency>
     ```
   - 发布消息到 Broker：
     ```java
     @Service
     public class MqttService {
         @Autowired
         private MqttPahoClientFactory mqttClientFactory;

         public void sendMessage(String topic, String payload) {
             MqttPahoTemplate template = new MqttPahoTemplate(mqttClientFactory);
             template.publish(topic, payload.getBytes(), 0, false);
         }
     }
     ```

2. **前端（Vue.js）**：
   - 使用 MQTT.js 库连接 Broker：
     ```bash
     npm install mqtt
     ```
   - 连接并订阅主题：
     ```javascript
     import mqtt from 'mqtt';

     const client = mqtt.connect('ws://broker.emqx.io:8083/mqtt');

     client.subscribe('chat/room1');
     client.on('message', (topic, message) => {
       console.log('Received:', message.toString());
     });

     // 发送消息
     client.publish('chat/room1', 'Hello MQTT!');
     ```

**优点**：
- 支持 QoS 等级（消息可达性保证）。
- 天然支持离线消息（Broker 持久化）。

**缺点**：
- 需额外维护 MQTT Broker 集群。
- 浏览器端长连接需依赖 WebSocket。

---

### **3. RSocket（响应式双向通信协议）**
#### **方案概述**
- **RSocket** 是面向 Reactive Stream 的应用层协议，支持 **请求-响应、流式、发布-订阅** 等多种模式。
- Spring Boot 原生支持 RSocket，适合需要复杂交互逻辑的 IM 系统。

#### **实现步骤**
1. **后端（Spring Boot）**：
   - 添加依赖：
     ```xml
     <dependency>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-starter-rsocket</artifactId>
     </dependency>
     ```
   - 定义消息处理器：
     ```java
     @Controller
     public class ChatController {
         @MessageMapping("chat.stream")
         public Flux<Message> chatStream(Flux<Message> inbound) {
             return inbound.map(message -> {
                 // 处理消息并返回响应流
                 return new Message("Echo: " + message.getContent());
             });
         }
     }
     ```

2. **前端（Vue.js）**：
   - 使用 RSocket-WebSocket-Client：
     ```bash
     npm install rsocket-websocket-client rsocket-core
     ```
   - 建立连接并通信：
     ```javascript
     import { RSocketClient } from 'rsocket-core';
     import RSocketWebSocketClient from 'rsocket-websocket-client';

     const client = new RSocketClient({
       transport: new RSocketWebSocketClient({ url: 'ws://localhost:7000' }),
     });

     client.connect().subscribe({
       onComplete: (socket) => {
         socket.requestStream({
           data: { content: 'Hello RSocket!' },
           metadata: { route: 'chat.stream' }
         }).subscribe({
           onNext: (payload) => {
             console.log('Received:', payload.data);
           }
         });
       }
     });
     ```

**优点**：
- 支持背压（Backpressure）控制，避免消息过载。
- 多交互模式灵活适配业务需求。

**缺点**：
- 社区生态较小，调试工具较少。
- 前端库成熟度低于 WebSocket。

---

### **4. HTTP/2 Server Push（实验性方案）**
#### **方案概述**
- 利用 HTTP/2 的服务器推送能力，将消息主动推送到客户端。
- 需要客户端和服务端均支持 HTTP/2，且浏览器端需通过 Service Worker 管理推送。

#### **实现步骤**
1. **后端（Spring Boot）**：
   - 配置 HTTP/2（需 SSL 证书）：
     ```yaml
     server:
       http2:
         enabled: true
     ```
   - 推送资源（示例为静态资源，动态消息需结合 Server-Sent Events）：
     ```java
     @GetMapping("/messages")
     public ResponseEntity<Resource> getMessages(HttpServletResponse response) {
         PushBuilder pushBuilder = request.newPushBuilder();
         pushBuilder.path("/api/latest-message").push();
         return ResponseEntity.ok().build();
     }
     ```

**适用场景**：
- 推送静态资源（如 IM 中的图片缩略图）。
- 结合 SSE 实现动态内容推送。

**局限性**：
- 浏览器对 HTTP/2 Server Push 的支持有限（Chrome 已弃用）。
- 无法实现真正的双向实时通信。

---

### **5. 第三方云服务集成（快速搭建）**
#### **方案示例**
- **Firebase Realtime Database**：
  - 后端通过 Firebase Admin SDK 写入数据。
  - 前端监听数据变更：
    ```javascript
    import firebase from 'firebase/app';
    import 'firebase/database';

    firebase.initializeApp({ /* 配置 */ });
    const db = firebase.database();
    db.ref('messages').on('value', (snapshot) => {
      console.log('New message:', snapshot.val());
    });
    ```
- **阿里云 MNS（消息服务）**：
  - 后端通过 SDK 发送消息到队列。
  - 前端通过 WebSocket 接收消息通知。

**优点**：
- 快速实现，无需自研消息系统。
- 天然支持跨平台（iOS/Android/Web）。

**缺点**：
- 依赖第三方服务，存在数据隐私风险。
- 成本随用户量增长可能较高。

---

### **选型建议**
| 场景需求                   | 推荐方案               |
|---------------------------|-----------------------|
| 高并发双向交互（如聊天室） | WebSocket 或 RSocket  |
| 跨平台 IoT 设备集成        | MQTT over WebSocket   |
| 需要严格背压控制           | RSocket               |
| 快速原型开发               | 第三方云服务（Firebase） |
| 需要强类型接口约束         | gRPC                  |

---

### **关键优化点**
1. **连接管理**：
   - 使用 Netty 替代 Tomcat 提升 WebSocket 并发能力。
   - 配置 Spring Boot WebSocket 线程池：
     ```java
     @Configuration
     @EnableWebSocket
     public class WebSocketConfig implements WebSocketConfigurer {
         @Override
         public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
             registry.addHandler(chatHandler(), "/chat")
                     .setHandshakeHandler(new DefaultHandshakeHandler(new TomcatRequestUpgradeStrategy()))
                     .setAllowedOrigins("*");
         }

         @Bean
         public WebSocketHandler chatHandler() {
             return new ChatWebSocketHandler();
         }
     }
     ```

2. **消息压缩**：
   - 开启 WebSocket 的 `permessage-deflate` 压缩：
     ```yaml
     server:
       compression:
         enabled: true
         mime-types: text/html,text/xml,text/plain,text/css,text/javascript,application/javascript
         min-response-size: 1024
     ```

3. **安全加固**：
   - WebSocket 鉴权（Spring Security）：
     ```java
     @Override
     protected void configure(HttpSecurity http) throws Exception {
         http.authorizeRequests()
             .antMatchers("/chat").authenticated()
             .and().oauth2Login();
     }
     ```

---

### **总结**
在 Spring Boot + Vue 技术栈下，除了经典方案外，**gRPC 双向流、MQTT over WebSocket、RSocket** 均是可行的替代方案。选型时需综合考虑以下因素：
- **业务需求**：是否需要 QoS 保证、背压控制？
- **团队熟悉度**：是否有 Protobuf 或 RSocket 开发经验？
- **运维成本**：是否愿意维护 MQTT Broker 或 RSocket 基础设施？ 
- **未来扩展**：是否需要对接移动端或 IoT 设备？

建议从 WebSocket 入手，逐步在特定场景引入其他协议（如大文件传输用 MQTT，跨服务通信用 gRPC），最终形成混合型实时通信架构。


# 总结

# 参考资料

* any list
{:toc}