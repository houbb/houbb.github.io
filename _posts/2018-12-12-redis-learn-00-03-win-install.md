---
layout: post
title: Redis learn-04-redis windows10 安装笔记
date:  2018-12-12 10:11:55 +0800
categories: [Cache]
tags: [redis, cache, nosql]
published: true
---

# windows 安装实战

## 下载

直接 [github](https://github.com/MicrosoftArchive/redis/releases) 下载合适的版本。

比如 `Redis-x64-3.2.100.msi` 

## 安装

双击安装，比较简单。

可以选择将 add path 那个勾选上。

## 状态查询

```
C:\Users\Administrator>redis-cli -v
redis-cli 3.2.100
```

或者命令行输入

```
services.msc
```

查看 **Redis** 服务的状态，状态为**已启动**则说明正常。


## windows 可视化界面

[https://redisdesktop.com/](https://redisdesktop.com/) 直接下载安装即可。

# windows 10 安装

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

# 设置密码

## 1.临时性设置

找到你redis的安装目录。

运行redis-cli.exe。 如果提示“由于目标计算机积极拒绝，无法连接。”是由于你的redis服务没有正常运行导致的的

运行下面的指令

```
config set requirepass 123456
```

设置密码后，需要使用auth重新登录，我们继续输入

```
auth 123456
```

然后执行

```
config get requirepass
```

可以看到刚才的密码

但是这种做法有个弊端，就是一旦你关闭或者重启redis服务，那么设置的密码就不生效了。所以，你想设置长久密码推荐第二种。

## 2.永久设置密码

打开redis的文件夹。找到redis的配置文件：redis-windows.conf。然后打开它。搜索”requirepass”, 这行代码原来是被注释掉的，我们取消注释，并在后面给他设置密码。

设置完毕后，我们重启redis服务。

使用

```
auth redis123
```

```
config get requirepass
```

就可以看到刚才设置的密码了。



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

# 一点报错

## 报错

```
redis.clients.jedis.exceptions.JedisDataException: MISCONF Redis is configured to save RDB snapshots, but it is currently not able to persist on disk. Commands that may modify the data set are disabled, because this instance is configured to report errors during writes if RDB snapshotting fails (stop-writes-on-bgsave-error option). Please check the Redis logs for details about the RDB error.
```

看了一下后台日志

```
[24264] 10 Sep 13:50:40.737 # Background saving error
[24264] 10 Sep 13:50:46.073 * 1 changes in 900 seconds. Saving...
[24264] 10 Sep 13:50:46.393 * Background saving started by pid 13380
[13380] 10 Sep 13:50:46.751 # Failed opening the RDB file dump.rdb (in server root dir C:\Program Files\Redis) for saving: 数据无效。
[13380] 10 Sep 13:50:46.752 # rdbSave failed in qfork: Permission denied
[24264] 10 Sep 13:50:46.796 # fork operation complete
```

应该是权限不足导致的

### 解决方式

重新以管理员权限启动服务器。

重新发布，测试通过。



# 参考资料

[Redis 安装](https://www.runoob.com/redis/redis-install.html)

[Redis之MISCONF Redis is configured to save RDB snapshots错误](https://cloud.tencent.com/developer/article/1387728)

* any list
{:toc}