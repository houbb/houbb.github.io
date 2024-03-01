---
layout: post
title: schedule-09-分布式任务调度框架 LTS light-task-scheduler 安装笔记
date: 2024-01-10 21:01:55 +0800
categories: [Schedule]
tags: [schedule, apache, distribued, work-flow, sh]
published: true
---


# 准备工作

## 1、 JDK

Jdk1.6 or later

```
$ java -version
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
```

## 2、 Maven

```
$ mvn --v
Apache Maven 3.3.9 (bb52d8502b132ec0a5a3f4c09453c07478323dc5; 2015-11-11T00:41:47+08:00)
Maven home: /usr/local/maven/maven3.3.9
Java version: 1.8.0_91, vendor: Oracle Corporation
Java home: /Library/Java/JavaVirtualMachines/jdk1.8.0_91.jdk/Contents/Home/jre
Default locale: zh_CN, platform encoding: UTF-8
OS name: "mac os x", version: "10.11.3", arch: "x86_64", family: "mac"
```

## 3、 Zookeeper

```
$ pwd
/Users/houbinbin/it/tools/zookeeper/server1/zookeeper-3.4.9/bin
$ ./zkServer.sh start
ZooKeeper JMX enabled by default
Using config: /Users/houbinbin/it/tools/zookeeper/server1/zookeeper-3.4.9/bin/../conf/zoo.cfg
Starting zookeeper ... STARTED
$ jps
14064 QuorumPeerMain
14067 Jps
13884
```

## 4、 MySQL

Create database named ```lts```.

```
$ mysql -V
/usr/local/mysql/bin/mysql  Ver 14.14 Distrib 5.6.30, for osx10.11 (x86_64) using  EditLine wrapper
```

# 安装

## 下载

- [Download](https://github.com/ltsopensource/light-task-scheduler)

git clone

```
$ git clone https://github.com/ltsopensource/light-task-scheduler
Cloning into 'light-task-scheduler'...
remote: Counting objects: 25026, done.
remote: Compressing objects: 100% (58/58), done.
remote: Total 25026 (delta 9), reused 0 (delta 0), pack-reused 24936
Receiving objects: 100% (25026/25026), 97.44 MiB | 805.00 KiB/s, done.
Resolving deltas: 100% (10757/10757), done.
Checking connectivity... done.
```

## 打包

文件在 ```light-task-scheduler```

```
$ cd ~/it/tools/light-task-scheduler/
$ ls
LICENSE			build.sh		lts-admin		lts-jobtracker		lts-startup		开发计划.md
README.md		docs			lts-core		lts-monitor		lts-tasktracker		开发者规范.md
build.cmd		lts			lts-jobclient		lts-spring		pom.xml
```

只打包 **lts-admin**。

你需要执行 ```clean install lts-core``` 和 ```clean install lts-monitor```，然后再打包 **lts-admin**。

日志可能如下所示：

```
[INFO] Copying webapp resources [/Users/houbinbin/IT/tools/light-task-scheduler/lts-admin/src/main/webapp]
[INFO] Webapp assembled in [383 msecs]
[INFO] Building war: /Users/houbinbin/IT/tools/light-task-scheduler/lts-admin/target/lts-admin-1.7.0-SNAPSHOT.war
[INFO] WEB-INF/web.xml already added, skipping
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 3.912s
[INFO] Finished at: Sat Oct 22 15:08:53 CST 2016
[INFO] Final Memory: 20M/302M
[INFO] ------------------------------------------------------------------------

Process finished with exit code 0
```

注意: 

1. 确保已经创建了数据库 ```lts```

2. MySQL 访问应该是 ```root/root```，

或者你需要将 ```lts-admin.cfg``` 和 ```lts-monitor.cfg``` 中的数据库访问改成 **lts-admin** 的样式，如下所示：


```cfg
# ------ 这个是Admin存储数据的地方,也可以和JobQueue的地址一样 ------
configs.jdbc.url=jdbc:mysql://127.0.0.1:3306/lts
configs.jdbc.username=root
configs.jdbc.password=123456
```

## tomcat 启动

- Tomcat run

拷贝 ```lts-admin-${version}.war``` 到 tomcat

```
$ mv /Users/houbinbin/IT/tools/light-task-scheduler/lts-admin/target/lts-admin-1.7.0-SNAPSHOT.war ~/it/tools/tomcat/tomcat8/webapps/ROOT.war
$ cd ~/it/tools/tomcat/tomcat8/webapps

$ ls
ROOT		ROOT.war
```

或者在 ```lts-admin``` module 使用 tomcat 插件。

```
$   mvn tomcat7:run
```

## 访问

在浏览器中输入 ```localhost:8081```，默认访问的用户名和密码是 ```admin/admin```。

# Quick Start

## 准备

通过 idea 打开入门例子， [Import example](https://github.com/ltsopensource/lts-examples)

1） Start Zookeeper

2） Start MySQL

3）创建 lts 数据库。

```
mysql> use lts;
Database changed
mysql> show tables;
Empty set (0.00 sec)
```

## 运行

### Start JobTracker

如果你的 MySQL 登录不是 ```root/root```，你需要在 ```lts.properties``` 中更改 MySQL 配置，然后运行：

```
lts-examples/lts-example-jobtracker/lts-example-jobtracker-java/src/main/java/com/github/ltsopensource/example/java/Main.java
```

日志

```
2016-10-22 14:25:55,352 [main] (AbstractLogger.java:31) INFO  com.github.ltsopensource.core.registry.RegistryStatMonitor  -  [LTS] Registry available, lts version: 1.6.9, current host: 192.168.1.3
2016-10-22 14:25:55,362 [main] (AbstractRegistry.java:62) INFO  com.github.ltsopensource.core.registry.Registry  -  [LTS] Subscribe: {"address":"192.168.1.3:35001","available":true,"clusterName":"test_cluster","createTime":1477117553921,"group":"lts","hostName":"houbinbindeMacBook-Pro.local","httpCmdPort":8719,"identity":"JT_192.168.1.3_14530_14-25-53.906_1","ip":"192.168.1.3","listenNodeTypes":["JOB_CLIENT","TASK_TRACKER","JOB_TRACKER","MONITOR"],"nodeType":"JOB_TRACKER","port":35001,"threads":64}, lts version: 1.6.9, current host: 192.168.1.3
2016-10-22 14:25:55,380 [main] (AbstractRegistry.java:37) INFO  com.github.ltsopensource.core.registry.Registry  -  [LTS] Register: {"address":"192.168.1.3:35001","available":true,"clusterName":"test_cluster","createTime":1477117553921,"group":"lts","hostName":"houbinbindeMacBook-Pro.local","httpCmdPort":8719,"identity":"JT_192.168.1.3_14530_14-25-53.906_1","ip":"192.168.1.3","listenNodeTypes":["JOB_CLIENT","TASK_TRACKER","JOB_TRACKER","MONITOR"],"nodeType":"JOB_TRACKER","port":35001,"threads":64}, lts version: 1.6.9, current host: 192.168.1.3
2016-10-22 14:25:55,392 [main] (AbstractLogger.java:31) INFO  com.github.ltsopensource.core.cluster.JobNode  -  [LTS] ========== Start success, nodeType=JOB_TRACKER, identity=JT_192.168.1.3_14530_14-25-53.906_1, lts version: 1.6.9, current host: 192.168.1.3
```

### Start TaskTracker

run

```
lts-examples/lts-example-tasktracker/lts-example-tasktracker-java/src/main/java/com/github/ltsopensource/example/java/Main.java
```

日志

```
2016-10-22 14:28:49,943 [ZkClient-EventThread-29-127.0.0.1:2181] (AbstractLogger.java:31) INFO  com.github.ltsopensource.core.cluster.MasterElector  -  [LTS] Current node become the master node:{"address":"192.168.1.3:0","available":true,"clusterName":"test_cluster","createTime":1477117728807,"group":"test_trade_TaskTracker","hostName":"houbinbindeMacBook-Pro.local","httpCmdPort":8720,"identity":"TT_192.168.1.3_14571_14-28-48.784_1","ip":"192.168.1.3","nodeType":"TASK_TRACKER","port":0,"threads":64}, lts version: 1.6.9, current host: 192.168.1.3
2016-10-22 14:28:49,943 [main] (AbstractLogger.java:31) INFO  com.github.ltsopensource.core.cluster.JobNode  -  [LTS] ========== Start success, nodeType=TASK_TRACKER, identity=TT_192.168.1.3_14571_14-28-48.784_1, lts version: 1.6.9, current host: 192.168.1.3
2016-10-22 14:28:49,944 [ZkClient-EventThread-29-127.0.0.1:2181] (AbstractLogger.java:31) INFO  com.github.ltsopensource.core.support.RetryScheduler  -  [LTS] Start JobPushProcessor master RetryScheduler success, identity=[TT_192.168.1.3_14571_14-28-48.784_1], lts version: 1.6.9, current host: 192.168.1.3
```

### Start ClientTracker

run

```
lts-examples/lts-example-jobclient/lts-example-jobclient-java/src/main/java/com/github/ltsopensource/example/java/Main.java
```

log

```
2016-10-22 14:30:56,216 [main] (AbstractLogger.java:31) INFO  com.github.ltsopensource.core.cluster.JobNode  -  [LTS] ========== Start success, nodeType=JOB_CLIENT, identity=JC_192.168.1.3_14599_14-30-55.128_1, lts version: 1.6.9, current host: 192.168.1.3
```

在 **LTS-Admin** 的管理页面上，您可以获取有关它们的信息。

# Try in Ubuntu

## 下载

```
$   git clone https://github.com/ztajy/light-task-scheduler.git

root@iZuf60ahcky4k4nfv470juZ:~/code/light-task-scheduler# ls
build.cmd  build.sh  docs  lts  lts-admin  lts-core  lts-example  lts-jobclient  lts-jobtracker  lts-logger  lts-queue  lts-spring  lts-startup  lts-tasktracker  pom.xml  README.md
```

## 部署

JobTracker和LTS-Admin部署

1、运行根目录下的sh build.sh或build.cmd脚本，会在dist目录下生成lts-{version}-bin文件夹 

```
$   sh  build.sh

...
...
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 5.245 s
[INFO] Finished at: 2016-09-27T14:06:20+08:00
[INFO] Final Memory: 12M/30M
[INFO] ------------------------------------------------------------------------

root@iZuf60ahcky4k4nfv470juZ:~/code/light-task-scheduler/dist# pwd
/root/code/light-task-scheduler/dist
root@iZuf60ahcky4k4nfv470juZ:~/code/light-task-scheduler/dist# ls
lts-1.6.3-SNAPSHOT-bin
```

2、下面是其目录结构，其中bin目录主要是JobTracker和LTS-Admin的启动脚本。
jobtracker 中是 JobTracker的配置文件和需要使用到的jar包，lts-admin是LTS-Admin相关的war包和配置文件。 


- lts-{version}-bin的文件结构

```
├── bin
│   ├── jobtracker.cmd
│   ├── jobtracker.sh
│   ├── lts-admin.cmd
│   └── lts-admin.sh
├── jobtracker
│   ├── conf
│   │   └── zoo
│   │       ├── jobtracker.cfg
│   │       └── log4j.properties
│   └── lib
│       └── *.jar
├── lts-admin
│   ├── conf
│   │   ├── log4j.properties
│   │   └── lts-admin.cfg
│   ├── lib
│   │   └── *.jar
│   └── lts-admin.war
└── tasktracker
    ├── bin
    │   └── tasktracker.sh
    ├── conf
    │   ├── log4j.properties
    │   └── tasktracker.cfg
    └── lib
        └── *.jar
```

3、JobTracker启动。如果你想启动一个节点，直接修改下conf/zoo下的配置文件，然后运行 sh jobtracker.sh zoo start即可，
如果你想启动两个JobTracker节点，那么你需要拷贝一份zoo,譬如命名为zoo2,修改下zoo2下的配置文件，
然后运行sh jobtracker.sh zoo2 start即可。logs文件夹下生成jobtracker-zoo.out日志。

4、LTS-Admin启动.修改lts-admin/conf下的配置，然后运行bin下的sh lts-admin.sh或lts-admin.cmd脚本即可。
logs文件夹下会生成lts-admin.out日志，启动成功在日志中会打印出访问地址，用户可以通过这个访问地址访问了。

* any list
{:toc}

