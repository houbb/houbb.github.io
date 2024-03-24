---
layout: post
title: 持续集成平台 02 jenkins plugin 插件
date:  2016-10-14 23:51:50 +0800
categories: [Devops]
tags: [devops, ci, plugin]
published: true
---


# 拓展阅读

[Devops-01-devops 是什么？](https://houbb.github.io/2016/10/14/devops-01-overview)

[Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件](https://houbb.github.io/2016/10/14/devops-02-jpom)

[代码质量管理 SonarQube-01-入门介绍](https://houbb.github.io/2016/10/14/devops-sonarqube-01-intro)

[项目管理平台-01-jira 入门介绍 缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件](https://houbb.github.io/2016/10/14/project-manage-jira-01-intro)

[项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件](https://houbb.github.io/2016/10/14/project-manage-phabricator-01-overview)

[持续集成平台 01 jenkins 入门介绍](https://houbb.github.io/2016/10/14/devops-jenkins-01-intro)


# JUnit 插件

单元测试检测

> [JUnit 插件](https://wiki.jenkins-ci.org/display/JENKINS/JUnit+Plugin)

> [JUnit 博客](http://m.blog.csdn.net/article/details?id=9949309)

> [JUnit 测试构建](http://www.myexception.cn/cvs-svn/1508681.html)

1. 安装 ```junit 插件```

2. 不跳过测试

3. 编辑你项目中的 ```pom.xml```

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>${junit.version}</version>
    <scope>test</scope>
</dependency>
```

# Sonar 插件

单元质量检测

> [Sonar 集成](http://blog.csdn.net/xinluke/article/details/53035583)

> [Sonar 问题](http://wcp88888888.iteye.com/blog/2211605)

> 准备

1. 安装 ```SonarQube```

2. 在 Jenkins 中安装 ```SonarQube 插件```


> 配置 Sonar 服务器

Jenkins–》系统设置–》SonarQube servers

1. 服务器版本 **5.2** 或之前: 用户名/密码 默认为 ```admin/admin```

2. 服务器认证令牌

- 生成令牌

配置->权限->用户->Tokens

输入一个名称，并生成一个：

```30a4d56f3130d246818ed384ece7d15c56ae8c85``` 命名为 **admin**，将其复制到 **Server authentication token**

![sonar](https://raw.githubusercontent.com/houbb/resource/master/img/jenkins/2016-12-10-jenkins-sonar.png)


> 配置 Sonar 扫描仪

系统管理–》全局工具配置

![scanner](https://raw.githubusercontent.com/houbb/resource/master/img/jenkins/2016-12-10-jenkins-sonar-scanner.png)


> 配置项目

要让 Jenkins 编译完成后，自动将代码传给 SonarQube 进行分析，则需要配置 Jenkins 中的目标项目。
选择你的项目–》配置–》添加构建前步骤-》执行 SonarQube 扫描仪


在项目的根目录创建文件 ```sonar-project.properties```, **项目属性路径** 默认路径即为这个。内容如下:

```
sonar.projectKey=blog
sonar.projectName=blog
sonar.projectVersion=1.0
sonar.sources=src/main/java
sonar.language=java
```

或者直接将此内容添加在**分析属性**中。


![scanner](https://raw.githubusercontent.com/houbb/resource/master/img/jenkins/2016-12-10-jenkins-sonar-executor.png)


- 编辑你项目中的 ```pom.xml```:

```xml
<plugin>
 <groupId>org.sonarsource.scanner.maven</groupId>
 <artifactId>sonar-maven-plugin</artifactId>
 <version>3.1.1</version>
</plugin>
```

<label class="label label-danger">错误</label>

一直卡在这个问题

> Unpacking https://repo1.maven.org/maven2/org/sonarsource/scanner/cli/sonar-scanner-cli/2.8/sonar-scanner-cli-2.8.zip 到 /Users/houbinbin/.jenkins/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarQube_Scanner on Jenkins


也就是要将这个文件下载下来，并解压缩到目标路径。手动操作，解决。



# Cobertura

单元测试覆盖率

> [Cobertura+Plugin](https://wiki.jenkins-ci.org/display/JENKINS/Cobertura+Plugin)

> [Cobertura](http://blog.csdn.net/yaominhua/article/details/40684647)

> [代码覆盖率](http://blog.csdn.net/wangmuming/article/details/23455947)

1. 安装 ```Cobertura 插件```

2. 构建时添加目标(Goals)如下:

```
clean cobertura:cobertura package
```

3. 构建后操作-》发布 Cobertura 覆盖率报告

设置 **Cobertura xml 报告模式** 如下:

```
**/target/site/cobertura/coverage.xml
```

4. 编辑你项目中的 ```pom.xml```

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

# FindBugs

找寻代码中的 BUG

> [FindBugs+Plugin](https://wiki.jenkins-ci.org/display/JENKINS/FindBugs+Plugin)

> [FindBugs 中文版](http://blog.csdn.net/fighterandknight/article/details/51424257)

1. 在 Jenkins 中安装 ```FindBugs 插件```

2. 构建时添加目标(Goals)如下:

```
findbugs:findbugs
```

注意: 使用 FindBugs 务必保证文件已被解析为 ```.class```, 即已经被 ```maven compile```

3. 构建后操作-》发布 FindBugs 分析结果

**FindBugs 结果** 保持默认即可。


# Javadoc

> [Javadoc+Plugin](https://wiki.jenkins-ci.org/display/JENKINS/Javadoc+Plugin)


1. 在 Jenkins 中安装 ```Javadoc 插件```

2. 配置 Jenkins 任务:

在构建部分，目标和选项行添加:

```
javadoc:javadoc
```

3. 发布 Javadoc

定义 **Javadoc 目录**

```
target/site/apidocs/
```


4. 编辑你项目中的 ```pom.xml```

```xml
<plugin>d
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-javadoc-plugin</artifactId>
    <version>2.10.2</version>
    <configuration>
        <aggregate>true</aggregate>
       

 <additionalparam>-Xdoclint:none</additionalparam>
    </configuration>
</plugin>
```

- ```<aggregate>true</aggregate>``` 多模块

- ```<additionalparam>-Xdoclint:none</additionalparam>``` JDK8 对文档要求特别严格，使用这个偷懒。


# BlueOcean

Blue Ocean 是重新构思 Jenkins 用户体验的新项目。从头开始设计用于 Jenkins Pipeline
并与 Freestyle 作业兼容，Blue Ocean 减少了混乱，增加了团队每个成员的清晰度。

> [BlueOcean](https://jenkins.io/projects/blueocean/)

1. 安装 ```BlueOcean beta```

2. 点击 ```Open Blue Ocean``` 来开始旅程~~~.

* any list
{:toc}
