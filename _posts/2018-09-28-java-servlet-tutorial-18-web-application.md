---
layout: post
title: Java Servlet 教程-18-web application 应用部署
date:  2018-10-07 09:21:50 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-18-web application 应用部署
---

# war 包

Jar、war、EAR、在文件结构上，三者并没有什么不同，它们都采用zip或jar档案文件压缩格式。

## Jar

Jar文件（扩展名为. Jar，Java Application Archive）包含Java类的普通库、资源（resources）、辅助文件（auxiliary files）等

## War

War文件（扩展名为.War,Web Application Archive）包含全部Web应用程序。

在这种情形下，一个Web应用程序被定义为单独的一组文件、类和资源，用户可以对jar文件进行封装，并把它作为小型服务程序（servlet）来访问。

## Ear

Ear文件（扩展名为.Ear,Enterprise Application Archive）包含全部企业应用程序。

在这种情形下，一个企业应用程序被定义为多个jar文件、资源、类和Web应用程序的集合。

每一种文件（.jar, .war, .ear）只能由应用服务器（application servers）、小型服务程序容器（servlet containers）、EJB容器（EJB containers）等进行处理。

# 设置欢迎界面

## 设置方式

- web.xml

在 web.xml 文件中设置如下内容：

```xml
<welcome-file-list>
    <welcome-file>index.html</welcome-file>
    <welcome-file>default.jsp</welcome-file>
</welcome-file-list>
```

这里会根据用户请求的 servlet 不同，去匹配对应目录最近的一个欢迎页面。

匹配的时候，会依次按照我们定义的欢迎页面顺序。


# servlet 映射

## 匹配通配符 *

1. 同一个Servlet可以被映射到多个URL上，即多个 servlet-mapping 元素的 servlet-name 子元素的设置值可以是同一个Servlet的注册名。    

2. 在Servlet映射到的URL中可以使用 `*` 通配符，但是只能有两种固定的格式：一种格式是 `*.扩展名`，另一种格式是`/*`。

比如：

```
<url-pattern>*.do</url-pattern>
```

```
<url-pattern>/action/*</url-pattern>
```

## servlet容器对url的匹配过程

一个请求发送到 servlet 容器，servlet 容器会将当前请求的 url 路径减去 协议、端口号、contextPath，剩下 servletPath 就是用来做 url-pattern 映射的部分。

如：http://www.myserver.com:8080/mall/myservlet/productinfo?id=1

```
http: 传输协议

www.myserver.com: 主机地址

8080: 端口号

mall: contextPath

myservlet/productinfo: servletPath

id=1: 参数
```

所以要做 url-pattern 映射的部分就是 "myservlet/productinfo" 部分。

映射匹配过程的顺序为，有且当有一个servlet匹配成功以后，就不会去理会剩下的servlet了（和filter不同）。

其匹配规则和顺序如下： 

### 1.精确路径匹配。

例子：比如servletA 的 url-pattern为 /test，servletB的url-pattern为 /*

这个时候，如果我访问的url为http://www.myserver.com:8080/test ，这个时候容器就会先进行精确路径匹配，发现/test正好被servletA精确匹配，那么就去调用servletA，也不会去理会servletB了。   

### 2.最长路径匹配。

例子：servletA的url-pattern为/test/*，而servletB的url-pattern为/test/a/*，

此时访问http://www.myserver.com:8080/test/a时，     

容器会选择路径最长的servlet来匹配，也就是这里的servletB。    

### 3.扩展匹配

如果url最后一段包含扩展，容器将会根据扩展选择合适的servlet。

例子：servletA的url-pattern：*.action    

### 默认

4.如果前面三条规则都没有匹配到servlet，如果应用定义了一个default servlet，则容器会将请求丢给default servlet。      

根据这个规则表，就能很清楚的知道servlet的匹配过程，所以定义servlet的时候也要考虑url-pattern的写法，以免出错。      

## filter 处理过程

对于filter，不会像servlet那样只匹配一个servlet，因为filter的集合是一个链，所以只会有处理的顺序不同，而不会出现只选择一个filter。

Filter的处理顺序和filter-mapping在web.xml中定义的顺序相同。 

## 其他

在web.xml文件中，以下语法用于定义映射：    

1. 以 `/` 开头和以 `/*` 结尾的是用来做路径映射的。   

2. 以前缀 `*.` 开头的是用来做扩展映射的。    

3. `/` 是用来定义 default servlet 映射的。    

4. 剩下的都是用来定义详细映射的。比如： /aa/bb/cc.action    

所以，为什么定义 `/*.action` 这样一个看起来很正常的匹配在启动tomcat时会报错？

因为这个匹配即属于路径映射，也属于扩展映射，导致容器无法判断。

# servlet 初始化

- web.xml

我们可以通过 load-on-startup 的指定非负值让 servlet 在应用部署时(或者服务重启时)加载此 servlet。


```xml
<servlet>
    <servlet-name>hello</servlet-name>
    <servlet-class>com.github.houbb.servlet.learn.base.hello.Hello</servlet-class>
    <load-on-startup>1</load-on-startup>
</servlet>
```

## 加载顺序

多个 serlet 值不同，则值越大的越靠后加载。

多个 servlet 值相同，则按照声明的顺序加载。

# 参考资料

[web application](https://github.com/waylau/servlet-3.1-specification/tree/master/docs/Web%20Applications)

[部署描述符](https://github.com/waylau/servlet-3.1-specification/tree/master/docs/Deployment%20Descriptor)

《Head First Servlet & JSP》

- war

https://www.jianshu.com/p/ad644c5b6426

https://www.zhihu.com/question/22129866

https://blog.csdn.net/u012110719/article/details/44260417

https://blog.csdn.net/lishehe/article/details/41607725

- servlet 映射

https://blog.csdn.net/xh16319/article/details/8014107

https://blog.csdn.net/zhuboming/article/details/79627445

* any list
{:toc}