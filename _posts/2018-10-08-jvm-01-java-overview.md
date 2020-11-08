---
layout: post
title: JVM-01-jvm ovewview
date:  2018-10-08 07:19:52 +0800
categories: [Java]
tags: [sql, java, ovewview, sf]
published: true
---

# Java 技术体系

## 组成部分

- java 编程语言

- jvm

- class 文件格式

- API 类库

- 其他三方库

## JDK 与 JRE

- JDK

java 编程语言、API 类库、JVM 

开发环境

- JRE

Java SE API、JVM

运行环境

## Java技术体系的四大平台(SE,EE,ME,Card)


1999年Sun根据应用的领域不同把Java技术划归为三个平台，当时分别称为J2SE、J2EE和J2SE，现在改名为Java SE、Java EE和Java ME。

### Java SE

Java SE 是Java平台标准版的简称（Java Platform, Standard Edition） (also known as Java 2 Platform) ，用于开发和部署桌面、服务器以及嵌入设备和实时环境中的Java应用程序。Java SE包括用于开发Java Web服务的类库，同时，Java SE为Java EE提供了基础。

Java SE（Java Platform, Standard Edition，Java标准版）就是基于JDK和JRE的。

### Java EE

Java EE是Java平台企业版的简称（Java Platform, Enterprise Edition），用于开发便于组装、健壮、可扩展、安全的服务器端Java应用。Java EE建立于Java SE之上，具有Web服务、组件模型、以及通信API等特性，这些为面向服务的架构（SOA）以及开发Web2.0应用提供了支持。

Java EE基于Java SE，此外新加了企业应用所需的类库。

### Java ME

Java ME是Java微版的简称（Java Platform, Enterprise Edition），是一个技术和规范的集合，它为移动设备（包括消费类产品、嵌入式设备、高级移动设备等）提供了基于Java环境的开发与应用平台。Java ME目前分为两类配置，一类是面向小型移动设备的CLDC（Connected Limited Device Profile ），一类是面型功能更强大的移动设备如智能手机和及顶盒，称为CDC（Connected Device Profile CDC）

Java ME有自己的类库，其中CLDC使用的是专用的Java虚拟机叫做KVM。

# Java的发展简史

参见 [Java的发展简史](https://www.jianshu.com/p/1dc36b60d4c4)

# JVM 发展简史

参见 [Java虚拟机发展史](https://blog.csdn.net/tinyDolphin/article/details/72809018)

# java 的未来

## 模块化

## 混合语言

## 多核并行

concurrent

fork/join

# OpenJDK

[OpenJDK](https://openjdk.java.net/) 涵盖了各种开源 JDK 标准的实现。

关于JDK和OpenJDK的区别，可以归纳为以下几点： 

## 授权协议的不同

OpenJDK采用GPL V2协议放出，而JDK则采用JRL放出。两者协议虽然都是开放源代码的，但是在使用上的不同在于GPL V2允许在商业上使用，而JRL只允许个人研究使用。 

OpenJDK不包含Deployment（部署）功能： 

部署的功能包括：Browser Plugin、Java Web Start、以及Java控制面板，这些功能在OpenJDK中是找不到的。 

## OpenJDK源代码不完整

这个很容易想到，在采用GPL协议的OpenJDK中，Sun JDK的一部分源代码因为产权的问题无法开放OpenJDK使用，其中最主要的部份就是JMX中的可选元件SNMP部份的代码。因此这些不能开放的源代码将它作成plugin，以供OpenJDK编译时使用，你也可以选择不要使用plugin。而Icedtea则为这些不完整的部分开发了相同功能的源代码(OpenJDK6)，促使OpenJDK更加完整。 

## 部分源代码用开源代码替换

由于产权的问题，很多产权不是SUN的源代码被替换成一些功能相同的开源代码，比如说字体栅格化引擎，使用Free Type代替。 

## OpenJDK只包含最精简的JDK

OpenJDK不包含其他的软件包，比如Rhino Java DB JAXP……，并且可以分离的软件包也都是尽量的分离，但是这大多数都是自由软件，你可以自己下载加入。 

## 不能使用Java商标

这个很容易理解，在安装OpenJDK的机器上，输入“java -version”显示的是OpenJDK，但是如果是使用Icedtea补丁的OpenJDK，显示的是java。（未验证） 

总之，在Java体系中，还是有很多不自由的成分，源代码的开发不够彻底，希望Oracle能够让JCP更自由开放一些，这也是所有Java社区所希望的。 

## 补充

以下内容引用知乎的内容https://www.zhihu.com/question/19646618/answer/40621705对上面的回答进行补充：

Sun JDK能用于商业用途的license是SCSL（Sun Community Source License）。JRL（Java Research License）是2004年开始用的，伴随Sun JDK6发布而开始使用，远比JDK7早。

从代码完整性来说：

`Sun JDK > SCSL > JRL > OpenJDK`

Sun JDK有少量代码是完全不开发的，即便在SCSL版里也没有。但这种代码非常非常少。

SCSL代码比JRL多一些closed目录里的内容。

JRL比OpenJDK多一些受license影响而无法以GPLv2开放的内容。

但从Oracle JDK7/OpenJDK7开始，闭源和开源版的实质差异实在是非常非常小。

与其说OpenJDK7是“不完整的JDK”，还不如说Oracle JDK7在OpenJDK7的基础上带了一些value-add，其中很多还没啥用（例如browser plugin）。

## 相关书籍

《深入Java虚拟机》

《深入理解Java虚拟机JVM高级特性与最佳实践》

《Java虚拟机规范》

# 参考资料

《深入理解 jvm》

https://blog.csdn.net/qq_26963433/article/details/78159868

https://www.jianshu.com/p/1dc36b60d4c4

https://blog.csdn.net/tinyDolphin/article/details/72809018

https://www.cnblogs.com/EasonJim/p/7031961.html

* any list
{:toc}