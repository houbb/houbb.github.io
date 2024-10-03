---
layout: post
title:  高可用开源库之 Hystrix-02-聊一聊
date: 2018-12-23 13:55:13 +0800
categories: [Distributed]
tags: [distributed, ha, sh]
published: true
---

# chat

## 详细介绍一下 Hystrix？ what

Hystrix是一个由Netflix开发并开源的延迟和容错库，用于解决分布式系统中服务调用的延迟问题和防止服务故障的蔓延。

它通过实现断路器模式（Circuit Breaker Pattern）来防止分布式系统中某个服务的故障对整体系统性能造成的影响。

Hystrix的主要作用包括故障隔离、服务降级、超时控制和熔断机制，以及提供丰富的监控和度量功能。

### Hystrix的主要功能：

1. **服务降级**：当某个服务不可用时，Hystrix可以提供备选方案，如返回默认值或缓存的数据，保证系统的可用性。
2. **服务熔断**：当服务调用出错率达到一定阈值时，熔断器会“跳闸”，后续的调用会被快速失败，不会执行实际的服务调用，从而避免系统资源的浪费和故障的蔓延。
3. **资源隔离**：Hystrix通过线程池和信号量来隔离资源，确保关键任务的执行不会因为其他任务的故障而受到影响。
4. **监控和指标**：Hystrix提供了丰富的监控和度量功能，包括每秒执行请求的数量、成功请求的数量和失败请求的数量等，这些信息可以通过Hystrix Dashboard实时监控。

### Hystrix的使用：

1. **添加依赖**：在项目的`pom.xml`文件中添加Hystrix依赖。
2. **启用断路器**：在Spring Boot应用的启动类上添加`@EnableCircuitBreaker`注解。
3. **配置超时时间**：通过设置`hystrix.command.default.execution.isolation.thread.timeoutInMilliseconds`属性来配置Hystrix断路器的超时时间。
4. **服务降级方法**：在需要进行容错处理的方法上，添加`@HystrixCommand`注解，并指定`fallbackMethod`属性，以指定故障发生时调用的备选方法。

### Hystrix服务熔断的实现：

Hystrix通过监控微服务间调用的状况，当失败调用达到一定比例时，就会启动熔断机制。熔断机制的步骤包括：
1. 调用出错率达到或超过规定比率（默认为50%），熔断器进入熔断开启状态。
2. 熔断器开启后，启动一个休眠时间窗，在这段时间内，服务的降级逻辑会临时充当业务主逻辑。
3. 熔断器进入半熔断状态，允许部分请求调用服务原来的主业务逻辑，并监控其调用成功率。
4. 如果调用成功率达到预期，服务恢复正常；否则，熔断器重新进入熔断开启状态。

### Hystrix Dashboard：

Hystrix Dashboard是一个监控工具，可以实时显示Hystrix的监控数据。通过配置`HystrixMetricsStreamServlet`和`@EnableHystrixDashboard`注解，可以集成Hystrix Dashboard到Spring Boot应用中。监控数据可以通过访问`/actuator/hystrix.stream`端点获取。

Hystrix虽然功能强大，但已经停止维护，对于需要更先进容错技术的场景，可以考虑使用Resilience4j等其他库。

## 为什么需要 Hystrix? 解决了什么问题？  why

Hystrix 是一个由 Netflix 开发的开源库，用于在分布式系统中实现延迟和容错管理。

它通过引入断路器模式来防止某个服务的故障对整体系统性能造成的影响，从而提高系统的弹性和稳定性。

**为什么需要 Hystrix?**

1. **防止系统雪崩**：在分布式系统中，服务间相互依赖，一个服务的失败可能会导致级联故障，最终影响整个系统。Hystrix 通过断路器模式，当服务调用失败率达到一定阈值时，断路器会“跳闸”，阻止后续请求继续调用该服务，从而避免系统资源的耗尽和故障的蔓延。

2. **服务降级**：当服务不可用时，Hystrix 允许定义降级逻辑，如返回默认值或缓存的数据，以保证系统的可用性。

3. **资源隔离**：Hystrix 通过线程池和信号量来隔离资源，确保关键任务的执行不会因为其他任务的故障而受到影响。

4. **监控和度量**：Hystrix 提供了丰富的监控和度量功能，包括每秒执行请求的数量、成功请求的数量和失败请求的数量等，这些信息可以通过 Hystrix Dashboard 实时监控。

**Hystrix 解决了什么问题？**

1. **服务调用延迟**：在分布式系统中，网络延迟是不可避免的。Hystrix 通过线程池隔离和超时设置，可以控制服务调用的延迟。

2. **级联故障**：当一个服务失败时，如果没有适当的容错机制，可能会导致依赖它的其他服务也失败，最终导致整个系统的崩溃。Hystrix 的断路器模式可以防止这种级联故障。

3. **资源争用**：在高并发系统中，资源（如线程、内存）可能会被某个服务过度使用，影响其他服务。Hystrix 通过资源隔离机制，限制单个服务对资源的使用。

4. **服务不可用时的用户体验**：Hystrix 允许在服务不可用时提供备选方案，如返回友好的错误信息或使用缓存数据，以改善用户体验。

5. **系统健康状况监控**：Hystrix 提供了实时监控功能，帮助开发者和运维团队了解系统的健康状况，及时发现和处理故障。

Hystrix 通过这些机制，确保了分布式系统在面对服务故障和延迟时的健壮性和弹性。


## Hystrix 有哪些优缺点？适合的场景  when/where?

**Hystrix 的优点：**

1. **服务降级**：Hystrix 能够在服务调用失败或超时时提供服务降级（Fallback）策略，以保证系统的可用性。
2. **服务熔断**：Hystrix 提供了强大的熔断器功能，能够防止某个服务的故障蔓延到整个系统。
3. **资源隔离**：Hystrix 通过线程池和信号量隔离服务调用，防止资源争用问题。
4. **实时监控**：Hystrix 提供了实时的监控和统计功能，包括请求成功率、失败率、响应时间等，有助于及时发现和处理问题。
5. **易于集成**：Hystrix 与 Spring Cloud 生态系统集成良好，简化了在微服务架构中的使用。

**Hystrix 的缺点：**

1. **性能开销**：Hystrix 的线程池隔离机制虽然提供了强大的隔离能力，但也带来了额外的性能开销。
2. **学习曲线**：Hystrix 的概念和配置相对复杂，需要开发者投入一定的学习成本。
3. **项目停更**：Hystrix 已经进入维护模式，Netflix 不再进行新的开发，社区可能需要寻找替代方案。

**Hystrix 适合的场景：**

1. **分布式系统**：Hystrix 适合于分布式系统中服务间的调用，特别是当系统中服务众多，服务依赖关系复杂时。
2. **高并发系统**：在高并发场景下，Hystrix 能够通过资源隔离和熔断机制，保护系统不受单点故障的影响。
3. **对稳定性要求高**：对于需要高稳定性的系统，Hystrix 通过熔断和降级策略，提高系统的容错能力。
4. **需要实时监控**：对于需要实时监控服务健康状况的系统，Hystrix 提供的监控指标非常有用。

总的来说，Hystrix 是一个强大的服务容错管理工具，尽管它已经停止更新，但它的核心理念和设计模式在现代微服务架构中仍然具有重要的指导意义。


## 详细介绍一下 Hystrix 的核心概念 what

Hystrix 的核心概念主要围绕以下几个方面：

1. **断路器模式（Circuit Breaker Pattern）**：Hystrix 使用断路器模式来防止分布式系统中某个服务的故障对整体系统性能造成的影响。当服务调用失败率达到一定阈值时，断路器会“跳闸”，后续的调用会被快速失败，不会执行实际的服务调用，从而避免系统资源的浪费和故障的蔓延。

2. **服务降级（Fallback）**：当服务不可用时，Hystrix 允许定义降级逻辑，如返回默认值或缓存的数据，以保证系统的可用性。

3. **资源隔离**：Hystrix 通过线程池和信号量来隔离资源，确保关键任务的执行不会因为其他任务的故障而受到影响。线程池隔离适用于大多数场景，特别是对依赖服务的网络调用timeout的情况。信号量隔离则适用于无网络请求或请求快速返回的场景。

4. **监控和度量**：Hystrix 提供了丰富的监控和度量功能，包括每秒执行请求的数量、成功请求的数量和失败请求的数量等，这些信息可以通过 Hystrix Dashboard 实时监控。

5. **熔断机制**：Hystrix 通过熔断机制来避免某个服务的故障蔓延到整个系统。当扇出链路的某个微服务出错不可用或者响应时间太长时，会进行服务降级，进而熔断该节点微服务的调用，快速返回错误的响应信息。当检测到该节点微服务调用响应正常后，恢复调用链路。

6. **请求缓存**：Hystrix 支持请求结果缓存，避免对同一服务的重复请求。

7. **批量请求**：Hystrix 支持合并多个相同请求为批量请求，减少网络开销和依赖服务压力。

Hystrix 的这些核心概念共同作用，确保了分布式系统在面对服务故障和延迟时的健壮性和弹性。


## 如何使用 Hystrix？给出入门例子 how?

要使用 Hystrix，你需要遵循以下基本步骤：

1. **添加依赖**：在你的项目中添加 Hystrix 的依赖项。如果你使用的是 Spring Cloud，你可以添加 `spring-cloud-starter-netflix-hystrix` 依赖。

2. **启用 Hystrix**：在你的 Spring Boot 应用的主类上添加 `@EnableCircuitBreaker` 注解来启用 Hystrix 断路器。

3. **创建命令**：创建一个命令类继承 `HystrixCommand` 或者 `HystrixObservableCommand`，在这个类中实现你的业务逻辑。

4. **执行命令**：在你的服务或控制器中执行命令。

下面是一个简单的入门示例：

**步骤 1：添加依赖**

在 Maven 的 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
    <version>你的Spring Cloud版本</version>
</dependency>
```

**步骤 2：启用 Hystrix**

在 Spring Boot 应用的主类上添加 `@EnableCircuitBreaker` 注解：

```java
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableCircuitBreaker
@SpringBootApplication
public class HystrixApplication {
    public static void main(String[] args) {
        SpringApplication.run(HystrixApplication.class, args);
    }
}
```

**步骤 3：创建命令**

创建一个命令类，继承 `HystrixCommand`：

```java
import com.netflix.hystrix.HystrixCommand;
import com.netflix.hystrix.HystrixCommandGroupKey;
import com.netflix.hystrix.HystrixCommandProperties;

public class HelloCommand extends HystrixCommand<String> {

    private final String name;

    public HelloCommand(String name) {
        super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("ExampleGroup"))
            .andCommandPropertiesDefaults(HystrixCommandProperties.Setter()
                .withExecutionTimeoutInMilliseconds(1500)));
        this.name = name;
    }

    @Override
    protected String run() throws Exception {
        // 模拟业务逻辑
        return "Hello, " + name + "!";
    }

    @Override
    protected String getFallback() {
        // 服务降级逻辑
        return "Hello, Stranger!";
    }
}
```

**步骤 4：执行命令**

在你的服务或控制器中执行命令：

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello(@RequestParam String name) {
        HelloCommand command = new HelloCommand(name);
        return command.execute();
    }
}
```

在这个例子中，当用户访问 `/hello` 端点时，将会执行 `HelloCommand` 命令。如果命令执行成功，它将返回 "Hello, [name]!"。如果命令执行失败或超时，它将返回 "Hello, Stranger!" 作为降级逻辑。

请注意，这个例子假设你已经有了一定的 Spring Boot 和 Spring Cloud 基础知识。如果你还没有，你需要先了解如何设置和运行 Spring Boot 应用，以及如何使用 Spring Cloud 进行微服务架构。


## Hystrix 使用的最佳实践 best-practice

使用 Hystrix 的最佳实践包括以下几个方面：

1. **容错能力和稳定性**：在服务层避免直接调用远程服务，尽量在数据访问层（DAO层）或专门的远程服务调用层中进行远程服务调用，以保持服务层的清晰和职责单一。合理设置超时时间和请求量阈值，根据服务的实际情况调整 Hystrix 的配置参数，以避免不必要的熔断和过多的后备方法调用。确保你的后备逻辑能够正确处理服务调用失败的情况，并且不会对系统造成额外的负担 。

2. **集成到微服务架构**：在微服务架构中，服务之间的调用是常态，而每个服务都可能面临网络延迟、服务不可用等问题。Hystrix 作为一个延迟和容错库，非常适合集成到微服务架构中，以增强系统的稳定性和可靠性。服务消费者集成：在每个微服务中，作为服务消费者的部分应该集成 Hystrix，对外部依赖进行封装和保护。使用 `@HystrixCommand` 注解或继承 `HystrixCommand` 类来定义服务调用的容错逻辑 。

3. **使用请求缓存**：Hystrix 支持请求缓存，这可以减少对相同请求的重复处理，提高系统性能。通过配置 Hystrix 的缓存策略，可以将某些请求的结果缓存起来，以便在后续请求中直接返回结果，而无需再次进行远程服务调用 。

4. **线程隔离**：Hystrix 通过线程隔离来防止单个服务的失败导致整个系统的级联失败。每个 Hystrix 命令都在一个单独的线程中执行，即使某个命令因为外部服务调用失败而阻塞，也不会影响到其他命令的执行。可以通过配置 Hystrix 的线程池属性来控制线程池的大小、队列长度等，以适应不同的服务调用需求 。

5. **性能调优**：在某些情况下，将多个小请求合并为一个批量请求可以减少网络开销和响应时间。Hystrix 允许你自定义命令来支持批量请求。根据服务调用的实际情况，合理调整 Hystrix 的超时时间，避免过长的等待时间导致资源浪费或系统响应变慢。监控 Hystrix 的线程池和请求队列的使用情况，根据系统负载调整资源分配，以优化系统性能 。

6. **持续改进和反馈循环**：建立有效的监控和警报机制，及时发现系统中的问题，并采取措施进行修复。记录详细的日志信息，包括服务调用的成功、失败、超时等情况，以便进行问题分析和性能调优。定期审查 Hystrix 的配置和使用情况，根据业务变化和系统负载调整配置，以保持系统的最佳状态 。

通过遵循这些最佳实践和使用策略，你可以更好地利用 Hystrix 来增强你的微服务架构的稳定性和可靠性。

同时，保持对系统性能和资源使用的监控，并不断优化和调整配置，以确保系统能够持续高效地运行。

## 还有哪些类似于 Hystrix 的开源库？ others?

以下是一些类似于 Hystrix 的开源库及其网址：

1. **Sentinel**：由阿里巴巴开源，提供流量控制、熔断降级、系统负载保护等。[Sentinel GitHub](https://github.com/alibaba/Sentinel)

2. **Resilience4j**：一个轻量级的容错库，提供了熔断、重试、限流、超时等功能。[Resilience4j 教程](https://springdoc.cn/spring-boot-resilience4j/) 

3. **Netflix Concurrency Utilities for Java**：由 Netflix 开发，用于管理和限制并发请求。[Concurrency Utilities GitHub](https://hellogithub.com/repository/6475eb60de084630ba0657820d68cb39) 

4. **Turbine**：由 Netflix 开发，用于聚合服务器发送事件流数据的工具。[Turbine GitHub](https://github.com/Netflix/Turbine)

5. **Google Guava's RateLimiter**：Guava库中的限流组件，基于令牌桶算法实现。[Guava RateLimiter 教程](https://cloud.tencent.com/developer/article/2398554) 

6. **Failsafe**：一个轻量级且零依赖的Java库，用于处理执行过程中的失败情况。[Failsafe 使用指南](https://www.oldliew.com/post/failsafe-%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97/) 

7. **Async++**：C++11并行编程库，提供类似于 C++11 标准库的并行算法和任务。[Async++ GitHub](https://gitcode.com/gh_mirrors/as/asyncplusplus) 

8. **Spring Cloud Circuit Breaker**：Spring Cloud提供的断路器抽象，支持Resilience4j和Spring Retry的实现。[Spring Cloud Circuit Breaker 中文文档](https://springdoc.cn/spring-cloud-circuitbreaker/) 


# 替代方案

[resilience4j](https://houbb.github.io/2018/11/28/resilience4j)

* any list
{:toc}
