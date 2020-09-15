---
layout: post
title:  Spring Boot-13-session 结合 redis 入门
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# 分布式 session 

分布式系统中，登录的 session 信息一般都是存放在 redis 中的。

本文记录一下 spring-boot 整合的 spring-session 和 redis 实现。

# 快速开始

## 准备工作

本地启动 redis 服务

```
[21496] 15 Sep 09:24:37.508 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
[21496] 15 Sep 09:24:37.510 # Redis version=5.0.9, bits=64, commit=9414ab9b, modified=0, pid=21496, just started
[21496] 15 Sep 09:24:37.510 # Configuration loaded
[21496] 15 Sep 09:24:37.513 # Could not create server TCP listening socket 127.0.0.1:6379: bind: 操作成功完成。
```

- 进入客户端

```
$ redis-cli.exe
127.0.0.1:6379>
```

此时保证 redis 中数据是空的，或者没有干扰数据：

```
127.0.0.1:6379> keys *
(empty list or set)
```

## 基本代码

### pom.xml

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.session</groupId>
        <artifactId>spring-session</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
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
```

### 目录结构

```
D:.
├─java
│  └─com
│      └─github
│          └─houbb
│              └─spring
│                  └─boot
│                      └─session
│                          │  Application.java
│                          │
│                          ├─config
│                          │      HttpSessionConfig.java
│                          │
│                          └─controller
│                                  ExampleController.java
│
└─resources
        application.properties
```

### 后端代码

- 启动 session

```java
@EnableRedisHttpSession
public class HttpSessionConfig {
}
```

- Controller 示例代码

```java
@RestController
public class ExampleController {

    @RequestMapping("/set")
    public String set(HttpServletRequest req) {
        req.getSession().setAttribute("testKey", "testValue");
        return "设置session:testKey=testValue";
    }

    @RequestMapping("/query")
    public String query(HttpServletRequest req) {
        Object value = req.getSession().getAttribute("testKey");
        return "查询Session：\"testKey\"=" + value;
    }

}
```

### 配置文件

主要指定 redis 的配置信息。此处为本地 redis。

```
spring.redis.host=127.0.0.1
spring.redis.password=
spring.redis.port=6379
```

## 启动测试

### 设置

浏览器访问 [http://localhost:8080/set](http://localhost:8080/set)

页面返回：

```
设置session:testKey=testValue
```

### 查询

浏览器访问 [http://localhost:8080/query](http://localhost:8080/query)

页面返回：

```
查询Session："testKey"=testValue
```

### 信息的存储

我们看一下 Redis 中的存储信息

```
127.0.0.1:6379> keys *
1) "spring:session:sessions:d37d1c0a-5c4a-4c60-906b-7657be1e6bc7"
2) "spring:session:expirations:1600135380000"
3) "spring:session:sessions:expires:d37d1c0a-5c4a-4c60-906b-7657be1e6bc7"
```

这是 spring-session 为我们创建的 3 个 key

我们也可以看一下对应的值

- spring:session:sessions:d37d1c0a-5c4a-4c60-906b-7657be1e6bc7

```
127.0.0.1:6379> hgetall spring:session:sessions:d37d1c0a-5c4a-4c60-906b-7657be1e6bc7
1) "lastAccessedTime"
2) "\xac\xed\x00\x05sr\x00\x0ejava.lang.Long;\x8b\xe4\x90\xcc\x8f#\xdf\x02\x00\x01J\x00\x05valuexr\x00\x10java.lang.Number\x86\xac\x95\x1d\x0b\x94\xe0\x8b\x02\x00\x00xp\x00\x00\x01t\x8fd_\xef"
3) "maxInactiveInterval"
4) "\xac\xed\x00\x05sr\x00\x11java.lang.Integer\x12\xe2\xa0\xa4\xf7\x81\x878\x02\x00\x01I\x00\x05valuexr\x00\x10java.lang.Number\x86\xac\x95\x1d\x0b\x94\xe0\x8b\x02\x00\x00xp\x00\x00\a\b"
5) "sessionAttr:testKey"
6) "\xac\xed\x00\x05t\x00\ttestValue"
7) "creationTime"
8) "\xac\xed\x00\x05sr\x00\x0ejava.lang.Long;\x8b\xe4\x90\xcc\x8f#\xdf\x02\x00\x01J\x00\x05valuexr\x00\x10java.lang.Number\x86\xac\x95\x1d\x0b\x94\xe0\x8b\x02\x00\x00xp\x00\x00\x01t\x8fd_\xef"
```

- spring:session:expirations:1600135380000

```
127.0.0.1:6379> smembers spring:session:expirations:1600135380000
1) "\xac\xed\x00\x05t\x00,expires:d37d1c0a-5c4a-4c60-906b-7657be1e6bc7"
```

- spring:session:sessions:expires:d37d1c0a-5c4a-4c60-906b-7657be1e6bc7

```
127.0.0.1:6379> get spring:session:sessions:expires:d37d1c0a-5c4a-4c60-906b-7657be1e6bc7
""
```

# 基于拦截器的处理

实际开发过程中，我们肯定不希望每一次请求都自己去实现 session 的校验，查询等处理。

关于这一点，可以直接交给 mvc 的拦截器实现。

## 核心代码

实际上就是一个 servlet 的拦截器，每次请求获取对应的 session 信息。

这个可以基于 cookies/session/token 等等。

```java
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class SessionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o) throws Exception {
        String token = httpServletRequest.getParameter("token");
        String roleInfo = mockTokenResp(token);
        if(StringUtils.isEmpty(roleInfo)) {
            // 登录信息非法，跳转到登录页面等操作
            return false;
        }

        // 根据信息设置等操作

        return true;
    }

    /**
     * 根据 token 去 redis 等取 session 信息，此处直接 mock 掉
     * @param token 请求参数，可以是 sessionId, JWT 等
     * @return 结果
     */
    private String mockTokenResp(String token) {
        if("ryo".equals(token)) {
            return "admin";
        }
        return "";
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {

    }
}
```

# 参考资料

[SpringBoot 之Actuator](https://www.cnblogs.com/jmcui/p/9820579.html)

* any list
{:toc}
