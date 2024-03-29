---
layout: post
title: windows wsl ubuntu 如何安装 maven
date: 2024-01-05 21:01:55 +0800
categories: [Windows]
tags: [windows, os, linux, sh]
published: true
---

# 命令

```sh
sudo apt update
sudo apt install maven
```

验证安装是否成功：

```sh
$ mvn -version

Apache Maven 3.6.3
Maven home: /usr/share/maven
Java version: 1.8.0_402, vendor: Private Build, runtime: /usr/lib/jvm/java-8-openjdk-amd64/jre
Default locale: en, platform encoding: UTF-8
OS name: "linux", version: "5.15.146.1-microsoft-standard-wsl2", arch: "amd64", family: "unix"
```

如果你需要指定Maven的版本或者使用特定的settings.xml文件，你可以修改/etc/maven/maven.conf文件来设置MAVEN_OPTS环境变量或者修改M2_HOME环境变量指向你的Maven安装目录。

# 参考资料

[如何在windows上安装WSL？以实现windows操作系统运行linux](https://blog.csdn.net/weixin_40551464/article/details/133577201)

https://blog.csdn.net/xjyou456/article/details/129654673

* any list
{:toc}