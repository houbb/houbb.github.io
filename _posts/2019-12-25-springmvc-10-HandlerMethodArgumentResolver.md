---
layout: post
title: Spring Web MVC-10-HandlerMethodArgumentResolver 用于统一获取当前登录用户
date:  2019-12-25 16:57:12 +0800
categories: [Spring]
tags: [spring mvc, http, spring, sf]
published: true
---

# 需求

需求：很多Controller方法，刚进来要先获取当前登录用户的信息，以便做后续的用户相关操作。

准备工作：前端每次请求都传token，后端封装一方法tokenUtils.getUserByToken(token)，根据token解析得到currentUserInfo。

这是一个常见的业务需求，为实现这个需求，有以下几种解决方案：

# 最原始直接

即，每个Controller开始，先调用tokenUtils.getUserByToken(token)，不够优雅。

# AOP

AOP可以解决很多切面类问题，思路同Spring AOP来自定义注解实现审计或日志记录，将currentUser放到request里；比起拦截器稍重。

# 拦截器+方法参数解析器

使用mvc拦截器HandlerInterceptor+方法参数解析器HandlerMethodArgumentResolver最合适。

## 方法

SpringMVC提供了mvc拦截器HandlerInterceptor，包含以下3个方法：

- preHandle

- postHandle

- afterCompletion

HandlerInterceptor经常被用来解决拦截事件，如用户鉴权等。

另外，Spring也向我们提供了多种解析器Resolver，如用来统一处理异常的HandlerExceptionResolver，以及今天的主角 HandlerMethodArgumentResolver。

## argment

HandlerMethodArgumentResolver是用来处理方法参数的解析器，包含以下2个方法：

- supportsParameter（满足某种要求，返回true，方可进入resolveArgument做参数处理）

- resolveArgument

## 实现步骤

知识储备已到位，接下来着手实现，主要分为三步走：

1. 自定义权限拦截器AuthenticationInterceptor拦截所有request请求，并将token解析为currentUser，最终放到request中；

2. 自定义参数注解 `@CurrentUser`，添加至controller的方法参数user之上；

3. 自定义方法参数解析器CurrentUserMethodArgumentResolver，取出request中的user，并赋值给添加了 `@CurrentUser` 注解的参数user。

# 代码实现

## 注解定义

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
 
/**
 * 自定义 当前用户 注解
 * 注解 参数
 * 此注解在验证token通过后，获取当前token包含用户
 */
@Target({ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}
```

- 对象定义

```java
public class UserInfo {

    /**
     * 用户标识
     */
    private String userId;

    /**
     * 用户名称
     */
    private String userName;

}
```

## session 信息登录拦截器

```java
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.github.houbb.privilege.admin.service.security.JwtTokenService;
import com.github.houbb.privilege.admin.web.constant.PrivilegeAdminConst;
import com.github.houbb.privilege.admin.web.dto.UserInfo;
import org.apache.commons.lang3.StringUtils;
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
 * session 请求拦截器
 * @author binbin.hou
 * @since 0.0.11
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

            // 2. 尝试获取 token 参数
            if(requestUrl.endsWith("index")) {
                String token = httpServletRequest.getParameter("token");
                if(StringUtils.isNotEmpty(token)) {
                    handleToken(token, httpServletRequest);
                    return true;
                }
            }

            logger.error("no Authorization ");
            //没有登陆
            httpServletResponse.sendRedirect("/login/index");
            return false;
        } else {
            try {
                // The part after "Bearer "
                final String token = authHeader.substring(7);
                handleToken(token, httpServletRequest);

                return true;
            } catch (Exception e) { //包含超时，签名错误等异常
                logger.error("JWT Exception", e);
                //没有登陆
                httpServletResponse.sendRedirect("/login/index");
                return false;
            }
        }
    }

    /**
     * 处理标识
     * @param token 信息
     * @param httpServletRequest 结果
     * @since 0.0.12
     */
    private void handleToken(final String token,
                             HttpServletRequest httpServletRequest) {
        DecodedJWT decodedJwt =  jwtTokenService.decodeToken(token);
        jwtTokenService.expiredCheck(decodedJwt);

        // 构建用户信息
        Map<String, Claim> claimMap = decodedJwt.getClaims();
        UserInfo userInfo = new UserInfo();
        userInfo.setUserName(claimMap.get("name").asString());
        userInfo.setUserId(claimMap.get("id").asString());

        // 设置信息
        httpServletRequest.setAttribute(PrivilegeAdminConst.CURRENT_USER, userInfo);
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {

    }
}
```


## session 信息方法参数拦截器

将参数信息设置到指定 `@CurrentUser` 的参数中。

```java
import com.github.houbb.privilege.admin.web.annotation.CurrentUser;
import com.github.houbb.privilege.admin.web.constant.PrivilegeAdminConst;
import com.github.houbb.privilege.admin.web.dto.UserInfo;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * @author binbin.hou
 * @since 0.0.12
 */
@Component
public class CurrentUserMethodArgumentResolver implements HandlerMethodArgumentResolver {
    
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterType().isAssignableFrom(UserInfo.class)
                && parameter.hasParameterAnnotation(CurrentUser.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
        return webRequest.getAttribute(PrivilegeAdminConst.CURRENT_USER, RequestAttributes.SCOPE_REQUEST);
    }

}
```

## 配置

拦截器定义好以后，在SpringMVC项目中，需要去SpringMVC的配置文件springmvc.xml添加该拦截器；

但是在SpringBoot中，省去了很多配置文件，取而代之的是被注解@Configuration标识的配置类，SpringMVC配置文件对应的配置类需继承WebMvcConfigurationSupport。

同理，解析器定义好以后，也需被添加到SpringMVC的配置文件或配置类中。

最后，额外的一步，配置mvc。

```java
import com.github.houbb.privilege.admin.web.interceptor.CurrentUserMethodArgumentResolver;
import com.github.houbb.privilege.admin.web.interceptor.SessionRequestInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import java.util.List;

/**
 * @author binbin.hou
 * @since 0.0.11
 */
@Configuration
public class WebMvcConfig extends WebMvcConfigurationSupport {

    @Autowired
    private CurrentUserMethodArgumentResolver currentUserMethodArgumentResolver;

    @Override
    protected void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(currentUserMethodArgumentResolver);
        super.addArgumentResolvers(argumentResolvers);
    }

}
```

## 常见的配置

定义MVC配置类，需继承WebMvcConfigurationSupport。分别在addInterceptors和addArgumentResolvers方法中，添加自定义的拦截器和参数解析器，如下：

```java
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
 
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;
 
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.alibaba.fastjson.serializer.ValueFilter;
import com.alibaba.fastjson.support.config.FastJsonConfig;
import com.alibaba.fastjson.support.spring.FastJsonHttpMessageConverter;
 
import edp.davinci.core.common.Constants;
import edp.davinci.core.inteceptor.AuthenticationInterceptor;
import edp.davinci.core.inteceptor.CurrentUserMethodArgumentResolver;
 
 
@Configuration
public class WebMvcConfig extends WebMvcConfigurationSupport {
 
    @Value("${file.userfiles-path}")
    private String filePath;
 
    /**
     * 登录校验拦截器
     *
     * @return
     */
    @Bean
    public AuthenticationInterceptor loginRequiredInterceptor() {
        return new AuthenticationInterceptor();
    }
 
    /**
     * CurrentUser 注解参数解析器
     *
     * @return
     */
    @Bean
    public CurrentUserMethodArgumentResolver currentUserMethodArgumentResolver() {
        return new CurrentUserMethodArgumentResolver();
    }
 
    /**
     * 参数解析器
     *
     * @param argumentResolvers
     */
    @Override
    protected void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(currentUserMethodArgumentResolver());
        super.addArgumentResolvers(argumentResolvers);
    }
 
    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginRequiredInterceptor())
                .addPathPatterns(Constants.BASE_API_PATH + "/**")
                .excludePathPatterns(Constants.BASE_API_PATH + "/login");
        super.addInterceptors(registry);
    }
 
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/META-INF/resources/")
                .addResourceLocations("classpath:/static/page/")
                .addResourceLocations("classpath:/static/templates/")
                .addResourceLocations("file:" + filePath);
    }
 
    @Override
    protected void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        FastJsonHttpMessageConverter fastConverter = new FastJsonHttpMessageConverter();
        FastJsonConfig fastJsonConfig = new FastJsonConfig();
        fastJsonConfig.setSerializerFeatures(SerializerFeature.QuoteFieldNames,
                SerializerFeature.WriteEnumUsingToString,
                SerializerFeature.WriteMapNullValue,
                SerializerFeature.WriteDateUseDateFormat,
                SerializerFeature.DisableCircularReferenceDetect);
        fastJsonConfig.setSerializeFilters((ValueFilter) (o, s, source) -> {
            if (null != source && (source instanceof Long || source instanceof BigInteger) && source.toString().length() > 15) {
                return source.toString();
            } else {
                return null == source ? EMPTY : source;
            }
        });
 
        //处理中文乱码问题
        List<MediaType> fastMediaTypes = new ArrayList<>();
        fastMediaTypes.add(MediaType.APPLICATION_JSON_UTF8);
        fastConverter.setSupportedMediaTypes(fastMediaTypes);
        fastConverter.setFastJsonConfig(fastJsonConfig);
        converters.add(fastConverter);
    }
}
```


## 使用

TDOO...


# 参考资料

[HandlerMethodArgumentResolver用于统一获取当前登录用户](https://www.cnblogs.com/myseries/p/12819849.html)

* any list
{:toc}
