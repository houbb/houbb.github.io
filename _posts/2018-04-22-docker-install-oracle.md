---
layout: post
title:  Docker Install Oracle
date:  2018-04-21 10:17:16 +0800
categories: [Docker]
tags: [docker, oracle, sql]
published: false
---

# Docker 安装 Oracle

最近工作中用到 oracle 数据库，又不想直接安装 oracle。就尝试下使用 docker 安装 oracle 的方式。

# MAC 安装

> [mac 下安装docker，在docker下安装oracle](https://blog.csdn.net/wangxinxinsj/article/details/77193491)


> [mac os下使用 Docker安装 oracle数据库](https://www.jianshu.com/p/14000d16915c)

## 安装 docker

直接下载[docker-toolbox](http://mirrors.aliyun.com/docker-toolbox/mac/docker-toolbox/?spm=a2c1q.8351553.0.0.dn1SYR)

双击安装即可。

安装完成会出现2个应用：

- Docker Terminal

docker 命令行界面

- Kitematic(Beta)

docker gui操作界面 属于内测版本 


## 使用命令行

直接打开 Docker Terminal。命令行内容如下：
 
```
                        ##         .
                  ## ## ##        ==
               ## ## ## ## ##    ===
           /"""""""""""""""""\___/ ===
      ~~~ {~~ ~~~~ ~~~ ~~~~ ~~~ ~ /  ===- ~~~
           \______ o           __/
             \    \         __/
              \____\_______/


Could not load host "default": Loading host from store failed: Host does not exist: "default"
docker is configured to use the default machine with IP 
For help getting started, check out the docs at https://docs.docker.com

Error trying to get host "default": Loading host from store failed: Host does not exist: "default"
```

这里我实际上是启动失败了。就去查询了下对应的问题：

[Rails, Docker: Host does not exist: “default”](https://stackoverflow.com/questions/34785064/rails-docker-host-does-not-exist-default)

[“Default” docker machine does not exist on Linux when Docker daemon is running](https://stackoverflow.com/questions/41307146/default-docker-machine-does-not-exist-on-linux-when-docker-daemon-is-running)

### 解决问题

- 环境验证

```
houbinbindeMacBook-Pro:~ houbinbin$ docker-machine ls
NAME   ACTIVE   DRIVER   STATE   URL   SWARM
houbinbindeMacBook-Pro:~ houbinbin$ docker-machine env default
Error trying to get host "default": Loading host from store failed: Host does not exist: "default"
```




...
...
To see how to connect Docker to this machine, run: docker-machine env default


$: docker-machine ls
NAME      ACTIVE   DRIVER       STATE     URL                         SWARM   DOCKER    ERRORS
default   -        virtualbox   Running   tcp://192.168.99.100:2376           v1.12.1


$: docker-machine env default
export DOCKER_TLS_VERIFY="1"
export DOCKER_HOST="tcp://192.168.99.100:2376"
export DOCKER_CERT_PATH="/Users/blahblah/.docker/machine/machines/default"
export DOCKER_MACHINE_NAME="default"
```




* any list
{:toc}









 





