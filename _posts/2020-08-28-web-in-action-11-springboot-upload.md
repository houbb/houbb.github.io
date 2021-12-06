---
layout: post
title:  web 实战-10-springboot CommonsMultipartResolver 实现文件上传
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 后续-文件编码错误

后来发现只是文件名称对了，但是内容不对。

本质上还是说本来是 utf8 的字节流，被强制转换成了 iso 编码。

## 源码分析

默认 springboot 的文件上传使用的是 CommonsFileUploadSupport 类。

这里有一段关于编码的内容：

```java
protected String getDefaultEncoding() {
	String encoding = getFileUpload().getHeaderEncoding();
	if (encoding == null) {
		encoding = WebUtils.DEFAULT_CHARACTER_ENCODING;     //ISO-8859-1
	}
	return encoding;
}
```

所以我们需要修改默认的编码形式。

## 配置

我们自定义自己的实现类，而不是完全使用 sprign 默认的。

```java
@Bean
public CommonsMultipartResolver commonsMultipartResolver() {
    CommonsMultipartResolver resolver = new CommonsMultipartResolver();
    resolver.setDefaultEncoding(Constants.UTF_8);
    resolver.setMaxUploadSize(500 * 1024 * 1024);
    resolver.setMaxUploadSizePerFile(100 * 1024* 1024);
    resolver.setMaxInMemorySize(100 * 1024 * 1024);
    return resolver;
}
```

### 大小设置

```java
@Bean
public MultipartConfigElement multipartConfigElement() {
     MultipartConfigFactory factory = new MultipartConfigFactory();
     factory.setMaxFileSize("100MB");
     factory.setMaxRequestSize("100MB");
     return factory.createMultipartConfig();

}
```

### 使用注意点

这个 https://developer.jboss.org/thread/252840 的报错和我遇到的很类似。

他说的解决方案竟然是：

```java
@Bean
public MultipartConfigElement multipartConfigElement() {

     MultipartConfigFactory factory = new MultipartConfigFactory();
     factory.setMaxFileSize("100MB");
     factory.setMaxRequestSize("100MB");
     return factory.createMultipartConfig();

}
```

但是我如果同时配置 MultipartConfigElement & CommonsMultipartResolver 会报错找不到 file 信息，类似下面的文章。

[Spring Boot中同时配置 MultipartConfigElement 和 CommonsMultipartResolver 文件上传会失败](https://zhuanlan.zhihu.com/p/36108966)

（1）不可同时配置 MultipartConfigElement 和 CommonsMultipartResolver

（2）如果使用默认的 MultipartResolver（即使用Spring boot的自动配置），那么可以

在 application.properties或者使用 MultipartConfigElement 改变一些属性（如最大上传文件大小）

（3）如果自定义使用 CommonsMultipartResolver，可以直接指定其属性（内部是 FileUpload）


-----

当然，这个最好和 commons-upload 结合使用。

```xml
<dependency>
    <groupId>commons-fileupload</groupId>
    <artifactId>commons-fileupload</artifactId>
    <version>1.4</version>
</dependency>
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.2</version>
</dependency>
```

## 其他配置

注意，此时应该把 springboot 默认的 `StandardServletMultipartResolver` 实现关闭。

```java
@SpringBootApplication(exclude = {MultipartAutoConfiguration.class})
public class BootApplication extends SpringBootServletInitializer {
```

- application.properties

```
# 文件配置
spring.servlet.multipart.enabled=false
spring.http.multipart.max-request-size=50MB
spring.http.multipart.max-file-size=50MB
```

# 版本问题

今天把Spring boot版本升级到了2.0后，发现原来的文件上传大小限制设置不起作用了，原来的application.properties设置如下：

```
spring.http.multipart.max-file-size=100mb
spring.http.multipart.max-request-size=1000mb
```

Spring boot2.0的设置如下：

```
#设置上传APP的大小限制
spring.servlet.multipart.max-file-size=100Mb
spring.servlet.multipart.max-request-size=100Mb
```


# jboss 文件大小限制

## 说明

```
11:05:40,526 INFO  [stdout] (default task-13) Caused by: org.apache.commons.fileupload.FileUploadException: UT000020: Connection terminated as request was larger than 10485760
11:05:40,526 INFO  [stdout] (default task-13)   at org.apache.commons.fileupload.FileUploadBase.parseRequest(FileUploadBase.java:361)
11:05:40,526 INFO  [stdout] (default task-13)   at org.apache.commons.fileupload.servlet.ServletFileUpload.parseRequest(ServletFileUpload.java:113)
11:05:40,526 INFO  [stdout] (default task-13)   at org.springframework.web.multipart.commons.CommonsMultipartResolver.parseRequest(CommonsMultipartResolver.java:159)
11:05:40,526 INFO  [stdout] (default task-13)   ... 86 common frames omitted
11:05:40,526 INFO  [stdout] (default task-13) Caused by: java.io.IOException: UT000020: Connection terminated as request was larger than 10485760
11:05:40,526 INFO  [stdout] (default task-13)   at io.undertow.conduits.FixedLengthStreamSourceConduit.checkMaxSize(FixedLengthStreamSourceConduit.java:168)
11:05:40,526 INFO  [stdout] (default task-13)   at io.undertow.conduits.FixedLengthStreamSourceConduit.read(FixedLengthStreamSourceConduit.java:229)
11:05:40,526 INFO  [stdout] (default task-13)   at org.xnio.conduits.ConduitStreamSourceChannel.read(ConduitStreamSourceChannel.java:127)
11:05:40,526 INFO  [stdout] (default task-13)   at io.undertow.channels.DetachableStreamSourceChannel.read(DetachableStreamSourceChannel.java:209)
11:05:40,526 INFO  [stdout] (default task-13)   at io.undertow.server.HttpServerExchange$ReadDispatchChannel.read(HttpServerExchange.java:2265)
11:05:40,526 INFO  [stdout] (default task-13)   at org.xnio.channels.Channels.readBlocking(Channels.java:294)
11:05:40,526 INFO  [stdout] (default task-13)   at io.undertow.servlet.spec.ServletInputStreamImpl.readIntoBuffer(ServletInputStreamImpl.java:168)
11:05:40,526 INFO  [stdout] (default task-13)   at io.undertow.servlet.spec.ServletInputStreamImpl.read(ServletInputStreamImpl.java:144)
11:05:40,526 INFO  [stdout] (default task-13)   at java.io.FilterInputStream.read(FilterInputStream.java:133)
```

应该是 Jboss 的限制导致的。

## 问题说明

搜索资料后发现**jboss默认post请求最多只可以携带10M的数据**，更改jboss的配置，修改post提交数据最大限制即可解决问题。

## 解决方案

修改步骤如下：

路径：wildfly-10.1.0.Final-thirdParty\standalone\configuration\standalone.xml

```
将此处
<http-listener name="default" socket-binding="http" redirect-socket="https" enable-http2="true"/>

修改为
<http-listener name="default" socket-binding="http" max-post-size="104857600" redirect-socket="https" enable-http2="true"/>
```

当然，也可以使用 shell 命令修改：

```xml
sed -i 's/\(http-listener.*\)\//\1\ max-post-size=\"59715200\"\//g' standalone.xml
```

# 参考资料

[SpringBoot设置文件上传大小限制--默认为1M](https://www.cnblogs.com/yysbolg/p/10621610.html)

https://developer.jboss.org/thread/252840

[Connection terminated as request was larger than 10485760.](https://blog.csdn.net/weixin_50678918/article/details/114384081)

[jboss 的文件大小限制](https://blog.csdn.net/gill__hong/article/details/106122386)

[Undertow文件上传10M以上抛异常UT000020: Connection terminated as request was larger than 10485760](https://blog.csdn.net/bufegar0/article/details/114649399)

[Spring Boot中同时配置MultipartConfigElement和CommonsMultipartResolver文件上传会失败](https://zhuanlan.zhihu.com/p/36108966)

[SpringBoot中的multipartResolver上传文件配置](https://www.jb51.net/article/226322.htm)

[springboot使用CommonsMultipartResolver上传报错java.lang.ClassCastException](https://www.cnblogs.com/xy80hou/p/14011349.html)

/**
*
* https://blog.csdn.net/weixin_42733631/article/details/112600786
* https://www.cnblogs.com/charlypage/p/9858676.html
* https://blog.csdn.net/qq_36907589/article/details/108516431
*
* [springBoot设置文件上传大小限制](https://blog.csdn.net/AIfurture/article/details/101421576)
*
* https://www.cnblogs.com/xy80hou/p/14011349.html
* @return this
*/

https://blog.csdn.net/qq_33243189/article/details/89631495


* any list
{:toc}