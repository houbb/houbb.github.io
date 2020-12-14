---
layout: post
title:  Spring Boot-11-自定义 springboot starter
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

# starter 有什么用？

SpringBoot中的starter是一种非常重要的机制，能够抛弃以前繁杂的配置，将其统一集成进starter，应用者只需要在maven中引入starter依赖，SpringBoot就能自动扫描到要加载的信息并启动相应的默认配置。

starter让我们摆脱了各种依赖库的处理，需要配置各种信息的困扰。

SpringBoot会自动通过classpath路径下的类发现需要的Bean，并注册进IOC容器。

SpringBoot提供了针对日常企业应用研发各种场景的spring-boot-starter依赖模块。

所有这些依赖模块都遵循着约定成俗的默认配置，并允许我们调整这些配置，即遵循“约定大于配置”的理念。

## 为什么需要

在我们的日常开发工作中，经常会有一些独立于业务之外的配置模块，我们经常将其放到一个特定的包下，然后如果另一个工程需要复用这块功能的时候，需要将代码硬拷贝到另一个工程，重新集成一遍，麻烦至极。

如果我们将这些可独立于业务代码之外的功配置模块封装成一个个starter，复用的时候只需要将其在pom中引用依赖即可，SpringBoot为我们完成自动装配，简直不要太爽。

## 可以改进的个人项目

- [dds](https://github.com/houbb/dds)

- [jdbc-pool](https://github.com/houbb/jdbc-pool)

- [mybatis](https://github.com/houbb/mybatis)

- [sisyphus](https://github.com/houbb/sisyphus)

- [auto-log](https://github.com/houbb/auto-log)

- [async](https://github.com/houbb/async)

- [quartz-admin](https://github.com/houbb/quartz-admin)

- [metadata](https://github.com/houbb/metadata)

## 命名规则

SpringBoot提供的starter以spring-boot-starter-xxx的方式命名的。

官方建议自定义的starter使用 `xxx-spring-boot-starter` 命名规则。

以区分SpringBoot生态提供的starter。

# 代码编写

## maven 依赖

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.1.4.RELEASE</version>
</parent>

<properties>
    <java.version>1.8</java.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-configuration-processor</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
</dependencies>
```

或者采用依赖的方式：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.3.2.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>


<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-configuration-processor</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
</dependencies>
```

还有自己特殊的额外依赖，专门用于功能的：

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>auto-log-spring</artifactId>
    <version>${auto-log.version}</version>
    <exclusions>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context-support</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-beans</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-aop</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

这里是把一些依赖包排除了，可忽略这部分引入。

## 代码编写

- AutoLogProperties.java

这里主要通过 `@ConfigurationProperties(prefix = "auto-log")` 获取一些我们需要的配置信息。

比如 jdbc 连接信息等等。

```java
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "auto-log")
public class AutoLogProperties {

    private String enable;

    private String level;

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getEnable() {
        return enable;
    }

    public void setEnable(String enable) {
        this.enable = enable;
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

- AutoLogAutoConfig.java

这里比较有趣的就是 `@ConditionalXXX` 注解了，你可以根据自己的需要，决定什么时候注解生效。

```java
import com.github.houbb.auto.log.spring.annotation.EnableAutoLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
@Configuration
//@ConditionalOnProperty(
//        prefix = "auto-log",
//        name = "enable",
//        havingValue = "true"
//)
@ConditionalOnClass(EnableAutoLog.class)
@EnableConfigurationProperties(AutoLogProperties.class)
@EnableAutoLog
public class AutoLogAutoConfig {

    @Autowired
    private AutoLogProperties properties;

    public void showInfo() {
        System.out.println(properties);
    }

}
```

其实这个和 spring 的自动扫包已经很接近了，只不过这里做了更多的特性增强。

## 配置文件

spring-boot 的所有自动配置，需要在 `resources/META-INF/spring.factories` 文件下进行指定：

```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=com.github.houbb.auto.log.sb.starter.config.AutoLogAutoConfig
```

这个其实就是 SPI 机制。

到这里我们的 starter 就已经写完了，是不是非常的简单。

# 测试

## 引入依赖

```xml
<dependencies>
    <dependency>
        <groupId>com.github.houbb</groupId>
        <artifactId>auto-log-sb-starter</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-configuration-processor</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-logging</artifactId>
    </dependency>
</dependencies>
```

## 定义服务

- UserService.java

```java
public interface UserService {

    String queryLog(final String id);

}
```

- UserServiceImpl.java

```java
@Service
public class UserServiceImpl implements UserService {

    @Override
    @AutoLog
    public String queryLog(String id) {
        System.out.println("查询：" + id);

        return "result" + id;
    }

}
```

## 测试代码

```java
import com.github.houbb.auto.log.sb.starter.config.AutoLogAutoConfig;
import com.test.service.UserService;
import com.test.service.properties.MyConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

/**
 * 启动项
 * @author 老马啸西风
 * @since 1.0.0
 */
@SpringBootApplication
public class StarterTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(StarterTestApplication.class, args);
        AutoLogAutoConfig autoLogAutoConfig = context.getBean(AutoLogAutoConfig.class);
        autoLogAutoConfig.showInfo();

        UserService userService = context.getBean(UserService.class);
        userService.queryLog("1");
    }

}
```

- application.properties

```
auto-log.enable=true
auto-log.level=INFO
```

不过这里的配置信息我暂时没有使用，只是做一个验证。

## 日志

```
AutoLogProperties{enable='true', level='INFO'}
2020-07-29 23:39:50.168  INFO 8316 --- [           main] c.g.h.a.l.c.s.i.AutoLogMethodInterceptor : public java.lang.String com.test.service.impl.UserServiceImpl.queryLog(java.lang.String) param is [1].
查询：1
2020-07-29 23:39:50.168  INFO 8316 --- [           main] c.g.h.a.l.c.s.i.AutoLogMethodInterceptor : public java.lang.String com.test.service.impl.UserServiceImpl.queryLog(java.lang.String) result is result1.
```

说明已经获取到了配置，并且我们定义的自动日志注解也是生效的。

# 小结

springboot 的自定义 starter 功能非常的强大，让我们可以只引入一下 jar 包，就可以直接使用对应的功能，这就是是框架带来的便利性。

本实战系列用于记录 springboot 的实际使用和学习笔记。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

## 拓展阅读

[面试官：知道 springboot 的启动原理吗？](https://www.toutiao.com/i6905286288581100046/)

[5 分钟入门 springboot 实战学习笔记](https://www.toutiao.com/i6905333348474896908/)

# 参考资料

[SpringBoot应用篇（一）：自定义starter](https://www.cnblogs.com/hello-shf/p/10864977.html)

* any list
{:toc}
