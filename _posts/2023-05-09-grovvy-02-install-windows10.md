---
layout: post
title: grovvy-02-windows10 安装笔记实战
date:  2023-05-09 +0800
categories: [Lang]
tags: [grovvy, lang, sh]
published: true
---

# Groovy的安装和配置有哪些步骤？

Groovy的安装和配置步骤如下：

1. 下载安装包：前往官方网站（https://groovy.apache.org/download.html）下载最新版本的Groovy二进制发行版，选择合适的操作系统和版本，下载安装包。

2. 解压安装包：将下载的安装包解压到指定目录中，比如在Linux或Mac上可以解压到`/usr/local/`目录下，Windows上可以解压到`C:\`或其他磁盘根目录下。

3. 配置环境变量：将Groovy的`bin`目录添加到系统环境变量中，以方便在任何地方使用Groovy命令。在Linux或Mac上可以将以下命令添加到`.bashrc`或`.bash_profile`文件中：

```
export GROOVY_HOME=/usr/local/groovy-<version>
export PATH=$PATH:$GROOVY_HOME/bin
```

其中`<version>`为你下载的Groovy版本号。在Windows上可以将`GROOVY_HOME`变量设置为Groovy安装目录，并将`%GROOVY_HOME%\bin`添加到系统环境变量中。

4. 验证安装：在命令行中输入`groovy -version`命令，如果成功输出Groovy的版本信息，则说明安装和配置已经成功。

至此，Groovy的安装和配置就完成了，你可以开始使用Groovy进行开发了。


# windows10 安装笔记

## 下载安装概述

在Windows系统下安装Groovy，可以按照以下步骤进行操作：

1. 下载安装包：前往Groovy官方网站（https://groovy.apache.org/download.html）下载最新版本的Groovy二进制发行版。选择适用于Windows的安装包，通常为一个zip压缩文件。

2. 解压安装包：将下载的zip压缩文件解压到你想要安装Groovy的目录中，例如`C:\groovy`。

3. 配置环境变量：打开系统环境变量配置界面。

   - 在Windows 10中，可以在开始菜单中搜索"环境变量"，然后选择"编辑系统环境变量"。
   - 在Windows 7或较早版本中，可以在控制面板中找到"系统"，然后选择"高级系统设置"，接着点击"环境变量"按钮。

4. 在环境变量配置界面中，找到系统变量列表中的"Path"变量，点击"编辑"按钮。

5. 在弹出的编辑环境变量窗口中，点击"新建"按钮，然后输入Groovy安装目录的路径，例如`C:\groovy\bin`，点击"确定"保存。

6. 关闭所有命令提示符窗口和编辑器窗口，以便使环境变量的更改生效。

7. 验证安装：打开命令提示符窗口，输入`groovy -version`命令，如果成功输出Groovy的版本信息，则说明安装成功。

至此，你已经成功在Windows系统下安装了Groovy。你可以在命令提示符窗口中运行Groovy脚本，或者使用Groovy编译器编译和执行Groovy源代码。

## 下载&安装

前往下载首页 [https://groovy.apache.org/download.html](https://groovy.apache.org/download.html)

首页直接下载当前版本： 

> [apache-groovy-sdk-4.0.12.zip](https://groovy.jfrog.io/ui/native/dist-release-local/groovy-zips/apache-groovy-sdk-4.0.12.zip)

## 解压

解压到指定文件夹：

```
D:\tool\grovvy\apache-groovy-sdk-4.0.12\groovy-4.0.12
```

下面的内容如下：

```
$ ls
bin/  conf/  doc/  grooid/  lib/  LICENSE  licenses/  NOTICE  src/
```

## 配置环境变量&测试

配置对应的PATH变量，测试：

```
λ groovy -version
Groovy Version: 4.0.12 JVM: 1.8.0_371 Vendor: Oracle Corporation OS: Windows 11
```

# 小结


# 参考资料

chatGPT

* any list
{:toc}