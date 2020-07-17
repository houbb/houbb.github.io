---
layout: post
title: Logback 10-动态日志级别
date: 2018-11-19 8:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
---

# 业务背景

有时候不同环境需要的日志级别不同，比如测试环境我们可能希望 DEBUG 级别，便于问题的定位。

那么问题来了，如何动态的修改日志级别？

# 思路

（1）手动修改：本地测试改为 debug，生产时改回来。

这个缺点比较明显，不够方便。

（2）不同的 profile 

类似于 springboot 的 profile，指定不同环境的配置。

这个其实也有一定的要求，比如有些配置放在配置中心就比较麻烦。

（3）动态修改

可以提供一个接口，根据需要动态修改。

比如查问题时，将指定的类设置为 DEBUG，问题定位改成可以改回去。

当然这个灵活的特性也可以通过 [Arthas](https://houbb.github.io/2018/10/08/jvm-33-arthas) 等工具实现，不过本文核心内容在于实现一个简单的修改方式。

# 方案1：动态接口

```java
@RestController
public class LogController {
  private static Logger logger = LoggerFactory.getLogger(LogController.class);

  @RequestMapping(value = "logLevel/{logLevel}")
  public String changeLogLevel(@PathVariable("logLevel") String logLevel) {

    try {
      LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
      loggerContext.getLogger("org.mybatis").setLevel(Level.valueOf(logLevel));
      loggerContext.getLogger("org.springframework").setLevel(Level.valueOf(logLevel));
    } catch (Exception e) {
      logger.error("动态修改日志级别出错", e);
      return "fail";
    }

    return "success";
  }
}
```

比较推荐这种方式。

# 方案2：配置文件调整

修改logback.xml配置文件：在configuration根节点配置属性scan和scanPeriod，scan为true时，配置文件被修改会被重新加载，scanPeriod定义了扫描文件变化的周期，默认6000毫秒，即一分钟。

这种做法的好处是不用自己写修改日志级别的逻辑；坏处是要手动更改配置文件，排错完成后需改回原来的配置。

示例配置如下：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<configuration scan="true" scanPeriod="6000">
  <property name="LOG_HOME" value="/export/logs/cmdb/" />
  <property name="APP_NAME" value="cmdb" />
  <property name="LOG_FILE_EXPIRE_TIME" value="180" />

  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} | ${APP_NAME} - %p | %thread | %c | line:%L - %m%n</pattern>
    </encoder>
  </appender>
  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
      <fileNamePattern>${LOG_HOME}${APP_NAME}.%d{yyyy-MM-dd}.log</fileNamePattern>
      <maxHistory>${LOG_FILE_EXPIRE_TIME}</maxHistory>
    </rollingPolicy>
    <encoder>
      <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} | ${APP_NAME} - %p | %thread | %c | line:%L - %m%n</pattern>
    </encoder>
  </appender>

  <root>
    <level value="INFO" />
    <appender-ref ref="STDOUT" />
    <appender-ref ref="FILE" />
  </root>
</configuration>
```

# 方案3：springboot 引入 Actuator

## 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
 
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

## 配置文件调整

如果是 springboot1.X，

```yml
management.security.enabled=false
```

如果是springboot2.X，则参考如下配置

```yml
management:
  endpoint:
    health:
      show-details: "ALWAYS"
  endpoints:
    web:
      exposure:
        include: "*"
```

## 查看级别 

我们可以发送 GET 请求到 http://localhost:8080/actuator/loggers 来获取支持的日志等级，以及系统（ROOT）默认的日志等和各个包路径（com.xxx.aa等）对应的日志级别。

## 修改日志级别 

通过 http://localhost:8080/actuator/loggers 端点提供的 POST 请求，修改包路径com.xxx.aa的日志级别为DEBUG：

发送 POST 请求到  http://localhost:8080/actuator/loggers/com.xxx.aa，其中请求 Body 的内容如下：

```json
{
"configuredLevel": "DEBUG"
}
```

再用 GET 访问 http://localhost:8080/loggers/com.xxx.aa 查看当前的日志级别：

```json
{
"configuredLevel": "DEBUG",
"effectiveLevel": "INFO"
}
```

# 方案四-集成 springcloudadmin 来动态修改配置

springcloudadmin 安装部署我就不做描述了，网上很多。 

## 依赖

1、引入 admin 依赖

```xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-client</artifactId>
</dependency>
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

## 登录

登录 springcloudadmin，找到指定的服务中某一个节点 

这个待验证。

# 拓展阅读

[JVM-Arthas Java 诊断工具-33](https://houbb.github.io/2018/10/08/jvm-33-arthas)

[MDC](https://houbb.github.io/2018/12/06/slf4j-mdc)

# 参考资料

[logback动态设置某个类的日志级别](http://www.voidcn.com/article/p-onhjztxy-dr.html)

[Logback动态修改日志级别的方法](https://www.jb51.net/article/151291.htm)

* any list
{:toc}