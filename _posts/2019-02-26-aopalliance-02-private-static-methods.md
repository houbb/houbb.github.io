---
layout: post
title: Aopalliance-02-通过 aspect 对 private 和 static 方法进行增强
date:  2019-2-26 09:48:47 +0800
categories: [Java]
tags: [java, aop, sh]
published: true
---

# 背景

spring aop 平时的应用范围非常广泛，但是对于 private 和 static 的支持并不友好。

因为本质原理是通过 CGLIB 实现一个继承子类。

# Spring AOP vs AspectJ

Spring AOP是基于Spring IoC实现的，它解决大部分常见的需求，但它并不是一个完整的AOP解决方案。

对于非Spring容器管理的对象，它更没有办法了。而AspectJ旨在提供完整的AOP方案，因此也会更复杂。

## 2.1 织入方式

两者织入方式有极大的不同，这也是它们的本质区别，它们实现代理的方式不同。

AspectJ是在运行前织入的，分为三类：

- 编译时织入

- 编译后织入

- 加载时织入

因此需要AspectJ编译器（ajc）的支持。

而Spring AOP是运行时织入的，主要使用了两种技术：JDK动态代理和CGLIB代理。对于接口使用JDK Proxy，而继承的使用CGLIB。


## 2.2 Joinpoints

因为织入方式的区别，两者所支持的Joinpoint也是不同的。

像final的方法和静态方法，无法通过动态代理来改变，所以Spring AOP无法支持。但AspectJ是直接在运行前织入实际的代码，所以功能会强大很多。

## 2.3 性能

编译织入会比较运行时织入快很多，Spring AOP是使用代理模式在运行时才创建对应的代理类，效率没有AspectJ高。

# Aspectj 入门例子

## maven 引入

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>springboot-aspectj-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <!--spring-boot-->
        <spring-boot.version>1.3.5.RELEASE</spring-boot.version>
        <aspectj.version>1.9.7</aspectj.version>
    </properties>

    <dependencies>
        <!--spring-boot-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>${spring-boot.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <version>${spring-boot.version}</version>
        </dependency>

        <!--aspectj-->
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

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
            </plugin>

            <!--aspectj-->
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>aspectj-maven-plugin</artifactId>
                <version>1.14.0</version>
                <configuration>
                    <complianceLevel>1.8</complianceLevel>
                    <source>1.8</source>
                    <target>1.8</target>
                    <proc>none</proc>
                    <showWeaveInfo>true</showWeaveInfo>
                    <forceAjcCompile>true</forceAjcCompile>
                    <sources/>
                    <weaveDirectories>
                        <weaveDirectory>${project.build.directory}/classes</weaveDirectory>
                    </weaveDirectories>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>

        </plugins>
    </build>

</project>
```

## 测试 controller

```java
package org.example.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * localhost:8080/test/hello
 */
@RestController
@RequestMapping("/test")
public class TestController {

    @RequestMapping("/hello")
    public String hello() {
        System.out.println("---hello start---");
        privateRest();
        staticTest();
        System.out.println("---hello end---");
        return "Hello";
    }

    private void privateRest() {
        System.out.println("---privateRest start---");
        System.out.println("---privateRest start---");
    }

    public static void staticTest() {
        System.out.println("---staticTest start---");
        System.out.println("---staticTest start---");
    }

}
```

## 切面 aspect

```java
package org.example.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.stereotype.Component;

@Aspect
@Component
//@EnableAspectJAutoProxy
public class ControllerAspect {

    @Pointcut("execution(* org.example.controller..*.*(..))")
    private void testControllerPointcut() {

    }

    @Around("testControllerPointcut()")
    public Object doAround(ProceedingJoinPoint joinPoint) throws Throwable {
        System.out.println("------------------------- around start ------------------------ ");
        long start = System.nanoTime();
        Object obj = joinPoint.proceed();
        long end = System.nanoTime();
        System.out.println("------------------------- cost " + (end-start) + "ns");
        System.out.println("------------------------- around end ------------------------ ");

        return obj;
    }

}
```

## 测试

1） 首先进行编译

```
mvn clean package
```

此时，生成的 class 文件会进行增强。

查看 class 文件，效果如下：

```java
//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package org.example.controller;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.runtime.reflect.Factory;
import org.example.aspect.ControllerAspect;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/test"})
public class TestController {
    public TestController() {
    }

    @RequestMapping({"/hello"})
    public String hello() {
        JoinPoint var1 = Factory.makeJP(ajc$tjp_0, this, this);
        return (String)hello_aroundBody1$advice(this, var1, ControllerAspect.aspectOf(), (ProceedingJoinPoint)var1);
    }

    private void privateRest() {
        JoinPoint var1 = Factory.makeJP(ajc$tjp_1, this, this);
        privateRest_aroundBody3$advice(this, var1, ControllerAspect.aspectOf(), (ProceedingJoinPoint)var1);
    }

    public static void staticTest() {
        JoinPoint var0 = Factory.makeJP(ajc$tjp_2, (Object)null, (Object)null);
        staticTest_aroundBody5$advice(var0, ControllerAspect.aspectOf(), (ProceedingJoinPoint)var0);
    }

    static {
        ajc$preClinit();
    }
}
```

2）页面访问 

http://localhost:8080/test/hello

对应的日志效果：

```
------------------------- around start ------------------------ 
---hello start---
------------------------- around start ------------------------ 
---privateRest start---
---privateRest start---
------------------------- cost 49000ns
------------------------- around end ------------------------ 
------------------------- around start ------------------------ 
---staticTest start---
---staticTest start---
------------------------- cost 34000ns
------------------------- around end ------------------------ 
---hello end---
------------------------- cost 334600ns
------------------------- around end ------------------------
```

# 参考资料

[简易版的Spring框架之AOP简单实现(对我来说不简单啊)](https://juejin.cn/post/6844903568705585160)

[spring-AOP（二）实现原理之AspectJ注解方式](https://juejin.cn/post/6844903721101426701)

[Spring5参考指南:AspectJ注解](https://juejin.cn/post/6844904047426666504)

[Spring AOP之@AspectJ注解](https://juejin.cn/post/7035648108486721544)

[Spring AOP与AspectJ的对比及应用](https://juejin.cn/post/7197366974371364919)

* any list
{:toc}