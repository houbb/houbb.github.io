---
layout: post
title:  Spring Rest Docs
date:  2017-12-13 20:50:39 +0800
categories: [Spring]
tags: [spring]
published: true
---


# Spring Rest Docs

[Spring REST Docs](https://projects.spring.io/spring-restdocs/) helps you to document RESTful services. 
It combines hand-written documentation written with [Asciidoctor](http://asciidoctor.org/) 
and auto-generated snippets produced with [Spring MVC Test](https://docs.spring.io/spring/docs/current/spring-framework-reference/#spring-mvc-test-framework).
 
就是用来生成文档的，类似以前学习过的 [swagger](https://houbb.github.io/2016/12/22/swagger)


> [官方文档](https://docs.spring.io/spring-restdocs/docs/2.0.0.RELEASE/reference/html5/#getting-started-sample-applications)

# Quick Start

官方提供了一些例子，个人使用的是 maven，
就尝试了这个 [rest-notes-spring-data-rest](https://github.com/spring-projects/spring-restdocs/tree/v2.0.0.RELEASE/samples/rest-notes-spring-data-rest)。

> [完整代码示例](https://github.com/houbb/spring-data/tree/master/spring-data-restdocs)



## 项目结构

直接复制官方的案例，修改了下包名称。

```
.
├── pom.xml
└── src
    ├── main
    │   ├── asciidoc
    │   │   ├── api-guide.adoc
    │   │   └── getting-started-guide.adoc
    │   ├── java
    │   │   └── com
    │   │       └── ryo
    │   │           └── spring
    │   │               └── data
    │   │                   └── restdocs
    │   │                       └── notes
    │   │                           ├── Note.java
    │   │                           ├── NoteRepository.java
    │   │                           ├── RestNotesSpringDataRest.java
    │   │                           ├── Tag.java
    │   │                           └── TagRepository.java
    │   └── resources
    │       └── application.properties
    └── test
        └── java
            └── com
                └── ryo
                    └── spring
                        └── data
                            └── restdocs
                                ├── ApiDocumentation.java
                                └── GettingStartedDocumentation.java
```

- pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <artifactId>spring-data-restdocs</artifactId>


    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.0.0.M6</version>
        <relativePath />
    </parent>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <java.version>1.8</java.version>
        <spring-restdocs.version>2.0.0.RELEASE</spring-restdocs.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-rest</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.jayway.jsonpath</groupId>
            <artifactId>json-path</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.restdocs</groupId>
            <artifactId>spring-restdocs-mockmvc</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <configuration>
                    <includes>
                        <include>**/*Documentation.java</include>
                    </includes>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.asciidoctor</groupId>
                <artifactId>asciidoctor-maven-plugin</artifactId>
                <version>1.5.3</version>
                <executions>
                    <execution>
                        <id>generate-docs</id>
                        <phase>prepare-package</phase>
                        <goals>
                            <goal>process-asciidoc</goal>
                        </goals>
                        <configuration>
                            <backend>html</backend>
                            <doctype>book</doctype>
                        </configuration>
                    </execution>
                </executions>
                <dependencies>
                    <dependency>
                        <groupId>org.springframework.restdocs</groupId>
                        <artifactId>spring-restdocs-asciidoctor</artifactId>
                        <version>${spring-restdocs.version}</version>
                    </dependency>
                </dependencies>
            </plugin>
            <plugin>
                <artifactId>maven-resources-plugin</artifactId>
                <executions>
                    <execution>
                        <id>copy-resources</id>
                        <phase>prepare-package</phase>
                        <goals>
                            <goal>copy-resources</goal>
                        </goals>
                        <configuration>
                            <outputDirectory>${project.build.outputDirectory}/static/docs</outputDirectory>
                            <resources>
                                <resource>
                                    <directory>${project.build.directory}/generated-docs</directory>
                                </resource>
                            </resources>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

    <repositories>
        <repository>
            <id>spring-snapshots</id>
            <name>Spring snapshots</name>
            <url>https://repo.spring.io/libs-snapshot</url>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </repository>
    </repositories>

    <pluginRepositories>
        <pluginRepository>
            <id>spring-snapshots</id>
            <name>Spring snapshots</name>
            <url>https://repo.spring.io/libs-snapshot</url>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </pluginRepository>
    </pluginRepositories>

</project>
```


## 生成文档

直接运行 

```
mvn package
```

会在 **target/generated-docs** 目录下生成如下文件：

```
api-guide.html                  
getting-started-guide.html
```

## 效果展示

我们使用浏览器打开 `api-guide.html`，如下：

![2017-12-13-spring-restdocs-demo.png](https://raw.githubusercontent.com/houbb/resource/master/img/spring/restdocs/2017-12-13-spring-restdocs-demo.png)


## 运行服务

上面是直接浏览静态页面，当然也可以启动一个服务。

直接运行 mvn 插件下的 **asciidoctor** `asciidoctor http`。

启动成功后，访问 [http://localhost:2000](http://localhost:2000) 即可。









* any list
{:toc}