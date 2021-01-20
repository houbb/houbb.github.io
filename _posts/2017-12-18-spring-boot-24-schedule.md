---
layout: post
title:  Spring Boot-24-schdule 任务调度
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# 序言

大家好，我是老马。

平时一直在使用 springboot，却总感觉对于其理解不深入，于是有两个这个系列的整理。

主要是为了系统的学习一下 springboot，残缺补漏一下。主要翻译自官方文档，结合自己的实际使用。

[springboot 学习笔记（一）引导类特性详解](https://www.toutiao.com/item/6916083152544956932/)

[springboot 学习笔记（二）外部化配置详解](https://www.toutiao.com/item/6916084329705734660/)

[springboot 教程（三）如何实现配置与环境隔离？](https://www.toutiao.com/item/6916471106937569803/)

[springboot 教程（四）logging 日志配置详解](https://www.toutiao.com/item/6916486290640863751/)

# 快速开始

## maven 配置

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>1.5.9.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-quartz</artifactId>
        <version>2.0.0.RELEASE</version>
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
```

## 任务定义

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MyJob {

    private static final Logger log = LoggerFactory.getLogger(MyJob.class);

    @Scheduled(fixedRate = 5000)
    public void fiveSecond() {
        log.info("每5秒执行一次");
    }

    @Scheduled(cron = "0/2 * * * * ?")
    public void twoSecond() {
        log.info("每2秒执行一次：");
    }

}
```

通过 `@Scheduled` 注解指定对应的调度策略。

## 启动

通过注解 `@EnableScheduling` 启动任务调度。

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@SpringBootApplication
@EnableScheduling
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

## 日志

测试日志如下：

```
2021-01-20 14:53:48.001  INFO 19332 --- [pool-1-thread-1] c.g.h.s.learn.schedule.job.MyJob         : 每2秒执行一次：
2021-01-20 14:53:50.001  INFO 19332 --- [pool-1-thread-1] c.g.h.s.learn.schedule.job.MyJob         : 每2秒执行一次：
2021-01-20 14:53:51.966  INFO 19332 --- [pool-1-thread-1] c.g.h.s.learn.schedule.job.MyJob         : 每5秒执行一次
2021-01-20 14:53:52.001  INFO 19332 --- [pool-1-thread-1] c.g.h.s.learn.schedule.job.MyJob         : 每2秒执行一次：
2021-01-20 14:53:54.001  INFO 19332 --- [pool-1-thread-1] c.g.h.s.learn.schedule.job.MyJob         : 每2秒执行一次：
2021-01-20 14:53:56.000  INFO 19332 --- [pool-1-thread-1] c.g.h.s.learn.schedule.job.MyJob         : 每2秒执行一次：
2021-01-20 14:53:56.967  INFO 19332 --- [pool-1-thread-1] c.g.h.s.learn.schedule.job.MyJob         : 每5秒执行一次
2021-01-20 14:53:58.001  INFO 19332 --- [pool-1-thread-1] c.g.h.s.learn.schedule.job.MyJob         : 每2秒执行一次：
2021-01-20 14:54:00.002  INFO 19332 --- [pool-1-thread-1] c.g.h.s.learn.schedule.job.MyJob         : 每2秒执行一次：
```


# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

我是老马，期待与你的下次重逢。

# 参考资料

https://docs.spring.io/spring-boot/docs/2.4.1/maven-plugin/reference/htmlsingle/#help

* any list
{:toc}
