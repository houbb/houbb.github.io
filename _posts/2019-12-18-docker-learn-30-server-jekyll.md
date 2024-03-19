---
layout: post
title: Docker learn-30-docker 构建 jekyll 服务
date:  2019-12-18 11:34:23 +0800
categories: [Devpos]
tags: [docker, devops, in-action, sh]
published: true
---

# 构建 jekyll 镜像

要构建的是使用Jekyll框架的自定义网站.会构建两个镜像.

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


## 构建报错

```
 ---> 6ec1c18f3c9c
Step 6/10 : RUN gem install --no-rdoc --no-ri jekyll
 ---> Running in 86acc5539811
Fetching: public_suffix-4.0.1.gem (100%)
ERROR:  Error installing jekyll:
        public_suffix requires Ruby version >= 2.3.
The command '/bin/sh -c gem install --no-rdoc --no-ri jekyll' returned a non-zero code: 1
```

### 手动 ruby 2.3 的 ubuntu

- 运行属于自己的 ubuntu 14.04

```
docker run -it houbinbin/ubuntu:14.04
```

- 通过apt-get安装ruby依赖

```
sudo apt-get update
sudo apt-get install git-core curl zlib1g-dev build-essential libssl-dev libreadline-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev libcurl4-openssl-dev python-software-properties libffi-dev
```

可以指定 `-yqq` 跳过 Yes 询问。

- 安装 wget

```
apt-get install wget
```

- 手动编译 

下载源码：

```
wget https://cache.ruby-lang.org/pub/ruby/2.5/ruby-2.5.1.tar.gz
tar -xzvf ruby-2.5.1.tar.gz
cd /ruby-2.5.1
```

编译

```
./configure
make && make install
```

- 查看版本

```
ruby -v
make && make install
```

### 提交到中央仓库

登录：

```
docker login
```

- commit

4d5c5997eb2a 就是上面 ubuntu 安装 ruby 后对应的容器标识。

```
docker commit -m "ubuntu 14:04 with ruby 2.5" -authotr="houbinbin" 4d5c5997eb2a houbinbin/ubuntu:ruby2.5
```

- push

```
docker push houbinbin/ubuntu:ruby2.5
```

## 直接在 houbinbin/ubuntu:ruby2.5 的基础上编写镜像文件

- 登录进入 docker 终端

```
ssh docker@192.168.99.100
```

- 编写 Dockerfile

```
mkdir jekyll && cd jekyll
$ pwd
/home/docker/jekyll

vi Dockerfile
```

内容：

```
FROM houbinbin/ubuntu:ruby2.5
MAINTAINER houbinbin "houbinbin.echo@gmail.com"
ENV REFRESHED_AT 2019-12-27

RUN gem install --no-rdoc --no-ri jekyll

VOLUME /data
VOLUME /var/www/html
WORKDIR /data
ENTRYPOINT [ "jekyll", "build", "--destination=/var/www/html"  ]
```

- 构建 jekyll 镜像

```
docker build -t houbinbin/jekyll .
```

- 查看镜像

```
$ docker images houbinbin/jekyll
REPOSITORY          TAG                 IMAGE ID            CREATED              SIZE
houbinbin/jekyll    latest              352e3c4b7ef9        About a minute ago   1.15GB
```

## 启动 jekyll

### 下载 jekyll 模板

```
$   cd $HOME
$   pwd
/home/docker

$   git clone https://github.com/hiekay/james_blog.git
```

### 启动

```
$   sudo docker run -v /home/docker/james_blog:/data/ --name jekyll houbinbin/jekyll

Configuration file: /data/_config.yml
            Source: /data
       Destination: /var/www/html
 Incremental build: disabled. Enable with --incremental
      Generating...
                    done in 0.198 seconds.
 Auto-regeneration: disabled. Use --watch to enable.
```

创建了一个 jekyll 的新容器,把本地 james_blog 目录作为/data/卷挂载到容器里。

容器拿到网站的源代码,并将其构建到已编译的网站,存放到/var/www/html目录.

### 推送到仓库

- 查看容器标识

```
$ docker ps -l
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                      PORTS               NAMES
4b388bb6fc0c        houbinbin/jekyll    "jekyll build --dest…"   36 seconds ago      Exited (0) 34 seconds ago                       jekyll
```

4b388bb6fc0c 就是容器 jekyll 对应的标识。

- 推送

```
$   docker commit -m "ubuntu 14:04 with ruby 2.5 build jekyll" -authotr="houbinbin" 4b388bb6fc0c houbinbin/jekyll
```

push

```
$   docker push houbinbin/jekyll
```


# 构建 Apache 

## 编写 Dockerfile

```
mkdir apche  &&  cd apache 
vi Dockerfile 
```

- 内容：

```
FROM houbinbin/ubuntu:14.04
MAINTAINER houbinbin "houbinbin.echo@gmail.com"
ENV REFRESHED_AT 2019-12-27

RUN apt-get -yqq update
RUN apt-get -yqq install apache2

VOLUME /var/www/html
WORKDIR /var/www/html

ENV APACHE_RUN_USER www-data 
ENV APACHE_RUN_GROUP www-data 
ENV APACHE_LOG_DIR /var/log/apache2 
ENV APACHE_PID_FILE /var/run/apache2.pid 
ENV APACHE_RUN_DIR /var/run/apache2 
ENV APACHE_LOCK_DIR /var/lock/apach2 

RUN  mkdir -p $APACHE_RUN_DIR $APACHE_LOCK_DIR $APACHE_LOG_DIR 
EXPOSE 80
ENTRYPOINT [ "/usr/sbin/apache2" ]
CMD ["-D", "FOREGROUND"]
```

该镜像基于Ubuntu , 并安装了Apache, 然后使用VOLUME指令创建一个卷/var/www/html 用来存放编译后的Jekyll网站, 然后将 /var/www/html 设为工作目录
然后使用ENV指令设置了一些必要的环境变量, 创建了必要目录,并使用EXPOSE公开了80端口,最后指定了ENTRYPOINT和CMD指令组合来在容器启动时默认运行Apache.


## 构建

```
docker build -t houbinbin/apache .
```

- 查看

```
docker images houbinbin/apache

REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
houbinbin/apache    latest              0a372d92e86e        28 seconds ago      221MB
```

## 运行 apache

```
$  sudo docker run -d -p 80:80 --volumes-from jekyll houbinbin/apache
```

-d 后台运行

-p 80:80 指定端口为 80

`--volumes-from jekyll` 把指定容器里的所有卷都加入新创建的容器里。

这意味着, apache 容器可以访问之前创建的 jekyll 容器里面 /var/www/html 卷中存放编译后的Jekyll网站。

即便 jekyll 容器没有运行，apache也可以访问这个卷。

如果 docker rm jekyll 容器，卷就不存在了。

## 查看镜像

```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                NAMES
4e336dbcdc16        houbinbin/apache    "/usr/sbin/apache2 -…"   9 seconds ago       Up 8 seconds        0.0.0.0:80->80/tcp   interesting_nightingale
```

## 登录

浏览器访问 [http://192.168.99.100](http://192.168.99.100)

![image](https://user-images.githubusercontent.com/18375710/71521059-0cce4080-28fa-11ea-9291-993c6fb4e526.png)


# 更新 jekyll 网站

## 修改 blog 内容

如果要更新网站的数据,可以直接修改 $HOME/james_blog/_config.yml 文件来修改博客名字.

```
vi $HOME/james_blog/_config.yml
```

修改其中的基本信息

```
title: houbinbin's Docker-Driven Blog
```

## 重启容器

重启 jekyll 容器即可。

```
docker restart jekyll
```

再次查看，title 已经被修改了。


# 备份

我们新建一个容器,用来备份/var/www/html卷

## 备份 /var/www/html 卷

```
$ sudo docker run --rm --volumes-from jekyll -v $(pwd):/backup ubuntu tar cvf /backup/jekyll_backup.tar /var/www/html
```

运行了一个已有的Ubuntu容器,并把 jekyll 的卷挂载到这个容器了里,在该容器里创建/var/www/html目录, 用-v标志 把当前目录($(pwd))挂载到容器的/backup目录, 最后运行备份命令.

其中指定--rm标志, 是针对只用一次的容器,用完即扔。

其中备份命令:

```
tar cvf /backup/hiekay_blog_backup.tar /var/www/html
```

# 拓展阅读

[Jekyll-构建 github pages 博客](https://houbb.github.io/2016/04/13/jekyll)

## 更多学习



# 参考资料

《第一本 Docker 书》

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