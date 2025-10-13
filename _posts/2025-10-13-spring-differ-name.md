---
layout: post
title: spring 中同一个 bean 在一个类中指定多次不同的名字，如何？
date: 2025-10-13 20:40:12 +0800
categories: [Java]
tags: [java, maven, sh, spring]
published: true
---


# 背景

最近在修改旧的业务代码，其中有一个地方，原本是同步 dubbo、异步 dubbo。

想把异步的 dubbo 去掉，那么 那么一个 bean 指定名称多次可以吗？


# 测试

## maven 

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>springboot-demo-20251013</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>1.2.5.RELEASE</version>
        <relativePath/>
    </parent>

    <dependencies>
        <!-- Web 模块 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- 测试依赖（可选） -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- 打包插件 -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
```

## 代码

### 启动类

```java
package org.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication  // 标注为 Spring Boot 启动类
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

}
```

### UserService

```java
package org.example.demo;

import org.springframework.stereotype.Service;

@Service
public class UserService {

    public void sayHello() {
        System.out.println("Hello from UserService!");
    }
}
```

### 启动测试类

```java
package org.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class BeanListener implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Autowired
    private UserService userService2;

    @Override
    public void run(String... args) throws Exception {
        userService.sayHello();
        userService2.sayHello();
    }

}
```

## 测试

效果

```
Hello from UserService!
Hello from UserService!
```

说明可以指定同一个 bean 的 2个不同名字。


* any list
{:toc}