---
layout: post
title:  Ubuntu Sonar
date:  2018-08-14 13:46:27 +0800
categories: [Ubuntu]
tags: [ubuntu, qa]
published: true
---

* any list
{:toc}

- Download

```
wget https://sonarsource.bintray.com/Distribution/sonarqube/sonarqube-6.2.zip
```

- unzip

```
unzip sonarqube-6.2.zip
```

- config mysql

create user sonar in mysql

```
CREATE USER sonar IDENTIFIED BY 'sonar';

GRANT ALL PRIVILEGES ON *.* TO 'sonar'@'localhost' IDENTIFIED BY 'sonar' WITH GRANT OPTION;
```

create database sonar

```
CREATE DATABASE sonar CHARACTER SET utf8 COLLATE utf8_general_ci;
```

copy ```mysql-connector-java-5.1.38.jar``` into

```
/home/hbb/tool/sonar/sonarqube-6.2/extensions/jdbc-driver/mysql/
```

- edit ```~/conf/sonar.properties```

add content like this:

```
# set for sonar
sonar.jdbc.driverClassName: com.mysql.jdbc.Driver
sonar.jdbc.url=jdbc:mysql://localhost:3306/sonar?useUnicode=true&characterEncoding=utf8
sonar.jdbc.username=sonar
sonar.jdbc.password=sonar
```

- restart sonar

```
$ pwd
/home/hbb/tool/sonar/sonarqube-6.2/bin/linux-x86-64
$ ./sonar.sh restart
Stopping SonarQube...
SonarQube was not running.
Starting SonarQube...
Started SonarQube.
```


- 启动失败

```
Starting SonarQube...
Failed to start SonarQube.
```

 sonar.log

```
--> Wrapper Started as Daemon
Launching a JVM...
Unable to start JVM: No such file or directory (2)
JVM exited while loading the application.
JVM Restarts disabled.  Shutting down.
<-- Wrapper Stopped
```

edit the ```/home/hbb/tool/sonar/sonarqube-6.2/conf/wrapper.conf```

```
$ which java
/home/hbb/tool/jdk/jdk1.8.0_112/bin/java
```


then set the content like this

```
# Path to JVM executable. By default it must be available in PATH.
# Can be an absolute path, for example:
#wrapper.java.command=/path/to/my/jdk/bin/java
wrapper.java.command=/home/hbb/tool/jdk/jdk1.8.0_112/bin/java
```


then restart

```
$ sudo ./sonar.sh restart
Stopping SonarQube...
SonarQube was not running.
Starting SonarQube...
Started SonarQube.
```