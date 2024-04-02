---
layout: post
title:  Spring Security-02-springboot 入门使用实战
date:  2017-12-19 22:29:09 +0800
categories: [Spring]
tags: [spring, spring-security, web-safe]
published: true
---


# 序言

前面我们学习了 [spring security 与 springmvc 的整合入门教程](https://www.toutiao.com/i6884852647480787459/)。

这一节我们来学习一下 spring security 与 springboot 整合，为了力求简单，此处不演示数据库相关操作。

# 快速开始

## pom.xml 

引入核心的 `spring-boot-starter-security` 依赖

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.1.5.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
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

## 目录结构

整体目录结构如下：

```
│  Application.java
│
├─config
│      MyPasswordEncoder.java
│      WebSecurityConfig.java
│
├─controller
│      AuthController.java
│
├─model
│      UserInfo.java
│
└─service
        MyUserDetailsService.java
        UserInfoService.java

```

### Application.java

平淡无奇的启动类：

```java
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }


}
```

### UserInfo & UserInfoService 

UserInfo 对应数据库表中的基本用户信息，如下

```java
public class UserInfo {

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码
     */
    private String password;

    /**
     * 角色列表
     */
    private List<String> roles;

    //Getter & Settter
}
```

UserInfoService 模拟数据库查询，这里做了简化。

```java
@Service
public class UserInfoService {

    /**
     * 查询用户信息
     * 1. 移除数据库交互，简单实现。
     * @param username 用户名称
     * @return 结果
     */
    public UserInfo queryUserInfo(final String username) {
        UserInfo userInfo = new UserInfo();
        if("user".equals(username) || "admin".equals(username)) {
            userInfo.setUsername(username);
            // 密码可以在入库的时候就进行加密
            userInfo.setPassword("123456");
            // 角色需要以 ROLE_ 开头
            userInfo.setRoles(Arrays.asList("ROLE_" + username));
            return userInfo;
        }

        throw new UsernameNotFoundException(username+"对应信息不存在");
    }

}
```

ps: `ROLE_` 这个前缀主要是为了后面使用角色注解授权的时候需要，默认的前缀就是这个。


## WebSecurityConfig.java  核心配置类

这个类就是最核心的配置类了。

啪的一下，很快啊。

我们上来就是用了两个注解，`@EnableWebSecurity` 启用 web 安全，`@EnableGlobalMethodSecurity(prePostEnabled = true)` 启用方法级别的安全校验。

```java
import com.github.houbb.spring.security.learn.springboot.service.MyUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true) // 开启方法级安全验证
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private MyUserDetailsService myUserDetailsService;

    @Autowired
    private MyPasswordEncoder myPasswordEncoder;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(myUserDetailsService)
            .passwordEncoder(myPasswordEncoder);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .anyRequest().authenticated() // 所有请求都需要验证
                .and()
                .formLogin().permitAll() // 使用默认的登录页面，登录页面允许所有用户访问
                .and()
                .csrf().disable();// post请求要关闭csrf验证,不然访问报错；实际开发中开启，需要前端配合传递其他参数
    }

}
```

一般情况下，MyUserDetailsService 和 MyPasswordEncoder 这两个类都是需要我们自定义的。

### MyUserDetailsService 用户信息查询

我们只需要实现 `UserDetailsService` 接口，就可以实现对应的查询实现。

这里的授权信息，直接使用 SimpleGrantedAuthority 类。

```java
import com.github.houbb.spring.security.learn.springboot.model.UserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 自定义根据名称获取用户信息的实现
 *
 * @author binbin.hou
 * @since 1.0.0
 */
@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserInfoService userInfoService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserInfo userInfo = userInfoService.queryUserInfo(username);

        // 授权信息构建
        List<GrantedAuthority> authorities = new ArrayList<>();
        for (String role : userInfo.getRoles()) {
            authorities.add(new SimpleGrantedAuthority(role));
        }

        return new User(
                userInfo.getUsername(),
                userInfo.getPassword(),
                authorities
        );
    }

}
```

### MyPasswordEncoder 密码加密策略

spring security 有很多内置的加密策略，这里为了演示，我自定义了最简单的 plainText 的策略，就是不做任何加密。

```java
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 密码加密策略
 * @author binbin.hou
 * @since 1.0.0
 */
@Service
public class MyPasswordEncoder implements PasswordEncoder {
    @Override
    public String encode(CharSequence rawPassword) {
        return (String) rawPassword;
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return rawPassword.equals(encodedPassword);
    }
}
```

## AuthController 控制器

```java
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@RestController
public class AuthController {

    /**
     * 查看登录用户信息
     */
    @GetMapping("/auth")
    public Authentication auth(){
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /**
     * 只能 user 角色才能访问该方法
     * @return 结果
     */
    @PreAuthorize("hasAnyRole('user')")
    @GetMapping("/user")
    public String user(){
        return "user角色访问";
    }

    /**
     * 只能 admin 角色才能访问该方法
     * @return 结果
     */
    @PreAuthorize("hasAnyRole('admin')")
    @GetMapping("/admin")
    public String admin(){
        return "admin角色访问";
    }

}
```

这里我们定义了 3 个方法，第一个方法是获取当前用户的登录信息。

后面两个方法都是通过 `@PreAuthorize` 指定访问需要的角色信息。

# 测试验证

## 登录

看到这里的小伙伴也许会问，你怎么不写 login 对应实现呢？

实际上 springboot 把默认的 login/logout 都做了封装，我们平时学习可以直接使用。

如果是真实生产，一般需要自己写。

我们启动应用，浏览器访问 [http://localhost:8080/auth](http://localhost:8080/auth) 想查看登录信息，因为所有请求都需要登录验证，所以会被重定向到登录页面

[http://localhost:8080/login](http://localhost:8080/login)

### 输入信息

我们输入 admin/123456 以 admin 的角色登录。

则可以获取到授权信息如下：

```json
{"authorities":[{"authority":"ROLE_admin"}],"details":{"remoteAddress":"127.0.0.1","sessionId":"8871ED88F86B4CD67EAA2FBAC40C68C2"},"authenticated":true,"principal":{"password":null,"username":"admin","authorities":[{"authority":"ROLE_admin"}],"accountNonExpired":true,"accountNonLocked":true,"credentialsNonExpired":true,"enabled":true},"credentials":null,"name":"admin"}
```

### 角色授权测试

我们访问 [http://localhost:8080/admin](http://localhost:8080/admin)，页面返回 

```
admin角色访问
```

我们访问 [http://localhost:8080/user](http://localhost:8080/user)，页面返回 

```
Whitelabel Error Page

This application has no explicit mapping for /error, so you are seeing this as a fallback.
Tue Jan 12 23:26:31 CST 2021
There was an unexpected error (type=Forbidden, status=403).
Forbidden
```

也就是 403 权限不足，访问被拒绝。

# 小结

一个最简单的 spring security 与 springboot 整合就这样搞定了，是不是特别简单呢？

类比 shiro，spring security 肯定也是在登录的时候为我们做了相关的密码验证+授权信息保存，通过拦截器对请求进行拦截校验。

不得不说，spring 的封装确实优秀，后面我们进一步深入的学习，做到熟练地使用 spring security。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[Spring Boot：整合Spring Security](https://www.cnblogs.com/xifengxiaoma/p/11106220.html)

[SpringBoot整合SpringSecurity（通俗易懂）](https://blog.csdn.net/bookssea/article/details/109262109)

* any list
{:toc}