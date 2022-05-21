---
layout: post
title:  Hession RPC 远程调用-01-入门例子
date:  2022-05-10 09:22:02 +0800
categories: [RPC]
tags: [rpc, sh]
published: true
---

# Hession

[Hession](http://hessian.caucho.com/#Java) 二进制 Web 服务协议使 Web 服务无需大型框架即可使用，并且无需学习另一种协议字母汤。 

因为它是一个二进制协议，所以它非常适合发送二进制数据，而无需通过附件扩展协议。

# 服务端

## 基本环境

jdk1.8

## pom.xml

spring-boot 2.0.9.RELEASE

hessian 4.0.60

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.github.houbb</groupId>
    <artifactId>hession-hello-server</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <!--spring-boot-->
        <spring-boot.version>2.0.9.RELEASE</spring-boot.version>
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

        <dependency>
            <groupId>com.caucho</groupId>
            <artifactId>hessian</artifactId>
            <version>4.0.60</version>
        </dependency>
    </dependencies>


    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
            </plugin>
        </plugins>
    </build>

</project>
```

## 服务类

定义接口：

```java
public interface UserServiceFacade {

    UserDto queryUser(String userId);

}
```

其中 UserDto 如下：

```java
public class UserDto implements Serializable {

    private String id;
    private String name;

    //getter setter toString

}
```

ps: 注意这里需要实现序列化接口。

实现也很简单：

```java
@Service
public class UserServiceFacadeImpl implements UserServiceFacade {

    public UserDto queryUser(String userId) {
        UserDto userDto = new UserDto();
        userDto.setId(userId);
        userDto.setName("N-"+userId);
        return userDto;
    }

}
```

## 服务暴露

```java
@Configuration
public class HessionServerConfig {

    @Autowired
    private UserServiceFacade userServiceFacade;

    @Bean("/userService")
    public HessianServiceExporter userService() {
        HessianServiceExporter exporter = new HessianServiceExporter();
        exporter.setService(userServiceFacade);
        exporter.setServiceInterface(UserServiceFacade.class);
        return exporter;
    }

}
```

## 应用启动

```java
@SpringBootApplication
public class Application {

    public static void main(String args[]) {
        SpringApplication.run(Application.class, args);
    }

}
```


# 客户端

## pom.xml

多了一个对于服务端 api 基础 facade 信息的依赖。（例子中混在一起的，实际生产应该拆分开）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.github.houbb</groupId>
    <artifactId>hession-hello-client</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <!--spring-boot-->
        <spring-boot.version>2.0.9.RELEASE</spring-boot.version>
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

        <dependency>
            <groupId>com.caucho</groupId>
            <artifactId>hessian</artifactId>
            <version>4.0.60</version>
        </dependency>

        <dependency>
            <groupId>com.github.houbb</groupId>
            <artifactId>hession-hello-server</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
    </dependencies>


    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
            </plugin>
        </plugins>
    </build>

</project>
```

## 引用服务

```java
@Configuration
public class HessionClientConfig {

    @Bean
    public HessianProxyFactoryBean userService() {
        HessianProxyFactoryBean factoryBean = new HessianProxyFactoryBean();
        factoryBean.setServiceUrl("http://localhost:8080/userService");
        factoryBean.setServiceInterface(UserServiceFacade.class);
        return factoryBean;
    }

}
```

## 启动

```java
@SpringBootApplication
public class Application {

    public static void main(String args[]) {
        ConfigurableApplicationContext context = SpringApplication.run(Application.class, args);

        // 調用
        UserServiceFacade userServiceFacade = context.getBean(UserServiceFacade.class);
        UserDto userDto = userServiceFacade.queryUser("11");
        System.out.println(userDto);
    }

}
```

日志：

```
UserDto{id='11', name='N-11'}
```

# 参考资料

http://hessian.caucho.com/#Java

* any list
{:toc}