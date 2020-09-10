---
layout: post
title: Redis-04-redis windows 10 install windows 安装笔记
date:  2016-10-23 09:35:04 +0800
categories: [SQL]
tags: [redis, cache, nosql]
published: true
---

# 安装

## 下载

[https://github.com/tporadowski/redis/releases](https://github.com/tporadowski/redis/releases) 点击下载。

此处我选择的是 Redis-x64-5.0.9.msi

## 安装

直接安装，个人的安装路径：

```
C:\Program Files\Redis
```

## 启动

```
cd C:\Program Files\Redis
redis-server.exe redis.windows.conf
```

- 日志

```
[2552] 10 Sep 13:18:02.830 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
[2552] 10 Sep 13:18:02.831 # Redis version=5.0.9, bits=64, commit=9414ab9b, modified=0, pid=2552, just started
[2552] 10 Sep 13:18:02.831 # Configuration loaded
[2552] 10 Sep 13:18:02.834 # Could not create server TCP listening socket 127.0.0.1:6379: bind: 操作成功完成。
```

感觉没启动成功

感觉应该是直接启动过了。

### 测试

```
redis-cli.exe
127.0.0.1:6379>
```

直接进入了 redis 的命令行

- 查看版本

直接退出命令行查看

```
λ redis-cli -v
redis-cli 5.0.9 (git:9414ab9b)
```

### 重新启动

命令行停止服务

```
redis-cli.exe

127.0.0.1:6379>shutdown

not connected>exit
```

- 重新启动

```
redis-server.exe redis.windows.conf

[24264] 10 Sep 13:25:45.959 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
[24264] 10 Sep 13:25:45.960 # Redis version=5.0.9, bits=64, commit=9414ab9b, modified=0, pid=24264, just started
[24264] 10 Sep 13:25:45.961 # Configuration loaded
                _._
           _.-``__ ''-._
      _.-``    `.  `_.  ''-._           Redis 5.0.9 (9414ab9b/0) 64 bit
  .-`` .-```.  ```\/    _.,_ ''-._
 (    '      ,       .-`  | `,    )     Running in standalone mode
 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6379
 |    `-._   `._    /     _.-'    |     PID: 24264
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

[24264] 10 Sep 13:25:45.970 # Server initialized
[24264] 10 Sep 13:25:45.971 * DB loaded from disk: 0.000 seconds
[24264] 10 Sep 13:25:45.971 * Ready to accept connections
```

# java 连接测试

## jedis 依赖

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>2.8.1</version>
</dependency>
```

## 测试代码

```java
Jedis jedis = new Jedis("127.0.0.1", 6379);
jedis.set("key", "001");
String value = jedis.get("key");

Assert.assertEquals("001", value);
```

## 效果

测试通过

我们登陆 redis-cli 查看一下效果

```
λ redis-cli.exe
127.0.0.1:6379> get key
"001"
```

ok，测试通过~

# 参考资料

[Redis 安装](https://www.runoob.com/redis/redis-install.html)

* any list
{:toc}