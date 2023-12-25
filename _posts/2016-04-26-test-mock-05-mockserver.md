---
layout: post
title: test mock-05-mockserver 
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [test, mock, sh]
published: true
---

# 拓展阅读

[test 之 jmockit-01-overview](https://houbb.github.io/2023/05/09/test-jmockit-01-overview)

[jmockit-01-test 之 jmockit 入门使用案例](https://houbb.github.io/2023/05/09/test-jmockit-00-intro)

[mockito-01-overview mockito 简介及入门使用](https://houbb.github.io/2023/05/09/test-mockito-01-overview)

[PowerMock](https://houbb.github.io/2017/10/27/powermock)

[Mock Server](https://houbb.github.io/2017/11/03/mock-server)

[ChaosBlade-01-测试混沌工程平台整体介绍](https://houbb.github.io/2023/08/08/jvm-chaosblade-01-overview)

[jvm-sandbox 入门简介](https://houbb.github.io/2020/06/04/jvm-sandbox-00-overview)

# MockServer

MockServer 能够通过 Java、JavaScript 和 Ruby 编写的客户端轻松模拟与其它系统通过 HTTP 或 HTTPS 进行集成的过程。

MockServer 还包括一个代理，可以检查所有被代理的流量，包括加密的 SSL 流量，并支持端口转发、Web 代理（即 HTTP 代理）、HTTPS 隧道代理（使用 HTTP CONNECT）等功能。

Maven Central 包含以下 MockServer 构件：

1. **mockserver-netty** - 一个模拟和记录请求与响应的 HTTP(S) Web 服务器
2. **mockserver-netty:shaded** - mockserver-netty（如上所述），带有所有嵌入的依赖项
3. **mockserver-war** - 一个可部署的 WAR 文件，用于模拟 HTTP(S) 响应（适用于任何 JEE Web 服务器）
4. **mockserver-proxy-war** - 一个可部署的 WAR 文件，用于记录请求和响应（适用于任何 JEE Web 服务器）
5. **mockserver-maven-plugin** - 一个 Maven 插件，用于使用 Maven 启动、停止和分叉 MockServer
6. **mockserver-client-java** - 一个用于与服务器和代理进行通信的 Java 客户端

## 是什么？

MockServer 是一个可通过 HTTP 或 HTTPS 与其集成的任何系统进行交互的工具，可以用作：

- 配置为为不同的请求返回特定的响应的模拟
- 记录并可选择修改请求和响应的代理
- 在同一时间对某些请求进行代理并对其他请求进行模拟

当 MockServer 收到请求时，它会将请求与已配置的活动期望进行匹配。

然后，如果找不到匹配项，它将根据需要代理请求；否则，将返回 404。

对于每个接收到的请求，会执行以下步骤：

1. 查找匹配的期望并执行操作
2. 如果没有匹配的期望，则代理请求
3. 如果不是代理请求，则返回 404

期望定义了要采取的操作，例如，可以返回一个响应。

MockServer 支持以下操作：

- 当请求匹配期望时，返回一个“模拟”响应

![mock-server](https://mock-server.com/images/expectation_response_action.png)





# 参考资料

https://github.com/mock-server/mockserver

https://mock-server.com/

* any list
{:toc}
