---
layout: post
title: Docker learn-31-docker api
date:  2019-12-18 11:34:23 +0800
categories: [Devpos]
tags: [docker, devops, in-action, sh]
published: true
---

# 什么是 API

API这个词在维基百科里解释是这样的：应用程序接口（英语：application programming interface，缩写作 API），又称为应用编程接口，就是软件系统不同组成部分衔接的约定。

看完这个解释估计你还是有点懵逼，不过没关系，下面我们会用通俗的语言来介绍什么是API。

我们每个人都有手机，当手机没电了我们肯定会找固定的充电器和充电线来充电。苹果的用苹果，安卓的用安卓。但是你肯定不会用安卓的线去充苹果的手机，这道理很简单，因为你的苹果手机是Lightning 接口，安卓的是micro接口。你要想充电或者对你手机传输数据，那么必须买合适的充电线和数据线, 这是对于接口最简单易懂的认识。

类似的，程序的接口也是如此。每个程序都有固定对外的标准接口，这个接口由开发这个程序的开发者定义的，你要想连接它们，那么就应该遵循它们的接口标准。

## RESTful

参考 [HTTP RESTful](https://houbb.github.io/2018/07/18/http-restful)

# Docker API

Docker提供了很多的API以便用户使用。

这些API包含四个方面：

Docker Registry API

Docker Hub API

Docker OAuth API

Docker Remote API

具体到这篇文章，我们将讨论Docker Registry API以及Docker Hub API。


## Docker Registry API

这个是docker镜像仓库的api，通过操作这套API，你可以自由的自动化、程序化的管理你的镜像仓库。

## Docker Hub API

Docker Hub API是用户管理操作的API，docker hub是使用校验和公共 namespaces 的方式来存储账户信息、认证账户、进行账户授权。API同时也允许操作相关的用户仓库和 library 仓库。

## Docker Remote API

这套API用于控制主机 Docker 服务端的 API，等价于 docker命令行客户端。 

有了它，你能远程操作docker容器，更重要的是你可以通过程序自动化运维docker进程。


# API使用前准备

前面我们说过，操作rest api用的就是http的那些方法。

那么具体怎么使用这些方法呢？

这里我们提供几种通用的方式来操作调用下docker 的API，然后体验下。

在体验之前，我们需要开启docker rest api，不然没开启，你是不能用的。

## 开启方式

具体开启的方法：

- 创建文件

```
$ sudo mkdir -p /usr/lib/systemd/system                                                                                                                    
$ sudo touch /usr/lib/systemd/system/docker.service
```
- 修改内容

```
$ sudo vi /usr/lib/systemd/system/docker.service
```

为

```
ExecStart=/usr/bin/docker daemon $DOCKER_OPTS -H tcp://0.0.0.0:1234
```

## 重启 docker

### linux 

```
systemctl restart docker
```

### windows

[windows 重启方案](https://houbb.github.io/2019/12/18/docker-learn-23-private-registry#windows-%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95)

执行命令 `docker-machine restart` 进行重启。

## 验证

```
curl http://127.0.0.1:1234/info 
```

很失败，发现重启之后我们编辑的文件竟然丢失了。


暂停学习。


# 拓展阅读

[Jekyll-构建 github pages 博客](https://houbb.github.io/2016/04/13/jekyll)

## 更多学习



# 参考资料

《第一本 Docker 书》

[Docker入门教程（七）Docker API](http://dockone.io/article/107)

[docker API 配置与使用](https://www.cnblogs.com/wuvkcyan/p/8694391.html)

* any list
{:toc}