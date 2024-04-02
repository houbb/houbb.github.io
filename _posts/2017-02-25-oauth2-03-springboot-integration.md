---
layout: post
title: OAuth2-03-springboot 整合
date:  2017-02-25 08:46:41 +0800
categories: [Auth]
tags: [oauth, spring-intergration, spring-cloud, sh]
published: true
---

# 序言

安全性是暴露由许多微服务组成的公共访问API时要考虑的最重要的一个方面。

Spring有一些有趣的功能和框架，使我们的微服务安全配置更容易。

在本文中，我将向您展示如何使用Spring Cloud和Oauth2在API网关后面提供令牌访问安全性。

# 理论知识

OAuth2标准目前被所有主要网站使用并且允许通过共享API访问其资源。它是一种开放式授权标准，允许用户将存储在一个页面中的私有资源共享到另一个页面，而无需进入其凭据服务。这些是与oauth2相关的基本术语。

Resource Owner – 处理对资源的访问

Resource Server – 存储可以使用特殊令牌共享的所有者资源的服务器

Authorization Server – 管理密钥，令牌和其他临时资源访问代码的分配。它还必须确保授予相关人员访问权限

Access Token – 允许访问资源的密钥

Authorization Grant – 授予访问权限。有多种方法可以确认访问权限：授权代码，隐式，资源所有者密码凭据和客户端凭据

您可以在此处以及在digitalocean文章中阅读有关此标准的更多信息。该协议的流程主要有三个步骤。

首先，我们将授权请求发送给资源所有者。在资源所有者响应后，我们向授权服务器发送授权请求并接收访问令牌。

最后，我们将此访问令牌发送到资源服务器，如果它有效，则API将资源提供给应用程序。

# 方案

下图显示了我们案例的架构。我们用API网关（Zuul）代理我们对授权服务器的请求和两个帐户微服务实例。

授权服务器是某种提供outh2安全机制的基础结构服务。

我们还有发现服务（Eureka），我们所有的微服务都已注册。

![方案](https://ss.csdn.net/p?https://mmbiz.qpic.cn/mmbiz_png/R3InYSAIZkGVJ9Wn31ESXpe6jEjiaENcY53FjtpoyjiaV9enkibu4ricj4V9xibIiaecgm0enNZJdT1ibMFz8Agn6vOPQ/640?wx_fmt=png)


# springboot 整合例子

以下是一个简单的Java Spring整合OAuth 2.0的入门例子。这个例子使用Spring Boot构建，并使用Spring Security OAuth2来实现OAuth2.0认证。

在这个例子中，我们将使用GitHub作为OAuth2.0的提供者。

首先，确保你有一个Spring Boot项目的基本结构。

然后，按照以下步骤进行：

1. 添加Spring Security OAuth2依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

2. 创建一个OAuth2的配置类：

```java
import org.springframework.boot.autoconfigure.security.oauth2.client.EnableOAuth2Sso;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableOAuth2Sso
public class OAuth2Config extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
            .antMatchers("/", "/login**").permitAll()
            .anyRequest().authenticated();
    }
}
```

3. 添加application.yml配置：

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: YOUR_CLIENT_ID
            client-secret: YOUR_CLIENT_SECRET
            scope: read:user
        provider:
          github:
            user-name-attribute: login
```
将`YOUR_CLIENT_ID`和`YOUR_CLIENT_SECRET`替换为你在GitHub注册应用时获得的客户端ID和客户端密钥。

4. 创建一个简单的控制器：

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/")
    public String hello() {
        return "Hello, OAuth2!";
    }
}
```

现在，当你启动应用程序时，它将自动重定向到GitHub登录页面进行身份验证。

成功登录后，用户将被重定向回你的应用程序，并且可以访问根路径("/")，返回"Hello, OAuth2!"。

这只是一个简单的入门例子，你可以根据自己的需求扩展和定制它。

# 参考资料


[使用Oauth2实现微服务的安全保护](https://mp.weixin.qq.com/s/ScsXPdA5uKz9qVrv_CGC3A)

https://blog.csdn.net/j3T9Z7H/article/details/88016463

* any list
{:toc}