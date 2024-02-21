---
layout: post
title: spring cloud gateway-14-Global Filters 全局过滤器
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, gateway-topic, sh]
published: true
---

# Global Filter

GlobalFilter 接口与 GatewayFilter 具有相同的签名。 

这些是有条件地应用于所有路由的特殊过滤器。

在未来的里程碑版本中，此界面及其用法可能会发生变化。

# 7.1. 组合全局过滤器和网关过滤器排序

当请求与路由匹配时，过滤 Web 处理程序会将 GlobalFilter 的所有实例和 GatewayFilter 的所有特定于路由的实例添加到过滤器链中。 

这个组合过滤器链由 org.springframework.core.Ordered 接口排序，您可以通过实现 getOrder() 方法设置该接口。

由于 Spring Cloud Gateway 区分过滤器逻辑执行的“pre”和“post”阶段（参见 How it Works），具有最高优先级的过滤器是“pre”阶段的第一个，“post”阶段的最后一个—— 阶段。

以下清单配置了过滤器链：

- 例 56. ExampleConfiguration.java

```java
@Bean
public GlobalFilter customFilter() {
    return new CustomGlobalFilter();
}

public class CustomGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("custom global filter");
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
```

# 7.2. 前向路由过滤器

ForwardRoutingFilter 在交换属性 ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR 中查找 URI。 

如果 URL 有转发方案（例如 forward:///localendpoint），它会使用 Spring DispatcherHandler 来处理请求。 

请求 URL 的路径部分被转发 URL 中的路径覆盖。 

未修改的原始 URL 将附加到 ServerWebExchangeUtils.GATEWAY_ORIGINAL_REQUEST_URL_ATTR 属性中的列表中。

# 7.3. ReactiveLoadBalancerClientFilter

ReactiveLoadBalancerClientFilter 在名为 ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR 的交换属性中查找 URI。 

如果 URL 具有 lb 方案（例如 lb://myservice），则它使用 Spring Cloud ReactorLoadBalancer 将名称（本例中为 myservice）解析为实际主机和端口，并替换同一属性中的 URI。 

未修改的原始 URL 将附加到 ServerWebExchangeUtils.GATEWAY_ORIGINAL_REQUEST_URL_ATTR 属性中的列表中。 

过滤器还会查看 ServerWebExchangeUtils.GATEWAY_SCHEME_PREFIX_ATTR 属性以查看它是否等于 lb。

如果是，则应用相同的规则。 

以下清单配置了一个 ReactiveLoadBalancerClientFilter：

- Example 57. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: myRoute
        uri: lb://service
        predicates:
        - Path=/service/**
```

默认情况下，当 ReactorLoadBalancer 找不到服务实例时，会返回 503。 

您可以通过设置 spring.cloud.gateway.loadbalancer.use404=true 将网关配置为返回 404。

从 ReactiveLoadBalancerClientFilter 返回的 ServiceInstance 的 isSecure 值会覆盖向网关发出的请求中指定的方案。 

例如，如果请求通过 HTTPS 进入网关，但 ServiceInstance 指示它不安全，则通过 HTTP 发出下游请求。 

相反的情况也可以适用。 

但是，如果在网关配置中为路由指定了 GATEWAY_SCHEME_PREFIX_ATTR，则前缀将被剥离，并且来自路由 URL 的结果方案将覆盖 ServiceInstance 配置。

# 7.4. Netty 路由过滤器

如果位于 ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR 交换属性中的 URL 具有 http 或 https 方案，则 Netty 路由过滤器运行。 

它使用 Netty HttpClient 发出下游代理请求。 响应放在 ServerWebExchangeUtils.CLIENT_RESPONSE_ATTR 交换属性中，以供稍后过滤器使用。 

（还有一个实验性的 WebClientHttpRoutingFilter 执行相同的功能但不需要 Netty。）

# 7.5. Netty 写响应过滤器

如果 ServerWebExchangeUtils.CLIENT_RESPONSE_ATTR 交换属性中存在 Netty HttpClientResponse，则 NettyWriteResponseFilter 运行。 

它在所有其他过滤器完成后运行，并将代理响应写回网关客户端响应。 

（还有一个实验性的 WebClientWriteResponseFilter 可以执行相同的功能但不需要 Netty。）

# 7.6. RouteToRequestUrl 过滤器

如果 ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR 交换属性中存在 Route 对象，则 RouteToRequestUrlFilter 运行。 

它基于请求 URI 创建一个新的 URI，但使用 Route 对象的 URI 属性进行更新。 

新 URI 位于 ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR 交换属性中。

如果 URI 具有方案前缀，例如 lb:ws://serviceid，则 lb 方案将从 URI 中剥离并放置在 ServerWebExchangeUtils.GATEWAY_SCHEME_PREFIX_ATTR 中，以便稍后在过滤器链中使用。

# 7.7. Websocket 路由过滤器

如果位于 ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR 交换属性中的 URL 具有 ws 或 wss 方案，则 websocket 路由过滤器运行。 

它使用 Spring WebSocket 基础结构向下游转发 websocket 请求。

您可以通过在 URI 前加上 lb 来负载平衡 websocket，例如 lb:ws://serviceid。

如果你使用 SockJS 作为普通 HTTP 的后备，你应该配置一个普通的 HTTP 路由以及 websocket 路由。

以下清单配置了一个 websocket 路由过滤器：

- Example 58. application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      # SockJS route
      - id: websocket_sockjs_route
        uri: http://localhost:3001
        predicates:
        - Path=/websocket/info/**
      # Normal Websocket route
      - id: websocket_route
        uri: ws://localhost:3001
        predicates:
        - Path=/websocket/**
```

# 7.8.网关指标过滤器

要启用网关指标，请将 spring-boot-starter-actuator 添加为项目依赖项。

然后，默认情况下，只要属性 spring.cloud.gateway.metrics.enabled 未设置为 false，网关指标过滤器就会运行。

此过滤器添加了一个名为 spring.cloud.gateway.requests 的计时器指标，并带有以下标签：

    routeId：路由ID。

    routeUri：API 路由到的 URI。

    outcome：按 HttpStatus.Series 分类的结果。

    status：返回给客户端的请求的 HTTP 状态。

    httpStatusCode：返回给客户端的请求的 HTTP 状态。

    httpMethod：用于请求的 HTTP 方法。

此外，通过属性 spring.cloud.gateway.metrics.tags.path.enabled（默认设置为 false），您可以使用标签激活额外的指标：

    path：请求的路径。

然后可以从 /actuator/metrics/spring.cloud.gateway.requests 抓取这些指标，并且可以轻松地与 Prometheus 集成以创建 Grafana 仪表板。

> 要启用 prometheus 端点，请将 micrometer-registry-prometheus 添加为项目依赖项。

# 7.9. 将交换标记为已路由

网关路由 ServerWebExchange 后，它通过将 gatewayAlreadyRouted 添加到交换属性来将该交换标记为“已路由”。 

一旦请求被标记为路由，其他路由过滤器将不会再次路由该请求，基本上跳过过滤器。 

有一些方便的方法可用于将交换标记为已路由或检查交换是否已被路由。

ServerWebExchangeUtils.isAlreadyRouted 接受一个 ServerWebExchange 对象并检查它是否已被“路由”。

ServerWebExchangeUtils.setAlreadyRouted 接受一个 ServerWebExchange 对象并将其标记为“已路由”。

# 参考资料

https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#global-filters

* any list
{:toc}