---
layout: post
title:  Docker Redis
date:  2018-05-06 20:11:55 +0800
categories: [Docker]
tags: [docker, redis]
published: true
---

# Redis

[Redis](https://redis.io/) is an open source (BSD licensed), in-memory data structure store, used as a database, cache and message broker. 

> [中文网站](http://www.redis.cn/)

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

## 运行 image

```
docker run --name my-redis -d redis
```

## 访问

> [Redis 连接](https://blog.csdn.net/chenyufeng1991/article/details/78513463)


```
docker run -it --link some-redis:redis --rm redis redis-cli -h redis -p 6379
```

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

# 一些问题

> [启动警告](https://blog.csdn.net/a491857321/article/details/52006376)

> [docker 官方的 redis 镜像如何指定配置文件](https://segmentfault.com/q/1010000008272753)

> [docker 安装部署 redis（配置文件启动）](https://segmentfault.com/a/1190000014091287)

* any list
{:toc}