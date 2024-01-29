---
layout: post
title: sensitive-word-admin 应用本地启动笔记
date: 2024-01-29 21:01:55 +0800
categories: [Web]
tags: [web, java, sh]
published: true
---

# 报错1

```
org.springframework.context.ApplicationContextException: Unable to start embedded container; nested exception is org.springframework.boot.context.embedded.EmbeddedServletContainerException: Unable to start embedded Tomcat
	at org.springframework.boot.context.embedded.EmbeddedWebApplicationContext.onRefresh(EmbeddedWebApplicationContext.java:137)
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:537)
	at org.springframework.boot.context.embedded.EmbeddedWebApplicationContext.refresh(EmbeddedWebApplicationContext.java:122)
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:693)
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:360)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:303)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1118)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1107)
	at com.github.houbb.sensitive.word.admin.Application.main(Application.java:18)
Caused by: org.springframework.boot.context.embedded.EmbeddedServletContainerException: Unable to start embedded Tomcat
	at org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainer.initialize(TomcatEmbeddedServletContainer.java:138)
	at org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainer.<init>(TomcatEmbeddedServletContainer.java:87)
	at org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory.getTomcatEmbeddedServletContainer(TomcatEmbeddedServletContainerFactory.java:554)
	at org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory.getEmbeddedServletContainer(TomcatEmbeddedServletContainerFactory.java:179)
	at org.springframework.boot.context.embedded.EmbeddedWebApplicationContext.createEmbeddedServletContainer(EmbeddedWebApplicationContext.java:164)
	at org.springframework.boot.context.embedded.EmbeddedWebApplicationContext.onRefresh(EmbeddedWebApplicationContext.java:134)
	... 8 common frames omitted
Caused by: org.apache.catalina.LifecycleException: Failed to start component [StandardServer[-1]]
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:167)
	at org.apache.catalina.startup.Tomcat.start(Tomcat.java:367)
	at org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainer.initialize(TomcatEmbeddedServletContainer.java:114)
	... 13 common frames omitted
Caused by: org.apache.catalina.LifecycleException: Failed to start component [StandardService[Tomcat]]
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:167)
	at org.apache.catalina.core.StandardServer.startInternal(StandardServer.java:793)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:150)
	... 15 common frames omitted
Caused by: org.apache.catalina.LifecycleException: Failed to start component [StandardEngine[Tomcat]]
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:167)
	at org.apache.catalina.core.StandardService.startInternal(StandardService.java:422)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:150)
	... 17 common frames omitted
Caused by: org.apache.catalina.LifecycleException: A child container failed during start
	at org.apache.catalina.core.ContainerBase.startInternal(ContainerBase.java:949)
	at org.apache.catalina.core.StandardEngine.startInternal(StandardEngine.java:262)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:150)
	... 19 common frames omitted
```

## 原因


```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>3.1.0</version>
</dependency>
```


# 参考资料

https://stackoverflow.com/questions/56899871/unable-to-start-embedded-tomcat-org-springframework-context-applicationcontextex

https://github.com/spring-projects/spring-boot/issues/28410

https://stackoverflow.com/questions/10373077/tomcat-7-severe-a-child-container-failed-during-start

https://stackoverflow.com/questions/47478463/springboot-a-child-container-failed-during-start-java-util-concurrent-execution

* any list
{:toc}