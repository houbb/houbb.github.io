---
layout: post
title:  Spring Boot-04-profile active 不同环境激活不同配置
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

# 场景

有很多公司都有配置中心，保证不同的环境不同的配置。

有时候也可以 maven 项目也可以直接根据 profile 配置激活，比如：

```xml
mvn clean install -P test
```

激活对应的配置。

springboot 也提供了类似的配置方式。

# 例子

## 目录

```
├─java
│  └─com
│      └─github
│          └─houbb
│              └─spring
│                  └─boot
│                      └─learn
│                          └─profile
│                                  Application.java
│
└─resources
        application-prod.yaml
        application-test.yaml
        application.yaml
```

## 配置

`application-xxx.yaml` 是一种约定的环境命名方式。

- application-prod.yaml

```yml
spring:
  profiles:
    active: prod
```

这里用来指定激活的环境

- application-test.yaml

测试环境配置：

```yml
server:
  port: 8080
```

- application-prod.yaml

生产环境配置：

```yml
server:
  port: 18080
```

## 测试代码

- Application.java

```java
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(Application.class, args);
        Environment environment = context.getBean(Environment.class);
        String env = environment.getProperty("spring.profiles.active");
        String port = environment.getProperty("server.port");

        System.out.println(env + " start at http://localhost: " + port );
    }

}
```

我们可以看到日志

```
prod start at http://localhost: 18080
```

如果想切换环境，改一下配置即可。

# idea 配置

有时候我们想直接使用 idea 进行 debug。

其实也可以通过 idea 进行配置。

## 命令行激活

```
java -jar --spring.profiles.active=dev xxxx.jar
```

这个也可以配置，可能麻烦一点。

## 设置虚拟机参数激活

这个相对比较简单

你可以通过设置Java虚拟机参数的方式来激活指定profile：

```
[vm options:] -Dspring.profiles.action=dev
```

# 参考资料

https://segmentfault.com/q/1010000010852406

[Spring-Boot application.yml 文件拆分，实现 maven 多环境动态启用 Profiles](https://juejin.im/post/5d1064e3f265da1b8d1628b4)

[Spring Boot 应用中server.context-path的作用](https://blog.csdn.net/onedaycbfly/article/details/80108129)

[SpringBoot启动如何加载application.yml配置文件](https://blog.csdn.net/u014044812/article/details/84256764)

* any list
{:toc}
