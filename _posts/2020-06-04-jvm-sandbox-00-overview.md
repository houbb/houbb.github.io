---
layout: post
title: jvm-sandbox 入门简介
date:  2020-6-4 13:34:28 +0800
categories: [Jvm]
tags: [jvm, sandbox, aop, sh]
published: true
---

# JVM沙箱容器，一种JVM的非侵入式运行期AOP解决方案

在WIKI中我们将会系统的向你介绍JVM-SANDBOX（以下简称沙箱）的安装、使用和配置，并从一个简单的模块开发开始到深入沙箱内核并成为这个开源项目贡献者的一员。

文章将会从使用者、模块研发者和沙箱贡献者三个角色完整的介绍沙箱

# 使用者

## 安装沙箱

### 环境要求

JDK[6,11]

Linux／UNIX／MacOS；暂不支持Windows，主要是一些脚本需要改造

### 本地安装

首先需要下载最新稳定版本

下载完成并解压之后，在sandbox目录下执行安装脚本 `./install-local.sh -p /Users/luanjia/pe`，-p指定沙箱的安装目录。

如若不指定，默认的安装目录是 `${HOME}/.opt`

```
cd sandbox
./install-local.sh
```

成功安装会有以下输出。安装指定安装目录之后，沙箱脚本的工作目录将为你所指定的安装目录。

```
VERSION=1.2.0
PATH=/Users/luanjia/pe/sandbox
install sandbox successful.
```

## 启动沙箱

沙箱有两种启动方式：ATTACH和AGENT

### ATTACH方式启动

即插即用的启动模式，可以在不重启目标JVM的情况下完成沙箱的植入。

原理和GREYS、BTrace类似，利用了JVM的Attach机制实现。

```
# 假设目标JVM进程号为'2343'
./sandbox.sh -p 2343
```

- 输出

```
                    NAMESPACE : default
                      VERSION : 1.2.0
                         MODE : ATTACH
                  SERVER_ADDR : 0.0.0.0
                  SERVER_PORT : 55756
               UNSAFE_SUPPORT : ENABLE
                 SANDBOX_HOME : /Users/luanjia/pe/sandbox
            SYSTEM_MODULE_LIB : /Users/luanjia/pe/sandbox/module
              USER_MODULE_LIB : ~/.sandbox-module;
          SYSTEM_PROVIDER_LIB : /Users/luanjia/pe/sandbox/provider
           EVENT_POOL_SUPPORT : DISABLE
```

则说明启动成功，沙箱已经顺利植入了目标JVM中，并完打开了HTTP端口55756，完成系统模块sandbox-mgr-module.jar 的加载。

### AGENT方式启动

有些时候我们需要沙箱工作在应用代码加载之前，或者一次性渲染大量的类、加载大量的模块，此时如果用ATTACH方式加载，可能会引起目标JVM的卡顿或停顿（GC），这就需要启用到AGENT的启动方式。

假设SANDBOX被安装在了/Users/luanjia/pe/sandbox，需要在JVM启动参数中增加上

```
-javaagent:/Users/luanjia/pe/sandbox/lib/sandbox-agent.jar
```

这样沙箱将会伴随着JVM启动而主动启动并加载对应的沙箱模块。


# agent 挂载方式实战

## 下载

http://ompc.oss-cn-hangzhou.aliyuncs.com/jvm-sandbox/release/sandbox-stable-bin.zip

解压到指定路径：

```
D:\tool\jvmsandbox\sandbox\lib\sandbox-agent.jar
```

## 指定 jvm 参数

```
-javaagent:D:\tool\jvmsandbox\sandbox\lib\sandbox-agent.jar
```


# 个人收获

这个看起来非常强大，实际上原理可能还是 JDK6 的 Agent+Instruments

底层还是 TCP 通信

所以学会基础知识很重要。

至于应用，那就需要我们自己去思考和应用了。

# 参考资料

[jvm-sandbox 官方文档](https://github.com/alibaba/jvm-sandbox/wiki)

* any list
{:toc}