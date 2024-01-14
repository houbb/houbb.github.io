---
layout: post
title:  Ubuntu JDK
date:  2018-08-14 13:46:27 +0800
categories: [Ubuntu]
tags: [ubuntu, java]
published: true
---



# 下载

- download from the html

```
http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
```

- copy it into target place

```
houbinbindeMacBook-Pro:~ houbinbin$ cd ~/Downloads/
houbinbindeMacBook-Pro:Downloads houbinbin$ scp jdk-8u112-linux-x64.tar.gz hbb@192.168.2.108:/home/hbb/too/jdk/
```


- unzip it

```
tar -zxf jdk-8u112-linux-x64.tar.gz
```

- root path

```
$ pwd
/home/hbb/tool/jdk/jdk1.8.0_112
```

- config jdk

```
vi ~/.bashrc


```
 add content

```
# set for jdk
export JAVA_HOME=/home/hbb/tool/jdk/jdk1.8.0_112
export CLASSPATH=${JAVA_HOME}/lib
export PATH=${JAVA_HOME}/bin:$PATH
```

- make it work

```
source ~/.bashrc
```

- test

```
$ java -version
java version "1.8.0_112"
Java(TM) SE Runtime Environment (build 1.8.0_112-b15)
Java HotSpot(TM) 64-Bit Server VM (build 25.112-b15, mixed mode)
```

# windows10 WSL 安装 jdk 笔记

## 如何卸载 jdk 

```
$ java -version

java version "21" 2023-09-19
Java(TM) SE Runtime Environment Oracle GraalVM 21+35.1 (build 21+35-jvmci-23.1-b15)
Java HotSpot(TM) 64-Bit Server VM Oracle GraalVM 21+35.1 (build 21+35-jvmci-23.1-b15, mixed mode, sharing)
```



# chat

## ubuntu 如何卸载 jdk？

要在Ubuntu上卸载JDK（Java Development Kit），您可以按照以下步骤进行操作：

1. **确定已安装的JDK版本：** 在终端中运行以下命令，以查看已安装的Java版本：

    ```bash
    java -version
    ```

    这将显示已安装的Java版本信息。

2. **卸载JDK：** 根据您安装的JDK版本，执行以下步骤。

    - **如果您使用的是 OpenJDK：**
    
        ```bash
        sudo apt-get remove openjdk-<version>-jdk
        ```

        请将 `<version>` 替换为您要卸载的OpenJDK版本，例如 `sudo apt-get remove openjdk-11-jdk`。

    - **如果您使用的是 Oracle JDK：**
    
        如果您是使用 PPA（Personal Package Archive）安装的 Oracle JDK，请执行以下步骤：

        ```bash
        sudo add-apt-repository --remove ppa:webupd8team/java
        sudo apt-get update
        sudo apt-get remove oracle-java8-installer
        ```

        请注意，上述命令中的 `oracle-java8-installer` 可能会根据您安装的版本而有所不同。

3. **删除Java配置文件（可选）：** 在一些情况下，您可能需要手动删除Java的配置文件。执行以下命令：

    ```bash
    sudo rm -rf /usr/lib/jvm/<jdk_folder>
    ```

    其中 `<jdk_folder>` 是JDK安装目录的名称，通常与版本相关。

4. **更新系统：** 更新系统以确保更改生效：

    ```bash
    sudo apt-get update
    ```

以上步骤应该可以帮助您在Ubuntu上成功卸载JDK。请确保在执行这些步骤之前备份任何重要数据，并谨慎操作。

* any list
{:toc}