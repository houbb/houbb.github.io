---
layout: post
title: Redis Learn-36-Redis 内存占用大小查看
date: 2018-12-12 11:35:23 +0800
categories: [Redis]
tags: [redis, cache, sh]
published: true
---

# 登陆命令

## 登录

登录到 linux 机器，使用 `redis-cli` 登录

```
./redis-cli -h 127.0.0.1 -p 8848
```

这样登录

## 验证

```
auth    XXXX
```

输入密码验证

# 查看内存

```
$   info
```

查看对应的地方：

```
# Memory

used_memory:13490096 //数据占用了多少内存（字节）

used_memory_human:12.87M //数据占用了多少内存（带单位的，可读性好）

used_memory_rss:13490096  //redis占用了多少内存

used_memory_peak:15301192 //占用内存的峰值（字节）

used_memory_peak_human:14.59M //占用内存的峰值（带单位的，可读性好）

used_memory_lua:31744  //lua引擎所占用的内存大小（字节）

mem_fragmentation_ratio:1.00  //内存碎片率

mem_allocator:libc //redis内存分配器版本，在编译时指定的。有libc、jemalloc、tcmalloc这3种。
```

# 参考资料

[查看redis占用内存大小的方法](https://www.jianshu.com/p/9358abbc8258)

* any list
{:toc}