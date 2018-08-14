---
layout: post
title:  Maven Plugin Dev
date:  2017-9-29 18:13:20 +0800
categories: [Maven]
tags: [maven, plugin]
published: true
---


# Maven Plugin 

[Mvn Plugin](http://maven.apache.org/plugin-developers/index.html) 对于使用 maven 的人来说并不陌生，我们如何编写自己的插件呢？

- Mojo

A mojo is a Maven plain Old Java Object. Each mojo is an executable goal in Maven, and a plugin is a distribution of one or more related mojos.


# Quick Start

下面是一个简单的例子。

## Create

本文使用 [IDE](https://www.jetbrains.com/idea/)，可以直接通过项目原型创建。

【New Project】=>【Maven】=>【maven-archetype-mojo】

勾选 `Create from archetype` 则会自动创建一个基础的 Mojo 项目。

其实项目添加的文件也很简单，本文简化一下创建如下：

- project struct

```
│  pom.xml
│
└─src
    └─main
        └─java
            └─com
                └─ryo
                        MyMojo.java
```

- pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.ryo</groupId>
    <artifactId>mvn-plugin</artifactId>
    <!--指定为mvn-plugin-->
    <packaging>maven-plugin</packaging>  
    <version>1.0-SNAPSHOT</version>
    <name>mvn-plugin Maven Mojo</name>
    <url>http://maven.apache.org</url>

    <dependencies>
        <!--依赖的 jar-->
        <dependency>
            <groupId>org.apache.maven</groupId>
            <artifactId>maven-plugin-api</artifactId>
            <version>2.0</version>
        </dependency>
    </dependencies>
    
</project>
```

- MyMojo.java

**touch** 就是我们插件的名称。

```java
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;

/**
 * Goal which touches a timestamp file.
 *
 * @goal touch
 * @phase process-sources
 */
public class MyMojo extends AbstractMojo {

    public void execute()
            throws MojoExecutionException {
        System.out.println("------------------------------------ Hello Mvn Plugin!");
    }

}
```

这就创建完成了。

## Install

运行命令，将插件安装到本地。

```
$   mvn clean install
```

安装完成之后，我们就可以在其他项目，或者是当前项目使用了。

在 `pom.xml` 添加内容如下：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>com.ryo</groupId>
            <artifactId>mvn-plugin</artifactId>
            <version>1.0-SNAPSHOT</version>
        </plugin>
    </plugins>
</build>
```

## Run

- 直接点击运行

![mvn-run-plugin](https://raw.githubusercontent.com/houbb/resource/master/img/maven/2017-09-29-mvn-run-plugin.png)

- 通过命令

实际上面的操作是运行了如下命令：

```
$   mvn com.ryo:mvn-plugin:1.0-SNAPSHOT:touch
```

运行结果：

```
[INFO] Scanning for projects...
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building mvn-plugin Maven Mojo 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- mvn-plugin:1.0-SNAPSHOT:touch (default-cli) @ mvn-plugin ---
------------------------------------ Hello Mvn Plugin!
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 0.186 s
[INFO] Finished at: 2017-09-29T18:30:50+08:00
[INFO] Final Memory: 8M/184M
[INFO] ------------------------------------------------------------------------
```

## LifeCycle

如果我们想让插件在 mvn 某个生命周期运行，应该怎么办呢？

如下，则指定 mvn 编译时运行当前插件。

```xml
<build>
    <plugins>
        <plugin>
            <groupId>com.ryo</groupId>
            <artifactId>mvn-plugin</artifactId>
            <version>1.0-SNAPSHOT</version>
            <executions>
                <execution>
                    <phase>compile</phase>
                    <goals>
                        <goal>touch</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

- Test

运行命令：

```
$   mvn clean compile
```

结果：

```
[INFO] Scanning for projects...
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building mvn-plugin Maven Mojo 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- maven-clean-plugin:2.5:clean (default-clean) @ mvn-plugin ---
[INFO] Deleting D:\CODE\mvn-plugin\target
[INFO]
[INFO] --- maven-resources-plugin:2.6:resources (default-resources) @ mvn-plugin ---
[WARNING] Using platform encoding (GBK actually) to copy filtered resources, i.e. build is platform dependent!
[INFO] skip non existing resourceDirectory D:\CODE\mvn-plugin\src\main\resources
[INFO]
[INFO] --- maven-compiler-plugin:3.1:compile (default-compile) @ mvn-plugin ---
[INFO] Changes detected - recompiling the module!
[WARNING] File encoding has not been set, using platform encoding GBK, i.e. build is platform dependent!
[INFO] Compiling 1 source file to D:\CODE\mvn-plugin\target\classes
[INFO]
[INFO] --- mvn-plugin:1.0-SNAPSHOT:touch (default) @ mvn-plugin ---
------------------------------------ Hello Mvn Plugin!
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 1.445 s
[INFO] Finished at: 2017-09-29T18:33:50+08:00
[INFO] Final Memory: 13M/185M
[INFO] ------------------------------------------------------------------------
```


# Annotation

上面是基于 doc 来完成的。个人更倾向于注解的方式。

二者不要同时使用，个人测试会报错。


- 引入 jar

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.maven</groupId>
      <artifactId>maven-plugin-api</artifactId>
      <version>3.0</version>
    </dependency>
 
    <!-- dependencies to annotations -->
    <dependency>
      <groupId>org.apache.maven.plugin-tools</groupId>
      <artifactId>maven-plugin-annotations</artifactId>
      <version>3.4</version>
      <scope>provided</scope>
    </dependency>
  </dependencies>
```

- 定义 MOJO

```java
@Mojo(name = "doc")
public class DocMojo extends AbstractMojo {

    public void execute() throws MojoExecutionException, MojoFailureException {
        System.out.println("------------------------------------ Hello Mvn Plugin!");
    }
}
```

## 对于参数的传入

- xml 配置如下：

```xml
<plugin>
    <groupId>com.github.houbb</groupId>
    <artifactId>maven-doc-plugin</artifactId>
    <version>1.0-SNAPSHOT</version>
    <configuration>
        <username>root</username>
    </configuration>
</plugin>
```

- Mojo

```java
@Mojo(name = "doc")
public class DocMojo extends AbstractMojo {
    /**
     * 用户名称
     */
    @Parameter
    private String username;

    public void execute() throws MojoExecutionException, MojoFailureException {
        System.out.println("------------------------------------ Hello Mvn Plugin!");
        System.out.println("username: "+username);
    }

}
```

* any list
{:toc}












 

