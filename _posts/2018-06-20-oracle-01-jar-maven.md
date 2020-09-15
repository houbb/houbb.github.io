---
layout: post
title:  Oracle 系统学习-01-oracle java 客户端包上传到 maven 仓库
date:  2018-06-20 11:31:36 +0800
categories: [Oracle]
tags: [oracle, maven]
published: true
---

# Oracle Jar

## 下载

> [downloads](http://www.oracle.com/technetwork/database/application-development/jdbc/downloads/index.html)

选择合适的版本下载

## Maven 配置

可以将项目导入到本地的 maven 仓库，然后即可正常引入。

## 项目 maven 配置

- pom.xml

jar 放置在根目录的 lib 文件夹下

```xml
<dependency>
    <groupId>com.oracle</groupId>
    <artifactId>ojdbc7</artifactId>
    <version>jdk7-8</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/../lib/ojdbc7.jar</systemPath>
</dependency>
```




* any list
{:toc}







