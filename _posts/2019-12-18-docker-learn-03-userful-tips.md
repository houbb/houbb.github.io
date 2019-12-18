---
layout: post
title:  Docker learn-03-有用的技巧
date:  2019-12-18 10:50:21 +0800
categories: [Devpos]
tags: [devops, docker, learn-note,  sh]
published: true
---

# 常用命令

## 查看列表

```
$ docker ps
```

## 进入容器

```
$ docker exec -it ${CID} /bin/bash  
```

`${CID}` 就是对应的容器唯一标识。

* any list
{:toc}