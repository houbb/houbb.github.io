---
layout: post
title:  windows10 开发环境安装
date:  2021-2-14 16:52:15 +0800
categories: [Dev]
tags: [dev, windows, sh]
published: true
---

# 背景说明

有时候换了一台全新的电脑，就需要安装对应的环境。


# 常用软件

vscode

git

maven

jdk

notepad++;

cmder

idea

mysql 5.7

# cmder

[cmder](https://cmder.net/) 直接进行下载。

# vscode

直接下载安装

# git

直接下载安装

## 设置

```
git config --global user.email "houbinbin.echo@gmail.com"
git config --global user.name "houbb"
```

# jdk 

默认路径：

```
D:\Program Files\Java\jdk1.8.0_192\
```

## 设置 JAVA_HOME

```
JAVA_HOME=D:\Program Files\Java\jdk1.8.0_192\
```

## 测试

```
λ java -version
java version "1.8.0_192"
Java(TM) SE Runtime Environment (build 1.8.0_192-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.192-b12, mixed mode)
```

# maven

直接下载，对应的路径：

```
D:\tools\maven\apache-maven-3.6.3
```

配置对应的 maven_home:

二、配置环境变量。

1. 打开环境变量配置。右键计算机→属性→高级系统设置→高级→环境变量，在系统变量中配置。

2. 配置MAVEN_HOME。在系统变量中新建，变量名MAVEN_HOME，变量值，maven文件夹路径，我的路径是 `D:\tools\maven\apache-maven-3.6.3`

三、配置 path

配置path，找到path系统变量，点开，新建，输入 `%MAVEN_HOME%\bin`

四、测试

```
λ mvn -version
Apache Maven 3.6.3 (cecedd343002696d0abb50b32b541b8a6ba2883f)
Maven home: D:\tools\maven\apache-maven-3.6.3\bin\..
Java version: 1.8.0_192, vendor: Oracle Corporation, runtime: D:\Program Files\Java\jre1.8.0_192
Default locale: zh_CN, platform encoding: GBK
OS name: "windows 10", version: "10.0", arch: "amd64", family: "windows"
```







* any list
{:toc}