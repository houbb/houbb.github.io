---
layout: post
title:  Gradle-01-gradle install on windows gradle windows 安装实战笔记
date: 2016-08-06 13:10:53 +0800
categories: [VCS]
tags: [maven, devops, install, windows, sf]
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


# windows10 + jdk8 + gradle7.4.2 安装笔记

## 基本环境

windows10

jdk8

gradle

## 下载

访问：

https://services.gradle.org/distributions/gradle-7.4.2-bin.zip

## 解压

```
λ pwd
D:\tool\gradle
```

将下载的压缩包解压到上面的文件夹下。

对应的 bin 目录为

```
D:\tool\gradle\gradle-7.4.2-bin\gradle-7.4.2\bin
```

## 配置 path

控制面板\所有控制面板项\系统=》高级系统设置=》系统变量


```
Path = xxx;D:\tool\gradle\gradle-7.4.2-bin\gradle-7.4.2\bin;
```

将我们的 bin 路径添加到 path 之后，保存。

## 验证

```
λ gradle -v

Welcome to Gradle 7.4.2!

Here are the highlights of this release:
 - Aggregated test and JaCoCo reports
 - Marking additional test source directories as tests in IntelliJ
 - Support for Adoptium JDKs in Java toolchains

For more details see https://docs.gradle.org/7.4.2/release-notes.html


------------------------------------------------------------
Gradle 7.4.2
------------------------------------------------------------

Build time:   2022-03-31 15:25:29 UTC
Revision:     540473b8118064efcc264694cbcaa4b677f61041

Kotlin:       1.5.31
Groovy:       3.0.9
Ant:          Apache Ant(TM) version 1.10.11 compiled on July 10 2021
JVM:          1.8.0_192 (Oracle Corporation 25.192-b12)
OS:           Windows 10 10.0 amd64
```

## 设置 GRADLE_HOME

后续使用中，发现这个变量也需要设置下。

新建系统变量 **GRADLE_HOME**，对应的值：

```
D:\tool\gradle\gradle-7.4.2-bin\gradle-7.4.2
```

# 启动报错

启动遇到报错:

```
org.gradle.internal.metaobject.AbstractDynamicObject$CustomMessageMissingMethodException异常处理
```

## 解决方式

1） 首先设置对应的 gradle_home

2） idea 中设置对应的 gradle_home，默认为 c 盘。

# idea 中配置 gradle

使用IDEA创建gradle之时，时长感到缓慢无比，上网搜索良久，终于找到解决方法，特于此分享，经本人亲测，确实有光速提升。

## gradle 包下载慢

1，缓慢之由一：下载gradle包缓慢，首次创建项目皆要下载gradle***.zip（gradle包）。解决办法：使用迅雷下载把包下载（几秒），后设置IDEA的gradle路径，过程如下。

（1）使用迅雷下载gradle包，地址为：https://services.gradle.org/distributions/gradle-7.4.2-bin.zip。

（2）设置IDEA (ctrl+alt+s)，如下所示。

idea 中一般使用的是 gradle wrapper，会在下面的默认路径再一次瞎子啊 gradle-versionxxx.zip。

所以直接把下载好的 `gradle-7.4.2-bin.zip` 放在目录：

```
C:\Users\dh\.gradle\wrapper\dists\gradle-7.4.2-bin\48ivgl02cpt2ed3fh9dbalvx8
```

下面即可。

执行后下面的目录会自动解压

```
gradle-7.4.2/  gradle-7.4.2-bin.zip  gradle-7.4.2-bin.zip.lck  gradle-7.4.2-bin.zip.ok  gradle-7.4.2-bin.zip.part
```

## 依赖下载慢

缓慢之由二，下载镜像慢。解决办法：在gradle中创建 `init.gradle` 文件，使用阿里镜像，每次创建项目皆会使用阿里源。

```
allprojects {
       repositories {
           maven { url 'https://maven.aliyun.com/repository/public/' }
           maven { url 'https://maven.aliyun.com/repository/jcenter' }
           maven { url 'https://maven.aliyun.com/repository/google' }
           maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
           
           mavenLocal()
           mavenCentral()
           jcenter()
       }
   }
```

# 如何清空 gradle 缓存

清除 Gradle 缓存可以解决一些构建问题，可以按照以下步骤清除 Gradle 缓存：

1. 打开命令行终端或者操作系统的命令行界面。

2. 进入到 Gradle 的用户目录。
   Gradle 的用户目录通常位于用户主目录下的 `.gradle` 目录中，可以使用以下命令进入该目录：

   ```
   cd ~/.gradle
   ```

3. 删除缓存目录。
   在 Gradle 的用户目录中，有一个名为 `caches` 的目录，这个目录保存了 Gradle 的缓存文件。可以使用以下命令删除 `caches` 目录：

   ```
   rm -rf caches
   ```

   如果使用的是 Windows 操作系统，可以使用以下命令删除 `caches` 目录：

   ```
   rmdir /s /q caches
   ```

4. 重新构建项目。
   清除 Gradle 缓存后，可以重新构建项目，Gradle 会重新下载依赖和构建项目。

注意：清除 Gradle 缓存可能需要一些时间，并且会导致之前构建的缓存失效，因此建议仅在必要时清除 Gradle 缓存。

# 参考资料

[install](https://gradle.org/install/)

[Windows下gradle的安装与配置](https://blog.csdn.net/zhaokai0130/article/details/81008719)

https://www.51cto.com/article/740748.html

https://zhuanlan.zhihu.com/p/570009095

[IDEA创建gradle项目犹如乌龟爬行（缓慢）解决方案](https://blog.csdn.net/weixin_40109343/article/details/108503577)

https://blog.csdn.net/weixin_40109343/article/details/108503577

* any list
{:toc}