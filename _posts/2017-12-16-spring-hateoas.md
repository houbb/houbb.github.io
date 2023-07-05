---
layout: post
title:  Spring HATEOAS
date:  2017-12-16 12:06:57 +0800
categories: [Spring]
tags: [spring]
published: true
---

# Spring HATEOAS

[Spring HATEOAS](https://projects.spring.io/spring-hateoas/) provides some APIs to ease creating REST representations that follow the 

[HATEOAS](https://en.wikipedia.org/wiki/HATEOAS) principle when working with Spring and especially Spring MVC. 

The core problem it tries to address is link creation and representation assembly.

> [HATEOAS 0.23.0.RELEASE](https://docs.spring.io/spring-hateoas/docs/0.23.0.RELEASE/reference/html/)

> [Spring REST实践之HATEOAS](https://www.cnblogs.com/coderland/p/5902997.html)

## HATEOAS

HATEOAS(The Hypermedia As The Engine Of Application Statue) 是 REST 架构的主要约束。

`Hypermedia` 可以泛指一切资源(文字，图片，音频，视频...)的链接。

## HAL

[HAL](https://tools.ietf.org/html/draft-kelly-json-hal-08)(The Hypertext Application Language) 是一种被 Spring 支持的 Json 超媒体类型，为 JSON 提供超链接语法。

- 普通 JSON 例子

```json
{
    "id" : 1,
    "body" : "My first blog post",
    "postdate" : "2015-05-30T21:41:12.650Z"
}
```

- HAL 例子

```json
{
    "id" : 1,
    "body" : "My first blog post",
    "postdate" : "2015-05-30T21:41:12.650Z",
    "_links" : {
        "self": { "href": "http://blog.example.com/posts/1" },
        "comments": { "href": "http://blog.example.com/posts/1/comments",
                      "totalcount" : 20 },
        "tags": { "href": "http://blog.example.com/posts/1/tags" }
    } 
}
```

# HATEOAS

HATEOAS（Hypertext as the Engine of Application State）是一种设计原则，通常在构建 RESTful API（Representational State Transfer）时使用。

它的目标是通过在 API 响应中包含超媒体链接，使客户端能够动态地发现和导航到可用的资源。

Spring HATEOAS 是 Spring Framework 的一个模块，它为构建遵循 HATEOAS 原则的 RESTful API 提供了支持。

它提供了一组工具和类，可以轻松地在 Spring 应用程序中创建和处理超媒体链接。

使用 Spring HATEOAS，您可以通过定义资源和链接关系，将超媒体链接嵌入到 API 的响应中。这些链接可以指向其他相关资源，以及支持在不了解 URI 结构的情况下导航和执行操作的链接。通过遵循这些链接，客户端应用程序能够动态地浏览和操作 API 中的资源。

Spring HATEOAS 提供了几个关键的概念和类来实现这一目标：

1. `Resource` 和 `ResourceSupport`：`Resource` 类表示一个具体的资源，它包含了该资源的数据以及与其相关的链接。`ResourceSupport` 是一个基类，可用于扩展 `Resource` 类，并添加额外的超媒体链接。

2. `Link`：`Link` 类表示一个超媒体链接，它包含链接的关系（rel）、链接的目标 URI（href）以及其他可选的属性。

3. `ControllerLinkBuilder`：这是一个用于创建链接的实用类。它允许您使用控制器方法引用来构建链接，而不是手动构建 URI。

通过使用 Spring HATEOAS，您可以在控制器方法中创建 `Resource` 对象，将数据和链接添加到该对象中，并将其作为响应返回给客户端。客户端可以使用返回的超媒体链接来导航到其他资源，执行相关操作或获取进一步的信息。

Spring HATEOAS 还提供了一些高级特性，例如链接的嵌入、超媒体链接的自动化创建以及链接关系的管理。

这些功能使得构建和维护遵循 HATEOAS 原则的 RESTful API 更加方便和灵活。

总而言之，Spring HATEOAS 是一个强大的工具，可以帮助您构建遵循 HATEOAS 原则的 RESTful API。

它提供了创建和处理超媒体链接的便利方法，使得客户端能够动态地发现和导航到可用的资源，从而提高了 API 的可扩展性和互操作性。

# Quick Start

提供一个简单的例子。

> [完整代码](https://github.com/houbb/springmvc/tree/master/springmvc-hateoas)

## 项目结构

```
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── ryo
    │   │           └── springmvc
    │   │               └── hateoas
    │   │                   ├── controller
    │   │                   │   └── HateoasController.java
    │   │                   ├── model
    │   │                   │   └── User.java
    │   │                   └── service
    │   │                       ├── UserService.java
    │   │                       └── UserServiceImpl.java
    │   ├── resources
    │   │   └── applicationContext.xml
    │   └── webapp
    │       ├── WEB-INF
    │       │   └── web.xml
    │       └── index.jsp
```

## 配置文件 

- pom.xml

引入需要的 jar

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

    <artifactId>springmvc-hateoas</artifactId>
    <packaging>war</packaging>


    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>io.spring.platform</groupId>
                <artifactId>platform-bom</artifactId>
                <version>1.1.2.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>


    <dependencies>
         <dependency>
            <groupId>org.springframework.hateoas</groupId>
            <artifactId>spring-hateoas</artifactId>
         </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
        </dependency>

        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>jstl</artifactId>
        </dependency>

        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-core</artifactId>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        
    </dependencies>


    <build>
        <plugins>
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

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>2.18.1</version>
                <configuration>
                    <skipTests>true</skipTests>
                    <testFailureIgnore>true</testFailureIgnore>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.3</version>
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

web 配置


```xml
<!DOCTYPE web-app PUBLIC
        "-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN"
        "http://java.sun.com/dtd/web-app_2_3.dtd" >
<web-app>
    <display-name>Archetype Created Web Application</display-name>

    <!--装入spring配置文件-->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:applicationContext.xml</param-value>
    </context-param>

    <!-- 以Listener方式启动spring -->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <servlet>
        <servlet-name>springmvc</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:applicationContext.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>springmvc</servlet-name>
        <url-pattern>/*</url-pattern>
    </servlet-mapping>
</web-app>

```

- applicationContext.xml

spring 配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd">


    <!--扫描 @Service 注解-->
    <context:component-scan base-package="com.ryo.springmvc.hateoas.service">
        <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
        <context:exclude-filter type="annotation" expression="org.springframework.web.bind.annotation.ControllerAdvice"/>
    </context:component-scan>

    <!--扫描@Controller注解-->
    <context:component-scan base-package="com.ryo.springmvc.hateoas.controller">
        <context:include-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
        <context:include-filter type="annotation" expression="org.springframework.web.bind.annotation.ControllerAdvice"/>
    </context:component-scan>


    <mvc:annotation-driven>
        <mvc:message-converters>
            <bean class="org.springframework.http.converter.StringHttpMessageConverter"/>
            <bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter"/>
        </mvc:message-converters>
    </mvc:annotation-driven>

    <!-- ViewResolver -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="viewClass" value="org.springframework.web.servlet.view.JstlView"/>
        <property name="prefix" value="/WEB-INF/jsp/"/>
        <property name="suffix" value=".jsp"/>
    </bean>

</beans>
```

## Java 文件

- User.java

定义简单的实体类

```java
import org.springframework.hateoas.ResourceSupport;

public class User extends ResourceSupport {

    private int userId;

    private String name;

    public User(int userId, String name) {
        this.userId = userId;
        this.name = name;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

- UserService.java & UserServiceImpl.java

```java
import com.ryo.springmvc.hateoas.model.User;
import java.util.List;

public interface UserService {

    /**
     * 查询所有用户
     * @return
     */
    List<User> queryAllUser();

    /**
     * 查询单个用户
     * @param userId 用户标识
     * @return
     */
    User queryOneUser(final int userId);

}
```

```java
import com.ryo.springmvc.hateoas.model.User;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Override
    public List<User> queryAllUser() {
        User one = new User(1, "one");
        User two = new User(2, "two");
        return Arrays.asList(one, two);
    }

    @Override
    public User queryOneUser(int userId) {
        return new User(userId, String.valueOf(userId));
    }
}
```


- HateoasController.java

```java
import com.ryo.springmvc.hateoas.model.User;
import com.ryo.springmvc.hateoas.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.methodOn;

@Controller
@RequestMapping("/hateoas")
public class HateoasController {

    @Autowired
    private UserService userService;


    @RequestMapping(value="/users", method= RequestMethod.GET)
    public ResponseEntity<Iterable<User>> getAllUser() {
        Iterable<User> allUsers = userService.queryAllUser();
        for(User user : allUsers) {
            updateUserResourceWithLinks(user);
        }
        return new ResponseEntity<>(allUsers, HttpStatus.OK);
    }

    @RequestMapping(value="/users/{userId}", method=RequestMethod.GET)
    public ResponseEntity<?> getOneUser(@PathVariable Integer userId) {
        User user = userService.queryOneUser(userId);
        updateUserResourceWithLinks(user);
        return new ResponseEntity<> (user, HttpStatus.OK);
    }

    /**
     * 可以额外指定其他资源路径
     * @param user
     */
    private void updateUserResourceWithLinks(User user) {
        user.add(linkTo(methodOn(HateoasController.class).getAllUser()).slash(user.getId()).withSelfRel());
//        user.addLink(linkTo(methodOn(VoteController.class).getAllVotes(poll.getPollId())).withRel("votes"));
//        user.addLink(linkTo(methodOn(ComputeResultController.class).computeResult(poll.getPollId())).withRel("compute-result"));
    }
}
```

## 运行

- mvn 

运行下面命令，引入相关 jar

```
$   mvn clean install
```

- tomcat

手动部署到 tomcat，或者运行 plugins/tomcat 直接运行


## 访问

浏览器打开 [http://localhost:8080](http://localhost:8080)


- 查询全部用户


```json
[
{"userId":1,"name":"one","links":[{"rel":"self","href":"http://localhost:8080/hateoas/users"}]},
{"userId":2,"name":"two","links":[{"rel":"self","href":"http://localhost:8080/hateoas/users"}]}
]
```

- 查询单个用户

[http://localhost:8080/hateoas/users/1](http://localhost:8080/hateoas/users/1)

反馈如下

```json
{"userId":1,"name":"1","links":[{"rel":"self","href":"http://localhost:8080/hateoas/users"}]}
```

* any list
{:toc}










