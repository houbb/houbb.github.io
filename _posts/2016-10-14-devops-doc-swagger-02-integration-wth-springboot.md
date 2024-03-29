---
layout: post
title: Swagger 整合 springboot 2.6.8 + swagger3   springboot 2.x + swagger2
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

# springboot 2.x + swagger2

## maven 

```xml
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

## 编写配置类

```java
@Configuration
@EnableSwagger2 // 开启Swagger2自动配置
public class Swagger2Config {
    
    @Bean
    public Docket UserApiConfig(){
        return new Docket(DocumentationType.SWAGGER_2)
                .groupName("UserApi") // 分组
                .apiInfo(UserApiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("cn.ken.login.controller"))
                .paths(PathSelectors.ant("/user/**"))
                .build();
    }

    @Bean
    public Docket BlogApiConfig(){
        return new Docket(DocumentationType.SWAGGER_2)
                .groupName("BlogApi") // 分组
                .apiInfo(BlogApiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("cn.ken.login.controller"))
                .paths(PathSelectors.ant("/blog/**"))
                .build();
    }

    // 配置用户文档信息
    private ApiInfo UserApiInfo(){
        return new ApiInfoBuilder()
                .title("我的API文档") // 标题
                .description("本文档描述了用户相关的接口定义") // 描述
                .version("1.0") // 版本
                .contact(new Contact("联系人名字", "联系人访问链接", "联系人邮箱")) // 联系人信息
                .build();
    }
    
    // 配置博客文档信息
    private ApiInfo BlogApiInfo(){
        return new ApiInfoBuilder()
                .title("我的API文档") // 标题
                .description("本文档描述了博客相关的接口定义") // 描述
                .version("1.0") // 版本
                .contact(new Contact("联系人名字", "联系人访问链接", "联系人邮箱")) // 联系人信息
                .build();
    }

}
```

## 访问

使用注解对接口进行描述（也可以省略）

访问 http://localhost:8080/swagger-ui.html

## 启动报错

### 1. NPE

```
Caused by: java.lang.NullPointerException: null
	at springfox.documentation.spi.service.contexts.Orderings$8.compare(Orderings.java:112) ~[springfox-spi-2.9.2.jar:null]
	at springfox.documentation.spi.service.contexts.Orderings$8.compare(Orderings.java:109) ~[springfox-spi-2.9.2.jar:null]
	at com.google.common.collect.ComparatorOrdering.compare(ComparatorOrdering.java:37) ~[guava-20.0.jar:na]
	at java.util.TimSort.countRunAndMakeAscending(TimSort.java:351) ~[na:1.8.0_05]
	at java.util.TimSort.sort(TimSort.java:216) ~[na:1.8.0_05]
	at java.util.Arrays.sort(Arrays.java:1435) ~[na:1.8.0_05]
	at com.google.common.collect.Ordering.sortedCopy(Ordering.java:855) ~[guava-20.0.jar:na]
	at springfox.documentation.spring.web.plugins.WebMvcRequestHandlerProvider.requestHandlers(WebMvcRequestHandlerProvider.java:57) ~[springfox-spring-web-2.9.2.jar:null]
	at springfox.documentation.spring.web.plugins.DocumentationPluginsBootstrapper$2.apply(DocumentationPluginsBootstrapper.java:138) ~[springfox-spring-web-2.9.2.jar:null]
	at springfox.documentation.spring.web.plugins.DocumentationPluginsBootstrapper$2.apply(DocumentationPluginsBootstrapper.java:135) ~[springfox-spring-web-2.9.2.jar:null]
	at com.google.common.collect.Iterators$7.transform(Iterators.java:750) ~[guava-20.0.jar:na]
	at com.google.common.collect.TransformedIterator.next(TransformedIterator.java:47) ~[guava-20.0.jar:na]
	at com.google.common.collect.TransformedIterator.next(TransformedIterator.java:47) ~[guava-20.0.jar:na]
	at com.google.common.collect.MultitransformedIterator.hasNext(MultitransformedIterator.java:52) ~[guava-20.0.jar:na]
	at com.google.common.collect.MultitransformedIterator.hasNext(MultitransformedIterator.java:50) ~[guava-20.0.jar:na]
	at com.google.common.collect.ImmutableList.copyOf(ImmutableList.java:249) ~[guava-20.0.jar:na]
	at com.google.common.collect.ImmutableList.copyOf(ImmutableList.java:209) ~[guava-20.0.jar:na]
	at com.google.common.collect.FluentIterable.toList(FluentIterable.java:614) ~[guava-20.0.jar:na]
	at springfox.documentation.spring.web.plugins.DocumentationPluginsBootstrapper.defaultContextBuilder(DocumentationPluginsBootstrapper.java:111) ~[springfox-spring-web-2.9.2.jar:null]
	at springfox.documentation.spring.web.plugins.DocumentationPluginsBootstrapper.buildContext(DocumentationPluginsBootstrapper.java:96) ~[springfox-spring-web-2.9.2.jar:null]
	at springfox.documentation.spring.web.plugins.DocumentationPluginsBootstrapper.start(DocumentationPluginsBootstrapper.java:167) ~[springfox-spring-web-2.9.2.jar:null]
	at org.springframework.context.support.DefaultLifecycleProcessor.doStart(DefaultLifecycleProcessor.java:178) ~[spring-context-5.3.16.jar:5.3.16]
	... 15 common frames omitted
```

原因：

Spring Boot 2.6及 更高版本使用的是PathPatternMatcher，而Springfox使用的路径匹配是基于AntPathMatcher的，所以更改配置如下：

```yaml
spring:
  mvc:
    pathmatch:
      matching-strategy: ANT_PATH_MATCHER
```


## 2. 访问页面 404

`@EnableWebMvc` 注解的问题，加了这个注解以后会导致静态资源路径无法访问。

继承了WebMvcConfigurationSupport，配置文件在中配置的相关内容会失效，需要重新指定静态资源

@EnableWebMvc注解（相当于继承WebMvcConfigurationSupport）和extends WebMvcConfigurationSupport导致404的原因都是因为同时有多个配置类实现了WebMvcConfigurer或继承了WebMvcConfigurationSupport的话，只会有一个生效，即以上两种情况导致了默认的WebMvcAutoConfiguration自动配置失效，故找不到静态资源。

解决办法是，保持一个配置类，将配置都在一个类中设置。

解决方法：

在一个统一的WebConfig中实现WebMvcConfigurer，并重写其中的public void addResourceHandlers(ResourceHandlerRegistry registry)方法，重新指定swagger静态资源，如下：

```java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
	registry.addResourceHandler("/**").addResourceLocations("classpath:/static/");
	registry.addResourceHandler("swagger-ui.html").addResourceLocations("classpath:/META-INF/resources/");
	registry.addResourceHandler("/webjars/**").addResourceLocations("classpath:/META-INF/resources/webjars/");
}
```

## 3、页面被拦截器拦截

放行该页面，如下：

```java
@Configuration
public class InterceptorConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new JWTInterceptor())
                .excludePathPatterns("user/login")
                .excludePathPatterns("user/register")
                .excludePathPatterns("/swagger-resources/**")
                .excludePathPatterns("/swagger-ui.html/**")
                .excludePathPatterns("/webjars/**");
    }
}
```







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

https://blog.csdn.net/qq_25046827/article/details/124086625

* any list
{:toc}