---
layout: post
title:  MySQL Proxy
date:  2018-09-04 15:27:31 +0800
categories: [Database]
tags: [database, sql, read-write, sh]
published: true
excerpt: mysql proxy 读写分离中间件。
---

# MySQL Proxy

[MySQL Proxy](https://github.com/mysql/mysql-proxy) 是一个简单的程序，位于您的客户端和MySQL服务器之间，可以监控，分析或转换他们的通信。

它的灵活性允许多种用途，包括负载平衡、故障转移、查询分析、查询过滤和修改等。

## 缺点

1、通过 lua 脚本实现的读写分离，不太稳定，官网不建议用

```
MySQL Proxy is not GA, and is not recommended for Production use. 
```

2、还处于 alpha 版本

# 参考资料

- mysql-proxy

https://segmentfault.com/a/1190000003716617

http://blog.51cto.com/9124573/1785987

https://www.jianshu.com/p/cadf337274c1

http://blog.51cto.com/blxueyuan/1920154

* any list
{:toc}