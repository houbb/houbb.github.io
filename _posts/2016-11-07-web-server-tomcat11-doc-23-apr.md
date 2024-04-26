---
layout: post
title: web server apache tomcat11-23-APR
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

[web server apache tomcat11-11-Jasper 2 JSP Engine](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-11-jsps)

[web server apache tomcat11-12-SSL/TLS Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-12-ssl)

[web server apache tomcat11-13-SSI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-13-ssi)

[web server apache tomcat11-14-CGI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-14-cgi)

...

## 介绍

Tomcat可以使用Apache Portable Runtime提供基于OpenSSL的TLS实现来为HTTP连接器提供服务。

这些功能使得Tomcat成为通用的Web服务器，能够更好地与其他本地Web技术集成，从整体上使Java更具有全面的Web服务器平台性能，而不仅仅是一个面向后端的技术。

## 安装

APR支持需要安装三个主要的本地组件：

- APR库
- Tomcat使用的APR的JNI包装器（libtcnative）
- OpenSSL库

### Windows

针对tcnative-2提供了Windows二进制文件，这是一个静态编译的.dll文件，包含了OpenSSL和APR。可以从这里下载32位或AMD x86-64位的二进制文件。在安全意识型的生产环境中，建议使用单独的共享dll文件来安装OpenSSL、APR和libtcnative-2，并根据安全公告进行更新。Windows OpenSSL二进制文件链接自官方OpenSSL网站（参见相关/二进制文件）。

### Linux

大多数Linux发行版都会提供APR和OpenSSL的软件包。然后JNI包装器（libtcnative）将必须进行编译。它依赖于APR、OpenSSL和Java头文件。

要求：

- APR 1.6.3+开发头文件（libapr1-dev软件包）
- OpenSSL 1.1.1+开发头文件（libssl-dev软件包）
- 来自Java兼容JDK 1.4+的JNI头文件
- GNU开发环境（gcc、make）

包装器库源代码位于Tomcat二进制包中的bin/tomcat-native.tar.gz存档中。一旦安装了构建环境并提取了源存档，就可以使用以下命令编译包装器库（从包含配置脚本的文件夹中）：

```bash
./configure && make && make install
```

## APR组件

一旦库正确安装并对Java可用（如果加载失败，则会显示库路径），Tomcat连接器将自动使用APR。

## APR生命周期监听器配置

参见监听器配置。


# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/apr.html

* any list
{:toc}