---
layout: post
title: maven 包管理平台-06-常用技巧  实时更新快照/乱码问题/下载很慢/包依赖解决包冲突/如何导入本地 jar
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


# 实时更新快照

当您在使用 **Idea** 获取 **快照（snapshot）** Jar 包时，您可能不能立即获得它。

以下是解决方法：

打开 Preference，搜索 **maven**，并选择 ```Always update snapshots```

# 乱码问题

[mvn运行乱码问题](https://my.oschina.net/mifans/blog/781734)

在 ```pom.xml``` 的 **properties** 下添加以下内容：

```xml
<properties>
    <argLine>-Dfile.encoding=UTF-8</argLine>
</properties>
``` 

# 下载很慢

[blog zh_CN](http://blog.csdn.net/a992036795/article/details/53161344)


在 ```~/.m2/setting.xml``` 中添加:

```xml
<mirrors>
       <!-- 阿里云仓库 -->
      <mirror>
           <id>alimaven</id>
           <mirrorOf>central</mirrorOf>
           <name>aliyun maven</name>
            <url>http://maven.aliyun.com/nexus/content/repositories/central/</url>
       </mirror>
</mirrors>
```

# 包依赖解决包冲突

有时候依赖其他的三方jar包较多，有些jar被重复引入且版本不一致。(比如```slf4j-api.jar```)

可以在某一个项目下使用 ```mvn dependency:tree```

```
D:\CODE\other\framework\framework-cache>mvn dependency:tree
[INFO] Scanning for projects...
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building framework :: Module :: Cache 1.0.2-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- maven-dependency-plugin:2.8:tree (default-cli) @ framework-cache ---
[INFO] com.framework:framework-cache:jar:1.0.2-SNAPSHOT
[INFO] +- com.framework:framework-tool:jar:1.0.2-SNAPSHOT:compile
[INFO] |  +- com.framework:framework-common:jar:1.0.2-SNAPSHOT:compile
[INFO] |  |  +- org.apache.commons:commons-lang3:jar:3.3.2:compile
[INFO] |  |  +- commons-collections:commons-collections:jar:3.2.1:compile
[INFO] |  |  +- commons-codec:commons-codec:jar:1.10:compile
[INFO] |  |  \- org.projectlombok:lombok:jar:1.16.8:compile
[INFO] |  +- org.apache.logging.log4j:log4j-api:jar:2.5:compile
[INFO] |  +- org.apache.logging.log4j:log4j-core:jar:2.5:compile
[INFO] |  +- com.alibaba:fastjson:jar:1.2.8:compile
[INFO] |  +- com.fasterxml.jackson.core:jackson-databind:jar:2.4.0:compile
[INFO] |  |  +- com.fasterxml.jackson.core:jackson-annotations:jar:2.4.0:compile
[INFO] |  |  \- com.fasterxml.jackson.core:jackson-core:jar:2.4.0:compile
[INFO] |  +- org.reflections:reflections:jar:0.9.10:compile
[INFO] |  |  +- com.google.guava:guava:jar:15.0:compile
[INFO] |  |  +- org.javassist:javassist:jar:3.20.0-GA:compile
[INFO] |  |  \- com.google.code.findbugs:annotations:jar:2.0.1:compile
[INFO] |  \- junit:junit:jar:4.12:compile
[INFO] |     \- org.hamcrest:hamcrest-core:jar:1.3:compile
[INFO] +- org.springframework:spring-context:jar:4.2.3.RELEASE:compile
[INFO] |  +- org.springframework:spring-aop:jar:4.2.3.RELEASE:compile
[INFO] |  +- org.springframework:spring-beans:jar:4.2.3.RELEASE:compile
[INFO] |  +- org.springframework:spring-core:jar:4.2.3.RELEASE:compile
[INFO] |  |  \- commons-logging:commons-logging:jar:1.2:compile
[INFO] |  \- org.springframework:spring-expression:jar:4.2.3.RELEASE:compile
[INFO] +- org.springframework.data:spring-data-redis:jar:1.3.2.RELEASE:compile
[INFO] |  +- org.springframework:spring-context-support:jar:4.2.3.RELEASE:compile
[INFO] |  +- org.slf4j:slf4j-api:jar:1.7.5:compile
[INFO] |  \- org.springframework:spring-tx:jar:4.2.3.RELEASE:compile
[INFO] +- redis.clients:jedis:jar:2.4.2:compile
[INFO] |  \- org.apache.commons:commons-pool2:jar:2.0:compile
[INFO] +- aopalliance:aopalliance:jar:1.0:compile
[INFO] +- org.aspectj:aspectjweaver:jar:1.8.5:compile
[INFO] +- org.aspectj:aspectjrt:jar:1.8.5:compile
[INFO] \- commons-net:commons-net:jar:3.5:compile
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 1.927 s
[INFO] Finished at: 2017-01-24T10:57:41+08:00
[INFO] Final Memory: 15M/304M
[INFO] ------------------------------------------------------------------------
```

- 排除依赖

> [exclusion](http://blog.csdn.net/rocklee/article/details/51692054)


# 如何导入本地 jar？

场景：有些 jar 文件中央仓库没有。在 maven 项目中使用我们就需要采取一些技巧。

## 导入到本地仓库

- 导入到 nexus 仓库

- 导入到 maven 仓库

如[maven添加sqlserver的jdbc驱动包](http://www.cnblogs.com/dawnheaven/p/5738477.html)

一、 在有 `sqljdbc4.jar` 的文件下

```
mvn install:install-file -Dfile=sqljdbc4.jar -Dpackaging=jar -DgroupId=com.microsoft.sqlserver -DartifactId=sqljdbc4 -Dversion=4.0
```

命令解释：mvn install:install-file -Dfile="jar包的绝对路径" -Dpackaging="文件打包方式" -DgroupId=groupid名 -DartifactId=artifactId名 -Dversion=jar版本

二、引入

```xml
<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>sqljdbc4</artifactId>
    <version>4.0</version>
</dependency>
```

## 指定绝对路径

> [Maven中使用本地JAR包](http://www.cnblogs.com/richard-jing/archive/2013/01/27/Maven_localjar.html)

1. 路径指定时使用 `/`, 为了跨平台。

2. 如果是 maven 多模块项目。可以使用类似如下的 jar 路径指定方式：

```xml
<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>sqljdbc4</artifactId>
    <version>4.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/../lib/sqljdbc4.jar</systemPath>
</dependency>
```

## 通过编译参数

> [既使用maven编译，又使用lib下的Jar包](http://blog.csdn.net/u013490585/article/details/70231279)


* any list
{:toc}