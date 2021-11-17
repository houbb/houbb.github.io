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

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: circuitbreaker_route
        uri: https://example.org
        filters:
        - CircuitBreaker=myCircuitBreaker
```

要配置断路器，请参阅您正在使用的底层断路器实现的配置。

Spring Cloud CircuitBreaker 过滤器还可以接受可选的 fallbackUri 参数。 

目前，仅支持转发：schemed URI。 如果调用回退，则请求将转发到与 URI 匹配的控制器。 以下示例配置了这样的回退：

- 示例 21. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: circuitbreaker_route
        uri: lb://backing-service:8088
        predicates:
        - Path=/consumingServiceEndpoint
        filters:
        - name: CircuitBreaker
          args:
            name: myCircuitBreaker
            fallbackUri: forward:/inCaseOfFailureUseThis
        - RewritePath=/consumingServiceEndpoint, /backingServiceEndpoint
```

下面的清单在 Java 中做了同样的事情：

- Example 22. Application.java

```java
@Bean
public RouteLocator routes(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("circuitbreaker_route", r -> r.path("/consumingServiceEndpoint")
            .filters(f -> f.circuitBreaker(c -> c.name("myCircuitBreaker").fallbackUri("forward:/inCaseOfFailureUseThis"))
                .rewritePath("/consumingServiceEndpoint", "/backingServiceEndpoint")).uri("lb://backing-service:8088")
        .build();
}
```

此示例在调用断路器回退时转发到 /inCaseofFailureUseThis URI。

请注意，此示例还演示了（可选）Spring Cloud LoadBalancer 负载平衡（由目标 URI 上的 lb 前缀定义）。

主要场景是使用 fallbackUri 在网关应用程序中定义内部控制器或处理程序。 

但是，您也可以将请求重新路由到外部应用程序中的控制器或处理程序，如下所示：

- Example 23. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: ingredients
        uri: lb://ingredients
        predicates:
        - Path=//ingredients/**
        filters:
        - name: CircuitBreaker
          args:
            name: fetchIngredients
            fallbackUri: forward:/fallback
      - id: ingredients-fallback
        uri: http://localhost:9994
        predicates:
        - Path=/fallback
```

在此示例中，网关应用程序中没有回退端点或处理程序。 但是，在另一个应用程序中有一个，在 localhost:9994 下注册。

如果请求被转发到回退，Spring Cloud CircuitBreaker Gateway 过滤器还提供导致它的 Throwable。 

它作为 ServerWebExchangeUtils.CIRCUITBREAKER_EXECUTION_EXCEPTION_ATTR 属性添加到 ServerWebExchange 中，可在网关应用程序中处理回退时使用。

对于外部控制器/处理程序场景，可以添加带有异常详细信息的标头。 

您可以在 FallbackHeaders GatewayFilter Factory 部分找到有关这样做的更多信息。

## 6.5.1. 根据状态代码使断路器脱扣

在某些情况下，您可能希望根据从其环绕的路由返回的状态代码来触发断路器。

断路器配置对象采用状态代码列表，如果返回这些状态代码，将导致断路器跳闸。 
 
在设置要使断路器跳闸的状态代码时，您可以使用带有状态代码值的整数或 HttpStatus 枚举的字符串表示形式。

示例 24. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: circuitbreaker_route
        uri: lb://backing-service:8088
        predicates:
        - Path=/consumingServiceEndpoint
        filters:
        - name: CircuitBreaker
          args:
            name: myCircuitBreaker
            fallbackUri: forward:/inCaseOfFailureUseThis
            statusCodes:
              - 500
              - "NOT_FOUND"
```

- Example 25. Application.java

```java
@Bean
public RouteLocator routes(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("circuitbreaker_route", r -> r.path("/consumingServiceEndpoint")
            .filters(f -> f.circuitBreaker(c -> c.name("myCircuitBreaker").fallbackUri("forward:/inCaseOfFailureUseThis").addStatusCode("INTERNAL_SERVER_ERROR"))
                .rewritePath("/consumingServiceEndpoint", "/backingServiceEndpoint")).uri("lb://backing-service:8088")
        .build();
}
```

# 6.6. FallbackHeaders 网关过滤器工厂

FallbackHeaders 工厂允许您在转发到外部应用程序中的 fallbackUri 的请求的标头中添加 Spring Cloud CircuitBreaker 执行异常详细信息，如在以下场景中：

- 示例 26. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: ingredients
        uri: lb://ingredients
        predicates:
        - Path=//ingredients/**
        filters:
        - name: CircuitBreaker
          args:
            name: fetchIngredients
            fallbackUri: forward:/fallback
      - id: ingredients-fallback
        uri: http://localhost:9994
        predicates:
        - Path=/fallback
        filters:
        - name: FallbackHeaders
          args:
            executionExceptionTypeHeaderName: Test-Header
```

在此示例中，在运行断路器时发生执行异常后，请求将转发到在 localhost:9994 上运行的应用程序中的回退端点或处理程序。 

FallbackHeaders 过滤器将带有异常类型、消息和（如果可用）根本原因异常类型和消息的标头添加到该请求中。

您可以通过设置以下参数的值（显示为默认值）来覆盖配置中标题的名称：

- executionExceptionTypeHeaderName ("Execution-Exception-Type")

- executionExceptionMessageHeaderName ("Execution-Exception-Message")

- rootCauseExceptionTypeHeaderName ("Root-Cause-Exception-Type")

- rootCauseExceptionMessageHeaderName ("Root-Cause-Exception-Message")

有关断路器和网关的更多信息，请参阅 Spring Cloud CircuitBreaker Factory 部分。

# 6.7. MapRequestHeader 网关过滤器工厂

MapRequestHeader GatewayFilter 工厂采用 fromHeader 和 toHeader 参数。 

它创建一个新的命名标头 (toHeader)，并从传入的 http 请求中从现有命名标头 (fromHeader) 中提取值。 

如果输入标头不存在，则过滤器没有影响。 

如果新命名的标头已存在，则其值将使用新值进行扩充。 以下示例配置 MapRequestHeader：

- 示例 27. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: map_request_header_route
        uri: https://example.org
        filters:
        - MapRequestHeader=Blue, X-Request-Red
```

这会将 `X-Request-Red:<values>` 标头添加到下游请求，并使用来自传入 HTTP 请求的 Blue 标头的更新值。

# 6.8. PrefixPath 网关过滤器工厂

PrefixPath GatewayFilter 工厂采用单个前缀参数。 

以下示例配置 PrefixPath GatewayFilter：

- 示例 28. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: prefixpath_route
        uri: https://example.org
        filters:
        - PrefixPath=/mypath
```

这会将 /mypath 前缀为所有匹配请求的路径。 

因此，对 /hello 的请求将被发送到 /mypath/hello。

# 6.9. PreserveHostHeader 网关过滤器工厂

PreserveHostHeader GatewayFilter 工厂没有参数。 

此过滤器设置路由过滤器检查的请求属性，以确定是否应发送原始主机标头，而不是由 HTTP 客户端确定的主机标头。 

以下示例配置 PreserveHostHeader GatewayFilter：

- 示例 29. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: preserve_host_route
        uri: https://example.org
        filters:
        - PreserveHostHeader
```

# 6.10. RequestRateLimiter 网关过滤器工厂

RequestRateLimiter GatewayFilter 工厂使用 RateLimiter 实现来确定是否允许继续处理当前请求。 

如果不是，则返回 HTTP 429 - Too Many Requests（默认情况下）状态。

此过滤器采用可选的 keyResolver 参数和特定于速率限制器的参数（本节稍后介绍）。

keyResolver 是一个实现 KeyResolver 接口的 bean。 在配置中，使用 SpEL 按名称引用 bean。 #{@myKeyResolver} 是一个 SpEL 表达式，它引用名为 myKeyResolver 的 bean。 

以下清单显示了 KeyResolver 接口：

- 示例 30.KeyResolver.java

```java
public interface KeyResolver {
    Mono<String> resolve(ServerWebExchange exchange);
}
```

KeyResolver 接口让可插拔策略派生出限制请求的密钥。 

在未来的里程碑版本中，将有一些 KeyResolver 实现。

KeyResolver 的默认实现是 PrincipalNameKeyResolver，它从 ServerWebExchange 检索 Principal 并调用 Principal.getName()。

默认情况下，如果 KeyResolver 没有找到密钥，请求将被拒绝。 

您可以通过设置 spring.cloud.gateway.filter.request-rate-limiter.deny-empty-key（true 或 false）和 spring.cloud.gateway.filter.request-rate-limiter.empty-key 来调整此行为 -状态码属性。

RequestRateLimiter 不能使用“快捷方式”表示法进行配置。 以下示例无效：

- 示例 31. application.properties

```
# INVALID SHORTCUT CONFIGURATION
spring.cloud.gateway.routes[0].filters[0]=RequestRateLimiter=2, 2, #{@userkeyresolver}
```

## 6.10.1. Redis 速率限制器

Redis 实现基于在 Stripe 完成的工作。它需要使用 spring-boot-starter-data-redis-reactive Spring Boot starter。

使用的算法是令牌桶算法。

redis-rate-limiter.replenishRate 属性是您希望允许用户每秒执行多少请求，而没有任何丢弃的请求。这是令牌桶填充的速率。

redis-rate-limiter.burstCapacity 属性是允许用户在一秒内执行的最大请求数。这是令牌桶可以容纳的令牌数量。将此值设置为零会阻止所有请求。

redis-rate-limiter.requestedTokens 属性是请求花费多少令牌。这是每个请求从桶中取出的令牌数量，默认为 1。

通过在replyRate 和burstCapacity 中设置相同的值来实现稳定的速率。

通过将burstCapacity 设置为高于replyRate，可以允许临时突发。在这种情况下，需要允许速率限制器在突发之间有一段时间（根据replyRate），因为两个连续的突发将导致请求丢失（HTTP 429 - Too Many Requests）。

以下清单配置了 redis-rate-limiter：

低于 1 请求/秒的速率限制是通过将replyRate 设置为所需的请求数量，将requestedTokens 设置为以秒为单位的时间跨度，并将burstCapacity 设置为replyRate 和requestedTokens 的乘积来实现的，例如设置replyRate=1、requestedTokens=60 和burstCapacity=60 将导致1 请求/分钟的限制。

- 示例 32. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: requestratelimiter_route
        uri: https://example.org
        filters:
        - name: RequestRateLimiter
          args:
            redis-rate-limiter.replenishRate: 10
            redis-rate-limiter.burstCapacity: 20
            redis-rate-limiter.requestedTokens: 1
```

以下示例在 Java 中配置 KeyResolver：

- Example 33. Config.java

```java
@Bean
KeyResolver userKeyResolver() {
    return exchange -> Mono.just(exchange.getRequest().getQueryParams().getFirst("user"));
}
```

这将每个用户的请求速率限制定义为 10。 允许突发 20 个，但在下一秒，只有 10 个请求可用。 

KeyResolver 是一个简单的获取用户请求参数的方法（注意，不推荐用于生产）。

您还可以将速率限制器定义为实现 RateLimiter 接口的 bean。 在配置中，您可以使用 SpEL 按名称引用 bean。 

#{@myRateLimiter} 是一个 SpEL 表达式，它引用名为 myRateLimiter 的 bean。 

下面的清单定义了一个速率限制器，它使用在前面的清单中定义的 KeyResolver：

- Example 34. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: requestratelimiter_route
        uri: https://example.org
        filters:
        - name: RequestRateLimiter
          args:
            rate-limiter: "#{@myRateLimiter}"
            key-resolver: "#{@userKeyResolver}"
```

## 6.11. RedirectTo 网关过滤器工厂

RedirectTo GatewayFilter 工厂接受两个参数，status 和 url。 

status 参数应该是 300 系列的重定向 HTTP 代码，例如 301。 

url 参数应该是一个有效的 URL。 这是 Location 标头的值。 

对于相对重定向，您应该使用 uri: no://op 作为路由定义的 uri。 

以下清单配置了 RedirectTo GatewayFilter：

- 示例 35. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: prefixpath_route
        uri: https://example.org
        filters:
        - RedirectTo=302, https://acme.org
```

这将发送带有 Location:https://acme.org 标头的状态 302 以执行重定向。

## 6.12. RemoveRequestHeader 网关过滤器工厂

RemoveRequestHeader GatewayFilter 工厂采用名称参数。 

它是要删除的标题的名称。 

以下清单配置了 RemoveRequestHeader GatewayFilter：

- 示例 36. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: removerequestheader_route
        uri: https://example.org
        filters:
        - RemoveRequestHeader=X-Request-Foo
```

这会在向下游发送之前删除 X-Request-Foo 标头。

## 6.13. RemoveResponseHeader 网关过滤器工厂

RemoveResponseHeader GatewayFilter 工厂采用 name 参数。 

它是要删除的标题的名称。 

以下清单配置了 RemoveResponseHeader GatewayFilter：

- 示例 37. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: removeresponseheader_route
        uri: https://example.org
        filters:
        - RemoveResponseHeader=X-Response-Foo
```

这将在响应返回到网关客户端之前从响应中删除 X-Response-Foo 标头。

要删除任何类型的敏感标头，您应该为您可能想要这样做的任何路由配置此过滤器。 

此外，您可以使用 spring.cloud.gateway.default-filters 配置此过滤器一次，并将其应用于所有路由。

## 6.14. RemoveRequestParameter 网关过滤器工厂

RemoveRequestParameter GatewayFilter 工厂采用名称参数。 

它是要删除的查询参数的名称。 

以下示例配置 RemoveRequestParameter GatewayFilter：

- 示例 38. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: removerequestparameter_route
        uri: https://example.org
        filters:
        - RemoveRequestParameter=red
```

这将在向下游发送之前删除 red 参数。

## 6.15. RewritePath 网关过滤器工厂

RewritePath GatewayFilter 工厂采用路径正则表达式参数和替换参数。 

这使用 Java 正则表达式来灵活地重写请求路径。 

以下清单配置了 RewritePath GatewayFilter：

- 示例 39. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: rewritepath_route
        uri: https://example.org
        predicates:
        - Path=/red/**
        filters:
        - RewritePath=/red/?(?<segment>.*), /$\{segment}
```

对于 /red/blue 的请求路径，这会在发出下游请求之前将路径设置为 /blue。 

请注意，由于 YAML 规范，$ 应替换为 $\。

## 6.16. RewriteLocationResponseHeader GatewayFilter Factory

RewriteLocationResponseHeader GatewayFilter 工厂修改 Location 响应头的值，通常是为了摆脱后端特定的细节。 

它采用stripVersionMode、locationHeaderName、hostValue 和protocolsRegex 参数。 

以下清单配置了 RewriteLocationResponseHeader GatewayFilter：

- 示例 40. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: rewritelocationresponseheader_route
        uri: http://example.org
        filters:
        - RewriteLocationResponseHeader=AS_IN_REQUEST, Location, ,
```

例如对于POST api.example.com/some/object/name的请求，object-service.prod.example.net/v2/some/object/id的Location响应头值改写为api.example。 com/some/object/id。

stripVersionMode 参数具有以下可能的值：NEVER_STRIP、AS_IN_REQUEST（默认）和 ALWAYS_STRIP。

     NEVER_STRIP：不剥离版本，即使原始请求路径不包含版本。

     AS_IN_REQUEST 仅当原始请求路径不包含版本时才会剥离版本。

     ALWAYS_STRIP 始终剥离版本，即使原始请求路径包含版本。

hostValue 参数（如果提供）用于替换响应 Location 标头的 host:port 部分。 

如果未提供，则使用 Host 请求标头的值。

protocolRegex 参数必须是有效的正则表达式字符串，与协议名称匹配。 

如果不匹配，则过滤器不执行任何操作。 

默认为 http|https|ftp|ftps。

## 6.17. RewriteResponseHeader 网关过滤器工厂

RewriteResponseHeader GatewayFilter 工厂采用名称、正则表达式和替换参数。 

它使用 Java 正则表达式来灵活地重写响应头值。 

以下示例配置了 RewriteResponseHeader GatewayFilter：

- 例 41.application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: rewriteresponseheader_route
        uri: https://example.org
        filters:
        - RewriteResponseHeader=X-Response-Red, , password=[^&]+, password=***
```

对于/42?user=ford&password=omg!what&flag=true的header值，在进行下游请求后设置为/42?user=ford&password=***&flag=true。 

由于 YAML 规范，您必须使用 `$\` 来表示 `$`。

## 6.18. SaveSession 网关过滤器工厂

SaveSession GatewayFilter 工厂在向下游转发调用之前强制执行 WebSession::save 操作。 

这在将 Spring Session 之类的东西与惰性数据存储一起使用时特别有用，并且您需要确保在进行转发调用之前已保存会话状态。 

以下示例配置 SaveSession GatewayFilter：

- 例 42.application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: save_session
        uri: https://example.org
        predicates:
        - Path=/foo/**
        filters:
        - SaveSession
```

如果您将 Spring Security 与 Spring Session 集成并希望确保安全详细信息已转发到远程进程，则这一点至关重要。



# 参考资料

https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#gatewayfilter-factories


* any list
{:toc}