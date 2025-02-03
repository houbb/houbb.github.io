---
layout: post
title: IM 即时通讯系统-04-前后端交互设计策略之 HTTP/2 Server Push（实验性方案）实现代码
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

#  HTTP/2 Server Push（实验性方案）

## **方案概述**

- 利用 HTTP/2 的服务器推送能力，将消息主动推送到客户端。
- 需要客户端和服务端均支持 HTTP/2，且浏览器端需通过 Service Worker 管理推送。

## **实现步骤**

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




# 总结

# 参考资料

* any list
{:toc}