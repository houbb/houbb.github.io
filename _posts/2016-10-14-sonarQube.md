---
layout: post
title: SonarQube
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, qa, ci]
published: true
---

* any list
{:toc}

# SonarQube

注意:

- 新版要求jdk8+

- 新版要求mysql5.6+

[SonarQube](http://www.sonarqube.org/) is an open platform to manage code quality. As such, it covers the 7 axes of code quality:

![sonarQube](https://raw.githubusercontent.com/houbb/resource/master/img/code-review/2016-10-14-sonar-qube-7axes.png)

> [sonar zh_CN](http://www.ibm.com/developerworks/cn/java/j-lo-sonar/)

# Install in Windows

## Requirements

确保 jdk/mysql 安装完成。

## 下载

- [Download](http://www.sonarqube.org/downloads/) the sonar

当前测试版为 **6.7.1**

## 运行 

约定：`${BASE_DIR}` 为： `D:\Learn\sonar\sonarqube-6.7.1` (本地解压路径)

- Run the ```StartSonar.bat``` under **${BASE_DIR}\bin\windows-x86-64**

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

My sonarqube version is **6.7.1**, so we should know what we need:

> [Requirements](http://docs.sonarqube.org/display/SONAR/Requirements)

- JDK1.8 or higher

[Download](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and config ```jdk1.8``` for sonar.


## 配置

### JDK 配置

You can correctly config the ```jdk1.8``` environment, or directly set the java path in `${BASE_DIR}\conf\wrapper.conf`

```
# Path to JVM executable. By default it must be available in PATH.
# Can be an absolute path, for example:
wrapper.java.command=D:\Program Files\Java\jdk1.8.0_102\bin\java.exe
#wrapper.java.command=java
```

### 数据库配置

- mysql-connector

复制 `mysql-connector-java-5.1.38.jar` 到：

```
${BASE_DIR}/extensions/jdbc-driver/mysql
```

- edit ```~/conf/sonar.properties```

在 mysql 中创建数据库 `sonar`，用于存储信息。

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

and restart ```StartSonar.bat```

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

> Visit 

Credentials are ```admin/admin```

```
localhost:9000
```

![index](https://raw.githubusercontent.com/houbb/resource/master/img/code-review/2016-10-14-sonar-index.png)

> Shut down

Use ```Ctrl+c``` in bat command.


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


# Install in Mac

- jdk version

```
houbinbindeMacBook-Pro:shell houbinbin$ java -version
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
```

## Sonarqube

- [Download sonarqube](http://www.sonarqube.org/downloads/) and start

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

## Config mysql

- create user **sonar** in mysql

```
CREATE USER sonar IDENTIFIED BY 'sonar';

GRANT ALL PRIVILEGES ON *.* TO 'sonar'@'localhost' IDENTIFIED BY 'sonar' WITH GRANT OPTION;
```
- create database **sonar**

```
CREATE DATABASE sonar CHARACTER SET utf8 COLLATE utf8_general_ci;
```

- copy ```mysql-connector-java-5.1.38.jar``` into:

```
/Users/houbinbin/it/tools/sonar/sonarqube-6.1/extensions/jdbc-driver/mysql
```

- edit ```~/conf/sonar.properties```

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

- restart

```
houbinbindeMacBook-Pro:macosx-universal-64 houbinbin$ ./sonar.sh restart
Stopping SonarQube...
Waiting for SonarQube to exit...
Stopped SonarQube.
Starting SonarQube...
Started SonarQube.
```

> Set sonar to chinese

1. Admin Login, search ```Chinese Pack``` in [Update Center](http://localhost:9000/updatecenter/available), install and restart

2. download ```http://repository.codehaus.org/org/codehaus/sonar-plugins/l10n/sonar-l10n-zh-plugin/1.6/sonar-l10n-zh-plugin-1.6.jar```,
into ```$SONAR_HOME/extensions/plugins``` and restart.


## Use sonar with maven

> [sonar with maven](http://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+Maven)

- add into ```settings.xml``` of maven

```
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
                <!-- Optional URL to server. Default value is http://localhost:9000 -->
                <sonar.host.url>
                  http://localhost:9000
                </sonar.host.url>
            </properties>
        </profile>
     </profiles>
</settings>
```

- add into ```pom.xml``` of project

```
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


ps:  排除对 js 的校验，指定属性值。

````
<!--sonar-->
<sonar.exclusions>**/*.js</sonar.exclusions>
````

- run

```
mvn clean sonar:sonar
```

result:

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

from the log

```
[WARNING] Property 'sonar.jdbc.url' is not supported any more. It will be ignored. There is no longer any DB connection to the SQ database.
[WARNING] Property 'sonar.jdbc.username' is not supported any more. It will be ignored. There is no longer any DB connection to the SQ database.
[WARNING] Property 'sonar.jdbc.password' is not supported any more. It will be ignored. There is no longer any DB connection to the SQ database.
```

We can know it's no need set in these ```sonar.properties```

Visit ```http://localhost:9000/dashboard/index/com.ryo:git-demo```, you can see

![sonar analyse](https://raw.githubusercontent.com/houbb/resource/master/img/code-review/2016-10-14-sonar-analyse.png)

# Narrowing the Focus

- use ```//NOSAONAR``` to ignore one line

- use this to ignore all **js** files.

```
</properties>
    <!--sonar-->
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

# Use

- Chinese pack

![chinese pack](https://raw.githubusercontent.com/houbb/resource/master/img/tools/sonar/2016-11-13-sonar-chinese-pack.png)


# QA 工具

idea 中可以安裝 [SonarLint]() 和 [Alibaba]() 來提升代碼質量。


