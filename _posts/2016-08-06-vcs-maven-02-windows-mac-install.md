---
layout: post
title: maven 包管理平台-02-windows 安装配置 + mac 安装配置
date: 2016-08-06 13:10:53 +0800
categories: [VCS]
tags: [maven, devops, sf]
published: true
---

# 拓展阅读

[maven 包管理平台-01-maven 入门介绍 + Maven、Gradle、Ant、Ivy、Bazel 和 SBT 的详细对比表格](https://houbb.github.io/2016/08/06/maven-01-intro)

[maven 包管理平台-02-windows 安装配置 + mac 安装配置](https://houbb.github.io/2016/08/06/maven-02-windows-mac-install)

[maven 包管理平台-03-maven project maven 项目的创建入门](https://houbb.github.io/2016/08/06/maven-03-maven-project)

[maven 包管理平台-04-maven archetype 项目原型](https://houbb.github.io/2016/08/06/maven-04-maven-archetype)

[maven 包管理平台-05-multi module 多模块](https://houbb.github.io/2016/08/06/maven-05-multi-module)

[maven 包管理平台-06-常用技巧 实时更新快照/乱码问题/下载很慢/包依赖解决包冲突/如何导入本地 jar](https://houbb.github.io/2016/08/06/maven-06-tips)

[maven 包管理平台-07-plugins 常见插件介绍](https://houbb.github.io/2016/08/06/maven-07-plugins)

[maven 包管理平台-08-nexus 自己搭建 maven 仓库](https://houbb.github.io/2016/08/06/maven-08-nexus)


# Maven

[Apache maven](https://maven.apache.org/) 是一个软件项目管理和理解工具。

基于项目对象模型（POM）的概念，Maven 可以从一个中心信息管理项目的构建、报告和文档。

> [Maven权威指南zh_CN.pdf]({{site.url}}/static/download/pdf/maven/Maven权威指南zh_CN.pdf)

# windows 安装

## 要求：

- JDK: Maven 3.3 需要 **JDK 1.7** 或更高版本才能执行 - 它仍然允许您针对 1.3 和其他 JDK 版本进行构建，使用 Toolchains

- 磁盘空间: Maven 安装本身需要大约 10MB。除此之外，您的本地 Maven 仓库还将使用额外的磁盘空间。

您的本地仓库大小将根据使用情况而变化，但至少需要 **500MB**。

> [安装](https://maven.apache.org/install.html)

> [文档中文版](http://blog.csdn.net/xxb2008/article/details/8772634)

## 下载

> [下载](https://maven.apache.org/download.cgi)

## 配置

- 环境变量

```
MAVEN_HOME: D:\Maven\apache-maven-3.3.9
```

- 路径

```
%MAVEN_HOME%/bin;
```

## 验证

- 测试：

```
mvn -v
```

- 结果

```
Apache Maven 3.3.9 (bb52d8502b132ec0a5a3f4c09453c07478323dc5; 2015-11-11T00:41:4
7+08:00)
Maven home: D:\Maven\apache-maven-3.3.9\bin\..
Java version: 1.7.0_79, vendor: Oracle Corporation
Java home: D:\Program Files\Java\jdk1.7.0_79\jre
Default locale: zh_CN, platform encoding: GBK
OS name: "windows 7", version: "6.1", arch: "amd64", family: "windows"
```


# mac 安装

## 下载

1. 下载 Maven `apache-maven-3.3.9-bin.tar.gz`，解压并将文件重命名为 **maven3.3.9**。

2. 在 mac 终端中，输入以下命令：

```
$ pwd
```

获取当前路径。然后输入以下命令：

```
$ cd /

$ cd /usr/local

$ ls
```

可以获取本地包下的目录。如果不存在，创建 **maven** 文件。

```
$ sudo mkdir maven
```

将 maven3.3.9 复制到该路径。

```
$ sudo cp -R /Users/houbinbin/IT/learn/maven/maven3.3.9 /usr/local/maven
```

## 设置配置

3. 设置路径

```
$ vi ~/.bash_profile
```

这是 vi 编辑器。

```sh
M3_HOME=/usr/local/maven/maven3.3.9

PATH=$M3_HOME/bin:$PATH

export M3_HOME

export PATH
```

然后，保存并退出。

退出 mac 终端，重新启动终端。

```
echo $M3_HOME
echo $PATH
```

可以看到您设置的内容，并且

## 测试验证

```
$ mvn -version
```

显示如下：

```
houbinbindeMacBook-Pro:~ houbinbin$ mvn -version
Apache Maven 3.3.9 (bb52d8502b132ec0a5a3f4c09453c07478323dc5; 2015-11-11T00:41:47+08:00)
Maven home: /usr/local/maven/maven3.3.9
Java version: 1.8.0_91, vendor: Oracle Corporation
Java home: /Library/Java/JavaVirtualMachines/jdk1.8.0_91.jdk/Contents/Home/jre
Default locale: zh_CN, platform encoding: UTF-8
OS name: "mac os x", version: "10.11.3", arch: "x86_64", family: "mac"
```

# setting.xml


你可以打开 `%MAVEN_HOME%\conf\settings.xml` 文件，配置对应的代码仓库存储地址。

you will find code like this...

```xml
<!-- localRepository
   | The path to the local repository maven will use to store artifacts.
   |
   | Default: ${user.home}/.m2/repository

  <localRepository>/path/to/local/repo</localRepository>
-->
```

* any list
{:toc}