---
layout: post
title: Rocketmq-02-mac/linux 安装笔记
date: 2022-03-18 21:01:55 +0800
categories: [Apache]
tags: [mq, rocketmq, jms]
published: true
---

> [从零手写实现 mq](https://github.com/houbb/mq)

# Quick Start

[quick start](https://github.com/alibaba/RocketMQ/wiki/quick-start)

## 需要

```
64位操作系统，最好是Linux/Unix/Mac；
64位JDK 1.6+；
Maven 3.x
Git
Screen
```

## JDK

```
houbinbindeMacBook-Pro:aliyun-ons-client-java houbinbin$ java -version
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
```

## 下载和安装

- 下载 RocketMQ

从这里下载：`https://github.com/alibaba/RocketMQ/releases`，当前版本标签为 `3.5.8`

```
$ ls
RocketMQ-3.5.8		RocketMQ-3.5.8.tar.gz
```

- 安装

```
$ pwd
/Users/houbinbin/it/tools/rocketMQ/RocketMQ-3.5.8

$ bash install.sh
...
```

然后我们得到

```
 To refactor, move this assembly into a child project and use the flag <useAllReactorProjects>true</useAllReactorProjects> in each moduleSet.
[INFO] Building tar: /Users/houbinbin/IT/tools/rocketMQ/RocketMQ-3.5.8/target/alibaba-rocketmq-broker.tar.gz
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary:
[INFO]
[INFO] rocketmq-all 3.5.8 ................................. SUCCESS [ 48.565 s]
[INFO] rocketmq-remoting 3.5.8 ............................ SUCCESS [  1.772 s]
[INFO] rocketmq-common 3.5.8 .............................. SUCCESS [  1.348 s]
[INFO] rocketmq-client 3.5.8 .............................. SUCCESS [  1.522 s]
[INFO] rocketmq-store 3.5.8 ............................... SUCCESS [  0.815 s]
[INFO] rocketmq-srvutil 3.5.8 ............................. SUCCESS [  0.139 s]
[INFO] rocketmq-broker 3.5.8 .............................. SUCCESS [  0.951 s]
[INFO] rocketmq-tools 3.5.8 ............................... SUCCESS [  0.889 s]
[INFO] rocketmq-namesrv 3.5.8 ............................. SUCCESS [  0.373 s]
[INFO] rocketmq-example 3.5.8 ............................. SUCCESS [  0.392 s]
[INFO] rocketmq-filtersrv 3.5.8 ........................... SUCCESS [  0.337 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 59.323 s
[INFO] Finished at: 2017-01-02T18:21:01+08:00
[INFO] Final Memory: 52M/1042M
[INFO] ------------------------------------------------------------------------
```

## 环境配置


确保以下环境变量正确设置：```JAVA_HOME```

现在设置 ROCKETMQ_HOME 环境变量：

```
cd devenv

echo "ROCKETMQ_HOME=`pwd`" >> ~/.bash_profile
```

立即生效：

```
source ~/.bash_profile
```

> 启动 RocketMQ Name Server 和 Broker

确保在 ```devenv``` 目录下：

```
$ cd bin
$ pwd
/Users/houbinbin/it/tools/rocketMQ/RocketMQ-3.5.8/devenv/bin
```

- 启动 Name Server

```
screen bash mqnamesrv
```

现实是可能会遇到这个:

```
$ screen bash mqnamesrv
[screen is terminating]
```

[screen is terminating](http://superuser.com/questions/781591/screen-is-terminating-for-non-root)

执行以下命令(暂时提权):

```
su
```

使用 ```screen``` 命令进入, 运行:

```
$   bash mqnamesrv
```

接下来

```
sh-3.2# bash mqnamesrv
Java HotSpot(TM) 64-Bit Server VM warning: ignoring option PermSize=128m; support was removed in 8.0
Java HotSpot(TM) 64-Bit Server VM warning: ignoring option MaxPermSize=320m; support was removed in 8.0
Java HotSpot(TM) 64-Bit Server VM warning: UseCMSCompactAtFullCollection is deprecated and will likely be removed in a future release.
The Name Server boot success. serializeType=JSON
```


如果您看到 "The Name Server boot success. serializeType=JSON"，这表示命名服务器已成功启动。

按下 ```Ctrl + A```，然后按 ```D``` 分离会话。

```
sh-3.2# screen
[detached]
```

## Start Broker 启动 broker


```
sh-3.2# screen
sh-3.2# pwd
/Users/houbinbin/it/tools/rocketMQ/RocketMQ-3.5.8/devenv/bin
sh-3.2# bash mqbroker -n localhost:9876
cp: /var/root/rmq_bk_gc.log: No such file or directory
Java HotSpot(TM) 64-Bit Server VM warning: ignoring option PermSize=128m; support was removed in 8.0
Java HotSpot(TM) 64-Bit Server VM warning: ignoring option MaxPermSize=320m; support was removed in 8.0
Java HotSpot(TM) 64-Bit Server VM warning: UseCMSCompactAtFullCollection is deprecated and will likely be removed in a future release.
Java HotSpot(TM) 64-Bit Server VM warning: Cannot open file /var/root/tmpfs/logs/gc.log due to No such file or directory

The broker[houbinbindeMacBook-Pro.local, 192.168.2.102:10911] boot success. serializeType=JSON and name server is localhost:9876
```

如果您看到类似以下输出：

```The broker[lizhanhui-Lenovo, 172.30.30.233:10911] boot success. serializeType=JSON and name server is localhost:9876```，则您的 broker 已成功运行。

## 发送和接收消息

在发送/接收消息之前，我们需要告诉客户端名称服务器的位置。RocketMQ 提供了多种实现方式。
为简单起见，我们使用环境变量 ```NAMESRV_ADDR```。

```
$   export NAMESRV_ADDR=localhost:9876
```

# 参考资料

> [3.4.6 demo zh_CN](http://blog.csdn.net/crazyxq/article/details/52870502)

> [blog zh_CN](http://blog.csdn.net/crazyxq/article/details/52870502)

> [rocketmq console zh_CN](http://blog.csdn.net/pandajava/article/details/50833878)

> [分布式](http://blog.csdn.net/qq_19244267/article/details/52411883)

* any list
{:toc}