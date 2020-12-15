---
layout: post
title:  Spring Cloud-01-5 分钟入门 spring cloud 实战笔记
date:  2020-12-14 22:11:27 +0800
categories: [Spring]
tags: [spring-cloud, micro service, sh]
published: true
---

大家好，我是老马。

今天和大家来一起体验一下 spring cloud，回首了一下以前的笔记，整理记录 spring cloud 已经 2 年有余，不过工作中不用，也就淡忘了。

最近在梳理学习微服务相关知识，就将 spring cloud 重温一下。

# Spring Cloud

[Spring Cloud](https://spring.io/projects/spring-cloud) 为开发人员提供了工具，以快速构建分布式系统中的一些常见模式（例如，配置管理，服务发现，断路器，智能路由，微代理，控制总线，一次性令牌，全局锁，领导选举，分布式 会话，群集状态）。

## 核心组件

Spring Cloud主要包含以下常用组件：Eureka/nacos、Ribbon、Feign

### Eureka

分成两类：

（1）一是注册中心及EurekaServer，用于提供服务注册/服务申请等功能；

（2）一是被注册者及服务提供者EurekaClient，用于向EurekaServer注册服务并可从EurekaServer获取需要调用的服务地址信息；

需要向外提供服务的应用，需要使用EurekaClient来向Server注册服务。

### Ribbon

负责进行客户端负载均衡的组件；一般与RestTemplate结合，在访问EurekaClient提供的服务时进行负载均衡处理。

也就是说，Ribbon用于服务调用者向被调用者进行服务调用，并且如果服务者有多个节点时，会进行客户端的负载均衡处理；

### Feign

与Ribbon功能类型，用于调用方与被调用方的服务调用，同时进行客户端负载均衡的处理；

不过它能提供类似本地调用的方式调用远程的EurekaClient提供的服务；它实际上是在Ribbon基础上进行了进一步的封装来提高调用服务的简便性。

## 使用场景

假设现在有springcloud-eurekaClient和springcloud-eurekaClient2向外提供服务，该服务同时部署两个节点；Client通过Feign或者是Ribbon调用其提供的服务，其部署关系及数据流向图如下所示：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1214/231655_4ede091c_508704.png "屏幕截图.png")

第一步：启动注册中心（启动springCloud-EurekaServer项目）；服务提供者及调用者向服务中心注册；

第二步：服务调用者向服务中心申请服务，根据服务中心返回的地址信息调用服务提供者提供的服务；

第三步：注册中心通过心跳检测方式检测服务提供者的状态，当某个提供者连接不上时，发送消息通知所有注册者；

如果你以前使用过类似 dubbo 的工具，会发现这些原理都是类似的。

![dubbo](https://images.gitee.com/uploads/images/2020/1214/232751_26e619ca_508704.png)

# 快速开始

springcloud 的官方教程我看了几分钟还是感觉云里雾里，于是网上查了一些入门案例，整理记录如下，方便大家学习。

## 整体介绍

此处使用 maven 多模块实现，当然也可以拆成多个独立的应用。

共计三个模块：

- springcloud-learn-eurekaserver

可以理解为注册中心。

- springcloud-learn-eurekaclient

服务的提供者模块

- springcloud-learn-feignclient

服务的使用者模块

## 基础的 pom.xml

这里主要通过 import 引入 spring-cloud 的版本依赖，也演示了指定 springboot 依赖的方式。

maven-compiler-plugin 统一指定编译的 jdk 版本为 1.8。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.github.houbb</groupId>
    <artifactId>springcloud-learn</artifactId>
    <packaging>pom</packaging>
    <version>1.0-SNAPSHOT</version>
    <modules>
        <module>springcloud-learn-eurekaserver</module>
        <module>springcloud-learn-eurekaclient</module>
        <module>springcloud-learn-feignclient</module>
    </modules>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>1.5.4.RELEASE</version>
        <relativePath/>
    </parent>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>Dalston.SR4</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

## springcloud-learn-eurekaserver

这个模块用于实现注册中心。

### pom.xml

引入必须的依赖。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>springcloud-learn</artifactId>
        <groupId>com.github.houbb</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>springcloud-learn-eurekaserver</artifactId>

    <dependencies>
        <!-- eureka -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-eureka-server</artifactId>
        </dependency>
    </dependencies>

</project>
```

### application.yml

配置文件如下：

```yml
server:
  port: 8888

#应用的名字
spring:
  application:
    name: springcloud-eurekaserver
eureka:
  instance:
    hostname: localhost
  client:
    registerWithEureka: false  # 由于该应用为注册中心，所以设置为false，代表不向注册中心注册自己
    fetchRegistry: false  # 由于注册中心的职责就是维护服务实例，他并不需要去检索服务，所以也设置为false
    serviceUrl:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
```

### 启动类

通过 `@EnableEurekaServer` 注解启动一个服务注册中心提供给其他应用进行对话。


```java
package com.github.houbb.springcloud.learn.eurekaserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
@EnableEurekaServer
@SpringBootApplication
public class EsApplication {

    public static void main(String[] args) {
        SpringApplication.run(EsApplication.class,args);
        System.out.println("EurekaServer 启动成功！");
    }
    
}
```

### 启动

我们直接启动注册中心，启动成功后，可以浏览器访问主页

> [http://localhost:8888/](http://localhost:8888/)

效果如下：

![注册中心](https://images.gitee.com/uploads/images/2020/1214/233301_1957651b_508704.png)

这里类似于 dubbo-admin，我们可以对服务端和客户端的情况，有一个最基本的管理。

## springcloud-learn-eurekaclient

这个模块是服务的提供者

### pom.xml

依赖配置如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>springcloud-learn</artifactId>
        <groupId>com.github.houbb</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>springcloud-learn-eurekaclient</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-eureka</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

</project>
```

### application.yml

我们这里定义了应用的名称，并且指定了注册中心的地址。

```yml
server:
  port: 7777

#应用的名字
spring:
  application:
    name: springcloud-eurekaclient
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8888/eureka/
```

### 核心实现

- CalcController.java

非常简单的计算实现类，仅用于演示。

```java
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
@RestController
public class CalcController {

    @RequestMapping(value = "/add" ,method = RequestMethod.GET)
    public Integer add(@RequestParam Integer a, @RequestParam Integer b) {
        return a + b;
    }

}
```

- EcApplication.java

启动类中，我们通过 `@EnableEurekaClient` 注解，启动服务的暴露特性。

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
@EnableEurekaClient
@SpringBootApplication
public class EcApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcApplication.class, args);
        System.out.println("EurekaClient 启用成功！");
    }

}
```

### 服务注册

我们启动 EcApplication，服务中会出现启动成功的日志：

```
EurekaClient 启用成功！
2020-12-14 23:38:26.003  INFO 828 --- [nfoReplicator-0] com.netflix.discovery.DiscoveryClient    : DiscoveryClient_SPRINGCLOUD-EUREKACLIENT/192.xxx.xxx.xxx:springcloud-eurekaclient:7777 - registration status: 204
```

这里发现服务已经进行了注册，我们在注册中心的控台日志可以看到：

```
2020-12-14 23:38:26.003  INFO 3028 --- [nio-8888-exec-8] c.n.e.registry.AbstractInstanceRegistry  : Registered instance SPRINGCLOUD-EUREKACLIENT/192.xxx.xxx.xxx:springcloud-eurekaclient:7777 with status UP (replication=false)
```

当然我们直接登录开始的控台，也是可以看到这个服务的，说明注册已经成功了。

## springcloud-learn-feignclient

服务调用的模块定义。

### pom.xml

依赖如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>springcloud-learn</artifactId>
        <groupId>com.github.houbb</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>springcloud-learn-feignclient</artifactId>

        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-eureka</artifactId>
            </dependency>

            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-feign</artifactId>
            </dependency>

            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
            </dependency>
        </dependencies>

</project>
```

### application.yml

这里主要指定了注册中心的地址。

```yml
server:
  port: 9999

#应用的名字
spring:
  application:
    name: springcloud-feignclient
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8888/eureka/
```

### 定义远程调用接口

通过 `@FeignClient` 指定远程客户端的应用名称，这里我们指定的就是 `springcloud-eurekaclient`；其中 `/add` 是对应的加法方法名称。

注意：这里的 `@RequestParam` 是必须指定参数名称的，不然会报错。

```java
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
@FeignClient(value = "springcloud-eurekaclient")
public interface EurekaClientFeign {

    @GetMapping("/add")
    Integer addFromRemote(@RequestParam(value = "a") Integer a, @RequestParam(value = "b") Integer b);

}
```

### 使用服务

使用的时候就和本地类注入没有任何区别。

```java
import com.github.houbb.springcloud.learn.feignclient.remote.EurekaClientFeign;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
@RestController
public class RemoteController {

    @Autowired
    private EurekaClientFeign eurekaClientFeign;

    @RequestMapping("/add")
    public String remoteAdd() {
        int result = eurekaClientFeign.addFromRemote(1, 2);
        return "计算结果：" + result;
    }

}
```

### 启动类

在启动类上加 `@EnableFeignClients`+`@EnableDiscoveryClient` 注解，用来启用并且发现 `@FeignClient`。
 
```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.netflix.feign.EnableFeignClients;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class FcApplication {

    public static void main(String[] args) {
        SpringApplication.run(FcApplication.class, args);
        System.out.println("FcApplication 启用成功！");
    }

}
```

### 测试

启用 FcApplication，直接访问：

> [http://localhost:9999/add](http://localhost:9999/add)

页面直接返回

```
计算结果：3
```

为了便于大家学习，源码已全部开源：

> [https://gitee.com/houbinbin/springcloud-learn](https://gitee.com/houbinbin/springcloud-learn)

# 小结

springcloud 使用起来还是非常便捷的，这一切也正是 spring 的优秀之处，真正的做到了，write less & do more。

技术的本质都是类似的，个人感觉 springcloud 实际上和 dubbo 如果只看服务注册发现之类的，差异不大，不过 spring cloud 全家桶还是比较丰盛的，后续有时间我们慢慢体验。

rpc 调用大大方便了我们的日常开发，让远程服务变得像调用本地服务一样简单。

后续我们将和大家一起实现属于自己的 RPC 框架，感兴趣的小伙伴可以关注一波，实时获得最新消息。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[基于idea的springcloud的helloworld项目搭建过程整理](https://blog.csdn.net/weixin_30727835/article/details/97653925)

[SpringCloud入门使用](https://www.cnblogs.com/huangting/p/11884285.html)

* any list
{:toc}