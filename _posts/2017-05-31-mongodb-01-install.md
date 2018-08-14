---
layout: post
title:  MongoDB-01-install 
date:  2017-05-31 10:41:22 +0800
categories: [SQL]
tags: [sql, nosql, mongodb]
published: true
---


# MongoDB

[MongoDB](https://www.mongodb.com/) is a document database with the scalability and flexibility that you want with the querying and indexing that you need.


> Features

- MongoDB stores data in flexible, JSON-like documents, meaning fields can vary from document to document and data structure can be changed over time

- The document model maps to the objects in your application code, making data easy to work with

- Ad hoc queries, indexing, and real time aggregation provide powerful ways to access and analyze your data

- MongoDB is a distributed database at its core, so high availability, horizontal scaling, and geographic distribution are built in and easy to use



> [Manual](https://docs.mongodb.com/manual/)

> [教程zh_CN](http://www.runoob.com/mongodb/mongodb-tutorial.html)


# 为什么使用NoSQL?

今天我们可以通过第三方平台（如：Google,Facebook等）可以很容易的访问和抓取数据。用户的个人信息，社交网络，地理位置，用户生成的数据和用户操作日志已经成倍的增加。
我们如果要对这些用户数据进行挖掘，那SQL数据库已经不适合这些应用了, NoSQL数据库的发展也却能很好的处理这些大的数据。

这句话深得我心。就是因为抓取百科信息，觉得全部入表太麻烦，如此才要尝试下 MangoDB。


> CAP定理（CAP theorem）

在计算机科学中, CAP定理（CAP theorem）, 又被称作 布鲁尔定理（Brewer's theorem）, 它指出对于一个分布式计算系统来说，不可能同时满足以下三点:

- 一致性(Consistency) (所有节点在同一时间具有相同的数据)

- 可用性(Availability) (保证每个请求不管成功或者失败都有响应)

- 分隔容忍(Partition tolerance) (系统中任意信息的丢失或失败不会影响系统的继续运作)


![cap](https://raw.githubusercontent.com/houbb/resource/master/img/sql/2017-05-31-cap-theoram-image.png)

# Install

本机为MAC。

[下载地址](https://www.mongodb.com/download-center#community)

- 命令行方式

```
$   curl -O https://fastdl.mongodb.org/osx/mongodb-osx-ssl-x86_64-3.4.4.tgz
```

将 mangodb 的二进制命令目录添加到path

```
$   export PATH=~/bin:$PATH
```

- brew 

```
$   brew mongodb
```

安装速度比较慢。

根据安装日志，安装的路径在：

```
/usr/local/Cellar/mongodb/3.4.4/
```

- 加入环境变量

编辑

```
vi  ~/.bash_profile
```

加入

```
# 添加mongodb安装目录到环境变量中
export PATH=/usr/local/Cellar/mongodb/3.4.4/bin:${PATH}
```

立刻生效

```
source ~/.bash_profile
```




# Run

[mac 下用 brew 安装mongodb](http://yijiebuyi.com/blog/b6a3f4a726b9c0454e28156dcc96c342.html)


- 修改配置

修改mongodb配置文件,配置文件默认在 /usr/local/etc 下的 mongod.conf

```
$ cat /usr/local/etc/mongod.conf 
systemLog:
  destination: file
  path: /usr/local/var/log/mongodb/mongo.log
  logAppend: true
storage:
  dbPath: /usr/local/var/mongodb
net:
  bindIp: 127.0.0.1
```


此处不做修改。保持默认。

- 首先我们创建一个数据库存储目录 /data/db：

```
sudo mkdir -p /data/db
```


- 运行

```
houbinbindeMacBook-Pro:bin houbinbin$ mongod
2017-06-01T22:34:19.719+0800 I CONTROL  [initandlisten] MongoDB starting : pid=6905 port=27017 dbpath=/data/db 64-bit host=houbinbindeMacBook-Pro.local
2017-06-01T22:34:19.720+0800 I CONTROL  [initandlisten] db version v3.4.4
2017-06-01T22:34:19.720+0800 I CONTROL  [initandlisten] git version: 888390515874a9debd1b6c5d36559ca86b44babd
2017-06-01T22:34:19.720+0800 I CONTROL  [initandlisten] OpenSSL version: OpenSSL 1.0.2k  26 Jan 2017
2017-06-01T22:34:19.720+0800 I CONTROL  [initandlisten] allocator: system
2017-06-01T22:34:19.720+0800 I CONTROL  [initandlisten] modules: none
2017-06-01T22:34:19.720+0800 I CONTROL  [initandlisten] build environment:
2017-06-01T22:34:19.720+0800 I CONTROL  [initandlisten]     distarch: x86_64
2017-06-01T22:34:19.720+0800 I CONTROL  [initandlisten]     target_arch: x86_64
2017-06-01T22:34:19.720+0800 I CONTROL  [initandlisten] options: {}
2017-06-01T22:34:19.721+0800 I STORAGE  [initandlisten] exception in initAndListen: 20 Attempted to create a lock file on a read-only directory: /data/db, terminating
2017-06-01T22:34:19.721+0800 I NETWORK  [initandlisten] shutdown: going to close listening sockets...
2017-06-01T22:34:19.721+0800 I NETWORK  [initandlisten] shutdown: going to flush diaglog...
2017-06-01T22:34:19.721+0800 I CONTROL  [initandlisten] now exiting
2017-06-01T22:34:19.721+0800 I CONTROL  [initandlisten] shutting down with code:100
```

如你所见，对于 /data/db 没有写入权限，导致程序终止。

给 /data/db 文件夹赋权限

```
chown `id -u` /data/db
```

重新运行，服务正常启动。

```
houbinbindeMacBook-Pro:bin houbinbin$ mongod
2017-06-01T22:38:10.149+0800 I CONTROL  [initandlisten] MongoDB starting : pid=6931 port=27017 dbpath=/data/db 64-bit host=houbinbindeMacBook-Pro.local
2017-06-01T22:38:10.149+0800 I CONTROL  [initandlisten] db version v3.4.4
2017-06-01T22:38:10.149+0800 I CONTROL  [initandlisten] git version: 888390515874a9debd1b6c5d36559ca86b44babd
2017-06-01T22:38:10.149+0800 I CONTROL  [initandlisten] OpenSSL version: OpenSSL 1.0.2k  26 Jan 2017
2017-06-01T22:38:10.149+0800 I CONTROL  [initandlisten] allocator: system
2017-06-01T22:38:10.149+0800 I CONTROL  [initandlisten] modules: none
2017-06-01T22:38:10.149+0800 I CONTROL  [initandlisten] build environment:
2017-06-01T22:38:10.149+0800 I CONTROL  [initandlisten]     distarch: x86_64
2017-06-01T22:38:10.149+0800 I CONTROL  [initandlisten]     target_arch: x86_64
2017-06-01T22:38:10.149+0800 I CONTROL  [initandlisten] options: {}
2017-06-01T22:38:10.150+0800 I STORAGE  [initandlisten] wiredtiger_open config: create,cache_size=7680M,session_max=20000,eviction=(threads_min=4,threads_max=4),config_base=false,statistics=(fast),log=(enabled=true,archive=true,path=journal,compressor=snappy),file_manager=(close_idle_time=100000),checkpoint=(wait=60,log_size=2GB),statistics_log=(wait=0),
2017-06-01T22:38:10.682+0800 I CONTROL  [initandlisten] 
2017-06-01T22:38:10.682+0800 I CONTROL  [initandlisten] ** WARNING: Access control is not enabled for the database.
2017-06-01T22:38:10.682+0800 I CONTROL  [initandlisten] **          Read and write access to data and configuration is unrestricted.
2017-06-01T22:38:10.682+0800 I CONTROL  [initandlisten] 
2017-06-01T22:38:10.682+0800 I CONTROL  [initandlisten] 
2017-06-01T22:38:10.682+0800 I CONTROL  [initandlisten] ** WARNING: soft rlimits too low. Number of files is 256, should be at least 1000
2017-06-01T22:38:10.866+0800 I FTDC     [initandlisten] Initializing full-time diagnostic data capture with directory '/data/db/diagnostic.data'
2017-06-01T22:38:11.015+0800 I INDEX    [initandlisten] build index on: admin.system.version properties: { v: 2, key: { version: 1 }, name: "incompatible_with_version_32", ns: "admin.system.version" }
2017-06-01T22:38:11.015+0800 I INDEX    [initandlisten] 	 building index using bulk method; build may temporarily use up to 500 megabytes of RAM
2017-06-01T22:38:11.026+0800 I INDEX    [initandlisten] build index done.  scanned 0 total records. 0 secs
2017-06-01T22:38:11.027+0800 I COMMAND  [initandlisten] setting featureCompatibilityVersion to 3.4
2017-06-01T22:38:11.027+0800 I NETWORK  [thread1] waiting for connections on port 27017
```

- 启动客户端

另外打开一个命令行。执行

```
houbinbindeMacBook-Pro:etc houbinbin$ pwd
/usr/local/etc
houbinbindeMacBook-Pro:etc houbinbin$ mongo
MongoDB shell version v3.4.4
connecting to: mongodb://127.0.0.1:27017
MongoDB server version: 3.4.4
Welcome to the MongoDB shell.
For interactive help, type "help".
For more comprehensive documentation, see
	http://docs.mongodb.org/
Questions? Try the support group
	http://groups.google.com/group/mongodb-user
Server has startup warnings: 
2017-06-01T22:38:10.682+0800 I CONTROL  [initandlisten] 
2017-06-01T22:38:10.682+0800 I CONTROL  [initandlisten] ** WARNING: Access control is not enabled for the database.
2017-06-01T22:38:10.682+0800 I CONTROL  [initandlisten] **          Read and write access to data and configuration is unrestricted.
2017-06-01T22:38:10.682+0800 I CONTROL  [initandlisten] 
2017-06-01T22:38:10.682+0800 I CONTROL  [initandlisten] 
2017-06-01T22:38:10.682+0800 I CONTROL  [initandlisten] ** WARNING: soft rlimits too low. Number of files is 256, should be at least 1000
> 
```


查询数据库，简单测试。


```
> show dbs
admin  0.000GB
local  0.000GB
```






