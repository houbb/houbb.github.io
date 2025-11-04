---
layout: post
title: OpenAPI-02-OpenAPI Specification (OAS) springboot 入门例子
date: 2025-11-05 14:12:33 +0800
categories: [HTTP]
tags: [http, openapi, sh]
published: true
---

# 前言

当然，java 配套的工具也非常完善了，不需要我们手动去写。

可以认为这个就是 swagger 的增强版本。

# 入门例子

## maven 依赖

- pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.github.houbb.openapi.demo</groupId>
    <artifactId>openapi-springboot-demo</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    <name>OpenAPI Spring Boot Demo</name>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <properties>
        <java.version>17</java.version>
<!--        <spring.boot.version>3.3.4</spring.boot.version>-->
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.6.0</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

- application.yaml

```yaml
server:
  port: 8080

spring:
  application:
    name: openapi-springboot-demo
```

## 代码

HelloController

```java
package com.github.houbb.openapi.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hello")
@Tag(name = "Hello 接口", description = "示例 API 接口")
public class HelloController {

    @GetMapping
    @Operation(summary = "获取问候信息", description = "返回一个简单的问候语")
    public String sayHello(@RequestParam(defaultValue = "World") String name) {
        return "Hello, " + name + "!";
    }

    @PostMapping
    @Operation(summary = "提交问候信息", description = "演示 POST 请求")
    public String postHello(@RequestBody String message) {
        return "You posted: " + message;
    }
}
```

配置类

```java
package com.github.houbb.openapi.demo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("示例 API 文档")
                        .version("1.0.0")
                        .description("这是一个 Spring Boot + OpenAPI 的整合示例"));
    }
}
```

启动类

```java
package com.github.houbb.openapi.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

## 访问

启动后，直接访问

Swagger UI 页面：http://localhost:8080/swagger-ui.html

OpenAPI JSON 文档：http://localhost:8080/v3/api-docs

OpenAPI YAML 文档：http://localhost:8080/v3/api-docs.yaml

# 拓展阅读

代码地址

> [https://github.com/houbb/openapi-springboot-demo](https://github.com/houbb/openapi-springboot-demo)

# 参考资料

* any list
{:toc}