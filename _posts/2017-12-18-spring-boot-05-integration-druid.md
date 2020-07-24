---
layout: post
title:  Spring Boot-05-集成 Druid 数据源
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

# 情景

整合 druid 的两种方式。

# 快速开始

## maven 引入

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.1.RELEASE</version>
    </parent>

    <modelVersion>4.0.0</modelVersion>

    <artifactId>spring-boot-druid</artifactId>

    <description>hello world</description>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- jpa依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
            <version>1.1.17</version>
        </dependency>

        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>5.1.47</version>
        </dependency>
    </dependencies>

    <!-- Package as an executable jar -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
```

## DruidConfig.java

```java
package com.github.houbb.spring.boot.learn;

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.support.http.StatViewServlet;
import com.alibaba.druid.support.http.WebStatFilter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DruidConfig {

    @ConfigurationProperties(prefix = "spring.datasource")
    @Bean
    public DataSource druidDataSource() {
        return new DruidDataSource();
    }

    //因为Springboot内置了servlet容器，所以没有web.xml，替代方法就是将ServletRegistrationBean注册进去
    //加入后台监控
    @Bean  //这里其实就相当于servlet的web.xml
    public ServletRegistrationBean<StatViewServlet> statViewServlet() {
        ServletRegistrationBean<StatViewServlet> bean =
                new ServletRegistrationBean<>(new StatViewServlet(), "/druid/*");

        //后台需要有人登录，进行配置
        //bean.addUrlMappings(); 这个可以添加映射，我们在构造里已经写了
        //设置一些初始化参数
        Map<String, String> initParas = new HashMap<String, String>();
        initParas.put("loginUsername", "admin");//它这个账户密码是固定的
        initParas.put("loginPassword", "123456");
        //允许谁能防伪
        initParas.put("allow", "");//这个值为空或没有就允许所有人访问，ip白名单
        //initParas.put("allow","localhost");//只允许本机访问，多个ip用逗号,隔开
        //initParas.put("deny","");//ip黑名单，拒绝谁访问 deny和allow同时存在优先deny
        initParas.put("resetEnable", "false");//禁用HTML页面的Reset按钮
        bean.setInitParameters(initParas);
        return bean;
    }

    //再配置一个过滤器，Servlet按上面的方式注册Filter也只能这样
    @Bean
    public FilterRegistrationBean webStatFilter() {
        FilterRegistrationBean bean = new FilterRegistrationBean();
        //可以设置也可以获取,设置一个阿里巴巴的过滤器
        bean.setFilter(new WebStatFilter());
        bean.addUrlPatterns("/*");
        //可以过滤和排除哪些东西
        Map<String, String> initParams = new HashMap<String, String>();
        //把不需要监控的过滤掉,这些不进行统计
        initParams.put("exclusions", "*.js,*.css,/druid/*");
        bean.setInitParameters(initParams);
        return bean;
    }

}
```

## main 方法

```java
package com.github.houbb.spring.boot.learn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

## 访问

[http://localhost:8080/druid/login.html](http://localhost:8080/druid/login.html)

输入账户密码，就可以登录。

页面做的还是不错的，后续值得学习一下这个页面是如何集成的。


# 参考资料

[druid-spring-boot-starter](https://github.com/alibaba/druid/tree/master/druid-spring-boot-starter)

[超详细讲解SpringBoot集成Druid](https://blog.csdn.net/Hi_alan/article/details/105729607)

[java.lang.ClassNotFoundException: org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType](https://blog.csdn.net/April_519/article/details/96425356)

[springboot学习笔记-4 整合Druid数据源和使用@Cache简化redis配置](https://www.cnblogs.com/hlhdidi/p/6350306.html)

[注解@ConfigurationProperties使用方法](https://www.cnblogs.com/tian874540961/p/12146467.html)

* any list
{:toc}
