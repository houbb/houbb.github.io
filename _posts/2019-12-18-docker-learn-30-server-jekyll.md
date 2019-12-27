---
layout: post
title: Docker learn-30-docker 构建 jekyll 服务
date:  2019-12-18 10:50:21 +0800
categories: [Devpos]
tags: [docker, devops, in-action, sh]
published: true
---

# 要构建的是使用Jekyll框架的自定义网站.会构建两个镜像.

一个镜像安装了Jekyll及其他用于构建Jekyll网站必要的软件包

一个镜像通过Apache来让Jekyll网站工作起来.

在启动容器时,通过创建一个新的Jekyll网站来实现自服务.

## 工作流程:

创建Jekyll基础镜像和Apache镜像

从Jekyll镜像创建一个容器,这个容器存放通过卷挂载的网站源码

从Apache镜像创建一个容器,这个容器利用包含编译后的网站的卷,并为其服务.

在网站需要更新时,清理并重复上面的步骤.

可以把这个例子看做是创建一个多主机站点最简单的方法.

# Jekyll 基础镜像

## 创建 Dockerfile

```
$ mkdir jekyll && cd jekyll 
$ vi Dockerfile
```

## 内容

- Dockerfile 内容如下：

```
FROM houbinbin/ubuntu:14.04
MAINTAINER houbinbin "houbinbin.echo@gmail.com"
ENV REFRESHED_AT 2019-12-27

RUN apt-get -yqq update
RUN apt-get -yqq install ruby ruby-dev make nodejs gcc
RUN gem sources --remove https://rubygems.org/
RUN gem sources -a https://ruby.taobao.org
RUN gem install --no-rdoc --no-ri jekyll

VOLUME /data
VOLUME /var/www/html
WORKDIR /data
ENTRYPOINT [ "jekyll", "build", "--destination=/var/www/html"  ]
```

- 内容说明：

`apt-get -yqq` apt-get install --help 是有时候软件安装会有一个提问，问是否继续，需要输入 yes，如果 yqq 的话，就没有这个提问了，自动 yes 。

该镜像基于 Ubuntu,并安装了 ruby 和支持 jekyll 的包,然后用 VOLUME 命令创建了两个卷

/data/ 用来存放网站的源代码

/var/www/html 用来放编译后的jekyll网站码

工作目录设置为/data ,最后用 ENTRYPOINT 指令自动构建命令,将工作目录/data/中的所有jekyll网站代码构建到 /var/www/html 目录中.

## 构建 jekyll 镜像

- 构建

```
$   docker build -t houbinbin/jekyll .
```


### 构建报错

```
 ---> 6ec1c18f3c9c
Step 6/10 : RUN gem install --no-rdoc --no-ri jekyll
 ---> Running in 86acc5539811
Fetching: public_suffix-4.0.1.gem (100%)
ERROR:  Error installing jekyll:
        public_suffix requires Ruby version >= 2.3.
The command '/bin/sh -c gem install --no-rdoc --no-ri jekyll' returned a non-zero code: 1
```






# 拓展阅读

[Jekyll-构建 github pages 博客](https://houbb.github.io/2016/04/13/jekyll)

## 更多学习

关注公众号：老马啸西风

![image](https://user-images.githubusercontent.com/18375710/71187778-b427f380-22ba-11ea-8b72-cab863753533.png)

# 参考资料

[使用 Docker 构建服务](https://www.jianshu.com/p/afea075f90e9)

## 异常

[解决 安装cocoapods失败，提示 requires Ruby version >=2.2.2](https://blog.csdn.net/u010731949/article/details/51821862)

[安装jekyll时出错：需要Ruby版本> = 2.4.0](https://www.jianshu.com/p/e34b8c66d2c6)

[Ubuntu 14.04 Ruby 2.3.3 安装](https://www.cnblogs.com/fsong/p/6511999.html)

[Ubuntu系统安装Ruby的三种方法](https://www.jb51.net/article/97361.htm)

## ubuntu 

[Ubuntu通过apt-get安装指定版本和查询指定软件有多少个版本](https://www.cnblogs.com/EasonJim/p/7144017.html)

* any list
{:toc}
