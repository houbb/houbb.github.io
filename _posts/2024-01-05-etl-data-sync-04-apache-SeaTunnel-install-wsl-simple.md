---
layout: post
title: ETL-03-简化版 SeaTunnel install windows10 单机 WSL 安装笔记
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 说明

上一篇，我们花了很大的精力，去安装一个单机版本的 SeaTunnel。

回头看，我们可以把这个步骤简化。

# 环境准备

CentOS 7.6.18_x86_64
JDK >= 1.8.151
Maven >= 3.6.3
Apache Seatunnel ==2.3.3
Apache Seatunnel Web == 1.0.0
MySQL >= 5.7.28

# windows WSL 安装实战笔记

## jdk

```
dh@d:~$ java -version
Command 'java' not found, but can be installed with:
sudo apt install openjdk-11-jre-headless  # version 11.0.20.1+1-0ubuntu1~22.04, or
sudo apt install default-jre              # version 2:1.11-72build2
sudo apt install openjdk-17-jre-headless  # version 17.0.8.1+1~us1-0ubuntu1~22.04
sudo apt install openjdk-18-jre-headless  # version 18.0.2+9-2~22.04
sudo apt install openjdk-19-jre-headless  # version 19.0.2+7-0ubuntu3~22.04
sudo apt install openjdk-8-jre-headless   # version 8u382-ga-1~22.04.1
```

安装一下

```
sudo apt install openjdk-8-jre-headless
```

```
$ java -version
openjdk version "1.8.0_392"
OpenJDK Runtime Environment (build 1.8.0_392-8u392-ga-1~22.04-b08)
OpenJDK 64-Bit Server VM (build 25.392-b08, mixed mode)
```

### 配置 JAVA_HOME

```
update-alternatives --list java
```

如下：

```
/usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java
```

则对应的 java home 为：`/usr/lib/jvm/java-8-openjdk-amd64/jre`

我们修改一下 /etc/profile

```
sudo vi /etc/profile
```

添加对应的 java_home 信息：

```bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre
export SEATUNNEL_HOME=/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3
export PATH=$SEATUNNEL_HOME/bin:$JAVA_HOME/bin:$PATH
```

刷新配置：

```
source /etc/profile
```

测试：

```
$ echo $JAVA_HOME
/usr/lib/jvm/java-8-openjdk-amd64/jre
```

## maven 安装

```
mvn -v

$ mvn -v
Apache Maven 3.5.4 (1edded0938998edf8bf061f1ceb3cfdeccf443fe; 2018-06-18T02:33:14+08:00)
Maven home: /mnt/d/tool/maven/apache-maven-3.5.4
Java version: 1.8.0_392, vendor: Private Build, runtime: /usr/lib/jvm/java-8-openjdk-amd64/jre
Default locale: en, platform encoding: UTF-8
OS name: "linux", version: "5.15.133.1-microsoft-standard-wsl2", arch: "amd64", family: "unix"
```

## WSL 内核版本

```
dh@d:~$ uname -r
5.15.133.1-microsoft-standard-WSL2
dh@d:~$ uname -a
Linux d 5.15.133.1-microsoft-standard-WSL2 #1 SMP Thu Oct 5 21:02:42 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux
```

# 1-mysql 的安装

## mysql 安装

安装好对应的 mysql 5.7+。

## 脚本初始化

导出所有的建表语句和数据。

备份原来初始化好的数据库：

```sql
mysqldump -u admin -p  seatunnel > /home/dh/sql/seatunnel_backup.sql
```

# 创建安装软件目录

## 创建+下载 backend



创建seatunnel后端服务安装目录

```bash
# 创建文件夹
mkdir -p /home/dh/bigdata/
```

把对应的压缩包上传，解压。

> 官方下载地址：[https://seatunnel.apache.org/download/](https://seatunnel.apache.org/download/)

```bash
wget https://dlcdn.apache.org/seatunnel/2.3.3/apache-seatunnel-2.3.3-bin.tar.gz
tar -zxvf apache-seatunnel-2.3.3-bin.tar.gz
```

# 配置环境变量

配置 /etc/profile，添加内容：

直接 vi 修改 

```
sudo vi /etc/profile
```

加在末尾。

```bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre
export SEATUNNEL_HOME=/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3
export PATH=$SEATUNNEL_HOME/bin:$JAVA_HOME/bin:$PATH
```

配置立刻生效：

```bash
source /etc/profile
```

# 2. 安装 backend 后端

## 2.0 执行下载依赖包

简化插件内容，过滤掉无关的。

```bash
cp /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/config/plugin_config /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/config/plugin_config_bak

vi /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/config/plugin_config
```

指定内容如下，我们只下载需要的，比如 mysql cdc。

```
--connectors-v2--
connector-cdc-mysql
```

执行命令：

```bash
bash /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/install-plugin.sh
```

实际上为：

```bash
cd /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3
mvn dependency:get -DgroupId=org.apache.seatunnel -Dclassifier=optional -DartifactId=seatunnel-hadoop3-3.1.4-uber -Dversion=2.3.3 -Ddest=/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/lib
```

缺失的 mysql 包需要单独下载：

```bash
cd /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/lib
wget https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar
```

## 2.1 启动验证

```bash
#进入安装目录
$   cd /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3

# 启动服务
$   ./bin/seatunnel.sh --config ./config/v2.batch.config.template -e local
```

## 2.2 服务启动

```bash
#进入安装目录
cd /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3
# 关闭
bash bin/stop-seatunnel-cluster.sh
# 启动服务
nohup bash bin/seatunnel-cluster.sh 2>&1 &
```

日志查看在 

```bash
tail -f /home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/logs/seatunnel-engine-server.log
```

# 3. 安装 web 端

## 3.2.配置Seatunnel Web服务

### 3.2.1.数据库初始化

登录到数据库。

创建数据库：

```sql
create database seatunnel;
use seatunnel;
```

直接运行

```sql
source /path/to/seatunnel_init.sql;
```

### 3.2.2.配置WEB后端服务

#### 3.2.2.1.修改后端基础配置

web后端服务的配置文件都在 `${web安装目录}/conf` 下

```
$ pwd
/home/dh/bigdata/seatunnel-2.3.3/web/apache-seatunnel-web-1.0.0/conf

$ ll
total 24
drwxr-xr-x 2 dh dh 4096 Oct 11 13:36 ./
drwxr-xr-x 8 dh dh 4096 Oct 11 13:37 ../
-rw-r--r-- 1 dh dh 1740 Feb 18  2022 application.yml
-rw-r--r-- 1 dh dh 4141 Feb 18  2022 connector-datasource-mapper.yaml
-rw-r--r-- 1 dh dh 2533 Feb 18  2022 logback-spring.xml
```

vim conf/application.yml 修改端口号和数据源连接信息

```yaml
server:
  port: 18801

spring:
  application:
    name: seatunnel
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
  datasource:
    driver-class-name: com.mysql.jdbc.Driver
    url: jdbc:mysql://172.24.20.97:13306/seatunnel?useSSL=false&useUnicode=true&characterEncoding=utf-8&allowMultiQueries=true&allowPublicKeyRetrieval=true
    username: admin
    password: 123456
  mvc:
    pathmatch:
      matching-strategy: ant_path_matcher

jwt:
  expireTime: 86400
  secretKey: https://github.com/apache/seatunnel
  algorithm: HS256
```

### 3.2.5.启动WEB服务

这一步也很容易出错，很多人都配置对了，但是最后启动起来，发现无法通过浏览访问， 查看日志打印如下：

```
$ pwd
/home/dh/bigdata/seatunnel-2.3.3/web/apache-seatunnel-web-1.0.0

$ ll
total 100
drwxr-xr-x 8 dh dh  4096 Oct 11 13:37 ./
drwxr-xr-x 3 dh dh  4096 Jan  9 14:01 ../
-rw-r--r-- 1 dh dh   552 Feb 18  2022 DISCLAIMER
-rw-r--r-- 1 dh dh 32455 Feb 18  2022 LICENSE
-rw-r--r-- 1 dh dh 23737 Feb 18  2022 NOTICE
drwxr-xr-x 2 dh dh  4096 Jan  9 14:01 bin/
drwxr-xr-x 2 dh dh  4096 Jan  9 16:38 conf/
drwxr-xr-x 2 dh dh 12288 Jan  9 17:55 libs/
drwxr-xr-x 3 dh dh  4096 Jan  9 14:01 licenses/
drwxr-xr-x 2 dh dh  4096 Jan  9 16:26 script/
drwxr-xr-x 3 dh dh  4096 Jan  9 14:01 ui/
```

所以启动服务必须要保证服务可以访问到ui目录下的index.html文件才可以，因为项目启动前端的项目路径默认添加了/ui的前缀，所以后端项目的启动路径必须在ui目录的父级目录才可以，所以这里需要再web服务的安装目录下执行启动脚本，举例：

我这里的安装目录是 /home/dh/bigdata/seatunnel-2.3.3/web/apache-seatunnel-web-1.0.0, 所以我这里直接切换到该目录下，执行以下启动命令：

```sh
#进入web服务的安装目录
cd /home/dh/bigdata/seatunnel-2.3.3/web/apache-seatunnel-web-1.0.0
#执行启动脚本
chmod +x ./bin/seatunnel-backend-daemon.sh

./bin/seatunnel-backend-daemon.sh start
```

访问 http://127.0.0.1:18801 (此端口为conf/application.yml中配置的端口), 页面自动跳转到http://主机IP:12306/ui，

默认登录的用户名和密码：

username：admin
password：admin

# 参考资料

https://blog.csdn.net/qq_41865652/article/details/134574104

https://avoid.overfit.cn/post/ac32f113f8b8490d980ed761122c4237

* any list
{:toc}