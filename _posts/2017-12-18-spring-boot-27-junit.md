---
layout: post
title:  Spring Boot-27-springboot junit5 单元测试怎么写？springboot+junit4
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# springboot + junit4

## 说明

如果是 springboot + junit4 如何编写？

## maven 依赖

```xml
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>

    <!-- Spring Boot Test Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- JUnit 4 -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.1</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## 测试代码

在JUnit 4中，你可以使用@RunWith注解来指定测试运行器。

对于Spring Boot应用程序，通常会使用SpringJUnit4ClassRunner作为测试运行器，并通过@ContextConfiguration注解指定Spring Boot应用程序的配置类。

以下是一个示例，演示如何使用@RunWith和@ContextConfiguration在JUnit 4中指定Spring Boot应用程序的配置类：

```java
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest
@ContextConfiguration(classes = MySpringBootApplication.class)
public class MyTests {

    @Test
    public void testSum() {
        int result = sum(2, 3);
        assertEquals(5, result);
    }

    private int sum(int a, int b) {
        return a + b;
    }
}
```

# springboot + junit5

## 说明 

springboot 与 junit5 的单元测试整合。

## 入门例子

### maven 依赖

```xml
<dependencies>
    <!-- 其他依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 注解指定 

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class MyIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void testHelloEndpoint() {
        String url = "http://localhost:" + port + "/hello";
        String response = restTemplate.getForObject(url, String.class);
        assertEquals("Hello, World!", response);
    }
}
```

在这个例子中，@SpringBootTest注解的webEnvironment属性被设置为WebEnvironment.RANDOM_PORT，这样会随机选择一个可用的端口来启动内嵌的Servlet容器。

@LocalServerPort注解用于注入当前应用程序运行的端口号。TestRestTemplate对象用于发送HTTP请求和接收响应。

### 指定启动类

```java
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;

@SpringBootTest(classes = YourSpringBootApplication.class)
public class YourIntegrationTest {

    @Test
    public void yourTestMethod() {
        // 测试逻辑
    }
}
```

# 参考资料

chat

* any list
{:toc}
