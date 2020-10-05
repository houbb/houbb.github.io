---
layout: post
title: Redis 登录命令和 redis password 密码设置
date:  2018-12-12 10:11:55 +0800
categories: [Cache]
tags: [redis, cache, nosql]
published: true
---


# 场景

有时候需要登录到远程的 redis 机器上。

首先找到 redis-cli 所在的目录。

```
./redis-cli -h host -p port -a password
```

# 设置密码


redis 默认是不设置密码的，出于安全考虑，我们需要设置密码。

那么应该如何实现呢？

## 命令行设置密码

运行cmd切换到redis根目录，先启动服务端

```
>redis-server.exe
```

另开一个cmd切换到redis根目录，启动客户端

```
>redis-cli.exe -h 127.0.0.1 -p 6379
```

- 查看密码

客户端使用config get requirepass命令查看密码

```
127.0.0.1:6379> config get requirepass
1) "requirepass"
2) ""
```

默认情况下是空的

- 设置密码

客户端使用 config set requirepass yourpassword 命令设置密码

```
127.0.0.1:6379> config set requirepass 123456
OK
127.0.0.1:6379> config get requirepass
(error) NOAUTH Authentication required.
127.0.0.1:6379> auth 123456
OK
127.0.0.1:6379> config get requirepass
1) "requirepass"
2) "123456"
```

设置完之后，必须通过 auth 验证密码，通过后才可以进行其他操作。


- 移除密码设置

直接设置为空即可。

```
config set requirepass ''
```


命令行设置的密码在服务重启后失效，所以一般不使用这种方式。

## 配置文件设置密码

在redis根目录下找到redis.windows.conf配置文件，搜索requirepass，找到注释密码行，添加密码如下：

```
# requirepass foobared
requirepass 123456     //注意，行前不能有空格
```

重启服务后，客户端重新登录后发现

```
>config get requirepass
1)"requirepass"
2)""
```

密码还是空？

其实需要启动的时候，指定一下配置文件。

```
redis-server.exe redis.windows.conf
```

所以，这里我再一次重启redis服务(指定配置文件)，就可以了。

# 参考资料

[Redis设置密码](https://www.cnblogs.com/tenny-peng/p/11543440.html)

* any list
{:toc}