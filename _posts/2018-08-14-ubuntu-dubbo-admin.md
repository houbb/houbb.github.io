---
layout: post
title:  Ubuntu Dubbo admin
date:  2018-08-14 13:46:27 +0800
categories: [Ubuntu]
tags: [ubuntu, dubbo]
published: true
---

* any list
{:toc}

# download

```
$   scp dubbo-admin-2.5.4-SNAPSHOT.war hbb@192.168.2.108:/home/hbb/tool/dubbo-admin/
```

## 失败的尝试

主要失败点: 和已有的 jenkins 有冲突。如果没有其他war,这个就够了。

- copy to tomcat

```
$   cp dubbo-admin-2.5.4-SNAPSHOT.war ~/tool/tomcat/tomcat9/webapps/
```

path and content in **webapps**

```
$ ls
dubbo-admin-2.5.4-SNAPSHOT  dubbo-admin-2.5.4-SNAPSHOT.war  ROOT  ROOT.war
$ pwd
/home/hbb/tool/tomcat/tomcat9/webapps
```

- config ```server.xml```

靠最后添加这一行:


```
<!-- Tomcat Manager Context -->
    <Context path="/dubbo-admin" docBase="dubbo-admin-2.5.4-SNAPSHOT" debug="0" privileged="true" reloadable="true"/>
```


整体这样子:

```
<Server>
<Service>
    <Engine>
        ....
        ...
    </Engine>

    <!-- Tomcat Manager Context -->
    <Context path="/dubbo-admin" docBase="dubbo-admin-2.5.4-SNAPSHOT" debug="0" privileged="true" reloadable="true"/>
</Service>
</Server>
```

因为有jenkins为```ROOT.war```的原因,会导致访问不到dubbo。

为方便jenkins的访问使用,将dubbo-admin放在另外一个tomcat下面。


暂时设定port为```8079```


## 创建dubbo专属的tomcat

> 准备工作


解压一份

```
tar -zxf apache-tomcat-9.0.0.M15.tar.gz
```

重命名:

```
$   mv apache-tomcat-9.0.0.M15 tomcat9_dubbo
$   ls
apache-tomcat-9.0.0.M15.tar.gz  tomcat9  tomcat9_dubbo
```



复制 ```dubbo-admin.war``` 到新的tomcat下面:

建议: 如果tomat默认额包不用,可以删除。删除方式如下:

```
$   rm -rf ${TOMCAT_HOME}/webapps/*
```

```
$   cp ~/tool/tomcat/tomcat9/webapps/dubbo-admin-2.5.4-SNAPSHOT.war ~/tool/tomcat/tomcat9_dubbo/webapps/
```

重命名:

```
$ mv dubbo-admin-2.5.4-SNAPSHOT.war ROOT.war
```


> 配置修改

(1) 修改tomcat端口并指定编码

```
<!-- A "Connector" represents an endpoint by which requests are received
         and responses are returned. Documentation at :
         Java HTTP Connector: /docs/config/http.html
         Java AJP  Connector: /docs/config/ajp.html
         APR (HTTP/AJP) Connector: /docs/apr.html
         Define a non-SSL/TLS HTTP/1.1 Connector on port 8080
    -->
    <Connector port="8079" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" URIEncoding="UTF-8" />
```

(2) 端口占用问题

如果此时8080的tomcat是启动的,你应该会遇到如下端口占用错误。我们明明修改了端口啊?可是tomcat占用的不仅仅是一个8080.

下面这段log在 ```${TOMCAT_HOME}/logs/catalina.out.log```

```
02-Jan-2017 11:49:02.919 INFO [main] org.apache.coyote.AbstractProtocol.init Initializing ProtocolHandler ["ajp-nio-8009"]
02-Jan-2017 11:49:02.935 SEVERE [main] org.apache.catalina.util.LifecycleBase.handleSubClassException Failed to initialize component [Connector[AJP/1.3-8009]]
 org.apache.catalina.LifecycleException: Protocol handler initialization failed
        at org.apache.catalina.connector.Connector.initInternal(Connector.java:944)
        at org.apache.catalina.util.LifecycleBase.init(LifecycleBase.java:136)
        at org.apache.catalina.core.StandardService.initInternal(StandardService.java:530)
        at org.apache.catalina.util.LifecycleBase.init(LifecycleBase.java:136)
        at org.apache.catalina.core.StandardServer.initInternal(StandardServer.java:875)
        at org.apache.catalina.util.LifecycleBase.init(LifecycleBase.java:136)
        at org.apache.catalina.startup.Catalina.load(Catalina.java:606)
        at org.apache.catalina.startup.Catalina.load(Catalina.java:629)
        at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
        at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
        at java.lang.reflect.Method.invoke(Method.java:498)
        at org.apache.catalina.startup.Bootstrap.load(Bootstrap.java:311)
        at org.apache.catalina.startup.Bootstrap.main(Bootstrap.java:494)
Caused by: java.net.BindException: Address already in use
        at sun.nio.ch.Net.bind0(Native Method)
        at sun.nio.ch.Net.bind(Net.java:433)
        at sun.nio.ch.Net.bind(Net.java:425)
        at sun.nio.ch.ServerSocketChannelImpl.bind(ServerSocketChannelImpl.java:223)
        at sun.nio.ch.ServerSocketAdaptor.bind(ServerSocketAdaptor.java:74)
        at org.apache.tomcat.util.net.NioEndpoint.bind(NioEndpoint.java:210)
        at org.apache.tomcat.util.net.AbstractEndpoint.init(AbstractEndpoint.java:941)
        at org.apache.coyote.AbstractProtocol.init(AbstractProtocol.java:542)
        at org.apache.catalina.connector.Connector.initInternal(Connector.java:941)
        ... 13 more
```

修改 ```server.xml```,这段内容

```
<!-- Define an AJP 1.3 Connector on port 8009 -->
    <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />
```

改为

```
<!-- Define an AJP 1.3 Connector on port 8009 -->
    <Connector port="8008" protocol="AJP/1.3" redirectPort="8443" />
```

(3) 端口占用问题-重逢

重启tomcat,不出意外应该有喜闻乐见的端口占用。。。(修改需谨慎,确保无冲突)

```
02-Jan-2017 11:55:57.732 SEVERE [main] org.apache.catalina.core.StandardServer.await StandardServer.await: create[localhost:8005]:
 java.net.BindException: Address already in use (Bind failed)
	at java.net.PlainSocketImpl.socketBind(Native Method)
	at java.net.AbstractPlainSocketImpl.bind(AbstractPlainSocketImpl.java:387)
	at java.net.ServerSocket.bind(ServerSocket.java:375)
	at java.net.ServerSocket.<init>(ServerSocket.java:237)
	at org.apache.catalina.core.StandardServer.await(StandardServer.java:441)
	at org.apache.catalina.startup.Catalina.await(Catalina.java:743)
	at org.apache.catalina.startup.Catalina.start(Catalina.java:689)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:498)
	at org.apache.catalina.startup.Bootstrap.start(Bootstrap.java:355)
	at org.apache.catalina.startup.Bootstrap.main(Bootstrap.java:495)
```

修改```server.xml```这一段

```
<!-- Note:  A "Server" is not itself a "Container", so you may not
     define subcomponents such as "Valves" at this level.
     Documentation at /docs/config/server.html
 -->
<Server port="8005" shutdown="SHUTDOWN">
```

为:

```
<Server port="8004" shutdown="SHUTDOWN">
```

重启tomcat:


```
02-Jan-2017 12:01:29.588 INFO [main] org.apache.coyote.AbstractProtocol.start Starting ProtocolHandler [http-nio-8079]
02-Jan-2017 12:01:29.612 INFO [main] org.apache.coyote.AbstractProtocol.start Starting ProtocolHandler [ajp-nio-8008]
02-Jan-2017 12:01:29.617 INFO [main] org.apache.catalina.startup.Catalina.start Server startup in 53091 ms
```

应该是成功了。登陆看看吧。。。



(4) 登录 dubbo-admin

默认: root/root

此配置在 ```dubbo.properties```下面

```
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.admin.root.password=root
dubbo.admin.guest.password=guest
```

当然也可以自定修改,修改后需要重启tomcat方能生效。