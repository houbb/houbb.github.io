---
layout: post
title: 权限体系之-21-passport springboot 整合 log4j2
date: 2025-11-20 14:12:33 +0800
categories: [plateform]
tags: [plateform, sh]
published: true
---


# 核心目的

console 控台看日志 dev 阶段还行，不适合真正的产线阶段。

希望引入整合 log4j2

并且日志引入 tid

ERROR 日志级别单独的文件，方便问题排查。

# 实现

## 包排除

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <!-- 排除默认 logback -->
        <exclusions>
            <exclusion>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-logging</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <!-- log4j2 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-log4j2</artifactId>
    </dependency>
</dependencies>
```

## TID 

把 **每个请求的 TID（Trace ID）** 也记录到日志里，这是企业级系统非常常见的做法。

我们可以通过 **Log4j2 的 ThreadContext（MDC）** 来实现。整体方案如下：

## 1️⃣ 添加 TID 到每个请求

在 Spring Boot 后端创建一个 **拦截器**，给每个请求生成一个唯一 TID，并放入 Log4j2 的 **ThreadContext**：

```java
package com.github.houbb.passport.plateform.backend.interceptor;

import org.apache.logging.log4j.ThreadContext;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.UUID;

@Component
public class TraceIdInterceptor implements HandlerInterceptor {

    private static final String TID_KEY = "tid";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String tid = UUID.randomUUID().toString().replace("-", "");
        ThreadContext.put(TID_KEY, tid);
        response.setHeader("X-TID", tid); // 可返回给前端
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        ThreadContext.remove(TID_KEY); // 避免内存泄漏
    }
}
```

**注册拦截器：**

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private TraceIdInterceptor traceIdInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(traceIdInterceptor).addPathPatterns("/**");
    }
}
```

---

## 2️⃣ Log4j2 配置优化（支持 TID、按天归档、错误日志分离）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN" monitorInterval="60">
    <Properties>
        <Property name="LOG_HOME">/app/logs/passport-plateform</Property>
        <Property name="PATTERN">%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] [TID=%X{tid}] %-5level %logger{36} - %msg%n</Property>
    </Properties>

    <Appenders>
        <!-- 通用日志，按天滚动 -->
        <RollingFile name="RollingFile" fileName="${LOG_HOME}/app.log"
                     filePattern="${LOG_HOME}/archive/app-%d{yyyy-MM-dd}.log.gz">
            <PatternLayout pattern="${PATTERN}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <DefaultRolloverStrategy max="30"/>
        </RollingFile>

        <!-- 错误日志单独输出 -->
        <RollingFile name="ErrorFile" fileName="${LOG_HOME}/error.log"
                     filePattern="${LOG_HOME}/archive/error-%d{yyyy-MM-dd}.log.gz">
            <PatternLayout pattern="${PATTERN}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
            </Policies>
            <DefaultRolloverStrategy max="30"/>
            <Filters>
                <ThresholdFilter level="error" onMatch="ACCEPT" onMismatch="DENY"/>
            </Filters>
        </RollingFile>

        <!-- 控制台输出 -->
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="${PATTERN}"/>
        </Console>
    </Appenders>

    <Loggers>
        <!-- 默认日志 -->
        <Root level="info">
            <AppenderRef ref="RollingFile"/>
            <AppenderRef ref="ErrorFile"/>
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>
```

**特点**：

1. 每条日志都会输出 TID：`[TID=xxxx]`
2. 日志分为普通日志和错误日志，按天归档压缩
3. 控制台输出保留开发可视化
4. 日志文件路径可灵活修改

---

## 3️⃣ 使用方式

1. 保证 `pom.xml` 已经引入 `spring-boot-starter-log4j2` 并排除 logback
2. 在 `application.properties` 配置：

```properties
logging.config=classpath:log4j2.xml
```

3. Spring Boot 启动后，每条请求日志都自动带上 TID，便于全链路跟踪

* any list
{:toc}