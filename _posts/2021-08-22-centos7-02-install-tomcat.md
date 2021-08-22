---
layout: post
title: CentOS7 安装 tomcat8 笔记
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, tomcat, sh]
published: true
---

# 背景

CentOS7 安装 tomcat，记录一下。

# 安装 OpenJDK

Tomcat 8.5需要Java SE 7或更高版本。在本教程中，我们将安装OpenJDK 8 ，这是Java平台的开源实现，它是CentOS 7中的默认Java开发和运行时。

## 查看是否安装过

```
# rpm -qa | grep jdk   
```

或者

```
# rpm -qa | grep openjdk
```

有，不满意则卸载

```
# rpm -e  --nodeps  jdk-xxx                      -nodeps 是强制卸载
```

## 命令安装

安装简单直接：

```
sudo yum install java-1.8.0-openjdk-devel
```

版本查看

```
# java -version
openjdk version "1.8.0_302"
OpenJDK Runtime Environment (build 1.8.0_302-b08)
OpenJDK 64-Bit Server VM (build 25.302-b08, mixed mode)
```

# 安装 tomcat

## 下载

可以从官网 [https://tomcat.apache.org/download-80.cgi?Preferred=https%3A%2F%2Fapache.claz.org%2F](https://tomcat.apache.org/download-80.cgi?Preferred=https%3A%2F%2Fapache.claz.org%2F) 查看

```
# wget https://dlcdn.apache.org/tomcat/tomcat-8/v8.5.70/bin/apache-tomcat-8.5.70.tar.gz
```

## 解压

```
tar -zxvf apache-tomcat-8.5.70.tar.gz 
```

## 启动 

进入 bin 目录

```
# cd apache-tomcat-8.5.70/bin/

# ls
bootstrap.jar  catalina.sh         ciphers.bat  commons-daemon.jar            configtest.bat  daemon.sh   digest.sh         setclasspath.sh  shutdown.sh  startup.sh       tomcat-native.tar.gz  tool-wrapper.sh  version.sh
catalina.bat   catalina-tasks.xml  ciphers.sh   commons-daemon-native.tar.gz  configtest.sh   digest.bat  setclasspath.bat  shutdown.bat     startup.bat  tomcat-juli.jar  tool-wrapper.bat      version.bat
```

- 启动

```
./startup.sh
```

- 停止

```
./shutdown.sh
```

### 查看运行状态

```
ps aux | grep tomcat
```

或者 

```
ps -ef | grep tomcat
```

## 开放防火墙端口

- 开放端口 

```
firewall-cmd --zone=public --add-port=8080/tcp --permanent
firewall-cmd --zone=public --add-port=80/tcp --permanent
```

- 使配置生效 

```
firewall-cmd --reload
```

- 查看开放结果

```
firewall-cmd --zone=public --query-port=8080/tcp
```

返回 yes, 说明成功。


ps: 如果想通过 80 端口访问，可以开放一下 80 端口。

```
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --reload
firewall-cmd --zone=public --query-port=80/tcp
```

# 参考资料

[Cenos7安装jdk,tomcat,mysql5.7 零碎笔记](https://www.jianshu.com/p/e1e6b88b12b1)

[如何在CentOS 7上安装Tomcat 8.5](https://www.myfreax.com/how-to-install-tomcat-8-5-on-centos-7/)

* any list
{:toc}