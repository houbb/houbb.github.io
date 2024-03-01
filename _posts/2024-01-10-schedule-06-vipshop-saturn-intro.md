---
layout: post
title: schedule-06-vipshop saturn 唯品会分布式任务调度平台
date: 2024-01-10 21:01:55 +0800
categories: [Schedule]
tags: [schedule, apache, distribued, work-flow, sh]
published: true
---

# 简介

Saturn (任务调度系统)是唯品会开源的一个分布式任务调度平台，取代传统的Linux Cron/Spring Batch Job的方式，做到全域统一配置，统一监控，任务高可用以及分片并发处理。

Saturn是在当当开源的Elastic Job基础上，结合各方需求和我们的实践见解改良而成。

本文档针适用于3.x版本。

## 重要特性

- 支持多种语言作业，语言无关(Java/Go/C++/PHP/Python/Ruby/shell)

- 支持秒级调度

- 支持作业分片并行执行

- 支持依赖作业串行执行

- 支持作业高可用和智能负载均衡

- 支持异常检测和自动失败转移

- 支持异地容灾

- 支持多个集群部署

- 支持跨机房区域部署

- 支持弹性动态扩容

- 支持优先级和权重设置

- 支持docker容器，容器化友好

- 支持cron时间表达式

- 支持多个时间段暂停执行控制

- 支持超时告警和超时强杀控制

- 支持灰度发布

- 支持异常、超时和无法高可用作业监控告警和简易的故障排除

- 支持失败率最高、最活跃和负荷最重的各域各节点TOP10的作业统计

- 经受住唯品会生产800多个节点，每日10亿级别的调度考验

# 1 一键启动

## 需要

首先，请确保本机安装了以下软件：

JDK 7 or JDK 8
Maven 3.0.4+
node.js 8.7.0+
npm 5.4.2+
docker (版本不限)

## 下载

然后，git clone本仓库到本地，checkout对应版本分支，进入quickstart目录。

如果是Windows系统，请运行quickstart.bat，如果是Linux/Unix/MacOS系统，请运行quickstart.sh。

```
$ git clone https://github.com/vipshop/Saturn
$ cd Saturn
$ git checkout develop
$ cd saturn-docker
$ chmod +x quickstart.sh
$ ./quickstart.sh
```

quickstart脚本将做如下事情：

- 启动内嵌的ZooKeeper

- 启动内嵌的Saturn-Console

- 启动内嵌的Saturn-Executor（包含了一个Java作业的实现）

PS: 这个设计非常好，不用自己搞半天。

在Saturn-Console添加该Java作业

启动完成后，您可以访问Saturn-Console：http://localhost:9088

如果你见到如下界面，则恭喜你，你的console已经启动。

![console](https://vipshop.github.io/Saturn/zh-cn/3.x/_media/home_page.jpg)

在首页的search bar点击会出现一个叫做'mydomain'的namespace。点击进去会见到一个名为'demoJavaJob'的作业，该作业有5个分片，每隔5秒调度一次。

![executor](https://vipshop.github.io/Saturn/zh-cn/3.x/_media/quickstart_demojob.jpg)

一个叫做'executor-1'的executor执行器调度该作业。

# 实测

## windows10 

quickstart.bat 启动失败

```bash
cd D:\github\Saturn\quickstart


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----          2024/2/1     10:09           5146 demo-java-job.jar
-a----          2024/2/1     10:09           2961 DemoJavaJob.java
-a----          2024/2/1     10:09           1494 quickstart.bat
-a----          2024/2/1     10:09           1836 quickstart.sh
```

运行 quickstart.bat

```
[ERROR] Failed to execute goal org.codehaus.mojo:exec-maven-plugin:3.1.0:exec (saturn-web) on project saturn-console-web: Command execution failed.: Cannot run program "sh" (in directory "D:\github\Saturn\saturn-console-web"): CreateProcess error=2, 系统找不到指定的文件。 -> [Help 1]
[ERROR]
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR]
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/MojoExecutionException
[ERROR]
[ERROR] After correcting the problems, you can resume the build with the command
[ERROR]   mvn <goals> -rf :saturn-console-web
[Step 2] Running Saturn Console, visit http://localhost:9088 after a few seconds
[Step 3] Running Saturn Executor
'jar' 不是内部或外部命令，也不是可运行的程序
或批处理文件。
系统找不到指定的路径。
已复制         0 个文件。
[Step 4] Add a demo java job
系统找不到指定的路径。
错误: 找不到或无法加载主类 demo.DemoJavaJob
[Step 5] Done, visit http://localhost:9088 for more,and you can visit http://localhost:9088/h2-console to connect to the in-memory db.
```


## WSL 重新尝试

```bash
$ git clone https://github.com/vipshop/Saturn
$ cd Saturn
$ git checkout develop
$ cd quickstart
$ chmod +x quickstart.sh
$ ./quickstart.sh
```




# 参考资料

https://vipshop.github.io/Saturn/#/zh-cn/3.x/

https://vipshop.github.io/Saturn/#/zh-cn/3.x/create_job

https://zhuanlan.zhihu.com/p/26277239

https://zhuanlan.zhihu.com/p/606258005

https://blog.csdn.net/weixin_38336658/article/details/108828616

* any list
{:toc}