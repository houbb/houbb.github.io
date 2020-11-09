---
layout: post
title: 从零开始的 windows 开发环境搭建-00-overview
date:  2019-9-26 22:35:36 +0800
categories: [Windows]
tags: [windows, overview, sf]
published: true
---

# 背景 

这段时间全部重新装的 windows 环境，感觉每次都需要整理一下 windows 相关的环境信息。

这里统一整理一下，便于以后查阅。

# 常用软件列表

## chrome 

下载安装 chrome 浏览器

- 下载失败问题

一直下载失败，调增下设置，下载文件夹修改为存在的文件夹即可。


## 输入法

使用 [sougou](https://pinyin.sogou.com/) 输入法。

## 管理工具

[火萤酱（火柴）](http://huochaipro.com/) 下载。

## 垃圾软件下载

卸载 2345 等绑定软件。


# 开发环境

## jdk

建议安装 jdk8

- 卸载 jdk7

原来使用了 jdk7，安装之后发现使用 maven 会有一些问题。

所以直接删除，安装 jdk8

- 安装

直接下载后安装即可

安装路径：`C:\Program Files (x86)\Java\jdk1.8.0_102\`



### 环境变量

cmd 输入 `sysdm.cpl` 进行环境变量配置。

#### 在系统变量中新建

变量名：JAVA_HOME

变量值：`C:\Program Files (x86)\Java\jdk1.8.0_102`

JAVA_HOME是用来表示jdk的安装目录。

配置java_home的原因是：

（1）方便引用。

（2）其他软件会引用约定好的JAVA_HOME变量。比如tomcat就需要引用JAVA_HOME。

#### 在系统变量中查找 Path 编辑

变量名：Path

变量值：`;%JAVA_HOME%\bin;%JAVA_HOME%\jre\bin;` 

(ps:原来Path的变量值末尾如果没有;号，先输入；号再输入上面的代码)

#### 在系统变量中新建

变量名：CLASSPATH

变量值：`.;%JAVA_HOME%lib;%JAVA_HOME%lib/tools.jar;`

(ps:前面有个  `.;`  这个是告诉JDK，搜索CLASS时先查找当前目录的CLASS文件 )

配置java_home的原因是：我们写java程序时需要引用已经开发好的类，所以应该让java解释器知道引用的类的位置啊。否则会提示：所引用的类找不到的。

- 测试验证

```
λ java -version
java version "1.8.0_102"
Java(TM) SE Runtime Environment (build 1.8.0_102-b14)
Java HotSpot(TM) Client VM (build 25.102-b14, mixed mode)
```


- 验证配置的正确性

建议如下测试

```
λ echo "%JAVA_HOME%\bin\java.exe"
"C:\Program Files (x86)\Java\jdk1.8.0_102\bin\java.exe"
```

查看结果是否符合预期路径。

## maven

- 下载

直接下载，解压到固定的文件夹。

### 环境变量配置

- 新建系统变量

名：MAVEN_HOME

值：`D:\tool\maven\apache-maven-3.6.2\bin`

对应的文件路径 

https://blog.csdn.net/qq_37860634/article/details/87898195

- 编辑系统变量 

名：Path

值：最后新增 `;%MAVEN_HOME%`


### 测试验证

```
λ mvn -version
Apache Maven 3.6.2 (40f52333136460af0dc0d7232c0dc0bcf0d9e117; 2019-08-27T23:06:16+08:00)
Maven home: D:\tool\maven\apache-maven-3.6.2\bin\..
Java version: 1.8.0_102, vendor: Oracle Corporation, runtime: C:\Program Files (x86)\Java\jdk1.8.0_102\jre
Default locale: zh_CN, platform encoding: GBK
OS name: "windows 7", version: "6.1", arch: "x86", family: "windows"
```

## git

通过官方下载可能比较卡，下面是一个镜像

[https://npm.taobao.org/mirrors/git-for-windows/v2.24.0-rc1.windows.1/](https://npm.taobao.org/mirrors/git-for-windows/v2.24.0-rc1.windows.1/)


- 测试验证

```
λ git --version
git version 2.24.0.rc1.windows.1
```


# 开发工具

## cmder

非常棒的命令行工具

[Cmder]()

## idea

最棒的 java 开发工具。

## vscode

微软的良心文本编辑器

[VSCode]()


# 拓展阅读


## jdk7 运行 mvn 报错

```
Failed to read artifact descriptor for org.apache.maven.surefire:surefire-api:jar:2.20.1: Could not transfer artifact org.apache.maven.surefire:surefire-api:pom:2.20.1 from/to central (https://repo.maven.apache.org/maven2): Received fatal alert: protocol_version -> [Help 1] 
```


## 错误原因

由于TLSv1.1 协议不安全, 出于PCI 安全标准的原因, 从2018-06-18起, maven Sonatype 中央仓库不再支持 TLSv1.1 以及以下的协议版本

原文参见 [no longer supports TLSv1.1 and below](https://central.sonatype.org/articles/2018/May/04/discontinued-support-for-tlsv11-and-below/)  官方说明

通过chrome security 面板看到, maven 中央仓库已经是  TLSv1.2 协议了


### oracle 对于 TLS 的支持

参见文档 [Diagnosing TLS, SSL, and HTTPS](https://blogs.oracle.com/java-platform-group/diagnosing-tls,-ssl,-and-https)

JDK8 默认为 TLSv1.2

JDK7 默认为 TLSv1.1

## 解决方案

### 方案1

```
mvn clean install -Dhttps.protocols=TLSv1.2
```

### 方案2

升级 jdk7 到 jdk8

### 方案3

修改 Maven 配置文件，对于安全要求不严格的场景, 可以使用http 去访问maven 仓库

```xml
<profiles>          
    <profile>  
        <id>maven-home</id>  
        <repositories>  
            <repository>  
                <id>central</id>  
                <url>https://repo1.maven.org/maven2</url>  
                <releases>  
                    <enabled>true</enabled>  
                    <checksumPolicy>warn</checksumPolicy>  
                </releases>  
                <snapshots>  
                    <enabled>false</enabled>  
                </snapshots>  
            </repository>  
        </repositories>  
  
    <pluginRepositories>  
        <pluginRepository>  
            <id>central</id>              
            <url>http://repo1.maven.org/maven2</url>              
            </pluginRepository>  
    </pluginRepositories>  
</profile>  
```

# 参考资料

[maven mvn install 报错 Received fatal alert: protocol_version 解决方案 (JDK7)](https://www.iteye.com/blog/feitianbenyue-2429045)

* any list
{:toc}
