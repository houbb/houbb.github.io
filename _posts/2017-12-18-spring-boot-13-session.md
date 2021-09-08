---
layout: post
title:  Spring Boot-13-springboot 整合 redis 实现分布式 session 实战 拦截器+方法注解
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

# 基于方法注解的实现

## 权限校验

在使用SpringMVC进行项目的时候用到了权限验证。

验证无非就是收到请求后，在拦截器循环判断用户是否有权限执行操作。

## url 判断

通过request获得用户的URI，再逐一循环判断是否可以操作。

这种方法适合格式较为固定的校验，但是不太适合细化的。

## 通过用户要访问的方法来判断是否有权限

preHandle方法中handler实际为HandlerMethod，（看网上说的有时候不是HandlerMethod），加个 instanceof 验证即可。

可以得到方法名：h.getMethod().getName()

可以得到 RequestMapping 注解中的值：h.getMethodAnnotation(RequireRole.class)

这种方法还是不太方便

## 注解实现

### 注解定义

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireRole {

    /**
     * 权限列表
     * @return 列表
     */
    String[] value() default {};

}
```

### 注解使用

可以放在方法上，用于指定需要的权限。

```java
@RequestMapping("hello")
@RequireRole({"admin"})
public String hello() {
    return "hello";
}

@RequestMapping("hello2")
public String hello2() {
    return "hello2";
}
```

### 拦截器实现

```java
import com.github.houbb.springboot.learn.interceptor.annotation.RequireRole;
import com.sun.deploy.util.ArrayUtil;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;

/**
 * https://blog.csdn.net/howroad/article/details/80220320
 * （1）通过request获得用户的URI，再逐一循环判断是否可以操作。只是这种方法很让人难受。
 * （2）
 * @author binbin.hou
 * @since 1.0.0
 */
@Component
public class SessionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o) throws Exception {
        String token = httpServletRequest.getParameter("token");
        String roleInfo = mockTokenResp(token);

        // 根据信息设置等操作
        // 进行权限校验
        if(o instanceof HandlerMethod) {
            HandlerMethod h = (HandlerMethod)o;
            RequireRole requireRole = h.getMethodAnnotation(RequireRole.class);
            if(requireRole != null) {
                String[] strings = requireRole.value();
                boolean contains = containsRole(strings, roleInfo);
                System.out.println("需要：" + Arrays.toString(strings) + "; 实际：" + roleInfo + ": 结果：" + contains);
                if(!contains) {
                    return false;
                }
            }
            //判断后执行操作...
        }


        return true;
    }

    /**
     * 是否包含对应的角色
     * @param strings 需要角色
     * @param currentRole 当前角色
     * @return 是否满足
     */
    private boolean containsRole(String[] strings,
                                 String currentRole) {
        if(strings.length <= 0) {
            return true;
        }

        for(String requireRole : strings) {
            if(requireRole.equals(currentRole)) {
                return true;
            }
        }

        return false;
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

## 类级别

当然，如果你觉得每个方法都添加比较麻烦，则可以直接添加类级别的。

### 注解

简单调整注解：

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireRole {

    /**
     * 权限列表
     * @return 列表
     */
    String[] value() default {};

}
```

使用时就可以定位在类上。

### 拦截器处理逻辑调整

```java
HandlerMethod h = (HandlerMethod)o;
RequireRole requireRole = h.getMethodAnnotation(RequireRole.class);
if(requireRole != null) {
   // 方法级别的处理
} else {
    // 获取类上面的注解，进行类似的处理逻辑
    requireRole = h.getMethod().getDeclaringClass().getAnnotation(RequireRole.class);
}
```


# 小结

session 是 web 登录中必备的功能，redis 存放 session 是分布式系统中比较成熟的方案。

当然也并不是唯一的解决方案，使用 jwt 也可以达到类似的效果，不过二者各有优缺点，个人更加倾向于使用 redis 存储分布式 session。

后续有机会打开一篇讲解下 jwt 如何实现分布式系统的登录验证。

本实战系列用于记录 springboot 的实际使用和学习笔记。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

## 拓展阅读

[面试官：知道 springboot 的启动原理吗？](https://www.toutiao.com/i6905286288581100046/)

[5 分钟入门 springboot 实战学习笔记](https://www.toutiao.com/i6905333348474896908/)

[实现你的自定义 springboot starter 实战](https://www.toutiao.com/i6905342655182684675/)

[springboot 整合阿里 druid 数据库连接池实战](https://www.toutiao.com/i6905548418106819085/)

[springboot+mybatis+druid 整合实战](https://www.toutiao.com/i6905642830065156621/)

# 参考资料

[SpringBoot 之Actuator](https://www.cnblogs.com/jmcui/p/9820579.html)

[SpringMVC拦截器中获得Controller方法名和注解信息（用于验证权限）](https://blog.csdn.net/howroad/article/details/80220320)

* any list
{:toc}
