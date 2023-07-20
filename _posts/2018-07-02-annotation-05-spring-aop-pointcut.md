---
layout: post
title:  Annotation-05-Spring aop pointcut 如何动态设置？
date:  2018-07-02 21:19:54 +0800
categories: [Java]
tags: [java, annotation]
published: true
---

# 需求

因为想写一个通用的 log 日志拦截组件，所以写了一个统一 aspect 切面。

## aspect 代码

```java
package com.github.houbb.auto.log.spring.aop;

import com.github.houbb.aop.spring.util.SpringAopUtil;
import com.github.houbb.auto.log.annotation.AutoLog;
import com.github.houbb.auto.log.api.IAutoLogContext;
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
public class AutoLogAop {

    /**
     *
     * 切面方法：
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
        IAutoLogContext logContext = SpringAopAutoLogContext.newInstance()
                .method(method)
                .autoLog(autoLog)
                .point(point);

        return AutoLogBs.newInstance()
                .context(logContext)
                .execute();
    }

}
```

## pointcut 的不足

一开始把扫描的范围配置的很大，但是这样存在一定的性能问题。

于是改成了基于注解的方式，指定了注解的类和方法才会拦截。

但是这依然是一个问题，这样用户使用的时候会依然觉得不够遍历。

那么，如何可以让用户动态指定呢？

## 注解的属性必须为常量

第一个想法就是让 pointcut 的切面信息直接动态读取配置。

但是发现注解的信息必须是一个常量，这个要如何动态修改呢？

# pointcut 基础知识

## 格式

```
execution(modifiers-pattern? ret-type-pattern declaring-type-pattern? name-pattern(param-pattern)throws-pattern?) 

修饰符匹配（modifier-pattern?）
返回值匹配（ret-type-pattern）可以为*表示任何返回值,全路径的类名等
类路径匹配（declaring-type-pattern?）
方法名匹配（name-pattern）可以指定方法名 或者 *代表所有, set* 代表以set开头的所有方法
参数匹配（(param-pattern)）可以指定具体的参数类型，多个参数间用“,”隔开，各个参数也可以用“*”来表示匹配任意类型的参数，如(String)表示匹配一个String参数的方法；(*,String) 表示匹配有两个参数的方法，第一个参数可以是任意类型，而第二个参数是String类型；可以用(..)表示零个或多个任意参数
异常类型匹配（throws-pattern?）
其中后面跟着“?”的是可选项

1）execution(* *(..))  
//表示匹配所有方法  
2）execution(public * com. savage.service.UserService.*(..))  
//表示匹配com.savage.server.UserService中所有的公有方法  
3）execution(* com.savage.server..*.*(..))  
//表示匹配com.savage.server包及其子包下的所有方法 
```

# 实现方式 1

如何将aop中的pointcut值从配置文件中读取

首先，我们可以先创建一个类来实现 MethodInterceptor 类 ：

```java
class LogAdvice implements MethodInterceptor {

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        System.out.println("Before method");//这里做你的before操作
        Object result = invocation.proceed();
        System.out.println("After method");//这里做你的after操作
        return result;
    }
}
```

然后创建一个Configuration类，创建Bean：

```java
@Configuration
public class ConfigurableAdvisorConfig {

    @Value("${pointcut.property}")
    private String pointcut;

    @Bean
    public AspectJExpressionPointcutAdvisor configurabledvisor() {
        AspectJExpressionPointcutAdvisor advisor = new AspectJExpressionPointcutAdvisor();
        advisor.setExpression(pointcut);
        advisor.setAdvice(new LogAdvice ());
        return advisor;
    }
}
```

这里面的 pointcut.property值来自于你的application.properties 等配置文件。

这样，各项目只须要引用该jar，然后在配置文件中指定要拦截的pointcut就可以了。

# spring 中的 pointcut-实现方式2

```java
//Pointcut表示式(可以使用&& || ! 这三个运算)
@Pointcut("execution(* com.github.houbb.*(..))")
//Point签名
private void log(){} 
```

## 实现动态 pointcut 的思路

- 关于SpringAop

AspectJ方式织入的核心，是一个 BeanPostProcess（会扫描所有的Pointcut与遍历所有Bean,并对需要的Bean进行织入-自动代理，当对象实例化的时候，为其生成代理对象并返回）

- 思路

在Aop的BeanPostProcess执行之前( springApplication.run之前),使用javassist修改目标Aop类字节码，动态设置@Pointcut,设置 value为我们自己动态查询到的值。

- 其他

由于Spring boot的类加载机制，运行时javassist会扫描不到包，要通过insertClassPath添加扫描路径

修改 `@Pointcut` 的切点值后，通过toClass覆盖原有类，需要通过类加载器重新加载。

## 实现

### springboot

```java
@SpringBootApplication
public class UidServerApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        AspectPoincutScan();
        SpringApplication springApplication = new SpringApplication(UidServerApplication.class);
        springApplication.addInitializers(new UidApplicationContextInitializer());
        springApplication.run(args);
    }

    @Override
    protected SpringApplicationBuilder configure(
            SpringApplicationBuilder builder) {
        AspectPoincutScan();
        return builder.sources(UidServerApplication.class)
                .initializers(new UidApplicationContextInitializer())
                .listeners(new UidApplicationRefreshedListener())
                .listeners(new UidApplicationCloseListener());
    }


    private static void AspectPoincutScan() {
        try {
            ClassPool pool = ClassPool.getDefault();
            // 添加包的扫描路径
            ClassClassPath classPath = new ClassClassPath(UidServerApplication.class);
            pool.insertClassPath(classPath);
            //获取要修改的Class
            CtClass ct = pool.get("com.github.houbb.auto.log.spring.aop.AutoLogAop");
            CtMethod[] cms = ct.getDeclaredMethods();
            for (CtMethod cm : cms) {
                //找到@pointcut 注解的方法
                if (cm.getName().equals("pointcut")) {

                    MethodInfo methodInfo = cm.getMethodInfo();
                    ConstPool cPool = methodInfo.getConstPool();

                    AnnotationsAttribute attribute = new AnnotationsAttribute(cPool, AnnotationsAttribute.visibleTag);
                    //获取@pointcut 注解，修改其value值
                    Annotation annotation = new Annotation("org.aspectj.lang.annotation.Pointcut", cPool);
                    annotation.addMemberValue("value", new StringMemberValue("execution(xxxx", cPool));
                    attribute.setAnnotation(annotation);
                    methodInfo.addAttribute(attribute);

                    //覆盖原有类
                    ct.toClass();
                    //使用类加载器重新加载Aop类
                    pool.getClassLoader().loadClass("com.github.houbb.auto.log.spring.aop.AutoLogAop");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
```

### aop

编程式AOP实现动态PointCut

PonitCut

```java
public static Pointcut getAdapterServicePointcut(){
        AspectJExpressionPointcut adapterPointcut = new AspectJExpressionPointcut();
        //从配置文件中获取PointCut表达式
        adapterPointcut.setExpression(MonitorPropertyConfig.getPoinitcutAdapter());
        return adapterPointcut;}
        
//扩展Spring中AbstractBeanFactoryPointcutAdvisor

public class AdapterServiceAdvisor extends AbstractBeanFactoryPointcutAdvisor {

    @Override
    public Pointcut getPointcut() {
        return getAdapterServicePointcut();
    }

}
```

- Advice

```java
public class AdapterServiceMonitorInterceptor implements MethodInterceptor {

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
       //做一些操作...
    }
}
```

- 配置Advisor Bean

```java
@Configuration
public class MonitorProxyConfiguration {

    @Bean(name = "adapterServiceAdvisor")
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    public AdapterServiceAdvisor adapterServiceAdvisor() {
        AdapterServiceAdvisor advisor = new AdapterServiceAdvisor();
        advisor.setAdviceBeanName("adapterServiceAdvice");
        advisor.setAdvice(new AdapterServiceMonitorInterceptor());
        advisor.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return advisor;
    }
}
```

# 参考资料

[Aspect动态Pointcut实现方案](https://chinalhr.github.io/post/aspect-dynamic/)

[实用：如何将aop中的pointcut值从配置文件中读取](https://cloud.tencent.com/developer/article/1550977)

[编程式动态AOP实践](https://juejin.cn/post/6844904102158139400)

[Spring AOP中定义切点PointCut详解](https://blog.csdn.net/zzhongcy/article/details/102484741)

* any list
{:toc}