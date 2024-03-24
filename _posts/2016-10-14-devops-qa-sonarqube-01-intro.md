---
layout: post
title: 代码质量管理 SonarQube-01-入门介绍
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, ci, qa, sh]
published: true
---



# 拓展阅读


[Devops-01-devops 是什么？](https://houbb.github.io/2016/10/14/devops-01-overview)

[Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件](https://houbb.github.io/2016/10/14/devops-02-jpom)

[代码质量管理 SonarQube-01-入门介绍](https://houbb.github.io/2016/10/14/devops-sonarqube-01-intro)

[项目管理平台-01-jira 入门介绍 缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件](https://houbb.github.io/2016/10/14/project-manage-jira-01-intro)

[项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件](https://houbb.github.io/2016/10/14/project-manage-phabricator-01-overview)

[持续集成平台 01 jenkins 入门介绍](https://houbb.github.io/2016/10/14/devops-jenkins-01-intro)

[持续集成平台 02 jenkins plugin 插件](https://houbb.github.io/2016/10/14/devops-jenkins-02-plugin)


[test coverate-05-测试覆盖率 SonarQube 是一个综合性的代码质量管理平台，其中包含了对测试覆盖率的支持](https://houbb.github.io/2016/04/26/test-coverage-05-sonarqube)

[Docker learn-29-docker 安装 sonarQube with mysql](https://houbb.github.io/2019/12/18/docker-learn-29-install-devops-sonar)



# 是什么

[SonarQube](http://www.sonarqube.org/) 是一个开放平台，用于管理代码质量。

> [Sonar 中文资料](http://www.ibm.com/developerworks/cn/java/j-lo-sonar/)

# 在 Windows 安装 SonarQube

## 要求

确保已经安装了 JDK 和 MySQL。

## 下载

- [下载](http://www.sonarqube.org/downloads/) SonarQube

当前版本为 **6.7.1**

## 运行

假定 `${BASE_DIR}` 为 `D:\Learn\sonar\sonarqube-6.7.1`（本地解压路径）

- 运行 `${BASE_DIR}\bin\windows-x86-64` 目录下的 ```StartSonar.bat```

```
wrapper  | --> Wrapper Started as Console
wrapper  | Launching a JVM...
jvm 1    | Wrapper (Version 3.2.3) http://wrapper.tanukisoftware.org
jvm 1    |   Copyright 1999-2006 Tanuki Software, Inc.  All Rights Reserved.
jvm 1    |
jvm 1    | WrapperSimpleApp: Unable to locate the class org.sonar.application.App: java.lang.UnsupportedClassVersionError: org/sonar/application/App : Unsupported major.minor version 52.0
jvm 1    |
jvm 1    | WrapperSimpleApp Usage:
jvm 1    |   java org.tanukisoftware.wrapper.WrapperSimpleApp {app_class} [app_arguments]
jvm 1    |
jvm 1    | Where:
jvm 1    |   app_class:      The fully qualified class name of the application to run.
jvm 1    |   app_arguments:  The arguments that would normally be passed to the
jvm 1    |                   application.
wrapper  | <-- Wrapper Stopped
```

我的 SonarQube 版本是 **6.7.1**，所以我们需要知道我们需要什么：

> [要求](http://docs.sonarqube.org/display/SONAR/Requirements)

- JDK1.8 或更高版本

[下载](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) 并为 Sonar 配置 ```jdk1.8```。


## 配置

### JDK 配置

你可以正确配置 ```jdk1.8``` 环境，或者直接在 `${BASE_DIR}\conf\wrapper.conf` 文件中设置 java 路径：

```
# Path to JVM executable. By default it must be available in PATH.
# Can be an absolute path, for example:
wrapper.java.command=D:\Program Files\Java\jdk1.8.0_102\bin\java.exe
#wrapper.java.command=java
```

### 数据库配置

- MySQL 驱动

将 `mysql-connector-java-5.1.38.jar` 复制到：

```
${BASE_DIR}/extensions/jdbc-driver/mysql
```

- 编辑 ```~/conf/sonar.properties```

在 MySQL 中创建数据库 `sonar`，用于存储信息。

```
# Comment the following lines to deactivate the default embedded database.
#sonar.jdbc.url: jdbc:derby://localhost:1527/sonar;create=true
#sonar.jdbc.driverClassName: org.apache.derby.jdbc.ClientDriver
#sonar.jdbc.validationQuery: values(1)

～～～～～～～～～～～～～～～...～～～～～～～～～～～～～～～～～～

#----- MySQL 5.x/6.x
# Comment the embedded database and uncomment the following
#properties to use MySQL. The validation query is optional.
#sonar.jdbc.validationQuery: select 1
sonar.jdbc.driverClassName: com.mysql.jdbc.Driver
sonar.jdbc.url=jdbc:mysql://localhost:3306/sonar?useUnicode=true&characterEncoding=utf8
sonar.jdbc.username=root
sonar.jdbc.password=123456
```

## 重启服务

重启，执行脚本 ```StartSonar.bat```

```
wrapper  | --> Wrapper Started as Console
wrapper  | Launching a JVM...
jvm 1    | Wrapper (Version 3.2.3) http://wrapper.tanukisoftware.org
jvm 1    |   Copyright 1999-2006 Tanuki Software, Inc.  All Rights Reserved.
jvm 1    |
jvm 1    | 2016.10.14 11:50:58 INFO  app[][o.s.a.AppFileSystem] Cleaning or creating temp directory D:\Tools\sonar\sonarqube-6.1\temp
jvm 1    | 2016.10.14 11:50:58 INFO  app[][o.s.p.m.JavaProcessLauncher] Launch process[es]: D:\Program Files\Java\jdk1.8.0_102\jre\bin\java -Djava.awt.headless=true -Xmx1G -Xms256m -Xss256k -Djna.nosys=true -XX:+UseParNewGC -XX:+UseConcMarkSweepGC -XX:CMSInitiatingOccupancyFraction=75 -XX:+UseCMSInitiatingOccupancyOnly -XX:+HeapDumpOnOutOfMemoryError -Djava.io.tmpdir=D:\Tools\sonar\sonarqube-6.1\temp -javaagent:D:\Program Files\Java\jdk1.8.0_102\jre\lib\management-agent.jar -cp ./lib/common/*;./lib/search/* org.sonar.search.SearchServer D:\Tools\sonar\sonarqube-6.1\temp\sq-process635522788444000175properties
jvm 1    | 2016.10.14 11:51:05 INFO  app[][o.s.p.m.Monitor] Process[es] is up
jvm 1    | 2016.10.14 11:51:05 INFO  app[][o.s.p.m.JavaProcessLauncher] Launch process[web]: D:\Program Files\Java\jdk1.8.0_102\jre\bin\java -Djava.awt.headless=true -Dfile.encoding=UTF-8 -Djruby.management.enabled=false -Djruby.compile.invokedynamic=false -Xmx512m -Xms128m -XX:+HeapDumpOnOutOfMemoryError -Djava.io.tmpdir=D:\Tools\sonar\sonarqube-6.1\temp -javaagent:D:\Program Files\Java\jdk1.8.0_102\jre\lib\management-agent.jar -cp ./lib/common/*;./lib/server/*;D:\Tools\sonar\sonarqube-6.1\lib\jdbc\h2\h2-1.3.176.jar org.sonar.server.app.WebServer D:\Tools\sonar\sonarqube-6.1\temp\sq-process6946582725671729886properties
jvm 1    | 2016.10.14 11:51:32 INFO  app[][o.s.p.m.Monitor] Process[web] is up
jvm 1    | 2016.10.14 11:51:32 INFO  app[][o.s.p.m.JavaProcessLauncher] Launch process[ce]: D:\Program Files\Java\jdk1.8.0_102\jre\bin\java -Djava.awt.headless=true -Dfile.encoding=UTF-8 -Xmx512m -Xms128m -XX:+HeapDumpOnOutOfMemoryError -Djava.io.tmpdir=D:\Tools\sonar\sonarqube-6.1\temp -javaagent:D:\Program Files\Java\jdk1.8.0_102\jre\lib\management-agent.jar -cp ./lib/common/*;./lib/server/*;./lib/ce/*;D:\Tools\sonar\sonarqube-6.1\lib\jdbc\h2\h2-1.3.176.jar org.sonar.ce.app.CeServer D:\Tools\sonar\sonarqube-6.1\temp\sq-process7599430162435853222properties
jvm 1    | 2016.10.14 11:51:38 INFO  app[][o.s.p.m.Monitor] Process[ce] is up
```

## 访问

浏览器直接访问 [localhost:9000](localhost:9000)

默认的账户密码为 ```admin/admin```

## 关闭

在命令行中使用 ```Ctrl+c```。

## 测试

- 生成体验命令

根据提示，生成 admin 对应的 token。

勾选 java=》maven 项目

生成体验命令如下：

```
mvn sonar:sonar -Dsonar.host.url=http://localhost:9000 -Dsonar.login=d1e98b04bdd3efa9fcd139f24fc7162aba80983a
```

- 项目测试

任意找个 java maven 项目，测试体验：

```
D:\CODE\_OTHER\netty>mvn sonar:sonar -Dsonar.host.url=http://localhost:9000 -Dsonar.login=1c6e94d365e83d003ccc519e1d341beb922e2d9f
[INFO] Scanning for projects...
[INFO] ------------------------------------------------------------------------
......
[INFO] ANALYSIS SUCCESSFUL, you can browse http://localhost:9000/dashboard/index/com.ryo:netty
[INFO] Note that you will be able to access the updated dashboard once the server has processed the submitted analysis report
[INFO] More about the report processing at http://localhost:9000/api/ce/task?id=AWEs50bzKz5jZpakiUaE
[INFO] Task total time: 12.419 s
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary:
[INFO]
[INFO] netty .............................................. SUCCESS [ 17.062 s]
[INFO] netty-guide ........................................ SKIPPED
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 17.419 s
[INFO] Finished at: 2018-01-25T18:40:11+08:00
[INFO] Final Memory: 30M/509M
[INFO] ------------------------------------------------------------------------
```

根据提示，访问[http://localhost:9000/dashboard/index/com.ryo:netty](http://localhost:9000/dashboard/index/com.ryo:netty) 即可看到对应的 QA 结果。


# 在Mac上安装

- JDK版本

```
houbinbindeMacBook-Pro:shell houbinbin$ java -version
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
```

## SonarQube

- [下载SonarQube](http://www.sonarqube.org/downloads/)并启动

```
houbinbindeMacBook-Pro:macosx-universal-64 houbinbin$ pwd
/Users/houbinbin/it/tools/sonar/sonarqube-6.1/bin/macosx-universal-64
houbinbindeMacBook-Pro:macosx-universal-64 houbinbin$ ls
SonarQube.pid	lib		sonar.sh	wrapper
houbinbindeMacBook-Pro:macosx-universal-64 houbinbin$ ./sonar.sh
Usage: ./sonar.sh { console | start | stop | restart | status | dump }
houbinbindeMacBook-Pro:macosx-universal-64 houbinbin$ ./sonar.sh start
Starting SonarQube...
Started SonarQube.
```

## 配置MySQL

- 在MySQL中创建用户**sonar**

```
CREATE USER sonar IDENTIFIED BY 'sonar';

GRANT ALL PRIVILEGES ON *.* TO 'sonar'@'localhost' IDENTIFIED BY 'sonar' WITH GRANT OPTION;
```

- 创建数据库**sonar**

```
CREATE DATABASE sonar CHARACTER SET utf8 COLLATE utf8_general_ci;
```

- 将```mysql-connector-java-5.1.38.jar```复制到：

```
/Users/houbinbin/it/tools/sonar/sonarqube-6.1/extensions/jdbc-driver/mysql
```

- 编辑```~/conf/sonar.properties```

```
# Comment the following lines to deactivate the default embedded database.
#sonar.jdbc.url: jdbc:derby://localhost:1527/sonar;create=true
#sonar.jdbc.driverClassName: org.apache.derby.jdbc.ClientDriver
#sonar.jdbc.validationQuery: values(1)

～～～～～～～～～～～～～～～...～～～～～～～～～～～～～～～～～～

#----- MySQL 5.x/6.x
# Comment the embedded database and uncomment the following
#properties to use MySQL. The validation query is optional.
#sonar.jdbc.validationQuery: select 1
sonar.jdbc.driverClassName: com.mysql.jdbc.Driver
sonar.jdbc.url=jdbc:mysql://localhost:3306/sonar?useUnicode=true&characterEncoding=utf8
sonar.jdbc.username=sonar
sonar.jdbc.password=sonar
```

- 重新启动

```
houbinbindeMacBook-Pro:macosx-universal-64 houbinbin$ ./sonar.sh restart
Stopping SonarQube...
Waiting for SonarQube to exit...
Stopped SonarQube.
Starting SonarQube...
Started SonarQube.
```

> 将Sonar设置为中文

1. 管理员登录，搜索```Chinese Pack```，并在[Update Center](http://localhost:9000/updatecenter/available)中安装并重启。

2. 下载```http://repository.codehaus.org/org/codehaus/sonar-plugins/l10n/sonar-l10n-zh-plugin/1.6/sonar-l10n-zh-plugin-1.6.jar```，放入```$SONAR_HOME/extensions/plugins```目录，并重新启动。

## 使用 Maven 配合 Sonar

> [使用 Maven 进行 Sonar 分析](http://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+Maven)

- 添加到 Maven 的 ```settings.xml``` 中

```xml
<settings>
    <pluginGroups>
        <pluginGroup>org.sonarsource.scanner.maven</pluginGroup>
    </pluginGroups>
    <profiles>
        <profile>
            <id>sonar</id>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
            <properties>
                <!-- Sonar 服务器的可选 URL，默认值为 http://localhost:9000 -->
                <sonar.host.url>
                  http://localhost:9000
                </sonar.host.url>
            </properties>
        </profile>
     </profiles>
</settings>
```

- 添加到项目的 ```pom.xml``` 中

```xml
<build>
    <pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.sonarsource.scanner.maven</groupId>
                <artifactId>sonar-maven-plugin</artifactId>
                <version>3.1.1</version>
            </plugin>
        </plugins>
    </pluginManagement>
    <plugins>
        <plugin>
            <groupId>org.sonarsource.scanner.maven</groupId>
            <artifactId>sonar-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

备注：排除对 JavaScript 的校验，指定属性值。

```xml
<!-- Sonar -->
<sonar.exclusions>**/*.js</sonar.exclusions>
```

- 运行

```
mvn clean sonar:sonar
```

结果：

```
houbinbindeMacBook-Pro:git-demo houbinbin$ mvn sonar:sonar
[INFO] Scanning for projects...
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building git-demo 1.0-SNAPSHOT
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- sonar-maven-plugin:3.1.1:sonar (default-cli) @ git-demo ---
[INFO] User cache: /Users/houbinbin/.sonar/cache
[INFO] Load global repositories
[INFO] Load global repositories (done) | time=165ms
[WARNING] Property 'sonar.jdbc.url' is not supported any more. It will be ignored. There is no longer any DB connection to the SQ database.
[WARNING] Property 'sonar.jdbc.username' is not supported any more. It will be ignored. There is no longer any DB connection to the SQ database.
[WARNING] Property 'sonar.jdbc.password' is not supported any more. It will be ignored. There is no longer any DB connection to the SQ database.
[INFO] User cache: /Users/houbinbin/.sonar/cache
[INFO] Load plugins index
[INFO] Load plugins index (done) | time=5ms
[INFO] SonarQube version: 6.1
[INFO] Default locale: "zh_CN", source code encoding: "UTF-8" (analysis is platform dependent)
[INFO] Process project properties
[INFO] Load project repositories
[INFO] Load project repositories (done) | time=135ms
[INFO] Load quality profiles
[INFO] Load quality profiles (done) | time=92ms
[INFO] Load active rules
[INFO] Load active rules (done) | time=345ms
[INFO] Publish mode
[INFO] -------------  Scan git-demo
[INFO] Load server rules
[INFO] Load server rules (done) | time=59ms
[INFO] Base dir: /Users/houbinbin/IT/code/git-demo
[INFO] Working dir: /Users/houbinbin/IT/code/git-demo/target/sonar
[INFO] Source paths: pom.xml
[INFO] Source encoding: UTF-8, default locale: zh_CN
[INFO] Index files
[INFO] 0 files indexed
[INFO] Sensor Lines Sensor
[INFO] Sensor Lines Sensor (done) | time=0ms
[INFO] Sensor SCM Sensor
[INFO] Sensor SCM Sensor (done) | time=1ms
[INFO] Sensor XmlFileSensor
[INFO] Sensor XmlFileSensor (done) | time=0ms
[INFO] Sensor Zero Coverage Sensor
[INFO] Sensor Zero Coverage Sensor (done) | time=0ms
[INFO] Sensor Code Colorizer Sensor
[INFO] Sensor Code Colorizer Sensor (done) | time=0ms
[INFO] Sensor CPD Block Indexer
[INFO] Sensor CPD Block Indexer (done) | time=0ms
[INFO] Calculating CPD for 0 files
[INFO] CPD calculation finished
[INFO] Analysis report generated in 47ms, dir size=12 KB
[INFO] Analysis reports compressed in 6ms, zip size=4 KB
[INFO] Analysis report uploaded in 42ms
[INFO] ANALYSIS SUCCESSFUL, you can browse http://localhost:9000/dashboard/index/com.ryo:git-demo
[INFO] Note that you will be able to access the updated dashboard once the server has processed the submitted analysis report
[INFO] More about the report processing at http://localhost:9000/api/ce/task?id=AVfDe6043OTpXts6eJaH
[INFO] Task total time: 1.687 s
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 3.059 s
[INFO] Finished at: 2016-10-14T21:57:25+08:00
[INFO] Final Memory: 18M/398M
[INFO] ------------------------------------------------------------------------
```

可以看到警告日志

```
[WARNING] Property 'sonar.jdbc.url' is not supported any more. It will be ignored. There is no longer any DB connection to the SQ database.
[WARNING] Property 'sonar.jdbc.username' is not supported any more. It will be ignored. There is no longer any DB connection to the SQ database.
[WARNING] Property 'sonar.jdbc.password' is not supported any more. It will be ignored. There is no longer any DB connection to the SQ database.
```

我们可以知道在这些 ```sonar.properties``` 中不需要设置。

访问 ```http://localhost:9000/dashboard/index/com.ryo:git-demo```, 您可以看到

![sonar analyse](https://raw.githubusercontent.com/houbb/resource/master/img/code-review/2016-10-14-sonar-analyse.png)

# 缩小焦点

- 使用 ```//NOSAONAR``` 来忽略一行

- 使用这个来忽略所有 **js** 文件。

```xml
</properties>
    <!-- Sonar -->
    <sonar.exclusions>**/*.js</sonar.exclusions>
</properties>
```


## 常见异常

- 没有找到编译后的信息，报错如下：

```
[ERROR] Failed to execute goal org.sonarsource.scanner.maven:sonar-maven-plugin:3.1.1:sonar (default-cli) on project i2_crc: Please provide compiled classes of your p
roject with sonar.java.binaries property -> [Help 1]
```

配置修改如下：

```xml
</properties>
    <!--sonar-->
    <sonar.java.binaries>target/classes</sonar.java.binaries>
    <sonar.exclusions>**/*Test.java</sonar.exclusions>
</properties>
```

运行：

```
mvn clean install sonar:sonar
```


# QA 工具

idea 中可以安裝 [SonarLint]() 和 [Alibaba]() 來提升代碼質量。

* any list
{:toc}