---
layout: post
title: SOFAMesh 介绍-01-overview
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, sofamesh, sh]
published: true
---


# SOFAMesh 介绍

该项目仓库已弃用。

该项目将直接向 Istio 贡献，不会继续在 fork 的仓库中开发，请转至 Istio 官网。

SOFAMesh 是基于 Istio 改进和扩展而来的 Service Mesh 大规模落地实践方案。

在继承 Istio 强大功能和丰富特性的基础上，为满足大规模部署下的性能要求以及应对落地实践中的实际情况，有如下改进：

- 采用 Golang 编写的 MOSN 取代 Envoy

- 合并 Mixer 到数据平面以解决性能瓶颈

- 增强 Pilot 以实现更灵活的服务发现机制

- 增加对 SOFA RPC、Dubbo 的支持

- 初始版本由蚂蚁金服和阿里大文娱UC事业部携手贡献。


下图展示了SOFAMesh 和 Istio 在架构上的不同：

![struct](https://www.sofastack.tech/projects/sofa-mesh/overview/sofa-mesh-arch.png)

# 主要组件

## MOSN

在 SOFAMesh 中，数据面我们采用 Golang 语言编写了名为 MOSN（Modular Open Smart Network）的模块来替代 Envoy 与 Istio 集成以实现 Sidecar 的功能，同时 MOSN 完全兼容 Envoy 的 API。

![MOSN](https://www.sofastack.tech/projects/sofa-mesh/overview/mosn-sofa-mesh-golang-sidecar.png)

## SOFA Pilot

SOFAMesh 中大幅扩展和增强 Istio 中的 Pilot 模块：

![SOFA Pilot](https://www.sofastack.tech/projects/sofa-mesh/overview/sofa-mesh-pilot.png)

- 增加 SOFA Registry 的 Adapter，提供超大规模服务注册和发现的解决方案

- 增加数据同步模块，以实现多个服务注册中心之间的数据交换

- 增加 Open Service Registry API，提供标准化的服务注册功能

MOSN 和 Pilot 配合，将可以提供让传统侵入式框架（如 Spring Cloud、Dubbo、SOFARPC 等）和 Service Mesh 产品可以相互通讯的功能，以便可以平滑的向 Service Mesh 产品演进和过渡。

# 参考资料

https://www.sofastack.tech/projects/sofa-lookout/overview/

* any list
{:toc}