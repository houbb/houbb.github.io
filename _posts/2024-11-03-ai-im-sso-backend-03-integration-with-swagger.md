---
layout: post
title: AI 开发 IM-03-整合 swagger
date: 2025-3-13 20:44:06 +0800
categories: [IM]
tags: [im, opensource, ai, sh]
published: true
---

## 问题

 配置Swagger后，访问http://localhost:8080/swagger-ui.html不显示页面

不同的版本可能路径不同，可以尝试：

http://localhost:8080/swagger-ui/index.html

## 原因

Swagger版本过高

我尝试降低springboot版本到2.2.6.RELEASE结果还是不行，然后将Swagger版本从3.0降到2.9.2就可以访问了，随后我又将springboot版本还原，还是可以访问，最后得出Swagger版本不能太高

# 整体实现

## maven 依赖

```xml
 <!--        集成Swagger-->
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.9.2</version>
</dependency>
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>2.9.2</version>
</dependency>
```


## swagger 配置

```java
package com.liu.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.ArrayList;

@Configuration
@EnableSwagger2 //开启了swagger2
public class SwaggerConfig {
    //配置了swagger的Docker的bean实例
    @Bean
    public Docket docket() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                //包下的类，生成接口文档
                .build();
    }

    //配置Swagger信息
    private ApiInfo apiInfo() {
//        作者信息
        Contact contact = new Contact("小柳", "https://www.baidu.com", "1811961890@qq.com");
        return new ApiInfoBuilder()
                .contact(contact)
                .title("充电了")
                .description("打卡！！！")
                .termsOfServiceUrl("https://www.baidu.com")
                .version("3.0")
                .build();
    }
}
```

## 配置Controller

```java
package com.liu.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MyController {

    @RequestMapping("/hello")
    public String hello(){
        return "欢迎使用！！！！";
    }
}
```

# 参考资料

https://blog.csdn.net/qq_44774287/article/details/124992785

* any list
{:toc}