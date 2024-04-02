---
layout: post
title:  Spring Security-03-maven 整合使用
date:  2017-12-19 22:29:09 +0800
categories: [Spring]
tags: [spring, spring-security, web-safe]
published: true
---


# 序言

前面我们学习了 [spring security 与 springmvc 的整合入门教程](https://www.toutiao.com/i6884852647480787459/)。

[spring secutity整合springboot入门](https://www.toutiao.com/item/6916894767628468747/)

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