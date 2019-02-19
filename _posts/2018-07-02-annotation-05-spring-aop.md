---
layout: post
title:  Annotation-05-Spring aop
date:  2018-07-02 21:19:54 +0800
categories: [Java]
tags: [java, annotation]
published: true
---

# Spring Aop + Annotation

Spring Aop 是一种经常被我们提及地代码增强功能，结合注解可以使得代码增强变得更加灵活。

# 实例

## maven jar 引入

```xml
<properties>
    <spring.version>4.2.6.RELEASE</spring.version>
    <aspectj.version>1.8.5</aspectj.version>
    <junit.version>4.12</junit.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context-support</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-aop</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-test</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <!--test-->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>${junit.version}</version>
    </dependency>
    <!-- AOP -->
    <dependency>
        <groupId>org.aspectj</groupId>
        <artifactId>aspectjweaver</artifactId>
        <version>${aspectj.version}</version>
    </dependency>
    <dependency>
        <groupId>org.aspectj</groupId>
        <artifactId>aspectjrt</artifactId>
        <version>${aspectj.version}</version>
    </dependency>
</dependencies>
```

## 注解的定义 & 使用

- Log.java

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Log {

    /**
     * 输出入参
     * @return 是否
     */
    boolean logParam() default true;

    /**
     * 输出出参
     * @return 是否
     */
    boolean logReturn() default true;

    /**
     * 输出时间
     * @return 是否
     */
    boolean logTime() default true;

}
```

- UserService.java

使用注解

```java
import com.ryo.jdk.annotation.spring.annotation.Log;

import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Log(logParam = true, logReturn = true, logTime = true)
    public int queryCount(String username) {
        System.out.println("call query count...");
        return 0;
    }

    public void save(String username, int age) {
        System.out.println("call save...");
    }

}
```

- LogInterceptor.java

基于 Spring 的 AOP 代码增强

```java
import com.ryo.jdk.annotation.spring.annotation.Log;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

@Aspect
@Component
public class LogInterceptor {

    /**
     * 开始时间
     */
    private long beginTime;
    /**
     * 结束时间
     */
    private long endTime;

    /**
     * 拦截service 下所有的 @Log 方法
     */
    @Pointcut("execution(public * com.ryo.jdk.annotation.spring.service..*(..))")
    public void pointCut() {
        //just the point cut
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
        beginTime = System.currentTimeMillis();

        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();

        Log log = method.getAnnotation(Log.class);
        if(log == null) {
            return point.proceed();
        }

        //1. 入参
        if(log.logParam()) {
            System.out.println("[PARAM]: " + Arrays.toString(point.getArgs()));
        }
        Object result = point.proceed();
        //2. 出参
        if(log.logReturn()) {
            System.out.println("[RETURN]: " + result);
        }
        //3. 消耗时间
        if(log.logTime()) {
            endTime = System.currentTimeMillis();
            System.out.println("[COST]: " + (endTime-beginTime));
        }
        return result;
    }
}
```

- applicationContext-aop.xml

spring 关于 aop 的配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">

    <context:component-scan base-package="com.ryo.jdk.annotation.spring"/>

    <!--启动代理-->
    <!--aspect annotation-->
    <aop:aspectj-autoproxy/>

</beans>
```

## 测试 & 结果

- UserServiceTest.java

测试代码

```java
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {"classpath:applicationContext-aop.xml"})
public class UserServiceTest {


    @Autowired
    private UserService userService;

    @Test
    public void queryCountTest() {
        userService.queryCount("ryo");
    }

    @Test
    public void saveTest() {
        userService.save("ryo", 12);
    }

}
```

- 测试结果

queryCountTest 测试结果

```
[PARAM]: [ryo]
call query count...
[RETURN]: 0
[COST]: 27
```

saveTest 测试结果

```
call save...
```

# 代码地址

> [annotation 定义与解析](https://github.com/houbb/jdk/tree/master/jdk-annotation/src/main/java/com/ryo/jdk/annotation/spring)


# spring aop 存在的问题

## 问题

在类C中，方法A调用方法B，

B方法被AOP拦截。（可能是方法B上在另外的@Aspect切面定义上了切点/也可能是加了 `@Transactional` 事务注解，底层原理也是AOP实现），最终A-》B ，B并不会触发AOP。

比如：

```java
@Service
public class ClassA{
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void methodA(){
    }
    /**
     * 这里调用methodA() 的事务将会失效
     */
    public void methodB(){
        this.methodA();
    }
}
```

## 原因

spring 在 aop 处理的时候，当执行一个有注解的方法时，调用其他的方法只是普通的方法。

所以针对这个问题，有下面的几种解决方式。

## 解决方案

### 方法一：自注入

直接在当前类@Autowire 或者@Resource 注入自己,然后用注入的bean 调用方法

### 方案二：使用增强的对象

直接使用 spring 相关的工具，获取增强后的对象。

```java
@Service
public class ClassA extends BaseClass{
    @Transactional(propagation = Propagation.REQUIRES_NEW)
　　@Override
    public void methodA(){
    }
    /**
     * 这里调用methodA() 的事务将会失效
     */
　　
    public void methodB(){
　　　　　　//使用getBean
　　((BaseClass)SpringUtil.getBean("classA")).methodA();
    }
}
```

### 方式三：获取增强代理 

分成两步，设置暴露代理。使用暴露的代理去实现。

#### 1. 设置暴露代理

- SpringBoot

注解开启cglib代理,开启 exposeProxy = true,暴露代理对象 (否则AopContext.currentProxy()) 会抛出异常

```java
@EnableAspectJAutoProxy(exposeProxy = true)
public class Application{
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

配置方式:配置方式下,我用的是SpringBoot 1.5.4没有找到exposeProxy的选项,所以建议使用注解式.

- 传统Spring配置文件

```xml
<aop:aspectj-autoproxy expose-proxy="true"/>
```

#### 2. (需要保证Spring对这个bean创建了代理对象,基本上涉及到Aop的方法的类,都会创建代理对象) 可以用以下代码判断

```java
/**
 * Created by laizhenwei on 19:37 2017-10-14
 */
@Service("classImplProxy")
@Scope(proxyMode = ScopedProxyMode.INTERFACES)
public class ClassImplProxy implements IClass {

    @Override
    @Transactional
    public void sysout() {
    }

    //是否代理对象
    @Override
    public boolean isAopProxy() {
        return AopUtils.isAopProxy(AopContext.currentProxy());
    }

    //是否cglib 代理对象
    @Override
    public boolean isCglibProxy() {
        return AopUtils.isCglibProxy(AopContext.currentProxy());
    }

    //是否jdk动态代理
    @Override
    public boolean isJdkDynamicProxy() {
        return AopUtils.isJdkDynamicProxy(AopContext.currentProxy());
    }
}
```

获取代理对象 

```java
@Service
public class ClassA{
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void methodA(){
    }
    public void methodB(){
        //手动获取此对象Spring的代理类
        ((ClassA)AopContext.currentProxy()).methodA();
    }
}
```

# 参考资料

[spring aop无法拦截类内部的方法调用](https://www.cnblogs.com/dennyzhangdd/p/9242148.html)

* any list
{:toc}