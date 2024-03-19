---
layout: post
title: Docker learn-22-推送到中央仓库
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, ci, sh]
published: true
---

# 推送镜像到中央仓库

和 maven 类似，我们可以把自己的镜像提交到中央仓库。

镜像构建完毕之后，我们也可以将它上传到 Docker Hub 上面去，这样其他人就能使用这个镜像了。

## 命令

我们可以使用 `docker push` 命令将镜像推送至 Docker Hub。

命令如下:

```
$   docker push houbinbin/static-web
```

日志如下：

```
The push refers to repository [docker.io/houbinbin/static-web]
815ed6843e55: Pushed 
706024e715b3: Pushed 
5d94df6d1dd1: Pushed 
ab977aef6de0: Pushed 
3da511183950: Mounted from library/ubuntu 
48dc77435ad5: Mounted from library/ubuntu 
f2fa9f4cf8fd: Mounted from library/ubuntu 
latest: digest: sha256:7fc189ab6b930269df2357d2e9a418cc03a3c5c31b4a364bb6b0973d8dbf848b size: 1783
```

成功推送，当然你也可以指定镜像的标签。

## 查看我们的镜像

```
$   docker search houbinbin/static-web
```

发现没有找到，不过可以直接在 [https://hub.docker.com/repository/docker/houbinbin/static-web](https://hub.docker.com/repository/docker/houbinbin/static-web) 进行查看。

# 删除镜像

## 场景

和写 jar 包一样，我们有时候需要删除 jar，同理 docker hub 也提供了删除的功能。

## 命令

如果不再需要一个镜像了，也可以将它删除，使用 `docker rmi` 命令来删除一个镜像

### 本地删除

```
$   docker rmi houbinbin/static-web
```

### push 到中央 Hub
 
一种方式是我们到 Hub 页面上手动删除。

TODO: 通过 API+GC 的方式还挺复杂，等待后续实战。

# 拓展阅读

## docker 的安装

[Mac 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-mac)

[Windows7 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-windows7)

[Windows10 安装 Docker](https://houbb.github.io/2019/12/18/docker-install-on-windows10)

## docker 基本操作

[Container 的基本生命周期管理](https://houbb.github.io/2019/12/18/docker-learn-19-container-manager)

[Maven 代码发布到 maven 中央仓库]()

## 更多学习



# 参考资料

[Orientation and setup](https://docs.docker.com/get-started/)

《第一本 Docker 书》

## 镜像

[Docker之使用 Docker 镜像和仓库](https://www.cnblogs.com/cxuanBlog/p/11370739.html)

[Docker镜像仓库清理的探索之路](https://blog.csdn.net/weixin_34314962/article/details/88598903)

* any list
{:toc}
