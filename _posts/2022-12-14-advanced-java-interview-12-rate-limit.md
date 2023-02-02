---
layout: post 
title: java 知识进阶面试-12-HA rate limit 限流
date: 2022-12-14 21:01:55 +0800
categories: [Java] 
tags: [java, interview, sh]
published: true
---

# 如何限流？在工作中是怎么做的？说一下具体的实现？

## 什么是限流

限流可以认为服务降级的一种，限流就是限制系统的输入和输出流量已达到保护系统的目的。

一般来说系统的吞吐量是可以被测算的，为了保证系统的稳定运行，一旦达到的需要限制的阈值，就需要限制流量并采取一些措施以完成限制流量的目的。

比如：延迟处理，拒绝处理，或者部分拒绝处理等等。

# 工作中的使用

## spring cloud gateway

spring cloud gateway 默认使用 redis 进行限流，笔者一般只是修改修改参数属于拿来即用，并没有去从头实现上述那些算法。

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
</dependency>
```

```yml
spring:
  cloud:
    gateway:
      routes:
        - id: requestratelimiter_route
          
          uri: lb://pigx-upms
          order: 10000
          predicates:
            - Path=/admin/**
          
          filters:
            - name: RequestRateLimiter
              
              args:
                redis-rate-limiter.replenishRate: 1 # 令牌桶的容积
                redis-rate-limiter.burstCapacity: 3 # 流速 每秒
                key-resolver: '#{@remoteAddrKeyResolver}' #SPEL表达式去的对应的bean

            - StripPrefix=1
```

```java
@Bean
KeyResolver remoteAddrKeyResolver() {
    return exchange -> Mono.just(exchange.getRequest().getRemoteAddress().getHostName());
}
```

## sentinel

通过配置来控制每个 url 的流量

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

```yml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
    sentinel:
      transport:
        dashboard: localhost:8080
        port: 8720
      datasource:
        ds:
          nacos:
            server-addr: localhost:8848
            dataId: spring-cloud-sentinel-nacos
            groupId: DEFAULT_GROUP
            rule-type: flow
            namespace: xxxxxxxx
```

配置内容在 nacos 上进行编辑

```json
[
  {
    "resource": "/hello",
    "limitApp": "default",
    "grade": 1,
    "count": 1,
    "strategy": 0,
    "controlBehavior": 0,
    "clusterMode": false
  }
]
```

- resource：资源名，即限流规则的作用对象。

- limitApp：流控针对的调用来源，若为 default 则不区分调用来源。

- grade：限流阈值类型，QPS 或线程数模式，0 代表根据并发数量来限流，1 代表根据 QPS 来进行流量控制。

- count：限流阈值

- strategy：判断的根据是资源自身，还是根据其它关联资源 (refResource)，还是根据链路入口

- controlBehavior：流控效果（直接拒绝 / 排队等待 / 慢启动模式）

- clusterMode：是否为集群模式

## 总结

sentinel 和 spring cloud gateway 两个框架都是很好的限流框架， 但是在我使用中还没有将spring-cloud-alibaba接入到项目中进行使用， 所以我会选择spring cloud gateway， 当接入完整的或者接入 Nacos 项目使用 setinel 会有更加好的体验.

# 参考资料

https://github.com/doocs/advanced-java/blob/main/docs/high-concurrency/how-to-limit-current.md

* any list
{:toc}