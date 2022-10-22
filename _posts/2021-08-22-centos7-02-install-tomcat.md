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

## 端口开放

云服务器的端口 8080 默认是不开放的。



# 安装 tomcat8

## 下载

可以从官网 [https://tomcat.apache.org/download-80.cgi?Preferred=https%3A%2F%2Fapache.claz.org%2F](https://tomcat.apache.org/download-80.cgi?Preferred=https%3A%2F%2Fapache.claz.org%2F) 查看

选择最上面的 Binary Distributions > Core > tar.gz

```
# wget https://dlcdn.apache.org/tomcat/tomcat-8/v8.5.83/bin/apache-tomcat-8.5.83.tar.gz
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

### 启动报错

```
22-Oct-2022 21:17:32.622 SEVERE [main] org.apache.catalina.core.StandardServer.await Failed to create server shutdown socket on address [localhost] and port [8005] (base port [8005] and offset [0])
        java.net.BindException: Address already in use (Bind failed)
```

`8005` 这个端口被占用。

解决：

（1）查看占用线程

```
lsof -i:8005
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

# centos7 yum 安装 tomcat笔记

## 安装

（1）命令

```
$   yum -y install tomcat
```

（2）查询 tomcat 是否安装成功

```
$   rpm -q tomcat
```

（3）信息查看

```
$   yum info tomcat
```

## 升级

想把 tomcat 升级到 8.5.X

> [tomcat 版本说明](https://tomcat.apache.org/whichversion.html)

## 服务启动

（1）启动

```
$   systemctl start tomcat.service
```

（2）状态查看

```
$   systemctl status tomcat.service
```

或者

```
$   systemctl status tomcat
```

最重要的Tomcat的文件将位于 `/usr/share/tomcat`。 

如果你已经有了，你想运行一个Tomcat应用程序，你可以将它放在 `/usr/share/tomcat/webapps` 的目录，配置Tomcat，并重新启动Tomcat服务。

## 其他常见命令

（1）tomcat 启动

```
sudo systemctl start tomcat
```

（2）tomcat 重启

```
sudo systemctl restart tomcat
```

（3）开机重启

```
sudo systemctl enable tomcat
```

（4）服务停止

```
sudo systemctl stop tomcat
```

（5）服务删除

```
yum remove tomcat
```


## 页面访问

现在Tomcat已经启动并运行，让我们在Web浏览器中访问Web管理界面。您可以通过访问服务器的公共IP地址，在端口8080上：

```
http://server_IP_address:8080
```

管理页面：

```
http:// server_IP_address :8080/manager/html
```

### 页面无法访问

可能会出现页面无法访问的情况。

（1）缺少管理界面

因为前面安装的是 tomcat 的基础服务，并没有安装浏览器管理界面，接下来我们需要安装管理包

（2）防火墙问题

执行命令 `firewall-cmd --zone=public --add-port=8080/tcp --permanent` 永久开放8080端口，否则会导致无法访问

开放8080后执行 `systemctl restart firewalld.service` 重启防火墙

（3）云服务器本身问题

个人使用的某云服务器测试，发现没有 Firewall，服务也不通。

后来发现在服务器控台-防火墙中可以配置。 T_T

## 安装管理包

安装Tomcat根页面（tomcat-webapps）和Tomcat Web应用程序管理器和Virtual Host Manager（tomcat-admin-webapps），请运行以下命令：

```
$   sudo yum install tomcat-webapps tomcat-admin-webapps
```

会安装如下的内容到 `/usr/share/tomcat/webapps` 文件夹下：

```
examples  host-manager  manager  ROOT  sample
```

重启服务：

```
$   sudo systemctl restart tomcat
```

# scp 卡住问题

## 现象

scp大文件时速度为0.0KB/s，且出现stalled：

```
scp ROOT.zip root@xxx:/app/ROOT.zip
ROOT.zip                                                                                                                     44% 2064KB   0.0KB/s - stalled -
```

## 尝试解决

### -l 8192

尝试限制速度，失败

```
scp -l 8192 xxxxxx
```

发现不行，依然越来越来，然后变成 0。

### -C

尝试提速，降低stalled的概率，成功

```
scp -C xxxxxxx
```

# 参考资料

[Cenos7安装jdk,tomcat,mysql5.7 零碎笔记](https://www.jianshu.com/p/e1e6b88b12b1)

[如何在CentOS 7上安装Tomcat 8.5](https://www.myfreax.com/how-to-install-tomcat-8-5-on-centos-7/)

[centos7 yum 安装 tomcat](https://www.cnblogs.com/nicknailo/p/8571004.html)

https://blog.csdn.net/github_38336924/article/details/82253553

[scp大文件出现stalled](https://blog.csdn.net/weixin_43652082/article/details/104111393)

## tomcat9

[Tomcat9新特性及升级注意事项](http://javakk.com/2421.html)

[CENTOS7 YUM安装TOMCAT9[亲测可用]](https://www.freesion.com/article/5870470392/)

https://blog.csdn.net/KeithQin/article/details/123631488

[Linux 查看端口占用情况](https://www.runoob.com/w3cnote/linux-check-port-usage.html)

* any list
{:toc}