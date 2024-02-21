---
layout: post
title: 分布式网关 mulesoft api gateway-01-overview
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, gateway-topic, sh]
published: true
---

# API 网关功能

Mule Runtime 包括一个嵌入式 API 网关。 

例如，使用这个网关，任何用户都可以在 Mule 应用程序之上应用基本身份验证策略，丰富传入/传出消息，或向 API 添加任何其他复杂功能，而无需编写任何代码。

总体而言，API Gateway 允许您在后端 API 和服务之上添加一个专用的编排层，以帮助您将编排与实现问题分开。 您可以利用 API Manager 的治理功能将限制、安全性、缓存和日志记录等功能应用到您的 API。

![API 网关功能](https://docs.mulesoft.com/api-manager/2.x/_images/apigateway.png)

# 安全 API 网关：它是什么以及它是如何工作的？

## 什么是安全 API 网关？

成功的数字化组织认识到，他们的 API 与更广泛的应用程序、开发人员、合作伙伴和客户体验生态系统的联系越多，其价值就会越增长。

但是，开放此值也可能导致开放新的安全漏洞。

每当组织允许对其 API 进行公共访问时，确保这些 API 得到适当保护并以最佳功能执行是至关重要的。

API 网关是现代架构中的常见组件，可帮助组织路由其 API 请求、聚合 API 响应，并通过速率限制等功能强制执行服务级别协议。

但 API 网关作为保护组织 API 的安全访问点也发挥着重要作用。 

API 网关实现了行业标准的加密和访问控制——为 API 开发人员提供了一种让人们进入并将他们引导到正确位置的方法。

网关指向您定义的后端 API 和服务，并将它们抽象为可由您的 API 管理解决方案监管的层。

# 个人感受

类似的框架可以有千万种，但是技术的本质却是类似的。

应该直接学习其原理，然后手写一个。

吸取各种框架的优势。

# 参考资料

https://docs.mulesoft.com/api-manager/2.x/api-gateway-capabilities-mule4

https://www.mulesoft.com/platform/api/flex-api-gateway

[google book](https://books.google.co.jp/books?id=q-pJDwAAQBAJ&pg=PT153&lpg=PT153&dq=mulesoft+%E7%BD%91%E5%85%B3&source=bl&ots=8ZnRz5faJn&sig=ACfU3U11mcrkh1N01AeD6mXwP7Uyf4EWAA&hl=zh-CN&sa=X&ved=2ahUKEwjL94zRkNn4AhWlUGwGHaMiBfgQ6AF6BAggEAM#v=onepage&q=mulesoft%20%E7%BD%91%E5%85%B3&f=false)

https://zhuanlan.zhihu.com/p/143472291

https://www.daimajiaoliu.com/daima/486f89fcf900414

https://blog.csdn.net/huyinabccc/article/details/119650087

* any list
{:toc}