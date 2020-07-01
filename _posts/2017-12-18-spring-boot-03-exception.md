---
layout: post
title:  Spring Boot-03-异常汇总
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, exception, spring, springboot]
published: true
---

# NoClassDefFoundError

## 现象

SpringBoot在运行的时候会出现NoClassDefFoundError: org/apache/juli/logging/LogFactory的错误，

具体错误内容如下：

```
org.springframework.context.ApplicationContextException: Unable to start embedded container; nested exception is java.lang.NoClassDefFoundError: org/apache/juli/logging/LogFactory
```

## 原因

这是因为没有juli.jar导致的

## 解决方式

加入对应 jar 即可

```xml
<dependency>  
	    <groupId>org.apache.tomcat.embed</groupId>  
	    <artifactId>tomcat-embed-logging-juli</artifactId>  
	    <version>7.0.27</version>  
</dependency> 
```

# 参考资料

[springboot启动时执行任务CommandLineRunner](https://www.cnblogs.com/myblogs-miller/p/9046425.html)

* any list
{:toc}
