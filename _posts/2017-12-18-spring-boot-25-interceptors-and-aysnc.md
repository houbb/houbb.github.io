---
layout: post
title:  Spring Boot-25-三种常见拦截器实现方式及异步的一点思考
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# springboot 拦截器

实际项目中，我们经常需要输出请求参数，响应结果，方法耗时，统一的权限校验等。

本文首先为大家介绍 HTTP 请求中三种常见的拦截实现，并且比较一下其中的差异。

（1）基于 Aspect 的拦截器

（2）基于 HandlerInterceptor 的拦截器

（3）基于 ResponseBodyAdvice 的拦截器

推荐阅读：

统一日志框架: [https://github.com/houbb/auto-log](https://github.com/houbb/auto-log)

# springboot 入门案例

为了便于大家学习，我们首先从最基本的 springboot 例子讲起。

## maven 引入

引入必须的 jar 包。

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>1.5.9.RELEASE</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.aspectj</groupId>
        <artifactId>aspectjrt</artifactId>
        <version>1.8.10</version>
    </dependency>
    <dependency>
        <groupId>org.aspectj</groupId>
        <artifactId>aspectjweaver</artifactId>
        <version>1.8.10</version>
    </dependency>
</dependencies>
<!-- Package as an executable jar -->
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

## 启动类

实现最简单的启动类。

```java
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

## 定义 Controller 

为了演示方便，我们首先实现一个简单的 controller。

```java
@RestController
public class IndexController {

    @RequestMapping("/index")
    public AsyncResp index() {
        AsyncResp asyncResp = new AsyncResp();
        asyncResp.setResult("ok");
        asyncResp.setRespCode("00");
        asyncResp.setRespDesc("成功");

        System.out.println("IndexController#index：" + asyncResp);
        return asyncResp;
    }

}
```

其中 AsyncResp 的定义如下：

```java
public class AsyncResp {

    private String respCode;

    private String respDesc;

    private String result;


    // getter & setter & toString()
}
```

# 拦截器定义

## 基于 Aspect

```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 *
 * @author binbin.hou
 * @since 1.0.0
 */
@Aspect
@Component
@EnableAspectJAutoProxy
public class AspectLogInterceptor {

    /**
     * 日志实例
     * @since 1.0.0
     */
    private static final Logger LOG = LoggerFactory.getLogger(AspectLogInterceptor.class);

    /**
     * 拦截 controller 下所有的 public方法
     */
    @Pointcut("execution(public * com.github.houbb.springboot.learn.aspect.controller..*(..))")
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

            // 获取当前拦截的方法签名
            String signatureShortStr = point.getSignature().toShortString();
            //2. 打印入参信息
            Object[] args = point.getArgs();
            LOG.info("{} 参数: {}", signatureShortStr, Arrays.toString(args));

            //3. 打印结果
            Object result = point.proceed();
            LOG.info("{} 结果: {}", signatureShortStr, result);
            return result;
        } finally {
            // 移除 mdc
        }
    }

}
```

这种实现的优点是比较通用，可以结合注解实现更加灵活强大的功能。

是个人非常喜欢的一种方式。

主要用途：

（1）日志的出参/入参

（2）统一设置 TraceId

（3）方法的调用耗时统计

## 基于 HandlerInterceptor

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.DispatcherType;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Component
public class LogHandlerInterceptor implements HandlerInterceptor {

    private Logger logger = LoggerFactory.getLogger(LogHandlerInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 统一的权限校验、路由等
        logger.info("LogHandlerInterceptor#preHandle 请求地址：{}", request.getRequestURI());

        if (request.getDispatcherType().equals(DispatcherType.ASYNC)) {
            return true;
        }

        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        logger.info("LogHandlerInterceptor#postHandle 调用");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {

    }

}
```

然后需要指定对应的 url 和拦截器之间的关系才会生效：

```java
import com.github.houbb.springboot.learn.aspect.aspect.LogHandlerInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * spring mvc 配置
 * @since 1.0.0
 */
@Configuration
public class SpringMvcConfig extends WebMvcConfigurerAdapter {

    @Autowired
    private LogHandlerInterceptor logHandlerInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(logHandlerInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/version");
        super.addInterceptors(registry);
    }

}
```

这种方式的优点就是可以根据 url 灵活指定不同的拦截器。

缺点是主要用于 Controller 层。

## 基于 ResponseBodyAdvice

此接口有beforeBodyWrite方法，参数body是响应对象response中的响应体，那么我们就可以用此方法来对响应体做一些统一的操作。

比如加密，签名等。

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import javax.servlet.http.HttpServletRequest;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@ControllerAdvice
public class MyResponseBodyAdvice implements ResponseBodyAdvice<Object> {

    /**
     * 日志实例
     * @since 1.0.0
     */
    private static final Logger LOG = LoggerFactory.getLogger(MyResponseBodyAdvice.class);

    @Override
    public boolean supports(MethodParameter methodParameter, Class aClass) {
        //这个地方如果返回false, 不会执行 beforeBodyWrite 方法
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object resp, MethodParameter methodParameter, MediaType mediaType, Class<? extends HttpMessageConverter<?>> aClass, ServerHttpRequest serverHttpRequest, ServerHttpResponse serverHttpResponse) {
        String uri = serverHttpRequest.getURI().getPath();
        LOG.info("MyResponseBodyAdvice#beforeBodyWrite 请求地址：{}", uri);

        ServletServerHttpRequest servletServerHttpRequest = (ServletServerHttpRequest) serverHttpRequest;
        HttpServletRequest servletRequest = servletServerHttpRequest.getServletRequest();

        // 可以做统一的拦截器处理

        // 可以对结果做动态修改等
        LOG.info("MyResponseBodyAdvice#beforeBodyWrite 响应结果：{}", resp);
        return resp;
    }

}
```

## 测试

我们启动应用，页面访问：

[http://localhost:18080/index](http://localhost:18080/index)

页面响应：

```
{"respCode":"00","respDesc":"成功","result":"ok"}
```

后端日志：

```
c.g.h.s.l.a.a.LogHandlerInterceptor      : LogHandlerInterceptor#preHandle 请求地址：/index
c.g.h.s.l.a.aspect.AspectLogInterceptor  : IndexController.index() 参数: []
IndexController#index：AsyncResp{respCode='00', respDesc='成功', result='ok'}
c.g.h.s.l.a.aspect.AspectLogInterceptor  : IndexController.index() 结果: AsyncResp{respCode='00', respDesc='成功', result='ok'}
c.g.h.s.l.a.aspect.MyResponseBodyAdvice  : MyResponseBodyAdvice#beforeBodyWrite 请求地址：/index
c.g.h.s.l.a.aspect.MyResponseBodyAdvice  : MyResponseBodyAdvice#beforeBodyWrite 响应结果：AsyncResp{respCode='00', respDesc='成功', result='ok'}
c.g.h.s.l.a.a.LogHandlerInterceptor      : LogHandlerInterceptor#postHandle 调用
```

这里执行的先后顺序也比较明确，此处不再赘述。

# 异步执行

当然，如果只是上面这些内容，并不是本篇文章的重点。

接下来，我们一起来看下，如果引入了异步执行会怎么样。

## 定义异步线程池

springboot 中定义异步线程池，非常简单。

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * 请求异步处理配置
 *
 * @author binbin.hou
 */
@Configuration
@EnableAsync
public class SpringAsyncConfig {

    @Bean(name = "asyncPoolTaskExecutor")
    public AsyncTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(10);
        executor.setCorePoolSize(10);
        executor.setWaitForTasksToCompleteOnShutdown(true);
        return executor;
    }

}
```

## 异步执行的 Controller

```java
@RestController
public class MyAsyncController extends BaseAsyncController<String> {

    @Override
    protected String process(HttpServletRequest request) {
        return "ok";
    }

    @RequestMapping("/async")
    public AsyncResp hello(HttpServletRequest request) {
        AsyncResp resp = super.execute(request);

        System.out.println("Controller#async 结果：" + resp);
        return resp;
    }

}
```

其中 BaseAsyncController 的实现如下：

```java
@RestController
public abstract class BaseAsyncController<T> {

    protected abstract T process(HttpServletRequest request);

    @Autowired
    private AsyncTaskExecutor taskExecutor;

    protected AsyncResp execute(HttpServletRequest request) {
        // 异步响应结果
        AsyncResp resp = new AsyncResp();
        try {
            taskExecutor.execute(new Runnable() {
                @Override
                public void run() {
                    try {
                        T result = process(request);

                        resp.setRespCode("00");
                        resp.setRespDesc("成功");
                        resp.setResult(result.toString());

                    } catch (Exception exception) {
                        resp.setRespCode("98");
                        resp.setRespDesc("任务异常");
                    }
                }
            });
        } catch (TaskRejectedException e) {
            resp.setRespCode("99");
            resp.setRespDesc("任务拒绝");
        }

        return resp;
    }

}
```

execute 的实现也比较简单：

（1）主线程创建一个 AsyncResp，用于返回。

（2）线程池异步执行具体的子类方法，并且设置对应的值。

## 思考

接下来，问大家一个问题。

如果我们请求 [http://localhost:18080/async](http://localhost:18080/async)，那么：

（1）页面得到的返回值是什么？

（2）Aspect 日志输出的返回值是？

（3）ResponseBodyAdvice 日志输出的返回值是什么？

你可以在这里稍微停一下，记录下你的答案。

## 测试

我们页面请求 [http://localhost:18080/async](http://localhost:18080/async)。

页面响应如下：

```
{"respCode":"00","respDesc":"成功","result":"ok"}
```

后端的日志：

```
c.g.h.s.l.a.a.LogHandlerInterceptor      : LogHandlerInterceptor#preHandle 请求地址：/async
c.g.h.s.l.a.aspect.AspectLogInterceptor  : MyAsyncController.hello(..) 参数: [org.apache.catalina.connector.RequestFacade@7e931750]
Controller#async 结果：AsyncResp{respCode='null', respDesc='null', result='null'}
c.g.h.s.l.a.aspect.AspectLogInterceptor  : MyAsyncController.hello(..) 结果: AsyncResp{respCode='null', respDesc='null', result='null'}
c.g.h.s.l.a.aspect.MyResponseBodyAdvice  : MyResponseBodyAdvice#beforeBodyWrite 请求地址：/async
c.g.h.s.l.a.aspect.MyResponseBodyAdvice  : MyResponseBodyAdvice#beforeBodyWrite 响应结果：AsyncResp{respCode='00', respDesc='成功', result='ok'}
c.g.h.s.l.a.a.LogHandlerInterceptor      : LogHandlerInterceptor#postHandle 调用
```

对比一下，可以发现我们上面问题的答案：

（1）页面得到的返回值是什么？

`{"respCode":"00","respDesc":"成功","result":"ok"}` 

可以获取到异步执行完成的结果。

（2）Aspect 日志输出的返回值是？

`AsyncResp{respCode='null', respDesc='null', result='null'}`

无法获取异步结果。

（3）ResponseBodyAdvice 日志输出的返回值是什么？

`AsyncResp{respCode='00', respDesc='成功', result='ok'}`

可以获取到异步执行完成的结果。

## 反思

可以发现，spring 对于页面的响应也许和我们想的有些不一样，并不是直接获取同步结果。

写到这里，发现自己对于 mvc 的理解一直只是停留在表面，没有真正理解整个流程。

Aspect 的形式在很多框架中都会使用，不过这里会发现无法获取异步的执行结果，存在一定问题。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

我是老马，期待与你的下次重逢。

# 参考资料

https://docs.spring.io/spring-boot/docs/2.4.1/maven-plugin/reference/htmlsingle/#help

[SpringBoot中异步请求和异步调用（看这一篇就够了）](https://www.cnblogs.com/baixianlong/p/10661591.html)

* any list
{:toc}
