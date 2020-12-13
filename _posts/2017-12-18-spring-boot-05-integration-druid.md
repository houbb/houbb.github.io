---
layout: post
title:  Spring Boot-05-springboot整合Druid连接池实战笔记
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

# 情景

web 开发中连接数据库基本是必须的，阿里的 druid 是一款非常优秀的开源数据库连接池工具。

本文将介绍一下如何使用 springboot 整合 druid 数据源。

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

## 基本配置

这里使用了 `druid-spring-boot-starter` 引导类，所以最基本的配置只需要在 applicaiton.yml 文件中指定一下数据库连接信息就行了。

以 mysql 为例：

```yml
spring:
  datasource:
    druid:
      username: root
      password: 123456
      url: jdbc:mysql://localhost:3306/padmin?useUnicode=true&characterEncoding=utf-8&useSSL=true&serverTimezone=UTC
      driver-class-name: com.mysql.jdbc.Driver
```

## DruidConfig.java

当然 druid 还提供了其他更加强大的功能。

比如数据源的各种监控，黑白名单，sql 注入拦截等等。

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

# 小结

这里的 `druid-spring-boot-starter` 的原理，大家可以参考下 [实现你的自定义 springboot starter 实战](https://www.toutiao.com/i6905342655182684675/)。

Druid 作为一款优秀的数据连接池开源工具，个人是非常喜欢的，平时工作和学习也一直在使用。

当然，独木不成林。

druid 和 mybatis 配合起来使用效果更好，下一节我们就介绍一下如何使用 springboot 整合 mybatis + druid，感兴趣的小伙伴不妨关注一波，不迷路~

本实战系列用于记录 springboot 的实际使用和学习笔记。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

## 拓展阅读

[面试官：知道 springboot 的启动原理吗？](https://www.toutiao.com/i6905286288581100046/)

[5 分钟入门 springboot 实战学习笔记](https://www.toutiao.com/i6905333348474896908/)

[实现你的自定义 springboot starter 实战](https://www.toutiao.com/i6905342655182684675/)

# 参考资料

[druid-spring-boot-starter](https://github.com/alibaba/druid/tree/master/druid-spring-boot-starter)

[超详细讲解SpringBoot集成Druid](https://blog.csdn.net/Hi_alan/article/details/105729607)

[java.lang.ClassNotFoundException: org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType](https://blog.csdn.net/April_519/article/details/96425356)

[springboot学习笔记-4 整合Druid数据源和使用@Cache简化redis配置](https://www.cnblogs.com/hlhdidi/p/6350306.html)

[注解@ConfigurationProperties使用方法](https://www.cnblogs.com/tian874540961/p/12146467.html)

* any list
{:toc}
