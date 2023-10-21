---
layout: post
title: Arthas-01-java 线上问题定位处理的终极利器
date: 2023-10-21 21:01:55 +0800
categories: [Tool]
tags: [tool, jvm, sh]
published: true
---


# 前言

在使用 Arthas 之前，当遇到 Java 线上问题时，如 CPU 飙升、负载突高、内存溢出等问题，你需要查命令，查网络，然后 jps、jstack、jmap、jhat、jstat、hprof 等一通操作。

最终焦头烂额，还不一定能查出问题所在。

而现在，大多数的常见问题你都可以使用 Arthas 轻松定位，迅速解决，及时止损，准时下班。

# 1、Arthas 介绍

Arthas 是 Alibaba 在 2018 年 9 月开源的 Java 诊断工具。

支持 JDK6+， 采用命令行交互模式，提供 Tab 自动不全，可以方便的定位和诊断线上程序运行问题。截至本篇文章编写时，已经收获 Star 17000+。

Arthas 官方文档十分详细，本文也参考了官方文档内容，同时在开源在的 Github 的项目里的 Issues 里不仅有问题反馈，更有大量的使用案例，也可以进行学习参考。

开源地址：https://github.com/alibaba/arthas

官方文档：https://alibaba.github.io/arthas

# Arthas 使用场景

得益于 Arthas 强大且丰富的功能，让 Arthas 能做的事情超乎想象。

下面仅仅列举几项常见的使用情况，更多的使用场景可以在熟悉了 Arthas 之后自行探索。

是否有一个全局视角来查看系统的运行状况？

为什么 CPU 又升高了，到底是哪里占用了 CPU ？

运行的多线程有死锁吗？有阻塞吗？

程序运行耗时很长，是哪里耗时比较长呢？如何监测呢？

这个类从哪个 jar 包加载的？为什么会报各种类相关的 Exception？

我改的代码为什么没有执行到？难道是我没 commit？分支搞错了？

遇到问题无法在线上 debug，难道只能通过加日志再重新发布吗？

有什么办法可以监控到 JVM 的实时运行状态？

# Arthas 怎么用

前文已经提到，Arthas 是一款命令行交互模式的 Java 诊断工具，由于是 Java 编写，所以可以直接下载相应 的 jar 包运行。

## 安装

可以在官方 Github 上进行下载，如果速度较慢，可以尝试国内的码云 Gitee 下载。

```sh
# github下载
wget https://alibaba.github.io/arthas/arthas-boot.jar
# 或者 Gitee 下载
wget https://arthas.gitee.io/arthas-boot.jar
```

windows 直接打开对应的链接下载即可。


### 帮助信息

```sh
# 打印帮助信息
java -jar arthas-boot.jar -h
```

如下：

```
PS D:\tools\arthas> java -jar arthas-boot.jar -h
[INFO] JAVA_HOME: C:\Program Files\Java\jre1.8.0_192
[INFO] arthas-boot version: 3.7.1
Usage: arthas-boot [-f <value>] [--height <value>] [-c <value>]
       [--disabled-commands <value>] [--session-timeout <value>] [--attach-only]
       [--arthas-home <value>] [-h] [--telnet-port <value>] [--target-ip
       <value>] [--http-port <value>] [--repo-mirror <value>] [--use-version
       <value>] [--versions] [--use-http] [--select <value>] [--tunnel-server
       <value>] [--password <value>] [--stat-url <value>] [--app-name <value>]
       [--width <value>] [--username <value>] [--agent-id <value>] [-v] [pid]

Bootstrap Arthas

EXAMPLES:
  java -jar arthas-boot.jar <pid>
  java -jar arthas-boot.jar --telnet-port 9999 --http-port -1
  java -jar arthas-boot.jar --username admin --password <password>
  java -jar arthas-boot.jar --tunnel-server 'ws://192.168.10.11:7777/ws'
--app-name demoapp
  java -jar arthas-boot.jar --tunnel-server 'ws://192.168.10.11:7777/ws'
--agent-id bvDOe8XbTM2pQWjF4cfw
  java -jar arthas-boot.jar --stat-url 'http://192.168.10.11:8080/api/stat'
  java -jar arthas-boot.jar -c 'sysprop; thread' <pid>
  java -jar arthas-boot.jar -f batch.as <pid>
  java -jar arthas-boot.jar --use-version 3.7.1
  java -jar arthas-boot.jar --versions
  java -jar arthas-boot.jar --select math-game
  java -jar arthas-boot.jar --session-timeout 3600
  java -jar arthas-boot.jar --attach-only
  java -jar arthas-boot.jar --disabled-commands stop,dump
  java -jar arthas-boot.jar --repo-mirror aliyun --use-http
WIKI:
  https://arthas.aliyun.com/doc

Options and Arguments:
 -f,--batch-file <value>          The batch file to execute
    --height <value>              arthas-client terminal height
 -c,--command <value>             Command to execute, multiple commands
                                  separated by ;
    --disabled-commands <value>   disable some commands
    --session-timeout <value>     The session timeout seconds, default 1800
                                  (30min)
    --attach-only                 Attach target process only, do not connect
    --arthas-home <value>         The arthas home
 -h,--help                        Print usage
    --telnet-port <value>         The target jvm listen telnet port, default
                                  3658
    --target-ip <value>           The target jvm listen ip, default 127.0.0.1
    --http-port <value>           The target jvm listen http port, default 8563
    --repo-mirror <value>         Use special remote repository mirror, value is
                                  center/aliyun or http repo url.
    --use-version <value>         Use special version arthas
    --versions                    List local and remote arthas versions
    --use-http                    Enforce use http to download, default use
                                  https
    --select <value>              select target process by classname or
                                  JARfilename
    --tunnel-server <value>       The tunnel server url
    --password <value>            The password
    --stat-url <value>            The report stat url
    --app-name <value>            The app name
    --width <value>               arthas-client terminal width
    --username <value>            The username
    --agent-id <value>            The agent id register to tunnel server
 -v,--verbose                     Verbose, print debug info.
 <pid>                            Target pid
```

# 准备工作

我们先启动一个 springboot 项目，用来测试。

```
...
2023-10-21 16:03:27.285  INFO 19620 --- [           main] o.s.j.e.a.AnnotationMBeanExporter        : Registering beans for JMX exposure on startup
2023-10-21 16:03:27.344  INFO 19620 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 8080 (http)
2023-10-21 16:03:27.349  INFO 19620 --- [           main] org.example.SpringApplicationMain        : Started SpringApplicationMain in 2.758 seconds (JVM running for 3.216)
```

# 运行

## 启动

Arthas 只是一个 java 程序，所以可以直接用 java -jar 运行。

运行时或者运行之后要选择要监测的 Java 进程。

```sh
# 运行方式1，先运行，在选择 Java 进程 PID
java -jar arthas-boot.jar
```

对应日志

```
[INFO] JAVA_HOME: C:\Program Files\Java\jre1.8.0_192
[INFO] arthas-boot version: 3.7.1
[INFO] Found existing java process, please choose one and input the serial number of the process, eg : 1. Then hit ENTER.
* [1]: 14288
  [2]: 19680 org.jetbrains.jps.cmdline.Launcher
  [3]: 10900 org.jetbrains.idea.maven.server.RemoteMavenServer36
  [4]: 19620 org.example.SpringApplicationMain
  [5]: 17996 org.jetbrains.idea.maven.server.indexer.MavenServerIndexerMain
```

可以发现 `[4]: 19620 org.example.SpringApplicationMain` 是我们对应的服务。

## attach

我们输入 4，日志如下：

```
4
[INFO] Start download arthas from remote server: https://arthas.aliyun.com/download/3.7.1?mirror=aliyun
[INFO] File size: 17.84 MB, downloaded size: 3.39 MB, downloading ...
[INFO] File size: 17.84 MB, downloaded size: 7.19 MB, downloading ...
[INFO] File size: 17.84 MB, downloaded size: 10.71 MB, downloading ...
[INFO] File size: 17.84 MB, downloaded size: 14.37 MB, downloading ...
[INFO] Download arthas success.
[INFO] arthas home: C:\Users\Administrator\.arthas\lib\3.7.1\arthas
[INFO] Try to attach process 19620
[INFO] Found java home from System Env JAVA_HOME: C:\Program Files\Java\jdk1.8.0_192
[INFO] Attach process 19620 success.
[INFO] arthas-client connect 127.0.0.1 3658
  ,---.  ,------. ,--------.,--.  ,--.  ,---.   ,---.
 /  O  \ |  .--. ''--.  .--'|  '--'  | /  O  \ '   .-'
|  .-.  ||  '--'.'   |  |   |  .--.  ||  .-.  |`.  `-.
|  | |  ||  |\  \    |  |   |  |  |  ||  | |  |.-'    |
`--' `--'`--' '--'   `--'   `--'  `--'`--' `--'`-----'

wiki       https://arthas.aliyun.com/doc
tutorials  https://arthas.aliyun.com/doc/arthas-tutorials.html
version    3.7.1
main_class
pid        19620
time       2023-10-21 16:05:16
```

# 常见命令

可以参考开始的 help 命令。

这里罗列一些常见的命令。

详情可以参与官方 [https://arthas.aliyun.com/doc/](https://arthas.aliyun.com/doc/)

## jvm 相关

dashboard - 当前系统的实时数据面板
getstatic - 查看类的静态属性
heapdump - dump java heap, 类似 jmap 命令的 heap dump 功能
jvm - 查看当前 JVM 的信息
logger - 查看和修改 logger
mbean - 查看 Mbean 的信息
memory - 查看 JVM 的内存信息
ognl - 执行 ognl 表达式
perfcounter - 查看当前 JVM 的 Perf Counter 信息
sysenv - 查看 JVM 的环境变量
sysprop - 查看和修改 JVM 的系统属性
thread - 查看当前 JVM 的线程堆栈信息
vmoption - 查看和修改 JVM 里诊断相关的 option
vmtool - 从 jvm 里查询对象，执行 forceGc

## class/classloader 相关

classloader - 查看 classloader 的继承树，urls，类加载信息，使用 classloader 去 getResource
dump - dump 已加载类的 byte code 到特定目录
jad - 反编译指定已加载类的源码
mc - 内存编译器，内存编译.java文件为.class文件
redefine - 加载外部的.class文件，redefine 到 JVM 里
retransform - 加载外部的.class文件，retransform 到 JVM 里
sc - 查看 JVM 已加载的类信息
sm - 查看已加载类的方法信息

## monitor/watch/trace 相关

monitor - 方法执行监控
stack - 输出当前方法被调用的调用路径
trace - 方法内部调用路径，并输出方法路径上的每个节点上耗时
tt - 方法执行数据的时空隧道，记录下指定方法每次调用的入参和返回信息，并能对这些不同的时间下调用进行观测
watch - 方法执行数据观测

## profiler/火焰图

profiler - 使用async-profiler对应用采样，生成火焰图
jfr - 动态开启关闭 JFR 记录

## 鉴权

auth - 鉴权

## options

options - 查看或设置 Arthas 全局开关

## 管道

Arthas 支持使用管道对上述命令的结果进行进一步的处理，如sm java.lang.String * | grep 'index'

grep - 搜索满足条件的结果
plaintext - 将命令的结果去除 ANSI 颜色

## 基础命令

base64 - base64 编码转换，和 linux 里的 base64 命令类似
cat - 打印文件内容，和 linux 里的 cat 命令类似
cls - 清空当前屏幕区域
echo - 打印参数，和 linux 里的 echo 命令类似
grep - 匹配查找，和 linux 里的 grep 命令类似
help - 查看命令帮助信息
history - 打印命令历史
keymap - Arthas 快捷键列表及自定义快捷键
pwd - 返回当前的工作目录，和 linux 命令类似
quit - 退出当前 Arthas 客户端，其他 Arthas 客户端不受影响
reset - 重置增强类，将被 Arthas 增强过的类全部还原，Arthas 服务端关闭时会重置所有增强过的类
session - 查看当前会话的信息
stop - 关闭 Arthas 服务端，所有 Arthas 客户端全部退出
tee - 复制标准输入到标准输出和指定的文件，和 linux 里的 tee 命令类似
version - 输出当前目标 Java 进程所加载的 Arthas 版本号

# 查看 dashboard

输入 dashboard，按回车/enter，会展示当前进程的信息，按ctrl+c可以中断执行。

如下：

```
[arthas@19620]$ dashboard
ID   NAME                          GROUP          PRIORITY  STATE    %CPU      DELTA_TIM TIME      INTERRUPT DAEMON
43   DestroyJavaVM                 main           5         RUNNABLE 0.0       0.000     0:2.671   false     false
-1   C2 CompilerThread5            -              -1        -        0.0       0.000     0:2.406   false     true
-1   C2 CompilerThread0            -              -1        -        0.0       0.000     0:2.375   false     true
-1   C2 CompilerThread2            -              -1        -        0.0       0.000     0:2.000   false     true
-1   C2 CompilerThread7            -              -1        -        0.0       0.000     0:1.765   false     true
-1   C2 CompilerThread4            -              -1        -        0.0       0.000     0:1.609   false     true
-1   C2 CompilerThread3            -              -1        -        0.0       0.000     0:1.593   false     true
-1   C2 CompilerThread1            -              -1        -        0.0       0.000     0:1.218   false     true
-1   C2 CompilerThread6            -              -1        -        0.0       0.000     0:0.718   false     true
-1   C1 CompilerThread11           -              -1        -        0.0       0.000     0:0.593   false     true
-1   C1 CompilerThread8            -              -1        -        0.0       0.000     0:0.500   false     true
-1   C1 CompilerThread10           -              -1        -        0.0       0.000     0:0.468   false     true
-1   C1 CompilerThread9            -              -1        -        0.0       0.000     0:0.453   false     true
-1   VM Thread                     -              -1        -        0.0       0.000     0:0.093   false     true
55   arthas-NettyHttpTelnetBootstr system         5         RUNNABLE 0.0       0.000     0:0.078   false     true
-1   GC task thread#14 (ParallelGC -              -1        -        0.0       0.000     0:0.062   false     true
-1   GC task thread#7 (ParallelGC) -              -1        -        0.0       0.000     0:0.062   false     true
-1   GC task thread#12 (ParallelGC -              -1        -        0.0       0.000     0:0.062   false     true
-1   GC task thread#6 (ParallelGC) -              -1        -        0.0       0.000     0:0.062   false     true
-1   GC task thread#13 (ParallelGC -              -1        -        0.0       0.000     0:0.062   false     true
-1   GC task thread#1 (ParallelGC) -              -1        -        0.0       0.000     0:0.062   false     true
-1   GC task thread#3 (ParallelGC) -              -1        -        0.0       0.000     0:0.062   false     true
-1   GC task thread#5 (ParallelGC) -              -1        -        0.0       0.000     0:0.062   false     true
48   arthas-NettyHttpTelnetBootstr system         5         RUNNABLE 0.0       0.000     0:0.046   false     true
-1   GC task thread#11 (ParallelGC -              -1        -        0.0       0.000     0:0.046   false     true
-1   GC task thread#10 (ParallelGC -              -1        -        0.0       0.000     0:0.046   false     true
-1   GC task thread#8 (ParallelGC) -              -1        -        0.0       0.000     0:0.046   false     true
-1   VM Periodic Task Thread       -              -1        -        0.0       0.000     0:0.046   false     true
-1   GC task thread#0 (ParallelGC) -              -1        -        0.0       0.000     0:0.046   false     true
Memory                    used    total    max     usage    GC
heap                      63M     506M     7269M   0.87%    gc.ps_scavenge.count          4
ps_eden_space             43M     172M     2689M   1.63%    gc.ps_scavenge.time(ms)       34
ps_survivor_space         0K      16384K   16384K  0.00%    gc.ps_marksweep.count         2
ps_old_gen                19M     318M     5452M   0.36%    gc.ps_marksweep.time(ms)      91
nonheap                   57M     61M      -1      94.66%
code_cache                14M     16M      240M    5.92%
metaspace                 38M     39M      -1      98.25%
compressed_class_space    4M      5M       1024M   0.47%
direct                    0K      0K       -       105.88%
mapped                    0K      0K       -       0.00%
Runtime
os.name                                                     Windows 10
os.version                                                  10.0
java.version                                                1.8.0_192
java.home                                                   C:\Program Files\Java\jdk1.8.0_192\jre
systemload.average                                          -1.00
processors                                                  20
timestamp/uptime                                            Sat Oct 21 16:10:00 CST 2023/396s
ID   NAME                          GROUP          PRIORITY  STATE    %CPU      DELTA_TIM TIME      INTERRUPT DAEMON
57   Timer-for-arthas-dashboard-29 system         5         RUNNABLE 1.25      0.062     0:0.062   false     true
55   arthas-NettyHttpTelnetBootstr system         5         RUNNABLE 0.62      0.031     0:0.109   false     true
-1   C1 CompilerThread10           -              -1        -        0.62      0.031     0:0.500   false     true
-1   C1 CompilerThread11           -              -1        -        0.62      0.031     0:0.625   false     true
-1   C1 CompilerThread9            -              -1        -        0.31      0.015     0:0.468   false     true
-1   C1 CompilerThread8            -              -1        -        0.31      0.015     0:0.515   false     true
-1   C2 CompilerThread4            -              -1        -        0.31      0.015     0:1.625   false     true
-1   C2 CompilerThread7            -              -1        -        0.31      0.015     0:1.781   false     true
2    Reference Handler             system         10        WAITING  0.0       0.000     0:0.015   false     true
3    Finalizer                     system         8         WAITING  0.0       0.000     0:0.015   false     true
4    Signal Dispatcher             system         9         RUNNABLE 0.0       0.000     0:0.000   false     true
5    Attach Listener               system         5         RUNNABLE 0.0       0.000     0:0.015   false     true
45   arthas-timer                  system         5         WAITING  0.0       0.000     0:0.000   false     true
48   arthas-NettyHttpTelnetBootstr system         5         RUNNABLE 0.0       0.000     0:0.046   false     true
49   arthas-NettyWebsocketTtyBoots system         5         RUNNABLE 0.0       0.000     0:0.000   false     true
50   arthas-NettyWebsocketTtyBoots system         5         RUNNABLE 0.0       0.000     0:0.000   false     true
51   arthas-shell-server           system         5         TIMED_WA 0.0       0.000     0:0.000   false     true
52   arthas-session-manager        system         5         TIMED_WA 0.0       0.000     0:0.000   false     true
53   arthas-UserStat               system         5         WAITING  0.0       0.000     0:0.000   false     true
56   arthas-command-execute        system         5         TIMED_WA 0.0       0.000     0:0.000   false     true
6    Monitor Ctrl-Break            main           5         RUNNABLE 0.0       0.000     0:0.015   false     true
25   ContainerBackgroundProcessor[ main           5         TIMED_WA 0.0       0.000     0:0.000   false     true
26   container-0                   main           5         TIMED_WA 0.0       0.000     0:0.000   false     false
27   NioBlockingSelector.BlockPoll main           5         RUNNABLE 0.0       0.000     0:0.000   false     true
28   http-nio-8080-exec-1          main           5         WAITING  0.0       0.000     0:0.015   false     true
29   http-nio-8080-exec-2          main           5         WAITING  0.0       0.000     0:0.000   false     true
30   http-nio-8080-exec-3          main           5         WAITING  0.0       0.000     0:0.000   false     true
31   http-nio-8080-exec-4          main           5         WAITING  0.0       0.000     0:0.000   false     true
32   http-nio-8080-exec-5          main           5         WAITING  0.0       0.000     0:0.000   false     true
Memory                    used    total    max     usage    GC
heap                      65M     506M     7269M   0.90%    gc.ps_scavenge.count          4
ps_eden_space             46M     172M     2689M   1.71%    gc.ps_scavenge.time(ms)       34
ps_survivor_space         0K      16384K   16384K  0.00%    gc.ps_marksweep.count         2
ps_old_gen                19M     318M     5452M   0.36%    gc.ps_marksweep.time(ms)      91
nonheap                   58M     61M      -1      95.13%
code_cache                14M     16M      240M    6.06%
metaspace                 38M     39M      -1      98.08%
compressed_class_space    4M      5M       1024M   0.48%
direct                    0K      0K       -       105.88%
mapped                    0K      0K       -       0.00%
Runtime
os.name                                                     Windows 10
os.version                                                  10.0
java.version                                                1.8.0_192
java.home                                                   C:\Program Files\Java\jdk1.8.0_192\jre
systemload.average                                          -1.00
processors                                                  20
timestamp/uptime                                            Sat Oct 21 16:10:05 CST 2023/401s
```

可以看到很多信息：堆栈、线程、os、JVM 等。

# 获取 thread 信息

## 概览

thread 信息可以用来查看 cpu 占用高。

```
[arthas@19620]$ thread
Threads Total: 62, NEW: 0, RUNNABLE: 13, BLOCKED: 0, WAITING: 14, TIMED_WAITING: 5, TERMINATED: 0, Internal threads: 30
ID   NAME                          GROUP          PRIORITY  STATE    %CPU      DELTA_TIM TIME      INTERRUPT DAEMON
-1   C1 CompilerThread9            -              -1        -        7.45      0.015     0:0.765   false     true
-1   C1 CompilerThread8            -              -1        -        7.45      0.015     0:0.765   false     true
2    Reference Handler             system         10        WAITING  0.0       0.000     0:0.015   false     true
3    Finalizer                     system         8         WAITING  0.0       0.000     0:0.015   false     true
4    Signal Dispatcher             system         9         RUNNABLE 0.0       0.000     0:0.000   false     true
5    Attach Listener               system         5         RUNNABLE 0.0       0.000     0:0.015   false     true
45   arthas-timer                  system         5         WAITING  0.0       0.000     0:0.000   false     true
48   arthas-NettyHttpTelnetBootstr system         5         RUNNABLE 0.0       0.000     0:0.046   false     true
49   arthas-NettyWebsocketTtyBoots system         5         RUNNABLE 0.0       0.000     0:0.000   false     true
50   arthas-NettyWebsocketTtyBoots system         5         RUNNABLE 0.0       0.000     0:0.000   false     true
51   arthas-shell-server           system         5         TIMED_WA 0.0       0.000     0:0.000   false     true
52   arthas-session-manager        system         5         TIMED_WA 0.0       0.000     0:0.000   false     true
53   arthas-UserStat               system         5         WAITING  0.0       0.000     0:0.000   false     true
55   arthas-NettyHttpTelnetBootstr system         5         RUNNABLE 0.0       0.000     0:0.296   false     true
56   arthas-command-execute        system         5         RUNNABLE 0.0       0.000     0:0.812   false     true
6    Monitor Ctrl-Break            main           5         RUNNABLE 0.0       0.000     0:0.015   false     true
25   ContainerBackgroundProcessor[ main           5         TIMED_WA 0.0       0.000     0:0.000   false     true
26   container-0                   main           5         TIMED_WA 0.0       0.000     0:0.000   false     false
27   NioBlockingSelector.BlockPoll main           5         RUNNABLE 0.0       0.000     0:0.000   false     true
```

这里可以看到线程的状态，每一列的属性值可以查一下文档。这里把 cpu 占比也列出来了。

## 具体 thread 信息

使用命令 `thread 2` 查看 CPU 消耗较高的 2 号线程信息，可以看到 CPU 使用较高的方法和行数。

```
[arthas@19620]$ thread 2

"Reference Handler" Id=2 WAITING on java.lang.ref.Reference$Lock@7b852ec9
    at java.lang.Object.wait(Native Method)
    -  waiting on java.lang.ref.Reference$Lock@7b852ec9
    at java.lang.Object.wait(Object.java:502)
    at java.lang.ref.Reference.tryHandlePending(Reference.java:191)
    at java.lang.ref.Reference$ReferenceHandler.run(Reference.java:153)
```

## 结合 grep 等其他参数

也可以结合 grep 等命令，找到我们关心的。

```sh
[arthas@19620]$ thread | grep main
6    Monitor Ctrl-Break            main           5         RUNNABLE 0.0       0.000     0:0.015   false     true
25   ContainerBackgroundProcessor[ main           5         TIMED_WA 0.0       0.000     0:0.000   false     true
26   container-0                   main           5         TIMED_WA 0.0       0.000     0:0.000   false     false
27   NioBlockingSelector.BlockPoll main           5         RUNNABLE 0.0       0.000     0:0.000   false     true
28   http-nio-8080-exec-1          main           5         WAITING  0.0       0.000     0:0.015   false     true
29   http-nio-8080-exec-2          main           5         WAITING  0.0       0.000     0:0.000   false     true
30   http-nio-8080-exec-3          main           5         WAITING  0.0       0.000     0:0.000   false     true
31   http-nio-8080-exec-4          main           5         WAITING  0.0       0.000     0:0.000   false     true
32   http-nio-8080-exec-5          main           5         WAITING  0.0       0.000     0:0.000   false     true
33   http-nio-8080-exec-6          main           5         WAITING  0.0       0.000     0:0.000   false     true
34   http-nio-8080-exec-7          main           5         WAITING  0.0       0.000     0:0.000   false     true
35   http-nio-8080-exec-8          main           5         WAITING  0.0       0.000     0:0.000   false     true
36   http-nio-8080-exec-9          main           5         WAITING  0.0       0.000     0:0.000   false     true
37   http-nio-8080-exec-10         main           5         WAITING  0.0       0.000     0:0.000   false     true
38   http-nio-8080-ClientPoller-0  main           5         RUNNABLE 0.0       0.000     0:0.000   false     true
39   http-nio-8080-ClientPoller-1  main           5         RUNNABLE 0.0       0.000     0:0.000   false     true
40   http-nio-8080-Acceptor-0      main           5         RUNNABLE 0.0       0.000     0:0.000   false     true
41   http-nio-8080-AsyncTimeout    main           5         TIMED_WA 0.0       0.000     0:0.000   false     true
43   DestroyJavaVM                 main           5         RUNNABLE 0.0       0.000     0:2.671   false
```

好像没看到 main 方法，猜测是 springboot 封装掉了。

上面是先通过观察总体的线程信息，然后查看具体的线程运行情况。

如果只是为了寻找 CPU 使用较高的线程，可以直接使用命令 `thread -n [显示的线程个数]`，就可以排列出 CPU 使用率 Top N 的线程。

## 线程死锁信息

可以通过 jstack 分析，当然也可以直接获取。

上面的模拟代码里 deadThread方法实现了一个死锁，使用 `thread -b` 命令查看直接定位到死锁信息。

```sh
[arthas@19620]$ thread -b
No most blocking thread found!
```

# 通过 jad 来反编译 class

有时候我们怀疑类是不是最新的，怎么办呢？

难道要重新发布一次？这样位面太麻烦。

```sh
$   jad org.example.SpringApplicationMain
```

如下：

```java
[arthas@19620]$ jad org.example.SpringApplicationMain

ClassLoader:
+-sun.misc.Launcher$AppClassLoader@18b4aac2
  +-sun.misc.Launcher$ExtClassLoader@bebdb06

Location:
/D:/github/arthas-learn/target/classes/

       /*
        * Decompiled with CFR.
        */
       package org.example;

       import org.springframework.boot.SpringApplication;
       import org.springframework.boot.autoconfigure.SpringBootApplication;

       @SpringBootApplication
       public class SpringApplicationMain {
           public static void main(String[] args) {
/*10*/         SpringApplication.run(SpringApplicationMain.class, args);
           }
       }

Affect(row-cnt:2) cost in 729 ms.
```

会显示出对应的 classLoader 信息。基于反编译的代码信息。

## 其他属性

jad 命令还提供了一些其他参数：

```sh
# 反编译只显示源码
jad --source-only com.Arthas
# 反编译某个类的某个方法
jad --source-only com.Arthas mysql
```

# 一些类信息查看

假设我们有一个测试类

```java
package org.example.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class SampleService {

    private int count = 0;

    public String getById(String id) {
        count++;

        // 模拟耗时
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        return "service" + id;
    }

}
```

我们想看一下类、方法、字段等信息怎么办？

## sc 查看字段信息

使用 `sc -d -f` 命令查看类的字段信息。

```sh
$   sc -d -f org.example.service.SampleService
```

如下：

```
 class-info        org.example.service.SampleService
 code-source       /D:/github/arthas-learn/target/classes/
 name              org.example.service.SampleService
 isInterface       false
 isAnnotation      false
 isEnum            false
 isAnonymousClass  false
 isArray           false
 isLocalClass      false
 isMemberClass     false
 isPrimitive       false
 isSynthetic       false
 simple-name       SampleService
 modifier          public
 annotation        org.springframework.stereotype.Service
 interfaces
 super-class       +-java.lang.Object
 class-loader      +-sun.misc.Launcher$AppClassLoader@18b4aac2
                     +-sun.misc.Launcher$ExtClassLoader@bebdb06
 classLoaderHash   18b4aac2
 fields            name     count
                   type     int
                   modifier private
```

## sm 查看方法信息

使用 `sm` 命令查看类的方法信息

```sh
sm org.example.service.SampleService
```

如下：

```
org.example.service.SampleService <init>()V
org.example.service.SampleService getById(Ljava/lang/String;)Ljava/lang/String;
Affect(row-cnt:2) cost in 9 ms.
```

## ognl 执行各种表达式

> [Arthas的一些特殊用法文档说明](https://github.com/alibaba/arthas/issues/71)

比如内部属性 count，我想看执行了几次。怎么办？

使用 ognl 命令，ognl 表达式可以轻松操作想要的信息。

### 静态属性值

通过 getstatic 命令可以方便的查看类的静态属性。使用方法为 `getstatic class_name field_name`

代码还是上面的示例代码，我们查看变量 count 中的数据：

`ognl @org.example.service.SampleService@count` 也可以用来获取 static 字段信息。

我们的不是 static，会报错：

```
Failed to execute ognl, exception message: ognl.OgnlException: Field count of class org.example.service.SampleService is not static, please check $HOME/logs/arthas/arthas.log for more details.
```

### 实例对象值

好像无法直接获取，需要通过 refine 等。

能watch方法内的局部变量的值吗？

不能，用 redefine

# watch

一般情况下如果有日志还好办，如果没有日志，又无法方便的本地调试怎么办？

## 方法出入参

通过 watch 命令来查看函数的返回值。能观察到的范围为：返回值、抛出异常、入参，通过编写 OGNL 表达式进行对应变量的查看。

- controller 代码

对应的代码如下：

```java
@RestController
@RequestMapping("/sample")
public class SampleController {

    @Autowired
    private SampleService sampleService;

    @RequestMapping("/")
    public String home(@RequestParam String id) {
        return sampleService.getById(id);
    }

}
```

我们来 watch 一下出入参。

```sh
$   watch org.example.controller.SampleController home 
```

触发调用 2 次：

```
http://localhost:8080/sample/?id=123
http://localhost:8080/sample/?id=456
```

arthas 命令行如下：

```
[arthas@19620]$ watch org.example.controller.SampleController home
Press Q or Ctrl+C to abort.
Affect(class count: 1 , method count: 1) cost in 145 ms, listenerId: 1
method=org.example.controller.SampleController.home location=AtExit
ts=2023-10-21 16:21:56; [cost=1015.9617ms] result=@ArrayList[
    @Object[][isEmpty=false;size=1],
    @SampleController[org.example.controller.SampleController@48230b5c],
    @String[service123],
]
method=org.example.controller.SampleController.home location=AtExit
ts=2023-10-21 16:22:16; [cost=1004.1515ms] result=@ArrayList[
    @Object[][isEmpty=false;size=1],
    @SampleController[org.example.controller.SampleController@48230b5c],
    @String[service456],
]
```

# 耗时长？为什么

## 问题

我们发现方法调用耗时 1s+。

为什么呢？

看一下下面的几个命令：

```
monitor - 方法执行监控
stack - 输出当前方法被调用的调用路径
trace - 方法内部调用路径，并输出方法路径上的每个节点上耗时
tt - 方法执行数据的时空隧道，记录下指定方法每次调用的入参和返回信息，并能对这些不同的时间下调用进行观测
watch - 方法执行数据观测
```

## trace-方法内部调用路径，并输出方法路径上的每个节点上耗时

```
trace org.example.controller.SampleController home
```

触发调用 2 次：

```
http://localhost:8080/sample/?id=123
http://localhost:8080/sample/?id=456
```

如下：

```
[arthas@19620]$ trace org.example.controller.SampleController home
Press Q or Ctrl+C to abort.
Affect(class count: 1 , method count: 1) cost in 50 ms, listenerId: 2
`---ts=2023-10-21 17:02:06;thread_name=http-nio-8080-exec-9;id=24;is_daemon=true;priority=5;TCCL=org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedWebappClassLoader@54cdfa35
    `---[1007.6661ms] org.example.controller.SampleController:home()
        `---[99.99% 1007.5288ms ] org.example.service.SampleService:getById() #18

`---ts=2023-10-21 17:02:07;thread_name=http-nio-8080-exec-10;id=25;is_daemon=true;priority=5;TCCL=org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedWebappClassLoader@54cdfa35
    `---[1000.2736ms] org.example.controller.SampleController:home()
        `---[100.00% 1000.2299ms ] org.example.service.SampleService:getById() #18
```

我只能说太强了，直接获取到对应的耗时信息。

我们把几个命令都尝试下。

## tt-方法执行数据的时空隧道

```
tt -t org.example.controller.SampleController home
```

执行几次调用。

```
[arthas@19620]$ tt -t org.example.controller.SampleController home
Press Q or Ctrl+C to abort.
Affect(class count: 1 , method count: 1) cost in 42 ms, listenerId: 3
 INDEX  TIMESTAMP          COST(ms  IS-RE  IS-EXP  OBJECT        CLASS                      METHOD
                           )        T
-----------------------------------------------------------------------------------------------------------------------
 1000   2023-10-21 17:04:  1014.30  true   false   0x48230b5c    SampleController           home
        26                 87
```

这个感觉不是很细致，还不如 trace 方便。

# 小结

thread 查看线程信息

jad 查看类信息

sm/sc 查看对应的方法、字段等属性

OGNL + getstatic 获取一些静态属性

watch 查看日志出入参

trace 查看调用链路+耗时

要学会使用工具，arthas 非常的强大易用，平时用起来。

# 参考资料

https://github.com/WisdomShell/codeshell-intellij

* any list
{:toc}