---
layout: post
title: spring cloud gateway-01-入门介绍
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, gateway-topic, sh]
published: true
---

# Spring Cloud Gateway 

该项目提供了一个用于在 Spring WebFlux 之上构建 API 网关的库。 

Spring Cloud Gateway 旨在提供一种简单而有效的方式来路由到 API 并为它们提供交叉关注点，例如：安全性、监控/指标和弹性。

## 特征

Spring Cloud Gateway 特性：

- 基于 Spring Framework 5、Project Reactor 和 Spring Boot 2.0

- 能够匹配任何请求属性的路由。

- 谓词和过滤器特定于路由。

- 断路器集成。

- Spring Cloud DiscoveryClient 集成

- 易于编写谓词和过滤器

- 请求速率限制

- 路径重写

# 快速开始

```java
@SpringBootApplication
public class DemogatewayApplication {
	@Bean
	public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
		return builder.routes()
			.route("path_route", r -> r.path("/get")
				.uri("http://httpbin.org"))
			.route("host_route", r -> r.host("*.myhost.org")
				.uri("http://httpbin.org"))
			.route("rewrite_route", r -> r.host("*.rewrite.org")
				.filters(f -> f.rewritePath("/foo/(?<segment>.*)", "/${segment}"))
				.uri("http://httpbin.org"))
			.route("hystrix_route", r -> r.host("*.hystrix.org")
				.filters(f -> f.hystrix(c -> c.setName("slowcmd")))
				.uri("http://httpbin.org"))
			.route("hystrix_fallback_route", r -> r.host("*.hystrixfallback.org")
				.filters(f -> f.hystrix(c -> c.setName("slowcmd").setFallbackUri("forward:/hystrixfallback")))
				.uri("http://httpbin.org"))
			.route("limit_route", r -> r
				.host("*.limited.org").and().path("/anything/**")
				.filters(f -> f.requestRateLimiter(c -> c.setRateLimiter(redisRateLimiter())))
				.uri("http://httpbin.org"))
			.build();
	}
}
```

要运行您自己的网关，请使用 spring-cloud-starter-gateway 依赖项。

# 网关

本项目提供了一个构建在 Spring 生态系统之上的 API 网关，包括：Spring 5、Spring Boot 2 和 Project Reactor。 

Spring Cloud Gateway 旨在提供一种简单而有效的方式来路由到 API 并为它们提供交叉关注点，例如：安全性、监控/指标和弹性。

# 1. 如何包含Spring Cloud Gateway

要在您的项目中包含 Spring Cloud Gateway，请使用具有 org.springframework.cloud 的组 ID 和 spring-cloud-starter-gateway 的工件 ID 的 starter。 

有关使用当前 Spring Cloud Release Train 设置构建系统的详细信息，请参阅 Spring Cloud 项目页面。

如果包含启动器，但不希望启用网关，请设置 `spring.cloud.gateway.enabled=false`。

> https://spring.io/projects/spring-cloud

Spring Cloud Gateway 基于 Spring Boot 2.x、Spring WebFlux 和 Project Reactor 构建。 

因此，当您使用 Spring Cloud Gateway 时，您所知道的许多熟悉的同步库（例如 Spring Data 和 Spring Security）和模式可能不适用。 

如果您不熟悉这些项目，我们建议您在使用 Spring Cloud Gateway 之前先阅读他们的文档以熟悉一些新概念。

Spring Cloud Gateway 需要 Spring Boot 和 Spring Webflux 提供的 Netty 运行时。 它不适用于传统的 Servlet 容器或构建为 WAR 时。

# Glossary（词汇解释）

Route(路由)：网关的基本构建块。 它由 ID、目标 URI、谓词集合和过滤器集合定义。 如果聚合谓词为真，则匹配路由。

Predicate(谓词)：这是一个 Java 8 函数谓词。 输入类型是 Spring Framework ServerWebExchange。 这使您可以匹配来自 HTTP 请求的任何内容，例如标头或参数。

过滤器：这些是使用特定工厂构建的 GatewayFilter 实例。 

在这里，您可以在发送下游请求之前或之后修改请求和响应。

# 3. 工作原理

下图提供了 Spring Cloud Gateway 工作原理的高级概述：

![工作原理](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/images/spring_cloud_gateway_diagram.png)

客户端向 Spring Cloud Gateway 发出请求。 

如果网关处理程序映射确定请求与路由匹配，则将其发送到网关 Web 处理程序。 

此处理程序通过特定于请求的过滤器链运行请求。 

过滤器被虚线分隔的原因是过滤器可以在发送代理请求之前和之后运行逻辑。 

执行所有“预”过滤器逻辑。 然后进行代理请求。 

发出代理请求后，将运行“post”过滤器逻辑。

在没有端口的路由中定义的 URI 分别为 HTTP 和 HTTPS URI 获得默认端口值 80 和 443。

# 参考资料

https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/

* any list
{:toc}