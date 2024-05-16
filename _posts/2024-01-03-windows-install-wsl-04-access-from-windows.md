---
layout: post
title: windows wsl2 启动的 http 服务 windows 如何通过浏览器访问？  listen EADDRINUSE address already in use
date: 2024-01-05 21:01:55 +0800
categories: [Windows]
tags: [windows, os, linux, sh]
published: true
---

# windows WSL2 启动 http 服务

## nodejs

- app.js

```js
   const http = require('http'); // 引入 http 模块

   // 创建一个 HTTP 服务器
   const server = http.createServer((req, res) => {
     res.writeHead(200, {'Content-Type': 'text/plain'});
     res.end('Hello, World! FROM WSL!!!\n'); // 响应请求并发送一个字符串
   });

   // 服务器监听 3000 端口
   server.listen(3000, '0.0.0.0', () => {
     console.log('Server running at http://127.0.0.1:3000/');
   });
```

需要指定 0.0.0.0  表示监听任何地址。

## 启动

```
$ node app.js
Server running at http://127.0.0.1:3000/
```

## windows 浏览器访问

### 查看 wls2 地址

```
$ ip addr show eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether xxx brd ff:ff:ff:ff:ff:ff
    inet 172.24.20.97/20 brd 172.24.31.255 scope global eth0
    ....
```

172.24.20.97 就是分配的虚拟ip 


### 浏览器访问

直接 windows 下浏览器访问 

[http://172.24.20.97:3000/](http://172.24.20.97:3000/)

结果：

```
Hello, World! FROM WSL!!!
```


# 报错解决

```
$ node app.js
events.js:291
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
    at Server.setupListenHandle [as _listen2] (net.js:1310:16)
    at listenInCluster (net.js:1358:12)
    at doListen (net.js:1495:7)
    at processTicksAndRejections (internal/process/task_queues.js:85:21)
Emitted 'error' event on Server instance at:
    at emitErrorNT (net.js:1337:8)
    at processTicksAndRejections (internal/process/task_queues.js:84:21) {
  code: 'EADDRINUSE',
  errno: 'EADDRINUSE',
  syscall: 'listen',
  address: '0.0.0.0',
  port: 3000
}
```

## 原因：端口查看

```
$ netstat -tuln | grep 3000
tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN
```

这个命令 `netstat -tuln | grep 3000` 用于显示系统中所有正在监听（LISTEN）指定端口的TCP连接的信息，其中 `-tuln` 参数用于指定显示TCP连接信息，其中：

- `-t` 表示显示TCP连接。
- `-u` 表示显示UDP连接。
- `-l` 表示仅显示正在监听（LISTEN）的连接。
- `-n` 表示使用数字格式显示地址和端口号，而不是尝试解析成主机名和服务名。
- `grep 3000` 用于过滤出包含 "3000" 的行，以便只显示与3000端口相关的信息。

命令的输出解释如下：

- `tcp` 表示这是一个TCP连接。
- `0.0.0.0:3000` 表示该服务在所有可用的网络接口（0.0.0.0）上监听3000端口，这意味着该服务可以接受来自任何网络接口的连接请求。
- `LISTEN` 表示该服务正在监听来自客户端的连接请求，处于监听状态。
- 第二个 `0.0.0.0:*` 表示远程地址是任意IP（0.0.0.0），端口号是任意端口（*），这表示服务将接受来自任何IP地址和任何端口的连接。

因此，这个输出表明有一个TCP服务正在通过3000端口接受来自任何网络接口的连接请求。

## 查看端口被谁占用：

```sh
lsof -i :3000
```

这个命令 `lsof -i :3000` 用于显示当前正在运行的程序中，哪些程序（或进程）正在监听或连接到指定端口（这里是3000端口）。`lsof`（list open files）命令是用于查看已经被打开的文件列表，`-i :3000` 参数用于指定只显示与3000端口相关的信息。

输出结果解释如下：

- `COMMAND` 列显示了占用该端口的进程的名称（在这里是 `node`）。
- `PID` 列显示了该进程的进程ID（在这里是 `64293`）。
- `USER` 列显示了拥有该进程的用户（在这里是 `dh`）。
- `FD` 列显示了文件描述符（File Descriptor）的编号。在这里，`18u` 表示该进程的第18个文件描述符是一个网络套接字（Socket）。
- `TYPE` 列显示了文件的类型。在这里，`IPv4` 表示该套接字是一个IPv4类型的套接字。
- `DEVICE` 列显示了网络设备的信息（在这里不太相关）。
- `SIZE/OFF` 列显示了文件大小或偏移量的信息（在这里不太相关）。
- `NODE` 列显示了节点号（在这里不太相关）。
- `NAME` 列显示了网络套接字的名称或地址。在这里，`TCP *:3000` 表示该进程正在监听所有网络接口上的3000端口。

因此，这个输出表明一个名为 `node` 的进程正在通过3000端口监听来自任何网络接口的连接请求。

## kill

```
$ lsof -i :3000
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    64293   dh   18u  IPv4 932304      0t0  TCP *:3000 (LISTEN)
```

执行

```sh
kill -9 64293
```

# 参考资料

[如何在windows上安装WSL？以实现windows操作系统运行linux](https://blog.csdn.net/weixin_40551464/article/details/133577201)

https://blog.csdn.net/xjyou456/article/details/129654673

* any list
{:toc}