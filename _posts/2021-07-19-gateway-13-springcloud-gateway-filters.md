---
layout: post
title: spring cloud gateway-04-GatewayFilter Factories 
date: 2018-11-21 8:01:55 +0800
categories: [Spring]
tags: [spring, spring-cloud, gateway, sh]
published: true
---

# 6. GatewayFilter 工厂

路由过滤器允许以某种方式修改传入的 HTTP 请求或传出的 HTTP 响应。 

路由过滤器的范围是特定的路由。 

Spring Cloud Gateway 包含许多内置的 GatewayFilter 工厂。

> 有关如何使用以下任何过滤器的更详细示例，请查看单元测试。

# 6.1. AddRequestHeader 网关过滤器工厂

AddRequestHeader GatewayFilter 工厂采用名称和值参数。 

以下示例配置 AddRequestHeader GatewayFilter：

- 示例 13. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: add_request_header_route
        uri: https://example.org
        filters:
        - AddRequestHeader=X-Request-red, blue
```

此清单将 `X-Request-red:blue` 标头添加到所有匹配请求的下游请求标头中。

AddRequestHeader 知道用于匹配路径或主机的 URI 变量。 

URI 变量可以在值中使用并在运行时扩展。 

以下示例配置使用变量的 AddRequestHeader GatewayFilter：

- Example 14. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: add_request_header_route
        uri: https://example.org
        predicates:
        - Path=/red/{segment}
        filters:
        - AddRequestHeader=X-Request-Red, Blue-{segment}
```

# 6.2. AddRequestParameter 网关过滤器工厂

AddRequestParameter GatewayFilter Factory 采用名称和值参数。 

以下示例配置 AddRequestParameter GatewayFilter：

- 示例 15. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: add_request_parameter_route
        uri: https://example.org
        filters:
        - AddRequestParameter=red, blue
```

这会将 red=blue 添加到所有匹配请求的下游请求的查询字符串中。

AddRequestParameter 知道用于匹配路径或主机的 URI 变量。 

URI 变量可以在值中使用并在运行时扩展。 

以下示例配置使用变量的 AddRequestParameter GatewayFilter：

- Example 16. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: add_request_parameter_route
        uri: https://example.org
        predicates:
        - Host: {segment}.myhost.org
        filters:
        - AddRequestParameter=foo, bar-{segment}
```

# 6.3. AddResponseHeader 网关过滤器工厂

AddResponseHeader GatewayFilter Factory 采用名称和值参数。 

以下示例配置 AddResponseHeader GatewayFilter：

- 示例 17. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: add_response_header_route
        uri: https://example.org
        filters:
        - AddResponseHeader=X-Response-Red, Blue
```

这会将 X-Response-Foo:Bar 标头添加到所有匹配请求的下游响应标头中。

AddResponseHeader 知道用于匹配路径或主机的 URI 变量。 

URI 变量可以在值中使用并在运行时扩展。 

以下示例配置使用变量的 AddResponseHeader GatewayFilter：

- 示例 18. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: add_response_header_route
        uri: https://example.org
        predicates:
        - Host: {segment}.myhost.org
        filters:
        - AddResponseHeader=foo, bar-{segment}
```

# 6.4. DedupeResponseHeader 网关过滤器工厂

DedupeResponseHeader GatewayFilter 工厂采用名称参数和可选的策略参数。 

name 可以包含以空格分隔的标题名称列表。 

以下示例配置 DedupeResponseHeader GatewayFilter：

- 示例 19. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: dedupe_response_header_route
        uri: https://example.org
        filters:
        - DedupeResponseHeader=Access-Control-Allow-Credentials Access-Control-Allow-Origin
```

在网关 CORS 逻辑和下游逻辑都添加它们的情况下，这会删除 Access-Control-Allow-Credentials 和 Access-Control-Allow-Origin 响应标头的重复值。

DedupeResponseHeader 过滤器还接受一个可选的策略参数。 

接受的值为 RETAIN_FIRST（默认）、RETAIN_LAST 和 RETAIN_UNIQUE。

# 6.5. Spring Cloud 断路器网关过滤器工厂

Spring Cloud CircuitBreaker GatewayFilter 工厂使用 Spring Cloud CircuitBreaker API 将网关路由包装在断路器中。 

Spring Cloud CircuitBreaker 支持多个可与 Spring Cloud Gateway 一起使用的库。 

Spring Cloud 支持开箱即用的 Resilience4J。

要启用 Spring Cloud CircuitBreaker 过滤器，您需要将 spring-cloud-starter-circuitbreaker-reactor-resilience4j 放在类路径上。 

以下示例配置 Spring Cloud CircuitBreaker GatewayFilter：

- 示例 20. application.yml





# 参考资料

https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#gatewayfilter-factories


* any list
{:toc}