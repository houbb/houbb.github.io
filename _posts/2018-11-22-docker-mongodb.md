---
layout: post
title: Docker Mongodb
date: 2018-11-22 8:01:55 +0800
categories: [Docker]
tags: [docker, sql, sh]
published: true
excerpt: Docker Mongodb
---

# Docker 与 mongodb

## 拉取

```
docker pull mongo
```

## 查看

```
docker image list
```

内容如下:

```
REPOSITORY              TAG                 IMAGE ID            CREATED             SIZE
mongo                   latest              caee8ef07a3d        12 days ago         5.12GB
```

## 运行

```
docker run -p 27017:27017 -v $PWD/db:/c/Users/systemDir/data/db -d mongo
```

`-p 27017:27017` :将容器的27017 端口映射到主机的27017 端口

`-v $PWD/db:/c/Users/binbin.hou/data/db` :将主机中当前目录下的db挂载到容器的C:/Users/binbin.hou/data/mongodb，作为mongo数据存储目录

一直报错。。。

## 连接

```
docker run -it mongo:3.2 mongo --host 172.17.0.1
```



# 参考资料

http://www.runoob.com/docker/docker-install-mongodb.html

* any list
{:toc}