---
layout: post
title: Docker learn-23-搭建私有仓库
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
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

## linux 解决办法

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

## windows 解决办法

下面包含一次失败的记录，建议直接跳到 [windows重新上传解决方案](#windows重新上传解决方案)

1、启动 Docker Quickstart

2、进入 default   

我这里默认连接的就是 default

用户名：default
密码：tcuser

3、切换到 root

```
sudo -i
```

4、修改文件 `/var/lib/boot2docker/profile` 文件中的 EXTRA_ARGS 信息，向其中加入对应的访问路径

```
--insecure-registry 192.168.1.100:1180
```

如下：

```
EXTRA_ARGS='
--label provider=virtualbox
--insecure-registry 192.168.1.100:5000
'
CACERT=/var/lib/boot2docker/ca.pem
DOCKER_HOST='-H tcp://0.0.0.0:2376'
DOCKER_STORAGE=aufs
DOCKER_TLS=auto
SERVERKEY=/var/lib/boot2docker/server-key.pem
SERVERCERT=/var/lib/boot2docker/server.pem
```

5、 退出重启docker-machine

直接在 Docker Quickstart 中执行。

```
$   docker-machine restart
```

- 重启失败

```
$ docker-machine restart
Restarting "default"...
(default) Check network to re-create if needed...
(default) Windows might ask for the permission to configure a dhcp server. Sometimes, such confirmation window is minimized in the taskbar.
(default) Waiting for an IP...
Waiting for SSH to be available...
Detecting the provisioner...
Unable to verify the Docker daemon is listening: Maximum number of retries (10) exceeded
```

很不幸的是，重启失败。（此时 docker 处于不可用的状态。）

直接关闭命令行，退出重新进入，依然无效。

一波未平，一波又起。我们来把新的问题先解决。

## daemon 未启动报错信息

这里看下来应该是 deamon 没有运行。

```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```

直接使用 quick start 异常如下：

```
$ docker ps
error during connect: Get https://192.168.99.100:2376/v1.37/containers/json: dial tcp 192.168.99.100:2376: connectex: No connection could be made because the target machine actively refused it.
```

### 解决方案

这个异常以前安装的时候遇到过一次，直接按照原来的方案解决即可。

[docker windows7 初始化异常](https://houbb.github.io/2016/10/15/docker-install-on-windows7#%E5%88%9D%E5%A7%8B%E5%8C%96)


（1）重新生成证书

```
docker-machine --debug regenerate-certs -f default
```

去修复遇到的异常，

```
Unable to verify the Docker daemon is listening: Maximum number of retries (10) exceeded
```

- 解决方案

默认配置出问题，重置默认配置即可。

输入指令

```
docker-machine rm -f default
docker-machine create -d virtualbox default
```

这个时候会重新加载信息，就像第一次安装一样。

全部完成后发现可以正常使用了。

不过有一个不幸运的消息，所有东西都不见了。

# windows重新上传解决方案

### 获取我们自己的镜像

```
$   docker pull houbinbin/static-web
```

### 运行私有仓库

```
$   docker run -d -p 5000:5000 --restart=always -v /opt/registry:/var/lib/registry registry
```

### 查看想发布的镜像标识

```
$ $ docker images houbinbin/static-web
REPOSITORY             TAG                 IMAGE ID            CREATED             SIZE
houbinbin/static-web   latest              7684763833be        7 hours ago         231M
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

还是报原来的错误。

```
cat /var/lib/boot2docker/profile

EXTRA_ARGS='
--label provider=virtualbox

'
CACERT=/var/lib/boot2docker/ca.pem
DOCKER_HOST='-H tcp://0.0.0.0:2376'
DOCKER_STORAGE=aufs
DOCKER_TLS=auto
SERVERKEY=/var/lib/boot2docker/server-key.pem
SERVERCERT=/var/lib/boot2docker/server.pem
```

再来一次，添加 `--insecure-registry 192.168.99.100:5000`

### 备份

```
mv /var/lib/boot2docker/profile /var/lib/boot2docker/profile_bak
vi /var/lib/boot2docker/profile
```

指定内容如下：

```
EXTRA_ARGS='
--label provider=virtualbox
--insecure-registry 192.168.99.100:5000

'
CACERT=/var/lib/boot2docker/ca.pem
DOCKER_HOST='-H tcp://0.0.0.0:2376'
DOCKER_STORAGE=aufs
DOCKER_TLS=auto
SERVERKEY=/var/lib/boot2docker/server-key.pem
SERVERCERT=/var/lib/boot2docker/server.pem
```

### 重启

直接在 Docker Quickstart 中执行。

```
$   docker-machine restart

Restarting "default"...
(default) Check network to re-create if needed...
(default) Windows might ask for the permission to configure a dhcp server. Sometimes, such confirmation window is minimized in the taskbar.
(default) Waiting for an IP...
Waiting for SSH to be available...
Detecting the provisioner...
Restarted machines may have new IP addresses. You may need to re-run the `docker-machine env` command.
```

### 再次尝试

```
$   docker push 192.168.99.100:5000/houbinbin/static-web

815ed6843e55: Pushed 
706024e715b3: Pushed 
5d94df6d1dd1: Pushed 
ab977aef6de0: Pushed 
3da511183950: Pushed 
48dc77435ad5: Pushed 
f2fa9f4cf8fd: Pushed 
latest: digest: sha256:7fc189ab6b930269df2357d2e9a418cc03a3c5c31b4a364bb6b0973d8dbf848b size: 1783
```

成功。

# 自己搭建Docker镜像服务的考虑

既然是私服，同样需要考虑用户、安全认证、搜索等问题，可以说，Docker的开发者在设计镜像服务时就考虑了这些问题，把Web这块留给每个私服的开发者自己去实现，并把后端存储抽象成接口来调用。

docker-registry的源代码放在这里。

为了保证后续的正常开发使用，我决定先阅读一下这个源码，不过碰上了不少问题，具体如下：

docker-registry是用Python实现的，我对python的了解仅仅限于简单的脚本，对Python的包、模块、类都不大懂，所以我学习了Python 。

docker-registry使用了egg打包发布，Gunicorn作为应用服务器（类似Tomcat），Flask作为MVC框架（类似Spring），后面还有SQLAlchemy作为搜索后端。这些技术都需要做简单的了解，在需要的时候深入学习。

后端存储，因为镜像最终是以tar.gz的方式静态存储在服务端，不需要实时读或者写，所以适用于对象存储而不是块存储，于是问题就转化成找一个或写一个私有的存储驱动，官方支持的驱动有亚马逊AWS S3、Ceph-s3、Google gcs、OpenStack swift、Glance等等，国内的七牛也写了自己的驱动。

搜索，这块我还没涉及，后续再看……

Web UI的实现，现在GitHub上已经有好几个项目了，例如docker-registry-web 、docker-registry-frontend，后续再看……

# Docker Index 管理

index顾名思义“索引”，index服务主要提供镜像索引以及用户认证的功能。

当下载一个镜像的时候，如下图所示，首先会去index服务上做认证，然后查找镜像所在的registry的地址并放回给docker客户端，最终docker客户端再从registry下载镜像，当然在下载过程中 registry会去index校验客户端token的合法性。

不同镜像可以保存在不同的registry服务上，其索引信息都放在index服务上。

![image](https://user-images.githubusercontent.com/18375710/71793688-da021600-3078-11ea-8c67-d6be3698f377.png)

## 运行模式

[docker-registry](https://github.com/docker/docker-registry) 的实现，有两种运行模式

（1）standalone=true：在这种模式下，仓库自身提供了简单的index服务，在实现过程中index只是实现了简单的索引功能，没有实现用户认证功能

（2）standalone=false：在这种模式下，需要配置index的服务访问点，需自行实现index服务

## index服务对外提供的接口

index 对外提供的REST API接口如下：

```
PUT /v1/repositories/(namespace)/(repo_name)/
```

在docker push的流程中会调用到，其作用是创建一个repository。

创建之前会对用户密码以及权限进行验证，如果合法，则最终会返回一个token至docker客户端

```
DELETE /v1/repositories/(namespace)/(repo_name)/
```

删除一个repository，删除之前会对用户密码以及权限进行验

```
PUT /v1/repositories/(namespace)/(repo_name)/images
```

在docker push流程中会调用到，其作用是更新repository对应的image列表，更新之前会校验携带的token

```
GET /v1/repositories/(namespace)/(repo_name)/images
```

在docker pull流程中会调用到，其作用是获取repository对应的image列表。获取之前会对用户密码以及权限进行验证

```
PUT /v1/repositories/(namespace)/(repo_name)/auth
```

校验token的合法性

```
GET /v1/users/
```

docker login会调用到此接口，用来验证用户的合法性

```
POST /v1/users/
```

docker login会调用到此接口，可用来创建一个用户

```
PUT /v1/users/username/
```

用来更新用户信息

各个接口的请求的具体Header、Action、Response，可参考 这里

## index服务已有的开源实现

[https://github.com/ekristen/docker-index](https://github.com/ekristen/docker-index)，采用node js实现，其中实现了一套简单的用户管理。

# 企业级的仓库

Harbor

# 拓展阅读

## docker 的安装

[Mac 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-mac)

[Windows7 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-windows7)

[Windows10 安装 Docker](https://houbb.github.io/2019/12/18/docker-install-on-windows10)

## docker 基本操作

[Docker Container 的基本生命周期管理](https://houbb.github.io/2019/12/18/docker-learn-19-container-manager)

[Nexus-搭建属于自己的 Maven 仓库](https://houbb.github.io/2016/08/06/Nexus)

# 参考资料

[Orientation and setup](https://docs.docker.com/get-started/)

《第一本 Docker 书》

## Habor

[Docker Registry & Harbor](https://www.jianshu.com/p/dc0eeede677b)

[Docker私有仓库 Harbor 介绍和部署记录](https://www.cnblogs.com/kevingrace/p/6547616.html)

## Docker Index

[docker index 服务概述](https://www.jianshu.com/p/9e23d7fd4adc)

## 异常1

- 主要参考

[docker http: server gave HTTP response to HTTPS client](http://www.bubuko.com/infodetail-2828420.html)

[搭建私有Docker仓库-笔记3](https://blog.51cto.com/13434336/2161562)

[Http: server gave HTTP response to HTTPS client 解决方法](https://blog.csdn.net/liyin6847/article/details/90599612)

[docker registry push错误“server gave HTTP response to HTTPS client”](https://www.cnblogs.com/hobinly/p/6110624.html)

[docker http: server gave HTTP response to HTTPS client](http://www.bubuko.com/infodetail-2828420.html)

## 异常2

[CannotconnecttotheDockerdaemonatunix:///var/run/docker.soc](http://blog.sina.com.cn/s/blog_1738862940102x6bn.html)

[cannot-connect-to-the-docker-daemon-at-unix-var-run-docker-sock-on-ubuntu-16](https://stackoverflow.com/questions/53404557/cannot-connect-to-the-docker-daemon-at-unix-var-run-docker-sock-on-ubuntu-16)

[Unable to verify the Docker daemon is listening: Maximum number of retries (10) exceeded](https://blog.csdn.net/ZOMB1E123456/article/details/91957977)

* any list
{:toc}
