---
layout: post
title: spring mvc interceptor 两种配置方式：xml 文件和 java 类注解
date:  2023-08-02 +0800
categories: [Spring]
tags: [spring, aop, cglib, sh]
published: true
---

# SpringMVC 自定义拦截器

## 简介

Spring MVC也可以使用拦截器对请求进行拦截处理，用户可以自定义拦截器来实现特定的功能，自定义的拦截器必须实现HandlerInterceptor接口

– preHandle()：这个方法在业务处理器处理请求之前被调用，在该方法中对用户请求 request 进行处理。如果程序员决定该拦截器对 请求进行拦截处理后还要调用其他的拦截器，或者是业务处理器去进行处理，则返回true；如果程序员决定不需要再调用其他的组件去处理请求，则返回false。

– postHandle()：这个方法在业务处理器处理完请求后，但是DispatcherServlet 向客户端返回响应前被调用，在该方法中对 用户请求request进行处理。

– afterCompletion()：这个方法在 DispatcherServlet 完全处理完请 求后被调用，可以在该方法中进行一些资源清理的操作。

## 接口实现例子

```java
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
 
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
 
public class FirstInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
 
        System.out.println("1111111");
        return true;
    }
 
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
 
        System.out.println("2222222");
 
    }
 
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("333333");
    }
}
```


## 配置自定义拦截器

### xml 配置方式

```xml
<mvc:interceptors>
    <!--配置自定义拦截器,拦截所有资源-->
    <bean class="com.hello2.FirstInterceptor"></bean>

    <!--拦截指定资源-->
    <mvc:interceptor>
        <mvc:mapping path="/index"/>
        <bean class="com.hello2.FirstInterceptor"></bean>
    </mvc:interceptor>

    <bean id="changeInterceptor" class="org.springframework.web.servlet.i18n.LocaleChangeInterceptor">
    </bean>
</mvc:interceptors>
```

### java 配置方式

通过 java 代码配置：

```java
@Configuration
public class InterceptorConfig implements WebMvcConfigurer {

    /**
     * 若要在Interceptor中进行依赖注入，则需要：
     * 将拦截器注册为一个 Bean
     * @return
     */
    @Bean
    public PermissionInterceptor permissionInterceptor() {
        return new PermissionInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(permissionInterceptor())
                .addPathPatterns("/**")                             //默认过滤全部
                .excludePathPatterns("/swagger-resources/**")       //需要排除的地址
                .excludePathPatterns("/v2/api-docs/**");
        WebMvcConfigurer.super.addInterceptors(registry);
    }

}
```

# 拦截器方法执行顺序

注意：若FirstInterfaceptor中的preHandle返回false，则不再执行后续拦截器。 

![interceptor](https://img-blog.csdnimg.cn/20190404155248478.png)

## 多个拦截器方法执行顺序

注意：若FirstInterfaceptor中的preHandle返回false，则不再执行后续拦截器，包括SecondInterfaceptor中定义的拦截器。  

![order](https://img-blog.csdnimg.cn/2019040415592719.png)

注意： 若SecondInterfaceptor中的preHandle返回false，则不再执行后续拦截器，但是直接执行FirstInterfaceptor中的afterCompletion。 

# 小结

# 参考资料

https://www.cnblogs.com/11HAN/articles/12197780.html

https://blog.csdn.net/qq_36761831/article/details/89021154

* any list
{:toc}