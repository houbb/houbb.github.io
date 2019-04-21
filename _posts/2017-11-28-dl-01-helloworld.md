---
layout: post
title:  DL4j-01-base
date:  2017-04-16 12:03:32 +0800
categories: [Deep Learning]
tags: [AI, DL, neural network]
header-img: "static/app/res/img/kon-bg.jpeg"
published: true
---


# 基础概念

[深度学习和人工智能](https://www.zhihu.com/question/30545893)


[开源深度学习框架](https://www.oschina.net/news/68074/ten-worth-a-try-open-deep-learning-framework)


此处个人选择 Deeplearning4j。用什么框架区别并不大，静下心来学习原理才是重要的。


# Deeplearning4j

[Deeplearning4j](https://deeplearning4j.org/) is the first commercial-grade, open-source, distributed deep-learning library written for Java and Scala. 

Integrated with Hadoop and Spark, DL4J is designed to be used in business environments on distributed GPUs and CPUs. 

可应用于以下深度学习领域：

- 人脸/图像识别

- 语音搜索

- 语音转文字（Speech to text）

- 垃圾信息过滤（异常侦测）

- 电商欺诈侦测


# Quick Start

[官网地址](https://deeplearning4j.org/quickstart)

## Prerequisites

1. Java (developer version) 1.7 or later (Only 64-Bit versions supported)

2. Apache Maven (automated build and dependency manager)

3. Git

4. IntelliJ IDEA or Eclipse


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

- Download

发现命令行安装比较慢。就直接[下载](https://github.com/deeplearning4j/dl4j-examples)。

- pom.xml

To run DL4J in your own projects, we highly recommend using Maven for Java users, or a tool such as SBT for Scala. 
The basic set of dependencies and their versions are shown below. This includes:

1. deeplearning4j-core, which contains the neural network implementations

2. nd4j-native-platform, the CPU version of the ND4J library that powers DL4J

3. datavec-api - Datavec is our library vectorizing and loading data


这些Demo里面已经有了，无需再次引入。


- Install

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

- Run Demo

根据官方推荐。运行 `MLPClassifierLinear` 里面的 Main() 即可。


Terminal log

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

效果如下

![MLPClassifierLinear](https://raw.githubusercontent.com/houbb/resource/master/img/DL/DL4j/2017-04-16-dl-helloworld.png)








* any list
{:toc}













