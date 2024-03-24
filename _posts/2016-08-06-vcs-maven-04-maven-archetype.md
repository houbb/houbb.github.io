---
layout: post
title: maven 包管理平台-04-maven archetype 项目原型 
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


# Maven Archetype

> [archetype](https://maven.apache.org/archetype/index.html)

## 是什么？

简而言之，Archetype 是一个 Maven 项目模板工具包。原型被定义为所有相同类型的其他事物所制作的原始模式或模型。

## 使用

要基于原型创建新项目，您需要调用 ```mvn archetype:generate``` 目标。

# 如何创建原型？

## 创建

> [定义原型](http://maven.apache.org/components/archetype/maven-archetype-plugin/advanced-usage.html)

- 创建

```
$ mvn archetype:create-from-project
```

```
houbinbindeMacBook-Pro:archetype houbinbin$ mvn archetype:create-from-project
[INFO] Scanning for projects...
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building archetype 1.0.0
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] >>> maven-archetype-plugin:2.4:create-from-project (default-cli) > generate-sources @ archetype >>>
[INFO]
[INFO] <<< maven-archetype-plugin:2.4:create-from-project (default-cli) < generate-sources @ archetype <<<
[INFO]
[INFO] --- maven-archetype-plugin:2.4:create-from-project (default-cli) @ archetype ---
[INFO] Setting default groupId: com.ryo
[INFO] Setting default artifactId: archetype
[INFO] Setting default version: 1.0.0
[INFO] Setting default package: com.ryo
[INFO] Scanning for projects...
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building archetype-archetype 1.0.0
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- maven-resources-plugin:3.0.1:resources (default-resources) @ archetype-archetype ---
[WARNING] Using platform encoding (UTF-8 actually) to copy filtered resources, i.e. build is platform dependent!
[INFO] Copying 10 resources
[INFO]
[INFO] --- maven-resources-plugin:3.0.1:testResources (default-testResources) @ archetype-archetype ---
[WARNING] Using platform encoding (UTF-8 actually) to copy filtered resources, i.e. build is platform dependent!
[INFO] Copying 2 resources
[INFO]
[INFO] --- maven-archetype-plugin:2.4:jar (default-jar) @ archetype-archetype ---
[INFO] Building archetype jar: /Users/houbinbin/IT/code/branches/archetype/target/generated-sources/archetype/target/archetype-archetype-1.0.0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 0.835 s
[INFO] Finished at: 2016-06-11T21:57:36+08:00
[INFO] Final Memory: 14M/309M
[INFO] ------------------------------------------------------------------------
[INFO] Archetype project created in /Users/houbinbin/IT/code/branches/archetype/target/generated-sources/archetype
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 2.955 s
[INFO] Finished at: 2016-06-11T21:57:36+08:00
[INFO] Final Memory: 14M/245M
[INFO] ------------------------------------------------------------------------
```

## 安装

```xml
$ cd target/generated-sources/archetype/
$ mvn install
```

日志

```
[INFO] Scanning for projects...
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building archetype-archetype 1.0.0
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- maven-resources-plugin:3.0.1:resources (default-resources) @ archetype-archetype ---
[WARNING] Using platform encoding (UTF-8 actually) to copy filtered resources, i.e. build is platform dependent!
[INFO] Copying 10 resources
[INFO]
[INFO] --- maven-resources-plugin:3.0.1:testResources (default-testResources) @ archetype-archetype ---
[WARNING] Using platform encoding (UTF-8 actually) to copy filtered resources, i.e. build is platform dependent!
[INFO] Copying 2 resources
[INFO]
[INFO] --- maven-archetype-plugin:2.4:jar (default-jar) @ archetype-archetype ---
[INFO] Building archetype jar: /Users/houbinbin/IT/code/branches/archetype/target/generated-sources/archetype/target/archetype-archetype-1.0.0
[INFO]
[INFO] --- maven-archetype-plugin:2.4:integration-test (default-integration-test) @ archetype-archetype ---
[INFO] Processing Archetype IT project: basic
[INFO] ----------------------------------------------------------------------------
[INFO] Using following parameters for creating project from Archetype: archetype-archetype:1.0.0
[INFO] ----------------------------------------------------------------------------
[INFO] Parameter: groupId, Value: archetype.it
[INFO] Parameter: artifactId, Value: basic
[INFO] Parameter: version, Value: 0.1-SNAPSHOT
[INFO] Parameter: package, Value: it.pkg
[INFO] Parameter: packageInPathFormat, Value: it/pkg
[INFO] Parameter: version, Value: 0.1-SNAPSHOT
[INFO] Parameter: package, Value: it.pkg
[INFO] Parameter: groupId, Value: archetype.it
[INFO] Parameter: artifactId, Value: basic
[WARNING] Don't override file /Users/houbinbin/IT/code/branches/archetype/target/generated-sources/archetype/target/test-classes/projects/basic/project/basic/.idea/copyright/profiles_settings.xml
[INFO] project created from Archetype in dir: /Users/houbinbin/IT/code/branches/archetype/target/generated-sources/archetype/target/test-classes/projects/basic/project/basic
[INFO]
[INFO] --- maven-install-plugin:2.5.2:install (default-install) @ archetype-archetype ---
[INFO] Installing /Users/houbinbin/IT/code/branches/archetype/target/generated-sources/archetype/target/archetype-archetype-1.0.0.jar to /Users/houbinbin/.m2/repository/com/ryo/archetype-archetype/1.0.0/archetype-archetype-1.0.0.jar
[INFO] Installing /Users/houbinbin/IT/code/branches/archetype/target/generated-sources/archetype/pom.xml to /Users/houbinbin/.m2/repository/com/ryo/archetype-archetype/1.0.0/archetype-archetype-1.0.0.pom
[INFO]
[INFO] --- maven-archetype-plugin:2.4:update-local-catalog (default-update-local-catalog) @ archetype-archetype ---
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 0.885 s
[INFO] Finished at: 2016-06-11T22:00:07+08:00
[INFO] Final Memory: 15M/309M
[INFO] ------------------------------------------------------------------------
```

## 删除不需要的项目原型

- maven 本地的项目项目原型默认存放在：

```
~/.m2/repository/archetype-catalog.xml
```

你可以手动修改此文件

- deploy 发布

pom.xml 文件中指定：

```
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

执行：

```
$   mvn deploy
```

## 使用

```xml
$ mkdir /tmp/archetype
$ cd /tmp/archetype
$ mvn archetype:generate -DarchetypeCatalog=local
```

```
[INFO] Scanning for projects...
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building Maven Stub Project (No POM) 1
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] >>> maven-archetype-plugin:2.4:generate (default-cli) > generate-sources @ standalone-pom >>>
[INFO]
[INFO] <<< maven-archetype-plugin:2.4:generate (default-cli) < generate-sources @ standalone-pom <<<
[INFO]
[INFO] --- maven-archetype-plugin:2.4:generate (default-cli) @ standalone-pom ---
[INFO] Generating project in Interactive mode
[INFO] No archetype defined. Using maven-archetype-quickstart (org.apache.maven.archetypes:maven-archetype-quickstart:1.0)
Choose archetype:
1: local -> com.ryo:archetype-archetype (archetype-archetype)
Choose a number or apply filter (format: [groupId:]artifactId, case sensitive contains): :
```

```
Choose a number or apply filter (format: [groupId:]artifactId, case sensitive contains): : 1
Define value for property 'groupId': : com.ryo
Define value for property 'artifactId': : test
Define value for property 'version':  1.0-SNAPSHOT: : 1.0.0
Define value for property 'package':  com.ryo: : com.ryo
Confirm properties configuration:
groupId: com.ryo
artifactId: test
version: 1.0.0
package: com.ryo
 Y: : y
```

```
[INFO] ----------------------------------------------------------------------------
[INFO] Using following parameters for creating project from Archetype: archetype-archetype:1.0.0
[INFO] ----------------------------------------------------------------------------
[INFO] Parameter: groupId, Value: com.ryo
[INFO] Parameter: artifactId, Value: test
[INFO] Parameter: version, Value: 1.0.0
[INFO] Parameter: package, Value: com.ryo
[INFO] Parameter: packageInPathFormat, Value: com/ryo
[INFO] Parameter: package, Value: com.ryo
[INFO] Parameter: version, Value: 1.0.0
[INFO] Parameter: groupId, Value: com.ryo
[INFO] Parameter: artifactId, Value: test
[WARNING] Don't override file /Users/houbinbin/IT/code/branches/test/test/.idea/copyright/profiles_settings.xml
[INFO] project created from Archetype in dir: /Users/houbinbin/IT/code/branches/test/test
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 01:34 min
[INFO] Finished at: 2016-06-11T22:11:32+08:00
[INFO] Final Memory: 14M/309M
[INFO] ------------------------------------------------------------------------
```

## 添加原型

![添加原型](https://raw.githubusercontent.com/houbb/resource/master/img/2016-06-11-maven-archetype-add.png)

输入您的原型项目的位置，然后您就可以像其他 Maven 原型一样使用它。

## 移除原型

```
~/Library/Caches/IntelliJIdea<version>/Maven/Indices/UserArchetypes.xml
```

打开并编辑此文件，然后重新启动 IntelliJIdea。

> [项目原型简介](http://singleant.iteye.com/blog/1470663)

## 生成项目架构

```
houbinbindeMacBook-Pro:archetype-resources houbinbin$ ls
README.md                       __rootArtifactId__-dal          __rootArtifactId__-surface      __rootArtifactId__-util         app-demo.iml
__rootArtifactId__-biz          __rootArtifactId__-service      __rootArtifactId__-test         __rootArtifactId__-web          pom.xml
houbinbindeMacBook-Pro:archetype-resources houbinbin$ pwd
/Users/houbinbin/IT/code/app-demo/target/generated-sources/archetype/target/classes/archetype-resources
```

## 元数据指定 (`archetype-metadata.xml`)

```
houbinbindeMacBook-Pro:maven houbinbin$ ls
archetype-metadata.xml
houbinbindeMacBook-Pro:maven houbinbin$ pwd
/Users/houbinbin/IT/code/app-demo/target/generated-sources/archetype/target/classes/META-INF/maven
```

示例:

[archetype-metadata.xml]({{ site.url }}/static/res/mvn/maven.xml)

* any list
{:toc}