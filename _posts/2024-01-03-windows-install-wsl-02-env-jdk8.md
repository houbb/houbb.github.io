---
layout: post
title: windows wsl ubuntu 如何安装 open-jdk8
date: 2024-01-05 21:01:55 +0800
categories: [Windows]
tags: [windows, os, linux, sh]
published: true
---

# 安装步骤

## jdk

```
dh@d:~$ java -version
Command 'java' not found, but can be installed with:
sudo apt install openjdk-11-jre-headless  # version 11.0.20.1+1-0ubuntu1~22.04, or
sudo apt install default-jre              # version 2:1.11-72build2
sudo apt install openjdk-17-jre-headless  # version 17.0.8.1+1~us1-0ubuntu1~22.04
sudo apt install openjdk-18-jre-headless  # version 18.0.2+9-2~22.04
sudo apt install openjdk-19-jre-headless  # version 19.0.2+7-0ubuntu3~22.04
sudo apt install openjdk-8-jre-headless   # version 8u382-ga-1~22.04.1
```

安装一下

```
sudo apt install openjdk-8-jre-headless
```

```
$ java -version
openjdk version "1.8.0_392"
OpenJDK Runtime Environment (build 1.8.0_392-8u392-ga-1~22.04-b08)
OpenJDK 64-Bit Server VM (build 25.392-b08, mixed mode)
```

### 配置 JAVA_HOME

```
update-alternatives --list java
```

如下：

```
/usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java
```

则对应的 java home 为：`/usr/lib/jvm/java-8-openjdk-amd64/jre`

我们修改一下 /etc/profile

```
sudo vi /etc/profile
```

添加对应的 java_home 信息：

```bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre
export PATH=$JAVA_HOME/bin:$PATH
```

刷新配置：

```
source /etc/profile
```

测试：

```
$ echo $JAVA_HOME
/usr/lib/jvm/java-8-openjdk-amd64/jre
```

## 验证

```
$ java -version
openjdk version "1.8.0_402"
OpenJDK Runtime Environment (build 1.8.0_402-8u402-ga-2ubuntu1~22.04-b06)
OpenJDK 64-Bit Server VM (build 25.402-b06, mixed mode)
```


# chat

## Q: 如何安装？

在Ubuntu上安装JDK 8可以通过以下步骤进行：

打开终端。

更新包列表：

sudo apt update

安装OpenJDK 8：

sudo apt install openjdk-8-jdk

验证安装是否成功：

java -version

如果需要设置JAVA_HOME环境变量，可以执行以下命令找到JDK 8的安装路径：

sudo update-alternatives --config java

然后根据显示的路径设置JAVA_HOME环境变量，可以将以下内容添加到~/.bashrc或~/.profile文件中：

export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

执行以下命令使变量生效：

source ~/.bashrc

或者

source ~/.profile

以上步骤会安装OpenJDK 8，并设置JAVA_HOME环境变量。

# 参考资料

[如何在windows上安装WSL？以实现windows操作系统运行linux](https://blog.csdn.net/weixin_40551464/article/details/133577201)

https://blog.csdn.net/xjyou456/article/details/129654673

* any list
{:toc}