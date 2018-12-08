---
layout: post
title: Centos7 Java Install
date: 2018-12-06 11:35:23 +0800
categories: [Java]
tags: [linux, java, sh]
published: true
excerpt: Centos7 Java 安装
---

# JRE8 下载

[下载地址](https://www.oracle.com/technetwork/java/javase/downloads/server-jre8-downloads-2133154.html)

下载之后上传到 centos 服务器

```
scp server-jre-8u191-linux-x64.tar.gz root@66.42.49.251:/root/tool/jdk
```

查看上传结果

```
[root@vultr jdk]# ll -h
总用量 53M
-rw-r--r-- 1 root root 53M 12月  8 03:10 server-jre-8u191-linux-x64.tar.gz
```


## 命令下载

因为需要接受 oracle 的约定，所以这个下载是空的。

只能使用原来的下载上传的方式。

- 执行下载命令

```
wget https://download.oracle.com/otn-pub/java/jdk/8u191-b12/2787e4a523244c269598db4e85c51e0c/server-jre-8u191-linux-x64.tar.gz
```

- 信息如下：

```
[root@vultr jdk]# ll -h
总用量 8
-rw-r--r-- 1 root root 5307 3月  20 2012 server-jre-8u191-linux-x64.tar.gz
```

# 解压

```
tar -zxf server-jre-8u191-linux-x64.tar.gz
```

- 信息查看

```
[root@vultr jdk]# ll -h
总用量 53M
drwxr-xr-x 7   10  143 4.0K 10月  6 12:52 jdk1.8.0_191
-rw-r--r-- 1 root root  53M 12月  8 03:10 server-jre-8u191-linux-x64.tar.gz
```

jdk 的路径

```
/root/tool/jdk/jdk1.8.0_191/
```

# 授权

JRE 及其子目录设置 root 权限

```
chown root:root -R /root/tool/jdk/jdk1.8.0_191/
```

# 配置环境变量

## 编辑配置文件

`vi /etc/profile`  在文件末尾添加：

```
export JRE_HOME=/root/tool/jdk/jdk1.8.0_191/
export CLASSPATH=$JRE_HOME/lib/rt.jar:$JRE_HOME/lib/ext
export PATH=$PATH:$JRE_HOME/bin
```

保存退出。

## 使环境变量即时生效

```
source /etc/profile
```

## 测试

```
java -version
```

日志如下：

```
java version "1.8.0_191"
Java(TM) SE Runtime Environment (build 1.8.0_191-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.191-b12, mixed mode)
```

# 参考资料

[Centos7.3安装和配置jre1.8](https://www.cnblogs.com/wishwzp/p/7113389.html)

* any list
{:toc}