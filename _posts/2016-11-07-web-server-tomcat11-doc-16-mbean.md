---
layout: post
title: web server apache tomcat11-16-mbean
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 前言

整理这个官方翻译的系列，原因是网上大部分的 tomcat 版本比较旧，此版本为 v11 最新的版本。

## 开源项目

> 从零手写实现 tomcat [minicat](https://github.com/houbb/minicat) 别称【嗅虎】心有猛虎，轻嗅蔷薇。

## 系列文章

[web server apache tomcat11-01-官方文档入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-01-intro)

[web server apache tomcat11-02-setup 启动](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-02-setup)

[web server apache tomcat11-03-deploy 如何部署](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-03-deploy)

[web server apache tomcat11-04-manager 如何管理？](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-04-manager)

[web server apache tomcat11-06-Host Manager App -- Text Interface](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-06-host-manager)

[web server apache tomcat11-07-Realm Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-07-relam)

[web server apache tomcat11-08-JNDI Resources](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-08-jndi)

[web server apache tomcat11-09-JNDI Datasource](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-09-jdbc-datasource)

[web server apache tomcat11-10-Class Loader](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-10-classloader-howto)

...

### 介绍

Tomcat 使用 JMX MBeans 技术来实现对 Tomcat 的可管理性。

Catalina 的 JMX MBeans 描述在每个包中的 mbeans-descriptors.xml 文件中。

您需要为自定义组件添加 MBean 描述，以避免出现 "ManagedBean is not found" 异常。

### 添加 MBean 描述

您也可以在与其描述的类文件相同的包中的 mbeans-descriptors.xml 文件中为自定义组件添加 MBean 描述。

mbeans-descriptors.xml 的允许语法由 DTD 文件定义。

自定义 LDAP 认证 Realm 的条目可能如下所示：

```xml
<mbean         name="LDAPRealm"
            className="org.apache.catalina.mbeans.ClassNameMBean"
          description="Custom LDAPRealm"
               domain="Catalina"
                group="Realm"
                 type="com.myfirm.mypackage.LDAPRealm">

    <attribute   name="className"
          description="Fully qualified class name of the managed object"
                 type="java.lang.String"
            writeable="false"/>

    <attribute   name="debug"
          description="The debugging detail level for this component"
                 type="int"/>
    .
    .
    .

  </mbean>
```



# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/proxy-howto.html

* any list
{:toc}