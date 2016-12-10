---
layout: post
title: Jenkins Plugin
date:  2016-10-14 23:51:50 +0800
categories: [Tools]
tags: [jenkins plugin]
published: true
---

* any list
{:toc}

# Jenkins Plugin

> [zh_CN](http://www.yiibai.com/jenkins/jenkins_unit_testing.html)

> [blog](http://m.blog.csdn.net/article/details?id=9949309)



# JUnit Plugin

代码测试检测

> [JUnit Plugin](https://wiki.jenkins-ci.org/display/JENKINS/JUnit+Plugin)


> [Unit Test Build](http://www.myexception.cn/cvs-svn/1508681.html)


# Sonar Plugin

> [sonar integration](http://blog.csdn.net/xinluke/article/details/53035583)

> [sonar problems](http://wcp88888888.iteye.com/blog/2211605)

> Prepare

1. Install ```SonarQube```

2. Install ```	SonarQube Plugin```


> 配置sonar server

Jenkins–》系统设置–》SonarQube servers

1. Server Version **5.2** or before:

Sonar default is ```admin/admin```

2. Server authentication token

- 生成 token

配置->权限->用户->ToKens

Enter a name, and generate one:

```30a4d56f3130d246818ed384ece7d15c56ae8c85``` named **admin**, copy this into **Server authentication token**

![sonar]({{ site.url}}/static/app/img/jenkins/2016-12-10-jenkins-sonar.png)


> 配置sonar scanner

系统管理–》Global Tool Configuration

![scanner]({{ site.url}}/static/app/img/jenkins/2016-12-10-jenkins-sonar-scanner.png)


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


![scanner]({{ site.url}}/static/app/img/jenkins/2016-12-10-jenkins-sonar-executor.png)



# 覆盖率

[代码覆盖率](http://blog.csdn.net/wangmuming/article/details/23455947)
