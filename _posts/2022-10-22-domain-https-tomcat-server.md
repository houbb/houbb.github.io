---
layout: post
title: tomcat 配置文件 server.xml 解释
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, tomcat, sh]
published: true
---

# server.xml

默认版本：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
  Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<!-- Note:  A "Server" is not itself a "Container", so you may not
     define subcomponents such as "Valves" at this level.
     Documentation at /docs/config/server.html
 -->
<Server port="8005" shutdown="SHUTDOWN">
  <Listener className="org.apache.catalina.startup.VersionLoggerListener" />
  <!-- Security listener. Documentation at /docs/config/listeners.html
  <Listener className="org.apache.catalina.security.SecurityListener" />
  -->
  <!-- APR library loader. Documentation at /docs/apr.html -->
  <Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />
  <!-- Prevent memory leaks due to use of particular java/javax APIs-->
  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />
  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />
  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener" />

  <!-- Global JNDI resources
       Documentation at /docs/jndi-resources-howto.html
  -->
  <GlobalNamingResources>
    <!-- Editable user database that can also be used by
         UserDatabaseRealm to authenticate users
    -->
    <Resource name="UserDatabase" auth="Container"
              type="org.apache.catalina.UserDatabase"
              description="User database that can be updated and saved"
              factory="org.apache.catalina.users.MemoryUserDatabaseFactory"
              pathname="conf/tomcat-users.xml" />
  </GlobalNamingResources>

  <!-- A "Service" is a collection of one or more "Connectors" that share
       a single "Container" Note:  A "Service" is not itself a "Container",
       so you may not define subcomponents such as "Valves" at this level.
       Documentation at /docs/config/service.html
   -->
  <Service name="Catalina">

    <!--The connectors can use a shared executor, you can define one or more named thread pools-->
    <!--
    <Executor name="tomcatThreadPool" namePrefix="catalina-exec-"
        maxThreads="150" minSpareThreads="4"/>
    -->


    <!-- A "Connector" represents an endpoint by which requests are received
         and responses are returned. Documentation at :
         Java HTTP Connector: /docs/config/http.html
         Java AJP  Connector: /docs/config/ajp.html
         APR (HTTP/AJP) Connector: /docs/apr.html
         Define a non-SSL/TLS HTTP/1.1 Connector on port 8080
    -->
    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />
    <!-- A "Connector" using the shared thread pool-->
    <!--
    <Connector executor="tomcatThreadPool"
               port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />
    -->
    <!-- Define an SSL/TLS HTTP/1.1 Connector on port 8443
         This connector uses the NIO implementation. The default
         SSLImplementation will depend on the presence of the APR/native
         library and the useOpenSSL attribute of the
         AprLifecycleListener.
         Either JSSE or OpenSSL style configuration may be used regardless of
         the SSLImplementation selected. JSSE style configuration is used below.
    -->
    <!--
    <Connector port="8443" protocol="org.apache.coyote.http11.Http11NioProtocol"
               maxThreads="150" SSLEnabled="true">
        <SSLHostConfig>
            <Certificate certificateKeystoreFile="conf/localhost-rsa.jks"
                         type="RSA" />
        </SSLHostConfig>
    </Connector>
    -->
    <!-- Define an SSL/TLS HTTP/1.1 Connector on port 8443 with HTTP/2
         This connector uses the APR/native implementation which always uses
         OpenSSL for TLS.
         Either JSSE or OpenSSL style configuration may be used. OpenSSL style
         configuration is used below.
    -->
    <!--
    <Connector port="8443" protocol="org.apache.coyote.http11.Http11AprProtocol"
               maxThreads="150" SSLEnabled="true" >
        <UpgradeProtocol className="org.apache.coyote.http2.Http2Protocol" />
        <SSLHostConfig>
            <Certificate certificateKeyFile="conf/localhost-rsa-key.pem"
                         certificateFile="conf/localhost-rsa-cert.pem"
                         certificateChainFile="conf/localhost-rsa-chain.pem"
                         type="RSA" />
        </SSLHostConfig>
    </Connector>
    -->

    <!-- Define an AJP 1.3 Connector on port 8009 -->
    <!--
    <Connector protocol="AJP/1.3"
               address="::1"
               port="8009"
               redirectPort="8443" />
    -->

    <!-- An Engine represents the entry point (within Catalina) that processes
         every request.  The Engine implementation for Tomcat stand alone
         analyzes the HTTP headers included with the request, and passes them
         on to the appropriate Host (virtual host).
         Documentation at /docs/config/engine.html -->

    <!-- You should set jvmRoute to support load-balancing via AJP ie :
    <Engine name="Catalina" defaultHost="localhost" jvmRoute="jvm1">
    -->
    <Engine name="Catalina" defaultHost="localhost">

      <!--For clustering, please take a look at documentation at:
          /docs/cluster-howto.html  (simple how to)
          /docs/config/cluster.html (reference documentation) -->
      <!--
      <Cluster className="org.apache.catalina.ha.tcp.SimpleTcpCluster"/>
      -->

      <!-- Use the LockOutRealm to prevent attempts to guess user passwords
           via a brute-force attack -->
      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <!-- This Realm uses the UserDatabase configured in the global JNDI
             resources under the key "UserDatabase".  Any edits
             that are performed against this UserDatabase are immediately
             available for use by the Realm.  -->
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
               resourceName="UserDatabase"/>
      </Realm>

      <Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">

        <!-- SingleSignOn valve, share authentication between web applications
             Documentation at: /docs/config/valve.html -->
        <!--
        <Valve className="org.apache.catalina.authenticator.SingleSignOn" />
        -->

        <!-- Access log processes all example.
             Documentation at: /docs/config/valve.html
             Note: The pattern used is equivalent to using pattern="common" -->
        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log" suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot; %s %b" />

      </Host>
    </Engine>
  </Service>
</Server>
```

## 添加 SSL 的简化版本

移除注释，并且新增一个 SSL 的连接器。

```xml
<?xml version="1.0" encoding="UTF-8"?>

<Server port="8005" shutdown="SHUTDOWN">
  <Listener className="org.apache.catalina.startup.VersionLoggerListener" />
  <Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />
  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />
  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />
  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener" />

  <GlobalNamingResources>
    <Resource name="UserDatabase" auth="Container"
              type="org.apache.catalina.UserDatabase"
              description="User database that can be updated and saved"
              factory="org.apache.catalina.users.MemoryUserDatabaseFactory"
              pathname="conf/tomcat-users.xml" />
  </GlobalNamingResources>

  <Service name="Catalina">
    <Connector port="80" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="443" />

    <Connector port="443" protocol="org.apache.coyote.http11.Http11Protocol" 
      URIEncoding="UTF-8" maxThreads="150" SSLEnabled="true" 
      scheme="https" secure="true" clientAuth="false" 
      sslProtocol="TLS" 
      keystoreFile="/etc/letsencrypt/live/chisha.one/MyDSKeyStore.jks" 
      keystorePass="123456" 
      keyAlias="tomcat" 
      keyPass="123456"/>

    <Engine name="Catalina" defaultHost="localhost">
      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
               resourceName="UserDatabase"/>
      </Realm>

      <Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">
        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log" suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot; %s %b" />
      </Host>
    </Engine>
  </Service>
</Server>
```


# tomcat 配置文件

在理解Tomcat配置之前，需要先熟悉一下Tomcat的架构，便于更好的修改配置。

## 一、Tomcat 结构

![Tomcat 结构](https://img-blog.csdnimg.cn/img_convert/4a63a2f95e91ae15928f80e3f989b9e9.png)

server：即服务器，每个tomcat程序启动后，就是一个server。

service：这是一种抽象的服务，通常是在日志或者管理时使用这样一个概念。它把连接器和处理引擎结合在一起。

connector：用于处理连接和并发，通常包括两种方式HTTP和AJP。HTTP是用于网页地址栏http这种访问方式；AJP一般用于搭配Apache服务器。

engine：处理引擎，所有的请求都是通过处理引擎处理的。

host：虚拟主机，用于进行请求的映射处理。每个虚拟主机可以看做独立的请求文件。

realm：用于配置安全管理角色，通常读取tomcat-uesrs.xml进行验证。

context：上下文，对应于web应用

组件之间的整体关系，总结如下：

一个Server元素中可以有一个或多个Service元素。

一个Service可以包含多个Connector，但是只能包含一个Engine；Connector接收请求，Engine处理请求。

Engine、Host和Context都是容器，且 Engine包含一个或者多个Host。

Host包含零个或多个Context。每个Host组件代表Engine中的一个虚拟主机；

Valve、Realm可以嵌入在Host/Engine/Context元素内。

## Tomcat 目录

![Tomcat 目录](https://img-blog.csdnimg.cn/img_convert/e479cd23290f2f9f1aa366bf15513c6c.png)

## Server.xml 配置

### Server 节点

```xml
<Server port="8005" shutdown="SHUTDOWN">
```

|  属性 | 描述 | 
|:---|:---|
| className | 要使用的java 类名 |
| address | 服务器等待接收shutdown 命令的地址,默认localhost |
| port | 接收shutdown命令的端口，设置为-1 为禁用关闭端口，也就是你不能通过这种方式来关闭了,这样就会影响你使用脚本(catalina.sh 或者是shutdown.sh)来stop了，默认绑定8005端口 |
| shutdown | 指定shutdown 命令的别名,默认值SHUTDOWN |

### Service 节点

```xml
<Service name="Catalina">
```

|  属性 | 描述 | 
|:---|:---|
| className | 要使用的java 类名 |
| address | 服务器等待接收shutdown 命令的地址,默认localhost |

### Connector 节点

```xml
<Connector port="8080" protocol="HTTP/1.1" maxHttpHeaderSize="409600" connectionTimeout="20000" redirectPort="8443" />
```

当前以下所有的说明是针对 tomcat 8.5 版本来说的，其他版本详情见官方文档。

|  属性 | 描述 |  例子 |
|:---|:---|:----|
| port | 绑定的端口,如果设置为0，tomcat则随机获取一个空闲端口 | 默认 port="8080" |
| protocol | 传输协议和版本 |  默认 protocol = "HTTP/1.1" |
| redirectPort | 接收到的ssl请求后重定向的端口 |  默认 redirectPort="8443" |
| connectionTimeout | 连接超时时间，单位毫秒 |  默认 connectionTimeout="20000" |
| maxThreads | tomcat能创建来处理请求的最大线程数，也为最大并发数 超过则放入请求队列中进行排队，默认值为200；需要根据业务和系统性能进行调整 | maxThreads="1000" |
| URIEncoding | url的字符编码 | URIEncoding="UTF-8" |
| minProcessors | 启动时创建的线程数（最小线程数） | minProcessors="50" |



# 参考资料

[Tomcat Server.xml 配置详解](https://blog.csdn.net/Firstlucky77/article/details/124720089)

* any list
{:toc}