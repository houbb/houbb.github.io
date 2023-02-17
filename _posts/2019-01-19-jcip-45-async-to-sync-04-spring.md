---
layout: post
title:  java 手写并发框架（四）异步转同步框架spring整合
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [concurrency, thread, async, sync, sh]
published: true
---

# 序言

上一节我们学习了异步查询转同步的 7 种实现方式，今天我们就来学习一下，如何对其进行封装，使其成为一个更加便于使用的工具。

思维导图如下：

![异步转同步](https://upload-images.jianshu.io/upload_images/5874675-ca3be5d5fce5cf24.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

本节主要介绍注解框架如何整合 spring 和 springboot。

让我们的框架使用更加便利。

## 拓展阅读

[java 手写并发框架（一）异步查询转同步的 7 种实现方式](https://houbb.github.io/2019/01/18/jcip-42-async-to-sync)

[java 手写并发框架（二）异步转同步框架封装锁策略](https://houbb.github.io/2019/01/18/jcip-43-async-to-sync-02-lock)

[java 手写并发框架（三）异步转同步框架注解和字节码增强](https://houbb.github.io/2019/01/18/jcip-44-async-to-sync-03-annotation-cglib)

[java 手写并发框架（四）异步转同步框架spring整合](https://houbb.github.io/2019/01/18/jcip-45-async-to-sync-04-spring)

# 整合思路

## spring 整合

其实整体的实现类似于 spring 的 `@Retry` 注解。

（1）在锁同步方法上使用对应的注解 `@Sync`
 
（2）在异步回调方法上使用注解 `@SyncCallback`

（3）通过定义 aop 切面，实现拦截调用

## springboot 整合

通过 spring-boot-starter 特性，实现与 springboot 的整合

# spring 整合实现

## 注解定义

我们定义 `@EnableSync` 注解，用于声明启用 Sync 同步功能。

这个用过 spring 框架的，应该见过很多类似的注解，比如 `@EnableAsync` `@EnableRetry` 等等。

```java
package com.github.houbb.sync.spring.annotation;

import com.github.houbb.sync.spring.config.SyncAopConfig;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * 启用自动日志注解
 * @author binbin.hou
 * @since 0.0.2
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(SyncAopConfig.class)
@EnableAspectJAutoProxy
public @interface EnableSync {
}
```

这里导入了一个 SyncAopConfig 配置。

实现如下：

```java
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * 自动 sync aop 配置
 *
 * @author binbin.hou
 * @since 0.0.2
 */
@Configuration
@ComponentScan(basePackages = "com.github.houbb.sync.spring")
public class SyncAopConfig {
}
```

主要用于指定需要扫描的包。

## aop 核心实现

```java
package com.github.houbb.sync.spring.aop;

import com.github.houbb.aop.spring.util.SpringAopUtil;
import com.github.houbb.sync.api.annotation.Sync;
import com.github.houbb.sync.api.annotation.SyncCallback;
import com.github.houbb.sync.api.api.ISyncContext;
import com.github.houbb.sync.core.bs.SyncBs;
import com.github.houbb.sync.spring.context.SpringAopSyncContext;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * 这是一种写法
 * @author binbin.hou
 * @since 0.0.2
 */
@Aspect
@Component
@EnableAspectJAutoProxy
public class SyncAop {

    /**
     *
     * 切面方法：
     *
     * （1）扫描所有的共有方法
     * <pre>
     *     execution(public * *(..))
     * </pre>
     *
     * 问题：切面太大，废弃。
     * 使用扫描注解的方式替代。
     *
     * （2）扫描指定注解的方式
     *
     * 其实可以在 aop 中直接获取到注解信息，暂时先不调整。
     * 暂时先不添加 public 的限定
     *
     * （3）直接改成注解的优缺点：
     * 优点：减少了 aop 的切面访问
     * 缺点：弱化了注解的特性，本来是只要指定的注解即可，
     *
     * 不过考虑到使用者的熟练度，如果用户知道了自定义注解，自定义 aop 应该也不是问题。
     */
    @Pointcut("@within(com.github.houbb.sync.api.annotation.Sync)" +
            "|| @within(com.github.houbb.sync.api.annotation.SyncCallback)" +
            "|| @annotation(com.github.houbb.sync.api.annotation.Sync)" +
            "|| @annotation(com.github.houbb.sync.api.annotation.SyncCallback)")
    public void syncPointcut() {
    }

    /**
     * 执行核心方法
     *
     * 相当于 MethodInterceptor
     *
     * @param point 切点
     * @return 结果
     * @throws Throwable 异常信息
     * @since 0.0.2
     */
    @Around("syncPointcut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        Method method = SpringAopUtil.getCurrentMethod(point);
        Sync sync = AnnotationUtils.getAnnotation(method, Sync.class);
        SyncCallback callback = AnnotationUtils.getAnnotation(method, SyncCallback.class);

        ISyncContext context = SpringAopSyncContext.newInstance()
                .method(method)
                .sync(sync)
                .callback(callback)
                .point(point);

        return SyncBs.newInstance()
                .syncContext(context)
                .execute();
    }

}
```

这里统一拦截指定了 `@Sync` 和 `@SyncCallback` 注解的方法。

复用了原来的代理的实现，当然你可以重新实现。

# spring 整合验证

在有了字节码增强的基础上，我们实现 spring 整合实际上非常简单。

下面让我们验证一下实现是否符合我们的预期。

## maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sync-spring</artifactId>
    <version>${project.version}</version>
</dependency>
```

## 入门测试

### 配置类

`@EnableSync` 注解启用 sync 特性。

```java
@Configurable
@ComponentScan(basePackages = "com.github.houbb.sync.test.service")
@EnableSync
public class SpringConfig {
}
```

### 业务代码

和以前一样

```java
@Service
public class UserService {

    String id = "";

    @Sync
    public String queryId() {
        System.out.println("开始查询");
        return id;
    }

    @SyncCallback(value = "queryId")
    public void queryIdCallback() {
        System.out.println("回调函数执行");
        id = "123";
    }

}
```

### 测试代码

```java
@ContextConfiguration(classes = SpringConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class SpringUserServiceTest {

    @Autowired
    private UserService userService;

    @Test
    public void queryIdTest() {
        // 异步执行回调
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    System.out.println("开始异步执行回调");
                    TimeUnit.SECONDS.sleep(2);
                    userService.queryIdCallback();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();

        String id = userService.queryId();
        System.out.println("id: " + id);
    }

}
```

测试结果符合我们的预期，日志和上一节类似，此处就不再贴出。

# springboot 整合实现

## 整合原理

利用 spring-boot-starter，在 `spring.factories` 文件中指定如下内容：

```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=com.github.houbb.sync.springboot.starter.config.SyncAutoConfig
```

这样就可以在 springboot 启动的时候自动加载我们定义的配置类。

## SyncAutoConfig 配置

```java
package com.github.houbb.sync.springboot.starter.config;

import com.github.houbb.sync.spring.annotation.EnableSync;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Configuration;

/**
 * 异步转同步自动配置
 * @author binbin.hou
 * @since 0.0.3
 */
@Configuration
@ConditionalOnClass(EnableSync.class)
@EnableSync
public class SyncAutoConfig {
}
```

实现非常的简单，直接启用 `@EnableSync` 注解。

这样使用的时候只需要引入 jar，就可以自定生效了。

当然也可以和 springboot 的配置文件配合，提供更加灵活的配置。

## 验证

### maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>sync-springboot-starter</artifactId>
    <version>${最新版本}</version>
</dependency>
```

### 配置

```java
@SpringBootApplication
public class SyncApplication {

    public static void main(String[] args) {
        SpringApplication.run(SyncApplication.class, args);
    }

}
```

只需要引入 jar 即可，业务类的定义和 spring 整合保持一致，然后就可以开始使用了。

# 小结

到这里我们就把同步框架整合 spring 和 springboot 基本完成了。

回顾我们整个历程，从最开始的异步查询转同步的 7 种方式，到对其中几种常见的封装，然后是字节码结合注解的代理使用，最后是本节的 spring 的整合。

这一路走来，基本上同步工具到了一个勉强可用的阶段。

但是依然存在很多问题，比如并发时的问题，性能问题等等，这个后续有机会我们一起去解决。

觉得本文对你有帮助的话，欢迎点赞评论收藏转发一波。你的鼓励，是我最大的动力~

不知道你有哪些收获呢？或者有其他更多的想法，欢迎留言区和我一起讨论，期待与你的思考相遇。

文中如果链接失效，可以点击 {阅读原文}。

* any list
{:toc}