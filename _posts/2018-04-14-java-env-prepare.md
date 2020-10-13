---
layout: post
title:  windows jdk 环境配置 java 环境变量配置
date:  2018-04-13 10:41:54 +0800
categories: [Java]
tags: [java, env, jdk, sf]
published: true
---

# JDK

## Windows

### JDK 安装

1：安装jdk 随意选择目录 只需把默认安装目录 \java 之前的目录修改即可

2：安装jre→更改→ \java 之前目录和安装 jdk 目录相同即可

注：若无安装目录要求，可全默认设置。无需做任何修改，两次均直接点下一步。


### 环境配置

计算机→属性→高级系统设置→高级→环境变量

- JAVA_HOME

系统变量→新建 JAVA_HOME 变量 。

变量值填写jdk的安装目录（本人是 E:\Java\jdk1.7.0)

- CLASSPATH

系统变量→新建 CLASSPATH 变量

变量值填写   `.;%JAVA_HOME%\lib;%JAVA_HOME%\lib\tools.jar`（注意最前面有一点）

系统变量配置完毕

### 验证

```
$   java -version
```


# windows7 安装笔记

## 安装路径

```
C:\Program Files\Java\jdk1.8.0_192\
```

## 配置 java_home

```
JAVA_HOME=C:\Program Files\Java\jdk1.8.0_192
```

## 配置 CLASSPATH

```
.;%JAVA_HOME%\lib;%JAVA_HOME%\lib\tools.jar
```

## 测试

```
λ java -version
java version "1.8.0_192"
Java(TM) SE Runtime Environment (build 1.8.0_192-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.192-b12, mixed mode)
```

已经是 64 位的了。


* any list
{:toc}









 





