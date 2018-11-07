---
layout: post
title: Maven Dependency
date:  2018-11-7 08:58:33 +0800
categories: [Java]
tags: [maven, java, sf]
published: true
excerpt: maven 依赖关系处理
---

# maven 依赖传递

maven 的 jar 默认是依赖传递的。

有两种方式可以断绝这种依赖传递。

## 声明时

如果当前模块其中一个引入的 jar 如此声明，那么其他的模块引入当前模块，则这个 jar 不会被引入。

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>log-integration</artifactId>
    <version>1.0.0</version>
    <optional>true</optional>
</dependency>
```

## 引用时

有时候我们想排除某一个依赖。可以声明如下：

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>log-integration</artifactId>
    <version>1.0.0</version>
    <exclusions>
        <exclusion>

        </exclusion>
    </exclusions>
</dependency>
```

可以在 `<exclusion>` 中指定 log-integration 依赖，但是我们想排除的 jar。

# maven 各种 jar 之间的依赖关系

## 常用命令

```
mvn dependency:tree
```

查看所有依赖

```
mvn dependency:tree -Dverbose
```

## 指定 jar 的依赖关系

如下命令可以指定 `xmlbeans:xbean` 相关的 jar，获得依赖关系。

```
mvn dependency:tree -Dverbose -Dincludes=xmlbeans:xbean
```

* any list
{:toc}