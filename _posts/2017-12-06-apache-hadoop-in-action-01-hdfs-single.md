---
layout: post
title:  Apache Hadoop v3.3.6 in action-01-single mode 单机部署实战  windows10 wsl
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# hadoop 版本

> [https://cwiki.apache.org/confluence/display/HADOOP/Hadoop+Java+Versions](https://cwiki.apache.org/confluence/display/HADOOP/Hadoop+Java+Versions)

## Supported Java Versions

Apache Hadoop 3.3 and upper supports Java 8 and Java 11 (runtime only)
Please compile Hadoop with Java 8. Compiling Hadoop with Java 11 is not supported:  HADOOP-16795 - Java 11 compile support OPEN
Apache Hadoop from 3.0.x to 3.2.x now supports only Java 8
Apache Hadoop from 2.7.x to 2.10.x support both Java 7 and 8

需要 jdk 的环境为 jdk8。

# 环境准备

## wsl

windows10 安装的 wsl

## jdk8

这里推荐使用 jdk8，安装此处不再赘述。

本地版本：

```
$ java -version
openjdk version "1.8.0_302"
OpenJDK Runtime Environment (Zulu 8.56.0.21-CA-linux64) (build 1.8.0_302-b08)
OpenJDK 64-Bit Server VM (Zulu 8.56.0.21-CA-linux64) (build 25.302-b08, mixed mode)
```

# SSH 免密登录

## 说明 

hdfs 部署的时候，建议通过免密 SSH  登录的方式，集群和单机都是一个道理。

## 配置方式

先到用户目录

```bash
$ cd ~

$ pwd
/home/houbinbin
```

生成密钥：

```bash
# 目录若不存在，则在任意目录下执行就可以
# 生成秘钥文件，提示全部默认回车
ssh-keygen -t rsa -f ~/.ssh/id_rsa

# 将秘钥文件加入授权文件中
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```

## 验证

文件如下：

```bash
$ pwd
/home/houbinbin/.ssh

$ ll
total 20
drwx------ 2 houbinbin houbinbin 4096 Jan 18 23:39 ./
drwxr-x--- 8 houbinbin houbinbin 4096 Jan 18 23:38 ../
-rw-r--r-- 1 houbinbin houbinbin  579 Jan 18 23:39 authorized_keys
-rw------- 1 houbinbin houbinbin 2610 Jan 18 23:38 id_rsa
-rw-r--r-- 1 houbinbin houbinbin  579 Jan 18 23:38 id_rsa.pub
```

登录验证：

```bash
$ ssh localhost
```

# hadoop 下载

在 [https://dlcdn.apache.org/hadoop/common/hadoop-3.3.6/](https://dlcdn.apache.org/hadoop/common/hadoop-3.3.6/) 下载后上传。

或者执行命令：

```bash
wget https://dlcdn.apache.org/hadoop/common/hadoop-3.3.6/hadoop-3.3.6.tar.gz
```

## 解压

下载到：

```
/home/houbinbin/hadoop
```

执行命令解压：

```bash
tar -zxvf hadoop-3.3.6.tar.gz
```

目录如下：

```
$ pwd
/home/houbinbin/hadoop/hadoop-3.3.6

$ ls
LICENSE-binary  LICENSE.txt  NOTICE-binary  NOTICE.txt  README.txt  bin  etc  include  input  lib  libexec  licenses-binary  output  sbin  share
```

# 配置环境变量

## 编辑 /etc/profile

```
$	sudo vi /etc/profile
```

末尾添加如下内容：

```bash
export JAVA_HOME=/home/houbinbin/.sdkman/candidates/java/current
export HADOOP_HOME=/home/houbinbin/hadoop/hadoop-3.3.6
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin:$JAVA_HOME/bin
```

## 刷新生效

```
source /etc/profile
```

## 测试验证

```
$ java -version
openjdk version "1.8.0_302"
OpenJDK Runtime Environment (Zulu 8.56.0.21-CA-linux64) (build 1.8.0_302-b08)
OpenJDK 64-Bit Server VM (Zulu 8.56.0.21-CA-linux64) (build 25.302-b08, mixed mode)

$ hadoop version
Hadoop 3.3.6
Source code repository https://github.com/apache/hadoop.git -r 1be78238728da9266a4f88195058f08fd012bf9c
Compiled by ubuntu on 2023-06-18T08:22Z
Compiled on platform linux-x86_64
Compiled with protoc 3.7.1
From source with checksum 5652179ad55f76cb287d9c633bb53bbd
This command was run using /home/houbinbin/hadoop/hadoop-3.3.6/share/hadoop/common/hadoop-common-3.3.6.jar
```

# 修改 hadoop 配置文件

配置文件主要在 `/home/houbinbin/hadoop/hadoop-3.3.6/etc/hadoop` 目录下：

```
$ ls
capacity-scheduler.xml  hadoop-env.cmd              hadoop-user-functions.sh.example  httpfs-log4j.properties  kms-log4j.properties  mapred-env.sh               ssl-client.xml.example         yarn-env.cmd
configuration.xsl       hadoop-env.sh               hdfs-rbf-site.xml                 httpfs-site.xml          kms-site.xml          mapred-queues.xml.template  ssl-server.xml.example         yarn-env.sh
container-executor.cfg  hadoop-metrics2.properties  hdfs-site.xml                     kms-acls.xml             log4j.properties      mapred-site.xml             user_ec_policies.xml.template  yarn-site.xml
core-site.xml           hadoop-policy.xml           httpfs-env.sh                     kms-env.sh               mapred-env.cmd        shellprofile.d              workers                        yarnservice-log4j.properties
```

## 修改 hadoop-env.sh

```
vi /home/houbinbin/hadoop/hadoop-3.3.6/etc/hadoop/hadoop-env.sh
```

修改 hadoop-env.sh，添加如下内容：

```sh
# 增加配置
# JAVA_HOME 为你JDK的安装目录
export JAVA_HOME=/home/houbinbin/.sdkman/candidates/java/current
export HADOOP_HOME=/home/houbinbin/hadoop/hadoop-3.3.6
export HDFS_NAMENODE_USER=houbinbin
export HDFS_DATANODE_USER=houbinbin
export HDFS_SECONDARYNAMENODE_USER=houbinbin
export YARN_RESOURCEMANAGER_USER=houbinbin
export YARN_NODEMANAGER_USER=houbinbin
```

user 改为对应的执行用户即可，一般为 root

## 提前创建文件夹

```bash
# dfs 临时文件夹
$	mkdir -p /home/houbinbin/hadoop/dfs/temp

# 配置NameNode 元数据存放位置
$	mkdir -p /home/houbinbin/hadoop/dfs/name

# 配置DataNode在本地磁盘存放block的位置
$	mkdir -p /home/houbinbin/hadoop/dfs/data
```

## 修改配置文件 core-site.xml

修改 core-site.xml，在 configration 中添加配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <!-- 指定NameNode的地址,端口一般有8020、9000、9820 -->
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://127.0.0.1:9820</value>
    </property>
    <!-- 指定Hadoop临时数据的存储目录 -->
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/home/houbinbin/hadoop/dfs/temp</value>
    </property>
    <!-- 设置HDFS网页登录使用的静态用户为root -->
    <property>
        <name>hadoop.http.staticuser.user</name>
        <value>root</value>
    </property>
</configuration>
```

## hdfs-site.xml

修改如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>

<configuration>
	<!-- 设置NameNode Web端访问地址 -->
	<property>
		<name>dfs.namenode.http-address</name>
		<value>127.0.0.1:9870</value>
	</property>

	<!-- 配置NameNode 元数据存放位置-->
	<property>
		<name>dfs.namenode.name.dir</name>
		<value>/home/houbinbin/hadoop/dfs/name</value>
	</property>

	<!-- 配置DataNode在本地磁盘存放block的位置-->
	<property>
		<name>dfs.datanode.data.dir</name>
		<value>/home/houbinbin/hadoop/dfs/data</value>
	</property>

	<!-- 配置数据块的副本数,配置默认是3,应小于DataNode机器数量-->
	<property>
		<name>dfs.replication</name>
		<value>1</value>
	</property>
</configuration>
```

# 运行 HDFS

## 格式化 HDFS

```bash
# 进入目录
cd /home/houbinbin/hadoop/hadoop-3.3.6

# 格式化HDFS文件系统
bin/hdfs namenode -format
```

## 启动 HDFS

```bash
cd /home/houbinbin/hadoop/hadoop-3.3.6
sbin/start-dfs.sh
```

日志：

```
Starting namenodes on [localhost]
Starting datanodes
Starting secondary namenodes [PC-20230404XHIO]
PC-20230404XHIO: Warning: Permanently added 'pc-20230404xhio' (ED25519) to the list of known hosts.
```

## jps 确认

```
$ jps
3426 SecondaryNameNode
3188 DataNode
3612 Jps
3055 NameNode
```

## web 查看

浏览器直接访问：

> [http://127.0.0.1:9870/](http://127.0.0.1:9870/)

# chat

## windowsWSL ssh localhost  被拒绝

如果你在Windows上使用Windows Subsystem for Linux (WSL)并尝试通过SSH连接到本地主机时遇到“被拒绝”的问题，有几个可能的原因和解决方法：

1. **SSH服务器未安装：** 确保在WSL中安装了SSH服务器。你可以使用以下命令安装：

    ```bash
    sudo apt update
    sudo apt install openssh-server
    ```

2. **SSH服务器未启动：** 安装完SSH服务器后，确保它已经启动。你可以使用以下命令：

    ```bash
    sudo service ssh start
    ```

3. **防火墙问题：** 检查Windows防火墙或其他安全软件是否阻止SSH连接。你可能需要在防火墙中允许SSH流量，或者通过Windows Defender防病毒和防火墙设置中的“允许应用通过防火墙”选项来添加SSH。

4. **SSH配置：** 检查SSH服务器配置。确保SSH服务器配置允许连接，特别是检查`/etc/ssh/sshd_config`文件。

5. **监听地址：** 确保SSH服务器正在监听正确的地址。在`/etc/ssh/sshd_config`文件中，确保有类似以下行：

    ```
    ListenAddress 0.0.0.0
    ```

    这将使SSH服务器监听所有可用的网络接口。

6. **密码或密钥验证：** 如果你使用密码进行身份验证，请确保提供了正确的用户名和密码。如果使用密钥进行身份验证，请确保密钥匹配，并且私钥文件的权限设置正确。

7. **查看SSH服务器状态：** 你可以使用以下命令检查SSH服务器的状态：

    ```bash
    sudo service ssh status
    ```

    这应该提供有关SSH服务器是否正在运行以及是否有错误的信息。

请根据具体情况检查这些因素，找到问题的根本原因并进行相应的修复。如果问题仍然存在，请提供更多详细信息，以便更好地帮助你解决问题。




# 参考资料

[Hadoop3.3.3单机版搭建](https://blog.csdn.net/qq_44896640/article/details/125504968)

https://blog.csdn.net/qq_61645895/article/details/122386417

https://www.cnblogs.com/zhouwenfan-home/p/12310172.html

* any list
{:toc}