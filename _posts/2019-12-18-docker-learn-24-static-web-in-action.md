---
layout: post
title: Docker learn-24-docker 实战之静态网站
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, in-action, sh]
published: true
---

# 在测试中使用Docker

在之前几章中介绍的都是Docker的基础知识，了解什么是镜像，docker基本的启动流程，以及如何去运作一个容器等等。

接下来的几个章节将介绍如何在实际开发和测试过程中使用docker。

将Docker作为本地Web开发环境是使用Docker的一个最简单的场景。

这个环境可以完全重现生产环境，保证开发环境和部署环境一致。

# 使用Docker测试静态网站

下面从将Nginx安装到容器来架构一个简单的网站开始。

## 文件夹

我们首先类似前面的 static-web 一样，我们来创建一个文件夹 **simple** 文件夹用来保存 Dockfile.

```
$ mkdir simple
$ cd simple/                                                                                                                              
$ pwd                                                                                                                                
/home/docker/simple
```

## 创建 nginx 相关

在sample 目录中创建一个叫nginx的子目录，并用来存放nginx的配置文件

```
$   mkdir nginx && cd nginx
$   wget https://raw.githubusercontent.com/turnbullpress/dockerbook-code/master/code/5/sample/nginx/global.conf
$   wget https://raw.githubusercontent.com/turnbullpress/dockerbook-code/master/code/5/sample/nginx/nginx.conf
```

下面两个是直接下载对应文件，发现一直失败。

不知道是不是被 github 限制了，页面显示正常。

（也有可能是证书过期了，apk 尝试失败，暂时跳过。）

所以直接手动创建两个文件。

- global.conf

```
server {
        listen          0.0.0.0:80;
        server_name     _;

        root            /var/www/html/website;
        index           index.html index.htm;

        access_log      /var/log/nginx/default_access.log;
        error_log       /var/log/nginx/default_error.log;
}
```

- nginx.conf

```
user www-data;
worker_processes 4;
pid /run/nginx.pid;
daemon off;

events {  }

http {
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 2048;
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  access_log /var/log/nginx/access.log;
  error_log /var/log/nginx/error.log;
  gzip on;
  gzip_disable "msie6";
  include /etc/nginx/conf.d/*.conf;
}
```

## 构建 Dockfile

回到 simple 目录

```
$ pwd                                                                                                                                
/home/docker/simple
```

### 创建 Dockfile

内容如下

```
FROM ubuntu:14.04
MAINTAINER houbinbin "houbinbin.echo@gmail.com"
ENV REFRESHED_AT 2017-05-25
RUN apt-get update
RUN apt-get -y -q install nginx
RUN mkdir -p /var/www/html
ADD nginx/global.conf /etc/nginx/conf.d/
ADD nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

这个简单的Dockerfile内容包括以下几项：

- 选择基础镜像；

- 安装nginx；

- 在容器中创建一个/var/www/html的目录；

- 将我们本地创建的nginx配置文件添加到镜像中；

- 公开镜像的80端口。

### 公司内网络限制

若读者不存在网络限制，可以忽略这一节。

第一个 ubuntu 的构建可能存在构建异常的问题，这个是由于公司限制导致的，解决方案如下：

> [构建异常](https://houbb.github.io/2019/12/18/docker-learn-21-image-build#%E6%9E%84%E5%BB%BA%E5%BC%82%E5%B8%B8)

> [推送到中央仓库](https://houbb.github.io/2019/12/18/docker-learn-22-image-push-to-hub)

- 调整 unbuntu 为自己的

调整 ubuntu 数据源

```
FROM houbinbin/ubuntu:14.04
```

完整如下：

```
FROM houbinbin/ubuntu:14.04
MAINTAINER houbinbin "houbinbin.echo@gmail.com"
ENV REFRESHED_AT 2019-12-25
RUN apt-get update
RUN apt-get -y -q install nginx
RUN mkdir -p /var/www/html
ADD nginx/global.conf /etc/nginx/conf.d/
ADD nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

备注：使用自己仓库的镜像，需要首先登陆。

### 构建镜像

```
$   docker build -t="houbinbin/test-nginx" .
```

全部构建成功，查看镜像

```
$ docker images
REPOSITORY                                 TAG                 IMAGE ID            CREATED             SIZE
houbinbin/test-nginx                       latest              d46311ce23b8        17 minutes ago      231MB
```

# 创建一个静态网站

在sample目录中创建一个名为website的目录，并创建一个静态的测试页面放到website目录中。

```
$ pwd
/home/docker/simple
$ mkdir website && cd website
```

## 欢迎页面

创建 `index.html` 页面如下：

```html
<head>
<title>Test website</title>
</head>
<body>
<h1>This is a test website</h1>
</body>
```

## 运行新的容器

通过 docker run 创建一个新的容器：

```
$ docker run -d -p 80 --name website -v $PWD/website:/var/www/html/website houbinbin/test-nginx nginx
```

### 卷讲解

`-v` 选项，将宿主机的目录作为卷，挂载到容器里。

卷在 Docker 里非常重要，也很有用。

卷是在一个或者多个容器内被选定的目录，可以绕过分层的联合文件系统（Union File System），为Docker提供持久数据或者共享数据。这意味着对卷的修改会直接生效，并绕过镜像。当提交或者创建镜像时，卷不被包含在镜像里。卷可以在容器间共享。即便容器停止，卷里的内容依旧存在。在后面的章节会看到如何使用卷来管理数据。

当我们因为某些原因不想把应用或者代码构建到镜像中时，就体现出了卷的价值。

例如：

希望同时对代码做开发和测试；

代码改动很频繁，不想再开发过程中重构镜像；

希望在多个容器间共享代码。

参数 -v 指定了卷的目录（本地宿主机的目录）和容器里的目录，这两个目录通过 `:` 来分隔。

如果目的目录不存在，Docker会自动创建一个。

### 读写属性指定

也可以通过在目的目录的后面加上 `rw`(read/write) 或者 `ro`(read-only) 来指定目的目录的读写状态如：

- 当前路径

```
$ pwd                                                                                                                                
/home/docker/simple
```

运行镜像

```
$ docker run -d -p 80 --name website -v $PWD/website:/var/www/html/website:ro houbinbin/test-nginx nginx
```

这将使目的目录/var/www/html/website变成只读状态。

## 访问页面

- 查看运行状态

```
$ docker ps -l
CONTAINER ID        IMAGE                  COMMAND             CREATED             STATUS              PORTS                   NAMES
03a492730e73        houbinbin/test-nginx   "nginx"             28 seconds ago      Up 27 seconds       0.0.0.0:32769->80/tcp   website
```

这个映射在宿主机的 32769 接口，直接访问

[http://192.168.99.100:32769](http://192.168.99.100:32769)


可以看到我们指定的 index.html 内容。

```
This is a test website
```

# 修改网站内容

如果我们想修改网站的内容，怎么办呢？

## 修改文件

其实很简单，直接修改我们的 index.html

```
$   vi website/index.html
```

修改为：

```html
<head>
<title>Test website</title>
</head>
<body>
<h1>This is a test website with docker</h1>
</body>
```

## 访问页面

不需要重启，我们直接刷新页面：

```
This is a test website with docker
```

内容已经发生了变化。

# 推送到中央仓库

我们将我们的学习结果推送到自己的仓库，便于后期学习

- commit

03a492730e73 就是上面对应的容器标识。

```
docker commit -m "my static web test with nginx" -authotr="houbinbin" 03a492730e73 houbinbin/test-nginx
```

- push

```
docker push houbinbin/test-nginx
```

# 拓展阅读

## docker 的安装

[Mac 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-mac)

[Windows7 安装 Docker](https://houbb.github.io/2016/10/15/docker-install-on-windows7)

[Windows10 安装 Docker](https://houbb.github.io/2019/12/18/docker-install-on-windows10)

## docker 基本操作

[Docker Container 的基本生命周期管理](https://houbb.github.io/2019/12/18/docker-learn-19-container-manager)

## 更多学习



# 参考资料

[Orientation and setup](https://docs.docker.com/get-started/)

《第一本 Docker 书》

# 参考资料

[在测试中使用 docker](https://www.cnblogs.com/limengchun/p/11942732.html)

[docker实战——在测试中使用Docker](https://www.cnblogs.com/Bourbon-tian/p/6902843.html)

## 异常

[wget: error getting response: Connection reset by peer](https://cikeblog.com/alpine-linux-wget-error-getting-response-connection-reset-by-pee.html)

[Connection reset by peer的常见原因](https://blog.csdn.net/candyguy242/article/details/25699727)

* any list
{:toc}
