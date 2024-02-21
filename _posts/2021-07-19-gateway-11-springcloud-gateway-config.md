---
layout: post
title: spring cloud gateway-02-配置路由谓词工厂和网关过滤工厂
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, gateway-topic, sh]
published: true
---

# 4. 配置路由谓词工厂和网关过滤工厂

有两种方法可以配置谓词和过滤器：快捷方式和完全扩展的参数。 

下面的大多数示例都使用快捷方式。

名称和参数名称将在每个部分的第一句或第二句中作为代码列出。 

参数通常按快捷方式配置所需的顺序列出。

## 4.1. 快捷方式配置

快捷方式配置由过滤器名称识别，后跟等号 (`=`)，后跟由逗号 (`,`) 分隔的参数值。

- application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: after_route
        uri: https://example.org
        predicates:
        - Cookie=mycookie,mycookievalue
```

前面的示例使用两个参数定义了 Cookie 路由谓词工厂，即 cookie 名称、mycookie 和匹配 mycookievalue 的值。

## 4.2. 完全展开的参数

完全扩展的参数看起来更像是带有名称/值对的标准 yaml 配置。 

通常，会有一个名称键和一个 args 键。 

args 键是键值对的映射，用于配置谓词或过滤器。

- application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: after_route
        uri: https://example.org
        predicates:
        - name: Cookie
          args:
            name: mycookie
            regexp: mycookievalue
```

这就是上面显示的 Cookie 谓词的快捷配置的完整配置。



# 参考资料

https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#configuring-route-predicate-factories-and-gateway-filter-factories

* any list
{:toc}