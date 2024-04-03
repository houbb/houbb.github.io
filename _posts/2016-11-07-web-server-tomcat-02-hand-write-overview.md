---
layout: post
title: web server apache Tomcat 手写入门介绍
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: false
---

#  开源的手写项目

## https://github.com/shenshaoming/tomcat

手写tomcat
netty的jar包位于resources下，就引入来说相对麻烦，各位不好意思了。
version1.0:实现了监听端口,但时不时会服务器就会崩溃.
version2.0:通过增加访问队列修复了崩溃的bug.
version3.0:能够通过服务器访问本地(服务器)的文件,默认是D盘下的文件,D盘就相当于WEB_ROOT路径
version3.1:实现多线程bio监听端口
version4.0:能够通过服务器访问Servlet程序
version4.1:通过扫描包和注解的形式,实现了类似SpringMvc的机制
version4.2:当Servlet注解中的value重复时抛出异常
version5.0:由开启线程改为线程池.
version5.1:改为由ThreadPoolExecutor创建线程池
version5.2:从BIO监听模型改为NIO模型
version5.3:从NIO模型改为基于Netty的NIO模型
version5.4:加入过滤器,收到请求时,要先去访问所有的过滤器

## https://github.com/OliverLiy/MyTomcatDemo

## https://github.com/CoderXiaohui/mini-tomcat

https://www.cnblogs.com/isdxh/p/14199711.html

## https://github.com/Rainyn/myTomcat

手写Tomcat，参考

https://www.jianshu.com/p/dce1ee01fb90

## https://github.com/thestyleofme/minicat-parent

## https://github.com/nmyphp/mytomcat


* any list
{:toc}