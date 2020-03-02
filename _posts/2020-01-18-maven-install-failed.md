---
layout: post
title: maven 打包报错 Return code is 501 , ReasonPhrase:HTTPS Required.
date:  2020-1-9 10:09:32 +0800
categories: [Devops]
tags: [devops, maven, java, error, sh]
published: true
---

# 报错场景

今天 maven 打包，报错如下：

```
[ERROR] Failed to execute goal on project pinyin: Could not resolve dependencies for project com.github.houbb:pinyin:jar:0.0.2-SNAPS
HOT: Failed to collect dependencies at com.github.houbb:heaven:jar:0.1.74: Failed to read artifact descriptor for com.github.houbb:h
eaven:jar:0.1.74: Could not transfer artifact com.github.houbb:heaven:pom:0.1.74 from/to repo1 (http://repo1.maven.org/maven2): Fail
ed to transfer file http://repo1.maven.org/maven2/com/github/houbb/heaven/0.1.74/heaven-0.1.74.pom with status code 501 -> [Help 1]
[ERROR]
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR]
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/DependencyResolutionException
```

## 包的存在性

这个包 `com.github.houbb:heaven:jar:0.1.74` 是我昨天上传的，所以在中央仓库肯定有的。

这个报错也不是 404，而是 501

## 搜索一下

这个问题的解决方案也有，我们选择一遍作为记录。

> [statckoverflow-maven-dependencies-are-failing-with-a-501-error](https://stackoverflow.com/questions/59763531/maven-dependencies-are-failing-with-a-501-error)

原因如下：

```
Effective January 15, 2020, The Central Repository no longer supports insecure communication over plain HTTP and requires that all requests to the repository are encrypted over HTTPS.
```

It looks like latest versions of Maven (tried with 3.6.0, 3.6.1) are already using the HTTPS URL by default.


使用 2020-01-15 开始强制使用 HTTPS ，说是 maven 3.6.0 默认支持。

### 本地 jdk

为了编译需要，个人使用的是 jdk1.7

### 本地 maven

```
$   mvn -v
Apache Maven 3.6.2 (40f52333136460af0dc0d7232c0dc0bcf0d9e117; 2019-08-27T23:06:16+08:00)
```

看的出来很不幸，我的 3.6.2 版本依然不支持。

那如何解决？

# 解决方案

## 调整 setting.xml

于是我们在构建过程中所依赖的 settings.xml 文件中，加入了一以下配置：

```xml
<mirror>
    <id>central</id>
    <name>Maven Repository Switchboard</name>
    <url>https://repo1.maven.org/maven2/</url>
    <mirrorOf>central</mirrorOf>
</mirror>
```

## 指定协议版本

但是问题依然没有解决，接着报错，错误如下：

```
Could not transfer artifact com.ipower365.boss:nacha:pom:1.0.1 from/to central (
https://repo1.maven.org/maven2/):
Received fatal alert: protocol_version -> [Help 1]
```

这个是在使用https协议请求中央仓库时，需要指定协议版本，然后在构建时，加入了如下参数，参考链接如下：　

> [why-am-i-getting-received-fatal-alert-protocol-version-or-peer-not-authentic](https://stackoverflow.com/questions/50824789/why-am-i-getting-received-fatal-alert-protocol-version-or-peer-not-authentic)

在JAVA8环境使用mvn打包时，不需要指定以上参数，但是使用JAVA7环境的时候，则会出现以上报错。

### 打包命令

```
$   mvn clean install -Dhttps.protocols=TLSv1.2
```

重新构建，打包成功。

# 连接超时

## 场景

直接打包报错如下：

```
[ERROR] Failed to execute goal on project json: Could not resolve dependencies for project com.github.houb
b:json:jar:0.1.9-SNAPSHOT: Failed to collect dependencies at com.github.houbb:heaven:jar:0.1.86: Failed to
 read artifact descriptor for com.github.houbb:heaven:jar:0.1.86: Could not transfer artifact com.github.h
oubb:heaven:pom:0.1.86 from/to repo1 (http://repo1.maven.org/maven2): Connect to repo1.maven.org:80 [repo1
.maven.org/151.101.52.209] failed: Connection timed out: connect -> [Help 1]
```

## 原因 

因为 maven 打包，所以需要访问 maven 仓库，国外的仓库镜像访问可能比较慢，所以可以设置为国内镜像。

在 maven 的配置文件中， `<mirrors>` 里面添加

```xml
<mirror>
    <id>nexus-aliyun</id>
    <mirrorOf>*</mirrorOf>
    <name>Nexus aliyun</name>
    <url>http://maven.aliyun.com/nexus/content/groups/public</url>
</mirror>
```

完整版本的 mirrors 如下：

```xml
<mirrors>
    <!-- mirror
     | Specifies a repository mirror site to use instead of a given repository. The repository that
     | this mirror serves has an ID that matches the mirrorOf element of this mirror. IDs are used
     | for inheritance and direct lookup purposes, and must be unique across the set of mirrors.
     |
    <mirror>
      <id>mirrorId</id>
      <mirrorOf>repositoryId</mirrorOf>
      <name>Human Readable Name for this Mirror.</name>
      <url>http://my.repository.com/repo/path</url>
    </mirror>
     -->
    <mirror>
        <id>nexus-aliyun</id>
        <mirrorOf>*</mirrorOf>
        <name>Nexus aliyun</name>
        <url>http://maven.aliyun.com/nexus/content/groups/public</url>
    </mirror>

    <mirror>
      <id>repo1</id>
      <mirrorOf>central</mirrorOf>
      <url>https://repo1.maven.org/maven2/</url>
    </mirror>	
    
</mirrors>
```

# 参考资料

[关于 maven 打包时的报错： Return code is: 501 , ReasonPhrase:HTTPS Required.](https://www.cnblogs.com/flashfish/p/12202305.html)

[maven 配置以及设置国内镜像](https://blog.csdn.net/boywcx/article/details/82628703)

* any list
{:toc}