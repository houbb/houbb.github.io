---
layout: post
title: Redis Learn-35-Redis 报错汇总
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# 授权失败

## 常见方式

```
./redis-cli -h xxx.xxx.xxx.xxx -p 6379 -a password
```

有时候会发现授权失败

## 正确方式

可以尝试分解为两步：

- 登录 redis

```
./redis-cli -h xxx.xxx.xxx.xxx -p 6379
```

- 授权

```
auth password
```

# 集群查询失败

## 集群环境报错

```
hgetall 201907_xxx
(error) MOVED 10135 192.168.xxx.xxx:6379
```

## 解决方案

报这个错误的时候，一脸蒙圈。

后来发现登录到时候，指定为 -c 即可。

如下：

```
./redis-cli -c -h xxx.xxx.xxx.xxx -p 6379
```

# 参考资料

* any list
{:toc}