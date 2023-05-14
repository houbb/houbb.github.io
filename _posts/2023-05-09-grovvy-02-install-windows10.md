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

TODO...

# 小结


# 参考资料

chatGPT

* any list
{:toc}