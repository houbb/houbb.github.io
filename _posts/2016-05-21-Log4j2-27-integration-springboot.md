---
layout: post
title: Log4j2-27-log4j2 与 springboot 整合
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, apache, best-practise, log4j2]
published: true
---

# 1.去除默认的依赖并导入log4j2、lombok依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <exclusions>
        <!-- 引入log4j日志时需去掉默认的logback -->
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- 日志管理log4j2 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
    <version>2.1.0.RELEASE</version>
</dependency>

<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

上面log4j2是直接导入了SpringBoot对应的版本，也可以导入spring的版本，两种二选一：

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-api</artifactId>
    <version>2.11.2</version>
</dependency>

<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.11.2</version>
</dependency>

<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>2.11.2</version>
</dependency>

<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.30</version>
</dependency>
```

# 2.在资源目录下新建log4j2.xml文件

## 1）通用日志记录：所有等级的日志都记录在同一个文件中

```xml
<?xml version="1.0" encoding="UTF-8"?>

<configuration status="info">
    <Properties>
        <!-- 声明日志文件存储的目录 -->
        <Property name="LOG_HOME">E:/logs/app/</Property>
        <Property name="APP_NAME">log</Property>
        <Property name="LOG_PATTERN"
                  value="%date{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%thread][%class{36}:%line] - %msg%n"></Property>
    </Properties>
    <Appenders>
        <!--输出控制台的配置-->
        <Console name="Console" target="SYSTEM_OUT">
            <!--控制台只输出level及以上级别的信息（onMatch），其他的直接拒绝（onMismatch）-->
            <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>
            <!-- 输出日志的格式-->
            <PatternLayout pattern="${LOG_PATTERN}"/>
        </Console>

        <!--输出日志到文件的配置，每次大小超过size，则这size大小的日志会自动存入按年份-月份建立的文件夹下面-->
        <RollingFile name="RollingFile" fileName="${LOG_HOME}/${APP_NAME}.log"
                     filePattern="${LOG_HOME}/%d{yyyy-MM}/%d{yyyy-MM-dd}_%i.log">
            <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>
            <!-- 输出日志的格式-->
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="100MB"/>
            </Policies>
            <!-- 最多保留文件数 -->
            <DefaultRolloverStrategy max="365"/>
        </RollingFile>
    </Appenders>
    <!--然后定义Logger，只有定义了Logger并引入的Appender，Appender才会生效。Root中level配置了日志级别，可配置其他级别-->
    <Loggers>
        <Root level="info">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="RollingFile"/>
        </Root>
    </Loggers>

</configuration>
```

在配置中指定了日志存储的目录是E:\logs\app，日志文件使用日期作为重要区分的条件。

## 2）分级日志记录：不同等级的日志记录到对应的文件中

```xml
<?xml version="1.0" encoding="UTF-8"?>

<configuration status="info">
    <Properties>
        <!-- 声明日志文件存储的目录 -->
        <Property name="LOG_HOME">E:/logs/app/</Property>
        <Property name="LOG_PATTERN"
                  value="%date{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%thread][%class{36}:%line] - %msg%n"></Property>
    </Properties>
    <Appenders>
        <!--输出控制台的配置-->
        <Console name="Console" target="SYSTEM_OUT">
            <!--控制台只输出level及以上级别的信息（onMatch），其他的直接拒绝（onMismatch）-->
            <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>
            <!-- 输出日志的格式-->
            <PatternLayout pattern="${LOG_PATTERN}"/>
        </Console>
        <!-- ERROR级别日志 -->
        <RollingFile name="infoAppender" fileName="${LOG_HOME}/info.log"
                     filePattern="${LOG_HOME}/%d{yyyy-MM}/%d{yyyy-MM-dd}_info.log">
            <ThresholdFilter level="info" onMatch="ACCEPT" onMismatch="DENY"/>
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="100MB"/>
            </Policies>
        </RollingFile>
        <!-- ERROR级别日志 -->
        <RollingFile name="errorAppender" fileName="${LOG_HOME}/error.log"
                     filePattern="${LOG_HOME}/%d{yyyy-MM}/%d{yyyy-MM-dd}_error.log">
            <ThresholdFilter level="error" onMatch="ACCEPT" onMismatch="DENY"/>
            <PatternLayout pattern="${LOG_PATTERN}"/>
            <Policies>
                <TimeBasedTriggeringPolicy/>
                <SizeBasedTriggeringPolicy size="100MB" />
            </Policies>
        </RollingFile>
    </Appenders>
    <Loggers>
        <Root level="info">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="infoAppender"/>
            <AppenderRef ref="errorAppender"/>
        </Root>
    </Loggers>

</configuration>
```

对于是否分级记录，根据需求决定。两者选一即可。

# 3.在配置文件配置log4j2文件的位置

- application.properties

```
logging.config = classpath:log4j2.xml
```

# 4.添加测试方法进行测试

```java
package com.zys.springboottestexample;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class SpringbootTestExampleApplicationTests {

    //创建日志对象
    Logger logger = LogManager.getLogger(this.getClass());

    @Test
    void test() {
        logger.info("我是info日志");
        logger.warn("我是warn日志");
        logger.error("我是error日志");
    }

}
```

# 参考资料

https://www.cnblogs.com/zys2019/p/14798374.html

* any list
{:toc}
