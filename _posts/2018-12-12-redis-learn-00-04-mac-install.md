---
layout: post
title: Redis learn-04-redis mac 系统安装笔记
date:  2018-12-12 10:11:55 +0800
categories: [Cache]
tags: [redis, cache, nosql]
published: true
---
# MAC 安装笔记

## 下载并且安装

```
$ wget http://download.redis.io/releases/redis-3.0.6.tar.gz
$ tar xzf redis-3.0.6.tar.gz
$ mv redis-3.0.6 redis
$ cd redis
$ make
$ make test
$ make install
```

## 编辑配置文件

打开 `redis.conf` 配置文件，找到 `dir ./` 这一行内容。

这一行是用来保存数据的，你可以调整为你想要的路径，比如说我的设置如下：

```
dir /Users/houbinbin/redis/redis_data

bind 127.0.0.1      //本地访问
requirepass 123456  //访问密码
```

## 启动 redis-server 服务端

```
$   src/redis-server redis.conf

$   src/redis-server redis.conf &   //后台-配置文件运行
```

然后命令行可以看到如下日志：

```
houbinbindeMacBook-Pro:redis-3.2.3 houbinbin$ 17137:M 23 Oct 09:46:21.924 * Increased maximum number of open files to 10032 (it was originally set to 256).
                _._
           _.-``__ ''-._
      _.-``    `.  `_.  ''-._           Redis 3.2.3 (00000000/0) 64 bit
  .-`` .-```.  ```\/    _.,_ ''-._
 (    '      ,       .-`  | `,    )     Running in standalone mode
 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6379
 |    `-._   `._    /     _.-'    |     PID: 17137
  `-._    `-._  `-./  _.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |           http://redis.io
  `-._    `-._`-.__.-'_.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |
  `-._    `-._`-.__.-'_.-'    _.-'
      `-._    `-.__.-'    _.-'
          `-._        _.-'
              `-.__.-'

17137:M 23 Oct 09:46:21.929 # Server started, Redis version 3.2.3
17137:M 23 Oct 09:46:21.930 * The server is now ready to accept connections on port 6379
```

## 测试连接性

```
$   redis-cli -a 123456 ping

PONG
```

### 可能出现的错误

```
redis-cli Could not connect to Redis at 127.0.0.1:6379: Connection refused
```

- 指定配置文件，重新启动

```
$   redis-server /Users/houbinbin/redis/redis-3.2.3/redis.conf
$   redis-cli
```

## 测试连接

使用 redis-cli 客户端连接 redis-server 服务端。

```
$   cd /Users/houbinbin/redis/redis-3.0.6
$   src/redis-cli -a 123456
```

命令测试：

```
127.0.0.1:6379> set houbinbin hi
OK
127.0.0.1:6379> get houbinbin
"hi"
```

## 关闭 redis-server 服务端

> [(error) NOAUTH Authentication required.](http://www.mamicode.com/info-detail-1610601.html)

无奈之下,杀进程。

```

```

常规关闭方式:

```
$   127.0.0.1:6379> shutdown
not connected>


$   redis-cli -a 123456 shutdown    //关闭后台
```

## 设置密码

> [set](http://blog.csdn.net/zyz511919766/article/details/42268219)

在 `redis.conf` 配置文件中找到 `#requirepass foobared`，修改为你想要的密码，比如 redis:

```
requirepass redis
```

## 卸载  redis

- 删除 ```/usr/local/bin``` 文件夹下的文件 `redis-*`

```
$   sudo rm -rf redis-*
```

* any list
{:toc}