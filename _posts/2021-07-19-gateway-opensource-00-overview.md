---
layout: post
title: 开源网关-00-overview 概览
date:  2021-07-19 09:20:31 +0800
categories: [Gateway]
tags: [gateway, opensource, sh]
published: true
---

# chat

## 网关

网关（Gateway）是计算机网络中的一种设备，它在不同的网络或网络协议之间进行数据传输。网关通常用于连接两个不同的网络，如局域网（LAN）和广域网（WAN），或者不同类型的网络，如以太网和Wi-Fi网络。网关的主要作用是将数据从一个网络转换成另一个网络能够理解的格式，从而实现不同网络之间的通信。

以下是网关的一些详细介绍：

1. **协议转换**：网关能够将一种网络协议转换为另一种网络协议，以确保数据能够在不同的网络间传输。

2. **地址转换**：网关可以执行地址转换，如网络地址转换（NAT），它允许多个设备共享一个公共IP地址。

3. **路由选择**：网关还可以执行路由选择，决定数据包的最佳传输路径。

4. **防火墙功能**：某些网关设备还具备防火墙功能，能够保护内部网络不受外部攻击。

5. **VPN支持**：虚拟私人网络（VPN）网关允许远程用户通过加密的连接安全地访问内部网络。

6. **应用层网关**：应用层网关（如HTTP网关）在应用层上工作，它们可以处理应用层协议，如HTTP、SMTP等。

7. **透明网关**：透明网关对用户来说是不可见的，它在网络层工作，用户无需对其进行配置。

8. **非透明网关**：非透明网关需要用户知道其存在，并且可能需要进行特定的配置。

9. **智能网关**：智能网关具备处理更复杂任务的能力，如数据包过滤、状态监测、负载均衡等。

10. **家庭和办公室使用**：在家庭或办公室网络中，路由器通常集成了网关的功能，允许家庭或办公室的设备连接到互联网。

11. **企业级应用**：在大型企业网络中，网关可能更加复杂，需要处理大量的数据传输和复杂的安全协议。

12. **云服务网关**：随着云计算的普及，云服务网关允许企业通过互联网安全地访问云服务和应用程序。

13. **物联网（IoT）网关**：IoT网关连接了物联网设备和网络，允许传感器和智能设备的数据被收集和分析。

网关是网络通信中不可或缺的一部分，它们确保了不同网络和设备之间的顺畅通信，同时也提供了必要的安全和路由功能。

## 优秀的 java 开源网关有哪些？

Java 开源网关是微服务架构中的关键组件，它们通常负责处理API路由、负载均衡、认证授权、监控和安全等功能。

以下是一些优秀的 Java 开源网关：

1. **Spring Cloud Gateway**
   - 基于Spring 5.0, Spring Boot 2.0和WebFlux开发，性能高于Zuul，为微服务架构提供统一的API路由管理方式。
   - 支持与Spring Cloud Discovery Client（如Eureka）、Ribbon、Hystrix等组件配合使用，实现路由转发、负载均衡、熔断、鉴权、路径重写、日志监控等功能。

2. **Zuul**
   - Netflix开源的微服务网关，Spring Cloud对其进行了整合与增强。
   - 主要功能包括认证和安全、性能监测、动态路由、压力测试、负载卸载和静态资源处理。

3. **Soul**
   - 异步的、高性能的、跨语言的、响应式的API网关，支持HTTP、Dubbo和Spring Cloud协议。
   - 插件化设计，支持限流、熔断、代理转发等，流量配置动态化，性能极高。

4. **Gravitee.io API Gateway**
   - 基于Vert.X开发的高性能接口网关，支持Swagger导入接口、文档管理、性能分析、操作审计、日志和负载均衡等功能。

5. **WSO2 API Microgateway**
   - 云原生、以开发人员为中心和去中心化的API网关，主要用于微服务。
   - 使用Java构建，简化了在分布式微服务架构中创建、部署和保护API的过程。

6. **Fizz Gateway**
   - 基于Spring WebFlux开发的微服务网关，支持热服务编排、自动授权选择、线上服务脚本编码、在线测试、高性能路由、API审核管理等。

7. **Apiman**
   - 基于Java的API管理工具，具有丰富的API设计和配置层以及极快的运行时间。

8. **Gloo Edge**
   - 基于Go的Kubernetes原生入口控制器和API网关，构建在Envoy Proxy之上。

9. **Goku API Gateway**
   - 使用Go构建的云原生架构微服务网关，具有高性能HTTP转发和动态路由等功能。

10. **Fusio**
    - 基于PHP的API管理解决方案，用于构建和管理REST API。

这些网关各有特点，选择时可以根据具体的技术栈、性能要求、功能需求以及社区支持等因素进行综合考虑。

开源网址：

1. **Spring Cloud Gateway**
   - 网址：[Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway/)

2. **Zuul**
   - 网址：[Netflix/zuul](https://github.com/Netflix/zuul)

3. **flying-fish-gateway**
   - 网址：[flying-fish-gateway](https://gitee.com/omsgit/flying-fish-gateway)

4. **Spring Cloud - Zuul**
   - 网址：[Spring Cloud - Zuul](https://blog.csdn.net/songjianlong/article/details/133267519)

请注意，给出的链接是直接从搜索结果中提取的，访问时请确保网络安全和项目的活跃度。

## chat 优秀的 Java 开源网关

以下是一些优秀的 Java 开源网关：

1. **Spring Cloud Gateway**：Spring Cloud Gateway 是一个基于 Spring Framework 5，Spring Boot 2 和 Project Reactor 的网关解决方案。它具有强大的路由和过滤功能，可用于构建高性能的微服务架构。

2. **Zuul**：Zuul 是 Netflix 开源的网关服务，也是 Spring Cloud 生态系统中的一部分。它可以用于动态路由、身份验证、压力测试、负载均衡等。

3. **Kong**：Kong 是一个可扩展的、分布式的 API 网关，它构建在 Nginx 之上，并以 Lua 编程语言进行扩展。Kong 提供了丰富的插件生态系统，可以灵活地满足各种 API 管理和网关需求。

4. **APIAxle**：APIAxle 是一个开源的 API 网关，它基于 Node.js 构建。它提供了许多功能，包括流量控制、缓存、监控和身份验证。

5. **Tyk**：Tyk 是一个轻量级的、高性能的 API 网关和管理平台，用于管理、监控和控制对 APIs 的访问。它支持多种协议和身份验证方法，提供了强大的路由和转换功能。

这些开源网关都具有不同的特点和优势，你可以根据自己的需求选择最适合的。

# 参考资料

https://github.com/search?q=%E7%BD%91%E5%85%B3+language%3AJava&type=repositories&p=1&l=Java

* any list
{:toc}