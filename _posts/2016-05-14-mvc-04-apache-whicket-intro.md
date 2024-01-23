---
layout: post
title:  java web mvc-04-Apache Wicket
date:  2016-5-14 11:58:26 +0800
categories: [WEB]
tags: [web, mvc]
published: true
---

# 拓展阅读

[Spring Web MVC-00-重学 mvc](https://houbb.github.io/2019/12/25/springmvc-00-index)

[mvc-01-Model-View-Controller 概览](https://houbb.github.io/2016/05/14/mvc-01-overview)

[web mvc-03-JFinal](https://houbb.github.io/2016/05/14/mvc-03-jfinal-intro)

[web mvc-04-Apache Wicket](https://houbb.github.io/2016/05/14/mvc-04-apache-whicket-intro)

[web mvc-05-JSF JavaServer Faces](https://houbb.github.io/2016/05/14/mvc-05-jsf-intro)

[web mvc-06-play framework intro](https://houbb.github.io/2016/05/14/mvc-06-play-framework-intro)

[web mvc-07-Vaadin](https://houbb.github.io/2016/05/14/mvc-07-Vaadin)

[web mvc-08-Grails](https://houbb.github.io/2016/05/14/mvc-08-Grails)

## 开源

> [The jdbc pool for java.(java 手写 jdbc 数据库连接池实现)](https://github.com/houbb/jdbc-pool)

> [The simple mybatis.（手写简易版 mybatis）](https://github.com/houbb/mybatis)

# Apache Wicket

[Apache Wicket](http://wicket.apache.org/) 为全球的网站和应用服务了十多年。有了这个版本，Wicket完全支持Java 8的习惯用法，允许在所有合适的地方使用lambda表达式。

使用Wicket 8，您可以编写更少、更快、更易于维护的代码。

# 快速开始

## 依赖

- maven

## 生成命令

```
mvn archetype:generate -DarchetypeGroupId=org.apache.wicket -DarchetypeArtifactId=wicket-archetype-quickstart -DarchetypeVersion=8.0.0 -DgroupId=com.github.houbb -DartifactId=wicket -DarchetypeRepository=https://repository.apache.org/ -DinteractiveMode=false
```

将会生成一个 maven 项目

## 项目结构

```
.
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── github
    │   │           └── houbb
    │   │               ├── HomePage.html
    │   │               ├── HomePage.java
    │   │               └── WicketApplication.java
    │   ├── resources
    │   └── webapp
    │       ├── WEB-INF
    │       │   └── web.xml
    │       ├── logo.png
    │       └── style.css
    └── test
        ├── java
        │   └── com
        │       └── github
        │           └── houbb
        │               ├── Start.java
        │               └── TestHomePage.java
        ├── jetty
        │   ├── jetty-http.xml
        │   ├── jetty-https.xml
        │   ├── jetty-ssl.xml
        │   └── jetty.xml
        └── resources
            └── keystore
```

## 运行项目

- 运行日志

运行 `Start.main()` 方法启动日志如下

```
SSL access to the examples has been enabled on port 8443
You can access the application using SSL on https://localhost:8443

[main] INFO org.eclipse.jetty.server.Server - jetty-9.4.7.v20170914
[main] INFO org.eclipse.jetty.webapp.StandardDescriptorProcessor - NO JSP Support for /, did not find org.eclipse.jetty.jsp.JettyJspServlet
[main] INFO org.eclipse.jetty.server.session - DefaultSessionIdManager workerName=node0
[main] INFO org.eclipse.jetty.server.session - No SessionScavenger set, using defaults
[main] INFO org.eclipse.jetty.server.session - Scavenging every 660000ms
[main] INFO org.apache.wicket.util.file.WebXmlFile - web.xml: url mapping found for filter with name wicket.wicket: [/*]
[main] INFO org.apache.wicket.Application - [wicket.wicket] init: Wicket core library initializer
[main] INFO org.apache.wicket.protocol.http.WebApplication - [wicket.wicket] Started Wicket version 8.0.0 in DEVELOPMENT mode
********************************************************************
*** WARNING: Wicket is running in DEVELOPMENT mode.              ***
***                               ^^^^^^^^^^^                    ***
*** Do NOT deploy to your live server(s) without changing this.  ***
*** See Application#getConfigurationType() for more information. ***
********************************************************************
[main] INFO org.eclipse.jetty.server.handler.ContextHandler - Started o.e.j.w.WebAppContext@9f70c54{/,file:///Users/houbinbin/code/_third/wicket/src/main/webapp/,AVAILABLE}{src/main/webapp}
[main] INFO org.eclipse.jetty.server.AbstractConnector - Started ServerConnector@366e2eef{HTTP/1.1,[http/1.1]}{0.0.0.0:8080}
[main] INFO org.eclipse.jetty.util.ssl.SslContextFactory - x509=X509@61230f6a(jetty,h=[],w=[]) for SslContextFactory@49d904ec(file:///Users/houbinbin/code/_third/wicket/target/test-classes/keystore,null)
[main] INFO org.eclipse.jetty.server.AbstractConnector - Started ServerConnector@2096442d{SSL,[ssl, http/1.1]}{0.0.0.0:8443}
[main] INFO org.eclipse.jetty.server.Server - Started @1438ms
[qtp824318946-25] WARN org.eclipse.jetty.http.HttpParser - Illegal character 0x16 in state=START for buffer HeapByteBuffer@fb1dbe6[p=1,l=517,c=8192,r=516]={\x16<<<\x03\x01\x02\x00\x01\x00\x01\xFc\x03\x03\xC5w\xAby\xA6 \x90...\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00>>>\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00...\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00}
[qtp824318946-18] WARN org.eclipse.jetty.http.HttpParser - Illegal character 0x16 in state=START for buffer HeapByteBuffer@2f847c8[p=1,l=517,c=8192,r=516]=
....
```

## 访问

直接访问即可 [http://localhost:8080/](http://localhost:8080/)

* any list
{:toc}