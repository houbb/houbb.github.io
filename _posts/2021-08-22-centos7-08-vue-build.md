---
layout: post
title: CentOS7 vue build 部署到 tomcat 实战笔记
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, maven, sh]
published: true
---


# 页面无法访问

## 现象

npm run build 之后，dist 包放在 tomcat 下面无法访问。

## 问题定位

（1）index.html 是否存在？

如果是/dist路径报错，打开dist文件夹看一下是不是有index.htmll文件，么有的话就需要改一下webpack.prod.config.js文件中的打包路径

（2）如果/dist不报错而其他的js、css文件报错，一般就是index.html中的引入的js、css文件路径错误。

我就是这个错误。

## 解决方案

这时候就需要将 `webpack.prod.config.js` 文件下的 publicPatch 为 `./`。

如果是用webpack创建的项目没有改过可能项目结构不太一样，那要改的就是config目录下的index.js中assetPublicPath的值为 `./`。

修改js、css路径然后重新打包部署。

放到 tomcat 下面，首页可以访问。


# 刷新 404

## 现象

一开始打开正常，但是刷新 404，访问其他页面也是 404。

## 粗暴解决方案

在 vue 的编译 dist 文件夹下在，新增 `WEB-INF` 并且创建 web.xml 内容如下

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://java.sun.com/xml/ns/javaee
                      http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
  version="3.0"
  metadata-complete="true">
 
  <display-name>Welcome to Tomcat</display-name>
  <description>
     Welcome to Tomcat
  </description>
    <error-page>
        <error-code>404</error-code>
        <location>/index.html</location>
    </error-page>
</web-app>
```

ps: 这里就是把 404 页面再跳转到 index.html。缺点是 console 依然会有 404 提示。

## 原因

VUE router 的history模式问题解答： https://router.vuejs.org/zh/guide/essentials/history-mode.html

在使用这个模式的时候，跳转的连接，直接刷新会提示找不到静态资源，所以要对这个进行兼容。 

兼容此问题用到tomcat的rewrite，具体解释详见： http://tomcat.apache.org/tomcat-8.5-doc/rewrite.html。

中文介绍（也可以使用谷歌翻译看原文档）： https://wiki.jikexueyuan.com/project/tomcat/rewrite.html

### 1-tomcat的rewrite介绍。

```
简介
   重写 Valve（Rewrite Valve） 实现 URL 重写功能的方式非常类似于 Apache HTTP Server 的 mod_rewrite 模块。

配置
   重写 Valve 是通过使用 org.apache.catalina.valves.rewrite.RewriteValve 类名来配置成 Valve 的。
   经过配置，重写 Valve 可以做为一个 Valve 添加到 Host 中。参考虚拟服务器文档来了解配置详情。该 Valve 使用包 
   含重写指令的 rewrite.config 文件，且必须放在 Host 配置文件夹中。
   另外，重写 valve 也可以用在 Web 应用的 context.xml 中。该 Valve 使用包含重写指令的 rewrite.config 文 
   件，且必须放在 Web 应用的 WEB-INF 文件夹中。
```

### 2-具体使用

2-1 如果将valve配置在HOST中，则rewrite.config文件必须放在Host配置文件夹中，示例如下：

编辑server.xml，在Host中增加RewriteValve



# 后端启动报错

## class 缺失

### 现象

springboot 直接启动正常，放在 tomcat 中启动报错。

日志如下：

```
Caused by: java.lang.NoClassDefFoundError: org/w3c/dom/ElementTraversal
                at java.lang.ClassLoader.defineClass1(Native Method)
                at java.lang.ClassLoader.defineClass(ClassLoader.java:763)
                at java.security.SecureClassLoader.defineClass(SecureClassLoader.java:142)
                at org.apache.catalina.loader.WebappClassLoaderBase.findClassInternal(WebappClassLoaderBase.java:2484)
                at org.apache.catalina.loader.WebappClassLoaderBase.findClass(WebappClassLoaderBase.java:876)
                at org.apache.catalina.loader.WebappClassLoaderBase.loadClass(WebappClassLoaderBase.java:1379)
                at org.apache.catalina.loader.WebappClassLoaderBase.loadClass(WebappClassLoaderBase.java:1223)
                at org.apache.xerces.parsers.AbstractDOMParser.startDocument(Unknown Source)
                at org.apache.xerces.impl.dtd.XMLDTDValidator.startDocument(Unknown Source)
                at org.apache.xerces.impl.XMLDocumentScannerImpl.startEntity(Unknown Source)
                at org.apache.xerces.impl.XMLVersionDetector.startDocumentParsing(Unknown Source)
                at org.apache.xerces.parsers.XML11Configuration.parse(Unknown Source)
                at org.apache.xerces.parsers.XML11Configuration.parse(Unknown Source)
                at org.apache.xerces.parsers.XMLParser.parse(Unknown Source)
                at org.apache.xerces.parsers.DOMParser.parse(Unknown Source)
                at org.apache.xerces.jaxp.DocumentBuilderImpl.parse(Unknown Source)
                at org.apache.ibatis.parsing.XPathParser.createDocument(XPathParser.java:257)
                at org.apache.ibatis.parsing.XPathParser.<init>(XPathParser.java:125)
                at org.apache.ibatis.builder.xml.XMLMapperBuilder.<init>(XMLMapperBuilder.java:78)
                at com.baomidou.mybatisplus.spring.MybatisSqlSessionFactoryBean.buildSqlSessionFactory(MybatisSqlSessionFactoryBean.java:581)
                at com.baomidou.mybatisplus.spring.MybatisSqlSessionFactoryBean.afterPropertiesSet(MybatisSqlSessionFactoryBean.java:385)
                at com.baomidou.mybatisplus.spring.MybatisSqlSessionFactoryBean.getObject(MybatisSqlSessionFactoryBean.java:608)
                at com.github.houbb.ums.server.dal.config.DatasourceConfig.mySqlSessionFactory(DatasourceConfig.java:72)
                at com.github.houbb.ums.server.dal.config.DatasourceConfig$$EnhancerBySpringCGLIB$$7b84a5eb.CGLIB$mySqlSessionFactory$1(<generated>)
                at com.github.houbb.ums.server.dal.config.DatasourceConfig$$EnhancerBySpringCGLIB$$7b84a5eb$$FastClassBySpringCGLIB$$e95bf017.invoke(<generated>)
                at org.springframework.cglib.proxy.MethodProxy.invokeSuper(MethodProxy.java:228)
                at org.springframework.context.annotation.ConfigurationClassEnhancer$BeanMethodInterceptor.intercept(ConfigurationClassEnhancer.java:358)
                at com.github.houbb.ums.server.dal.config.DatasourceConfig$$EnhancerBySpringCGLIB$$7b84a5eb.mySqlSessionFactory(<generated>)
                at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
                at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
                at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
                at java.lang.reflect.Method.invoke(Method.java:498)
                at org.springframework.beans.factory.support.SimpleInstantiationStrategy.instantiate(SimpleInstantiationStrategy.java:162)
                ... 125 more
        Caused by: java.lang.ClassNotFoundException: org.w3c.dom.ElementTraversal
                at org.apache.catalina.loader.WebappClassLoaderBase.loadClass(WebappClassLoaderBase.java:1415)
                at org.apache.catalina.loader.WebappClassLoaderBase.loadClass(WebappClassLoaderBase.java:1223)
```

### 解决方案

```xml
<dependency>
    <groupId>xml-apis</groupId>
    <artifactId>xml-apis</artifactId>
    <version>1.4.01</version>
</dependency>
```

## 启动报错

### 报错信息

```
Caused by: java.lang.IllegalStateException: Logback configuration error detected:                                                                                                                                                             
ERROR in ch.qos.logback.core.rolling.RollingFileAppender[SQL-APPENDER] - Failed to create parent directories for [/app/ums-server/logs/VM-12-8-centos_sql.2021-12-20-0.log]                                                                   
ERROR in ch.qos.logback.core.rolling.RollingFileAppender[SQL-APPENDER] - openFile(null,true) call failed. java.io.FileNotFoundException: /app/ums-server/logs/VM-12-8-centos_sql.2021-12-20-0.log (No such file or directory)                 
ERROR in ch.qos.logback.core.rolling.RollingFileAppender[APPLICATION-APPENDER] - Failed to create parent directories for [/app/ums-server/logs/VM-12-8-centos_application.2021-12-20-0.log]                                                   
ERROR in ch.qos.logback.core.rolling.RollingFileAppender[APPLICATION-APPENDER] - openFile(null,true) call failed. java.io.FileNotFoundException: /app/ums-server/logs/VM-12-8-centos_application.2021-12-20-0.log (No such file or directory) 
ERROR in ch.qos.logback.core.rolling.RollingFileAppender[SATURN-APPENDER] - Failed to create parent directories for [/app/ums-server/logs/VM-12-8-centos_saturn.2021-12-20-0.log]                                                             
ERROR in ch.qos.logback.core.rolling.RollingFileAppender[SATURN-APPENDER] - openFile(null,true) call failed. java.io.FileNotFoundException: /app/ums-server/logs/VM-12-8-centos_saturn.2021-12-20-0.log (No such file or directory)           
ERROR in ch.qos.logback.core.rolling.RollingFileAppender[THIRD-PARTY-APPENDER] - Failed to create parent directories for [/app/ums-server/logs/VM-12-8-centos_3rd-party.2021-12-20-0.log]                                                     
ERROR in ch.qos.logback.core.rolling.RollingFileAppender[THIRD-PARTY-APPENDER] - openFile(null,true) call failed. java.io.FileNotFoundException: /app/ums-server/logs/VM-12-8-centos_3rd-party.2021-12-20-0.log (No such file or directory)   
        at org.springframework.boot.logging.logback.LogbackLoggingSystem.loadConfiguration(LogbackLoggingSystem.java:162)                                                                                                                     
```

### 解决方案(无效)

创建一下对应的文件。

```
mkdir app
cd app
mkdir ums-server
cd ums-server
mkdir logs
```

ps: 后来发现还是不行。本质上是权限不足导致的。

### 权限

错误原因：用户权限不够，无法写入日志内容。

解决方案：由于项目是在云服务器Tomcat上部署的，所以我们要以root权限去开启tomcat。以root身份连接服务器，然后到你Tomcat所在的bin目录，执行下面这行代码：

```
nohup ./startup.sh &
```

我们像这样挂住进程启动Tomcat，才能保证当关掉服务器连接时不停止服务。附上停止Tomcat服务命令：./shutdown.sh


### 调整文件夹的权限组

```
[root@VM-12-8-centos logs]# ll
total 4
drwxrwxrwx 2 root root 4096 Dec 20 23:50 ums-server
[root@VM-12-8-centos logs]# chown tomcat:tomcat ums-server/
[root@VM-12-8-centos logs]# ll
total 4
drwxrwxrwx 2 tomcat tomcat 4096 Dec 20 23:50 ums-server
```

一开始是 root，调整为 tomcat。

需要把 /root/logs/ums-server 中 root logs  ums-server 都调整为 tomcat 分组。

解决。

### 解决方案2

有 2 种方式：

（1）调整日志路径为公共的有权限的路径

（2）为当前应用执行时，设置对应的权限。

此处选择方案 1，比较简单。

----------------------------

tomcat 启动报catalina.out: Permission denied 说的的意思是 Tomcat系统记录日志的catalina.out当前操作用户对它没有可操作权限，网上很多说

进入到tomat的目录中，找到有logs文件夹的目录，执行下面命令。意思就是改变logs文件夹的权限，使tomcat可以有权限访问此文件夹。

日志文件夹根目录为：`/root/logs/ums-server`

```
$   cd /root/logs
$   sudo chmod a+rwx -R ums-server
```

----------------------------

发现还是不行。


# 80 报错

## 现象

```
.BindException: Permission denied (Bind failed) <null>:80
```

## 原因

tomcat 启动的权限不足。

```
# Systemd unit file for default tomcat
#
# To create clones of this service:
# DO NOTHING, use tomcat@.service instead.

[Unit]
Description=Apache Tomcat Web Application Container
After=syslog.target network.target

[Service]
Type=simple
EnvironmentFile=/etc/tomcat/tomcat.conf
Environment="NAME="
EnvironmentFile=-/etc/sysconfig/tomcat
ExecStart=/usr/libexec/tomcat/server start
SuccessExitStatus=143
User=tomcat

[Install]
WantedBy=multi-user.target
```

## 解决办法

```
vi /lib/systemd/system/tomcat.service
```

（1）把 user 调整为 root。

```
# Systemd unit file for default tomcat
#
# To create clones of this service:
# DO NOTHING, use tomcat@.service instead.

[Unit]
Description=Apache Tomcat Web Application Container
After=syslog.target network.target

[Service]
Type=simple
EnvironmentFile=/etc/tomcat/tomcat.conf
Environment="NAME="
EnvironmentFile=-/etc/sysconfig/tomcat
ExecStart=/usr/libexec/tomcat/server start
SuccessExitStatus=143
User=root
Group=root

[Install]
WantedBy=multi-user.target
```


配置刷新：

```
$  systemctl daemon-reload
```

（2）重新启动。

```
systemctl restart tomcat
```

ps: 改成 80 如果使用域名访问，就必须备案。

# 参考资料

[webpack打包的vue项目部署在tomcat，页面不能加载的问题](https://blog.csdn.net/weixin_43331469/article/details/88583794)

[前端vue项目部署到tomcat，一刷新报错404解决方法](https://blog.csdn.net/mjhfavourite/article/details/106189337)

[Vue打包发布到Tomcat后，刷新报错404解决方法](https://www.javazxz.com/thread-12879-1-1.html)

[前端vue项目部署到tomcat，一刷新报错404解决方法](https://www.cnblogs.com/chenzhazha/p/10196590.html)

[Linux Centos7新装tomcat 启动./startup.sh报Permission denied详解](https://blog.csdn.net/weixin_42209368/article/details/103050182)

[tomcat 启动报catalina.out: Permission denied 异常解决思路总结【针对的是mac电脑】](https://blog.csdn.net/qq_35661171/article/details/110873448)

[openFile(null,true) call failed. java.io.FileNotFoundException: /data/logs(Permission denied)](https://blog.csdn.net/weixin_43899542/article/details/106593949)

https://blog.csdn.net/qq_34103387/article/details/114436718

[centos普通用户修改文件权限_每天学点之CentOS文件/目录的权限](https://blog.csdn.net/weixin_36033516/article/details/112313080)

[Tomcat无法使用80端口：Permission denied (Bind failed) <null>:80](https://blog.csdn.net/qq_37969433/article/details/104045322)

* any list
{:toc}