---
layout: post
title: web server apache tomcat11-16-mbean
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---


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