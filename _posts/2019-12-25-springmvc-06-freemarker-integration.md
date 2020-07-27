---
layout: post
title: Spring Web MVC-06-springmvc 整合 freemarker 记录
date:  2019-12-25 16:57:12 +0800
categories: [Spring]
tags: [spring mvc]
published: false
---

# 序言

freemaker 作为一款非常优秀的 java 模板框架，和 spring-mvc 整合使用也是非常的方便。

# 快速开始

## 整体结构

```xml
│  pom.xml
│
└─src
    ├─main
    │  ├─java
    │  │  └─com
    │  │      └─github
    │  │          └─houbb
    │  │              └─springmvc
    │  │                  └─freemarker
    │  │                      └─controller
    │  │                              IndexController.java
    │  │
    │  ├─resources
    │  │      springmvc-freemarker.xml
    │  │
    │  └─webapp
    │      └─WEB-INF
    │          │  web.xml
    │          │
    │          └─view
    │                  index.ftl
```

## maven 引入

- pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>springmvc</artifactId>
        <groupId>com.ryo</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <packaging>war</packaging>
    <artifactId>springmvc-freemarker</artifactId>

    <properties>
        <spring.version>4.1.6.RELEASE</spring.version>
        <servlet.version>3.1.0</servlet.version>
        <freemarker.version>2.3.23</freemarker.version>
    </properties>

    <dependencies>
        <!-- Spring Begin -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context-support</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <!-- Spring End -->

        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>${servlet.version}</version>
            <scope>provided</scope>
        </dependency>

        <dependency>
            <groupId>org.freemarker</groupId>
            <artifactId>freemarker</artifactId>
            <version>${freemarker.version}</version>
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
        </plugins>
    </build>

</project>
```

## 配置文件

- springmvc-freemarker.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.1.xsd
        http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-4.1.xsd">
    <!-- 包扫描 -->
    <context:component-scan base-package="com.github.houbb.springmvc.freemarker"/>
    <!-- 开启spring注解支持 -->
    <mvc:annotation-driven/>

    <!-- 定义BeanNameViewResolver 可以用来提供自定义view输出，如pdf等，但是一般用类似千牛的DNS静态服务来代替
         此处与freemarker无关，仅仅是介绍freemarker在多视图解析器下order的顺序
    -->
    <bean class="org.springframework.web.servlet.view.BeanNameViewResolver">
        <property name="order" value="1" />
    </bean>

    <!-- 注册freemarker配置类 -->
    <bean id="freeMarkerConfigurer" class="org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer">
        <!-- ftl模版文件路径  -->
        <property name="templateLoaderPath" value="/WEB-INF/view/"/>

        <!-- 页面编码 -->
        <property name="defaultEncoding" value="utf-8" />
        <property name="freemarkerSettings">
            <props>
                <!-- 模版缓存刷新时间，不写单位默认为秒 -->
                <prop key="template_update_delay">0</prop>
                <!-- 时区 和 时间格式化 -->
                <prop key="locale">zh_CN</prop>
                <prop key="datetime_format">yyyy-MM-dd</prop>
                <prop key="date_format">yyyy-MM-dd</prop>
                <!-- 数字使用.来分隔 -->
                <prop key="number_format">#.##</prop>
            </props>
        </property>
    </bean>
    <!-- 注册freemarker视图解析器 -->
    <bean id="freeMarkerViewResolver"
          class="org.springframework.web.servlet.view.freemarker.FreeMarkerViewResolver">
        <!-- 视图解析顺序，排在其他视图解析器之后 数字越大优先级越低 -->
        <property name="order" value="2" />
        <!-- 开启模版缓存 -->
        <property name="cache" value="true" />
        <!-- 上面已经配了，这里就不用配啦 -->
        <property name="prefix" value="" />
        <!-- 配置文件后缀 -->
        <property name="suffix" value=".ftl" />
        <property name="contentType" value="text/html;charset=UTF-8" />
        <!-- 是否允许session属性覆盖模型数据,默认false -->
        <property name="allowSessionOverride" value="false" />
        <!-- 是否允许request属性覆盖模型数据,默认false -->
        <property name="allowRequestOverride" value="false" />
        <!-- 开启spring提供的宏帮助(macro) -->
        <property name="exposeSpringMacroHelpers" value="true" />
        <!-- 添加request attributes属性到ModelAndView中 -->
        <property name="exposeRequestAttributes" value="true" />
        <!-- 添加session attributes属性到ModelAndView中 -->
        <property name="exposeSessionAttributes" value="true" />
    </bean>
</beans>
```

- web.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://java.sun.com/xml/ns/javaee"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
         id="WebApp_ID" version="3.0">

    <servlet>
        <servlet-name>spring-mvc</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:springmvc-freemarker.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>spring-mvc</servlet-name>
        <url-pattern>/*</url-pattern>
    </servlet-mapping>
</web-app>
```

## 页面

- login.ftl

```ftl
<html>
<body>
<h2>Hello ${name}!</h2>
</body>
</html>
```

## 后端

- IndexController.java

```java
package com.github.houbb.springmvc.freemarker.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Controller
public class IndexController {

    @RequestMapping(value = "/")
    public String index(HttpServletRequest request, ModelMap modelMap) throws Exception {
        request.setAttribute("name","叶止水");
        return "index";
    }

}
```

## 启动

启动代码，直接访问 [http://localhost:8080/](http://localhost:8080/)

页面内容如下：

```
Hello 叶止水!
```

# 参考资料

[SpringMVC 整合 Freemarker 详解](https://blog.csdn.net/jk418756/article/details/90729080)

* any list
{:toc}