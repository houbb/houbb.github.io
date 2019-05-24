---
layout: post
title:  Annotation-09-spring aop import 导入自动引入
date:  2018-07-02 23:26:27+0800
categories: [Java]
tags: [java, annotation, spring]
published: true
---

# 需求

有时候我们希望写一个框架，让别人直接使用我们的注解。

然后这些注解就可以生效。

比如 spring 的 Cache 注解。

spring 的 `@import` 注解为我们带来了这种可能性。

# 方式

## 定义 aop

```java
/**
 * @author binbin.hou
 * @since 0.0.4
 */
@Aspect
@Component
public class RetryAop {

    /**
     * 扫描所有的共有方法
     */
    @Pointcut("execution(public * *(..))")
    public void myPointcut() {
    }

    @Around("myPointcut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        // 具体的代码增强步骤
    }
}
```

## 定义 config

我们在 config 中指定扫描当前框架包。

```java
package com.github.houbb.sisyphus.spring.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * 重试 aop 配置
 * @author binbin.hou
 * @since 0.0.4
 */
@Configuration
@ComponentScan(basePackages = "com.github.houbb.sisyphus.spring")
public class RetryAopConfig {
}
```

## EnableXXX 注解

为了用户方便开启注解，我们定义一个注解：

```java
import com.github.houbb.sisyphus.spring.config.RetryAopConfig;
import org.springframework.cache.annotation.CachingConfigurationSelector;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * 启用重试注解
 * @author binbin.hou
 * @since 0.0.4
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(RetryAopConfig.class)
@EnableAspectJAutoProxy
public @interface EnableRetry {
}
```

用于至于要在 config 中使用 `@EnableRetry` 就可以使得当前 AOP 生效。

* any list
{:toc}