---
layout: post
title: springboot spring 读取配置的几种方式 
date:  2023-08-02 +0800
categories: [Spring]
tags: [spring, properties, springboot, sh]
published: true
---

# 背景

想读取一下配置文件，这里整理一下一共几种方式。


# Spring Boot 中读取配置文件有以下 5 种方法：

- 使用 @Value 读取配置文件。

- 使用 @ConfigurationProperties 读取配置文件。

- 使用 Environment 读取配置文件。

- 使用 @PropertySource 读取配置文件。

- 使用原生方式读取配置文件。

它们的具体使用方法如下，为了方便测试，我们在 Spring Boot 配置文件 application.properties 添加以下内容：

```properties
profile.name=Spring Boot Profile
profile.desc=Spring Boot Profile Desc.
```

# 1.使用 @Value 读取配置文件

使用 @Value 可以读取单个配置项，如下代码所示：

```java
@SpringBootApplication
public class DemoApplication implements InitializingBean {
    @Value("${profile.name}")
    private String name;

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("My Profile Name：" + name);
    }
}
```

# 2.使用 @ConfigurationProperties 读取配置文件

@ConfigurationProperties 和 @Value 的使用略微不同，@Value 是读取单个配置项的，而 @ConfigurationProperties 是读取一组配置项的，我们可以使用 @ConfigurationProperties 加实体类读取一组配置项，如下代码所示：

```java
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "profile")
@Data
public class Profile {
    private String name;
    private String desc;
}
```

其中 prefix 表示读取一组配置项的根 name，相当于 Java 中的类名，最后再把此配置类，注入到某一个类中就可以使用了，如下代码所示：

```java
@SpringBootApplication
public class DemoApplication implements InitializingBean {
    @Autowired
    private Profile profile;

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("Profile Object:" + profile);
    }
}
```

# 3.使用 Environment 读取配置文件

Environment 是 Spring Core 中的一个用于读取配置文件的类，将此类使用 @Autowired 注入到类中就可以使用它的 getProperty 方法来获取某个配置项的值了，如下代码所示：

```java
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class DemoApplication implements InitializingBean {

    @Autowired
    private Environment environment;

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("Profile Name：" + environment.getProperty("profile.name"));
    }
}
```

# 4.使用 @PropertySource 读取配置文件

使用 @PropertySource 注解可以用来指定读取某个配置文件，比如指定读取 application.properties 配置文件的配置内容，具体实现代码如下：

```java
@SpringBootApplication
@PropertySource("classpath:application.properties")
public class DemoApplication implements InitializingBean {
    @Value("${profile.name}")
    private String name;

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("Name：" + name);
    }
}
```

中文乱码

如果配置文件中出现中文乱码的情况，可通过指定编码格式的方式来解决中文乱码的问题，具体实现如下：

```java
@PropertySource(value = "dev.properties", encoding = "utf-8")
```

注意事项

@PropertySource 注解默认是只支持 properties 格式配置文件的读取的。

# 5.使用原生方式读取配置文件

我们还可以使用最原始的方式 Properties 对象来读取配置文件，如下代码所示：

```java
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

@SpringBootApplication
public class DemoApplication implements InitializingBean {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        Properties props = new Properties();
        try {
            InputStreamReader inputStreamReader = new InputStreamReader(
                    this.getClass().getClassLoader().getResourceAsStream("application.properties"),
                    StandardCharsets.UTF_8);
            props.load(inputStreamReader);
        } catch (IOException e1) {
            System.out.println(e1);
        }
        System.out.println("Properties Name：" + props.getProperty("profile.name"));
    }
}
```

# 总结
在 Spring Boot 中读取配置文件有以下 5 种方法：

使用 @Value 读取配置文件。
使用 @ConfigurationProperties 读取配置文件。
使用 @PropertySource 读取配置文件。
使用 Environment 读取配置文件。
使用原生方式读取配置文件。

其中最常用的是前 3 种，如果读取某一个配置项可使用 @Value，如果读取一组配置项可使用 @ConfigurationProperties，如果要指定读取某一个具体的配置文件可使用 @PropertySource 来指定。

# 参考资料

https://www.51cto.com/article/716547.html

* any list
{:toc}