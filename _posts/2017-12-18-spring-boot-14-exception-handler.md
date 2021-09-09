---
layout: post
title:  Spring Boot-14-springboot exception handler 全局异常处理
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# 全局异常处理

## 应用场景

springboot 页面报错

```
Whitelabel Error Page
This application has no explicit mapping for /error, so you are seeing this as a fallback.

Fri Sep 18 22:13:52 CST 2020
There was an unexpected error (type=Not Found, status=404).
No message available
```

这种没有处理的异常，对于用户的体验非常不好。

如果每一个异常都分开处理，重复的地方又会特别多。

统一处理异常，避免所有的代码中重复处理异常。

## 实现方式

第一种：使用@ControllerAdvice和@ExceptionHandler注解

第二种: 使用ErrorController类来实现。

## 使用@ControllerAdvice和@ExceptionHandler注解

```java
import com.github.houbb.privilege.admin.common.dto.BaseResp;
import com.github.houbb.privilege.admin.common.util.RespUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;

/**
 * 全局异常处理
 * @author binbin.hou
 * @since 1.0.0
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 日志
     * @since 0.0.3
     */
    private static Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ResponseBody
    @ExceptionHandler(Exception.class)
    public BaseResp globalException(HttpServletResponse response, Exception ex){
        logger.error("全局异常", ex);
        // 异常输出
        return RespUtil.fail(ex.getMessage());
    }

}
```

### @ControllerAdvice

注解 `@ControllerAdvice` 表示这是一个控制器增强类，当控制器发生异常且符合类中定义的拦截异常类，将会被拦截。

```java
public @interface ControllerAdvice {

	/**
	 * Alias for the {@link #basePackages} attribute.
	 * <p>Allows for more concise annotation declarations e.g.:
	 * {@code @ControllerAdvice("org.my.pkg")} is equivalent to
	 * {@code @ControllerAdvice(basePackages="org.my.pkg")}.
	 * @since 4.0
	 * @see #basePackages()
	 */
	@AliasFor("basePackages")
	String[] value() default {};

	/**
	 * Array of base packages.
	 * <p>Controllers that belong to those base packages or sub-packages thereof
	 * will be included, e.g.: {@code @ControllerAdvice(basePackages="org.my.pkg")}
	 * or {@code @ControllerAdvice(basePackages={"org.my.pkg", "org.my.other.pkg"})}.
	 * <p>{@link #value} is an alias for this attribute, simply allowing for
	 * more concise use of the annotation.
	 * <p>Also consider using {@link #basePackageClasses()} as a type-safe
	 * alternative to String-based package names.
	 * @since 4.0
	 */
	@AliasFor("value")
	String[] basePackages() default {};

	/**
	 * Type-safe alternative to {@link #value()} for specifying the packages
	 * to select Controllers to be assisted by the {@code @ControllerAdvice}
	 * annotated class.
	 * <p>Consider creating a special no-op marker class or interface in each package
	 * that serves no purpose other than being referenced by this attribute.
	 * @since 4.0
	 */
	Class<?>[] basePackageClasses() default {};

	/**
	 * Array of classes.
	 * <p>Controllers that are assignable to at least one of the given types
	 * will be assisted by the {@code @ControllerAdvice} annotated class.
	 * @since 4.0
	 */
	Class<?>[] assignableTypes() default {};

	/**
	 * Array of annotations.
	 * <p>Controllers that are annotated with this/one of those annotation(s)
	 * will be assisted by the {@code @ControllerAdvice} annotated class.
	 * <p>Consider creating a special annotation or use a predefined one,
	 * like {@link RestController @RestController}.
	 * @since 4.0
	 */
	Class<? extends Annotation>[] annotations() default {};

}
```

### 注解 @ExceptionHandler 定义拦截的异常类

```java
public @interface ExceptionHandler {

	/**
	 * Exceptions handled by the annotated method. If empty, will default to any
	 * exceptions listed in the method argument list.
	 */
	Class<? extends Throwable>[] value() default {};

}
```

## 第二种：使用ErrorController类来实现。

系统默认的错误处理类为BasicErrorController，将会显示如上的错误页面。

这里编写一个自己的错误处理类，上面默认的处理类将不会起作用。

getErrorPath()返回的路径服务器将会重定向到该路径对应的处理类，本例中为error方法。

```java
@Slf4j
@RestController
public class HttpErrorController implements ErrorController {

    private final static String ERROR_PATH = "/error";

    @ResponseBody
    @RequestMapping(path  = ERROR_PATH )
    public BaseResult error(HttpServletRequest request, HttpServletResponse response){
        log.info("访问/error" + "  错误代码："  + response.getStatus());
        BaseResult result = new WebResult(WebResult.RESULT_FAIL,"HttpErrorController error:"+response.getStatus());return result;
    }
    @Override
    public String getErrorPath() {
        return ERROR_PATH;
    }
}
```

## 区别

1. 注解@ControllerAdvice方式只能处理控制器抛出的异常。此时请求已经进入控制器中。

2. 类ErrorController方式可以处理所有的异常，包括未进入控制器的错误，比如404,401等错误

3. 如果应用中两者共同存在，则@ControllerAdvice方式处理控制器抛出的异常，类ErrorController方式未进入控制器的异常。

4. @ControllerAdvice方式可以定义多个拦截方法，拦截不同的异常类，并且可以获取抛出的异常信息，自由度更大。


# 自定义处理 4.4 页面

## 说明

springboot 常规的全局异常处理，无法处理 404 这种异常，给出的提示是默认的，不是很符合我们的期望。

我们来实现一个。

## 默认实现

SpringBoot默认的处理异常的机制：SpringBoot默认的已经提供了一套处理异常的机制。一旦程序中出现了异常SpringBoot会像/error的url发送请求。
 
在springBoot中提供了一个叫BasicExceptionController来处理/error请求，然后跳转到默认显示异常的页面来展示异常信息。

如果我们需要将所有的异常同一跳转到自定义的错误页面，需要再src/main/resources/templates目录下创建error.html页面。

注意：名称必须叫 error

### 默认处理类

实际上默认的异常处理类是 BasicErrorController

```java
@Controller
@RequestMapping("${server.error.path:${error.path:/error}}")
public class BasicErrorController extends AbstractErrorController {

    @Override
	public String getErrorPath() {
		return this.errorProperties.getPath();
	}

}
```

- AbstractErrorController.java

```java
public abstract class AbstractErrorController implements ErrorController {
}
```

这些是 springboot 的内置实现，当然我们可以根据自己的需要进行实现。


## 自定义实现

### 指定异常处理 controller

```java
@Component
public class ErrorControllerConfig implements ErrorController {

    @Override
    public String getErrorPath() {
        return "/error";
    }

}
```

我们直接指定异常的路径为 error。


### 异常处理

```java
@RestController
public class MyErrorController {

    private final ErrorAttributes errorAttributes;

    public MyErrorController(ErrorAttributes errorAttributes) {
        this.errorAttributes = errorAttributes;
    }

    @RequestMapping("/error")
    public BaseResp error(HttpServletRequest request) {
        RequestAttributes requestAttributes = new ServletRequestAttributes(request);
        Map<String, Object> body = this.errorAttributes.getErrorAttributes(requestAttributes, true);
        return RespUtil.fail(JSON.toJSONString(body));
    }

}
```

这里我们将异常的信息拿到，输出到页面。

## 测试

直接访问 [http://localhost:8080/user1](http://localhost:8080/user1)，返回

```json
{"respCode":"9999","respMessage":"{\"timestamp\":1600440125706,\"status\":404,\"error\":\"Not Found\",\"message\":\"No message available\",\"path\":\"/user1\"}"}
```

已经是我们处理的结果了。


# 更加灵活的配置

当然，大部分情况我们都希望不同的异常，有不同的控制类去处理。

## SimpleMappingExceptionResolver

在全局异常类中添加一个方法完成异常的同一处理

```java
/**
 * 通过SimpleMappingExceptionResolver做全局异常处理
 *
 *
 */
@Configuration
public class GlobalException {
    
    /**
     * 该方法必须要有返回值。返回值类型必须是：SimpleMappingExceptionResolver
     */
    @Bean
    public SimpleMappingExceptionResolver getSimpleMappingExceptionResolver(){
        SimpleMappingExceptionResolver resolver = new SimpleMappingExceptionResolver();
        
        Properties mappings = new Properties();
        
        /**
         * 参数一：异常的类型，注意必须是异常类型的全名
         * 参数二：视图名称
         */
        mappings.put("java.lang.ArithmeticException", "error1");
        mappings.put("java.lang.NullPointerException","error2");
        
        //设置异常与视图映射信息的
        resolver.setExceptionMappings(mappings);
        
        return resolver;
    }
    
}
```

## 自定义HandlerExceptionResolver类处理异常

需要再全局异常处理类中实现HandlerExceptionResolver接口

```java
/**
 * 通过实现HandlerExceptionResolver接口做全局异常处理
 *
 *
 */
@Configuration
public class GlobalException implements HandlerExceptionResolver {

    @Override
    public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response, Object handler,
            Exception ex) {
        ModelAndView mv = new ModelAndView();
        //判断不同异常类型，做不同视图跳转
        if(ex instanceof ArithmeticException){
            mv.setViewName("error1");
        }
        
        if(ex instanceof NullPointerException){
            mv.setViewName("error2");
        }
        mv.addObject("error", ex.toString());
        
        return mv;
    }
}
```

# 全局异常的个人误区

## 返回值的设计

一般建议基于 springboot 的结果进行设计，不过一般我们都会习惯定义基本的响应体。

```java
public class BaseResp {

    private String respCode;

    private String respMsg;

    //...
}
```

其他响应值，以这个为基础进行拓展：

```java
public class BaseInfoResp extends BaseResp {

    private String message;

    //...
```

## 使用

这样的好处就是，返回值可以统一使用 BaseResp，同时保证前端的接收到的结果是完整的。

当然，指定为具体的子类也是可以的。

```java
@RequestMapping("hello")
@RequireRole({"admin"})
public BaseInfoResp hello() {
    try {
        BaseInfoResp infoResp = new BaseInfoResp();
        infoResp.setRespCode("0");
        infoResp.setRespMsg("success");
        infoResp.setMessage("hello");
        return infoResp;
    } catch (Exception exception) {
        BaseInfoResp infoResp = new BaseInfoResp();
        infoResp.setRespCode("自己设置的异常");
        infoResp.setRespMsg(exception.getMessage());
        return infoResp;
    }
}


@RequestMapping("hello2")
@RequireRole({"admin"})
public BaseResp hello2() {
    try {
        BaseInfoResp infoResp = new BaseInfoResp();
        infoResp.setRespCode("0");
        infoResp.setRespMsg("success");
        infoResp.setMessage("hello");
        return infoResp;
    } catch (Exception exception) {
        BaseInfoResp infoResp = new BaseInfoResp();
        infoResp.setRespCode("自己设置的异常");
        infoResp.setRespMsg(exception.getMessage());
        return infoResp;
    }
}
```

## 拦截器的异常

### 异常的其他情况

上面的方法还有两一个问题：异常的捕获。

虽然方法体本身进行了 catch，但是如果我们在拦截器中抛出异常，比如：

```java
@Component
public class SessionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o) throws Exception {
         throw new RuntimeException("403 FORBIDDEN");
    }

    //....
}
```

这个时候，上述的 controller 方法的 catch 是无效的，因为还没有进入方法。

### 全局异常

这个时候建议引入全局异常。

```java
import com.github.houbb.springboot.learn.interceptor.resp.BaseInfoResp;
import com.github.houbb.springboot.learn.interceptor.resp.BaseResp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;

/**
 * 全局异常处理
 * @author binbin.hou
 * @since 1.0.0
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 日志
     * @since 0.0.3
     */
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ResponseBody
    @ExceptionHandler(Exception.class)
    public BaseResp globalException(HttpServletResponse response, Exception ex){
        logger.error("全局异常", ex);

        BaseInfoResp infoResp = new BaseInfoResp();
        infoResp.setRespCode("全局异常");
        infoResp.setRespMsg(ex.getMessage());

        return infoResp;
    }

}
```

可以发现，原来的方法返回的是 BaseInfoResp，我们在全局拦截器中返回 BaseResp 也是没有任何问题的。

### 异常的细化

当然，我们的异常可以进一步细化，以便提示的更加细致。

```java
@ResponseBody
@ExceptionHandler(EchoBlogBizException.class)
public BaseResp echoBlogBizException(HttpServletResponse response, EchoBlogBizException ex){
    logger.error("业务异常", ex);
    // 异常输出
    return RespUtil.fail(ex.getCode()+": " + ex.getMsg());
}
```

这样 springboot 会优先匹配最精确的 EchoBlogBizException 异常，如果不匹配就寻找兜底的异常 Exception。

# 参考资料

[SpringBoot处理全局统一异常](https://www.cnblogs.com/lgjlife/p/10988439.html)

[SpringBoot ErrorController 实践](https://www.jianshu.com/p/23edca918ce8)

[SpringBoot 处理异常方式](https://www.cnblogs.com/sunfie/p/11436159.html)

* any list
{:toc}
