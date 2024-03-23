---
layout: post
title:  DL4j-01-base
date:  2017-04-16 12:03:32 +0800
categories: [Deep Learning]
tags: [AI, DL, dl4j, neural network]
header-img: "static/app/res/img/kon-bg.jpeg"
published: true
---


# 基础概念

此处个人选择 Deeplearning4j。用什么框架区别并不大，静下心来学习原理才是重要的。

# Deeplearning4j

[Deeplearning4j](deeplearning4j.konduit.ai) 是第一个为 Java 和 Scala 编写的商业级开源分布式深度学习库。

DL4J 集成了 Hadoop 和 Spark，旨在在分布式 GPU 和 CPU 上用于商业环境中。

可应用于以下深度学习领域：

- 人脸/图像识别

- 语音搜索

- 语音转文字（Speech to text）

- 垃圾信息过滤（异常侦测）

- 电商欺诈侦测


# 快速开始

[官网地址](deeplearning4j.konduit.ai/quickstart)

## 先决条件

1. Java（开发者版本）1.7 或更高版本（仅支持 64 位版本）

2. Apache Maven（自动化构建和依赖管理）

3. Git

4. IntelliJ IDEA 或 Eclipse

本机测试

- Jdk

```
houbinbindeMacBook-Pro:003_condition houbinbin$ java -version
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
```

- Maven

```
houbinbindeMacBook-Pro:003_condition houbinbin$ mvn -v
Apache Maven 3.3.9 (bb52d8502b132ec0a5a3f4c09453c07478323dc5; 2015-11-11T00:41:47+08:00)
Maven home: /usr/local/maven/maven3.3.9
Java version: 1.8.0_91, vendor: Oracle Corporation
Java home: /Library/Java/JavaVirtualMachines/jdk1.8.0_91.jdk/Contents/Home/jre
Default locale: zh_CN, platform encoding: UTF-8
OS name: "mac os x", version: "10.11.3", arch: "x86_64", family: "mac"
```

- Git

```
houbinbindeMacBook-Pro:003_condition houbinbin$ git --version
git version 2.8.1
```

- IDE

本机使用IDEA。

## DL4J Examples

一、下载和安装

```
$ git clone https://github.com/deeplearning4j/dl4j-examples.git
$ cd dl4j-examples/
$ mvn clean install
```

- 下载

如果发现命令行安装速度较慢，您也可以直接[下载](https://github.com/deeplearning4j/dl4j-examples)。

- pom.xml

为了在您自己的项目中运行 DL4J，我们强烈建议 Java 用户使用 Maven，Scala 用户可以使用类似 SBT 的工具。下面是一组基本的依赖项及其版本。这包括：

1. deeplearning4j-core，其中包含神经网络实现

2. nd4j-native-platform，支持 DL4J 的 ND4J 库的 CPU 版本

3. datavec-api - Datavec 是我们用于向量化和加载数据的库


这些Demo里面已经有了，无需再次引入。

- 安装

```
Book-Pro:dl4j-examples houbinbin$ pwd
/Users/houbinbin/IT/learn/DL/dl4j-examples-master/dl4j-examples
houbinbindeMacBook-Pro:dl4j-examples houbinbin$ mvn clean install
[INFO] Scanning for projects...
....
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 01:05 min
[INFO] Finished at: 2017-04-16T13:37:47+08:00
[INFO] Final Memory: 89M/897M
[INFO] ------------------------------------------------------------------------
```

- 运行

根据官方推荐。运行 `MLPClassifierLinear` 里面的 Main() 即可。

日志：

```
o.n.l.f.Nd4jBackend - Loaded [CpuBackend] backend
o.n.n.NativeOpsHolder - Number of threads used for NativeOps: 4
o.n.n.Nd4jBlas - Number of threads used for BLAS: 4
o.n.l.a.o.e.DefaultOpExecutioner - Backend used: [CPU]; OS: [Mac OS X]
o.n.l.a.o.e.DefaultOpExecutioner - Cores: [8]; Memory: [3.6GB];
o.n.l.a.o.e.DefaultOpExecutioner - Blas vendor: [OPENBLAS]
o.d.o.l.ScoreIterationListener - Score at iteration 0 is 0.6082896423339844
...
o.d.o.l.ScoreIterationListener - Score at iteration 10 is 0.5995052337646485
Evaluate model....

Examples labeled as 0 classified by model as 0: 100 times
Examples labeled as 1 classified by model as 1: 100 times


==========================Scores========================================
 Accuracy:        1
 Precision:       1
 Recall:          1
 F1 Score:        1
========================================================================
****************Example finished********************
```

# 参考资料

[深度学习和人工智能](https://www.zhihu.com/question/30545893)

[开源深度学习框架](https://www.oschina.net/news/68074/ten-worth-a-try-open-deep-learning-framework)

* any list
{:toc}













