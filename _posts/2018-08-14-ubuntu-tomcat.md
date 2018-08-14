---
layout: post
title:  Ubuntu Tomcat
date:  2018-08-14 13:46:27 +0800
categories: [Ubuntu]
tags: [ubuntu, tomcat]
published: true
---

* any list
{:toc}

- download

```
wget http://apache.fayea.com/tomcat/tomcat-9/v9.0.0.M15/bin/apache-tomcat-9.0.0.M15.tar.gz
```

- unzip

```
$ tar -zxf apache-tomcat-9.0.0.M15.tar.gz
$ ls
apache-tomcat-9.0.0.M15  apache-tomcat-9.0.0.M15.tar.gz
```

- rename

```
$   mv apache-tomcat-9.0.0.M15 tomcat9
$   ls
apache-tomcat-9.0.0.M15.tar.gz  tomcat9
```

- config port and encode

edit ```server.xml``` change content like this:

```
$   pwd
/home/hbb/tool/tomcat/tomcat9/conf
```

```
<Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443"  URIEncoding="UTF-8"/>
```