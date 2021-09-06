---
layout: post
title:  ledisdb 由 Go 提供支持的高性能 NoSQL 数据库服务器
date:  2018-09-10 10:28:57 +0800
categories: [Cache]
tags: [cache, middleware, docker, sh]
published: true
---

# Ledisdb

[Ledisdb](https://github.com/ledisdb/ledisdb) 是一个用 Go 编写的高性能 NoSQL 数据库库和服务器。 

它类似于Redis，但将数据存储在磁盘中。 它支持多种数据结构，包括 kv、list、hash、zset、set。

LedisDB 现在支持多个不同的数据库作为后端。

## 特征

- 丰富的数据结构：KV、List、Hash、ZSet、Set。

- 数据存储不受 RAM 限制。

- 支持多种后端：LevelDB、goleveldb、RocksDB、RAM。

- 支持 Lua 脚本。

- 支持过期和 TTL。

- 可以通过 redis-cli 进行管理。

- 易于嵌入到您自己的 Go 应用程序中。

- HTTP API 支持，JSON/BSON/msgpack 输出。

- 复制以保证数据安全。

- 提供加载、转储和修复数据库的工具。

- 支持集群，使用xcodis。

- 身份验证（虽然，不是通过 http）。

- 修复集成：如果从 v0.4 升级，您可以使用 ledis repair 修复损坏的数据库，使用 ledis repair-ttl 修复密钥过期和 TTL 的非常严重的错误。

# 从源代码构建

创建工作区并签出 ledisdb 源

```
git clone git@github.com:ledisdb/ledisdb.git
cd ledisdb

#set build and run environment 
source dev.sh

make
make test
```

然后你会在 `./bin` 目录中找到所有的二进制构建。

# 参考资料

https://github.com/ledisdb/ledisdb

* any list
{:toc}