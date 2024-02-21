---
layout: post
title: spring cloud gateway-03-Route Predicate Factories 路由谓词工厂
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, gateway-topic, sh]
published: true
---

# 5. 路由谓词工厂

Spring Cloud Gateway 将路由匹配为 Spring WebFlux HandlerMapping 基础结构的一部分。 

Spring Cloud Gateway 包含许多内置的路由谓词工厂。 所有这些谓词都匹配 HTTP 请求的不同属性。 

您可以将多个路由谓词工厂与逻辑和语句组合在一起。

## 5.1. 后路由谓词工厂

After 路由谓词工厂接受一个参数，一个日期时间（它是一个 java ZonedDateTime）。 

此谓词匹配在指定日期时间之后发生的请求。 

以下示例配置了一个 after 路由谓词：

- Example 1. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: after_route
        uri: https://example.org
        predicates:
        - After=2017-01-20T17:42:47.789-07:00[America/Denver]
```

此路由匹配 2017 年 1 月 20 日 17:42 山地时间（丹佛）之后提出的任何请求。

## 5.2. 路由前谓词工厂

Before 路由谓词工厂接受一个参数，一个日期时间（它是一个 java ZonedDateTime）。 

此谓词匹配在指定日期时间之前发生的请求。 

以下示例配置了一个 before 路由谓词：

- Example 2. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: before_route
        uri: https://example.org
        predicates:
        - Before=2017-01-20T17:42:47.789-07:00[America/Denver]
```

此路由匹配 2017 年 1 月 20 日 17:42 山地时间（丹佛）之前提出的任何请求。

## 5.3. 路由谓词工厂之间

路由谓词工厂之间有两个参数，datetime1 和 datetime2，它们是 java ZonedDateTime 对象。 

此谓词匹配发生在 datetime1 之后和 datetime2 之前的请求。 

datetime2 参数必须在 datetime1 之后。 

以下示例配置了一个 between 路由谓词：

- Example 3. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: between_route
        uri: https://example.org
        predicates:
        - Between=2017-01-20T17:42:47.789-07:00[America/Denver], 2017-01-21T17:42:47.789-07:00[America/Denver]
```

此路由匹配 2017 年 1 月 20 日 17:42 山地时间（丹佛）之后和 2017 年 1 月 21 日 17:42 山地时间（丹佛）之前的任何请求。 

这对于维护窗口可能很有用。

## 5.4. Cookie 路由谓词工厂

Cookie 路由谓词工厂有两个参数，即 cookie 名称和一个 regexp（这是一个 Java 正则表达式）。 

此谓词匹配具有给定名称且其值与正则表达式匹配的 cookie。 

以下示例配置 cookie 路由谓词工厂：

- Example 4. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: cookie_route
        uri: https://example.org
        predicates:
        - Cookie=chocolate, ch.p
```

此路由匹配具有名为 Chocolate 的 cookie 的请求，该 cookie 的值与 ch.p 正则表达式匹配。

## 5.5. 标头路由谓词工厂

Header 路由谓词工厂有两个参数，header 和一个 regexp（这是一个 Java 正则表达式）。 

此谓词与具有给定名称的标头匹配，其值与正则表达式匹配。 

以下示例配置标头路由谓词：

- Example 5. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: header_route
        uri: https://example.org
        predicates:
        - Header=X-Request-Id, \d+
```

如果请求具有名为 X-Request-Id 的标头，其值与 \d+ 正则表达式匹配（即，它具有一个或多个数字的值），则此路由匹配。

## 5.6. 主机路由谓词工厂

主机路由谓词工厂采用一个参数：主机名模式列表。 该模式是 Ant 风格的模式，带有 `.` 作为分隔符。 

此谓词匹配与模式匹配的 Host 标头。 

以下示例配置主机路由谓词：

- Example 6. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: host_route
        uri: https://example.org
        predicates:
        - Host=**.somehost.org,**.anotherhost.org
```

还支持 URI 模板变量（例如 {sub}.myhost.org）。

如果请求具有值为 www.somehost.org 或 beta.somehost.org 或 www.anotherhost.org 的 Host 标头，则此路由匹配。

此谓词提取 URI 模板变量（例如 sub，在前面的示例中定义）作为名称和值的映射，并将其放置在 ServerWebExchange.getAttributes() 中，键是在 ServerWebExchangeUtils.URI_TEMPLATE_VARIABLES_ATTRIBUTE 中定义的。

然后这些值可供 GatewayFilter 工厂使用

## 5.7. 方法路由谓词工厂

方法路由谓词工厂采用一个方法参数，它是一个或多个参数：要匹配的 HTTP 方法。 

以下示例配置方法路由谓词：

- Example 7. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: method_route
        uri: https://example.org
        predicates:
        - Method=GET,POST
```

如果请求方法是 GET 或 POST，则此路由匹配。

## 5.8. 路径路由谓词工厂

Path Route Predicate Factory 接受两个参数：一个 Spring PathMatcher 模式列表和一个名为 matchTrailingSlash 的可选标志（默认为 true）。 

以下示例配置路径路由谓词：

- Example 8. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: path_route
        uri: https://example.org
        predicates:
        - Path=/red/{segment},/blue/{segment}
```

如果请求路径是例如：/red/1 或 /red/1/ 或 /red/blue 或 /blue/green，则此路由匹配。

如果 matchTrailingSlash 设置为 false，则不会匹配请求路径 /red/1/。

此谓词提取 URI 模板变量（例如在前面的示例中定义的段）作为名称和值的映射，并将其放置在 ServerWebExchange.getAttributes() 中，键是在 ServerWebExchangeUtils.URI_TEMPLATE_VARIABLES_ATTRIBUTE 中定义的。 

然后这些值可供 GatewayFilter 工厂使用

可以使用实用方法（称为 get）来更轻松地访问这些变量。 

以下示例显示了如何使用 get 方法：

```js
Map<String, String> uriVariables = ServerWebExchangeUtils.getPathPredicateVariables(exchange);

String segment = uriVariables.get("segment");
```

## 5.9. 查询路由谓词工厂

查询路由谓词工厂有两个参数：一个必需的参数和一个可选的正则表达式（它是一个 Java 正则表达式）。 

以下示例配置查询路由谓词：

- Example 9. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: query_route
        uri: https://example.org
        predicates:
        - Query=green
```

如果请求包含绿色查询参数，则前面的路由匹配。

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: query_route
        uri: https://example.org
        predicates:
        - Query=red, gree.
```

如果请求包含值与 gree 匹配的红色查询参数，则前面的路由匹配。

regexp，所以 green 和 greet 会匹配。

## 5.10. RemoteAddr 路由谓词工厂

RemoteAddr 路由谓词工厂采用源列表（最小大小为 1），这些源是 CIDR 符号（IPv4 或 IPv6）字符串，例如 192.168.0.1/16（其中 192.168.0.1 是 IP 地址，16 是子网掩码） ）。 

以下示例配置 RemoteAddr 路由谓词：

- Example 10. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: remoteaddr_route
        uri: https://example.org
        predicates:
        - RemoteAddr=192.168.1.1/24
```

如果请求的远程地址是例如 192.168.1.10，则此路由匹配。

## 5.11. 权重路由谓词工厂

Weight 路由谓词工厂采用两个参数：group 和 weight（一个 int）。 

权重是按组计算的。 

以下示例配置权重路由谓词：

- Example 11. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: weight_high
        uri: https://weighthigh.org
        predicates:
        - Weight=group1, 8
      - id: weight_low
        uri: https://weightlow.org
        predicates:
        - Weight=group1, 2
```

该路由会将约 80% 的流量转发到 weighthigh.org，将约 20% 的流量转发到 weightlow.org

### 修改远程地址的解析方式

默认情况下，RemoteAddr 路由谓词工厂使用来自传入请求的远程地址。

如果 Spring Cloud Gateway 位于代理层之后，这可能与实际客户端 IP 地址不匹配。

您可以通过设置自定义 RemoteAddressResolver 来自定义解析远程地址的方式。 

Spring Cloud Gateway 带有一个基于 X-Forwarded-For 标头 XForwardedRemoteAddressResolver 的非默认远程地址解析器。

XForwardedRemoteAddressResolver 有两个静态构造函数方法，它们采取不同的安全方法：

XForwardedRemoteAddressResolver::trustAll 返回一个 RemoteAddressResolver，它总是采用在 X-Forwarded-For 标头中找到的第一个 IP 地址。这种方法容易受到欺骗，因为恶意客户端可以为 X-Forwarded-For 设置一个初始值，该值将被解析器接受。

XForwardedRemoteAddressResolver::maxTrustedIndex 采用与运行在 Spring Cloud Gateway 前的受信任基础设施数量相关的索引。

例如，如果 Spring Cloud Gateway 只能通过 HAProxy 访问，则应使用值 1。如果在访问 Spring Cloud Gateway 之前需要两跳可信基础设施，则应使用值 2。

考虑以下标头值：

```
X-Forwarded-For: 0.0.0.1, 0.0.0.2, 0.0.0.3
```

以下 maxTrustedIndex 值产生以下远程地址：

| maxTrustedIndex | 	result | 
|:---|:---|
| `[Integer.MIN_VALUE,0]` |  	(invalid, IllegalArgumentException during initialization) |
| 1 | 0.0.0.3 |
| 2 | 0.0.0.2 |
| 3 | 0.0.0.1 |
| `[4, Integer.MAX_VALUE]` | 0.0.0.1 |


以下示例显示了如何使用 Java 实现相同的配置：

- 示例 12. GatewayConfig.java

```java
RemoteAddressResolver resolver = XForwardedRemoteAddressResolver
    .maxTrustedIndex(1);

...

.route("direct-route",
    r -> r.remoteAddr("10.1.1.1", "10.10.1.1/24")
        .uri("https://downstream1")
.route("proxied-route",
    r -> r.remoteAddr(resolver, "10.10.1.1", "10.10.1.1/24")
        .uri("https://downstream2")
)
```

# 参考资料

https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#gateway-request-predicates-factories

* any list
{:toc}