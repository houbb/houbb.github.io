---
layout: post
title: Idea-IDEA 开发工具远程 DEBUG
date:  2016-05-06 14:10:55 +0800
categories: [IDE]
tags: [ide]
published: true
---

# 远程调试

远程调试，特别是当你在本地开发的时候，你需要调试服务器上的程序时，远程调试就显得非常有用。

JAVA 支持调试功能，本身提供了一个简单的调试工具JDB，支持设置断点及线程级的调试同时，不同的JVM通过接口的协议联系，本地的Java文件在远程JVM建立联系和通信。

此篇是Intellij IDEA远程调试的教程汇总和原理解释，知其然而又知其所以然。

# 本地 idea 配置

本机 Intellij IDEA 远程调试配置

1，打开Inteliij IDEA，顶部菜单栏选择Run-> Edit Configurations，进入下图的运行/调试配置界面。

2，点击左上角'+'号，选择Remote。分别填写右侧三个红框中的参数：Name，Host（想要指定的远程调试端口）。

3，点击界面右下角应用按钮即可。

![远程调试配置](https://img-blog.csdn.net/2018062115152934?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM3MTkyODAw/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

# 远程服务端配置

服务器端开启调试模式，增加JVM启动参数，以支持远程调试

服务器端的catalina.sh文件，在Tomcat的安装目录下，复制到本地，进行编辑，在第一行添加参数配置如下，完成后粘贴回去。

```
CATALINA_OPTS="-Xdebug  -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=8089"
```

配置添加之后，重启tomcat即可生效（shutdown.sh /startup.sh）。

到此，开始远程调试。

#  Intellij IDEA 启动远程调用

最后，打开IDEA，程序上打上断点，运行模式选远程，点击运行。

调用服务器端运行的系统程序，系统自动进入断点。

![remote debug](https://img-blog.csdn.net/20180621152116752?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM3MTkyODAw/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

# 为什么可以进行远程调试，背后的原理是什么？

首先，了解下的Java程序的执行过程-分为以下几个步骤：

Java的文件 - - 编译生成的类文件（class文件） - - JVM加载类文件 - - JVM运行类字节码文件 - - JVM翻译器翻译成各个机器认识的不同的机器码。

## 远程调试原理

众所周知，Java 程序是运行在Java 虚拟机（JVM ）上的，具有良好跨平台性，是因为Java程序统一以字节码的形式在JVM中运行，不同平台的虚拟机都统一使用这种相同的程序存储格式。

因为都是类字节码文件，只要本地代码和远程服务器上的类文件相同，两个JVM通过调试协议进行通信（例如通过插座在同一个端口进行通信），另外需要注意的时，被调试的服务器需要开启调试模式，服务器端的代码和本地代码必须保持一致，则会造成断点无法进入的问题。

- 调试器架构

![调试器架构](https://img-blog.csdn.net/20180621153121528?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM3MTkyODAw/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

这个架构其实质还是JVM，只要确保本地的Java的源代码与目标应用程序一致，本地的Java的的的的源码就可以用插座连接到远端的JVM，进而执行调试。

因此，在这种插座连接模式（下文介绍）下，本地只需要有源码，本地的Java的应用程序根本不用启动。

传输方式，默认为Socket ;

套接字：MACOS，Linux的系统使用此种传输方式;

共享内存：WINDOWS系统使用此种传输方式。

调试模式，默认为Attach;

Attach ：此种模式下，调试服务端（被调试远程运行的机器）启动一个端口等待我们（调试客户端）去连接;

Socket ：此种模式下，是我们（调试客户端）去监听一个端口，当调试服务端准备好了，就会进行连接。

# 配置属性说明补充

idea 的的服务的开启调试模式设置详细说明，

```
CATALINA_OPTS="-Xdebug  -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=8089"
```

各参数解释：

```
-Xdebug：通知JVM工作在调试模式下

-Xrunjdwp：通知JVM使用（java debug wire protocol）来运行调试环境。参数同时有一系列的调试选项：

session：指定了调试数据的传送方式，dt_socket是指用SOCKET模式，另外dt_shmem指用共享内存方式，其中dt_shmem只适用于窗口平台.server 参数是指是支持在服
务器模式的虚拟机中。

onthrow：指明当产生该类型的异常时，JVM就会中断下来，进行调式该参数任选。

release：指明当JVM被中断下来时，执行的可执行程序该参数可选

suspend：指明：是否在调试客户端建立起来后，再执行 JVM。

onuncaught（=y或n）指明出现未捕获的异常后，是否中断JVM的执行。
```

# 参考资料

[Intellij IDEA远程debug教程实战和要点总结](https://blog.csdn.net/qq_37192800/article/details/80761643)

* any list
{:toc}
