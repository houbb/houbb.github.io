---
layout: post
title:  Gradle-01-gradle install on windows
date:  2018-06-28 16:23:34 +0800
categories: [Tool]
tags: [gradle, sh]
published: true
---

# 准备工作

Gradle可在所有主要操作系统上运行，并且仅需要安装Java JDK或JRE版本8或更高版本。 

要检查，请运行java -version：

```
λ java -version
java version "1.8.0_102"
Java(TM) SE Runtime Environment (build 1.8.0_102-b14)
Java HotSpot(TM) Client VM (build 25.102-b14, mixed mode)
```

# 手动安装

## 下载

此处我下载了 [完整版本](https://gradle.org/next-steps/?version=6.4.1&format=all)

## 解压

```
λ pwd
D:\tool\gradle
```

将下载的压缩包解压到上面的文件夹下。

对应的 bin 目录为

```
D:\tool\gradle\gradle-6.4.1\bin
```

## 配置 path

控制面板\所有控制面板项\系统=》高级系统设置=》系统变量


```
Path = xxx;D:\tool\gradle\gradle-6.4.1\bin;
```

将我们的 bin 路径添加到 path 之后，保存。

## 验证版本

```
λ gradle -v

------------------------------------------------------------
Gradle 6.4.1
------------------------------------------------------------

Build time:   2020-05-15 19:43:40 UTC
Revision:     1a04183c502614b5c80e33d603074e0b4a2777c5

Kotlin:       1.3.71
Groovy:       2.5.10
Ant:          Apache Ant(TM) version 1.10.7 compiled on September 1 2019
JVM:          1.8.0_102 (Oracle Corporation 25.102-b14)
OS:           Windows 7 6.1 x86
```

搞定~

## 设置 GRADLE_HOME

后续使用中，发现这个变量也需要设置下。

新建系统变量 **GRADLE_HOME**，对应的值：

```
D:\tool\gradle\gradle-6.4.1
```


# 参考资料

[install](https://gradle.org/install/)

[Windows下gradle的安装与配置](https://blog.csdn.net/zhaokai0130/article/details/81008719)

* any list
{:toc}