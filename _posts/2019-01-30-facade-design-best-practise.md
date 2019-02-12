---
layout: post
title: Facade 设计最佳实践
date:  2019-1-30 15:01:09 +0800
categories: [Design]
tags: [design, best-practise, sh]
published: true
excerpt: Facade 设计最佳实践
---

# Facade 

facade 应该怎么设计？

最近暴露给外部使用，由于是历史遗留项目，问题很严重。

facade 引入了很多引用。

## 纯净性

最好的 facade 应该只有 POJO 和 Interface，不包含任何的三方 jar.

### 内部系统

如果公司内部有比较成熟的架构，可以统一使用公共的 jar。

保证不能有任何的 jar 冲突，不能有任何的冗余 jar。

## 版本

- 方式1

一般一个版本是放在一个大的项目下，打包的时候需要把父类 pom 信息排除掉。

然后保证每次记录最新的版本号。

- 方式2

直接将 facade 设计成一个单独的模块，不和当前的项目有依赖。

- 方式3

每次拉取分支的时候，项目都一个唯一的版本号。

开发的时候，使用 XXXX-SNAPSHOT

上线的时候使用 XXXX 的 RELEASE 版本。

封板：当测试完成以后，禁止往分支中提交代码，可能对代码进行封存。

# 文件配置

## setting.xml

在文件中配置仓库的访问权限。

## pom.xml

### 仓库地址

```xml
<distributionManagement>
    <repository>
        <id>nexus</id>
        <name>Releases</name>
        <url>http://代码仓库地址/nexus/content/repositories/releases/</url>
    </repository>
    <snapshotRepository>
        <id>nexus</id>
        <name>Snapshots</name>
        <url>http://代码仓库地址/nexus/content/repositories/snapshots/</url>
    </snapshotRepository>
</distributionManagement>
```

### 指定上传 resource 

别人可以看到你的注释等信息。

```xml
<build>
    <plugins>
        <plugin>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.6.0</version>
            <configuration>
                <source>1.8</source>
                <target>1.8</target>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>
        <!--配置生成源码包-->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-source-plugin</artifactId>
            <version>3.0.1</version>
            <executions>
                <execution>
                    <id>attach-sources</id>
                    <goals>
                        <goal>jar</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

## 发布命令

到指定的模块下

```
$   mvn clean deploy
```

* any list
{:toc}