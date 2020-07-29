---
layout: post
title:  Spring Boot-10-@ConfigurationProperties 获取配置讲解
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

# 作用

在编写项目代码时，我们要求更灵活的配置，更好的模块化整合。

在 Spring Boot 项目中，为满足以上要求，我们将大量的参数配置在 application.properties 或 application.yml 文件中，通过 `@ConfigurationProperties` 注解，我们可以方便的获取这些参数值


# 配置

- application.properties

```
auto-log.enable=true
auto-log.level=info
```

我们当然可以通过 `@Value` 或者 Environment 等获取对应的配置，但是这样不够优雅。

spring 为我们提供了更加方便好用的使用方式。

## 代码

- AutoLogProperties.java

```java
@ConfigurationProperties(prefix = "auto-log", ignoreUnknownFields = true)
public class AutoLogProperties {

    private String enable;

    private String level;

    public String getEnable() {
        return enable;
    }

    public void setEnable(String enable) {
        this.enable = enable;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    @Override
    public String toString() {
        return "AutoLogProperties{" +
                "enable='" + enable + '\'' +
                ", level='" + level + '\'' +
                '}';
    }
}
```

这里 spring 会根据 prefix 移除后的属性，和 pojo 的属性进行映射处理。

## 配置类启用

AutoLogProperties 类可以通过 `@Component` 注解交给 spring 管理，也可以使用下面的方式：

`@EnableConfigurationProperties(AutoLogProperties.class)` 声明对于配置的使用。

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(AutoLogProperties.class)
public class AutoLogConfig {

    @Autowired
    private AutoLogProperties properties;

    public String showInfo() {
        System.out.println(properties);

        return properties.toString();
    }

}
```

## 测试

```java
import com.github.houbb.springboot.learn.properties.config.AutoLogConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IndexController {

    private final Logger logger = LoggerFactory.getLogger(IndexController.class);

    @Autowired
    private AutoLogConfig autoLogConfig;

    @GetMapping("/index")
    public String index() {
        return autoLogConfig.showInfo();
    }

}
```

在控台访问，就可以看到对应的配置信息：

```
AutoLogProperties{enable='true', level='info'}
```

# 参考资料

[@ConfigurationProperties 注解使用姿势，这一篇就够了](https://www.cnblogs.com/FraserYu/p/11261916.html)

* any list
{:toc}
