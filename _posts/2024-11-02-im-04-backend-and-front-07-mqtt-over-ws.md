---
layout: post
title: IM 即时通讯系统-04-前后端交互设计策略之 MQTT over WebSocket（物联网风格消息总线）实现代码
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

# **2. MQTT over WebSocket（物联网风格消息总线）**

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




# 总结

# 参考资料

* any list
{:toc}