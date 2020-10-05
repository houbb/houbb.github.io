---
layout: post
title:  Docker 安装 Redis 实战笔记
date:  2018-12-12 10:11:55 +0800
categories: [Cache]
tags: [docker, redis, install, cache, in-action]
published: true
---

# Docker Redis

[Docker Redis Doc](https://hub.docker.com/r/library/redis/)

## 下载 redis

- 下载命令 

```
docker pull redis
```

- 查看命令

```
$ docker images | grep redis
redis                            latest              c5355f8853e4        5 weeks ago         107MB
```

## 指定下载的版本

默认是下载最新的版本。

有时候你可能希望指定下载的版本。

- 查看版本

访问 [https://hub.docker.com/_/redis?tab=tags](https://hub.docker.com/_/redis?tab=tags)

- 指定版本

```
$   docker pull redis:4.0
```

## 运行 image

```
docker run --name my-redis -d redis
```

- 查看 

```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                      NAMES
c86ec24c49dd        redis               "docker-entrypoint.s…"   7 minutes ago       Up 7 minutes        6379/tcp                   my-redis
```


## 访问

> [Redis 连接](https://blog.csdn.net/chenyufeng1991/article/details/78513463)

另开一个 container 进入

```
docker exec -it c86ec24c49dd redis-cli
```

`c86ec24c49dd` 就是 redis 运行的 container id。

可以直接进入命令行

```
redis:6379> set name hello
OK
redis:6379> get name
"hello"
redis:6379> 
```

- 查看信息

```
redis:6379> info
```

# docker 端口暴露

> [docker 端口暴露](https://blog.csdn.net/wanglei_storage/article/details/48471753)

```
docker run -p 6379:6379 --name out-redis -d redis
```

将容器的 6379 暴露到 外部 6379。

## 查看

```
$ docker ps

CONTAINER ID        IMAGE               COMMAND                  CREATED                  STATUS              PORTS                    NAMES
23fc6d14c62b        redis               "docker-entrypoint.s…"   Less than a second ago   Up 2 seconds        0.0.0.0:6379->6379/tcp   out-redis
b430f08c9bcd        redis               "docker-entrypoint.s…"   4 hours ago              Up 4 hours          6379/tcp                 some-redis
```



**out-redis** 就是对于外部可见的。

**some-redis** 对于外部不可见。

- 查看端口信息

```
docker port ${container_id}
```

例子：

```
$ docker port 23fc6d14c62b

6379/tcp -> 0.0.0.0:6379
```

# 指定 conf

- 下载地址

[redis.conf](https://raw.githubusercontent.com/antirez/redis/4.0.9/redis.conf)

> [mac docker redis](https://blog.csdn.net/QingKong999/article/details/68063206)

此处给出修改后的配置 [redis.conf]({{ site.url }}/static/app/res/redis/redis.conf)

### 指定

- 创建文件夹

```
mkdir mkdir ~/docker/redis
```

可以将 `redis.conf` 放在此路径下面

本测试环境为：

```
/Users/houbinbin/docker/redis/redis.conf
```


- 运行命令

```
docker run -d -p 6379:6379 --name redis -v  ~/docker/redis:/var/lib/redis redis redis-server /var/lib/redis/redis.conf
```

- log

```
2cc8ed33d174cec19bfe5cf098d94c2ecfa3eaa198d7bb0de520fff847f9766b
```


# 运行已经存在的 Redis 镜像


## 查看镜像

```
docker images | grep redis
```

如下：

```
redis                            latest              5958914cc558        4 months ago        136MB
```

说明镜像已经存在。

## 运行镜像

```
docker run --name my-redis -d redis
```

日志如下

```
docker: Error response from daemon: Conflict. The container name "/my-redis" is already in use by container "c86ec24c49dd6e35fd9689d641f543bafcf0c6a91f43f2fbe16fab2ab834989f". You have to remove (or rename) that container to be able to reuse that name.
See 'docker run --help'.
```

说明 container 已经存在。

## 运行 container 

```
docker container start my-redis
my-redis
```

正常启动。

## 访问 Redis 

- 查看 container.ID

```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS
   NAMES
c86ec24c49dd        redis               "docker-entrypoint.s…"   3 months ago        Up 4 minutes        6379/tcp
    my-redis
```

- 进入 container 

```
docker exec -it c86ec24c49dd redis-cli
```

直接进入，测试即可。


# 一些问题

> [启动警告](https://blog.csdn.net/a491857321/article/details/52006376)

> [docker 官方的 redis 镜像如何指定配置文件](https://segmentfault.com/q/1010000008272753)

> [docker 安装部署 redis（配置文件启动）](https://segmentfault.com/a/1190000014091287)

* any list
{:toc}