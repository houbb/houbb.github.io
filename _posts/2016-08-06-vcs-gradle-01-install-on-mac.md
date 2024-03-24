---
layout: post
title:  Gradle-01-gradle install on mac  gradle mac 安装实战笔记
date: 2016-08-06 13:10:53 +0800
categories: [VCS]
tags: [maven, devops, install, mac, sf]
published: true
---

# Gradle

无论是移动应用程序还是微服务，从小型创业公司到大型企业，

[Gradle](https://gradle.org/) 帮助团队构建、自动化和更快地交付更好的软件。

# 安装

## 依赖

Gradle 需要 JDK1.7 及其以上

```
n$ java -version
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
```

## Mac 

- Brew

直接安装


```
brew install gradle
```

- 测试

```
$ gradle --version

------------------------------------------------------------
Gradle 3.3
------------------------------------------------------------

Build time:   2017-01-03 15:31:04 UTC
Revision:     075893a3d0798c0c1f322899b41ceca82e4e134b

Groovy:       2.4.7
Ant:          Apache Ant(TM) version 1.9.6 compiled on June 29 2015
JVM:          1.8.0_91 (Oracle Corporation 25.91-b14)
OS:           Mac OS X 10.13.5 x86_64
``` 

* any list
{:toc}