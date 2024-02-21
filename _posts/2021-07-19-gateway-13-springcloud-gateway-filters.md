---
layout: post
title: spring cloud gateway-04-GatewayFilter Factories 
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, gateway-topic, sh]
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

## 6.19. SecureHeaders 网关过滤器工厂

根据本博客文章中提出的建议，SecureHeaders GatewayFilter 工厂向响应添加了许多标头。

添加了以下标题（显示为默认值）：

```
X-Xss-Protection:1 (mode=block)
Strict-Transport-Security (max-age=631138519)
X-Frame-Options (DENY)
X-Content-Type-Options (nosniff)
Referrer-Policy (no-referrer)
Content-Security-Policy (default-src 'self' https:; font-src 'self' https: data:; img-src 'self' https: data:; object-src 'none';script-src https:; style-src 'self' https: 'unsafe-inline)'
X-Download-Options (noopen)
X-Permitted-Cross-Domain-Policies (none)
```

要更改默认值，请在 spring.cloud.gateway.filter.secure-headers 命名空间中设置适当的属性。

以下属性可用：

```
xss-protection-header
strict-transport-security
x-frame-options
x-content-type-options
referrer-policy
content-security-policy
x-download-options
x-permitted-cross-domain-policies
```

要禁用默认值，请使用逗号分隔值设置 spring.cloud.gateway.filter.secure-headers.disable 属性。

以下示例显示了如何执行此操作：

```
spring.cloud.gateway.filter.secure-headers.disable=x-frame-options,strict-transport-security
```

## 6.20. SetPath 网关过滤器工厂

SetPath GatewayFilter 工厂采用路径模板参数。 

它提供了一种通过允许路径的模板化段来操作请求路径的简单方法。 

这使用了 Spring Framework 中的 URI 模板。 

允许多个匹配段。 

以下示例配置 SetPath GatewayFilter：

- 示例 43. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: setpath_route
        uri: https://example.org
        predicates:
        - Path=/red/{segment}
        filters:
        - SetPath=/{segment}
```

对于 /red/blue 的请求路径，这会在发出下游请求之前将路径设置为 /blue。

## 6.21. SetRequestHeader 网关过滤器工厂

SetRequestHeader GatewayFilter 工厂采用名称和值参数。 

以下清单配置了 SetRequestHeader GatewayFilter：

- 示例 44. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: setrequestheader_route
        uri: https://example.org
        filters:
        - SetRequestHeader=X-Request-Red, Blue
```

此 GatewayFilter 替换（而不是添加）具有给定名称的所有标头。 

因此，如果下游服务器以 X-Request-Red:1234 响应，这将替换为 X-Request-Red:Blue，这是下游服务将收到的。

SetRequestHeader 知道用于匹配路径或主机的 URI 变量。 

URI 变量可以在值中使用并在运行时扩展。 

以下示例配置了一个使用变量的 SetRequestHeader GatewayFilter：

- Example 45. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: setrequestheader_route
        uri: https://example.org
        predicates:
        - Host: {segment}.myhost.org
        filters:
        - SetRequestHeader=foo, bar-{segment}
```

## 6.22. SetResponseHeader 网关过滤器工厂

SetResponseHeader GatewayFilter 工厂采用名称和值参数。 

以下清单配置了 SetResponseHeader GatewayFilter：

- 例 46.application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: setresponseheader_route
        uri: https://example.org
        filters:
        - SetResponseHeader=X-Response-Red, Blue
```

此 GatewayFilter 替换（而不是添加）具有给定名称的所有标头。

因此，如果下游服务器以 X-Response-Red:1234 响应，这将替换为 X-Response-Red:Blue，这是网关客户端将收到的。

SetResponseHeader 知道用于匹配路径或主机的 URI 变量。 

URI 变量可以在值中使用，并将在运行时扩展。 

以下示例配置了一个使用变量的 SetResponseHeader GatewayFilter：

- 例 47.application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: setresponseheader_route
        uri: https://example.org
        predicates:
        - Host: {segment}.myhost.org
        filters:
        - SetResponseHeader=foo, bar-{segment}
```

## 6.23. SetStatus 网关过滤器工厂

SetStatus GatewayFilter 工厂采用单个参数 status。 

它必须是有效的 Spring HttpStatus。 

它可能是整数值 404 或枚举的字符串表示形式：NOT_FOUND。 

以下清单配置了 SetStatus GatewayFilter：

- 例 48.application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: setstatusstring_route
        uri: https://example.org
        filters:
        - SetStatus=BAD_REQUEST
      - id: setstatusint_route
        uri: https://example.org
        filters:
        - SetStatus=401
```

无论哪种情况，响应的 HTTP 状态都设置为 401。

您可以配置 SetStatus GatewayFilter 以在响应的标头中返回来自代理请求的原始 HTTP 状态代码。 

如果配置了以下属性，则将标头添加到响应中：

- Example 49. application.yml

```yml
spring:
  cloud:
    gateway:
      set-status:
        original-status-header-name: original-http-status
```

## 6.24. StripPrefix 网关过滤器工厂

StripPrefix GatewayFilter 工厂采用一个参数，parts。 

部分参数指示在将请求发送到下游之前要从请求中剥离的路径中的部分数。 

以下清单配置了 StripPrefix GatewayFilter：

- 示例 50. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: nameRoot
        uri: https://nameservice
        predicates:
        - Path=/name/**
        filters:
        - StripPrefix=2
```

当通过网关向 /name/blue/red 发出请求时，向 nameservice 发出的请求看起来像 nameservice/red

## 6.25.重试网关过滤器工厂

Retry GatewayFilter 工厂支持以下参数：

    retries：应该尝试的重试次数。

    statuses：应该重试的HTTP状态码，用org.springframework.http.HttpStatus表示。

    methods：应该重试的 HTTP 方法，用 org.springframework.http.HttpMethod 表示。

    series：要重试的状态码系列，用org.springframework.http.HttpStatus.Series表示。

    exceptions：应该重试的抛出异常的列表。

    backoff：为重试配置的指数退避。在 firstBackoff * (factor ^ n) 的退避间隔后执行重试，其中 n 是迭代。如果配置了 maxBackoff，则应用的最大退避限制为 maxBackoff。如果 basedOnPreviousValue 为真，则使用 prevBackoff * 因子计算回退。

如果启用，则为重试过滤器配置以下默认值：

    retries：3次

    series：5XX系列

    methods：GET方法

    exceptions：IOException 和 TimeoutException

    backoff：禁用

以下清单配置了重试网关过滤器：

- 例 51.application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: retry_test
        uri: http://localhost:8080/flakey
        predicates:
        - Host=*.retry.com
        filters:
        - name: Retry
          args:
            retries: 3
            statuses: BAD_GATEWAY
            methods: GET,POST
            backoff:
              firstBackoff: 10ms
              maxBackoff: 50ms
              factor: 2
              basedOnPreviousValue: false
```

使用带有 `forward:` 前缀的重试过滤器时，应仔细编写目标端点，以便在出现错误时不会执行任何可能导致响应被发送到客户端并提交的操作。 

例如，如果目标端点是带注释的控制器，则目标控制器方法不应返回带有错误状态代码的 ResponseEntity。 

相反，它应该抛出异常或发出错误信号（例如，通过 Mono.error(ex) 返回值），重试过滤器可以配置为通过重试来处理。

将重试过滤器与任何带有正文的 HTTP 方法一起使用时，正文将被缓存，网关将受到内存限制。 

正文缓存在由 ServerWebExchangeUtils.CACHED_REQUEST_BODY_ATTR 定义的请求属性中。 

对象的类型是 org.springframework.core.io.buffer.DataBuffer。

可以使用单个状态和方法添加简化的“快捷方式”符号。

下面两个例子是等价的：

- 例 52.application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: retry_route
        uri: https://example.org
        filters:
        - name: Retry
          args:
            retries: 3
            statuses: INTERNAL_SERVER_ERROR
            methods: GET
            backoff:
              firstBackoff: 10ms
              maxBackoff: 50ms
              factor: 2
              basedOnPreviousValue: false

      - id: retryshortcut_route
        uri: https://example.org
        filters:
        - Retry=3,INTERNAL_SERVER_ERROR,GET,10ms,50ms,2,false
```

## 6.26. RequestSize 网关过滤器工厂

当请求大小大于允许的限制时，RequestSize GatewayFilter 工厂可以限制请求到达下游服务。 

过滤器采用 maxSize 参数。

maxSize 是一个 `DataSize 类型，因此值可以定义为一个数字，后跟一个可选的 DataUnit 后缀，例如 'KB' 或 'MB'。 

字节的默认值为“B”。 它是以字节为单位定义的请求的允许大小限制。 

以下清单配置了 RequestSize GatewayFilter：

- 例 53.application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: request_size_route
        uri: http://localhost:8080/upload
        predicates:
        - Path=/upload
        filters:
        - name: RequestSize
          args:
            maxSize: 5000000
```

当请求因大小而被拒绝时，RequestSize GatewayFilter 工厂将响应状态设置为 413 Payload Too Large 并带有一个额外的标头 errorMessage。 

以下示例显示了这样的错误消息：

```
errorMessage` : `Request size is larger than permissible limit. Request size is 6.0 MB where permissible limit is 5.0 MB
```

如果未在路由定义中作为过滤器参数提供，则默认请求大小设置为 5 MB。

## 6.27. SetRequestHostHeader 网关过滤器工厂

在某些情况下，可能需要覆盖主机标头。 

在这种情况下， SetRequestHostHeader GatewayFilter 工厂可以用指定的值替换现有的主机头。 

过滤器采用主机参数。 

以下清单配置了 SetRequestHostHeader GatewayFilter：

- 示例 54. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: set_request_host_header_route
        uri: http://localhost:8080/headers
        predicates:
        - Path=/headers
        filters:
        - name: SetRequestHostHeader
          args:
            host: example.org
```

SetRequestHostHeader GatewayFilter 工厂用 example.org 替换主机标头的值。

## 6.28. 修改请求正文 GatewayFilter Factory

您可以使用 ModifyRequestBody 过滤器来修改请求正文，然后网关将其发送到下游。

此过滤器只能通过使用 Java DSL 进行配置。

以下清单显示了如何修改请求正文 GatewayFilter：

```java
@Bean
public RouteLocator routes(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("rewrite_request_obj", r -> r.host("*.rewriterequestobj.org")
            .filters(f -> f.prefixPath("/httpbin")
                .modifyRequestBody(String.class, Hello.class, MediaType.APPLICATION_JSON_VALUE,
                    (exchange, s) -> return Mono.just(new Hello(s.toUpperCase())))).uri(uri))
        .build();
}

static class Hello {
    String message;

    public Hello() { }

    public Hello(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
} 
```

如果请求没有正文，则 RewriteFilter 将传递 null。 

应返回 Mono.empty() 以在请求中分配缺失的主体。

## 6.29. 修改响应体 GatewayFilter 工厂

您可以使用 ModifyResponseBody 过滤器在响应正文发送回客户端之前对其进行修改。

> 此过滤器只能通过使用 Java DSL 进行配置。

以下清单显示了如何修改响应正文 GatewayFilter：

```java
@Bean
public RouteLocator routes(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("rewrite_response_upper", r -> r.host("*.rewriteresponseupper.org")
            .filters(f -> f.prefixPath("/httpbin")
                .modifyResponseBody(String.class, String.class,
                    (exchange, s) -> Mono.just(s.toUpperCase()))).uri(uri))
        .build();
}
```

如果响应没有正文，则 RewriteFilter 将传递 null。 

应返回 Mono.empty() 以在响应中分配缺失的主体。

## 6.30. 令牌中继网关过滤器工厂

令牌中继是 OAuth2 消费者充当客户端并将传入令牌转发到传出资源请求的地方。 

消费者可以是纯客户端（如 SSO 应用程序）或资源服务器。

Spring Cloud Gateway 可以将 OAuth2 访问令牌下游转发到它正在代理的服务。 

要将此功能添加到网关，您需要像这样添加 TokenRelayGatewayFilterFactory：

- 应用程序.java

```java
@Bean
public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
    return builder.routes()
            .route("resource", r -> r.path("/resource")
                    .filters(f -> f.tokenRelay())
                    .uri("http://localhost:9000"))
            .build();
}
```

或者：

- application.yaml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: resource
        uri: http://localhost:9000
        predicates:
        - Path=/resource
        filters:
        - TokenRelay=
```

并且它将（除了登录用户并获取令牌之外）将身份验证令牌下游传递给服务（在本例中为 /resource）。

要为 Spring Cloud Gateway 启用此功能，请添加以下依赖项

```
org.springframework.boot:spring-boot-starter-oauth2-client
```

它是如何工作的？ 

`{githubmaster}/src/main/java/org/springframework/cloud/gateway/security/TokenRelayGatewayFilterFactory.java[filter]` 

从当前已验证的用户中提取访问令牌，并将其放入下游请求的请求头中。

有关完整的工作示例，请参阅此项目。

只有在设置了正确的 `spring.security.oauth2.client.*` 属性时才会创建 TokenRelayGatewayFilterFactory bean，这将触发 ReactiveClientRegistrationRepository bean 的创建。

TokenRelayGatewayFilterFactory 使用的 ReactiveOAuth2AuthorizedClientService 的默认实现使用内存数据存储。

如果您需要更强大的解决方案，您将需要提供自己的实现 ReactiveOAuth2AuthorizedClientService。

## 6.31. 默认过滤器

要添加过滤器并将其应用于所有路由，您可以使用 spring.cloud.gateway.default-filters。 

此属性采用过滤器列表。 

以下清单定义了一组默认过滤器：

- 示例 55. application.yml

```yml
spring:
  cloud:
    gateway:
      default-filters:
      - AddResponseHeader=X-Response-Default-Red, Default-Blue
      - PrefixPath=/httpbin
```

# 参考资料

https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#gatewayfilter-factories


* any list
{:toc}