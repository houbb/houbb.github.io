---
layout: post
title: Shiro-09-shiro 整合 springboot 实战
date:  2016-8-11 09:38:24 +0800
categories: [Web]
tags: [shiro, web, web-security]
published: true
---

# 序言

前面我们学习了如下内容：

[5 分钟入门 shiro 安全框架实战笔记](https://www.toutiao.com/i6910927630845919756/)

[shiro 整合 spring 实战及源码详解](https://houbb.github.io/2016/08/11/shiro-20-intergrations-spring)

这一节我们来看下如何将 shiro 与 springboot 进行整合。

# spring 整合

## maven 依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>1.5.9.RELEASE</version>
    </parent>

    <modelVersion>4.0.0</modelVersion>

    <artifactId>shiro-inaction-01-springboot</artifactId>
    <description>springboot web 整合</description>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>

        <dependency>
            <groupId>org.apache.shiro</groupId>
            <artifactId>shiro-spring-boot-web-starter</artifactId>
            <version>1.4.1</version>
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

这里主要是 spring-boot-starter-web 和 shiro-spring-boot-web-starter。

我们这里为了演示页面，所以引入了 spring-boot-starter-thymeleaf

## application.properties 配置文件

配置文件内容如下：

```properties
# 指定服务信息
server.port=7777

# thymeleaf
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.check-template-location=true
spring.thymeleaf.suffix=.html
spring.thymeleaf.content-type=text/html
# spring.thymeleaf.mode=HTML
spring.thymeleaf.cache=false

# shiro 相关配置
# 登录地址
shiro.loginUrl = /login.html
# Let Shiro Manage the sessions
shiro.userNativeSessionManager = true
# disable URL session rewriting
shiro.sessionManager.sessionIdUrlRewritingEnabled = false
```

页面都放在 `classpath:/templates/` 目录下，此处不做展开。

可以参见源码：

> [https://gitee.com/houbinbin/shiro-inaction/tree/master/shiro-inaction-01-springboot](https://gitee.com/houbinbin/shiro-inaction/tree/master/shiro-inaction-01-springboot)


## 启动类

启动类代码比较简单：

```java
@SpringBootApplication
public class Application { //NOPMD

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

## ShiroConfig.java 

针对 shiro 的配置内容如下：

```java
package com.github.houbb.shiro.inaction.chap01.springboot.config;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.realm.Realm;
import org.apache.shiro.realm.text.TextConfigurationRealm;
import org.apache.shiro.spring.web.config.DefaultShiroFilterChainDefinition;
import org.apache.shiro.spring.web.config.ShiroFilterChainDefinition;
import org.apache.shiro.subject.Subject;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.HashMap;
import java.util.Map;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Configuration
@ControllerAdvice
public class ShiroConfig {

    @ExceptionHandler(AuthorizationException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleException(AuthorizationException e, Model model) {
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("status", HttpStatus.FORBIDDEN.value());
        map.put("message", "No message available");
        model.addAttribute("errors", map);

        return "error";
    }

    @Bean
    public Realm realm() {
        TextConfigurationRealm realm = new TextConfigurationRealm();
        realm.setUserDefinitions("joe.coder=password,user\n" +
                "jill.coder=password,admin");

        realm.setRoleDefinitions("admin=read,write\n" +
                "user=read");
        realm.setCachingEnabled(true);
        return realm;
    }

    @Bean
    public ShiroFilterChainDefinition shiroFilterChainDefinition() {
        DefaultShiroFilterChainDefinition chainDefinition = new DefaultShiroFilterChainDefinition();
        chainDefinition.addPathDefinition("/login.html", "authc"); // need to accept POSTs from the login form
        chainDefinition.addPathDefinition("/logout", "logout");
        return chainDefinition;
    }

    @ModelAttribute(name = "subject")
    public Subject subject() {
        return SecurityUtils.getSubject();
    }

}
```

这里主要初始化了一些默认的 Realm 信息，并且指定了对应的过滤器。

这里统一使用了一场处理器处理异常，以便为用户提供更好的体验。

```java
package com.github.houbb.shiro.inaction.chap01.springboot.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.web.ErrorAttributes;
import org.springframework.boot.autoconfigure.web.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.context.request.ServletWebRequest;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 */
@Controller
public class RestrictedErrorController implements ErrorController {
    private static final String ERROR_PATH = "/error";

    @Autowired
    private ErrorAttributes errorAttributes;

    @Override
    public String getErrorPath() {
        return ERROR_PATH;
    }

    @RequestMapping(ERROR_PATH)
    String error(HttpServletRequest request, Model model) {
        Map<String, Object> errorMap = errorAttributes.getErrorAttributes(new ServletWebRequest(request), false);
        model.addAttribute("errors", errorMap);
        return "error";
    }
}
```

## 其他 Controller

我们主要看一下登录和账户信息：

### 登录

这个直接返回登录页面。

```java
@Controller
public class LoginController {

    @RequestMapping("/login.html")
    public String loginTemplate() {
        return "login";
    }

}
```

### 账户信息

这个通过 `@RequiresRoles("admin")`，要求访问者拥有对应的 admin 角色。

```java
@Controller
public class AccountInfoController {

    @RequiresRoles("admin")
    @RequestMapping("/account-info")
    public String home(Model model) {

        String name = "World";

        Subject subject = SecurityUtils.getSubject();

        PrincipalCollection principalCollection = subject.getPrincipals();

        if (principalCollection != null && !principalCollection.isEmpty()) {
            name = principalCollection.getPrimaryPrincipal().toString();
        }

        model.addAttribute("name", name);
        return "account-info";
    }

}
```

# 页面访问

直接访问 [http://localhost:7777/login.html](http://localhost:7777/login.html)，页面如下：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0104/233122_e91abab0_508704.png "shiro-springboot-login.png")

我们可以分别登录两个不同的账户，访问对应的用户信息。

会发现只有 admin 账户可以访问。

# 小结

这一节我们讲解了如何整合 springboot 与 shiro，可以发现使用起来非常的便捷。

后续准备自己动手实现一个简易版本的 shiro。

为了便于大家学习，所有源码都已开源：

> [https://gitee.com/houbinbin/shiro-inaction/tree/master/shiro-inaction-01-springboot](https://gitee.com/houbinbin/shiro-inaction/tree/master/shiro-inaction-01-springboot)

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[10 Minute Tutorial on Apache Shiro](https://shiro.apache.org/10-minute-tutorial.html)

https://shiro.apache.org/reference.html

https://shiro.apache.org/session-management.html

* any list
{:toc}