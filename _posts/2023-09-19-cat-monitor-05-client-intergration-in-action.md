---
layout: post
title: cat monitor-05-cat 客户端集成实战
date: 2023-09-19 21:01:55 +0800
categories: [Monitor]
tags: [monitor, sh]
published: true
---

# 接入准备工作

## 添加 app.properties

然后你需要在你的项目中创建 src/main/resources/META-INF/app.properties 文件, 并添加如下内容:

```
app.name={appkey}
```

appkey 只能包含英文字母 (a-z, A-Z)、数字 (0-9)、下划线 (`_`) 和中划线 (-)

## 配置 client.xml

配置 `/data/appdatas/cat/client.xml` ($CAT_HOME/client.xml)

此文件用于配置cat-client连接服务端的地址，以10.1.1.1，10.1.1.2，10.1.1.3三台CAT服务器为例

client_cache.xml是路由缓存文件，若路由出现错误，可以删除client_cache.xml，再重启服务

```
PS D:\data\appdatas\cat> cat .\client.xml
```

```xml
<?xml version="1.0" encoding="utf-8"?>
<config mode="client">
        <servers>
                <server ip="127.0.0.1" port="2280" http-port="8080"/>
        </servers>
</config>
```
2280是默认的CAT服务端接受数据的端口，不允许修改，http-port是Tomcat启动的端口，默认是8080，建议使用默认端口

现在java的cat client会自动懒加载，已经没有必要手动初始化客户端。

可以配置多个地址。

# 项目路径

> [https://github.com/houbb/cat-client-demo](https://github.com/houbb/cat-client-demo)

## 目录结构

```
└─src
    ├─main
    │  ├─java
    │  │  └─com
    │  │      └─github
    │  │          └─houbb
    │  │              └─cat
    │  │                  └─client
    │  │                      └─demo
    │  │                          │  CatSpringbootApplication.java
    │  │                          │
    │  │                          ├─config
    │  │                          │      CatFilterConfigure.java
    │  │                          │
    │  │                          └─controller
    │  │                                  SampleController.java
    │  │
    │  └─resources
    │      │  application.yml
    │      │
    │      └─META-INF
    │              app.properties
```


## pom.xml

引入 cat 客户端。

```xml
<dependency>
    <groupId>com.dianping.cat</groupId>
    <artifactId>cat-client</artifactId>
    <version>3.1.0</version>
</dependency>
```

其他 springboot 相关不再赘述。

## 入门测试代码

```java
package com.github.houbb.cat.client.demo.controller;

import com.dianping.cat.Cat;
import com.dianping.cat.message.Event;
import com.dianping.cat.message.Transaction;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;

@RestController
public class SampleController {

    /**
     * http://localhost:8081/myTest
     * @return
     */
    @RequestMapping("/myTest")
    @ResponseBody
    public String home() {
        Transaction t = Cat.newTransaction("MY-TEST-TX", "/test/root/");

        try {
            Cat.logEvent("URL.Server", "serverIp", Event.SUCCESS, "ip=127.0.0.1");
            Cat.logMetricForCount("metric.key");
            Cat.logMetricForDuration("metric.key", 5);

            TimeUnit.MILLISECONDS.sleep(1);

            t.setStatus(Transaction.SUCCESS);
        } catch (Exception e) {
            t.setStatus(e);
            Cat.logError(e);
        } finally {
            t.complete();
        }

        return "Hello World!";
    }

}
```

## springboot URL 监控整合

将CatFilterConfigure.java 放到任意SpringBoot 能扫描到的package下面。

```java
package com.github.houbb.cat.client.demo.config;

import com.dianping.cat.servlet.CatFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Created by zhengwenzhu on 2017/1/17.
 */

@Configuration
public class CatFilterConfigure {

    @Bean
    public FilterRegistrationBean catFilter() {
        FilterRegistrationBean registration = new FilterRegistrationBean();
        CatFilter filter = new CatFilter();
        registration.setFilter(filter);
        registration.addUrlPatterns("/*");
        registration.setName("cat-filter");
        registration.setOrder(1);
        return registration;
    }

}
```

自动会把 CatFilter 加载到拦截器中。

## 效果

直接在 [http://127.0.0.1:8080/cat/r/t?domain=cat-demo&ip=All&date=2023091918&reportType=day&op=view](http://127.0.0.1:8080/cat/r/t?domain=cat-demo&ip=All&date=2023091918&reportType=day&op=view) 中可以查看效果。

效果如下：

![cat-monitor](https://img-blog.csdnimg.cn/c5a0c4e1dbd34e179ebe12250c4a645e.png#pic_center)

# 日志组件整合

## Log4j2 配置

如果需要使用Cat自定义的Appender，需要在log4j2.xml中添加如下配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="info">
    <Appenders>
        <Console name="console" target="SYSTEM_OUT">
            <ThresholdFilter level="DEBUG" onMatch="ACCEPT" onMismatch="DENY" />
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] [%-5p]  %c - %m%n" />
        </Console>
        <CatAppender name="CatAppender"/>
    </Appenders>
    <Loggers>
        <Root level="debug">
            <AppenderRef ref="console" />
            <AppenderRef ref="CatAppender" />
        </Root>
    </Loggers>
</Configuration>
```

# 参考资料

https://github.com/dianping/cat/blob/master/lib/java/README.zh-CN.md

https://github.com/dianping/cat/blob/master/integration/log4j2/README.md

* any list
{:toc}