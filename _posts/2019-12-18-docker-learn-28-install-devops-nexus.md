---
layout: post
title: Docker learn-27-docker 安装 nexus
date:  2019-12-18 11:34:23 +0800
categories: [Devpos]
tags: [docker, devops, in-action, sh]
published: true
---

# Nexus 

关于 nexus，以前学习过一次。

参见 [Nexus 入门](https://houbb.github.io/2016/08/06/Nexus)

# 安装流程

## 下载镜像

- 查看镜像

```
$ docker search nexus
NAME                                         DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
sonatype/nexus3                              Sonatype Nexus Repository Manager 3             720                                     
sonatype/nexus                               Sonatype Nexus                                  426                                     [OK]
```

- 下载镜像

```
$ docker pull sonatype/nexus3
```

## 运行

```
docker run --privileged=true --name devops-nexus --restart=always -p 8081:8081 -v /var/nexus-data:/var/nexus-data -d sonatype/nexus3
```

参数说明：

-d 创建守护容器

--privileged=true 授予root权限（挂载多级目录必须为true，否则容器访问宿主机权限不足）

-v 目录挂载

-p 端口映射

-d 后台运行程序，下载的镜像名字加标签

### 状态查看

```
$ docker ps -l                                                                                                                              
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                    NAMES
e007ff47b03d        sonatype/nexus3     "sh -c ${SONATYPE_DI…"   5 seconds ago       Up 5 seconds        0.0.0.0:8081->8081/tcp   devops-nexus
```

## 登录访问

直接浏览器访问 [http://192.168.99.100:8081](http://192.168.99.100:8081)

![image](https://user-images.githubusercontent.com/18375710/71445062-5fb8c400-2751-11ea-9c32-b35744b89dd9.png)

### 密码

提示 admin 的密码在目录下：

- 进入容器

```
docker exec -it devops-nexus /bin/bash
```

我们进入容器

- 查看密码

然后查看密码

```
$ cat /nexus-data/admin.password
9a4b9d67-2741-4c1c-92da-fc39407fdd92
```

- 登录

我们输入 admin/9a4b9d67-2741-4c1c-92da-fc39407fdd92 登录之后会让我们重新输入密码。

就输入 admin/admin 

至此，一个简单的 nexus 仓库已经搭建完成。

# 拓展阅读

[Devops](https://houbb.github.io/2018/03/16/devops)

[Jenkins](https://houbb.github.io/2016/10/14/jenkins)

[Gitlab](https://houbb.github.io/2017/01/13/gitlab)

[Nexus](https://houbb.github.io/2016/08/06/Nexus)

## 更多学习



# 参考资料

[Docker中安装Nexus及项目配置](http://www.zijin.net/news/tech/565403.html)

* any list
{:toc}