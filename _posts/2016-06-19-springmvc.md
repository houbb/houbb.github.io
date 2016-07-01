---
layout: post
title: Spring Web MVC
date:  2016-06-19 16:57:12 +0800
categories: [Spring]
tags: [spring mvc]
published: true
---

* any list
{:toc}

# Web MVC

The Spring Web model-view-controller (MVC) framework is designed around a ```DispatcherServlet``` that dispatches requests to handlers,
with configurable handler mappings, view resolution, locale, time zone and theme resolution as well as support for uploading files.
The default handler is based on the ```@Controller``` and ```@RequestMapping``` annotations, offering a wide range of flexible handling methods.


> [Web MVC](http://docs.spring.io/spring/docs/current/spring-framework-reference/htmlsingle/#mvc)


![mvc]({{ site.url }}/static/app/img/2016-06-19-spring-mvc.png)


# Hello World

The src files tree.

```
|____main
| |____java
| | |____com
| | | |____ryo
| | | | |____controller
| | | | | |____HelloController.java
| |____resources
| | |____app-mvc.xml
| | |____app.xml
| | |____log4j2.xml
| |____webapp
| | |____WEB-INF
| | | |____web.xml
```

- pom.xml


```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ryo</groupId>
    <artifactId>springmvc</artifactId>
    <version>1.0.0</version>
    <packaging>war</packaging>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <plugin.tomcat.version>2.2</plugin.tomcat.version>
        <maven-surefire-plugin.version>2.18.1</maven-surefire-plugin.version>
        <maven-compiler-plugin.version>3.3</maven-compiler-plugin.version>

        <!-- Spring -->
        <spring.version>4.2.6.RELEASE</spring.version>
    </properties>

    <dependencies>
        <!--spring mvc-->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>${spring.version}</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-web</artifactId>
            <version>4.2.6.RELEASE</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>4.2.6.RELEASE</version>
        </dependency>

    </dependencies>


    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.tomcat.maven</groupId>
                <artifactId>tomcat7-maven-plugin</artifactId>
                <version>${plugin.tomcat.version}</version>
                <configuration>
                    <port>8080</port>
                    <path>/</path>
                    <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>${maven-surefire-plugin.version}</version>
                <configuration>
                    <skipTests>true</skipTests>
                    <testFailureIgnore>true</testFailureIgnore>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>${maven-compiler-plugin.version}</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- web.xml

```xml
<web-app xmlns="http://java.sun.com/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="
            http://java.sun.com/xml/ns/javaee
            http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
         version="3.0">

    <!--装入spring配置文件-->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:app.xml</param-value>
    </context-param>

    <!-- 以Listener方式启动spring -->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <!-- 前端控制器的配置 -->
    <servlet>
        <servlet-name>springmvc</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:app-mvc.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>springmvc</servlet-name>
        <url-pattern>/*</url-pattern>
    </servlet-mapping>
</web-app>
```

- app.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <import resource="app-mvc.xml"/>

</beans>
```

- app-mvc.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd
        http://www.springframework.org/schema/mvc
        http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <!--扫描@Controller注解-->
    <context:component-scan base-package="com.ryo.controller">
        <context:include-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
        <context:include-filter type="annotation" expression="org.springframework.web.bind.annotation.ControllerAdvice"/>
    </context:component-scan>

    <mvc:annotation-driven/>

</beans>
```

- HelloController.java

```java
package com.ryo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by houbinbin on 16/6/19.
 */
@Controller
@RequestMapping("hello")
public class HelloController {

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public String hello() {
        return "hello world";
    }
}
```

- visit

```
http://localhost:8080/hello
```

- result

```
hello world
```

# Controller log

[web](http://logging.apache.org/log4j/2.x/manual/webapp.html)


- pom.xml

```xml
<!--log4j-->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-api</artifactId>
    <version>${log4j.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>${log4j.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-web</artifactId>
    <version>${log4j.version}</version>
</dependency>
```

- define controller call interceptor.

```java
package com.ryo.interceptor;

import com.alibaba.fastjson.JSON;
import com.ryo.constants.SessionKeys;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by houbinbin on 16/6/30.
 * - Controller 访问日志
 */
@Component
@Aspect
public class ControllerLogInterceptor {
    static Logger logger = LogManager.getLogger();

    private String requestPath = null; // 请求地址
    private String userName = null; // 用户名
    private Map<?, ?> inputParamMap = null; // 传入参数
    private Map<String, Object> outputParamMap = null; // 存放输出结果


    @Pointcut("execution(public * com.ryo.controller..*.*(..))")
    public void myPointcut() {
    }

    @Before("myPointcut()")
    public void start() {
    }

    @After("myPointcut()")
    public void end() {
        printLog();
    }

    @Around("myPointcut()")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        /**
         * 1.获取request信息
         * 2.根据request获取session
         * 3.从session中取出登录用户信息
         */
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();

        // 从session中获取用户信息
        userName = (String) request.getSession().getAttribute(SessionKeys.SESSION_USERNAME);

        // 获取输入参数
        inputParamMap = request.getParameterMap();

        // 获取请求地址
        requestPath = request.getRequestURI();

        // 执行完方法的返回值：调用proceed()方法，就会触发切入点方法执行
        outputParamMap = new HashMap<String, Object>();
        Object result = point.proceed();    // result的值就是被拦截方法的返回值
        outputParamMap.put("result", result);

        return result;
    }

    private void printLog() {
        logger.info("USER：" + userName
                + "  URL：" + requestPath + "\n"
                + "Param：" + JSON.toJSON(inputParamMap) + "\n" + "Result：" + JSON.toJSON(outputParamMap)+"\n");
    }
}
```
