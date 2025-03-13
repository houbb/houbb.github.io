---
layout: post
title: AI 开发 IM-02-cors 跨域问题如何解决？
date: 2025-3-13 20:44:06 +0800
categories: [IM]
tags: [im, opensource, ai, sh]
published: true
---

# 基本功能

## 页面报错

访问后端接口报错。

```
access to XMLHttpRequest at 'http://localhost:8080/api/auth/send-code' from origin 'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
Login.vue:111 发送验证码失败: AxiosError {message: 'Network Error', name: 'AxiosError', code: 'ERR_NETWORK', config: {…}, request: XMLHttpRequest, …}
```

> [Spring Boot 处理CORS以及CSRF](https://blog.csdn.net/qq_33807380/article/details/145926346)


CORS 是一种机制，允许浏览器向不同域（协议、域名或端口）的服务器发起请求。

在 Spring Boot 中，处理跨域请求（CORS，Cross-Origin Resource Sharing）可以通过以下几种方式实现。

# 解决方式

## 后端添加 

### 使用 `@CrossOrigin` 注解

1) 在控制器方法上使用

在控制器方法上添加 `@CrossOrigin` 注解，允许特定方法的跨域请求。

```java
@RestController
public class MyController {

	@CrossOrigin(origins = "http://example.com")
	@GetMapping("/hello")
	public String hello() {
		return "Hello, CORS!";
	}
}
```

2) 在控制器类上使用

在控制器类上添加 `@CrossOrigin` 注解，允许整个控制器的跨域请求。

```java
@CrossOrigin(origins = "http://example.com")
@RestController
public class MyController {

	@GetMapping("/hello")
	public String hello() {
		return "Hello, CORS!";
	}
}
```

注解参数
origins：允许的源（域名），默认为 *（允许所有域名）。
methods：允许的 HTTP 方法，默认为 GET、POST、HEAD。
allowedHeaders：允许的请求头，默认为所有。
exposedHeaders：允许暴露的响应头。
maxAge：预检请求的缓存时间（以秒为单位）。

## 全局配置

### 一、使用 WebMvcConfigurer

通过实现 WebMvcConfigurer 接口，配置全局的 CORS 规则。

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**") // 允许所有路径
    			.allowedOrigins("http://example.com") // 允许的源
    			.allowedMethods("GET", "POST", "PUT", "DELETE") // 允许的 HTTP 方法
    			.allowedHeaders("*") // 允许的请求头
    			.allowCredentials(true) // 是否允许发送 Cookie
    			.maxAge(3600); // 预检请求的缓存时间
	}
}
```

### 二、使用 CorsFilter

通过自定义 CorsFilter，配置全局的 CORS 规则。

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

	@Bean
	public CorsFilter corsFilter() {
		CorsConfiguration config = new CorsConfiguration();
		config.addAllowedOrigin("http://example.com"); // 允许的源
		config.addAllowedMethod("*"); // 允许的 HTTP 方法
		config.addAllowedHeader("*"); // 允许的请求头
		config.setAllowCredentials(true); // 是否允许发送 Cookie
		config.setMaxAge(3600L); // 预检请求的缓存时间

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config); // 允许所有路径

		return new CorsFilter(source);
	}
}
```

### 三、使用 Spring Security 配置 CORS

在 Spring Security 配置类中启用 CORS。

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.cors().and() // 启用 CORS
    		.csrf().disable() // 禁用 CSRF
    		.authorizeRequests()
    		.anyRequest().authenticated();
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
    		@Override
    		public void addCorsMappings(CorsRegistry registry) {
        		registry.addMapping("/**")
                		.allowedOrigins("http://example.com")
                		.allowedMethods("GET", "POST", "PUT", "DELETE")
                		.allowedHeaders("*")
                		.allowCredentials(true)
                        .maxAge(3600);
    		}
		};
	}
}
```

#### 四、配置属性

使用 application.properties 或 application.yml 配置文件设置 CORS 相关属性。

```
spring.webflux.cors.allowed-origins=http://example.com
spring.webflux.cors.allowed-methods=GET,POST,PUT,DELETE
spring.webflux.cors.allowed-headers=*
spring.webflux.cors.allow-credentials=true
spring.webflux.cors.max-age=3600
```


# 配置不生效的问题

## 前言

浏览器有跨域限制，非同源策略(协议、主机名或端口不同)被视为跨域请求，解决跨域有跨域资源共享(CORS)、反向代理和 JSONP的方式。

本篇通过 SpringBoot 的资源共享配置(CORS)来解决前后端分离项目的跨域，以及从原理上去解决跨域配置不生效的问题。

## 准备工作

使用前后端分离开源项目 youlai-boot + vue3-element-admin 做跨域请求测试 。

其中 vue3-element-admin 默认通过 vite + proxy 前端反向代理解决跨域，如果想关闭方向代理只需修改 baseURL 即可：

```ts
// request.ts
const service = axios.create({
  //baseURL: import.meta.env.VITE_APP_BASE_API,  // 前端反向代理解决跨域的配置
  baseURL: "http://localhost:8989", // 后端通过配置CORS解决跨域的配置, http://localhost:8989 是后端接口地址
  timeout: 50000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
});
```

## 配置 CORS 允许跨域

一般情况在项目添加以下配置即可解决浏览器跨域限制。

```java
/**
 * CORS 资源共享配置
 *
 * @author haoxr
 * @date 2022/10/24
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        //1.允许任何来源
        corsConfiguration.setAllowedOriginPatterns(Collections.singletonList("*"));
        //2.允许任何请求头
        corsConfiguration.addAllowedHeader(CorsConfiguration.ALL);
        //3.允许任何方法
        corsConfiguration.addAllowedMethod(CorsConfiguration.ALL);
        //4.允许凭证
        corsConfiguration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return new CorsFilter(source);
    }
}
```

## CORS 允许跨域原理

CorsFilter 读取 CorsConfig 配置通过 DefaultCorsProcessor 给 response 响应头添加 Access-Control-Allow-* 以允许跨域请求能够被成功处理。

响应头参数	作用
Access-Control-Allow-Origin	允许访问的源地址
Access-Control-Allow-Methods	允许访问的请求方法
Access-Control-Allow-Headers	允许访问的请求头
Access-Control-Allow-Credentials	是否允许发送 Cookie 等身份凭证
Access-Control-Max-Age	缓存预检请求的时间

核心是 `DefaultCorsProcessor#handleInternal` 方法

![method](https://s2.loli.net/2023/04/21/bX7AqwNgxMyB1HZ.png)

## CORS 配置失效原理分析

但。。。有的项目按照如上配置允许跨域请求成功了，但有些项目却不生效？

其实就是一个结论：有中断响应的过滤器在 CorsFilter 之前执行了，也就无法执行到 CorsFilter，自然 CorsConfiguration 中的配置形同虚设。

常见的场景：项目中使用了 Spring Security 安全框架导致 CORS 跨域配置失效。

接下来就 Spring Security 导致 CORS 配置失效展开分析。

在 ApplicationFilterChain#internalDoFilter 添加断点，然后通过改造后(移除反向代理)的 vue3-element-admin 发出跨域请求。

可以看出 SpringSecurityFilterChain 是先于 CorsFilter 执行的（重点）, 如果是跨域请求浏览器会在正式请求前发出一次预检请求(OPTIONS)，判断服务器是否允许跨域。

跨域请求没到达 CorsFilter 过滤器就先被 Spring Security 的过滤器给拦截了，要知道预检 OPTIONS 请求是不带 token 的，所以响应 401 未认证的错误。预检请求失败导致后面的请求响应会被浏览器拦截。

## CORS 配置失效解决方案

根据配置失效原理分析，有两个解决方案：

解决方案一： 配置 CorsFilter 优先于 SpringSecurityFilter 执行；

解决方案二： 放行预检 OPTIONS 请求 + 基础 CORS 配置。

### 解决方案一(推荐)

配置 CorsFilter 优先于 SpringSecurityFilter 执行

Spring Security 过滤器是通过 SecurityFilterAutoConfiguration 的 DelegatingFilterProxyRegistrationBean 注册到 servletContext上下文，其中过滤器的顺序属性 Order 读取的 是 SecurityProperties 的默认配置也就是 -100；

	
SpringBoot 可以通过 FilterRegistrationBean 来对 Filter 自定义注册（排序）, 设置 Order 小于 SpringSecurity 的 -100 即可。完整配置如下：

```java
/**
 * CORS资源共享配置
 *
 * @author haoxr
 * @date 2023/4/17
 */
@Configuration
public class CorsConfig {

    @Bean
    public FilterRegistrationBean filterRegistrationBean() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        //1.允许任何来源
        corsConfiguration.setAllowedOriginPatterns(Collections.singletonList("*"));
        //2.允许任何请求头
        corsConfiguration.addAllowedHeader(CorsConfiguration.ALL);
        //3.允许任何方法
        corsConfiguration.addAllowedMethod(CorsConfiguration.ALL);
        //4.允许凭证
        corsConfiguration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        CorsFilter corsFilter = new CorsFilter(source);

        FilterRegistrationBean<CorsFilter> filterRegistrationBean=new FilterRegistrationBean<>(corsFilter);
        filterRegistrationBean.setOrder(-101);  // 小于 SpringSecurity Filter的 Order(-100) 即可

        return filterRegistrationBean;
    }
}
```

可以看到不同源的跨域请求能够成功响应。

### 解决方案二

放行预检 OPTIONS 请求 + 基础 CORS 配置

SecurityConfig 放行 OPTIONS 预检请求配置 SecurityConfig 配置源码

```java
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http 
            	...
                // 走 Spring Security 过滤器链的放行配置
                .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll() // 放行预检请求
                .anyRequest().authenticated();

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        // 不走过滤器链的放行配置
        return (web) -> web.ignoring()
                .requestMatchers(HttpMethod.OPTIONS,"/**") // 放行预检请求
         
    }
```

基础的跨域共享配置

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        //1.允许任何来源
        corsConfiguration.setAllowedOriginPatterns(Collections.singletonList("*"));
        //2.允许任何请求头
        corsConfiguration.addAllowedHeader(CorsConfiguration.ALL);
        //3.允许任何方法
        corsConfiguration.addAllowedMethod(CorsConfiguration.ALL);
        //4.允许凭证
        corsConfiguration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return new CorsFilter(source);
    }
    
}

```

另外有自定义过滤器 （例如：VerifyCodeFilter）通过 response.getWriter().print() 响应给浏览器也是不走后面的 CorsFilter 过滤器，所以需要设置响应头

```java
// ResponseUtils# writeErrMsg
response.setContentType(MediaType.APPLICATION_JSON_VALUE);
response.setHeader("Access-Control-Allow-Origin","*");
response.getWriter().print(JSONUtil.toJsonStr(Result.failed(resultCode)));
```



# 参考资料

https://www.cnblogs.com/haoxianrui/p/17338196.html


* any list
{:toc}