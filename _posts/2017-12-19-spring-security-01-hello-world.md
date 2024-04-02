---
layout: post
title:  Spring Security-01-Hello World
date:  2017-12-19 22:29:09 +0800
categories: [Spring]
tags: [spring, spring-security, web-safe]
published: true
---


# Spring Security

大家好，我是老马。

web 安全一直是重中之重，今天我们一起来学习下 Spring Security 是如何使用的。

对于 web 安全的控制，以前接触使用过 [Shiro](https://houbb.github.io/2016/08/11/shiro)。

刚好最近在学习整理 Spring 相关的技术，就学习一下 [Spring Security](http://projects.spring.io/spring-security/)。

## 是什么？

Spring Security是一个框架，致力于为Java应用程序提供身份验证和授权。

像所有Spring项目一样，Spring Security的真正强大之处在于可以轻松扩展以满足自定义要求。

# Hello World

看了下官方的文档 [5.0.0.RELEASE doc](https://docs.spring.io/spring-security/site/docs/5.0.0.RELEASE/reference/htmlsingle/#samples)，
案例依赖于 gradle，一直以来使用的是 [maven](https://houbb.github.io/2016/10/22/maven)。

就直接按照 [Spring Security入门程序示例](http://www.yiibai.com/spring-security/spring-security-hello-world-example.html) 作为入门。


## 测试环境

```
$ java -version
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)

$ mvn -v
Apache Maven 3.3.9
```

## 项目结构

> [完整代码地址](https://github.com/houbb/spring-security/tree/master/spring-security-hello)，如有帮助不妨给个 Star。

```
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── ryo
    │   │           └── spring
    │   │               └── security
    │   │                   └── hello
    │   │                       └── controller
    │   │                           └── HelloWorldController.java
    │   ├── resources
    │   │   ├── application-mvc.xml
    │   │   ├── application-security.xml
    │   │   └── application.xml
    │   └── webapp
    │       └── WEB-INF
    │           ├── pages
    │           │   ├── admin.jsp
    │           │   └── hello.jsp
    │           └── web.xml
```

## 文件内容

- pom.xml


引入指定的 jar 和插件。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>spring-security</artifactId>
        <groupId>com.ryo</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>spring-security-hello</artifactId>
    <packaging>war</packaging>


    <dependencyManagement>

        <dependencies>

            <!--统一制定依赖 jar 的版本-->
            <dependency>
                <groupId>io.spring.platform</groupId>
                <artifactId>platform-bom</artifactId>
                <version>2.0.8.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

        </dependencies>
    </dependencyManagement>

    <dependencies>

        <!-- Spring dependencies -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
        </dependency>

        <!-- Spring Security -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-config</artifactId>
        </dependency>

        <!-- jstl for jsp page -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>jstl</artifactId>
        </dependency>

    </dependencies>


    <build>

        <plugins>
            <!--tomcat7 插件，用于运行项目-->
            <plugin>
               <groupId>org.apache.tomcat.maven</groupId>
               <artifactId>tomcat7-maven-plugin</artifactId>
               <version>2.2</version>
               <configuration>
                   <port>8080</port>
                   <path>/</path>
                   <uriEncoding>UTF-8</uriEncoding>
               </configuration>
            </plugin>
        </plugins>

    </build>

</project>
```

- admin.jsp & hello.jsp

两个 jsp 页面，内容如下：

```jsp
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@page session="true"%>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
<h1>标题: ${title}</h1>
<h1>消息 : ${message}</h1>

<c:if test="${pageContext.request.userPrincipal.name != null}">
    <h2>欢迎: ${pageContext.request.userPrincipal.name}
        | <a href="<c:url value="/j_spring_security_logout" />" > Logout</a></h2>
</c:if>
</body>
</html>
```

```jsp
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
</head>
<body>
<h1>标题：${title}</h1>
<h1>消息：${message}</h1>
</body>
</html>
```

- web.xml

用于指定 web 项目相关的配置，内容如下：

```xml
<web-app id="WebApp_ID" version="2.4"
         xmlns="http://java.sun.com/xml/ns/j2ee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee
	http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd">

    <display-name>Archetype Created Web Application</display-name>

    <!--装入spring配置文件-->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:application.xml</param-value>
    </context-param>

    <!-- 以Listener方式启动spring -->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <!--过滤字符集-->
    <filter>
        <filter-name>encodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>UTF-8</param-value>
        </init-param>
        <init-param>
            <param-name>forceEncoding</param-name>
            <param-value>true</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>encodingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

    <!--spring mvc-->
    <servlet>
        <servlet-name>springmvc</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:application-mvc.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>springmvc</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>


    <!-- Spring Security -->
    <filter>
        <filter-name>springSecurityFilterChain</filter-name>
        <filter-class>org.springframework.web.filter.DelegatingFilterProxy
        </filter-class>
    </filter>

    <filter-mapping>
        <filter-name>springSecurityFilterChain</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

</web-app>
```

- application.xml

spring 配置文件，引入了 `application-mvc.xml` 和 `application-security.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <import resource="application-mvc.xml"/>
    <import resource="application-security.xml"/>

</beans>
```

- application-mvc.xml

spring mvc 的配置：

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
    <context:component-scan base-package="com.ryo.spring.security.hello.controller">
        <context:include-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
        <context:include-filter type="annotation" expression="org.springframework.web.bind.annotation.ControllerAdvice"/>
    </context:component-scan>


    <mvc:annotation-driven/>

    <!-- ViewResolver -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="viewClass" value="org.springframework.web.servlet.view.JstlView"/>
        <property name="prefix" value="/WEB-INF/pages/"/>
        <property name="suffix" value=".jsp"/>
    </bean>

</beans>
```

- application-security.xml

spring security 的配置：

```xml
<beans:beans xmlns="http://www.springframework.org/schema/security"
             xmlns:beans="http://www.springframework.org/schema/beans"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://www.springframework.org/schema/beans
	http://www.springframework.org/schema/beans/spring-beans.xsd
	http://www.springframework.org/schema/security
	http://www.springframework.org/schema/security/spring-security.xsd">

    <http auto-config="true">
        <intercept-url pattern="/admin**" access="hasRole('ROLE_USER')" />
    </http>

    <authentication-manager>
        <authentication-provider>
            <user-service>
                <user name="ryo" password="123456" authorities="ROLE_USER" />
            </user-service>
        </authentication-provider>
    </authentication-manager>

</beans:beans>
```

- HelloWorldController.java
 
简单的页面控制类：

```java
package com.ryo.spring.security.hello.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("/")
public class HelloWorldController {

    /**
     * 返回 hello 视图
     * @return
     */
    @RequestMapping(value = { "/", "/welcome**" }, method = RequestMethod.GET)
    public ModelAndView welcomePage() {
        ModelAndView model = new ModelAndView();
        model.addObject("title", "Spring Security Hello World");
        model.addObject("message", "This is welcome page!");
        model.setViewName("hello");
        return model;
    }

    /**
     * 返回 admin 视图
     * @return
     */
    @RequestMapping(value = "/admin**", method = RequestMethod.GET)
    public ModelAndView adminPage() {
        ModelAndView model = new ModelAndView();
        model.addObject("title", "Spring Security Hello World");
        model.addObject("message", "This is protected page!");
        model.setViewName("admin");
        return model;
    }
}
```

## 运行访问

直接运行 插件 `tomcat7:run` 启动服务，或者手动部署到 tomcat，此处不再赘述。

启动日志如下：

```
[INFO] Scanning for projects...
...
[INFO] Running war on http://localhost:8080/
...
[INFO] Mapped "{[/admin**],methods=[GET]}" onto public org.springframework.web.servlet.ModelAndView com.ryo.spring.security.hello.controller.HelloWorldController.adminPage()
[INFO] Mapped "{[/ || /welcome**],methods=[GET]}" onto public org.springframework.web.servlet.ModelAndView com.ryo.spring.security.hello.controller.HelloWorldController.welcomePage()
...
信息: Starting ProtocolHandler ["http-bio-8080"]
```

- 首页


直接浏览器访问 [http://localhost:8080/](http://localhost:8080/)，首页内容如下：

```
标题：Spring Security Hello World
消息：This is welcome page!
```

- admin

如果我们尝试访问 [http://localhost:8080/admin](http://localhost:8080/admin)，会进入登录页面。

用户名密码和我们 `application-security.xml` 文件中配置一致。

一、输入错误信息

页面内容如下：

```
Your login attempt was not successful, try again.

Reason: Bad credentials
```

二、输入正确信息

```
标题: Spring Security Hello World
消息 : This is protected page!
欢迎: ryo | Logout
```

# 小结

这次的 spring Security 入门案例就到这里，下一节我们将来看一下另一个权限框架 shiro。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

* any list
{:toc}