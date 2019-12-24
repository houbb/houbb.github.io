---
layout: post
title: Docker learn-23-搭建私有仓库
date:  2019-12-18 10:50:21 +0800
categories: [Devpos]
tags: [docker, windows, devops, ci, sh]
published: true
---

# 运行自己的仓库

有时候我们希望使用自己的私有仓库，原因也大都是因为安全考虑。

比如，就是我们认为自己的代码（镜像）很值钱，不允许开源给所有人。

无论什么原因，私有仓库搭建是一种很常见的需求。

## 搭建私服的主要原因

安全

网络

# 实战

## 环境 

windows10

docker 18.09.6

## 运行

直接一行命令即可：

```
$   docker run -d -p 5000:5000 --restart=always -v /opt/registry:/var/lib/registry registry
```

-d 守护态运行;

-p 5000:5000    这里将在 5000 端口运行仓库。

--restart=always 一直重启

-v /opt/registry:/var/lib/registry 挂载

- 查看信息

```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS              PORTS                    NAMES
ba9b05123ac6        registry            "/entrypoint.sh /etc…"   About a minute ago   Up About a minute   0.0.0.0:5000->5000/tcp   confident_aryabhata
```

- 验证仓库已经运行

```
$ curl 192.168.99.100:5000/v2/_catalog
{"repositories":[]}
```

## 测试验证

首先我们尝试将前文中构建的 houbinbin/static-web 发布到我们私有的 registry 中。

### 查看想发布的镜像标识

```
$ docker images houbinbin/static-web
REPOSITORY             TAG                 IMAGE ID            CREATED             SIZE
houbinbin/static-web   latest              7684763833be        3 hours ago         231MB
```

我们的镜像标识为 `7684763833be`

### tag 打标签

首先先打上标签，否则docker会默认将镜像上传到docker hub上。

```
$   docker tag 7684763833be 192.168.99.100:5000/houbinbin/static-web
```

## 推送到私有仓库

```
$   docker push 192.168.99.100:5000/houbinbin/static-web
```

收到响应

```
docker push 192.168.99.100:5000/houbinbin/static-web
The push refers to repository [192.168.99.100:5000/houbinbin/static-web]
Get https://192.168.99.100:5000/v2/: http: server gave HTTP response to HTTPS client
```

这里实际上是一个报错，错误原因如下：

Docker自从1.3.X之后docker registry交互默认使用的是HTTPS，但是搭建私有镜像默认使用的是HTTP服务，所以与私有镜像交时出现以上错误。

## 解决办法

### 显式指定

```
$ docker push http://192.168.99.100:5000/houbinbin/static-web
invalid reference format
```

这个是不行的，会直接报错。

### 修改配置文件

执行命令，修改文件：`sudo vi  /etc/docker/daemon.json`

指定内容如下：

```
{ "insecure-registries":["192.168.1.100:5000"] }
```

### 重启 docker 服务

windows10 中无法使用下面的命令，我们直接在此启动 Docker Toolbar 试试。

```
systemctl daemon-reload
systemctl restart docker
```

or 

```
sudo service docker restart
```

### 查看上传结果

我们需要进入 registry 服务中，查看是否成功上传。

```

```


# 拓展阅读

## docker 的安装

[Mac 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-mac)

[Windows7 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-windows7)

[Windows10 安装 Docker](https://houbb.github.io/2019/12/18/docker-install-on-windows10)

## docker 基本操作

[Docker Container 的基本生命周期管理](https://houbb.github.io/2019/12/18/docker-learn-19-container-manager)

[Nexus-搭建属于自己的 Maven 仓库](https://houbb.github.io/2016/08/06/Nexus)

## 更多学习

关注公众号：老马啸西风

![image](https://user-images.githubusercontent.com/18375710/71187778-b427f380-22ba-11ea-8b72-cab863753533.png)

# 参考资料

[Orientation and setup](https://docs.docker.com/get-started/)

《第一本 Docker 书》

## 镜像

[搭建私有Docker仓库-笔记3](https://blog.51cto.com/13434336/2161562)

[Http: server gave HTTP response to HTTPS client 解决方法](https://blog.csdn.net/liyin6847/article/details/90599612)

* any list
{:toc}
