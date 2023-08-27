---
layout: post
title: spring aop-01-spring aop 中的 @within @annotation 详细介绍和使用
date: 2023-08-27 21:01:55 +0800
categories: [AOP]
tags: [aop, spring, aspect, sh]
published: true
---

# Q1-spring aop 中的 @within @annotation 详细介绍和使用

在Spring AOP（面向切面编程）中，`@within` 和 `@annotation` 是两个用于定义切点的注解。切点是在程序执行过程中，插入切面代码的特定位置。Spring AOP允许你在应用程序的特定方法上或特定类上应用切面。

1. `@within` 注解：

`@within` 注解用于匹配标注有特定注解的类的方法。它的作用是选择那些所在类标注了指定注解的方法，然后将切面逻辑应用于这些方法。下面是一个示例：

```java
@Aspect
@Component
public class MyAspect {

    @Before("@within(com.example.MyAnnotation)")
    public void beforeMethodWithinAnnotation() {
        // 在标注有 @MyAnnotation 注解的类中的方法执行之前执行
    }
}
```

在上面的例子中，`@Before` 注解表示在匹配的切点方法执行之前执行 `beforeMethodWithinAnnotation` 方法。这个切点会匹配那些所在类标注了 `com.example.MyAnnotation` 注解的方法。

2. `@annotation` 注解：

`@annotation` 注解用于匹配标注有特定注解的方法。它的作用是选择那些被标注了指定注解的方法，然后将切面逻辑应用于这些方法。下面是一个示例：

```java
@Aspect
@Component
public class MyAspect {

    @Before("@annotation(com.example.Loggable)")
    public void beforeLoggableMethod() {
        // 在标注有 @Loggable 注解的方法执行之前执行
    }
}
```

在上面的例子中，`@Before` 注解表示在匹配的切点方法执行之前执行 `beforeLoggableMethod` 方法。这个切点会匹配那些被标注了 `com.example.Loggable` 注解的方法。

总结：

- `@within` 用于匹配标注有指定注解的类中的方法。
- `@annotation` 用于匹配被指定注解标注的方法。

这些注解是Spring AOP中定义切点的一种方式。你可以将切面逻辑应用于特定的类或方法，并根据需要在方法执行前或执行后插入自定义的行为。注意，切面和切点的定义通常结合在一起，切面定义了切点以及在切点上执行的通知（advice）逻辑。

# 实战使用例子

## 常见写法

```java
package com.github.houbb.auto.log.spring.aop;

import com.github.houbb.aop.spring.util.SpringAopUtil;
import com.github.houbb.auto.log.annotation.AutoLog;
import com.github.houbb.auto.log.core.bs.AutoLogBs;
import com.github.houbb.auto.log.spring.context.SpringAopAutoLogContext;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * 这是一种写法
 * 自动日志输出 aop
 * @author binbin.hou
 * @since 0.0.3
 */
@Aspect
@Component
@EnableAspectJAutoProxy
@Deprecated
public class AutoLogAop {

    /**
     *
     * 切面方法：
     *
     * （1）扫描所有的共有方法
     * <pre>
     *     execution(public * *(..))
     * </pre>
     *
     * 问题：切面太大，废弃。
     * 使用扫描注解的方式替代。
     *
     * （2）扫描指定注解的方式
     *
     * 其实可以在 aop 中直接获取到注解信息，暂时先不调整。
     * 暂时先不添加 public 的限定
     *
     * （3）直接改成注解的优缺点：
     * 优点：减少了 aop 的切面访问
     * 缺点：弱化了注解的特性，本来是只要是 {@link com.github.houbb.auto.log.annotation.AutoLog} 指定的注解即可，
     *
     * 不过考虑到使用者的熟练度，如果用户知道了自定义注解，自定义 aop 应该也不是问题。
     *
     * // 匹配任意public方法
     * execution(public * *(..))
     * // 匹配任意以set开头的方法
     * execution(* set*(..))
     * // 匹配AccountService接口中定义的任意方法
     * execution(* com.xyz.service.AccountService.*(..))
     * // 匹配service包定义的任意方法
     * execution(* com.xyz.service.*.*(..))
     * // 匹配service或其子包中定义的任意方法
     * execution(* com.xyz.service..*.*(..))
     *
     */
    @Pointcut("@within(com.github.houbb.auto.log.annotation.AutoLog)" +
            "|| @annotation(com.github.houbb.auto.log.annotation.AutoLog)")
    public void autoLogPointcut() {
    }

    /**
     * 执行核心方法
     *
     * 相当于 MethodInterceptor
     *
     * @param point 切点
     * @return 结果
     * @throws Throwable 异常信息
     * @since 0.0.3
     */
    @Around("autoLogPointcut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        Method method = SpringAopUtil.getCurrentMethod(point);
        AutoLog autoLog = AnnotationUtils.getAnnotation(method, AutoLog.class);

        //获取当前类注解信息
        if(autoLog == null) {
            autoLog = SpringAopUtil.getClassAnnotation(point, AutoLog.class);
        }

        // 如果不存在
        if(autoLog == null) {
            return point.proceed();
        }
        // 如果存在，则执行切面的逻辑
        SpringAopAutoLogContext logContext = SpringAopAutoLogContext.newInstance();
        logContext.method(method)
                .autoLog(autoLog)
                .params(point.getArgs());
        logContext.point(point);
        return AutoLogBs.newInstance()
                .context(logContext)
                .execute();
    }

}
```

## 动态切面

```java
package com.github.houbb.auto.log.spring.aop;

import org.aspectj.lang.annotation.Aspect;
import org.springframework.aop.aspectj.AspectJExpressionPointcutAdvisor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.stereotype.Component;

/**
 * 动态配置的切面
 * 自动日志输出 aop
 * @author binbin.hou
 * @since 0.3.0
 */
@Configuration
@Aspect
//@EnableAspectJAutoProxy
public class AutoLogDynamicPointcut {

    /**
     * 切面设置，直接和 spring 的配置对应 ${}，可以从 properties 或者配置中心读取。更加灵活
     */
    @Value("${auto.log.pointcut:@within(com.github.houbb.auto.log.annotation.AutoLog)||@annotation(com.github.houbb.auto.log.annotation.AutoLog)}")
    private String pointcut;

    @Bean("autoLogPointcutAdvisor")
    public AspectJExpressionPointcutAdvisor autoLogPointcutAdvisor() {
        AspectJExpressionPointcutAdvisor advisor = new AspectJExpressionPointcutAdvisor();
        advisor.setExpression(pointcut);
        advisor.setAdvice(new AutoLogAdvice());
        return advisor;
    }

}
```

对应的切面实现。

```java
package com.github.houbb.auto.log.spring.aop;

import com.github.houbb.auto.log.annotation.AutoLog;
import com.github.houbb.auto.log.core.bs.AutoLogBs;
import com.github.houbb.auto.log.spring.config.DefaultAutoLogGlobalConfig;
import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.springframework.core.annotation.AnnotationUtils;

import java.lang.reflect.Method;

/**
 * 切面拦截器
 *
 * @author binbin.hou
 * @since 0.3.0
 */
public class AutoLogAdvice implements MethodInterceptor {

    private AutoLog getAutoLogAnnotation(final MethodInvocation methodInvocation) {
        //1. 方法级别
        Method method = methodInvocation.getMethod();
        AutoLog autoLog = AnnotationUtils.getAnnotation(method, AutoLog.class);
        if (autoLog != null) {
            return autoLog;
        }

        //2. 类级别
        final Class<?> targetClass = methodInvocation.getThis().getClass();
        autoLog = targetClass.getAnnotation(AutoLog.class);
        if (autoLog != null) {
            return autoLog;
        }

        //3. 默认的注解信息
        return DefaultAutoLogGlobalConfig.class.getAnnotation(AutoLog.class);
    }

    @Override
    public Object invoke(MethodInvocation methodInvocation) throws Throwable {
        AutoLog autoLog = getAutoLogAnnotation(methodInvocation);

        // 如果存在，则执行切面的逻辑
        AutoLogAdviceContext logContext = AutoLogAdviceContext.newInstance();
        logContext.methodInvocation(methodInvocation)
                .method(methodInvocation.getMethod())
                .autoLog(autoLog)
                .params(methodInvocation.getArguments())
        ;

        return AutoLogBs.newInstance()
                .context(logContext)
                .execute();
    }

}
```

# 参考资料


* any list
{:toc}