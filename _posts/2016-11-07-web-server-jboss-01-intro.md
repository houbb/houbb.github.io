---
layout: post
title: web server jboss 入门介绍 
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
excerpt: JBoss
---


# 红帽 JBoss 中间件

[JBoss](https://developers.redhat.com/middleware/?referrer=jbd) 是一系列轻量级，云友好的企业级产品，可帮助企业以更智能的方式更快地进行创新。

# jboss 重新部署

## 位置

```
$pwd
/app/${PROJECT}/jboss/standalone/deployments
```

## 查看部署信息

```
$   ll
```

如果发现 `*.war` 不是最新。

就可以手动 kill

## 查看 jboss 的进程

```
ps -ef | grep jboss
```

找到对应的 pid 直接 kill 掉。

## 重启

然后到 bin 下面直接重启。

# docker jboss

## 基础命令

1、查看所有docker的容器命令为 (`docker ps -a`)

2、进入具体的docker容器命令为 (`docker exec -it [docker容器id]  /bin/bash`)

## 实时查看日志

有时候为了提升系统性能，logback 使用异步输出。

但是日志在容器中仍然是实时的。

```
cd /app/log
```

- 实时查看

```
tail -100f jboss.log
```

# Linux 重启 

## 查看 jboss 进程

```
# ps ax | grep jboss    
 2327 ?        Sl     1:25 /app/jdk1.8.0_121/bin/java -D[Standalone] XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

`2327` 就是 jboss 启动的 web 服务。

## 杀死进程

```
kill -9 2327
```

## 重启服务

```
./startjboss.sh  
```

* any list
{:toc}