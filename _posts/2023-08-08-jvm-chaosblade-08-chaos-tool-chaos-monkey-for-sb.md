---
layout: post
title: ChaosBlade-08-混沌工程开源工具 Chaos Monkey for Spring Boot
date:  2023-08-08 +0800
categories: [JVM]
tags: [jvm, bytebuddy, bytecode, chaos-engineering, sh]
published: true
---



# Chaos Monkey for Spring Boot

灵感来自 Netflix 的 Chaos Engineering

本项目提供了一个适用于 Spring Boot 应用程序的 Chaos Monkey，它会尝试攻击您正在运行的 Spring Boot 应用。

> 从入门到高级使用的所有内容，请参阅 [Chaos Monkey for Spring Boot 文档](https://codecentric.github.io/chaos-monkey-spring-boot/latest/)。

## 介绍

如果您还不熟悉 Chaos Engineering 的原理，可以查看这篇博客文章，了解 Chaos Engineering 的世界。

<a href="https://blog.codecentric.de/en/2018/07/chaos-engineering/" target="_blank"><img src="https://pbs.twimg.com/media/DhaRNO7XUAAi00i.jpg" 
alt="Chaos Engineering – 在生产环境中应对剧烈变化" width="260" height="155" border="10" /></a><br>

通过以下视频，了解 Chaos Monkey for Spring Boot，<a href="https://goo.gl/r2Tmig" target="_blank">可在 YouTube 上观看</a>：

<a href="https://goo.gl/r2Tmig" target="_blank"><img src="https://i.ytimg.com/vi/7sQiIR9qCdA/maxresdefault.jpg" 
alt="Chaos Monkey for Spring Boot" width="260" height="155" border="10" /></a><br>

## Chaos Monkey 的目标是什么？

受 [CHAOS ENGINEERING 原则](https://principlesofchaos.org/) 的启发，特别关注 [Spring Boot](https://projects.spring.io/spring-boot/)，Chaos Monkey 旨在更好地测试应用，特别是在运行期间。

在编写了许多单元测试和集成测试，代码覆盖率达到 70% 到 80% 后，仍然有一个不安的感觉：我们的应用在生产环境中会表现如何？

仍然有许多问题未解答：

- 我们的后备机制是否有效？
- 应用在网络延迟下表现如何？
- 如果我们的某个服务崩溃怎么办？
- 服务发现正常，但我们的客户端负载均衡是否也能正常工作？

如您所见，问题远不止这些，还有许多未解答的问题和需要处理的主题。

这就是 Chaos Monkey for Spring Boot 的起点。

### 它是如何工作的？
如果 Spring Boot Chaos Monkey 已经添加到您的类路径中，并且通过 `chaos-monkey` 配置文件名激活，它将自动接入您的应用。

现在，您可以激活 [监视器](https://codecentric.github.io/chaos-monkey-spring-boot/latest/#watchers)，这些监视器会查找需要[攻击](https://codecentric.github.io/chaos-monkey-spring-boot/latest/#assaults)的类。还有一些 [运行时攻击](https://codecentric.github.io/chaos-monkey-spring-boot/latest/#runtime-assaults)，它们会攻击整个应用。

<p align="center">
  <img class="imgborder s1" width="90%" src="docs/images/sb-chaos-monkey-architecture.png">
</p>

## 做一个社交且善于沟通的人！
如果您开始在公司实施 Chaos Engineering，那么您一定是一个非常社交且善于沟通的人。为什么？因为当您的混乱实验开始作用时，您会在非常短的时间内认识到许多同事。

### 检查您的韧性
您的服务是否已经具有韧性，能够处理故障？如果没有，请不要开始混乱实验！

### 实施主动的应用监控
检查您的监控系统，确认是否可以查看到系统的整体状态。市场上有很多很棒的工具，可以帮助您对整个系统的状态有一个清晰的了解。

### 定义稳态
定义一个指标来检查服务以及整个系统的稳态。从一个非关键的服务开始。

### 不要在生产环境中启动
当然，您可以在生产环境中启动，但请记住...

> 最好的地方是...生产环境！<br>
> *Josh Long*

...因此，让我们保持生产环境作为地球上最好的地方，先在其他环境中体验一下。如果一切顺利，并且您有信心，可以在生产环境中运行。

## 文档
[文档](https://codecentric.github.io/chaos-monkey-spring-boot/latest/)

## 帮助

我们使用 GitHub 问题来跟踪 bug、改进和新特性（有关更多信息，请参见 [贡献](#contributions)）。如果您有关于如何使用 Chaos Monkey for Spring Boot 的一般问题，请在 Stack Overflow 上提问，并使用标签 [`#spring-boot-chaos-monkey`](https://stackoverflow.com/questions/tagged/spring-boot-chaos-monkey)。

## 贡献
Chaos Monkey 是开源的，欢迎所有人贡献。有关如何贡献的详细说明，请参考 [贡献指南](https://github.com/codecentric/chaos-monkey-spring-boot/blob/main/CONTRIBUTING.adoc)。

## 版本发布
[版本发布](https://github.com/codecentric/chaos-monkey-spring-boot/releases)



------------------------------

# chat

## 介绍一下 JChaosMonkey

JChaosMonkey 是一个用于模拟故障的工具，通常用于微服务架构中，以测试系统在出现故障时的恢复能力和容错性。

它是基于“Chaos Engineering”原则的，这一原则的目标是通过故意引入问题来验证系统在真实故障情况下的表现，并确保系统具备自我修复的能力。

JChaosMonkey 主要用于模拟各种故障场景，如服务中断、网络延迟、CPU 或内存压力等，从而帮助开发人员或运维人员更好地理解和改进系统的可靠性。

### 主要特性

1. **故障注入**：
   - 模拟各种故障类型，如停止服务、延迟响应、内存泄漏等，查看系统如何应对。
   
2. **微服务架构支持**：
   - 特别适用于微服务架构中的服务健康检查和自恢复机制测试。
   
3. **定时和随机性**：
   - 可以定时触发故障，或者随机地在系统中引入问题。
   
4. **可扩展性**：
   - 可以通过配置或代码扩展，以适应不同的故障类型和场景。
   
5. **与 CI/CD 集成**：
   - 可以在持续集成和持续部署管道中使用，以确保新发布的版本能够在面对故障时保持稳定。

### 工作原理

JChaosMonkey 通过将故障注入到系统中的各个组件或服务中，模拟系统在极端情况中的表现。

故障可以是短暂的（如瞬间断开网络连接）或者持久的（如持续的服务宕机）。模拟故障后，它通常会观察系统如何恢复，比如自动重启服务、进行备份恢复等。

### 常见的故障场景

1. **服务宕机**：
   - 模拟某个服务的宕机，看看其他依赖该服务的组件是否能正确处理这个故障并继续工作。
   
2. **延迟和丢包**：
   - 模拟网络延迟或丢包，查看系统是否能够容忍网络的不稳定，尤其是在分布式系统中。
   
3. **资源压力**：
   - 模拟高 CPU 使用率、内存泄漏等情况，测试系统在资源紧张时的表现。
   
4. **数据库故障**：
   - 模拟数据库不可用或查询延迟等问题，测试数据库连接池和缓存机制的容错性。

5. **磁盘故障**：
   - 模拟磁盘故障或文件系统错误，测试系统如何处理存储相关的问题。

### 使用场景

- **微服务故障测试**：JChaosMonkey 可以在微服务架构中模拟服务故障，帮助团队验证服务间的容错能力和恢复能力。
- **容器化环境**：在 Docker、Kubernetes 等容器环境中，JChaosMonkey 可以注入故障来验证服务的弹性。
- **灾难恢复验证**：确保系统在发生灾难时，能够快速恢复，减少停机时间。
- **性能和负载测试**：通过模拟高负载或资源压力，测试系统在高压情况下的稳定性。

### 配置和使用

JChaosMonkey 的配置一般比较简单，可以通过添加相关依赖或直接集成到现有的微服务框架中（如 Spring Boot）。基本配置通常包括：

- 选择故障类型（如服务宕机、延迟、资源耗尽等）。
- 配置故障触发的条件和频率。
- 配置故障注入的服务或组件。
- 定义故障恢复策略。

JChaosMonkey 可以与监控工具（如 Prometheus、Grafana 等）结合使用，以便实时监控系统健康状况，并验证故障注入后的系统反应。

### 示例

在一个基于 Spring Boot 的项目中集成 JChaosMonkey，通常的做法是添加相关依赖并配置故障注入：

```xml
<dependency>
    <groupId>com.github.tomakehurst</groupId>
    <artifactId>chaos-monkey-spring-boot</artifactId>
    <version>1.0.0</version>
</dependency>
```

配置文件中，可以定义故障的类型和触发方式：

```yaml
chaosmonkey:
  enabled: true
  interval: 10000  # 每10秒触发一次故障
  failures:
    - type: "service"
      name: "myService"
      action: "shutdown"
    - type: "network"
      name: "delayedResponse"
      action: "injectDelay"
```

### 总结

JChaosMonkey 是一种很好的工具，用于验证和提高系统的健壮性。通过模拟各种故障，它可以帮助开发和运维团队提前发现潜在的弱点，并及时修复，以确保在真实故障发生时，系统能够自动恢复并保持可用性。


# 参考资料

https://chaosblade.io/docs

* any list
{:toc}