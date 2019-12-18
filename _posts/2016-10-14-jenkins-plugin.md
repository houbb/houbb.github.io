---
layout: post
title: Jenkins Plugin
date:  2016-10-14 23:51:50 +0800
categories: [Devops]
tags: [Devops, ci, plugin]
published: true
---

* any list
{:toc}

# JUnit Plugin

单元测试检测

> [JUnit Plugin](https://wiki.jenkins-ci.org/display/JENKINS/JUnit+Plugin)

> [JUnit blog](http://m.blog.csdn.net/article/details?id=9949309)

> [JUnit Test Build](http://www.myexception.cn/cvs-svn/1508681.html)

1. Install ```junit plugin```

2. Not skip the test

3. Edit ```pom.xml``` in your project

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>${junit.version}</version>
    <scope>test</scope>
</dependency>
```

# Sonar Plugin

单元质量检测

> [sonar integration](http://blog.csdn.net/xinluke/article/details/53035583)

> [sonar problems](http://wcp88888888.iteye.com/blog/2211605)

> Prepare

1. Install ```SonarQube```

2. Install ```SonarQube Plugin``` in Jenkins


> 配置sonar server

Jenkins–》系统设置–》SonarQube servers

1. Server Version **5.2** or before: usr/pwd Default is ```admin/admin```

2. Server authentication token

- 生成 token

配置->权限->用户->Tokens

Enter a name, and generate one:

```30a4d56f3130d246818ed384ece7d15c56ae8c85``` named **admin**, copy this into **Server authentication token**

![sonar](https://raw.githubusercontent.com/houbb/resource/master/img/jenkins/2016-12-10-jenkins-sonar.png)


> 配置sonar scanner

系统管理–》Global Tool Configuration

![scanner](https://raw.githubusercontent.com/houbb/resource/master/img/jenkins/2016-12-10-jenkins-sonar-scanner.png)


> 配置项目

要让jenkins编译完成，自动将代码传给sonarqube进行分析，则要配置jenkins中的目标项目。
选择自己的project–》配置–》add pre-build step(构建)-》增加构建步骤->Execute SonarQube Scanner


在项目的根目录创建文件 ```sonar-project.properties```, **Path to project properties** 默认路径就是这个。内容如下:

```
sonar.projectKey=blog
sonar.projectName=blog
sonar.projectVersion=1.0
sonar.sources=src/main/java
sonar.language=java
```

或者直接将此内容添加在**Analysis properties**中。


![scanner](https://raw.githubusercontent.com/houbb/resource/master/img/jenkins/2016-12-10-jenkins-sonar-executor.png)


- Edit the ```pom.xml``` in your project:

```xml
<plugin>
 <groupId>org.sonarsource.scanner.maven</groupId>
 <artifactId>sonar-maven-plugin</artifactId>
 <version>3.1.1</version>
</plugin>
```

<label class="label label-danger">Error</label>

一直卡在这个问题

> Unpacking https://repo1.maven.org/maven2/org/sonarsource/scanner/cli/sonar-scanner-cli/2.8/sonar-scanner-cli-2.8.zip to /Users/houbinbin/.jenkins/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarQube_Scanner on Jenkins


也就是要将这个文件下载下来,并解压在目标路径。手动操作,解决。



# cobertura

单元测试覆盖率

> [Cobertura+Plugin](https://wiki.jenkins-ci.org/display/JENKINS/Cobertura+Plugin)

> [cobertura](http://blog.csdn.net/yaominhua/article/details/40684647)

> [代码覆盖率](http://blog.csdn.net/wangmuming/article/details/23455947)

1. Install ```Cobertura plugin``` plugin

2. 构建时添加目标(Goals)如下:

```
clean cobertura:cobertura package
```

3. 构建后操作-》Publish Cobertura Coverage Report

Set **Cobertura xml report pattern** as following:

```
**/target/site/cobertura/coverage.xml
```

4. Edit the ```pom.xml``` in your project

```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>findbugs-maven-plugin</artifactId>
    <version>3.0.1</version>
    <configuration>
        <threshold>High</threshold>
        <effort>Default</effort>
        <findbugsXmlOutput>true</findbugsXmlOutput>
        <findbugsXmlWithMessages>true</findbugsXmlWithMessages>
        <xmlOutput>true</xmlOutput>
        <!--<findbugsXmlOutputDirectory>target/site</findbugsXmlOutputDirectory>-->
    </configuration>
</plugin>
```

# findbugs

找寻代码中的BUG

> [FindBugs+Plugin](https://wiki.jenkins-ci.org/display/JENKINS/FindBugs+Plugin)

> [findbugs_zh_CN](http://blog.csdn.net/fighterandknight/article/details/51424257)

1. Install ```FindBugs plugin``` plugin in jenkins

2. 构建时添加目标(Goals)如下:

```
findbugs:findbugs
```

注意: 使用findbugs务必保证文件已被解析为```.class```, 即已经被 ```maven compile```

3. 构建后操作-》Publish FindBugs analysis results

**FindBugs results** 保持默认即可。


# javadoc

> [Javadoc+Plugin](https://wiki.jenkins-ci.org/display/JENKINS/Javadoc+Plugin)


1. Install ```javadoc plugin``` plugin in jenkins


2. Configure Jenkins job:

In Build section, Goals and options line add:

```
javadoc:javadoc
```

3. publish javadoc

Define the **Javadoc directory**

```
target/site/apidocs/
```


4. Edit the ```pom.xml``` in your project

```
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-javadoc-plugin</artifactId>
    <version>2.10.2</version>
    <configuration>
        <aggregate>true</aggregate>
        <additionalparam>-Xdoclint:none</additionalparam>
    </configuration>
</plugin>
````

- ```<aggregate>true</aggregate>``` 多模块

- ```<additionalparam>-Xdoclint:none</additionalparam>``` JDK8 对文档要求特别严格,使用这个偷懒。


# BlueOcean

Blue Ocean is a new project that rethinks the user experience of Jenkins. Designed from the ground up for Jenkins Pipeline
and compatible with Freestyle jobs, Blue Ocean reduces clutter and increases clarity for every member of your team.

> [blueocean](https://jenkins.io/projects/blueocean/)

1. Install ```BlueOcean beta```

2. Click ```Open Blue Ocean``` to have a travel~~~











