---
layout: post
title:  Spring IO platform
date:  2017-12-11 21:35:03 +0800
categories: [Spring]
tags: [spring]
published: true
---


# Spring IO platform

[Spring IO](https://platform.spring.io/platform/) is a cohesive, versioned platform for building modern applications. 

It is a modular, enterprise-grade distribution that delivers a curated set of dependencies while keeping developers in full control 
of deploying only the parts they need. Spring IO is 100% open source, lean, and modular.


## 作用

就是指定引入固定的 maven(gradle) parent，默认各个 jar 的版本都经过充分的测试，不会出现冲突。很人性化的设计。

## 原理

没使用过 gradle，主要谈下 maven 的理解。

就是定义了一堆父类 `pom.xml` 属性文件，规定了各种 jar 包的版本号。我们使用时只需要直接使用即可，无需指定版本号


# Quick Start

新建 maven 项目 **spring-io-learn**

- `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ryo</groupId>
    <artifactId>spring-io-learn</artifactId>
    <version>1.0-SNAPSHOT</version>

    <!--声明-->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>io.spring.platform</groupId>
                <artifactId>platform-bom</artifactId>
                <version>Athens-SR6</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>


    <!--指定需要的jar-->

</project>
```


为了方便起见，我们测试下 [Junit](http://junit.org/junit5/)

添加一个**不指定版本号**的 Junit 依赖，如下：

```xml
<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```
 
运行命令

```
mvn clean install
```

会发现下载的 Junit 对应的 版本为 `4.12`


# 属性

直接点击 `pom` 可以看到对应的属性如下：

如果你想修改某个版本号，直接指定修改即可。


```xml
<properties>
    <spring-integration-flow.version>1.0.0.RELEASE</spring-integration-flow.version>
    <spring-integration-kafka.version>1.3.1.RELEASE</spring-integration-kafka.version>
    <spring-integration-splunk.version>1.1.0.RELEASE</spring-integration-splunk.version>
    <spring-ldap.version>2.1.0.RELEASE</spring-ldap.version>
    <spring-web-flow.version>2.4.5.RELEASE</spring-web-flow.version>
    <spring-web-services.version>${spring-ws.version}</spring-web-services.version>

    <aopalliance.version>1.0</aopalliance.version>
    <apacheds.version>1.5.5</apacheds.version>
    <apache-shared-ldap.version>0.9.15</apache-shared-ldap.version>
    <avro.version>1.8.2</avro.version>
    <axiom.version>1.2.20</axiom.version>
    <boon.version>0.33</boon.version>
    <bouncycastle.version>1.54</bouncycastle.version>
    <bsh.version>2.0b4</bsh.version>
    <c3p0.version>0.9.5.2</c3p0.version>
    <cas-client.version>3.4.1</cas-client.version>
    <castor.version>1.4.1</castor.version>
    <commonj.version>1.1.1</commonj.version>
    <commons-cli.version>1.3.1</commons-cli.version>
    <commons-fileupload.version>1.3.2</commons-fileupload.version>
    <commons-io.version>2.5</commons-io.version>
    <commons-httpclient.version>3.1</commons-httpclient.version>
    <commons-lang.version>2.6</commons-lang.version>
    <commons-lang3.version>3.4</commons-lang3.version>
    <commons-logging.version>1.2</commons-logging.version>
    <commons-net.version>3.5</commons-net.version>
    <curator.version>2.11.1</curator.version>
    <eclipselink.version>2.6.4</eclipselink.version>
    <eclipselink-javax-persistence.version>2.1.1</eclipselink-javax-persistence.version>
    <evo-inflector.version>1.2.2</evo-inflector.version>
    <findbugs-jsr305.version>3.0.2</findbugs-jsr305.version>
    <findbugs-annotations.version>2.0.3</findbugs-annotations.version>
    <gs-collections.version>5.1.0</gs-collections.version>
    <guava.version>17.0</guava.version>
    <guice.version>3.0</guice.version>
    <hadoop.version>2.2.0</hadoop.version>
    <hbase.version>0.96.2-hadoop2</hbase.version>
    <hessian.version>4.0.38</hessian.version>
    <hive.version>0.12.0</hive.version>
    <ibatis-sqlmap.version>2.3.4.726</ibatis-sqlmap.version>
    <itext.version>2.1.7</itext.version>
    <jackson1.version>1.9.13</jackson1.version>
    <jasperreports.version>6.3.1</jasperreports.version>
    <jamon.version>2.81</jamon.version>
    <javax-activation.version>1.1.1</javax-activation.version>
    <javax-annotation.version>1.0</javax-annotation.version>
    <javax-batch.version>1.0.1</javax-batch.version>
    <javax-cdi.version>1.2</javax-cdi.version>
    <javax-connector.version>1.5</javax-connector.version>
    <javax-ejb.version>3.2</javax-ejb.version>
    <javax-el.version>2.2.5</javax-el.version>
    <javax-enterprise-concurrent.version>1.0</javax-enterprise-concurrent.version>
    <javax-faces.version>2.2</javax-faces.version>
    <javax-inject.version>1</javax-inject.version>
    <javax-interceptor.version>1.2</javax-interceptor.version>
    <javax-jax-rs.version>2.0.1</javax-jax-rs.version>
    <javax-jdo.version>3.0.1</javax-jdo.version>
    <javax-jsp.version>2.3.2-b02</javax-jsp.version>
    <javax-jstl.version>1.2.1</javax-jstl.version>
    <javax-money.version>1.0.1</javax-money.version>
    <javax-portlet.version>2.0</javax-portlet.version>
    <javax-validation.version>1.1.0.Final</javax-validation.version>
    <javax-websocket.version>1.1</javax-websocket.version>
    <jbatch-tck.version>1.0</jbatch-tck.version>
    <jeromq.version>0.3.4</jeromq.version>
    <jettison.version>1.2</jettison.version>
    <jibx.version>1.2.6</jibx.version>
    <jline.version>2.14.4</jline.version>
    <jopt-simple.version>5.0.3</jopt-simple.version>
    <jredis.version>06052013</jredis.version>
    <jruby.version>1.7.27</jruby.version>
    <jsch.version>0.1.54</jsch.version>
    <jsr250.version>1.0</jsr250.version>
    <jxl.version>2.6.12</jxl.version>
    <kafka.version>0.8.2.2</kafka.version>
    <kite.version>0.13.0</kite.version>
    <kryo.version>3.0.3</kryo.version>
    <ldapbp.version>1.0</ldapbp.version>
    <ldapsdk.version>4.1</ldapsdk.version>
    <lettuce.version>3.5.0.Final</lettuce.version>
    <log4j.version>1.2.17</log4j.version>
    <myfaces.version>2.2.12</myfaces.version>
    <okhttp.version>2.7.5</okhttp.version>
    <okhttp3.version>3.3.1</okhttp3.version>
    <openhft-chronicle.version>3.4.4</openhft-chronicle.version>
    <openhft-lang.version>6.6.16</openhft-lang.version>
    <openjpa.version>2.4.2</openjpa.version>
    <neo4j.version>2.3.2</neo4j.version>
    <neo4j-cypher-dsl.version>2.0.1</neo4j-cypher-dsl.version>
    <neo4j-spatial.version>0.12-neo4j-2.0.1</neo4j-spatial.version>
    <netty.version>4.0.48.Final</netty.version>
    <objenesis.version>2.4</objenesis.version>
    <ognl.version>2.6.11</ognl.version>
    <openid4java.version>0.9.6</openid4java.version>
    <paho-mqttv3-client.version>1.1.1</paho-mqttv3-client.version>
    <pig.version>0.12.1</pig.version>
    <poi.version>3.14</poi.version>
    <protobuf.version>2.6.1</protobuf.version>
    <protobuf-java-format.version>1.4</protobuf-java-format.version>
    <quartz.version>2.2.3</quartz.version>
    <rabbit-amqp-client.version>3.6.6</rabbit-amqp-client.version>
    <rabbit-http-client.version>1.0.0.RELEASE</rabbit-http-client.version>
    <reactive-streams.version>1.0.0</reactive-streams.version>
    <rest-assured.version>2.9.0</rest-assured.version>
    <rometools.version>1.6.1</rometools.version>
    <selenium-htmlunit-driver.version>${selenium.version}</selenium-htmlunit-driver.version>
    <smack4.version>4.1.9</smack4.version>
    <snappy.version>1.1.2.6</snappy.version>
    <splunk.version>1.3.0</splunk.version>
    <spullara-redis.version>0.7</spullara-redis.version>
    <sun-facelets.version>1.1.14</sun-facelets.version>
    <sun-jsf.version>2.2.14</sun-jsf.version>
    <sun-saaj.version>1.3.28</sun-saaj.version>
    <taglibs-standard.version>1.2.5</taglibs-standard.version>
    <testng.version>6.9.10</testng.version>
    <threetenbp.version>1.3.5</threetenbp.version>
    <tiles.version>3.0.7</tiles.version>
    <tiles-request.version>1.0.6</tiles-request.version>
    <tyrus.version>1.3.5</tyrus.version>
    <typica.version>1.3</typica.version>
    <unboundid.version>3.1.1</unboundid.version>
    <velocity-tools-view.version>1.4</velocity-tools-view.version>
    <webjars-json-editor.version>0.7.21</webjars-json-editor.version>
    <websphere-uow.version>6.0.2.17</websphere-uow.version>
    <woodstox.version>4.4.1</woodstox.version>
    <wss4j.version>1.6.19</wss4j.version>
    <wss4j2.version>2.1.9</wss4j2.version>
    <xmlbeans.version>2.6.0</xmlbeans.version>
    <xmlschema.version>2.2.2</xmlschema.version>
    <xmlunit.version>1.6</xmlunit.version>
    <xom.version>1.2.5</xom.version>
    <xstream.version>1.4.10</xstream.version>
    <xws-security.version>3.0</xws-security.version>
    <yammer-metrics.version>2.2.0</yammer-metrics.version>
</properties>
```

* any list
{:toc}