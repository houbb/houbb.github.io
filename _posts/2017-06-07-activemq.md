---
layout: post
title:  ActiveMQ-01-Overview
date:  2017-6-7 16:38:51 +0800
categories: [Java]
tags: [mq, java, activemq, jms, sh]
published: true
---

# ActiveMQ

[Apache ActiveMQ ™](http://activemq.apache.org/index.html) is the most popular and powerful open source messaging and 
Integration Patterns server.

Apache ActiveMQ is fast, supports many Cross Language Clients and Protocols, comes with easy to use Enterprise Integration 
Patterns and many advanced features while fully supporting JMS 1.1 and J2EE 1.4. Apache ActiveMQ is released under 
the Apache 2.0 License.


# Hello World

> [JMS简介与ActiveMQ实战](http://boy00fly.iteye.com/blog/1103586)

> [To Run](http://blog.csdn.net/clj198606061111/article/details/38145597)

本案例使用 windows7(64) 进行测试。

一、Download

从这里下载, [v5.91](http://activemq.apache.org/activemq-591-release.html).

二、Start

下载后进行加压。文件路径大概如下:

```
[E:\Tools\MQ\apacheMQ\apache-activemq-5.9.1]$ ls
Directory of E:\Tools\MQ\apacheMQ\apache-activemq-5.9.1

Name                      Host                  Protocol  User Name  
------------------------- --------------------- --------- -----------
bin/
conf/
data/
docs/
examples/
lib/
webapps/
webapps-demo/
```

如果想运行 activeMQ, 则需要进入 **bin** 路径下。

```
Directory of E:\Tools\MQ\apacheMQ\apache-activemq-5.9.1\bin

Name                      Host                  Protocol  User Name  
------------------------- --------------------- --------- -----------
win32/
win64/
```

还有一些其他文件，没有显示出来。此处只需要选择 **win64** 文件夹：

```
2014/03/31  20:13             1,556 activemq.bat
2014/03/31  20:13             1,721 InstallService.bat
2014/03/31  20:13             1,548 UninstallService.bat
2014/03/31  20:13             6,190 wrapper.conf
2014/03/31  20:02            76,800 wrapper.dll
2014/03/31  20:02           220,672 wrapper.exe
               6 个文件        308,487 字节
               2 个目录 133,565,947,904 可用字节
```

双击运行 `activemq.bat` 即可

三、Visit

直接在浏览器输入[http://localhost:8161/admin/](http://localhost:8161/admin/)即可，默认用户名密码(admin/admin);

可见页面如下：

![-activemq-index](https://raw.githubusercontent.com/houbb/resource/master/img/mq/activemq/2017-07-04-activemq-index.png)


 * any list
{:toc}