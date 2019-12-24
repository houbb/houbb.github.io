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

## 重新上传

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
