---
layout: post
title: Docker learn-25-docker 实战之 java web 应用
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, in-action, sh]
published: true
---

# 安装 java web 应用

java 应用中以前最常见的方式就是使用 tomcat/jetty 等运行我们的 web应用。

我们现在换一种方式，使用 docker 进行部署。

# 构建 web.war

## 编译包

直接构建出最简单的一个 war，可自行选择。

或者使用 [simple-servlet](https://github.com/houbb/simple-servlet) 提供的编译包进行测试验证。

## 上传到 docker 目录

docker 中的目录 `/c/Users/binbin.hou/Desktop` 和我的登录桌面是对应的。

我将放在桌面的 servlet.war 直接拷贝到对应的 `/home/docker/javaweb` 下。

命令：

```
cp  /c/Users/binbin.hou/Desktop/servlet.war /home/docker/javaweb/servlet.war
```

然后当前目录就可以看到 servlet.war 文件了。

## 运行实现方式

实际运行的方式可以有多种：

（1）war 放入容器中运行

（2）使用挂载的方式运行

（3）官方推荐：使用 Dockfile 

# war 放入容器中运行

## 运行 tomcat

```
docker run -d -p 8080:8080 hub.c.163.com/library/tomcat
```

此处使用了 163 国内镜像，为了加快速度。

- 查看运行状态

```
$ docker ps -l
CONTAINER ID        IMAGE                          COMMAND             CREATED             STATUS              PORTS                    NAMES
57acc59df9b6        hub.c.163.com/library/tomcat   "catalina.sh run"   34 seconds ago      Up 33 seconds       0.0.0.0:8080->8080/tcp   goofy_ganguly
```

## 访问

直接访问 [http://192.168.99.100:8080](http://192.168.99.100:8080) 查看页面。

如下图：

![image](https://user-images.githubusercontent.com/18375710/71435725-3aae5c00-2725-11ea-8912-2dd9052da426.png)

## 复制 war 到镜像

把web项目放到container里面的tomcat/webapps

```
docker cp servlet.war 57acc59df9b6:/usr/local/tomcat/webapps
```

57acc59df9b6 是 tomcat 的容器标识。

## 重启

重启 tomcat 容器。

```
docker restart 57acc59df9b6
```

## 再次访问

直接访问 [http://192.168.99.100:8080/servlet](http://192.168.99.100:8080/servlet) 查看页面。

返回页面内容：

这个使我们自己定义的 servlet.war 返回的信息。

```
Hello Servlet!
```

# 以挂载的方式启动

述执行有个弊端就是 容器重启后项目就会不在了，下面是以挂载的方式启动

## 准备工作

因为 8080 端口是唯一的，所以我们先将刚才的容器停止。

```
docker stop 57acc59df9b6
```

## 运行方式

```
docker run -d -v $PWD/servlet.war:/usr/local/tomcat/webapps/servlet.war -p 8080:8080 hub.c.163.com/library/tomcat
```

-d 使用守护式进程运行

-v 指定文件挂在

-p 指定端口映射

## 访问验证

同上，不再赘述

# 推荐实现方式

以上两种方式都是不可复用的，或者说没有真正得到领悟 docker 的精髓。

我们希望我们的一切都是容器，只需要一个启动命令即可。

## 编写 Dockerfile

直接当前目录新建文件 `Dockerfile`

```
$ pwd                                                                                                                               
/home/docker/javaweb

$ vi Dockerfile
```

内容如下：

```
FROM hub.c.163.com/library/tomcat
MAINTAINER houbinbin "houbinbin.echo@gmail.com"
ENV REFRESHED_AT 2019-12-25
COPY $PWD/servlet.war /usr/local/tomcat/webapps
EXPOSE 8080
```

这里我们直接以 tomcat 作为基础镜像，然后将本地的 war 包打入对应的 webapps 目录下。

公开镜像的 8080 端口。

## 构建镜像

```
docker build -t houbinbin/javaweb:v1 .
```

- 查看

```
$ docker images -a                                                                                                                  
REPOSITORY                                 TAG                 IMAGE ID            CREATED              SIZE
houbinbin/javaweb                          v1                  29eed7b1aa7a        About a minute ago   292MB
```

## 运行

- 关闭刚才的挂载运行 

```
docker stop 69e14bbbd5b1
```

- 运行

```
docker run -d -p 8080:8080 houbinbin/javaweb:v1
```

## 验证

直接访问 [http://192.168.99.100:8080/servlet](http://192.168.99.100:8080/servlet) 查看页面。

## 发布到 hub

为了便于后续使用学习，直接将本节内容发布到 Hub 中。

- 容器标识

```
$ docker ps -l

CONTAINER ID        IMAGE                  COMMAND             CREATED              STATUS              PORTS                    NAMES
2a2bac6d752f        houbinbin/javaweb:v1   "catalina.sh run"   About a minute ago   Up About a minute   0.0.0.0:8080->8080/tcp   hopeful_ramanujan
```

- commit

```
docker commit -m "my java web with tomcat" -authotr="houbinbin" 2a2bac6d752f houbinbin/javaweb:v1
```

- push

```
docker push houbinbin/javaweb:v1
```

# 拓展阅读

[docker 实战之静态网站](https://houbb.github.io/2019/12/18/docker-learn-24-static-web-in-action)

[docker 推送到中央仓库](https://houbb.github.io/2019/12/18/docker-learn-22-image-push-to-hub)

## 更多学习



# 参考资料

## 书籍

《第一本 Docker 书》

## 搭建

[docker实战——在测试中使用Docker](https://www.cnblogs.com/Bourbon-tian/p/6902843.html)

[docker 简单安装java web项目](https://www.cnblogs.com/xuwenjin/p/9032540.html)

[docker构建javaweb 环境(jdk1.8+tomcat8)](https://www.jianshu.com/p/59e0a8828b3b)

[Docker部署JavaWeb应用](https://blog.csdn.net/github_37216944/article/details/86410055)

## 文件上传

[docker在windows下上传文件到容器](https://blog.csdn.net/lnkToKing/article/details/85251443)

* any list
{:toc}
