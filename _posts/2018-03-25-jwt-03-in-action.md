---
layout: post
title:  JWT-03-使用实战
date:  2018-3-25 13:51:45 +0800
categories: [Web]
tags: [web, auth]
published: true
---

# 情景

实现统一拦截器。


# 后端

## JWT 服务

- maven 引入

```xml
<dependency>
    <groupId>com.auth0</groupId>
    <artifactId>java-jwt</artifactId>
    <version>3.3.0</version>
</dependency>
```

- 服务类

```java
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.github.houbb.privilege.admin.service.exception.ServiceRuntimeException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * @author binbin.hou
 * @since 0.0.11
 */
@Component
public class JwtTokenService {

    @Value("${privilege-admin.secret}")
    private String secret;

    /**
     * create token
     * @return 创建后的密匙
     * @since 0.0.11
     */
    public String createToken() {
        try {
            //签发时间
            Date issuanceTime = new Date();

            //过期时间-30分钟过期
            Calendar nowTime = Calendar.getInstance();
            nowTime.add(Calendar.MINUTE, 30);
            Date expireTime = nowTime.getTime();

            Map<String, Object> map = new HashMap<>();
            map.put("alg", "HS256");
            map.put("typ", "JWT");

            return JWT.create().withHeader(map)
                    .withClaim("name", "admin")
                    .withClaim("org", "alibaba")
                    .withExpiresAt(expireTime)
                    .withIssuedAt(issuanceTime)
                    .sign(Algorithm.HMAC256(secret));
        } catch (UnsupportedEncodingException e) {
            throw new ServiceRuntimeException(e);
        }
    }

    /**
     * verify token
     * 验证口令
     * @param token 口令
     * @return 口令中携带的基本属性
     * @since 0.0.11
     */
    public Map<String, Claim> verifyToken(final String token) {
        try {
            JWTVerifier jwtVerifier = JWT.require(Algorithm.HMAC256(secret)).build();
            DecodedJWT decodedJWT = jwtVerifier.verify(token);

            //1. 验证有效性
            expiredCheck(decodedJWT);
            return decodedJWT.getClaims();
        } catch (UnsupportedEncodingException e) {
            throw new ServiceRuntimeException(e);
        }
    }

    /**
     * 是否过期校验
     * @param decodedJWT 解密后的信息
     * @since 0.0.11
     */
    private void expiredCheck(DecodedJWT decodedJWT) {
        Date expireDate = decodedJWT.getExpiresAt();
        Date now = new Date();
        if(expireDate.before(now)) {
            throw new JWTVerificationException("口令已过期");
        }
    }

}
```


## 拦截器

```java
package com.github.houbb.privilege.admin.web.interceptor;

import com.auth0.jwt.interfaces.Claim;
import com.github.houbb.privilege.admin.service.security.JwtTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

/**
 * 全局异常处理
 * @author binbin.hou
 * @since 1.0.0
 */
@Component
public class SessionRequestInterceptor extends HandlerInterceptorAdapter{

    @Autowired
    private JwtTokenService jwtTokenService;

    /**
     * 日志
     * @since 0.0.11
     */
    private static Logger logger = LoggerFactory.getLogger(SessionRequestInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest httpServletRequest,
                             HttpServletResponse httpServletResponse,
                             Object o) throws Exception {
        // 判断请求的地址
        String requestUrl = httpServletRequest.getRequestURI();
        if(requestUrl.startsWith("/login")) {
            logger.info("url: {}, ignore valid", requestUrl);
            return true;
        }
        if(requestUrl.startsWith("/error")) {
            logger.info("错误页面处理 url: {}, ignore valid", requestUrl);
            return true;
        }

        //1. 获取登录信息，校验合法性
        final String authHeader = httpServletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.error("no Authorization ");
            //没有登陆
            httpServletResponse.sendRedirect("/login/index");
            return false;
        } else {
            try {
                final String token = authHeader.substring(7); // The part after "Bearer "
                logger.info("token " + token);

                Map<String, Claim> map =  jwtTokenService.verifyToken(token);
                // 权限验证

                return true;
            } catch (Exception e) { //包含超时，签名错误等异常
                logger.error("JWT Exception", e);
                //没有登陆
                httpServletResponse.sendRedirect("/login/index");
                return false;
            }
        }
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {

    }
}
```

注册拦截器

```java
package com.github.houbb.privilege.admin.web.config;

import com.github.houbb.privilege.admin.web.interceptor.SessionRequestInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

/**
 * @author binbin.hou
 * @since 0.0.11
 */
@Configuration
public class WebMvcConfig extends WebMvcConfigurationSupport {

    @Autowired
    private SessionRequestInterceptor sessionRequestInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sessionRequestInterceptor).addPathPatterns("/**");
        super.addInterceptors(registry);
    }

}
```

# 登录功能

## 后端

```java
/**
 * 登录首页
 *
 * 1、记录登录日志
 * 2、记录尝试日志，3次错误禁止登录。
 * @return 登录
 * @since 0.0.10
 */
@RequestMapping(value = "/login/{token}")
@ResponseBody
public BaseResp login(@PathVariable String token) {
    if(secret.equalsIgnoreCase(token)) {
        String jwt = jwtTokenService.createToken();
        return RespUtil.success(jwt);
    }
    // 添加错误提示
    return RespUtil.fail("登录密匙错误");
}
```

## 前端

```java
var actualToken = md5(this.form.token);
axios.post('/login/login/' + actualToken).then(function (response) {
    if (response.data.respCode === '0000') {
        var token = response.data.respMessage;
        // 设置 token 到 cookie 或者 localstorage
        localStorage.setItem('padminJwt', token);
        console.log("localStorage: " + localStorage.getItem('padminJwt'));
        // 设置全局信息
        var authToken = 'Bearer '+token;
        axios.defaults.headers.common['Authorization'] = authToken;
        // 发起 get 请求
        // window.location.href = '/index';
        axios.get('/index');
    } else {
        ELEMENT.Message.error(response.data.respMessage);
    }
}).catch(function (error) {
    ELEMENT.Message.error("请求失败");
    console.log(error);
});
```

## 问题

这里就出现个问题。

如果我们对页面添加校验拦截，那么这种静态页面跳转就必须要有 token 信息。

（1）直接修改地址

比如：

```
window.location.href = '/index';
```

失败，没有 token 信息

（2）get 请求

```js
axios.get('/index');
```

有 token 信息，但是页面根本不跳转。

（3）index 方法中添加重定向

好家伙，直接死循环了。

## 目前想到的解决放哪

不添加静态页面校验，这种不太安全，毕竟可以直接看页面，虽然无法看数据。

添加校验，token 通过 url 传递，感觉这种还算可行。

# 参考资料

[axios 中文文档](https://www.kancloud.cn/yunye/axios/234845)

[由前端登录验证，页面跳转，携带headers token引发的思考和尝试](https://www.cnblogs.com/southday/p/10885235.html)

[讲真，别再使用JWT了！](https://www.jianshu.com/p/af8360b83a9f)

* any list
{:toc}

