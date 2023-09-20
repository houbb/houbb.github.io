---
layout: post
title:  Serverless技术公开课（完）-25Serverless应用引擎产品的流量负载均衡和路由策略配置实践
date:   2015-01-01 23:20:27 +0800
categories: [Serverless技术公开课（完）]
tags: [Serverless技术公开课（完）, other]
published: true
---



25 Serverless 应用引擎产品的流量负载均衡和路由策略配置实践
### 流量管理从面向实例到面向应用

![image.png](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Serverless%20%e6%8a%80%e6%9c%af%e5%85%ac%e5%bc%80%e8%af%be%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-10-19-032124.png)

在 Serverless 场景下，由于弹性能力以及底层计算实例易变的特性，后端应用实例需要频繁上下线，传统的 ECS 场景下的负载均衡管理方式不再适用。

SAE 产品提供给用户面向应用的流量管理方式，不再需要关心弹性场景以及发布场景的实例上下线，仅仅需要关心监听的配置以及应用实例的健康检查探针，将面向实例的复杂配置工作交给 SAE 产品。

### 单应用的负载均衡配置

![image.png](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Serverless%20%e6%8a%80%e6%9c%af%e5%85%ac%e5%bc%80%e8%af%be%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-10-19-032125.png)

对于单个应用，SAE 产品支持将应用服务通过公网或私网 SLB 实例监听暴露，目前支持仅支持 TCP 协议。考虑到传统的 HTTP 类型应用存在 HTTPS 改造的需求，SAE 还支持配置 HTTPS 监听，让 HTTP 服务器无需修改就能够对外提供 HTTPS 服务。

公网 SLB 用于互联网客户端访问，会同时产生规格费与流量费用；私网 SLB 用于 VPC 内客户端访问，会产生规格费用。

为了让 SAE 产品能够准确控制实例上下线时机，用户需要在部署时正确地配置探针，避免业务出现损失。

### 多应用的路由策略配置

![image.png](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Serverless%20%e6%8a%80%e6%9c%af%e5%85%ac%e5%bc%80%e8%af%be%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-10-19-032127.png)

大中型企业在实践中，常常会将业务拆分成不同的应用或者服务，例如将登陆服务、账单服务等关联度较高的部分，单独拆分为应用，独立进行研发以及运维，再对外通过统一的网关服务进行暴露，对用户来说就像使用单体应用一样。

SAE 提供基于 SLB 实例的网关，将流量按照域名以及 HTTP Path 转发到不同的应用的实例上，从功能上对标业界的 Nginx 网关。

公网 SLB 实例实现的网关用于互联网客户端访问，会同时产生规格费与流量费用；私网 SLB 实例实现的网关用于 VPC 内客户端访问，会产生规格费用。

### 自建微服务网关

![image.png](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Serverless%20%e6%8a%80%e6%9c%af%e5%85%ac%e5%bc%80%e8%af%be%ef%bc%88%e5%ae%8c%ef%bc%89/assets/2020-10-19-032128.png)

对于微服务场景中常见的微服务网关，SAE 并没有提供产品化的支持，但用户依然可以自由发挥，在 SAE 中部署自建的微服务网关。

实践中，微服务网关也可以作为一个应用，部署到 SAE 中。微服务网关会根据用户自定义的配置，将业务流量转发到提供微服务的实例中。微服务网关作为应用，也是可以通过 SLB 实例对公网以及私网暴露服务。

### 结语

不管是传统的单应用场景，还是拆分后的多应用场景，以及现在比较流行的微服务场景，在流量管理以及路由策略上，SAE 产品都提供了完整的解决方案，依赖可靠的云产品提供基础网络设施，并尽可能地降低用户的使用成本。用户只需要极低的学习成本，即可在 SAE 控制台白屏化管理自己的流量，或者部署自建的网关应用。

### 实操演示

演示内容（点击可查看参考文档）：

* [实例健康检查配置](https://help.aliyun.com/document_detail/96713.html)
* [应用绑定 SLB 配置](https://help.aliyun.com/document_detail/113305.html)
* [网关路由配置](https://help.aliyun.com/document_detail/148129.html)

演示内容请点击视频课观看：[https://developer.aliyun.com/lesson/*2026/*19007](https://developer.aliyun.com/lesson_2026_19007)




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Serverless%20%e6%8a%80%e6%9c%af%e5%85%ac%e5%bc%80%e8%af%be%ef%bc%88%e5%ae%8c%ef%bc%89/25%20Serverless%20%e5%ba%94%e7%94%a8%e5%bc%95%e6%93%8e%e4%ba%a7%e5%93%81%e7%9a%84%e6%b5%81%e9%87%8f%e8%b4%9f%e8%bd%bd%e5%9d%87%e8%a1%a1%e5%92%8c%e8%b7%af%e7%94%b1%e7%ad%96%e7%95%a5%e9%85%8d%e7%bd%ae%e5%ae%9e%e8%b7%b5.md

* any list
{:toc}
