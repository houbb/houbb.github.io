---
layout: post
title: 复制修改项目好，还是打包为公共的 jar 更好？
date: 2025-9-26 20:40:12 +0800
categories: [Java]
tags: [java, maven, sh]
published: true
---


# 背景

针对旧项目的改造。

```
test-service
test-integration
test-util
```

依赖关系如下：

```
+-----------------+
|  test-service   |
+--------+--------+
         |
         v
+-----------------+
| test-integration|
+--------+--------+
         |
         v
+-----------------+
|   test-util     |
+-----------------+
```

test-serivce 有一个 facade 接口，期望迁移到 bat 系统中。

那么要如何实现呢？

## 思路1-复制

这是最常见的一种方式，直接复制对应的代码到 bat 系统中。

好处：对原系统的影响最小，也最简单灵活

缺点：如果后续逻辑调整，需要修改2个地方。

## 思路2-打包为公共 jar

可以把依赖的部分打包为 jar，然后新的项目中使用。

优点：只需要改一个地方，保障功能的一致性。

缺点：对于打包和项目的维护管理提出一定的要求。且存在各种依赖等，比较复杂。

## 最后方案

最后选择了一个项目折中的方案。

service 如果全部打包依赖的太多，且只关注其中的一个接口，这部分采用复制+修改的方式。

integration 层相对比较稳定，且代码比较复杂，所以期望直接把 integration 打包为公共 jar。


# 多模块依赖的难题

## 难题

不同于简单的 facade，facade 的依赖一般非常少。

直接和当前项目断开依赖，作为一个独立的模块，指定打包就行。

integration 层涉及到大量的包依赖，全部复制过来特别多、且需要梳理。

所以希望像在原来的项目中一样，打包的时候可以直接获取到对应的依赖包版本。

### snapshot 问题

一般的项目都是 1.0-SNAPSHOT，跟着主 pom.xml 版本走。

但是提供的 jar 必须是稳定的，就像我们日常的 facade 一样，不然会导致后续更新产线的包不稳定的问题。

### 传递依赖问题


不同于单个的 facade 模块，实际上我们依赖的这种包都需要处理。

上传到 nexus 中去。

```
+-----------------+
| test-integration|
+--------+--------+
         |
         v
+-----------------+
|   test-util     |
+-----------------+
```

# 解决方案

## 目录结构

为了演示 maven 多模块，我们尽可能的简化。

```
│   pom.xml
├───test-integration
│   │   pom.xml
├───test-service
│   │   pom.xml
└───test-util
    │   pom.xml
```

### 主 pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>maven-multi-model-demo</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <modules>
        <module>test-service</module>
        <module>test-integration</module>
        <module>test-util</module>
    </modules>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.example</groupId>
                <artifactId>test-service</artifactId>
                <version>1.0-SNAPSHOT</version>
            </dependency>
            <dependency>
                <groupId>org.example</groupId>
                <artifactId>test-integration</artifactId>
                <version>1.0-SNAPSHOT</version>
            </dependency>
            <dependency>
                <groupId>org.example</groupId>
                <artifactId>test-util</artifactId>
                <version>1.0-SNAPSHOT</version>
            </dependency>
        </dependencies>
    </dependencyManagement>

</project>
```

### test-util pom

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.example</groupId>
        <artifactId>maven-multi-model-demo</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <artifactId>test-util</artifactId>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

</project>
```

### test-integration pom

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.example</groupId>
        <artifactId>maven-multi-model-demo</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <artifactId>test-integration</artifactId>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.example</groupId>
            <artifactId>test-util</artifactId>
        </dependency>
    </dependencies>

</project>
```

### test-service pom

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.example</groupId>
        <artifactId>maven-multi-model-demo</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <artifactId>test-service</artifactId>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.example</groupId>
            <artifactId>test-integration</artifactId>
        </dependency>
    </dependencies>

</project>
```

## snapshot 问题

我们首先来解决 snapshot 的问题

### 主 pom

指定对应的 snapshot 版本

```xml
<properties>
        <test-integration.version>20250926-SNAPSHOT</test-integration.version>
        <test-util.version>20250926-SNAPSHOT</test-util.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.example</groupId>
            <artifactId>test-integration</artifactId>
            <version>${test-integration.version}</version>
        </dependency>
        <dependency>
            <groupId>org.example</groupId>
            <artifactId>test-util</artifactId>
            <version>${test-util.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

在 test-integration 和 test-util 中指定版本

```xml
<version>20250926-SNAPSHOT</version>
```

### 测试

```
mvn clean install
```

如下：

```
[INFO] maven-multi-model-demo 1.0-SNAPSHOT ................ SUCCESS [  0.284 s]
[INFO] test-util 20250926-SNAPSHOT ........................ SUCCESS [  5.696 s]
[INFO] test-integration 20250926-SNAPSHOT ................. SUCCESS [  0.136 s]
[INFO] test-service 1.0-SNAPSHOT .......................... SUCCESS [  0.146 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

可以看到对应的2个模块，已经是我们的指定版本了。

## nexus 上传问题

因为整个项目特别大，我们不可能把全部丢上去，比如在根目录中

```
mvn clean deploy
```

就会把整个项目都上传到 nexus 中，但是我们并不想这样。

### 指定方式

好在 maven 是支持指定打包的范围的。

我们可以在主 pom.xml 中添加如下的内容：

```xml
    <profiles>
        <profile>
            <id>default</id>
            <modules>
                <module>test-service</module>
                <module>test-integration</module>
                <module>test-util</module>
            </modules>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
        </profile>
        <profile>
            <id>moduleConfig</id>
            <modules>
                <module>test-integration</module>
                <module>test-util</module>
            </modules>
            <activation>
                <activeByDefault>false</activeByDefault>
            </activation>
        </profile>
    </profiles>
```

意思是，默认还是和以前一样，前模块。

不过我们可以通过下面的命令，触发指定的模块本地打包，上传 deploy 也是同理。

```
mvn clean install -P moduleConfig
```

### 测试

```
[INFO] maven-multi-model-demo 1.0-SNAPSHOT ................ SUCCESS [  0.314 s]
[INFO] test-util 20250926-SNAPSHOT ........................ SUCCESS [  1.072 s]
[INFO] test-integration 20250926-SNAPSHOT ................. SUCCESS [  0.160 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

可以看到这个除了主 pom 信息，只有我们指定的模块。


# 小结

感觉这种拆分方式，其实还是比较麻烦的。

还是要结合实际的应用场景，选择适合自己项目的方式。


* any list
{:toc}