---
layout: post
title: QA-01-包的 jar 包依赖解析, jar 包的 class 文件类解析
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, ci, qa, sh]
published: true
---


# 依赖梳理

war 包依赖的 jar

jar 对应的 class

## 可以做什么？

- 确认最新的版本

类冲突

包兼容性

包安全性扫描？

snapshot 禁止

低版本强制升级？

- 版本之间的差异对比？

- 新增修改的包版本进行对比+review？

# 整体流程

和流水线联合在一起。

记录每一个版本的基础信息。

然后再结合上面的信息，进行处理。

# 快速开始 

## 需要 

jdk1.7+

maven 3.x+

## maven 引入 

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>jar-scan</artifactId>
    <version>0.1.0</version>
</dependency>
```

## 入门例子

- jar

```java
JarScanResult jarScanResult = JarScanHelper.scanJar("C:\\Users\\Administrator\\.m2\\repository\\com\\github\\houbb\\heaven\\0.9.0-SNAPSHOT\\heaven-0.9.0-SNAPSHOT.jar");
```

效果：

```
JarScanResult{jarBasicInfo=JarBasicInfoDto{groupId='null', artifactId='null', version='null', jarName='C:\Users\Administrator\.m2\repository\com\github\houbb\heaven\0.9.0-SNAPSHOT\heaven-0.9.0-SNAPSHOT.jar'}, classDetailList=[ClassDetailInfoDto{classFullName='com.github.houbb.heaven.annotation.CommonEager'}...]}
```

- war

```java
WarScanResult warScanResult = JarScanHelper.scanWar("D:\\github\\serlvet-simple-demo\\target\\servlet.war");
```

效果：

```
WarScanResult{jarList=[JarBasicInfoDto{groupId='hamcrest.org', artifactId='hamcrest-core', version='1.3', jarName='C:\Users\ADMINI~1\AppData\Local\Temp\WEB-INF\lib\hamcrest-core-1.3.jar'}, JarBasicInfoDto{groupId='JUnit', artifactId='JUnit', version='4.13.1', jarName='C:\Users\ADMINI~1\AppData\Local\Temp\WEB-INF\lib\junit-4.13.1.jar'}], warName='servlet'}
```

# ROAD-MAP

- [ ] 基于这个的包管理-admin 控台

- [ ] 确认最新的版本

- [ ] 类冲突

- [ ] 包兼容性

- [ ] 包安全性扫描？

- [ ] snapshot 禁止

- [ ] 低版本强制升级？

- [ ] 版本之间的差异对比？

- [ ] 新增修改的包版本进行对比+review？


# 小结

* any list
{:toc}