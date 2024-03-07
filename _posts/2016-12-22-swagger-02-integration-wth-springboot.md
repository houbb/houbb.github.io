---
layout: post
title: Swagger 整合 springboot 2.6.8 + swagger3
date:  2016-12-22 21:00:34 +0800
categories: [Tool]
tags: [swagger]
published: true
---


# 快速开始

## maven

```xml
<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-boot-starter</artifactId>
  <version>3.0.0</version>
</dependency>
```

## 配置类

```java
@Configuration  //注解为配置类，向spring容器注入bean对象
@EnableOpenApi
public class SwaggerConfig {
    @Bean  //把方法的返回值对象，注入容器
    public Docket docket(){
        return new Docket(DocumentationType.OAS_30)//选择swagger3.0版本号
                .apiInfo(apiInfo()).enable(true) //获取版权声明
                .select()
                //确定swagger能够访问到的请求接口范围，指定控制器包路径
                .apis(RequestHandlerSelectors.basePackage("org.example.controller"))
                .paths(PathSelectors.any())
                .build();  //构建对象
    }
    //撰写项目的版本声明
    private ApiInfo apiInfo(){
        return new ApiInfoBuilder()
                .title("医院预约挂号系统") //项目的名称
                .description("这是一个预约系统") //项目功能说明
                .contact(new Contact("自己的名字","自己的博客网址","12141579@qq.com"))
                .version("1.0")
                .build();
    }
}
```

## 访问路径

运行成功后的访问路径：

http://localhost:8080/swagger-ui/index.html


# 踩坑版本

## maven 

```xml
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-boot-starter</artifactId>
    <version>3.0.0</version>
</dependency>
```

## 配置类

```java
package com.posinda.system.infrastructure.swagger;
 
 
import io.swagger.annotations.ApiOperation;
import io.swagger.models.auth.In;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.servlet.mvc.method.RequestMappingInfoHandlerMapping;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.oas.annotations.EnableOpenApi;
import springfox.documentation.service.*;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.contexts.SecurityContext;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.spring.web.plugins.WebFluxRequestHandlerProvider;
import springfox.documentation.spring.web.plugins.WebMvcRequestHandlerProvider;
 
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
 
/**
 * @ClassName : Swagger3Config
 * @Description :
 * @Author : felix
 * @Date: 2022-06-07 13:57
 */
@EnableOpenApi
@Configuration
public class Swagger3Config {
 
   /**
    * 创建API
    */
   @Bean
   public Docket createRestApi()
   {
      return new Docket(DocumentationType.OAS_30)
            // 是否启用Swagger
            .enable(true)
            // 用来创建该API的基本信息，展示在文档的页面中（自定义展示的信息）
            .apiInfo(apiInfo())
            // 设置哪些接口暴露给Swagger展示
            .select()
            // 扫描所有有注解的api，用这种方式更灵活
            .apis(RequestHandlerSelectors.withMethodAnnotation(ApiOperation.class))
            // 扫描指定包中的swagger注解
//           .apis(RequestHandlerSelectors.basePackage("com.posinda.admin.peopleService.controller"))
            // 扫描所有
//           .apis(RequestHandlerSelectors.any())
//          .paths(PathSelectors.any())
            .build()
            /* 设置安全模式，swagger可以设置访问token */
//          .securitySchemes(securitySchemes())
//          .securityContexts(securityContexts())
//          .pathMapping(pathMapping)
            ;
   }
 
   /**
    * 添加摘要信息
    */
   private ApiInfo apiInfo()
   {
      // 用ApiInfoBuilder进行定制
      return new ApiInfoBuilder()
            // 设置标题
            .title("标题：若依管理系统_接口文档")
            // 描述
            .description("描述：用于管理集团旗下公司的人员信息,具体包括XXX,XXX模块...")
            // 作者信息
            .contact(new Contact("felix", null, null))
            // 版本
            .version("版本号:" + "1.0")
            .build();
   }
 
 
   /**
    * 安全模式，这里指定token通过Authorization头请求头传递
    */
   private List<SecurityScheme> securitySchemes()
   {
      List<SecurityScheme> apiKeyList = new ArrayList<SecurityScheme>();
      apiKeyList.add(new ApiKey("Authorization", "Authorization", In.HEADER.toValue()));
      return apiKeyList;
   }
 
   /**
    * 安全上下文
    */
   private List<SecurityContext> securityContexts()
   {
      List<SecurityContext> securityContexts = new ArrayList<>();
      securityContexts.add(
            SecurityContext.builder()
                  .securityReferences(defaultAuth())
                  .operationSelector(o -> o.requestMappingPattern().matches("/.*"))
                  .build());
      return securityContexts;
   }
 
   /**
    * 默认的安全上引用
    */
   private List<SecurityReference> defaultAuth()
   {
      AuthorizationScope authorizationScope = new AuthorizationScope("global", "accessEverything");
      AuthorizationScope[] authorizationScopes = new AuthorizationScope[1];
      authorizationScopes[0] = authorizationScope;
      List<SecurityReference> securityReferences = new ArrayList<>();
      securityReferences.add(new SecurityReference("Authorization", authorizationScopes));
      return securityReferences;
   }
 
   /**
    * 解决springboot2.6 和springfox不兼容问题  Failed to start bean ‘ documentationPluginsBootstrapper ‘ ; nested exception…
    * @return
    */
   @Bean
   public static BeanPostProcessor springfoxHandlerProviderBeanPostProcessor() {
      return new BeanPostProcessor() {
 
         @Override
         public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
            if (bean instanceof WebMvcRequestHandlerProvider || bean instanceof WebFluxRequestHandlerProvider) {
               customizeSpringfoxHandlerMappings(getHandlerMappings(bean));
            }
            return bean;
         }
 
         private <T extends RequestMappingInfoHandlerMapping> void customizeSpringfoxHandlerMappings(List<T> mappings) {
            List<T> copy = mappings.stream()
                  .filter(mapping -> mapping.getPatternParser() == null)
                  .collect(Collectors.toList());
            mappings.clear();
            mappings.addAll(copy);
         }
 
         @SuppressWarnings("unchecked")
         private List<RequestMappingInfoHandlerMapping> getHandlerMappings(Object bean) {
            try {
               Field field = ReflectionUtils.findField(bean.getClass(), "handlerMappings");
               field.setAccessible(true);
               return (List<RequestMappingInfoHandlerMapping>) field.get(bean);
            } catch (IllegalArgumentException | IllegalAccessException e) {
               throw new IllegalStateException(e);
            }
         }
      };
   }
 
 
}
```

# 一些问题

## Failed to start bean ‘ documentationPluginsBootstrapper ‘ ; nested exception…


1) 不兼容解决办法

```java
/**
    * 解决springboot2.6 和springfox不兼容问题  Failed to start bean ‘ documentationPluginsBootstrapper ‘ ; nested exception…
    * @return
    */
   @Bean
   public static BeanPostProcessor springfoxHandlerProviderBeanPostProcessor() {
      return new BeanPostProcessor() {
 
         @Override
         public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
            if (bean instanceof WebMvcRequestHandlerProvider || bean instanceof WebFluxRequestHandlerProvider) {
               customizeSpringfoxHandlerMappings(getHandlerMappings(bean));
            }
            return bean;
         }
 
         private <T extends RequestMappingInfoHandlerMapping> void customizeSpringfoxHandlerMappings(List<T> mappings) {
            List<T> copy = mappings.stream()
                  .filter(mapping -> mapping.getPatternParser() == null)
                  .collect(Collectors.toList());
            mappings.clear();
            mappings.addAll(copy);
         }
 
         @SuppressWarnings("unchecked")
         private List<RequestMappingInfoHandlerMapping> getHandlerMappings(Object bean) {
            try {
               Field field = ReflectionUtils.findField(bean.getClass(), "handlerMappings");
               field.setAccessible(true);
               return (List<RequestMappingInfoHandlerMapping>) field.get(bean);
            } catch (IllegalArgumentException | IllegalAccessException e) {
               throw new IllegalStateException(e);
            }
         }
      };
   }
```

2) yml 配置文件

```yml
spring:
  mvc:
    pathmatch:
      matching-strategy: ant_path_matcher #swagger3 需配置，不然展示不了列表
```

或者指定下面的注解：

```java
@EnableMvc
```


# 参考资料

[Springboot集成Swagger](https://blog.csdn.net/formyselfzzz/article/details/124968544)

https://blog.csdn.net/yao22yao/article/details/125207679

* any list
{:toc}