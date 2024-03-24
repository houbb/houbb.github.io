---
layout: post
title: maven 包管理平台-08-nexus 自己搭建 maven 仓库
date: 2016-08-06 13:10:53 +0800
categories: [VCS]
tags: [maven, devops, sf]
published: true
---

# 拓展阅读

[maven 包管理平台-01-maven 入门介绍 + Maven、Gradle、Ant、Ivy、Bazel 和 SBT 的详细对比表格](https://houbb.github.io/2016/08/06/maven-01-intro)

[maven 包管理平台-02-windows 安装配置 + mac 安装配置](https://houbb.github.io/2016/08/06/maven-02-windows-mac-install)

[maven 包管理平台-03-maven project maven 项目的创建入门](https://houbb.github.io/2016/08/06/maven-03-maven-project)

[maven 包管理平台-04-maven archetype 项目原型](https://houbb.github.io/2016/08/06/maven-04-maven-archetype)

[maven 包管理平台-05-multi module 多模块](https://houbb.github.io/2016/08/06/maven-05-multi-module)

[maven 包管理平台-06-常用技巧 实时更新快照/乱码问题/下载很慢/包依赖解决包冲突/如何导入本地 jar](https://houbb.github.io/2016/08/06/maven-06-tips)

[maven 包管理平台-07-plugins 常见插件介绍](https://houbb.github.io/2016/08/06/maven-07-plugins)

[maven 包管理平台-08-nexus 自己搭建 maven 仓库](https://houbb.github.io/2016/08/06/maven-08-nexus)

# Nexus

[Nexus](http://www.sonatype.com/nexus-repository-sonatype) 是组织、存储和分发软件组件的最佳方式。

## 下载

> [下载](http://www.sonatype.com/download-oss-sonatype)

安装方法：

- 包含Jetty的捆绑包，只需 *JRE*。我选择了这种方式 ```nexus-2.13.0-01-bundle.tar.gz```;

- War，可以部署在Web上。

## 安装

将文件解压到所需位置。包含两个文件夹：

- **nexus-2.13.0-01** 包含Nexus运行所需的内容。

- **sonatype-work** 包含配置、仓库、日志文件。

## 启动

进入 *bin* 文件夹，在 ```~/nexus-2.13.0-01/bin``` 中运行 **nexus**，您可能会得到：

```
houbinbindeMacBook-Pro:~ houbinbin$ /Users/houbinbin/IT/learn/nexus/nexus-2.13.0-01-bundle/nexus-2.13.0-01/bin/nexus ; exit;
Usage: /Users/houbinbin/IT/learn/nexus/nexus-2.13.0-01-bundle/nexus-2.13.0-01/bin/nexus { console | start | stop | restart | status | dump }
logout
Saving session...
...copying shared history...
...saving history...truncating history files...
...completed.
```

因此，只需运行以下命令即可启动 Nexus 服务器。

```
/Users/houbinbin/IT/learn/nexus/nexus-2.13.0-01-bundle/nexus-2.13.0-01/bin/nexus start
```

您可以在以下路径的文件 ```nexus.properties``` 中编辑 **端口**：

```
~/nexus/nexus-2.13.0-01-bundle/nexus-2.13.0-01/conf
```

## 访问

在浏览器中输入URL，然后您可以访问 Nexus 的仪表板。

```
http://127.0.0.1:8081/nexus
```

![nexus 仪表板](https://raw.githubusercontent.com/houbb/resource/master/img/2016/2016-08-06-maven-nexus.png)

您可以在右上角登录 Nexus，默认管理员是：

```
用户名：admin
密码：admin123
```

# Config

在 ```setting.xml``` 中设置所有远程仓库使用内部仓库。

```xml
<!--setting maven only use internal repository-->
<mirrors>
    <mirror>
        <id>central</id>
        <name>central-mirror</name>
        <mirrorOf>*</mirrorOf>
        <url>http://localhost:8081/nexus/content/groups/public/</url>
    </mirror>
</mirrors>

<profiles>
    <profile>
        <!--this profile will allow snapshots to be searched when activated-->
        <id>public-snapshots</id>
        <repositories>
            <repository>
                <id>public-snapshots</id>
                <url>http://localhost:8081/nexus/content/groups/public</url>
                <releases><enabled>true</enabled></releases>
                <snapshots><enabled>true</enabled></snapshots>
            </repository>
        </repositories>
        <pluginRepositories>
            <pluginRepository>
                <id>public-snapshots</id>
                <url>http://localhost:8081/nexus/content/groups/public</url>
                <releases><enabled>true</enabled></releases>
                <snapshots><enabled>true</enabled></snapshots>
            </pluginRepository>
        </pluginRepositories>
    </profile>
</profiles>

<activeProfiles>
    <activeProfile>public-snapshots</activeProfile>
</activeProfiles>
```

# Repository

## Remote Repository

- 在 pom.xml 中设置

```xml
<repositories>
    <repository>
        <id>nexus</id>
        <name>Team Nexus Repository</name>
        <url>http://localhost:8081/nexus/content/groups/public</url>
        <releases><enabled>true</enabled></releases>
        <snapshots>
            <enabled>true</enabled>
            <checksumPolicy>ignore</checksumPolicy>
            <updatePolicy>daily</updatePolicy>
        </snapshots>
    </repository>
</repositories>
```

- 在 setting.xml 设置认证信息

```xml
<settings>
    <!--...-->
    <servers>
        <server>
            <id>my-auth</id>
            <username>usr</username>
            <password>pwd</password>
        </server>
    </servers>
</settings>
```

在 `setting.xml` 中必须有一个 server，它的 **id** 与 `pom.xml` 中的相同，并且正确配置认证信息。

在 `pom.xml` 中将项目部署到远程仓库。

```xml
<distributionManagement>
    <repository>
        <id>releases</id>
        <name>Nexus Releases Repository</name>
        <url>http://localhost:8081/nexus/content/repositories/releases/</url>
    </repository>

    <snapshotRepository>
        <id>snapshots</id>
        <name>Nexus Snapshots Repository</name>
        <url>http://localhost:8081/nexus/content/repositories/snapshots/</url>
    </snapshotRepository>
</distributionManagement>
```

然后，使用以下命令可以部署它：

```
mvn clean deploy
```

在部署时需要进行身份验证。

```xml
<servers>
    <server>
        <id>releases</id>
        <username>admin</username>
        <password>admin123</password>
    </server>
    <server>
        <id>snapshots</id>
        <username>admin</username>
        <password>admin123</password>
    </server>
</servers>
```

默认角色:

1）  admin ：对 Nexus 服务的完全控制权限，默认密码为 admin123

2）  deployment ：能够访问 Nexus ，浏览仓库内容，搜索并且上传部署构件但无法配置 Nexus ，默认密码为： deployment123

3）  anonymous ：对应所有未登录用户，可以浏览和搜索仓库

Jar包存储地址默认为:

```
~/nexus/nexus-2.13.0-01-bundle/sonatype-work/nexus/storage
```

## 镜像

从 X 仓库获取的所有内容，也可以从它的镜像获取。

实际上我喜欢这样配置：

```xml
<mirrors>
  <mirror>
    <id>nexus</id>
    <mirrorOf>*</mirrorOf>
    <url>http://localhost:8081/nexus/content/groups/public</url>
  </mirror>
</mirrors>
```

1. ```<mirrorOf>*</mirrorOf>```   匹配所有远程仓库。

2. ```<mirrorOf>external: *</mirrorOf>``` 匹配所有非本地主机的远程仓库。

3. ```<mirrorOf>repo1, repo2</mirrorOf>``` 匹配 repo1 和 repo2...

4. ```<mirrorOf>*, !repo1</mirrorOf>``` 匹配所有仓库，但不包括 repo1。

注: 这个一般不用修改。

# Tips

- Cannot deploy artifacts when Maven is in offline mode

- 上传三方jar到 nexus

点击【Add Artifact】-》点击【Upload Artifact(s)】

# 参考资料

> [intro zh_CN](http://www.cnblogs.com/luotaoyeah/p/3791966.html)

> [3rd zh_CN](http://www.cnblogs.com/quanyongan/archive/2013/04/24/3037589.html)

> [setting zh_CN](http://my.oschina.net/u/873661/blog/195373)

* any list
{:toc}