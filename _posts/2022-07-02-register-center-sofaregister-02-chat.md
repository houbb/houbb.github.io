---
layout: post
title:  分布式注册中心 SOFARegistry 02 聊一聊
date:  2022-07-02 09:22:02 +0800
categories: [Distributed]
tags: [distributed, register-center, sofa, sh]
published: true
---


# chat

## 详细介绍下注册中心 SOFARegistry

SOFARegistry 是阿里巴巴开源的一款高性能注册中心，旨在支持分布式服务的注册与发现。

它是 SOFA (Service-Oriented Framework Architecture) 生态系统的一部分，能够为微服务架构提供服务治理能力。

以下是 SOFARegistry 的一些关键特性和功能：

### 1. **高性能和高可用性**
SOFARegistry 采用高性能的架构设计，支持高并发的注册和发现请求。通过分布式架构，提供高可用性，确保服务在故障情况下能够快速恢复。

### 2. **多种协议支持**
SOFARegistry 支持多种服务注册和发现协议，包括 HTTP、Dubbo、gRPC 等，使其能够与多种不同的服务框架兼容。

### 3. **灵活的扩展性**
SOFARegistry 提供丰富的插件机制，可以根据需要扩展其功能。用户可以根据具体场景需求，自定义注册中心的逻辑和功能。

### 4. **一致性和可靠性**
SOFARegistry 在数据一致性上采用了强一致性的方案，确保服务注册和发现过程中的数据一致性。它通过强一致性协议（如 Zookeeper）来保障数据的可靠性和稳定性。

### 5. **丰富的监控和管理功能**
SOFARegistry 提供完善的监控和管理功能，用户可以通过可视化界面查看服务状态、调用链路等信息，及时发现和处理潜在问题。

### 6. **多种部署模式**
支持多种部署模式，包括单节点模式和集群模式，用户可以根据实际需求选择合适的部署方案。

### 7. **动态服务治理**
SOFARegistry 提供动态服务治理功能，支持服务的动态路由、负载均衡等，能够根据实时流量和服务状态调整服务策略。

### 8. **集成与兼容性**
SOFARegistry 可以与阿里巴巴的其他开源项目（如 SOFABoot、SOFARPC 等）无缝集成，提供完整的微服务解决方案。

### 9. **开源与社区支持**
作为开源项目，SOFARegistry 拥有活跃的社区支持，用户可以获取最新的更新和社区资源，方便解决使用过程中遇到的问题。

### 使用场景
- **微服务架构**：在微服务架构中，服务之间的动态注册和发现是非常重要的，SOFARegistry 可以很好地满足这一需求。
- **异构环境**：支持多种协议，可以在不同的服务框架和技术栈中使用。
- **高并发场景**：适合需要处理大量并发请求的场景，如电商、社交等领域。

### 结论
SOFARegistry 是一款功能强大且灵活的注册中心，适用于多种分布式服务场景。通过其高性能、高可用性和丰富的管理功能，帮助开发者更高效地构建和管理微服务架构。

## SOFARegistry 相比其他注册中心有哪些优点?

SOFARegistry 相比其他注册中心（如 Eureka、Zookeeper、Consul 和 Etcd）具有以下优点：

### 1. **高性能**
- **高并发处理能力**：SOFARegistry 经过优化，能够处理高并发的注册和发现请求，适合大规模分布式系统。
- **低延迟**：响应时间快，能够快速返回服务注册和发现的结果，提升整体系统的性能。

### 2. **强一致性**
- **数据一致性保障**：SOFARegistry 使用强一致性协议（如 Zookeeper），确保服务注册和发现过程中数据的一致性，避免因数据不一致导致的服务故障。

### 3. **多协议支持**
- **支持多种服务框架**：SOFARegistry 支持 Dubbo、gRPC、HTTP 等多种协议，使其能够与不同的微服务框架和技术栈无缝集成，提供灵活的服务治理能力。

### 4. **灵活的扩展性**
- **插件机制**：提供丰富的插件机制，允许用户根据需求自定义功能，灵活适应各种场景。

### 5. **动态服务治理**
- **动态路由与负载均衡**：支持动态服务治理功能，能够根据实时流量和服务状态调整服务策略，提高系统的灵活性和可维护性。

### 6. **可视化监控**
- **完善的监控和管理**：提供友好的管理界面和丰富的监控指标，便于开发者实时查看服务状态、调用链路和性能指标，及时发现和处理潜在问题。

### 7. **社区与生态支持**
- **强大的社区支持**：作为阿里巴巴的开源项目，SOFARegistry 拥有活跃的开发者社区，用户可以获取及时的支持和更新，享受丰富的文档和资源。

### 8. **多种部署模式**
- **灵活的部署选项**：支持单节点和集群模式，可以根据实际需求选择合适的部署方式，适应不同规模的应用场景。

### 9. **安全性**
- **数据安全保障**：提供多种安全机制，包括身份验证、访问控制等，保障服务注册和发现的安全性。

### 10. **高可用性**
- **分布式架构**：通过集群部署和故障转移机制，SOFARegistry 能够保证高可用性，即使在部分节点故障的情况下，也能继续提供服务。

### 结论
SOFARegistry 在性能、一致性、灵活性、动态治理和监控管理等方面具有明显的优势，适用于大规模、高并发的微服务架构。

它的多协议支持和灵活的扩展性，使其能够适应不同的业务需求，是一个值得考虑的注册中心选择。

## SOFARegistry 的核心概念？

SOFARegistry 的核心概念包括以下几个重要组成部分，帮助用户理解其设计理念和功能：

### 1. **服务注册**
- **注册中心**：SOFARegistry 作为服务注册中心，提供服务提供者（服务生产者）将其服务实例注册到中心的功能。服务注册信息通常包括服务名称、服务地址、端口、版本号、权重等。

### 2. **服务发现**
- **动态发现**：服务消费者可以通过 SOFARegistry 动态发现可用的服务实例。消费者根据服务名称查询注册中心，获取相应服务的实例信息。

### 3. **服务健康检查**
- **健康监测**：SOFARegistry 提供服务健康检查机制，通过定期检查服务实例的健康状态，确保消费者只会获取到正常工作的服务实例。这有助于提高系统的可靠性。

### 4. **服务治理**
- **动态路由和负载均衡**：SOFARegistry 支持服务治理功能，包括动态路由、负载均衡和流量控制等。根据实时流量和实例状态，调整请求的路由策略，提高系统性能。

### 5. **集群管理**
- **集群部署**：SOFARegistry 支持集群部署，能够管理多个注册中心实例，提供高可用性和负载均衡。通过集群管理，提升系统的扩展性和容错能力。

### 6. **协议支持**
- **多协议支持**：SOFARegistry 支持多种协议，包括 Dubbo、gRPC、HTTP 等，使其能够与不同的微服务框架兼容，灵活应对不同的业务需求。

### 7. **监控与管理**
- **可视化界面**：提供友好的管理界面和丰富的监控指标，帮助用户实时查看服务状态、性能指标和调用链路，便于问题排查和性能优化。

### 8. **插件机制**
- **灵活扩展**：SOFARegistry 提供插件机制，用户可以根据需求扩展功能，灵活适应特定场景，增强系统的可定制性。

### 9. **配置管理**
- **动态配置**：SOFARegistry 提供服务配置管理能力，允许用户动态管理和更新服务的配置信息，方便进行版本控制和变更管理。

### 10. **安全性**
- **访问控制与身份验证**：SOFARegistry 具备安全机制，支持身份验证和访问控制，确保只有授权的服务可以注册和发现，提高系统的安全性。

### 结论
SOFARegistry 的核心概念围绕着服务注册、发现、治理和管理展开，通过健康检查、负载均衡、监控和扩展机制，提供全面的服务治理能力，帮助开发者高效地管理微服务架构。

理解这些核心概念有助于更好地利用 SOFARegistry 进行服务治理和管理。

## SOFARegistry 的核心实现原理是什么？结合源码

SOFARegistry 的核心实现原理主要围绕服务注册、服务发现、健康检查、动态治理以及配置管理等功能展开。下面是 SOFARegistry 的一些核心实现原理的详细介绍，并结合源码分析。

### 1. **服务注册**
在 SOFARegistry 中，服务提供者将其服务注册到注册中心。服务注册的核心逻辑通常在 `RegistryService` 接口及其实现类中。关键流程如下：

- **注册请求**：服务提供者通过调用 `register` 方法发送注册请求，将服务实例信息（如服务名称、地址、版本等）注册到 SOFARegistry。
- **数据存储**：注册信息会存储在注册中心的存储系统中，通常使用内存或持久化存储。

```java
public void register(Service service) {
    // 创建注册请求
    RegisterRequest request = new RegisterRequest(service);
    // 调用存储逻辑
    storage.addService(service);
}
```

### 2. **服务发现**
SOFARegistry 通过 `DiscoveryService` 接口提供服务发现功能。消费者通过调用 `lookup` 方法查询服务的实例列表。

- **服务查询**：消费者发起服务查询，SOFARegistry 返回当前可用的服务实例列表。
- **负载均衡**：可以通过配置负载均衡策略（如轮询、随机等）来选择具体的服务实例。

```java
public List<Service> lookup(String serviceName) {
    // 查询服务实例
    return storage.getServiceInstances(serviceName);
}
```

### 3. **健康检查**
健康检查是确保消费者只访问可用服务实例的重要机制。SOFARegistry 定期对注册的服务实例进行健康检查，通常通过一个独立的调度线程实现。

- **健康状态更新**：定期检查服务实例的状态，并更新其健康状态，确保只有健康的服务实例可以被发现。

```java
public void healthCheck() {
    // 遍历所有注册的服务实例
    for (ServiceInstance instance : instances) {
        if (!isHealthy(instance)) {
            // 更新健康状态
            instance.setHealthy(false);
        }
    }
}
```

### 4. **动态治理**
动态路由和负载均衡功能使得 SOFARegistry 能够根据实时流量和实例状态调整服务策略。

- **路由策略**：支持多种路由策略（如权重路由、随机路由），根据配置动态调整请求分发。

```java
public ServiceInstance selectInstance(List<ServiceInstance> instances) {
    // 根据路由策略选择实例
    return loadBalancer.choose(instances);
}
```

### 5. **配置管理**
SOFARegistry 提供服务配置的管理功能，允许动态更新和管理服务的配置信息。

- **配置存储**：配置数据存储在注册中心，支持动态更新和获取。

```java
public void updateConfig(String serviceName, Config config) {
    // 更新服务配置
    configurationStore.update(serviceName, config);
}
```

### 6. **源码结构**
SOFARegistry 的源码结构通常包括以下模块：

- **core**：核心模块，包括注册、发现、健康检查等逻辑。
- **storage**：存储模块，负责持久化存储服务注册信息。
- **protocol**：协议模块，支持多种服务注册与发现协议的实现。
- **monitor**：监控模块，提供服务状态和性能指标的监控。

### 结论
SOFARegistry 的核心实现原理围绕服务注册、发现、健康检查和动态治理展开，通过清晰的接口设计和模块化的架构，提供高性能的服务治理能力。

结合源码分析，可以更深入地理解其工作原理及设计思想。要深入理解具体实现，建议查看 [SOFARegistry 的 GitHub 仓库](https://github.com/sofastack/sofa-registry) 中的相关代码，获取更多实现细节和示例。

## SOFARegistry 的使用最佳实践

在实际使用 SOFARegistry 时，遵循一些最佳实践可以帮助更好地利用其高性能和高可用的特性，并确保系统的稳定性和可维护性。以下是 SOFARegistry 的使用最佳实践：

### 1. **合理配置服务注册和发现**
#### a. **服务注册信息**
- **尽量减少频繁注册/取消注册操作**：在大规模微服务系统中，频繁的注册和取消注册操作会增加注册中心的负担，建议尽量稳定服务实例的生命周期。
- **服务注册时设置合理的元数据**：包括服务的名称、版本、权重、实例IP、端口等。这些元数据可以在后续的服务治理中起到重要作用。

#### b. **服务发现优化**
- **缓存服务发现结果**：对于消费者应用，服务发现不宜频繁请求注册中心，可以在应用层面进行本地缓存，定期更新发现结果。这样可以减少对注册中心的压力。
- **结合负载均衡策略**：合理配置负载均衡策略（如轮询、权重等）来选择服务实例，避免单点故障对服务调用的影响。

### 2. **健康检查机制**
#### a. **启用健康检查**
- **开启健康检查功能**：SOFARegistry 支持健康检查，确保只有健康的服务实例能够被发现。默认情况下，建议启用健康检查功能，并根据业务需求设置检查频率。
- **自定义健康检查策略**：可以根据业务场景自定义健康检查策略（如 HTTP、TCP、心跳检查等），确保服务实例的可靠性。

#### b. **健康检查的容错机制**
- **设置健康检查的容错阈值**：在健康检查过程中，建议允许一定的失败次数（如短暂的网络波动或服务重启），在超出阈值时才将实例标记为不可用。

### 3. **服务动态治理**
#### a. **动态路由和负载均衡**
- **配置合理的负载均衡策略**：根据服务的性能和业务需求，选择合适的负载均衡策略（如轮询、随机、权重等），避免单个服务实例的过载。
- **动态调整路由规则**：根据实时流量和服务状态，可以动态调整路由规则，以应对突发流量和实例状态变化。

#### b. **灰度发布和限流**
- **灰度发布**：通过 SOFARegistry 的动态路由功能，可以实现灰度发布，即在新的版本服务上线时，只将部分流量引导至新服务，确保服务稳定后再全量发布。
- **限流配置**：SOFARegistry 允许在注册中心或客户端层面设置限流策略，避免高并发流量导致的服务过载。

### 4. **集群部署和高可用性**
#### a. **使用集群部署**
- **部署 SOFARegistry 集群**：在生产环境中，建议部署 SOFARegistry 的集群版本，通过多实例分布式部署提高系统的高可用性和容错能力。
- **合理配置节点数量**：根据业务规模选择合理的注册中心节点数量，确保高可用性，同时避免资源浪费。

#### b. **灾备和故障转移**
- **配置灾备机制**：在多数据中心或跨区域部署时，可以为 SOFARegistry 设置灾备机制，确保注册中心故障或区域性问题时，服务能够继续提供。
- **故障转移**：SOFARegistry 支持自动故障转移，建议启用这一功能，确保当一个节点出现故障时，流量能够自动转移到其他可用节点。

### 5. **监控与管理**
#### a. **启用监控功能**
- **集成监控系统**：SOFARegistry 提供丰富的监控功能，建议将其与 Prometheus、Grafana 等监控系统集成，实时监控注册中心的运行状态和服务实例的健康状况。
- **关注核心指标**：重点关注注册中心的性能指标（如 QPS、RT、实例健康状态等），及时发现潜在问题并优化配置。

#### b. **日志管理**
- **启用日志记录**：注册中心的操作日志和服务实例变更日志非常重要，建议启用日志记录，并定期审查，以便于故障排查和历史回溯。
- **合理设置日志级别**：在开发和测试环境中可以设置更详细的日志级别，而在生产环境中则建议选择关键级别日志，避免日志过多占用资源。

### 6. **安全管理**
#### a. **启用身份验证和授权**
- **限制服务注册与发现的访问权限**：对于注册中心的访问应设置必要的权限控制，防止未授权的服务注册或篡改已注册的服务信息。
- **配置服务间的身份验证**：服务之间的通信和注册中心的交互应启用身份验证机制，确保安全可靠。

#### b. **数据加密**
- **启用数据加密**：SOFARegistry 传输过程中，建议使用 SSL/TLS 来确保服务注册和发现数据的安全性，防止数据泄漏和中间人攻击。

### 7. **插件机制与扩展**
- **合理使用插件机制**：SOFARegistry 提供灵活的插件机制，用户可以根据实际需求定制注册中心的功能，如自定义健康检查、服务路由规则等。建议根据场景合理使用插件，但避免过度定制，保持系统的可维护性。

### 8. **配置动态管理**
- **动态配置更新**：SOFARegistry 支持动态更新服务的配置，用户可以通过管理界面或 API 实现配置的实时更新。建议在服务变更或流量变化时，动态调整相关配置，以提高系统响应能力。
- **版本控制**：在配置更新时，建议保持历史版本记录，便于在出现问题时快速回滚到稳定版本。

### 结论
SOFARegistry 的最佳实践涵盖了服务注册、发现、健康检查、动态治理、安全管理等方面，合理配置这些功能可以提升系统的高性能和高可用性。

此外，借助集群部署、监控管理、限流和灰度发布等机制，可以更好地应对大规模微服务架构下的复杂场景。

## java 客户端访问 SOFARegistry 的入门例子

要通过 Java 客户端访问 SOFARegistry，首先需要配置 SOFARegistry 作为服务注册中心，并在 Java 应用中注册和发现服务。SOFA 提供了完善的 SDK，帮助开发者简化这些操作。

下面是一个 Java 客户端访问 SOFARegistry 的简单入门示例，展示如何在 Java 应用中注册服务并进行服务发现。

### 环境准备

1. **启动 SOFARegistry**：
   你可以使用 Docker 快速启动一个 SOFARegistry 实例，或在本地下载并启动它。
   
   使用 Docker 启动 SOFARegistry：
   ```bash
   docker run -d --name sofa-registry \
     -p 9603:9603 \
     -p 9604:9604 \
     registry.cn-hangzhou.aliyuncs.com/sofastack-registry/sofaregistry-server
   ```

2. **引入依赖**
   在 Java 项目中使用 SOFARegistry SDK 进行服务注册和发现，你需要在 `pom.xml` 中添加必要的 Maven 依赖：

   ```xml
   <dependency>
       <groupId>com.alipay.sofa</groupId>
       <artifactId>sofa-registry-client-all</artifactId>
       <version>5.4.0</version> <!-- 选择你需要的版本 -->
   </dependency>
   ```

### 注册服务示例

#### 1. **创建服务提供者**

在服务提供者应用中，你需要将服务实例注册到 SOFARegistry。以下是如何注册服务的简单示例：

```java
import com.alipay.sofa.registry.client.api.RegistryClient;
import com.alipay.sofa.registry.client.api.RegistryFactory;
import com.alipay.sofa.registry.client.api.model.RegisterInstance;
import com.alipay.sofa.registry.client.api.model.ServiceInstance;

public class ServiceProvider {
    public static void main(String[] args) {
        // 创建注册客户端
        RegistryClient registryClient = RegistryFactory.createRegistryClient(
                "127.0.0.1:9603" // SOFARegistry 地址
        );

        // 创建服务实例
        ServiceInstance serviceInstance = new ServiceInstance();
        serviceInstance.setIp("127.0.0.1");
        serviceInstance.setPort(8080);

        // 注册服务
        RegisterInstance registerInstance = new RegisterInstance("com.example.MyService", serviceInstance);
        registryClient.register(registerInstance);

        System.out.println("服务已注册");
    }
}
```

在这个示例中：
- `RegistryClient` 连接到 SOFARegistry 服务。
- 通过 `RegisterInstance` 注册一个名为 `com.example.MyService` 的服务实例，包含 IP 地址和端口号。

#### 2. **创建服务消费者**

在服务消费者应用中，你可以通过 SOFARegistry 来发现可用的服务实例。以下是如何进行服务发现的示例：

```java
import com.alipay.sofa.registry.client.api.RegistryClient;
import com.alipay.sofa.registry.client.api.RegistryFactory;
import com.alipay.sofa.registry.client.api.model.LookupRequest;
import com.alipay.sofa.registry.client.api.model.ServiceInstance;

import java.util.List;

public class ServiceConsumer {
    public static void main(String[] args) {
        // 创建注册客户端
        RegistryClient registryClient = RegistryFactory.createRegistryClient(
                "127.0.0.1:9603" // SOFARegistry 地址
        );

        // 查找服务
        List<ServiceInstance> instances = registryClient.lookup(new LookupRequest("com.example.MyService"));

        if (instances != null && !instances.isEmpty()) {
            for (ServiceInstance instance : instances) {
                System.out.println("发现服务实例: " + instance.getIp() + ":" + instance.getPort());
            }
        } else {
            System.out.println("未找到可用服务实例");
        }
    }
}
```

在这个示例中：
- `lookup` 方法根据服务名 `com.example.MyService` 查找可用的服务实例列表。
- 获取到的服务实例列表中可以包含多个实例，通过循环输出实例的 IP 和端口信息。

### 关键配置说明

1. **SOFARegistry 地址**：在注册和发现服务时，客户端需要知道 SOFARegistry 的地址。此地址应配置为你的 SOFARegistry 实例的 IP 和端口（默认端口是 `9603`）。
   
2. **服务名**：服务名在服务注册和发现时需要保持一致，确保消费者能够找到正确的服务提供者。

### 服务发现和负载均衡

在生产环境中，如果有多个服务实例注册，客户端可以基于负载均衡策略（如轮询、随机）来选择服务实例。你可以自定义负载均衡策略：

```java
public ServiceInstance selectInstance(List<ServiceInstance> instances) {
    // 简单随机选择实例
    Random random = new Random();
    return instances.get(random.nextInt(instances.size()));
}
```

### 结论

通过这个简单的例子，你可以看到 SOFARegistry 是如何通过 Java 客户端进行服务注册和服务发现的。

要构建更复杂的微服务架构，你可以使用 SOFARegistry 的更多高级功能，如健康检查、动态配置、灰度发布等功能。

### 后续步骤

- 在真实项目中，确保服务提供者和消费者正确处理服务实例的生命周期。
- 在需要时，使用 SOFARegistry 的健康检查和监控功能，保障系统的高可用性。

## 给出 SOFARegistry 深入学习的资料，包含网址

以下是一些 SOFARegistry 深入学习的资料和网址，涵盖官方文档、博客、源码、以及社区资源，适合进行系统化的学习。

### 1. **官方文档**
   SOFAStack 提供了详细的官方文档，涵盖了 SOFARegistry 的架构、安装、使用指南、以及高级功能。官方文档是最权威的学习资料。
   
   - **SOFARegistry 官方文档**:  
     [https://www.sofastack.tech/projects/sofa-registry/overview](https://www.sofastack.tech/projects/sofa-registry/overview)

### 2. **源码仓库**
   SOFARegistry 是开源项目，你可以直接在 GitHub 上查看源码，了解其内部实现、提交历史、以及社区贡献情况。
   
   - **SOFARegistry GitHub 仓库**:  
     [https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

### 3. **SOFAStack 官方网站**
   SOFAStack 是 SOFARegistry 的整体技术框架，SOFARegistry 是其中的一个模块。你可以在 SOFAStack 官网了解整个框架的体系结构，以及其他相关模块（如 SOFARPC、SOFABoot）。
   
   - **SOFAStack 官网**:  
     [https://www.sofastack.tech/](https://www.sofastack.tech/)

### 4. **阿里巴巴中间件团队博客**
   SOFARegistry 是由阿里巴巴开源的，阿里巴巴中间件团队的博客经常会发布与 SOFAStack 和 SOFARegistry 相关的文章，包括架构设计、技术选型、性能优化等主题。
   
   - **阿里巴巴中间件团队博客**:  
     [https://developer.aliyun.com/group/sofastack](https://developer.aliyun.com/group/sofastack)

### 5. **SOFAStack 社区**
   SOFAStack 社区有活跃的用户和开发者，提供问题解答、分享最佳实践、以及发布相关技术文章。加入社区可以帮助你更快地解决问题，获取最新的技术动态。

   - **SOFAStack Gitter 社区**:  
     [https://gitter.im/alipay/sofastack](https://gitter.im/alipay/sofastack)

### 6. **SOFARegistry 快速入门教程**
   官方提供了快速入门教程，适合初学者快速上手并了解 SOFARegistry 的基本功能和使用方法。

   - **SOFARegistry 快速入门**:  
     [https://www.sofastack.tech/sofa-registry/docs/QuickStart](https://www.sofastack.tech/sofa-registry/docs/QuickStart)

### 7. **技术博客和文章**
   许多开发者和技术博客也发布了关于 SOFARegistry 的深入分析和最佳实践。你可以通过博客搜索关键词来找到一些优秀的文章：
   
   - **SOFARegistry 实战与应用分析**（CSDN 搜索）:  
     [https://blog.csdn.net/](https://blog.csdn.net/)
   - **阿里技术博客：SOFARegistry 的架构设计**（阿里技术分享）:  
     [https://developer.aliyun.com/article/750423](https://developer.aliyun.com/article/750423)

### 8. **SOFARegistry 视频学习资源**
   阿里云和其他技术社区经常发布 SOFARegistry 的视频教程或技术分享，视频能帮助你快速理解它的使用场景和设计思路。
   
   - **阿里云开发者视频频道：SOFARegistry 专题**:  
     [https://developer.aliyun.com/live](https://developer.aliyun.com/live)

通过这些学习资源，你可以从基础到深入地了解 SOFARegistry，学习其架构、原理、和最佳实践，并掌握其在实际项目中的使用。

## 如果让你深入理解 SOFARegistry，你会问哪 10 个问题？为什么？



# 参考资料

* any list
{:toc}