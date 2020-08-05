---
layout: post
title: java 表单避免重复提交
date:  2018-09-14 12:02:42 +0800
categories: [Web]
tags: [web, java, web-safe, in-action, sh]
published: true
excerpt: java 表单避免重复提交
---

# 面试经历

记得刚毕业的时候，有一次去参加面试。

上来面试官问我：“你们项目中是怎么做防重复提交的？”

一开始听到这个问题是蒙圈的，支支吾吾半天没回答出来。

然后面试官直接来一道算法题，喜闻乐见地面试失败。

多年过去，虽然很少接触到控台应用，但是近期对于防止重复提交却有了一点自己的心得。

在这里分享给大家，希望你工作或者面试中遇到类似的问题时，对你有所帮助。

本文将从以下几个方面展开：

（1）重复提交产生的原因

（2）什么是幂等性

（3）针对重复提交，前后端的解决方案

（4）如果实现一个防重复提交工具

# 产生原因

由于重复点击或者网络重发 

eg:

点击提交按钮两次;

点击刷新按钮;

使用浏览器后退按钮重复之前的操作，导致重复提交表单;

使用浏览器历史记录重复提交表单;

浏览器重复的HTTP请求;

nginx重发等情况;

分布式RPC的try重发等;

主要有 2 个部分：

（1）前端用户操作

（2）网络请求可能存在重试

当然也不排除一些用户的恶意操作。

# java 表单避免重复提交

## 问题

就是同一份信息，重复的提交给服务器。

## 场景

1. 点击F5刷新页面: 当用户点击submit将已经写好的表单数据提交到服务器时，可以在浏览器的url看到地址和参数的变化,但因为网速等问题，用户当前页面并未刷新，或者点击刷新页面，造成表单重复提交。

2. 重复点击提交按钮: 因为网络问题，未能及时跳转显示内容，部分用户可能会出于心急重复提交提交按钮，造成多次提交内容到服务器。

3. 前进后退操作 :有些用户在进行某些工作操作时，可能出于需要或者某种情况，进行后退操作，浏览刚才填入的信息，在进行后退和前进的操作可能也会造成表单数据重复提交到服务器。

4. 使用浏览器历史记录重复访问: 某些用户可能会出于好奇，利用浏览器的历史记录功能重复访问提交页面，同样会造成表单重复提交问题。

# 解决思路

## 前端

### 方案一：禁用按钮提交

设置标志位，提交之后禁止按钮。像一些短信验证码的按钮一般都会加一个前端的按钮禁用，毕竟发短信是需要钞票滴~

ps: 以前写前端就用过这种方式。

- 优点

简单。基本可以防止重复点击提交按钮造成的重复提交问题。

- 缺陷

前进后退操作，或者F5刷新页面等问题并不能得到解决。

最重要的一点，前端的代码只能防止不懂js的用户，如果碰到懂得js的编程人员，那js方法就没用了。

### 方案二：设置HTTP报头

设置HTTP报头，控制表单缓存，使得所控制的表单不缓存信息，这样用户就无法通过重复点击按钮去重复提交表单。

```html
<meta http-equiv="Cache-Control" content="no-cache, must-revalidate">
```

但是这样做也有局限性，用户在提交页面点击刷新也会造成表单的重复提交。

### 方案三：通过 PRG 设计模式

用来防止F5刷新重复提交表单。

PRG模式通过响应页面Header返回HTTP状态码进行页面跳转替代响应页面跳转过程。

具体过程如下:

> 客户端用POST方法请求服务器端数据变更，服务器对客户端发来的请求进行处理重定向到另一个结果页面上，客户端所有对页面的显示请求都用get方法告知服务器端，这样做，后退再前进或刷新的行为都发出的是get请求，不会对server产生任何数据更改的影响。

这种方法实现起来相对比较简单，但此方法也不能防止所有情况。例如用户多次点击提交按钮;恶意用户避开客户端预防多次提交手段，进行重复提交请求;

下面谈一谈后端的防止重复提交。

## 后端

### 幂等性

如果是注册或存入数据库的操作，可以通过在数据库中字段设立唯一标识来解决，这样在进行数据库插入操作时，因为每次插入的数据都相同，数据库会拒绝写入。

这样也避免了向数据库中写入垃圾数据的情况，同时也解决了表单重复提交问题。

但是这种方法在业务逻辑上感觉是说不过去的，本来该有的逻辑，却因为数据库该有的设计隐藏了。

而且这种方法也有一定的功能局限性，只适用于某系特定的插入操作。

- 实现方式

这种操作，都需要有一个唯一标识。**数据库中做唯一索引约束，重复插入直接报错。**

- 缺点

有很大的约束性。

一般都是最后的一道防线，当请求走到数据库层的时候，一般已经消耗了较多的资源。

### session 方法

Java 使用Token令牌防止表单重复提交的步骤： 

1. 在服务器端生成一个唯一的随机标识号，专业术语称为Token(令牌)，同时在当前用户的Session域中保存这个Token。 

2. 将Token发送到客户端的Form表单中，在Form表单中使用隐藏域来存储这个Token，表单提交的时候连同这个Token一起提交到服务器端。 

3. 在服务器端判断客户端提交上来的Token与服务器端生成的Token是否一致，如果不一致，那就是重复提交了，此时服务器端就可以不处理重复提交的表单。如果相同则处理表单提交，处理完后清除当前用户的Session域中存储的标识号。 

下面的场景将拒绝处理用户提交的表单请求

1. 存储Session域中的Token(令牌)与表单提交的Token(令牌)不同。 

2. 当前用户的Session中不存在Token(令牌)。

这里的 session 按照单机和分布式，可以使用 redis/mysql 等解决分布式的问题。

这种方法算是比较经典的解决方案，但是需要前后端的配合。

下面来介绍通过加锁的方式，实现纯后台修改的实现。

#### 为什么要设置一个隐藏域？

这个问题我一开始没想明白，我认为，进入页面的时候设置一个session并且再token设值，添加的时候把这个值删掉。然后这样我们再按F5的时候就没办法重复提交了（因为这个时候判断session为空）。我觉得这样就ok了，设置hidden域感觉没任何必要。

然而简直是图样图森破，对于一般用户这样当然是可以的。

但是对于恶意用户呢？假如恶意用户开两个浏览器窗口(同一浏览器的窗口公用一个session)这样窗口1提交完，系统删掉session，窗口1停留着，他打开第二个窗口进入这个页面，系统又为他们添加了一个session，这个时候窗口1按下F5，那么直接重复提交！

所以，我们必须得用hidden隐藏一个uuid的token，并且在后台比较它是否与session中的值一致，只有这样才能保证F5是不可能被重复提交的！

### 直接加锁

为了避免短时间的重复提交，直接使用加锁的方式。

优点：不需要前端配合修改，纯后端。

缺点：无法像 token 方法，准确的限定为单次。只能限制固定时间内的操作一次。

个人理解：前端的方式依然是防君子不防小人。直接通过限制固定时间内无法操作，来限制重复提交。

这个时间不能太长，也不能太短，一般建议为 10S 左右，根据自己的真实业务调整。

锁也是同样的道理，token 其实也可以理解为一种特殊的锁。

锁同样可以分为单机锁+分布式的锁。

## 个人理解

前后端结合，前端减轻后端的压力，同时提升用户体验。

后端做最后的把关，避免恶意用户操作，确保数据的数据的正确性。

# 如何设计防重复提交框架

## 整体思路

session 方式和加锁的方式，二者实际上是可以统一的。

此处做一个抽象：

（1）获取锁

（2）释放锁

## session 流程 + 前端

session 的获取 token 让用户自己处理，比如打开页面，放在隐藏域。实际上这是一个释放锁的过程。

当操作的时候，只有 token 信息和后台一致，才认为是获取到了锁。用完这个锁就一直被锁住了，需要重新获取 token，才能释放锁。

所有的 session 都应该有 token 的失效时间，避免累计一堆无用的脏数据。

## 纯后端

- 获取锁

当请求的时候，直接根据 user_id（或者其他标识）+请求信息（自定义）=唯一的 key

然后把这个 key 存储在 cache 中。

如果是本地 map，可以自己实现 key 的清空。

或者借助 guava 的 key 过期，redis 的自动过期，乃至数据库的过期都可以。

原理是类似的，就是限制一定时间内，无法重复操作。

- 释放锁

固定时间后，key 被清空后就释放了锁。

## 注解定义

只有一个针对锁的获取：

- acquire

- tryAcquire

传入信息。

至于锁的释放，则交给实现者自己实现。

### 属性

1. 锁的获取策略 = 内存 RAM

内存 ConcurrentHashMP

Guava

Encache

redis

mysql

...

可以基于 session，或者基于 锁，

此处实现基于锁。

2. 锁的过期时间 = 5min

无论基于什么方式，这个值都需要。

只不过基于 session 的交给实现者处理，此处只是为了统一属性。


# 基于字节码的实现

## 测试案例

### maven 引入

```xml
<dependency>
    <group>com.github.houbb</group>
    <artifact>resubmit-core</artifact>
    <version>0.0.3</version>
</dependency>
```

### 服务类编写

指定 5s 内禁止重复提交。

```java
@Resubmit(ttl = 5)
public void queryInfo(final String id) {
    System.out.println("query info: " + id);
}
```

### 测试代码

相同的参数 5s 内直接提交2次，就会报错。

```java
@Test(expected = ResubmitException.class)
public void errorTest() {
    UserService service = ResubmitProxy.getProxy(new UserService());
    service.queryInfo("1");
    service.queryInfo("1");
}
```

## 核心实现

### 定义注解

- Resubmit.java

首先，我们定义一个注解。

```java
import com.github.houbb.resubmit.api.support.ICache;
import com.github.houbb.resubmit.api.support.IKeyGenerator;
import com.github.houbb.resubmit.api.support.ITokenGenerator;

import java.lang.annotation.*;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Documented
public @interface Resubmit {

    /**
     * 缓存实现策略
     * @return 实现
     * @since 0.0.1
     */
    Class<? extends ICache> cache() default ICache.class;

    /**
     * key 生成策略
     * @return 生成策略
     * @since 0.0.1
     */
    Class<? extends IKeyGenerator> keyGenerator() default IKeyGenerator.class;

    /**
     * 密匙生成策略
     * @return 生成策略
     * @since 0.0.1
     */
    Class<? extends ITokenGenerator> tokenGenerator() default ITokenGenerator.class;

    /**
     * 存活时间
     *
     * 单位：秒
     * @return 时间
     * @since 0.0.1
     */
    int ttl() default 60;

}
```

### 缓存接口实现

整体流程：

缓存接口，用于存放对应的请求信息。

每次请求，将 token+method+params 作为唯一的 key 存入，再次请求时判断是否存在。

如果已经存在，则认为是重复提交。

可自行拓展为基于 redis/mysql 等，解决分布式架构的数据共享问题。

存储信息的清理：

采用定时任务，每秒钟进行清理。

```java
public class ConcurrentHashMapCache implements ICache {

    /**
     * 日志信息
     * @since 0.0.1
     */
    private static final Log LOG = LogFactory.getLog(ConcurrentHashMapCache.class);

    /**
     * 存储信息
     * @since 0.0.1
     */
    private static final ConcurrentHashMap<String, Long> MAP = new ConcurrentHashMap<>();

    static {
        Executors.newScheduledThreadPool(1)
            .scheduleAtFixedRate(new CleanTask(), 1, 1,
                    TimeUnit.SECONDS);
    }

    /**
     * 清理任务执行
     * @since 0.0.1
     */
    private static class CleanTask implements Runnable {
        @Override
        public void run() {
            LOG.info("[Cache] 开始清理过期数据");

            // 当前时间固定，不需要考虑删除的耗时
            // 毕竟最多相差 1s，但是和系统的时钟交互是比删除耗时多的。
            long currentMills = System.currentTimeMillis();

            for(Map.Entry<String, Long> entry : MAP.entrySet()) {
                long live = entry.getValue();
                if(currentMills >= live) {
                    final String key = entry.getKey();
                    MAP.remove(key);
                    LOG.info("[Cache] 移除 key: {}", key);
                }
            }

            LOG.info("[Cache] 结束清理过期数据");
        }
    }

    @Override
    public void put(String key, int ttlSeconds) {
        if(ttlSeconds <= 0) {
            LOG.info("[Cache] ttl is less than 1, just ignore.");
            return;
        }
        long time = System.currentTimeMillis();
        long liveTo = time + ttlSeconds * 1000;

        LOG.info("[Cache] put into cache, key: {}, live to: {}", key, liveTo);
        MAP.putIfAbsent(key, liveTo);
    }

    @Override
    public boolean contains(String key) {
        boolean result =  MAP.containsKey(key);

        LOG.info("[Cache] contains key: {} result: {}", key, result);
        return result;
    }

}
```

### 代理实现

此处以 cglib 代理为例

- CglibProxy.java

```java
import com.github.houbb.resubmit.api.support.IResubmitProxy;
import com.github.houbb.resubmit.core.support.proxy.ResubmitProxy;
import net.sf.cglib.proxy.Enhancer;
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

import java.lang.reflect.Method;

/**
 * CGLIB 代理类
 * @author binbin.hou
 * date 2019/3/7
 * @since 0.0.2
 */
public class CglibProxy implements MethodInterceptor, IResubmitProxy {

    /**
     * 被代理的对象
     */
    private final Object target;

    public CglibProxy(Object target) {
        this.target = target;
    }

    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        //1. 添加判断
        ResubmitProxy.resubmit(method, objects);

        //2. 返回结果
        return method.invoke(target, objects);
    }

    @Override
    public Object proxy() {
        Enhancer enhancer = new Enhancer();
        //目标对象类
        enhancer.setSuperclass(target.getClass());
        enhancer.setCallback(this);
        //通过字节码技术创建目标对象类的子类实例作为代理
        return enhancer.create();
    }

}
```

最核心的方法就是 `ResubmitProxy.resubmit(method, objects);`

实现如下：

```java
/**
 * 重复提交验证
 * @param method 方法
 * @param args 入参
 * @since 0.0.1
 */
public static void resubmit(final Method method,
                            final Object[] args) {
    if(method.isAnnotationPresent(Resubmit.class)) {
        Resubmit resubmit = method.getAnnotation(Resubmit.class);
        // 构建入参
        ResubmitBs.newInstance()
                .cache(resubmit.cache())
                .ttl(resubmit.ttl())
                .keyGenerator(resubmit.keyGenerator())
                .tokenGenerator(resubmit.tokenGenerator())
                .method(method)
                .params(args)
                .resubmit();
    }
}
```

这里会根据用户指定的注解配置，进行对应的防重复提交限制。

鉴于篇幅原因，此处不再展开。

完整的代码，参见开源地址：

> [https://github.com/houbb/resubmit/tree/master/resubmit-core](https://github.com/houbb/resubmit/tree/master/resubmit-core)

# spring aop 整合

## spring 整合的必要性

spring 作为 java 开发中基本必不可少的框架，为我们的日常开发提供了很大的便利性。

我们一起来看一下，当与 spring 整合之后，使用起来会变得多么简单呢？

## spring 整合使用

### maven 引入

```xml
<dependency>
    <group>com.github.houbb</group>
    <artifact>resubmit-spring</artifact>
    <version>0.0.3</version>
</dependency>
```

### 服务类编写

通过注解 `@Resubmit` 指定我们防止重复提交饿方法。

```java
@Service
public class UserService {

    @Resubmit(ttl = 5)
    public void queryInfo(final String id) {
        System.out.println("query info: " + id);
    }

}
```

### 配置

主要指定 spring 的一些扫包配置，`@EnableResubmit` 注解启用防止重复提交。

```java
@ComponentScan("com.github.houbb.resubmit.test.service")
@EnableResubmit
@Configuration
public class SpringConfig {
}
```

### 测试代码

```java
@ContextConfiguration(classes = SpringConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class ResubmitSpringTest {

    @Autowired
    private UserService service;

    @Test(expected = ResubmitException.class)
    public void queryTest() {
        service.queryInfo("1");
        service.queryInfo("1");
    }

}
```

## 核心实现

### 注解定义

```java
import com.github.houbb.resubmit.spring.config.ResubmitAopConfig;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

/**
 * 启用注解
 * @author binbin.hou
 * @since 0.0.2
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(ResubmitAopConfig.class)
@EnableAspectJAutoProxy
public @interface EnableResubmit {
}
```

其中 ResubmitAopConfig 的内容如下：

```java
@Configuration
@ComponentScan(basePackages = "com.github.houbb.resubmit.spring")
public class ResubmitAopConfig {
}
```

主要是一些扫包信息。

### aop 实现

这里就是大家比较常见的 aop 切面实现。

我们验证方法有指定注解时，直接进行防止重复提交的验证。

```java
import com.github.houbb.aop.spring.util.SpringAopUtil;
import com.github.houbb.resubmit.api.annotation.Resubmit;
import com.github.houbb.resubmit.core.support.proxy.ResubmitProxy;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * @author binbin.hou
 * @since 0.0.2
 */
@Aspect
@Component
public class ResubmitAspect {

    @Pointcut("@annotation(com.github.houbb.resubmit.api.annotation.Resubmit)")
    public void resubmitPointcut() {
    }

    /**
     * 执行核心方法
     *
     * 相当于 MethodInterceptor
     * @param point 切点
     * @return 结果
     * @throws Throwable 异常信息
     * @since 0.0.2
     */
    @Around("resubmitPointcut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        Method method = SpringAopUtil.getCurrentMethod(point);

        if(method.isAnnotationPresent(Resubmit.class)) {
            // 执行代理操作
            Object[] args = point.getArgs();
            ResubmitProxy.resubmit(method, args);
        }

        // 正常方法调用
        return point.proceed();
    }
}
```

# spring-boot 整合

## spring-boot-starter 

看完了 spring 的使用，你是否觉得已经很简单了呢？

实际上，整合 spring-boot 可以让我们使用起来更加简单。

直接引入 jar 包，就可以使用。

这一切都要归功于 spring-boot-starter 的特性。

## 测试案例

### maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>resubmit-springboot-starter</artifactId>
    <version>0.0.3</version>
</dependency>
```

### 启动入口

UserService.java 和 spring 整合中一样，此处不再赘述。

ResubmitApplication 类是一个标准的 spring-boot 启动类。

```java
@SpringBootApplication
public class ResubmitApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResubmitApplication.class, args);
    }

}
```

### 测试代码

```java
@ContextConfiguration(classes = ResubmitApplication.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class ResubmitSpringBootStarterTest {

    @Autowired
    private UserService service;

    @Test(expected = ResubmitException.class)
    public void queryTest() {
        service.queryInfo("1");
        service.queryInfo("1");
    }

}
```

怎么样，是不是非常的简单？

下面我们来一下核心实现。

## 核心实现

### 代码

```java
package com.github.houbb.resubmit.springboot.starter.config;

import com.github.houbb.resubmit.spring.annotation.EnableResubmit;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 防止重复提交自动配置
 * @author binbin.hou
 * @since 0.0.3
 */
@Configuration
@EnableConfigurationProperties(ResubmitProperties.class)
@ConditionalOnClass(EnableResubmit.class)
@EnableResubmit
public class ResubmitAutoConfig {

    private final ResubmitProperties resubmitProperties;

    public ResubmitAutoConfig(ResubmitProperties resubmitProperties) {
        this.resubmitProperties = resubmitProperties;
    }

}
```

### 配置

创建 resource/META-INFO/spring.factories 文件中，内容如下：

```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=com.github.houbb.resubmit.springboot.starter.config.ResubmitAutoConfig
```

这样 spring-boot 启动时，就会基于 SPI 自动配置我们的实现。

关于 spi，我们后续有机会一起深入展开一下。

完整代码地址：

> [https://github.com/houbb/resubmit/tree/master/resubmit-springboot-starter](https://github.com/houbb/resubmit/tree/master/resubmit-springboot-starter)

# 小结

无论是工作还是面试，当我们遇到类似的问题时，都应该多想一点。

而不是简单的回答基于 session 之类的，一听就是从网上看来的。

问题是怎么产生的？

有哪些方式可以解决的？各有什么利弊？

能否封装为工具，便于复用？

当然，这里还涉及到幂等性，AOP，SPI 等知识点。

一道简单的面试题，如果深挖，背后还是有不少值得探讨的东西。

愿你有所收获。

## 开源地址

为了便于大家学习，该项目已经开源，欢迎 star~

> [https://github.com/houbb/resubmit](https://github.com/houbb/resubmit)

# 拓展阅读

[幂等性防止重复提交](https://houbb.github.io/2020/07/16/idempotent)

# 参考资料

- 重复提交

[Java 使用Token令牌防止表单重复提交](https://blog.csdn.net/cuiyaoqiang/article/details/50960787)

[有效防止F5刷新重复提交](https://iamjohnnyzhuang.github.io/java/2016/07/17/%E6%9C%89%E6%95%88%E9%98%B2%E6%AD%A2F5%E5%88%B7%E6%96%B0%E9%87%8D%E5%A4%8D%E6%8F%90%E4%BA%A4.html)

[8种方案解决重复提交问题](https://www.cnblogs.com/javazhiyin/p/11407140.html)

- in action

[JAVA-防止重复提交-过滤器](https://gitee.com/loloven/codes/u3jf2wv1zl6kcoxr57g8020)

* any list
{:toc}