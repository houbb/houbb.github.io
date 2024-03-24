---
layout: post
title: Swagger 文档工具 设计、构建、文档化和使用您的 RESTful API
date:  2016-10-14 23:51:50 +0800
categories: [Devops]
tags: [devops, doc, ci]
published: true
---


# Swagger

[Swagger](http://swagger.io/) 是一个功能强大的开源框架，支持大量工具生态系统，帮助您设计、构建、文档化和使用您的 RESTful API。

# 使用 SpringBoot

您可以从 [swagger-springboot](https://github.com/houbb/springboot) 获取完整的项目演示。

> [springboot-blog 中文版](http://blog.didispace.com/springbootswagger2/)

文件结构可能如下所示：

```
.
|____main
| |____java
| | |____com
| | | |____ryo
| | | | |____Application.java
| | | | |____controller
| | | | | |____HelloWorld.java
| | | | |____Swagger2.java
| |____resources
| | |____application.properties
| | |____log4j2.xml
| | |____README.md

```

## maven 配置

1、 创建 SpringBoot 项目

- 在 ```pom.xml``` 中导入 SpringBoot 依赖包

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ryo</groupId>
    <artifactId>springboot</artifactId>
    <version>1.0.0</version>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <plugin.tomcat.version>2.2</plugin.tomcat.version>
        <maven-surefire-plugin.version>2.18.1</maven-surefire-plugin.version>
        <maven-compiler-plugin.version>3.3</maven-compiler-plugin.version>

        <!--spring-boot-->
        <spring-boot.version>1.3.5.RELEASE</spring-boot.version>

        <log4j.version>2.6</log4j.version>
    </properties>

    <dependencies>
        <!--spring-boot-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>${spring-boot.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <version>${spring-boot.version}</version>
        </dependency>

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

    </dependencies>


    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
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

2、maven 导入 jar

```xml
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.2.2</version>
</dependency>
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>2.2.2</version>
</dependency>
```

## 配置信息

我们可以定义一个 swagger 的全局配置。

```java
package com.github.houbb.register.http.admin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

/**
 * swagger 配置
 *
 * @author binbin.hou
 * @since 1.0.0
 */
@EnableSwagger2
@Configuration
public class SwaggerConfig {

    @Bean
    public Docket createRestApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .pathMapping("/")
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.github.houbb.register.http.admin.controller"))
                .paths(PathSelectors.any())
                .build()
                .apiInfo(new ApiInfoBuilder()
                        .title("SpringBoot整合Swagger测试")
                        .description("SpringBoot整合Swagger，详细信息......")
                        .version("9.0")
                        .contact(new Contact("老马", "blog.csdn.net", "aaa@gmail.com"))
                        .license("The Apache License")
                        .licenseUrl("http://www.baidu.com")
                        .build());
    }

}
```

最核心的主要是 `RequestHandlerSelectors.basePackage("com.github.houbb.register.http.admin.controller")`

我们指定了需要扫描的包路径。

## 文档定义

3、配置使用

- ```Application.java```

```java
package com.ryo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Created by houbinbin on 16/6/5.
 */
@SpringBootApplication
public class Application {
    public static void main(String args[]) {
        SpringApplication.run(Application.class, args);
    }
}
```


- ```HelloWorld.java```

```java
package com.ryo.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by houbinbin on 16/6/19.
 */
@RestController
@RequestMapping("hello")
@Api(value = "hello", description = "spring boot 初步测试")
public class HelloWorld {

    @ApiOperation(value="hello", notes="初步使用啦啦啦")
    @RequestMapping(method = RequestMethod.GET)
    public String hello() {
        return "SUCCESS";
    }
}
```

- ```application.properties```

```
server.port=180080
```

## 应用启动 & 访问

4、 启动应用

Maven Projects->${project}->Plugins->spring-boot->spring-boot:run

```
 .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v1.3.5.RELEASE)

2016-12-25 15:29:50.066  INFO 4095 --- [           main] com.ryo.Application                      : Starting Application on houbinbindeMacBook-Pro.local with PID 4095 (/Users/houbinbin/IT/code/springboot/target/classes started by houbinbin in /Users/houbinbin/IT/code/springboot)
2016-12-25 15:29:50.069  INFO 4095 --- [           main] com.ryo.Application                      : No active profile set, falling back to default profiles: default
...
2016-12-25 15:29:52.688  INFO 4095 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 18080 (http)
2016-12-25 15:29:52.692  INFO 4095 --- [           main] com.ryo.Application                      : Started Application in 3.094 seconds (JVM running for 5.262)
```

- 浏览器访问

浏览器访问：[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)


# 基本配置例子

## Controller 控制器

```java
package com.github.houbb.register.http.admin.controller;


import com.github.houbb.register.http.admin.model.ClientLogDto;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * <p>
 * 客户端数据日志 前端控制器
 * </p>
 *
 * @author binbin.hou
 * @since 2021-03-08
 */
@Controller
@RequestMapping("/clientLog")
@Api(tags = "客户端日志 CRUD")
public class ClientLogController {

    @PostMapping("/add")
    @ApiOperation("添加日志")
    @ResponseBody
    public String add(ClientLogDto clientLogDto) {
        System.out.println(clientLogDto);
        return "ok";
    }

}
```

### 实体属性

针对入参 ClientLogDto，我们可以添加对应的属性描述如下：

```java
public class ClientLogDto implements Serializable {

    @ApiModelProperty(value = "类型")
    private String type;

    @ApiModelProperty(value = "地址")
    private String ip;

    @ApiModelProperty(value = "名称")
    private String name;

    //getter & setter & toString()
}
```

## 效果

重新启动应用，效果如下：

![输入图片说明](https://images.gitee.com/uploads/images/2021/0308/145754_3b3dcec0_508704.png "屏幕截图.png")

## 测试

我们可以使用 【Try it out】，可以进行相关的测试。

![输入图片说明](https://images.gitee.com/uploads/images/2021/0308/145909_44530fe8_508704.png "屏幕截图.png")

点击 execute 按钮，可以获取非常详细的文档返回。

## 常用注解说明

1. @Api注解可以用来标记当前Controller的功能。

2. @ApiOperation注解用来标记一个方法的作用。

3. @ApiImplicitParam注解用来描述一个参数，可以配置参数的中文含义，也可以给参数设置默认值，这样在接口测试的时候可以避免手动输入。

4. 如果有多个参数，则需要使用多个@ApiImplicitParam注解来描述，多个@ApiImplicitParam注解需要放在一个@ApiImplicitParams注解中。

5. 需要注意的是，@ApiImplicitParam注解中虽然可以指定参数是必填的，但是却不能代替@RequestParam(required = true)，前者的必填只是在Swagger2框架内必填，抛弃了Swagger2，这个限制就没用了，所以假如开发者需要指定一个参数必填，@RequestParam(required = true)注解还是不能省略。

6. 如果参数是一个对象（例如上文的更新接口），对于参数的描述也可以放在实体类中。


# 一点思考

swagger2 的 ui 还是非常舒服的，功能也比较强大，不过有一点比较可惜，那就是注解显得有一点点冗余。

可以考虑配合 yAPI 使用。

# 参考资料

[SpringBoot的整合（四、整合Swagger2） ](https://www.cnblogs.com/flyinghome/p/12944805.html)

[SpringBoot swagger 配置账号密码](https://blog.csdn.net/weixin_37264997/article/details/82762107)

* any list
{:toc}