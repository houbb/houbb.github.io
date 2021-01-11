---
layout: post
title:  Spring Boot-04-profile active 不同环境激活不同配置
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

# 序言

大家好，我是老马。

平时一直在使用 springboot，却总感觉对于其理解不深入，于是有两个这个系列的整理。

主要是为了系统的学习一下 springboot，残缺补漏一下。主要翻译自官方文档，结合自己的实际使用。

[springboot 学习笔记（一）引导类特性详解](https://www.toutiao.com/item/6916083152544956932/)

[springboot 学习笔记（二）外部化配置详解](https://www.toutiao.com/item/6916084329705734660/)

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

# 指定 profile 生效

看了下官方文档，还有一个比较强大的功能。

任何 `@Component`，`@Configuration` 或 `@ConfigurationProperties` 都可以用 `@Profile` 标记，以限制其加载时间。

可以指定对应的 bean 或者配置，在指定的环境下才生效。

```java
@Configuration(proxyBeanMethods = false)
@Profile("production")
public class ProductionConfiguration {

    // ...

}
```

这个应用场景老马倒是没有使用过，不过有一说一，确认非常的强大灵活。

# 小结

不同的环境，使用不同的配置，基本是所有的 web 应用都需要的一个特性。

对于没有配置中心的小型公司或是轻量的项目，使用 springboot 的 profile 可以非常方便的达到环境隔离的效果，只需要指定对应的启动命令即可。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

我是老马，期待与你的下次重逢。

# 参考资料

https://segmentfault.com/q/1010000010852406

[Spring-Boot application.yml 文件拆分，实现 maven 多环境动态启用 Profiles](https://juejin.im/post/5d1064e3f265da1b8d1628b4)

[Spring Boot 应用中server.context-path的作用](https://blog.csdn.net/onedaycbfly/article/details/80108129)

[SpringBoot启动如何加载application.yml配置文件](https://blog.csdn.net/u014044812/article/details/84256764)

* any list
{:toc}
