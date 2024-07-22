---
layout: post
title: Devops shell-01-java 部署脚本
date:  2017-01-14 02:17:01 +0800
categories: [Devops]
tags: [gitlab, git, devops, docker, vcs]
published: true
---


# 


# chat

## 启动脚本

下面是一个用于启动 Spring Boot 应用程序的 shell 脚本，它使用指定的 jar 包位置，并在启动前检查是否已经有相同的进程在运行，避免重复启动：

```sh
#!/bin/bash

# Java 程序的 jar 包路径
JAR_PATH="/path/to/your/app.jar"

# Java 启动参数
JAVA_OPTS="-Xms256m -Xmx1024m"

# 日志文件
LOG_FILE="app.log"

# 获取当前正在运行的进程 ID
PID=$(pgrep -f "$JAR_PATH")

if [ -n "$PID" ]; then
  echo "Application is already running with PID $PID"
  exit 1
else
  # 运行 Java 程序
  nohup java $JAVA_OPTS -jar $JAR_PATH > $LOG_FILE 2>&1 &
  
  # 获取 Java 进程 ID
  NEW_PID=$!
  
  echo "Java application started with PID $NEW_PID"
fi
```

这个脚本包括以下部分：

1. `JAR_PATH`：指定 Spring Boot 应用程序的 jar 包路径。
2. `JAVA_OPTS`：指定 Java 启动参数，如初始和最大堆内存大小。
3. `LOG_FILE`：指定日志文件，将标准输出和标准错误重定向到该文件。
4. `pgrep -f "$JAR_PATH"`：检查是否已经有进程在运行指定的 jar 包，获取该进程的 PID。
5. 判断 `$PID` 是否为空：如果不为空，说明进程已经在运行，脚本退出；如果为空，启动新的进程。
6. `nohup` 命令：使程序在后台运行，即使关闭终端也不会终止程序。
7. `$!`：获取最后一个后台进程的进程 ID，并输出。

使用 `chmod +x start.sh` 命令使脚本可执行，然后通过 `./start.sh` 启动 Spring Boot 应用程序。

## 停止脚本

以下是一个停止 Java 应用程序的 shell 脚本，先进行软杀（SIGTERM），并等待 2 分钟。如果应用程序未停止，则使用 `kill -9` 强制终止进程：

```sh
#!/bin/bash

# Java 程序的 jar 包路径
JAR_PATH="/path/to/your/app.jar"

# 获取当前正在运行的进程 ID
PID=$(pgrep -f "$JAR_PATH")

if [ -z "$PID" ]; then
  echo "No application is running with jar path $JAR_PATH"
  exit 1
else
  echo "Stopping application with PID $PID"
  
  # 发送 SIGTERM 信号
  kill $PID
  
  # 等待最多 2 分钟（120 秒）
  for i in {1..120}; do
    sleep 1
    if ! ps -p $PID > /dev/null; then
      echo "Application stopped successfully"
      exit 0
    fi
  done
  
  # 如果进程仍在运行，则使用 kill -9 强制终止
  echo "Application did not stop within 2 minutes, forcefully killing the process"
  kill -9 $PID
  echo "Application killed forcefully"
fi
```

这个脚本包括以下部分：

1. `JAR_PATH`：指定 Spring Boot 应用程序的 jar 包路径。
2. `pgrep -f "$JAR_PATH"`：检查是否有进程在运行指定的 jar 包，获取该进程的 PID。
3. 判断 `$PID` 是否为空：如果为空，说明没有运行的进程，脚本退出；如果不为空，继续执行。
4. `kill $PID`：发送 SIGTERM 信号，尝试软杀进程。
5. 使用 `for` 循环等待最多 2 分钟（120 秒），每秒检查一次进程是否已停止。
6. `ps -p $PID > /dev/null`：检查进程是否仍在运行。
7. 如果进程在 2 分钟内未停止，使用 `kill -9 $PID` 强制终止进程。

使用 `chmod +x stop.sh` 命令使脚本可执行，然后通过 `./stop.sh` 停止 Spring Boot 应用程序。



# 参考资料

> [wiki](http://www.cnblogs.com/moshang-zjn/p/5757430.html)


* any list
{:toc}