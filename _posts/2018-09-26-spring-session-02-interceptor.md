---
layout: post
title: Spring Session 结合拦截器实战
date:  2018-09-26 14:24:33 +0800
categories: [Spring]
tags: [web, spring, session, distributed, sh]
published: true
---

# 场景

前面我们学习了[springboot整合redis实现分布式session](https://www.toutiao.com/i6905646805476753927/)，对 spring session 有了一个最基本的认识。

有时候我们希望登陆的时候设置对应的 session 信息，然后结合拦截器进行是否登陆校验。

本文就给出一个结合拦截器使用的例子，让我们进一步感受下 spring session 的魅力吧。

# 实战

## maven 依赖

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>1.5.9.RELEASE</version>
</parent>

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
```

## 类结构

```
│  Application.java
│
├─config
│      WebConfig.java
│
├─controller
│      ExampleController.java
│      UserController.java
│
├─interceptor
│      SessionInterceptor.java
│
└─util
        SessionUtil.java
```

## 基本方法

- Application.java

```java
package com.github.houbb.spring.session.learn.boot.redis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@SpringBootApplication
@EnableRedisHttpSession
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

通过 `@EnableRedisHttpSession` 注解启用 redis http session 的功能。

`ExampleController.java` 类和入门案例中一样，此处不再赘述。

- SessionUtil.java

一个 session 构建的基础工具类。

```java
package com.github.houbb.spring.session.learn.boot.redis.util;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public final class SessionUtil {

    private SessionUtil(){}

    /**
     * session key 前缀
     */
    private static final String SESSION_KEY_PREFIX = "SESSION-KEY-";

    public static String buildSessionKey(final String sessionId) {
        return SESSION_KEY_PREFIX + sessionId;
    }

}
```

## UserController.java

这里我们主要模拟一下用户的登陆和登出。

```java
package com.github.houbb.spring.session.learn.boot.redis.controller;

import com.github.houbb.spring.session.learn.boot.redis.util.SessionUtil;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.UUID;

@RestController
@RequestMapping
public class UserController {


    @RequestMapping("/loginIndex")
    public String loginIndex(HttpServletRequest req) {
        return "http://localhost:8080/login?username=guest";
    }

    @RequestMapping("/login")
    public String login(HttpServletRequest req) {
        //1. 获取用户名密码
        final String username = req.getParameter("username");

        //2. 登陆校验
        if("guest".equals(username)) {
            //3. 设置对应的信息
            String sessionId = UUID.randomUUID().toString();
            String sessionKey = SessionUtil.buildSessionKey(sessionId);

            // value 可以设置对应的权限值等等
            String value = username;
            req.getSession().setAttribute(sessionKey, value);
            // 将 token 返回给前端
            // 可以设置再页面的隐藏域中
            return "sessionId: " + sessionId;
        }

        return "login failed";
    }

    @RequestMapping("/logout")
    public String logout(HttpServletRequest req) {
        String sessionId = req.getParameter("sessionId");
        req.getSession().removeAttribute(SessionUtil.buildSessionKey(sessionId));
        return "登出成功";
    }

}
```

### 登陆首页

loginIndex 为登陆的首页，为了简单，我们直接显示需要请求的地址即可：

```
http://localhost:8080/login?username=guest
```

### 登陆

校验对应的 username，并且设置对应的 session 信息。

并且将这个 token 返回给前端，用户在登出的时候需要指定这个 token 做校验。

### 登出

清空对应的 session 信息。


## 拦截器

### SessionInterceptor.java

这里我们是通过对应的 token 获取。

当然，对于 spring session 也可以直接根据 JSESSIONID 这种更加优雅的方式设置和获取。

如果信息不存在，则直接返回到登陆页面。

```java
package com.github.houbb.spring.session.learn.boot.redis.interceptor;

import com.github.houbb.spring.session.learn.boot.redis.util.SessionUtil;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Writer;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Component
public class SessionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o) throws Exception {
        String sessionId = httpServletRequest.getParameter("sessionId");
        if(StringUtils.isEmpty(sessionId)) {
            handleForbidden(httpServletRequest, httpServletResponse, "请重新登陆");
            return false;
        }

        // 获取登陆信息
        String sessionKey = SessionUtil.buildSessionKey(sessionId);
        String username = (String) httpServletRequest.getSession().getAttribute(sessionKey);
        if(StringUtils.isEmpty(username)) {
            handleForbidden(httpServletRequest, httpServletResponse, "请重新登陆");
            return false;
        }

        return true;
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {

    }


    private void handleForbidden(HttpServletRequest request, HttpServletResponse response, String info){
        // 有这个值是异步请求，没有是同步请求。
        String xRequest = request.getHeader("X-Requested-With");
        if(!StringUtils.isEmpty(xRequest)){
            //异步处理
            response.setCharacterEncoding("UTF-8");
            try {
                Writer writer = response.getWriter();
                writer.write(info);
                response.setStatus(403);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }else{
            try {
                // 可以跳转到登陆页面
                request.getRequestDispatcher("loginIndex")
                        .forward(request, response);
            } catch (ServletException | IOException e) {
                e.printStackTrace();
            }
        }
    }

}
```

### 拦截器设置

我们定义了拦截器，当然需要指定对应的生效范围：

```java
package com.github.houbb.spring.session.learn.boot.redis.config;

import com.github.houbb.spring.session.learn.boot.redis.interceptor.SessionInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Configuration
public class WebConfig extends WebMvcConfigurerAdapter {

    @Autowired
    private SessionInterceptor sessionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sessionInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/loginIndex")
                .excludePathPatterns("/login");
    }

    @Bean
    public CharacterEncodingFilter initializeCharacterEncodingFilter() {
        CharacterEncodingFilter filter = new CharacterEncodingFilter();
        filter.setEncoding("UTF-8");
        filter.setForceEncoding(true);
        return filter;
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/loginIndex");
        registry.setOrder(Ordered.HIGHEST_PRECEDENCE);
        super.addViewControllers(registry);
    }

}
```

我们排除 `/loginIndex` 和 `/login` 这两个请求地址的 session 拦截校验，当然也可以根据实际情况排除静态文件。

`registry.addViewController("/").setViewName("forward:/loginIndex");` 这句话可以将默认的首页重定向到登陆页面。

# 测试验证

## 首页

浏览器访问 [http://localhost:8080/](http://localhost:8080/)

页面显示：

```
http://localhost:8080/login?username=guest
```

## 登陆

我们直接输入 [http://localhost:8080/login?username=guest](http://localhost:8080/login?username=guest)

页面返回对应的 token:

```
sessionId: 5251161a-d946-41e5-98fc-eae2e5c01960
```

## 登出

我们登出的时候，带上这个参数：http://localhost:8080/logout?sessionId=5251161a-d946-41e5-98fc-eae2e5c01960

页面提示：

```
登出成功
```

如果我们再次请求，页面就会跳转到登陆首页，因为这个时候的 session 已经被清空了。

# 小结

这一节我们展示了如何结合拦截器使用 spring session，这也是目前比较主流的做法。

对于很多讲解到这里一般就结束了，不过老马实际上是为了引入接下来的内容。

spring session 底层的实现原理是怎样的？

下一节将和各位小伙伴们一起学习下 spring session 的源码。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://spring.io/projects/spring-session#overview

https://yq.aliyun.com/articles/371442

- 实现原理

[实现原理](https://blog.csdn.net/wojiaolinaaa/article/details/62424642)

[Spring Session 内部实现原理（源码分析）](https://www.jianshu.com/p/1001e9e2cfcf)

* any list
{:toc}