---
layout: post
title:  Spring Security-03-maven 整合使用
date:  2017-12-19 22:29:09 +0800
categories: [Spring]
tags: [spring, spring-security, web-safe]
published: true
---

# Spring Security 系列

[Spring Security-01-Hello World](https://houbb.github.io/2017/12/19/spring-security-01-hello-world)

[Spring Security-02-springboot 入门使用实战](https://houbb.github.io/2017/12/19/spring-security-02-springboot)

[Spring Security-03-maven 整合使用](https://houbb.github.io/2017/12/19/spring-security-03-maven)

[Spring Security-04-密码加密详解及源码分析](https://houbb.github.io/2017/12/19/spring-security-04-passwordEncoder)

[Spring Security-05-CSRF 跨域攻击](https://houbb.github.io/2017/12/19/spring-security-05-csrf)

[Spring Security-06-安全响应头配置详解](https://houbb.github.io/2017/12/19/spring-security-06-security-response-headers)

[Spring Security-07-整体架构概览](https://houbb.github.io/2017/12/19/spring-security-07-big-picture)

[Spring Security-08-Authentication 认证详解](https://houbb.github.io/2017/12/19/spring-security-08-authc)

[Spring Security-09-Authentication session 管理](https://houbb.github.io/2017/12/19/spring-security-09-authc-session-management)

[Spring Security-10-Authentication 记住我特性实现](https://houbb.github.io/2017/12/19/spring-security-10-authc-remember-me)

[Spring Security-11-Authentication 匿名登录特性 & RunAS 以 xx 身份](https://houbb.github.io/2017/12/19/spring-security-11-authc-annoy)

[Spring Security-12-Authentication logout 登出特性](https://houbb.github.io/2017/12/19/spring-security-12-authc-logout)

[Spring Security-13-Authorization 授权](https://houbb.github.io/2017/12/19/spring-security-13-autha-overview)

[Spring Security-14-Authorization 使用FilterSecurityInterceptor授权HttpServletRequest](https://houbb.github.io/2017/12/19/spring-security-14-autha-servlet)

[Spring Security-15-Authorization 基于表达式的访问控制](https://houbb.github.io/2017/12/19/spring-security-15-expression)

[Spring Security-16-Authorization 安全对象实施](https://houbb.github.io/2017/12/19/spring-security-16-security-object)

[Spring Security-17-Authorization 方法安全](https://houbb.github.io/2017/12/19/spring-security-17-method-security)

[Spring Security-18-Authorization Domain Object Security (ACLs)](https://houbb.github.io/2017/12/19/spring-security-18-domain-object)

# 序言

这一节我们来学习一下 spring security 使用 maven 的几种导入方法。

# springboot 整合使用

Spring Boot提供了一个 `spring-boot-starter-security` 入门工具，该工具将与Spring Security相关的依赖项聚合在一起。 

```xml
<dependencies>
    <!-- ... other dependency elements ... -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
</dependencies>
```

由于Spring Boot提供了Maven BOM来管理依赖版本，因此无需指定版本。 

如果希望覆盖Spring Security版本，可以通过提供Maven属性来实现，如以下示例所示：

```xml
<properties>
    <!-- ... -->
    <spring-security.version>5.4.2</spring-security.version>
</dependencies>
```

由于Spring Security仅在主要版本中进行重大更改，因此可以将较新版本的Spring Security与Spring Boot一起使用是安全的。 

但是，有时可能还需要更新Spring Framework的版本。

可以通过添加Maven属性来执行此操作，如以下示例所示：

```xml
<properties>
    <!-- ... -->
    <spring.version>5.2.11.RELEASE</spring.version>
</dependencies>
```


# 不和 springboot 整合

如果我们不需要和 springboot 整合，那么版本统一控制怎么处理呢？

可以使用 Spring Security’s BOM

```xml
<dependencyManagement>
    <dependencies>
        <!-- ... other dependency elements ... -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-bom</artifactId>
            <version>{spring-security-version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

最小的依赖如下：

```xml
<dependencies>
    <!-- ... other dependency elements ... -->
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-config</artifactId>
    </dependency>
</dependencies>
```

Spring Security是基于Spring Framework 5.2.11.RELEASE构建的，但通常应与任何较新版本的Spring Framework 5.x一起使用。 

如果有各种版本报错，比较简单的方式是引入如下的 spring bom:

```xml
<dependencyManagement>
    <dependencies>
        <!-- ... other dependency elements ... -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-framework-bom</artifactId>
            <version>5.2.11.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

# maven 仓库的特殊版本

一般情况下，对应的版本都发布到了 maven 中央仓库。

如果你处于学习的目的，可能需要查看 snapshot 的版本，可以配置一下对应的仓库信息：

## 快照版本

```xml
<repositories>
    <!-- ... possibly other repository elements ... -->
    <repository>
        <id>spring-snapshot</id>
        <name>Spring Snapshot Repository</name>
        <url>https://repo.spring.io/snapshot</url>
    </repository>
</repositories>
```

## 里程碑版本

如果使用里程碑版本或候选版本，则需要确保定义了Spring Milestone存储库，如以下示例所示：

```xml
<repositories>
    <!-- ... possibly other repository elements ... -->
    <repository>
        <id>spring-milestone</id>
        <name>Spring Milestone Repository</name>
        <url>https://repo.spring.io/milestone</url>
    </repository>
</repositories>
```

# 小结

这一节简单介绍了 spring security 通过 maven 引入的几种方式，为我们后续学习做好铺垫。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features](https://docs.spring.io/spring-security/site/docs/5.4.2/reference/html5/#features)

* any list
{:toc}