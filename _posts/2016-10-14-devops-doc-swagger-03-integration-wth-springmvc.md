---
layout: post
title: Swagger 整合 springmvc
date:  2016-10-14 23:51:50 +0800
categories: [Devops]
tags: [devops, doc, spring, swagger, ci]
published: true
---

# 拓展阅读

[Devops-01-devops 是什么？](https://houbb.github.io/2016/10/14/devops-01-overview)

[Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件](https://houbb.github.io/2016/10/14/devops-02-jpom)

[代码质量管理 SonarQube-01-入门介绍](https://houbb.github.io/2016/10/14/devops-sonarqube-01-intro)

[项目管理平台-01-jira 入门介绍 缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件](https://houbb.github.io/2016/10/14/project-manage-jira-01-intro)

[项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件](https://houbb.github.io/2016/10/14/project-manage-phabricator-01-overview)

[持续集成平台 01 jenkins 入门介绍](https://houbb.github.io/2016/10/14/devops-jenkins-01-intro)

[Swagger 整合 springmvc](https://houbb.github.io/2016/10/14/devops-doc-swagger-03-integration-wth-springmvc)

[Swagger 整合 springboot 2.6.8 + swagger3 springboot 2.x + swagger2](https://houbb.github.io/2016/10/14/devops-doc-swagger-02-integration-wth-springboot)

[Swagger 文档工具 设计、构建、文档化和使用您的 RESTful API](https://houbb.github.io/2016/10/14/devops-doc-swagger-01-intro)


# 使用 SpringMvc

您可以从 [swagger-springmvc](https://github.com/houbb/swagger-demo) 获取完整的项目演示。

## 整体结构

文件结构可能如下所示：

```
.
|____main
| |____java
| | |____com
| | | |____ryo
| | | | |____swagger
| | | | | |____demo
| | | | | | |____controller
| | | | | | | |____UserController.java
| | | | | | |____model
| | | | | | | |____User.java
| | | | | | |____MySwaggerConfig.java
| | | | | | |____vo
| | | | | | | |____Result.java
| |____resources
| | |____app-beans.xml
| | |____app-mvc.xml
| | |____app.xml
| | |____log4j2.xml
| |____webapp
| | |____WEB-INF
| | | |____web.xml
|____test
| |____java
```

## pom.xml 依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ryo</groupId>
    <artifactId>swagger-demo</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>war</packaging>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <jdk.version>1.8</jdk.version>

        <plugin.tomcat.version>2.2</plugin.tomcat.version>
        <plugin-maven-surefire.version>2.18.1</plugin-maven-surefire.version>
        <plugin-maven-compiler.version>3.3</plugin-maven-compiler.version>

        <spring.version>4.2.6.RELEASE</spring.version>
        <servlet.version>3.1.0</servlet.version>
        <jackson.version>2.4.4</jackson.version>
        <swagger2.version>2.5.0</swagger2.version>

        <log4j2.version>2.6</log4j2.version>
    </properties>

    <dependencies>
        <!--spring-->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-web</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-beans</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context-support</artifactId>
            <version>${spring.version}</version>
        </dependency>

        <!--web-->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>${servlet.version}</version>
            <scope>provided</scope>
        </dependency>

        <!--============= springfox-swagger smallest dependency start ==========-->
        <dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger2</artifactId>
            <version>${swagger2.version}</version>
        </dependency>
        <dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger-ui</artifactId>
            <version>${swagger2.version}</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-annotations</artifactId>
            <version>${jackson.version}</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>${jackson.version}</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-core</artifactId>
            <version>${jackson.version}</version>
        </dependency>
        <!--============= springfox-swagger smallest dependency end ==========-->

        <!--log4j2-->
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-api</artifactId>
            <version>${log4j2.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>${log4j2.version}</version>
        </dependency>

    </dependencies>

    <build>
        <finalName>${project.name}</finalName>

        <plugins>
            <plugin>
                <groupId>org.apache.tomcat.maven</groupId>
                <artifactId>tomcat7-maven-plugin</artifactId>
                <version>${plugin.tomcat.version}</version>
                <configuration>
                    <port>18080</port>
                    <path>/</path>
                    <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>${plugin-maven-surefire.version}</version>
                <configuration>
                    <skipTests>true</skipTests>
                    <testFailureIgnore>true</testFailureIgnore>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>${plugin-maven-compiler.version}</version>
                <configuration>
                    <source>${jdk.version}</source>
                    <target>${jdk.version}</target>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

### java 代码

- ```Result.java```

```java
public class Result implements Serializable {
    // 0成功
    private int code;
    // 返回消息，成功为“success”，失败为具体失败信息
    private String message;
    // 返回数据
    private Object data;

    //...
}
```

- ```User.java```

```java
public class User {
    private int userId;
    private String name;
    private int age;
    //...
}
```
- ```UserController.java```

```java
@Api(value = "User控制器")
@Controller
@RequestMapping("/user")
public class UserController {

    @ApiOperation(value = "根据用户id查询用户信息", httpMethod = "GET", produces = "application/json")
    @ApiResponse(code = 200, message = "success", response = Result.class)
    @ResponseBody
    @RequestMapping(value = "queryUserById", method = RequestMethod.GET, produces = "application/json")
    public Result queryUserById(@ApiParam(name = "userId", required = true, value = "用户Id") @RequestParam("userId") int userId, HttpServletRequest request) {
        User user = new User(userId, "haoyifen", 24);
        Result result = new Result();
        result.setCode(0);
        result.setData(user);
        result.setMessage("success");
        return result;
    }
}
```

- ```MySwaggerConfig.java```

Simplest:

```java
@Configuration
@EnableSwagger2
public class MySwaggerConfig {
}
```


## 资源配置文件

- ```app-beans.xml```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd"
       default-lazy-init="false">

    <bean class="com.ryo.swagger.demo.MySwaggerConfig"/>

</beans>
```

- ```app-mvc.xml```

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
	         http://www.springframework.org/schema/beans/spring-beans.xsd
	         http://www.springframework.org/schema/mvc
	         http://www.springframework.org/schema/mvc/spring-mvc.xsd
	         http://www.springframework.org/schema/context
	         http://www.springframework.org/schema/context/spring-context.xsd">


    <mvc:annotation-driven/>
    <context:component-scan base-package="com.ryo.swagger.demo"/>
    <mvc:default-servlet-handler/>

    <bean id="viewResolver" class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/views/"/>
        <property name="suffix" value=".ftl"/>
    </bean>

</beans>
```

- ```app.xml```

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
    http://www.springframework.org/schema/beans/spring-beans.xsd">

    <import resource="app-beans.xml"/>
    <import resource="app-mvc.xml"/>

</beans>
```

- ```log4j2.xml```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="off" monitorInterval="1800">
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS}  %-5level [%t] %logger{36}:%L - %msg%n"/>
        </Console>
    </Appenders>

    <Loggers>
        <Root level="INFO">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>
```

- ```web.xml``

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.4"
         xmlns="http://java.sun.com/xml/ns/j2ee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd">

    <!--装入spring配置文件-->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:app.xml</param-value>
    </context-param>

    <!-- 防止发生java.beans.Introspector内存泄露,应将它配置在ContextLoaderListener的前面 -->
    <listener>
        <listener-class>org.springframework.web.util.IntrospectorCleanupListener</listener-class>
    </listener>

    <!-- 以Listener方式启动spring -->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>


    <!--编码过滤器-->
    <filter>
        <filter-name>encodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>utf-8</param-value>
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

    <!-- 前端控制器的配置 -->
    <servlet>
        <servlet-name>springmvc</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value></param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>springmvc</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>

</web-app>
```

## 访问

浏览器访问：[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

# 参考资料

> [博客 中文版](http://javatech.wang/index.php/archives/74/)

> [博客 中文版](http://blog.csdn.net/haoyifen/article/details/52703376)

* any list
{:toc}