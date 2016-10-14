---
layout: post
title: SonarQube
date:  2016-10-14 10:15:54 +0800
categories: [Code Review]
tags: [sonarQube]
published: true
---

* any list
{:toc}

# SonarQube

SonarQube is an open platform to manage code quality. As such, it covers the 7 axes of code quality:

![sonarQube]({{site.url}}/static/app/img/code-review/2016-10-14-sonar-qube-7axes.png)

> [sonar](http://www.sonarqube.org/)

> [sonar zh_CN](http://www.ibm.com/developerworks/cn/java/j-lo-sonar/)

# Install

This demo is install in windows.

- [Download](http://www.sonarqube.org/downloads/) the sonar

- Run the ```StartSonar.bat``` under **sonarqube-6.1\bin\windows-x86-64**

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

My sonarqube version is **6.1**, so we should know what we need:

> [Requirements](http://docs.sonarqube.org/display/SONAR/Requirements)

- JDK1.8 or higher

[Download](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) 
and config ```jdk1.8``` for sonar.

You can correctly config the ```jdk1.8``` environment, or directly set the java path in ```sonarqube-6.1\conf\wrapper.conf```  

```
# Path to JVM executable. By default it must be available in PATH.
# Can be an absolute path, for example:
wrapper.java.command=D:\Program Files\Java\jdk1.8.0_102\bin\java.exe
#wrapper.java.command=java
```

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

```
localhost:9000
```

![index]({{site.url}}/static/app/img/2016-10-14-sonar-index.png)








