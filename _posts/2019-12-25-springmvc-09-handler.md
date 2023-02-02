---
layout: post
title: Spring Web MVC-09-springmvc 过滤器与拦截器 Handler and Filter/spring aop 拦截器/ @ControllerAdvice ResponseBodyAdvice
date:  2019-12-25 16:57:12 +0800
categories: [Spring]
tags: [spring mvc, http, spring, sf]
published: true
---

# 定义Interceptor实现类
 
SpringMVC 中的Interceptor 拦截请求是通过 HandlerInterceptor 来实现的。

在SpringMVC 中定义一个Interceptor 非常简单，主要有两种方式，

（1）第一种方式是要定义的Interceptor类要实现了Spring 的HandlerInterceptor 接口，或者是这个类继承实现了HandlerInterceptor 接口的类，比如Spring 已经提供的实现了HandlerInterceptor 接口的抽象类HandlerInterceptorAdapter；

（2）第二种方式是实现Spring的WebRequestInterceptor接口，或者是继承实现了WebRequestInterceptor的类。

-------------------------------------------------------------------------------------------------------------------------------------- 

还有两种常见的实现拦截的方式：

（1）spring aop

（2）ResponseBodyAdvice & @ControllerAdvice

# 方法1-实现HandlerInterceptor接口

## 方法说明

HandlerInterceptor 接口中定义了三个方法，我们就是通过这三个方法来对用户的请求进行拦截处理的。

（1）preHandle (HttpServletRequest request, HttpServletResponse response, Object handle) 方法

顾名思义，该方法将在请求处理之前进行调用。SpringMVC 中的Interceptor 是链式的调用的，在一个应用中或者说是在一个请求中可以同时存在多个Interceptor。

每个Interceptor 的调用会依据它的声明顺序依次执行，而且最先执行的都是Interceptor 中的preHandle 方法，所以可以在这个方法中进行一些前置初始化操作或者是对当前请求的一个预处理，也可以在这个方法中进行一些判断来决定请求是否要继续进行下去。

该方法的返回值是布尔值Boolean 类型的，当它返回为false 时，表示请求结束，后续的Interceptor 和Controller 都不会再执行；当返回值为true 时就会继续调用下一个Interceptor 的preHandle 方法，如果已经是最后一个Interceptor 的时候就会是调用当前请求的Controller 方法。

（2）postHandle (HttpServletRequest request, HttpServletResponse response, Object handle, ModelAndView modelAndView) 方法

由preHandle 方法的解释我们知道这个方法包括后面要说到的afterCompletion 方法都只能是在当前所属的Interceptor 的preHandle 方法的返回值为true 时才能被调用。

postHandle 方法，顾名思义就是在当前请求进行处理之后，也就是Controller 方法调用之后执行，但是它会在DispatcherServlet 进行视图返回渲染之前被调用，所以我们可以在这个方法中对Controller 处理之后的ModelAndView 对象进行操作。

postHandle 方法被调用的方向跟preHandle 是相反的，也就是说先声明的Interceptor 的postHandle 方法反而会后执行，这和Struts2 里面的Interceptor 的执行过程有点类型。

Struts2 里面的Interceptor 的执行过程也是链式的，只是在Struts2 里面需要手动调用ActionInvocation 的invoke 方法来触发对下一个Interceptor 或者是Action 的调用，然后每一个Interceptor 中在invoke 方法调用之前的内容都是按照声明顺序执行的，而invoke 方法之后的内容就是反向的。

（3）afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handle, Exception ex) 方法

该方法也是需要当前对应的Interceptor 的preHandle 方法的返回值为true 时才会执行。

顾名思义，该方法将在整个请求结束之后，也就是在DispatcherServlet 渲染了对应的视图之后执行。这个方法的主要作用是用于进行资源清理工作的。

## 代码说明

下面是一个简单的代码说明：

```java
import javax.servlet.http.HttpServletRequest;  
import javax.servlet.http.HttpServletResponse;  
  
import org.springframework.web.servlet.HandlerInterceptor;  
import org.springframework.web.servlet.ModelAndView;  
  
public class SpringMVCInterceptor implements HandlerInterceptor {  
  
  
    /** 
     * preHandle方法是进行处理器拦截用的，顾名思义，该方法将在Controller处理之前进行调用，SpringMVC中的Interceptor拦截器是链式的，可以同时存在 
     * 多个Interceptor，然后SpringMVC会根据声明的前后顺序一个接一个的执行，而且所有的Interceptor中的preHandle方法都会在 
     * Controller方法调用之前调用。SpringMVC的这种Interceptor链式结构也是可以进行中断的，这种中断方式是令preHandle的返 
     * 回值为false，当preHandle的返回值为false的时候整个请求就结束了。 
     */  
    @Override  
    public boolean preHandle(HttpServletRequest request,  
            HttpServletResponse response, Object handler) throws Exception {  
        // TODO Auto-generated method stub  
        return false;  
    }  
      
    /** 
     * 这个方法只会在当前这个Interceptor的preHandle方法返回值为true的时候才会执行。postHandle是进行处理器拦截用的，它的执行时间是在处理器进行处理之 
     * 后，也就是在Controller的方法调用之后执行，但是它会在DispatcherServlet进行视图的渲染之前执行，也就是说在这个方法中你可以对ModelAndView进行操 
     * 作。这个方法的链式结构跟正常访问的方向是相反的，也就是说先声明的Interceptor拦截器该方法反而会后调用，这跟Struts2里面的拦截器的执行过程有点像， 
     * 只是Struts2里面的intercept方法中要手动的调用ActionInvocation的invoke方法，Struts2中调用ActionInvocation的invoke方法就是调用下一个Interceptor 
     * 或者是调用action，然后要在Interceptor之前调用的内容都写在调用invoke之前，要在Interceptor之后调用的内容都写在调用invoke方法之后。 
     */  
    @Override  
    public void postHandle(HttpServletRequest request,  
            HttpServletResponse response, Object handler,  
            ModelAndView modelAndView) throws Exception {  
        // TODO Auto-generated method stub  
          
    }  
  
    /** 
     * 该方法也是需要当前对应的Interceptor的preHandle方法的返回值为true时才会执行。该方法将在整个请求完成之后，也就是DispatcherServlet渲染了视图执行， 
     * 这个方法的主要作用是用于清理资源的，当然这个方法也只能在当前这个Interceptor的preHandle方法的返回值为true时才会执行。 
     */  
    @Override  
    public void afterCompletion(HttpServletRequest request,  
            HttpServletResponse response, Object handler, Exception ex)  
    throws Exception {  
        // TODO Auto-generated method stub  
          
    }  
      
}  
```

## 例子2-统一的 session 处理

比如 session 的统一处理。

```java
import com.alibaba.fastjson.JSON;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.List;

/**
 * session 请求拦截器
 * @author binbin.hou
 */
@Component
@Slf4j
public class SessionRequestInterceptor extends HandlerInterceptorAdapter{

    @Override
    public boolean preHandle(HttpServletRequest httpServletRequest,
                             HttpServletResponse httpServletResponse,
                             Object o) throws Exception {
        // 判断请求的地址
        String requestUrl = httpServletRequest.getRequestURI();
        // 是否需要跳过鉴权
        if(requestUrl.startsWith("/xxx/any") {
            log.info("url: {}, ignore valid", requestUrl);
            return true;
        }

        //1. 获取登录信息，校验合法性
        // 需要和前端确认，目前是直接放在这个 header 中的 httpServletRequest，然后通过 jwt 解密。
        JwtAuthDto jwtDto = buildByRequest(httpServletRequest);
        JwtInfoUtils.set(jwtDto);

        //2. 异步添加日志

        return true;
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {
        JwtInfoUtils.remove();
    }

}
```





# 方法2-实现WebRequestInterceptor 接口

## 方法

WebRequestInterceptor 中也定义了三个方法，我们也是通过这三个方法来实现拦截的。

这三个方法都传递了同一个参数WebRequest ，那么这个WebRequest 是什么呢？这个WebRequest 是Spring 定义的一个接口，它里面的方法定义都基本跟HttpServletRequest 一样，在WebRequestInterceptor 中对WebRequest 进行的所有操作都将同步到HttpServletRequest 中，然后在当前请求中一直传递。

（1）preHandle(WebRequest request) 方法。

该方法将在请求处理之前进行调用，也就是说会在Controller 方法调用之前被调用。这个方法跟HandlerInterceptor 中的preHandle 是不同的，主要区别在于该方法的返回值是void ，也就是没有返回值，所以我们一般主要用它来进行资源的准备工作，比如我们在使用Hibernate 的时候可以在这个方法中准备一个Hibernate 的Session 对象，然后利用WebRequest 的setAttribute(name, value, scope) 把它放到WebRequest 的属性中。

这里可以说说这个setAttribute 方法的第三个参数scope ，该参数是一个Integer 类型的。在WebRequest 的父层接口RequestAttributes 中对它定义了三个常量：

SCOPE_REQUEST：它的值是0 ，代表只有在request 中可以访问。

SCOPE_SESSION：它的值是1 ，如果环境允许的话它代表的是一个局部的隔离的session，否则就代表普通的session，并且在该session范围内可以访问。

SCOPE_GLOBAL_SESSION：它的值是2 ，如果环境允许的话，它代表的是一个全局共享的session，否则就代表普通的session，并且在该session 范围内可以访问。

（2）postHandle(WebRequest request, ModelMap model) 方法。

该方法将在请求处理之后，也就是在Controller 方法调用之后被调用，但是会在视图返回被渲染之前被调用，所以可以在这个方法里面通过改变数据模型ModelMap 来改变数据的展示。

该方法有两个参数，WebRequest 对象是用于传递整个请求数据的，比如在preHandle 中准备的数据都可以通过WebRequest 来传递和访问；ModelMap 就是Controller 处理之后返回的Model 对象，我们可以通过改变它的属性来改变返回的Model 模型。

（3）afterCompletion(WebRequest request, Exception ex) 方法。

该方法会在整个请求处理完成，也就是在视图返回并被渲染之后执行。所以在该方法中可以进行资源的释放操作。

而WebRequest 参数就可以把我们在preHandle 中准备的资源传递到这里进行释放。Exception 参数表示的是当前请求的异常对象，如果在Controller 中抛出的异常已经被Spring 的异常处理器给处理了的话，那么这个异常对象就是是null 。

## 代码说明

```java
import org.springframework.ui.ModelMap;  
import org.springframework.web.context.request.WebRequest;  
import org.springframework.web.context.request.WebRequestInterceptor;  
  
public class AllInterceptor implements WebRequestInterceptor {  
      
    /** 
     * 在请求处理之前执行，该方法主要是用于准备资源数据的，然后可以把它们当做请求属性放到WebRequest中 
     */  
    @Override  
    public void preHandle(WebRequest request) throws Exception {  
        // TODO Auto-generated method stub  
        System.out.println("AllInterceptor...............................");  
        request.setAttribute("request", "request", WebRequest.SCOPE_REQUEST);//这个是放到request范围内的，所以只能在当前请求中的request中获取到  
        request.setAttribute("session", "session", WebRequest.SCOPE_SESSION);//这个是放到session范围内的，如果环境允许的话它只能在局部的隔离的会话中访问，否则就是在普通的当前会话中可以访问  
        request.setAttribute("globalSession", "globalSession", WebRequest.SCOPE_GLOBAL_SESSION);//如果环境允许的话，它能在全局共享的会话中访问，否则就是在普通的当前会话中访问  
    }  
  
    /** 
     * 该方法将在Controller执行之后，返回视图之前执行，ModelMap表示请求Controller处理之后返回的Model对象，所以可以在 
     * 这个方法中修改ModelMap的属性，从而达到改变返回的模型的效果。 
     */  
    @Override  
    public void postHandle(WebRequest request, ModelMap map) throws Exception {  
        // TODO Auto-generated method stub  
        for (String key:map.keySet())  
            System.out.println(key + "-------------------------");;  
        map.put("name3", "value3");  
        map.put("name1", "name1");  
    }  
  
    /** 
     * 该方法将在整个请求完成之后，也就是说在视图渲染之后进行调用，主要用于进行一些资源的释放 
     */  
    @Override  
    public void afterCompletion(WebRequest request, Exception exception)  
    throws Exception {  
        // TODO Auto-generated method stub  
        System.out.println(exception + "-=-=--=--=-=-=-=-=-=-=-=-==-=--=-=-=-=");  
    }  
      
}  
```

# 方法3-spring aop 方式

## 介绍

spring aop 是非常强大的功能。

各种层都可以实现，这里记录一下，便于后续查阅。

## 例子

以 controller 层的日志拦截器为例。

```java
import com.alibaba.fastjson.JSON;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * 可以添加下列特性：
 *
 * 1. mdc
 * 2. 入参
 * 3. 出参
 * 4. 统一异常处理
 *
 * 暂时先处理 1/2
 * @author binbin.hou
 * @since 1.0.0
 */
@Aspect
@Component
@EnableAspectJAutoProxy
public class ControllerInterceptor {

    /**
     * 日志实例
     * @since 1.0.0
     */
    private static final Logger LOG = LoggerFactory.getLogger(ControllerInterceptor.class);

    /**
     * 拦截 controller 下所有的 public方法
     */
    @Pointcut("execution(public * com.xxx.web.application.controller..*(..))")
    public void pointCut() {
        //
    }

    /**
     * 拦截处理
     *
     * @param point point 信息
     * @return result
     * @throws Throwable if any
     */
    @Around("pointCut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        try {
            //1. 设置 MDC
            LogUtil.putMdcIfAbsent();

            // 获取当前拦截的方法签名
            String signatureShortStr = point.getSignature().toShortString();
            //2. 打印入参信息
            Object[] args = point.getArgs();
            // 参数过滤
            List<Object> filterArgs = getFilterArgs(args);
            LOG.info("{} Param: {}", signatureShortStr, JSON.toJSON(filterArgs));

            Object result = point.proceed();
            LOG.info("{} result: {}", signatureShortStr, JSON.toJSON(result));
            return result;
        } finally {
            LogUtil.removeMdc();
        }
    }

    /**
     * 避免 http 复杂参数异常
     * @param args 参数
     * @return 结果
     */
    private List<Object> getFilterArgs(Object[] args) {
        List<Object> list = new ArrayList<>();
        if(ArrayUtil.isEmpty(args)) {
            return list;
        }

        for(Object o : args) {
            if(o instanceof HttpServletRequest) {
                continue;
            }

            if(o instanceof HttpServletResponse) {
                continue;
            }

            if(o instanceof MultipartFile) {
                continue;
            }

            list.add(o);
        }

        return list;
    }

}
```

# 方法4-ResponseBodyAdvice & @ControllerAdvice

## 说明

我们可以通过实现 ResponseBodyAdvice 接口,标注 `@ControllerAdvice` 来实现统一的拦截。

## 例子

```java
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import javax.servlet.http.HttpServletRequest;

@Slf4j
@ControllerAdvice
public class ApiResponseBodyAdvice implements ResponseBodyAdvice {

    final static String[] EXCLUDE_PATHS = {};

    @Override
    public boolean supports(MethodParameter methodParameter, Class aClass) {
        //这个地方如果返回false, 不会执行 beforeBodyWrite 方法
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object o, MethodParameter methodParameter, MediaType mediaType, Class aClass,
                                  ServerHttpRequest serverHttpRequest, ServerHttpResponse serverHttpResponse) {

        String uri = serverHttpRequest.getURI().getPath();
        for (String path : EXCLUDE_PATHS) {
            if (uri.contains(path)) {
                return o;
            }
        }
        ServletServerHttpRequest servletServerHttpRequest = (ServletServerHttpRequest) serverHttpRequest;
        HttpServletRequest servletRequest = servletServerHttpRequest.getServletRequest();
        String sessionId = servletRequest.getParameter("sessionId");

        // 更多的处理

        return o;
    }
}
```


------------------------------------------------

更多的拓展知识：


# 定义的拦截器添加到 spring mvc

## spring-mvc.xml

配置内容如下：

```xml
<beans xmlns="http://www.springframework.org/schema/beans"  
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:context="http://www.springframework.org/schema/context"  
    xmlns:mvc="http://www.springframework.org/schema/mvc"  
    xsi:schemaLocation="http://www.springframework.org/schema/beans  
     http://www.springframework.org/schema/beans/spring-beans-3.0.xsd  
     http://www.springframework.org/schema/context  
     http://www.springframework.org/schema/context/spring-context-3.0.xsd  
     http://www.springframework.org/schema/mvc  
     http://www.springframework.org/schema/mvc/spring-mvc-3.0.xsd"> 

    <mvc:interceptors>  
        <!-- 使用bean定义一个Interceptor，直接定义在mvc:interceptors根下面的Interceptor将拦截所有的请求 -->  
        <bean class="com.github.houbb.web.interceptor.AllInterceptor"/>  
        <mvc:interceptor>  
            <mvc:mapping path="/test/number.do"/>  
            <!-- 定义在mvc:interceptor下面的表示是对特定的请求才进行拦截的 -->  
            <bean class="com.github.houbb.web.interceptor.LoginInterceptor"/>  
        </mvc:interceptor>  
    </mvc:interceptors>  

</beans>
```

由上面的示例可以看出可以利用mvc:interceptors标签声明一系列的拦截器，然后它们就可以形成一个拦截器链，拦截器的执行顺序是按声明的先后顺序执行的，先声明的拦截器中的preHandle方法会先执行，然而它的postHandle方法和afterCompletion方法却会后执行。

## 两种声明方式

在mvc:interceptors标签下声明interceptor主要有两种方式：

（1）直接定义一个Interceptor实现类的bean对象。使用这种方式声明的Interceptor拦截器将会对所有的请求进行拦截。

（2）使用mvc:interceptor标签进行声明。使用这种方式进行声明的Interceptor可以通过mvc:mapping子标签来定义需要进行拦截的请求路径。

经过上述两步之后，定义的拦截器就会发生作用对特定的请求进行拦截了。

## spring 4.x 补充

基于Spring4.1.0补充：

不知道从哪个版本开始，Spring MVC的mvc命名空间开始支持exclude-mapping。

反正笔者最开始写这篇博文的时候是基于Spring3.1.0所写，那时候的mvc命名空间下是没有execlude-mapping定义的。

但是笔者现在使用的Spring4.1.0是有exclude-mapping定义的。所以基于该版本补充Spring MVC拦截器的exclude-mapping的用法。

mapping只能映射某些需要拦截的请求，而exclude-mapping用来排除某些特定的请求映射。当

我们需要拦截的请求映射是比较通用的，但是其中又包含了某个特殊的请求是不需要使用该拦截器的时候我们就可以把它定义为exclude-mapping了。

比如像下面示例这样，我们定义的拦截器将拦截所有匹配 `/interceptor/**` 模式的请求，但是不能拦截请求“/interceptor/b”，因为它定义为了exclude-mapping。

当定义了exclude-mapping时，Spring MVC将优先判断一个请求是否在execlude-mapping定义的范围内，如果在则不进行拦截。

```xml
<mvc:interceptors>  
    <mvc:interceptor>  
        <mvc:mapping path="/interceptor/**" />  
        <mvc:exclude-mapping path="/interceptor/b" /><!--  不匹配的 -->  
        <bean class="com.github.houbb.web.interceptor.MyInterceptor" />  
    </mvc:interceptor>  
</mvc:interceptors>  
```

虽然笔者的示例中interceptor下面定义的mapping只有一个，但实际上一个interceptor下面定义的mapping和exclude-mapping都是可以有多个的。

另外，exclude-mapping的定义规则和mapping的定义规则是一样的，我们也可以使用一个星号表示任意字符，使用两个星号表示任意层次的任意字符。

比如下面这样。

```xml
<mvc:interceptors>  
    <mvc:interceptor>  
        <mvc:mapping path="/interceptor/**" />  
        <mvc:exclude-mapping path="/interceptor/b/*" /><!--  不匹配的 -->  
        <bean class="com.github.houbb.web.interceptor.MyInterceptor" />  
    </mvc:interceptor>  
</mvc:interceptors>  
```



# 拦截器与过滤器的区别

## 1. 拦截器:

interceptor

过滤器(filter)与拦截器(intercepter)相同点:

1) 都可以拦截请求,过滤请求

2) 都是应用了过滤器(责任链)设计模式

## 2.区别:

1) filter是范围比较大,配置web.xml中

2) intercepter范围比较小,配置在springmvc中

3) 在进入springmvc处理之前,要先处理web.xml的

- springmvc-servlet.txml

```xml
<bean id="localeResolver"
      class="org.springframework.web.servlet.i18n.SessionLocaleResolver"></bean>
<mvc:interceptors>
    <!--<bean class="com.etc.interceptor.LoginInterceptor.etc.interceptor.MyInterceptor"></bean>-->
    <bean class="org.springframework.web.servlet.i18n.LocaleChangeInterceptor"></bean>
    <mvc:interceptor>
        <mvc:mapping path="/**"/>
        <mvc:exclude-mapping path="/login"/>
        <bean class="com.etc.interceptor.LoginInterceptor"/>
    </mvc:interceptor>
</mvc:interceptors>
```

- web.xml

```xml
<filter>
    <filter-name>loginFilter</filter-name>
    <filter-class>com.github.houbb.fileter.MyFileter</filter-class>
</filter>
<filter-mapping>
    <filter-name>loginFilter</filter-name>
    <url-pattern>/</url-pattern>
</filter-mapping>
```

## 拦截器实现

- LoginInterceptor

```java
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@Component
public class LoginInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o) throws Exception {
        HttpSession session=httpServletRequest.getSession();
        if(session.getAttribute("login")==null){
            httpServletResponse.sendRedirect("/login");
            return false;
        }else {
            System.out.println("ip:"+httpServletRequest.getRemoteHost()+"url"+httpServletRequest.getRequestURL()) ;
            return true;
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

- MyFileter.java

```java
import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@Component
public class MyFileter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        // 实际
        HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
        HttpServletResponse httpServletResponse = (HttpServletResponse) servletResponse;

        // 如果调用了这个方法,过滤器就会继承往下执行,
        HttpSession session = httpServletRequest.getSession();
        if (session.getAttribute("login") == null) {
            //没有登陆
            httpServletResponse.sendRedirect("/login");
            //return false;
        } else {
            System.out.println("ip:" + httpServletRequest.getRemoteHost() + ",url:" + httpServletRequest.getRequestURL());
            filterChain.doFilter(servletRequest, servletResponse);
            //return true;
        }

    }

    @Override
    public void destroy() {

    }
}
```

## 使用的拦截器不生效问题

使用的 springboot 版本为 1.5.x

晚上说直解指定 component 就行，但是实际测试不生效。

所以加了一下拦截器的指定。

```java
import com.github.houbb.privilege.admin.web.interceptor.SessionRequestInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

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

# 日志拦截器的例子

## 应该统一处理的事情

1. 统一设置编码

2. 设置 TraceId

3. 输出参数

4. 输出请求地址

5. 输出耗时

6. 输出 IP 信息

## 代码

```java
package com.github.houbb.springboot.learn.interceptor.interceptor;

import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Enumeration;

/**
 * 日志拦截器
 * @author binbin.hou
 * @since 1.0.0
 */
public class LogInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse httpServletResponse, Object o) throws Exception {
        // 设置编码
        req.setCharacterEncoding("UTF-8");

        // 设置 TraceId

        // 参数输出
        Enumeration<String> paramNames = req.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            Object value = req.getParameter(paramName);
            System.out.println(paramName+": " + value);
        }

        // IP 信息获取
        String ip = getRequestIp(req);

        // 耗时统计

        return true;
    }

    /**
     * 获取请求的 IP 地址
     * @param req 请求信息
     * @return 结果
     * @since 0.0.1
     */
    private String getRequestIp(HttpServletRequest req) {
        String ip = req.getHeader("X-Forwarded-For");
        if (StringUtils.isEmpty(ip)) {
            ip = req.getHeader("Proxy-Client-IP");
        }
        if (StringUtils.isEmpty(ip)) {
            ip = req.getHeader("WL-Proxy-Client-IP");
        }
        if (StringUtils.isEmpty(ip)) {
            ip = req.getRemoteAddr();
        }

        return ip;
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {
        // 移除 TraceId
    }

}
```

# 拓展阅读

[RPC 调用中的拦截器怎么写？](https://houbb.github.io/2022/11/28/rpc-aop)

[Spring Web MVC-09-springmvc 过滤器与拦截器 Handler and Filter](https://houbb.github.io/2019/12/25/springmvc-09-handler)

[Mybatis 拦截器](https://houbb.github.io/2019/01/23/mybatis-inteceptor)

[Spring Session 结合拦截器实战](https://houbb.github.io/2018/09/26/spring-session-02-interceptor)

[基于 netty4 手写 rpc-17-interceptor 拦截器](https://houbb.github.io/2018/08/24/simple-rpc-17-netty4-interceptor)

[Spring Boot-13-springboot 整合 redis 实现分布式 session 实战 拦截器+方法注解](https://houbb.github.io/2017/12/19/spring-boot-13-session)

# 参考资料

[springmvc 过滤器和拦截器](https://www.cnblogs.com/LiuOOP/p/11208830.html)

[SpringMVC中使用Interceptor拦截器](https://www.iteye.com/blog/elim-1750680)

[SpringMVC 拦截器详解](https://www.cnblogs.com/winner-0715/p/9749039.html)

* any list
{:toc}