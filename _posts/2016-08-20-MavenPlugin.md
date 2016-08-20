---
layout: post
title: Maven Plugin
date: 2016-08-20 12:35:04 +0800
categories: [apache]
tags: [maven]
published: true
---
* any list
{:toc}


Maven is - at its heart - a plugin execution framework; all work is done by plugins. Looking for a specific goal to execute?
This page lists the core plugins and others. There are the build and the reporting plugins:

- **Build** plugins will be executed during the build and they should be configured in the ```<build/>``` element from the POM.
- **Reporting** plugins will be executed during the site generation and they should be configured in the ```<reporting/>``` element from the POM.
Because the result of a Reporting plugin is part of the generated site, Reporting plugins should be both internationalized and localized.
You can read more about the localization of our plugins and how you can help.

> [maven plugin](http://maven.apache.org/plugins/index.html)


# Core plugins

Plugins corresponding to default core phases (ie. clean, compile). They may have multiple goals as well.

## [compiler]()

Compiles Java sources.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>${maven-compiler-plugin.version}</version>
    <configuration>
        <source>1.8</source>
        <target>1.8</target>
    </configuration>
</plugin>
```



## [surefire]()

Run the JUnit unit tests in an isolated classloader.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>${maven-surefire-plugin.version}</version>
    <configuration>
        <skipTests>true</skipTests>
        <testFailureIgnore>true</testFailureIgnore>
    </configuration>
</plugin>
```

# Reporting plugins

Plugins which generate reports, are configured as reports in the POM and run under the site generation lifecycle.

## [javadoc]()

Generate Javadoc for the project.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-javadoc-plugin</artifactId>
    <version>2.9.1</version>


    <configuration>
        <!--maven 多模块-->
        <aggregate>true</aggregate>

        <!--路径-->
        <reportOutputDirectory>../doc</reportOutputDirectory>
        <!--目录-->
        <destDir>myapidocs</destDir>

        <!--IOS ERROR: Unable to find javadoc command: The environment variable JAVA_HOME is not correctly set.-->
        <javadocExecutable>${java.home}/../bin/javadoc</javadocExecutable>


        <!--自定义标签-->
        <tags>
            <tag>
                <!--name为你Java代码中的注解的名字-->
                <name>Description</name>
                <!--事实上这个就是说你要把哪些（方法、字段、类）上面的注解放到JavaDoc中-->
                <placement>a</placement>
                <!--head。假设不写这个，用的就是name，假设写了，那么显示效果例如以下：-->
                <head>用途</head>
            </tag>
        </tags>
    </configuration>

</plugin>
```

# Misc

A number of other projects provide their own Maven plugins.

## [tomcat7]()

Run an Apache Tomcat container for rapid webapp development.

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.tomcat.maven</groupId>
            <artifactId>tomcat7-maven-plugin</artifactId>
            <version>${plugin.tomcat.version}</version>
            <configuration>
                <port>8081</port>
                <path>/</path>
                <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
            </configuration>
        </plugin>
    </plugins>
</build>
```






